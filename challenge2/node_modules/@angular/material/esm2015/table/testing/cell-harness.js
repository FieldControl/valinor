/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { HarnessPredicate, ContentContainerComponentHarness } from '@angular/cdk/testing';
/** Harness for interacting with a standard Angular Material table cell. */
export class MatCellHarness extends ContentContainerComponentHarness {
    /**
     * Gets a `HarnessPredicate` that can be used to search for a table cell with specific attributes.
     * @param options Options for narrowing the search
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return MatCellHarness._getCellPredicate(MatCellHarness, options);
    }
    /** Gets the cell's text. */
    getText() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).text();
        });
    }
    /** Gets the name of the column that the cell belongs to. */
    getColumnName() {
        return __awaiter(this, void 0, void 0, function* () {
            const host = yield this.host();
            const classAttribute = yield host.getAttribute('class');
            if (classAttribute) {
                const prefix = 'mat-column-';
                const name = classAttribute.split(' ').map(c => c.trim()).find(c => c.startsWith(prefix));
                if (name) {
                    return name.split(prefix)[1];
                }
            }
            throw Error('Could not determine column name of cell.');
        });
    }
    static _getCellPredicate(type, options) {
        return new HarnessPredicate(type, options)
            .addOption('text', options.text, (harness, text) => HarnessPredicate.stringMatches(harness.getText(), text))
            .addOption('columnName', options.columnName, (harness, name) => HarnessPredicate.stringMatches(harness.getColumnName(), name));
    }
}
/** The selector for the host element of a `MatCellHarness` instance. */
MatCellHarness.hostSelector = '.mat-cell';
/** Harness for interacting with a standard Angular Material table header cell. */
export class MatHeaderCellHarness extends MatCellHarness {
    /**
     * Gets a `HarnessPredicate` that can be used to search for
     * a table header cell with specific attributes.
     * @param options Options for narrowing the search
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return MatHeaderCellHarness._getCellPredicate(MatHeaderCellHarness, options);
    }
}
/** The selector for the host element of a `MatHeaderCellHarness` instance. */
MatHeaderCellHarness.hostSelector = '.mat-header-cell';
/** Harness for interacting with a standard Angular Material table footer cell. */
export class MatFooterCellHarness extends MatCellHarness {
    /**
     * Gets a `HarnessPredicate` that can be used to search for
     * a table footer cell with specific attributes.
     * @param options Options for narrowing the search
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return MatFooterCellHarness._getCellPredicate(MatFooterCellHarness, options);
    }
}
/** The selector for the host element of a `MatFooterCellHarness` instance. */
MatFooterCellHarness.hostSelector = '.mat-footer-cell';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbC1oYXJuZXNzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL3RhYmxlL3Rlc3RpbmcvY2VsbC1oYXJuZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQ0wsZ0JBQWdCLEVBRWhCLGdDQUFnQyxFQUNqQyxNQUFNLHNCQUFzQixDQUFDO0FBRzlCLDJFQUEyRTtBQUMzRSxNQUFNLE9BQU8sY0FBZSxTQUFRLGdDQUFnQztJQUlsRTs7OztPQUlHO0lBQ0gsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUE4QixFQUFFO1FBQzFDLE9BQU8sY0FBYyxDQUFDLGlCQUFpQixDQUFDLGNBQWMsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNuRSxDQUFDO0lBRUQsNEJBQTRCO0lBQ3RCLE9BQU87O1lBQ1gsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDcEMsQ0FBQztLQUFBO0lBRUQsNERBQTREO0lBQ3RELGFBQWE7O1lBQ2pCLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQy9CLE1BQU0sY0FBYyxHQUFHLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUV4RCxJQUFJLGNBQWMsRUFBRTtnQkFDbEIsTUFBTSxNQUFNLEdBQUcsYUFBYSxDQUFDO2dCQUM3QixNQUFNLElBQUksR0FBRyxjQUFjLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFFMUYsSUFBSSxJQUFJLEVBQUU7b0JBQ1IsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUM5QjthQUNGO1lBRUQsTUFBTSxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztRQUMxRCxDQUFDO0tBQUE7SUFFUyxNQUFNLENBQUMsaUJBQWlCLENBQ2hDLElBQW9DLEVBQ3BDLE9BQTJCO1FBQzNCLE9BQU8sSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDO2FBQ3ZDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLElBQUksRUFDM0IsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO2FBQzlFLFNBQVMsQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDLFVBQVUsRUFDdkMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDMUYsQ0FBQzs7QUExQ0Qsd0VBQXdFO0FBQ2pFLDJCQUFZLEdBQUcsV0FBVyxDQUFDO0FBNENwQyxrRkFBa0Y7QUFDbEYsTUFBTSxPQUFPLG9CQUFxQixTQUFRLGNBQWM7SUFJdEQ7Ozs7O09BS0c7SUFDSCxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQThCLEVBQUU7UUFDMUMsT0FBTyxvQkFBb0IsQ0FBQyxpQkFBaUIsQ0FBQyxvQkFBb0IsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUMvRSxDQUFDOztBQVhELDhFQUE4RTtBQUN2RSxpQ0FBWSxHQUFHLGtCQUFrQixDQUFDO0FBYTNDLGtGQUFrRjtBQUNsRixNQUFNLE9BQU8sb0JBQXFCLFNBQVEsY0FBYztJQUl0RDs7Ozs7T0FLRztJQUNILE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBOEIsRUFBRTtRQUMxQyxPQUFPLG9CQUFvQixDQUFDLGlCQUFpQixDQUFDLG9CQUFvQixFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQy9FLENBQUM7O0FBWEQsOEVBQThFO0FBQ3ZFLGlDQUFZLEdBQUcsa0JBQWtCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgSGFybmVzc1ByZWRpY2F0ZSxcbiAgQ29tcG9uZW50SGFybmVzc0NvbnN0cnVjdG9yLFxuICBDb250ZW50Q29udGFpbmVyQ29tcG9uZW50SGFybmVzc1xufSBmcm9tICdAYW5ndWxhci9jZGsvdGVzdGluZyc7XG5pbXBvcnQge0NlbGxIYXJuZXNzRmlsdGVyc30gZnJvbSAnLi90YWJsZS1oYXJuZXNzLWZpbHRlcnMnO1xuXG4vKiogSGFybmVzcyBmb3IgaW50ZXJhY3Rpbmcgd2l0aCBhIHN0YW5kYXJkIEFuZ3VsYXIgTWF0ZXJpYWwgdGFibGUgY2VsbC4gKi9cbmV4cG9ydCBjbGFzcyBNYXRDZWxsSGFybmVzcyBleHRlbmRzIENvbnRlbnRDb250YWluZXJDb21wb25lbnRIYXJuZXNzIHtcbiAgLyoqIFRoZSBzZWxlY3RvciBmb3IgdGhlIGhvc3QgZWxlbWVudCBvZiBhIGBNYXRDZWxsSGFybmVzc2AgaW5zdGFuY2UuICovXG4gIHN0YXRpYyBob3N0U2VsZWN0b3IgPSAnLm1hdC1jZWxsJztcblxuICAvKipcbiAgICogR2V0cyBhIGBIYXJuZXNzUHJlZGljYXRlYCB0aGF0IGNhbiBiZSB1c2VkIHRvIHNlYXJjaCBmb3IgYSB0YWJsZSBjZWxsIHdpdGggc3BlY2lmaWMgYXR0cmlidXRlcy5cbiAgICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyBmb3IgbmFycm93aW5nIHRoZSBzZWFyY2hcbiAgICogQHJldHVybiBhIGBIYXJuZXNzUHJlZGljYXRlYCBjb25maWd1cmVkIHdpdGggdGhlIGdpdmVuIG9wdGlvbnMuXG4gICAqL1xuICBzdGF0aWMgd2l0aChvcHRpb25zOiBDZWxsSGFybmVzc0ZpbHRlcnMgPSB7fSk6IEhhcm5lc3NQcmVkaWNhdGU8TWF0Q2VsbEhhcm5lc3M+IHtcbiAgICByZXR1cm4gTWF0Q2VsbEhhcm5lc3MuX2dldENlbGxQcmVkaWNhdGUoTWF0Q2VsbEhhcm5lc3MsIG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGNlbGwncyB0ZXh0LiAqL1xuICBhc3luYyBnZXRUZXh0KCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkudGV4dCgpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIG5hbWUgb2YgdGhlIGNvbHVtbiB0aGF0IHRoZSBjZWxsIGJlbG9uZ3MgdG8uICovXG4gIGFzeW5jIGdldENvbHVtbk5hbWUoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCBob3N0ID0gYXdhaXQgdGhpcy5ob3N0KCk7XG4gICAgY29uc3QgY2xhc3NBdHRyaWJ1dGUgPSBhd2FpdCBob3N0LmdldEF0dHJpYnV0ZSgnY2xhc3MnKTtcblxuICAgIGlmIChjbGFzc0F0dHJpYnV0ZSkge1xuICAgICAgY29uc3QgcHJlZml4ID0gJ21hdC1jb2x1bW4tJztcbiAgICAgIGNvbnN0IG5hbWUgPSBjbGFzc0F0dHJpYnV0ZS5zcGxpdCgnICcpLm1hcChjID0+IGMudHJpbSgpKS5maW5kKGMgPT4gYy5zdGFydHNXaXRoKHByZWZpeCkpO1xuXG4gICAgICBpZiAobmFtZSkge1xuICAgICAgICByZXR1cm4gbmFtZS5zcGxpdChwcmVmaXgpWzFdO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRocm93IEVycm9yKCdDb3VsZCBub3QgZGV0ZXJtaW5lIGNvbHVtbiBuYW1lIG9mIGNlbGwuJyk7XG4gIH1cblxuICBwcm90ZWN0ZWQgc3RhdGljIF9nZXRDZWxsUHJlZGljYXRlPFQgZXh0ZW5kcyBNYXRDZWxsSGFybmVzcz4oXG4gICAgdHlwZTogQ29tcG9uZW50SGFybmVzc0NvbnN0cnVjdG9yPFQ+LFxuICAgIG9wdGlvbnM6IENlbGxIYXJuZXNzRmlsdGVycyk6IEhhcm5lc3NQcmVkaWNhdGU8VD4ge1xuICAgIHJldHVybiBuZXcgSGFybmVzc1ByZWRpY2F0ZSh0eXBlLCBvcHRpb25zKVxuICAgICAgLmFkZE9wdGlvbigndGV4dCcsIG9wdGlvbnMudGV4dCxcbiAgICAgICAgICAoaGFybmVzcywgdGV4dCkgPT4gSGFybmVzc1ByZWRpY2F0ZS5zdHJpbmdNYXRjaGVzKGhhcm5lc3MuZ2V0VGV4dCgpLCB0ZXh0KSlcbiAgICAgIC5hZGRPcHRpb24oJ2NvbHVtbk5hbWUnLCBvcHRpb25zLmNvbHVtbk5hbWUsXG4gICAgICAgICAgKGhhcm5lc3MsIG5hbWUpID0+IEhhcm5lc3NQcmVkaWNhdGUuc3RyaW5nTWF0Y2hlcyhoYXJuZXNzLmdldENvbHVtbk5hbWUoKSwgbmFtZSkpO1xuICB9XG59XG5cbi8qKiBIYXJuZXNzIGZvciBpbnRlcmFjdGluZyB3aXRoIGEgc3RhbmRhcmQgQW5ndWxhciBNYXRlcmlhbCB0YWJsZSBoZWFkZXIgY2VsbC4gKi9cbmV4cG9ydCBjbGFzcyBNYXRIZWFkZXJDZWxsSGFybmVzcyBleHRlbmRzIE1hdENlbGxIYXJuZXNzIHtcbiAgLyoqIFRoZSBzZWxlY3RvciBmb3IgdGhlIGhvc3QgZWxlbWVudCBvZiBhIGBNYXRIZWFkZXJDZWxsSGFybmVzc2AgaW5zdGFuY2UuICovXG4gIHN0YXRpYyBob3N0U2VsZWN0b3IgPSAnLm1hdC1oZWFkZXItY2VsbCc7XG5cbiAgLyoqXG4gICAqIEdldHMgYSBgSGFybmVzc1ByZWRpY2F0ZWAgdGhhdCBjYW4gYmUgdXNlZCB0byBzZWFyY2ggZm9yXG4gICAqIGEgdGFibGUgaGVhZGVyIGNlbGwgd2l0aCBzcGVjaWZpYyBhdHRyaWJ1dGVzLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIGZvciBuYXJyb3dpbmcgdGhlIHNlYXJjaFxuICAgKiBAcmV0dXJuIGEgYEhhcm5lc3NQcmVkaWNhdGVgIGNvbmZpZ3VyZWQgd2l0aCB0aGUgZ2l2ZW4gb3B0aW9ucy5cbiAgICovXG4gIHN0YXRpYyB3aXRoKG9wdGlvbnM6IENlbGxIYXJuZXNzRmlsdGVycyA9IHt9KTogSGFybmVzc1ByZWRpY2F0ZTxNYXRIZWFkZXJDZWxsSGFybmVzcz4ge1xuICAgIHJldHVybiBNYXRIZWFkZXJDZWxsSGFybmVzcy5fZ2V0Q2VsbFByZWRpY2F0ZShNYXRIZWFkZXJDZWxsSGFybmVzcywgb3B0aW9ucyk7XG4gIH1cbn1cblxuLyoqIEhhcm5lc3MgZm9yIGludGVyYWN0aW5nIHdpdGggYSBzdGFuZGFyZCBBbmd1bGFyIE1hdGVyaWFsIHRhYmxlIGZvb3RlciBjZWxsLiAqL1xuZXhwb3J0IGNsYXNzIE1hdEZvb3RlckNlbGxIYXJuZXNzIGV4dGVuZHMgTWF0Q2VsbEhhcm5lc3Mge1xuICAvKiogVGhlIHNlbGVjdG9yIGZvciB0aGUgaG9zdCBlbGVtZW50IG9mIGEgYE1hdEZvb3RlckNlbGxIYXJuZXNzYCBpbnN0YW5jZS4gKi9cbiAgc3RhdGljIGhvc3RTZWxlY3RvciA9ICcubWF0LWZvb3Rlci1jZWxsJztcblxuICAvKipcbiAgICogR2V0cyBhIGBIYXJuZXNzUHJlZGljYXRlYCB0aGF0IGNhbiBiZSB1c2VkIHRvIHNlYXJjaCBmb3JcbiAgICogYSB0YWJsZSBmb290ZXIgY2VsbCB3aXRoIHNwZWNpZmljIGF0dHJpYnV0ZXMuXG4gICAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgZm9yIG5hcnJvd2luZyB0aGUgc2VhcmNoXG4gICAqIEByZXR1cm4gYSBgSGFybmVzc1ByZWRpY2F0ZWAgY29uZmlndXJlZCB3aXRoIHRoZSBnaXZlbiBvcHRpb25zLlxuICAgKi9cbiAgc3RhdGljIHdpdGgob3B0aW9uczogQ2VsbEhhcm5lc3NGaWx0ZXJzID0ge30pOiBIYXJuZXNzUHJlZGljYXRlPE1hdEZvb3RlckNlbGxIYXJuZXNzPiB7XG4gICAgcmV0dXJuIE1hdEZvb3RlckNlbGxIYXJuZXNzLl9nZXRDZWxsUHJlZGljYXRlKE1hdEZvb3RlckNlbGxIYXJuZXNzLCBvcHRpb25zKTtcbiAgfVxufVxuIl19