import { Component, OnInit, Renderer2, Injectable, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, from, throwError, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { OperationService, Operation } from '../operation.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { OperationCallRepsService, OperationCallRep } from '../operation-callreps.service';
import { OperationContactsService } from '../operation-contacts.service';
import { User, UserService } from '@app/modules/user/user.service';
import { NotificationTypes, NotificationService } from '@app/modules/notification/notification.service';
import { OperationResolver } from '../operation-resolver';
import { OperationPutBody } from '../operation';

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
  operationCallReps$: Observable<OperationCallRep>;
  user: User;

  constructor(
    private fb: FormBuilder,
    private notificationService: NotificationService,
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
      console.log(this.notificationTypes);
      return data;
    });
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
          return data;
        })
      );
    } else {
      this.operation$ = this.operationService.getOperationByOperationId(this.operation.operationId);
      this.createForm();
    }
    this.availableUsers$ = this.userService.getAllUsers();
    this.availableManagers$ = this.userService.getAllManagerUsers();
  }
  addOperationCallRep() {
    alert('adding operation call rep');
  }

  addAdditionalContact() {
    alert('adding additional contact');
  }
  private createForm() {
    this.operationForm = this.fb.group({
      operation: this.fb.group({
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
        0: this.fb.control(''),
        1: this.fb.control(''),
        2: this.fb.control(''),
        3: this.fb.control(''),
        4: this.fb.control(''),
        5: this.fb.control(''),
        6: this.fb.control('')
      })
    });
  }

  operationFormFactory(formSubmission: FormData): OperationPutBody {
    try {
      var payload = {};
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
    // this.operationCallRepsService
    // this.operationContactsService
  }
  public toggleOperationUserAssignedMenu = function() {
    this.isOpen = !this.isOpen;
  };
}
