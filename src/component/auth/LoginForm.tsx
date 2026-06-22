'use client'

import { FormState, loginAction } from '@/action/AuthAction';
import { useActionState, useEffect, useState } from 'react';
import { User, Lock, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const initialState: FormState = {
  success: false,
  message: '',
};

export default function LoginForm() {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  const [showPassword, setShowPassword] = useState(false);

    // Toast de error
    useEffect(() => {
        if (!isPending && state.message && !state.success) {
            toast.error(state.message);
        }
    }, [isPending, state.message, state.success]);

    // Toast de éxito + redirect
    useEffect(() => {
        if (state.success) {
            toast.success("Inicio de sesión exitoso");
            const id = setTimeout(() => {
                router.push("/dashboard");
            }, 500);
            return () => clearTimeout(id);
        }
    }, [state.success, state.message, router]);

  return (
    <form action={formAction} className="flex flex-col gap-5 w-full">
      {/* Campo Usuario */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="username" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Usuario:
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-400 transition-colors">
            <User className="h-5 w-5" />
          </div>
          <input 
            type="text" 
            id="username" 
            name="username" 
            required
            placeholder="Introduce tu usuario"
            className="block w-full pl-11 pr-4 py-3 bg-slate-950/40 border border-slate-800/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all duration-200 text-sm"
          />
        </div>
      </div>

      {/* Campo Contraseña */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Contraseña:
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-400 transition-colors">
            <Lock className="h-5 w-5" />
          </div>
          <input 
            type="password" 
            id="password" 
            name="password" 
            required
            placeholder="••••••••"
            className="block w-full pl-11 pr-4 py-3 bg-slate-950/40 border border-slate-800/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all duration-200 text-sm"
          />
        </div>
      </div>

      {/* Botón de Enviar */}
      <button 
        type="submit" 
        disabled={isPending}
        className="relative group w-full mt-2 py-3 px-4 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-sky-500/10 hover:shadow-sky-500/20 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
      >
        {isPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Verificando credenciales...</span>
          </>
        ) : (
          <>
            <span>Iniciar Sesión</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>

      {/* Mensajes de Feedback de Servidor */}
      {state.message && (
        <div className={`mt-2 p-3.5 rounded-xl border flex items-start gap-3 text-sm animate-in fade-in slide-in-from-top-1 duration-200 ${
          state.success 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
            : "bg-rose-500/10 border-rose-500/20 text-rose-400"
        }`}>
          {state.success ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <span>{state.message}</span>
        </div>
      )}
    </form>
  );
}