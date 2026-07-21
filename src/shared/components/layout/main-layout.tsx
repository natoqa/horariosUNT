'use client'

import { useState } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { CommandMenu } from './command-menu';
import { ChatSidebar, ChatToggle } from '../../../app/chat/components/chat-interface';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="flex h-screen">
      <CommandMenu />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col lg:ml-64">
        <Header onMenuToggle={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 bg-muted/20">
          {children}
        </main>
      </div>
      <ChatSidebar isOpen={chatOpen} onClose={() => setChatOpen(false)} />
      <ChatToggle onClick={() => setChatOpen(true)} />
    </div>
  );
}
