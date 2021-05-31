/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Configuration for opening a modal dialog with the MatDialog service.
 */
export class MatDialogConfig {
    constructor() {
        /** The ARIA role of the dialog element. */
        this.role = 'dialog';
        /** Custom class for the overlay pane. */
        this.panelClass = '';
        /** Whether the dialog has a backdrop. */
        this.hasBackdrop = true;
        /** Custom class for the backdrop. */
        this.backdropClass = '';
        /** Whether the user can use escape or clicking on the backdrop to close the modal. */
        this.disableClose = false;
        /** Width of the dialog. */
        this.width = '';
        /** Height of the dialog. */
        this.height = '';
        /** Max-width of the dialog. If a number is provided, assumes pixel units. Defaults to 80vw. */
        this.maxWidth = '80vw';
        /** Data being injected into the child component. */
        this.data = null;
        /** ID of the element that describes the dialog. */
        this.ariaDescribedBy = null;
        /** ID of the element that labels the dialog. */
        this.ariaLabelledBy = null;
        /** Aria label to assign to the dialog element. */
        this.ariaLabel = null;
        /** Whether the dialog should focus the first focusable element on open. */
        this.autoFocus = true;
        /**
         * Whether the dialog should restore focus to the
         * previously-focused element, after it's closed.
         */
        this.restoreFocus = true;
        /**
         * Whether the dialog should close when the user goes backwards/forwards in history.
         * Note that this usually doesn't include clicking on links (unless the user is using
         * the `HashLocationStrategy`).
         */
        this.closeOnNavigation = true;
        // TODO(jelbourn): add configuration for lifecycle hooks, ARIA labelling.
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLWNvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9kaWFsb2cvZGlhbG9nLWNvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUF3Qkg7O0dBRUc7QUFDSCxNQUFNLE9BQU8sZUFBZTtJQUE1QjtRQWFFLDJDQUEyQztRQUMzQyxTQUFJLEdBQWdCLFFBQVEsQ0FBQztRQUU3Qix5Q0FBeUM7UUFDekMsZUFBVSxHQUF1QixFQUFFLENBQUM7UUFFcEMseUNBQXlDO1FBQ3pDLGdCQUFXLEdBQWEsSUFBSSxDQUFDO1FBRTdCLHFDQUFxQztRQUNyQyxrQkFBYSxHQUF1QixFQUFFLENBQUM7UUFFdkMsc0ZBQXNGO1FBQ3RGLGlCQUFZLEdBQWEsS0FBSyxDQUFDO1FBRS9CLDJCQUEyQjtRQUMzQixVQUFLLEdBQVksRUFBRSxDQUFDO1FBRXBCLDRCQUE0QjtRQUM1QixXQUFNLEdBQVksRUFBRSxDQUFDO1FBUXJCLCtGQUErRjtRQUMvRixhQUFRLEdBQXFCLE1BQU0sQ0FBQztRQVFwQyxvREFBb0Q7UUFDcEQsU0FBSSxHQUFjLElBQUksQ0FBQztRQUt2QixtREFBbUQ7UUFDbkQsb0JBQWUsR0FBbUIsSUFBSSxDQUFDO1FBRXZDLGdEQUFnRDtRQUNoRCxtQkFBYyxHQUFtQixJQUFJLENBQUM7UUFFdEMsa0RBQWtEO1FBQ2xELGNBQVMsR0FBbUIsSUFBSSxDQUFDO1FBRWpDLDJFQUEyRTtRQUMzRSxjQUFTLEdBQWEsSUFBSSxDQUFDO1FBRTNCOzs7V0FHRztRQUNILGlCQUFZLEdBQWEsSUFBSSxDQUFDO1FBSzlCOzs7O1dBSUc7UUFDSCxzQkFBaUIsR0FBYSxJQUFJLENBQUM7UUFLbkMseUVBQXlFO0lBQzNFLENBQUM7Q0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1ZpZXdDb250YWluZXJSZWYsIENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0RpcmVjdGlvbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtTY3JvbGxTdHJhdGVneX0gZnJvbSAnQGFuZ3VsYXIvY2RrL292ZXJsYXknO1xuXG4vKiogVmFsaWQgQVJJQSByb2xlcyBmb3IgYSBkaWFsb2cgZWxlbWVudC4gKi9cbmV4cG9ydCB0eXBlIERpYWxvZ1JvbGUgPSAnZGlhbG9nJyB8ICdhbGVydGRpYWxvZyc7XG5cbi8qKiBQb3NzaWJsZSBvdmVycmlkZXMgZm9yIGEgZGlhbG9nJ3MgcG9zaXRpb24uICovXG5leHBvcnQgaW50ZXJmYWNlIERpYWxvZ1Bvc2l0aW9uIHtcbiAgLyoqIE92ZXJyaWRlIGZvciB0aGUgZGlhbG9nJ3MgdG9wIHBvc2l0aW9uLiAqL1xuICB0b3A/OiBzdHJpbmc7XG5cbiAgLyoqIE92ZXJyaWRlIGZvciB0aGUgZGlhbG9nJ3MgYm90dG9tIHBvc2l0aW9uLiAqL1xuICBib3R0b20/OiBzdHJpbmc7XG5cbiAgLyoqIE92ZXJyaWRlIGZvciB0aGUgZGlhbG9nJ3MgbGVmdCBwb3NpdGlvbi4gKi9cbiAgbGVmdD86IHN0cmluZztcblxuICAvKiogT3ZlcnJpZGUgZm9yIHRoZSBkaWFsb2cncyByaWdodCBwb3NpdGlvbi4gKi9cbiAgcmlnaHQ/OiBzdHJpbmc7XG59XG5cbi8qKlxuICogQ29uZmlndXJhdGlvbiBmb3Igb3BlbmluZyBhIG1vZGFsIGRpYWxvZyB3aXRoIHRoZSBNYXREaWFsb2cgc2VydmljZS5cbiAqL1xuZXhwb3J0IGNsYXNzIE1hdERpYWxvZ0NvbmZpZzxEID0gYW55PiB7XG5cbiAgLyoqXG4gICAqIFdoZXJlIHRoZSBhdHRhY2hlZCBjb21wb25lbnQgc2hvdWxkIGxpdmUgaW4gQW5ndWxhcidzICpsb2dpY2FsKiBjb21wb25lbnQgdHJlZS5cbiAgICogVGhpcyBhZmZlY3RzIHdoYXQgaXMgYXZhaWxhYmxlIGZvciBpbmplY3Rpb24gYW5kIHRoZSBjaGFuZ2UgZGV0ZWN0aW9uIG9yZGVyIGZvciB0aGVcbiAgICogY29tcG9uZW50IGluc3RhbnRpYXRlZCBpbnNpZGUgb2YgdGhlIGRpYWxvZy4gVGhpcyBkb2VzIG5vdCBhZmZlY3Qgd2hlcmUgdGhlIGRpYWxvZ1xuICAgKiBjb250ZW50IHdpbGwgYmUgcmVuZGVyZWQuXG4gICAqL1xuICB2aWV3Q29udGFpbmVyUmVmPzogVmlld0NvbnRhaW5lclJlZjtcblxuICAvKiogSUQgZm9yIHRoZSBkaWFsb2cuIElmIG9taXR0ZWQsIGEgdW5pcXVlIG9uZSB3aWxsIGJlIGdlbmVyYXRlZC4gKi9cbiAgaWQ/OiBzdHJpbmc7XG5cbiAgLyoqIFRoZSBBUklBIHJvbGUgb2YgdGhlIGRpYWxvZyBlbGVtZW50LiAqL1xuICByb2xlPzogRGlhbG9nUm9sZSA9ICdkaWFsb2cnO1xuXG4gIC8qKiBDdXN0b20gY2xhc3MgZm9yIHRoZSBvdmVybGF5IHBhbmUuICovXG4gIHBhbmVsQ2xhc3M/OiBzdHJpbmcgfCBzdHJpbmdbXSA9ICcnO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBkaWFsb2cgaGFzIGEgYmFja2Ryb3AuICovXG4gIGhhc0JhY2tkcm9wPzogYm9vbGVhbiA9IHRydWU7XG5cbiAgLyoqIEN1c3RvbSBjbGFzcyBmb3IgdGhlIGJhY2tkcm9wLiAqL1xuICBiYWNrZHJvcENsYXNzPzogc3RyaW5nIHwgc3RyaW5nW10gPSAnJztcblxuICAvKiogV2hldGhlciB0aGUgdXNlciBjYW4gdXNlIGVzY2FwZSBvciBjbGlja2luZyBvbiB0aGUgYmFja2Ryb3AgdG8gY2xvc2UgdGhlIG1vZGFsLiAqL1xuICBkaXNhYmxlQ2xvc2U/OiBib29sZWFuID0gZmFsc2U7XG5cbiAgLyoqIFdpZHRoIG9mIHRoZSBkaWFsb2cuICovXG4gIHdpZHRoPzogc3RyaW5nID0gJyc7XG5cbiAgLyoqIEhlaWdodCBvZiB0aGUgZGlhbG9nLiAqL1xuICBoZWlnaHQ/OiBzdHJpbmcgPSAnJztcblxuICAvKiogTWluLXdpZHRoIG9mIHRoZSBkaWFsb2cuIElmIGEgbnVtYmVyIGlzIHByb3ZpZGVkLCBhc3N1bWVzIHBpeGVsIHVuaXRzLiAqL1xuICBtaW5XaWR0aD86IG51bWJlciB8IHN0cmluZztcblxuICAvKiogTWluLWhlaWdodCBvZiB0aGUgZGlhbG9nLiBJZiBhIG51bWJlciBpcyBwcm92aWRlZCwgYXNzdW1lcyBwaXhlbCB1bml0cy4gKi9cbiAgbWluSGVpZ2h0PzogbnVtYmVyIHwgc3RyaW5nO1xuXG4gIC8qKiBNYXgtd2lkdGggb2YgdGhlIGRpYWxvZy4gSWYgYSBudW1iZXIgaXMgcHJvdmlkZWQsIGFzc3VtZXMgcGl4ZWwgdW5pdHMuIERlZmF1bHRzIHRvIDgwdncuICovXG4gIG1heFdpZHRoPzogbnVtYmVyIHwgc3RyaW5nID0gJzgwdncnO1xuXG4gIC8qKiBNYXgtaGVpZ2h0IG9mIHRoZSBkaWFsb2cuIElmIGEgbnVtYmVyIGlzIHByb3ZpZGVkLCBhc3N1bWVzIHBpeGVsIHVuaXRzLiAqL1xuICBtYXhIZWlnaHQ/OiBudW1iZXIgfCBzdHJpbmc7XG5cbiAgLyoqIFBvc2l0aW9uIG92ZXJyaWRlcy4gKi9cbiAgcG9zaXRpb24/OiBEaWFsb2dQb3NpdGlvbjtcblxuICAvKiogRGF0YSBiZWluZyBpbmplY3RlZCBpbnRvIHRoZSBjaGlsZCBjb21wb25lbnQuICovXG4gIGRhdGE/OiBEIHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIExheW91dCBkaXJlY3Rpb24gZm9yIHRoZSBkaWFsb2cncyBjb250ZW50LiAqL1xuICBkaXJlY3Rpb24/OiBEaXJlY3Rpb247XG5cbiAgLyoqIElEIG9mIHRoZSBlbGVtZW50IHRoYXQgZGVzY3JpYmVzIHRoZSBkaWFsb2cuICovXG4gIGFyaWFEZXNjcmliZWRCeT86IHN0cmluZyB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBJRCBvZiB0aGUgZWxlbWVudCB0aGF0IGxhYmVscyB0aGUgZGlhbG9nLiAqL1xuICBhcmlhTGFiZWxsZWRCeT86IHN0cmluZyB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBBcmlhIGxhYmVsIHRvIGFzc2lnbiB0byB0aGUgZGlhbG9nIGVsZW1lbnQuICovXG4gIGFyaWFMYWJlbD86IHN0cmluZyB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBkaWFsb2cgc2hvdWxkIGZvY3VzIHRoZSBmaXJzdCBmb2N1c2FibGUgZWxlbWVudCBvbiBvcGVuLiAqL1xuICBhdXRvRm9jdXM/OiBib29sZWFuID0gdHJ1ZTtcblxuICAvKipcbiAgICogV2hldGhlciB0aGUgZGlhbG9nIHNob3VsZCByZXN0b3JlIGZvY3VzIHRvIHRoZVxuICAgKiBwcmV2aW91c2x5LWZvY3VzZWQgZWxlbWVudCwgYWZ0ZXIgaXQncyBjbG9zZWQuXG4gICAqL1xuICByZXN0b3JlRm9jdXM/OiBib29sZWFuID0gdHJ1ZTtcblxuICAvKiogU2Nyb2xsIHN0cmF0ZWd5IHRvIGJlIHVzZWQgZm9yIHRoZSBkaWFsb2cuICovXG4gIHNjcm9sbFN0cmF0ZWd5PzogU2Nyb2xsU3RyYXRlZ3k7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGRpYWxvZyBzaG91bGQgY2xvc2Ugd2hlbiB0aGUgdXNlciBnb2VzIGJhY2t3YXJkcy9mb3J3YXJkcyBpbiBoaXN0b3J5LlxuICAgKiBOb3RlIHRoYXQgdGhpcyB1c3VhbGx5IGRvZXNuJ3QgaW5jbHVkZSBjbGlja2luZyBvbiBsaW5rcyAodW5sZXNzIHRoZSB1c2VyIGlzIHVzaW5nXG4gICAqIHRoZSBgSGFzaExvY2F0aW9uU3RyYXRlZ3lgKS5cbiAgICovXG4gIGNsb3NlT25OYXZpZ2F0aW9uPzogYm9vbGVhbiA9IHRydWU7XG5cbiAgLyoqIEFsdGVybmF0ZSBgQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyYCB0byB1c2Ugd2hlbiByZXNvbHZpbmcgdGhlIGFzc29jaWF0ZWQgY29tcG9uZW50LiAqL1xuICBjb21wb25lbnRGYWN0b3J5UmVzb2x2ZXI/OiBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXI7XG5cbiAgLy8gVE9ETyhqZWxib3Vybik6IGFkZCBjb25maWd1cmF0aW9uIGZvciBsaWZlY3ljbGUgaG9va3MsIEFSSUEgbGFiZWxsaW5nLlxufVxuIl19