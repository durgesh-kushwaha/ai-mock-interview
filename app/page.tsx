"use client"; // ADD THIS LINE AT THE VERY TOP

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Video } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 flex justify-between items-center bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">AI Interviewer</h1>
        <Link href="/dashboard">
          <Button>Get Started</Button>
        </Link>
      </header>
      <main className="flex-grow flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4">
            Your Personal AI Interview Coach
          </h2>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Double your chances of landing that job offer with our AI-powered interview prep.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" onClick={() => alert('Demo video coming soon!')}>
              <Video className="mr-2 h-5 w-5" /> Watch Video
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}