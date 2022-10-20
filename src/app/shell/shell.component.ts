import { Component, OnInit, Renderer2, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Platform } from '@ionic/angular';
import { HostListener } from '@angular/core';
import { AuthenticationService } from '@app/core';
import { ModalController } from '@ionic/angular';
import { Patient } from '@app/modules/patient/patient';
import { User } from '@app/modules/user/user';
import { of, Subscription } from 'rxjs';
import { environment } from '@env/environment';
import { ToastrService } from 'ngx-toastr';
import { UserCorkBoardService } from './user-cork-board/user-cork-board.service';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent {
  corkboardExpanded: boolean = false;
  corkBoardSubscription: Subscription;
  dropdownActive: Boolean = false;
  user: User;
  patient: Patient;
  navLinks?: {
    linkName: string;
    linkAction: string;
  }[];
  routeSubscription: Subscription;
  timeSinceLastAction: number;
  userActionSinceLastUpdate: boolean = false;
  userCorkBoardExpanded: boolean = false;
  version: string = environment.version;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    public modalController: ModalController,
    private toastrService: ToastrService,
    private userCorkBoardService: UserCorkBoardService,
    private _cdr: ChangeDetectorRef
  ) {}
  ngOnInit() {
    this.user = this.authenticationService.currentUserSubject.getValue();

    this.updateUserExpiry();
    /**
     * Slated for deprecation
     */
    this.routeSubscription = this.route.url.subscribe(() => {
      if (this.route.snapshot.firstChild) {
        if (this.route.snapshot.firstChild.data.navLinks) {
          this.navLinks = this.route.snapshot.firstChild.data.navLinks;
        }
      } else {
        this.navLinks = null;
      }
    });
    this.setIdleLogoutTimer();
    this.corkBoardSubscription = this.userCorkBoardService.menuStateBSubject.subscribe(() => {
      this.userCorkBoardExpanded = this.userCorkBoardService.isOpen;
    });
  }

  @HostListener('window:orientationchange', ['$event'])
  onOrientationChange(e: any) {
    if (this.userCorkBoardExpanded) {
      this.userCorkBoardExpanded = false;
      this.userCorkBoardService.isOpen = false;
      this.userCorkBoardService.menuStateBSubject.next(false);
    }
  }
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: any) {
    this.updateUserExpiry();
  }
  @HostListener('document:touchstart', ['$event'])
  onTouchStart(e: any) {
    this.updateUserExpiry();
  }
  @HostListener('document:keydown', ['$event'])
  onKeydown(e: any) {
    this.updateUserExpiry();
  }

  updateUserExpiry() {
    /**
     * Updates our expire time within the shell component
     */
    var date = new Date();
    this.user = this.authenticationService.currentUserSubject.getValue();
    this.user.userLoginExpires = date.getTime() + 900000;
    this.authenticationService.currentUserSubject.next(this.user);
    localStorage.removeItem('followup-user');
    localStorage.setItem('followup-user', JSON.stringify(this.user));
    this.userActionSinceLastUpdate = false;
  }
  setIdleLogoutTimer() {
    var self = this;
    setInterval(function() {
      self.user = self.authenticationService.currentUserSubject.getValue();
      var date = new Date();
      var currentTime = date.getTime();
      var timeRemaining = Math.round((self.user.userLoginExpires - currentTime) / 1000);
      if (self.user.userLoginExpires - currentTime < 30000) {
        self.toastrService.success('Your session will log out in ' + timeRemaining + ' seconds due to inactivity!');
      }
      if (currentTime > self.user.userLoginExpires) {
        self.authenticationService.signOut();
      }
    }, 5000);
  }
  corkBoardExpandedHandler(toggleState: boolean) {
    this.corkboardExpanded = toggleState;
  }

  addNewCorkBoardItem() {
    if (!this.userCorkBoardService.isOpen) {
      this.userCorkBoardService.toggleCorkboardState();
    }
    this.userCorkBoardService.doUpload(this.user).then(() => {
      this.toastrService.success('Successfully added cork board item.');
      this.userCorkBoardService.userCorkBoardUpdated();
    });
  }
  toggleDropdown($event: boolean) {
    this.dropdownActive = $event;
  }
  signOut() {
    this.authenticationService.signOut();
    this.router.navigate(['/login']);
  }
  ngOnDestroy() {
    this.routeSubscription.unsubscribe();
    this.corkBoardSubscription.unsubscribe();
  }
}
