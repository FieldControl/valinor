import { Pipe, PipeTransform } from '@angular/core';
import { FormatterLib } from '../lib/formatter.lib';

@Pipe({ name: 'account' })
export class AccountPipe implements PipeTransform {
    constructor(private formatter: FormatterLib) {}
    transform(account: number | string): string {
        return this.formatter.formatAccount(account);
    }
}
