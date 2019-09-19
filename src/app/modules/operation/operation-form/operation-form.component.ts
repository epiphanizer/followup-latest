import { Component, OnInit, Renderer2, Injectable, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, from, throwError, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { OperationService, Operation } from '../operation.service';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { OperationCallRepsService, OperationCallRep } from '../operation-callreps.service';
import { OperationContactsService } from '../operation-contacts.service';
import { User, UserService } from '@app/modules/user/user.service';
import { NotificationTypes, NotificationService } from '@app/modules/notification/notification.service';
import { OperationResolver } from '../operation-resolver';
import { OperationPutBody } from '../operation';
import { OperationContact } from '../operation-contact/operation-contact';
import { NotificationRecipientService } from '@app/modules/notification/notification-recipient/notification-recipient.service';

@Component({
  providers: [OperationService, OperationContactsService, OperationCallRepsService, OperationResolver],
  selector: 'app-operation-form',
  templateUrl: './operation-form.component.html',
  styleUrls: ['./operation-form.component.scss']
})
@Injectable()
export class OperationFormComponent implements OnInit {
  availableUsers$: Observable<User[]>;
  availableManagers$: Observable<User[]>;
  operation: Operation;
  editMode: boolean;
  notificationTypes: NotificationTypes[];
  operationForm!: FormGroup;
  operation$: Observable<Operation>;
  operationCallReps: OperationCallRep[];
  operationCallReps$: Observable<OperationCallRep>;
  operationContacts: OperationContact[];
  user: User;

  constructor(
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private notificationRecipientService: NotificationRecipientService,
    private operationService: OperationService,
    private operationCallRepsService: OperationCallRepsService,
    private operationContactsService: OperationContactsService,
    private route: ActivatedRoute,
    private userService: UserService
  ) {}
  ngOnInit() {
    this.user = this.route.snapshot.data.user;
    this.createForm();
    this.notificationService.getNotificationTypes().subscribe((data: NotificationTypes[]) => {
      this.notificationTypes = data;
      return data;
    });
    if (this.route.snapshot.data.editMode) {
      this.editMode = true;
    }
    if (this.editMode) {
      this.operation = this.route.snapshot.data.operation;
    }
    // Redundant, should fix for prod
    if (!this.operation) {
      this.operation$ = this.operationService.addNewOperation().pipe(
        map((data: Operation) => {
          this.operation = data;
          return data;
        })
      );
    } else {
      this.operation$ = this.operationService.getOperationByOperationId(this.operation.operationId);
      this.createForm();
      // Initial loadin, should probably be abstracted out here
      var operationFormControls = this.operationForm.get('operation') as FormGroup;
      operationFormControls.controls.operationId.setValue(this.operation.operationId);
      operationFormControls.controls.operationName.setValue(this.operation.operationName);
      operationFormControls.controls.operationAddress.setValue(this.operation.operationAddress);
      operationFormControls.controls.operationCity.setValue(this.operation.operationCity);
      operationFormControls.controls.operationState.setValue(this.operation.operationState);
      operationFormControls.controls.operationZip.setValue(this.operation.operationZip);
      operationFormControls.controls.operationCountryCode.setValue(this.operation.operationCountryCode);
      operationFormControls.controls.operationAreaCode.setValue(this.operation.operationAreaCode);
      operationFormControls.controls.operationPhoneNumber.setValue(this.operation.operationPhoneNumber);
      this.operationContactsService
        .getOperationContactsByOperationId(this.operation.operationId)
        .subscribe((data: OperationContact[]) => {
          this.operationContacts = data;
          return data;
        });
      this.operationCallRepsService
        .getOperationCallRepsByOperationId(this.operation.operationId)
        .subscribe((data: OperationCallRep[]) => {
          this.operationCallReps = data;
          return data;
        });
    }
    this.availableUsers$ = this.userService.getAllUsers();
    this.availableManagers$ = this.userService.getAllManagerUsers();
  }
  addAdditionalCallRep() {
    alert('adding additional call rep');
  }

  addAdditionalContact() {
    alert('adding additional contact');
  }
  private createForm() {
    this.operationForm = this.fb.group({
      operation: this.fb.group({
        operationId: this.fb.control(''),
        operationName: this.fb.control(''),
        operationAddress: this.fb.control(''),
        operationCity: this.fb.control(''),
        operationState: this.fb.control(''),
        operationZip: this.fb.control(''),
        operationCountryCode: this.fb.control(''),
        operationAreaCode: this.fb.control(''),
        operationPhoneNumber: this.fb.control('')
      }),
      operationContacts: this.fb.group({}),
      operationContactNotifications: this.fb.group({
        0: this.fb.control(false),
        1: this.fb.control(false),
        2: this.fb.control(false),
        3: this.fb.control(false),
        4: this.fb.control(false),
        5: this.fb.control(false),
        6: this.fb.control(false)
      }),
      operationCallReps: this.fb.group({})
    });
  }

  operationFormFactory(formSubmission: FormData): OperationPutBody {
    try {
      var payload = {};
      debugger;
      // var payload = {
      //   'operationName': formSubmission
      // };
      return <OperationPutBody>payload;
    } catch {
      throw 'Had a problem validating data in the operation form factory';
    }
  }
  onFormSubmit() {
    let formSubmission = this.operationForm.getRawValue();
    let payload = this.operationFormFactory(formSubmission);
    console.log(payload);
    // this.patientService.editPatientByPatientId(this.patient.patientId, payload).subscribe(value => {
    // console.log(value);
    // return (this.status.submitted = true);
    // });
    debugger;
    // for loop with op call reps
    this.operationCallRepsService.addOperationCallRepByOperationIdAndUserId(
      formSubmission.operation.operationId,
      formSubmission.user.userId
    );
    // for loop with op contacts

    // this.operationContactsService.

    // for loop with notification recipients

    // this.notificationRecipientService.addNotificationRecipientByOperationContactId
  }
  public toggleOperationUserAssignedMenu = function() {
    this.isOpen = !this.isOpen;
  };
}
