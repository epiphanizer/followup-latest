import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

import { UserCorkBoardObject } from './user-cork-board.service';

@Component({
  selector: 'app-user-cork-board-object',
  templateUrl: './user-cork-board-object.component.html',
  styleUrls: ['./user-cork-board-object.component.scss']
})
export class UserCorkBoardObjectComponent implements OnInit {
  corkboardObjectUrl: SafeUrl;
  @Input() userCorkBoardObject: UserCorkBoardObject;
  /**
   * This guy is plaintext encoded base64
   */
  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    let fileReader = new FileReader();
    let dataStuff = fileReader.readAsDataURL(this.userCorkBoardObject.userCorkBoardFile);
    // let TYPED_ARRAY = new Uint8Array();
    // const STRING_CHAR = TYPED_ARRAY.reduce((data, byte) => {
    //   return data + String.fromCharCode(byte);
    // }, '');
    // let base64String = btoa(STRING_CHAR);
    this.corkboardObjectUrl = this.sanitizer.bypassSecurityTrustUrl('data:image/jpg;base64, ' + dataStuff);
  }
}
