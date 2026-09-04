const http = require("http");
const { spawn } = require("child_process");
const readline = require("readline");
const path = require("path");
const temp = process.env.Q6_TEMP;
const exe = process.env.Q6_EXE;
let child;
let server;
let stdoutBuffer = "";
let serverCalls = [];
let wire = [];
let pending = new Map();
let nextTerminal = 1;

function send(obj) {
  child.stdin.write(JSON.stringify(obj) + "\n");
}

function safe(m) {
  if (!m || typeof m !== "object") return m;
  const x = { jsonrpc: m.jsonrpc };
  if (m.id !== undefined) x.id = m.id;
  if (m.method) x.method = m.method;
  if (m.params) {
    x.params = {};
    for (const k of ["sessionId", "messageId", "cwd", "configId", "modelId"])
      if (m.params[k] !== undefined) x.params[k] = m.params[k];
    if (m.params.update)
      x.params.update = {
        sessionUpdate: m.params.update.sessionUpdate,
        toolCallId: m.params.update.toolCallId,
        status: m.params.update.status,
        messageId: m.params.update.messageId
      };
    if (m.params.options)
      x.params.permissionKinds = m.params.options.map(o => o.kind);
    if (m.params.toolCall)
      x.params.toolCallId = m.params.toolCall.toolCallId;
    if (m.params.command)
      x.params.command = m.params.command;
    if (m.params.args)
      x.params.argCount = m.params.args.length;
    if (m.params.terminalId)
      x.params.terminalId = m.params.terminalId;
  }
  if (m.result) {
    x.result = {};
    for (const k of ["protocolVersion", "sessionId", "stopReason", "terminalId", "exitCode"])
      if (m.result[k] !== undefined) x.result[k] = m.result[k];
    if (m.result.signal !== undefined) x.result.signal = m.result.signal;
    if (m.result.agentInfo) x.result.agentInfo = m.result.agentInfo;
    if (m.result.agentCapabilities) x.result.agentCapabilities = m.result.agentCapabilities;
    if (m.result.configOptions)
      x.result.configOptions = m.result.configOptions.map(o => ({
        id: o.id,
        currentValue: o.currentValue,
        count: o.options?.length
      }));
    if (m.result.sessions)
      x.result.sessionCount = m.result.sessions.length;
  }
  if (m.error)
    x.error = { code: m.error.code, message: m.error.message };
  return x;
}

function call(id, method, params, timeoutMs = 20000) {
  return new Promise(resolve => {
    const timer = setTimeout(() => {
      pending.delete(id);
      resolve(null);
    }, timeoutMs);
    pending.set(id, { resolve, timer });
    send({ jsonrpc: "2.0", id, method, params });
  });
}

function sse(res, chunks) {
  res.writeHead(200, {
    "content-type": "text/event-stream",
    "cache-control": "no-cache",
    connection: "keep-alive"
  });
  let i = 0;
  const tick = () => {
    if (i < chunks.length) {
      res.write("data: " + JSON.stringify(chunks[i++]) + "\n\n");
      setTimeout(tick, 35);
    } else {
      res.write("data: [DONE]\n\n");
      res.end();
    }
  };
  tick();
}

function makeChunk(delta, finish = null) {
  return {
    id: "q6-chat",
    object: "chat.completion.chunk",
    created: 1,
    model: "q6-model",
    choices: [{ index: 0, delta, finish_reason: finish }]
  };
}

function textChunks(text) {
  const at = Math.ceil(text.length / 2);
  return [
    makeChunk({ role: "assistant", content: text.slice(0, at) }),
    makeChunk({ content: text.slice(at) }, "stop")
  ];
}

