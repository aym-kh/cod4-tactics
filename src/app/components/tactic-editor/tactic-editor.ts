import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, } from '@angular/core';
import { MatchPhase, StanceType, TeamSide, UtilityType } from '../../types';
import { TacticEditorService } from '../../services/tactic-editor.service';

type CopyState = 'idle' | 'copied' | 'failed';

@Component({
  selector: 'app-tactic-editor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tactic-editor.html',
  styleUrl: './tactic-editor.scss',
})
export class TacticEditor {
  private readonly editorService = inject(TacticEditorService);

  readonly mapName = input('backlot');

  protected readonly editor = this.editorService;
  protected readonly utilityOptions: UtilityType[] = ['frag', 'flash', 'smoke'];
  protected readonly teamOptions: TeamSide[] = ['attack', 'defence'];
  protected readonly phaseOptions: MatchPhase[] = ['early', 'mid', 'late'];
  protected readonly stanceOptions: Array<{ label: string; value: StanceType | '' }> = [
    { label: 'Standing', value: 'standing' },
    { label: 'Crouch', value: 'crouch' },
    { label: 'Walk', value: 'walk' },
    { label: 'Jump', value: 'jump' },
    { label: 'None', value: '' },
  ];
  protected readonly placingOptions = [
    { key: 'start', label: 'Start marker' },
    { key: 'landing', label: 'Landing marker' },
  ] as const;

  protected readonly copyState = signal<CopyState>('idle');

  constructor() {
    // Points are map-relative coordinates; keep them from leaking across maps.
    effect(() => {
      if (this.mapName()) {
        this.editorService.clearPoints();
      }
    });
  }

  protected readonly tactic = computed(() => this.editor.buildTactic(this.mapName()));
  protected readonly preview = computed(() => JSON.stringify(this.tactic(), null, 2));
  protected readonly downloadName = computed(() => `${this.tactic().id}.json`);

  protected pointLabel(point: { x: number; y: number } | null): string {
    return point ? `${point.x}%, ${point.y}%` : 'Not placed';
  }

  protected async copyJson(): Promise<void> {
    if (this.copyState() !== 'idle') return;
    try {
      await navigator.clipboard.writeText(this.preview());
      this.copyState.set('copied');
    } catch {
      this.copyState.set('failed');
    }
    setTimeout(() => this.copyState.set('idle'), 1600);
  }

  protected downloadJson(): void {
    const blob = new Blob([this.preview()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = this.downloadName();
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
