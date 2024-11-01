/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { assertNumber, assertString } from '../../util/assert';
import { ELEMENT_MARKER, I18nCreateOpCode, ICU_MARKER, } from '../interfaces/i18n';
import { getInstructionFromIcuCreateOpCode, getParentFromIcuCreateOpCode, getRefFromIcuCreateOpCode, } from './i18n_util';
/**
 * Converts `I18nCreateOpCodes` array into a human readable format.
 *
 * This function is attached to the `I18nCreateOpCodes.debug` property if `ngDevMode` is enabled.
 * This function provides a human readable view of the opcodes. This is useful when debugging the
 * application as well as writing more readable tests.
 *
 * @param this `I18nCreateOpCodes` if attached as a method.
 * @param opcodes `I18nCreateOpCodes` if invoked as a function.
 */
export function i18nCreateOpCodesToString(opcodes) {
    const createOpCodes = opcodes || (Array.isArray(this) ? this : []);
    let lines = [];
    for (let i = 0; i < createOpCodes.length; i++) {
        const opCode = createOpCodes[i++];
        const text = createOpCodes[i];
        const isComment = (opCode & I18nCreateOpCode.COMMENT) === I18nCreateOpCode.COMMENT;
        const appendNow = (opCode & I18nCreateOpCode.APPEND_EAGERLY) === I18nCreateOpCode.APPEND_EAGERLY;
        const index = opCode >>> I18nCreateOpCode.SHIFT;
        lines.push(`lView[${index}] = document.${isComment ? 'createComment' : 'createText'}(${JSON.stringify(text)});`);
        if (appendNow) {
            lines.push(`parent.appendChild(lView[${index}]);`);
        }
    }
    return lines;
}
/**
 * Converts `I18nUpdateOpCodes` array into a human readable format.
 *
 * This function is attached to the `I18nUpdateOpCodes.debug` property if `ngDevMode` is enabled.
 * This function provides a human readable view of the opcodes. This is useful when debugging the
 * application as well as writing more readable tests.
 *
 * @param this `I18nUpdateOpCodes` if attached as a method.
 * @param opcodes `I18nUpdateOpCodes` if invoked as a function.
 */
export function i18nUpdateOpCodesToString(opcodes) {
    const parser = new OpCodeParser(opcodes || (Array.isArray(this) ? this : []));
    let lines = [];
    function consumeOpCode(value) {
        const ref = value >>> 2 /* I18nUpdateOpCode.SHIFT_REF */;
        const opCode = value & 3 /* I18nUpdateOpCode.MASK_OPCODE */;
        switch (opCode) {
            case 0 /* I18nUpdateOpCode.Text */:
                return `(lView[${ref}] as Text).textContent = $$$`;
            case 1 /* I18nUpdateOpCode.Attr */:
                const attrName = parser.consumeString();
                const sanitizationFn = parser.consumeFunction();
                const value = sanitizationFn ? `(${sanitizationFn})($$$)` : '$$$';
                return `(lView[${ref}] as Element).setAttribute('${attrName}', ${value})`;
            case 2 /* I18nUpdateOpCode.IcuSwitch */:
                return `icuSwitchCase(${ref}, $$$)`;
            case 3 /* I18nUpdateOpCode.IcuUpdate */:
                return `icuUpdateCase(${ref})`;
        }
        throw new Error('unexpected OpCode');
    }
    while (parser.hasMore()) {
        let mask = parser.consumeNumber();
        let size = parser.consumeNumber();
        const end = parser.i + size;
        const statements = [];
        let statement = '';
        while (parser.i < end) {
            let value = parser.consumeNumberOrString();
            if (typeof value === 'string') {
                statement += value;
            }
            else if (value < 0) {
                // Negative numbers are ref indexes
                // Here `i` refers to current binding index. It is to signify that the value is relative,
                // rather than absolute.
                statement += '${lView[i' + value + ']}';
            }
            else {
                // Positive numbers are operations.
                const opCodeText = consumeOpCode(value);
                statements.push(opCodeText.replace('$$$', '`' + statement + '`') + ';');
                statement = '';
            }
        }
        lines.push(`if (mask & 0b${mask.toString(2)}) { ${statements.join(' ')} }`);
    }
    return lines;
}
/**
 * Converts `I18nCreateOpCodes` array into a human readable format.
 *
 * This function is attached to the `I18nCreateOpCodes.debug` if `ngDevMode` is enabled. This
 * function provides a human readable view of the opcodes. This is useful when debugging the
 * application as well as writing more readable tests.
 *
 * @param this `I18nCreateOpCodes` if attached as a method.
 * @param opcodes `I18nCreateOpCodes` if invoked as a function.
 */
