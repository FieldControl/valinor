import { NgModule } from '@angular/core';
import { provideStoreDevtools } from './provide-store-devtools';
import * as i0 from "@angular/core";
export function createStateObservable(devtools) {
    return devtools.state;
}
export class StoreDevtoolsModule {
    static instrument(options = {}) {
        return {
            ngModule: StoreDevtoolsModule,
            providers: [provideStoreDevtools(options)],
        };
    }
    /** @nocollapse */ static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: StoreDevtoolsModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    /** @nocollapse */ static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.0.0", ngImport: i0, type: StoreDevtoolsModule }); }
    /** @nocollapse */ static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: StoreDevtoolsModule }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: StoreDevtoolsModule, decorators: [{
            type: NgModule,
            args: [{}]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zdHJ1bWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL21vZHVsZXMvc3RvcmUtZGV2dG9vbHMvc3JjL2luc3RydW1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUF1QixRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFJOUQsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sMEJBQTBCLENBQUM7O0FBRWhFLE1BQU0sVUFBVSxxQkFBcUIsQ0FDbkMsUUFBdUI7SUFFdkIsT0FBTyxRQUFRLENBQUMsS0FBSyxDQUFDO0FBQ3hCLENBQUM7QUFHRCxNQUFNLE9BQU8sbUJBQW1CO0lBQzlCLE1BQU0sQ0FBQyxVQUFVLENBQ2YsVUFBZ0MsRUFBRTtRQUVsQyxPQUFPO1lBQ0wsUUFBUSxFQUFFLG1CQUFtQjtZQUM3QixTQUFTLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUMzQyxDQUFDO0lBQ0osQ0FBQztpSUFSVSxtQkFBbUI7a0lBQW5CLG1CQUFtQjtrSUFBbkIsbUJBQW1COzsyRkFBbkIsbUJBQW1CO2tCQUQvQixRQUFRO21CQUFDLEVBQUUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBNb2R1bGVXaXRoUHJvdmlkZXJzLCBOZ01vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgU3RhdGVPYnNlcnZhYmxlIH0gZnJvbSAnQG5ncngvc3RvcmUnO1xuaW1wb3J0IHsgU3RvcmVEZXZ0b29sc09wdGlvbnMgfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQgeyBTdG9yZURldnRvb2xzIH0gZnJvbSAnLi9kZXZ0b29scyc7XG5pbXBvcnQgeyBwcm92aWRlU3RvcmVEZXZ0b29scyB9IGZyb20gJy4vcHJvdmlkZS1zdG9yZS1kZXZ0b29scyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTdGF0ZU9ic2VydmFibGUoXG4gIGRldnRvb2xzOiBTdG9yZURldnRvb2xzXG4pOiBTdGF0ZU9ic2VydmFibGUge1xuICByZXR1cm4gZGV2dG9vbHMuc3RhdGU7XG59XG5cbkBOZ01vZHVsZSh7fSlcbmV4cG9ydCBjbGFzcyBTdG9yZURldnRvb2xzTW9kdWxlIHtcbiAgc3RhdGljIGluc3RydW1lbnQoXG4gICAgb3B0aW9uczogU3RvcmVEZXZ0b29sc09wdGlvbnMgPSB7fVxuICApOiBNb2R1bGVXaXRoUHJvdmlkZXJzPFN0b3JlRGV2dG9vbHNNb2R1bGU+IHtcbiAgICByZXR1cm4ge1xuICAgICAgbmdNb2R1bGU6IFN0b3JlRGV2dG9vbHNNb2R1bGUsXG4gICAgICBwcm92aWRlcnM6IFtwcm92aWRlU3RvcmVEZXZ0b29scyhvcHRpb25zKV0sXG4gICAgfTtcbiAgfVxufVxuIl19