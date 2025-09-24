import React from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

interface LayoutProps {
  children: React.ReactNode;
  userRole?: 'PRODUCER' | 'CONSUMER' | 'STORAGE_OWNER' | 'TRANSPORTER' | 'ADMIN' | null;
  userName?: string | null;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  userRole = null, 
  userName = null 
}) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header userRole={userRole} userName={userName} />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;