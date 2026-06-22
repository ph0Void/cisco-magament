"use server";

import { userService } from "@/service/UserService";
import { z } from "zod";

export type FormUserState = {
    success: boolean;
    message?: string;
    fieldErrors?: Partial<Record<string, string[]>>;
};

export async function getAllUsersAction(page: number, limit: number) {
    const result = await userService.getAll(page, limit);

    if (!result.succes || !result.data) {
        return {
            success: false,
            message: result.message,
            data: null,
        }
    }

    return {
        success: true,
        message: result.message,
        data: result.data,
    }
}

export async function registerUserAction(
    prevState: FormUserState,
    formData: FormData,
): Promise<FormUserState> {
    const dataRaw = {
        username: formData.get("username"),
        password: formData.get("password"),
        role: formData.get("role"),
    }

    const result = await userService.register(
        dataRaw.username as string,
        dataRaw.password as string,
        dataRaw.role as string
    );

    if (!result.succes || !result.data) {
        return {
            ...prevState,
            success: false,
            message: result.message,
        }
    }

    return {
        success: true,
        message: result.message,
    }
}


export async function updateUserAction(
    prevState: FormUserState,
    formData: FormData
): Promise<FormUserState> {
    const dataRaw = {
        id: formData.get("id"),
        username: formData.get("username"),
        password: formData.get("password"),
        role: formData.get("role"),
    }

    if (!dataRaw.id) {
        return {
            ...prevState,
            success: false,
            message: "Error de consistencia de datos: Falta el ID del usuario.",
        }
    }

    const result = await userService.update(
        dataRaw.id as string,
        dataRaw.username as string,
        dataRaw.password as string,
        dataRaw.role as string
    );

    if (!result.succes || !result.data) {
        return {
            ...prevState,
            success: false,
            message: result.message,
        }
    }

    return {
        success: true,
        message: result.message,
    }
}

export async function deleteUserAction(idUser: string) {
    const result = await userService.delete(idUser);

    if (!result.succes) {
        return {
            success: false,
            message: result.message,
        }
    }

    return {
        success: true,
        message: result.message,
    }
}