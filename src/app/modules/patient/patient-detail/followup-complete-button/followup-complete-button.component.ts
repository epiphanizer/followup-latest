import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Patient } from '@app/modules/patient/patient';
import { FollowupCompleteModalComponent } from '../followup-complete-modal/followup-complete-modal.component';
import { PatientCall } from '../patient-call/patient-call.service';

@Component({
  selector: 'app-followup-complete-button',
  templateUrl: './followup-complete-button.component.html',
  styleUrls: ['./followup-complete-button.component.scss'],
  standalone: false
})
export class FollowupCompleteButtonComponent implements OnInit {
  @Input() patient: Patient;
  @Input() patientCall: PatientCall;
  @Input() disabled: boolean = false;
  @Output() patientCallFinalizeEventEmitter = new EventEmitter<PatientCall>();
  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {}
  async createFollowupCompleteModal(patient: Patient) {
    if (this.disabled) {
      return;
    }

    const modal = await this.modalCtrl.create({
      component: FollowupCompleteModalComponent,
      cssClass: 'followup-modal',
      componentProps: {
        patient: this.patient
      }
    });
    modal.onDidDismiss().then(data => {
      if (!data.data.dismissed) {
        this.patientCallFinalizeEventEmitter.emit(this.patientCall);
      }
    });
    await modal.present();
  }
}
