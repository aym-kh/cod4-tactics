import { Injectable, computed, signal } from '@angular/core';
import { MapPoint, MatchPhase, PlacingTarget, StanceType, TacticDraft, TeamSide, UtilityType, } from '../types';

/** Shared state for one tactic being authored; kept alive across reopen. */
@Injectable({ providedIn: 'root' })
export class TacticEditorService {
  // Stable per-session suffix so repeated previews keep the same id.
  private readonly idSuffix = Math.random().toString(36).slice(2, 6);

  readonly open = signal(false);
  readonly placingTarget = signal<PlacingTarget>('start');

  readonly name = signal('');
  readonly utilityType = signal<UtilityType>('frag');
  readonly teamSide = signal<TeamSide>('marines');
  readonly phase = signal<MatchPhase>('mid');
  readonly stance = signal<StanceType | null>('standing');
  readonly description = signal('');
  readonly videoUrl = signal('');
  readonly positionImage = signal('');
  readonly alignmentImage = signal('');

  readonly start = signal<MapPoint | null>(null);
  readonly landing = signal<MapPoint | null>(null);

  /** Export stays blocked until a name and a start position exist. */
  readonly isValid = computed(
    () => this.name().trim().length > 0 && this.start() !== null,
  );

  setOpen(open: boolean): void {
    this.open.set(open);
  }

  /**
   * Registers a map placement on the active placing target and auto-advances
   * start -> landing so the common flow is a couple of clicks.
   */
  placePoint(point: MapPoint): void {
    if (this.placingTarget() === 'start') {
      this.start.set(point);
      this.placingTarget.set('landing');
    } else {
      this.landing.set(point);
    }
  }

  setPoint(target: PlacingTarget, point: MapPoint): void {
    if (target === 'start') this.start.set(point);
    else this.landing.set(point);
  }

  /** Coordinates are map-relative: switching maps invalidates both markers. */
  clearPoints(): void {
    this.start.set(null);
    this.landing.set(null);
    this.placingTarget.set('start');
  }

  reset(): void {
    this.clearPoints();
    this.name.set('');
    this.utilityType.set('frag');
    this.teamSide.set('marines');
    this.phase.set('mid');
    this.stance.set('standing');
    this.description.set('');
    this.videoUrl.set('');
    this.positionImage.set('');
    this.alignmentImage.set('');
  }

  buildTactic(map: string): TacticDraft {
    return {
      id: `${map}-${this.utilityType()}-${this.idSuffix}`,
      map,
      name: this.name().trim(),
      utility: this.utilityType(),
      team: this.teamSide(),
      phase: this.phase(),
      stance: this.stance(),
      description: this.description().trim(),
      videoUrl: this.videoUrl().trim() || null,
      positionImage: this.positionImage().trim() || null,
      alignmentImage: this.alignmentImage().trim() || null,
      start: this.start(),
      landing: this.landing(),
    };
  }
}