export function icuCreateOpCodesToString(opcodes) {
    const parser = new OpCodeParser(opcodes || (Array.isArray(this) ? this : []));
    let lines = [];
    function consumeOpCode(opCode) {
        const parent = getParentFromIcuCreateOpCode(opCode);
        const ref = getRefFromIcuCreateOpCode(opCode);
        switch (getInstructionFromIcuCreateOpCode(opCode)) {
            case 0 /* IcuCreateOpCode.AppendChild */:
                return `(lView[${parent}] as Element).appendChild(lView[${lastRef}])`;
            case 1 /* IcuCreateOpCode.Attr */:
                return `(lView[${ref}] as Element).setAttribute("${parser.consumeString()}", "${parser.consumeString()}")`;
        }
        throw new Error('Unexpected OpCode: ' + getInstructionFromIcuCreateOpCode(opCode));
    }
    let lastRef = -1;
    while (parser.hasMore()) {
        let value = parser.consumeNumberStringOrMarker();
        if (value === ICU_MARKER) {
            const text = parser.consumeString();
            lastRef = parser.consumeNumber();
            lines.push(`lView[${lastRef}] = document.createComment("${text}")`);
        }
        else if (value === ELEMENT_MARKER) {
            const text = parser.consumeString();
            lastRef = parser.consumeNumber();
            lines.push(`lView[${lastRef}] = document.createElement("${text}")`);
        }
        else if (typeof value === 'string') {
            lastRef = parser.consumeNumber();
            lines.push(`lView[${lastRef}] = document.createTextNode("${value}")`);
        }
        else if (typeof value === 'number') {
            const line = consumeOpCode(value);
            line && lines.push(line);
        }
        else {
            throw new Error('Unexpected value');
        }
    }
    return lines;
}
/**
 * Converts `I18nRemoveOpCodes` array into a human readable format.
 *
 * This function is attached to the `I18nRemoveOpCodes.debug` if `ngDevMode` is enabled. This
 * function provides a human readable view of the opcodes. This is useful when debugging the
 * application as well as writing more readable tests.
 *
 * @param this `I18nRemoveOpCodes` if attached as a method.
 * @param opcodes `I18nRemoveOpCodes` if invoked as a function.
 */
