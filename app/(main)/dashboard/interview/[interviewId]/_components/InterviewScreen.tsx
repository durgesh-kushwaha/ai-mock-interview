"use client";
import React, { useEffect, useState, useRef } from 'react';
import { interviews } from '@/utils/schema';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, ArrowLeft, Code } from 'lucide-react';
import { toast } from 'sonner';
import { submitFeedback } from '../../../_actions/feedback';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CodeEditor } from '@/components/ui/code-editor';
import { Question, AnswerRecord, CodeQuestion } from '@/types/interview';

type InterviewData = typeof interviews.$inferSelect;

function isCodeQuestion(question: Question): question is CodeQuestion {
  return question.type === 'code';
}

function InterviewScreen({ interviewData }: { interviewData: InterviewData }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [accumulatedTranscript, setAccumulatedTranscript] = useState('');
  const [recordedAnswers, setRecordedAnswers] = useState<AnswerRecord[]>([]);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [codeAnswer, setCodeAnswer] = useState('');
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
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
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        toast.error('Your browser does not support speech recognition. Please use Chrome, Edge, or Safari.');
        return;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error('Microphone access is not supported in your browser.');
        return;
      }

      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => { 
        setListening(true); 
      };
      
      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let newTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          newTranscript += transcript + ' ';
        }

        const updatedTranscript = (accumulatedTranscript + newTranscript).trim();
        setAccumulatedTranscript(updatedTranscript);
        setUserAnswer(updatedTranscript);
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error, event.message);
        
        let errorMessage = 'Speech recognition error occurred';
        
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.';
            break;
          case 'audio-capture':
            errorMessage = 'Microphone not found or not working.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone access and try again.';
            break;
          case 'network':
            errorMessage = 'Network error. Please check your internet connection.';
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }
        
        toast.error(errorMessage);
        setListening(false);
      };
      
      recognitionRef.current.onend = () => { 
        setListening(false); 
      };

      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          recognitionRef.current?.start();
        })
        .catch((error) => {
          console.error('Microphone access error:', error);
          toast.error('Please allow microphone access to use speech recognition.');
        });
        
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      toast.error('Failed to start speech recognition. Please refresh the page and try again.');
    }
  };

  const stopListening = () => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setListening(false);
      
      if (accumulatedTranscript.trim()) {
        const currentQuestion = questions[activeQuestionIndex];
        const answerRecord: AnswerRecord = {
          question: currentQuestion.question,
          userAns: accumulatedTranscript.trim(),
          type: currentQuestion.type,
          isVoiceAnswer: true,
        };

        if (isCodeQuestion(currentQuestion)) {
          answerRecord.codeLanguage = currentQuestion.language;
          answerRecord.originalCode = currentQuestion.codeSnippet;
          answerRecord.modifiedCode = codeAnswer;
        }

        setRecordedAnswers(prev => [...prev, answerRecord]);
      }
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
      setListening(false);
    }
  };
  
  const handleCodeSubmit = () => {
    if (codeAnswer.trim()) {
      const currentQuestion = questions[activeQuestionIndex];
      const answerRecord: AnswerRecord = {
        question: currentQuestion.question,
        userAns: codeAnswer.trim(),
        type: 'code',
        isVoiceAnswer: false,
      };

      if (isCodeQuestion(currentQuestion)) {
        answerRecord.codeLanguage = currentQuestion.language;
        answerRecord.originalCode = currentQuestion.codeSnippet;
        answerRecord.modifiedCode = codeAnswer.trim();
      }

      setRecordedAnswers(prev => [...prev, answerRecord]);
      setCodeAnswer('');
      setShowCodeEditor(false);
      
      if (activeQuestionIndex < questions.length - 1) {
        setActiveQuestionIndex(activeQuestionIndex + 1);
        setUserAnswer('');
        setAccumulatedTranscript('');
      }
    }
  };

  const handleNextOrSubmit = async () => {
    if (activeQuestionIndex < questions.length - 1) {
      setActiveQuestionIndex(activeQuestionIndex + 1);
      setUserAnswer(''); 
      setAccumulatedTranscript('');
      setShowCodeEditor(false);
      setCodeAnswer('');
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
  
  const currentQuestion = questions[activeQuestionIndex];
  const currentLanguage = isCodeQuestion(currentQuestion) ? currentQuestion.language : 'javascript';
  
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
            <h2 className='font-bold text-lg'>Questions ({activeQuestionIndex + 1}/{questions.length})</h2>
            <div className='p-4 border rounded-lg space-y-4 h-full overflow-y-auto max-h-96'>
                {questions.map((q, index) => (
                    <div key={index} className={`p-2 rounded-md cursor-pointer ${activeQuestionIndex === index ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}>
                        {index + 1}. {q.question}
                    </div>
                ))}
            </div>
        </div>

        <div className='flex flex-col gap-6'>
          <div className='flex items-center gap-4 text-center'>
            <Button onClick={speakQuestion} size="icon" variant="outline" title="Speak/Mute Question"> <Volume2 /> </Button>
            <h2 className='text-2xl font-bold'>{currentQuestion?.question}</h2>
          </div>
          
          {showCodeEditor ? (
            <div className='w-full space-y-4'>
              <CodeEditor
                value={codeAnswer}
                onChange={setCodeAnswer}
                language={currentLanguage}
                placeholder="Write your code solution here..."
              />
              <div className='flex gap-4'>
                <Button 
                  onClick={() => setShowCodeEditor(false)}
                  variant="outline"
                >
                  Back to Text
                </Button>
                <Button 
                  onClick={handleCodeSubmit}
                  disabled={!codeAnswer.trim()}
                >
                  Submit Code
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className='w-full h-60 p-4 border rounded-lg bg-gray-50 overflow-y-auto'>
                {userAnswer || 'Your transcribed answer will appear here...'}
              </div>

              <div className='flex gap-4 flex-wrap'>
                {listening ? (
                  <Button onClick={stopListening} className="bg-red-500 hover:bg-red-600"> 
                    <MicOff className="mr-2" /> Stop Recording 
                  </Button>
                ) : (
                  <Button onClick={startListening}> 
                    <Mic className="mr-2" /> Record Answer 
                  </Button>
                )}

                {currentQuestion?.type === 'code' && (
                  <Button 
                    onClick={() => setShowCodeEditor(true)}
                    variant="outline"
                    className="bg-blue-100 text-blue-700 hover:bg-blue-200"
                  >
                    <Code className="mr-2" size={16} /> Code Editor
                  </Button>
                )}

                {!listening && accumulatedTranscript && (
                  <Button 
                    onClick={() => {
                      setAccumulatedTranscript('');
                      setUserAnswer('');
                    }} 
                    variant="outline"
                    className="text-red-500 border-red-300 hover:bg-red-50"
                  >
                    Clear Answer
                  </Button>
                )}

                <Button 
                  onClick={handleNextOrSubmit} 
                  disabled={(!userAnswer && !showCodeEditor) || loading}
                  className="ml-auto"
                >
                  {loading ? 'Submitting...' : activeQuestionIndex === questions.length - 1 ? 'Finish & Get Feedback' : 'Next Question'}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default InterviewScreen;
