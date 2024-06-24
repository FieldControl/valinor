/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ir from '../ir';
export var CompilationJobKind;
(function (CompilationJobKind) {
    CompilationJobKind[CompilationJobKind["Tmpl"] = 0] = "Tmpl";
    CompilationJobKind[CompilationJobKind["Host"] = 1] = "Host";
    CompilationJobKind[CompilationJobKind["Both"] = 2] = "Both";
})(CompilationJobKind || (CompilationJobKind = {}));
/**
 * An entire ongoing compilation, which will result in one or more template functions when complete.
 * Contains one or more corresponding compilation units.
 */
export class CompilationJob {
    constructor(componentName, pool, compatibility) {
        this.componentName = componentName;
        this.pool = pool;
        this.compatibility = compatibility;
        this.kind = CompilationJobKind.Both;
        /**
         * Tracks the next `ir.XrefId` which can be assigned as template structures are ingested.
         */
        this.nextXrefId = 0;
    }
    /**
     * Generate a new unique `ir.XrefId` in this job.
     */
    allocateXrefId() {
        return this.nextXrefId++;
    }
}
/**
 * Compilation-in-progress of a whole component's template, including the main template and any
 * embedded views or host bindings.
 */
export class ComponentCompilationJob extends CompilationJob {
    constructor(componentName, pool, compatibility, relativeContextFilePath, i18nUseExternalIds, deferMeta, allDeferrableDepsFn) {
        super(componentName, pool, compatibility);
        this.relativeContextFilePath = relativeContextFilePath;
        this.i18nUseExternalIds = i18nUseExternalIds;
        this.deferMeta = deferMeta;
        this.allDeferrableDepsFn = allDeferrableDepsFn;
        this.kind = CompilationJobKind.Tmpl;
        this.fnSuffix = 'Template';
        this.views = new Map();
        /**
         * Causes ngContentSelectors to be emitted, for content projection slots in the view. Possibly a
         * reference into the constant pool.
         */
        this.contentSelectors = null;
        /**
         * Constant expressions used by operations within this component's compilation.
         *
         * This will eventually become the `consts` array in the component definition.
         */
        this.consts = [];
        /**
         * Initialization statements needed to set up the consts.
         */
        this.constsInitializers = [];
        this.root = new ViewCompilationUnit(this, this.allocateXrefId(), null);
        this.views.set(this.root.xref, this.root);
    }
    /**
     * Add a `ViewCompilation` for a new embedded view to this compilation.
     */
    allocateView(parent) {
        const view = new ViewCompilationUnit(this, this.allocateXrefId(), parent);
        this.views.set(view.xref, view);
        return view;
    }
    get units() {
        return this.views.values();
    }
    /**
     * Add a constant `o.Expression` to the compilation and return its index in the `consts` array.
     */
    addConst(newConst, initializers) {
        for (let idx = 0; idx < this.consts.length; idx++) {
            if (this.consts[idx].isEquivalent(newConst)) {
                return idx;
            }
        }
        const idx = this.consts.length;
        this.consts.push(newConst);
        if (initializers) {
            this.constsInitializers.push(...initializers);
        }
        return idx;
    }
}
/**
 * A compilation unit is compiled into a template function. Some example units are views and host
 * bindings.
 */
export class CompilationUnit {
    constructor(xref) {
        this.xref = xref;
        /**
         * List of creation operations for this view.
         *
         * Creation operations may internally contain other operations, including update operations.
         */
        this.create = new ir.OpList();
        /**
         * List of update operations for this view.
         */
        this.update = new ir.OpList();
        /**
         * Name of the function which will be generated for this unit.
         *
         * May be `null` if not yet determined.
         */
        this.fnName = null;
        /**
         * Number of variable slots used within this view, or `null` if variables have not yet been
         * counted.
         */
        this.vars = null;
    }
    /**
     * Iterate over all `ir.Op`s within this view.
     *
     * Some operations may have child operations, which this iterator will visit.
     */
    *ops() {
        for (const op of this.create) {
            yield op;
            if (op.kind === ir.OpKind.Listener || op.kind === ir.OpKind.TwoWayListener) {
                for (const listenerOp of op.handlerOps) {
                    yield listenerOp;
                }
            }
        }
        for (const op of this.update) {
            yield op;
        }
    }
}
/**
 * Compilation-in-progress of an individual view within a template.
 */
