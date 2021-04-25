import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[inputCapitalizeFirst]'
})
export class CapitalizeFirstDirective {
  constructor(private ref: ElementRef) {}
  @HostListener('input', ['$event'])
  onInput(event: any): void {
    if (event.target.value.length === 1) {
      const inputValue = event.target.value;
      this.ref.nativeElement.value = inputValue.charAt(0).toUpperCase() + inputValue.substring(1);
    }
  }
}
