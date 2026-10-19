import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal, } from '@angular/core';
import { DragState, Lineup, PanOffset, PhaseFilter, TeamFilter, UtilityFilter, } from '../../types';
import { TacticsService } from '../../services/tactics.service';
import { TacticEditorService } from '../../services/tactic-editor.service';

const PLACEMENT_THRESHOLD_PX = 6;

@Component({
  selector: 'app-map-workspace',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './map-workspace.html',
  styleUrl: './map-workspace.scss',
})
export class MapWorkspace {
  private readonly tacticsService = inject(TacticsService);
  protected readonly editor = inject(TacticEditorService);

  readonly mapAsset = input('/maps/backlot.webp');
  readonly mapName = input('backlot');
  readonly lineupSelected = output<Lineup>();

  protected readonly utilityOptions: UtilityFilter[] = ['all', 'frag', 'flash', 'smoke'];
  protected readonly teamOptions: TeamFilter[] = ['all', 'marines', 'opfor'];
  protected readonly phaseOptions: PhaseFilter[] = ['all', 'early', 'mid', 'late'];

  readonly utilityType = signal<UtilityFilter>('all');
  readonly teamFilter = signal<TeamFilter>('all');
  readonly phaseFilter = signal<PhaseFilter>('all');

  protected readonly zoomLevel = signal(1);
  protected readonly panOffset = signal<PanOffset>({ x: 0, y: 0 });
  protected readonly dragState = signal<DragState | null>(null);
  private readonly failedAsset = signal<string | null>(null);

  private lastPointerDown: { x: number; y: number } | null = null;

  constructor() {
    // Switching maps invalidates the previous view; start each map at default
    // zoom and drop stale editor markers (coordinates are map-relative).
    effect(() => {
      if (this.mapName()) {
        this.zoomLevel.set(1);
        this.panOffset.set({ x: 0, y: 0 });
        this.editor.clearPoints();
      }
    });
  }

  protected readonly mapLabel = computed(() => {
    const name = this.mapName();
    const label = name.charAt(0).toUpperCase() + name.slice(1);
    return `${label} tactical map`;
  });

  /** Marker engine: tactics from JSON, narrowed by the selected filters. */
  protected readonly markers = computed(() =>
    this.tacticsService
      .lineupsFor(this.mapName())()
      .filter(
        (lineup) =>
          (this.utilityType() === 'all' || lineup.utility === this.utilityType()) &&
          (this.teamFilter() === 'all' || lineup.team === this.teamFilter()) &&
          (this.phaseFilter() === 'all' || lineup.phase === this.phaseFilter()),
      ),
  );

  /** Start -> landing trajectories for the visible tactics that have both points. */
  protected readonly trajectories = computed(() =>
    this.markers().filter((marker) => marker.landing !== null),);

  /** Tactics present in the map's JSON, before filtering (for empty-state copy). */
  protected readonly totalTactics = computed(
    () => this.tacticsService.lineupsFor(this.mapName())().length,
  );

  /** The draft's trajectory while the editor has both markers placed. */
  protected readonly editorThrow = computed(() => {
    if (!this.editor.open()) return null;
    const start = this.editor.start();
    const landing = this.editor.landing();
    return start && landing ? { start, landing } : null;
  });

  protected readonly isDragging = computed(() => this.dragState() !== null);
  protected readonly zoomPercent = computed(() => Math.round(this.zoomLevel() * 100));
  protected readonly mapTransform = computed(() => {
    const { x, y } = this.panOffset();
    return `translate3d(${x}px, ${y}px, 0) scale(${this.zoomLevel()})`;
  });
  protected readonly hasAssetError = computed(() => this.failedAsset() === this.mapAsset());

  protected zoomIn(): void {
    this.setZoom(this.zoomLevel() + 0.25);
  }

  protected zoomOut(): void {
    this.setZoom(this.zoomLevel() - 0.25);
  }

  protected resetView(): void {
    this.zoomLevel.set(1);
    this.panOffset.set({ x: 0, y: 0 });
  }

  protected onWheel(event: WheelEvent): void {
    event.preventDefault();
    this.setZoom(this.zoomLevel() * Math.exp(-event.deltaY * 0.0015));
  }

  protected onPointerDown(event: PointerEvent): void {
    // Always remember the press so click-vs-pan detection works at any zoom.
    this.lastPointerDown = { x: event.clientX, y: event.clientY };
    if (this.zoomLevel() <= 1 || event.button !== 0) return;

    const target = event.currentTarget;
    if (!(target instanceof HTMLElement)) return;

    event.preventDefault();
    target.setPointerCapture(event.pointerId);

    const pan = this.panOffset();

    this.dragState.set({
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: pan.x,
      originY: pan.y,
    });
  }

  protected onPointerMove(event: PointerEvent): void {
    const drag = this.dragState();
    if (!drag || drag.pointerId !== event.pointerId) return;


    this.panOffset.set({
      x: drag.originX + event.clientX - drag.startX,
      y: drag.originY + event.clientY - drag.startY,
    });
  }

  protected onPointerUp(event: PointerEvent): void {
    const drag = this.dragState();
    if (!drag || drag.pointerId !== event.pointerId) return;

    const target = event.currentTarget;
    if (target instanceof HTMLElement && target.hasPointerCapture(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }
    this.dragState.set(null);
  }

  /**
   * Click (tiny or no movement) on the map frame during editing places
   * a marker on the active target; anything that looks like a pan is ignored.
   */
  protected onMapFrameClick(event: MouseEvent): void {
    const press = this.lastPointerDown;
    this.lastPointerDown = null;
    const moved = press !== null
      && Math.hypot(press.x - event.clientX, press.y - event.clientY) > PLACEMENT_THRESHOLD_PX;
    if (moved) return;
    if (!this.editor.open()) return;

    const frame = event.currentTarget;
    if (!(frame instanceof HTMLElement)) return;

    const rect = frame.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    this.editor.placePoint({
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    });
  }

  protected onMarkerClick(event: MouseEvent, lineup: Lineup): void {
    // Keep marker selection from also dropping an editor marker underneath.
    event.stopPropagation();
    this.lineupSelected.emit(lineup);
  }

  protected onAssetError(): void {
    this.failedAsset.set(this.mapAsset());
  }

  protected onAssetLoad(): void {
    if (this.failedAsset() === this.mapAsset()) {
      this.failedAsset.set(null);
    }
  }

  private setZoom(zoom: number): void {
    const boundedZoom = Math.min(5, Math.max(1, zoom));
    this.zoomLevel.set(boundedZoom);
    if (boundedZoom === 1) {
      this.panOffset.set({ x: 0, y: 0 });
    }
  }
}
