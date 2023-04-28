import { Pipe, PipeTransform } from '@angular/core';
import { FormatterLib } from '../lib/formatter.lib';

@Pipe({ name: 'cnpj' })
export class CnpjPipe implements PipeTransform {
    constructor(private formatter: FormatterLib) {}
    transform(cnpj: number | string): string {
        return this.formatter.formatCnpj(cnpj);
    }
}
