"use server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/utils/db";
import { interviews, userAnswers } from "@/utils/schema";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateInterview(formData: FormData) {
  const jobPosition = formData.get("jobPosition") as string;
  const jobDesc = formData.get("jobDesc") as string;
  const jobExperience = formData.get("jobExperience") as string;

  const user = await currentUser();
  if (!user) {
    return { error: "User not authenticated" };
  }

  const prompt = `
    Job Position: ${jobPosition}
    Job Description: ${jobDesc}
    Years of Experience: ${jobExperience}

    Based on the information above, please generate 5 interview questions and answers in JSON format. 
    Each question and answer should be in a separate object within a JSON array. 
    The JSON should be an array of objects, where each object has a "question" key and an "answer" key.
    Do not include any other text or markdown formatting outside of the JSON array.
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