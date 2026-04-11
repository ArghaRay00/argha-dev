---
layout: ../layouts/AboutLayout.astro
title: "About"
description: "Argha Ray — software engineer with nine years in production backend systems at Motorola Solutions. Building agent infrastructure, tool orchestration, and knowledge systems. Based in Bangalore, open to remote roles in Europe."
---

I'm Argha — a software engineer in Bangalore with nine years of building things that run in production.

Most of that time has been at **Motorola Solutions**, working on the backend systems behind their push-to-talk platform — RBAC engines, HA PostgreSQL, deployment tooling, cross-service integrations. I've written code across Java, C#, TypeScript, Python, and Bash, but what I care about most is understanding how systems work end to end. From the database schema to the deployment pipeline to the thing that pages you at 2am.

Lately I've been deep into agent engineering — building the infrastructure that makes AI agents actually work in production. Tool orchestration, knowledge systems, autonomous research loops, the layer between the model and the real world. I built a [24/7 autonomous agent](https://jishu.argha.dev/chat) with its own cognitive architecture, and an [open-source framework](https://github.com/ArghaRay00) extracting those patterns into reusable modules.

For the full professional record, see my [CV](/cv).

---

## Projects

**[Jishu](https://jishu.argha.dev/chat)** — a personal AI agent that runs 24/7 on a VPS. Telegram bot with a cognitive architecture — seven modes of engagement, emotional signal detection, scheduled reviews, auto-research loops, wiki compilation. Guest web chat where anyone can talk to it about me. Git-synced knowledge base with 3,000+ markdown files. Python, FastAPI, Claude API, SearXNG.

**[Streaming Platform](https://github.com/ArghaRay00)** — TVOD platform for on-demand movie rentals. Built two versions — self-hosted HLS on a free Oracle VPS (zero cost) and Bunny Stream CDN with per-segment token auth. Swapping the delivery layer required zero changes to auth, sessions, or the player. I wrote about the [full journey](/posts/streaming-video-on-a-zero-dollar-server). NestJS, React, Shaka Player, PostgreSQL.

**[harnesskit](https://github.com/ArghaRay00)** — agent orchestration framework. Tool registry, permission engine, query loop, context manager with cache-aware compaction, agent spawner, hook system, model router. Three intelligence levels — rule-based (no model, $0), hybrid (local model), full agent (cloud model) — same architecture across all three. TypeScript, model-agnostic.

**[Helix](https://github.com/ArghaRay00/helix)** — personal knowledge system that replaced a vector database. Four-layer architecture of markdown files, git-synced across devices. Powers Jishu's memory. I wrote about [the design](/posts/giving-an-ai-agent-memory-that-survives-the-session). Markdown, Git, Python.

**[OnlineExam](https://github.com/ArghaRay00/OnlineExam)** — college project rewritten a decade later in .NET 9. Clean Architecture, Carter, MediatR, EF Core 9, PostgreSQL, xUnit, GitHub Actions CI. Twenty-plus endpoints with auto-grading.

**[Jira Ticket Creator](https://github.com/ArghaRay00)** — VS Code extension for creating Jira tickets with AI. Cookie auth for enterprise Jira behind SSO/IAP. JavaScript, Copilot LM API.

**[argha.dev](https://argha.dev)** — this site. Astro, Tailwind CSS, Cloudflare Pages.

---

## What I work with

**Languages:** Java, C#, TypeScript, Python, Bash, SQL

**Backend:** Spring Boot, ASP.NET Core, NestJS, FastAPI

**Data:** PostgreSQL, SQL Server, DynamoDB, Redis, Kafka

**Cloud & Infra:** AWS (Lambda, IoT Core, S3), Docker, Cloudflare, GitHub Actions, Azure DevOps

**Frontend:** Angular, React — I can build UIs but my heart is in the backend

**Agent Engineering:** Claude Code, Prompt Engineering, Context Engineering, MCP Servers, Tool Orchestration

---

Open to remote roles, especially in Europe. Based in Bangalore (IST / UTC+5:30).

[GitHub](https://github.com/ArghaRay00) · [LinkedIn](https://www.linkedin.com/in/argha94) · [X](https://x.com/argharay94)
