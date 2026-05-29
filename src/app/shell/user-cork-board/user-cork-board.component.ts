import { Component, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { UserCorkBoardService, UserCorkBoardObject } from './user-cork-board.service';
import { User } from '@app/modules/user/user';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  providers: [ToastrService],
  selector: 'app-user-cork-board',
  templateUrl: './user-cork-board.component.html',
  styleUrls: ['./user-cork-board.component.scss'],
  animations: [
    trigger('openClose', [
      state(
        'open',
        style({
          width: '222px',
          'background-repeat': 'repeat-x',
          'background-size': 'auto'
        })
      ),
      state(
        'closed',
        style({
          width: '28px'
        })
      ),
      transition('open => closed', [animate('200ms ease-in')]),
      transition('closed => open', [animate('200ms ease-in')])
    ])
  ],
  standalone: false
})
export class UserCorkBoardComponent implements OnInit {
  isOpen = false;
  deleteMode = false;
  user: User;
  userCorkBoardObjects: UserCorkBoardObject[];
  corkBoardToggleSubscription: Subscription;
  refreshUserCorkBoardSubscription: Subscription;

  constructor(private userCorkBoardService: UserCorkBoardService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.user = this.route.snapshot.data.user;
    this.userCorkBoardService
      .getUserCorkBoardObjectsByUserId(this.user.userId)
      .subscribe((data: UserCorkBoardObject[]) => {
        if (data) {
          this.userCorkBoardObjects = data;
        }
      });
    this.corkBoardToggleSubscription = this.userCorkBoardService.menuStateBSubject.subscribe(() => {
      this.isOpen = this.userCorkBoardService.isOpen;
    });
    this.refreshUserCorkBoardSubscription = this.userCorkBoardService.refreshUserCorkBoardBSubject.subscribe(() => {
      if (this.userCorkBoardService.refresh) {
        setTimeout(
          function() {
            this.userCorkBoardService
              .getUserCorkBoardObjectsByUserId(this.user.userId)
              .subscribe((data: UserCorkBoardObject[]) => {
                if (data) {
                  this.userCorkBoardObjects = data;
                }
              });
          }.bind(this),
          1000
        );
      }
    });
  }

  toggleCorkBoardDeleteFunction = function() {
    if (!this.isOpen) {
      this.toggleCorkboardState();
    }
    this.deleteMode = true;
  };

  public toggleCorkboardState = function() {
    this.userCorkBoardService.toggleCorkboardState();
  };
  ngOnDestroy() {
    this.corkBoardToggleSubscription.unsubscribe();
    this.refreshUserCorkBoardSubscription.unsubscribe();
  }
}
