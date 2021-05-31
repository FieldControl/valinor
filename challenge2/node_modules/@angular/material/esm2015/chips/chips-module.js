/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ENTER } from '@angular/cdk/keycodes';
import { NgModule } from '@angular/core';
import { ErrorStateMatcher, MatCommonModule } from '@angular/material/core';
import { MatChip, MatChipAvatar, MatChipRemove, MatChipTrailingIcon } from './chip';
import { MAT_CHIPS_DEFAULT_OPTIONS } from './chip-default-options';
import { MatChipInput } from './chip-input';
import { MatChipList } from './chip-list';
const CHIP_DECLARATIONS = [
    MatChipList,
    MatChip,
    MatChipInput,
    MatChipRemove,
    MatChipAvatar,
    MatChipTrailingIcon,
];
const ɵ0 = {
    separatorKeyCodes: [ENTER]
};
export class MatChipsModule {
}
MatChipsModule.decorators = [
    { type: NgModule, args: [{
                imports: [MatCommonModule],
                exports: CHIP_DECLARATIONS,
                declarations: CHIP_DECLARATIONS,
                providers: [
                    ErrorStateMatcher,
                    {
                        provide: MAT_CHIPS_DEFAULT_OPTIONS,
                        useValue: ɵ0
                    }
                ]
            },] }
];
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hpcHMtbW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2NoaXBzL2NoaXBzLW1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsS0FBSyxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDNUMsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQUMsaUJBQWlCLEVBQUUsZUFBZSxFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDMUUsT0FBTyxFQUFDLE9BQU8sRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFFLG1CQUFtQixFQUFDLE1BQU0sUUFBUSxDQUFDO0FBQ2xGLE9BQU8sRUFBQyx5QkFBeUIsRUFBeUIsTUFBTSx3QkFBd0IsQ0FBQztBQUN6RixPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQzFDLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFFeEMsTUFBTSxpQkFBaUIsR0FBRztJQUN4QixXQUFXO0lBQ1gsT0FBTztJQUNQLFlBQVk7SUFDWixhQUFhO0lBQ2IsYUFBYTtJQUNiLG1CQUFtQjtDQUNwQixDQUFDO1dBVWM7SUFDUixpQkFBaUIsRUFBRSxDQUFDLEtBQUssQ0FBQztDQUNEO0FBSWpDLE1BQU0sT0FBTyxjQUFjOzs7WUFkMUIsUUFBUSxTQUFDO2dCQUNSLE9BQU8sRUFBRSxDQUFDLGVBQWUsQ0FBQztnQkFDMUIsT0FBTyxFQUFFLGlCQUFpQjtnQkFDMUIsWUFBWSxFQUFFLGlCQUFpQjtnQkFDL0IsU0FBUyxFQUFFO29CQUNULGlCQUFpQjtvQkFDakI7d0JBQ0UsT0FBTyxFQUFFLHlCQUF5Qjt3QkFDbEMsUUFBUSxJQUVtQjtxQkFDNUI7aUJBQ0Y7YUFDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0VOVEVSfSBmcm9tICdAYW5ndWxhci9jZGsva2V5Y29kZXMnO1xuaW1wb3J0IHtOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0Vycm9yU3RhdGVNYXRjaGVyLCBNYXRDb21tb25Nb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2NvcmUnO1xuaW1wb3J0IHtNYXRDaGlwLCBNYXRDaGlwQXZhdGFyLCBNYXRDaGlwUmVtb3ZlLCBNYXRDaGlwVHJhaWxpbmdJY29ufSBmcm9tICcuL2NoaXAnO1xuaW1wb3J0IHtNQVRfQ0hJUFNfREVGQVVMVF9PUFRJT05TLCBNYXRDaGlwc0RlZmF1bHRPcHRpb25zfSBmcm9tICcuL2NoaXAtZGVmYXVsdC1vcHRpb25zJztcbmltcG9ydCB7TWF0Q2hpcElucHV0fSBmcm9tICcuL2NoaXAtaW5wdXQnO1xuaW1wb3J0IHtNYXRDaGlwTGlzdH0gZnJvbSAnLi9jaGlwLWxpc3QnO1xuXG5jb25zdCBDSElQX0RFQ0xBUkFUSU9OUyA9IFtcbiAgTWF0Q2hpcExpc3QsXG4gIE1hdENoaXAsXG4gIE1hdENoaXBJbnB1dCxcbiAgTWF0Q2hpcFJlbW92ZSxcbiAgTWF0Q2hpcEF2YXRhcixcbiAgTWF0Q2hpcFRyYWlsaW5nSWNvbixcbl07XG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtNYXRDb21tb25Nb2R1bGVdLFxuICBleHBvcnRzOiBDSElQX0RFQ0xBUkFUSU9OUyxcbiAgZGVjbGFyYXRpb25zOiBDSElQX0RFQ0xBUkFUSU9OUyxcbiAgcHJvdmlkZXJzOiBbXG4gICAgRXJyb3JTdGF0ZU1hdGNoZXIsXG4gICAge1xuICAgICAgcHJvdmlkZTogTUFUX0NISVBTX0RFRkFVTFRfT1BUSU9OUyxcbiAgICAgIHVzZVZhbHVlOiB7XG4gICAgICAgIHNlcGFyYXRvcktleUNvZGVzOiBbRU5URVJdXG4gICAgICB9IGFzIE1hdENoaXBzRGVmYXVsdE9wdGlvbnNcbiAgICB9XG4gIF1cbn0pXG5leHBvcnQgY2xhc3MgTWF0Q2hpcHNNb2R1bGUge31cbiJdfQ==