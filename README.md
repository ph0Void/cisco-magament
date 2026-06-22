# 🤖 Cisco Network Control Center (Cisco Management System)

Sistema avanzado de gestión, monitorización en tiempo real y automatización de redes en **Cisco Packet Tracer** mediante un **Agente de Inteligencia Artificial**. 

Este proyecto unifica el mundo de las redes y el desarrollo de software moderno, permitiendo interpretar topologías mediante lenguaje natural o diagramas, inyectar configuraciones automáticamente en Packet Tracer, estructurar direccionamientos IP y auditar la infraestructura mediante un manejador de logs centralizado en tiempo real.

📺 **Mira el proyecto en acción aquí:** 

https://github.com/user-attachments/assets/a1c13731-7216-4157-b088-6335641caca7


 

## 🚀 Características Principales

* 🧠 **Agente de Red Inteligente (IA):** Integra modelos LLM (Google/OpenAI) a través de LangChain para procesar instrucciones en lenguaje natural o planos de red, generando de forma autónoma la arquitectura de red y el direccionamiento IP óptimo.
* ⚡ **Automatización y Despliegue en Vivo:** Orquestación automática en Cisco Packet Tracer que posiciona dispositivos, calcula interfaces y realiza el cableado físico (`CREATE`, `LINK`, `CONFIGURE`) sin intervención manual.
* 🔄 **Monitorización en Tiempo Real:** Panel interactivo conectado mediante WebSockets (`Socket.io`) para reflejar instantáneamente cambios de estado (Online/Offline) en dispositivos y enlaces de la topología activa.
* 📋 **Auditoría y Log Management:** Sistema completo de traza de comandos inyectados en la infraestructura para control de cambios, diagnóstico de fallos y solución de errores (Troubleshooting).
* 💾 **Persistencia de Datos Robusta:** Almacenamiento local ultrarrápido utilizando SQLite administrado a través de Prisma ORM para guardar el inventario de dispositivos y configuraciones históricas.

## 🛠️ Stack Tecnológico

### Frontend & Backend (Fullstack)
* **Next.js 16** & **React 19** (App Router & Server Actions)
* **Tailwind CSS** & **Shadcn/ui** (Interfaz moderna y responsiva)
* **Zustand** (Gestión de estado global eficiente)

### Inteligencia Artificial & Agentes
* **LangChain Core** & **Vercel AI SDK**
* **LangChain Google / OpenAI** integration

### Comunicación Real-Time & Infraestructura
* **Express** & **Socket.io** (Servidor WebSocket)
* **Prisma ORM** con adaptador para **Better-SQLite3**
* **TypeScript** (Tipado estricto en todo el proyecto)

## ⚙️ Instalación y Configuración

### Prerrequisitos
* Node.js (versión 18 o superior recomendada)
* Cisco Packet Tracer (con el entorno de scripting/API WebSocket configurado)

### Pasos para el Despliegue

1. **Clonar el repositorio:**
   ```bash
   git clone [https://github.com/ph0Void/cisco-magament.git](https://github.com/ph0Void/cisco-magament.git)
   cd cisco-magament
