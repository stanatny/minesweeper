# VOID SURVEY

A 3D Minesweeper expedition across a carved cube, with a floating planar ruin available as an alternative. Explore metal hatches, interpret nearby hazards, and place energy beacons. Classic Minesweeper rules extend across sharp-edged 3D forms with equally sized square tiles and numbers printed on each face.

[Changelog](changelog.md)

## Browser game

Open `index.html` directly to play. The bundle includes Three.js and requires no CDN downloads. You can also start a static server:

```bash
python3 -m http.server 8765 --bind 127.0.0.1
```

Visit <http://127.0.0.1:8765>. The 3D renderer requires WebGL 2. If WebGL is unavailable or its context is lost, the game switches to a playable 2D compatibility grid and preserves the current board.

The [GitHub Pages version](https://stanatny.github.io/minesweeper/) follows the repository's deployment configuration. Local changes do not automatically update the live site.

The default **Carved cube** starts with **75% recess depth, 216 tiles, and 30 cores**. Explore the stepped corners immediately, or choose **Field type → Planar ruin** for the classic rectangular layout.

Choose **English** or **中文** from the language selector. The first visit uses English regardless of the browser's language. Your selection is remembered when browser storage is available; if storage is blocked, switching still works for the current visit. Changing language updates controls, help, status messages, and accessibility labels while preserving the current survey and settings. Both translations are bundled locally, including in compatibility mode. Keyboard shortcuts remain the same in either language.

### Controls

| Action           | Input                                                                                                                       |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Explore (reveal) | Left-click or tap a hatch. The first reveal and all its neighbors are safe.                                                 |
| Mark (flag)      | Right-click, select Mark mode in the bottom toolbar, or long-press on a touchscreen.                                        |
| Chord            | Double-click a revealed number to open its remaining neighbors when the adjacent flag count matches.                        |
| Orbit            | Drag the scene. Top-down view locks rotation on planar boards; faceted solids allow continuous rotation through both poles. |
| Zoom and pan     | Scroll or pinch to zoom. Middle-drag or drag with two fingers to pan on planar boards; two fingers orbit faceted solids.    |
| Keyboard         | Tab into the board, use the arrow keys to select a cell, press Enter or Space to reveal, and F to flag.                     |
| View and restart | Press V for top-down view or R to restart. Restarting an active round requires confirmation.                                |

In **Planar ruin**, choose Scout (beginner: 9 × 9, 10 mines), Deep (intermediate: 16 × 16, 40 mines), or Frontier (expert: 30 × 16, 99 mines). Custom boards support widths of 5–50, heights of 5–30, and 1 to width × height − 9 mines.

### Carved cube mode

**Carved cube** is the default field type: play across an entire closed 3D object. Drag to rotate continuously in any direction, including complete vertical flips across both poles, and reach the back, top, underside, and recessed steps. Reset view restores the original upright orientation. Every tile is the same physical size: a unit square on a flat face. Numbers follow the orientation of their face instead of floating toward the camera.

**Recess depth** is the primary setting and remains visible when **More settings** is collapsed. It starts at 75% and changes the depth and arrangement of integer-sized steps without changing the total area or tile count. Shape changes occur in discrete steps. This control is disabled for **Regular cube**. With either cut style, two additional corners start opening at 85% depth. At maximum depth, the shape has four recessed corners: two deep opposite cuts and two shallower cuts.

Open **More settings** for the remaining parameters:

- **Cut style** selects **Stepped cuts**, successive **Terraces**, or an uncut **Regular cube**.
- **Tile count** selects 96–864 playable tiles. Each tile has an area of one square unit, so this changes the actual area without stretching individual squares.
- **Core density** sets the proportion of mines from 8% to 25%; the default is 14%, or 30 cores across 216 tiles.

**Generate cube** applies the draft settings with a new shape seed. The button remains available when More settings is collapsed. Changes stay separate from the current field until applied; replacing an active survey requires confirmation. **New survey** keeps the shape and starts a fresh mine layout.

Tiles sharing an edge or corner are neighbors, including across convex ridges and recessed corners. The number of neighbors can vary at those corners. Hovering or keyboard-focusing a tile highlights its actual neighborhood. Numbers, first-move protection, flood reveal, and chording all use these same connections. Shape changes can alter the adjacency graph, so they are only applied when generating a new field.

Arrow keys follow adjacent tiles in the current viewing direction, and keyboard focus turns a hidden face into view. Top view is a camera preset; rotation remains available. Mines, beacons, and flame jets follow their supporting face.

The generator cuts whole blocks from corners of a cubic volume to create one closed orthogonal body. A solid center keeps the body connected without tunnels or touching cutouts. The cuts preserve surface area, and all exposed faces are tiled with equal squares. If WebGL becomes unavailable, the same game continues in a six-direction atlas with the original cross-face adjacency and accessible neighbor labels. The atlas groups tiles by the direction they face, including separate terraces at different depths.

**More settings** starts collapsed on every screen and collapses again after the first reveal. Recess depth and Generate cube stay available whenever the settings panel is open. The field name and drag hint remain visible above the board even when settings are hidden.

### Effects and audio

Minefields use copper covers and deep smoked-umber revealed faces, with pale cream-gold printed numbers and warm beveled edges. Marked cells use a deep teal base and a gold beacon; hover and keyboard focus remain visible on both copper and brown surfaces. The same state colors are used by the compatibility grid.

Both browser field types share a procedural deep-space backdrop with the Sun, Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune, and Pluto distributed around the entire sky. Rotate horizontally and vertically to discover their different directions: Jupiter has cloud bands and a red storm, Saturn has layered rings, Earth has oceans, continents, and clouds, and the Sun has a soft corona. Sizes, positions, and illumination are composed for gameplay.

The starfield, Milky Way, and celestial bodies have fixed world bearings. They move out of view while orbiting and return when you turn back. Each body uses a shaded spherical surface with a circular screen silhouette, preventing the edge-of-screen stretching of a wide-angle perspective view. Saturn's tilted rings pass in front of and behind its globe. Zoom changes the minefield scale while the distant sky keeps its angular size. Background objects stay behind playable tiles and never intercept input. Meteor activity and decorative surface motion pause with the page and stop when reduced motion is enabled.

Background music and sound effects are enabled by default and start after the first click or key press. The music-note and speaker buttons in the upper-right corner control them independently. Audio pauses while the page is hidden.

Clearing a sector launches a short fireworks celebration around the board: rising golden trails burst into cyan, gold, and violet sparks with synchronized sound. You can start another survey immediately. Fireworks stop on restart and respect the system's reduced-motion preference.

Triggering a mine starts a chain reaction that spreads from the impact point. Mechanical cores heat up, explode with synchronized sound, and leave charred remains. The first blasts are separate, then the sequence accelerates into a dense finale. Frontier (expert) and larger boards finish in approximately four seconds, including the effect tail; the sequence pauses while the page is hidden. Results appear after the chain ends. Restarting during the sequence immediately stops the previous round's explosions.

### Development and validation

Requires Node.js 22 or later and npm. Browser tests use a locally installed Google Chrome.

```bash
npm ci
npm run build
npm test
npm run test:i18n
npm run test:i18n:browser
# Start the static server on port 8765 in another terminal before browser tests.
npm run test:browser
npm run test:polish
npm run test:timing
npm run test:flames
npm run test:fireworks
npm run test:orbit
npm run test:surface
npm run test:cosmos
npm run test:celestial
```

Interface messages live in `js/locales/en.json` and `js/locales/zh_cn.json`. Keep the same keys and `{parameter}` placeholders in both files; `npm run test:i18n` checks their consistency. Static markup uses `data-i18n` attributes, and dynamic messages are bound to translation keys without rebuilding the game. No translation service or runtime locale download is required.

After editing `js/`, run `npm run build` and refresh the page. The browser loads `dist/explorer.js`, rather than the source modules. Build artifacts are checked in to support direct opening and static hosting.

### Structure and assets

- `index.html`, `css/style.css`: Responsive mission interface and accessible controls.
- `js/explorer.js`: Input, timing, difficulty, game status, and compatibility mode.
- `js/i18n.js`, `js/locales/`: English and Simplified Chinese interface messages, parameter interpolation, and persisted language selection.
- `js/game_engine.js`: Independent Minesweeper state engine.
- `js/surface_topology.js`: Deterministic carved solids with unit-square tiles, shared-corner adjacency, and independently controlled tile count and recess depth.
- `js/surface_scene.js`: Equal square plates, face-aligned numbers, full-object orbiting, occlusion-aware picking, neighbor highlighting, and face-oriented mines and flame jets.
- `js/free_orbit_controls.js`: Continuous quaternion-based rotation for closed 3D fields, with mouse and touch input, pinch zoom, and gesture cancellation.
- `js/survey_scene.js`: Editable, procedural 3D models for hatches, fractured rock columns, the floating reactor, orbital rings, beacons, and the camera.
- `js/cosmic_environment.js`: Milky Way, stars, and shared celestial-camera integration.
- `js/celestial_bodies.js`: Ten fixed celestial bearings, circular apparent silhouettes, Saturn rings, and the solar corona.
- `js/celestial_materials.js`: Procedural spherical surfaces, cloud bands, terrain, craters, storms, and soft lighting, without external texture downloads.
- `js/meteor_shower.js`: Pooled, intermittent meteor trails with visible-time scheduling and reduced-motion cleanup.
- `js/survey_effects.js`: Shared particle pools, scan waves, beacon columns, shockwaves, and ember trails.
- `js/flame_jets.js`: Instanced flame jets, branching tongues, and short smoke tails, with a fixed pool for dense explosions.
- `js/victory_fireworks.js`: Pooled victory rockets, aerial bursts, and falling spark trails.
- `js/mine_model.js`: Instanced mechanical mines, primed states, and charred remains.
- `js/detonation_sequence.js`: Independent mine-reveal and detonation timeline.
- `js/survey_audio.js`: Locally synthesized music, interaction sounds, and layered explosions, with no external audio files.
- `dist/`: Offline browser bundle and license notices.
- `tests/`: Game-rule tests and real-browser interaction checks.
- `artifacts/`: Local validation screenshots, excluded from version control.

All scene geometry and digit textures are generated in code. No external models, photographs, or fonts are required. Three.js 0.186.0 is distributed under the MIT license; see [third_party_notices.md](third_party_notices.md) for the complete license.

## Native macOS version

`mac/` contains the classic 2D SwiftUI application. The 3D experience is available in the browser version; the native application retains its original gameplay and presentation.

Requires macOS 14 or later. Download an existing build from [Releases](https://github.com/stanatny/minesweeper/releases), or build from source:

```bash
chmod +x build.sh
./build.sh
```

The script prefers a universal build for Apple Silicon and Intel Macs. It outputs `Minesweeper.app`, containing the `Minesweeper` executable. The application uses ad-hoc signing and is not notarized with an Apple Developer ID.

## License

[MIT](LICENSE)
