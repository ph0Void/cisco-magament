
import { ciscoClient } from "@/client/CiscoClient";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const toolName = "getNetwork";
        const toolInput = {};

        const result = await ciscoClient.callTool(
            toolName,
            toolInput
        );

        const success = result.success;
        const data = result.result.result;

        if (!success) {
            return NextResponse.json({
                success: false,
                message: "Error al obtener los dispositivos",
                data: null,
            });
        }

        return NextResponse.json({
            success: success,
            message: "Dispositivos obtenidos desde Cisco Packet Tracer",
            data: data,
        });

        //return NextResponse.json(result);

    } catch (error) {
        console.error("Error al obtener los dispositivos", error);
        return NextResponse.json({
            success: false,
            message: "Error al obtener los dispositivos",
            data: null,
        });
    }
}
