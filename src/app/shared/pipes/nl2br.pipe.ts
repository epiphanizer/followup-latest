import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'newLines'
})
export class nl2brPipe implements PipeTransform {
  transform(value: string): string {
    value.replace(/%0A/g, '<br/><br/>').replace(/%20/g, '&nbsp;');
    return value;
  }
}
