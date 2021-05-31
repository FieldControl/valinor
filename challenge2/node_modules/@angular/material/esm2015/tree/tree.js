/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CdkTree } from '@angular/cdk/tree';
import { ChangeDetectionStrategy, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatTreeNodeOutlet } from './outlet';
/**
 * Wrapper for the CdkTable with Material design styles.
 */
export class MatTree extends CdkTree {
}
MatTree.decorators = [
    { type: Component, args: [{
                selector: 'mat-tree',
                exportAs: 'matTree',
                template: `<ng-container matTreeNodeOutlet></ng-container>`,
                host: {
                    // The 'cdk-tree' class needs to be included here because classes set in the host in the
                    // parent class are not inherited with View Engine. The 'cdk-tree' class in CdkTreeNode has
                    // to be set in the host because:
                    // if it is set as a @HostBinding it is not set by the time the tree nodes try to read the
                    // class from it.
                    // the ElementRef is not available in the constructor so the class can't be applied directly
                    // without a breaking constructor change.
                    'class': 'mat-tree cdk-tree',
                    'role': 'tree',
                },
                encapsulation: ViewEncapsulation.None,
                // See note on CdkTree for explanation on why this uses the default change detection strategy.
                // tslint:disable-next-line:validate-decorators
                changeDetection: ChangeDetectionStrategy.Default,
                providers: [{ provide: CdkTree, useExisting: MatTree }],
                styles: [".mat-tree{display:block}.mat-tree-node{display:flex;align-items:center;flex:1;word-wrap:break-word}.mat-nested-tree-node{border-bottom-width:0}\n"]
            },] }
];
MatTree.propDecorators = {
    _nodeOutlet: [{ type: ViewChild, args: [MatTreeNodeOutlet, { static: true },] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC90cmVlL3RyZWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQzFDLE9BQU8sRUFDTCx1QkFBdUIsRUFDdkIsU0FBUyxFQUNULFNBQVMsRUFDVCxpQkFBaUIsRUFDbEIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sVUFBVSxDQUFDO0FBRTNDOztHQUVHO0FBdUJILE1BQU0sT0FBTyxPQUFrQixTQUFRLE9BQWE7OztZQXRCbkQsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxVQUFVO2dCQUNwQixRQUFRLEVBQUUsU0FBUztnQkFDbkIsUUFBUSxFQUFFLGlEQUFpRDtnQkFDM0QsSUFBSSxFQUFFO29CQUNKLHdGQUF3RjtvQkFDeEYsMkZBQTJGO29CQUMzRixpQ0FBaUM7b0JBQ2pDLDBGQUEwRjtvQkFDMUYsaUJBQWlCO29CQUNqQiw0RkFBNEY7b0JBQzVGLHlDQUF5QztvQkFDekMsT0FBTyxFQUFFLG1CQUFtQjtvQkFDNUIsTUFBTSxFQUFFLE1BQU07aUJBQ2Y7Z0JBRUQsYUFBYSxFQUFFLGlCQUFpQixDQUFDLElBQUk7Z0JBQ3JDLDhGQUE4RjtnQkFDOUYsK0NBQStDO2dCQUMvQyxlQUFlLEVBQUUsdUJBQXVCLENBQUMsT0FBTztnQkFDaEQsU0FBUyxFQUFFLENBQUMsRUFBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUMsQ0FBQzs7YUFDdEQ7OzswQkFHRSxTQUFTLFNBQUMsaUJBQWlCLEVBQUUsRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q2RrVHJlZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL3RyZWUnO1xuaW1wb3J0IHtcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENvbXBvbmVudCxcbiAgVmlld0NoaWxkLFxuICBWaWV3RW5jYXBzdWxhdGlvblxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7TWF0VHJlZU5vZGVPdXRsZXR9IGZyb20gJy4vb3V0bGV0JztcblxuLyoqXG4gKiBXcmFwcGVyIGZvciB0aGUgQ2RrVGFibGUgd2l0aCBNYXRlcmlhbCBkZXNpZ24gc3R5bGVzLlxuICovXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdtYXQtdHJlZScsXG4gIGV4cG9ydEFzOiAnbWF0VHJlZScsXG4gIHRlbXBsYXRlOiBgPG5nLWNvbnRhaW5lciBtYXRUcmVlTm9kZU91dGxldD48L25nLWNvbnRhaW5lcj5gLFxuICBob3N0OiB7XG4gICAgLy8gVGhlICdjZGstdHJlZScgY2xhc3MgbmVlZHMgdG8gYmUgaW5jbHVkZWQgaGVyZSBiZWNhdXNlIGNsYXNzZXMgc2V0IGluIHRoZSBob3N0IGluIHRoZVxuICAgIC8vIHBhcmVudCBjbGFzcyBhcmUgbm90IGluaGVyaXRlZCB3aXRoIFZpZXcgRW5naW5lLiBUaGUgJ2Nkay10cmVlJyBjbGFzcyBpbiBDZGtUcmVlTm9kZSBoYXNcbiAgICAvLyB0byBiZSBzZXQgaW4gdGhlIGhvc3QgYmVjYXVzZTpcbiAgICAvLyBpZiBpdCBpcyBzZXQgYXMgYSBASG9zdEJpbmRpbmcgaXQgaXMgbm90IHNldCBieSB0aGUgdGltZSB0aGUgdHJlZSBub2RlcyB0cnkgdG8gcmVhZCB0aGVcbiAgICAvLyBjbGFzcyBmcm9tIGl0LlxuICAgIC8vIHRoZSBFbGVtZW50UmVmIGlzIG5vdCBhdmFpbGFibGUgaW4gdGhlIGNvbnN0cnVjdG9yIHNvIHRoZSBjbGFzcyBjYW4ndCBiZSBhcHBsaWVkIGRpcmVjdGx5XG4gICAgLy8gd2l0aG91dCBhIGJyZWFraW5nIGNvbnN0cnVjdG9yIGNoYW5nZS5cbiAgICAnY2xhc3MnOiAnbWF0LXRyZWUgY2RrLXRyZWUnLFxuICAgICdyb2xlJzogJ3RyZWUnLFxuICB9LFxuICBzdHlsZVVybHM6IFsndHJlZS5jc3MnXSxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgLy8gU2VlIG5vdGUgb24gQ2RrVHJlZSBmb3IgZXhwbGFuYXRpb24gb24gd2h5IHRoaXMgdXNlcyB0aGUgZGVmYXVsdCBjaGFuZ2UgZGV0ZWN0aW9uIHN0cmF0ZWd5LlxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6dmFsaWRhdGUtZGVjb3JhdG9yc1xuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkRlZmF1bHQsXG4gIHByb3ZpZGVyczogW3twcm92aWRlOiBDZGtUcmVlLCB1c2VFeGlzdGluZzogTWF0VHJlZX1dXG59KVxuZXhwb3J0IGNsYXNzIE1hdFRyZWU8VCwgSyA9IFQ+IGV4dGVuZHMgQ2RrVHJlZTxULCBLPiB7XG4gIC8vIE91dGxldHMgd2l0aGluIHRoZSB0cmVlJ3MgdGVtcGxhdGUgd2hlcmUgdGhlIGRhdGFOb2RlcyB3aWxsIGJlIGluc2VydGVkLlxuICBAVmlld0NoaWxkKE1hdFRyZWVOb2RlT3V0bGV0LCB7c3RhdGljOiB0cnVlfSkgX25vZGVPdXRsZXQ6IE1hdFRyZWVOb2RlT3V0bGV0O1xufVxuIl19