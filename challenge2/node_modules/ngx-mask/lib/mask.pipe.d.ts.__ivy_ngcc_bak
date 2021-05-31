import { PipeTransform } from '@angular/core';
import { MaskApplierService } from './mask-applier.service';
import { IConfig } from './config';
export declare class MaskPipe implements PipeTransform {
    private _maskService;
    constructor(_maskService: MaskApplierService);
    transform(value: string | number, mask: string | [string, IConfig['patterns']], thousandSeparator?: string | null): string;
}
