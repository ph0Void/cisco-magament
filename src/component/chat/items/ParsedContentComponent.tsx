"use client";

import { MessageResponse } from "@/components/ai-elements/message";
import { Copy, Check, Terminal } from "lucide-react";

interface ParsedContentProps {
  text: string;
  msgId: string;
  onCopy: (text: string) => void;
  copied: boolean;
}

export function ParsedContentComponent({ text, msgId, onCopy, copied }: ParsedContentProps) {
  return (
    <div className="relative group/content">
      <button
        onClick={() => onCopy(text)}
        title="Copiar respuesta"
        className="absolute -top-1 right-0 opacity-0 group-hover/content:opacity-100 transition-opacity flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 z-10"
      >
        {copied ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
        {copied ? "Copiado" : "Copiar"}
      </button>

      <div className="prose-cisco">
        <MessageResponse>{text}</MessageResponse>
      </div>
    </div>
  );
}