export class ViewCompilationUnit extends CompilationUnit {
    constructor(job, xref, parent) {
        super(xref);
        this.job = job;
        this.parent = parent;
        /**
         * Map of declared variables available within this view to the property on the context object
         * which they alias.
         */
        this.contextVariables = new Map();
        /**
         * Set of aliases available within this view. An alias is a variable whose provided expression is
         * inlined at every location it is used. It may also depend on context variables, by name.
         */
        this.aliases = new Set();
        /**
         * Number of declaration slots used within this view, or `null` if slots have not yet been
         * allocated.
         */
        this.decls = null;
    }
}
/**
 * Compilation-in-progress of a host binding, which contains a single unit for that host binding.
 */
export class HostBindingCompilationJob extends CompilationJob {
    constructor(componentName, pool, compatibility) {
        super(componentName, pool, compatibility);
        this.kind = CompilationJobKind.Host;
        this.fnSuffix = 'HostBindings';
        this.root = new HostBindingCompilationUnit(this);
    }
    get units() {
        return [this.root];
    }
}
export class HostBindingCompilationUnit extends CompilationUnit {
    constructor(job) {
        super(0);
        this.job = job;
        /**
         * Much like an element can have attributes, so can a host binding function.
         */
        this.attributes = null;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvdGVtcGxhdGUvcGlwZWxpbmUvc3JjL2NvbXBpbGF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUtILE9BQU8sS0FBSyxFQUFFLE1BQU0sT0FBTyxDQUFDO0FBRTVCLE1BQU0sQ0FBTixJQUFZLGtCQUlYO0FBSkQsV0FBWSxrQkFBa0I7SUFDNUIsMkRBQUksQ0FBQTtJQUNKLDJEQUFJLENBQUE7SUFDSiwyREFBSSxDQUFBO0FBQ04sQ0FBQyxFQUpXLGtCQUFrQixLQUFsQixrQkFBa0IsUUFJN0I7QUFFRDs7O0dBR0c7QUFDSCxNQUFNLE9BQWdCLGNBQWM7SUFDbEMsWUFDVyxhQUFxQixFQUNyQixJQUFrQixFQUNsQixhQUFtQztRQUZuQyxrQkFBYSxHQUFiLGFBQWEsQ0FBUTtRQUNyQixTQUFJLEdBQUosSUFBSSxDQUFjO1FBQ2xCLGtCQUFhLEdBQWIsYUFBYSxDQUFzQjtRQUc5QyxTQUFJLEdBQXVCLGtCQUFrQixDQUFDLElBQUksQ0FBQztRQTBCbkQ7O1dBRUc7UUFDSyxlQUFVLEdBQWMsQ0FBYyxDQUFDO0lBL0I1QyxDQUFDO0lBcUJKOztPQUVHO0lBQ0gsY0FBYztRQUNaLE9BQU8sSUFBSSxDQUFDLFVBQVUsRUFBZSxDQUFDO0lBQ3hDLENBQUM7Q0FNRjtBQUVEOzs7R0FHRztBQUNILE1BQU0sT0FBTyx1QkFBd0IsU0FBUSxjQUFjO0lBQ3pELFlBQ0UsYUFBcUIsRUFDckIsSUFBa0IsRUFDbEIsYUFBbUMsRUFDMUIsdUJBQStCLEVBQy9CLGtCQUEyQixFQUMzQixTQUFtQyxFQUNuQyxtQkFBeUM7UUFFbEQsS0FBSyxDQUFDLGFBQWEsRUFBRSxJQUFJLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFMakMsNEJBQXVCLEdBQXZCLHVCQUF1QixDQUFRO1FBQy9C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O1FBQ2pELEtBQUssQ0FBQyxDQUFjLENBQUMsQ0FBQztRQURILFFBQUcsR0FBSCxHQUFHLENBQTJCO1FBSW5EOztXQUVHO1FBQ0gsZUFBVSxHQUE4QixJQUFJLENBQUM7SUFMN0MsQ0FBQztDQU1GIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q29uc3RhbnRQb29sfSBmcm9tICcuLi8uLi8uLi9jb25zdGFudF9wb29sJztcbmltcG9ydCAqIGFzIG8gZnJvbSAnLi4vLi4vLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0IHtSM0NvbXBvbmVudERlZmVyTWV0YWRhdGF9IGZyb20gJy4uLy4uLy4uL3JlbmRlcjMvdmlldy9hcGknO1xuaW1wb3J0ICogYXMgaXIgZnJvbSAnLi4vaXInO1xuXG5leHBvcnQgZW51bSBDb21waWxhdGlvbkpvYktpbmQge1xuICBUbXBsLFxuICBIb3N0LFxuICBCb3RoLCAvLyBBIHNwZWNpYWwgdmFsdWUgdXNlZCB0byBpbmRpY2F0ZSB0aGF0IHNvbWUgbG9naWMgYXBwbGllcyB0byBib3RoIGNvbXBpbGF0aW9uIHR5cGVzXG59XG5cbi8qKlxuICogQW4gZW50aXJlIG9uZ29pbmcgY29tcGlsYXRpb24sIHdoaWNoIHdpbGwgcmVzdWx0IGluIG9uZSBvciBtb3JlIHRlbXBsYXRlIGZ1bmN0aW9ucyB3aGVuIGNvbXBsZXRlLlxuICogQ29udGFpbnMgb25lIG9yIG1vcmUgY29ycmVzcG9uZGluZyBjb21waWxhdGlvbiB1bml0cy5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENvbXBpbGF0aW9uSm9iIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcmVhZG9ubHkgY29tcG9uZW50TmFtZTogc3RyaW5nLFxuICAgIHJlYWRvbmx5IHBvb2w6IENvbnN0YW50UG9vbCxcbiAgICByZWFkb25seSBjb21wYXRpYmlsaXR5OiBpci5Db21wYXRpYmlsaXR5TW9kZSxcbiAgKSB7fVxuXG4gIGtpbmQ6IENvbXBpbGF0aW9uSm9iS2luZCA9IENvbXBpbGF0aW9uSm9iS2luZC5Cb3RoO1xuXG4gIC8qKlxuICAgKiBBIGNvbXBpbGF0aW9uIGpvYiB3aWxsIGNvbnRhaW4gb25lIG9yIG1vcmUgY29tcGlsYXRpb24gdW5pdHMuXG4gICAqL1xuICBhYnN0cmFjdCBnZXQgdW5pdHMoKTogSXRlcmFibGU8Q29tcGlsYXRpb25Vbml0PjtcblxuICAvKipcbiAgICogVGhlIHJvb3QgY29tcGlsYXRpb24gdW5pdCwgc3VjaCBhcyB0aGUgY29tcG9uZW50J3MgdGVtcGxhdGUsIG9yIHRoZSBob3N0IGJpbmRpbmcncyBjb21waWxhdGlvblxuICAgKiB1bml0LlxuICAgKi9cbiAgYWJzdHJhY3Qgcm9vdDogQ29tcGlsYXRpb25Vbml0O1xuXG4gIC8qKlxuICAgKiBBIHVuaXF1ZSBzdHJpbmcgdXNlZCB0byBpZGVudGlmeSB0aGlzIGtpbmQgb2Ygam9iLCBhbmQgZ2VuZXJhdGUgdGhlIHRlbXBsYXRlIGZ1bmN0aW9uIChhcyBhXG4gICAqIHN1ZmZpeCBvZiB0aGUgbmFtZSkuXG4gICAqL1xuICBhYnN0cmFjdCBmblN1ZmZpeDogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIG5ldyB1bmlxdWUgYGlyLlhyZWZJZGAgaW4gdGhpcyBqb2IuXG4gICAqL1xuICBhbGxvY2F0ZVhyZWZJZCgpOiBpci5YcmVmSWQge1xuICAgIHJldHVybiB0aGlzLm5leHRYcmVmSWQrKyBhcyBpci5YcmVmSWQ7XG4gIH1cblxuICAvKipcbiAgICogVHJhY2tzIHRoZSBuZXh0IGBpci5YcmVmSWRgIHdoaWNoIGNhbiBiZSBhc3NpZ25lZCBhcyB0ZW1wbGF0ZSBzdHJ1Y3R1cmVzIGFyZSBpbmdlc3RlZC5cbiAgICovXG4gIHByaXZhdGUgbmV4dFhyZWZJZDogaXIuWHJlZklkID0gMCBhcyBpci5YcmVmSWQ7XG59XG5cbi8qKlxuICogQ29tcGlsYXRpb24taW4tcHJvZ3Jlc3Mgb2YgYSB3aG9sZSBjb21wb25lbnQncyB0ZW1wbGF0ZSwgaW5jbHVkaW5nIHRoZSBtYWluIHRlbXBsYXRlIGFuZCBhbnlcbiAqIGVtYmVkZGVkIHZpZXdzIG9yIGhvc3QgYmluZGluZ3MuXG4gKi9cbmV4cG9ydCBjbGFzcyBDb21wb25lbnRDb21waWxhdGlvbkpvYiBleHRlbmRzIENvbXBpbGF0aW9uSm9iIHtcbiAgY29uc3RydWN0b3IoXG4gICAgY29tcG9uZW50TmFtZTogc3RyaW5nLFxuICAgIHBvb2w6IENvbnN0YW50UG9vbCxcbiAgICBjb21wYXRpYmlsaXR5OiBpci5Db21wYXRpYmlsaXR5TW9kZSxcbiAgICByZWFkb25seSByZWxhdGl2ZUNvbnRleHRGaWxlUGF0aDogc3RyaW5nLFxuICAgIHJlYWRvbmx5IGkxOG5Vc2VFeHRlcm5hbElkczogYm9vbGVhbixcbiAgICByZWFkb25seSBkZWZlck1ldGE6IFIzQ29tcG9uZW50RGVmZXJNZXRhZGF0YSxcbiAgICByZWFkb25seSBhbGxEZWZlcnJhYmxlRGVwc0ZuOiBvLlJlYWRWYXJFeHByIHwgbnVsbCxcbiAgKSB7XG4gICAgc3VwZXIoY29tcG9uZW50TmFtZSwgcG9vbCwgY29tcGF0aWJpbGl0eSk7XG4gICAgdGhpcy5yb290ID0gbmV3IFZpZXdDb21waWxhdGlvblVuaXQodGhpcywgdGhpcy5hbGxvY2F0ZVhyZWZJZCgpLCBudWxsKTtcbiAgICB0aGlzLnZpZXdzLnNldCh0aGlzLnJvb3QueHJlZiwgdGhpcy5yb290KTtcbiAgfVxuXG4gIG92ZXJyaWRlIGtpbmQgPSBDb21waWxhdGlvbkpvYktpbmQuVG1wbDtcblxuICBvdmVycmlkZSByZWFkb25seSBmblN1ZmZpeDogc3RyaW5nID0gJ1RlbXBsYXRlJztcblxuICAvKipcbiAgICogVGhlIHJvb3QgdmlldywgcmVwcmVzZW50aW5nIHRoZSBjb21wb25lbnQncyB0ZW1wbGF0ZS5cbiAgICovXG4gIG92ZXJyaWRlIHJlYWRvbmx5IHJvb3Q6IFZpZXdDb21waWxhdGlvblVuaXQ7XG5cbiAgcmVhZG9ubHkgdmlld3MgPSBuZXcgTWFwPGlyLlhyZWZJZCwgVmlld0NvbXBpbGF0aW9uVW5pdD4oKTtcblxuICAvKipcbiAgICogQ2F1c2VzIG5nQ29udGVudFNlbGVjdG9ycyB0byBiZSBlbWl0dGVkLCBmb3IgY29udGVudCBwcm9qZWN0aW9uIHNsb3RzIGluIHRoZSB2aWV3LiBQb3NzaWJseSBhXG4gICAqIHJlZmVyZW5jZSBpbnRvIHRoZSBjb25zdGFudCBwb29sLlxuICAgKi9cbiAgcHVibGljIGNvbnRlbnRTZWxlY3RvcnM6IG8uRXhwcmVzc2lvbiB8IG51bGwgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBBZGQgYSBgVmlld0NvbXBpbGF0aW9uYCBmb3IgYSBuZXcgZW1iZWRkZWQgdmlldyB0byB0aGlzIGNvbXBpbGF0aW9uLlxuICAgKi9cbiAgYWxsb2NhdGVWaWV3KHBhcmVudDogaXIuWHJlZklkKTogVmlld0NvbXBpbGF0aW9uVW5pdCB7XG4gICAgY29uc3QgdmlldyA9IG5ldyBWaWV3Q29tcGlsYXRpb25Vbml0KHRoaXMsIHRoaXMuYWxsb2NhdGVYcmVmSWQoKSwgcGFyZW50KTtcbiAgICB0aGlzLnZpZXdzLnNldCh2aWV3LnhyZWYsIHZpZXcpO1xuICAgIHJldHVybiB2aWV3O1xuICB9XG5cbiAgb3ZlcnJpZGUgZ2V0IHVuaXRzKCk6IEl0ZXJhYmxlPFZpZXdDb21waWxhdGlvblVuaXQ+IHtcbiAgICByZXR1cm4gdGhpcy52aWV3cy52YWx1ZXMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSBjb25zdGFudCBgby5FeHByZXNzaW9uYCB0byB0aGUgY29tcGlsYXRpb24gYW5kIHJldHVybiBpdHMgaW5kZXggaW4gdGhlIGBjb25zdHNgIGFycmF5LlxuICAgKi9cbiAgYWRkQ29uc3QobmV3Q29uc3Q6IG8uRXhwcmVzc2lvbiwgaW5pdGlhbGl6ZXJzPzogby5TdGF0ZW1lbnRbXSk6IGlyLkNvbnN0SW5kZXgge1xuICAgIGZvciAobGV0IGlkeCA9IDA7IGlkeCA8IHRoaXMuY29uc3RzLmxlbmd0aDsgaWR4KyspIHtcbiAgICAgIGlmICh0aGlzLmNvbnN0c1tpZHhdLmlzRXF1aXZhbGVudChuZXdDb25zdCkpIHtcbiAgICAgICAgcmV0dXJuIGlkeCBhcyBpci5Db25zdEluZGV4O1xuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBpZHggPSB0aGlzLmNvbnN0cy5sZW5ndGg7XG4gICAgdGhpcy5jb25zdHMucHVzaChuZXdDb25zdCk7XG4gICAgaWYgKGluaXRpYWxpemVycykge1xuICAgICAgdGhpcy5jb25zdHNJbml0aWFsaXplcnMucHVzaCguLi5pbml0aWFsaXplcnMpO1xuICAgIH1cbiAgICByZXR1cm4gaWR4IGFzIGlyLkNvbnN0SW5kZXg7XG4gIH1cblxuICAvKipcbiAgICogQ29uc3RhbnQgZXhwcmVzc2lvbnMgdXNlZCBieSBvcGVyYXRpb25zIHdpdGhpbiB0aGlzIGNvbXBvbmVudCdzIGNvbXBpbGF0aW9uLlxuICAgKlxuICAgKiBUaGlzIHdpbGwgZXZlbnR1YWxseSBiZWNvbWUgdGhlIGBjb25zdHNgIGFycmF5IGluIHRoZSBjb21wb25lbnQgZGVmaW5pdGlvbi5cbiAgICovXG4gIHJlYWRvbmx5IGNvbnN0czogby5FeHByZXNzaW9uW10gPSBbXTtcblxuICAvKipcbiAgICogSW5pdGlhbGl6YXRpb24gc3RhdGVtZW50cyBuZWVkZWQgdG8gc2V0IHVwIHRoZSBjb25zdHMuXG4gICAqL1xuICByZWFkb25seSBjb25zdHNJbml0aWFsaXplcnM6IG8uU3RhdGVtZW50W10gPSBbXTtcbn1cblxuLyoqXG4gKiBBIGNvbXBpbGF0aW9uIHVuaXQgaXMgY29tcGlsZWQgaW50byBhIHRlbXBsYXRlIGZ1bmN0aW9uLiBTb21lIGV4YW1wbGUgdW5pdHMgYXJlIHZpZXdzIGFuZCBob3N0XG4gKiBiaW5kaW5ncy5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENvbXBpbGF0aW9uVW5pdCB7XG4gIGNvbnN0cnVjdG9yKHJlYWRvbmx5IHhyZWY6IGlyLlhyZWZJZCkge31cblxuICAvKipcbiAgICogTGlzdCBvZiBjcmVhdGlvbiBvcGVyYXRpb25zIGZvciB0aGlzIHZpZXcuXG4gICAqXG4gICAqIENyZWF0aW9uIG9wZXJhdGlvbnMgbWF5IGludGVybmFsbHkgY29udGFpbiBvdGhlciBvcGVyYXRpb25zLCBpbmNsdWRpbmcgdXBkYXRlIG9wZXJhdGlvbnMuXG4gICAqL1xuICByZWFkb25seSBjcmVhdGUgPSBuZXcgaXIuT3BMaXN0PGlyLkNyZWF0ZU9wPigpO1xuXG4gIC8qKlxuICAgKiBMaXN0IG9mIHVwZGF0ZSBvcGVyYXRpb25zIGZvciB0aGlzIHZpZXcuXG4gICAqL1xuICByZWFkb25seSB1cGRhdGUgPSBuZXcgaXIuT3BMaXN0PGlyLlVwZGF0ZU9wPigpO1xuXG4gIC8qKlxuICAgKiBUaGUgZW5jbG9zaW5nIGpvYiwgd2hpY2ggbWlnaHQgY29udGFpbiBzZXZlcmFsIGluZGl2aWR1YWwgY29tcGlsYXRpb24gdW5pdHMuXG4gICAqL1xuICBhYnN0cmFjdCByZWFkb25seSBqb2I6IENvbXBpbGF0aW9uSm9iO1xuXG4gIC8qKlxuICAgKiBOYW1lIG9mIHRoZSBmdW5jdGlvbiB3aGljaCB3aWxsIGJlIGdlbmVyYXRlZCBmb3IgdGhpcyB1bml0LlxuICAgKlxuICAgKiBNYXkgYmUgYG51bGxgIGlmIG5vdCB5ZXQgZGV0ZXJtaW5lZC5cbiAgICovXG4gIGZuTmFtZTogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqXG4gICAqIE51bWJlciBvZiB2YXJpYWJsZSBzbG90cyB1c2VkIHdpdGhpbiB0aGlzIHZpZXcsIG9yIGBudWxsYCBpZiB2YXJpYWJsZXMgaGF2ZSBub3QgeWV0IGJlZW5cbiAgICogY291bnRlZC5cbiAgICovXG4gIHZhcnM6IG51bWJlciB8IG51bGwgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBJdGVyYXRlIG92ZXIgYWxsIGBpci5PcGBzIHdpdGhpbiB0aGlzIHZpZXcuXG4gICAqXG4gICAqIFNvbWUgb3BlcmF0aW9ucyBtYXkgaGF2ZSBjaGlsZCBvcGVyYXRpb25zLCB3aGljaCB0aGlzIGl0ZXJhdG9yIHdpbGwgdmlzaXQuXG4gICAqL1xuICAqb3BzKCk6IEdlbmVyYXRvcjxpci5DcmVhdGVPcCB8IGlyLlVwZGF0ZU9wPiB7XG4gICAgZm9yIChjb25zdCBvcCBvZiB0aGlzLmNyZWF0ZSkge1xuICAgICAgeWllbGQgb3A7XG4gICAgICBpZiAob3Aua2luZCA9PT0gaXIuT3BLaW5kLkxpc3RlbmVyIHx8IG9wLmtpbmQgPT09IGlyLk9wS2luZC5Ud29XYXlMaXN0ZW5lcikge1xuICAgICAgICBmb3IgKGNvbnN0IGxpc3RlbmVyT3Agb2Ygb3AuaGFuZGxlck9wcykge1xuICAgICAgICAgIHlpZWxkIGxpc3RlbmVyT3A7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgZm9yIChjb25zdCBvcCBvZiB0aGlzLnVwZGF0ZSkge1xuICAgICAgeWllbGQgb3A7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQ29tcGlsYXRpb24taW4tcHJvZ3Jlc3Mgb2YgYW4gaW5kaXZpZHVhbCB2aWV3IHdpdGhpbiBhIHRlbXBsYXRlLlxuICovXG5leHBvcnQgY2xhc3MgVmlld0NvbXBpbGF0aW9uVW5pdCBleHRlbmRzIENvbXBpbGF0aW9uVW5pdCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHJlYWRvbmx5IGpvYjogQ29tcG9uZW50Q29tcGlsYXRpb25Kb2IsXG4gICAgeHJlZjogaXIuWHJlZklkLFxuICAgIHJlYWRvbmx5IHBhcmVudDogaXIuWHJlZklkIHwgbnVsbCxcbiAgKSB7XG4gICAgc3VwZXIoeHJlZik7XG4gIH1cblxuICAvKipcbiAgICogTWFwIG9mIGRlY2xhcmVkIHZhcmlhYmxlcyBhdmFpbGFibGUgd2l0aGluIHRoaXMgdmlldyB0byB0aGUgcHJvcGVydHkgb24gdGhlIGNvbnRleHQgb2JqZWN0XG4gICAqIHdoaWNoIHRoZXkgYWxpYXMuXG4gICAqL1xuICByZWFkb25seSBjb250ZXh0VmFyaWFibGVzID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcblxuICAvKipcbiAgICogU2V0IG9mIGFsaWFzZXMgYXZhaWxhYmxlIHdpdGhpbiB0aGlzIHZpZXcuIEFuIGFsaWFzIGlzIGEgdmFyaWFibGUgd2hvc2UgcHJvdmlkZWQgZXhwcmVzc2lvbiBpc1xuICAgKiBpbmxpbmVkIGF0IGV2ZXJ5IGxvY2F0aW9uIGl0IGlzIHVzZWQuIEl0IG1heSBhbHNvIGRlcGVuZCBvbiBjb250ZXh0IHZhcmlhYmxlcywgYnkgbmFtZS5cbiAgICovXG4gIHJlYWRvbmx5IGFsaWFzZXMgPSBuZXcgU2V0PGlyLkFsaWFzVmFyaWFibGU+KCk7XG5cbiAgLyoqXG4gICAqIE51bWJlciBvZiBkZWNsYXJhdGlvbiBzbG90cyB1c2VkIHdpdGhpbiB0aGlzIHZpZXcsIG9yIGBudWxsYCBpZiBzbG90cyBoYXZlIG5vdCB5ZXQgYmVlblxuICAgKiBhbGxvY2F0ZWQuXG4gICAqL1xuICBkZWNsczogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG59XG5cbi8qKlxuICogQ29tcGlsYXRpb24taW4tcHJvZ3Jlc3Mgb2YgYSBob3N0IGJpbmRpbmcsIHdoaWNoIGNvbnRhaW5zIGEgc2luZ2xlIHVuaXQgZm9yIHRoYXQgaG9zdCBiaW5kaW5nLlxuICovXG5leHBvcnQgY2xhc3MgSG9zdEJpbmRpbmdDb21waWxhdGlvbkpvYiBleHRlbmRzIENvbXBpbGF0aW9uSm9iIHtcbiAgY29uc3RydWN0b3IoY29tcG9uZW50TmFtZTogc3RyaW5nLCBwb29sOiBDb25zdGFudFBvb2wsIGNvbXBhdGliaWxpdHk6IGlyLkNvbXBhdGliaWxpdHlNb2RlKSB7XG4gICAgc3VwZXIoY29tcG9uZW50TmFtZSwgcG9vbCwgY29tcGF0aWJpbGl0eSk7XG4gICAgdGhpcy5yb290ID0gbmV3IEhvc3RCaW5kaW5nQ29tcGlsYXRpb25Vbml0KHRoaXMpO1xuICB9XG5cbiAgb3ZlcnJpZGUga2luZCA9IENvbXBpbGF0aW9uSm9iS2luZC5Ib3N0O1xuXG4gIG92ZXJyaWRlIHJlYWRvbmx5IGZuU3VmZml4OiBzdHJpbmcgPSAnSG9zdEJpbmRpbmdzJztcblxuICBvdmVycmlkZSByZWFkb25seSByb290OiBIb3N0QmluZGluZ0NvbXBpbGF0aW9uVW5pdDtcblxuICBvdmVycmlkZSBnZXQgdW5pdHMoKTogSXRlcmFibGU8SG9zdEJpbmRpbmdDb21waWxhdGlvblVuaXQ+IHtcbiAgICByZXR1cm4gW3RoaXMucm9vdF07XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEhvc3RCaW5kaW5nQ29tcGlsYXRpb25Vbml0IGV4dGVuZHMgQ29tcGlsYXRpb25Vbml0IHtcbiAgY29uc3RydWN0b3IocmVhZG9ubHkgam9iOiBIb3N0QmluZGluZ0NvbXBpbGF0aW9uSm9iKSB7XG4gICAgc3VwZXIoMCBhcyBpci5YcmVmSWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIE11Y2ggbGlrZSBhbiBlbGVtZW50IGNhbiBoYXZlIGF0dHJpYnV0ZXMsIHNvIGNhbiBhIGhvc3QgYmluZGluZyBmdW5jdGlvbi5cbiAgICovXG4gIGF0dHJpYnV0ZXM6IG8uTGl0ZXJhbEFycmF5RXhwciB8IG51bGwgPSBudWxsO1xufVxuIl19