import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { UserCorkBoardService, UserCorkBoardObject } from './user-cork-board.service';
import { User } from '@app/modules/user/user';
import { ActivatedRoute } from '@angular/router';

import { NgxImageCompressService } from 'ngx-image-compress';
import { ToastrService } from 'ngx-toastr';
@Component({
  providers: [NgxImageCompressService, ToastrService],
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
  isOpen = false;
  deleteMode = false;
  user: User;
  userCorkBoardObjects: UserCorkBoardObject[];
  imgResultBeforeCompress: string;
  imgResultAfterCompress: string;

  constructor(
    private imageCompress: NgxImageCompressService,
    private userCorkBoardService: UserCorkBoardService,
    private route: ActivatedRoute,
    private toastrService: ToastrService
  ) {}

  ngOnInit() {
    this.user = this.route.snapshot.data.user;
    this.userCorkBoardService
      .getUserCorkBoardObjectsByUserId(this.user.userId)
      .subscribe((data: UserCorkBoardObject[]) => {
        if (data) {
          this.userCorkBoardObjects = data;
        }
      });
  }

  // dataURItoBlob(dataURI: string) {
  //   // convert base64 to raw binary data held in a string
  //   const byteString = window.atob(dataURI);
  //   const arrayBuffer = new ArrayBuffer(byteString.length);
  //   const int8Array = new Uint8Array(arrayBuffer);
  //   for (let i = 0; i < byteString.length; i++) {
  //     int8Array[i] = byteString.charCodeAt(i);
  //   }
  //   const blob = new Blob([int8Array], {
  //     type: 'image/jpeg'
  //   });
  //   return blob;
  // }

  toggleCorkBoardDeleteFunction = function() {
    if (!this.isOpen) {
      this.toggleCorkboardState();
    }
    this.deleteMode = true;
  };

  public toggleCorkboardState = function() {
    this.corkBoardExpandedEmitter.emit(this.isOpen);
  };
}
