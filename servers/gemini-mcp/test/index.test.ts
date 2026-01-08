import { beforeEach, describe, expect, it, vi } from "vitest";
import { pathToFileURL } from "url";

vi.mock("../src/server.js", () => ({
  startServer: vi.fn(),
}));

const { startServer } = await import("../src/server.js");
const { runCli } = await import("../src/index.js");

describe("cli entry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts server when module is entrypoint", async () => {
    const entryPath = "/tmp/entry.ts";
    const entryUrl = pathToFileURL(entryPath).href;
    await runCli(["node", entryPath], entryUrl);
    expect(startServer).toHaveBeenCalledTimes(1);
  });

  it("does not start server when imported", async () => {
    const entryPath = "/tmp/entry.ts";
    const entryUrl = pathToFileURL(entryPath).href;
    await runCli(["node", "/tmp/other.ts"], entryUrl);
    expect(startServer).not.toHaveBeenCalled();
  });

  it("handles missing argv entry", async () => {
    const entryUrl = pathToFileURL("/tmp/entry.ts").href;
    await runCli(["node"], entryUrl);
    expect(startServer).not.toHaveBeenCalled();
  });
});
