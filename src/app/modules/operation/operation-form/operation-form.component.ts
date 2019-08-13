import { Component, OnInit, Renderer2, Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, from, throwError, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-operation-form',
  templateUrl: './operation-form.component.html',
  styleUrls: ['./operation-form.component.scss'],
  providers: []
})
@Injectable()
export class OperationFormComponent implements OnInit {
  ngOnInit() {
    this.createForm();
  }
  private createForm() {
    alert('Creating operations form');
  }
}
