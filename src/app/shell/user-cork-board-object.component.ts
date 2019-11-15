import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

import { UserCorkBoardObject, UserCorkBoardService } from './user-cork-board.service';

@Component({
  selector: 'app-user-cork-board-object',
  templateUrl: './user-cork-board-object.component.html',
  styleUrls: ['./user-cork-board-object.component.scss']
})
export class UserCorkBoardObjectComponent implements OnInit {
  corkboardObjectUrl: SafeUrl;
  @Input() deleteMode: Boolean;
  @Input() userCorkBoardObject: UserCorkBoardObject;
  /**
   * This guy is plaintext encoded base64
   */
  constructor(private sanitizer: DomSanitizer, private userCorkBoardService: UserCorkBoardService) {}

  ngOnInit() {
    var fileAsBlob = this.userCorkBoardObject.userCorkBoardBlob as any;
    let TYPED_ARRAY = new Uint8Array(fileAsBlob.data);
    const STRING_CHAR = TYPED_ARRAY.reduce((data, byte) => {
      return data + String.fromCharCode(byte);
    }, '');
    let base64String = btoa(STRING_CHAR);
    this.corkboardObjectUrl = this.sanitizer.bypassSecurityTrustUrl('data:image/jpg;base64, ' + base64String);
  }
  removeCorkBoardObject(userCorkBoardObjectId: number) {
    if (this.deleteMode) {
      alert('removing cork bord object');
      this.userCorkBoardService
        .deleteUserCorkBoardObjectByUserCorkBoardObjectId(userCorkBoardObjectId)
        .subscribe((data: any) => {
          console.log(data);
          debugger;
        });
    }
  }
}
