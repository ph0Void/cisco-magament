"use server";

import { prismaClient } from "@/prisma/lib/PrismaClient";
import { getUserByToken } from "@/service/AuthService";
import { getCookieToken } from "@/utils/CookieHelper";
import { revalidatePath } from "next/cache";

/**
 * Obtiene todas las sesiones de chat de un usuario (para simplificar, usamos un usuario por defecto o el primer usuario del sistema)
 */
export async function getChats() {
  try {
    const token = await getCookieToken();
    const user = await getUserByToken(token || "");
    const chats = await prismaClient.chat.findMany({
      where: { userId: user?.data?.id },
      orderBy: { updatedAt: "desc" },
    });

    return {
      succes: true,
      message: "Chats obtenidos correctamente",
      data: chats,
    };
  } catch (error) {
    console.error("Error al obtener los chats:", error);
    return {
      succes: false,
      message: "Error al obtener los chats",
      data: null,
    };
  }
}

/**
 * Crea una nueva sesión de chat persistente en SQLite
 */
export async function createChat(title: string) {
  try {
    const token = await getCookieToken();
    const user = await getUserByToken(token || "");

    const chat = await prismaClient.chat.create({
      data: {
        title: title || "Nueva sesión de red",
        userId: user?.data?.id || "",
      },
    });

    return {
      succes: true,
      message: "Chat creado correctamente",
      data: chat,
    };
  } catch (error) {
    console.error("Error al crear sesión de chat:", error);
    return {
      succes: false,
      message: "Error al crear sesión de chat",
      data: null,
    };
  }
}

/**
 * Obtiene todos los mensajes de un chat específico
 */
export async function getChatMessages(chatId: string) {
  try {
    return await prismaClient.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" },
    });
  } catch (error) {
    console.error("Error al obtener mensajes:", error);
    return [];
  }
}

/**
 * Guarda un mensaje individual de la conversación en SQLite
 */
export async function saveMessage(
  chatId: string,
  role: string,
  content: string,
) {
  try {
    // Guardamos el mensaje en base de datos
    const message = await prismaClient.message.create({
      data: {
        chatId,
        role,
        content,
      },
    });

    // Actualizamos la fecha de última interacción del Chat para el orden del historial
    await prismaClient.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    return message;
  } catch (error) {
    console.error("Error al guardar el mensaje:", error);
    throw new Error("No se pudo guardar el mensaje de red.");
  }
}

/**
 * Elimina una sesión de chat por completo con cascada lógica
 */
export async function deleteChat(chatId: string) {
  try {
    const result = await prismaClient.chat.delete({
      where: { id: chatId },
    });
    revalidatePath("/dashboard/chat");
    return result;
  } catch (error) {
    console.error("Error al eliminar sesión de chat:", error);
    throw new Error("No se pudo eliminar la sesión de chat seleccionada.");
  }
}

/**
 * Server Action compatible con useActionState / formAction (React 19).
 * Crea la sesión si no existe, guarda el mensaje del usuario y retorna
 * el chatId + contenido para que el cliente inicie el stream SSE.
 */
export type SendMessageState = {
  chatId: string;
  content: string;
  userMessageId: string;
  isNew: boolean;
} | null;

export async function sendMessageAction(
  prevState: SendMessageState,
  formData: FormData,
): Promise<SendMessageState> {
  try {
    const content = (formData.get("content") as string)?.trim();
    const chatIdInput = (formData.get("chatId") as string) || null;

    if (!content) return prevState;

    const token = await getCookieToken();
    const user = await getUserByToken(token || "");
    const userId = user?.data?.id;

    if (!userId) throw new Error("Usuario no autorizado");

    let activeChatId = chatIdInput;
    let isNew = false;

    if (!activeChatId) {
      const chat = await prismaClient.chat.create({
        data: {
          title: content.substring(0, 45) || "Nueva sesión de red",
          userId,
        },
      });
      activeChatId = chat.id;
      isNew = true;
    }

    const message = await prismaClient.message.create({
      data: { chatId: activeChatId, role: "user", content },
    });

    await prismaClient.chat.update({
      where: { id: activeChatId },
      data: { updatedAt: new Date() },
    });

    revalidatePath("/dashboard/chat");

    return { chatId: activeChatId, content, userMessageId: message.id, isNew };
  } catch (error) {
    console.error("Error en sendMessageAction:", error);
    return prevState;
  }
}
