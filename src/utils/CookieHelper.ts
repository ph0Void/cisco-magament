"use server";

import { cookies } from "next/headers";
import {envConfig} from "@/config/EnvConfig";

const COOKIE_NAME = envConfig.COOKIE_NAME || "cisco-cookie";

/**
 * Guardar el token en una cookie
 */
export async function saveCookieToken(token: string) {
    (await cookies()).set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", 
        maxAge: 60 * 60 * 24, // 1 day
        path: "/",
        sameSite: "lax",
    });
}
/**
 * Obtener el token de la cookie
 * */
export async function getCookieToken() {
    const cookieStore = await cookies();
    return cookieStore.get(COOKIE_NAME)?.value;
}

export async function deleteCookieToken() {
    (await cookies()).delete(COOKIE_NAME);
}