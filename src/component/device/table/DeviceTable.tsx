"use client";

import React from 'react'

import { Device } from '@/types';
import DeviceItems from './DeviceItems';

interface LogTableProps {
    devices: Device[];
    onPageChange: (page: number) => void;
    paginationData: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        limit: number;
    };
}

export default function DeviceTable({ devices, onPageChange, paginationData }: LogTableProps) {
    const { currentPage, totalPages, totalItems } = paginationData;

    return (
        <div className="space-y-4 w-full">
            <div className="overflow-x-auto border border-border rounded-lg shadow-sm bg-card custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-border bg-muted/50 text-muted-foreground uppercase text-xs font-semibold tracking-wider">
                            <th className="py-3.5 px-6">Id</th>
                            <th className="py-3.5 px-6">Name</th>
                            <th className="py-3.5 px-6">Type</th>
                            <th className="py-3.5 px-6">Model</th>
                            <th className="py-3.5 px-6">Status</th>
                            <th className="py-3.5 px-6">Power</th>
                            {/* <th className="py-3.5 px-6">Gateway</th> */}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">

                        {devices.length > 0 ? (
                            devices.map((device) => (
                                <DeviceItems key={device.id} device={device} />
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="py-8 text-center text-sm text-muted-foreground bg-card">
                                    No se encontraron dispositivos disponibles.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginación */}
            <div className="flex items-center justify-between pt-2 px-1">
                <p className="text-xs text-muted-foreground">
                    Mostrando <span className="font-medium">{devices.length}</span> de <span className="font-medium">{totalItems}</span> dispositivos
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