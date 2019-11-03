import { Component, OnInit, Renderer2, Injectable, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, from, throwError, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { OperationService } from '../operation.service';
import { FormGroup, FormBuilder, FormControl, FormArray, Validators } from '@angular/forms';
import { OperationCallRepsService, OperationCallRep } from '../operation-callreps.service';
import { OperationContactsService, OperationContactPostBody } from '../operation-contacts.service';
import { UserService } from '@app/modules/user/user.service';
import { User } from '@app/modules/user/user';
import { NotificationService } from '@app/modules/notification/notification.service';
import { OperationResolver } from '../operation-resolver';
import {
  OperationPutBody,
  OperationCallRepPostBody,
  Operation,
  OperationManagerPostBody,
  OperationManager
} from '../operation';
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
  notificationTypesListLeft: NotificationType[] = [];
  notificationTypesListRight: NotificationType[] = [];
  operationForm!: FormGroup;
  operation$: Observable<Operation>;
  operationCallReps: OperationCallRep[] = [];
  operationCallReps$: Observable<OperationCallRep[]>;
  operationContacts$: Observable<OperationContact[]>;
  operationManagers: OperationManager[] = [];
  operationManagers$: Observable<OperationManager[]>;

  operationContacts: OperationContact[] = [];
  user: User;

  constructor(
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private notificationRecipientService: NotificationRecipientService,
    private operationService: OperationService,
    private operationCallRepsService: OperationCallRepsService,
    private operationContactsService: OperationContactsService,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}
  ngOnInit() {
    this.user = this.route.snapshot.data.user;
    this.notificationService.getNotificationTypes().subscribe((data: any) => {
      this.notificationTypes = data;
      var i;
      for (i = 0; i <= this.notificationTypes.length; i = i + 2) {
        if (this.notificationTypes[i] !== undefined) {
          this.notificationTypesListLeft.push(this.notificationTypes[i]);
        }
        if (this.notificationTypes[i + 1] !== undefined) {
          this.notificationTypesListRight.push(this.notificationTypes[i + 1]);
        }
      }
    });

    if (this.route.snapshot.data.editMode) {
      this.editMode = true;
    }
    if (this.editMode) {
      this.operation = this.route.snapshot.data.operation;
      this.operation$ = this.operationService.getOperationByOperationId(this.operation.operationId);
      this.operationCallReps$ = this.operationCallRepsService.getOperationCallRepsByOperationId(
        this.operation.operationId
      );
      this.createForm();
      this.armForm();
    } else {
      this.operationService.addNewOperation().subscribe((data: Operation) => {
        let operation = data;
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {
            operationId: operation.operationId
          },
          queryParamsHandling: 'merge'
        });
        this.operation = data;
        // Arm an initial call rep
        this.operationCallReps$ = of([
          {
            operationCallRepId: 0,
            operationId: this.operation.operationId,
            operationCallRepName: ''
          }
        ]);
        this.createForm();
        this.armForm();
      });
    }
    /**
     * Quickly shift operations if url param changes
     */
    this.route.paramMap.subscribe(params => {
      if (params.get('operationId')) {
        let operationId = parseInt(params.get('operationId'));
        this.operationService.getOperationByOperationId(operationId).subscribe((operation: Operation) => {
          this.updateOperation(operation);
        });
      }
    });
  }

  armForm() {
    this.addAdditionalContact();
    this.addAdditionalManager();
    this.addAdditionalCallRep();
    this.availableUsers$ = this.userService.getAllUsers();
    this.availableManagers$ = this.userService.getAllManagerUsers();

    this.operationManagers$ = this.operationService.getOperationManagersByOperationId(this.operation.operationId).pipe(
      map((data: OperationManager[]) => {
        this.operationManagers = data;
        return data;
      })
    );

    this.operationContacts$ = this.operationContactsService
      .getOperationContactsByOperationId(this.operation.operationId)
      .pipe(
        map((data: OperationContact[]) => {
          this.operationContacts = data;
          return data;
        })
      );

    this.operationCallRepsService.getOperationCallRepsByOperationId(this.operation.operationId).pipe(
      map((data: OperationCallRep[]) => {
        this.operationCallReps = data;
        return data;
      })
    );
  }
  operationChangeEventHandler($event: number) {
    console.log('change occurred');
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
    this.armForm();
  }
  addAdditionalCallRep() {
    let formArray = this.operationForm.controls.operationCallReps as FormArray;
    formArray.push(this.fb.control({}));
    let newCallRep = {
      operationCallRepId: 0,
      operationId: this.operation.operationId,
      operationCallRepName: ''
    };
    this.operationCallReps.push(newCallRep);
  }
  removeCallRep(idx: number) {
    let formArray = this.operationForm.controls.operationCallReps as FormArray;
    formArray.removeAt(idx);
  }
  addAdditionalManager() {
    let formArray = this.operationForm.controls.operationManagers as FormArray;
    formArray.push(this.fb.control({}));
    let newManager = {
      operationId: this.operation.operationId,
      userId: 0
    };
    this.operationManagers.push(newManager);
  }
  removeManager(idx: number) {
    let formArray = this.operationForm.controls.operationManagers as FormArray;
    formArray.removeAt(idx);
  }

  addAdditionalContact() {
    let formArray = this.operationForm.controls.operationContacts as FormArray;
    let contactFormGroup = this.fb.group({});
    contactFormGroup.addControl('operationContactFirstName', this.fb.control(''));
    contactFormGroup.addControl('operationContactMiddleName', this.fb.control(''));
    contactFormGroup.addControl('operationContactLastName', this.fb.control(''));
    contactFormGroup.addControl('operationContactCountryCode', this.fb.control(''));
    contactFormGroup.addControl('operationContactPhoneNumber', this.fb.control(''));
    contactFormGroup.addControl('operationContactAreaCode', this.fb.control(''));
    contactFormGroup.addControl('operationContactEmail', this.fb.control(''));
    contactFormGroup.addControl('operationContactTitle', this.fb.control(''));
    formArray.push(contactFormGroup);
    let newCallContact = {
      operationContactId: this.operation.operationId,
      operationContactFirstName: '',
      operationContactLastName: ''
    };
    this.operationContacts.push(newCallContact);
  }
  private createForm() {
    this.operationForm = this.fb.group({
      operation: this.fb.group({
        operationId: this.fb.control(this.operation.operationId),
        operationName: this.fb.control('', [Validators.required]),
        operationAddress: this.fb.control(this.operation.operationAddress),
        operationCity: this.fb.control(this.operation.operationCity),
        operationState: this.fb.control(this.operation.operationState),
        operationZip: this.fb.control(this.operation.operationZip),
        operationCountryCode: this.fb.control(this.operation.operationCountryCode, [Validators.required]),
        operationAreaCode: this.fb.control(this.operation.operationAreaCode, [Validators.required]),
        operationPhoneNumber: this.fb.control(this.operation.operationPhoneNumber, [Validators.required])
      }),
      operationContacts: this.fb.array([]),
      operationManagers: this.fb.array([]),
      operationCallReps: this.fb.array([]),
      operationActive: this.fb.control(this.operation.operationActive)
    });
  }

  operationPutFactory(formSubmission: any): OperationPutBody {
    try {
      var payload = {
        operationName: formSubmission.operation.operationName,
        operationAddress: formSubmission.operation.operationAddress,
        operationCity: formSubmission.operation.operationCity,
        operationState: formSubmission.operation.operationState,
        operationZip: formSubmission.operation.operationZip,
        operationCountryCode: formSubmission.operation.operationCountryCode,
        operationAreaCode: formSubmission.operation.operationAreaCode,
        operationPhoneNumber: formSubmission.operation.operationPhoneNumber,
        operationActive: formSubmission.operationActive ? 1 : 0
      };
      return <OperationPutBody>payload;
    } catch {
      throw 'Had a problem validating data in the operation form factory';
    }
  }
  operationCallRepPostFactory(formSubmission: any): OperationCallRepPostBody {
    try {
      /**
       * Need processing for the user id here
       */
      var payload = {
        operationId: formSubmission.operation.operationId,
        userId: this.user.userId
      };
      return <OperationCallRepPostBody>payload;
    } catch {
      throw 'Had a problem validating data in the call rep factory';
    }
  }
  operationContactPostFactory(formSubmission: any): OperationContactPostBody {
    try {
      var payload = {
        operationContactFirstName: formSubmission.operationContactFirstName,
        operationContactMiddleName: formSubmission.operationContactMiddleName,
        operationContactLastName: formSubmission.operationContactLastName,
        operationContactCountryCode: formSubmission.operationContactCountryCode,
        operationContactAreaCode: formSubmission.operationContactAreaCode,
        operationContactPhoneNumber: formSubmission.operationContactPhoneNumber,
        operationContactEmail: formSubmission.operationContactEmail,
        operationContactTitle: formSubmission.operationContactTitle
      };
      return <OperationContactPostBody>payload;
    } catch {
      throw 'Had a problem validating data in the call rep factory';
    }
  }
  operationManagerPostFactory(formSubmission: any): OperationManagerPostBody {
    try {
      var payload = {
        operationId: formSubmission.operation.operationId,
        userId: this.user.userId
      };
      return <OperationManagerPostBody>payload;
    } catch {
      throw 'Had a problem validating data in the call rep factory';
    }
  }
  onFormSubmit() {
    let formSubmission = this.operationForm.getRawValue();
    // Passing E2E
    let operationManagerPost = this.operationManagerPostFactory(formSubmission);
    this.operationService
      .assignManagerToOperationByOperationIdAndUserId(formSubmission.operation.operationId, operationManagerPost.userId)
      .subscribe((data: any) => {
        console.log(data);
        // debugger;
        alert('Manager successfully added');
      });

    let operationCallRepPost = this.operationCallRepPostFactory(formSubmission);
    this.operationCallRepsService
      .addOperationCallRepByOperationIdAndUserId(operationCallRepPost.operationId, operationCallRepPost.userId)
      .subscribe((data: any) => {
        console.log(data);
        // debugger;
        alert('Callreps successfully added');
      });
    // let operationContactPost = this.operationContactPostFactory(formSubmission);
    // this.operationContactsService
    //   .addOperationContactByOperationId(formSubmission.operation.operationId, operationContactPost)
    //   .subscribe((data: any) => {
    //     console.log(data);
    //   });

    let operationPut = this.operationPutFactory(formSubmission);
    console.log(operationPut);
    debugger;
    this.operationService
      .editOperationByOperationId(this.operation.operationId, operationPut)
      .subscribe((data: any) => {
        console.log(data);
        // debugger;
        alert('Operation successfully edited');
      });
  }
}
