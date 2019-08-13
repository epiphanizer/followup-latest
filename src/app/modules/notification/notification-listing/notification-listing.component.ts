import { Component, OnInit, Input } from '@angular/core';
import { Operation } from '@app/modules/operation/operation.service';
import { Patient } from '@app/modules/patient/patient.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-notification-listing',
  templateUrl: './notification-listing.component.html',
  styleUrls: ['./notification-listing.component.scss']
})
export class NotificationListingComponent implements OnInit {
  @Input() operation: Operation;
  public patients: Patient[];
  public patients$: Observable<[Patient]> | void = null;
  constructor() {}

  ngOnInit() {}
}
