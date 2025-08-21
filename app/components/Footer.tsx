import Link from 'next/link';
import React from 'react';

function Footer() {
  return (
    <footer className="bg-gray-800 text-white p-4 mt-10">
      <div className="container mx-auto text-center">
        <p>&copy; 2025 AI Mock Interviewer. All Rights Reserved.</p>
        <p className="mt-1 text-sm text-gray-400">Made with ❤️ by Durgesh Kushwaha</p>
        <div className="mt-2">
          <Link href="/developer" className="hover:text-blue-400 transition-colors">
            About the Developer
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;