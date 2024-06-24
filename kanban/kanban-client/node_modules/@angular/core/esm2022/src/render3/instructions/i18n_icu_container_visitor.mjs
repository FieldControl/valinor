/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { assertDomNode, assertNumber, assertNumberInRange } from '../../util/assert';
import { EMPTY_ARRAY } from '../../util/empty';
import { assertTIcu, assertTNodeForLView } from '../assert';
import { getCurrentICUCaseIndex } from '../i18n/i18n_util';
import { TVIEW } from '../interfaces/view';
export function loadIcuContainerVisitor() {
    const _stack = [];
    let _index = -1;
    let _lView;
    let _removes;
    /**
     * Retrieves a set of root nodes from `TIcu.remove`. Used by `TNodeType.ICUContainer`
     * to determine which root belong to the ICU.
     *
     * Example of usage.
     * ```
     * const nextRNode = icuContainerIteratorStart(tIcuContainerNode, lView);
     * let rNode: RNode|null;
     * while(rNode = nextRNode()) {
     *   console.log(rNode);
     * }
     * ```
     *
     * @param tIcuContainerNode Current `TIcuContainerNode`
     * @param lView `LView` where the `RNode`s should be looked up.
     */
    function icuContainerIteratorStart(tIcuContainerNode, lView) {
        _lView = lView;
        while (_stack.length)
            _stack.pop();
        ngDevMode && assertTNodeForLView(tIcuContainerNode, lView);
        enterIcu(tIcuContainerNode.value, lView);
        return icuContainerIteratorNext;
    }
    function enterIcu(tIcu, lView) {
        _index = 0;
        const currentCase = getCurrentICUCaseIndex(tIcu, lView);
        if (currentCase !== null) {
            ngDevMode && assertNumberInRange(currentCase, 0, tIcu.cases.length - 1);
            _removes = tIcu.remove[currentCase];
        }
        else {
            _removes = EMPTY_ARRAY;
        }
    }
    function icuContainerIteratorNext() {
        if (_index < _removes.length) {
            const removeOpCode = _removes[_index++];
            ngDevMode && assertNumber(removeOpCode, 'Expecting OpCode number');
            if (removeOpCode > 0) {
                const rNode = _lView[removeOpCode];
                ngDevMode && assertDomNode(rNode);
                return rNode;
            }
            else {
                _stack.push(_index, _removes);
                // ICUs are represented by negative indices
                const tIcuIndex = ~removeOpCode;
                const tIcu = _lView[TVIEW].data[tIcuIndex];
                ngDevMode && assertTIcu(tIcu);
                enterIcu(tIcu, _lView);
                return icuContainerIteratorNext();
            }
        }
        else {
            if (_stack.length === 0) {
                return null;
            }
            else {
                _removes = _stack.pop();
                _index = _stack.pop();
                return icuContainerIteratorNext();
            }
        }
    }
    return icuContainerIteratorStart;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bl9pY3VfY29udGFpbmVyX3Zpc2l0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL2luc3RydWN0aW9ucy9pMThuX2ljdV9jb250YWluZXJfdmlzaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsYUFBYSxFQUFFLFlBQVksRUFBRSxtQkFBbUIsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ25GLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUM3QyxPQUFPLEVBQUMsVUFBVSxFQUFFLG1CQUFtQixFQUFDLE1BQU0sV0FBVyxDQUFDO0FBQzFELE9BQU8sRUFBQyxzQkFBc0IsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBSXpELE9BQU8sRUFBUSxLQUFLLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUVoRCxNQUFNLFVBQVUsdUJBQXVCO0lBQ3JDLE1BQU0sTUFBTSxHQUFVLEVBQUUsQ0FBQztJQUN6QixJQUFJLE1BQU0sR0FBVyxDQUFDLENBQUMsQ0FBQztJQUN4QixJQUFJLE1BQWEsQ0FBQztJQUNsQixJQUFJLFFBQTJCLENBQUM7SUFFaEM7Ozs7Ozs7Ozs7Ozs7OztPQWVHO0lBQ0gsU0FBUyx5QkFBeUIsQ0FDaEMsaUJBQW9DLEVBQ3BDLEtBQVk7UUFFWixNQUFNLEdBQUcsS0FBSyxDQUFDO1FBQ2YsT0FBTyxNQUFNLENBQUMsTUFBTTtZQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNuQyxTQUFTLElBQUksbUJBQW1CLENBQUMsaUJBQWlCLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDM0QsUUFBUSxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN6QyxPQUFPLHdCQUF3QixDQUFDO0lBQ2xDLENBQUM7SUFFRCxTQUFTLFFBQVEsQ0FBQyxJQUFVLEVBQUUsS0FBWTtRQUN4QyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsTUFBTSxXQUFXLEdBQUcsc0JBQXNCLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3hELElBQUksV0FBVyxLQUFLLElBQUksRUFBRSxDQUFDO1lBQ3pCLFNBQVMsSUFBSSxtQkFBbUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3hFLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7YUFBTSxDQUFDO1lBQ04sUUFBUSxHQUFHLFdBQWtCLENBQUM7UUFDaEMsQ0FBQztJQUNILENBQUM7SUFFRCxTQUFTLHdCQUF3QjtRQUMvQixJQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDN0IsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFXLENBQUM7WUFDbEQsU0FBUyxJQUFJLFlBQVksQ0FBQyxZQUFZLEVBQUUseUJBQXlCLENBQUMsQ0FBQztZQUNuRSxJQUFJLFlBQVksR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDckIsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUNuQyxTQUFTLElBQUksYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNsQyxPQUFPLEtBQUssQ0FBQztZQUNmLENBQUM7aUJBQU0sQ0FBQztnQkFDTixNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDOUIsMkNBQTJDO2dCQUMzQyxNQUFNLFNBQVMsR0FBRyxDQUFDLFlBQVksQ0FBQztnQkFDaEMsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQVMsQ0FBQztnQkFDbkQsU0FBUyxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDOUIsUUFBUSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDdkIsT0FBTyx3QkFBd0IsRUFBRSxDQUFDO1lBQ3BDLENBQUM7UUFDSCxDQUFDO2FBQU0sQ0FBQztZQUNOLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDeEIsT0FBTyxJQUFJLENBQUM7WUFDZCxDQUFDO2lCQUFNLENBQUM7Z0JBQ04sUUFBUSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFDeEIsTUFBTSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFDdEIsT0FBTyx3QkFBd0IsRUFBRSxDQUFDO1lBQ3BDLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUVELE9BQU8seUJBQXlCLENBQUM7QUFDbkMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2Fzc2VydERvbU5vZGUsIGFzc2VydE51bWJlciwgYXNzZXJ0TnVtYmVySW5SYW5nZX0gZnJvbSAnLi4vLi4vdXRpbC9hc3NlcnQnO1xuaW1wb3J0IHtFTVBUWV9BUlJBWX0gZnJvbSAnLi4vLi4vdXRpbC9lbXB0eSc7XG5pbXBvcnQge2Fzc2VydFRJY3UsIGFzc2VydFROb2RlRm9yTFZpZXd9IGZyb20gJy4uL2Fzc2VydCc7XG5pbXBvcnQge2dldEN1cnJlbnRJQ1VDYXNlSW5kZXh9IGZyb20gJy4uL2kxOG4vaTE4bl91dGlsJztcbmltcG9ydCB7STE4blJlbW92ZU9wQ29kZXMsIFRJY3V9IGZyb20gJy4uL2ludGVyZmFjZXMvaTE4bic7XG5pbXBvcnQge1RJY3VDb250YWluZXJOb2RlfSBmcm9tICcuLi9pbnRlcmZhY2VzL25vZGUnO1xuaW1wb3J0IHtSTm9kZX0gZnJvbSAnLi4vaW50ZXJmYWNlcy9yZW5kZXJlcl9kb20nO1xuaW1wb3J0IHtMVmlldywgVFZJRVd9IGZyb20gJy4uL2ludGVyZmFjZXMvdmlldyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkSWN1Q29udGFpbmVyVmlzaXRvcigpIHtcbiAgY29uc3QgX3N0YWNrOiBhbnlbXSA9IFtdO1xuICBsZXQgX2luZGV4OiBudW1iZXIgPSAtMTtcbiAgbGV0IF9sVmlldzogTFZpZXc7XG4gIGxldCBfcmVtb3ZlczogSTE4blJlbW92ZU9wQ29kZXM7XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlcyBhIHNldCBvZiByb290IG5vZGVzIGZyb20gYFRJY3UucmVtb3ZlYC4gVXNlZCBieSBgVE5vZGVUeXBlLklDVUNvbnRhaW5lcmBcbiAgICogdG8gZGV0ZXJtaW5lIHdoaWNoIHJvb3QgYmVsb25nIHRvIHRoZSBJQ1UuXG4gICAqXG4gICAqIEV4YW1wbGUgb2YgdXNhZ2UuXG4gICAqIGBgYFxuICAgKiBjb25zdCBuZXh0Uk5vZGUgPSBpY3VDb250YWluZXJJdGVyYXRvclN0YXJ0KHRJY3VDb250YWluZXJOb2RlLCBsVmlldyk7XG4gICAqIGxldCByTm9kZTogUk5vZGV8bnVsbDtcbiAgICogd2hpbGUock5vZGUgPSBuZXh0Uk5vZGUoKSkge1xuICAgKiAgIGNvbnNvbGUubG9nKHJOb2RlKTtcbiAgICogfVxuICAgKiBgYGBcbiAgICpcbiAgICogQHBhcmFtIHRJY3VDb250YWluZXJOb2RlIEN1cnJlbnQgYFRJY3VDb250YWluZXJOb2RlYFxuICAgKiBAcGFyYW0gbFZpZXcgYExWaWV3YCB3aGVyZSB0aGUgYFJOb2RlYHMgc2hvdWxkIGJlIGxvb2tlZCB1cC5cbiAgICovXG4gIGZ1bmN0aW9uIGljdUNvbnRhaW5lckl0ZXJhdG9yU3RhcnQoXG4gICAgdEljdUNvbnRhaW5lck5vZGU6IFRJY3VDb250YWluZXJOb2RlLFxuICAgIGxWaWV3OiBMVmlldyxcbiAgKTogKCkgPT4gUk5vZGUgfCBudWxsIHtcbiAgICBfbFZpZXcgPSBsVmlldztcbiAgICB3aGlsZSAoX3N0YWNrLmxlbmd0aCkgX3N0YWNrLnBvcCgpO1xuICAgIG5nRGV2TW9kZSAmJiBhc3NlcnRUTm9kZUZvckxWaWV3KHRJY3VDb250YWluZXJOb2RlLCBsVmlldyk7XG4gICAgZW50ZXJJY3UodEljdUNvbnRhaW5lck5vZGUudmFsdWUsIGxWaWV3KTtcbiAgICByZXR1cm4gaWN1Q29udGFpbmVySXRlcmF0b3JOZXh0O1xuICB9XG5cbiAgZnVuY3Rpb24gZW50ZXJJY3UodEljdTogVEljdSwgbFZpZXc6IExWaWV3KSB7XG4gICAgX2luZGV4ID0gMDtcbiAgICBjb25zdCBjdXJyZW50Q2FzZSA9IGdldEN1cnJlbnRJQ1VDYXNlSW5kZXgodEljdSwgbFZpZXcpO1xuICAgIGlmIChjdXJyZW50Q2FzZSAhPT0gbnVsbCkge1xuICAgICAgbmdEZXZNb2RlICYmIGFzc2VydE51bWJlckluUmFuZ2UoY3VycmVudENhc2UsIDAsIHRJY3UuY2FzZXMubGVuZ3RoIC0gMSk7XG4gICAgICBfcmVtb3ZlcyA9IHRJY3UucmVtb3ZlW2N1cnJlbnRDYXNlXTtcbiAgICB9IGVsc2Uge1xuICAgICAgX3JlbW92ZXMgPSBFTVBUWV9BUlJBWSBhcyBhbnk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaWN1Q29udGFpbmVySXRlcmF0b3JOZXh0KCk6IFJOb2RlIHwgbnVsbCB7XG4gICAgaWYgKF9pbmRleCA8IF9yZW1vdmVzLmxlbmd0aCkge1xuICAgICAgY29uc3QgcmVtb3ZlT3BDb2RlID0gX3JlbW92ZXNbX2luZGV4KytdIGFzIG51bWJlcjtcbiAgICAgIG5nRGV2TW9kZSAmJiBhc3NlcnROdW1iZXIocmVtb3ZlT3BDb2RlLCAnRXhwZWN0aW5nIE9wQ29kZSBudW1iZXInKTtcbiAgICAgIGlmIChyZW1vdmVPcENvZGUgPiAwKSB7XG4gICAgICAgIGNvbnN0IHJOb2RlID0gX2xWaWV3W3JlbW92ZU9wQ29kZV07XG4gICAgICAgIG5nRGV2TW9kZSAmJiBhc3NlcnREb21Ob2RlKHJOb2RlKTtcbiAgICAgICAgcmV0dXJuIHJOb2RlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgX3N0YWNrLnB1c2goX2luZGV4LCBfcmVtb3Zlcyk7XG4gICAgICAgIC8vIElDVXMgYXJlIHJlcHJlc2VudGVkIGJ5IG5lZ2F0aXZlIGluZGljZXNcbiAgICAgICAgY29uc3QgdEljdUluZGV4ID0gfnJlbW92ZU9wQ29kZTtcbiAgICAgICAgY29uc3QgdEljdSA9IF9sVmlld1tUVklFV10uZGF0YVt0SWN1SW5kZXhdIGFzIFRJY3U7XG4gICAgICAgIG5nRGV2TW9kZSAmJiBhc3NlcnRUSWN1KHRJY3UpO1xuICAgICAgICBlbnRlckljdSh0SWN1LCBfbFZpZXcpO1xuICAgICAgICByZXR1cm4gaWN1Q29udGFpbmVySXRlcmF0b3JOZXh0KCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChfc3RhY2subGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgX3JlbW92ZXMgPSBfc3RhY2sucG9wKCk7XG4gICAgICAgIF9pbmRleCA9IF9zdGFjay5wb3AoKTtcbiAgICAgICAgcmV0dXJuIGljdUNvbnRhaW5lckl0ZXJhdG9yTmV4dCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBpY3VDb250YWluZXJJdGVyYXRvclN0YXJ0O1xufVxuIl19