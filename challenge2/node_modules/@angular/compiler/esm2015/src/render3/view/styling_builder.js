import { ASTWithSource, BindingPipe, Interpolation } from '../../expression_parser/ast';
import * as o from '../../output/output_ast';
import { isEmptyExpression } from '../../template_parser/template_parser';
import { Identifiers as R3 } from '../r3_identifiers';
import { hyphenate, parse as parseStyle } from './style_parser';
import { getInterpolationArgsLength } from './util';
const IMPORTANT_FLAG = '!important';
/**
 * Minimum amount of binding slots required in the runtime for style/class bindings.
 *
 * Styling in Angular uses up two slots in the runtime LView/TData data structures to
 * record binding data, property information and metadata.
 *
 * When a binding is registered it will place the following information in the `LView`:
 *
 * slot 1) binding value
 * slot 2) cached value (all other values collected before it in string form)
 *
 * When a binding is registered it will place the following information in the `TData`:
 *
 * slot 1) prop name
 * slot 2) binding index that points to the previous style/class binding (and some extra config
 * values)
 *
 * Let's imagine we have a binding that looks like so:
 *
 * ```
 * <div [style.width]="x" [style.height]="y">
 * ```
 *
 * Our `LView` and `TData` data-structures look like so:
 *
 * ```typescript
 * LView = [
 *   // ...
 *   x, // value of x
 *   "width: x",
 *
 *   y, // value of y
 *   "width: x; height: y",
 *   // ...
 * ];
 *
 * TData = [
 *   // ...
 *   "width", // binding slot 20
 *   0,
 *
 *   "height",
 *   20,
 *   // ...
 * ];
 * ```
 *
 * */
export const MIN_STYLING_BINDING_SLOTS_REQUIRED = 2;
/**
 * Produces creation/update instructions for all styling bindings (class and style)
 *
 * It also produces the creation instruction to register all initial styling values
 * (which are all the static class="..." and style="..." attribute values that exist
 * on an element within a template).
 *
 * The builder class below handles producing instructions for the following cases:
 *
 * - Static style/class attributes (style="..." and class="...")
 * - Dynamic style/class map bindings ([style]="map" and [class]="map|string")
 * - Dynamic style/class property bindings ([style.prop]="exp" and [class.name]="exp")
 *
 * Due to the complex relationship of all of these cases, the instructions generated
 * for these attributes/properties/bindings must be done so in the correct order. The
 * order which these must be generated is as follows:
 *
 * if (createMode) {
 *   styling(...)
 * }
 * if (updateMode) {
 *   styleMap(...)
 *   classMap(...)
 *   styleProp(...)
 *   classProp(...)
 * }
 *
 * The creation/update methods within the builder class produce these instructions.
 */
export class StylingBuilder {
    constructor(_directiveExpr) {
        this._directiveExpr = _directiveExpr;
        /** Whether or not there are any static styling values present */
        this._hasInitialValues = false;
        /**
         *  Whether or not there are any styling bindings present
         *  (i.e. `[style]`, `[class]`, `[style.prop]` or `[class.name]`)
         */
        this.hasBindings = false;
        this.hasBindingsWithPipes = false;
        /** the input for [class] (if it exists) */
        this._classMapInput = null;
        /** the input for [style] (if it exists) */
        this._styleMapInput = null;
        /** an array of each [style.prop] input */
        this._singleStyleInputs = null;
        /** an array of each [class.name] input */
        this._singleClassInputs = null;
        this._lastStylingInput = null;
        this._firstStylingInput = null;
        // maps are used instead of hash maps because a Map will
        // retain the ordering of the keys
        /**
         * Represents the location of each style binding in the template
         * (e.g. `<div [style.width]="w" [style.height]="h">` implies
         * that `width=0` and `height=1`)
         */
        this._stylesIndex = new Map();
        /**
         * Represents the location of each class binding in the template
         * (e.g. `<div [class.big]="b" [class.hidden]="h">` implies
         * that `big=0` and `hidden=1`)
         */
        this._classesIndex = new Map();
        this._initialStyleValues = [];
        this._initialClassValues = [];
    }
    /**
     * Registers a given input to the styling builder to be later used when producing AOT code.
     *
     * The code below will only accept the input if it is somehow tied to styling (whether it be
     * style/class bindings or static style/class attributes).
     */
    registerBoundInput(input) {
        // [attr.style] or [attr.class] are skipped in the code below,
        // they should not be treated as styling-based bindings since
        // they are intended to be written directly to the attr and
        // will therefore skip all style/class resolution that is present
        // with style="", [style]="" and [style.prop]="", class="",
        // [class.prop]="". [class]="" assignments
        let binding = null;
        let name = input.name;
        switch (input.type) {
            case 0 /* Property */:
                binding = this.registerInputBasedOnName(name, input.value, input.sourceSpan);
                break;
            case 3 /* Style */:
                binding = this.registerStyleInput(name, false, input.value, input.sourceSpan, input.unit);
                break;
            case 2 /* Class */:
                binding = this.registerClassInput(name, false, input.value, input.sourceSpan);
                break;
        }
        return binding ? true : false;
    }
    registerInputBasedOnName(name, expression, sourceSpan) {
        let binding = null;
        const prefix = name.substring(0, 6);
        const isStyle = name === 'style' || prefix === 'style.' || prefix === 'style!';
        const isClass = !isStyle && (name === 'class' || prefix === 'class.' || prefix === 'class!');
        if (isStyle || isClass) {
            const isMapBased = name.charAt(5) !== '.'; // style.prop or class.prop makes this a no
            const property = name.substr(isMapBased ? 5 : 6); // the dot explains why there's a +1
            if (isStyle) {
                binding = this.registerStyleInput(property, isMapBased, expression, sourceSpan);
            }
            else {
                binding = this.registerClassInput(property, isMapBased, expression, sourceSpan);
            }
        }
        return binding;
    }
    registerStyleInput(name, isMapBased, value, sourceSpan, suffix) {
        if (isEmptyExpression(value)) {
            return null;
        }
        // CSS custom properties are case-sensitive so we shouldn't normalize them.
        // See: https://www.w3.org/TR/css-variables-1/#defining-variables
        if (!isCssCustomProperty(name)) {
            name = hyphenate(name);
        }
        const { property, hasOverrideFlag, suffix: bindingSuffix } = parseProperty(name);
        suffix = typeof suffix === 'string' && suffix.length !== 0 ? suffix : bindingSuffix;
        const entry = { name: property, suffix: suffix, value, sourceSpan, hasOverrideFlag };
        if (isMapBased) {
            this._styleMapInput = entry;
        }
        else {
            (this._singleStyleInputs = this._singleStyleInputs || []).push(entry);
            registerIntoMap(this._stylesIndex, property);
        }
        this._lastStylingInput = entry;
        this._firstStylingInput = this._firstStylingInput || entry;
        this._checkForPipes(value);
        this.hasBindings = true;
        return entry;
    }
    registerClassInput(name, isMapBased, value, sourceSpan) {
        if (isEmptyExpression(value)) {
            return null;
        }
        const { property, hasOverrideFlag } = parseProperty(name);
        const entry = { name: property, value, sourceSpan, hasOverrideFlag, suffix: null };
        if (isMapBased) {
            this._classMapInput = entry;
        }
        else {
            (this._singleClassInputs = this._singleClassInputs || []).push(entry);
            registerIntoMap(this._classesIndex, property);
        }
        this._lastStylingInput = entry;
        this._firstStylingInput = this._firstStylingInput || entry;
        this._checkForPipes(value);
        this.hasBindings = true;
        return entry;
    }
    _checkForPipes(value) {
        if ((value instanceof ASTWithSource) && (value.ast instanceof BindingPipe)) {
            this.hasBindingsWithPipes = true;
        }
    }
    /**
     * Registers the element's static style string value to the builder.
     *
     * @param value the style string (e.g. `width:100px; height:200px;`)
     */
    registerStyleAttr(value) {
        this._initialStyleValues = parseStyle(value);
        this._hasInitialValues = true;
    }
    /**
     * Registers the element's static class string value to the builder.
     *
     * @param value the className string (e.g. `disabled gold zoom`)
     */
    registerClassAttr(value) {
        this._initialClassValues = value.trim().split(/\s+/g);
        this._hasInitialValues = true;
    }
    /**
     * Appends all styling-related expressions to the provided attrs array.
     *
     * @param attrs an existing array where each of the styling expressions
     * will be inserted into.
     */
    populateInitialStylingAttrs(attrs) {
        // [CLASS_MARKER, 'foo', 'bar', 'baz' ...]
        if (this._initialClassValues.length) {
            attrs.push(o.literal(1 /* Classes */));
            for (let i = 0; i < this._initialClassValues.length; i++) {
                attrs.push(o.literal(this._initialClassValues[i]));
            }
        }
        // [STYLE_MARKER, 'width', '200px', 'height', '100px', ...]
        if (this._initialStyleValues.length) {
            attrs.push(o.literal(2 /* Styles */));
            for (let i = 0; i < this._initialStyleValues.length; i += 2) {
                attrs.push(o.literal(this._initialStyleValues[i]), o.literal(this._initialStyleValues[i + 1]));
            }
        }
    }
    /**
     * Builds an instruction with all the expressions and parameters for `elementHostAttrs`.
     *
     * The instruction generation code below is used for producing the AOT statement code which is
     * responsible for registering initial styles (within a directive hostBindings' creation block),
     * as well as any of the provided attribute values, to the directive host element.
     */
    assignHostAttrs(attrs, definitionMap) {
        if (this._directiveExpr && (attrs.length || this._hasInitialValues)) {
            this.populateInitialStylingAttrs(attrs);
            definitionMap.set('hostAttrs', o.literalArr(attrs));
        }
    }
    /**
     * Builds an instruction with all the expressions and parameters for `classMap`.
     *
     * The instruction data will contain all expressions for `classMap` to function
     * which includes the `[class]` expression params.
     */
    buildClassMapInstruction(valueConverter) {
        if (this._classMapInput) {
            return this._buildMapBasedInstruction(valueConverter, true, this._classMapInput);
        }
        return null;
    }
    /**
     * Builds an instruction with all the expressions and parameters for `styleMap`.
     *
     * The instruction data will contain all expressions for `styleMap` to function
     * which includes the `[style]` expression params.
     */
    buildStyleMapInstruction(valueConverter) {
        if (this._styleMapInput) {
            return this._buildMapBasedInstruction(valueConverter, false, this._styleMapInput);
        }
        return null;
    }
    _buildMapBasedInstruction(valueConverter, isClassBased, stylingInput) {
        // each styling binding value is stored in the LView
        // map-based bindings allocate two slots: one for the
        // previous binding value and another for the previous
        // className or style attribute value.
        let totalBindingSlotsRequired = MIN_STYLING_BINDING_SLOTS_REQUIRED;
        // these values must be outside of the update block so that they can
        // be evaluated (the AST visit call) during creation time so that any
        // pipes can be picked up in time before the template is built
        const mapValue = stylingInput.value.visit(valueConverter);
        let reference;
        if (mapValue instanceof Interpolation) {
            totalBindingSlotsRequired += mapValue.expressions.length;
            reference = isClassBased ? getClassMapInterpolationExpression(mapValue) :
                getStyleMapInterpolationExpression(mapValue);
        }
        else {
            reference = isClassBased ? R3.classMap : R3.styleMap;
        }
        return {
            reference,
            calls: [{
                    supportsInterpolation: true,
                    sourceSpan: stylingInput.sourceSpan,
                    allocateBindingSlots: totalBindingSlotsRequired,
                    params: (convertFn) => {
                        const convertResult = convertFn(mapValue);
                        const params = Array.isArray(convertResult) ? convertResult : [convertResult];
                        return params;
                    }
                }]
        };
    }
    _buildSingleInputs(reference, inputs, valueConverter, getInterpolationExpressionFn, isClassBased) {
        const instructions = [];
        inputs.forEach(input => {
            const previousInstruction = instructions[instructions.length - 1];
            const value = input.value.visit(valueConverter);
            let referenceForCall = reference;
            // each styling binding value is stored in the LView
            // but there are two values stored for each binding:
            //   1) the value itself
            //   2) an intermediate value (concatenation of style up to this point).
            //      We need to store the intermediate value so that we don't allocate
            //      the strings on each CD.
            let totalBindingSlotsRequired = MIN_STYLING_BINDING_SLOTS_REQUIRED;
            if (value instanceof Interpolation) {
                totalBindingSlotsRequired += value.expressions.length;
                if (getInterpolationExpressionFn) {
                    referenceForCall = getInterpolationExpressionFn(value);
                }
            }
            const call = {
                sourceSpan: input.sourceSpan,
                allocateBindingSlots: totalBindingSlotsRequired,
                supportsInterpolation: !!getInterpolationExpressionFn,
                params: (convertFn) => {
                    // params => stylingProp(propName, value, suffix)
                    const params = [];
                    params.push(o.literal(input.name));
                    const convertResult = convertFn(value);
                    if (Array.isArray(convertResult)) {
                        params.push(...convertResult);
                    }
                    else {
                        params.push(convertResult);
                    }
                    // [style.prop] bindings may use suffix values (e.g. px, em, etc...), therefore,
                    // if that is detected then we need to pass that in as an optional param.
                    if (!isClassBased && input.suffix !== null) {
                        params.push(o.literal(input.suffix));
                    }
                    return params;
                }
            };
            // If we ended up generating a call to the same instruction as the previous styling property
            // we can chain the calls together safely to save some bytes, otherwise we have to generate
            // a separate instruction call. This is primarily a concern with interpolation instructions
            // where we may start off with one `reference`, but end up using another based on the
            // number of interpolations.
            if (previousInstruction && previousInstruction.reference === referenceForCall) {
                previousInstruction.calls.push(call);
            }
            else {
                instructions.push({ reference: referenceForCall, calls: [call] });
            }
        });
        return instructions;
    }
    _buildClassInputs(valueConverter) {
        if (this._singleClassInputs) {
            return this._buildSingleInputs(R3.classProp, this._singleClassInputs, valueConverter, null, true);
        }
        return [];
    }
    _buildStyleInputs(valueConverter) {
        if (this._singleStyleInputs) {
            return this._buildSingleInputs(R3.styleProp, this._singleStyleInputs, valueConverter, getStylePropInterpolationExpression, false);
        }
        return [];
    }
    /**
     * Constructs all instructions which contain the expressions that will be placed
     * into the update block of a template function or a directive hostBindings function.
     */
    buildUpdateLevelInstructions(valueConverter) {
        const instructions = [];
        if (this.hasBindings) {
            const styleMapInstruction = this.buildStyleMapInstruction(valueConverter);
            if (styleMapInstruction) {
                instructions.push(styleMapInstruction);
            }
            const classMapInstruction = this.buildClassMapInstruction(valueConverter);
            if (classMapInstruction) {
                instructions.push(classMapInstruction);
            }
            instructions.push(...this._buildStyleInputs(valueConverter));
            instructions.push(...this._buildClassInputs(valueConverter));
        }
        return instructions;
    }
}
function registerIntoMap(map, key) {
    if (!map.has(key)) {
        map.set(key, map.size);
    }
}
export function parseProperty(name) {
    let hasOverrideFlag = false;
    const overrideIndex = name.indexOf(IMPORTANT_FLAG);
    if (overrideIndex !== -1) {
        name = overrideIndex > 0 ? name.substring(0, overrideIndex) : '';
        hasOverrideFlag = true;
    }
    let suffix = null;
    let property = name;
    const unitIndex = name.lastIndexOf('.');
    if (unitIndex > 0) {
        suffix = name.substr(unitIndex + 1);
        property = name.substring(0, unitIndex);
    }
    return { property, suffix, hasOverrideFlag };
}
/**
 * Gets the instruction to generate for an interpolated class map.
 * @param interpolation An Interpolation AST
 */
