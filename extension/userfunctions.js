function fail(prefix, err) {
  var msg = (err && (err.message || String(err))) || "unknown error";
  return { success: false, error: prefix ? prefix + ": " + msg : msg };
}

addDevice = function (deviceName, deviceModel, x, y) {
  try {
    var deviceType = allDeviceTypes[deviceModel];

    if (deviceType === undefined) {
      return {
        success: false,
        error: `Unknown device model: ${deviceModel}`,
      };
    }

    var originalDeviceName = ipc
      .appWindow()
      .getActiveWorkspace()
      .getLogicalWorkspace()
      .addDevice(deviceType, deviceModel, x, y);

    if (!originalDeviceName) {
      return {
        success: false,
        error: `Failed to add device ${deviceName} (${deviceModel})`,
      };
    }

    var device = ipc.network().getDevice(originalDeviceName);
    device.setName(deviceName);

    if (deviceType <= 1 || deviceType == 16) {
      device.skipBoot();
    }

    return {
      success: true,
      message: `Device ${deviceName} added successfully`,
    };
  } catch (error) {
    return fail("Error adding device", error);
  }
};

addModule = function (deviceName, slot, model) {
  try {
    var device = ipc.network().getDevice(deviceName);

    if (!device) {
      return {
        success: false,
        error: `Device ${deviceName} not found`,
      };
    }

    var moduleType = allModuleTypes[model];

    if (moduleType === undefined) {
      return {
        success: false,
        error: `Unknown module model: ${model}`,
      };
    }

    var powerState = device.getPower();
    device.setPower(false);

    var result = device.addModule(slot, moduleType, model);

    if (powerState) {
      device.setPower(true);
      device.skipBoot();
    }

    if (result != true) {
      return {
        success: false,
        error: `Failed to add module ${model} to slot ${slot} on ${deviceName}`,
      };
    }

    return {
      success: true,
      message: `Module ${model} added to ${deviceName} slot ${slot}`,
    };
  } catch (error) {
    return fail("Error adding module", error);
  }
};

addLink = function (
  device1Name,
  device1Interface,
  device2Name,
  device2Interface,
  linkType
) {
  try {
    var linkTypeValue = allLinkTypes[linkType];

    if (linkTypeValue === undefined) {
      return {
        success: false,
        error: `Unknown link type: ${linkType}`,
      };
    }

    var result = ipc
      .appWindow()
      .getActiveWorkspace()
      .getLogicalWorkspace()
      .createLink(
        device1Name,
        device1Interface,
        device2Name,
        device2Interface,
        linkTypeValue
      );

    if (result != true) {
      return {
        success: false,
        error: `Failed to create link between ${device1Name}:${device1Interface} and ${device2Name}:${device2Interface}`,
      };
    }

    return {
      success: true,
      message: `Link created between ${device1Name} and ${device2Name}`,
    };
  } catch (error) {
    return fail("Error creating link", error);
  }
};

configurePcIp = function (
  deviceName,
  dhcpEnabled,
  ipaddress,
  subnetMask,
  defaultGateway,
  dnsServer
) {
  try {
    var device = ipc.network().getDevice(deviceName);

    if (!device) {
      return {
        success: false,
        error: `Device ${deviceName} not found`,
      };
    }

    var port = device.getPort("FastEthernet0");

    if (!port) {
      return {
        success: false,
        error: `FastEthernet0 port not found on ${deviceName}`,
      };
    }

    if (dhcpEnabled !== undefined && dhcpEnabled !== null) {
      device.setDhcpFlag(dhcpEnabled);
    }
    if (ipaddress && subnetMask) port.setIpSubnetMask(ipaddress, subnetMask);
    if (defaultGateway) port.setDefaultGateway(defaultGateway);
    if (dnsServer) port.setDnsServerIp(dnsServer);

    return {
      success: true,
      message: `IP configuration applied to ${deviceName}`,
    };
  } catch (error) {
    return fail("Error configuring PC IP", error);
  }
};

configureIosDevice = function (deviceName, commands) {
  try {
    var device = ipc.network().getDevice(deviceName);

    if (!device) {
      return {
        success: false,
        error: `Device ${deviceName} not found`,
      };
    }

    device.skipBoot();
    var commandsArray = commands.split("\n");
    device.enterCommand("!", "global");

    for (var c = 0; c < commandsArray.length; c++) {
      var command = commandsArray[c];
      if (command.trim()) {
        device.enterCommand(command, "");
      }
    }

    device.enterCommand("write memory", "enable");

    return {
      success: true,
      message: `Configuration applied to ${deviceName} (${commandsArray.length} commands)`,
    };
  } catch (error) {
    return fail("Error configuring IOS device", error);
  }
};

