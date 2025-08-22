"use server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { currentUser } from "@clerk/nextjs/server";
import { db, handleDatabaseError, DatabaseError } from "@/utils/db";
import { interviews, userAnswers, type Interview } from "@/utils/schema";
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
    
    // More careful cleaning that preserves JSON structure
    let cleanedText = text.trim();
    
    // Remove markdown code block wrappers
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\s*/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\s*/, '');
    }
    
    if (cleanedText.endsWith('```')) {
      cleanedText = cleanedText.replace(/\s*```$/, '');
    }
    
    // Remove any remaining backticks that might be inside the JSON (but be careful not to break the structure)
    // Only remove backticks that are not part of valid JSON
    cleanedText = cleanedText.trim();
    
    // Validate if the cleaned text is valid JSON
    try {
      const parsed = JSON.parse(cleanedText);
      jsonResponse = cleanedText;
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      console.error("Raw AI response:", text);
      console.error("Cleaned text:", cleanedText);
      
      // Fallback: try to extract JSON from the text using a more aggressive approach
      const jsonMatch = text.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsedFallback = JSON.parse(jsonMatch[0]);
          jsonResponse = jsonMatch[0];
          console.log("Successfully extracted JSON using fallback method");
        } catch (fallbackError) {
          console.error("Fallback JSON extraction also failed:", fallbackError);
          throw new Error("Failed to generate valid JSON questions from AI response");
        }
      } else {
        throw new Error("No valid JSON found in AI response");
      }
    }
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
      createdAt: new Date().toISOString(), // Explicitly provide timestamp
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
        // Check if interview exists and user has permission
        const interview = await db.select()
            .from(interviews)
            .where(and(
                eq(interviews.mockId, mockId),
                eq(interviews.createdBy, user.primaryEmailAddress!.emailAddress)
            ))
            .limit(1);

        if (interview.length === 0) {
            throw new Error("Interview not found or you do not have permission to delete it.");
        }

        // Delete related user answers first
        await db.delete(userAnswers).where(eq(userAnswers.mockId, mockId));

        // Delete the interview
        await db.delete(interviews).where(eq(interviews.mockId, mockId));

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Failed to delete interview:", error);
        if (error instanceof Error) {
            return { error: error.message };
        }
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
        const text = response.text();
        
        // Use the same improved cleaning logic as generateInterview
        let cleanedText = text.trim();
        
        // Remove markdown code block wrappers
        if (cleanedText.startsWith('```json')) {
          cleanedText = cleanedText.replace(/^```json\s*/, '');
        } else if (cleanedText.startsWith('```')) {
          cleanedText = cleanedText.replace(/^```\s*/, '');
        }
        
        if (cleanedText.endsWith('```')) {
          cleanedText = cleanedText.replace(/\s*```$/, '');
        }
        
        // Remove any remaining backticks that might be inside the JSON (but be careful not to break the structure)
        // Only remove backticks that are not part of valid JSON
        cleanedText = cleanedText.trim();
        
        // Validate if the cleaned text is valid JSON
        try {
          const parsed = JSON.parse(cleanedText);
          jsonResponse = cleanedText;
        } catch (parseError) {
          console.error("Failed to parse AI response as JSON in retake:", parseError);
          console.error("Raw AI response:", text);
          console.error("Cleaned text:", cleanedText);
          
          // Fallback: try to extract JSON from the text using a more aggressive approach
          const jsonMatch = text.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              const parsedFallback = JSON.parse(jsonMatch[0]);
              jsonResponse = jsonMatch[0];
              console.log("Successfully extracted JSON using fallback method in retake");
            } catch (fallbackError) {
              console.error("Fallback JSON extraction also failed in retake:", fallbackError);
              throw new Error("Failed to generate valid JSON questions from AI response for retake");
            }
          } else {
            throw new Error("No valid JSON found in AI response for retake");
          }
        }
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
            createdAt: new Date().toISOString(), // Explicitly provide timestamp
        });
    } catch (error) {
        console.error("Database insertion failed for retake:", error);
        return { error: "Failed to save the new interview." };
    }

    return { success: true, newMockId };
}