function getClassMapInterpolationExpression(interpolation) {
    switch (getInterpolationArgsLength(interpolation)) {
        case 1:
            return R3.classMap;
        case 3:
            return R3.classMapInterpolate1;
        case 5:
            return R3.classMapInterpolate2;
        case 7:
            return R3.classMapInterpolate3;
        case 9:
            return R3.classMapInterpolate4;
        case 11:
            return R3.classMapInterpolate5;
        case 13:
            return R3.classMapInterpolate6;
        case 15:
            return R3.classMapInterpolate7;
        case 17:
            return R3.classMapInterpolate8;
        default:
            return R3.classMapInterpolateV;
    }
}
/**
 * Gets the instruction to generate for an interpolated style map.
 * @param interpolation An Interpolation AST
 */
function getStyleMapInterpolationExpression(interpolation) {
    switch (getInterpolationArgsLength(interpolation)) {
        case 1:
            return R3.styleMap;
        case 3:
            return R3.styleMapInterpolate1;
        case 5:
            return R3.styleMapInterpolate2;
        case 7:
            return R3.styleMapInterpolate3;
        case 9:
            return R3.styleMapInterpolate4;
        case 11:
            return R3.styleMapInterpolate5;
        case 13:
            return R3.styleMapInterpolate6;
        case 15:
            return R3.styleMapInterpolate7;
        case 17:
            return R3.styleMapInterpolate8;
        default:
            return R3.styleMapInterpolateV;
    }
}
/**
 * Gets the instruction to generate for an interpolated style prop.
 * @param interpolation An Interpolation AST
 */
function getStylePropInterpolationExpression(interpolation) {
    switch (getInterpolationArgsLength(interpolation)) {
        case 1:
            return R3.styleProp;
        case 3:
            return R3.stylePropInterpolate1;
        case 5:
            return R3.stylePropInterpolate2;
        case 7:
            return R3.stylePropInterpolate3;
        case 9:
            return R3.stylePropInterpolate4;
        case 11:
            return R3.stylePropInterpolate5;
        case 13:
            return R3.stylePropInterpolate6;
        case 15:
            return R3.stylePropInterpolate7;
        case 17:
            return R3.stylePropInterpolate8;
        default:
            return R3.stylePropInterpolateV;
    }
}
/**
 * Checks whether property name is a custom CSS property.
 * See: https://www.w3.org/TR/css-variables-1
 */
