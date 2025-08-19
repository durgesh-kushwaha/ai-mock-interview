"use client";
import React, { useEffect, useState, useRef } from 'react';
import { interviews } from '@/utils/schema';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, ArrowLeft, Video } from 'lucide-react';
import { toast } from 'sonner';
import { submitFeedback } from '../../../_actions/feedback';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Webcam from "react-webcam";

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

type Question = {
  question: string;
  answer: string;
};

type AnswerRecord = {
  question: string;
  userAns: string;
}

type InterviewData = typeof interviews.$inferSelect;

function InterviewScreen({ interviewData }: { interviewData: InterviewData }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [recordedAnswers, setRecordedAnswers] = useState<AnswerRecord[]>([]);
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (interviewData?.jsonMockResp) {
      const parsedQuestions: Question[] = JSON.parse(interviewData.jsonMockResp);
      setQuestions(parsedQuestions);
    }
  }, [interviewData]);

  const speakQuestion = () => {
    if ('speechSynthesis' in window) {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      } else {
        const utterance = new SpeechSynthesisUtterance(questions[activeQuestionIndex]?.question);
        window.speechSynthesis.speak(utterance);
      }
    } else {
      toast.error('Your browser does not support text-to-speech.');
    }
  };

  const startListening = () => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onstart = () => { setListening(true); setUserAnswer(''); };
      
      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      
        const transcript = Array.from(event.results).map((result) => result[0]).map(result => result.transcript).join('');
        setUserAnswer(transcript);
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => { 
          toast.error('Speech recognition error: ' + event.error); 
          setListening(false); 
      };

      recognitionRef.current.onend = () => { setListening(false); };
      recognitionRef.current.start();
    } else {
      toast.error('Your browser does not support speech recognition.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      setRecordedAnswers(prev => [...prev, {
        question: questions[activeQuestionIndex].question,
        userAns: userAnswer,
      }]);
    }
  };
  
  const handleNextOrSubmit = async () => {
    if (activeQuestionIndex < questions.length - 1) {
      setActiveQuestionIndex(activeQuestionIndex + 1);
      setUserAnswer(''); 
    } else {
      setLoading(true);
      const result = await submitFeedback(recordedAnswers, interviewData.mockId);
      setLoading(false);
      if (result.success) {
        toast.success('Interview submitted! Redirecting to feedback page.');
        router.push(`/dashboard/interview/${interviewData.mockId}/feedback`);
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    }
  };

  if (questions.length === 0) return <div>Loading...</div>;
  
  return (
    <div className='p-10 flex flex-col'>
      <div className='flex justify-between items-center mb-6'>
          <h2 className='text-2xl font-bold text-green-500'>Your Interview is in Progress...</h2>
          <Link href="/dashboard">
              <Button variant="outline"><ArrowLeft className='mr-2' /> Back to Dashboard</Button>
          </Link>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
        <div className='flex flex-col gap-4'>
            <div className='bg-gray-800 rounded-lg p-4 border flex items-center justify-center h-[300px]'>
              {webcamEnabled ? (
                  <Webcam
                    mirrored={true}
                    style={{ height: '100%', width: '100%', objectFit: 'contain' }}
                  />
              ) : (
                <div className='flex flex-col items-center gap-3 text-white'>
                  <Video className='h-16 w-16' />
                  <Button onClick={() => setWebcamEnabled(true)}>Enable Camera</Button>
                </div>
              )}
            </div>
            
            <div className='p-4 border rounded-lg space-y-4 h-full'>
                <h2 className='font-bold text-lg'>Questions ({activeQuestionIndex + 1}/{questions.length})</h2>
                {questions.map((q, index) => (
                    <div key={index} className={`p-2 rounded-md cursor-pointer ${activeQuestionIndex === index ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}>
                        {index + 1}. {q.question}
                    </div>
                ))}
            </div>
        </div>

        <div className='flex flex-col items-center justify-center gap-6'>
          <div className='flex items-center gap-4 text-center'>
            <Button onClick={speakQuestion} size="icon" variant="outline" title="Speak/Mute Question"> <Volume2 /> </Button>
            <h2 className='text-2xl font-bold'>{questions[activeQuestionIndex]?.question}</h2>
          </div>
          
          <div className='w-full h-60 p-4 border rounded-lg bg-gray-50 overflow-y-auto'>
              {userAnswer || 'Your transcribed answer will appear here...'}
          </div>

          <div className='flex gap-4'>
            {listening ? (
              <Button onClick={stopListening} className="bg-red-500 hover:bg-red-600"> <MicOff className="mr-2" /> Stop Recording </Button>
            ) : (
              <Button onClick={startListening}> <Mic className="mr-2" /> Record Answer </Button>
            )}

            <Button onClick={handleNextOrSubmit} disabled={!userAnswer || loading}>
                {loading ? 'Submitting...' : activeQuestionIndex === questions.length - 1 ? 'Finish & Get Feedback' : 'Next Question'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewScreen;