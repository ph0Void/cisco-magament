"use client";

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCiscoSocket } from '@/hooks/useCiscoSocket';
import DeviceTable from './table/DeviceTable';

interface TableDeviceWrapperProps {
    initialPagination: {
        currentPage: number;
        limit: number;
    };
}

export default function TableDeviceWrapper({ initialPagination }: TableDeviceWrapperProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const { devices, status, isConnected } = useCiscoSocket();

    const { currentPage, limit } = initialPagination;
    const totalItems = devices.length;
    const totalPages = Math.ceil(totalItems / limit) || 1;

    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedDevices = devices.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        current.set('page', page.toString());

        const search = current.toString();
        const query = search ? `?${search}` : '';

        router.push(`/dashboard/device${query}`);
    };

    return (
        <DeviceTable
            devices={paginatedDevices}
            onPageChange={handlePageChange}
            paginationData={{
                currentPage,
                totalPages,
                totalItems,
                limit
            }}
        />
    );
}