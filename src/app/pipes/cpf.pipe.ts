import { Pipe, PipeTransform } from '@angular/core';
import { FormatterLib } from '../lib/formatter.lib';

@Pipe({ name: 'cpf' })
export class CpfPipe implements PipeTransform {
    constructor(private formatter: FormatterLib) {}
    transform(cpf: number | string): string {
        return this.formatter.formatCpf(cpf);
    }
}
