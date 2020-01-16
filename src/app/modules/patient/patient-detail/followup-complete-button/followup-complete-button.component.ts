import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Patient } from '@app/modules/patient/patient';
import { FollowupCompleteModalComponent } from '../followup-complete-modal/followup-complete-modal.component';
import { PatientStatusService } from '../../patient-status.service';
import { PatientCall } from '../patient-call/patient-call.service';

@Component({
  providers: [PatientStatusService],
  selector: 'app-followup-complete-button',
  templateUrl: './followup-complete-button.component.html',
  styleUrls: ['./followup-complete-button.component.scss']
})
export class FollowupCompleteButtonComponent implements OnInit {
  @Input() patient: Patient;
  @Input() patientCall: PatientCall;
  @Output() patientCallFinalizeEventEmitter = new EventEmitter<PatientCall>();
  constructor(private modalCtrl: ModalController, private patientStatusService: PatientStatusService) {}

  ngOnInit() {}
  async createFollowupCompleteModal(patient: Patient) {
    const modal = await this.modalCtrl.create({
      component: FollowupCompleteModalComponent,
      cssClass: 'followup-modal',
      componentProps: {
        patient: this.patient
      }
    });
    modal.onDidDismiss().then(data => {
      console.log(data);
      console.log('dimissed modal');
      this.patientCallFinalizeEventEmitter.emit(this.patientCall);
    });
    await modal.present();
  }
}
