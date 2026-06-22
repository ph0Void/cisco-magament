"use client";

import React from 'react'

import TopologyItems from './TopologyItems';
import { TopologyType } from '@/types/Topology';

interface TopologyTableProps {
    topologies: TopologyType[];
    onPageChange: (page: number) => void;
    paginationData: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        limit: number;
    };
}

export default function TopologyTable({ topologies, onPageChange, paginationData }: TopologyTableProps) {
    const { currentPage, totalPages, totalItems } = paginationData;

    return (
        <div className="space-y-4 w-full">
            <div className="overflow-x-auto border border-border rounded-lg shadow-sm bg-card custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-border bg-muted/50 text-muted-foreground uppercase text-xs font-semibold tracking-wider">
                            <th className="py-3.5 px-6">Name</th>
                            <th className="py-3.5 px-6">Description</th>
                            <th className="py-3.5 px-6"> Alert </th>
                            <th className="py-3.5 px-6">Create At</th>
                            <th className="py-3.5 px-6 text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {topologies.length > 0 ? (
                            topologies.map((topology) => (
                                <TopologyItems topology={topology} />
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className="py-8 text-center text-sm text-muted-foreground bg-card">
                                    No se encontraron logs disponibles.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginación */}
            <div className="flex items-center justify-between pt-2 px-1">
                <p className="text-xs text-muted-foreground">
                    Mostrando <span className="font-medium">{topologies.length}</span> de <span className="font-medium">{totalItems}</span> logs
                </p>

                <div className="flex space-x-2">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="px-3 py-1.5 rounded-md text-xs font-medium border border-border bg-card text-foreground transition-all hover:bg-muted disabled:opacity-50 disabled:pointer-events-none"
                    >
                        Previous
                    </button>

                    <span className="inline-flex items-center justify-center px-3 text-xs text-muted-foreground">
                        Pág. {currentPage} de {totalPages}
                    </span>

                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className="px-3 py-1.5 rounded-md text-xs font-medium border border-border bg-card text-foreground transition-all hover:bg-muted disabled:opacity-50 disabled:pointer-events-none"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    )
}