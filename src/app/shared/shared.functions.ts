export class SharedFunctions {
  public returnHTML(value: string): string {
    return value
      .replace(/%0A/g, '</p>')
      .replace(/%20/g, ' ')
      .replace(/%22/g, '"')
      .replace(/%25/g, '%')
      .replace(/%E2%80%A2/g, '&#8226;')
      .replace(/%E2%80%94/g, '-')
      .replace(/%E2%80%98/g, "'")
      .replace(/%E2%80%99/g, "'");
  }
}
