# Offline & GitHub Pages Readiness Audit

Date: 2026-07-25 | Repo: `tiennm99dev/nntv` | Branch `main` @ `eb800f1` (clean)
Build verified: `pnpm build` exit 0, vite 6.4.3. Tests: `pnpm test` 180/180 pass, 9 files, 38.2s.
`dist` is gitignored (`.gitignore:14`).

---

## VERDICT

| Question | Answer | Evidence |
|---|---|---|
| Zero cross-origin runtime deps? | **YES** | Grep of all `src/` + `index.html` for `fetch(`/`XMLHttpRequest`/`http(s)://`/`@import url(`/CDN hosts/analytics returned **zero** runtime hits. Fonts are system-stack only (`src/styles/theme.css:39-45,57` → `Arial, sans-serif`). No web font, no CDN, no telemetry. |
| Plays fully offline (network hard-off, after first visit)? | **NO** | No service worker, no PWA manifest anywhere in repo. Cold navigation to `index.html` with no network fails at the HTTP layer. Browser HTTP cache is best-effort and evictable; 9.25 MiB payload is prime eviction bait. |
| Deploys correctly to Pages subpath `https://tiennm99.github.io/nntv/`? | **YES** | `dist/index.html` emits `./assets/index-B7WTOKRu.js`, `./assets/index-BUv627AV.css`, `./favicon.png` — all relative. Runtime asset strings are document-relative (`assets/…`, no leading `/`). `base: './'` (`vite.config.js:8`) also auto-rewrote the source's absolute `/favicon.png` (`index.html:5`) to `./favicon.png` in the build output. |

**Net:** requirement #2 (Pages) is met today. Requirement #1 ("plays fully offline") is met only in the weak sense of "no third-party network calls". True offline play needs a service worker.

---

## Cross-origin runtime references

**None.** Full sweep of `src/**` and `index.html`:

| Pattern | Hits in src/ | Nature |
|---|---|---|
| `fetch(` | 0 | — |
| `XMLHttpRequest` | 0 | — |
| `http://` / `https://` | 0 runtime (2 in comments/docs only) | — |
| `@import url(` | 0 | — |
| `googleapis` / `cdn.` / `unpkg` / `jsdelivr` | 0 | — |
| `gtag` / `analytics` | 0 | — |
| dynamic `import(` | 0 | single-chunk build confirms it |
| `new Audio(` | 1 — `src/lib/bgm.js:72` | **same-origin**, URL from `BGM_TRACKS` (`bgm.js:52-56`), all `assets/audio/*.mp3` |
| `<img src=` | 13 | all same-origin: `src/scenes/MainMenu.svelte:19,35`, `Guide.svelte:9`, `Settings.svelte:45`, `StoryIntro.svelte:24`, `LevelIntro.svelte:20`, `Game.svelte:536`, `GameBoard.svelte:81,93,104,111,118` — resolved via `src/lib/generated-assets.js:1` (`BASE = 'assets/generated/'`) |
| `<link rel="icon">` | `index.html:5` | same-origin, absolute `/favicon.png` in source — **rewritten to `./favicon.png` by Vite**, so not a Pages break |

Sole nuance: `src/lib/bgm.js:75` sets `a.crossOrigin = 'anonymous'`. Inert for same-origin over HTTP(S), so harmless on Pages. It *does* break the `file://` use case that `vite.config.js:6-7` claims to support (opaque `null` origin fails the CORS check), and it forces `mode: 'cors'` fetches that a naive service worker must handle. See P2-1.

---

## Dead / unreferenced assets shipped to every visitor

Method: every filename under `public/assets/` grepped across the whole repo excluding `node_modules`/`dist`. "Dead" = referenced by nothing but `public/assets/MEDIA.json` (a documentation manifest that is itself never loaded).

