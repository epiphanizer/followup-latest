import { IonContentScrollFixDirective } from './ion-content-scroll-fix.directive';

describe('IonContentScrollFixDirective', () => {
  it('normalizes the scroll element styles when IonContent is available', async () => {
    const scrollEl = { style: {} as Record<string, string> };
    const ionContent = { getScrollElement: jest.fn().mockResolvedValue(scrollEl) } as any;
    const directive = new IonContentScrollFixDirective(ionContent);

    directive.ngAfterViewInit();
    await Promise.resolve();

    expect(ionContent.getScrollElement).toHaveBeenCalled();
    expect(scrollEl.style.overflow).toBe('auto');
    expect(scrollEl.style.overflowY).toBe('scroll');
    expect(scrollEl.style.height).toBe('100%');
  });

  it('does nothing when applied without IonContent', () => {
    const directive = new IonContentScrollFixDirective(undefined as any);

    expect(() => directive.ngAfterViewInit()).not.toThrow();
  });
});
