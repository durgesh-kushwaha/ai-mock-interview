import React from "react";
import { db } from "@/utils/db";
import { interviews, type Interview } from "@/utils/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import DashboardClient from "./components/DashboardClient";

async function DashboardPage() {
  const user = await currentUser();
  
  let interviewList: Interview[] = [];
  
  if (user) {
    try {
      // Try to select all columns first
      interviewList = await db.select()
        .from(interviews)
        .where(eq(interviews.createdBy, user.primaryEmailAddress!.emailAddress))
        .orderBy(interviews.id);
    } catch (error) {
      console.error("Database query error:", error);
      
      // Fallback: try selecting only the columns that definitely exist
      try {
        const fallbackResults = await db.select({
          id: interviews.id,
          jsonMockResp: interviews.jsonMockResp,
          jobPosition: interviews.jobPosition,
          jobDesc: interviews.jobDesc,
          jobExperience: interviews.jobExperience,
          createdBy: interviews.createdBy,
          createdAt: interviews.createdAt,
          mockId: interviews.mockId
        })
        .from(interviews)
        .where(eq(interviews.createdBy, user.primaryEmailAddress!.emailAddress))
        .orderBy(interviews.id);
        
        // Add default isActive value for compatibility
        interviewList = fallbackResults.map(interview => ({
          ...interview,
          isActive: true
        })) as Interview[];
      } catch (fallbackError) {
        console.error("Fallback query also failed:", fallbackError);
        interviewList = [];
      }
    }
  }

  return (
    <DashboardClient interviewList={interviewList} />
  );
};

export default DashboardPage;
