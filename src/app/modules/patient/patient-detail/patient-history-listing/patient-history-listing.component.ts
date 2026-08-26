import { Component, OnInit, Input } from '@angular/core';
import { PatientCall } from '@app/modules/patient/patient-detail/patient-call/patient-call.service';
import {
  PatientCallQuestion,
  PatientCallQuestionsService
} from '@app/modules/patient/patient-detail/patient-call/patient-call-questions/patient-call-questions.service';
import { Notification, NotificationReply } from '@app/modules/notification/notification';
import { NotificationService } from '@app/modules/notification/notification.service';
import { Patient } from '../../patient';
import { SharedFunctions } from '@app/shared/shared.functions';
import { User, UserRoles } from '@app/modules/user/user';
import { Operation } from '@app/modules/operation/operation';

@Component({
  providers: [SharedFunctions, NotificationService],
  selector: 'app-patient-history-listing',
  templateUrl: './patient-history-listing.component.html',
  styleUrls: ['./patient-history-listing.component.scss'],
  standalone: false
})
export class PatientHistoryListingComponent implements OnInit {
  @Input() patient!: Patient;
  @Input() user!: User;
  @Input() patientCalls!: PatientCall[];
  @Input() patientNotifications!: Notification[];
  patientActivity: [Notification[] | PatientCall[]] | any;
  patientFirstCallIndexCallId = '';
  patientHistory: PatientCall[] = [];
  patientCallQuestions: PatientCallQuestion[] = [];

  constructor(
    private patientCallQuestionService: PatientCallQuestionsService,
    private notificationService: NotificationService,
    private sharedFunctions: SharedFunctions
  ) {}

  ngOnInit() {
    this.patientActivity = [];
    this.hydratePatientCallQuestions();

    /**
     * Combine the patientCalls and patientNotifications and sort them by the date that they occurred.
     */
    if (this.patientCalls) {
      this.patientCalls.forEach((patientCall, index) => {
        if (index == 0) {
          this.patientFirstCallIndexCallId = patientCall.patientCallId;
        }
        // we safety check here just in case patientCallNotes slipped past as null (shouldn't happen but it has)
        if (patientCall.patientCallNotes != null) {
          patientCall.patientCallNotes = this.sharedFunctions.returnHTML(patientCall.patientCallNotes);
        }
        this.patientActivity.push(patientCall);
      });
    }
    if (this.patientNotifications) {
      const visibleNotificationIds = new Set(
        this.patientNotifications
          .filter(notification => this.canViewNotificationReply(notification))
          .map(notification => notification.notificationId)
      );

      if (visibleNotificationIds.size && this.patient?.patientId) {
        this.notificationService
          .getNotificationRepliesByPatientId(this.patient.patientId)
          .subscribe((replies: NotificationReply[]) => {
            const repliesByNotificationId = (replies || []).reduce((grouped, reply) => {
              if (visibleNotificationIds.has(reply.notificationId)) {
                grouped[reply.notificationId] = grouped[reply.notificationId] || [];
                grouped[reply.notificationId].push(reply);
              }
              return grouped;
            }, {} as Record<string, NotificationReply[]>);

            this.patientNotifications.forEach(notification => {
              if (visibleNotificationIds.has(notification.notificationId)) {
                (notification as any).notificationReplies = repliesByNotificationId[notification.notificationId] || [];
              }
            });
          });
      }

      this.patientNotifications.forEach(patientNotification => {
        patientNotification.notificationMessage = this.sharedFunctions.returnHTML(
          patientNotification.notificationMessage
        );
        this.patientActivity.push(patientNotification);
      });
    }

    this.patientActivity = this.patientActivity.sort(function(a: any, b: any) {
      if (a.notificationCreatedTime) {
        var createdDate = a.notificationCreatedTime ? a.notificationCreatedTime : a.patientCallStartTime;
        var createdCompareDate = b.notificationCreatedTime ? b.notificationCreatedTime : b.patientCallStartTime;
      } else {
        var createdDate = a.patientCallStartTime ? a.patientCallStartTime : a.notificationCreatedTime;
        var createdCompareDate = b.patientCallStartTime ? b.patientCallStartTime : b.notificationCreatedTime;
      }
      return new Date(createdCompareDate).getTime() - new Date(createdDate).getTime();
    });
  }

  canViewNotificationReply(notification: Notification): boolean {
    if (!notification?.notificationId) {
      return false;
    }

    if (this.user?.userLevel === UserRoles.admin) {
      return true;
    }

    const operationId = this.patient?.patientOperationId || notification?.notificationOperationId;
    if (!operationId || !Array.isArray(this.user?.operations)) {
      return false;
    }

    const matchingOperation = (this.user.operations as Operation[]).find(
      (operation: Operation) => operation?.operationId === operationId
    );

    if (!matchingOperation) {
      return false;
    }

    const candidateRoleIds = [
      Number(matchingOperation.operationUserRoleLabelId),
      Number(matchingOperation.directOperationUserRoleLabelId),
      Number(matchingOperation.inheritedOperationUserRoleLabelId)
    ].filter(roleId => Number.isFinite(roleId) && roleId > 0);

    return candidateRoleIds.some(roleId => roleId === 1 || roleId === 2);
  }

  private hydratePatientCallQuestions() {
    const contactedCallIds = new Set(
      (this.patientCalls || [])
        .filter((patientCall: PatientCall) => patientCall?.patientCallStatusLabel === 'Contacted' && !!patientCall?.patientCallId)
        .map((patientCall: PatientCall) => patientCall.patientCallId)
    );

    if (!contactedCallIds.size || !this.patient?.patientId) {
      return;
    }

    this.patientCallQuestionService
      .getPatientCallQuestionsWithAnswersByPatientId(this.patient.patientId)
      .subscribe((patientCallQuestions: PatientCallQuestion[]) => {
        const questionsByCallId = (patientCallQuestions || []).reduce((grouped, question) => {
          if (question?.patientCallId && contactedCallIds.has(question.patientCallId)) {
            grouped[question.patientCallId] = grouped[question.patientCallId] || [];
            grouped[question.patientCallId].push(question);
          }
          return grouped;
        }, {} as Record<string, PatientCallQuestion[]>);

        this.patientCalls.forEach((patientCall: PatientCall) => {
          if (contactedCallIds.has(patientCall.patientCallId)) {
            patientCall.patientCallQuestions = questionsByCallId[patientCall.patientCallId] || [];
          }
        });
      });
  }
}
