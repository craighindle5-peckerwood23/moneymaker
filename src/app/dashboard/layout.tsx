import type { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-4">
        <h2 className="font-semibold mb-4">Dashboard</h2>
        <nav className="space-y-2 text-sm">
          <a href="/dashboard" className="block">Jobs</a>
          <a href="/dashboard/customers" className="block">Customers</a>
          <a href="/dashboard/settings" className="block">Settings</a>
        </nav>
      </aside>
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
