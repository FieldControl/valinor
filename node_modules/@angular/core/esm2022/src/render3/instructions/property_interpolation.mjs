import { RENDERER } from '../interfaces/view';
import { getBindingIndex, getLView, getSelectedTNode, getTView } from '../state';
import { NO_CHANGE } from '../tokens';
import { interpolation1, interpolation2, interpolation3, interpolation4, interpolation5, interpolation6, interpolation7, interpolation8, interpolationV, } from './interpolation';
import { elementPropertyInternal, storePropertyBindingMetadata } from './shared';
/**
 *
 * Update an interpolated property on an element with a lone bound value
 *
 * Used when the value passed to a property has 1 interpolated value in it, an no additional text
 * surrounds that interpolated value:
 *
 * ```html
 * <div title="{{v0}}"></div>
 * ```
 *
 * Its compiled representation is::
 *
 * ```ts
 * ɵɵpropertyInterpolate('title', v0);
 * ```
 *
 * If the property name also exists as an input property on one of the element's directives,
 * the component property will be set instead of the element property. This check must
 * be conducted at runtime so child components that add new `@Inputs` don't have to be re-compiled.
 *
 * @param propName The name of the property to update
 * @param prefix Static value used for concatenation only.
 * @param v0 Value checked for change.
 * @param suffix Static value used for concatenation only.
 * @param sanitizer An optional sanitizer function
 * @returns itself, so that it may be chained.
 * @codeGenApi
 */
export function ɵɵpropertyInterpolate(propName, v0, sanitizer) {
    ɵɵpropertyInterpolate1(propName, '', v0, '', sanitizer);
    return ɵɵpropertyInterpolate;
}
/**
 *
 * Update an interpolated property on an element with single bound value surrounded by text.
 *
 * Used when the value passed to a property has 1 interpolated value in it:
 *
 * ```html
 * <div title="prefix{{v0}}suffix"></div>
 * ```
 *
 * Its compiled representation is::
 *
 * ```ts
 * ɵɵpropertyInterpolate1('title', 'prefix', v0, 'suffix');
 * ```
 *
 * If the property name also exists as an input property on one of the element's directives,
 * the component property will be set instead of the element property. This check must
 * be conducted at runtime so child components that add new `@Inputs` don't have to be re-compiled.
 *
 * @param propName The name of the property to update
 * @param prefix Static value used for concatenation only.
 * @param v0 Value checked for change.
 * @param suffix Static value used for concatenation only.
 * @param sanitizer An optional sanitizer function
 * @returns itself, so that it may be chained.
 * @codeGenApi
 */
export function ɵɵpropertyInterpolate1(propName, prefix, v0, suffix, sanitizer) {
    const lView = getLView();
    const interpolatedValue = interpolation1(lView, prefix, v0, suffix);
    if (interpolatedValue !== NO_CHANGE) {
        const tView = getTView();
        const tNode = getSelectedTNode();
        elementPropertyInternal(tView, tNode, lView, propName, interpolatedValue, lView[RENDERER], sanitizer, false);
        ngDevMode &&
            storePropertyBindingMetadata(tView.data, tNode, propName, getBindingIndex() - 1, prefix, suffix);
    }
    return ɵɵpropertyInterpolate1;
}
/**
 *
 * Update an interpolated property on an element with 2 bound values surrounded by text.
 *
 * Used when the value passed to a property has 2 interpolated values in it:
 *
 * ```html
 * <div title="prefix{{v0}}-{{v1}}suffix"></div>
 * ```
 *
 * Its compiled representation is::
 *
 * ```ts
 * ɵɵpropertyInterpolate2('title', 'prefix', v0, '-', v1, 'suffix');
 * ```
 *
 * If the property name also exists as an input property on one of the element's directives,
 * the component property will be set instead of the element property. This check must
 * be conducted at runtime so child components that add new `@Inputs` don't have to be re-compiled.
 *
 * @param propName The name of the property to update
 * @param prefix Static value used for concatenation only.
 * @param v0 Value checked for change.
 * @param i0 Static value used for concatenation only.
 * @param v1 Value checked for change.
 * @param suffix Static value used for concatenation only.
 * @param sanitizer An optional sanitizer function
 * @returns itself, so that it may be chained.
 * @codeGenApi
 */
export function ɵɵpropertyInterpolate2(propName, prefix, v0, i0, v1, suffix, sanitizer) {
    const lView = getLView();
    const interpolatedValue = interpolation2(lView, prefix, v0, i0, v1, suffix);
    if (interpolatedValue !== NO_CHANGE) {
        const tView = getTView();
        const tNode = getSelectedTNode();
        elementPropertyInternal(tView, tNode, lView, propName, interpolatedValue, lView[RENDERER], sanitizer, false);
        ngDevMode &&
            storePropertyBindingMetadata(tView.data, tNode, propName, getBindingIndex() - 2, prefix, i0, suffix);
    }
    return ɵɵpropertyInterpolate2;
}
/**
 *
 * Update an interpolated property on an element with 3 bound values surrounded by text.
 *
 * Used when the value passed to a property has 3 interpolated values in it:
 *
 * ```html
 * <div title="prefix{{v0}}-{{v1}}-{{v2}}suffix"></div>
 * ```
 *
 * Its compiled representation is::
 *
 * ```ts
 * ɵɵpropertyInterpolate3(
 * 'title', 'prefix', v0, '-', v1, '-', v2, 'suffix');
 * ```
 *
 * If the property name also exists as an input property on one of the element's directives,
 * the component property will be set instead of the element property. This check must
 * be conducted at runtime so child components that add new `@Inputs` don't have to be re-compiled.
 *
 * @param propName The name of the property to update
 * @param prefix Static value used for concatenation only.
 * @param v0 Value checked for change.
 * @param i0 Static value used for concatenation only.
 * @param v1 Value checked for change.
 * @param i1 Static value used for concatenation only.
 * @param v2 Value checked for change.
 * @param suffix Static value used for concatenation only.
 * @param sanitizer An optional sanitizer function
 * @returns itself, so that it may be chained.
 * @codeGenApi
 */
export function ɵɵpropertyInterpolate3(propName, prefix, v0, i0, v1, i1, v2, suffix, sanitizer) {
    const lView = getLView();
    const interpolatedValue = interpolation3(lView, prefix, v0, i0, v1, i1, v2, suffix);
    if (interpolatedValue !== NO_CHANGE) {
        const tView = getTView();
        const tNode = getSelectedTNode();
        elementPropertyInternal(tView, tNode, lView, propName, interpolatedValue, lView[RENDERER], sanitizer, false);
        ngDevMode &&
            storePropertyBindingMetadata(tView.data, tNode, propName, getBindingIndex() - 3, prefix, i0, i1, suffix);
    }
    return ɵɵpropertyInterpolate3;
}
/**
 *
 * Update an interpolated property on an element with 4 bound values surrounded by text.
 *
 * Used when the value passed to a property has 4 interpolated values in it:
 *
 * ```html
 * <div title="prefix{{v0}}-{{v1}}-{{v2}}-{{v3}}suffix"></div>
 * ```
 *
 * Its compiled representation is::
 *
 * ```ts
 * ɵɵpropertyInterpolate4(
 * 'title', 'prefix', v0, '-', v1, '-', v2, '-', v3, 'suffix');
 * ```
 *
 * If the property name also exists as an input property on one of the element's directives,
 * the component property will be set instead of the element property. This check must
 * be conducted at runtime so child components that add new `@Inputs` don't have to be re-compiled.
 *
 * @param propName The name of the property to update
 * @param prefix Static value used for concatenation only.
 * @param v0 Value checked for change.
 * @param i0 Static value used for concatenation only.
 * @param v1 Value checked for change.
 * @param i1 Static value used for concatenation only.
 * @param v2 Value checked for change.
 * @param i2 Static value used for concatenation only.
 * @param v3 Value checked for change.
 * @param suffix Static value used for concatenation only.
 * @param sanitizer An optional sanitizer function
 * @returns itself, so that it may be chained.
 * @codeGenApi
 */
export function ɵɵpropertyInterpolate4(propName, prefix, v0, i0, v1, i1, v2, i2, v3, suffix, sanitizer) {
    const lView = getLView();
    const interpolatedValue = interpolation4(lView, prefix, v0, i0, v1, i1, v2, i2, v3, suffix);
    if (interpolatedValue !== NO_CHANGE) {
        const tView = getTView();
        const tNode = getSelectedTNode();
        elementPropertyInternal(tView, tNode, lView, propName, interpolatedValue, lView[RENDERER], sanitizer, false);
        ngDevMode &&
            storePropertyBindingMetadata(tView.data, tNode, propName, getBindingIndex() - 4, prefix, i0, i1, i2, suffix);
    }
    return ɵɵpropertyInterpolate4;
}
/**
 *
 * Update an interpolated property on an element with 5 bound values surrounded by text.
 *
 * Used when the value passed to a property has 5 interpolated values in it:
 *
 * ```html
 * <div title="prefix{{v0}}-{{v1}}-{{v2}}-{{v3}}-{{v4}}suffix"></div>
 * ```
 *
 * Its compiled representation is::
 *
 * ```ts
 * ɵɵpropertyInterpolate5(
 * 'title', 'prefix', v0, '-', v1, '-', v2, '-', v3, '-', v4, 'suffix');
 * ```
 *
 * If the property name also exists as an input property on one of the element's directives,
 * the component property will be set instead of the element property. This check must
 * be conducted at runtime so child components that add new `@Inputs` don't have to be re-compiled.
 *
 * @param propName The name of the property to update
 * @param prefix Static value used for concatenation only.
 * @param v0 Value checked for change.
 * @param i0 Static value used for concatenation only.
 * @param v1 Value checked for change.
 * @param i1 Static value used for concatenation only.
 * @param v2 Value checked for change.
 * @param i2 Static value used for concatenation only.
 * @param v3 Value checked for change.
 * @param i3 Static value used for concatenation only.
 * @param v4 Value checked for change.
 * @param suffix Static value used for concatenation only.
 * @param sanitizer An optional sanitizer function
 * @returns itself, so that it may be chained.
 * @codeGenApi
 */
export function ɵɵpropertyInterpolate5(propName, prefix, v0, i0, v1, i1, v2, i2, v3, i3, v4, suffix, sanitizer) {
    const lView = getLView();
    const interpolatedValue = interpolation5(lView, prefix, v0, i0, v1, i1, v2, i2, v3, i3, v4, suffix);
    if (interpolatedValue !== NO_CHANGE) {
        const tView = getTView();
        const tNode = getSelectedTNode();
        elementPropertyInternal(tView, tNode, lView, propName, interpolatedValue, lView[RENDERER], sanitizer, false);
        ngDevMode &&
            storePropertyBindingMetadata(tView.data, tNode, propName, getBindingIndex() - 5, prefix, i0, i1, i2, i3, suffix);
    }
    return ɵɵpropertyInterpolate5;
}
/**
 *
 * Update an interpolated property on an element with 6 bound values surrounded by text.
 *
 * Used when the value passed to a property has 6 interpolated values in it:
 *
 * ```html
 * <div title="prefix{{v0}}-{{v1}}-{{v2}}-{{v3}}-{{v4}}-{{v5}}suffix"></div>
 * ```
 *
 * Its compiled representation is::
 *
 * ```ts
 * ɵɵpropertyInterpolate6(
 *    'title', 'prefix', v0, '-', v1, '-', v2, '-', v3, '-', v4, '-', v5, 'suffix');
 * ```
 *
 * If the property name also exists as an input property on one of the element's directives,
 * the component property will be set instead of the element property. This check must
 * be conducted at runtime so child components that add new `@Inputs` don't have to be re-compiled.
 *
 * @param propName The name of the property to update
 * @param prefix Static value used for concatenation only.
 * @param v0 Value checked for change.
 * @param i0 Static value used for concatenation only.
 * @param v1 Value checked for change.
 * @param i1 Static value used for concatenation only.
 * @param v2 Value checked for change.
 * @param i2 Static value used for concatenation only.
 * @param v3 Value checked for change.
 * @param i3 Static value used for concatenation only.
 * @param v4 Value checked for change.
 * @param i4 Static value used for concatenation only.
 * @param v5 Value checked for change.
 * @param suffix Static value used for concatenation only.
 * @param sanitizer An optional sanitizer function
 * @returns itself, so that it may be chained.
 * @codeGenApi
 */
export function ɵɵpropertyInterpolate6(propName, prefix, v0, i0, v1, i1, v2, i2, v3, i3, v4, i4, v5, suffix, sanitizer) {
    const lView = getLView();
    const interpolatedValue = interpolation6(lView, prefix, v0, i0, v1, i1, v2, i2, v3, i3, v4, i4, v5, suffix);
    if (interpolatedValue !== NO_CHANGE) {
        const tView = getTView();
        const tNode = getSelectedTNode();
        elementPropertyInternal(tView, tNode, lView, propName, interpolatedValue, lView[RENDERER], sanitizer, false);
        ngDevMode &&
            storePropertyBindingMetadata(tView.data, tNode, propName, getBindingIndex() - 6, prefix, i0, i1, i2, i3, i4, suffix);
    }
    return ɵɵpropertyInterpolate6;
}
/**
 *
 * Update an interpolated property on an element with 7 bound values surrounded by text.
 *
 * Used when the value passed to a property has 7 interpolated values in it:
 *
 * ```html
 * <div title="prefix{{v0}}-{{v1}}-{{v2}}-{{v3}}-{{v4}}-{{v5}}-{{v6}}suffix"></div>
 * ```
 *
 * Its compiled representation is::
 *
 * ```ts
 * ɵɵpropertyInterpolate7(
 *    'title', 'prefix', v0, '-', v1, '-', v2, '-', v3, '-', v4, '-', v5, '-', v6, 'suffix');
 * ```
 *
 * If the property name also exists as an input property on one of the element's directives,
 * the component property will be set instead of the element property. This check must
 * be conducted at runtime so child components that add new `@Inputs` don't have to be re-compiled.
 *
 * @param propName The name of the property to update
 * @param prefix Static value used for concatenation only.
 * @param v0 Value checked for change.
 * @param i0 Static value used for concatenation only.
 * @param v1 Value checked for change.
 * @param i1 Static value used for concatenation only.
 * @param v2 Value checked for change.
 * @param i2 Static value used for concatenation only.
 * @param v3 Value checked for change.
 * @param i3 Static value used for concatenation only.
 * @param v4 Value checked for change.
 * @param i4 Static value used for concatenation only.
 * @param v5 Value checked for change.
 * @param i5 Static value used for concatenation only.
 * @param v6 Value checked for change.
 * @param suffix Static value used for concatenation only.
 * @param sanitizer An optional sanitizer function
 * @returns itself, so that it may be chained.
 * @codeGenApi
 */
