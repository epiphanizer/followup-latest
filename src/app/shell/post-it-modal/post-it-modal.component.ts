import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { formatDate } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '@app/modules/user/user.service';
import { UserMessage } from '@app/modules/user/user';
import { TeamMessageService } from '@app/modules/team/team-messages.service';
@Component({
  providers: [UserService, ToastrService],
  selector: 'app-post-it-modal',
  templateUrl: './post-it-modal.component.html',
  styleUrls: ['./post-it-modal.component.scss'],
  standalone: false
})
export class PostItModalComponent {
  createUserMessageForm: FormGroup;
  characters: number = 0;
  maxCharacters: number = 250;
  messageType: string;
  teamId: string;
  userMessage: UserMessage;
  todaysDate: string;
  todaysDateDay: number;

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private teamMessageService: TeamMessageService,
    private userMessageService: UserService,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.createForm();
    this.todaysDate = formatDate(new Date(), 'yyyy-MM-dd', 'en');
    this.todaysDateDay = parseInt(formatDate(new Date(), 'dd', 'en'));
  }

  createForm() {
    this.createUserMessageForm = this.fb.group({
      messageType: this.fb.control('user', [Validators.required]),
      messageBody: this.fb.control('', [Validators.required])
    });
    this.messageType = this.createUserMessageForm.get('messageType').value;
  }
  ngOnChanges(changes: any) {}
  selectMessageType(messageType: string) {
    this.messageType = messageType;
  }
  onTextAreaChange($event: any) {
    let formData = this.createUserMessageForm.getRawValue();
    this.characters = formData.messageBody.length;
  }
  sendTheMessage() {
    let formData = this.createUserMessageForm.getRawValue();
    this.messageType = formData.messageType;
    this.userMessage.messageBody = encodeURI(formData.messageBody);
    if (this.messageType == 'user') {
      this.userMessageService.sendUserMessage(this.userMessage).subscribe((data: any) => {
        if (data) {
          this.toastr.success('Successfully sent user message');
        } else {
          this.toastr.error('Uh oh! Something went wrong! Please try again.');
        }
        this.dismiss();
      });
    } else if (this.messageType == 'team') {
      this.teamMessageService.sendTeamMessage(this.teamId, this.userMessage).subscribe((data: any) => {
        if (data) {
          this.toastr.success('Successfully sent team message');
        } else {
          this.toastr.error('Uh oh! Something went wrong! Please try again.');
        }
        this.dismiss();
      });
    }
  }

  dismiss() {
    this.modalCtrl.dismiss({
      dismissed: true
    });
  }
}
