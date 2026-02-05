import { of } from 'rxjs';

import { UserCorkBoardObjectComponent } from './user-cork-board-object.component';

describe('UserCorkBoardObjectComponent (Jest)', () => {
  const serviceStub = {
    getUserCorkBoardObjectsByUserCorkBoardObjectId: jest.fn(() => of(new Blob(['file']))),
    deleteUserCorkBoardObjectByUserCorkBoardObjectId: jest.fn(() => of(null)),
    userCorkBoardUpdated: jest.fn()
  } as any;
  const sanitizerStub = {
    bypassSecurityTrustStyle: jest.fn(style => `safe:${style}`)
  } as any;

  class FakeFileReader {
    public result: any;
    public onloadend: (() => void) | null = null;
    readAsDataURL() {
      this.result = 'data:url';
      setTimeout(() => {
        if (this.onloadend) {
          this.onloadend();
        }
      }, 0);
    }
  }

  const buildComponent = () => {
    const component = new UserCorkBoardObjectComponent(sanitizerStub, serviceStub);
    component.userCorkBoardObject = { userCorkBoardObjectId: 'obj-1' } as any;
    return component;
  };

  beforeAll(() => {
    (global as any).FileReader = FakeFileReader as any;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const flushAsync = () => new Promise(resolve => setTimeout(resolve, 0));

  it('loads cork board object data into a safe style URL', async () => {
    const component = buildComponent();

    component.ngOnInit();

    await flushAsync();

    expect(serviceStub.getUserCorkBoardObjectsByUserCorkBoardObjectId).toHaveBeenCalledWith('obj-1');
    expect(sanitizerStub.bypassSecurityTrustStyle).toHaveBeenCalledWith('url(data:url)');
    expect(component.corkboardObjectUrl).toBe('safe:url(data:url)');
  });

  it('deletes a cork board object and notifies listeners', () => {
    const element = document.createElement('div');
    element.id = 'userCorkBoardObject-obj-1';
    document.body.appendChild(element);
    const component = buildComponent();

    component.removeCorkBoardObject('obj-1');

    expect(serviceStub.deleteUserCorkBoardObjectByUserCorkBoardObjectId).toHaveBeenCalledWith('obj-1');
    expect(document.querySelector('#userCorkBoardObject-obj-1')).toBeNull();
    expect(serviceStub.userCorkBoardUpdated).toHaveBeenCalled();
  });
});
