import { ciscoClient } from "@/client/CiscoClient";
import { getUserByToken } from "@/service/AuthService";
import { logService } from "@/service/LogService";
import { topologyService } from "@/service/TopologyService";
import { getCookieToken } from "@/utils/CookieHelper";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const ALLOWED_DEVICE_MODELS = [
  "2911",
  "1941",
  "2921",
  "2901",
  "2960-24TT",
  "2960-48TT",
  "3560-24PS",
  "PC-PT",
  "Server-PT",
  "Laptop-PT",
  "Printer-PT",
] as const;

const ALLOWED_LINK_TYPES = [
  "straight",
  "cross",
  "fiber",
  "serial",
  "auto",
] as const;

async function getCurrentUser() {
  const token = await getCookieToken();
  if (!token) {
    return {
      success: false,
      message: "No se encontró sesión activa (Token faltante).",
      data: null
    };
  }

  const userCurrentToken = await getUserByToken(token);
  if (!userCurrentToken.success) {
    return {
      success: false,
      message: "No se encontró sesión activa (Token faltante).",
      data: null
    };
  }
  return userCurrentToken;
}

async function getCurrentTopology() {
  const currentUser = await getCurrentUser();

  if (!currentUser.success || !currentUser.data?.id) {
    return {
      success: false,
      message: "No se encontró sesión activa (Token faltante).",
      data: null
    };
  }

  const topology = await topologyService.getLastOwnerTopology(currentUser.data.id);
  return topology;
}

async function createLog({ level, title, content }: { level: string, title: string, content: string }) {
  try {
    const topology = await getCurrentTopology();

    if (!topology) {
      console.warn(`No se pudo registrar el log [${title}] porque no hay ninguna topología activa creada aún.`);
      return;
    }

    await logService.create({
      level: level.toUpperCase(),
      title: title,
      content: content,
      topology: {
        connect: {
          id: topology.data?.id
        }
      }
    });
  } catch (error) {
    console.error("Error al registrar el log en la base de datos:", error);
  }
}

// TOOLS
const createTopologyTool = tool(
  async ({ name, description }) => {
    const currentUser = await getCurrentUser();

    if (!currentUser.success || !currentUser.data?.id) {
      return JSON.stringify({ success: false, message: "Usuario no autorizado o no encontrado." });
    }

    const ownerId = currentUser.data.id;

    const result = await topologyService.createOrUpdate({
      name,
      description,
      topologyJson: "{}",
      owner: {
        connect: {
          id: ownerId,
        }
      }
    });

    await createLog({
      level: "CREATE",
      title: "Topología Inicializada",
      content: `Nueva topología creada: '${name}' | Descripción: ${description || "Ninguna"}.`,
    });

    return JSON.stringify(result);
  },
  {
    name: "createTopology",
    description: "Crea una nueva topología en el espacio de trabajo.",
    schema: z.object({
      name: z.string().describe("Nombre de la topología"),
      description: z.string().optional().describe("Descripción de la topología"),
    }),
  }
);

const addDeviceTool = tool(
  async ({ deviceName, deviceModel, x, y }) => {
    const result = await ciscoClient.callTool("addDevice", {
      deviceName,
      deviceModel,
      x,
      y,
    });

    await createLog({
      level: "CREATE",
      title: "Dispositivo Agregado",
      content: `Dispositivo '${deviceName}' (${deviceModel}) posicionado en [X: ${x}, Y: ${y}].`,
    });

    return JSON.stringify(result);
  },
  {
    name: "addDevice",
    description: "Agrega un dispositivo de red al espacio de trabajo. Los nombres deben ser únicos.",
    schema: z.object({
      deviceName: z.string().describe("Nombre único para el dispositivo (ej: Router0, PC1)"),
      deviceModel: z.enum(ALLOWED_DEVICE_MODELS).describe("Modelo exacto del dispositivo Cisco o tipo de host final"),
      x: z.number().describe("Coordenada X en el lienzo"),
      y: z.number().describe("Coordenada Y en el lienzo"),
    }),
  },
);

const addModuleTool = tool(
  async ({ deviceName, slot, model }) => {
    const result = await ciscoClient.callTool("addModule", {
      deviceName,
      slot,
      model,
    });

    await createLog({
      level: "MODULE",
      title: "Hardware Modificado",
      content: `Módulo '${model}' instalado correctamente en Slot ${slot} de '${deviceName}'.`,
    });

    return JSON.stringify(result);
  },
  {
    name: "addModule",
    description: "Agrega un módulo de interfaz físico a un dispositivo. Apaga el dispositivo, instala el módulo y lo vuelve a encender.",
    schema: z.object({
      deviceName: z.string().describe("Nombre del dispositivo existente"),
      slot: z.number().int().min(0).max(3).describe("Número de slot de expansión (0-3)"),
      model: z.string().describe("Modelo del módulo, ej: 'HWIC-2T' (serial) o 'NM-4E' (ethernet)"),
    }),
  },
);

