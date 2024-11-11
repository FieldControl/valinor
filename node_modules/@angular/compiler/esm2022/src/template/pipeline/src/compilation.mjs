/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvdGVtcGxhdGUvcGlwZWxpbmUvc3JjL2NvbXBpbGF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUtILE9BQU8sS0FBSyxFQUFFLE1BQU0sT0FBTyxDQUFDO0FBRTVCLE1BQU0sQ0FBTixJQUFZLGtCQUlYO0FBSkQsV0FBWSxrQkFBa0I7SUFDNUIsMkRBQUksQ0FBQTtJQUNKLDJEQUFJLENBQUE7SUFDSiwyREFBSSxDQUFBO0FBQ04sQ0FBQyxFQUpXLGtCQUFrQixLQUFsQixrQkFBa0IsUUFJN0I7QUFFRDs7O0dBR0c7QUFDSCxNQUFNLE9BQWdCLGNBQWM7SUFDbEMsWUFDVyxhQUFxQixFQUNyQixJQUFrQixFQUNsQixhQUFtQztRQUZuQyxrQkFBYSxHQUFiLGFBQWEsQ0FBUTtRQUNyQixTQUFJLEdBQUosSUFBSSxDQUFjO1FBQ2xCLGtCQUFhLEdBQWIsYUFBYSxDQUFzQjtRQUc5QyxTQUFJLEdBQXVCLGtCQUFrQixDQUFDLElBQUksQ0FBQztRQTBCbkQ7O1dBRUc7UUFDSyxlQUFVLEdBQWMsQ0FBYyxDQUFDO0lBL0I1QyxDQUFDO0lBcUJKOztPQUVHO0lBQ0gsY0FBYztRQUNaLE9BQU8sSUFBSSxDQUFDLFVBQVUsRUFBZSxDQUFDO0lBQ3hDLENBQUM7Q0FNRjtBQUVEOzs7R0FHRztBQUNILE1BQU0sT0FBTyx1QkFBd0IsU0FBUSxjQUFjO0lBQ3pELFlBQ0UsYUFBcUIsRUFDckIsSUFBa0IsRUFDbEIsYUFBbUMsRUFDMUIsdUJBQStCLEVBQy9CLGtCQUEyQixFQUMzQixTQUFtQyxFQUNuQyxtQkFBeUM7UUFFbEQsS0FBSyxDQUFDLGFBQWEsRUFBRSxJQUFJLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFMakMsNEJBQXVCLEdBQXZCLHVCQUF1QixDQUFRO1FBQy9C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O1FBQ2pELEtBQUssQ0FBQyxDQUFjLENBQUMsQ0FBQztRQURILFFBQUcsR0FBSCxHQUFHLENBQTJCO1FBSW5EOztXQUVHO1FBQ0gsZUFBVSxHQUE4QixJQUFJLENBQUM7SUFMN0MsQ0FBQztDQU1GIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbnN0YW50UG9vbH0gZnJvbSAnLi4vLi4vLi4vY29uc3RhbnRfcG9vbCc7XG5pbXBvcnQgKiBhcyBvIGZyb20gJy4uLy4uLy4uL291dHB1dC9vdXRwdXRfYXN0JztcbmltcG9ydCB7UjNDb21wb25lbnREZWZlck1ldGFkYXRhfSBmcm9tICcuLi8uLi8uLi9yZW5kZXIzL3ZpZXcvYXBpJztcbmltcG9ydCAqIGFzIGlyIGZyb20gJy4uL2lyJztcblxuZXhwb3J0IGVudW0gQ29tcGlsYXRpb25Kb2JLaW5kIHtcbiAgVG1wbCxcbiAgSG9zdCxcbiAgQm90aCwgLy8gQSBzcGVjaWFsIHZhbHVlIHVzZWQgdG8gaW5kaWNhdGUgdGhhdCBzb21lIGxvZ2ljIGFwcGxpZXMgdG8gYm90aCBjb21waWxhdGlvbiB0eXBlc1xufVxuXG4vKipcbiAqIEFuIGVudGlyZSBvbmdvaW5nIGNvbXBpbGF0aW9uLCB3aGljaCB3aWxsIHJlc3VsdCBpbiBvbmUgb3IgbW9yZSB0ZW1wbGF0ZSBmdW5jdGlvbnMgd2hlbiBjb21wbGV0ZS5cbiAqIENvbnRhaW5zIG9uZSBvciBtb3JlIGNvcnJlc3BvbmRpbmcgY29tcGlsYXRpb24gdW5pdHMuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDb21waWxhdGlvbkpvYiB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHJlYWRvbmx5IGNvbXBvbmVudE5hbWU6IHN0cmluZyxcbiAgICByZWFkb25seSBwb29sOiBDb25zdGFudFBvb2wsXG4gICAgcmVhZG9ubHkgY29tcGF0aWJpbGl0eTogaXIuQ29tcGF0aWJpbGl0eU1vZGUsXG4gICkge31cblxuICBraW5kOiBDb21waWxhdGlvbkpvYktpbmQgPSBDb21waWxhdGlvbkpvYktpbmQuQm90aDtcblxuICAvKipcbiAgICogQSBjb21waWxhdGlvbiBqb2Igd2lsbCBjb250YWluIG9uZSBvciBtb3JlIGNvbXBpbGF0aW9uIHVuaXRzLlxuICAgKi9cbiAgYWJzdHJhY3QgZ2V0IHVuaXRzKCk6IEl0ZXJhYmxlPENvbXBpbGF0aW9uVW5pdD47XG5cbiAgLyoqXG4gICAqIFRoZSByb290IGNvbXBpbGF0aW9uIHVuaXQsIHN1Y2ggYXMgdGhlIGNvbXBvbmVudCdzIHRlbXBsYXRlLCBvciB0aGUgaG9zdCBiaW5kaW5nJ3MgY29tcGlsYXRpb25cbiAgICogdW5pdC5cbiAgICovXG4gIGFic3RyYWN0IHJvb3Q6IENvbXBpbGF0aW9uVW5pdDtcblxuICAvKipcbiAgICogQSB1bmlxdWUgc3RyaW5nIHVzZWQgdG8gaWRlbnRpZnkgdGhpcyBraW5kIG9mIGpvYiwgYW5kIGdlbmVyYXRlIHRoZSB0ZW1wbGF0ZSBmdW5jdGlvbiAoYXMgYVxuICAgKiBzdWZmaXggb2YgdGhlIG5hbWUpLlxuICAgKi9cbiAgYWJzdHJhY3QgZm5TdWZmaXg6IHN0cmluZztcblxuICAvKipcbiAgICogR2VuZXJhdGUgYSBuZXcgdW5pcXVlIGBpci5YcmVmSWRgIGluIHRoaXMgam9iLlxuICAgKi9cbiAgYWxsb2NhdGVYcmVmSWQoKTogaXIuWHJlZklkIHtcbiAgICByZXR1cm4gdGhpcy5uZXh0WHJlZklkKysgYXMgaXIuWHJlZklkO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyYWNrcyB0aGUgbmV4dCBgaXIuWHJlZklkYCB3aGljaCBjYW4gYmUgYXNzaWduZWQgYXMgdGVtcGxhdGUgc3RydWN0dXJlcyBhcmUgaW5nZXN0ZWQuXG4gICAqL1xuICBwcml2YXRlIG5leHRYcmVmSWQ6IGlyLlhyZWZJZCA9IDAgYXMgaXIuWHJlZklkO1xufVxuXG4vKipcbiAqIENvbXBpbGF0aW9uLWluLXByb2dyZXNzIG9mIGEgd2hvbGUgY29tcG9uZW50J3MgdGVtcGxhdGUsIGluY2x1ZGluZyB0aGUgbWFpbiB0ZW1wbGF0ZSBhbmQgYW55XG4gKiBlbWJlZGRlZCB2aWV3cyBvciBob3N0IGJpbmRpbmdzLlxuICovXG5leHBvcnQgY2xhc3MgQ29tcG9uZW50Q29tcGlsYXRpb25Kb2IgZXh0ZW5kcyBDb21waWxhdGlvbkpvYiB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIGNvbXBvbmVudE5hbWU6IHN0cmluZyxcbiAgICBwb29sOiBDb25zdGFudFBvb2wsXG4gICAgY29tcGF0aWJpbGl0eTogaXIuQ29tcGF0aWJpbGl0eU1vZGUsXG4gICAgcmVhZG9ubHkgcmVsYXRpdmVDb250ZXh0RmlsZVBhdGg6IHN0cmluZyxcbiAgICByZWFkb25seSBpMThuVXNlRXh0ZXJuYWxJZHM6IGJvb2xlYW4sXG4gICAgcmVhZG9ubHkgZGVmZXJNZXRhOiBSM0NvbXBvbmVudERlZmVyTWV0YWRhdGEsXG4gICAgcmVhZG9ubHkgYWxsRGVmZXJyYWJsZURlcHNGbjogby5SZWFkVmFyRXhwciB8IG51bGwsXG4gICkge1xuICAgIHN1cGVyKGNvbXBvbmVudE5hbWUsIHBvb2wsIGNvbXBhdGliaWxpdHkpO1xuICAgIHRoaXMucm9vdCA9IG5ldyBWaWV3Q29tcGlsYXRpb25Vbml0KHRoaXMsIHRoaXMuYWxsb2NhdGVYcmVmSWQoKSwgbnVsbCk7XG4gICAgdGhpcy52aWV3cy5zZXQodGhpcy5yb290LnhyZWYsIHRoaXMucm9vdCk7XG4gIH1cblxuICBvdmVycmlkZSBraW5kID0gQ29tcGlsYXRpb25Kb2JLaW5kLlRtcGw7XG5cbiAgb3ZlcnJpZGUgcmVhZG9ubHkgZm5TdWZmaXg6IHN0cmluZyA9ICdUZW1wbGF0ZSc7XG5cbiAgLyoqXG4gICAqIFRoZSByb290IHZpZXcsIHJlcHJlc2VudGluZyB0aGUgY29tcG9uZW50J3MgdGVtcGxhdGUuXG4gICAqL1xuICBvdmVycmlkZSByZWFkb25seSByb290OiBWaWV3Q29tcGlsYXRpb25Vbml0O1xuXG4gIHJlYWRvbmx5IHZpZXdzID0gbmV3IE1hcDxpci5YcmVmSWQsIFZpZXdDb21waWxhdGlvblVuaXQ+KCk7XG5cbiAgLyoqXG4gICAqIENhdXNlcyBuZ0NvbnRlbnRTZWxlY3RvcnMgdG8gYmUgZW1pdHRlZCwgZm9yIGNvbnRlbnQgcHJvamVjdGlvbiBzbG90cyBpbiB0aGUgdmlldy4gUG9zc2libHkgYVxuICAgKiByZWZlcmVuY2UgaW50byB0aGUgY29uc3RhbnQgcG9vbC5cbiAgICovXG4gIHB1YmxpYyBjb250ZW50U2VsZWN0b3JzOiBvLkV4cHJlc3Npb24gfCBudWxsID0gbnVsbDtcblxuICAvKipcbiAgICogQWRkIGEgYFZpZXdDb21waWxhdGlvbmAgZm9yIGEgbmV3IGVtYmVkZGVkIHZpZXcgdG8gdGhpcyBjb21waWxhdGlvbi5cbiAgICovXG4gIGFsbG9jYXRlVmlldyhwYXJlbnQ6IGlyLlhyZWZJZCk6IFZpZXdDb21waWxhdGlvblVuaXQge1xuICAgIGNvbnN0IHZpZXcgPSBuZXcgVmlld0NvbXBpbGF0aW9uVW5pdCh0aGlzLCB0aGlzLmFsbG9jYXRlWHJlZklkKCksIHBhcmVudCk7XG4gICAgdGhpcy52aWV3cy5zZXQodmlldy54cmVmLCB2aWV3KTtcbiAgICByZXR1cm4gdmlldztcbiAgfVxuXG4gIG92ZXJyaWRlIGdldCB1bml0cygpOiBJdGVyYWJsZTxWaWV3Q29tcGlsYXRpb25Vbml0PiB7XG4gICAgcmV0dXJuIHRoaXMudmlld3MudmFsdWVzKCk7XG4gIH1cblxuICAvKipcbiAgICogQWRkIGEgY29uc3RhbnQgYG8uRXhwcmVzc2lvbmAgdG8gdGhlIGNvbXBpbGF0aW9uIGFuZCByZXR1cm4gaXRzIGluZGV4IGluIHRoZSBgY29uc3RzYCBhcnJheS5cbiAgICovXG4gIGFkZENvbnN0KG5ld0NvbnN0OiBvLkV4cHJlc3Npb24sIGluaXRpYWxpemVycz86IG8uU3RhdGVtZW50W10pOiBpci5Db25zdEluZGV4IHtcbiAgICBmb3IgKGxldCBpZHggPSAwOyBpZHggPCB0aGlzLmNvbnN0cy5sZW5ndGg7IGlkeCsrKSB7XG4gICAgICBpZiAodGhpcy5jb25zdHNbaWR4XS5pc0VxdWl2YWxlbnQobmV3Q29uc3QpKSB7XG4gICAgICAgIHJldHVybiBpZHggYXMgaXIuQ29uc3RJbmRleDtcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgaWR4ID0gdGhpcy5jb25zdHMubGVuZ3RoO1xuICAgIHRoaXMuY29uc3RzLnB1c2gobmV3Q29uc3QpO1xuICAgIGlmIChpbml0aWFsaXplcnMpIHtcbiAgICAgIHRoaXMuY29uc3RzSW5pdGlhbGl6ZXJzLnB1c2goLi4uaW5pdGlhbGl6ZXJzKTtcbiAgICB9XG4gICAgcmV0dXJuIGlkeCBhcyBpci5Db25zdEluZGV4O1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnN0YW50IGV4cHJlc3Npb25zIHVzZWQgYnkgb3BlcmF0aW9ucyB3aXRoaW4gdGhpcyBjb21wb25lbnQncyBjb21waWxhdGlvbi5cbiAgICpcbiAgICogVGhpcyB3aWxsIGV2ZW50dWFsbHkgYmVjb21lIHRoZSBgY29uc3RzYCBhcnJheSBpbiB0aGUgY29tcG9uZW50IGRlZmluaXRpb24uXG4gICAqL1xuICByZWFkb25seSBjb25zdHM6IG8uRXhwcmVzc2lvbltdID0gW107XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemF0aW9uIHN0YXRlbWVudHMgbmVlZGVkIHRvIHNldCB1cCB0aGUgY29uc3RzLlxuICAgKi9cbiAgcmVhZG9ubHkgY29uc3RzSW5pdGlhbGl6ZXJzOiBvLlN0YXRlbWVudFtdID0gW107XG59XG5cbi8qKlxuICogQSBjb21waWxhdGlvbiB1bml0IGlzIGNvbXBpbGVkIGludG8gYSB0ZW1wbGF0ZSBmdW5jdGlvbi4gU29tZSBleGFtcGxlIHVuaXRzIGFyZSB2aWV3cyBhbmQgaG9zdFxuICogYmluZGluZ3MuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDb21waWxhdGlvblVuaXQge1xuICBjb25zdHJ1Y3RvcihyZWFkb25seSB4cmVmOiBpci5YcmVmSWQpIHt9XG5cbiAgLyoqXG4gICAqIExpc3Qgb2YgY3JlYXRpb24gb3BlcmF0aW9ucyBmb3IgdGhpcyB2aWV3LlxuICAgKlxuICAgKiBDcmVhdGlvbiBvcGVyYXRpb25zIG1heSBpbnRlcm5hbGx5IGNvbnRhaW4gb3RoZXIgb3BlcmF0aW9ucywgaW5jbHVkaW5nIHVwZGF0ZSBvcGVyYXRpb25zLlxuICAgKi9cbiAgcmVhZG9ubHkgY3JlYXRlID0gbmV3IGlyLk9wTGlzdDxpci5DcmVhdGVPcD4oKTtcblxuICAvKipcbiAgICogTGlzdCBvZiB1cGRhdGUgb3BlcmF0aW9ucyBmb3IgdGhpcyB2aWV3LlxuICAgKi9cbiAgcmVhZG9ubHkgdXBkYXRlID0gbmV3IGlyLk9wTGlzdDxpci5VcGRhdGVPcD4oKTtcblxuICAvKipcbiAgICogVGhlIGVuY2xvc2luZyBqb2IsIHdoaWNoIG1pZ2h0IGNvbnRhaW4gc2V2ZXJhbCBpbmRpdmlkdWFsIGNvbXBpbGF0aW9uIHVuaXRzLlxuICAgKi9cbiAgYWJzdHJhY3QgcmVhZG9ubHkgam9iOiBDb21waWxhdGlvbkpvYjtcblxuICAvKipcbiAgICogTmFtZSBvZiB0aGUgZnVuY3Rpb24gd2hpY2ggd2lsbCBiZSBnZW5lcmF0ZWQgZm9yIHRoaXMgdW5pdC5cbiAgICpcbiAgICogTWF5IGJlIGBudWxsYCBpZiBub3QgeWV0IGRldGVybWluZWQuXG4gICAqL1xuICBmbk5hbWU6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBOdW1iZXIgb2YgdmFyaWFibGUgc2xvdHMgdXNlZCB3aXRoaW4gdGhpcyB2aWV3LCBvciBgbnVsbGAgaWYgdmFyaWFibGVzIGhhdmUgbm90IHlldCBiZWVuXG4gICAqIGNvdW50ZWQuXG4gICAqL1xuICB2YXJzOiBudW1iZXIgfCBudWxsID0gbnVsbDtcblxuICAvKipcbiAgICogSXRlcmF0ZSBvdmVyIGFsbCBgaXIuT3BgcyB3aXRoaW4gdGhpcyB2aWV3LlxuICAgKlxuICAgKiBTb21lIG9wZXJhdGlvbnMgbWF5IGhhdmUgY2hpbGQgb3BlcmF0aW9ucywgd2hpY2ggdGhpcyBpdGVyYXRvciB3aWxsIHZpc2l0LlxuICAgKi9cbiAgKm9wcygpOiBHZW5lcmF0b3I8aXIuQ3JlYXRlT3AgfCBpci5VcGRhdGVPcD4ge1xuICAgIGZvciAoY29uc3Qgb3Agb2YgdGhpcy5jcmVhdGUpIHtcbiAgICAgIHlpZWxkIG9wO1xuICAgICAgaWYgKG9wLmtpbmQgPT09IGlyLk9wS2luZC5MaXN0ZW5lciB8fCBvcC5raW5kID09PSBpci5PcEtpbmQuVHdvV2F5TGlzdGVuZXIpIHtcbiAgICAgICAgZm9yIChjb25zdCBsaXN0ZW5lck9wIG9mIG9wLmhhbmRsZXJPcHMpIHtcbiAgICAgICAgICB5aWVsZCBsaXN0ZW5lck9wO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGZvciAoY29uc3Qgb3Agb2YgdGhpcy51cGRhdGUpIHtcbiAgICAgIHlpZWxkIG9wO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIENvbXBpbGF0aW9uLWluLXByb2dyZXNzIG9mIGFuIGluZGl2aWR1YWwgdmlldyB3aXRoaW4gYSB0ZW1wbGF0ZS5cbiAqL1xuZXhwb3J0IGNsYXNzIFZpZXdDb21waWxhdGlvblVuaXQgZXh0ZW5kcyBDb21waWxhdGlvblVuaXQge1xuICBjb25zdHJ1Y3RvcihcbiAgICByZWFkb25seSBqb2I6IENvbXBvbmVudENvbXBpbGF0aW9uSm9iLFxuICAgIHhyZWY6IGlyLlhyZWZJZCxcbiAgICByZWFkb25seSBwYXJlbnQ6IGlyLlhyZWZJZCB8IG51bGwsXG4gICkge1xuICAgIHN1cGVyKHhyZWYpO1xuICB9XG5cbiAgLyoqXG4gICAqIE1hcCBvZiBkZWNsYXJlZCB2YXJpYWJsZXMgYXZhaWxhYmxlIHdpdGhpbiB0aGlzIHZpZXcgdG8gdGhlIHByb3BlcnR5IG9uIHRoZSBjb250ZXh0IG9iamVjdFxuICAgKiB3aGljaCB0aGV5IGFsaWFzLlxuICAgKi9cbiAgcmVhZG9ubHkgY29udGV4dFZhcmlhYmxlcyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG5cbiAgLyoqXG4gICAqIFNldCBvZiBhbGlhc2VzIGF2YWlsYWJsZSB3aXRoaW4gdGhpcyB2aWV3LiBBbiBhbGlhcyBpcyBhIHZhcmlhYmxlIHdob3NlIHByb3ZpZGVkIGV4cHJlc3Npb24gaXNcbiAgICogaW5saW5lZCBhdCBldmVyeSBsb2NhdGlvbiBpdCBpcyB1c2VkLiBJdCBtYXkgYWxzbyBkZXBlbmQgb24gY29udGV4dCB2YXJpYWJsZXMsIGJ5IG5hbWUuXG4gICAqL1xuICByZWFkb25seSBhbGlhc2VzID0gbmV3IFNldDxpci5BbGlhc1ZhcmlhYmxlPigpO1xuXG4gIC8qKlxuICAgKiBOdW1iZXIgb2YgZGVjbGFyYXRpb24gc2xvdHMgdXNlZCB3aXRoaW4gdGhpcyB2aWV3LCBvciBgbnVsbGAgaWYgc2xvdHMgaGF2ZSBub3QgeWV0IGJlZW5cbiAgICogYWxsb2NhdGVkLlxuICAgKi9cbiAgZGVjbHM6IG51bWJlciB8IG51bGwgPSBudWxsO1xufVxuXG4vKipcbiAqIENvbXBpbGF0aW9uLWluLXByb2dyZXNzIG9mIGEgaG9zdCBiaW5kaW5nLCB3aGljaCBjb250YWlucyBhIHNpbmdsZSB1bml0IGZvciB0aGF0IGhvc3QgYmluZGluZy5cbiAqL1xuZXhwb3J0IGNsYXNzIEhvc3RCaW5kaW5nQ29tcGlsYXRpb25Kb2IgZXh0ZW5kcyBDb21waWxhdGlvbkpvYiB7XG4gIGNvbnN0cnVjdG9yKGNvbXBvbmVudE5hbWU6IHN0cmluZywgcG9vbDogQ29uc3RhbnRQb29sLCBjb21wYXRpYmlsaXR5OiBpci5Db21wYXRpYmlsaXR5TW9kZSkge1xuICAgIHN1cGVyKGNvbXBvbmVudE5hbWUsIHBvb2wsIGNvbXBhdGliaWxpdHkpO1xuICAgIHRoaXMucm9vdCA9IG5ldyBIb3N0QmluZGluZ0NvbXBpbGF0aW9uVW5pdCh0aGlzKTtcbiAgfVxuXG4gIG92ZXJyaWRlIGtpbmQgPSBDb21waWxhdGlvbkpvYktpbmQuSG9zdDtcblxuICBvdmVycmlkZSByZWFkb25seSBmblN1ZmZpeDogc3RyaW5nID0gJ0hvc3RCaW5kaW5ncyc7XG5cbiAgb3ZlcnJpZGUgcmVhZG9ubHkgcm9vdDogSG9zdEJpbmRpbmdDb21waWxhdGlvblVuaXQ7XG5cbiAgb3ZlcnJpZGUgZ2V0IHVuaXRzKCk6IEl0ZXJhYmxlPEhvc3RCaW5kaW5nQ29tcGlsYXRpb25Vbml0PiB7XG4gICAgcmV0dXJuIFt0aGlzLnJvb3RdO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBIb3N0QmluZGluZ0NvbXBpbGF0aW9uVW5pdCBleHRlbmRzIENvbXBpbGF0aW9uVW5pdCB7XG4gIGNvbnN0cnVjdG9yKHJlYWRvbmx5IGpvYjogSG9zdEJpbmRpbmdDb21waWxhdGlvbkpvYikge1xuICAgIHN1cGVyKDAgYXMgaXIuWHJlZklkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNdWNoIGxpa2UgYW4gZWxlbWVudCBjYW4gaGF2ZSBhdHRyaWJ1dGVzLCBzbyBjYW4gYSBob3N0IGJpbmRpbmcgZnVuY3Rpb24uXG4gICAqL1xuICBhdHRyaWJ1dGVzOiBvLkxpdGVyYWxBcnJheUV4cHIgfCBudWxsID0gbnVsbDtcbn1cbiJdfQ==