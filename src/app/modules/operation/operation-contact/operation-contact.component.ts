import { Component, OnInit, Input } from '@angular/core';
import { OperationContact } from './operation-contact';

@Component({
  selector: 'app-operation-contact',
  templateUrl: './operation-contact.component.html',
  styleUrls: ['./operation-contact.component.scss']
})
export class OperationContactComponent implements OnInit {
  @Input() operationContact: OperationContact;
  constructor() {}

  ngOnInit() {}
}
