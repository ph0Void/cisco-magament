
import CardInfo from "@/component/dashboard/CardInfo";

export default function HomePage() {
    return (
        <div className="space-y-4 text-foreground p-4">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Monitoreo General de Red</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Estado actual de los equipos gestionados en Cisco Packet Tracer.
                </p>
            </div>

            {/*  Tarjetas Informativas */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <CardInfo />
            </div>

            {/* Panel de Estado del Puente */}
            <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div>
                        <p className="text-sm font-semibold">Estado de Comunicación (PT Bridge)</p>
                    </div>
                </div>
                <div className="text-xs px-3 py-1 rounded-full font-mono font-bold bg-muted border border-border">
                    <span className="text-rose-400">DESCONECTADO</span>
                </div>
            </div>

        </div>
    );
}