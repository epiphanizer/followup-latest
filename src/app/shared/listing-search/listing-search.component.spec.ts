import { ListingSearchComponent } from './listing-search.component';

describe('ListingSearchComponent', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('debounces before emitting the search text', () => {
    const component = new ListingSearchComponent();
    const emissions: string[] = [];
    component.searchFilterEventEmitted.subscribe(value => emissions.push(value));

    component.updateSearchText({ target: { value: 'hello' } });

    expect(emissions).toHaveLength(0);
    jest.advanceTimersByTime(1000);
    expect(component.searchText).toBe('hello');
    expect(emissions).toEqual(['hello']);
  });

  it('resets the timer when a new value arrives before the debounce window', () => {
    const component = new ListingSearchComponent();
    const emissions: string[] = [];
    component.searchFilterEventEmitted.subscribe(value => emissions.push(value));

    component.updateSearchText({ target: { value: 'first' } });
    jest.advanceTimersByTime(500);
    component.updateSearchText({ target: { value: 'second' } });

    jest.advanceTimersByTime(999);
    expect(emissions).toHaveLength(0);

    jest.advanceTimersByTime(1);
    expect(emissions).toEqual(['second']);
    expect(component.searchText).toBe('second');
  });
});
