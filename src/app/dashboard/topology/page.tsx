import { getAllTopologiesAction } from "@/action/TopologyAction";
import TableTopologyWrapper from "@/component/topology/TableTopologyWrapper";



interface PageProps {
    searchParams: Promise<{ page?: string; limit?: string }>;
}

export default async function TopologyPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const currentPage = Number(params.page) || 1;
    const currentLimit = Number(params.limit) || 10;

    const result = await getAllTopologiesAction(currentPage, currentLimit);

    const topologies = result.success && result.data ? result.data : [];
    const totalItems = result.total || 0;
    const totalPages = Math.ceil(totalItems / currentLimit) || 1;

    return (
        <div className="space-y-4 text-foreground p-4">
            {/* Header */}
            <div   >
                <h1 className="text-2xl font-bold tracking-tight">
                    Gestión de Topologías
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Gestión de las topologías que se generan en la red.
                </p>
            </div>

            {/* Contenedor Principal */}
            <div  >
                <TableTopologyWrapper
                    initialTopologies={topologies}
                    pagination={{
                        currentPage,
                        totalPages,
                        totalItems,
                        limit: currentLimit
                    }}
                />
            </div>
        </div>
    )
}