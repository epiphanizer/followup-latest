import { AddPhoneDashesDirective } from './add-phone-dashes.directive';

describe('AddPhoneDashesDirective', () => {
  const build = (value: string) => {
    const host = { nativeElement: { value } } as any;
    const directive = new AddPhoneDashesDirective(host);
    return { host, directive };
  };

  it('inserts a dash after three digits', () => {
    const { host, directive } = build('123');
    const event = { target: { value: '123' } } as any;

    directive.onInput(event);

    expect(host.nativeElement.value).toBe('123-');
  });

  it('strips non-numeric characters except dash', () => {
    const { host, directive } = build('12a3b');
    const event = { target: { value: '12a3b' } } as any;

    directive.onInput(event);

    expect(host.nativeElement.value).toBe('123');
  });
});
