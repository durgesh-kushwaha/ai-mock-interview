import { db } from '@/utils/db';
import { interviews } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import React from 'react';
import InterviewScreen from './_components/InterviewScreen'; // Correct path starting with ./

export const dynamic = 'force-dynamic';

interface InterviewPageProps {
  params: {
    interviewId: string;
  };
}

async function InterviewPage({ params }: InterviewPageProps) {
  const result = await db
    .select()
    .from(interviews)
    .where(eq(interviews.mockId, params.interviewId));

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