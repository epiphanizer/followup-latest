import { FormBuilder } from '@angular/forms';
import { PatientCallNotesComponent } from './patient-call-notes.component';

describe('PatientCallNotesComponent (Jest)', () => {
  it('creates the form and emits encoded notes changes', () => {
    const comp = new PatientCallNotesComponent(new FormBuilder());
    const emitSpy = jest.spyOn(comp.patientCallNotesChangeEmitter, 'emit');

    comp.ngOnInit();
    comp.patientCallNotesForm.get('patientCallNotes')?.setValue('hello world');

    expect(comp.patientCallNotes.patientCallNotes).toBe(encodeURI('hello world'));
    expect(emitSpy).toHaveBeenCalledWith({ patientCallNotes: encodeURI('hello world') });
  });

  it('toggles highlighted state and emits flag', () => {
    const comp = new PatientCallNotesComponent(new FormBuilder());
    const emitSpy = jest.spyOn(comp.patientCallNotesHighlightedChangeEmitter, 'emit');

    comp.ngOnInit();
    comp.highlightPatientCallNotes();
    comp.highlightPatientCallNotes();

    expect(emitSpy).toHaveBeenNthCalledWith(1, 1);
    expect(emitSpy).toHaveBeenNthCalledWith(2, 0);
  });
});
