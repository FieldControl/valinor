import { PipeTransform } from '@angular/core';
import { MaskApplierService } from './mask-applier.service';
import { IConfig } from './config';
import * as ɵngcc0 from '@angular/core';
export declare class MaskPipe implements PipeTransform {
    private _maskService;
    constructor(_maskService: MaskApplierService);
    transform(value: string | number, mask: string | [string, IConfig['patterns']], thousandSeparator?: string | null): string;
    static ɵfac: ɵngcc0.ɵɵFactoryDeclaration<MaskPipe, never>;
    static ɵpipe: ɵngcc0.ɵɵPipeDeclaration<MaskPipe, "mask">;
}

//# sourceMappingURL=mask.pipe.d.ts.map