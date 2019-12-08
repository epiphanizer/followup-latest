import { Component, OnInit, Renderer2, Injectable, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, from, throwError, of } from 'rxjs';
import { map, catchError, first, take } from 'rxjs/operators';
import { SuperForm } from 'angular-super-validator';
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
  availableUsers: User[];
  availableManagers: User[];
  operation: Operation;
  editMode: boolean;
  notificationTypes: NotificationType[];
  notificationTypesListLeft: NotificationType[] = [];
  notificationTypesListRight: NotificationType[] = [];
  operationForm!: FormGroup;
  operation$: Observable<Operation>;
  operationCallReps: OperationCallRep[] = [];
  operationCallRepsOriginal: number[] = [];
  operationCallRepsToAdd: OperationCallRep[] = [];
  operationCallRepsToRemove: number[] = [];
  operationContacts$: Observable<OperationContact[]>;
  operationContactsOriginal: OperationContact[] = [];
  operationContacts: OperationContact[] = [];
  operationContactsToAdd: OperationContact[] = [];
  operationContactsToRemove: number[] = [];
  operationManagers: OperationManager[] = [];
  operationManagersOriginal: number[] = [];
  operationManagersToAdd: OperationManager[] = [];
  operationManagersToRemove: number[] = [];
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
        this.operationCallReps = [
          {
            userId: 0,
            operationId: this.operation.operationId,
            operationCallRepName: ''
          }
        ];
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
    this.addAdditionalOperationContact();
    this.addAdditionalOperationManager();
    this.addAdditionalOperationCallRep();
    this.userService.getAllUsers().subscribe((users: User[]) => {
      this.availableUsers = users;
    });
    this.userService.getAllManagerUsers().subscribe((users: User[]) => {
      this.availableManagers = users;
    });

    this.operationContacts$ = this.operationContactsService
      .getOperationContactsByOperationId(this.operation.operationId)
      .pipe(
        map((operationContacts: OperationContact[]) => {
          if (operationContacts !== null) {
            this.operationContacts = operationContacts;
            return operationContacts;
          }
        })
      );
    this.operationCallRepsService
      .getOperationCallRepsByOperationId(this.operation.operationId)
      .subscribe((operationCallReps: OperationCallRep[]) => {
        if (operationCallReps !== null) {
          this.operationCallReps = operationCallReps;
          operationCallReps.forEach((operationCallRep: OperationCallRep) => {
            this.operationCallRepsOriginal.push(operationCallRep.userId);
          });
        }
      });
    this.operationService
      .getOperationManagersByOperationId(this.operation.operationId)
      .pipe(take(1))
      .subscribe((operationManagers: OperationManager[]) => {
        console.log(operationManagers);
        if (operationManagers !== null) {
          this.operationManagers = operationManagers;
          operationManagers.forEach((operationManager: OperationManager) => {
            this.operationManagersOriginal.push(operationManager.userId);
            console.log(this.operationManagersOriginal);
          });
        }
      });
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
  }
  addAdditionalOperationCallRep() {
    let newCallRep = {
      userId: 0,
      operationId: this.operation.operationId,
      operationCallRepName: ''
    };
    this.operationCallReps.push(newCallRep);
  }
  addAdditionalOperationManager() {
    let newManager = {
      operationId: this.operation.operationId,
      userId: 0
    };
    this.operationManagers.push(newManager);
  }

  addAdditionalOperationContact() {
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
    let newOperationContact = {
      operationContactId: this.operation.operationId,
      operationContactFirstName: '',
      operationContactLastName: ''
    };
    this.operationContacts.push(newOperationContact);
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
  callRepOnSelect(event: any, index: number) {
    let callRepUserId = event.target.value;
    if (this.operationManagers[index].userId! == 0) {
      this.operationCallRepsToRemove.push(this.operationCallReps[index].userId);
    }
    var operationCallRepObject = {
      operationId: this.operation.operationId,
      userId: callRepUserId
    };
    this.operationCallReps[index] = operationCallRepObject;
  }
  managerOnSelect(event: any, index: number) {
    let managerUserId = event.target.value;
    if (this.operationManagers[index].userId! == 0) {
      this.operationManagersToRemove.push(this.operationManagers[index].userId);
    }
    var operationManagerObject = {
      operationId: this.operation.operationId,
      userId: managerUserId
    };
    this.operationManagers[index] = operationManagerObject;
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
  onFormSubmit() {
    if (!this.validateControls()) {
      return;
    }

    // Passing E2E
    this.operationManagersToRemove.forEach((managerUserId: number) => {
      // Don't process default manager entry
      if (managerUserId == 0) {
        return;
      }
      this.operationService
        .removeOperationManagerByOperationIdAndUserId(this.operation.operationId, managerUserId)
        .subscribe((data: any) => {
          alert('Manager successfully removed');
          console.log(data);
        });
    });
    // This passes E2E
    console.log(this.operationManagersOriginal);
    this.operationManagersToAdd = this.operationManagers.filter((operationManager: OperationManager, index: number) => {
      return operationManager.userId !== this.operationManagersOriginal[index] && operationManager.userId !== 0;
    });

    this.operationManagersToAdd.forEach((operationManager: OperationManager) => {
      // Need a filter here to see new vs. old
      this.operationService
        .assignManagerToOperationByOperationIdAndUserId(operationManager.operationId, operationManager.userId)
        .subscribe((data: any) => {
          console.log(data);
          debugger;
          alert('Manager successfully added');
        });
    });

    // Need a filter here to see new vs. old
    console.log(this.operationCallRepsToRemove);
    debugger;
    this.operationCallRepsToRemove.forEach((callRepUserId: number, index: number) => {
      this.operationCallRepsService
        .deleteOperationCallRepByOperationCallRepId(this.operation.operationId, callRepUserId)
        .subscribe((data: any) => {
          alert('Callrep successfully deleted');
          console.log(data);
        });
    });
    console.log(this.operationCallRepsOriginal);
    console.log(this.operationCallReps);
    debugger;
    this.operationCallRepsToAdd = this.operationCallReps.filter((operationCallRep: OperationCallRep, index: number) => {
      return operationCallRep.userId !== this.operationCallRepsOriginal[index] && operationCallRep.userId !== 0;
    });

    console.log(this.operationCallRepsToAdd);
    debugger;
    this.operationCallRepsToAdd.forEach((operationCallRep: OperationCallRep) => {
      let operationCallRepPost = this.operationCallRepPostFactory(operationCallRep);
      this.operationCallRepsService
        .addOperationCallRepByOperationIdAndUserId(operationCallRepPost.operationId, operationCallRepPost.userId)
        .subscribe((data: any) => {
          console.log(data);
          alert('Callrep successfully added');
        });
    });

    let formSubmission = this.operationForm.getRawValue();
    // Need a filter here to see new vs. old
    debugger;
    this.operationContacts.forEach((operationContact: OperationContact, idx: number) => {
      let operationContactPost = this.operationContactPostFactory(operationContact);
      this.operationContactsService
        .addOperationContactByOperationId(this.operation.operationId, operationContactPost)
        .subscribe((data: any) => {
          console.log(data);
          // Now that we have the contact, we add them to the notification recipients table
          this.notificationRecipientService
            .addNotificationRecipientByOperationContactId(operationContact.operationContactId)
            .subscribe((data: any) => {
              console.log(data);
              let notificationTypes = formSubmission.operationContacts.notificationTypes;
              console.log(notificationTypes);
              debugger;
            });
        });
    });

    let operationPut = this.operationPutFactory(formSubmission);
    this.operationService
      .editOperationByOperationId(this.operation.operationId, operationPut)
      .subscribe((data: any) => {
        console.log(data);
        alert('Operation successfully edited');
        this.router.navigate(['/operations']);
      });
  }

  removeOperationCallRep(idx: number) {
    this.operationCallRepsToRemove.push(this.operationCallReps[idx].userId);
    this.operationCallReps.splice(idx, 1);
  }
  removeOperationContact(idx: number) {
    this.operationContactsToRemove.push(this.operationContacts[idx].operationContactId);
    this.operationContacts.splice(idx, 1);
  }
  removeOperationManager(idx: number) {
    this.operationManagersToRemove.push(this.operationManagers[idx].userId);
    this.operationManagers.splice(idx, 1);
  }
  /**
   * A function to validate controls,
   * and if there are any validation errors,
   * bounce the user to the top.
   */
  validateControls(): boolean {
    console.log('Finding invalid controls...');
    const errors = SuperForm.getAllErrors(this.operationForm);
    console.log(JSON.stringify(errors));
    const errorsFlat = SuperForm.getAllErrorsFlat(this.operationForm);
    console.log(JSON.stringify(errorsFlat));
    // Double check this
    const firstError = <HTMLElement>document.getElementsByClassName('ng-invalid')[0];

    function scroll(el: HTMLElement) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (firstError) {
      scroll(firstError);
      return false;
    } else {
      return true;
    }
  }
}
