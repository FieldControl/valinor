/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { isType, Type } from '../interface/type';
import { newArray } from '../util/array_utils';
import { ANNOTATIONS, PARAMETERS, PROP_METADATA } from '../util/decorators';
import { global } from '../util/global';
/*
 * #########################
 * Attention: These Regular expressions have to hold even if the code is minified!
 * ##########################
 */
/**
 * Regular expression that detects pass-through constructors for ES5 output. This Regex
 * intends to capture the common delegation pattern emitted by TypeScript and Babel. Also
 * it intends to capture the pattern where existing constructors have been downleveled from
 * ES2015 to ES5 using TypeScript w/ downlevel iteration. e.g.
 *
 * ```
 *   function MyClass() {
 *     var _this = _super.apply(this, arguments) || this;
 * ```
 *
 * downleveled to ES5 with `downlevelIteration` for TypeScript < 4.2:
 * ```
 *   function MyClass() {
 *     var _this = _super.apply(this, __spread(arguments)) || this;
 * ```
 *
 * or downleveled to ES5 with `downlevelIteration` for TypeScript >= 4.2:
 * ```
 *   function MyClass() {
 *     var _this = _super.apply(this, __spreadArray([], __read(arguments), false)) || this;
 * ```
 *
 * More details can be found in: https://github.com/angular/angular/issues/38453.
 */
