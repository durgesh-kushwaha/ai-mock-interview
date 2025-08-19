"use client";

import { Button } from '@/components/ui/button';
import { interviews } from '@/utils/schema';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { LoaderCircle, Trash2 } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from 'sonner';
import { deleteInterview } from '../_actions/interview';

type Interview = typeof interviews.$inferSelect;

function InterviewCard({ interview }: { interview: Interview }) {
    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const router = useRouter();

    const onViewFeedback = () => {
        setLoading(true);
        router.push(`/dashboard/interview/${interview.mockId}/feedback`);
    };

    const onDelete = async () => {
        setDeleteLoading(true);
        try {
            const result = await deleteInterview(interview.mockId);
            if (result.success) {
                toast.success("Interview deleted successfully.");
            } else {
                toast.error(result.error || "Failed to delete interview.");
            }
        } catch (e) {
            toast.error("An unexpected error occurred.");
        }
        setDeleteLoading(false);
    };

    return (
        <div className='border shadow-sm rounded-lg p-4 flex flex-col justify-between h-full relative group'>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <button className='absolute top-2 right-2 p-1.5 bg-red-50 hover:bg-red-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'>
                        <Trash2 className='h-4 w-4 text-red-500' />
                    </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your interview data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={onDelete} disabled={deleteLoading} className='bg-red-600 hover:bg-red-700'>
                            {deleteLoading ? <LoaderCircle className='animate-spin' /> : 'Continue'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div>
                <h2 className='font-bold text-blue-600 text-lg'>{interview.jobPosition}</h2>
                <h2 className='text-sm text-gray-500'>{interview.jobExperience} Years of Experience</h2>
                <h2 className='text-xs text-gray-400 mt-2'>Created on: {new Date(interview.createdAt!).toLocaleDateString()}</h2>
            </div>
            
            <div className='flex flex-col mt-4 gap-2'>
                <Button size="lg" variant="outline" className="w-full cursor-pointer">
                    Retake
                </Button>
                <Button size="lg" className="w-full cursor-pointer" onClick={onViewFeedback} disabled={loading}>
                    {loading ? <LoaderCircle className='animate-spin h-5 w-5' /> : 'View Feedback'}
                </Button>
            </div>
        </div>
    );
}

export default InterviewCard;