import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { User } from '@app/modules/user/user';
import { AuthenticationService } from '@app/core';
import { UserAvatarService } from '@app/modules/user/user-avatar/user-avatar.service';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { UserCorkBoardObject } from '../user-cork-board/user-cork-board.service';

@Component({
  providers: [AuthenticationService, UserAvatarService],
  selector: 'app-toolbar-profile-nav',
  templateUrl: './toolbar-profile-nav.component.html',
  styleUrls: ['./toolbar-profile-nav.component.scss']
})
export class ToolbarProfileNavComponent implements OnInit {
  @Input() user: User;
  avatarExists: Boolean;
  dropdownActive: Boolean = false;
  public avatarUrl: SafeStyle;
  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private userAvatarService: UserAvatarService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    if (!this.user.avatarData) {
      this.userAvatarService.getUserAvatarByUserId(this.user.userId).subscribe((data: any) => {
        if (data !== null) {
          var reader = new FileReader();
          reader.readAsDataURL(data);
          var self = this;
          reader.onloadend = function() {
            var base64data = reader.result;
            self.avatarUrl = self.sanitizer.bypassSecurityTrustStyle(`url(${base64data})`);
            self.avatarExists = true;
          };
        }
      });
    } else {
      var reader = new FileReader();
      reader.readAsDataURL(this.user.avatarData);
      var self = this;
      reader.onloadend = function() {
        var base64data = reader.result;
        self.avatarUrl = self.sanitizer.bypassSecurityTrustStyle(`url(${base64data})`);
        self.avatarExists = true;
      };
    }
  }

  toggleDropdown() {
    this.dropdownActive = !this.dropdownActive;
  }
  signOut() {
    this.authService.signOut();
  }

  dataURItoBlob(dataURI: string) {
    // convert base64 to raw binary data held in a string
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], {
      type: 'image/jpeg'
    });
    return blob;
  }

  addNewCorkboardItem = function() {
    if (!this.isOpen) {
      this.toggleCorkboardState();
    }
    this.imageCompress.uploadFile().then((imageObj: any) => {
      this.imgResultBeforeCompress = imageObj.image;
      this.imageCompress.compressFile(imageObj.image, imageObj.orientation, 50, 50).then((result: any) => {
        this.imgResultAfterCompress = result;
        const imageBlob = this.dataURItoBlob(this.imgResultAfterCompress.split(',')[1]);
        let fileName =
          this.user.userId +
          '-corkboard-object-' +
          Math.random()
            .toString()
            .slice(2, 11);
        const imageFile = new File([imageBlob], fileName, {
          type: 'image/jpeg'
        });
        this.userCorkBoardService
          .addNewUserCorkBoardObjectByUserId(this.user.userId, imageFile)
          .subscribe((data: any) => {
            this.toastrService.success('Successfully added cork board item.');
            this.userCorkBoardService
              .getUserCorkBoardObjectsByUserId(this.user.userId)
              .subscribe((data: UserCorkBoardObject[]) => {
                if (data) {
                  console.log(data);
                  this.userCorkBoardObjects = data;
                }
              });
          });
      });
    });
  };

  editProfile() {
    this.router.navigate['/user/profile'];
  }
  postNote() {
    alert('add post it note');
  }
}