export function ɵɵpropertyInterpolate7(propName, prefix, v0, i0, v1, i1, v2, i2, v3, i3, v4, i4, v5, i5, v6, suffix, sanitizer) {
    const lView = getLView();
    const interpolatedValue = interpolation7(lView, prefix, v0, i0, v1, i1, v2, i2, v3, i3, v4, i4, v5, i5, v6, suffix);
    if (interpolatedValue !== NO_CHANGE) {
        const tView = getTView();
        const tNode = getSelectedTNode();
        elementPropertyInternal(tView, tNode, lView, propName, interpolatedValue, lView[RENDERER], sanitizer, false);
        ngDevMode &&
            storePropertyBindingMetadata(tView.data, tNode, propName, getBindingIndex() - 7, prefix, i0, i1, i2, i3, i4, i5, suffix);
    }
    return ɵɵpropertyInterpolate7;
}
/**
 *
 * Update an interpolated property on an element with 8 bound values surrounded by text.
 *
 * Used when the value passed to a property has 8 interpolated values in it:
 *
 * ```html
 * <div title="prefix{{v0}}-{{v1}}-{{v2}}-{{v3}}-{{v4}}-{{v5}}-{{v6}}-{{v7}}suffix"></div>
 * ```
 *
 * Its compiled representation is::
 *
 * ```ts
 * ɵɵpropertyInterpolate8(
 *  'title', 'prefix', v0, '-', v1, '-', v2, '-', v3, '-', v4, '-', v5, '-', v6, '-', v7, 'suffix');
 * ```
 *
 * If the property name also exists as an input property on one of the element's directives,
 * the component property will be set instead of the element property. This check must
 * be conducted at runtime so child components that add new `@Inputs` don't have to be re-compiled.
 *
 * @param propName The name of the property to update
 * @param prefix Static value used for concatenation only.
 * @param v0 Value checked for change.
 * @param i0 Static value used for concatenation only.
 * @param v1 Value checked for change.
 * @param i1 Static value used for concatenation only.
 * @param v2 Value checked for change.
 * @param i2 Static value used for concatenation only.
 * @param v3 Value checked for change.
 * @param i3 Static value used for concatenation only.
 * @param v4 Value checked for change.
 * @param i4 Static value used for concatenation only.
 * @param v5 Value checked for change.
 * @param i5 Static value used for concatenation only.
 * @param v6 Value checked for change.
 * @param i6 Static value used for concatenation only.
 * @param v7 Value checked for change.
 * @param suffix Static value used for concatenation only.
 * @param sanitizer An optional sanitizer function
 * @returns itself, so that it may be chained.
 * @codeGenApi
 */
export function ɵɵpropertyInterpolate8(propName, prefix, v0, i0, v1, i1, v2, i2, v3, i3, v4, i4, v5, i5, v6, i6, v7, suffix, sanitizer) {
    const lView = getLView();
    const interpolatedValue = interpolation8(lView, prefix, v0, i0, v1, i1, v2, i2, v3, i3, v4, i4, v5, i5, v6, i6, v7, suffix);
    if (interpolatedValue !== NO_CHANGE) {
        const tView = getTView();
        const tNode = getSelectedTNode();
        elementPropertyInternal(tView, tNode, lView, propName, interpolatedValue, lView[RENDERER], sanitizer, false);
        ngDevMode &&
            storePropertyBindingMetadata(tView.data, tNode, propName, getBindingIndex() - 8, prefix, i0, i1, i2, i3, i4, i5, i6, suffix);
    }
    return ɵɵpropertyInterpolate8;
}
/**
 * Update an interpolated property on an element with 9 or more bound values surrounded by text.
 *
 * Used when the number of interpolated values exceeds 8.
 *
 * ```html
 * <div
 *  title="prefix{{v0}}-{{v1}}-{{v2}}-{{v3}}-{{v4}}-{{v5}}-{{v6}}-{{v7}}-{{v8}}-{{v9}}suffix"></div>
 * ```
 *
 * Its compiled representation is::
 *
 * ```ts
 * ɵɵpropertyInterpolateV(
 *  'title', ['prefix', v0, '-', v1, '-', v2, '-', v3, '-', v4, '-', v5, '-', v6, '-', v7, '-', v9,
 *  'suffix']);
 * ```
 *
 * If the property name also exists as an input property on one of the element's directives,
 * the component property will be set instead of the element property. This check must
 * be conducted at runtime so child components that add new `@Inputs` don't have to be re-compiled.
 *
 * @param propName The name of the property to update.
 * @param values The collection of values and the strings in between those values, beginning with a
 * string prefix and ending with a string suffix.
 * (e.g. `['prefix', value0, '-', value1, '-', value2, ..., value99, 'suffix']`)
 * @param sanitizer An optional sanitizer function
 * @returns itself, so that it may be chained.
 * @codeGenApi
 */
