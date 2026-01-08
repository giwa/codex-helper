import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EventEmitter } from "events";
import { ChildProcess } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import {
  loadRolePrompt,
  buildArgs,
  runGemini,
  cleanup,
  callToolHandler,
  isValidRole,
  registerSignalHandlers,
  createServer,
  startServer,
  TOOLS,
  DEFAULT_TIMEOUT,
  VALID_ROLES,
} from "../src/server.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROMPTS_DIR = join(__dirname, "../../../prompts");

describe("loadRolePrompt", () => {
  it("returns null for non-existent role", () => {
    const result = loadRolePrompt("nonexistent", "/fake/path");
    expect(result).toBeNull();
  });

  it("loads existing role prompt", () => {
    const result = loadRolePrompt("oracle", PROMPTS_DIR);
    expect(result).not.toBeNull();
    expect(result).toContain("strategic");
  });
});

describe("buildArgs", () => {
  it("builds args with just prompt", () => {
    const args = buildArgs({ prompt: "test prompt" }, "/fake/path");
    expect(args).toEqual(["test prompt"]);
  });

  it("includes model flag", () => {
    const args = buildArgs(
      { prompt: "test", model: "gemini-2.5-pro" },
      "/fake/path"
    );
    expect(args).toContain("-m");
    expect(args).toContain("gemini-2.5-pro");
  });

  it("includes approval-mode flag", () => {
    const args = buildArgs(
      { prompt: "test", "approval-mode": "yolo" },
      "/fake/path"
    );
    expect(args).toContain("--approval-mode");
    expect(args).toContain("yolo");
  });

  it("includes sandbox flag", () => {
    const args = buildArgs({ prompt: "test", sandbox: true }, "/fake/path");
    expect(args).toContain("--sandbox");
  });

  it("includes cwd flag", () => {
    const args = buildArgs({ prompt: "test", cwd: "/some/path" }, "/fake/path");
    expect(args).toContain("--cwd");
    expect(args).toContain("/some/path");
  });

  it("injects role prompt when role is valid", () => {
    const args = buildArgs({ prompt: "test task", role: "oracle" }, PROMPTS_DIR);
    const promptArg = args[args.length - 1];
    expect(promptArg).toContain("test task");
    expect(promptArg).toContain("Task:");
  });

  it("warns on invalid role and proceeds without injection", () => {
    const mockLogger = vi.fn();
    const args = buildArgs({ prompt: "test task", role: "invalid" }, "/fake", mockLogger);
    expect(args).toEqual(["test task"]);
    expect(mockLogger).toHaveBeenCalledWith(
      expect.stringContaining('Invalid role "invalid"')
    );
    expect(mockLogger).toHaveBeenCalledWith(
      expect.stringContaining("Valid roles:")
    );
  });

  it("does not warn on valid role", () => {
    const mockLogger = vi.fn();
    buildArgs({ prompt: "test task", role: "oracle" }, PROMPTS_DIR, mockLogger);
    expect(mockLogger).not.toHaveBeenCalled();
  });
});

