/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as core from '../../../../core';
import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
import { ComponentCompilationJob, HostBindingCompilationJob, } from '../compilation';
import { literalOrArrayLiteral } from '../conversion';
/**
 * Converts the semantic attributes of element-like operations (elements, templates) into constant
 * array expressions, and lifts them into the overall component `consts`.
 */
export function collectElementConsts(job) {
    // Collect all extracted attributes.
    const allElementAttributes = new Map();
    for (const unit of job.units) {
        for (const op of unit.create) {
            if (op.kind === ir.OpKind.ExtractedAttribute) {
                const attributes = allElementAttributes.get(op.target) || new ElementAttributes(job.compatibility);
                allElementAttributes.set(op.target, attributes);
                attributes.add(op.bindingKind, op.name, op.expression, op.namespace, op.trustedValueFn);
                ir.OpList.remove(op);
            }
        }
    }
    // Serialize the extracted attributes into the const array.
    if (job instanceof ComponentCompilationJob) {
        for (const unit of job.units) {
            for (const op of unit.create) {
                // TODO: Simplify and combine these cases.
                if (op.kind == ir.OpKind.Projection) {
                    const attributes = allElementAttributes.get(op.xref);
                    if (attributes !== undefined) {
                        const attrArray = serializeAttributes(attributes);
                        if (attrArray.entries.length > 0) {
                            op.attributes = attrArray;
                        }
                    }
                }
                else if (ir.isElementOrContainerOp(op)) {
                    op.attributes = getConstIndex(job, allElementAttributes, op.xref);
                    // TODO(dylhunn): `@for` loops with `@empty` blocks need to be special-cased here,
                    // because the slot consumer trait currently only supports one slot per consumer and we
                    // need two. This should be revisited when making the refactors mentioned in:
                    // https://github.com/angular/angular/pull/53620#discussion_r1430918822
                    if (op.kind === ir.OpKind.RepeaterCreate && op.emptyView !== null) {
                        op.emptyAttributes = getConstIndex(job, allElementAttributes, op.emptyView);
                    }
                }
            }
        }
    }
    else if (job instanceof HostBindingCompilationJob) {
        // TODO: If the host binding case further diverges, we may want to split it into its own
        // phase.
        for (const [xref, attributes] of allElementAttributes.entries()) {
            if (xref !== job.root.xref) {
                throw new Error(`An attribute would be const collected into the host binding's template function, but is not associated with the root xref.`);
            }
            const attrArray = serializeAttributes(attributes);
            if (attrArray.entries.length > 0) {
                job.root.attributes = attrArray;
            }
        }
    }
}
function getConstIndex(job, allElementAttributes, xref) {
    const attributes = allElementAttributes.get(xref);
    if (attributes !== undefined) {
        const attrArray = serializeAttributes(attributes);
        if (attrArray.entries.length > 0) {
            return job.addConst(attrArray);
        }
    }
    return null;
}
/**
 * Shared instance of an empty array to avoid unnecessary array allocations.
 */
const FLYWEIGHT_ARRAY = Object.freeze([]);
/**
 * Container for all of the various kinds of attributes which are applied on an element.
 */
