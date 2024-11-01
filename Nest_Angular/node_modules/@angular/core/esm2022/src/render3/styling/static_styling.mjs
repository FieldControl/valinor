/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { concatStringsWithSpace } from '../../util/stringify';
import { assertFirstCreatePass } from '../assert';
import { getTView } from '../state';
/**
 * Compute the static styling (class/style) from `TAttributes`.
 *
 * This function should be called during `firstCreatePass` only.
 *
 * @param tNode The `TNode` into which the styling information should be loaded.
 * @param attrs `TAttributes` containing the styling information.
 * @param writeToHost Where should the resulting static styles be written?
 *   - `false` Write to `TNode.stylesWithoutHost` / `TNode.classesWithoutHost`
 *   - `true` Write to `TNode.styles` / `TNode.classes`
 */
export function computeStaticStyling(tNode, attrs, writeToHost) {
    ngDevMode &&
        assertFirstCreatePass(getTView(), 'Expecting to be called in first template pass only');
    let styles = writeToHost ? tNode.styles : null;
    let classes = writeToHost ? tNode.classes : null;
    let mode = 0;
    if (attrs !== null) {
        for (let i = 0; i < attrs.length; i++) {
            const value = attrs[i];
            if (typeof value === 'number') {
                mode = value;
            }
            else if (mode == 1 /* AttributeMarker.Classes */) {
                classes = concatStringsWithSpace(classes, value);
            }
            else if (mode == 2 /* AttributeMarker.Styles */) {
                const style = value;
                const styleValue = attrs[++i];
                styles = concatStringsWithSpace(styles, style + ': ' + styleValue + ';');
            }
        }
    }
    writeToHost ? (tNode.styles = styles) : (tNode.stylesWithoutHost = styles);
    writeToHost ? (tNode.classes = classes) : (tNode.classesWithoutHost = classes);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGljX3N0eWxpbmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL3N0eWxpbmcvc3RhdGljX3N0eWxpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLHNCQUFzQixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDNUQsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sV0FBVyxDQUFDO0FBR2hELE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFFbEM7Ozs7Ozs7Ozs7R0FVRztBQUNILE1BQU0sVUFBVSxvQkFBb0IsQ0FDbEMsS0FBWSxFQUNaLEtBQXlCLEVBQ3pCLFdBQW9CO0lBRXBCLFNBQVM7UUFDUCxxQkFBcUIsQ0FBQyxRQUFRLEVBQUUsRUFBRSxvREFBb0QsQ0FBQyxDQUFDO0lBQzFGLElBQUksTUFBTSxHQUFrQixXQUFXLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUM5RCxJQUFJLE9BQU8sR0FBa0IsV0FBVyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFDaEUsSUFBSSxJQUFJLEdBQXdCLENBQUMsQ0FBQztJQUNsQyxJQUFJLEtBQUssS0FBSyxJQUFJLEVBQUUsQ0FBQztRQUNuQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3RDLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2QixJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRSxDQUFDO2dCQUM5QixJQUFJLEdBQUcsS0FBSyxDQUFDO1lBQ2YsQ0FBQztpQkFBTSxJQUFJLElBQUksbUNBQTJCLEVBQUUsQ0FBQztnQkFDM0MsT0FBTyxHQUFHLHNCQUFzQixDQUFDLE9BQU8sRUFBRSxLQUFlLENBQUMsQ0FBQztZQUM3RCxDQUFDO2lCQUFNLElBQUksSUFBSSxrQ0FBMEIsRUFBRSxDQUFDO2dCQUMxQyxNQUFNLEtBQUssR0FBRyxLQUFlLENBQUM7Z0JBQzlCLE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBVyxDQUFDO2dCQUN4QyxNQUFNLEdBQUcsc0JBQXNCLENBQUMsTUFBTSxFQUFFLEtBQUssR0FBRyxJQUFJLEdBQUcsVUFBVSxHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBQzNFLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUNELFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsR0FBRyxNQUFNLENBQUMsQ0FBQztJQUMzRSxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEdBQUcsT0FBTyxDQUFDLENBQUM7QUFDakYsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtjb25jYXRTdHJpbmdzV2l0aFNwYWNlfSBmcm9tICcuLi8uLi91dGlsL3N0cmluZ2lmeSc7XG5pbXBvcnQge2Fzc2VydEZpcnN0Q3JlYXRlUGFzc30gZnJvbSAnLi4vYXNzZXJ0JztcbmltcG9ydCB7QXR0cmlidXRlTWFya2VyfSBmcm9tICcuLi9pbnRlcmZhY2VzL2F0dHJpYnV0ZV9tYXJrZXInO1xuaW1wb3J0IHtUQXR0cmlidXRlcywgVE5vZGV9IGZyb20gJy4uL2ludGVyZmFjZXMvbm9kZSc7XG5pbXBvcnQge2dldFRWaWV3fSBmcm9tICcuLi9zdGF0ZSc7XG5cbi8qKlxuICogQ29tcHV0ZSB0aGUgc3RhdGljIHN0eWxpbmcgKGNsYXNzL3N0eWxlKSBmcm9tIGBUQXR0cmlidXRlc2AuXG4gKlxuICogVGhpcyBmdW5jdGlvbiBzaG91bGQgYmUgY2FsbGVkIGR1cmluZyBgZmlyc3RDcmVhdGVQYXNzYCBvbmx5LlxuICpcbiAqIEBwYXJhbSB0Tm9kZSBUaGUgYFROb2RlYCBpbnRvIHdoaWNoIHRoZSBzdHlsaW5nIGluZm9ybWF0aW9uIHNob3VsZCBiZSBsb2FkZWQuXG4gKiBAcGFyYW0gYXR0cnMgYFRBdHRyaWJ1dGVzYCBjb250YWluaW5nIHRoZSBzdHlsaW5nIGluZm9ybWF0aW9uLlxuICogQHBhcmFtIHdyaXRlVG9Ib3N0IFdoZXJlIHNob3VsZCB0aGUgcmVzdWx0aW5nIHN0YXRpYyBzdHlsZXMgYmUgd3JpdHRlbj9cbiAqICAgLSBgZmFsc2VgIFdyaXRlIHRvIGBUTm9kZS5zdHlsZXNXaXRob3V0SG9zdGAgLyBgVE5vZGUuY2xhc3Nlc1dpdGhvdXRIb3N0YFxuICogICAtIGB0cnVlYCBXcml0ZSB0byBgVE5vZGUuc3R5bGVzYCAvIGBUTm9kZS5jbGFzc2VzYFxuICovXG5leHBvcnQgZnVuY3Rpb24gY29tcHV0ZVN0YXRpY1N0eWxpbmcoXG4gIHROb2RlOiBUTm9kZSxcbiAgYXR0cnM6IFRBdHRyaWJ1dGVzIHwgbnVsbCxcbiAgd3JpdGVUb0hvc3Q6IGJvb2xlYW4sXG4pOiB2b2lkIHtcbiAgbmdEZXZNb2RlICYmXG4gICAgYXNzZXJ0Rmlyc3RDcmVhdGVQYXNzKGdldFRWaWV3KCksICdFeHBlY3RpbmcgdG8gYmUgY2FsbGVkIGluIGZpcnN0IHRlbXBsYXRlIHBhc3Mgb25seScpO1xuICBsZXQgc3R5bGVzOiBzdHJpbmcgfCBudWxsID0gd3JpdGVUb0hvc3QgPyB0Tm9kZS5zdHlsZXMgOiBudWxsO1xuICBsZXQgY2xhc3Nlczogc3RyaW5nIHwgbnVsbCA9IHdyaXRlVG9Ib3N0ID8gdE5vZGUuY2xhc3NlcyA6IG51bGw7XG4gIGxldCBtb2RlOiBBdHRyaWJ1dGVNYXJrZXIgfCAwID0gMDtcbiAgaWYgKGF0dHJzICE9PSBudWxsKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhdHRycy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgdmFsdWUgPSBhdHRyc1tpXTtcbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSB7XG4gICAgICAgIG1vZGUgPSB2YWx1ZTtcbiAgICAgIH0gZWxzZSBpZiAobW9kZSA9PSBBdHRyaWJ1dGVNYXJrZXIuQ2xhc3Nlcykge1xuICAgICAgICBjbGFzc2VzID0gY29uY2F0U3RyaW5nc1dpdGhTcGFjZShjbGFzc2VzLCB2YWx1ZSBhcyBzdHJpbmcpO1xuICAgICAgfSBlbHNlIGlmIChtb2RlID09IEF0dHJpYnV0ZU1hcmtlci5TdHlsZXMpIHtcbiAgICAgICAgY29uc3Qgc3R5bGUgPSB2YWx1ZSBhcyBzdHJpbmc7XG4gICAgICAgIGNvbnN0IHN0eWxlVmFsdWUgPSBhdHRyc1srK2ldIGFzIHN0cmluZztcbiAgICAgICAgc3R5bGVzID0gY29uY2F0U3RyaW5nc1dpdGhTcGFjZShzdHlsZXMsIHN0eWxlICsgJzogJyArIHN0eWxlVmFsdWUgKyAnOycpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICB3cml0ZVRvSG9zdCA/ICh0Tm9kZS5zdHlsZXMgPSBzdHlsZXMpIDogKHROb2RlLnN0eWxlc1dpdGhvdXRIb3N0ID0gc3R5bGVzKTtcbiAgd3JpdGVUb0hvc3QgPyAodE5vZGUuY2xhc3NlcyA9IGNsYXNzZXMpIDogKHROb2RlLmNsYXNzZXNXaXRob3V0SG9zdCA9IGNsYXNzZXMpO1xufVxuIl19