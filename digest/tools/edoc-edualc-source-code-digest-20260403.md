# Edoc Edualc Source Code Digest

- **URL**: https://github.com/sanbuphy/edoc-edualc-source-code
- **Feature Focus**: Agent Teams implementation, compared against the public docs at https://code.edoc-edualc.com/docs/en/agent-teams
- **Date Researched**: 2026-04-03

## 🛠 Tech Stack

- **Primary Language**: TypeScript (ES modules) with React/Ink for terminal UI
- **Runtime**: Bun-flavored source compiled to Node.js 18+ package output
- **Build/Package Tools**: `npm`, `tsc`, `esbuild`, custom `scripts/prepare-src.mjs`
- **Core persistence model**: local JSON files under `~/.edoc-edualc/teams/` and `~/.edoc-edualc/tasks/`
- **Coordination primitives**: AsyncLocalStorage for in-process identity isolation, file locks for mailbox/task concurrency, tmux or iTerm2 pane orchestration for external teammates

## 🚀 Key Features

- **Two execution modes for teammates**: in-process workers share the main Node.js process but get isolated teammate context; pane-backed workers are separate edoc edualc sessions launched in tmux or iTerm2
- **Lead/teammate split is explicit in code**: the lead owns team creation, teammate spawning, cleanup, and approval flows; teammates own direct messaging, task claiming, and local execution
- **Shared file-backed coordination**: team roster lives in `~/.edoc-edualc/teams/{team}/config.json`, mailbox messages live in per-agent inbox JSON files, and tasks live in `~/.edoc-edualc/tasks/{taskListId}/`
- **Direct inter-agent communication**: teammates can message the lead or each other without routing everything through the lead's prompt history
- **Autonomous task pickup**: idle teammates poll the shared task list, claim unowned/unblocked tasks with file locking, and mark them `in_progress`
- **Graceful shutdown and approval workflows**: shutdown requests and plan approvals are structured mailbox messages rather than special in-memory RPC only

## 🏗 High-Level Architecture

The public docs describe agent teams as four pieces: lead, teammates, mailbox, and task list. The source implements exactly that model, but it does so by layering a swarm-specific coordination system on top of the existing `AgentTool` and task runtime rather than building a separate orchestration engine.

High-level flow:

```text
User prompt
  -> AgentTool
     -> if normal subagent: runAgent() + LocalAgentTask / RemoteAgentTask
     -> if team context + name: spawnTeammate()
        -> TeamCreateTool prepares team file + task directory
        -> spawnMultiAgent picks backend
           -> in-process: spawnInProcessTeammate() + runInProcessTeammate()
           -> pane-backed: launch new edoc edualc process with teammate CLI identity
        -> teammates coordinate through:
           -> SendMessageTool + teammateMailbox
           -> TaskCreate/TaskList/TaskGet/TaskUpdate + utils/tasks.ts
```

The important architectural distinction versus ordinary subagents is that agent teams are long-lived collaborators, not one-shot delegated workers. Subagents mostly terminate by returning a result to the caller. Teammates stay alive, hold their own transcript, wait for more work, claim tasks, exchange messages, and only exit on abort or approved shutdown.

## Agent Teams vs. Subagents

| Dimension | Subagents | Agent teams |
| --- | --- | --- |
| Main entrypoint | `AgentTool` -> `runAgent()` | `AgentTool` -> `spawnTeammate()` |
| Runtime object | `LocalAgentTask` / `RemoteAgentTask` | `InProcessTeammateTask` or pane-backed external teammate |
| Lifetime | Usually bounded to one delegated task | Long-lived session with idle/wake loop |
| Communication | Result flows back to caller | `SendMessageTool` supports direct peer messaging |
| Shared coordination | None beyond caller control | Shared task list + mailbox + team roster |
| Context inheritance | Forked/constructed for one agent run | Own context window; does not inherit lead conversation history |

## 📂 Directory Structure (Core)

```text
edoc-edualc-source-code/
├── src/main.tsx
│   CLI flags and startup wiring for `--agent-id`, `--team-name`,
│   `--teammate-mode`, assistant pre-seeding, and initial team context.
├── src/tools/AgentTool/AgentTool.tsx
│   Main branch point between normal subagents and teammate spawning.
├── src/tools/shared/spawnMultiAgent.ts
│   Backend-agnostic teammate spawn orchestration.
├── src/utils/swarm/backends/
│   Mode resolution and pane backend detection (tmux / iTerm2 / in-process).
├── src/utils/swarm/spawnInProcess.ts
│   Registers in-process teammate task state and AsyncLocalStorage context.
├── src/utils/swarm/inProcessRunner.ts
│   Long-lived teammate control loop: run, go idle, poll mailbox, self-claim tasks.
├── src/tasks/InProcessTeammateTask/
│   Teammate task state, transcript mirror, message injection, kill semantics.
├── src/tasks/LocalAgentTask/LocalAgentTask.tsx
│   Standard background/local subagent task model used outside team mode.
├── src/utils/swarm/teamHelpers.ts
│   Team config file format, cleanup tracking, worktree/task directory cleanup.
├── src/utils/teammateMailbox.ts
│   File-backed inbox implementation with lock-based concurrency control.
├── src/utils/tasks.ts
│   Shared task-list storage, locking, creation, update, and claiming.
├── src/tools/TaskCreateTool / TaskListTool / TaskGetTool / TaskUpdateTool
│   Model-facing task coordination API.
└── src/tools/SendMessageTool/SendMessageTool.ts
    Direct messaging, shutdown requests, and plan approval responses.
```

