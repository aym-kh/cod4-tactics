# Changelog

All notable changes to **COD4 Tactics** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Maintainers cut releases with `npm run release -- patch|minor|major` (see
[CONTRIBUTING.md](./CONTRIBUTING.md)), which folds the latest `[Unreleased]`
entries into a dated section automatically.

## [Unreleased]

## [0.1.2] - 2026-10-26

### Added

- Optional `positionImage` and `alignmentImage` URL fields for tactics,
  editable in the tactic editor and displayed in the lineup breakdown

## [0.1.1] - 2026-10-19

### Added

- `netlify.toml` committed to the repo (build command, publish directory,
  Node 24.21.0, SPA redirect) so deployment config lives in version control
  instead of the Netlify UI

### Fixed

- Deploy workflow now reads Node from `.nvmrc` (v24.21.0, matching local dev)
  instead of the outdated `node-version: 20`, which made the Angular CLI abort
  with "requires a minimum Node.js version"
- Deploy step no longer triggers the Netlify CLI's implicit second build
  (`netlify deploy` builds unless `--no-build` is passed), which failed with
  `spawn bash ENOENT` while resolving the site's UI build settings
- Added an `engines` field to `package.json` so unsupported Node versions are
  flagged at install time

## [0.1.0] - 2026-10-19

### Added

- **Interactive map viewer** for the six competitive COD4 maps
  (`backlot`, `bog`, `crash`, `crossfire`, `district`, `strike`) with:
  - Wheel zoom (1×–5×), click-and-drag panning, and a reset-view control
  - An asset-error fallback if a map texture fails to load
- **Left navigation panel** with the six maps, hover/selected states, and
  `aria-current` on the active map; picking a map swaps the viewer and resets
  its zoom/pan
- **Marker engine** backed by per-map tactic files in
  `public/tactics/<map>_tactics.json`, with a lenient sanitizer so malformed
  entries never break the viewer (they are skipped, not rendered)
- **Filter bar** (utility type, team, phase) driven by signals and defaulting
  to **All / All / All**, so a map always opens showing every tactic its JSON
  contains; narrowing is opt-in. A smart empty state explains both "tactics
  exist but the filters hide them" and "this map has no tactics yet"
- **Start and landing markers** per tactic (landing rendered as a hollow
  dashed ring, both color-coded by utility: frag red, flash amber, smoke
  gray-blue) plus a **dotted trajectory line** connecting them, drawn in an
  SVG overlay scaled 1:1 to the map frame
- **Lineup breakdown panel**: clicking any start or landing marker shows the
  tactic's name, utility chip, team/phase/stance metadata, throw coordinates
  (`start → landing`), description, and an optional "Play video clip" link;
  the selection clears when switching maps
- **In-app tactic editor** ("Add tactic" button, bottom-left of the map):
  - Slide-over sidebar with name, utility/team/phase pickers, stance,
    description and optional video URL
  - Click-to-place start/landing markers on the map (teal / orange ghosts),
    with a drag threshold so panning keeps working, auto-advance from start
    to landing, per-marker clear buttons, and a live trajectory preview
  - Markdown-free JSON handoff: **Copy JSON** (clipboard, with feedback) and
    **Download JSON** (`<id>.json`), blocked until name + start position exist
  - Coordinates publish as map-frame percentages, merge-ready JSON for the
    `tactics` array
- Editor's placed markers and the selection state reset appropriately when
  navigating between maps
- `CONTRIBUTING.md` documenting the tactic submission workflow (editor usage,
  JSON schema, quality guidelines, PR process) and links added from the README

### Changed

- Tactic data migrated from a hardcoded TypeScript service to the
  JSON-per-map files in `public/tactics/` (`TacticsService` fetches lazily per
  map; missing files simply render an empty map state)
- Marker landing points are optional; tactics without one render only their
  start marker and no trajectory

### Fixed

- Stale unit tests brought up to date with the current layout (workspace
  selectors, router providers for the navigation panel)
- Viewer filters default to showing all tactics, removing the trap where a
  newly contributed tactic was invisible because the old default filters
  (`Frag / Marines / Mid`) didn't match it

### Known issues / TODO

- Real lineup data is still sparse — tactics files contain little content and
  need community contribution
