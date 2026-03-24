# autoresearch Digest

- **URL**: https://github.com/karpathy/autoresearch
- **Date Researched**: 2026-03-24

## 🛠 Tech Stack

- **Primary Language**: Python 3.10+
- **Frameworks/Libraries**:
  - `torch==2.9.1` (CUDA 12.8, BF16 training)
  - `kernels` — Flash Attention 3 kernel loader (Hopper: `varunneal/flash-attention-3`, non-Hopper: `kernels-community/flash-attn3`)
  - `rustbpe` — fast Rust-backed BPE tokenizer trainer
  - `tiktoken` — tokenizer encoding/decoding
  - `pyarrow` — Parquet data loading
  - `numpy`, `pandas`, `matplotlib`, `requests`
- **Build/Package Tools**: `uv` (astral.sh) with a `pyproject.toml`; PyTorch sourced from `pytorch-cu128` index

---

## 🚀 Key Features

- **Autonomous experiment loop**: An AI agent (Claude, Codex, etc.) reads `program.md`, iteratively edits `train.py`, trains for exactly 5 minutes, evaluates `val_bpb`, and keeps or discards each change — indefinitely, without human intervention.
- **Fixed 5-minute time budget**: All experiments are directly comparable regardless of model size, architecture, or batch size changes. ~12 experiments/hour, ~100 during a sleep cycle.
- **Single-file agent target**: The agent only modifies `train.py`. Everything is fair game: model architecture, optimizer, hyperparameters, training loop. `prepare.py` is immutable.
- **`program.md` as research org config**: The human programs the research strategy via a Markdown "skill" file, not Python. Iterating on `program.md` is how you improve the research swarm.
- **Vocabulary-independent metric**: `val_bpb` (bits per byte) normalizes by UTF-8 byte length of target tokens, so architectural changes that affect vocab size remain fairly comparable.
- **Built-in simplicity criterion**: `program.md` instructs the agent to prefer simpler code — a small gain that adds 20 lines of hacks is rejected; equal performance from *fewer* lines is a win.

---

## 🏗 High-Level Architecture

autoresearch is a **human-out-of-the-loop research automation** framework. The system has three layers:

```
Human
  └─ edits ──► program.md (research strategy / agent instructions)
                    │
                    ▼
              AI Agent (Claude / Codex / etc.)
                    │
          reads ────┤──── modifies
                    │         │
              README.md    train.py  ◄──── only editable file
              prepare.py               (GPT model + MuonAdamW optimizer)
                    │
                    ▼
             uv run train.py  (5-min wall clock run)
                    │
                    ▼
              val_bpb metric
                    │
           keep ────┴──── discard (git reset)
                    │
              results.tsv  (untracked, human reviews on wake-up)
```

`prepare.py` provides the **fixed evaluation harness** and data pipeline that the agent cannot touch. `train.py` is the **mutable experiment surface**. `program.md` is the **agent's operating manual** — a lightweight skill that orchestrates the experiment loop.

---

## 📂 Directory Structure (Core)

```
autoresearch/
├── prepare.py        # Fixed: constants, data download, BPE tokenizer, dataloader, evaluate_bpb
├── train.py          # Agent-editable: GPT model, MuonAdamW optimizer, training loop
├── program.md        # Human-editable: agent instructions and experiment loop protocol
├── pyproject.toml    # uv project config, PyTorch CUDA 12.8 dependency
├── analysis.ipynb    # Jupyter notebook for results analysis
├── progress.png      # Teaser image of experiment progress
└── uv.lock           # Locked dependency tree
```

---

## 🎯 Main Entry Points

- **`prepare.py`** — One-time setup: downloads `climbmix-400b-shuffle` Parquet shards from HuggingFace, trains an 8192-vocab BPE tokenizer via `rustbpe`, saves to `~/.cache/autoresearch/`. Also exports `MAX_SEQ_LEN`, `TIME_BUDGET`, `Tokenizer`, `make_dataloader`, `evaluate_bpb` for use by `train.py`.
- **`train.py`** — Full training run: initializes GPT from `GPTConfig`, sets up `MuonAdamW` optimizer, runs a gradient-accumulation training loop for 5 wall-clock minutes, then prints a structured summary (`val_bpb`, `peak_vram_mb`, `mfu_percent`, etc.). Launched via `uv run train.py`.
- **`program.md`** — The agent's skill entrypoint. Instructs the agent on: branch setup, experiment loop mechanics, logging format (`results.tsv`), keep/discard decision rule, and the non-negotiable `NEVER STOP` directive.

---

## 🔬 Model Architecture (`train.py` baseline)

