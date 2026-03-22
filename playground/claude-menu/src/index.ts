#!/usr/bin/env node

import { readStdin } from './data/stdin.js';
import { getGitStatus } from './data/git.js';
import { getUsage } from './data/usage.js';
import { getEnvironment } from './data/environment.js';
import { parseTranscript } from './data/transcript.js';
import { loadConfig } from './config.js';
import { resolveMotto } from './motto/resolver.js';
import { render } from './render/index.js';
import type { MainDeps, RenderContext } from './types.js';

// ─── Terminal width detection ───────────────────────────────────────────────

function getTerminalWidth(): number {
  return (
    process.stdout.columns ||
    process.stderr.columns ||
    (process.env['COLUMNS'] ? parseInt(process.env['COLUMNS'], 10) : 0) ||
    120
  );
}

// ─── Main ───────────────────────────────────────────────────────────────────

export async function main(overrides: Partial<MainDeps> = {}): Promise<void> {
  const deps: MainDeps = {
    readStdin,
    getGitStatus,
    getUsage,
    getEnvironment,
    parseTranscript,
    loadConfig,
    resolveMotto,
    render,
    ...overrides,
  };

  // Load config and stdin in parallel
  const [config, stdin] = await Promise.all([
    deps.loadConfig(),
    deps.readStdin(),
  ]);

  const cwd = stdin.cwd || process.cwd();

  // Fetch all data sources in parallel
  const [git, usage, environment, transcript] = await Promise.all([
    deps.getGitStatus(cwd),
    deps.getUsage(),
    deps.getEnvironment(cwd),
    stdin.session?.transcript_path
      ? deps.parseTranscript(stdin.session.transcript_path)
      : Promise.resolve({ tools: [], agents: [], todos: [] }),
  ]);

  // Resolve motto
  const motto = deps.resolveMotto(config.motto);

  // Build render context
  const ctx: RenderContext = {
    stdin,
    git,
    usage,
    environment,
    tools: transcript.tools,
    agents: transcript.agents,
    todos: transcript.todos,
    motto,
    config,
    terminalWidth: getTerminalWidth(),
    cwd,
  };

  // Render and output
  const lines = deps.render(ctx);
  for (const line of lines) {
    console.log(line);
  }
}

// Run when executed directly
main().catch(() => {
  // Fail silently — never crash the statusline
});
