"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeReferenceToIdentifier = void 0;
const plugin_debug_logger_1 = require("../plugin-debug-logger");
const plugin_utils_1 = require("./plugin-utils");
function typeReferenceToIdentifier(typeReferenceDescriptor, hostFilename, options, factory, type, typeImports, importsToAdd) {
    if (options.readonly) {
        assertReferenceableType(type, typeReferenceDescriptor.typeName, hostFilename, options);
    }
    const { typeReference, importPath, typeName } = (0, plugin_utils_1.replaceImportPath)(typeReferenceDescriptor.typeName, hostFilename, options);
    let identifier;
    if (importPath && !options.readonly) {
        // Add top-level import to eagarly load class metadata
        importsToAdd.add(importPath);
    }
    if (options.readonly && typeReference?.includes('import')) {
        if (!typeImports[importPath]) {
            typeImports[importPath] = typeReference;
        }
        let ref = `t["${importPath}"].${typeName}`;
        if (typeReferenceDescriptor.isArray) {
            ref = wrapTypeInArray(ref, typeReferenceDescriptor.arrayDepth);
        }
        identifier = factory.createIdentifier(ref);
    }
    else {
        let ref = typeReference;
        if (typeReferenceDescriptor.isArray) {
            ref = wrapTypeInArray(ref, typeReferenceDescriptor.arrayDepth);
        }
        identifier = factory.createIdentifier(ref);
    }
    return identifier;
}
exports.typeReferenceToIdentifier = typeReferenceToIdentifier;
function wrapTypeInArray(typeRef, arrayDepth) {
    for (let i = 0; i < arrayDepth; i++) {
        typeRef = `[${typeRef}]`;
    }
    return typeRef;
}
function assertReferenceableType(type, parsedTypeName, hostFilename, options) {
    if (!type.symbol) {
        return true;
    }
    if (!type.symbol.isReferenced) {
        return true;
    }
    if (parsedTypeName.includes('import')) {
        return true;
    }
    const errorMessage = `Type "${parsedTypeName}" is not referenceable ("${hostFilename}"). To fix this, make sure to export this type.`;
    if (options.debug) {
        plugin_debug_logger_1.pluginDebugLogger.debug(errorMessage);
    }
    throw new Error(errorMessage);
}
