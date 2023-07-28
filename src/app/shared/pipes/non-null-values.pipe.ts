import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nonNullValues',
})
export class NonNullValuesPipe implements PipeTransform {
  transform(value: string | number | null | undefined): string {
    return value === undefined || value === null ? '' : value.toString();
  }
}
