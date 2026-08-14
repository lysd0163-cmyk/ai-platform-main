export type CommandRisk = "safe" | "moderate" | "high";

export interface CommandPolicy {
  command: string;
  aliases?: string[];
  risk: CommandRisk;
}

export interface TerminalRequest {
  sessionId: string;
  command: string;
  cwd?: string;
  timeoutMs?: number;
}

export interface TerminalResult {
  id: string;
  status: "completed" | "rejected" | "timed_out" | "failed";
  stdout: string;
  stderr: string;
  exitCode: number | null;
  durationMs: number;
  command: string;
}

export interface SandboxAdapter {
  execute(request: TerminalRequest): Promise<TerminalResult>;
}

const DEFAULT_POLICY: CommandPolicy[] = [
  { command: "node", risk: "safe" },
  { command: "npm", risk: "safe" },
  { command: "pnpm", risk: "safe" },
  { command: "npx", risk: "safe" },
  { command: "python", risk: "safe" },
  { command: "python3", risk: "safe" },
  { command: "pytest", risk: "safe" },
  { command: "git", risk: "moderate" },
  { command: "tsc", risk: "safe" },
  { command: "eslint", risk: "safe" },
  { command: "echo", risk: "safe" },
  { command: "pwd", risk: "safe" },
  { command: "ls", risk: "safe" }
];

function firstToken(command: string): string {
  const match = command.trim().match(/^([A-Za-z0-9_.:-]+)/);
  return match?.[1] ?? "";
}

export class CommandGuard {
  constructor(private readonly policies: CommandPolicy[] = DEFAULT_POLICY) {}

  evaluate(command: string): CommandPolicy {
    const token = firstToken(command);
    const policy = this.policies.find((item) => item.command === token || item.aliases?.includes(token));
    if (!policy) throw new Error(`Command is not allowlisted: ${token || "<empty>"}`);
    if (/[;&|`$<>]/.test(command)) throw new Error("Shell chaining, substitution, and redirection are disabled");
    return policy;
  }
}

export class LocalProcessSandbox implements SandboxAdapter {
  constructor(private readonly guard = new CommandGuard()) {}

  async execute(request: TerminalRequest): Promise<TerminalResult> {
    const started = Date.now();
    this.guard.evaluate(request.command);

    const { spawn } = await import("node:child_process");
    const token = firstToken(request.command);
    const args = request.command.trim().slice(token.length).trim();
    const argv = args ? args.split(/\s+/).filter(Boolean) : [];
    const child = spawn(token, argv, {
      cwd: request.cwd,
      shell: false,
      stdio: ["ignore", "pipe", "pipe"]
    });

    const timeout = Math.max(250, request.timeoutMs ?? 30_000);
    let timedOut = false;
    const timeoutHandle = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, timeout);

    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    child.stdout.on("data", (chunk: Buffer) => stdout.push(chunk));
    child.stderr.on("data", (chunk: Buffer) => stderr.push(chunk));

    const exitCode = await new Promise<number | null>((resolve) => {
      child.once("close", (code) => resolve(code));
      child.once("error", () => resolve(null));
    });
    clearTimeout(timeoutHandle);

    const status: TerminalResult["status"] = timedOut
      ? "timed_out"
      : exitCode === 0
        ? "completed"
        : exitCode === null
          ? "failed"
          : "completed";

    return {
      id: crypto.randomUUID(),
      status,
      stdout: Buffer.concat(stdout).toString("utf8"),
      stderr: Buffer.concat(stderr).toString("utf8"),
      exitCode,
      durationMs: Date.now() - started,
      command: request.command
    };
  }
}

export interface SandboxJob {
  id: string;
  request: TerminalRequest;
  status: "queued" | "running" | "completed" | "rejected" | "failed";
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  result?: TerminalResult;
}

export class SandboxJobManager {
  private readonly jobs = new Map<string, SandboxJob>();

  constructor(private readonly adapter: SandboxAdapter) {}

  create(request: TerminalRequest): SandboxJob {
    const job: SandboxJob = {
      id: crypto.randomUUID(),
      request,
      status: "queued",
      createdAt: new Date().toISOString()
    };
    this.jobs.set(job.id, job);
    return job;
  }

  get(id: string): SandboxJob | undefined {
    return this.jobs.get(id);
  }

  async run(id: string): Promise<SandboxJob> {
    const job = this.jobs.get(id);
    if (!job) throw new Error(`Sandbox job not found: ${id}`);
    if (job.status !== "queued") return job;

    job.status = "running";
    job.startedAt = new Date().toISOString();
    try {
      job.result = await this.adapter.execute(job.request);
      job.status = job.result.status === "rejected" ? "rejected" : job.result.status === "failed" ? "failed" : "completed";
    } catch (error) {
      job.status = "failed";
      job.result = {
        id: crypto.randomUUID(),
        status: "failed",
        stdout: "",
        stderr: String(error),
        exitCode: null,
        durationMs: 0,
        command: job.request.command
      };
    }
    job.finishedAt = new Date().toISOString();
    return job;
  }
}
