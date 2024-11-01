/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { getLocaleNumberFormat, getLocaleNumberSymbol, getNumberOfCurrencyDigits, NumberFormatStyle, NumberSymbol, } from './locale_data_api';
export const NUMBER_FORMAT_REGEXP = /^(\d+)?\.((\d+)(-(\d+))?)?$/;
const MAX_DIGITS = 22;
const DECIMAL_SEP = '.';
const ZERO_CHAR = '0';
const PATTERN_SEP = ';';
const GROUP_SEP = ',';
const DIGIT_CHAR = '#';
const CURRENCY_CHAR = '¤';
const PERCENT_CHAR = '%';
/**
 * Transforms a number to a locale string based on a style and a format.
 */
function formatNumberToLocaleString(value, pattern, locale, groupSymbol, decimalSymbol, digitsInfo, isPercent = false) {
    let formattedText = '';
    let isZero = false;
    if (!isFinite(value)) {
        formattedText = getLocaleNumberSymbol(locale, NumberSymbol.Infinity);
    }
    else {
        let parsedNumber = parseNumber(value);
        if (isPercent) {
            parsedNumber = toPercent(parsedNumber);
        }
        let minInt = pattern.minInt;
        let minFraction = pattern.minFrac;
        let maxFraction = pattern.maxFrac;
        if (digitsInfo) {
            const parts = digitsInfo.match(NUMBER_FORMAT_REGEXP);
            if (parts === null) {
                throw new Error(`${digitsInfo} is not a valid digit info`);
            }
            const minIntPart = parts[1];
            const minFractionPart = parts[3];
            const maxFractionPart = parts[5];
            if (minIntPart != null) {
                minInt = parseIntAutoRadix(minIntPart);
            }
            if (minFractionPart != null) {
                minFraction = parseIntAutoRadix(minFractionPart);
            }
            if (maxFractionPart != null) {
                maxFraction = parseIntAutoRadix(maxFractionPart);
            }
            else if (minFractionPart != null && minFraction > maxFraction) {
                maxFraction = minFraction;
            }
        }
        roundNumber(parsedNumber, minFraction, maxFraction);
        let digits = parsedNumber.digits;
        let integerLen = parsedNumber.integerLen;
        const exponent = parsedNumber.exponent;
        let decimals = [];
        isZero = digits.every((d) => !d);
        // pad zeros for small numbers
        for (; integerLen < minInt; integerLen++) {
            digits.unshift(0);
        }
        // pad zeros for small numbers
        for (; integerLen < 0; integerLen++) {
            digits.unshift(0);
        }
        // extract decimals digits
        if (integerLen > 0) {
            decimals = digits.splice(integerLen, digits.length);
        }
        else {
            decimals = digits;
            digits = [0];
        }
        // format the integer digits with grouping separators
        const groups = [];
        if (digits.length >= pattern.lgSize) {
            groups.unshift(digits.splice(-pattern.lgSize, digits.length).join(''));
        }
        while (digits.length > pattern.gSize) {
            groups.unshift(digits.splice(-pattern.gSize, digits.length).join(''));
        }
        if (digits.length) {
            groups.unshift(digits.join(''));
        }
        formattedText = groups.join(getLocaleNumberSymbol(locale, groupSymbol));
        // append the decimal digits
        if (decimals.length) {
            formattedText += getLocaleNumberSymbol(locale, decimalSymbol) + decimals.join('');
        }
        if (exponent) {
            formattedText += getLocaleNumberSymbol(locale, NumberSymbol.Exponential) + '+' + exponent;
        }
    }
    if (value < 0 && !isZero) {
        formattedText = pattern.negPre + formattedText + pattern.negSuf;
    }
    else {
        formattedText = pattern.posPre + formattedText + pattern.posSuf;
    }
    return formattedText;
}
/**
 * @ngModule CommonModule
 * @description
 *
 * Formats a number as currency using locale rules.
 *
 * @param value The number to format.
 * @param locale A locale code for the locale format rules to use.
 * @param currency A string containing the currency symbol or its name,
 * such as "$" or "Canadian Dollar". Used in output string, but does not affect the operation
 * of the function.
 * @param currencyCode The [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217)
 * currency code, such as `USD` for the US dollar and `EUR` for the euro.
 * Used to determine the number of digits in the decimal part.
 * @param digitsInfo Decimal representation options, specified by a string in the following format:
 * `{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}`. See `DecimalPipe` for more details.
 *
 * @returns The formatted currency value.
 *
 * @see {@link formatNumber}
 * @see {@link DecimalPipe}
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 */
export function formatCurrency(value, locale, currency, currencyCode, digitsInfo) {
    const format = getLocaleNumberFormat(locale, NumberFormatStyle.Currency);
    const pattern = parseNumberFormat(format, getLocaleNumberSymbol(locale, NumberSymbol.MinusSign));
    pattern.minFrac = getNumberOfCurrencyDigits(currencyCode);
    pattern.maxFrac = pattern.minFrac;
    const res = formatNumberToLocaleString(value, pattern, locale, NumberSymbol.CurrencyGroup, NumberSymbol.CurrencyDecimal, digitsInfo);
    return (res
        .replace(CURRENCY_CHAR, currency)
        // if we have 2 time the currency character, the second one is ignored
        .replace(CURRENCY_CHAR, '')
        // If there is a spacing between currency character and the value and
        // the currency character is suppressed by passing an empty string, the
        // spacing character would remain as part of the string. Then we
        // should remove it.
        .trim());
}
/**
 * @ngModule CommonModule
 * @description
 *
 * Formats a number as a percentage according to locale rules.
 *
 * @param value The number to format.
 * @param locale A locale code for the locale format rules to use.
 * @param digitsInfo Decimal representation options, specified by a string in the following format:
 * `{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}`. See `DecimalPipe` for more details.
 *
 * @returns The formatted percentage value.
 *
 * @see {@link formatNumber}
 * @see {@link DecimalPipe}
 * @see [Internationalization (i18n) Guide](guide/i18n)
 * @publicApi
 *
 */