describe("runGemini", () => {
  let mockProc: ChildProcess & EventEmitter;
  let mockSpawn: ReturnType<typeof vi.fn>;
  let processes: Set<ChildProcess>;

  beforeEach(() => {
    processes = new Set();
    mockProc = new EventEmitter() as ChildProcess & EventEmitter;
    mockProc.stdout = new EventEmitter() as NodeJS.ReadableStream;
    mockProc.stderr = new EventEmitter() as NodeJS.ReadableStream;
    mockProc.kill = vi.fn();

    mockSpawn = vi.fn().mockReturnValue(mockProc);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("spawns gemini with args", async () => {
    const promise = runGemini(["arg1", "arg2"], 5000, mockSpawn, processes);

    (mockProc.stdout as EventEmitter).emit("data", Buffer.from("output"));
    mockProc.emit("close", 0);

    const result = await promise;
    expect(mockSpawn).toHaveBeenCalledWith("gemini", ["arg1", "arg2"], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    expect(result.output).toBe("output");
    expect(result.exitCode).toBe(0);
  });

  it("tracks process in active set", async () => {
    const promise = runGemini(["test"], 5000, mockSpawn, processes);

    expect(processes.has(mockProc)).toBe(true);

    mockProc.emit("close", 0);
    await promise;

    expect(processes.has(mockProc)).toBe(false);
  });

  it("throws on non-zero exit code", async () => {
    const promise = runGemini(["test"], 5000, mockSpawn, processes);

    (mockProc.stderr as EventEmitter).emit("data", Buffer.from("error msg"));
    mockProc.emit("close", 1);

    await expect(promise).rejects.toThrow("Gemini failed (exit code 1)");
    await expect(promise).rejects.toThrow("error msg");
  });

  it("throws on timeout", async () => {
    vi.useFakeTimers();

    const promise = runGemini(["test"], 100, mockSpawn, processes);

    vi.advanceTimersByTime(150);
    mockProc.emit("close", 0);

    await expect(promise).rejects.toThrow("Gemini timed out after 100ms");
    expect(mockProc.kill).toHaveBeenCalled();

    vi.useRealTimers();
  });

  it("cleans up on error", async () => {
    const promise = runGemini(["test"], 5000, mockSpawn, processes);

    mockProc.emit("error", new Error("spawn failed"));

    await expect(promise).rejects.toThrow("spawn failed");
    expect(processes.has(mockProc)).toBe(false);
  });
});

describe("cleanup", () => {
  it("kills all processes and clears set", () => {
    const mockProc1 = { kill: vi.fn() } as unknown as ChildProcess;
    const mockProc2 = { kill: vi.fn() } as unknown as ChildProcess;
    const processes = new Set([mockProc1, mockProc2]);

    cleanup(processes);

    expect(mockProc1.kill).toHaveBeenCalled();
    expect(mockProc2.kill).toHaveBeenCalled();
    expect(processes.size).toBe(0);
  });

  it("handles already-exited processes", () => {
    const mockProc = {
      kill: vi.fn().mockImplementation(() => {
        throw new Error("Process already exited");
      }),
    } as unknown as ChildProcess;
    const processes = new Set([mockProc]);

    expect(() => cleanup(processes)).not.toThrow();
    expect(processes.size).toBe(0);
  });
});

describe("callToolHandler", () => {
  const mockRunGemini = vi.fn();

  beforeEach(() => {
    mockRunGemini.mockReset();
  });

  it("returns error when no arguments provided", async () => {
    const result = await callToolHandler(
      { params: { name: "gemini", arguments: null } },
      mockRunGemini
    );

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("No arguments provided");
  });

  it("handles gemini tool call", async () => {
    mockRunGemini.mockResolvedValue({
      output: "response text",
      exitCode: 0,
      durationMs: 100,
    });

    const result = await callToolHandler(
      { params: { name: "gemini", arguments: { prompt: "test" } } },
      mockRunGemini
    );

    expect(result.content[0].text).toBe("response text");
    expect(mockRunGemini).toHaveBeenCalled();
  });

  it("handles gemini-reply tool call", async () => {
    mockRunGemini.mockResolvedValue({
      output: "reply text",
      exitCode: 0,
      durationMs: 100,
    });

    const result = await callToolHandler(
      {
        params: {
          name: "gemini-reply",
          arguments: { sessionIndex: "latest", prompt: "follow up" },
        },
      },
      mockRunGemini
    );

    expect(result.content[0].text).toBe("reply text");
    expect(mockRunGemini).toHaveBeenCalledWith(
      ["--resume", "latest", "follow up"],
      DEFAULT_TIMEOUT
    );
  });

  it("returns error for unknown tool", async () => {
    const result = await callToolHandler(
      { params: { name: "unknown", arguments: { prompt: "test" } } },
      mockRunGemini
    );

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Unknown tool");
  });

  it("handles runGemini errors", async () => {
    mockRunGemini.mockRejectedValue(new Error("CLI failed"));

    const result = await callToolHandler(
      { params: { name: "gemini", arguments: { prompt: "test" } } },
      mockRunGemini
    );

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("CLI failed");
  });

  it("respects custom timeout", async () => {
    mockRunGemini.mockResolvedValue({
      output: "ok",
      exitCode: 0,
      durationMs: 100,
    });

    await callToolHandler(
      { params: { name: "gemini", arguments: { prompt: "test", timeout: 30000 } } },
      mockRunGemini
    );

    expect(mockRunGemini).toHaveBeenCalledWith(expect.any(Array), 30000);
  });

  it("handles gemini-health tool call", async () => {
    const result = await callToolHandler(
      { params: { name: "gemini-health", arguments: {} } },
      mockRunGemini
    );

    expect(result.isError).toBeUndefined();
    const response = JSON.parse(result.content[0].text);
    expect(response.status).toBe("healthy");
    expect(response.version).toBe("1.0.0");
    expect(typeof response.uptime).toBe("number");
    expect(typeof response.activeProcesses).toBe("number");
  });
});

describe("TOOLS", () => {
  it("defines gemini tool with required schema", () => {
    const geminiTool = TOOLS.find((t) => t.name === "gemini");
    expect(geminiTool).toBeDefined();
    expect(geminiTool?.inputSchema.required).toContain("prompt");
  });

  it("defines gemini-reply tool with required schema", () => {
    const replyTool = TOOLS.find((t) => t.name === "gemini-reply");
    expect(replyTool).toBeDefined();
    expect(replyTool?.inputSchema.required).toContain("sessionIndex");
    expect(replyTool?.inputSchema.required).toContain("prompt");
  });

  it("defines gemini-health tool with no required params", () => {
    const healthTool = TOOLS.find((t) => t.name === "gemini-health");
    expect(healthTool).toBeDefined();
    expect(healthTool?.inputSchema.required).toEqual([]);
  });
});

describe("DEFAULT_TIMEOUT", () => {
  it("is 10 minutes", () => {
    expect(DEFAULT_TIMEOUT).toBe(10 * 60 * 1000);
  });
});

describe("VALID_ROLES", () => {
  it("includes expected roles", () => {
    expect(VALID_ROLES).toContain("oracle");
    expect(VALID_ROLES).toContain("librarian");
    expect(VALID_ROLES).toContain("frontend-engineer");
    expect(VALID_ROLES).toContain("explore");
  });
});

describe("isValidRole", () => {
  it("returns true for valid roles", () => {
    expect(isValidRole("oracle")).toBe(true);
    expect(isValidRole("librarian")).toBe(true);
    expect(isValidRole("frontend-engineer")).toBe(true);
    expect(isValidRole("explore")).toBe(true);
  });

  it("returns false for invalid roles", () => {
    expect(isValidRole("invalid")).toBe(false);
    expect(isValidRole("")).toBe(false);
    expect(isValidRole("Oracle")).toBe(false); // case sensitive
  });
});

describe("registerSignalHandlers", () => {
  it("registers SIGINT and SIGTERM handlers", () => {
    const mockProcess = {
      on: vi.fn(),
      off: vi.fn(),
      exit: vi.fn(),
    } as unknown as NodeJS.Process;
    const mockCleanup = vi.fn();

    registerSignalHandlers(mockCleanup, mockProcess);

    expect(mockProcess.on).toHaveBeenCalledWith("SIGINT", expect.any(Function));
    expect(mockProcess.on).toHaveBeenCalledWith("SIGTERM", expect.any(Function));
  });

  it("returns unregister function that removes handlers", () => {
    const mockProcess = {
      on: vi.fn(),
      off: vi.fn(),
      exit: vi.fn(),
    } as unknown as NodeJS.Process;
    const mockCleanup = vi.fn();

    const unregister = registerSignalHandlers(mockCleanup, mockProcess);
    unregister();

    expect(mockProcess.off).toHaveBeenCalledWith("SIGINT", expect.any(Function));
    expect(mockProcess.off).toHaveBeenCalledWith("SIGTERM", expect.any(Function));
  });

  it("calls cleanup and exit on signal", () => {
    let sigintHandler: () => void;
    const mockProcess = {
      on: vi.fn((event: string, handler: () => void) => {
        if (event === "SIGINT") sigintHandler = handler;
      }),
      off: vi.fn(),
      exit: vi.fn(),
    } as unknown as NodeJS.Process;
    const mockCleanup = vi.fn();

    registerSignalHandlers(mockCleanup, mockProcess);
    sigintHandler!();

    expect(mockCleanup).toHaveBeenCalled();
    expect(mockProcess.exit).toHaveBeenCalledWith(0);
  });
});

describe("createServer", () => {
  it("creates a server with tool handlers", () => {
    const mockRunGemini = vi.fn();
    const server = createServer(mockRunGemini);

    expect(server).toBeDefined();
    expect(typeof server.connect).toBe("function");
  });
});

describe("startServer", () => {
  it("connects server to transport and logs", async () => {
    const mockServer = {
      connect: vi.fn().mockResolvedValue(undefined),
    };
    const mockTransport = {};
    const mockLog = vi.fn();
    const mockRegisterSignals = vi.fn();

    await startServer(
      () => mockServer as any,
      () => mockTransport as any,
      mockRegisterSignals,
      mockLog
    );

    expect(mockServer.connect).toHaveBeenCalledWith(mockTransport);
    expect(mockRegisterSignals).toHaveBeenCalled();
    expect(mockLog).toHaveBeenCalledWith("Gemini MCP server running on stdio");
  });
});
