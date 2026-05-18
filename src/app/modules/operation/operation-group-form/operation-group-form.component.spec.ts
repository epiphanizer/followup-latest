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
});
