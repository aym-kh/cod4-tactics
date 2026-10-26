import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Lineup, MapPoint } from '../../types';

@Component({
  selector: 'app-details-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './details-panel.html',
  styleUrl: './details-panel.scss',
})
export class DetailsPanel {
  readonly lineup = input<Lineup | null>(null);

  protected teamLabel(lineup: Lineup): string {
    return lineup.team.charAt(0).toUpperCase() + lineup.team.slice(1);
  }

  protected stanceLabel(lineup: Lineup): string {
    if (!lineup.stance) return '—';
    const [first, ...rest] = lineup.stance.split('');
    return [first.toUpperCase(), ...rest].join('');
  }

  protected utilityLabel(lineup: Lineup): string {
    return lineup.utility.charAt(0).toUpperCase() + lineup.utility.slice(1);
  }

  protected mapLabel(lineup: Lineup): string {
    return lineup.map.charAt(0).toUpperCase() + lineup.map.slice(1);
  }

  protected pointLabel(point: MapPoint | null): string {
    return point ? `${Math.round(point.x * 10) / 10}%, ${Math.round(point.y * 10) / 10}%` : '—';
  }

  protected trajectoryLabel(lineup: Lineup): string {
    return `${this.pointLabel(lineup.start)} → ${this.pointLabel(lineup.landing ?? null)}`;
  }
}
