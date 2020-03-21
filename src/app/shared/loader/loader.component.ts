import { Component, OnInit } from '@angular/core';
import { LoaderService } from './loader.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit {
  constructor(private loaderService: LoaderService) {}

  public isLoading: Subject<boolean> = this.loaderService.isLoading;

  ngOnInit(): void {}
}
