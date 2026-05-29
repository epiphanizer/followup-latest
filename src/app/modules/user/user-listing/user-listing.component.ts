import { Component, Inject, OnInit, ViewChild, DOCUMENT } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '@app/core';
import { IonContent } from '@ionic/angular';
import { UserService } from '../user.service';
import { User, UserRolesMap } from '../user';

interface DuplicateUserGroup {
  key: string;
  users: User[];
  collapsed: boolean;
  suggestedTargetUserId: string | null;
  selectedTargetUserId: string | null;
  mergeScript: string | null;
  mergeError: string | null;
  mergeLoading: boolean;
}

@Component({
  selector: 'app-user-listing',
  templateUrl: './user-listing.component.html',
  styleUrls: ['./user-listing.component.scss'],
  standalone: false
})
export class UserListingComponent implements OnInit {
  @ViewChild(IonContent) content: IonContent;

  user: User;
  users: User[] = [];
  usersFiltered: User[] = [];
  pageOfUsers: User[] = [];
  duplicateGroups: DuplicateUserGroup[] = [];
  isLoading = false;
  loadError: string | null = null;
  rosterColumns: string[] = ['Name', 'Role', 'Username', 'Modified', 'Issue'];
  selectedSortFlag = 'asc';
  selectedSortOption = 'Name';
  searchQuery = '';
  debugPanelExpanded = false;
  showAllDebugGroups = false;
  selectedDebugGroupKey: string | null = null;
  private duplicateGroupsByUserId = new Map<string, DuplicateUserGroup>();

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private route: ActivatedRoute,
    private authenticationService: AuthenticationService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.user = this.authenticationService.currentUserValue || this.route.snapshot.data.user;

    if (!this.isAdmin) {
      return;
    }

