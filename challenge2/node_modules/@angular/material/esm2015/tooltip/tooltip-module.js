/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { OverlayModule } from '@angular/cdk/overlay';
import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCommonModule } from '@angular/material/core';
import { CdkScrollableModule } from '@angular/cdk/scrolling';
import { MatTooltip, TooltipComponent, MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER, } from './tooltip';
export class MatTooltipModule {
}
MatTooltipModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    A11yModule,
                    CommonModule,
                    OverlayModule,
                    MatCommonModule,
                ],
                exports: [MatTooltip, TooltipComponent, MatCommonModule, CdkScrollableModule],
                declarations: [MatTooltip, TooltipComponent],
                entryComponents: [TooltipComponent],
                providers: [MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9vbHRpcC1tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvdG9vbHRpcC90b29sdGlwLW1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDbkQsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQzdDLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUM3QyxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3ZDLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUN2RCxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUMzRCxPQUFPLEVBQ0wsVUFBVSxFQUNWLGdCQUFnQixFQUNoQiw0Q0FBNEMsR0FDN0MsTUFBTSxXQUFXLENBQUM7QUFjbkIsTUFBTSxPQUFPLGdCQUFnQjs7O1lBWjVCLFFBQVEsU0FBQztnQkFDUixPQUFPLEVBQUU7b0JBQ1AsVUFBVTtvQkFDVixZQUFZO29CQUNaLGFBQWE7b0JBQ2IsZUFBZTtpQkFDaEI7Z0JBQ0QsT0FBTyxFQUFFLENBQUMsVUFBVSxFQUFFLGdCQUFnQixFQUFFLGVBQWUsRUFBRSxtQkFBbUIsQ0FBQztnQkFDN0UsWUFBWSxFQUFFLENBQUMsVUFBVSxFQUFFLGdCQUFnQixDQUFDO2dCQUM1QyxlQUFlLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQztnQkFDbkMsU0FBUyxFQUFFLENBQUMsNENBQTRDLENBQUM7YUFDMUQiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtPdmVybGF5TW9kdWxlfSBmcm9tICdAYW5ndWxhci9jZGsvb3ZlcmxheSc7XG5pbXBvcnQge0ExMXlNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcbmltcG9ydCB7Q29tbW9uTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge01hdENvbW1vbk1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvY29yZSc7XG5pbXBvcnQge0Nka1Njcm9sbGFibGVNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2Nkay9zY3JvbGxpbmcnO1xuaW1wb3J0IHtcbiAgTWF0VG9vbHRpcCxcbiAgVG9vbHRpcENvbXBvbmVudCxcbiAgTUFUX1RPT0xUSVBfU0NST0xMX1NUUkFURUdZX0ZBQ1RPUllfUFJPVklERVIsXG59IGZyb20gJy4vdG9vbHRpcCc7XG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtcbiAgICBBMTF5TW9kdWxlLFxuICAgIENvbW1vbk1vZHVsZSxcbiAgICBPdmVybGF5TW9kdWxlLFxuICAgIE1hdENvbW1vbk1vZHVsZSxcbiAgXSxcbiAgZXhwb3J0czogW01hdFRvb2x0aXAsIFRvb2x0aXBDb21wb25lbnQsIE1hdENvbW1vbk1vZHVsZSwgQ2RrU2Nyb2xsYWJsZU1vZHVsZV0sXG4gIGRlY2xhcmF0aW9uczogW01hdFRvb2x0aXAsIFRvb2x0aXBDb21wb25lbnRdLFxuICBlbnRyeUNvbXBvbmVudHM6IFtUb29sdGlwQ29tcG9uZW50XSxcbiAgcHJvdmlkZXJzOiBbTUFUX1RPT0xUSVBfU0NST0xMX1NUUkFURUdZX0ZBQ1RPUllfUFJPVklERVJdXG59KVxuZXhwb3J0IGNsYXNzIE1hdFRvb2x0aXBNb2R1bGUge31cbiJdfQ==