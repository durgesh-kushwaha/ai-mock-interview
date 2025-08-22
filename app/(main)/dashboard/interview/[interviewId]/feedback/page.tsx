import { db } from '@/utils/db';
import { userAnswers, interviews } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import React from 'react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Placeholder for a CodeEditor component. 
// If you have a real one, you can remove this.
const CodeEditor = ({ value }: { value: string }) => (
    <pre className='bg-gray-800 text-white p-4 rounded-md overflow-x-auto text-sm'>
        <code>{value}</code>
    </pre>
);

interface FeedbackPageProps {
    params: Promise<{
        interviewId: string;
    }>;
}

// Type for the AI's generated response (which can include code)
type ModelAnswer = {
    type: 'text' | 'code';
    question: string;
    answer: string;
    codeSnippet?: string;
    language?: string;
    instructions?: string;
};

async function FeedbackPage({ params }: FeedbackPageProps) {
  
    const { interviewId } = await params;

    try {
        console.log('🔍 Fetching feedback for interview:', interviewId);
        
        const [interviewResult, feedbackResult] = await Promise.all([
            db.select().from(interviews).where(eq(interviews.mockId, interviewId)),
            db.select().from(userAnswers).where(eq(userAnswers.mockId, interviewId)).orderBy(userAnswers.id)
        ]);

        console.log('📊 Interview result:', interviewResult.length, 'Feedback result:', feedbackResult.length);

        if (!interviewResult[0]) {
            console.log('❌ No interview found for:', interviewId);
            return notFound();
        }

        if (feedbackResult.length === 0) {
            console.log('⚠️ No feedback data found for interview:', interviewId);
            // Return a page indicating that the interview hasn't been completed yet
            return (
                <div className='p-10'>
                    <div className='flex justify-between items-center'>
                        <h2 className='text-3xl font-bold text-orange-500'>Interview Not Completed</h2>
                        <Link href="/dashboard">
                            <Button><ArrowLeft className='mr-2' /> Go Back</Button>
                        </Link>
                    </div>
                    
                    <div className='mt-8 text-center'>
                        <div className='p-8 bg-yellow-50 border border-yellow-200 rounded-lg'>
                            <h3 className='text-xl font-semibold text-yellow-800 mb-4'>
                                This interview hasn&apos;t been completed yet
                            </h3>
                            <p className='text-yellow-700 mb-6'>
                                You need to complete the interview questions and submit your answers to view the feedback.
                            </p>
                            <Link href={`/dashboard/interview/${interviewId}`}>
                                <Button className='bg-yellow-600 hover:bg-yellow-700'>
                                    Continue Interview
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            );
        }

        const interviewData = interviewResult[0];
        
        let modelAnswers: ModelAnswer[] = [];
        try {
            modelAnswers = JSON.parse(interviewData.jsonMockResp);
            if (!Array.isArray(modelAnswers)) { modelAnswers = []; }
        } catch (error) {
            console.error("Failed to parse model answers JSON:", error);
            modelAnswers = [];
        }

        // Updated rating logic to handle numbers directly from the DB
        const totalRating = feedbackResult.reduce((acc, item) => {
            const rating = item.rating ? parseInt(item.rating) : 0;
            return acc + (isNaN(rating) ? 0 : rating);
        }, 0);
        const avgRating = (totalRating / feedbackResult.length).toFixed(1);

        return (
            <div className='p-10'>
                <div className='flex justify-between items-center'>
                    <h2 className='text-3xl font-bold text-green-500'>Your Feedback Report</h2>
                    <Link href="/dashboard">
                        <Button><ArrowLeft className='mr-2' /> Go Back</Button>
                    </Link>
                </div>
                
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 my-6'>
                    <Card>
                        <CardHeader>
                            <CardTitle>Job Details</CardTitle>
                            <CardDescription>An overview of the mock interview.</CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-2'>
                            <p><strong>Job Role:</strong> {interviewData.jobPosition}</p>
                            <p><strong>Job Description:</strong> {interviewData.jobDesc}</p>
                            <p><strong>Years of Experience:</strong> {interviewData.jobExperience}</p>
                        </CardContent>
                    </Card>
                    <Card className='flex flex-col items-center justify-center'>
                         <CardHeader>
                            <CardTitle>Overall Rating</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <h2 className='text-6xl font-bold text-green-500'>{avgRating}/10</h2>
                            <p className='text-sm text-center text-gray-500'>Based on AI feedback</p>
                        </CardContent>
                    </Card>
                </div>

                <h2 className='text-2xl font-bold my-4'>Question-by-Question Feedback</h2>
                <Accordion type="single" collapsible className="w-full">
                    {feedbackResult.map((item, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger className='text-left'>
                                <div className='flex gap-4'>
                                    <strong>Q{index + 1}:</strong> {item.question}
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <Card className='bg-gray-50'>
                                    <CardHeader className='flex-row justify-between items-center gap-4'>
                                        <CardTitle className='text-lg'>Your Answer</CardTitle>
                                        <p className={`text-sm font-bold p-2 px-3 rounded-lg ${(parseInt(item.rating || '0') || 0) > 6 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            Rating: {item.rating || '0'}/10
                                        </p>
                                    </CardHeader>
                                    <CardContent>
                                        {/* Logic to display code or voice answer */}
                                        {item.modifiedCode ? (
                                            <div className='mb-4 space-y-4'>
                                                <div>
                                                    <h4 className='text-sm font-bold mb-2'>Your Code Solution:</h4>
                                                    <CodeEditor value={item.modifiedCode} />
                                                </div>
                                            </div>
                                        ) : (
                                            <p className='mb-4'>{item.userAns}</p>
                                        )}
                                        
                                        <h3 className='text-md font-bold text-green-700'>AI Feedback:</h3>
                                        <p className='mb-4'>{item.feedback}</p>
                                        
                                        <h3 className='text-md font-bold text-blue-700'>Model Answer:</h3>
                                        {modelAnswers[index]?.type === 'code' ? (
                                            <div className='space-y-2'>
                                                <p>{modelAnswers[index]?.answer || 'No model answer available.'}</p>
                                                {modelAnswers[index]?.codeSnippet && (
                                                    <div>
                                                        <h4 className='text-sm font-bold mt-2 mb-2'>Example Code:</h4>
                                                        <CodeEditor value={modelAnswers[index].codeSnippet} />
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p>{modelAnswers[index]?.answer || 'No model answer available.'}</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        );
    } catch (error) {
        console.error('❌ Error in FeedbackPage:', error);
        throw error; // Re-throw to show Next.js error boundary
    }
}

export default FeedbackPage;