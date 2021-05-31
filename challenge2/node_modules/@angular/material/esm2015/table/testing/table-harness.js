/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { ContentContainerComponentHarness, HarnessPredicate, parallel, } from '@angular/cdk/testing';
import { MatRowHarness, MatHeaderRowHarness, MatFooterRowHarness, } from './row-harness';
export class _MatTableHarnessBase extends ContentContainerComponentHarness {
    /** Gets all of the header rows in a table. */
    getHeaderRows(filter = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.locatorForAll(this._headerRowHarness.with(filter))();
        });
    }
    /** Gets all of the regular data rows in a table. */
    getRows(filter = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.locatorForAll(this._rowHarness.with(filter))();
        });
    }
    /** Gets all of the footer rows in a table. */
    getFooterRows(filter = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.locatorForAll(this._footerRowHarness.with(filter))();
        });
    }
    /** Gets the text inside the entire table organized by rows. */
    getCellTextByIndex() {
        return __awaiter(this, void 0, void 0, function* () {
            const rows = yield this.getRows();
            return parallel(() => rows.map(row => row.getCellTextByIndex()));
        });
    }
    /** Gets the text inside the entire table organized by columns. */
    getCellTextByColumnName() {
        return __awaiter(this, void 0, void 0, function* () {
            const [headerRows, footerRows, dataRows] = yield parallel(() => [
                this.getHeaderRows(),
                this.getFooterRows(),
                this.getRows()
            ]);
            const text = {};
            const [headerData, footerData, rowsData] = yield parallel(() => [
                parallel(() => headerRows.map(row => row.getCellTextByColumnName())),
                parallel(() => footerRows.map(row => row.getCellTextByColumnName())),
                parallel(() => dataRows.map(row => row.getCellTextByColumnName())),
            ]);
            rowsData.forEach(data => {
                Object.keys(data).forEach(columnName => {
                    const cellText = data[columnName];
                    if (!text[columnName]) {
                        text[columnName] = {
                            headerText: getCellTextsByColumn(headerData, columnName),
                            footerText: getCellTextsByColumn(footerData, columnName),
                            text: []
                        };
                    }
                    text[columnName].text.push(cellText);
                });
            });
            return text;
        });
    }
}
/** Harness for interacting with a standard mat-table in tests. */
export class MatTableHarness extends _MatTableHarnessBase {
    constructor() {
        super(...arguments);
        this._headerRowHarness = MatHeaderRowHarness;
        this._rowHarness = MatRowHarness;
        this._footerRowHarness = MatFooterRowHarness;
    }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a table with specific attributes.
     * @param options Options for narrowing the search
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatTableHarness, options);
    }
}
/** The selector for the host element of a `MatTableHarness` instance. */
MatTableHarness.hostSelector = '.mat-table';
/** Extracts the text of cells only under a particular column. */
function getCellTextsByColumn(rowsData, column) {
    const columnTexts = [];
    rowsData.forEach(data => {
        Object.keys(data).forEach(columnName => {
            if (columnName === column) {
                columnTexts.push(data[columnName]);
            }
        });
    });
    return columnTexts;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtaGFybmVzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC90YWJsZS90ZXN0aW5nL3RhYmxlLWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFHTCxnQ0FBZ0MsRUFDaEMsZ0JBQWdCLEVBQ2hCLFFBQVEsR0FDVCxNQUFNLHNCQUFzQixDQUFDO0FBRTlCLE9BQU8sRUFDTCxhQUFhLEVBQ2IsbUJBQW1CLEVBQ25CLG1CQUFtQixHQUVwQixNQUFNLGVBQWUsQ0FBQztBQWdCdkIsTUFBTSxPQUFnQixvQkFVcEIsU0FBUSxnQ0FBd0M7SUFLaEQsOENBQThDO0lBQ3hDLGFBQWEsQ0FBQyxTQUE0QixFQUFFOztZQUNoRCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDbkUsQ0FBQztLQUFBO0lBRUQsb0RBQW9EO0lBQzlDLE9BQU8sQ0FBQyxTQUE0QixFQUFFOztZQUMxQyxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQzdELENBQUM7S0FBQTtJQUVELDhDQUE4QztJQUN4QyxhQUFhLENBQUMsU0FBNEIsRUFBRTs7WUFDaEQsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ25FLENBQUM7S0FBQTtJQUVELCtEQUErRDtJQUN6RCxrQkFBa0I7O1lBQ3RCLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2xDLE9BQU8sUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxH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QVUsQ0FBQyxDQUFDLENBQUM7YUFDcEM7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0lBRUgsT0FBTyxXQUFXLENBQUM7QUFDckIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBDb21wb25lbnRIYXJuZXNzLFxuICBDb21wb25lbnRIYXJuZXNzQ29uc3RydWN0b3IsXG4gIENvbnRlbnRDb250YWluZXJDb21wb25lbnRIYXJuZXNzLFxuICBIYXJuZXNzUHJlZGljYXRlLFxuICBwYXJhbGxlbCxcbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Rlc3RpbmcnO1xuaW1wb3J0IHtUYWJsZUhhcm5lc3NGaWx0ZXJzLCBSb3dIYXJuZXNzRmlsdGVyc30gZnJvbSAnLi90YWJsZS1oYXJuZXNzLWZpbHRlcnMnO1xuaW1wb3J0IHtcbiAgTWF0Um93SGFybmVzcyxcbiAgTWF0SGVhZGVyUm93SGFybmVzcyxcbiAgTWF0Rm9vdGVyUm93SGFybmVzcyxcbiAgTWF0Um93SGFybmVzc0NvbHVtbnNUZXh0LFxufSBmcm9tICcuL3Jvdy1oYXJuZXNzJztcblxuLyoqIFRleHQgZXh0cmFjdGVkIGZyb20gYSB0YWJsZSBvcmdhbml6ZWQgYnkgY29sdW1ucy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTWF0VGFibGVIYXJuZXNzQ29sdW1uc1RleHQge1xuICBbY29sdW1uTmFtZTogc3RyaW5nXToge1xuICAgIHRleHQ6IHN0cmluZ1tdO1xuICAgIGhlYWRlclRleHQ6IHN0cmluZ1tdO1xuICAgIGZvb3RlclRleHQ6IHN0cmluZ1tdO1xuICB9O1xufVxuXG5pbnRlcmZhY2UgUm93QmFzZSBleHRlbmRzIENvbXBvbmVudEhhcm5lc3Mge1xuICBnZXRDZWxsVGV4dEJ5Q29sdW1uTmFtZSgpOiBQcm9taXNlPE1hdFJvd0hhcm5lc3NDb2x1bW5zVGV4dD47XG4gIGdldENlbGxUZXh0QnlJbmRleCgpOiBQcm9taXNlPHN0cmluZ1tdPjtcbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIF9NYXRUYWJsZUhhcm5lc3NCYXNlPFxuICBIZWFkZXJSb3dUeXBlIGV4dGVuZHMgKENvbXBvbmVudEhhcm5lc3NDb25zdHJ1Y3RvcjxIZWFkZXJSb3c+ICYge1xuICAgIHdpdGg6IChvcHRpb25zPzogUm93SGFybmVzc0ZpbHRlcnMpID0+IEhhcm5lc3NQcmVkaWNhdGU8SGVhZGVyUm93Pn0pLFxuICBIZWFkZXJSb3cgZXh0ZW5kcyBSb3dCYXNlLFxuICBSb3dUeXBlIGV4dGVuZHMgKENvbXBvbmVudEhhcm5lc3NDb25zdHJ1Y3RvcjxSb3c+ICYge1xuICAgIHdpdGg6IChvcHRpb25zPzogUm93SGFybmVzc0ZpbHRlcnMpID0+IEhhcm5lc3NQcmVkaWNhdGU8Um93Pn0pLFxuICBSb3cgZXh0ZW5kcyBSb3dCYXNlLFxuICBGb290ZXJSb3dUeXBlIGV4dGVuZHMgKENvbXBvbmVudEhhcm5lc3NDb25zdHJ1Y3RvcjxGb290ZXJSb3c+ICYge1xuICAgIHdpdGg6IChvcHRpb25zPzogUm93SGFybmVzc0ZpbHRlcnMpID0+IEhhcm5lc3NQcmVkaWNhdGU8Rm9vdGVyUm93Pn0pLFxuICBGb290ZXJSb3cgZXh0ZW5kcyBSb3dCYXNlXG4+IGV4dGVuZHMgQ29udGVudENvbnRhaW5lckNvbXBvbmVudEhhcm5lc3M8c3RyaW5nPiB7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBfaGVhZGVyUm93SGFybmVzczogSGVhZGVyUm93VHlwZTtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IF9yb3dIYXJuZXNzOiBSb3dUeXBlO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgX2Zvb3RlclJvd0hhcm5lc3M6IEZvb3RlclJvd1R5cGU7XG5cbiAgLyoqIEdldHMgYWxsIG9mIHRoZSBoZWFkZXIgcm93cyBpbiBhIHRhYmxlLiAqL1xuICBhc3luYyBnZXRIZWFkZXJSb3dzKGZpbHRlcjogUm93SGFybmVzc0ZpbHRlcnMgPSB7fSk6IFByb21pc2U8SGVhZGVyUm93W10+IHtcbiAgICByZXR1cm4gdGhpcy5sb2NhdG9yRm9yQWxsKHRoaXMuX2hlYWRlclJvd0hhcm5lc3Mud2l0aChmaWx0ZXIpKSgpO1xuICB9XG5cbiAgLyoqIEdldHMgYWxsIG9mIHRoZSByZWd1bGFyIGRhdGEgcm93cyBpbiBhIHRhYmxlLiAqL1xuICBhc3luYyBnZXRSb3dzKGZpbHRlcjogUm93SGFybmVzc0ZpbHRlcnMgPSB7fSk6IFByb21pc2U8Um93W10+IHtcbiAgICByZXR1cm4gdGhpcy5sb2NhdG9yRm9yQWxsKHRoaXMuX3Jvd0hhcm5lc3Mud2l0aChmaWx0ZXIpKSgpO1xuICB9XG5cbiAgLyoqIEdldHMgYWxsIG9mIHRoZSBmb290ZXIgcm93cyBpbiBhIHRhYmxlLiAqL1xuICBhc3luYyBnZXRGb290ZXJSb3dzKGZpbHRlcjogUm93SGFybmVzc0ZpbHRlcnMgPSB7fSk6IFByb21pc2U8Rm9vdGVyUm93W10+IHtcbiAgICByZXR1cm4gdGhpcy5sb2NhdG9yRm9yQWxsKHRoaXMuX2Zvb3RlclJvd0hhcm5lc3Mud2l0aChmaWx0ZXIpKSgpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIHRleHQgaW5zaWRlIHRoZSBlbnRpcmUgdGFibGUgb3JnYW5pemVkIGJ5IHJvd3MuICovXG4gIGFzeW5jIGdldENlbGxUZXh0QnlJbmRleCgpOiBQcm9taXNlPHN0cmluZ1tdW10+IHtcbiAgICBjb25zdCByb3dzID0gYXdhaXQgdGhpcy5nZXRSb3dzKCk7XG4gICAgcmV0dXJuIHBhcmFsbGVsKCgpID0+IHJvd3MubWFwKHJvdyA9PiByb3cuZ2V0Q2VsbFRleHRCeUluZGV4KCkpKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSB0ZXh0IGluc2lkZSB0aGUgZW50aXJlIHRhYmxlIG9yZ2FuaXplZCBieSBjb2x1bW5zLiAqL1xuICBhc3luYyBnZXRDZWxsVGV4dEJ5Q29sdW1uTmFtZSgpOiBQcm9taXNlPE1hdFRhYmxlSGFybmVzc0NvbHVtbnNUZXh0PiB7XG4gICAgY29uc3QgW2hlYWRlclJvd3MsIGZvb3RlclJvd3MsIGRhdGFSb3dzXSA9IGF3YWl0IHBhcmFsbGVsKCgpID0+IFtcbiAgICAgIHRoaXMuZ2V0SGVhZGVyUm93cygpLFxuICAgICAgdGhpcy5nZXRGb290ZXJSb3dzKCksXG4gICAgICB0aGlzLmdldFJvd3MoKVxuICAgIF0pO1xuXG4gICAgY29uc3QgdGV4dDogTWF0VGFibGVIYXJuZXNzQ29sdW1uc1RleHQgPSB7fTtcbiAgICBjb25zdCBbaGVhZGVyRGF0YSwgZm9vdGVyRGF0YSwgcm93c0RhdGFdID0gYXdhaXQgcGFyYWxsZWwoKCkgPT4gW1xuICAgICAgcGFyYWxsZWwoKCkgPT4gaGVhZGVyUm93cy5tYXAocm93ID0+IHJvdy5nZXRDZWxsVGV4dEJ5Q29sdW1uTmFtZSgpKSksXG4gICAgICBwYXJhbGxlbCgoKSA9PiBmb290ZXJSb3dzLm1hcChyb3cgPT4gcm93LmdldENlbGxUZXh0QnlDb2x1bW5OYW1lKCkpKSxcbiAgICAgIHBhcmFsbGVsKCgpID0+IGRhdGFSb3dzLm1hcChyb3cgPT4gcm93LmdldENlbGxUZXh0QnlDb2x1bW5OYW1lKCkpKSxcbiAgICBdKTtcblxuICAgIHJvd3NEYXRhLmZvckVhY2goZGF0YSA9PiB7XG4gICAgICBPYmplY3Qua2V5cyhkYXRhKS5mb3JFYWNoKGNvbHVtbk5hbWUgPT4ge1xuICAgICAgICBjb25zdCBjZWxsVGV4dCA9IGRhdGFbY29sdW1uTmFtZV07XG5cbiAgICAgICAgaWYgKCF0ZXh0W2NvbHVtbk5hbWVdKSB7XG4gICAgICAgICAgdGV4dFtjb2x1bW5OYW1lXSA9IHtcbiAgICAgICAgICAgIGhlYWRlclRleHQ6IGdldENlbGxUZXh0c0J5Q29sdW1uKGhlYWRlckRhdGEsIGNvbHVtbk5hbWUpLFxuICAgICAgICAgICAgZm9vdGVyVGV4dDogZ2V0Q2VsbFRleHRzQnlDb2x1bW4oZm9vdGVyRGF0YSwgY29sdW1uTmFtZSksXG4gICAgICAgICAgICB0ZXh0OiBbXVxuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICB0ZXh0W2NvbHVtbk5hbWVdLnRleHQucHVzaChjZWxsVGV4dCk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0ZXh0O1xuICB9XG59XG5cbi8qKiBIYXJuZXNzIGZvciBpbnRlcmFjdGluZyB3aXRoIGEgc3RhbmRhcmQgbWF0LXRhYmxlIGluIHRlc3RzLiAqL1xuZXhwb3J0IGNsYXNzIE1hdFRhYmxlSGFybmVzcyBleHRlbmRzIF9NYXRUYWJsZUhhcm5lc3NCYXNlPFxuICB0eXBlb2YgTWF0SGVhZGVyUm93SGFybmVzcywgTWF0SGVhZGVyUm93SGFybmVzcyxcbiAgdHlwZW9mIE1hdFJvd0hhcm5lc3MsIE1hdFJvd0hhcm5lc3MsXG4gIHR5cGVvZiBNYXRGb290ZXJSb3dIYXJuZXNzLCBNYXRGb290ZXJSb3dIYXJuZXNzXG4+IHtcbiAgLyoqIFRoZSBzZWxlY3RvciBmb3IgdGhlIGhvc3QgZWxlbWVudCBvZiBhIGBNYXRUYWJsZUhhcm5lc3NgIGluc3RhbmNlLiAqL1xuICBzdGF0aWMgaG9zdFNlbGVjdG9yID0gJy5tYXQtdGFibGUnO1xuICBwcm90ZWN0ZWQgX2hlYWRlclJvd0hhcm5lc3MgPSBNYXRIZWFkZXJSb3dIYXJuZXNzO1xuICBwcm90ZWN0ZWQgX3Jvd0hhcm5lc3MgPSBNYXRSb3dIYXJuZXNzO1xuICBwcm90ZWN0ZWQgX2Zvb3RlclJvd0hhcm5lc3MgPSBNYXRGb290ZXJSb3dIYXJuZXNzO1xuXG4gIC8qKlxuICAgKiBHZXRzIGEgYEhhcm5lc3NQcmVkaWNhdGVgIHRoYXQgY2FuIGJlIHVzZWQgdG8gc2VhcmNoIGZvciBhIHRhYmxlIHdpdGggc3BlY2lmaWMgYXR0cmlidXRlcy5cbiAgICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyBmb3IgbmFycm93aW5nIHRoZSBzZWFyY2hcbiAgICogQHJldHVybiBhIGBIYXJuZXNzUHJlZGljYXRlYCBjb25maWd1cmVkIHdpdGggdGhlIGdpdmVuIG9wdGlvbnMuXG4gICAqL1xuICBzdGF0aWMgd2l0aChvcHRpb25zOiBUYWJsZUhhcm5lc3NGaWx0ZXJzID0ge30pOiBIYXJuZXNzUHJlZGljYXRlPE1hdFRhYmxlSGFybmVzcz4ge1xuICAgIHJldHVybiBuZXcgSGFybmVzc1ByZWRpY2F0ZShNYXRUYWJsZUhhcm5lc3MsIG9wdGlvbnMpO1xuICB9XG59XG5cbi8qKiBFeHRyYWN0cyB0aGUgdGV4dCBvZiBjZWxscyBvbmx5IHVuZGVyIGEgcGFydGljdWxhciBjb2x1bW4uICovXG5mdW5jdGlvbiBnZXRDZWxsVGV4dHNCeUNvbHVtbihyb3dzRGF0YTogTWF0Um93SGFybmVzc0NvbHVtbnNUZXh0W10sIGNvbHVtbjogc3RyaW5nKTogc3RyaW5nW10ge1xuICBjb25zdCBjb2x1bW5UZXh0czogc3RyaW5nW10gPSBbXTtcblxuICByb3dzRGF0YS5mb3JFYWNoKGRhdGEgPT4ge1xuICAgIE9iamVjdC5rZXlzKGRhdGEpLmZvckVhY2goY29sdW1uTmFtZSA9PiB7XG4gICAgICBpZiAoY29sdW1uTmFtZSA9PT0gY29sdW1uKSB7XG4gICAgICAgIGNvbHVtblRleHRzLnB1c2goZGF0YVtjb2x1bW5OYW1lXSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xuXG4gIHJldHVybiBjb2x1bW5UZXh0cztcbn1cbiJdfQ==