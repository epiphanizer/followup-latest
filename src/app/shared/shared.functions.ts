export class SharedFunctions {
  public returnHTML(value: string): string {
    return value
      .replace(/%0A/g, '<br/><br/>')
      .replace(/%20/g, ' ')
      .replace(/%22/g, '"')
      .replace(/%25/g, '%')
      .replace(/%E2%80%A2/g, '&#8226;')
      .replace(/%E2%80%94/g, '-');
  }
}
