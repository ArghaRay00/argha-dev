---
layout: ../layouts/AboutLayout.astro
title: "About"
---

I'm Argha, a software engineer based in Bangalore. Nine years in, still learning something new every week. Most of my career has been at Motorola Solutions — building the backend systems that keep their push-to-talk platform running for public safety agencies and enterprises across the world.

I like building things that work reliably at scale, and I'm slowly making my way toward machine learning.

---

## Timeline

### 2026 — Authorization, PostgreSQL, and new ground

Moved to the Database Services team. Two big things on my plate:

**AuthZ Service** — a role-based access control microservice in Java and Spring Boot. Six roles, thirty-five resource types, permissions encoded as hex bitmasks. I wrote the API integration test suite, added input validation across the stack, and refactored the monolith into cleaner service boundaries. Currently the go-to person for this codebase.

**pgEdge / Asset Manager PostgreSQL** — helping architect a highly available PostgreSQL backend for storing 60TB of call recordings. Patroni for failover, pgEdge for bi-directional replication, pgBackRest for backups. Built a Python wrapper for backup operations with monitoring and benchmarking — still early but the PoC is looking solid.

Also built a universal JAR deployment tool in Bash that the team now uses daily. Rollback, locking, health checks, auto-rollback — the kind of thing that started as a script and grew because people kept asking for features.

*Java, Spring Boot, PostgreSQL, Python, Bash*

### 2025 — Device Cloud Services and investigations

Spent time across the WoC (Wave OnCloud) ecosystem. Dug deep into the Device Cloud Services layer — TypeScript on AWS Lambda, IoT Core for device shadows, DynamoDB. Helped investigate production incidents, including an outage where I disproved the original root cause analysis and traced the real problem to database connection poisoning.

Also started working on the provisioning configuration side, which led to the AuthZ work in 2026.

*TypeScript, AWS Lambda, IoT Core, DynamoDB, Node.js*

### 2023–2024 — OnePortal, at full speed

This was the most intense period on OnePortal — the multi-tenant provisioning portal for Motorola's PTT platform. Full-stack work across a large Angular frontend and ASP.NET Core backend. Device management, subscriber lifecycle, carrier integrations, certificate management, Okta authentication — the works.

Some highlights from this stretch: built the device cloning feature across multiple API layers, handled the carrier transition from Telna to WirelessLogic, implemented webhook integrations with the device cloud, and kept the production system running through multiple environment deployments.

During the quieter Q4 2023, I did an IPR analysis across the codebase and identified seven patent candidates — things like multi-zone device cloning, WiFi enterprise certificate distribution, and a dual-token cross-validation pattern.

*Angular, ASP.NET Core, C#, SQL Server, Entity Framework, AWS, Okta*

### 2021–2022 — Starting at Motorola, learning the ropes

Joined the OnePortal team. My first big task was migrating the MVNO carrier integration layer from legacy .NET Framework to .NET Core — six different carrier APIs (BeQuick, Telna, IIJ, CiscoJasper, WirelessLogic, HotMobile), each with their own quirks. Wrote unit tests for all of them.

Then moved into the device management features — building the listing pages, device parameter configuration (WiFi, Bluetooth, APN, Stun), and the IoT integration layer. A lot of Angular components, a lot of API endpoints, a lot of debugging why the device shadow wasn't syncing.

By the end of 2022, I was handling SIT/UAT support, production deployments, and code reviews. The codebase went from something I was learning to something I was owning.

*Angular, ASP.NET Core, C#, .NET Framework migration, SQL Server, AWS IoT*

---

## Side projects

Things I build because I'm curious, not because I have to:

**Streaming platform** — A TVOD platform for on-demand movie rentals. NestJS backend, React frontend, Shaka Player for HLS playback. Built two versions: self-hosted on a free Oracle VPS, then integrated with Bunny Stream CDN. Learned more about video streaming, caching, and DRM than I expected.

**Personal AI agent** — An agent that runs 24/7 on my VPS, talks to me on Telegram in Bengali, and knows everything about my work and life. Python, FastAPI, self-hosted search. It does daily reviews, researches things on its own, and learns from conversations.

**OnlineExam** — Originally wrote this in college using .NET Framework 4.5. Rewrote it in .NET 9 with Clean Architecture (Carter, MediatR, EF Core 9) just to see how far the ecosystem has come in a decade.

---

## What I work with

**Daily:** Java, TypeScript, Python, C#, Bash, SQL

**Backend:** Spring Boot, ASP.NET Core, NestJS, FastAPI

**Data:** PostgreSQL, SQL Server, DynamoDB, Elasticsearch

**Cloud:** AWS (Lambda, IoT Core, S3, DynamoDB), Docker, Cloudflare

**Frontend:** Angular, React (when needed)

---

## This site

Built with [Astro](https://astro.build/) and [AstroPaper](https://github.com/satnaing/astro-paper). Deployed on Cloudflare Pages.

[GitHub](https://github.com/ArghaRay00) · [LinkedIn](https://www.linkedin.com/in/argha-ray/) · [X](https://x.com/argharay94)