export function ɵɵpropertyInterpolateV(propName, values, sanitizer) {
    const lView = getLView();
    const interpolatedValue = interpolationV(lView, values);
    if (interpolatedValue !== NO_CHANGE) {
        const tView = getTView();
        const tNode = getSelectedTNode();
        elementPropertyInternal(tView, tNode, lView, propName, interpolatedValue, lView[RENDERER], sanitizer, false);
        if (ngDevMode) {
            const interpolationInBetween = [values[0]]; // prefix
            for (let i = 2; i < values.length; i += 2) {
                interpolationInBetween.push(values[i]);
            }
            storePropertyBindingMetadata(tView.data, tNode, propName, getBindingIndex() - interpolationInBetween.length + 1, ...interpolationInBetween);
        }
    }
    return ɵɵpropertyInterpolateV;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvcGVydHlfaW50ZXJwb2xhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3JlbmRlcjMvaW5zdHJ1Y3Rpb25zL3Byb3BlcnR5X2ludGVycG9sYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBUUEsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBQzVDLE9BQU8sRUFBQyxlQUFlLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUMvRSxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sV0FBVyxDQUFDO0FBRXBDLE9BQU8sRUFDTCxjQUFjLEVBQ2QsY0FBYyxFQUNkLGNBQWMsRUFDZCxjQUFjLEVBQ2QsY0FBYyxFQUNkLGNBQWMsRUFDZCxjQUFjLEVBQ2QsY0FBYyxFQUNkLGNBQWMsR0FDZixNQUFNLGlCQUFpQixDQUFDO0FBQ3pCLE9BQU8sRUFBQyx1QkFBdUIsRUFBRSw0QkFBNEIsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUUvRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTRCRztBQUNILE1BQU0sVUFBVSxxQkFBcUIsQ0FDbkMsUUFBZ0IsRUFDaEIsRUFBTyxFQUNQLFNBQXVCO0lBRXZCLHNCQUFzQixDQUFDLFFBQVEsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUN4RCxPQUFPLHFCQUFxQixDQUFDO0FBQy9CLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBMkJHO0FBQ0gsTUFBTSxVQUFVLHNCQUFzQixDQUNwQyxRQUFnQixFQUNoQixNQUFjLEVBQ2QsRUFBTyxFQUNQLE1BQWMsRUFDZCxTQUF1QjtJQUV2QixNQUFNLEtBQUssR0FBRyxRQUFRLEVBQUUsQ0FBQztJQUN6QixNQUFNLGlCQUFpQixHQUFHLGNBQWMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNwRSxJQUFJLGlCQUFpQixLQUFLLFNBQVMsRUFBRSxDQUFDO1FBQ3BDLE1BQU0sS0FBSyxHQUFHLFFBQVEsRUFBRSxDQUFDO1FBQ3pCLE1BQU0sS0FBSyxHQUFHLGdCQUFnQixFQUFFLENBQUM7UUFDakMsdUJBQXVCLENBQ3JCLEtBQUssRUFDTCxLQUFLLEVBQ0wsS0FBSyxFQUNMLFFBQVEsRUFDUixpQkFBaUIsRUFDakIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUNmLFNBQVMsRUFDVCxLQUFLLENBQ04sQ0FBQztRQUNGLFNBQVM7WUFDUCw0QkFBNEIsQ0FDMUIsS0FBSyxDQUFDLElBQUksRUFDVixLQUFLLEVBQ0wsUUFBUSxFQUNSLGVBQWUsRUFBRSxHQUFHLENBQUMsRUFDckIsTUFBTSxFQUNOLE1BQU0sQ0FDUCxDQUFDO0lBQ04sQ0FBQztJQUNELE9BQU8sc0JBQXNCLENBQUM7QUFDaEMsQ0FBQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTZCRztBQUNILE1BQU0sVUFBVSxzQkFBc0IsQ0FDcEMsUUFBZ0IsRUFDaEIsTUFBYyxFQUNkLEVBQU8sRUFDUCxFQUFVLEVBQ1YsRUFBTyxFQUNQLE1BQWMsRUFDZCxTQUF1QjtJQUV2QixNQUFNLEtBQUssR0FBRyxRQUFRLEVBQUUsQ0FBQztJQUN6QixNQUFNLGlCQUFpQixHQUFHLGNBQWMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQzVFLElBQUksaUJBQWlCLEtBQUssU0FBUyxFQUFFLENBQUM7UUFDcEMsTUFBTSxLQUFLLEdBQUcsUUFBUSxFQUFFLENBQUM7UUFDekIsTUFBTSxLQUFLLEdBQUcsZ0JBQWdCLEVBQUUsQ0FBQztRQUNqQyx1QkFBdUIsQ0FDckIsS0FBSyxFQUNMLEtBQUssRUFDTCxLQUFLLEVBQ0wsUUFBUSxFQUNSLGlCQUFpQixFQUNqQixLQUFLLENBQUMsUUFBUSxDQUFDLEVBQ2YsU0FBUyxFQUNULEtBQUssQ0FDTixDQUFDO1FBQ0YsU0FBUztZQUNQLDRCQUE0QixDQUMxQixLQUFLLENBQUMsSUFBSSxFQUNWLEtBQUssRUFDTCxRQUFRLEVBQ1IsZUFBZSxFQUFFLEdBQUcsQ0FBQyxFQUNyQixNQUFNLEVBQ04sRUFBRSxFQUNGLE1BQU0sQ0FDUCxDQUFDO0lBQ04sQ0FBQztJQUNELE9BQU8sc0JBQXNCLENBQUM7QUFDaEMsQ0FBQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWdDRztBQUNILE1BQU0sVUFBVSxzQkFBc0IsQ0FDcEMsUUFBZ0IsRUFDaEIsTUFBYyxFQUNkLEVBQU8sRUFDUCxFQUFVLEVBQ1YsRUFBTyxFQUNQLEVBQVUsRUFDVixFQUFPLEVBQ1AsTUFBYyxFQUNkLFNBQXVCO0lBRXZCLE1BQU0sS0FBSyxHQUFHLFFBQVEsRUFBRSxDQUFDO0lBQ3pCLE1BQU0saUJBQWlCLEdBQUcsY0FBYyxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNwRixJQUFJLGlCQUFpQixLQUFLLFNBQVMsRUFBRSxDQUFDO1FBQ3BDLE1BQU0sS0FBSyxHQUFHLFFBQVEsRUFBRSxDQUFDO1FBQ3pCLE1BQU0sS0FBSyxHQUFHLGdCQUFnQixFQUFFLENBQUM7UUFDakMsdUJBQXVCLENBQ3JCLEtBQUssRUFDTCxLQUFLLEVBQ0wsS0FBSyxFQUNMLFFBQVEsRUFDUixpQkFBaUIsRUFDakIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUNmLFNBQVMsRUFDVCxLQUFLLENBQ04sQ0FBQztRQUNGLFNBQVM7WUFDUCw0QkFBNEIsQ0FDMUIsS0FBSyxDQUFDLElBQUksRUFDVixLQUFLLEVBQ0wsUUFBUSxFQUNSLGVBQWUsRUFBRSxHQUFHLENBQUMsRUFDckIsTUFBTSxFQUNOLEVBQUUsRUFDRixFQUFFLEVBQ0YsTUFBTSxDQUNQLENBQUM7SUFDTixDQUFDO0lBQ0QsT0FBTyxzQkFBc0IsQ0FBQztBQUNoQyxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FrQ0c7QUFDSCxNQUFNLFVBQVUsc0JBQXNCLENBQ3BDLFFBQWdCLEVBQ2hCLE1BQWMsRUFDZCxFQUFPLEVBQ1AsRUFBVSxFQUNWLEVBQU8sRUFDUCxFQUFVLEVBQ1YsRUFBTyxFQUNQLEVBQVUsRUFDVixFQUFPLEVBQ1AsTUFBYyxFQUNkLFNBQXVCO0lBRXZCLE1BQU0sS0FBSyxHQUFHLFFBQVEsRUFBRSxDQUFDO0lBQ3pCLE1BQU0saUJBQWlCLEdBQUcsY0FBYyxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQzVGLElBQUksaUJBQWlCLEtBQUssU0FBUyxFQUFFLENBQUM7UUFDcEMsTUFBTSxLQUFLLEdBQUcsUUFBUSxFQUFFLENBQUM7UUFDekIsTUFBTSxLQUFLLEdBQUcsZ0JBQWdCLEVBQUUsQ0FBQztRQUNqQyx1QkFBdUIsQ0FDckIsS0FBSyxFQUNMLEtBQUssRUFDTCxLQUFLLEVBQ0wsUUFBUSxFQUNSLGlCQUFpQixFQUNqQixLQUFLLENBQUMsUUFBUSxDQUFDLEVBQ2YsU0FBUyxFQUNULEtBQUssQ0FDTixDQUFDO1FBQ0YsU0FBUztZQUNQLDRCQUE0QixDQUMxQixLQUFLLENBQUMsSUFBSSxFQUNWLEtBQUssRUFDTCxRQUFRLEVBQ1IsZUFBZSxFQUFFLEdBQUcsQ0FBQyxFQUNyQixNQUFNLEVBQ04sRUFBRSxFQUNGLEVBQUUsRUFDRixFQUFFLEVBQ0YsTUFBTSxDQUNQLENBQUM7SUFDTixDQUFDO0lBQ0QsT0FBTyxzQkFBc0IsQ0FBQztBQUNoQyxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW9DRztBQUNILE1BQU0sVUFBVSxzQkFBc0IsQ0FDcEMsUUFBZ0IsRUFDaEIsTUFBYyxFQUNkLEVBQU8sRUFDUCxFQUFVLEVBQ1YsRUFBTyxFQUNQLEVBQVUsRUFDVixFQUFPLEVBQ1AsRUFBVSxFQUNWLEVBQU8sRUFDUCxFQUFVLEVBQ1YsRUFBTyxFQUNQLE1BQWMsRUFDZCxTQUF1QjtJQUV2QixNQUFNLEtBQUssR0FBRyxRQUFRLEVBQUUsQ0FBQztJQUN6QixNQUFNLGlCQUFpQixHQUFHLGNBQWMsQ0FDdEMsS0FBSyxFQUNMLE1BQU0sRUFDTixFQUFFLEVBQ0YsRUFBRSxFQUNGLEVBQUUsRUFDRixFQUFFLEVBQ0YsRUFBRSxFQUNGLEVBQUUsRUFDRixFQUFFLEVBQ0YsRUFBRSxFQUNGLEVBQUUsRUFDRixNQUFNLENBQ1AsQ0FBQztJQUNGLElBQUksaUJBQWlCLEtBQUssU0FBUyxFQUFFLENBQUM7UUFDcEMsTUFBTSxLQUFLLEdBQUcsUUFBUSxFQUFFLENBQUM7UUFDekIsTUFBTSxLQUFLLEdBQUcsZ0JBQWdCLEVBQUUsQ0FBQztRQUNqQyx1QkFBdUIsQ0FDckIsS0FBSyxFQUNMLEtBQUssRUFDTCxLQUFLLEVBQ0wsUUFBUSxFQUNSLGlCQUFpQixFQUNqQixLQUFLLENBQUMsUUFBUSxDQUFDLEVBQ2YsU0FBUyxFQUNULEtBQUssQ0FDTixDQUFDO1FBQ0YsU0FBUztZQUNQLDRCQUE0QixDQUMxQixLQUFLLENBQUMsSUFBSSxFQUNWLEtBQUssRUFDTCxRQUFRLEVBQ1IsZUFBZSxFQUFFLEdBQUcsQ0FBQyxFQUNyQixNQUFNLEVBQ04sRUFBRSxFQUNGLEVBQUUsRUFDRixFQUFFLEVBQ0YsRUFBRSxFQUNGLE1BQU0sQ0FDUCxDQUFDO0lBQ04sQ0FBQztJQUNELE9BQU8sc0JBQXNCLENBQUM7QUFDaEMsQ0FBQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNDRztBQUNILE1BQU0sVUFBVSxzQkFBc0IsQ0FDcEMsUUFBZ0IsRUFDaEIsTUFBYyxFQUNkLEVBQU8sRUFDUCxFQUFVLEVBQ1YsRUFBTyxFQUNQLEVBQVUsRUFDVixFQUFPLEVBQ1AsRUFBVSxFQUNWLEVBQU8sRUFDUCxFQUFVLEVBQ1YsRUFBTyxFQUNQLEVBQVUsRUFDVixFQUFPLEVBQ1AsTUFBYyxFQUNkLFNBQXVCO0lBRXZCLE1BQU0sS0FBSyxHQUFHLFFBQVEsRUFBRSxDQUFDO0lBQ3pCLE1BQU0saUJBQWlCLEdBQUcsY0FBYyxDQUN0QyxLQUFLLEVBQ0wsTUFBTSxFQUNOLEVBQUUsRUFDRixFQUFFLEVBQ0YsRUFBRSxFQUNGLEVBQUUsRUFDRixFQUFFLEVBQ0YsRUFBRSxFQUNGLEVBQUUsRUFDRixFQUFFLEVBQ0YsRUFBRSxFQUNGLEVBQUUsRUFDRixFQUFFLEVBQ0YsTUFBTSxDQUNQLENBQUM7SUFDRixJQUFJLGlCQUFpQixLQUFLLFNBQVMsRUFBRSxDQUFDO1FBQ3BDLE1BQU0sS0FBSyxHQUFHLFFBQVEsRUFBRSxDQUFDO1FBQ3pCLE1BQU0sS0FBSyxHQUFHLGdCQUFnQixFQUFFLENBQUM7UUFDakMsdUJBQXVCLENBQ3JCLEtBQUssRUFDTCxLQUFLLEVBQ0wsS0FBSyxFQUNMLFFBQVEsRUFDUixpQkFBaUIsRUFDakIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUNmLFNBQVMsRUFDVCxLQUFLLENBQ04sQ0FBQztRQUNGLFNBQVM7WUFDUCw0QkFBNEIsQ0FDMUIsS0FBSyxDQUFDLElBQUksRUFDVixLQUFLLEVBQ0wsUUFBUSxFQUNSLGVBQWUsRUFBRSxHQUFHLENBQUMsRUFDckIsTUFBTSxFQUNOLEVBQUUsRUFDRixFQUFFLEVBQ0YsRUFBRSxFQUNGLEVBQUUsRUFDRixFQUFFLEVBQ0YsTUFBTSxDQUNQLENBQUM7SUFDTixDQUFDO0lBQ0QsT0FBTyxzQkFBc0IsQ0FBQztBQUNoQyxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F3Q0c7QUFDSCxNQUFNLFVBQVUsc0JBQXNCLENBQ3BDLFFBQWdCLEVBQ2hCLE1BQWMsRUFDZCxFQUFPLEVBQ1AsRUFBVSxFQUNWLEVBQU8sRUFDUCxFQUFVLEVBQ1YsRUFBTyxFQUNQLEVBQVUsRUFDVixFQUFPLEVBQ1AsRUFBVSxFQUNWLEVBQU8sRUFDUCxFQUFVLEVBQ1YsRUFBTyxFQUNQLEVBQVUsRUFDVixFQUFPLEVBQ1AsTUFBYyxFQUNkLFNBQXVCO0lBRXZCLE1BQU0sS0FBSyxHQUFHLFFBQVEsRUFBRSxDQUFDO0lBQ3pCLE1BQU0saUJBQWlCLEdBQUcsY0FBYyxDQUN0QyxLQUFLLEVBQ0wsTUFBTSxFQUNOLEVBQUUsRUFDRixFQUFFLEVBQ0YsRUFBRSxFQUNGLEVBQUUsRUFDRixFQUFFLEVBQ0YsRUFBRSxFQUNGLEVBQUUsRUFDRixFQUFFLEVBQ0YsRUFBRSxFQUNGLEVBQUUsRUFDRixFQUFFLEVBQ0YsRUFBRSxFQUNGLEVBQUUsRUFDRixNQUFNLENBQ1AsQ0FBQztJQUNGLElBQUksaUJBQWlCLEtBQUssU0FBUyxFQUFFLENBQUM7UUFDcEMsTUFBTSxLQUFLLEdBQUcsUUFBUSxFQUFFLENBQUM7UUFDekIsTUFBTSxLQUFLLEdBQUcsZ0JBQWdCLEVBQUUsQ0FBQztRQUNqQyx1QkFBdUIsQ0FDckIsS0FBSyxFQUNMLEtBQUssRUFDTCxLQUFLLEVBQ0wsUUFBUSxFQUNSLGlCQUFpQixFQUNqQixLQUFLLENBQUMsUUFBUSxDQUFDLEVBQ2YsU0FBUyxFQUNULEtBQUssQ0FDTixDQUFDO1FBQ0YsU0FBUztZQUNQLDRCQUE0QixDQUMxQixLQUFLLENBQUMsSUFBSSxFQUNWLEtBQUssRUFDTCxRQUFRLEVBQ1IsZUFBZSxFQUFFLEdBQUcsQ0FBQyxFQUNyQixNQUFNLEVBQ04sRUFBRSxFQUNGLEVBQUUsRUFDRixFQUFFLEVBQ0YsRUFBRSxFQUNGLEVBQUUsRUFDRixFQUFFLEVBQ0YsTUFBTSxDQUNQLENBQUM7SUFDTixDQUFDO0lBQ0QsT0FBTyxzQkFBc0IsQ0FBQztBQUNoQyxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTBDRztBQUNILE1BQU0sVUFBVSxzQkFBc0IsQ0FDcEMsUUFBZ0IsRUFDaEIsTUFBYyxFQUNkLEVBQU8sRUFDUCxFQUFVLEVBQ1YsRUFBTyxFQUNQLEVBQVUsRUFDVixFQUFPLEVBQ1AsRUFBVSxFQUNWLEVBQU8sRUFDUCxFQUFVLEVBQ1YsRUFBTyxFQUNQLEVBQVUsRUFDVixFQUFPLEVBQ1AsRUFBVSxFQUNWLEVBQU8sRUFDUCxFQUFVLEVBQ1YsRUFBTyxFQUNQLE1BQWMsRUFDZCxTQUF1QjtJQUV2QixNQUFNLEtBQUssR0FBRyxRQUFRLEVBQUUsQ0FBQztJQUN6QixNQUFNLGlCQUFpQixHQUFHLGNBQWMsQ0FDdEMsS0FBSyxFQUNMLE1BQU0sRUFDTixFQUFFLEVBQ0YsRUFBRSxFQUNGLEVBQUUsRUFDRixFQUFFLEVBQ0YsRUFBRSxFQUNGLEVBQUUsRUFDRixFQUFFLEVBQ0YsRUFBRSxFQUNGLEVBQUUsRUFDRixFQUFFLEVBQ0YsRUFBRSxFQUNGLEVBQUUsRUFDRixFQUFFLEVBQ0YsRUFBRSxFQUNGLEVBQUUsRUFDRixNQUFNLENBQ1AsQ0FBQztJQUNGLElBQUksaUJBQWlCLEtBQUssU0FBUyxFQUFFLENBQUM7UUFDcEMsTUFBTSxLQUFLLEdBQUcsUUFBUSxFQUFFLENBQUM7UUFDekIsTUFBTSxLQUFLLEdBQUcsZ0JBQWdCLEVBQUUsQ0FBQztRQUNqQyx1QkFBdUIsQ0FDckIsS0FBSyxFQUNMLEtBQUssRUFDTCxLQUFLLEVBQ0wsUUFBUSxFQUNSLGlCQUFpQixFQUNqQixLQUFLLENBQUMsUUFBUSxDQUFDLEVBQ2YsU0FBUyxFQUNULEtBQUssQ0FDTixDQUFDO1FBQ0YsU0FBUztZQUNQLDRCQUE0QixDQUMxQixLQUFLLENBQUMsSUFBSSxFQUNWLEtBQUssRUFDTCxRQUFRLEVBQ1IsZUFBZSxFQUFFLEdBQUcsQ0FBQyxFQUNyQixNQUFNLEVBQ04sRUFBRSxFQUNGLEVBQUUsRUFDRixFQUFFLEVBQ0YsRUFBRSxFQUNGLEVBQUUsRUFDRixFQUFFLEVBQ0YsRUFBRSxFQUNGLE1BQU0sQ0FDUCxDQUFDO0lBQ04sQ0FBQztJQUNELE9BQU8sc0JBQXNCLENBQUM7QUFDaEMsQ0FBQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTZCRztBQUNILE1BQU0sVUFBVSxzQkFBc0IsQ0FDcEMsUUFBZ0IsRUFDaEIsTUFBYSxFQUNiLFNBQXVCO0lBRXZCLE1BQU0sS0FBSyxHQUFHLFFBQVEsRUFBRSxDQUFDO0lBQ3pCLE1BQU0saUJBQWlCLEdBQUcsY0FBYyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztJQUN4RCxJQUFJLGlCQUFpQixLQUFLLFNBQVMsRUFBRSxDQUFDO1FBQ3BDLE1BQU0sS0FBSyxHQUFHLFFBQVEsRUFBRSxDQUFDO1FBQ3pCLE1BQU0sS0FBSyxHQUFHLGdCQUFnQixFQUFFLENBQUM7UUFDakMsdUJBQXVCLENBQ3JCLEtBQUssRUFDTCxLQUFLLEVBQ0wsS0FBSyxFQUNMLFFBQVEsRUFDUixpQkFBaUIsRUFDakIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUNmLFNBQVMsRUFDVCxLQUFLLENBQ04sQ0FBQztRQUNGLElBQUksU0FBUyxFQUFFLENBQUM7WUFDZCxNQUFNLHNCQUFzQixHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO1lBQ3JELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDMUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pDLENBQUM7WUFDRCw0QkFBNEIsQ0FDMUIsS0FBSyxDQUFDLElBQUksRUFDVixLQUFLLEVBQ0wsUUFBUSxFQUNSLGVBQWUsRUFBRSxHQUFHLHNCQUFzQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQ3JELEdBQUcsc0JBQXNCLENBQzFCLENBQUM7UUFDSixDQUFDO0lBQ0gsQ0FBQztJQUNELE9BQU8sc0JBQXNCLENBQUM7QUFDaEMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cbmltcG9ydCB7U2FuaXRpemVyRm59IGZyb20gJy4uL2ludGVyZmFjZXMvc2FuaXRpemF0aW9uJztcbmltcG9ydCB7UkVOREVSRVJ9IGZyb20gJy4uL2ludGVyZmFjZXMvdmlldyc7XG5pbXBvcnQge2dldEJpbmRpbmdJbmRleCwgZ2V0TFZpZXcsIGdldFNlbGVjdGVkVE5vZGUsIGdldFRWaWV3fSBmcm9tICcuLi9zdGF0ZSc7XG5pbXBvcnQge05PX0NIQU5HRX0gZnJvbSAnLi4vdG9rZW5zJztcblxuaW1wb3J0IHtcbiAgaW50ZXJwb2xhdGlvbjEsXG4gIGludGVycG9sYXRpb24yLFxuICBpbnRlcnBvbGF0aW9uMyxcbiAgaW50ZXJwb2xhdGlvbjQsXG4gIGludGVycG9sYXRpb241LFxuICBpbnRlcnBvbGF0aW9uNixcbiAgaW50ZXJwb2xhdGlvbjcsXG4gIGludGVycG9sYXRpb244LFxuICBpbnRlcnBvbGF0aW9uVixcbn0gZnJvbSAnLi9pbnRlcnBvbGF0aW9uJztcbmltcG9ydCB7ZWxlbWVudFByb3BlcnR5SW50ZXJuYWwsIHN0b3JlUHJvcGVydHlCaW5kaW5nTWV0YWRhdGF9IGZyb20gJy4vc2hhcmVkJztcblxuLyoqXG4gKlxuICogVXBkYXRlIGFuIGludGVycG9sYXRlZCBwcm9wZXJ0eSBvbiBhbiBlbGVtZW50IHdpdGggYSBsb25lIGJvdW5kIHZhbHVlXG4gKlxuICogVXNlZCB3aGVuIHRoZSB2YWx1ZSBwYXNzZWQgdG8gYSBwcm9wZXJ0eSBoYXMgMSBpbnRlcnBvbGF0ZWQgdmFsdWUgaW4gaXQsIGFuIG5vIGFkZGl0aW9uYWwgdGV4dFxuICogc3Vycm91bmRzIHRoYXQgaW50ZXJwb2xhdGVkIHZhbHVlOlxuICpcbiAqIGBgYGh0bWxcbiAqIDxkaXYgdGl0bGU9XCJ7e3YwfX1cIj48L2Rpdj5cbiAqIGBgYFxuICpcbiAqIEl0cyBjb21waWxlZCByZXByZXNlbnRhdGlvbiBpczo6XG4gKlxuICogYGBgdHNcbiAqIMm1ybVwcm9wZXJ0eUludGVycG9sYXRlKCd0aXRsZScsIHYwKTtcbiAqIGBgYFxuICpcbiAqIElmIHRoZSBwcm9wZXJ0eSBuYW1lIGFsc28gZXhpc3RzIGFzIGFuIGlucHV0IHByb3BlcnR5IG9uIG9uZSBvZiB0aGUgZWxlbWVudCdzIGRpcmVjdGl2ZXMsXG4gKiB0aGUgY29tcG9uZW50IHByb3BlcnR5IHdpbGwgYmUgc2V0IGluc3RlYWQgb2YgdGhlIGVsZW1lbnQgcHJvcGVydHkuIFRoaXMgY2hlY2sgbXVzdFxuICogYmUgY29uZHVjdGVkIGF0IHJ1bnRpbWUgc28gY2hpbGQgY29tcG9uZW50cyB0aGF0IGFkZCBuZXcgYEBJbnB1dHNgIGRvbid0IGhhdmUgdG8gYmUgcmUtY29tcGlsZWQuXG4gKlxuICogQHBhcmFtIHByb3BOYW1lIFRoZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSB0byB1cGRhdGVcbiAqIEBwYXJhbSBwcmVmaXggU3RhdGljIHZhbHVlIHVzZWQgZm9yIGNvbmNhdGVuYXRpb24gb25seS5cbiAqIEBwYXJhbSB2MCBWYWx1ZSBjaGVja2VkIGZvciBjaGFuZ2UuXG4gKiBAcGFyYW0gc3VmZml4IFN0YXRpYyB2YWx1ZSB1c2VkIGZvciBjb25jYXRlbmF0aW9uIG9ubHkuXG4gKiBAcGFyYW0gc2FuaXRpemVyIEFuIG9wdGlvbmFsIHNhbml0aXplciBmdW5jdGlvblxuICogQHJldHVybnMgaXRzZWxmLCBzbyB0aGF0IGl0IG1heSBiZSBjaGFpbmVkLlxuICogQGNvZGVHZW5BcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIMm1ybVwcm9wZXJ0eUludGVycG9sYXRlKFxuICBwcm9wTmFtZTogc3RyaW5nLFxuICB2MDogYW55LFxuICBzYW5pdGl6ZXI/OiBTYW5pdGl6ZXJGbixcbik6IHR5cGVvZiDJtcm1cHJvcGVydHlJbnRlcnBvbGF0ZSB7XG4gIMm1ybVwcm9wZXJ0eUludGVycG9sYXRlMShwcm9wTmFtZSwgJycsIHYwLCAnJywgc2FuaXRpemVyKTtcbiAgcmV0dXJuIMm1ybVwcm9wZXJ0eUludGVycG9sYXRlO1xufVxuXG4vKipcbiAqXG4gKiBVcGRhdGUgYW4gaW50ZXJwb2xhdGVkIHByb3BlcnR5IG9uIGFuIGVsZW1lbnQgd2l0aCBzaW5nbGUgYm91bmQgdmFsdWUgc3Vycm91bmRlZCBieSB0ZXh0LlxuICpcbiAqIFVzZWQgd2hlbiB0aGUgdmFsdWUgcGFzc2VkIHRvIGEgcHJvcGVydHkgaGFzIDEgaW50ZXJwb2xhdGVkIHZhbHVlIGluIGl0OlxuICpcbiAqIGBgYGh0bWxcbiAqIDxkaXYgdGl0bGU9XCJwcmVmaXh7e3YwfX1zdWZmaXhcIj48L2Rpdj5cbiAqIGBgYFxuICpcbiAqIEl0cyBjb21waWxlZCByZXByZXNlbnRhdGlvbiBpczo6XG4gKlxuICogYGBgdHNcbiAqIMm1ybVwcm9wZXJ0eUludGVycG9sYXRlMSgndGl0bGUnLCAncHJlZml4JywgdjAsICdzdWZmaXgnKTtcbiAqIGBgYFxuICpcbiAqIElmIHRoZSBwcm9wZXJ0eSBuYW1lIGFsc28gZXhpc3RzIGFzIGFuIGlucHV0IHByb3BlcnR5IG9uIG9uZSBvZiB0aGUgZWxlbWVudCdzIGRpcmVjdGl2ZXMsXG4gKiB0aGUgY29tcG9uZW50IHByb3BlcnR5IHdpbGwgYmUgc2V0IGluc3RlYWQgb2YgdGhlIGVsZW1lbnQgcHJvcGVydHkuIFRoaXMgY2hlY2sgbXVzdFxuICogYmUgY29uZHVjdGVkIGF0IHJ1bnRpbWUgc28gY2hpbGQgY29tcG9uZW50cyB0aGF0IGFkZCBuZXcgYEBJbnB1dHNgIGRvbid0IGhhdmUgdG8gYmUgcmUtY29tcGlsZWQuXG4gKlxuICogQHBhcmFtIHByb3BOYW1lIFRoZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSB0byB1cGRhdGVcbiAqIEBwYXJhbSBwcmVmaXggU3RhdGljIHZhbHVlIHVzZWQgZm9yIGNvbmNhdGVuYXRpb24gb25seS5cbiAqIEBwYXJhbSB2MCBWYWx1ZSBjaGVja2VkIGZvciBjaGFuZ2UuXG4gKiBAcGFyYW0gc3VmZml4IFN0YXRpYyB2YWx1ZSB1c2VkIGZvciBjb25jYXRlbmF0aW9uIG9ubHkuXG4gKiBAcGFyYW0gc2FuaXRpemVyIEFuIG9wdGlvbmFsIHNhbml0aXplciBmdW5jdGlvblxuICogQHJldHVybnMgaXRzZWxmLCBzbyB0aGF0IGl0IG1heSBiZSBjaGFpbmVkLlxuICogQGNvZGVHZW5BcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIMm1ybVwcm9wZXJ0eUludGVycG9sYXRlMShcbiAgcHJvcE5hbWU6IHN0cmluZyxcbiAgcHJlZml4OiBzdHJpbmcsXG4gIHYwOiBhbnksXG4gIHN1ZmZpeDogc3RyaW5nLFxuICBzYW5pdGl6ZXI/OiBTYW5pdGl6ZXJGbixcbik6IHR5cGVvZiDJtcm1cHJvcGVydHlJbnRlcnBvbGF0ZTEge1xuICBjb25zdCBsVmlldyA9IGdldExWaWV3KCk7XG4gIGNvbnN0IGludGVycG9sYXRlZFZhbHVlID0gaW50ZXJwb2xhdGlvbjEobFZpZXcsIHByZWZpeCwgdjAsIHN1ZmZpeCk7XG4gIGlmIChpbnRlcnBvbGF0ZWRWYWx1ZSAhPT0gTk9fQ0hBTkdFKSB7XG4gICAgY29uc3QgdFZpZXcgPSBnZXRUVmlldygpO1xuICAgIGNvbnN0IHROb2RlID0gZ2V0U2VsZWN0ZWRUTm9kZSgpO1xuICAgIGVsZW1lbnRQcm9wZXJ0eUludGVybmFsKFxuICAgICAgdFZpZXcsXG4gICAgICB0Tm9kZSxcbiAgICAgIGxWaWV3LFxuICAgICAgcHJvcE5hbWUsXG4gICAgICBpbnRlcnBvbGF0ZWRWYWx1ZSxcbiAgICAgIGxWaWV3W1JFTkRFUkVSXSxcbiAgICAgIHNhbml0aXplcixcbiAgICAgIGZhbHNlLFxuICAgICk7XG4gICAgbmdEZXZNb2RlICYmXG4gICAgICBzdG9yZVByb3BlcnR5QmluZGluZ01ldGFkYXRhKFxuICAgICAgICB0Vmlldy5kYXRhLFxuICAgICAgICB0Tm9kZSxcbiAgICAgICAgcHJvcE5hbWUsXG4gICAgICAgIGdldEJpbmRpbmdJbmRleCgpIC0gMSxcbiAgICAgICAgcHJlZml4LFxuICAgICAgICBzdWZmaXgsXG4gICAgICApO1xuICB9XG4gIHJldHVybiDJtcm1cHJvcGVydHlJbnRlcnBvbGF0ZTE7XG59XG5cbi8qKlxuICpcbiAqIFVwZGF0ZSBhbiBpbnRlcnBvbGF0ZWQgcHJvcGVydHkgb24gYW4gZWxlbWVudCB3aXRoIDIgYm91bmQgdmFsdWVzIHN1cnJvdW5kZWQgYnkgdGV4dC5cbiAqXG4gKiBVc2VkIHdoZW4gdGhlIHZhbHVlIHBhc3NlZCB0byBhIHByb3BlcnR5IGhhcyAyIGludGVycG9sYXRlZCB2YWx1ZXMgaW4gaXQ6XG4gKlxuICogYGBgaHRtbFxuICogPGRpdiB0aXRsZT1cInByZWZpeHt7djB9fS17e3YxfX1zdWZmaXhcIj48L2Rpdj5cbiAqIGBgYFxuICpcbiAqIEl0cyBjb21waWxlZCByZXByZXNlbnRhdGlvbiBpczo6XG4gKlxuICogYGBgdHNcbiAqIMm1ybVwcm9wZXJ0eUludGVycG9sYXRlMigndGl0bGUnLCAncHJlZml4JywgdjAsICctJywgdjEsICdzdWZmaXgnKTtcbiAqIGBgYFxuICpcbiAqIElmIHRoZSBwcm9wZXJ0eSBuYW1lIGFsc28gZXhpc3RzIGFzIGFuIGlucHV0IHByb3BlcnR5IG9uIG9uZSBvZiB0aGUgZWxlbWVudCdzIGRpcmVjdGl2ZXMsXG4gKiB0aGUgY29tcG9uZW50IHByb3BlcnR5IHdpbGwgYmUgc2V0IGluc3RlYWQgb2YgdGhlIGVsZW1lbnQgcHJvcGVydHkuIFRoaXMgY2hlY2sgbXVzdFxuICogYmUgY29uZHVjdGVkIGF0IHJ1bnRpbWUgc28gY2hpbGQgY29tcG9uZW50cyB0aGF0IGFkZCBuZXcgYEBJbnB1dHNgIGRvbid0IGhhdmUgdG8gYmUgcmUtY29tcGlsZWQuXG4gKlxuICogQHBhcmFtIHByb3BOYW1lIFRoZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSB0byB1cGRhdGVcbiAqIEBwYXJhbSBwcmVmaXggU3RhdGljIHZhbHVlIHVzZWQgZm9yIGNvbmNhdGVuYXRpb24gb25seS5cbiAqIEBwYXJhbSB2MCBWYWx1ZSBjaGVja2VkIGZvciBjaGFuZ2UuXG4gKiBAcGFyYW0gaTAgU3RhdGljIHZhbHVlIHVzZWQgZm9yIGNvbmNhdGVuYXRpb24gb25seS5cbiAqIEBwYXJhbSB2MSBWYWx1ZSBjaGVja2VkIGZvciBjaGFuZ2UuXG4gKiBAcGFyYW0gc3VmZml4IFN0YXRpYyB2YWx1ZSB1c2VkIGZvciBjb25jYXRlbmF0aW9uIG9ubHkuXG4gKiBAcGFyYW0gc2FuaXRpemVyIEFuIG9wdGlvbmFsIHNhbml0aXplciBmdW5jdGlvblxuICogQHJldHVybnMgaXRzZWxmLCBzbyB0aGF0IGl0IG1heSBiZSBjaGFpbmVkLlxuICogQGNvZGVHZW5BcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIMm1ybVwcm9wZXJ0eUludGVycG9sYXRlMihcbiAgcHJvcE5hbWU6IHN0cmluZyxcbiAgcHJlZml4OiBzdHJpbmcsXG4gIHYwOiBhbnksXG4gIGkwOiBzdHJpbmcsXG4gIHYxOiBhbnksXG4gIHN1ZmZpeDogc3RyaW5nLFxuICBzYW5pdGl6ZXI/OiBTYW5pdGl6ZXJGbixcbik6IHR5cGVvZiDJtcm1cHJvcGVydHlJbnRlcnBvbGF0ZTIge1xuICBjb25zdCBsVmlldyA9IGdldExWaWV3KCk7XG4gIGNvbnN0IGludGVycG9sYXRlZFZhbHVlID0gaW50ZXJwb2xhdGlvbjIobFZpZXcsIHByZWZpeCwgdjAsIGkwLCB2MSwgc3VmZml4KTtcbiAgaWYgKGludGVycG9sYXRlZFZhbHVlICE9PSBOT19DSEFOR0UpIHtcbiAgICBjb25zdCB0VmlldyA9IGdldFRWaWV3KCk7XG4gICAgY29uc3QgdE5vZGUgPSBnZXRTZWxlY3RlZFROb2RlKCk7XG4gICAgZWxlbWVudFByb3BlcnR5SW50ZXJuYWwoXG4gICAgICB0VmlldyxcbiAgICAgIHROb2RlLFxuICAgICAgbFZpZXcsXG4gICAgICBwcm9wTmFtZSxcbiAgICAgIGludGVycG9sYXRlZFZhbHVlLFxuICAgICAgbFZpZXdbUkVOREVSRVJdLFxuICAgICAgc2FuaXRpemVyLFxuICAgICAgZmFsc2UsXG4gICAgKTtcbiAgICBuZ0Rldk1vZGUgJiZcbiAgICAgIHN0b3JlUHJvcGVydHlCaW5kaW5nTWV0YWRhdGEoXG4gICAgICAgIHRWaWV3LmRhdGEsXG4gICAgICAgIHROb2RlLFxuICAgICAgICBwcm9wTmFtZSxcbiAgICAgICAgZ2V0QmluZGluZ0luZGV4KCkgLSAyLFxuICAgICAgICBwcmVmaXgsXG4gICAgICAgIGkwLFxuICAgICAgICBzdWZmaXgsXG4gICAgICApO1xuICB9XG4gIHJldHVybiDJtcm1cHJvcGVydHlJbnRlcnBvbGF0ZTI7XG59XG5cbi8qKlxuICpcbiAqIFVwZGF0ZSBhbiBpbnRlcnBvbGF0ZWQgcHJvcGVydHkgb24gYW4gZWxlbWVudCB3aXRoIDMgYm91bmQgdmFsdWVzIHN1cnJvdW5kZWQgYnkgdGV4dC5cbiAqXG4gKiBVc2VkIHdoZW4gdGhlIHZhbHVlIHBhc3NlZCB0byBhIHByb3BlcnR5IGhhcyAzIGludGVycG9sYXRlZCB2YWx1ZXMgaW4gaXQ6XG4gKlxuICogYGBgaHRtbFxuICogPGRpdiB0aXRsZT1cInByZWZpeHt7djB9fS17e3YxfX0te3t2Mn19c3VmZml4XCI+PC9kaXY+XG4gKiBgYGBcbiAqXG4gKiBJdHMgY29tcGlsZWQgcmVwcmVzZW50YXRpb24gaXM6OlxuICpcbiAqIGBgYHRzXG4gKiDJtcm1cHJvcGVydHlJbnRlcnBvbGF0ZTMoXG4gKiAndGl0bGUnLCAncHJlZml4JywgdjAsICctJywgdjEsICctJywgdjIsICdzdWZmaXgnKTtcbiAqIGBgYFxuICpcbiAqIElmIHRoZSBwcm9wZXJ0eSBuYW1lIGFsc28gZXhpc3RzIGFzIGFuIGlucHV0IHByb3BlcnR5IG9uIG9uZSBvZiB0aGUgZWxlbWVudCdzIGRpcmVjdGl2ZXMsXG4gKiB0aGUgY29tcG9uZW50IHByb3BlcnR5IHdpbGwgYmUgc2V0IGluc3RlYWQgb2YgdGhlIGVsZW1lbnQgcHJvcGVydHkuIFRoaXMgY2hlY2sgbXVzdFxuICogYmUgY29uZHVjdGVkIGF0IHJ1bnRpbWUgc28gY2hpbGQgY29tcG9uZW50cyB0aGF0IGFkZCBuZXcgYEBJbnB1dHNgIGRvbid0IGhhdmUgdG8gYmUgcmUtY29tcGlsZWQuXG4gKlxuICogQHBhcmFtIHByb3BOYW1lIFRoZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSB0byB1cGRhdGVcbiAqIEBwYXJhbSBwcmVmaXggU3RhdGljIHZhbHVlIHVzZWQgZm9yIGNvbmNhdGVuYXRpb24gb25seS5cbiAqIEBwYXJhbSB2MCBWYWx1ZSBjaGVja2VkIGZvciBjaGFuZ2UuXG4gKiBAcGFyYW0gaTAgU3RhdGljIHZhbHVlIHVzZWQgZm9yIGNvbmNhdGVuYXRpb24gb25seS5cbiAqIEBwYXJhbSB2MSBWYWx1ZSBjaGVja2VkIGZvciBjaGFuZ2UuXG4gKiBAcGFyYW0gaTEgU3RhdGljIHZhbHVlIHVzZWQgZm9yIGNvbmNhdGVuYXRpb24gb25seS5cbiAqIEBwYXJhbSB2MiBWYWx1ZSBjaGVja2VkIGZvciBjaGFuZ2UuXG4gKiBAcGFyYW0gc3VmZml4IFN0YXRpYyB2YWx1ZSB1c2VkIGZvciBjb25jYXRlbmF0aW9uIG9ubHkuXG4gKiBAcGFyYW0gc2FuaXRpemVyIEFuIG9wdGlvbmFsIHNhbml0aXplciBmdW5jdGlvblxuICogQHJldHVybnMgaXRzZWxmLCBzbyB0aGF0IGl0IG1heSBiZSBjaGFpbmVkLlxuICogQGNvZGVHZW5BcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIMm1ybVwcm9wZXJ0eUludGVycG9sYXRlMyhcbiAgcHJvcE5hbWU6IHN0cmluZyxcbiAgcHJlZml4OiBzdHJpbmcsXG4gIHYwOiBhbnksXG4gIGkwOiBzdHJpbmcsXG4gIHYxOiBhbnksXG4gIGkxOiBzdHJpbmcsXG4gIHYyOiBhbnksXG4gIHN1ZmZpeDogc3RyaW5nLFxuICBzYW5pdGl6ZXI/OiBTYW5pdGl6ZXJGbixcbik6IHR5cGVvZiDJtcm1cHJvcGVydHlJbnRlcnBvbGF0ZTMge1xuICBjb25zdCBsVmlldyA9IGdldExWaWV3KCk7XG4gIGNvbnN0IGludGVycG9sYXRlZFZhbHVlID0gaW50ZXJwb2xhdGlvbjMobFZpZXcsIHByZWZpeCwgdjAsIGkwLCB2MSwgaTEsIHYyLCBzdWZmaXgpO1xuICBpZiAoaW50ZXJwb2xhdGVkVmFsdWUgIT09IE5PX0NIQU5HRSkge1xuICAgIGNvbnN0IHRWaWV3ID0gZ2V0VFZpZXcoKTtcbiAgICBjb25zdCB0Tm9kZSA9IGdldFNlbGVjdGVkVE5vZGUoKTtcbiAgICBlbGVtZW50UHJvcGVydHlJbnRlcm5hbChcbiAgICAgIHRWaWV3LFxuICAgICAgdE5vZGUsXG4gICAgICBsVmlldyxcbiAgICAgIHByb3BOYW1lLFxuICAgICAgaW50ZXJwb2xhdGVkVmFsdWUsXG4gICAgICBsVmlld1tSRU5ERVJFUl0sXG4gICAgICBzYW5pdGl6ZXIsXG4gICAgICBmYWxzZSxcbiAgICApO1xuICAgIG5nRGV2TW9kZSAmJlxuICAgICAgc3RvcmVQcm9wZXJ0eUJpbmRpbmdNZXRhZGF0YShcbiAgICAgICAgdFZpZXcuZGF0YSxcbiAgICAgICAgdE5vZGUsXG4gICAgICAgIHByb3BOYW1lLFxuICAgICAgICBnZXRCaW5kaW5nSW5kZXgoKSAtIDMsXG4gICAgICAgIHByZWZpeCxcbiAgICAgICAgaTAsXG4gICAgICAgIGkxLFxuICAgICAgICBzdWZmaXgsXG4gICAgICApO1xuICB9XG4gIHJldHVybiDJtcm1cHJvcGVydHlJbnRlcnBvbGF0ZTM7XG59XG5cbi8qKlxuICpcbiAqIFVwZGF0ZSBhbiBpbnRlcnBvbGF0ZWQgcHJvcGVydHkgb24gYW4gZWxlbWVudCB3aXRoIDQgYm91bmQgdmFsdWVzIHN1cnJvdW5kZWQgYnkgdGV4dC5cbiAqXG4gKiBVc2VkIHdoZW4gdGhlIHZhbHVlIHBhc3NlZCB0byBhIHByb3BlcnR5IGhhcyA0IGludGVycG9sYXRlZCB2YWx1ZXMgaW4gaXQ6XG4gKlxuICogYGBgaHRtbFxuICogPGRpdiB0aXRsZT1cInByZWZpeHt7djB9fS17e3YxfX0te3t2Mn19LXt7djN9fXN1ZmZpeFwiPjwvZGl2PlxuICogYGBgXG4gKlxuICogSXRzIGNvbXBpbGVkIHJlcHJlc2VudGF0aW9uIGlzOjpcbiAqXG4gKiBgYGB0c1xuICogybXJtXByb3BlcnR5SW50ZXJwb2xhdGU0KFxuICogJ3RpdGxlJywgJ3ByZWZpeCcsIHYwLCAnLScsIHYxLCAnLScsIHYyLCAnLScsIHYzLCAnc3VmZml4Jyk7XG4gKiBgYGBcbiAqXG4gKiBJZiB0aGUgcHJvcGVydHkgbmFtZSBhbHNvIGV4aXN0cyBhcyBhbiBpbnB1dCBwcm9wZXJ0eSBvbiBvbmUgb2YgdGhlIGVsZW1lbnQncyBkaXJlY3RpdmVzLFxuICogdGhlIGNvbXBvbmVudCBwcm9wZXJ0eSB3aWxsIGJlIHNldCBpbnN0ZWFkIG9mIHRoZSBlbGVtZW50IHByb3BlcnR5LiBUaGlzIGNoZWNrIG11c3RcbiAqIGJlIGNvbmR1Y3RlZCBhdCBydW50aW1lIHNvIGNoaWxkIGNvbXBvbmVudHMgdGhhdCBhZGQgbmV3IGBASW5wdXRzYCBkb24ndCBoYXZlIHRvIGJlIHJlLWNvbXBpbGVkLlxuICpcbiAqIEBwYXJhbSBwcm9wTmFtZSBUaGUgbmFtZSBvZiB0aGUgcHJvcGVydHkgdG8gdXBkYXRlXG4gKiBAcGFyYW0gcHJlZml4IFN0YXRpYyB2YWx1ZSB1c2VkIGZvciBjb25jYXRlbmF0aW9uIG9ubHkuXG4gKiBAcGFyYW0gdjAgVmFsdWUgY2hlY2tlZCBmb3IgY2hhbmdlLlxuICogQHBhcmFtIGkwIFN0YXRpYyB2YWx1ZSB1c2VkIGZvciBjb25jYXRlbmF0aW9uIG9ubHkuXG4gKiBAcGFyYW0gdjEgVmFsdWUgY2hlY2tlZCBmb3IgY2hhbmdlLlxuICogQHBhcmFtIGkxIFN0YXRpYyB2YWx1ZSB1c2VkIGZvciBjb25jYXRlbmF0aW9uIG9ubHkuXG4gKiBAcGFyYW0gdjIgVmFsdWUgY2hlY2tlZCBmb3IgY2hhbmdlLlxuICogQHBhcmFtIGkyIFN0YXRpYyB2YWx1ZSB1c2VkIGZvciBjb25jYXRlbmF0aW9uIG9ubHkuXG4gKiBAcGFyYW0gdjMgVmFsdWUgY2hlY2tlZCBmb3IgY2hhbmdlLlxuICogQHBhcmFtIHN1ZmZpeCBTdGF0aWMgdmFsdWUgdXNlZCBmb3IgY29uY2F0ZW5hdGlvbiBvbmx5LlxuICogQHBhcmFtIHNhbml0aXplciBBbiBvcHRpb25hbCBzYW5pdGl6ZXIgZnVuY3Rpb25cbiAqIEByZXR1cm5zIGl0c2VsZiwgc28gdGhhdCBpdCBtYXkgYmUgY2hhaW5lZC5cbiAqIEBjb2RlR2VuQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiDJtcm1cHJvcGVydHlJbnRlcnBvbGF0ZTQoXG4gIHByb3BOYW1lOiBzdHJpbmcsXG4gIHByZWZpeDogc3RyaW5nLFxuICB2MDogYW55LFxuICBpMDogc3RyaW5nLFxuICB2MTogYW55LFxuICBpMTogc3RyaW5nLFxuICB2MjogYW55LFxuICBpMjogc3RyaW5nLFxuICB2MzogYW55LFxuICBzdWZmaXg6IHN0cmluZyxcbiAgc2FuaXRpemVyPzogU2FuaXRpemVyRm4sXG4pOiB0eXBlb2YgybXJtXByb3BlcnR5SW50ZXJwb2xhdGU0IHtcbiAgY29uc3QgbFZpZXcgPSBnZXRMVmlldygpO1xuICBjb25zdCBpbnRlcnBvbGF0ZWRWYWx1ZSA9IGludGVycG9sYXRpb240KGxWaWV3LCBwcmVmaXgsIHYwLCBpMCwgdjEsIGkxLCB2MiwgaTIsIHYzLCBzdWZmaXgpO1xuICBpZiAoaW50ZXJwb2xhdGVkVmFsdWUgIT09IE5PX0NIQU5HRSkge1xuICAgIGNvbnN0IHRWaWV3ID0gZ2V0VFZpZXcoKTtcbiAgICBjb25zdCB0Tm9kZSA9IGdldFNlbGVjdGVkVE5vZGUoKTtcbiAgICBlbGVtZW50UHJvcGVydHlJbnRlcm5hbChcbiAgICAgIHRWaWV3LFxuICAgICAgdE5vZGUsXG4gICAgICBsVmlldyxcbiAgICAgIHByb3BOYW1lLFxuICAgICAgaW50ZXJwb2xhdGVkVmFsdWUsXG4gICAgICBsVmlld1tSRU5ERVJFUl0sXG4gICAgICBzYW5pdGl6ZXIsXG4gICAgICBmYWxzZSxcbiAgICApO1xuICAgIG5nRGV2TW9kZSAmJlxuICAgICAgc3RvcmVQcm9wZXJ0eUJpbmRpbmdNZXRhZGF0YShcbiAgICAgICAgdFZpZXcuZGF0YSxcbiAgICAgICAgdE5vZGUsXG4gICAgICAgIHByb3BOYW1lLFxuICAgICAgICBnZXRCaW5kaW5nSW5kZXgoKSAtIDQsXG4gICAgICAgIHByZWZpeCxcbiAgICAgICAgaTAsXG4gICAgICAgIGkxLFxuICAgICAgICBpMixcbiAgICAgICAgc3VmZml4LFxuICAgICAgKTtcbiAgfVxuICByZXR1cm4gybXJtXByb3BlcnR5SW50ZXJwb2xhdGU0O1xufVxuXG4vKipcbiAqXG4gKiBVcGRhdGUgYW4gaW50ZXJwb2xhdGVkIHByb3BlcnR5IG9uIGFuIGVsZW1lbnQgd2l0aCA1IGJvdW5kIHZhbHVlcyBzdXJyb3VuZGVkIGJ5IHRleHQuXG4gKlxuICogVXNlZCB3aGVuIHRoZSB2YWx1ZSBwYXNzZWQgdG8gYSBwcm9wZXJ0eSBoYXMgNSBpbnRlcnBvbGF0ZWQgdmFsdWVzIGluIGl0OlxuICpcbiAqIGBgYGh0bWxcbiAqIDxkaXYgdGl0bGU9XCJwcmVmaXh7e3YwfX0te3t2MX19LXt7djJ9fS17e3YzfX0te3t2NH19c3VmZml4XCI+PC9kaXY+XG4gKiBgYGBcbiAqXG4gKiBJdHMgY29tcGlsZWQgcmVwcmVzZW50YXRpb24gaXM6OlxuICpcbiAqIGBgYHRzXG4gKiDJtcm1cHJvcGVydHlJbnRlcnBvbGF0ZTUoXG4gKiAndGl0bGUnLCAncHJlZml4JywgdjAsICctJywgdjEsICctJywgdjIsICctJywgdjMsICctJywgdjQsICdzdWZmaXgnKTtcbiAqIGBgYFxuICpcbiAqIElmIHRoZSBwcm9wZXJ0eSBuYW1lIGFsc28gZXhpc3RzIGFzIGFuIGlucHV0IHByb3BlcnR5IG9uIG9uZSBvZiB0aGUgZWxlbWVudCdzIGRpcmVjdGl2ZXMsXG4gKiB0aGUgY29tcG9uZW50IHByb3BlcnR5IHdpbGwgYmUgc2V0IGluc3RlYWQgb2YgdGhlIGVsZW1lbnQgcHJvcGVydHkuIFRoaXMgY2hlY2sgbXVzdFxuICogYmUgY29uZHVjdGVkIGF0IHJ1bnRpbWUgc28gY2hpbGQgY29tcG9uZW50cyB0aGF0IGFkZCBuZXcgYEBJbnB1dHNgIGRvbid0IGhhdmUgdG8gYmUgcmUtY29tcGlsZWQuXG4gKlxuICogQHBhcmFtIHByb3BOYW1lIFRoZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSB0byB1cGRhdGVcbiAqIEBwYXJhbSBwcmVmaXggU3RhdGljIHZhbHVlIHVzZWQgZm9yIGNvbmNhdGVuYXRpb24gb25seS5cbiAqIEBwYXJhbSB2MCBWYWx1ZSBjaGVja2VkIGZvciBjaGFuZ2UuXG4gKiBAcGFyYW0gaTAgU3RhdGljIHZhbHVlIHVzZWQgZm9yIGNvbmNhdGVuYXRpb24gb25seS5cbiAqIEBwYXJhbSB2MSBWYWx1ZSBjaGVja2VkIGZvciBjaGFuZ2UuXG4gKiBAcGFyYW0gaTEgU3RhdGljIHZhbHVlIHVzZWQgZm9yIGNvbmNhdGVuYXRpb24gb25seS5cbiAqIEBwYXJhbSB2MiBWYWx1ZSBjaGVja2VkIGZvciBjaGFuZ2UuXG4gKiBAcGFyYW0gaTIgU3RhdGljIHZhbHVlIHVzZWQgZm9yIGNvbmNhdGVuYXRpb24gb25seS5cbiAqIEBwYXJhbSB2MyBWYWx1ZSBjaGVja2VkIGZvciBjaGFuZ2UuXG4gKiBAcGFyYW0gaTMgU3RhdGljIHZhbHVlIHVzZWQgZm9yIGNvbmNhdGVuYXRpb24gb25seS5cbiAqIEBwYXJhbSB2NCBWYWx1ZSBjaGVja2VkIGZvciBjaGFuZ2UuXG4gKiBAcGFyYW0gc3VmZml4IFN0YXRpYyB2YWx1ZSB1c2VkIGZvciBjb25jYXRlbmF0aW9uIG9ubHkuXG4gKiBAcGFyYW0gc2FuaXRpemVyIEFuIG9wdGlvbmFsIHNhbml0aXplciBmdW5jdGlvblxuICogQHJldHVybnMgaXRzZWxmLCBzbyB0aGF0IGl0IG1heSBiZSBjaGFpbmVkLlxuICogQGNvZGVHZW5BcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIMm1ybVwcm9wZXJ0eUludGVycG9sYXRlNShcbiAgcHJvcE5hbWU6IHN0cmluZyxcbiAgcHJlZml4OiBzdHJpbmcsXG4gIHYwOiBhbnksXG4gIGkwOiBzdHJpbmcsXG4gIHYxOiBhbnksXG4gIGkxOiBzdHJpbmcsXG4gIHYyOiBhbnksXG4gIGkyOiBzdHJpbmcsXG4gIHYzOiBhbnksXG4gIGkzOiBzdHJpbmcsXG4gIHY0OiBhbnksXG4gIHN1ZmZpeDogc3RyaW5nLFxuICBzYW5pdGl6ZXI/OiBTYW5pdGl6ZXJGbixcbik6IHR5cGVvZiDJtcm1cHJvcGVydHlJbnRlcnBvbGF0ZTUge1xuICBjb25zdCBsVmlldyA9IGdldExWaWV3KCk7XG4gIGNvbnN0IGludGVycG9sYXRlZFZhbHVlID0gaW50ZXJwb2xhdGlvbjUoXG4gICAgbFZpZXcsXG4gICAgcHJlZml4LFxuICAgIHYwLFxuICAgIGkwLFxuICAgIHYxLFxuICAgIGkxLFxuICAgIHYyLFxuICAgIGkyLFxuICAgIHYzLFxuICAgIGkzLFxuICAgIHY0LFxuICAgIHN1ZmZpeCxcbiAgKTtcbiAgaWYgKGludGVycG9sYXRlZFZhbHVlICE9PSBOT19DSEFOR0UpIHtcbiAgICBjb25zdCB0VmlldyA9IGdldFRWaWV3KCk7XG4gICAgY29uc3QgdE5vZGUgPSBnZXRTZWxlY3RlZFROb2RlKCk7XG4gICAgZWxlbWVudFByb3BlcnR5SW50ZXJuYWwoXG4gICAgICB0VmlldyxcbiAgICAgIHROb2RlLFxuICAgICAgbFZpZXcsXG4gICAgICBwcm9wTmFtZSxcbiAgICAgIGludGVycG9sYXRlZFZhbHVlLFxuICAgICAgbFZpZXdbUkVOREVSRVJdLFxuICAgICAgc2FuaXRpemVyLFxuICAgICAgZmFsc2UsXG4gICAgKTtcbiAgICBuZ0Rldk1vZGUgJiZcbiAgICAgIHN0b3JlUHJvcGVydHlCaW5kaW5nTWV0YWRhdGEoXG4gICAgICAgIHRWaWV3LmRhdGEsXG4gICAgICAgIHROb2RlLFxuICAgICAgICBwcm9wTmFtZSxcbiAgICAgICAgZ2V0QmluZGluZ0luZGV4KCkgLSA1LFxuICAgICAgICBwcmVmaXgsXG4gICAgICAgIGkwLFxuICAgICAgICBpMSxcbiAgICAgICAgaTIsXG4gICAgICAgIGkzLFxuICAgICAgICBzdWZmaXgsXG4gICAgICApO1xuICB9XG4gIHJldHVybiDJtcm1cHJvcGVydHlJbnRlcnBvbGF0ZTU7XG59XG5cbi8qKlxuICpcbiAqIFVwZGF0ZSBhbiBpbnRlcnBvbGF0ZWQgcHJvcGVydHkgb24gYW4gZWxlbWVudCB3aXRoIDYgYm91bmQgdmFsdWVzIHN1cnJvdW5kZWQgYnkgdGV4dC5cbiAqXG4gKiBVc2VkIHdoZW4gdGhlIHZhbHVlIHBhc3NlZCB0byBhIHByb3BlcnR5IGhhcyA2IGludGVycG9sYXRlZCB2YWx1ZXMgaW4gaXQ6XG4gKlxuICogYGBgaHRtbFxuICogPGRpdiB0aXRsZT1cInByZWZpeHt7djB9fS17e3YxfX0te3t2Mn19LXt7djN9fS17e3Y0fX0te3t2NX19c3VmZml4XCI+PC9kaXY+XG4gKiBgYGBcbiAqXG4gKiBJdHMgY29tcGlsZWQgcmVwcmVzZW50YXRpb24gaXM6OlxuICpcbiAqIGBgYHRzXG4gKiDJtcm1cHJvcGVydHlJbnRlcnBvbGF0ZTYoXG4gKiAgICAndGl0bGUnLCAncHJlZml4JywgdjAsICctJywgdjEsICctJywgdjIsICctJywgdjMsICctJywgdjQsICctJywgdjUsICdzdWZmaXgnKTtcbiAqIGBgYFxuICpcbiAqIElmIHRoZSBwcm9wZXJ0eSBuYW1lIGFsc28gZXhpc3RzIGFzIGFuIGlucHV0IHByb3BlcnR5IG9uIG9uZSBvZiB0aGUgZWxlbWVudCdzIGRpcmVjdGl2ZXMsXG4gKiB0aGUgY29tcG9uZW50IHByb3BlcnR5IHdpbGwgYmUgc2V0IGluc3RlYWQgb2YgdGhlIGVsZW1lbnQgcHJvcGVydHkuIFRoaXMgY2hlY2sgbXVzdFxuICogYmUgY29uZHVjdGVkIGF0IHJ1bnRpbWUgc28gY2hpbGQgY29tcG9uZW50cyB0aGF0IGFkZCBuZXcgYEBJbnB1dHNgIGRvbid0IGhhdmUgdG8gYmUgcmUtY29tcGlsZWQuXG4gKlxuICogQHBhcmFtIHByb3BOYW1lIFRoZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSB0byB1cGRhdGVcbiAqIEBwYXJhbSBwcmVmaXggU3RhdGljIHZhbHVlIHVzZWQgZm9yIGNvbmNhdGVuYXRpb24gb25seS5cbiAqIEBwYXJhbSB2MCBWYWx1ZSBjaGVja2VkIGZvciBjaGFuZ2UuXG4gKiBAcGFyYW0gaTAgU3RhdGljIHZhbHVlIHVzZWQgZm9yIGNvbmNhdGVuYXRpb24gb25seS5cbiAqIEBwYXJhbSB2MSBWYWx1ZSBjaGVja2VkIGZvciBjaGFuZ2UuXG4gKiBAcGFyYW0gaTEgU3RhdGljIHZhbHVlIHVzZWQgZm9yIGNvbmNhdGVuYXRpb24gb25seS5cbiAqIEBwYXJhbSB2MiBWYWx1ZSBjaGVja2VkIGZvciBjaGFuZ2UuXG4gKiBAcGFyYW0gaTIgU3RhdGljIHZhbHVlIHVzZWQgZm9yIGNvbmNhdGVuYXRpb24gb25seS5cbiAqIEBwYXJhbSB2MyBWYWx1ZSBjaGVja2VkIGZvciBjaGFuZ2UuXG4gKiBAcGFyYW0gaTMgU3RhdGljIHZhbHVlIHVzZWQgZm9yIGNvbmNhdGVuYXRpb24gb25seS5cbiAqIEBwYXJhbSB2NCBWYWx1ZSBjaGVja2VkIGZvciBjaGFuZ2UuXG4gKiBAcGFyYW0gaTQgU3RhdGljIHZhbHVlIHVzZWQgZm9yIGNvbmNhdGVuYXRpb24gb25seS5cbiAqIEBwYXJhbSB2NSBWYWx1ZSBjaGVja2VkIGZvciBjaGFuZ2UuXG4gKiBAcGFyYW0gc3VmZml4IFN0YXRpYyB2YWx1ZSB1c2VkIGZvciBjb25jYXRlbmF0aW9uIG9ubHkuXG4gKiBAcGFyYW0gc2FuaXRpemVyIEFuIG9wdGlvbmFsIHNhbml0aXplciBmdW5jdGlvblxuICogQHJldHVybnMgaXRzZWxmLCBzbyB0aGF0IGl0IG1heSBiZSBjaGFpbmVkLlxuICogQGNvZGVHZW5BcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIMm1ybVwcm9wZXJ0eUludGVycG9sYXRlNihcbiAgcHJvcE5hbWU6IHN0cmluZyxcbiAgcHJlZml4OiBzdHJpbmcsXG4gIHYwOiBhbnksXG4gIGkwOiBzdHJpbmcsXG4gIHYxOiBhbnksXG4gIGkxOiBzdHJpbmcsXG4gIHYyOiBhbnksXG4gIGkyOiBzdHJpbmcsXG4gIHYzOiBhbnksXG4gIGkzOiBzdHJpbmcsXG4gIHY0OiBhbnksXG4gIGk0OiBzdHJpbmcsXG4gIHY1OiBhbnksXG4gIHN1ZmZpeDogc3RyaW5nLFxuICBzYW5pdGl6ZXI/OiBTYW5pdGl6ZXJGbixcbik6IHR5cGVvZiDJtcm1cHJvcGVydHlJbnRlcnBvbGF0ZTYge1xuICBjb25zdCBsVmlldyA9IGdldExWaWV3KCk7XG4gIGNvbnN0IGludGVycG9sYXRlZFZhbHVlID0gaW50ZXJwb2xhdGlvbjYoXG4gICAgbFZpZXcsXG4gICAgcHJlZml4LFxuICAgIHYwLFxuICAgIGkwLFxuICAgIHYxLFxuICAgIGkxLFxuICAgIHYyLFxuICAgIGkyLFxuICAgIHYzLFxuICAgIGkzLFxuICAgIHY0LFxuICAgIGk0LFxuICAgIHY1LFxuICAgIHN1ZmZpeCxcbiAgKTtcbiAgaWYgKGludGVycG9sYXRlZFZhbHVlICE9PSBOT19DSEFOR0UpIHtcbiAgICBjb25zdCB0VmlldyA9IGdldFRWaWV3KCk7XG4gICAgY29uc3QgdE5vZGUgPSBnZXRTZWxlY3RlZFROb2RlKCk7XG4gICAgZWxlbWVudFByb3BlcnR5SW50ZXJuYWwoXG4gICAgICB0VmlldyxcbiAgICAgIHROb2RlLFxuICAgICAgbFZpZXcsXG4gICAgICBwcm9wTmFtZSxcbiAgICAgIGludGVycG9sYXRlZFZhbHVlLFxuICAgICAgbFZpZXdbUkVOREVSRVJdLFxuICAgICAgc2FuaXRpemVyLFxuICAgICAgZmFsc2UsXG4gICAgKTtcbiAgICBuZ0Rldk1vZGUgJiZcbiAgICAgIHN0b3JlUHJvcGVydHlCaW5kaW5nTWV0YWRhdGEoXG4gICAgICAgIHRWaWV3LmRhdGEsXG4gICAgICAgIHROb2RlLFxuICAgICAgICBwcm9wTmFtZSxcbiAgICAgICAgZ2V0QmluZGluZ0luZGV4KCkgLSA2LFxuICAgICAgICBwcmVmaXgsXG4gICAgICAgIGkwLFxuICAgICAgICBpMSxcbiAgICAgICAgaTIsXG4gICAgICAgIGkzLFxuICAgICAgICBpNCxcbiAgICAgICAgc3VmZml4LFxuICAgICAgKTtcbiAgfVxuICByZXR1cm4gybXJtXByb3BlcnR5SW50ZXJwb2xhdGU2O1xufVxuXG4vKipcbiAqXG4gKiBVcGRhdGUgYW4gaW50ZXJwb2xhdGVkIHByb3BlcnR5IG9uIGFuIGVsZW1lbnQgd2l0aCA3IGJvdW5kIHZhbHVlcyBzdXJyb3VuZGVkIGJ5IHRleHQuXG4gKlxuICogVXNlZCB3aGVuIHRoZSB2YWx1ZSBwYXNzZWQgdG8gYSBwcm9wZXJ0eSBoYXMgNyBpbnRlcnBvbGF0ZWQgdmFsdWVzIGluIGl0OlxuICpcbiAqIGBgYGh0bWxcbiAqIDxkaXYgdGl0bGU9XCJwcmVmaXh7e3YwfX0te3t2MX19LXt7djJ9fS17e3YzfX0te3t2NH19LXt7djV9fS17e3Y2fX1zdWZmaXhcIj48L2Rpdj5cbiAqIGBgYFxuICpcbiAqIEl0cyBjb21waWxlZCByZXByZXNlbnRhdGlvbiBpczo6XG4gKlxuICogYGBgdHNcbiAqIMm1ybVwcm9wZXJ0eUludGVycG9sYXRlNyhcbiAqICAgICd0aXRsZScsICdwcmVmaXgnLCB2MCwgJy0nLCB2MSwgJy0nLCB2MiwgJy0nLCB2MywgJy0nLCB2NCwgJy0nLCB2NSwgJy0nLCB2NiwgJ3N1ZmZpeCcpO1xuICogYGBgXG4gKlxuICogSWYgdGhlIHByb3BlcnR5IG5hbWUgYWxzbyBleGlzdHMgYXMgYW4gaW5wdXQgcHJvcGVydHkgb24gb25lIG9mIHRoZSBlbGVtZW50J3MgZGlyZWN0aXZlcyxcbiAqIHRoZSBjb21wb25lbnQgcHJvcGVydHkgd2lsbCBiZSBzZXQgaW5zdGVhZCBvZiB0aGUgZWxlbWVudCBwcm9wZXJ0eS4gVGhpcyBjaGVjayBtdXN0XG4gKiBiZSBjb25kdWN0ZWQgYXQgcnVudGltZSBzbyBjaGlsZCBjb21wb25lbnRzIHRoYXQgYWRkIG5ldyBgQElucHV0c2AgZG9uJ3QgaGF2ZSB0byBiZSByZS1jb21waWxlZC5cbiAqXG4gKiBAcGFyYW0gcHJvcE5hbWUgVGhlIG5hbWUgb2YgdGhlIHByb3BlcnR5IHRvIHVwZGF0ZVxuICogQHBhcmFtIHByZWZpeCBTdGF0aWMgdmFsdWUgdXNlZCBmb3IgY29uY2F0ZW5hdGlvbiBvbmx5LlxuICogQHBhcmFtIHYwIFZhbHVlIGNoZWNrZWQgZm9yIGNoYW5nZS5cbiAqIEBwYXJhbSBpMCBTdGF0aWMgdmFsdWUgdXNlZCBmb3IgY29uY2F0ZW5hdGlvbiBvbmx5LlxuICogQHBhcmFtIHYxIFZhbHVlIGNoZWNrZWQgZm9yIGNoYW5nZS5cbiAqIEBwYXJhbSBpMSBTdGF0aWMgdmFsdWUgdXNlZCBmb3IgY29uY2F0ZW5hdGlvbiBvbmx5LlxuICogQHBhcmFtIHYyIFZhbHVlIGNoZWNrZWQgZm9yIGNoYW5nZS5cbiAqIEBwYXJhbSBpMiBTdGF0aWMgdmFsdWUgdXNlZCBmb3IgY29uY2F0ZW5hdGlvbiBvbmx5LlxuICogQHBhcmFtIHYzIFZhbHVlIGNoZWNrZWQgZm9yIGNoYW5nZS5cbiAqIEBwYXJhbSBpMyBTdGF0aWMgdmFsdWUgdXNlZCBmb3IgY29uY2F0ZW5hdGlvbiBvbmx5LlxuICogQHBhcmFtIHY0IFZhbHVlIGNoZWNrZWQgZm9yIGNoYW5nZS5cbiAqIEBwYXJhbSBpNCBTdGF0aWMgdmFsdWUgdXNlZCBmb3IgY29uY2F0ZW5hdGlvbiBvbmx5LlxuICogQHBhcmFtIHY1IFZhbHVlIGNoZWNrZWQgZm9yIGNoYW5nZS5cbiAqIEBwYXJhbSBpNSBTdGF0aWMgdmFsdWUgdXNlZCBmb3IgY29uY2F0ZW5hdGlvbiBvbmx5LlxuICogQHBhcmFtIHY2IFZhbHVlIGNoZWNrZWQgZm9yIGNoYW5nZS5cbiAqIEBwYXJhbSBzdWZmaXggU3RhdGljIHZhbHVlIHVzZWQgZm9yIGNvbmNhdGVuYXRpb24gb25seS5cbiAqIEBwYXJhbSBzYW5pdGl6ZXIgQW4gb3B0aW9uYWwgc2FuaXRpemVyIGZ1bmN0aW9uXG4gKiBAcmV0dXJucyBpdHNlbGYsIHNvIHRoYXQgaXQgbWF5IGJlIGNoYWluZWQuXG4gKiBAY29kZUdlbkFwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gybXJtXByb3BlcnR5SW50ZXJwb2xhdGU3KFxuICBwcm9wTmFtZTogc3RyaW5nLFxuICBwcmVmaXg6IHN0cmluZyxcbiAgdjA6IGFueSxcbiAgaTA6IHN0cmluZyxcbiAgdjE6IGFueSxcbiAgaTE6IHN0cmluZyxcbiAgdjI6IGFueSxcbiAgaTI6IHN0cmluZyxcbiAgdjM6IGFueSxcbiAgaTM6IHN0cmluZyxcbiAgdjQ6IGFueSxcbiAgaTQ6IHN0cmluZyxcbiAgdjU6IGFueSxcbiAgaTU6IHN0cmluZyxcbiAgdjY6IGFueSxcbiAgc3VmZml4OiBzdHJpbmcsXG4gIHNhbml0aXplcj86IFNhbml0aXplckZuLFxuKTogdHlwZW9mIMm1ybVwcm9wZXJ0eUludGVycG9sYXRlNyB7XG4gIGNvbnN0IGxWaWV3ID0gZ2V0TFZpZXcoKTtcbiAgY29uc3QgaW50ZXJwb2xhdGVkVmFsdWUgPSBpbnRlcnBvbGF0aW9uNyhcbiAgICBsVmlldyxcbiAgICBwcmVmaXgsXG4gICAgdjAsXG4gICAgaTAsXG4gICAgdjEsXG4gICAgaTEsXG4gICAgdjIsXG4gICAgaTIsXG4gICAgdjMsXG4gICAgaTMsXG4gICAgdjQsXG4gICAgaTQsXG4gICAgdjUsXG4gICAgaTUsXG4gICAgdjYsXG4gICAgc3VmZml4LFxuICApO1xuICBpZiAoaW50ZXJwb2xhdGVkVmFsdWUgIT09IE5PX0NIQU5HRSkge1xuICAgIGNvbnN0IHRWaWV3ID0gZ2V0VFZpZXcoKTtcbiAgICBjb25zdCB0Tm9kZSA9IGdldFNlbGVjdGVkVE5vZGUoKTtcbiAgICBlbGVtZW50UHJvcGVydHlJbnRlcm5hbChcbiAgICAgIHRWaWV3LFxuICAgICAgdE5vZGUsXG4gICAgICBsVmlldyxcbiAgICAgIHByb3BOYW1lLFxuICAgICAgaW50ZXJwb2xhdGVkVmFsdWUsXG4gICAgICBsVmlld1tSRU5ERVJFUl0sXG4gICAgICBzYW5pdGl6ZXIsXG4gICAgICBmYWxzZSxcbiAgICApO1xuICAgIG5nRGV2TW9kZSAmJlxuICAgICAgc3RvcmVQcm9wZXJ0eUJpbmRpbmdNZXRhZGF0YShcbiAgICAgICAgdFZpZXcuZGF0YSxcbiAgICAgICAgdE5vZGUsXG4gICAgICAgIHByb3BOYW1lLFxuICAgICAgICBnZXRCaW5kaW5nSW5kZXgoKSAtIDcsXG4gICAgICAgIHByZWZpeCxcbiAgICAgICAgaTAsXG4gICAgICAgIGkxLFxuICAgICAgICBpMixcbiAgICAgICAgaTMsXG4gICAgICAgIGk0LFxuICAgICAgICBpNSxcbiAgICAgICAgc3VmZml4LFxuICAgICAgKTtcbiAgfVxuICByZXR1cm4gybXJtXByb3BlcnR5SW50ZXJwb2xhdGU3O1xufVxuXG4vKipcbiAqXG4gKiBVcGRhdGUgYW4gaW50ZXJwb2xhdGVkIHByb3BlcnR5IG9uIGFuIGVsZW1lbnQgd2l0aCA4IGJvdW5kIHZhbHVlcyBzdXJyb3VuZGVkIGJ5IHRleHQuXG4gKlxuICogVXNlZCB3aGVuIHRoZSB2YWx1ZSBwYXNzZWQgdG8gYSBwcm9wZXJ0eSBoYXMgOCBpbnRlcnBvbGF0ZWQgdmFsdWVzIGluIGl0OlxuICpcbiAqIGBgYGh0bWxcbiAqIDxkaXYgdGl0bGU9XCJwcmVmaXh7e3YwfX0te3t2MX19LXt7djJ9fS17e3YzfX0te3t2NH19LXt7djV9fS17e3Y2fX0te3t2N319c3VmZml4XCI+PC9kaXY+XG4gKiBgYGBcbiAqXG4gKiBJdHMgY29tcGlsZWQgcmVwcmVzZW50YXRpb24gaXM6OlxuICpcbiAqIGBgYHRzXG4gKiDJtcm1cHJvcGVydHlJbnRlcnBvbGF0ZTgoXG4gKiAgJ3RpdGxlJywgJ3ByZWZpeCcsIHYwLCAnLScsIHYxLCAnLScsIHYyLCAnLScsIHYzLCAnLScsIHY0LCAnLScsIHY1LCAnLScsIHY2LCAnLScsIHY3LCAnc3VmZml4Jyk7XG4gKiBgYGBcbiAqXG4gKiBJZiB0aGUgcHJvcGVydHkgbmFtZSBhbHNvIGV4aXN0cyBhcyBhbiBpbnB1dCBwcm9wZXJ0eSBvbiBvbmUgb2YgdGhlIGVsZW1lbnQncyBkaXJlY3RpdmVzLFxuICogdGhlIGNvbXBvbmVudCBwcm9wZXJ0eSB3aWxsIGJlIHNldCBpbnN0ZWFkIG9mIHRoZSBlbGVtZW50IHByb3BlcnR5LiBUaGlzIGNoZWNrIG11c3RcbiAqIGJlIGNvbmR1Y3RlZCBhdCBydW50aW1lIHNvIGNoaWxkIGNvbXBvbmVudHMgdGhhdCBhZGQgbmV3IGBASW5wdXRzYCBkb24ndCBoYXZlIHRvIGJlIHJlLWNvbXBpbGVkLlxuICpcbiAqIEBwYXJhbSBwcm9wTmFtZSBUaGUgbmFtZSBvZiB0aGUgcHJvcGVydHkgdG8gdXBkYXRlXG4gKiBAcGFyYW0gcHJlZml4IFN0YXRpYyB2YWx1ZSB1c2VkIGZvciBjb25jYXRlbmF0aW9uIG9ubHkuXG4gKiBAcGFyYW0gdjAgVmFsdWUgY2hlY2tlZCBmb3IgY2hhbmdlLlxuICogQHBhcmFtIGkwIFN0YXRpYyB2YWx1ZSB1c2VkIGZvciBjb25jYXRlbmF0aW9uIG9ubHkuXG4gKiBAcGFyYW0gdjEgVmFsdWUgY2hlY2tlZCBmb3IgY2hhbmdlLlxuICogQHBhcmFtIGkxIFN0YXRpYyB2YWx1ZSB1c2VkIGZvciBjb25jYXRlbmF0aW9uIG9ubHkuXG4gKiBAcGFyYW0gdjIgVmFsdWUgY2hlY2tlZCBmb3IgY2hhbmdlLlxuICogQHBhcmFtIGkyIFN0YXRpYyB2YWx1ZSB1c2VkIGZvciBjb25jYXRlbmF0aW9uIG9ubHkuXG4gKiBAcGFyYW0gdjMgVmFsdWUgY2hlY2tlZCBmb3IgY2hhbmdlLlxuICogQHBhcmFtIGkzIFN0YXRpYyB2YWx1ZSB1c2VkIGZvciBjb25jYXRlbmF0aW9uIG9ubHkuXG4gKiBAcGFyYW0gdjQgVmFsdWUgY2hlY2tlZCBmb3IgY2hhbmdlLlxuICogQHBhcmFtIGk0IFN0YXRpYyB2YWx1ZSB1c2VkIGZvciBjb25jYXRlbmF0aW9uIG9ubHkuXG4gKiBAcGFyYW0gdjUgVmFsdWUgY2hlY2tlZCBmb3IgY2hhbmdlLlxuICogQHBhcmFtIGk1IFN0YXRpYyB2YWx1ZSB1c2VkIGZvciBjb25jYXRlbmF0aW9uIG9ubHkuXG4gKiBAcGFyYW0gdjYgVmFsdWUgY2hlY2tlZCBmb3IgY2hhbmdlLlxuICogQHBhcmFtIGk2IFN0YXRpYyB2YWx1ZSB1c2VkIGZvciBjb25jYXRlbmF0aW9uIG9ubHkuXG4gKiBAcGFyYW0gdjcgVmFsdWUgY2hlY2tlZCBmb3IgY2hhbmdlLlxuICogQHBhcmFtIHN1ZmZpeCBTdGF0aWMgdmFsdWUgdXNlZCBmb3IgY29uY2F0ZW5hdGlvbiBvbmx5LlxuICogQHBhcmFtIHNhbml0aXplciBBbiBvcHRpb25hbCBzYW5pdGl6ZXIgZnVuY3Rpb25cbiAqIEByZXR1cm5zIGl0c2VsZiwgc28gdGhhdCBpdCBtYXkgYmUgY2hhaW5lZC5cbiAqIEBjb2RlR2VuQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiDJtcm1cHJvcGVydHlJbnRlcnBvbGF0ZTgoXG4gIHByb3BOYW1lOiBzdHJpbmcsXG4gIHByZWZpeDogc3RyaW5nLFxuICB2MDogYW55LFxuICBpMDogc3RyaW5nLFxuICB2MTogYW55LFxuICBpMTogc3RyaW5nLFxuICB2MjogYW55LFxuICBpMjogc3RyaW5nLFxuICB2MzogYW55LFxuICBpMzogc3RyaW5nLFxuICB2NDogYW55LFxuICBpNDogc3RyaW5nLFxuICB2NTogYW55LFxuICBpNTogc3RyaW5nLFxuICB2NjogYW55LFxuICBpNjogc3RyaW5nLFxuICB2NzogYW55LFxuICBzdWZmaXg6IHN0cmluZyxcbiAgc2FuaXRpemVyPzogU2FuaXRpemVyRm4sXG4pOiB0eXBlb2YgybXJtXByb3BlcnR5SW50ZXJwb2xhdGU4IHtcbiAgY29uc3QgbFZpZXcgPSBnZXRMVmlldygpO1xuICBjb25zdCBpbnRlcnBvbGF0ZWRWYWx1ZSA9IGludGVycG9sYXRpb244KFxuICAgIGxWaWV3LFxuICAgIHByZWZpeCxcbiAgICB2MCxcbiAgICBpMCxcbiAgICB2MSxcbiAgICBpMSxcbiAgICB2MixcbiAgICBpMixcbiAgICB2MyxcbiAgICBpMyxcbiAgICB2NCxcbiAgICBpNCxcbiAgICB2NSxcbiAgICBpNSxcbiAgICB2NixcbiAgICBpNixcbiAgICB2NyxcbiAgICBzdWZmaXgsXG4gICk7XG4gIGlmIChpbnRlcnBvbGF0ZWRWYWx1ZSAhPT0gTk9fQ0hBTkdFKSB7XG4gICAgY29uc3QgdFZpZXcgPSBnZXRUVmlldygpO1xuICAgIGNvbnN0IHROb2RlID0gZ2V0U2VsZWN0ZWRUTm9kZSgpO1xuICAgIGVsZW1lbnRQcm9wZXJ0eUludGVybmFsKFxuICAgICAgdFZpZXcsXG4gICAgICB0Tm9kZSxcbiAgICAgIGxWaWV3LFxuICAgICAgcHJvcE5hbWUsXG4gICAgICBpbnRlcnBvbGF0ZWRWYWx1ZSxcbiAgICAgIGxWaWV3W1JFTkRFUkVSXSxcbiAgICAgIHNhbml0aXplcixcbiAgICAgIGZhbHNlLFxuICAgICk7XG4gICAgbmdEZXZNb2RlICYmXG4gICAgICBzdG9yZVByb3BlcnR5QmluZGluZ01ldGFkYXRhKFxuICAgICAgICB0Vmlldy5kYXRhLFxuICAgICAgICB0Tm9kZSxcbiAgICAgICAgcHJvcE5hbWUsXG4gICAgICAgIGdldEJpbmRpbmdJbmRleCgpIC0gOCxcbiAgICAgICAgcHJlZml4LFxuICAgICAgICBpMCxcbiAgICAgICAgaTEsXG4gICAgICAgIGkyLFxuICAgICAgICBpMyxcbiAgICAgICAgaTQsXG4gICAgICAgIGk1LFxuICAgICAgICBpNixcbiAgICAgICAgc3VmZml4LFxuICAgICAgKTtcbiAgfVxuICByZXR1cm4gybXJtXByb3BlcnR5SW50ZXJwb2xhdGU4O1xufVxuXG4vKipcbiAqIFVwZGF0ZSBhbiBpbnRlcnBvbGF0ZWQgcHJvcGVydHkgb24gYW4gZWxlbWVudCB3aXRoIDkgb3IgbW9yZSBib3VuZCB2YWx1ZXMgc3Vycm91bmRlZCBieSB0ZXh0LlxuICpcbiAqIFVzZWQgd2hlbiB0aGUgbnVtYmVyIG9mIGludGVycG9sYXRlZCB2YWx1ZXMgZXhjZWVkcyA4LlxuICpcbiAqIGBgYGh0bWxcbiAqIDxkaXZcbiAqICB0aXRsZT1cInByZWZpeHt7djB9fS17e3YxfX0te3t2Mn19LXt7djN9fS17e3Y0fX0te3t2NX19LXt7djZ9fS17e3Y3fX0te3t2OH19LXt7djl9fXN1ZmZpeFwiPjwvZGl2PlxuICogYGBgXG4gKlxuICogSXRzIGNvbXBpbGVkIHJlcHJlc2VudGF0aW9uIGlzOjpcbiAqXG4gKiBgYGB0c1xuICogybXJtXByb3BlcnR5SW50ZXJwb2xhdGVWKFxuICogICd0aXRsZScsIFsncHJlZml4JywgdjAsICctJywgdjEsICctJywgdjIsICctJywgdjMsICctJywgdjQsICctJywgdjUsICctJywgdjYsICctJywgdjcsICctJywgdjksXG4gKiAgJ3N1ZmZpeCddKTtcbiAqIGBgYFxuICpcbiAqIElmIHRoZSBwcm9wZXJ0eSBuYW1lIGFsc28gZXhpc3RzIGFzIGFuIGlucHV0IHByb3BlcnR5IG9uIG9uZSBvZiB0aGUgZWxlbWVudCdzIGRpcmVjdGl2ZXMsXG4gKiB0aGUgY29tcG9uZW50IHByb3BlcnR5IHdpbGwgYmUgc2V0IGluc3RlYWQgb2YgdGhlIGVsZW1lbnQgcHJvcGVydHkuIFRoaXMgY2hlY2sgbXVzdFxuICogYmUgY29uZHVjdGVkIGF0IHJ1bnRpbWUgc28gY2hpbGQgY29tcG9uZW50cyB0aGF0IGFkZCBuZXcgYEBJbnB1dHNgIGRvbid0IGhhdmUgdG8gYmUgcmUtY29tcGlsZWQuXG4gKlxuICogQHBhcmFtIHByb3BOYW1lIFRoZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSB0byB1cGRhdGUuXG4gKiBAcGFyYW0gdmFsdWVzIFRoZSBjb2xsZWN0aW9uIG9mIHZhbHVlcyBhbmQgdGhlIHN0cmluZ3MgaW4gYmV0d2VlbiB0aG9zZSB2YWx1ZXMsIGJlZ2lubmluZyB3aXRoIGFcbiAqIHN0cmluZyBwcmVmaXggYW5kIGVuZGluZyB3aXRoIGEgc3RyaW5nIHN1ZmZpeC5cbiAqIChlLmcuIGBbJ3ByZWZpeCcsIHZhbHVlMCwgJy0nLCB2YWx1ZTEsICctJywgdmFsdWUyLCAuLi4sIHZhbHVlOTksICdzdWZmaXgnXWApXG4gKiBAcGFyYW0gc2FuaXRpemVyIEFuIG9wdGlvbmFsIHNhbml0aXplciBmdW5jdGlvblxuICogQHJldHVybnMgaXRzZWxmLCBzbyB0aGF0IGl0IG1heSBiZSBjaGFpbmVkLlxuICogQGNvZGVHZW5BcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIMm1ybVwcm9wZXJ0eUludGVycG9sYXRlVihcbiAgcHJvcE5hbWU6IHN0cmluZyxcbiAgdmFsdWVzOiBhbnlbXSxcbiAgc2FuaXRpemVyPzogU2FuaXRpemVyRm4sXG4pOiB0eXBlb2YgybXJtXByb3BlcnR5SW50ZXJwb2xhdGVWIHtcbiAgY29uc3QgbFZpZXcgPSBnZXRMVmlldygpO1xuICBjb25zdCBpbnRlcnBvbGF0ZWRWYWx1ZSA9IGludGVycG9sYXRpb25WKGxWaWV3LCB2YWx1ZXMpO1xuICBpZiAoaW50ZXJwb2xhdGVkVmFsdWUgIT09IE5PX0NIQU5HRSkge1xuICAgIGNvbnN0IHRWaWV3ID0gZ2V0VFZpZXcoKTtcbiAgICBjb25zdCB0Tm9kZSA9IGdldFNlbGVjdGVkVE5vZGUoKTtcbiAgICBlbGVtZW50UHJvcGVydHlJbnRlcm5hbChcbiAgICAgIHRWaWV3LFxuICAgICAgdE5vZGUsXG4gICAgICBsVmlldyxcbiAgICAgIHByb3BOYW1lLFxuICAgICAgaW50ZXJwb2xhdGVkVmFsdWUsXG4gICAgICBsVmlld1tSRU5ERVJFUl0sXG4gICAgICBzYW5pdGl6ZXIsXG4gICAgICBmYWxzZSxcbiAgICApO1xuICAgIGlmIChuZ0Rldk1vZGUpIHtcbiAgICAgIGNvbnN0IGludGVycG9sYXRpb25JbkJldHdlZW4gPSBbdmFsdWVzWzBdXTsgLy8gcHJlZml4XG4gICAgICBmb3IgKGxldCBpID0gMjsgaSA8IHZhbHVlcy5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgICBpbnRlcnBvbGF0aW9uSW5CZXR3ZWVuLnB1c2godmFsdWVzW2ldKTtcbiAgICAgIH1cbiAgICAgIHN0b3JlUHJvcGVydHlCaW5kaW5nTWV0YWRhdGEoXG4gICAgICAgIHRWaWV3LmRhdGEsXG4gICAgICAgIHROb2RlLFxuICAgICAgICBwcm9wTmFtZSxcbiAgICAgICAgZ2V0QmluZGluZ0luZGV4KCkgLSBpbnRlcnBvbGF0aW9uSW5CZXR3ZWVuLmxlbmd0aCArIDEsXG4gICAgICAgIC4uLmludGVycG9sYXRpb25JbkJldHdlZW4sXG4gICAgICApO1xuICAgIH1cbiAgfVxuICByZXR1cm4gybXJtXByb3BlcnR5SW50ZXJwb2xhdGVWO1xufVxuIl19