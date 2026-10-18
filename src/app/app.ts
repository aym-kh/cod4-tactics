import { Component, signal } from '@angular/core';
import { DetailsPanel } from './details-panel/details-panel';
import { MapWorkspace } from './map-workspace/map-workspace';
import { NavigationPanel } from './navigation-panel/navigation-panel';

const DEFAULT_MAP = 'backlot';

@Component({
  selector: 'app-root',
  imports: [NavigationPanel, MapWorkspace, DetailsPanel],
  templateUrl: './app.html',
})
export class App {
  readonly selectedMap = signal(DEFAULT_MAP);

  protected readonly mapAsset = (): string => `/maps/${this.selectedMap()}.webp`;
}
