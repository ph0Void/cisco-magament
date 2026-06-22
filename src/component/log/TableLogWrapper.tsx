"use client";

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation';
import LogTable from './table/LogTable';
import { LogType } from '@/types/Logs';

interface TableLogWrapperProps {
    initialLogs: LogType[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        limit: number;
    };
}

export default function TableLogWrapper({ initialLogs, pagination }: TableLogWrapperProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handlePageChange = (page: number) => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        current.set('page', page.toString());

        const search = current.toString();
        const query = search ? `?${search}` : '';

        router.push(`/dashboard/log${query}`);
    };

    return (
        <div className="w-full">
            <LogTable
                logs={initialLogs}
                onPageChange={handlePageChange}
                paginationData={pagination}
            />
        </div>
    );
}