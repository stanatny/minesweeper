# Changelog

## 2.0.0 — 2026-09-21

### Added

- A fully interactive 3D minefield set on a floating ruin, with fractured rock columns, an energy reactor, orbital rings, a procedural planet, stars, and atmospheric dust.
- Mechanical mines with segmented armor, contact fuses, glowing cores, pre-detonation heating, and charred remains.
- Layered explosion effects: upward flame jets, branching fire tongues, ember trails, short smoke tails, and local shockwaves.
- Original, locally synthesized background music and layered explosion sounds, with independent music and sound-effect controls. Audio starts after a user gesture and pauses when the page is hidden.
- Orbit, zoom, pan, and top-down camera controls; a responsive mission interface; keyboard navigation; touch exploration and long-press marking; and reduced-motion support.
- A playable compatibility grid that preserves the current board when WebGL is unavailable or its context is lost.

### Changed

- Rebuilt the browser game around a standalone rules engine and a Three.js renderer while retaining classic Minesweeper rules, difficulty presets, custom boards, flagging, and chord reveals.
- Made the first revealed cell and its surrounding neighborhood safe.
- Reworked losses into a spatial chain reaction: the first three mines detonate separately, then the remaining explosions accelerate into a dense finale. The expert-mode timeline finishes in approximately four seconds, including the effect tail.
- Delayed the loss result until the chain reaction completes. Restarting remains available during the sequence.
- Bundled browser dependencies locally with a reproducible esbuild command, so the game can run without a CDN or external model, texture, font, or audio downloads. Included the complete Three.js license with the build.

### Fixed

- Removed the persistent highlight left by the first pointer click, while preserving visible keyboard selection and clearing touch highlights after release.
- Prevented camera drags from revealing cells and protected active games with restart and difficulty-change confirmations.
- Cleared old detonations, sounds, flame jets, and ember trails when starting a new game.
- Updated the result and status correctly when WebGL fails during a chain reaction.
- Kept dense explosion effects and audio voices within fixed resource limits, with clean disposal and reduced-motion behavior.

### Validation

- Added 18 automated checks for game rules and detonation timing.
- Added real Chrome coverage for pointer, keyboard, and touch interactions; independent audio controls; win and loss states; restarts; WebGL fallback; reduced motion; flame cleanup; and expert-mode explosion density and duration.
- Verified responsive layouts at 375px and 390px widths, along with desktop views and recorded gameplay with audio.

### Scope

This update applies to the browser game. The existing macOS SwiftUI application, packaging scripts, and release workflow are unchanged.
