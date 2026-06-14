import { FollowupCompleteButtonComponent } from './followup-complete-button.component';

describe('FollowupCompleteButtonComponent (Jest)', () => {
  it('opens modal and emits finalize when not dismissed', async () => {
    const onDidDismiss = jest.fn(() => Promise.resolve({ data: { dismissed: false } }));
    const present = jest.fn();
    const modal = { onDidDismiss, present } as any;
    const modalCtrl = { create: jest.fn(() => Promise.resolve(modal)) } as any;
    const comp = new FollowupCompleteButtonComponent(modalCtrl as any);
    comp.patientCall = { patientCallId: 'pc-1' } as any;
    const emitSpy = jest.spyOn(comp.patientCallFinalizeEventEmitter, 'emit');

    await comp.createFollowupCompleteModal({} as any);

    expect(modalCtrl.create).toHaveBeenCalled();
    expect(onDidDismiss).toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalledWith({ patientCallId: 'pc-1' });
  });
});
