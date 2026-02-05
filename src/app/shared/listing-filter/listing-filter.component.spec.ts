import { ListingFilterComponent } from './listing-filter.component';

describe('ListingFilterComponent', () => {
  const build = () => {
    const component = new ListingFilterComponent();
    component.options = ['name', 'date'];
    return component;
  };

  it('defaults to the first option on init', () => {
    const component = build();

    component.ngOnInit();

    expect(component.selectedOption).toBe('name');
  });

  it('emits sort direction changes', () => {
    const component = build();
    const emissions: string[] = [];
    component.sortDirectionSelectedEventEmitter.subscribe(value => emissions.push(value));

    component.selectAscEvent();
    component.selectDescEvent();

    expect(emissions).toEqual(['asc', 'desc']);
    expect(component.sortDirection).toBe('desc');
  });

  it('emits option selection and toggles the dropdown state', () => {
    const component = build();
    const options: string[] = [];
    component.sortOptionSelectedEventEmitter.subscribe(value => options.push(value));

    component.toggleDropdown();
    component.selectOption('date');

    expect(component.dropdownOpen).toBe(true);
    expect(component.selectedOption).toBe('date');
    expect(options).toEqual(['date']);
  });
});
