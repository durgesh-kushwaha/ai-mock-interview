"use client"; // This directive marks it as a Client Component

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";

// We receive the userId as a prop from the parent Server Component
const HeaderButtons = ({ userId }: { userId: string | null }) => {
  return (
    <div>
      {userId ? (
        <div className="flex items-center gap-4">
          <Link href="/dashboard">Dashboard</Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      ) : (
        <Link
          href="/sign-in"
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          Sign In
        </Link>
      )}
    </div>
  );
};

export default HeaderButtons;