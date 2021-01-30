export interface TeamMessage {
  messageId: number;
  teamMessageFrom: string;
  teamMessageSubject: string;
  teamMessageContent: string;
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
  teamId?: number;
  teamMemberFirstName: string;
  teamMemberLastName: string;
  teamMemberRoleLabel?: string;
  spanishSpeaking?: boolean;
}
