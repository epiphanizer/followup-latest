import { Component, OnInit } from '@angular/core';
import { Patient } from '@app/modules/patient/patient';
import { PatientCall } from '../patient-detail/patient-call/patient-call.service';
import { ActivatedRoute } from '@angular/router';
import { User } from '@app/modules/user/user';
import { Operation } from '@app/modules/operation/operation';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { NotificationService } from '@app/modules/notification/notification.service';
import { Notification } from '@app/modules/notification/notification';
import { MenuService } from '@app/shared/menu/menu.service';

@Component({
  providers: [NotificationService],
  selector: 'app-patient-history-detail',
  templateUrl: './patient-history-detail.component.html',
  styleUrls: ['./patient-history-detail.component.scss']
})
export class PatientHistoryDetailComponent implements OnInit {
  user: User;
  patient: Patient = null;
  operation: Operation;
  patientNotifications: Notification[];
  patientNotifications$: Observable<Notification[]> | null = null;

  constructor(
    private menuService: MenuService,
    private notificationService: NotificationService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.user = this.route.snapshot.data.user;
    this.patient = this.route.snapshot.data.patient;
    this.menuService.patientId = this.patient.patientId;
    this.menuService.operationId = this.patient.patientOperationId;
    this.patientNotifications$ = this.notificationService.getNotificationsByPatientId(this.patient.patientId).pipe(
      take(1),
      map((notifications: Notification[]) => {
        this.patientNotifications = notifications;
        return notifications;
      })
    );
    this.patient.patientCalls$.subscribe((patientCalls: PatientCall[]) => {
      this.patient.patientCalls = patientCalls;
    });
  }
}
