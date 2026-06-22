"use server";

import { loginAuthService } from "@/service/AuthService";
import { deleteCookieToken, saveCookieToken } from "@/utils/CookieHelper";

export type FormState = {
  success: boolean;
  message: string;
};

export async function loginAction(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || username.trim() === "") {
    return { success: false, message: "El nombre de usuario es requerido." };
  }

  if (!password || password.trim() === "") {
    return { success: false, message: "La contraseña es requerida." };
  }

  try {
    const result = await loginAuthService(username, password);

    if (!result.success || !result.data) {
      return {
        success: false,
        message: result.message || "Credenciales inválidas.",
      };
    }

    await saveCookieToken(result.data);

    return {
      success: true,
      message: "¡Conexión exitosa! Redirigiendo...",
    };
  } catch (error: any) {
    console.error("Error en loginAction:", error);
    return {
      success: false,
      message: "Ocurrió un error inesperado en el servidor.",
    };
  }
}

export async function registerAction(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || username.trim() === "") {
    return { success: false, message: "El nombre de usuario es requerido." };
  }

  if (!password || password.trim() === "") {
    return { success: false, message: "La contraseña es requerida." };
  }

  try {
    const result = await loginAuthService(username, password);

    if (!result.success || !result.data) {
      return {
        success: false,
        message: result.message || "Credenciales inválidas.",
      };
    }

    await saveCookieToken(result.data);

    return {
      success: true,
      message: "¡Conexión exitosa! Redirigiendo...",
    };
  } catch (error: any) {
    console.error("Error en loginAction:", error);
    return {
      success: false,
      message: "Ocurrió un error inesperado en el servidor.",
    };
  }
}


export async function logoutAction() {
  await deleteCookieToken();
  return {
    success: true,
    message: "¡Sesión cerrada! Redirigiendo...",
  };
}

