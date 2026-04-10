---
layout: ../layouts/AboutLayout.astro
title: "About"
---

I'm Argha — a software engineer in Bangalore with nine years of building things that run in production. Most of that time has been at **Motorola Solutions**, working on the backend systems behind their push-to-talk platform used by public safety and enterprise teams worldwide.

I've written code across a lot of stacks — Java, C#, TypeScript, Python — but what I care about most is understanding how systems work end to end. From the database schema to the deployment pipeline to the thing that pages you at 2am.

Currently making my way toward machine learning engineering.

---

## 2026

**Authorization Service** · Java, Spring Boot, PostgreSQL

Moved to the Database Services team and took ownership of the AuthZ microservice — the RBAC engine for the entire Kodiak PTT platform. Six user roles, thirty-five resource types, permission rulesets encoded as hex bitmasks.

What I shipped:
- Wrote the API integration test suite covering all permission combinations across roles and resources
- Added JSR-303 input validation across the request layer
- Refactored the monolith into cleaner service boundaries — split out the scheduler, the external request approval flow, and validation logic into separate concerns
- Became the primary developer and reviewer on this codebase

**pgEdge / Asset Manager PostgreSQL** · Python, PostgreSQL, Patroni, pgBackRest

Helping design the highly available PostgreSQL backend for a new service that will store 60TB of historical call recordings across two data centers.

- Built a Python wrapper around pgBackRest for automated backup and restore operations — includes monitoring (CPU, memory, disk I/O, WAL), benchmarking, and resource collection
- Architecture: Active/Standby per site via Patroni, inter-site bi-directional replication via pgEdge, PgBouncer connection pooling, Consul for service discovery
- Currently running the PoC — writing the knowledge base docs, presenting demos, coordinating with the architecture team

**Universal Deployer** · Bash

A deployment tool I wrote for the team's shared test servers. Started as a script, turned into something people actually depend on.

- 20+ commands: deploy, rollback, restart, lock/unlock, health check with auto-rollback, snapshot, diff, audit trail
- Used by the team daily for deploying JAR services across multiple environments
- Golden image validation and config drift detection

---

## 2025

**Device Cloud Services** · TypeScript, AWS Lambda, IoT Core, DynamoDB

Spent the year across the WoC (Wave OnCloud) ecosystem — the serverless layer that manages PTT devices in the field.

- Worked on Lambda functions handling device shadows, firmware updates, MQTT-based task execution
- Investigated a major production outage — disproved the original "connection pool exhaustion" root cause, traced the real issue to TDS connection poisoning after a database disruption. The original RCA had been accepted for months. I re-opened it.
- Helped with the carrier transition workflows and production config rollouts

**Provisioning Configuration** · Java, Spring Boot

Started touching the authorization and CAT (Central Admin Tool) codebases that would become my main focus in 2026. Built the Requests & Approvals API integration between CAT and AuthZ — twelve endpoints with pagination, expiration scheduling, and cross-service authorization.

---

## 2023 – 2024

**OnePortal** · Angular, ASP.NET Core, C#, SQL Server, Entity Framework, AWS

The most intense stretch. OnePortal is Motorola's multi-tenant provisioning portal for the entire PTT platform — device lifecycle, subscriber management, carrier integrations, certificate management. I was full-stack on this for two years.

Some of the bigger things I worked on:

- **Device cloning** — built the multi-zone device cloning feature end to end, spanning the Kodiak subscriber API, the group API, and the portal UI. Notifications, role-based access, cross-zone association.
- **Carrier transition** — handled the migration from Telna to WirelessLogic as the MVNO carrier. API integration, webhook updates, subscriber lifecycle changes.
- **Webhook integrations** — built the webhook layer connecting OnePortal to the Device Cloud Services for real-time device state updates.
- **Certificate management** — WiFi Enterprise certificate distribution to devices through the portal.
- **Production support** — SIT, UAT, and production deployments. Environment-specific debugging. The kind of work where you learn how things really break.

During a quieter quarter in late 2023, I did an IPR analysis across the codebase and identified **seven patent candidates** — including multi-zone device cloning, WiFi enterprise certificate distribution, multi-carrier MVNO federation, and a dual-token cross-validation pattern with JWE enrichment.

The portal has 28 API controllers, 90+ database entities, Okta authentication with JWE tokens, and integrations with six different MVNO carriers, Salesforce, Mulesoft, and AWS. I touched most of it.

---

## 2021 – 2022

**OnePortal** · Angular, ASP.NET Core, .NET Framework → .NET Core, SQL Server

Joined the OnePortal team. The first real project — migrating the MVNO carrier integration layer from legacy .NET Framework to .NET Core.

- Migrated six carrier APIs — BeQuick, Telna, IIJ, CiscoJasper, WirelessLogic, HotMobile — each with their own authentication patterns, request formats, and failure modes
- Wrote unit tests for all of them. This was the first time the carrier layer had test coverage.
- Built the device management UI — listing pages, device parameter configuration (WiFi, Bluetooth, APN, location, stun/unstun), IoT shadow integration
- Built the device DM (Device Management) action layer — APN profiles, WiFi Enterprise, Bluetooth config, radio wipe, device restart, all integrated with the AWS IoT backend
- Handled the Okta integration for the portal, including cookie handling, token passing, and CAT/UGW URL rewriting

By the end of 2022, I was running production deployments, doing code reviews, and supporting QA across SIT and UAT environments. The codebase went from something I was learning to something I was responsible for.

---

## Side projects

**Streaming platform** — A TVOD platform for on-demand movie rentals. NestJS backend, React frontend, Shaka Player for HLS playback. I built two versions: one self-hosted on a free Oracle ARM VPS, and one integrated with Bunny Stream CDN with per-segment token authentication. Learned a lot about video delivery, caching strategies, and DRM — and [wrote about it](/posts/streaming-video-on-a-zero-dollar-server).

**Personal AI agent** — An agent that runs 24/7 on my VPS. Python, FastAPI, Telegram bot. It has its own cognitive architecture — different modes for listening, advising, researching. It searches the web, writes daily reviews, maintains a knowledge base, and talks in romanized Bengali. Still evolving.

**OnlineExam** — An exam management system I originally wrote in college with .NET Framework 4.5. Rewrote it from scratch in .NET 9 with Clean Architecture — Carter for endpoints, MediatR for CQRS, EF Core 9 for data access, xUnit for tests, GitHub Actions for CI. Twenty-plus endpoints covering auth, admin CRUD, exam management, and auto-grading.

---

## What I work with

**Day to day:** Java, TypeScript, Python, C#, Bash, SQL

**Backend:** Spring Boot, ASP.NET Core, NestJS, FastAPI, Entity Framework, TypeORM

**Data:** PostgreSQL, SQL Server, DynamoDB, Elasticsearch, Redis

**Cloud & infra:** AWS (Lambda, IoT Core, S3, DynamoDB), Docker, Cloudflare, GitHub Actions, Azure DevOps

**Frontend:** Angular, React — I can build UIs but my heart is in the backend

---

[GitHub](https://github.com/ArghaRay00) · [LinkedIn](https://www.linkedin.com/in/argha-ray/) · [X](https://x.com/argharay94)