    this.loadUsers();
  }

  get isAdmin(): boolean {
    return this.getUserRoleValue(this.user) === 1;
  }

  get duplicateAccountCount(): number {
    return this.duplicateGroups.reduce((total, group) => {
      return total + group.users.length;
    }, 0);
  }

  get usersWithIssuesCount(): number {
    return this.duplicateGroupsByUserId.size;
  }

  get visibleUsers(): User[] {
    return this.pageOfUsers.length ? this.pageOfUsers : this.usersFiltered;
  }

  get hasDuplicateIssues(): boolean {
    return this.duplicateGroups.length > 0;
  }

  get visibleDebugGroups(): DuplicateUserGroup[] {
    if (!this.debugPanelExpanded) {
      return [];
    }

    if (this.showAllDebugGroups || !this.selectedDebugGroupKey) {
      return this.duplicateGroups;
    }

    return this.duplicateGroups.filter(group => group.key === this.selectedDebugGroupKey);
  }

  async jumpTo(sectionId: string) {
    const target = this.document.getElementById(sectionId);
    if (!target) {
      return;
    }

    if (
      !this.content ||
      typeof (this.content as any).getScrollElement !== 'function' ||
      typeof (this.content as any).scrollToPoint !== 'function'
    ) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    try {
      const scrollElement = await this.content.getScrollElement();
      const scrollTop = scrollElement ? scrollElement.scrollTop : 0;
      const scrollHostTop = scrollElement ? scrollElement.getBoundingClientRect().top : 0;
      const targetTop = target.getBoundingClientRect().top - scrollHostTop + scrollTop - 16;

      this.content.scrollToPoint(0, Math.max(0, targetTop), 300);
    } catch {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  jumpToGroup(group: DuplicateUserGroup) {
    group.collapsed = false;
    void this.jumpTo(this.getGroupSectionId(group));
  }

  openDebugPanel(group?: DuplicateUserGroup | null) {
    if (!group && !this.duplicateGroups.length) {
      return;
    }

    this.debugPanelExpanded = true;
    this.showAllDebugGroups = !group;
    this.selectedDebugGroupKey = group?.key || null;

    if (group) {
      group.collapsed = false;
    } else {
      this.expandAllGroups();
    }

    void this.jumpTo('user-debug-panel');
  }

  closeDebugPanel() {
    this.debugPanelExpanded = false;
    this.showAllDebugGroups = false;
    this.selectedDebugGroupKey = null;
  }

  toggleGroup(group: DuplicateUserGroup) {
    group.collapsed = !group.collapsed;
  }

  expandAllGroups() {
    this.duplicateGroups.forEach(group => {
      group.collapsed = false;
    });
  }

  collapseAllGroups() {
    this.duplicateGroups.forEach(group => {
      group.collapsed = true;
    });
  }

  handleSearchFilterEvent(searchQuery: string) {
    this.searchQuery = searchQuery || '';
    this.updateRosterUsers();
  }

  handleSortDirectionEvent(sortDirection: string) {
    this.selectedSortFlag = sortDirection === 'desc' ? 'desc' : 'asc';
    this.updateRosterUsers();
  }

  handleSortOptionEvent(sortOption: string) {
    this.selectedSortOption = sortOption || 'Name';
    this.updateRosterUsers();
  }

  onChangePage(pageOfUsers: User[]) {
    this.pageOfUsers = pageOfUsers || [];
  }

  getGroupSectionId(group: DuplicateUserGroup): string {
    return (
      'duplicate-group-' +
      String(group?.key || 'unknown')
        .replace(/[^a-z0-9]+/gi, '-')
        .toLowerCase()
    );
  }

  trackByGroup(index: number, group: DuplicateUserGroup): string | number {
    return group?.key || index;
  }

  trackByUser(index: number, account: User): string | number {
    return account?.userId || index;
  }

  getDuplicateGroupForUser(userId: string): DuplicateUserGroup | null {
    return this.duplicateGroupsByUserId.get(userId) || null;
  }

  hasUserDebugIssue(account: User): boolean {
    return !!this.getDuplicateGroupForUser(account?.userId);
  }

  getDebugLabel(account: User): string {
    return this.hasUserDebugIssue(account) ? 'Duplicate Login' : 'Clear';
  }

  getDebugCountLabel(account: User): string {
    const duplicateGroup = this.getDuplicateGroupForUser(account?.userId);
    return duplicateGroup ? duplicateGroup.users.length + ' linked accounts' : 'No issue detected';
  }

  getUserDisplayName(account: User): string {
    const firstName = account?.userFirstName || 'Unknown';
    const lastName = account?.userLastName || 'User';
    return (firstName + ' ' + lastName).trim();
  }

  getUserRoleLabel(account: User): string {
    switch (this.getUserRoleValue(account)) {
      case 1:
        return 'Admin';
      case 2:
        return 'Manager';
      case 3:
        return 'Care Team';
      default:
        return 'Unknown';
    }
  }

  getUserStatusLabel(account: User): string {
    if (account?.deleted) {
      return 'Deleted';
    }

    return account?.userActive ? 'Active' : 'Inactive';
  }

  selectTarget(group: DuplicateUserGroup, userId: string) {
    group.selectedTargetUserId = userId;
    group.mergeError = null;
    group.mergeScript = null;
  }

  generateMergeScript(group: DuplicateUserGroup, sourceUser: User) {
    if (!this.user?.userId) {
      group.mergeError = 'Admin access is required to generate merge scripts.';
      return;
    }

    if (!group.selectedTargetUserId || group.selectedTargetUserId === sourceUser.userId) {
      group.mergeError = 'Choose a different target account before generating a merge script.';
      return;
    }

    group.mergeLoading = true;
    group.mergeError = null;

    this.userService
      .generateUserMergeScript(this.user.userId, sourceUser.userId, group.selectedTargetUserId)
      .subscribe({
        next: response => {
          group.mergeScript = response?.mergeScript || null;
          group.mergeLoading = false;
        },
        error: () => {
          group.mergeLoading = false;
          group.mergeError = 'Unable to generate a merge script for this account pair.';
        }
      });
  }

  private loadUsers() {
    this.isLoading = true;
    this.loadError = null;
    this.userService.getAllUsers().subscribe({
      next: users => {
        this.users = users || [];
        this.duplicateGroups = this.buildDuplicateGroups(this.users);
        this.rebuildDuplicateGroupMap();
        this.updateRosterUsers();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.loadError = 'Unable to load users for admin review.';
      }
    });
  }

  private buildDuplicateGroups(users: User[]): DuplicateUserGroup[] {
    const groupedUsers = new Map<string, User[]>();

    users.forEach(user => {
      this.getCanonicalLoginKeys(user).forEach(key => {
        const existingUsers = groupedUsers.get(key) || [];
        if (!existingUsers.some(existingUser => existingUser.userId === user.userId)) {
          existingUsers.push(user);
          groupedUsers.set(key, existingUsers);
        }
      });
    });

    return Array.from(groupedUsers.entries())
      .map(([key, matchingUsers]) => {
        const sortedUsers = this.sortDuplicateUsers(matchingUsers);
        const suggestedTarget = sortedUsers[0];

        return {
          key,
          users: sortedUsers,
          collapsed: false,
          suggestedTargetUserId: suggestedTarget ? suggestedTarget.userId : null,
          selectedTargetUserId: suggestedTarget ? suggestedTarget.userId : null,
          mergeScript: null,
          mergeError: null,
          mergeLoading: false
        } as DuplicateUserGroup;
      })
      .filter(group => group.users.length > 1)
      .sort((left, right) => {
        if (right.users.length !== left.users.length) {
          return right.users.length - left.users.length;
        }

        return left.key.localeCompare(right.key);
      })
      .map((group, index) => {
        group.collapsed = index > 0;
        return group;
      });
  }

  private getCanonicalLoginKeys(user: User): string[] {
    const keys: string[] = [];

    [user?.username, user?.userEmail].forEach(value => {
      const normalizedValue = this.normalizeLoginKey(value);
      if (normalizedValue && keys.indexOf(normalizedValue) === -1) {
        keys.push(normalizedValue);
      }
    });

    return keys;
  }

  private sortDuplicateUsers(users: User[]): User[] {
    return users.slice().sort((left, right) => {
      const leftScore = this.scoreUser(left);
      const rightScore = this.scoreUser(right);
      if (rightScore !== leftScore) {
        return rightScore - leftScore;
      }

      const rightModified = this.parseTimestamp(right.userModified);
      const leftModified = this.parseTimestamp(left.userModified);
      if (rightModified !== leftModified) {
        return rightModified - leftModified;
      }

      const rightCreated = this.parseTimestamp(right.userCreated);
      const leftCreated = this.parseTimestamp(left.userCreated);
      if (rightCreated !== leftCreated) {
        return rightCreated - leftCreated;
      }

      return (left.username || '').localeCompare(right.username || '');
    });
  }

  private rebuildDuplicateGroupMap() {
    this.duplicateGroupsByUserId = new Map<string, DuplicateUserGroup>();
    this.duplicateGroups.forEach(group => {
      group.users.forEach(account => {
        this.duplicateGroupsByUserId.set(account.userId, group);
      });
    });
  }

  private updateRosterUsers() {
    const normalizedQuery = this.searchQuery.trim().toLowerCase();
    let nextUsers = this.users.slice();

    if (normalizedQuery) {
      nextUsers = nextUsers.filter(account => {
        return [
          this.getUserDisplayName(account),
          account?.username,
          account?.userEmail,
          this.getUserRoleLabel(account),
          this.getUserStatusLabel(account),
          this.getDebugLabel(account)
        ].some(value =>
          String(value || '')
            .toLowerCase()
            .includes(normalizedQuery)
        );
      });
    }

    this.usersFiltered = this.sortRosterUsers(nextUsers);
    this.pageOfUsers = [];
  }

  private sortRosterUsers(users: User[]): User[] {
    const direction = this.selectedSortFlag === 'desc' ? -1 : 1;

    return users.slice().sort((left, right) => {
      switch (this.selectedSortOption) {
        case 'Role': {
          const difference = (this.getUserRoleValue(left) - this.getUserRoleValue(right)) * direction;
          if (difference !== 0) {
            return difference;
          }
          break;
        }
        case 'Username': {
          const difference = String(left?.username || '').localeCompare(String(right?.username || '')) * direction;
          if (difference !== 0) {
            return difference;
          }
          break;
        }
        case 'Modified': {
          const difference =
            (this.parseTimestamp(left?.userModified) - this.parseTimestamp(right?.userModified)) * direction;
          if (difference !== 0) {
            return difference;
          }
          break;
        }
        case 'Issue': {
          const difference =
            ((this.getDuplicateGroupForUser(left?.userId)?.users.length || 0) -
              (this.getDuplicateGroupForUser(right?.userId)?.users.length || 0)) *
            direction;
          if (difference !== 0) {
            return difference;
          }
          break;
        }
        case 'Name':
        default: {
          const difference = this.getUserDisplayName(left).localeCompare(this.getUserDisplayName(right)) * direction;
          if (difference !== 0) {
            return difference;
          }
          break;
        }
      }

      return this.getUserDisplayName(left).localeCompare(this.getUserDisplayName(right));
    });
  }

  private scoreUser(user: User): number {
    if (user?.userActive && !user?.deleted) {
      return 100;
    }

    return 0;
  }

  private parseTimestamp(value?: Date | string): number {
    const timestamp = value ? Date.parse(String(value)) : 0;
    return Number.isFinite(timestamp) ? timestamp : 0;
  }

  private normalizeLoginKey(value?: string): string {
    return String(value || '')
      .trim()
      .toLowerCase()
      .split('@')[0];
  }

  private getUserRoleValue(user: User): number {
    const effectiveRoleValues = [
      this.getDirectRoleValue(user),
      ...this.getRoleValuesFromCollection(user?.operations),
      ...this.getRoleValuesFromCollection(user?.operationGroups)
    ].filter((roleValue: number) => roleValue > 0);

    if (effectiveRoleValues.length) {
      return Math.min(...effectiveRoleValues);
    }

    return 0;
  }

  private getRoleValuesFromCollection(records: any): number[] {
    if (!Array.isArray(records)) {
      return [];
    }

    return records.map(record => this.getRoleValueFromMetadata(record)).filter((roleValue: number) => roleValue > 0);
  }

  private getRoleValueFromMetadata(record: any): number {
    if (!record) {
      return 0;
    }

    const labeledRoleValue = this.getRoleValueFromLabel(record.userRoleLabel || record.operationUserRoleLabel);
    if (labeledRoleValue) {
      return labeledRoleValue;
    }

    const encodedRoleValue = this.getDirectRoleValue(record);
    if (encodedRoleValue) {
      return encodedRoleValue;
    }

    const numericRoleId = Number(record.operationUserRoleLabelId || record.userRoleLabelId || 0);
    if (numericRoleId >= 1 && numericRoleId <= 3) {
      return numericRoleId;
    }

    return 0;
  }

  private getRoleValueFromLabel(roleLabel?: string): number {
    const normalizedRoleLabel = String(roleLabel || '')
      .trim()
      .toLowerCase();

    if (!normalizedRoleLabel) {
      return 0;
    }

    if (normalizedRoleLabel.includes('admin')) {
      return 1;
    }

    if (normalizedRoleLabel.includes('manager')) {
      return 2;
    }

    if (
      normalizedRoleLabel.includes('care rep') ||
      normalizedRoleLabel.includes('care team') ||
      normalizedRoleLabel.includes('user')
    ) {
      return 3;
    }

    return 0;
  }

  private getDirectRoleValue(user: any): number {
    if (!user) {
      return 0;
    }

    if (typeof user.userLevel === 'number') {
      return user.userLevel;
    }

    return (UserRolesMap as any)[String(user.userLevel)] || 0;
  }
}
