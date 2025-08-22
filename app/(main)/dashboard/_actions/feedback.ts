"use server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/utils/db";
import { userAnswers } from "@/utils/schema";
import { AnswerRecord } from "@/types/interview";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function submitFeedback(
  answers: AnswerRecord[],
  interviewId: string
) {
  const user = await currentUser();
  if (!user) {
    return { error: "User not authenticated" };
  }

  for (const item of answers) {
    let prompt = '';
    
    if (item.type === 'code' && item.originalCode && item.modifiedCode) {
      prompt = `
        Question: ${item.question}
        Original Code: ${item.originalCode}
        User's Modified Code: ${item.modifiedCode}

        Analyze the code modifications and provide feedback in JSON format with these keys:
        - "feedback": Detailed analysis of the code changes, including what was done well and what could be improved
        - "rating": Rating on a scale of 1 to 10 based on code quality, correctness, and improvements
        - "improvements": Specific suggestions for code improvements
        - "bugsFound": Any bugs or issues identified in the modified code
        
        Focus on code quality, efficiency, correctness, and adherence to best practices.
        Provide specific, actionable feedback.
      `;
    } else {
      prompt = `
        Question: ${item.question}
        User Answer: ${item.userAns}

        Provide feedback and a rating for the user's answer in JSON format. The JSON object should have these keys:
        - "feedback": Provide constructive feedback on the answer, focusing on clarity, completeness, and relevance
        - "rating": Give a rating on a scale of 1 to 10
        - "improvements": Suggestions for how to improve the answer
        
        Do not include any other text or markdown formatting outside of the JSON object.
      `;
    }
    
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const cleanedText = text.replace(/```json|```/g, "").trim();
      const feedbackJson = JSON.parse(cleanedText);

      await db.insert(userAnswers).values({
        mockId: interviewId,
        question: item.question,
        userAns: item.userAns,
        feedback: feedbackJson.feedback,
        rating: feedbackJson.rating ? parseInt(feedbackJson.rating) : null,
        userEmail: user.primaryEmailAddress!.emailAddress,
        createdAt: new Date().toISOString(), // Explicitly provide timestamp
        answerType: item.isVoiceAnswer ? 'voice' : (item.type === 'code' ? 'code' : 'text'),
        originalCode: item.originalCode,
        modifiedCode: item.modifiedCode,
        codeLanguage: item.codeLanguage,
      });
    } catch (error) {
      console.error("Failed to process feedback for a question:", error);
    }
  }

  return { success: true };
}
