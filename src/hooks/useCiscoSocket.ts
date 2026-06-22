import { useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useTopologyStore } from "@/store/topologyStore";
import { Device, Link } from "@/types";
import { ciscoClient } from "@/client/CiscoClient";
import { DEVICE_MODEL_TYPES } from "@/types/Devices";
import { getDeviceCategory } from "@/types/CategoryDevices";

export function useCiscoSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState<"connected" | "connecting" | "disconnected">("disconnected");
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const setTopology = useTopologyStore((s) => s.setTopology);
  const devices = useTopologyStore((s) => s.devices);
  const links = useTopologyStore((s) => s.links);
  const clearStore = useTopologyStore((s) => s.clearStore);

  const refreshTopology = useCallback(async () => {
    try {
      const response = await ciscoClient.callTool("getNetwork", {});

      if (!response.success) {
        clearStore();
        console.error("Error al obtener topología:", response.error);
        setIsConnected(false);
        setStatus("disconnected");
        return;
      }

      setIsConnected(true);
      setStatus("connected");

      const ptResult = response.result?.result;

      if (ptResult && Array.isArray(ptResult.devices)) {
        const mappedDevices: Device[] = ptResult.devices.map((d: any, idx: number) => {
          const typeNum = d.model && DEVICE_MODEL_TYPES[d.model] !== undefined
            ? DEVICE_MODEL_TYPES[d.model]
            : Number(d.type);

          const category = getDeviceCategory(typeNum);
          const interfacesArray = Array.isArray(d.interfaces) ? d.interfaces : [];

          return {
            id: d.name,
            name: d.name,
            type: category,
            model: d.model || "Cisco-Device",
            x: d.x !== undefined ? d.x : 120 + (idx % 6) * 150,
            y: d.y !== undefined ? d.y : 120 + Math.floor(idx / 6) * 150,
            status: d.status || "online",
            power: d.power !== undefined ? d.power : true,
            interfaces: interfacesArray.map((inf: any) => ({
              name: inf.name,
              isUp: inf.in_use || false,
            })),
          };
        });

        const mappedLinks: Link[] = (ptResult.connections || []).map((c: any, idx: number) => ({
          id: `link-${idx}`,
          sourceDevice: c.from,
          sourceInterface: c.fromInterface,
          targetDevice: c.to,
          targetInterface: c.toInterface,
          type: c.type?.toString() || "CopperStraightOver",
          status: "up",
        }));

        setTopology({ devices: mappedDevices, links: mappedLinks });
      }
    } catch (error) {
      console.error("Error en refreshTopology:", error);
      setIsConnected(false);
      clearStore();
      setStatus("disconnected");
    }
  }, [setTopology]);

  const reconnect = useCallback(async () => {
    if (isReconnecting) return;
    setIsReconnecting(true);
    setStatus("connecting");

    try {
      const sock = socketRef.current;
      if (sock) {
        if (!sock.connected) {
          sock.connect();
        }
        await refreshTopology();
      }
    } catch (err) {
      clearStore();
      console.error("Error al reconectar:", err);
    } finally {
      setTimeout(() => {
        setIsReconnecting(false);
      }, 1200);
    }
  }, [isReconnecting, refreshTopology]);

  useEffect(() => {
    refreshTopology();

    const socketInstance = io({
      query: { clientType: "dashboard" },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("WebSocket Dashboard conectado");
      refreshTopology();
    });

    socketInstance.on("pt_status", (data: { connected: boolean }) => {
      const isPtConnected = data.connected;
      setStatus(isPtConnected ? "connected" : "disconnected");
      setIsConnected(isPtConnected);

      if (isPtConnected) {
        refreshTopology();
      }
    });

    socketInstance.on("connect_error", () => {
      setStatus("disconnected");
      setIsConnected(false);
    });

    socketInstance.on("disconnect", () => {
      setStatus("disconnected");
      setIsConnected(false);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [refreshTopology]);

  return {
    socket,
    status,
    isConnected,
    isReconnecting,
    refreshTopology,
    reconnect,
    devices,
    links,
  };
}