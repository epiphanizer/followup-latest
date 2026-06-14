import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { throwError } from 'rxjs';
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
      deactivateOperationGroupByOperationGroupId: jest.fn(() => of({ success: 1 })),
      restoreOperationGroupByOperationGroupId: jest.fn(() => of({ success: 1 })),
      notifyClientGroupsChanged: jest.fn(),
      getOperationGroups: jest.fn(() =>
        of([
          {
            operationGroupId: 'og1',
            operationGroupName: 'Providence',
            operationGroupShortName: 'PROV'
          }
        ] as any)
      )
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
    expect(operationService.notifyClientGroupsChanged).toHaveBeenCalled();
    expect(userService.updateOperations).toHaveBeenCalledWith(comp.user);
    expect(router.navigate).toHaveBeenCalledWith(['/clients']);
    confirmSpy.mockRestore();
  });

  it('treats archive as success when delete reports an error but the client is no longer active', () => {
    const { comp, router, operationService, userService } = makeComponent();
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    operationService.deactivateOperationGroupByOperationGroupId = jest.fn(() =>
      throwError(() => ({ message: 'delete reported failure' }))
    );
    operationService.getOperationGroups = jest.fn(() => of([] as any));

    comp.ngOnInit();
    comp.onArchive();

    expect(operationService.getOperationGroups).toHaveBeenCalled();
    expect(userService.updateOperations).toHaveBeenCalledWith(comp.user);
    expect(router.navigate).toHaveBeenCalledWith(['/clients']);
    confirmSpy.mockRestore();
  });

  it('shows archive error detail when archive still fails after verification', () => {
    const { comp, operationService } = makeComponent();
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    operationService.deactivateOperationGroupByOperationGroupId = jest.fn(() =>
      throwError(() => ({ detail: 'Operation group still has active references.' }))
    );
    operationService.getOperationGroups = jest.fn(() =>
      of([
        {
          operationGroupId: 'og1',
          operationGroupName: 'Providence',
          operationGroupShortName: 'PROV'
        }
      ] as any)
    );

    comp.ngOnInit();
    comp.onArchive();

    expect(comp.loadError).toContain('Operation group still has active references.');
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

  it('restores the client and routes back to the client detail page', () => {
    const { comp, router, operationService, userService } = makeComponent();
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

    comp.ngOnInit();
    comp.operationGroup.operationGroupActive = 0 as any;
    comp.onRestore();

    expect(operationService.restoreOperationGroupByOperationGroupId).toHaveBeenCalledWith('og1');
    expect(operationService.notifyClientGroupsChanged).toHaveBeenCalled();
    expect(comp.operationGroup?.operationGroupActive).toBe(1);
    expect(userService.updateOperations).toHaveBeenCalledWith(comp.user);
    expect(router.navigate).toHaveBeenCalledWith(['/clients', 'og1']);
    confirmSpy.mockRestore();
  });

  it('notifies client group listeners after a rename succeeds', () => {
    const { comp, operationService } = makeComponent();

    comp.ngOnInit();
    comp.operationGroupForm.patchValue({
      operationGroupName: 'Providence West',
      operationGroupShortName: 'PROVW'
    });
    comp.onSubmit();

    expect(operationService.notifyClientGroupsChanged).toHaveBeenCalled();
  });
});
