---
layout: ../layouts/AboutLayout.astro
title: "CV"
description: "CV of Argha Ray — Senior Software Engineer at Motorola Solutions. Nine years in Java, C#, TypeScript, Python. RBAC engines, HA PostgreSQL, deployment tooling, agent engineering."
---

# Argha Ray

Bengaluru, India

[argha.dev](https://argha.dev) · [GitHub](https://github.com/ArghaRay00) · [LinkedIn](https://www.linkedin.com/in/argha94)

*Last updated: May 2026* · [Download PDF](/argha-ray-cv.pdf)

---

Software engineer with nine years in production backend systems. Currently at Motorola Solutions — RBAC engines, HA PostgreSQL, deployment tooling, cross-service integrations across the WAVE PTX platform. Outside of work, deep into harness engineering — building the infrastructure layer that wires agents to tools, memory, and the real world. Built a 24/7 autonomous agent with its own cognitive architecture, structured knowledge system, and reasoning loops. Practitioner of context engineering: designing what goes into an agent's context window and why. Looking for roles at the intersection of agent systems and production-grade engineering.

---

## Work Experience

### Senior Software Engineer — Motorola Solutions

**Aug 2021 – Present** · Bengaluru, India · Engineer → Senior (Aug 2023)

WAVE PTX is Motorola's subscription-based push-to-talk platform connecting teams across devices, networks, and locations. Worked across multiple codebases and teams — from the main provisioning portal to backend microservices to serverless device cloud infrastructure.

**2026 — Microservices & Platform DB Teams**

- **Authorization Service (Java, Spring Boot, PostgreSQL):** Owned the RBAC engine controlling access for all users across the Kodiak platform — six roles, thirty-five resource types, permissions encoded as hex bitmasks. Wrote the full API integration test suite (449 test methods, 666+ with parameterized expansion, 100% endpoint coverage). Added JSR-303 validation across all request models. Refactored the monolith — split request/approval flow into its own service boundary, extracted the expiration scheduler, pulled validation logic out of controllers. Removed a deprecated role and trimmed permissions based on actual usage analysis. Built the integration between AuthZ and CAT — twelve endpoints for external request management with pagination and cross-service token validation.
- **pgEdge / Asset Manager PostgreSQL (Python, PostgreSQL, Patroni, pgBackRest):** Helped design and validate the HA PostgreSQL backend for a new asset management service — 60TB of call recordings, two-year retention, replicated across two data centers. Built a Python wrapper around pgBackRest for automated backup/restore with monitoring (CPU, memory, disk I/O, WAL accumulation, page cache). Architecture: Active/Standby per site via Patroni, inter-site replication via pgEdge, PgBouncer for pooling, Consul for discovery. Ran the PoC end to end.
- **Universal Deployer (Bash):** Built a deployment tool for the team's shared test servers that became the team's daily driver. Twenty commands (deploy, rollback, status, logs, diff, lock/unlock, snapshot, audit, fix). Multi-user safe with deployment locking, per-user timestamped backups, health checks with auto-rollback, golden image management for config drift detection.
- **OnePortal Security Hardening (ASP.NET Core, C#, Angular):** Token sanitization and security refactoring. HTTP-only cookie enforcement, login validation hardening, JWE token cleanup across the portal's reverse proxy, authentication surface audit.
- **Agentic Engineering Workshop:** Ran a multi-session internal workshop on context engineering and agentic development — requested by senior management. Created slide decks, speaker scripts, and live demos. Also designed fifteen no-code agent blueprints for Google Workspace Studio.
- **CAT — Requests & Approvals (Java, Spring Boot):** Built twelve API endpoints for external request lifecycle with pagination, expiration scheduling, and authorization integration.

**2025 — OnePortal & Device Cloud Services**

- **Kaiser Program — WiFi Enterprise Certificate Management (ASP.NET Core, C#, Angular, SQL Server, AWS S3, TypeScript, Lambda, IoT Core):** Biggest feature of the year. Cross-repo effort spanning the portal and serverless device cloud. Designed DB schema from scratch (four tables, migrations, triggers, batch expiration). Full certificate lifecycle APIs — upload to S3, replace with device remapping, expiration extraction, SFDC linking. On the device cloud side, built a new Lambda handler with IoT topic rules for certificate distribution. Shipped across four environments over two months.
- **License Renewal & Expiry Webhooks (ASP.NET Core, C#):** Subscription lifecycle event system — renewal notifications, expiry webhooks, partial renewal handling, grace period logic, self-service renewal integration, multi-region (EMEA) support.
- **Mototrbo R7 DualMode Device Support (Angular, ASP.NET Core, C#):** Supported launch of a new dual-mode device (radio + cellular). DB migrations, registration flow changes, firmware upgrades, EMEA config. CSS integration with EVA token generation for Kodiak auth.
- **Reseller Portal & Bulk Operations:** CSV import for mass subscriber updates, bulk deactivation, bulk corporate name updates, license allocation.
- **KALKI Pilot (ASP.NET Core, C#):** Early access pilot — TLK140 device profile, MVNO activation/deactivation flows, reseller license allocation.
- **Production Incident Investigation (.NET, SQL Server, AWS CloudTrail):** Independently reinvestigated a portal outage. Found the actual cause (database connectivity disruption poisoning the connection pool) after the original RCA had been accepted for months.

**2023–2024 — OnePortal Full-Stack**

Full-stack ownership of Motorola's multi-tenant provisioning portal — Angular frontend + ASP.NET Core backend with 90+ database entities.

- **Device cloning:** Full multi-zone feature — Kodiak subscriber API, group API, portal UI, notifications, RBAC, cross-zone association. Patent candidate.
- **Carrier transition:** Managed Telna to WirelessLogic migration. New API integration, webhook updates, subscriber lifecycle changes. Received Moment Award.
- **Gateway management:** Full UI and API for Wave PTX gateway listing, editing, and task execution.
- **Notification center:** Redesigned with header-bar notifications, multi-app integration across OnePortal, CAT, and UGW.
- **EVA token & CSS integration:** Enterprise Voice Auth token generation for Kodiak PTT, DCS topic integration for Cloud Services Suite.
- **Webhook integrations:** OnePortal to DCS for real-time device state updates. License webhooks for SMP and reseller entities.
- **User preferences system:** Cross-app preference storage with Hangfire scheduling. Used by three portals.
- **SMP integration:** Multi-quarter work — license updates, user accounts, subscription management, reseller support.
- **Okta & Keycloak auth:** Server-side Okta token generation, OAuth flow implementation.
- **.NET and Angular upgrades:** Led major framework migrations across both stacks.
- **Load testing:** 5,000 subscriber load test for bottleneck identification in Entity Framework queries.
- **IPR analysis:** Identified seven patent candidates from the OnePortal and DCS codebases.

**2021–2022 — OnePortal Ramp-Up**

- Migrated six MVNO carrier APIs (BeQuick, Telna, IIJ, CiscoJasper, WirelessLogic, HotMobile) from .NET Framework to .NET Core. First test coverage the carrier layer ever had.
- Built the full device listing UI, device parameter configuration (WiFi, Bluetooth, APN, location, stun/unstun), and device actions — all integrated with AWS IoT device shadows.
- Okta integration, Entity Framework concurrency fixes, Unit of Work pattern implementation.
- By end of 2022: handling production deployments, code reviews, SIT/UAT support, and training new team members.

---

### Software Engineer — First American (India)

**Apr 2019 – Aug 2021** · Bengaluru, India · 2 yrs 5 mos

**Properties Team:**
- Piloted the project — set up structure, created quick POCs that helped shape the product
- Built property search via map click, address search, and APN search
- Integrated xUnit framework for unit testing across projects
- Developed GlobalNav — a JavaScript library consumed at runtime across applications
- Designed reports: Property Detail, School Information, Transaction History using ActiveReports

**Eagle-Status Team:**
- Extended multi-select dropdown, created custom drag-and-drop directives using DOM APIs
- Optimized AgGrid to load large row counts at startup
- Set up HMR (Hot Module Reloading) in Angular with .NET Core
- Fixed 20+ critical UI bugs that unblocked initial release

---

### Member Technical Staff — First American (India)

**Aug 2017 – Mar 2019** · Bengaluru, India · 1 yr 8 mos

- Built zip code property search, REST APIs for property data from DataTree
- Built adapter layer for WCF to DTAPI migration
- Saved ~$80K/year by implementing Static Street View instead of Panoramic View
- Wrote Terraform scripts for AWS infrastructure as part of cloud migration

---

### Technical Trainee — First American (India)

**Feb 2017 – Aug 2017** · Bengaluru, India · 7 mos

- Redesigned the UI using razor views and jQuery
- Introduced unit testing, increased test coverage by 20%
- Migrated the project from MVC to WebAPI

---

## Side Projects

### Vesper — Personal AI Agent

*Python, FastAPI, Claude API, SearXNG*

24/7 autonomous agent on a VPS. Telegram bot with cognitive architecture — seven modes of engagement, emotional signal detection, scheduled reviews, auto-research loops, wiki compilation. Guest web chat at [vesper.argha.dev](https://vesper.argha.dev/chat). Git-synced knowledge base (Helix) with 3,000+ markdown files. Docker on Oracle ARM VPS behind Cloudflare Tunnel.

### TVOD Streaming Platform

*NestJS, React, Shaka Player, Bunny Stream, PostgreSQL*

Transactional video-on-demand platform. Two versions — self-hosted HLS (zero cost) and Bunny Stream CDN with per-segment token auth. Stream session tracking, JWT auth, same-origin reverse proxy. Swapping the delivery layer required zero changes to auth, sessions, or the player.

### harnesskit — Agent Orchestration Framework

*TypeScript, Model-Agnostic*

Open-source framework extracting production agent patterns into reusable modules: tool registry, permission engine, query loop, context manager with cache-aware compaction, agent spawner, hook system, and model router. Three intelligence levels — rule-based (no model), hybrid (local model), full agent (cloud model) — same architecture across all three.

### jobtrack-autopilot — Job-Search Autopilot

*Python, Anthropic API, Gmail API, SQLite*

Personal job-search autopilot. Gmail in, classified pipeline out, Telegram in your pocket. Haiku-driven classification with salary extraction, JD fit scoring (1-10 vs candidate profile), ghost detection with idempotent nudge drafts (max 2/thread), leave-aware interview slot generator, draft preview with inline approve/reject. Runs unattended on an Oracle ARM VPS — never auto-sends. Open-sourced after running for months on the live job hunt.

### Helix — Personal Knowledge System

*Markdown, Git, Python*

Structured knowledge base that replaced a vector database. Four-layer architecture: immutable raw sources, active goals/decisions/journal, personal context, and cognitive architecture. Git-synced across MacBook, GitHub, and VPS.

### Jira Ticket Creator

*JavaScript, VS Code Extension API, Copilot LM API*

Zero-dependency VS Code extension for creating Jira tickets with AI. Single and bulk ticket creation. Cookie auth for enterprise Jira behind SSO/IAP. Distributed to team via GitHub Releases.

### OnlineExam

*.NET 9, Clean Architecture, PostgreSQL*

College project rewritten a decade later — Carter endpoints, MediatR CQRS, EF Core 9, xUnit, GitHub Actions CI. Twenty-plus endpoints with auto-grading.

### argha.dev

*Astro, Tailwind CSS, Cloudflare Pages*

Personal blog and portfolio. Technical writing on streaming architecture, agent memory systems, and infrastructure.

---

## Technical Skills

- **Languages:** Java, C#, TypeScript, Python, Bash, SQL
- **Backend:** Spring Boot, ASP.NET Core, NestJS, FastAPI
- **Data:** PostgreSQL, SQL Server, DynamoDB, Redis, Kafka
- **Cloud & Infra:** AWS (Lambda, IoT Core, S3), Docker, Cloudflare, GitHub Actions, Azure DevOps
- **Frontend:** Angular, React
- **Agent Engineering:** Claude Code, Prompt Engineering, Prompt Chaining, Context Engineering, MCP Servers, Tool Orchestration, RAG

---

## Education

**B.E. Computer Science** — Atria Institute of Technology (now Atria University), Bengaluru · 2012–2016

First Class with Distinction

**Certifications:** AWS Technical Essentials · Architecting On AWS

---

## Publications

### Crop disease classification using texture analysis

*2016 IEEE International Conference on Recent Trends in Electronics, Information & Communication Technology (RTEICT)*

Image processing for sunflower crop disease detection using k-means clustering and ML classifiers (KNN, SVM, Naive Bayes, Logistic Regression). Accepted to IEEE Xplore.

[ieeexplore.ieee.org/document/7807942](https://ieeexplore.ieee.org/document/7807942)

---

## Achievements

- **Moment Award** — Motorola Solutions, 2026. Recognized by the India R&D Site Head for building the AuthZ API test suite (400+ test cases, 100% endpoint coverage), developing deployment tooling, and enabling the team through engineering training.
- **Moment Award** — Motorola Solutions, 2023. For Telna to WirelessLogic carrier transition for 10L+ customers.
- **IPR Analysis** — Identified 7 patent candidates from the OnePortal and DCS codebases (2023).
- **Quarterly Awards** — Best performance Q3 2018, Q4 2020 at First American.
- **Tech Talk Finalist** — Blockchain Transactions (2018), Home Warranty via IoT (2019) at First American.
- **International Informatics Olympiad** — State rank 52, Olympiad rank 771.
- **IEEE Conference Paper** — Presented at IEEE RTEICT 2016, accepted to IEEE Xplore.
