/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Component, Directive, NgModule, Pipe, ɵReflectionCapabilities as ReflectionCapabilities, } from '@angular/core';
import { MetadataOverrider } from './metadata_overrider';
const reflection = new ReflectionCapabilities();
/**
 * Allows to override ivy metadata for tests (via the `TestBed`).
 */
class OverrideResolver {
    constructor() {
        this.overrides = new Map();
        this.resolved = new Map();
    }
    addOverride(type, override) {
        const overrides = this.overrides.get(type) || [];
        overrides.push(override);
        this.overrides.set(type, overrides);
        this.resolved.delete(type);
    }
    setOverrides(overrides) {
        this.overrides.clear();
        overrides.forEach(([type, override]) => {
            this.addOverride(type, override);
        });
    }
    getAnnotation(type) {
        const annotations = reflection.annotations(type);
        // Try to find the nearest known Type annotation and make sure that this annotation is an
        // instance of the type we are looking for, so we can use it for resolution. Note: there might
        // be multiple known annotations found due to the fact that Components can extend Directives (so
        // both Directive and Component annotations would be present), so we always check if the known
        // annotation has the right type.
        for (let i = annotations.length - 1; i >= 0; i--) {
            const annotation = annotations[i];
            const isKnownType = annotation instanceof Directive ||
                annotation instanceof Component ||
                annotation instanceof Pipe ||
                annotation instanceof NgModule;
            if (isKnownType) {
                return annotation instanceof this.type ? annotation : null;
            }
        }
        return null;
    }
    resolve(type) {
        let resolved = this.resolved.get(type) || null;
        if (!resolved) {
            resolved = this.getAnnotation(type);
            if (resolved) {
                const overrides = this.overrides.get(type);
                if (overrides) {
                    const overrider = new MetadataOverrider();
                    overrides.forEach((override) => {
                        resolved = overrider.overrideMetadata(this.type, resolved, override);
                    });
                }
            }
            this.resolved.set(type, resolved);
        }
        return resolved;
    }
}
export class DirectiveResolver extends OverrideResolver {
    get type() {
        return Directive;
    }
}
export class ComponentResolver extends OverrideResolver {
    get type() {
        return Component;
    }
}
export class PipeResolver extends OverrideResolver {
    get type() {
        return Pipe;
    }
}
export class NgModuleResolver extends OverrideResolver {
    get type() {
        return NgModule;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS90ZXN0aW5nL3NyYy9yZXNvbHZlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLFNBQVMsRUFDVCxTQUFTLEVBQ1QsUUFBUSxFQUNSLElBQUksRUFFSix1QkFBdUIsSUFBSSxzQkFBc0IsR0FDbEQsTUFBTSxlQUFlLENBQUM7QUFHdkIsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFFdkQsTUFBTSxVQUFVLEdBQUcsSUFBSSxzQkFBc0IsRUFBRSxDQUFDO0FBV2hEOztHQUVHO0FBQ0gsTUFBZSxnQkFBZ0I7SUFBL0I7UUFDVSxjQUFTLEdBQUcsSUFBSSxHQUFHLEVBQW9DLENBQUM7UUFDeEQsYUFBUSxHQUFHLElBQUksR0FBRyxFQUF1QixDQUFDO0lBMERwRCxDQUFDO0lBdERDLFdBQVcsQ0FBQyxJQUFlLEVBQUUsUUFBNkI7UUFDeEQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2pELFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDekIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFFRCxZQUFZLENBQUMsU0FBa0Q7UUFDN0QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN2QixTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLEVBQUUsRUFBRTtZQUNyQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNuQyxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxhQUFhLENBQUMsSUFBZTtRQUMzQixNQUFNLFdBQVcsR0FBRyxVQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pELHlGQUF5RjtRQUN6Riw4RkFBOEY7UUFDOUYsZ0dBQWdHO1FBQ2hHLDhGQUE4RjtRQUM5RixpQ0FBaUM7UUFDakMsS0FBSyxJQUFJLENBQUMsR0FBRyxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDakQsTUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xDLE1BQU0sV0FBVyxHQUNmLFVBQVUsWUFBWSxTQUFTO2dCQUMvQixVQUFVLFlBQVksU0FBUztnQkFDL0IsVUFBVSxZQUFZLElBQUk7Z0JBQzFCLFVBQVUsWUFBWSxRQUFRLENBQUM7WUFDakMsSUFBSSxXQUFXLEVBQUUsQ0FBQztnQkFDaEIsT0FBTyxVQUFVLFlBQVksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUUsVUFBMkIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQy9FLENBQUM7UUFDSCxDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQsT0FBTyxDQUFDLElBQWU7UUFDckIsSUFBSSxRQUFRLEdBQWEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDO1FBRXpELElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNkLFFBQVEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3BDLElBQUksUUFBUSxFQUFFLENBQUM7Z0JBQ2IsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzNDLElBQUksU0FBUyxFQUFFLENBQUM7b0JBQ2QsTUFBTSxTQUFTLEdBQUcsSUFBSSxpQkFBaUIsRUFBRSxDQUFDO29CQUMxQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUU7d0JBQzdCLFFBQVEsR0FBRyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxRQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7b0JBQ3hFLENBQUMsQ0FBQyxDQUFDO2dCQUNMLENBQUM7WUFDSCxDQUFDO1lBQ0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3BDLENBQUM7UUFFRCxPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDO0NBQ0Y7QUFFRCxNQUFNLE9BQU8saUJBQWtCLFNBQVEsZ0JBQTJCO0lBQ2hFLElBQWEsSUFBSTtRQUNmLE9BQU8sU0FBUyxDQUFDO0lBQ25CLENBQUM7Q0FDRjtBQUVELE1BQU0sT0FBTyxpQkFBa0IsU0FBUSxnQkFBMkI7SUFDaEUsSUFBYSxJQUFJO1FBQ2YsT0FBTyxTQUFTLENBQUM7SUFDbkIsQ0FBQztDQUNGO0FBRUQsTUFBTSxPQUFPLFlBQWEsU0FBUSxnQkFBc0I7SUFDdEQsSUFBYSxJQUFJO1FBQ2YsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0NBQ0Y7QUFFRCxNQUFNLE9BQU8sZ0JBQWlCLFNBQVEsZ0JBQTBCO0lBQzlELElBQWEsSUFBSTtRQUNmLE9BQU8sUUFBUSxDQUFDO0lBQ2xCLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgQ29tcG9uZW50LFxuICBEaXJlY3RpdmUsXG4gIE5nTW9kdWxlLFxuICBQaXBlLFxuICBUeXBlLFxuICDJtVJlZmxlY3Rpb25DYXBhYmlsaXRpZXMgYXMgUmVmbGVjdGlvbkNhcGFiaWxpdGllcyxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7TWV0YWRhdGFPdmVycmlkZX0gZnJvbSAnLi9tZXRhZGF0YV9vdmVycmlkZSc7XG5pbXBvcnQge01ldGFkYXRhT3ZlcnJpZGVyfSBmcm9tICcuL21ldGFkYXRhX292ZXJyaWRlcic7XG5cbmNvbnN0IHJlZmxlY3Rpb24gPSBuZXcgUmVmbGVjdGlvbkNhcGFiaWxpdGllcygpO1xuXG4vKipcbiAqIEJhc2UgaW50ZXJmYWNlIHRvIHJlc29sdmUgYEBDb21wb25lbnRgLCBgQERpcmVjdGl2ZWAsIGBAUGlwZWAgYW5kIGBATmdNb2R1bGVgLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFJlc29sdmVyPFQ+IHtcbiAgYWRkT3ZlcnJpZGUodHlwZTogVHlwZTxhbnk+LCBvdmVycmlkZTogTWV0YWRhdGFPdmVycmlkZTxUPik6IHZvaWQ7XG4gIHNldE92ZXJyaWRlcyhvdmVycmlkZXM6IEFycmF5PFtUeXBlPGFueT4sIE1ldGFkYXRhT3ZlcnJpZGU8VD5dPik6IHZvaWQ7XG4gIHJlc29sdmUodHlwZTogVHlwZTxhbnk+KTogVCB8IG51bGw7XG59XG5cbi8qKlxuICogQWxsb3dzIHRvIG92ZXJyaWRlIGl2eSBtZXRhZGF0YSBmb3IgdGVzdHMgKHZpYSB0aGUgYFRlc3RCZWRgKS5cbiAqL1xuYWJzdHJhY3QgY2xhc3MgT3ZlcnJpZGVSZXNvbHZlcjxUPiBpbXBsZW1lbnRzIFJlc29sdmVyPFQ+IHtcbiAgcHJpdmF0ZSBvdmVycmlkZXMgPSBuZXcgTWFwPFR5cGU8YW55PiwgTWV0YWRhdGFPdmVycmlkZTxUPltdPigpO1xuICBwcml2YXRlIHJlc29sdmVkID0gbmV3IE1hcDxUeXBlPGFueT4sIFQgfCBudWxsPigpO1xuXG4gIGFic3RyYWN0IGdldCB0eXBlKCk6IGFueTtcblxuICBhZGRPdmVycmlkZSh0eXBlOiBUeXBlPGFueT4sIG92ZXJyaWRlOiBNZXRhZGF0YU92ZXJyaWRlPFQ+KSB7XG4gICAgY29uc3Qgb3ZlcnJpZGVzID0gdGhpcy5vdmVycmlkZXMuZ2V0KHR5cGUpIHx8IFtdO1xuICAgIG92ZXJyaWRlcy5wdXNoKG92ZXJyaWRlKTtcbiAgICB0aGlzLm92ZXJyaWRlcy5zZXQodHlwZSwgb3ZlcnJpZGVzKTtcbiAgICB0aGlzLnJlc29sdmVkLmRlbGV0ZSh0eXBlKTtcbiAgfVxuXG4gIHNldE92ZXJyaWRlcyhvdmVycmlkZXM6IEFycmF5PFtUeXBlPGFueT4sIE1ldGFkYXRhT3ZlcnJpZGU8VD5dPikge1xuICAgIHRoaXMub3ZlcnJpZGVzLmNsZWFyKCk7XG4gICAgb3ZlcnJpZGVzLmZvckVhY2goKFt0eXBlLCBvdmVycmlkZV0pID0+IHtcbiAgICAgIHRoaXMuYWRkT3ZlcnJpZGUodHlwZSwgb3ZlcnJpZGUpO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0QW5ub3RhdGlvbih0eXBlOiBUeXBlPGFueT4pOiBUIHwgbnVsbCB7XG4gICAgY29uc3QgYW5ub3RhdGlvbnMgPSByZWZsZWN0aW9uLmFubm90YXRpb25zKHR5cGUpO1xuICAgIC8vIFRyeSB0byBmaW5kIHRoZSBuZWFyZXN0IGtub3duIFR5cGUgYW5ub3RhdGlvbiBhbmQgbWFrZSBzdXJlIHRoYXQgdGhpcyBhbm5vdGF0aW9uIGlzIGFuXG4gICAgLy8gaW5zdGFuY2Ugb2YgdGhlIHR5cGUgd2UgYXJlIGxvb2tpbmcgZm9yLCBzbyB3ZSBjYW4gdXNlIGl0IGZvciByZXNvbHV0aW9uLiBOb3RlOiB0aGVyZSBtaWdodFxuICAgIC8vIGJlIG11bHRpcGxlIGtub3duIGFubm90YXRpb25zIGZvdW5kIGR1ZSB0byB0aGUgZmFjdCB0aGF0IENvbXBvbmVudHMgY2FuIGV4dGVuZCBEaXJlY3RpdmVzIChzb1xuICAgIC8vIGJvdGggRGlyZWN0aXZlIGFuZCBDb21wb25lbnQgYW5ub3RhdGlvbnMgd291bGQgYmUgcHJlc2VudCksIHNvIHdlIGFsd2F5cyBjaGVjayBpZiB0aGUga25vd25cbiAgICAvLyBhbm5vdGF0aW9uIGhhcyB0aGUgcmlnaHQgdHlwZS5cbiAgICBmb3IgKGxldCBpID0gYW5ub3RhdGlvbnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIGNvbnN0IGFubm90YXRpb24gPSBhbm5vdGF0aW9uc1tpXTtcbiAgICAgIGNvbnN0IGlzS25vd25UeXBlID1cbiAgICAgICAgYW5ub3RhdGlvbiBpbnN0YW5jZW9mIERpcmVjdGl2ZSB8fFxuICAgICAgICBhbm5vdGF0aW9uIGluc3RhbmNlb2YgQ29tcG9uZW50IHx8XG4gICAgICAgIGFubm90YXRpb24gaW5zdGFuY2VvZiBQaXBlIHx8XG4gICAgICAgIGFubm90YXRpb24gaW5zdGFuY2VvZiBOZ01vZHVsZTtcbiAgICAgIGlmIChpc0tub3duVHlwZSkge1xuICAgICAgICByZXR1cm4gYW5ub3RhdGlvbiBpbnN0YW5jZW9mIHRoaXMudHlwZSA/IChhbm5vdGF0aW9uIGFzIHVua25vd24gYXMgVCkgOiBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHJlc29sdmUodHlwZTogVHlwZTxhbnk+KTogVCB8IG51bGwge1xuICAgIGxldCByZXNvbHZlZDogVCB8IG51bGwgPSB0aGlzLnJlc29sdmVkLmdldCh0eXBlKSB8fCBudWxsO1xuXG4gICAgaWYgKCFyZXNvbHZlZCkge1xuICAgICAgcmVzb2x2ZWQgPSB0aGlzLmdldEFubm90YXRpb24odHlwZSk7XG4gICAgICBpZiAocmVzb2x2ZWQpIHtcbiAgICAgICAgY29uc3Qgb3ZlcnJpZGVzID0gdGhpcy5vdmVycmlkZXMuZ2V0KHR5cGUpO1xuICAgICAgICBpZiAob3ZlcnJpZGVzKSB7XG4gICAgICAgICAgY29uc3Qgb3ZlcnJpZGVyID0gbmV3IE1ldGFkYXRhT3ZlcnJpZGVyKCk7XG4gICAgICAgICAgb3ZlcnJpZGVzLmZvckVhY2goKG92ZXJyaWRlKSA9PiB7XG4gICAgICAgICAgICByZXNvbHZlZCA9IG92ZXJyaWRlci5vdmVycmlkZU1ldGFkYXRhKHRoaXMudHlwZSwgcmVzb2x2ZWQhLCBvdmVycmlkZSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMucmVzb2x2ZWQuc2V0KHR5cGUsIHJlc29sdmVkKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzb2x2ZWQ7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIERpcmVjdGl2ZVJlc29sdmVyIGV4dGVuZHMgT3ZlcnJpZGVSZXNvbHZlcjxEaXJlY3RpdmU+IHtcbiAgb3ZlcnJpZGUgZ2V0IHR5cGUoKSB7XG4gICAgcmV0dXJuIERpcmVjdGl2ZTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ29tcG9uZW50UmVzb2x2ZXIgZXh0ZW5kcyBPdmVycmlkZVJlc29sdmVyPENvbXBvbmVudD4ge1xuICBvdmVycmlkZSBnZXQgdHlwZSgpIHtcbiAgICByZXR1cm4gQ29tcG9uZW50O1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBQaXBlUmVzb2x2ZXIgZXh0ZW5kcyBPdmVycmlkZVJlc29sdmVyPFBpcGU+IHtcbiAgb3ZlcnJpZGUgZ2V0IHR5cGUoKSB7XG4gICAgcmV0dXJuIFBpcGU7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIE5nTW9kdWxlUmVzb2x2ZXIgZXh0ZW5kcyBPdmVycmlkZVJlc29sdmVyPE5nTW9kdWxlPiB7XG4gIG92ZXJyaWRlIGdldCB0eXBlKCkge1xuICAgIHJldHVybiBOZ01vZHVsZTtcbiAgfVxufVxuIl19