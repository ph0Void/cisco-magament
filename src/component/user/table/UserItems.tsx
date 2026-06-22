"use client";

import { UserTypes } from '@/types/User';
import { formatDate } from '@/utils/FormatDate';
import { Edit2, Trash2, UserCheck } from 'lucide-react';

interface UserItemsProps {
    user: UserTypes;
    onEdit: (user: UserTypes) => void;
    onDelete: (id: string, username: string) => void;
}

export default function UserItems({ user, onEdit, onDelete }: UserItemsProps) {
    let badgeStyle = "bg-muted border-border text-muted-foreground";
    if (user.role === "ADMIN") {
        badgeStyle = "bg-rose-500/10 border-rose-500/20 text-rose-500 dark:text-rose-400";
    } else if (user.role === "STAFF") {
        badgeStyle = "bg-sky-500/10 border-sky-500/20 text-sky-500 dark:text-sky-400";
    }

    return (
        <tr className="hover:bg-muted/40 transition-colors bg-card">
            <td className="py-4 px-6 text-sm text-foreground font-semibold whitespace-nowrap inline-flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-muted-foreground" />
                {user.username}
            </td>

            <td className="py-4 px-6 text-sm whitespace-nowrap">
                <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${badgeStyle}`}>
                    {user.role}
                </span>
            </td>

            <td className="py-4 px-6 text-sm text-muted-foreground whitespace-nowrap">
                {formatDate(user.createAt)}
            </td>

            <td className="py-4 px-6 text-sm whitespace-nowrap">
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => onEdit(user)}
                        className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-sky-500 hover:border-sky-500/30 transition-all"
                        title="Editar Operador"
                    >
                        <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => onDelete(user.id, user.username)}
                        className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-rose-500 hover:border-rose-500/30 transition-all"
                        title="Eliminar Operador"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </td>
        </tr>
    );
}