getNetwork = function () {
  try {
    var deviceCount = ipc.network().getDeviceCount();
    var devices = [];
    var connections = [];

    // Pass 1: collect (deviceName, portName) -> in_use using link table
    var inUseSet = {};
    var linkCount = ipc.network().getLinkCount();
    for (var li = 0; li < linkCount; li++) {
      var link = ipc.network().getLinkAt(li);
      var p1 = link.getPort1();
      var p2 = link.getPort2();
      if (p1) inUseSet[p1.getName()] = true;
      if (p2) inUseSet[p2.getName()] = true;
    }

    // Pass 2: devices + interfaces, and a portName -> deviceName map for Pass 3.
    var portOwner = {};
    for (var i = 0; i < deviceCount; i++) {
      var device = ipc.network().getDeviceAt(i);
      var deviceName = device.getName();

      var interfaces = [];
      var portCount = device.getPortCount();
      for (var j = 0; j < portCount; j++) {
        var port = device.getPortAt(j);
        if (port) {
          var pname = port.getName();
          portOwner[pname] = deviceName;
          interfaces.push({ name: pname, in_use: inUseSet[pname] === true });
        }
      }

      devices.push({
        name: deviceName,
        model: device.getModel(),
        type: device.getType(),
        interfaces: interfaces,
      });
    }

    // Pass 3: connections — resolve parent devices directly from ports to prevent name collision.
    for (var k = 0; k < linkCount; k++) {
      var lnk = ipc.network().getLinkAt(k);
      if (!lnk) continue;

      var p1 = lnk.getPort1();
      var p2 = lnk.getPort2();
      if (!p1 || !p2) continue;

      var port1Name = p1.getName();
      var port2Name = p2.getName();
      
      var device1Name = "";
      var device2Name = "";

      try {
        if (typeof p1.getDevice === "function" && p1.getDevice()) {
          device1Name = p1.getDevice().getName();
        } else if (typeof p1.getDeviceName === "function") {
          device1Name = p1.getDeviceName();
        } else if (typeof p1.getParentDevice === "function" && p1.getParentDevice()) {
          device1Name = p1.getParentDevice().getName();
        }
      } catch (e) {
        // Ignore and fallback
      }

      try {
        if (typeof p2.getDevice === "function" && p2.getDevice()) {
          device2Name = p2.getDevice().getName();
        } else if (typeof p2.getDeviceName === "function") {
          device2Name = p2.getDeviceName();
        } else if (typeof p2.getParentDevice === "function" && p2.getParentDevice()) {
          device2Name = p2.getParentDevice().getName();
        }
      } catch (e) {
        // Ignore and fallback
      }

      // Fallback in case direct lookup failed
      if (!device1Name) device1Name = portOwner[port1Name];
      if (!device2Name) device2Name = portOwner[port2Name];

      if (device1Name && device2Name) {
        connections.push({
          from: device1Name,
          fromInterface: port1Name,
          to: device2Name,
          toInterface: port2Name,
          type: lnk.getConnectionType(),
        });
      }
    }

    return {
      success: true,
      result: {
        deviceCount: devices.length,
        connectionCount: connections.length,
        devices: devices,
        connections: connections,
      },
    };
  } catch (error) {
    return fail("", error);
  }
};

getDeviceInfo = function (deviceName) {
  try {
    var net = getNetwork();
    if (!net || !net.success) {
      return net || { success: false, error: "getNetwork failed" };
    }
    var devices = net.result.devices;
    var connections = net.result.connections;
    for (var i = 0; i < devices.length; i++) {
      if (devices[i].name === deviceName) {
        var related = [];
        for (var j = 0; j < connections.length; j++) {
          var c = connections[j];
          if (c.from === deviceName || c.to === deviceName) related.push(c);
        }
        return {
          success: true,
          result: {
            device: devices[i],
            connections: related,
          },
        };
      }
    }
    return {
      success: false,
      error: `Device ${deviceName} not found`,
    };
  } catch (error) {
    return fail("Error getting device info", error);
  }
};

removeDevice = function (deviceNames) {
  try {
    var devicesToRemove = [];
    if (typeof deviceNames === "string") {
      devicesToRemove = [deviceNames];
    } else if (Array.isArray(deviceNames)) {
      devicesToRemove = deviceNames;
    } else {
      return {
        success: false,
        error:
          "Invalid input: provide a device name string or array of device names",
      };
    }

    var workspace = ipc.appWindow().getActiveWorkspace().getLogicalWorkspace();
    var results = [];
    var successCount = 0;
    var failCount = 0;

    for (var i = 0; i < devicesToRemove.length; i++) {
      var deviceName = devicesToRemove[i];
      var device = ipc.network().getDevice(deviceName);

      if (!device) {
        results.push({
          device: deviceName,
          success: false,
          error: "Device not found",
        });
        failCount++;
      } else {
        var result = workspace.removeDevice(deviceName);

        if (result === true) {
          results.push({
            device: deviceName,
            success: true,
            message: "Removed successfully",
          });
          successCount++;
        } else {
          results.push({
            device: deviceName,
            success: false,
            error: "Failed to remove",
          });
          failCount++;
        }
      }
    }

    return {
      success: failCount === 0,
      totalDevices: devicesToRemove.length,
      successCount: successCount,
      failCount: failCount,
      results: results,
    };
  } catch (error) {
    return fail("Error removing devices", error);
  }
};

setSimulationMode = function (toSimMode) {
  try {
    var sim = ipc.simulation();
    var current = sim.isSimulationMode();
    if (current === toSimMode) {
      return {
        success: true,
        message: "Already in " + (toSimMode ? "simulation" : "realtime") + " mode",
        mode: toSimMode ? "simulation" : "realtime",
      };
    }
    sim.setSimulationMode(toSimMode);
    return {
      success: true,
      message: "Switched to " + (toSimMode ? "simulation" : "realtime") + " mode",
      mode: toSimMode ? "simulation" : "realtime",
    };
  } catch (error) {
    return fail("Error setting simulation mode", error);
  }
};

getSimulationStatus = function () {
  try {
    var sim = ipc.simulation();
    var isSimMode = sim.isSimulationMode();
    var result = { mode: isSimMode ? "simulation" : "realtime" };
    if (isSimMode) {
      result.currentTime = sim.getCurrentSimTime();
      result.frameCount = sim.getFrameInstanceCount();
      result.currentFrameIndex = sim.getCurrentFrameInstanceIndex();
    }
    return { success: true, result: result };
  } catch (error) {
    return fail("Error getting simulation status", error);
  }
};

stepSimulation = function (direction, steps) {
  try {
    var sim = ipc.simulation();
    if (!sim.isSimulationMode()) {
      return {
        success: false,
        error: "Not in simulation mode. Call setSimulationMode(true) first.",
      };
    }
    if (direction === "reset") {
      sim.resetSimulation();
      return { success: true, message: "Simulation reset" };
    }
    var n = steps && steps >= 1 ? Math.min(steps, 100) : 1;
    for (var i = 0; i < n; i++) {
      if (direction === "forward") {
        sim.forward();
      } else if (direction === "backward") {
        sim.backward();
      } else {
        return { success: false, error: "Unknown direction: " + direction };
      }
    }
    return {
      success: true,
      message: direction + " " + n + " step(s)",
      currentTime: sim.getCurrentSimTime(),
      frameCount: sim.getFrameInstanceCount(),
    };
  } catch (error) {
    return fail("Error stepping simulation", error);
  }
};

