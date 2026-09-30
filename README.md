# Night Ninja: Twilight Voyage

Turn-based stealth puzzle game built with Svelte 5. Play as a ninja rabbit navigating
grid-based levels inside the Vegetable Kingdom, avoiding detection by vegetable guards
to rescue the missing carrot princess.

Play: `npm run dev` → `http://localhost:5173`

---

## Features

- **12 levels across 6 acts** — grids grow from 8×8 to 13×13; difficulty escalates per act
- **8 guard types** — Static (wilting aura), Rotating (beam), Blinking (toggle), Patrolling,
  Mirror (beam redirect), Chaser (BFS hunt), Sniper (fixed line of sight), Suspicion (tier alert)
- **Throwable stones** — on-screen button or **E** key to enter targeting; distract guards for one turn
- **Doors and keys** — color-coded key items unlock matching doors; collect in correct order
- **One-way tiles** — arrow tiles enforce entry direction; plan full route before committing
- **Decay tiles** — cells stay lethal for one turn after going dark; treatment for timed hazards
- **Undo/redo** — press **Z** / **Y** (when level allows); full state snapshots including doors/keys/warm-state
- **Turn preview** — press **V** to preview next-turn lighting (when level allows)
- **Progressive hints** — after 3 failed attempts, unlock helpful hints (mechanic → strategy → concrete next move)
- **Mercy skip** — after 8 failed attempts, unlock next level as a mercy (level marked skipped, no stars)
- **Responsive design** — plays on desktop, tablet, and mobile (360px+); auto-scales board to viewport
- **Offline play** — service worker caches the full game; works offline after first visit
- **Procedural audio** — Web Audio API; move, detect, throw, key pickup, door unlock, suspicion
- **Pixel-art rendering** — all sprites drawn as string-art palettes → SVG rects (no raster images)
- **BFS solvability CI** — levels L1–L11 verified beatable in CI; L12 intentionally unsolvable easter egg
- **Bilingual** — English and Vietnamese (VI) locale support; auto-detects default language

---

## Requirements

