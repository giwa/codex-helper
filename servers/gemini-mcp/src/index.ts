import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_TIMEOUT = 10 * 60 * 1000; // 10 minutes
const PROMPTS_DIR = join(__dirname, "../../prompts");

const server = new Server(
  { name: "gemini-mcp-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

const TOOLS = [
  {
    name: "gemini",
    description:
      "Run a Gemini session. Use for research, documentation, frontend code, multimodal analysis.",
    inputSchema: {
      type: "object" as const,
      properties: {
        prompt: {
          type: "string",
          description: "The task/question for Gemini",
        },
        model: {
          type: "string",
          description: "Model: gemini-2.5-pro, gemini-2.5-flash",
        },
        role: {
          type: "string",
          enum: ["oracle", "librarian", "frontend-engineer", "explore"],
          description: "Role prompt to auto-inject (optional)",
        },
        "approval-mode": {
          type: "string",
          enum: ["default", "auto_edit", "yolo"],
          description: "Approval mode for tool use",
        },
        sandbox: {
          type: "boolean",
          description: "Run in sandbox mode",
        },
        cwd: {
          type: "string",
          description: "Working directory",
        },
        timeout: {
          type: "number",
          description: "Timeout in ms (default: 600000)",
        },
      },
      required: ["prompt"],
    },
  },
  {
    name: "gemini-reply",
    description: "Continue an existing Gemini conversation",
    inputSchema: {
      type: "object" as const,
      properties: {
        sessionIndex: {
          type: "string",
          description: "Session index or 'latest'",
        },
        prompt: {
          type: "string",
          description: "Follow-up message",
        },
      },
      required: ["sessionIndex", "prompt"],
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!args) {
    return {
      content: [{ type: "text", text: "Error: No arguments provided" }],
      isError: true,
    };
  }

  try {
    if (name === "gemini") {
      const cliArgs = buildArgs(args as Record<string, unknown>);
      const timeout =
        (args.timeout as number | undefined) || DEFAULT_TIMEOUT;
      const result = await runGemini(cliArgs, timeout);
      return { content: [{ type: "text", text: result.output }] };
    }

    if (name === "gemini-reply") {
      const result = await runGemini(
        ["--resume", args.sessionIndex as string, args.prompt as string],
        DEFAULT_TIMEOUT
      );
      return { content: [{ type: "text", text: result.output }] };
    }

    return {
      content: [{ type: "text", text: `Unknown tool: ${name}` }],
      isError: true,
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
      isError: true,
    };
  }
});

function loadRolePrompt(role: string): string | null {
  const promptPath = join(PROMPTS_DIR, `${role}.md`);
  if (existsSync(promptPath)) {
    return readFileSync(promptPath, "utf-8");
  }
  return null;
}

function buildArgs(args: Record<string, unknown>): string[] {
  const cliArgs: string[] = [];

  if (args.model) cliArgs.push("-m", args.model as string);
  if (args["approval-mode"])
    cliArgs.push("--approval-mode", args["approval-mode"] as string);
  if (args.sandbox) cliArgs.push("--sandbox");
  if (args.cwd) cliArgs.push("--cwd", args.cwd as string);

  let prompt = args.prompt as string;
  if (args.role) {
    const rolePrompt = loadRolePrompt(args.role as string);
    if (rolePrompt) {
      prompt = `${rolePrompt}\n\n---\n\nTask:\n${prompt}`;
    }
  }

  cliArgs.push(prompt);
  return cliArgs;
}

interface GeminiResult {
  output: string;
  exitCode: number;
  durationMs: number;
}

async function runGemini(
  args: string[],
  timeout: number
): Promise<GeminiResult> {
  const startTime = Date.now();

  const proc = Bun.spawn(["gemini", ...args], {
    stdout: "pipe",
    stderr: "pipe",
  });

  const timeoutId = setTimeout(() => {
    proc.kill();
  }, timeout);

  try {
    const [stdout, stderr] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
    ]);
    const exitCode = await proc.exited;
    clearTimeout(timeoutId);

    const durationMs = Date.now() - startTime;

    if (exitCode !== 0) {
      const errorInfo = [
        `Gemini failed (exit code ${exitCode})`,
        stderr ? `\nStderr: ${stderr}` : "",
        stdout ? `\nPartial output: ${stdout}` : "",
      ].join("");
      throw new Error(errorInfo);
    }

    return { output: stdout, exitCode, durationMs };
  } catch (error) {
    clearTimeout(timeoutId);
    if ((error as Error).message.includes("exit code")) {
      throw error;
    }
    throw new Error(`Gemini timed out after ${timeout}ms`);
  }
}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Gemini MCP server running on stdio");
}

main().catch(console.error);
