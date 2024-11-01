/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ɵCONTAINER_HEADER_OFFSET as CONTAINER_HEADER_OFFSET, ɵDeferBlockState as DeferBlockState, ɵgetDeferBlocks as getDeferBlocks, ɵrenderDeferBlockState as renderDeferBlockState, ɵtriggerResourceLoading as triggerResourceLoading, } from '@angular/core';
/**
 * Represents an individual defer block for testing purposes.
 *
 * @publicApi
 */
export class DeferBlockFixture {
    /** @nodoc */
    constructor(block, componentFixture) {
        this.block = block;
        this.componentFixture = componentFixture;
    }
    /**
     * Renders the specified state of the defer fixture.
     * @param state the defer state to render
     */
    async render(state) {
        if (!hasStateTemplate(state, this.block)) {
            const stateAsString = getDeferBlockStateNameFromEnum(state);
            throw new Error(`Tried to render this defer block in the \`${stateAsString}\` state, ` +
                `but there was no @${stateAsString.toLowerCase()} block defined in a template.`);
        }
        if (state === DeferBlockState.Complete) {
            await triggerResourceLoading(this.block.tDetails, this.block.lView, this.block.tNode);
        }
        // If the `render` method is used explicitly - skip timer-based scheduling for
        // `@placeholder` and `@loading` blocks and render them immediately.
        const skipTimerScheduling = true;
        renderDeferBlockState(state, this.block.tNode, this.block.lContainer, skipTimerScheduling);
        this.componentFixture.detectChanges();
    }
    /**
     * Retrieves all nested child defer block fixtures
     * in a given defer block.
     */
    getDeferBlocks() {
        const deferBlocks = [];
        // An LContainer that represents a defer block has at most 1 view, which is
        // located right after an LContainer header. Get a hold of that view and inspect
        // it for nested defer blocks.
        const deferBlockFixtures = [];
        if (this.block.lContainer.length >= CONTAINER_HEADER_OFFSET) {
            const lView = this.block.lContainer[CONTAINER_HEADER_OFFSET];
            getDeferBlocks(lView, deferBlocks);
            for (const block of deferBlocks) {
                deferBlockFixtures.push(new DeferBlockFixture(block, this.componentFixture));
            }
        }
        return Promise.resolve(deferBlockFixtures);
    }
}
function hasStateTemplate(state, block) {
    switch (state) {
        case DeferBlockState.Placeholder:
            return block.tDetails.placeholderTmplIndex !== null;
        case DeferBlockState.Loading:
            return block.tDetails.loadingTmplIndex !== null;
        case DeferBlockState.Error:
            return block.tDetails.errorTmplIndex !== null;
        case DeferBlockState.Complete:
            return true;
        default:
            return false;
    }
}
function getDeferBlockStateNameFromEnum(state) {
    switch (state) {
        case DeferBlockState.Placeholder:
            return 'Placeholder';
        case DeferBlockState.Loading:
            return 'Loading';
        case DeferBlockState.Error:
            return 'Error';
        default:
            return 'Main';
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3Rlc3Rpbmcvc3JjL2RlZmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFDTCx3QkFBd0IsSUFBSSx1QkFBdUIsRUFFbkQsZ0JBQWdCLElBQUksZUFBZSxFQUNuQyxlQUFlLElBQUksY0FBYyxFQUNqQyxzQkFBc0IsSUFBSSxxQkFBcUIsRUFDL0MsdUJBQXVCLElBQUksc0JBQXNCLEdBQ2xELE1BQU0sZUFBZSxDQUFDO0FBSXZCOzs7O0dBSUc7QUFDSCxNQUFNLE9BQU8saUJBQWlCO0lBQzVCLGFBQWE7SUFDYixZQUNVLEtBQXdCLEVBQ3hCLGdCQUEyQztRQUQzQyxVQUFLLEdBQUwsS0FBSyxDQUFtQjtRQUN4QixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQTJCO0lBQ2xELENBQUM7SUFFSjs7O09BR0c7SUFDSCxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQXNCO1FBQ2pDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDekMsTUFBTSxhQUFhLEdBQUcsOEJBQThCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDNUQsTUFBTSxJQUFJLEtBQUssQ0FDYiw2Q0FBNkMsYUFBYSxZQUFZO2dCQUNwRSxxQkFBcUIsYUFBYSxDQUFDLFdBQVcsRUFBRSwrQkFBK0IsQ0FDbEYsQ0FBQztRQUNKLENBQUM7UUFDRCxJQUFJLEtBQUssS0FBSyxlQUFlLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDdkMsTUFBTSxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3hGLENBQUM7UUFDRCw4RUFBOEU7UUFDOUUsb0VBQW9FO1FBQ3BFLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDO1FBQ2pDLHFCQUFxQixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO1FBQzNGLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUN4QyxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsY0FBYztRQUNaLE1BQU0sV0FBVyxHQUF3QixFQUFFLENBQUM7UUFDNUMsMkVBQTJFO1FBQzNFLGdGQUFnRjtRQUNoRiw4QkFBOEI7UUFDOUIsTUFBTSxrQkFBa0IsR0FBRyxFQUFFLENBQUM7UUFDOUIsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxNQUFNLElBQUksdUJBQXVCLEVBQUUsQ0FBQztZQUM1RCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1lBQzdELGNBQWMsQ0FBQyxLQUFLLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDbkMsS0FBSyxNQUFNLEtBQUssSUFBSSxXQUFXLEVBQUUsQ0FBQztnQkFDaEMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksaUJBQWlCLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7WUFDL0UsQ0FBQztRQUNILENBQUM7UUFDRCxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUM3QyxDQUFDO0NBQ0Y7QUFFRCxTQUFTLGdCQUFnQixDQUFDLEtBQXNCLEVBQUUsS0FBd0I7SUFDeEUsUUFBUSxLQUFLLEVBQUUsQ0FBQztRQUNkLEtBQUssZUFBZSxDQUFDLFdBQVc7WUFDOUIsT0FBTyxLQUFLLENBQUMsUUFBUSxDQUFDLG9CQUFvQixLQUFLLElBQUksQ0FBQztRQUN0RCxLQUFLLGVBQWUsQ0FBQyxPQUFPO1lBQzFCLE9BQU8sS0FBSyxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsS0FBSyxJQUFJLENBQUM7UUFDbEQsS0FBSyxlQUFlLENBQUMsS0FBSztZQUN4QixPQUFPLEtBQUssQ0FBQyxRQUFRLENBQUMsY0FBYyxLQUFLLElBQUksQ0FBQztRQUNoRCxLQUFLLGVBQWUsQ0FBQyxRQUFRO1lBQzNCLE9BQU8sSUFBSSxDQUFDO1FBQ2Q7WUFDRSxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0FBQ0gsQ0FBQztBQUVELFNBQVMsOEJBQThCLENBQUMsS0FBc0I7SUFDNUQsUUFBUSxLQUFLLEVBQUUsQ0FBQztRQUNkLEtBQUssZUFBZSxDQUFDLFdBQVc7WUFDOUIsT0FBTyxhQUFhLENBQUM7UUFDdkIsS0FBSyxlQUFlLENBQUMsT0FBTztZQUMxQixPQUFPLFNBQVMsQ0FBQztRQUNuQixLQUFLLGVBQWUsQ0FBQyxLQUFLO1lBQ3hCLE9BQU8sT0FBTyxDQUFDO1FBQ2pCO1lBQ0UsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIMm1Q09OVEFJTkVSX0hFQURFUl9PRkZTRVQgYXMgQ09OVEFJTkVSX0hFQURFUl9PRkZTRVQsXG4gIMm1RGVmZXJCbG9ja0RldGFpbHMgYXMgRGVmZXJCbG9ja0RldGFpbHMsXG4gIMm1RGVmZXJCbG9ja1N0YXRlIGFzIERlZmVyQmxvY2tTdGF0ZSxcbiAgybVnZXREZWZlckJsb2NrcyBhcyBnZXREZWZlckJsb2NrcyxcbiAgybVyZW5kZXJEZWZlckJsb2NrU3RhdGUgYXMgcmVuZGVyRGVmZXJCbG9ja1N0YXRlLFxuICDJtXRyaWdnZXJSZXNvdXJjZUxvYWRpbmcgYXMgdHJpZ2dlclJlc291cmNlTG9hZGluZyxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB0eXBlIHtDb21wb25lbnRGaXh0dXJlfSBmcm9tICcuL2NvbXBvbmVudF9maXh0dXJlJztcblxuLyoqXG4gKiBSZXByZXNlbnRzIGFuIGluZGl2aWR1YWwgZGVmZXIgYmxvY2sgZm9yIHRlc3RpbmcgcHVycG9zZXMuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgRGVmZXJCbG9ja0ZpeHR1cmUge1xuICAvKiogQG5vZG9jICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgYmxvY2s6IERlZmVyQmxvY2tEZXRhaWxzLFxuICAgIHByaXZhdGUgY29tcG9uZW50Rml4dHVyZTogQ29tcG9uZW50Rml4dHVyZTx1bmtub3duPixcbiAgKSB7fVxuXG4gIC8qKlxuICAgKiBSZW5kZXJzIHRoZSBzcGVjaWZpZWQgc3RhdGUgb2YgdGhlIGRlZmVyIGZpeHR1cmUuXG4gICAqIEBwYXJhbSBzdGF0ZSB0aGUgZGVmZXIgc3RhdGUgdG8gcmVuZGVyXG4gICAqL1xuICBhc3luYyByZW5kZXIoc3RhdGU6IERlZmVyQmxvY2tTdGF0ZSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghaGFzU3RhdGVUZW1wbGF0ZShzdGF0ZSwgdGhpcy5ibG9jaykpIHtcbiAgICAgIGNvbnN0IHN0YXRlQXNTdHJpbmcgPSBnZXREZWZlckJsb2NrU3RhdGVOYW1lRnJvbUVudW0oc3RhdGUpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgVHJpZWQgdG8gcmVuZGVyIHRoaXMgZGVmZXIgYmxvY2sgaW4gdGhlIFxcYCR7c3RhdGVBc1N0cmluZ31cXGAgc3RhdGUsIGAgK1xuICAgICAgICAgIGBidXQgdGhlcmUgd2FzIG5vIEAke3N0YXRlQXNTdHJpbmcudG9Mb3dlckNhc2UoKX0gYmxvY2sgZGVmaW5lZCBpbiBhIHRlbXBsYXRlLmAsXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoc3RhdGUgPT09IERlZmVyQmxvY2tTdGF0ZS5Db21wbGV0ZSkge1xuICAgICAgYXdhaXQgdHJpZ2dlclJlc291cmNlTG9hZGluZyh0aGlzLmJsb2NrLnREZXRhaWxzLCB0aGlzLmJsb2NrLmxWaWV3LCB0aGlzLmJsb2NrLnROb2RlKTtcbiAgICB9XG4gICAgLy8gSWYgdGhlIGByZW5kZXJgIG1ldGhvZCBpcyB1c2VkIGV4cGxpY2l0bHkgLSBza2lwIHRpbWVyLWJhc2VkIHNjaGVkdWxpbmcgZm9yXG4gICAgLy8gYEBwbGFjZWhvbGRlcmAgYW5kIGBAbG9hZGluZ2AgYmxvY2tzIGFuZCByZW5kZXIgdGhlbSBpbW1lZGlhdGVseS5cbiAgICBjb25zdCBza2lwVGltZXJTY2hlZHVsaW5nID0gdHJ1ZTtcbiAgICByZW5kZXJEZWZlckJsb2NrU3RhdGUoc3RhdGUsIHRoaXMuYmxvY2sudE5vZGUsIHRoaXMuYmxvY2subENvbnRhaW5lciwgc2tpcFRpbWVyU2NoZWR1bGluZyk7XG4gICAgdGhpcy5jb21wb25lbnRGaXh0dXJlLmRldGVjdENoYW5nZXMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgYWxsIG5lc3RlZCBjaGlsZCBkZWZlciBibG9jayBmaXh0dXJlc1xuICAgKiBpbiBhIGdpdmVuIGRlZmVyIGJsb2NrLlxuICAgKi9cbiAgZ2V0RGVmZXJCbG9ja3MoKTogUHJvbWlzZTxEZWZlckJsb2NrRml4dHVyZVtdPiB7XG4gICAgY29uc3QgZGVmZXJCbG9ja3M6IERlZmVyQmxvY2tEZXRhaWxzW10gPSBbXTtcbiAgICAvLyBBbiBMQ29udGFpbmVyIHRoYXQgcmVwcmVzZW50cyBhIGRlZmVyIGJsb2NrIGhhcyBhdCBtb3N0IDEgdmlldywgd2hpY2ggaXNcbiAgICAvLyBsb2NhdGVkIHJpZ2h0IGFmdGVyIGFuIExDb250YWluZXIgaGVhZGVyLiBHZXQgYSBob2xkIG9mIHRoYXQgdmlldyBhbmQgaW5zcGVjdFxuICAgIC8vIGl0IGZvciBuZXN0ZWQgZGVmZXIgYmxvY2tzLlxuICAgIGNvbnN0IGRlZmVyQmxvY2tGaXh0dXJlcyA9IFtdO1xuICAgIGlmICh0aGlzLmJsb2NrLmxDb250YWluZXIubGVuZ3RoID49IENPTlRBSU5FUl9IRUFERVJfT0ZGU0VUKSB7XG4gICAgICBjb25zdCBsVmlldyA9IHRoaXMuYmxvY2subENvbnRhaW5lcltDT05UQUlORVJfSEVBREVSX09GRlNFVF07XG4gICAgICBnZXREZWZlckJsb2NrcyhsVmlldywgZGVmZXJCbG9ja3MpO1xuICAgICAgZm9yIChjb25zdCBibG9jayBvZiBkZWZlckJsb2Nrcykge1xuICAgICAgICBkZWZlckJsb2NrRml4dHVyZXMucHVzaChuZXcgRGVmZXJCbG9ja0ZpeHR1cmUoYmxvY2ssIHRoaXMuY29tcG9uZW50Rml4dHVyZSkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGRlZmVyQmxvY2tGaXh0dXJlcyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaGFzU3RhdGVUZW1wbGF0ZShzdGF0ZTogRGVmZXJCbG9ja1N0YXRlLCBibG9jazogRGVmZXJCbG9ja0RldGFpbHMpIHtcbiAgc3dpdGNoIChzdGF0ZSkge1xuICAgIGNhc2UgRGVmZXJCbG9ja1N0YXRlLlBsYWNlaG9sZGVyOlxuICAgICAgcmV0dXJuIGJsb2NrLnREZXRhaWxzLnBsYWNlaG9sZGVyVG1wbEluZGV4ICE9PSBudWxsO1xuICAgIGNhc2UgRGVmZXJCbG9ja1N0YXRlLkxvYWRpbmc6XG4gICAgICByZXR1cm4gYmxvY2sudERldGFpbHMubG9hZGluZ1RtcGxJbmRleCAhPT0gbnVsbDtcbiAgICBjYXNlIERlZmVyQmxvY2tTdGF0ZS5FcnJvcjpcbiAgICAgIHJldHVybiBibG9jay50RGV0YWlscy5lcnJvclRtcGxJbmRleCAhPT0gbnVsbDtcbiAgICBjYXNlIERlZmVyQmxvY2tTdGF0ZS5Db21wbGV0ZTpcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0RGVmZXJCbG9ja1N0YXRlTmFtZUZyb21FbnVtKHN0YXRlOiBEZWZlckJsb2NrU3RhdGUpIHtcbiAgc3dpdGNoIChzdGF0ZSkge1xuICAgIGNhc2UgRGVmZXJCbG9ja1N0YXRlLlBsYWNlaG9sZGVyOlxuICAgICAgcmV0dXJuICdQbGFjZWhvbGRlcic7XG4gICAgY2FzZSBEZWZlckJsb2NrU3RhdGUuTG9hZGluZzpcbiAgICAgIHJldHVybiAnTG9hZGluZyc7XG4gICAgY2FzZSBEZWZlckJsb2NrU3RhdGUuRXJyb3I6XG4gICAgICByZXR1cm4gJ0Vycm9yJztcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuICdNYWluJztcbiAgfVxufVxuIl19