# Night Ninja: Twilight Voyage - Project Overview & PDR

## Project Overview

**Night Ninja: Twilight Voyage (NNTV)** is a turn-based stealth puzzle browser game where players control a ninja rabbit navigating grid-based levels to rescue the Carrot Princess from the Vegetable Kingdom.

### Core Concept
- Turn-based grid movement with lighting-based detection
- 8 guard AI types with distinct behaviors and escalating complexity
- Progressive difficulty across 12 levels in 6 acts (L12 intentionally unsolvable)
- Throwable stones, doors/keys, one-way tiles, decay/warm tiles
- Progressive hints and mercy skip for stuck players
- Fully playable offline; responsive 360px–desktop scaling
- Bilingual support (English/Vietnamese, vi-by-default on fresh start)
- Narrative twist: Level 12 princess wave is unbeatable by design

### Target Audience
- Casual puzzle game players (10+)
- Fans of stealth mechanics and logic puzzles
- Browser game enthusiasts

### Platform
- Web browser (desktop, responsive)
- Technology: Svelte 5 + Vite 6.x
- Languages: JavaScript (ES modules) + Svelte components

## Product Development Requirements

### Functional Requirements

| Requirement | Description | Status |
|---|---|---|
| Grid-based Movement | Arrow keys, WASD, click/tap adjacent cell, swipe (mobile) — one cell per turn | Complete |
| Guard AI System | 8 types: Static (wilting), Rotating (beam), Blinking (toggle), Patrolling (path), Mirror (reflect), Chaser (BFS hunt), Sniper (fixed LoS), Suspicion (tier alert) | Complete |
| Guard Mechanics | Static regrow on cycle; Suspicion persists/decays by tier; Chaser aggro on detection; Sniper unbounded LoS; Patroller lights front+right | Complete |
| Mirror Reflection | Rotating + Sniper beams bounce off mirrors; up to 3 bounces; beam-before-wall priority | Complete |
| Detection System | Player on lit/warm cell → restart level only (no lives counter; single-level scope) | Complete |
| Throwable Stones | E key or on-screen button; Manhattan ≤3, LoS check; distract rotating/patrolling/chaser guards 1 turn | Complete |
| Doors & Keys | Color-coded, auto-collect, bitmask inventory; door blocks movement until key held | Complete |
| One-Way Tiles | Arrow tiles enforce entry direction; silent rejection if wrong direction | Complete |
| Decay / Warm Tiles | Cell stays lethal 1 turn after going dark; distinct visual (dim glow) | Complete |
| Undo/Redo System | Z/Y keys (when allowed per level); full state snapshots incl. doors/keys/warm/guards | Complete |
| Turn Preview | V key (when allowed); simulates all candidate actions (move+wait), paints union of threats | Complete |
| Level Progression | 12 levels, localStorage progress tracking, hints unlock at 3/5/7 attempts | Complete |
| Progressive Hints | 3 tiers: mechanic hint at 3 attempts, strategy hint at 5, concrete move at 7 | Complete |
| Mercy Skip | Unlock next level after 8 attempts; marks level "skipped" (no stars) | Complete |
| Win Condition | Reach goal cell to advance; L12 intentionally unsolvable (easter egg — spiral out on approach) | Complete |
| Escalating Detection | Level 12: princess senses player at distance ≤4; light wave expands 1 ring/turn (unstoppable) | Complete |
| Audio Feedback | Web Audio API: moves, detections, throws, key pickup, door unlock, suspicion tiers, level complete | Complete |
| Responsive Board | Scale transform (not scroll/crop); fits 360px–4K; on-screen controls for stone throw, confirm/cancel | Complete |
| Offline Play | Service worker + PWA manifest; precaches 56 entries; plays fully offline after 1st visit | Complete |
| Solvability CI Gate | BFS solver asserts guard tax (optimal-with − optimal-without) ≥ floor per level; per-mechanic necessity check for L1-L11; L12 unsolvable pinned | Complete |

### Non-Functional Requirements

