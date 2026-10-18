import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the workspace structure', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('#navigation-panel')).toBeTruthy();
    expect(compiled.querySelector('.map-viewport')).toBeTruthy();
    expect(compiled.querySelector('#details-panel')).toBeTruthy();
  });

  it('should display the selected map in the map viewer', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    const mapImage = compiled.querySelector<HTMLImageElement>('.map-frame img');
    expect(mapImage?.getAttribute('src')).toBe('/maps/backlot.webp');

    const crashButton = [...compiled.querySelectorAll<HTMLButtonElement>('#navigation-panel button')]
      .find((button) => button.textContent?.trim() === 'crash');
    expect(crashButton).toBeTruthy();

    crashButton?.click();
    fixture.detectChanges();

    const selectedReloaded = compiled.querySelector<HTMLImageElement>('.map-frame img');
    expect(selectedReloaded?.getAttribute('src')).toBe('/maps/crash.webp');
    expect(crashButton?.classList.contains('is-selected')).toBe(true);
  });
});
