"use client"; 

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";

const HeaderButtons = ({ userId }: { userId: string | null }) => {
  return (
    <div>
      {userId ? (
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/dashboard" className="font-semibold hover:text-blue-600 transition-colors">Dashboard</Link>
            <Link href="/developer" className="font-semibold hover:text-blue-600 transition-colors">Developer</Link>
            <Link href="/faqs" className="font-semibold hover:text-blue-600 transition-colors">FAQs</Link>
          </nav>
          <UserButton afterSignOutUrl="/" />
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <Link
            href="/sign-in"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 border-2 border-gray-700"
          >
            Sign Up
          </Link>
        </div>
      )}
    </div>
  );
};

export default HeaderButtons;
