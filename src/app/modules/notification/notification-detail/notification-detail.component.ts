import { Component, OnInit } from '@angular/core';
import { Notification } from '../notification';
import { ActivatedRoute } from '@angular/router';
import { Patient } from '@app/modules/patient/patient';
import { PatientService } from '@app/modules/patient/patient.service';

@Component({
  selector: 'app-notification-detail',
  templateUrl: './notification-detail.component.html',
  styleUrls: ['./notification-detail.component.scss']
})
export class NotificationDetailComponent implements OnInit {
  notification: Notification;
  patient: Patient;
  constructor(private route: ActivatedRoute, private patientService: PatientService) {}

  ngOnInit() {
    this.notification = this.route.snapshot.data.notification;
    this.patientService.getPatientByPatientId(this.notification.notificationPatientId).subscribe((patient: Patient) => {
      this.patient = patient[0];
    });
  }
}