const addLinkTool = tool(
  async ({
    device1Name,
    device1Interface,
    device2Name,
    device2Interface,
    linkType,
  }) => {
    const result = await ciscoClient.callTool("addLink", {
      device1Name,
      device1Interface,
      device2Name,
      device2Interface,
      linkType,
    });

    await createLog({
      level: "LINK",
      title: "Enlace Conectado",
      content: `${device1Name} (${device1Interface}) <===[${linkType}]===> ${device2Name} (${device2Interface}).`,
    });

    return JSON.stringify(result);
  },
  {
    name: "addLink",
    description: "Conecta dos dispositivos usando un cable. Ambas interfaces deben estar libres (in_use=false).",
    schema: z.object({
      device1Name: z.string().describe("Nombre del primer dispositivo"),
      device1Interface: z.string().describe("Interfaz libre del primer dispositivo (ej: GigabitEthernet0/0)"),
      device2Name: z.string().describe("Nombre del segundo dispositivo"),
      device2Interface: z.string().describe("Interfaz libre del segundo dispositivo"),
      linkType: z.enum(ALLOWED_LINK_TYPES).describe("Tipo de cable: 'straight' para LAN común, 'cross' para PC a PC, 'serial' para WAN"),
    }),
  },
);

const removeDeviceTool = tool(
  async ({ deviceNames }) => {
    const result = await ciscoClient.callTool("removeDevice", { deviceNames });

    await createLog({
      level: "DELETE",
      title: "Dispositivo Eliminado",
      content: `Removido(s) de la red: ${deviceNames.join(", ")}.`,
    });

    return JSON.stringify(result);
  },
  {
    name: "removeDevice",
    description: "Elimina uno o varios dispositivos del espacio de trabajo mediante un arreglo de nombres.",
    schema: z.object({
      deviceNames: z.array(z.string()).describe("Lista de nombres de los dispositivos a eliminar"),
    }),
  },
);

const removeLinkTool = tool(
  async ({ links }) => {
    const result = await ciscoClient.callTool("removeLink", { links });

    const detalleEnlaces = links.map(l => `${l.device} (${l.port})`).join(" || ");
    await createLog({
      level: "DELETE",
      title: "Enlace Desconectado",
      content: `Cable removido de las interfaces: ${detalleEnlaces}.`,
    });

    return JSON.stringify(result);
  },
  {
    name: "removeLink",
    description: "Elimina uno o más cables. Cada elemento identifica un extremo de la conexión.",
    schema: z.object({
      links: z.array(
        z.object({
          device: z.string().describe("Nombre del dispositivo en un extremo del enlace"),
          port: z.string().describe("Nombre de la interfaz/puerto en ese extremo (ej: FastEthernet0/1)"),
        }),
      ).describe("Arreglo de conexiones/endpoints a remover"),
    }),
  },
);

const configurePcIpTool = tool(
  async ({
    deviceName,
    dhcpEnabled,
    ipaddress,
    subnetMask,
    defaultGateway,
    dnsServer,
  }) => {
    const result = await ciscoClient.callTool("configurePcIp", {
      deviceName,
      dhcpEnabled,
      ipaddress,
      subnetMask,
      defaultGateway,
      dnsServer,
    });

    const modoText = dhcpEnabled ? "DHCP" : `Estática [IP: ${ipaddress} | Mask: ${subnetMask}]`;
    await createLog({
      level: "CONFIGURE",
      title: "Configuración IP Host",
      content: `'${deviceName}' direccionada vía ${modoText} | GW: ${defaultGateway || "N/A"}.`,
    });

    return JSON.stringify(result);
  },
  {
    name: "configurePcIp",
    description: "Configura los parámetros IP en una PC, Laptop o Servidor final.",
    schema: z.object({
      deviceName: z.string().describe("Nombre de la PC existente"),
      dhcpEnabled: z.boolean().describe("True para activar DHCP, false para usar IP estática"),
      ipaddress: z.string().optional().describe("Dirección IP (si es estática)"),
      subnetMask: z.string().optional().describe("Máscara de subred (si es estática)"),
      defaultGateway: z.string().optional().describe("Puerta de enlace predeterminada"),
      dnsServer: z.string().optional().describe("Servidor DNS"),
    }),
  },
);

