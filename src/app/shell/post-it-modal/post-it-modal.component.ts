import { Input, Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { formatDate } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { TeamMessageService } from '@app/modules/team/team-messages.service';
import { TeamMessage } from '@app/modules/team/team';
@Component({
  providers: [TeamMessageService, ToastrService],
  selector: 'app-post-it-modal',
  templateUrl: './post-it-modal.component.html',
  styleUrls: ['./post-it-modal.component.scss']
})
export class PostItModalComponent {
  createTeamMessageForm: FormGroup;
  teamMessage: TeamMessage;
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
    this.teamMessage = {
      teamId: null,
      teamMessageId: null,
      teamMessageRecipientId: null,
      teamMessageFromId: null,
      teamMessageContent: null
    };
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

    this.teamMessage.teamMessageContent = formData.teamMessageContent;
    this.teamMessageService.sendTeamMessage(this.teamMessage).subscribe((data: any) => {
      let teamMessageId = data.teamMessageId;
      if (teamMessageId) {
        this.toastr.success('Successfully sent team message');
      } else {
        this.toastr.error('Uh oh! Something went wrong! Please try again.');
      }
      this.dismiss();
    });
  }

  dismiss() {
    this.modalCtrl.dismiss({
      dismissed: true
    });
  }
}
