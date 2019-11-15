import { Component, OnInit, HostBinding } from '@angular/core';
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
      transition('open => closed', [animate('0.5s')]),
      transition('closed => open', [animate('0.25s')])
    ])
  ]
})
export class UserCorkBoardComponent implements OnInit {
  fileToUpload: File;
  isOpen = false;
  deleteMode = false;
  user: User;
  userCorkBoardObjects: UserCorkBoardObject[];
  constructor(private userCorkBoardService: UserCorkBoardService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.user = this.route.snapshot.data.user;
    this.userCorkBoardService.getUserCorkBoardObjectsByUserId(this.user.userId).subscribe((data: any) => {
      if (data) {
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
        console.log(data);
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
  };

  deleteCorkBoardItem = function(userCorkBoardObject: UserCorkBoardObject) {
    this.userCorkBoardService.deleteCorkBoardItem(userCorkBoardObject).subscribe((data: any) => {
      console.log(data);
      debugger;
    });
  };
}
