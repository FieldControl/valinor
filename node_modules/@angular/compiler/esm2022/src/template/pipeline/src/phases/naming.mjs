/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { sanitizeIdentifier } from '../../../../parse_util';
import * as ir from '../../ir';
import { hyphenate } from './parse_extracted_styles';
import { ViewCompilationUnit } from '../compilation';
/**
 * Generate names for functions and variables across all views.
 *
 * This includes propagating those names into any `ir.ReadVariableExpr`s of those variables, so that
 * the reads can be emitted correctly.
 */
export function nameFunctionsAndVariables(job) {
    addNamesToView(job.root, job.componentName, { index: 0 }, job.compatibility === ir.CompatibilityMode.TemplateDefinitionBuilder);
}
function addNamesToView(unit, baseName, state, compatibility) {
    if (unit.fnName === null) {
        // Ensure unique names for view units. This is necessary because there might be multiple
        // components with same names in the context of the same pool. Only add the suffix
        // if really needed.
        unit.fnName = unit.job.pool.uniqueName(sanitizeIdentifier(`${baseName}_${unit.job.fnSuffix}`), 
        /* alwaysIncludeSuffix */ false);
    }
    // Keep track of the names we assign to variables in the view. We'll need to propagate these
    // into reads of those variables afterwards.
    const varNames = new Map();
    for (const op of unit.ops()) {
        switch (op.kind) {
            case ir.OpKind.Property:
            case ir.OpKind.HostProperty:
                if (op.isAnimationTrigger) {
                    op.name = '@' + op.name;
                }
                break;
            case ir.OpKind.Listener:
                if (op.handlerFnName !== null) {
                    break;
                }
                if (!op.hostListener && op.targetSlot.slot === null) {
                    throw new Error(`Expected a slot to be assigned`);
                }
                let animation = '';
                if (op.isAnimationListener) {
                    op.name = `@${op.name}.${op.animationPhase}`;
                    animation = 'animation';
                }
                if (op.hostListener) {
                    op.handlerFnName = `${baseName}_${animation}${op.name}_HostBindingHandler`;
                }
                else {
                    op.handlerFnName = `${unit.fnName}_${op.tag.replace('-', '_')}_${animation}${op.name}_${op.targetSlot.slot}_listener`;
                }
                op.handlerFnName = sanitizeIdentifier(op.handlerFnName);
                break;
            case ir.OpKind.TwoWayListener:
                if (op.handlerFnName !== null) {
                    break;
                }
                if (op.targetSlot.slot === null) {
                    throw new Error(`Expected a slot to be assigned`);
                }
                op.handlerFnName = sanitizeIdentifier(`${unit.fnName}_${op.tag.replace('-', '_')}_${op.name}_${op.targetSlot.slot}_listener`);
                break;
            case ir.OpKind.Variable:
                varNames.set(op.xref, getVariableName(unit, op.variable, state));
                break;
            case ir.OpKind.RepeaterCreate:
                if (!(unit instanceof ViewCompilationUnit)) {
                    throw new Error(`AssertionError: must be compiling a component`);
                }
                if (op.handle.slot === null) {
                    throw new Error(`Expected slot to be assigned`);
                }
                if (op.emptyView !== null) {
                    const emptyView = unit.job.views.get(op.emptyView);
                    // Repeater empty view function is at slot +2 (metadata is in the first slot).
                    addNamesToView(emptyView, `${baseName}_${op.functionNameSuffix}Empty_${op.handle.slot + 2}`, state, compatibility);
                }
                // Repeater primary view function is at slot +1 (metadata is in the first slot).
                addNamesToView(unit.job.views.get(op.xref), `${baseName}_${op.functionNameSuffix}_${op.handle.slot + 1}`, state, compatibility);
                break;
            case ir.OpKind.Projection:
                if (!(unit instanceof ViewCompilationUnit)) {
                    throw new Error(`AssertionError: must be compiling a component`);
                }
                if (op.handle.slot === null) {
                    throw new Error(`Expected slot to be assigned`);
                }
                if (op.fallbackView !== null) {
                    const fallbackView = unit.job.views.get(op.fallbackView);
                    addNamesToView(fallbackView, `${baseName}_ProjectionFallback_${op.handle.slot}`, state, compatibility);
                }
                break;
            case ir.OpKind.Template:
                if (!(unit instanceof ViewCompilationUnit)) {
                    throw new Error(`AssertionError: must be compiling a component`);
                }
                const childView = unit.job.views.get(op.xref);
                if (op.handle.slot === null) {
                    throw new Error(`Expected slot to be assigned`);
                }
                const suffix = op.functionNameSuffix.length === 0 ? '' : `_${op.functionNameSuffix}`;
                addNamesToView(childView, `${baseName}${suffix}_${op.handle.slot}`, state, compatibility);
                break;
            case ir.OpKind.StyleProp:
                op.name = normalizeStylePropName(op.name);
                if (compatibility) {
                    op.name = stripImportant(op.name);
                }
                break;
            case ir.OpKind.ClassProp:
                if (compatibility) {
                    op.name = stripImportant(op.name);
                }
                break;
        }
    }
    // Having named all variables declared in the view, now we can push those names into the
    // `ir.ReadVariableExpr` expressions which represent reads of those variables.
    for (const op of unit.ops()) {
        ir.visitExpressionsInOp(op, (expr) => {
            if (!(expr instanceof ir.ReadVariableExpr) || expr.name !== null) {
                return;
            }
            if (!varNames.has(expr.xref)) {
                throw new Error(`Variable ${expr.xref} not yet named`);
            }
            expr.name = varNames.get(expr.xref);
        });
    }
}
function getVariableName(unit, variable, state) {
    if (variable.name === null) {
        switch (variable.kind) {
            case ir.SemanticVariableKind.Context:
                variable.name = `ctx_r${state.index++}`;
                break;
            case ir.SemanticVariableKind.Identifier:
                if (unit.job.compatibility === ir.CompatibilityMode.TemplateDefinitionBuilder) {
                    // TODO: Prefix increment and `_r` are for compatibility with the old naming scheme.
                    // This has the potential to cause collisions when `ctx` is the identifier, so we need a
                    // special check for that as well.
                    const compatPrefix = variable.identifier === 'ctx' ? 'i' : '';
                    variable.name = `${variable.identifier}_${compatPrefix}r${++state.index}`;
                }
                else {
                    variable.name = `${variable.identifier}_i${state.index++}`;
                }
                break;
            default:
                // TODO: Prefix increment for compatibility only.
                variable.name = `_r${++state.index}`;
                break;
        }
    }
    return variable.name;
}
/**
 * Normalizes a style prop name by hyphenating it (unless its a CSS variable).
 */
