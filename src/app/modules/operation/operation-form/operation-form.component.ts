import { Component, OnInit, Renderer2, Injectable, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, from, throwError, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { OperationService, Operation } from '../operation.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { OperationCallrepsService } from '../operation-callreps.service';
import { OperationContactsService } from '../operation-contacts.service';

@Component({
  providers: [OperationService, OperationContactsService, OperationCallrepsService],
  selector: 'app-operation-form',
  templateUrl: './operation-form.component.html',
  styleUrls: ['./operation-form.component.scss']
})
@Injectable()
export class OperationFormComponent implements OnInit {
  @Input() operation: Operation;
  editMode: boolean;
  editOperationForm!: FormGroup;
  operation$: Observable<Operation>;

  constructor(private fb: FormBuilder, private operationService: OperationService, private route: ActivatedRoute) {}
  ngOnInit() {
    this.createForm();

    if (this.route.snapshot.data.editMode) {
      this.editMode = true;
    }
    if (this.editMode) {
      this.operation = this.route.snapshot.data.operation;
    }
    if (!this.operation) {
      this.operation$ = this.operationService.addNewOperation().pipe(
        map((data: Operation) => {
          this.operation = data;
          this.createForm();
          return data;
        })
      );
    } else {
      this.operation$ = this.operationService.getOperationByOperationId(this.operation.operationId);
      this.createForm();
    }
  }
  private createForm() {
    this.editOperationForm = this.fb.group({
      operation: this.fb.group({
        operationName: this.fb.control({}),
        operationAddress: this.fb.control({}),
        operationCity: this.fb.control({}),
        operationState: this.fb.control({}),
        operationZip: this.fb.control({}),
        operationCountryCode: this.fb.control({}),
        operationAreaCode: this.fb.control({}),
        operationPhoneNumber: this.fb.control({})
      })
    });
  }
  onFormSubmit() {
    // this.operationService.editOperation();
  }
}
