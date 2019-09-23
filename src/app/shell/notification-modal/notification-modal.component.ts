import { Input, Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NotificationService } from '@app/modules/notification/notification.service';
import { Notification } from '@app/modules/notification/notification';
import { Patient } from '@app/modules/patient/patient';
import { formatDate } from '@angular/common';
import { FormGroup, FormBuilder } from '@angular/forms';
@Component({
  providers: [NotificationService],
  selector: 'app-notification-modal',
  templateUrl: './notification-modal.component.html',
  styleUrls: ['./notification-modal.component.scss']
})
export class NotificationModalComponent {
  createNotificationForm!: FormGroup;
  @Input() patient: Patient;
  notification: Notification;
  notificationTypes: {
    notificationTypeLabelId: number;
    notificationTypeLabel: string;
  }[] = [];
  notificationTypesListLeft: {
    notificationTypeLabelId: number;
    notificationTypeLabel: string;
  }[] = [];
  notificationTypesListRight: {
    notificationTypeLabelId: number;
    notificationTypeLabel: string;
  }[] = [];
  status: {
    notification: {
      saved: boolean;
    };
  } = {
    notification: {
      saved: false
    }
  };
  todaysDateDay: number;

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    // this.notification.notificationPatientFirstName = this.patient.patientFirstName;
    // this.notification.notificationPatientLastName = this.patient.patientLastName;
    this.notificationService.getNotificationTypes().subscribe((data: any) => {
      this.notificationTypes = data;
      var i;
      for (i = 0; i <= this.notificationTypes.length; i = i + 2) {
        if (this.notificationTypes[i] !== undefined) {
          this.notificationTypesListLeft.push(this.notificationTypes[i]);
          this.notificationTypesListRight.push(this.notificationTypes[i + 1]);
        }
      }

      this.todaysDateDay = parseInt(formatDate(new Date(), 'dd', 'en'));
      this.createForm();
    });
  }
  createForm() {
    // this.notificationService.createNotification();
    this.createNotificationForm = this.fb.group({
      notificationTypeId: this.fb.control(''),
      notificationMessage: this.fb.control('')
    });
  }
  editNotification() {
    this.status.notification.saved = false;
  }
  saveNotification() {
    this.notification = {
      // stub
      notificationId: 25,
      notificationTypeId: this.createNotificationForm.controls.notificationTypeId.value,
      notificationMessage: this.createNotificationForm.controls.notificationMessage.value
    };
    this.status.notification.saved = true;
    // this.notificationService.saveNotificationByPatientId(this.patient.patientId);
    // We will want to subscribe here
  }
  sendNotification() {
    alert('sending notification');
    this.notificationService.sendNotificationByNotificationId(this.notification.notificationId);
    this.dismiss();
  }
  dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalCtrl.dismiss({
      dismissed: true
    });
  }
}
