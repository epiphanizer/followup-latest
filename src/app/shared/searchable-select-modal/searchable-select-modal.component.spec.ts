import { SearchableSelectModalComponent } from './searchable-select-modal.component';

describe('SearchableSelectModalComponent (Jest)', () => {
  it('initializes with the provided selected value and filters items case-insensitively', () => {
    const modalCtrl = { dismiss: jest.fn() } as any;
    const comp = new SearchableSelectModalComponent(modalCtrl);

    comp.items = [
      { label: 'HAVEN', value: 'op-1', searchText: 'Haven' },
      { label: '- COTTONWOOD', value: 'op-2', searchText: 'Cottonwood' }
    ];
    comp.selectedValue = 'op-1';

    comp.ngOnInit();
    comp.onSearchChange({ detail: { value: 'cotton' } } as any);

    expect(comp.tempSelectedValue).toBe('op-1');
    expect(comp.filteredItems.map(item => item.value)).toEqual(['op-2']);
  });

  it('clears search back to the full list', () => {
    const modalCtrl = { dismiss: jest.fn() } as any;
    const comp = new SearchableSelectModalComponent(modalCtrl);

    comp.items = [
      { label: 'HAVEN', value: 'op-1', searchText: 'Haven' },
      { label: '- COTTONWOOD', value: 'op-2', searchText: 'Cottonwood' }
    ];
    comp.ngOnInit();
    comp.onSearchChange({ detail: { value: 'cotton' } } as any);
    comp.onSearchChange({ detail: { value: '' } } as any);

    expect(comp.filteredItems.map(item => item.value)).toEqual(['op-1', 'op-2']);
  });

  it('dismisses with confirm data only when OK is pressed', async () => {
    const modalCtrl = { dismiss: jest.fn(() => Promise.resolve()) } as any;
    const comp = new SearchableSelectModalComponent(modalCtrl);

    comp.items = [{ label: 'HAVEN', value: 'op-1', searchText: 'Haven' }];
    comp.selectedValue = 'op-1';
    comp.ngOnInit();

    await comp.confirm();

    expect(modalCtrl.dismiss).toHaveBeenCalledWith({ value: 'op-1' }, 'confirm');
  });

  it('dismisses with cancel data when cancelled', async () => {
    const modalCtrl = { dismiss: jest.fn(() => Promise.resolve()) } as any;
    const comp = new SearchableSelectModalComponent(modalCtrl);

    await comp.cancel();

    expect(modalCtrl.dismiss).toHaveBeenCalledWith(undefined, 'cancel');
  });
});