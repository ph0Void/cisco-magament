import React from "react";
import TableDeviceWrapper from "@/component/device/TableDeviceWrapper";

interface PageProps {
  searchParams: Promise<{ page?: string; limit?: string }>;
}

export default async function DevicePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const currentLimit = Number(params.limit) || 10;

  return (
    <div className="space-y-4 text-foreground p-4">
      {/* Header */}
      <div   >
        <h1 className="text-2xl font-bold tracking-tight">
          Gestión de Dispositivos
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestión de los dispositivos conectados a la red en tiempo real.
        </p>
      </div>

      {/* Contenedor Principal */}
      <div  >
        <TableDeviceWrapper
          initialPagination={{
            currentPage,
            limit: currentLimit
          }}
        />
      </div>
    </div>
  );
}