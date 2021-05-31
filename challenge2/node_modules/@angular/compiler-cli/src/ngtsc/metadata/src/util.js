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
        define("@angular/compiler-cli/src/ngtsc/metadata/src/util", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/imports", "@angular/compiler-cli/src/ngtsc/reflection", "@angular/compiler-cli/src/ngtsc/util/src/typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.hasInjectableFields = exports.CompoundMetadataReader = exports.extractDirectiveTypeCheckMeta = exports.readStringArrayType = exports.readStringMapType = exports.readStringType = exports.extractReferencesFromType = void 0;
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var imports_1 = require("@angular/compiler-cli/src/ngtsc/imports");
    var reflection_1 = require("@angular/compiler-cli/src/ngtsc/reflection");
    var typescript_1 = require("@angular/compiler-cli/src/ngtsc/util/src/typescript");
    function extractReferencesFromType(checker, def, ngModuleImportedFrom, resolutionContext) {
        if (!ts.isTupleTypeNode(def)) {
            return [];
        }
        return def.elements.map(function (element) {
            if (!ts.isTypeQueryNode(element)) {
                throw new Error("Expected TypeQueryNode: " + typescript_1.nodeDebugInfo(element));
            }
            var type = element.exprName;
            var _a = reflection_1.reflectTypeEntityToDeclaration(type, checker), node = _a.node, from = _a.from;
            if (!reflection_1.isNamedClassDeclaration(node)) {
                throw new Error("Expected named ClassDeclaration: " + typescript_1.nodeDebugInfo(node));
            }
            var specifier = (from !== null && !from.startsWith('.') ? from : ngModuleImportedFrom);
            if (specifier !== null) {
                return new imports_1.Reference(node, { specifier: specifier, resolutionContext: resolutionContext });
            }
            else {
                return new imports_1.Reference(node);
            }
        });
    }
    exports.extractReferencesFromType = extractReferencesFromType;
    function readStringType(type) {
        if (!ts.isLiteralTypeNode(type) || !ts.isStringLiteral(type.literal)) {
            return null;
        }
        return type.literal.text;
    }
    exports.readStringType = readStringType;
    function readStringMapType(type) {
        if (!ts.isTypeLiteralNode(type)) {
            return {};
        }
        var obj = {};
        type.members.forEach(function (member) {
            if (!ts.isPropertySignature(member) || member.type === undefined || member.name === undefined ||
                !ts.isStringLiteral(member.name)) {
                return;
            }
            var value = readStringType(member.type);
            if (value === null) {
                return null;
            }
            obj[member.name.text] = value;
        });
        return obj;
    }
    exports.readStringMapType = readStringMapType;
    function readStringArrayType(type) {
        if (!ts.isTupleTypeNode(type)) {
            return [];
        }
        var res = [];
        type.elements.forEach(function (el) {
            if (!ts.isLiteralTypeNode(el) || !ts.isStringLiteral(el.literal)) {
                return;
            }
            res.push(el.literal.text);
        });
        return res;
    }
    exports.readStringArrayType = readStringArrayType;
    /**
     * Inspects the class' members and extracts the metadata that is used when type-checking templates
     * that use the directive. This metadata does not contain information from a base class, if any,
     * making this metadata invariant to changes of inherited classes.
     */
    function extractDirectiveTypeCheckMeta(node, inputs, reflector) {
        var e_1, _a;
        var members = reflector.getMembersOfClass(node);
        var staticMembers = members.filter(function (member) { return member.isStatic; });
        var ngTemplateGuards = staticMembers.map(extractTemplateGuard)
            .filter(function (guard) { return guard !== null; });
        var hasNgTemplateContextGuard = staticMembers.some(function (member) { return member.kind === reflection_1.ClassMemberKind.Method && member.name === 'ngTemplateContextGuard'; });
        var coercedInputFields = new Set(staticMembers.map(extractCoercedInput)
            .filter(function (inputName) { return inputName !== null; }));
        var restrictedInputFields = new Set();
        var stringLiteralInputFields = new Set();
        var undeclaredInputFields = new Set();
        var _loop_1 = function (classPropertyName) {
            var field = members.find(function (member) { return member.name === classPropertyName; });
            if (field === undefined || field.node === null) {
                undeclaredInputFields.add(classPropertyName);
                return "continue";
            }
            if (isRestricted(field.node)) {
                restrictedInputFields.add(classPropertyName);
            }
            if (field.nameNode !== null && ts.isStringLiteral(field.nameNode)) {
                stringLiteralInputFields.add(classPropertyName);
            }
        };
        try {
            for (var _b = tslib_1.__values(inputs.classPropertyNames), _c = _b.next(); !_c.done; _c = _b.next()) {
                var classPropertyName = _c.value;
                _loop_1(classPropertyName);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        var arity = reflector.getGenericArityOfClass(node);
        return {
            hasNgTemplateContextGuard: hasNgTemplateContextGuard,
            ngTemplateGuards: ngTemplateGuards,
            coercedInputFields: coercedInputFields,
            restrictedInputFields: restrictedInputFields,
            stringLiteralInputFields: stringLiteralInputFields,
            undeclaredInputFields: undeclaredInputFields,
            isGeneric: arity !== null && arity > 0,
        };
    }
    exports.extractDirectiveTypeCheckMeta = extractDirectiveTypeCheckMeta;
    function isRestricted(node) {
        if (node.modifiers === undefined) {
            return false;
        }
        return node.modifiers.some(function (modifier) { return modifier.kind === ts.SyntaxKind.PrivateKeyword ||
            modifier.kind === ts.SyntaxKind.ProtectedKeyword ||
            modifier.kind === ts.SyntaxKind.ReadonlyKeyword; });
    }
    function extractTemplateGuard(member) {
        if (!member.name.startsWith('ngTemplateGuard_')) {
            return null;
        }
        var inputName = afterUnderscore(member.name);
        if (member.kind === reflection_1.ClassMemberKind.Property) {
            var type = null;
            if (member.type !== null && ts.isLiteralTypeNode(member.type) &&
                ts.isStringLiteral(member.type.literal)) {
                type = member.type.literal.text;
            }
            // Only property members with string literal type 'binding' are considered as template guard.
            if (type !== 'binding') {
                return null;
            }
            return { inputName: inputName, type: type };
        }
        else if (member.kind === reflection_1.ClassMemberKind.Method) {
            return { inputName: inputName, type: 'invocation' };
        }
        else {
            return null;
        }
    }
    function extractCoercedInput(member) {
        if (member.kind !== reflection_1.ClassMemberKind.Property || !member.name.startsWith('ngAcceptInputType_')) {
            return null;
        }
        return afterUnderscore(member.name);
    }
    /**
     * A `MetadataReader` that reads from an ordered set of child readers until it obtains the requested
     * metadata.
     *
     * This is used to combine `MetadataReader`s that read from different sources (e.g. from a registry
     * and from .d.ts files).
     */
    var CompoundMetadataReader = /** @class */ (function () {
        function CompoundMetadataReader(readers) {
            this.readers = readers;
        }
        CompoundMetadataReader.prototype.getDirectiveMetadata = function (node) {
            var e_2, _a;
            try {
                for (var _b = tslib_1.__values(this.readers), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var reader = _c.value;
                    var meta = reader.getDirectiveMetadata(node);
                    if (meta !== null) {
                        return meta;
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return null;
        };
        CompoundMetadataReader.prototype.getNgModuleMetadata = function (node) {
            var e_3, _a;
            try {
                for (var _b = tslib_1.__values(this.readers), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var reader = _c.value;
                    var meta = reader.getNgModuleMetadata(node);
                    if (meta !== null) {
                        return meta;
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_3) throw e_3.error; }
            }
            return null;
        };
        CompoundMetadataReader.prototype.getPipeMetadata = function (node) {
            var e_4, _a;
            try {
                for (var _b = tslib_1.__values(this.readers), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var reader = _c.value;
                    var meta = reader.getPipeMetadata(node);
                    if (meta !== null) {
                        return meta;
                    }
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_4) throw e_4.error; }
            }
            return null;
        };
        return CompoundMetadataReader;
    }());
    exports.CompoundMetadataReader = CompoundMetadataReader;
    function afterUnderscore(str) {
        var pos = str.indexOf('_');
        if (pos === -1) {
            throw new Error("Expected '" + str + "' to contain '_'");
        }
        return str.substr(pos + 1);
    }
    /** Returns whether a class declaration has the necessary class fields to make it injectable. */
    function hasInjectableFields(clazz, host) {
        var members = host.getMembersOfClass(clazz);
        return members.some(function (_a) {
            var isStatic = _a.isStatic, name = _a.name;
            return isStatic && (name === 'ɵprov' || name === 'ɵfac');
        });
    }
    exports.hasInjectableFields = hasInjectableFields;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvbWV0YWRhdGEvc3JjL3V0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILCtCQUFpQztJQUVqQyxtRUFBd0M7SUFDeEMseUVBQXlKO0lBQ3pKLGtGQUF3RDtJQUt4RCxTQUFnQix5QkFBeUIsQ0FDckMsT0FBdUIsRUFBRSxHQUFnQixFQUFFLG9CQUFpQyxFQUM1RSxpQkFBeUI7UUFDM0IsSUFBSSxDQUFDLEVBQUUsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDNUIsT0FBTyxFQUFFLENBQUM7U0FDWDtRQUVELE9BQU8sR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBQSxPQUFPO1lBQzdCLElBQUksQ0FBQyxFQUFFLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNoQyxNQUFNLElBQUksS0FBSyxDQUFDLDZCQUEyQiwwQkFBYSxDQUFDLE9BQU8sQ0FBRyxDQUFDLENBQUM7YUFDdEU7WUFDRCxJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDO1lBQ3hCLElBQUEsS0FBZSwyQ0FBOEIsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLEVBQTNELElBQUksVUFBQSxFQUFFLElBQUksVUFBaUQsQ0FBQztZQUNuRSxJQUFJLENBQUMsb0NBQXVCLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ2xDLE1BQU0sSUFBSSxLQUFLLENBQUMsc0NBQW9DLDBCQUFhLENBQUMsSUFBSSxDQUFHLENBQUMsQ0FBQzthQUM1RTtZQUNELElBQU0sU0FBUyxHQUFHLENBQUMsSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FB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SUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM3QixJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBRTtZQUNkLE1BQU0sSUFBSSxLQUFLLENBQUMsZUFBYSxHQUFHLHFCQUFrQixDQUFDLENBQUM7U0FDckQ7UUFDRCxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFFRCxnR0FBZ0c7SUFDaEcsU0FBZ0IsbUJBQW1CLENBQUMsS0FBdUIsRUFBRSxJQUFvQjtRQUMvRSxJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDOUMsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQUMsRUFBZ0I7Z0JBQWYsUUFBUSxjQUFBLEVBQUUsSUFBSSxVQUFBO1lBQU0sT0FBQSxRQUFRLElBQUksQ0FBQyxJQUFJLEtBQUssT0FBTyxJQUFJLElBQUksS0FBSyxNQUFNLENBQUM7UUFBakQsQ0FBaUQsQ0FBQyxDQUFDO0lBQy9GLENBQUM7SUFIRCxrREFHQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtSZWZlcmVuY2V9IGZyb20gJy4uLy4uL2ltcG9ydHMnO1xuaW1wb3J0IHtDbGFzc0RlY2xhcmF0aW9uLCBDbGFzc01lbWJlciwgQ2xhc3NNZW1iZXJLaW5kLCBpc05hbWVkQ2xhc3NEZWNsYXJhdGlvbiwgUmVmbGVjdGlvbkhvc3QsIHJlZmxlY3RUeXBlRW50aXR5VG9EZWNsYXJhdGlvbn0gZnJvbSAnLi4vLi4vcmVmbGVjdGlvbic7XG5pbXBvcnQge25vZGVEZWJ1Z0luZm99IGZyb20gJy4uLy4uL3V0aWwvc3JjL3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge0RpcmVjdGl2ZU1ldGEsIERpcmVjdGl2ZVR5cGVDaGVja01ldGEsIE1ldGFkYXRhUmVhZGVyLCBOZ01vZHVsZU1ldGEsIFBpcGVNZXRhLCBUZW1wbGF0ZUd1YXJkTWV0YX0gZnJvbSAnLi9hcGknO1xuaW1wb3J0IHtDbGFzc1Byb3BlcnR5TWFwcGluZywgQ2xhc3NQcm9wZXJ0eU5hbWV9IGZyb20gJy4vcHJvcGVydHlfbWFwcGluZyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0UmVmZXJlbmNlc0Zyb21UeXBlKFxuICAgIGNoZWNrZXI6IHRzLlR5cGVDaGVja2VyLCBkZWY6IHRzLlR5cGVOb2RlLCBuZ01vZHVsZUltcG9ydGVkRnJvbTogc3RyaW5nfG51bGwsXG4gICAgcmVzb2x1dGlvbkNvbnRleHQ6IHN0cmluZyk6IFJlZmVyZW5jZTxDbGFzc0RlY2xhcmF0aW9uPltdIHtcbiAgaWYgKCF0cy5pc1R1cGxlVHlwZU5vZGUoZGVmKSkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIHJldHVybiBkZWYuZWxlbWVudHMubWFwKGVsZW1lbnQgPT4ge1xuICAgIGlmICghdHMuaXNUeXBlUXVlcnlOb2RlKGVsZW1lbnQpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIFR5cGVRdWVyeU5vZGU6ICR7bm9kZURlYnVnSW5mbyhlbGVtZW50KX1gKTtcbiAgICB9XG4gICAgY29uc3QgdHlwZSA9IGVsZW1lbnQuZXhwck5hbWU7XG4gICAgY29uc3Qge25vZGUsIGZyb219ID0gcmVmbGVjdFR5cGVFbnRpdHlUb0RlY2xhcmF0aW9uKHR5cGUsIGNoZWNrZXIpO1xuICAgIGlmICghaXNOYW1lZENsYXNzRGVjbGFyYXRpb24obm9kZSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgbmFtZWQgQ2xhc3NEZWNsYXJhdGlvbjogJHtub2RlRGVidWdJbmZvKG5vZGUpfWApO1xuICAgIH1cbiAgICBjb25zdCBzcGVjaWZpZXIgPSAoZnJvbSAhPT0gbnVsbCAmJiAhZnJvbS5zdGFydHNXaXRoKCcuJykgPyBmcm9tIDogbmdNb2R1bGVJbXBvcnRlZEZyb20pO1xuICAgIGlmIChzcGVjaWZpZXIgIT09IG51bGwpIHtcbiAgICAgIHJldHVybiBuZXcgUmVmZXJlbmNlKG5vZGUsIHtzcGVjaWZpZXIsIHJlc29sdXRpb25Db250ZXh0fSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgUmVmZXJlbmNlKG5vZGUpO1xuICAgIH1cbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWFkU3RyaW5nVHlwZSh0eXBlOiB0cy5UeXBlTm9kZSk6IHN0cmluZ3xudWxsIHtcbiAgaWYgKCF0cy5pc0xpdGVyYWxUeXBlTm9kZSh0eXBlKSB8fCAhdHMuaXNTdHJpbmdMaXRlcmFsKHR5cGUubGl0ZXJhbCkpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICByZXR1cm4gdHlwZS5saXRlcmFsLnRleHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWFkU3RyaW5nTWFwVHlwZSh0eXBlOiB0cy5UeXBlTm9kZSk6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9IHtcbiAgaWYgKCF0cy5pc1R5cGVMaXRlcmFsTm9kZSh0eXBlKSkge1xuICAgIHJldHVybiB7fTtcbiAgfVxuICBjb25zdCBvYmo6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gIHR5cGUubWVtYmVycy5mb3JFYWNoKG1lbWJlciA9PiB7XG4gICAgaWYgKCF0cy5pc1Byb3BlcnR5U2lnbmF0dXJlKG1lbWJlcikgfHwgbWVtYmVyLnR5cGUgPT09IHVuZGVmaW5lZCB8fCBtZW1iZXIubmFtZSA9PT0gdW5kZWZpbmVkIHx8XG4gICAgICAgICF0cy5pc1N0cmluZ0xpdGVyYWwobWVtYmVyLm5hbWUpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHZhbHVlID0gcmVhZFN0cmluZ1R5cGUobWVtYmVyLnR5cGUpO1xuICAgIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIG9ialttZW1iZXIubmFtZS50ZXh0XSA9IHZhbHVlO1xuICB9KTtcbiAgcmV0dXJuIG9iajtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlYWRTdHJpbmdBcnJheVR5cGUodHlwZTogdHMuVHlwZU5vZGUpOiBzdHJpbmdbXSB7XG4gIGlmICghdHMuaXNUdXBsZVR5cGVOb2RlKHR5cGUpKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG4gIGNvbnN0IHJlczogc3RyaW5nW10gPSBbXTtcbiAgdHlwZS5lbGVtZW50cy5mb3JFYWNoKGVsID0+IHtcbiAgICBpZiAoIXRzLmlzTGl0ZXJhbFR5cGVOb2RlKGVsKSB8fCAhdHMuaXNTdHJpbmdMaXRlcmFsKGVsLmxpdGVyYWwpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHJlcy5wdXNoKGVsLmxpdGVyYWwudGV4dCk7XG4gIH0pO1xuICByZXR1cm4gcmVzO1xufVxuXG4vKipcbiAqIEluc3BlY3RzIHRoZSBjbGFzcycgbWVtYmVycyBhbmQgZXh0cmFjdHMgdGhlIG1ldGFkYXRhIHRoYXQgaXMgdXNlZCB3aGVuIHR5cGUtY2hlY2tpbmcgdGVtcGxhdGVzXG4gKiB0aGF0IHVzZSB0aGUgZGlyZWN0aXZlLiBUaGlzIG1ldGFkYXRhIGRvZXMgbm90IGNvbnRhaW4gaW5mb3JtYXRpb24gZnJvbSBhIGJhc2UgY2xhc3MsIGlmIGFueSxcbiAqIG1ha2luZyB0aGlzIG1ldGFkYXRhIGludmFyaWFudCB0byBjaGFuZ2VzIG9mIGluaGVyaXRlZCBjbGFzc2VzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdERpcmVjdGl2ZVR5cGVDaGVja01ldGEoXG4gICAgbm9kZTogQ2xhc3NEZWNsYXJhdGlvbiwgaW5wdXRzOiBDbGFzc1Byb3BlcnR5TWFwcGluZyxcbiAgICByZWZsZWN0b3I6IFJlZmxlY3Rpb25Ib3N0KTogRGlyZWN0aXZlVHlwZUNoZWNrTWV0YSB7XG4gIGNvbnN0IG1lbWJlcnMgPSByZWZsZWN0b3IuZ2V0TWVtYmVyc09mQ2xhc3Mobm9kZSk7XG4gIGNvbnN0IHN0YXRpY01lbWJlcnMgPSBtZW1iZXJzLmZpbHRlcihtZW1iZXIgPT4gbWVtYmVyLmlzU3RhdGljKTtcbiAgY29uc3QgbmdUZW1wbGF0ZUd1YXJkcyA9IHN0YXRpY01lbWJlcnMubWFwKGV4dHJhY3RUZW1wbGF0ZUd1YXJkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoKGd1YXJkKTogZ3VhcmQgaXMgVGVtcGxhdGVHdWFyZE1ldGEgPT4gZ3VhcmQgIT09IG51bGwpO1xuICBjb25zdCBoYXNOZ1RlbXBsYXRlQ29udGV4dEd1YXJkID0gc3RhdGljTWVtYmVycy5zb21lKFxuICAgICAgbWVtYmVyID0+IG1lbWJlci5raW5kID09PSBDbGFzc01lbWJlcktpbmQuTWV0aG9kICYmIG1lbWJlci5uYW1lID09PSAnbmdUZW1wbGF0ZUNvbnRleHRHdWFyZCcpO1xuXG4gIGNvbnN0IGNvZXJjZWRJbnB1dEZpZWxkcyA9XG4gICAgICBuZXcgU2V0KHN0YXRpY01lbWJlcnMubWFwKGV4dHJhY3RDb2VyY2VkSW5wdXQpXG4gICAgICAgICAgICAgICAgICAuZmlsdGVyKChpbnB1dE5hbWUpOiBpbnB1dE5hbWUgaXMgQ2xhc3NQcm9wZXJ0eU5hbWUgPT4gaW5wdXROYW1lICE9PSBudWxsKSk7XG5cbiAgY29uc3QgcmVzdHJpY3RlZElucHV0RmllbGRzID0gbmV3IFNldDxDbGFzc1Byb3BlcnR5TmFtZT4oKTtcbiAgY29uc3Qgc3RyaW5nTGl0ZXJhbElucHV0RmllbGRzID0gbmV3IFNldDxDbGFzc1Byb3BlcnR5TmFtZT4oKTtcbiAgY29uc3QgdW5kZWNsYXJlZElucHV0RmllbGRzID0gbmV3IFNldDxDbGFzc1Byb3BlcnR5TmFtZT4oKTtcblxuICBmb3IgKGNvbnN0IGNsYXNzUHJvcGVydHlOYW1lIG9mIGlucHV0cy5jbGFzc1Byb3BlcnR5TmFtZXMpIHtcbiAgICBjb25zdCBmaWVsZCA9IG1lbWJlcnMuZmluZChtZW1iZXIgPT4gbWVtYmVyLm5hbWUgPT09IGNsYXNzUHJvcGVydHlOYW1lKTtcbiAgICBpZiAoZmllbGQgPT09IHVuZGVmaW5lZCB8fCBmaWVsZC5ub2RlID09PSBudWxsKSB7XG4gICAgICB1bmRlY2xhcmVkSW5wdXRGaWVsZHMuYWRkKGNsYXNzUHJvcGVydHlOYW1lKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBpZiAoaXNSZXN0cmljdGVkKGZpZWxkLm5vZGUpKSB7XG4gICAgICByZXN0cmljdGVkSW5wdXRGaWVsZHMuYWRkKGNsYXNzUHJvcGVydHlOYW1lKTtcbiAgICB9XG4gICAgaWYgKGZpZWxkLm5hbWVOb2RlICE9PSBudWxsICYmIHRzLmlzU3RyaW5nTGl0ZXJhbChmaWVsZC5uYW1lTm9kZSkpIHtcbiAgICAgIHN0cmluZ0xpdGVyYWxJbnB1dEZpZWxkcy5hZGQoY2xhc3NQcm9wZXJ0eU5hbWUpO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGFyaXR5ID0gcmVmbGVjdG9yLmdldEdlbmVyaWNBcml0eU9mQ2xhc3Mobm9kZSk7XG5cbiAgcmV0dXJuIHtcbiAgICBoYXNOZ1RlbXBsYXRlQ29udGV4dEd1YXJkLFxuICAgIG5nVGVtcGxhdGVHdWFyZHMsXG4gICAgY29lcmNlZElucHV0RmllbGRzLFxuICAgIHJlc3RyaWN0ZWRJbnB1dEZpZWxkcyxcbiAgICBzdHJpbmdMaXRlcmFsSW5wdXRGaWVsZHMsXG4gICAgdW5kZWNsYXJlZElucHV0RmllbGRzLFxuICAgIGlzR2VuZXJpYzogYXJpdHkgIT09IG51bGwgJiYgYXJpdHkgPiAwLFxuICB9O1xufVxuXG5mdW5jdGlvbiBpc1Jlc3RyaWN0ZWQobm9kZTogdHMuTm9kZSk6IGJvb2xlYW4ge1xuICBpZiAobm9kZS5tb2RpZmllcnMgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiBub2RlLm1vZGlmaWVycy5zb21lKFxuICAgICAgbW9kaWZpZXIgPT4gbW9kaWZpZXIua2luZCA9PT0gdHMuU3ludGF4S2luZC5Qcml2YXRlS2V5d29yZCB8fFxuICAgICAgICAgIG1vZGlmaWVyLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuUHJvdGVjdGVkS2V5d29yZCB8fFxuICAgICAgICAgIG1vZGlmaWVyLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuUmVhZG9ubHlLZXl3b3JkKTtcbn1cblxuZnVuY3Rpb24gZXh0cmFjdFRlbXBsYXRlR3VhcmQobWVtYmVyOiBDbGFzc01lbWJlcik6IFRlbXBsYXRlR3VhcmRNZXRhfG51bGwge1xuICBpZiAoIW1lbWJlci5uYW1lLnN0YXJ0c1dpdGgoJ25nVGVtcGxhdGVHdWFyZF8nKSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGNvbnN0IGlucHV0TmFtZSA9IGFmdGVyVW5kZXJzY29yZShtZW1iZXIubmFtZSk7XG4gIGlmIChtZW1iZXIua2luZCA9PT0gQ2xhc3NNZW1iZXJLaW5kLlByb3BlcnR5KSB7XG4gICAgbGV0IHR5cGU6IHN0cmluZ3xudWxsID0gbnVsbDtcbiAgICBpZiAobWVtYmVyLnR5cGUgIT09IG51bGwgJiYgdHMuaXNMaXRlcmFsVHlwZU5vZGUobWVtYmVyLnR5cGUpICYmXG4gICAgICAgIHRzLmlzU3RyaW5nTGl0ZXJhbChtZW1iZXIudHlwZS5saXRlcmFsKSkge1xuICAgICAgdHlwZSA9IG1lbWJlci50eXBlLmxpdGVyYWwudGV4dDtcbiAgICB9XG5cbiAgICAvLyBPbmx5IHByb3BlcnR5IG1lbWJlcnMgd2l0aCBzdHJpbmcgbGl0ZXJhbCB0eXBlICdiaW5kaW5nJyBhcmUgY29uc2lkZXJlZCBhcyB0ZW1wbGF0ZSBndWFyZC5cbiAgICBpZiAodHlwZSAhPT0gJ2JpbmRpbmcnKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHtpbnB1dE5hbWUsIHR5cGV9O1xuICB9IGVsc2UgaWYgKG1lbWJlci5raW5kID09PSBDbGFzc01lbWJlcktpbmQuTWV0aG9kKSB7XG4gICAgcmV0dXJuIHtpbnB1dE5hbWUsIHR5cGU6ICdpbnZvY2F0aW9uJ307XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuZnVuY3Rpb24gZXh0cmFjdENvZXJjZWRJbnB1dChtZW1iZXI6IENsYXNzTWVtYmVyKTogc3RyaW5nfG51bGwge1xuICBpZiAobWVtYmVyLmtpbmQgIT09IENsYXNzTWVtYmVyS2luZC5Qcm9wZXJ0eSB8fCAhbWVtYmVyLm5hbWUuc3RhcnRzV2l0aCgnbmdBY2NlcHRJbnB1dFR5cGVfJykpIHtcbiAgICByZXR1cm4gbnVsbCE7XG4gIH1cbiAgcmV0dXJuIGFmdGVyVW5kZXJzY29yZShtZW1iZXIubmFtZSk7XG59XG5cbi8qKlxuICogQSBgTWV0YWRhdGFSZWFkZXJgIHRoYXQgcmVhZHMgZnJvbSBhbiBvcmRlcmVkIHNldCBvZiBjaGlsZCByZWFkZXJzIHVudGlsIGl0IG9idGFpbnMgdGhlIHJlcXVlc3RlZFxuICogbWV0YWRhdGEuXG4gKlxuICogVGhpcyBpcyB1c2VkIHRvIGNvbWJpbmUgYE1ldGFkYXRhUmVhZGVyYHMgdGhhdCByZWFkIGZyb20gZGlmZmVyZW50IHNvdXJjZXMgKGUuZy4gZnJvbSBhIHJlZ2lzdHJ5XG4gKiBhbmQgZnJvbSAuZC50cyBmaWxlcykuXG4gKi9cbmV4cG9ydCBjbGFzcyBDb21wb3VuZE1ldGFkYXRhUmVhZGVyIGltcGxlbWVudHMgTWV0YWRhdGFSZWFkZXIge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRlcnM6IE1ldGFkYXRhUmVhZGVyW10pIHt9XG5cbiAgZ2V0RGlyZWN0aXZlTWV0YWRhdGEobm9kZTogUmVmZXJlbmNlPENsYXNzRGVjbGFyYXRpb248dHMuRGVjbGFyYXRpb24+Pik6IERpcmVjdGl2ZU1ldGF8bnVsbCB7XG4gICAgZm9yIChjb25zdCByZWFkZXIgb2YgdGhpcy5yZWFkZXJzKSB7XG4gICAgICBjb25zdCBtZXRhID0gcmVhZGVyLmdldERpcmVjdGl2ZU1ldGFkYXRhKG5vZGUpO1xuICAgICAgaWYgKG1ldGEgIT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG1ldGE7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgZ2V0TmdNb2R1bGVNZXRhZGF0YShub2RlOiBSZWZlcmVuY2U8Q2xhc3NEZWNsYXJhdGlvbjx0cy5EZWNsYXJhdGlvbj4+KTogTmdNb2R1bGVNZXRhfG51bGwge1xuICAgIGZvciAoY29uc3QgcmVhZGVyIG9mIHRoaXMucmVhZGVycykge1xuICAgICAgY29uc3QgbWV0YSA9IHJlYWRlci5nZXROZ01vZHVsZU1ldGFkYXRhKG5vZGUpO1xuICAgICAgaWYgKG1ldGEgIT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG1ldGE7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGdldFBpcGVNZXRhZGF0YShub2RlOiBSZWZlcmVuY2U8Q2xhc3NEZWNsYXJhdGlvbjx0cy5EZWNsYXJhdGlvbj4+KTogUGlwZU1ldGF8bnVsbCB7XG4gICAgZm9yIChjb25zdCByZWFkZXIgb2YgdGhpcy5yZWFkZXJzKSB7XG4gICAgICBjb25zdCBtZXRhID0gcmVhZGVyLmdldFBpcGVNZXRhZGF0YShub2RlKTtcbiAgICAgIGlmIChtZXRhICE9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBtZXRhO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG5mdW5jdGlvbiBhZnRlclVuZGVyc2NvcmUoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBwb3MgPSBzdHIuaW5kZXhPZignXycpO1xuICBpZiAocG9zID09PSAtMSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgJyR7c3RyfScgdG8gY29udGFpbiAnXydgKTtcbiAgfVxuICByZXR1cm4gc3RyLnN1YnN0cihwb3MgKyAxKTtcbn1cblxuLyoqIFJldHVybnMgd2hldGhlciBhIGNsYXNzIGRlY2xhcmF0aW9uIGhhcyB0aGUgbmVjZXNzYXJ5IGNsYXNzIGZpZWxkcyB0byBtYWtlIGl0IGluamVjdGFibGUuICovXG5leHBvcnQgZnVuY3Rpb24gaGFzSW5qZWN0YWJsZUZpZWxkcyhjbGF6ejogQ2xhc3NEZWNsYXJhdGlvbiwgaG9zdDogUmVmbGVjdGlvbkhvc3QpOiBib29sZWFuIHtcbiAgY29uc3QgbWVtYmVycyA9IGhvc3QuZ2V0TWVtYmVyc09mQ2xhc3MoY2xhenopO1xuICByZXR1cm4gbWVtYmVycy5zb21lKCh7aXNTdGF0aWMsIG5hbWV9KSA9PiBpc1N0YXRpYyAmJiAobmFtZSA9PT0gJ8m1cHJvdicgfHwgbmFtZSA9PT0gJ8m1ZmFjJykpO1xufVxuIl19