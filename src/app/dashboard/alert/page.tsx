import React from "react";
import { alertService } from "@/service/AlertService";
import { getUserByToken } from "@/service/AuthService";
import { getCookieToken } from "@/utils/CookieHelper";
import { prismaClient } from "@/prisma/lib/PrismaClient";
import TableAlertWrapper from "@/component/alert/TableAlertWrapper";

interface PageProps {
    searchParams: Promise<{ page?: string; limit?: string }>;
}

export default async function AlertPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const currentPage = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;

    const token = await getCookieToken();
    const user = await getUserByToken(token || "");
    const userId = user.data?.id || "";

    const alertResult = await alertService.getAllByUser(userId, currentPage, limit);

    const totalItems = await prismaClient.alert.count({
        where: (user.data?.role === "ADMIN" || user.data?.role === "STAFF") ? {} : { userId }
    });

    const topologiesRaw = await prismaClient.topology.findMany({
        select: { id: true, name: true },
    });

    const alerts = alertResult.succes && alertResult.data ? alertResult.data : [];
    const totalPages = Math.ceil(totalItems / limit) || 1;

    return (
        <div className="space-y-6 text-foreground p-1">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Gestión de Alertas
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Registro, auditoría y resolución de incidencias en los laboratorios de red.
                </p>
            </div>

            <TableAlertWrapper
                initialAlerts={alerts as any}
                topologies={topologiesRaw}
                userRole={user.data?.role || "CLIENT"}
                pagination={{
                    currentPage,
                    totalPages,
                    totalItems,
                    limit,
                }}
            />
        </div>
    );
}