[Node.js](https://nodejs.org) 24+ and npm (CI pinned to Node 24; tested and verified working).

---

## Quick Start

```sh
git clone https://github.com/tiennm99dev/nntv
cd nntv
npm install
npm run dev        # dev server at http://localhost:5173
npm run build      # production build → dist/
```

Then deploy `dist/` to GitHub Pages or any static host.

---

## Assets

- **`public/assets/generated/`** — Built pixel-art sprites (SVG-rects-as-data; output of tools/render-assets.mjs)
- **`public/assets/images/`** — Key-art PNGs for menu backgrounds (shipped in build)
- **`unshipped-assets/`** — Finished but deliberately unused assets, tracked in repo but not shipped:
  - **voice/** — 26 MP3 files (VI + EN voice lines for acts, story, detection, game-over) · 3.8 MB · *not wired to playback; saved for future audio feature*
  - **src/** — JSX source files for art generation (pixel definitions, designs)
  - **MEDIA.json, MANIFEST.json, poster.png** — Asset authoring metadata
- **`tools/`** — Scripts to regenerate `public/assets/` from source (render-assets.mjs, make-poster.mjs)

---

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build locally |
| `npm test` | Run all unit + solvability tests |
| `npm run test:solvability` | Run only the BFS solvability suite |

---

## Controls

| Input | Action |
|---|---|
| Arrow keys / WASD | Move one cell |
| Click/tap adjacent cell | Move |
| Space | Wait one turn |
| V | Toggle next-turn preview (if allowed) |
| Z / Y | Undo / redo (if allowed) |
| E | Enter stone-throw targeting mode |
| Stone icon (HUD) / E | Enter throw mode (on-screen button or keyboard) |
| Arrow keys (in throw mode) | Move targeting cursor |
| Enter / click (in throw mode) | Confirm throw |
| Esc | Cancel throw or pause |
| R | Quick restart level |
| ? | Open game guide / controls overlay |

---

## Architecture

Pure JavaScript game engine with a Svelte 5 rendering layer. Full offline support via service worker.

```
src/
├── lib/game/               # Pure JS engine (turn-based state machine)
│   ├── grid-system.js      # Cell state: walls, goals, lighting, doors, warm tiles
│   ├── player.js           # Position, movement validation, key inventory (bitmask)
│   ├── guards.js           # 8 guard type implementations + mechanics
│   ├── throwable.js        # Stone inventory, throw validation (Manhattan ≤3, LoS)
│   ├── turn-manager.js     # Turn cycle: move → guard actions → lighting → detection
│   ├── game-history.js     # Undo/redo via deep state snapshots
│   ├── level-solver.js     # BFS solvability checker (CI + hints)
│   ├── line-of-sight.js    # Shared LoS logic for throws and snipers (DRY)
│   └── level-manager.js    # Level loading, guard instantiation
├── lib/levels/
│   ├── levels.js           # 12 level definitions (grids, guards, goals, affords)
│   └── levels.solvability.test.js  # BFS guard-tax and mechanic-necessity CI gates
├── lib/
│   ├── progress.js         # Persistent progress: maxLevel, attempts, skipped, hints
│   ├── level-hints.js      # 3-tier hints per level (mechanic → strategy → moves)
│   ├── level-teaches.js    # Mechanic-intro strings (new-this-level strip)
│   ├── focus-trap.js       # Modal focus management + Tab-cycling action
│   ├── localization.js     # i18n: getText with fallback
│   ├── locales/*.json      # 167 keys each (en, vi)
│   └── bgm.js              # Web Audio procedural music + sound effects
├── lib/pixel/              # Pixel-art: palette, SVG rendering, art data
├── components/             # Svelte components
│   ├── GameBoard.svelte    # Grid rendering, cell lighting, player/guard sprites
│   ├── GameHud.svelte      # Turns, stones, keys, undo, preview, hint, throw buttons
│   ├── HintPanel.svelte    # Modal: hint tiers + locked placeholders
│   ├── ThrowTargetingOverlay.svelte  # Targeting UI + confirm/cancel buttons
│   ├── SuspicionRing.svelte # Ring + range boundary visualization
│   ├── DetectionPopup.svelte # Death/restart + mercy skip button
│   ├── PauseMenu.svelte, LevelCompletePopup.svelte, ControlsOverlay.svelte
│   ├── Button.svelte       # Reusable button (44px min-height for mobile)
│   └── ...                 # Sprites, tiles, UI components
├── scenes/                 # Full-screen views
│   ├── Game.svelte         # Main gameplay (board + HUD + overlays)
│   ├── LevelIntro.svelte   # Story text + teaches strip + Continue
│   ├── MainMenu.svelte     # Start / LevelSelect / Settings / Guide
│   ├── LevelSelect.svelte  # 4×3 grid, locked/completed/skipped badges
│   └── ...
├── App.svelte              # Router, migration modal, live-region announcements
├── main.js                 # Bootstrap (unused: SW + manifest auto-injected by vite-plugin-pwa)
└── styles/theme.css        # Design-box scale transform, colors, fonts, reduced-motion block
```

**State machine:** each player action → `TurnManager.nextTurn()` → simultaneous guard updates → lighting recompute → detection check → `GameHistory` snapshot. `LevelSolver` (BFS replay) runs in CI to assert guard necessity and guard tax. **Preview mode** simulates all candidate player actions (move + wait) in parallel, painting the union of resulting threats.

**Offline:** `vite-plugin-pwa` generates service worker + manifest.webmanifest. Scope `'./'` supports GitHub Pages subpath deployment. Precaches 56 entries (all JS, CSS, HTML, SVG, PNGs, manifest). On first visit, service worker installs and caches all assets; subsequent visits play fully offline.

---

## Project Structure

| Path | Description |
|---|---|
| `index.html` | HTML entry point |
| `src/main.js` | Application bootstrap |
| `src/App.svelte` | Scene router + migration modal |
| `src/styles/theme.css` | CSS variables: colors, fonts, guard palette |
| `svelte.config.js` | Svelte 5 + Vite config |
| `vite.config.js` | Vite build config |

---

## License

Apache 2.0
