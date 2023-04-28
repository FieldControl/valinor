import { Pipe, PipeTransform } from '@angular/core';
import { FormatterLib } from '../lib/formatter.lib';

@Pipe({ name: 'cel' })
export class CelWithDDDPipe implements PipeTransform {
    constructor(private formatter: FormatterLib) {}
    transform(celWithDDD: number | string): string {
        return this.formatter.formatCelWithDDD(celWithDDD);
    }
}
