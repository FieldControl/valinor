/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { setActiveConsumer } from '@angular/core/primitives/signals';
import { formatRuntimeError } from '../../errors';
import { findMatchingDehydratedView } from '../../hydration/views';
import { assertDefined, assertFunction } from '../../util/assert';
import { performanceMarkFeature } from '../../util/performance';
import { assertLContainer, assertLView, assertTNode } from '../assert';
import { bindingUpdated } from '../bindings';
import { CONTAINER_HEADER_OFFSET } from '../interfaces/container';
import { CONTEXT, DECLARATION_COMPONENT_VIEW, HEADER_OFFSET, HYDRATION, TVIEW, } from '../interfaces/view';
import { LiveCollection, reconcile } from '../list_reconciliation';
import { destroyLView, detachView } from '../node_manipulation';
import { getLView, getSelectedIndex, getTView, nextBindingIndex } from '../state';
import { NO_CHANGE } from '../tokens';
import { getConstant, getTNode } from '../util/view_utils';
import { addLViewToLContainer, createAndRenderEmbeddedLView, getLViewFromLContainer, removeLViewFromLContainer, shouldAddViewToDom, } from '../view_manipulation';
import { declareTemplate } from './template';
/**
 * The conditional instruction represents the basic building block on the runtime side to support
 * built-in "if" and "switch". On the high level this instruction is responsible for adding and
 * removing views selected by a conditional expression.
 *
 * @param matchingTemplateIndex Index of a template TNode representing a conditional view to be
 *     inserted; -1 represents a special case when there is no view to insert.
 * @param contextValue Value that should be exposed as the context of the conditional.
 * @codeGenApi
 */
export function ɵɵconditional(matchingTemplateIndex, contextValue) {
    performanceMarkFeature('NgControlFlow');
    const hostLView = getLView();
    const bindingIndex = nextBindingIndex();
    const prevMatchingTemplateIndex = hostLView[bindingIndex] !== NO_CHANGE ? hostLView[bindingIndex] : -1;
    const prevContainer = prevMatchingTemplateIndex !== -1
        ? getLContainer(hostLView, HEADER_OFFSET + prevMatchingTemplateIndex)
        : undefined;
    const viewInContainerIdx = 0;
    if (bindingUpdated(hostLView, bindingIndex, matchingTemplateIndex)) {
        const prevConsumer = setActiveConsumer(null);
        try {
            // The index of the view to show changed - remove the previously displayed one
            // (it is a noop if there are no active views in a container).
            if (prevContainer !== undefined) {
                removeLViewFromLContainer(prevContainer, viewInContainerIdx);
            }
            // Index -1 is a special case where none of the conditions evaluates to
            // a truthy value and as the consequence we've got no view to show.
            if (matchingTemplateIndex !== -1) {
                const nextLContainerIndex = HEADER_OFFSET + matchingTemplateIndex;
                const nextContainer = getLContainer(hostLView, nextLContainerIndex);
                const templateTNode = getExistingTNode(hostLView[TVIEW], nextLContainerIndex);
                const dehydratedView = findMatchingDehydratedView(nextContainer, templateTNode.tView.ssrId);
                const embeddedLView = createAndRenderEmbeddedLView(hostLView, templateTNode, contextValue, {
                    dehydratedView,
                });
                addLViewToLContainer(nextContainer, embeddedLView, viewInContainerIdx, shouldAddViewToDom(templateTNode, dehydratedView));
            }
        }
        finally {
            setActiveConsumer(prevConsumer);
        }
    }
    else if (prevContainer !== undefined) {
        // We might keep displaying the same template but the actual value of the expression could have
        // changed - re-bind in context.
        const lView = getLViewFromLContainer(prevContainer, viewInContainerIdx);
        if (lView !== undefined) {
            lView[CONTEXT] = contextValue;
        }
    }
}
export class RepeaterContext {
    constructor(lContainer, $implicit, $index) {
        this.lContainer = lContainer;
        this.$implicit = $implicit;
        this.$index = $index;
    }
    get $count() {
        return this.lContainer.length - CONTAINER_HEADER_OFFSET;
    }
}
/**
 * A built-in trackBy function used for situations where users specified collection index as a
 * tracking expression. Having this function body in the runtime avoids unnecessary code generation.
 *
 * @param index
 * @returns
 */
export function ɵɵrepeaterTrackByIndex(index) {
    return index;
}
/**
 * A built-in trackBy function used for situations where users specified collection item reference
 * as a tracking expression. Having this function body in the runtime avoids unnecessary code
 * generation.
 *
 * @param index
 * @returns
 */
export function ɵɵrepeaterTrackByIdentity(_, value) {
    return value;
}
class RepeaterMetadata {
    constructor(hasEmptyBlock, trackByFn, liveCollection) {
        this.hasEmptyBlock = hasEmptyBlock;
        this.trackByFn = trackByFn;
        this.liveCollection = liveCollection;
    }
}
/**
 * The repeaterCreate instruction runs in the creation part of the template pass and initializes
 * internal data structures required by the update pass of the built-in repeater logic. Repeater
 * metadata are allocated in the data part of LView with the following layout:
 * - LView[HEADER_OFFSET + index] - metadata
 * - LView[HEADER_OFFSET + index + 1] - reference to a template function rendering an item
 * - LView[HEADER_OFFSET + index + 2] - optional reference to a template function rendering an empty
 * block
 *
 * @param index Index at which to store the metadata of the repeater.
 * @param templateFn Reference to the template of the main repeater block.
 * @param decls The number of nodes, local refs, and pipes for the main block.
 * @param vars The number of bindings for the main block.
 * @param tagName The name of the container element, if applicable
 * @param attrsIndex Index of template attributes in the `consts` array.
 * @param trackByFn Reference to the tracking function.
 * @param trackByUsesComponentInstance Whether the tracking function has any references to the
 *  component instance. If it doesn't, we can avoid rebinding it.
 * @param emptyTemplateFn Reference to the template function of the empty block.
 * @param emptyDecls The number of nodes, local refs, and pipes for the empty block.
 * @param emptyVars The number of bindings for the empty block.
 * @param emptyTagName The name of the empty block container element, if applicable
 * @param emptyAttrsIndex Index of the empty block template attributes in the `consts` array.
 *
 * @codeGenApi
 */
