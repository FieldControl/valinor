/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { isType, Type } from '../interface/type';
import { newArray } from '../util/array_utils';
import { ANNOTATIONS, PARAMETERS, PROP_METADATA } from '../util/decorators';
import { global } from '../util/global';
import { stringify } from '../util/stringify';
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
 *     var _this = _super.apply(this, __spreadArray([], __read(arguments))) || this;
 * ```
 *
 * More details can be found in: https://github.com/angular/angular/issues/38453.
 */
export const ES5_DELEGATE_CTOR = /^function\s+\S+\(\)\s*{[\s\S]+\.apply\(this,\s*(arguments|(?:[^()]+\(\[\],)?[^()]+\(arguments\))\)/;
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
export const ES2015_INHERITED_CLASS_WITH_DELEGATE_CTOR = /^class\s+[A-Za-z\d$_]*\s*extends\s+[^{]+{[\s\S]*constructor\s*\(\)\s*{\s*super\(\.\.\.arguments\)/;
/**
 * Determine whether a stringified type is a class which delegates its constructor
 * to its parent.
 *
 * This is not trivial since compiled code can actually contain a constructor function
 * even if the original source code did not. For instance, when the child class contains
 * an initialized instance property.
 */
export function isDelegateCtor(typeStr) {
    return ES5_DELEGATE_CTOR.test(typeStr) ||
        ES2015_INHERITED_CLASS_WITH_DELEGATE_CTOR.test(typeStr) ||
        (ES2015_INHERITED_CLASS.test(typeStr) && !ES2015_INHERITED_CLASS_WITH_CTOR.test(typeStr));
}
export class ReflectionCapabilities {
    constructor(reflect) {
        this._reflect = reflect || global['Reflect'];
    }
    isReflectionEnabled() {
        return true;
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
        const paramTypes = this._reflect && this._reflect.getOwnMetadata &&
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
            Object.keys(propDecorators).forEach(prop => {
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
    guards(type) {
        return {};
    }
    getter(name) {
        return new Function('o', 'return o.' + name + ';');
    }
    setter(name) {
        return new Function('o', 'v', 'return o.' + name + ' = v;');
    }
    method(name) {
        const functionBody = `if (!o.${name}) throw new Error('"${name}" is undefined');
        return o.${name}.apply(o, args);`;
        return new Function('o', 'args', functionBody);
    }
    // There is not a concept of import uri in Js, but this is useful in developing Dart applications.
    importUri(type) {
        // StaticSymbol
        if (typeof type === 'object' && type['filePath']) {
            return type['filePath'];
        }
        // Runtime type
        return `./${stringify(type)}`;
    }
    resourceUri(type) {
        return `./${stringify(type)}`;
    }
    resolveIdentifier(name, moduleUrl, members, runtime) {
        return runtime;
    }
    resolveEnum(enumIdentifier, name) {
        return enumIdentifier[name];
    }
}
function convertTsickleDecoratorIntoMetadata(decoratorInvocations) {
    if (!decoratorInvocations) {
        return [];
    }
    return decoratorInvocations.map(decoratorInvocation => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVmbGVjdGlvbl9jYXBhYmlsaXRpZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZWZsZWN0aW9uL3JlZmxlY3Rpb25fY2FwYWJpbGl0aWVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDL0MsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQzdDLE9BQU8sRUFBQyxXQUFXLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBQzFFLE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUN0QyxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFPNUM7Ozs7R0FJRztBQUVIOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F3Qkc7QUFDSCxNQUFNLENBQUMsTUFBTSxpQkFBaUIsR0FDMUIsb0dBQW9HLENBQUM7QUFDekcsc0ZBQXNGO0FBQ3RGLE1BQU0sQ0FBQyxNQUFNLHNCQUFzQixHQUFHLDJDQUEyQyxDQUFDO0FBQ2xGOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxNQUFNLGdDQUFnQyxHQUN6QyxrRUFBa0UsQ0FBQztBQUN2RTs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSx5Q0FBeUMsR0FDbEQsbUdBQW1HLENBQUM7QUFFeEc7Ozs7Ozs7R0FPRztBQUNILE1BQU0sVUFBVSxjQUFjLENBQUMsT0FBZTtJQUM1QyxPQUFPLGlCQUFpQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDbEMseUNBQXlDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUN2RCxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLElB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QyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2lzVHlwZSwgVHlwZX0gZnJvbSAnLi4vaW50ZXJmYWNlL3R5cGUnO1xuaW1wb3J0IHtuZXdBcnJheX0gZnJvbSAnLi4vdXRpbC9hcnJheV91dGlscyc7XG5pbXBvcnQge0FOTk9UQVRJT05TLCBQQVJBTUVURVJTLCBQUk9QX01FVEFEQVRBfSBmcm9tICcuLi91dGlsL2RlY29yYXRvcnMnO1xuaW1wb3J0IHtnbG9iYWx9IGZyb20gJy4uL3V0aWwvZ2xvYmFsJztcbmltcG9ydCB7c3RyaW5naWZ5fSBmcm9tICcuLi91dGlsL3N0cmluZ2lmeSc7XG5cbmltcG9ydCB7UGxhdGZvcm1SZWZsZWN0aW9uQ2FwYWJpbGl0aWVzfSBmcm9tICcuL3BsYXRmb3JtX3JlZmxlY3Rpb25fY2FwYWJpbGl0aWVzJztcbmltcG9ydCB7R2V0dGVyRm4sIE1ldGhvZEZuLCBTZXR0ZXJGbn0gZnJvbSAnLi90eXBlcyc7XG5cblxuXG4vKlxuICogIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuICogQXR0ZW50aW9uOiBUaGVzZSBSZWd1bGFyIGV4cHJlc3Npb25zIGhhdmUgdG8gaG9sZCBldmVuIGlmIHRoZSBjb2RlIGlzIG1pbmlmaWVkIVxuICogIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiAqL1xuXG4vKipcbiAqIFJlZ3VsYXIgZXhwcmVzc2lvbiB0aGF0IGRldGVjdHMgcGFzcy10aHJvdWdoIGNvbnN0cnVjdG9ycyBmb3IgRVM1IG91dHB1dC4gVGhpcyBSZWdleFxuICogaW50ZW5kcyB0byBjYXB0dXJlIHRoZSBjb21tb24gZGVsZWdhdGlvbiBwYXR0ZXJuIGVtaXR0ZWQgYnkgVHlwZVNjcmlwdCBhbmQgQmFiZWwuIEFsc29cbiAqIGl0IGludGVuZHMgdG8gY2FwdHVyZSB0aGUgcGF0dGVybiB3aGVyZSBleGlzdGluZyBjb25zdHJ1Y3RvcnMgaGF2ZSBiZWVuIGRvd25sZXZlbGVkIGZyb21cbiAqIEVTMjAxNSB0byBFUzUgdXNpbmcgVHlwZVNjcmlwdCB3LyBkb3dubGV2ZWwgaXRlcmF0aW9uLiBlLmcuXG4gKlxuICogYGBgXG4gKiAgIGZ1bmN0aW9uIE15Q2xhc3MoKSB7XG4gKiAgICAgdmFyIF90aGlzID0gX3N1cGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgfHwgdGhpcztcbiAqIGBgYFxuICpcbiAqIGRvd25sZXZlbGVkIHRvIEVTNSB3aXRoIGBkb3dubGV2ZWxJdGVyYXRpb25gIGZvciBUeXBlU2NyaXB0IDwgNC4yOlxuICogYGBgXG4gKiAgIGZ1bmN0aW9uIE15Q2xhc3MoKSB7XG4gKiAgICAgdmFyIF90aGlzID0gX3N1cGVyLmFwcGx5KHRoaXMsIF9fc3ByZWFkKGFyZ3VtZW50cykpIHx8IHRoaXM7XG4gKiBgYGBcbiAqXG4gKiBvciBkb3dubGV2ZWxlZCB0byBFUzUgd2l0aCBgZG93bmxldmVsSXRlcmF0aW9uYCBmb3IgVHlwZVNjcmlwdCA+PSA0LjI6XG4gKiBgYGBcbiAqICAgZnVuY3Rpb24gTXlDbGFzcygpIHtcbiAqICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuYXBwbHkodGhpcywgX19zcHJlYWRBcnJheShbXSwgX19yZWFkKGFyZ3VtZW50cykpKSB8fCB0aGlzO1xuICogYGBgXG4gKlxuICogTW9yZSBkZXRhaWxzIGNhbiBiZSBmb3VuZCBpbjogaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvMzg0NTMuXG4gKi9cbmV4cG9ydCBjb25zdCBFUzVfREVMRUdBVEVfQ1RPUiA9XG4gICAgL15mdW5jdGlvblxccytcXFMrXFwoXFwpXFxzKntbXFxzXFxTXStcXC5hcHBseVxcKHRoaXMsXFxzKihhcmd1bWVudHN8KD86W14oKV0rXFwoXFxbXFxdLCk/W14oKV0rXFwoYXJndW1lbnRzXFwpKVxcKS87XG4vKiogUmVndWxhciBleHByZXNzaW9uIHRoYXQgZGV0ZWN0cyBFUzIwMTUgY2xhc3NlcyB3aGljaCBleHRlbmQgZnJvbSBvdGhlciBjbGFzc2VzLiAqL1xuZXhwb3J0IGNvbnN0IEVTMjAxNV9JTkhFUklURURfQ0xBU1MgPSAvXmNsYXNzXFxzK1tBLVphLXpcXGQkX10qXFxzKmV4dGVuZHNcXHMrW157XSt7Lztcbi8qKlxuICogUmVndWxhciBleHByZXNzaW9uIHRoYXQgZGV0ZWN0cyBFUzIwMTUgY2xhc3NlcyB3aGljaCBleHRlbmQgZnJvbSBvdGhlciBjbGFzc2VzIGFuZFxuICogaGF2ZSBhbiBleHBsaWNpdCBjb25zdHJ1Y3RvciBkZWZpbmVkLlxuICovXG5leHBvcnQgY29uc3QgRVMyMDE1X0lOSEVSSVRFRF9DTEFTU19XSVRIX0NUT1IgPVxuICAgIC9eY2xhc3NcXHMrW0EtWmEtelxcZCRfXSpcXHMqZXh0ZW5kc1xccytbXntdK3tbXFxzXFxTXSpjb25zdHJ1Y3RvclxccypcXCgvO1xuLyoqXG4gKiBSZWd1bGFyIGV4cHJlc3Npb24gdGhhdCBkZXRlY3RzIEVTMjAxNSBjbGFzc2VzIHdoaWNoIGV4dGVuZCBmcm9tIG90aGVyIGNsYXNzZXNcbiAqIGFuZCBpbmhlcml0IGEgY29uc3RydWN0b3IuXG4gKi9cbmV4cG9ydCBjb25zdCBFUzIwMTVfSU5IRVJJVEVEX0NMQVNTX1dJVEhfREVMRUdBVEVfQ1RPUiA9XG4gICAgL15jbGFzc1xccytbQS1aYS16XFxkJF9dKlxccypleHRlbmRzXFxzK1tee10re1tcXHNcXFNdKmNvbnN0cnVjdG9yXFxzKlxcKFxcKVxccyp7XFxzKnN1cGVyXFwoXFwuXFwuXFwuYXJndW1lbnRzXFwpLztcblxuLyoqXG4gKiBEZXRlcm1pbmUgd2hldGhlciBhIHN0cmluZ2lmaWVkIHR5cGUgaXMgYSBjbGFzcyB3aGljaCBkZWxlZ2F0ZXMgaXRzIGNvbnN0cnVjdG9yXG4gKiB0byBpdHMgcGFyZW50LlxuICpcbiAqIFRoaXMgaXMgbm90IHRyaXZpYWwgc2luY2UgY29tcGlsZWQgY29kZSBjYW4gYWN0dWFsbHkgY29udGFpbiBhIGNvbnN0cnVjdG9yIGZ1bmN0aW9uXG4gKiBldmVuIGlmIHRoZSBvcmlnaW5hbCBzb3VyY2UgY29kZSBkaWQgbm90LiBGb3IgaW5zdGFuY2UsIHdoZW4gdGhlIGNoaWxkIGNsYXNzIGNvbnRhaW5zXG4gKiBhbiBpbml0aWFsaXplZCBpbnN0YW5jZSBwcm9wZXJ0eS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRGVsZWdhdGVDdG9yKHR5cGVTdHI6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gRVM1X0RFTEVHQVRFX0NUT1IudGVzdCh0eXBlU3RyKSB8fFxuICAgICAgRVMyMDE1X0lOSEVSSVRFRF9DTEFTU19XSVRIX0RFTEVHQVRFX0NUT1IudGVzdCh0eXBlU3RyKSB8fFxuICAgICAgKEVTMjAxNV9JTkhFUklURURfQ0xBU1MudGVzdCh0eXBlU3RyKSAmJiAhRVMyMDE1X0lOSEVSSVRFRF9DTEFTU19XSVRIX0NUT1IudGVzdCh0eXBlU3RyKSk7XG59XG5cbmV4cG9ydCBjbGFzcyBSZWZsZWN0aW9uQ2FwYWJpbGl0aWVzIGltcGxlbWVudHMgUGxhdGZvcm1SZWZsZWN0aW9uQ2FwYWJpbGl0aWVzIHtcbiAgcHJpdmF0ZSBfcmVmbGVjdDogYW55O1xuXG4gIGNvbnN0cnVjdG9yKHJlZmxlY3Q/OiBhbnkpIHtcbiAgICB0aGlzLl9yZWZsZWN0ID0gcmVmbGVjdCB8fCBnbG9iYWxbJ1JlZmxlY3QnXTtcbiAgfVxuXG4gIGlzUmVmbGVjdGlvbkVuYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBmYWN0b3J5PFQ+KHQ6IFR5cGU8VD4pOiAoYXJnczogYW55W10pID0+IFQge1xuICAgIHJldHVybiAoLi4uYXJnczogYW55W10pID0+IG5ldyB0KC4uLmFyZ3MpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfemlwVHlwZXNBbmRBbm5vdGF0aW9ucyhwYXJhbVR5cGVzOiBhbnlbXSwgcGFyYW1Bbm5vdGF0aW9uczogYW55W10pOiBhbnlbXVtdIHtcbiAgICBsZXQgcmVzdWx0OiBhbnlbXVtdO1xuXG4gICAgaWYgKHR5cGVvZiBwYXJhbVR5cGVzID09PSAndW5kZWZpbmVkJykge1xuICAgICAgcmVzdWx0ID0gbmV3QXJyYXkocGFyYW1Bbm5vdGF0aW9ucy5sZW5ndGgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQgPSBuZXdBcnJheShwYXJhbVR5cGVzLmxlbmd0aCk7XG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZXN1bHQubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vIFRTIG91dHB1dHMgT2JqZWN0IGZvciBwYXJhbWV0ZXJzIHdpdGhvdXQgdHlwZXMsIHdoaWxlIFRyYWNldXIgb21pdHNcbiAgICAgIC8vIHRoZSBhbm5vdGF0aW9ucy4gRm9yIG5vdyB3ZSBwcmVzZXJ2ZSB0aGUgVHJhY2V1ciBiZWhhdmlvciB0byBhaWRcbiAgICAgIC8vIG1pZ3JhdGlvbiwgYnV0IHRoaXMgY2FuIGJlIHJldmlzaXRlZC5cbiAgICAgIGlmICh0eXBlb2YgcGFyYW1UeXBlcyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmVzdWx0W2ldID0gW107XG4gICAgICB9IGVsc2UgaWYgKHBhcmFtVHlwZXNbaV0gJiYgcGFyYW1UeXBlc1tpXSAhPSBPYmplY3QpIHtcbiAgICAgICAgcmVzdWx0W2ldID0gW3BhcmFtVHlwZXNbaV1dO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0W2ldID0gW107XG4gICAgICB9XG4gICAgICBpZiAocGFyYW1Bbm5vdGF0aW9ucyAmJiBwYXJhbUFubm90YXRpb25zW2ldICE9IG51bGwpIHtcbiAgICAgICAgcmVzdWx0W2ldID0gcmVzdWx0W2ldLmNvbmNhdChwYXJhbUFubm90YXRpb25zW2ldKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHByaXZhdGUgX293blBhcmFtZXRlcnModHlwZTogVHlwZTxhbnk+LCBwYXJlbnRDdG9yOiBhbnkpOiBhbnlbXVtdfG51bGwge1xuICAgIGNvbnN0IHR5cGVTdHIgPSB0eXBlLnRvU3RyaW5nKCk7XG4gICAgLy8gSWYgd2UgaGF2ZSBubyBkZWNvcmF0b3JzLCB3ZSBvbmx5IGhhdmUgZnVuY3Rpb24ubGVuZ3RoIGFzIG1ldGFkYXRhLlxuICAgIC8vIEluIHRoYXQgY2FzZSwgdG8gZGV0ZWN0IHdoZXRoZXIgYSBjaGlsZCBjbGFzcyBkZWNsYXJlZCBhbiBvd24gY29uc3RydWN0b3Igb3Igbm90LFxuICAgIC8vIHdlIG5lZWQgdG8gbG9vayBpbnNpZGUgb2YgdGhhdCBjb25zdHJ1Y3RvciB0byBjaGVjayB3aGV0aGVyIGl0IGlzXG4gICAgLy8ganVzdCBjYWxsaW5nIHRoZSBwYXJlbnQuXG4gICAgLy8gVGhpcyBhbHNvIGhlbHBzIHRvIHdvcmsgYXJvdW5kIGZvciBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzEyNDM5XG4gICAgLy8gdGhhdCBzZXRzICdkZXNpZ246cGFyYW10eXBlcycgdG8gW11cbiAgICAvLyBpZiBhIGNsYXNzIGluaGVyaXRzIGZyb20gYW5vdGhlciBjbGFzcyBidXQgaGFzIG5vIGN0b3IgZGVjbGFyZWQgaXRzZWxmLlxuICAgIGlmIChpc0RlbGVnYXRlQ3Rvcih0eXBlU3RyKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gUHJlZmVyIHRoZSBkaXJlY3QgQVBJLlxuICAgIGlmICgoPGFueT50eXBlKS5wYXJhbWV0ZXJzICYmICg8YW55PnR5cGUpLnBhcmFtZXRlcnMgIT09IHBhcmVudEN0b3IucGFyYW1ldGVycykge1xuICAgICAgcmV0dXJuICg8YW55PnR5cGUpLnBhcmFtZXRlcnM7XG4gICAgfVxuXG4gICAgLy8gQVBJIG9mIHRzaWNrbGUgZm9yIGxvd2VyaW5nIGRlY29yYXRvcnMgdG8gcHJvcGVydGllcyBvbiB0aGUgY2xhc3MuXG4gICAgY29uc3QgdHNpY2tsZUN0b3JQYXJhbXMgPSAoPGFueT50eXBlKS5jdG9yUGFyYW1ldGVycztcbiAgICBpZiAodHNpY2tsZUN0b3JQYXJhbXMgJiYgdHNpY2tsZUN0b3JQYXJhbXMgIT09IHBhcmVudEN0b3IuY3RvclBhcmFtZXRlcnMpIHtcbiAgICAgIC8vIE5ld2VyIHRzaWNrbGUgdXNlcyBhIGZ1bmN0aW9uIGNsb3N1cmVcbiAgICAgIC8vIFJldGFpbiB0aGUgbm9uLWZ1bmN0aW9uIGNhc2UgZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBvbGRlciB0c2lja2xlXG4gICAgICBjb25zdCBjdG9yUGFyYW1ldGVycyA9XG4gICAgICAgICAgdHlwZW9mIHRzaWNrbGVDdG9yUGFyYW1zID09PSAnZnVuY3Rpb24nID8gdHNpY2tsZUN0b3JQYXJhbXMoKSA6IHRzaWNrbGVDdG9yUGFyYW1zO1xuICAgICAgY29uc3QgcGFyYW1UeXBlcyA9IGN0b3JQYXJhbWV0ZXJzLm1hcCgoY3RvclBhcmFtOiBhbnkpID0+IGN0b3JQYXJhbSAmJiBjdG9yUGFyYW0udHlwZSk7XG4gICAgICBjb25zdCBwYXJhbUFubm90YXRpb25zID0gY3RvclBhcmFtZXRlcnMubWFwKFxuICAgICAgICAgIChjdG9yUGFyYW06IGFueSkgPT5cbiAgICAgICAgICAgICAgY3RvclBhcmFtICYmIGNvbnZlcnRUc2lja2xlRGVjb3JhdG9ySW50b01ldGFkYXRhKGN0b3JQYXJhbS5kZWNvcmF0b3JzKSk7XG4gICAgICByZXR1cm4gdGhpcy5femlwVHlwZXNBbmRBbm5vdGF0aW9ucyhwYXJhbVR5cGVzLCBwYXJhbUFubm90YXRpb25zKTtcbiAgICB9XG5cbiAgICAvLyBBUEkgZm9yIG1ldGFkYXRhIGNyZWF0ZWQgYnkgaW52b2tpbmcgdGhlIGRlY29yYXRvcnMuXG4gICAgY29uc3QgcGFyYW1Bbm5vdGF0aW9ucyA9IHR5cGUuaGFzT3duUHJvcGVydHkoUEFSQU1FVEVSUykgJiYgKHR5cGUgYXMgYW55KVtQQVJBTUVURVJTXTtcbiAgICBjb25zdCBwYXJhbVR5cGVzID0gdGhpcy5fcmVmbGVjdCAmJiB0aGlzLl9yZWZsZWN0LmdldE93bk1ldGFkYXRhICYmXG4gICAgICAgIHRoaXMuX3JlZmxlY3QuZ2V0T3duTWV0YWRhdGEoJ2Rlc2lnbjpwYXJhbXR5cGVzJywgdHlwZSk7XG4gICAgaWYgKHBhcmFtVHlwZXMgfHwgcGFyYW1Bbm5vdGF0aW9ucykge1xuICAgICAgcmV0dXJuIHRoaXMuX3ppcFR5cGVzQW5kQW5ub3RhdGlvbnMocGFyYW1UeXBlcywgcGFyYW1Bbm5vdGF0aW9ucyk7XG4gICAgfVxuXG4gICAgLy8gSWYgYSBjbGFzcyBoYXMgbm8gZGVjb3JhdG9ycywgYXQgbGVhc3QgY3JlYXRlIG1ldGFkYXRhXG4gICAgLy8gYmFzZWQgb24gZnVuY3Rpb24ubGVuZ3RoLlxuICAgIC8vIE5vdGU6IFdlIGtub3cgdGhhdCB0aGlzIGlzIGEgcmVhbCBjb25zdHJ1Y3RvciBhcyB3ZSBjaGVja2VkXG4gICAgLy8gdGhlIGNvbnRlbnQgb2YgdGhlIGNvbnN0cnVjdG9yIGFib3ZlLlxuICAgIHJldHVybiBuZXdBcnJheTxhbnlbXT4odHlwZS5sZW5ndGgpO1xuICB9XG5cbiAgcGFyYW1ldGVycyh0eXBlOiBUeXBlPGFueT4pOiBhbnlbXVtdIHtcbiAgICAvLyBOb3RlOiBvbmx5IHJlcG9ydCBtZXRhZGF0YSBpZiB3ZSBoYXZlIGF0IGxlYXN0IG9uZSBjbGFzcyBkZWNvcmF0b3JcbiAgICAvLyB0byBzdGF5IGluIHN5bmMgd2l0aCB0aGUgc3RhdGljIHJlZmxlY3Rvci5cbiAgICBpZiAoIWlzVHlwZSh0eXBlKSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBjb25zdCBwYXJlbnRDdG9yID0gZ2V0UGFyZW50Q3Rvcih0eXBlKTtcbiAgICBsZXQgcGFyYW1ldGVycyA9IHRoaXMuX293blBhcmFtZXRlcnModHlwZSwgcGFyZW50Q3Rvcik7XG4gICAgaWYgKCFwYXJhbWV0ZXJzICYmIHBhcmVudEN0b3IgIT09IE9iamVjdCkge1xuICAgICAgcGFyYW1ldGVycyA9IHRoaXMucGFyYW1ldGVycyhwYXJlbnRDdG9yKTtcbiAgICB9XG4gICAgcmV0dXJuIHBhcmFtZXRlcnMgfHwgW107XG4gIH1cblxuICBwcml2YXRlIF9vd25Bbm5vdGF0aW9ucyh0eXBlT3JGdW5jOiBUeXBlPGFueT4sIHBhcmVudEN0b3I6IGFueSk6IGFueVtdfG51bGwge1xuICAgIC8vIFByZWZlciB0aGUgZGlyZWN0IEFQSS5cbiAgICBpZiAoKDxhbnk+dHlwZU9yRnVuYykuYW5ub3RhdGlvbnMgJiYgKDxhbnk+dHlwZU9yRnVuYykuYW5ub3RhdGlvbnMgIT09IHBhcmVudEN0b3IuYW5ub3RhdGlvbnMpIHtcbiAgICAgIGxldCBhbm5vdGF0aW9ucyA9ICg8YW55PnR5cGVPckZ1bmMpLmFubm90YXRpb25zO1xuICAgICAgaWYgKHR5cGVvZiBhbm5vdGF0aW9ucyA9PT0gJ2Z1bmN0aW9uJyAmJiBhbm5vdGF0aW9ucy5hbm5vdGF0aW9ucykge1xuICAgICAgICBhbm5vdGF0aW9ucyA9IGFubm90YXRpb25zLmFubm90YXRpb25zO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGFubm90YXRpb25zO1xuICAgIH1cblxuICAgIC8vIEFQSSBvZiB0c2lja2xlIGZvciBsb3dlcmluZyBkZWNvcmF0b3JzIHRvIHByb3BlcnRpZXMgb24gdGhlIGNsYXNzLlxuICAgIGlmICgoPGFueT50eXBlT3JGdW5jKS5kZWNvcmF0b3JzICYmICg8YW55PnR5cGVPckZ1bmMpLmRlY29yYXRvcnMgIT09IHBhcmVudEN0b3IuZGVjb3JhdG9ycykge1xuICAgICAgcmV0dXJuIGNvbnZlcnRUc2lja2xlRGVjb3JhdG9ySW50b01ldGFkYXRhKCg8YW55PnR5cGVPckZ1bmMpLmRlY29yYXRvcnMpO1xuICAgIH1cblxuICAgIC8vIEFQSSBmb3IgbWV0YWRhdGEgY3JlYXRlZCBieSBpbnZva2luZyB0aGUgZGVjb3JhdG9ycy5cbiAgICBpZiAodHlwZU9yRnVuYy5oYXNPd25Qcm9wZXJ0eShBTk5PVEFUSU9OUykpIHtcbiAgICAgIHJldHVybiAodHlwZU9yRnVuYyBhcyBhbnkpW0FOTk9UQVRJT05TXTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBhbm5vdGF0aW9ucyh0eXBlT3JGdW5jOiBUeXBlPGFueT4pOiBhbnlbXSB7XG4gICAgaWYgKCFpc1R5cGUodHlwZU9yRnVuYykpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgY29uc3QgcGFyZW50Q3RvciA9IGdldFBhcmVudEN0b3IodHlwZU9yRnVuYyk7XG4gICAgY29uc3Qgb3duQW5ub3RhdGlvbnMgPSB0aGlzLl9vd25Bbm5vdGF0aW9ucyh0eXBlT3JGdW5jLCBwYXJlbnRDdG9yKSB8fCBbXTtcbiAgICBjb25zdCBwYXJlbnRBbm5vdGF0aW9ucyA9IHBhcmVudEN0b3IgIT09IE9iamVjdCA/IHRoaXMuYW5ub3RhdGlvbnMocGFyZW50Q3RvcikgOiBbXTtcbiAgICByZXR1cm4gcGFyZW50QW5ub3RhdGlvbnMuY29uY2F0KG93bkFubm90YXRpb25zKTtcbiAgfVxuXG4gIHByaXZhdGUgX293blByb3BNZXRhZGF0YSh0eXBlT3JGdW5jOiBhbnksIHBhcmVudEN0b3I6IGFueSk6IHtba2V5OiBzdHJpbmddOiBhbnlbXX18bnVsbCB7XG4gICAgLy8gUHJlZmVyIHRoZSBkaXJlY3QgQVBJLlxuICAgIGlmICgoPGFueT50eXBlT3JGdW5jKS5wcm9wTWV0YWRhdGEgJiZcbiAgICAgICAgKDxhbnk+dHlwZU9yRnVuYykucHJvcE1ldGFkYXRhICE9PSBwYXJlbnRDdG9yLnByb3BNZXRhZGF0YSkge1xuICAgICAgbGV0IHByb3BNZXRhZGF0YSA9ICg8YW55PnR5cGVPckZ1bmMpLnByb3BNZXRhZGF0YTtcbiAgICAgIGlmICh0eXBlb2YgcHJvcE1ldGFkYXRhID09PSAnZnVuY3Rpb24nICYmIHByb3BNZXRhZGF0YS5wcm9wTWV0YWRhdGEpIHtcbiAgICAgICAgcHJvcE1ldGFkYXRhID0gcHJvcE1ldGFkYXRhLnByb3BNZXRhZGF0YTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwcm9wTWV0YWRhdGE7XG4gICAgfVxuXG4gICAgLy8gQVBJIG9mIHRzaWNrbGUgZm9yIGxvd2VyaW5nIGRlY29yYXRvcnMgdG8gcHJvcGVydGllcyBvbiB0aGUgY2xhc3MuXG4gICAgaWYgKCg8YW55PnR5cGVPckZ1bmMpLnByb3BEZWNvcmF0b3JzICYmXG4gICAgICAgICg8YW55PnR5cGVPckZ1bmMpLnByb3BEZWNvcmF0b3JzICE9PSBwYXJlbnRDdG9yLnByb3BEZWNvcmF0b3JzKSB7XG4gICAgICBjb25zdCBwcm9wRGVjb3JhdG9ycyA9ICg8YW55PnR5cGVPckZ1bmMpLnByb3BEZWNvcmF0b3JzO1xuICAgICAgY29uc3QgcHJvcE1ldGFkYXRhID0gPHtba2V5OiBzdHJpbmddOiBhbnlbXX0+e307XG4gICAgICBPYmplY3Qua2V5cyhwcm9wRGVjb3JhdG9ycykuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgICAgcHJvcE1ldGFkYXRhW3Byb3BdID0gY29udmVydFRzaWNrbGVEZWNvcmF0b3JJbnRvTWV0YWRhdGEocHJvcERlY29yYXRvcnNbcHJvcF0pO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gcHJvcE1ldGFkYXRhO1xuICAgIH1cblxuICAgIC8vIEFQSSBmb3IgbWV0YWRhdGEgY3JlYXRlZCBieSBpbnZva2luZyB0aGUgZGVjb3JhdG9ycy5cbiAgICBpZiAodHlwZU9yRnVuYy5oYXNPd25Qcm9wZXJ0eShQUk9QX01FVEFEQVRBKSkge1xuICAgICAgcmV0dXJuICh0eXBlT3JGdW5jIGFzIGFueSlbUFJPUF9NRVRBREFUQV07XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcHJvcE1ldGFkYXRhKHR5cGVPckZ1bmM6IGFueSk6IHtba2V5OiBzdHJpbmddOiBhbnlbXX0ge1xuICAgIGlmICghaXNUeXBlKHR5cGVPckZ1bmMpKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICAgIGNvbnN0IHBhcmVudEN0b3IgPSBnZXRQYXJlbnRDdG9yKHR5cGVPckZ1bmMpO1xuICAgIGNvbnN0IHByb3BNZXRhZGF0YToge1trZXk6IHN0cmluZ106IGFueVtdfSA9IHt9O1xuICAgIGlmIChwYXJlbnRDdG9yICE9PSBPYmplY3QpIHtcbiAgICAgIGNvbnN0IHBhcmVudFByb3BNZXRhZGF0YSA9IHRoaXMucHJvcE1ldGFkYXRhKHBhcmVudEN0b3IpO1xuICAgICAgT2JqZWN0LmtleXMocGFyZW50UHJvcE1ldGFkYXRhKS5mb3JFYWNoKChwcm9wTmFtZSkgPT4ge1xuICAgICAgICBwcm9wTWV0YWRhdGFbcHJvcE5hbWVdID0gcGFyZW50UHJvcE1ldGFkYXRhW3Byb3BOYW1lXTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBjb25zdCBvd25Qcm9wTWV0YWRhdGEgPSB0aGlzLl9vd25Qcm9wTWV0YWRhdGEodHlwZU9yRnVuYywgcGFyZW50Q3Rvcik7XG4gICAgaWYgKG93blByb3BNZXRhZGF0YSkge1xuICAgICAgT2JqZWN0LmtleXMob3duUHJvcE1ldGFkYXRhKS5mb3JFYWNoKChwcm9wTmFtZSkgPT4ge1xuICAgICAgICBjb25zdCBkZWNvcmF0b3JzOiBhbnlbXSA9IFtdO1xuICAgICAgICBpZiAocHJvcE1ldGFkYXRhLmhhc093blByb3BlcnR5KHByb3BOYW1lKSkge1xuICAgICAgICAgIGRlY29yYXRvcnMucHVzaCguLi5wcm9wTWV0YWRhdGFbcHJvcE5hbWVdKTtcbiAgICAgICAgfVxuICAgICAgICBkZWNvcmF0b3JzLnB1c2goLi4ub3duUHJvcE1ldGFkYXRhW3Byb3BOYW1lXSk7XG4gICAgICAgIHByb3BNZXRhZGF0YVtwcm9wTmFtZV0gPSBkZWNvcmF0b3JzO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBwcm9wTWV0YWRhdGE7XG4gIH1cblxuICBvd25Qcm9wTWV0YWRhdGEodHlwZU9yRnVuYzogYW55KToge1trZXk6IHN0cmluZ106IGFueVtdfSB7XG4gICAgaWYgKCFpc1R5cGUodHlwZU9yRnVuYykpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX293blByb3BNZXRhZGF0YSh0eXBlT3JGdW5jLCBnZXRQYXJlbnRDdG9yKHR5cGVPckZ1bmMpKSB8fCB7fTtcbiAgfVxuXG4gIGhhc0xpZmVjeWNsZUhvb2sodHlwZTogYW55LCBsY1Byb3BlcnR5OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdHlwZSBpbnN0YW5jZW9mIFR5cGUgJiYgbGNQcm9wZXJ0eSBpbiB0eXBlLnByb3RvdHlwZTtcbiAgfVxuXG4gIGd1YXJkcyh0eXBlOiBhbnkpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgcmV0dXJuIHt9O1xuICB9XG5cbiAgZ2V0dGVyKG5hbWU6IHN0cmluZyk6IEdldHRlckZuIHtcbiAgICByZXR1cm4gPEdldHRlckZuPm5ldyBGdW5jdGlvbignbycsICdyZXR1cm4gby4nICsgbmFtZSArICc7Jyk7XG4gIH1cblxuICBzZXR0ZXIobmFtZTogc3RyaW5nKTogU2V0dGVyRm4ge1xuICAgIHJldHVybiA8U2V0dGVyRm4+bmV3IEZ1bmN0aW9uKCdvJywgJ3YnLCAncmV0dXJuIG8uJyArIG5hbWUgKyAnID0gdjsnKTtcbiAgfVxuXG4gIG1ldGhvZChuYW1lOiBzdHJpbmcpOiBNZXRob2RGbiB7XG4gICAgY29uc3QgZnVuY3Rpb25Cb2R5ID0gYGlmICghby4ke25hbWV9KSB0aHJvdyBuZXcgRXJyb3IoJ1wiJHtuYW1lfVwiIGlzIHVuZGVmaW5lZCcpO1xuICAgICAgICByZXR1cm4gby4ke25hbWV9LmFwcGx5KG8sIGFyZ3MpO2A7XG4gICAgcmV0dXJuIDxNZXRob2RGbj5uZXcgRnVuY3Rpb24oJ28nLCAnYXJncycsIGZ1bmN0aW9uQm9keSk7XG4gIH1cblxuICAvLyBUaGVyZSBpcyBub3QgYSBjb25jZXB0IG9mIGltcG9ydCB1cmkgaW4gSnMsIGJ1dCB0aGlzIGlzIHVzZWZ1bCBpbiBkZXZlbG9waW5nIERhcnQgYXBwbGljYXRpb25zLlxuICBpbXBvcnRVcmkodHlwZTogYW55KTogc3RyaW5nIHtcbiAgICAvLyBTdGF0aWNTeW1ib2xcbiAgICBpZiAodHlwZW9mIHR5cGUgPT09ICdvYmplY3QnICYmIHR5cGVbJ2ZpbGVQYXRoJ10pIHtcbiAgICAgIHJldHVybiB0eXBlWydmaWxlUGF0aCddO1xuICAgIH1cbiAgICAvLyBSdW50aW1lIHR5cGVcbiAgICByZXR1cm4gYC4vJHtzdHJpbmdpZnkodHlwZSl9YDtcbiAgfVxuXG4gIHJlc291cmNlVXJpKHR5cGU6IGFueSk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAuLyR7c3RyaW5naWZ5KHR5cGUpfWA7XG4gIH1cblxuICByZXNvbHZlSWRlbnRpZmllcihuYW1lOiBzdHJpbmcsIG1vZHVsZVVybDogc3RyaW5nLCBtZW1iZXJzOiBzdHJpbmdbXSwgcnVudGltZTogYW55KTogYW55IHtcbiAgICByZXR1cm4gcnVudGltZTtcbiAgfVxuICByZXNvbHZlRW51bShlbnVtSWRlbnRpZmllcjogYW55LCBuYW1lOiBzdHJpbmcpOiBhbnkge1xuICAgIHJldHVybiBlbnVtSWRlbnRpZmllcltuYW1lXTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjb252ZXJ0VHNpY2tsZURlY29yYXRvckludG9NZXRhZGF0YShkZWNvcmF0b3JJbnZvY2F0aW9uczogYW55W10pOiBhbnlbXSB7XG4gIGlmICghZGVjb3JhdG9ySW52b2NhdGlvbnMpIHtcbiAgICByZXR1cm4gW107XG4gIH1cbiAgcmV0dXJuIGRlY29yYXRvckludm9jYXRpb25zLm1hcChkZWNvcmF0b3JJbnZvY2F0aW9uID0+IHtcbiAgICBjb25zdCBkZWNvcmF0b3JUeXBlID0gZGVjb3JhdG9ySW52b2NhdGlvbi50eXBlO1xuICAgIGNvbnN0IGFubm90YXRpb25DbHMgPSBkZWNvcmF0b3JUeXBlLmFubm90YXRpb25DbHM7XG4gICAgY29uc3QgYW5ub3RhdGlvbkFyZ3MgPSBkZWNvcmF0b3JJbnZvY2F0aW9uLmFyZ3MgPyBkZWNvcmF0b3JJbnZvY2F0aW9uLmFyZ3MgOiBbXTtcbiAgICByZXR1cm4gbmV3IGFubm90YXRpb25DbHMoLi4uYW5ub3RhdGlvbkFyZ3MpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0UGFyZW50Q3RvcihjdG9yOiBGdW5jdGlvbik6IFR5cGU8YW55PiB7XG4gIGNvbnN0IHBhcmVudFByb3RvID0gY3Rvci5wcm90b3R5cGUgPyBPYmplY3QuZ2V0UHJvdG90eXBlT2YoY3Rvci5wcm90b3R5cGUpIDogbnVsbDtcbiAgY29uc3QgcGFyZW50Q3RvciA9IHBhcmVudFByb3RvID8gcGFyZW50UHJvdG8uY29uc3RydWN0b3IgOiBudWxsO1xuICAvLyBOb3RlOiBXZSBhbHdheXMgdXNlIGBPYmplY3RgIGFzIHRoZSBudWxsIHZhbHVlXG4gIC8vIHRvIHNpbXBsaWZ5IGNoZWNraW5nIGxhdGVyIG9uLlxuICByZXR1cm4gcGFyZW50Q3RvciB8fCBPYmplY3Q7XG59XG4iXX0=