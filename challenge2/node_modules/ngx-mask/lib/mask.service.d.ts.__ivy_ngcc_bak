import { ElementRef, Renderer2 } from '@angular/core';
import { IConfig } from './config';
import { MaskApplierService } from './mask-applier.service';
export declare class MaskService extends MaskApplierService {
    private document;
    protected _config: IConfig;
    private _elementRef;
    private _renderer;
    maskExpression: string;
    isNumberValue: boolean;
    placeHolderCharacter: string;
    maskIsShown: string;
    selStart: number | null;
    selEnd: number | null;
    /**
     * Whether we are currently in writeValue function, in this case when applying the mask we don't want to trigger onChange function,
     * since writeValue should be a one way only process of writing the DOM value based on the Angular model value.
     */
    writingValue: boolean;
    maskChanged: boolean;
    onChange: (_: any) => void;
    constructor(document: any, _config: IConfig, _elementRef: ElementRef, _renderer: Renderer2);
    applyMask(inputValue: string, maskExpression: string, position?: number, justPasted?: boolean, backspaced?: boolean, cb?: Function): string;
    private _numberSkipedSymbols;
    applyValueChanges(position: number | undefined, justPasted: boolean, backspaced: boolean, cb?: Function): void;
    hideInput(inputValue: string, maskExpression: string): string;
    getActualValue(res: string): string;
    shiftTypedSymbols(inputValue: string): string;
    showMaskInInput(inputVal?: string): string;
    clearIfNotMatchFn(): void;
    set formElementProperty([name, value]: [string, string | boolean]);
    checkSpecialCharAmount(mask: string): number;
    removeMask(inputValue: string): string;
    private _checkForIp;
    private _checkForCpfCnpj;
    /**
     * Propogates the input value back to the Angular model by triggering the onChange function. It won't do this if writingValue
     * is true. If that is true it means we are currently in the writeValue function, which is supposed to only update the actual
     * DOM element based on the Angular model value. It should be a one way process, i.e. writeValue should not be modifying the Angular
     * model value too. Therefore, we don't trigger onChange in this scenario.
     * @param inputValue the current form input value
     */
    private formControlResult;
    private _toNumber;
    private _removeMask;
    private _removePrefix;
    private _removeSuffix;
    private _retrieveSeparatorValue;
    private _regExpForRemove;
    private _checkSymbols;
    private _retrieveSeparatorPrecision;
    private _checkPrecision;
}
