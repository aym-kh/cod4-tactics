import { Component } from '@angular/core';
import { DetailsPanel } from './details-panel/details-panel';
import { MapWorkspace } from './map-workspace/map-workspace';
import { NavigationPanel } from './navigation-panel/navigation-panel';

@Component({
  selector: 'app-root',
  imports: [NavigationPanel, MapWorkspace, DetailsPanel],
  templateUrl: './app.html',
})
export class App {
}