| Path | Files | Bytes | Notes |
|---|---:|---:|---|
| `public/assets/voice/*.mp3` | 26 | 3,799,214 | **Recorded but never wired.** Zero `voice` references in `src/`. Commit `c2c8ad0` "add VI voices" landed the files without playback code. Largest: `en-story.mp3` 749,997 B. |
| `public/assets/images/keyart-*.png` | 6 | 1,625,552 | Zero refs in `src/`. `MEDIA.json:8` claims `keyart-garden.png` is the "Main menu background" — but `MainMenu.svelte:19` actually loads the 1,234 B `assets/scene-menu.png` placeholder. Largest: `keyart-palace.png` 504,014 B. |
| `public/assets/src/*.jsx` | 5 | 72,839 | Authoring-time React sources (`canvas.jsx`, `characters.jsx`, `pixel.jsx`, `scenes.jsx`, `tiles-ui.jsx`). Not build inputs. |
| `public/assets/design-canvas.jsx` | 1 | 10,646 | Authoring artifact. |
| `public/assets/MEDIA.json` | 1 | 8,429 | Docs manifest, never fetched. |
| `public/assets/poster.png` | 1 | 5,538 | Zero refs. |
| `public/assets/MANIFEST.json` | 1 | 3,023 | Written by `tools/render-assets.mjs:477`; never fetched at runtime. |
| `public/assets/Night Ninja Assets.html` | 1 | 1,245 | Stray asset-index page. |
| `public/assets/logo-nntv-wordmark.png` | 1 | 669 | Zero refs. |
| `public/assets/logo.png` | 1 | 335 | Zero refs. |
| `public/assets/logo-nntv-compact.png` | 1 | 335 | Zero refs. |
| `public/assets/favicon-32.png` | 1 | 300 | Zero refs (`index.html` uses root `favicon.png`). |
| `public/assets/favicon-16.png` | 1 | 300 | Zero refs. |
| **TOTAL RECLAIMABLE** | **47** | **5,528,425** | **5.27 MiB (5.53 MB) — 57.0% of dist** |

**Live/referenced** (keep): all 32 `assets/generated/*.png` (1,161,196 B — every one is named in `generated-assets.js:4-56`), all 5 `assets/audio/bgm-*.mp3` (2,833,743 B — `bgm.js:52-56`), 4 placeholder scene PNGs (4,324 B), `favicon.png` (300 B).

---

## dist/ size breakdown (real build)

Total **9,695,992 B = 9.25 MiB** across 92 files.

| Path | Bytes | MiB | % | Status |
|---|---:|---:|---:|---|
| `assets/voice/` (26) | 3,799,214 | 3.62 | 39.2% | DEAD |
| `assets/audio/` (5) | 2,833,743 | 2.70 | 29.2% | live |
| `assets/images/` (6) | 1,625,552 | 1.55 | 16.8% | DEAD |
| `assets/generated/` (32) | 1,161,196 | 1.11 | 12.0% | live |
| `assets/index-B7WTOKRu.js` | 139,283 | 0.13 | 1.4% | live (gzip 46.2 kB) |
| `assets/src/` (5 .jsx) | 72,839 | 0.07 | 0.8% | DEAD |
| `assets/index-BUv627AV.css` | 28,254 | 0.03 | 0.3% | live (gzip 5.55 kB) |
| misc dead (design-canvas, MEDIA, MANIFEST, poster, logos, favicons, stray html) | 30,520 | 0.03 | 0.3% | DEAD |
| 4 scene placeholder PNGs + favicon + index.html | 5,091 | 0.005 | 0.05% | live |

Post-cleanup projection: **4,167,567 B = 3.97 MiB** (−57.0%).
Code payload is genuinely small — 167.5 kB raw / ~52 kB gzip. All weight is media.

---

## First-load UX (cold cache)

