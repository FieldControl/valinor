/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { assertDefined, throwError } from '../util/assert';
import { toTNodeTypeAsString } from './interfaces/node';
export function assertTNodeType(tNode, expectedTypes, message) {
    assertDefined(tNode, 'should be called with a TNode');
    if ((tNode.type & expectedTypes) === 0) {
        throwError(message ||
            `Expected [${toTNodeTypeAsString(expectedTypes)}] but got ${toTNodeTypeAsString(tNode.type)}.`);
    }
}
export function assertPureTNodeType(type) {
    if (!(type === 2 /* TNodeType.Element */ ||
        type === 1 /* TNodeType.Text */ ||
        type === 4 /* TNodeType.Container */ ||
        type === 8 /* TNodeType.ElementContainer */ ||
        type === 32 /* TNodeType.Icu */ ||
        type === 16 /* TNodeType.Projection */ ||
        type === 64 /* TNodeType.Placeholder */ ||
        type === 128 /* TNodeType.LetDeclaration */)) {
        throwError(`Expected TNodeType to have only a single type selected, but got ${toTNodeTypeAsString(type)}.`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZV9hc3NlcnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL25vZGVfYXNzZXJ0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxhQUFhLEVBQUUsVUFBVSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDekQsT0FBTyxFQUFtQixtQkFBbUIsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBRXhFLE1BQU0sVUFBVSxlQUFlLENBQzdCLEtBQW1CLEVBQ25CLGFBQXdCLEVBQ3hCLE9BQWdCO0lBRWhCLGFBQWEsQ0FBQyxLQUFLLEVBQUUsK0JBQStCLENBQUMsQ0FBQztJQUN0RCxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxhQUFhLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUN2QyxVQUFVLENBQ1IsT0FBTztZQUNMLGFBQWEsbUJBQW1CLENBQUMsYUFBYSxDQUFDLGFBQWEsbUJBQW1CLENBQzdFLEtBQUssQ0FBQyxJQUFJLENBQ1gsR0FBRyxDQUNQLENBQUM7SUFDSixDQUFDO0FBQ0gsQ0FBQztBQUVELE1BQU0sVUFBVSxtQkFBbUIsQ0FBQyxJQUFlO0lBQ2pELElBQ0UsQ0FBQyxDQUNDLElBQUksOEJBQXNCO1FBQzFCLElBQUksMkJBQW1CO1FBQ3ZCLElBQUksZ0NBQXdCO1FBQzVCLElBQUksdUNBQStCO1FBQ25DLElBQUksMkJBQWtCO1FBQ3RCLElBQUksa0NBQXlCO1FBQzdCLElBQUksbUNBQTBCO1FBQzlCLElBQUksdUNBQTZCLENBQ2xDLEVBQ0QsQ0FBQztRQUNELFVBQVUsQ0FDUixtRUFBbUUsbUJBQW1CLENBQ3BGLElBQUksQ0FDTCxHQUFHLENBQ0wsQ0FBQztJQUNKLENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2Fzc2VydERlZmluZWQsIHRocm93RXJyb3J9IGZyb20gJy4uL3V0aWwvYXNzZXJ0JztcbmltcG9ydCB7VE5vZGUsIFROb2RlVHlwZSwgdG9UTm9kZVR5cGVBc1N0cmluZ30gZnJvbSAnLi9pbnRlcmZhY2VzL25vZGUnO1xuXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0VE5vZGVUeXBlKFxuICB0Tm9kZTogVE5vZGUgfCBudWxsLFxuICBleHBlY3RlZFR5cGVzOiBUTm9kZVR5cGUsXG4gIG1lc3NhZ2U/OiBzdHJpbmcsXG4pOiB2b2lkIHtcbiAgYXNzZXJ0RGVmaW5lZCh0Tm9kZSwgJ3Nob3VsZCBiZSBjYWxsZWQgd2l0aCBhIFROb2RlJyk7XG4gIGlmICgodE5vZGUudHlwZSAmIGV4cGVjdGVkVHlwZXMpID09PSAwKSB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIG1lc3NhZ2UgfHxcbiAgICAgICAgYEV4cGVjdGVkIFske3RvVE5vZGVUeXBlQXNTdHJpbmcoZXhwZWN0ZWRUeXBlcyl9XSBidXQgZ290ICR7dG9UTm9kZVR5cGVBc1N0cmluZyhcbiAgICAgICAgICB0Tm9kZS50eXBlLFxuICAgICAgICApfS5gLFxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydFB1cmVUTm9kZVR5cGUodHlwZTogVE5vZGVUeXBlKSB7XG4gIGlmIChcbiAgICAhKFxuICAgICAgdHlwZSA9PT0gVE5vZGVUeXBlLkVsZW1lbnQgfHxcbiAgICAgIHR5cGUgPT09IFROb2RlVHlwZS5UZXh0IHx8XG4gICAgICB0eXBlID09PSBUTm9kZVR5cGUuQ29udGFpbmVyIHx8XG4gICAgICB0eXBlID09PSBUTm9kZVR5cGUuRWxlbWVudENvbnRhaW5lciB8fFxuICAgICAgdHlwZSA9PT0gVE5vZGVUeXBlLkljdSB8fFxuICAgICAgdHlwZSA9PT0gVE5vZGVUeXBlLlByb2plY3Rpb24gfHxcbiAgICAgIHR5cGUgPT09IFROb2RlVHlwZS5QbGFjZWhvbGRlciB8fFxuICAgICAgdHlwZSA9PT0gVE5vZGVUeXBlLkxldERlY2xhcmF0aW9uXG4gICAgKVxuICApIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYEV4cGVjdGVkIFROb2RlVHlwZSB0byBoYXZlIG9ubHkgYSBzaW5nbGUgdHlwZSBzZWxlY3RlZCwgYnV0IGdvdCAke3RvVE5vZGVUeXBlQXNTdHJpbmcoXG4gICAgICAgIHR5cGUsXG4gICAgICApfS5gLFxuICAgICk7XG4gIH1cbn1cbiJdfQ==