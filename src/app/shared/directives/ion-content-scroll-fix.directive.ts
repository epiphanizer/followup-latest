import { AfterViewInit, Directive, Optional } from '@angular/core';
import { IonContent } from '@ionic/angular';

// Apply to every ion-content to normalize scroll behavior
@Directive({
  selector: 'ion-content',
  standalone: false
})
export class IonContentScrollFixDirective implements AfterViewInit {
  constructor(@Optional() private ionContent: IonContent) {}

  ngAfterViewInit(): void {
    if (!this.ionContent) {
      return;
    }

    // Enforce scroll overflow on the inner element to avoid Chrome/Ionic regressions
    this.ionContent.getScrollElement().then(scrollEl => {
      scrollEl.style.overflow = 'auto';
      scrollEl.style.overflowY = 'scroll';
      scrollEl.style.height = '100%';
    });
  }
}