function isCssCustomProperty(name) {
    return name.startsWith('--');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGluZ19idWlsZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3JlbmRlcjMvdmlldy9zdHlsaW5nX2J1aWxkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBUUEsT0FBTyxFQUFNLGFBQWEsRUFBRSxXQUFXLEVBQWUsYUFBYSxFQUFDLE1BQU0sNkJBQTZCLENBQUM7QUFDeEcsT0FBTyxLQUFLLENBQUMsTUFBTSx5QkFBeUIsQ0FBQztBQUU3QyxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSx1Q0FBdUMsQ0FBQztBQUV4RSxPQUFPLEVBQUMsV0FBVyxJQUFJLEVBQUUsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBRXBELE9BQU8sRUFBQyxTQUFTLEVBQUUsS0FBSyxJQUFJLFVBQVUsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRTlELE9BQU8sRUFBZ0IsMEJBQTBCLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFFakUsTUFBTSxjQUFjLEdBQUcsWUFBWSxDQUFDO0FBRXBDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztLQStDSztBQUNMLE1BQU0sQ0FBQyxNQUFNLGtDQUFrQyxHQUFHLENBQUMsQ0FBQztBQTZCcEQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E0Qkc7QUFDSCxNQUFNLE9BQU8sY0FBYztJQXdDekIsWUFBb0IsY0FBaUM7UUFBakMsbUJBQWMsR0FBZCxjQUFjLENBQW1CO1FBdkNyRCxpRUFBaUU7UUFDekQsc0JBQWlCLEdBQUcsS0FBSyxDQUFDO1FBQ2xDOzs7V0FHRztRQUNJLGdCQUFXLEdBQUcsS0FBSyxDQUFDO1FBQ3BCLHlCQUFvQixHQUFHLEtBQUssQ0FBQztRQUVwQywyQ0FBMkM7UUFDbkMsbUJBQWMsR0FBMkIsSUFBSSxDQUFDO1FBQ3RELDJDQUEyQztRQUNuQyxtQkFBYyxHQUEyQixJQUFJ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LENBQUM7WUFDSixPQUFPLEVBQUUsQ0FBQyxTQUFTLENBQUM7UUFDdEIsS0FBSyxDQUFDO1lBQ0osT0FBTyxFQUFFLENBQUMscUJBQXFCLENBQUM7UUFDbEMsS0FBSyxDQUFDO1lBQ0osT0FBTyxFQUFFLENBQUMscUJBQXFCLENBQUM7UUFDbEMsS0FBSyxDQUFDO1lBQ0osT0FBTyxFQUFFLENBQUMscUJBQXFCLENBQUM7UUFDbEMsS0FBSyxDQUFDO1lBQ0osT0FBTyxFQUFFLENBQUMscUJBQXFCLENBQUM7UUFDbEMsS0FBSyxFQUFFO1lBQ0wsT0FBTyxFQUFFLENBQUMscUJBQXFCLENBQUM7UUFDbEMsS0FBSyxFQUFFO1lBQ0wsT0FBTyxFQUFFLENBQUMscUJBQXFCLENBQUM7UUFDbEMsS0FBSyxFQUFFO1lBQ0wsT0FBTyxFQUFFLENBQUMscUJBQXFCLENBQUM7UUFDbEMsS0FBSyxFQUFFO1lBQ0wsT0FBTyxFQUFFLENBQUMscUJBQXFCLENBQUM7UUFDbEM7WUFDRSxPQUFPLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQztLQUNuQztBQUNILENBQUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFTLG1CQUFtQixDQUFDLElBQVk7SUFDdkMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQy9CLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7QXR0cmlidXRlTWFya2VyfSBmcm9tICcuLi8uLi9jb3JlJztcbmltcG9ydCB7QVNULCBBU1RXaXRoU291cmNlLCBCaW5kaW5nUGlwZSwgQmluZGluZ1R5cGUsIEludGVycG9sYXRpb259IGZyb20gJy4uLy4uL2V4cHJlc3Npb25fcGFyc2VyL2FzdCc7XG5pbXBvcnQgKiBhcyBvIGZyb20gJy4uLy4uL291dHB1dC9vdXRwdXRfYXN0JztcbmltcG9ydCB7UGFyc2VTb3VyY2VTcGFufSBmcm9tICcuLi8uLi9wYXJzZV91dGlsJztcbmltcG9ydCB7aXNFbXB0eUV4cHJlc3Npb259IGZyb20gJy4uLy4uL3RlbXBsYXRlX3BhcnNlci90ZW1wbGF0ZV9wYXJzZXInO1xuaW1wb3J0ICogYXMgdCBmcm9tICcuLi9yM19hc3QnO1xuaW1wb3J0IHtJZGVudGlmaWVycyBhcyBSM30gZnJvbSAnLi4vcjNfaWRlbnRpZmllcnMnO1xuXG5pbXBvcnQge2h5cGhlbmF0ZSwgcGFyc2UgYXMgcGFyc2VTdHlsZX0gZnJvbSAnLi9zdHlsZV9wYXJzZXInO1xuaW1wb3J0IHtWYWx1ZUNvbnZlcnRlcn0gZnJvbSAnLi90ZW1wbGF0ZSc7XG5pbXBvcnQge0RlZmluaXRpb25NYXAsIGdldEludGVycG9sYXRpb25BcmdzTGVuZ3RofSBmcm9tICcuL3V0aWwnO1xuXG5jb25zdCBJTVBPUlRBTlRfRkxBRyA9ICchaW1wb3J0YW50JztcblxuLyoqXG4gKiBNaW5pbXVtIGFtb3VudCBvZiBiaW5kaW5nIHNsb3RzIHJlcXVpcmVkIGluIHRoZSBydW50aW1lIGZvciBzdHlsZS9jbGFzcyBiaW5kaW5ncy5cbiAqXG4gKiBTdHlsaW5nIGluIEFuZ3VsYXIgdXNlcyB1cCB0d28gc2xvdHMgaW4gdGhlIHJ1bnRpbWUgTFZpZXcvVERhdGEgZGF0YSBzdHJ1Y3R1cmVzIHRvXG4gKiByZWNvcmQgYmluZGluZyBkYXRhLCBwcm9wZXJ0eSBpbmZvcm1hdGlvbiBhbmQgbWV0YWRhdGEuXG4gKlxuICogV2hlbiBhIGJpbmRpbmcgaXMgcmVnaXN0ZXJlZCBpdCB3aWxsIHBsYWNlIHRoZSBmb2xsb3dpbmcgaW5mb3JtYXRpb24gaW4gdGhlIGBMVmlld2A6XG4gKlxuICogc2xvdCAxKSBiaW5kaW5nIHZhbHVlXG4gKiBzbG90IDIpIGNhY2hlZCB2YWx1ZSAoYWxsIG90aGVyIHZhbHVlcyBjb2xsZWN0ZWQgYmVmb3JlIGl0IGluIHN0cmluZyBmb3JtKVxuICpcbiAqIFdoZW4gYSBiaW5kaW5nIGlzIHJlZ2lzdGVyZWQgaXQgd2lsbCBwbGFjZSB0aGUgZm9sbG93aW5nIGluZm9ybWF0aW9uIGluIHRoZSBgVERhdGFgOlxuICpcbiAqIHNsb3QgMSkgcHJvcCBuYW1lXG4gKiBzbG90IDIpIGJpbmRpbmcgaW5kZXggdGhhdCBwb2ludHMgdG8gdGhlIHByZXZpb3VzIHN0eWxlL2NsYXNzIGJpbmRpbmcgKGFuZCBzb21lIGV4dHJhIGNvbmZpZ1xuICogdmFsdWVzKVxuICpcbiAqIExldCdzIGltYWdpbmUgd2UgaGF2ZSBhIGJpbmRpbmcgdGhhdCBsb29rcyBsaWtlIHNvOlxuICpcbiAqIGBgYFxuICogPGRpdiBbc3R5bGUud2lkdGhdPVwieFwiIFtzdHlsZS5oZWlnaHRdPVwieVwiPlxuICogYGBgXG4gKlxuICogT3VyIGBMVmlld2AgYW5kIGBURGF0YWAgZGF0YS1zdHJ1Y3R1cmVzIGxvb2sgbGlrZSBzbzpcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBMVmlldyA9IFtcbiAqICAgLy8gLi4uXG4gKiAgIHgsIC8vIHZhbHVlIG9mIHhcbiAqICAgXCJ3aWR0aDogeFwiLFxuICpcbiAqICAgeSwgLy8gdmFsdWUgb2YgeVxuICogICBcIndpZHRoOiB4OyBoZWlnaHQ6IHlcIixcbiAqICAgLy8gLi4uXG4gKiBdO1xuICpcbiAqIFREYXRhID0gW1xuICogICAvLyAuLi5cbiAqICAgXCJ3aWR0aFwiLCAvLyBiaW5kaW5nIHNsb3QgMjBcbiAqICAgMCxcbiAqXG4gKiAgIFwiaGVpZ2h0XCIsXG4gKiAgIDIwLFxuICogICAvLyAuLi5cbiAqIF07XG4gKiBgYGBcbiAqXG4gKiAqL1xuZXhwb3J0IGNvbnN0IE1JTl9TVFlMSU5HX0JJTkRJTkdfU0xPVFNfUkVRVUlSRUQgPSAyO1xuXG4vKipcbiAqIEEgc3R5bGluZyBleHByZXNzaW9uIHN1bW1hcnkgdGhhdCBpcyB0byBiZSBwcm9jZXNzZWQgYnkgdGhlIGNvbXBpbGVyXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU3R5bGluZ0luc3RydWN0aW9uIHtcbiAgcmVmZXJlbmNlOiBvLkV4dGVybmFsUmVmZXJlbmNlO1xuICAvKiogQ2FsbHMgdG8gaW5kaXZpZHVhbCBzdHlsaW5nIGluc3RydWN0aW9ucy4gVXNlZCB3aGVuIGNoYWluaW5nIGNhbGxzIHRvIHRoZSBzYW1lIGluc3RydWN0aW9uLiAqL1xuICBjYWxsczogU3R5bGluZ0luc3RydWN0aW9uQ2FsbFtdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFN0eWxpbmdJbnN0cnVjdGlvbkNhbGwge1xuICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW58bnVsbDtcbiAgc3VwcG9ydHNJbnRlcnBvbGF0aW9uOiBib29sZWFuO1xuICBhbGxvY2F0ZUJpbmRpbmdTbG90czogbnVtYmVyO1xuICBwYXJhbXM6ICgoY29udmVydEZuOiAodmFsdWU6IGFueSkgPT4gby5FeHByZXNzaW9uIHwgby5FeHByZXNzaW9uW10pID0+IG8uRXhwcmVzc2lvbltdKTtcbn1cblxuLyoqXG4gKiBBbiBpbnRlcm5hbCByZWNvcmQgb2YgdGhlIGlucHV0IGRhdGEgZm9yIGEgc3R5bGluZyBiaW5kaW5nXG4gKi9cbmludGVyZmFjZSBCb3VuZFN0eWxpbmdFbnRyeSB7XG4gIGhhc092ZXJyaWRlRmxhZzogYm9vbGVhbjtcbiAgbmFtZTogc3RyaW5nfG51bGw7XG4gIHN1ZmZpeDogc3RyaW5nfG51bGw7XG4gIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbjtcbiAgdmFsdWU6IEFTVDtcbn1cblxuLyoqXG4gKiBQcm9kdWNlcyBjcmVhdGlvbi91cGRhdGUgaW5zdHJ1Y3Rpb25zIGZvciBhbGwgc3R5bGluZyBiaW5kaW5ncyAoY2xhc3MgYW5kIHN0eWxlKVxuICpcbiAqIEl0IGFsc28gcHJvZHVjZXMgdGhlIGNyZWF0aW9uIGluc3RydWN0aW9uIHRvIHJlZ2lzdGVyIGFsbCBpbml0aWFsIHN0eWxpbmcgdmFsdWVzXG4gKiAod2hpY2ggYXJlIGFsbCB0aGUgc3RhdGljIGNsYXNzPVwiLi4uXCIgYW5kIHN0eWxlPVwiLi4uXCIgYXR0cmlidXRlIHZhbHVlcyB0aGF0IGV4aXN0XG4gKiBvbiBhbiBlbGVtZW50IHdpdGhpbiBhIHRlbXBsYXRlKS5cbiAqXG4gKiBUaGUgYnVpbGRlciBjbGFzcyBiZWxvdyBoYW5kbGVzIHByb2R1Y2luZyBpbnN0cnVjdGlvbnMgZm9yIHRoZSBmb2xsb3dpbmcgY2FzZXM6XG4gKlxuICogLSBTdGF0aWMgc3R5bGUvY2xhc3MgYXR0cmlidXRlcyAoc3R5bGU9XCIuLi5cIiBhbmQgY2xhc3M9XCIuLi5cIilcbiAqIC0gRHluYW1pYyBzdHlsZS9jbGFzcyBtYXAgYmluZGluZ3MgKFtzdHlsZV09XCJtYXBcIiBhbmQgW2NsYXNzXT1cIm1hcHxzdHJpbmdcIilcbiAqIC0gRHluYW1pYyBzdHlsZS9jbGFzcyBwcm9wZXJ0eSBiaW5kaW5ncyAoW3N0eWxlLnByb3BdPVwiZXhwXCIgYW5kIFtjbGFzcy5uYW1lXT1cImV4cFwiKVxuICpcbiAqIER1ZSB0byB0aGUgY29tcGxleCByZWxhdGlvbnNoaXAgb2YgYWxsIG9mIHRoZXNlIGNhc2VzLCB0aGUgaW5zdHJ1Y3Rpb25zIGdlbmVyYXRlZFxuICogZm9yIHRoZXNlIGF0dHJpYnV0ZXMvcHJvcGVydGllcy9iaW5kaW5ncyBtdXN0IGJlIGRvbmUgc28gaW4gdGhlIGNvcnJlY3Qgb3JkZXIuIFRoZVxuICogb3JkZXIgd2hpY2ggdGhlc2UgbXVzdCBiZSBnZW5lcmF0ZWQgaXMgYXMgZm9sbG93czpcbiAqXG4gKiBpZiAoY3JlYXRlTW9kZSkge1xuICogICBzdHlsaW5nKC4uLilcbiAqIH1cbiAqIGlmICh1cGRhdGVNb2RlKSB7XG4gKiAgIHN0eWxlTWFwKC4uLilcbiAqICAgY2xhc3NNYXAoLi4uKVxuICogICBzdHlsZVByb3AoLi4uKVxuICogICBjbGFzc1Byb3AoLi4uKVxuICogfVxuICpcbiAqIFRoZSBjcmVhdGlvbi91cGRhdGUgbWV0aG9kcyB3aXRoaW4gdGhlIGJ1aWxkZXIgY2xhc3MgcHJvZHVjZSB0aGVzZSBpbnN0cnVjdGlvbnMuXG4gKi9cbmV4cG9ydCBjbGFzcyBTdHlsaW5nQnVpbGRlciB7XG4gIC8qKiBXaGV0aGVyIG9yIG5vdCB0aGVyZSBhcmUgYW55IHN0YXRpYyBzdHlsaW5nIHZhbHVlcyBwcmVzZW50ICovXG4gIHByaXZhdGUgX2hhc0luaXRpYWxWYWx1ZXMgPSBmYWxzZTtcbiAgLyoqXG4gICAqICBXaGV0aGVyIG9yIG5vdCB0aGVyZSBhcmUgYW55IHN0eWxpbmcgYmluZGluZ3MgcHJlc2VudFxuICAgKiAgKGkuZS4gYFtzdHlsZV1gLCBgW2NsYXNzXWAsIGBbc3R5bGUucHJvcF1gIG9yIGBbY2xhc3MubmFtZV1gKVxuICAgKi9cbiAgcHVibGljIGhhc0JpbmRpbmdzID0gZmFsc2U7XG4gIHB1YmxpYyBoYXNCaW5kaW5nc1dpdGhQaXBlcyA9IGZhbHNlO1xuXG4gIC8qKiB0aGUgaW5wdXQgZm9yIFtjbGFzc10gKGlmIGl0IGV4aXN0cykgKi9cbiAgcHJpdmF0ZSBfY2xhc3NNYXBJbnB1dDogQm91bmRTdHlsaW5nRW50cnl8bnVsbCA9IG51bGw7XG4gIC8qKiB0aGUgaW5wdXQgZm9yIFtzdHlsZV0gKGlmIGl0IGV4aXN0cykgKi9cbiAgcHJpdmF0ZSBfc3R5bGVNYXBJbnB1dDogQm91bmRTdHlsaW5nRW50cnl8bnVsbCA9IG51bGw7XG4gIC8qKiBhbiBhcnJheSBvZiBlYWNoIFtzdHlsZS5wcm9wXSBpbnB1dCAqL1xuICBwcml2YXRlIF9zaW5nbGVTdHlsZUlucHV0czogQm91bmRTdHlsaW5nRW50cnlbXXxudWxsID0gbnVsbDtcbiAgLyoqIGFuIGFycmF5IG9mIGVhY2ggW2NsYXNzLm5hbWVdIGlucHV0ICovXG4gIHByaXZhdGUgX3NpbmdsZUNsYXNzSW5wdXRzOiBCb3VuZFN0eWxpbmdFbnRyeVtdfG51bGwgPSBudWxsO1xuICBwcml2YXRlIF9sYXN0U3R5bGluZ0lucHV0OiBCb3VuZFN0eWxpbmdFbnRyeXxudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfZmlyc3RTdHlsaW5nSW5wdXQ6IEJvdW5kU3R5bGluZ0VudHJ5fG51bGwgPSBudWxsO1xuXG4gIC8vIG1hcHMgYXJlIHVzZWQgaW5zdGVhZCBvZiBoYXNoIG1hcHMgYmVjYXVzZSBhIE1hcCB3aWxsXG4gIC8vIHJldGFpbiB0aGUgb3JkZXJpbmcgb2YgdGhlIGtleXNcblxuICAvKipcbiAgICogUmVwcmVzZW50cyB0aGUgbG9jYXRpb24gb2YgZWFjaCBzdHlsZSBiaW5kaW5nIGluIHRoZSB0ZW1wbGF0ZVxuICAgKiAoZS5nLiBgPGRpdiBbc3R5bGUud2lkdGhdPVwid1wiIFtzdHlsZS5oZWlnaHRdPVwiaFwiPmAgaW1wbGllc1xuICAgKiB0aGF0IGB3aWR0aD0wYCBhbmQgYGhlaWdodD0xYClcbiAgICovXG4gIHByaXZhdGUgX3N0eWxlc0luZGV4ID0gbmV3IE1hcDxzdHJpbmcsIG51bWJlcj4oKTtcblxuICAvKipcbiAgICogUmVwcmVzZW50cyB0aGUgbG9jYXRpb24gb2YgZWFjaCBjbGFzcyBiaW5kaW5nIGluIHRoZSB0ZW1wbGF0ZVxuICAgKiAoZS5nLiBgPGRpdiBbY2xhc3MuYmlnXT1cImJcIiBbY2xhc3MuaGlkZGVuXT1cImhcIj5gIGltcGxpZXNcbiAgICogdGhhdCBgYmlnPTBgIGFuZCBgaGlkZGVuPTFgKVxuICAgKi9cbiAgcHJpdmF0ZSBfY2xhc3Nlc0luZGV4ID0gbmV3IE1hcDxzdHJpbmcsIG51bWJlcj4oKTtcbiAgcHJpdmF0ZSBfaW5pdGlhbFN0eWxlVmFsdWVzOiBzdHJpbmdbXSA9IFtdO1xuICBwcml2YXRlIF9pbml0aWFsQ2xhc3NWYWx1ZXM6IHN0cmluZ1tdID0gW107XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfZGlyZWN0aXZlRXhwcjogby5FeHByZXNzaW9ufG51bGwpIHt9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhIGdpdmVuIGlucHV0IHRvIHRoZSBzdHlsaW5nIGJ1aWxkZXIgdG8gYmUgbGF0ZXIgdXNlZCB3aGVuIHByb2R1Y2luZyBBT1QgY29kZS5cbiAgICpcbiAgICogVGhlIGNvZGUgYmVsb3cgd2lsbCBvbmx5IGFjY2VwdCB0aGUgaW5wdXQgaWYgaXQgaXMgc29tZWhvdyB0aWVkIHRvIHN0eWxpbmcgKHdoZXRoZXIgaXQgYmVcbiAgICogc3R5bGUvY2xhc3MgYmluZGluZ3Mgb3Igc3RhdGljIHN0eWxlL2NsYXNzIGF0dHJpYnV0ZXMpLlxuICAgKi9cbiAgcmVnaXN0ZXJCb3VuZElucHV0KGlucHV0OiB0LkJvdW5kQXR0cmlidXRlKTogYm9vbGVhbiB7XG4gICAgLy8gW2F0dHIuc3R5bGVdIG9yIFthdHRyLmNsYXNzXSBhcmUgc2tpcHBlZCBpbiB0aGUgY29kZSBiZWxvdyxcbiAgICAvLyB0aGV5IHNob3VsZCBub3QgYmUgdHJlYXRlZCBhcyBzdHlsaW5nLWJhc2VkIGJpbmRpbmdzIHNpbmNlXG4gICAgLy8gdGhleSBhcmUgaW50ZW5kZWQgdG8gYmUgd3JpdHRlbiBkaXJlY3RseSB0byB0aGUgYXR0ciBhbmRcbiAgICAvLyB3aWxsIHRoZXJlZm9yZSBza2lwIGFsbCBzdHlsZS9jbGFzcyByZXNvbHV0aW9uIHRoYXQgaXMgcHJlc2VudFxuICAgIC8vIHdpdGggc3R5bGU9XCJcIiwgW3N0eWxlXT1cIlwiIGFuZCBbc3R5bGUucHJvcF09XCJcIiwgY2xhc3M9XCJcIixcbiAgICAvLyBbY2xhc3MucHJvcF09XCJcIi4gW2NsYXNzXT1cIlwiIGFzc2lnbm1lbnRzXG4gICAgbGV0IGJpbmRpbmc6IEJvdW5kU3R5bGluZ0VudHJ5fG51bGwgPSBudWxsO1xuICAgIGxldCBuYW1lID0gaW5wdXQubmFtZTtcbiAgICBzd2l0Y2ggKGlucHV0LnR5cGUpIHtcbiAgICAgIGNhc2UgQmluZGluZ1R5cGUuUHJvcGVydHk6XG4gICAgICAgIGJpbmRpbmcgPSB0aGlzLnJlZ2lzdGVySW5wdXRCYXNlZE9uTmFtZShuYW1lLCBpbnB1dC52YWx1ZSwgaW5wdXQuc291cmNlU3Bhbik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBCaW5kaW5nVHlwZS5TdHlsZTpcbiAgICAgICAgYmluZGluZyA9IHRoaXMucmVnaXN0ZXJTdHlsZUlucHV0KG5hbWUsIGZhbHNlLCBpbnB1dC52YWx1ZSwgaW5wdXQuc291cmNlU3BhbiwgaW5wdXQudW5pdCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBCaW5kaW5nVHlwZS5DbGFzczpcbiAgICAgICAgYmluZGluZyA9IHRoaXMucmVnaXN0ZXJDbGFzc0lucHV0KG5hbWUsIGZhbHNlLCBpbnB1dC52YWx1ZSwgaW5wdXQuc291cmNlU3Bhbik7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICByZXR1cm4gYmluZGluZyA/IHRydWUgOiBmYWxzZTtcbiAgfVxuXG4gIHJlZ2lzdGVySW5wdXRCYXNlZE9uTmFtZShuYW1lOiBzdHJpbmcsIGV4cHJlc3Npb246IEFTVCwgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKSB7XG4gICAgbGV0IGJpbmRpbmc6IEJvdW5kU3R5bGluZ0VudHJ5fG51bGwgPSBudWxsO1xuICAgIGNvbnN0IHByZWZpeCA9IG5hbWUuc3Vic3RyaW5nKDAsIDYpO1xuICAgIGNvbnN0IGlzU3R5bGUgPSBuYW1lID09PSAnc3R5bGUnIHx8IHByZWZpeCA9PT0gJ3N0eWxlLicgfHwgcHJlZml4ID09PSAnc3R5bGUhJztcbiAgICBjb25zdCBpc0NsYXNzID0gIWlzU3R5bGUgJiYgKG5hbWUgPT09ICdjbGFzcycgfHwgcHJlZml4ID09PSAnY2xhc3MuJyB8fCBwcmVmaXggPT09ICdjbGFzcyEnKTtcbiAgICBpZiAoaXNTdHlsZSB8fCBpc0NsYXNzKSB7XG4gICAgICBjb25zdCBpc01hcEJhc2VkID0gbmFtZS5jaGFyQXQoNSkgIT09ICcuJzsgICAgICAgICAvLyBzdHlsZS5wcm9wIG9yIGNsYXNzLnByb3AgbWFrZXMgdGhpcyBhIG5vXG4gICAgICBjb25zdCBwcm9wZXJ0eSA9IG5hbWUuc3Vic3RyKGlzTWFwQmFzZWQgPyA1IDogNik7ICAvLyB0aGUgZG90IGV4cGxhaW5zIHdoeSB0aGVyZSdzIGEgKzFcbiAgICAgIGlmIChpc1N0eWxlKSB7XG4gICAgICAgIGJpbmRpbmcgPSB0aGlzLnJlZ2lzdGVyU3R5bGVJbnB1dChwcm9wZXJ0eSwgaXNNYXBCYXNlZCwgZXhwcmVzc2lvbiwgc291cmNlU3Bhbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBiaW5kaW5nID0gdGhpcy5yZWdpc3RlckNsYXNzSW5wdXQocHJvcGVydHksIGlzTWFwQmFzZWQsIGV4cHJlc3Npb24sIHNvdXJjZVNwYW4pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYmluZGluZztcbiAgfVxuXG4gIHJlZ2lzdGVyU3R5bGVJbnB1dChcbiAgICAgIG5hbWU6IHN0cmluZywgaXNNYXBCYXNlZDogYm9vbGVhbiwgdmFsdWU6IEFTVCwgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgICAgc3VmZml4Pzogc3RyaW5nfG51bGwpOiBCb3VuZFN0eWxpbmdFbnRyeXxudWxsIHtcbiAgICBpZiAoaXNFbXB0eUV4cHJlc3Npb24odmFsdWUpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgLy8gQ1NTIGN1c3RvbSBwcm9wZXJ0aWVzIGFyZSBjYXNlLXNlbnNpdGl2ZSBzbyB3ZSBzaG91bGRuJ3Qgbm9ybWFsaXplIHRoZW0uXG4gICAgLy8gU2VlOiBodHRwczovL3d3dy53My5vcmcvVFIvY3NzLXZhcmlhYmxlcy0xLyNkZWZpbmluZy12YXJpYWJsZXNcbiAgICBpZiAoIWlzQ3NzQ3VzdG9tUHJvcGVydHkobmFtZSkpIHtcbiAgICAgIG5hbWUgPSBoeXBoZW5hdGUobmFtZSk7XG4gICAgfVxuICAgIGNvbnN0IHtwcm9wZXJ0eSwgaGFzT3ZlcnJpZGVGbGFnLCBzdWZmaXg6IGJpbmRpbmdTdWZmaXh9ID0gcGFyc2VQcm9wZXJ0eShuYW1lKTtcbiAgICBzdWZmaXggPSB0eXBlb2Ygc3VmZml4ID09PSAnc3RyaW5nJyAmJiBzdWZmaXgubGVuZ3RoICE9PSAwID8gc3VmZml4IDogYmluZGluZ1N1ZmZpeDtcbiAgICBjb25zdCBlbnRyeTpcbiAgICAgICAgQm91bmRTdHlsaW5nRW50cnkgPSB7bmFtZTogcHJvcGVydHksIHN1ZmZpeDogc3VmZml4LCB2YWx1ZSwgc291cmNlU3BhbiwgaGFzT3ZlcnJpZGVGbGFnfTtcbiAgICBpZiAoaXNNYXBCYXNlZCkge1xuICAgICAgdGhpcy5fc3R5bGVNYXBJbnB1dCA9IGVudHJ5O1xuICAgIH0gZWxzZSB7XG4gICAgICAodGhpcy5fc2luZ2xlU3R5bGVJbnB1dHMgPSB0aGlzLl9zaW5nbGVTdHlsZUlucHV0cyB8fCBbXSkucHVzaChlbnRyeSk7XG4gICAgICByZWdpc3RlckludG9NYXAodGhpcy5fc3R5bGVzSW5kZXgsIHByb3BlcnR5KTtcbiAgICB9XG4gICAgdGhpcy5fbGFzdFN0eWxpbmdJbnB1dCA9IGVudHJ5O1xuICAgIHRoaXMuX2ZpcnN0U3R5bGluZ0lucHV0ID0gdGhpcy5fZmlyc3RTdHlsaW5nSW5wdXQgfHwgZW50cnk7XG4gICAgdGhpcy5fY2hlY2tGb3JQaXBlcyh2YWx1ZSk7XG4gICAgdGhpcy5oYXNCaW5kaW5ncyA9IHRydWU7XG4gICAgcmV0dXJuIGVudHJ5O1xuICB9XG5cbiAgcmVnaXN0ZXJDbGFzc0lucHV0KG5hbWU6IHN0cmluZywgaXNNYXBCYXNlZDogYm9vbGVhbiwgdmFsdWU6IEFTVCwgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKTpcbiAgICAgIEJvdW5kU3R5bGluZ0VudHJ5fG51bGwge1xuICAgIGlmIChpc0VtcHR5RXhwcmVzc2lvbih2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCB7cHJvcGVydHksIGhhc092ZXJyaWRlRmxhZ30gPSBwYXJzZVByb3BlcnR5KG5hbWUpO1xuICAgIGNvbnN0IGVudHJ5OlxuICAgICAgICBCb3VuZFN0eWxpbmdFbnRyeSA9IHtuYW1lOiBwcm9wZXJ0eSwgdmFsdWUsIHNvdXJjZVNwYW4sIGhhc092ZXJyaWRlRmxhZywgc3VmZml4OiBudWxsfTtcbiAgICBpZiAoaXNNYXBCYXNlZCkge1xuICAgICAgdGhpcy5fY2xhc3NNYXBJbnB1dCA9IGVudHJ5O1xuICAgIH0gZWxzZSB7XG4gICAgICAodGhpcy5fc2luZ2xlQ2xhc3NJbnB1dHMgPSB0aGlzLl9zaW5nbGVDbGFzc0lucHV0cyB8fCBbXSkucHVzaChlbnRyeSk7XG4gICAgICByZWdpc3RlckludG9NYXAodGhpcy5fY2xhc3Nlc0luZGV4LCBwcm9wZXJ0eSk7XG4gICAgfVxuICAgIHRoaXMuX2xhc3RTdHlsaW5nSW5wdXQgPSBlbnRyeTtcbiAgICB0aGlzLl9maXJzdFN0eWxpbmdJbnB1dCA9IHRoaXMuX2ZpcnN0U3R5bGluZ0lucHV0IHx8IGVudHJ5O1xuICAgIHRoaXMuX2NoZWNrRm9yUGlwZXModmFsdWUpO1xuICAgIHRoaXMuaGFzQmluZGluZ3MgPSB0cnVlO1xuICAgIHJldHVybiBlbnRyeTtcbiAgfVxuXG4gIHByaXZhdGUgX2NoZWNrRm9yUGlwZXModmFsdWU6IEFTVCkge1xuICAgIGlmICgodmFsdWUgaW5zdGFuY2VvZiBBU1RXaXRoU291cmNlKSAmJiAodmFsdWUuYXN0IGluc3RhbmNlb2YgQmluZGluZ1BpcGUpKSB7XG4gICAgICB0aGlzLmhhc0JpbmRpbmdzV2l0aFBpcGVzID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIHRoZSBlbGVtZW50J3Mgc3RhdGljIHN0eWxlIHN0cmluZyB2YWx1ZSB0byB0aGUgYnVpbGRlci5cbiAgICpcbiAgICogQHBhcmFtIHZhbHVlIHRoZSBzdHlsZSBzdHJpbmcgKGUuZy4gYHdpZHRoOjEwMHB4OyBoZWlnaHQ6MjAwcHg7YClcbiAgICovXG4gIHJlZ2lzdGVyU3R5bGVBdHRyKHZhbHVlOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9pbml0aWFsU3R5bGVWYWx1ZXMgPSBwYXJzZVN0eWxlKHZhbHVlKTtcbiAgICB0aGlzLl9oYXNJbml0aWFsVmFsdWVzID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgdGhlIGVsZW1lbnQncyBzdGF0aWMgY2xhc3Mgc3RyaW5nIHZhbHVlIHRvIHRoZSBidWlsZGVyLlxuICAgKlxuICAgKiBAcGFyYW0gdmFsdWUgdGhlIGNsYXNzTmFtZSBzdHJpbmcgKGUuZy4gYGRpc2FibGVkIGdvbGQgem9vbWApXG4gICAqL1xuICByZWdpc3RlckNsYXNzQXR0cih2YWx1ZTogc3RyaW5nKSB7XG4gICAgdGhpcy5faW5pdGlhbENsYXNzVmFsdWVzID0gdmFsdWUudHJpbSgpLnNwbGl0KC9cXHMrL2cpO1xuICAgIHRoaXMuX2hhc0luaXRpYWxWYWx1ZXMgPSB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEFwcGVuZHMgYWxsIHN0eWxpbmctcmVsYXRlZCBleHByZXNzaW9ucyB0byB0aGUgcHJvdmlkZWQgYXR0cnMgYXJyYXkuXG4gICAqXG4gICAqIEBwYXJhbSBhdHRycyBhbiBleGlzdGluZyBhcnJheSB3aGVyZSBlYWNoIG9mIHRoZSBzdHlsaW5nIGV4cHJlc3Npb25zXG4gICAqIHdpbGwgYmUgaW5zZXJ0ZWQgaW50by5cbiAgICovXG4gIHBvcHVsYXRlSW5pdGlhbFN0eWxpbmdBdHRycyhhdHRyczogby5FeHByZXNzaW9uW10pOiB2b2lkIHtcbiAgICAvLyBbQ0xBU1NfTUFSS0VSLCAnZm9vJywgJ2JhcicsICdiYXonIC4uLl1cbiAgICBpZiAodGhpcy5faW5pdGlhbENsYXNzVmFsdWVzLmxlbmd0aCkge1xuICAgICAgYXR0cnMucHVzaChvLmxpdGVyYWwoQXR0cmlidXRlTWFya2VyLkNsYXNzZXMpKTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5faW5pdGlhbENsYXNzVmFsdWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGF0dHJzLnB1c2goby5saXRlcmFsKHRoaXMuX2luaXRpYWxDbGFzc1ZhbHVlc1tpXSkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFtTVFlMRV9NQVJLRVIsICd3aWR0aCcsICcyMDBweCcsICdoZWlnaHQnLCAnMTAwcHgnLCAuLi5dXG4gICAgaWYgKHRoaXMuX2luaXRpYWxTdHlsZVZhbHVlcy5sZW5ndGgpIHtcbiAgICAgIGF0dHJzLnB1c2goby5saXRlcmFsKEF0dHJpYnV0ZU1hcmtlci5TdHlsZXMpKTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5faW5pdGlhbFN0eWxlVmFsdWVzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgICAgIGF0dHJzLnB1c2goXG4gICAgICAgICAgICBvLmxpdGVyYWwodGhpcy5faW5pdGlhbFN0eWxlVmFsdWVzW2ldKSwgby5saXRlcmFsKHRoaXMuX2luaXRpYWxTdHlsZVZhbHVlc1tpICsgMV0pKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQnVpbGRzIGFuIGluc3RydWN0aW9uIHdpdGggYWxsIHRoZSBleHByZXNzaW9ucyBhbmQgcGFyYW1ldGVycyBmb3IgYGVsZW1lbnRIb3N0QXR0cnNgLlxuICAgKlxuICAgKiBUaGUgaW5zdHJ1Y3Rpb24gZ2VuZXJhdGlvbiBjb2RlIGJlbG93IGlzIHVzZWQgZm9yIHByb2R1Y2luZyB0aGUgQU9UIHN0YXRlbWVudCBjb2RlIHdoaWNoIGlzXG4gICAqIHJlc3BvbnNpYmxlIGZvciByZWdpc3RlcmluZyBpbml0aWFsIHN0eWxlcyAod2l0aGluIGEgZGlyZWN0aXZlIGhvc3RCaW5kaW5ncycgY3JlYXRpb24gYmxvY2spLFxuICAgKiBhcyB3ZWxsIGFzIGFueSBvZiB0aGUgcHJvdmlkZWQgYXR0cmlidXRlIHZhbHVlcywgdG8gdGhlIGRpcmVjdGl2ZSBob3N0IGVsZW1lbnQuXG4gICAqL1xuICBhc3NpZ25Ib3N0QXR0cnMoYXR0cnM6IG8uRXhwcmVzc2lvbltdLCBkZWZpbml0aW9uTWFwOiBEZWZpbml0aW9uTWFwKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2RpcmVjdGl2ZUV4cHIgJiYgKGF0dHJzLmxlbmd0aCB8fCB0aGlzLl9oYXNJbml0aWFsVmFsdWVzKSkge1xuICAgICAgdGhpcy5wb3B1bGF0ZUluaXRpYWxTdHlsaW5nQXR0cnMoYXR0cnMpO1xuICAgICAgZGVmaW5pdGlvbk1hcC5zZXQoJ2hvc3RBdHRycycsIG8ubGl0ZXJhbEFycihhdHRycykpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBCdWlsZHMgYW4gaW5zdHJ1Y3Rpb24gd2l0aCBhbGwgdGhlIGV4cHJlc3Npb25zIGFuZCBwYXJhbWV0ZXJzIGZvciBgY2xhc3NNYXBgLlxuICAgKlxuICAgKiBUaGUgaW5zdHJ1Y3Rpb24gZGF0YSB3aWxsIGNvbnRhaW4gYWxsIGV4cHJlc3Npb25zIGZvciBgY2xhc3NNYXBgIHRvIGZ1bmN0aW9uXG4gICAqIHdoaWNoIGluY2x1ZGVzIHRoZSBgW2NsYXNzXWAgZXhwcmVzc2lvbiBwYXJhbXMuXG4gICAqL1xuICBidWlsZENsYXNzTWFwSW5zdHJ1Y3Rpb24odmFsdWVDb252ZXJ0ZXI6IFZhbHVlQ29udmVydGVyKTogU3R5bGluZ0luc3RydWN0aW9ufG51bGwge1xuICAgIGlmICh0aGlzLl9jbGFzc01hcElucHV0KSB7XG4gICAgICByZXR1cm4gdGhpcy5fYnVpbGRNYXBCYXNlZEluc3RydWN0aW9uKHZhbHVlQ29udmVydGVyLCB0cnVlLCB0aGlzLl9jbGFzc01hcElucHV0KTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQnVpbGRzIGFuIGluc3RydWN0aW9uIHdpdGggYWxsIHRoZSBleHByZXNzaW9ucyBhbmQgcGFyYW1ldGVycyBmb3IgYHN0eWxlTWFwYC5cbiAgICpcbiAgICogVGhlIGluc3RydWN0aW9uIGRhdGEgd2lsbCBjb250YWluIGFsbCBleHByZXNzaW9ucyBmb3IgYHN0eWxlTWFwYCB0byBmdW5jdGlvblxuICAgKiB3aGljaCBpbmNsdWRlcyB0aGUgYFtzdHlsZV1gIGV4cHJlc3Npb24gcGFyYW1zLlxuICAgKi9cbiAgYnVpbGRTdHlsZU1hcEluc3RydWN0aW9uKHZhbHVlQ29udmVydGVyOiBWYWx1ZUNvbnZlcnRlcik6IFN0eWxpbmdJbnN0cnVjdGlvbnxudWxsIHtcbiAgICBpZiAodGhpcy5fc3R5bGVNYXBJbnB1dCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2J1aWxkTWFwQmFzZWRJbnN0cnVjdGlvbih2YWx1ZUNvbnZlcnRlciwgZmFsc2UsIHRoaXMuX3N0eWxlTWFwSW5wdXQpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgX2J1aWxkTWFwQmFzZWRJbnN0cnVjdGlvbihcbiAgICAgIHZhbHVlQ29udmVydGVyOiBWYWx1ZUNvbnZlcnRlciwgaXNDbGFzc0Jhc2VkOiBib29sZWFuLFxuICAgICAgc3R5bGluZ0lucHV0OiBCb3VuZFN0eWxpbmdFbnRyeSk6IFN0eWxpbmdJbnN0cnVjdGlvbiB7XG4gICAgLy8gZWFjaCBzdHlsaW5nIGJpbmRpbmcgdmFsdWUgaXMgc3RvcmVkIGluIHRoZSBMVmlld1xuICAgIC8vIG1hcC1iYXNlZCBiaW5kaW5ncyBhbGxvY2F0ZSB0d28gc2xvdHM6IG9uZSBmb3IgdGhlXG4gICAgLy8gcHJldmlvdXMgYmluZGluZyB2YWx1ZSBhbmQgYW5vdGhlciBmb3IgdGhlIHByZXZpb3VzXG4gICAgLy8gY2xhc3NOYW1lIG9yIHN0eWxlIGF0dHJpYnV0ZSB2YWx1ZS5cbiAgICBsZXQgdG90YWxCaW5kaW5nU2xvdHNSZXF1aXJlZCA9IE1JTl9TVFlMSU5HX0JJTkRJTkdfU0xPVFNfUkVRVUlSRUQ7XG5cbiAgICAvLyB0aGVzZSB2YWx1ZXMgbXVzdCBiZSBvdXRzaWRlIG9mIHRoZSB1cGRhdGUgYmxvY2sgc28gdGhhdCB0aGV5IGNhblxuICAgIC8vIGJlIGV2YWx1YXRlZCAodGhlIEFTVCB2aXNpdCBjYWxsKSBkdXJpbmcgY3JlYXRpb24gdGltZSBzbyB0aGF0IGFueVxuICAgIC8vIHBpcGVzIGNhbiBiZSBwaWNrZWQgdXAgaW4gdGltZSBiZWZvcmUgdGhlIHRlbXBsYXRlIGlzIGJ1aWx0XG4gICAgY29uc3QgbWFwVmFsdWUgPSBzdHlsaW5nSW5wdXQudmFsdWUudmlzaXQodmFsdWVDb252ZXJ0ZXIpO1xuICAgIGxldCByZWZlcmVuY2U6IG8uRXh0ZXJuYWxSZWZlcmVuY2U7XG4gICAgaWYgKG1hcFZhbHVlIGluc3RhbmNlb2YgSW50ZXJwb2xhdGlvbikge1xuICAgICAgdG90YWxCaW5kaW5nU2xvdHNSZXF1aXJlZCArPSBtYXBWYWx1ZS5leHByZXNzaW9ucy5sZW5ndGg7XG4gICAgICByZWZlcmVuY2UgPSBpc0NsYXNzQmFzZWQgPyBnZXRDbGFzc01hcEludGVycG9sYXRpb25FeHByZXNzaW9uKG1hcFZhbHVlKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZXRTdHlsZU1hcEludGVycG9sYXRpb25FeHByZXNzaW9uKG1hcFZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVmZXJlbmNlID0gaXNDbGFzc0Jhc2VkID8gUjMuY2xhc3NNYXAgOiBSMy5zdHlsZU1hcDtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgcmVmZXJlbmNlLFxuICAgICAgY2FsbHM6IFt7XG4gICAgICAgIHN1cHBvcnRzSW50ZXJwb2xhdGlvbjogdHJ1ZSxcbiAgICAgICAgc291cmNlU3Bhbjogc3R5bGluZ0lucHV0LnNvdXJjZVNwYW4sXG4gICAgICAgIGFsbG9jYXRlQmluZGluZ1Nsb3RzOiB0b3RhbEJpbmRpbmdTbG90c1JlcXVpcmVkLFxuICAgICAgICBwYXJhbXM6IChjb252ZXJ0Rm46ICh2YWx1ZTogYW55KSA9PiBvLkV4cHJlc3Npb258by5FeHByZXNzaW9uW10pID0+IHtcbiAgICAgICAgICBjb25zdCBjb252ZXJ0UmVzdWx0ID0gY29udmVydEZuKG1hcFZhbHVlKTtcbiAgICAgICAgICBjb25zdCBwYXJhbXMgPSBBcnJheS5pc0FycmF5KGNvbnZlcnRSZXN1bHQpID8gY29udmVydFJlc3VsdCA6IFtjb252ZXJ0UmVzdWx0XTtcbiAgICAgICAgICByZXR1cm4gcGFyYW1zO1xuICAgICAgICB9XG4gICAgICB9XVxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIF9idWlsZFNpbmdsZUlucHV0cyhcbiAgICAgIHJlZmVyZW5jZTogby5FeHRlcm5hbFJlZmVyZW5jZSwgaW5wdXRzOiBCb3VuZFN0eWxpbmdFbnRyeVtdLCB2YWx1ZUNvbnZlcnRlcjogVmFsdWVDb252ZXJ0ZXIsXG4gICAgICBnZXRJbnRlcnBvbGF0aW9uRXhwcmVzc2lvbkZuOiAoKHZhbHVlOiBJbnRlcnBvbGF0aW9uKSA9PiBvLkV4dGVybmFsUmVmZXJlbmNlKXxudWxsLFxuICAgICAgaXNDbGFzc0Jhc2VkOiBib29sZWFuKTogU3R5bGluZ0luc3RydWN0aW9uW10ge1xuICAgIGNvbnN0IGluc3RydWN0aW9uczogU3R5bGluZ0luc3RydWN0aW9uW10gPSBbXTtcblxuICAgIGlucHV0cy5mb3JFYWNoKGlucHV0ID0+IHtcbiAgICAgIGNvbnN0IHByZXZpb3VzSW5zdHJ1Y3Rpb246IFN0eWxpbmdJbnN0cnVjdGlvbnx1bmRlZmluZWQgPVxuICAgICAgICAgIGluc3RydWN0aW9uc1tpbnN0cnVjdGlvbnMubGVuZ3RoIC0gMV07XG4gICAgICBjb25zdCB2YWx1ZSA9IGlucHV0LnZhbHVlLnZpc2l0KHZhbHVlQ29udmVydGVyKTtcbiAgICAgIGxldCByZWZlcmVuY2VGb3JDYWxsID0gcmVmZXJlbmNlO1xuXG4gICAgICAvLyBlYWNoIHN0eWxpbmcgYmluZGluZyB2YWx1ZSBpcyBzdG9yZWQgaW4gdGhlIExWaWV3XG4gICAgICAvLyBidXQgdGhlcmUgYXJlIHR3byB2YWx1ZXMgc3RvcmVkIGZvciBlYWNoIGJpbmRpbmc6XG4gICAgICAvLyAgIDEpIHRoZSB2YWx1ZSBpdHNlbGZcbiAgICAgIC8vICAgMikgYW4gaW50ZXJtZWRpYXRlIHZhbHVlIChjb25jYXRlbmF0aW9uIG9mIHN0eWxlIHVwIHRvIHRoaXMgcG9pbnQpLlxuICAgICAgLy8gICAgICBXZSBuZWVkIHRvIHN0b3JlIHRoZSBpbnRlcm1lZGlhdGUgdmFsdWUgc28gdGhhdCB3ZSBkb24ndCBhbGxvY2F0ZVxuICAgICAgLy8gICAgICB0aGUgc3RyaW5ncyBvbiBlYWNoIENELlxuICAgICAgbGV0IHRvdGFsQmluZGluZ1Nsb3RzUmVxdWlyZWQgPSBNSU5fU1RZTElOR19CSU5ESU5HX1NMT1RTX1JFUVVJUkVEO1xuXG4gICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBJbnRlcnBvbGF0aW9uKSB7XG4gICAgICAgIHRvdGFsQmluZGluZ1Nsb3RzUmVxdWlyZWQgKz0gdmFsdWUuZXhwcmVzc2lvbnMubGVuZ3RoO1xuXG4gICAgICAgIGlmIChnZXRJbnRlcnBvbGF0aW9uRXhwcmVzc2lvbkZuKSB7XG4gICAgICAgICAgcmVmZXJlbmNlRm9yQ2FsbCA9IGdldEludGVycG9sYXRpb25FeHByZXNzaW9uRm4odmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGNhbGwgPSB7XG4gICAgICAgIHNvdXJjZVNwYW46IGlucHV0LnNvdXJjZVNwYW4sXG4gICAgICAgIGFsbG9jYXRlQmluZGluZ1Nsb3RzOiB0b3RhbEJpbmRpbmdTbG90c1JlcXVpcmVkLFxuICAgICAgICBzdXBwb3J0c0ludGVycG9sYXRpb246ICEhZ2V0SW50ZXJwb2xhdGlvbkV4cHJlc3Npb25GbixcbiAgICAgICAgcGFyYW1zOiAoY29udmVydEZuOiAodmFsdWU6IGFueSkgPT4gby5FeHByZXNzaW9uIHwgby5FeHByZXNzaW9uW10pID0+IHtcbiAgICAgICAgICAvLyBwYXJhbXMgPT4gc3R5bGluZ1Byb3AocHJvcE5hbWUsIHZhbHVlLCBzdWZmaXgpXG4gICAgICAgICAgY29uc3QgcGFyYW1zOiBvLkV4cHJlc3Npb25bXSA9IFtdO1xuICAgICAgICAgIHBhcmFtcy5wdXNoKG8ubGl0ZXJhbChpbnB1dC5uYW1lKSk7XG5cbiAgICAgICAgICBjb25zdCBjb252ZXJ0UmVzdWx0ID0gY29udmVydEZuKHZhbHVlKTtcbiAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShjb252ZXJ0UmVzdWx0KSkge1xuICAgICAgICAgICAgcGFyYW1zLnB1c2goLi4uY29udmVydFJlc3VsdCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBhcmFtcy5wdXNoKGNvbnZlcnRSZXN1bHQpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFtzdHlsZS5wcm9wXSBiaW5kaW5ncyBtYXkgdXNlIHN1ZmZpeCB2YWx1ZXMgKGUuZy4gcHgsIGVtLCBldGMuLi4pLCB0aGVyZWZvcmUsXG4gICAgICAgICAgLy8gaWYgdGhhdCBpcyBkZXRlY3RlZCB0aGVuIHdlIG5lZWQgdG8gcGFzcyB0aGF0IGluIGFzIGFuIG9wdGlvbmFsIHBhcmFtLlxuICAgICAgICAgIGlmICghaXNDbGFzc0Jhc2VkICYmIGlucHV0LnN1ZmZpeCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgcGFyYW1zLnB1c2goby5saXRlcmFsKGlucHV0LnN1ZmZpeCkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBwYXJhbXM7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIC8vIElmIHdlIGVuZGVkIHVwIGdlbmVyYXRpbmcgYSBjYWxsIHRvIHRoZSBzYW1lIGluc3RydWN0aW9uIGFzIHRoZSBwcmV2aW91cyBzdHlsaW5nIHByb3BlcnR5XG4gICAgICAvLyB3ZSBjYW4gY2hhaW4gdGhlIGNhbGxzIHRvZ2V0aGVyIHNhZmVseSB0byBzYXZlIHNvbWUgYnl0ZXMsIG90aGVyd2lzZSB3ZSBoYXZlIHRvIGdlbmVyYXRlXG4gICAgICAvLyBhIHNlcGFyYXRlIGluc3RydWN0aW9uIGNhbGwuIFRoaXMgaXMgcHJpbWFyaWx5IGEgY29uY2VybiB3aXRoIGludGVycG9sYXRpb24gaW5zdHJ1Y3Rpb25zXG4gICAgICAvLyB3aGVyZSB3ZSBtYXkgc3RhcnQgb2ZmIHdpdGggb25lIGByZWZlcmVuY2VgLCBidXQgZW5kIHVwIHVzaW5nIGFub3RoZXIgYmFzZWQgb24gdGhlXG4gICAgICAvLyBudW1iZXIgb2YgaW50ZXJwb2xhdGlvbnMuXG4gICAgICBpZiAocHJldmlvdXNJbnN0cnVjdGlvbiAmJiBwcmV2aW91c0luc3RydWN0aW9uLnJlZmVyZW5jZSA9PT0gcmVmZXJlbmNlRm9yQ2FsbCkge1xuICAgICAgICBwcmV2aW91c0luc3RydWN0aW9uLmNhbGxzLnB1c2goY2FsbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbnN0cnVjdGlvbnMucHVzaCh7cmVmZXJlbmNlOiByZWZlcmVuY2VGb3JDYWxsLCBjYWxsczogW2NhbGxdfSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gaW5zdHJ1Y3Rpb25zO1xuICB9XG5cbiAgcHJpdmF0ZSBfYnVpbGRDbGFzc0lucHV0cyh2YWx1ZUNvbnZlcnRlcjogVmFsdWVDb252ZXJ0ZXIpOiBTdHlsaW5nSW5zdHJ1Y3Rpb25bXSB7XG4gICAgaWYgKHRoaXMuX3NpbmdsZUNsYXNzSW5wdXRzKSB7XG4gICAgICByZXR1cm4gdGhpcy5fYnVpbGRTaW5nbGVJbnB1dHMoXG4gICAgICAgICAgUjMuY2xhc3NQcm9wLCB0aGlzLl9zaW5nbGVDbGFzc0lucHV0cywgdmFsdWVDb252ZXJ0ZXIsIG51bGwsIHRydWUpO1xuICAgIH1cbiAgICByZXR1cm4gW107XG4gIH1cblxuICBwcml2YXRlIF9idWlsZFN0eWxlSW5wdXRzKHZhbHVlQ29udmVydGVyOiBWYWx1ZUNvbnZlcnRlcik6IFN0eWxpbmdJbnN0cnVjdGlvbltdIHtcbiAgICBpZiAodGhpcy5fc2luZ2xlU3R5bGVJbnB1dHMpIHtcbiAgICAgIHJldHVybiB0aGlzLl9idWlsZFNpbmdsZUlucHV0cyhcbiAgICAgICAgICBSMy5zdHlsZVByb3AsIHRoaXMuX3NpbmdsZVN0eWxlSW5wdXRzLCB2YWx1ZUNvbnZlcnRlcixcbiAgICAgICAgICBnZXRTdHlsZVByb3BJbnRlcnBvbGF0aW9uRXhwcmVzc2lvbiwgZmFsc2UpO1xuICAgIH1cbiAgICByZXR1cm4gW107XG4gIH1cblxuICAvKipcbiAgICogQ29uc3RydWN0cyBhbGwgaW5zdHJ1Y3Rpb25zIHdoaWNoIGNvbnRhaW4gdGhlIGV4cHJlc3Npb25zIHRoYXQgd2lsbCBiZSBwbGFjZWRcbiAgICogaW50byB0aGUgdXBkYXRlIGJsb2NrIG9mIGEgdGVtcGxhdGUgZnVuY3Rpb24gb3IgYSBkaXJlY3RpdmUgaG9zdEJpbmRpbmdzIGZ1bmN0aW9uLlxuICAgKi9cbiAgYnVpbGRVcGRhdGVMZXZlbEluc3RydWN0aW9ucyh2YWx1ZUNvbnZlcnRlcjogVmFsdWVDb252ZXJ0ZXIpIHtcbiAgICBjb25zdCBpbnN0cnVjdGlvbnM6IFN0eWxpbmdJbnN0cnVjdGlvbltdID0gW107XG4gICAgaWYgKHRoaXMuaGFzQmluZGluZ3MpIHtcbiAgICAgIGNvbnN0IHN0eWxlTWFwSW5zdHJ1Y3Rpb24gPSB0aGlzLmJ1aWxkU3R5bGVNYXBJbnN0cnVjdGlvbih2YWx1ZUNvbnZlcnRlcik7XG4gICAgICBpZiAoc3R5bGVNYXBJbnN0cnVjdGlvbikge1xuICAgICAgICBpbnN0cnVjdGlvbnMucHVzaChzdHlsZU1hcEluc3RydWN0aW9uKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGNsYXNzTWFwSW5zdHJ1Y3Rpb24gPSB0aGlzLmJ1aWxkQ2xhc3NNYXBJbnN0cnVjdGlvbih2YWx1ZUNvbnZlcnRlcik7XG4gICAgICBpZiAoY2xhc3NNYXBJbnN0cnVjdGlvbikge1xuICAgICAgICBpbnN0cnVjdGlvbnMucHVzaChjbGFzc01hcEluc3RydWN0aW9uKTtcbiAgICAgIH1cbiAgICAgIGluc3RydWN0aW9ucy5wdXNoKC4uLnRoaXMuX2J1aWxkU3R5bGVJbnB1dHModmFsdWVDb252ZXJ0ZXIpKTtcbiAgICAgIGluc3RydWN0aW9ucy5wdXNoKC4uLnRoaXMuX2J1aWxkQ2xhc3NJbnB1dHModmFsdWVDb252ZXJ0ZXIpKTtcbiAgICB9XG4gICAgcmV0dXJuIGluc3RydWN0aW9ucztcbiAgfVxufVxuXG5mdW5jdGlvbiByZWdpc3RlckludG9NYXAobWFwOiBNYXA8c3RyaW5nLCBudW1iZXI+LCBrZXk6IHN0cmluZykge1xuICBpZiAoIW1hcC5oYXMoa2V5KSkge1xuICAgIG1hcC5zZXQoa2V5LCBtYXAuc2l6ZSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlUHJvcGVydHkobmFtZTogc3RyaW5nKTpcbiAgICB7cHJvcGVydHk6IHN0cmluZywgc3VmZml4OiBzdHJpbmd8bnVsbCwgaGFzT3ZlcnJpZGVGbGFnOiBib29sZWFufSB7XG4gIGxldCBoYXNPdmVycmlkZUZsYWcgPSBmYWxzZTtcbiAgY29uc3Qgb3ZlcnJpZGVJbmRleCA9IG5hbWUuaW5kZXhPZihJTVBPUlRBTlRfRkxBRyk7XG4gIGlmIChvdmVycmlkZUluZGV4ICE9PSAtMSkge1xuICAgIG5hbWUgPSBvdmVycmlkZUluZGV4ID4gMCA/IG5hbWUuc3Vic3RyaW5nKDAsIG92ZXJyaWRlSW5kZXgpIDogJyc7XG4gICAgaGFzT3ZlcnJpZGVGbGFnID0gdHJ1ZTtcbiAgfVxuXG4gIGxldCBzdWZmaXg6IHN0cmluZ3xudWxsID0gbnVsbDtcbiAgbGV0IHByb3BlcnR5ID0gbmFtZTtcbiAgY29uc3QgdW5pdEluZGV4ID0gbmFtZS5sYXN0SW5kZXhPZignLicpO1xuICBpZiAodW5pdEluZGV4ID4gMCkge1xuICAgIHN1ZmZpeCA9IG5hbWUuc3Vic3RyKHVuaXRJbmRleCArIDEpO1xuICAgIHByb3BlcnR5ID0gbmFtZS5zdWJzdHJpbmcoMCwgdW5pdEluZGV4KTtcbiAgfVxuXG4gIHJldHVybiB7cHJvcGVydHksIHN1ZmZpeCwgaGFzT3ZlcnJpZGVGbGFnfTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBpbnN0cnVjdGlvbiB0byBnZW5lcmF0ZSBmb3IgYW4gaW50ZXJwb2xhdGVkIGNsYXNzIG1hcC5cbiAqIEBwYXJhbSBpbnRlcnBvbGF0aW9uIEFuIEludGVycG9sYXRpb24gQVNUXG4gKi9cbmZ1bmN0aW9uIGdldENsYXNzTWFwSW50ZXJwb2xhdGlvbkV4cHJlc3Npb24oaW50ZXJwb2xhdGlvbjogSW50ZXJwb2xhdGlvbik6IG8uRXh0ZXJuYWxSZWZlcmVuY2Uge1xuICBzd2l0Y2ggKGdldEludGVycG9sYXRpb25BcmdzTGVuZ3RoKGludGVycG9sYXRpb24pKSB7XG4gICAgY2FzZSAxOlxuICAgICAgcmV0dXJuIFIzLmNsYXNzTWFwO1xuICAgIGNhc2UgMzpcbiAgICAgIHJldHVybiBSMy5jbGFzc01hcEludGVycG9sYXRlMTtcbiAgICBjYXNlIDU6XG4gICAgICByZXR1cm4gUjMuY2xhc3NNYXBJbnRlcnBvbGF0ZTI7XG4gICAgY2FzZSA3OlxuICAgICAgcmV0dXJuIFIzLmNsYXNzTWFwSW50ZXJwb2xhdGUzO1xuICAgIGNhc2UgOTpcbiAgICAgIHJldHVybiBSMy5jbGFzc01hcEludGVycG9sYXRlNDtcbiAgICBjYXNlIDExOlxuICAgICAgcmV0dXJuIFIzLmNsYXNzTWFwSW50ZXJwb2xhdGU1O1xuICAgIGNhc2UgMTM6XG4gICAgICByZXR1cm4gUjMuY2xhc3NNYXBJbnRlcnBvbGF0ZTY7XG4gICAgY2FzZSAxNTpcbiAgICAgIHJldHVybiBSMy5jbGFzc01hcEludGVycG9sYXRlNztcbiAgICBjYXNlIDE3OlxuICAgICAgcmV0dXJuIFIzLmNsYXNzTWFwSW50ZXJwb2xhdGU4O1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gUjMuY2xhc3NNYXBJbnRlcnBvbGF0ZVY7XG4gIH1cbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBpbnN0cnVjdGlvbiB0byBnZW5lcmF0ZSBmb3IgYW4gaW50ZXJwb2xhdGVkIHN0eWxlIG1hcC5cbiAqIEBwYXJhbSBpbnRlcnBvbGF0aW9uIEFuIEludGVycG9sYXRpb24gQVNUXG4gKi9cbmZ1bmN0aW9uIGdldFN0eWxlTWFwSW50ZXJwb2xhdGlvbkV4cHJlc3Npb24oaW50ZXJwb2xhdGlvbjogSW50ZXJwb2xhdGlvbik6IG8uRXh0ZXJuYWxSZWZlcmVuY2Uge1xuICBzd2l0Y2ggKGdldEludGVycG9sYXRpb25BcmdzTGVuZ3RoKGludGVycG9sYXRpb24pKSB7XG4gICAgY2FzZSAxOlxuICAgICAgcmV0dXJuIFIzLnN0eWxlTWFwO1xuICAgIGNhc2UgMzpcbiAgICAgIHJldHVybiBSMy5zdHlsZU1hcEludGVycG9sYXRlMTtcbiAgICBjYXNlIDU6XG4gICAgICByZXR1cm4gUjMuc3R5bGVNYXBJbnRlcnBvbGF0ZTI7XG4gICAgY2FzZSA3OlxuICAgICAgcmV0dXJuIFIzLnN0eWxlTWFwSW50ZXJwb2xhdGUzO1xuICAgIGNhc2UgOTpcbiAgICAgIHJldHVybiBSMy5zdHlsZU1hcEludGVycG9sYXRlNDtcbiAgICBjYXNlIDExOlxuICAgICAgcmV0dXJuIFIzLnN0eWxlTWFwSW50ZXJwb2xhdGU1O1xuICAgIGNhc2UgMTM6XG4gICAgICByZXR1cm4gUjMuc3R5bGVNYXBJbnRlcnBvbGF0ZTY7XG4gICAgY2FzZSAxNTpcbiAgICAgIHJldHVybiBSMy5zdHlsZU1hcEludGVycG9sYXRlNztcbiAgICBjYXNlIDE3OlxuICAgICAgcmV0dXJuIFIzLnN0eWxlTWFwSW50ZXJwb2xhdGU4O1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gUjMuc3R5bGVNYXBJbnRlcnBvbGF0ZVY7XG4gIH1cbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBpbnN0cnVjdGlvbiB0byBnZW5lcmF0ZSBmb3IgYW4gaW50ZXJwb2xhdGVkIHN0eWxlIHByb3AuXG4gKiBAcGFyYW0gaW50ZXJwb2xhdGlvbiBBbiBJbnRlcnBvbGF0aW9uIEFTVFxuICovXG5mdW5jdGlvbiBnZXRTdHlsZVByb3BJbnRlcnBvbGF0aW9uRXhwcmVzc2lvbihpbnRlcnBvbGF0aW9uOiBJbnRlcnBvbGF0aW9uKSB7XG4gIHN3aXRjaCAoZ2V0SW50ZXJwb2xhdGlvbkFyZ3NMZW5ndGgoaW50ZXJwb2xhdGlvbikpIHtcbiAgICBjYXNlIDE6XG4gICAgICByZXR1cm4gUjMuc3R5bGVQcm9wO1xuICAgIGNhc2UgMzpcbiAgICAgIHJldHVybiBSMy5zdHlsZVByb3BJbnRlcnBvbGF0ZTE7XG4gICAgY2FzZSA1OlxuICAgICAgcmV0dXJuIFIzLnN0eWxlUHJvcEludGVycG9sYXRlMjtcbiAgICBjYXNlIDc6XG4gICAgICByZXR1cm4gUjMuc3R5bGVQcm9wSW50ZXJwb2xhdGUzO1xuICAgIGNhc2UgOTpcbiAgICAgIHJldHVybiBSMy5zdHlsZVByb3BJbnRlcnBvbGF0ZTQ7XG4gICAgY2FzZSAxMTpcbiAgICAgIHJldHVybiBSMy5zdHlsZVByb3BJbnRlcnBvbGF0ZTU7XG4gICAgY2FzZSAxMzpcbiAgICAgIHJldHVybiBSMy5zdHlsZVByb3BJbnRlcnBvbGF0ZTY7XG4gICAgY2FzZSAxNTpcbiAgICAgIHJldHVybiBSMy5zdHlsZVByb3BJbnRlcnBvbGF0ZTc7XG4gICAgY2FzZSAxNzpcbiAgICAgIHJldHVybiBSMy5zdHlsZVByb3BJbnRlcnBvbGF0ZTg7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBSMy5zdHlsZVByb3BJbnRlcnBvbGF0ZVY7XG4gIH1cbn1cblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciBwcm9wZXJ0eSBuYW1lIGlzIGEgY3VzdG9tIENTUyBwcm9wZXJ0eS5cbiAqIFNlZTogaHR0cHM6Ly93d3cudzMub3JnL1RSL2Nzcy12YXJpYWJsZXMtMVxuICovXG5mdW5jdGlvbiBpc0Nzc0N1c3RvbVByb3BlcnR5KG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gbmFtZS5zdGFydHNXaXRoKCctLScpO1xufVxuIl19