function normalizeStylePropName(name) {
    return name.startsWith('--') ? name : hyphenate(name);
}
/**
 * Strips `!important` out of the given style or class name.
 */
function stripImportant(name) {
    const importantIndex = name.indexOf('!important');
    if (importantIndex > -1) {
        return name.substring(0, importantIndex);
    }
    return name;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmFtaW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlL3BpcGVsaW5lL3NyYy9waGFzZXMvbmFtaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQzFELE9BQU8sS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRS9CLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUVuRCxPQUFPLEVBQTRDLG1CQUFtQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFOUY7Ozs7O0dBS0c7QUFDSCxNQUFNLFVBQVUseUJBQXlCLENBQUMsR0FBbUI7SUFDM0QsY0FBYyxDQUNaLEdBQUcsQ0FBQyxJQUFJLEVBQ1IsR0FBRyxDQUFDLGFBQWEsRUFDakIsRUFBQyxLQUFLLEVBQUUsQ0FBQyxFQUFDLEVBQ1YsR0FBRyxDQUFDLGFBQWEsS0FBSyxFQUFFLENBQUMsaUJBQWlCLENBQUMseUJBQXlCLENBQ3JFLENBQUM7QUFDSixDQUFDO0FBRUQsU0FBUyxjQUFjLENBQ3JCLElBQXFCLEVBQ3JCLFFBQWdCLEVBQ2hCLEtBQXNCLEVBQ3RCLGFBQXNCO0lBRXRCLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxJQUFJLEVBQUUsQ0FBQztRQUN6Qix3RkFBd0Y7UUFDeEYsa0ZBQWtGO1FBQ2xGLG9CQUFvQjtRQUNwQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FDcEMsa0JBQWtCLENBQUMsR0FBRyxRQUFRLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUN0RCx5QkFBeUIsQ0FBQyxLQUFLLENBQ2hDLENBQUM7SUFDSixDQUFDO0lBRUQsNEZBQTRGO0lB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QUFPLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3hELENBQUM7QUFFRDs7R0FFRztBQUNILFNBQVMsY0FBYyxDQUFDLElBQVk7SUFDbEMsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNsRCxJQUFJLGNBQWMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ3hCLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUNELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtzYW5pdGl6ZUlkZW50aWZpZXJ9IGZyb20gJy4uLy4uLy4uLy4uL3BhcnNlX3V0aWwnO1xuaW1wb3J0ICogYXMgaXIgZnJvbSAnLi4vLi4vaXInO1xuXG5pbXBvcnQge2h5cGhlbmF0ZX0gZnJvbSAnLi9wYXJzZV9leHRyYWN0ZWRfc3R5bGVzJztcblxuaW1wb3J0IHt0eXBlIENvbXBpbGF0aW9uSm9iLCB0eXBlIENvbXBpbGF0aW9uVW5pdCwgVmlld0NvbXBpbGF0aW9uVW5pdH0gZnJvbSAnLi4vY29tcGlsYXRpb24nO1xuXG4vKipcbiAqIEdlbmVyYXRlIG5hbWVzIGZvciBmdW5jdGlvbnMgYW5kIHZhcmlhYmxlcyBhY3Jvc3MgYWxsIHZpZXdzLlxuICpcbiAqIFRoaXMgaW5jbHVkZXMgcHJvcGFnYXRpbmcgdGhvc2UgbmFtZXMgaW50byBhbnkgYGlyLlJlYWRWYXJpYWJsZUV4cHJgcyBvZiB0aG9zZSB2YXJpYWJsZXMsIHNvIHRoYXRcbiAqIHRoZSByZWFkcyBjYW4gYmUgZW1pdHRlZCBjb3JyZWN0bHkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBuYW1lRnVuY3Rpb25zQW5kVmFyaWFibGVzKGpvYjogQ29tcGlsYXRpb25Kb2IpOiB2b2lkIHtcbiAgYWRkTmFtZXNUb1ZpZXcoXG4gICAgam9iLnJvb3QsXG4gICAgam9iLmNvbXBvbmVudE5hbWUsXG4gICAge2luZGV4OiAwfSxcbiAgICBqb2IuY29tcGF0aWJpbGl0eSA9PT0gaXIuQ29tcGF0aWJpbGl0eU1vZGUuVGVtcGxhdGVEZWZpbml0aW9uQnVpbGRlcixcbiAgKTtcbn1cblxuZnVuY3Rpb24gYWRkTmFtZXNUb1ZpZXcoXG4gIHVuaXQ6IENvbXBpbGF0aW9uVW5pdCxcbiAgYmFzZU5hbWU6IHN0cmluZyxcbiAgc3RhdGU6IHtpbmRleDogbnVtYmVyfSxcbiAgY29tcGF0aWJpbGl0eTogYm9vbGVhbixcbik6IHZvaWQge1xuICBpZiAodW5pdC5mbk5hbWUgPT09IG51bGwpIHtcbiAgICAvLyBFbnN1cmUgdW5pcXVlIG5hbWVzIGZvciB2aWV3IHVuaXRzLiBUaGlzIGlzIG5lY2Vzc2FyeSBiZWNhdXNlIHRoZXJlIG1pZ2h0IGJlIG11bHRpcGxlXG4gICAgLy8gY29tcG9uZW50cyB3aXRoIHNhbWUgbmFtZXMgaW4gdGhlIGNvbnRleHQgb2YgdGhlIHNhbWUgcG9vbC4gT25seSBhZGQgdGhlIHN1ZmZpeFxuICAgIC8vIGlmIHJlYWxseSBuZWVkZWQuXG4gICAgdW5pdC5mbk5hbWUgPSB1bml0LmpvYi5wb29sLnVuaXF1ZU5hbWUoXG4gICAgICBzYW5pdGl6ZUlkZW50aWZpZXIoYCR7YmFzZU5hbWV9XyR7dW5pdC5qb2IuZm5TdWZmaXh9YCksXG4gICAgICAvKiBhbHdheXNJbmNsdWRlU3VmZml4ICovIGZhbHNlLFxuICAgICk7XG4gIH1cblxuICAvLyBLZWVwIHRyYWNrIG9mIHRoZSBuYW1lcyB3ZSBhc3NpZ24gdG8gdmFyaWFibGVzIGluIHRoZSB2aWV3LiBXZSdsbCBuZWVkIHRvIHByb3BhZ2F0ZSB0aGVzZVxuICAvLyBpbnRvIHJlYWRzIG9mIHRob3NlIHZhcmlhYmxlcyBhZnRlcndhcmRzLlxuICBjb25zdCB2YXJOYW1lcyA9IG5ldyBNYXA8aXIuWHJlZklkLCBzdHJpbmc+KCk7XG5cbiAgZm9yIChjb25zdCBvcCBvZiB1bml0Lm9wcygpKSB7XG4gICAgc3dpdGNoIChvcC5raW5kKSB7XG4gICAgICBjYXNlIGlyLk9wS2luZC5Qcm9wZXJ0eTpcbiAgICAgIGNhc2UgaXIuT3BLaW5kLkhvc3RQcm9wZXJ0eTpcbiAgICAgICAgaWYgKG9wLmlzQW5pbWF0aW9uVHJpZ2dlcikge1xuICAgICAgICAgIG9wLm5hbWUgPSAnQCcgKyBvcC5uYW1lO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBpci5PcEtpbmQuTGlzdGVuZXI6XG4gICAgICAgIGlmIChvcC5oYW5kbGVyRm5OYW1lICE9PSBudWxsKSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFvcC5ob3N0TGlzdGVuZXIgJiYgb3AudGFyZ2V0U2xvdC5zbG90ID09PSBudWxsKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCBhIHNsb3QgdG8gYmUgYXNzaWduZWRgKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgYW5pbWF0aW9uID0gJyc7XG4gICAgICAgIGlmIChvcC5pc0FuaW1hdGlvbkxpc3RlbmVyKSB7XG4gICAgICAgICAgb3AubmFtZSA9IGBAJHtvcC5uYW1lfS4ke29wLmFuaW1hdGlvblBoYXNlfWA7XG4gICAgICAgICAgYW5pbWF0aW9uID0gJ2FuaW1hdGlvbic7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9wLmhvc3RMaXN0ZW5lcikge1xuICAgICAgICAgIG9wLmhhbmRsZXJGbk5hbWUgPSBgJHtiYXNlTmFtZX1fJHthbmltYXRpb259JHtvcC5uYW1lfV9Ib3N0QmluZGluZ0hhbmRsZXJgO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG9wLmhhbmRsZXJGbk5hbWUgPSBgJHt1bml0LmZuTmFtZX1fJHtvcC50YWchLnJlcGxhY2UoJy0nLCAnXycpfV8ke2FuaW1hdGlvbn0ke29wLm5hbWV9XyR7XG4gICAgICAgICAgICBvcC50YXJnZXRTbG90LnNsb3RcbiAgICAgICAgICB9X2xpc3RlbmVyYDtcbiAgICAgICAgfVxuICAgICAgICBvcC5oYW5kbGVyRm5OYW1lID0gc2FuaXRpemVJZGVudGlmaWVyKG9wLmhhbmRsZXJGbk5hbWUpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgaXIuT3BLaW5kLlR3b1dheUxpc3RlbmVyOlxuICAgICAgICBpZiAob3AuaGFuZGxlckZuTmFtZSAhPT0gbnVsbCkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvcC50YXJnZXRTbG90LnNsb3QgPT09IG51bGwpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIGEgc2xvdCB0byBiZSBhc3NpZ25lZGApO1xuICAgICAgICB9XG4gICAgICAgIG9wLmhhbmRsZXJGbk5hbWUgPSBzYW5pdGl6ZUlkZW50aWZpZXIoXG4gICAgICAgICAgYCR7dW5pdC5mbk5hbWV9XyR7b3AudGFnIS5yZXBsYWNlKCctJywgJ18nKX1fJHtvcC5uYW1lfV8ke29wLnRhcmdldFNsb3Quc2xvdH1fbGlzdGVuZXJgLFxuICAgICAgICApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgaXIuT3BLaW5kLlZhcmlhYmxlOlxuICAgICAgICB2YXJOYW1lcy5zZXQob3AueHJlZiwgZ2V0VmFyaWFibGVOYW1lKHVuaXQsIG9wLnZhcmlhYmxlLCBzdGF0ZSkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgaXIuT3BLaW5kLlJlcGVhdGVyQ3JlYXRlOlxuICAgICAgICBpZiAoISh1bml0IGluc3RhbmNlb2YgVmlld0NvbXBpbGF0aW9uVW5pdCkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEFzc2VydGlvbkVycm9yOiBtdXN0IGJlIGNvbXBpbGluZyBhIGNvbXBvbmVudGApO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvcC5oYW5kbGUuc2xvdCA9PT0gbnVsbCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgc2xvdCB0byBiZSBhc3NpZ25lZGApO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvcC5lbXB0eVZpZXcgIT09IG51bGwpIHtcbiAgICAgICAgICBjb25zdCBlbXB0eVZpZXcgPSB1bml0LmpvYi52aWV3cy5nZXQob3AuZW1wdHlWaWV3KSE7XG4gICAgICAgICAgLy8gUmVwZWF0ZXIgZW1wdHkgdmlldyBmdW5jdGlvbiBpcyBhdCBzbG90ICsyIChtZXRhZGF0YSBpcyBpbiB0aGUgZmlyc3Qgc2xvdCkuXG4gICAgICAgICAgYWRkTmFtZXNUb1ZpZXcoXG4gICAgICAgICAgICBlbXB0eVZpZXcsXG4gICAgICAgICAgICBgJHtiYXNlTmFtZX1fJHtvcC5mdW5jdGlvbk5hbWVTdWZmaXh9RW1wdHlfJHtvcC5oYW5kbGUuc2xvdCArIDJ9YCxcbiAgICAgICAgICAgIHN0YXRlLFxuICAgICAgICAgICAgY29tcGF0aWJpbGl0eSxcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIC8vIFJlcGVhdGVyIHByaW1hcnkgdmlldyBmdW5jdGlvbiBpcyBhdCBzbG90ICsxIChtZXRhZGF0YSBpcyBpbiB0aGUgZmlyc3Qgc2xvdCkuXG4gICAgICAgIGFkZE5hbWVzVG9WaWV3KFxuICAgICAgICAgIHVuaXQuam9iLnZpZXdzLmdldChvcC54cmVmKSEsXG4gICAgICAgICAgYCR7YmFzZU5hbWV9XyR7b3AuZnVuY3Rpb25OYW1lU3VmZml4fV8ke29wLmhhbmRsZS5zbG90ICsgMX1gLFxuICAgICAgICAgIHN0YXRlLFxuICAgICAgICAgIGNvbXBhdGliaWxpdHksXG4gICAgICAgICk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBpci5PcEtpbmQuUHJvamVjdGlvbjpcbiAgICAgICAgaWYgKCEodW5pdCBpbnN0YW5jZW9mIFZpZXdDb21waWxhdGlvblVuaXQpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBBc3NlcnRpb25FcnJvcjogbXVzdCBiZSBjb21waWxpbmcgYSBjb21wb25lbnRgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob3AuaGFuZGxlLnNsb3QgPT09IG51bGwpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIHNsb3QgdG8gYmUgYXNzaWduZWRgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob3AuZmFsbGJhY2tWaWV3ICE9PSBudWxsKSB7XG4gICAgICAgICAgY29uc3QgZmFsbGJhY2tWaWV3ID0gdW5pdC5qb2Iudmlld3MuZ2V0KG9wLmZhbGxiYWNrVmlldykhO1xuICAgICAgICAgIGFkZE5hbWVzVG9WaWV3KFxuICAgICAgICAgICAgZmFsbGJhY2tWaWV3LFxuICAgICAgICAgICAgYCR7YmFzZU5hbWV9X1Byb2plY3Rpb25GYWxsYmFja18ke29wLmhhbmRsZS5zbG90fWAsXG4gICAgICAgICAgICBzdGF0ZSxcbiAgICAgICAgICAgIGNvbXBhdGliaWxpdHksXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgaXIuT3BLaW5kLlRlbXBsYXRlOlxuICAgICAgICBpZiAoISh1bml0IGluc3RhbmNlb2YgVmlld0NvbXBpbGF0aW9uVW5pdCkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEFzc2VydGlvbkVycm9yOiBtdXN0IGJlIGNvbXBpbGluZyBhIGNvbXBvbmVudGApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNoaWxkVmlldyA9IHVuaXQuam9iLnZpZXdzLmdldChvcC54cmVmKSE7XG4gICAgICAgIGlmIChvcC5oYW5kbGUuc2xvdCA9PT0gbnVsbCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgc2xvdCB0byBiZSBhc3NpZ25lZGApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHN1ZmZpeCA9IG9wLmZ1bmN0aW9uTmFtZVN1ZmZpeC5sZW5ndGggPT09IDAgPyAnJyA6IGBfJHtvcC5mdW5jdGlvbk5hbWVTdWZmaXh9YDtcbiAgICAgICAgYWRkTmFtZXNUb1ZpZXcoY2hpbGRWaWV3LCBgJHtiYXNlTmFtZX0ke3N1ZmZpeH1fJHtvcC5oYW5kbGUuc2xvdH1gLCBzdGF0ZSwgY29tcGF0aWJpbGl0eSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBpci5PcEtpbmQuU3R5bGVQcm9wOlxuICAgICAgICBvcC5uYW1lID0gbm9ybWFsaXplU3R5bGVQcm9wTmFtZShvcC5uYW1lKTtcbiAgICAgICAgaWYgKGNvbXBhdGliaWxpdHkpIHtcbiAgICAgICAgICBvcC5uYW1lID0gc3RyaXBJbXBvcnRhbnQob3AubmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGlyLk9wS2luZC5DbGFzc1Byb3A6XG4gICAgICAgIGlmIChjb21wYXRpYmlsaXR5KSB7XG4gICAgICAgICAgb3AubmFtZSA9IHN0cmlwSW1wb3J0YW50KG9wLm5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8vIEhhdmluZyBuYW1lZCBhbGwgdmFyaWFibGVzIGRlY2xhcmVkIGluIHRoZSB2aWV3LCBub3cgd2UgY2FuIHB1c2ggdGhvc2UgbmFtZXMgaW50byB0aGVcbiAgLy8gYGlyLlJlYWRWYXJpYWJsZUV4cHJgIGV4cHJlc3Npb25zIHdoaWNoIHJlcHJlc2VudCByZWFkcyBvZiB0aG9zZSB2YXJpYWJsZXMuXG4gIGZvciAoY29uc3Qgb3Agb2YgdW5pdC5vcHMoKSkge1xuICAgIGlyLnZpc2l0RXhwcmVzc2lvbnNJbk9wKG9wLCAoZXhwcikgPT4ge1xuICAgICAgaWYgKCEoZXhwciBpbnN0YW5jZW9mIGlyLlJlYWRWYXJpYWJsZUV4cHIpIHx8IGV4cHIubmFtZSAhPT0gbnVsbCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoIXZhck5hbWVzLmhhcyhleHByLnhyZWYpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVmFyaWFibGUgJHtleHByLnhyZWZ9IG5vdCB5ZXQgbmFtZWRgKTtcbiAgICAgIH1cbiAgICAgIGV4cHIubmFtZSA9IHZhck5hbWVzLmdldChleHByLnhyZWYpITtcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRWYXJpYWJsZU5hbWUoXG4gIHVuaXQ6IENvbXBpbGF0aW9uVW5pdCxcbiAgdmFyaWFibGU6IGlyLlNlbWFudGljVmFyaWFibGUsXG4gIHN0YXRlOiB7aW5kZXg6IG51bWJlcn0sXG4pOiBzdHJpbmcge1xuICBpZiAodmFyaWFibGUubmFtZSA9PT0gbnVsbCkge1xuICAgIHN3aXRjaCAodmFyaWFibGUua2luZCkge1xuICAgICAgY2FzZSBpci5TZW1hbnRpY1ZhcmlhYmxlS2luZC5Db250ZXh0OlxuICAgICAgICB2YXJpYWJsZS5uYW1lID0gYGN0eF9yJHtzdGF0ZS5pbmRleCsrfWA7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBpci5TZW1hbnRpY1ZhcmlhYmxlS2luZC5JZGVudGlmaWVyOlxuICAgICAgICBpZiAodW5pdC5qb2IuY29tcGF0aWJpbGl0eSA9PT0gaXIuQ29tcGF0aWJpbGl0eU1vZGUuVGVtcGxhdGVEZWZpbml0aW9uQnVpbGRlcikge1xuICAgICAgICAgIC8vIFRPRE86IFByZWZpeCBpbmNyZW1lbnQgYW5kIGBfcmAgYXJlIGZvciBjb21wYXRpYmlsaXR5IHdpdGggdGhlIG9sZCBuYW1pbmcgc2NoZW1lLlxuICAgICAgICAgIC8vIFRoaXMgaGFzIHRoZSBwb3RlbnRpYWwgdG8gY2F1c2UgY29sbGlzaW9ucyB3aGVuIGBjdHhgIGlzIHRoZSBpZGVudGlmaWVyLCBzbyB3ZSBuZWVkIGFcbiAgICAgICAgICAvLyBzcGVjaWFsIGNoZWNrIGZvciB0aGF0IGFzIHdlbGwuXG4gICAgICAgICAgY29uc3QgY29tcGF0UHJlZml4ID0gdmFyaWFibGUuaWRlbnRpZmllciA9PT0gJ2N0eCcgPyAnaScgOiAnJztcbiAgICAgICAgICB2YXJpYWJsZS5uYW1lID0gYCR7dmFyaWFibGUuaWRlbnRpZmllcn1fJHtjb21wYXRQcmVmaXh9ciR7KytzdGF0ZS5pbmRleH1gO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhcmlhYmxlLm5hbWUgPSBgJHt2YXJpYWJsZS5pZGVudGlmaWVyfV9pJHtzdGF0ZS5pbmRleCsrfWA7XG4gICAgICAgIH1cblxuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIC8vIFRPRE86IFByZWZpeCBpbmNyZW1lbnQgZm9yIGNvbXBhdGliaWxpdHkgb25seS5cbiAgICAgICAgdmFyaWFibGUubmFtZSA9IGBfciR7KytzdGF0ZS5pbmRleH1gO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHZhcmlhYmxlLm5hbWU7XG59XG5cbi8qKlxuICogTm9ybWFsaXplcyBhIHN0eWxlIHByb3AgbmFtZSBieSBoeXBoZW5hdGluZyBpdCAodW5sZXNzIGl0cyBhIENTUyB2YXJpYWJsZSkuXG4gKi9cbmZ1bmN0aW9uIG5vcm1hbGl6ZVN0eWxlUHJvcE5hbWUobmFtZTogc3RyaW5nKSB7XG4gIHJldHVybiBuYW1lLnN0YXJ0c1dpdGgoJy0tJykgPyBuYW1lIDogaHlwaGVuYXRlKG5hbWUpO1xufVxuXG4vKipcbiAqIFN0cmlwcyBgIWltcG9ydGFudGAgb3V0IG9mIHRoZSBnaXZlbiBzdHlsZSBvciBjbGFzcyBuYW1lLlxuICovXG5mdW5jdGlvbiBzdHJpcEltcG9ydGFudChuYW1lOiBzdHJpbmcpIHtcbiAgY29uc3QgaW1wb3J0YW50SW5kZXggPSBuYW1lLmluZGV4T2YoJyFpbXBvcnRhbnQnKTtcbiAgaWYgKGltcG9ydGFudEluZGV4ID4gLTEpIHtcbiAgICByZXR1cm4gbmFtZS5zdWJzdHJpbmcoMCwgaW1wb3J0YW50SW5kZXgpO1xuICB9XG4gIHJldHVybiBuYW1lO1xufVxuIl19