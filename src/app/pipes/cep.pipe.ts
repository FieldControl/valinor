import { Pipe, PipeTransform } from '@angular/core';
import { FormatterLib } from '../lib/formatter.lib';

@Pipe({ name: 'cep' })
export class CepPipe implements PipeTransform {
    constructor(private formatter: FormatterLib) {}
    transform(cep: number | string): string {
        return this.formatter.formatCep(cep);
    }
}
