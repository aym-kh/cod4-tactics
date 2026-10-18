import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navigation-panel',
  templateUrl: './navigation-panel.html',
  styleUrl: './navigation-panel.scss',
  imports: [RouterLink],
})
export class NavigationPanel {
  readonly isOpen = input(false);
  readonly selectedMap = input('');
  readonly mapSelected = output<string>();

  protected readonly mapsList = [
    'bog',
    'crash',
    'backlot',
    'crossfire',
    'district',
    'strike',
  ];

  protected selectMap(map: string): void {
    this.mapSelected.emit(map);
  }
}
