"use client";

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation';
import TopologyTable from './table/TopologyTable';
import { TopologyType } from '@/types/Topology';

interface TableTopologyWrapperProps {
    initialTopologies: TopologyType[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        limit: number;
    };
}

export default function TableTopologyWrapper({ initialTopologies, pagination }: TableTopologyWrapperProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handlePageChange = (page: number) => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        current.set('page', page.toString());

        const search = current.toString();
        const query = search ? `?${search}` : '';

        router.push(`/dashboard/topology${query}`);
    };

    return (
        <TopologyTable
            topologies={initialTopologies}
            onPageChange={handlePageChange}
            paginationData={pagination}
        />
    );
}