export function ɵɵrepeaterCreate(index, templateFn, decls, vars, tagName, attrsIndex, trackByFn, trackByUsesComponentInstance, emptyTemplateFn, emptyDecls, emptyVars, emptyTagName, emptyAttrsIndex) {
    performanceMarkFeature('NgControlFlow');
    ngDevMode &&
        assertFunction(trackByFn, `A track expression must be a function, was ${typeof trackByFn} instead.`);
    const lView = getLView();
    const tView = getTView();
    const hasEmptyBlock = emptyTemplateFn !== undefined;
    const hostLView = getLView();
    const boundTrackBy = trackByUsesComponentInstance
        ? // We only want to bind when necessary, because it produces a
            // new function. For pure functions it's not necessary.
            trackByFn.bind(hostLView[DECLARATION_COMPONENT_VIEW][CONTEXT])
        : trackByFn;
    const metadata = new RepeaterMetadata(hasEmptyBlock, boundTrackBy);
    hostLView[HEADER_OFFSET + index] = metadata;
    declareTemplate(lView, tView, index + 1, templateFn, decls, vars, tagName, getConstant(tView.consts, attrsIndex));
    if (hasEmptyBlock) {
        ngDevMode &&
            assertDefined(emptyDecls, 'Missing number of declarations for the empty repeater block.');
        ngDevMode &&
            assertDefined(emptyVars, 'Missing number of bindings for the empty repeater block.');
        declareTemplate(lView, tView, index + 2, emptyTemplateFn, emptyDecls, emptyVars, emptyTagName, getConstant(tView.consts, emptyAttrsIndex));
    }
}
function isViewExpensiveToRecreate(lView) {
    // assumption: anything more than a text node with a binding is considered "expensive"
    return lView.length - HEADER_OFFSET > 2;
}
class OperationsCounter {
    constructor() {
        this.created = 0;
        this.destroyed = 0;
    }
    reset() {
        this.created = 0;
        this.destroyed = 0;
    }
    recordCreate() {
        this.created++;
    }
    recordDestroy() {
        this.destroyed++;
    }
    /**
     * A method indicating if the entire collection was re-created as part of the reconciliation pass.
     * Used to warn developers about the usage of a tracking function that might result in excessive
     * amount of view creation / destroy operations.
     *
     * @returns boolean value indicating if a live collection was re-created
     */
    wasReCreated(collectionLen) {
        return collectionLen > 0 && this.created === this.destroyed && this.created === collectionLen;
    }
}
class LiveCollectionLContainerImpl extends LiveCollection {
    constructor(lContainer, hostLView, templateTNode) {
        super();
        this.lContainer = lContainer;
        this.hostLView = hostLView;
        this.templateTNode = templateTNode;
        this.operationsCounter = ngDevMode ? new OperationsCounter() : undefined;
        /**
         Property indicating if indexes in the repeater context need to be updated following the live
         collection changes. Index updates are necessary if and only if views are inserted / removed in
         the middle of LContainer. Adds and removals at the end don't require index updates.
       */
        this.needsIndexUpdate = false;
    }
    get length() {
        return this.lContainer.length - CONTAINER_HEADER_OFFSET;
    }
    at(index) {
        return this.getLView(index)[CONTEXT].$implicit;
    }
    attach(index, lView) {
        const dehydratedView = lView[HYDRATION];
        this.needsIndexUpdate ||= index !== this.length;
        addLViewToLContainer(this.lContainer, lView, index, shouldAddViewToDom(this.templateTNode, dehydratedView));
    }
    detach(index) {
        this.needsIndexUpdate ||= index !== this.length - 1;
        return detachExistingView(this.lContainer, index);
    }
    create(index, value) {
        const dehydratedView = findMatchingDehydratedView(this.lContainer, this.templateTNode.tView.ssrId);
        const embeddedLView = createAndRenderEmbeddedLView(this.hostLView, this.templateTNode, new RepeaterContext(this.lContainer, value, index), { dehydratedView });
        this.operationsCounter?.recordCreate();
        return embeddedLView;
    }
    destroy(lView) {
        destroyLView(lView[TVIEW], lView);
        this.operationsCounter?.recordDestroy();
    }
    updateValue(index, value) {
        this.getLView(index)[CONTEXT].$implicit = value;
    }
    reset() {
        this.needsIndexUpdate = false;
        this.operationsCounter?.reset();
    }
    updateIndexes() {
        if (this.needsIndexUpdate) {
            for (let i = 0; i < this.length; i++) {
                this.getLView(i)[CONTEXT].$index = i;
            }
        }
    }
    getLView(index) {
        return getExistingLViewFromLContainer(this.lContainer, index);
    }
}
/**
 * The repeater instruction does update-time diffing of a provided collection (against the
 * collection seen previously) and maps changes in the collection to views structure (by adding,
 * removing or moving views as needed).
 * @param collection - the collection instance to be checked for changes
 * @codeGenApi
 */
