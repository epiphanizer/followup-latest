import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '@app/core';
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
  styleUrls: ['./user-listing.component.scss']
})
export class UserListingComponent implements OnInit {
  user: User;
  users: User[] = [];
  duplicateGroups: DuplicateUserGroup[] = [];
  isLoading = false;
  loadError: string | null = null;

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

  get expandedGroupCount(): number {
    return this.duplicateGroups.filter(group => !group.collapsed).length;
  }

  jumpTo(sectionId: string) {
    const target = this.document.getElementById(sectionId);
    if (!target) {
      return;
    }

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  jumpToGroup(group: DuplicateUserGroup) {
    group.collapsed = false;
    this.jumpTo(this.getGroupSectionId(group));
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
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.loadError = 'Unable to load users for duplicate account review.';
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
        const sortedUsers = this.sortUsers(matchingUsers);
        const suggestedTarget = sortedUsers[0];

        return {
          key: key,
          users: sortedUsers,
          collapsed: false,
          suggestedTargetUserId: suggestedTarget ? suggestedTarget.userId : null,
          selectedTargetUserId: suggestedTarget ? suggestedTarget.userId : null,
          mergeScript: null,
          mergeError: null,
          mergeLoading: false
        };
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

  private sortUsers(users: User[]): User[] {
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
    if (!user) {
      return 0;
    }

    if (typeof user.userLevel === 'number') {
      return user.userLevel;
    }

    return (UserRolesMap as any)[String(user.userLevel)] || 0;
  }
}
