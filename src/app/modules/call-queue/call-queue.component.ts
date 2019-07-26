import { Component, OnInit } from '@angular/core';

import { formatDate } from '@angular/common';

@Component({
  selector: 'app-call-queue',
  templateUrl: './call-queue.component.html',
  styleUrls: ['./call-queue.component.scss']
})
export class CallQueueComponent implements OnInit {
  constructor() {}
  todaysDateDay: number;
  ngOnInit() {
    this.todaysDateDay = parseInt(formatDate(new Date(), 'dd', 'en'));
  }
  /**
   * Switch the call queue view to a new operation
   */
}
