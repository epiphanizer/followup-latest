import { Component, OnInit, Injectable } from '@angular/core';
import * as _ from 'lodash';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { SuperForm } from 'angular-super-validator';
import { OperationService } from '../operation.service';
import { FormGroup, FormBuilder, FormControl, FormArray, Validators } from '@angular/forms';
import {
  OperationContactsService,
  OperationContactPostBody,
  OperationContactPutBody
} from '../operation-contacts.service';
import { UserService } from '@app/modules/user/user.service';
import { User } from '@app/modules/user/user';
import { NotificationService } from '@app/modules/notification/notification.service';
import { OperationResolver } from '../operation-resolver';
import {
  OperationPutBody,
  OperationCallRepPostBody,
  Operation,
  OperationManager,
  OperationGroup,
  OperationCallRep
} from '../operation';
import { OperationContact } from '../operation-contact/operation-contact';
import { NotificationRecipientService } from '@app/modules/notification/notification-recipient/notification-recipient.service';
import { NotificationType } from '@app/modules/notification/notification';
import { ToastrService } from 'ngx-toastr';

@Component({
  providers: [
    NotificationRecipientService,
    OperationService,
    OperationContactsService,
    OperationResolver,
    ToastrService
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
  mode: any = {
    add: false,
    edit: false,
    view: false
  };
  notificationsLoaded: boolean = false;
  notificationTypes: NotificationType[];
  operationForm!: FormGroup;
  operation$: Observable<Operation>;
  operationManagers: OperationManager[] = [];
  operationManagersOriginal: number[] = [];
  operationManagersToAdd: OperationManager[] = [];
  operationManagersToRemove: number[] = [];
  operationCallReps: OperationCallRep[] = [];
  operationCallRepsOriginal: number[] = [];
  operationCallRepsToAdd: OperationCallRep[] = [];
  operationCallRepsToRemove: number[] = [];
  operationContacts$: Observable<OperationContact[]>;
  operationContactsOriginal: number[] = [];
  operationContacts: OperationContact[] = [];
  operationContactsToAdd: OperationContact[] = [];
  operationContactsToEdit: OperationContact[] = [];
  operationContactsToRemove: number[] = [];
  operationGroups: OperationGroup[] = [];
  user: User;

  constructor(
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private notificationRecipientService: NotificationRecipientService,
    private operationService: OperationService,
    private operationContactsService: OperationContactsService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private userService: UserService
  ) {}
  ngOnInit() {
    this.user = this.route.snapshot.data.user;
    this.operationService.getOperationGroups().subscribe((operationGroups: OperationGroup[]) => {
      this.operationGroups = operationGroups;
    });
    this.notificationService.getNotificationTypes().subscribe((notificationTypes: NotificationType[]) => {
      this.notificationTypes = notificationTypes;
    });

    if (this.route.snapshot.data.mode == 'add') {
      this.mode.add = true;
    } else if (this.route.snapshot.data.mode == 'edit') {
      this.mode.edit = true;
    } else if (this.route.snapshot.data.mode == 'view') {
      this.mode.view = true;
    }

    if (this.mode.edit || this.mode.view) {
      this.operation = this.route.snapshot.data.operation;
      this.operation$ = this.operationService.getOperationByOperationId(this.operation.operationId);
      this.createForm();
      this.armForm();
    } else if (this.mode.add) {
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
        this.createForm();
        this.armForm();
        this.updateOperationContacts();
      });
    }
    /**
     * We can pull in our operationId from the operation resolver
     * if we're coming from the listing route. If we load by sidebar
     * we will listen for the change.
     */
    if (this.route.snapshot.data.operation) {
      let operationId = parseInt(this.route.snapshot.data.operation.operationId);
      this.operationService.getOperationByOperationId(operationId).subscribe((operation: Operation) => {
        this.cleanData();
        this.updateOperation(operation);
        this.updateOperationContacts();
      });
    }
  }
  operationChangeEventHandler(operation: Operation) {
    let operationId = operation.operationId;
    this.operationService.getOperationByOperationId(operationId).subscribe((operation: Operation) => {
      this.cleanData();
      this.updateOperation(operation);
      this.updateOperationContacts();
    });
  }
  cleanData() {
    this.notificationsLoaded = false;
    let formArray = this.operationForm.controls.operationContacts as FormArray;
    formArray.clear();
    this.operationContacts = [];
    this.operationContactsOriginal = [];
  }
  updateOperationContacts() {
    this.cleanData();
    let formArray = this.operationForm.controls.operationContacts as FormArray;
    this.operationContactsService
      .getOperationContactsByOperationId(this.operation.operationId)
      .pipe(
        take(1),
        map((operationContacts: OperationContact[]) => {
          if (operationContacts !== null) {
            this.operationContacts = [];
            operationContacts.forEach((operationContact: OperationContact, idx: number) => {
              operationContact.operationContactOrder = idx + 1;
              let contactFormGroup = this.fb.group({});
              contactFormGroup.addControl('operationContactFirstName', this.fb.control(''));
              contactFormGroup.addControl('operationContactLastName', this.fb.control(''));
              contactFormGroup.addControl('operationContactTitle', this.fb.control(''));
              contactFormGroup.addControl('operationContactCountryCode', this.fb.control('1'));
              contactFormGroup.addControl('operationContactPhoneNumber', this.fb.control(''));
              contactFormGroup.addControl('operationContactAreaCode', this.fb.control(''));
              contactFormGroup.addControl('operationContactEmail', this.fb.control(''));
              contactFormGroup.addControl(
                'operationContactOrder',
                this.fb.control({
                  value: idx + 1,
                  disabled: true
                })
              );
              formArray.push(contactFormGroup);
              this.operationContacts.push(operationContact);

              var notificationTypesArray = new Array();
              this.notificationRecipientService
                .getNotificationRecipientByOperationContactId(operationContact.operationContactId)
                .pipe(
                  take(1),
                  map((notificationTypes: NotificationType[]) => {
                    let notificationsFormControlArray = this.fb.array([]);
                    if (notificationTypes !== null) {
                      // Get the notification types assigned to ops. contact
                      notificationTypes.forEach((notificationType: NotificationType) => {
                        notificationTypesArray.push(notificationType.notificationTypeId);
                      });
                      for (let i = 0; i < this.notificationTypes.length; i++) {
                        let newFormGroup = this.fb.group({});
                        let notificationTypeId = this.notificationTypes[i].notificationTypeId.toString();
                        if (notificationTypesArray.indexOf(this.notificationTypes[i].notificationTypeId) != -1) {
                          var newControl = new FormControl(true);
                        } else {
                          var newControl = new FormControl(false);
                        }
                        newFormGroup.addControl(notificationTypeId, newControl);
                        notificationsFormControlArray.push(newFormGroup);
                      }
                    } else {
                      for (let i = 0; i < this.notificationTypes.length; i++) {
                        let newFormGroup = this.fb.group({});
                        let notificationTypeId = this.notificationTypes[i].notificationTypeId.toString();
                        var newControl = new FormControl(true);
                        newFormGroup.addControl(notificationTypeId, newControl);
                        notificationsFormControlArray.push(newFormGroup);
                      }
                    }
                    contactFormGroup.addControl('operationContactNotifications', notificationsFormControlArray);

                    var formGroup = formArray.controls[idx] as FormGroup;
                    formGroup.controls.operationContactFirstName.setValue(operationContact.operationContactFirstName),
                      formGroup.controls.operationContactLastName.setValue(operationContact.operationContactLastName),
                      formGroup.controls.operationContactTitle.setValue(operationContact.operationContactTitle),
                      formGroup.controls.operationContactEmail.setValue(operationContact.operationContactEmail),
                      formGroup.controls.operationContactCountryCode.setValue(
                        operationContact.operationContactCountryCode
                      ),
                      formGroup.controls.operationContactAreaCode.setValue(operationContact.operationContactAreaCode),
                      formGroup.controls.operationContactPhoneNumber.setValue(
                        operationContact.operationContactPhoneNumber
                      );
                    formGroup.controls.operationContactOrder.setValue(operationContact.operationContactOrder);
                  })
                )
                .subscribe(() => {
                  this.operationContactsOriginal.push(operationContact.operationContactId);
                  /**
                   * Since subscriptions finish in reverse order
                   * we count down the index to zero and then
                   * set our flag
                   */
                  if (this.operationContactsOriginal.length == formArray.controls.length) {
                    this.notificationsLoaded = true;
                  }
                });
            });
            return operationContacts;
          } else {
            this.addAdditionalOperationContact();
            this.notificationsLoaded = true;
          }
        })
      )
      .subscribe(() => {});
  }

  armForm() {
    this.userService.getAllUsers().subscribe((users: User[]) => {
      this.availableUsers = users;
    });
    this.userService.getAllManagerUsers().subscribe((users: User[]) => {
      this.availableManagers = users;
    });
  }
  updateOperation(operation: Operation) {
    this.operation = operation[0];
    var operationFormControls = this.operationForm.get('operation') as FormGroup;
    operationFormControls.controls.operationId.setValue(this.operation.operationId);
    operationFormControls.controls.operationName.setValue(this.operation.operationName);
    operationFormControls.controls.operationGroupId.setValue(this.operation.operationGroupId);
    operationFormControls.controls.operationAddress.setValue(this.operation.operationAddress);
    operationFormControls.controls.operationCity.setValue(this.operation.operationCity);
    operationFormControls.controls.operationState.setValue(this.operation.operationState);
    operationFormControls.controls.operationZip.setValue(this.operation.operationZip);
    operationFormControls.controls.operationCountryCode.setValue(this.operation.operationCountryCode);
    operationFormControls.controls.operationAreaCode.setValue(this.operation.operationAreaCode);
    operationFormControls.controls.operationPhoneNumber.setValue(this.operation.operationPhoneNumber);
    operationFormControls.controls.operationActive.setValue(this.operation.operationActive ? '1' : '0');
  }

  addAdditionalOperationContact() {
    let formArray = this.operationForm.controls.operationContacts as FormArray;
    var count = formArray.length;

    let contactFormGroup = this.fb.group({});
    contactFormGroup.addControl('operationContactFirstName', this.fb.control(''));
    contactFormGroup.addControl('operationContactLastName', this.fb.control(''));
    contactFormGroup.addControl('operationContactTitle', this.fb.control(''));
    contactFormGroup.addControl('operationContactCountryCode', this.fb.control('1'));
    contactFormGroup.addControl('operationContactPhoneNumber', this.fb.control(''));
    contactFormGroup.addControl('operationContactAreaCode', this.fb.control(''));
    contactFormGroup.addControl('operationContactEmail', this.fb.control(''));
    contactFormGroup.addControl(
      'operationContactOrder',
      this.fb.control({
        value: count + 1,
        disabled: true
      })
    );
    formArray.push(contactFormGroup);

    let notificationsFormControlArray = this.fb.array([]);
    let i;
    for (i = 0; i < this.notificationTypes.length; i++) {
      let newFormGroup = this.fb.group({});
      let notificationTypeId = this.notificationTypes[i].notificationTypeId.toString();
      var newControl = new FormControl(true);
      newFormGroup.addControl(notificationTypeId, newControl);
      notificationsFormControlArray.push(newFormGroup);
    }
    contactFormGroup.addControl('operationContactNotifications', notificationsFormControlArray);

    if (this.operationContacts.length == formArray.length) {
      return;
    }

    this.operationContacts.push({
      operationContactId: null,
      operationContactOrder: this.operationContacts.length + 1
    });
  }

  private createForm() {
    this.operationForm = this.fb.group({
      operation: this.fb.group({
        operationActive: this.fb.control(this.operation.operationActive, [Validators.required]),
        operationId: this.fb.control(this.operation.operationId, [Validators.required]),
        operationGroupId: this.fb.control(this.operation.operationGroupId, [Validators.required]),
        operationName: this.fb.control(this.operation.operationName, [Validators.required]),
        operationAddress: this.fb.control(this.operation.operationAddress),
        operationCity: this.fb.control(this.operation.operationCity),
        operationState: this.fb.control(this.operation.operationState),
        operationZip: this.fb.control(this.operation.operationZip),
        operationCountryCode: this.fb.control(this.operation.operationCountryCode),
        operationAreaCode: this.fb.control(this.operation.operationAreaCode),
        operationPhoneNumber: this.fb.control(this.operation.operationPhoneNumber)
      }),
      operationContacts: this.fb.array([]),
      operationManagers: this.fb.array([]),
      operationCallReps: this.fb.array([])
    });
  }

  operationPutFactory(formSubmission: any): OperationPutBody {
    try {
      var operationCountryCode = '';
      var operationAreaCode = '';
      if (formSubmission.operation.operationCountryCode) {
        operationCountryCode = formSubmission.operation.operationCountryCode.toString();
      }
      if (formSubmission.operation.operationAreaCode) {
        operationAreaCode = formSubmission.operation.operationAreaCode.toString();
      }
      var payload = {
        operationName: formSubmission.operation.operationName,
        operationGroupId: parseInt(formSubmission.operation.operationGroupId),
        operationAddress: formSubmission.operation.operationAddress ? formSubmission.operation.operationAddress : '',
        operationCity: formSubmission.operation.operationCity ? formSubmission.operation.operationCity : '',
        operationState: formSubmission.operation.operationState ? formSubmission.operation.operationState : '',
        operationZip: formSubmission.operation.operationZip ? formSubmission.operation.operationZip : '',
        operationCountryCode: operationCountryCode ? operationCountryCode : '',
        operationAreaCode: operationAreaCode ? operationAreaCode : '',
        operationPhoneNumber: formSubmission.operation.operationPhoneNumber
          ? formSubmission.operation.operationPhoneNumber
          : '',
        operationActive: formSubmission.operation.operationActive ? 1 : 0
      };
      return <OperationPutBody>payload;
    } catch {
      throw 'Had a problem validating data in the operation form factory';
    }
  }

  operationGroupOnSelect(event: any, index: number) {
    let operationGroupId = event.target.value;
    this.operation.operationGroupId = operationGroupId;
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
  operationContactPutFactory(formContact: any): OperationContactPutBody {
    try {
      var operationCountryCode = '';
      var operationAreaCode = '';
      if (formContact.operationContactCountryCode) {
        operationCountryCode = formContact.operationContactCountryCode.toString();
      }
      if (formContact.operationContactAreaCode) {
        operationAreaCode = formContact.operationContactAreaCode.toString();
      }
      var payload = {
        operationContactOrder: formContact.operationContactOrder,
        operationContactFirstName: formContact.operationContactFirstName,
        operationContactLastName: formContact.operationContactLastName,
        operationContactTitle: formContact.operationContactTitle || '',
        operationContactCountryCode: operationCountryCode,
        operationContactAreaCode: operationAreaCode,
        operationContactPhoneNumber: formContact.operationContactPhoneNumber || '',
        operationContactEmail: formContact.operationContactEmail,
        operationContactActive: 1
      };
      return <OperationContactPutBody>payload;
    } catch (err) {
      console.log(err);
      throw 'Had a problem validating data in the operation contact put factory';
    }
  }
  operationContactPostFactory(formContact: any): OperationContactPostBody {
    try {
      var payload = {
        operationContactFirstName: formContact.operationContactFirstName,
        operationContactLastName: formContact.operationContactLastName,
        operationContactTitle: formContact.operationContactTitle,
        operationContactCountryCode: formContact.operationContactCountryCode.toString(),
        operationContactAreaCode: formContact.operationContactAreaCode,
        operationContactPhoneNumber: formContact.operationContactPhoneNumber,
        operationContactEmail: formContact.operationContactEmail,
        operationContactOrder: formContact.operationContactOrder,
        operationContactActive: 1
      };
      return <OperationContactPostBody>payload;
    } catch {
      throw 'Had a problem validating data in the call rep factory';
    }
  }
  onCancelSubmit() {
    // display a prompt to confirm
    if (confirm('Are you sure?')) {
      window.location.reload();
    }
    // do nothing
  }
  onFormSubmit() {
    if (!this.validateControls()) {
      return;
    }
    // Passing E2E

    let formSubmission = this.operationForm.getRawValue();
    /**
     * In order to see which contacts to add, we
     * filter this.operationContactsOriginal's values
     * vs. the current this.operationContacts array
     * by operationContactId
     */
    if (this.operationContacts.length) {
      this.operationContactsToAdd = this.operationContacts.filter(
        (operationContact: OperationContact, index: number) => {
          return this.operationContactsOriginal.indexOf(operationContact.operationContactId) == -1;
        }
      );

      /**
       * We should have a test here
       */
      // Passing E2E
      this.operationContactsToAdd.forEach((operationContact: OperationContact, idx: number) => {
        let addOffset = formSubmission.operationContacts.length - 1 - idx;
        let formContact = formSubmission.operationContacts[addOffset];

        /**
         * We get the formContact object from the formSubmission
         */
        let operationContactPost = this.operationContactPostFactory(formContact);
        this.operationContactsService
          .addOperationContactByOperationId(this.operation.operationId, operationContactPost)
          .subscribe((data: any) => {
            if (data !== null) {
              this.toastr.success('Operation contact successfully added');
              var operationContactId = data.operationContactId;
              var notificationsToAdd = new Array();
              formContact.operationContactNotifications.forEach((notificationType: any | boolean) => {
                if (notificationType[Object.keys(notificationType)[0]] == true) {
                  notificationsToAdd.push(parseInt(Object.keys(notificationType)[0]));
                }
              });
              var count = 0;
              var finalCount = notificationsToAdd.length;
              notificationsToAdd.forEach((notificationTypeId: number) => {
                var notificationReceipientPostBody = {
                  notificationOperationContactId: operationContactId,
                  notificationOperationId: this.operation.operationId,
                  notificationTypeId: notificationTypeId,
                  notificationRecipientEmail: formContact.operationContactEmail
                };
                // Now that we have the contact, we add them to the notification recipients table
                this.notificationRecipientService
                  .addNotificationRecipientByOperationContactId(notificationReceipientPostBody)
                  .subscribe(() => {
                    count++;
                    let operationPut = this.operationPutFactory(formSubmission);
                    if (count == finalCount) {
                      this.operationService
                        .editOperationByOperationId(this.operation.operationId, operationPut)
                        .subscribe(() => {
                          this.toastr.success('Operation successfully edited');
                          window.location.href = '/operations';
                        });
                    }
                  });
              });
            }
          });
      });

      /**
       * We simply filter out those that aren't to be added
       * by comparing the operationContactId vs. the original array,
       * and edit the rest.
       */
      this.operationContactsToEdit = this.operationContacts.filter(
        (operationContact: OperationContact, index: number) => {
          return this.operationContactsToAdd.indexOf(operationContact) == -1;
        }
      );

      // Passing E2E
      this.operationContactsToEdit.forEach((operationContact: OperationContact, idx: number) => {
        let formContact = formSubmission.operationContacts[idx];
        let operationContactPut = this.operationContactPutFactory(formContact);
        this.operationContactsService
          .editOperationContactByOperationContactId(
            this.operation.operationId,
            operationContact.operationContactId,
            operationContactPut
          )
          .subscribe(() => {
            this.toastr.success('Operation contact successfully edited');
            var operationContactId = operationContact.operationContactId;
            var notificationsToAdd = new Array();
            formContact.operationContactNotifications.forEach((notificationType: any | boolean, index: number) => {
              // Add to our notification add array if the value of the notificationTypeId (key) is true
              if (notificationType[Object.keys(notificationType)[0]] == true) {
                notificationsToAdd.push(parseInt(Object.keys(notificationType)[0]));
              }
            });
            var count = 0;
            var finalCount = notificationsToAdd.length;
            notificationsToAdd.forEach((notificationTypeId: number) => {
              var notificationReceipientPostBody = {
                notificationOperationContactId: operationContactId,
                notificationOperationId: this.operation.operationId,
                notificationTypeId: notificationTypeId,
                notificationRecipientEmail: formContact.operationContactEmail
              };
              // Now that we have the contact, we add them to the notification recipients table
              this.notificationRecipientService
                .addNotificationRecipientByOperationContactId(notificationReceipientPostBody)
                .subscribe(() => {
                  count++;
                  let operationPut = this.operationPutFactory(formSubmission);
                  if (count == finalCount) {
                    this.operationService
                      .editOperationByOperationId(this.operation.operationId, operationPut)
                      .subscribe(() => {
                        window.location.href = '/operations';
                      });
                  }
                });
            });
          });
      });
      /**
       * Test
       */

      if (this.operationContactsToRemove) {
        this.operationContactsToRemove.forEach((operationContactId: number, index: number) => {
          if (operationContactId != null) {
            this.operationContactsService
              .deactivateOperationContactByOperationContactId(this.operation.operationId, operationContactId)
              .subscribe(() => {
                this.toastr.success('Successfully removed operation contact');
              });
          }
        });
      }
    } else {
      let operationPut = this.operationPutFactory(formSubmission);
      if (this.operationContactsToRemove) {
        var count = 0;
        var finalCount = this.operationContactsToRemove.length;
        this.operationContactsToRemove.forEach((operationContactId: number, index: number) => {
          if (operationContactId != null) {
            this.operationContactsService
              .deactivateOperationContactByOperationContactId(this.operation.operationId, operationContactId)
              .subscribe(() => {
                count++;
                this.toastr.success('Successfully removed operation contact');
                if (count == finalCount) {
                  this.operationService
                    .editOperationByOperationId(this.operation.operationId, operationPut)
                    .subscribe(() => {
                      window.location.href = '/operations';
                    });
                }
              });
          }
        });
      } else {
        this.operationService.editOperationByOperationId(this.operation.operationId, operationPut).subscribe(() => {
          window.location.href = '/operations';
        });
      }
    }
  }

  removeOperationContact(idx: number) {
    this.operationContactsToRemove.push(this.operationContacts[idx].operationContactId);
    this.operationContacts.splice(idx, 1);
    let formGroup = this.operationForm.controls.operationContacts as FormArray;
    formGroup.at(idx).clearValidators();
    formGroup.at(idx).updateValueAndValidity();
    formGroup.removeAt(idx);
    this.operationContacts.forEach((operationContact, idx) => {
      this.operationContacts[idx].operationContactOrder = idx + 1;
    });
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
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
    if (firstError) {
      // scroll(firstError);
      alert('Validation error. Please check submitted fields');
      return false;
    } else {
      return true;
    }
  }
  ngOnDestroy() {
    this.operationContacts = null;
    this.operationContactsOriginal = null;
  }
}
