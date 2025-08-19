"use client";

import React from 'react';
import { SignedIn, SignedOut } from '@clerk/nextjs'; // Corrected import path
import AddNewInterview from "./AddNewInterview";
import InterviewCard from "./InterviewCard";
import { interviews } from '@/utils/schema';
import { BrainCircuit, PenSquare, Rocket } from 'lucide-react';

// Define the type for the interview list prop
type Interview = typeof interviews.$inferSelect;

function DashboardClient({ interviewList }: { interviewList: Interview[] }) {
  return (
    <>
      <SignedOut>
        <div className='p-10'>
          <p>Please sign in to view your dashboard.</p>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="p-10 flex flex-col min-h-[calc(100vh-160px)]">
          <div className="flex-grow">
            <h2 className="font-bold text-3xl">Dashboard</h2>
            <h2 className="text-gray-500">
              Create and Start your AI Mock Interview
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
              <AddNewInterview />
              {interviewList.map((interview) => (
                <InterviewCard key={interview.id} interview={interview} />
              ))}
            </div>
          </div>
          
          <div className="mt-16 p-8 bg-gray-900 bg-opacity-50 rounded-lg border border-gray-700">
            <h3 className="text-2xl font-bold text-white text-center mb-6">How Our AI Interviewer Helps You Succeed</h3>
            <div className="grid md:grid-cols-3 gap-8 text-white">
              <div className="text-center">
                <PenSquare className="h-12 w-12 mx-auto text-blue-400 mb-2" />
                <h4 className="font-bold text-lg">Define Your Goal</h4>
                <p className="text-sm text-gray-300">Start by providing the job description and your experience level. Our AI tailors the interview to your specific needs.</p>
              </div>
              <div className="text-center">
                <BrainCircuit className="h-12 w-12 mx-auto text-blue-400 mb-2" />
                <h4 className="font-bold text-lg">Practice in Real-time</h4>
                <p className="text-sm text-gray-300">Answer questions using your microphone. Our advanced speech-to-text technology captures your responses accurately.</p>
              </div>
              <div className="text-center">
                <Rocket className="h-12 w-12 mx-auto text-blue-400 mb-2" />
                <h4 className="font-bold text-lg">Get Instant Feedback</h4>
                <p className="text-sm text-gray-300">Receive an instant report with ratings and constructive feedback on each answer, helping you improve immediately.</p>
              </div>
            </div>
          </div>
        </div>
      </SignedIn>
    </>
  );
}

export default DashboardClient;