(function () {
  var API_URL = "http://127.0.0.1:7531";

  var $statusDot = document.getElementById("status-dot");
  var $statusText = document.getElementById("status-text");
  var $sid = document.getElementById("sid");
  var $toolCount = document.getElementById("tool-count");
  var $log = document.getElementById("log");

  var toolsHandled = 0;

  function setStatus(state, label) {
    if ($statusDot) $statusDot.className = "dot " + state;
    if ($statusText) $statusText.textContent = label || state;
  }

  function logLine(text, cls) {
    if (!$log) return;
    var line = document.createElement("div");
    line.className = "line" + (cls ? " " + cls : "");
    var ts = new Date().toTimeString().slice(0, 8);
    line.innerHTML = '<span class="ts">' + ts + "</span>  " + escapeHtml(text);
    $log.appendChild(line);
    // Limita el registro a ~200 líneas.
    while ($log.childNodes.length > 200) $log.removeChild($log.firstChild);
    $log.scrollTop = $log.scrollHeight;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function incrementToolCount() {
    toolsHandled++;
    if ($toolCount) $toolCount.textContent = String(toolsHandled);
  }

  function emitToolResult(socket, tcid, tool, args, result) {
    if (!socket.connected) return;
    socket.emit("tool_result", {
      tool_call_id: tcid,
      tool_name: tool,
      tool_input: args,
      result: result,
    });
  }

  function buildErrorResult(tool, args, message) {
    return {
      success: false,
      error: message,
      tool: tool,
      args: args,
    };
  }

  function serializePTArgument(value) {
    if (typeof value === "string") {
      return (
        '"' +
        value
          .replace(/\\/g, "\\\\")
          .replace(/"/g, '\\"')
          .replace(/\n/g, "\\n")
          .replace(/\r/g, "\\r")
          .replace(/\t/g, "\\t") +
        '"'
      );
    }
    if (value === null || value === undefined) return "undefined";
    if (typeof value === "boolean") return String(value);
    if (Array.isArray(value) || typeof value === "object")
      return JSON.stringify(value);
    return String(value);
  }

  function unwrapRunCodePayload(wrapped) {
    var payload = wrapped;
    if (typeof wrapped === "string") {
      try {
        payload = JSON.parse(wrapped);
      } catch (_) {
        payload = wrapped;
      }
    }

    // runCode envuelve el retorno de userfunctions como {success, result, code}.
    // Desenvuelve para que el servidor vea directamente la forma de retorno de userfunctions.
    if (
      payload &&
      typeof payload === "object" &&
      "result" in payload &&
      "success" in payload &&
      "code" in payload
    ) {
      return payload.result;
    }
    return payload;
  }

  // Construye "return <fn>(<args>);" y lo envía a través del host de scripting de PT
  // mediante $se('runCode', ...). runCode() (en source/runcode.js) envuelve el
  // valor devuelto como { success, result, code }.
  function executePTCode(funcName, args) {
    return new Promise(function (resolve, reject) {
      try {
        var argsStr = (args || []).map(serializePTArgument).join(", ");
        var wrapped = $se(
          "runCode",
          "return " + funcName + "(" + argsStr + ");",
        );
        resolve(unwrapRunCodePayload(wrapped));
      } catch (err) {
        reject(err);
      }
    });
  }

  // Mapea tool_name -> lista ordenada de argumentos para la función JS en
  // userfunctions.js. Debe mantenerse alineado con mcp_server/tools.py.
  // var TOOL_ARGS = {
  //   addDevice:           ["deviceName", "deviceModel", "x", "y"],
  //   addModule:           ["deviceName", "slot", "model"],
  //   addLink:             ["device1Name", "device1Interface",
  //                         "device2Name", "device2Interface", "linkType"],
  //   removeDevice:        ["deviceNames"],
  //   removeLink:          ["links"],
  //   configurePcIp:       ["deviceName", "dhcpEnabled", "ipaddress",
  //                         "subnetMask", "defaultGateway", "dnsServer"],
  //   configureIosDevice:  ["deviceName", "commands"],
  //   getNetwork:          [],
  //   getDeviceInfo:       ["deviceName"],
  //   setSimulationMode:   ["toSimMode"],
  //   getSimulationStatus: [],
  //   stepSimulation:      ["direction", "steps"],
  //   sendPdu:             ["sourceDevice", "destinationDevice"],
  //   renameDevice:        ["deviceName", "newName"],
  //   moveDevice:          ["deviceName", "x", "y"],
  //   setPower:            ["deviceName", "power"],
  //   getPduResults:       ["types"],
  //   getCommandLog:       ["deviceName", "limit"],
  // };

  // Actualizar la variable TOOL_ARGS en interface.js
  var TOOL_ARGS = {
    // Herramientas existentes (17)
    addDevice: ["deviceName", "deviceModel", "x", "y"],
    addModule: ["deviceName", "slot", "model"],
    addLink: [
      "device1Name",
      "device1Interface",
      "device2Name",
      "device2Interface",
      "linkType",
    ],
    removeDevice: ["deviceNames"],
    removeLink: ["links"],
    configurePcIp: [
      "deviceName",
      "dhcpEnabled",
      "ipaddress",
      "subnetMask",
      "defaultGateway",
      "dnsServer",
    ],
    configureIosDevice: ["deviceName", "commands"],
    getNetwork: [],
    getDeviceInfo: ["deviceName"],
    setSimulationMode: ["toSimMode"],
    getSimulationStatus: [],
    stepSimulation: ["direction", "steps"],
    sendPdu: ["sourceDevice", "destinationDevice"],
    renameDevice: ["deviceName", "newName"],
    moveDevice: ["deviceName", "x", "y"],
    setPower: ["deviceName", "power"],
    getPduResults: ["types"],
    getCommandLog: ["deviceName", "limit"],

    // NUEVAS HERRAMIENTAS
    diagnoseConnectivity: ["sourceDevice", "destinationDevice"],
    getRoutingTable: ["deviceName"],
    startTrafficMonitor: ["deviceName", "durationSeconds"],
    getVlanConfiguration: ["switchName"],
    batchConfigureDevices: ["configurations"],
    backupDeviceConfig: ["deviceName"],
    restoreDeviceConfig: ["deviceName", "configText"],
    getDeviceMetrics: ["deviceName"],
    scanNetwork: [],
    simulateLinkFailure: ["deviceName", "interfaceName", "durationSeconds"],
    restoreLink: ["deviceName", "interfaceName"],
    validateSecurityConfig: ["deviceName"],
    generateNetworkReport: [],
    exportTopologyJSON: [],
    loadTopologyFromJSON: ["jsonData"],
  };

  function buildPositionalArgs(tool, input) {
    var spec = TOOL_ARGS[tool];
    if (!spec) return null;
    var out = [];
    for (var i = 0; i < spec.length; i++) out.push(input[spec[i]]);
    return out;
  }

  function handleToolCall(socket, data) {
    data = data || {};
    var tool = data.tool_name;
    var args = data.tool_input || {};
    var tcid = data.tool_call_id;

    if (!tool || !tcid) {
      logLine("tool_call malformado", "err");
      return;
    }

    logLine("→ " + tool + " " + JSON.stringify(args).slice(0, 80));

    var positional = buildPositionalArgs(tool, args);
    if (!positional) {
      var unsupported = buildErrorResult(
        tool,
        args,
        "herramienta no compatible: " + tool,
      );
      logLine("← " + tool + " err: herramienta no compatible", "err");
      emitToolResult(socket, tcid, tool, args, unsupported);
      return;
    }

    executePTCode(tool, positional)
      .then(function (result) {
        incrementToolCount();

        var ok = result && result.success !== false;
        logLine(
          "← " + tool + (ok ? " ok" : " err: " + (result && result.error)),
          ok ? "ok" : "err",
        );
        emitToolResult(socket, tcid, tool, args, result);
      })
      .catch(function (err) {
        incrementToolCount();

        var msg = (err && err.message) || String(err);
        logLine("← " + tool + " threw: " + msg, "err");
        emitToolResult(
          socket,
          tcid,
          tool,
          args,
          buildErrorResult(tool, args, msg),
        );
      });
  }

  function bindSocketEvents(socket) {
    socket.on("connect", function () {
      setStatus("connected", "conectado");
      if ($sid) $sid.textContent = socket.id;
      logLine("conectado sid=" + socket.id, "ok");
    });

    socket.on("connect_error", function (err) {
      setStatus("offline", "desconectado");
      logLine("error de conexión: " + ((err && err.message) || err), "err");
    });

    socket.on("disconnect", function (reason) {
      setStatus("connecting", "reconectando");
      if ($sid) $sid.textContent = "—";
      logLine("desconexión: " + reason, "err");
    });

    socket.on("tool_call", function (data) {
      handleToolCall(socket, data);
    });
  }

  function createSocket() {
    return io(API_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
  }

  setStatus("connecting", "conectando");
  logLine("conectando a " + API_URL);

  var socket = createSocket();
  bindSocketEvents(socket);
})();