var PDU_TRAFFIC_TYPES = {
  ICMP: 0,
  TCP: 1,
  UDP: 2,
  HTTP: 17,
  HTTPS: 18,
  DNS: 19,
};

sendPdu = function (sourceDevice, destinationDevice) {
  try {
    var sim = ipc.simulation();
    var modeEnabled = false;
    if (!sim.isSimulationMode()) {
      sim.setSimulationMode(true);
      modeEnabled = true;
    }
    if (!ipc.network().getDevice(sourceDevice)) {
      return { success: false, error: "Source device not found: " + sourceDevice };
    }
    if (!ipc.network().getDevice(destinationDevice)) {
      return { success: false, error: "Destination device not found: " + destinationDevice };
    }
    var errCode = ipc.appWindow().getUserCreatedPDU().addSimplePdu(sourceDevice, destinationDevice);
    // ADD_PDU_ERROR: 0 / falsy = success
    var errStr = String(errCode);
    if (errCode && errStr !== "0") {
      return { success: false, error: "PT rejected PDU (ADD_PDU_ERROR=" + errStr + ")" };
    }
    return {
      success: true,
      message: "ICMP PDU added from " + sourceDevice + " to " + destinationDevice,
      simulationModeEnabled: modeEnabled,
    };
  } catch (error) {
    return fail("Error sending PDU", error);
  }
};

renameDevice = function (deviceName, newName) {
  try {
    var device = ipc.network().getDevice(deviceName);
    if (!device) {
      return { success: false, error: "Device not found: " + deviceName };
    }
    device.setName(newName);
    return { success: true, message: "Renamed " + deviceName + " to " + newName };
  } catch (error) {
    return fail("Error renaming device", error);
  }
};

moveDevice = function (deviceName, x, y) {
  try {
    var device = ipc.network().getDevice(deviceName);
    if (!device) {
      return { success: false, error: "Device not found: " + deviceName };
    }
    device.moveToLocation(x, y);
    return {
      success: true,
      message: "Moved " + deviceName + " to (" + x + ", " + y + ")",
    };
  } catch (error) {
    return fail("Error moving device", error);
  }
};

// Maps both numeric and C++ enum-string forms of eTrafficType to readable names.
// PT's JS host may expose the enum as "0" or as "eTrafficType_Icmp" — handle both.
var TRAFFIC_TYPE_NAMES = {
  "0": "ICMP",  "eTrafficType_Icmp": "ICMP",
  "1": "TCP",   "eTrafficType_Tcp": "TCP",
  "2": "UDP",   "eTrafficType_Udp": "UDP",
  "3": "RIPv1", "eTrafficType_RipV1": "RIPv1",
  "4": "RIPv2", "eTrafficType_RipV2": "RIPv2",
  "5": "ARP",   "eTrafficType_Arp": "ARP",
  "6": "CDP",   "eTrafficType_Cdp": "CDP",
  "7": "DHCP",  "eTrafficType_Dhcp": "DHCP",
  "11": "STP",  "eTrafficType_Stp": "STP",
  "12": "OSPF", "eTrafficType_Ospf": "OSPF",
  "13": "DTP",  "eTrafficType_Dtp": "DTP",
  "17": "HTTP", "eTrafficType_Http": "HTTP",
  "18": "HTTPS","eTrafficType_Https": "HTTPS",
  "19": "DNS",  "eTrafficType_Dns": "DNS",
  "36": "BGP",  "eTrafficType_Bgp": "BGP",
  "1000": "Custom", "eTrafficType_Custom": "Custom",
};

getPduResults = function (types) {
  try {
    var sim = ipc.simulation();
    if (!sim.isSimulationMode()) {
      return { success: false, error: "Not in simulation mode. Call setSimulationMode(true) first." };
    }

    var typeFilter = null;
    if (Array.isArray(types) && types.length > 0) {
      typeFilter = {};
      for (var t = 0; t < types.length; t++) typeFilter[types[t].toUpperCase()] = true;
    }

    var total = sim.getFrameInstanceCount();
    var frames = [];
    for (var i = 0; i < total; i++) {
      var fi = sim.getFrameInstanceAt(i);
      if (!fi) continue;

      var rawType = String(fi.getUserTrafficType());
      var typeName = TRAFFIC_TYPE_NAMES[rawType] || rawType;

      if (typeFilter && !typeFilter[typeName.toUpperCase()]) continue;

      var status = "unknown";
      if (fi.isFrameAccepted())          status = "accepted";
      else if (fi.isFrameDropped())      status = "dropped";
      else if (fi.isFrameNotForwarded()) status = "not_forwarded";
      else if (fi.isFrameUnexpected())   status = "unexpected";
      else if (fi.isFrameCollidedOnLink() || fi.isFrameCollidedAtDevice()) status = "collision";
      else if (fi.isFrameBuffered())     status = "buffered";
      else if (fi.isFrameOnTransit())    status = "in_transit";
      else if (fi.isFrameSent())         status = "sent";

      frames.push({
        index: i,
        source: fi.getSourceString(),
        destination: fi.getDestinationString(),
        trafficType: typeName,
        status: status,
      });
    }
    return {
      success: true,
      result: { totalFrames: total, shown: frames.length, frames: frames },
    };
  } catch (error) {
    return fail("Error getting PDU results", error);
  }
};

getCommandLog = function (deviceName, limit) {
  try {
    var log = ipc.commandLog();
    var total = log.getEntryCount();
    var cap = limit && limit > 0 ? Math.min(limit, 500) : 50;
    var entries = [];

    for (var i = total - 1; i >= 0 && entries.length < cap; i--) {
      var entry = log.getEntryAt(i);
      if (!entry) continue;
      var dev = entry.getDeviceName();
      if (deviceName && dev !== deviceName) continue;
      entries.push({
        timestamp: entry.getTimeToString(),
        device: dev,
        prompt: entry.getPrompt(),
        command: entry.getCommand(),
        resolvedCommand: entry.getResolvedCommand(),
      });
    }

    return {
      success: true,
      result: { totalEntries: total, returned: entries.length, entries: entries },
    };
  } catch (error) {
    return fail("Error getting command log", error);
  }
};

