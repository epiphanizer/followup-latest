export class SharedFunctions {
  public returnHTML(value: string): string {
    return value
      .replace(/%0A/g, '<br/><br/>')
      .replace(/%20/g, '&nbsp;')
      .replace(/%22/g, '"');
  }
}
