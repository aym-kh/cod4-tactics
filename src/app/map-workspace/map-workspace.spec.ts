import { TestBed } from '@angular/core/testing';
import { MapWorkspace } from './map-workspace';

describe('MapWorkspace', () => {
  it('renders enabled, independently selectable radio groups', async () => {
    await TestBed.configureTestingModule({
      imports: [MapWorkspace],
    }).compileComponents();

    const fixture = TestBed.createComponent(MapWorkspace);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

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
    expect(phaseOptions).toHaveLength(3);
    expect([...utilityOptions, ...teamOptions, ...phaseOptions].every((option) => !option.disabled)).toBe(true);
    expect(element.querySelector<HTMLInputElement>('input[value="frag"]')?.checked).toBe(true);
    expect(element.querySelector<HTMLInputElement>('input[value="marines"]')?.checked).toBe(true);
    expect(element.querySelector<HTMLInputElement>('input[value="mid"]')?.checked).toBe(true);

    const smokeOption = element.querySelector<HTMLInputElement>('input[value="smoke"]');
    smokeOption?.click();
    expect(smokeOption?.checked).toBe(true);
    expect(element.querySelector<HTMLInputElement>('input[value="frag"]')?.checked).toBe(false);
    expect(element.querySelector<HTMLInputElement>('input[value="marines"]')?.checked).toBe(true);
  });
});
