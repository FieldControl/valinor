/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { assertParentView } from './assert';
import { icuContainerIterate } from './i18n/i18n_tree_shaking';
import { CONTAINER_HEADER_OFFSET, NATIVE } from './interfaces/container';
import { isLContainer } from './interfaces/type_checks';
import { DECLARATION_COMPONENT_VIEW, HOST, TVIEW } from './interfaces/view';
import { assertTNodeType } from './node_assert';
import { getProjectionNodes } from './node_manipulation';
import { getLViewParent, unwrapRNode } from './util/view_utils';
export function collectNativeNodes(tView, lView, tNode, result, isProjection = false) {
    while (tNode !== null) {
        // Let declarations don't have corresponding DOM nodes so we skip over them.
        if (tNode.type === 128 /* TNodeType.LetDeclaration */) {
            tNode = isProjection ? tNode.projectionNext : tNode.next;
            continue;
        }
        ngDevMode &&
            assertTNodeType(tNode, 3 /* TNodeType.AnyRNode */ | 12 /* TNodeType.AnyContainer */ | 16 /* TNodeType.Projection */ | 32 /* TNodeType.Icu */);
        const lNode = lView[tNode.index];
        if (lNode !== null) {
            result.push(unwrapRNode(lNode));
        }
        // A given lNode can represent either a native node or a LContainer (when it is a host of a
        // ViewContainerRef). When we find a LContainer we need to descend into it to collect root nodes
        // from the views in this container.
        if (isLContainer(lNode)) {
            collectNativeNodesInLContainer(lNode, result);
        }
        const tNodeType = tNode.type;
        if (tNodeType & 8 /* TNodeType.ElementContainer */) {
            collectNativeNodes(tView, lView, tNode.child, result);
        }
        else if (tNodeType & 32 /* TNodeType.Icu */) {
            const nextRNode = icuContainerIterate(tNode, lView);
            let rNode;
            while ((rNode = nextRNode())) {
                result.push(rNode);
            }
        }
        else if (tNodeType & 16 /* TNodeType.Projection */) {
            const nodesInSlot = getProjectionNodes(lView, tNode);
            if (Array.isArray(nodesInSlot)) {
                result.push(...nodesInSlot);
            }
            else {
                const parentView = getLViewParent(lView[DECLARATION_COMPONENT_VIEW]);
                ngDevMode && assertParentView(parentView);
                collectNativeNodes(parentView[TVIEW], parentView, nodesInSlot, result, true);
            }
        }
        tNode = isProjection ? tNode.projectionNext : tNode.next;
    }
    return result;
}
/**
 * Collects all root nodes in all views in a given LContainer.
 */
