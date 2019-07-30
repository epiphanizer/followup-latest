import { Component, OnInit, Input } from '@angular/core';
import { User } from '@app/modules/user/user.service';

import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-call-queue',
  templateUrl: './call-queue.component.html',
  styleUrls: ['./call-queue.component.scss']
})
export class CallQueueComponent implements OnInit {
  user: User;
  constructor(private route: ActivatedRoute) {}
  ngOnInit() {}
}
