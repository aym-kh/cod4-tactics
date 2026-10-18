import { Component, signal } from '@angular/core';
import { DetailsPanel } from './details-panel/details-panel';
import { MapWorkspace } from './map-workspace/map-workspace';
import { NavigationPanel } from './navigation-panel/navigation-panel';

@Component({
  selector: 'app-root',
  imports: [NavigationPanel, MapWorkspace, DetailsPanel],
  templateUrl: './app.html',
})
export class App {
  protected readonly navigationOpen = signal(false);
  protected readonly detailsOpen = signal(false);

  protected toggleNavigation(): void {
    this.navigationOpen.update((isOpen) => !isOpen);
    this.detailsOpen.set(false);
  }

  protected toggleDetails(): void {
    this.detailsOpen.update((isOpen) => !isOpen);
    this.navigationOpen.set(false);
  }
}
