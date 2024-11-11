/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { RuntimeError } from '../../errors';
import { EMPTY_ARRAY, EMPTY_OBJ } from '../../util/empty';
import { fillProperties } from '../../util/property';
import { isComponentDef } from '../interfaces/type_checks';
import { mergeHostAttrs } from '../util/attrs_utils';
import { stringifyForError } from '../util/stringify_utils';
export function getSuperType(type) {
    return Object.getPrototypeOf(type.prototype).constructor;
}
/**
 * Merges the definition from a super class to a sub class.
 * @param definition The definition that is a SubClass of another directive of component
 *
 * @codeGenApi
 */
export function ɵɵInheritDefinitionFeature(definition) {
    let superType = getSuperType(definition.type);
    let shouldInheritFields = true;
    const inheritanceChain = [definition];
    while (superType) {
        let superDef = undefined;
        if (isComponentDef(definition)) {
            // Don't use getComponentDef/getDirectiveDef. This logic relies on inheritance.
            superDef = superType.ɵcmp || superType.ɵdir;
        }
        else {
            if (superType.ɵcmp) {
                throw new RuntimeError(903 /* RuntimeErrorCode.INVALID_INHERITANCE */, ngDevMode &&
                    `Directives cannot inherit Components. Directive ${stringifyForError(definition.type)} is attempting to extend component ${stringifyForError(superType)}`);
            }
            // Don't use getComponentDef/getDirectiveDef. This logic relies on inheritance.
            superDef = superType.ɵdir;
        }
        if (superDef) {
            if (shouldInheritFields) {
                inheritanceChain.push(superDef);
                // Some fields in the definition may be empty, if there were no values to put in them that
                // would've justified object creation. Unwrap them if necessary.
                const writeableDef = definition;
                writeableDef.inputs = maybeUnwrapEmpty(definition.inputs);
                writeableDef.inputTransforms = maybeUnwrapEmpty(definition.inputTransforms);
                writeableDef.declaredInputs = maybeUnwrapEmpty(definition.declaredInputs);
                writeableDef.outputs = maybeUnwrapEmpty(definition.outputs);
                // Merge hostBindings
                const superHostBindings = superDef.hostBindings;
                superHostBindings && inheritHostBindings(definition, superHostBindings);
                // Merge queries
                const superViewQuery = superDef.viewQuery;
                const superContentQueries = superDef.contentQueries;
                superViewQuery && inheritViewQuery(definition, superViewQuery);
                superContentQueries && inheritContentQueries(definition, superContentQueries);
                // Merge inputs and outputs
                mergeInputsWithTransforms(definition, superDef);
                fillProperties(definition.outputs, superDef.outputs);
                // Merge animations metadata.
                // If `superDef` is a Component, the `data` field is present (defaults to an empty object).
                if (isComponentDef(superDef) && superDef.data.animation) {
                    // If super def is a Component, the `definition` is also a Component, since Directives can
                    // not inherit Components (we throw an error above and cannot reach this code).
                    const defData = definition.data;
                    defData.animation = (defData.animation || []).concat(superDef.data.animation);
                }
            }
            // Run parent features
            const features = superDef.features;
            if (features) {
                for (let i = 0; i < features.length; i++) {
                    const feature = features[i];
                    if (feature && feature.ngInherit) {
                        feature(definition);
                    }
                    // If `InheritDefinitionFeature` is a part of the current `superDef`, it means that this
                    // def already has all the necessary information inherited from its super class(es), so we
                    // can stop merging fields from super classes. However we need to iterate through the
                    // prototype chain to look for classes that might contain other "features" (like
                    // NgOnChanges), which we should invoke for the original `definition`. We set the
                    // `shouldInheritFields` flag to indicate that, essentially skipping fields inheritance
                    // logic and only invoking functions from the "features" list.
                    if (feature === ɵɵInheritDefinitionFeature) {
                        shouldInheritFields = false;
                    }
                }
            }
        }
        superType = Object.getPrototypeOf(superType);
    }
    mergeHostAttrsAcrossInheritance(inheritanceChain);
}
function mergeInputsWithTransforms(target, source) {
    for (const key in source.inputs) {
        if (!source.inputs.hasOwnProperty(key)) {
            continue;
        }
        if (target.inputs.hasOwnProperty(key)) {
            continue;
        }
        const value = source.inputs[key];
        if (value === undefined) {
            continue;
        }
        target.inputs[key] = value;
        target.declaredInputs[key] = source.declaredInputs[key];
        // If the input is inherited, and we have a transform for it, we also inherit it.
        // Note that transforms should not be inherited if the input has its own metadata
        // in the `source` directive itself already (i.e. the input is re-declared/overridden).
        if (source.inputTransforms !== null) {
            // Note: transforms are stored with their minified names.
            // Perf: only access the minified name when there are source transforms.
            const minifiedName = Array.isArray(value) ? value[0] : value;
            if (!source.inputTransforms.hasOwnProperty(minifiedName)) {
                continue;
            }
            target.inputTransforms ??= {};
            target.inputTransforms[minifiedName] = source.inputTransforms[minifiedName];
        }
    }
}
/**
 * Merge the `hostAttrs` and `hostVars` from the inherited parent to the base class.
 *
 * @param inheritanceChain A list of `WritableDefs` starting at the top most type and listing
 * sub-types in order. For each type take the `hostAttrs` and `hostVars` and merge it with the child
 * type.
 */
