---
layout: ../layouts/AboutLayout.astro
title: "About"
---

I'm Argha — a software engineer in Bangalore with nine years of building things that run in production. Most of that time has been at **Motorola Solutions**, working on the backend systems behind their push-to-talk platform used by public safety and enterprise teams worldwide.

I've written code across a lot of stacks — Java, C#, TypeScript, Python — but what I care about most is understanding how systems work end to end. From the database schema to the deployment pipeline to the thing that pages you at 2am.

Lately I've been deep into agent engineering — building the infrastructure that makes AI agents actually work in production. Tool orchestration, knowledge systems, autonomous research loops, the layer between the model and the real world.

---

## 2026

**Authorization Service** · Java, Spring Boot, PostgreSQL

Moved to the Database Services team and took ownership of the AuthZ microservice — the RBAC engine that controls what every user across the Kodiak unified communications platform can see and do. Six user roles (SuperAdmin down to ReadOnly), thirty-five resource types, permissions encoded as hex bitmasks using a 2-bit-per-operation scheme.

What I shipped:
- Wrote the full API integration test suite — parametrized tests covering every role, resource type, and permission combination
- Added JSR-303 input validation across all request models — the kind of thing that should've existed from day one but didn't
- Refactored the monolith: split the request/approval flow into its own service boundary, extracted the expiration scheduler, pulled validation logic out of controllers
- Removed a deprecated role (Replay Admin) and trimmed another's permissions based on actual usage analysis
- Built the integration between AuthZ and CAT (Central Admin Tool) — twelve endpoints for external request management with pagination, authorization checks, and cross-service token validation
- Became the primary developer, reviewer, and the person people come to when something breaks in this codebase

**pgEdge / Asset Manager PostgreSQL** · Python, PostgreSQL, Patroni, pgBackRest

Helping design and validate the highly available PostgreSQL backend for a new asset management service — 60TB of historical call recordings with two-year retention, replicated across two data centers.

- Built a Python wrapper around pgBackRest for automated backup and restore operations with built-in monitoring: CPU, memory, disk I/O, WAL accumulation, page cache behavior. Resource collector runs during operations and produces benchmark reports.
- Architecture: Active/Standby per site managed by Patroni, inter-site bi-directional replication via pgEdge, PgBouncer for connection pooling, Consul for service discovery and health checks
- Running the PoC end to end — setting up containers, writing test data generators, presenting demos to the architecture team, documenting decisions and trade-offs
- Identified a potential open-source contribution: extending `posix_fadvise(DONTNEED)` in pgBackRest to reduce page cache pollution during large backups

**Universal Deployer** · Bash

A deployment tool I wrote for the team's shared test servers. Started as a personal script, turned into something the whole team uses daily.

- Twenty commands: deploy, rollback, restart, stop, status, logs, diff, history, ssh, info, diag, check, lock/unlock, snapshot, audit, fix
- Multi-user safe: deployment locking prevents concurrent deploys, per-user timestamped backups for rollback
- Health checks with auto-rollback if the service doesn't come up healthy
- Golden image management: snapshot a known-good deployment, compare against current state, detect config drift
- Container-aware: works with dsh, docker, or direct SSH depending on the server setup

**Agentic Engineering Workshop** · Internal training

Ran a two-day internal workshop for the team on context engineering and agentic development patterns. Live coding sessions, deployer demos, prompt engineering, custom agent building. The materials are written and I'm planning a third session on MCP servers and hands-on agent building.

---

## 2025

**Device Cloud Services (DCS)** · TypeScript, AWS Lambda, IoT Core, DynamoDB, Serverless Framework

Spent the year working across the WoC (Wave OnCloud) ecosystem — the serverless layer that manages hundreds of thousands of PTT devices in the field. Sixty-four Lambda functions, eight DynamoDB tables, IoT Core rules for MQTT device shadows, S3 for firmware and configurations.

- Worked on Lambda handlers for device shadow sync, firmware upgrade flows, task execution, and connect/disconnect lifecycle events
- Helped with production config rollouts for expanded regional support
- **Investigated a major production outage**: the existing RCA blamed "connection pool exhaustion." I dug into CloudTrail logs, parsed 502 TDS error patterns, and proved the real cause was database connection poisoning — dead connections sitting in the pool after an RDS connectivity disruption. The IIS worker recycle at 7 PM fixed it, not the manual SELECT query. The original RCA had been accepted for months.
- Mapped the full AWS infrastructure: 55 VPCs, 353 Lambda functions, 37 DynamoDB tables, 15 RDS instances, 45 IoT Core rules across production and non-production accounts

