import { userService } from "@/service/UserService";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    //const data = await userService.register("admin", "admin", "ADMIN");
    // console.log(data);

    return NextResponse.json({
      success: true,
      message: "Usuarios registrados exitosamente",
      data: null,
    });
  } catch (error) {
    console.error("Error al registrar usuarios", error);
    return NextResponse.json({
      success: false,
      message: "Error al registrar usuarios",
      data: null,
    });
  }
}
