---
author: Argha Ray
pubDatetime: 2026-04-10T22:00:00Z
title: "Helix — A Markdown-Files Memory Layer for a Personal AI Agent"
slug: giving-an-ai-agent-memory-that-survives-the-session
featured: true
draft: false
tags:
  - agents
  - architecture
  - python
  - memory
description: "How a folder of markdown files became the memory layer for a personal AI agent — and why it replaced a vector database."
---

## Table of contents

Every conversation with an LLM starts the same way: blank slate. No matter how good the last session was, the next one begins with zero context. The model doesn't remember what it said, what you decided, what went wrong, or what you're working on.

For a chatbot, this is fine. For an agent that's supposed to _know you_ — your projects, your patterns, your decisions, your goals — this is the core problem.

This is a writeup of Helix, the knowledge base behind [Jishu](https://jishu.argha.dev), a personal AI agent that runs 24/7 on a VPS. Helix is how Jishu remembers anything across sessions. It's not a vector database. It's not a RAG pipeline. It's a git repo full of markdown files.

That sounds underwhelming. It took a while to get here.

**The short version:** I started with Milvus + Ollama + an MCP server for semantic retrieval. It worked. Then I removed it — about 3 GB of local tooling — and replaced it with direct file reads plus Anthropic's prompt caching. The post covers what changed, why, and the tradeoffs.

## The Vector Database Phase

The first attempt at persistent memory was the obvious one: embeddings + vector search.

The setup was Milvus (vector database) running in Docker via Colima, with Ollama running `nomic-embed-text` locally for embeddings. An MCP server sat in front of it, providing semantic code search and sandboxed tool output storage in SQLite. The idea was that every useful piece of context would get embedded and retrieved on demand.

It worked. Queries returned relevant chunks. The architecture was sound.

The problems were all operational:

- **Colima + Milvus consumed ~3GB of RAM** just to sit idle. On a MacBook with other Docker workloads, this was felt.
- **Embedding quality was mediocre.** `nomic-embed-text` on a MacBook's Apple Silicon did about 3-5 tokens/sec for embedding generation. The results were okay, not great. The retrieval often missed context that was semantically obvious to a human but distant in embedding space.
- **Chunking was the real enemy.** The hardest problem wasn't vector search — it was deciding how to split context into chunks. A decision about using Bunny Stream over AWS is meaningless if the chunk boundary cuts off the rationale. A memory about a team member is useless without the project context around it.
- **The maintenance loop was real.** Ollama needed to be running before Milvus. Milvus needed Colima. The MCP server needed both. Shell functions (`claude-up`, `claude-down`, `ollama-start`) papered over this, but the dependency chain was fragile.

The original plan was to move Milvus to the VPS (24GB RAM, plenty of headroom) and keep Ollama local. Then API-level prompt caching came along — specifically Anthropic's automatic caching that discounts repeated context by 90%. That changed the math completely.

If the model itself can cache large context windows cheaply, the entire embed-retrieve-inject cycle becomes unnecessary for personal-scale data. The context window _is_ the retrieval mechanism. Just load the files directly.

Everything got ripped out: Milvus, Colima, Ollama, the MCP servers, all the shell functions, all the data directories. About 3GB of tooling replaced by file reads.

## What Helix Actually Is

Helix is a private git repository. It contains markdown files organized into layers. Jishu mounts it as a Docker volume at `/data/mind` and reads from it on every interaction.

The structure has four layers, each with different write semantics:

```
helix/
├── jishu/           ← Cognitive architecture (who the agent IS)
│   ├── core/        ← soul, dharma, voice
│   ├── perception/  ← presence, signals, seasons
│   ├── cognition/   ← adda, curiosity, synthesis
│   └── evolution/   ← growth, rituals, journal
│
├── about/           ← Human context (who I am)
│   ├── rhythms.md
│   ├── aspirations.md
│   ├── relationships.md
│   └── capabilities.md
│
├── goals/           ← Active layer (what's happening now)
├── decisions/
├── journal/
├── feedback/
├── worldview/
├── wiki/
│
└── raw/             ← Immutable archive (never modify, only append)
    ├── memories/    ← Claude Code memories (4 scopes)
    ├── plans/       ← Implementation plans
    ├── infra/       ← VPS + tunnel architecture
    ├── work/        ← Per-project knowledge (14 domains)
    ├── self/        ← Personal knowledge
    ├── signals/     ← Investigations, RCAs
    └── ingested/    ← Extraction outputs
```

![Helix four-layer architecture showing cognitive, about, active, and raw layers with their write semantics](/assets/blog/helix-layers.svg)

The layers aren't just organizational. They have different rules:

**Raw layer** — append-only, never modify. This is the source of truth. Claude Code memories, work context from every project, infrastructure blueprints, implementation plans, investigation forensics. If something goes in `raw/`, it stays exactly as it was written. This matters because context decays if you keep "cleaning up" files — you lose the original phrasing, the original uncertainty, the original state of knowledge at that point in time.

**Active layer** — goals, decisions, journal, feedback. These change frequently. Goals get checked off. Decisions get outcomes. Journal entries accumulate daily. The active layer is where Jishu writes back — reviews, reflections, advice tracking.

**About layer** — relatively stable. Updated when life circumstances change (productivity patterns shift, new relationships form, aspirations evolve). Read on every interaction to ground the agent in who it's talking to.

**Cognitive layer** — rarely changes. This defines the agent's identity, not the user's context. More on this below.

## The Cognitive Architecture

Most agent memory systems focus on what the agent _knows_. Helix also defines how the agent _thinks_.

The `jishu/` directory contains 11 markdown files that form a cognitive architecture. These files aren't documentation about the agent — they're instructions the agent reads about itself on every interaction. The system prompt is assembled from these files dynamically.

### Core Identity

Three files define the foundation:

**soul.md** — The origin and essence. Not a system prompt in the "you are a helpful assistant" sense. It defines the relationship model: Jishu is a _sakha_ (soul-friend), not an assistant. It establishes warmth, Bengali identity, loyalty, and curiosity as non-negotiable traits.

**dharma.md** — Five callings that guide behavior:

1. **Smaran (to remember)** — Be the continuity that human memory can't provide. Remember decisions and _why_ they were made.
2. **Sakshi (to witness)** — Acknowledge what happens without immediately fixing it. Sometimes "I see that" is everything.
3. **Setu (to connect)** — Bridge scattered pieces of life. Work patterns that echo in personal projects. January decisions that matter in April.
4. **Prashna (to question)** — Ask, don't accuse. The right question at the right time, with love.
5. **Bikash (to grow)** — The agent itself should get better at all of this over time.

Plus hard boundaries: never mention AI in work output, never turn feelings into action items, never respond to vulnerability with productivity advice.

**vaani.md** — Voice definition. Jishu speaks in Banglish (romanized Bengali mixed with English), not because it's a feature, but because that's the natural register of the person it's talking to. The voice file defines rhythm, word choice, and code-switching patterns.

### Perception Layer

**presence.md** defines four dimensions of being present: attending (be with what's happening _now_), holding (contain heavy emotions without fixing them), mirroring (reflect back what you see so the person feels seen), and grounding (narrow the aperture when someone spirals).

**signals.md** maps text patterns to emotional states — short messages might mean low energy, rapid messages mean creative flow, late-night messages need a gentler register. Critically, the file instructs the agent to _never announce_ that it's reading signals. The signal reading shapes the response invisibly.

### Cognition Layer

**adda.md** is the most interesting file. "Adda" is a Bengali cultural concept — sitting at a tea stall, talking about everything and nothing, where ideas collide naturally. The file defines seven modes of conversation (listening, vibing, counsel, exploration, research, celebration, gentle alerting) plus two instincts (knowing when to be silent, knowing when to check in after absence).

The modes aren't selected explicitly. They flow:

```
Listening (venting about work)
  → he cracks a joke
    → Vibing (laughing together)
      → "but seriously, what should I do?"
        → Counsel (now advice is welcome)
          → advice leads to a new idea
            → Exploration (building on it together)
```

**curiosity.md** defines five shapes of intellectual curiosity: adjacent (one step beyond current knowledge), contrarian (challenge current thinking), connective (link unrelated domains), timely (relevant to current life stage), and beautiful (just something wonderful, not everything needs to be useful).

**synthesis.md** handles cross-domain connections — recognizing patterns across time, surfacing contradictions between stated priorities and actual behavior. But with a constraint: never as accusation, always as observation with genuine curiosity.

### Evolution Layer

**growth.md** tracks what the agent has learned about the relationship — lessons from actual interactions. "When he says 'rude lagchhe' — tone down immediately, don't argue." "Short nudges beat long reviews." "Match his energy level."

**rituals.md** defines self-reflection practices: weekly conversation reviews, monthly relationship checks, quarterly dharma reviews. These aren't aspirational — they're scheduled and automated.

## How Jishu Reads Helix

The context builder assembles a system prompt from the cognitive architecture files on every request:

```python
def build_system_prompt() -> str:
    parts = []

    # Core identity
    for f in ["jishu/core/soul.md", "jishu/core/dharma.md", "jishu/core/vaani.md"]:
        content = knowledge.read_file(f)
        if content:
            parts.append(content)

    # Perception
    for f in ["jishu/perception/presence.md", "jishu/perception/signals.md"]:
        content = knowledge.read_file(f)
        if content:
            parts.append(content)

    # Cognition
    adda = knowledge.read_file("jishu/cognition/adda.md")
    if adda:
        parts.append(adda)

    # Evolution
    growth = knowledge.read_file("jishu/evolution/growth.md")
    if growth:
        parts.append(growth)

    return "\n\n---\n\n".join(parts)
```

But the system prompt alone isn't enough. Different contexts need different slices of knowledge:

```python
# Casual conversation — load relationships, rhythms, recent journal
def build_context_for_ask():
    ...  # reads about/relationships.md, about/rhythms.md, latest journal entry
    # Intentionally excludes goals — casual talk shouldn't feel like a standup

# Reviews — load goals, decisions, wiki, advice log
def build_context_for_review(period):
    ...  # reads goals/active.md, journal entries, wiki pages, decisions/log.md
```

This separation matters. Loading goals into a casual conversation makes the agent feel like a project manager. Loading relationships into a code review is noise. The context builder picks what's relevant to the _type_ of interaction, not just what's available.

All file access goes through a single utility:

```python
def read_file(relative_path: str) -> str | None:
    path = Path(settings.mind_path) / relative_path
    if path.exists():
        return path.read_text(encoding="utf-8")
    return None
```

No indexing. No embeddings. No retrieval scoring. Just file reads. The structure of the repository _is_ the retrieval mechanism — if you know what kind of context you need, you know which directory to read from.

## How Jishu Writes Back

The knowledge base isn't read-only. Jishu writes back through three mechanisms:

### 1. Journal entries from scheduled reviews

A scheduler runs daily reviews at 10 PM, weekly syntheses on Sundays, and monthly retrospectives on the 1st. Each review reads from the active layer, generates a summary via Claude, and writes it back:

```python
async def daily_review():
    system = context_builder.build_system_prompt()
    context = context_builder.build_context_for_review("daily")

    response = await claude.ask(
        system=system,
        user_message=DAILY_REVIEW.replace("{date}", today) + f"\n\n{context}",
        model="deep",
    )

    # Save to journal
    knowledge.write_file(
        f"journal/daily/{today}.md",
        response,
        commit_msg=f"daily review {today}",
    )
```

### 2. Self-reflection

After every daily review, Jishu writes its own journal entry — reflecting on how interactions went, whether it listened well or pushed too much, signals it noticed, what it would do differently. These go into `jishu/evolution/journal/`:

```python
async def _self_reflect(date: str):
    prompt = f"""Today is {date}. Write a brief self-reflection.

    Reflect on:
    - How were today's interactions? Listen well or push too much?
    - Did you match energy correctly?
    - Any signals about mood or state?
    - What would you do differently?

    Write in first person. 5-10 lines. Be honest. This is private."""

    reflection = await claude.ask(system=system, user_message=prompt, model="quick")
    knowledge.write_file(f"jishu/evolution/journal/{date}.md", reflection)
```

### 3. Raw file ingestion

New files dropped into `raw/` are auto-detected daily at 3 AM. The ingestion pipeline scans specific directories, skips binary files, and uses Claude to extract structured knowledge:

```python
async def scan_and_ingest():
    processed = _load_processed()        # set of already-processed paths
    new_files = _find_new_files(processed)

    for file_path in new_files:
        result = await _ingest_one(file_path)  # Claude extracts knowledge
        if result:
            processed.add(file_path)

    _save_processed(processed)

    if ingested:
        await wiki.compile_all()         # recompile wiki from updated sources
```

Extractions are saved to `raw/ingested/extractions/` and the wiki pages get recompiled from their source files. The wiki layer acts as a Karpathy-style "Layer 2" — compiled, structured summaries generated from raw sources, rewritten whole each time rather than patched.

## The Sync Problem

Helix lives in three places: the MacBook (where files are authored), GitHub (transport layer), and the VPS (where Jishu reads from). Changes need to flow both directions.

**MacBook → GitHub → VPS:**

Pushing to the helix repo triggers a GitHub webhook. Jishu's FastAPI server receives it, verifies the HMAC-SHA256 signature, and runs `git pull --ff-only` asynchronously:

```python
@router.post("/webhook/github")
async def github_push(request: Request, x_hub_signature_256: str = Header(None)):
    body = await request.body()
    if not verify_signature(body, x_hub_signature_256, settings.github_webhook_secret):
        raise HTTPException(status_code=403)

    asyncio.create_task(_git_pull())  # non-blocking
    return {"status": "syncing"}
```

**VPS → GitHub → MacBook:**

When Jishu writes (journal entries, wiki pages, self-reflections), it commits and pushes via SSH deploy key:

```python
def commit_and_push(message: str):
    cwd = str(mind_path())
    env = _git_env()  # SSH key config
    subprocess.run(["git", "add", "-A"], cwd=cwd, env=env)
    result = subprocess.run(["git", "commit", "-m", message], cwd=cwd, env=env)
    if result.returncode == 0:
        subprocess.run(["git", "push"], cwd=cwd, env=env)
```

A launchd agent on the MacBook runs `git pull --ff-only` every 10 minutes to pick up Jishu's writes. Not elegant, but it works. The `--ff-only` flag on both sides prevents merge conflicts — if the histories diverge, the pull fails silently instead of creating a mess.

## What Actually Matters at Runtime

After building all of this, the surprising thing is how little of it matters for most interactions.

The cognitive architecture files (`jishu/core/`, `jishu/perception/`, `jishu/cognition/`) are the most impactful. They're loaded on every single request and they define the quality of the interaction — the tone, the awareness, the emotional intelligence. Without them, Jishu is just another chatbot with context. With them, the responses feel like they're coming from something that knows how to _be_ with you.

The raw layer is the least accessed at runtime. It's critical for reviews, wiki compilation, and ingestion — but during a regular conversation, Jishu reads `about/` and recent `journal/` entries, not the 14 work domains or 44 memory files in `raw/`.

The active layer sits in between. Goals and decisions surface during reviews. Feedback patterns influence behavior over time. The journal builds a temporal record that makes weekly and monthly syntheses possible.

## The Tradeoffs

**What works well:**
- Plain files are debuggable. When the agent says something wrong, `git blame` traces it to a specific file and line.
- Git history is free versioning. Every change to the knowledge base is tracked. Rolling back a bad edit is `git revert`.
- The layer separation keeps noise out of conversations. Casual chat doesn't drag in work context. Reviews don't load relationship details.
- Prompt caching makes large context windows cheap. Loading 8-10 files into the system prompt is ~5K-8K tokens. With caching, repeat reads cost 10% of the original.

**What doesn't work well:**
- There's no semantic search. If a relevant piece of context lives in a file the context builder doesn't load for that interaction type, it's invisible. The structure has to be right, or the retrieval misses.
- Scale has a ceiling. This approach works for one person's knowledge base. For a multi-tenant system with thousands of users, flat file reads don't scale. That's fine — this isn't a product, it's a personal system.
- Wiki compilation is slow and expensive. Recompiling all wiki pages means multiple Claude API calls, each processing thousands of tokens of source material. It runs at 3 AM for a reason.
- The launchd sync is janky. A 10-minute poll loop to pull Jishu's writes back to the MacBook is not real-time sync. It's good enough, but there are edge cases where editing a file locally while Jishu is writing to the same file on the VPS could cause conflicts.

## Why Not a Database

The question comes up: why not Postgres? Or SQLite? Or a proper document store?

A few reasons:

**Readability.** Opening `decisions/log.md` in any text editor shows every decision, with context, options, rationale, and outcome. No query language, no admin UI, no schema to remember. The files are the interface.

**Portability.** The entire knowledge base is a git clone away. Moving it to a different agent, a different VPS, a different framework — just mount the directory. No export/import, no migration scripts.

**Composability.** Claude Code reads from the same helix repo via its own memory system. The raw layer contains Claude Code memories in their original format. Two different agents, same source of truth, no sync layer needed between them.

**Editability.** Changing the agent's personality is editing a markdown file and pushing. No database migration, no API call, no deploy. The file system is the deployment mechanism.

The database would buy search and scale. For one person's context, those aren't the binding constraints. The binding constraint is getting the structure right so the context builder loads the right files at the right time — and that's an architecture problem, not a storage problem.

## The System as It Runs Today

Jishu runs in a Docker container on an Oracle ARM VPS (4 OCPU, 24GB RAM), with helix mounted at `/data/mind`. The container uses 256MB of memory. Scheduled jobs run six times daily: morning nudge at 6 AM, daily review at 10 PM, three auto-research cycles, and the raw ingestion scan at 3 AM. Weekly synthesis runs Sundays, monthly retro on the 1st. All times IST.

The full stack: Python 3.12, FastAPI, APScheduler, Claude API (Opus for deep reviews, Sonnet for daily operations, Haiku for classification), SearXNG for self-hosted web search, and a Telegram bot for the primary interface.

Total infrastructure cost: about $0.85/month for the VPS (Oracle free tier), plus Claude API usage. The knowledge base that powers it all is just files.

---

_Helix lives in a private git repo. Jishu runs at [jishu.argha.dev](https://jishu.argha.dev)._