function handleAgentRequest(m) {
  const p = m.params || {};

  if (m.method === "session/request_permission") {
    const option =
      (p.options || []).find(o => o.kind === "allow_once") ||
      (p.options || [])[0];
    send({
      jsonrpc: "2.0",
      id: m.id,
      result: {
        outcome: option
          ? { outcome: "selected", optionId: option.optionId }
          : { outcome: "cancelled" }
      }
    });
    return;
  }

  if (m.method === "terminal/create") {
    const terminalId = "q6-terminal-" + nextTerminal++;
    wire.push({
      clientReply: "terminal/create",
      terminalId,
      command: p.command,
      argCount: (p.args || []).length
    });
    send({
      jsonrpc: "2.0",
      id: m.id,
      result: { terminalId }
    });
    return;
  }

  if (m.method === "terminal/output") {
    send({
      jsonrpc: "2.0",
      id: m.id,
      result: {
        output: "Q6_SYNTHETIC_TERMINAL_OK\n",
        truncated: false,
        exitStatus: { exitCode: 0, signal: null }
      }
    });
    return;
  }

  if (m.method === "terminal/wait_for_exit") {
    send({
      jsonrpc: "2.0",
      id: m.id,
      result: { exitCode: 0, signal: null }
    });
    return;
  }

  if (m.method === "terminal/release" || m.method === "terminal/kill") {
    send({ jsonrpc: "2.0", id: m.id, result: {} });
    return;
  }

  if (m.method === "fs/read_text_file") {
    send({
      jsonrpc: "2.0",
      id: m.id,
      result: { content: "Q6_SYNTHETIC_FILE\n" }
    });
    return;
  }

  if (m.method === "fs/write_text_file") {
    send({
      jsonrpc: "2.0",
      id: m.id,
      error: { code: -32603, message: "Q6 probe denies writes" }
    });
    return;
  }

  send({
    jsonrpc: "2.0",
    id: m.id,
    error: {
      code: -32601,
      message: "Q6 probe unsupported client method " + m.method
    }
  });
}

