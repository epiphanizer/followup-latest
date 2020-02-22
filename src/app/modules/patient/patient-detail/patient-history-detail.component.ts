import { Component, OnInit, ViewChild } from '@angular/core';
import { Patient } from '@app/modules/patient/patient';
import {
  PatientCall,
  PatientCallService,
  PatientCallQuestionAnswer
} from '../patient-detail/patient-call/patient-call.service';
import { ActivatedRoute, Router, NavigationEnd, Event } from '@angular/router';
import { User } from '@app/user';
import { Operation } from '@app/modules/operation/operation';
import {
  PatientCallNotesService,
  PatientCallNotes
} from './patient-call/patient-call-notes/patient-call-notes.service';
import {
  PatientCallQuestionsService,
  PatientCallQuestion
} from './patient-call/patient-call-questions/patient-call-questions.service';
import { PatientCallStatus } from './patient-call/patient-call-status.service';
import { formatDate } from '@angular/common';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { NotificationService } from '@app/modules/notification/notification.service';
import { Notification } from '@app/modules/notification/notification';

@Component({
  providers: [NotificationService],
  selector: 'app-patient-detail',
  templateUrl: './patient-detail.component.html',
  styleUrls: ['./patient-detail.component.scss']
})
export class PatientHistoryDetailComponent implements OnInit {
  user: User;
  patient: Patient = null;
  operation: Operation;
  patientNotifications: Notification[];
  patientNotifications$: Observable<Notification[]> | null = null;

  constructor(private notificationService: NotificationService, private route: ActivatedRoute) {}

  ngOnInit() {
    if (this.patient !== null) {
      location.reload();
    }
    this.user = this.route.snapshot.data.user;
    this.patient = this.route.snapshot.data.patient;
    this.patientNotifications$ = this.notificationService.getNotificationsByPatientId(this.patient.patientId).pipe(
      take(1),
      map((notifications: Notification[]) => {
        this.patientNotifications = notifications;
        return notifications;
      })
    );
  }
}
