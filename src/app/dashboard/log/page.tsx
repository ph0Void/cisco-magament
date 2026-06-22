import { getAllLogsAction } from '@/action/LogAction'
import TableLogWrapper from '@/component/log/TableLogWrapper'
import { LogType } from '@/types/Logs';
import React from 'react'

interface PageProps {
    searchParams: Promise<{ page?: string; limit?: string }>;
}

export default async function LogPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const currentPage = Number(params.page) || 1;
    const currentLimit = Number(params.limit) || 10;

    const result = await getAllLogsAction(currentPage, currentLimit);

    const logs = result.success && result.data ? result.data : [];
    const totalItems = result.total || 0;
    const totalPages = Math.ceil(totalItems / currentLimit) || 1;

    return (
        <div className="space-y-4 text-foreground p-4">
            {/* Header */}
            <div   >
                <h1 className="text-2xl font-bold tracking-tight">
                    Gestión de Logs
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Gestión de las logs que se generan en la red.
                </p>
            </div>

            {/* Contenedor Principal */}
            <div  >
                <TableLogWrapper
                    initialLogs={logs}
                    pagination={{
                        currentPage,
                        totalPages,
                        totalItems,
                        limit: currentLimit
                    }}
                />
            </div>
        </div>
    )
}