import React from "react";
 import { Cpu } from "lucide-react";
import LoginForm from "@/component/auth/LoginForm";

export default function AuthPage() {
  return (
    <div className="w-full flex flex-col items-center relative">
      {/* Glow tecnológico de fondo */}
      <div className="absolute -top-40 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute -bottom-40 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Tarjeta principal de Login (Glassmorphism con bordes limpios) */}
      <div className="w-full bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-2xl relative z-10">
        
        {/* Cabecera del Login */}
        <div className="flex flex-col items-center mb-8">
          {/* Logo animado estilo Cisco */}
          <div className="w-12 h-12 bg-gradient-to-b from-sky-500/25 to-sky-500/5 border border-sky-500/30 rounded-xl flex items-center justify-center text-sky-400 mb-4 shadow-[0_0_20px_rgba(14,165,233,0.15)]">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Cisco <span className="text-sky-400">Management</span>
          </h1>
          
          <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mt-1.5 bg-slate-950/60 px-2.5 py-0.5 rounded border border-slate-800/50">
            Network Operations Center
          </p>
        </div>

        {/* Componente del Formulario */}
        <div className="w-full">
          <LoginForm />
        </div>

      </div>

      {/* Footer corporativo */}
      <div className="mt-8 text-center z-10">
        <p className="text-[9px] text-slate-500 font-mono tracking-wider uppercase">
          CISCO MANAGEMENT SOLUTIONS
        </p>
        <p className="text-[9px] text-slate-600 font-mono mt-0.5">
          &copy; {new Date().getFullYear()}. ALL RIGHTS RESERVED
        </p>
      </div>
    </div>
  );
}