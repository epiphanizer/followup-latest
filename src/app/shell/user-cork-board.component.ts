import { Component, OnInit, HostBinding } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition
  // ...
} from '@angular/animations';

@Component({
  selector: 'app-user-cork-board',
  templateUrl: './user-cork-board.component.html',
  styleUrls: ['./user-cork-board.component.scss'],
  animations: [
    trigger('openClose', [
      state(
        'open',
        style({
          width: '444px',
          opacity: 1
        })
      ),
      state(
        'closed',
        style({
          width: '38px',
          opacity: 1
        })
      )
    ])
  ]
})
export class UserCorkBoardComponent implements OnInit {
  isOpen = false;
  constructor() {}

  ngOnInit() {}

  public toggleCorkboardState = function() {
    this.isOpen = !this.isOpen;
  };
}
