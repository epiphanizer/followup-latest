import { Component, OnInit, HostBinding } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { UserCorkBoardService } from './user-cork-board.service';

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
  isOpen = false;
  deleting = false;
  constructor(private userCorkBoardService: UserCorkBoardService) {}

  ngOnInit() {}

  public addNewCorkboardItem = function(file: File) {
    this.userCorkBoardService.addNewUserCorkBoardObject(file).subscribe((data: any) => {
      console.log(data);
      debugger;
    });
  };
  public activateCorkBoardDeleteFunction = function() {
    alert('activating cork board delete function');
    this.deleting = true;
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
}
