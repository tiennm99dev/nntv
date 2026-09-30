// Main canvas — assembles all NNTV pixel assets onto a single design canvas.
const { useState } = React;

function Card({ title, subtitle, children, bg = NNTV.twilight, width = 'auto', pad = 20 }) {
  return (
    <div style={{
      background: bg, borderRadius: 4, padding: pad,
      border: `2px solid ${NNTV.shadow}`,
      boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
      color: NNTV.moonlight, fontFamily: 'ui-monospace, Menlo, monospace',
      width, display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      {title && <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: NNTV.cream }}>{title}</div>}
      {subtitle && <div style={{ fontSize: 11, color: NNTV.silver, marginTop: -8 }}>{subtitle}</div>}
      {children}
    </div>
  );
}

function SpriteCard({ sprite, scale = 5, border = NNTV.shadow, colorDot }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      padding: 10, background: NNTV.midnight, border: `1px solid ${border}`,
    }}>
      <div style={{ background: NNTV.gridEmpty, padding: 4, border: `1px solid ${NNTV.gridBorder}` }}>
        <Pixel art={sprite.art} palette={sprite.pal} scale={scale} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: NNTV.moonlight, fontFamily: 'ui-monospace, Menlo, monospace', fontWeight: 700 }}>
        {colorDot && <span style={{ width: 8, height: 8, borderRadius: '50%', background: colorDot, border: '1px solid #000' }} />}
        {sprite.label}
      </div>
      <div style={{ fontSize: 10, color: NNTV.silver, fontFamily: 'ui-monospace, Menlo, monospace', textAlign: 'center', maxWidth: 180 }}>{sprite.desc}</div>
    </div>
  );
}

// ── 1. LOGO + PALETTE ──────────────────────────────────────────────────
function LogoSection() {
  return (
    <DCSection title="01 · Identity" subtitle="Logo, wordmark, palette tokens">
      <DCArtboard label="Logo (stacked)" width={720} height={360}>
        <div style={{
          width: '100%', height: '100%', background: NNTV.midnight,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18,
          position: 'relative', overflow: 'hidden',
        }}>
          {/* starfield */}
          <div style={{ position: 'absolute', top: 20, left: 40 }}><Pixel art={MOON_ART} palette={MOON_PAL} scale={3} /></div>
          {[[80,50],[600,40],[120,280],[680,260],[380,30]].map(([x,y],i)=>(
            <div key={i} style={{ position: 'absolute', top: y, left: x, width: 3, height: 3, background: NNTV.cream }}/>
          ))}
          <Pixel art={LOGO_ART} palette={LOGO_PAL} scale={4} />
          <div style={{
            fontFamily: 'ui-monospace, Menlo, monospace', color: NNTV.moonGlow,
            fontSize: 14, letterSpacing: 6, fontWeight: 700,
          }}>NIGHT NINJA : TWILIGHT VOYAGE</div>
          <div style={{ fontFamily: 'ui-monospace, Menlo, monospace', color: NNTV.silver, fontSize: 10, letterSpacing: 2 }}>
            — a turn-based stealth puzzle —
          </div>
        </div>
      </DCArtboard>

      <DCArtboard label="Palette tokens" width={420} height={360}>
        <div style={{ background: NNTV.midnight, padding: 18, height: '100%', color: NNTV.moonlight, fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: NNTV.cream, marginBottom: 10 }}>GUARD COLORS · STRICT</div>
          {[
            ['static', NNTV.guardStatic, 'tomato · red'],
            ['rotating', NNTV.guardRotating, 'blueberry · blue'],
            ['blinking', NNTV.guardBlinking, 'corn · yellow'],
            ['patrolling', NNTV.guardPatrolling, 'eggplant · purple'],
            ['mirror', NNTV.guardMirror, 'lettuce · green'],
            ['chaser', NNTV.guardChaser, 'pumpkin · orange'],
          ].map(([k, c, label]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '3px 0' }}>
              <span style={{ width: 18, height: 18, background: c, border: '1px solid #000' }} />
              <span style={{ width: 90 }}>{k}</span>
              <span style={{ color: NNTV.silver }}>{c}</span>
              <span style={{ color: NNTV.silver, marginLeft: 'auto' }}>{label}</span>
            </div>
          ))}
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: NNTV.cream, marginTop: 14, marginBottom: 8 }}>WORLD · TWILIGHT</div>
          {[
            ['midnight', NNTV.midnight],
            ['twilight', NNTV.twilight],
            ['dusk', NNTV.dusk],
            ['plum', NNTV.plum],
            ['moonlight', NNTV.moonlight],
            ['moonGlow', NNTV.moonGlow],
            ['cream', NNTV.cream],
            ['carrot', NNTV.carrot],
          ].map(([k, c]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '2px 0' }}>
              <span style={{ width: 18, height: 18, background: c, border: '1px solid #000' }} />
              <span style={{ width: 90 }}>{k}</span>
              <span style={{ color: NNTV.silver }}>{c}</span>
            </div>
          ))}
        </div>
      </DCArtboard>
      <DCPostIt top={-8} left={1180} rotate={3} width={220}>
        Guard colors match the engine's color tokens exactly — so a player reading the board sees the mechanic, not just the character.
      </DCPostIt>
    </DCSection>
  );
}

