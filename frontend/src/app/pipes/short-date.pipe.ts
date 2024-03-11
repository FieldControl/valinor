import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortDate'
})
export class ShortDatePipe implements PipeTransform {

  transform(value: String | number | Date): string {
    const date = new Date(value.toString());
    const monthNames = [
      'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
      'jul', 'ago', 'set', 'out', 'nov', 'dez'
    ];
    const day = date.getDate();
    const monthIndex = date.getMonth();
    const month = monthNames[monthIndex];
    return `${day} de ${month}`;
  }

}
