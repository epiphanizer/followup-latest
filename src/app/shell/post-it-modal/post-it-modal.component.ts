import { Input, Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { formatDate } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '@app/modules/user/user.service';
import { UserMessage } from '@app/modules/user/user';
@Component({
  providers: [UserService, ToastrService],
  selector: 'app-post-it-modal',
  templateUrl: './post-it-modal.component.html',
  styleUrls: ['./post-it-modal.component.scss']
})
export class PostItModalComponent {
  createUserMessageForm: FormGroup;
  userMessage: UserMessage;
  todaysDate: string;
  todaysDateDay: number;

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private userMessageService: UserService,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    console.log(this.userMessage);
    this.createForm();
    this.todaysDate = formatDate(new Date(), 'yyyy-MM-dd', 'en');
    this.todaysDateDay = parseInt(formatDate(new Date(), 'dd', 'en'));
  }

  createForm() {
    this.createUserMessageForm = this.fb.group({
      messageBody: this.fb.control('', [Validators.required])
    });
  }
  sendTheMessage() {
    let formData = this.createUserMessageForm.getRawValue();
    this.userMessage.messageBody = formData.messageBody;
    this.userMessageService.sendUserMessage(this.userMessage).subscribe((data: any) => {
      console.log(data);
      if (data) {
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
