import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { ChatbotWidget } from './ChatbotWidget';
import { NavigationButtons } from './NavigationButtons';
import { useChatbot } from '../contexts/ChatbotContext';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isOpen, toggleChatbot } = useChatbot();
  const location = useLocation();

  // Don't show navigation buttons on dashboard
  const showNavigation = location.pathname !== '/dashboard';

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden ml-0 sm:ml-80 lg:ml-72">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600"
            >
              ☰
            </button>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">HR</span>
              </div>
              <span className="ml-2 text-lg font-semibold text-gray-900">COSTAATT</span>
            </div>
            <div className="w-8"></div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {/* Navigation Bar - Only show on non-dashboard pages */}
          {showNavigation && (
            <div className="bg-white border-b border-gray-200 px-4 py-3">
              <NavigationButtons />
            </div>
          )}
          {children}
        </main>
        
        {/* Footer */}
        <Footer />
      </div>

      {/* Chatbot Widget */}
      <ChatbotWidget isOpen={isOpen} onToggle={toggleChatbot} />
    </div>
  );
}