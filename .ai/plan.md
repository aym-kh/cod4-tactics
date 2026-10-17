# Project Implementation Plan & Rules

## 🎯 Architecture Goals
- Fully static, client-side single-page application (SPA).
- Responsive, dark-mode/monochrome UI optimized for desktop and mobile viewing.
- Modular map rendering engine capable of displaying markers dynamically based on map coordinates `(x, y)` percentages.


## 🧩 State & Data Schema

### 1. Lineup / Marker Interface
```typescript
export type UtilityType = 'frag' | 'flash' | 'smoke';
export type Faction = 'marines' | 'opfor' | 'both';

export interface Vector2D {
  x: number; // Percentage relative to map image width (0 - 100)
  y: number; // Percentage relative to map image height (0 - 100)
}

export interface LineupMarker {
  id: string;
  mapId: string;
  title: string;
  type: UtilityType;
  faction: Faction;
  originCoords: Vector2D;      // Where the player stands
  landingCoords: Vector2D;     // Where the nade lands
  crosshairAlignImg: string;   // Image path showing crosshair alignment
  standingStance: 'stand' | 'crouch' | 'jump-throw';
  description: string;
  videoClipUrl?: string;       // Optional WebM/MP4 preview
}
```

## 🛣️ Phased Development Roadmap

### Phase 1: Core Shell & Navigation

[ ] Angular App Initialization (Standalone components + Tailwind CSS).
[ ] Responsive Layout: Top Bar (Map selector), Main Canvas Area, Sidebar (Filters & Info Panel).
[ ] High-contrast, minimalist dark theme design tokens.


### Phase 2: Interactive Map Engine

[ ] Map Viewer Component (Panning, zooming, resetting view).
[ ] Coordinate Mapping System: Translating (x, y) relative percentages into interactive SVG/HTML points over the map asset.
[ ] Marker Tooltip & Selection State (Selecting a marker updates the detail sidebar/modal).

### Phase 3: Content & MVP Asset Integration

[ ] Load mp_backlot top-down high-res map asset.
[ ] Add baseline JSON data for 5–10 classic Backlot lineups (A-site rush nade, B-building flash, middle street smoke).
[ ] Implement filter controls (Filter by Frag/Flash/Smoke/Faction).

### Phase 4: Jump & Strafe Module

[ ] Add "Strafe & Jumps" mode toggle on the map viewer.
[ ] Render jump vectors (Origin point $\rightarrow$ Target ledge) with step-by-step image callouts.

### Phase 5: Polish & Deployment

[ ] Keyboard shortcuts (e.g., Esc to clear selection, 1-3 to switch utility filters).
[ ] Build optimization & deployment via GitHub Actions to GitHub Pages / Vercel.

## 🤖 Rules for AI Assistants

- Use Modern Angular: Rely on Angular Signals (signal(), computed(), input()) over legacy RxJS where state is local/reactive.
- Component Architecture: Prefer Standalone Components. Keep UI logic modular.
- Styling: Use utility classes (Tailwind CSS) with high-contrast, clean dark aesthetics. Avoid inline styles unless computing dynamic CSS position variables (left: x%, top: y%).
- Data Isolation: Store all lineup data in typed static JSON/TypeScript data files (/assets/data/maps/*.json) to allow easy backend migration in the future.