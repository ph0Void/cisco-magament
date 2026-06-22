import React from 'react'

interface AuthLayoutProps {
    children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 flex overflow-hidden">
            {/* Lado izquierdo - Formulario de autenticación */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 relative z-10">
                <div className="w-full max-w-md">
                    {children}
                </div>
            </div>

            {/* Lado derecho - Imagen de fondo con overlay degradado estilo Cisco */}
            <div
                className="hidden lg:block lg:w-1/2 relative bg-cover bg-center"
                style={{ backgroundImage: "url('/auth.jpg')" }}
            >
                {/* Degradado para fusionar la imagen con la marca Cisco */}
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900/80 to-sky-950/40" />
                
                {/* Elementos decorativos de red en la imagen */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.15),transparent_60%)]" />

                <div className="relative h-full flex flex-col items-start justify-end p-16 z-10">
                    <div className="max-w-xl">
                        <span className="text-sky-400 font-mono text-xs uppercase tracking-widest bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20 mb-4 inline-block">
                            Enterprise Solution
                        </span>
                        <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight tracking-tight mb-4 drop-shadow-md">
                            Cisco Management
                        </h2>
                        <div className="w-20 h-1 bg-gradient-to-r from-sky-500 to-indigo-500 rounded mb-6" />
                        <p className="text-slate-300 text-base xl:text-lg leading-relaxed font-normal">
                            Plataforma unificada para el diseño, monitoreo y análisis en tiempo real de topologías de red críticas.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    )
}