export const ES5_DELEGATE_CTOR = /^function\s+\S+\(\)\s*{[\s\S]+\.apply\(this,\s*(arguments|(?:[^()]+\(\[\],)?[^()]+\(arguments\).*)\)/;
/** Regular expression that detects ES2015 classes which extend from other classes. */
export const ES2015_INHERITED_CLASS = /^class\s+[A-Za-z\d$_]*\s*extends\s+[^{]+{/;
/**
 * Regular expression that detects ES2015 classes which extend from other classes and
 * have an explicit constructor defined.
 */
export const ES2015_INHERITED_CLASS_WITH_CTOR = /^class\s+[A-Za-z\d$_]*\s*extends\s+[^{]+{[\s\S]*constructor\s*\(/;
/**
 * Regular expression that detects ES2015 classes which extend from other classes
 * and inherit a constructor.
 */
export const ES2015_INHERITED_CLASS_WITH_DELEGATE_CTOR = /^class\s+[A-Za-z\d$_]*\s*extends\s+[^{]+{[\s\S]*constructor\s*\(\)\s*{[^}]*super\(\.\.\.arguments\)/;
/**
 * Determine whether a stringified type is a class which delegates its constructor
 * to its parent.
 *
 * This is not trivial since compiled code can actually contain a constructor function
 * even if the original source code did not. For instance, when the child class contains
 * an initialized instance property.
 */
export function isDelegateCtor(typeStr) {
    return (ES5_DELEGATE_CTOR.test(typeStr) ||
        ES2015_INHERITED_CLASS_WITH_DELEGATE_CTOR.test(typeStr) ||
        (ES2015_INHERITED_CLASS.test(typeStr) && !ES2015_INHERITED_CLASS_WITH_CTOR.test(typeStr)));
}
export class ReflectionCapabilities {
    constructor(reflect) {
        this._reflect = reflect || global['Reflect'];
    }
    factory(t) {
        return (...args) => new t(...args);
    }
    /** @internal */
    _zipTypesAndAnnotations(paramTypes, paramAnnotations) {
        let result;
        if (typeof paramTypes === 'undefined') {
            result = newArray(paramAnnotations.length);
        }
        else {
            result = newArray(paramTypes.length);
        }
        for (let i = 0; i < result.length; i++) {
            // TS outputs Object for parameters without types, while Traceur omits
            // the annotations. For now we preserve the Traceur behavior to aid
            // migration, but this can be revisited.
            if (typeof paramTypes === 'undefined') {
                result[i] = [];
            }
            else if (paramTypes[i] && paramTypes[i] != Object) {
                result[i] = [paramTypes[i]];
            }
            else {
                result[i] = [];
            }
            if (paramAnnotations && paramAnnotations[i] != null) {
                result[i] = result[i].concat(paramAnnotations[i]);
            }
        }
        return result;
    }
    _ownParameters(type, parentCtor) {
        const typeStr = type.toString();
        // If we have no decorators, we only have function.length as metadata.
        // In that case, to detect whether a child class declared an own constructor or not,
        // we need to look inside of that constructor to check whether it is
        // just calling the parent.
        // This also helps to work around for https://github.com/Microsoft/TypeScript/issues/12439
        // that sets 'design:paramtypes' to []
        // if a class inherits from another class but has no ctor declared itself.
        if (isDelegateCtor(typeStr)) {
            return null;
        }
        // Prefer the direct API.
        if (type.parameters && type.parameters !== parentCtor.parameters) {
            return type.parameters;
        }
        // API of tsickle for lowering decorators to properties on the class.
        const tsickleCtorParams = type.ctorParameters;
        if (tsickleCtorParams && tsickleCtorParams !== parentCtor.ctorParameters) {
            // Newer tsickle uses a function closure
            // Retain the non-function case for compatibility with older tsickle
            const ctorParameters = typeof tsickleCtorParams === 'function' ? tsickleCtorParams() : tsickleCtorParams;
            const paramTypes = ctorParameters.map((ctorParam) => ctorParam && ctorParam.type);
            const paramAnnotations = ctorParameters.map((ctorParam) => ctorParam && convertTsickleDecoratorIntoMetadata(ctorParam.decorators));
            return this._zipTypesAndAnnotations(paramTypes, paramAnnotations);
        }
        // API for metadata created by invoking the decorators.
        const paramAnnotations = type.hasOwnProperty(PARAMETERS) && type[PARAMETERS];
        const paramTypes = this._reflect &&
            this._reflect.getOwnMetadata &&
            this._reflect.getOwnMetadata('design:paramtypes', type);
        if (paramTypes || paramAnnotations) {
            return this._zipTypesAndAnnotations(paramTypes, paramAnnotations);
        }
        // If a class has no decorators, at least create metadata
        // based on function.length.
        // Note: We know that this is a real constructor as we checked
        // the content of the constructor above.
        return newArray(type.length);
    }
    parameters(type) {
        // Note: only report metadata if we have at least one class decorator
        // to stay in sync with the static reflector.
        if (!isType(type)) {
            return [];
        }
        const parentCtor = getParentCtor(type);
        let parameters = this._ownParameters(type, parentCtor);
        if (!parameters && parentCtor !== Object) {
            parameters = this.parameters(parentCtor);
        }
        return parameters || [];
    }
    _ownAnnotations(typeOrFunc, parentCtor) {
        // Prefer the direct API.
        if (typeOrFunc.annotations && typeOrFunc.annotations !== parentCtor.annotations) {
            let annotations = typeOrFunc.annotations;
            if (typeof annotations === 'function' && annotations.annotations) {
                annotations = annotations.annotations;
            }
            return annotations;
        }
        // API of tsickle for lowering decorators to properties on the class.
        if (typeOrFunc.decorators && typeOrFunc.decorators !== parentCtor.decorators) {
            return convertTsickleDecoratorIntoMetadata(typeOrFunc.decorators);
        }
        // API for metadata created by invoking the decorators.
        if (typeOrFunc.hasOwnProperty(ANNOTATIONS)) {
            return typeOrFunc[ANNOTATIONS];
        }
        return null;
    }
    annotations(typeOrFunc) {
        if (!isType(typeOrFunc)) {
            return [];
        }
        const parentCtor = getParentCtor(typeOrFunc);
        const ownAnnotations = this._ownAnnotations(typeOrFunc, parentCtor) || [];
        const parentAnnotations = parentCtor !== Object ? this.annotations(parentCtor) : [];
        return parentAnnotations.concat(ownAnnotations);
    }
    _ownPropMetadata(typeOrFunc, parentCtor) {
        // Prefer the direct API.
        if (typeOrFunc.propMetadata &&
            typeOrFunc.propMetadata !== parentCtor.propMetadata) {
            let propMetadata = typeOrFunc.propMetadata;
            if (typeof propMetadata === 'function' && propMetadata.propMetadata) {
                propMetadata = propMetadata.propMetadata;
            }
            return propMetadata;
        }
        // API of tsickle for lowering decorators to properties on the class.
        if (typeOrFunc.propDecorators &&
            typeOrFunc.propDecorators !== parentCtor.propDecorators) {
            const propDecorators = typeOrFunc.propDecorators;
            const propMetadata = {};
            Object.keys(propDecorators).forEach((prop) => {
                propMetadata[prop] = convertTsickleDecoratorIntoMetadata(propDecorators[prop]);
            });
            return propMetadata;
        }
        // API for metadata created by invoking the decorators.
        if (typeOrFunc.hasOwnProperty(PROP_METADATA)) {
            return typeOrFunc[PROP_METADATA];
        }
        return null;
    }
    propMetadata(typeOrFunc) {
        if (!isType(typeOrFunc)) {
            return {};
        }
        const parentCtor = getParentCtor(typeOrFunc);
        const propMetadata = {};
        if (parentCtor !== Object) {
            const parentPropMetadata = this.propMetadata(parentCtor);
            Object.keys(parentPropMetadata).forEach((propName) => {
                propMetadata[propName] = parentPropMetadata[propName];
            });
        }
        const ownPropMetadata = this._ownPropMetadata(typeOrFunc, parentCtor);
        if (ownPropMetadata) {
            Object.keys(ownPropMetadata).forEach((propName) => {
                const decorators = [];
                if (propMetadata.hasOwnProperty(propName)) {
                    decorators.push(...propMetadata[propName]);
                }
                decorators.push(...ownPropMetadata[propName]);
                propMetadata[propName] = decorators;
            });
        }
        return propMetadata;
    }
    ownPropMetadata(typeOrFunc) {
        if (!isType(typeOrFunc)) {
            return {};
        }
        return this._ownPropMetadata(typeOrFunc, getParentCtor(typeOrFunc)) || {};
    }
    hasLifecycleHook(type, lcProperty) {
        return type instanceof Type && lcProperty in type.prototype;
    }
}
function convertTsickleDecoratorIntoMetadata(decoratorInvocations) {
    if (!decoratorInvocations) {
        return [];
    }
    return decoratorInvocations.map((decoratorInvocation) => {
        const decoratorType = decoratorInvocation.type;
        const annotationCls = decoratorType.annotationCls;
        const annotationArgs = decoratorInvocation.args ? decoratorInvocation.args : [];
        return new annotationCls(...annotationArgs);
    });
}
function getParentCtor(ctor) {
    const parentProto = ctor.prototype ? Object.getPrototypeOf(ctor.prototype) : null;
    const parentCtor = parentProto ? parentProto.constructor : null;
    // Note: We always use `Object` as the null value
    // to simplify checking later on.
    return parentCtor || Object;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVmbGVjdGlvbl9jYXBhYmlsaXRpZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZWZsZWN0aW9uL3JlZmxlY3Rpb25fY2FwYWJpbGl0aWVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDL0MsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQzdDLE9BQU8sRUFBQyxXQUFXLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBQzFFLE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUl0Qzs7OztHQUlHO0FBRUg7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXdCRztBQUNILE1BQU0sQ0FBQyxNQUFNLGlCQUFpQixHQUM1QixzR0FBc0csQ0FBQztBQUN6RyxzRkFBc0Y7QUFDdEYsTUFBTSxDQUFDLE1BQU0sc0JBQXNCLEdBQUcsMkNBQTJDLENBQUM7QUFDbEY7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sZ0NBQWdDLEdBQzNDLGtFQUFrRSxDQUFDO0FBQ3JFOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxNQUFNLHlDQUF5QyxHQUNwRCxxR0FBcUcsQ0FBQztBQUV4Rzs7Ozs7OztHQU9HO0FBQ0gsTUFBTSxVQUFVLGNBQWMsQ0FBQyxPQUFlO0lBQzVDLE9BQU8sQ0FDTCxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQy9CLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDdkQsQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FDMUYsQ0FBQztBQUNK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QUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQ2xGLE1BQU0sVUFBVSxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQ2hFLGlEQUFpRDtJQUNqRCxpQ0FBaUM7SUFDakMsT0FBTyxVQUFVLElBQUksTUFBTSxDQUFDO0FBQzlCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7aXNUeXBlLCBUeXBlfSBmcm9tICcuLi9pbnRlcmZhY2UvdHlwZSc7XG5pbXBvcnQge25ld0FycmF5fSBmcm9tICcuLi91dGlsL2FycmF5X3V0aWxzJztcbmltcG9ydCB7QU5OT1RBVElPTlMsIFBBUkFNRVRFUlMsIFBST1BfTUVUQURBVEF9IGZyb20gJy4uL3V0aWwvZGVjb3JhdG9ycyc7XG5pbXBvcnQge2dsb2JhbH0gZnJvbSAnLi4vdXRpbC9nbG9iYWwnO1xuXG5pbXBvcnQge1BsYXRmb3JtUmVmbGVjdGlvbkNhcGFiaWxpdGllc30gZnJvbSAnLi9wbGF0Zm9ybV9yZWZsZWN0aW9uX2NhcGFiaWxpdGllcyc7XG5cbi8qXG4gKiAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4gKiBBdHRlbnRpb246IFRoZXNlIFJlZ3VsYXIgZXhwcmVzc2lvbnMgaGF2ZSB0byBob2xkIGV2ZW4gaWYgdGhlIGNvZGUgaXMgbWluaWZpZWQhXG4gKiAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuICovXG5cbi8qKlxuICogUmVndWxhciBleHByZXNzaW9uIHRoYXQgZGV0ZWN0cyBwYXNzLXRocm91Z2ggY29uc3RydWN0b3JzIGZvciBFUzUgb3V0cHV0LiBUaGlzIFJlZ2V4XG4gKiBpbnRlbmRzIHRvIGNhcHR1cmUgdGhlIGNvbW1vbiBkZWxlZ2F0aW9uIHBhdHRlcm4gZW1pdHRlZCBieSBUeXBlU2NyaXB0IGFuZCBCYWJlbC4gQWxzb1xuICogaXQgaW50ZW5kcyB0byBjYXB0dXJlIHRoZSBwYXR0ZXJuIHdoZXJlIGV4aXN0aW5nIGNvbnN0cnVjdG9ycyBoYXZlIGJlZW4gZG93bmxldmVsZWQgZnJvbVxuICogRVMyMDE1IHRvIEVTNSB1c2luZyBUeXBlU2NyaXB0IHcvIGRvd25sZXZlbCBpdGVyYXRpb24uIGUuZy5cbiAqXG4gKiBgYGBcbiAqICAgZnVuY3Rpb24gTXlDbGFzcygpIHtcbiAqICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSB8fCB0aGlzO1xuICogYGBgXG4gKlxuICogZG93bmxldmVsZWQgdG8gRVM1IHdpdGggYGRvd25sZXZlbEl0ZXJhdGlvbmAgZm9yIFR5cGVTY3JpcHQgPCA0LjI6XG4gKiBgYGBcbiAqICAgZnVuY3Rpb24gTXlDbGFzcygpIHtcbiAqICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuYXBwbHkodGhpcywgX19zcHJlYWQoYXJndW1lbnRzKSkgfHwgdGhpcztcbiAqIGBgYFxuICpcbiAqIG9yIGRvd25sZXZlbGVkIHRvIEVTNSB3aXRoIGBkb3dubGV2ZWxJdGVyYXRpb25gIGZvciBUeXBlU2NyaXB0ID49IDQuMjpcbiAqIGBgYFxuICogICBmdW5jdGlvbiBNeUNsYXNzKCkge1xuICogICAgIHZhciBfdGhpcyA9IF9zdXBlci5hcHBseSh0aGlzLCBfX3NwcmVhZEFycmF5KFtdLCBfX3JlYWQoYXJndW1lbnRzKSwgZmFsc2UpKSB8fCB0aGlzO1xuICogYGBgXG4gKlxuICogTW9yZSBkZXRhaWxzIGNhbiBiZSBmb3VuZCBpbjogaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvMzg0NTMuXG4gKi9cbmV4cG9ydCBjb25zdCBFUzVfREVMRUdBVEVfQ1RPUiA9XG4gIC9eZnVuY3Rpb25cXHMrXFxTK1xcKFxcKVxccyp7W1xcc1xcU10rXFwuYXBwbHlcXCh0aGlzLFxccyooYXJndW1lbnRzfCg/OlteKCldK1xcKFxcW1xcXSwpP1teKCldK1xcKGFyZ3VtZW50c1xcKS4qKVxcKS87XG4vKiogUmVndWxhciBleHByZXNzaW9uIHRoYXQgZGV0ZWN0cyBFUzIwMTUgY2xhc3NlcyB3aGljaCBleHRlbmQgZnJvbSBvdGhlciBjbGFzc2VzLiAqL1xuZXhwb3J0IGNvbnN0IEVTMjAxNV9JTkhFUklURURfQ0xBU1MgPSAvXmNsYXNzXFxzK1tBLVphLXpcXGQkX10qXFxzKmV4dGVuZHNcXHMrW157XSt7Lztcbi8qKlxuICogUmVndWxhciBleHByZXNzaW9uIHRoYXQgZGV0ZWN0cyBFUzIwMTUgY2xhc3NlcyB3aGljaCBleHRlbmQgZnJvbSBvdGhlciBjbGFzc2VzIGFuZFxuICogaGF2ZSBhbiBleHBsaWNpdCBjb25zdHJ1Y3RvciBkZWZpbmVkLlxuICovXG5leHBvcnQgY29uc3QgRVMyMDE1X0lOSEVSSVRFRF9DTEFTU19XSVRIX0NUT1IgPVxuICAvXmNsYXNzXFxzK1tBLVphLXpcXGQkX10qXFxzKmV4dGVuZHNcXHMrW157XSt7W1xcc1xcU10qY29uc3RydWN0b3JcXHMqXFwoLztcbi8qKlxuICogUmVndWxhciBleHByZXNzaW9uIHRoYXQgZGV0ZWN0cyBFUzIwMTUgY2xhc3NlcyB3aGljaCBleHRlbmQgZnJvbSBvdGhlciBjbGFzc2VzXG4gKiBhbmQgaW5oZXJpdCBhIGNvbnN0cnVjdG9yLlxuICovXG5leHBvcnQgY29uc3QgRVMyMDE1X0lOSEVSSVRFRF9DTEFTU19XSVRIX0RFTEVHQVRFX0NUT1IgPVxuICAvXmNsYXNzXFxzK1tBLVphLXpcXGQkX10qXFxzKmV4dGVuZHNcXHMrW157XSt7W1xcc1xcU10qY29uc3RydWN0b3JcXHMqXFwoXFwpXFxzKntbXn1dKnN1cGVyXFwoXFwuXFwuXFwuYXJndW1lbnRzXFwpLztcblxuLyoqXG4gKiBEZXRlcm1pbmUgd2hldGhlciBhIHN0cmluZ2lmaWVkIHR5cGUgaXMgYSBjbGFzcyB3aGljaCBkZWxlZ2F0ZXMgaXRzIGNvbnN0cnVjdG9yXG4gKiB0byBpdHMgcGFyZW50LlxuICpcbiAqIFRoaXMgaXMgbm90IHRyaXZpYWwgc2luY2UgY29tcGlsZWQgY29kZSBjYW4gYWN0dWFsbHkgY29udGFpbiBhIGNvbnN0cnVjdG9yIGZ1bmN0aW9uXG4gKiBldmVuIGlmIHRoZSBvcmlnaW5hbCBzb3VyY2UgY29kZSBkaWQgbm90LiBGb3IgaW5zdGFuY2UsIHdoZW4gdGhlIGNoaWxkIGNsYXNzIGNvbnRhaW5zXG4gKiBhbiBpbml0aWFsaXplZCBpbnN0YW5jZSBwcm9wZXJ0eS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRGVsZWdhdGVDdG9yKHR5cGVTdHI6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgIEVTNV9ERUxFR0FURV9DVE9SLnRlc3QodHlwZVN0cikgfHxcbiAgICBFUzIwMTVfSU5IRVJJVEVEX0NMQVNTX1dJVEhfREVMRUdBVEVfQ1RPUi50ZXN0KHR5cGVTdHIpIHx8XG4gICAgKEVTMjAxNV9JTkhFUklURURfQ0xBU1MudGVzdCh0eXBlU3RyKSAmJiAhRVMyMDE1X0lOSEVSSVRFRF9DTEFTU19XSVRIX0NUT1IudGVzdCh0eXBlU3RyKSlcbiAgKTtcbn1cblxuZXhwb3J0IGNsYXNzIFJlZmxlY3Rpb25DYXBhYmlsaXRpZXMgaW1wbGVtZW50cyBQbGF0Zm9ybVJlZmxlY3Rpb25DYXBhYmlsaXRpZXMge1xuICBwcml2YXRlIF9yZWZsZWN0OiBhbnk7XG5cbiAgY29uc3RydWN0b3IocmVmbGVjdD86IGFueSkge1xuICAgIHRoaXMuX3JlZmxlY3QgPSByZWZsZWN0IHx8IGdsb2JhbFsnUmVmbGVjdCddO1xuICB9XG5cbiAgZmFjdG9yeTxUPih0OiBUeXBlPFQ+KTogKGFyZ3M6IGFueVtdKSA9PiBUIHtcbiAgICByZXR1cm4gKC4uLmFyZ3M6IGFueVtdKSA9PiBuZXcgdCguLi5hcmdzKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3ppcFR5cGVzQW5kQW5ub3RhdGlvbnMocGFyYW1UeXBlczogYW55W10sIHBhcmFtQW5ub3RhdGlvbnM6IGFueVtdKTogYW55W11bXSB7XG4gICAgbGV0IHJlc3VsdDogYW55W11bXTtcblxuICAgIGlmICh0eXBlb2YgcGFyYW1UeXBlcyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJlc3VsdCA9IG5ld0FycmF5KHBhcmFtQW5ub3RhdGlvbnMubGVuZ3RoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0ID0gbmV3QXJyYXkocGFyYW1UeXBlcy5sZW5ndGgpO1xuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVzdWx0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAvLyBUUyBvdXRwdXRzIE9iamVjdCBmb3IgcGFyYW1ldGVycyB3aXRob3V0IHR5cGVzLCB3aGlsZSBUcmFjZXVyIG9taXRzXG4gICAgICAvLyB0aGUgYW5ub3RhdGlvbnMuIEZvciBub3cgd2UgcHJlc2VydmUgdGhlIFRyYWNldXIgYmVoYXZpb3IgdG8gYWlkXG4gICAgICAvLyBtaWdyYXRpb24sIGJ1dCB0aGlzIGNhbiBiZSByZXZpc2l0ZWQuXG4gICAgICBpZiAodHlwZW9mIHBhcmFtVHlwZXMgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJlc3VsdFtpXSA9IFtdO1xuICAgICAgfSBlbHNlIGlmIChwYXJhbVR5cGVzW2ldICYmIHBhcmFtVHlwZXNbaV0gIT0gT2JqZWN0KSB7XG4gICAgICAgIHJlc3VsdFtpXSA9IFtwYXJhbVR5cGVzW2ldXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdFtpXSA9IFtdO1xuICAgICAgfVxuICAgICAgaWYgKHBhcmFtQW5ub3RhdGlvbnMgJiYgcGFyYW1Bbm5vdGF0aW9uc1tpXSAhPSBudWxsKSB7XG4gICAgICAgIHJlc3VsdFtpXSA9IHJlc3VsdFtpXS5jb25jYXQocGFyYW1Bbm5vdGF0aW9uc1tpXSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBwcml2YXRlIF9vd25QYXJhbWV0ZXJzKHR5cGU6IFR5cGU8YW55PiwgcGFyZW50Q3RvcjogYW55KTogYW55W11bXSB8IG51bGwge1xuICAgIGNvbnN0IHR5cGVTdHIgPSB0eXBlLnRvU3RyaW5nKCk7XG4gICAgLy8gSWYgd2UgaGF2ZSBubyBkZWNvcmF0b3JzLCB3ZSBvbmx5IGhhdmUgZnVuY3Rpb24ubGVuZ3RoIGFzIG1ldGFkYXRhLlxuICAgIC8vIEluIHRoYXQgY2FzZSwgdG8gZGV0ZWN0IHdoZXRoZXIgYSBjaGlsZCBjbGFzcyBkZWNsYXJlZCBhbiBvd24gY29uc3RydWN0b3Igb3Igbm90LFxuICAgIC8vIHdlIG5lZWQgdG8gbG9vayBpbnNpZGUgb2YgdGhhdCBjb25zdHJ1Y3RvciB0byBjaGVjayB3aGV0aGVyIGl0IGlzXG4gICAgLy8ganVzdCBjYWxsaW5nIHRoZSBwYXJlbnQuXG4gICAgLy8gVGhpcyBhbHNvIGhlbHBzIHRvIHdvcmsgYXJvdW5kIGZvciBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzEyNDM5XG4gICAgLy8gdGhhdCBzZXRzICdkZXNpZ246cGFyYW10eXBlcycgdG8gW11cbiAgICAvLyBpZiBhIGNsYXNzIGluaGVyaXRzIGZyb20gYW5vdGhlciBjbGFzcyBidXQgaGFzIG5vIGN0b3IgZGVjbGFyZWQgaXRzZWxmLlxuICAgIGlmIChpc0RlbGVnYXRlQ3Rvcih0eXBlU3RyKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gUHJlZmVyIHRoZSBkaXJlY3QgQVBJLlxuICAgIGlmICgoPGFueT50eXBlKS5wYXJhbWV0ZXJzICYmICg8YW55PnR5cGUpLnBhcmFtZXRlcnMgIT09IHBhcmVudEN0b3IucGFyYW1ldGVycykge1xuICAgICAgcmV0dXJuICg8YW55PnR5cGUpLnBhcmFtZXRlcnM7XG4gICAgfVxuXG4gICAgLy8gQVBJIG9mIHRzaWNrbGUgZm9yIGxvd2VyaW5nIGRlY29yYXRvcnMgdG8gcHJvcGVydGllcyBvbiB0aGUgY2xhc3MuXG4gICAgY29uc3QgdHNpY2tsZUN0b3JQYXJhbXMgPSAoPGFueT50eXBlKS5jdG9yUGFyYW1ldGVycztcbiAgICBpZiAodHNpY2tsZUN0b3JQYXJhbXMgJiYgdHNpY2tsZUN0b3JQYXJhbXMgIT09IHBhcmVudEN0b3IuY3RvclBhcmFtZXRlcnMpIHtcbiAgICAgIC8vIE5ld2VyIHRzaWNrbGUgdXNlcyBhIGZ1bmN0aW9uIGNsb3N1cmVcbiAgICAgIC8vIFJldGFpbiB0aGUgbm9uLWZ1bmN0aW9uIGNhc2UgZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBvbGRlciB0c2lja2xlXG4gICAgICBjb25zdCBjdG9yUGFyYW1ldGVycyA9XG4gICAgICAgIHR5cGVvZiB0c2lja2xlQ3RvclBhcmFtcyA9PT0gJ2Z1bmN0aW9uJyA/IHRzaWNrbGVDdG9yUGFyYW1zKCkgOiB0c2lja2xlQ3RvclBhcmFtcztcbiAgICAgIGNvbnN0IHBhcmFtVHlwZXMgPSBjdG9yUGFyYW1ldGVycy5tYXAoKGN0b3JQYXJhbTogYW55KSA9PiBjdG9yUGFyYW0gJiYgY3RvclBhcmFtLnR5cGUpO1xuICAgICAgY29uc3QgcGFyYW1Bbm5vdGF0aW9ucyA9IGN0b3JQYXJhbWV0ZXJzLm1hcChcbiAgICAgICAgKGN0b3JQYXJhbTogYW55KSA9PiBjdG9yUGFyYW0gJiYgY29udmVydFRzaWNrbGVEZWNvcmF0b3JJbnRvTWV0YWRhdGEoY3RvclBhcmFtLmRlY29yYXRvcnMpLFxuICAgICAgKTtcbiAgICAgIHJldHVybiB0aGlzLl96aXBUeXBlc0FuZEFubm90YXRpb25zKHBhcmFtVHlwZXMsIHBhcmFtQW5ub3RhdGlvbnMpO1xuICAgIH1cblxuICAgIC8vIEFQSSBmb3IgbWV0YWRhdGEgY3JlYXRlZCBieSBpbnZva2luZyB0aGUgZGVjb3JhdG9ycy5cbiAgICBjb25zdCBwYXJhbUFubm90YXRpb25zID0gdHlwZS5oYXNPd25Qcm9wZXJ0eShQQVJBTUVURVJTKSAmJiAodHlwZSBhcyBhbnkpW1BBUkFNRVRFUlNdO1xuICAgIGNvbnN0IHBhcmFtVHlwZXMgPVxuICAgICAgdGhpcy5fcmVmbGVjdCAmJlxuICAgICAgdGhpcy5fcmVmbGVjdC5nZXRPd25NZXRhZGF0YSAmJlxuICAgICAgdGhpcy5fcmVmbGVjdC5nZXRPd25NZXRhZGF0YSgnZGVzaWduOnBhcmFtdHlwZXMnLCB0eXBlKTtcbiAgICBpZiAocGFyYW1UeXBlcyB8fCBwYXJhbUFubm90YXRpb25zKSB7XG4gICAgICByZXR1cm4gdGhpcy5femlwVHlwZXNBbmRBbm5vdGF0aW9ucyhwYXJhbVR5cGVzLCBwYXJhbUFubm90YXRpb25zKTtcbiAgICB9XG5cbiAgICAvLyBJZiBhIGNsYXNzIGhhcyBubyBkZWNvcmF0b3JzLCBhdCBsZWFzdCBjcmVhdGUgbWV0YWRhdGFcbiAgICAvLyBiYXNlZCBvbiBmdW5jdGlvbi5sZW5ndGguXG4gICAgLy8gTm90ZTogV2Uga25vdyB0aGF0IHRoaXMgaXMgYSByZWFsIGNvbnN0cnVjdG9yIGFzIHdlIGNoZWNrZWRcbiAgICAvLyB0aGUgY29udGVudCBvZiB0aGUgY29uc3RydWN0b3IgYWJvdmUuXG4gICAgcmV0dXJuIG5ld0FycmF5PGFueVtdPih0eXBlLmxlbmd0aCk7XG4gIH1cblxuICBwYXJhbWV0ZXJzKHR5cGU6IFR5cGU8YW55Pik6IGFueVtdW10ge1xuICAgIC8vIE5vdGU6IG9ubHkgcmVwb3J0IG1ldGFkYXRhIGlmIHdlIGhhdmUgYXQgbGVhc3Qgb25lIGNsYXNzIGRlY29yYXRvclxuICAgIC8vIHRvIHN0YXkgaW4gc3luYyB3aXRoIHRoZSBzdGF0aWMgcmVmbGVjdG9yLlxuICAgIGlmICghaXNUeXBlKHR5cGUpKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGNvbnN0IHBhcmVudEN0b3IgPSBnZXRQYXJlbnRDdG9yKHR5cGUpO1xuICAgIGxldCBwYXJhbWV0ZXJzID0gdGhpcy5fb3duUGFyYW1ldGVycyh0eXBlLCBwYXJlbnRDdG9yKTtcbiAgICBpZiAoIXBhcmFtZXRlcnMgJiYgcGFyZW50Q3RvciAhPT0gT2JqZWN0KSB7XG4gICAgICBwYXJhbWV0ZXJzID0gdGhpcy5wYXJhbWV0ZXJzKHBhcmVudEN0b3IpO1xuICAgIH1cbiAgICByZXR1cm4gcGFyYW1ldGVycyB8fCBbXTtcbiAgfVxuXG4gIHByaXZhdGUgX293bkFubm90YXRpb25zKHR5cGVPckZ1bmM6IFR5cGU8YW55PiwgcGFyZW50Q3RvcjogYW55KTogYW55W10gfCBudWxsIHtcbiAgICAvLyBQcmVmZXIgdGhlIGRpcmVjdCBBUEkuXG4gICAgaWYgKCg8YW55PnR5cGVPckZ1bmMpLmFubm90YXRpb25zICYmICg8YW55PnR5cGVPckZ1bmMpLmFubm90YXRpb25zICE9PSBwYXJlbnRDdG9yLmFubm90YXRpb25zKSB7XG4gICAgICBsZXQgYW5ub3RhdGlvbnMgPSAoPGFueT50eXBlT3JGdW5jKS5hbm5vdGF0aW9ucztcbiAgICAgIGlmICh0eXBlb2YgYW5ub3RhdGlvbnMgPT09ICdmdW5jdGlvbicgJiYgYW5ub3RhdGlvbnMuYW5ub3RhdGlvbnMpIHtcbiAgICAgICAgYW5ub3RhdGlvbnMgPSBhbm5vdGF0aW9ucy5hbm5vdGF0aW9ucztcbiAgICAgIH1cbiAgICAgIHJldHVybiBhbm5vdGF0aW9ucztcbiAgICB9XG5cbiAgICAvLyBBUEkgb2YgdHNpY2tsZSBmb3IgbG93ZXJpbmcgZGVjb3JhdG9ycyB0byBwcm9wZXJ0aWVzIG9uIHRoZSBjbGFzcy5cbiAgICBpZiAoKDxhbnk+dHlwZU9yRnVuYykuZGVjb3JhdG9ycyAmJiAoPGFueT50eXBlT3JGdW5jKS5kZWNvcmF0b3JzICE9PSBwYXJlbnRDdG9yLmRlY29yYXRvcnMpIHtcbiAgICAgIHJldHVybiBjb252ZXJ0VHNpY2tsZURlY29yYXRvckludG9NZXRhZGF0YSgoPGFueT50eXBlT3JGdW5jKS5kZWNvcmF0b3JzKTtcbiAgICB9XG5cbiAgICAvLyBBUEkgZm9yIG1ldGFkYXRhIGNyZWF0ZWQgYnkgaW52b2tpbmcgdGhlIGRlY29yYXRvcnMuXG4gICAgaWYgKHR5cGVPckZ1bmMuaGFzT3duUHJvcGVydHkoQU5OT1RBVElPTlMpKSB7XG4gICAgICByZXR1cm4gKHR5cGVPckZ1bmMgYXMgYW55KVtBTk5PVEFUSU9OU107XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgYW5ub3RhdGlvbnModHlwZU9yRnVuYzogVHlwZTxhbnk+KTogYW55W10ge1xuICAgIGlmICghaXNUeXBlKHR5cGVPckZ1bmMpKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGNvbnN0IHBhcmVudEN0b3IgPSBnZXRQYXJlbnRDdG9yKHR5cGVPckZ1bmMpO1xuICAgIGNvbnN0IG93bkFubm90YXRpb25zID0gdGhpcy5fb3duQW5ub3RhdGlvbnModHlwZU9yRnVuYywgcGFyZW50Q3RvcikgfHwgW107XG4gICAgY29uc3QgcGFyZW50QW5ub3RhdGlvbnMgPSBwYXJlbnRDdG9yICE9PSBPYmplY3QgPyB0aGlzLmFubm90YXRpb25zKHBhcmVudEN0b3IpIDogW107XG4gICAgcmV0dXJuIHBhcmVudEFubm90YXRpb25zLmNvbmNhdChvd25Bbm5vdGF0aW9ucyk7XG4gIH1cblxuICBwcml2YXRlIF9vd25Qcm9wTWV0YWRhdGEodHlwZU9yRnVuYzogYW55LCBwYXJlbnRDdG9yOiBhbnkpOiB7W2tleTogc3RyaW5nXTogYW55W119IHwgbnVsbCB7XG4gICAgLy8gUHJlZmVyIHRoZSBkaXJlY3QgQVBJLlxuICAgIGlmIChcbiAgICAgICg8YW55PnR5cGVPckZ1bmMpLnByb3BNZXRhZGF0YSAmJlxuICAgICAgKDxhbnk+dHlwZU9yRnVuYykucHJvcE1ldGFkYXRhICE9PSBwYXJlbnRDdG9yLnByb3BNZXRhZGF0YVxuICAgICkge1xuICAgICAgbGV0IHByb3BNZXRhZGF0YSA9ICg8YW55PnR5cGVPckZ1bmMpLnByb3BNZXRhZGF0YTtcbiAgICAgIGlmICh0eXBlb2YgcHJvcE1ldGFkYXRhID09PSAnZnVuY3Rpb24nICYmIHByb3BNZXRhZGF0YS5wcm9wTWV0YWRhdGEpIHtcbiAgICAgICAgcHJvcE1ldGFkYXRhID0gcHJvcE1ldGFkYXRhLnByb3BNZXRhZGF0YTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwcm9wTWV0YWRhdGE7XG4gICAgfVxuXG4gICAgLy8gQVBJIG9mIHRzaWNrbGUgZm9yIGxvd2VyaW5nIGRlY29yYXRvcnMgdG8gcHJvcGVydGllcyBvbiB0aGUgY2xhc3MuXG4gICAgaWYgKFxuICAgICAgKDxhbnk+dHlwZU9yRnVuYykucHJvcERlY29yYXRvcnMgJiZcbiAgICAgICg8YW55PnR5cGVPckZ1bmMpLnByb3BEZWNvcmF0b3JzICE9PSBwYXJlbnRDdG9yLnByb3BEZWNvcmF0b3JzXG4gICAgKSB7XG4gICAgICBjb25zdCBwcm9wRGVjb3JhdG9ycyA9ICg8YW55PnR5cGVPckZ1bmMpLnByb3BEZWNvcmF0b3JzO1xuICAgICAgY29uc3QgcHJvcE1ldGFkYXRhID0gPHtba2V5OiBzdHJpbmddOiBhbnlbXX0+e307XG4gICAgICBPYmplY3Qua2V5cyhwcm9wRGVjb3JhdG9ycykuZm9yRWFjaCgocHJvcCkgPT4ge1xuICAgICAgICBwcm9wTWV0YWRhdGFbcHJvcF0gPSBjb252ZXJ0VHNpY2tsZURlY29yYXRvckludG9NZXRhZGF0YShwcm9wRGVjb3JhdG9yc1twcm9wXSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBwcm9wTWV0YWRhdGE7XG4gICAgfVxuXG4gICAgLy8gQVBJIGZvciBtZXRhZGF0YSBjcmVhdGVkIGJ5IGludm9raW5nIHRoZSBkZWNvcmF0b3JzLlxuICAgIGlmICh0eXBlT3JGdW5jLmhhc093blByb3BlcnR5KFBST1BfTUVUQURBVEEpKSB7XG4gICAgICByZXR1cm4gKHR5cGVPckZ1bmMgYXMgYW55KVtQUk9QX01FVEFEQVRBXTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBwcm9wTWV0YWRhdGEodHlwZU9yRnVuYzogYW55KToge1trZXk6IHN0cmluZ106IGFueVtdfSB7XG4gICAgaWYgKCFpc1R5cGUodHlwZU9yRnVuYykpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gICAgY29uc3QgcGFyZW50Q3RvciA9IGdldFBhcmVudEN0b3IodHlwZU9yRnVuYyk7XG4gICAgY29uc3QgcHJvcE1ldGFkYXRhOiB7W2tleTogc3RyaW5nXTogYW55W119ID0ge307XG4gICAgaWYgKHBhcmVudEN0b3IgIT09IE9iamVjdCkge1xuICAgICAgY29uc3QgcGFyZW50UHJvcE1ldGFkYXRhID0gdGhpcy5wcm9wTWV0YWRhdGEocGFyZW50Q3Rvcik7XG4gICAgICBPYmplY3Qua2V5cyhwYXJlbnRQcm9wTWV0YWRhdGEpLmZvckVhY2goKHByb3BOYW1lKSA9PiB7XG4gICAgICAgIHByb3BNZXRhZGF0YVtwcm9wTmFtZV0gPSBwYXJlbnRQcm9wTWV0YWRhdGFbcHJvcE5hbWVdO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGNvbnN0IG93blByb3BNZXRhZGF0YSA9IHRoaXMuX293blByb3BNZXRhZGF0YSh0eXBlT3JGdW5jLCBwYXJlbnRDdG9yKTtcbiAgICBpZiAob3duUHJvcE1ldGFkYXRhKSB7XG4gICAgICBPYmplY3Qua2V5cyhvd25Qcm9wTWV0YWRhdGEpLmZvckVhY2goKHByb3BOYW1lKSA9PiB7XG4gICAgICAgIGNvbnN0IGRlY29yYXRvcnM6IGFueVtdID0gW107XG4gICAgICAgIGlmIChwcm9wTWV0YWRhdGEuaGFzT3duUHJvcGVydHkocHJvcE5hbWUpKSB7XG4gICAgICAgICAgZGVjb3JhdG9ycy5wdXNoKC4uLnByb3BNZXRhZGF0YVtwcm9wTmFtZV0pO1xuICAgICAgICB9XG4gICAgICAgIGRlY29yYXRvcnMucHVzaCguLi5vd25Qcm9wTWV0YWRhdGFbcHJvcE5hbWVdKTtcbiAgICAgICAgcHJvcE1ldGFkYXRhW3Byb3BOYW1lXSA9IGRlY29yYXRvcnM7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHByb3BNZXRhZGF0YTtcbiAgfVxuXG4gIG93blByb3BNZXRhZGF0YSh0eXBlT3JGdW5jOiBhbnkpOiB7W2tleTogc3RyaW5nXTogYW55W119IHtcbiAgICBpZiAoIWlzVHlwZSh0eXBlT3JGdW5jKSkge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fb3duUHJvcE1ldGFkYXRhKHR5cGVPckZ1bmMsIGdldFBhcmVudEN0b3IodHlwZU9yRnVuYykpIHx8IHt9O1xuICB9XG5cbiAgaGFzTGlmZWN5Y2xlSG9vayh0eXBlOiBhbnksIGxjUHJvcGVydHk6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0eXBlIGluc3RhbmNlb2YgVHlwZSAmJiBsY1Byb3BlcnR5IGluIHR5cGUucHJvdG90eXBlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnRUc2lja2xlRGVjb3JhdG9ySW50b01ldGFkYXRhKGRlY29yYXRvckludm9jYXRpb25zOiBhbnlbXSk6IGFueVtdIHtcbiAgaWYgKCFkZWNvcmF0b3JJbnZvY2F0aW9ucykge1xuICAgIHJldHVybiBbXTtcbiAgfVxuICByZXR1cm4gZGVjb3JhdG9ySW52b2NhdGlvbnMubWFwKChkZWNvcmF0b3JJbnZvY2F0aW9uKSA9PiB7XG4gICAgY29uc3QgZGVjb3JhdG9yVHlwZSA9IGRlY29yYXRvckludm9jYXRpb24udHlwZTtcbiAgICBjb25zdCBhbm5vdGF0aW9uQ2xzID0gZGVjb3JhdG9yVHlwZS5hbm5vdGF0aW9uQ2xzO1xuICAgIGNvbnN0IGFubm90YXRpb25BcmdzID0gZGVjb3JhdG9ySW52b2NhdGlvbi5hcmdzID8gZGVjb3JhdG9ySW52b2NhdGlvbi5hcmdzIDogW107XG4gICAgcmV0dXJuIG5ldyBhbm5vdGF0aW9uQ2xzKC4uLmFubm90YXRpb25BcmdzKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFBhcmVudEN0b3IoY3RvcjogRnVuY3Rpb24pOiBUeXBlPGFueT4ge1xuICBjb25zdCBwYXJlbnRQcm90byA9IGN0b3IucHJvdG90eXBlID8gT2JqZWN0LmdldFByb3RvdHlwZU9mKGN0b3IucHJvdG90eXBlKSA6IG51bGw7XG4gIGNvbnN0IHBhcmVudEN0b3IgPSBwYXJlbnRQcm90byA/IHBhcmVudFByb3RvLmNvbnN0cnVjdG9yIDogbnVsbDtcbiAgLy8gTm90ZTogV2UgYWx3YXlzIHVzZSBgT2JqZWN0YCBhcyB0aGUgbnVsbCB2YWx1ZVxuICAvLyB0byBzaW1wbGlmeSBjaGVja2luZyBsYXRlciBvbi5cbiAgcmV0dXJuIHBhcmVudEN0b3IgfHwgT2JqZWN0O1xufVxuIl19