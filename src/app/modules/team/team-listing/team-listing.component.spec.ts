import { TeamListingComponent } from './team-listing.component';
import { Team } from '../team';

describe('TeamListingComponent (Jest)', () => {
  const route = {
    snapshot: {
      data: {
        user: {
          teams: [{ teamId: 't1' }, { teamId: 't2' }]
        }
      }
    }
  } as any;

  it('selects first team on init', () => {
    const comp = new TeamListingComponent(route);

    comp.ngOnInit();

    expect((comp.selected.team as Team).teamId).toBe('t1');
  });

  it('updates selected team when event fires', () => {
    const comp = new TeamListingComponent(route);
    comp.ngOnInit();
    const next = { teamId: 't2' } as Team;

    comp.teamChangeEventHandler(next);

    expect(comp.selected.team).toBe(next);
  });
});
