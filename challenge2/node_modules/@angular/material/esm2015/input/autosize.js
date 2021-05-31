/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Directive, Input } from '@angular/core';
/**
 * Directive to automatically resize a textarea to fit its content.
 * @deprecated Use `cdkTextareaAutosize` from `@angular/cdk/text-field` instead.
 * @breaking-change 8.0.0
 */
export class MatTextareaAutosize extends CdkTextareaAutosize {
    get matAutosizeMinRows() { return this.minRows; }
    set matAutosizeMinRows(value) { this.minRows = value; }
    get matAutosizeMaxRows() { return this.maxRows; }
    set matAutosizeMaxRows(value) { this.maxRows = value; }
    get matAutosize() { return this.enabled; }
    set matAutosize(value) { this.enabled = value; }
    get matTextareaAutosize() { return this.enabled; }
    set matTextareaAutosize(value) { this.enabled = value; }
}
MatTextareaAutosize.decorators = [
    { type: Directive, args: [{
                selector: 'textarea[mat-autosize], textarea[matTextareaAutosize]',
                exportAs: 'matTextareaAutosize',
                inputs: ['cdkAutosizeMinRows', 'cdkAutosizeMaxRows'],
                host: {
                    'class': 'cdk-textarea-autosize mat-autosize',
                    // Textarea elements that have the directive applied should have a single row by default.
                    // Browsers normally show two rows by default and therefore this limits the minRows binding.
                    'rows': '1',
                },
            },] }
];
MatTextareaAutosize.propDecorators = {
    matAutosizeMinRows: [{ type: Input }],
    matAutosizeMaxRows: [{ type: Input }],
    matAutosize: [{ type: Input, args: ['mat-autosize',] }],
    matTextareaAutosize: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0b3NpemUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvaW5wdXQvYXV0b3NpemUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0seUJBQXlCLENBQUM7QUFDNUQsT0FBTyxFQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFL0M7Ozs7R0FJRztBQVlILE1BQU0sT0FBTyxtQkFBb0IsU0FBUSxtQkFBbUI7SUFDMUQsSUFDSSxrQkFBa0IsS0FBYSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ3pELElBQUksa0JBQWtCLENBQUMsS0FBYSxJQUFJLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUUvRCxJQUNJLGtCQUFrQixLQUFhLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDekQsSUFBSSxrQkFBa0IsQ0FBQyxLQUFhLElBQUksSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBRS9ELElBQ0ksV0FBVyxLQUFjLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDbkQsSUFBSSxXQUFXLENBQUMsS0FBYyxJQUFJLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUV6RCxJQUNJLG1CQUFtQixLQUFjLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDM0QsSUFBSSxtQkFBbUIsQ0FBQyxLQUFjLElBQUksSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDOzs7WUExQmxFLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsdURBQXVEO2dCQUNqRSxRQUFRLEVBQUUscUJBQXFCO2dCQUMvQixNQUFNLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxvQkFBb0IsQ0FBQztnQkFDcEQsSUFBSSxFQUFFO29CQUNKLE9BQU8sRUFBRSxvQ0FBb0M7b0JBQzdDLHlGQUF5RjtvQkFDekYsNEZBQTRGO29CQUM1RixNQUFNLEVBQUUsR0FBRztpQkFDWjthQUNGOzs7aUNBRUUsS0FBSztpQ0FJTCxLQUFLOzBCQUlMLEtBQUssU0FBQyxjQUFjO2tDQUlwQixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q2RrVGV4dGFyZWFBdXRvc2l6ZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL3RleHQtZmllbGQnO1xuaW1wb3J0IHtEaXJlY3RpdmUsIElucHV0fSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuLyoqXG4gKiBEaXJlY3RpdmUgdG8gYXV0b21hdGljYWxseSByZXNpemUgYSB0ZXh0YXJlYSB0byBmaXQgaXRzIGNvbnRlbnQuXG4gKiBAZGVwcmVjYXRlZCBVc2UgYGNka1RleHRhcmVhQXV0b3NpemVgIGZyb20gYEBhbmd1bGFyL2Nkay90ZXh0LWZpZWxkYCBpbnN0ZWFkLlxuICogQGJyZWFraW5nLWNoYW5nZSA4LjAuMFxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICd0ZXh0YXJlYVttYXQtYXV0b3NpemVdLCB0ZXh0YXJlYVttYXRUZXh0YXJlYUF1dG9zaXplXScsXG4gIGV4cG9ydEFzOiAnbWF0VGV4dGFyZWFBdXRvc2l6ZScsXG4gIGlucHV0czogWydjZGtBdXRvc2l6ZU1pblJvd3MnLCAnY2RrQXV0b3NpemVNYXhSb3dzJ10sXG4gIGhvc3Q6IHtcbiAgICAnY2xhc3MnOiAnY2RrLXRleHRhcmVhLWF1dG9zaXplIG1hdC1hdXRvc2l6ZScsXG4gICAgLy8gVGV4dGFyZWEgZWxlbWVudHMgdGhhdCBoYXZlIHRoZSBkaXJlY3RpdmUgYXBwbGllZCBzaG91bGQgaGF2ZSBhIHNpbmdsZSByb3cgYnkgZGVmYXVsdC5cbiAgICAvLyBCcm93c2VycyBub3JtYWxseSBzaG93IHR3byByb3dzIGJ5IGRlZmF1bHQgYW5kIHRoZXJlZm9yZSB0aGlzIGxpbWl0cyB0aGUgbWluUm93cyBiaW5kaW5nLlxuICAgICdyb3dzJzogJzEnLFxuICB9LFxufSlcbmV4cG9ydCBjbGFzcyBNYXRUZXh0YXJlYUF1dG9zaXplIGV4dGVuZHMgQ2RrVGV4dGFyZWFBdXRvc2l6ZSB7XG4gIEBJbnB1dCgpXG4gIGdldCBtYXRBdXRvc2l6ZU1pblJvd3MoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMubWluUm93czsgfVxuICBzZXQgbWF0QXV0b3NpemVNaW5Sb3dzKHZhbHVlOiBudW1iZXIpIHsgdGhpcy5taW5Sb3dzID0gdmFsdWU7IH1cblxuICBASW5wdXQoKVxuICBnZXQgbWF0QXV0b3NpemVNYXhSb3dzKCk6IG51bWJlciB7IHJldHVybiB0aGlzLm1heFJvd3M7IH1cbiAgc2V0IG1hdEF1dG9zaXplTWF4Um93cyh2YWx1ZTogbnVtYmVyKSB7IHRoaXMubWF4Um93cyA9IHZhbHVlOyB9XG5cbiAgQElucHV0KCdtYXQtYXV0b3NpemUnKVxuICBnZXQgbWF0QXV0b3NpemUoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmVuYWJsZWQ7IH1cbiAgc2V0IG1hdEF1dG9zaXplKHZhbHVlOiBib29sZWFuKSB7IHRoaXMuZW5hYmxlZCA9IHZhbHVlOyB9XG5cbiAgQElucHV0KClcbiAgZ2V0IG1hdFRleHRhcmVhQXV0b3NpemUoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmVuYWJsZWQ7IH1cbiAgc2V0IG1hdFRleHRhcmVhQXV0b3NpemUodmFsdWU6IGJvb2xlYW4pIHsgdGhpcy5lbmFibGVkID0gdmFsdWU7IH1cbn1cbiJdfQ==