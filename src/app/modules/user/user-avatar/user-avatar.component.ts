import { Component, OnInit, Input, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { UserAvatarService } from './user-avatar.service';
import { User } from '../user';
import { SafeUrl } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-avatar',
  templateUrl: './user-avatar.component.html',
  styleUrls: ['./user-avatar.component.scss']
})
export class UserAvatarComponent implements OnInit {
  avatarUrl: SafeUrl;
  fileToUpload: File = null;
  @Input() user: User;
  @Output() userAvatarEventEmitter = new EventEmitter<boolean>();
  /**
   * This guy is plaintext encoded base64
   */
  avatarExists: boolean;
  constructor(private userAvatarService: UserAvatarService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.userAvatarService.getUserAvatarByUserId(this.user.userId).subscribe((baseImage: any) => {
      if (baseImage !== null) {
        if (!baseImage[0]) {
          this.avatarExists = false;
        } else {
          this.avatarExists = true;
          this.avatarUrl = this.userAvatarService.prepareAvatarImage(baseImage);
        }
      }
    });
  }

  clickUploadInput() {
    let element: HTMLElement = document.querySelector('#fileUpload') as HTMLElement;
    element.click();
  }
  uploadUserAvatarPhoto(files: FileList) {
    this.fileToUpload = files.item(0);
    this.userAvatarService.uploadUserAvatarByUserId(this.user.userId, this.fileToUpload).subscribe((data: any) => {
      alert('Successfully uploaded user avatar!');
      this.userAvatarEventEmitter.emit(true);
      this.userAvatarService.getUserAvatarByUserId(this.user.userId).subscribe((baseImage: any) => {
        if (baseImage !== null) {
          if (!baseImage[0]) {
            this.avatarExists = false;
          } else {
            this.avatarExists = true;
            this.avatarUrl = this.userAvatarService.prepareAvatarImage(baseImage);
          }
        }
      });
    });
  }
}
