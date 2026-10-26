import { TestBed } from '@angular/core/testing';
import { MapWorkspace } from './map-workspace';
import { TacticEditorService } from '../../services/tactic-editor.service';
import { TacticsService } from '../../services/tactics.service';

/** Minimal per-map tactic file fixtures, matching public/tactics/*.json. */
const FIXTURE_TACTICS: Record<string, unknown> = {
  backlot: {
    map: 'backlot',
    tactics: [
      {
        id: 'backlot-f-01',
        name: 'A-site frag from short',
        utility: 'frag',
        team: 'attack',
        phase: 'mid',
        stance: 'standing',
        description: '',
        videoUrl: null,
        start: { x: 45.2, y: 62.8 },
        landing: { x: 26.5, y: 38.4 },
      },
      {
        id: 'backlot-l-01',
        name: 'B-bomb flash over pillar',
        utility: 'flash',
        team: 'defence',
        phase: 'early',
        stance: 'crouch',
        description: '',
        videoUrl: null,
        start: { x: 31.4, y: 38 },
        landing: null,
      },
      {
        id: 'backlot-s-01',
        name: 'River-road smoke for A cross',
        utility: 'smoke',
        team: 'attack',
        phase: 'late',
        stance: 'standing',
        description: '',
        videoUrl: null,
        start: { x: 58.5, y: 70.4 },
        landing: { x: 35.9, y: 29.1 },
      },
    ],
  },
  crash: {
    map: 'crash',
    tactics: [
      {
        id: 'crash-f-01',
        name: 'Sniper-spot frag from rubble',
        utility: 'frag',
        team: 'attack',
        phase: 'mid',
        stance: 'walk',
        description: '',
        videoUrl: null,
        start: { x: 52.7, y: 44.3 },
        landing: null,
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

describe('MapWorkspace', () => {
  beforeEach(() => {
    stubTacticsFetch();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function createWorkspace() {
    await TestBed.configureTestingModule({
      imports: [MapWorkspace],
    }).compileComponents();

    // Ensure the default map's tactic JSON finished loading before rendering.
    await TestBed.inject(TacticsService).tacticsReady('backlot');

    const fixture = TestBed.createComponent(MapWorkspace);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return { fixture, element: fixture.nativeElement as HTMLElement, tactics: TestBed.inject(TacticsService)! };
  }

  it('renders enabled, independently selectable radio groups', async () => {
    const { fixture, element } = await createWorkspace();

    const utilityOptions = element.querySelectorAll<HTMLInputElement>(
      'input[name="utility-type"]',
    );
    const teamOptions = element.querySelectorAll<HTMLInputElement>(
      'input[name="team"]',
    );
    const phaseOptions = element.querySelectorAll<HTMLInputElement>(
      'input[name="phase"]',
    );

    expect(utilityOptions).toHaveLength(4);
    expect(teamOptions).toHaveLength(3);
    expect(phaseOptions).toHaveLength(4);
    expect([...utilityOptions, ...teamOptions, ...phaseOptions].every((option) => !option.disabled)).toBe(true);
    expect(element.querySelector<HTMLInputElement>('input[value="all"][name="utility-type"]')?.checked).toBe(true);
    expect(element.querySelector<HTMLInputElement>('input[value="all"][name="team"]')?.checked).toBe(true);
    expect(element.querySelector<HTMLInputElement>('input[value="all"][name="phase"]')?.checked).toBe(true);

    const smokeOption = element.querySelectorAll<HTMLInputElement>('input[value="smoke"]')[0];
    smokeOption?.click();
    fixture.detectChanges();
    expect(smokeOption?.checked).toBe(true);
    expect(element.querySelectorAll<HTMLInputElement>('input[name="utility-type"]')[0]?.checked).toBe(false);
    expect(element.querySelector<HTMLInputElement>('input[value="all"][name="team"]')?.checked).toBe(true);
  });

  it('renders markers loaded from the map tactic JSON', async () => {
    const { fixture, element, tactics } = await createWorkspace();
    const image = element.querySelector<HTMLImageElement>('.map-frame img');
    const markers = element.querySelectorAll<HTMLElement>('.map-marker');

    expect(image?.getAttribute('src')).toBe('/maps/backlot.webp');
    // Three visible tactics; two of them have landing points.
    expect(markers).toHaveLength(5);
    expect(element.querySelectorAll<HTMLButtonElement>('.map-marker:not(.is-landing)')).toHaveLength(3);
    expect(element.querySelectorAll<HTMLButtonElement>('.map-marker.is-landing')).toHaveLength(2);
    expect(markers[0].style.left).toBe('45.2%');
    expect(markers[0].style.top).toBe('62.8%');
    expect(markers[0].dataset['utility']).toBe('frag');
    // Landing points sit right after their start, hollow and dashed.
    expect(markers[1].classList.contains('is-landing')).toBe(true);
    expect(markers[1].style.left).toBe('26.5%');
    expect(markers[1].style.top).toBe('38.4%');
    // One dashed trajectory per tactic with a landing point.
    expect(element.querySelectorAll('.map-trajectories line')).toHaveLength(2);

    const firstStart = element.querySelector<HTMLButtonElement>(
      '.map-marker[aria-label="A-site frag from short"]',
    )!;
    const firstLanding = element.querySelector<HTMLButtonElement>(
      '.map-marker[aria-label="A-site frag from short landing point"]',
    )!;
    const firstTrajectory = element.querySelector<SVGLineElement>(
      '.map-trajectories line[data-utility="frag"]',
    )!;
    expect(firstStart.classList.contains('is-active')).toBe(false);
    expect(firstLanding.classList.contains('is-active')).toBe(false);
    expect(firstTrajectory.classList.contains('is-active')).toBe(false);

    firstStart.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    expect(firstStart.classList.contains('is-active')).toBe(true);
    expect(firstLanding.classList.contains('is-active')).toBe(true);
    expect(firstTrajectory.classList.contains('is-active')).toBe(true);

    firstStart.dispatchEvent(new MouseEvent('mouseleave'));
    fixture.detectChanges();
    expect(firstStart.classList.contains('is-active')).toBe(false);
    expect(firstLanding.classList.contains('is-active')).toBe(false);
    expect(firstTrajectory.classList.contains('is-active')).toBe(false);

    fixture.componentRef.setInput('mapAsset', '/maps/crash.webp');
    fixture.componentRef.setInput('mapName', 'crash');
    await tactics.tacticsReady('crash');
    fixture.detectChanges();
    const crashMarkers = element.querySelectorAll<HTMLElement>('.map-marker');
    expect(element.querySelector<HTMLImageElement>('.map-frame img')?.getAttribute('src'))
      .toBe('/maps/crash.webp');
    // The crash tactic has no landing point: start only, no trajectory.
    expect(crashMarkers).toHaveLength(1);
    expect(crashMarkers[0].dataset['utility']).toBe('frag');
    expect(crashMarkers[0].style.left).toBe('52.7%');
    expect(element.querySelectorAll('.map-trajectories line')).toHaveLength(0);
  });

  it('shows every tactic by default, narrows with filters, and explains the empty state', async () => {
    const { fixture, element } = await createWorkspace();

    const status = () => element.querySelector('output[role="status"]') as HTMLElement | null;

    // All / All / All reveals everything the backlot JSON contains.
    expect(element.querySelectorAll('.map-marker')).toHaveLength(5);
    expect(status()).toBeNull();

    // Narrowing to frag / attack / mid leaves only the A-site frag (with its landing).
    element.querySelectorAll<HTMLInputElement>('input[name="utility-type"]')[1]?.click();
    element.querySelectorAll<HTMLInputElement>('input[name="team"]')[1]?.click();
    element.querySelectorAll<HTMLInputElement>('input[name="phase"]')[2]?.click();
    fixture.detectChanges();
    const narrowStarts = element.querySelectorAll<HTMLElement>('.map-marker:not(.is-landing)');
    expect(narrowStarts).toHaveLength(1);
    expect(narrowStarts[0].dataset['utility']).toBe('frag');
    expect(element.querySelectorAll('.map-marker.is-landing')).toHaveLength(1);

    // Utility -> smoke reproduces the contributor trap: content exists, filters hide it.
    element.querySelectorAll<HTMLInputElement>('input[name="utility-type"]')[3]?.click();
    fixture.detectChanges();
    expect(element.querySelectorAll('.map-marker')).toHaveLength(0);
    expect(status()?.textContent).toContain('3 tactics exist');
    expect(status()?.textContent).toContain('none match the filters');
    expect(status()?.textContent).toContain('All');

    // Loosen to smoke / all / late and the river-road smoke comes back.
    element.querySelectorAll<HTMLInputElement>('input[name="team"]')[0]?.click();
    element.querySelectorAll<HTMLInputElement>('input[name="phase"]')[3]?.click();
    fixture.detectChanges();
    const lateMarkers = element.querySelectorAll<HTMLElement>('.map-marker:not(.is-landing)');
    expect(lateMarkers).toHaveLength(1);
    expect(lateMarkers[0].dataset['utility']).toBe('smoke');
    expect(element.querySelectorAll('.map-marker.is-landing')).toHaveLength(1);
    expect(status()).toBeNull();
  });

  it('explains when a map has no tactics at all', async () => {
    const { fixture, element, tactics } = await createWorkspace();

    // A map whose JSON is empty (or missing) gets the "not yet covered" copy.
    fixture.componentRef.setInput('mapAsset', '/maps/strike.webp');
    fixture.componentRef.setInput('mapName', 'strike');
    await tactics.tacticsReady('strike');
    fixture.detectChanges();

    const status = element.querySelector('output[role="status"]');
    expect(element.querySelectorAll('.map-marker')).toHaveLength(0);
    expect(status?.textContent).toContain('No tactics on this map yet');
  });

  it('emits a selection when a marker is clicked', async () => {
    const { fixture, element } = await createWorkspace();
    const component = fixture.componentInstance;

    const selections: { id: string }[] = [];
    component.lineupSelected.subscribe((lineup: { id: string }) => selections.push(lineup));

    const marker = element.querySelector<HTMLButtonElement>('.map-marker');
    marker?.click();
    fixture.detectChanges();

    expect(selections.map((selection) => selection.id)).toEqual(['backlot-f-01']);
  });

  it('places editor markers on map clicks while the editor is open', async () => {
    const { fixture, element } = await createWorkspace();
    const editor = TestBed.inject(TacticEditorService);
    const frame = element.querySelector<HTMLElement>('.map-frame')!;

    // Placement needs a measurable frame rect.
    vi.spyOn(frame, 'getBoundingClientRect').mockReturnValue({
      left: 10, top: 10, width: 100, height: 100, right: 110, bottom: 110,
      x: 10, y: 10, toJSON: () => frame,
    } as DOMRect);

    // Editor closed: clicks are inert.
    frame.dispatchEvent(new MouseEvent('click', { clientX: 20, clientY: 30 }));
    expect(editor.start()).toBeNull();

    editor.setOpen(true);
    fixture.detectChanges();

    // Click: places the start ghost (10% / 20%) and auto-advances to landing.
    frame.dispatchEvent(new PointerEvent('pointerdown', { clientX: 20, clientY: 30, bubbles: true }));
    frame.dispatchEvent(new MouseEvent('click', { clientX: 20, clientY: 30, bubbles: true }));
    fixture.detectChanges();
    expect(editor.start()).toEqual({ x: 10, y: 20 });
    expect(editor.placingTarget()).toBe('landing');

    // A rubber-band movement beyond the threshold is treated as a pan, not a click.
    frame.dispatchEvent(new PointerEvent('pointerdown', { clientX: 20, clientY: 30, bubbles: true }));
    frame.dispatchEvent(new MouseEvent('click', { clientX: 90, clientY: 80, bubbles: true }));
    expect(editor.landing()).toBeNull();

    // Second clean click: the landing ghost lands at (50% / 10%).
    frame.dispatchEvent(new PointerEvent('pointerdown', { clientX: 60, clientY: 20, bubbles: true }));
    frame.dispatchEvent(new MouseEvent('click', { clientX: 60, clientY: 20, bubbles: true }));
    fixture.detectChanges();
    expect(editor.landing()).toEqual({ x: 50, y: 10 });
    expect(element.querySelectorAll('.map-ghost')).toHaveLength(2);
  });

  it('clears pending editor markers when the map changes', async () => {
    const { fixture, element } = await createWorkspace();
    const editor = TestBed.inject(TacticEditorService);
    const frame = element.querySelector<HTMLElement>('.map-frame')!;

    vi.spyOn(frame, 'getBoundingClientRect').mockReturnValue({
      left: 0, top: 0, width: 100, height: 100, right: 100, bottom: 100,
      x: 0, y: 0, toJSON: () => frame,
    } as DOMRect);

    editor.setOpen(true);
    fixture.detectChanges();
    frame.dispatchEvent(new PointerEvent('pointerdown', { clientX: 30, clientY: 40, bubbles: true }));
    frame.dispatchEvent(new MouseEvent('click', { clientX: 30, clientY: 40, bubbles: true }));
    fixture.detectChanges();
    expect(editor.start()).not.toBeNull();

    fixture.componentRef.setInput('mapName', 'crash');
    fixture.detectChanges();
    expect(editor.start()).toBeNull();
    expect(editor.landing()).toBeNull();
    expect(editor.placingTarget()).toBe('start');
  });

  it('clamps zoom and resets the transform', async () => {
    const { fixture, element } = await createWorkspace();
    const zoomIn = element.querySelector<HTMLButtonElement>('[aria-label="Zoom in"]');
    const zoomOut = element.querySelector<HTMLButtonElement>('[aria-label="Zoom out"]');
    const reset = element.querySelector<HTMLButtonElement>('[aria-label="Reset map view"]');
    const zoomOutput = element.querySelector('output[aria-label="Map zoom"]');
    const mapFrame = element.querySelector<HTMLElement>('.map-frame');

    zoomIn?.click();
    fixture.detectChanges();
    expect(zoomOutput?.textContent?.trim()).toBe('125%');
    expect(mapFrame?.style.transform).toContain('scale(1.25)');

    for (let i = 0; i < 20; i += 1) {
      zoomIn?.click();
    }
    fixture.detectChanges();
    expect(zoomOutput?.textContent?.trim()).toBe('500%');
    expect(zoomIn?.disabled).toBe(true);

    for (let i = 0; i < 20; i += 1) {
      zoomOut?.click();
    }
    fixture.detectChanges();
    expect(zoomOutput?.textContent?.trim()).toBe('100%');
    expect(zoomOut?.disabled).toBe(true);

    zoomIn?.click();
    fixture.detectChanges();
    reset?.click();
    fixture.detectChanges();
    expect(mapFrame?.style.transform).toBe('translate3d(0px, 0px, 0) scale(1)');
    expect(reset?.disabled).toBe(true);
  });

  it('zooms with the mouse wheel and reports map asset errors', async () => {
    const { fixture, element } = await createWorkspace();
    const viewport = element.querySelector<HTMLElement>('.map-viewport');
    const zoomOutput = element.querySelector('output[aria-label="Map zoom"]');
    const image = element.querySelector<HTMLImageElement>('.map-frame img');

    viewport?.dispatchEvent(
      new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: -200 }),
    );
    fixture.detectChanges();
    expect(zoomOutput?.textContent?.trim()).toBe('135%');

    image?.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(element.querySelector('[role="alert"]')?.textContent).toContain(
      'Map asset could not be loaded',
    );
  });
});