export function ɵɵrepeater(collection) {
    const prevConsumer = setActiveConsumer(null);
    const metadataSlotIdx = getSelectedIndex();
    try {
        const hostLView = getLView();
        const hostTView = hostLView[TVIEW];
        const metadata = hostLView[metadataSlotIdx];
        const containerIndex = metadataSlotIdx + 1;
        const lContainer = getLContainer(hostLView, containerIndex);
        if (metadata.liveCollection === undefined) {
            const itemTemplateTNode = getExistingTNode(hostTView, containerIndex);
            metadata.liveCollection = new LiveCollectionLContainerImpl(lContainer, hostLView, itemTemplateTNode);
        }
        else {
            metadata.liveCollection.reset();
        }
        const liveCollection = metadata.liveCollection;
        reconcile(liveCollection, collection, metadata.trackByFn);
        // Warn developers about situations where the entire collection was re-created as part of the
        // reconciliation pass. Note that this warning might be "overreacting" and report cases where
        // the collection re-creation is the intended behavior. Still, the assumption is that most of
        // the time it is undesired.
        if (ngDevMode &&
            metadata.trackByFn === ɵɵrepeaterTrackByIdentity &&
            liveCollection.operationsCounter?.wasReCreated(liveCollection.length) &&
            isViewExpensiveToRecreate(getExistingLViewFromLContainer(lContainer, 0))) {
            const message = formatRuntimeError(-956 /* RuntimeErrorCode.LOOP_TRACK_RECREATE */, `The configured tracking expression (track by identity) caused re-creation of the entire collection of size ${liveCollection.length}. ` +
                'This is an expensive operation requiring destruction and subsequent creation of DOM nodes, directives, components etc. ' +
                'Please review the "track expression" and make sure that it uniquely identifies items in a collection.');
            console.warn(message);
        }
        // moves in the container might caused context's index to get out of order, re-adjust if needed
        liveCollection.updateIndexes();
        // handle empty blocks
        if (metadata.hasEmptyBlock) {
            const bindingIndex = nextBindingIndex();
            const isCollectionEmpty = liveCollection.length === 0;
            if (bindingUpdated(hostLView, bindingIndex, isCollectionEmpty)) {
                const emptyTemplateIndex = metadataSlotIdx + 2;
                const lContainerForEmpty = getLContainer(hostLView, emptyTemplateIndex);
                if (isCollectionEmpty) {
                    const emptyTemplateTNode = getExistingTNode(hostTView, emptyTemplateIndex);
                    const dehydratedView = findMatchingDehydratedView(lContainerForEmpty, emptyTemplateTNode.tView.ssrId);
                    const embeddedLView = createAndRenderEmbeddedLView(hostLView, emptyTemplateTNode, undefined, { dehydratedView });
                    addLViewToLContainer(lContainerForEmpty, embeddedLView, 0, shouldAddViewToDom(emptyTemplateTNode, dehydratedView));
                }
                else {
                    removeLViewFromLContainer(lContainerForEmpty, 0);
                }
            }
        }
    }
    finally {
        setActiveConsumer(prevConsumer);
    }
}
function getLContainer(lView, index) {
    const lContainer = lView[index];
    ngDevMode && assertLContainer(lContainer);
    return lContainer;
}
function detachExistingView(lContainer, index) {
    const existingLView = detachView(lContainer, index);
    ngDevMode && assertLView(existingLView);
    return existingLView;
}
function getExistingLViewFromLContainer(lContainer, index) {
    const existingLView = getLViewFromLContainer(lContainer, index);
    ngDevMode && assertLView(existingLView);
    return existingLView;
}
function getExistingTNode(tView, index) {
    const tNode = getTNode(tView, index);
    ngDevMode && assertTNode(tNode);
    return tNode;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJvbF9mbG93LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvcmVuZGVyMy9pbnN0cnVjdGlvbnMvY29udHJvbF9mbG93LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLGtDQUFrQyxDQUFDO0FBR25FLE9BQU8sRUFBQyxrQkFBa0IsRUFBbUIsTUFBTSxjQUFjLENBQUM7QUFFbEUsT0FBTyxFQUFDLDBCQUEwQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDakUsT0FBTyxFQUFDLGFBQWEsRUFBRSxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNoRSxPQUFPLEVBQUMsc0JBQXNCLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUM5RCxPQUFPLEVBQUMsZ0JBQWdCLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUNyRSxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQzNDLE9BQU8sRUFBQyx1QkFBdUIsRUFBYSxNQUFNLHlCQUF5QixDQUFDO0FBRzVFLE9BQU8sRUFDTCxPQUFPLEVBQ1AsMEJBQTBCLEVBQzFCLGFBQWEsRUFDYixTQUFTLEVBRVQsS0FBSyxHQUVOLE1BQU0sb0JBQW9CLENBQUM7QUFDNUIsT0FBTyxFQUFDLGNBQWMsRUFBRSxTQUFTLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUNqRSxPQUFPLEVBQUMsWUFBWSxFQUFFLFVBQVUsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQzlELE9BQU8sRUFBQyxRQUFRLEVBQUUsZ0JBQWdCLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQ2hGLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFDcEMsT0FBTyxFQUFDLFdBQVcsRUFBRSxR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QWEsR0FBRyxVQUFVLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3BELFNBQVMsSUFBSSxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7SUFFeEMsT0FBTyxhQUF5QixDQUFDO0FBQ25DLENBQUM7QUFFRCxTQUFTLDhCQUE4QixDQUFJLFVBQXNCLEVBQUUsS0FBYTtJQUM5RSxNQUFNLGFBQWEsR0FBRyxzQkFBc0IsQ0FBSSxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDbkUsU0FBUyxJQUFJLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUV4QyxPQUFPLGFBQWMsQ0FBQztBQUN4QixDQUFDO0FBRUQsU0FBUyxnQkFBZ0IsQ0FBQyxLQUFZLEVBQUUsS0FBYTtJQUNuRCxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3JDLFNBQVMsSUFBSSxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFaEMsT0FBTyxLQUFLLENBQUM7QUFDZixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3NldEFjdGl2ZUNvbnN1bWVyfSBmcm9tICdAYW5ndWxhci9jb3JlL3ByaW1pdGl2ZXMvc2lnbmFscyc7XG5cbmltcG9ydCB7VHJhY2tCeUZ1bmN0aW9ufSBmcm9tICcuLi8uLi9jaGFuZ2VfZGV0ZWN0aW9uJztcbmltcG9ydCB7Zm9ybWF0UnVudGltZUVycm9yLCBSdW50aW1lRXJyb3JDb2RlfSBmcm9tICcuLi8uLi9lcnJvcnMnO1xuaW1wb3J0IHtEZWh5ZHJhdGVkQ29udGFpbmVyVmlld30gZnJvbSAnLi4vLi4vaHlkcmF0aW9uL2ludGVyZmFjZXMnO1xuaW1wb3J0IHtmaW5kTWF0Y2hpbmdEZWh5ZHJhdGVkVmlld30gZnJvbSAnLi4vLi4vaHlkcmF0aW9uL3ZpZXdzJztcbmltcG9ydCB7YXNzZXJ0RGVmaW5lZCwgYXNzZXJ0RnVuY3Rpb259IGZyb20gJy4uLy4uL3V0aWwvYXNzZXJ0JztcbmltcG9ydCB7cGVyZm9ybWFuY2VNYXJrRmVhdHVyZX0gZnJvbSAnLi4vLi4vdXRpbC9wZXJmb3JtYW5jZSc7XG5pbXBvcnQge2Fzc2VydExDb250YWluZXIsIGFzc2VydExWaWV3LCBhc3NlcnRUTm9kZX0gZnJvbSAnLi4vYXNzZXJ0JztcbmltcG9ydCB7YmluZGluZ1VwZGF0ZWR9IGZyb20gJy4uL2JpbmRpbmdzJztcbmltcG9ydCB7Q09OVEFJTkVSX0hFQURFUl9PRkZTRVQsIExDb250YWluZXJ9IGZyb20gJy4uL2ludGVyZmFjZXMvY29udGFpbmVyJztcbmltcG9ydCB7Q29tcG9uZW50VGVtcGxhdGV9IGZyb20gJy4uL2ludGVyZmFjZXMvZGVmaW5pdGlvbic7XG5pbXBvcnQge1ROb2RlfSBmcm9tICcuLi9pbnRlcmZhY2VzL25vZGUnO1xuaW1wb3J0IHtcbiAgQ09OVEVYVCxcbiAgREVDTEFSQVRJT05fQ09NUE9ORU5UX1ZJRVcsXG4gIEhFQURFUl9PRkZTRVQsXG4gIEhZRFJBVElPTixcbiAgTFZpZXcsXG4gIFRWSUVXLFxuICBUVmlldyxcbn0gZnJvbSAnLi4vaW50ZXJmYWNlcy92aWV3JztcbmltcG9ydCB7TGl2ZUNvbGxlY3Rpb24sIHJlY29uY2lsZX0gZnJvbSAnLi4vbGlzdF9yZWNvbmNpbGlhdGlvbic7XG5pbXBvcnQge2Rlc3Ryb3lMVmlldywgZGV0YWNoVmlld30gZnJvbSAnLi4vbm9kZV9tYW5pcHVsYXRpb24nO1xuaW1wb3J0IHtnZXRMVmlldywgZ2V0U2VsZWN0ZWRJbmRleCwgZ2V0VFZpZXcsIG5leHRCaW5kaW5nSW5kZXh9IGZyb20gJy4uL3N0YXRlJztcbmltcG9ydCB7Tk9fQ0hBTkdFfSBmcm9tICcuLi90b2tlbnMnO1xuaW1wb3J0IHtnZXRDb25zdGFudCwgZ2V0VE5vZGV9IGZyb20gJy4uL3V0aWwvdmlld191dGlscyc7XG5pbXBvcnQge1xuICBhZGRMVmlld1RvTENvbnRhaW5lcixcbiAgY3JlYXRlQW5kUmVuZGVyRW1iZWRkZWRMVmlldyxcbiAgZ2V0TFZpZXdGcm9tTENvbnRhaW5lcixcbiAgcmVtb3ZlTFZpZXdGcm9tTENvbnRhaW5lcixcbiAgc2hvdWxkQWRkVmlld1RvRG9tLFxufSBmcm9tICcuLi92aWV3X21hbmlwdWxhdGlvbic7XG5cbmltcG9ydCB7ZGVjbGFyZVRlbXBsYXRlfSBmcm9tICcuL3RlbXBsYXRlJztcblxuLyoqXG4gKiBUaGUgY29uZGl0aW9uYWwgaW5zdHJ1Y3Rpb24gcmVwcmVzZW50cyB0aGUgYmFzaWMgYnVpbGRpbmcgYmxvY2sgb24gdGhlIHJ1bnRpbWUgc2lkZSB0byBzdXBwb3J0XG4gKiBidWlsdC1pbiBcImlmXCIgYW5kIFwic3dpdGNoXCIuIE9uIHRoZSBoaWdoIGxldmVsIHRoaXMgaW5zdHJ1Y3Rpb24gaXMgcmVzcG9uc2libGUgZm9yIGFkZGluZyBhbmRcbiAqIHJlbW92aW5nIHZpZXdzIHNlbGVjdGVkIGJ5IGEgY29uZGl0aW9uYWwgZXhwcmVzc2lvbi5cbiAqXG4gKiBAcGFyYW0gbWF0Y2hpbmdUZW1wbGF0ZUluZGV4IEluZGV4IG9mIGEgdGVtcGxhdGUgVE5vZGUgcmVwcmVzZW50aW5nIGEgY29uZGl0aW9uYWwgdmlldyB0byBiZVxuICogICAgIGluc2VydGVkOyAtMSByZXByZXNlbnRzIGEgc3BlY2lhbCBjYXNlIHdoZW4gdGhlcmUgaXMgbm8gdmlldyB0byBpbnNlcnQuXG4gKiBAcGFyYW0gY29udGV4dFZhbHVlIFZhbHVlIHRoYXQgc2hvdWxkIGJlIGV4cG9zZWQgYXMgdGhlIGNvbnRleHQgb2YgdGhlIGNvbmRpdGlvbmFsLlxuICogQGNvZGVHZW5BcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIMm1ybVjb25kaXRpb25hbDxUPihtYXRjaGluZ1RlbXBsYXRlSW5kZXg6IG51bWJlciwgY29udGV4dFZhbHVlPzogVCkge1xuICBwZXJmb3JtYW5jZU1hcmtGZWF0dXJlKCdOZ0NvbnRyb2xGbG93Jyk7XG5cbiAgY29uc3QgaG9zdExWaWV3ID0gZ2V0TFZpZXcoKTtcbiAgY29uc3QgYmluZGluZ0luZGV4ID0gbmV4dEJpbmRpbmdJbmRleCgpO1xuICBjb25zdCBwcmV2TWF0Y2hpbmdUZW1wbGF0ZUluZGV4OiBudW1iZXIgPVxuICAgIGhvc3RMVmlld1tiaW5kaW5nSW5kZXhdICE9PSBOT19DSEFOR0UgPyBob3N0TFZpZXdbYmluZGluZ0luZGV4XSA6IC0xO1xuICBjb25zdCBwcmV2Q29udGFpbmVyID1cbiAgICBwcmV2TWF0Y2hpbmdUZW1wbGF0ZUluZGV4ICE9PSAtMVxuICAgICAgPyBnZXRMQ29udGFpbmVyKGhvc3RMVmlldywgSEVBREVSX09GRlNFVCArIHByZXZNYXRjaGluZ1RlbXBsYXRlSW5kZXgpXG4gICAgICA6IHVuZGVmaW5lZDtcbiAgY29uc3Qgdmlld0luQ29udGFpbmVySWR4ID0gMDtcblxuICBpZiAoYmluZGluZ1VwZGF0ZWQoaG9zdExWaWV3LCBiaW5kaW5nSW5kZXgsIG1hdGNoaW5nVGVtcGxhdGVJbmRleCkpIHtcbiAgICBjb25zdCBwcmV2Q29uc3VtZXIgPSBzZXRBY3RpdmVDb25zdW1lcihudWxsKTtcbiAgICB0cnkge1xuICAgICAgLy8gVGhlIGluZGV4IG9mIHRoZSB2aWV3IHRvIHNob3cgY2hhbmdlZCAtIHJlbW92ZSB0aGUgcHJldmlvdXNseSBkaXNwbGF5ZWQgb25lXG4gICAgICAvLyAoaXQgaXMgYSBub29wIGlmIHRoZXJlIGFyZSBubyBhY3RpdmUgdmlld3MgaW4gYSBjb250YWluZXIpLlxuICAgICAgaWYgKHByZXZDb250YWluZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZW1vdmVMVmlld0Zyb21MQ29udGFpbmVyKHByZXZDb250YWluZXIsIHZpZXdJbkNvbnRhaW5lcklkeCk7XG4gICAgICB9XG5cbiAgICAgIC8vIEluZGV4IC0xIGlzIGEgc3BlY2lhbCBjYXNlIHdoZXJlIG5vbmUgb2YgdGhlIGNvbmRpdGlvbnMgZXZhbHVhdGVzIHRvXG4gICAgICAvLyBhIHRydXRoeSB2YWx1ZSBhbmQgYXMgdGhlIGNvbnNlcXVlbmNlIHdlJ3ZlIGdvdCBubyB2aWV3IHRvIHNob3cuXG4gICAgICBpZiAobWF0Y2hpbmdUZW1wbGF0ZUluZGV4ICE9PSAtMSkge1xuICAgICAgICBjb25zdCBuZXh0TENvbnRhaW5lckluZGV4ID0gSEVBREVSX09GRlNFVCArIG1hdGNoaW5nVGVtcGxhdGVJbmRleDtcbiAgICAgICAgY29uc3QgbmV4dENvbnRhaW5lciA9IGdldExDb250YWluZXIoaG9zdExWaWV3LCBuZXh0TENvbnRhaW5lckluZGV4KTtcbiAgICAgICAgY29uc3QgdGVtcGxhdGVUTm9kZSA9IGdldEV4aXN0aW5nVE5vZGUoaG9zdExWaWV3W1RWSUVXXSwgbmV4dExDb250YWluZXJJbmRleCk7XG5cbiAgICAgICAgY29uc3QgZGVoeWRyYXRlZFZpZXcgPSBmaW5kTWF0Y2hpbmdEZWh5ZHJhdGVkVmlldyhcbiAgICAgICAgICBuZXh0Q29udGFpbmVyLFxuICAgICAgICAgIHRlbXBsYXRlVE5vZGUudFZpZXchLnNzcklkLFxuICAgICAgICApO1xuICAgICAgICBjb25zdCBlbWJlZGRlZExWaWV3ID0gY3JlYXRlQW5kUmVuZGVyRW1iZWRkZWRMVmlldyhob3N0TFZpZXcsIHRlbXBsYXRlVE5vZGUsIGNvbnRleHRWYWx1ZSwge1xuICAgICAgICAgIGRlaHlkcmF0ZWRWaWV3LFxuICAgICAgICB9KTtcblxuICAgICAgICBhZGRMVmlld1RvTENvbnRhaW5lcihcbiAgICAgICAgICBuZXh0Q29udGFpbmVyLFxuICAgICAgICAgIGVtYmVkZGVkTFZpZXcsXG4gICAgICAgICAgdmlld0luQ29udGFpbmVySWR4LFxuICAgICAgICAgIHNob3VsZEFkZFZpZXdUb0RvbSh0ZW1wbGF0ZVROb2RlLCBkZWh5ZHJhdGVkVmlldyksXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldEFjdGl2ZUNvbnN1bWVyKHByZXZDb25zdW1lcik7XG4gICAgfVxuICB9IGVsc2UgaWYgKHByZXZDb250YWluZXIgIT09IHVuZGVmaW5lZCkge1xuICAgIC8vIFdlIG1pZ2h0IGtlZXAgZGlzcGxheWluZyB0aGUgc2FtZSB0ZW1wbGF0ZSBidXQgdGhlIGFjdHVhbCB2YWx1ZSBvZiB0aGUgZXhwcmVzc2lvbiBjb3VsZCBoYXZlXG4gICAgLy8gY2hhbmdlZCAtIHJlLWJpbmQgaW4gY29udGV4dC5cbiAgICBjb25zdCBsVmlldyA9IGdldExWaWV3RnJvbUxDb250YWluZXI8VCB8IHVuZGVmaW5lZD4ocHJldkNvbnRhaW5lciwgdmlld0luQ29udGFpbmVySWR4KTtcbiAgICBpZiAobFZpZXcgIT09IHVuZGVmaW5lZCkge1xuICAgICAgbFZpZXdbQ09OVEVYVF0gPSBjb250ZXh0VmFsdWU7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSZXBlYXRlckNvbnRleHQ8VD4ge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGxDb250YWluZXI6IExDb250YWluZXIsXG4gICAgcHVibGljICRpbXBsaWNpdDogVCxcbiAgICBwdWJsaWMgJGluZGV4OiBudW1iZXIsXG4gICkge31cblxuICBnZXQgJGNvdW50KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMubENvbnRhaW5lci5sZW5ndGggLSBDT05UQUlORVJfSEVBREVSX09GRlNFVDtcbiAgfVxufVxuXG4vKipcbiAqIEEgYnVpbHQtaW4gdHJhY2tCeSBmdW5jdGlvbiB1c2VkIGZvciBzaXR1YXRpb25zIHdoZXJlIHVzZXJzIHNwZWNpZmllZCBjb2xsZWN0aW9uIGluZGV4IGFzIGFcbiAqIHRyYWNraW5nIGV4cHJlc3Npb24uIEhhdmluZyB0aGlzIGZ1bmN0aW9uIGJvZHkgaW4gdGhlIHJ1bnRpbWUgYXZvaWRzIHVubmVjZXNzYXJ5IGNvZGUgZ2VuZXJhdGlvbi5cbiAqXG4gKiBAcGFyYW0gaW5kZXhcbiAqIEByZXR1cm5zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiDJtcm1cmVwZWF0ZXJUcmFja0J5SW5kZXgoaW5kZXg6IG51bWJlcikge1xuICByZXR1cm4gaW5kZXg7XG59XG5cbi8qKlxuICogQSBidWlsdC1pbiB0cmFja0J5IGZ1bmN0aW9uIHVzZWQgZm9yIHNpdHVhdGlvbnMgd2hlcmUgdXNlcnMgc3BlY2lmaWVkIGNvbGxlY3Rpb24gaXRlbSByZWZlcmVuY2VcbiAqIGFzIGEgdHJhY2tpbmcgZXhwcmVzc2lvbi4gSGF2aW5nIHRoaXMgZnVuY3Rpb24gYm9keSBpbiB0aGUgcnVudGltZSBhdm9pZHMgdW5uZWNlc3NhcnkgY29kZVxuICogZ2VuZXJhdGlvbi5cbiAqXG4gKiBAcGFyYW0gaW5kZXhcbiAqIEByZXR1cm5zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiDJtcm1cmVwZWF0ZXJUcmFja0J5SWRlbnRpdHk8VD4oXzogbnVtYmVyLCB2YWx1ZTogVCkge1xuICByZXR1cm4gdmFsdWU7XG59XG5cbmNsYXNzIFJlcGVhdGVyTWV0YWRhdGEge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgaGFzRW1wdHlCbG9jazogYm9vbGVhbixcbiAgICBwdWJsaWMgdHJhY2tCeUZuOiBUcmFja0J5RnVuY3Rpb248dW5rbm93bj4sXG4gICAgcHVibGljIGxpdmVDb2xsZWN0aW9uPzogTGl2ZUNvbGxlY3Rpb25MQ29udGFpbmVySW1wbCxcbiAgKSB7fVxufVxuXG4vKipcbiAqIFRoZSByZXBlYXRlckNyZWF0ZSBpbnN0cnVjdGlvbiBydW5zIGluIHRoZSBjcmVhdGlvbiBwYXJ0IG9mIHRoZSB0ZW1wbGF0ZSBwYXNzIGFuZCBpbml0aWFsaXplc1xuICogaW50ZXJuYWwgZGF0YSBzdHJ1Y3R1cmVzIHJlcXVpcmVkIGJ5IHRoZSB1cGRhdGUgcGFzcyBvZiB0aGUgYnVpbHQtaW4gcmVwZWF0ZXIgbG9naWMuIFJlcGVhdGVyXG4gKiBtZXRhZGF0YSBhcmUgYWxsb2NhdGVkIGluIHRoZSBkYXRhIHBhcnQgb2YgTFZpZXcgd2l0aCB0aGUgZm9sbG93aW5nIGxheW91dDpcbiAqIC0gTFZpZXdbSEVBREVSX09GRlNFVCArIGluZGV4XSAtIG1ldGFkYXRhXG4gKiAtIExWaWV3W0hFQURFUl9PRkZTRVQgKyBpbmRleCArIDFdIC0gcmVmZXJlbmNlIHRvIGEgdGVtcGxhdGUgZnVuY3Rpb24gcmVuZGVyaW5nIGFuIGl0ZW1cbiAqIC0gTFZpZXdbSEVBREVSX09GRlNFVCArIGluZGV4ICsgMl0gLSBvcHRpb25hbCByZWZlcmVuY2UgdG8gYSB0ZW1wbGF0ZSBmdW5jdGlvbiByZW5kZXJpbmcgYW4gZW1wdHlcbiAqIGJsb2NrXG4gKlxuICogQHBhcmFtIGluZGV4IEluZGV4IGF0IHdoaWNoIHRvIHN0b3JlIHRoZSBtZXRhZGF0YSBvZiB0aGUgcmVwZWF0ZXIuXG4gKiBAcGFyYW0gdGVtcGxhdGVGbiBSZWZlcmVuY2UgdG8gdGhlIHRlbXBsYXRlIG9mIHRoZSBtYWluIHJlcGVhdGVyIGJsb2NrLlxuICogQHBhcmFtIGRlY2xzIFRoZSBudW1iZXIgb2Ygbm9kZXMsIGxvY2FsIHJlZnMsIGFuZCBwaXBlcyBmb3IgdGhlIG1haW4gYmxvY2suXG4gKiBAcGFyYW0gdmFycyBUaGUgbnVtYmVyIG9mIGJpbmRpbmdzIGZvciB0aGUgbWFpbiBibG9jay5cbiAqIEBwYXJhbSB0YWdOYW1lIFRoZSBuYW1lIG9mIHRoZSBjb250YWluZXIgZWxlbWVudCwgaWYgYXBwbGljYWJsZVxuICogQHBhcmFtIGF0dHJzSW5kZXggSW5kZXggb2YgdGVtcGxhdGUgYXR0cmlidXRlcyBpbiB0aGUgYGNvbnN0c2AgYXJyYXkuXG4gKiBAcGFyYW0gdHJhY2tCeUZuIFJlZmVyZW5jZSB0byB0aGUgdHJhY2tpbmcgZnVuY3Rpb24uXG4gKiBAcGFyYW0gdHJhY2tCeVVzZXNDb21wb25lbnRJbnN0YW5jZSBXaGV0aGVyIHRoZSB0cmFja2luZyBmdW5jdGlvbiBoYXMgYW55IHJlZmVyZW5jZXMgdG8gdGhlXG4gKiAgY29tcG9uZW50IGluc3RhbmNlLiBJZiBpdCBkb2Vzbid0LCB3ZSBjYW4gYXZvaWQgcmViaW5kaW5nIGl0LlxuICogQHBhcmFtIGVtcHR5VGVtcGxhdGVGbiBSZWZlcmVuY2UgdG8gdGhlIHRlbXBsYXRlIGZ1bmN0aW9uIG9mIHRoZSBlbXB0eSBibG9jay5cbiAqIEBwYXJhbSBlbXB0eURlY2xzIFRoZSBudW1iZXIgb2Ygbm9kZXMsIGxvY2FsIHJlZnMsIGFuZCBwaXBlcyBmb3IgdGhlIGVtcHR5IGJsb2NrLlxuICogQHBhcmFtIGVtcHR5VmFycyBUaGUgbnVtYmVyIG9mIGJpbmRpbmdzIGZvciB0aGUgZW1wdHkgYmxvY2suXG4gKiBAcGFyYW0gZW1wdHlUYWdOYW1lIFRoZSBuYW1lIG9mIHRoZSBlbXB0eSBibG9jayBjb250YWluZXIgZWxlbWVudCwgaWYgYXBwbGljYWJsZVxuICogQHBhcmFtIGVtcHR5QXR0cnNJbmRleCBJbmRleCBvZiB0aGUgZW1wdHkgYmxvY2sgdGVtcGxhdGUgYXR0cmlidXRlcyBpbiB0aGUgYGNvbnN0c2AgYXJyYXkuXG4gKlxuICogQGNvZGVHZW5BcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIMm1ybVyZXBlYXRlckNyZWF0ZShcbiAgaW5kZXg6IG51bWJlcixcbiAgdGVtcGxhdGVGbjogQ29tcG9uZW50VGVtcGxhdGU8dW5rbm93bj4sXG4gIGRlY2xzOiBudW1iZXIsXG4gIHZhcnM6IG51bWJlcixcbiAgdGFnTmFtZTogc3RyaW5nIHwgbnVsbCxcbiAgYXR0cnNJbmRleDogbnVtYmVyIHwgbnVsbCxcbiAgdHJhY2tCeUZuOiBUcmFja0J5RnVuY3Rpb248dW5rbm93bj4sXG4gIHRyYWNrQnlVc2VzQ29tcG9uZW50SW5zdGFuY2U/OiBib29sZWFuLFxuICBlbXB0eVRlbXBsYXRlRm4/OiBDb21wb25lbnRUZW1wbGF0ZTx1bmtub3duPixcbiAgZW1wdHlEZWNscz86IG51bWJlcixcbiAgZW1wdHlWYXJzPzogbnVtYmVyLFxuICBlbXB0eVRhZ05hbWU/OiBzdHJpbmcgfCBudWxsLFxuICBlbXB0eUF0dHJzSW5kZXg/OiBudW1iZXIgfCBudWxsLFxuKTogdm9pZCB7XG4gIHBlcmZvcm1hbmNlTWFya0ZlYXR1cmUoJ05nQ29udHJvbEZsb3cnKTtcblxuICBuZ0Rldk1vZGUgJiZcbiAgICBhc3NlcnRGdW5jdGlvbihcbiAgICAgIHRyYWNrQnlGbixcbiAgICAgIGBBIHRyYWNrIGV4cHJlc3Npb24gbXVzdCBiZSBhIGZ1bmN0aW9uLCB3YXMgJHt0eXBlb2YgdHJhY2tCeUZufSBpbnN0ZWFkLmAsXG4gICAgKTtcblxuICBjb25zdCBsVmlldyA9IGdldExWaWV3KCk7XG4gIGNvbnN0IHRWaWV3ID0gZ2V0VFZpZXcoKTtcbiAgY29uc3QgaGFzRW1wdHlCbG9jayA9IGVtcHR5VGVtcGxhdGVGbiAhPT0gdW5kZWZpbmVkO1xuICBjb25zdCBob3N0TFZpZXcgPSBnZXRMVmlldygpO1xuICBjb25zdCBib3VuZFRyYWNrQnkgPSB0cmFja0J5VXNlc0NvbXBvbmVudEluc3RhbmNlXG4gICAgPyAvLyBXZSBvbmx5IHdhbnQgdG8gYmluZCB3aGVuIG5lY2Vzc2FyeSwgYmVjYXVzZSBpdCBwcm9kdWNlcyBhXG4gICAgICAvLyBuZXcgZnVuY3Rpb24uIEZvciBwdXJlIGZ1bmN0aW9ucyBpdCdzIG5vdCBuZWNlc3NhcnkuXG4gICAgICB0cmFja0J5Rm4uYmluZChob3N0TFZpZXdbREVDTEFSQVRJT05fQ09NUE9ORU5UX1ZJRVddW0NPTlRFWFRdKVxuICAgIDogdHJhY2tCeUZuO1xuICBjb25zdCBtZXRhZGF0YSA9IG5ldyBSZXBlYXRlck1ldGFkYXRhKGhhc0VtcHR5QmxvY2ssIGJvdW5kVHJhY2tCeSk7XG4gIGhvc3RMVmlld1tIRUFERVJfT0ZGU0VUICsgaW5kZXhdID0gbWV0YWRhdGE7XG5cbiAgZGVjbGFyZVRlbXBsYXRlKFxuICAgIGxWaWV3LFxuICAgIHRWaWV3LFxuICAgIGluZGV4ICsgMSxcbiAgICB0ZW1wbGF0ZUZuLFxuICAgIGRlY2xzLFxuICAgIHZhcnMsXG4gICAgdGFnTmFtZSxcbiAgICBnZXRDb25zdGFudCh0Vmlldy5jb25zdHMsIGF0dHJzSW5kZXgpLFxuICApO1xuXG4gIGlmIChoYXNFbXB0eUJsb2NrKSB7XG4gICAgbmdEZXZNb2RlICYmXG4gICAgICBhc3NlcnREZWZpbmVkKGVtcHR5RGVjbHMsICdNaXNzaW5nIG51bWJlciBvZiBkZWNsYXJhdGlvbnMgZm9yIHRoZSBlbXB0eSByZXBlYXRlciBibG9jay4nKTtcbiAgICBuZ0Rldk1vZGUgJiZcbiAgICAgIGFzc2VydERlZmluZWQoZW1wdHlWYXJzLCAnTWlzc2luZyBudW1iZXIgb2YgYmluZGluZ3MgZm9yIHRoZSBlbXB0eSByZXBlYXRlciBibG9jay4nKTtcblxuICAgIGRlY2xhcmVUZW1wbGF0ZShcbiAgICAgIGxWaWV3LFxuICAgICAgdFZpZXcsXG4gICAgICBpbmRleCArIDIsXG4gICAgICBlbXB0eVRlbXBsYXRlRm4sXG4gICAgICBlbXB0eURlY2xzISxcbiAgICAgIGVtcHR5VmFycyEsXG4gICAgICBlbXB0eVRhZ05hbWUsXG4gICAgICBnZXRDb25zdGFudCh0Vmlldy5jb25zdHMsIGVtcHR5QXR0cnNJbmRleCksXG4gICAgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc1ZpZXdFeHBlbnNpdmVUb1JlY3JlYXRlKGxWaWV3OiBMVmlldyk6IGJvb2xlYW4ge1xuICAvLyBhc3N1bXB0aW9uOiBhbnl0aGluZyBtb3JlIHRoYW4gYSB0ZXh0IG5vZGUgd2l0aCBhIGJpbmRpbmcgaXMgY29uc2lkZXJlZCBcImV4cGVuc2l2ZVwiXG4gIHJldHVybiBsVmlldy5sZW5ndGggLSBIRUFERVJfT0ZGU0VUID4gMjtcbn1cblxuY2xhc3MgT3BlcmF0aW9uc0NvdW50ZXIge1xuICBjcmVhdGVkID0gMDtcbiAgZGVzdHJveWVkID0gMDtcblxuICByZXNldCgpIHtcbiAgICB0aGlzLmNyZWF0ZWQgPSAwO1xuICAgIHRoaXMuZGVzdHJveWVkID0gMDtcbiAgfVxuXG4gIHJlY29yZENyZWF0ZSgpIHtcbiAgICB0aGlzLmNyZWF0ZWQrKztcbiAgfVxuXG4gIHJlY29yZERlc3Ryb3koKSB7XG4gICAgdGhpcy5kZXN0cm95ZWQrKztcbiAgfVxuXG4gIC8qKlxuICAgKiBBIG1ldGhvZCBpbmRpY2F0aW5nIGlmIHRoZSBlbnRpcmUgY29sbGVjdGlvbiB3YXMgcmUtY3JlYXRlZCBhcyBwYXJ0IG9mIHRoZSByZWNvbmNpbGlhdGlvbiBwYXNzLlxuICAgKiBVc2VkIHRvIHdhcm4gZGV2ZWxvcGVycyBhYm91dCB0aGUgdXNhZ2Ugb2YgYSB0cmFja2luZyBmdW5jdGlvbiB0aGF0IG1pZ2h0IHJlc3VsdCBpbiBleGNlc3NpdmVcbiAgICogYW1vdW50IG9mIHZpZXcgY3JlYXRpb24gLyBkZXN0cm95IG9wZXJhdGlvbnMuXG4gICAqXG4gICAqIEByZXR1cm5zIGJvb2xlYW4gdmFsdWUgaW5kaWNhdGluZyBpZiBhIGxpdmUgY29sbGVjdGlvbiB3YXMgcmUtY3JlYXRlZFxuICAgKi9cbiAgd2FzUmVDcmVhdGVkKGNvbGxlY3Rpb25MZW46IG51bWJlcik6IGJvb2xlYW4ge1xuICAgIHJldHVybiBjb2xsZWN0aW9uTGVuID4gMCAmJiB0aGlzLmNyZWF0ZWQgPT09IHRoaXMuZGVzdHJveWVkICYmIHRoaXMuY3JlYXRlZCA9PT0gY29sbGVjdGlvbkxlbjtcbiAgfVxufVxuXG5jbGFzcyBMaXZlQ29sbGVjdGlvbkxDb250YWluZXJJbXBsIGV4dGVuZHMgTGl2ZUNvbGxlY3Rpb248XG4gIExWaWV3PFJlcGVhdGVyQ29udGV4dDx1bmtub3duPj4sXG4gIHVua25vd25cbj4ge1xuICBvcGVyYXRpb25zQ291bnRlciA9IG5nRGV2TW9kZSA/IG5ldyBPcGVyYXRpb25zQ291bnRlcigpIDogdW5kZWZpbmVkO1xuXG4gIC8qKlxuICAgUHJvcGVydHkgaW5kaWNhdGluZyBpZiBpbmRleGVzIGluIHRoZSByZXBlYXRlciBjb250ZXh0IG5lZWQgdG8gYmUgdXBkYXRlZCBmb2xsb3dpbmcgdGhlIGxpdmVcbiAgIGNvbGxlY3Rpb24gY2hhbmdlcy4gSW5kZXggdXBkYXRlcyBhcmUgbmVjZXNzYXJ5IGlmIGFuZCBvbmx5IGlmIHZpZXdzIGFyZSBpbnNlcnRlZCAvIHJlbW92ZWQgaW5cbiAgIHRoZSBtaWRkbGUgb2YgTENvbnRhaW5lci4gQWRkcyBhbmQgcmVtb3ZhbHMgYXQgdGhlIGVuZCBkb24ndCByZXF1aXJlIGluZGV4IHVwZGF0ZXMuXG4gKi9cbiAgcHJpdmF0ZSBuZWVkc0luZGV4VXBkYXRlID0gZmFsc2U7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgbENvbnRhaW5lcjogTENvbnRhaW5lcixcbiAgICBwcml2YXRlIGhvc3RMVmlldzogTFZpZXcsXG4gICAgcHJpdmF0ZSB0ZW1wbGF0ZVROb2RlOiBUTm9kZSxcbiAgKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIG92ZXJyaWRlIGdldCBsZW5ndGgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5sQ29udGFpbmVyLmxlbmd0aCAtIENPTlRBSU5FUl9IRUFERVJfT0ZGU0VUO1xuICB9XG4gIG92ZXJyaWRlIGF0KGluZGV4OiBudW1iZXIpOiB1bmtub3duIHtcbiAgICByZXR1cm4gdGhpcy5nZXRMVmlldyhpbmRleClbQ09OVEVYVF0uJGltcGxpY2l0O1xuICB9XG4gIG92ZXJyaWRlIGF0dGFjaChpbmRleDogbnVtYmVyLCBsVmlldzogTFZpZXc8UmVwZWF0ZXJDb250ZXh0PHVua25vd24+Pik6IHZvaWQge1xuICAgIGNvbnN0IGRlaHlkcmF0ZWRWaWV3ID0gbFZpZXdbSFlEUkFUSU9OXSBhcyBEZWh5ZHJhdGVkQ29udGFpbmVyVmlldztcbiAgICB0aGlzLm5lZWRzSW5kZXhVcGRhdGUgfHw9IGluZGV4ICE9PSB0aGlzLmxlbmd0aDtcbiAgICBhZGRMVmlld1RvTENvbnRhaW5lcihcbiAgICAgIHRoaXMubENvbnRhaW5lcixcbiAgICAgIGxWaWV3LFxuICAgICAgaW5kZXgsXG4gICAgICBzaG91bGRBZGRWaWV3VG9Eb20odGhpcy50ZW1wbGF0ZVROb2RlLCBkZWh5ZHJhdGVkVmlldyksXG4gICAgKTtcbiAgfVxuICBvdmVycmlkZSBkZXRhY2goaW5kZXg6IG51bWJlcik6IExWaWV3PFJlcGVhdGVyQ29udGV4dDx1bmtub3duPj4ge1xuICAgIHRoaXMubmVlZHNJbmRleFVwZGF0ZSB8fD0gaW5kZXggIT09IHRoaXMubGVuZ3RoIC0gMTtcbiAgICByZXR1cm4gZGV0YWNoRXhpc3RpbmdWaWV3PFJlcGVhdGVyQ29udGV4dDx1bmtub3duPj4odGhpcy5sQ29udGFpbmVyLCBpbmRleCk7XG4gIH1cbiAgb3ZlcnJpZGUgY3JlYXRlKGluZGV4OiBudW1iZXIsIHZhbHVlOiB1bmtub3duKTogTFZpZXc8UmVwZWF0ZXJDb250ZXh0PHVua25vd24+PiB7XG4gICAgY29uc3QgZGVoeWRyYXRlZFZpZXcgPSBmaW5kTWF0Y2hpbmdEZWh5ZHJhdGVkVmlldyhcbiAgICAgIHRoaXMubENvbnRhaW5lcixcbiAgICAgIHRoaXMudGVtcGxhdGVUTm9kZS50VmlldyEuc3NySWQsXG4gICAgKTtcbiAgICBjb25zdCBlbWJlZGRlZExWaWV3ID0gY3JlYXRlQW5kUmVuZGVyRW1iZWRkZWRMVmlldyhcbiAgICAgIHRoaXMuaG9zdExWaWV3LFxuICAgICAgdGhpcy50ZW1wbGF0ZVROb2RlLFxuICAgICAgbmV3IFJlcGVhdGVyQ29udGV4dCh0aGlzLmxDb250YWluZXIsIHZhbHVlLCBpbmRleCksXG4gICAgICB7ZGVoeWRyYXRlZFZpZXd9LFxuICAgICk7XG4gICAgdGhpcy5vcGVyYXRpb25zQ291bnRlcj8ucmVjb3JkQ3JlYXRlKCk7XG5cbiAgICByZXR1cm4gZW1iZWRkZWRMVmlldztcbiAgfVxuICBvdmVycmlkZSBkZXN0cm95KGxWaWV3OiBMVmlldzxSZXBlYXRlckNvbnRleHQ8dW5rbm93bj4+KTogdm9pZCB7XG4gICAgZGVzdHJveUxWaWV3KGxWaWV3W1RWSUVXXSwgbFZpZXcpO1xuICAgIHRoaXMub3BlcmF0aW9uc0NvdW50ZXI/LnJlY29yZERlc3Ryb3koKTtcbiAgfVxuICBvdmVycmlkZSB1cGRhdGVWYWx1ZShpbmRleDogbnVtYmVyLCB2YWx1ZTogdW5rbm93bik6IHZvaWQge1xuICAgIHRoaXMuZ2V0TFZpZXcoaW5kZXgpW0NPTlRFWFRdLiRpbXBsaWNpdCA9IHZhbHVlO1xuICB9XG5cbiAgcmVzZXQoKTogdm9pZCB7XG4gICAgdGhpcy5uZWVkc0luZGV4VXBkYXRlID0gZmFsc2U7XG4gICAgdGhpcy5vcGVyYXRpb25zQ291bnRlcj8ucmVzZXQoKTtcbiAgfVxuXG4gIHVwZGF0ZUluZGV4ZXMoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMubmVlZHNJbmRleFVwZGF0ZSkge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRoaXMuZ2V0TFZpZXcoaSlbQ09OVEVYVF0uJGluZGV4ID0gaTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGdldExWaWV3KGluZGV4OiBudW1iZXIpOiBMVmlldzxSZXBlYXRlckNvbnRleHQ8dW5rbm93bj4+IHtcbiAgICByZXR1cm4gZ2V0RXhpc3RpbmdMVmlld0Zyb21MQ29udGFpbmVyKHRoaXMubENvbnRhaW5lciwgaW5kZXgpO1xuICB9XG59XG5cbi8qKlxuICogVGhlIHJlcGVhdGVyIGluc3RydWN0aW9uIGRvZXMgdXBkYXRlLXRpbWUgZGlmZmluZyBvZiBhIHByb3ZpZGVkIGNvbGxlY3Rpb24gKGFnYWluc3QgdGhlXG4gKiBjb2xsZWN0aW9uIHNlZW4gcHJldmlvdXNseSkgYW5kIG1hcHMgY2hhbmdlcyBpbiB0aGUgY29sbGVjdGlvbiB0byB2aWV3cyBzdHJ1Y3R1cmUgKGJ5IGFkZGluZyxcbiAqIHJlbW92aW5nIG9yIG1vdmluZyB2aWV3cyBhcyBuZWVkZWQpLlxuICogQHBhcmFtIGNvbGxlY3Rpb24gLSB0aGUgY29sbGVjdGlvbiBpbnN0YW5jZSB0byBiZSBjaGVja2VkIGZvciBjaGFuZ2VzXG4gKiBAY29kZUdlbkFwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gybXJtXJlcGVhdGVyKGNvbGxlY3Rpb246IEl0ZXJhYmxlPHVua25vd24+IHwgdW5kZWZpbmVkIHwgbnVsbCk6IHZvaWQge1xuICBjb25zdCBwcmV2Q29uc3VtZXIgPSBzZXRBY3RpdmVDb25zdW1lcihudWxsKTtcbiAgY29uc3QgbWV0YWRhdGFTbG90SWR4ID0gZ2V0U2VsZWN0ZWRJbmRleCgpO1xuICB0cnkge1xuICAgIGNvbnN0IGhvc3RMVmlldyA9IGdldExWaWV3KCk7XG4gICAgY29uc3QgaG9zdFRWaWV3ID0gaG9zdExWaWV3W1RWSUVXXTtcbiAgICBjb25zdCBtZXRhZGF0YSA9IGhvc3RMVmlld1ttZXRhZGF0YVNsb3RJZHhdIGFzIFJlcGVhdGVyTWV0YWRhdGE7XG4gICAgY29uc3QgY29udGFpbmVySW5kZXggPSBtZXRhZGF0YVNsb3RJZHggKyAxO1xuICAgIGNvbnN0IGxDb250YWluZXIgPSBnZXRMQ29udGFpbmVyKGhvc3RMVmlldywgY29udGFpbmVySW5kZXgpO1xuXG4gICAgaWYgKG1ldGFkYXRhLmxpdmVDb2xsZWN0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnN0IGl0ZW1UZW1wbGF0ZVROb2RlID0gZ2V0RXhpc3RpbmdUTm9kZShob3N0VFZpZXcsIGNvbnRhaW5lckluZGV4KTtcbiAgICAgIG1ldGFkYXRhLmxpdmVDb2xsZWN0aW9uID0gbmV3IExpdmVDb2xsZWN0aW9uTENvbnRhaW5lckltcGwoXG4gICAgICAgIGxDb250YWluZXIsXG4gICAgICAgIGhvc3RMVmlldyxcbiAgICAgICAgaXRlbVRlbXBsYXRlVE5vZGUsXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICBtZXRhZGF0YS5saXZlQ29sbGVjdGlvbi5yZXNldCgpO1xuICAgIH1cblxuICAgIGNvbnN0IGxpdmVDb2xsZWN0aW9uID0gbWV0YWRhdGEubGl2ZUNvbGxlY3Rpb247XG4gICAgcmVjb25jaWxlKGxpdmVDb2xsZWN0aW9uLCBjb2xsZWN0aW9uLCBtZXRhZGF0YS50cmFja0J5Rm4pO1xuXG4gICAgLy8gV2FybiBkZXZlbG9wZXJzIGFib3V0IHNpdHVhdGlvbnMgd2hlcmUgdGhlIGVudGlyZSBjb2xsZWN0aW9uIHdhcyByZS1jcmVhdGVkIGFzIHBhcnQgb2YgdGhlXG4gICAgLy8gcmVjb25jaWxpYXRpb24gcGFzcy4gTm90ZSB0aGF0IHRoaXMgd2FybmluZyBtaWdodCBiZSBcIm92ZXJyZWFjdGluZ1wiIGFuZCByZXBvcnQgY2FzZXMgd2hlcmVcbiAgICAvLyB0aGUgY29sbGVjdGlvbiByZS1jcmVhdGlvbiBpcyB0aGUgaW50ZW5kZWQgYmVoYXZpb3IuIFN0aWxsLCB0aGUgYXNzdW1wdGlvbiBpcyB0aGF0IG1vc3Qgb2ZcbiAgICAvLyB0aGUgdGltZSBpdCBpcyB1bmRlc2lyZWQuXG4gICAgaWYgKFxuICAgICAgbmdEZXZNb2RlICYmXG4gICAgICBtZXRhZGF0YS50cmFja0J5Rm4gPT09IMm1ybVyZXBlYXRlclRyYWNrQnlJZGVudGl0eSAmJlxuICAgICAgbGl2ZUNvbGxlY3Rpb24ub3BlcmF0aW9uc0NvdW50ZXI/Lndhc1JlQ3JlYXRlZChsaXZlQ29sbGVjdGlvbi5sZW5ndGgpICYmXG4gICAgICBpc1ZpZXdFeHBlbnNpdmVUb1JlY3JlYXRlKGdldEV4aXN0aW5nTFZpZXdGcm9tTENvbnRhaW5lcihsQ29udGFpbmVyLCAwKSlcbiAgICApIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBmb3JtYXRSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuTE9PUF9UUkFDS19SRUNSRUFURSxcbiAgICAgICAgYFRoZSBjb25maWd1cmVkIHRyYWNraW5nIGV4cHJlc3Npb24gKHRyYWNrIGJ5IGlkZW50aXR5KSBjYXVzZWQgcmUtY3JlYXRpb24gb2YgdGhlIGVudGlyZSBjb2xsZWN0aW9uIG9mIHNpemUgJHtsaXZlQ29sbGVjdGlvbi5sZW5ndGh9LiBgICtcbiAgICAgICAgICAnVGhpcyBpcyBhbiBleHBlbnNpdmUgb3BlcmF0aW9uIHJlcXVpcmluZyBkZXN0cnVjdGlvbiBhbmQgc3Vic2VxdWVudCBjcmVhdGlvbiBvZiBET00gbm9kZXMsIGRpcmVjdGl2ZXMsIGNvbXBvbmVudHMgZXRjLiAnICtcbiAgICAgICAgICAnUGxlYXNlIHJldmlldyB0aGUgXCJ0cmFjayBleHByZXNzaW9uXCIgYW5kIG1ha2Ugc3VyZSB0aGF0IGl0IHVuaXF1ZWx5IGlkZW50aWZpZXMgaXRlbXMgaW4gYSBjb2xsZWN0aW9uLicsXG4gICAgICApO1xuICAgICAgY29uc29sZS53YXJuKG1lc3NhZ2UpO1xuICAgIH1cblxuICAgIC8vIG1vdmVzIGluIHRoZSBjb250YWluZXIgbWlnaHQgY2F1c2VkIGNvbnRleHQncyBpbmRleCB0byBnZXQgb3V0IG9mIG9yZGVyLCByZS1hZGp1c3QgaWYgbmVlZGVkXG4gICAgbGl2ZUNvbGxlY3Rpb24udXBkYXRlSW5kZXhlcygpO1xuXG4gICAgLy8gaGFuZGxlIGVtcHR5IGJsb2Nrc1xuICAgIGlmIChtZXRhZGF0YS5oYXNFbXB0eUJsb2NrKSB7XG4gICAgICBjb25zdCBiaW5kaW5nSW5kZXggPSBuZXh0QmluZGluZ0luZGV4KCk7XG4gICAgICBjb25zdCBpc0NvbGxlY3Rpb25FbXB0eSA9IGxpdmVDb2xsZWN0aW9uLmxlbmd0aCA9PT0gMDtcbiAgICAgIGlmIChiaW5kaW5nVXBkYXRlZChob3N0TFZpZXcsIGJpbmRpbmdJbmRleCwgaXNDb2xsZWN0aW9uRW1wdHkpKSB7XG4gICAgICAgIGNvbnN0IGVtcHR5VGVtcGxhdGVJbmRleCA9IG1ldGFkYXRhU2xvdElkeCArIDI7XG4gICAgICAgIGNvbnN0IGxDb250YWluZXJGb3JFbXB0eSA9IGdldExDb250YWluZXIoaG9zdExWaWV3LCBlbXB0eVRlbXBsYXRlSW5kZXgpO1xuICAgICAgICBpZiAoaXNDb2xsZWN0aW9uRW1wdHkpIHtcbiAgICAgICAgICBjb25zdCBlbXB0eVRlbXBsYXRlVE5vZGUgPSBnZXRFeGlzdGluZ1ROb2RlKGhvc3RUVmlldywgZW1wdHlUZW1wbGF0ZUluZGV4KTtcbiAgICAgICAgICBjb25zdCBkZWh5ZHJhdGVkVmlldyA9IGZpbmRNYXRjaGluZ0RlaHlkcmF0ZWRWaWV3KFxuICAgICAgICAgICAgbENvbnRhaW5lckZvckVtcHR5LFxuICAgICAgICAgICAgZW1wdHlUZW1wbGF0ZVROb2RlLnRWaWV3IS5zc3JJZCxcbiAgICAgICAgICApO1xuICAgICAgICAgIGNvbnN0IGVtYmVkZGVkTFZpZXcgPSBjcmVhdGVBbmRSZW5kZXJFbWJlZGRlZExWaWV3KFxuICAgICAgICAgICAgaG9zdExWaWV3LFxuICAgICAgICAgICAgZW1wdHlUZW1wbGF0ZVROb2RlLFxuICAgICAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICAgICAge2RlaHlkcmF0ZWRWaWV3fSxcbiAgICAgICAgICApO1xuICAgICAgICAgIGFkZExWaWV3VG9MQ29udGFpbmVyKFxuICAgICAgICAgICAgbENvbnRhaW5lckZvckVtcHR5LFxuICAgICAgICAgICAgZW1iZWRkZWRMVmlldyxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICBzaG91bGRBZGRWaWV3VG9Eb20oZW1wdHlUZW1wbGF0ZVROb2RlLCBkZWh5ZHJhdGVkVmlldyksXG4gICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZW1vdmVMVmlld0Zyb21MQ29udGFpbmVyKGxDb250YWluZXJGb3JFbXB0eSwgMCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0gZmluYWxseSB7XG4gICAgc2V0QWN0aXZlQ29uc3VtZXIocHJldkNvbnN1bWVyKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRMQ29udGFpbmVyKGxWaWV3OiBMVmlldywgaW5kZXg6IG51bWJlcik6IExDb250YWluZXIge1xuICBjb25zdCBsQ29udGFpbmVyID0gbFZpZXdbaW5kZXhdO1xuICBuZ0Rldk1vZGUgJiYgYXNzZXJ0TENvbnRhaW5lcihsQ29udGFpbmVyKTtcblxuICByZXR1cm4gbENvbnRhaW5lcjtcbn1cblxuZnVuY3Rpb24gZGV0YWNoRXhpc3RpbmdWaWV3PFQ+KGxDb250YWluZXI6IExDb250YWluZXIsIGluZGV4OiBudW1iZXIpOiBMVmlldzxUPiB7XG4gIGNvbnN0IGV4aXN0aW5nTFZpZXcgPSBkZXRhY2hWaWV3KGxDb250YWluZXIsIGluZGV4KTtcbiAgbmdEZXZNb2RlICYmIGFzc2VydExWaWV3KGV4aXN0aW5nTFZpZXcpO1xuXG4gIHJldHVybiBleGlzdGluZ0xWaWV3IGFzIExWaWV3PFQ+O1xufVxuXG5mdW5jdGlvbiBnZXRFeGlzdGluZ0xWaWV3RnJvbUxDb250YWluZXI8VD4obENvbnRhaW5lcjogTENvbnRhaW5lciwgaW5kZXg6IG51bWJlcik6IExWaWV3PFQ+IHtcbiAgY29uc3QgZXhpc3RpbmdMVmlldyA9IGdldExWaWV3RnJvbUxDb250YWluZXI8VD4obENvbnRhaW5lciwgaW5kZXgpO1xuICBuZ0Rldk1vZGUgJiYgYXNzZXJ0TFZpZXcoZXhpc3RpbmdMVmlldyk7XG5cbiAgcmV0dXJuIGV4aXN0aW5nTFZpZXchO1xufVxuXG5mdW5jdGlvbiBnZXRFeGlzdGluZ1ROb2RlKHRWaWV3OiBUVmlldywgaW5kZXg6IG51bWJlcik6IFROb2RlIHtcbiAgY29uc3QgdE5vZGUgPSBnZXRUTm9kZSh0VmlldywgaW5kZXgpO1xuICBuZ0Rldk1vZGUgJiYgYXNzZXJ0VE5vZGUodE5vZGUpO1xuXG4gIHJldHVybiB0Tm9kZTtcbn1cbiJdfQ==