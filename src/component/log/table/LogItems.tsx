"use client";

import { LogType } from '@/types/Logs';
import { formatDate } from '@/utils/FormatDate';

interface LogItemsProps {
    log: LogType;
}

export default function LogItems({ log }: LogItemsProps) {
    const getLevelBadgeClass = (level: string) => {
        const lvl = level.toLowerCase();
        if (lvl === 'error' || lvl === 'critical') return 'text-destructive font-bold';
        if (lvl === 'warn' || lvl === 'warning') return 'text-amber-500 font-semibold';
        return 'text-muted-foreground';
    };

    return (
        <tr className="hover:bg-muted/40 transition-colors bg-card">
            <td className="py-4 px-6 text-sm text-muted-foreground whitespace-nowrap">
                {formatDate(log.createdAt)}
            </td>

            <td className="py-4 px-6 text-sm whitespace-nowrap">
                <span className={`inline-block ${getLevelBadgeClass(log.level)}`}>
                    [{log.level.toUpperCase()}]
                </span>
            </td>

            <td className="py-4 px-6 text-sm text-foreground font-medium max-w-md break-words">
                {log.content}
            </td>
        </tr>
    );
}