export function i18nRemoveOpCodesToString(opcodes) {
    const removeCodes = opcodes || (Array.isArray(this) ? this : []);
    let lines = [];
    for (let i = 0; i < removeCodes.length; i++) {
        const nodeOrIcuIndex = removeCodes[i];
        if (nodeOrIcuIndex > 0) {
            // Positive numbers are `RNode`s.
            lines.push(`remove(lView[${nodeOrIcuIndex}])`);
        }
        else {
            // Negative numbers are ICUs
            lines.push(`removeNestedICU(${~nodeOrIcuIndex})`);
        }
    }
    return lines;
}
class OpCodeParser {
    constructor(codes) {
        this.i = 0;
        this.codes = codes;
    }
    hasMore() {
        return this.i < this.codes.length;
    }
    consumeNumber() {
        let value = this.codes[this.i++];
        assertNumber(value, 'expecting number in OpCode');
        return value;
    }
    consumeString() {
        let value = this.codes[this.i++];
        assertString(value, 'expecting string in OpCode');
        return value;
    }
    consumeFunction() {
        let value = this.codes[this.i++];
        if (value === null || typeof value === 'function') {
            return value;
        }
        throw new Error('expecting function in OpCode');
    }
    consumeNumberOrString() {
        let value = this.codes[this.i++];
        if (typeof value === 'string') {
            return value;
        }
        assertNumber(value, 'expecting number or string in OpCode');
        return value;
    }
    consumeNumberStringOrMarker() {
        let value = this.codes[this.i++];
        if (typeof value === 'string' ||
            typeof value === 'number' ||
            value == ICU_MARKER ||
            value == ELEMENT_MARKER) {
            return value;
        }
        assertNumber(value, 'expecting number, string, ICU_MARKER or ELEMENT_MARKER in OpCode');
        return value;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bl9kZWJ1Zy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3JlbmRlcjMvaTE4bi9pMThuX2RlYnVnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxZQUFZLEVBQUUsWUFBWSxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDN0QsT0FBTyxFQUNMLGNBQWMsRUFDZCxnQkFBZ0IsRUFLaEIsVUFBVSxHQUdYLE1BQU0sb0JBQW9CLENBQUM7QUFFNUIsT0FBTyxFQUNMLGlDQUFpQyxFQUNqQyw0QkFBNEIsRUFDNUIseUJBQXlCLEdBQzFCLE1BQU0sYUFBYSxDQUFDO0FBRXJCOzs7Ozs7Ozs7R0FTRztBQUNILE1BQU0sVUFBVSx5QkFBeUIsQ0FFdkMsT0FBMkI7SUFFM0IsTUFBTSxhQUFhLEdBQXNCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUUsRUFBVSxDQUFDLENBQUM7SUFDL0YsSUFBSSxLQUFLLEdBQWEsRUFBRSxDQUFDO0lBQ3pCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDOUMsTUFBTSxNQUFNLEdBQUcsYUFBYSxDQUFDLENBQUMsRUFBRSxDQUFRLENBQUM7UUFDekMsTUFBTSxJQUFJLEdBQUcsYUFBYSxDQUFDLENBQUMsQ0FBVyxDQUFDO1FBQ3hDLE1BQU0sU0FBUyxHQUFHLENBQUMsTUFBTSxHQUFHLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxLQUFLLGdCQUFnQixDQUFDLE9BQU8sQ0FBQztRQUNuRixNQUFNLFNBQVMsR0FDYixDQUFDLE1BQU0sR0FBRyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsS0FBSyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUM7UUFDakYsTUFBTSxLQUFLLEdBQUcsTUFBTSxLQUFLLGdCQUFnQixDQUFDLEtBQUssQ0FBQztRQUNoRCxLQUFLLENBQUMsSUFBSSxDQUNSLFNBQVMsS0FBSyxnQkFBZ0IsU0FBUyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsU0FBUyxDQUN4RixJQUFJLENBQ0wsSUFBSSxDQUNOLENBQUM7UUFDRixJQUFJLFNBQVMsRUFBRSxDQUFDO1lBQ2QsS0FBSyxDQUFDLElBQUksQ0FBQyw0QkFBNEIsS0FBSyxLQUFLLENBQUMsQ0FBQztRQUNyRCxDQUFDO0lBQ0gsQ0FBQztJQUNELE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQztBQUVEOzs7Ozs7Ozs7R0FTRztBQUNILE1BQU0sVUFBVSx5QkFBeUIsQ0FFdkMsT0FBMkI7SUFFM0IsTUFBTSxNQUFNLEdBQUcsSUFBSSxZQUFZLENBQUMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzlFLElBQUksS0FBSyxHQUFhLEVBQUUsQ0FBQztJQUV6QixTQUFTLGFBQWEsQ0FBQyxLQUFhO1FBQ2xDLE1BQU0sR0FBRyxHQUFHLEtBQUssdUNBQStCLENBQUM7UUFDakQsTUFBTSxNQUFNLEdBQUcsS0FBSyx1Q0FBK0IsQ0FBQztRQUNwRCxRQUFRLE1BQU0sRUFBRSxDQUFDO1lBQ2Y7Z0JBQ0UsT0FBTyxVQUFVLEdBQUcsOEJBQThCLENBQUM7WUFDckQ7Z0JBQ0UsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDO2dCQUN4QyxNQUFNLGNBQWMsR0FBRyxNQUFNLENBQUMsZUFBZSxFQUFFLENBQUM7Z0JBQ2hELE1BQU0sS0FBSyxHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsSUFBSSxjQUFjLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO2dCQUNsRSxPQUFPLFVBQVUsR0FBRywrQkFBK0IsUUFBUSxNQUFNLEtBQUssR0FBRyxDQUFDO1lBQzVFO2dCQUNFLE9BQU8saUJBQWlCLEdBQUcsUUFBUSxDQUFDO1lBQ3RDO2dCQUNFLE9BQU8saUJBQWlCLEdBQUcsR0FBRyxDQUFDO1FBQ25DLENBQUM7UUFDRCxNQUFNLElBQUksS0FBSyxDQUFDLG1CQUFtQixDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVELE9BQU8sTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUM7UUFDeEIsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ2xDLElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUNsQyxNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUM1QixNQUFNLFVBQVUsR0FBYSxFQUFFLENBQUM7UUFDaEMsSUFBSSxTQUFTLEdBQUcsRUFBRSxDQUFDO1FBQ25CLE9BQU8sTUFBTSxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztZQUN0QixJQUFJLEtBQUssR0FBRyxNQUFNLENBQUMscUJBQXFCLEVBQUUsQ0FBQztZQUMzQyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRSxDQUFDO2dCQUM5QixTQUFTLElBQUksS0FBSyxDQUFDO1lBQ3JCLENBQUM7aUJBQU0sSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ3JCLG1DQUFtQztnQkFDbkMseUZBQXlGO2dCQUN6Rix3QkFBd0I7Z0JBQ3hCLFNBQVMsSUFBSSxXQUFXLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQztZQUMxQyxDQUFDO2lCQUFNLENBQUM7Z0JBQ04sbUNBQW1DO2dCQUNuQyxNQUFNLFVBQVUsR0FBRyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3hDLFVBQVUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxHQUFHLFNBQVMsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDeEUsU0FBUyxHQUFHLEVBQUUsQ0FBQztZQUNqQixDQUFDO1FBQ0gsQ0FBQztRQUNELEtBQUssQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU8sVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDOUUsQ0FBQztJQUNELE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQztBQUVEOzs7Ozs7Ozs7R0FTRztBQUNILE1BQU0sVUFBVSx3QkFBd0IsQ0FFdEMsT0FBMEI7SUFFMUIsTUFBTSxNQUFNLEdBQUcsSUFBSSxZQUFZLENBQUMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzlFLElBQUksS0FBSyxHQUFhLEVBQUUsQ0FBQztJQUV6QixTQUFTLGFBQWEsQ0FBQyxNQUFjO1FBQ25DLE1BQU0sTUFBTSxHQUFHLDRCQUE0QixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3BELE1BQU0sR0FBRyxHQUFHLHlCQUF5QixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzlDLFFBQVEsaUNBQWlDLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztZQUNsRDtnQkFDRSxPQUFPLFVBQVUsTUFBTSxtQ0FBbUMsT0FBTyxJQUFJLENBQUM7WUFDeEU7Z0JBQ0UsT0FBTyxVQUFVLEdBQUcsK0JBQStCLE1BQU0sQ0FBQyxhQUFhLEVBQUUsT0FBTyxNQUFNLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQztRQUMvRyxDQUFDO1FBQ0QsTUFBTSxJQUFJLEtBQUssQ0FBQyxxQkFBcUIsR0FBRyxpQ0FBaUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ3JGLENBQUM7SUFFRCxJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNqQixPQUFPLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDO1FBQ3hCLElBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQywyQkFBMkIsRUFBRSxDQUFDO1FBQ2pELElBQUksS0FBSyxLQUFLLFVBQVUsRUFBRSxDQUFDO1lBQ3pCLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUNwQyxPQUFPLEdBQUcsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ2pDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxPQUFPLCtCQUErQixJQUFJLElBQUksQ0FBQyxDQUFDO1FBQ3RFLENBQUM7YUFBTSxJQUFJLEtBQUssS0FBSyxjQUFjLEVBQUUsQ0FBQztZQUNwQyxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDcEMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUNqQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsT0FBTywrQkFBK0IsSUFBSSxJQUFJLENBQUMsQ0FBQztRQUN0RSxDQUFDO2FBQU0sSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUUsQ0FBQztZQUNyQyxPQUFPLEdBQUcsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ2pDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxPQUFPLGdDQUFnQyxLQUFLLElBQUksQ0FBQyxDQUFDO1FBQ3hFLENBQUM7YUFBTSxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRSxDQUFDO1lBQ3JDLE1BQU0sSUFBSSxHQUFHLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNsQyxJQUFJLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzQixDQUFDO2FBQU0sQ0FBQztZQUNOLE1BQU0sSUFBSSxLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUN0QyxDQUFDO0lBQ0gsQ0FBQztJQUVELE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQztBQUVEOzs7Ozs7Ozs7R0FTRztBQUNILE1BQU0sVUFBVSx5QkFBeUIsQ0FFdkMsT0FBMkI7SUFFM0IsTUFBTSxXQUFXLEdBQUcsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNqRSxJQUFJLEtBQUssR0FBYSxFQUFFLENBQUM7SUFFekIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUM1QyxNQUFNLGNBQWMsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFXLENBQUM7UUFDaEQsSUFBSSxjQUFjLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDdkIsaUNBQWlDO1lBQ2pDLEtBQUssQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLGNBQWMsSUFBSSxDQUFDLENBQUM7UUFDakQsQ0FBQzthQUFNLENBQUM7WUFDTiw0QkFBNEI7WUFDNUIsS0FBSyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDO1FBQ3BELENBQUM7SUFDSCxDQUFDO0lBRUQsT0FBTyxLQUFLLENBQUM7QUFDZixDQUFDO0FBRUQsTUFBTSxZQUFZO0lBSWhCLFlBQVksS0FBWTtRQUh4QixNQUFDLEdBQVcsQ0FBQyxDQUFDO1FBSVosSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDckIsQ0FBQztJQUVELE9BQU87UUFDTCxPQUFPLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7SUFDcEMsQ0FBQztJQUVELGFBQWE7UUFDWCxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2pDLFlBQVksQ0FBQyxLQUFLLEVBQUUsNEJBQTRCLENBQUMsQ0FBQztRQUNsRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFRCxhQUFhO1FBQ1gsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNqQyxZQUFZLENBQUMsS0FBSyxFQUFFLDRCQUE0QixDQUFDLENBQUM7UUFDbEQsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRUQsZUFBZTtRQUNiLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDakMsSUFBSSxLQUFLLEtBQUssSUFBSSxJQUFJLE9BQU8sS0FBSyxLQUFLLFVBQVUsRUFBRSxDQUFDO1lBQ2xELE9BQU8sS0FBSyxDQUFDO1FBQ2YsQ0FBQztRQUNELE1BQU0sSUFBSSxLQUFLLENBQUMsOEJBQThCLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRUQscUJBQXFCO1FBQ25CLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDakMsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUUsQ0FBQztZQUM5QixPQUFPLEtBQUssQ0FBQztRQUNmLENBQUM7UUFDRCxZQUFZLENBQUMsS0FBSyxFQUFFLHNDQUFzQyxDQUFDLENBQUM7UUFDNUQsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRUQsMkJBQTJCO1FBQ3pCLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDakMsSUFDRSxPQUFPLEtBQUssS0FBSyxRQUFRO1lBQ3pCLE9BQU8sS0FBSyxLQUFLLFFBQVE7WUFDekIsS0FBSyxJQUFJLFVBQVU7WUFDbkIsS0FBSyxJQUFJLGNBQWMsRUFDdkIsQ0FBQztZQUNELE9BQU8sS0FBSyxDQUFDO1FBQ2YsQ0FBQztRQUNELFlBQVksQ0FBQyxLQUFLLEVBQUUsa0VBQWtFLENBQUMsQ0FBQztRQUN4RixPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHthc3NlcnROdW1iZXIsIGFzc2VydFN0cmluZ30gZnJvbSAnLi4vLi4vdXRpbC9hc3NlcnQnO1xuaW1wb3J0IHtcbiAgRUxFTUVOVF9NQVJLRVIsXG4gIEkxOG5DcmVhdGVPcENvZGUsXG4gIEkxOG5DcmVhdGVPcENvZGVzLFxuICBJMThuUmVtb3ZlT3BDb2RlcyxcbiAgSTE4blVwZGF0ZU9wQ29kZSxcbiAgSTE4blVwZGF0ZU9wQ29kZXMsXG4gIElDVV9NQVJLRVIsXG4gIEljdUNyZWF0ZU9wQ29kZSxcbiAgSWN1Q3JlYXRlT3BDb2Rlcyxcbn0gZnJvbSAnLi4vaW50ZXJmYWNlcy9pMThuJztcblxuaW1wb3J0IHtcbiAgZ2V0SW5zdHJ1Y3Rpb25Gcm9tSWN1Q3JlYXRlT3BDb2RlLFxuICBnZXRQYXJlbnRGcm9tSWN1Q3JlYXRlT3BDb2RlLFxuICBnZXRSZWZGcm9tSWN1Q3JlYXRlT3BDb2RlLFxufSBmcm9tICcuL2kxOG5fdXRpbCc7XG5cbi8qKlxuICogQ29udmVydHMgYEkxOG5DcmVhdGVPcENvZGVzYCBhcnJheSBpbnRvIGEgaHVtYW4gcmVhZGFibGUgZm9ybWF0LlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gaXMgYXR0YWNoZWQgdG8gdGhlIGBJMThuQ3JlYXRlT3BDb2Rlcy5kZWJ1Z2AgcHJvcGVydHkgaWYgYG5nRGV2TW9kZWAgaXMgZW5hYmxlZC5cbiAqIFRoaXMgZnVuY3Rpb24gcHJvdmlkZXMgYSBodW1hbiByZWFkYWJsZSB2aWV3IG9mIHRoZSBvcGNvZGVzLiBUaGlzIGlzIHVzZWZ1bCB3aGVuIGRlYnVnZ2luZyB0aGVcbiAqIGFwcGxpY2F0aW9uIGFzIHdlbGwgYXMgd3JpdGluZyBtb3JlIHJlYWRhYmxlIHRlc3RzLlxuICpcbiAqIEBwYXJhbSB0aGlzIGBJMThuQ3JlYXRlT3BDb2Rlc2AgaWYgYXR0YWNoZWQgYXMgYSBtZXRob2QuXG4gKiBAcGFyYW0gb3Bjb2RlcyBgSTE4bkNyZWF0ZU9wQ29kZXNgIGlmIGludm9rZWQgYXMgYSBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGkxOG5DcmVhdGVPcENvZGVzVG9TdHJpbmcoXG4gIHRoaXM6IEkxOG5DcmVhdGVPcENvZGVzIHwgdm9pZCxcbiAgb3Bjb2Rlcz86IEkxOG5DcmVhdGVPcENvZGVzLFxuKTogc3RyaW5nW10ge1xuICBjb25zdCBjcmVhdGVPcENvZGVzOiBJMThuQ3JlYXRlT3BDb2RlcyA9IG9wY29kZXMgfHwgKEFycmF5LmlzQXJyYXkodGhpcykgPyB0aGlzIDogKFtdIGFzIGFueSkpO1xuICBsZXQgbGluZXM6IHN0cmluZ1tdID0gW107XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY3JlYXRlT3BDb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IG9wQ29kZSA9IGNyZWF0ZU9wQ29kZXNbaSsrXSBhcyBhbnk7XG4gICAgY29uc3QgdGV4dCA9IGNyZWF0ZU9wQ29kZXNbaV0gYXMgc3RyaW5nO1xuICAgIGNvbnN0IGlzQ29tbWVudCA9IChvcENvZGUgJiBJMThuQ3JlYXRlT3BDb2RlLkNPTU1FTlQpID09PSBJMThuQ3JlYXRlT3BDb2RlLkNPTU1FTlQ7XG4gICAgY29uc3QgYXBwZW5kTm93ID1cbiAgICAgIChvcENvZGUgJiBJMThuQ3JlYXRlT3BDb2RlLkFQUEVORF9FQUdFUkxZKSA9PT0gSTE4bkNyZWF0ZU9wQ29kZS5BUFBFTkRfRUFHRVJMWTtcbiAgICBjb25zdCBpbmRleCA9IG9wQ29kZSA+Pj4gSTE4bkNyZWF0ZU9wQ29kZS5TSElGVDtcbiAgICBsaW5lcy5wdXNoKFxuICAgICAgYGxWaWV3WyR7aW5kZXh9XSA9IGRvY3VtZW50LiR7aXNDb21tZW50ID8gJ2NyZWF0ZUNvbW1lbnQnIDogJ2NyZWF0ZVRleHQnfSgke0pTT04uc3RyaW5naWZ5KFxuICAgICAgICB0ZXh0LFxuICAgICAgKX0pO2AsXG4gICAgKTtcbiAgICBpZiAoYXBwZW5kTm93KSB7XG4gICAgICBsaW5lcy5wdXNoKGBwYXJlbnQuYXBwZW5kQ2hpbGQobFZpZXdbJHtpbmRleH1dKTtgKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGxpbmVzO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGBJMThuVXBkYXRlT3BDb2Rlc2AgYXJyYXkgaW50byBhIGh1bWFuIHJlYWRhYmxlIGZvcm1hdC5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIGlzIGF0dGFjaGVkIHRvIHRoZSBgSTE4blVwZGF0ZU9wQ29kZXMuZGVidWdgIHByb3BlcnR5IGlmIGBuZ0Rldk1vZGVgIGlzIGVuYWJsZWQuXG4gKiBUaGlzIGZ1bmN0aW9uIHByb3ZpZGVzIGEgaHVtYW4gcmVhZGFibGUgdmlldyBvZiB0aGUgb3Bjb2Rlcy4gVGhpcyBpcyB1c2VmdWwgd2hlbiBkZWJ1Z2dpbmcgdGhlXG4gKiBhcHBsaWNhdGlvbiBhcyB3ZWxsIGFzIHdyaXRpbmcgbW9yZSByZWFkYWJsZSB0ZXN0cy5cbiAqXG4gKiBAcGFyYW0gdGhpcyBgSTE4blVwZGF0ZU9wQ29kZXNgIGlmIGF0dGFjaGVkIGFzIGEgbWV0aG9kLlxuICogQHBhcmFtIG9wY29kZXMgYEkxOG5VcGRhdGVPcENvZGVzYCBpZiBpbnZva2VkIGFzIGEgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpMThuVXBkYXRlT3BDb2Rlc1RvU3RyaW5nKFxuICB0aGlzOiBJMThuVXBkYXRlT3BDb2RlcyB8IHZvaWQsXG4gIG9wY29kZXM/OiBJMThuVXBkYXRlT3BDb2Rlcyxcbik6IHN0cmluZ1tdIHtcbiAgY29uc3QgcGFyc2VyID0gbmV3IE9wQ29kZVBhcnNlcihvcGNvZGVzIHx8IChBcnJheS5pc0FycmF5KHRoaXMpID8gdGhpcyA6IFtdKSk7XG4gIGxldCBsaW5lczogc3RyaW5nW10gPSBbXTtcblxuICBmdW5jdGlvbiBjb25zdW1lT3BDb2RlKHZhbHVlOiBudW1iZXIpOiBzdHJpbmcge1xuICAgIGNvbnN0IHJlZiA9IHZhbHVlID4+PiBJMThuVXBkYXRlT3BDb2RlLlNISUZUX1JFRjtcbiAgICBjb25zdCBvcENvZGUgPSB2YWx1ZSAmIEkxOG5VcGRhdGVPcENvZGUuTUFTS19PUENPREU7XG4gICAgc3dpdGNoIChvcENvZGUpIHtcbiAgICAgIGNhc2UgSTE4blVwZGF0ZU9wQ29kZS5UZXh0OlxuICAgICAgICByZXR1cm4gYChsVmlld1ske3JlZn1dIGFzIFRleHQpLnRleHRDb250ZW50ID0gJCQkYDtcbiAgICAgIGNhc2UgSTE4blVwZGF0ZU9wQ29kZS5BdHRyOlxuICAgICAgICBjb25zdCBhdHRyTmFtZSA9IHBhcnNlci5jb25zdW1lU3RyaW5nKCk7XG4gICAgICAgIGNvbnN0IHNhbml0aXphdGlvbkZuID0gcGFyc2VyLmNvbnN1bWVGdW5jdGlvbigpO1xuICAgICAgICBjb25zdCB2YWx1ZSA9IHNhbml0aXphdGlvbkZuID8gYCgke3Nhbml0aXphdGlvbkZufSkoJCQkKWAgOiAnJCQkJztcbiAgICAgICAgcmV0dXJuIGAobFZpZXdbJHtyZWZ9XSBhcyBFbGVtZW50KS5zZXRBdHRyaWJ1dGUoJyR7YXR0ck5hbWV9JywgJHt2YWx1ZX0pYDtcbiAgICAgIGNhc2UgSTE4blVwZGF0ZU9wQ29kZS5JY3VTd2l0Y2g6XG4gICAgICAgIHJldHVybiBgaWN1U3dpdGNoQ2FzZSgke3JlZn0sICQkJClgO1xuICAgICAgY2FzZSBJMThuVXBkYXRlT3BDb2RlLkljdVVwZGF0ZTpcbiAgICAgICAgcmV0dXJuIGBpY3VVcGRhdGVDYXNlKCR7cmVmfSlgO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuZXhwZWN0ZWQgT3BDb2RlJyk7XG4gIH1cblxuICB3aGlsZSAocGFyc2VyLmhhc01vcmUoKSkge1xuICAgIGxldCBtYXNrID0gcGFyc2VyLmNvbnN1bWVOdW1iZXIoKTtcbiAgICBsZXQgc2l6ZSA9IHBhcnNlci5jb25zdW1lTnVtYmVyKCk7XG4gICAgY29uc3QgZW5kID0gcGFyc2VyLmkgKyBzaXplO1xuICAgIGNvbnN0IHN0YXRlbWVudHM6IHN0cmluZ1tdID0gW107XG4gICAgbGV0IHN0YXRlbWVudCA9ICcnO1xuICAgIHdoaWxlIChwYXJzZXIuaSA8IGVuZCkge1xuICAgICAgbGV0IHZhbHVlID0gcGFyc2VyLmNvbnN1bWVOdW1iZXJPclN0cmluZygpO1xuICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgc3RhdGVtZW50ICs9IHZhbHVlO1xuICAgICAgfSBlbHNlIGlmICh2YWx1ZSA8IDApIHtcbiAgICAgICAgLy8gTmVnYXRpdmUgbnVtYmVycyBhcmUgcmVmIGluZGV4ZXNcbiAgICAgICAgLy8gSGVyZSBgaWAgcmVmZXJzIHRvIGN1cnJlbnQgYmluZGluZyBpbmRleC4gSXQgaXMgdG8gc2lnbmlmeSB0aGF0IHRoZSB2YWx1ZSBpcyByZWxhdGl2ZSxcbiAgICAgICAgLy8gcmF0aGVyIHRoYW4gYWJzb2x1dGUuXG4gICAgICAgIHN0YXRlbWVudCArPSAnJHtsVmlld1tpJyArIHZhbHVlICsgJ119JztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFBvc2l0aXZlIG51bWJlcnMgYXJlIG9wZXJhdGlvbnMuXG4gICAgICAgIGNvbnN0IG9wQ29kZVRleHQgPSBjb25zdW1lT3BDb2RlKHZhbHVlKTtcbiAgICAgICAgc3RhdGVtZW50cy5wdXNoKG9wQ29kZVRleHQucmVwbGFjZSgnJCQkJywgJ2AnICsgc3RhdGVtZW50ICsgJ2AnKSArICc7Jyk7XG4gICAgICAgIHN0YXRlbWVudCA9ICcnO1xuICAgICAgfVxuICAgIH1cbiAgICBsaW5lcy5wdXNoKGBpZiAobWFzayAmIDBiJHttYXNrLnRvU3RyaW5nKDIpfSkgeyAke3N0YXRlbWVudHMuam9pbignICcpfSB9YCk7XG4gIH1cbiAgcmV0dXJuIGxpbmVzO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGBJMThuQ3JlYXRlT3BDb2Rlc2AgYXJyYXkgaW50byBhIGh1bWFuIHJlYWRhYmxlIGZvcm1hdC5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIGlzIGF0dGFjaGVkIHRvIHRoZSBgSTE4bkNyZWF0ZU9wQ29kZXMuZGVidWdgIGlmIGBuZ0Rldk1vZGVgIGlzIGVuYWJsZWQuIFRoaXNcbiAqIGZ1bmN0aW9uIHByb3ZpZGVzIGEgaHVtYW4gcmVhZGFibGUgdmlldyBvZiB0aGUgb3Bjb2Rlcy4gVGhpcyBpcyB1c2VmdWwgd2hlbiBkZWJ1Z2dpbmcgdGhlXG4gKiBhcHBsaWNhdGlvbiBhcyB3ZWxsIGFzIHdyaXRpbmcgbW9yZSByZWFkYWJsZSB0ZXN0cy5cbiAqXG4gKiBAcGFyYW0gdGhpcyBgSTE4bkNyZWF0ZU9wQ29kZXNgIGlmIGF0dGFjaGVkIGFzIGEgbWV0aG9kLlxuICogQHBhcmFtIG9wY29kZXMgYEkxOG5DcmVhdGVPcENvZGVzYCBpZiBpbnZva2VkIGFzIGEgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpY3VDcmVhdGVPcENvZGVzVG9TdHJpbmcoXG4gIHRoaXM6IEljdUNyZWF0ZU9wQ29kZXMgfCB2b2lkLFxuICBvcGNvZGVzPzogSWN1Q3JlYXRlT3BDb2Rlcyxcbik6IHN0cmluZ1tdIHtcbiAgY29uc3QgcGFyc2VyID0gbmV3IE9wQ29kZVBhcnNlcihvcGNvZGVzIHx8IChBcnJheS5pc0FycmF5KHRoaXMpID8gdGhpcyA6IFtdKSk7XG4gIGxldCBsaW5lczogc3RyaW5nW10gPSBbXTtcblxuICBmdW5jdGlvbiBjb25zdW1lT3BDb2RlKG9wQ29kZTogbnVtYmVyKTogc3RyaW5nIHtcbiAgICBjb25zdCBwYXJlbnQgPSBnZXRQYXJlbnRGcm9tSWN1Q3JlYXRlT3BDb2RlKG9wQ29kZSk7XG4gICAgY29uc3QgcmVmID0gZ2V0UmVmRnJvbUljdUNyZWF0ZU9wQ29kZShvcENvZGUpO1xuICAgIHN3aXRjaCAoZ2V0SW5zdHJ1Y3Rpb25Gcm9tSWN1Q3JlYXRlT3BDb2RlKG9wQ29kZSkpIHtcbiAgICAgIGNhc2UgSWN1Q3JlYXRlT3BDb2RlLkFwcGVuZENoaWxkOlxuICAgICAgICByZXR1cm4gYChsVmlld1ske3BhcmVudH1dIGFzIEVsZW1lbnQpLmFwcGVuZENoaWxkKGxWaWV3WyR7bGFzdFJlZn1dKWA7XG4gICAgICBjYXNlIEljdUNyZWF0ZU9wQ29kZS5BdHRyOlxuICAgICAgICByZXR1cm4gYChsVmlld1ske3JlZn1dIGFzIEVsZW1lbnQpLnNldEF0dHJpYnV0ZShcIiR7cGFyc2VyLmNvbnN1bWVTdHJpbmcoKX1cIiwgXCIke3BhcnNlci5jb25zdW1lU3RyaW5nKCl9XCIpYDtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKCdVbmV4cGVjdGVkIE9wQ29kZTogJyArIGdldEluc3RydWN0aW9uRnJvbUljdUNyZWF0ZU9wQ29kZShvcENvZGUpKTtcbiAgfVxuXG4gIGxldCBsYXN0UmVmID0gLTE7XG4gIHdoaWxlIChwYXJzZXIuaGFzTW9yZSgpKSB7XG4gICAgbGV0IHZhbHVlID0gcGFyc2VyLmNvbnN1bWVOdW1iZXJTdHJpbmdPck1hcmtlcigpO1xuICAgIGlmICh2YWx1ZSA9PT0gSUNVX01BUktFUikge1xuICAgICAgY29uc3QgdGV4dCA9IHBhcnNlci5jb25zdW1lU3RyaW5nKCk7XG4gICAgICBsYXN0UmVmID0gcGFyc2VyLmNvbnN1bWVOdW1iZXIoKTtcbiAgICAgIGxpbmVzLnB1c2goYGxWaWV3WyR7bGFzdFJlZn1dID0gZG9jdW1lbnQuY3JlYXRlQ29tbWVudChcIiR7dGV4dH1cIilgKTtcbiAgICB9IGVsc2UgaWYgKHZhbHVlID09PSBFTEVNRU5UX01BUktFUikge1xuICAgICAgY29uc3QgdGV4dCA9IHBhcnNlci5jb25zdW1lU3RyaW5nKCk7XG4gICAgICBsYXN0UmVmID0gcGFyc2VyLmNvbnN1bWVOdW1iZXIoKTtcbiAgICAgIGxpbmVzLnB1c2goYGxWaWV3WyR7bGFzdFJlZn1dID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIiR7dGV4dH1cIilgKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGxhc3RSZWYgPSBwYXJzZXIuY29uc3VtZU51bWJlcigpO1xuICAgICAgbGluZXMucHVzaChgbFZpZXdbJHtsYXN0UmVmfV0gPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIiR7dmFsdWV9XCIpYCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSB7XG4gICAgICBjb25zdCBsaW5lID0gY29uc3VtZU9wQ29kZSh2YWx1ZSk7XG4gICAgICBsaW5lICYmIGxpbmVzLnB1c2gobGluZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5leHBlY3RlZCB2YWx1ZScpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBsaW5lcztcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBgSTE4blJlbW92ZU9wQ29kZXNgIGFycmF5IGludG8gYSBodW1hbiByZWFkYWJsZSBmb3JtYXQuXG4gKlxuICogVGhpcyBmdW5jdGlvbiBpcyBhdHRhY2hlZCB0byB0aGUgYEkxOG5SZW1vdmVPcENvZGVzLmRlYnVnYCBpZiBgbmdEZXZNb2RlYCBpcyBlbmFibGVkLiBUaGlzXG4gKiBmdW5jdGlvbiBwcm92aWRlcyBhIGh1bWFuIHJlYWRhYmxlIHZpZXcgb2YgdGhlIG9wY29kZXMuIFRoaXMgaXMgdXNlZnVsIHdoZW4gZGVidWdnaW5nIHRoZVxuICogYXBwbGljYXRpb24gYXMgd2VsbCBhcyB3cml0aW5nIG1vcmUgcmVhZGFibGUgdGVzdHMuXG4gKlxuICogQHBhcmFtIHRoaXMgYEkxOG5SZW1vdmVPcENvZGVzYCBpZiBhdHRhY2hlZCBhcyBhIG1ldGhvZC5cbiAqIEBwYXJhbSBvcGNvZGVzIGBJMThuUmVtb3ZlT3BDb2Rlc2AgaWYgaW52b2tlZCBhcyBhIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaTE4blJlbW92ZU9wQ29kZXNUb1N0cmluZyhcbiAgdGhpczogSTE4blJlbW92ZU9wQ29kZXMgfCB2b2lkLFxuICBvcGNvZGVzPzogSTE4blJlbW92ZU9wQ29kZXMsXG4pOiBzdHJpbmdbXSB7XG4gIGNvbnN0IHJlbW92ZUNvZGVzID0gb3Bjb2RlcyB8fCAoQXJyYXkuaXNBcnJheSh0aGlzKSA/IHRoaXMgOiBbXSk7XG4gIGxldCBsaW5lczogc3RyaW5nW10gPSBbXTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHJlbW92ZUNvZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3Qgbm9kZU9ySWN1SW5kZXggPSByZW1vdmVDb2Rlc1tpXSBhcyBudW1iZXI7XG4gICAgaWYgKG5vZGVPckljdUluZGV4ID4gMCkge1xuICAgICAgLy8gUG9zaXRpdmUgbnVtYmVycyBhcmUgYFJOb2RlYHMuXG4gICAgICBsaW5lcy5wdXNoKGByZW1vdmUobFZpZXdbJHtub2RlT3JJY3VJbmRleH1dKWApO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBOZWdhdGl2ZSBudW1iZXJzIGFyZSBJQ1VzXG4gICAgICBsaW5lcy5wdXNoKGByZW1vdmVOZXN0ZWRJQ1UoJHt+bm9kZU9ySWN1SW5kZXh9KWApO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBsaW5lcztcbn1cblxuY2xhc3MgT3BDb2RlUGFyc2VyIHtcbiAgaTogbnVtYmVyID0gMDtcbiAgY29kZXM6IGFueVtdO1xuXG4gIGNvbnN0cnVjdG9yKGNvZGVzOiBhbnlbXSkge1xuICAgIHRoaXMuY29kZXMgPSBjb2RlcztcbiAgfVxuXG4gIGhhc01vcmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuaSA8IHRoaXMuY29kZXMubGVuZ3RoO1xuICB9XG5cbiAgY29uc3VtZU51bWJlcigpOiBudW1iZXIge1xuICAgIGxldCB2YWx1ZSA9IHRoaXMuY29kZXNbdGhpcy5pKytdO1xuICAgIGFzc2VydE51bWJlcih2YWx1ZSwgJ2V4cGVjdGluZyBudW1iZXIgaW4gT3BDb2RlJyk7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgY29uc3VtZVN0cmluZygpOiBzdHJpbmcge1xuICAgIGxldCB2YWx1ZSA9IHRoaXMuY29kZXNbdGhpcy5pKytdO1xuICAgIGFzc2VydFN0cmluZyh2YWx1ZSwgJ2V4cGVjdGluZyBzdHJpbmcgaW4gT3BDb2RlJyk7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgY29uc3VtZUZ1bmN0aW9uKCk6IEZ1bmN0aW9uIHwgbnVsbCB7XG4gICAgbGV0IHZhbHVlID0gdGhpcy5jb2Rlc1t0aGlzLmkrK107XG4gICAgaWYgKHZhbHVlID09PSBudWxsIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2V4cGVjdGluZyBmdW5jdGlvbiBpbiBPcENvZGUnKTtcbiAgfVxuXG4gIGNvbnN1bWVOdW1iZXJPclN0cmluZygpOiBudW1iZXIgfCBzdHJpbmcge1xuICAgIGxldCB2YWx1ZSA9IHRoaXMuY29kZXNbdGhpcy5pKytdO1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICAgIGFzc2VydE51bWJlcih2YWx1ZSwgJ2V4cGVjdGluZyBudW1iZXIgb3Igc3RyaW5nIGluIE9wQ29kZScpO1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIGNvbnN1bWVOdW1iZXJTdHJpbmdPck1hcmtlcigpOiBudW1iZXIgfCBzdHJpbmcgfCBJQ1VfTUFSS0VSIHwgRUxFTUVOVF9NQVJLRVIge1xuICAgIGxldCB2YWx1ZSA9IHRoaXMuY29kZXNbdGhpcy5pKytdO1xuICAgIGlmIChcbiAgICAgIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgfHxcbiAgICAgIHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgfHxcbiAgICAgIHZhbHVlID09IElDVV9NQVJLRVIgfHxcbiAgICAgIHZhbHVlID09IEVMRU1FTlRfTUFSS0VSXG4gICAgKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICAgIGFzc2VydE51bWJlcih2YWx1ZSwgJ2V4cGVjdGluZyBudW1iZXIsIHN0cmluZywgSUNVX01BUktFUiBvciBFTEVNRU5UX01BUktFUiBpbiBPcENvZGUnKTtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbn1cbiJdfQ==