import { ElementRef, Inject, Injectable, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { config } from './config';
import { MaskApplierService } from './mask-applier.service';
export class MaskService extends MaskApplierService {
    constructor(document, _config, _elementRef, _renderer) {
        super(_config);
        this.document = document;
        this._config = _config;
        this._elementRef = _elementRef;
        this._renderer = _renderer;
        this.maskExpression = '';
        this.isNumberValue = false;
        this.placeHolderCharacter = '_';
        this.maskIsShown = '';
        this.selStart = null;
        this.selEnd = null;
        /**
         * Whether we are currently in writeValue function, in this case when applying the mask we don't want to trigger onChange function,
         * since writeValue should be a one way only process of writing the DOM value based on the Angular model value.
         */
        this.writingValue = false;
        this.maskChanged = false;
        this.onChange = (_) => { };
    }
    // tslint:disable-next-line:cyclomatic-complexity
    applyMask(inputValue, maskExpression, position = 0, justPasted = false, backspaced = false, cb = () => { }) {
        if (!maskExpression) {
            return inputValue;
        }
        this.maskIsShown = this.showMaskTyped ? this.showMaskInInput() : '';
        if (this.maskExpression === 'IP' && this.showMaskTyped) {
            this.maskIsShown = this.showMaskInInput(inputValue || '#');
        }
        if (this.maskExpression === 'CPF_CNPJ' && this.showMaskTyped) {
            this.maskIsShown = this.showMaskInInput(inputValue || '#');
        }
        if (!inputValue && this.showMaskTyped) {
            this.formControlResult(this.prefix);
            return this.prefix + this.maskIsShown;
        }
        const getSymbol = !!inputValue && typeof this.selStart === 'number' ? inputValue[this.selStart] : '';
        let newInputValue = '';
        if (this.hiddenInput && !this.writingValue) {
            let actualResult = this.actualValue.split('');
            // tslint:disable no-unused-expression
            inputValue !== '' && actualResult.length
                ? typeof this.selStart === 'number' && typeof this.selEnd === 'number'
                    ? inputValue.length > actualResult.length
                        ? actualResult.splice(this.selStart, 0, getSymbol)
                        : inputValue.length < actualResult.length
                            ? actualResult.length - inputValue.length === 1
                                ? actualResult.splice(this.selStart - 1, 1)
                                : actualResult.splice(this.selStart, this.selEnd - this.selStart)
                            : null
                    : null
                : (actualResult = []);
            // tslint:enable no-unused-expression
            newInputValue =
                this.actualValue.length && actualResult.length <= inputValue.length
                    ? this.shiftTypedSymbols(actualResult.join(''))
                    : inputValue;
        }
        newInputValue = Boolean(newInputValue) && newInputValue.length ? newInputValue : inputValue;
        const result = super.applyMask(newInputValue, maskExpression, position, justPasted, backspaced, cb);
        this.actualValue = this.getActualValue(result);
        // handle some separator implications:
        // a.) adjust decimalMarker default (. -> ,) if thousandSeparator is a dot
        if (this.thousandSeparator === '.' && this.decimalMarker === '.') {
            this.decimalMarker = ',';
        }
        // b) remove decimal marker from list of special characters to mask
        if (this.maskExpression.startsWith('separator') && this.dropSpecialCharacters === true) {
            this.maskSpecialCharacters = this.maskSpecialCharacters.filter((item) => item !== this.decimalMarker);
        }
        this.formControlResult(result);
        if (!this.showMaskTyped) {
            if (this.hiddenInput) {
                return result && result.length ? this.hideInput(result, this.maskExpression) : result;
            }
            return result;
        }
        const resLen = result.length;
        const prefNmask = this.prefix + this.maskIsShown;
        if (this.maskExpression.includes('H')) {
            const countSkipedSymbol = this._numberSkipedSymbols(result);
            return result + prefNmask.slice(resLen + countSkipedSymbol);
        }
        else if (this.maskExpression === 'IP' || this.maskExpression === 'CPF_CNPJ') {
            return result + prefNmask;
        }
        return result + prefNmask.slice(resLen);
    }
    // get the number of characters that were shifted
    _numberSkipedSymbols(value) {
        const regex = /(^|\D)(\d\D)/g;
        let match = regex.exec(value);
        let countSkipedSymbol = 0;
        while (match != null) {
            countSkipedSymbol += 1;
            match = regex.exec(value);
        }
        return countSkipedSymbol;
    }
    applyValueChanges(position = 0, justPasted, backspaced, cb = () => { }) {
        const formElement = this._elementRef.nativeElement;
        formElement.value = this.applyMask(formElement.value, this.maskExpression, position, justPasted, backspaced, cb);
        if (formElement === this.document.activeElement) {
            return;
        }
        this.clearIfNotMatchFn();
    }
    hideInput(inputValue, maskExpression) {
        return inputValue
            .split('')
            .map((curr, index) => {
            if (this.maskAvailablePatterns &&
                this.maskAvailablePatterns[maskExpression[index]] &&
                this.maskAvailablePatterns[maskExpression[index]].symbol) {
                return this.maskAvailablePatterns[maskExpression[index]].symbol;
            }
            return curr;
        })
            .join('');
    }
    // this function is not necessary, it checks result against maskExpression
    getActualValue(res) {
        const compare = res
            .split('')
            .filter((symbol, i) => this._checkSymbolMask(symbol, this.maskExpression[i]) ||
            (this.maskSpecialCharacters.includes(this.maskExpression[i]) && symbol === this.maskExpression[i]));
        if (compare.join('') === res) {
            return compare.join('');
        }
        return res;
    }
    shiftTypedSymbols(inputValue) {
        let symbolToReplace = '';
        const newInputValue = (inputValue &&
            inputValue.split('').map((currSymbol, index) => {
                if (this.maskSpecialCharacters.includes(inputValue[index + 1]) &&
                    inputValue[index + 1] !== this.maskExpression[index + 1]) {
                    symbolToReplace = currSymbol;
                    return inputValue[index + 1];
                }
                if (symbolToReplace.length) {
                    const replaceSymbol = symbolToReplace;
                    symbolToReplace = '';
                    return replaceSymbol;
                }
                return currSymbol;
            })) ||
            [];
        return newInputValue.join('');
    }
    showMaskInInput(inputVal) {
        if (this.showMaskTyped && !!this.shownMaskExpression) {
            if (this.maskExpression.length !== this.shownMaskExpression.length) {
                throw new Error('Mask expression must match mask placeholder length');
            }
            else {
                return this.shownMaskExpression;
            }
        }
        else if (this.showMaskTyped) {
            if (inputVal) {
                if (this.maskExpression === 'IP') {
                    return this._checkForIp(inputVal);
                }
                if (this.maskExpression === 'CPF_CNPJ') {
                    return this._checkForCpfCnpj(inputVal);
                }
            }
            return this.maskExpression.replace(/\w/g, this.placeHolderCharacter);
        }
        return '';
    }
    clearIfNotMatchFn() {
        const formElement = this._elementRef.nativeElement;
        if (this.clearIfNotMatch &&
            this.prefix.length + this.maskExpression.length + this.suffix.length !==
                formElement.value.replace(/_/g, '').length) {
            this.formElementProperty = ['value', ''];
            this.applyMask(formElement.value, this.maskExpression);
        }
    }
    set formElementProperty([name, value]) {
        Promise.resolve().then(() => this._renderer.setProperty(this._elementRef.nativeElement, name, value));
    }
    checkSpecialCharAmount(mask) {
        const chars = mask.split('').filter((item) => this._findSpecialChar(item));
        return chars.length;
    }
    removeMask(inputValue) {
        return this._removeMask(this._removeSuffix(this._removePrefix(inputValue)), this.maskSpecialCharacters.concat('_').concat(this.placeHolderCharacter));
    }
    _checkForIp(inputVal) {
        if (inputVal === '#') {
            return `${this.placeHolderCharacter}.${this.placeHolderCharacter}.${this.placeHolderCharacter}.${this.placeHolderCharacter}`;
        }
        const arr = [];
        for (let i = 0; i < inputVal.length; i++) {
            if (inputVal[i].match('\\d')) {
                arr.push(inputVal[i]);
            }
        }
        if (arr.length <= 3) {
            return `${this.placeHolderCharacter}.${this.placeHolderCharacter}.${this.placeHolderCharacter}`;
        }
        if (arr.length > 3 && arr.length <= 6) {
            return `${this.placeHolderCharacter}.${this.placeHolderCharacter}`;
        }
        if (arr.length > 6 && arr.length <= 9) {
            return this.placeHolderCharacter;
        }
        if (arr.length > 9 && arr.length <= 12) {
            return '';
        }
        return '';
    }
    _checkForCpfCnpj(inputVal) {
        const cpf = `${this.placeHolderCharacter}${this.placeHolderCharacter}${this.placeHolderCharacter}` +
            `.${this.placeHolderCharacter}${this.placeHolderCharacter}${this.placeHolderCharacter}` +
            `.${this.placeHolderCharacter}${this.placeHolderCharacter}${this.placeHolderCharacter}` +
            `-${this.placeHolderCharacter}${this.placeHolderCharacter}`;
        const cnpj = `${this.placeHolderCharacter}${this.placeHolderCharacter}` +
            `.${this.placeHolderCharacter}${this.placeHolderCharacter}${this.placeHolderCharacter}` +
            `.${this.placeHolderCharacter}${this.placeHolderCharacter}${this.placeHolderCharacter}` +
            `/${this.placeHolderCharacter}${this.placeHolderCharacter}${this.placeHolderCharacter}${this.placeHolderCharacter}` +
            `-${this.placeHolderCharacter}${this.placeHolderCharacter}`;
        if (inputVal === '#') {
            return cpf;
        }
        const arr = [];
        for (let i = 0; i < inputVal.length; i++) {
            if (inputVal[i].match('\\d')) {
                arr.push(inputVal[i]);
            }
        }
        if (arr.length <= 3) {
            return cpf.slice(arr.length, cpf.length);
        }
        if (arr.length > 3 && arr.length <= 6) {
            return cpf.slice(arr.length + 1, cpf.length);
        }
        if (arr.length > 6 && arr.length <= 9) {
            return cpf.slice(arr.length + 2, cpf.length);
        }
        if (arr.length > 9 && arr.length < 11) {
            return cpf.slice(arr.length + 3, cpf.length);
        }
        if (arr.length === 11) {
            return '';
        }
        if (arr.length === 12) {
            if (inputVal.length === 17) {
                return cnpj.slice(16, cnpj.length);
            }
            return cnpj.slice(15, cnpj.length);
        }
        if (arr.length > 12 && arr.length <= 14) {
            return cnpj.slice(arr.length + 4, cnpj.length);
        }
        return '';
    }
    /**
     * Propogates the input value back to the Angular model by triggering the onChange function. It won't do this if writingValue
     * is true. If that is true it means we are currently in the writeValue function, which is supposed to only update the actual
     * DOM element based on the Angular model value. It should be a one way process, i.e. writeValue should not be modifying the Angular
     * model value too. Therefore, we don't trigger onChange in this scenario.
     * @param inputValue the current form input value
     */
    formControlResult(inputValue) {
        if (this.writingValue || this.maskChanged) {
            this.maskChanged = false;
            return;
        }
        if (Array.isArray(this.dropSpecialCharacters)) {
            this.onChange(this._toNumber(this._removeMask(this._removeSuffix(this._removePrefix(inputValue)), this.dropSpecialCharacters)));
        }
        else if (this.dropSpecialCharacters) {
            this.onChange(this._toNumber(this._checkSymbols(inputValue)));
        }
        else {
            this.onChange(this._removeSuffix(inputValue));
        }
    }
    _toNumber(value) {
        if (!this.isNumberValue || value === '') {
            return value;
        }
        const num = Number(value);
        return Number.isNaN(num) ? value : num;
    }
    _removeMask(value, specialCharactersForRemove) {
        return value ? value.replace(this._regExpForRemove(specialCharactersForRemove), '') : value;
    }
    _removePrefix(value) {
        if (!this.prefix) {
            return value;
        }
        return value ? value.replace(this.prefix, '') : value;
    }
    _removeSuffix(value) {
        if (!this.suffix) {
            return value;
        }
        return value ? value.replace(this.suffix, '') : value;
    }
    _retrieveSeparatorValue(result) {
        return this._removeMask(this._removeSuffix(this._removePrefix(result)), this.maskSpecialCharacters);
    }
    _regExpForRemove(specialCharactersForRemove) {
        return new RegExp(specialCharactersForRemove.map((item) => `\\${item}`).join('|'), 'gi');
    }
    _checkSymbols(result) {
        if (result === '') {
            return result;
        }
        const separatorPrecision = this._retrieveSeparatorPrecision(this.maskExpression);
        let separatorValue = this._retrieveSeparatorValue(result);
        if (this.decimalMarker !== '.') {
            separatorValue = separatorValue.replace(this.decimalMarker, '.');
        }
        if (!this.isNumberValue) {
            return separatorValue;
        }
        if (separatorPrecision) {
            if (result === this.decimalMarker) {
                return null;
            }
            return this._checkPrecision(this.maskExpression, separatorValue);
        }
        else {
            return Number(separatorValue);
        }
    }
    // TODO should think about helpers or separting decimal precision to own property
    _retrieveSeparatorPrecision(maskExpretion) {
        const matcher = maskExpretion.match(new RegExp(`^separator\\.([^d]*)`));
        return matcher ? Number(matcher[1]) : null;
    }
    _checkPrecision(separatorExpression, separatorValue) {
        if (separatorExpression.indexOf('2') > 0) {
            return Number(separatorValue).toFixed(2);
        }
        return Number(separatorValue);
    }
}
MaskService.decorators = [
    { type: Injectable }
];
MaskService.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] },
    { type: undefined, decorators: [{ type: Inject, args: [config,] }] },
    { type: ElementRef },
    { type: Renderer2 }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFzay5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvbmd4LW1hc2stbGliL3NyYy9saWIvbWFzay5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDMUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBRTNDLE9BQU8sRUFBRSxNQUFNLEVBQVcsTUFBTSxVQUFVLENBQUM7QUFDM0MsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFHNUQsTUFBTSxPQUFPLFdBQVksU0FBUSxrQkFBa0I7SUFpQmpELFlBQzRCLFFBQWEsRUFDYixPQUFnQixFQUNsQyxXQUF1QixFQUN2QixTQUFvQjtRQUU1QixLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFMVyxhQUFRLEdBQVIsUUFBUSxDQUFLO1FBQ2IsWUFBTyxHQUFQLE9BQU8sQ0FBUztRQUNsQyxnQkFBVyxHQUFYLFdBQVcsQ0FBWTtRQUN2QixjQUFTLEdBQVQsU0FBUyxDQUFXO1FBcEJ2QixtQkFBYyxHQUFXLEVBQUUsQ0FBQztRQUM1QixrQkFBYSxHQUFZLEtBQUssQ0FBQztRQUMvQix5QkFBb0IsR0FBVyxHQUFHLENBQUM7UUFDbkMsZ0JBQVcsR0FBVyxFQUFFLENBQUM7UUFDekIsYUFBUSxHQUFrQixJQUFJLENBQUM7UUFDL0IsV0FBTSxHQUFrQixJQUFJLENBQUM7UUFFcEM7OztXQUdHO1FBQ0ksaUJBQVksR0FBWSxLQUFLLENBQUM7UUFDOUIsZ0JBQVcsR0FBWSxLQUFLLENBQUM7UUFFN0IsYUFBUSxHQUFHLENBQUMsQ0FBTSxFQUFFLEVBQUUsR0FBRSxDQUFDLENBQUM7SUFTakMsQ0FBQztJQUVELGlEQUFpRDtJQUMxQyxTQUFTLENBQ2QsVUFBa0IsRUFDbEIs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LENBQUMsbUJBQTJCLEVBQUUsY0FBc0I7UUFDekUsSUFBSSxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ3hDLE9BQU8sTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUMxQztRQUNELE9BQU8sTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ2hDLENBQUM7OztZQWxaRixVQUFVOzs7NENBbUJOLE1BQU0sU0FBQyxRQUFROzRDQUNmLE1BQU0sU0FBQyxNQUFNO1lBMUJULFVBQVU7WUFBc0IsU0FBUyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEVsZW1lbnRSZWYsIEluamVjdCwgSW5qZWN0YWJsZSwgUmVuZGVyZXIyIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBET0NVTUVOVCB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5cbmltcG9ydCB7IGNvbmZpZywgSUNvbmZpZyB9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7IE1hc2tBcHBsaWVyU2VydmljZSB9IGZyb20gJy4vbWFzay1hcHBsaWVyLnNlcnZpY2UnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTWFza1NlcnZpY2UgZXh0ZW5kcyBNYXNrQXBwbGllclNlcnZpY2Uge1xuICBwdWJsaWMgbWFza0V4cHJlc3Npb246IHN0cmluZyA9ICcnO1xuICBwdWJsaWMgaXNOdW1iZXJWYWx1ZTogYm9vbGVhbiA9IGZhbHNlO1xuICBwdWJsaWMgcGxhY2VIb2xkZXJDaGFyYWN0ZXI6IHN0cmluZyA9ICdfJztcbiAgcHVibGljIG1hc2tJc1Nob3duOiBzdHJpbmcgPSAnJztcbiAgcHVibGljIHNlbFN0YXJ0OiBudW1iZXIgfCBudWxsID0gbnVsbDtcbiAgcHVibGljIHNlbEVuZDogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgd2UgYXJlIGN1cnJlbnRseSBpbiB3cml0ZVZhbHVlIGZ1bmN0aW9uLCBpbiB0aGlzIGNhc2Ugd2hlbiBhcHBseWluZyB0aGUgbWFzayB3ZSBkb24ndCB3YW50IHRvIHRyaWdnZXIgb25DaGFuZ2UgZnVuY3Rpb24sXG4gICAqIHNpbmNlIHdyaXRlVmFsdWUgc2hvdWxkIGJlIGEgb25lIHdheSBvbmx5IHByb2Nlc3Mgb2Ygd3JpdGluZyB0aGUgRE9NIHZhbHVlIGJhc2VkIG9uIHRoZSBBbmd1bGFyIG1vZGVsIHZhbHVlLlxuICAgKi9cbiAgcHVibGljIHdyaXRpbmdWYWx1ZTogYm9vbGVhbiA9IGZhbHNlO1xuICBwdWJsaWMgbWFza0NoYW5nZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICBwdWJsaWMgb25DaGFuZ2UgPSAoXzogYW55KSA9PiB7fTtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoXG4gICAgQEluamVjdChET0NVTUVOVCkgcHJpdmF0ZSBkb2N1bWVudDogYW55LFxuICAgIEBJbmplY3QoY29uZmlnKSBwcm90ZWN0ZWQgX2NvbmZpZzogSUNvbmZpZyxcbiAgICBwcml2YXRlIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmLFxuICAgIHByaXZhdGUgX3JlbmRlcmVyOiBSZW5kZXJlcjJcbiAgKSB7XG4gICAgc3VwZXIoX2NvbmZpZyk7XG4gIH1cblxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6Y3ljbG9tYXRpYy1jb21wbGV4aXR5XG4gIHB1YmxpYyBhcHBseU1hc2soXG4gICAgaW5wdXRWYWx1ZTogc3RyaW5nLFxuICAgIG1hc2tFeHByZXNzaW9uOiBzdHJpbmcsXG4gICAgcG9zaXRpb246IG51bWJlciA9IDAsXG4gICAganVzdFBhc3RlZCA9IGZhbHNlLFxuICAgIGJhY2tzcGFjZWQgPSBmYWxzZSxcbiAgICBjYjogRnVuY3Rpb24gPSAoKSA9PiB7fVxuICApOiBzdHJpbmcge1xuICAgIGlmICghbWFza0V4cHJlc3Npb24pIHtcbiAgICAgIHJldHVybiBpbnB1dFZhbHVlO1xuICAgIH1cbiAgICB0aGlzLm1hc2tJc1Nob3duID0gdGhpcy5zaG93TWFza1R5cGVkID8gdGhpcy5zaG93TWFza0luSW5wdXQoKSA6ICcnO1xuICAgIGlmICh0aGlzLm1hc2tFeHByZXNzaW9uID09PSAnSVAnICYmIHRoaXMuc2hvd01hc2tUeXBlZCkge1xuICAgICAgdGhpcy5tYXNrSXNTaG93biA9IHRoaXMuc2hvd01hc2tJbklucHV0KGlucHV0VmFsdWUgfHwgJyMnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMubWFza0V4cHJlc3Npb24gPT09ICdDUEZfQ05QSicgJiYgdGhpcy5zaG93TWFza1R5cGVkKSB7XG4gICAgICB0aGlzLm1hc2tJc1Nob3duID0gdGhpcy5zaG93TWFza0luSW5wdXQoaW5wdXRWYWx1ZSB8fCAnIycpO1xuICAgIH1cbiAgICBpZiAoIWlucHV0VmFsdWUgJiYgdGhpcy5zaG93TWFza1R5cGVkKSB7XG4gICAgICB0aGlzLmZvcm1Db250cm9sUmVzdWx0KHRoaXMucHJlZml4KTtcbiAgICAgIHJldHVybiB0aGlzLnByZWZpeCArIHRoaXMubWFza0lzU2hvd247XG4gICAgfVxuICAgIGNvbnN0IGdldFN5bWJvbDogc3RyaW5nID0gISFpbnB1dFZhbHVlICYmIHR5cGVvZiB0aGlzLnNlbFN0YXJ0ID09PSAnbnVtYmVyJyA/IGlucHV0VmFsdWVbdGhpcy5zZWxTdGFydF0gOiAnJztcbiAgICBsZXQgbmV3SW5wdXRWYWx1ZSA9ICcnO1xuICAgIGlmICh0aGlzLmhpZGRlbklucHV0ICYmICF0aGlzLndyaXRpbmdWYWx1ZSkge1xuICAgICAgbGV0IGFjdHVhbFJlc3VsdDogc3RyaW5nW10gPSB0aGlzLmFjdHVhbFZhbHVlLnNwbGl0KCcnKTtcbiAgICAgIC8vIHRzbGludDpkaXNhYmxlIG5vLXVudXNlZC1leHByZXNzaW9uXG4gICAgICBpbnB1dFZhbHVlICE9PSAnJyAmJiBhY3R1YWxSZXN1bHQubGVuZ3RoXG4gICAgICAgID8gdHlwZW9mIHRoaXMuc2VsU3RhcnQgPT09ICdudW1iZXInICYmIHR5cGVvZiB0aGlzLnNlbEVuZCA9PT0gJ251bWJlcidcbiAgICAgICAgICA/IGlucHV0VmFsdWUubGVuZ3RoID4gYWN0dWFsUmVzdWx0Lmxlbmd0aFxuICAgICAgICAgICAgPyBhY3R1YWxSZXN1bHQuc3BsaWNlKHRoaXMuc2VsU3RhcnQsIDAsIGdldFN5bWJvbClcbiAgICAgICAgICAgIDogaW5wdXRWYWx1ZS5sZW5ndGggPCBhY3R1YWxSZXN1bHQubGVuZ3RoXG4gICAgICAgICAgICA/IGFjdHVhbFJlc3VsdC5sZW5ndGggLSBpbnB1dFZhbHVlLmxlbmd0aCA9PT0gMVxuICAgICAgICAgICAgICA/IGFjdHVhbFJlc3VsdC5zcGxpY2UodGhpcy5zZWxTdGFydCAtIDEsIDEpXG4gICAgICAgICAgICAgIDogYWN0dWFsUmVzdWx0LnNwbGljZSh0aGlzLnNlbFN0YXJ0LCB0aGlzLnNlbEVuZCAtIHRoaXMuc2VsU3RhcnQpXG4gICAgICAgICAgICA6IG51bGxcbiAgICAgICAgICA6IG51bGxcbiAgICAgICAgOiAoYWN0dWFsUmVzdWx0ID0gW10pO1xuICAgICAgLy8gdHNsaW50OmVuYWJsZSBuby11bnVzZWQtZXhwcmVzc2lvblxuICAgICAgbmV3SW5wdXRWYWx1ZSA9XG4gICAgICAgIHRoaXMuYWN0dWFsVmFsdWUubGVuZ3RoICYmIGFjdHVhbFJlc3VsdC5sZW5ndGggPD0gaW5wdXRWYWx1ZS5sZW5ndGhcbiAgICAgICAgICA/IHRoaXMuc2hpZnRUeXBlZFN5bWJvbHMoYWN0dWFsUmVzdWx0LmpvaW4oJycpKVxuICAgICAgICAgIDogaW5wdXRWYWx1ZTtcbiAgICB9XG4gICAgbmV3SW5wdXRWYWx1ZSA9IEJvb2xlYW4obmV3SW5wdXRWYWx1ZSkgJiYgbmV3SW5wdXRWYWx1ZS5sZW5ndGggPyBuZXdJbnB1dFZhbHVlIDogaW5wdXRWYWx1ZTtcbiAgICBjb25zdCByZXN1bHQ6IHN0cmluZyA9IHN1cGVyLmFwcGx5TWFzayhuZXdJbnB1dFZhbHVlLCBtYXNrRXhwcmVzc2lvbiwgcG9zaXRpb24sIGp1c3RQYXN0ZWQsIGJhY2tzcGFjZWQsIGNiKTtcbiAgICB0aGlzLmFjdHVhbFZhbHVlID0gdGhpcy5nZXRBY3R1YWxWYWx1ZShyZXN1bHQpO1xuXG4gICAgLy8gaGFuZGxlIHNvbWUgc2VwYXJhdG9yIGltcGxpY2F0aW9uczpcbiAgICAvLyBhLikgYWRqdXN0IGRlY2ltYWxNYXJrZXIgZGVmYXVsdCAoLiAtPiAsKSBpZiB0aG91c2FuZFNlcGFyYXRvciBpcyBhIGRvdFxuICAgIGlmICh0aGlzLnRob3VzYW5kU2VwYXJhdG9yID09PSAnLicgJiYgdGhpcy5kZWNpbWFsTWFya2VyID09PSAnLicpIHtcbiAgICAgIHRoaXMuZGVjaW1hbE1hcmtlciA9ICcsJztcbiAgICB9XG5cbiAgICAvLyBiKSByZW1vdmUgZGVjaW1hbCBtYXJrZXIgZnJvbSBsaXN0IG9mIHNwZWNpYWwgY2hhcmFjdGVycyB0byBtYXNrXG4gICAgaWYgKHRoaXMubWFza0V4cHJlc3Npb24uc3RhcnRzV2l0aCgnc2VwYXJhdG9yJykgJiYgdGhpcy5kcm9wU3BlY2lhbENoYXJhY3RlcnMgPT09IHRydWUpIHtcbiAgICAgIHRoaXMubWFza1NwZWNpYWxDaGFyYWN0ZXJzID0gdGhpcy5tYXNrU3BlY2lhbENoYXJhY3RlcnMuZmlsdGVyKChpdGVtOiBzdHJpbmcpID0+IGl0ZW0gIT09IHRoaXMuZGVjaW1hbE1hcmtlcik7XG4gICAgfVxuXG4gICAgdGhpcy5mb3JtQ29udHJvbFJlc3VsdChyZXN1bHQpO1xuXG4gICAgaWYgKCF0aGlzLnNob3dNYXNrVHlwZWQpIHtcbiAgICAgIGlmICh0aGlzLmhpZGRlbklucHV0KSB7XG4gICAgICAgIHJldHVybiByZXN1bHQgJiYgcmVzdWx0Lmxlbmd0aCA/IHRoaXMuaGlkZUlucHV0KHJlc3VsdCwgdGhpcy5tYXNrRXhwcmVzc2lvbikgOiByZXN1bHQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICBjb25zdCByZXNMZW46IG51bWJlciA9IHJlc3VsdC5sZW5ndGg7XG4gICAgY29uc3QgcHJlZk5tYXNrOiBzdHJpbmcgPSB0aGlzLnByZWZpeCArIHRoaXMubWFza0lzU2hvd247XG5cbiAgICBpZiAodGhpcy5tYXNrRXhwcmVzc2lvbi5pbmNsdWRlcygnSCcpKSB7XG4gICAgICBjb25zdCBjb3VudFNraXBlZFN5bWJvbCA9IHRoaXMuX251bWJlclNraXBlZFN5bWJvbHMocmVzdWx0KTtcbiAgICAgIHJldHVybiByZXN1bHQgKyBwcmVmTm1hc2suc2xpY2UocmVzTGVuICsgY291bnRTa2lwZWRTeW1ib2wpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5tYXNrRXhwcmVzc2lvbiA9PT0gJ0lQJyB8fCB0aGlzLm1hc2tFeHByZXNzaW9uID09PSAnQ1BGX0NOUEonKSB7XG4gICAgICByZXR1cm4gcmVzdWx0ICsgcHJlZk5tYXNrO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0ICsgcHJlZk5tYXNrLnNsaWNlKHJlc0xlbik7XG4gIH1cblxuICAvLyBnZXQgdGhlIG51bWJlciBvZiBjaGFyYWN0ZXJzIHRoYXQgd2VyZSBzaGlmdGVkXG4gIHByaXZhdGUgX251bWJlclNraXBlZFN5bWJvbHModmFsdWU6IHN0cmluZyk6IG51bWJlciB7XG4gICAgY29uc3QgcmVnZXggPSAvKF58XFxEKShcXGRcXEQpL2c7XG4gICAgbGV0IG1hdGNoID0gcmVnZXguZXhlYyh2YWx1ZSk7XG4gICAgbGV0IGNvdW50U2tpcGVkU3ltYm9sID0gMDtcbiAgICB3aGlsZSAobWF0Y2ggIT0gbnVsbCkge1xuICAgICAgY291bnRTa2lwZWRTeW1ib2wgKz0gMTtcbiAgICAgIG1hdGNoID0gcmVnZXguZXhlYyh2YWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiBjb3VudFNraXBlZFN5bWJvbDtcbiAgfVxuXG4gIHB1YmxpYyBhcHBseVZhbHVlQ2hhbmdlcyhcbiAgICBwb3NpdGlvbjogbnVtYmVyID0gMCxcbiAgICBqdXN0UGFzdGVkOiBib29sZWFuLFxuICAgIGJhY2tzcGFjZWQ6IGJvb2xlYW4sXG4gICAgY2I6IEZ1bmN0aW9uID0gKCkgPT4ge31cbiAgKTogdm9pZCB7XG4gICAgY29uc3QgZm9ybUVsZW1lbnQgPSB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG4gICAgZm9ybUVsZW1lbnQudmFsdWUgPSB0aGlzLmFwcGx5TWFzayhmb3JtRWxlbWVudC52YWx1ZSwgdGhpcy5tYXNrRXhwcmVzc2lvbiwgcG9zaXRpb24sIGp1c3RQYXN0ZWQsIGJhY2tzcGFjZWQsIGNiKTtcbiAgICBpZiAoZm9ybUVsZW1lbnQgPT09IHRoaXMuZG9jdW1lbnQuYWN0aXZlRWxlbWVudCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmNsZWFySWZOb3RNYXRjaEZuKCk7XG4gIH1cblxuICBwdWJsaWMgaGlkZUlucHV0KGlucHV0VmFsdWU6IHN0cmluZywgbWFza0V4cHJlc3Npb246IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGlucHV0VmFsdWVcbiAgICAgIC5zcGxpdCgnJylcbiAgICAgIC5tYXAoKGN1cnI6IHN0cmluZywgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgdGhpcy5tYXNrQXZhaWxhYmxlUGF0dGVybnMgJiZcbiAgICAgICAgICB0aGlzLm1hc2tBdmFpbGFibGVQYXR0ZXJuc1ttYXNrRXhwcmVzc2lvbltpbmRleF1dICYmXG4gICAgICAgICAgdGhpcy5tYXNrQXZhaWxhYmxlUGF0dGVybnNbbWFza0V4cHJlc3Npb25baW5kZXhdXS5zeW1ib2xcbiAgICAgICAgKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMubWFza0F2YWlsYWJsZVBhdHRlcm5zW21hc2tFeHByZXNzaW9uW2luZGV4XV0uc3ltYm9sO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjdXJyO1xuICAgICAgfSlcbiAgICAgIC5qb2luKCcnKTtcbiAgfVxuXG4gIC8vIHRoaXMgZnVuY3Rpb24gaXMgbm90IG5lY2Vzc2FyeSwgaXQgY2hlY2tzIHJlc3VsdCBhZ2FpbnN0IG1hc2tFeHByZXNzaW9uXG4gIHB1YmxpYyBnZXRBY3R1YWxWYWx1ZShyZXM6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgY29tcGFyZTogc3RyaW5nW10gPSByZXNcbiAgICAgIC5zcGxpdCgnJylcbiAgICAgIC5maWx0ZXIoXG4gICAgICAgIChzeW1ib2w6IHN0cmluZywgaTogbnVtYmVyKSA9PlxuICAgICAgICAgIHRoaXMuX2NoZWNrU3ltYm9sTWFzayhzeW1ib2wsIHRoaXMubWFza0V4cHJlc3Npb25baV0pIHx8XG4gICAgICAgICAgKHRoaXMubWFza1NwZWNpYWxDaGFyYWN0ZXJzLmluY2x1ZGVzKHRoaXMubWFza0V4cHJlc3Npb25baV0pICYmIHN5bWJvbCA9PT0gdGhpcy5tYXNrRXhwcmVzc2lvbltpXSlcbiAgICAgICk7XG4gICAgaWYgKGNvbXBhcmUuam9pbignJykgPT09IHJlcykge1xuICAgICAgcmV0dXJuIGNvbXBhcmUuam9pbignJyk7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cblxuICBwdWJsaWMgc2hpZnRUeXBlZFN5bWJvbHMoaW5wdXRWYWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBsZXQgc3ltYm9sVG9SZXBsYWNlID0gJyc7XG4gICAgY29uc3QgbmV3SW5wdXRWYWx1ZTogc3RyaW5nW10gPVxuICAgICAgKGlucHV0VmFsdWUgJiZcbiAgICAgICAgaW5wdXRWYWx1ZS5zcGxpdCgnJykubWFwKChjdXJyU3ltYm9sOiBzdHJpbmcsIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICB0aGlzLm1hc2tTcGVjaWFsQ2hhcmFjdGVycy5pbmNsdWRlcyhpbnB1dFZhbHVlW2luZGV4ICsgMV0pICYmXG4gICAgICAgICAgICBpbnB1dFZhbHVlW2luZGV4ICsgMV0gIT09IHRoaXMubWFza0V4cHJlc3Npb25baW5kZXggKyAxXVxuICAgICAgICAgICkge1xuICAgICAgICAgICAgc3ltYm9sVG9SZXBsYWNlID0gY3VyclN5bWJvbDtcbiAgICAgICAgICAgIHJldHVybiBpbnB1dFZhbHVlW2luZGV4ICsgMV07XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChzeW1ib2xUb1JlcGxhY2UubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb25zdCByZXBsYWNlU3ltYm9sOiBzdHJpbmcgPSBzeW1ib2xUb1JlcGxhY2U7XG4gICAgICAgICAgICBzeW1ib2xUb1JlcGxhY2UgPSAnJztcbiAgICAgICAgICAgIHJldHVybiByZXBsYWNlU3ltYm9sO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gY3VyclN5bWJvbDtcbiAgICAgICAgfSkpIHx8XG4gICAgICBbXTtcbiAgICByZXR1cm4gbmV3SW5wdXRWYWx1ZS5qb2luKCcnKTtcbiAgfVxuXG4gIHB1YmxpYyBzaG93TWFza0luSW5wdXQoaW5wdXRWYWw/OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICh0aGlzLnNob3dNYXNrVHlwZWQgJiYgISF0aGlzLnNob3duTWFza0V4cHJlc3Npb24pIHtcbiAgICAgIGlmICh0aGlzLm1hc2tFeHByZXNzaW9uLmxlbmd0aCAhPT0gdGhpcy5zaG93bk1hc2tFeHByZXNzaW9uLmxlbmd0aCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ01hc2sgZXhwcmVzc2lvbiBtdXN0IG1hdGNoIG1hc2sgcGxhY2Vob2xkZXIgbGVuZ3RoJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5zaG93bk1hc2tFeHByZXNzaW9uO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpcy5zaG93TWFza1R5cGVkKSB7XG4gICAgICBpZiAoaW5wdXRWYWwpIHtcbiAgICAgICAgaWYgKHRoaXMubWFza0V4cHJlc3Npb24gPT09ICdJUCcpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5fY2hlY2tGb3JJcChpbnB1dFZhbCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMubWFza0V4cHJlc3Npb24gPT09ICdDUEZfQ05QSicpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5fY2hlY2tGb3JDcGZDbnBqKGlucHV0VmFsKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMubWFza0V4cHJlc3Npb24ucmVwbGFjZSgvXFx3L2csIHRoaXMucGxhY2VIb2xkZXJDaGFyYWN0ZXIpO1xuICAgIH1cbiAgICByZXR1cm4gJyc7XG4gIH1cblxuICBwdWJsaWMgY2xlYXJJZk5vdE1hdGNoRm4oKTogdm9pZCB7XG4gICAgY29uc3QgZm9ybUVsZW1lbnQgPSB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG4gICAgaWYgKFxuICAgICAgdGhpcy5jbGVhcklmTm90TWF0Y2ggJiZcbiAgICAgIHRoaXMucHJlZml4Lmxlbmd0aCArIHRoaXMubWFza0V4cHJlc3Npb24ubGVuZ3RoICsgdGhpcy5zdWZmaXgubGVuZ3RoICE9PVxuICAgICAgICBmb3JtRWxlbWVudC52YWx1ZS5yZXBsYWNlKC9fL2csICcnKS5sZW5ndGhcbiAgICApIHtcbiAgICAgIHRoaXMuZm9ybUVsZW1lbnRQcm9wZXJ0eSA9IFsndmFsdWUnLCAnJ107XG4gICAgICB0aGlzLmFwcGx5TWFzayhmb3JtRWxlbWVudC52YWx1ZSwgdGhpcy5tYXNrRXhwcmVzc2lvbik7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHNldCBmb3JtRWxlbWVudFByb3BlcnR5KFtuYW1lLCB2YWx1ZV06IFtzdHJpbmcsIHN0cmluZyB8IGJvb2xlYW5dKSB7XG4gICAgUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKSA9PiB0aGlzLl9yZW5kZXJlci5zZXRQcm9wZXJ0eSh0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQsIG5hbWUsIHZhbHVlKSk7XG4gIH1cblxuICBwdWJsaWMgY2hlY2tTcGVjaWFsQ2hhckFtb3VudChtYXNrOiBzdHJpbmcpOiBudW1iZXIge1xuICAgIGNvbnN0IGNoYXJzOiBzdHJpbmdbXSA9IG1hc2suc3BsaXQoJycpLmZpbHRlcigoaXRlbTogc3RyaW5nKSA9PiB0aGlzLl9maW5kU3BlY2lhbENoYXIoaXRlbSkpO1xuICAgIHJldHVybiBjaGFycy5sZW5ndGg7XG4gIH1cblxuICBwdWJsaWMgcmVtb3ZlTWFzayhpbnB1dFZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9yZW1vdmVNYXNrKFxuICAgICAgdGhpcy5fcmVtb3ZlU3VmZml4KHRoaXMuX3JlbW92ZVByZWZpeChpbnB1dFZhbHVlKSksXG4gICAgICB0aGlzLm1hc2tTcGVjaWFsQ2hhcmFjdGVycy5jb25jYXQoJ18nKS5jb25jYXQodGhpcy5wbGFjZUhvbGRlckNoYXJhY3RlcilcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBfY2hlY2tGb3JJcChpbnB1dFZhbDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBpZiAoaW5wdXRWYWwgPT09ICcjJykge1xuICAgICAgcmV0dXJuIGAke3RoaXMucGxhY2VIb2xkZXJDaGFyYWN0ZXJ9LiR7dGhpcy5wbGFjZUhvbGRlckNoYXJhY3Rlcn0uJHt0aGlzLnBsYWNlSG9sZGVyQ2hhcmFjdGVyfS4ke3RoaXMucGxhY2VIb2xkZXJDaGFyYWN0ZXJ9YDtcbiAgICB9XG4gICAgY29uc3QgYXJyOiBzdHJpbmdbXSA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5wdXRWYWwubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChpbnB1dFZhbFtpXS5tYXRjaCgnXFxcXGQnKSkge1xuICAgICAgICBhcnIucHVzaChpbnB1dFZhbFtpXSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChhcnIubGVuZ3RoIDw9IDMpIHtcbiAgICAgIHJldHVybiBgJHt0aGlzLnBsYWNlSG9sZGVyQ2hhcmFjdGVyfS4ke3RoaXMucGxhY2VIb2xkZXJDaGFyYWN0ZXJ9LiR7dGhpcy5wbGFjZUhvbGRlckNoYXJhY3Rlcn1gO1xuICAgIH1cbiAgICBpZiAoYXJyLmxlbmd0aCA+IDMgJiYgYXJyLmxlbmd0aCA8PSA2KSB7XG4gICAgICByZXR1cm4gYCR7dGhpcy5wbGFjZUhvbGRlckNoYXJhY3Rlcn0uJHt0aGlzLnBsYWNlSG9sZGVyQ2hhcmFjdGVyfWA7XG4gICAgfVxuICAgIGlmIChhcnIubGVuZ3RoID4gNiAmJiBhcnIubGVuZ3RoIDw9IDkpIHtcbiAgICAgIHJldHVybiB0aGlzLnBsYWNlSG9sZGVyQ2hhcmFjdGVyO1xuICAgIH1cbiAgICBpZiAoYXJyLmxlbmd0aCA+IDkgJiYgYXJyLmxlbmd0aCA8PSAxMikge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICByZXR1cm4gJyc7XG4gIH1cblxuICBwcml2YXRlIF9jaGVja0ZvckNwZkNucGooaW5wdXRWYWw6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgY3BmID1cbiAgICAgIGAke3RoaXMucGxhY2VIb2xkZXJDaGFyYWN0ZXJ9JHt0aGlzLnBsYWNlSG9sZGVyQ2hhcmFjdGVyfSR7dGhpcy5wbGFjZUhvbGRlckNoYXJhY3Rlcn1gICtcbiAgICAgIGAuJHt0aGlzLnBsYWNlSG9sZGVyQ2hhcmFjdGVyfSR7dGhpcy5wbGFjZUhvbGRlckNoYXJhY3Rlcn0ke3RoaXMucGxhY2VIb2xkZXJDaGFyYWN0ZXJ9YCArXG4gICAgICBgLiR7dGhpcy5wbGFjZUhvbGRlckNoYXJhY3Rlcn0ke3RoaXMucGxhY2VIb2xkZXJDaGFyYWN0ZXJ9JHt0aGlzLnBsYWNlSG9sZGVyQ2hhcmFjdGVyfWAgK1xuICAgICAgYC0ke3RoaXMucGxhY2VIb2xkZXJDaGFyYWN0ZXJ9JHt0aGlzLnBsYWNlSG9sZGVyQ2hhcmFjdGVyfWA7XG4gICAgY29uc3QgY25waiA9XG4gICAgICBgJHt0aGlzLnBsYWNlSG9sZGVyQ2hhcmFjdGVyfSR7dGhpcy5wbGFjZUhvbGRlckNoYXJhY3Rlcn1gICtcbiAgICAgIGAuJHt0aGlzLnBsYWNlSG9sZGVyQ2hhcmFjdGVyfSR7dGhpcy5wbGFjZUhvbGRlckNoYXJhY3Rlcn0ke3RoaXMucGxhY2VIb2xkZXJDaGFyYWN0ZXJ9YCArXG4gICAgICBgLiR7dGhpcy5wbGFjZUhvbGRlckNoYXJhY3Rlcn0ke3RoaXMucGxhY2VIb2xkZXJDaGFyYWN0ZXJ9JHt0aGlzLnBsYWNlSG9sZGVyQ2hhcmFjdGVyfWAgK1xuICAgICAgYC8ke3RoaXMucGxhY2VIb2xkZXJDaGFyYWN0ZXJ9JHt0aGlzLnBsYWNlSG9sZGVyQ2hhcmFjdGVyfSR7dGhpcy5wbGFjZUhvbGRlckNoYXJhY3Rlcn0ke3RoaXMucGxhY2VIb2xkZXJDaGFyYWN0ZXJ9YCArXG4gICAgICBgLSR7dGhpcy5wbGFjZUhvbGRlckNoYXJhY3Rlcn0ke3RoaXMucGxhY2VIb2xkZXJDaGFyYWN0ZXJ9YDtcblxuICAgIGlmIChpbnB1dFZhbCA9PT0gJyMnKSB7XG4gICAgICByZXR1cm4gY3BmO1xuICAgIH1cbiAgICBjb25zdCBhcnI6IHN0cmluZ1tdID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dFZhbC5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGlucHV0VmFsW2ldLm1hdGNoKCdcXFxcZCcpKSB7XG4gICAgICAgIGFyci5wdXNoKGlucHV0VmFsW2ldKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGFyci5sZW5ndGggPD0gMykge1xuICAgICAgcmV0dXJuIGNwZi5zbGljZShhcnIubGVuZ3RoLCBjcGYubGVuZ3RoKTtcbiAgICB9XG4gICAgaWYgKGFyci5sZW5ndGggPiAzICYmIGFyci5sZW5ndGggPD0gNikge1xuICAgICAgcmV0dXJuIGNwZi5zbGljZShhcnIubGVuZ3RoICsgMSwgY3BmLmxlbmd0aCk7XG4gICAgfVxuICAgIGlmIChhcnIubGVuZ3RoID4gNiAmJiBhcnIubGVuZ3RoIDw9IDkpIHtcbiAgICAgIHJldHVybiBjcGYuc2xpY2UoYXJyLmxlbmd0aCArIDIsIGNwZi5sZW5ndGgpO1xuICAgIH1cbiAgICBpZiAoYXJyLmxlbmd0aCA+IDkgJiYgYXJyLmxlbmd0aCA8IDExKSB7XG4gICAgICByZXR1cm4gY3BmLnNsaWNlKGFyci5sZW5ndGggKyAzLCBjcGYubGVuZ3RoKTtcbiAgICB9XG4gICAgaWYgKGFyci5sZW5ndGggPT09IDExKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIGlmIChhcnIubGVuZ3RoID09PSAxMikge1xuICAgICAgaWYgKGlucHV0VmFsLmxlbmd0aCA9PT0gMTcpIHtcbiAgICAgICAgcmV0dXJuIGNucGouc2xpY2UoMTYsIGNucGoubGVuZ3RoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjbnBqLnNsaWNlKDE1LCBjbnBqLmxlbmd0aCk7XG4gICAgfVxuICAgIGlmIChhcnIubGVuZ3RoID4gMTIgJiYgYXJyLmxlbmd0aCA8PSAxNCkge1xuICAgICAgcmV0dXJuIGNucGouc2xpY2UoYXJyLmxlbmd0aCArIDQsIGNucGoubGVuZ3RoKTtcbiAgICB9XG4gICAgcmV0dXJuICcnO1xuICB9XG5cbiAgLyoqXG4gICAqIFByb3BvZ2F0ZXMgdGhlIGlucHV0IHZhbHVlIGJhY2sgdG8gdGhlIEFuZ3VsYXIgbW9kZWwgYnkgdHJpZ2dlcmluZyB0aGUgb25DaGFuZ2UgZnVuY3Rpb24uIEl0IHdvbid0IGRvIHRoaXMgaWYgd3JpdGluZ1ZhbHVlXG4gICAqIGlzIHRydWUuIElmIHRoYXQgaXMgdHJ1ZSBpdCBtZWFucyB3ZSBhcmUgY3VycmVudGx5IGluIHRoZSB3cml0ZVZhbHVlIGZ1bmN0aW9uLCB3aGljaCBpcyBzdXBwb3NlZCB0byBvbmx5IHVwZGF0ZSB0aGUgYWN0dWFsXG4gICAqIERPTSBlbGVtZW50IGJhc2VkIG9uIHRoZSBBbmd1bGFyIG1vZGVsIHZhbHVlLiBJdCBzaG91bGQgYmUgYSBvbmUgd2F5IHByb2Nlc3MsIGkuZS4gd3JpdGVWYWx1ZSBzaG91bGQgbm90IGJlIG1vZGlmeWluZyB0aGUgQW5ndWxhclxuICAgKiBtb2RlbCB2YWx1ZSB0b28uIFRoZXJlZm9yZSwgd2UgZG9uJ3QgdHJpZ2dlciBvbkNoYW5nZSBpbiB0aGlzIHNjZW5hcmlvLlxuICAgKiBAcGFyYW0gaW5wdXRWYWx1ZSB0aGUgY3VycmVudCBmb3JtIGlucHV0IHZhbHVlXG4gICAqL1xuICBwcml2YXRlIGZvcm1Db250cm9sUmVzdWx0KGlucHV0VmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICh0aGlzLndyaXRpbmdWYWx1ZSB8fCB0aGlzLm1hc2tDaGFuZ2VkKSB7XG4gICAgICB0aGlzLm1hc2tDaGFuZ2VkID0gZmFsc2U7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChBcnJheS5pc0FycmF5KHRoaXMuZHJvcFNwZWNpYWxDaGFyYWN0ZXJzKSkge1xuICAgICAgdGhpcy5vbkNoYW5nZShcbiAgICAgICAgdGhpcy5fdG9OdW1iZXIodGhpcy5fcmVtb3ZlTWFzayh0aGlzLl9yZW1vdmVTdWZmaXgodGhpcy5fcmVtb3ZlUHJlZml4KGlucHV0VmFsdWUpKSwgdGhpcy5kcm9wU3BlY2lhbENoYXJhY3RlcnMpKVxuICAgICAgKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuZHJvcFNwZWNpYWxDaGFyYWN0ZXJzKSB7XG4gICAgICB0aGlzLm9uQ2hhbmdlKHRoaXMuX3RvTnVtYmVyKHRoaXMuX2NoZWNrU3ltYm9scyhpbnB1dFZhbHVlKSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm9uQ2hhbmdlKHRoaXMuX3JlbW92ZVN1ZmZpeChpbnB1dFZhbHVlKSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfdG9OdW1iZXIodmFsdWU6IHN0cmluZyB8IG51bWJlciB8IHVuZGVmaW5lZCB8IG51bGwpIHtcbiAgICBpZiAoIXRoaXMuaXNOdW1iZXJWYWx1ZSB8fCB2YWx1ZSA9PT0gJycpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gICAgY29uc3QgbnVtID0gTnVtYmVyKHZhbHVlKTtcbiAgICByZXR1cm4gTnVtYmVyLmlzTmFOKG51bSkgPyB2YWx1ZSA6IG51bTtcbiAgfVxuXG4gIHByaXZhdGUgX3JlbW92ZU1hc2sodmFsdWU6IHN0cmluZywgc3BlY2lhbENoYXJhY3RlcnNGb3JSZW1vdmU6IHN0cmluZ1tdKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdmFsdWUgPyB2YWx1ZS5yZXBsYWNlKHRoaXMuX3JlZ0V4cEZvclJlbW92ZShzcGVjaWFsQ2hhcmFjdGVyc0ZvclJlbW92ZSksICcnKSA6IHZhbHVlO1xuICB9XG5cbiAgcHJpdmF0ZSBfcmVtb3ZlUHJlZml4KHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICghdGhpcy5wcmVmaXgpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlID8gdmFsdWUucmVwbGFjZSh0aGlzLnByZWZpeCwgJycpIDogdmFsdWU7XG4gIH1cblxuICBwcml2YXRlIF9yZW1vdmVTdWZmaXgodmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKCF0aGlzLnN1ZmZpeCkge1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWUgPyB2YWx1ZS5yZXBsYWNlKHRoaXMuc3VmZml4LCAnJykgOiB2YWx1ZTtcbiAgfVxuXG4gIHByaXZhdGUgX3JldHJpZXZlU2VwYXJhdG9yVmFsdWUocmVzdWx0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9yZW1vdmVNYXNrKHRoaXMuX3JlbW92ZVN1ZmZpeCh0aGlzLl9yZW1vdmVQcmVmaXgocmVzdWx0KSksIHRoaXMubWFza1NwZWNpYWxDaGFyYWN0ZXJzKTtcbiAgfVxuXG4gIHByaXZhdGUgX3JlZ0V4cEZvclJlbW92ZShzcGVjaWFsQ2hhcmFjdGVyc0ZvclJlbW92ZTogc3RyaW5nW10pOiBSZWdFeHAge1xuICAgIHJldHVybiBuZXcgUmVnRXhwKHNwZWNpYWxDaGFyYWN0ZXJzRm9yUmVtb3ZlLm1hcCgoaXRlbTogc3RyaW5nKSA9PiBgXFxcXCR7aXRlbX1gKS5qb2luKCd8JyksICdnaScpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY2hlY2tTeW1ib2xzKHJlc3VsdDogc3RyaW5nKTogc3RyaW5nIHwgbnVtYmVyIHwgdW5kZWZpbmVkIHwgbnVsbCB7XG4gICAgaWYgKHJlc3VsdCA9PT0gJycpIHtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgY29uc3Qgc2VwYXJhdG9yUHJlY2lzaW9uOiBudW1iZXIgfCBudWxsID0gdGhpcy5fcmV0cmlldmVTZXBhcmF0b3JQcmVjaXNpb24odGhpcy5tYXNrRXhwcmVzc2lvbik7XG4gICAgbGV0IHNlcGFyYXRvclZhbHVlOiBzdHJpbmcgPSB0aGlzLl9yZXRyaWV2ZVNlcGFyYXRvclZhbHVlKHJlc3VsdCk7XG4gICAgaWYgKHRoaXMuZGVjaW1hbE1hcmtlciAhPT0gJy4nKSB7XG4gICAgICBzZXBhcmF0b3JWYWx1ZSA9IHNlcGFyYXRvclZhbHVlLnJlcGxhY2UodGhpcy5kZWNpbWFsTWFya2VyLCAnLicpO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5pc051bWJlclZhbHVlKSB7XG4gICAgICByZXR1cm4gc2VwYXJhdG9yVmFsdWU7XG4gICAgfVxuICAgIGlmIChzZXBhcmF0b3JQcmVjaXNpb24pIHtcbiAgICAgIGlmIChyZXN1bHQgPT09IHRoaXMuZGVjaW1hbE1hcmtlcikge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLl9jaGVja1ByZWNpc2lvbih0aGlzLm1hc2tFeHByZXNzaW9uLCBzZXBhcmF0b3JWYWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBOdW1iZXIoc2VwYXJhdG9yVmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIC8vIFRPRE8gc2hvdWxkIHRoaW5rIGFib3V0IGhlbHBlcnMgb3Igc2VwYXJ0aW5nIGRlY2ltYWwgcHJlY2lzaW9uIHRvIG93biBwcm9wZXJ0eVxuICBwcml2YXRlIF9yZXRyaWV2ZVNlcGFyYXRvclByZWNpc2lvbihtYXNrRXhwcmV0aW9uOiBzdHJpbmcpOiBudW1iZXIgfCBudWxsIHtcbiAgICBjb25zdCBtYXRjaGVyOiBSZWdFeHBNYXRjaEFycmF5IHwgbnVsbCA9IG1hc2tFeHByZXRpb24ubWF0Y2gobmV3IFJlZ0V4cChgXnNlcGFyYXRvclxcXFwuKFteZF0qKWApKTtcbiAgICByZXR1cm4gbWF0Y2hlciA/IE51bWJlcihtYXRjaGVyWzFdKSA6IG51bGw7XG4gIH1cblxuICBwcml2YXRlIF9jaGVja1ByZWNpc2lvbihzZXBhcmF0b3JFeHByZXNzaW9uOiBzdHJpbmcsIHNlcGFyYXRvclZhbHVlOiBzdHJpbmcpOiBudW1iZXIgfCBzdHJpbmcge1xuICAgIGlmIChzZXBhcmF0b3JFeHByZXNzaW9uLmluZGV4T2YoJzInKSA+IDApIHtcbiAgICAgIHJldHVybiBOdW1iZXIoc2VwYXJhdG9yVmFsdWUpLnRvRml4ZWQoMik7XG4gICAgfVxuICAgIHJldHVybiBOdW1iZXIoc2VwYXJhdG9yVmFsdWUpO1xuICB9XG59XG4iXX0=