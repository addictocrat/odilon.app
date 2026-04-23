"use client";

import React, { useState } from "react";
import { ChatSidebar } from "@/components/ChatSidebar";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Chat } from "@/lib/db/schema";

interface DashboardClientProps {
  children: React.ReactNode;
  initialConversations?: Chat[];
}

export function DashboardClient({ children, initialConversations }: DashboardClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-[#F6E6CB] overflow-hidden">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 lg:relative lg:block transition-all duration-300 transform",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <ChatSidebar initialData={initialConversations} />

        {/* Toggle button for mobile */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={cn(
            "absolute top-4 p-2 bg-[#E7D4B5] border border-[#483434]/10 rounded-sm lg:hidden z-50 shadow-md transition-all duration-300",
            isSidebarOpen ? "right-[-3rem]" : "right-[-3.5rem]",
          )}
        >
          {isSidebarOpen ? (
            <X className="w-5 h-5 text-[#483434]" />
          ) : (
            <Menu className="w-5 h-5 text-[#483434]" />
          )}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative scrollbar-hide">
        <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-12 lg:p-24">
          <div className="w-full max-w-4xl relative">{children}</div>
        </div>

        {/* Decorative frame - adjusted to be inside the main content area */}
        <div
          className="hidden md:block fixed right-12 top-12 bottom-12 left-[calc(20rem+3rem)] border border-odilon-logo/5 pointer-events-none transition-all duration-300"
          style={{ left: isSidebarOpen ? "calc(20rem + 3rem)" : "3rem" }}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
