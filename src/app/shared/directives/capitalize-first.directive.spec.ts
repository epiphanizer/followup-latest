import { CapitalizeFirstDirective } from './capitalize-first.directive';

describe('CapitalizeFirstDirective', () => {
  const build = (value: string = '') => {
    const host = { nativeElement: { value } } as any;
    const directive = new CapitalizeFirstDirective(host);
    return { host, directive };
  };

  it('uppercases the first character when the first keystroke is entered', () => {
    const { host, directive } = build();
    const event = { target: { value: 'h' } } as any;

    directive.onInput(event);

    expect(host.nativeElement.value).toBe('H');
  });

  it('does nothing when more than one character is already present', () => {
    const { host, directive } = build('Hello');
    const event = { target: { value: 'Hello' } } as any;

    directive.onInput(event);

    expect(host.nativeElement.value).toBe('Hello');
  });
});
