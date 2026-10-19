import { TestBed } from '@angular/core/testing';
import { MapWorkspace } from './map-workspace';

describe('MapWorkspace', () => {
  async function createWorkspace() {
    await TestBed.configureTestingModule({
      imports: [MapWorkspace],
    }).compileComponents();

    const fixture = TestBed.createComponent(MapWorkspace);
    fixture.detectChanges();
    await fixture.whenStable();
    return { fixture, element: fixture.nativeElement as HTMLElement };
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

    expect(utilityOptions).toHaveLength(3);
    expect(teamOptions).toHaveLength(3);
    expect(phaseOptions).toHaveLength(3);
    expect([...utilityOptions, ...teamOptions, ...phaseOptions].every((option) => !option.disabled)).toBe(true);
    expect(element.querySelector<HTMLInputElement>('input[value="frag"]')?.checked).toBe(true);
    expect(element.querySelector<HTMLInputElement>('input[value="marines"]')?.checked).toBe(true);
    expect(element.querySelector<HTMLInputElement>('input[value="mid"]')?.checked).toBe(true);

    const smokeOption = element.querySelector<HTMLInputElement>('input[value="smoke"]');
    smokeOption?.click();
    fixture.detectChanges();
    expect(smokeOption?.checked).toBe(true);
    expect(element.querySelector<HTMLInputElement>('input[value="frag"]')?.checked).toBe(false);
    expect(element.querySelector<HTMLInputElement>('input[value="marines"]')?.checked).toBe(true);
  });

  it('renders markers for the current map and default filters', async () => {
    const { fixture, element } = await createWorkspace();
    const image = element.querySelector<HTMLImageElement>('.map-frame img');
    const markers = element.querySelectorAll<HTMLElement>('.map-marker');

    expect(image?.getAttribute('src')).toBe('/maps/backlot.webp');
    expect(markers).toHaveLength(1);
    expect(markers[0].style.left).toBe('45.2%');
    expect(markers[0].style.top).toBe('62.8%');
    expect(markers[0].dataset['utility']).toBe('frag');

    fixture.componentRef.setInput('mapAsset', '/maps/crash.webp');
    fixture.componentRef.setInput('mapName', 'crash');
    fixture.detectChanges();
    const crashMarkers = element.querySelectorAll<HTMLElement>('.map-marker');
    expect(element.querySelector<HTMLImageElement>('.map-frame img')?.getAttribute('src'))
      .toBe('/maps/crash.webp');
    expect(crashMarkers).toHaveLength(1);
    expect(crashMarkers[0].style.left).toBe('52.7%');
  });

  it('narrows markers as filters change and shows an empty state', async () => {
    const { fixture, element } = await createWorkspace();

    const noLineups = () => element.querySelector('output[aria-label="No lineups"]');

    // Default (frag / marines / mid) has a lineup on backlot.
    expect(element.querySelectorAll('.map-marker')).toHaveLength(1);

    // Frag + marines + mid has no smoke lineup, empty state shows.
    element.querySelector<HTMLInputElement>('input[value="smoke"]')?.click();
    fixture.detectChanges();
    expect(element.querySelectorAll('.map-marker')).toHaveLength(0);
    expect(noLineups()?.textContent).toContain('No lineups');

    // Loosening to 'all' teams and 'late' phase finds the river-road smoke.
    element.querySelector<HTMLInputElement>('input[value="all"]')?.click();
    fixture.detectChanges();
    element.querySelector<HTMLInputElement>('input[value="late"]')?.click();
    fixture.detectChanges();
    const lateMarkers = element.querySelectorAll<HTMLElement>('.map-marker');
    expect(lateMarkers).toHaveLength(1);
    expect(lateMarkers[0].dataset['utility']).toBe('smoke');
    expect(noLineups()).toBeNull();
  });

  it('emits a selection when a marker is clicked', async () => {
    const { fixture, element } = await createWorkspace();
    const component = fixture.componentInstance;

    const selections: string[] = [];
    component.lineupSelected.subscribe((lineup: { id: string }) => selections.push(lineup.id));

    const marker = element.querySelector<HTMLButtonElement>('.map-marker');
    marker?.click();
    fixture.detectChanges();

    expect(selections).toEqual(['backlot-f-01']);
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