- **No loading state anywhere.** No spinner, no progress bar, no skeleton. `src/main.js:5` mounts `App` immediately; `App.svelte:73-93` renders the active scene with no gate.
- **Interaction is not blocked** — good. JS+CSS is 167.5 kB; the game is playable the instant the bundle parses. Art and BGM stream in behind it.
- **But art pops in visibly.** Zero `<img>` in the codebase carries `loading=`, `decoding=`, `fetchpriority=`, or an `onload` handler (checked `MainMenu`, `LevelIntro`, `Game`, `GameBoard`). On a cold cache the board renders as empty boxes that fill in tile-by-tile as ~1.1 MiB of PNGs land.
- **BGM start is silent-then-sudden.** `App.svelte:49-52` fires `playBgm` on mount; `bgm.js:143-152` awaits `next.play()`. First track is 355,970–909,065 B. Autoplay-block fallback is correctly handled (`bgm.js:165-179`, retries on first `pointerdown`/`keydown`).
- **The 5.27 MiB of dead assets are NOT fetched on load** — nothing references them, so they cost deploy/artifact size and Pages bandwidth, not first-paint latency. Real cold-load transfer is ~4 MiB, of which ~1.3 MiB (JS+CSS+tiles) gates a good-looking first screen.

---

## localStorage / private mode

**Safe.** Every access is guarded.

| Site | Guard |
|---|---|
| `src/lib/progress.js:19-46` | `try/catch` around read + parse; falls back to `DEFAULT_PROGRESS` |
| `src/lib/progress.js:27-31` | nested `try/catch` on migration write |
| `src/lib/progress.js:57-61` | `try/catch`, returns `true` (suppresses modal) on throw |
| `src/lib/progress.js:64-70` | `try/catch`, swallows |
| `src/lib/progress.js:99-103` | `try/catch`, swallows |
| `src/lib/bgm.js:19-34` | `try/catch` → `DEFAULT` settings |
| `src/lib/bgm.js:37-43` | `try/catch`, swallows |
| `src/lib/audio.js:11` | `try/catch` around the `isSfxMuted()` boot read |
| `src/lib/localization.js:35,50` | `typeof localStorage !== 'undefined'` checks |

No unguarded access. Safari private mode / storage-disabled degrades to in-memory defaults; the game stays playable, progress just doesn't persist. Correct behavior, no crash.

Caveat, not a bug: `localization.js:35,50` uses a `typeof` check, which does **not** catch the `SecurityError` that some browsers throw on *access* when cookies/storage are blocked by policy (the object exists but throwing). `progress.js`/`bgm.js` use `try/catch` and are immune. Minor inconsistency — see P2-3.

---

## Deploy workflow review (`.github/workflows/deploy.yml`)

| Item | Finding | Severity |
|---|---|---|
| `pnpm/action-setup@v4` with no `version:` (`:25`) | **Not a defect.** v4 falls back to `packageManager` in `package.json`, which is pinned to `pnpm@11.1.1` (`package.json:6`). Resolution is deterministic. Adding an explicit `version:` would in fact *conflict* with the field. Leave as-is. | none |
| Cache key (`:31`) | **Correct.** `cache: 'pnpm'` on `setup-node@v4`, and `pnpm/action-setup` runs *before* it (`:25` vs `:27`) — required ordering is satisfied. Keys off `pnpm-lock.yaml`. | none |
| **No test gate before deploy** | `build` job goes Checkout → pnpm → Node → install → build → upload. `pnpm test` is never run. A regression that compiles ships straight to production. Suite is 180 tests / 38s — cheap to gate on. | **P1** |
| `actions/configure-pages@v4` (`:40`) | v5 is available; v4 still functional. Also: this step is largely inert here — its main job is emitting a `base_path` output for frameworks that consume it, and this build hardcodes `base: './'`. Low-value bump. | P2 |
| Node `'24'` (`:30`) vs README "Node.js 18+" (`README.md:31`) | Real mismatch: CI validates only on 24, docs promise 18. Vite 6 requires Node ^18.0.0 \|\| ^20.0.0 \|\| >=22.0.0, so 18 is plausible but **unverified**. Either raise the README floor to 20/22 or add an 18 matrix leg. | P2 |
| `actions/checkout@v4`, `upload-pages-artifact@v3`, `deploy-pages@v4` | Current/valid. Permissions block (`:8-11`) and `concurrency` (`:14-16`) are correct for Pages. | none |
| Build warning ignored | `src/scenes/Game.svelte:38` emits `state_referenced_locally` on every build. Not fatal; noise that hides future real warnings. | P2 |

