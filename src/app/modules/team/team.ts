export interface TeamMessage {
  teamId: string;
  teamMessageId: string;
  teamMessageFromId: string;
  teamMessageFromUserFirstName?: string;
  teamMessageFromUserLastName?: string;
  teamMessageRecipientId: string;
  teamMessageSubject?: string;
  messageBody: string;
}
export interface Team {
  teamId: string;
  teamName: string;
  teamActive?: number;
  roleGroupSidebarOpen?: { [roleGroup: string]: boolean };
  teamManagerSidebarDropdownOpen?: boolean;
  teamCareRepSidebarDropdownOpen?: boolean;
  teamSpanishSidebarDropdownOpen?: boolean;
  teamMembers?: TeamMember[];
  teamManagers?: TeamMember[];
  teamCareReps?: TeamMember[];
  teamSpanishSpeaking?: TeamMember[];
}

export interface TeamMember {
  userTeamId: string;
  userId?: string;
  teamId?: string;
  teamMemberId: string;
  teamMemberHired: string;
  teamMemberFirstName: string;
  teamMemberLastName: string;
  teamMemberRoleLabel?: string;
  teamMemberEmail?: string;
  teamMemberBirthday?: string;
  teamMemberPhoneNumber?: string;
  spanishSpeaking?: boolean;
  needToKnow?: any;
}

export interface TeamOperationAssignment {
  teamOperationAssignmentId?: string;
  teamId: string;
  operationId: string;
  operationGroupId?: string;
  operationGroupName?: string;
  operationGroupShortName?: string;
  operationName?: string;
  operationActive?: number;
  operationUserRoleLabelId: number;
  operationUserRoleLabel?: string;
}

export interface TeamOperationAssignmentPutItem {
  operationId: string;
  operationUserRoleLabelId: number;
}

export type TeamMemberOperationAccessMode = 'default' | 'override' | 'revoke';

export interface TeamMemberOperationAccessEntry {
  teamId: string;
  teamMemberId: string;
  userId?: string;
  operationGroupId?: string;
  operationGroupName?: string;
  operationGroupShortName?: string;
  operationId: string;
  operationName?: string;
  operationActive?: number;
  teamOperationUserRoleLabelId?: number;
  teamOperationUserRoleLabel?: string;
  memberAccessMode?: TeamMemberOperationAccessMode;
  memberOverrideOperationUserRoleLabelId?: number;
  memberOverrideOperationUserRoleLabel?: string;
  directOperationUserRoleLabelId?: number;
  directOperationUserRoleLabel?: string;
  effectiveOperationUserRoleLabelId?: number;
  effectiveOperationUserRoleLabel?: string;
  effectiveAccessSourceLabel?: string;
}

export interface TeamMemberOperationAccessPutItem {
  operationId: string;
  accessMode: Exclude<TeamMemberOperationAccessMode, 'default'>;
  operationUserRoleLabelId?: number;
}
