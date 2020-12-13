import { Component, OnInit, Input } from '@angular/core';
import { Operation } from '@app/modules/operation/operation';
import { Observable } from 'rxjs';
import { TeamService } from '../team.service';
import { Team } from '../team';
import { map } from 'rxjs/operators';
import { User } from '@app/modules/user/user';
import { ActivatedRoute } from '@angular/router';
import { OperationService } from '@app/modules/operation/operation.service';

@Component({
  selector: 'app-team-listing',
  templateUrl: './team-listing.component.html',
  styleUrls: ['./team-listing.component.scss']
})
export class TeamListingComponent implements OnInit {
  @Input() operation: Operation;
  filterBy: string;
  public teams: Team[];
  public teams$: Observable<[Team]> | void = null;
  public selected:
    | {
        filterDate: string;
        operation: Operation;
        operation$: Observable<Operation>;
      }
    | any = {};
  selectedSortFlag: string = 'asc';
  user: User;
  constructor(
    private operationService: OperationService,
    private teamService: TeamService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    if (!this.route.snapshot.data.operation) {
      this.user = this.route.snapshot.data.user;

      if (this.user.userLevel != 1) {
        this.user.operations$ = this.operationService.getOperationsByUserId(this.user.userId);
      } else {
        this.user.operations$ = this.operationService.getAllOperations();
      }
      this.user.operations$.subscribe((operations: Operation[]) => {
        /** Init to the first assigned operation alphabetically */
        this.selected.operation = operations[0];
      });
    } else {
      this.selected.operation = this.route.snapshot.data.operation;
    }
  }

  handleDateFilterChangeEvent($event: string) {
    this.selected.filterDate = $event;
  }
  teamChangeEventHandler($event: Operation) {
    this.selected.operation = $event;
    this.teams = [];
    this.teams$ = this.teamService.getTeamMembersByTeamId(this.selected.operation.operationId).pipe(
      map((teams: [Team]) => {
        this.teams = teams;
        return teams;
      })
    );
  }
}
