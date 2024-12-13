import { useState } from 'react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black">
      <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex">
        {/* Mobile sidebar */}
        <div className={`
          fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden
          transition-opacity duration-300 ease-in-out
          ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}>
          <div className={`
            fixed inset-y-0 left-0 w-64 bg-zinc-900 transform
            transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}>
            <Sidebar 
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />
          </div>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden md:block w-64 min-h-screen">
          <Sidebar 
            isOpen={true}
            onClose={() => {}}
          />
        </div>

        {/* Main content */}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
