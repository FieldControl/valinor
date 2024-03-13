import { ShortDatePipe } from './short-date.pipe';

describe('ShortDatePipe', () => {
  it('create an instance', () => {
    const pipe = new ShortDatePipe();
    expect(pipe).toBeTruthy();
  });

  it('transform date', () => {
    const pipe = new ShortDatePipe();
    const date = new Date();
    const monthNames = [
      'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
      'jul', 'ago', 'set', 'out', 'nov', 'dez'
    ];
    const date_expect = `${date.getDate()} de ${monthNames[date.getMonth()]}`;
    const date_result = pipe.transform(date)
    expect(date_result).toEqual(date_expect);
  });
});
