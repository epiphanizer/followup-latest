import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { UserRoles } from '@app/modules/user/user';

import { OperationGroupFormComponent } from './operation-group-form.component';

describe('OperationGroupFormComponent (Jest)', () => {
  const baseUser: any = {
    userId: 'admin-1',
    userLevel: UserRoles.admin,
    operationGroups: [
      {
        operationGroupId: 'og1',
        operationGroupName: 'Providence',
        operationGroupShortName: 'PROV'
      }
    ]
  };

  const makeComponent = () => {
    const route = {
      snapshot: {
        data: { user: JSON.parse(JSON.stringify(baseUser)), section: 'clients' },
        paramMap: {
          get: jest.fn((key: string) => (key === 'operationGroupId' ? 'og1' : null))
        }
      }
    } as any;
    const router = { navigate: jest.fn() } as any;
    const operationService = {
      getOperationGroupByOperationGroupId: jest.fn(() =>
        of({ operationGroupId: 'og1', operationGroupName: 'Providence', operationGroupShortName: 'PROV' })
      ),
      editOperationGroupByOperationGroupId: jest.fn(() =>
        of({ operationGroupId: 'og1', operationGroupName: 'Providence West', operationGroupShortName: 'PROVW' })
      ),
      deactivateOperationGroupByOperationGroupId: jest.fn(() => of({ success: 1 }))
    } as any;
    const userService = { updateOperations: jest.fn(() => Promise.resolve()) } as any;
    const toastrService = {
      success: jest.fn(() => ({ onShown: { pipe: () => ({ subscribe: (callback: any) => callback() }) } }))
    } as any;

    const comp = new OperationGroupFormComponent(
      new FormBuilder(),
      route,
      router,
      operationService,
      userService,
      toastrService
    );

    return { comp, route, router, operationService, userService };
  };

  it('builds the client form from the selected operation group', () => {
    const { comp } = makeComponent();

    comp.ngOnInit();

    expect(comp.operationGroupForm).toBeTruthy();
    expect(comp.operationGroupForm.get('operationGroupName')?.value).toBe('Providence');
    expect(comp.operationGroupForm.get('operationGroupShortName')?.value).toBe('PROV');
  });

  it('saves client edits and routes back to the client detail page', () => {
    const { comp, router, operationService } = makeComponent();

    comp.ngOnInit();
    comp.operationGroupForm.patchValue({
      operationGroupName: 'Providence West',
      operationGroupShortName: 'PROVW'
    });
    comp.onSubmit();

    expect(operationService.editOperationGroupByOperationGroupId).toHaveBeenCalledWith('og1', {
      operationGroupName: 'Providence West',
      operationGroupShortName: 'PROVW'
    });
    expect(router.navigate).toHaveBeenCalledWith(['/clients', 'og1']);
  });

  it('loads the client from the service when it is missing from local user state', () => {
    const { comp, route, operationService } = makeComponent();
    route.snapshot.data.user.operationGroups = [];

    comp.ngOnInit();

    expect(operationService.getOperationGroupByOperationGroupId).toHaveBeenCalledWith('og1');
    expect(comp.operationGroup?.operationGroupName).toBe('Providence');
  });

  it('archives the client and routes back to the client roster', () => {
    const { comp, router, operationService, userService } = makeComponent();
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

    comp.ngOnInit();
    comp.onArchive();

    expect(operationService.deactivateOperationGroupByOperationGroupId).toHaveBeenCalledWith('og1');
    expect(userService.updateOperations).toHaveBeenCalledWith(comp.user);
    expect(router.navigate).toHaveBeenCalledWith(['/clients']);
    confirmSpy.mockRestore();
  });

  it('does not archive the client when confirmation is declined', () => {
    const { comp, operationService } = makeComponent();
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);

    comp.ngOnInit();
    comp.onArchive();

    expect(operationService.deactivateOperationGroupByOperationGroupId).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });
});
