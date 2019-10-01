export interface UserPostObject {}
export interface UserPutObject {
  userFirstName: string;
  userMiddleName?: string;
  userLastName: string;
  userPhoneCountryCode?: number;
  userPhoneAreaCode?: number;
  userPhoneNumber?: number;
  userDob?: Date;
}
