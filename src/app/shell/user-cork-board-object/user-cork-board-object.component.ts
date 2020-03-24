import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

import { UserCorkBoardObject, UserCorkBoardService } from '../user-cork-board/user-cork-board.service';

@Component({
  selector: 'app-user-cork-board-object',
  templateUrl: './user-cork-board-object.component.html',
  styleUrls: ['./user-cork-board-object.component.scss']
})
export class UserCorkBoardObjectComponent implements OnInit {
  corkboardObjectUrl: SafeUrl;
  @Input() deleteMode: Boolean;
  @Input() userCorkBoardObject: UserCorkBoardObject;

  constructor(private sanitizer: DomSanitizer, private userCorkBoardService: UserCorkBoardService) {}

  ngOnInit() {
    var fileAsBlob = this.userCorkBoardObject.userCorkBoardBlob as any;
    let typedArray = new Uint8Array(fileAsBlob.data);
    const stringChar = typedArray.reduce((data, byte) => {
      return data + String.fromCharCode(byte);
    }, '');
    let base64String = btoa(stringChar);
    this.corkboardObjectUrl = this.sanitizer.bypassSecurityTrustUrl('data:image/jpg;base64, ' + base64String);
  }
  removeCorkBoardObject(userCorkBoardObjectId: number) {
    if (this.deleteMode) {
      this.userCorkBoardService
        .deleteUserCorkBoardObjectByUserCorkBoardObjectId(userCorkBoardObjectId)
        .subscribe(() => {
          let element: HTMLElement = document.querySelector(
            '#userCorkBoardObject-' + userCorkBoardObjectId
          ) as HTMLElement;
          element.remove();
        });
    }
  }
}
