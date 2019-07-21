export class User {
  displayName: string;
  email: string;
  level: number;
  avatar: string;
  constructor(userId: number) {
    this.level = this.getUserLevel(userId);
  }

  private getUserLevel = function(userId: number) {
    let url = '/users' + userId;
    /**
     * Call to Graph to get the users group.
     
    POST /users/{id | userPrincipalName}/getMemberGroups
    securityEnabledOnly
    */
    // const result = someCall();

    return 1;
  };
}