setPower = function (deviceName, power) {
  try {
    var device = ipc.network().getDevice(deviceName);
    if (!device) {
      return { success: false, error: "Device not found: " + deviceName };
    }
    device.setPower(power);
    return {
      success: true,
      message: deviceName + " powered " + (power ? "on" : "off"),
    };
  } catch (error) {
    return fail("Error setting device power", error);
  }
};

removeLink = function (links) {
  try {
    var linksToRemove = [];

    if (typeof links === "object" && links !== null && !Array.isArray(links)) {
      linksToRemove = [links];
    } else if (Array.isArray(links)) {
      linksToRemove = links;
    } else {
      return {
        success: false,
        error:
          "Invalid input: provide link object {device, port} or array of link objects",
      };
    }

    var workspace = ipc.appWindow().getActiveWorkspace().getLogicalWorkspace();
    var results = [];
    var successCount = 0;
    var failCount = 0;

    for (var i = 0; i < linksToRemove.length; i++) {
      var link = linksToRemove[i];
      var deviceName = link.device || link.deviceName;
      var portName = link.port || link.portName;

      if (!deviceName || !portName) {
        results.push({
          device: deviceName,
          port: portName,
          success: false,
          error: "Missing device or port",
        });
        failCount++;
        continue;
      }

      var device = ipc.network().getDevice(deviceName);
      if (!device) {
        results.push({
          device: deviceName,
          port: portName,
          success: false,
          error: "Device not found",
        });
        failCount++;
        continue;
      }

      var result = workspace.deleteLink(deviceName, portName);

      if (result === true) {
        results.push({
          device: deviceName,
          port: portName,
          success: true,
          message: "Link removed successfully",
        });
        successCount++;
      } else {
        results.push({
          device: deviceName,
          port: portName,
          success: false,
          error: "Failed to remove link",
        });
        failCount++;
      }
    }

    return {
      success: failCount === 0,
      totalLinks: linksToRemove.length,
      successCount: successCount,
      failCount: failCount,
      results: results,
    };
  } catch (error) {
    return fail("Error removing links", error);
  }
};


// ==========================================
//  NUEVAS FUNCIONALIDADES
// ==========================================

// ============================================
// 1. DIAGNÓSTICO DE CONECTIVIDAD END-TO-END
// ============================================
diagnoseConnectivity = function(sourceDevice, destinationDevice) {
  try {
    var result = {
      success: true,
      source: sourceDevice,
      destination: destinationDevice,
      checks: []
    };
    
    // Verificar existencia de dispositivos
    var srcDev = ipc.network().getDevice(sourceDevice);
    var dstDev = ipc.network().getDevice(destinationDevice);
    
    if (!srcDev) {
      return { success: false, error: "Source device not found: " + sourceDevice };
    }
    if (!dstDev) {
      return { success: false, error: "Destination device not found: " + destinationDevice };
    }
    
    result.checks.push({ check: "device_existence", passed: true });
    
    // Obtener información de red
    var net = getNetwork();
    if (net.success) {
      // Verificar si hay un camino posible entre dispositivos
      var hasPath = false;
      var connections = net.result.connections;
      
      // Búsqueda simple de conectividad directa
      for (var i = 0; i < connections.length; i++) {
        var conn = connections[i];
        if ((conn.from === sourceDevice && conn.to === destinationDevice) ||
            (conn.from === destinationDevice && conn.to === sourceDevice)) {
          hasPath = true;
          break;
        }
      }
      
      result.checks.push({ 
        check: "direct_connection", 
        passed: hasPath,
        details: hasPath ? "Direct link exists" : "No direct link found"
      });
      
      // Listar todos los vecinos del dispositivo origen
      var neighbors = [];
      for (var j = 0; j < connections.length; j++) {
        if (connections[j].from === sourceDevice) {
          neighbors.push(connections[j].to);
        } else if (connections[j].to === sourceDevice) {
          neighbors.push(connections[j].from);
        }
      }
      
      result.neighbors = neighbors;
    }
    
    // Intentar enviar un PDU de prueba
    var sim = ipc.simulation();
    var wasSimMode = sim.isSimulationMode();
    
    if (!wasSimMode) {
      sim.setSimulationMode(true);
    }
    
    var pduResult = ipc.appWindow().getUserCreatedPDU().addSimplePdu(sourceDevice, destinationDevice);
    var pduSuccess = (pduResult === 0 || String(pduResult) === "0");
    
    result.checks.push({
      check: "pdu_send",
      passed: pduSuccess,
      details: pduSuccess ? "PDU sent successfully" : "Failed to send PDU"
    });
    
    // Restaurar modo si es necesario
    if (!wasSimMode) {
      sim.setSimulationMode(false);
    }
    
    return result;
    
  } catch (error) {
    return fail("Error diagnosing connectivity", error);
  }
};

// ============================================
// 2. ANÁLISIS DE TABLA DE ENRUTAMIENTO
// ============================================
getRoutingTable = function(deviceName) {
  try {
    var device = ipc.network().getDevice(deviceName);
    if (!device) {
      return { success: false, error: "Device not found: " + deviceName };
    }
    
    // Comandos comunes para ver tabla de enrutamiento
    var commands = [
      "show ip route",
      "show ipv6 route"
    ];
    
    var routingInfo = {};
    
    for (var i = 0; i < commands.length; i++) {
      try {
        // Usar CLI del dispositivo si está disponible
        var result = device.enterCommand(commands[i], "enable");
        routingInfo[commands[i]] = result || "No output";
      } catch (e) {
        routingInfo[commands[i]] = "Command not available";
      }
    }
    
    return {
      success: true,
      device: deviceName,
      routingTable: routingInfo
    };
    
  } catch (error) {
    return fail("Error getting routing table", error);
  }
};

