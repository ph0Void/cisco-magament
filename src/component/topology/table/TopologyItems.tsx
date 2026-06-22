"use client";

import { TopologyType } from '@/types/Topology';
import { formatDate } from '@/utils/FormatDate';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

interface LogItemsProps {
    topology: TopologyType;
}

export default function TopologyItems({ topology }: LogItemsProps) {

    return (
        <tr className="hover:bg-muted/40 transition-colors bg-card">
            <td className="py-4 px-6 text-sm text-muted-foreground whitespace-nowrap">
                {topology.name}
            </td>

            <td className="py-4 px-6 text-sm whitespace-nowrap text-muted-foreground">
                {topology.description || "Sin descripción"}
            </td>


            <td className="py-4 px-6 text-sm text-foreground font-medium max-w-md break-words">
                {topology.alerts?.length ?? 0}
            </td>
            <td className="py-4 px-6 text-sm text-foreground font-medium max-w-md break-words">
                {formatDate(topology.createdAt)}
            </td>
            <td className="py-4 px-6 text-sm text-right whitespace-nowrap">
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1 cursor-pointer" asChild>
                    <Link href={`/dashboard/workspace/${topology.id}`}>
                        <Play className="h-3 w-3 fill-current" />
                        Cargar
                    </Link>
                </Button>
            </td>
        </tr>
    );
}