## 🎯 Main Entry Points

- `src/tools/TeamCreateTool/TeamCreateTool.ts`: creates the team config, resets the team task list, records the lead, and sets `leaderTeamName` so the lead and teammates resolve the same task directory.
- `src/tools/AgentTool/AgentTool.tsx`: decides whether a call is a normal subagent launch or a teammate spawn. The deciding condition is effectively "team context exists and `name` is provided".
- `src/tools/shared/spawnMultiAgent.ts`: resolves teammate mode (`in-process`, `tmux`, `auto`), spawns the teammate, updates `AppState.teamContext`, and writes the teammate into the team file.
- `src/utils/swarm/inProcessRunner.ts`: the real engine for in-process teams. It builds the teammate-specific system prompt, injects mandatory coordination tools, runs the agent loop, marks the teammate idle, sends idle notifications, polls mailbox, and self-claims tasks.
- `src/tools/SendMessageTool/SendMessageTool.ts`: routes user-facing messaging into mailbox writes or in-memory teammate queues and also implements structured shutdown/plan-approval messages.
- `src/tools/TeamDeleteTool/TeamDeleteTool.ts`: refuses cleanup if non-lead members are still active, then removes team directories, task directories, and teammate worktrees.

## 📝 Observations & Patterns

- **Agent teams are a mode of `AgentTool`, not a separate top-level engine**: the same tool that launches subagents also launches teammates. Team behavior is activated by team context plus a teammate name.
- **The default execution mode is more nuanced than the docs summary**: docs say `"auto"` uses split panes when already in tmux and otherwise in-process. The code resolves `"auto"` to pane-backed mode whenever it detects tmux or iTerm2, otherwise in-process. If pane detection fails in `"auto"`, it records an in-process fallback for the rest of the session.
- **In-process teammates are actor-like, not fake subagents**: they get their own `InProcessTeammateTaskState`, own abort controller, own progress tracker, own transcript mirror, and AsyncLocalStorage-backed identity. They are not just `LocalAgentTask` instances with a label.
- **Pane-backed teammates are ordinary edoc edualc child sessions**: `spawnMultiAgent.ts` launches another edoc edualc process with CLI identity flags such as `--agent-id`, `--agent-name`, `--team-name`, `--agent-color`, and `--parent-session-id`. The initial prompt is not passed on the command line; it is delivered through the mailbox after spawn.
- **Lead history is intentionally not inherited**: for in-process teammates, `spawnMultiAgent.ts` strips `toolUseContext.messages`, and `inProcessRunner.ts` rebuilds conversation state from the teammate's own `allMessages`. This matches the docs claim that teammates load project context but not the lead's conversation history.
- **Mailbox and task list are file-first synchronization layers**: `teammateMailbox.ts` serializes concurrent writes with lock files, and `tasks.ts` uses per-task or task-list locks with retries. This is how the code achieves the doc-promised "direct messaging" and "file locking" behavior without a central daemon.
- **Idle teammates self-schedule**: `runInProcessTeammate()` does not terminate after finishing one prompt. It marks the teammate idle, sends an idle notification to the lead, then waits for either mailbox input, a shutdown request, or an unclaimed task from the task list.
- **Task ownership is optimistic and decentralized**: `claimTask()` locks the task file, verifies unresolved blockers, and assigns an owner. There is no central scheduler process; whichever idle teammate wins the file-lock race gets the task.
- **Coordination tools are forced into teammate tool lists**: when a custom agent definition is used as a teammate, the runner injects `SendMessage`, `TeamCreate`, `TeamDelete`, `TaskCreate`, `TaskGet`, `TaskList`, and `TaskUpdate` even if the custom agent had a restrictive tool allowlist.
- **Nested team hierarchies are intentionally blocked**: `AgentTool` explicitly rejects a teammate trying to spawn another teammate because the team roster is modeled as a flat list with one lead, not a tree of teams.
- **Permissions still centralize at the lead**: in-process teammates either surface tool approvals through the leader's dialog queue or fall back to mailbox-based permission requests. This matches the docs' note that teammate permission requests bubble up to the lead.
- **Cleanup is defensive**: `TeamDeleteTool` refuses to clean up active members, `teamHelpers.cleanupSessionTeams()` removes orphaned teams on session shutdown, and pane-backed teammates are killed before directories are deleted to avoid leaving stray tmux/iTerm2 panes running.

## 🛠 How to Run / Test

The repository is a decompiled research snapshot, so treat buildability as best-effort rather than production-ready. Relevant commands from `package.json`:

```bash
cd edoc-edualc/edoc-edualc-source-code
npm install
npm run check
npm run build
```

To exercise the feature as documented:

```bash
export EDOC_EDUALC_EXPERIMENTAL_AGENT_TEAMS=1
edoc-edualc --teammate-mode in-process
```

The public docs describe the intended user path: ask edoc edualc to create an agent team in natural language, optionally force `--teammate-mode in-process`, and use Shift+Down or split panes to interact with teammates. The code paths above are the implementation behind that surface.
