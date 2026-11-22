import { Suspense } from 'react';
import { Sidebar } from '@/components/sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <Suspense fallback={<div className="w-64" />}>
        <Sidebar />
      </Suspense>
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}

