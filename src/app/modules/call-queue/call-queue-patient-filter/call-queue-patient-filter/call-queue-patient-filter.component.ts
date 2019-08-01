import { Component, OnInit } from '@angular/core';

import { User, UserService } from '@app/modules/user/user.service';

import { AuthenticationService } from '@app/core';

@Component({
  providers: [AuthenticationService, UserService],
  selector: 'app-call-queue-patient-filter',
  templateUrl: './call-queue-patient-filter.component.html',
  styleUrls: ['./call-queue-patient-filter.component.scss']
})
export class CallQueuePatientFilterComponent implements OnInit {
  user: User;
  constructor(private authService: AuthenticationService) {}
  ngOnInit() {
    this.authService.getUser().then((result: any) => {
      this.user = this.authService.user;
    });
  }
}
