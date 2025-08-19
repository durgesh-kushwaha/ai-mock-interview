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
} from "@/components/ui/accordion"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface FeedbackPageProps {
    params: {
        interviewId: string;
    };
}

type ModelAnswer = {
    question: string;
    answer: string;
};

async function FeedbackPage({ params }: FeedbackPageProps) {
  
    const { interviewId } = params;

    const [interviewResult, feedbackResult] = await Promise.all([
        db.select().from(interviews).where(eq(interviews.mockId, interviewId)),
        db.select().from(userAnswers).where(eq(userAnswers.mockIdRef, interviewId)).orderBy(userAnswers.id)
    ]);

    if (!interviewResult[0] || feedbackResult.length === 0) {
        return notFound();
    }

    const interviewData = interviewResult[0];
    const modelAnswers: ModelAnswer[] = JSON.parse(interviewData.jsonMockResp);

    const totalRating = feedbackResult.reduce((acc, item) => acc + parseInt(item.rating || '0'), 0);
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
                        <h2 className='text-6xl font-bold text-green-500'>{avgRating}/5</h2>
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
                                    <p className={`text-sm font-bold p-2 px-3 rounded-lg ${parseInt(item.rating || '0') > 3 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        Rating: {item.rating}/5
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <p className='mb-4'>{item.userAns}</p>
                                    <h3 className='text-md font-bold text-green-700'>AI Feedback:</h3>
                                    <p className='mb-4'>{item.feedback}</p>
                                    <h3 className='text-md font-bold text-blue-700'>Model Answer:</h3>
                                    <p>{modelAnswers[index]?.answer || 'No model answer available.'}</p>
                                </CardContent>
                            </Card>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}

export default FeedbackPage;