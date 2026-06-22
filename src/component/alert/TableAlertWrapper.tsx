"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { deleteAlertAction } from "@/action/AlertAction";
import AlertTable from "./table/AlertTable";
import ModalAlert from "./ModalAlert";

interface Alert {
    id: string;
    title: string;
    description: string;
    severity: string;
    resolved: boolean;
    createdAt: string | Date;
    topologyId: string;
    topology?: { name: string };
    user?: { username: string };
}

interface TableAlertWrapperProps {
    initialAlerts: Alert[];
    topologies: { id: string; name: string }[];
    userRole: string;
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        limit: number;
    };
}

export default function TableAlertWrapper({ initialAlerts, topologies, userRole, pagination }: TableAlertWrapperProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [filter, setFilter] = useState("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

    const handlePageChange = (page: number) => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        current.set("page", page.toString());
        router.push(`/dashboard/alert?${current.toString()}`);
    };

    const handleOpenCreate = () => {
        setModalMode("create");
        setSelectedAlert(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (alert: Alert) => {
        setModalMode("edit");
        setSelectedAlert(alert);
        setIsModalOpen(true);
    };

    const handleDeleteAlert = async (id: string) => {
        if (!confirm("¿Eliminar de forma permanente esta alerta del sistema?")) return;

        try {
            const res = await deleteAlertAction(id);
            if (res.succes) {
                toast.success("Alerta eliminada del sistema.");
            } else {
                toast.error(res.message || "No se pudo eliminar la alerta.");
            }
        } catch (err) {
            toast.error("Error al procesar la eliminación.");
        }
    };

    const filteredAlerts = initialAlerts.filter((a) => {
        if (filter === "all") return true;
        if (filter === "active") return !a.resolved;
        if (filter === "resolved") return a.resolved;
        return a.severity.toUpperCase() === filter.toUpperCase();
    });

    return (
        <div className="space-y-6">
            {/* Cabecera Interna de Control */}
            <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <ShieldAlert className="w-5 h-5 text-rose-500" />
                    <div>
                        <p className="text-sm font-semibold text-foreground">Registro de Incidencias</p>
                        <p className="text-xs text-muted-foreground">Listado de eventos anomalos en topologías</p>
                    </div>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-sky-500 hover:bg-sky-400 dark:bg-sky-600 dark:hover:bg-sky-500 text-slate-950 dark:text-white transition-all shadow-sm cursor-pointer"
                >
                    <AlertTriangle className="w-4 h-4" />
                    Reportar Incidencia
                </button>
            </div>

            {/* Selectores de Filtro de UI adaptables */}
            <div className="flex flex-wrap gap-1.5 p-3 rounded-xl border border-border bg-muted/40">
                {["all", "active", "resolved", "critical", "warning", "info"].map((type) => (
                    <button
                        key={type}
                        onClick={() => setFilter(type)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase border transition-all cursor-pointer ${filter === type
                                ? "bg-rose-500/10 border-rose-500/35 text-rose-600 dark:text-rose-400"
                                : "bg-card border-border text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        {type === "all" ? "Todas" : type === "active" ? "Activas" : type === "resolved" ? "Resueltas" : type}
                    </button>
                ))}
            </div>

            {/* Tabla de Datos */}
            <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
                <AlertTable
                    alerts={filteredAlerts}
                    userRole={userRole}
                    onPageChange={handlePageChange}
                    onEditAlert={handleOpenEdit}
                    onDeleteAlert={handleDeleteAlert}
                    paginationData={pagination}
                />
            </div>

            {/* Modal CRUD Unificado */}
            <ModalAlert
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                mode={modalMode}
                alertToEdit={selectedAlert}
                topologies={topologies}
            />
        </div>
    );
}