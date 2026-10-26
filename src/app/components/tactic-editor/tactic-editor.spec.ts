import { TestBed } from '@angular/core/testing';
import { TacticEditor } from './tactic-editor';
import { TacticEditorService } from '../../services/tactic-editor.service';

function stubClipboard(): { writeText: ReturnType<typeof vi.fn> } {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  });
  return { writeText };
}

function stubDownload(): () => void {
  const create = vi.fn().mockReturnValue('blob:stub');
  const revoke = vi.fn();
  Object.defineProperty(URL, 'createObjectURL', { value: create, configurable: true });
  Object.defineProperty(URL, 'revokeObjectURL', { value: revoke, configurable: true });
  return () => {
    create.mockReset();
    revoke.mockReset();
  };
}

describe('TacticEditor', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function createEditor() {
    await TestBed.configureTestingModule({
      imports: [TacticEditor],
    }).compileComponents();

    const fixture = TestBed.createComponent(TacticEditor);
    fixture.detectChanges();
    await fixture.whenStable();
    return {
      fixture,
      element: fixture.nativeElement as HTMLElement,
      editor: TestBed.inject(TacticEditorService),
    };
  }

  it('stays off-canvas until opened, and the toggle opens it', async () => {
    const { fixture, element, editor } = await createEditor();

    expect(editor.open()).toBe(false);
    expect(element.querySelector('#tactic-editor')?.classList).not.toContain('is-open');

    editor.setOpen(true);
    fixture.detectChanges();
    expect(element.querySelector('#tactic-editor')?.classList).toContain('is-open');
  });

  it('renders defaults and blocks export until name and start exist', async () => {
    const { element, editor } = await createEditor();

    const preview = element.querySelector<HTMLPreElement>('.editor-preview pre');
    expect(preview?.textContent).toContain('"utility": "frag"');
    expect(preview?.textContent).toContain('"stance": "standing"');
    expect(preview?.textContent).toContain('"start": null');
    expect(preview?.textContent).toContain('"landing": null');
    expect(preview?.textContent).toContain('"positionImage": null');
    expect(preview?.textContent).toContain('"alignmentImage": null');

    const copy = element.querySelector<HTMLButtonElement>('[aria-label="Copy tactic JSON"]');
    const download = element.querySelector<HTMLButtonElement>('[aria-label="Download tactic JSON"]');
    expect(copy?.disabled).toBe(true);
    expect(download?.disabled).toBe(true);
    expect(editor.isValid()).toBe(false);
  });

  it('builds, copies and downloads a complete tactic', async () => {
    const { fixture, element, editor } = await createEditor();
    const clipboard = stubClipboard();
    stubDownload();

    const nameInput = element.querySelector<HTMLInputElement>('#tactic-name')!;
    nameInput.value = 'A-site frag from double';
    nameInput.dispatchEvent(new Event('input', { bubbles: true }));
    const positionImageInput = element.querySelector<HTMLInputElement>('#tactic-position-image')!;
    positionImageInput.value = '/tactics/images/position.jpg';
    positionImageInput.dispatchEvent(new Event('input', { bubbles: true }));
    const alignmentImageInput = element.querySelector<HTMLInputElement>('#tactic-alignment-image')!;
    alignmentImageInput.value = '/tactics/images/alignment.jpg';
    alignmentImageInput.dispatchEvent(new Event('input', { bubbles: true }));

    editor.setPoint('start', { x: 45.2, y: 62.8 });
    fixture.detectChanges();
    expect(editor.isValid()).toBe(true);

    const preview = element.querySelector<HTMLPreElement>('.editor-preview pre');
    expect(preview?.textContent).toContain('"name": "A-site frag from double"');
    expect(preview?.textContent).toContain('"start": {\n    "x": 45.2');
    expect(preview?.textContent).toContain('"positionImage": "/tactics/images/position.jpg"');
    expect(preview?.textContent).toContain('"alignmentImage": "/tactics/images/alignment.jpg"');
    expect(preview?.textContent).toContain('"id": "backlot-frag-');

    const copy = element.querySelector<HTMLButtonElement>('[aria-label="Copy tactic JSON"]')!;
    copy.click();
    fixture.detectChanges();
    await clipboard.writeText.mock.results[0]!.value;
    fixture.detectChanges();
    expect(clipboard.writeText).toHaveBeenCalledOnce();
    expect(copy.textContent).toContain('Copied');

    const download = element.querySelector<HTMLButtonElement>('[aria-label="Download tactic JSON"]')!;
    download.click();
    fixture.detectChanges();
    expect(URL.createObjectURL).toHaveBeenCalledOnce();
    expect(URL.revokeObjectURL).toHaveBeenCalledOnce();
    vi.restoreAllMocks();
  });

  it('switches placing targets and clears individual markers', async () => {
    const { fixture, element, editor } = await createEditor();
    editor.setOpen(true);
    fixture.detectChanges();

    editor.placePoint({ x: 10, y: 20 });
    fixture.detectChanges();
    expect(editor.start()).toEqual({ x: 10, y: 20 });
    expect(editor.placingTarget()).toBe('landing');

    const clearStart = element.querySelector<HTMLButtonElement>('[aria-label="Clear start marker"]')!;
    clearStart.click();
    fixture.detectChanges();
    expect(editor.start()).toBeNull();

    // Placing again after clearing respects the picker, not the auto-advance.
    const startSegment = element.querySelectorAll<HTMLButtonElement>('[aria-label="Placing target"] button')[0]!;
    startSegment.click();
    fixture.detectChanges();
    editor.placePoint({ x: 5, y: 5 });
    expect(editor.start()).toEqual({ x: 5, y: 5 });
    expect(editor.landing()).toBeNull();
  });

  it('resets the draft back to defaults', async () => {
    const { element, editor } = await createEditor();
    editor.setOpen(true);
    editor.placePoint({ x: 10, y: 20 });
    editor.reset();
    expect(editor.start()).toBeNull();
    expect(editor.placingTarget()).toBe('start');
    expect(editor.isValid()).toBe(false);

    const close = element.querySelector<HTMLButtonElement>('[aria-label="Close editor"]')!;
    close.click();
    expect(editor.open()).toBe(false);
  });
});