| Requirement | Description | Status |
|---|---|---|
| Localization | English and Vietnamese via localStorage persistence | Complete |
| UI/UX Consistency | CSS variables theme (colors, fonts, button styles) | Complete |
| Svelte 5 Reactivity | renderVersion counter pattern for class instance mutations | Complete |
| Performance | Lightweight Svelte 5 rendering, no heavy framework overhead | Complete |
| Browser Support | Modern browsers with ES module support | Complete |

### User Interface Components

- **Main Menu**: Start game, level select, settings, guide
- **Story Intro**: Scrolling narrative with skip option
- **Level Intro**: Level name, story text, continue button
- **Level Select**: Grid of level buttons with lock/complete states
- **Game HUD**: Current level, lives remaining, turn count
- **Game Board**: Grid cells with CSS transitions for smooth lighting changes
- **Controls Overlay**: "?" button reveals all keyboard/touch controls
- **Settings Panel**: Language toggle (EN/VI)
- **Guide**: Game rules, controls, enemy types, chaser/mirror guard descriptions
- **Detection Popup**: Retry prompt with visual feedback (cell flash, player shake)
- **Pause Menu**: Resume, restart, main menu
- **Game Over Screen**: Retry or return to menu
- **Button Component**: Reusable styled button with disabled state support

### Game Mechanics

**Turn Cycle:**
1. Player executes move (arrow keys / WASD / cell click)
2. Player position updates (validated against walls/bounds)
3. Guards execute turn actions (rotate, blink, patrol)
4. Lighting system recalculates lit cells
5. Detection check: if player on lit cell, lose life + restart level
6. Goal check (before guard update): level complete, unlock next

**Guard Behaviors:**
- **Static (red)**: Manhattan aura shrinks by 1 each turn (`initialRadius` → ... → 0 → -1 → regrow); cycles deterministically
- **Rotating (blue)**: Rotates beam 90° clockwise each turn; range 5; bounces off mirrors; stops at walls
- **Blinking (yellow)**: Toggles specific cells on/off each turn; decay makes just-dark cells warm 1 turn
- **Patrolling (purple)**: Moves along predefined path; lights front + right cells relative to direction
- **Mirror (green)**: Stationary; reflects rotating/sniper beams 90° (clockwise or counterclockwise)
- **Sniper (dark red)**: Fixed cardinal aim (up/down/left/right); unbounded range; rotates every 2 turns; instant detection if player in beam
- **Suspicion (violet)**: 3-tier alert (0=calm, 1=alerted, 2=firing); tier rises when player in range; decays 1 step/turn out of range; tier-2 lights full Manhattan `range` diamond
- **Chaser (orange)**: BFS pathfinding toward player when within `detectionRadius`; returns home if player escapes radius; lights all cells within radius when active
- **Level 12 Special**: Princess wave at player distance ≤ 4; light expands 1 ring per turn outward from goal (unstoppable)

**Player Abilities:**
- **Movement**: Arrow keys, WASD, adjacent cell click, swipe (mobile); wait (Space)
- **Stone Throw**: E key or on-screen button → targeting mode; confirm/cancel buttons for mobile
- **Key Collection**: Auto-collects keys on cell contact; bitmask inventory (up to 3 keys)
- **Undo/Redo**: Z/Y keys (when level allows); full state snapshots incl. warm-state
- **Preview**: V key (when level allows); shows next-turn threats if player waits
- **Hint System**: Unlocked at 3/5/7 attempts; mechanic → strategy → concrete move tiers
- **Mercy Skip**: After 8 attempts, unlock next level (marks as "skipped", grayed out stars)

### Level Progression (6 Acts)

