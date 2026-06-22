"use client";

import SidebarChatHistory from "@/component/chat/history/SidebarChatHistory";
import { ChatProvider } from "@/context/ChatContext";
import React, { useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatLayoutProps {
  children: React.ReactNode;
}

export default function ChatLayout({ children }: ChatLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <ChatProvider>
      <div className="absolute inset-0 flex overflow-hidden text-foreground">
        {/* Sidebar – Historial de conversaciones */}
        <aside
          className={`${
            isCollapsed ? "w-0 border-r-0 opacity-0" : "w-56 lg:w-64 border-r opacity-100"
          } hidden md:flex shrink-0 flex-col border-border/40 bg-muted/20 dark:bg-muted/10 overflow-hidden transition-all duration-300 ease-in-out relative`}
        >
          <div className="flex justify-between items-center px-4 py-2 border-b border-border/40 shrink-0">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Cisco Chat</span>
            <Button
              id="btn-collapse-sidebar"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={() => setIsCollapsed(true)}
              title="Colapsar historial"
            >
              <PanelLeftClose className="size-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-hidden">
            <SidebarChatHistory />
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="flex flex-1 min-w-0 flex-col overflow-hidden bg-background relative transition-all duration-300">
          {isCollapsed && (
            <div className="absolute left-4 top-4 z-50">
              <Button
                id="btn-expand-sidebar"
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-background border border-border shadow-md rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer flex items-center justify-center"
                onClick={() => setIsCollapsed(false)}
                title="Mostrar historial"
              >
                <PanelLeftOpen className="size-4" />
              </Button>
            </div>
          )}
          {children}
        </main>
      </div>
    </ChatProvider>
  );
}


