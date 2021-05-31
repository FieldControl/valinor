/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCommonModule, MatLineModule, MatPseudoCheckboxModule, MatRippleModule, } from '@angular/material/core';
import { MatList, MatNavList, MatListAvatarCssMatStyler, MatListIconCssMatStyler, MatListItem, MatListSubheaderCssMatStyler, } from './list';
import { MatListOption, MatSelectionList } from './selection-list';
import { MatDividerModule } from '@angular/material/divider';
export class MatListModule {
}
MatListModule.decorators = [
    { type: NgModule, args: [{
                imports: [MatLineModule, MatRippleModule, MatCommonModule, MatPseudoCheckboxModule, CommonModule],
                exports: [
                    MatList,
                    MatNavList,
                    MatListItem,
                    MatListAvatarCssMatStyler,
                    MatLineModule,
                    MatCommonModule,
                    MatListIconCssMatStyler,
                    MatListSubheaderCssMatStyler,
                    MatPseudoCheckboxModule,
                    MatSelectionList,
                    MatListOption,
                    MatDividerModule
                ],
                declarations: [
                    MatList,
                    MatNavList,
                    MatListItem,
                    MatListAvatarCssMatStyler,
                    MatListIconCssMatStyler,
                    MatListSubheaderCssMatStyler,
                    MatSelectionList,
                    MatListOption
                ],
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC1tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvbGlzdC9saXN0LW1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDN0MsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQ0wsZUFBZSxFQUNmLGFBQWEsRUFDYix1QkFBdUIsRUFDdkIsZUFBZSxHQUNoQixNQUFNLHdCQUF3QixDQUFDO0FBQ2hDLE9BQU8sRUFDTCxPQUFPLEVBQ1AsVUFBVSxFQUNWLHlCQUF5QixFQUN6Qix1QkFBdUIsRUFDdkIsV0FBVyxFQUNYLDRCQUE0QixHQUM3QixNQUFNLFFBQVEsQ0FBQztBQUNoQixPQUFPLEVBQUMsYUFBYSxFQUFFLGdCQUFnQixFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDakUsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sMkJBQTJCLENBQUM7QUE4QjNELE1BQU0sT0FBTyxhQUFhOzs7WUEzQnpCLFFBQVEsU0FBQztnQkFDUixPQUFPLEVBQUUsQ0FBQyxhQUFhLEVBQUUsZUFBZSxFQUFFLGVBQWUsRUFBRSx1QkFBdUIsRUFBRSxZQUFZLENBQUM7Z0JBQ2pHLE9BQU8sRUFBRTtvQkFDUCxPQUFPO29CQUNQLFVBQVU7b0JBQ1YsV0FBVztvQkFDWCx5QkFBeUI7b0JBQ3pCLGFBQWE7b0JBQ2IsZUFBZTtvQkFDZix1QkFBdUI7b0JBQ3ZCLDRCQUE0QjtvQkFDNUIsdUJBQXVCO29CQUN2QixnQkFBZ0I7b0JBQ2hCLGFBQWE7b0JBQ2IsZ0JBQWdCO2lCQUNqQjtnQkFDRCxZQUFZLEVBQUU7b0JBQ1osT0FBTztvQkFDUCxVQUFVO29CQUNWLFdBQVc7b0JBQ1gseUJBQXlCO29CQUN6Qix1QkFBdUI7b0JBQ3ZCLDRCQUE0QjtvQkFDNUIsZ0JBQWdCO29CQUNoQixhQUFhO2lCQUNkO2FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDb21tb25Nb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge05nTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7XG4gIE1hdENvbW1vbk1vZHVsZSxcbiAgTWF0TGluZU1vZHVsZSxcbiAgTWF0UHNldWRvQ2hlY2tib3hNb2R1bGUsXG4gIE1hdFJpcHBsZU1vZHVsZSxcbn0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvY29yZSc7XG5pbXBvcnQge1xuICBNYXRMaXN0LFxuICBNYXROYXZMaXN0LFxuICBNYXRMaXN0QXZhdGFyQ3NzTWF0U3R5bGVyLFxuICBNYXRMaXN0SWNvbkNzc01hdFN0eWxlcixcbiAgTWF0TGlzdEl0ZW0sXG4gIE1hdExpc3RTdWJoZWFkZXJDc3NNYXRTdHlsZXIsXG59IGZyb20gJy4vbGlzdCc7XG5pbXBvcnQge01hdExpc3RPcHRpb24sIE1hdFNlbGVjdGlvbkxpc3R9IGZyb20gJy4vc2VsZWN0aW9uLWxpc3QnO1xuaW1wb3J0IHtNYXREaXZpZGVyTW9kdWxlfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9kaXZpZGVyJztcblxuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbTWF0TGluZU1vZHVsZSwgTWF0UmlwcGxlTW9kdWxlLCBNYXRDb21tb25Nb2R1bGUsIE1hdFBzZXVkb0NoZWNrYm94TW9kdWxlLCBDb21tb25Nb2R1bGVdLFxuICBleHBvcnRzOiBbXG4gICAgTWF0TGlzdCxcbiAgICBNYXROYXZMaXN0LFxuICAgIE1hdExpc3RJdGVtLFxuICAgIE1hdExpc3RBdmF0YXJDc3NNYXRTdHlsZXIsXG4gICAgTWF0TGluZU1vZHVsZSxcbiAgICBNYXRDb21tb25Nb2R1bGUsXG4gICAgTWF0TGlzdEljb25Dc3NNYXRTdHlsZXIsXG4gICAgTWF0TGlzdFN1YmhlYWRlckNzc01hdFN0eWxlcixcbiAgICBNYXRQc2V1ZG9DaGVja2JveE1vZHVsZSxcbiAgICBNYXRTZWxlY3Rpb25MaXN0LFxuICAgIE1hdExpc3RPcHRpb24sXG4gICAgTWF0RGl2aWRlck1vZHVsZVxuICBdLFxuICBkZWNsYXJhdGlvbnM6IFtcbiAgICBNYXRMaXN0LFxuICAgIE1hdE5hdkxpc3QsXG4gICAgTWF0TGlzdEl0ZW0sXG4gICAgTWF0TGlzdEF2YXRhckNzc01hdFN0eWxlcixcbiAgICBNYXRMaXN0SWNvbkNzc01hdFN0eWxlcixcbiAgICBNYXRMaXN0U3ViaGVhZGVyQ3NzTWF0U3R5bGVyLFxuICAgIE1hdFNlbGVjdGlvbkxpc3QsXG4gICAgTWF0TGlzdE9wdGlvblxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBNYXRMaXN0TW9kdWxlIHt9XG4iXX0=