class ElementAttributes {
    get attributes() {
        return this.byKind.get(ir.BindingKind.Attribute) ?? FLYWEIGHT_ARRAY;
    }
    get classes() {
        return this.byKind.get(ir.BindingKind.ClassName) ?? FLYWEIGHT_ARRAY;
    }
    get styles() {
        return this.byKind.get(ir.BindingKind.StyleProperty) ?? FLYWEIGHT_ARRAY;
    }
    get bindings() {
        return this.propertyBindings ?? FLYWEIGHT_ARRAY;
    }
    get template() {
        return this.byKind.get(ir.BindingKind.Template) ?? FLYWEIGHT_ARRAY;
    }
    get i18n() {
        return this.byKind.get(ir.BindingKind.I18n) ?? FLYWEIGHT_ARRAY;
    }
    constructor(compatibility) {
        this.compatibility = compatibility;
        this.known = new Map();
        this.byKind = new Map();
        this.propertyBindings = null;
        this.projectAs = null;
    }
    isKnown(kind, name) {
        const nameToValue = this.known.get(kind) ?? new Set();
        this.known.set(kind, nameToValue);
        if (nameToValue.has(name)) {
            return true;
        }
        nameToValue.add(name);
        return false;
    }
    add(kind, name, value, namespace, trustedValueFn) {
        // TemplateDefinitionBuilder puts duplicate attribute, class, and style values into the consts
        // array. This seems inefficient, we can probably keep just the first one or the last value
        // (whichever actually gets applied when multiple values are listed for the same attribute).
        const allowDuplicates = this.compatibility === ir.CompatibilityMode.TemplateDefinitionBuilder &&
            (kind === ir.BindingKind.Attribute ||
                kind === ir.BindingKind.ClassName ||
                kind === ir.BindingKind.StyleProperty);
        if (!allowDuplicates && this.isKnown(kind, name)) {
            return;
        }
        // TODO: Can this be its own phase
        if (name === 'ngProjectAs') {
            if (value === null ||
                !(value instanceof o.LiteralExpr) ||
                value.value == null ||
                typeof value.value?.toString() !== 'string') {
                throw Error('ngProjectAs must have a string literal value');
            }
            this.projectAs = value.value.toString();
            // TODO: TemplateDefinitionBuilder allows `ngProjectAs` to also be assigned as a literal
            // attribute. Is this sane?
        }
        const array = this.arrayFor(kind);
        array.push(...getAttributeNameLiterals(namespace, name));
        if (kind === ir.BindingKind.Attribute || kind === ir.BindingKind.StyleProperty) {
            if (value === null) {
                throw Error('Attribute, i18n attribute, & style element attributes must have a value');
            }
            if (trustedValueFn !== null) {
                if (!ir.isStringLiteral(value)) {
                    throw Error('AssertionError: extracted attribute value should be string literal');
                }
                array.push(o.taggedTemplate(trustedValueFn, new o.TemplateLiteral([new o.TemplateLiteralElement(value.value)], []), undefined, value.sourceSpan));
            }
            else {
                array.push(value);
            }
        }
    }
    arrayFor(kind) {
        if (kind === ir.BindingKind.Property || kind === ir.BindingKind.TwoWayProperty) {
            this.propertyBindings ??= [];
            return this.propertyBindings;
        }
        else {
            if (!this.byKind.has(kind)) {
                this.byKind.set(kind, []);
            }
            return this.byKind.get(kind);
        }
    }
}
/**
 * Gets an array of literal expressions representing the attribute's namespaced name.
 */
function getAttributeNameLiterals(namespace, name) {
    const nameLiteral = o.literal(name);
    if (namespace) {
        return [o.literal(0 /* core.AttributeMarker.NamespaceURI */), o.literal(namespace), nameLiteral];
    }
    return [nameLiteral];
}
/**
 * Serializes an ElementAttributes object into an array expression.
 */