// ── 2. CHARACTER SPRITES ───────────────────────────────────────────────
function CharactersSection() {
  return (
    <DCSection title="02 · Characters" subtitle="32×32 sprites · shown @ 5× · ink-outlined for contrast on dark cells">
      <DCArtboard label="Player" width={220} height={260}>
        <div style={{ background: NNTV.twilight, height: '100%', display: 'grid', placeItems: 'center' }}>
          <SpriteCard sprite={SPRITES.rabbit} scale={5} />
        </div>
      </DCArtboard>

      <DCArtboard label="Guards (6 types · strict color)" width={980} height={260}>
        <div style={{ background: NNTV.twilight, height: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: 8, overflow:'hidden' }}>
          <SpriteCard sprite={SPRITES.tomato} scale={4} colorDot={NNTV.guardStatic} />
          <SpriteCard sprite={SPRITES.blueberry} scale={4} colorDot={NNTV.guardRotating} />
          <SpriteCard sprite={SPRITES.corn} scale={4} colorDot={NNTV.guardBlinking} />
          <SpriteCard sprite={SPRITES.eggplant} scale={4} colorDot={NNTV.guardPatrolling} />
          <SpriteCard sprite={SPRITES.lettuce} scale={4} colorDot={NNTV.guardMirror} />
          <SpriteCard sprite={SPRITES.pumpkin} scale={4} colorDot={NNTV.guardChaser} />
        </div>
      </DCArtboard>

      <DCArtboard label="Princess · Blinking (off)" width={360} height={260}>
        <div style={{ background: NNTV.twilight, height: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: 8 }}>
          <SpriteCard sprite={SPRITES.princess} scale={4} />
          <SpriteCard sprite={SPRITES.cornOff} scale={4} colorDot={NNTV.guardBlinkingOff} />
        </div>
      </DCArtboard>

      <DCPostIt top={-8} left={1620} rotate={-2} width={220}>
        Princess sits on a carrot throne color. Tiara echoes the gold palace trim — foreshadowing Act 5 before you ever reach it.
      </DCPostIt>
    </DCSection>
  );
}

// ── 3. TILES ────────────────────────────────────────────────────────────
function TilesSection() {
  const tiles = [
    ['Empty', TILE_EMPTY, TILE_EMPTY_PAL, 'dark safe cell with subtle dither'],
    ['Wall', TILE_WALL, TILE_WALL_PAL, 'dressed stone block'],
    ['Goal', TILE_GOAL, TILE_GOAL_PAL, 'grass patch — safe end'],
    ['Lit (danger)', TILE_LIT, TILE_LIT_PAL, 'pulsing inner rings'],
    ['Mirror', TILE_MIRROR, TILE_MIRROR_PAL, 'diamond — deflects beams'],
    ['Preview', TILE_PREVIEW, TILE_PREVIEW_PAL, 'press V · corner markers'],
  ];
  return (
    <DCSection title="03 · Tileset" subtitle="16×16 tiles · shown @ 8× · tiles sit flush; no rounded corners">
      <DCArtboard label="Cells" width={1260} height={240}>
        <div style={{ background: NNTV.midnight, height: '100%', display: 'flex', alignItems: 'center', gap: 18, padding: 18 }}>
          {tiles.map(([n, a, p, d]) => (
            <div key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ border: '1px solid #000' }}><Pixel art={a} palette={p} scale={8} /></div>
              <div style={{ fontSize: 11, color: NNTV.cream, fontFamily: 'ui-monospace, Menlo, monospace', fontWeight: 700 }}>{n}</div>
              <div style={{ fontSize: 10, color: NNTV.silver, fontFamily: 'ui-monospace, Menlo, monospace', maxWidth: 140, textAlign: 'center' }}>{d}</div>
            </div>
          ))}
        </div>
      </DCArtboard>

      {/* live board mock */}
      <DCArtboard label="Live board mock · Level 4 · The Searchlight" width={520} height={460}>
        <div style={{ background: NNTV.midnight, width: '100%', height: '100%', display: 'grid', placeItems: 'center' }}>
          <BoardMock />
        </div>
      </DCArtboard>
    </DCSection>
  );
}

