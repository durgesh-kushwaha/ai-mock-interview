import React from "react";
import { db } from "@/utils/db";
import { interviews } from "@/utils/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import DashboardClient from "./components/DashboardClient";

async function DashboardPage() {
  const user = await currentUser();
  
  // We still fetch the data here on the server
  // If the user is null, the list will be empty, which is fine
  const interviewList = user ? await db.select()
    .from(interviews)
    .where(eq(interviews.createdBy, user.primaryEmailAddress!.emailAddress))
    .orderBy(interviews.id) : [];

  return (
    // We pass the server-fetched data to the Client Component
    <DashboardClient interviewList={interviewList} />
  );
};

export default DashboardPage;