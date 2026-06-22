import {
  createChat,
  deleteChat,
  getChatMessages,
  getChats,
  saveMessage,
} from "@/action/ChatActions";
import { useState, useEffect, useCallback } from "react";

import { type MessageContentBlock } from "@/types";

export interface ToolExecution {
  id: string;
  name: string;
  input: any;
  output?: any;
  status: "running" | "completed" | "waiting_approval" | "rejected";
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  images?: string[];
  tools?: ToolExecution[];
  contentBlocks?: MessageContentBlock[];
}

export interface ChatSession {
  id: string;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function useCiscoChat() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshSessions = useCallback(async () => {
    try {
      const result = await getChats();
      const rawList = result?.data ?? [];
      const parsedList = (Array.isArray(rawList) ? rawList : []).map((s) => ({
        ...s,
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt),
      }));
      setSessions(parsedList);
      return parsedList;
    } catch (err) {
      console.error("Error cargando sesiones desde SQLite:", err);
      return [];
    }
  }, []);

  useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

  const loadChat = async (chatId: string) => {
    setIsLoading(true);
    try {
      setCurrentSessionId(chatId);
      const dbMessages = await getChatMessages(chatId);

      const mappedMessages: Message[] = dbMessages.map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
        tools: [], // Las llamadas de herramientas interactivas ocurren en memoria para la sesión activa
        contentBlocks: [{ type: "text", content: m.content }],
      }));

      setMessages(mappedMessages);
    } catch (err) {
      console.error("Error al renderizar conversación previa:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = async (customTitle?: string) => {
    setIsLoading(true);
    try {
      const titleCandidate = customTitle || "Nueva sesión de red";
      const result = await createChat(titleCandidate);
      const newChatId = result?.data?.id;
      await refreshSessions();
      if (newChatId) setCurrentSessionId(newChatId);
      setMessages([]);
      setInput("");
      setImages([]);
    } catch (err) {
      console.error("Error al crear sesión nueva:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      await deleteChat(chatId);
      const remaining = await refreshSessions();

      if (currentSessionId === chatId) {
        if (remaining.length > 0) {
          loadChat(remaining[0].id);
        } else {
          setCurrentSessionId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error("Error al procesar eliminación de chat:", err);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      filesArray.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            setImages((prev) => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const sendMessage = async (overrideText?: string, externalImageUrls?: string[]) => {
    const textToSend = overrideText || input;
    const allImages = externalImageUrls ?? images;
    if (!textToSend.trim() && allImages.length === 0) return;

    let activeSessionId = currentSessionId;

    if (!activeSessionId) {
      const titleCandidate = textToSend.trim()
        ? textToSend.trim().substring(0, 30)
        : "Análisis de Red";
      const result = await createChat(titleCandidate);
      activeSessionId = result?.data?.id ?? null;
      if (activeSessionId) setCurrentSessionId(activeSessionId);
      await refreshSessions();
    }

    if (!activeSessionId) {
      console.error("No se pudo crear o recuperar una sesión de chat activa.");
      return;
    }

    setIsLoading(true);
    setInput("");
    const userImages = externalImageUrls ?? [...images];
    if (!externalImageUrls) setImages([]);

    const userMsgId = crypto.randomUUID();
    const userMessage: Message = {
      id: userMsgId,
      role: "user",
      content: textToSend,
      images: userImages,
      contentBlocks: [{ type: "text", content: textToSend }],
    };

    setMessages((prev) => [...prev, userMessage]);
    await saveMessage(activeSessionId, "user", textToSend);

    const assistantMessageId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      { id: assistantMessageId, role: "assistant", content: "", tools: [], contentBlocks: [] },
    ]);

    const historyPayload = [...messages, userMessage].map((m) => {
      if (m.images && m.images.length > 0) {
        return {
          role: m.role,
          content: [
            { type: "text", text: m.content },
            ...m.images.map((img) => ({
              type: "image_url",
              image_url: { url: img },
            })),
          ],
        };
      }
      return {
        role: m.role,
        content: m.content,
      };
    });

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyPayload,
          threadId: activeSessionId,
        }),
      });

      if (!response.body) return;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let currentAssistantText = "";
      let activeTools: ToolExecution[] = [];
      let contentBlocks: MessageContentBlock[] = [];

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunkStr = decoder.decode(value);
        const lines = chunkStr.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "text") {
                currentAssistantText += data.content;
                const lastBlock = contentBlocks[contentBlocks.length - 1];
                if (lastBlock && lastBlock.type === "text") {
                  lastBlock.content += data.content;
                } else {
                  contentBlocks.push({ type: "text", content: data.content });
                }
              }
              else if (data.type === "tool_start") {
                const requiresApproval = [
                  "removeDevice",
                  "configureIosDevice",
                  "removeLink",
                  "simulateLinkFailure",
                ].includes(data.tool);

                const status = requiresApproval ? "waiting_approval" : "running";

                activeTools.push({
                  id: data.callId,
                  name: data.tool,
                  input: data.input,
                  status: status,
                });

                contentBlocks.push({
                  type: "tool",
                  id: data.callId,
                  name: data.tool,
                  input: data.input,
                  status: status,
                });
              }
              else if (data.type === "tool_end") {
                activeTools = activeTools.map((t) =>
                  t.id === data.callId
                    ? { ...t, status: "completed", output: data.output }
                    : t,
                );

                contentBlocks = contentBlocks.map((block) =>
                  block.type === "tool" && block.id === data.callId
                    ? {
                      ...block,
                      status: "completed",
                      output: typeof data.output === "string" ? data.output : JSON.stringify(data.output),
                    }
                    : block
                );
              }

              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessageId
                    ? {
                      ...msg,
                      content: currentAssistantText,
                      tools: [...activeTools],
                      contentBlocks: [...contentBlocks],
                    }
                    : msg,
                ),
              );
            } catch (e) {
              //  error
            }
          }
        }
      }

      if (currentAssistantText.trim()) {
        await saveMessage(activeSessionId, "assistant", currentAssistantText);
      }

      await refreshSessions();
    } catch (err) {
      console.error("Error al procesar el stream del agente:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const actionApproval = (
    msgId: string,
    toolId: string,
    action: "approve" | "reject",
  ) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== msgId) return msg;
        const updatedTools = msg.tools?.map((t) => {
          if (t.id !== toolId) return t;
          return {
            ...t,
            status: action === "approve" ? "running" : "rejected" as any,
          };
        });
        const updatedBlocks = msg.contentBlocks?.map((block) => {
          if (block.type === "tool" && block.id === toolId) {
            return {
              ...block,
              status: action === "approve" ? "running" : "rejected" as any,
            };
          }
          return block;
        });
        return {
          ...msg,
          tools: updatedTools,
          contentBlocks: updatedBlocks,
        };
      }),
    );
  };

  return {
    sessions,
    currentSessionId,
    messages,
    input,
    setInput,
    images,
    setImages,
    isLoading,
    handleImageUpload,
    removeImage,
    sendMessage,
    actionApproval,
    loadChat,
    handleNewChat,
    handleDeleteChat,
    refreshSessions,
  };
}
