import { Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { Lineup, MapPoint, MatchPhase, StanceType, TeamSide, UtilityType } from '../types';

const UTILITY_TYPES = new Set<string>(['frag', 'flash', 'smoke']);
const TEAM_SIDES = new Set<string>(['attack', 'defence']);
const MATCH_PHASES = new Set<string>(['early', 'mid', 'late']);
const STANCES = new Set<string>(['standing', 'crouch', 'walk', 'jump']);

@Injectable({ providedIn: 'root' })
export class TacticsService {
  private readonly cache = new Map<string, WritableSignal<Lineup[]>>();
  private readonly pending = new Map<string, Promise<void>>();

  /** Tactics for a map, loaded lazily from /tactics/<map>_tactics.json. */
  lineupsFor(map: string): Signal<Lineup[]> {
    let cached = this.cache.get(map);
    if (!cached) {
      cached = signal<Lineup[]>([]);
      this.cache.set(map, cached);
      this.load(map, cached);
    }
    return cached.asReadonly();
  }

  /** Resolves once the given map's tactics are loaded (or failed). */
  tacticsReady(map: string): Promise<void> {
    this.lineupsFor(map);
    return this.pending.get(map) ?? Promise.resolve();
  }

  private load(map: string, target: WritableSignal<Lineup[]>): void {
    this.pending.set(
      map,
      fetch(`/tactics/${map}_tactics.json`)
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => target.set(this.toLineups(data, map)))
        .catch(() => target.set([])),
    );
  }

  /** Lenient sanitizer: drops malformed entries instead of breaking the viewer. */
  private toLineups(data: unknown, map: string): Lineup[] {
    if (!data || typeof data !== 'object') return [];

    const raw = Array.isArray(data)
      ? data
      : (data as Record<string, unknown>)['tactics'];
    if (!Array.isArray(raw)) return [];

    return raw.flatMap((entry, index): Lineup[] => {
      if (!entry || typeof entry !== 'object') return [];
      const e = entry as Record<string, unknown>;

      const utility = e['utility'];
      const team = e['team'];
      const phase = e['phase'];
      const start = toPoint(e['start']);
      if (typeof e['name'] !== 'string' || !start) return [];
      if (typeof utility !== 'string' || !UTILITY_TYPES.has(utility)) return [];
      if (typeof team !== 'string' || !TEAM_SIDES.has(team)) return [];
      if (typeof phase !== 'string' || !MATCH_PHASES.has(phase)) return [];

      return [
        {
          id: typeof e['id'] === 'string' && e['id'] ? e['id'] : `${map}-${index}`,
          map: typeof e['map'] === 'string' && e['map'] ? e['map'] : map,
          name: e['name'],
          utility: utility as UtilityType,
          team: team as TeamSide,
          phase: phase as MatchPhase,
          stance: typeof e['stance'] === 'string' && STANCES.has(e['stance'])
            ? (e['stance'] as StanceType)
            : null,
          description: typeof e['description'] === 'string' ? e['description'] : '',
          videoUrl: typeof e['videoUrl'] === 'string' ? e['videoUrl'] : null,
          positionImage: typeof e['positionImage'] === 'string' ? e['positionImage'].trim() || null : null,
          alignmentImage: typeof e['alignmentImage'] === 'string' ? e['alignmentImage'].trim() || null : null,
          start,
          landing: toPoint(e['landing']),
        },
      ];
    });
  }
}

function toPoint(value: unknown): MapPoint | null {
  if (!value || typeof value !== 'object') return null;
  const { x, y } = value as Record<string, unknown>;
  if (typeof x !== 'number' || typeof y !== 'number' || !Number.isFinite(x) || !Number.isFinite(y)) {
    return null;
  }
  return { x, y };
}
