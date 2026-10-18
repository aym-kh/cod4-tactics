import { ChangeDetectionStrategy, Component, computed, effect, input, signal, } from '@angular/core';
import { PanOffset, DragState } from '../types';

@Component({
  selector: 'app-map-workspace',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './map-workspace.html',
  styleUrl: './map-workspace.scss',
})
export class MapWorkspace {
  readonly mapAsset = input('/maps/backlot.webp');
  readonly mapName = input('Backlot');

  protected readonly zoomLevel = signal(1);
  protected readonly panOffset = signal<PanOffset>({ x: 0, y: 0 });
  protected readonly dragState = signal<DragState | null>(null);
  private readonly failedAsset = signal<string | null>(null);

  constructor() {
    // Switching maps invalidates the previous view; start each map at default zoom.
    effect(() => {
      if (this.mapAsset()) {
        this.zoomLevel.set(1);
        this.panOffset.set({ x: 0, y: 0 });
      }
    });
  }

  protected readonly mapLabel = computed(() => {
    const name = this.mapName();
    const label = name.charAt(0).toUpperCase() + name.slice(1);
    return `${label} tactical map`;
  });


  protected readonly isDragging = computed(() => this.dragState() !== null);
  protected readonly zoomPercent = computed(() => Math.round(this.zoomLevel() * 100));
  protected readonly mapTransform = computed(() => {
    const { x, y } = this.panOffset();
    return `translate3d(${x}px, ${y}px, 0) scale(${this.zoomLevel()})`;
  });
  protected readonly hasAssetError = computed(() => this.failedAsset() === this.mapAsset());

  protected readonly testMarker = { x: 45.2, y: 62.8 };

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
