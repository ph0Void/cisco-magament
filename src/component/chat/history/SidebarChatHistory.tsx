"use client";

import React, { useState } from "react";
import { useChat } from "@/context/ChatContext";
import { type ChatSession } from "@/hooks/useCiscoChat";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MessageSquare,
  Plus,
  Trash2,
  Network,
  ChevronRight,
  Clock,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "Ahora";
  if (minutes < 60) return `Hace ${minutes}m`;
  if (hours < 24) return `Hace ${hours}h`;
  if (days < 7) return `Hace ${days}d`;
  return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
}

function groupSessionsByDate(sessions: ChatSession[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const groups: { label: string; sessions: ChatSession[] }[] = [
    { label: "Hoy", sessions: [] },
    { label: "Ayer", sessions: [] },
    { label: "Últimos 7 días", sessions: [] },
    { label: "Más antiguo", sessions: [] },
  ];

  for (const s of sessions) {
    const date = new Date(s.createdAt);
    date.setHours(0, 0, 0, 0);
    if (date.getTime() === today.getTime()) {
      groups[0].sessions.push(s);
    } else if (date.getTime() === yesterday.getTime()) {
      groups[1].sessions.push(s);
    } else if (date >= lastWeek) {
      groups[2].sessions.push(s);
    } else {
      groups[3].sessions.push(s);
    }
  }

  return groups.filter((g) => g.sessions.length > 0);
}

export default function SidebarChatHistory() {
  const {
    sessions,
    currentSessionId,
    loadChat,
    handleNewChat,
    handleDeleteChat,
    isLoading,
  } = useChat();

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = sessions.filter((s) =>
    (s.title ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );
  const grouped = groupSessionsByDate(filtered);

  return (
    <TooltipProvider>
      <div className="flex h-full flex-col gap-2 py-2">
        {/* New Chat Button */}
        <div className="px-2">
          <Button
            id="btn-new-chat"
            className="w-full cursor-pointer justify-start gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 dark:bg-primary/5 dark:hover:bg-primary/15 dark:border-primary/15 transition-all duration-200"
            variant="ghost"
            onClick={() => handleNewChat()}
            disabled={isLoading}
          >
            <Plus className="size-4 shrink-0" />
            <span className="truncate text-sm font-medium ">Nueva sesión</span>
          </Button>
        </div>

        {/* Search */}
        {sessions.length > 3 && (
          <div className="px-2 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-3 text-muted-foreground pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar conversación..."
              className="pl-7 h-8 text-xs bg-muted/50 border-border/50 focus-visible:ring-1"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        )}

        {/* Sessions count badge */}
        {sessions.length > 0 && (
          <div className="px-3 flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Historial
            </span>
            <Badge
              variant="secondary"
              className="text-[9px] px-1.5 py-0 h-4 font-mono"
            >
              {sessions.length}
            </Badge>
          </div>
        )}

        {/* Sessions List */}
        <ScrollArea className="flex-1 px-1">
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-8 text-center px-3">
              <div className="rounded-full bg-muted/60 p-3">
                <Network className="size-5 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-foreground">
                  Sin conversaciones
                </p>
                <p className=" text-muted-foreground leading-relaxed">
                  Inicia una sesión para comenzar a gestionar tu red Cisco
                </p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-xs text-muted-foreground">
                Sin resultados para &quot;{searchQuery}&quot;
              </p>
            </div>
          ) : (
            <div className="space-y-3 pb-2">
              {grouped.map((group) => (
                <div key={group.label}>
                  <p className="px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-1.5">
                    <Clock className="size-2.5" />
                    {group.label}
                  </p>
                  <div className="space-y-0.5">
                    {group.sessions.map((session) => {
                      const isActive = session.id === currentSessionId;
                      return (
                        <div
                          key={session.id}
                          className={cn(
                            "group relative flex items-center rounded-lg mx-1 transition-all duration-150 cursor-pointer",
                            isActive
                              ? "bg-accent text-accent-foreground"
                              : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                          )}
                          onClick={() => loadChat(session.id)}
                          id={`chat-session-${session.id}`}
                        >
                          {/* Active indicator */}
                          {isActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full bg-primary" />
                          )}

                          <div className="flex min-w-0 flex-1 items-center gap-2 px-2.5 py-2">
                            <MessageSquare
                              className={cn(
                                "size-3.5 shrink-0 transition-colors",
                                isActive
                                  ? "text-primary"
                                  : "text-muted-foreground group-hover:text-foreground"
                              )}
                            />
                            <div className="min-w-0 flex-1">
                              <p
                                className={cn(
                                  "truncate text-xs font-medium leading-tight",
                                  isActive
                                    ? "text-foreground"
                                    : "text-muted-foreground group-hover:text-foreground"
                                )}
                              >
                                {session.title?.substring(0, 20) ?? "Sin título"}
                              </p>
                              <p className="text-[9px] text-muted-foreground/60 mt-0.5">
                                {formatRelativeTime(new Date(session.createdAt))}
                              </p>
                            </div>

                          </div>

                          {/* Delete button */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                id={`btn-delete-session-${session.id}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteTarget(session.id);
                                }}
                                className="mr-1.5 cursor-pointer shrink-0 rounded p-1 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-150"
                              >
                                <Trash2 className="size-3" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="text-xs">
                              Eliminar conversación
                            </TooltipContent>
                          </Tooltip>

                          {isActive && (
                            <ChevronRight className="size-3 shrink-0 text-primary mr-1.5 opacity-60" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm  ">
              <Trash2 className="size-4 text-destructive" />
              Eliminar conversación
            </DialogTitle>
            <DialogDescription className="text-sm">
              Esta acción eliminará permanentemente la conversación y todos sus
              mensajes. No se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs cursor-pointer "
              onClick={() => setDeleteTarget(null)}
            >
              Cancelar
            </Button>
            <Button
              id="btn-confirm-delete"
              size="sm"
              className="h-8 cursor-pointer text-xs bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={() => {
                if (deleteTarget) {
                  handleDeleteChat(deleteTarget);
                  setDeleteTarget(null);
                }
              }}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
