"use client"; // Note: This component is now a client component
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";

export default function Header() {
  return (
    <header className="flex items-center justify-between p-4 px-8 border-b shadow-sm">
      <Link href="/" className="text-2xl font-bold text-gray-800">
        AI Mock Interviewer
      </Link>
      <div className="flex items-center gap-6">
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          {/* Add your new navigation links here */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
            <Link href="/developer" className="hover:text-blue-600 transition-colors">Developer</Link>
            <Link href="#" className="hover:text-blue-600 transition-colors">FAQs</Link>
          </nav>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
}