/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * The strategy that the default change detector uses to detect changes.
 * When set, takes effect the next time change detection is triggered.
 *
 * @see [Change detection usage](/api/core/ChangeDetectorRef?tab=usage-notes)
 * @see [Skipping component subtrees](/best-practices/skipping-subtrees)
 *
 * @publicApi
 */
export var ChangeDetectionStrategy;
(function (ChangeDetectionStrategy) {
    /**
     * Use the `CheckOnce` strategy, meaning that automatic change detection is deactivated
     * until reactivated by setting the strategy to `Default` (`CheckAlways`).
     * Change detection can still be explicitly invoked.
     * This strategy applies to all child directives and cannot be overridden.
     */
    ChangeDetectionStrategy[ChangeDetectionStrategy["OnPush"] = 0] = "OnPush";
    /**
     * Use the default `CheckAlways` strategy, in which change detection is automatic until
     * explicitly deactivated.
     */
    ChangeDetectionStrategy[ChangeDetectionStrategy["Default"] = 1] = "Default";
})(ChangeDetectionStrategy || (ChangeDetectionStrategy = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvY2hhbmdlX2RldGVjdGlvbi9jb25zdGFudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUg7Ozs7Ozs7O0dBUUc7QUFDSCxNQUFNLENBQU4sSUFBWSx1QkFjWDtBQWRELFdBQVksdUJBQXVCO0lBQ2pDOzs7OztPQUtHO0lBQ0gseUVBQVUsQ0FBQTtJQUVWOzs7T0FHRztJQUNILDJFQUFXLENBQUE7QUFDYixDQUFDLEVBZFcsdUJBQXVCLEtBQXZCLHVCQUF1QixRQWNsQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuLyoqXG4gKiBUaGUgc3RyYXRlZ3kgdGhhdCB0aGUgZGVmYXVsdCBjaGFuZ2UgZGV0ZWN0b3IgdXNlcyB0byBkZXRlY3QgY2hhbmdlcy5cbiAqIFdoZW4gc2V0LCB0YWtlcyBlZmZlY3QgdGhlIG5leHQgdGltZSBjaGFuZ2UgZGV0ZWN0aW9uIGlzIHRyaWdnZXJlZC5cbiAqXG4gKiBAc2VlIFtDaGFuZ2UgZGV0ZWN0aW9uIHVzYWdlXSgvYXBpL2NvcmUvQ2hhbmdlRGV0ZWN0b3JSZWY/dGFiPXVzYWdlLW5vdGVzKVxuICogQHNlZSBbU2tpcHBpbmcgY29tcG9uZW50IHN1YnRyZWVzXSgvYmVzdC1wcmFjdGljZXMvc2tpcHBpbmctc3VidHJlZXMpXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZW51bSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSB7XG4gIC8qKlxuICAgKiBVc2UgdGhlIGBDaGVja09uY2VgIHN0cmF0ZWd5LCBtZWFuaW5nIHRoYXQgYXV0b21hdGljIGNoYW5nZSBkZXRlY3Rpb24gaXMgZGVhY3RpdmF0ZWRcbiAgICogdW50aWwgcmVhY3RpdmF0ZWQgYnkgc2V0dGluZyB0aGUgc3RyYXRlZ3kgdG8gYERlZmF1bHRgIChgQ2hlY2tBbHdheXNgKS5cbiAgICogQ2hhbmdlIGRldGVjdGlvbiBjYW4gc3RpbGwgYmUgZXhwbGljaXRseSBpbnZva2VkLlxuICAgKiBUaGlzIHN0cmF0ZWd5IGFwcGxpZXMgdG8gYWxsIGNoaWxkIGRpcmVjdGl2ZXMgYW5kIGNhbm5vdCBiZSBvdmVycmlkZGVuLlxuICAgKi9cbiAgT25QdXNoID0gMCxcblxuICAvKipcbiAgICogVXNlIHRoZSBkZWZhdWx0IGBDaGVja0Fsd2F5c2Agc3RyYXRlZ3ksIGluIHdoaWNoIGNoYW5nZSBkZXRlY3Rpb24gaXMgYXV0b21hdGljIHVudGlsXG4gICAqIGV4cGxpY2l0bHkgZGVhY3RpdmF0ZWQuXG4gICAqL1xuICBEZWZhdWx0ID0gMSxcbn1cbiJdfQ==