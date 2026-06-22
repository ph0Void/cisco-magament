import { envConfig } from "@/config/EnvConfig";
import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

interface ToolCallData {
  tool_call_id: string;
  tool_name: string;
  tool_input: Record<string, any>;
}

interface ToolResultData {
  tool_call_id: string;
  result: any;
}

const PORT = envConfig.PORT || 7531;
const BRIDGE_URL = `http://localhost:${PORT}`;

class CiscoClient {
  private socket: Socket;
  private pendingRequests = new Map<
    string,
    { resolve: (val: any) => void; reject: (err: any) => void }
  >();

  constructor() {
    this.socket = io(BRIDGE_URL, {
      transports: ["websocket"],
      reconnection: true,
    });

    this.socket.on("connect", () => {
      console.log("CiscoClient conectado al servidor puente");
    });

    this.socket.on("tool_result", (data: ToolResultData) => {
      if (
        data &&
        data.tool_call_id &&
        this.pendingRequests.has(data.tool_call_id)
      ) {
        const pending = this.pendingRequests.get(data.tool_call_id);
        if (pending) {
          pending.resolve(data.result);
          this.pendingRequests.delete(data.tool_call_id);
        }
      }
    });

    this.socket.on("disconnect", () => {
      console.log("CiscoClient desconectado del servidor puente");
    });
  }

  public callTool(toolName: string, input: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const uuidCall = uuidv4();
      const toolCallID = `tool-${toolName}-${uuidCall}`;

      const timeout = setTimeout(() => {
        if (this.pendingRequests.has(toolCallID)) {
          this.pendingRequests.delete(toolCallID);
          reject(
            new Error(
              `Timeout de 20s esperando respuesta de la herramienta de red: ${toolName}. Asegúrate de que Packet Tracer esté conectado y respondiendo.`
            )
          );
        }
      }, 20000);

      this.pendingRequests.set(toolCallID, {
        resolve: (val: any) => {
          clearTimeout(timeout);
          resolve(val);
        },
        reject: (err: any) => {
          clearTimeout(timeout);
          reject(err);
        },
      });

      this.socket.emit("tool_call", {
        tool_call_id: toolCallID,
        tool_name: toolName,
        tool_input: input,
      } as ToolCallData);
    });
  }
}

export const ciscoClient = new CiscoClient();
