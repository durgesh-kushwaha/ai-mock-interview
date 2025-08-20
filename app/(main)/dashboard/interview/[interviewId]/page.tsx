import { db } from '@/utils/db';
import { interviews } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import React from 'react';
import InterviewScreen from './_components/InterviewScreen'; // Correct path starting with ./

export const dynamic = 'force-dynamic';

interface InterviewPageProps {
  params: Promise<{
    interviewId: string;
  }>;
}

async function InterviewPage({ params }: InterviewPageProps) {
  const { interviewId } = await params;
  const result = await db
    .select()
    .from(interviews)
    .where(eq(interviews.mockId, interviewId));

  if (!result || result.length === 0) {
    return notFound();
  }
  
  const interviewData = result[0];

  return (
    <div>
        <InterviewScreen interviewData={interviewData} />
    </div>
  );
}

export default InterviewPage;