async function main() {
  server = http.createServer((req, res) => {
    let body = "";
    req.on("data", d => body += d.toString());
    req.on("end", () => {
      let j = {};
      try {
        j = JSON.parse(body);
      } catch {}

      const messages = Array.isArray(j.messages) ? j.messages : [];
      const userText = messages
        .filter(m => m.role === "user")
        .map(m => typeof m.content === "string" ? m.content : JSON.stringify(m.content))
        .join(" ");
      const hasToolResult = messages.some(
        m => m.role === "tool" || m.role === "function"
      );
      const toolNames = (j.tools || [])
        .map(t => t.function?.name || t.name)
        .filter(Boolean);

      serverCalls.push({
        path: req.url,
        model: j.model,
        stream: j.stream === true,
        roles: messages.map(m => m.role),
        userText: userText.slice(-100),
        toolNames,
        hasToolResult
      });

      if (req.url.endsWith("/models")) {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({
          object: "list",
          data: [
            { id: "q6-model", object: "model", owned_by: "q6" },
            { id: "q6-model-2", object: "model", owned_by: "q6" }
          ]
        }));
        return;
      }

      if (!req.url.endsWith("/chat/completions")) {
        res.writeHead(404);
        res.end();
        return;
      }

      if (userText.includes("Q6_CANCEL_PROBE")) {
        setTimeout(() => {
          if (!res.writableEnded)
            sse(res, textChunks("Q6_CANCEL_LATE"));
        }, 8000);
        return;
      }

      if (userText.includes("Q6_TOOL_PROBE") && !hasToolResult) {
        const name = toolNames.includes("bash") ? "bash" : toolNames[0];
        if (!name) {
          sse(res, textChunks("Q6_NO_TOOL_DECLARED"));
          return;
        }

        const args =
          name === "bash"
            ? {
                command: "echo FLEETSPLICE_Q6_TOOL",
                description: "harmless Q6 probe"
              }
            : {
                filePath: path.join(temp, "q6-fixture.txt")
              };

        sse(res, [
          makeChunk({
            role: "assistant",
            tool_calls: [{
              index: 0,
              id: "call-q6",
              type: "function",
              function: {
                name,
                arguments: JSON.stringify(args)
              }
            }]
          }, "tool_calls")
        ]);
        return;
      }

      sse(
        res,
        textChunks(hasToolResult ? "Q6_TOOL_RESULT_OK" : "Q6_SIMPLE_OK")
      );
    });
  });

  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  const pkg = "@" + "ai-sdk/openai-compatible";

  const cfg = {
    model: "q6/q6-model",
    provider: {
      q6: {
        npm: pkg,
        name: "Q6 Local",
        options: {
          baseURL: "http" + ":" + "//127.0.0.1:" + port + "/v1"
        },
        models: {
          "q6-model": {
            name: "Q6 Model",
            limit: { context: 32768, output: 8192 }
          },
          "q6-model-2": {
            name: "Q6 Model 2",
            limit: { context: 32768, output: 8192 }
          }
        }
      },
      q6b: {
        npm: pkg,
        name: "Q6 Local B",
        options: {
          baseURL: "http" + ":" + "//127.0.0.1:" + port + "/v1"
        },
        models: {
          "q6-model": {
            name: "Q6 Model B",
            limit: { context: 32768, output: 8192 }
          }
        }
      }
    },
    permission: { "*": "ask" }
  };

  const env = {
    ...process.env,
    OPENCODE_CONFIG_CONTENT: JSON.stringify(cfg),
    OPENCODE_CONFIG_DIR: path.join(temp, "config"),
    OPENCODE_DISABLE_MODELS_FETCH: "true",
    OPENCODE_DISABLE_DEFAULT_PLUGINS: "true",
    OPENCODE_DISABLE_AUTOUPDATE: "true",
    OPENCODE_DISABLE_LSP_DOWNLOAD: "true",
    XDG_CONFIG_HOME: path.join(temp, "config"),
    XDG_DATA_HOME: path.join(temp, "data"),
    XDG_STATE_HOME: path.join(temp, "state"),
    XDG_CACHE_HOME: path.join(temp, "cache")
  };

  child = spawn(exe, ["acp", "--cwd", temp], {
    cwd: temp,
    env,
    windowsHide: true,
    stdio: ["pipe", "pipe", "pipe"]
  });

  const rl = readline.createInterface({ input: child.stdout });

  rl.on("line", line => {
    let m;
    try {
      m = JSON.parse(line);
    } catch {
      wire.push({ parseError: line.slice(0, 200) });
      return;
    }

    wire.push({ agent: safe(m) });

    if (m.id !== undefined && pending.has(m.id) && !m.method) {
      const p = pending.get(m.id);
      pending.delete(m.id);
      clearTimeout(p.timer);
      p.resolve(m);
    }

    if (m.method && m.id !== undefined)
      handleAgentRequest(m);
  });

  child.stderr.on("data", d =>
    wire.push({ stderr: d.toString().slice(0, 500) })
  );

  child.on("exit", (code, signal) =>
    wire.push({ childExit: { code, signal } })
  );

  const init = await call(
    0,
    "initialize",
    {
      protocolVersion: 1,
      clientCapabilities: {
        fs: { readTextFile: true, writeTextFile: true },
        terminal: true
      },
      clientInfo: {
        name: "fleetsplice-q6-probe",
        version: "0.0.0"
      }
    }
  );

  const nw = await call(
    1,
    "session/new",
    { cwd: temp, mcpServers: [] }
  );

  const sid = nw?.result?.sessionId;

  const simple = await call(
    2,
    "session/prompt",
    {
      sessionId: sid,
      messageId: "q6-msg-1",
      prompt: [{ type: "text", text: "Q6_SIMPLE_PROBE" }]
    },
    20000
  );

  const tool = await call(
    3,
    "session/prompt",
    {
      sessionId: sid,
      messageId: "q6-msg-2",
      prompt: [{ type: "text", text: "Q6_TOOL_PROBE" }]
    },
    25000
  );

  const load = await call(
    4,
    "session/load",
    { sessionId: sid, cwd: temp, mcpServers: [] },
    25000
  );

  const resume = await call(
    5,
    "session/resume",
    { sessionId: sid, cwd: temp, mcpServers: [] },
    20000
  );

  const list = await call(
    6,
    "session/list",
    { cwd: temp },
    15000
  );

  const model = await call(
    7,
    "session/set_config_option",
    {
      sessionId: sid,
      configId: "model",
      value: "q6b/q6-model"
    },
    15000
  );

  const close = await call(
    8,
    "session/close",
    { sessionId: sid },
    15000
  );

  console.log("RESULT " + JSON.stringify({
    version: "1.18.16",
    init: safe(init),
    newSession: safe(nw),
    simplePrompt: safe(simple),
    toolPrompt: safe(tool),
    load: safe(load),
    resume: safe(resume),
    list: safe(list),
    modelChange: safe(model),
    close: safe(close),
    eventCounts: {
      messages: wire.length,
      updates: wire.filter(x => x.agent?.method === "session/update").length,
      permissions: wire.filter(x => x.agent?.method === "session/request_permission").length,
      terminals: wire.filter(x => x.agent?.method?.startsWith("terminal/")).length
    },
    wire,
    serverCalls
  }));

  server.close();
  child.stdin.end();
  setTimeout(() => process.exit(0), 700);
}

setTimeout(() => {
  console.log("WATCHDOG");
  try { child?.stdin.end(); } catch {}
  try { child?.kill(); } catch {}
  try { server?.close(); } catch {}
  process.exit(2);
}, 55000);

main().catch(e => {
  console.log("FAIL " + String(e));
  try { child?.stdin.end(); } catch {}
  try { child?.kill(); } catch {}
  try { server?.close(); } catch {}
  process.exit(1);
});
