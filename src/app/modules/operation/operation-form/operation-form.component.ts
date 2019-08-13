import { Component, OnInit, Renderer2, Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, from, throwError, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { OperationService, Operation } from '../operation.service';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  providers: [OperationService],
  selector: 'app-operation-form',
  templateUrl: './operation-form.component.html',
  styleUrls: ['./operation-form.component.scss']
})
@Injectable()
export class OperationFormComponent implements OnInit {
  editOperationForm!: FormGroup;
  constructor(private fb: FormBuilder) {}
  ngOnInit() {
    this.createForm();
  }
  private createForm() {
    this.editOperationForm = this.fb.group({});
  }
  editOperationFormSubmit() {
    alert('submitted edit operation form');
  }
}
