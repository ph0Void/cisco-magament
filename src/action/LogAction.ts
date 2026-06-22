"use server";

import { getUserByToken } from "@/service/AuthService";
import { logService } from "@/service/LogService";
import { topologyService } from "@/service/TopologyService";
import { getCookieToken } from "@/utils/CookieHelper";

export type FormLogState = {
  success: boolean;
  message: string;
  fieldErrors?: Partial<Record<string, string[]>>;
};

export async function registerLogAction(
  prevState: FormLogState,
  formData: FormData,
) {
  const rawData = {
    idTopology: formData.get("idTopology"),
    title: formData.get("title"),
    content: formData.get("content"),
    level: formData.get("level"),
  };

  const result = await logService.create({
    topology: { connect: { id: String(rawData.idTopology) } },
    title: String(rawData.title),
    content: String(rawData.content),
    level: String(rawData.level),
  });

  if (!result.succes) {
    return {
      ...prevState,
      success: false,
      message: result.message,
    };
  }

  return {
    success: true,
    message: result.message,
  };
}

export async function updateLogAction(
  prevState: FormLogState,
  formData: FormData,
) {
  const rawData = {
    id: formData.get("id"),
    idTopology: formData.get("idTopology"),
    title: formData.get("title"),
    content: formData.get("content"),
    level: formData.get("level"),
  };

  const result = await logService.update(String(rawData.id), {
    topology: { connect: { id: String(rawData.idTopology) } },
    title: String(rawData.title),
    content: String(rawData.content),
    level: String(rawData.level),
  });

  if (!result.succes) {
    return {
      ...prevState,
      success: false,
      message: result.message,
    };
  }

  return {
    success: true,
    message: result.message,
  };
}

export async function getAllLogsAction(
  page: number,
  limit: number,
) {
  const token = await getCookieToken();
  const user = await getUserByToken(token || "");

  if (!user || !user.data) {
    return {
      success: false,
      message: "No autorizado.",
    };
  }

  const idTopology = await topologyService.getLastOwnerTopology(user.data.id)

  const result = await logService.getAll(idTopology.data?.id, page, limit);

  if (!result.succes) {
    return {
      success: false,
      message: result.message,
    };
  }
  const count = result.data!.length;

  return {
    success: true,
    message: result.message,
    data: result.data,
    page: page,
    limit: limit,
    total: count,
  };
}

export async function getLogByIdAction(id: string) {
  const result = await logService.getById(id);

  if (!result.succes) {
    return {
      success: false,
      message: result.message,
    };
  }

  return result;
}

export async function deleteLogAction(id: string) {
  const result = await logService.delete(id);

  if (!result.succes) {
    return {
      success: false,
      message: result.message,
    };
  }

  return {
    success: true,
    message: result.message,
    data: result.data,
  };
}
