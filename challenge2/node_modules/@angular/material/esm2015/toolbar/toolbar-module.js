/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { MatCommonModule } from '@angular/material/core';
import { MatToolbar, MatToolbarRow } from './toolbar';
export class MatToolbarModule {
}
MatToolbarModule.decorators = [
    { type: NgModule, args: [{
                imports: [MatCommonModule],
                exports: [MatToolbar, MatToolbarRow, MatCommonModule],
                declarations: [MatToolbar, MatToolbarRow],
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9vbGJhci1tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvdG9vbGJhci90b29sYmFyLW1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3ZDLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUN2RCxPQUFPLEVBQUMsVUFBVSxFQUFFLGFBQWEsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQVFwRCxNQUFNLE9BQU8sZ0JBQWdCOzs7WUFMNUIsUUFBUSxTQUFDO2dCQUNSLE9BQU8sRUFBRSxDQUFDLGVBQWUsQ0FBQztnQkFDMUIsT0FBTyxFQUFFLENBQUMsVUFBVSxFQUFFLGFBQWEsRUFBRSxlQUFlLENBQUM7Z0JBQ3JELFlBQVksRUFBRSxDQUFDLFVBQVUsRUFBRSxhQUFhLENBQUM7YUFDMUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge01hdENvbW1vbk1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvY29yZSc7XG5pbXBvcnQge01hdFRvb2xiYXIsIE1hdFRvb2xiYXJSb3d9IGZyb20gJy4vdG9vbGJhcic7XG5cblxuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogW01hdENvbW1vbk1vZHVsZV0sXG4gIGV4cG9ydHM6IFtNYXRUb29sYmFyLCBNYXRUb29sYmFyUm93LCBNYXRDb21tb25Nb2R1bGVdLFxuICBkZWNsYXJhdGlvbnM6IFtNYXRUb29sYmFyLCBNYXRUb29sYmFyUm93XSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0VG9vbGJhck1vZHVsZSB7fVxuIl19