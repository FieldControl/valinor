import { __awaiter } from "tslib";
import { NG_VALIDATORS, NG_VALUE_ACCESSOR, } from '@angular/forms';
import { Directive, forwardRef, HostListener, Inject, Input } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { config, timeMasks, withoutValidation } from './config';
import { MaskService } from './mask.service';
// tslint:disable deprecation
// tslint:disable no-input-rename
export class MaskDirective {
    constructor(document, _maskService, _config) {
        this.document = document;
        this._maskService = _maskService;
        this._config = _config;
        this.maskExpression = '';
        this.specialCharacters = [];
        this.patterns = {};
        this.prefix = '';
        this.suffix = '';
        this.thousandSeparator = ' ';
        this.decimalMarker = '.';
        this.dropSpecialCharacters = null;
        this.hiddenInput = null;
        this.showMaskTyped = null;
        this.placeHolderCharacter = null;
        this.shownMaskExpression = null;
        this.showTemplate = null;
        this.clearIfNotMatch = null;
        this.validation = null;
        this.separatorLimit = null;
        this.allowNegativeNumbers = null;
        this.leadZeroDateTime = null;
        this._maskValue = '';
        this._position = null;
        this._maskExpressionArray = [];
        this._justPasted = false;
        this.onChange = (_) => { };
        this.onTouch = () => { };
    }
    ngOnChanges(changes) {
        const { maskExpression, specialCharacters, patterns, prefix, suffix, thousandSeparator, decimalMarker, dropSpecialCharacters, hiddenInput, showMaskTyped, placeHolderCharacter, shownMaskExpression, showTemplate, clearIfNotMatch, validation, separatorLimit, allowNegativeNumbers, leadZeroDateTime, } = changes;
        if (maskExpression) {
            if (maskExpression.currentValue !== maskExpression.previousValue && !maskExpression.firstChange) {
                this._maskService.maskChanged = true;
            }
            this._maskValue = maskExpression.currentValue || '';
            if (maskExpression.currentValue && maskExpression.currentValue.split('||').length > 1) {
                this._maskExpressionArray = maskExpression.currentValue.split('||').sort((a, b) => {
                    return a.length - b.length;
                });
                this._maskValue = this._maskExpressionArray[0];
                this.maskExpression = this._maskExpressionArray[0];
                this._maskService.maskExpression = this._maskExpressionArray[0];
            }
        }
        if (specialCharacters) {
            if (!specialCharacters.currentValue || !Array.isArray(specialCharacters.currentValue)) {
                return;
            }
            else {
                this._maskService.maskSpecialCharacters = specialCharacters.currentValue || [];
            }
        }
        // Only overwrite the mask available patterns if a pattern has actually been passed in
        if (patterns && patterns.currentValue) {
            this._maskService.maskAvailablePatterns = patterns.currentValue;
        }
        if (prefix) {
            this._maskService.prefix = prefix.currentValue;
        }
        if (suffix) {
            this._maskService.suffix = suffix.currentValue;
        }
        if (thousandSeparator) {
            this._maskService.thousandSeparator = thousandSeparator.currentValue;
        }
        if (decimalMarker) {
            this._maskService.decimalMarker = decimalMarker.currentValue;
        }
        if (dropSpecialCharacters) {
            this._maskService.dropSpecialCharacters = dropSpecialCharacters.currentValue;
        }
        if (hiddenInput) {
            this._maskService.hiddenInput = hiddenInput.currentValue;
        }
        if (showMaskTyped) {
            this._maskService.showMaskTyped = showMaskTyped.currentValue;
        }
        if (placeHolderCharacter) {
            this._maskService.placeHolderCharacter = placeHolderCharacter.currentValue;
        }
        if (shownMaskExpression) {
            this._maskService.shownMaskExpression = shownMaskExpression.currentValue;
        }
        if (showTemplate) {
            this._maskService.showTemplate = showTemplate.currentValue;
        }
        if (clearIfNotMatch) {
            this._maskService.clearIfNotMatch = clearIfNotMatch.currentValue;
        }
        if (validation) {
            this._maskService.validation = validation.currentValue;
        }
        if (separatorLimit) {
            this._maskService.separatorLimit = separatorLimit.currentValue;
        }
        if (allowNegativeNumbers) {
            this._maskService.allowNegativeNumbers = allowNegativeNumbers.currentValue;
            if (this._maskService.allowNegativeNumbers) {
                this._maskService.maskSpecialCharacters = this._maskService.maskSpecialCharacters.filter((c) => c !== '-');
            }
        }
        if (leadZeroDateTime) {
            this._maskService.leadZeroDateTime = leadZeroDateTime.currentValue;
        }
        this._applyMask();
    }
    // tslint:disable-next-line: cyclomatic-complexity
    validate({ value }) {
        if (!this._maskService.validation || !this._maskValue) {
            return null;
        }
        if (this._maskService.ipError) {
            return this._createValidationError(value);
        }
        if (this._maskService.cpfCnpjError) {
            return this._createValidationError(value);
        }
        if (this._maskValue.startsWith('separator')) {
            return null;
        }
        if (withoutValidation.includes(this._maskValue)) {
            return null;
        }
        if (this._maskService.clearIfNotMatch) {
            return null;
        }
        if (timeMasks.includes(this._maskValue)) {
            return this._validateTime(value);
        }
        if (value && value.toString().length >= 1) {
            let counterOfOpt = 0;
            for (const key in this._maskService.maskAvailablePatterns) {
                if (this._maskService.maskAvailablePatterns[key].optional &&
                    this._maskService.maskAvailablePatterns[key].optional === true) {
                    if (this._maskValue.indexOf(key) !== this._maskValue.lastIndexOf(key)) {
                        const opt = this._maskValue
                            .split('')
                            .filter((i) => i === key)
                            .join('');
                        counterOfOpt += opt.length;
                    }
                    else if (this._maskValue.indexOf(key) !== -1) {
                        counterOfOpt++;
                    }
                    if (this._maskValue.indexOf(key) !== -1 && value.toString().length >= this._maskValue.indexOf(key)) {
                        return null;
                    }
                    if (counterOfOpt === this._maskValue.length) {
                        return null;
                    }
                }
            }
            if (this._maskValue.indexOf('{') === 1 &&
                value.toString().length === this._maskValue.length + Number(this._maskValue.split('{')[1].split('}')[0]) - 4) {
                return null;
            }
            if (this._maskValue.indexOf('*') === 1 || this._maskValue.indexOf('?') === 1) {
                return null;
            }
            else if ((this._maskValue.indexOf('*') > 1 && value.toString().length < this._maskValue.indexOf('*')) ||
                (this._maskValue.indexOf('?') > 1 && value.toString().length < this._maskValue.indexOf('?')) ||
                this._maskValue.indexOf('{') === 1) {
                return this._createValidationError(value);
            }
            if (this._maskValue.indexOf('*') === -1 || this._maskValue.indexOf('?') === -1) {
                const length = this._maskService.dropSpecialCharacters
                    ? this._maskValue.length - this._maskService.checkSpecialCharAmount(this._maskValue) - counterOfOpt
                    : this._maskValue.length - counterOfOpt;
                if (value.toString().length < length) {
                    return this._createValidationError(value);
                }
            }
        }
        return null;
    }
    onPaste() {
        this._justPasted = true;
    }
    onInput(e) {
        const el = e.target;
        this._inputValue = el.value;
        this._setMask();
        if (!this._maskValue) {
            this.onChange(el.value);
            return;
        }
        const position = el.selectionStart === 1
            ? el.selectionStart + this._maskService.prefix.length
            : el.selectionStart;
        let caretShift = 0;
        let backspaceShift = false;
        this._maskService.applyValueChanges(position, this._justPasted, this._code === 'Backspace' || this._code === 'Delete', (shift, _backspaceShift) => {
            this._justPasted = false;
            caretShift = shift;
            backspaceShift = _backspaceShift;
        });
        // only set the selection if the element is active
        if (this.document.activeElement !== el) {
            return;
        }
        this._position = this._position === 1 && this._inputValue.length === 1 ? null : this._position;
        let positionToApply = this._position
            ? this._inputValue.length + position + caretShift
            : position + (this._code === 'Backspace' && !backspaceShift ? 0 : caretShift);
        if (positionToApply > this._getActualInputLength()) {
            positionToApply = this._getActualInputLength();
        }
        if (positionToApply < 0) {
            positionToApply = 0;
        }
        el.setSelectionRange(positionToApply, positionToApply);
        this._position = null;
    }
    onBlur() {
        if (this._maskValue) {
            this._maskService.clearIfNotMatchFn();
        }
        this.onTouch();
    }
    onFocus(e) {
        if (!this._maskValue) {
            return;
        }
        const el = e.target;
        const posStart = 0;
        const posEnd = 0;
        if (el !== null &&
            el.selectionStart !== null &&
            el.selectionStart === el.selectionEnd &&
            el.selectionStart > this._maskService.prefix.length &&
            // tslint:disable-next-line
            e.keyCode !== 38) {
            if (this._maskService.showMaskTyped) {
                // We are showing the mask in the input
                this._maskService.maskIsShown = this._maskService.showMaskInInput();
                if (el.setSelectionRange && this._maskService.prefix + this._maskService.maskIsShown === el.value) {
                    // the input ONLY contains the mask, so position the cursor at the start
                    el.focus();
                    el.setSelectionRange(posStart, posEnd);
                }
                else {
                    // the input contains some characters already
                    if (el.selectionStart > this._maskService.actualValue.length) {
                        // if the user clicked beyond our value's length, position the cursor at the end of our value
                        el.setSelectionRange(this._maskService.actualValue.length, this._maskService.actualValue.length);
                    }
                }
            }
        }
        const nextValue = !el.value || el.value === this._maskService.prefix
            ? this._maskService.prefix + this._maskService.maskIsShown
            : el.value;
        /** Fix of cursor position jumping to end in most browsers no matter where cursor is inserted onFocus */
        if (el.value !== nextValue) {
            el.value = nextValue;
        }
        /** fix of cursor position with prefix when mouse click occur */
        if ((el.selectionStart || el.selectionEnd) <= this._maskService.prefix.length) {
            el.selectionStart = this._maskService.prefix.length;
            return;
        }
        /** select only inserted text */
        if (el.selectionEnd > this._getActualInputLength()) {
            el.selectionEnd = this._getActualInputLength();
        }
    }
    // tslint:disable-next-line: cyclomatic-complexity
    onKeyDown(e) {
        var _a;
        if (!this._maskValue) {
            return;
        }
        this._code = e.code ? e.code : e.key;
        const el = e.target;
        this._inputValue = el.value;
        this._setMask();
        if (e.keyCode === 38) {
            e.preventDefault();
        }
        if (e.keyCode === 37 || e.keyCode === 8 || e.keyCode === 46) {
            if (e.keyCode === 8 && el.value.length === 0) {
                el.selectionStart = el.selectionEnd;
            }
            if (e.keyCode === 8 && el.selectionStart !== 0) {
                // If specialChars is false, (shouldn't ever happen) then set to the defaults
                this.specialCharacters = ((_a = this.specialCharacters) === null || _a === void 0 ? void 0 : _a.length)
                    ? this.specialCharacters
                    : this._config.specialCharacters;
                if (this.prefix.length > 1 && el.selectionStart <= this.prefix.length) {
                    el.setSelectionRange(this.prefix.length, this.prefix.length);
                }
                else {
                    if (this._inputValue.length !== el.selectionStart && el.selectionStart !== 1) {
                        while (this.specialCharacters.includes(this._inputValue[el.selectionStart - 1].toString()) &&
                            ((this.prefix.length >= 1 && el.selectionStart > this.prefix.length) ||
                                this.prefix.length === 0)) {
                            el.setSelectionRange(el.selectionStart - 1, el.selectionStart - 1);
                        }
                    }
                    this.suffixCheckOnPressDelete(e.keyCode, el);
                }
            }
            this.suffixCheckOnPressDelete(e.keyCode, el);
            if (this._maskService.prefix.length &&
                el.selectionStart <= this._maskService.prefix.length &&
                el.selectionEnd <= this._maskService.prefix.length) {
                e.preventDefault();
            }
            const cursorStart = el.selectionStart;
            // this.onFocus(e);
            if (e.keyCode === 8 &&
                !el.readOnly &&
                cursorStart === 0 &&
                el.selectionEnd === el.value.length &&
                el.value.length !== 0) {
                this._position = this._maskService.prefix ? this._maskService.prefix.length : 0;
                this._maskService.applyMask(this._maskService.prefix, this._maskService.maskExpression, this._position);
            }
        }
        if (!!this.suffix &&
            this.suffix.length > 1 &&
            this._inputValue.length - this.suffix.length < el.selectionStart) {
            el.setSelectionRange(this._inputValue.length - this.suffix.length, this._inputValue.length);
        }
        else if ((e.keyCode === 65 && e.ctrlKey === true) || // Ctrl+ A
            (e.keyCode === 65 && e.metaKey === true) // Cmd + A (Mac)
        ) {
            el.setSelectionRange(0, this._getActualInputLength());
            e.preventDefault();
        }
        this._maskService.selStart = el.selectionStart;
        this._maskService.selEnd = el.selectionEnd;
    }
    /** It writes the value in the input */
    writeValue(inputValue) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof inputValue === 'object' && inputValue !== null && 'value' in inputValue) {
                if ('disable' in inputValue) {
                    this.setDisabledState(Boolean(inputValue.disable));
                }
                inputValue = inputValue.value;
            }
            if (inputValue === undefined) {
                inputValue = '';
            }
            if (typeof inputValue === 'number') {
                inputValue = String(inputValue);
                inputValue = this.decimalMarker !== '.' ? inputValue.replace('.', this.decimalMarker) : inputValue;
                this._maskService.isNumberValue = true;
            }
            this._inputValue = inputValue;
            this._setMask();
            if ((inputValue && this._maskService.maskExpression) ||
                (this._maskService.maskExpression && (this._maskService.prefix || this._maskService.showMaskTyped))) {
                // Let the service we know we are writing value so that triggering onChange function wont happen during applyMask
                this._maskService.writingValue = true;
                this._maskService.formElementProperty = [
                    'value',
                    this._maskService.applyMask(inputValue, this._maskService.maskExpression),
                ];
                // Let the service know we've finished writing value
                this._maskService.writingValue = false;
            }
            else {
                this._maskService.formElementProperty = ['value', inputValue];
            }
            this._inputValue = inputValue;
        });
    }
    registerOnChange(fn) {
        this.onChange = fn;
        this._maskService.onChange = this.onChange;
    }
    registerOnTouched(fn) {
        this.onTouch = fn;
    }
    suffixCheckOnPressDelete(keyCode, el) {
        if (keyCode === 46 && this.suffix.length > 0) {
            if (this._inputValue.length - this.suffix.length <= el.selectionStart) {
                el.setSelectionRange(this._inputValue.length - this.suffix.length, this._inputValue.length);
            }
        }
        if (keyCode === 8) {
            if (this.suffix.length > 1 && this._inputValue.length - this.suffix.length < el.selectionStart) {
                el.setSelectionRange(this._inputValue.length - this.suffix.length, this._inputValue.length);
            }
            if (this.suffix.length === 1 && this._inputValue.length === el.selectionStart) {
                el.setSelectionRange(el.selectionStart - 1, el.selectionStart - 1);
            }
        }
    }
    /** It disables the input element */
    setDisabledState(isDisabled) {
        this._maskService.formElementProperty = ['disabled', isDisabled];
    }
    _repeatPatternSymbols(maskExp) {
        return ((maskExp.match(/{[0-9]+}/) &&
            maskExp.split('').reduce((accum, currval, index) => {
                this._start = currval === '{' ? index : this._start;
                if (currval !== '}') {
                    return this._maskService._findSpecialChar(currval) ? accum + currval : accum;
                }
                this._end = index;
                const repeatNumber = Number(maskExp.slice(this._start + 1, this._end));
                const replaceWith = new Array(repeatNumber + 1).join(maskExp[this._start - 1]);
                return accum + replaceWith;
            }, '')) ||
            maskExp);
    }
    // tslint:disable-next-line:no-any
    _applyMask() {
        this._maskService.maskExpression = this._repeatPatternSymbols(this._maskValue || '');
        this._maskService.formElementProperty = [
            'value',
            this._maskService.applyMask(this._inputValue, this._maskService.maskExpression),
        ];
    }
    _validateTime(value) {
        const rowMaskLen = this._maskValue.split('').filter((s) => s !== ':').length;
        if (!value) {
            return null; // Don't validate empty values to allow for optional form control
        }
        if ((+value[value.length - 1] === 0 && value.length < rowMaskLen) || value.length <= rowMaskLen - 2) {
            return this._createValidationError(value);
        }
        return null;
    }
    _getActualInputLength() {
        return (this._maskService.actualValue.length || this._maskService.actualValue.length + this._maskService.prefix.length);
    }
    _createValidationError(actualValue) {
        return {
            mask: {
                requiredMask: this._maskValue,
                actualValue,
            },
        };
    }
    _setMask() {
        if (this._maskExpressionArray.length > 0) {
            this._maskExpressionArray.some((mask) => {
                var _a, _b;
                const test = ((_a = this._maskService.removeMask(this._inputValue)) === null || _a === void 0 ? void 0 : _a.length) <= ((_b = this._maskService.removeMask(mask)) === null || _b === void 0 ? void 0 : _b.length);
                if (this._inputValue && test) {
                    this._maskValue = mask;
                    this.maskExpression = mask;
                    this._maskService.maskExpression = mask;
                    return test;
                }
                else {
                    this._maskValue = this._maskExpressionArray[this._maskExpressionArray.length - 1];
                    this.maskExpression = this._maskExpressionArray[this._maskExpressionArray.length - 1];
                    this._maskService.maskExpression = this._maskExpressionArray[this._maskExpressionArray.length - 1];
                }
            });
        }
    }
}
MaskDirective.decorators = [
    { type: Directive, args: [{
                selector: 'input[mask], textarea[mask]',
                providers: [
                    {
                        provide: NG_VALUE_ACCESSOR,
                        useExisting: forwardRef(() => MaskDirective),
                        multi: true,
                    },
                    {
                        provide: NG_VALIDATORS,
                        useExisting: forwardRef(() => MaskDirective),
                        multi: true,
                    },
                    MaskService,
                ],
            },] }
];
MaskDirective.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] },
    { type: MaskService },
    { type: undefined, decorators: [{ type: Inject, args: [config,] }] }
];
MaskDirective.propDecorators = {
    maskExpression: [{ type: Input, args: ['mask',] }],
    specialCharacters: [{ type: Input }],
    patterns: [{ type: Input }],
    prefix: [{ type: Input }],
    suffix: [{ type: Input }],
    thousandSeparator: [{ type: Input }],
    decimalMarker: [{ type: Input }],
    dropSpecialCharacters: [{ type: Input }],
    hiddenInput: [{ type: Input }],
    showMaskTyped: [{ type: Input }],
    placeHolderCharacter: [{ type: Input }],
    shownMaskExpression: [{ type: Input }],
    showTemplate: [{ type: Input }],
    clearIfNotMatch: [{ type: Input }],
    validation: [{ type: Input }],
    separatorLimit: [{ type: Input }],
    allowNegativeNumbers: [{ type: Input }],
    leadZeroDateTime: [{ type: Input }],
    onPaste: [{ type: HostListener, args: ['paste',] }],
    onInput: [{ type: HostListener, args: ['input', ['$event'],] }],
    onBlur: [{ type: HostListener, args: ['blur',] }],
    onFocus: [{ type: HostListener, args: ['click', ['$event'],] }],
    onKeyDown: [{ type: HostListener, args: ['keydown', ['$event'],] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFzay5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtbWFzay1saWIvc3JjL2xpYi9tYXNrLmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUdMLGFBQWEsRUFDYixpQkFBaUIsR0FHbEIsTUFBTSxnQkFBZ0IsQ0FBQztBQUN4QixPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBNEIsTUFBTSxlQUFlLENBQUM7QUFDN0csT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBRzNDLE9BQU8sRUFBRSxNQUFNLEVBQVcsU0FBUyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQ3pFLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUU3Qyw2QkFBNkI7QUFDN0IsaUNBQWlDO0FBaUJqQyxNQUFNLE9BQU8sYUFBYTtJQTRCeEIsWUFDNEIsUUFBYSxFQUMvQixZQUF5QixFQUNQLE9BQWdCO1FBRmhCLGFBQVEsR0FBUixRQUFRLENBQUs7UUFDL0IsaUJBQVksR0FBWixZQUFZLENBQWE7UUFDUCxZQUFPLEdBQVAsT0FBTyxDQUFTO1FBOUJ0QixtQkFBYyxHQUFXLEVBQUUsQ0FBQztRQUNsQyxzQkFBaUIsR0FBaUMsRUFBRSxDQUFDO1FBQ3JELGFBQVEsR0FBd0IsRUFBRSxDQUFDO1FBQ25DLFdBQU0sR0FBc0IsRUFBRSxDQUFDO1FBQy9CLFdBQU0sR0FBc0IsRUFBRSxDQUFDO1FBQy9CLHNCQUFpQixHQUFpQyxHQUFHLENBQUM7UUFDdEQsa0JBQWEsR0FBNkIsR0FBRyxDQUFDO1FBQzlDLDBCQUFxQixHQUE0QyxJQUFJLENBQUM7UUFDdEUsZ0JBQVcsR0FBa0MsSUFBSSxDQUFDO1FBQ2xELGtCQUFhLEdBQW9DLElBQUksQ0FBQztRQUN0RCx5QkFBb0Is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Q0wsS0FBSztzQkErTEwsWUFBWSxTQUFDLE9BQU87c0JBS3BCLFlBQVksU0FBQyxPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUM7cUJBNkNoQyxZQUFZLFNBQUMsTUFBTTtzQkFRbkIsWUFBWSxTQUFDLE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQzt3QkF1RGhDLFlBQVksU0FBQyxTQUFTLEVBQUUsQ0FBQyxRQUFRLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBDb250cm9sVmFsdWVBY2Nlc3NvcixcbiAgRm9ybUNvbnRyb2wsXG4gIE5HX1ZBTElEQVRPUlMsXG4gIE5HX1ZBTFVFX0FDQ0VTU09SLFxuICBWYWxpZGF0aW9uRXJyb3JzLFxuICBWYWxpZGF0b3IsXG59IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7IERpcmVjdGl2ZSwgZm9yd2FyZFJlZiwgSG9zdExpc3RlbmVyLCBJbmplY3QsIElucHV0LCBPbkNoYW5nZXMsIFNpbXBsZUNoYW5nZXMgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IERPQ1VNRU5UIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcblxuaW1wb3J0IHsgQ3VzdG9tS2V5Ym9hcmRFdmVudCB9IGZyb20gJy4vY3VzdG9tLWtleWJvYXJkLWV2ZW50JztcbmltcG9ydCB7IGNvbmZpZywgSUNvbmZpZywgdGltZU1hc2tzLCB3aXRob3V0VmFsaWRhdGlvbiB9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7IE1hc2tTZXJ2aWNlIH0gZnJvbSAnLi9tYXNrLnNlcnZpY2UnO1xuXG4vLyB0c2xpbnQ6ZGlzYWJsZSBkZXByZWNhdGlvblxuLy8gdHNsaW50OmRpc2FibGUgbm8taW5wdXQtcmVuYW1lXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdpbnB1dFttYXNrXSwgdGV4dGFyZWFbbWFza10nLFxuICBwcm92aWRlcnM6IFtcbiAgICB7XG4gICAgICBwcm92aWRlOiBOR19WQUxVRV9BQ0NFU1NPUixcbiAgICAgIHVzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IE1hc2tEaXJlY3RpdmUpLFxuICAgICAgbXVsdGk6IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBwcm92aWRlOiBOR19WQUxJREFUT1JTLFxuICAgICAgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gTWFza0RpcmVjdGl2ZSksXG4gICAgICBtdWx0aTogdHJ1ZSxcbiAgICB9LFxuICAgIE1hc2tTZXJ2aWNlLFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBNYXNrRGlyZWN0aXZlIGltcGxlbWVudHMgQ29udHJvbFZhbHVlQWNjZXNzb3IsIE9uQ2hhbmdlcywgVmFsaWRhdG9yIHtcbiAgQElucHV0KCdtYXNrJykgcHVibGljIG1hc2tFeHByZXNzaW9uOiBzdHJpbmcgPSAnJztcbiAgQElucHV0KCkgcHVibGljIHNwZWNpYWxDaGFyYWN0ZXJzOiBJQ29uZmlnWydzcGVjaWFsQ2hhcmFjdGVycyddID0gW107XG4gIEBJbnB1dCgpIHB1YmxpYyBwYXR0ZXJuczogSUNvbmZpZ1sncGF0dGVybnMnXSA9IHt9O1xuICBASW5wdXQoKSBwdWJsaWMgcHJlZml4OiBJQ29uZmlnWydwcmVmaXgnXSA9ICcnO1xuICBASW5wdXQoKSBwdWJsaWMgc3VmZml4OiBJQ29uZmlnWydzdWZmaXgnXSA9ICcnO1xuICBASW5wdXQoKSBwdWJsaWMgdGhvdXNhbmRTZXBhcmF0b3I6IElDb25maWdbJ3Rob3VzYW5kU2VwYXJhdG9yJ10gPSAnICc7XG4gIEBJbnB1dCgpIHB1YmxpYyBkZWNpbWFsTWFya2VyOiBJQ29uZmlnWydkZWNpbWFsTWFya2VyJ10gPSAnLic7XG4gIEBJbnB1dCgpIHB1YmxpYyBkcm9wU3BlY2lhbENoYXJhY3RlcnM6IElDb25maWdbJ2Ryb3BTcGVjaWFsQ2hhcmFjdGVycyddIHwgbnVsbCA9IG51bGw7XG4gIEBJbnB1dCgpIHB1YmxpYyBoaWRkZW5JbnB1dDogSUNvbmZpZ1snaGlkZGVuSW5wdXQnXSB8IG51bGwgPSBudWxsO1xuICBASW5wdXQoKSBwdWJsaWMgc2hvd01hc2tUeXBlZDogSUNvbmZpZ1snc2hvd01hc2tUeXBlZCddIHwgbnVsbCA9IG51bGw7XG4gIEBJbnB1dCgpIHB1YmxpYyBwbGFjZUhvbGRlckNoYXJhY3RlcjogSUNvbmZpZ1sncGxhY2VIb2xkZXJDaGFyYWN0ZXInXSB8IG51bGwgPSBudWxsO1xuICBASW5wdXQoKSBwdWJsaWMgc2hvd25NYXNrRXhwcmVzc2lvbjogSUNvbmZpZ1snc2hvd25NYXNrRXhwcmVzc2lvbiddIHwgbnVsbCA9IG51bGw7XG4gIEBJbnB1dCgpIHB1YmxpYyBzaG93VGVtcGxhdGU6IElDb25maWdbJ3Nob3dUZW1wbGF0ZSddIHwgbnVsbCA9IG51bGw7XG4gIEBJbnB1dCgpIHB1YmxpYyBjbGVhcklmTm90TWF0Y2g6IElDb25maWdbJ2NsZWFySWZOb3RNYXRjaCddIHwgbnVsbCA9IG51bGw7XG4gIEBJbnB1dCgpIHB1YmxpYyB2YWxpZGF0aW9uOiBJQ29uZmlnWyd2YWxpZGF0aW9uJ10gfCBudWxsID0gbnVsbDtcbiAgQElucHV0KCkgcHVibGljIHNlcGFyYXRvckxpbWl0OiBJQ29uZmlnWydzZXBhcmF0b3JMaW1pdCddIHwgbnVsbCA9IG51bGw7XG4gIEBJbnB1dCgpIHB1YmxpYyBhbGxvd05lZ2F0aXZlTnVtYmVyczogSUNvbmZpZ1snYWxsb3dOZWdhdGl2ZU51bWJlcnMnXSB8IG51bGwgPSBudWxsO1xuICBASW5wdXQoKSBwdWJsaWMgbGVhZFplcm9EYXRlVGltZTogSUNvbmZpZ1snbGVhZFplcm9EYXRlVGltZSddIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX21hc2tWYWx1ZTogc3RyaW5nID0gJyc7XG4gIHByaXZhdGUgX2lucHV0VmFsdWUhOiBzdHJpbmc7XG4gIHByaXZhdGUgX3Bvc2l0aW9uOiBudW1iZXIgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfc3RhcnQhOiBudW1iZXI7XG4gIHByaXZhdGUgX2VuZCE6IG51bWJlcjtcbiAgcHJpdmF0ZSBfY29kZSE6IHN0cmluZztcbiAgcHJpdmF0ZSBfbWFza0V4cHJlc3Npb25BcnJheTogc3RyaW5nW10gPSBbXTtcbiAgcHJpdmF0ZSBfanVzdFBhc3RlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihcbiAgICBASW5qZWN0KERPQ1VNRU5UKSBwcml2YXRlIGRvY3VtZW50OiBhbnksXG4gICAgcHJpdmF0ZSBfbWFza1NlcnZpY2U6IE1hc2tTZXJ2aWNlLFxuICAgIEBJbmplY3QoY29uZmlnKSBwcm90ZWN0ZWQgX2NvbmZpZzogSUNvbmZpZ1xuICApIHt9XG5cbiAgcHVibGljIG9uQ2hhbmdlID0gKF86IGFueSkgPT4ge307XG4gIHB1YmxpYyBvblRvdWNoID0gKCkgPT4ge307XG5cbiAgcHVibGljIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpOiB2b2lkIHtcbiAgICBjb25zdCB7XG4gICAgICBtYXNrRXhwcmVzc2lvbixcbiAgICAgIHNwZWNpYWxDaGFyYWN0ZXJzLFxuICAgICAgcGF0dGVybnMsXG4gICAgICBwcmVmaXgsXG4gICAgICBzdWZmaXgsXG4gICAgICB0aG91c2FuZFNlcGFyYXRvcixcbiAgICAgIGRlY2ltYWxNYXJrZXIsXG4gICAgICBkcm9wU3BlY2lhbENoYXJhY3RlcnMsXG4gICAgICBoaWRkZW5JbnB1dCxcbiAgICAgIHNob3dNYXNrVHlwZWQsXG4gICAgICBwbGFjZUhvbGRlckNoYXJhY3RlcixcbiAgICAgIHNob3duTWFza0V4cHJlc3Npb24sXG4gICAgICBzaG93VGVtcGxhdGUsXG4gICAgICBjbGVhcklmTm90TWF0Y2gsXG4gICAgICB2YWxpZGF0aW9uLFxuICAgICAgc2VwYXJhdG9yTGltaXQsXG4gICAgICBhbGxvd05lZ2F0aXZlTnVtYmVycyxcbiAgICAgIGxlYWRaZXJvRGF0ZVRpbWUsXG4gICAgfSA9IGNoYW5nZXM7XG4gICAgaWYgKG1hc2tFeHByZXNzaW9uKSB7XG4gICAgICBpZiAobWFza0V4cHJlc3Npb24uY3VycmVudFZhbHVlICE9PSBtYXNrRXhwcmVzc2lvbi5wcmV2aW91c1ZhbHVlICYmICFtYXNrRXhwcmVzc2lvbi5maXJzdENoYW5nZSkge1xuICAgICAgICB0aGlzLl9tYXNrU2VydmljZS5tYXNrQ2hhbmdlZCA9IHRydWU7XG4gICAgICB9XG4gICAgICB0aGlzLl9tYXNrVmFsdWUgPSBtYXNrRXhwcmVzc2lvbi5jdXJyZW50VmFsdWUgfHwgJyc7XG4gICAgICBpZiAobWFza0V4cHJlc3Npb24uY3VycmVudFZhbHVlICYmIG1hc2tFeHByZXNzaW9uLmN1cnJlbnRWYWx1ZS5zcGxpdCgnfHwnKS5sZW5ndGggPiAxKSB7XG4gICAgICAgIHRoaXMuX21hc2tFeHByZXNzaW9uQXJyYXkgPSBtYXNrRXhwcmVzc2lvbi5jdXJyZW50VmFsdWUuc3BsaXQoJ3x8Jykuc29ydCgoYTogc3RyaW5nLCBiOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICByZXR1cm4gYS5sZW5ndGggLSBiLmxlbmd0aDtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX21hc2tWYWx1ZSA9IHRoaXMuX21hc2tFeHByZXNzaW9uQXJyYXlbMF07XG4gICAgICAgIHRoaXMubWFza0V4cHJlc3Npb24gPSB0aGlzLl9tYXNrRXhwcmVzc2lvbkFycmF5WzBdO1xuICAgICAgICB0aGlzLl9tYXNrU2VydmljZS5tYXNrRXhwcmVzc2lvbiA9IHRoaXMuX21hc2tFeHByZXNzaW9uQXJyYXlbMF07XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChzcGVjaWFsQ2hhcmFjdGVycykge1xuICAgICAgaWYgKCFzcGVjaWFsQ2hhcmFjdGVycy5jdXJyZW50VmFsdWUgfHwgIUFycmF5LmlzQXJyYXkoc3BlY2lhbENoYXJhY3RlcnMuY3VycmVudFZhbHVlKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9tYXNrU2VydmljZS5tYXNrU3BlY2lhbENoYXJhY3RlcnMgPSBzcGVjaWFsQ2hhcmFjdGVycy5jdXJyZW50VmFsdWUgfHwgW107XG4gICAgICB9XG4gICAgfVxuICAgIC8vIE9ubHkgb3ZlcndyaXRlIHRoZSBtYXNrIGF2YWlsYWJsZSBwYXR0ZXJucyBpZiBhIHBhdHRlcm4gaGFzIGFjdHVhbGx5IGJlZW4gcGFzc2VkIGluXG4gICAgaWYgKHBhdHRlcm5zICYmIHBhdHRlcm5zLmN1cnJlbnRWYWx1ZSkge1xuICAgICAgdGhpcy5fbWFza1NlcnZpY2UubWFza0F2YWlsYWJsZVBhdHRlcm5zID0gcGF0dGVybnMuY3VycmVudFZhbHVlO1xuICAgIH1cbiAgICBpZiAocHJlZml4KSB7XG4gICAgICB0aGlzLl9tYXNrU2VydmljZS5wcmVmaXggPSBwcmVmaXguY3VycmVudFZhbHVlO1xuICAgIH1cbiAgICBpZiAoc3VmZml4KSB7XG4gICAgICB0aGlzLl9tYXNrU2VydmljZS5zdWZmaXggPSBzdWZmaXguY3VycmVudFZhbHVlO1xuICAgIH1cbiAgICBpZiAodGhvdXNhbmRTZXBhcmF0b3IpIHtcbiAgICAgIHRoaXMuX21hc2tTZXJ2aWNlLnRob3VzYW5kU2VwYXJhdG9yID0gdGhvdXNhbmRTZXBhcmF0b3IuY3VycmVudFZhbHVlO1xuICAgIH1cbiAgICBpZiAoZGVjaW1hbE1hcmtlcikge1xuICAgICAgdGhpcy5fbWFza1NlcnZpY2UuZGVjaW1hbE1hcmtlciA9IGRlY2ltYWxNYXJrZXIuY3VycmVudFZhbHVlO1xuICAgIH1cbiAgICBpZiAoZHJvcFNwZWNpYWxDaGFyYWN0ZXJzKSB7XG4gICAgICB0aGlzLl9tYXNrU2VydmljZS5kcm9wU3BlY2lhbENoYXJhY3RlcnMgPSBkcm9wU3BlY2lhbENoYXJhY3RlcnMuY3VycmVudFZhbHVlO1xuICAgIH1cbiAgICBpZiAoaGlkZGVuSW5wdXQpIHtcbiAgICAgIHRoaXMuX21hc2tTZXJ2aWNlLmhpZGRlbklucHV0ID0gaGlkZGVuSW5wdXQuY3VycmVudFZhbHVlO1xuICAgIH1cbiAgICBpZiAoc2hvd01hc2tUeXBlZCkge1xuICAgICAgdGhpcy5fbWFza1NlcnZpY2Uuc2hvd01hc2tUeXBlZCA9IHNob3dNYXNrVHlwZWQuY3VycmVudFZhbHVlO1xuICAgIH1cbiAgICBpZiAocGxhY2VIb2xkZXJDaGFyYWN0ZXIpIHtcbiAgICAgIHRoaXMuX21hc2tTZXJ2aWNlLnBsYWNlSG9sZGVyQ2hhcmFjdGVyID0gcGxhY2VIb2xkZXJDaGFyYWN0ZXIuY3VycmVudFZhbHVlO1xuICAgIH1cbiAgICBpZiAoc2hvd25NYXNrRXhwcmVzc2lvbikge1xuICAgICAgdGhpcy5fbWFza1NlcnZpY2Uuc2hvd25NYXNrRXhwcmVzc2lvbiA9IHNob3duTWFza0V4cHJlc3Npb24uY3VycmVudFZhbHVlO1xuICAgIH1cbiAgICBpZiAoc2hvd1RlbXBsYXRlKSB7XG4gICAgICB0aGlzLl9tYXNrU2VydmljZS5zaG93VGVtcGxhdGUgPSBzaG93VGVtcGxhdGUuY3VycmVudFZhbHVlO1xuICAgIH1cbiAgICBpZiAoY2xlYXJJZk5vdE1hdGNoKSB7XG4gICAgICB0aGlzLl9tYXNrU2VydmljZS5jbGVhcklmTm90TWF0Y2ggPSBjbGVhcklmTm90TWF0Y2guY3VycmVudFZhbHVlO1xuICAgIH1cbiAgICBpZiAodmFsaWRhdGlvbikge1xuICAgICAgdGhpcy5fbWFza1NlcnZpY2UudmFsaWRhdGlvbiA9IHZhbGlkYXRpb24uY3VycmVudFZhbHVlO1xuICAgIH1cbiAgICBpZiAoc2VwYXJhdG9yTGltaXQpIHtcbiAgICAgIHRoaXMuX21hc2tTZXJ2aWNlLnNlcGFyYXRvckxpbWl0ID0gc2VwYXJhdG9yTGltaXQuY3VycmVudFZhbHVlO1xuICAgIH1cbiAgICBpZiAoYWxsb3dOZWdhdGl2ZU51bWJlcnMpIHtcbiAgICAgIHRoaXMuX21hc2tTZXJ2aWNlLmFsbG93TmVnYXRpdmVOdW1iZXJzID0gYWxsb3dOZWdhdGl2ZU51bWJlcnMuY3VycmVudFZhbHVlO1xuICAgICAgaWYgKHRoaXMuX21hc2tTZXJ2aWNlLmFsbG93TmVnYXRpdmVOdW1iZXJzKSB7XG4gICAgICAgIHRoaXMuX21hc2tTZXJ2aWNlLm1hc2tTcGVjaWFsQ2hhcmFjdGVycyA9IHRoaXMuX21hc2tTZXJ2aWNlLm1hc2tTcGVjaWFsQ2hhcmFjdGVycy5maWx0ZXIoXG4gICAgICAgICAgKGM6IHN0cmluZykgPT4gYyAhPT0gJy0nXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChsZWFkWmVyb0RhdGVUaW1lKSB7XG4gICAgICB0aGlzLl9tYXNrU2VydmljZS5sZWFkWmVyb0RhdGVUaW1lID0gbGVhZFplcm9EYXRlVGltZS5jdXJyZW50VmFsdWU7XG4gICAgfVxuICAgIHRoaXMuX2FwcGx5TWFzaygpO1xuICB9XG5cbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOiBjeWNsb21hdGljLWNvbXBsZXhpdHlcbiAgcHVibGljIHZhbGlkYXRlKHsgdmFsdWUgfTogRm9ybUNvbnRyb2wpOiBWYWxpZGF0aW9uRXJyb3JzIHwgbnVsbCB7XG4gICAgaWYgKCF0aGlzLl9tYXNrU2VydmljZS52YWxpZGF0aW9uIHx8ICF0aGlzLl9tYXNrVmFsdWUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAodGhpcy5fbWFza1NlcnZpY2UuaXBFcnJvcikge1xuICAgICAgcmV0dXJuIHRoaXMuX2NyZWF0ZVZhbGlkYXRpb25FcnJvcih2YWx1ZSk7XG4gICAgfVxuICAgIGlmICh0aGlzLl9tYXNrU2VydmljZS5jcGZDbnBqRXJyb3IpIHtcbiAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVWYWxpZGF0aW9uRXJyb3IodmFsdWUpO1xuICAgIH1cbiAgICBpZiAodGhpcy5fbWFza1ZhbHVlLnN0YXJ0c1dpdGgoJ3NlcGFyYXRvcicpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKHdpdGhvdXRWYWxpZGF0aW9uLmluY2x1ZGVzKHRoaXMuX21hc2tWYWx1ZSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAodGhpcy5fbWFza1NlcnZpY2UuY2xlYXJJZk5vdE1hdGNoKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKHRpbWVNYXNrcy5pbmNsdWRlcyh0aGlzLl9tYXNrVmFsdWUpKSB7XG4gICAgICByZXR1cm4gdGhpcy5fdmFsaWRhdGVUaW1lKHZhbHVlKTtcbiAgICB9XG4gICAgaWYgKHZhbHVlICYmIHZhbHVlLnRvU3RyaW5nKCkubGVuZ3RoID49IDEpIHtcbiAgICAgIGxldCBjb3VudGVyT2ZPcHQgPSAwO1xuICAgICAgZm9yIChjb25zdCBrZXkgaW4gdGhpcy5fbWFza1NlcnZpY2UubWFza0F2YWlsYWJsZVBhdHRlcm5zKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICB0aGlzLl9tYXNrU2VydmljZS5tYXNrQXZhaWxhYmxlUGF0dGVybnNba2V5XS5vcHRpb25hbCAmJlxuICAgICAgICAgIHRoaXMuX21hc2tTZXJ2aWNlLm1hc2tBdmFpbGFibGVQYXR0ZXJuc1trZXldLm9wdGlvbmFsID09PSB0cnVlXG4gICAgICAgICkge1xuICAgICAgICAgIGlmICh0aGlzLl9tYXNrVmFsdWUuaW5kZXhPZihrZXkpICE9PSB0aGlzLl9tYXNrVmFsdWUubGFzdEluZGV4T2Yoa2V5KSkge1xuICAgICAgICAgICAgY29uc3Qgb3B0OiBzdHJpbmcgPSB0aGlzLl9tYXNrVmFsdWVcbiAgICAgICAgICAgICAgLnNwbGl0KCcnKVxuICAgICAgICAgICAgICAuZmlsdGVyKChpOiBzdHJpbmcpID0+IGkgPT09IGtleSlcbiAgICAgICAgICAgICAgLmpvaW4oJycpO1xuICAgICAgICAgICAgY291bnRlck9mT3B0ICs9IG9wdC5sZW5ndGg7XG4gICAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9tYXNrVmFsdWUuaW5kZXhPZihrZXkpICE9PSAtMSkge1xuICAgICAgICAgICAgY291bnRlck9mT3B0Kys7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh0aGlzLl9tYXNrVmFsdWUuaW5kZXhPZihrZXkpICE9PSAtMSAmJiB2YWx1ZS50b1N0cmluZygpLmxlbmd0aCA+PSB0aGlzLl9tYXNrVmFsdWUuaW5kZXhPZihrZXkpKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGNvdW50ZXJPZk9wdCA9PT0gdGhpcy5fbWFza1ZhbHVlLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoXG4gICAgICAgIHRoaXMuX21hc2tWYWx1ZS5pbmRleE9mKCd7JykgPT09IDEgJiZcbiAgICAgICAgdmFsdWUudG9TdHJpbmcoKS5sZW5ndGggPT09IHRoaXMuX21hc2tWYWx1ZS5sZW5ndGggKyBOdW1iZXIodGhpcy5fbWFza1ZhbHVlLnNwbGl0KCd7JylbMV0uc3BsaXQoJ30nKVswXSkgLSA0XG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5fbWFza1ZhbHVlLmluZGV4T2YoJyonKSA9PT0gMSB8fCB0aGlzLl9tYXNrVmFsdWUuaW5kZXhPZignPycpID09PSAxKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgKHRoaXMuX21hc2tWYWx1ZS5pbmRleE9mKCcqJykgPiAxICYmIHZhbHVlLnRvU3RyaW5nKCkubGVuZ3RoIDwgdGhpcy5fbWFza1ZhbHVlLmluZGV4T2YoJyonKSkgfHxcbiAgICAgICAgKHRoaXMuX21hc2tWYWx1ZS5pbmRleE9mKCc/JykgPiAxICYmIHZhbHVlLnRvU3RyaW5nKCkubGVuZ3RoIDwgdGhpcy5fbWFza1ZhbHVlLmluZGV4T2YoJz8nKSkgfHxcbiAgICAgICAgdGhpcy5fbWFza1ZhbHVlLmluZGV4T2YoJ3snKSA9PT0gMVxuICAgICAgKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVWYWxpZGF0aW9uRXJyb3IodmFsdWUpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuX21hc2tWYWx1ZS5pbmRleE9mKCcqJykgPT09IC0xIHx8IHRoaXMuX21hc2tWYWx1ZS5pbmRleE9mKCc/JykgPT09IC0xKSB7XG4gICAgICAgIGNvbnN0IGxlbmd0aDogbnVtYmVyID0gdGhpcy5fbWFza1NlcnZpY2UuZHJvcFNwZWNpYWxDaGFyYWN0ZXJzXG4gICAgICAgICAgPyB0aGlzLl9tYXNrVmFsdWUubGVuZ3RoIC0gdGhpcy5fbWFza1NlcnZpY2UuY2hlY2tTcGVjaWFsQ2hhckFtb3VudCh0aGlzLl9tYXNrVmFsdWUpIC0gY291bnRlck9mT3B0XG4gICAgICAgICAgOiB0aGlzLl9tYXNrVmFsdWUubGVuZ3RoIC0gY291bnRlck9mT3B0O1xuICAgICAgICBpZiAodmFsdWUudG9TdHJpbmcoKS5sZW5ndGggPCBsZW5ndGgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5fY3JlYXRlVmFsaWRhdGlvbkVycm9yKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBASG9zdExpc3RlbmVyKCdwYXN0ZScpXG4gIHB1YmxpYyBvblBhc3RlKCkge1xuICAgIHRoaXMuX2p1c3RQYXN0ZWQgPSB0cnVlO1xuICB9XG5cbiAgQEhvc3RMaXN0ZW5lcignaW5wdXQnLCBbJyRldmVudCddKVxuICBwdWJsaWMgb25JbnB1dChlOiBDdXN0b21LZXlib2FyZEV2ZW50KTogdm9pZCB7XG4gICAgY29uc3QgZWw6IEhUTUxJbnB1dEVsZW1lbnQgPSBlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgIHRoaXMuX2lucHV0VmFsdWUgPSBlbC52YWx1ZTtcblxuICAgIHRoaXMuX3NldE1hc2soKTtcblxuICAgIGlmICghdGhpcy5fbWFza1ZhbHVlKSB7XG4gICAgICB0aGlzLm9uQ2hhbmdlKGVsLnZhbHVlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgcG9zaXRpb246IG51bWJlciA9XG4gICAgICBlbC5zZWxlY3Rpb25TdGFydCA9PT0gMVxuICAgICAgICA/IChlbC5zZWxlY3Rpb25TdGFydCBhcyBudW1iZXIpICsgdGhpcy5fbWFza1NlcnZpY2UucHJlZml4Lmxlbmd0aFxuICAgICAgICA6IChlbC5zZWxlY3Rpb25TdGFydCBhcyBudW1iZXIpO1xuICAgIGxldCBjYXJldFNoaWZ0ID0gMDtcbiAgICBsZXQgYmFja3NwYWNlU2hpZnQgPSBmYWxzZTtcbiAgICB0aGlzLl9tYXNrU2VydmljZS5hcHBseVZhbHVlQ2hhbmdlcyhcbiAgICAgIHBvc2l0aW9uLFxuICAgICAgdGhpcy5fanVzdFBhc3RlZCxcbiAgICAgIHRoaXMuX2NvZGUgPT09ICdCYWNrc3BhY2UnIHx8IHRoaXMuX2NvZGUgPT09ICdEZWxldGUnLFxuICAgICAgKHNoaWZ0OiBudW1iZXIsIF9iYWNrc3BhY2VTaGlmdDogYm9vbGVhbikgPT4ge1xuICAgICAgICB0aGlzLl9qdXN0UGFzdGVkID0gZmFsc2U7XG4gICAgICAgIGNhcmV0U2hpZnQgPSBzaGlmdDtcbiAgICAgICAgYmFja3NwYWNlU2hpZnQgPSBfYmFja3NwYWNlU2hpZnQ7XG4gICAgICB9XG4gICAgKTtcbiAgICAvLyBvbmx5IHNldCB0aGUgc2VsZWN0aW9uIGlmIHRoZSBlbGVtZW50IGlzIGFjdGl2ZVxuICAgIGlmICh0aGlzLmRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IGVsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX3Bvc2l0aW9uID0gdGhpcy5fcG9zaXRpb24gPT09IDEgJiYgdGhpcy5faW5wdXRWYWx1ZS5sZW5ndGggPT09IDEgPyBudWxsIDogdGhpcy5fcG9zaXRpb247XG4gICAgbGV0IHBvc2l0aW9uVG9BcHBseTogbnVtYmVyID0gdGhpcy5fcG9zaXRpb25cbiAgICAgID8gdGhpcy5faW5wdXRWYWx1ZS5sZW5ndGggKyBwb3NpdGlvbiArIGNhcmV0U2hpZnRcbiAgICAgIDogcG9zaXRpb24gKyAodGhpcy5fY29kZSA9PT0gJ0JhY2tzcGFjZScgJiYgIWJhY2tzcGFjZVNoaWZ0ID8gMCA6IGNhcmV0U2hpZnQpO1xuICAgIGlmIChwb3NpdGlvblRvQXBwbHkgPiB0aGlzLl9nZXRBY3R1YWxJbnB1dExlbmd0aCgpKSB7XG4gICAgICBwb3NpdGlvblRvQXBwbHkgPSB0aGlzLl9nZXRBY3R1YWxJbnB1dExlbmd0aCgpO1xuICAgIH1cbiAgICBpZiAocG9zaXRpb25Ub0FwcGx5IDwgMCkge1xuICAgICAgcG9zaXRpb25Ub0FwcGx5ID0gMDtcbiAgICB9XG4gICAgZWwuc2V0U2VsZWN0aW9uUmFuZ2UocG9zaXRpb25Ub0FwcGx5LCBwb3NpdGlvblRvQXBwbHkpO1xuICAgIHRoaXMuX3Bvc2l0aW9uID0gbnVsbDtcbiAgfVxuXG4gIEBIb3N0TGlzdGVuZXIoJ2JsdXInKVxuICBwdWJsaWMgb25CbHVyKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9tYXNrVmFsdWUpIHtcbiAgICAgIHRoaXMuX21hc2tTZXJ2aWNlLmNsZWFySWZOb3RNYXRjaEZuKCk7XG4gICAgfVxuICAgIHRoaXMub25Ub3VjaCgpO1xuICB9XG5cbiAgQEhvc3RMaXN0ZW5lcignY2xpY2snLCBbJyRldmVudCddKVxuICBwdWJsaWMgb25Gb2N1cyhlOiBNb3VzZUV2ZW50IHwgQ3VzdG9tS2V5Ym9hcmRFdmVudCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5fbWFza1ZhbHVlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGVsOiBIVE1MSW5wdXRFbGVtZW50ID0gZS50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICBjb25zdCBwb3NTdGFydCA9IDA7XG4gICAgY29uc3QgcG9zRW5kID0gMDtcbiAgICBpZiAoXG4gICAgICBlbCAhPT0gbnVsbCAmJlxuICAgICAgZWwuc2VsZWN0aW9uU3RhcnQgIT09IG51bGwgJiZcbiAgICAgIGVsLnNlbGVjdGlvblN0YXJ0ID09PSBlbC5zZWxlY3Rpb25FbmQgJiZcbiAgICAgIGVsLnNlbGVjdGlvblN0YXJ0ID4gdGhpcy5fbWFza1NlcnZpY2UucHJlZml4Lmxlbmd0aCAmJlxuICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lXG4gICAgICAoZSBhcyBhbnkpLmtleUNvZGUgIT09IDM4XG4gICAgKSB7XG4gICAgICBpZiAodGhpcy5fbWFza1NlcnZpY2Uuc2hvd01hc2tUeXBlZCkge1xuICAgICAgICAvLyBXZSBhcmUgc2hvd2luZyB0aGUgbWFzayBpbiB0aGUgaW5wdXRcbiAgICAgICAgdGhpcy5fbWFza1NlcnZpY2UubWFza0lzU2hvd24gPSB0aGlzLl9tYXNrU2VydmljZS5zaG93TWFza0luSW5wdXQoKTtcbiAgICAgICAgaWYgKGVsLnNldFNlbGVjdGlvblJhbmdlICYmIHRoaXMuX21hc2tTZXJ2aWNlLnByZWZpeCArIHRoaXMuX21hc2tTZXJ2aWNlLm1hc2tJc1Nob3duID09PSBlbC52YWx1ZSkge1xuICAgICAgICAgIC8vIHRoZSBpbnB1dCBPTkxZIGNvbnRhaW5zIHRoZSBtYXNrLCBzbyBwb3NpdGlvbiB0aGUgY3Vyc29yIGF0IHRoZSBzdGFydFxuICAgICAgICAgIGVsLmZvY3VzKCk7XG4gICAgICAgICAgZWwuc2V0U2VsZWN0aW9uUmFuZ2UocG9zU3RhcnQsIHBvc0VuZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gdGhlIGlucHV0IGNvbnRhaW5zIHNvbWUgY2hhcmFjdGVycyBhbHJlYWR5XG4gICAgICAgICAgaWYgKGVsLnNlbGVjdGlvblN0YXJ0ID4gdGhpcy5fbWFza1NlcnZpY2UuYWN0dWFsVmFsdWUubGVuZ3RoKSB7XG4gICAgICAgICAgICAvLyBpZiB0aGUgdXNlciBjbGlja2VkIGJleW9uZCBvdXIgdmFsdWUncyBsZW5ndGgsIHBvc2l0aW9uIHRoZSBjdXJzb3IgYXQgdGhlIGVuZCBvZiBvdXIgdmFsdWVcbiAgICAgICAgICAgIGVsLnNldFNlbGVjdGlvblJhbmdlKHRoaXMuX21hc2tTZXJ2aWNlLmFjdHVhbFZhbHVlLmxlbmd0aCwgdGhpcy5fbWFza1NlcnZpY2UuYWN0dWFsVmFsdWUubGVuZ3RoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgbmV4dFZhbHVlOiBzdHJpbmcgfCBudWxsID1cbiAgICAgICFlbC52YWx1ZSB8fCBlbC52YWx1ZSA9PT0gdGhpcy5fbWFza1NlcnZpY2UucHJlZml4XG4gICAgICAgID8gdGhpcy5fbWFza1NlcnZpY2UucHJlZml4ICsgdGhpcy5fbWFza1NlcnZpY2UubWFza0lzU2hvd25cbiAgICAgICAgOiBlbC52YWx1ZTtcblxuICAgIC8qKiBGaXggb2YgY3Vyc29yIHBvc2l0aW9uIGp1bXBpbmcgdG8gZW5kIGluIG1vc3QgYnJvd3NlcnMgbm8gbWF0dGVyIHdoZXJlIGN1cnNvciBpcyBpbnNlcnRlZCBvbkZvY3VzICovXG4gICAgaWYgKGVsLnZhbHVlICE9PSBuZXh0VmFsdWUpIHtcbiAgICAgIGVsLnZhbHVlID0gbmV4dFZhbHVlO1xuICAgIH1cblxuICAgIC8qKiBmaXggb2YgY3Vyc29yIHBvc2l0aW9uIHdpdGggcHJlZml4IHdoZW4gbW91c2UgY2xpY2sgb2NjdXIgKi9cbiAgICBpZiAoKChlbC5zZWxlY3Rpb25TdGFydCBhcyBudW1iZXIpIHx8IChlbC5zZWxlY3Rpb25FbmQgYXMgbnVtYmVyKSkgPD0gdGhpcy5fbWFza1NlcnZpY2UucHJlZml4Lmxlbmd0aCkge1xuICAgICAgZWwuc2VsZWN0aW9uU3RhcnQgPSB0aGlzLl9tYXNrU2VydmljZS5wcmVmaXgubGVuZ3RoO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8qKiBzZWxlY3Qgb25seSBpbnNlcnRlZCB0ZXh0ICovXG4gICAgaWYgKChlbC5zZWxlY3Rpb25FbmQgYXMgbnVtYmVyKSA+IHRoaXMuX2dldEFjdHVhbElucHV0TGVuZ3RoKCkpIHtcbiAgICAgIGVsLnNlbGVjdGlvbkVuZCA9IHRoaXMuX2dldEFjdHVhbElucHV0TGVuZ3RoKCk7XG4gICAgfVxuICB9XG5cbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOiBjeWNsb21hdGljLWNvbXBsZXhpdHlcbiAgQEhvc3RMaXN0ZW5lcigna2V5ZG93bicsIFsnJGV2ZW50J10pXG4gIHB1YmxpYyBvbktleURvd24oZTogQ3VzdG9tS2V5Ym9hcmRFdmVudCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5fbWFza1ZhbHVlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2NvZGUgPSBlLmNvZGUgPyBlLmNvZGUgOiBlLmtleTtcbiAgICBjb25zdCBlbDogSFRNTElucHV0RWxlbWVudCA9IGUudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgdGhpcy5faW5wdXRWYWx1ZSA9IGVsLnZhbHVlO1xuXG4gICAgdGhpcy5fc2V0TWFzaygpO1xuXG4gICAgaWYgKGUua2V5Q29kZSA9PT0gMzgpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG4gICAgaWYgKGUua2V5Q29kZSA9PT0gMzcgfHwgZS5rZXlDb2RlID09PSA4IHx8IGUua2V5Q29kZSA9PT0gNDYpIHtcbiAgICAgIGlmIChlLmtleUNvZGUgPT09IDggJiYgZWwudmFsdWUubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGVsLnNlbGVjdGlvblN0YXJ0ID0gZWwuc2VsZWN0aW9uRW5kO1xuICAgICAgfVxuICAgICAgaWYgKGUua2V5Q29kZSA9PT0gOCAmJiAoZWwuc2VsZWN0aW9uU3RhcnQgYXMgbnVtYmVyKSAhPT0gMCkge1xuICAgICAgICAvLyBJZiBzcGVjaWFsQ2hhcnMgaXMgZmFsc2UsIChzaG91bGRuJ3QgZXZlciBoYXBwZW4pIHRoZW4gc2V0IHRvIHRoZSBkZWZhdWx0c1xuICAgICAgICB0aGlzLnNwZWNpYWxDaGFyYWN0ZXJzID0gdGhpcy5zcGVjaWFsQ2hhcmFjdGVycz8ubGVuZ3RoXG4gICAgICAgICAgPyB0aGlzLnNwZWNpYWxDaGFyYWN0ZXJzXG4gICAgICAgICAgOiB0aGlzLl9jb25maWcuc3BlY2lhbENoYXJhY3RlcnM7XG4gICAgICAgIGlmICh0aGlzLnByZWZpeC5sZW5ndGggPiAxICYmIChlbC5zZWxlY3Rpb25TdGFydCBhcyBudW1iZXIpIDw9IHRoaXMucHJlZml4Lmxlbmd0aCkge1xuICAgICAgICAgIGVsLnNldFNlbGVjdGlvblJhbmdlKHRoaXMucHJlZml4Lmxlbmd0aCwgdGhpcy5wcmVmaXgubGVuZ3RoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAodGhpcy5faW5wdXRWYWx1ZS5sZW5ndGggIT09IChlbC5zZWxlY3Rpb25TdGFydCBhcyBudW1iZXIpICYmIChlbC5zZWxlY3Rpb25TdGFydCBhcyBudW1iZXIpICE9PSAxKSB7XG4gICAgICAgICAgICB3aGlsZSAoXG4gICAgICAgICAgICAgIHRoaXMuc3BlY2lhbENoYXJhY3RlcnMuaW5jbHVkZXModGhpcy5faW5wdXRWYWx1ZVsoZWwuc2VsZWN0aW9uU3RhcnQgYXMgbnVtYmVyKSAtIDFdLnRvU3RyaW5nKCkpICYmXG4gICAgICAgICAgICAgICgodGhpcy5wcmVmaXgubGVuZ3RoID49IDEgJiYgKGVsLnNlbGVjdGlvblN0YXJ0IGFzIG51bWJlcikgPiB0aGlzLnByZWZpeC5sZW5ndGgpIHx8XG4gICAgICAgICAgICAgICAgdGhpcy5wcmVmaXgubGVuZ3RoID09PSAwKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgIGVsLnNldFNlbGVjdGlvblJhbmdlKChlbC5zZWxlY3Rpb25TdGFydCBhcyBudW1iZXIpIC0gMSwgKGVsLnNlbGVjdGlvblN0YXJ0IGFzIG51bWJlcikgLSAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5zdWZmaXhDaGVja09uUHJlc3NEZWxldGUoZS5rZXlDb2RlLCBlbCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuc3VmZml4Q2hlY2tPblByZXNzRGVsZXRlKGUua2V5Q29kZSwgZWwpO1xuICAgICAgaWYgKFxuICAgICAgICB0aGlzLl9tYXNrU2VydmljZS5wcmVmaXgubGVuZ3RoICYmXG4gICAgICAgIChlbC5zZWxlY3Rpb25TdGFydCBhcyBudW1iZXIpIDw9IHRoaXMuX21hc2tTZXJ2aWNlLnByZWZpeC5sZW5ndGggJiZcbiAgICAgICAgKGVsLnNlbGVjdGlvbkVuZCBhcyBudW1iZXIpIDw9IHRoaXMuX21hc2tTZXJ2aWNlLnByZWZpeC5sZW5ndGhcbiAgICAgICkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB9XG4gICAgICBjb25zdCBjdXJzb3JTdGFydDogbnVtYmVyIHwgbnVsbCA9IGVsLnNlbGVjdGlvblN0YXJ0O1xuICAgICAgLy8gdGhpcy5vbkZvY3VzKGUpO1xuICAgICAgaWYgKFxuICAgICAgICBlLmtleUNvZGUgPT09IDggJiZcbiAgICAgICAgIWVsLnJlYWRPbmx5ICYmXG4gICAgICAgIGN1cnNvclN0YXJ0ID09PSAwICYmXG4gICAgICAgIGVsLnNlbGVjdGlvbkVuZCA9PT0gZWwudmFsdWUubGVuZ3RoICYmXG4gICAgICAgIGVsLnZhbHVlLmxlbmd0aCAhPT0gMFxuICAgICAgKSB7XG4gICAgICAgIHRoaXMuX3Bvc2l0aW9uID0gdGhpcy5fbWFza1NlcnZpY2UucHJlZml4ID8gdGhpcy5fbWFza1NlcnZpY2UucHJlZml4Lmxlbmd0aCA6IDA7XG4gICAgICAgIHRoaXMuX21hc2tTZXJ2aWNlLmFwcGx5TWFzayh0aGlzLl9tYXNrU2VydmljZS5wcmVmaXgsIHRoaXMuX21hc2tTZXJ2aWNlLm1hc2tFeHByZXNzaW9uLCB0aGlzLl9wb3NpdGlvbik7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChcbiAgICAgICEhdGhpcy5zdWZmaXggJiZcbiAgICAgIHRoaXMuc3VmZml4Lmxlbmd0aCA+IDEgJiZcbiAgICAgIHRoaXMuX2lucHV0VmFsdWUubGVuZ3RoIC0gdGhpcy5zdWZmaXgubGVuZ3RoIDwgKGVsLnNlbGVjdGlvblN0YXJ0IGFzIG51bWJlcilcbiAgICApIHtcbiAgICAgIGVsLnNldFNlbGVjdGlvblJhbmdlKHRoaXMuX2lucHV0VmFsdWUubGVuZ3RoIC0gdGhpcy5zdWZmaXgubGVuZ3RoLCB0aGlzLl9pbnB1dFZhbHVlLmxlbmd0aCk7XG4gICAgfSBlbHNlIGlmIChcbiAgICAgIChlLmtleUNvZGUgPT09IDY1ICYmIGUuY3RybEtleSA9PT0gdHJ1ZSkgfHwgLy8gQ3RybCsgQVxuICAgICAgKGUua2V5Q29kZSA9PT0gNjUgJiYgZS5tZXRhS2V5ID09PSB0cnVlKSAvLyBDbWQgKyBBIChNYWMpXG4gICAgKSB7XG4gICAgICBlbC5zZXRTZWxlY3Rpb25SYW5nZSgwLCB0aGlzLl9nZXRBY3R1YWxJbnB1dExlbmd0aCgpKTtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG4gICAgdGhpcy5fbWFza1NlcnZpY2Uuc2VsU3RhcnQgPSBlbC5zZWxlY3Rpb25TdGFydDtcbiAgICB0aGlzLl9tYXNrU2VydmljZS5zZWxFbmQgPSBlbC5zZWxlY3Rpb25FbmQ7XG4gIH1cblxuICAvKiogSXQgd3JpdGVzIHRoZSB2YWx1ZSBpbiB0aGUgaW5wdXQgKi9cbiAgcHVibGljIGFzeW5jIHdyaXRlVmFsdWUoaW5wdXRWYWx1ZTogc3RyaW5nIHwgbnVtYmVyIHwgeyB2YWx1ZTogc3RyaW5nIHwgbnVtYmVyOyBkaXNhYmxlPzogYm9vbGVhbiB9KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHR5cGVvZiBpbnB1dFZhbHVlID09PSAnb2JqZWN0JyAmJiBpbnB1dFZhbHVlICE9PSBudWxsICYmICd2YWx1ZScgaW4gaW5wdXRWYWx1ZSkge1xuICAgICAgaWYgKCdkaXNhYmxlJyBpbiBpbnB1dFZhbHVlKSB7XG4gICAgICAgIHRoaXMuc2V0RGlzYWJsZWRTdGF0ZShCb29sZWFuKGlucHV0VmFsdWUuZGlzYWJsZSkpO1xuICAgICAgfVxuICAgICAgaW5wdXRWYWx1ZSA9IGlucHV0VmFsdWUudmFsdWU7XG4gICAgfVxuXG4gICAgaWYgKGlucHV0VmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgaW5wdXRWYWx1ZSA9ICcnO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGlucHV0VmFsdWUgPT09ICdudW1iZXInKSB7XG4gICAgICBpbnB1dFZhbHVlID0gU3RyaW5nKGlucHV0VmFsdWUpO1xuICAgICAgaW5wdXRWYWx1ZSA9IHRoaXMuZGVjaW1hbE1hcmtlciAhPT0gJy4nID8gaW5wdXRWYWx1ZS5yZXBsYWNlKCcuJywgdGhpcy5kZWNpbWFsTWFya2VyKSA6IGlucHV0VmFsdWU7XG4gICAgICB0aGlzLl9tYXNrU2VydmljZS5pc051bWJlclZhbHVlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICB0aGlzLl9pbnB1dFZhbHVlID0gaW5wdXRWYWx1ZTtcbiAgICB0aGlzLl9zZXRNYXNrKCk7XG5cbiAgICBpZiAoXG4gICAgICAoaW5wdXRWYWx1ZSAmJiB0aGlzLl9tYXNrU2VydmljZS5tYXNrRXhwcmVzc2lvbikgfHxcbiAgICAgICh0aGlzLl9tYXNrU2VydmljZS5tYXNrRXhwcmVzc2lvbiAmJiAodGhpcy5fbWFza1NlcnZpY2UucHJlZml4IHx8IHRoaXMuX21hc2tTZXJ2aWNlLnNob3dNYXNrVHlwZWQpKVxuICAgICkge1xuICAgICAgLy8gTGV0IHRoZSBzZXJ2aWNlIHdlIGtub3cgd2UgYXJlIHdyaXRpbmcgdmFsdWUgc28gdGhhdCB0cmlnZ2VyaW5nIG9uQ2hhbmdlIGZ1bmN0aW9uIHdvbnQgaGFwcGVuIGR1cmluZyBhcHBseU1hc2tcbiAgICAgIHRoaXMuX21hc2tTZXJ2aWNlLndyaXRpbmdWYWx1ZSA9IHRydWU7XG4gICAgICB0aGlzLl9tYXNrU2VydmljZS5mb3JtRWxlbWVudFByb3BlcnR5ID0gW1xuICAgICAgICAndmFsdWUnLFxuICAgICAgICB0aGlzLl9tYXNrU2VydmljZS5hcHBseU1hc2soaW5wdXRWYWx1ZSwgdGhpcy5fbWFza1NlcnZpY2UubWFza0V4cHJlc3Npb24pLFxuICAgICAgXTtcbiAgICAgIC8vIExldCB0aGUgc2VydmljZSBrbm93IHdlJ3ZlIGZpbmlzaGVkIHdyaXRpbmcgdmFsdWVcbiAgICAgIHRoaXMuX21hc2tTZXJ2aWNlLndyaXRpbmdWYWx1ZSA9IGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9tYXNrU2VydmljZS5mb3JtRWxlbWVudFByb3BlcnR5ID0gWyd2YWx1ZScsIGlucHV0VmFsdWVdO1xuICAgIH1cbiAgICB0aGlzLl9pbnB1dFZhbHVlID0gaW5wdXRWYWx1ZTtcbiAgfVxuXG4gIHB1YmxpYyByZWdpc3Rlck9uQ2hhbmdlKGZuOiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLm9uQ2hhbmdlID0gZm47XG4gICAgdGhpcy5fbWFza1NlcnZpY2Uub25DaGFuZ2UgPSB0aGlzLm9uQ2hhbmdlO1xuICB9XG5cbiAgcHVibGljIHJlZ2lzdGVyT25Ub3VjaGVkKGZuOiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLm9uVG91Y2ggPSBmbjtcbiAgfVxuXG4gIHB1YmxpYyBzdWZmaXhDaGVja09uUHJlc3NEZWxldGUoa2V5Q29kZTogbnVtYmVyLCBlbDogSFRNTElucHV0RWxlbWVudCk6IHZvaWQge1xuICAgIGlmIChrZXlDb2RlID09PSA0NiAmJiB0aGlzLnN1ZmZpeC5sZW5ndGggPiAwKSB7XG4gICAgICBpZiAodGhpcy5faW5wdXRWYWx1ZS5sZW5ndGggLSB0aGlzLnN1ZmZpeC5sZW5ndGggPD0gKGVsLnNlbGVjdGlvblN0YXJ0IGFzIG51bWJlcikpIHtcbiAgICAgICAgZWwuc2V0U2VsZWN0aW9uUmFuZ2UodGhpcy5faW5wdXRWYWx1ZS5sZW5ndGggLSB0aGlzLnN1ZmZpeC5sZW5ndGgsIHRoaXMuX2lucHV0VmFsdWUubGVuZ3RoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGtleUNvZGUgPT09IDgpIHtcbiAgICAgIGlmICh0aGlzLnN1ZmZpeC5sZW5ndGggPiAxICYmIHRoaXMuX2lucHV0VmFsdWUubGVuZ3RoIC0gdGhpcy5zdWZmaXgubGVuZ3RoIDwgKGVsLnNlbGVjdGlvblN0YXJ0IGFzIG51bWJlcikpIHtcbiAgICAgICAgZWwuc2V0U2VsZWN0aW9uUmFuZ2UodGhpcy5faW5wdXRWYWx1ZS5sZW5ndGggLSB0aGlzLnN1ZmZpeC5sZW5ndGgsIHRoaXMuX2lucHV0VmFsdWUubGVuZ3RoKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnN1ZmZpeC5sZW5ndGggPT09IDEgJiYgdGhpcy5faW5wdXRWYWx1ZS5sZW5ndGggPT09IChlbC5zZWxlY3Rpb25TdGFydCBhcyBudW1iZXIpKSB7XG4gICAgICAgIGVsLnNldFNlbGVjdGlvblJhbmdlKChlbC5zZWxlY3Rpb25TdGFydCBhcyBudW1iZXIpIC0gMSwgKGVsLnNlbGVjdGlvblN0YXJ0IGFzIG51bWJlcikgLSAxKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogSXQgZGlzYWJsZXMgdGhlIGlucHV0IGVsZW1lbnQgKi9cbiAgcHVibGljIHNldERpc2FibGVkU3RhdGUoaXNEaXNhYmxlZDogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuX21hc2tTZXJ2aWNlLmZvcm1FbGVtZW50UHJvcGVydHkgPSBbJ2Rpc2FibGVkJywgaXNEaXNhYmxlZF07XG4gIH1cblxuICBwcml2YXRlIF9yZXBlYXRQYXR0ZXJuU3ltYm9scyhtYXNrRXhwOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiAoXG4gICAgICAobWFza0V4cC5tYXRjaCgve1swLTldK30vKSAmJlxuICAgICAgICBtYXNrRXhwLnNwbGl0KCcnKS5yZWR1Y2UoKGFjY3VtOiBzdHJpbmcsIGN1cnJ2YWw6IHN0cmluZywgaW5kZXg6IG51bWJlcik6IHN0cmluZyA9PiB7XG4gICAgICAgICAgdGhpcy5fc3RhcnQgPSBjdXJydmFsID09PSAneycgPyBpbmRleCA6IHRoaXMuX3N0YXJ0O1xuXG4gICAgICAgICAgaWYgKGN1cnJ2YWwgIT09ICd9Jykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21hc2tTZXJ2aWNlLl9maW5kU3BlY2lhbENoYXIoY3VycnZhbCkgPyBhY2N1bSArIGN1cnJ2YWwgOiBhY2N1bTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5fZW5kID0gaW5kZXg7XG4gICAgICAgICAgY29uc3QgcmVwZWF0TnVtYmVyOiBudW1iZXIgPSBOdW1iZXIobWFza0V4cC5zbGljZSh0aGlzLl9zdGFydCArIDEsIHRoaXMuX2VuZCkpO1xuICAgICAgICAgIGNvbnN0IHJlcGxhY2VXaXRoOiBzdHJpbmcgPSBuZXcgQXJyYXkocmVwZWF0TnVtYmVyICsgMSkuam9pbihtYXNrRXhwW3RoaXMuX3N0YXJ0IC0gMV0pO1xuICAgICAgICAgIHJldHVybiBhY2N1bSArIHJlcGxhY2VXaXRoO1xuICAgICAgICB9LCAnJykpIHx8XG4gICAgICBtYXNrRXhwXG4gICAgKTtcbiAgfVxuXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgcHJpdmF0ZSBfYXBwbHlNYXNrKCk6IGFueSB7XG4gICAgdGhpcy5fbWFza1NlcnZpY2UubWFza0V4cHJlc3Npb24gPSB0aGlzLl9yZXBlYXRQYXR0ZXJuU3ltYm9scyh0aGlzLl9tYXNrVmFsdWUgfHwgJycpO1xuICAgIHRoaXMuX21hc2tTZXJ2aWNlLmZvcm1FbGVtZW50UHJvcGVydHkgPSBbXG4gICAgICAndmFsdWUnLFxuICAgICAgdGhpcy5fbWFza1NlcnZpY2UuYXBwbHlNYXNrKHRoaXMuX2lucHV0VmFsdWUsIHRoaXMuX21hc2tTZXJ2aWNlLm1hc2tFeHByZXNzaW9uKSxcbiAgICBdO1xuICB9XG5cbiAgcHJpdmF0ZSBfdmFsaWRhdGVUaW1lKHZhbHVlOiBzdHJpbmcpOiBWYWxpZGF0aW9uRXJyb3JzIHwgbnVsbCB7XG4gICAgY29uc3Qgcm93TWFza0xlbjogbnVtYmVyID0gdGhpcy5fbWFza1ZhbHVlLnNwbGl0KCcnKS5maWx0ZXIoKHM6IHN0cmluZykgPT4gcyAhPT0gJzonKS5sZW5ndGg7XG4gICAgaWYgKCF2YWx1ZSkge1xuICAgICAgcmV0dXJuIG51bGw7IC8vIERvbid0IHZhbGlkYXRlIGVtcHR5IHZhbHVlcyB0byBhbGxvdyBmb3Igb3B0aW9uYWwgZm9ybSBjb250cm9sXG4gICAgfVxuXG4gICAgaWYgKCgrdmFsdWVbdmFsdWUubGVuZ3RoIC0gMV0gPT09IDAgJiYgdmFsdWUubGVuZ3RoIDwgcm93TWFza0xlbikgfHwgdmFsdWUubGVuZ3RoIDw9IHJvd01hc2tMZW4gLSAyKSB7XG4gICAgICByZXR1cm4gdGhpcy5fY3JlYXRlVmFsaWRhdGlvbkVycm9yKHZhbHVlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgX2dldEFjdHVhbElucHV0TGVuZ3RoKCkge1xuICAgIHJldHVybiAoXG4gICAgICB0aGlzLl9tYXNrU2VydmljZS5hY3R1YWxWYWx1ZS5sZW5ndGggfHwgdGhpcy5fbWFza1NlcnZpY2UuYWN0dWFsVmFsdWUubGVuZ3RoICsgdGhpcy5fbWFza1NlcnZpY2UucHJlZml4Lmxlbmd0aFxuICAgICk7XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVWYWxpZGF0aW9uRXJyb3IoYWN0dWFsVmFsdWU6IHN0cmluZyk6IFZhbGlkYXRpb25FcnJvcnMge1xuICAgIHJldHVybiB7XG4gICAgICBtYXNrOiB7XG4gICAgICAgIHJlcXVpcmVkTWFzazogdGhpcy5fbWFza1ZhbHVlLFxuICAgICAgICBhY3R1YWxWYWx1ZSxcbiAgICAgIH0sXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgX3NldE1hc2soKSB7XG4gICAgaWYgKHRoaXMuX21hc2tFeHByZXNzaW9uQXJyYXkubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5fbWFza0V4cHJlc3Npb25BcnJheS5zb21lKChtYXNrKSA9PiB7XG4gICAgICAgIGNvbnN0IHRlc3QgPVxuICAgICAgICAgIHRoaXMuX21hc2tTZXJ2aWNlLnJlbW92ZU1hc2sodGhpcy5faW5wdXRWYWx1ZSk/Lmxlbmd0aCA8PSB0aGlzLl9tYXNrU2VydmljZS5yZW1vdmVNYXNrKG1hc2spPy5sZW5ndGg7XG4gICAgICAgIGlmICh0aGlzLl9pbnB1dFZhbHVlICYmIHRlc3QpIHtcbiAgICAgICAgICB0aGlzLl9tYXNrVmFsdWUgPSBtYXNrO1xuICAgICAgICAgIHRoaXMubWFza0V4cHJlc3Npb24gPSBtYXNrO1xuICAgICAgICAgIHRoaXMuX21hc2tTZXJ2aWNlLm1hc2tFeHByZXNzaW9uID0gbWFzaztcbiAgICAgICAgICByZXR1cm4gdGVzdDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9tYXNrVmFsdWUgPSB0aGlzLl9tYXNrRXhwcmVzc2lvbkFycmF5W3RoaXMuX21hc2tFeHByZXNzaW9uQXJyYXkubGVuZ3RoIC0gMV07XG4gICAgICAgICAgdGhpcy5tYXNrRXhwcmVzc2lvbiA9IHRoaXMuX21hc2tFeHByZXNzaW9uQXJyYXlbdGhpcy5fbWFza0V4cHJlc3Npb25BcnJheS5sZW5ndGggLSAxXTtcbiAgICAgICAgICB0aGlzLl9tYXNrU2VydmljZS5tYXNrRXhwcmVzc2lvbiA9IHRoaXMuX21hc2tFeHByZXNzaW9uQXJyYXlbdGhpcy5fbWFza0V4cHJlc3Npb25BcnJheS5sZW5ndGggLSAxXTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG59XG4iXX0=