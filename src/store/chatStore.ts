import { create } from "zustand";
import { ChatMessage } from "@/types";

interface ChatStore {
  messages: ChatMessage[];
  isStreaming: boolean;
  currentStreamText: string;
  attachments: string[];
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  setStreaming: (isStreaming: boolean) => void;
  setCurrentStreamText: (text: string) => void;
  addAttachment: (url: string) => void;
  removeAttachment: (url: string) => void;
  clearAttachments: () => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isStreaming: false,
  currentStreamText: "",
  attachments: [],

  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setStreaming: (isStreaming) => set({ isStreaming }),

  setCurrentStreamText: (currentStreamText) => set({ currentStreamText }),

  addAttachment: (url) =>
    set((state) => ({
      attachments: [...state.attachments, url],
    })),

  removeAttachment: (url) =>
    set((state) => ({
      attachments: state.attachments.filter((a) => a !== url),
    })),

  clearAttachments: () => set({ attachments: [] }),

  clearChat: () => set({ messages: [], attachments: [], currentStreamText: "" }),
}));
