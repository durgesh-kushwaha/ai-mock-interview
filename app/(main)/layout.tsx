import Footer from '@/app/components/Footer';
import Header from '@/app/components/Header';
import React from 'react';

function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Add a background color that will show through on pages
    <div className='bg-gray-50'>
      <Header />
      <main>
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;