---

## Prioritized fixes

### P0 — breaks a stated hard requirement

**P0-1 — Ship a service worker; the game cannot currently play with the network off.**
Files: new `public/sw.js` (or add `vite-plugin-pwa`), `index.html`, new `public/manifest.webmanifest`.
This is the *only* item standing between the current state and the owner's "MUST play fully offline". Detail in the next section.

*(No P0 exists for the Pages requirement — that one already works.)*

### P1 — materially hurts

**P1-1 — Delete 5.27 MiB of dead assets.**
Delete: `public/assets/voice/` (26 files), `public/assets/images/` (6), `public/assets/src/` (5), `public/assets/design-canvas.jsx`, `poster.png`, `logo.png`, `logo-nntv-compact.png`, `logo-nntv-wordmark.png`, `favicon-16.png`, `favicon-32.png`, `Night Ninja Assets.html`, `MANIFEST.json`, `MEDIA.json`.
Cuts dist 9.25 → 3.97 MiB. **Decide first:** the voice lines are finished content that was simply never wired (see P1-2). If they're going to be used, keep `voice/` and delete the other 1.73 MiB. Move authoring sources (`assets/src/`, `design-canvas.jsx`) and docs (`MEDIA.json`, `MANIFEST.json`) out of `public/` into `tools/` — they are not deploy artifacts. Halving the payload also makes the service worker precache tractable.

**P1-2 — Decide the fate of `public/assets/voice/` (3.62 MiB, 26 files).**
Either wire it (`StoryIntro.svelte`, `LevelIntro.svelte`, `GameOver.svelte`, `DetectionPopup.svelte`, `LevelCompletePopup.svelte`, selecting `en-`/`vi-` off `localization.js`) or delete it. Shipping 3.62 MiB of unplayable audio to every visitor is the single largest waste in the repo.

**P1-3 — Add a test gate to the deploy workflow.**
`.github/workflows/deploy.yml`, insert between `:34` and `:36`:
```yaml
      - name: Test
        run: pnpm test
```
180 tests, 38s, currently green.

### P2 — polish

**P2-1 — Drop `a.crossOrigin = 'anonymous'` (`src/lib/bgm.js:75`).** No same-origin benefit; breaks the `file://` scenario `vite.config.js:6-7` advertises; forces CORS-mode fetches a service worker must special-case.

**P2-2 — Make `index.html:5` relative: `href="./favicon.png"`.** Vite already fixes this at build, but the source is misleading and would bite anyone bypassing the Vite pipeline.

**P2-3 — Convert `src/lib/localization.js:35,50` from `typeof localStorage !== 'undefined'` to `try/catch`,** matching `progress.js`/`bgm.js`. Closes the policy-blocked-storage `SecurityError` path.

**P2-4 — Add `decoding="async"` to the board tile `<img>`s** (`src/components/GameBoard.svelte:81,93,104,111,118`) and consider `fetchpriority="high"` on the level backdrop (`Game.svelte:536`). Reduces cold-cache tile pop-in.

**P2-5 — Reconcile Node versions.** Either `README.md:31` → "Node.js 20+" (matching what CI actually proves), or add an 18.x matrix leg to `deploy.yml`.

**P2-6 — Fix `README.md:7,41`.** Both claim `http://localhost:5173`; `vite.config.js:10` sets `port: 8080`.

**P2-7 — Silence the `state_referenced_locally` warning** at `src/scenes/Game.svelte:38`. The `// svelte-ignore` comment is on the wrong line — it must be on its own line *above* the statement, not trailing it.

**P2-8 — Bump `actions/configure-pages@v4` → `@v5`** (`deploy.yml:40`). Low value; the step is near-inert given the hardcoded `base`.

---

## Service worker / PWA recommendation

