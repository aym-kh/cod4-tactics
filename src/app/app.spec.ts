import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the three-column workspace structure', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('#navigation-panel')).toBeTruthy();
    expect(compiled.querySelector('.map-canvas')).toBeTruthy();
    expect(compiled.querySelector('#details-panel')).toBeTruthy();
  });

  it('should open only one side panel at a time', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const navigationToggle = compiled.querySelector<HTMLButtonElement>(
      '[aria-controls="navigation-panel"]',
    );
    const detailsToggle = compiled.querySelector<HTMLButtonElement>(
      '[aria-controls="details-panel"]',
    );
    const navigationPanel = compiled.querySelector('#navigation-panel');
    const detailsPanel = compiled.querySelector('#details-panel');

    navigationToggle?.click();
    await fixture.whenStable();
    expect(navigationPanel?.classList.contains('is-open')).toBe(true);
    expect(navigationToggle?.getAttribute('aria-expanded')).toBe('true');

    detailsToggle?.click();
    await fixture.whenStable();
    expect(detailsPanel?.classList.contains('is-open')).toBe(true);
    expect(navigationPanel?.classList.contains('is-open')).toBe(false);
    expect(detailsToggle?.getAttribute('aria-expanded')).toBe('true');
    expect(navigationToggle?.getAttribute('aria-expanded')).toBe('false');
  });
});
