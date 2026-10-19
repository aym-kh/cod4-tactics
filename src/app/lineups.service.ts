import { Injectable } from '@angular/core';
import { Lineup, LineupFilter } from './types';

// TODO: Replace this placeholder dataset with sourced real lineups.
const LINEUPS: Lineup[] = [
  {
    id: 'backlot-f-01',
    map: 'backlot',
    name: 'A-site frag from short',
    utility: 'frag',
    team: 'marines',
    phase: 'mid',
    position: { x: 45.2, y: 62.8 },
  },
  {
    id: 'backlot-l-01',
    map: 'backlot',
    name: 'B-bomb flash over pillar',
    utility: 'flash',
    team: 'opfor',
    phase: 'early',
    position: { x: 31.4, y: 38 },
  },
  {
    id: 'backlot-s-01',
    map: 'backlot',
    name: 'River-road smoke for A cross',
    utility: 'smoke',
    team: 'marines',
    phase: 'late',
    position: { x: 58.5, y: 70.4 },
  },
  {
    id: 'crash-f-01',
    map: 'crash',
    name: 'Sniper-spot frag from rubble',
    utility: 'frag',
    team: 'marines',
    phase: 'mid',
    position: { x: 52.7, y: 44.3 },
  },
  {
    id: 'crash-f-02',
    map: 'crash',
    name: 'Central lane frag off truck',
    utility: 'frag',
    team: 'opfor',
    phase: 'late',
    position: { x: 39.1, y: 57.6 },
  },
  {
    id: 'crash-s-01',
    map: 'crash',
    name: 'Hexagon smoke for mid split',
    utility: 'smoke',
    team: 'marines',
    phase: 'mid',
    position: { x: 49.8, y: 52 },
  },
  {
    id: 'crossfire-s-01',
    map: 'crossfire',
    name: 'Courtyard smoke for B push',
    utility: 'smoke',
    team: 'marines',
    phase: 'mid',
    position: { x: 47, y: 61.5 },
  },
  {
    id: 'district-f-01',
    map: 'district',
    name: 'Down-balcony frag into trade',
    utility: 'frag',
    team: 'opfor',
    phase: 'mid',
    position: { x: 56.3, y: 35.2 },
  },
  {
    id: 'bog-l-01',
    map: 'bog',
    name: 'Sandbags flash for rush',
    utility: 'flash',
    team: 'marines',
    phase: 'early',
    position: { x: 60.4, y: 48.9 },
  },
  {
    id: 'strike-s-01',
    map: 'strike',
    name: 'Mid smoke for rotator delay',
    utility: 'smoke',
    team: 'opfor',
    phase: 'late',
    position: { x: 43.6, y: 66.7 },
  },
];

@Injectable({ providedIn: 'root' })
export class LineupsService {
  /** All known lineups; filtering happens on the consumer side. */
  readonly lineups = LINEUPS;

  filterLineups(filter: LineupFilter): Lineup[] {
    return this.lineups.filter(
      (lineup) =>
        lineup.map === filter.map &&
        lineup.utility === filter.utility &&
        lineup.phase === filter.phase &&
        (filter.team === 'all' || lineup.team === filter.team),
    );
  }
}
