"use client";

import { Device } from '@/types';

interface DeviceItemsProps {
    device: Device;
}

export default function DeviceItems({ device }: DeviceItemsProps) {
    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'online':
                return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
            case 'error':
                return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
            default:
                return 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20';
        }
    };

    return (
        <tr className="hover:bg-muted/40 transition-colors bg-card">
            <td className="py-4 px-6 text-sm text-muted-foreground font-mono whitespace-nowrap">
                {device.id}
            </td>

            <td className="py-4 px-6 text-sm font-semibold text-foreground whitespace-nowrap">
                {device.name}
            </td>

            <td className="py-4 px-6 text-sm text-muted-foreground whitespace-nowrap capitalize">
                {device.type}
            </td>

            <td className="py-4 px-6 text-sm text-muted-foreground whitespace-nowrap font-mono">
                {device.model}
            </td>

            <td className="py-4 px-6 text-sm whitespace-nowrap">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium uppercase ${getStatusStyles(device.status)}`}>
                    {device.status}
                </span>
            </td>

            <td className="py-4 px-6 text-sm whitespace-nowrap">
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${device.power ? 'text-emerald-400' : 'text-rose-400'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${device.power ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    {device.power ? "Encendido" : "Apagado"}
                </span>
            </td>

            {/* <td className="py-4 px-6 text-sm text-muted-foreground font-mono whitespace-nowrap">
                {device.gateway || "N/A"}
            </td> */}
        </tr>
    );
}