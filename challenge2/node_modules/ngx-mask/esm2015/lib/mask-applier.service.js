import { Inject, Injectable } from '@angular/core';
import { config } from './config';
export class MaskApplierService {
    constructor(_config) {
        this._config = _config;
        this.maskExpression = '';
        this.actualValue = '';
        this.shownMaskExpression = '';
        this._formatWithSeparators = (str, thousandSeparatorChar, decimalChar, precision) => {
            const x = str.split(decimalChar);
            const decimals = x.length > 1 ? `${decimalChar}${x[1]}` : '';
            let res = x[0];
            const separatorLimit = this.separatorLimit.replace(/\s/g, '');
            if (separatorLimit && +separatorLimit) {
                if (res[0] === '-') {
                    res = `-${res.slice(1, res.length).slice(0, separatorLimit.length)}`;
                }
                else {
                    res = res.slice(0, separatorLimit.length);
                }
            }
            const rgx = /(\d+)(\d{3})/;
            while (thousandSeparatorChar && rgx.test(res)) {
                res = res.replace(rgx, '$1' + thousandSeparatorChar + '$2');
            }
            if (precision === undefined) {
                return res + decimals;
            }
            else if (precision === 0) {
                return res;
            }
            return res + decimals.substr(0, precision + 1);
        };
        this.percentage = (str) => {
            return Number(str) >= 0 && Number(str) <= 100;
        };
        this.getPrecision = (maskExpression) => {
            const x = maskExpression.split('.');
            if (x.length > 1) {
                return Number(x[x.length - 1]);
            }
            return Infinity;
        };
        this.checkAndRemoveSuffix = (inputValue) => {
            var _a, _b, _c;
            for (let i = ((_a = this.suffix) === null || _a === void 0 ? void 0 : _a.length) - 1; i >= 0; i--) {
                const substr = this.suffix.substr(i, (_b = this.suffix) === null || _b === void 0 ? void 0 : _b.length);
                if (inputValue.includes(substr) &&
                    (i - 1 < 0 || !inputValue.includes(this.suffix.substr(i - 1, (_c = this.suffix) === null || _c === void 0 ? void 0 : _c.length)))) {
                    return inputValue.replace(substr, '');
                }
            }
            return inputValue;
        };
        this.checkInputPrecision = (inputValue, precision, decimalMarker) => {
            if (precision < Infinity) {
                const precisionRegEx = new RegExp(this._charToRegExpExpression(decimalMarker) + `\\d{${precision}}.*$`);
                const precisionMatch = inputValue.match(precisionRegEx);
                if (precisionMatch && precisionMatch[0].length - 1 > precision) {
                    const diff = precisionMatch[0].length - 1 - precision;
                    inputValue = inputValue.substring(0, inputValue.length - diff);
                }
                if (precision === 0 && inputValue.endsWith(decimalMarker)) {
                    inputValue = inputValue.substring(0, inputValue.length - 1);
                }
            }
            return inputValue;
        };
        this._shift = new Set();
        this.clearIfNotMatch = this._config.clearIfNotMatch;
        this.dropSpecialCharacters = this._config.dropSpecialCharacters;
        this.maskSpecialCharacters = this._config.specialCharacters;
        this.maskAvailablePatterns = this._config.patterns;
        this.prefix = this._config.prefix;
        this.suffix = this._config.suffix;
        this.thousandSeparator = this._config.thousandSeparator;
        this.decimalMarker = this._config.decimalMarker;
        this.hiddenInput = this._config.hiddenInput;
        this.showMaskTyped = this._config.showMaskTyped;
        this.placeHolderCharacter = this._config.placeHolderCharacter;
        this.validation = this._config.validation;
        this.separatorLimit = this._config.separatorLimit;
        this.allowNegativeNumbers = this._config.allowNegativeNumbers;
        this.leadZeroDateTime = this._config.leadZeroDateTime;
    }
    applyMaskWithPattern(inputValue, maskAndPattern) {
        const [mask, customPattern] = maskAndPattern;
        this.customPattern = customPattern;
        return this.applyMask(inputValue, mask);
    }
    applyMask(inputValue, maskExpression, position = 0, justPasted = false, backspaced = false, cb = () => { }) {
        if (inputValue === undefined || inputValue === null || maskExpression === undefined) {
            return '';
        }
        let cursor = 0;
        let result = '';
        let multi = false;
        let backspaceShift = false;
        let shift = 1;
        let stepBack = false;
        if (inputValue.slice(0, this.prefix.length) === this.prefix) {
            inputValue = inputValue.slice(this.prefix.length, inputValue.length);
        }
        if (!!this.suffix && (inputValue === null || inputValue === void 0 ? void 0 : inputValue.length) > 0) {
            inputValue = this.checkAndRemoveSuffix(inputValue);
        }
        const inputArray = inputValue.toString().split('');
        if (maskExpression === 'IP') {
            this.ipError = !!(inputArray.filter((i) => i === '.').length < 3 && inputArray.length < 7);
            maskExpression = '099.099.099.099';
        }
        const arr = [];
        for (let i = 0; i < inputValue.length; i++) {
            if (inputValue[i].match('\\d')) {
                arr.push(inputValue[i]);
            }
        }
        if (maskExpression === 'CPF_CNPJ') {
            this.cpfCnpjError = !!(arr.length !== 11 && arr.length !== 14);
            if (arr.length > 11) {
                maskExpression = '00.000.000/0000-00';
            }
            else {
                maskExpression = '000.000.000-00';
            }
        }
        if (maskExpression.startsWith('percent')) {
            if (inputValue.match('[a-z]|[A-Z]') || inputValue.match(/[-!$%^&*()_+|~=`{}\[\]:";'<>?,\/.]/)) {
                inputValue = this._stripToDecimal(inputValue);
                const precision = this.getPrecision(maskExpression);
                inputValue = this.checkInputPrecision(inputValue, precision, this.decimalMarker);
            }
            if (inputValue.indexOf('.') > 0 && !this.percentage(inputValue.substring(0, inputValue.indexOf('.')))) {
                const base = inputValue.substring(0, inputValue.indexOf('.') - 1);
                inputValue = `${base}${inputValue.substring(inputValue.indexOf('.'), inputValue.length)}`;
            }
            if (this.percentage(inputValue)) {
                result = inputValue;
            }
            else {
                result = inputValue.substring(0, inputValue.length - 1);
            }
        }
        else if (maskExpression.startsWith('separator')) {
            if (inputValue.match('[wа-яА-Я]') ||
                inputValue.match('[ЁёА-я]') ||
                inputValue.match('[a-z]|[A-Z]') ||
                inputValue.match(/[-@#!$%\\^&*()_£¬'+|~=`{}\[\]:";<>.?\/]/) ||
                inputValue.match('[^A-Za-z0-9,]')) {
                inputValue = this._stripToDecimal(inputValue);
            }
            inputValue =
                inputValue.length > 1 && inputValue[0] === '0' && inputValue[1] !== this.decimalMarker && !backspaced
                    ? inputValue.slice(1, inputValue.length)
                    : inputValue;
            // TODO: we had different rexexps here for the different cases... but tests dont seam to bother - check this
            //  separator: no COMMA, dot-sep: no SPACE, COMMA OK, comma-sep: no SPACE, COMMA OK
            const thousandSeperatorCharEscaped = this._charToRegExpExpression(this.thousandSeparator);
            const decimalMarkerEscaped = this._charToRegExpExpression(this.decimalMarker);
            const invalidChars = '@#!$%^&*()_+|~=`{}\\[\\]:\\s,\\.";<>?\\/'
                .replace(thousandSeperatorCharEscaped, '')
                .replace(decimalMarkerEscaped, '');
            const invalidCharRegexp = new RegExp('[' + invalidChars + ']');
            if (inputValue.match(invalidCharRegexp)) {
                inputValue = inputValue.substring(0, inputValue.length - 1);
            }
            const precision = this.getPrecision(maskExpression);
            inputValue = this.checkInputPrecision(inputValue, precision, this.decimalMarker);
            const strForSep = inputValue.replace(new RegExp(thousandSeperatorCharEscaped, 'g'), '');
            result = this._formatWithSeparators(strForSep, this.thousandSeparator, this.decimalMarker, precision);
            const commaShift = result.indexOf(',') - inputValue.indexOf(',');
            const shiftStep = result.length - inputValue.length;
            if (shiftStep > 0 && result[position] !== ',') {
                backspaceShift = true;
                let _shift = 0;
                do {
                    this._shift.add(position + _shift);
                    _shift++;
                } while (_shift < shiftStep);
            }
            else if ((commaShift !== 0 && position > 0 && !(result.indexOf(',') >= position && position > 3)) ||
                (!(result.indexOf('.') >= position && position > 3) && shiftStep <= 0)) {
                this._shift.clear();
                backspaceShift = true;
                shift = shiftStep;
                position += shiftStep;
                this._shift.add(position);
            }
            else {
                this._shift.clear();
            }
        }
        else {
            for (
            // tslint:disable-next-line
            let i = 0, inputSymbol = inputArray[0]; i < inputArray.length; i++, inputSymbol = inputArray[i]) {
                if (cursor === maskExpression.length) {
                    break;
                }
                if (this._checkSymbolMask(inputSymbol, maskExpression[cursor]) && maskExpression[cursor + 1] === '?') {
                    result += inputSymbol;
                    cursor += 2;
                }
                else if (maskExpression[cursor + 1] === '*' &&
                    multi &&
                    this._checkSymbolMask(inputSymbol, maskExpression[cursor + 2])) {
                    result += inputSymbol;
                    cursor += 3;
                    multi = false;
                }
                else if (this._checkSymbolMask(inputSymbol, maskExpression[cursor]) && maskExpression[cursor + 1] === '*') {
                    result += inputSymbol;
                    multi = true;
                }
                else if (maskExpression[cursor + 1] === '?' &&
                    this._checkSymbolMask(inputSymbol, maskExpression[cursor + 2])) {
                    result += inputSymbol;
                    cursor += 3;
                }
                else if (this._checkSymbolMask(inputSymbol, maskExpression[cursor])) {
                    if (maskExpression[cursor] === 'H') {
                        if (Number(inputSymbol) > 2) {
                            cursor += 1;
                            this._shiftStep(maskExpression, cursor, inputArray.length);
                            i--;
                            if (this.leadZeroDateTime) {
                                result += '0';
                            }
                            continue;
                        }
                    }
                    if (maskExpression[cursor] === 'h') {
                        if (result === '2' && Number(inputSymbol) > 3) {
                            cursor += 1;
                            i--;
                            continue;
                        }
                    }
                    if (maskExpression[cursor] === 'm') {
                        if (Number(inputSymbol) > 5) {
                            cursor += 1;
                            this._shiftStep(maskExpression, cursor, inputArray.length);
                            i--;
                            if (this.leadZeroDateTime) {
                                result += '0';
                            }
                            continue;
                        }
                    }
                    if (maskExpression[cursor] === 's') {
                        if (Number(inputSymbol) > 5) {
                            cursor += 1;
                            this._shiftStep(maskExpression, cursor, inputArray.length);
                            i--;
                            if (this.leadZeroDateTime) {
                                result += '0';
                            }
                            continue;
                        }
                    }
                    const daysCount = 31;
                    if (maskExpression[cursor] === 'd') {
                        if ((Number(inputSymbol) > 3 && this.leadZeroDateTime) ||
                            Number(inputValue.slice(cursor, cursor + 2)) > daysCount ||
                            inputValue[cursor + 1] === '/') {
                            cursor += 1;
                            this._shiftStep(maskExpression, cursor, inputArray.length);
                            i--;
                            if (this.leadZeroDateTime) {
                                result += '0';
                            }
                            continue;
                        }
                    }
                    if (maskExpression[cursor] === 'M') {
                        const monthsCount = 12;
                        // mask without day
                        const withoutDays = cursor === 0 &&
                            (Number(inputSymbol) > 2 ||
                                Number(inputValue.slice(cursor, cursor + 2)) > monthsCount ||
                                inputValue[cursor + 1] === '/');
                        // day<10 && month<12 for input
                        const day1monthInput = inputValue.slice(cursor - 3, cursor - 1).includes('/') &&
                            ((inputValue[cursor - 2] === '/' &&
                                Number(inputValue.slice(cursor - 1, cursor + 1)) > monthsCount &&
                                inputValue[cursor] !== '/') ||
                                inputValue[cursor] === '/' ||
                                (inputValue[cursor - 3] === '/' &&
                                    Number(inputValue.slice(cursor - 2, cursor)) > monthsCount &&
                                    inputValue[cursor - 1] !== '/') ||
                                inputValue[cursor - 1] === '/');
                        // 10<day<31 && month<12 for input
                        const day2monthInput = Number(inputValue.slice(cursor - 3, cursor - 1)) <= daysCount &&
                            !inputValue.slice(cursor - 3, cursor - 1).includes('/') &&
                            inputValue[cursor - 1] === '/' &&
                            (Number(inputValue.slice(cursor, cursor + 2)) > monthsCount || inputValue[cursor + 1] === '/');
                        // day<10 && month<12 for paste whole data
                        const day1monthPaste = Number(inputValue.slice(cursor - 3, cursor - 1)) > daysCount &&
                            !inputValue.slice(cursor - 3, cursor - 1).includes('/') &&
                            !inputValue.slice(cursor - 2, cursor).includes('/') &&
                            Number(inputValue.slice(cursor - 2, cursor)) > monthsCount;
                        // 10<day<31 && month<12 for paste whole data
                        const day2monthPaste = Number(inputValue.slice(cursor - 3, cursor - 1)) <= daysCount &&
                            !inputValue.slice(cursor - 3, cursor - 1).includes('/') &&
                            inputValue[cursor - 1] !== '/' &&
                            Number(inputValue.slice(cursor - 1, cursor + 1)) > monthsCount;
                        if ((Number(inputSymbol) > 1 && this.leadZeroDateTime) ||
                            withoutDays ||
                            day1monthInput ||
                            day2monthInput ||
                            day1monthPaste ||
                            day2monthPaste) {
                            cursor += 1;
                            this._shiftStep(maskExpression, cursor, inputArray.length);
                            i--;
                            if (this.leadZeroDateTime) {
                                result += '0';
                            }
                            continue;
                        }
                    }
                    result += inputSymbol;
                    cursor++;
                }
                else if (this.maskSpecialCharacters.indexOf(maskExpression[cursor]) !== -1) {
                    result += maskExpression[cursor];
                    cursor++;
                    this._shiftStep(maskExpression, cursor, inputArray.length);
                    i--;
                }
                else if (this.maskSpecialCharacters.indexOf(inputSymbol) > -1 &&
                    this.maskAvailablePatterns[maskExpression[cursor]] &&
                    this.maskAvailablePatterns[maskExpression[cursor]].optional) {
                    if (!!inputArray[cursor] &&
                        maskExpression !== '099.099.099.099' &&
                        maskExpression !== '000.000.000-00' &&
                        maskExpression !== '00.000.000/0000-00') {
                        result += inputArray[cursor];
                    }
                    cursor++;
                    i--;
                }
                else if (this.maskExpression[cursor + 1] === '*' &&
                    this._findSpecialChar(this.maskExpression[cursor + 2]) &&
                    this._findSpecialChar(inputSymbol) === this.maskExpression[cursor + 2] &&
                    multi) {
                    cursor += 3;
                    result += inputSymbol;
                }
                else if (this.maskExpression[cursor + 1] === '?' &&
                    this._findSpecialChar(this.maskExpression[cursor + 2]) &&
                    this._findSpecialChar(inputSymbol) === this.maskExpression[cursor + 2] &&
                    multi) {
                    cursor += 3;
                    result += inputSymbol;
                }
                else if (this.showMaskTyped &&
                    this.maskSpecialCharacters.indexOf(inputSymbol) < 0 &&
                    inputSymbol !== this.placeHolderCharacter) {
                    stepBack = true;
                }
            }
        }
        if (result.length + 1 === maskExpression.length &&
            this.maskSpecialCharacters.indexOf(maskExpression[maskExpression.length - 1]) !== -1) {
            result += maskExpression[maskExpression.length - 1];
        }
        let newPosition = position + 1;
        while (this._shift.has(newPosition)) {
            shift++;
            newPosition++;
        }
        let actualShift = justPasted ? cursor : this._shift.has(position) ? shift : 0;
        if (stepBack) {
            actualShift--;
        }
        cb(actualShift, backspaceShift);
        if (shift < 0) {
            this._shift.clear();
        }
        let onlySpecial = false;
        if (backspaced) {
            onlySpecial = inputArray.every((char) => this.maskSpecialCharacters.includes(char));
        }
        let res = `${this.prefix}${onlySpecial ? '' : result}${this.suffix}`;
        if (result.length === 0) {
            res = `${this.prefix}${result}`;
        }
        return res;
    }
    _findSpecialChar(inputSymbol) {
        return this.maskSpecialCharacters.find((val) => val === inputSymbol);
    }
    _checkSymbolMask(inputSymbol, maskSymbol) {
        this.maskAvailablePatterns = this.customPattern ? this.customPattern : this.maskAvailablePatterns;
        return (this.maskAvailablePatterns[maskSymbol] &&
            this.maskAvailablePatterns[maskSymbol].pattern &&
            this.maskAvailablePatterns[maskSymbol].pattern.test(inputSymbol));
    }
    _stripToDecimal(str) {
        return str
            .split('')
            .filter((i, idx) => {
            return (i.match('^-?\\d') ||
                i.match('\\s') ||
                i === '.' ||
                i === ',' ||
                (i === '-' && idx === 0 && this.allowNegativeNumbers));
        })
            .join('');
    }
    _charToRegExpExpression(char) {
        if (char) {
            const charsToEscape = '[\\^$.|?*+()';
            return char === ' ' ? '\\s' : charsToEscape.indexOf(char) >= 0 ? '\\' + char : char;
        }
        return char;
    }
    _shiftStep(maskExpression, cursor, inputLength) {
        const shiftStep = /[*?]/g.test(maskExpression.slice(0, cursor)) ? inputLength : cursor;
        this._shift.add(shiftStep + this.prefix.length || 0);
    }
}
MaskApplierService.decorators = [
    { type: Injectable }
];
MaskApplierService.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [config,] }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFzay1hcHBsaWVyLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtbWFzay1saWIvc3JjL2xpYi9tYXNrLWFwcGxpZXIuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNuRCxPQUFPLEVBQUUsTUFBTSxFQUFXLE1BQU0sVUFBVSxDQUFDO0FBRzNDLE1BQU0sT0FBTyxrQkFBa0I7SUEwQjdCLFlBQTZDLE9BQWdCO1FBQWhCLFlBQU8sR0FBUCxPQUFPLENBQVM7UUFyQnRELG1CQUFjLEdBQVcsRUFBRSxDQUFDO1FBQzVCLGdCQUFXLEdBQVcsRUFBRSxDQUFDO1FBQ3pCLHdCQUFtQixHQUFXLEVBQUUsQ0FBQztRQTJZaEMsMEJBQXFCLEdBQUcsQ0FDOUIsR0FBVyxFQUNYLHFCQUE2QixFQUM3QixXQUFtQixFQUNuQixTQUFpQixFQUNqQixFQUFFO1lBQ0YsTUFBTSxDQUFDLEdBQWEsR0FBRyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUMzQyxNQUFNLFFBQVEsR0FBVyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxXQUFXLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUNyRSxJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkIsTUFBTSxjQUFjLEdBQVcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3RFLElBQUksY0FBYyxJQUFJLENBQUMsY0FBYyxFQUFFO2dCQUNyQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUU7b0JBQ2xCLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FB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LFNBQVM7NEJBQzdELENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDOzRCQUN2RCxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUc7NEJBQzlCLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLFdBQVcsSUFBSSxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO3dCQUNqRywwQ0FBMEM7d0JBQzFDLE1BQU0sY0FBYyxHQUNsQixNQUFNLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVM7NEJBQzVELENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDOzRCQUN2RCxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDOzRCQUNuRCxNQUFNLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDO3dCQUM3RCw2Q0FBNkM7d0JBQzdDLE1BQU0sY0FBYyxHQUNsQixNQUFNLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLFNBQVM7NEJBQzdELENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxD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Y3QsIEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IGNvbmZpZywgSUNvbmZpZyB9IGZyb20gJy4vY29uZmlnJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE1hc2tBcHBsaWVyU2VydmljZSB7XG4gIHB1YmxpYyBkcm9wU3BlY2lhbENoYXJhY3RlcnM6IElDb25maWdbJ2Ryb3BTcGVjaWFsQ2hhcmFjdGVycyddO1xuICBwdWJsaWMgaGlkZGVuSW5wdXQ6IElDb25maWdbJ2hpZGRlbklucHV0J107XG4gIHB1YmxpYyBzaG93VGVtcGxhdGUhOiBJQ29uZmlnWydzaG93VGVtcGxhdGUnXTtcbiAgcHVibGljIGNsZWFySWZOb3RNYXRjaCE6IElDb25maWdbJ2NsZWFySWZOb3RNYXRjaCddO1xuICBwdWJsaWMgbWFza0V4cHJlc3Npb246IHN0cmluZyA9ICcnO1xuICBwdWJsaWMgYWN0dWFsVmFsdWU6IHN0cmluZyA9ICcnO1xuICBwdWJsaWMgc2hvd25NYXNrRXhwcmVzc2lvbjogc3RyaW5nID0gJyc7XG4gIHB1YmxpYyBtYXNrU3BlY2lhbENoYXJhY3RlcnMhOiBJQ29uZmlnWydzcGVjaWFsQ2hhcmFjdGVycyddO1xuICBwdWJsaWMgbWFza0F2YWlsYWJsZVBhdHRlcm5zITogSUNvbmZpZ1sncGF0dGVybnMnXTtcbiAgcHVibGljIHByZWZpeCE6IElDb25maWdbJ3ByZWZpeCddO1xuICBwdWJsaWMgc3VmZml4ITogSUNvbmZpZ1snc3VmZml4J107XG4gIHB1YmxpYyB0aG91c2FuZFNlcGFyYXRvciE6IElDb25maWdbJ3Rob3VzYW5kU2VwYXJhdG9yJ107XG4gIHB1YmxpYyBkZWNpbWFsTWFya2VyITogSUNvbmZpZ1snZGVjaW1hbE1hcmtlciddO1xuICBwdWJsaWMgY3VzdG9tUGF0dGVybiE6IElDb25maWdbJ3BhdHRlcm5zJ107XG4gIHB1YmxpYyBpcEVycm9yPzogYm9vbGVhbjtcbiAgcHVibGljIGNwZkNucGpFcnJvcj86IGJvb2xlYW47XG4gIHB1YmxpYyBzaG93TWFza1R5cGVkITogSUNvbmZpZ1snc2hvd01hc2tUeXBlZCddO1xuICBwdWJsaWMgcGxhY2VIb2xkZXJDaGFyYWN0ZXIhOiBJQ29uZmlnWydwbGFjZUhvbGRlckNoYXJhY3RlciddO1xuICBwdWJsaWMgdmFsaWRhdGlvbjogSUNvbmZpZ1sndmFsaWRhdGlvbiddO1xuICBwdWJsaWMgc2VwYXJhdG9yTGltaXQ6IElDb25maWdbJ3NlcGFyYXRvckxpbWl0J107XG4gIHB1YmxpYyBhbGxvd05lZ2F0aXZlTnVtYmVyczogSUNvbmZpZ1snYWxsb3dOZWdhdGl2ZU51bWJlcnMnXTtcbiAgcHVibGljIGxlYWRaZXJvRGF0ZVRpbWU6IElDb25maWdbJ2xlYWRaZXJvRGF0ZVRpbWUnXTtcblxuICBwcml2YXRlIF9zaGlmdCE6IFNldDxudW1iZXI+O1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihASW5qZWN0KGNvbmZpZykgcHJvdGVjdGVkIF9jb25maWc6IElDb25maWcpIHtcbiAgICB0aGlzLl9zaGlmdCA9IG5ldyBTZXQoKTtcbiAgICB0aGlzLmNsZWFySWZOb3RNYXRjaCA9IHRoaXMuX2NvbmZpZy5jbGVhcklmTm90TWF0Y2g7XG4gICAgdGhpcy5kcm9wU3BlY2lhbENoYXJhY3RlcnMgPSB0aGlzLl9jb25maWcuZHJvcFNwZWNpYWxDaGFyYWN0ZXJzO1xuICAgIHRoaXMubWFza1NwZWNpYWxDaGFyYWN0ZXJzID0gdGhpcy5fY29uZmlnLnNwZWNpYWxDaGFyYWN0ZXJzO1xuICAgIHRoaXMubWFza0F2YWlsYWJsZVBhdHRlcm5zID0gdGhpcy5fY29uZmlnLnBhdHRlcm5zO1xuICAgIHRoaXMucHJlZml4ID0gdGhpcy5fY29uZmlnLnByZWZpeDtcbiAgICB0aGlzLnN1ZmZpeCA9IHRoaXMuX2NvbmZpZy5zdWZmaXg7XG4gICAgdGhpcy50aG91c2FuZFNlcGFyYXRvciA9IHRoaXMuX2NvbmZpZy50aG91c2FuZFNlcGFyYXRvcjtcbiAgICB0aGlzLmRlY2ltYWxNYXJrZXIgPSB0aGlzLl9jb25maWcuZGVjaW1hbE1hcmtlcjtcbiAgICB0aGlzLmhpZGRlbklucHV0ID0gdGhpcy5fY29uZmlnLmhpZGRlbklucHV0O1xuICAgIHRoaXMuc2hvd01hc2tUeXBlZCA9IHRoaXMuX2NvbmZpZy5zaG93TWFza1R5cGVkO1xuICAgIHRoaXMucGxhY2VIb2xkZXJDaGFyYWN0ZXIgPSB0aGlzLl9jb25maWcucGxhY2VIb2xkZXJDaGFyYWN0ZXI7XG4gICAgdGhpcy52YWxpZGF0aW9uID0gdGhpcy5fY29uZmlnLnZhbGlkYXRpb247XG4gICAgdGhpcy5zZXBhcmF0b3JMaW1pdCA9IHRoaXMuX2NvbmZpZy5zZXBhcmF0b3JMaW1pdDtcbiAgICB0aGlzLmFsbG93TmVnYXRpdmVOdW1iZXJzID0gdGhpcy5fY29uZmlnLmFsbG93TmVnYXRpdmVOdW1iZXJzO1xuICAgIHRoaXMubGVhZFplcm9EYXRlVGltZSA9IHRoaXMuX2NvbmZpZy5sZWFkWmVyb0RhdGVUaW1lO1xuICB9XG5cbiAgcHVibGljIGFwcGx5TWFza1dpdGhQYXR0ZXJuKGlucHV0VmFsdWU6IHN0cmluZywgbWFza0FuZFBhdHRlcm46IFtzdHJpbmcsIElDb25maWdbJ3BhdHRlcm5zJ11dKTogc3RyaW5nIHtcbiAgICBjb25zdCBbbWFzaywgY3VzdG9tUGF0dGVybl0gPSBtYXNrQW5kUGF0dGVybjtcbiAgICB0aGlzLmN1c3RvbVBhdHRlcm4gPSBjdXN0b21QYXR0ZXJuO1xuICAgIHJldHVybiB0aGlzLmFwcGx5TWFzayhpbnB1dFZhbHVlLCBtYXNrKTtcbiAgfVxuXG4gIHB1YmxpYyBhcHBseU1hc2soXG4gICAgaW5wdXRWYWx1ZTogc3RyaW5nLFxuICAgIG1hc2tFeHByZXNzaW9uOiBzdHJpbmcsXG4gICAgcG9zaXRpb246IG51bWJlciA9IDAsXG4gICAganVzdFBhc3RlZDogYm9vbGVhbiA9IGZhbHNlLFxuICAgIGJhY2tzcGFjZWQ6IGJvb2xlYW4gPSBmYWxzZSxcbiAgICBjYjogRnVuY3Rpb24gPSAoKSA9PiB7fVxuICApOiBzdHJpbmcge1xuICAgIGlmIChpbnB1dFZhbHVlID09PSB1bmRlZmluZWQgfHwgaW5wdXRWYWx1ZSA9PT0gbnVsbCB8fCBtYXNrRXhwcmVzc2lvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIGxldCBjdXJzb3IgPSAwO1xuICAgIGxldCByZXN1bHQgPSAnJztcbiAgICBsZXQgbXVsdGkgPSBmYWxzZTtcbiAgICBsZXQgYmFja3NwYWNlU2hpZnQgPSBmYWxzZTtcbiAgICBsZXQgc2hpZnQgPSAxO1xuICAgIGxldCBzdGVwQmFjayA9IGZhbHNlO1xuICAgIGlmIChpbnB1dFZhbHVlLnNsaWNlKDAsIHRoaXMucHJlZml4Lmxlbmd0aCkgPT09IHRoaXMucHJlZml4KSB7XG4gICAgICBpbnB1dFZhbHVlID0gaW5wdXRWYWx1ZS5zbGljZSh0aGlzLnByZWZpeC5sZW5ndGgsIGlucHV0VmFsdWUubGVuZ3RoKTtcbiAgICB9XG4gICAgaWYgKCEhdGhpcy5zdWZmaXggJiYgaW5wdXRWYWx1ZT8ubGVuZ3RoID4gMCkge1xuICAgICAgaW5wdXRWYWx1ZSA9IHRoaXMuY2hlY2tBbmRSZW1vdmVTdWZmaXgoaW5wdXRWYWx1ZSk7XG4gICAgfVxuICAgIGNvbnN0IGlucHV0QXJyYXk6IHN0cmluZ1tdID0gaW5wdXRWYWx1ZS50b1N0cmluZygpLnNwbGl0KCcnKTtcbiAgICBpZiAobWFza0V4cHJlc3Npb24gPT09ICdJUCcpIHtcbiAgICAgIHRoaXMuaXBFcnJvciA9ICEhKGlucHV0QXJyYXkuZmlsdGVyKChpOiBzdHJpbmcpID0+IGkgPT09ICcuJykubGVuZ3RoIDwgMyAmJiBpbnB1dEFycmF5Lmxlbmd0aCA8IDcpO1xuICAgICAgbWFza0V4cHJlc3Npb24gPSAnMDk5LjA5OS4wOTkuMDk5JztcbiAgICB9XG4gICAgY29uc3QgYXJyOiBzdHJpbmdbXSA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5wdXRWYWx1ZS5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGlucHV0VmFsdWVbaV0ubWF0Y2goJ1xcXFxkJykpIHtcbiAgICAgICAgYXJyLnB1c2goaW5wdXRWYWx1ZVtpXSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChtYXNrRXhwcmVzc2lvbiA9PT0gJ0NQRl9DTlBKJykge1xuICAgICAgdGhpcy5jcGZDbnBqRXJyb3IgPSAhIShhcnIubGVuZ3RoICE9PSAxMSAmJiBhcnIubGVuZ3RoICE9PSAxNCk7XG4gICAgICBpZiAoYXJyLmxlbmd0aCA+IDExKSB7XG4gICAgICAgIG1hc2tFeHByZXNzaW9uID0gJzAwLjAwMC4wMDAvMDAwMC0wMCc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtYXNrRXhwcmVzc2lvbiA9ICcwMDAuMDAwLjAwMC0wMCc7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChtYXNrRXhwcmVzc2lvbi5zdGFydHNXaXRoKCdwZXJjZW50JykpIHtcbiAgICAgIGlmIChpbnB1dFZhbHVlLm1hdGNoKCdbYS16XXxbQS1aXScpIHx8IGlucHV0VmFsdWUubWF0Y2goL1stISQlXiYqKClfK3x+PWB7fVxcW1xcXTpcIjsnPD4/LFxcLy5dLykpIHtcbiAgICAgICAgaW5wdXRWYWx1ZSA9IHRoaXMuX3N0cmlwVG9EZWNpbWFsKGlucHV0VmFsdWUpO1xuICAgICAgICBjb25zdCBwcmVjaXNpb246IG51bWJlciA9IHRoaXMuZ2V0UHJlY2lzaW9uKG1hc2tFeHByZXNzaW9uKTtcbiAgICAgICAgaW5wdXRWYWx1ZSA9IHRoaXMuY2hlY2tJbnB1dFByZWNpc2lvbihpbnB1dFZhbHVlLCBwcmVjaXNpb24sIHRoaXMuZGVjaW1hbE1hcmtlcik7XG4gICAgICB9XG4gICAgICBpZiAoaW5wdXRWYWx1ZS5pbmRleE9mKCcuJykgPiAwICYmICF0aGlzLnBlcmNlbnRhZ2UoaW5wdXRWYWx1ZS5zdWJzdHJpbmcoMCwgaW5wdXRWYWx1ZS5pbmRleE9mKCcuJykpKSkge1xuICAgICAgICBjb25zdCBiYXNlOiBzdHJpbmcgPSBpbnB1dFZhbHVlLnN1YnN0cmluZygwLCBpbnB1dFZhbHVlLmluZGV4T2YoJy4nKSAtIDEpO1xuICAgICAgICBpbnB1dFZhbHVlID0gYCR7YmFzZX0ke2lucHV0VmFsdWUuc3Vic3RyaW5nKGlucHV0VmFsdWUuaW5kZXhPZignLicpLCBpbnB1dFZhbHVlLmxlbmd0aCl9YDtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnBlcmNlbnRhZ2UoaW5wdXRWYWx1ZSkpIHtcbiAgICAgICAgcmVzdWx0ID0gaW5wdXRWYWx1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdCA9IGlucHV0VmFsdWUuc3Vic3RyaW5nKDAsIGlucHV0VmFsdWUubGVuZ3RoIC0gMSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChtYXNrRXhwcmVzc2lvbi5zdGFydHNXaXRoKCdzZXBhcmF0b3InKSkge1xuICAgICAgaWYgKFxuICAgICAgICBpbnB1dFZhbHVlLm1hdGNoKCdbd9CwLdGP0JAt0K9dJykgfHxcbiAgICAgICAgaW5wdXRWYWx1ZS5tYXRjaCgnW9CB0ZHQkC3Rj10nKSB8fFxuICAgICAgICBpbnB1dFZhbHVlLm1hdGNoKCdbYS16XXxbQS1aXScpIHx8XG4gICAgICAgIGlucHV0VmFsdWUubWF0Y2goL1stQCMhJCVcXFxcXiYqKClfwqPCrCcrfH49YHt9XFxbXFxdOlwiOzw+Lj9cXC9dLykgfHxcbiAgICAgICAgaW5wdXRWYWx1ZS5tYXRjaCgnW15BLVphLXowLTksXScpXG4gICAgICApIHtcbiAgICAgICAgaW5wdXRWYWx1ZSA9IHRoaXMuX3N0cmlwVG9EZWNpbWFsKGlucHV0VmFsdWUpO1xuICAgICAgfVxuXG4gICAgICBpbnB1dFZhbHVlID1cbiAgICAgICAgaW5wdXRWYWx1ZS5sZW5ndGggPiAxICYmIGlucHV0VmFsdWVbMF0gPT09ICcwJyAmJiBpbnB1dFZhbHVlWzFdICE9PSB0aGlzLmRlY2ltYWxNYXJrZXIgJiYgIWJhY2tzcGFjZWRcbiAgICAgICAgICA/IGlucHV0VmFsdWUuc2xpY2UoMSwgaW5wdXRWYWx1ZS5sZW5ndGgpXG4gICAgICAgICAgOiBpbnB1dFZhbHVlO1xuXG4gICAgICAvLyBUT0RPOiB3ZSBoYWQgZGlmZmVyZW50IHJleGV4cHMgaGVyZSBmb3IgdGhlIGRpZmZlcmVudCBjYXNlcy4uLiBidXQgdGVzdHMgZG9udCBzZWFtIHRvIGJvdGhlciAtIGNoZWNrIHRoaXNcbiAgICAgIC8vICBzZXBhcmF0b3I6IG5vIENPTU1BLCBkb3Qtc2VwOiBubyBTUEFDRSwgQ09NTUEgT0ssIGNvbW1hLXNlcDogbm8gU1BBQ0UsIENPTU1BIE9LXG5cbiAgICAgIGNvbnN0IHRob3VzYW5kU2VwZXJhdG9yQ2hhckVzY2FwZWQ6IHN0cmluZyA9IHRoaXMuX2NoYXJUb1JlZ0V4cEV4cHJlc3Npb24odGhpcy50aG91c2FuZFNlcGFyYXRvcik7XG4gICAgICBjb25zdCBkZWNpbWFsTWFya2VyRXNjYXBlZDogc3RyaW5nID0gdGhpcy5fY2hhclRvUmVnRXhwRXhwcmVzc2lvbih0aGlzLmRlY2ltYWxNYXJrZXIpO1xuICAgICAgY29uc3QgaW52YWxpZENoYXJzOiBzdHJpbmcgPSAnQCMhJCVeJiooKV8rfH49YHt9XFxcXFtcXFxcXTpcXFxccyxcXFxcLlwiOzw+P1xcXFwvJ1xuICAgICAgICAucmVwbGFjZSh0aG91c2FuZFNlcGVyYXRvckNoYXJFc2NhcGVkLCAnJylcbiAgICAgICAgLnJlcGxhY2UoZGVjaW1hbE1hcmtlckVzY2FwZWQsICcnKTtcblxuICAgICAgY29uc3QgaW52YWxpZENoYXJSZWdleHA6IFJlZ0V4cCA9IG5ldyBSZWdFeHAoJ1snICsgaW52YWxpZENoYXJzICsgJ10nKTtcblxuICAgICAgaWYgKGlucHV0VmFsdWUubWF0Y2goaW52YWxpZENoYXJSZWdleHApKSB7XG4gICAgICAgIGlucHV0VmFsdWUgPSBpbnB1dFZhbHVlLnN1YnN0cmluZygwLCBpbnB1dFZhbHVlLmxlbmd0aCAtIDEpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBwcmVjaXNpb246IG51bWJlciA9IHRoaXMuZ2V0UHJlY2lzaW9uKG1hc2tFeHByZXNzaW9uKTtcbiAgICAgIGlucHV0VmFsdWUgPSB0aGlzLmNoZWNrSW5wdXRQcmVjaXNpb24oaW5wdXRWYWx1ZSwgcHJlY2lzaW9uLCB0aGlzLmRlY2ltYWxNYXJrZXIpO1xuICAgICAgY29uc3Qgc3RyRm9yU2VwOiBzdHJpbmcgPSBpbnB1dFZhbHVlLnJlcGxhY2UobmV3IFJlZ0V4cCh0aG91c2FuZFNlcGVyYXRvckNoYXJFc2NhcGVkLCAnZycpLCAnJyk7XG4gICAgICByZXN1bHQgPSB0aGlzLl9mb3JtYXRXaXRoU2VwYXJhdG9ycyhzdHJGb3JTZXAsIHRoaXMudGhvdXNhbmRTZXBhcmF0b3IsIHRoaXMuZGVjaW1hbE1hcmtlciwgcHJlY2lzaW9uKTtcblxuICAgICAgY29uc3QgY29tbWFTaGlmdDogbnVtYmVyID0gcmVzdWx0LmluZGV4T2YoJywnKSAtIGlucHV0VmFsdWUuaW5kZXhPZignLCcpO1xuICAgICAgY29uc3Qgc2hpZnRTdGVwOiBudW1iZXIgPSByZXN1bHQubGVuZ3RoIC0gaW5wdXRWYWx1ZS5sZW5ndGg7XG5cbiAgICAgIGlmIChzaGlmdFN0ZXAgPiAwICYmIHJlc3VsdFtwb3NpdGlvbl0gIT09ICcsJykge1xuICAgICAgICBiYWNrc3BhY2VTaGlmdCA9IHRydWU7XG4gICAgICAgIGxldCBfc2hpZnQgPSAwO1xuICAgICAgICBkbyB7XG4gICAgICAgICAgdGhpcy5fc2hpZnQuYWRkKHBvc2l0aW9uICsgX3NoaWZ0KTtcbiAgICAgICAgICBfc2hpZnQrKztcbiAgICAgICAgfSB3aGlsZSAoX3NoaWZ0IDwgc2hpZnRTdGVwKTtcbiAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgIChjb21tYVNoaWZ0ICE9PSAwICYmIHBvc2l0aW9uID4gMCAmJiAhKHJlc3VsdC5pbmRleE9mKCcsJykgPj0gcG9zaXRpb24gJiYgcG9zaXRpb24gPiAzKSkgfHxcbiAgICAgICAgKCEocmVzdWx0LmluZGV4T2YoJy4nKSA+PSBwb3NpdGlvbiAmJiBwb3NpdGlvbiA+IDMpICYmIHNoaWZ0U3RlcCA8PSAwKVxuICAgICAgKSB7XG4gICAgICAgIHRoaXMuX3NoaWZ0LmNsZWFyKCk7XG4gICAgICAgIGJhY2tzcGFjZVNoaWZ0ID0gdHJ1ZTtcbiAgICAgICAgc2hpZnQgPSBzaGlmdFN0ZXA7XG4gICAgICAgIHBvc2l0aW9uICs9IHNoaWZ0U3RlcDtcbiAgICAgICAgdGhpcy5fc2hpZnQuYWRkKHBvc2l0aW9uKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3NoaWZ0LmNsZWFyKCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAoXG4gICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZVxuICAgICAgICBsZXQgaTogbnVtYmVyID0gMCwgaW5wdXRTeW1ib2w6IHN0cmluZyA9IGlucHV0QXJyYXlbMF07XG4gICAgICAgIGkgPCBpbnB1dEFycmF5Lmxlbmd0aDtcbiAgICAgICAgaSsrLCBpbnB1dFN5bWJvbCA9IGlucHV0QXJyYXlbaV1cbiAgICAgICkge1xuICAgICAgICBpZiAoY3Vyc29yID09PSBtYXNrRXhwcmVzc2lvbi5sZW5ndGgpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5fY2hlY2tTeW1ib2xNYXNrKGlucHV0U3ltYm9sLCBtYXNrRXhwcmVzc2lvbltjdXJzb3JdKSAmJiBtYXNrRXhwcmVzc2lvbltjdXJzb3IgKyAxXSA9PT0gJz8nKSB7XG4gICAgICAgICAgcmVzdWx0ICs9IGlucHV0U3ltYm9sO1xuICAgICAgICAgIGN1cnNvciArPSAyO1xuICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgIG1hc2tFeHByZXNzaW9uW2N1cnNvciArIDFdID09PSAnKicgJiZcbiAgICAgICAgICBtdWx0aSAmJlxuICAgICAgICAgIHRoaXMuX2NoZWNrU3ltYm9sTWFzayhpbnB1dFN5bWJvbCwgbWFza0V4cHJlc3Npb25bY3Vyc29yICsgMl0pXG4gICAgICAgICkge1xuICAgICAgICAgIHJlc3VsdCArPSBpbnB1dFN5bWJvbDtcbiAgICAgICAgICBjdXJzb3IgKz0gMztcbiAgICAgICAgICBtdWx0aSA9IGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2NoZWNrU3ltYm9sTWFzayhpbnB1dFN5bWJvbCwgbWFza0V4cHJlc3Npb25bY3Vyc29yXSkgJiYgbWFza0V4cHJlc3Npb25bY3Vyc29yICsgMV0gPT09ICcqJykge1xuICAgICAgICAgIHJlc3VsdCArPSBpbnB1dFN5bWJvbDtcbiAgICAgICAgICBtdWx0aSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgbWFza0V4cHJlc3Npb25bY3Vyc29yICsgMV0gPT09ICc/JyAmJlxuICAgICAgICAgIHRoaXMuX2NoZWNrU3ltYm9sTWFzayhpbnB1dFN5bWJvbCwgbWFza0V4cHJlc3Npb25bY3Vyc29yICsgMl0pXG4gICAgICAgICkge1xuICAgICAgICAgIHJlc3VsdCArPSBpbnB1dFN5bWJvbDtcbiAgICAgICAgICBjdXJzb3IgKz0gMztcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9jaGVja1N5bWJvbE1hc2soaW5wdXRTeW1ib2wsIG1hc2tFeHByZXNzaW9uW2N1cnNvcl0pKSB7XG4gICAgICAgICAgaWYgKG1hc2tFeHByZXNzaW9uW2N1cnNvcl0gPT09ICdIJykge1xuICAgICAgICAgICAgaWYgKE51bWJlcihpbnB1dFN5bWJvbCkgPiAyKSB7XG4gICAgICAgICAgICAgIGN1cnNvciArPSAxO1xuICAgICAgICAgICAgICB0aGlzLl9zaGlmdFN0ZXAobWFza0V4cHJlc3Npb24sIGN1cnNvciwgaW5wdXRBcnJheS5sZW5ndGgpO1xuICAgICAgICAgICAgICBpLS07XG4gICAgICAgICAgICAgIGlmICh0aGlzLmxlYWRaZXJvRGF0ZVRpbWUpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gJzAnO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAobWFza0V4cHJlc3Npb25bY3Vyc29yXSA9PT0gJ2gnKSB7XG4gICAgICAgICAgICBpZiAocmVzdWx0ID09PSAnMicgJiYgTnVtYmVyKGlucHV0U3ltYm9sKSA+IDMpIHtcbiAgICAgICAgICAgICAgY3Vyc29yICs9IDE7XG4gICAgICAgICAgICAgIGktLTtcbiAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChtYXNrRXhwcmVzc2lvbltjdXJzb3JdID09PSAnbScpIHtcbiAgICAgICAgICAgIGlmIChOdW1iZXIoaW5wdXRTeW1ib2wpID4gNSkge1xuICAgICAgICAgICAgICBjdXJzb3IgKz0gMTtcbiAgICAgICAgICAgICAgdGhpcy5fc2hpZnRTdGVwKG1hc2tFeHByZXNzaW9uLCBjdXJzb3IsIGlucHV0QXJyYXkubGVuZ3RoKTtcbiAgICAgICAgICAgICAgaS0tO1xuICAgICAgICAgICAgICBpZiAodGhpcy5sZWFkWmVyb0RhdGVUaW1lKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9ICcwJztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKG1hc2tFeHByZXNzaW9uW2N1cnNvcl0gPT09ICdzJykge1xuICAgICAgICAgICAgaWYgKE51bWJlcihpbnB1dFN5bWJvbCkgPiA1KSB7XG4gICAgICAgICAgICAgIGN1cnNvciArPSAxO1xuICAgICAgICAgICAgICB0aGlzLl9zaGlmdFN0ZXAobWFza0V4cHJlc3Npb24sIGN1cnNvciwgaW5wdXRBcnJheS5sZW5ndGgpO1xuICAgICAgICAgICAgICBpLS07XG4gICAgICAgICAgICAgIGlmICh0aGlzLmxlYWRaZXJvRGF0ZVRpbWUpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gJzAnO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBkYXlzQ291bnQgPSAzMTtcbiAgICAgICAgICBpZiAobWFza0V4cHJlc3Npb25bY3Vyc29yXSA9PT0gJ2QnKSB7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgIChOdW1iZXIoaW5wdXRTeW1ib2wpID4gMyAmJiB0aGlzLmxlYWRaZXJvRGF0ZVRpbWUpIHx8XG4gICAgICAgICAgICAgIE51bWJlcihpbnB1dFZhbHVlLnNsaWNlKGN1cnNvciwgY3Vyc29yICsgMikpID4gZGF5c0NvdW50IHx8XG4gICAgICAgICAgICAgIGlucHV0VmFsdWVbY3Vyc29yICsgMV0gPT09ICcvJ1xuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgIGN1cnNvciArPSAxO1xuICAgICAgICAgICAgICB0aGlzLl9zaGlmdFN0ZXAobWFza0V4cHJlc3Npb24sIGN1cnNvciwgaW5wdXRBcnJheS5sZW5ndGgpO1xuICAgICAgICAgICAgICBpLS07XG4gICAgICAgICAgICAgIGlmICh0aGlzLmxlYWRaZXJvRGF0ZVRpbWUpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gJzAnO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAobWFza0V4cHJlc3Npb25bY3Vyc29yXSA9PT0gJ00nKSB7XG4gICAgICAgICAgICBjb25zdCBtb250aHNDb3VudCA9IDEyO1xuICAgICAgICAgICAgLy8gbWFzayB3aXRob3V0IGRheVxuICAgICAgICAgICAgY29uc3Qgd2l0aG91dERheXM6IGJvb2xlYW4gPVxuICAgICAgICAgICAgICBjdXJzb3IgPT09IDAgJiZcbiAgICAgICAgICAgICAgKE51bWJlcihpbnB1dFN5bWJvbCkgPiAyIHx8XG4gICAgICAgICAgICAgICAgTnVtYmVyKGlucHV0VmFsdWUuc2xpY2UoY3Vyc29yLCBjdXJzb3IgKyAyKSkgPiBtb250aHNDb3VudCB8fFxuICAgICAgICAgICAgICAgIGlucHV0VmFsdWVbY3Vyc29yICsgMV0gPT09ICcvJyk7XG4gICAgICAgICAgICAvLyBkYXk8MTAgJiYgbW9udGg8MTIgZm9yIGlucHV0XG4gICAgICAgICAgICBjb25zdCBkYXkxbW9udGhJbnB1dDogYm9vbGVhbiA9XG4gICAgICAgICAgICAgIGlucHV0VmFsdWUuc2xpY2UoY3Vyc29yIC0gMywgY3Vyc29yIC0gMSkuaW5jbHVkZXMoJy8nKSAmJlxuICAgICAgICAgICAgICAoKGlucHV0VmFsdWVbY3Vyc29yIC0gMl0gPT09ICcvJyAmJlxuICAgICAgICAgICAgICAgIE51bWJlcihpbnB1dFZhbHVlLnNsaWNlKGN1cnNvciAtIDEsIGN1cnNvciArIDEpKSA+IG1vbnRoc0NvdW50ICYmXG4gICAgICAgICAgICAgICAgaW5wdXRWYWx1ZVtjdXJzb3JdICE9PSAnLycpIHx8XG4gICAgICAgICAgICAgICAgaW5wdXRWYWx1ZVtjdXJzb3JdID09PSAnLycgfHxcbiAgICAgICAgICAgICAgICAoaW5wdXRWYWx1ZVtjdXJzb3IgLSAzXSA9PT0gJy8nICYmXG4gICAgICAgICAgICAgICAgICBOdW1iZXIoaW5wdXRWYWx1ZS5zbGljZShjdXJzb3IgLSAyLCBjdXJzb3IpKSA+IG1vbnRoc0NvdW50ICYmXG4gICAgICAgICAgICAgICAgICBpbnB1dFZhbHVlW2N1cnNvciAtIDFdICE9PSAnLycpIHx8XG4gICAgICAgICAgICAgICAgaW5wdXRWYWx1ZVtjdXJzb3IgLSAxXSA9PT0gJy8nKTtcbiAgICAgICAgICAgIC8vIDEwPGRheTwzMSAmJiBtb250aDwxMiBmb3IgaW5wdXRcbiAgICAgICAgICAgIGNvbnN0IGRheTJtb250aElucHV0OiBib29sZWFuID1cbiAgICAgICAgICAgICAgTnVtYmVyKGlucHV0VmFsdWUuc2xpY2UoY3Vyc29yIC0gMywgY3Vyc29yIC0gMSkpIDw9IGRheXNDb3VudCAmJlxuICAgICAgICAgICAgICAhaW5wdXRWYWx1ZS5zbGljZShjdXJzb3IgLSAzLCBjdXJzb3IgLSAxKS5pbmNsdWRlcygnLycpICYmXG4gICAgICAgICAgICAgIGlucHV0VmFsdWVbY3Vyc29yIC0gMV0gPT09ICcvJyAmJlxuICAgICAgICAgICAgICAoTnVtYmVyKGlucHV0VmFsdWUuc2xpY2UoY3Vyc29yLCBjdXJzb3IgKyAyKSkgPiBtb250aHNDb3VudCB8fCBpbnB1dFZhbHVlW2N1cnNvciArIDFdID09PSAnLycpO1xuICAgICAgICAgICAgLy8gZGF5PDEwICYmIG1vbnRoPDEyIGZvciBwYXN0ZSB3aG9sZSBkYXRhXG4gICAgICAgICAgICBjb25zdCBkYXkxbW9udGhQYXN0ZTogYm9vbGVhbiA9XG4gICAgICAgICAgICAgIE51bWJlcihpbnB1dFZhbHVlLnNsaWNlKGN1cnNvciAtIDMsIGN1cnNvciAtIDEpKSA+IGRheXNDb3VudCAmJlxuICAgICAgICAgICAgICAhaW5wdXRWYWx1ZS5zbGljZShjdXJzb3IgLSAzLCBjdXJzb3IgLSAxKS5pbmNsdWRlcygnLycpICYmXG4gICAgICAgICAgICAgICFpbnB1dFZhbHVlLnNsaWNlKGN1cnNvciAtIDIsIGN1cnNvcikuaW5jbHVkZXMoJy8nKSAmJlxuICAgICAgICAgICAgICBOdW1iZXIoaW5wdXRWYWx1ZS5zbGljZShjdXJzb3IgLSAyLCBjdXJzb3IpKSA+IG1vbnRoc0NvdW50O1xuICAgICAgICAgICAgLy8gMTA8ZGF5PDMxICYmIG1vbnRoPDEyIGZvciBwYXN0ZSB3aG9sZSBkYXRhXG4gICAgICAgICAgICBjb25zdCBkYXkybW9udGhQYXN0ZTogYm9vbGVhbiA9XG4gICAgICAgICAgICAgIE51bWJlcihpbnB1dFZhbHVlLnNsaWNlKGN1cnNvciAtIDMsIGN1cnNvciAtIDEpKSA8PSBkYXlzQ291bnQgJiZcbiAgICAgICAgICAgICAgIWlucHV0VmFsdWUuc2xpY2UoY3Vyc29yIC0gMywgY3Vyc29yIC0gMSkuaW5jbHVkZXMoJy8nKSAmJlxuICAgICAgICAgICAgICBpbnB1dFZhbHVlW2N1cnNvciAtIDFdICE9PSAnLycgJiZcbiAgICAgICAgICAgICAgTnVtYmVyKGlucHV0VmFsdWUuc2xpY2UoY3Vyc29yIC0gMSwgY3Vyc29yICsgMSkpID4gbW9udGhzQ291bnQ7XG5cbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgKE51bWJlcihpbnB1dFN5bWJvbCkgPiAxICYmIHRoaXMubGVhZFplcm9EYXRlVGltZSkgfHxcbiAgICAgICAgICAgICAgd2l0aG91dERheXMgfHxcbiAgICAgICAgICAgICAgZGF5MW1vbnRoSW5wdXQgfHxcbiAgICAgICAgICAgICAgZGF5Mm1vbnRoSW5wdXQgfHxcbiAgICAgICAgICAgICAgZGF5MW1vbnRoUGFzdGUgfHxcbiAgICAgICAgICAgICAgZGF5Mm1vbnRoUGFzdGVcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICBjdXJzb3IgKz0gMTtcbiAgICAgICAgICAgICAgdGhpcy5fc2hpZnRTdGVwKG1hc2tFeHByZXNzaW9uLCBjdXJzb3IsIGlucHV0QXJyYXkubGVuZ3RoKTtcbiAgICAgICAgICAgICAgaS0tO1xuICAgICAgICAgICAgICBpZiAodGhpcy5sZWFkWmVyb0RhdGVUaW1lKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9ICcwJztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmVzdWx0ICs9IGlucHV0U3ltYm9sO1xuICAgICAgICAgIGN1cnNvcisrO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMubWFza1NwZWNpYWxDaGFyYWN0ZXJzLmluZGV4T2YobWFza0V4cHJlc3Npb25bY3Vyc29yXSkgIT09IC0xKSB7XG4gICAgICAgICAgcmVzdWx0ICs9IG1hc2tFeHByZXNzaW9uW2N1cnNvcl07XG4gICAgICAgICAgY3Vyc29yKys7XG4gICAgICAgICAgdGhpcy5fc2hpZnRTdGVwKG1hc2tFeHByZXNzaW9uLCBjdXJzb3IsIGlucHV0QXJyYXkubGVuZ3RoKTtcbiAgICAgICAgICBpLS07XG4gICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgdGhpcy5tYXNrU3BlY2lhbENoYXJhY3RlcnMuaW5kZXhPZihpbnB1dFN5bWJvbCkgPiAtMSAmJlxuICAgICAgICAgIHRoaXMubWFza0F2YWlsYWJsZVBhdHRlcm5zW21hc2tFeHByZXNzaW9uW2N1cnNvcl1dICYmXG4gICAgICAgICAgdGhpcy5tYXNrQXZhaWxhYmxlUGF0dGVybnNbbWFza0V4cHJlc3Npb25bY3Vyc29yXV0ub3B0aW9uYWxcbiAgICAgICAgKSB7XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgISFpbnB1dEFycmF5W2N1cnNvcl0gJiZcbiAgICAgICAgICAgIG1hc2tFeHByZXNzaW9uICE9PSAnMDk5LjA5OS4wOTkuMDk5JyAmJlxuICAgICAgICAgICAgbWFza0V4cHJlc3Npb24gIT09ICcwMDAuMDAwLjAwMC0wMCcgJiZcbiAgICAgICAgICAgIG1hc2tFeHByZXNzaW9uICE9PSAnMDAuMDAwLjAwMC8wMDAwLTAwJ1xuICAgICAgICAgICkge1xuICAgICAgICAgICAgcmVzdWx0ICs9IGlucHV0QXJyYXlbY3Vyc29yXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY3Vyc29yKys7XG4gICAgICAgICAgaS0tO1xuICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgIHRoaXMubWFza0V4cHJlc3Npb25bY3Vyc29yICsgMV0gPT09ICcqJyAmJlxuICAgICAgICAgIHRoaXMuX2ZpbmRTcGVjaWFsQ2hhcih0aGlzLm1hc2tFeHByZXNzaW9uW2N1cnNvciArIDJdKSAmJlxuICAgICAgICAgIHRoaXMuX2ZpbmRTcGVjaWFsQ2hhcihpbnB1dFN5bWJvbCkgPT09IHRoaXMubWFza0V4cHJlc3Npb25bY3Vyc29yICsgMl0gJiZcbiAgICAgICAgICBtdWx0aVxuICAgICAgICApIHtcbiAgICAgICAgICBjdXJzb3IgKz0gMztcbiAgICAgICAgICByZXN1bHQgKz0gaW5wdXRTeW1ib2w7XG4gICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgdGhpcy5tYXNrRXhwcmVzc2lvbltjdXJzb3IgKyAxXSA9PT0gJz8nICYmXG4gICAgICAgICAgdGhpcy5fZmluZFNwZWNpYWxDaGFyKHRoaXMubWFza0V4cHJlc3Npb25bY3Vyc29yICsgMl0pICYmXG4gICAgICAgICAgdGhpcy5fZmluZFNwZWNpYWxDaGFyKGlucHV0U3ltYm9sKSA9PT0gdGhpcy5tYXNrRXhwcmVzc2lvbltjdXJzb3IgKyAyXSAmJlxuICAgICAgICAgIG11bHRpXG4gICAgICAgICkge1xuICAgICAgICAgIGN1cnNvciArPSAzO1xuICAgICAgICAgIHJlc3VsdCArPSBpbnB1dFN5bWJvbDtcbiAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICB0aGlzLnNob3dNYXNrVHlwZWQgJiZcbiAgICAgICAgICB0aGlzLm1hc2tTcGVjaWFsQ2hhcmFjdGVycy5pbmRleE9mKGlucHV0U3ltYm9sKSA8IDAgJiZcbiAgICAgICAgICBpbnB1dFN5bWJvbCAhPT0gdGhpcy5wbGFjZUhvbGRlckNoYXJhY3RlclxuICAgICAgICApIHtcbiAgICAgICAgICBzdGVwQmFjayA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKFxuICAgICAgcmVzdWx0Lmxlbmd0aCArIDEgPT09IG1hc2tFeHByZXNzaW9uLmxlbmd0aCAmJlxuICAgICAgdGhpcy5tYXNrU3BlY2lhbENoYXJhY3RlcnMuaW5kZXhPZihtYXNrRXhwcmVzc2lvblttYXNrRXhwcmVzc2lvbi5sZW5ndGggLSAxXSkgIT09IC0xXG4gICAgKSB7XG4gICAgICByZXN1bHQgKz0gbWFza0V4cHJlc3Npb25bbWFza0V4cHJlc3Npb24ubGVuZ3RoIC0gMV07XG4gICAgfVxuXG4gICAgbGV0IG5ld1Bvc2l0aW9uOiBudW1iZXIgPSBwb3NpdGlvbiArIDE7XG5cbiAgICB3aGlsZSAodGhpcy5fc2hpZnQuaGFzKG5ld1Bvc2l0aW9uKSkge1xuICAgICAgc2hpZnQrKztcbiAgICAgIG5ld1Bvc2l0aW9uKys7XG4gICAgfVxuXG4gICAgbGV0IGFjdHVhbFNoaWZ0OiBudW1iZXIgPSBqdXN0UGFzdGVkID8gY3Vyc29yIDogdGhpcy5fc2hpZnQuaGFzKHBvc2l0aW9uKSA/IHNoaWZ0IDogMDtcbiAgICBpZiAoc3RlcEJhY2spIHtcbiAgICAgIGFjdHVhbFNoaWZ0LS07XG4gICAgfVxuXG4gICAgY2IoYWN0dWFsU2hpZnQsIGJhY2tzcGFjZVNoaWZ0KTtcbiAgICBpZiAoc2hpZnQgPCAwKSB7XG4gICAgICB0aGlzLl9zaGlmdC5jbGVhcigpO1xuICAgIH1cbiAgICBsZXQgb25seVNwZWNpYWwgPSBmYWxzZTtcbiAgICBpZiAoYmFja3NwYWNlZCkge1xuICAgICAgb25seVNwZWNpYWwgPSBpbnB1dEFycmF5LmV2ZXJ5KChjaGFyKSA9PiB0aGlzLm1hc2tTcGVjaWFsQ2hhcmFjdGVycy5pbmNsdWRlcyhjaGFyKSk7XG4gICAgfVxuICAgIGxldCByZXMgPSBgJHt0aGlzLnByZWZpeH0ke29ubHlTcGVjaWFsID8gJycgOiByZXN1bHR9JHt0aGlzLnN1ZmZpeH1gO1xuICAgIGlmIChyZXN1bHQubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXMgPSBgJHt0aGlzLnByZWZpeH0ke3Jlc3VsdH1gO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgcHVibGljIF9maW5kU3BlY2lhbENoYXIoaW5wdXRTeW1ib2w6IHN0cmluZyk6IHVuZGVmaW5lZCB8IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMubWFza1NwZWNpYWxDaGFyYWN0ZXJzLmZpbmQoKHZhbDogc3RyaW5nKSA9PiB2YWwgPT09IGlucHV0U3ltYm9sKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBfY2hlY2tTeW1ib2xNYXNrKGlucHV0U3ltYm9sOiBzdHJpbmcsIG1hc2tTeW1ib2w6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHRoaXMubWFza0F2YWlsYWJsZVBhdHRlcm5zID0gdGhpcy5jdXN0b21QYXR0ZXJuID8gdGhpcy5jdXN0b21QYXR0ZXJuIDogdGhpcy5tYXNrQXZhaWxhYmxlUGF0dGVybnM7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMubWFza0F2YWlsYWJsZVBhdHRlcm5zW21hc2tTeW1ib2xdICYmXG4gICAgICB0aGlzLm1hc2tBdmFpbGFibGVQYXR0ZXJuc1ttYXNrU3ltYm9sXS5wYXR0ZXJuICYmXG4gICAgICB0aGlzLm1hc2tBdmFpbGFibGVQYXR0ZXJuc1ttYXNrU3ltYm9sXS5wYXR0ZXJuLnRlc3QoaW5wdXRTeW1ib2wpXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgX2Zvcm1hdFdpdGhTZXBhcmF0b3JzID0gKFxuICAgIHN0cjogc3RyaW5nLFxuICAgIHRob3VzYW5kU2VwYXJhdG9yQ2hhcjogc3RyaW5nLFxuICAgIGRlY2ltYWxDaGFyOiBzdHJpbmcsXG4gICAgcHJlY2lzaW9uOiBudW1iZXJcbiAgKSA9PiB7XG4gICAgY29uc3QgeDogc3RyaW5nW10gPSBzdHIuc3BsaXQoZGVjaW1hbENoYXIpO1xuICAgIGNvbnN0IGRlY2ltYWxzOiBzdHJpbmcgPSB4Lmxlbmd0aCA+IDEgPyBgJHtkZWNpbWFsQ2hhcn0ke3hbMV19YCA6ICcnO1xuICAgIGxldCByZXM6IHN0cmluZyA9IHhbMF07XG4gICAgY29uc3Qgc2VwYXJhdG9yTGltaXQ6IHN0cmluZyA9IHRoaXMuc2VwYXJhdG9yTGltaXQucmVwbGFjZSgvXFxzL2csICcnKTtcbiAgICBpZiAoc2VwYXJhdG9yTGltaXQgJiYgK3NlcGFyYXRvckxpbWl0KSB7XG4gICAgICBpZiAocmVzWzBdID09PSAnLScpIHtcbiAgICAgICAgcmVzID0gYC0ke3Jlcy5zbGljZSgxLCByZXMubGVuZ3RoKS5zbGljZSgwLCBzZXBhcmF0b3JMaW1pdC5sZW5ndGgpfWA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXMgPSByZXMuc2xpY2UoMCwgc2VwYXJhdG9yTGltaXQubGVuZ3RoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3Qgcmd4OiBSZWdFeHAgPSAvKFxcZCspKFxcZHszfSkvO1xuXG4gICAgd2hpbGUgKHRob3VzYW5kU2VwYXJhdG9yQ2hhciAmJiByZ3gudGVzdChyZXMpKSB7XG4gICAgICByZXMgPSByZXMucmVwbGFjZShyZ3gsICckMScgKyB0aG91c2FuZFNlcGFyYXRvckNoYXIgKyAnJDInKTtcbiAgICB9XG5cbiAgICBpZiAocHJlY2lzaW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiByZXMgKyBkZWNpbWFscztcbiAgICB9IGVsc2UgaWYgKHByZWNpc2lvbiA9PT0gMCkge1xuICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG4gICAgcmV0dXJuIHJlcyArIGRlY2ltYWxzLnN1YnN0cigwLCBwcmVjaXNpb24gKyAxKTtcbiAgfTtcblxuICBwcml2YXRlIHBlcmNlbnRhZ2UgPSAoc3RyOiBzdHJpbmcpOiBib29sZWFuID0+IHtcbiAgICByZXR1cm4gTnVtYmVyKHN0cikgPj0gMCAmJiBOdW1iZXIoc3RyKSA8PSAxMDA7XG4gIH07XG5cbiAgcHJpdmF0ZSBnZXRQcmVjaXNpb24gPSAobWFza0V4cHJlc3Npb246IHN0cmluZyk6IG51bWJlciA9PiB7XG4gICAgY29uc3QgeDogc3RyaW5nW10gPSBtYXNrRXhwcmVzc2lvbi5zcGxpdCgnLicpO1xuICAgIGlmICh4Lmxlbmd0aCA+IDEpIHtcbiAgICAgIHJldHVybiBOdW1iZXIoeFt4Lmxlbmd0aCAtIDFdKTtcbiAgICB9XG5cbiAgICByZXR1cm4gSW5maW5pdHk7XG4gIH07XG5cbiAgcHJpdmF0ZSBjaGVja0FuZFJlbW92ZVN1ZmZpeCA9IChpbnB1dFZhbHVlOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuICAgIGZvciAobGV0IGkgPSB0aGlzLnN1ZmZpeD8ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIGNvbnN0IHN1YnN0ciA9IHRoaXMuc3VmZml4LnN1YnN0cihpLCB0aGlzLnN1ZmZpeD8ubGVuZ3RoKTtcbiAgICAgIGlmIChcbiAgICAgICAgaW5wdXRWYWx1ZS5pbmNsdWRlcyhzdWJzdHIpICYmXG4gICAgICAgIChpIC0gMSA8IDAgfHwgIWlucHV0VmFsdWUuaW5jbHVkZXModGhpcy5zdWZmaXguc3Vic3RyKGkgLSAxLCB0aGlzLnN1ZmZpeD8ubGVuZ3RoKSkpXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuIGlucHV0VmFsdWUucmVwbGFjZShzdWJzdHIsICcnKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGlucHV0VmFsdWU7XG4gIH07XG5cbiAgcHJpdmF0ZSBjaGVja0lucHV0UHJlY2lzaW9uID0gKFxuICAgIGlucHV0VmFsdWU6IHN0cmluZyxcbiAgICBwcmVjaXNpb246IG51bWJlcixcbiAgICBkZWNpbWFsTWFya2VyOiBJQ29uZmlnWydkZWNpbWFsTWFya2VyJ11cbiAgKTogc3RyaW5nID0+IHtcbiAgICBpZiAocHJlY2lzaW9uIDwgSW5maW5pdHkpIHtcbiAgICAgIGNvbnN0IHByZWNpc2lvblJlZ0V4OiBSZWdFeHAgPSBuZXcgUmVnRXhwKHRoaXMuX2NoYXJUb1JlZ0V4cEV4cHJlc3Npb24oZGVjaW1hbE1hcmtlcikgKyBgXFxcXGR7JHtwcmVjaXNpb259fS4qJGApO1xuXG4gICAgICBjb25zdCBwcmVjaXNpb25NYXRjaDogUmVnRXhwTWF0Y2hBcnJheSB8IG51bGwgPSBpbnB1dFZhbHVlLm1hdGNoKHByZWNpc2lvblJlZ0V4KTtcbiAgICAgIGlmIChwcmVjaXNpb25NYXRjaCAmJiBwcmVjaXNpb25NYXRjaFswXS5sZW5ndGggLSAxID4gcHJlY2lzaW9uKSB7XG4gICAgICAgIGNvbnN0IGRpZmYgPSBwcmVjaXNpb25NYXRjaFswXS5sZW5ndGggLSAxIC0gcHJlY2lzaW9uO1xuICAgICAgICBpbnB1dFZhbHVlID0gaW5wdXRWYWx1ZS5zdWJzdHJpbmcoMCwgaW5wdXRWYWx1ZS5sZW5ndGggLSBkaWZmKTtcbiAgICAgIH1cbiAgICAgIGlmIChwcmVjaXNpb24gPT09IDAgJiYgaW5wdXRWYWx1ZS5lbmRzV2l0aChkZWNpbWFsTWFya2VyKSkge1xuICAgICAgICBpbnB1dFZhbHVlID0gaW5wdXRWYWx1ZS5zdWJzdHJpbmcoMCwgaW5wdXRWYWx1ZS5sZW5ndGggLSAxKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGlucHV0VmFsdWU7XG4gIH07XG5cbiAgcHJpdmF0ZSBfc3RyaXBUb0RlY2ltYWwoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBzdHJcbiAgICAgIC5zcGxpdCgnJylcbiAgICAgIC5maWx0ZXIoKGk6IHN0cmluZywgaWR4OiBudW1iZXIpID0+IHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICBpLm1hdGNoKCdeLT9cXFxcZCcpIHx8XG4gICAgICAgICAgaS5tYXRjaCgnXFxcXHMnKSB8fFxuICAgICAgICAgIGkgPT09ICcuJyB8fFxuICAgICAgICAgIGkgPT09ICcsJyB8fFxuICAgICAgICAgIChpID09PSAnLScgJiYgaWR4ID09PSAwICYmIHRoaXMuYWxsb3dOZWdhdGl2ZU51bWJlcnMpXG4gICAgICAgICk7XG4gICAgICB9KVxuICAgICAgLmpvaW4oJycpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY2hhclRvUmVnRXhwRXhwcmVzc2lvbihjaGFyOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmIChjaGFyKSB7XG4gICAgICBjb25zdCBjaGFyc1RvRXNjYXBlID0gJ1tcXFxcXiQufD8qKygpJztcbiAgICAgIHJldHVybiBjaGFyID09PSAnICcgPyAnXFxcXHMnIDogY2hhcnNUb0VzY2FwZS5pbmRleE9mKGNoYXIpID49IDAgPyAnXFxcXCcgKyBjaGFyIDogY2hhcjtcbiAgICB9XG4gICAgcmV0dXJuIGNoYXI7XG4gIH1cblxuICBwcml2YXRlIF9zaGlmdFN0ZXAobWFza0V4cHJlc3Npb246IHN0cmluZywgY3Vyc29yOiBudW1iZXIsIGlucHV0TGVuZ3RoOiBudW1iZXIpIHtcbiAgICBjb25zdCBzaGlmdFN0ZXA6IG51bWJlciA9IC9bKj9dL2cudGVzdChtYXNrRXhwcmVzc2lvbi5zbGljZSgwLCBjdXJzb3IpKSA/IGlucHV0TGVuZ3RoIDogY3Vyc29yO1xuICAgIHRoaXMuX3NoaWZ0LmFkZChzaGlmdFN0ZXAgKyB0aGlzLnByZWZpeC5sZW5ndGggfHwgMCk7XG4gIH1cbn1cbiJdfQ==