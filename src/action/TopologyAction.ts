"use server";

import { topologyService } from "@/service/TopologyService";
import { getUserByToken } from "@/service/AuthService";
import { getCookieToken } from "@/utils/CookieHelper";

export async function saveTopologyAction(
  name: string,
  description: string,
  topologyJson: string,
  id?: string
) {
  try {
    const token = await getCookieToken();
    const user = await getUserByToken(token || "");

    if (!user || !user.data) {
      return {
        success: false,
        message: "Sesión no válida o expirada. No se pudo guardar la topología.",
      };
    }

    const payload: any = {
      name,
      description,
      topologyJson,
      ownerId: user.data.id,
    };

    if (id) {
      payload.id = id;
    }

    const result = await topologyService.createOrUpdate(payload);

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
  } catch (error: any) {
    console.error("Error al guardar la topología:", error);
    return {
      success: false,
      message: error.message || "Error al procesar la solicitud en el servidor.",
    };
  }
}

export async function getAllTopologiesAction(page: number = 1, limit: number = 10) {
  try {
    const token = await getCookieToken();
    const user = await getUserByToken(token || "");

    if (!user || !user.data) {
      return {
        success: false,
        message: "No autorizado.",
        data: [],
      };
    }

    const result = await topologyService.getAll(user.data.id, page, limit);

    if (!result.succes) {
      return {
        success: false,
        message: result.message,
        data: [],
      };
    }

    const count = result.data?.length || 0;

    return {
      success: true,
      message: result.message,
      data: result.data,
      page: page,
      limit: limit,
      total: count,
    };
  } catch (error: any) {
    console.error("Error al obtener las topologías:", error);
    return {
      success: false,
      message: error.message || "Error al obtener topologías.",
      data: [],
    };
  }
}

export async function getTopologyByIdAction(id: string) {
  try {
    const result = await topologyService.getById(id);

    if (!result.succes) {
      return {
        success: false,
        message: result.message,
        data: null,
      };
    }

    return {
      success: true,
      message: result.message,
      data: result.data,
    };
  } catch (error: any) {
    console.error("Error al obtener topología:", error);
    return {
      success: false,
      message: error.message || "Error al obtener la topología.",
      data: null,
    };
  }
}

export async function deleteTopologyAction(id: string) {
  try {
    const result = await topologyService.delete(id);

    if (!result.succes) {
      return {
        success: false,
        message: result.message,
      };
    }

    return {
      success: true,
      message: result.message,
    };
  } catch (error: any) {
    console.error("Error al eliminar topología:", error);
    return {
      success: false,
      message: error.message || "Error al eliminar la topología.",
    };
  }
}
