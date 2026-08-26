import { FormBuilder } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
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

  it('enables native writing assistance on the Edit & Review Call notes field', async () => {
    await TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), ReactiveFormsModule],
      declarations: [PatientCallNotesComponent]
    }).compileComponents();

    const fixture: ComponentFixture<PatientCallNotesComponent> = TestBed.createComponent(PatientCallNotesComponent);
    const component = fixture.componentInstance;
    component.patientCall = { patientCallStatusLabel: 'In Review' } as any;
    fixture.detectChanges();

    const textarea = fixture.nativeElement.querySelector('ion-textarea') as HTMLElement;

    expect(fixture.nativeElement.textContent).toContain('Edit & Review Call');
    expect(textarea.getAttribute('spellcheck')).toBe('true');
    expect((textarea as any).spellcheck).toBe(true);
    expect(textarea.getAttribute('autocomplete')).toBe('on');
    expect(textarea.getAttribute('autocorrect')).toBe('on');
    expect(textarea.getAttribute('autocapitalize')).toBe('sentences');
  });
});
