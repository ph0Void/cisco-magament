import { prismaClient } from "@/prisma/lib/PrismaClient";
import { BcryptAdapter } from "@/utils/BcryptAdapter";

class UserService {
  async register(username: string, password: string, role: string = "CLIENT") {
    try {
      const hashedPassword = BcryptAdapter.hash(password);
      const user = await prismaClient.user.create({
        data: {
          username,
          password: hashedPassword,
          role: role as any,
        },
      });
      return {
        succes: true,
        message: "Usuario registrado exitosamente",
        data: user,
      };
    } catch (error) {
      console.error("Error al registrar el usuario", error);
      return {
        succes: false,
        message: "Error al registrar usuario",
        data: null,
      };
    }
  }

  async update(id: string, username: string, password: string, role: string) {
    try {
      const hashedPassword = BcryptAdapter.hash(password);
      const user = await prismaClient.user.update({
        where: {
          id,
        },
        data: {
          username,
          password: hashedPassword,
          role: role as any,
        },
      });
      return {
        succes: true,
        message: "Usuario actualizado exitosamente",
        data: user,
      };
    } catch (error) {
      console.error("Error al actualizar el usuario", error);
      return {
        succes: false,
        message: "Error al actualizar usuario",
        data: null,
      };
    }
  }

  async delete(id: string) {
    try {
      const user = await prismaClient.user.delete({
        where: {
          id,
        },
      });
      return {
        succes: true,
        message: "Usuario eliminado exitosamente",
        data: user,
      };
    } catch (error) {
      console.error("Error al eliminar el usuario", error);
      return {
        succes: false,
        message: "Error al eliminar usuario",
        data: null,
      };
    }
  }

  async getAll(page: number, limit: number) {
    try {
      const user = await prismaClient.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
      });
      return {
        succes: true,
        message: "Usuarios obtenidos exitosamente",
        data: user,
      };
    } catch (error) {
      console.error("Error al obtener los usuarios", error);
      return {
        succes: false,
        message: "Error al obtener usuarios",
        data: null,
      };
    }
  }

  async getById(id: string) {
    try {
      const user = await prismaClient.user.findUnique({
        where: {
          id,
        },
      });
      return {
        succes: true,
        message: "Usuario obtenido exitosamente",
        data: user,
      };
    } catch (error) {
      console.error("Error al obtener el usuario", error);
      return {
        succes: false,
        message: "Error al obtener usuario",
        data: null,
      };
    }
  }
}

export const userService = new UserService();