function serializeAttributes({ attributes, bindings, classes, i18n, projectAs, styles, template, }) {
    const attrArray = [...attributes];
    if (projectAs !== null) {
        // Parse the attribute value into a CssSelectorList. Note that we only take the
        // first selector, because we don't support multiple selectors in ngProjectAs.
        const parsedR3Selector = core.parseSelectorToR3Selector(projectAs)[0];
        attrArray.push(o.literal(5 /* core.AttributeMarker.ProjectAs */), literalOrArrayLiteral(parsedR3Selector));
    }
    if (classes.length > 0) {
        attrArray.push(o.literal(1 /* core.AttributeMarker.Classes */), ...classes);
    }
    if (styles.length > 0) {
        attrArray.push(o.literal(2 /* core.AttributeMarker.Styles */), ...styles);
    }
    if (bindings.length > 0) {
        attrArray.push(o.literal(3 /* core.AttributeMarker.Bindings */), ...bindings);
    }
    if (template.length > 0) {
        attrArray.push(o.literal(4 /* core.AttributeMarker.Template */), ...template);
    }
    if (i18n.length > 0) {
        attrArray.push(o.literal(6 /* core.AttributeMarker.I18n */), ...i18n);
    }
    return o.literalArr(attrArray);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RfY29sbGVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy90ZW1wbGF0ZS9waXBlbGluZS9zcmMvcGhhc2VzL2NvbnN0X2NvbGxlY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxLQUFLLElBQUksTUFBTSxrQkFBa0IsQ0FBQztBQUN6QyxPQUFPLEtBQUssQ0FBQyxNQUFNLCtCQUErQixDQUFDO0FBQ25ELE9BQU8sS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRS9CLE9BQU8sRUFDTCx1QkFBdUIsRUFDdkIseUJBQXlCLEdBRTFCLE1BQU0sZ0JBQWdCLENBQUM7QUFDeEIsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXBEOzs7R0FHRztBQUNILE1BQU0sVUFBVSxvQkFBb0IsQ0FBQyxHQUFtQjtJQUN0RCxvQ0FBb0M7SUFDcEMsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLEdBQUcsRUFBZ0MsQ0FBQztJQUNyRSxLQUFLLE1BQU0sSUFBSSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QixLQUFLLE1BQU0sRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM3QixJQUFJLEVBQUUsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO2dCQUM3QyxNQUFNLFVBQVUsR0FDZCxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksaUJBQWlCLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUNsRixvQkFBb0IsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztnQkFDaEQsVUFBVSxDQUFDLEdBQUcsQ0FBQyxF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LENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQ3BCLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sbUNBQTJCLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUNoRSxDQUFDO0lBQ0QsT0FBTyxDQUFDLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2pDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIGNvcmUgZnJvbSAnLi4vLi4vLi4vLi4vY29yZSc7XG5pbXBvcnQgKiBhcyBvIGZyb20gJy4uLy4uLy4uLy4uL291dHB1dC9vdXRwdXRfYXN0JztcbmltcG9ydCAqIGFzIGlyIGZyb20gJy4uLy4uL2lyJztcblxuaW1wb3J0IHtcbiAgQ29tcG9uZW50Q29tcGlsYXRpb25Kb2IsXG4gIEhvc3RCaW5kaW5nQ29tcGlsYXRpb25Kb2IsXG4gIHR5cGUgQ29tcGlsYXRpb25Kb2IsXG59IGZyb20gJy4uL2NvbXBpbGF0aW9uJztcbmltcG9ydCB7bGl0ZXJhbE9yQXJyYXlMaXRlcmFsfSBmcm9tICcuLi9jb252ZXJzaW9uJztcblxuLyoqXG4gKiBDb252ZXJ0cyB0aGUgc2VtYW50aWMgYXR0cmlidXRlcyBvZiBlbGVtZW50LWxpa2Ugb3BlcmF0aW9ucyAoZWxlbWVudHMsIHRlbXBsYXRlcykgaW50byBjb25zdGFudFxuICogYXJyYXkgZXhwcmVzc2lvbnMsIGFuZCBsaWZ0cyB0aGVtIGludG8gdGhlIG92ZXJhbGwgY29tcG9uZW50IGBjb25zdHNgLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29sbGVjdEVsZW1lbnRDb25zdHMoam9iOiBDb21waWxhdGlvbkpvYik6IHZvaWQge1xuICAvLyBDb2xsZWN0IGFsbCBleHRyYWN0ZWQgYXR0cmlidXRlcy5cbiAgY29uc3QgYWxsRWxlbWVudEF0dHJpYnV0ZXMgPSBuZXcgTWFwPGlyLlhyZWZJZCwgRWxlbWVudEF0dHJpYnV0ZXM+KCk7XG4gIGZvciAoY29uc3QgdW5pdCBvZiBqb2IudW5pdHMpIHtcbiAgICBmb3IgKGNvbnN0IG9wIG9mIHVuaXQuY3JlYXRlKSB7XG4gICAgICBpZiAob3Aua2luZCA9PT0gaXIuT3BLaW5kLkV4dHJhY3RlZEF0dHJpYnV0ZSkge1xuICAgICAgICBjb25zdCBhdHRyaWJ1dGVzID1cbiAgICAgICAgICBhbGxFbGVtZW50QXR0cmlidXRlcy5nZXQob3AudGFyZ2V0KSB8fCBuZXcgRWxlbWVudEF0dHJpYnV0ZXMoam9iLmNvbXBhdGliaWxpdHkpO1xuICAgICAgICBhbGxFbGVtZW50QXR0cmlidXRlcy5zZXQob3AudGFyZ2V0LCBhdHRyaWJ1dGVzKTtcbiAgICAgICAgYXR0cmlidXRlcy5hZGQob3AuYmluZGluZ0tpbmQsIG9wLm5hbWUsIG9wLmV4cHJlc3Npb24sIG9wLm5hbWVzcGFjZSwgb3AudHJ1c3RlZFZhbHVlRm4pO1xuICAgICAgICBpci5PcExpc3QucmVtb3ZlPGlyLkNyZWF0ZU9wPihvcCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gU2VyaWFsaXplIHRoZSBleHRyYWN0ZWQgYXR0cmlidXRlcyBpbnRvIHRoZSBjb25zdCBhcnJheS5cbiAgaWYgKGpvYiBpbnN0YW5jZW9mIENvbXBvbmVudENvbXBpbGF0aW9uSm9iKSB7XG4gICAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgICAgZm9yIChjb25zdCBvcCBvZiB1bml0LmNyZWF0ZSkge1xuICAgICAgICAvLyBUT0RPOiBTaW1wbGlmeSBhbmQgY29tYmluZSB0aGVzZSBjYXNlcy5cbiAgICAgICAgaWYgKG9wLmtpbmQgPT0gaXIuT3BLaW5kLlByb2plY3Rpb24pIHtcbiAgICAgICAgICBjb25zdCBhdHRyaWJ1dGVzID0gYWxsRWxlbWVudEF0dHJpYnV0ZXMuZ2V0KG9wLnhyZWYpO1xuICAgICAgICAgIGlmIChhdHRyaWJ1dGVzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNvbnN0IGF0dHJBcnJheSA9IHNlcmlhbGl6ZUF0dHJpYnV0ZXMoYXR0cmlidXRlcyk7XG4gICAgICAgICAgICBpZiAoYXR0ckFycmF5LmVudHJpZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICBvcC5hdHRyaWJ1dGVzID0gYXR0ckFycmF5O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChpci5pc0VsZW1lbnRPckNvbnRhaW5lck9wKG9wKSkge1xuICAgICAgICAgIG9wLmF0dHJpYnV0ZXMgPSBnZXRDb25zdEluZGV4KGpvYiwgYWxsRWxlbWVudEF0dHJpYnV0ZXMsIG9wLnhyZWYpO1xuXG4gICAgICAgICAgLy8gVE9ETyhkeWxodW5uKTogYEBmb3JgIGxvb3BzIHdpdGggYEBlbXB0eWAgYmxvY2tzIG5lZWQgdG8gYmUgc3BlY2lhbC1jYXNlZCBoZXJlLFxuICAgICAgICAgIC8vIGJlY2F1c2UgdGhlIHNsb3QgY29uc3VtZXIgdHJhaXQgY3VycmVudGx5IG9ubHkgc3VwcG9ydHMgb25lIHNsb3QgcGVyIGNvbnN1bWVyIGFuZCB3ZVxuICAgICAgICAgIC8vIG5lZWQgdHdvLiBUaGlzIHNob3VsZCBiZSByZXZpc2l0ZWQgd2hlbiBtYWtpbmcgdGhlIHJlZmFjdG9ycyBtZW50aW9uZWQgaW46XG4gICAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9wdWxsLzUzNjIwI2Rpc2N1c3Npb25fcjE0MzA5MTg4MjJcbiAgICAgICAgICBpZiAob3Aua2luZCA9PT0gaXIuT3BLaW5kLlJlcGVhdGVyQ3JlYXRlICYmIG9wLmVtcHR5VmlldyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgb3AuZW1wdHlBdHRyaWJ1dGVzID0gZ2V0Q29uc3RJbmRleChqb2IsIGFsbEVsZW1lbnRBdHRyaWJ1dGVzLCBvcC5lbXB0eVZpZXcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIGlmIChqb2IgaW5zdGFuY2VvZiBIb3N0QmluZGluZ0NvbXBpbGF0aW9uSm9iKSB7XG4gICAgLy8gVE9ETzogSWYgdGhlIGhvc3QgYmluZGluZyBjYXNlIGZ1cnRoZXIgZGl2ZXJnZXMsIHdlIG1heSB3YW50IHRvIHNwbGl0IGl0IGludG8gaXRzIG93blxuICAgIC8vIHBoYXNlLlxuICAgIGZvciAoY29uc3QgW3hyZWYsIGF0dHJpYnV0ZXNdIG9mIGFsbEVsZW1lbnRBdHRyaWJ1dGVzLmVudHJpZXMoKSkge1xuICAgICAgaWYgKHhyZWYgIT09IGpvYi5yb290LnhyZWYpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBBbiBhdHRyaWJ1dGUgd291bGQgYmUgY29uc3QgY29sbGVjdGVkIGludG8gdGhlIGhvc3QgYmluZGluZydzIHRlbXBsYXRlIGZ1bmN0aW9uLCBidXQgaXMgbm90IGFzc29jaWF0ZWQgd2l0aCB0aGUgcm9vdCB4cmVmLmAsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBjb25zdCBhdHRyQXJyYXkgPSBzZXJpYWxpemVBdHRyaWJ1dGVzKGF0dHJpYnV0ZXMpO1xuICAgICAgaWYgKGF0dHJBcnJheS5lbnRyaWVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgam9iLnJvb3QuYXR0cmlidXRlcyA9IGF0dHJBcnJheTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0Q29uc3RJbmRleChcbiAgam9iOiBDb21wb25lbnRDb21waWxhdGlvbkpvYixcbiAgYWxsRWxlbWVudEF0dHJpYnV0ZXM6IE1hcDxpci5YcmVmSWQsIEVsZW1lbnRBdHRyaWJ1dGVzPixcbiAgeHJlZjogaXIuWHJlZklkLFxuKTogaXIuQ29uc3RJbmRleCB8IG51bGwge1xuICBjb25zdCBhdHRyaWJ1dGVzID0gYWxsRWxlbWVudEF0dHJpYnV0ZXMuZ2V0KHhyZWYpO1xuICBpZiAoYXR0cmlidXRlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgY29uc3QgYXR0ckFycmF5ID0gc2VyaWFsaXplQXR0cmlidXRlcyhhdHRyaWJ1dGVzKTtcbiAgICBpZiAoYXR0ckFycmF5LmVudHJpZXMubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIGpvYi5hZGRDb25zdChhdHRyQXJyYXkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuLyoqXG4gKiBTaGFyZWQgaW5zdGFuY2Ugb2YgYW4gZW1wdHkgYXJyYXkgdG8gYXZvaWQgdW5uZWNlc3NhcnkgYXJyYXkgYWxsb2NhdGlvbnMuXG4gKi9cbmNvbnN0IEZMWVdFSUdIVF9BUlJBWTogUmVhZG9ubHlBcnJheTxvLkV4cHJlc3Npb24+ID0gT2JqZWN0LmZyZWV6ZTxvLkV4cHJlc3Npb25bXT4oW10pO1xuXG4vKipcbiAqIENvbnRhaW5lciBmb3IgYWxsIG9mIHRoZSB2YXJpb3VzIGtpbmRzIG9mIGF0dHJpYnV0ZXMgd2hpY2ggYXJlIGFwcGxpZWQgb24gYW4gZWxlbWVudC5cbiAqL1xuY2xhc3MgRWxlbWVudEF0dHJpYnV0ZXMge1xuICBwcml2YXRlIGtub3duID0gbmV3IE1hcDxpci5CaW5kaW5nS2luZCwgU2V0PHN0cmluZz4+KCk7XG4gIHByaXZhdGUgYnlLaW5kID0gbmV3IE1hcDxcbiAgICAvLyBQcm9wZXJ0eSBiaW5kaW5ncyBhcmUgZXhjbHVkZWQgaGVyZSwgYmVjYXVzZSB0aGV5IG5lZWQgdG8gYmUgdHJhY2tlZCBpbiB0aGUgc2FtZVxuICAgIC8vIGFycmF5IHRvIG1haW50YWluIHRoZWlyIG9yZGVyLiBUaGV5J3JlIHRyYWNrZWQgaW4gdGhlIGBwcm9wZXJ0eUJpbmRpbmdzYCBhcnJheS5cbiAgICBFeGNsdWRlPGlyLkJpbmRpbmdLaW5kLCBpci5CaW5kaW5nS2luZC5Qcm9wZXJ0eSB8IGlyLkJpbmRpbmdLaW5kLlR3b1dheVByb3BlcnR5PixcbiAgICBvLkV4cHJlc3Npb25bXVxuICA+KCk7XG4gIHByaXZhdGUgcHJvcGVydHlCaW5kaW5nczogby5FeHByZXNzaW9uW10gfCBudWxsID0gbnVsbDtcblxuICBwcm9qZWN0QXM6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuXG4gIGdldCBhdHRyaWJ1dGVzKCk6IFJlYWRvbmx5QXJyYXk8by5FeHByZXNzaW9uPiB7XG4gICAgcmV0dXJuIHRoaXMuYnlLaW5kLmdldChpci5CaW5kaW5nS2luZC5BdHRyaWJ1dGUpID8/IEZMWVdFSUdIVF9BUlJBWTtcbiAgfVxuXG4gIGdldCBjbGFzc2VzKCk6IFJlYWRvbmx5QXJyYXk8by5FeHByZXNzaW9uPiB7XG4gICAgcmV0dXJuIHRoaXMuYnlLaW5kLmdldChpci5CaW5kaW5nS2luZC5DbGFzc05hbWUpID8/IEZMWVdFSUdIVF9BUlJBWTtcbiAgfVxuXG4gIGdldCBzdHlsZXMoKTogUmVhZG9ubHlBcnJheTxvLkV4cHJlc3Npb24+IHtcbiAgICByZXR1cm4gdGhpcy5ieUtpbmQuZ2V0KGlyLkJpbmRpbmdLaW5kLlN0eWxlUHJvcGVydHkpID8/IEZMWVdFSUdIVF9BUlJBWTtcbiAgfVxuXG4gIGdldCBiaW5kaW5ncygpOiBSZWFkb25seUFycmF5PG8uRXhwcmVzc2lvbj4ge1xuICAgIHJldHVybiB0aGlzLnByb3BlcnR5QmluZGluZ3MgPz8gRkxZV0VJR0hUX0FSUkFZO1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCk6IFJlYWRvbmx5QXJyYXk8by5FeHByZXNzaW9uPiB7XG4gICAgcmV0dXJuIHRoaXMuYnlLaW5kLmdldChpci5CaW5kaW5nS2luZC5UZW1wbGF0ZSkgPz8gRkxZV0VJR0hUX0FSUkFZO1xuICB9XG5cbiAgZ2V0IGkxOG4oKTogUmVhZG9ubHlBcnJheTxvLkV4cHJlc3Npb24+IHtcbiAgICByZXR1cm4gdGhpcy5ieUtpbmQuZ2V0KGlyLkJpbmRpbmdLaW5kLkkxOG4pID8/IEZMWVdFSUdIVF9BUlJBWTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgY29tcGF0aWJpbGl0eTogaXIuQ29tcGF0aWJpbGl0eU1vZGUpIHt9XG5cbiAgcHJpdmF0ZSBpc0tub3duKGtpbmQ6IGlyLkJpbmRpbmdLaW5kLCBuYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCBuYW1lVG9WYWx1ZSA9IHRoaXMua25vd24uZ2V0KGtpbmQpID8/IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgIHRoaXMua25vd24uc2V0KGtpbmQsIG5hbWVUb1ZhbHVlKTtcbiAgICBpZiAobmFtZVRvVmFsdWUuaGFzKG5hbWUpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgbmFtZVRvVmFsdWUuYWRkKG5hbWUpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGFkZChcbiAgICBraW5kOiBpci5CaW5kaW5nS2luZCxcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgdmFsdWU6IG8uRXhwcmVzc2lvbiB8IG51bGwsXG4gICAgbmFtZXNwYWNlOiBzdHJpbmcgfCBudWxsLFxuICAgIHRydXN0ZWRWYWx1ZUZuOiBvLkV4cHJlc3Npb24gfCBudWxsLFxuICApOiB2b2lkIHtcbiAgICAvLyBUZW1wbGF0ZURlZmluaXRpb25CdWlsZGVyIHB1dHMgZHVwbGljYXRlIGF0dHJpYnV0ZSwgY2xhc3MsIGFuZCBzdHlsZSB2YWx1ZXMgaW50byB0aGUgY29uc3RzXG4gICAgLy8gYXJyYXkuIFRoaXMgc2VlbXMgaW5lZmZpY2llbnQsIHdlIGNhbiBwcm9iYWJseSBrZWVwIGp1c3QgdGhlIGZpcnN0IG9uZSBvciB0aGUgbGFzdCB2YWx1ZVxuICAgIC8vICh3aGljaGV2ZXIgYWN0dWFsbHkgZ2V0cyBhcHBsaWVkIHdoZW4gbXVsdGlwbGUgdmFsdWVzIGFyZSBsaXN0ZWQgZm9yIHRoZSBzYW1lIGF0dHJpYnV0ZSkuXG4gICAgY29uc3QgYWxsb3dEdXBsaWNhdGVzID1cbiAgICAgIHRoaXMuY29tcGF0aWJpbGl0eSA9PT0gaXIuQ29tcGF0aWJpbGl0eU1vZGUuVGVtcGxhdGVEZWZpbml0aW9uQnVpbGRlciAmJlxuICAgICAgKGtpbmQgPT09IGlyLkJpbmRpbmdLaW5kLkF0dHJpYnV0ZSB8fFxuICAgICAgICBraW5kID09PSBpci5CaW5kaW5nS2luZC5DbGFzc05hbWUgfHxcbiAgICAgICAga2luZCA9PT0gaXIuQmluZGluZ0tpbmQuU3R5bGVQcm9wZXJ0eSk7XG4gICAgaWYgKCFhbGxvd0R1cGxpY2F0ZXMgJiYgdGhpcy5pc0tub3duKGtpbmQsIG5hbWUpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gVE9ETzogQ2FuIHRoaXMgYmUgaXRzIG93biBwaGFzZVxuICAgIGlmIChuYW1lID09PSAnbmdQcm9qZWN0QXMnKSB7XG4gICAgICBpZiAoXG4gICAgICAgIHZhbHVlID09PSBudWxsIHx8XG4gICAgICAgICEodmFsdWUgaW5zdGFuY2VvZiBvLkxpdGVyYWxFeHByKSB8fFxuICAgICAgICB2YWx1ZS52YWx1ZSA9PSBudWxsIHx8XG4gICAgICAgIHR5cGVvZiB2YWx1ZS52YWx1ZT8udG9TdHJpbmcoKSAhPT0gJ3N0cmluZydcbiAgICAgICkge1xuICAgICAgICB0aHJvdyBFcnJvcignbmdQcm9qZWN0QXMgbXVzdCBoYXZlIGEgc3RyaW5nIGxpdGVyYWwgdmFsdWUnKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucHJvamVjdEFzID0gdmFsdWUudmFsdWUudG9TdHJpbmcoKTtcbiAgICAgIC8vIFRPRE86IFRlbXBsYXRlRGVmaW5pdGlvbkJ1aWxkZXIgYWxsb3dzIGBuZ1Byb2plY3RBc2AgdG8gYWxzbyBiZSBhc3NpZ25lZCBhcyBhIGxpdGVyYWxcbiAgICAgIC8vIGF0dHJpYnV0ZS4gSXMgdGhpcyBzYW5lP1xuICAgIH1cblxuICAgIGNvbnN0IGFycmF5ID0gdGhpcy5hcnJheUZvcihraW5kKTtcbiAgICBhcnJheS5wdXNoKC4uLmdldEF0dHJpYnV0ZU5hbWVMaXRlcmFscyhuYW1lc3BhY2UsIG5hbWUpKTtcbiAgICBpZiAoa2luZCA9PT0gaXIuQmluZGluZ0tpbmQuQXR0cmlidXRlIHx8IGtpbmQgPT09IGlyLkJpbmRpbmdLaW5kLlN0eWxlUHJvcGVydHkpIHtcbiAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBFcnJvcignQXR0cmlidXRlLCBpMThuIGF0dHJpYnV0ZSwgJiBzdHlsZSBlbGVtZW50IGF0dHJpYnV0ZXMgbXVzdCBoYXZlIGEgdmFsdWUnKTtcbiAgICAgIH1cbiAgICAgIGlmICh0cnVzdGVkVmFsdWVGbiAhPT0gbnVsbCkge1xuICAgICAgICBpZiAoIWlyLmlzU3RyaW5nTGl0ZXJhbCh2YWx1ZSkpIHtcbiAgICAgICAgICB0aHJvdyBFcnJvcignQXNzZXJ0aW9uRXJyb3I6IGV4dHJhY3RlZCBhdHRyaWJ1dGUgdmFsdWUgc2hvdWxkIGJlIHN0cmluZyBsaXRlcmFsJyk7XG4gICAgICAgIH1cbiAgICAgICAgYXJyYXkucHVzaChcbiAgICAgICAgICBvLnRhZ2dlZFRlbXBsYXRlKFxuICAgICAgICAgICAgdHJ1c3RlZFZhbHVlRm4sXG4gICAgICAgICAgICBuZXcgby5UZW1wbGF0ZUxpdGVyYWwoW25ldyBvLlRlbXBsYXRlTGl0ZXJhbEVsZW1lbnQodmFsdWUudmFsdWUpXSwgW10pLFxuICAgICAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICAgICAgdmFsdWUuc291cmNlU3BhbixcbiAgICAgICAgICApLFxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXJyYXkucHVzaCh2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhcnJheUZvcihraW5kOiBpci5CaW5kaW5nS2luZCk6IG8uRXhwcmVzc2lvbltdIHtcbiAgICBpZiAoa2luZCA9PT0gaXIuQmluZGluZ0tpbmQuUHJvcGVydHkgfHwga2luZCA9PT0gaXIuQmluZGluZ0tpbmQuVHdvV2F5UHJvcGVydHkpIHtcbiAgICAgIHRoaXMucHJvcGVydHlCaW5kaW5ncyA/Pz0gW107XG4gICAgICByZXR1cm4gdGhpcy5wcm9wZXJ0eUJpbmRpbmdzO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIXRoaXMuYnlLaW5kLmhhcyhraW5kKSkge1xuICAgICAgICB0aGlzLmJ5S2luZC5zZXQoa2luZCwgW10pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuYnlLaW5kLmdldChraW5kKSE7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogR2V0cyBhbiBhcnJheSBvZiBsaXRlcmFsIGV4cHJlc3Npb25zIHJlcHJlc2VudGluZyB0aGUgYXR0cmlidXRlJ3MgbmFtZXNwYWNlZCBuYW1lLlxuICovXG5mdW5jdGlvbiBnZXRBdHRyaWJ1dGVOYW1lTGl0ZXJhbHMobmFtZXNwYWNlOiBzdHJpbmcgfCBudWxsLCBuYW1lOiBzdHJpbmcpOiBvLkxpdGVyYWxFeHByW10ge1xuICBjb25zdCBuYW1lTGl0ZXJhbCA9IG8ubGl0ZXJhbChuYW1lKTtcblxuICBpZiAobmFtZXNwYWNlKSB7XG4gICAgcmV0dXJuIFtvLmxpdGVyYWwoY29yZS5BdHRyaWJ1dGVNYXJrZXIuTmFtZXNwYWNlVVJJKSwgby5saXRlcmFsKG5hbWVzcGFjZSksIG5hbWVMaXRlcmFsXTtcbiAgfVxuXG4gIHJldHVybiBbbmFtZUxpdGVyYWxdO1xufVxuXG4vKipcbiAqIFNlcmlhbGl6ZXMgYW4gRWxlbWVudEF0dHJpYnV0ZXMgb2JqZWN0IGludG8gYW4gYXJyYXkgZXhwcmVzc2lvbi5cbiAqL1xuZnVuY3Rpb24gc2VyaWFsaXplQXR0cmlidXRlcyh7XG4gIGF0dHJpYnV0ZXMsXG4gIGJpbmRpbmdzLFxuICBjbGFzc2VzLFxuICBpMThuLFxuICBwcm9qZWN0QXMsXG4gIHN0eWxlcyxcbiAgdGVtcGxhdGUsXG59OiBFbGVtZW50QXR0cmlidXRlcyk6IG8uTGl0ZXJhbEFycmF5RXhwciB7XG4gIGNvbnN0IGF0dHJBcnJheSA9IFsuLi5hdHRyaWJ1dGVzXTtcblxuICBpZiAocHJvamVjdEFzICE9PSBudWxsKSB7XG4gICAgLy8gUGFyc2UgdGhlIGF0dHJpYnV0ZSB2YWx1ZSBpbnRvIGEgQ3NzU2VsZWN0b3JMaXN0LiBOb3RlIHRoYXQgd2Ugb25seSB0YWtlIHRoZVxuICAgIC8vIGZpcnN0IHNlbGVjdG9yLCBiZWNhdXNlIHdlIGRvbid0IHN1cHBvcnQgbXVsdGlwbGUgc2VsZWN0b3JzIGluIG5nUHJvamVjdEFzLlxuICAgIGNvbnN0IHBhcnNlZFIzU2VsZWN0b3IgPSBjb3JlLnBhcnNlU2VsZWN0b3JUb1IzU2VsZWN0b3IocHJvamVjdEFzKVswXTtcbiAgICBhdHRyQXJyYXkucHVzaChcbiAgICAgIG8ubGl0ZXJhbChjb3JlLkF0dHJpYnV0ZU1hcmtlci5Qcm9qZWN0QXMpLFxuICAgICAgbGl0ZXJhbE9yQXJyYXlMaXRlcmFsKHBhcnNlZFIzU2VsZWN0b3IpLFxuICAgICk7XG4gIH1cbiAgaWYgKGNsYXNzZXMubGVuZ3RoID4gMCkge1xuICAgIGF0dHJBcnJheS5wdXNoKG8ubGl0ZXJhbChjb3JlLkF0dHJpYnV0ZU1hcmtlci5DbGFzc2VzKSwgLi4uY2xhc3Nlcyk7XG4gIH1cbiAgaWYgKHN0eWxlcy5sZW5ndGggPiAwKSB7XG4gICAgYXR0ckFycmF5LnB1c2goby5saXRlcmFsKGNvcmUuQXR0cmlidXRlTWFya2VyLlN0eWxlcyksIC4uLnN0eWxlcyk7XG4gIH1cbiAgaWYgKGJpbmRpbmdzLmxlbmd0aCA+IDApIHtcbiAgICBhdHRyQXJyYXkucHVzaChvLmxpdGVyYWwoY29yZS5BdHRyaWJ1dGVNYXJrZXIuQmluZGluZ3MpLCAuLi5iaW5kaW5ncyk7XG4gIH1cbiAgaWYgKHRlbXBsYXRlLmxlbmd0aCA+IDApIHtcbiAgICBhdHRyQXJyYXkucHVzaChvLmxpdGVyYWwoY29yZS5BdHRyaWJ1dGVNYXJrZXIuVGVtcGxhdGUpLCAuLi50ZW1wbGF0ZSk7XG4gIH1cbiAgaWYgKGkxOG4ubGVuZ3RoID4gMCkge1xuICAgIGF0dHJBcnJheS5wdXNoKG8ubGl0ZXJhbChjb3JlLkF0dHJpYnV0ZU1hcmtlci5JMThuKSwgLi4uaTE4bik7XG4gIH1cbiAgcmV0dXJuIG8ubGl0ZXJhbEFycihhdHRyQXJyYXkpO1xufVxuIl19