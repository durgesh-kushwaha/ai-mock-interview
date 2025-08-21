"use client";
import { useAuth } from "@clerk/nextjs";
import HeaderButtons from "./HeaderButtons";
import Link from "next/link";

export default function Header() {
  const { userId } = useAuth();
  
  return (
    <header className="flex items-center justify-between p-4 px-8 border-b shadow-sm bg-white">
      <Link href="/" className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
        AI Mock Interviewer
      </Link>
      <div className="flex items-center gap-6">
        <HeaderButtons userId={userId || null} />
      </div>
    </header>
  );
}
