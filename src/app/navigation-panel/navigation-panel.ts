import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navigation-panel',
  templateUrl: './navigation-panel.html',
  imports: [RouterLink],
})
export class NavigationPanel {
  readonly isOpen = input(false);
  protected readonly mapsList = [
    "crossfire",
    "crash",
    "backlot",
    "district",
  ]
}
