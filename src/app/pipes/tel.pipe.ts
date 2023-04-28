import { Pipe, PipeTransform } from '@angular/core';
import { FormatterLib } from '../lib/formatter.lib';

@Pipe({ name: 'tel' })
export class TelWithDDDPipe implements PipeTransform {
    constructor(private formatter: FormatterLib) {}
    transform(telWithDDD: number | string): string {
        return this.formatter.formatTelWithDDD(telWithDDD);
    }
}