The baseline GPT in `train.py` incorporates several recent research techniques:

| Component | Implementation |
|-----------|----------------|
| **Attention** | GQA-capable `CausalSelfAttention` (n_kv_head ≤ n_head), via Flash Attention 3 |
| **Position encoding** | RoPE (Rotary Position Embeddings), precomputed up to 10× seq_len |
| **QK normalization** | RMS norm applied to Q and K before attention |
| **Sliding window** | `WINDOW_PATTERN = "SSSL"` — 3 layers use half-context window, 1 uses full; last layer always full |
| **Value residual** | ResFormer-style: alternating layers receive a learned `value_embeds` embedding gated per-head (gate init → neutral) |
| **Residual scaling** | Per-layer `resid_lambdas` (init 1.0) and `x0_lambdas` (init 0.1) blend residual stream with input `x0` |
| **MLP activation** | ReLU² (`F.relu(x).square()`) |
| **Logit soft-cap** | `15 * tanh(logits / 15)` (stabilizes large logits) |
| **Default size** | DEPTH=8, ASPECT_RATIO=64 → 768 dim, 6 heads → ~50M params |

---

## ⚙️ Optimizer: MuonAdamW

A single-GPU combined optimizer, `@torch.compile`-d for performance:

| Parameter Group | Optimizer | Notes |
|----------------|-----------|-------|
| 2D matrix weights (attention, MLP) | **Muon** | Newton-Schulz orthogonalization ("Polar Express" 5-step), NorMuon variance reduction, cautious weight decay |
| Token embeddings | AdamW | LR scaled by `1/√(dmodel/768)` |
| LM head | AdamW | Separate lower LR |
| Value embeddings | AdamW | Same as embeddings |
| `resid_lambdas` | AdamW | Very low LR (scalar_lr × 0.01) |
| `x0_lambdas` | AdamW | Higher LR, (0.96, 0.95) betas |

LR schedule: optional warmup → flat → warmdown (50% of budget, to 0). Muon momentum ramps 0.85→0.95 over first 300 steps. Weight decay decays linearly to 0 by end of run.

---

## 📊 Evaluation: `val_bpb`

```python
val_bpb = Σ(cross_entropy_nats × [target_byte_len > 0]) / (log(2) × Σ target_byte_len)
```

- Computed on a **pinned validation shard** (`shard_06542.parquet`) — never seen during training
- Special tokens (BOS etc.) excluded from both numerator and denominator
- Fixed `MAX_SEQ_LEN = 2048`, `EVAL_TOKENS = 40 × 524288` — constant across all experiments
- Lower is better. Vocab-size-independent: changing vocab size doesn't inflate/deflate the metric

---

## 📝 Observations & Patterns

- **Markdown-as-skill-layer**: `program.md` is functionally a Vibe Hub–style skill file. The human's role is to iterate on this "research org code," not the Python. This directly parallels how Vibe Hub's `SKILL.md` files configure agent behavior.
- **Immutable evaluation harness**: `prepare.py` is explicitly read-only. This is the same HARD-GATE principle as Vibe Hub's skill checkpoints — the evaluation contract cannot be gamed by the agent.
- **Git as experiment log**: Each kept experiment is a git commit; discarded runs are `git reset`-ed. `results.tsv` is intentionally untracked — it's the human's review artifact, not a versioned artifact.
- **Fast-fail built in**: Training loop checks `isnan(loss) or loss > 100` and calls `exit(1)` immediately. Crash handling in `program.md` mirrors this — 3 fix attempts max, then discard and move on.
- **GC disabled mid-run**: After step 0 (`gc.disable()`), Python GC is frozen to prevent ~500ms stalls in the fixed time budget. Re-enabled every 5000 steps.
- **No padding in dataloader**: Best-fit bin packing achieves 100% token utilization per batch row. When no document fits remaining space, the shortest available doc is cropped to fill exactly.
- **Platform portability via forks**: The mainline requires a single NVIDIA GPU (H100). MacOS (MLX), Windows (RTX), and AMD forks exist as community extensions — karpathy explicitly punts on multi-platform mainline support to keep the code minimal.

---

## 🛠 How to Run

```bash
# 1. Install uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# 2. Install dependencies
uv sync

# 3. One-time data + tokenizer prep (~2 min)
uv run prepare.py

# 4. Single manual training run (~5 min)
uv run train.py

# 5. Autonomous agent mode — point Claude/Codex at the repo and prompt:
# "Have a look at program.md and let's kick off a new experiment!"
```

**Requirements**: Single NVIDIA GPU (tested on H100), Python 3.10+, CUDA 12.8.
