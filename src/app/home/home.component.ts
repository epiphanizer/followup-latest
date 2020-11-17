import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '@app/modules/data/data.service';
import * as FileSaver from 'file-saver';

@Component({
  providers: [DataService],
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public user: any;
  public menu: {}[] = [{}];
  constructor(private dataService: DataService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.user = this.route.snapshot.data.user;
  }
  doAction(actionType: string, $event: any) {
    $event.preventDefault();
    $event.stopPropagation();
    /**
     * Get an Excel with current Wizard Bridge definitions
     */
    if (actionType == 'getData') {
      this.getData();
    }
  }
  getData() {
    this.dataService.getData().subscribe((data: Blob) => {
      var blob = new Blob([data], { type: data.type });
      FileSaver.saveAs(blob, 'data.xlsx');
    });
  }
}
