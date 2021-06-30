import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[inputAddPhoneDashes]'
})
export class AddPhoneDashesDirective {
  constructor(private ref: ElementRef) {}
  @HostListener('input', ['$event'])
  onInput(event: any): void {
    console.log(event);
    (String as any).prototype.insert = function(index: number, string: string) {
      if (index > 0) {
        return this.substring(0, index) + string + this.substr(index);
      }
      return string + this;
    };

    if (event.target.value.length > 3) {
      const inputValue = event.target.value;
      console.log(inputValue.insert(3, '-'));
      this.ref.nativeElement.value = inputValue.insert(3, '-');
    }
  }
}
