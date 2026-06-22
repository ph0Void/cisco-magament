"use client";

import React, { createContext, useContext } from "react";
import { useCiscoChat } from "@/hooks/useCiscoChat";

type CiscoChatContextType = ReturnType<typeof useCiscoChat>;

const ChatContext = createContext<CiscoChatContextType | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const chatValue = useCiscoChat();
  return (
    <ChatContext.Provider value={chatValue}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
