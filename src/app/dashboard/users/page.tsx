import React from 'react'
import { getAllUsersAction } from '@/action/UserAction';
import TableUserWrapper from '@/component/user/TableUserWrapper';

interface PageProps {
    searchParams: Promise<{ page?: string; limit?: string }>;
}

export default async function UserPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const currentPage = Number(params.page) || 1;
    const currentLimit = Number(params.limit) || 10;

    const result = await getAllUsersAction(currentPage, currentLimit);

    const rawUsers = result.success && result.data ? result.data : [];
    const users = rawUsers.map((u: any) => ({
        id: u.id,
        username: u.username,
        role: u.role,
        createAt: u.createdAt ? u.createdAt.toISOString() : new Date().toISOString()
    }));

    const totalItems = users.length; // Si tu servicio implementa un count global, sustituir aquí
    const totalPages = Math.ceil(totalItems / currentLimit) || 1;

    return (
        <div className="space-y-6 text-foreground p-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Gestión de Usuarios
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Administrar accesos, credenciales y privilegios del NOC.
                </p>
            </div>

            {/* Wrapper de la tabla con los estados de cliente */}
            <TableUserWrapper
                initialUsers={users}
                pagination={{
                    currentPage,
                    totalPages,
                    totalItems,
                    limit: currentLimit
                }}
            />
        </div>
    )
}