const configureIosDeviceTool = tool(
  async ({ deviceName, commands }) => {
    const result = await ciscoClient.callTool("configureIosDevice", {
      deviceName,
      commands,
    });

    const cmdResumen = commands.replace(/\n/g, " ; ");
    await createLog({
      level: "CONFIGURE",
      title: "CLI Cisco IOS",
      content: `'${deviceName}': Comandos aplicados [ ${cmdResumen.substring(0, 60)}${cmdResumen.length > 60 ? "..." : ""} ] y guardados en NVRAM.`,
    });

    return JSON.stringify(result);
  },
  {
    name: "configureIosDevice",
    description: "Ejecuta comandos CLI de Cisco IOS en un router o switch desde el modo global y los guarda con 'write memory'.",
    schema: z.object({
      deviceName: z.string().describe("Nombre del Router o Switch"),
      commands: z.string().describe("Comandos ejecutados consecutivamente separados por saltos de línea (\\n)"),
    }),
  },
);

const getNetworkTool = tool(
  async () => {
    const result = await ciscoClient.callTool("getNetwork", {});

    await createLog({
      level: "INFO",
      title: "Auditoría de Red",
      content: "Snapshot e inventario completo de la topología extraídos de Packet Tracer.",
    });

    return JSON.stringify(result);
  },
  {
    name: "getNetwork",
    description: "Obtiene una instantánea completa del espacio de trabajo: dispositivos, interfaces en uso y todos los enlaces.",
    schema: z.object({}),
  },
);

const getDeviceInfoTool = tool(
  async ({ deviceName }) => {
    const result = await ciscoClient.callTool("getDeviceInfo", { deviceName });

    await createLog({
      level: "INFO",
      title: "Consulta de Equipo",
      content: `Inspección de interfaces y estados físicos del dispositivo '${deviceName}'.`,
    });

    return JSON.stringify(result);
  },
  {
    name: "getDeviceInfo",
    description: "Obtiene información detallada de un solo dispositivo específico, incluyendo puertos y enlaces incidentes.",
    schema: z.object({
      deviceName: z.string().describe("Nombre del dispositivo a consultar"),
    }),
  },
);

const setSimulationModeTool = tool(
  async ({ toSimMode }) => {
    const result = await ciscoClient.callTool("setSimulationMode", {
      toSimMode,
    });
    return JSON.stringify(result);
  },
  {
    name: "setSimulationMode",
    description: "Cambia Packet Tracer entre modo simulación (true) y modo tiempo real (false). Requerido antes de enviar PDUs.",
    schema: z.object({
      toSimMode: z.boolean().describe("true = modo simulación, false = modo tiempo real"),
    }),
  },
);

const getSimulationStatusTool = tool(
  async () => {
    const result = await ciscoClient.callTool("getSimulationStatus", {});
    return JSON.stringify(result);
  },
  {
    name: "getSimulationStatus",
    description: "Consulta el estado actual de la simulación: modo activo, tiempo transcurrido y conteo de tramas PDU.",
    schema: z.object({}),
  },
);

const stepSimulationTool = tool(
  async ({ direction, steps }) => {
    const result = await ciscoClient.callTool("stepSimulation", {
      direction,
      steps,
    });
    return JSON.stringify(result);
  },
  {
    name: "stepSimulation",
    description: "Avanza, retrocede o reinicia la simulación. Requiere que Packet Tracer esté en modo simulación.",
    schema: z.object({
      direction: z.enum(["forward", "backward", "reset"]).describe("'forward' avanza un paso, 'backward' retrocede, 'reset' limpia todo al tiempo cero"),
      steps: z.number().int().min(1).max(100).optional().default(1).describe("Cantidad de pasos a tomar (ignorado en 'reset')"),
    }),
  },
);

const sendPduTool = tool(
  async ({ sourceDevice, destinationDevice }) => {
    const result = await ciscoClient.callTool("sendPdu", {
      sourceDevice,
      destinationDevice,
    });

    await createLog({
      level: "INFO",
      title: "Tráfico Generado",
      content: `Inyección ICMP (Ping): [${sourceDevice}] ===> [${destinationDevice}] en entorno de simulación.`,
    });

    return JSON.stringify(result);
  },
  {
    name: "sendPdu",
    description: "Crea y envía un ping ICMP (Simple PDU) nativo entre dos dispositivos. Activa automáticamente el modo simulación.",
    schema: z.object({
      sourceDevice: z.string().describe("Nombre del dispositivo origen"),
      destinationDevice: z.string().describe("Nombre del dispositivo destino"),
    }),
  },
);