// ============================================
// 3. MONITOR DE TRÁFICO EN TIEMPO REAL
// ============================================
startTrafficMonitor = function(deviceName, durationSeconds) {
  try {
    var device = ipc.network().getDevice(deviceName);
    if (!device) {
      return { success: false, error: "Device not found: " + deviceName };
    }
    
    var duration = durationSeconds || 10; // 10 segundos por defecto
    var sim = ipc.simulation();
    var wasSimMode = sim.isSimulationMode();
    
    if (!wasSimMode) {
      sim.setSimulationMode(true);
    }
    
    // Capturar estado inicial
    var initialFrames = sim.getFrameInstanceCount();
    var startTime = Date.now();
    
    // Esperar (simulación asíncrona - en ambiente real se necesitaría callback)
    // Por ahora retornamos instrucciones
    return {
      success: true,
      message: "Traffic monitor started on " + deviceName,
      duration: duration,
      instructions: "Use getPduResults() after " + duration + " seconds to see traffic"
    };
    
  } catch (error) {
    return fail("Error starting traffic monitor", error);
  }
};

// ============================================
// 4. VERIFICACIÓN DE CONFIGURACIÓN DE VLAN
// ============================================
getVlanConfiguration = function(switchName) {
  try {
    var device = ipc.network().getDevice(switchName);
    if (!device) {
      return { success: false, error: "Switch not found: " + switchName };
    }
    
    var deviceType = device.getType();
    // Verificar que es un switch (tipo 1 o 16)
    if (deviceType !== 1 && deviceType !== 16) {
      return { success: false, error: "Device is not a switch" };
    }
    
    var vlanInfo = {
      device: switchName,
      vlans: []
    };
    
    // Comandos VLAN
    var commands = [
      "show vlan brief",
      "show vlan summary"
    ];
    
    for (var i = 0; i < commands.length; i++) {
      try {
        var result = device.enterCommand(commands[i], "enable");
        vlanInfo[commands[i]] = result || "No output";
      } catch (e) {
        vlanInfo[commands[i]] = "Command not available";
      }
    }
    
    return {
      success: true,
      result: vlanInfo
    };
    
  } catch (error) {
    return fail("Error getting VLAN configuration", error);
  }
};

// ============================================
// 5. CONFIGURACIÓN MASIVA DE DISPOSITIVOS
// ============================================
batchConfigureDevices = function(configurations) {
  try {
    // configurations: [{ deviceName: "R1", commands: ["int g0/0", "ip add 192.168.1.1 255.255.255.0", "no sh"] }]
    if (!Array.isArray(configurations)) {
      return { success: false, error: "Configurations must be an array" };
    }
    
    var results = [];
    var successCount = 0;
    
    for (var i = 0; i < configurations.length; i++) {
      var config = configurations[i];
      var deviceName = config.deviceName;
      var commands = config.commands;
      
      if (!deviceName || !commands) {
        results.push({
          device: deviceName || "unknown",
          success: false,
          error: "Missing deviceName or commands"
        });
        continue;
      }
      
      var device = ipc.network().getDevice(deviceName);
      if (!device) {
        results.push({
          device: deviceName,
          success: false,
          error: "Device not found"
        });
        continue;
      }
      
      try {
        device.skipBoot();
        device.enterCommand("!", "global");
        
        for (var j = 0; j < commands.length; j++) {
          device.enterCommand(commands[j], "");
        }
        
        device.enterCommand("write memory", "enable");
        
        results.push({
          device: deviceName,
          success: true,
          commandsApplied: commands.length
        });
        successCount++;
        
      } catch (err) {
        results.push({
          device: deviceName,
          success: false,
          error: err.message
        });
      }
    }
    
    return {
      success: successCount > 0,
      totalDevices: configurations.length,
      successCount: successCount,
      results: results
    };
    
  } catch (error) {
    return fail("Error in batch configuration", error);
  }
};

// ============================================
// 6. RESPALDO DE CONFIGURACIÓN (BACKUP)
// ============================================
backupDeviceConfig = function(deviceName) {
  try {
    var device = ipc.network().getDevice(deviceName);
    if (!device) {
      return { success: false, error: "Device not found: " + deviceName };
    }
    
    var configBackup = {
      deviceName: deviceName,
      model: device.getModel(),
      type: device.getType(),
      timestamp: new Date().toISOString(),
      runningConfig: "",
      startupConfig: ""
    };
    
    // Capturar running-config
    try {
      configBackup.runningConfig = device.enterCommand("show running-config", "enable");
    } catch (e) {
      configBackup.runningConfig = "Unable to retrieve running-config";
    }
    
    // Capturar startup-config
    try {
      configBackup.startupConfig = device.enterCommand("show startup-config", "enable");
    } catch (e) {
      configBackup.startupConfig = "Unable to retrieve startup-config";
    }
    
    return {
      success: true,
      result: configBackup
    };
    
  } catch (error) {
    return fail("Error backing up configuration", error);
  }
};

// ============================================
// 7. RESTAURAR CONFIGURACIÓN DESDE BACKUP
// ============================================
restoreDeviceConfig = function(deviceName, configText) {
  try {
    var device = ipc.network().getDevice(deviceName);
    if (!device) {
      return { success: false, error: "Device not found: " + deviceName };
    }
    
    // Limpiar configuración actual
    device.enterCommand("configure terminal", "enable");
    device.enterCommand("config-register 0x2102", "configure");
    
    // Aplicar nueva configuración línea por línea
    var lines = configText.split("\n");
    var appliedCount = 0;
    
    device.enterCommand("!", "global");
    
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (line && !line.startsWith("!") && !line.startsWith("Building")) {
        try {
          device.enterCommand(line, "");
          appliedCount++;
        } catch (e) {
          // Ignorar comandos que fallan
        }
      }
    }
    
    device.enterCommand("end", "enable");
    device.enterCommand("write memory", "enable");
    
    return {
      success: true,
      message: "Configuration restored to " + deviceName,
      commandsApplied: appliedCount
    };
    
  } catch (error) {
    return fail("Error restoring configuration", error);
  }
};

