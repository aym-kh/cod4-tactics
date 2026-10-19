import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { TacticsService } from './tactics.service';

const FIXTURE_TACTICS: Record<string, unknown> = {
  backlot: {
    map: 'backlot',
    tactics: [
      {
        id: 'backlot-f-01',
        name: 'A-site frag from short',
        utility: 'frag',
        team: 'marines',
        phase: 'mid',
        stance: 'standing',
        description: 'Throw from the junction at short A.',
        videoUrl: null,
        start: { x: 45.2, y: 62.8 },
        landing: { x: 26.5, y: 38.4 },
      },
    ],
  },
};

function stubTacticsFetch(): void {
  vi.spyOn(window, 'fetch').mockImplementation(((input: RequestInfo | URL) => {
    const match = String(input).match(/\/tactics\/([a-z]+)_tactics\.json/);
    const map = match?.[1] ?? '';
    return Promise.resolve({
      ok: true,
      json: async () => FIXTURE_TACTICS[map] ?? { map, tactics: [] },
    } as Response);
  }) as typeof fetch);
}

describe('App', () => {
  beforeEach(() => {
    stubTacticsFetch();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function createApp() {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();

    // Ensure the default map's tactics finished loading before rendering.
    await TestBed.inject(TacticsService).tacticsReady('backlot');

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return { fixture, element: fixture.nativeElement as HTMLElement };
  }

  it('should create the app', async () => {
    const { fixture } = await createApp();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the workspace structure', async () => {
    const { element } = await createApp();
    expect(element.querySelector('#navigation-panel')).toBeTruthy();
    expect(element.querySelector('.map-viewport')).toBeTruthy();
    expect(element.querySelector('#details-panel')).toBeTruthy();
  });

  it('should display the selected map in the map viewer', async () => {
    const { fixture, element } = await createApp();

    const mapImage = element.querySelector<HTMLImageElement>('.map-frame img');
    expect(mapImage?.getAttribute('src')).toBe('/maps/backlot.webp');

    const crashButton = [...element.querySelectorAll<HTMLButtonElement>('#navigation-panel button')]
      .find((button) => button.textContent?.trim() === 'crash');
    expect(crashButton).toBeTruthy();

    crashButton?.click();
    fixture.detectChanges();

    const selectedReloaded = element.querySelector<HTMLImageElement>('.map-frame img');
    expect(selectedReloaded?.getAttribute('src')).toBe('/maps/crash.webp');
    expect(crashButton?.classList.contains('is-selected')).toBe(true);
  });

  it('should update the lineup breakdown when a marker is picked', async () => {
    const { fixture, element } = await createApp();
    const details = () => element.querySelector('#details-panel') as HTMLElement;

    // Empty by default, with a hint on how to select.
    expect(details().textContent).toContain('Pick a marker on the map');

    const marker = element.querySelector<HTMLButtonElement>('.map-marker:not(.is-landing)');
    marker?.click();
    fixture.detectChanges();

    expect(details().textContent).toContain('A-site frag from short');
    expect(details().textContent).toContain('Throw');
    expect(details().textContent).toContain('45.2%, 62.8% → 26.5%, 38.4%');
    expect(details().querySelector('.detail-chip')?.getAttribute('data-utility')).toBe('frag');

    // Navigating to another map clears the stale selection.
    const crashButton = [...element.querySelectorAll<HTMLButtonElement>('#navigation-panel button')]
      .find((button) => button.textContent?.trim() === 'crash');
    crashButton?.click();
    fixture.detectChanges();
    expect(details().textContent).toContain('Pick a marker on the map');
  });
});
