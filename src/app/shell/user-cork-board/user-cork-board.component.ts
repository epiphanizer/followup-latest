import { Component, OnInit, HostBinding, Output, EventEmitter } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { UserCorkBoardService, UserCorkBoardObject } from './user-cork-board.service';
import { User } from '@app/user';
import { ActivatedRoute } from '@angular/router';

@Component({
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
  ]
})
export class UserCorkBoardComponent implements OnInit {
  @Output() corkBoardExpandedEmitter = new EventEmitter<boolean>();
  fileToUpload: File;
  isOpen = false;
  deleteMode = false;
  user: User;
  userCorkBoardObjects: UserCorkBoardObject[];
  constructor(private userCorkBoardService: UserCorkBoardService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.user = this.route.snapshot.data.user;
    this.userCorkBoardService
      .getUserCorkBoardObjectsByUserId(this.user.userId)
      .subscribe((data: UserCorkBoardObject[]) => {
        if (data) {
          // debugger;
          this.userCorkBoardObjects = data;
        }
      });
  }

  addNewCorkboardItem = function(files: FileList) {
    if (!this.isOpen) {
      this.toggleCorkboardState();
    }
    this.fileToUpload = files.item(0);
    this.userCorkBoardService
      .addNewUserCorkBoardObjectByUserId(this.user.userId, this.fileToUpload)
      .subscribe((data: any) => {
        this.userCorkBoardService.getUserCorkBoardObjectsByUserId(this.user.userId).subscribe((data: any) => {
          if (data) {
            this.userCorkBoardObjects = data;
          }
        });
      });
  };
  toggleCorkBoardDeleteFunction = function() {
    if (!this.isOpen) {
      this.toggleCorkboardState();
    }
    this.deleteMode = true;
  };

  clickCorkboardInput = function() {
    let element: HTMLElement = document.querySelector('#corkBoardUpload') as HTMLElement;
    element.click();
  };
  public toggleCorkboardState = function() {
    this.isOpen = !this.isOpen;
    // Make sure to reset the deleting functionality of the cork board
    this.deleting = false;
    console.log(this.isOpen);
    this.corkBoardExpandedEmitter.emit(this.isOpen);
  };
}
