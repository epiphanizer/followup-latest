import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs/operators';
import { User } from '@app/modules/user/user';
import { UserService } from '@app/modules/user/user.service';
import { OperationGroup, OperationGroupPutBody } from '../operation';
import { OperationService } from '../operation.service';

@Component({
  selector: 'app-operation-group-form',
  templateUrl: './operation-group-form.component.html',
  styleUrls: ['./operation-group-form.component.scss'],
  providers: [ToastrService],
  standalone: false
})
export class OperationGroupFormComponent implements OnInit {
  user: User;
  operationGroup: OperationGroup | null = null;
  operationGroupForm: FormGroup;
  isLoading = false;
  isArchiving = false;
  isRestoring = false;
  loadError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private operationService: OperationService,
    private userService: UserService,
    private toastrService: ToastrService
  ) {}

  ngOnInit() {
    this.user = this.route.snapshot.data.user || ({} as User);
    const operationGroupId = this.route.snapshot.paramMap.get('operationGroupId');
    this.loadOperationGroup(operationGroupId);
  }

  private loadOperationGroup(operationGroupId: string | null) {
    if (!operationGroupId) {
      this.loadError = 'A client id is required to edit this record.';
      return;
    }

    this.isLoading = true;
    this.operationService
      .getAllOperationGroups()
      .pipe(take(1))
      .subscribe({
        next: (operationGroups: OperationGroup[]) => {
          const operationGroup = this.findOperationGroup(operationGroupId, operationGroups);

          if (operationGroup) {
            this.setOperationGroup(operationGroup);
            this.isLoading = false;
            return;
          }

          this.loadOperationGroupDetails(operationGroupId);
        },
        error: () => {
          this.loadOperationGroupDetails(operationGroupId);
        }
      });
  }

  private loadOperationGroupDetails(operationGroupId: string) {
    this.operationService
      .getOperationGroupByOperationGroupId(operationGroupId)
      .pipe(take(1))
      .subscribe({
        next: (operationGroup: OperationGroup) => {
          if (!operationGroup) {
            this.loadError = 'Unable to load this client record.';
            this.isLoading = false;
            return;
          }

          this.setOperationGroup(operationGroup);
          this.isLoading = false;
        },
        error: () => {
          this.loadError = 'Unable to load this client record.';
          this.isLoading = false;
        }
      });
  }

  private setOperationGroup(operationGroup: OperationGroup) {
    this.operationGroup = operationGroup;
    this.operationGroupForm = this.fb.group({
      operationGroupName: this.fb.control(operationGroup.operationGroupName || '', [Validators.required]),
      operationGroupShortName: this.fb.control(operationGroup.operationGroupShortName || '', [Validators.required])
    });
  }

  private findOperationGroup(operationGroupId: string, operationGroups: OperationGroup[] | any): OperationGroup | null {
    if (!Array.isArray(operationGroups)) {
      return null;
    }

    return (
      operationGroups.find((operationGroup: OperationGroup) => operationGroup.operationGroupId === operationGroupId) ||
      null
    );
  }

  onSubmit() {
    if (!this.operationGroup?.operationGroupId || !this.operationGroupForm?.valid) {
      return;
    }

    const formSubmission = this.operationGroupForm.getRawValue();
    const operationGroupPutBody: OperationGroupPutBody = {
      operationGroupName: (formSubmission.operationGroupName || '').trim(),
      operationGroupShortName: (formSubmission.operationGroupShortName || '').trim()
    };

    this.operationService
      .editOperationGroupByOperationGroupId(this.operationGroup.operationGroupId, operationGroupPutBody)
      .pipe(take(1))
      .subscribe((result: OperationGroup | OperationGroup[]) => {
        const updatedOperationGroup = Array.isArray(result) ? result[0] : result;
        if (!updatedOperationGroup) {
          this.loadError = 'Unable to update this client record.';
          return;
        }

        this.applyOperationGroupRename(updatedOperationGroup);
        this.operationService.notifyClientGroupsChanged();
        this.userService.updateOperations(this.user).catch(() => {});
        this.toastrService
          .success('Successfully updated client')
          .onShown.pipe(take(1))
          .subscribe(() => {
            this.router.navigate(['/clients', updatedOperationGroup.operationGroupId]);
          });
      });
  }

  onCancel() {
    if (this.operationGroup?.operationGroupId) {
      this.router.navigate(['/clients', this.operationGroup.operationGroupId]);
      return;
    }

    this.router.navigate(['/clients']);
  }

  onArchive() {
    if (!this.operationGroup?.operationGroupId || this.isArchiving) {
      return;
    }

    const operationGroupId = this.operationGroup.operationGroupId;

    if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
      const confirmed = window.confirm(
        'Archive this client? This is a soft delete that removes it from active client workflows.'
      );
      if (!confirmed) {
        return;
      }
    }

    this.isArchiving = true;
    this.loadError = null;

    this.operationService
      .deactivateOperationGroupByOperationGroupId(operationGroupId)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.handleArchiveSuccess(operationGroupId);
        },
        error: (error: any) => {
          this.verifyArchiveStateAfterError(operationGroupId, error);
        }
      });
  }

  onRestore() {
    if (!this.operationGroup?.operationGroupId || this.isRestoring) {
      return;
    }

    const operationGroupId = this.operationGroup.operationGroupId;

    if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
      const confirmed = window.confirm('Restore this client to active client workflows?');
      if (!confirmed) {
        return;
      }
    }

    this.isRestoring = true;
    this.loadError = null;

    this.operationService
      .restoreOperationGroupByOperationGroupId(operationGroupId)
      .pipe(take(1))
      .subscribe({
        next: () => {
          if (this.operationGroup) {
            this.operationGroup.operationGroupActive = 1;
          }
          this.operationService.notifyClientGroupsChanged();
          this.userService.updateOperations(this.user).catch(() => {});
          this.isRestoring = false;
          this.toastrService
            .success('Successfully restored client')
            .onShown.pipe(take(1))
            .subscribe(() => {
              this.router.navigate(['/clients', operationGroupId]);
            });
        },
        error: (error: any) => {
          this.isRestoring = false;
          const detail = String(error?.detail || error?.message || '').trim();
          this.loadError = detail
            ? `Unable to restore this client record. ${detail}`
            : 'Unable to restore this client record.';
        }
      });
  }

  private verifyArchiveStateAfterError(operationGroupId: string, error: any) {
    this.operationService
      .getOperationGroups()
      .pipe(take(1))
      .subscribe({
        next: (operationGroups: OperationGroup[]) => {
          const stillActive = (operationGroups || []).some(
            (operationGroupRecord: OperationGroup) => operationGroupRecord.operationGroupId === operationGroupId
          );

          if (!stillActive) {
            this.handleArchiveSuccess(operationGroupId);
            return;
          }

          this.isArchiving = false;
          this.loadError = this.getArchiveFailureMessage(error);
        },
        error: () => {
          this.isArchiving = false;
          this.loadError = this.getArchiveFailureMessage(error);
        }
      });
  }

  private getArchiveFailureMessage(error: any): string {
    const detail = String(error?.detail || error?.message || '').trim();
    if (detail) {
      return `Unable to archive this client record. ${detail}`;
    }

    return 'Unable to archive this client record. If this client must be restored later, there is currently no self-service unarchive action in the UI.';
  }

  private handleArchiveSuccess(operationGroupId: string) {
    this.removeOperationGroupFromCaches(operationGroupId);
    this.operationService.notifyClientGroupsChanged();
    this.userService.updateOperations(this.user).catch(() => {});
    this.isArchiving = false;
    this.toastrService
      .success('Successfully archived client')
      .onShown.pipe(take(1))
      .subscribe(() => {
        this.router.navigate(['/clients']);
      });
  }

  private applyOperationGroupRename(operationGroup: OperationGroup) {
    this.operationGroup = operationGroup;

    if (Array.isArray(this.user?.operationGroups)) {
      this.user.operationGroups = this.user.operationGroups.map((operationGroupRecord: OperationGroup) => {
        if (operationGroupRecord.operationGroupId === operationGroup.operationGroupId) {
          return {
            ...operationGroupRecord,
            operationGroupName: operationGroup.operationGroupName,
            operationGroupShortName: operationGroup.operationGroupShortName
          };
        }

        return operationGroupRecord;
      });
    }

    localStorage.setItem('operationGroups', JSON.stringify(this.user?.operationGroups || []));
    localStorage.setItem('followup-user', JSON.stringify(this.user));
  }

  private removeOperationGroupFromCaches(operationGroupId: string) {
    if (Array.isArray(this.user?.operationGroups)) {
      this.user.operationGroups = this.user.operationGroups.filter((operationGroupRecord: OperationGroup) => {
        return operationGroupRecord.operationGroupId !== operationGroupId;
      });
    }

    if (this.operationGroup?.operationGroupId === operationGroupId) {
      this.operationGroup = null;
    }

    localStorage.setItem('operationGroups', JSON.stringify(this.user?.operationGroups || []));
    localStorage.setItem('followup-user', JSON.stringify(this.user));
  }
}