export function formatPercent(value, locale, digitsInfo) {
    const format = getLocaleNumberFormat(locale, NumberFormatStyle.Percent);
    const pattern = parseNumberFormat(format, getLocaleNumberSymbol(locale, NumberSymbol.MinusSign));
    const res = formatNumberToLocaleString(value, pattern, locale, NumberSymbol.Group, NumberSymbol.Decimal, digitsInfo, true);
    return res.replace(new RegExp(PERCENT_CHAR, 'g'), getLocaleNumberSymbol(locale, NumberSymbol.PercentSign));
}
/**
 * @ngModule CommonModule
 * @description
 *
 * Formats a number as text, with group sizing, separator, and other
 * parameters based on the locale.
 *
 * @param value The number to format.
 * @param locale A locale code for the locale format rules to use.
 * @param digitsInfo Decimal representation options, specified by a string in the following format:
 * `{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}`. See `DecimalPipe` for more details.
 *
 * @returns The formatted text string.
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 */
export function formatNumber(value, locale, digitsInfo) {
    const format = getLocaleNumberFormat(locale, NumberFormatStyle.Decimal);
    const pattern = parseNumberFormat(format, getLocaleNumberSymbol(locale, NumberSymbol.MinusSign));
    return formatNumberToLocaleString(value, pattern, locale, NumberSymbol.Group, NumberSymbol.Decimal, digitsInfo);
}
function parseNumberFormat(format, minusSign = '-') {
    const p = {
        minInt: 1,
        minFrac: 0,
        maxFrac: 0,
        posPre: '',
        posSuf: '',
        negPre: '',
        negSuf: '',
        gSize: 0,
        lgSize: 0,
    };
    const patternParts = format.split(PATTERN_SEP);
    const positive = patternParts[0];
    const negative = patternParts[1];
    const positiveParts = positive.indexOf(DECIMAL_SEP) !== -1
        ? positive.split(DECIMAL_SEP)
        : [
            positive.substring(0, positive.lastIndexOf(ZERO_CHAR) + 1),
            positive.substring(positive.lastIndexOf(ZERO_CHAR) + 1),
        ], integer = positiveParts[0], fraction = positiveParts[1] || '';
    p.posPre = integer.substring(0, integer.indexOf(DIGIT_CHAR));
    for (let i = 0; i < fraction.length; i++) {
        const ch = fraction.charAt(i);
        if (ch === ZERO_CHAR) {
            p.minFrac = p.maxFrac = i + 1;
        }
        else if (ch === DIGIT_CHAR) {
            p.maxFrac = i + 1;
        }
        else {
            p.posSuf += ch;
        }
    }
    const groups = integer.split(GROUP_SEP);
    p.gSize = groups[1] ? groups[1].length : 0;
    p.lgSize = groups[2] || groups[1] ? (groups[2] || groups[1]).length : 0;
    if (negative) {
        const trunkLen = positive.length - p.posPre.length - p.posSuf.length, pos = negative.indexOf(DIGIT_CHAR);
        p.negPre = negative.substring(0, pos).replace(/'/g, '');
        p.negSuf = negative.slice(pos + trunkLen).replace(/'/g, '');
    }
    else {
        p.negPre = minusSign + p.posPre;
        p.negSuf = p.posSuf;
    }
    return p;
}
// Transforms a parsed number into a percentage by multiplying it by 100
function toPercent(parsedNumber) {
    // if the number is 0, don't do anything
    if (parsedNumber.digits[0] === 0) {
        return parsedNumber;
    }
    // Getting the current number of decimals
    const fractionLen = parsedNumber.digits.length - parsedNumber.integerLen;
    if (parsedNumber.exponent) {
        parsedNumber.exponent += 2;
    }
    else {
        if (fractionLen === 0) {
            parsedNumber.digits.push(0, 0);
        }
        else if (fractionLen === 1) {
            parsedNumber.digits.push(0);
        }
        parsedNumber.integerLen += 2;
    }
    return parsedNumber;
}
/**
 * Parses a number.
 * Significant bits of this parse algorithm came from https://github.com/MikeMcl/big.js/
 */
function parseNumber(num) {
    let numStr = Math.abs(num) + '';
    let exponent = 0, digits, integerLen;
    let i, j, zeros;
    // Decimal point?
    if ((integerLen = numStr.indexOf(DECIMAL_SEP)) > -1) {
        numStr = numStr.replace(DECIMAL_SEP, '');
    }
    // Exponential form?
    if ((i = numStr.search(/e/i)) > 0) {
        // Work out the exponent.
        if (integerLen < 0)
            integerLen = i;
        integerLen += +numStr.slice(i + 1);
        numStr = numStr.substring(0, i);
    }
    else if (integerLen < 0) {
        // There was no decimal point or exponent so it is an integer.
        integerLen = numStr.length;
    }
    // Count the number of leading zeros.
    for (i = 0; numStr.charAt(i) === ZERO_CHAR; i++) {
        /* empty */
    }
    if (i === (zeros = numStr.length)) {
        // The digits are all zero.
        digits = [0];
        integerLen = 1;
    }
    else {
        // Count the number of trailing zeros
        zeros--;
        while (numStr.charAt(zeros) === ZERO_CHAR)
            zeros--;
        // Trailing zeros are insignificant so ignore them
        integerLen -= i;
        digits = [];
        // Convert string to array of digits without leading/trailing zeros.
        for (j = 0; i <= zeros; i++, j++) {
            digits[j] = Number(numStr.charAt(i));
        }
    }
    // If the number overflows the maximum allowed digits then use an exponent.
    if (integerLen > MAX_DIGITS) {
        digits = digits.splice(0, MAX_DIGITS - 1);
        exponent = integerLen - 1;
        integerLen = 1;
    }
    return { digits, exponent, integerLen };
}
/**
 * Round the parsed number to the specified number of decimal places
 * This function changes the parsedNumber in-place
 */
function roundNumber(parsedNumber, minFrac, maxFrac) {
    if (minFrac > maxFrac) {
        throw new Error(`The minimum number of digits after fraction (${minFrac}) is higher than the maximum (${maxFrac}).`);
    }
    let digits = parsedNumber.digits;
    let fractionLen = digits.length - parsedNumber.integerLen;
    const fractionSize = Math.min(Math.max(minFrac, fractionLen), maxFrac);
    // The index of the digit to where rounding is to occur
    let roundAt = fractionSize + parsedNumber.integerLen;
    let digit = digits[roundAt];
    if (roundAt > 0) {
        // Drop fractional digits beyond `roundAt`
        digits.splice(Math.max(parsedNumber.integerLen, roundAt));
        // Set non-fractional digits beyond `roundAt` to 0
        for (let j = roundAt; j < digits.length; j++) {
            digits[j] = 0;
        }
    }
    else {
        // We rounded to zero so reset the parsedNumber
        fractionLen = Math.max(0, fractionLen);
        parsedNumber.integerLen = 1;
        digits.length = Math.max(1, (roundAt = fractionSize + 1));
        digits[0] = 0;
        for (let i = 1; i < roundAt; i++)
            digits[i] = 0;
    }
    if (digit >= 5) {
        if (roundAt - 1 < 0) {
            for (let k = 0; k > roundAt; k--) {
                digits.unshift(0);
                parsedNumber.integerLen++;
            }
            digits.unshift(1);
            parsedNumber.integerLen++;
        }
        else {
            digits[roundAt - 1]++;
        }
    }
    // Pad out with zeros to get the required fraction length
    for (; fractionLen < Math.max(0, fractionSize); fractionLen++)
        digits.push(0);
    let dropTrailingZeros = fractionSize !== 0;
    // Minimal length = nb of decimals required + current nb of integers
    // Any number besides that is optional and can be removed if it's a trailing 0
    const minLen = minFrac + parsedNumber.integerLen;
    // Do any carrying, e.g. a digit was rounded up to 10
    const carry = digits.reduceRight(function (carry, d, i, digits) {
        d = d + carry;
        digits[i] = d < 10 ? d : d - 10; // d % 10
        if (dropTrailingZeros) {
            // Do not keep meaningless fractional trailing zeros (e.g. 15.52000 --> 15.52)
            if (digits[i] === 0 && i >= minLen) {
                digits.pop();
            }
            else {
                dropTrailingZeros = false;
            }
        }
        return d >= 10 ? 1 : 0; // Math.floor(d / 10);
    }, 0);
    if (carry) {
        digits.unshift(carry);
        parsedNumber.integerLen++;
    }
}
export function parseIntAutoRadix(text) {
    const result = parseInt(text);
    if (isNaN(result)) {
        throw new Error('Invalid integer literal when parsing ' + text);
    }
    return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0X251bWJlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvaTE4bi9mb3JtYXRfbnVtYmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFDTCxxQkFBcUIsRUFDckIscUJBQXFCLEVBQ3JCLHlCQUF5QixFQUN6QixpQkFBaUIsRUFDakIsWUFBWSxHQUNiLE1BQU0sbUJBQW1CLENBQUM7QUFFM0IsTUFBTSxDQUFDLE1BQU0sb0JBQW9CLEdBQUcsNkJBQTZCLENBQUM7QUFDbEUsTUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFDO0FBQ3RCLE1BQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQztBQUN4QixNQUFNLFNBQVMsR0FBRyxHQUFHLENBQUM7QUFDdEIsTUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDO0FBQ3hCLE1BQU0sU0FBUyxHQUFHLEdBQUcsQ0FBQztBQUN0QixNQUFNLFVBQVUsR0FBRyxHQUFHLENBQUM7QUFDdkIsTUFBTSxhQUFhLEdBQUcsR0FBRyxDQUFDO0FBQzFCLE1BQU0sWUFBWSxHQUFHLEdBQUcsQ0FBQztBQUV6Qjs7R0FFRztBQUNILFNBQVMsMEJBQTBCLENBQ2pDLEtBQWEsRUFDYixPQUEyQixFQUMzQixNQUFjLEVBQ2QsV0FBeUIsRUFDekIsYUFBMkIsRUFDM0IsVUFBbUIsRUFDbkIsU0FBUyxHQUFHLEtBQUs7SUFFakIsSUFBSSxhQUFhLEdBQUcsRUFBRSxDQUFDO0lBQ3ZCLElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQztJQUVuQixJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDckIsYUFBYSxHQUFHLHFCQUFxQixDQUFDLE1BQU0sRUFBRSxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDdkUsQ0FBQztTQUFNLENBQUM7UUFDTixJQUFJLFlBQVksR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFdEMsSUFBSSxTQUFTLEVBQUUsQ0FBQztZQUNkLFlBQVksR0FBRyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDekMsQ0FBQztRQUVELElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFDNUIsSUFBSSxXQUFXLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQztRQUNsQyxJQUFJLFdBQVcsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDO1FBRWxDLElBQUksVUFBVSxFQUFFLENBQUM7WUFDZixNQUFNLEtBQUssR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFDckQsSUFBSSxLQUFLLEtBQUssSUFBSSxFQUFFLENBQUM7Z0JBQ25CLE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxVQUFVLDRCQUE0QixDQUFDLENBQUM7WUFDN0QsQ0FBQztZQUNELE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1QixNQUFNLGVBQWUsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakMsTUFBTSxlQUFlLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pDLElBQUksVUFBVSxJQUFJLElBQUksRUFBRSxDQUFDO2dCQUN2QixNQUFNLEdBQUcsaUJBQWlCLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDekMsQ0FBQztZQUNELElBQUksZUFBZSxJQUFJLElBQUksRUFBRSxDQUFDO2dCQUM1QixXQUFXLEdBQUcsaUJBQWlCLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDbkQsQ0FBQztZQUNELElBQUksZUFBZSxJQUFJLElBQUksRUFBRSxDQUFDO2dCQUM1QixXQUFXLEdBQUcsaUJBQWlCLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDbkQsQ0FBQztpQkFBTSxJQUFJLGVBQWUsSUFBSSxJQUFJLElBQUksV0FBVyxHQUFHLFdBQVcsRUFBRSxDQUFDO2dCQUNoRSxXQUFXLEdBQUcsV0FBVyxDQUFDO1lBQzVCLENBQUM7UUFDSCxDQUFDO1FBRUQsV0FBVyxDQUFDLFlBQVksRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFFcEQsSUFBSSxNQUFNLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQztRQUNqQyxJQUFJLFVBQVUsR0FBRyxZQUFZLENBQUMsVUFBVSxDQUFDO1FBQ3pDLE1BQU0sUUFBUSxHQUFHLFlBQVksQ0FBQyxRQUFRLENBQUM7UUFDdkMsSUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLE1BQU0sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRWpDLDhCQUE4QjtRQUM5QixPQUFPLFVBQVUsR0FBRyxNQUFNLEVBQUUsVUFBVSxFQUFFLEVBQUUsQ0FBQztZQUN6QyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BCLENBQUM7UUFFRCw4QkFBOEI7UUFDOUIsT0FBTyxVQUFVLEdBQUcsQ0FBQyxFQUFFLFVBQVUsRUFBRSxFQUFFLENBQUM7WUFDcEMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwQixDQUFDO1FBRUQsMEJBQTBCO1FBQzFCLElBQUksVUFBVSxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQ25CLFFBQVEsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdEQsQ0FBQzthQUFNLENBQUM7WUFDTixRQUFRLEdBQUcsTUFBTSxDQUFDO1lBQ2xCLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2YsQ0FBQztRQUVELHFEQUFxRDtRQUNyRCxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDbEIsSUFBSSxNQUFNLENBQUMsTUFBTSxJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNwQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN6RSxDQUFDO1FBRUQsT0FBTyxNQUFNLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNyQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN4RSxDQUFDO1FBRUQsSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDbEIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDbEMsQ0FBQztRQUVELGFBQWEsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBRXhFLDRCQUE0QjtRQUM1QixJQUFJLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNwQixhQUFhLElBQUkscUJBQXFCLENBQUMsTUFBTSxFQUFFLGFBQWEsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDcEYsQ0FBQztRQUVELElBQUksUUFBUSxFQUFFLENBQUM7WUFDYixhQUFhLElBQUkscUJBQXFCLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQyxXQUFXLENBQUMsR0FBRyxHQUFHLEdBQUcsUUFBUSxDQUFDO1FBQzVGLENBQUM7SUFDSCxDQUFDO0lBRUQsSUFBSSxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDekIsYUFBYSxHQUFHLE9BQU8sQ0FBQyxNQUFNLEdBQUcsYUFBYSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7SUFDbEUsQ0FBQztTQUFNLENBQUM7UUFDTixhQUFhLEdBQUcsT0FBTyxDQUFDLE1BQU0sR0FBRyxhQUFhLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztJQUNsRSxDQUFDO0lBRUQsT0FBTyxhQUFhLENBQUM7QUFDdkIsQ0FBQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F3Qkc7QUFDSCxNQUFNLFVBQVUsY0FBYyxDQUM1QixLQUFhLEVBQ2IsTUFBYyxFQUNkLFFBQWdCLEVBQ2hCLFlBQXFCLEVBQ3JCLFVBQW1CO0lBRW5CLE1BQU0sTUFBTSxHQUFHLHFCQUFxQixDQUFDLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN6RSxNQUFNLE9BQU8sR0FBRyxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUscUJBQXFCLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0lBRWpHLE9BQU8sQ0FBQyxPQUFPLEdBQUcseUJBQXlCLENBQUMsWUFBYSxDQUFDLENBQUM7SUFDM0QsT0FBTyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDO0lBRWxDLE1BQU0sR0FBRyxHQUFHLDBCQUEwQixDQUNwQyxLQUFLLEVBQ0wsT0FBTyxFQUNQLE1BQU0sRUFDTixZQUFZLENBQUMsYUFBYSxFQUMxQixZQUFZLENBQUMsZUFBZSxFQUM1QixVQUFVLENBQ1gsQ0FBQztJQUNGLE9BQU8sQ0FDTCxHQUFHO1NBQ0EsT0FBTyxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUM7UUFDakMsc0VBQXNFO1NBQ3JFLE9BQU8sQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFDO1FBQzNCLHFFQUFxRTtRQUNyRSx1RUFBdUU7UUFDdkUsZ0VBQWdFO1FBQ2hFLG9CQUFvQjtTQUNuQixJQUFJLEVBQUUsQ0FDVixDQUFDO0FBQ0osQ0FBQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FrQkc7QUFDSCxNQUFNLFVBQVUsYUFBYSxDQUFDLEtBQWEsRUFBRSxNQUFjLEVBQUUsVUFBbUI7SUFDOUUsTUFBTSxNQUFNLEdBQUcscUJBQXFCLENBQUMsTUFBTSxFQUFFLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3hFLE1BQU0sT0FBTyxHQUFHLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxxQkFBcUIsQ0FBQyxNQUFNLEVBQUUsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7SUFDakcsTUFBTSxHQUFHLEdBQUcsMEJBQTBCLENBQ3BDLEtBQUssRUFDTCxPQUFPLEVBQ1AsTUFBTSxFQUNOLFlBQVksQ0FBQyxLQUFLLEVBQ2xCLFlBQVksQ0FBQyxPQUFPLEVBQ3BCLFVBQVUsRUFDVixJQUFJLENBQ0wsQ0FBQztJQUNGLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FDaEIsSUFBSSxNQUFNLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxFQUM3QixxQkFBcUIsQ0FBQyxNQUFNLEVBQUUsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUN4RCxDQUFDO0FBQ0osQ0FBQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7O0dBZ0JHO0FBQ0gsTUFBTSxVQUFVLFlBQVksQ0FBQyxLQUFhLEVBQUUsTUFBYyxFQUFFLFVBQW1CO0lBQzdFLE1BQU0sTUFBTSxHQUFHLHFCQUFxQixDQUFDLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN4RSxNQUFNLE9BQU8sR0FBRyxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUscUJBQXFCLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0lBQ2pHLE9BQU8sMEJBQTBCLENBQy9CLEtBQUssRUFDTCxPQUFPLEVBQ1AsTUFBTSxFQUNOLFlBQVksQ0FBQyxLQUFLLEVBQ2xCLFlBQVksQ0FBQyxPQUFPLEVBQ3BCLFVBQVUsQ0FDWCxDQUFDO0FBQ0osQ0FBQztBQXNCRCxTQUFTLGlCQUFpQixDQUFDLE1BQWMsRUFBRSxTQUFTLEdBQUcsR0FBRztJQUN4RCxNQUFNLENBQUMsR0FBRztRQUNSLE1BQU0sRUFBRSxDQUFDO1FBQ1QsT0FBTyxFQUFFLENBQUM7UUFDVixPQUFPLEVBQUUsQ0FBQztRQUNWLE1BQU0sRUFBRSxFQUFFO1FBQ1YsTUFBTSxFQUFFLEVBQUU7UUFDVixNQUFNLEVBQUUsRUFBRTtRQUNWLE1BQU0sRUFBRSxFQUFFO1FBQ1YsS0FBSyxFQUFFLENBQUM7UUFDUixNQUFNLEVBQUUsQ0FBQztLQUNWLENBQUM7SUFFRixNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQy9DLE1BQU0sUUFBUSxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNqQyxNQUFNLFFBQVEsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFakMsTUFBTSxhQUFhLEdBQ2YsUUFBUSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbEMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDO1FBQzdCLENBQUMsQ0FBQztZQUNFLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzFELFFBQVEsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDeEQsRUFDUCxPQUFPLEdBQUcsYUFBYSxDQUFDLENBQUMsQ0FBQyxFQUMxQixRQUFRLEdBQUcsYUFBYSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUVwQyxDQUFDLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztJQUU3RCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQ3pDLE1BQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDOUIsSUFBSSxFQUFFLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDckIsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDaEMsQ0FBQzthQUFNLElBQUksRUFBRSxLQUFLLFVBQVUsRUFBRSxDQUFDO1lBQzdCLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNwQixDQUFDO2FBQU0sQ0FBQztZQUNOLENBQUMsQ0FBQyxNQUFNLElBQUksRUFBRSxDQUFDO1FBQ2pCLENBQUM7SUFDSCxDQUFDO0lBRUQsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN4QyxDQUFDLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzNDLENBQUMsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFeEUsSUFBSSxRQUFRLEVBQUUsQ0FBQztRQUNiLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQ2xFLEdBQUcsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRXJDLENBQUMsQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN4RCxDQUFDLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDOUQsQ0FBQztTQUFNLENBQUM7UUFDTixDQUFDLENBQUMsTUFBTSxHQUFHLFNBQVMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO1FBQ2hDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUN0QixDQUFDO0lBRUQsT0FBTyxDQUFDLENBQUM7QUFDWCxDQUFDO0FBV0Qsd0VBQXdFO0FBQ3hFLFNBQVMsU0FBUyxDQUFDLFlBQTBCO0lBQzNDLHdDQUF3QztJQUN4QyxJQUFJLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDakMsT0FBTyxZQUFZLENBQUM7SUFDdEIsQ0FBQztJQUVELHlDQUF5QztJQUN6QyxNQUFNLFdBQVcsR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxZQUFZLENBQUMsVUFBVSxDQUFDO0lBQ3pFLElBQUksWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzFCLFlBQVksQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDO0lBQzdCLENBQUM7U0FBTSxDQUFDO1FBQ04sSUFBSSxXQUFXLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDdEIsWUFBWSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLENBQUM7YUFBTSxJQUFJLFdBQVcsS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUM3QixZQUFZLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM5QixDQUFDO1FBQ0QsWUFBWSxDQUFDLFVBQVUsSUFBSSxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUVELE9BQU8sWUFBWSxDQUFDO0FBQ3RCLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFTLFdBQVcsQ0FBQyxHQUFXO0lBQzlCLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ2hDLElBQUksUUFBUSxHQUFHLENBQUMsRUFDZCxNQUFNLEVBQ04sVUFBVSxDQUFDO0lBQ2IsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQztJQUVoQixpQkFBaUI7SUFDakIsSUFBSSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNwRCxNQUFNLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUVELG9CQUFvQjtJQUNwQixJQUFJLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUNsQyx5QkFBeUI7UUFDekIsSUFBSSxVQUFVLEdBQUcsQ0FBQztZQUFFLFVBQVUsR0FBRyxDQUFDLENBQUM7UUFDbkMsVUFBVSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDbkMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7U0FBTSxJQUFJLFVBQVUsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUMxQiw4REFBOEQ7UUFDOUQsVUFBVSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDN0IsQ0FBQztJQUVELHFDQUFxQztJQUNyQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxTQUFTLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUNoRCxXQUFXO0lBQ2IsQ0FBQztJQUVELElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1FBQ2xDLDJCQUEyQjtRQUMzQixNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNiLFVBQVUsR0FBRyxDQUFDLENBQUM7SUFDakIsQ0FBQztTQUFNLENBQUM7UUFDTixxQ0FBcUM7UUFDckMsS0FBSyxFQUFFLENBQUM7UUFDUixPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssU0FBUztZQUFFLEtBQUssRUFBRSxDQUFDO1FBRW5ELGtEQUFrRDtRQUNsRCxVQUFVLElBQUksQ0FBQyxDQUFDO1FBQ2hCLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDWixvRUFBb0U7UUFDcEUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUNqQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QyxDQUFDO0lBQ0gsQ0FBQztJQUVELDJFQUEyRTtJQUMzRSxJQUFJLFVBQVUsR0FBRyxVQUFVLEVBQUUsQ0FBQztRQUM1QixNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzFDLFFBQVEsR0FBRyxVQUFVLEdBQUcsQ0FBQyxDQUFDO1FBQzFCLFVBQVUsR0FBRyxDQUFDLENBQUM7SUFDakIsQ0FBQztJQUVELE9BQU8sRUFBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBQyxDQUFDO0FBQ3hDLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFTLFdBQVcsQ0FBQyxZQUEwQixFQUFFLE9BQWUsRUFBRSxPQUFlO0lBQy9FLElBQUksT0FBTyxHQUFHLE9BQU8sRUFBRSxDQUFDO1FBQ3RCLE1BQU0sSUFBSSxLQUFLLENBQ2IsZ0RBQWdELE9BQU8saUNBQWlDLE9BQU8sSUFBSSxDQUNwRyxDQUFDO0lBQ0osQ0FBQztJQUVELElBQUksTUFBTSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUM7SUFDakMsSUFBSSxXQUFXLEdBQUcsTUFBTSxDQUFDLE1BQU0sR0FBRyxZQUFZLENBQUMsVUFBVSxDQUFDO0lBQzFELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFFdkUsdURBQXVEO0lBQ3ZELElBQUksT0FBTyxHQUFHLFlBQVksR0FBRyxZQUFZLENBQUMsVUFBVSxDQUFDO0lBQ3JELElBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUU1QixJQUFJLE9BQU8sR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUNoQiwwQ0FBMEM7UUFDMUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUUxRCxrREFBa0Q7UUFDbEQsS0FBSyxJQUFJLENBQUMsR0FBRyxPQUFPLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUM3QyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2hCLENBQUM7SUFDSCxDQUFDO1NBQU0sQ0FBQztRQUNOLCtDQUErQztRQUMvQyxXQUFXLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDdkMsWUFBWSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7UUFDNUIsTUFBTSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sR0FBRyxZQUFZLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxRCxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2QsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sRUFBRSxDQUFDLEVBQUU7WUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFRCxJQUFJLEtBQUssSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUNmLElBQUksT0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUNwQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQ2pDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xCLFlBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUM1QixDQUFDO1lBQ0QsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsQixZQUFZLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDNUIsQ0FBQzthQUFNLENBQUM7WUFDTixNQUFNLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDeEIsQ0FBQztJQUNILENBQUM7SUFFRCx5REFBeUQ7SUFDekQsT0FBTyxXQUFXLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsWUFBWSxDQUFDLEVBQUUsV0FBVyxFQUFFO1FBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUU5RSxJQUFJLGlCQUFpQixHQUFHLFlBQVksS0FBSyxDQUFDLENBQUM7SUFDM0Msb0VBQW9FO0lBQ3BFLDhFQUE4RTtJQUM5RSxNQUFNLE1BQU0sR0FBRyxPQUFPLEdBQUcsWUFBWSxDQUFDLFVBQVUsQ0FBQztJQUNqRCxxREFBcUQ7SUFDckQsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU07UUFDNUQsQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7UUFDZCxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsU0FBUztRQUMxQyxJQUFJLGlCQUFpQixFQUFFLENBQUM7WUFDdEIsOEVBQThFO1lBQzlFLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksTUFBTSxFQUFFLENBQUM7Z0JBQ25DLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUNmLENBQUM7aUJBQU0sQ0FBQztnQkFDTixpQkFBaUIsR0FBRyxLQUFLLENBQUM7WUFDNUIsQ0FBQztRQUNILENBQUM7UUFDRCxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsc0JBQXNCO0lBQ2hELENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNOLElBQUksS0FBSyxFQUFFLENBQUM7UUFDVixNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3RCLFlBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUM1QixDQUFDO0FBQ0gsQ0FBQztBQUVELE1BQU0sVUFBVSxpQkFBaUIsQ0FBQyxJQUFZO0lBQzVDLE1BQU0sTUFBTSxHQUFXLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN0QyxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1FBQ2xCLE1BQU0sSUFBSSxLQUFLLENBQUMsdUNBQXVDLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDbEUsQ0FBQztJQUNELE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIGdldExvY2FsZU51bWJlckZvcm1hdCxcbiAgZ2V0TG9jYWxlTnVtYmVyU3ltYm9sLFxuICBnZXROdW1iZXJPZkN1cnJlbmN5RGlnaXRzLFxuICBOdW1iZXJGb3JtYXRTdHlsZSxcbiAgTnVtYmVyU3ltYm9sLFxufSBmcm9tICcuL2xvY2FsZV9kYXRhX2FwaSc7XG5cbmV4cG9ydCBjb25zdCBOVU1CRVJfRk9STUFUX1JFR0VYUCA9IC9eKFxcZCspP1xcLigoXFxkKykoLShcXGQrKSk/KT8kLztcbmNvbnN0IE1BWF9ESUdJVFMgPSAyMjtcbmNvbnN0IERFQ0lNQUxfU0VQID0gJy4nO1xuY29uc3QgWkVST19DSEFSID0gJzAnO1xuY29uc3QgUEFUVEVSTl9TRVAgPSAnOyc7XG5jb25zdCBHUk9VUF9TRVAgPSAnLCc7XG5jb25zdCBESUdJVF9DSEFSID0gJyMnO1xuY29uc3QgQ1VSUkVOQ1lfQ0hBUiA9ICfCpCc7XG5jb25zdCBQRVJDRU5UX0NIQVIgPSAnJSc7XG5cbi8qKlxuICogVHJhbnNmb3JtcyBhIG51bWJlciB0byBhIGxvY2FsZSBzdHJpbmcgYmFzZWQgb24gYSBzdHlsZSBhbmQgYSBmb3JtYXQuXG4gKi9cbmZ1bmN0aW9uIGZvcm1hdE51bWJlclRvTG9jYWxlU3RyaW5nKFxuICB2YWx1ZTogbnVtYmVyLFxuICBwYXR0ZXJuOiBQYXJzZWROdW1iZXJGb3JtYXQsXG4gIGxvY2FsZTogc3RyaW5nLFxuICBncm91cFN5bWJvbDogTnVtYmVyU3ltYm9sLFxuICBkZWNpbWFsU3ltYm9sOiBOdW1iZXJTeW1ib2wsXG4gIGRpZ2l0c0luZm8/OiBzdHJpbmcsXG4gIGlzUGVyY2VudCA9IGZhbHNlLFxuKTogc3RyaW5nIHtcbiAgbGV0IGZvcm1hdHRlZFRleHQgPSAnJztcbiAgbGV0IGlzWmVybyA9IGZhbHNlO1xuXG4gIGlmICghaXNGaW5pdGUodmFsdWUpKSB7XG4gICAgZm9ybWF0dGVkVGV4dCA9IGdldExvY2FsZU51bWJlclN5bWJvbChsb2NhbGUsIE51bWJlclN5bWJvbC5JbmZpbml0eSk7XG4gIH0gZWxzZSB7XG4gICAgbGV0IHBhcnNlZE51bWJlciA9IHBhcnNlTnVtYmVyKHZhbHVlKTtcblxuICAgIGlmIChpc1BlcmNlbnQpIHtcbiAgICAgIHBhcnNlZE51bWJlciA9IHRvUGVyY2VudChwYXJzZWROdW1iZXIpO1xuICAgIH1cblxuICAgIGxldCBtaW5JbnQgPSBwYXR0ZXJuLm1pbkludDtcbiAgICBsZXQgbWluRnJhY3Rpb24gPSBwYXR0ZXJuLm1pbkZyYWM7XG4gICAgbGV0IG1heEZyYWN0aW9uID0gcGF0dGVybi5tYXhGcmFjO1xuXG4gICAgaWYgKGRpZ2l0c0luZm8pIHtcbiAgICAgIGNvbnN0IHBhcnRzID0gZGlnaXRzSW5mby5tYXRjaChOVU1CRVJfRk9STUFUX1JFR0VYUCk7XG4gICAgICBpZiAocGFydHMgPT09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAke2RpZ2l0c0luZm99IGlzIG5vdCBhIHZhbGlkIGRpZ2l0IGluZm9gKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IG1pbkludFBhcnQgPSBwYXJ0c1sxXTtcbiAgICAgIGNvbnN0IG1pbkZyYWN0aW9uUGFydCA9IHBhcnRzWzNdO1xuICAgICAgY29uc3QgbWF4RnJhY3Rpb25QYXJ0ID0gcGFydHNbNV07XG4gICAgICBpZiAobWluSW50UGFydCAhPSBudWxsKSB7XG4gICAgICAgIG1pbkludCA9IHBhcnNlSW50QXV0b1JhZGl4KG1pbkludFBhcnQpO1xuICAgICAgfVxuICAgICAgaWYgKG1pbkZyYWN0aW9uUGFydCAhPSBudWxsKSB7XG4gICAgICAgIG1pbkZyYWN0aW9uID0gcGFyc2VJbnRBdXRvUmFkaXgobWluRnJhY3Rpb25QYXJ0KTtcbiAgICAgIH1cbiAgICAgIGlmIChtYXhGcmFjdGlvblBhcnQgIT0gbnVsbCkge1xuICAgICAgICBtYXhGcmFjdGlvbiA9IHBhcnNlSW50QXV0b1JhZGl4KG1heEZyYWN0aW9uUGFydCk7XG4gICAgICB9IGVsc2UgaWYgKG1pbkZyYWN0aW9uUGFydCAhPSBudWxsICYmIG1pbkZyYWN0aW9uID4gbWF4RnJhY3Rpb24pIHtcbiAgICAgICAgbWF4RnJhY3Rpb24gPSBtaW5GcmFjdGlvbjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByb3VuZE51bWJlcihwYXJzZWROdW1iZXIsIG1pbkZyYWN0aW9uLCBtYXhGcmFjdGlvbik7XG5cbiAgICBsZXQgZGlnaXRzID0gcGFyc2VkTnVtYmVyLmRpZ2l0cztcbiAgICBsZXQgaW50ZWdlckxlbiA9IHBhcnNlZE51bWJlci5pbnRlZ2VyTGVuO1xuICAgIGNvbnN0IGV4cG9uZW50ID0gcGFyc2VkTnVtYmVyLmV4cG9uZW50O1xuICAgIGxldCBkZWNpbWFscyA9IFtdO1xuICAgIGlzWmVybyA9IGRpZ2l0cy5ldmVyeSgoZCkgPT4gIWQpO1xuXG4gICAgLy8gcGFkIHplcm9zIGZvciBzbWFsbCBudW1iZXJzXG4gICAgZm9yICg7IGludGVnZXJMZW4gPCBtaW5JbnQ7IGludGVnZXJMZW4rKykge1xuICAgICAgZGlnaXRzLnVuc2hpZnQoMCk7XG4gICAgfVxuXG4gICAgLy8gcGFkIHplcm9zIGZvciBzbWFsbCBudW1iZXJzXG4gICAgZm9yICg7IGludGVnZXJMZW4gPCAwOyBpbnRlZ2VyTGVuKyspIHtcbiAgICAgIGRpZ2l0cy51bnNoaWZ0KDApO1xuICAgIH1cblxuICAgIC8vIGV4dHJhY3QgZGVjaW1hbHMgZGlnaXRzXG4gICAgaWYgKGludGVnZXJMZW4gPiAwKSB7XG4gICAgICBkZWNpbWFscyA9IGRpZ2l0cy5zcGxpY2UoaW50ZWdlckxlbiwgZGlnaXRzLmxlbmd0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlY2ltYWxzID0gZGlnaXRzO1xuICAgICAgZGlnaXRzID0gWzBdO1xuICAgIH1cblxuICAgIC8vIGZvcm1hdCB0aGUgaW50ZWdlciBkaWdpdHMgd2l0aCBncm91cGluZyBzZXBhcmF0b3JzXG4gICAgY29uc3QgZ3JvdXBzID0gW107XG4gICAgaWYgKGRpZ2l0cy5sZW5ndGggPj0gcGF0dGVybi5sZ1NpemUpIHtcbiAgICAgIGdyb3Vwcy51bnNoaWZ0KGRpZ2l0cy5zcGxpY2UoLXBhdHRlcm4ubGdTaXplLCBkaWdpdHMubGVuZ3RoKS5qb2luKCcnKSk7XG4gICAgfVxuXG4gICAgd2hpbGUgKGRpZ2l0cy5sZW5ndGggPiBwYXR0ZXJuLmdTaXplKSB7XG4gICAgICBncm91cHMudW5zaGlmdChkaWdpdHMuc3BsaWNlKC1wYXR0ZXJuLmdTaXplLCBkaWdpdHMubGVuZ3RoKS5qb2luKCcnKSk7XG4gICAgfVxuXG4gICAgaWYgKGRpZ2l0cy5sZW5ndGgpIHtcbiAgICAgIGdyb3Vwcy51bnNoaWZ0KGRpZ2l0cy5qb2luKCcnKSk7XG4gICAgfVxuXG4gICAgZm9ybWF0dGVkVGV4dCA9IGdyb3Vwcy5qb2luKGdldExvY2FsZU51bWJlclN5bWJvbChsb2NhbGUsIGdyb3VwU3ltYm9sKSk7XG5cbiAgICAvLyBhcHBlbmQgdGhlIGRlY2ltYWwgZGlnaXRzXG4gICAgaWYgKGRlY2ltYWxzLmxlbmd0aCkge1xuICAgICAgZm9ybWF0dGVkVGV4dCArPSBnZXRMb2NhbGVOdW1iZXJTeW1ib2wobG9jYWxlLCBkZWNpbWFsU3ltYm9sKSArIGRlY2ltYWxzLmpvaW4oJycpO1xuICAgIH1cblxuICAgIGlmIChleHBvbmVudCkge1xuICAgICAgZm9ybWF0dGVkVGV4dCArPSBnZXRMb2NhbGVOdW1iZXJTeW1ib2wobG9jYWxlLCBOdW1iZXJTeW1ib2wuRXhwb25lbnRpYWwpICsgJysnICsgZXhwb25lbnQ7XG4gICAgfVxuICB9XG5cbiAgaWYgKHZhbHVlIDwgMCAmJiAhaXNaZXJvKSB7XG4gICAgZm9ybWF0dGVkVGV4dCA9IHBhdHRlcm4ubmVnUHJlICsgZm9ybWF0dGVkVGV4dCArIHBhdHRlcm4ubmVnU3VmO1xuICB9IGVsc2Uge1xuICAgIGZvcm1hdHRlZFRleHQgPSBwYXR0ZXJuLnBvc1ByZSArIGZvcm1hdHRlZFRleHQgKyBwYXR0ZXJuLnBvc1N1ZjtcbiAgfVxuXG4gIHJldHVybiBmb3JtYXR0ZWRUZXh0O1xufVxuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEZvcm1hdHMgYSBudW1iZXIgYXMgY3VycmVuY3kgdXNpbmcgbG9jYWxlIHJ1bGVzLlxuICpcbiAqIEBwYXJhbSB2YWx1ZSBUaGUgbnVtYmVyIHRvIGZvcm1hdC5cbiAqIEBwYXJhbSBsb2NhbGUgQSBsb2NhbGUgY29kZSBmb3IgdGhlIGxvY2FsZSBmb3JtYXQgcnVsZXMgdG8gdXNlLlxuICogQHBhcmFtIGN1cnJlbmN5IEEgc3RyaW5nIGNvbnRhaW5pbmcgdGhlIGN1cnJlbmN5IHN5bWJvbCBvciBpdHMgbmFtZSxcbiAqIHN1Y2ggYXMgXCIkXCIgb3IgXCJDYW5hZGlhbiBEb2xsYXJcIi4gVXNlZCBpbiBvdXRwdXQgc3RyaW5nLCBidXQgZG9lcyBub3QgYWZmZWN0IHRoZSBvcGVyYXRpb25cbiAqIG9mIHRoZSBmdW5jdGlvbi5cbiAqIEBwYXJhbSBjdXJyZW5jeUNvZGUgVGhlIFtJU08gNDIxN10oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSVNPXzQyMTcpXG4gKiBjdXJyZW5jeSBjb2RlLCBzdWNoIGFzIGBVU0RgIGZvciB0aGUgVVMgZG9sbGFyIGFuZCBgRVVSYCBmb3IgdGhlIGV1cm8uXG4gKiBVc2VkIHRvIGRldGVybWluZSB0aGUgbnVtYmVyIG9mIGRpZ2l0cyBpbiB0aGUgZGVjaW1hbCBwYXJ0LlxuICogQHBhcmFtIGRpZ2l0c0luZm8gRGVjaW1hbCByZXByZXNlbnRhdGlvbiBvcHRpb25zLCBzcGVjaWZpZWQgYnkgYSBzdHJpbmcgaW4gdGhlIGZvbGxvd2luZyBmb3JtYXQ6XG4gKiBge21pbkludGVnZXJEaWdpdHN9LnttaW5GcmFjdGlvbkRpZ2l0c30te21heEZyYWN0aW9uRGlnaXRzfWAuIFNlZSBgRGVjaW1hbFBpcGVgIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogQHJldHVybnMgVGhlIGZvcm1hdHRlZCBjdXJyZW5jeSB2YWx1ZS5cbiAqXG4gKiBAc2VlIHtAbGluayBmb3JtYXROdW1iZXJ9XG4gKiBAc2VlIHtAbGluayBEZWNpbWFsUGlwZX1cbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oZ3VpZGUvaTE4bilcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRDdXJyZW5jeShcbiAgdmFsdWU6IG51bWJlcixcbiAgbG9jYWxlOiBzdHJpbmcsXG4gIGN1cnJlbmN5OiBzdHJpbmcsXG4gIGN1cnJlbmN5Q29kZT86IHN0cmluZyxcbiAgZGlnaXRzSW5mbz86IHN0cmluZyxcbik6IHN0cmluZyB7XG4gIGNvbnN0IGZvcm1hdCA9IGdldExvY2FsZU51bWJlckZvcm1hdChsb2NhbGUsIE51bWJlckZvcm1hdFN0eWxlLkN1cnJlbmN5KTtcbiAgY29uc3QgcGF0dGVybiA9IHBhcnNlTnVtYmVyRm9ybWF0KGZvcm1hdCwgZ2V0TG9jYWxlTnVtYmVyU3ltYm9sKGxvY2FsZSwgTnVtYmVyU3ltYm9sLk1pbnVzU2lnbikpO1xuXG4gIHBhdHRlcm4ubWluRnJhYyA9IGdldE51bWJlck9mQ3VycmVuY3lEaWdpdHMoY3VycmVuY3lDb2RlISk7XG4gIHBhdHRlcm4ubWF4RnJhYyA9IHBhdHRlcm4ubWluRnJhYztcblxuICBjb25zdCByZXMgPSBmb3JtYXROdW1iZXJUb0xvY2FsZVN0cmluZyhcbiAgICB2YWx1ZSxcbiAgICBwYXR0ZXJuLFxuICAgIGxvY2FsZSxcbiAgICBOdW1iZXJTeW1ib2wuQ3VycmVuY3lHcm91cCxcbiAgICBOdW1iZXJTeW1ib2wuQ3VycmVuY3lEZWNpbWFsLFxuICAgIGRpZ2l0c0luZm8sXG4gICk7XG4gIHJldHVybiAoXG4gICAgcmVzXG4gICAgICAucmVwbGFjZShDVVJSRU5DWV9DSEFSLCBjdXJyZW5jeSlcbiAgICAgIC8vIGlmIHdlIGhhdmUgMiB0aW1lIHRoZSBjdXJyZW5jeSBjaGFyYWN0ZXIsIHRoZSBzZWNvbmQgb25lIGlzIGlnbm9yZWRcbiAgICAgIC5yZXBsYWNlKENVUlJFTkNZX0NIQVIsICcnKVxuICAgICAgLy8gSWYgdGhlcmUgaXMgYSBzcGFjaW5nIGJldHdlZW4gY3VycmVuY3kgY2hhcmFjdGVyIGFuZCB0aGUgdmFsdWUgYW5kXG4gICAgICAvLyB0aGUgY3VycmVuY3kgY2hhcmFjdGVyIGlzIHN1cHByZXNzZWQgYnkgcGFzc2luZyBhbiBlbXB0eSBzdHJpbmcsIHRoZVxuICAgICAgLy8gc3BhY2luZyBjaGFyYWN0ZXIgd291bGQgcmVtYWluIGFzIHBhcnQgb2YgdGhlIHN0cmluZy4gVGhlbiB3ZVxuICAgICAgLy8gc2hvdWxkIHJlbW92ZSBpdC5cbiAgICAgIC50cmltKClcbiAgKTtcbn1cblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBGb3JtYXRzIGEgbnVtYmVyIGFzIGEgcGVyY2VudGFnZSBhY2NvcmRpbmcgdG8gbG9jYWxlIHJ1bGVzLlxuICpcbiAqIEBwYXJhbSB2YWx1ZSBUaGUgbnVtYmVyIHRvIGZvcm1hdC5cbiAqIEBwYXJhbSBsb2NhbGUgQSBsb2NhbGUgY29kZSBmb3IgdGhlIGxvY2FsZSBmb3JtYXQgcnVsZXMgdG8gdXNlLlxuICogQHBhcmFtIGRpZ2l0c0luZm8gRGVjaW1hbCByZXByZXNlbnRhdGlvbiBvcHRpb25zLCBzcGVjaWZpZWQgYnkgYSBzdHJpbmcgaW4gdGhlIGZvbGxvd2luZyBmb3JtYXQ6XG4gKiBge21pbkludGVnZXJEaWdpdHN9LnttaW5GcmFjdGlvbkRpZ2l0c30te21heEZyYWN0aW9uRGlnaXRzfWAuIFNlZSBgRGVjaW1hbFBpcGVgIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogQHJldHVybnMgVGhlIGZvcm1hdHRlZCBwZXJjZW50YWdlIHZhbHVlLlxuICpcbiAqIEBzZWUge0BsaW5rIGZvcm1hdE51bWJlcn1cbiAqIEBzZWUge0BsaW5rIERlY2ltYWxQaXBlfVxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShndWlkZS9pMThuKVxuICogQHB1YmxpY0FwaVxuICpcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdFBlcmNlbnQodmFsdWU6IG51bWJlciwgbG9jYWxlOiBzdHJpbmcsIGRpZ2l0c0luZm8/OiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBmb3JtYXQgPSBnZXRMb2NhbGVOdW1iZXJGb3JtYXQobG9jYWxlLCBOdW1iZXJGb3JtYXRTdHlsZS5QZXJjZW50KTtcbiAgY29uc3QgcGF0dGVybiA9IHBhcnNlTnVtYmVyRm9ybWF0KGZvcm1hdCwgZ2V0TG9jYWxlTnVtYmVyU3ltYm9sKGxvY2FsZSwgTnVtYmVyU3ltYm9sLk1pbnVzU2lnbikpO1xuICBjb25zdCByZXMgPSBmb3JtYXROdW1iZXJUb0xvY2FsZVN0cmluZyhcbiAgICB2YWx1ZSxcbiAgICBwYXR0ZXJuLFxuICAgIGxvY2FsZSxcbiAgICBOdW1iZXJTeW1ib2wuR3JvdXAsXG4gICAgTnVtYmVyU3ltYm9sLkRlY2ltYWwsXG4gICAgZGlnaXRzSW5mbyxcbiAgICB0cnVlLFxuICApO1xuICByZXR1cm4gcmVzLnJlcGxhY2UoXG4gICAgbmV3IFJlZ0V4cChQRVJDRU5UX0NIQVIsICdnJyksXG4gICAgZ2V0TG9jYWxlTnVtYmVyU3ltYm9sKGxvY2FsZSwgTnVtYmVyU3ltYm9sLlBlcmNlbnRTaWduKSxcbiAgKTtcbn1cblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBGb3JtYXRzIGEgbnVtYmVyIGFzIHRleHQsIHdpdGggZ3JvdXAgc2l6aW5nLCBzZXBhcmF0b3IsIGFuZCBvdGhlclxuICogcGFyYW1ldGVycyBiYXNlZCBvbiB0aGUgbG9jYWxlLlxuICpcbiAqIEBwYXJhbSB2YWx1ZSBUaGUgbnVtYmVyIHRvIGZvcm1hdC5cbiAqIEBwYXJhbSBsb2NhbGUgQSBsb2NhbGUgY29kZSBmb3IgdGhlIGxvY2FsZSBmb3JtYXQgcnVsZXMgdG8gdXNlLlxuICogQHBhcmFtIGRpZ2l0c0luZm8gRGVjaW1hbCByZXByZXNlbnRhdGlvbiBvcHRpb25zLCBzcGVjaWZpZWQgYnkgYSBzdHJpbmcgaW4gdGhlIGZvbGxvd2luZyBmb3JtYXQ6XG4gKiBge21pbkludGVnZXJEaWdpdHN9LnttaW5GcmFjdGlvbkRpZ2l0c30te21heEZyYWN0aW9uRGlnaXRzfWAuIFNlZSBgRGVjaW1hbFBpcGVgIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogQHJldHVybnMgVGhlIGZvcm1hdHRlZCB0ZXh0IHN0cmluZy5cbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oZ3VpZGUvaTE4bilcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXROdW1iZXIodmFsdWU6IG51bWJlciwgbG9jYWxlOiBzdHJpbmcsIGRpZ2l0c0luZm8/OiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBmb3JtYXQgPSBnZXRMb2NhbGVOdW1iZXJGb3JtYXQobG9jYWxlLCBOdW1iZXJGb3JtYXRTdHlsZS5EZWNpbWFsKTtcbiAgY29uc3QgcGF0dGVybiA9IHBhcnNlTnVtYmVyRm9ybWF0KGZvcm1hdCwgZ2V0TG9jYWxlTnVtYmVyU3ltYm9sKGxvY2FsZSwgTnVtYmVyU3ltYm9sLk1pbnVzU2lnbikpO1xuICByZXR1cm4gZm9ybWF0TnVtYmVyVG9Mb2NhbGVTdHJpbmcoXG4gICAgdmFsdWUsXG4gICAgcGF0dGVybixcbiAgICBsb2NhbGUsXG4gICAgTnVtYmVyU3ltYm9sLkdyb3VwLFxuICAgIE51bWJlclN5bWJvbC5EZWNpbWFsLFxuICAgIGRpZ2l0c0luZm8sXG4gICk7XG59XG5cbmludGVyZmFjZSBQYXJzZWROdW1iZXJGb3JtYXQge1xuICBtaW5JbnQ6IG51bWJlcjtcbiAgLy8gdGhlIG1pbmltdW0gbnVtYmVyIG9mIGRpZ2l0cyByZXF1aXJlZCBpbiB0aGUgZnJhY3Rpb24gcGFydCBvZiB0aGUgbnVtYmVyXG4gIG1pbkZyYWM6IG51bWJlcjtcbiAgLy8gdGhlIG1heGltdW0gbnVtYmVyIG9mIGRpZ2l0cyByZXF1aXJlZCBpbiB0aGUgZnJhY3Rpb24gcGFydCBvZiB0aGUgbnVtYmVyXG4gIG1heEZyYWM6IG51bWJlcjtcbiAgLy8gdGhlIHByZWZpeCBmb3IgYSBwb3NpdGl2ZSBudW1iZXJcbiAgcG9zUHJlOiBzdHJpbmc7XG4gIC8vIHRoZSBzdWZmaXggZm9yIGEgcG9zaXRpdmUgbnVtYmVyXG4gIHBvc1N1Zjogc3RyaW5nO1xuICAvLyB0aGUgcHJlZml4IGZvciBhIG5lZ2F0aXZlIG51bWJlciAoZS5nLiBgLWAgb3IgYChgKSlcbiAgbmVnUHJlOiBzdHJpbmc7XG4gIC8vIHRoZSBzdWZmaXggZm9yIGEgbmVnYXRpdmUgbnVtYmVyIChlLmcuIGApYClcbiAgbmVnU3VmOiBzdHJpbmc7XG4gIC8vIG51bWJlciBvZiBkaWdpdHMgaW4gZWFjaCBncm91cCBvZiBzZXBhcmF0ZWQgZGlnaXRzXG4gIGdTaXplOiBudW1iZXI7XG4gIC8vIG51bWJlciBvZiBkaWdpdHMgaW4gdGhlIGxhc3QgZ3JvdXAgb2YgZGlnaXRzIGJlZm9yZSB0aGUgZGVjaW1hbCBzZXBhcmF0b3JcbiAgbGdTaXplOiBudW1iZXI7XG59XG5cbmZ1bmN0aW9uIHBhcnNlTnVtYmVyRm9ybWF0KGZvcm1hdDogc3RyaW5nLCBtaW51c1NpZ24gPSAnLScpOiBQYXJzZWROdW1iZXJGb3JtYXQge1xuICBjb25zdCBwID0ge1xuICAgIG1pbkludDogMSxcbiAgICBtaW5GcmFjOiAwLFxuICAgIG1heEZyYWM6IDAsXG4gICAgcG9zUHJlOiAnJyxcbiAgICBwb3NTdWY6ICcnLFxuICAgIG5lZ1ByZTogJycsXG4gICAgbmVnU3VmOiAnJyxcbiAgICBnU2l6ZTogMCxcbiAgICBsZ1NpemU6IDAsXG4gIH07XG5cbiAgY29uc3QgcGF0dGVyblBhcnRzID0gZm9ybWF0LnNwbGl0KFBBVFRFUk5fU0VQKTtcbiAgY29uc3QgcG9zaXRpdmUgPSBwYXR0ZXJuUGFydHNbMF07XG4gIGNvbnN0IG5lZ2F0aXZlID0gcGF0dGVyblBhcnRzWzFdO1xuXG4gIGNvbnN0IHBvc2l0aXZlUGFydHMgPVxuICAgICAgcG9zaXRpdmUuaW5kZXhPZihERUNJTUFMX1NFUCkgIT09IC0xXG4gICAgICAgID8gcG9zaXRpdmUuc3BsaXQoREVDSU1BTF9TRVApXG4gICAgICAgIDogW1xuICAgICAgICAgICAgcG9zaXRpdmUuc3Vic3RyaW5nKDAsIHBvc2l0aXZlLmxhc3RJbmRleE9mKFpFUk9fQ0hBUikgKyAxKSxcbiAgICAgICAgICAgIHBvc2l0aXZlLnN1YnN0cmluZyhwb3NpdGl2ZS5sYXN0SW5kZXhPZihaRVJPX0NIQVIpICsgMSksXG4gICAgICAgICAgXSxcbiAgICBpbnRlZ2VyID0gcG9zaXRpdmVQYXJ0c1swXSxcbiAgICBmcmFjdGlvbiA9IHBvc2l0aXZlUGFydHNbMV0gfHwgJyc7XG5cbiAgcC5wb3NQcmUgPSBpbnRlZ2VyLnN1YnN0cmluZygwLCBpbnRlZ2VyLmluZGV4T2YoRElHSVRfQ0hBUikpO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZnJhY3Rpb24ubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBjaCA9IGZyYWN0aW9uLmNoYXJBdChpKTtcbiAgICBpZiAoY2ggPT09IFpFUk9fQ0hBUikge1xuICAgICAgcC5taW5GcmFjID0gcC5tYXhGcmFjID0gaSArIDE7XG4gICAgfSBlbHNlIGlmIChjaCA9PT0gRElHSVRfQ0hBUikge1xuICAgICAgcC5tYXhGcmFjID0gaSArIDE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHAucG9zU3VmICs9IGNoO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGdyb3VwcyA9IGludGVnZXIuc3BsaXQoR1JPVVBfU0VQKTtcbiAgcC5nU2l6ZSA9IGdyb3Vwc1sxXSA/IGdyb3Vwc1sxXS5sZW5ndGggOiAwO1xuICBwLmxnU2l6ZSA9IGdyb3Vwc1syXSB8fCBncm91cHNbMV0gPyAoZ3JvdXBzWzJdIHx8IGdyb3Vwc1sxXSkubGVuZ3RoIDogMDtcblxuICBpZiAobmVnYXRpdmUpIHtcbiAgICBjb25zdCB0cnVua0xlbiA9IHBvc2l0aXZlLmxlbmd0aCAtIHAucG9zUHJlLmxlbmd0aCAtIHAucG9zU3VmLmxlbmd0aCxcbiAgICAgIHBvcyA9IG5lZ2F0aXZlLmluZGV4T2YoRElHSVRfQ0hBUik7XG5cbiAgICBwLm5lZ1ByZSA9IG5lZ2F0aXZlLnN1YnN0cmluZygwLCBwb3MpLnJlcGxhY2UoLycvZywgJycpO1xuICAgIHAubmVnU3VmID0gbmVnYXRpdmUuc2xpY2UocG9zICsgdHJ1bmtMZW4pLnJlcGxhY2UoLycvZywgJycpO1xuICB9IGVsc2Uge1xuICAgIHAubmVnUHJlID0gbWludXNTaWduICsgcC5wb3NQcmU7XG4gICAgcC5uZWdTdWYgPSBwLnBvc1N1ZjtcbiAgfVxuXG4gIHJldHVybiBwO1xufVxuXG5pbnRlcmZhY2UgUGFyc2VkTnVtYmVyIHtcbiAgLy8gYW4gYXJyYXkgb2YgZGlnaXRzIGNvbnRhaW5pbmcgbGVhZGluZyB6ZXJvcyBhcyBuZWNlc3NhcnlcbiAgZGlnaXRzOiBudW1iZXJbXTtcbiAgLy8gdGhlIGV4cG9uZW50IGZvciBudW1iZXJzIHRoYXQgd291bGQgbmVlZCBtb3JlIHRoYW4gYE1BWF9ESUdJVFNgIGRpZ2l0cyBpbiBgZGBcbiAgZXhwb25lbnQ6IG51bWJlcjtcbiAgLy8gdGhlIG51bWJlciBvZiB0aGUgZGlnaXRzIGluIGBkYCB0aGF0IGFyZSB0byB0aGUgbGVmdCBvZiB0aGUgZGVjaW1hbCBwb2ludFxuICBpbnRlZ2VyTGVuOiBudW1iZXI7XG59XG5cbi8vIFRyYW5zZm9ybXMgYSBwYXJzZWQgbnVtYmVyIGludG8gYSBwZXJjZW50YWdlIGJ5IG11bHRpcGx5aW5nIGl0IGJ5IDEwMFxuZnVuY3Rpb24gdG9QZXJjZW50KHBhcnNlZE51bWJlcjogUGFyc2VkTnVtYmVyKTogUGFyc2VkTnVtYmVyIHtcbiAgLy8gaWYgdGhlIG51bWJlciBpcyAwLCBkb24ndCBkbyBhbnl0aGluZ1xuICBpZiAocGFyc2VkTnVtYmVyLmRpZ2l0c1swXSA9PT0gMCkge1xuICAgIHJldHVybiBwYXJzZWROdW1iZXI7XG4gIH1cblxuICAvLyBHZXR0aW5nIHRoZSBjdXJyZW50IG51bWJlciBvZiBkZWNpbWFsc1xuICBjb25zdCBmcmFjdGlvbkxlbiA9IHBhcnNlZE51bWJlci5kaWdpdHMubGVuZ3RoIC0gcGFyc2VkTnVtYmVyLmludGVnZXJMZW47XG4gIGlmIChwYXJzZWROdW1iZXIuZXhwb25lbnQpIHtcbiAgICBwYXJzZWROdW1iZXIuZXhwb25lbnQgKz0gMjtcbiAgfSBlbHNlIHtcbiAgICBpZiAoZnJhY3Rpb25MZW4gPT09IDApIHtcbiAgICAgIHBhcnNlZE51bWJlci5kaWdpdHMucHVzaCgwLCAwKTtcbiAgICB9IGVsc2UgaWYgKGZyYWN0aW9uTGVuID09PSAxKSB7XG4gICAgICBwYXJzZWROdW1iZXIuZGlnaXRzLnB1c2goMCk7XG4gICAgfVxuICAgIHBhcnNlZE51bWJlci5pbnRlZ2VyTGVuICs9IDI7XG4gIH1cblxuICByZXR1cm4gcGFyc2VkTnVtYmVyO1xufVxuXG4vKipcbiAqIFBhcnNlcyBhIG51bWJlci5cbiAqIFNpZ25pZmljYW50IGJpdHMgb2YgdGhpcyBwYXJzZSBhbGdvcml0aG0gY2FtZSBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWtlTWNsL2JpZy5qcy9cbiAqL1xuZnVuY3Rpb24gcGFyc2VOdW1iZXIobnVtOiBudW1iZXIpOiBQYXJzZWROdW1iZXIge1xuICBsZXQgbnVtU3RyID0gTWF0aC5hYnMobnVtKSArICcnO1xuICBsZXQgZXhwb25lbnQgPSAwLFxuICAgIGRpZ2l0cyxcbiAgICBpbnRlZ2VyTGVuO1xuICBsZXQgaSwgaiwgemVyb3M7XG5cbiAgLy8gRGVjaW1hbCBwb2ludD9cbiAgaWYgKChpbnRlZ2VyTGVuID0gbnVtU3RyLmluZGV4T2YoREVDSU1BTF9TRVApKSA+IC0xKSB7XG4gICAgbnVtU3RyID0gbnVtU3RyLnJlcGxhY2UoREVDSU1BTF9TRVAsICcnKTtcbiAgfVxuXG4gIC8vIEV4cG9uZW50aWFsIGZvcm0/XG4gIGlmICgoaSA9IG51bVN0ci5zZWFyY2goL2UvaSkpID4gMCkge1xuICAgIC8vIFdvcmsgb3V0IHRoZSBleHBvbmVudC5cbiAgICBpZiAoaW50ZWdlckxlbiA8IDApIGludGVnZXJMZW4gPSBpO1xuICAgIGludGVnZXJMZW4gKz0gK251bVN0ci5zbGljZShpICsgMSk7XG4gICAgbnVtU3RyID0gbnVtU3RyLnN1YnN0cmluZygwLCBpKTtcbiAgfSBlbHNlIGlmIChpbnRlZ2VyTGVuIDwgMCkge1xuICAgIC8vIFRoZXJlIHdhcyBubyBkZWNpbWFsIHBvaW50IG9yIGV4cG9uZW50IHNvIGl0IGlzIGFuIGludGVnZXIuXG4gICAgaW50ZWdlckxlbiA9IG51bVN0ci5sZW5ndGg7XG4gIH1cblxuICAvLyBDb3VudCB0aGUgbnVtYmVyIG9mIGxlYWRpbmcgemVyb3MuXG4gIGZvciAoaSA9IDA7IG51bVN0ci5jaGFyQXQoaSkgPT09IFpFUk9fQ0hBUjsgaSsrKSB7XG4gICAgLyogZW1wdHkgKi9cbiAgfVxuXG4gIGlmIChpID09PSAoemVyb3MgPSBudW1TdHIubGVuZ3RoKSkge1xuICAgIC8vIFRoZSBkaWdpdHMgYXJlIGFsbCB6ZXJvLlxuICAgIGRpZ2l0cyA9IFswXTtcbiAgICBpbnRlZ2VyTGVuID0gMTtcbiAgfSBlbHNlIHtcbiAgICAvLyBDb3VudCB0aGUgbnVtYmVyIG9mIHRyYWlsaW5nIHplcm9zXG4gICAgemVyb3MtLTtcbiAgICB3aGlsZSAobnVtU3RyLmNoYXJBdCh6ZXJvcykgPT09IFpFUk9fQ0hBUikgemVyb3MtLTtcblxuICAgIC8vIFRyYWlsaW5nIHplcm9zIGFyZSBpbnNpZ25pZmljYW50IHNvIGlnbm9yZSB0aGVtXG4gICAgaW50ZWdlckxlbiAtPSBpO1xuICAgIGRpZ2l0cyA9IFtdO1xuICAgIC8vIENvbnZlcnQgc3RyaW5nIHRvIGFycmF5IG9mIGRpZ2l0cyB3aXRob3V0IGxlYWRpbmcvdHJhaWxpbmcgemVyb3MuXG4gICAgZm9yIChqID0gMDsgaSA8PSB6ZXJvczsgaSsrLCBqKyspIHtcbiAgICAgIGRpZ2l0c1tqXSA9IE51bWJlcihudW1TdHIuY2hhckF0KGkpKTtcbiAgICB9XG4gIH1cblxuICAvLyBJZiB0aGUgbnVtYmVyIG92ZXJmbG93cyB0aGUgbWF4aW11bSBhbGxvd2VkIGRpZ2l0cyB0aGVuIHVzZSBhbiBleHBvbmVudC5cbiAgaWYgKGludGVnZXJMZW4gPiBNQVhfRElHSVRTKSB7XG4gICAgZGlnaXRzID0gZGlnaXRzLnNwbGljZSgwLCBNQVhfRElHSVRTIC0gMSk7XG4gICAgZXhwb25lbnQgPSBpbnRlZ2VyTGVuIC0gMTtcbiAgICBpbnRlZ2VyTGVuID0gMTtcbiAgfVxuXG4gIHJldHVybiB7ZGlnaXRzLCBleHBvbmVudCwgaW50ZWdlckxlbn07XG59XG5cbi8qKlxuICogUm91bmQgdGhlIHBhcnNlZCBudW1iZXIgdG8gdGhlIHNwZWNpZmllZCBudW1iZXIgb2YgZGVjaW1hbCBwbGFjZXNcbiAqIFRoaXMgZnVuY3Rpb24gY2hhbmdlcyB0aGUgcGFyc2VkTnVtYmVyIGluLXBsYWNlXG4gKi9cbmZ1bmN0aW9uIHJvdW5kTnVtYmVyKHBhcnNlZE51bWJlcjogUGFyc2VkTnVtYmVyLCBtaW5GcmFjOiBudW1iZXIsIG1heEZyYWM6IG51bWJlcikge1xuICBpZiAobWluRnJhYyA+IG1heEZyYWMpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgVGhlIG1pbmltdW0gbnVtYmVyIG9mIGRpZ2l0cyBhZnRlciBmcmFjdGlvbiAoJHttaW5GcmFjfSkgaXMgaGlnaGVyIHRoYW4gdGhlIG1heGltdW0gKCR7bWF4RnJhY30pLmAsXG4gICAgKTtcbiAgfVxuXG4gIGxldCBkaWdpdHMgPSBwYXJzZWROdW1iZXIuZGlnaXRzO1xuICBsZXQgZnJhY3Rpb25MZW4gPSBkaWdpdHMubGVuZ3RoIC0gcGFyc2VkTnVtYmVyLmludGVnZXJMZW47XG4gIGNvbnN0IGZyYWN0aW9uU2l6ZSA9IE1hdGgubWluKE1hdGgubWF4KG1pbkZyYWMsIGZyYWN0aW9uTGVuKSwgbWF4RnJhYyk7XG5cbiAgLy8gVGhlIGluZGV4IG9mIHRoZSBkaWdpdCB0byB3aGVyZSByb3VuZGluZyBpcyB0byBvY2N1clxuICBsZXQgcm91bmRBdCA9IGZyYWN0aW9uU2l6ZSArIHBhcnNlZE51bWJlci5pbnRlZ2VyTGVuO1xuICBsZXQgZGlnaXQgPSBkaWdpdHNbcm91bmRBdF07XG5cbiAgaWYgKHJvdW5kQXQgPiAwKSB7XG4gICAgLy8gRHJvcCBmcmFjdGlvbmFsIGRpZ2l0cyBiZXlvbmQgYHJvdW5kQXRgXG4gICAgZGlnaXRzLnNwbGljZShNYXRoLm1heChwYXJzZWROdW1iZXIuaW50ZWdlckxlbiwgcm91bmRBdCkpO1xuXG4gICAgLy8gU2V0IG5vbi1mcmFjdGlvbmFsIGRpZ2l0cyBiZXlvbmQgYHJvdW5kQXRgIHRvIDBcbiAgICBmb3IgKGxldCBqID0gcm91bmRBdDsgaiA8IGRpZ2l0cy5sZW5ndGg7IGorKykge1xuICAgICAgZGlnaXRzW2pdID0gMDtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gV2Ugcm91bmRlZCB0byB6ZXJvIHNvIHJlc2V0IHRoZSBwYXJzZWROdW1iZXJcbiAgICBmcmFjdGlvbkxlbiA9IE1hdGgubWF4KDAsIGZyYWN0aW9uTGVuKTtcbiAgICBwYXJzZWROdW1iZXIuaW50ZWdlckxlbiA9IDE7XG4gICAgZGlnaXRzLmxlbmd0aCA9IE1hdGgubWF4KDEsIChyb3VuZEF0ID0gZnJhY3Rpb25TaXplICsgMSkpO1xuICAgIGRpZ2l0c1swXSA9IDA7XG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPCByb3VuZEF0OyBpKyspIGRpZ2l0c1tpXSA9IDA7XG4gIH1cblxuICBpZiAoZGlnaXQgPj0gNSkge1xuICAgIGlmIChyb3VuZEF0IC0gMSA8IDApIHtcbiAgICAgIGZvciAobGV0IGsgPSAwOyBrID4gcm91bmRBdDsgay0tKSB7XG4gICAgICAgIGRpZ2l0cy51bnNoaWZ0KDApO1xuICAgICAgICBwYXJzZWROdW1iZXIuaW50ZWdlckxlbisrO1xuICAgICAgfVxuICAgICAgZGlnaXRzLnVuc2hpZnQoMSk7XG4gICAgICBwYXJzZWROdW1iZXIuaW50ZWdlckxlbisrO1xuICAgIH0gZWxzZSB7XG4gICAgICBkaWdpdHNbcm91bmRBdCAtIDFdKys7XG4gICAgfVxuICB9XG5cbiAgLy8gUGFkIG91dCB3aXRoIHplcm9zIHRvIGdldCB0aGUgcmVxdWlyZWQgZnJhY3Rpb24gbGVuZ3RoXG4gIGZvciAoOyBmcmFjdGlvbkxlbiA8IE1hdGgubWF4KDAsIGZyYWN0aW9uU2l6ZSk7IGZyYWN0aW9uTGVuKyspIGRpZ2l0cy5wdXNoKDApO1xuXG4gIGxldCBkcm9wVHJhaWxpbmdaZXJvcyA9IGZyYWN0aW9uU2l6ZSAhPT0gMDtcbiAgLy8gTWluaW1hbCBsZW5ndGggPSBuYiBvZiBkZWNpbWFscyByZXF1aXJlZCArIGN1cnJlbnQgbmIgb2YgaW50ZWdlcnNcbiAgLy8gQW55IG51bWJlciBiZXNpZGVzIHRoYXQgaXMgb3B0aW9uYWwgYW5kIGNhbiBiZSByZW1vdmVkIGlmIGl0J3MgYSB0cmFpbGluZyAwXG4gIGNvbnN0IG1pbkxlbiA9IG1pbkZyYWMgKyBwYXJzZWROdW1iZXIuaW50ZWdlckxlbjtcbiAgLy8gRG8gYW55IGNhcnJ5aW5nLCBlLmcuIGEgZGlnaXQgd2FzIHJvdW5kZWQgdXAgdG8gMTBcbiAgY29uc3QgY2FycnkgPSBkaWdpdHMucmVkdWNlUmlnaHQoZnVuY3Rpb24gKGNhcnJ5LCBkLCBpLCBkaWdpdHMpIHtcbiAgICBkID0gZCArIGNhcnJ5O1xuICAgIGRpZ2l0c1tpXSA9IGQgPCAxMCA/IGQgOiBkIC0gMTA7IC8vIGQgJSAxMFxuICAgIGlmIChkcm9wVHJhaWxpbmdaZXJvcykge1xuICAgICAgLy8gRG8gbm90IGtlZXAgbWVhbmluZ2xlc3MgZnJhY3Rpb25hbCB0cmFpbGluZyB6ZXJvcyAoZS5nLiAxNS41MjAwMCAtLT4gMTUuNTIpXG4gICAgICBpZiAoZGlnaXRzW2ldID09PSAwICYmIGkgPj0gbWluTGVuKSB7XG4gICAgICAgIGRpZ2l0cy5wb3AoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRyb3BUcmFpbGluZ1plcm9zID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkID49IDEwID8gMSA6IDA7IC8vIE1hdGguZmxvb3IoZCAvIDEwKTtcbiAgfSwgMCk7XG4gIGlmIChjYXJyeSkge1xuICAgIGRpZ2l0cy51bnNoaWZ0KGNhcnJ5KTtcbiAgICBwYXJzZWROdW1iZXIuaW50ZWdlckxlbisrO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUludEF1dG9SYWRpeCh0ZXh0OiBzdHJpbmcpOiBudW1iZXIge1xuICBjb25zdCByZXN1bHQ6IG51bWJlciA9IHBhcnNlSW50KHRleHQpO1xuICBpZiAoaXNOYU4ocmVzdWx0KSkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBpbnRlZ2VyIGxpdGVyYWwgd2hlbiBwYXJzaW5nICcgKyB0ZXh0KTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuIl19