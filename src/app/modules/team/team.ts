export interface TeamMessage {
  teamId: number;
  teamMessageId: number;
  teamMessageFromId: number;
  teamMessageFromUserFirstName?: string;
  teamMessageFromUserLastName?: string;
  teamMessageRecipientId: number;
  teamMessageSubject?: string;
  messageBody: string;
}
export interface Team {
  teamId: number;
  teamName: string;
  teamManagerSidebarDropdownOpen?: boolean;
  teamCareRepSidebarDropdownOpen?: boolean;
  teamSpanishSidebarDropdownOpen?: boolean;
  teamMembers?: TeamMember[];
  teamManagers?: TeamMember[];
  teamCareReps?: TeamMember[];
  teamSpanishSpeaking?: TeamMember[];
}

export interface TeamMember {
  userTeamId: number;
  userId?: number;
  teamId?: number;
  teamMemberId: number;
  teamMemberFirstName: string;
  teamMemberLastName: string;
  teamMemberRoleLabel?: string;
  teamMemberEmail?: string;
  teamMemberPhoneNumber?: string;
  spanishSpeaking?: boolean;
  needToKnow?: any;
}
