"use server";

import { getUserByToken, validateAuthToken } from "@/service/AuthService";
import { getCookieToken } from "@/utils/CookieHelper";

export async function validateAuthCookie() {
  try {
    const token = await getCookieToken();
    const isValid = await validateAuthToken(token || "");
    if (!isValid) {
      return {
        success: false,
        message: "Token inválido o expirado",
        data: null,
      };
    }

    const user = await getUserByToken(token || "");

    // const { id, password, token: _token, ...rest } = user.data || {};
    return {
      success: true,
      message: "Token válido",
      data: {
        username: user.data?.username || "",
        rol: user.data?.role || "",
      },
    };
  } catch (error) {
    console.error("Error en validateAuthToken:", error);
    return {
      success: false,
      message: "Error al validar el token",
      data: null,
    };
  }
}
