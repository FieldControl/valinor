/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { MatCommonModule, MatRippleModule } from '@angular/material/core';
import { MatRadioButton, MatRadioGroup } from './radio';
export class MatRadioModule {
}
MatRadioModule.decorators = [
    { type: NgModule, args: [{
                imports: [MatRippleModule, MatCommonModule],
                exports: [MatRadioGroup, MatRadioButton, MatCommonModule],
                declarations: [MatRadioGroup, MatRadioButton],
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFkaW8tbW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL3JhZGlvL3JhZGlvLW1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3ZDLE9BQU8sRUFBQyxlQUFlLEVBQUUsZUFBZSxFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDeEUsT0FBTyxFQUFDLGNBQWMsRUFBRSxhQUFhLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFRdEQsTUFBTSxPQUFPLGNBQWM7OztZQUwxQixRQUFRLFNBQUM7Z0JBQ1IsT0FBTyxFQUFFLENBQUMsZUFBZSxFQUFFLGVBQWUsQ0FBQztnQkFDM0MsT0FBTyxFQUFFLENBQUMsYUFBYSxFQUFFLGNBQWMsRUFBRSxlQUFlLENBQUM7Z0JBQ3pELFlBQVksRUFBRSxDQUFDLGFBQWEsRUFBRSxjQUFjLENBQUM7YUFDOUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge01hdENvbW1vbk1vZHVsZSwgTWF0UmlwcGxlTW9kdWxlfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9jb3JlJztcbmltcG9ydCB7TWF0UmFkaW9CdXR0b24sIE1hdFJhZGlvR3JvdXB9IGZyb20gJy4vcmFkaW8nO1xuXG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtNYXRSaXBwbGVNb2R1bGUsIE1hdENvbW1vbk1vZHVsZV0sXG4gIGV4cG9ydHM6IFtNYXRSYWRpb0dyb3VwLCBNYXRSYWRpb0J1dHRvbiwgTWF0Q29tbW9uTW9kdWxlXSxcbiAgZGVjbGFyYXRpb25zOiBbTWF0UmFkaW9Hcm91cCwgTWF0UmFkaW9CdXR0b25dLFxufSlcbmV4cG9ydCBjbGFzcyBNYXRSYWRpb01vZHVsZSB7fVxuIl19