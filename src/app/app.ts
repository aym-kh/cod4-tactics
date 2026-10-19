import { Component, effect, signal } from '@angular/core';
import { DetailsPanel } from './details-panel/details-panel';
import { MapWorkspace } from './map-workspace/map-workspace';
import { NavigationPanel } from './navigation-panel/navigation-panel';
import { TacticEditor } from './tactic-editor/tactic-editor';
import { Lineup } from './types';

const DEFAULT_MAP = 'backlot';

@Component({
  selector: 'app-root',
  imports: [NavigationPanel, MapWorkspace, DetailsPanel, TacticEditor],
  templateUrl: './app.html',
})
export class App {
  readonly selectedMap = signal(DEFAULT_MAP);
  readonly selectedLineup = signal<Lineup | null>(null);

  protected readonly mapAsset = (): string => `/maps/${this.selectedMap()}.webp`;

  constructor() {
    // A selection belongs to a map: start fresh when navigating between maps.
    effect(() => {
      this.selectedMap();
      this.selectedLineup.set(null);
    });
  }
}
