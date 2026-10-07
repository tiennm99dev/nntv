# Phase 5 — Offline + Deploy + Assets

Repo `tiennm99dev/nntv`, branch `main`. Changes left uncommitted in working tree
per instruction. Other phases (1/4) were editing `src/lib/game/**`, `src/lib/levels/**`, `src/components/**`
concurrently during this work — none of those files were touched here.

## 1. Asset payload — moved, not deleted

Verified every candidate with `grep` across `src/**` and `index.html` before moving (zero hits for each).
`assets/generated/*`, `assets/audio/bgm-*`, `assets/images/keyart-*`, `scene-*.png`, `favicon.png` were left
in `public/` (referenced or explicitly reserved for the UX agent's key-art wiring).

New tracked, non-shipped dir: `unshipped-assets/` (repo root), mirroring the relative path each file had
under `public/assets/`. 41 files moved via `git mv` (rename, so it stays in git history, not a delete+add):

| Old path | New path | Bytes |
|---|---|---:|
| `public/assets/voice/*.mp3` (26 files: `en-*` and `vi-*` act/story/detected/gameover/levelclear/princess-help/princess-run/welcome) | `unshipped-assets/voice/*.mp3` | 3,799,214 |
| `public/assets/src/canvas.jsx` | `unshipped-assets/src/canvas.jsx` | — |
| `public/assets/src/characters.jsx` | `unshipped-assets/src/characters.jsx` | — |
| `public/assets/src/pixel.jsx` | `unshipped-assets/src/pixel.jsx` | — |
| `public/assets/src/scenes.jsx` | `unshipped-assets/src/scenes.jsx` | — |
| `public/assets/src/tiles-ui.jsx` | `unshipped-assets/src/tiles-ui.jsx` | 72,839 (5 files) |
| `public/assets/design-canvas.jsx` | `unshipped-assets/design-canvas.jsx` | 10,646 |
| `public/assets/MEDIA.json` | `unshipped-assets/MEDIA.json` | 8,429 |
| `public/assets/MANIFEST.json` | `unshipped-assets/MANIFEST.json` | 3,023 |
| `public/assets/poster.png` | `unshipped-assets/poster.png` | 5,538 |
| `public/assets/Night Ninja Assets.html` | `unshipped-assets/Night Ninja Assets.html` | 1,245 |
| `public/assets/logo.png` | `unshipped-assets/logo.png` | 335 |
| `public/assets/logo-nntv-compact.png` | `unshipped-assets/logo-nntv-compact.png` | 335 |
| `public/assets/logo-nntv-wordmark.png` | `unshipped-assets/logo-nntv-wordmark.png` | 669 |
| `public/assets/favicon-16.png` | `unshipped-assets/favicon-16.png` | 300 |
| `public/assets/favicon-32.png` | `unshipped-assets/favicon-32.png` | 300 |

Total relocated: 3,902,873 B (3.72 MiB), confirmed via `du -sb unshipped-assets`. Emptied `public/assets/voice/`
and `public/assets/src/` directories removed with `rmdir` (git doesn't track empty dirs, but left them would
be filesystem cruft).

**Left in `public/` untouched, per instruction:** `public/assets/images/keyart-*.png` (6 files, 1,625,552 B) —
the UX agent is wiring these into `MainMenu.svelte` this session. Grepped `MainMenu.svelte` myself before
starting: it currently loads the `assets/scene-menu.png` placeholder, confirming the keyart wiring is not
yet landed but is genuinely in flight (not abandoned work).

`tools/render-assets.mjs` and `tools/make-poster.mjs` write into `public/assets/{MANIFEST.json,poster.png,src/*}`
when re-run by hand. I did not touch `tools/` (not owned) — if someone reruns those scripts, output lands
back in `public/` and would need re-relocating. Noted, not fixed (out of scope, `tools/` isn't mine).

## 2. Service worker + PWA manifest

Added `vite-plugin-pwa` as a **devDependency** (`pnpm add -D vite-plugin-pwa`, resolved `1.3.0`). No runtime
dependency added — `svelte`/`vite`/`vitest` dependency shape otherwise unchanged.

`vite.config.js` — `VitePWA({...})` plugin added alongside `svelte()`:
- `registerType: 'autoUpdate'` — new builds activate (`skipWaiting()` + `clientsClaim()`) without prompting
  the user or trapping them on the old cached build; confirmed present in the generated `dist/sw.js`.
- `manifest.start_url: './'`, `manifest.scope: './'` — exact values required for the `/nntv/` Pages subpath.
  Confirmed in built `dist/manifest.webmanifest`: `"start_url":"./","scope":"./"`.
- `workbox.globPatterns: ['**/*.{js,css,html,png,mp3,ico,webmanifest}']` — default only covers js/css/html;
  this app's weight is media, so png/mp3 had to be added explicitly or the precache would boot but the game
  would still need network for every sprite/track.
- Icons: `favicon.png` (32×32) and the already-shipped `assets/generated/player-rabbit.png` (128×128, `purpose: any`).
  No new binary assets created — proper 192/512 maskable icons don't exist in the repo and generating them
  is outside this phase's remit (art, not deploy config). Functionally fine for offline caching; only affects
  "Add to Home Screen" icon quality, which was never a stated requirement (offline play + Pages hosting are).
- Did **not** need to touch `src/main.js` (not owned) — `vite-plugin-pwa`'s default `injectRegister: 'auto'`
  auto-injects the registration `<script>` and `<link rel="manifest">` into the built HTML; confirmed present
  in `dist/index.html` without editing the source `index.html` at all.

Registration mechanics confirmed from build output (`dist/registerSW.js`):
```js
if('serviceWorker' in navigator) {window.addEventListener('load', () => {navigator.serviceWorker.register('./sw.js', { scope: './' })})}
```
Relative script path, relative scope — exactly what a Pages subpath deploy needs.

## 3. BGM fixes (`src/lib/bgm.js`)

- **Ordering bug (was `:124`):** `activeTrack = url` moved from *before* `await next.play()` to *after* it
  succeeds. Previously, on autoplay-block, `activeTrack` was already set to the blocked track's URL, so the
  gesture-triggered retry (`installUserGestureRetry` → `playBgm(pendingPlay)`) hit the `if (url === activeTrack) return;`
  guard and silently no-op'd — menu music never started on any autoplay-blocking browser. Now `activeTrack`
  only updates on confirmed playback; the blocked path leaves it as whatever it was, so the retry actually
  calls `play()` again. Added the `activeTrack = null` assignment explicitly to the stop/fade-out branch to
  keep that path's semantics unchanged.
- **`crossOrigin = 'anonymous'` (was `:75`) removed** from `makeAudio()`. Inert for same-origin HTTP(S); was
  actively breaking the `file://` mode `vite.config.js` comments claim to support (opaque origin fails CORS)
  and forcing Workbox to handle BGM fetches in CORS mode for no benefit.

No dedicated `bgm.js` test file exists in the repo to gate against regression on this logic (checked — none
found). Did not add one: out of scope for this phase's file ownership (adding `src/lib/bgm.test.js` would be
a new file under `src/lib/`, and the instructions restrict me to the files listed, `bgm.js` itself only).
Flagging as a gap, not silently skipping it.

## 4. CI test gate (`.github/workflows/deploy.yml`)

Inserted between `Install dependencies` and `Build`:
```yaml
      - name: Test
        run: pnpm test
```
Left `pnpm/action-setup@v4` (no explicit version, resolves from `packageManager: "pnpm@11.1.1"`), the
pnpm-before-node ordering, and the cache key untouched, exactly as instructed — audit already verified these
correct and pinning/reordering would conflict or regress.

**Node version:** left CI at `node-version: '24'`, unchanged. README says "Node.js 18+"
(`README.md:31`, not mine to edit — owned by the Phase 6 docs agent). My file ownership for `package.json`
is scoped to `devDependencies` + `scripts` only, so I can't add an `engines` field either, and creating a
new untracked `.nvmrc` isn't in my file-ownership list. Given I have no way to actually fix the README side
of this mismatch, and no local way to verify Node 18 actually works with this Vite 6 + pinned-esbuild setup
(only Node 24.14.0 is installed on this machine), I chose not to gamble the CI's only proven-working Node
version on an untested downgrade. **Decision: keep CI's Node 24 as the source of truth; flag for Phase 6 to
update `README.md:31` to "Node.js 22+" (or whatever floor they choose to actually test) instead of the
current unverified "18+".** This is the one acceptance item I could not fully close myself — see Unresolved.

## 5. Verification

### Build
```
pnpm build
```
Exit 0. Vite 6.4.3 + `vite-plugin-svelte`. Warning `state_referenced_locally` at `Game.svelte:38` is
pre-existing (owned by another phase, not touched).

PWA plugin output: `PWA v1.3.0`, `mode generateSW`, `precache 56 entries (5665.40 KiB)`, generates
`dist/sw.js` + `dist/workbox-9c191d2f.js` alongside the usual `registerSW.js` + `manifest.webmanifest`.

### dist/ size, before vs after

| | Bytes | MiB | Files |
|---|---:|---:|---:|
| Before (audit baseline, `eb800f1`) | 9,695,992 | 9.25 | 92 |
| After (this phase, clean build) | 5,820,462 | 5.55 | 55 |
| Delta | −3,875,530 | −3.70 | −37 |

Breakdown of the delta: −3,902,873 B from relocating voice/jsx/misc-dead assets (item 1), +19,698 B for the
new PWA runtime files (`sw.js` 3,978 + `workbox-9c191d2f.js` 15,112 + `registerSW.js` 136 + `manifest.webmanifest` 472),
plus small organic drift in the JS/CSS bundle hashes from other phases' concurrent edits to `src/lib/game/**`
and `src/components/**` (their work, not mine — this repo had three agents editing simultaneously).

**This does not hit the plan's "~4 MiB" target.** The gap is `assets/images/keyart-*.png` (1,625,552 B,
16.8% of the original dist) which I was explicitly told to leave in `public/` because another agent is
wiring it into `MainMenu.svelte` this session, at which point it becomes genuinely live/referenced weight,
not dead weight. The original audit's "~4 MiB" projection assumed keyart would *also* be deleted/relocated
(it was still unreferenced at audit time). Both instructions are explicit and I followed the more specific
one (leave keyart in place); flagging the arithmetic conflict rather than silently picking one. If keyart
ships as intended art, 5.55 MiB is the honest floor without cutting real content — see Unresolved.