| Act | Levels | Grid | Focus | Key Mechanics |
|-----|--------|------|-------|---|
| 1: Outskirts | 1-2 | 8×8 | Movement + static guards | L1: pure routing; L2: wilting aura cycles |
| 2: Garden | 3-4 | 9×9 | One-ways + suspicion | L3: commitment ratchets; L4: suspicion tiers (NEW) |
| 3: Fortress | 5-6 | 10×10 | Doors/keys + decay | L5: key sequencing; L6: warm-tile afterglow + blinking |
| 4: Underground | 7-8 | 11×11 | Mirrors + sniper | L7: mirror reflection chains; L8: sniper cadence (NEW) |
| 5: Palace | 9-10 | 11×12 | Stones + chaser | L9: stone throw targeting (NEW); L10: combo (mirrors+decay+sniper+patrol) |
| 6: Chamber | 11-12 | 11×13 | All types + finale | L11: all 8 guards + 2 stones; L12: unsolvable princess wave easter egg |

### Success Metrics

- L1–L11 BFS-solvable with guard tax > floor (per-level thresholds asserted in CI ablation harness)
- L12 BFS-unsolvable pinned by CI; intentional easter egg (console teleport wins)
- Per-mechanic necessity: removing the named mechanic changes L1–L11 solutions (except L9/L10 stones/mirrors at BFS optimum, which are present but not proof-bearing)
- Turn mechanics execute <1ms on all guards simultaneously
- Full offline playback after 1st visit (service worker caches all assets)
- Responsive 360px–4K (uniform scale transform; no per-component media queries needed)
- Localization: 167 keys, en/vi parity verified in CI
- Touch controls: 44px minimum button targets; stone-throw usable without keyboard
- `npm test` green: 243 passing unit + integration tests
- `npm run test:solvability` green: 39 solvability tests (11 solvable, 1 unsolvable, 27 status quo)

### Technical Constraints

- Svelte 5 runes mode (`$state`, `$derived`, `$props`)
- Class instances require `renderVersion` pattern for reactivity
- Grid size capped at 13x13 (viewport scrolls beyond 9x9)
- Max 10 guards per level
- ES modules only

## Project Status

**Current Version:** 2.0.0 (Playable, Hard, Offline)
**Repository:** GitHub (tiennm99dev/nntv)
**Last Updated:** 2026-07-26
**CI:** Node 24, npm; all tests passing (243 unit + solvability, 39 level-specific)

### Completed Phases
1. **Engine correctness** — All 13 guards.js/turn-manager.js defects fixed; mirrors reflect, warm is lethal, swaps detected, suspicion persists, statics regrow
2. **Difficulty harness** — BFS ablation asserts guard tax ≥ floor; per-mechanic necessity checks; no level is guard-free anymore
3. **Level retune** — All L1–L11 now require guard traversal; monotonic difficulty curve by search depth
4. **UX/Playability** — Responsive 360px+; on-screen throw; hints + mercy skip; fixed preview; all modals accessible; i18n complete
5. **Offline + deploy** — Service worker + PWA manifest; 5.55 MiB dist (was 9.25 MiB); all CI gates passing
6. **Documentation sync** — Game design reconciled with levels.js; briefing text accurate L1–L11; README updated with architecture, controls, assets

### Known Limitations (Acceptable)
- **L11 not strictly hardest** — L5 has 31 optimal moves, L11 has 23; BFS depth not pure difficulty metric (branch-count is). Chaser limitation on detectionRadius=2 for CI budget.
- **L9/L10 mechanics decorative at optimum** — stones (L9) and mirror chains (L10) are present, functional, and teach mechanics, but BFS finds shorter pathing-only routes at optimal move count
- **Warm afterglow on L6 only** — other decay levels (L9/L10) don't have solo guards that make warm relevant; warm itself is lethal, just not the primary guard tax

### Next Possible Improvements (Out of Scope)
- A* search + dominance pruning in solver for deeper difficulty exploration
- L11 board widening or guard repositioning for second independent chokepoint
- L9/L10 redesign to make mechanic load-bearing at optimum
- Chaser detectionRadius 3–4 once solver gains pruning
- BGM composition + implementation (voice lines wired but unused, saved in unshipped-assets/)
- "Run complete" ending flow (currently unreachable; L12 is final level)
