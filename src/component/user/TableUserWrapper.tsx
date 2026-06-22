"use client";

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation';
import UserTable from './table/UserTable';
import ModalUser from './ModalUser';
import { UserTypes } from '@/types/User';
import { deleteUserAction } from '@/action/UserAction';
import { UserPlus, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface TableUserWrapperProps {
    initialUsers: UserTypes[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        limit: number;
    };
}

export default function TableUserWrapper({ initialUsers, pagination }: TableUserWrapperProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Estados del modal 
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const [selectedUser, setSelectedUser] = useState<UserTypes | null>(null);

    const handlePageChange = (page: number) => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        current.set('page', page.toString());
        router.push(`/dashboard/users?${current.toString()}`);
    };

    const handleOpenCreate = () => {
        setModalMode("create");
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (user: UserTypes) => {
        setModalMode("edit");
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleDeleteUser = async (id: string, username: string) => {
        if (!confirm(`¿Eliminar al operador ${username}? Esta acción borrará todas sus asociaciones.`)) {
            return;
        }

        try {
            const res = await deleteUserAction(id);
            if (res.success) {
                toast.success("Operador eliminado correctamente.");
                router.refresh();
            } else {
                toast.error(res.message || "No se pudo eliminar al operador.");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error al procesar la eliminación.");
        }
    };

    return (
        <div className="space-y-6">
            {/* Cabecera Interna de Control */}
            <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-sky-500" />
                    <div>
                        <p className="text-sm font-semibold text-foreground">Operadores de Red</p>
                        <p className="text-xs text-muted-foreground">Listado general de cuentas del NOC</p>
                    </div>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 transition-all"
                >
                    <UserPlus className="w-4 h-4" />
                    Registrar Operador
                </button>
            </div>

            {/* Tabla de Datos */}
            <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
                <UserTable
                    users={initialUsers}
                    onPageChange={handlePageChange}
                    onEditUser={handleOpenEdit}
                    onDeleteUser={handleDeleteUser}
                    paginationData={pagination}
                />
            </div>

            {/* Modal Único para Crear / Editar */}
            <ModalUser
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                mode={modalMode}
                userToEdit={selectedUser}
                onSuccess={() => router.refresh()}
            />
        </div>
    );
}