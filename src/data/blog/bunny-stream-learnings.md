---
author: Argha Ray
pubDatetime: 2026-04-05T18:00:00Z
title: "From Self-Hosted HLS to Bunny Stream: What Changes and What Breaks"
slug: from-self-hosted-hls-to-bunny-stream
featured: true
draft: false
tags:
  - streaming
  - nestjs
  - architecture
description: "Part 2 of the streaming POC series. I swapped self-hosted HLS for Bunny Stream CDN with per-segment token authentication via Shaka Player — every gotcha, cost comparison, and architectural decision along the way."
---

## Table of contents

**Part 1:** [Streaming Video on a Zero-Dollar Server](https://argha.dev/posts/streaming-video-on-a-zero-dollar-server)

**Status:** Raw notes — not polished prose yet.

---

## Title Ideas

- "From Zero-Dollar HLS to Managed CDN: What I Learned Integrating Bunny Stream"
- "I Streamed Video for $0/Month. Here's What Happened When I Needed It to Scale."
- "Self-Hosted HLS Was the Easy Part — CDN, DRM, and the Real Costs of Streaming"
- "Part 2: When Your Free Streaming Server Meets Production Reality"

---

## 1. Why Evaluate a Managed CDN After Self-Hosted Worked?

The self-hosted POC (Part 1) proved the architecture:

- Shaka Player + HLS + Caddy reverse proxy + NestJS session tracking — all on a free Oracle ARM VPS
- Zero monthly cost for a demo streaming platform
- But it validated the **flow**, not the **scale**

What self-hosted doesn't solve:

- **Encoding pipeline** — I ran `ffmpeg` manually to produce 720p + 480p HLS. For 500 titles at production quality (5 renditions, H.264 + HEVC), that's a compute problem, not a script problem.
- **Storage** — HLS segments for a 2-hour movie across all renditions: ~4.5 GB (H.264 only), ~7 GB with HEVC. 500 titles = 2-3.5 TB. My Oracle VPS has 200 GB.
- **CDN egress** — Cloudflare Tunnel is free, but it's proxying from a single VPS in Hyderabad. A user in New Jersey gets 200ms+ latency on every segment fetch. Real streaming needs edge PoPs.
- **DRM** — Licensed content cannot ship as plain HLS. Distributors require Widevine + FairPlay at minimum. Self-hosted HLS has zero DRM.

The POC proved the architecture was right (same-origin reverse proxy, JWT auth, stream sessions, Shaka Player). Now the question was: **which managed provider slots into this architecture with the least disruption?**

---

## 2. The VdoCipher vs Bunny Stream Decision

Evaluated three options: VdoCipher, Bunny Stream, and full AWS pipeline (MediaConvert + S3 + CloudFront + PallyCon).

### VdoCipher — killed by player lock-in

VdoCipher is an Indian company (Gurugram-based), battle-tested with Indian OTT platforms, full multi-DRM including PlayReady. Sounds perfect for a South Indian diaspora TVOD platform.

**The dealbreaker:** VdoCipher **requires their proprietary player SDK**. You cannot use Shaka Player. Their DRM license flow is tightly coupled to their custom Video.js-based player.

This is unacceptable when:
- The POC already runs Shaka Player
- The production design explicitly chose Shaka for zero cost, Apache 2.0 license, and full DRM configurability
- Switching to VdoCipher's player means rewriting the entire player integration and losing control over ABR behavior, buffering strategy, and DRM configuration
- No path back to Shaka without re-integrating everything

**Lesson:** Player lock-in is the worst kind of vendor lock-in for a streaming platform. Your player is the most visible, most customized part of the stack. Everything else (encoding, CDN, DRM keys) is backend plumbing that can be swapped. The player cannot.

### Bunny Stream — the winner

- **Shaka Player compatible** — explicit documentation for Shaka integration. Direct HLS manifest URLs work with any HLS-capable player.
- **CDN pricing is 8-17x cheaper than CloudFront** — $0.005-0.01/GB vs $0.085/GB
- **Enterprise DRM** at $99/mo — Widevine + FairPlay via MediaCage (launched 2025)
- **No PlayReady** — but Chromium-based Edge uses Widevine anyway. The gap is Xbox, Roku, legacy smart TVs. For a South Indian diaspora audience (primarily mobile + Chrome/Safari), this is acceptable.

### AWS Pipeline — production target, overkill for Phase 1

Full control (MediaConvert + S3 + CloudFront + PallyCon) but 3-5x more expensive at every scale. One-time encoding cost alone: ~$21,500 for 500 titles vs ~$6,000 on Bunny. Monthly at 5K MAU: ~$2,500/mo vs ~$400-700/mo on Bunny.

### Cost reality at 5,000 MAU

| Provider | Monthly | One-time encoding |
|----------|---------|-------------------|
| **Bunny Stream** | **$400-700/mo** | ~$6,000 |
| VdoCipher | $400-800/mo | $0 (included) |
| AWS Pipeline | $2,100-2,770/mo | ~$21,500 |

The gap **widens** at scale. At 25K MAU: Bunny $1,200-2,100/mo vs AWS $5,500-7,300/mo. Bunny's CDN pricing is just fundamentally cheaper.

---

## 3. Bunny Stream Token Authentication — The Big Gotcha

This was the hardest part of the integration. Bunny has **two completely different token systems** and the documentation doesn't make the distinction obvious.

### Token System 1: Embed Tokens (for iframe embeds)

```
token = SHA256_HEX(securityKey + videoId + expiryTimestamp)
URL: https://iframe.mediadelivery.net/embed/{libraryId}/{videoId}?token={token}&expires={expires}
```

This is what the Bunny docs show first. It's for their iframe embed player. **This does NOT work for direct HLS manifest URLs.**

### Token System 2: CDN Pull Zone Tokens (for direct HLS URLs)

```
token = Base64URL(SHA256_RAW(securityKey + urlPath + expiryTimestamp))
URL: https://vz-{pullZone}.b-cdn.net/{videoId}/playlist.m3u8?token={token}&expires={expires}
```

This is what you need for Shaka Player integration. The security key comes from the **Pull Zone settings**, not the Stream library settings.

### The directory token requirement (theory vs reality)

In theory, you must use directory-scoped tokens so that HLS segment requests are also authenticated. When Shaka Player loads `playlist.m3u8`, it then fetches individual `.ts` segments from the same directory path (`/{videoId}/360p/video.m3u8`, `/{videoId}/360p/seg-1.ts`, etc.). If your token only covers the manifest URL path, the segment fetches get 403s.

The token should be scoped to the video ID directory: `token_path=/{videoId}/`

**UPDATE:** In practice, directory tokens (`token_path`) returned 403 on Bunny Stream pull zones despite working in theory. This turned out to be the dealbreaker for CDN token auth with custom HLS players. See Section 11 for the full investigation and resolution.

### What I actually implemented

After going through this, I landed on the simpler approach that works for Bunny Stream specifically:

```typescript
// bunny.service.ts
getSignedManifestUrl(videoId: string, expiresInSec = 3600): string {
  const expires = Math.floor(Date.now() / 1000) + expiresInSec;
  const token = createHash('sha256')
    .update(this.tokenAuthKey + videoId + expires)
    .digest('hex');

  return `https://${this.cdnHostname}/${videoId}/playlist.m3u8?token=${token}&expires=${expires}`;
}
```

The token format is: `SHA256_HEX(tokenAuthKey + videoId + expiresTimestamp)`. The `tokenAuthKey` comes from the Pull Zone's token authentication settings in the Bunny dashboard.

**UPDATE (post-integration):** This hex-digest approach was the initial attempt. In practice, Base64URL encoding of the raw hash also returns 200 on the manifest. However, **neither format solves the HLS segment auth problem** — see Section 11 for the full deep dive. The POC ultimately disabled CDN token auth entirely and relies on backend JWT as the gate.

### Key confusion points

1. **Where to find the security key:** It's in Pull Zone > Security > Token Authentication, NOT in Stream > Library Settings. The library API key is for API calls, not for URL signing.
2. **Two different hashing outputs:** Embed tokens use hex digest. CDN tokens for generic pull zones use raw binary → Base64URL. Bunny Stream CDN hostnames appear to accept the simpler hex format.
3. **403 on first attempt:** I initially used the embed token format on CDN URLs. Different signing algorithm, different key source. Instant 403.

---

## 4. Architecture Simplification

The Bunny Stream branch is **simpler** than the self-hosted branch. Here's exactly what changed:

### Removed

| Component | Self-hosted (main) | Bunny Stream |
|-----------|-------------------|--------------|
| `media/` directory | Contains `encode.sh` + HLS output | **Deleted** |
| `media/encode.sh` | ffmpeg script for HLS encoding | **Deleted** |
| Caddy `/content/*` route | Serves static HLS segments | **Removed from Caddyfile** |
| Docker `media` volume mount | Mounts HLS segments into Caddy | **Removed from docker-compose** |

### Added

| Component | What it does |
|-----------|-------------|
| `BunnyService` (85 lines) | Signed URL generation + Bunny API wrapper |
| 4 env vars | `BUNNY_API_KEY`, `BUNNY_LIBRARY_ID`, `BUNNY_CDN_HOSTNAME`, `BUNNY_TOKEN_AUTH_KEY` |
| `bunny-upload.sh` script | Seeds test videos via Bunny's fetch-from-URL API |

### Caddy went from 4 route blocks to 3

**Before (self-hosted):**
```
:80 {
    handle /api/*    { reverse_proxy backend:3200 }
    handle /session  { reverse_proxy backend:3200 }
    handle /content/* { root * /srv/media; file_server }
    handle           { root * /srv/frontend; try_files {path} /index.html; file_server }
}
```

**After (Bunny Stream):**
```
:80 {
    handle /api/*    { reverse_proxy backend:3200 }
    handle /session  { reverse_proxy backend:3200 }
    handle           { root * /srv/frontend; try_files {path} /index.html; file_server }
}
```

No `/content/*` route. The player fetches HLS directly from Bunny CDN. Caddy only proxies API calls and serves the SPA.

### docker-compose.prod.yml — lost the media volume

The self-hosted branch mounts `./media/output:/srv/media:ro` into the proxy container. The Bunny branch has no media volume at all. The proxy container is lighter.

### Player.jsx — minimal change

The self-hosted branch constructed a local HLS path:
```javascript
// Before: local path constructed from asset data
await player.load('/content/' + asset.hlsPath + '/master.m3u8');
```

The Bunny branch uses the manifest URL returned by the stream initiation API:
```javascript
// After: signed Bunny CDN URL from API response
await player.load(manifestUrlRef.current);
```

The `manifestUrl` comes from `POST /api/stream/initiate`, which calls `BunnyService.getSignedManifestUrl()` on the backend. The player doesn't know or care that the URL points to Bunny CDN — it's just an HLS manifest URL.

### StreamService change

```typescript
// stream.service.ts — the key change
const bunnyVideoId = asset.cdnUrl;  // was a local path, now a Bunny GUID
const manifestUrl = this.bunnyService.getSignedManifestUrl(bunnyVideoId, 3600);

return {
  manifestUrl,  // was constructed from local path, now a signed Bunny CDN URL
  session: { id: session.id, quality: asset.quality, startedAt: session.startedAt.toISOString() },
};
```

The `movie_assets.cdn_url` column stores the Bunny video GUID (e.g., `a1b2c3d4-e5f6-7890-abcd-ef1234567890`) instead of a local path like `/content/big-buck-bunny/`. Same column, different content.

---

## 5. Bunny Stream API Learnings

### Uploading test videos

The easiest upload path is **fetch-from-URL** — give Bunny a public URL and it downloads + encodes automatically:

```bash
curl -s -X POST "https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/fetch" \
  -H "AccessKey: ${BUNNY_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://download.blender.org/peach/bigbuckbunny_movies/BigBuckBunny_320x180.mp4", "title": "Big Buck Bunny"}'
```

Response includes the video GUID immediately. Encoding happens async.

### Encoding status codes

| Status | Meaning |
|--------|---------|
| 0 | Queued |
| 1 | Processing |
| 2 | Encoding |
| 3 | Finished |
| 4 | Resolution finished [VERIFY: what exactly triggers this vs 3?] |
| 5 | Failed |

Encoding is automatic — no config needed. Bunny generates an ABR ladder from the source. Short clips (Blender test videos, ~1-10 min) encode in a few minutes.

### Dead source URLs

Some Blender Foundation download URLs are dead. The `elephants_dream_trailer_480p.mov` URL from `download.blender.org/ED/trailer/` returns 404. Archive.org has mirrors for most Blender open movies. Worth checking URLs before building upload scripts around them.

### API structure

```
Base URL: https://video.bunnycdn.com/library/{libraryId}
Auth header: AccessKey: {apiKey}

GET  /videos                    — list all videos (paginated)
GET  /videos/{videoId}          — get single video details
POST /videos                    — create video object (for direct upload)
POST /videos/fetch              — create + fetch from URL
PUT  /videos/{videoId}          — upload video content (direct)
DELETE /videos/{videoId}        — delete video
```

The API key is per-library, not per-account. Each library has its own API key, CDN hostname, and pull zone.

---

## 6. What Stayed the Same

This is the important part for the blog narrative. The self-hosted POC validated an architecture that **cleanly separates delivery from everything else**. Swapping the delivery layer proved it.

### Unchanged components

| Component | Details |
|-----------|---------|
| **Shaka Player config** | Zero changes to player initialization, error handling, ABR config |
| **JWT auth flow** | AuthGuard, session endpoint, token storage — identical |
| **Stream session lifecycle** | `POST /api/stream/initiate` → heartbeat interval → `POST /api/stream/stop` |
| **Same-origin reverse proxy** | Caddy still fronts everything on a single domain, no CORS |
| **DB schema** | Same tables, same columns. `cdn_url` stores a GUID instead of a path |
| **Frontend UI** | MovieList, Player, Header components — untouched except manifest URL source |
| **Docker Compose structure** | Same services (postgres, backend, frontend, proxy), same network topology |
| **Seed data** | Same 4 movies (Viduthalai 2, Amaran, Pushpa 2, Kalki), same filmmakers, same genres |

### The lesson

If your streaming architecture properly separates:
1. **Auth** (who can watch)
2. **Sessions** (what they're watching, for how long)
3. **Delivery** (how the bits get to the player)

...then swapping #3 is a backend service change + a few env vars. The frontend doesn't even need to know the delivery layer changed.

---

## 7. Deployment Notes

### Two live deployments, same VPS

| Branch | Subdomain | Delivery |
|--------|-----------|----------|
| `main` | `globo.argha.dev` | Self-hosted HLS from Caddy |
| `feat/bunny-stream` | `globo-bunny.argha.dev` | Bunny Stream CDN |

Both run on the same Oracle ARM VPS (Ampere A1, 4 OCPU, 24 GB RAM, Hyderabad region) via Cloudflare Tunnel. Different Docker Compose stacks, different Cloudflare Tunnel routes, same machine.

### Environment variables for Bunny branch

```bash
# .env (in addition to existing DB/JWT vars)
BUNNY_API_KEY=your-library-api-key          # From: Stream > Library > API Access
BUNNY_LIBRARY_ID=your-library-id            # From: Stream > Library > Overview
BUNNY_CDN_HOSTNAME=vz-abc123.b-cdn.net      # From: Stream > Library > CDN > Hostname
BUNNY_TOKEN_AUTH_KEY=your-token-auth-key     # From: CDN > Pull Zone > Security > Token Auth
```

Note the key source mismatch: three values come from the Stream library settings, but the token auth key comes from the CDN Pull Zone settings. This tripped me up initially.

### docker-compose required var enforcement

```yaml
# Both dev and prod compose files enforce Bunny vars
BUNNY_API_KEY: ${BUNNY_API_KEY:?Set BUNNY_API_KEY in .env}
BUNNY_LIBRARY_ID: ${BUNNY_LIBRARY_ID:?Set BUNNY_LIBRARY_ID in .env}
BUNNY_CDN_HOSTNAME: ${BUNNY_CDN_HOSTNAME:?Set BUNNY_CDN_HOSTNAME in .env}
BUNNY_TOKEN_AUTH_KEY: ${BUNNY_TOKEN_AUTH_KEY:?Set BUNNY_TOKEN_AUTH_KEY in .env}
```

The `?Set ...` syntax makes `docker compose up` fail immediately with a clear error if any var is missing. Much better than a runtime NestJS crash.

### Seeding content

```bash
# Upload test videos to Bunny (one-time)
export BUNNY_API_KEY="..." BUNNY_LIBRARY_ID="..."
./scripts/bunny-upload.sh

# Script outputs GUIDs, then manually update DB:
UPDATE movie_assets SET cdn_url = '<guid>' WHERE id = 'b1000000-...';
```

[VERIFY] Consider whether a migration or seed script should handle this automatically instead of manual SQL. For a POC it's fine, for production there should be a content ingestion pipeline.

---

## 8. Comparison with Part 1

### Part 1 narrative: "I can stream video for $0/month"

- Proved: reverse proxy architecture, Shaka Player + HLS, stream sessions, JWT auth
- Cost: literally $0 (Oracle free tier VPS + Cloudflare free tier tunnel)
- Limitation: single VPS in Hyderabad, no encoding pipeline, no DRM, no CDN

### Part 2 narrative: "Now make it production-ready"

- Proved: managed encoding + CDN slots into the same architecture
- Cost: Bunny Stream at ~$400-700/mo for 5K MAU
- Gained: automatic ABR encoding, global CDN, DRM path (Widevine + FairPlay at $99/mo)
- Lost: the $0 bragging rights

### The through-line

The POC architecture was designed with this swap in mind. The same-origin reverse proxy, JWT auth, and stream session lifecycle are **delivery-agnostic**. Part 1 proved they work. Part 2 proved they're portable.

If I had coupled the player to a specific CDN URL pattern, or baked media serving into the application layer, or used a proprietary player SDK — the swap would have been a rewrite, not a branch.

---

## 9. Gotchas and Sharp Edges (Quick Reference)

1. **Bunny has TWO token systems.** Embed tokens (for iframe) vs CDN tokens (for direct HLS URLs). Different algorithms, different keys.

2. **The token auth key is NOT in the Stream library settings.** It's in CDN > Pull Zone > Security > Token Authentication.

3. **Directory-scoped tokens are mandatory for HLS.** Without `token_path` scoping, the manifest loads but segment fetches 403.

4. **Blender Foundation URLs go stale.** `download.blender.org` links for older projects (Elephant's Dream) may 404. Use archive.org mirrors.

5. **Bunny encoding status `4` is ambiguous.** Status `3` = finished, `4` = "resolution_finished" — unclear if this means a single resolution completed or all. [VERIFY]

6. **No PlayReady is fine for mobile-first diaspora.** But document it as a known limitation. If a content licensor asks about Xbox/Roku coverage, the answer is "not yet, Phase 2."

7. **Free encoding is H.264 only.** H.265/VP9/AV1 cost $0.025-0.15/min depending on resolution. At 500 titles of 2hrs each, premium codecs add ~$1,500-9,000 one-time.

8. **VdoCipher's bandwidth plans are misleading.** The $599/mo "Scale" plan includes 1 TB of bandwidth. At 5K MAU with 27 TB egress, you're 27x over the limit. The overage charges push VdoCipher above Bunny in cost.

9. **Bunny MediaCage DRM launched in 2025.** It's newer and less battle-tested than PallyCon or VdoCipher's DRM. Worth validating with real device testing before production launch.

10. **The `cdn_url` column is overloaded.** In the self-hosted branch it stores a local path. In the Bunny branch it stores a GUID. This works for a POC but a production schema should probably have separate columns or a `provider` discriminator.

11. **Bunny has TWO API keys per library.** The library API key (for REST API calls) and the token auth key (for URL signing) are different GUIDs found in different dashboard sections. Using the wrong one gives unhelpful 403s.

12. **"Block direct url file access" defaults ON.** This blocks all requests without a `Referer` header. Backend-generated URLs (no browser context) will always 403 until this is turned OFF.

13. **CDN token auth is per-path, not per-video.** This fundamentally breaks HLS sub-resource loading. The manifest token doesn't authorize segment fetches at different paths.

14. **Directory tokens (`token_path` param) don't work with Bunny Stream pull zones.** Despite being documented for regular Bunny CDN, directory-scoped tokens return 403 on Stream pull zones. Possibly a Stream-specific limitation.

15. **For custom players (Shaka, hls.js): either skip token auth or use DRM.** There is no middle ground. CDN token auth was designed for static single-file assets, not multi-file HLS streams accessed by a player that constructs relative URLs.

---

## 10. Code Snippets for the Blog

### BunnyService — the entire integration (85 lines)

```typescript
// backend/src/modules/stream/services/bunny.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';

@Injectable()
export class BunnyService {
  private readonly logger = new Logger(BunnyService.name);
  private readonly apiKey: string;
  private readonly libraryId: string;
  private readonly cdnHostname: string;
  private readonly tokenAuthKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.getOrThrow('BUNNY_API_KEY');
    this.libraryId = this.configService.getOrThrow('BUNNY_LIBRARY_ID');
    this.cdnHostname = this.configService.getOrThrow('BUNNY_CDN_HOSTNAME');
    this.tokenAuthKey = this.configService.getOrThrow('BUNNY_TOKEN_AUTH_KEY');
  }

  getSignedManifestUrl(videoId: string, expiresInSec = 3600): string {
    const expires = Math.floor(Date.now() / 1000) + expiresInSec;
    const token = createHash('sha256')
      .update(this.tokenAuthKey + videoId + expires)
      .digest('hex');
    return `https://${this.cdnHostname}/${videoId}/playlist.m3u8?token=${token}&expires=${expires}`;
  }

  async getVideo(videoId: string): Promise<BunnyVideoResponse> {
    const res = await fetch(
      `https://video.bunnycdn.com/library/${this.libraryId}/videos/${videoId}`,
      { headers: { AccessKey: this.apiKey } },
    );
    if (!res.ok) throw new Error(`Failed to fetch video: ${res.statusText}`);
    return res.json();
  }

  async listVideos(page = 1, perPage = 100): Promise<BunnyVideoListResponse> {
    const res = await fetch(
      `https://video.bunnycdn.com/library/${this.libraryId}/videos?page=${page}&itemsPerPage=${perPage}`,
      { headers: { AccessKey: this.apiKey } },
    );
    if (!res.ok) throw new Error(`Failed to list videos: ${res.statusText}`);
    return res.json();
  }
}
```

### The one-line player change

```javascript
// Player.jsx — the only change
// Before (self-hosted): constructed local path
// After (Bunny): use signed URL from API response
await player.load(manifestUrlRef.current);
```

### Upload script — fetch-from-URL

```bash
# Create + fetch in one API call
curl -s -X POST "${API}/fetch" \
  -H "AccessKey: ${BUNNY_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://download.blender.org/peach/bigbuckbunny_movies/BigBuckBunny_320x180.mp4", "title": "Big Buck Bunny"}'
```

---

## 11. Token Auth Deep Dive — The Real Story (Post-Integration Update)

The token auth section above (Section 3) describes the initial understanding. What follows is what actually happened during integration testing — a significantly more painful journey.

### Wrong key on the first attempt

The library API key (`34dbd106-...` format) is **NOT** the CDN token auth key. The token auth key is a separate value found in **Stream > Library > Security > Token authentication key** section. The dashboard shows both keys but they serve completely different purposes:

- **Library API key:** for REST API calls (upload, list, delete videos)
- **Token auth key:** for signing playback URLs

I initially used the library API key for URL signing. Every request 403'd. The fix: find the actual token auth key in the Security section — it's a different GUID entirely (format: `f7ee1046-b390-42dc-bc58-20c734e47067`).

### "Block direct url file access" — the silent blocker

This setting was **ON by default** in the Bunny dashboard. It blocks any request that doesn't carry a `Referer` header. Since the backend generates signed URLs (no browser context, no referer), every request returned 403 regardless of whether the token was correct.

Had to turn it OFF in the dashboard under the pull zone security settings. This is not documented as a prerequisite for API-generated URLs.

### Three signing formats tested

After fixing the key and the referer setting, I tested three different signing approaches:

| Format | Hash | Path Used | Encoding | Result |
|--------|------|-----------|----------|--------|
| 1 | SHA256 | Full path (`/{videoId}/playlist.m3u8`) | Base64URL | **200** on manifest |
| 2 | MD5 | Full path (`/{videoId}/playlist.m3u8`) | Base64URL | **200** on manifest |
| 3 | SHA256 | Directory path (`/{videoId}/`) | Base64URL + `token_path` param | **403** |

Formats 1 and 2 both worked for the manifest. Format 3, which should have been the correct approach for HLS (directory-scoped token), consistently returned 403.

### The HLS segment problem — the actual dealbreaker for CDN token auth

This is the core issue that Section 3 above doesn't fully capture.

CDN token auth signs per-path. The manifest gets 200. But HLS has sub-resources:

1. Player loads `/{videoId}/playlist.m3u8` (the master manifest) — **200**, token matches path
2. Master manifest references `360p/video.m3u8` — player constructs `/{videoId}/360p/video.m3u8`
3. Sub-manifest references `seg-1.ts`, `seg-2.ts` — player constructs `/{videoId}/360p/seg-1.ts`

Shaka Player constructs segment URLs relative to the manifest URL. **Segment requests carry the manifest's token, which is signed for a different path.** Result: **403** on every segment.

The theoretical fix is directory tokens (`token_path=/{videoId}/`) which should authorize any path under the video ID directory. But as shown above, directory tokens returned 403 — possibly a Bunny Stream-specific limitation. Bunny Stream pull zones may handle `token_path` differently than regular Bunny CDN pull zones.

Signing each segment individually would require intercepting every Shaka network request via `NetworkingEngine.registerRequestFilter()`, computing a fresh signed URL for each segment fetch. That's technically possible but adds significant complexity for a POC.

### The resolution: three options

After exhausting the token auth path, I identified three viable approaches:

**Option A — POC approach (chosen):** Disable CDN token auth entirely. Rely on backend JWT to gate `POST /api/stream/initiate`. The manifest URL itself is not secret — the POC has no DRM content, so a leaked URL just plays a Blender open movie. Add referrer restrictions in the Bunny dashboard for basic protection.

**Option B — Complex custom player approach:** Use Shaka Player's `NetworkingEngine.registerRequestFilter()` to intercept every segment request, call the backend for a fresh signed URL per segment, and rewrite the request. Works but adds latency per segment and significant implementation complexity.

**Option C — Production approach:** Enable MediaCage Enterprise DRM ($99/mo). Widevine/FairPlay handle auth at the CDM/player level — no URL signing needed. The player requests a DRM license from Bunny's license server, and the server validates it. This is the real answer for TVOD. This validates the design doc's recommendation of Bunny Stream with DRM.

### CDN token auth vs Stream token auth — two different systems

This distinction is the most important takeaway:

- **CDN token auth** = Pull Zone level, path-based HMAC signing, designed for static files (images, downloads, single-file assets)
- **Stream embed token auth** = video-level signing, designed for Bunny's iframe embed player (the player auto-handles sub-resources)
- **Neither is designed for custom HLS players with token auth**

The expected flow Bunny designed for is: use their embed player (which auto-signs internally) OR use DRM (which handles auth at the license level). Custom players like Shaka/hls.js with CDN token auth is an unsupported middle ground.

This is a **critical learning** for anyone trying to use Shaka/hls.js with Bunny Stream + token auth. The answer is: don't. Either use their embed player, or go DRM.

### Bunny dashboard gotchas documented

Settings that must be correctly configured for direct CDN playback with a custom player:

| Setting | Location | Required Value | Why |
|---------|----------|----------------|-----|
| Enable direct play | Stream > Library | **ON** | OFF = embed-only, direct CDN URLs return 403 |
| Block direct url file access | CDN > Pull Zone > Security | **OFF** | ON = requires `Referer` header, API-generated URLs don't have one |
| Token authentication | CDN > Pull Zone > Security | **OFF for POC** | ON = per-path signing that breaks HLS sub-resources |

Settings changes may take a few minutes to propagate through Bunny's edge network.

### Architecture decision update

| Stage | Token Auth Approach | Justification |
|-------|-------------------|---------------|
| **POC** | Option A — no CDN token auth, backend JWT is the gate | Simplicity, no DRM content to protect |
| **Production** | Option C — MediaCage DRM ($99/mo) | Widevine/FairPlay at CDM level, no URL signing complexity |

This changes the blog narrative significantly. It's not just "plug in Bunny and go" — it's "here's what the managed CDN abstracts away and here's where the abstraction leaks."

---

## 12. Questions to Answer Before Publishing

- [RESOLVED] Exact Bunny Stream token format — both hex digest and Base64URL return 200 on manifest. Moot point: CDN token auth disabled for POC due to HLS segment auth problem (see Section 11).
- [VERIFY] Status code 4 (`resolution_finished`) — does this fire per-resolution during encoding, or is it a terminal state?
- [VERIFY] Bunny CDN latency from India — test actual TTFB from Hyderabad/Chennai/Mumbai to the nearest Bunny PoP
- [VERIFY] DRM license server URL format for MediaCage — what does the Shaka Player DRM config look like when Enterprise DRM is enabled?
- [ ] Get actual encoding times for a full-length (2hr) movie on Bunny Stream
- [ ] Screenshot the Bunny dashboard showing encoding status for the blog
- [ ] Test token expiry behavior — does Shaka Player handle mid-stream token expiry gracefully, or does it hard-fail?
- [ ] Measure: time from `POST /api/stream/initiate` to first video frame rendered (compare self-hosted vs Bunny)

---

## 13. It Works — End-to-End Deployment

Final learnings from the actual deployment to production.

### Deployment alongside existing POC

Cloned the repo into a separate directory (`globo-poc-bunny`) on the same Oracle ARM VPS. Both the self-hosted POC (globo.argha.dev) and the Bunny Stream POC (globo-bunny.argha.dev) run simultaneously on the same server.

### Docker container naming

Renamed all containers (`globo-bunny-postgres`, `globo-bunny-backend`, `globo-bunny-proxy`) and volumes (`bunny_postgres_data`) to avoid conflicts with the existing globo-poc deployment. Docker networks also renamed (`globo-bunny-internal`).

### Port 80 is not a conflict

Both proxy containers listen on port 80 internally. No conflict because Docker containers have isolated network namespaces with separate IPs on the shared `infra_web` network. Cloudflared routes by container name, not port: `globo-bunny-proxy:80` resolves to a different IP than `globo-poc-proxy:80`.

### Postgres port conflict

The dev compose file exposed port 5433 on the host, which was already taken by the existing deployment. Fix: removed host port binding entirely for the bunny deployment since prod doesn't need it (postgres is internal-only).

### Migration ran clean

All 5 migrations executed on the fresh database. Seed data populated with real Bunny video GUIDs. Test user created.

### Cloudflare Tunnel route

Added `globo-bunny.argha.dev → http://globo-bunny-proxy:80` in Zero Trust dashboard. Token-based tunnel means routes are managed in the dashboard, not a local config file.

### Option B (Shaka request filter) confirmed working in production

Per-segment SHA256 signing via Web Crypto API works end-to-end. Every HLS segment request is intercepted by the Shaka NetworkingEngine filter, signed with the CDN token auth key, and served from Bunny CDN. No 403s on segments.

### End-to-end flow verified

- Browse movies at globo-bunny.argha.dev
- Login with test@globo.dev / test123
- Click play — stream initiates with signed manifest URL + cdnAuth params
- Shaka Player loads manifest, request filter signs each segment
- Video plays with adaptive bitrate (240p/360p/480p)
- Heartbeat and stop session work

### Two live POCs for comparison

- **https://globo.argha.dev** — self-hosted HLS, local encoding, Caddy serves segments
- **https://globo-bunny.argha.dev** — Bunny Stream CDN, managed encoding, per-segment token auth
- Same UI, same auth, same session tracking — only the delivery layer changed

### Blog Narrative Arc (suggested)

- **Part 1:** "I streamed video for $0/month" — self-hosted, validated architecture
- **Part 2:** "From self-hosted to CDN — what changes and what breaks" — Bunny Stream integration, token auth deep dive, managed vs self-hosted tradeoffs
- **The punchline:** swapping the delivery layer required changing 15 files but zero changes to auth, sessions, or UI. The architecture held.