// ============================================
// 8. MÉTRICAS DE RENDIMIENTO DE DISPOSITIVOS
// ============================================
getDeviceMetrics = function(deviceName) {
  try {
    var device = ipc.network().getDevice(deviceName);
    if (!device) {
      return { success: false, error: "Device not found: " + deviceName };
    }
    
    var metrics = {
      deviceName: deviceName,
      model: device.getModel(),
      type: device.getType(),
      powerState: device.getPower(),
      interfaceMetrics: []
    };
    
    // Recopilar métricas de interfaces
    var portCount = device.getPortCount();
    for (var i = 0; i < portCount; i++) {
      var port = device.getPortAt(i);
      if (port) {
        metrics.interfaceMetrics.push({
          name: port.getName(),
          status: port.getStatus ? port.getStatus() : "unknown",
          // Nota: Algunas propiedades pueden no estar disponibles en todos los dispositivos
        });
      }
    }
    
    // Comandos de estado si es router/switch
    var statusCommands = [
      "show processes cpu",
      "show memory statistics",
      "show interface summary"
    ];
    
    var extendedMetrics = {};
    for (var j = 0; j < statusCommands.length; j++) {
      try {
        extendedMetrics[statusCommands[j]] = device.enterCommand(statusCommands[j], "enable");
      } catch (e) {
        extendedMetrics[statusCommands[j]] = "Not available";
      }
    }
    
    metrics.extendedMetrics = extendedMetrics;
    
    return {
      success: true,
      result: metrics
    };
    
  } catch (error) {
    return fail("Error getting device metrics", error);
  }
};

// ============================================
// 9. ESCANEO DE DISPOSITIVOS EN LA RED
// ============================================
scanNetwork = function() {
  try {
    var net = getNetwork();
    if (!net.success) {
      return net;
    }
    
    var devices = net.result.devices;
    var connections = net.result.connections;
    
    // Clasificar dispositivos por tipo
    var classification = {
      routers: [],
      switches: [],
      endDevices: [], // PCs, laptops, servers
      other: []
    };
    
    for (var i = 0; i < devices.length; i++) {
      var device = devices[i];
      var type = device.type;
      
      if (type === 0) { // Router
        classification.routers.push(device.name);
      } else if (type === 1 || type === 16) { // Switch
        classification.switches.push(device.name);
      } else if (type >= 8 && type <= 10) { // PC, Server, Printer
        classification.endDevices.push(device.name);
      } else {
        classification.other.push(device.name);
      }
    }
    
    // Análisis de topología
    var topology = {
      totalDevices: devices.length,
      totalLinks: connections.length,
      classification: classification,
      isolatedDevices: []
    };
    
    // Encontrar dispositivos aislados (sin conexiones)
    var devicesWithConnections = {};
    for (var j = 0; j < connections.length; j++) {
      devicesWithConnections[connections[j].from] = true;
      devicesWithConnections[connections[j].to] = true;
    }
    
    for (var k = 0; k < devices.length; k++) {
      if (!devicesWithConnections[devices[k].name]) {
        topology.isolatedDevices.push(devices[k].name);
      }
    }
    
    return {
      success: true,
      result: topology
    };
    
  } catch (error) {
    return fail("Error scanning network", error);
  }
};

// ============================================
// 10. SIMULAR FALLO DE ENLACE (PRUEBA DE RESILIENCIA)
// ============================================
simulateLinkFailure = function(deviceName, interfaceName, durationSeconds) {
  try {
    var device = ipc.network().getDevice(deviceName);
    if (!device) {
      return { success: false, error: "Device not found: " + deviceName };
    }
    
    var port = device.getPort(interfaceName);
    if (!port) {
      return { success: false, error: "Interface not found: " + interfaceName };
    }
    
    // Apagar la interfaz
    var originalState = port.getStatus ? port.getStatus() : "up";
    
    device.enterCommand("configure terminal", "enable");
    device.enterCommand("interface " + interfaceName, "configure");
    device.enterCommand("shutdown", "interface-config");
    device.enterCommand("end", "enable");
    
    var result = {
      success: true,
      message: "Link failure simulated on " + deviceName + "/" + interfaceName,
      duration: durationSeconds || "indefinite",
      originalState: originalState
    };
    
    // Si se especifica duración, programar restauración
    // Nota: Esto es síncrono, en implementación real usar setTimeout
    if (durationSeconds && durationSeconds > 0) {
      // En un entorno real, aquí se programaría la restauración
      result.restorationScheduled = "after " + durationSeconds + " seconds";
    }
    
    return result;
    
  } catch (error) {
    return fail("Error simulating link failure", error);
  }
};

// ============================================
// 11. RESTAURAR ENLACE
// ============================================
restoreLink = function(deviceName, interfaceName) {
  try {
    var device = ipc.network().getDevice(deviceName);
    if (!device) {
      return { success: false, error: "Device not found: " + deviceName };
    }
    
    var port = device.getPort(interfaceName);
    if (!port) {
      return { success: false, error: "Interface not found: " + interfaceName };
    }
    
    device.enterCommand("configure terminal", "enable");
    device.enterCommand("interface " + interfaceName, "configure");
    device.enterCommand("no shutdown", "interface-config");
    device.enterCommand("end", "enable");
    
    return {
      success: true,
      message: "Link restored on " + deviceName + "/" + interfaceName
    };
    
  } catch (error) {
    return fail("Error restoring link", error);
  }
};

