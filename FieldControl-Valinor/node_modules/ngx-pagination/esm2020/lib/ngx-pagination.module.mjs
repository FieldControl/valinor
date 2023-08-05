import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginatePipe } from './paginate.pipe';
import { PaginationService } from './pagination.service';
import { PaginationControlsComponent } from './pagination-controls.component';
import { PaginationControlsDirective } from './pagination-controls.directive';
import * as i0 from "@angular/core";
export { PaginationService } from './pagination.service';
export { PaginationControlsComponent } from './pagination-controls.component';
export { PaginationControlsDirective } from './pagination-controls.directive';
export { PaginatePipe } from './paginate.pipe';
export class NgxPaginationModule {
}
NgxPaginationModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.3.9", ngImport: i0, type: NgxPaginationModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
NgxPaginationModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "13.3.9", ngImport: i0, type: NgxPaginationModule, declarations: [PaginatePipe,
        PaginationControlsComponent,
        PaginationControlsDirective], imports: [CommonModule], exports: [PaginatePipe, PaginationControlsComponent, PaginationControlsDirective] });
NgxPaginationModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "13.3.9", ngImport: i0, type: NgxPaginationModule, providers: [PaginationService], imports: [[CommonModule]] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.3.9", ngImport: i0, type: NgxPaginationModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [CommonModule],
                    declarations: [
                        PaginatePipe,
                        PaginationControlsComponent,
                        PaginationControlsDirective
                    ],
                    providers: [PaginationService],
                    exports: [PaginatePipe, PaginationControlsComponent, PaginationControlsDirective]
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LXBhZ2luYXRpb24ubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvbmd4LXBhZ2luYXRpb24vc3JjL2xpYi9uZ3gtcGFnaW5hdGlvbi5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDN0MsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQzdDLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ3ZELE9BQU8sRUFBQywyQkFBMkIsRUFBQyxNQUFNLGlDQUFpQyxDQUFDO0FBQzVFLE9BQU8sRUFBQywyQkFBMkIsRUFBQyxNQUFNLGlDQUFpQyxDQUFDOztBQUc1RSxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUN2RCxPQUFPLEVBQUMsMkJBQTJCLEVBQUMsTUFBTSxpQ0FBaUMsQ0FBQztBQUM1RSxPQUFPLEVBQUMsMkJBQTJCLEVBQUMsTUFBTSxpQ0FBaUMsQ0FBQztBQUM1RSxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFZN0MsTUFBTSxPQUFPLG1CQUFtQjs7Z0hBQW5CLG1CQUFtQjtpSEFBbkIsbUJBQW1CLGlCQVB4QixZQUFZO1FBQ1osMkJBQTJCO1FBQzNCLDJCQUEyQixhQUpyQixZQUFZLGFBT1osWUFBWSxFQUFFLDJCQUEyQixFQUFFLDJCQUEyQjtpSEFFdkUsbUJBQW1CLGFBSGpCLENBQUMsaUJBQWlCLENBQUMsWUFOckIsQ0FBQyxZQUFZLENBQUM7MkZBU2QsbUJBQW1CO2tCQVYvQixRQUFRO21CQUFDO29CQUNOLE9BQU8sRUFBRSxDQUFDLFlBQVksQ0FBQztvQkFDdkIsWUFBWSxFQUFFO3dCQUNWLFlBQVk7d0JBQ1osMkJBQTJCO3dCQUMzQiwyQkFBMkI7cUJBQzlCO29CQUNELFNBQVMsRUFBRSxDQUFDLGlCQUFpQixDQUFDO29CQUM5QixPQUFPLEVBQUUsQ0FBQyxZQUFZLEVBQUUsMkJBQTJCLEVBQUUsMkJBQTJCLENBQUM7aUJBQ3BGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7Q29tbW9uTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xyXG5pbXBvcnQge1BhZ2luYXRlUGlwZX0gZnJvbSAnLi9wYWdpbmF0ZS5waXBlJztcclxuaW1wb3J0IHtQYWdpbmF0aW9uU2VydmljZX0gZnJvbSAnLi9wYWdpbmF0aW9uLnNlcnZpY2UnO1xyXG5pbXBvcnQge1BhZ2luYXRpb25Db250cm9sc0NvbXBvbmVudH0gZnJvbSAnLi9wYWdpbmF0aW9uLWNvbnRyb2xzLmNvbXBvbmVudCc7XHJcbmltcG9ydCB7UGFnaW5hdGlvbkNvbnRyb2xzRGlyZWN0aXZlfSBmcm9tICcuL3BhZ2luYXRpb24tY29udHJvbHMuZGlyZWN0aXZlJztcclxuXHJcbmV4cG9ydCB7UGFnaW5hdGlvbkluc3RhbmNlfSBmcm9tICcuL3BhZ2luYXRpb24taW5zdGFuY2UnO1xyXG5leHBvcnQge1BhZ2luYXRpb25TZXJ2aWNlfSBmcm9tICcuL3BhZ2luYXRpb24uc2VydmljZSc7XHJcbmV4cG9ydCB7UGFnaW5hdGlvbkNvbnRyb2xzQ29tcG9uZW50fSBmcm9tICcuL3BhZ2luYXRpb24tY29udHJvbHMuY29tcG9uZW50JztcclxuZXhwb3J0IHtQYWdpbmF0aW9uQ29udHJvbHNEaXJlY3RpdmV9IGZyb20gJy4vcGFnaW5hdGlvbi1jb250cm9scy5kaXJlY3RpdmUnO1xyXG5leHBvcnQge1BhZ2luYXRlUGlwZX0gZnJvbSAnLi9wYWdpbmF0ZS5waXBlJztcclxuXHJcbkBOZ01vZHVsZSh7XHJcbiAgICBpbXBvcnRzOiBbQ29tbW9uTW9kdWxlXSxcclxuICAgIGRlY2xhcmF0aW9uczogW1xyXG4gICAgICAgIFBhZ2luYXRlUGlwZSxcclxuICAgICAgICBQYWdpbmF0aW9uQ29udHJvbHNDb21wb25lbnQsXHJcbiAgICAgICAgUGFnaW5hdGlvbkNvbnRyb2xzRGlyZWN0aXZlXHJcbiAgICBdLFxyXG4gICAgcHJvdmlkZXJzOiBbUGFnaW5hdGlvblNlcnZpY2VdLFxyXG4gICAgZXhwb3J0czogW1BhZ2luYXRlUGlwZSwgUGFnaW5hdGlvbkNvbnRyb2xzQ29tcG9uZW50LCBQYWdpbmF0aW9uQ29udHJvbHNEaXJlY3RpdmVdXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBOZ3hQYWdpbmF0aW9uTW9kdWxlIHsgfVxyXG4iXX0=