function BoardMock() {
  // 7x7 level layout. W=wall, .=empty, G=goal, L=lit, M=mirror
  // guards/player rendered as overlays
  const rows = [
    'P......',
    '.......',
    '..WWW..',
    '..W.W..',
    '..WbW..',  // b = blue guard inside wall box
    '.......',
    '......G',
  ];
  const tileFor = (ch) => {
    if (ch === 'W') return { art: TILE_WALL, pal: TILE_WALL_PAL };
    if (ch === 'G') return { art: TILE_GOAL, pal: TILE_GOAL_PAL };
    return { art: TILE_EMPTY, pal: TILE_EMPTY_PAL };
  };
  const SIZE = 48;
  return (
    <div style={{ position: 'relative', width: 7*SIZE, height: 7*SIZE }}>
      {rows.map((row, r) => (
        <div key={r} style={{ display: 'flex' }}>
          {[...row].map((ch, c) => (
            <div key={c} style={{ width: SIZE, height: SIZE }}>
              <Pixel art={tileFor(ch).art} palette={tileFor(ch).pal} scale={SIZE/16} />
            </div>
          ))}
        </div>
      ))}
      {/* lit cells — beam pointing right from blue guard */}
      {[[4,3],[4,4]].map(([r,c],i)=>(
        <div key={'l'+i} style={{ position: 'absolute', top: r*SIZE, left: c*SIZE, width: SIZE, height: SIZE, background: NNTV.gridLit, opacity: 0.85, mixBlendMode: 'screen' }}/>
      ))}
      {/* player at 0,0 */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: SIZE, height: SIZE, display: 'grid', placeItems: 'center' }}>
        <Pixel art={SPRITES.rabbit.art} palette={SPRITES.rabbit.pal} scale={SIZE/32} />
      </div>
      {/* blueberry guard at 4,3 */}
      <div style={{ position: 'absolute', top: 4*SIZE, left: 3*SIZE, width: SIZE, height: SIZE, display: 'grid', placeItems: 'center' }}>
        <Pixel art={SPRITES.blueberry.art} palette={SPRITES.blueberry.pal} scale={SIZE/32} />
      </div>
    </div>
  );
}

