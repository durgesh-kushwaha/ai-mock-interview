"use client";

import React from 'react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
    {
        question: "What is the AI Mock Interviewer?",
        answer: "The AI Mock Interviewer is a platform that helps you practice for job interviews. You can create mock interviews for specific job roles, answer AI-generated questions, and receive instant feedback on your performance."
    },
    {
        question: "How does the AI generate questions?",
        answer: "Our AI uses the job description and your experience level to generate relevant interview questions. This ensures that the questions are tailored to the specific job you are applying for."
    },
    {
        question: "How does the speech-to-text feature work?",
        answer: "We use advanced speech-to-text technology to capture your answers in real-time. This allows you to practice your communication skills and get feedback on your verbal responses."
    },
    {
        question: "Can I record my interview?",
        answer: "Yes, you can record your interview to review your performance later. The video recording feature is currently in beta and we are working on adding more features to it."
    },
    {
        question: "How do I get feedback on my interview?",
        answer: "After you complete your interview, you will receive an instant feedback report. The report includes ratings and constructive feedback on each answer, helping you identify areas for improvement."
    }
];

function FAQsPage() {
    return (
        <div className="p-10">
            <h2 className="text-3xl font-bold text-center mb-6">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full max-w-2xl mx-auto">
                {faqs.map((faq, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger>{faq.question}</AccordionTrigger>
                        <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}

export default FAQsPage;