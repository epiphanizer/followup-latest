import { Injectable } from '@angular/core';
import { HttpService } from '@app/core';
import { catchError, retry, delay } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError, Observable, BehaviorSubject, Subject } from 'rxjs';
import { NgxImageCompressService } from 'ngx-image-compress';
import { User } from '@app/modules/user/user';
export interface UserCorkBoardObject {
  userCorkBoardObjectId?: number;
  userCorkBoardFile: File;
  userCorkBoardBlob?: Blob;
}

@Injectable({
  providedIn: 'root'
})
/**
 * Provides helper methods to create routes.
 */
export class UserCorkBoardService {
  public isOpen: boolean;
  public refresh: boolean;
  public menuStateBSubject = new BehaviorSubject<boolean>(false);
  public refreshUserCorkBoardBSubject = new BehaviorSubject<boolean>(false);
  imgResultBeforeCompress: string;
  imgResultAfterCompress: string;

  constructor(private http: HttpService, private imageCompress: NgxImageCompressService) {}

  addNewUserCorkBoardObjectByUserId(userId: number, file: File) {
    let formData = new FormData();
    formData.append('userCorkBoardBlob', file, file.name);
    return this.http.post('users/' + userId + '/corkBoardObjects', formData).pipe(
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
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
  doUpload(user: User) {
    return this.imageCompress.uploadFile().then((imageObj: any) => {
      this.imgResultBeforeCompress = imageObj.image;
      this.imageCompress.compressFile(imageObj.image, imageObj.orientation, 50, 50).then((result: any) => {
        this.imgResultAfterCompress = result;
        const imageBlob = this.dataURItoBlob(this.imgResultAfterCompress.split(',')[1]);
        let fileName =
          user.userId +
          '-corkboard-object-' +
          Math.random()
            .toString()
            .slice(2, 11);
        const imageFile = new File([imageBlob], fileName, {
          type: 'image/jpeg'
        });
        this.addNewUserCorkBoardObjectByUserId(user.userId, imageFile).toPromise();
      });
    });
  }
  userCorkBoardUpdated() {
    this.refresh = true;
    this.refreshUserCorkBoardBSubject.next(true);
  }
  deleteUserCorkBoardObjectByUserCorkBoardObjectId(userCorkBoardObjectId: number) {
    return this.http.delete('users/corkBoardObjects/' + userCorkBoardObjectId).pipe(
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  getUserCorkBoardObjectsByUserId(userId: number) {
    return this.http.get<UserCorkBoardObject[]>('users/' + userId + '/corkBoardObjects').pipe(
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  getUserCorkBoardObjectsByUserCorkBoardObjectId(userCorkBoardObjectId: number) {
    return this.http
      .get<Blob>('users/corkBoardObjects/' + userCorkBoardObjectId, {
        responseType: 'blob' as 'json'
      })
      .pipe(
        catchError(e => this.handleAsyncError(e)) // then handle the error
      );
  }

  public toggleCorkboardState = function() {
    this.isOpen = !this.isOpen;
    this.menuStateBSubject.next(this.isOpen);
  };

  private handleAsyncError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      '<div class="alert alert-danger" role="alert"> \
            <strong>Error</strong>: We had trouble connecting to the user cork board service\
          </div>'
    );
  }
}