// ── 4. UI / HUD / ICONS ────────────────────────────────────────────────
function UISection() {
  const [livesState] = useState(2);
  return (
    <DCSection title="04 · UI · HUD · icons" subtitle="Game chrome. Buttons keep pixel ink outlines for cohesion.">
      <DCArtboard label="HUD" width={640} height={180}>
        <div style={{ background: NNTV.midnight, height: '100%', padding: 18, display: 'flex', alignItems: 'center', gap: 24, fontFamily: 'ui-monospace, Menlo, monospace', color: NNTV.moonlight }}>
          {/* level */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ fontSize: 10, color: NNTV.silver, letterSpacing: 2 }}>LEVEL</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: NNTV.cream }}>07<span style={{ fontSize: 14, color: NNTV.silver }}>/12</span></div>
          </div>
          {/* lives */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 10, color: NNTV.silver, letterSpacing: 2 }}>LIVES</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[0,1,2].map(i => (
                <Pixel key={i} art={i < livesState+1 ? HEART_ART : HEART_ART_EMPTY} palette={HEART_PAL} scale={3} />
              ))}
            </div>
          </div>
          {/* turns */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ fontSize: 10, color: NNTV.silver, letterSpacing: 2 }}>TURN</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: NNTV.cream }}>014</div>
          </div>
          {/* divider */}
          <div style={{ width: 1, alignSelf: 'stretch', background: NNTV.plum }}/>
          {/* icon buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            {[['undo', ICON_UNDO, 'Z'], ['redo', ICON_REDO, 'Y'], ['preview', ICON_EYE, 'V'], ['pause', ICON_PAUSE, 'Esc']].map(([k, art, key]) => (
              <div key={k} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ padding: 6, background: NNTV.plum, border: `1px solid ${NNTV.shadow}` }}>
                  <Pixel art={art} palette={ICON_PAL} scale={2} />
                </div>
                <div style={{ fontSize: 9, color: NNTV.silver, letterSpacing: 1 }}>{key}</div>
              </div>
            ))}
          </div>
        </div>
      </DCArtboard>

      <DCArtboard label="Buttons" width={400} height={180}>
        <div style={{ background: NNTV.twilight, height: '100%', padding: 18, display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'ui-monospace, Menlo, monospace' }}>
          {['PLAY', 'LEVEL SELECT', 'CONTINUE'].map((t, i) => (
            <button key={t} style={{
              fontFamily: 'inherit', fontSize: 13, letterSpacing: 2, fontWeight: 700,
              background: i === 0 ? NNTV.plum : NNTV.twilight,
              color: i === 0 ? NNTV.cream : NNTV.moonlight,
              border: `2px solid ${i === 0 ? NNTV.moonGlow : NNTV.plum}`,
              padding: '10px 18px', textAlign: 'left', cursor: 'pointer',
              boxShadow: `3px 3px 0 ${NNTV.shadow}`,
            }}>{t}</button>
          ))}
          <button style={{
            fontFamily: 'inherit', fontSize: 11, letterSpacing: 2,
            background: 'transparent', color: NNTV.silver,
            border: `1px dashed ${NNTV.plum}`, padding: '6px 14px',
          }}>SETTINGS / GUIDE</button>
        </div>
      </DCArtboard>

      <DCArtboard label="Icon library" width={480} height={180}>
        <div style={{ background: NNTV.midnight, height: '100%', padding: 18, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', fontFamily: 'ui-monospace, Menlo, monospace' }}>
          {[['undo', ICON_UNDO], ['redo', ICON_REDO], ['eye', ICON_EYE], ['pause', ICON_PAUSE], ['gear', ICON_SETTINGS], ['lang', ICON_LANG], ['move', ICON_ARROW]].map(([name, art]) => (
            <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ padding: 4, background: NNTV.plum }}>
                <Pixel art={art} palette={ICON_PAL} scale={3} />
              </div>
              <div style={{ fontSize: 9, color: NNTV.silver, letterSpacing: 1 }}>{name}</div>
            </div>
          ))}
        </div>
      </DCArtboard>
    </DCSection>
  );
}

// ── 5. POPUPS / SCREENS ────────────────────────────────────────────────
function PopupsSection() {
  return (
    <DCSection title="05 · Popups & screens" subtitle="Detection, level complete, pause, game over, main menu">
      <DCArtboard label="Main menu" width={460} height={520}>
        <div style={{ background: NNTV.midnight, height: '100%', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, fontFamily: 'ui-monospace, Menlo, monospace', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 14, right: 18 }}><Pixel art={MOON_ART} palette={MOON_PAL} scale={2} /></div>
          <Pixel art={LOGO_ART} palette={LOGO_PAL} scale={2.5} />
          <div style={{ color: NNTV.moonGlow, fontSize: 11, letterSpacing: 4, marginTop: -6 }}>TWILIGHT VOYAGE</div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <Pixel art={SPRITES.rabbit.art} palette={SPRITES.rabbit.pal} scale={3} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 260, marginTop: 10 }}>
            {['START GAME', 'LEVEL SELECT', 'GUIDE', 'SETTINGS'].map((t, i) => (
              <button key={t} style={{
                fontFamily: 'inherit', fontSize: 12, letterSpacing: 2, fontWeight: 700,
                background: i === 0 ? NNTV.plum : 'transparent',
                color: i === 0 ? NNTV.cream : NNTV.moonlight,
                border: `2px solid ${i === 0 ? NNTV.moonGlow : NNTV.plum}`,
                padding: '10px 14px', textAlign: 'left', cursor: 'pointer',
                boxShadow: i === 0 ? `3px 3px 0 ${NNTV.shadow}` : 'none',
              }}>› {t}</button>
            ))}
          </div>
        </div>
      </DCArtboard>

      <DCArtboard label="Detection popup" width={420} height={320}>
        <div style={{ background: 'rgba(0,0,0,0.85)', height: '100%', display: 'grid', placeItems: 'center', fontFamily: 'ui-monospace, Menlo, monospace' }}>
          <div style={{ background: NNTV.twilight, border: `3px solid ${NNTV.eyeRed}`, padding: '22px 28px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', boxShadow: `5px 5px 0 ${NNTV.shadow}` }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <Pixel art={SPRITES.pumpkin.art} palette={SPRITES.pumpkin.pal} scale={2} />
              <Pixel art={SPRITES.rabbit.art} palette={SPRITES.rabbit.pal} scale={2} />
            </div>
            <div style={{ color: NNTV.eyeRed, fontSize: 22, fontWeight: 700, letterSpacing: 4 }}>DETECTED!</div>
            <div style={{ color: NNTV.silver, fontSize: 11 }}>– 1 life · restarting level</div>
            <button style={{ fontFamily: 'inherit', fontSize: 12, letterSpacing: 2, background: NNTV.plum, color: NNTV.cream, border: `2px solid ${NNTV.moonGlow}`, padding: '8px 20px', marginTop: 6, cursor: 'pointer' }}>TRY AGAIN</button>
          </div>
        </div>
      </DCArtboard>

      <DCArtboard label="Level complete" width={420} height={320}>
        <div style={{ background: 'rgba(0,0,0,0.85)', height: '100%', display: 'grid', placeItems: 'center', fontFamily: 'ui-monospace, Menlo, monospace' }}>
          <div style={{ background: NNTV.twilight, border: `3px solid ${NNTV.gridGoal}`, padding: '22px 28px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', boxShadow: `5px 5px 0 ${NNTV.shadow}` }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {[...'★★★'].map((s, i) => <span key={i} style={{ color: NNTV.moonGlow, fontSize: 32, textShadow: `2px 2px 0 ${NNTV.shadow}` }}>{s}</span>)}
            </div>
            <div style={{ color: NNTV.gridGoal, fontSize: 18, fontWeight: 700, letterSpacing: 3 }}>LEVEL CLEAR</div>
            <div style={{ color: NNTV.silver, fontSize: 11 }}>14 turns · 0 detections</div>
            <button style={{ fontFamily: 'inherit', fontSize: 12, letterSpacing: 2, background: NNTV.plum, color: NNTV.cream, border: `2px solid ${NNTV.moonGlow}`, padding: '8px 20px', cursor: 'pointer' }}>NEXT →</button>
          </div>
        </div>
      </DCArtboard>

      <DCArtboard label="Game over (level 12)" width={420} height={320}>
        <div style={{ background: 'rgba(0,0,0,0.95)', height: '100%', display: 'grid', placeItems: 'center', fontFamily: 'ui-monospace, Menlo, monospace', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at center, ${NNTV.guardBlinkingOff}22 0%, transparent 60%)` }}/>
          <div style={{ background: NNTV.shadow, border: `2px solid ${NNTV.gridLit}`, padding: '24px 28px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', position: 'relative' }}>
            <Pixel art={SPRITES.princess.art} palette={SPRITES.princess.pal} scale={2} />
            <div style={{ color: NNTV.gridLit, fontSize: 13, fontWeight: 700, letterSpacing: 2, maxWidth: 280, lineHeight: 1.5 }}>"SOME RESCUES WERE NEVER MEANT TO BE…"</div>
            <div style={{ color: NNTV.silver, fontSize: 10, fontStyle: 'italic' }}>— the princess remains beyond your reach</div>
          </div>
        </div>
      </DCArtboard>
    </DCSection>
  );
}

// ── 6. ACT BACKGROUNDS ──────────────────────────────────────────────────
function BackgroundsSection() {
  const acts = [
    ['garden', SCENES.garden],
    ['walls', SCENES.walls],
    ['fortress', SCENES.fortress],
    ['underground', SCENES.underground],
    ['palace', SCENES.palace],
    ['chamber', SCENES.chamber],
  ];
  return (
    <DCSection title="06 · Act backgrounds" subtitle="One per act · level intro banner behind story text">
      {acts.map(([k, s]) => (
        <DCArtboard key={k} label={s.label} width={640} height={300}>
          <div style={{ background: NNTV.midnight, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, overflow: 'hidden', display: 'grid', placeItems: 'center' }}>
              <Pixel art={s.art} palette={s.pal} scale={8} />
            </div>
            <div style={{ padding: '8px 12px', background: NNTV.shadow, color: NNTV.silver, fontSize: 10, fontFamily: 'ui-monospace, Menlo, monospace' }}>{s.desc}</div>
          </div>
        </DCArtboard>
      ))}
    </DCSection>
  );
}

// ── 7. LEVEL INTRO MOCK ────────────────────────────────────────────────
function LevelIntroSection() {
  const story = [
    { act: SCENES.garden, name: 'Level 1 · Garden Path', body: 'You slip past the outskirts of the Vegetable Kingdom. Moonlight silvers the hedges. Nothing stirs — yet.' },
    { act: SCENES.fortress, name: 'Level 5 · Fortress Gate', body: 'A corn sentry blinks its torch on and off. Count the beats. Move with the dark.' },
    { act: SCENES.chamber, name: 'Level 12 · The Princess Chamber', body: 'The air feels watchful. She already knows you are here…' },
  ];
  return (
    <DCSection title="07 · Level intro layouts" subtitle="Story beats with act background behind">
      {story.map((s, i) => (
        <DCArtboard key={i} label={s.name} width={640} height={360}>
          <div style={{ position: 'relative', width: '100%', height: '100%', background: NNTV.midnight, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', opacity: 0.55 }}>
              <Pixel art={s.act.art} palette={s.act.pal} scale={8} />
            </div>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 0%, rgba(10,10,26,0.3) 40%, rgba(10,10,26,0.95) 90%)' }}/>
            <div style={{ position: 'absolute', left: 32, right: 32, bottom: 28, color: NNTV.moonlight, fontFamily: 'ui-monospace, Menlo, monospace' }}>
              <div style={{ color: NNTV.moonGlow, fontSize: 10, letterSpacing: 4, marginBottom: 6 }}>{s.act.label.toUpperCase()}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: NNTV.cream, marginBottom: 8 }}>{s.name}</div>
              <div style={{ fontSize: 12, color: NNTV.silver, lineHeight: 1.6, maxWidth: 440 }}>{s.body}</div>
              <button style={{ marginTop: 12, fontFamily: 'inherit', fontSize: 11, letterSpacing: 2, background: NNTV.plum, color: NNTV.cream, border: `2px solid ${NNTV.moonGlow}`, padding: '6px 16px', cursor: 'pointer' }}>CONTINUE →</button>
            </div>
          </div>
        </DCArtboard>
      ))}
    </DCSection>
  );
}

// ── APP ─────────────────────────────────────────────────────────────────
function App() {
  return (
    <DesignCanvas style={{ background: '#14131f', fontFamily: 'ui-monospace, Menlo, monospace' }}>
      <div style={{ padding: '20px 60px 40px', color: NNTV.moonlight }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: NNTV.cream, letterSpacing: 2 }}>NIGHT NINJA : TWILIGHT VOYAGE</div>
        <div style={{ fontSize: 13, color: NNTV.silver, marginTop: 6, maxWidth: 720 }}>
          Pixel-art asset set for tiennm99dev/nntv. 32×32 characters, 16×16 tiles, 80×40 act backgrounds.
          Strict guard-color readability preserved. Palette: evolution of the original indigo theme toward twilight plum + moonlight.
        </div>
      </div>
      <LogoSection />
      <CharactersSection />
      <TilesSection />
      <UISection />
      <PopupsSection />
      <BackgroundsSection />
      <LevelIntroSection />
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
