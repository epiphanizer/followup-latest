import { Input, Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { formatDate } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { OperationContact } from '@app/modules/operation/operation-contact/operation-contact';
import { OperationContactsService } from '@app/modules/operation/operation-contacts.service';
import { ToastrService } from 'ngx-toastr';
import { TeamMessageService } from '@app/modules/team/team-messages.service';
@Component({
  providers: [TeamMessageService, ToastrService],
  selector: 'app-post-it-modal',
  templateUrl: './post-it-modal.component.html',
  styleUrls: ['./post-it-modal.component.scss']
})
export class PostItModalComponent {
  createTeamMessageForm: FormGroup;

  todaysDate: string;
  todaysDateDay: number;

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private teamMessageService: TeamMessageService,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.createForm();
    this.todaysDate = formatDate(new Date(), 'yyyy-MM-dd', 'en');
    this.todaysDateDay = parseInt(formatDate(new Date(), 'dd', 'en'));
  }

  createForm() {
    this.createTeamMessageForm = this.fb.group({
      teamMessageId: this.fb.control(false, [Validators.required]),
      teamMessageContent: this.fb.control('', [Validators.required])
    });
  }
  sendTheMessage() {
    let formData = this.createTeamMessageForm.getRawValue();

    // this.notification.notificationTypeId = parseInt(formData.notificationTypeId);

    // this.teamMessageForm.teamMessageContent = formData.notificationMessage;
    // this.notificationService
    //   .addNotificationByOperationIdAndNotificationTypeId(this.notification)
    //   .subscribe((data: any) => {
    //     let notificationId = data.notificationId;
    //     /**
    //      * If successful, actually email out the notification
    //      */
    //     this.notificationService.sendNotificationByNotificationId(notificationId).subscribe(() => {
    //       this.toastr.success('Successfully sent notification!');
    //     });
    //     this.dismiss();
    //   });
  }

  dismiss() {
    this.modalCtrl.dismiss({
      dismissed: true
    });
  }
}