### Relative URLs
`dist/index.html`:
```html
<link rel="icon" type="image/png" href="./favicon.png" />
<script type="module" crossorigin src="./assets/index-....js"></script>
<link rel="stylesheet" crossorigin href="./assets/index-....css">
<link rel="manifest" href="./manifest.webmanifest">
<script id="vite-plugin-pwa:register-sw" src="./registerSW.js"></script>
```
All relative. Grepped the generated `dist/sw.js` precache manifest for `url:"/..."` (leading-slash) — **0
matches** out of 56 entries. Every precached URL, including `assets/audio/*.mp3` and `assets/images/keyart-*.png`,
is scope-relative.

### Subpath serving
Wrote a tiny Node static server (`serve-subpath.mjs`, scratchpad-only, not part of the repo) that mounts
`dist/` under `/nntv/` on `localhost:4791`, mimicking the Pages URL structure. Ran:
```
curl -s -o /dev/null -w "%{http_code}" http://localhost:4791/nntv/
curl ... /nntv/assets/index-....js   → 200
curl ... /nntv/sw.js                 → 200
curl ... /nntv/workbox-9c191d2f.js    → 200
curl ... /nntv/manifest.webmanifest   → 200
curl ... /nntv/favicon.png            → 200
curl ... /nntv/assets/audio/bgm-menu.mp3     → 200
curl ... /nntv/assets/images/keyart-garden.png → 200
```
All 200. `curl .../nntv/` returned the same relative-URL `index.html` shown above — confirms the build
resolves correctly two path segments deep, not just at domain root (the exact class of bug the audit warned
about: an absolute `/` anywhere would have 404'd here).

### Live offline verification (partial — environment-limited)
Drove headless Chrome (`chrome.exe --headless=new --remote-debugging-port=9333`) via raw CDP (Node's native
`fetch`/`WebSocket`, no puppeteer — avoids adding a devDependency for a one-off check) against the subpath
server:
- First load: confirmed via `navigator.serviceWorker.getRegistrations()` that a registration for
  `http://localhost:4791/nntv/` reaches `active: "activated"`.
- Then killed the HTTP server outright (real `ECONNREFUSED`, not DevTools' "Offline" network-condition
  emulation) and called `location.reload()` in the same tab.
- **Could not get a clean pass/fail from this**: an isolated probe (`caches.open('x')` from the page) threw
  `UnknownError: Failed to execute 'open' on 'CacheStorage': Unexpected internal error` — Cache Storage
  itself is broken in this specific sandboxed headless Chrome instance, independent of anything in this repo's
  SW config. That explains why `caches.keys()` reported empty after the SW reached "activated": the
  environment's storage backend, not the precache logic, is the failure point.
- Given that, I relied on **static/artifact verification** instead (precache manifest contents, relative
  URLs, registration scope, `NavigationRoute` presence — all confirmed above) plus the mechanical fact that
  Workbox's `generateSW` install step cannot reach `activated` without its `precacheController.install()`
  `waitUntil` resolving successfully in a working browser.
- **I did not get a real second-tab, network-off, "the game renders and plays" screenshot-equivalent
  confirmation.** That needs a human (or a properly provisioned browser environment) doing the standard
  DevTools → Application → Service Workers → "Offline" checkbox → reload check, or the equivalent GitHub
  Pages live test after deploy. Flagging this explicitly rather than asserting something I couldn't observe.

### Tests
```
pnpm test
```
Result at time of writing: **2 failing, 214 passing** (`src/lib/levels/levels.solvability.test.js` L2, and
`src/lib/game/level-solver.test.js` L2). Both failures are in files I do not own (`src/lib/game/**`,
`src/lib/levels/**` — Phase 1/2/3 territory) and concern level solvability/guard mechanics, unrelated to
anything in this phase's scope (assets, Vite/PWA config, `bgm.js`, CI workflow). Test count itself grew from
the audit's 180 to 216+ over the course of this session as other phases landed work concurrently — confirms
this is live in-progress breakage from the parallel Phase 1/3 level-retuning effort described in `plan.md`
("expect breakage" during retuning), not something introduced here. Re-ran twice; failure is consistent
(same two tests), not flaky.

## Deliberately not done

- Did not delete anything — relocated only, per owner ruling.
- Did not create 192×192/512×512 maskable PWA icons (no image tooling in my remit; existing assets reused).
- Did not add a `bgm.js` regression test (would require creating a new file outside the single file I own).
- Did not touch `README.md`, `tools/render-assets.mjs`, `tools/make-poster.mjs`, or add an `engines` field —
  all outside this phase's file ownership.
- Did not resolve the keyart-vs-4MiB tension myself (see Unresolved) — followed the more specific instruction.

## Unresolved questions

1. **dist/ is 5.55 MiB, not ~4 MiB.** The gap is entirely the 1.63 MiB of keyart PNGs I was told to leave in
   `public/` for the parallel UX wiring. Once keyart is live-referenced it's not "dead weight" anymore, so
   the original 4 MiB target (which assumed keyart's removal) may need revising — worth a decision from
   whoever owns the acceptance bar, not something I should silently resolve.
2. **Node version split is still open.** CI proven at 24; README claims 18+, unverified, and I have no file
   permission to fix README or add `engines`/`.nvmrc`. Needs Phase 6 (docs) to update `README.md:31`.
3. **Live browser offline confirmation is incomplete.** Cache Storage API failed at the environment level in
   the sandboxed headless Chrome available here. Static verification (precache manifest, relative URLs, SW
   registration/scope, activation reachability) is solid, but nobody has watched the actual game render with
   the network truly off in a working browser yet. Recommend a manual DevTools check or a post-deploy live
   Pages test before calling offline play fully proven.
4. **`unshipped-assets/voice/` (3.62 MiB VI/EN narration) is still unwired.** I relocated it per the owner
   ruling; whether/how it eventually gets wired into `StoryIntro`/`LevelIntro`/`GameOver`/popups is a product
   decision for later, not something I should guess at.
