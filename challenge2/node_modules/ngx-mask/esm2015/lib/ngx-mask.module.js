import { NgModule } from '@angular/core';
import { config, INITIAL_CONFIG, initialConfig, NEW_CONFIG } from './config';
import { MaskApplierService } from './mask-applier.service';
import { MaskDirective } from './mask.directive';
import { MaskPipe } from './mask.pipe';
export class NgxMaskModule {
    static forRoot(configValue) {
        return {
            ngModule: NgxMaskModule,
            providers: [
                {
                    provide: NEW_CONFIG,
                    useValue: configValue,
                },
                {
                    provide: INITIAL_CONFIG,
                    useValue: initialConfig,
                },
                {
                    provide: config,
                    useFactory: _configFactory,
                    deps: [INITIAL_CONFIG, NEW_CONFIG],
                },
                MaskApplierService,
            ],
        };
    }
    static forChild() {
        return {
            ngModule: NgxMaskModule,
        };
    }
}
NgxMaskModule.decorators = [
    { type: NgModule, args: [{
                exports: [MaskDirective, MaskPipe],
                declarations: [MaskDirective, MaskPipe],
            },] }
];
/**
 * @internal
 */
export function _configFactory(initConfig, configValue) {
    return configValue instanceof Function ? Object.assign(Object.assign({}, initConfig), configValue()) : Object.assign(Object.assign({}, initConfig), configValue);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LW1hc2subW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvbmd4LW1hc2stbGliL3NyYy9saWIvbmd4LW1hc2subW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBdUIsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTlELE9BQU8sRUFBRSxNQUFNLEVBQUUsY0FBYyxFQUFFLGFBQWEsRUFBRSxVQUFVLEVBQWlCLE1BQU0sVUFBVSxDQUFDO0FBQzVGLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQzVELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUNqRCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBTXZDLE1BQU0sT0FBTyxhQUFhO0lBQ2pCLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBbUQ7UUFDdkUsT0FBTztZQUNMLFFBQVEsRUFBRSxhQUFhO1lBQ3ZCLFNBQVMsRUFBRTtnQkFDVDtvQkFDRSxPQUFPLEVBQUUsVUFBVTtvQkFDbkIsUUFBUSxFQUFFLFdBQVc7aUJBQ3RCO2dCQUNEO29CQUNFLE9BQU8sRUFBRSxjQUFjO29CQUN2QixRQUFRLEVBQUUsYUFBYTtpQkFDeEI7Z0JBQ0Q7b0JBQ0UsT0FBTyxFQUFFLE1BQU07b0JBQ2YsVUFBVSxFQUFFLGNBQWM7b0JBQzFCLElBQUksRUFBRSxDQUFDLGNBQWMsRUFBRSxVQUFVLENBQUM7aUJBQ25DO2dCQUNELGtCQUFrQjthQUNuQjtTQUNGLENBQUM7SUFDSixDQUFDO0lBQ00sTUFBTSxDQUFDLFFBQVE7UUFDcEIsT0FBTztZQUNMLFFBQVEsRUFBRSxhQUFhO1NBQ3hCLENBQUM7SUFDSixDQUFDOzs7WUE5QkYsUUFBUSxTQUFDO2dCQUNSLE9BQU8sRUFBRSxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUM7Z0JBQ2xDLFlBQVksRUFBRSxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUM7YUFDeEM7O0FBOEJEOztHQUVHO0FBQ0gsTUFBTSxVQUFVLGNBQWMsQ0FDNUIsVUFBeUIsRUFDekIsV0FBa0Q7SUFFbEQsT0FBTyxXQUFXLFlBQVksUUFBUSxDQUFDLENBQUMsaUNBQU0sVUFBVSxHQUFLLFdBQVcsRUFBRSxFQUFHLENBQUMsaUNBQU0sVUFBVSxHQUFLLFdBQVcsQ0FBRSxDQUFDO0FBQ25ILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBNb2R1bGVXaXRoUHJvdmlkZXJzLCBOZ01vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBjb25maWcsIElOSVRJQUxfQ09ORklHLCBpbml0aWFsQ29uZmlnLCBORVdfQ09ORklHLCBvcHRpb25zQ29uZmlnIH0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHsgTWFza0FwcGxpZXJTZXJ2aWNlIH0gZnJvbSAnLi9tYXNrLWFwcGxpZXIuc2VydmljZSc7XG5pbXBvcnQgeyBNYXNrRGlyZWN0aXZlIH0gZnJvbSAnLi9tYXNrLmRpcmVjdGl2ZSc7XG5pbXBvcnQgeyBNYXNrUGlwZSB9IGZyb20gJy4vbWFzay5waXBlJztcblxuQE5nTW9kdWxlKHtcbiAgZXhwb3J0czogW01hc2tEaXJlY3RpdmUsIE1hc2tQaXBlXSxcbiAgZGVjbGFyYXRpb25zOiBbTWFza0RpcmVjdGl2ZSwgTWFza1BpcGVdLFxufSlcbmV4cG9ydCBjbGFzcyBOZ3hNYXNrTW9kdWxlIHtcbiAgcHVibGljIHN0YXRpYyBmb3JSb290KGNvbmZpZ1ZhbHVlPzogb3B0aW9uc0NvbmZpZyB8ICgoKSA9PiBvcHRpb25zQ29uZmlnKSk6IE1vZHVsZVdpdGhQcm92aWRlcnM8Tmd4TWFza01vZHVsZT4ge1xuICAgIHJldHVybiB7XG4gICAgICBuZ01vZHVsZTogTmd4TWFza01vZHVsZSxcbiAgICAgIHByb3ZpZGVyczogW1xuICAgICAgICB7XG4gICAgICAgICAgcHJvdmlkZTogTkVXX0NPTkZJRyxcbiAgICAgICAgICB1c2VWYWx1ZTogY29uZmlnVmFsdWUsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBwcm92aWRlOiBJTklUSUFMX0NPTkZJRyxcbiAgICAgICAgICB1c2VWYWx1ZTogaW5pdGlhbENvbmZpZyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHByb3ZpZGU6IGNvbmZpZyxcbiAgICAgICAgICB1c2VGYWN0b3J5OiBfY29uZmlnRmFjdG9yeSxcbiAgICAgICAgICBkZXBzOiBbSU5JVElBTF9DT05GSUcsIE5FV19DT05GSUddLFxuICAgICAgICB9LFxuICAgICAgICBNYXNrQXBwbGllclNlcnZpY2UsXG4gICAgICBdLFxuICAgIH07XG4gIH1cbiAgcHVibGljIHN0YXRpYyBmb3JDaGlsZCgpOiBNb2R1bGVXaXRoUHJvdmlkZXJzPE5neE1hc2tNb2R1bGU+IHtcbiAgICByZXR1cm4ge1xuICAgICAgbmdNb2R1bGU6IE5neE1hc2tNb2R1bGUsXG4gICAgfTtcbiAgfVxufVxuXG4vKipcbiAqIEBpbnRlcm5hbFxuICovXG5leHBvcnQgZnVuY3Rpb24gX2NvbmZpZ0ZhY3RvcnkoXG4gIGluaXRDb25maWc6IG9wdGlvbnNDb25maWcsXG4gIGNvbmZpZ1ZhbHVlOiBvcHRpb25zQ29uZmlnIHwgKCgpID0+IG9wdGlvbnNDb25maWcpXG4pOiBvcHRpb25zQ29uZmlnIHtcbiAgcmV0dXJuIGNvbmZpZ1ZhbHVlIGluc3RhbmNlb2YgRnVuY3Rpb24gPyB7IC4uLmluaXRDb25maWcsIC4uLmNvbmZpZ1ZhbHVlKCkgfSA6IHsgLi4uaW5pdENvbmZpZywgLi4uY29uZmlnVmFsdWUgfTtcbn1cbiJdfQ==