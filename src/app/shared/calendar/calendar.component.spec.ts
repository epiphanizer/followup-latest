import { CalendarComponent } from './calendar.component';

describe('CalendarComponent (Jest)', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2020-05-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('initializes with today and emits the default date', () => {
    const component = new CalendarComponent();
    const emissions: string[] = [];
    component.dateFilterChangeEvent.subscribe(date => emissions.push(date));

    component.ngOnInit();

    expect(emissions[0]).toBe('5/15/2020');
    expect(component.selectedMonth.number).toBe('5');
    expect(component.selectedDay).toBe(15);
    expect(component.offsetNumber).toBe(-5);
    expect(component.selectedMonth.daysArray.length).toBeGreaterThan(component.selectedMonth.numberOfDays);
    expect(component.selectedMonth.daysArray).toContain(1);
    expect(component.selectedMonth.daysArray).toContain(31);
  });

  it('moves to the previous month and rebuilds the calendar grid', () => {
    const component = new CalendarComponent();
    component.dateFilterChangeEvent.subscribe(() => {});
    component.ngOnInit();

    component.calendarPrevMonth();

    expect(component.selectedMonth.number).toBe('4');
    expect(component.selectedYear.year).toBe(2020);
    expect(component.currentCalendarMonth.name).toBe('April');
    expect(component.selectedMonth.numberOfDays).toBe(30);
    expect(component.selectedMonth.daysArray.length).toBeGreaterThan(component.selectedMonth.numberOfDays);
    expect(component.selectedMonth.daysArray[component.selectedMonth.daysArray.length - 1]).toBe(30);
  });

  it('selects a date and emits a formatted string', () => {
    const component = new CalendarComponent();
    const emissions: string[] = [];
    component.dateFilterChangeEvent.subscribe(date => emissions.push(date));

    component.selectDateEventHandler(3, 2, 2020);

    expect(component.selectedDate).toBe('2/03/2020');
    expect(component.selectedDay).toBe(3);
    expect(component.chosenMonth).toBe('2');
    expect(emissions[0]).toBe('2/03/2020');
  });
});
