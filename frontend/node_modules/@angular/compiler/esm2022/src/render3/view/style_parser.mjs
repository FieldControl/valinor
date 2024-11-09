/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Parses string representation of a style and converts it into object literal.
 *
 * @param value string representation of style as used in the `style` attribute in HTML.
 *   Example: `color: red; height: auto`.
 * @returns An array of style property name and value pairs, e.g. `['color', 'red', 'height',
 * 'auto']`
 */
export function parse(value) {
    // we use a string array here instead of a string map
    // because a string-map is not guaranteed to retain the
    // order of the entries whereas a string array can be
    // constructed in a [key, value, key, value] format.
    const styles = [];
    let i = 0;
    let parenDepth = 0;
    let quote = 0 /* Char.QuoteNone */;
    let valueStart = 0;
    let propStart = 0;
    let currentProp = null;
    while (i < value.length) {
        const token = value.charCodeAt(i++);
        switch (token) {
            case 40 /* Char.OpenParen */:
                parenDepth++;
                break;
            case 41 /* Char.CloseParen */:
                parenDepth--;
                break;
            case 39 /* Char.QuoteSingle */:
                // valueStart needs to be there since prop values don't
                // have quotes in CSS
                if (quote === 0 /* Char.QuoteNone */) {
                    quote = 39 /* Char.QuoteSingle */;
                }
                else if (quote === 39 /* Char.QuoteSingle */ && value.charCodeAt(i - 1) !== 92 /* Char.BackSlash */) {
                    quote = 0 /* Char.QuoteNone */;
                }
                break;
            case 34 /* Char.QuoteDouble */:
                // same logic as above
                if (quote === 0 /* Char.QuoteNone */) {
                    quote = 34 /* Char.QuoteDouble */;
                }
                else if (quote === 34 /* Char.QuoteDouble */ && value.charCodeAt(i - 1) !== 92 /* Char.BackSlash */) {
                    quote = 0 /* Char.QuoteNone */;
                }
                break;
            case 58 /* Char.Colon */:
                if (!currentProp && parenDepth === 0 && quote === 0 /* Char.QuoteNone */) {
                    // TODO: Do not hyphenate CSS custom property names like: `--intentionallyCamelCase`
                    currentProp = hyphenate(value.substring(propStart, i - 1).trim());
                    valueStart = i;
                }
                break;
            case 59 /* Char.Semicolon */:
                if (currentProp && valueStart > 0 && parenDepth === 0 && quote === 0 /* Char.QuoteNone */) {
                    const styleVal = value.substring(valueStart, i - 1).trim();
                    styles.push(currentProp, styleVal);
                    propStart = i;
                    valueStart = 0;
                    currentProp = null;
                }
                break;
        }
    }
    if (currentProp && valueStart) {
        const styleVal = value.slice(valueStart).trim();
        styles.push(currentProp, styleVal);
    }
    return styles;
}
export function hyphenate(value) {
    return value
        .replace(/[a-z][A-Z]/g, v => {
        return v.charAt(0) + '-' + v.charAt(1);
    })
        .toLowerCase();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGVfcGFyc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3JlbmRlcjMvdmlldy9zdHlsZV9wYXJzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBaUJIOzs7Ozs7O0dBT0c7QUFDSCxNQUFNLFVBQVUsS0FBSyxDQUFDLEtBQWE7SUFDakMscURBQXFEO0lBQ3JELHVEQUF1RDtJQUN2RCxxREFBcUQ7SUFDckQsb0RBQW9EO0lBQ3BELE1BQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQztJQUU1QixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDVixJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUM7SUFDbkIsSUFBSSxLQUFLLHlCQUF1QixDQUFDO0lBQ2pDLElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQztJQUNuQixJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7SUFDbEIsSUFBSSxXQUFXLEdBQWdCLElBQUksQ0FBQztJQUNwQyxPQUFPLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDeEIsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBUyxDQUFDO1FBQzVDLFFBQVEsS0FBSyxFQUFFLENBQUM7WUFDZDtnQkFDRSxVQUFVLEVBQUUsQ0FBQztnQkFDYixNQUFNO1lBQ1I7Z0JBQ0UsVUFBVSxFQUFFLENBQUM7Z0JBQ2IsTUFBTTtZQUNSO2dCQUNFLHVEQUF1RDtnQkFDdkQscUJBQXFCO2dCQUNyQixJQUFJLEtBQUssMkJBQW1CLEVBQUUsQ0FBQztvQkFDN0IsS0FBSyw0QkFBbUIsQ0FBQztnQkFDM0IsQ0FBQztxQkFBTSxJQUFJLEtBQUssOEJBQXFCLElBQUksS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLDRCQUFtQixFQUFFLENBQUM7b0JBQ3BGLEtBQUsseUJBQWlCLENBQUM7Z0JBQ3pCLENBQUM7Z0JBQ0QsTUFBTTtZQUNSO2dCQUNFLHNCQUFzQjtnQkFDdEIsSUFBSSxLQUFLLDJCQUFtQixFQUFFLENBQUM7b0JBQzdCLEtBQUssNEJBQW1CLENBQUM7Z0JBQzNCLENBQUM7cUJBQU0sSUFBSSxLQUFLLDhCQUFxQixJQUFJLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyw0QkFBbUIsRUFBRSxDQUFDO29CQUNwRixLQUFLLHlCQUFpQixDQUFDO2dCQUN6QixDQUFDO2dCQUNELE1BQU07WUFDUjtnQkFDRSxJQUFJLENBQUMsV0FBVyxJQUFJLFVBQVUsS0FBSyxDQUFDLElBQUksS0FBSywyQkFBbUIsRUFBRSxDQUFDO29CQUNqRSxvRkFBb0Y7b0JBQ3BGLFdBQVcsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7b0JBQ2xFLFVBQVUsR0FBRyxDQUFDLENBQUM7Z0JBQ2pCLENBQUM7Z0JBQ0QsTUFBTTtZQUNSO2dCQUNFLElBQUksV0FBVyxJQUFJLFVBQVUsR0FBRyxDQUFDLElBQUksVUFBVSxLQUFLLENBQUMsSUFBSSxLQUFLLDJCQUFtQixFQUFFLENBQUM7b0JBQ2xGLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDM0QsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUM7b0JBQ25DLFNBQVMsR0FBRyxDQUFDLENBQUM7b0JBQ2QsVUFBVSxHQUFHLENBQUMsQ0FBQztvQkFDZixXQUFXLEdBQUcsSUFBSSxDQUFDO2dCQUNyQixDQUFDO2dCQUNELE1BQU07UUFDVixDQUFDO0lBQ0gsQ0FBQztJQUVELElBQUksV0FBVyxJQUFJLFVBQVUsRUFBRSxDQUFDO1FBQzlCLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDaEQsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVELE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUM7QUFFRCxNQUFNLFVBQVUsU0FBUyxDQUFDLEtBQWE7SUFDckMsT0FBTyxLQUFLO1NBQ1AsT0FBTyxDQUNKLGFBQWEsRUFDYixDQUFDLENBQUMsRUFBRTtRQUNGLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN6QyxDQUFDLENBQUM7U0FDTCxXQUFXLEVBQUUsQ0FBQztBQUNyQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8vIEFueSBjaGFuZ2VzIGhlcmUgc2hvdWxkIGJlIHBvcnRlZCB0byB0aGUgQW5ndWxhciBEb21pbm8gZm9yay5cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2RvbWluby9ibG9iL21haW4vbGliL3N0eWxlX3BhcnNlci5qc1xuXG5jb25zdCBlbnVtIENoYXIge1xuICBPcGVuUGFyZW4gPSA0MCxcbiAgQ2xvc2VQYXJlbiA9IDQxLFxuICBDb2xvbiA9IDU4LFxuICBTZW1pY29sb24gPSA1OSxcbiAgQmFja1NsYXNoID0gOTIsXG4gIFF1b3RlTm9uZSA9IDAsICAvLyBpbmRpY2F0aW5nIHdlIGFyZSBub3QgaW5zaWRlIGEgcXVvdGVcbiAgUXVvdGVEb3VibGUgPSAzNCxcbiAgUXVvdGVTaW5nbGUgPSAzOSxcbn1cblxuXG4vKipcbiAqIFBhcnNlcyBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSBzdHlsZSBhbmQgY29udmVydHMgaXQgaW50byBvYmplY3QgbGl0ZXJhbC5cbiAqXG4gKiBAcGFyYW0gdmFsdWUgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHN0eWxlIGFzIHVzZWQgaW4gdGhlIGBzdHlsZWAgYXR0cmlidXRlIGluIEhUTUwuXG4gKiAgIEV4YW1wbGU6IGBjb2xvcjogcmVkOyBoZWlnaHQ6IGF1dG9gLlxuICogQHJldHVybnMgQW4gYXJyYXkgb2Ygc3R5bGUgcHJvcGVydHkgbmFtZSBhbmQgdmFsdWUgcGFpcnMsIGUuZy4gYFsnY29sb3InLCAncmVkJywgJ2hlaWdodCcsXG4gKiAnYXV0byddYFxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2UodmFsdWU6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgLy8gd2UgdXNlIGEgc3RyaW5nIGFycmF5IGhlcmUgaW5zdGVhZCBvZiBhIHN0cmluZyBtYXBcbiAgLy8gYmVjYXVzZSBhIHN0cmluZy1tYXAgaXMgbm90IGd1YXJhbnRlZWQgdG8gcmV0YWluIHRoZVxuICAvLyBvcmRlciBvZiB0aGUgZW50cmllcyB3aGVyZWFzIGEgc3RyaW5nIGFycmF5IGNhbiBiZVxuICAvLyBjb25zdHJ1Y3RlZCBpbiBhIFtrZXksIHZhbHVlLCBrZXksIHZhbHVlXSBmb3JtYXQuXG4gIGNvbnN0IHN0eWxlczogc3RyaW5nW10gPSBbXTtcblxuICBsZXQgaSA9IDA7XG4gIGxldCBwYXJlbkRlcHRoID0gMDtcbiAgbGV0IHF1b3RlOiBDaGFyID0gQ2hhci5RdW90ZU5vbmU7XG4gIGxldCB2YWx1ZVN0YXJ0ID0gMDtcbiAgbGV0IHByb3BTdGFydCA9IDA7XG4gIGxldCBjdXJyZW50UHJvcDogc3RyaW5nfG51bGwgPSBudWxsO1xuICB3aGlsZSAoaSA8IHZhbHVlLmxlbmd0aCkge1xuICAgIGNvbnN0IHRva2VuID0gdmFsdWUuY2hhckNvZGVBdChpKyspIGFzIENoYXI7XG4gICAgc3dpdGNoICh0b2tlbikge1xuICAgICAgY2FzZSBDaGFyLk9wZW5QYXJlbjpcbiAgICAgICAgcGFyZW5EZXB0aCsrO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQ2hhci5DbG9zZVBhcmVuOlxuICAgICAgICBwYXJlbkRlcHRoLS07XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBDaGFyLlF1b3RlU2luZ2xlOlxuICAgICAgICAvLyB2YWx1ZVN0YXJ0IG5lZWRzIHRvIGJlIHRoZXJlIHNpbmNlIHByb3AgdmFsdWVzIGRvbid0XG4gICAgICAgIC8vIGhhdmUgcXVvdGVzIGluIENTU1xuICAgICAgICBpZiAocXVvdGUgPT09IENoYXIuUXVvdGVOb25lKSB7XG4gICAgICAgICAgcXVvdGUgPSBDaGFyLlF1b3RlU2luZ2xlO1xuICAgICAgICB9IGVsc2UgaWYgKHF1b3RlID09PSBDaGFyLlF1b3RlU2luZ2xlICYmIHZhbHVlLmNoYXJDb2RlQXQoaSAtIDEpICE9PSBDaGFyLkJhY2tTbGFzaCkge1xuICAgICAgICAgIHF1b3RlID0gQ2hhci5RdW90ZU5vbmU7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIENoYXIuUXVvdGVEb3VibGU6XG4gICAgICAgIC8vIHNhbWUgbG9naWMgYXMgYWJvdmVcbiAgICAgICAgaWYgKHF1b3RlID09PSBDaGFyLlF1b3RlTm9uZSkge1xuICAgICAgICAgIHF1b3RlID0gQ2hhci5RdW90ZURvdWJsZTtcbiAgICAgICAgfSBlbHNlIGlmIChxdW90ZSA9PT0gQ2hhci5RdW90ZURvdWJsZSAmJiB2YWx1ZS5jaGFyQ29kZUF0KGkgLSAxKSAhPT0gQ2hhci5CYWNrU2xhc2gpIHtcbiAgICAgICAgICBxdW90ZSA9IENoYXIuUXVvdGVOb25lO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBDaGFyLkNvbG9uOlxuICAgICAgICBpZiAoIWN1cnJlbnRQcm9wICYmIHBhcmVuRGVwdGggPT09IDAgJiYgcXVvdGUgPT09IENoYXIuUXVvdGVOb25lKSB7XG4gICAgICAgICAgLy8gVE9ETzogRG8gbm90IGh5cGhlbmF0ZSBDU1MgY3VzdG9tIHByb3BlcnR5IG5hbWVzIGxpa2U6IGAtLWludGVudGlvbmFsbHlDYW1lbENhc2VgXG4gICAgICAgICAgY3VycmVudFByb3AgPSBoeXBoZW5hdGUodmFsdWUuc3Vic3RyaW5nKHByb3BTdGFydCwgaSAtIDEpLnRyaW0oKSk7XG4gICAgICAgICAgdmFsdWVTdGFydCA9IGk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIENoYXIuU2VtaWNvbG9uOlxuICAgICAgICBpZiAoY3VycmVudFByb3AgJiYgdmFsdWVTdGFydCA+IDAgJiYgcGFyZW5EZXB0aCA9PT0gMCAmJiBxdW90ZSA9PT0gQ2hhci5RdW90ZU5vbmUpIHtcbiAgICAgICAgICBjb25zdCBzdHlsZVZhbCA9IHZhbHVlLnN1YnN0cmluZyh2YWx1ZVN0YXJ0LCBpIC0gMSkudHJpbSgpO1xuICAgICAgICAgIHN0eWxlcy5wdXNoKGN1cnJlbnRQcm9wLCBzdHlsZVZhbCk7XG4gICAgICAgICAgcHJvcFN0YXJ0ID0gaTtcbiAgICAgICAgICB2YWx1ZVN0YXJ0ID0gMDtcbiAgICAgICAgICBjdXJyZW50UHJvcCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgaWYgKGN1cnJlbnRQcm9wICYmIHZhbHVlU3RhcnQpIHtcbiAgICBjb25zdCBzdHlsZVZhbCA9IHZhbHVlLnNsaWNlKHZhbHVlU3RhcnQpLnRyaW0oKTtcbiAgICBzdHlsZXMucHVzaChjdXJyZW50UHJvcCwgc3R5bGVWYWwpO1xuICB9XG5cbiAgcmV0dXJuIHN0eWxlcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGh5cGhlbmF0ZSh2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHZhbHVlXG4gICAgICAucmVwbGFjZShcbiAgICAgICAgICAvW2Etel1bQS1aXS9nLFxuICAgICAgICAgIHYgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHYuY2hhckF0KDApICsgJy0nICsgdi5jaGFyQXQoMSk7XG4gICAgICAgICAgfSlcbiAgICAgIC50b0xvd2VyQ2FzZSgpO1xufVxuIl19