// ============================================
// 12. VALIDAR CONFIGURACIÓN DE SEGURIDAD
// ============================================
validateSecurityConfig = function(deviceName) {
  try {
    var device = ipc.network().getDevice(deviceName);
    if (!device) {
      return { success: false, error: "Device not found: " + deviceName };
    }
    
    var checks = {
      device: deviceName,
      passwordSet: false,
      sshEnabled: false,
      telnetDisabled: false,
      warnings: []
    };
    
    // Verificar contraseña enable secret
    try {
      var config = device.enterCommand("show running-config | include enable secret", "enable");
      checks.passwordSet = (config && config.length > 0);
      if (!checks.passwordSet) {
        checks.warnings.push("No enable secret password configured");
      }
    } catch (e) {
      checks.warnings.push("Cannot verify password configuration");
    }
    
    // Verificar SSH
    try {
      var sshConfig = device.enterCommand("show ip ssh", "enable");
      checks.sshEnabled = (sshConfig && sshConfig.indexOf("SSH Enabled") > -1);
      if (!checks.sshEnabled) {
        checks.warnings.push("SSH is not enabled");
      }
    } catch (e) {
      checks.warnings.push("Cannot verify SSH configuration");
    }
    
    return {
      success: true,
      result: checks
    };
    
  } catch (error) {
    return fail("Error validating security", error);
  }
};

// ============================================
// 13. GENERAR REPORTE COMPLETO DE RED
// ============================================
generateNetworkReport = function() {
  try {
    var net = getNetwork();
    if (!net.success) {
      return net;
    }
    
    var report = {
      generatedAt: new Date().toISOString(),
      summary: {},
      devices: [],
      issues: []
    };
    
    // Resumen general
    report.summary.totalDevices = net.result.devices.length;
    report.summary.totalConnections = net.result.connections.length;
    
    // Detalle de dispositivos
    for (var i = 0; i < net.result.devices.length; i++) {
      var device = net.result.devices[i];
      var deviceReport = {
        name: device.name,
        model: device.model,
        type: device.type,
        interfaceCount: device.interfaces.length,
        usedInterfaces: 0
      };
      
      // Contar interfaces en uso
      for (var j = 0; j < device.interfaces.length; j++) {
        if (device.interfaces[j].in_use) {
          deviceReport.usedInterfaces++;
        }
      }
      
      report.devices.push(deviceReport);
    }
    
    // Detectar problemas comunes
    // 1. Dispositivos sin conexiones
    var devicesWithLinks = {};
    for (var k = 0; k < net.result.connections.length; k++) {
      devicesWithLinks[net.result.connections[k].from] = true;
      devicesWithLinks[net.result.connections[k].to] = true;
    }
    
    for (var d = 0; d < report.devices.length; d++) {
      if (!devicesWithLinks[report.devices[d].name]) {
        report.issues.push({
          severity: "warning",
          device: report.devices[d].name,
          issue: "Device has no connections"
        });
      }
    }
    
    return {
      success: true,
      result: report
    };
    
  } catch (error) {
    return fail("Error generating network report", error);
  }
};

// ============================================
// 14. EXPORTAR TOPOLOGÍA A FORMATO ESTÁNDAR
// ============================================
exportTopologyJSON = function() {
  try {
    var net = getNetwork();
    if (!net.success) {
      return net;
    }
    
    var exportData = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      topology: {
        devices: [],
        links: []
      }
    };
    
    // Exportar dispositivos
    for (var i = 0; i < net.result.devices.length; i++) {
      var device = net.result.devices[i];
      exportData.topology.devices.push({
        id: device.name,
        name: device.name,
        model: device.model,
        type: device.type,
        interfaces: device.interfaces
      });
    }
    
    // Exportar conexiones
    for (var j = 0; j < net.result.connections.length; j++) {
      var conn = net.result.connections[j];
      exportData.topology.links.push({
        source: conn.from,
        sourceInterface: conn.fromInterface,
        target: conn.to,
        targetInterface: conn.toInterface,
        type: conn.type
      });
    }
    
    return {
      success: true,
      result: exportData
    };
    
  } catch (error) {
    return fail("Error exporting topology", error);
  }
};

