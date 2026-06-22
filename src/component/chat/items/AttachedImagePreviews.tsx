"use client";

import { usePromptInputAttachments } from "@/components/ai-elements/prompt-input";
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

export default function AttachedImagePreviews() {
    const attachments = usePromptInputAttachments();

    if (attachments.files.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2 px-2 pt-2">
            {attachments.files.map((file) => (
                <div key={file.id} className="relative group/img">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={file.url}
                        alt={file.filename}
                        className="size-14 rounded-lg object-cover border border-border ring-1 ring-border/50"
                    />
                    <button
                        id={`btn-remove-attachment-${file.id}`}
                        type="button"
                        onClick={() => attachments.remove(file.id)}
                        className="absolute cursor-pointer -top-1.5 -right-1.5 size-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity shadow-sm"
                    >
                        <X size={9} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-black/60 px-1 py-0.5 opacity-0 group-hover/img:opacity-100 transition-opacity">
                        <p className="truncate text-[10px] text-white">{file.filename}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}