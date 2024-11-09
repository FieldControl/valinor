/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as core from '../../../../core';
import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
import { ComponentCompilationJob, HostBindingCompilationJob } from '../compilation';
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
        this.byKind = new Map;
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
            (kind === ir.BindingKind.Attribute || kind === ir.BindingKind.ClassName ||
                kind === ir.BindingKind.StyleProperty);
        if (!allowDuplicates && this.isKnown(kind, name)) {
            return;
        }
        // TODO: Can this be its own phase
        if (name === 'ngProjectAs') {
            if (value === null || !(value instanceof o.LiteralExpr) || (value.value == null) ||
                (typeof value.value?.toString() !== 'string')) {
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
function serializeAttributes({ attributes, bindings, classes, i18n, projectAs, styles, template }) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RfY29sbGVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy90ZW1wbGF0ZS9waXBlbGluZS9zcmMvcGhhc2VzL2NvbnN0X2NvbGxlY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBR0gsT0FBTyxLQUFLLElBQUksTUFBTSxrQkFBa0IsQ0FBQztBQUN6QyxPQUFPLEtBQUssQ0FBQyxNQUFNLCtCQUErQixDQUFDO0FBQ25ELE9BQU8sS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRS9CLE9BQU8sRUFBQyx1QkFBdUIsRUFBRSx5QkFBeUIsRUFBc0IsTUFBTSxnQkFBZ0IsQ0FBQztBQUN2RyxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFcEQ7OztHQUdHO0FBQ0gsTUFBTSxVQUFVLG9CQUFvQixDQUFDLEdBQW1CO0lBQ3RELG9DQUFvQztJQUNwQyxNQUFNLG9CQUFvQixHQUFHLElBQUksR0FBRyxFQUFnQyxDQUFDO0lBQ3JFLEtBQUssTUFBTSxJQUFJLElBQUksR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzdCLEtBQUssTUFBTSxFQUFFLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzdCLElBQUksRUFBRSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLGtCQUFrQixFQUFFLENBQUM7Z0JBQzdDLE1BQU0sVUFBVSxHQUNaLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQ3BGLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO2dCQUNoRCxVQUFVLENBQUMsR0FBRyxDQUFDLEVB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LElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDcEIsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxtQ0FBMkIsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQ2hFLENBQUM7SUFDRCxPQUFPLENBQUMsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDakMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5cbmltcG9ydCAqIGFzIGNvcmUgZnJvbSAnLi4vLi4vLi4vLi4vY29yZSc7XG5pbXBvcnQgKiBhcyBvIGZyb20gJy4uLy4uLy4uLy4uL291dHB1dC9vdXRwdXRfYXN0JztcbmltcG9ydCAqIGFzIGlyIGZyb20gJy4uLy4uL2lyJztcblxuaW1wb3J0IHtDb21wb25lbnRDb21waWxhdGlvbkpvYiwgSG9zdEJpbmRpbmdDb21waWxhdGlvbkpvYiwgdHlwZSBDb21waWxhdGlvbkpvYn0gZnJvbSAnLi4vY29tcGlsYXRpb24nO1xuaW1wb3J0IHtsaXRlcmFsT3JBcnJheUxpdGVyYWx9IGZyb20gJy4uL2NvbnZlcnNpb24nO1xuXG4vKipcbiAqIENvbnZlcnRzIHRoZSBzZW1hbnRpYyBhdHRyaWJ1dGVzIG9mIGVsZW1lbnQtbGlrZSBvcGVyYXRpb25zIChlbGVtZW50cywgdGVtcGxhdGVzKSBpbnRvIGNvbnN0YW50XG4gKiBhcnJheSBleHByZXNzaW9ucywgYW5kIGxpZnRzIHRoZW0gaW50byB0aGUgb3ZlcmFsbCBjb21wb25lbnQgYGNvbnN0c2AuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb2xsZWN0RWxlbWVudENvbnN0cyhqb2I6IENvbXBpbGF0aW9uSm9iKTogdm9pZCB7XG4gIC8vIENvbGxlY3QgYWxsIGV4dHJhY3RlZCBhdHRyaWJ1dGVzLlxuICBjb25zdCBhbGxFbGVtZW50QXR0cmlidXRlcyA9IG5ldyBNYXA8aXIuWHJlZklkLCBFbGVtZW50QXR0cmlidXRlcz4oKTtcbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC5jcmVhdGUpIHtcbiAgICAgIGlmIChvcC5raW5kID09PSBpci5PcEtpbmQuRXh0cmFjdGVkQXR0cmlidXRlKSB7XG4gICAgICAgIGNvbnN0IGF0dHJpYnV0ZXMgPVxuICAgICAgICAgICAgYWxsRWxlbWVudEF0dHJpYnV0ZXMuZ2V0KG9wLnRhcmdldCkgfHwgbmV3IEVsZW1lbnRBdHRyaWJ1dGVzKGpvYi5jb21wYXRpYmlsaXR5KTtcbiAgICAgICAgYWxsRWxlbWVudEF0dHJpYnV0ZXMuc2V0KG9wLnRhcmdldCwgYXR0cmlidXRlcyk7XG4gICAgICAgIGF0dHJpYnV0ZXMuYWRkKG9wLmJpbmRpbmdLaW5kLCBvcC5uYW1lLCBvcC5leHByZXNzaW9uLCBvcC5uYW1lc3BhY2UsIG9wLnRydXN0ZWRWYWx1ZUZuKTtcbiAgICAgICAgaXIuT3BMaXN0LnJlbW92ZTxpci5DcmVhdGVPcD4ob3ApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIFNlcmlhbGl6ZSB0aGUgZXh0cmFjdGVkIGF0dHJpYnV0ZXMgaW50byB0aGUgY29uc3QgYXJyYXkuXG4gIGlmIChqb2IgaW5zdGFuY2VvZiBDb21wb25lbnRDb21waWxhdGlvbkpvYikge1xuICAgIGZvciAoY29uc3QgdW5pdCBvZiBqb2IudW5pdHMpIHtcbiAgICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC5jcmVhdGUpIHtcbiAgICAgICAgLy8gVE9ETzogU2ltcGxpZnkgYW5kIGNvbWJpbmUgdGhlc2UgY2FzZXMuXG4gICAgICAgIGlmIChvcC5raW5kID09IGlyLk9wS2luZC5Qcm9qZWN0aW9uKSB7XG4gICAgICAgICAgY29uc3QgYXR0cmlidXRlcyA9IGFsbEVsZW1lbnRBdHRyaWJ1dGVzLmdldChvcC54cmVmKTtcbiAgICAgICAgICBpZiAoYXR0cmlidXRlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjb25zdCBhdHRyQXJyYXkgPSBzZXJpYWxpemVBdHRyaWJ1dGVzKGF0dHJpYnV0ZXMpO1xuICAgICAgICAgICAgaWYgKGF0dHJBcnJheS5lbnRyaWVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgb3AuYXR0cmlidXRlcyA9IGF0dHJBcnJheTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoaXIuaXNFbGVtZW50T3JDb250YWluZXJPcChvcCkpIHtcbiAgICAgICAgICBvcC5hdHRyaWJ1dGVzID0gZ2V0Q29uc3RJbmRleChqb2IsIGFsbEVsZW1lbnRBdHRyaWJ1dGVzLCBvcC54cmVmKTtcblxuICAgICAgICAgIC8vIFRPRE8oZHlsaHVubik6IGBAZm9yYCBsb29wcyB3aXRoIGBAZW1wdHlgIGJsb2NrcyBuZWVkIHRvIGJlIHNwZWNpYWwtY2FzZWQgaGVyZSxcbiAgICAgICAgICAvLyBiZWNhdXNlIHRoZSBzbG90IGNvbnN1bWVyIHRyYWl0IGN1cnJlbnRseSBvbmx5IHN1cHBvcnRzIG9uZSBzbG90IHBlciBjb25zdW1lciBhbmQgd2VcbiAgICAgICAgICAvLyBuZWVkIHR3by4gVGhpcyBzaG91bGQgYmUgcmV2aXNpdGVkIHdoZW4gbWFraW5nIHRoZSByZWZhY3RvcnMgbWVudGlvbmVkIGluOlxuICAgICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvcHVsbC81MzYyMCNkaXNjdXNzaW9uX3IxNDMwOTE4ODIyXG4gICAgICAgICAgaWYgKG9wLmtpbmQgPT09IGlyLk9wS2luZC5SZXBlYXRlckNyZWF0ZSAmJiBvcC5lbXB0eVZpZXcgIT09IG51bGwpIHtcbiAgICAgICAgICAgIG9wLmVtcHR5QXR0cmlidXRlcyA9IGdldENvbnN0SW5kZXgoam9iLCBhbGxFbGVtZW50QXR0cmlidXRlcywgb3AuZW1wdHlWaWV3KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSBpZiAoam9iIGluc3RhbmNlb2YgSG9zdEJpbmRpbmdDb21waWxhdGlvbkpvYikge1xuICAgIC8vIFRPRE86IElmIHRoZSBob3N0IGJpbmRpbmcgY2FzZSBmdXJ0aGVyIGRpdmVyZ2VzLCB3ZSBtYXkgd2FudCB0byBzcGxpdCBpdCBpbnRvIGl0cyBvd25cbiAgICAvLyBwaGFzZS5cbiAgICBmb3IgKGNvbnN0IFt4cmVmLCBhdHRyaWJ1dGVzXSBvZiBhbGxFbGVtZW50QXR0cmlidXRlcy5lbnRyaWVzKCkpIHtcbiAgICAgIGlmICh4cmVmICE9PSBqb2Iucm9vdC54cmVmKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBBbiBhdHRyaWJ1dGUgd291bGQgYmUgY29uc3QgY29sbGVjdGVkIGludG8gdGhlIGhvc3QgYmluZGluZydzIHRlbXBsYXRlIGZ1bmN0aW9uLCBidXQgaXMgbm90IGFzc29jaWF0ZWQgd2l0aCB0aGUgcm9vdCB4cmVmLmApO1xuICAgICAgfVxuICAgICAgY29uc3QgYXR0ckFycmF5ID0gc2VyaWFsaXplQXR0cmlidXRlcyhhdHRyaWJ1dGVzKTtcbiAgICAgIGlmIChhdHRyQXJyYXkuZW50cmllcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGpvYi5yb290LmF0dHJpYnV0ZXMgPSBhdHRyQXJyYXk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGdldENvbnN0SW5kZXgoXG4gICAgam9iOiBDb21wb25lbnRDb21waWxhdGlvbkpvYiwgYWxsRWxlbWVudEF0dHJpYnV0ZXM6IE1hcDxpci5YcmVmSWQsIEVsZW1lbnRBdHRyaWJ1dGVzPixcbiAgICB4cmVmOiBpci5YcmVmSWQpOiBpci5Db25zdEluZGV4fG51bGwge1xuICBjb25zdCBhdHRyaWJ1dGVzID0gYWxsRWxlbWVudEF0dHJpYnV0ZXMuZ2V0KHhyZWYpO1xuICBpZiAoYXR0cmlidXRlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgY29uc3QgYXR0ckFycmF5ID0gc2VyaWFsaXplQXR0cmlidXRlcyhhdHRyaWJ1dGVzKTtcbiAgICBpZiAoYXR0ckFycmF5LmVudHJpZXMubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIGpvYi5hZGRDb25zdChhdHRyQXJyYXkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuLyoqXG4gKiBTaGFyZWQgaW5zdGFuY2Ugb2YgYW4gZW1wdHkgYXJyYXkgdG8gYXZvaWQgdW5uZWNlc3NhcnkgYXJyYXkgYWxsb2NhdGlvbnMuXG4gKi9cbmNvbnN0IEZMWVdFSUdIVF9BUlJBWTogUmVhZG9ubHlBcnJheTxvLkV4cHJlc3Npb24+ID0gT2JqZWN0LmZyZWV6ZTxvLkV4cHJlc3Npb25bXT4oW10pO1xuXG4vKipcbiAqIENvbnRhaW5lciBmb3IgYWxsIG9mIHRoZSB2YXJpb3VzIGtpbmRzIG9mIGF0dHJpYnV0ZXMgd2hpY2ggYXJlIGFwcGxpZWQgb24gYW4gZWxlbWVudC5cbiAqL1xuY2xhc3MgRWxlbWVudEF0dHJpYnV0ZXMge1xuICBwcml2YXRlIGtub3duID0gbmV3IE1hcDxpci5CaW5kaW5nS2luZCwgU2V0PHN0cmluZz4+KCk7XG4gIHByaXZhdGUgYnlLaW5kID0gbmV3IE1hcDxcbiAgICAgIC8vIFByb3BlcnR5IGJpbmRpbmdzIGFyZSBleGNsdWRlZCBoZXJlLCBiZWNhdXNlIHRoZXkgbmVlZCB0byBiZSB0cmFja2VkIGluIHRoZSBzYW1lXG4gICAgICAvLyBhcnJheSB0byBtYWludGFpbiB0aGVpciBvcmRlci4gVGhleSdyZSB0cmFja2VkIGluIHRoZSBgcHJvcGVydHlCaW5kaW5nc2AgYXJyYXkuXG4gICAgICBFeGNsdWRlPGlyLkJpbmRpbmdLaW5kLCBpci5CaW5kaW5nS2luZC5Qcm9wZXJ0eXxpci5CaW5kaW5nS2luZC5Ud29XYXlQcm9wZXJ0eT4sXG4gICAgICBvLkV4cHJlc3Npb25bXT47XG4gIHByaXZhdGUgcHJvcGVydHlCaW5kaW5nczogby5FeHByZXNzaW9uW118bnVsbCA9IG51bGw7XG5cbiAgcHJvamVjdEFzOiBzdHJpbmd8bnVsbCA9IG51bGw7XG5cbiAgZ2V0IGF0dHJpYnV0ZXMoKTogUmVhZG9ubHlBcnJheTxvLkV4cHJlc3Npb24+IHtcbiAgICByZXR1cm4gdGhpcy5ieUtpbmQuZ2V0KGlyLkJpbmRpbmdLaW5kLkF0dHJpYnV0ZSkgPz8gRkxZV0VJR0hUX0FSUkFZO1xuICB9XG5cbiAgZ2V0IGNsYXNzZXMoKTogUmVhZG9ubHlBcnJheTxvLkV4cHJlc3Npb24+IHtcbiAgICByZXR1cm4gdGhpcy5ieUtpbmQuZ2V0KGlyLkJpbmRpbmdLaW5kLkNsYXNzTmFtZSkgPz8gRkxZV0VJR0hUX0FSUkFZO1xuICB9XG5cbiAgZ2V0IHN0eWxlcygpOiBSZWFkb25seUFycmF5PG8uRXhwcmVzc2lvbj4ge1xuICAgIHJldHVybiB0aGlzLmJ5S2luZC5nZXQoaXIuQmluZGluZ0tpbmQuU3R5bGVQcm9wZXJ0eSkgPz8gRkxZV0VJR0hUX0FSUkFZO1xuICB9XG5cbiAgZ2V0IGJpbmRpbmdzKCk6IFJlYWRvbmx5QXJyYXk8by5FeHByZXNzaW9uPiB7XG4gICAgcmV0dXJuIHRoaXMucHJvcGVydHlCaW5kaW5ncyA/PyBGTFlXRUlHSFRfQVJSQVk7XG4gIH1cblxuICBnZXQgdGVtcGxhdGUoKTogUmVhZG9ubHlBcnJheTxvLkV4cHJlc3Npb24+IHtcbiAgICByZXR1cm4gdGhpcy5ieUtpbmQuZ2V0KGlyLkJpbmRpbmdLaW5kLlRlbXBsYXRlKSA/PyBGTFlXRUlHSFRfQVJSQVk7XG4gIH1cblxuICBnZXQgaTE4bigpOiBSZWFkb25seUFycmF5PG8uRXhwcmVzc2lvbj4ge1xuICAgIHJldHVybiB0aGlzLmJ5S2luZC5nZXQoaXIuQmluZGluZ0tpbmQuSTE4bikgPz8gRkxZV0VJR0hUX0FSUkFZO1xuICB9XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBjb21wYXRpYmlsaXR5OiBpci5Db21wYXRpYmlsaXR5TW9kZSkge31cblxuICBwcml2YXRlIGlzS25vd24oa2luZDogaXIuQmluZGluZ0tpbmQsIG5hbWU6IHN0cmluZykge1xuICAgIGNvbnN0IG5hbWVUb1ZhbHVlID0gdGhpcy5rbm93bi5nZXQoa2luZCkgPz8gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgdGhpcy5rbm93bi5zZXQoa2luZCwgbmFtZVRvVmFsdWUpO1xuICAgIGlmIChuYW1lVG9WYWx1ZS5oYXMobmFtZSkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBuYW1lVG9WYWx1ZS5hZGQobmFtZSk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgYWRkKGtpbmQ6IGlyLkJpbmRpbmdLaW5kLCBuYW1lOiBzdHJpbmcsIHZhbHVlOiBvLkV4cHJlc3Npb258bnVsbCwgbmFtZXNwYWNlOiBzdHJpbmd8bnVsbCxcbiAgICAgIHRydXN0ZWRWYWx1ZUZuOiBvLkV4cHJlc3Npb258bnVsbCk6IHZvaWQge1xuICAgIC8vIFRlbXBsYXRlRGVmaW5pdGlvbkJ1aWxkZXIgcHV0cyBkdXBsaWNhdGUgYXR0cmlidXRlLCBjbGFzcywgYW5kIHN0eWxlIHZhbHVlcyBpbnRvIHRoZSBjb25zdHNcbiAgICAvLyBhcnJheS4gVGhpcyBzZWVtcyBpbmVmZmljaWVudCwgd2UgY2FuIHByb2JhYmx5IGtlZXAganVzdCB0aGUgZmlyc3Qgb25lIG9yIHRoZSBsYXN0IHZhbHVlXG4gICAgLy8gKHdoaWNoZXZlciBhY3R1YWxseSBnZXRzIGFwcGxpZWQgd2hlbiBtdWx0aXBsZSB2YWx1ZXMgYXJlIGxpc3RlZCBmb3IgdGhlIHNhbWUgYXR0cmlidXRlKS5cbiAgICBjb25zdCBhbGxvd0R1cGxpY2F0ZXMgPSB0aGlzLmNvbXBhdGliaWxpdHkgPT09IGlyLkNvbXBhdGliaWxpdHlNb2RlLlRlbXBsYXRlRGVmaW5pdGlvbkJ1aWxkZXIgJiZcbiAgICAgICAgKGtpbmQgPT09IGlyLkJpbmRpbmdLaW5kLkF0dHJpYnV0ZSB8fCBraW5kID09PSBpci5CaW5kaW5nS2luZC5DbGFzc05hbWUgfHxcbiAgICAgICAgIGtpbmQgPT09IGlyLkJpbmRpbmdLaW5kLlN0eWxlUHJvcGVydHkpO1xuICAgIGlmICghYWxsb3dEdXBsaWNhdGVzICYmIHRoaXMuaXNLbm93bihraW5kLCBuYW1lKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFRPRE86IENhbiB0aGlzIGJlIGl0cyBvd24gcGhhc2VcbiAgICBpZiAobmFtZSA9PT0gJ25nUHJvamVjdEFzJykge1xuICAgICAgaWYgKHZhbHVlID09PSBudWxsIHx8ICEodmFsdWUgaW5zdGFuY2VvZiBvLkxpdGVyYWxFeHByKSB8fCAodmFsdWUudmFsdWUgPT0gbnVsbCkgfHxcbiAgICAgICAgICAodHlwZW9mIHZhbHVlLnZhbHVlPy50b1N0cmluZygpICE9PSAnc3RyaW5nJykpIHtcbiAgICAgICAgdGhyb3cgRXJyb3IoJ25nUHJvamVjdEFzIG11c3QgaGF2ZSBhIHN0cmluZyBsaXRlcmFsIHZhbHVlJyk7XG4gICAgICB9XG4gICAgICB0aGlzLnByb2plY3RBcyA9IHZhbHVlLnZhbHVlLnRvU3RyaW5nKCk7XG4gICAgICAvLyBUT0RPOiBUZW1wbGF0ZURlZmluaXRpb25CdWlsZGVyIGFsbG93cyBgbmdQcm9qZWN0QXNgIHRvIGFsc28gYmUgYXNzaWduZWQgYXMgYSBsaXRlcmFsXG4gICAgICAvLyBhdHRyaWJ1dGUuIElzIHRoaXMgc2FuZT9cbiAgICB9XG5cblxuICAgIGNvbnN0IGFycmF5ID0gdGhpcy5hcnJheUZvcihraW5kKTtcbiAgICBhcnJheS5wdXNoKC4uLmdldEF0dHJpYnV0ZU5hbWVMaXRlcmFscyhuYW1lc3BhY2UsIG5hbWUpKTtcbiAgICBpZiAoa2luZCA9PT0gaXIuQmluZGluZ0tpbmQuQXR0cmlidXRlIHx8IGtpbmQgPT09IGlyLkJpbmRpbmdLaW5kLlN0eWxlUHJvcGVydHkpIHtcbiAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBFcnJvcignQXR0cmlidXRlLCBpMThuIGF0dHJpYnV0ZSwgJiBzdHlsZSBlbGVtZW50IGF0dHJpYnV0ZXMgbXVzdCBoYXZlIGEgdmFsdWUnKTtcbiAgICAgIH1cbiAgICAgIGlmICh0cnVzdGVkVmFsdWVGbiAhPT0gbnVsbCkge1xuICAgICAgICBpZiAoIWlyLmlzU3RyaW5nTGl0ZXJhbCh2YWx1ZSkpIHtcbiAgICAgICAgICB0aHJvdyBFcnJvcignQXNzZXJ0aW9uRXJyb3I6IGV4dHJhY3RlZCBhdHRyaWJ1dGUgdmFsdWUgc2hvdWxkIGJlIHN0cmluZyBsaXRlcmFsJyk7XG4gICAgICAgIH1cbiAgICAgICAgYXJyYXkucHVzaChvLnRhZ2dlZFRlbXBsYXRlKFxuICAgICAgICAgICAgdHJ1c3RlZFZhbHVlRm4sIG5ldyBvLlRlbXBsYXRlTGl0ZXJhbChbbmV3IG8uVGVtcGxhdGVMaXRlcmFsRWxlbWVudCh2YWx1ZS52YWx1ZSldLCBbXSksXG4gICAgICAgICAgICB1bmRlZmluZWQsIHZhbHVlLnNvdXJjZVNwYW4pKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFycmF5LnB1c2godmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXJyYXlGb3Ioa2luZDogaXIuQmluZGluZ0tpbmQpOiBvLkV4cHJlc3Npb25bXSB7XG4gICAgaWYgKGtpbmQgPT09IGlyLkJpbmRpbmdLaW5kLlByb3BlcnR5IHx8IGtpbmQgPT09IGlyLkJpbmRpbmdLaW5kLlR3b1dheVByb3BlcnR5KSB7XG4gICAgICB0aGlzLnByb3BlcnR5QmluZGluZ3MgPz89IFtdO1xuICAgICAgcmV0dXJuIHRoaXMucHJvcGVydHlCaW5kaW5ncztcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCF0aGlzLmJ5S2luZC5oYXMoa2luZCkpIHtcbiAgICAgICAgdGhpcy5ieUtpbmQuc2V0KGtpbmQsIFtdKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLmJ5S2luZC5nZXQoa2luZCkhO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEdldHMgYW4gYXJyYXkgb2YgbGl0ZXJhbCBleHByZXNzaW9ucyByZXByZXNlbnRpbmcgdGhlIGF0dHJpYnV0ZSdzIG5hbWVzcGFjZWQgbmFtZS5cbiAqL1xuZnVuY3Rpb24gZ2V0QXR0cmlidXRlTmFtZUxpdGVyYWxzKG5hbWVzcGFjZTogc3RyaW5nfG51bGwsIG5hbWU6IHN0cmluZyk6IG8uTGl0ZXJhbEV4cHJbXSB7XG4gIGNvbnN0IG5hbWVMaXRlcmFsID0gby5saXRlcmFsKG5hbWUpO1xuXG4gIGlmIChuYW1lc3BhY2UpIHtcbiAgICByZXR1cm4gW28ubGl0ZXJhbChjb3JlLkF0dHJpYnV0ZU1hcmtlci5OYW1lc3BhY2VVUkkpLCBvLmxpdGVyYWwobmFtZXNwYWNlKSwgbmFtZUxpdGVyYWxdO1xuICB9XG5cbiAgcmV0dXJuIFtuYW1lTGl0ZXJhbF07XG59XG5cbi8qKlxuICogU2VyaWFsaXplcyBhbiBFbGVtZW50QXR0cmlidXRlcyBvYmplY3QgaW50byBhbiBhcnJheSBleHByZXNzaW9uLlxuICovXG5mdW5jdGlvbiBzZXJpYWxpemVBdHRyaWJ1dGVzKHthdHRyaWJ1dGVzLCBiaW5kaW5ncywgY2xhc3NlcywgaTE4biwgcHJvamVjdEFzLCBzdHlsZXMsIHRlbXBsYXRlfTpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEVsZW1lbnRBdHRyaWJ1dGVzKTogby5MaXRlcmFsQXJyYXlFeHByIHtcbiAgY29uc3QgYXR0ckFycmF5ID0gWy4uLmF0dHJpYnV0ZXNdO1xuXG4gIGlmIChwcm9qZWN0QXMgIT09IG51bGwpIHtcbiAgICAvLyBQYXJzZSB0aGUgYXR0cmlidXRlIHZhbHVlIGludG8gYSBDc3NTZWxlY3Rvckxpc3QuIE5vdGUgdGhhdCB3ZSBvbmx5IHRha2UgdGhlXG4gICAgLy8gZmlyc3Qgc2VsZWN0b3IsIGJlY2F1c2Ugd2UgZG9uJ3Qgc3VwcG9ydCBtdWx0aXBsZSBzZWxlY3RvcnMgaW4gbmdQcm9qZWN0QXMuXG4gICAgY29uc3QgcGFyc2VkUjNTZWxlY3RvciA9IGNvcmUucGFyc2VTZWxlY3RvclRvUjNTZWxlY3Rvcihwcm9qZWN0QXMpWzBdO1xuICAgIGF0dHJBcnJheS5wdXNoKFxuICAgICAgICBvLmxpdGVyYWwoY29yZS5BdHRyaWJ1dGVNYXJrZXIuUHJvamVjdEFzKSwgbGl0ZXJhbE9yQXJyYXlMaXRlcmFsKHBhcnNlZFIzU2VsZWN0b3IpKTtcbiAgfVxuICBpZiAoY2xhc3Nlcy5sZW5ndGggPiAwKSB7XG4gICAgYXR0ckFycmF5LnB1c2goby5saXRlcmFsKGNvcmUuQXR0cmlidXRlTWFya2VyLkNsYXNzZXMpLCAuLi5jbGFzc2VzKTtcbiAgfVxuICBpZiAoc3R5bGVzLmxlbmd0aCA+IDApIHtcbiAgICBhdHRyQXJyYXkucHVzaChvLmxpdGVyYWwoY29yZS5BdHRyaWJ1dGVNYXJrZXIuU3R5bGVzKSwgLi4uc3R5bGVzKTtcbiAgfVxuICBpZiAoYmluZGluZ3MubGVuZ3RoID4gMCkge1xuICAgIGF0dHJBcnJheS5wdXNoKG8ubGl0ZXJhbChjb3JlLkF0dHJpYnV0ZU1hcmtlci5CaW5kaW5ncyksIC4uLmJpbmRpbmdzKTtcbiAgfVxuICBpZiAodGVtcGxhdGUubGVuZ3RoID4gMCkge1xuICAgIGF0dHJBcnJheS5wdXNoKG8ubGl0ZXJhbChjb3JlLkF0dHJpYnV0ZU1hcmtlci5UZW1wbGF0ZSksIC4uLnRlbXBsYXRlKTtcbiAgfVxuICBpZiAoaTE4bi5sZW5ndGggPiAwKSB7XG4gICAgYXR0ckFycmF5LnB1c2goby5saXRlcmFsKGNvcmUuQXR0cmlidXRlTWFya2VyLkkxOG4pLCAuLi5pMThuKTtcbiAgfVxuICByZXR1cm4gby5saXRlcmFsQXJyKGF0dHJBcnJheSk7XG59XG4iXX0=