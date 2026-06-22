import { ciscoAgent } from "@/agent/CiscoAgent";
import { NextRequest, NextResponse } from "next/server";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { messages, threadId } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Mensajes inválidos" },
        { status: 400 },
      );
    }

    const formattedMessages = messages.map((m: any) => {
      if (m.role === "user") {
        return new HumanMessage({ content: m.content });
      } else if (m.role === "assistant") {
        return new AIMessage({ content: m.content });
      } else if (m.role === "system") {
        return new SystemMessage({ content: m.content });
      }
      return new HumanMessage({ content: m.content });
    });

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (type: string, data: any) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type, ...data })}\n\n`),
          );
        };

        try {
          // Ejecutamos streamEvents v2 para capturar tanto tokens de texto como ejecuciones de herramientas
          const eventStream = await ciscoAgent.streamEvents(
            { messages: formattedMessages },
            {
              version: "v2",
              configurable: { thread_id: threadId || crypto.randomUUID() },
            },
          );

          for await (const event of eventStream) {
            const eventType = event.event;

            // 1. Streaming de texto del modelo de IA
            if (eventType === "on_chat_model_stream") {
              const chunk = event.data.chunk;
              if (chunk && chunk.content) {
                sendEvent("text", { content: chunk.content });
              }
            }
            // 2. Inicio de ejecución de una Tool de Cisco Packet Tracer
            else if (eventType === "on_tool_start") {
              sendEvent("tool_start", {
                tool: event.name,
                input: event.data.input,
                callId: (event as any).id,
              });
            }
            // 3. Fin de la ejecución de la Tool con su respuesta de la extensión
            else if (eventType === "on_tool_end") {
              sendEvent("tool_end", {
                tool: event.name,
                output: event.data.output,
                callId: (event as any).id,
              });
            }
          }
        } catch (error: any) {
          console.error("Error en el stream de LangChain:", error);
          sendEvent("error", {
            message: error.message || "Error interno en el agente",
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (err: any) {
    console.error("Error crítico en ruta API:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
