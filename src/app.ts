import express, { Request, Response } from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

const PORT = 7531;

interface ToolCallData {
  tool_call_id: string;
  tool_name: string;
  tool_input: Record<string, any>;
}

interface ToolResultData {
  tool_call_id: string;
  result: any;
}

nextApp.prepare().then(() => {
  const app = express();

  const server = createServer(app);

  const io = new Server(server, {
    cors: { origin: "*" },
  });

  let ptSocket: Socket | null = null;
  const clientSockets = new Map<string, Socket>();

  const pendingRequests = new Map<string, Response>();

  io.on("connection", (socket: Socket) => {
    // Log para identificar qué tipo de cliente se está conectando
    const userAgent = socket.handshake.headers["user-agent"] || "";
    const isPacketTracer =
      socket.handshake.query.clientType === "packet-tracer" ||
      userAgent.includes("Qt");

    if (isPacketTracer) {
      console.log(
        `✅ Extensión de Packet Tracer conectada por WebSocket [ID: ${socket.id}]`,
      );
      ptSocket = socket;
    } else {
      console.log(
        `🔌 Cliente del Dashboard / Agente de IA conectado [ID: ${socket.id}]`,
      );
      socket.join("dashboard-room");
      clientSockets.set(socket.id, socket);
    }

    /**
     * 1. EVENTO: tool_call (Enviado desde CiscoClient en el Dashboard hacia Packet Tracer)
     * El agente de IA solicita ejecutar una acción física en la topología.
     */
    socket.on("tool_call", (data: ToolCallData) => {
      console.log(
        `📥 Solicitud de herramienta recibida [${data.tool_name}] (ID: ${data.tool_call_id})`,
      );

      if (ptSocket && ptSocket.connected) {
        // Reenviar la solicitud de herramienta directamente a la extensión de Packet Tracer
        console.log(
          `🔄 Reenviando [${data.tool_name}] a la interfaz activa de Packet Tracer...`,
        );
        ptSocket.emit("tool_call", data);
      } else {
        console.error(
          `❌ Error: Packet Tracer no está conectado. No se puede ejecutar: ${data.tool_name}`,
        );

        // Responder inmediatamente con error para evitar que el cliente de IA se quede en timeout
        const errorResult: ToolResultData = {
          tool_call_id: data.tool_call_id,
          result: {
            success: false,
            error:
              "La extensión de Cisco Packet Tracer se encuentra desconectada del servidor puente.",
          },
        };
        socket.emit("tool_result", errorResult);
      }
    });

    /**
     * 2. EVENTO: tool_result (Retornado por la extensión de Packet Tracer tras ejecutar el script)
     * Enviamos los resultados de vuelta al agente de IA o a la petición HTTP de Express.
     */
    socket.on("tool_result", (data: ToolResultData) => {
      console.log(
        `🔄 Resultado de herramienta recibido desde Packet Tracer para ID: ${data.tool_call_id}`,
      );

      // A) Si fue una solicitud iniciada por una llamada HTTP tradicional
      if (data && data.tool_call_id && pendingRequests.has(data.tool_call_id)) {
        const res = pendingRequests.get(data.tool_call_id);
        if (res) {
          res.json(data.result);
          pendingRequests.delete(data.tool_call_id);
        }
      }

      // B) Retransmitir el resultado a todos los agentes de IA conectados mediante Socket.io
      io.emit("tool_result", data);
    });

    // Evento de desconexión
    socket.on("disconnect", () => {
      if (ptSocket?.id === socket.id) {
        console.log("❌ Extensión de Cisco Packet Tracer desconectada");
        ptSocket = null;
      } else {
        console.log(`🔌 Cliente del Dashboard desconectado [ID: ${socket.id}]`);
        clientSockets.delete(socket.id);
      }
    });
  });

  // --- API ENDPOINTS ---
  app.get("/api/test", async (req: Request, res: Response) => {
    try {
      return res.json({
        success: true,
        message: "Sistema funcionando correctamente",
        data: null,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Error al obtener los dispositivos" });
    }
  });

  // --- ENRUTADOR LA VISTAS
  app.use((req: Request, res: Response) => {
    return nextHandler(req, res);
  });

  server.listen(PORT, () => {
    console.log(`App corriendo en http://localhost:${PORT}`);
  });
});