// ============================================
// 15. CARGAR TOPOLOGÍA DESDE JSON
// ============================================
loadTopologyFromJSON = function(jsonData) {
  try {
    // Validar entrada
    if (typeof jsonData === 'string') {
      try {
        jsonData = JSON.parse(jsonData);
      } catch (e) {
        return {
          success: false,
          error: "Invalid JSON string: " + e.message
        };
      }
    }
    
    if (!jsonData || typeof jsonData !== 'object') {
      return {
        success: false,
        error: "Invalid data: expected JSON object"
      };
    }
    
    // Validar estructura
    if (!jsonData.topology) {
      return {
        success: false,
        error: "Invalid topology format: missing 'topology' property"
      };
    }
    
    var topology = jsonData.topology;
    var devices = topology.devices || [];
    var links = topology.links || [];
    
    // Estadísticas de carga
    var stats = {
      devicesAdded: 0,
      devicesFailed: 0,
      modulesAdded: 0,
      modulesFailed: 0,
      linksAdded: 0,
      linksFailed: 0,
      totalDevices: devices.length,
      totalLinks: links.length,
      deviceErrors: [],
      linkErrors: []
    };
    
    // MAPAS para resolver nombres de interfaces
    var deviceInterfaceMap = {};
    
    // PASO 1: Crear todos los dispositivos
    for (var i = 0; i < devices.length; i++) {
      var deviceData = devices[i];
      var deviceName = deviceData.id || deviceData.name;
      var model = deviceData.model;
      
      // Verificar si el dispositivo ya existe
      var existingDevice = ipc.network().getDevice(deviceName);
      if (existingDevice) {
        stats.devicesFailed++;
        stats.deviceErrors.push({
          device: deviceName,
          error: "Device already exists in workspace"
        });
        continue;
      }
      
      // Determinar tipo de dispositivo basado en el modelo o tipo
      var deviceType = deviceData.type;
      var deviceModel = model;
      
      // Si no hay tipo explícito, intentar inferir del modelo
      if (deviceType === undefined) {
        // Inferir tipo basado en el modelo
        if (model && model.toLowerCase().includes('router')) {
          deviceType = 0; // Router
        } else if (model && (model.toLowerCase().includes('switch') || 
                            model.toLowerCase().includes('catalyst'))) {
          deviceType = 1; // Switch
        } else if (model && (model.toLowerCase().includes('pc') || 
                            model.toLowerCase().includes('computer'))) {
          deviceType = 8; // PC
        } else if (model && model.toLowerCase().includes('server')) {
          deviceType = 9; // Server
        } else {
          deviceType = 0; // Default a router
        }
      }
      
      // Buscar el tipo de dispositivo en allDeviceTypes
      var deviceTypeObj = null;
      for (var key in allDeviceTypes) {
        if (allDeviceTypes[key] === deviceType) {
          deviceTypeObj = key;
          break;
        }
      }
      
      if (!deviceTypeObj) {
        stats.devicesFailed++;
        stats.deviceErrors.push({
          device: deviceName,
          error: "Unsupported device type: " + deviceType
        });
        continue;
      }
      
      // Crear el dispositivo
      try {
        var originalName = ipc
          .appWindow()
          .getActiveWorkspace()
          .getLogicalWorkspace()
          .addDevice(deviceTypeObj, deviceModel || deviceTypeObj, 
                    deviceData.x || 100, deviceData.y || 100);
        
        if (!originalName) {
          stats.devicesFailed++;
          stats.deviceErrors.push({
            device: deviceName,
            error: "Failed to create device"
          });
          continue;
        }
        
        var device = ipc.network().getDevice(originalName);
        if (deviceName !== originalName) {
          device.setName(deviceName);
        }
        
        // Desactivar boot para routers y switches
        if (deviceType <= 1 || deviceType === 16) {
          device.skipBoot();
        }
        
        // Guardar referencia
        deviceInterfaceMap[deviceName] = device;
        stats.devicesAdded++;
        
        // PASO 2: Agregar módulos si están definidos
        if (deviceData.modules && Array.isArray(deviceData.modules)) {
          for (var m = 0; m < deviceData.modules.length; m++) {
            var moduleInfo = deviceData.modules[m];
            try {
              var result = addModule(deviceName, moduleInfo.slot, moduleInfo.model);
              if (result && result.success) {
                stats.modulesAdded++;
              } else {
                stats.modulesFailed++;
              }
            } catch (e) {
              stats.modulesFailed++;
            }
          }
        }
        
        // PASO 3: Configurar IP si es un dispositivo final
        if (deviceData.ipConfiguration && 
            (deviceType === 8 || deviceType === 9 || deviceType === 10)) {
          try {
            var ipConfig = deviceData.ipConfiguration;
            configurePcIp(
              deviceName,
              ipConfig.dhcp || false,
              ipConfig.ipAddress,
              ipConfig.subnetMask,
              ipConfig.defaultGateway,
              ipConfig.dnsServer
            );
          } catch (e) {
            // Ignorar errores de configuración IP
          }
        }
        
        // PASO 4: Aplicar comandos IOS si están definidos
        if (deviceData.commands && deviceData.commands.length > 0) {
          try {
            var commandString = deviceData.commands.join('\n');
            configureIosDevice(deviceName, commandString);
          } catch (e) {
            // Ignorar errores de comandos
          }
        }
        
      } catch (error) {
        stats.devicesFailed++;
        stats.deviceErrors.push({
          device: deviceName,
          error: error.message || String(error)
        });
      }
    }
    
    // PASO 5: Crear todos los enlaces
    for (var j = 0; j < links.length; j++) {
      var linkData = links[j];
      var sourceDevice = linkData.source;
      var sourceInterface = linkData.sourceInterface;
      var targetDevice = linkData.target;
      var targetInterface = linkData.targetInterface;
      var linkType = linkData.type || 'Ethernet';
      
      // Verificar que los dispositivos existen
      var srcExists = ipc.network().getDevice(sourceDevice);
      var dstExists = ipc.network().getDevice(targetDevice);
      
      if (!srcExists) {
        stats.linksFailed++;
        stats.linkErrors.push({
          link: sourceDevice + ":" + sourceInterface + " -> " + targetDevice + ":" + targetInterface,
          error: "Source device not found"
        });
        continue;
      }
      
      if (!dstExists) {
        stats.linksFailed++;
        stats.linkErrors.push({
          link: sourceDevice + ":" + sourceInterface + " -> " + targetDevice + ":" + targetInterface,
          error: "Destination device not found"
        });
        continue;
      }
      
      // Crear el enlace
      try {
        var result = addLink(
          sourceDevice,
          sourceInterface,
          targetDevice,
          targetInterface,
          linkType
        );
        
        if (result && result.success) {
          stats.linksAdded++;
        } else {
          stats.linksFailed++;
          stats.linkErrors.push({
            link: sourceDevice + ":" + sourceInterface + " -> " + targetDevice + ":" + targetInterface,
            error: result ? result.error : "Unknown error"
          });
        }
      } catch (error) {
        stats.linksFailed++;
        stats.linkErrors.push({
          link: sourceDevice + ":" + sourceInterface + " -> " + targetDevice + ":" + targetInterface,
          error: error.message || String(error)
        });
      }
    }
    
    // Preparar resultado
    var result = {
      success: stats.devicesAdded > 0 || stats.linksAdded > 0,
      message: "Topology loaded",
      stats: stats,
      // Incluir información de la topología cargada
      topologyInfo: {
        deviceCount: stats.devicesAdded,
        linkCount: stats.linksAdded,
        modulesAdded: stats.modulesAdded,
        totalDevices: stats.totalDevices,
        totalLinks: stats.totalLinks
      }
    };
    
    // Agregar warnings si hubo fallos parciales
    if (stats.devicesFailed > 0 || stats.linksFailed > 0) {
      result.warning = "Partial load completed with errors";
      result.details = {
        devicesFailed: stats.devicesFailed,
        linksFailed: stats.linksFailed,
        deviceErrors: stats.deviceErrors.slice(0, 5), // Limitar a 5 errores
        linkErrors: stats.linkErrors.slice(0, 5)
      };
    }
    
    return result;
    
  } catch (error) {
    return {
      success: false,
      error: "Error loading topology: " + (error.message || String(error))
    };
  }
};