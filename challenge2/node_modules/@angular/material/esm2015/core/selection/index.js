/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { MatPseudoCheckbox } from './pseudo-checkbox/pseudo-checkbox';
import { MatCommonModule } from '../common-behaviors/common-module';
export class MatPseudoCheckboxModule {
}
MatPseudoCheckboxModule.decorators = [
    { type: NgModule, args: [{
                imports: [MatCommonModule],
                exports: [MatPseudoCheckbox],
                declarations: [MatPseudoCheckbox]
            },] }
];
export * from './pseudo-checkbox/pseudo-checkbox';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvY29yZS9zZWxlY3Rpb24vaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxtQ0FBbUMsQ0FBQztBQUNwRSxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sbUNBQW1DLENBQUM7QUFRbEUsTUFBTSxPQUFPLHVCQUF1Qjs7O1lBTG5DLFFBQVEsU0FBQztnQkFDUixPQUFPLEVBQUUsQ0FBQyxlQUFlLENBQUM7Z0JBQzFCLE9BQU8sRUFBRSxDQUFDLGlCQUFpQixDQUFDO2dCQUM1QixZQUFZLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQzthQUNsQzs7QUFJRCxjQUFjLG1DQUFtQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7TmdNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtNYXRQc2V1ZG9DaGVja2JveH0gZnJvbSAnLi9wc2V1ZG8tY2hlY2tib3gvcHNldWRvLWNoZWNrYm94JztcbmltcG9ydCB7TWF0Q29tbW9uTW9kdWxlfSBmcm9tICcuLi9jb21tb24tYmVoYXZpb3JzL2NvbW1vbi1tb2R1bGUnO1xuXG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtNYXRDb21tb25Nb2R1bGVdLFxuICBleHBvcnRzOiBbTWF0UHNldWRvQ2hlY2tib3hdLFxuICBkZWNsYXJhdGlvbnM6IFtNYXRQc2V1ZG9DaGVja2JveF1cbn0pXG5leHBvcnQgY2xhc3MgTWF0UHNldWRvQ2hlY2tib3hNb2R1bGUgeyB9XG5cblxuZXhwb3J0ICogZnJvbSAnLi9wc2V1ZG8tY2hlY2tib3gvcHNldWRvLWNoZWNrYm94JztcbiJdfQ==