export interface TeamMessage {
  messageId: number;
  teamMessageFrom: string;
  teamMessageSubject: string;
  teamMessageContent: string;
}
export interface Team {
  teamId: number;
  teamName: string;
}

export interface TeamMember {
  teamMemberId: number;
  teamMemberFirstName: string;
  teamMemberLastName: string;
}
