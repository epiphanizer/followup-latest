import { JwPaginationComponent } from './pagination.component';

describe('JwPaginationComponent (Jest)', () => {
  let component: JwPaginationComponent;
  let emitted: any[];

  beforeEach(() => {
    component = new JwPaginationComponent();
    emitted = [];
    component.changePage.subscribe(page => emitted.push(page));
  });

  it('emits the first page of items on init', async () => {
    component.items = Array.from({ length: 30 }, (_, i) => i);
    component.pager.pageSize = component.pageSize;

    component.ngOnInit();

    await Promise.resolve();
    expect(emitted[0].length).toBe(component.pageSize);
    expect(component.pager.currentPage).toBe(1);
  });

  it('prevents navigation before the starting page', () => {
    component.items = [1, 2, 3];
    component.startPage = 2;

    component.setPage(1);

    expect(emitted.length).toBe(0);
  });

  it('blocks forward navigation past the available items', () => {
    component.items = Array.from({ length: 10 }, (_, i) => i);
    component.totalItems = 10;

    component.setPage(2);

    expect(emitted.length).toBe(0);
  });

  it('emits the correct slice for middle pages', async () => {
    component.items = Array.from({ length: 25 }, (_, i) => i);
    component.pager.pageSize = component.pageSize;

    component.setPage(2);

    await Promise.resolve();
    expect(emitted[0][0]).toBe(20);
    expect(emitted[0].length).toBe(5);
  });
});
