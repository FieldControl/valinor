"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecondaryEntryPointsMigration = void 0;
const schematics_1 = require("@angular/cdk/schematics");
const ts = require("typescript");
const module_specifiers_1 = require("../../../ng-update/typescript/module-specifiers");
const ONLY_SUBPACKAGE_FAILURE_STR = `Importing from "@angular/material" is deprecated. ` +
    `Instead import from the entry-point the symbol belongs to.`;
const NO_IMPORT_NAMED_SYMBOLS_FAILURE_STR = `Imports from Angular Material should import ` +
    `specific symbols rather than importing the entire library.`;
/**
 * Regex for testing file paths against to determine if the file is from the
 * Angular Material library.
 */
const ANGULAR_MATERIAL_FILEPATH_REGEX = new RegExp(`${module_specifiers_1.materialModuleSpecifier}/(.*?)/`);
/**
 * Mapping of Material symbol names to their module names. Used as a fallback if
 * we didn't manage to resolve the module name of a symbol using the type checker.
 */
const ENTRY_POINT_MAPPINGS = require('./material-symbols.json');
/**
 * Migration that updates imports which refer to the primary Angular Material
 * entry-point to use the appropriate secondary entry points (e.g. @angular/material/button).
 */
class SecondaryEntryPointsMigration extends schematics_1.Migration {
    constructor() {
        super(...arguments);
        this.printer = ts.createPrinter();
        // Only enable this rule if the migration targets version 8. The primary
        // entry-point of Material has been marked as deprecated in version 8.
        this.enabled = this.targetVersion === schematics_1.TargetVersion.V8 || this.targetVersion === schematics_1.TargetVersion.V9;
    }
    visitNode(declaration) {
        // Only look at import declarations.
        if (!ts.isImportDeclaration(declaration) ||
            !ts.isStringLiteralLike(declaration.moduleSpecifier)) {
            return;
        }
        const importLocation = declaration.moduleSpecifier.text;
        // If the import module is not @angular/material, skip the check.
        if (importLocation !== module_specifiers_1.materialModuleSpecifier) {
            return;
        }
        // If no import clause is found, or nothing is named as a binding in the
        // import, add failure saying to import symbols in clause.
        if (!declaration.importClause || !declaration.importClause.namedBindings) {
            this.createFailureAtNode(declaration, NO_IMPORT_NAMED_SYMBOLS_FAILURE_STR);
            return;
        }
        // All named bindings in import clauses must be named symbols, otherwise add
        // failure saying to import symbols in clause.
        if (!ts.isNamedImports(declaration.importClause.namedBindings)) {
            this.createFailureAtNode(declaration, NO_IMPORT_NAMED_SYMBOLS_FAILURE_STR);
            return;
        }
        // If no symbols are in the named bindings then add failure saying to
        // import symbols in clause.
        if (!declaration.importClause.namedBindings.elements.length) {
            this.createFailureAtNode(declaration, NO_IMPORT_NAMED_SYMBOLS_FAILURE_STR);
            return;
        }
        // Whether the existing import declaration is using a single quote module specifier.
        const singleQuoteImport = declaration.moduleSpecifier.getText()[0] === `'`;
        // Map which consists of secondary entry-points and import specifiers which are used
        // within the current import declaration.
        const importMap = new Map();
        // Determine the subpackage each symbol in the namedBinding comes from.
        for (const element of declaration.importClause.namedBindings.elements) {
            const elementName = element.propertyName ? element.propertyName : element.name;
            // Try to resolve the module name via the type checker, and if it fails, fall back to
            // resolving it from our list of symbol to entry point mappings. Using the type checker is
            // more accurate and doesn't require us to keep a list of symbols, but it won't work if
            // the symbols don't exist anymore (e.g. after we remove the top-level @angular/material).
            const moduleName = resolveModuleName(elementName, this.typeChecker) ||
                ENTRY_POINT_MAPPINGS[elementName.text] || null;
            if (!moduleName) {
                this.createFailureAtNode(element, `"${element.getText()}" was not found in the Material library.`);
                return;
            }
            // The module name where the symbol is defined e.g. card, dialog. The
            // first capture group is contains the module name.
            if (importMap.has(moduleName)) {
                importMap.get(moduleName).push(element);
            }
            else {
                importMap.set(moduleName, [element]);
            }
        }
        // Transforms the import declaration into multiple import declarations that import
        // the given symbols from the individual secondary entry-points. For example:
        // import {MatCardModule, MatCardTitle} from '@angular/material/card';
        // import {MatRadioModule} from '@angular/material/radio';
        const newImportStatements = Array.from(importMap.entries())
            .sort()
            .map(([name, elements]) => {
            const newImport = ts.createImportDeclaration(undefined, undefined, ts.createImportClause(undefined, ts.createNamedImports(elements)), createStringLiteral(`${module_specifiers_1.materialModuleSpecifier}/${name}`, singleQuoteImport));
            return this.printer.printNode(ts.EmitHint.Unspecified, newImport, declaration.getSourceFile());
        })
            .join('\n');
        // Without any import statements that were generated, we can assume that this was an empty
        // import declaration. We still want to add a failure in order to make developers aware that
        // importing from "@angular/material" is deprecated.
        if (!newImportStatements) {
            this.createFailureAtNode(declaration.moduleSpecifier, ONLY_SUBPACKAGE_FAILURE_STR);
            return;
        }
        const filePath = this.fileSystem.resolve(declaration.moduleSpecifier.getSourceFile().fileName);
        const recorder = this.fileSystem.edit(filePath);
        // Perform the replacement that switches the primary entry-point import to
        // the individual secondary entry-point imports.
        recorder.remove(declaration.getStart(), declaration.getWidth());
        recorder.insertRight(declaration.getStart(), newImportStatements);
    }
}
exports.SecondaryEntryPointsMigration = SecondaryEntryPointsMigration;
/**
 * Creates a string literal from the specified text.
 * @param text Text of the string literal.
 * @param singleQuotes Whether single quotes should be used when printing the literal node.
 */
