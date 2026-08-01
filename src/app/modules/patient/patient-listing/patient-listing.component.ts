import { Component, OnInit, Input, ChangeDetectorRef, AfterViewInit, ViewChild } from '@angular/core';
import { Operation } from '@app/modules/operation/operation';
import { Patient } from '@app/modules/patient/patient';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '@app/modules/user/user';
import { ActivatedRoute } from '@angular/router';
import { PatientService } from '../patient.service';
import { OperationService } from '@app/modules/operation/operation.service';
import { LocationStrategy } from '@angular/common';
import { IonContent } from '@ionic/angular';

@Component({
  selector: 'app-patient-listing',
  templateUrl: './patient-listing.component.html',
  styleUrls: ['./patient-listing.component.scss'],
  standalone: false
})
export class PatientListingComponent implements OnInit, AfterViewInit {
  componentName: string = 'PatientListing';

  @Input() operation: Operation;
  @ViewChild(IonContent) content: IonContent;
  filterDate: Date;
  mode: any = {
    spanish: false
  };
  public patients: Patient[];
  public patients$: Observable<Patient[]> | null = null;
  patientsLoaded: boolean = false;

  public selected:
    | {
        filterDate: string;
        operation: Operation;
        operation$: Observable<Operation>;
      }
    | any = {};
  user: User;
  constructor(
    private _cdr: ChangeDetectorRef,
    private patientService: PatientService,
    private operationService: OperationService,
    private route: ActivatedRoute,
    private location: LocationStrategy
  ) {}

  async ngAfterViewInit() {
    if (!this.content) {
      return;
    }

    // Ensure scroll works in newer Chrome by enforcing overflow on the inner element
    const scrollEl = await this.content.getScrollElement();
    scrollEl.style.overflow = 'auto';
    scrollEl.style.overflowY = 'scroll';
    scrollEl.style.height = '100%';
  }

  ngOnInit() {
    this.user = this.route.snapshot.data.user;
    this.mode.spanish = this.route.snapshot.data.mode == 'spanish';

    if (this.mode.spanish) {
      return;
    }

    this.route.paramMap.subscribe((paramMap: any) => {
      const operationId = paramMap.get ? paramMap.get('operationId') : paramMap.params?.operationId;
      const selectedOperation = this.resolveOperationFromUserContext(operationId);

      if (selectedOperation) {
        this.selected.operation = selectedOperation;
        return;
      }

      if (!operationId) {
        this.selected.operation = null;
        return;
      }

      this.operationService.getOperationByOperationId(operationId).subscribe((data: Operation | Operation[]) => {
        const operation = Array.isArray(data) ? data[0] : data;
        this.selected.operation = operation || this.resolveOperationFromUserContext();
      });
    });
  }

  handleDateFilterChangeEvent($event: string) {
    this.selected.filterDate = $event;
  }
  operationChangeEventHandler($event: Operation) {
    this.selected.operation = $event;
    this.patients$ = this.patientService.getPatientsByOperationId(this.selected.operation.operationId).pipe(
      map((patients: Patient[]) => {
        this.patients = patients;
        this._cdr.detectChanges();
        return patients;
      })
    );
  }
  ngOnDestroy() {
    this.patients = null;
  }

  private resolveOperationFromUserContext(operationId?: string | null): Operation | null {
    for (const operationGroup of this.user?.operationGroups || []) {
      const operations = operationGroup?.operations || [];

      if (operationId) {
        const matchingOperation = operations.find((operation: Operation) => String(operation?.operationId) === String(operationId));

        if (matchingOperation) {
          return {
            ...matchingOperation,
            operationGroupName: matchingOperation.operationGroupName || operationGroup.operationGroupName,
            operationGroupShortName: matchingOperation.operationGroupShortName || operationGroup.operationGroupShortName
          };
        }

        continue;
      }

      if (!operations.length) {
        continue;
      }

      const activeOperation = operations.find((operation: Operation) => operation.operationActive !== 0);
      return activeOperation || operations[0];
    }

    return null;
  }

  private getDefaultOperationFromUser(): Operation | null {
    for (const operationGroup of this.user?.operationGroups || []) {
      if (!operationGroup.operations || !operationGroup.operations.length) {
        continue;
      }
      const activeOperation = operationGroup.operations.find((operation: Operation) => operation.operationActive !== 0);
      return activeOperation || operationGroup.operations[0];
    }
    return null;
  }
}
