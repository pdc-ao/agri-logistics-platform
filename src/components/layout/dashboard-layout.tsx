// src/components/dashboard-layout.tsx
import React from 'react';

export default function DashboardLayout({
  children,
  userRole,
  userName,
}: {
  children: React.ReactNode;
  userRole: string;
  userName: string;
}) {
  return (
    <div>
      <header className="p-4 border-b flex justify-between">
        <h1 className="font-bold">Dashboard</h1>
        <span className="text-sm text-neutral-600">
          {userName} ({userRole})
        </span>
      </header>
      <main>{children}</main>
    </div>
  );
}
