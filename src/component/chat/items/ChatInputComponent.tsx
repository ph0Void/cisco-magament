"use client";

import React, { useCallback, useState } from "react";
import { useChat } from "@/context/ChatContext";
import { toast } from "sonner";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
  ConversationEmptyState,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputHeader,
  PromptInputButton,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionAddAttachments,
  usePromptInputAttachments,
} from "@/components/ai-elements/prompt-input";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Icons
import {
  Network,
  Bot,
  User,
  Copy,
  Check,
  ImageIcon,
  X,
  WrenchIcon,
  Activity,
  CheckCircle2,
  ShieldAlert,
  XCircle,
  Terminal,
  ChevronDown,
  Plus,
  Cpu,
  AlertTriangle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { ToolExecution } from "@/hooks/useCiscoChat";
import ToolCardInline from "../card/ToolCard";
import AttachedImagePreviews from "./AttachedImagePreviews";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";


export function ChatInputComponent() {
  const {
    messages,
    sendMessage,
    isLoading,
    actionApproval,
  } = useChat();

  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState("Cisco Packet Tracer");

  const handleCopy = useCallback(async (text: string, msgId: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    toast.success("Copiado al portapapeles");
    setTimeout(() => setCopiedMsgId(null), 2000);
  }, []);

  const handleSubmit = useCallback(
    async (message: import("@/components/ai-elements/prompt-input").PromptInputMessage) => {
      const { text, files } = message;
      if (!text.trim() && files.length === 0) return;
      const imageUrls = files.map((f) => f.url).filter(Boolean) as string[];

      try {
        await sendMessage(text, imageUrls);
      } catch {
        toast.error("Error al enviar el mensaje");
      }
    },
    [sendMessage]
  );

  return (
    <TooltipProvider>
      <div className="flex h-full flex-col min-h-0">
        {/* Chat area */}
        <Conversation className="flex-1 min-h-0">
          <ConversationContent className="gap-6 px-4 py-6">
            {messages.length === 0 ? (
              <ConversationEmptyState
                className="h-full"
                icon={
                  <div className="relative">
                    <div className="rounded-2xl bg-primary/10 dark:bg-primary/5 p-4 border border-primary/20 dark:border-primary/10">
                      <Network className="size-8 text-primary" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 rounded-full bg-emerald-500 size-3 border-2 border-background" />
                  </div>
                }
                title="Asistente de Red Cisco"
                description="Pregunta sobre dispositivos, topologías, configuraciones IOS o diagnósticos de red. Puedes subir capturas de pantalla de tu red para análisis visual."
              >
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="relative">
                    <div className="rounded-2xl bg-primary/10 dark:bg-primary/5 p-5 border border-primary/20 dark:border-primary/10 shadow-lg shadow-primary/5">
                      <Network className="size-10 text-primary" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 rounded-full bg-emerald-500 size-3.5 border-2 border-background animate-pulse" />
                  </div>
                  <div className="space-y-1 text-center">
                    <h3 className="text-base font-semibold text-foreground">
                      Asistente de Red Cisco
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                      Gestiona, Configura y Monitorea tus redes Cisco con IA.
                    </p>
                  </div>
                  {/* Suggestion chips */}
                  <div className="flex flex-wrap gap-2 justify-center max-w-sm">
                    {[
                      "¿Qué dispositivos hay en la red?",
                      "Muestra la topología actual",
                      "Diagnóstica errores de red",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        id={`btn-suggestion-${suggestion.slice(0, 20)}`}
                        onClick={() => sendMessage(suggestion)}
                        className="px-3 cursor-pointer py-1.5 rounded-full text-xs border border-border/60 bg-muted/40 hover:bg-muted 
                        text-muted-foreground hover:text-foreground transition-all duration-150 hover:border-primary/30"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </ConversationEmptyState>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="space-y-2">

                  {/* Message */}
                  <Message from={msg.role === "user" ? "user" : "assistant"}>
                    {/* Avatar */}
                    <div
                      className={cn(
                        "flex items-start gap-3",
                        msg.role === "user" ? "flex-row-reverse" : "flex-row"
                      )}
                    >
                      <div
                        className={cn(
                          "size-7 shrink-0 mt-0.5 rounded-full flex items-center justify-center",
                          msg.role === "user"
                            ? "bg-primary/10 dark:bg-primary/15"
                            : "bg-muted"
                        )}
                      >
                        {msg.role === "user" ? (
                          <User size={20} className="text-primary" />
                        ) : (
                          <Bot size={20} className="text-muted-foreground" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Attached images (user messages) */}
                        {msg.images && msg.images.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2 justify-end">
                            {msg.images.map((imgUrl, idx) => (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                key={idx}
                                src={imgUrl}
                                alt={`Imagen adjunta ${idx + 1}`}
                                className="max-h-48 max-w-xs rounded-xl object-cover border border-border shadow-sm"
                              />
                            ))}
                          </div>
                        )}

                        {msg.contentBlocks && msg.contentBlocks.length > 0 ? (
                          <div className="space-y-4">
                            {msg.contentBlocks.map((block, idx) => {
                              if (block.type === "text") {
                                return (
                                  <MessageContent key={idx}>
                                    <MessageResponse>{block.content}</MessageResponse>
                                  </MessageContent>
                                );
                              } else if (block.type === "tool") {
                                return (
                                  <div key={block.id || idx} className="my-2 max-w-2xl">
                                    <ToolCardInline
                                      tool={{
                                        id: block.id,
                                        name: block.name,
                                        input: block.input,
                                        output: block.output,
                                        status: block.status,
                                      }}
                                      msgId={msg.id}
                                      onAction={actionApproval}
                                    />
                                  </div>
                                );
                              }
                              return null;
                            })}
                          </div>
                        ) : (
                          <>
                            {/* Tool Executions */}
                            {msg.tools && msg.tools.length > 0 && (
                              <div className="space-y-2 mb-2">
                                {msg.tools.map((tool) => (
                                  <ToolCardInline
                                    key={tool.id}
                                    tool={tool}
                                    msgId={msg.id}
                                    onAction={actionApproval}
                                  />
                                ))}
                              </div>
                            )}

                            <MessageContent>
                              {msg.role === "assistant" && !msg.content && isLoading ? (
                                <div className="flex items-center gap-2 py-1">
                                  <Cpu
                                    size={13}
                                    className="text-primary animate-pulse"
                                  />
                                  <div className="flex gap-1">
                                    <span className="size-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:0ms]" />
                                    <span className="size-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:150ms]" />
                                    <span className="size-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:300ms]" />
                                  </div>
                                </div>
                              ) : (
                                <MessageResponse>{msg.content}</MessageResponse>
                              )}
                            </MessageContent>
                          </>
                        )}

                        {/* Copy action for assistant */}
                        {msg.role === "assistant" && msg.content && (
                          <MessageActions className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <MessageAction
                                  id={`btn-copy-msg-${msg.id}`}

                                  onClick={() =>
                                    handleCopy(msg.content, msg.id)
                                  }
                                  className="h-6 w-6 cursor-pointer"
                                >
                                  {copiedMsgId === msg.id ? (
                                    <Check
                                      size={11}
                                      className="text-emerald-500"
                                    />
                                  ) : (
                                    <Copy size={11} />
                                  )}
                                </MessageAction>
                              </TooltipTrigger>
                              <TooltipContent side="bottom" className="text-xs">
                                {copiedMsgId === msg.id
                                  ? "¡Copiado!"
                                  : "Copiar"}
                              </TooltipContent>
                            </Tooltip>
                          </MessageActions>
                        )}
                      </div>
                    </div>
                  </Message>
                </div>
              ))
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        {/* Input Area */}
        <div className="border-t border-border/40 bg-background/95 backdrop-blur-sm px-4 py-3">
          <PromptInput
            accept="image/*"
            multiple
            onSubmit={handleSubmit}
            className="rounded-xl border border-border/60 bg-muted/30 shadow-sm focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20 transition-all duration-200"
          >
            {/* Image previews inside the input */}
            <PromptInputHeader>
              <AttachedImagePreviews />
            </PromptInputHeader>

            <PromptInputBody>
              <PromptInputTextarea
                placeholder="¿En qué puedo ayudarte con tu red?…"
                className="min-h-[52px] max-h-48 text-sm resize-none bg-transparent"
              />
            </PromptInputBody>

            <PromptInputFooter>
              <div className="flex items-center gap-1">
                {/* Attachment action menu */}
                <PromptInputActionMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <PromptInputActionMenuTrigger
                        id="btn-attach-menu"
                        className="h-7 w-7 cursor-pointer"
                        tooltip="Adjuntar imagen"
                      >
                        <Plus className="size-3.5" />
                      </PromptInputActionMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      Adjuntar imagen
                    </TooltipContent>
                  </Tooltip>
                  <PromptInputActionMenuContent>
                    <PromptInputActionAddAttachments label="Subir imagen" />
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>

                {/* Direct image upload button */}
                <Tooltip  >
                  <TooltipTrigger asChild>
                    <PromptInputButton
                      id="btn-upload-image"

                      className="h-7 w-7 cursor-pointer"
                      onClick={() => {
                        document.querySelector<HTMLInputElement>('input[type="file"]')?.click();
                      }}
                    >
                      <ImageIcon className="size-3.5" />
                    </PromptInputButton>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    Subir Imagen
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Right side: model badge + submit */}
              <div className="flex items-center gap-2">

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Badge
                      variant="outline"
                      className="px-2 h-5 font-mono hidden sm:flex items-center gap-1 text-muted-foreground border-border/50 cursor-pointer hover:bg-muted/50 select-none"
                    >
                      <Network size={8} />
                      <span>{selectedProvider || "Cisco Packet Tracer"}</span>
                      <ChevronDown size={8} className="opacity-60 ml-0.5" />
                    </Badge>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-44 font-mono text-xs">
                    {/* Opción 1: Cisco Packet Tracer */}
                    <DropdownMenuItem
                      onClick={() => setSelectedProvider("Cisco Packet Tracer")}
                      className="cursor-pointer flex items-center gap-2"
                    >
                      <Network size={8} />
                      Cisco Packet Tracer
                    </DropdownMenuItem>

                    {/* Opción 2: Cisco */}
                    <DropdownMenuItem
                      onClick={() => setSelectedProvider("Cisco")}
                      className="cursor-pointer flex items-center gap-2"
                    >
                      <Network size={8} />
                      Cisco
                    </DropdownMenuItem>

                    {/* Opción 3: Huawei */}
                    <DropdownMenuItem
                      onClick={() => setSelectedProvider("Huawei")}
                      className="cursor-pointer flex items-center gap-2"
                    >
                      <Network size={8} />
                      Huawei
                    </DropdownMenuItem>

                    {/* Opción 4: Aruba */}
                    <DropdownMenuItem
                      onClick={() => setSelectedProvider("Aruba")}
                      className="cursor-pointer flex items-center gap-2"
                    >
                      <Network size={8} />
                      Aruba
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>


                {/* <Badge
                  variant="outline"
                  className="px-2 h-5 font-mono hidden sm:flex items-center gap-1 text-muted-foreground border-border/50"
                >
                  <Network size={8} />
                  Cisco AI
                </Badge> */}



                <PromptInputSubmit
                  id="btn-send-message"
                  status={isLoading ? "streaming" : "ready"}
                  className="h-8 w-8 cursor-pointer"
                />
              </div>
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </TooltipProvider>
  );
}