function createStringLiteral(text, singleQuotes) {
    const literal = ts.createStringLiteral(text);
    // See: https://github.com/microsoft/TypeScript/blob/master/src/compiler/utilities.ts#L584-L590
    literal['singleQuote'] = singleQuotes;
    return literal;
}
/** Gets the symbol that contains the value declaration of the given node. */
function getDeclarationSymbolOfNode(node, checker) {
    const symbol = checker.getSymbolAtLocation(node);
    // Symbols can be aliases of the declaration symbol. e.g. in named import specifiers.
    // We need to resolve the aliased symbol back to the declaration symbol.
    // tslint:disable-next-line:no-bitwise
    if (symbol && (symbol.flags & ts.SymbolFlags.Alias) !== 0) {
        return checker.getAliasedSymbol(symbol);
    }
    return symbol;
}
/** Tries to resolve the name of the Material module that a node is imported from. */
function resolveModuleName(node, typeChecker) {
    // Get the symbol for the named binding element. Note that we cannot determine the
    // value declaration based on the type of the element as types are not necessarily
    // specific to a given secondary entry-point (e.g. exports with the type of "string")
    // would resolve to the module types provided by TypeScript itself.
    const symbol = getDeclarationSymbolOfNode(node, typeChecker);
    // If the symbol can't be found, or no declaration could be found within
    // the symbol, add failure to report that the given symbol can't be found.
    if (!symbol ||
        !(symbol.valueDeclaration || (symbol.declarations && symbol.declarations.length !== 0))) {
        return null;
    }
    // The filename for the source file of the node that contains the
    // first declaration of the symbol. All symbol declarations must be
    // part of a defining node, so parent can be asserted to be defined.
    const resolvedNode = symbol.valueDeclaration || symbol.declarations[0];
    const sourceFile = resolvedNode.getSourceFile().fileName;
    // File the module the symbol belongs to from a regex match of the
    // filename. This will always match since only "@angular/material"
    // elements are analyzed.
    const matches = sourceFile.match(ANGULAR_MATERIAL_FILEPATH_REGEX);
    return matches ? matches[1] : null;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Vjb25kYXJ5LWVudHJ5LXBvaW50cy1taWdyYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvc2NoZW1hdGljcy9uZy11cGRhdGUvbWlncmF0aW9ucy9wYWNrYWdlLWltcG9ydHMtdjgvc2Vjb25kYXJ5LWVudHJ5LXBvaW50cy1taWdyYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsd0RBQWlFO0FBQ2pFLGlDQUFpQztBQUNqQyx1RkFBd0Y7QUFFeEYsTUFBTSwyQkFBMkIsR0FBRyxvREFBb0Q7SUFDcEYsNERBQTRELENBQUM7QUFFakUsTUFBTSxtQ0FBbUMsR0FBRyw4Q0FBOEM7SUFDdEYsNERBQTRELENBQUM7QUFFakU7OztHQUdHO0FBQ0gsTUFBTSwrQkFBK0IsR0FBRyxJQUFJLE1BQU0sQ0FBQyxHQUFHLDJDQUF1QixTQUFTLENBQUMsQ0FBQztBQUV4Rjs7O0dBR0c7QUFDSCxNQUFNLG9CQUFvQixHQUE2QixPQUFPLENBQUMseUJBQXlCLENBQUMsQ0FBQztBQUUxRjs7O0dBR0c7QUFDSCxNQUFhLDZCQUE4QixTQUFRLHNCQUFlO0lBQWxFOztRQUNFLFlBQU8sR0FBRyxFQUFFLENBQUMsYUFBYSxFQUFFLENBQUM7UUFFN0Isd0VBQXdFO1FBQ3hFLHNFQUFzRTtRQUN0RSxZQUFPLEdBQUcsSUFBSSxDQUFDLGFBQWEsS0FBSywwQkFBYSxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsYUFBYSxLQUFLLDBCQUFhLENBQUMsRUFBRSxDQUFDO0lBdUcvRixDQUFDO0lBckdDLFNBQVMsQ0FBQyxXQUFvQjtRQUM1QixvQ0FBb0M7UUFDcEMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLENBQUM7WUFDcEMsQ0FBQyxFQUFFLENBQUMsbUJBQW1CLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxFQUFFO1lBQ3hE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RTtJQUNsRSxrRUFBa0U7SUFDbEUseUJBQXlCO0lBQ3pCLE1BQU0sT0FBTyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsK0JBQStCLENBQUMsQ0FBQztJQUNsRSxPQUFPLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7QUFDckMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge01pZ3JhdGlvbiwgVGFyZ2V0VmVyc2lvbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL3NjaGVtYXRpY3MnO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5pbXBvcnQge21hdGVyaWFsTW9kdWxlU3BlY2lmaWVyfSBmcm9tICcuLi8uLi8uLi9uZy11cGRhdGUvdHlwZXNjcmlwdC9tb2R1bGUtc3BlY2lmaWVycyc7XG5cbmNvbnN0IE9OTFlfU1VCUEFDS0FHRV9GQUlMVVJFX1NUUiA9IGBJbXBvcnRpbmcgZnJvbSBcIkBhbmd1bGFyL21hdGVyaWFsXCIgaXMgZGVwcmVjYXRlZC4gYCArXG4gICAgYEluc3RlYWQgaW1wb3J0IGZyb20gdGhlIGVudHJ5LXBvaW50IHRoZSBzeW1ib2wgYmVsb25ncyB0by5gO1xuXG5jb25zdCBOT19JTVBPUlRfTkFNRURfU1lNQk9MU19GQUlMVVJFX1NUUiA9IGBJbXBvcnRzIGZyb20gQW5ndWxhciBNYXRlcmlhbCBzaG91bGQgaW1wb3J0IGAgK1xuICAgIGBzcGVjaWZpYyBzeW1ib2xzIHJhdGhlciB0aGFuIGltcG9ydGluZyB0aGUgZW50aXJlIGxpYnJhcnkuYDtcblxuLyoqXG4gKiBSZWdleCBmb3IgdGVzdGluZyBmaWxlIHBhdGhzIGFnYWluc3QgdG8gZGV0ZXJtaW5lIGlmIHRoZSBmaWxlIGlzIGZyb20gdGhlXG4gKiBBbmd1bGFyIE1hdGVyaWFsIGxpYnJhcnkuXG4gKi9cbmNvbnN0IEFOR1VMQVJfTUFURVJJQUxfRklMRVBBVEhfUkVHRVggPSBuZXcgUmVnRXhwKGAke21hdGVyaWFsTW9kdWxlU3BlY2lmaWVyfS8oLio/KS9gKTtcblxuLyoqXG4gKiBNYXBwaW5nIG9mIE1hdGVyaWFsIHN5bWJvbCBuYW1lcyB0byB0aGVpciBtb2R1bGUgbmFtZXMuIFVzZWQgYXMgYSBmYWxsYmFjayBpZlxuICogd2UgZGlkbid0IG1hbmFnZSB0byByZXNvbHZlIHRoZSBtb2R1bGUgbmFtZSBvZiBhIHN5bWJvbCB1c2luZyB0aGUgdHlwZSBjaGVja2VyLlxuICovXG5jb25zdCBFTlRSWV9QT0lOVF9NQVBQSU5HUzoge1tuYW1lOiBzdHJpbmddOiBzdHJpbmd9ID0gcmVxdWlyZSgnLi9tYXRlcmlhbC1zeW1ib2xzLmpzb24nKTtcblxuLyoqXG4gKiBNaWdyYXRpb24gdGhhdCB1cGRhdGVzIGltcG9ydHMgd2hpY2ggcmVmZXIgdG8gdGhlIHByaW1hcnkgQW5ndWxhciBNYXRlcmlhbFxuICogZW50cnktcG9pbnQgdG8gdXNlIHRoZSBhcHByb3ByaWF0ZSBzZWNvbmRhcnkgZW50cnkgcG9pbnRzIChlLmcuIEBhbmd1bGFyL21hdGVyaWFsL2J1dHRvbikuXG4gKi9cbmV4cG9ydCBjbGFzcyBTZWNvbmRhcnlFbnRyeVBvaW50c01pZ3JhdGlvbiBleHRlbmRzIE1pZ3JhdGlvbjxudWxsPiB7XG4gIHByaW50ZXIgPSB0cy5jcmVhdGVQcmludGVyKCk7XG5cbiAgLy8gT25seSBlbmFibGUgdGhpcyBydWxlIGlmIHRoZSBtaWdyYXRpb24gdGFyZ2V0cyB2ZXJzaW9uIDguIFRoZSBwcmltYXJ5XG4gIC8vIGVudHJ5LXBvaW50IG9mIE1hdGVyaWFsIGhhcyBiZWVuIG1hcmtlZCBhcyBkZXByZWNhdGVkIGluIHZlcnNpb24gOC5cbiAgZW5hYmxlZCA9IHRoaXMudGFyZ2V0VmVyc2lvbiA9PT0gVGFyZ2V0VmVyc2lvbi5WOCB8fCB0aGlzLnRhcmdldFZlcnNpb24gPT09IFRhcmdldFZlcnNpb24uVjk7XG5cbiAgdmlzaXROb2RlKGRlY2xhcmF0aW9uOiB0cy5Ob2RlKTogdm9pZCB7XG4gICAgLy8gT25seSBsb29rIGF0IGltcG9ydCBkZWNsYXJhdGlvbnMuXG4gICAgaWYgKCF0cy5pc0ltcG9ydERlY2xhcmF0aW9uKGRlY2xhcmF0aW9uKSB8fFxuICAgICAgICAhdHMuaXNTdHJpbmdMaXRlcmFsTGlrZShkZWNsYXJhdGlvbi5tb2R1bGVTcGVjaWZpZXIpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgaW1wb3J0TG9jYXRpb24gPSBkZWNsYXJhdGlvbi5tb2R1bGVTcGVjaWZpZXIudGV4dDtcbiAgICAvLyBJZiB0aGUgaW1wb3J0IG1vZHVsZSBpcyBub3QgQGFuZ3VsYXIvbWF0ZXJpYWwsIHNraXAgdGhlIGNoZWNrLlxuICAgIGlmIChpbXBvcnRMb2NhdGlvbiAhPT0gbWF0ZXJpYWxNb2R1bGVTcGVjaWZpZXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBJZiBubyBpbXBvcnQgY2xhdXNlIGlzIGZvdW5kLCBvciBub3RoaW5nIGlzIG5hbWVkIGFzIGEgYmluZGluZyBpbiB0aGVcbiAgICAvLyBpbXBvcnQsIGFkZCBmYWlsdXJlIHNheWluZyB0byBpbXBvcnQgc3ltYm9scyBpbiBjbGF1c2UuXG4gICAgaWYgKCFkZWNsYXJhdGlvbi5pbXBvcnRDbGF1c2UgfHwgIWRlY2xhcmF0aW9uLmltcG9ydENsYXVzZS5uYW1lZEJpbmRpbmdzKSB7XG4gICAgICB0aGlzLmNyZWF0ZUZhaWx1cmVBdE5vZGUoZGVjbGFyYXRpb24sIE5PX0lNUE9SVF9OQU1FRF9TWU1CT0xTX0ZBSUxVUkVfU1RSKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBBbGwgbmFtZWQgYmluZGluZ3MgaW4gaW1wb3J0IGNsYXVzZXMgbXVzdCBiZSBuYW1lZCBzeW1ib2xzLCBvdGhlcndpc2UgYWRkXG4gICAgLy8gZmFpbHVyZSBzYXlpbmcgdG8gaW1wb3J0IHN5bWJvbHMgaW4gY2xhdXNlLlxuICAgIGlmICghdHMuaXNOYW1lZEltcG9ydHMoZGVjbGFyYXRpb24uaW1wb3J0Q2xhdXNlLm5hbWVkQmluZGluZ3MpKSB7XG4gICAgICB0aGlzLmNyZWF0ZUZhaWx1cmVBdE5vZGUoZGVjbGFyYXRpb24sIE5PX0lNUE9SVF9OQU1FRF9TWU1CT0xTX0ZBSUxVUkVfU1RSKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBJZiBubyBzeW1ib2xzIGFyZSBpbiB0aGUgbmFtZWQgYmluZGluZ3MgdGhlbiBhZGQgZmFpbHVyZSBzYXlpbmcgdG9cbiAgICAvLyBpbXBvcnQgc3ltYm9scyBpbiBjbGF1c2UuXG4gICAgaWYgKCFkZWNsYXJhdGlvbi5pbXBvcnRDbGF1c2UubmFtZWRCaW5kaW5ncy5lbGVtZW50cy5sZW5ndGgpIHtcbiAgICAgIHRoaXMuY3JlYXRlRmFpbHVyZUF0Tm9kZShkZWNsYXJhdGlvbiwgTk9fSU1QT1JUX05BTUVEX1NZTUJPTFNfRkFJTFVSRV9TVFIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFdoZXRoZXIgdGhlIGV4aXN0aW5nIGltcG9ydCBkZWNsYXJhdGlvbiBpcyB1c2luZyBhIHNpbmdsZSBxdW90ZSBtb2R1bGUgc3BlY2lmaWVyLlxuICAgIGNvbnN0IHNpbmdsZVF1b3RlSW1wb3J0ID0gZGVjbGFyYXRpb24ubW9kdWxlU3BlY2lmaWVyLmdldFRleHQoKVswXSA9PT0gYCdgO1xuXG4gICAgLy8gTWFwIHdoaWNoIGNvbnNpc3RzIG9mIHNlY29uZGFyeSBlbnRyeS1wb2ludHMgYW5kIGltcG9ydCBzcGVjaWZpZXJzIHdoaWNoIGFyZSB1c2VkXG4gICAgLy8gd2l0aGluIHRoZSBjdXJyZW50IGltcG9ydCBkZWNsYXJhdGlvbi5cbiAgICBjb25zdCBpbXBvcnRNYXAgPSBuZXcgTWFwPHN0cmluZywgdHMuSW1wb3J0U3BlY2lmaWVyW10+KCk7XG5cbiAgICAvLyBEZXRlcm1pbmUgdGhlIHN1YnBhY2thZ2UgZWFjaCBzeW1ib2wgaW4gdGhlIG5hbWVkQmluZGluZyBjb21lcyBmcm9tLlxuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBkZWNsYXJhdGlvbi5pbXBvcnRDbGF1c2UubmFtZWRCaW5kaW5ncy5lbGVtZW50cykge1xuICAgICAgY29uc3QgZWxlbWVudE5hbWUgPSBlbGVtZW50LnByb3BlcnR5TmFtZSA/IGVsZW1lbnQucHJvcGVydHlOYW1lIDogZWxlbWVudC5uYW1lO1xuXG4gICAgICAvLyBUcnkgdG8gcmVzb2x2ZSB0aGUgbW9kdWxlIG5hbWUgdmlhIHRoZSB0eXBlIGNoZWNrZXIsIGFuZCBpZiBpdCBmYWlscywgZmFsbCBiYWNrIHRvXG4gICAgICAvLyByZXNvbHZpbmcgaXQgZnJvbSBvdXIgbGlzdCBvZiBzeW1ib2wgdG8gZW50cnkgcG9pbnQgbWFwcGluZ3MuIFVzaW5nIHRoZSB0eXBlIGNoZWNrZXIgaXNcbiAgICAgIC8vIG1vcmUgYWNjdXJhdGUgYW5kIGRvZXNuJ3QgcmVxdWlyZSB1cyB0byBrZWVwIGEgbGlzdCBvZiBzeW1ib2xzLCBidXQgaXQgd29uJ3Qgd29yayBpZlxuICAgICAgLy8gdGhlIHN5bWJvbHMgZG9uJ3QgZXhpc3QgYW55bW9yZSAoZS5nLiBhZnRlciB3ZSByZW1vdmUgdGhlIHRvcC1sZXZlbCBAYW5ndWxhci9tYXRlcmlhbCkuXG4gICAgICBjb25zdCBtb2R1bGVOYW1lID0gcmVzb2x2ZU1vZHVsZU5hbWUoZWxlbWVudE5hbWUsIHRoaXMudHlwZUNoZWNrZXIpIHx8XG4gICAgICAgICAgRU5UUllfUE9JTlRfTUFQUElOR1NbZWxlbWVudE5hbWUudGV4dF0gfHwgbnVsbDtcblxuICAgICAgaWYgKCFtb2R1bGVOYW1lKSB7XG4gICAgICAgIHRoaXMuY3JlYXRlRmFpbHVyZUF0Tm9kZShcbiAgICAgICAgICBlbGVtZW50LCBgXCIke2VsZW1lbnQuZ2V0VGV4dCgpfVwiIHdhcyBub3QgZm91bmQgaW4gdGhlIE1hdGVyaWFsIGxpYnJhcnkuYCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgICAvLyBUaGUgbW9kdWxlIG5hbWUgd2hlcmUgdGhlIHN5bWJvbCBpcyBkZWZpbmVkIGUuZy4gY2FyZCwgZGlhbG9nLiBUaGVcbiAgICAgICAgLy8gZmlyc3QgY2FwdHVyZSBncm91cCBpcyBjb250YWlucyB0aGUgbW9kdWxlIG5hbWUuXG4gICAgICAgIGlmIChpbXBvcnRNYXAuaGFzKG1vZHVsZU5hbWUpKSB7XG4gICAgICAgICAgaW1wb3J0TWFwLmdldChtb2R1bGVOYW1lKSEucHVzaChlbGVtZW50KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpbXBvcnRNYXAuc2V0KG1vZHVsZU5hbWUsIFtlbGVtZW50XSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBUcmFuc2Zvcm1zIHRoZSBpbXBvcnQgZGVjbGFyYXRpb24gaW50byBtdWx0aXBsZSBpbXBvcnQgZGVjbGFyYXRpb25zIHRoYXQgaW1wb3J0XG4gICAgLy8gdGhlIGdpdmVuIHN5bWJvbHMgZnJvbSB0aGUgaW5kaXZpZHVhbCBzZWNvbmRhcnkgZW50cnktcG9pbnRzLiBGb3IgZXhhbXBsZTpcbiAgICAvLyBpbXBvcnQge01hdENhcmRNb2R1bGUsIE1hdENhcmRUaXRsZX0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvY2FyZCc7XG4gICAgLy8gaW1wb3J0IHtNYXRSYWRpb01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvcmFkaW8nO1xuICAgIGNvbnN0IG5ld0ltcG9ydFN0YXRlbWVudHMgPVxuICAgICAgICBBcnJheS5mcm9tKGltcG9ydE1hcC5lbnRyaWVzKCkpXG4gICAgICAgICAgICAuc29ydCgpXG4gICAgICAgICAgICAubWFwKChbbmFtZSwgZWxlbWVudHNdKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IG5ld0ltcG9ydCA9IHRzLmNyZWF0ZUltcG9ydERlY2xhcmF0aW9uKFxuICAgICAgICAgICAgICAgICAgdW5kZWZpbmVkLCB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICB0cy5jcmVhdGVJbXBvcnRDbGF1c2UodW5kZWZpbmVkLCB0cy5jcmVhdGVOYW1lZEltcG9ydHMoZWxlbWVudHMpKSxcbiAgICAgICAgICAgICAgICAgIGNyZWF0ZVN0cmluZ0xpdGVyYWwoYCR7bWF0ZXJpYWxNb2R1bGVTcGVjaWZpZXJ9LyR7bmFtZX1gLCBzaW5nbGVRdW90ZUltcG9ydCkpO1xuICAgICAgICAgICAgICByZXR1cm4gdGhpcy5wcmludGVyLnByaW50Tm9kZShcbiAgICAgICAgICAgICAgICAgIHRzLkVtaXRIaW50LlVuc3BlY2lmaWVkLCBuZXdJbXBvcnQsIGRlY2xhcmF0aW9uLmdldFNvdXJjZUZpbGUoKSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmpvaW4oJ1xcbicpO1xuXG4gICAgLy8gV2l0aG91dCBhbnkgaW1wb3J0IHN0YXRlbWVudHMgdGhhdCB3ZXJlIGdlbmVyYXRlZCwgd2UgY2FuIGFzc3VtZSB0aGF0IHRoaXMgd2FzIGFuIGVtcHR5XG4gICAgLy8gaW1wb3J0IGRlY2xhcmF0aW9uLiBXZSBzdGlsbCB3YW50IHRvIGFkZCBhIGZhaWx1cmUgaW4gb3JkZXIgdG8gbWFrZSBkZXZlbG9wZXJzIGF3YXJlIHRoYXRcbiAgICAvLyBpbXBvcnRpbmcgZnJvbSBcIkBhbmd1bGFyL21hdGVyaWFsXCIgaXMgZGVwcmVjYXRlZC5cbiAgICBpZiAoIW5ld0ltcG9ydFN0YXRlbWVudHMpIHtcbiAgICAgIHRoaXMuY3JlYXRlRmFpbHVyZUF0Tm9kZShkZWNsYXJhdGlvbi5tb2R1bGVTcGVjaWZpZXIsIE9OTFlfU1VCUEFDS0FHRV9GQUlMVVJFX1NUUik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZmlsZVBhdGggPSB0aGlzLmZpbGVTeXN0ZW0ucmVzb2x2ZShcbiAgICAgICAgZGVjbGFyYXRpb24ubW9kdWxlU3BlY2lmaWVyLmdldFNvdXJjZUZpbGUoKS5maWxlTmFtZSk7XG4gICAgY29uc3QgcmVjb3JkZXIgPSB0aGlzLmZpbGVTeXN0ZW0uZWRpdChmaWxlUGF0aCk7XG5cbiAgICAvLyBQZXJmb3JtIHRoZSByZXBsYWNlbWVudCB0aGF0IHN3aXRjaGVzIHRoZSBwcmltYXJ5IGVudHJ5LXBvaW50IGltcG9ydCB0b1xuICAgIC8vIHRoZSBpbmRpdmlkdWFsIHNlY29uZGFyeSBlbnRyeS1wb2ludCBpbXBvcnRzLlxuICAgIHJlY29yZGVyLnJlbW92ZShkZWNsYXJhdGlvbi5nZXRTdGFydCgpLCBkZWNsYXJhdGlvbi5nZXRXaWR0aCgpKTtcbiAgICByZWNvcmRlci5pbnNlcnRSaWdodChkZWNsYXJhdGlvbi5nZXRTdGFydCgpLCBuZXdJbXBvcnRTdGF0ZW1lbnRzKTtcbiAgfVxufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBzdHJpbmcgbGl0ZXJhbCBmcm9tIHRoZSBzcGVjaWZpZWQgdGV4dC5cbiAqIEBwYXJhbSB0ZXh0IFRleHQgb2YgdGhlIHN0cmluZyBsaXRlcmFsLlxuICogQHBhcmFtIHNpbmdsZVF1b3RlcyBXaGV0aGVyIHNpbmdsZSBxdW90ZXMgc2hvdWxkIGJlIHVzZWQgd2hlbiBwcmludGluZyB0aGUgbGl0ZXJhbCBub2RlLlxuICovXG5mdW5jdGlvbiBjcmVhdGVTdHJpbmdMaXRlcmFsKHRleHQ6IHN0cmluZywgc2luZ2xlUXVvdGVzOiBib29sZWFuKTogdHMuU3RyaW5nTGl0ZXJhbCB7XG4gIGNvbnN0IGxpdGVyYWwgPSB0cy5jcmVhdGVTdHJpbmdMaXRlcmFsKHRleHQpO1xuICAvLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9taWNyb3NvZnQvVHlwZVNjcmlwdC9ibG9iL21hc3Rlci9zcmMvY29tcGlsZXIvdXRpbGl0aWVzLnRzI0w1ODQtTDU5MFxuICBsaXRlcmFsWydzaW5nbGVRdW90ZSddID0gc2luZ2xlUXVvdGVzO1xuICByZXR1cm4gbGl0ZXJhbDtcbn1cblxuLyoqIEdldHMgdGhlIHN5bWJvbCB0aGF0IGNvbnRhaW5zIHRoZSB2YWx1ZSBkZWNsYXJhdGlvbiBvZiB0aGUgZ2l2ZW4gbm9kZS4gKi9cbmZ1bmN0aW9uIGdldERlY2xhcmF0aW9uU3ltYm9sT2ZOb2RlKG5vZGU6IHRzLk5vZGUsIGNoZWNrZXI6IHRzLlR5cGVDaGVja2VyKTogdHMuU3ltYm9sfHVuZGVmaW5lZCB7XG4gIGNvbnN0IHN5bWJvbCA9IGNoZWNrZXIuZ2V0U3ltYm9sQXRMb2NhdGlvbihub2RlKTtcblxuICAvLyBTeW1ib2xzIGNhbiBiZSBhbGlhc2VzIG9mIHRoZSBkZWNsYXJhdGlvbiBzeW1ib2wuIGUuZy4gaW4gbmFtZWQgaW1wb3J0IHNwZWNpZmllcnMuXG4gIC8vIFdlIG5lZWQgdG8gcmVzb2x2ZSB0aGUgYWxpYXNlZCBzeW1ib2wgYmFjayB0byB0aGUgZGVjbGFyYXRpb24gc3ltYm9sLlxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYml0d2lzZVxuICBpZiAoc3ltYm9sICYmIChzeW1ib2wuZmxhZ3MgJiB0cy5TeW1ib2xGbGFncy5BbGlhcykgIT09IDApIHtcbiAgICByZXR1cm4gY2hlY2tlci5nZXRBbGlhc2VkU3ltYm9sKHN5bWJvbCk7XG4gIH1cbiAgcmV0dXJuIHN5bWJvbDtcbn1cblxuXG4vKiogVHJpZXMgdG8gcmVzb2x2ZSB0aGUgbmFtZSBvZiB0aGUgTWF0ZXJpYWwgbW9kdWxlIHRoYXQgYSBub2RlIGlzIGltcG9ydGVkIGZyb20uICovXG5mdW5jdGlvbiByZXNvbHZlTW9kdWxlTmFtZShub2RlOiB0cy5JZGVudGlmaWVyLCB0eXBlQ2hlY2tlcjogdHMuVHlwZUNoZWNrZXIpIHtcbiAgLy8gR2V0IHRoZSBzeW1ib2wgZm9yIHRoZSBuYW1lZCBiaW5kaW5nIGVsZW1lbnQuIE5vdGUgdGhhdCB3ZSBjYW5ub3QgZGV0ZXJtaW5lIHRoZVxuICAvLyB2YWx1ZSBkZWNsYXJhdGlvbiBiYXNlZCBvbiB0aGUgdHlwZSBvZiB0aGUgZWxlbWVudCBhcyB0eXBlcyBhcmUgbm90IG5lY2Vzc2FyaWx5XG4gIC8vIHNwZWNpZmljIHRvIGEgZ2l2ZW4gc2Vjb25kYXJ5IGVudHJ5LXBvaW50IChlLmcuIGV4cG9ydHMgd2l0aCB0aGUgdHlwZSBvZiBcInN0cmluZ1wiKVxuICAvLyB3b3VsZCByZXNvbHZlIHRvIHRoZSBtb2R1bGUgdHlwZXMgcHJvdmlkZWQgYnkgVHlwZVNjcmlwdCBpdHNlbGYuXG4gIGNvbnN0IHN5bWJvbCA9IGdldERlY2xhcmF0aW9uU3ltYm9sT2ZOb2RlKG5vZGUsIHR5cGVDaGVja2VyKTtcblxuICAvLyBJZiB0aGUgc3ltYm9sIGNhbid0IGJlIGZvdW5kLCBvciBubyBkZWNsYXJhdGlvbiBjb3VsZCBiZSBmb3VuZCB3aXRoaW5cbiAgLy8gdGhlIHN5bWJvbCwgYWRkIGZhaWx1cmUgdG8gcmVwb3J0IHRoYXQgdGhlIGdpdmVuIHN5bWJvbCBjYW4ndCBiZSBmb3VuZC5cbiAgaWYgKCFzeW1ib2wgfHxcbiAgICAgICEoc3ltYm9sLnZhbHVlRGVjbGFyYXRpb24gfHwgKHN5bWJvbC5kZWNsYXJhdGlvbnMgJiYgc3ltYm9sLmRlY2xhcmF0aW9ucy5sZW5ndGggIT09IDApKSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLy8gVGhlIGZpbGVuYW1lIGZvciB0aGUgc291cmNlIGZpbGUgb2YgdGhlIG5vZGUgdGhhdCBjb250YWlucyB0aGVcbiAgLy8gZmlyc3QgZGVjbGFyYXRpb24gb2YgdGhlIHN5bWJvbC4gQWxsIHN5bWJvbCBkZWNsYXJhdGlvbnMgbXVzdCBiZVxuICAvLyBwYXJ0IG9mIGEgZGVmaW5pbmcgbm9kZSwgc28gcGFyZW50IGNhbiBiZSBhc3NlcnRlZCB0byBiZSBkZWZpbmVkLlxuICBjb25zdCByZXNvbHZlZE5vZGUgPSBzeW1ib2wudmFsdWVEZWNsYXJhdGlvbiB8fCBzeW1ib2wuZGVjbGFyYXRpb25zWzBdO1xuICBjb25zdCBzb3VyY2VGaWxlID0gcmVzb2x2ZWROb2RlLmdldFNvdXJjZUZpbGUoKS5maWxlTmFtZTtcblxuICAvLyBGaWxlIHRoZSBtb2R1bGUgdGhlIHN5bWJvbCBiZWxvbmdzIHRvIGZyb20gYSByZWdleCBtYXRjaCBvZiB0aGVcbiAgLy8gZmlsZW5hbWUuIFRoaXMgd2lsbCBhbHdheXMgbWF0Y2ggc2luY2Ugb25seSBcIkBhbmd1bGFyL21hdGVyaWFsXCJcbiAgLy8gZWxlbWVudHMgYXJlIGFuYWx5emVkLlxuICBjb25zdCBtYXRjaGVzID0gc291cmNlRmlsZS5tYXRjaChBTkdVTEFSX01BVEVSSUFMX0ZJTEVQQVRIX1JFR0VYKTtcbiAgcmV0dXJuIG1hdGNoZXMgPyBtYXRjaGVzWzFdIDogbnVsbDtcbn1cbiJdfQ==