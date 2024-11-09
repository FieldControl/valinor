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
    constructor(componentName, pool, compatibility, relativeContextFilePath, i18nUseExternalIds, deferBlocksMeta, allDeferrableDepsFn) {
        super(componentName, pool, compatibility);
        this.relativeContextFilePath = relativeContextFilePath;
        this.i18nUseExternalIds = i18nUseExternalIds;
        this.deferBlocksMeta = deferBlocksMeta;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvdGVtcGxhdGUvcGlwZWxpbmUvc3JjL2NvbXBpbGF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQU1ILE9BQU8sS0FBSyxFQUFFLE1BQU0sT0FBTyxDQUFDO0FBRTVCLE1BQU0sQ0FBTixJQUFZLGtCQUlYO0FBSkQsV0FBWSxrQkFBa0I7SUFDNUIsMkRBQUksQ0FBQTtJQUNKLDJEQUFJLENBQUE7SUFDSiwyREFBSSxDQUFBO0FBQ04sQ0FBQyxFQUpXLGtCQUFrQixLQUFsQixrQkFBa0IsUUFJN0I7QUFFRDs7O0dBR0c7QUFDSCxNQUFNLE9BQWdCLGNBQWM7SUFDbEMsWUFDYSxhQUFxQixFQUFXLElBQWtCLEVBQ2xELGFBQW1DO1FBRG5DLGtCQUFhLEdBQWIsYUFBYSxDQUFRO1FBQVcsU0FBSSxHQUFKLElBQUksQ0FBYztRQUNsRCxrQkFBYSxHQUFiLGFBQWEsQ0FBc0I7UUFFaEQsU0FBSSxHQUF1QixrQkFBa0IsQ0FBQyxJQUFJLENBQUM7UUEwQm5EOztXQUVHO1FBQ0ssZUFBVSxHQUFjLENBQWMsQ0FBQztJQS9CSSxDQUFDO0lBcUJwRDs7T0FFRztJQUNILGNBQWM7UUFDWixPQUFPLElBQUksQ0FBQyxVQUFVLEVBQWUsQ0FBQztJQUN4QyxDQUFDO0NBTUY7QUFFRDs7O0dBR0c7QUFDSCxNQUFNLE9BQU8sdUJBQXdCLFNBQVEsY0FBYztJQUN6RCxZQUNJLGFBQXFCLEVBQUUsSUFBa0IsRUFBRSxhQUFtQyxFQUNyRSx1QkFBK0IsRUFBVyxrQkFBMkIsRUFDckUsZUFBMkQsRUFDM0QsbUJBQXVDO1FBQ2xELEtBQUssQ0FBQyxhQUFhLEVBQUUsSUFBSSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBSC9CLDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBUTtRQUFXLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBUztRQUNyRSxvQkFBZSxHQUFmLGVBQWUsQ0FBNEM7UUFDM0Qsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFvQjtRQU0zQyxTQUFJLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxDQUFDO1FBRXRCLGFBQVEsR0FBVyxVQUFVLENBQUM7UUFPdkMsVUFBSyxHQUFHLElBQUksR0FBRyxFQUFrQyxDQUFDO1FBRTNEOzs7V0FHRztRQUNJLHFCQUFnQixHQUFzQixJQUFJLENBQUM7UUFnQ2xEOzs7O1dBSUc7UUFDTSxXQUFNLEdBQW1CLEVBQUUsQ0FBQztRQUVyQzs7V0FFRztRQUNNLHVCQUFrQixHQUFrQixFQUFFLENBQUM7UUE3RDlDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3ZFLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBbUJEOztPQUVHO0lBQ0gsWUFBWSxDQUFDLE1BQWlCO1FBQzVCLE1BQU0sSUFBSSxHQUFHLElBQUksbUJBQW1CLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUMxRSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2hDLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELElBQWEsS0FBSztRQUNoQixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDN0IsQ0FBQztJQUVEOztPQUVHO0lBQ0gsUUFBUSxDQUFDLFFBQXNCLEVBQUUsWUFBNEI7UUFDM0QsS0FBSyxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUM7WUFDbEQsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO2dCQUM1QyxPQUFPLEdBQW9CLENBQUM7WUFDOUIsQ0FBQztRQUNILENBQUM7UUFDRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUMvQixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMzQixJQUFJLFlBQVksRUFBRSxDQUFDO1lBQ2pCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxZQUFZLENBQUMsQ0FBQztRQUNoRCxDQUFDO1FBQ0QsT0FBTyxHQUFvQixDQUFDO0lBQzlCLENBQUM7Q0FhRjtBQUVEOzs7R0FHRztBQUNILE1BQU0sT0FBZ0IsZUFBZTtJQUNuQyxZQUFxQixJQUFlO1FBQWYsU0FBSSxHQUFKLElBQUksQ0FBVztRQUVwQzs7OztXQUlHO1FBQ00sV0FBTSxHQUFHLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBZSxDQUFDO1FBRS9DOztXQUVHO1FBQ00sV0FBTSxHQUFHLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBZSxDQUFDO1FBTy9DOzs7O1dBSUc7UUFDSCxXQUFNLEdBQWdCLElBQUksQ0FBQztRQUUzQjs7O1dBR0c7UUFDSCxTQUFJLEdBQWdCLElBQUksQ0FBQztJQTlCYyxDQUFDO0lBZ0N4Qzs7OztPQUlHO0lBQ0gsQ0FBRSxHQUFHO1FBQ0gsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDN0IsTUFBTSxFQUFFLENBQUM7WUFDVCxJQUFJLEVBQUUsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUMzRSxLQUFLLE1BQU0sVUFBVSxJQUFJLEVBQUUsQ0FBQyxVQUFVLEVBQUUsQ0FBQztvQkFDdkMsTUFBTSxVQUFVLENBQUM7Z0JBQ25CLENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQztRQUNELEtBQUssTUFBTSxFQUFFLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzdCLE1BQU0sRUFBRSxDQUFDO1FBQ1gsQ0FBQztJQUNILENBQUM7Q0FDRjtBQUVEOztHQUVHO0FBQ0gsTUFBTSxPQUFPLG1CQUFvQixTQUFRLGVBQWU7SUFDdEQsWUFDYSxHQUE0QixFQUFFLElBQWUsRUFBVyxNQUFzQjtRQUN6RixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFERCxRQUFHLEdBQUgsR0FBRyxDQUF5QjtRQUE0QixXQUFNLEdBQU4sTUFBTSxDQUFnQjtRQUkzRjs7O1dBR0c7UUFDTSxxQkFBZ0IsR0FBRyxJQUFJLEdBQUcsRUFBa0IsQ0FBQztRQUV0RDs7O1dBR0c7UUFDTSxZQUFPLEdBQUcsSUFBSSxHQUFHLEVBQW9CLENBQUM7UUFFL0M7OztXQUdHO1FBQ0gsVUFBSyxHQUFnQixJQUFJLENBQUM7SUFsQjFCLENBQUM7Q0FtQkY7QUFFRDs7R0FFRztBQUNILE1BQU0sT0FBTyx5QkFBMEIsU0FBUSxjQUFjO0lBQzNELFlBQVksYUFBcUIsRUFBRSxJQUFrQixFQUFFLGFBQW1DO1FBQ3hGLEtBQUssQ0FBQyxhQUFhLEVBQUUsSUFBSSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBSW5DLFNBQUksR0FBRyxrQkFBa0IsQ0FBQyxJQUFJLENBQUM7UUFFdEIsYUFBUSxHQUFXLGNBQWMsQ0FBQztRQUxsRCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksMEJBQTBCLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbkQsQ0FBQztJQVFELElBQWEsS0FBSztRQUNoQixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3JCLENBQUM7Q0FDRjtBQUVELE1BQU0sT0FBTywwQkFBMkIsU0FBUSxlQUFlO0lBQzdELFlBQXFCLEdBQThCO1FBQ2pELEtBQUssQ0FBQyxDQUFjLENBQUMsQ0FBQztRQURILFFBQUcsR0FBSCxHQUFHLENBQTJCO1FBSW5EOztXQUVHO1FBQ0gsZUFBVSxHQUE0QixJQUFJLENBQUM7SUFMM0MsQ0FBQztDQU1GIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q29uc3RhbnRQb29sfSBmcm9tICcuLi8uLi8uLi9jb25zdGFudF9wb29sJztcbmltcG9ydCAqIGFzIG8gZnJvbSAnLi4vLi4vLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0ICogYXMgdCBmcm9tICcuLi8uLi8uLi9yZW5kZXIzL3IzX2FzdCc7XG5pbXBvcnQge1IzRGVmZXJCbG9ja01ldGFkYXRhfSBmcm9tICcuLi8uLi8uLi9yZW5kZXIzL3ZpZXcvYXBpJztcbmltcG9ydCAqIGFzIGlyIGZyb20gJy4uL2lyJztcblxuZXhwb3J0IGVudW0gQ29tcGlsYXRpb25Kb2JLaW5kIHtcbiAgVG1wbCxcbiAgSG9zdCxcbiAgQm90aCwgIC8vIEEgc3BlY2lhbCB2YWx1ZSB1c2VkIHRvIGluZGljYXRlIHRoYXQgc29tZSBsb2dpYyBhcHBsaWVzIHRvIGJvdGggY29tcGlsYXRpb24gdHlwZXNcbn1cblxuLyoqXG4gKiBBbiBlbnRpcmUgb25nb2luZyBjb21waWxhdGlvbiwgd2hpY2ggd2lsbCByZXN1bHQgaW4gb25lIG9yIG1vcmUgdGVtcGxhdGUgZnVuY3Rpb25zIHdoZW4gY29tcGxldGUuXG4gKiBDb250YWlucyBvbmUgb3IgbW9yZSBjb3JyZXNwb25kaW5nIGNvbXBpbGF0aW9uIHVuaXRzLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ29tcGlsYXRpb25Kb2Ige1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHJlYWRvbmx5IGNvbXBvbmVudE5hbWU6IHN0cmluZywgcmVhZG9ubHkgcG9vbDogQ29uc3RhbnRQb29sLFxuICAgICAgcmVhZG9ubHkgY29tcGF0aWJpbGl0eTogaXIuQ29tcGF0aWJpbGl0eU1vZGUpIHt9XG5cbiAga2luZDogQ29tcGlsYXRpb25Kb2JLaW5kID0gQ29tcGlsYXRpb25Kb2JLaW5kLkJvdGg7XG5cbiAgLyoqXG4gICAqIEEgY29tcGlsYXRpb24gam9iIHdpbGwgY29udGFpbiBvbmUgb3IgbW9yZSBjb21waWxhdGlvbiB1bml0cy5cbiAgICovXG4gIGFic3RyYWN0IGdldCB1bml0cygpOiBJdGVyYWJsZTxDb21waWxhdGlvblVuaXQ+O1xuXG4gIC8qKlxuICAgKiBUaGUgcm9vdCBjb21waWxhdGlvbiB1bml0LCBzdWNoIGFzIHRoZSBjb21wb25lbnQncyB0ZW1wbGF0ZSwgb3IgdGhlIGhvc3QgYmluZGluZydzIGNvbXBpbGF0aW9uXG4gICAqIHVuaXQuXG4gICAqL1xuICBhYnN0cmFjdCByb290OiBDb21waWxhdGlvblVuaXQ7XG5cbiAgLyoqXG4gICAqIEEgdW5pcXVlIHN0cmluZyB1c2VkIHRvIGlkZW50aWZ5IHRoaXMga2luZCBvZiBqb2IsIGFuZCBnZW5lcmF0ZSB0aGUgdGVtcGxhdGUgZnVuY3Rpb24gKGFzIGFcbiAgICogc3VmZml4IG9mIHRoZSBuYW1lKS5cbiAgICovXG4gIGFic3RyYWN0IGZuU3VmZml4OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgbmV3IHVuaXF1ZSBgaXIuWHJlZklkYCBpbiB0aGlzIGpvYi5cbiAgICovXG4gIGFsbG9jYXRlWHJlZklkKCk6IGlyLlhyZWZJZCB7XG4gICAgcmV0dXJuIHRoaXMubmV4dFhyZWZJZCsrIGFzIGlyLlhyZWZJZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmFja3MgdGhlIG5leHQgYGlyLlhyZWZJZGAgd2hpY2ggY2FuIGJlIGFzc2lnbmVkIGFzIHRlbXBsYXRlIHN0cnVjdHVyZXMgYXJlIGluZ2VzdGVkLlxuICAgKi9cbiAgcHJpdmF0ZSBuZXh0WHJlZklkOiBpci5YcmVmSWQgPSAwIGFzIGlyLlhyZWZJZDtcbn1cblxuLyoqXG4gKiBDb21waWxhdGlvbi1pbi1wcm9ncmVzcyBvZiBhIHdob2xlIGNvbXBvbmVudCdzIHRlbXBsYXRlLCBpbmNsdWRpbmcgdGhlIG1haW4gdGVtcGxhdGUgYW5kIGFueVxuICogZW1iZWRkZWQgdmlld3Mgb3IgaG9zdCBiaW5kaW5ncy5cbiAqL1xuZXhwb3J0IGNsYXNzIENvbXBvbmVudENvbXBpbGF0aW9uSm9iIGV4dGVuZHMgQ29tcGlsYXRpb25Kb2Ige1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIGNvbXBvbmVudE5hbWU6IHN0cmluZywgcG9vbDogQ29uc3RhbnRQb29sLCBjb21wYXRpYmlsaXR5OiBpci5Db21wYXRpYmlsaXR5TW9kZSxcbiAgICAgIHJlYWRvbmx5IHJlbGF0aXZlQ29udGV4dEZpbGVQYXRoOiBzdHJpbmcsIHJlYWRvbmx5IGkxOG5Vc2VFeHRlcm5hbElkczogYm9vbGVhbixcbiAgICAgIHJlYWRvbmx5IGRlZmVyQmxvY2tzTWV0YTogTWFwPHQuRGVmZXJyZWRCbG9jaywgUjNEZWZlckJsb2NrTWV0YWRhdGE+LFxuICAgICAgcmVhZG9ubHkgYWxsRGVmZXJyYWJsZURlcHNGbjogby5SZWFkVmFyRXhwcnxudWxsKSB7XG4gICAgc3VwZXIoY29tcG9uZW50TmFtZSwgcG9vbCwgY29tcGF0aWJpbGl0eSk7XG4gICAgdGhpcy5yb290ID0gbmV3IFZpZXdDb21waWxhdGlvblVuaXQodGhpcywgdGhpcy5hbGxvY2F0ZVhyZWZJZCgpLCBudWxsKTtcbiAgICB0aGlzLnZpZXdzLnNldCh0aGlzLnJvb3QueHJlZiwgdGhpcy5yb290KTtcbiAgfVxuXG4gIG92ZXJyaWRlIGtpbmQgPSBDb21waWxhdGlvbkpvYktpbmQuVG1wbDtcblxuICBvdmVycmlkZSByZWFkb25seSBmblN1ZmZpeDogc3RyaW5nID0gJ1RlbXBsYXRlJztcblxuICAvKipcbiAgICogVGhlIHJvb3QgdmlldywgcmVwcmVzZW50aW5nIHRoZSBjb21wb25lbnQncyB0ZW1wbGF0ZS5cbiAgICovXG4gIG92ZXJyaWRlIHJlYWRvbmx5IHJvb3Q6IFZpZXdDb21waWxhdGlvblVuaXQ7XG5cbiAgcmVhZG9ubHkgdmlld3MgPSBuZXcgTWFwPGlyLlhyZWZJZCwgVmlld0NvbXBpbGF0aW9uVW5pdD4oKTtcblxuICAvKipcbiAgICogQ2F1c2VzIG5nQ29udGVudFNlbGVjdG9ycyB0byBiZSBlbWl0dGVkLCBmb3IgY29udGVudCBwcm9qZWN0aW9uIHNsb3RzIGluIHRoZSB2aWV3LiBQb3NzaWJseSBhXG4gICAqIHJlZmVyZW5jZSBpbnRvIHRoZSBjb25zdGFudCBwb29sLlxuICAgKi9cbiAgcHVibGljIGNvbnRlbnRTZWxlY3RvcnM6IG8uRXhwcmVzc2lvbnxudWxsID0gbnVsbDtcblxuICAvKipcbiAgICogQWRkIGEgYFZpZXdDb21waWxhdGlvbmAgZm9yIGEgbmV3IGVtYmVkZGVkIHZpZXcgdG8gdGhpcyBjb21waWxhdGlvbi5cbiAgICovXG4gIGFsbG9jYXRlVmlldyhwYXJlbnQ6IGlyLlhyZWZJZCk6IFZpZXdDb21waWxhdGlvblVuaXQge1xuICAgIGNvbnN0IHZpZXcgPSBuZXcgVmlld0NvbXBpbGF0aW9uVW5pdCh0aGlzLCB0aGlzLmFsbG9jYXRlWHJlZklkKCksIHBhcmVudCk7XG4gICAgdGhpcy52aWV3cy5zZXQodmlldy54cmVmLCB2aWV3KTtcbiAgICByZXR1cm4gdmlldztcbiAgfVxuXG4gIG92ZXJyaWRlIGdldCB1bml0cygpOiBJdGVyYWJsZTxWaWV3Q29tcGlsYXRpb25Vbml0PiB7XG4gICAgcmV0dXJuIHRoaXMudmlld3MudmFsdWVzKCk7XG4gIH1cblxuICAvKipcbiAgICogQWRkIGEgY29uc3RhbnQgYG8uRXhwcmVzc2lvbmAgdG8gdGhlIGNvbXBpbGF0aW9uIGFuZCByZXR1cm4gaXRzIGluZGV4IGluIHRoZSBgY29uc3RzYCBhcnJheS5cbiAgICovXG4gIGFkZENvbnN0KG5ld0NvbnN0OiBvLkV4cHJlc3Npb24sIGluaXRpYWxpemVycz86IG8uU3RhdGVtZW50W10pOiBpci5Db25zdEluZGV4IHtcbiAgICBmb3IgKGxldCBpZHggPSAwOyBpZHggPCB0aGlzLmNvbnN0cy5sZW5ndGg7IGlkeCsrKSB7XG4gICAgICBpZiAodGhpcy5jb25zdHNbaWR4XS5pc0VxdWl2YWxlbnQobmV3Q29uc3QpKSB7XG4gICAgICAgIHJldHVybiBpZHggYXMgaXIuQ29uc3RJbmRleDtcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgaWR4ID0gdGhpcy5jb25zdHMubGVuZ3RoO1xuICAgIHRoaXMuY29uc3RzLnB1c2gobmV3Q29uc3QpO1xuICAgIGlmIChpbml0aWFsaXplcnMpIHtcbiAgICAgIHRoaXMuY29uc3RzSW5pdGlhbGl6ZXJzLnB1c2goLi4uaW5pdGlhbGl6ZXJzKTtcbiAgICB9XG4gICAgcmV0dXJuIGlkeCBhcyBpci5Db25zdEluZGV4O1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnN0YW50IGV4cHJlc3Npb25zIHVzZWQgYnkgb3BlcmF0aW9ucyB3aXRoaW4gdGhpcyBjb21wb25lbnQncyBjb21waWxhdGlvbi5cbiAgICpcbiAgICogVGhpcyB3aWxsIGV2ZW50dWFsbHkgYmVjb21lIHRoZSBgY29uc3RzYCBhcnJheSBpbiB0aGUgY29tcG9uZW50IGRlZmluaXRpb24uXG4gICAqL1xuICByZWFkb25seSBjb25zdHM6IG8uRXhwcmVzc2lvbltdID0gW107XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemF0aW9uIHN0YXRlbWVudHMgbmVlZGVkIHRvIHNldCB1cCB0aGUgY29uc3RzLlxuICAgKi9cbiAgcmVhZG9ubHkgY29uc3RzSW5pdGlhbGl6ZXJzOiBvLlN0YXRlbWVudFtdID0gW107XG59XG5cbi8qKlxuICogQSBjb21waWxhdGlvbiB1bml0IGlzIGNvbXBpbGVkIGludG8gYSB0ZW1wbGF0ZSBmdW5jdGlvbi4gU29tZSBleGFtcGxlIHVuaXRzIGFyZSB2aWV3cyBhbmQgaG9zdFxuICogYmluZGluZ3MuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDb21waWxhdGlvblVuaXQge1xuICBjb25zdHJ1Y3RvcihyZWFkb25seSB4cmVmOiBpci5YcmVmSWQpIHt9XG5cbiAgLyoqXG4gICAqIExpc3Qgb2YgY3JlYXRpb24gb3BlcmF0aW9ucyBmb3IgdGhpcyB2aWV3LlxuICAgKlxuICAgKiBDcmVhdGlvbiBvcGVyYXRpb25zIG1heSBpbnRlcm5hbGx5IGNvbnRhaW4gb3RoZXIgb3BlcmF0aW9ucywgaW5jbHVkaW5nIHVwZGF0ZSBvcGVyYXRpb25zLlxuICAgKi9cbiAgcmVhZG9ubHkgY3JlYXRlID0gbmV3IGlyLk9wTGlzdDxpci5DcmVhdGVPcD4oKTtcblxuICAvKipcbiAgICogTGlzdCBvZiB1cGRhdGUgb3BlcmF0aW9ucyBmb3IgdGhpcyB2aWV3LlxuICAgKi9cbiAgcmVhZG9ubHkgdXBkYXRlID0gbmV3IGlyLk9wTGlzdDxpci5VcGRhdGVPcD4oKTtcblxuICAvKipcbiAgICogVGhlIGVuY2xvc2luZyBqb2IsIHdoaWNoIG1pZ2h0IGNvbnRhaW4gc2V2ZXJhbCBpbmRpdmlkdWFsIGNvbXBpbGF0aW9uIHVuaXRzLlxuICAgKi9cbiAgYWJzdHJhY3QgcmVhZG9ubHkgam9iOiBDb21waWxhdGlvbkpvYjtcblxuICAvKipcbiAgICogTmFtZSBvZiB0aGUgZnVuY3Rpb24gd2hpY2ggd2lsbCBiZSBnZW5lcmF0ZWQgZm9yIHRoaXMgdW5pdC5cbiAgICpcbiAgICogTWF5IGJlIGBudWxsYCBpZiBub3QgeWV0IGRldGVybWluZWQuXG4gICAqL1xuICBmbk5hbWU6IHN0cmluZ3xudWxsID0gbnVsbDtcblxuICAvKipcbiAgICogTnVtYmVyIG9mIHZhcmlhYmxlIHNsb3RzIHVzZWQgd2l0aGluIHRoaXMgdmlldywgb3IgYG51bGxgIGlmIHZhcmlhYmxlcyBoYXZlIG5vdCB5ZXQgYmVlblxuICAgKiBjb3VudGVkLlxuICAgKi9cbiAgdmFyczogbnVtYmVyfG51bGwgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBJdGVyYXRlIG92ZXIgYWxsIGBpci5PcGBzIHdpdGhpbiB0aGlzIHZpZXcuXG4gICAqXG4gICAqIFNvbWUgb3BlcmF0aW9ucyBtYXkgaGF2ZSBjaGlsZCBvcGVyYXRpb25zLCB3aGljaCB0aGlzIGl0ZXJhdG9yIHdpbGwgdmlzaXQuXG4gICAqL1xuICAqIG9wcygpOiBHZW5lcmF0b3I8aXIuQ3JlYXRlT3B8aXIuVXBkYXRlT3A+IHtcbiAgICBmb3IgKGNvbnN0IG9wIG9mIHRoaXMuY3JlYXRlKSB7XG4gICAgICB5aWVsZCBvcDtcbiAgICAgIGlmIChvcC5raW5kID09PSBpci5PcEtpbmQuTGlzdGVuZXIgfHwgb3Aua2luZCA9PT0gaXIuT3BLaW5kLlR3b1dheUxpc3RlbmVyKSB7XG4gICAgICAgIGZvciAoY29uc3QgbGlzdGVuZXJPcCBvZiBvcC5oYW5kbGVyT3BzKSB7XG4gICAgICAgICAgeWllbGQgbGlzdGVuZXJPcDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGNvbnN0IG9wIG9mIHRoaXMudXBkYXRlKSB7XG4gICAgICB5aWVsZCBvcDtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBDb21waWxhdGlvbi1pbi1wcm9ncmVzcyBvZiBhbiBpbmRpdmlkdWFsIHZpZXcgd2l0aGluIGEgdGVtcGxhdGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBWaWV3Q29tcGlsYXRpb25Vbml0IGV4dGVuZHMgQ29tcGlsYXRpb25Vbml0IHtcbiAgY29uc3RydWN0b3IoXG4gICAgICByZWFkb25seSBqb2I6IENvbXBvbmVudENvbXBpbGF0aW9uSm9iLCB4cmVmOiBpci5YcmVmSWQsIHJlYWRvbmx5IHBhcmVudDogaXIuWHJlZklkfG51bGwpIHtcbiAgICBzdXBlcih4cmVmKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNYXAgb2YgZGVjbGFyZWQgdmFyaWFibGVzIGF2YWlsYWJsZSB3aXRoaW4gdGhpcyB2aWV3IHRvIHRoZSBwcm9wZXJ0eSBvbiB0aGUgY29udGV4dCBvYmplY3RcbiAgICogd2hpY2ggdGhleSBhbGlhcy5cbiAgICovXG4gIHJlYWRvbmx5IGNvbnRleHRWYXJpYWJsZXMgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xuXG4gIC8qKlxuICAgKiBTZXQgb2YgYWxpYXNlcyBhdmFpbGFibGUgd2l0aGluIHRoaXMgdmlldy4gQW4gYWxpYXMgaXMgYSB2YXJpYWJsZSB3aG9zZSBwcm92aWRlZCBleHByZXNzaW9uIGlzXG4gICAqIGlubGluZWQgYXQgZXZlcnkgbG9jYXRpb24gaXQgaXMgdXNlZC4gSXQgbWF5IGFsc28gZGVwZW5kIG9uIGNvbnRleHQgdmFyaWFibGVzLCBieSBuYW1lLlxuICAgKi9cbiAgcmVhZG9ubHkgYWxpYXNlcyA9IG5ldyBTZXQ8aXIuQWxpYXNWYXJpYWJsZT4oKTtcblxuICAvKipcbiAgICogTnVtYmVyIG9mIGRlY2xhcmF0aW9uIHNsb3RzIHVzZWQgd2l0aGluIHRoaXMgdmlldywgb3IgYG51bGxgIGlmIHNsb3RzIGhhdmUgbm90IHlldCBiZWVuXG4gICAqIGFsbG9jYXRlZC5cbiAgICovXG4gIGRlY2xzOiBudW1iZXJ8bnVsbCA9IG51bGw7XG59XG5cbi8qKlxuICogQ29tcGlsYXRpb24taW4tcHJvZ3Jlc3Mgb2YgYSBob3N0IGJpbmRpbmcsIHdoaWNoIGNvbnRhaW5zIGEgc2luZ2xlIHVuaXQgZm9yIHRoYXQgaG9zdCBiaW5kaW5nLlxuICovXG5leHBvcnQgY2xhc3MgSG9zdEJpbmRpbmdDb21waWxhdGlvbkpvYiBleHRlbmRzIENvbXBpbGF0aW9uSm9iIHtcbiAgY29uc3RydWN0b3IoY29tcG9uZW50TmFtZTogc3RyaW5nLCBwb29sOiBDb25zdGFudFBvb2wsIGNvbXBhdGliaWxpdHk6IGlyLkNvbXBhdGliaWxpdHlNb2RlKSB7XG4gICAgc3VwZXIoY29tcG9uZW50TmFtZSwgcG9vbCwgY29tcGF0aWJpbGl0eSk7XG4gICAgdGhpcy5yb290ID0gbmV3IEhvc3RCaW5kaW5nQ29tcGlsYXRpb25Vbml0KHRoaXMpO1xuICB9XG5cbiAgb3ZlcnJpZGUga2luZCA9IENvbXBpbGF0aW9uSm9iS2luZC5Ib3N0O1xuXG4gIG92ZXJyaWRlIHJlYWRvbmx5IGZuU3VmZml4OiBzdHJpbmcgPSAnSG9zdEJpbmRpbmdzJztcblxuICBvdmVycmlkZSByZWFkb25seSByb290OiBIb3N0QmluZGluZ0NvbXBpbGF0aW9uVW5pdDtcblxuICBvdmVycmlkZSBnZXQgdW5pdHMoKTogSXRlcmFibGU8SG9zdEJpbmRpbmdDb21waWxhdGlvblVuaXQ+IHtcbiAgICByZXR1cm4gW3RoaXMucm9vdF07XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEhvc3RCaW5kaW5nQ29tcGlsYXRpb25Vbml0IGV4dGVuZHMgQ29tcGlsYXRpb25Vbml0IHtcbiAgY29uc3RydWN0b3IocmVhZG9ubHkgam9iOiBIb3N0QmluZGluZ0NvbXBpbGF0aW9uSm9iKSB7XG4gICAgc3VwZXIoMCBhcyBpci5YcmVmSWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIE11Y2ggbGlrZSBhbiBlbGVtZW50IGNhbiBoYXZlIGF0dHJpYnV0ZXMsIHNvIGNhbiBhIGhvc3QgYmluZGluZyBmdW5jdGlvbi5cbiAgICovXG4gIGF0dHJpYnV0ZXM6IG8uTGl0ZXJhbEFycmF5RXhwcnxudWxsID0gbnVsbDtcbn1cbiJdfQ==