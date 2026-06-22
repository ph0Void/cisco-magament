import React from 'react'
import { redirect } from "next/navigation";

export default function PageIndex() {
  redirect('/auth');
  return (
    <div>
      <h1 className="text-3xl font-bold underline">
        Bienvenido a Cisco Dashboard
      </h1>
      <p className="mt-4 text-lg">
        Proyecto academico de gestión de topología de red con Cisco Packet Tracer
        utilizando una pagina web e IA para análisis y recomendaciones.
      </p>
    </div>
  )
} 