**YES — required, not optional.** It is the only remaining gap against "MUST play fully offline".

Why it's a good fit here:
- GitHub Pages is HTTPS → service workers are permitted. No blocker.
- The game is **100% client-side**: zero network calls after load (verified above), no API, no auth, no server state. Progress lives in `localStorage`. This is the ideal SW target — precache everything and the app is genuinely, indefinitely offline.
- Asset set is **static and finite**. After P1-1 it's ~4 MiB across ~45 files, all enumerable at build time.
- Content-hashed JS/CSS filenames (`index-B7WTOKRu.js`) make cache invalidation trivial.

Recommended shape — **`vite-plugin-pwa`** over a hand-rolled `sw.js`. It auto-generates the precache manifest from the real build output, so the file list can't drift as assets change (exactly the drift that produced the dead-asset problem). Hand-rolling means maintaining a literal file list by hand.

Sketch:

1. `pnpm add -D vite-plugin-pwa`
2. `vite.config.js` — add the plugin:
   ```js
   VitePWA({
     registerType: 'autoUpdate',
     includeAssets: ['favicon.png'],
     workbox: {
       // BGM files exceed the 2 MiB default cap
       maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
       globPatterns: ['**/*.{js,css,html,png,mp3}'],
     },
     manifest: {
       name: 'Night Ninja: Twilight Voyage',
       short_name: 'Night Ninja',
       start_url: './',        // MUST be relative for the /nntv/ subpath
       scope: './',            // ditto
       display: 'fullscreen',
       background_color: '#0a0a1a',   // matches theme.css:3 --bg-dark
       theme_color: '#0a0a1a',
       icons: [ /* reuse assets/generated PNGs, or re-add favicon-192/512 */ ],
     },
   })
   ```
3. Registration scope: `base: './'` means the SW registers at `/nntv/sw.js` with scope `/nntv/` — correct and automatic. **Do not** hardcode a leading-slash scope; it would break the subpath.
4. **Do P1-1 first.** Precaching today would push 9.25 MiB into the cache, half of it files no code loads.
5. Split strategy if BGM stays large: precache JS/CSS/HTML/`assets/generated/*` (~1.3 MiB) for instant offline boot; `CacheFirst` runtime-cache `assets/audio/*.mp3` so music becomes offline after first play rather than blocking install.
6. Apply P2-1 first — `crossOrigin='anonymous'` makes BGM requests CORS-mode, which Workbox handles but which needlessly complicates cache matching.
7. Verify: `pnpm build && pnpm preview`, load once, then DevTools → Network → Offline, hard-reload, play through a level and confirm BGM + tiles + progress all work.

Scope of work: **~1–2 hours** including the P1-1 cleanup and offline verification. One new dev dependency, ~25 lines in `vite.config.js`, icon assets. No source-code changes to game logic.

---

## Unresolved questions

1. **Is `public/assets/voice/` (3.62 MiB, 26 finished lines) intended to ship?** Determines whether P1-1 reclaims 5.27 MiB or 1.73 MiB, and whether P1-2 is "wire it" or "delete it". Commit `c2c8ad0` added them but no playback code — deliberate staging or dropped work?
2. **Are the `keyart-*.png` files (1.55 MiB) meant to replace the ~1 kB `scene-*.png` placeholders?** `MEDIA.json:8` asserts `keyart-garden.png` is the main-menu background, but `MainMenu.svelte:19` loads the placeholder. This looks like unfinished integration, not dead weight — deleting them may destroy intended art.
3. **Is `file://` (double-click `dist/index.html`) a supported distribution mode?** `vite.config.js:6-7` says yes. If so, P2-1 is mandatory, not polish, and a service worker cannot help there (SWs don't run on `file://`).
4. **Minimum supported Node?** Needed to resolve the README-18 vs CI-24 split. No `engines` field in `package.json` and no `.nvmrc`.
5. **Should PWA install (add-to-homescreen) be a goal, or just offline caching?** Affects whether proper 192/512 maskable icons are needed — none currently exist at those sizes.