export function collectNativeNodesInLContainer(lContainer, result) {
    for (let i = CONTAINER_HEADER_OFFSET; i < lContainer.length; i++) {
        const lViewInAContainer = lContainer[i];
        const lViewFirstChildTNode = lViewInAContainer[TVIEW].firstChild;
        if (lViewFirstChildTNode !== null) {
            collectNativeNodes(lViewInAContainer[TVIEW], lViewInAContainer, lViewFirstChildTNode, result);
        }
    }
    // When an LContainer is created, the anchor (comment) node is:
    // - (1) either reused in case of an ElementContainer (<ng-container>)
    // - (2) or a new comment node is created
    // In the first case, the anchor comment node would be added to the final
    // list by the code in the `collectNativeNodes` function
    // (see the `result.push(unwrapRNode(lNode))` line), but the second
    // case requires extra handling: the anchor node needs to be added to the
    // final list manually. See additional information in the `createAnchorNode`
    // function in the `view_container_ref.ts`.
    //
    // In the first case, the same reference would be stored in the `NATIVE`
    // and `HOST` slots in an LContainer. Otherwise, this is the second case and
    // we should add an element to the final list.
    if (lContainer[NATIVE] !== lContainer[HOST]) {
        result.push(lContainer[NATIVE]);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sbGVjdF9uYXRpdmVfbm9kZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL2NvbGxlY3RfbmF0aXZlX25vZGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUMxQyxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUM3RCxPQUFPLEVBQUMsdUJBQXVCLEVBQWMsTUFBTSxFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFHbkYsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLDBCQUEwQixDQUFDO0FBQ3RELE9BQU8sRUFBQywwQkFBMEIsRUFBRSxJQUFJLEVBQVMsS0FBSyxFQUFRLE1BQU0sbUJBQW1CLENBQUM7QUFDeEYsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUM5QyxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUN2RCxPQUFPLEVBQUMsY0FBYyxFQUFFLFdBQVcsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBRTlELE1BQU0sVUFBVSxrQkFBa0IsQ0FDaEMsS0FBWSxFQUNaLEtBQVksRUFDWixLQUFtQixFQUNuQixNQUFhLEVBQ2IsZUFBd0IsS0FBSztJQUU3QixPQUFPLEtBQUssS0FBSyxJQUFJLEVBQUUsQ0FBQztRQUN0Qiw0RUFBNEU7UUFDNUUsSUFBSSxLQUFLLENBQUMsSUFBSSx1Q0FBNkIsRUFBRSxDQUFDO1lBQzVDLEtBQUssR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7WUFDekQsU0FBUztRQUNYLENBQUM7UUFFRCxTQUFTO1lBQ1AsZUFBZSxDQUNiLEtBQUssRUFDTCw0REFBMkMsZ0NB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RSw4Q0FBOEM7SUFDOUMsSUFBSSxVQUFVLENBQUMsTUFBTSxDQUFDLEtBQUssVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDNUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNsQyxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHthc3NlcnRQYXJlbnRWaWV3fSBmcm9tICcuL2Fzc2VydCc7XG5pbXBvcnQge2ljdUNvbnRhaW5lckl0ZXJhdGV9IGZyb20gJy4vaTE4bi9pMThuX3RyZWVfc2hha2luZyc7XG5pbXBvcnQge0NPTlRBSU5FUl9IRUFERVJfT0ZGU0VULCBMQ29udGFpbmVyLCBOQVRJVkV9IGZyb20gJy4vaW50ZXJmYWNlcy9jb250YWluZXInO1xuaW1wb3J0IHtUSWN1Q29udGFpbmVyTm9kZSwgVE5vZGUsIFROb2RlVHlwZX0gZnJvbSAnLi9pbnRlcmZhY2VzL25vZGUnO1xuaW1wb3J0IHtSTm9kZX0gZnJvbSAnLi9pbnRlcmZhY2VzL3JlbmRlcmVyX2RvbSc7XG5pbXBvcnQge2lzTENvbnRhaW5lcn0gZnJvbSAnLi9pbnRlcmZhY2VzL3R5cGVfY2hlY2tzJztcbmltcG9ydCB7REVDTEFSQVRJT05fQ09NUE9ORU5UX1ZJRVcsIEhPU1QsIExWaWV3LCBUVklFVywgVFZpZXd9IGZyb20gJy4vaW50ZXJmYWNlcy92aWV3JztcbmltcG9ydCB7YXNzZXJ0VE5vZGVUeXBlfSBmcm9tICcuL25vZGVfYXNzZXJ0JztcbmltcG9ydCB7Z2V0UHJvamVjdGlvbk5vZGVzfSBmcm9tICcuL25vZGVfbWFuaXB1bGF0aW9uJztcbmltcG9ydCB7Z2V0TFZpZXdQYXJlbnQsIHVud3JhcFJOb2RlfSBmcm9tICcuL3V0aWwvdmlld191dGlscyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjb2xsZWN0TmF0aXZlTm9kZXMoXG4gIHRWaWV3OiBUVmlldyxcbiAgbFZpZXc6IExWaWV3LFxuICB0Tm9kZTogVE5vZGUgfCBudWxsLFxuICByZXN1bHQ6IGFueVtdLFxuICBpc1Byb2plY3Rpb246IGJvb2xlYW4gPSBmYWxzZSxcbik6IGFueVtdIHtcbiAgd2hpbGUgKHROb2RlICE9PSBudWxsKSB7XG4gICAgLy8gTGV0IGRlY2xhcmF0aW9ucyBkb24ndCBoYXZlIGNvcnJlc3BvbmRpbmcgRE9NIG5vZGVzIHNvIHdlIHNraXAgb3ZlciB0aGVtLlxuICAgIGlmICh0Tm9kZS50eXBlID09PSBUTm9kZVR5cGUuTGV0RGVjbGFyYXRpb24pIHtcbiAgICAgIHROb2RlID0gaXNQcm9qZWN0aW9uID8gdE5vZGUucHJvamVjdGlvbk5leHQgOiB0Tm9kZS5uZXh0O1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgbmdEZXZNb2RlICYmXG4gICAgICBhc3NlcnRUTm9kZVR5cGUoXG4gICAgICAgIHROb2RlLFxuICAgICAgICBUTm9kZVR5cGUuQW55Uk5vZGUgfCBUTm9kZVR5cGUuQW55Q29udGFpbmVyIHwgVE5vZGVUeXBlLlByb2plY3Rpb24gfCBUTm9kZVR5cGUuSWN1LFxuICAgICAgKTtcblxuICAgIGNvbnN0IGxOb2RlID0gbFZpZXdbdE5vZGUuaW5kZXhdO1xuICAgIGlmIChsTm9kZSAhPT0gbnVsbCkge1xuICAgICAgcmVzdWx0LnB1c2godW53cmFwUk5vZGUobE5vZGUpKTtcbiAgICB9XG5cbiAgICAvLyBBIGdpdmVuIGxOb2RlIGNhbiByZXByZXNlbnQgZWl0aGVyIGEgbmF0aXZlIG5vZGUgb3IgYSBMQ29udGFpbmVyICh3aGVuIGl0IGlzIGEgaG9zdCBvZiBhXG4gICAgLy8gVmlld0NvbnRhaW5lclJlZikuIFdoZW4gd2UgZmluZCBhIExDb250YWluZXIgd2UgbmVlZCB0byBkZXNjZW5kIGludG8gaXQgdG8gY29sbGVjdCByb290IG5vZGVzXG4gICAgLy8gZnJvbSB0aGUgdmlld3MgaW4gdGhpcyBjb250YWluZXIuXG4gICAgaWYgKGlzTENvbnRhaW5lcihsTm9kZSkpIHtcbiAgICAgIGNvbGxlY3ROYXRpdmVOb2Rlc0luTENvbnRhaW5lcihsTm9kZSwgcmVzdWx0KTtcbiAgICB9XG5cbiAgICBjb25zdCB0Tm9kZVR5cGUgPSB0Tm9kZS50eXBlO1xuICAgIGlmICh0Tm9kZVR5cGUgJiBUTm9kZVR5cGUuRWxlbWVudENvbnRhaW5lcikge1xuICAgICAgY29sbGVjdE5hdGl2ZU5vZGVzKHRWaWV3LCBsVmlldywgdE5vZGUuY2hpbGQsIHJlc3VsdCk7XG4gICAgfSBlbHNlIGlmICh0Tm9kZVR5cGUgJiBUTm9kZVR5cGUuSWN1KSB7XG4gICAgICBjb25zdCBuZXh0Uk5vZGUgPSBpY3VDb250YWluZXJJdGVyYXRlKHROb2RlIGFzIFRJY3VDb250YWluZXJOb2RlLCBsVmlldyk7XG4gICAgICBsZXQgck5vZGU6IFJOb2RlIHwgbnVsbDtcbiAgICAgIHdoaWxlICgock5vZGUgPSBuZXh0Uk5vZGUoKSkpIHtcbiAgICAgICAgcmVzdWx0LnB1c2gock5vZGUpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodE5vZGVUeXBlICYgVE5vZGVUeXBlLlByb2plY3Rpb24pIHtcbiAgICAgIGNvbnN0IG5vZGVzSW5TbG90ID0gZ2V0UHJvamVjdGlvbk5vZGVzKGxWaWV3LCB0Tm9kZSk7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShub2Rlc0luU2xvdCkpIHtcbiAgICAgICAgcmVzdWx0LnB1c2goLi4ubm9kZXNJblNsb3QpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgcGFyZW50VmlldyA9IGdldExWaWV3UGFyZW50KGxWaWV3W0RFQ0xBUkFUSU9OX0NPTVBPTkVOVF9WSUVXXSkhO1xuICAgICAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0UGFyZW50VmlldyhwYXJlbnRWaWV3KTtcbiAgICAgICAgY29sbGVjdE5hdGl2ZU5vZGVzKHBhcmVudFZpZXdbVFZJRVddLCBwYXJlbnRWaWV3LCBub2Rlc0luU2xvdCwgcmVzdWx0LCB0cnVlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdE5vZGUgPSBpc1Byb2plY3Rpb24gPyB0Tm9kZS5wcm9qZWN0aW9uTmV4dCA6IHROb2RlLm5leHQ7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIENvbGxlY3RzIGFsbCByb290IG5vZGVzIGluIGFsbCB2aWV3cyBpbiBhIGdpdmVuIExDb250YWluZXIuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb2xsZWN0TmF0aXZlTm9kZXNJbkxDb250YWluZXIobENvbnRhaW5lcjogTENvbnRhaW5lciwgcmVzdWx0OiBhbnlbXSkge1xuICBmb3IgKGxldCBpID0gQ09OVEFJTkVSX0hFQURFUl9PRkZTRVQ7IGkgPCBsQ29udGFpbmVyLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgbFZpZXdJbkFDb250YWluZXIgPSBsQ29udGFpbmVyW2ldO1xuICAgIGNvbnN0IGxWaWV3Rmlyc3RDaGlsZFROb2RlID0gbFZpZXdJbkFDb250YWluZXJbVFZJRVddLmZpcnN0Q2hpbGQ7XG4gICAgaWYgKGxWaWV3Rmlyc3RDaGlsZFROb2RlICE9PSBudWxsKSB7XG4gICAgICBjb2xsZWN0TmF0aXZlTm9kZXMobFZpZXdJbkFDb250YWluZXJbVFZJRVddLCBsVmlld0luQUNvbnRhaW5lciwgbFZpZXdGaXJzdENoaWxkVE5vZGUsIHJlc3VsdCk7XG4gICAgfVxuICB9XG5cbiAgLy8gV2hlbiBhbiBMQ29udGFpbmVyIGlzIGNyZWF0ZWQsIHRoZSBhbmNob3IgKGNvbW1lbnQpIG5vZGUgaXM6XG4gIC8vIC0gKDEpIGVpdGhlciByZXVzZWQgaW4gY2FzZSBvZiBhbiBFbGVtZW50Q29udGFpbmVyICg8bmctY29udGFpbmVyPilcbiAgLy8gLSAoMikgb3IgYSBuZXcgY29tbWVudCBub2RlIGlzIGNyZWF0ZWRcbiAgLy8gSW4gdGhlIGZpcnN0IGNhc2UsIHRoZSBhbmNob3IgY29tbWVudCBub2RlIHdvdWxkIGJlIGFkZGVkIHRvIHRoZSBmaW5hbFxuICAvLyBsaXN0IGJ5IHRoZSBjb2RlIGluIHRoZSBgY29sbGVjdE5hdGl2ZU5vZGVzYCBmdW5jdGlvblxuICAvLyAoc2VlIHRoZSBgcmVzdWx0LnB1c2godW53cmFwUk5vZGUobE5vZGUpKWAgbGluZSksIGJ1dCB0aGUgc2Vjb25kXG4gIC8vIGNhc2UgcmVxdWlyZXMgZXh0cmEgaGFuZGxpbmc6IHRoZSBhbmNob3Igbm9kZSBuZWVkcyB0byBiZSBhZGRlZCB0byB0aGVcbiAgLy8gZmluYWwgbGlzdCBtYW51YWxseS4gU2VlIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24gaW4gdGhlIGBjcmVhdGVBbmNob3JOb2RlYFxuICAvLyBmdW5jdGlvbiBpbiB0aGUgYHZpZXdfY29udGFpbmVyX3JlZi50c2AuXG4gIC8vXG4gIC8vIEluIHRoZSBmaXJzdCBjYXNlLCB0aGUgc2FtZSByZWZlcmVuY2Ugd291bGQgYmUgc3RvcmVkIGluIHRoZSBgTkFUSVZFYFxuICAvLyBhbmQgYEhPU1RgIHNsb3RzIGluIGFuIExDb250YWluZXIuIE90aGVyd2lzZSwgdGhpcyBpcyB0aGUgc2Vjb25kIGNhc2UgYW5kXG4gIC8vIHdlIHNob3VsZCBhZGQgYW4gZWxlbWVudCB0byB0aGUgZmluYWwgbGlzdC5cbiAgaWYgKGxDb250YWluZXJbTkFUSVZFXSAhPT0gbENvbnRhaW5lcltIT1NUXSkge1xuICAgIHJlc3VsdC5wdXNoKGxDb250YWluZXJbTkFUSVZFXSk7XG4gIH1cbn1cbiJdfQ==