const renameDeviceTool = tool(
  async ({ deviceName, newName }) => {
    const result = await ciscoClient.callTool("renameDevice", {
      deviceName,
      newName,
    });

    await createLog({
      level: "CONFIGURE",
      title: "Dispositivo Renombrado",
      content: `Identificador modificado: '${deviceName}' cambiado a '${newName}'.`,
    });

    return JSON.stringify(result);
  },
  {
    name: "renameDevice",
    description: "Cambia el nombre de un dispositivo. El nuevo nombre debe ser único.",
    schema: z.object({
      deviceName: z.string().describe("Nombre actual del dispositivo"),
      newName: z.string().describe("Nuevo nombre único"),
    }),
  },
);

const moveDeviceTool = tool(
  async ({ deviceName, x, y }) => {
    const result = await ciscoClient.callTool("moveDevice", {
      deviceName,
      x,
      y,
    });

    await createLog({
      level: "INFO",
      title: "Lienzo Actualizado",
      content: `Dispositivo '${deviceName}' reposicionado a coordenadas (${x}, ${y}).`,
    });

    return JSON.stringify(result);
  },
  {
    name: "moveDevice",
    description: "Mueve un dispositivo a nuevas coordenadas espaciales dentro del lienzo lógico.",
    schema: z.object({
      deviceName: z.string().describe("Nombre del dispositivo a reposicionar"),
      x: z.number().describe("Nueva coordenada X"),
      y: z.number().describe("Nueva coordenada Y"),
    }),
  },
);

const setPowerTool = tool(
  async ({ deviceName, power }) => {
    const result = await ciscoClient.callTool("setPower", {
      deviceName,
      power,
    });

    await createLog({
      level: "CONFIGURE",
      title: power ? "Equipo Encendido" : "Equipo Apagado",
      content: `Estado de alimentación de '${deviceName}' cambiado a: ${power ? "ENCENDIDO" : "APAGADO"}.`,
    });

    return JSON.stringify(result);
  },
  {
    name: "setPower",
    description: "Enciende o apaga eléctricamente un dispositivo.",
    schema: z.object({
      deviceName: z.string().describe("Nombre del dispositivo"),
      power: z.boolean().describe("true = encender, false = apagar"),
    }),
  },
);

const getPduResultsTool = tool(
  async ({ types }) => {
    const result = await ciscoClient.callTool("getPduResults", { types });
    return JSON.stringify(result);
  },
  {
    name: "getPduResults",
    description: "Lee los resultados del tráfico simulado (origen, destino, estado del paquete). Ideal tras usar stepSimulation.",
    schema: z.object({
      types: z.array(z.string()).optional().describe("Filtro opcional por protocolo (ej: ['ICMP', 'ARP']) para limpiar ruido de fondo"),
    }),
  },
);

const getCommandLogTool = tool(
  async ({ deviceName, limit }) => {
    const result = await ciscoClient.callTool("getCommandLog", {
      deviceName,
      limit,
    });

    await createLog({
      level: "INFO",
      title: "Historial CLI Solicitado",
      content: `Extracción de logs de consola de comandos IOS${deviceName ? ` para '${deviceName}'` : " generales"}.`,
    });

    return JSON.stringify(result);
  },
  {
    name: "getCommandLog",
    description:
      "Lee el historial de comandos IOS registrados por Packet Tracer.",
    schema: z.object({
      deviceName: z
        .string()
        .optional()
        .describe("Filtrar por dispositivo específico. Omitir para ver todos."),
      limit: z
        .number()
        .int()
        .min(1)
        .max(500)
        .optional()
        .default(50)
        .describe(
          "Límite máximo de registros a retornar, del más nuevo al más viejo",
        ),
    }),
  },
);

// para el admin | staff 
export const CISCO_TOOLS = [
  createTopologyTool,
  addDeviceTool,
  addModuleTool,
  addLinkTool,
  removeDeviceTool,
  removeLinkTool,
  configurePcIpTool,
  configureIosDeviceTool,
  getNetworkTool,
  getDeviceInfoTool,
  setSimulationModeTool,
  getSimulationStatusTool,
  stepSimulationTool,
  sendPduTool,
  renameDeviceTool,
  moveDeviceTool,
  setPowerTool,
  getPduResultsTool,
  getCommandLogTool,
];

// para el usuario
export const CISCO_TOOLS_USER = [
  getNetworkTool,
  getDeviceInfoTool,
  setSimulationModeTool,
  getSimulationStatusTool,
  stepSimulationTool,
  getPduResultsTool,
  getCommandLogTool,
];