/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { MatCommonModule } from '@angular/material/core';
import { MatCard, MatCardActions, MatCardAvatar, MatCardContent, MatCardFooter, MatCardHeader, MatCardImage, MatCardLgImage, MatCardMdImage, MatCardSmImage, MatCardSubtitle, MatCardTitle, MatCardTitleGroup, MatCardXlImage, } from './card';
export class MatCardModule {
}
MatCardModule.decorators = [
    { type: NgModule, args: [{
                imports: [MatCommonModule],
                exports: [
                    MatCard,
                    MatCardHeader,
                    MatCardTitleGroup,
                    MatCardContent,
                    MatCardTitle,
                    MatCardSubtitle,
                    MatCardActions,
                    MatCardFooter,
                    MatCardSmImage,
                    MatCardMdImage,
                    MatCardLgImage,
                    MatCardImage,
                    MatCardXlImage,
                    MatCardAvatar,
                    MatCommonModule,
                ],
                declarations: [
                    MatCard, MatCardHeader, MatCardTitleGroup, MatCardContent, MatCardTitle, MatCardSubtitle,
                    MatCardActions, MatCardFooter, MatCardSmImage, MatCardMdImage, MatCardLgImage, MatCardImage,
                    MatCardXlImage, MatCardAvatar,
                ],
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FyZC1tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvY2FyZC9jYXJkLW1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3ZDLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUN2RCxPQUFPLEVBQ0wsT0FBTyxFQUNQLGNBQWMsRUFDZCxhQUFhLEVBQ2IsY0FBYyxFQUNkLGFBQWEsRUFDYixhQUFhLEVBQ2IsWUFBWSxFQUNaLGNBQWMsRUFDZCxjQUFjLEVBQ2QsY0FBYyxFQUNkLGVBQWUsRUFDZixZQUFZLEVBQ1osaUJBQWlCLEVBQ2pCLGNBQWMsR0FDZixNQUFNLFFBQVEsQ0FBQztBQTRCaEIsTUFBTSxPQUFPLGFBQWE7OztZQXpCekIsUUFBUSxTQUFDO2dCQUNSLE9BQU8sRUFBRSxDQUFDLGVBQWUsQ0FBQztnQkFDMUIsT0FBTyxFQUFFO29CQUNQLE9BQU87b0JBQ1AsYUFBYTtvQkFDYixpQkFBaUI7b0JBQ2pCLGNBQWM7b0JBQ2QsWUFBWTtvQkFDWixlQUFlO29CQUNmLGNBQWM7b0JBQ2QsYUFBYTtvQkFDYixjQUFjO29CQUNkLGNBQWM7b0JBQ2QsY0FBYztvQkFDZCxZQUFZO29CQUNaLGNBQWM7b0JBQ2QsYUFBYTtvQkFDYixlQUFlO2lCQUNoQjtnQkFDRCxZQUFZLEVBQUU7b0JBQ1osT0FBTyxFQUFFLGFBQWEsRUFBRSxpQkFBaUIsRUFBRSxjQUFjLEVBQUUsWUFBWSxFQUFFLGVBQWU7b0JBQ3hGLGNBQWMsRUFBRSxhQUFhLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsWUFBWTtvQkFDM0YsY0FBYyxFQUFFLGFBQWE7aUJBQzlCO2FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge01hdENvbW1vbk1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvY29yZSc7XG5pbXBvcnQge1xuICBNYXRDYXJkLFxuICBNYXRDYXJkQWN0aW9ucyxcbiAgTWF0Q2FyZEF2YXRhcixcbiAgTWF0Q2FyZENvbnRlbnQsXG4gIE1hdENhcmRGb290ZXIsXG4gIE1hdENhcmRIZWFkZXIsXG4gIE1hdENhcmRJbWFnZSxcbiAgTWF0Q2FyZExnSW1hZ2UsXG4gIE1hdENhcmRNZEltYWdlLFxuICBNYXRDYXJkU21JbWFnZSxcbiAgTWF0Q2FyZFN1YnRpdGxlLFxuICBNYXRDYXJkVGl0bGUsXG4gIE1hdENhcmRUaXRsZUdyb3VwLFxuICBNYXRDYXJkWGxJbWFnZSxcbn0gZnJvbSAnLi9jYXJkJztcblxuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbTWF0Q29tbW9uTW9kdWxlXSxcbiAgZXhwb3J0czogW1xuICAgIE1hdENhcmQsXG4gICAgTWF0Q2FyZEhlYWRlcixcbiAgICBNYXRDYXJkVGl0bGVHcm91cCxcbiAgICBNYXRDYXJkQ29udGVudCxcbiAgICBNYXRDYXJkVGl0bGUsXG4gICAgTWF0Q2FyZFN1YnRpdGxlLFxuICAgIE1hdENhcmRBY3Rpb25zLFxuICAgIE1hdENhcmRGb290ZXIsXG4gICAgTWF0Q2FyZFNtSW1hZ2UsXG4gICAgTWF0Q2FyZE1kSW1hZ2UsXG4gICAgTWF0Q2FyZExnSW1hZ2UsXG4gICAgTWF0Q2FyZEltYWdlLFxuICAgIE1hdENhcmRYbEltYWdlLFxuICAgIE1hdENhcmRBdmF0YXIsXG4gICAgTWF0Q29tbW9uTW9kdWxlLFxuICBdLFxuICBkZWNsYXJhdGlvbnM6IFtcbiAgICBNYXRDYXJkLCBNYXRDYXJkSGVhZGVyLCBNYXRDYXJkVGl0bGVHcm91cCwgTWF0Q2FyZENvbnRlbnQsIE1hdENhcmRUaXRsZSwgTWF0Q2FyZFN1YnRpdGxlLFxuICAgIE1hdENhcmRBY3Rpb25zLCBNYXRDYXJkRm9vdGVyLCBNYXRDYXJkU21JbWFnZSwgTWF0Q2FyZE1kSW1hZ2UsIE1hdENhcmRMZ0ltYWdlLCBNYXRDYXJkSW1hZ2UsXG4gICAgTWF0Q2FyZFhsSW1hZ2UsIE1hdENhcmRBdmF0YXIsXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIE1hdENhcmRNb2R1bGUge31cbiJdfQ==