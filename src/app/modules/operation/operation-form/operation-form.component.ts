import { Component, OnInit, Renderer2, Injectable, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, from, throwError, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { OperationService, Operation } from '../operation.service';
import { FormGroup, FormBuilder, FormControl, FormArray, Validators } from '@angular/forms';
import { OperationCallRepsService, OperationCallRep } from '../operation-callreps.service';
import { OperationContactsService, OperationContactPostBody } from '../operation-contacts.service';
import { User, UserService } from '@app/modules/user/user.service';
import { NotificationService } from '@app/modules/notification/notification.service';
import { OperationResolver } from '../operation-resolver';
import { OperationPutBody, OperationCallRepPostBody } from '../operation';
import { OperationContact } from '../operation-contact/operation-contact';
import { NotificationRecipientService } from '@app/modules/notification/notification-recipient/notification-recipient.service';
import { NotificationType } from '@app/modules/notification/notification';

@Component({
  providers: [
    NotificationRecipientService,
    OperationService,
    OperationContactsService,
    OperationCallRepsService,
    OperationResolver
  ],
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
  notificationTypes: NotificationType[];
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
    this.notificationService.getNotificationTypes().subscribe((data: NotificationType[]) => {
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
    }
    this.availableUsers$ = this.userService.getAllUsers();
    this.availableManagers$ = this.userService.getAllManagerUsers();

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

    this.route.paramMap.subscribe(params => {
      let operationId = parseInt(params.get('operationId'));
      this.operationService.getOperationByOperationId(operationId).subscribe((operation: Operation) => {
        this.updateOperation(operation);
      });
    });
  }

  updateOperation(operation: Operation) {
    this.operation = operation[0];
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
  addAdditionalCallRep() {
    console.log('adding additional call rep');
    let formArray = this.operationForm.controls.operationCallReps as FormArray;
    formArray.push(this.fb.control({}));
    let newCallRep = {
      operationCallRepId: 0,
      operationCallRepName: ''
    };
    this.operationCallReps.push(newCallRep);
  }

  addAdditionalContact() {
    console.log('adding additional contact');
    let formArray = this.operationForm.controls.operationContacts as FormArray;
  }
  private createForm() {
    this.operationForm = this.fb.group({
      operation: this.fb.group({
        operationId: this.fb.control(''),
        operationName: this.fb.control('', [Validators.required]),
        operationAddress: this.fb.control(''),
        operationCity: this.fb.control(''),
        operationState: this.fb.control(''),
        operationZip: this.fb.control(''),
        operationCountryCode: this.fb.control('', [Validators.required]),
        operationAreaCode: this.fb.control('', [Validators.required]),
        operationPhoneNumber: this.fb.control('', [Validators.required])
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
      operationCallReps: this.fb.array([])
    });
  }

  operationPutFactory(formSubmission: any): OperationPutBody {
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
  operationCallRepPostFactory(formSubmission: any): OperationCallRepPostBody {
    try {
      var payload = {
        operationId: formSubmission.operation.operationId,
        userId: this.user.id
      };
      return <OperationCallRepPostBody>payload;
    } catch {
      throw 'Had a problem validating data in the call rep factory';
    }
  }
  operationContactPostFactory(formSubmission: any): OperationContactPostBody {
    try {
      debugger;
      var payload = {
        operationContactFirstName: formSubmission.operationContactFirstName,
        operationContactLastName: formSubmission.operationContactLastName,
        operationContactEmail: formSubmission.operationContactEmail
      };
      return <OperationContactPostBody>payload;
    } catch {
      throw 'Had a problem validating data in the call rep factory';
    }
  }
  onFormSubmit() {
    let formSubmission = this.operationForm.getRawValue();
    let operationCallRepPost = this.operationCallRepPostFactory(formSubmission);
    this.operationCallRepsService.addOperationCallRepByOperationIdAndUserId(
      operationCallRepPost.operationId,
      operationCallRepPost.userId
    );
    let operationContactPost = this.operationContactPostFactory(formSubmission);
    this.operationContactsService.addOperationContactByOperationId(
      formSubmission.operation.operationId,
      operationContactPost
    );
  }
}
