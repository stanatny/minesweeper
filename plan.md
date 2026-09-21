# Minesweeper Development Plan

> Archived: this plan describes the original 2D implementation. For the 3D browser version introduced on 2026-09-21, see README.md and js/explorer.js. The native macOS SwiftUI version remains available.

Goal: a single-page browser game that runs on macOS and follows classic Windows Minesweeper rules.

## Original file structure

- `index.html`: Page structure with agreed DOM IDs.
- `css/style.css`: Classic Windows-style presentation.
- `js/audio.js`: Synthesized Web Audio effects exposed through the global `GameAudio` API.
- `js/effects.js`: Canvas explosion particles, screen shake, and victory celebrations exposed through the global `GameFX` API.
- `js/game.js`: Mine placement, reveals, flags, timing, and win/loss detection.

## Stages

1. Develop the four modules in parallel against shared interfaces, without editing another module's files.
2. Integrate the modules, check syntax and interface consistency, and resolve integration issues.
3. Deliver a game that launches by opening `index.html` directly.
