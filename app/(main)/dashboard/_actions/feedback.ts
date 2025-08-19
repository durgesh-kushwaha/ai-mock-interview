"use server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/utils/db";
import { userAnswers } from "@/utils/schema";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

interface Answer {
  question: string;
  userAns: string;
}

export async function submitFeedback(
  answers: Answer[],
  interviewId: string
) {
  const user = await currentUser();
  if (!user) {
    return { error: "User not authenticated" };
  }

  for (const item of answers) {
    const prompt = `
      Question: ${item.question}
      User Answer: ${item.userAns}

      Provide feedback and a rating for the user's answer in JSON format. The JSON object should have two keys: "feedback" and "rating".
      - "feedback": Provide constructive feedback on the answer.
      - "rating": Give a rating on a scale of 1 to 5.
      
      Do not include any other text or markdown formatting outside of the JSON object.
    `;
    
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const cleanedText = text.replace(/```json|```/g, "").trim();
      const feedbackJson = JSON.parse(cleanedText);

      await db.insert(userAnswers).values({
        mockIdRef: interviewId,
        question: item.question,
        userAns: item.userAns,
        feedback: feedbackJson.feedback,
        rating: feedbackJson.rating,
        userEmail: user.primaryEmailAddress!.emailAddress,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to process feedback for a question:", error);
    }
  }

  return { success: true };
}