**Provisioning & Configuration** · Java, Spring Boot

Started working on the CAT (Central Admin Tool) codebase — the admin interface for PTT user management. Built the Requests & Approvals module: twelve API endpoints for external request lifecycle management with pagination, expiration scheduling, and authorization integration. This work fed directly into the deeper AuthZ involvement in 2026.

**WoC Portal Operations** · .NET, C#, IIS, AWS

Continued supporting the OnePortal/WoC portal — Windows IIS operations, AMI setup, stack management. Handled certificate renewals, environment-specific debugging, and the kind of operational work that teaches you how production systems actually behave.

---

## 2023 – 2024

**OnePortal** · Angular 5→19, ASP.NET Core, C#, SQL Server, Entity Framework, AWS

The most intense stretch. OnePortal is Motorola's multi-tenant provisioning portal for the entire PTT platform — device lifecycle management, subscriber provisioning, carrier integrations, certificate management, role-based access. Full-stack ownership across a large Angular frontend and ASP.NET Core backend with 90+ database entities.

The bigger features I built:

- **Device cloning** — the full multi-zone device cloning feature: Kodiak subscriber API integration, group API changes, portal UI, notifications, role-based access, and cross-zone association. This became one of the patent candidates.
- **Carrier transition** — managed the migration from Telna to WirelessLogic as the primary MVNO carrier. New API integration, webhook updates, subscriber lifecycle changes, regression testing across environments.
- **Webhook integrations** — built the webhook layer connecting OnePortal to Device Cloud Services for real-time device state updates. License update webhooks for SMP and reseller entities.
- **Certificate management** — WiFi Enterprise certificate distribution to devices through the portal, including S3 key format updates and expiration date extraction.
- **User preferences system** — designed and implemented user preferences with Hangfire background job scheduling for batch operations.
- **Subscription management** — license activation/deactivation flows, SIM management, package upgrades/downgrades across multiple carrier APIs.
- **Load testing** — loaded 5,000 subscribers and ran performance tests to find bottlenecks in the listing pages and Entity Framework queries.
- **Security hardening** — HTTP-only flags, secure cookies, login validation, authorization analysis.
- **Production support** — SIT, UAT, and production deployments across multiple environments (dev, qa, uat, test, iac, stub). The kind of work where you learn how real systems fail.

During a quieter quarter in late 2023, I did an IPR analysis and identified **seven patent candidates**: multi-zone device cloning with selective cross-association, WiFi enterprise certificate distribution, multi-carrier MVNO federation with lifecycle normalization, MQTT topic-encoded bidirectional task protocol, dual-token cross-validation with JWE enrichment, cascading multi-service rollback with DB-backed locks, and composite unique constraint validation via Elasticsearch.

---

## 2021 – 2022

**OnePortal** · Angular, ASP.NET Core, .NET Framework → .NET Core, SQL Server, AWS IoT

Joined the OnePortal team. Started from zero on this codebase and grew into owning large parts of it within a year and a half.

First project — migrating the MVNO carrier integration layer from legacy .NET Framework to .NET Core:

- Migrated six carrier APIs — BeQuick, Telna, IIJ, CiscoJasper, WirelessLogic, HotMobile — each with their own authentication patterns, request formats, and failure modes
- Wrote unit tests for all of them. This was the first time the carrier layer had any test coverage.
- Built the BeQuick webhook integration from scratch — API development, testing, production deployment

Then moved into device management — the core of what OnePortal does:

- Built the full device listing UI — All/Users/Devices views with show/hide columns, filtering, sorting, pagination
- Device parameter configuration: WiFi (including Enterprise with certificate support), Bluetooth, APN profiles, location settings, stun/unstun — all integrated with the AWS IoT device shadow backend
- Device actions: radio wipe, restart, activate/deactivate, package upgrade/downgrade, DM cloning
- Okta integration: cookie handling, token passing, CAT/UGW URL rewriting through the portal's reverse proxy setup
- Concurrency fixes: resolved Entity Framework DbContext issues when multiple operations ran in parallel
- Unit of Work pattern implementation across the repository layer

