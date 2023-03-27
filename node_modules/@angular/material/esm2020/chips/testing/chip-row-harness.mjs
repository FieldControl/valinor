/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { TestKey } from '@angular/cdk/testing';
import { MatChipEditInputHarness } from './chip-edit-input-harness';
import { MatChipHarness } from './chip-harness';
/** Harness for interacting with a mat-chip-row in tests. */
export class MatChipRowHarness extends MatChipHarness {
    /** Whether the chip is editable. */
    async isEditable() {
        return (await this.host()).hasClass('mat-mdc-chip-editable');
    }
    /** Whether the chip is currently being edited. */
    async isEditing() {
        return (await this.host()).hasClass('mat-mdc-chip-editing');
    }
    /** Sets the chip row into an editing state, if it is editable. */
    async startEditing() {
        if (!(await this.isEditable())) {
            throw new Error('Cannot begin editing a chip that is not editable.');
        }
        return (await this.host()).dispatchEvent('dblclick');
    }
    /** Stops editing the chip, if it was in the editing state. */
    async finishEditing() {
        if (await this.isEditing()) {
            await (await this.host()).sendKeys(TestKey.ENTER);
        }
    }
    /** Gets the edit input inside the chip row. */
    async getEditInput(filter = {}) {
        return this.locatorFor(MatChipEditInputHarness.with(filter))();
    }
}
MatChipRowHarness.hostSelector = '.mat-mdc-chip-row';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hpcC1yb3ctaGFybmVzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9jaGlwcy90ZXN0aW5nL2NoaXAtcm93LWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQzdDLE9BQU8sRUFBQyx1QkFBdUIsRUFBQyxNQUFNLDJCQUEyQixDQUFDO0FBQ2xFLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUc5Qyw0REFBNEQ7QUFDNUQsTUFBTSxPQUFPLGlCQUFrQixTQUFRLGNBQWM7SUFHbkQsb0NBQW9DO0lBQ3BDLEtBQUssQ0FBQyxVQUFVO1FBQ2QsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLHVCQUF1QixDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUVELGtEQUFrRDtJQUNsRCxLQUFLLENBQUMsU0FBUztRQUNiLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0lBQzlELENBQUM7SUFFRCxrRUFBa0U7SUFDbEUsS0FBSyxDQUFDLFlBQVk7UUFDaEIsSUFBSSxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsRUFBRTtZQUM5QixNQUFNLElBQUksS0FBSyxDQUFDLG1EQUFtRCxDQUFDLENBQUM7U0FDdEU7UUFDRCxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDdkQsQ0FBQztJQUVELDhEQUE4RDtJQUM5RCxLQUFLLENBQUMsYUFBYTtRQUNqQixJQUFJLE1BQU0sSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFFO1lBQzFCLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDbkQ7SUFDSCxDQUFDO0lBRUQsK0NBQStDO0lBQy9DLEtBQUssQ0FBQyxZQUFZLENBQUMsU0FBc0MsRUFBRTtRQUN6RCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUNqRSxDQUFDOztBQTlCZSw4QkFBWSxHQUFHLG1CQUFtQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7VGVzdEtleX0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Rlc3RpbmcnO1xuaW1wb3J0IHtNYXRDaGlwRWRpdElucHV0SGFybmVzc30gZnJvbSAnLi9jaGlwLWVkaXQtaW5wdXQtaGFybmVzcyc7XG5pbXBvcnQge01hdENoaXBIYXJuZXNzfSBmcm9tICcuL2NoaXAtaGFybmVzcyc7XG5pbXBvcnQge0NoaXBFZGl0SW5wdXRIYXJuZXNzRmlsdGVyc30gZnJvbSAnLi9jaGlwLWhhcm5lc3MtZmlsdGVycyc7XG5cbi8qKiBIYXJuZXNzIGZvciBpbnRlcmFjdGluZyB3aXRoIGEgbWF0LWNoaXAtcm93IGluIHRlc3RzLiAqL1xuZXhwb3J0IGNsYXNzIE1hdENoaXBSb3dIYXJuZXNzIGV4dGVuZHMgTWF0Q2hpcEhhcm5lc3Mge1xuICBzdGF0aWMgb3ZlcnJpZGUgaG9zdFNlbGVjdG9yID0gJy5tYXQtbWRjLWNoaXAtcm93JztcblxuICAvKiogV2hldGhlciB0aGUgY2hpcCBpcyBlZGl0YWJsZS4gKi9cbiAgYXN5bmMgaXNFZGl0YWJsZSgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS5oYXNDbGFzcygnbWF0LW1kYy1jaGlwLWVkaXRhYmxlJyk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgY2hpcCBpcyBjdXJyZW50bHkgYmVpbmcgZWRpdGVkLiAqL1xuICBhc3luYyBpc0VkaXRpbmcoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkuaGFzQ2xhc3MoJ21hdC1tZGMtY2hpcC1lZGl0aW5nJyk7XG4gIH1cblxuICAvKiogU2V0cyB0aGUgY2hpcCByb3cgaW50byBhbiBlZGl0aW5nIHN0YXRlLCBpZiBpdCBpcyBlZGl0YWJsZS4gKi9cbiAgYXN5bmMgc3RhcnRFZGl0aW5nKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghKGF3YWl0IHRoaXMuaXNFZGl0YWJsZSgpKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgYmVnaW4gZWRpdGluZyBhIGNoaXAgdGhhdCBpcyBub3QgZWRpdGFibGUuJyk7XG4gICAgfVxuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLmRpc3BhdGNoRXZlbnQoJ2RibGNsaWNrJyk7XG4gIH1cblxuICAvKiogU3RvcHMgZWRpdGluZyB0aGUgY2hpcCwgaWYgaXQgd2FzIGluIHRoZSBlZGl0aW5nIHN0YXRlLiAqL1xuICBhc3luYyBmaW5pc2hFZGl0aW5nKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmIChhd2FpdCB0aGlzLmlzRWRpdGluZygpKSB7XG4gICAgICBhd2FpdCAoYXdhaXQgdGhpcy5ob3N0KCkpLnNlbmRLZXlzKFRlc3RLZXkuRU5URVIpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBlZGl0IGlucHV0IGluc2lkZSB0aGUgY2hpcCByb3cuICovXG4gIGFzeW5jIGdldEVkaXRJbnB1dChmaWx0ZXI6IENoaXBFZGl0SW5wdXRIYXJuZXNzRmlsdGVycyA9IHt9KTogUHJvbWlzZTxNYXRDaGlwRWRpdElucHV0SGFybmVzcz4ge1xuICAgIHJldHVybiB0aGlzLmxvY2F0b3JGb3IoTWF0Q2hpcEVkaXRJbnB1dEhhcm5lc3Mud2l0aChmaWx0ZXIpKSgpO1xuICB9XG59XG4iXX0=