import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appDraggableModal]',
  standalone: false
})
export class DraggableModalDirective {
  private readonly viewportMargin = 8;
  private activePointerId: number | null = null;
  private modalElement: HTMLElement | null = null;
  private contentElement: HTMLElement | null = null;
  private startClientX = 0;
  private startClientY = 0;
  private startOffsetX = 0;
  private startOffsetY = 0;
  private baseRect: { left: number; right: number; top: number; bottom: number } | null = null;

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  @HostListener('pointerdown', ['$event'])
  onPointerDown(event: PointerEvent) {
    if (event.button !== 0 || !this.resolveModalElements()) {
      return;
    }

    const rect = this.contentElement!.getBoundingClientRect();
    this.startOffsetX = this.readOffset('--followup-modal-drag-x');
    this.startOffsetY = this.readOffset('--followup-modal-drag-y');
    this.baseRect = {
      left: rect.left - this.startOffsetX,
      right: rect.right - this.startOffsetX,
      top: rect.top - this.startOffsetY,
      bottom: rect.bottom - this.startOffsetY
    };
    this.startClientX = event.clientX;
    this.startClientY = event.clientY;
    this.activePointerId = event.pointerId;
    this.elementRef.nativeElement.classList.add('is-dragging');
    this.elementRef.nativeElement.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  }

  @HostListener('document:pointermove', ['$event'])
  onPointerMove(event: PointerEvent) {
    if (this.activePointerId !== event.pointerId || !this.baseRect) {
      return;
    }

    this.setPosition(
      this.startOffsetX + event.clientX - this.startClientX,
      this.startOffsetY + event.clientY - this.startClientY
    );
  }

  @HostListener('document:pointerup', ['$event'])
  @HostListener('document:pointercancel', ['$event'])
  onPointerEnd(event: PointerEvent) {
    if (this.activePointerId !== event.pointerId) {
      return;
    }

    this.elementRef.nativeElement.releasePointerCapture?.(event.pointerId);
    this.elementRef.nativeElement.classList.remove('is-dragging');
    this.activePointerId = null;
    this.baseRect = null;
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const movementByKey: Record<string, [number, number]> = {
      ArrowLeft: [-16, 0],
      ArrowRight: [16, 0],
      ArrowUp: [0, -16],
      ArrowDown: [0, 16]
    };

    if (event.key === 'Escape' && this.resolveModalElements()) {
      this.applyOffset(0, 0);
      event.preventDefault();
      return;
    }

    const movement = movementByKey[event.key];
    if (!movement || !this.resolveModalElements()) {
      return;
    }

    const rect = this.contentElement!.getBoundingClientRect();
    const currentX = this.readOffset('--followup-modal-drag-x');
    const currentY = this.readOffset('--followup-modal-drag-y');
    this.baseRect = {
      left: rect.left - currentX,
      right: rect.right - currentX,
      top: rect.top - currentY,
      bottom: rect.bottom - currentY
    };
    this.setPosition(currentX + movement[0], currentY + movement[1]);
    this.baseRect = null;
    event.preventDefault();
  }

  private resolveModalElements(): boolean {
    this.modalElement = this.elementRef.nativeElement.closest('ion-modal') as HTMLElement | null;
    this.contentElement =
      (this.modalElement?.shadowRoot?.querySelector('[part="content"]') as HTMLElement | null) || null;
    return !!this.modalElement && !!this.contentElement;
  }

  private setPosition(offsetX: number, offsetY: number) {
    if (!this.baseRect) {
      return;
    }

    const boundedX = this.clamp(
      offsetX,
      this.viewportMargin - this.baseRect.left,
      window.innerWidth - this.viewportMargin - this.baseRect.right
    );
    const boundedY = this.clamp(
      offsetY,
      this.viewportMargin - this.baseRect.top,
      window.innerHeight - this.viewportMargin - this.baseRect.bottom
    );
    this.applyOffset(boundedX, boundedY);
  }

  private applyOffset(offsetX: number, offsetY: number) {
    this.modalElement?.style.setProperty('--followup-modal-drag-x', Math.round(offsetX) + 'px');
    this.modalElement?.style.setProperty('--followup-modal-drag-y', Math.round(offsetY) + 'px');
  }

  private readOffset(propertyName: string): number {
    return parseFloat(this.modalElement?.style.getPropertyValue(propertyName) || '0') || 0;
  }

  private clamp(value: number, minimum: number, maximum: number): number {
    return Math.min(Math.max(value, minimum), maximum);
  }
}