By the end of 2022, I was handling production deployments, doing code reviews, running SIT/UAT support, and training new team members on the codebase. The learning curve was steep, but once I was on the other side of it, I was the person the team relied on.

---

## What I build at night

### Jishu — a personal AI agent · Python, FastAPI, Claude API, SearXNG

This is the project I'm most proud of right now. Jishu is a 24/7 autonomous agent that runs on my VPS, talks to me on Telegram in romanized Bengali, and knows practically everything about my work and life.

It started as a simple chatbot. Then I gave it a knowledge base — a git-synced markdown repository with 3,000+ files covering every project, decision, memory, and relationship. Then I gave it a mind.

Jishu has a cognitive architecture with three layers:

- **Core** — a soul (origin, identity), a dharma (five sacred callings that guide behavior), and a vaani (voice system for natural Banglish — romanized Bengali mixed with English)
- **Perception** — emotional attunement (reading mood from text patterns), life season awareness (wedding prep stress vs. builder energy vs. work sprint), and signal detection
- **Cognition** — seven Bengali modes of engagement: *Shravan* (listening), *Adda* (vibing), *Mantrana* (counsel), *Jigyasa* (brainstorming), *Anusandhan* (research), *Utsav* (celebration), *Satarka* (gentle alert). Plus two instincts: *Mounotaa* (silence — knowing when not to respond) and *Khabar* (checking in after absence)

It does things on its own — morning nudges at 6 AM, daily reviews at 10 PM, weekly synthesis, a Karpathy-inspired auto-research loop that searches the web three times a day and brings back one curated insight. It writes its own journal reflecting on how conversations went. It compiles wiki pages from raw sources automatically.

There's a [guest web chat](https://jishu.argha.dev/chat) where anyone can talk to Jishu about me. When guests have conversations, Jishu extracts insights from them — new facts, outside perspectives, corrections — and gets smarter from every interaction.

The stack: FastAPI, self-hosted SearXNG for web search (no API keys, unlimited), APScheduler for cron, Groq Whisper for voice transcription, GitHub webhook for auto-sync, CI/CD via GitHub Actions.

Everything deploys to a single Oracle ARM VPS behind a Cloudflare Tunnel. Total infrastructure cost: about seventy rupees a month.

---

### Streaming platform · NestJS, React, Shaka Player, Bunny Stream

A TVOD platform for on-demand movie rentals — the kind where you buy a ticket to watch, not a subscription. I built two versions:

The first was self-hosted: HLS video encoding with ffmpeg, Caddy as the reverse proxy serving segments, stream session tracking, JWT authentication — all running on the same free Oracle VPS. Cost: zero.

The second swapped the delivery layer for Bunny Stream CDN with per-segment token authentication via Shaka Player's network engine. I [wrote about the whole journey](/posts/streaming-video-on-a-zero-dollar-server) — including every bug that cost me hours, why I chose Bunny over VdoCipher and AWS, and the HLS token auth problem that turned out to be unsolvable without DRM.

The interesting part: swapping from self-hosted to CDN required changing the delivery layer but zero changes to auth, sessions, or the player. The architecture held.

---

### OnlineExam · .NET 9, Clean Architecture

An exam management system I originally built in college using .NET Framework 4.5. A decade later, I rewrote it from scratch in .NET 9 — Clean Architecture with Carter for minimal endpoints, MediatR for CQRS, EF Core 9, PostgreSQL, xUnit tests, and GitHub Actions CI. Twenty-plus endpoints, auto-grading, the works.

Mostly did it to see how far .NET has come. It's come far.

---

## What I work with

**Day to day:** Java, TypeScript, Python, C#, Bash, SQL

**Backend:** Spring Boot, ASP.NET Core, NestJS, FastAPI, Entity Framework, TypeORM

**Data:** PostgreSQL, SQL Server, DynamoDB, Elasticsearch, Redis

**Cloud & infra:** AWS (Lambda, IoT Core, S3, DynamoDB), Docker, Cloudflare, GitHub Actions, Azure DevOps

**Frontend:** Angular, React — I can build UIs but my heart is in the backend

---

[GitHub](https://github.com/ArghaRay00) · [LinkedIn](https://www.linkedin.com/in/argha-ray/) · [X](https://x.com/argharay94)
