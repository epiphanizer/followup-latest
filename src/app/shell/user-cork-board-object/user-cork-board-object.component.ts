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
    this.userCorkBoardService
      .getUserCorkBoardObjectsByUserCorkBoardObjectId(this.userCorkBoardObject.userCorkBoardObjectId)
      .subscribe((data: UserCorkBoardObject) => {
        var fileAsBlob = data.userCorkBoardBlob as any;
        var self = this;
        if (fileAsBlob !== null) {
          var reader = new FileReader();
          reader.readAsDataURL(fileAsBlob);
          reader.onloadend = function() {
            var base64data = reader.result;
            self.corkboardObjectUrl = self.sanitizer.bypassSecurityTrustUrl('data:image/jpg;base64, ' + base64data);
          };
        }
      });
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
