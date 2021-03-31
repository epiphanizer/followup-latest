import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { UserService } from '@app/modules/user/user.service';
import { User } from '@app/modules/user/user';
import { AuthenticationService } from '@app/core';
import { Patient } from '@app/modules/patient/patient';
import { PatientService } from '@app/modules/patient/patient.service';
import { Operation } from '@app/modules/operation/operation';
import { OperationService } from '@app/modules/operation/operation.service';

@Component({
  providers: [AuthenticationService, OperationService, PatientService, UserService],
  selector: 'app-listing-search',
  templateUrl: './listing-search.component.html',
  styleUrls: ['./listing-search.component.scss']
})
export class ListingSearch implements OnInit {
  searchText: string = '';
  @Output() searchFilterEventEmitted: EventEmitter<string> = new EventEmitter();

  constructor(private operationService: OperationService, private patientService: PatientService) {}
  ngOnInit() {}
  ngOnChanges(changes: SimpleChanges) {}
  updateSearchText($event: string) {
    this.searchText = $event;
  }
}
