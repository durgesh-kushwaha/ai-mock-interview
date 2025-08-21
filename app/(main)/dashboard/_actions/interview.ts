"use server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/utils/db";
import { interviews, userAnswers } from "@/utils/schema";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { InterviewLevel, generateRandomQuestionCount, predictInterviewLevel } from "@/types/interview";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateInterview(formData: FormData) {
  const jobPosition = formData.get("jobPosition") as string;
  const jobDesc = formData.get("jobDesc") as string;
  const jobExperience = formData.get("jobExperience") as string;
  const userSelectedLevel = formData.get("interviewLevel") as InterviewLevel | 'auto' | null;

  const user = await currentUser();
  if (!user) {
    return { error: "User not authenticated" };
  }

  const interviewLevel = userSelectedLevel && userSelectedLevel !== 'auto' 
    ? userSelectedLevel as InterviewLevel
    : predictInterviewLevel(jobPosition, jobDesc, jobExperience);

  const questionCount = generateRandomQuestionCount(interviewLevel);

  const prompt = `
    Job Position: ${jobPosition}
    Job Description: ${jobDesc}
    Years of Experience: ${jobExperience}

    Based on the information above, please generate ${questionCount} interview questions in JSON format.
    
    The questions should be a mix of:
    1. Text-based questions (conceptual, behavioral, technical knowledge)
    2. Code-based questions (programming problems, code review, debugging)

    For text questions, use this format:
    {
      "type": "text",
      "question": "Question text here",
      "answer": "Expected answer here"
    }

    For code questions, use this format:
    {
      "type": "code",
      "question": "Programming problem description",
      "codeSnippet": "Initial code snippet that is either incomplete, contains bugs, or needs optimization",
      "language": "javascript/typescript/python/java/etc",
      "instructions": "What the candidate should do with the code (e.g., fix bugs, complete the function, optimize)",
      "expectedOutput": "Optional: expected output or behavior"
    }

    For code questions, ensure the code snippet has at least one of these characteristics:
    - Contains logical bugs or syntax errors
    - Is incomplete and needs to be finished
    - Has performance issues that need optimization
    - Lacks proper error handling
    - Needs refactoring for better code quality

    Include approximately 30% code questions for technical roles, fewer for non-technical roles.

    Return a JSON array of these question objects. Do not include any other text or markdown formatting outside of the JSON array.
  `;

  let jsonResponse;
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```json|```/g, "").trim();
    jsonResponse = cleanedText;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    return { error: "Failed to generate interview questions." };
  }

  const mockId = crypto.randomUUID();

  try {
    await db.insert(interviews).values({
      mockId,
      jsonMockResp: jsonResponse,
      jobPosition,
      jobDesc,
      jobExperience,
      createdBy: user.primaryEmailAddress!.emailAddress,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Database insertion failed:", error);
    return { error: "Failed to save the interview to the database." };
  }

  redirect(`/dashboard/interview/${mockId}`);
}

export async function deleteInterview(mockId: string) {
    const user = await currentUser();
    if (!user) {
        return { error: "User not authenticated" };
    }

    try {
        const interview = await db.select().from(interviews)
            .where(and(
                eq(interviews.mockId, mockId),
                eq(interviews.createdBy, user.primaryEmailAddress!.emailAddress)
            ));

        if (interview.length === 0) {
            return { error: "Interview not found or you do not have permission to delete it." };
        }

        await db.delete(userAnswers).where(eq(userAnswers.mockIdRef, mockId));

        await db.delete(interviews).where(eq(interviews.mockId, mockId));

        revalidatePath('/dashboard');

        return { success: true };
    } catch (error) {
        console.error("Failed to delete interview:", error);
        return { error: "Database error: Could not delete the interview." };
    }
}

export async function retakeInterview(mockId: string) {
    const user = await currentUser();
    if (!user) {
        return { error: "User not authenticated" };
    }

    const originalInterview = await db.select()
        .from(interviews)
        .where(eq(interviews.mockId, mockId));

    if (!originalInterview.length) {
        return { error: "Original interview not found." };
    }

    const { jobPosition, jobDesc, jobExperience } = originalInterview[0];
    
    const questionCount = generateRandomQuestionCount('intermediate');

    const prompt = `
        Job Position: ${jobPosition}
        Job Description: ${jobDesc}
        Years of Experience: ${jobExperience}

        Based on the information above, please generate ${questionCount} fresh interview questions in JSON format.
        
        The questions should be a mix of:
        1. Text-based questions (conceptual, behavioral, technical knowledge)
        2. Code-based questions (programming problems, code review, debugging)

        For text questions, use this format:
        {
          "type": "text",
          "question": "Question text here",
          "answer": "Expected answer here"
        }

        For code questions, use this format:
        {
          "type": "code",
          "question": "Programming problem description",
          "codeSnippet": "Initial code snippet (can be incomplete or with bugs)",
          "language": "javascript/typescript/python/java/etc",
          "instructions": "What the candidate should do with the code",
          "expectedOutput": "Optional: expected output or behavior"
        }

        Include approximately 30% code questions for technical roles, fewer for non-technical roles.

        Return a JSON array of these question objects. Do not include any other text or markdown formatting outside of the JSON array.
    `;

    let jsonResponse;
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        jsonResponse = response.text().replace(/```json|```/g, "").trim();
    } catch (error) {
        console.error("Gemini API call failed for retake:", error);
        return { error: "Failed to generate new interview questions." };
    }

    const newMockId = crypto.randomUUID();
    try {
        await db.insert(interviews).values({
            mockId: newMockId,
            jsonMockResp: jsonResponse,
            jobPosition,
            jobDesc,
            jobExperience,
            createdBy: user.primaryEmailAddress!.emailAddress,
            createdAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Database insertion failed for retake:", error);
        return { error: "Failed to save the new interview." };
    }

    return { success: true, newMockId };
}
