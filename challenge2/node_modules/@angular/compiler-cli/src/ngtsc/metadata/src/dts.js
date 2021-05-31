/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngtsc/metadata/src/dts", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/imports", "@angular/compiler-cli/src/ngtsc/reflection", "@angular/compiler-cli/src/ngtsc/metadata/src/property_mapping", "@angular/compiler-cli/src/ngtsc/metadata/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DtsMetadataReader = void 0;
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var imports_1 = require("@angular/compiler-cli/src/ngtsc/imports");
    var reflection_1 = require("@angular/compiler-cli/src/ngtsc/reflection");
    var property_mapping_1 = require("@angular/compiler-cli/src/ngtsc/metadata/src/property_mapping");
    var util_1 = require("@angular/compiler-cli/src/ngtsc/metadata/src/util");
    /**
     * A `MetadataReader` that can read metadata from `.d.ts` files, which have static Ivy properties
     * from an upstream compilation already.
     */
    var DtsMetadataReader = /** @class */ (function () {
        function DtsMetadataReader(checker, reflector) {
            this.checker = checker;
            this.reflector = reflector;
        }
        /**
         * Read the metadata from a class that has already been compiled somehow (either it's in a .d.ts
         * file, or in a .ts file with a handwritten definition).
         *
         * @param ref `Reference` to the class of interest, with the context of how it was obtained.
         */
        DtsMetadataReader.prototype.getNgModuleMetadata = function (ref) {
            var clazz = ref.node;
            var resolutionContext = clazz.getSourceFile().fileName;
            // This operation is explicitly not memoized, as it depends on `ref.ownedByModuleGuess`.
            // TODO(alxhub): investigate caching of .d.ts module metadata.
            var ngModuleDef = this.reflector.getMembersOfClass(clazz).find(function (member) { return member.name === 'ɵmod' && member.isStatic; });
            if (ngModuleDef === undefined) {
                return null;
            }
            else if (
            // Validate that the shape of the ngModuleDef type is correct.
            ngModuleDef.type === null || !ts.isTypeReferenceNode(ngModuleDef.type) ||
                ngModuleDef.type.typeArguments === undefined ||
                ngModuleDef.type.typeArguments.length !== 4) {
                return null;
            }
            // Read the ModuleData out of the type arguments.
            var _a = tslib_1.__read(ngModuleDef.type.typeArguments, 4), _ = _a[0], declarationMetadata = _a[1], importMetadata = _a[2], exportMetadata = _a[3];
            return {
                ref: ref,
                declarations: util_1.extractReferencesFromType(this.checker, declarationMetadata, ref.ownedByModuleGuess, resolutionContext),
                exports: util_1.extractReferencesFromType(this.checker, exportMetadata, ref.ownedByModuleGuess, resolutionContext),
                imports: util_1.extractReferencesFromType(this.checker, importMetadata, ref.ownedByModuleGuess, resolutionContext),
                schemas: [],
                rawDeclarations: null,
            };
        };
        /**
         * Read directive (or component) metadata from a referenced class in a .d.ts file.
         */
        DtsMetadataReader.prototype.getDirectiveMetadata = function (ref) {
            var clazz = ref.node;
            var def = this.reflector.getMembersOfClass(clazz).find(function (field) { return field.isStatic && (field.name === 'ɵcmp' || field.name === 'ɵdir'); });
            if (def === undefined) {
                // No definition could be found.
                return null;
            }
            else if (def.type === null || !ts.isTypeReferenceNode(def.type) ||
                def.type.typeArguments === undefined || def.type.typeArguments.length < 2) {
                // The type metadata was the wrong shape.
                return null;
            }
            var isComponent = def.name === 'ɵcmp';
            var ctorParams = this.reflector.getConstructorParameters(clazz);
            // A directive is considered to be structural if:
            // 1) it's a directive, not a component, and
            // 2) it injects `TemplateRef`
            var isStructural = !isComponent && ctorParams !== null && ctorParams.some(function (param) {
                return param.typeValueReference.kind === 1 /* IMPORTED */ &&
                    param.typeValueReference.moduleName === '@angular/core' &&
                    param.typeValueReference.importedName === 'TemplateRef';
            });
            var inputs = property_mapping_1.ClassPropertyMapping.fromMappedObject(util_1.readStringMapType(def.type.typeArguments[3]));
            var outputs = property_mapping_1.ClassPropertyMapping.fromMappedObject(util_1.readStringMapType(def.type.typeArguments[4]));
            return tslib_1.__assign(tslib_1.__assign({ ref: ref, name: clazz.name.text, isComponent: isComponent, selector: util_1.readStringType(def.type.typeArguments[1]), exportAs: util_1.readStringArrayType(def.type.typeArguments[2]), inputs: inputs,
                outputs: outputs, queries: util_1.readStringArrayType(def.type.typeArguments[5]) }, util_1.extractDirectiveTypeCheckMeta(clazz, inputs, this.reflector)), { baseClass: readBaseClass(clazz, this.checker, this.reflector), isPoisoned: false, isStructural: isStructural });
        };
        /**
         * Read pipe metadata from a referenced class in a .d.ts file.
         */
        DtsMetadataReader.prototype.getPipeMetadata = function (ref) {
            var def = this.reflector.getMembersOfClass(ref.node).find(function (field) { return field.isStatic && field.name === 'ɵpipe'; });
            if (def === undefined) {
                // No definition could be found.
                return null;
            }
            else if (def.type === null || !ts.isTypeReferenceNode(def.type) ||
                def.type.typeArguments === undefined || def.type.typeArguments.length < 2) {
                // The type metadata was the wrong shape.
                return null;
            }
            var type = def.type.typeArguments[1];
            if (!ts.isLiteralTypeNode(type) || !ts.isStringLiteral(type.literal)) {
                // The type metadata was the wrong type.
                return null;
            }
            var name = type.literal.text;
            return { ref: ref, name: name };
        };
        return DtsMetadataReader;
    }());
    exports.DtsMetadataReader = DtsMetadataReader;
    function readBaseClass(clazz, checker, reflector) {
        var e_1, _a;
        if (!reflection_1.isNamedClassDeclaration(clazz)) {
            // Technically this is an error in a .d.ts file, but for the purposes of finding the base class
            // it's ignored.
            return reflector.hasBaseClass(clazz) ? 'dynamic' : null;
        }
        if (clazz.heritageClauses !== undefined) {
            try {
                for (var _b = tslib_1.__values(clazz.heritageClauses), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var clause = _c.value;
                    if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
                        var baseExpr = clause.types[0].expression;
                        var symbol = checker.getSymbolAtLocation(baseExpr);
                        if (symbol === undefined) {
                            return 'dynamic';
                        }
                        else if (symbol.flags & ts.SymbolFlags.Alias) {
                            symbol = checker.getAliasedSymbol(symbol);
                        }
                        if (symbol.valueDeclaration !== undefined &&
                            reflection_1.isNamedClassDeclaration(symbol.valueDeclaration)) {
                            return new imports_1.Reference(symbol.valueDeclaration);
                        }
                        else {
                            return 'dynamic';
                        }
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        return null;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9uZ3RzYy9tZXRhZGF0YS9zcmMvZHRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCwrQkFBaUM7SUFFakMsbUVBQXdDO0lBQ3hDLHlFQUFtSDtJQUduSCxrR0FBd0Q7SUFDeEQsMEVBQXdJO0lBRXhJOzs7T0FHRztJQUNIO1FBQ0UsMkJBQW9CLE9BQXVCLEVBQVUsU0FBeUI7WUFBMUQsWUFBTyxHQUFQLE9BQU8sQ0FBZ0I7WUFBVSxjQUFTLEdBQVQsU0FBUyxDQUFnQjtRQUFHLENBQUM7UUFFbEY7Ozs7O1dBS0c7UUFDSCwrQ0FBbUIsR0FBbkIsVUFBb0IsR0FBZ0M7WUFDbEQsSUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQztZQUN2QixJQUFNLGlCQUFpQixHQUFHLEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQyxRQUFRLENBQUM7WUFDekQsd0ZBQXdGO1lBQ3hGLDhEQUE4RDtZQUM5RCxJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FDNUQsVUFBQSxNQUFNLElBQUksT0FBQSxNQUFNLENBQUMsSUFBSSxLQUFLLE1BQU0sSUFBSSxNQUFNLENBQUMsUUFBUSxFQUF6QyxDQUF5QyxDQUFDLENBQUM7WUFDekQsSUFBSSxXQUFXLEtBQUssU0FBUyxFQUFFO2dCQUM3QixPQUFPLElBQUksQ0FBQzthQUNiO2lCQUFNO1lBQ0gsOERBQThEO1lBQzlELFdBQVcsQ0FBQyxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUM7Z0JBQ3RFLFdBQVcsQ0FBQyxJQUFJLENBQUMsYUFBYSxLQUFLLFNBQVM7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QUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQzt3QkFDNUMsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxDQUFDO3dCQUNuRCxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7NEJBQ3hCLE9BQU8sU0FBUyxDQUFDO3lCQUNsQjs2QkFBTSxJQUFJLE1BQU0sQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUU7NEJBQzlDLE1BQU0sR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7eUJBQzNDO3dCQUNELElBQUksTUFBTSxDQUFDLGdCQUFnQixLQUFLLFNBQVM7NEJBQ3JDLG9DQUF1QixDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFOzRCQUNwRCxPQUFPLElBQUksbUJBQVMsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzt5QkFDL0M7NkJBQU07NEJBQ0wsT0FBTyxTQUFTLENBQUM7eUJBQ2xCO3FCQUNGO2lCQUNGOzs7Ozs7Ozs7U0FDRjtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtSZWZlcmVuY2V9IGZyb20gJy4uLy4uL2ltcG9ydHMnO1xuaW1wb3J0IHtDbGFzc0RlY2xhcmF0aW9uLCBpc05hbWVkQ2xhc3NEZWNsYXJhdGlvbiwgUmVmbGVjdGlvbkhvc3QsIFR5cGVWYWx1ZVJlZmVyZW5jZUtpbmR9IGZyb20gJy4uLy4uL3JlZmxlY3Rpb24nO1xuXG5pbXBvcnQge0RpcmVjdGl2ZU1ldGEsIE1ldGFkYXRhUmVhZGVyLCBOZ01vZHVsZU1ldGEsIFBpcGVNZXRhfSBmcm9tICcuL2FwaSc7XG5pbXBvcnQge0NsYXNzUHJvcGVydHlNYXBwaW5nfSBmcm9tICcuL3Byb3BlcnR5X21hcHBpbmcnO1xuaW1wb3J0IHtleHRyYWN0RGlyZWN0aXZlVHlwZUNoZWNrTWV0YSwgZXh0cmFjdFJlZmVyZW5jZXNGcm9tVHlwZSwgcmVhZFN0cmluZ0FycmF5VHlwZSwgcmVhZFN0cmluZ01hcFR5cGUsIHJlYWRTdHJpbmdUeXBlfSBmcm9tICcuL3V0aWwnO1xuXG4vKipcbiAqIEEgYE1ldGFkYXRhUmVhZGVyYCB0aGF0IGNhbiByZWFkIG1ldGFkYXRhIGZyb20gYC5kLnRzYCBmaWxlcywgd2hpY2ggaGF2ZSBzdGF0aWMgSXZ5IHByb3BlcnRpZXNcbiAqIGZyb20gYW4gdXBzdHJlYW0gY29tcGlsYXRpb24gYWxyZWFkeS5cbiAqL1xuZXhwb3J0IGNsYXNzIER0c01ldGFkYXRhUmVhZGVyIGltcGxlbWVudHMgTWV0YWRhdGFSZWFkZXIge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGNoZWNrZXI6IHRzLlR5cGVDaGVja2VyLCBwcml2YXRlIHJlZmxlY3RvcjogUmVmbGVjdGlvbkhvc3QpIHt9XG5cbiAgLyoqXG4gICAqIFJlYWQgdGhlIG1ldGFkYXRhIGZyb20gYSBjbGFzcyB0aGF0IGhhcyBhbHJlYWR5IGJlZW4gY29tcGlsZWQgc29tZWhvdyAoZWl0aGVyIGl0J3MgaW4gYSAuZC50c1xuICAgKiBmaWxlLCBvciBpbiBhIC50cyBmaWxlIHdpdGggYSBoYW5kd3JpdHRlbiBkZWZpbml0aW9uKS5cbiAgICpcbiAgICogQHBhcmFtIHJlZiBgUmVmZXJlbmNlYCB0byB0aGUgY2xhc3Mgb2YgaW50ZXJlc3QsIHdpdGggdGhlIGNvbnRleHQgb2YgaG93IGl0IHdhcyBvYnRhaW5lZC5cbiAgICovXG4gIGdldE5nTW9kdWxlTWV0YWRhdGEocmVmOiBSZWZlcmVuY2U8Q2xhc3NEZWNsYXJhdGlvbj4pOiBOZ01vZHVsZU1ldGF8bnVsbCB7XG4gICAgY29uc3QgY2xhenogPSByZWYubm9kZTtcbiAgICBjb25zdCByZXNvbHV0aW9uQ29udGV4dCA9IGNsYXp6LmdldFNvdXJjZUZpbGUoKS5maWxlTmFtZTtcbiAgICAvLyBUaGlzIG9wZXJhdGlvbiBpcyBleHBsaWNpdGx5IG5vdCBtZW1vaXplZCwgYXMgaXQgZGVwZW5kcyBvbiBgcmVmLm93bmVkQnlNb2R1bGVHdWVzc2AuXG4gICAgLy8gVE9ETyhhbHhodWIpOiBpbnZlc3RpZ2F0ZSBjYWNoaW5nIG9mIC5kLnRzIG1vZHVsZSBtZXRhZGF0YS5cbiAgICBjb25zdCBuZ01vZHVsZURlZiA9IHRoaXMucmVmbGVjdG9yLmdldE1lbWJlcnNPZkNsYXNzKGNsYXp6KS5maW5kKFxuICAgICAgICBtZW1iZXIgPT4gbWVtYmVyLm5hbWUgPT09ICfJtW1vZCcgJiYgbWVtYmVyLmlzU3RhdGljKTtcbiAgICBpZiAobmdNb2R1bGVEZWYgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSBlbHNlIGlmIChcbiAgICAgICAgLy8gVmFsaWRhdGUgdGhhdCB0aGUgc2hhcGUgb2YgdGhlIG5nTW9kdWxlRGVmIHR5cGUgaXMgY29ycmVjdC5cbiAgICAgICAgbmdNb2R1bGVEZWYudHlwZSA9PT0gbnVsbCB8fCAhdHMuaXNUeXBlUmVmZXJlbmNlTm9kZShuZ01vZHVsZURlZi50eXBlKSB8fFxuICAgICAgICBuZ01vZHVsZURlZi50eXBlLnR5cGVBcmd1bWVudHMgPT09IHVuZGVmaW5lZCB8fFxuICAgICAgICBuZ01vZHVsZURlZi50eXBlLnR5cGVBcmd1bWVudHMubGVuZ3RoICE9PSA0KSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBSZWFkIHRoZSBNb2R1bGVEYXRhIG91dCBvZiB0aGUgdHlwZSBhcmd1bWVudHMuXG4gICAgY29uc3QgW18sIGRlY2xhcmF0aW9uTWV0YWRhdGEsIGltcG9ydE1ldGFkYXRhLCBleHBvcnRNZXRhZGF0YV0gPSBuZ01vZHVsZURlZi50eXBlLnR5cGVBcmd1bWVudHM7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlZixcbiAgICAgIGRlY2xhcmF0aW9uczogZXh0cmFjdFJlZmVyZW5jZXNGcm9tVHlwZShcbiAgICAgICAgICB0aGlzLmNoZWNrZXIsIGRlY2xhcmF0aW9uTWV0YWRhdGEsIHJlZi5vd25lZEJ5TW9kdWxlR3Vlc3MsIHJlc29sdXRpb25Db250ZXh0KSxcbiAgICAgIGV4cG9ydHM6IGV4dHJhY3RSZWZlcmVuY2VzRnJvbVR5cGUoXG4gICAgICAgICAgdGhpcy5jaGVja2VyLCBleHBvcnRNZXRhZGF0YSwgcmVmLm93bmVkQnlNb2R1bGVHdWVzcywgcmVzb2x1dGlvbkNvbnRleHQpLFxuICAgICAgaW1wb3J0czogZXh0cmFjdFJlZmVyZW5jZXNGcm9tVHlwZShcbiAgICAgICAgICB0aGlzLmNoZWNrZXIsIGltcG9ydE1ldGFkYXRhLCByZWYub3duZWRCeU1vZHVsZUd1ZXNzLCByZXNvbHV0aW9uQ29udGV4dCksXG4gICAgICBzY2hlbWFzOiBbXSxcbiAgICAgIHJhd0RlY2xhcmF0aW9uczogbnVsbCxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFJlYWQgZGlyZWN0aXZlIChvciBjb21wb25lbnQpIG1ldGFkYXRhIGZyb20gYSByZWZlcmVuY2VkIGNsYXNzIGluIGEgLmQudHMgZmlsZS5cbiAgICovXG4gIGdldERpcmVjdGl2ZU1ldGFkYXRhKHJlZjogUmVmZXJlbmNlPENsYXNzRGVjbGFyYXRpb24+KTogRGlyZWN0aXZlTWV0YXxudWxsIHtcbiAgICBjb25zdCBjbGF6eiA9IHJlZi5ub2RlO1xuICAgIGNvbnN0IGRlZiA9IHRoaXMucmVmbGVjdG9yLmdldE1lbWJlcnNPZkNsYXNzKGNsYXp6KS5maW5kKFxuICAgICAgICBmaWVsZCA9PiBmaWVsZC5pc1N0YXRpYyAmJiAoZmllbGQubmFtZSA9PT0gJ8m1Y21wJyB8fCBmaWVsZC5uYW1lID09PSAnybVkaXInKSk7XG4gICAgaWYgKGRlZiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBObyBkZWZpbml0aW9uIGNvdWxkIGJlIGZvdW5kLlxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSBlbHNlIGlmIChcbiAgICAgICAgZGVmLnR5cGUgPT09IG51bGwgfHwgIXRzLmlzVHlwZVJlZmVyZW5jZU5vZGUoZGVmLnR5cGUpIHx8XG4gICAgICAgIGRlZi50eXBlLnR5cGVBcmd1bWVudHMgPT09IHVuZGVmaW5lZCB8fCBkZWYudHlwZS50eXBlQXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICAgIC8vIFRoZSB0eXBlIG1ldGFkYXRhIHdhcyB0aGUgd3Jvbmcgc2hhcGUuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBpc0NvbXBvbmVudCA9IGRlZi5uYW1lID09PSAnybVjbXAnO1xuXG4gICAgY29uc3QgY3RvclBhcmFtcyA9IHRoaXMucmVmbGVjdG9yLmdldENvbnN0cnVjdG9yUGFyYW1ldGVycyhjbGF6eik7XG5cbiAgICAvLyBBIGRpcmVjdGl2ZSBpcyBjb25zaWRlcmVkIHRvIGJlIHN0cnVjdHVyYWwgaWY6XG4gICAgLy8gMSkgaXQncyBhIGRpcmVjdGl2ZSwgbm90IGEgY29tcG9uZW50LCBhbmRcbiAgICAvLyAyKSBpdCBpbmplY3RzIGBUZW1wbGF0ZVJlZmBcbiAgICBjb25zdCBpc1N0cnVjdHVyYWwgPSAhaXNDb21wb25lbnQgJiYgY3RvclBhcmFtcyAhPT0gbnVsbCAmJiBjdG9yUGFyYW1zLnNvbWUocGFyYW0gPT4ge1xuICAgICAgcmV0dXJuIHBhcmFtLnR5cGVWYWx1ZVJlZmVyZW5jZS5raW5kID09PSBUeXBlVmFsdWVSZWZlcmVuY2VLaW5kLklNUE9SVEVEICYmXG4gICAgICAgICAgcGFyYW0udHlwZVZhbHVlUmVmZXJlbmNlLm1vZHVsZU5hbWUgPT09ICdAYW5ndWxhci9jb3JlJyAmJlxuICAgICAgICAgIHBhcmFtLnR5cGVWYWx1ZVJlZmVyZW5jZS5pbXBvcnRlZE5hbWUgPT09ICdUZW1wbGF0ZVJlZic7XG4gICAgfSk7XG5cbiAgICBjb25zdCBpbnB1dHMgPVxuICAgICAgICBDbGFzc1Byb3BlcnR5TWFwcGluZy5mcm9tTWFwcGVkT2JqZWN0KHJlYWRTdHJpbmdNYXBUeXBlKGRlZi50eXBlLnR5cGVBcmd1bWVudHNbM10pKTtcbiAgICBjb25zdCBvdXRwdXRzID1cbiAgICAgICAgQ2xhc3NQcm9wZXJ0eU1hcHBpbmcuZnJvbU1hcHBlZE9iamVjdChyZWFkU3RyaW5nTWFwVHlwZShkZWYudHlwZS50eXBlQXJndW1lbnRzWzRdKSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlZixcbiAgICAgIG5hbWU6IGNsYXp6Lm5hbWUudGV4dCxcbiAgICAgIGlzQ29tcG9uZW50LFxuICAgICAgc2VsZWN0b3I6IHJlYWRTdHJpbmdUeXBlKGRlZi50eXBlLnR5cGVBcmd1bWVudHNbMV0pLFxuICAgICAgZXhwb3J0QXM6IHJlYWRTdHJpbmdBcnJheVR5cGUoZGVmLnR5cGUudHlwZUFyZ3VtZW50c1syXSksXG4gICAgICBpbnB1dHMsXG4gICAgICBvdXRwdXRzLFxuICAgICAgcXVlcmllczogcmVhZFN0cmluZ0FycmF5VHlwZShkZWYudHlwZS50eXBlQXJndW1lbnRzWzVdKSxcbiAgICAgIC4uLmV4dHJhY3REaXJlY3RpdmVUeXBlQ2hlY2tNZXRhKGNsYXp6LCBpbnB1dHMsIHRoaXMucmVmbGVjdG9yKSxcbiAgICAgIGJhc2VDbGFzczogcmVhZEJhc2VDbGFzcyhjbGF6eiwgdGhpcy5jaGVja2VyLCB0aGlzLnJlZmxlY3RvciksXG4gICAgICBpc1BvaXNvbmVkOiBmYWxzZSxcbiAgICAgIGlzU3RydWN0dXJhbCxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFJlYWQgcGlwZSBtZXRhZGF0YSBmcm9tIGEgcmVmZXJlbmNlZCBjbGFzcyBpbiBhIC5kLnRzIGZpbGUuXG4gICAqL1xuICBnZXRQaXBlTWV0YWRhdGEocmVmOiBSZWZlcmVuY2U8Q2xhc3NEZWNsYXJhdGlvbj4pOiBQaXBlTWV0YXxudWxsIHtcbiAgICBjb25zdCBkZWYgPSB0aGlzLnJlZmxlY3Rvci5nZXRNZW1iZXJzT2ZDbGFzcyhyZWYubm9kZSkuZmluZChcbiAgICAgICAgZmllbGQgPT4gZmllbGQuaXNTdGF0aWMgJiYgZmllbGQubmFtZSA9PT0gJ8m1cGlwZScpO1xuICAgIGlmIChkZWYgPT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8gTm8gZGVmaW5pdGlvbiBjb3VsZCBiZSBmb3VuZC5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICAgIGRlZi50eXBlID09PSBudWxsIHx8ICF0cy5pc1R5cGVSZWZlcmVuY2VOb2RlKGRlZi50eXBlKSB8fFxuICAgICAgICBkZWYudHlwZS50eXBlQXJndW1lbnRzID09PSB1bmRlZmluZWQgfHwgZGVmLnR5cGUudHlwZUFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgICAvLyBUaGUgdHlwZSBtZXRhZGF0YSB3YXMgdGhlIHdyb25nIHNoYXBlLlxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHR5cGUgPSBkZWYudHlwZS50eXBlQXJndW1lbnRzWzFdO1xuICAgIGlmICghdHMuaXNMaXRlcmFsVHlwZU5vZGUodHlwZSkgfHwgIXRzLmlzU3RyaW5nTGl0ZXJhbCh0eXBlLmxpdGVyYWwpKSB7XG4gICAgICAvLyBUaGUgdHlwZSBtZXRhZGF0YSB3YXMgdGhlIHdyb25nIHR5cGUuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgbmFtZSA9IHR5cGUubGl0ZXJhbC50ZXh0O1xuICAgIHJldHVybiB7cmVmLCBuYW1lfTtcbiAgfVxufVxuXG5mdW5jdGlvbiByZWFkQmFzZUNsYXNzKGNsYXp6OiBDbGFzc0RlY2xhcmF0aW9uLCBjaGVja2VyOiB0cy5UeXBlQ2hlY2tlciwgcmVmbGVjdG9yOiBSZWZsZWN0aW9uSG9zdCk6XG4gICAgUmVmZXJlbmNlPENsYXNzRGVjbGFyYXRpb24+fCdkeW5hbWljJ3xudWxsIHtcbiAgaWYgKCFpc05hbWVkQ2xhc3NEZWNsYXJhdGlvbihjbGF6eikpIHtcbiAgICAvLyBUZWNobmljYWxseSB0aGlzIGlzIGFuIGVycm9yIGluIGEgLmQudHMgZmlsZSwgYnV0IGZvciB0aGUgcHVycG9zZXMgb2YgZmluZGluZyB0aGUgYmFzZSBjbGFzc1xuICAgIC8vIGl0J3MgaWdub3JlZC5cbiAgICByZXR1cm4gcmVmbGVjdG9yLmhhc0Jhc2VDbGFzcyhjbGF6eikgPyAnZHluYW1pYycgOiBudWxsO1xuICB9XG5cbiAgaWYgKGNsYXp6Lmhlcml0YWdlQ2xhdXNlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgZm9yIChjb25zdCBjbGF1c2Ugb2YgY2xhenouaGVyaXRhZ2VDbGF1c2VzKSB7XG4gICAgICBpZiAoY2xhdXNlLnRva2VuID09PSB0cy5TeW50YXhLaW5kLkV4dGVuZHNLZXl3b3JkKSB7XG4gICAgICAgIGNvbnN0IGJhc2VFeHByID0gY2xhdXNlLnR5cGVzWzBdLmV4cHJlc3Npb247XG4gICAgICAgIGxldCBzeW1ib2wgPSBjaGVja2VyLmdldFN5bWJvbEF0TG9jYXRpb24oYmFzZUV4cHIpO1xuICAgICAgICBpZiAoc3ltYm9sID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICByZXR1cm4gJ2R5bmFtaWMnO1xuICAgICAgICB9IGVsc2UgaWYgKHN5bWJvbC5mbGFncyAmIHRzLlN5bWJvbEZsYWdzLkFsaWFzKSB7XG4gICAgICAgICAgc3ltYm9sID0gY2hlY2tlci5nZXRBbGlhc2VkU3ltYm9sKHN5bWJvbCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN5bWJvbC52YWx1ZURlY2xhcmF0aW9uICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgIGlzTmFtZWRDbGFzc0RlY2xhcmF0aW9uKHN5bWJvbC52YWx1ZURlY2xhcmF0aW9uKSkge1xuICAgICAgICAgIHJldHVybiBuZXcgUmVmZXJlbmNlKHN5bWJvbC52YWx1ZURlY2xhcmF0aW9uKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gJ2R5bmFtaWMnO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xufVxuIl19