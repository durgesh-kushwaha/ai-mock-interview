import React from "react";
import { db } from "@/utils/db";
import { interviews } from "@/utils/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import DashboardClient from "./components/DashboardClient";

async function DashboardPage() {
  const user = await currentUser();
  
  const interviewList = user ? await db.select()
    .from(interviews)
    .where(eq(interviews.createdBy, user.primaryEmailAddress!.emailAddress))
    .orderBy(interviews.id) : [];

  return (
    <DashboardClient interviewList={interviewList} />
  );
};

export default DashboardPage;