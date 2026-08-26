import { ElementRef } from '@angular/core';
import { DraggableModalDirective } from './draggable-modal.directive';

describe('DraggableModalDirective', () => {
  const buildDirective = () => {
    const modal = document.createElement('ion-modal');
    const shadowRoot = modal.attachShadow({ mode: 'open' });
    const content = document.createElement('div');
    content.setAttribute('part', 'content');
    content.getBoundingClientRect = jest.fn(() => ({
      left: 200,
      right: 600,
      top: 100,
      bottom: 500,
      width: 400,
      height: 400,
      x: 200,
      y: 100,
      toJSON: () => ({})
    }));
    shadowRoot.appendChild(content);
    const handle = document.createElement('div');
    handle.setPointerCapture = jest.fn();
    handle.releasePointerCapture = jest.fn();
    modal.appendChild(handle);
    document.body.appendChild(modal);

    return { directive: new DraggableModalDirective(new ElementRef(handle)), handle, modal };
  };

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('moves the modal content and keeps it inside the viewport', () => {
    const { directive, modal } = buildDirective();
    const preventDefault = jest.fn();

    directive.onPointerDown({
      button: 0,
      pointerId: 1,
      clientX: 300,
      clientY: 120,
      preventDefault
    } as any);
    directive.onPointerMove({ pointerId: 1, clientX: -1000, clientY: -1000 } as any);

    expect(preventDefault).toHaveBeenCalled();
    expect(modal.style.getPropertyValue('--followup-modal-drag-x')).toBe('-192px');
    expect(modal.style.getPropertyValue('--followup-modal-drag-y')).toBe('-92px');
  });

  it('supports keyboard movement and Escape reset', () => {
    const { directive, modal } = buildDirective();

    directive.onKeyDown({ key: 'ArrowRight', preventDefault: jest.fn() } as any);
    expect(modal.style.getPropertyValue('--followup-modal-drag-x')).toBe('16px');

    directive.onKeyDown({ key: 'Escape', preventDefault: jest.fn() } as any);
    expect(modal.style.getPropertyValue('--followup-modal-drag-x')).toBe('0px');
    expect(modal.style.getPropertyValue('--followup-modal-drag-y')).toBe('0px');
  });
});