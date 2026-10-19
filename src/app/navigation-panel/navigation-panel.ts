import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
// Read from package.json so the sidebar never drifts from the real version.
// TODO: placeholder profile URLs — replace with the project's real accounts.
import { version } from '../../../package.json';

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

  protected readonly appVersion = `v${version}`;

  protected readonly mapsList = [
    'bog',
    'crash',
    'backlot',
    'crossfire',
    'district',
    'strike',
  ];

  protected readonly socialLinks = [
    {
      label: 'X (Twitter)',
      href: 'https://x.com/__aymkh/status/2112341369763278956',
    },
    {
      label: 'LinkedIn',
      href: 'https://lnkd.in/p/d26xX7ps',
    },
    {
      label: 'GitHub',
      href: 'https://github.com/aym-kh/cod4-tactics',
    },
  ];

  protected selectMap(map: string): void {
    this.mapSelected.emit(map);
  }
}
