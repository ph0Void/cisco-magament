"use server";

import { alertService } from "@/service/AlertService";
import { getUserByToken } from "@/service/AuthService";
import { getCookieToken } from "@/utils/CookieHelper";
import { revalidatePath } from "next/cache";

export type FormAlertState = {
  success: boolean;
  message: string;
};

export async function createAlertAction(prevState: FormAlertState, formData: FormData): Promise<FormAlertState> {
  try {
    const title = formData.get("title");
    const description = formData.get("description");
    const severity = formData.get("severity");
    const topologyId = formData.get("topology");

    if (!title || !description || !topologyId) {
      return { success: false, message: "Todos los campos obligatorios deben ser completados." };
    }

    const token = await getCookieToken();
    const user = await getUserByToken(token || "");

    const result = await alertService.create({
      user: { connect: { id: user.data?.id || "" } },
      title: String(title),
      description: String(description),
      severity: String(severity),
      topology: { connect: { id: String(topologyId) } },
    });

    if (!result.succes) {
      return { success: false, message: result.message };
    }

    revalidatePath("/dashboard/alert");
    return { success: true, message: "Incidencia reportada con éxito." };
  } catch (error) {
    return { success: false, message: "Error interno al procesar el reporte." };
  }
}

export async function updateAlertAction(prevState: FormAlertState, formData: FormData): Promise<FormAlertState> {
  try {
    const id = formData.get("id");
    const title = formData.get("title");
    const description = formData.get("description");
    const severity = formData.get("severity");
    const topologyId = formData.get("topology");

    if (!id) return { success: false, message: "ID de alerta no proporcionado." };

    const result = await alertService.update(String(id), {
      title: String(title),
      description: String(description),
      severity: String(severity),
      topology: { connect: { id: String(topologyId) } },
    });

    if (!result.succes) {
      return { success: false, message: result.message };
    }

    revalidatePath("/dashboard/alert");
    return { success: true, message: "Gravedad de la alerta actualizada correctamente." };
  } catch (error) {
    return { success: false, message: "Error interno al actualizar la alerta." };
  }
}

export async function solveAlertAction(id: string) {
  const result = await alertService.solveAlert(id);
  if (result.succes) revalidatePath("/dashboard/alert");
  return result;
}

export async function deleteAlertAction(id: string) {
  const result = await alertService.delete(id);
  if (result.succes) revalidatePath("/dashboard/alert");
  return result;
}