function mergeHostAttrsAcrossInheritance(inheritanceChain) {
    let hostVars = 0;
    let hostAttrs = null;
    // We process the inheritance order from the base to the leaves here.
    for (let i = inheritanceChain.length - 1; i >= 0; i--) {
        const def = inheritanceChain[i];
        // For each `hostVars`, we need to add the superclass amount.
        def.hostVars = hostVars += def.hostVars;
        // for each `hostAttrs` we need to merge it with superclass.
        def.hostAttrs = mergeHostAttrs(def.hostAttrs, (hostAttrs = mergeHostAttrs(hostAttrs, def.hostAttrs)));
    }
}
function maybeUnwrapEmpty(value) {
    if (value === EMPTY_OBJ) {
        return {};
    }
    else if (value === EMPTY_ARRAY) {
        return [];
    }
    else {
        return value;
    }
}
function inheritViewQuery(definition, superViewQuery) {
    const prevViewQuery = definition.viewQuery;
    if (prevViewQuery) {
        definition.viewQuery = (rf, ctx) => {
            superViewQuery(rf, ctx);
            prevViewQuery(rf, ctx);
        };
    }
    else {
        definition.viewQuery = superViewQuery;
    }
}
function inheritContentQueries(definition, superContentQueries) {
    const prevContentQueries = definition.contentQueries;
    if (prevContentQueries) {
        definition.contentQueries = (rf, ctx, directiveIndex) => {
            superContentQueries(rf, ctx, directiveIndex);
            prevContentQueries(rf, ctx, directiveIndex);
        };
    }
    else {
        definition.contentQueries = superContentQueries;
    }
}
function inheritHostBindings(definition, superHostBindings) {
    const prevHostBindings = definition.hostBindings;
    if (prevHostBindings) {
        definition.hostBindings = (rf, ctx) => {
            superHostBindings(rf, ctx);
            prevHostBindings(rf, ctx);
        };
    }
    else {
        definition.hostBindings = superHostBindings;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5oZXJpdF9kZWZpbml0aW9uX2ZlYXR1cmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL2ZlYXR1cmVzL2luaGVyaXRfZGVmaW5pdGlvbl9mZWF0dXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxZQUFZLEVBQW1CLE1BQU0sY0FBYyxDQUFDO0FBRTVELE9BQU8sRUFBQyxXQUFXLEVBQUUsU0FBUyxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDeEQsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBV25ELE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUN6RCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDbkQsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0seUJBQXlCLENBQUM7QUFFMUQsTUFBTSxVQUFVLFlBQVksQ0FDMUIsSUFBZTtJQUVmLE9BQU8sTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsV0FBVyxDQUFDO0FBQzNELENBQUM7QUFJRDs7Ozs7R0FLRztBQUNILE1BQU0sVUFBVSwwQkFBMEIsQ0FDeEMsVUFBaUQ7SUFFakQsSUFBSSxTQUFTLEdBQUcsWUFBWSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM5QyxJQUFJLG1CQUFtQixHQUFHLElBQUksQ0FBQztJQUMvQixNQUFNLGdCQUFnQixHQUFrQixDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBRXJELE9BQU8sU0FBUyxFQUFFLENBQUM7UUFDakIsSUFBSSxRQUFRLEdBQXNELFNBQVMsQ0FBQztRQUM1RSxJQUFJLGNBQWMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO1lBQy9CLCtFQUErRTtZQUMvRSxRQUFRLEdBQUcsU0FBUyxD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QUcsVUFBVSxDQUFDLFlBQVksQ0FBQztJQUNqRCxJQUFJLGdCQUFnQixFQUFFLENBQUM7UUFDckIsVUFBVSxDQUFDLFlBQVksR0FBRyxDQUFDLEVBQWUsRUFBRSxHQUFRLEVBQUUsRUFBRTtZQUN0RCxpQkFBaUIsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDM0IsZ0JBQWdCLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzVCLENBQUMsQ0FBQztJQUNKLENBQUM7U0FBTSxDQUFDO1FBQ04sVUFBVSxDQUFDLFlBQVksR0FBRyxpQkFBaUIsQ0FBQztJQUM5QyxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtSdW50aW1lRXJyb3IsIFJ1bnRpbWVFcnJvckNvZGV9IGZyb20gJy4uLy4uL2Vycm9ycyc7XG5pbXBvcnQge1R5cGUsIFdyaXRhYmxlfSBmcm9tICcuLi8uLi9pbnRlcmZhY2UvdHlwZSc7XG5pbXBvcnQge0VNUFRZX0FSUkFZLCBFTVBUWV9PQkp9IGZyb20gJy4uLy4uL3V0aWwvZW1wdHknO1xuaW1wb3J0IHtmaWxsUHJvcGVydGllc30gZnJvbSAnLi4vLi4vdXRpbC9wcm9wZXJ0eSc7XG5pbXBvcnQge1xuICBDb21wb25lbnREZWYsXG4gIENvbnRlbnRRdWVyaWVzRnVuY3Rpb24sXG4gIERpcmVjdGl2ZURlZixcbiAgRGlyZWN0aXZlRGVmRmVhdHVyZSxcbiAgSG9zdEJpbmRpbmdzRnVuY3Rpb24sXG4gIFJlbmRlckZsYWdzLFxuICBWaWV3UXVlcmllc0Z1bmN0aW9uLFxufSBmcm9tICcuLi9pbnRlcmZhY2VzL2RlZmluaXRpb24nO1xuaW1wb3J0IHtUQXR0cmlidXRlc30gZnJvbSAnLi4vaW50ZXJmYWNlcy9ub2RlJztcbmltcG9ydCB7aXNDb21wb25lbnREZWZ9IGZyb20gJy4uL2ludGVyZmFjZXMvdHlwZV9jaGVja3MnO1xuaW1wb3J0IHttZXJnZUhvc3RBdHRyc30gZnJvbSAnLi4vdXRpbC9hdHRyc191dGlscyc7XG5pbXBvcnQge3N0cmluZ2lmeUZvckVycm9yfSBmcm9tICcuLi91dGlsL3N0cmluZ2lmeV91dGlscyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTdXBlclR5cGUoXG4gIHR5cGU6IFR5cGU8YW55Pixcbik6IFR5cGU8YW55PiAmIHvJtWNtcD86IENvbXBvbmVudERlZjxhbnk+OyDJtWRpcj86IERpcmVjdGl2ZURlZjxhbnk+fSB7XG4gIHJldHVybiBPYmplY3QuZ2V0UHJvdG90eXBlT2YodHlwZS5wcm90b3R5cGUpLmNvbnN0cnVjdG9yO1xufVxuXG50eXBlIFdyaXRhYmxlRGVmID0gV3JpdGFibGU8RGlyZWN0aXZlRGVmPGFueT4gfCBDb21wb25lbnREZWY8YW55Pj47XG5cbi8qKlxuICogTWVyZ2VzIHRoZSBkZWZpbml0aW9uIGZyb20gYSBzdXBlciBjbGFzcyB0byBhIHN1YiBjbGFzcy5cbiAqIEBwYXJhbSBkZWZpbml0aW9uIFRoZSBkZWZpbml0aW9uIHRoYXQgaXMgYSBTdWJDbGFzcyBvZiBhbm90aGVyIGRpcmVjdGl2ZSBvZiBjb21wb25lbnRcbiAqXG4gKiBAY29kZUdlbkFwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gybXJtUluaGVyaXREZWZpbml0aW9uRmVhdHVyZShcbiAgZGVmaW5pdGlvbjogRGlyZWN0aXZlRGVmPGFueT4gfCBDb21wb25lbnREZWY8YW55Pixcbik6IHZvaWQge1xuICBsZXQgc3VwZXJUeXBlID0gZ2V0U3VwZXJUeXBlKGRlZmluaXRpb24udHlwZSk7XG4gIGxldCBzaG91bGRJbmhlcml0RmllbGRzID0gdHJ1ZTtcbiAgY29uc3QgaW5oZXJpdGFuY2VDaGFpbjogV3JpdGFibGVEZWZbXSA9IFtkZWZpbml0aW9uXTtcblxuICB3aGlsZSAoc3VwZXJUeXBlKSB7XG4gICAgbGV0IHN1cGVyRGVmOiBEaXJlY3RpdmVEZWY8YW55PiB8IENvbXBvbmVudERlZjxhbnk+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIGlmIChpc0NvbXBvbmVudERlZihkZWZpbml0aW9uKSkge1xuICAgICAgLy8gRG9uJ3QgdXNlIGdldENvbXBvbmVudERlZi9nZXREaXJlY3RpdmVEZWYuIFRoaXMgbG9naWMgcmVsaWVzIG9uIGluaGVyaXRhbmNlLlxuICAgICAgc3VwZXJEZWYgPSBzdXBlclR5cGUuybVjbXAgfHwgc3VwZXJUeXBlLsm1ZGlyO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoc3VwZXJUeXBlLsm1Y21wKSB7XG4gICAgICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOSEVSSVRBTkNFLFxuICAgICAgICAgIG5nRGV2TW9kZSAmJlxuICAgICAgICAgICAgYERpcmVjdGl2ZXMgY2Fubm90IGluaGVyaXQgQ29tcG9uZW50cy4gRGlyZWN0aXZlICR7c3RyaW5naWZ5Rm9yRXJyb3IoXG4gICAgICAgICAgICAgIGRlZmluaXRpb24udHlwZSxcbiAgICAgICAgICAgICl9IGlzIGF0dGVtcHRpbmcgdG8gZXh0ZW5kIGNvbXBvbmVudCAke3N0cmluZ2lmeUZvckVycm9yKHN1cGVyVHlwZSl9YCxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIC8vIERvbid0IHVzZSBnZXRDb21wb25lbnREZWYvZ2V0RGlyZWN0aXZlRGVmLiBUaGlzIGxvZ2ljIHJlbGllcyBvbiBpbmhlcml0YW5jZS5cbiAgICAgIHN1cGVyRGVmID0gc3VwZXJUeXBlLsm1ZGlyO1xuICAgIH1cblxuICAgIGlmIChzdXBlckRlZikge1xuICAgICAgaWYgKHNob3VsZEluaGVyaXRGaWVsZHMpIHtcbiAgICAgICAgaW5oZXJpdGFuY2VDaGFpbi5wdXNoKHN1cGVyRGVmKTtcbiAgICAgICAgLy8gU29tZSBmaWVsZHMgaW4gdGhlIGRlZmluaXRpb24gbWF5IGJlIGVtcHR5LCBpZiB0aGVyZSB3ZXJlIG5vIHZhbHVlcyB0byBwdXQgaW4gdGhlbSB0aGF0XG4gICAgICAgIC8vIHdvdWxkJ3ZlIGp1c3RpZmllZCBvYmplY3QgY3JlYXRpb24uIFVud3JhcCB0aGVtIGlmIG5lY2Vzc2FyeS5cbiAgICAgICAgY29uc3Qgd3JpdGVhYmxlRGVmID0gZGVmaW5pdGlvbiBhcyBXcml0YWJsZURlZjtcbiAgICAgICAgd3JpdGVhYmxlRGVmLmlucHV0cyA9IG1heWJlVW53cmFwRW1wdHkoZGVmaW5pdGlvbi5pbnB1dHMpO1xuICAgICAgICB3cml0ZWFibGVEZWYuaW5wdXRUcmFuc2Zvcm1zID0gbWF5YmVVbndyYXBFbXB0eShkZWZpbml0aW9uLmlucHV0VHJhbnNmb3Jtcyk7XG4gICAgICAgIHdyaXRlYWJsZURlZi5kZWNsYXJlZElucHV0cyA9IG1heWJlVW53cmFwRW1wdHkoZGVmaW5pdGlvbi5kZWNsYXJlZElucHV0cyk7XG4gICAgICAgIHdyaXRlYWJsZURlZi5vdXRwdXRzID0gbWF5YmVVbndyYXBFbXB0eShkZWZpbml0aW9uLm91dHB1dHMpO1xuXG4gICAgICAgIC8vIE1lcmdlIGhvc3RCaW5kaW5nc1xuICAgICAgICBjb25zdCBzdXBlckhvc3RCaW5kaW5ncyA9IHN1cGVyRGVmLmhvc3RCaW5kaW5ncztcbiAgICAgICAgc3VwZXJIb3N0QmluZGluZ3MgJiYgaW5oZXJpdEhvc3RCaW5kaW5ncyhkZWZpbml0aW9uLCBzdXBlckhvc3RCaW5kaW5ncyk7XG5cbiAgICAgICAgLy8gTWVyZ2UgcXVlcmllc1xuICAgICAgICBjb25zdCBzdXBlclZpZXdRdWVyeSA9IHN1cGVyRGVmLnZpZXdRdWVyeTtcbiAgICAgICAgY29uc3Qgc3VwZXJDb250ZW50UXVlcmllcyA9IHN1cGVyRGVmLmNvbnRlbnRRdWVyaWVzO1xuICAgICAgICBzdXBlclZpZXdRdWVyeSAmJiBpbmhlcml0Vmlld1F1ZXJ5KGRlZmluaXRpb24sIHN1cGVyVmlld1F1ZXJ5KTtcbiAgICAgICAgc3VwZXJDb250ZW50UXVlcmllcyAmJiBpbmhlcml0Q29udGVudFF1ZXJpZXMoZGVmaW5pdGlvbiwgc3VwZXJDb250ZW50UXVlcmllcyk7XG5cbiAgICAgICAgLy8gTWVyZ2UgaW5wdXRzIGFuZCBvdXRwdXRzXG4gICAgICAgIG1lcmdlSW5wdXRzV2l0aFRyYW5zZm9ybXMoZGVmaW5pdGlvbiwgc3VwZXJEZWYpO1xuICAgICAgICBmaWxsUHJvcGVydGllcyhkZWZpbml0aW9uLm91dHB1dHMsIHN1cGVyRGVmLm91dHB1dHMpO1xuXG4gICAgICAgIC8vIE1lcmdlIGFuaW1hdGlvbnMgbWV0YWRhdGEuXG4gICAgICAgIC8vIElmIGBzdXBlckRlZmAgaXMgYSBDb21wb25lbnQsIHRoZSBgZGF0YWAgZmllbGQgaXMgcHJlc2VudCAoZGVmYXVsdHMgdG8gYW4gZW1wdHkgb2JqZWN0KS5cbiAgICAgICAgaWYgKGlzQ29tcG9uZW50RGVmKHN1cGVyRGVmKSAmJiBzdXBlckRlZi5kYXRhLmFuaW1hdGlvbikge1xuICAgICAgICAgIC8vIElmIHN1cGVyIGRlZiBpcyBhIENvbXBvbmVudCwgdGhlIGBkZWZpbml0aW9uYCBpcyBhbHNvIGEgQ29tcG9uZW50LCBzaW5jZSBEaXJlY3RpdmVzIGNhblxuICAgICAgICAgIC8vIG5vdCBpbmhlcml0IENvbXBvbmVudHMgKHdlIHRocm93IGFuIGVycm9yIGFib3ZlIGFuZCBjYW5ub3QgcmVhY2ggdGhpcyBjb2RlKS5cbiAgICAgICAgICBjb25zdCBkZWZEYXRhID0gKGRlZmluaXRpb24gYXMgQ29tcG9uZW50RGVmPGFueT4pLmRhdGE7XG4gICAgICAgICAgZGVmRGF0YS5hbmltYXRpb24gPSAoZGVmRGF0YS5hbmltYXRpb24gfHwgW10pLmNvbmNhdChzdXBlckRlZi5kYXRhLmFuaW1hdGlvbik7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gUnVuIHBhcmVudCBmZWF0dXJlc1xuICAgICAgY29uc3QgZmVhdHVyZXMgPSBzdXBlckRlZi5mZWF0dXJlcztcbiAgICAgIGlmIChmZWF0dXJlcykge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZlYXR1cmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgY29uc3QgZmVhdHVyZSA9IGZlYXR1cmVzW2ldO1xuICAgICAgICAgIGlmIChmZWF0dXJlICYmIGZlYXR1cmUubmdJbmhlcml0KSB7XG4gICAgICAgICAgICAoZmVhdHVyZSBhcyBEaXJlY3RpdmVEZWZGZWF0dXJlKShkZWZpbml0aW9uKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gSWYgYEluaGVyaXREZWZpbml0aW9uRmVhdHVyZWAgaXMgYSBwYXJ0IG9mIHRoZSBjdXJyZW50IGBzdXBlckRlZmAsIGl0IG1lYW5zIHRoYXQgdGhpc1xuICAgICAgICAgIC8vIGRlZiBhbHJlYWR5IGhhcyBhbGwgdGhlIG5lY2Vzc2FyeSBpbmZvcm1hdGlvbiBpbmhlcml0ZWQgZnJvbSBpdHMgc3VwZXIgY2xhc3MoZXMpLCBzbyB3ZVxuICAgICAgICAgIC8vIGNhbiBzdG9wIG1lcmdpbmcgZmllbGRzIGZyb20gc3VwZXIgY2xhc3Nlcy4gSG93ZXZlciB3ZSBuZWVkIHRvIGl0ZXJhdGUgdGhyb3VnaCB0aGVcbiAgICAgICAgICAvLyBwcm90b3R5cGUgY2hhaW4gdG8gbG9vayBmb3IgY2xhc3NlcyB0aGF0IG1pZ2h0IGNvbnRhaW4gb3RoZXIgXCJmZWF0dXJlc1wiIChsaWtlXG4gICAgICAgICAgLy8gTmdPbkNoYW5nZXMpLCB3aGljaCB3ZSBzaG91bGQgaW52b2tlIGZvciB0aGUgb3JpZ2luYWwgYGRlZmluaXRpb25gLiBXZSBzZXQgdGhlXG4gICAgICAgICAgLy8gYHNob3VsZEluaGVyaXRGaWVsZHNgIGZsYWcgdG8gaW5kaWNhdGUgdGhhdCwgZXNzZW50aWFsbHkgc2tpcHBpbmcgZmllbGRzIGluaGVyaXRhbmNlXG4gICAgICAgICAgLy8gbG9naWMgYW5kIG9ubHkgaW52b2tpbmcgZnVuY3Rpb25zIGZyb20gdGhlIFwiZmVhdHVyZXNcIiBsaXN0LlxuICAgICAgICAgIGlmIChmZWF0dXJlID09PSDJtcm1SW5oZXJpdERlZmluaXRpb25GZWF0dXJlKSB7XG4gICAgICAgICAgICBzaG91bGRJbmhlcml0RmllbGRzID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgc3VwZXJUeXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHN1cGVyVHlwZSk7XG4gIH1cbiAgbWVyZ2VIb3N0QXR0cnNBY3Jvc3NJbmhlcml0YW5jZShpbmhlcml0YW5jZUNoYWluKTtcbn1cblxuZnVuY3Rpb24gbWVyZ2VJbnB1dHNXaXRoVHJhbnNmb3JtczxUPih0YXJnZXQ6IFdyaXRhYmxlRGVmLCBzb3VyY2U6IERpcmVjdGl2ZURlZjxhbnk+KSB7XG4gIGZvciAoY29uc3Qga2V5IGluIHNvdXJjZS5pbnB1dHMpIHtcbiAgICBpZiAoIXNvdXJjZS5pbnB1dHMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGlmICh0YXJnZXQuaW5wdXRzLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBjb25zdCB2YWx1ZSA9IHNvdXJjZS5pbnB1dHNba2V5XTtcbiAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgdGFyZ2V0LmlucHV0c1trZXldID0gdmFsdWU7XG4gICAgdGFyZ2V0LmRlY2xhcmVkSW5wdXRzW2tleV0gPSBzb3VyY2UuZGVjbGFyZWRJbnB1dHNba2V5XTtcblxuICAgIC8vIElmIHRoZSBpbnB1dCBpcyBpbmhlcml0ZWQsIGFuZCB3ZSBoYXZlIGEgdHJhbnNmb3JtIGZvciBpdCwgd2UgYWxzbyBpbmhlcml0IGl0LlxuICAgIC8vIE5vdGUgdGhhdCB0cmFuc2Zvcm1zIHNob3VsZCBub3QgYmUgaW5oZXJpdGVkIGlmIHRoZSBpbnB1dCBoYXMgaXRzIG93biBtZXRhZGF0YVxuICAgIC8vIGluIHRoZSBgc291cmNlYCBkaXJlY3RpdmUgaXRzZWxmIGFscmVhZHkgKGkuZS4gdGhlIGlucHV0IGlzIHJlLWRlY2xhcmVkL292ZXJyaWRkZW4pLlxuICAgIGlmIChzb3VyY2UuaW5wdXRUcmFuc2Zvcm1zICE9PSBudWxsKSB7XG4gICAgICAvLyBOb3RlOiB0cmFuc2Zvcm1zIGFyZSBzdG9yZWQgd2l0aCB0aGVpciBtaW5pZmllZCBuYW1lcy5cbiAgICAgIC8vIFBlcmY6IG9ubHkgYWNjZXNzIHRoZSBtaW5pZmllZCBuYW1lIHdoZW4gdGhlcmUgYXJlIHNvdXJjZSB0cmFuc2Zvcm1zLlxuICAgICAgY29uc3QgbWluaWZpZWROYW1lID0gQXJyYXkuaXNBcnJheSh2YWx1ZSkgPyB2YWx1ZVswXSA6IHZhbHVlO1xuICAgICAgaWYgKCFzb3VyY2UuaW5wdXRUcmFuc2Zvcm1zLmhhc093blByb3BlcnR5KG1pbmlmaWVkTmFtZSkpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICB0YXJnZXQuaW5wdXRUcmFuc2Zvcm1zID8/PSB7fTtcbiAgICAgIHRhcmdldC5pbnB1dFRyYW5zZm9ybXNbbWluaWZpZWROYW1lXSA9IHNvdXJjZS5pbnB1dFRyYW5zZm9ybXNbbWluaWZpZWROYW1lXTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBNZXJnZSB0aGUgYGhvc3RBdHRyc2AgYW5kIGBob3N0VmFyc2AgZnJvbSB0aGUgaW5oZXJpdGVkIHBhcmVudCB0byB0aGUgYmFzZSBjbGFzcy5cbiAqXG4gKiBAcGFyYW0gaW5oZXJpdGFuY2VDaGFpbiBBIGxpc3Qgb2YgYFdyaXRhYmxlRGVmc2Agc3RhcnRpbmcgYXQgdGhlIHRvcCBtb3N0IHR5cGUgYW5kIGxpc3RpbmdcbiAqIHN1Yi10eXBlcyBpbiBvcmRlci4gRm9yIGVhY2ggdHlwZSB0YWtlIHRoZSBgaG9zdEF0dHJzYCBhbmQgYGhvc3RWYXJzYCBhbmQgbWVyZ2UgaXQgd2l0aCB0aGUgY2hpbGRcbiAqIHR5cGUuXG4gKi9cbmZ1bmN0aW9uIG1lcmdlSG9zdEF0dHJzQWNyb3NzSW5oZXJpdGFuY2UoaW5oZXJpdGFuY2VDaGFpbjogV3JpdGFibGVEZWZbXSkge1xuICBsZXQgaG9zdFZhcnM6IG51bWJlciA9IDA7XG4gIGxldCBob3N0QXR0cnM6IFRBdHRyaWJ1dGVzIHwgbnVsbCA9IG51bGw7XG4gIC8vIFdlIHByb2Nlc3MgdGhlIGluaGVyaXRhbmNlIG9yZGVyIGZyb20gdGhlIGJhc2UgdG8gdGhlIGxlYXZlcyBoZXJlLlxuICBmb3IgKGxldCBpID0gaW5oZXJpdGFuY2VDaGFpbi5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGNvbnN0IGRlZiA9IGluaGVyaXRhbmNlQ2hhaW5baV07XG4gICAgLy8gRm9yIGVhY2ggYGhvc3RWYXJzYCwgd2UgbmVlZCB0byBhZGQgdGhlIHN1cGVyY2xhc3MgYW1vdW50LlxuICAgIGRlZi5ob3N0VmFycyA9IGhvc3RWYXJzICs9IGRlZi5ob3N0VmFycztcbiAgICAvLyBmb3IgZWFjaCBgaG9zdEF0dHJzYCB3ZSBuZWVkIHRvIG1lcmdlIGl0IHdpdGggc3VwZXJjbGFzcy5cbiAgICBkZWYuaG9zdEF0dHJzID0gbWVyZ2VIb3N0QXR0cnMoXG4gICAgICBkZWYuaG9zdEF0dHJzLFxuICAgICAgKGhvc3RBdHRycyA9IG1lcmdlSG9zdEF0dHJzKGhvc3RBdHRycywgZGVmLmhvc3RBdHRycykpLFxuICAgICk7XG4gIH1cbn1cblxuZnVuY3Rpb24gbWF5YmVVbndyYXBFbXB0eTxUPih2YWx1ZTogVFtdKTogVFtdO1xuZnVuY3Rpb24gbWF5YmVVbndyYXBFbXB0eTxUPih2YWx1ZTogVCk6IFQ7XG5mdW5jdGlvbiBtYXliZVVud3JhcEVtcHR5KHZhbHVlOiBhbnkpOiBhbnkge1xuICBpZiAodmFsdWUgPT09IEVNUFRZX09CSikge1xuICAgIHJldHVybiB7fTtcbiAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gRU1QVFlfQVJSQVkpIHtcbiAgICByZXR1cm4gW107XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGluaGVyaXRWaWV3UXVlcnkoZGVmaW5pdGlvbjogV3JpdGFibGVEZWYsIHN1cGVyVmlld1F1ZXJ5OiBWaWV3UXVlcmllc0Z1bmN0aW9uPGFueT4pIHtcbiAgY29uc3QgcHJldlZpZXdRdWVyeSA9IGRlZmluaXRpb24udmlld1F1ZXJ5O1xuICBpZiAocHJldlZpZXdRdWVyeSkge1xuICAgIGRlZmluaXRpb24udmlld1F1ZXJ5ID0gKHJmLCBjdHgpID0+IHtcbiAgICAgIHN1cGVyVmlld1F1ZXJ5KHJmLCBjdHgpO1xuICAgICAgcHJldlZpZXdRdWVyeShyZiwgY3R4KTtcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIGRlZmluaXRpb24udmlld1F1ZXJ5ID0gc3VwZXJWaWV3UXVlcnk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaW5oZXJpdENvbnRlbnRRdWVyaWVzKFxuICBkZWZpbml0aW9uOiBXcml0YWJsZURlZixcbiAgc3VwZXJDb250ZW50UXVlcmllczogQ29udGVudFF1ZXJpZXNGdW5jdGlvbjxhbnk+LFxuKSB7XG4gIGNvbnN0IHByZXZDb250ZW50UXVlcmllcyA9IGRlZmluaXRpb24uY29udGVudFF1ZXJpZXM7XG4gIGlmIChwcmV2Q29udGVudFF1ZXJpZXMpIHtcbiAgICBkZWZpbml0aW9uLmNvbnRlbnRRdWVyaWVzID0gKHJmLCBjdHgsIGRpcmVjdGl2ZUluZGV4KSA9PiB7XG4gICAgICBzdXBlckNvbnRlbnRRdWVyaWVzKHJmLCBjdHgsIGRpcmVjdGl2ZUluZGV4KTtcbiAgICAgIHByZXZDb250ZW50UXVlcmllcyhyZiwgY3R4LCBkaXJlY3RpdmVJbmRleCk7XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICBkZWZpbml0aW9uLmNvbnRlbnRRdWVyaWVzID0gc3VwZXJDb250ZW50UXVlcmllcztcbiAgfVxufVxuXG5mdW5jdGlvbiBpbmhlcml0SG9zdEJpbmRpbmdzKFxuICBkZWZpbml0aW9uOiBXcml0YWJsZURlZixcbiAgc3VwZXJIb3N0QmluZGluZ3M6IEhvc3RCaW5kaW5nc0Z1bmN0aW9uPGFueT4sXG4pIHtcbiAgY29uc3QgcHJldkhvc3RCaW5kaW5ncyA9IGRlZmluaXRpb24uaG9zdEJpbmRpbmdzO1xuICBpZiAocHJldkhvc3RCaW5kaW5ncykge1xuICAgIGRlZmluaXRpb24uaG9zdEJpbmRpbmdzID0gKHJmOiBSZW5kZXJGbGFncywgY3R4OiBhbnkpID0+IHtcbiAgICAgIHN1cGVySG9zdEJpbmRpbmdzKHJmLCBjdHgpO1xuICAgICAgcHJldkhvc3RCaW5kaW5ncyhyZiwgY3R4KTtcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIGRlZmluaXRpb24uaG9zdEJpbmRpbmdzID0gc3VwZXJIb3N0QmluZGluZ3M7XG4gIH1cbn1cbiJdfQ==