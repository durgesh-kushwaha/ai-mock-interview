"use client"; 

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";

const HeaderButtons = ({ userId }: { userId: string | null }) => {
  return (
    <div>
      {userId ? (
        <div className="flex items-center gap-4">
          <Link href="/dashboard">Dashboard</Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <Link
            href="/sign-in"
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          >
            Sign In
          </Link>
          {}
          <Link
            href="/sign-up"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded"
          >
            Sign Up
          </Link>
        </div>
      )}
    </div>
  );
};

export default HeaderButtons;