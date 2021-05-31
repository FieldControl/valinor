/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCommonModule, MatRippleModule } from '@angular/material/core';
import { CdkScrollableModule } from '@angular/cdk/scrolling';
import { MatMenu } from './menu';
import { MatMenuContent } from './menu-content';
import { MatMenuItem } from './menu-item';
import { MAT_MENU_SCROLL_STRATEGY_FACTORY_PROVIDER, MatMenuTrigger } from './menu-trigger';
/**
 * Used by both the current `MatMenuModule` and the MDC `MatMenuModule`
 * to declare the menu-related directives.
 */
export class _MatMenuDirectivesModule {
}
_MatMenuDirectivesModule.decorators = [
    { type: NgModule, args: [{
                exports: [MatMenuTrigger, MatMenuContent, MatCommonModule],
                declarations: [
                    MatMenuTrigger,
                    MatMenuContent,
                ],
                providers: [MAT_MENU_SCROLL_STRATEGY_FACTORY_PROVIDER]
            },] }
];
export class MatMenuModule {
}
MatMenuModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    CommonModule,
                    MatCommonModule,
                    MatRippleModule,
                    OverlayModule,
                    _MatMenuDirectivesModule,
                ],
                exports: [CdkScrollableModule, MatCommonModule, MatMenu, MatMenuItem, _MatMenuDirectivesModule],
                declarations: [MatMenu, MatMenuItem],
                providers: [MAT_MENU_SCROLL_STRATEGY_FACTORY_PROVIDER]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvbWVudS9tZW51LW1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDbkQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQzdDLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDdkMsT0FBTyxFQUFDLGVBQWUsRUFBRSxlQUFlLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUN4RSxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUMzRCxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sUUFBUSxDQUFDO0FBQy9CLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUM5QyxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQ3hDLE9BQU8sRUFBQyx5Q0FBeUMsRUFBRSxjQUFjLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUV6Rjs7O0dBR0c7QUFTSCxNQUFNLE9BQU8sd0JBQXdCOzs7WUFScEMsUUFBUSxTQUFDO2dCQUNSLE9BQU8sRUFBRSxDQUFDLGNBQWMsRUFBRSxjQUFjLEVBQUUsZUFBZSxDQUFDO2dCQUMxRCxZQUFZLEVBQUU7b0JBQ1osY0FBYztvQkFDZCxjQUFjO2lCQUNmO2dCQUNELFNBQVMsRUFBRSxDQUFDLHlDQUF5QyxDQUFDO2FBQ3ZEOztBQWVELE1BQU0sT0FBTyxhQUFhOzs7WUFaekIsUUFBUSxTQUFDO2dCQUNSLE9BQU8sRUFBRTtvQkFDUCxZQUFZO29CQUNaLGVBQWU7b0JBQ2YsZUFBZTtvQkFDZixhQUFhO29CQUNiLHdCQUF3QjtpQkFDekI7Z0JBQ0QsT0FBTyxFQUFFLENBQUMsbUJBQW1CLEVBQUUsZUFBZSxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsd0JBQXdCLENBQUM7Z0JBQy9GLFlBQVksRUFBRSxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUM7Z0JBQ3BDLFNBQVMsRUFBRSxDQUFDLHlDQUF5QyxDQUFDO2FBQ3ZEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7T3ZlcmxheU1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL292ZXJsYXknO1xuaW1wb3J0IHtDb21tb25Nb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge05nTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7TWF0Q29tbW9uTW9kdWxlLCBNYXRSaXBwbGVNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2NvcmUnO1xuaW1wb3J0IHtDZGtTY3JvbGxhYmxlTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jZGsvc2Nyb2xsaW5nJztcbmltcG9ydCB7TWF0TWVudX0gZnJvbSAnLi9tZW51JztcbmltcG9ydCB7TWF0TWVudUNvbnRlbnR9IGZyb20gJy4vbWVudS1jb250ZW50JztcbmltcG9ydCB7TWF0TWVudUl0ZW19IGZyb20gJy4vbWVudS1pdGVtJztcbmltcG9ydCB7TUFUX01FTlVfU0NST0xMX1NUUkFURUdZX0ZBQ1RPUllfUFJPVklERVIsIE1hdE1lbnVUcmlnZ2VyfSBmcm9tICcuL21lbnUtdHJpZ2dlcic7XG5cbi8qKlxuICogVXNlZCBieSBib3RoIHRoZSBjdXJyZW50IGBNYXRNZW51TW9kdWxlYCBhbmQgdGhlIE1EQyBgTWF0TWVudU1vZHVsZWBcbiAqIHRvIGRlY2xhcmUgdGhlIG1lbnUtcmVsYXRlZCBkaXJlY3RpdmVzLlxuICovXG5ATmdNb2R1bGUoe1xuICBleHBvcnRzOiBbTWF0TWVudVRyaWdnZXIsIE1hdE1lbnVDb250ZW50LCBNYXRDb21tb25Nb2R1bGVdLFxuICBkZWNsYXJhdGlvbnM6IFtcbiAgICBNYXRNZW51VHJpZ2dlcixcbiAgICBNYXRNZW51Q29udGVudCxcbiAgXSxcbiAgcHJvdmlkZXJzOiBbTUFUX01FTlVfU0NST0xMX1NUUkFURUdZX0ZBQ1RPUllfUFJPVklERVJdXG59KVxuZXhwb3J0IGNsYXNzIF9NYXRNZW51RGlyZWN0aXZlc01vZHVsZSB7fVxuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbXG4gICAgQ29tbW9uTW9kdWxlLFxuICAgIE1hdENvbW1vbk1vZHVsZSxcbiAgICBNYXRSaXBwbGVNb2R1bGUsXG4gICAgT3ZlcmxheU1vZHVsZSxcbiAgICBfTWF0TWVudURpcmVjdGl2ZXNNb2R1bGUsXG4gIF0sXG4gIGV4cG9ydHM6IFtDZGtTY3JvbGxhYmxlTW9kdWxlLCBNYXRDb21tb25Nb2R1bGUsIE1hdE1lbnUsIE1hdE1lbnVJdGVtLCBfTWF0TWVudURpcmVjdGl2ZXNNb2R1bGVdLFxuICBkZWNsYXJhdGlvbnM6IFtNYXRNZW51LCBNYXRNZW51SXRlbV0sXG4gIHByb3ZpZGVyczogW01BVF9NRU5VX1NDUk9MTF9TVFJBVEVHWV9GQUNUT1JZX1BST1ZJREVSXVxufSlcbmV4cG9ydCBjbGFzcyBNYXRNZW51TW9kdWxlIHt9XG4iXX0=