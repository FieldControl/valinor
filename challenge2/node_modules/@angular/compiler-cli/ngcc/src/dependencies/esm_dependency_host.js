(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/dependencies/esm_dependency_host", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/ngcc/src/dependencies/dependency_host"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isStringImportOrReexport = exports.hasImportOrReexportStatements = exports.EsmDependencyHost = void 0;
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var ts = require("typescript");
    var dependency_host_1 = require("@angular/compiler-cli/ngcc/src/dependencies/dependency_host");
    /**
     * Helper functions for computing dependencies.
     */
    var EsmDependencyHost = /** @class */ (function (_super) {
        tslib_1.__extends(EsmDependencyHost, _super);
        function EsmDependencyHost(fs, moduleResolver, scanImportExpressions) {
            if (scanImportExpressions === void 0) { scanImportExpressions = true; }
            var _this = _super.call(this, fs, moduleResolver) || this;
            _this.scanImportExpressions = scanImportExpressions;
            // By skipping trivia here we don't have to account for it in the processing below
            // It has no relevance to capturing imports.
            _this.scanner = ts.createScanner(ts.ScriptTarget.Latest, /* skipTrivia */ true);
            return _this;
        }
        EsmDependencyHost.prototype.canSkipFile = function (fileContents) {
            return !hasImportOrReexportStatements(fileContents);
        };
        /**
         * Extract any import paths from imports found in the contents of this file.
         *
         * This implementation uses the TypeScript scanner, which tokenizes source code,
         * to process the string. This is halfway between working with the string directly,
         * which is too difficult due to corner cases, and parsing the string into a full
         * TypeScript Abstract Syntax Tree (AST), which ends up doing more processing than
         * is needed.
         *
         * The scanning is not trivial because we must hold state between each token since
         * the context of the token affects how it should be scanned, and the scanner does
         * not manage this for us.
         *
         * Specifically, backticked strings are particularly challenging since it is possible
         * to recursively nest backticks and TypeScript expressions within each other.
         */
        EsmDependencyHost.prototype.extractImports = function (file, fileContents) {
            var imports = new Set();
            var templateStack = [];
            var lastToken = ts.SyntaxKind.Unknown;
            var currentToken = ts.SyntaxKind.Unknown;
            var stopAtIndex = findLastPossibleImportOrReexport(fileContents);
            this.scanner.setText(fileContents);
            while ((currentToken = this.scanner.scan()) !== ts.SyntaxKind.EndOfFileToken) {
                if (this.scanner.getTokenPos() > stopAtIndex) {
                    break;
                }
                switch (currentToken) {
                    case ts.SyntaxKind.TemplateHead:
                        // TemplateHead indicates the beginning of a backticked string
                        // Capture this in the `templateStack` to indicate we are currently processing
                        // within the static text part of a backticked string.
                        templateStack.push(currentToken);
                        break;
                    case ts.SyntaxKind.OpenBraceToken:
                        if (templateStack.length > 0) {
                            // We are processing a backticked string. This indicates that we are either
                            // entering an interpolation expression or entering an object literal expression.
                            // We add it to the `templateStack` so we can track when we leave the interpolation or
                            // object literal.
                            templateStack.push(currentToken);
                        }
                        break;
                    case ts.SyntaxKind.CloseBraceToken:
                        if (templateStack.length > 0) {
                            // We are processing a backticked string then this indicates that we are either
                            // leaving an interpolation expression or leaving an object literal expression.
                            var templateToken = templateStack[templateStack.length - 1];
                            if (templateToken === ts.SyntaxKind.TemplateHead) {
                                // We have hit a nested backticked string so we need to rescan it in that context
                                currentToken = this.scanner.reScanTemplateToken(/* isTaggedTemplate */ false);
                                if (currentToken === ts.SyntaxKind.TemplateTail) {
                                    // We got to the end of the backticked string so pop the token that started it off
                                    // the stack.
                                    templateStack.pop();
                                }
                            }
                            else {
                                // We hit the end of an object-literal expression so pop the open-brace that started
                                // it off the stack.
                                templateStack.pop();
                            }
                        }
                        break;
                    case ts.SyntaxKind.SlashToken:
                    case ts.SyntaxKind.SlashEqualsToken:
                        if (canPrecedeARegex(lastToken)) {
                            // We have hit a slash (`/`) in a context where it could be the start of a regular
                            // expression so rescan it in that context
                            currentToken = this.scanner.reScanSlashToken();
                        }
                        break;
                    case ts.SyntaxKind.ImportKeyword:
                        var importPath = this.extractImportPath();
                        if (importPath !== null) {
                            imports.add(importPath);
                        }
                        break;
                    case ts.SyntaxKind.ExportKeyword:
                        var reexportPath = this.extractReexportPath();
                        if (reexportPath !== null) {
                            imports.add(reexportPath);
                        }
                        break;
                }
                lastToken = currentToken;
            }
            // Clear the text from the scanner to avoid holding on to potentially large strings of source
            // content after the scanning has completed.
            this.scanner.setText('');
            return imports;
        };
        /**
         * We have found an `import` token so now try to identify the import path.
         *
         * This method will use the current state of `this.scanner` to extract a string literal module
         * specifier. It expects that the current state of the scanner is that an `import` token has just
         * been scanned.
         *
         * The following forms of import are matched:
         *
         * * `import "module-specifier";`
         * * `import("module-specifier")`
         * * `import defaultBinding from "module-specifier";`
         * * `import defaultBinding, * as identifier from "module-specifier";`
         * * `import defaultBinding, {...} from "module-specifier";`
         * * `import * as identifier from "module-specifier";`
         * * `import {...} from "module-specifier";`
         *
         * @returns the import path or null if there is no import or it is not a string literal.
         */
        EsmDependencyHost.prototype.extractImportPath = function () {
            // Check for side-effect import
            var sideEffectImportPath = this.tryStringLiteral();
            if (sideEffectImportPath !== null) {
                return sideEffectImportPath;
            }
            var kind = this.scanner.getToken();
            // Check for dynamic import expression
            if (kind === ts.SyntaxKind.OpenParenToken) {
                return this.scanImportExpressions ? this.tryStringLiteral() : null;
            }
            // Check for defaultBinding
            if (kind === ts.SyntaxKind.Identifier) {
                // Skip default binding
                kind = this.scanner.scan();
                if (kind === ts.SyntaxKind.CommaToken) {
                    // Skip comma that indicates additional import bindings
                    kind = this.scanner.scan();
                }
            }
            // Check for namespace import clause
            if (kind === ts.SyntaxKind.AsteriskToken) {
                kind = this.skipNamespacedClause();
                if (kind === null) {
                    return null;
                }
            }
            // Check for named imports clause
            else if (kind === ts.SyntaxKind.OpenBraceToken) {
                kind = this.skipNamedClause();
            }
            // Expect a `from` clause, if not bail out
            if (kind !== ts.SyntaxKind.FromKeyword) {
                return null;
            }
            return this.tryStringLiteral();
        };
        /**
         * We have found an `export` token so now try to identify a re-export path.
         *
         * This method will use the current state of `this.scanner` to extract a string literal module
         * specifier. It expects that the current state of the scanner is that an `export` token has
         * just been scanned.
         *
         * There are three forms of re-export that are matched:
         *
         * * `export * from '...';
         * * `export * as alias from '...';
         * * `export {...} from '...';
         */
        EsmDependencyHost.prototype.extractReexportPath = function () {
            // Skip the `export` keyword
            var token = this.scanner.scan();
            if (token === ts.SyntaxKind.AsteriskToken) {
                token = this.skipNamespacedClause();
                if (token === null) {
                    return null;
                }
            }
            else if (token === ts.SyntaxKind.OpenBraceToken) {
                token = this.skipNamedClause();
            }
            // Expect a `from` clause, if not bail out
            if (token !== ts.SyntaxKind.FromKeyword) {
                return null;
            }
            return this.tryStringLiteral();
        };
        EsmDependencyHost.prototype.skipNamespacedClause = function () {
            // Skip past the `*`
            var token = this.scanner.scan();
            // Check for a `* as identifier` alias clause
            if (token === ts.SyntaxKind.AsKeyword) {
                // Skip past the `as` keyword
                token = this.scanner.scan();
                // Expect an identifier, if not bail out
                if (token !== ts.SyntaxKind.Identifier) {
                    return null;
                }
                // Skip past the identifier
                token = this.scanner.scan();
            }
            return token;
        };
        EsmDependencyHost.prototype.skipNamedClause = function () {
            var braceCount = 1;
            // Skip past the initial opening brace `{`
            var token = this.scanner.scan();
            // Search for the matching closing brace `}`
            while (braceCount > 0 && token !== ts.SyntaxKind.EndOfFileToken) {
                if (token === ts.SyntaxKind.OpenBraceToken) {
                    braceCount++;
                }
                else if (token === ts.SyntaxKind.CloseBraceToken) {
                    braceCount--;
                }
                token = this.scanner.scan();
            }
            return token;
        };
        EsmDependencyHost.prototype.tryStringLiteral = function () {
            return this.scanner.scan() === ts.SyntaxKind.StringLiteral ? this.scanner.getTokenValue() :
                null;
        };
        return EsmDependencyHost;
    }(dependency_host_1.DependencyHostBase));
    exports.EsmDependencyHost = EsmDependencyHost;
    /**
     * Check whether a source file needs to be parsed for imports.
     * This is a performance short-circuit, which saves us from creating
     * a TypeScript AST unnecessarily.
     *
     * @param source The content of the source file to check.
     *
     * @returns false if there are definitely no import or re-export statements
     * in this file, true otherwise.
     */
    function hasImportOrReexportStatements(source) {
        return /(?:import|export)[\s\S]+?(["'])(?:\\\1|.)+?\1/.test(source);
    }
    exports.hasImportOrReexportStatements = hasImportOrReexportStatements;
    function findLastPossibleImportOrReexport(source) {
        return Math.max(source.lastIndexOf('import'), source.lastIndexOf(' from '));
    }
    /**
     * Check whether the given statement is an import with a string literal module specifier.
     * @param stmt the statement node to check.
     * @returns true if the statement is an import with a string literal module specifier.
     */
    function isStringImportOrReexport(stmt) {
        return ts.isImportDeclaration(stmt) ||
            ts.isExportDeclaration(stmt) && !!stmt.moduleSpecifier &&
                ts.isStringLiteral(stmt.moduleSpecifier);
    }
    exports.isStringImportOrReexport = isStringImportOrReexport;
    function canPrecedeARegex(kind) {
        switch (kind) {
            case ts.SyntaxKind.Identifier:
            case ts.SyntaxKind.StringLiteral:
            case ts.SyntaxKind.NumericLiteral:
            case ts.SyntaxKind.BigIntLiteral:
            case ts.SyntaxKind.RegularExpressionLiteral:
            case ts.SyntaxKind.ThisKeyword:
            case ts.SyntaxKind.PlusPlusToken:
            case ts.SyntaxKind.MinusMinusToken:
            case ts.SyntaxKind.CloseParenToken:
            case ts.SyntaxKind.CloseBracketToken:
            case ts.SyntaxKind.CloseBraceToken:
            case ts.SyntaxKind.TrueKeyword:
            case ts.SyntaxKind.FalseKeyword:
                return false;
            default:
                return true;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXNtX2RlcGVuZGVuY3lfaG9zdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9uZ2NjL3NyYy9kZXBlbmRlbmNpZXMvZXNtX2RlcGVuZGVuY3lfaG9zdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsK0JBQWlDO0lBRWpDLCtGQUFxRDtJQUdyRDs7T0FFRztJQUNIO1FBQXVDLDZDQUFrQjtRQUN2RCwyQkFDSSxFQUFzQixFQUFFLGNBQThCLEVBQzlDLHFCQUE0QjtZQUE1QixzQ0FBQSxFQUFBLDRCQUE0QjtZQUZ4QyxZQUdFLGtCQUFNLEVBQUUsRUFBRSxjQUFjLENBQUMsU0FDMUI7WUFGVywyQkFBcUIsR0FBckIscUJBQXFCLENBQU87WUFHeEMsa0ZBQWtGO1lBQ2xGLDRDQUE0QztZQUNwQyxhQUFPLEdBQUcsRUFBRSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7UUFIbEYsQ0FBQztRQUtTLHVDQUFXLEdBQXJCLFVBQXNCLFlBQW9CO1lBQ3hDLE9BQU8sQ0FBQyw2QkFBNkIsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUN0RCxDQUFDO1FBRUQ7Ozs7Ozs7Ozs7Ozs7OztXQWVHO1FBQ08sMENBQWMsR0FBeEIsVUFBeUIsSUFBb0IsRUFBRSxZQUFvQjtZQUNqRSxJQUFNLE9BQU8sR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO1lBQ2xDLElBQU0sYUFBYSxHQUFvQixFQUFFLENBQUM7WUFDMUMsSUFBSSxTQUFTLEdBQWtCLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDO1lBQ3JELElBQUksWUFBWSxHQUFrQixFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQztZQUN4RCxJQUFNLFdBQVcsR0FBRyxnQ0FBZ0MsQ0FBQyxZ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QUNuQyxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsaUJBQWlCLENBQUM7WUFDckMsS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQztZQUNuQyxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDO1lBQy9CLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxZQUFZO2dCQUM3QixPQUFPLEtBQUssQ0FBQztZQUNmO2dCQUNFLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7SUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcbmltcG9ydCB7QWJzb2x1dGVGc1BhdGgsIFJlYWRvbmx5RmlsZVN5c3RlbX0gZnJvbSAnLi4vLi4vLi4vc3JjL25ndHNjL2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7RGVwZW5kZW5jeUhvc3RCYXNlfSBmcm9tICcuL2RlcGVuZGVuY3lfaG9zdCc7XG5pbXBvcnQge01vZHVsZVJlc29sdmVyfSBmcm9tICcuL21vZHVsZV9yZXNvbHZlcic7XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9ucyBmb3IgY29tcHV0aW5nIGRlcGVuZGVuY2llcy5cbiAqL1xuZXhwb3J0IGNsYXNzIEVzbURlcGVuZGVuY3lIb3N0IGV4dGVuZHMgRGVwZW5kZW5jeUhvc3RCYXNlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBmczogUmVhZG9ubHlGaWxlU3lzdGVtLCBtb2R1bGVSZXNvbHZlcjogTW9kdWxlUmVzb2x2ZXIsXG4gICAgICBwcml2YXRlIHNjYW5JbXBvcnRFeHByZXNzaW9ucyA9IHRydWUpIHtcbiAgICBzdXBlcihmcywgbW9kdWxlUmVzb2x2ZXIpO1xuICB9XG4gIC8vIEJ5IHNraXBwaW5nIHRyaXZpYSBoZXJlIHdlIGRvbid0IGhhdmUgdG8gYWNjb3VudCBmb3IgaXQgaW4gdGhlIHByb2Nlc3NpbmcgYmVsb3dcbiAgLy8gSXQgaGFzIG5vIHJlbGV2YW5jZSB0byBjYXB0dXJpbmcgaW1wb3J0cy5cbiAgcHJpdmF0ZSBzY2FubmVyID0gdHMuY3JlYXRlU2Nhbm5lcih0cy5TY3JpcHRUYXJnZXQuTGF0ZXN0LCAvKiBza2lwVHJpdmlhICovIHRydWUpO1xuXG4gIHByb3RlY3RlZCBjYW5Ta2lwRmlsZShmaWxlQ29udGVudHM6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhaGFzSW1wb3J0T3JSZWV4cG9ydFN0YXRlbWVudHMoZmlsZUNvbnRlbnRzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeHRyYWN0IGFueSBpbXBvcnQgcGF0aHMgZnJvbSBpbXBvcnRzIGZvdW5kIGluIHRoZSBjb250ZW50cyBvZiB0aGlzIGZpbGUuXG4gICAqXG4gICAqIFRoaXMgaW1wbGVtZW50YXRpb24gdXNlcyB0aGUgVHlwZVNjcmlwdCBzY2FubmVyLCB3aGljaCB0b2tlbml6ZXMgc291cmNlIGNvZGUsXG4gICAqIHRvIHByb2Nlc3MgdGhlIHN0cmluZy4gVGhpcyBpcyBoYWxmd2F5IGJldHdlZW4gd29ya2luZyB3aXRoIHRoZSBzdHJpbmcgZGlyZWN0bHksXG4gICAqIHdoaWNoIGlzIHRvbyBkaWZmaWN1bHQgZHVlIHRvIGNvcm5lciBjYXNlcywgYW5kIHBhcnNpbmcgdGhlIHN0cmluZyBpbnRvIGEgZnVsbFxuICAgKiBUeXBlU2NyaXB0IEFic3RyYWN0IFN5bnRheCBUcmVlIChBU1QpLCB3aGljaCBlbmRzIHVwIGRvaW5nIG1vcmUgcHJvY2Vzc2luZyB0aGFuXG4gICAqIGlzIG5lZWRlZC5cbiAgICpcbiAgICogVGhlIHNjYW5uaW5nIGlzIG5vdCB0cml2aWFsIGJlY2F1c2Ugd2UgbXVzdCBob2xkIHN0YXRlIGJldHdlZW4gZWFjaCB0b2tlbiBzaW5jZVxuICAgKiB0aGUgY29udGV4dCBvZiB0aGUgdG9rZW4gYWZmZWN0cyBob3cgaXQgc2hvdWxkIGJlIHNjYW5uZWQsIGFuZCB0aGUgc2Nhbm5lciBkb2VzXG4gICAqIG5vdCBtYW5hZ2UgdGhpcyBmb3IgdXMuXG4gICAqXG4gICAqIFNwZWNpZmljYWxseSwgYmFja3RpY2tlZCBzdHJpbmdzIGFyZSBwYXJ0aWN1bGFybHkgY2hhbGxlbmdpbmcgc2luY2UgaXQgaXMgcG9zc2libGVcbiAgICogdG8gcmVjdXJzaXZlbHkgbmVzdCBiYWNrdGlja3MgYW5kIFR5cGVTY3JpcHQgZXhwcmVzc2lvbnMgd2l0aGluIGVhY2ggb3RoZXIuXG4gICAqL1xuICBwcm90ZWN0ZWQgZXh0cmFjdEltcG9ydHMoZmlsZTogQWJzb2x1dGVGc1BhdGgsIGZpbGVDb250ZW50czogc3RyaW5nKTogU2V0PHN0cmluZz4ge1xuICAgIGNvbnN0IGltcG9ydHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICBjb25zdCB0ZW1wbGF0ZVN0YWNrOiB0cy5TeW50YXhLaW5kW10gPSBbXTtcbiAgICBsZXQgbGFzdFRva2VuOiB0cy5TeW50YXhLaW5kID0gdHMuU3ludGF4S2luZC5Vbmtub3duO1xuICAgIGxldCBjdXJyZW50VG9rZW46IHRzLlN5bnRheEtpbmQgPSB0cy5TeW50YXhLaW5kLlVua25vd247XG4gICAgY29uc3Qgc3RvcEF0SW5kZXggPSBmaW5kTGFzdFBvc3NpYmxlSW1wb3J0T3JSZWV4cG9ydChmaWxlQ29udGVudHMpO1xuXG4gICAgdGhpcy5zY2FubmVyLnNldFRleHQoZmlsZUNvbnRlbnRzKTtcblxuICAgIHdoaWxlICgoY3VycmVudFRva2VuID0gdGhpcy5zY2FubmVyLnNjYW4oKSkgIT09IHRzLlN5bnRheEtpbmQuRW5kT2ZGaWxlVG9rZW4pIHtcbiAgICAgIGlmICh0aGlzLnNjYW5uZXIuZ2V0VG9rZW5Qb3MoKSA+IHN0b3BBdEluZGV4KSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgc3dpdGNoIChjdXJyZW50VG9rZW4pIHtcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlRlbXBsYXRlSGVhZDpcbiAgICAgICAgICAvLyBUZW1wbGF0ZUhlYWQgaW5kaWNhdGVzIHRoZSBiZWdpbm5pbmcgb2YgYSBiYWNrdGlja2VkIHN0cmluZ1xuICAgICAgICAgIC8vIENhcHR1cmUgdGhpcyBpbiB0aGUgYHRlbXBsYXRlU3RhY2tgIHRvIGluZGljYXRlIHdlIGFyZSBjdXJyZW50bHkgcHJvY2Vzc2luZ1xuICAgICAgICAgIC8vIHdpdGhpbiB0aGUgc3RhdGljIHRleHQgcGFydCBvZiBhIGJhY2t0aWNrZWQgc3RyaW5nLlxuICAgICAgICAgIHRlbXBsYXRlU3RhY2sucHVzaChjdXJyZW50VG9rZW4pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuT3BlbkJyYWNlVG9rZW46XG4gICAgICAgICAgaWYgKHRlbXBsYXRlU3RhY2subGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgLy8gV2UgYXJlIHByb2Nlc3NpbmcgYSBiYWNrdGlja2VkIHN0cmluZy4gVGhpcyBpbmRpY2F0ZXMgdGhhdCB3ZSBhcmUgZWl0aGVyXG4gICAgICAgICAgICAvLyBlbnRlcmluZyBhbiBpbnRlcnBvbGF0aW9uIGV4cHJlc3Npb24gb3IgZW50ZXJpbmcgYW4gb2JqZWN0IGxpdGVyYWwgZXhwcmVzc2lvbi5cbiAgICAgICAgICAgIC8vIFdlIGFkZCBpdCB0byB0aGUgYHRlbXBsYXRlU3RhY2tgIHNvIHdlIGNhbiB0cmFjayB3aGVuIHdlIGxlYXZlIHRoZSBpbnRlcnBvbGF0aW9uIG9yXG4gICAgICAgICAgICAvLyBvYmplY3QgbGl0ZXJhbC5cbiAgICAgICAgICAgIHRlbXBsYXRlU3RhY2sucHVzaChjdXJyZW50VG9rZW4pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkNsb3NlQnJhY2VUb2tlbjpcbiAgICAgICAgICBpZiAodGVtcGxhdGVTdGFjay5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAvLyBXZSBhcmUgcHJvY2Vzc2luZyBhIGJhY2t0aWNrZWQgc3RyaW5nIHRoZW4gdGhpcyBpbmRpY2F0ZXMgdGhhdCB3ZSBhcmUgZWl0aGVyXG4gICAgICAgICAgICAvLyBsZWF2aW5nIGFuIGludGVycG9sYXRpb24gZXhwcmVzc2lvbiBvciBsZWF2aW5nIGFuIG9iamVjdCBsaXRlcmFsIGV4cHJlc3Npb24uXG4gICAgICAgICAgICBjb25zdCB0ZW1wbGF0ZVRva2VuID0gdGVtcGxhdGVTdGFja1t0ZW1wbGF0ZVN0YWNrLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgaWYgKHRlbXBsYXRlVG9rZW4gPT09IHRzLlN5bnRheEtpbmQuVGVtcGxhdGVIZWFkKSB7XG4gICAgICAgICAgICAgIC8vIFdlIGhhdmUgaGl0IGEgbmVzdGVkIGJhY2t0aWNrZWQgc3RyaW5nIHNvIHdlIG5lZWQgdG8gcmVzY2FuIGl0IGluIHRoYXQgY29udGV4dFxuICAgICAgICAgICAgICBjdXJyZW50VG9rZW4gPSB0aGlzLnNjYW5uZXIucmVTY2FuVGVtcGxhdGVUb2tlbigvKiBpc1RhZ2dlZFRlbXBsYXRlICovIGZhbHNlKTtcbiAgICAgICAgICAgICAgaWYgKGN1cnJlbnRUb2tlbiA9PT0gdHMuU3ludGF4S2luZC5UZW1wbGF0ZVRhaWwpIHtcbiAgICAgICAgICAgICAgICAvLyBXZSBnb3QgdG8gdGhlIGVuZCBvZiB0aGUgYmFja3RpY2tlZCBzdHJpbmcgc28gcG9wIHRoZSB0b2tlbiB0aGF0IHN0YXJ0ZWQgaXQgb2ZmXG4gICAgICAgICAgICAgICAgLy8gdGhlIHN0YWNrLlxuICAgICAgICAgICAgICAgIHRlbXBsYXRlU3RhY2sucG9wKCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIFdlIGhpdCB0aGUgZW5kIG9mIGFuIG9iamVjdC1saXRlcmFsIGV4cHJlc3Npb24gc28gcG9wIHRoZSBvcGVuLWJyYWNlIHRoYXQgc3RhcnRlZFxuICAgICAgICAgICAgICAvLyBpdCBvZmYgdGhlIHN0YWNrLlxuICAgICAgICAgICAgICB0ZW1wbGF0ZVN0YWNrLnBvcCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlNsYXNoVG9rZW46XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5TbGFzaEVxdWFsc1Rva2VuOlxuICAgICAgICAgIGlmIChjYW5QcmVjZWRlQVJlZ2V4KGxhc3RUb2tlbikpIHtcbiAgICAgICAgICAgIC8vIFdlIGhhdmUgaGl0IGEgc2xhc2ggKGAvYCkgaW4gYSBjb250ZXh0IHdoZXJlIGl0IGNvdWxkIGJlIHRoZSBzdGFydCBvZiBhIHJlZ3VsYXJcbiAgICAgICAgICAgIC8vIGV4cHJlc3Npb24gc28gcmVzY2FuIGl0IGluIHRoYXQgY29udGV4dFxuICAgICAgICAgICAgY3VycmVudFRva2VuID0gdGhpcy5zY2FubmVyLnJlU2NhblNsYXNoVG9rZW4oKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5JbXBvcnRLZXl3b3JkOlxuICAgICAgICAgIGNvbnN0IGltcG9ydFBhdGggPSB0aGlzLmV4dHJhY3RJbXBvcnRQYXRoKCk7XG4gICAgICAgICAgaWYgKGltcG9ydFBhdGggIT09IG51bGwpIHtcbiAgICAgICAgICAgIGltcG9ydHMuYWRkKGltcG9ydFBhdGgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkV4cG9ydEtleXdvcmQ6XG4gICAgICAgICAgY29uc3QgcmVleHBvcnRQYXRoID0gdGhpcy5leHRyYWN0UmVleHBvcnRQYXRoKCk7XG4gICAgICAgICAgaWYgKHJlZXhwb3J0UGF0aCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgaW1wb3J0cy5hZGQocmVleHBvcnRQYXRoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBsYXN0VG9rZW4gPSBjdXJyZW50VG9rZW47XG4gICAgfVxuXG4gICAgLy8gQ2xlYXIgdGhlIHRleHQgZnJvbSB0aGUgc2Nhbm5lciB0byBhdm9pZCBob2xkaW5nIG9uIHRvIHBvdGVudGlhbGx5IGxhcmdlIHN0cmluZ3Mgb2Ygc291cmNlXG4gICAgLy8gY29udGVudCBhZnRlciB0aGUgc2Nhbm5pbmcgaGFzIGNvbXBsZXRlZC5cbiAgICB0aGlzLnNjYW5uZXIuc2V0VGV4dCgnJyk7XG5cbiAgICByZXR1cm4gaW1wb3J0cztcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFdlIGhhdmUgZm91bmQgYW4gYGltcG9ydGAgdG9rZW4gc28gbm93IHRyeSB0byBpZGVudGlmeSB0aGUgaW1wb3J0IHBhdGguXG4gICAqXG4gICAqIFRoaXMgbWV0aG9kIHdpbGwgdXNlIHRoZSBjdXJyZW50IHN0YXRlIG9mIGB0aGlzLnNjYW5uZXJgIHRvIGV4dHJhY3QgYSBzdHJpbmcgbGl0ZXJhbCBtb2R1bGVcbiAgICogc3BlY2lmaWVyLiBJdCBleHBlY3RzIHRoYXQgdGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIHNjYW5uZXIgaXMgdGhhdCBhbiBgaW1wb3J0YCB0b2tlbiBoYXMganVzdFxuICAgKiBiZWVuIHNjYW5uZWQuXG4gICAqXG4gICAqIFRoZSBmb2xsb3dpbmcgZm9ybXMgb2YgaW1wb3J0IGFyZSBtYXRjaGVkOlxuICAgKlxuICAgKiAqIGBpbXBvcnQgXCJtb2R1bGUtc3BlY2lmaWVyXCI7YFxuICAgKiAqIGBpbXBvcnQoXCJtb2R1bGUtc3BlY2lmaWVyXCIpYFxuICAgKiAqIGBpbXBvcnQgZGVmYXVsdEJpbmRpbmcgZnJvbSBcIm1vZHVsZS1zcGVjaWZpZXJcIjtgXG4gICAqICogYGltcG9ydCBkZWZhdWx0QmluZGluZywgKiBhcyBpZGVudGlmaWVyIGZyb20gXCJtb2R1bGUtc3BlY2lmaWVyXCI7YFxuICAgKiAqIGBpbXBvcnQgZGVmYXVsdEJpbmRpbmcsIHsuLi59IGZyb20gXCJtb2R1bGUtc3BlY2lmaWVyXCI7YFxuICAgKiAqIGBpbXBvcnQgKiBhcyBpZGVudGlmaWVyIGZyb20gXCJtb2R1bGUtc3BlY2lmaWVyXCI7YFxuICAgKiAqIGBpbXBvcnQgey4uLn0gZnJvbSBcIm1vZHVsZS1zcGVjaWZpZXJcIjtgXG4gICAqXG4gICAqIEByZXR1cm5zIHRoZSBpbXBvcnQgcGF0aCBvciBudWxsIGlmIHRoZXJlIGlzIG5vIGltcG9ydCBvciBpdCBpcyBub3QgYSBzdHJpbmcgbGl0ZXJhbC5cbiAgICovXG4gIHByb3RlY3RlZCBleHRyYWN0SW1wb3J0UGF0aCgpOiBzdHJpbmd8bnVsbCB7XG4gICAgLy8gQ2hlY2sgZm9yIHNpZGUtZWZmZWN0IGltcG9ydFxuICAgIGxldCBzaWRlRWZmZWN0SW1wb3J0UGF0aCA9IHRoaXMudHJ5U3RyaW5nTGl0ZXJhbCgpO1xuICAgIGlmIChzaWRlRWZmZWN0SW1wb3J0UGF0aCAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHNpZGVFZmZlY3RJbXBvcnRQYXRoO1xuICAgIH1cblxuICAgIGxldCBraW5kOiB0cy5TeW50YXhLaW5kfG51bGwgPSB0aGlzLnNjYW5uZXIuZ2V0VG9rZW4oKTtcblxuICAgIC8vIENoZWNrIGZvciBkeW5hbWljIGltcG9ydCBleHByZXNzaW9uXG4gICAgaWYgKGtpbmQgPT09IHRzLlN5bnRheEtpbmQuT3BlblBhcmVuVG9rZW4pIHtcbiAgICAgIHJldHVybiB0aGlzLnNjYW5JbXBvcnRFeHByZXNzaW9ucyA/IHRoaXMudHJ5U3RyaW5nTGl0ZXJhbCgpIDogbnVsbDtcbiAgICB9XG5cbiAgICAvLyBDaGVjayBmb3IgZGVmYXVsdEJpbmRpbmdcbiAgICBpZiAoa2luZCA9PT0gdHMuU3ludGF4S2luZC5JZGVudGlmaWVyKSB7XG4gICAgICAvLyBTa2lwIGRlZmF1bHQgYmluZGluZ1xuICAgICAga2luZCA9IHRoaXMuc2Nhbm5lci5zY2FuKCk7XG4gICAgICBpZiAoa2luZCA9PT0gdHMuU3ludGF4S2luZC5Db21tYVRva2VuKSB7XG4gICAgICAgIC8vIFNraXAgY29tbWEgdGhhdCBpbmRpY2F0ZXMgYWRkaXRpb25hbCBpbXBvcnQgYmluZGluZ3NcbiAgICAgICAga2luZCA9IHRoaXMuc2Nhbm5lci5zY2FuKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgZm9yIG5hbWVzcGFjZSBpbXBvcnQgY2xhdXNlXG4gICAgaWYgKGtpbmQgPT09IHRzLlN5bnRheEtpbmQuQXN0ZXJpc2tUb2tlbikge1xuICAgICAga2luZCA9IHRoaXMuc2tpcE5hbWVzcGFjZWRDbGF1c2UoKTtcbiAgICAgIGlmIChraW5kID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBDaGVjayBmb3IgbmFtZWQgaW1wb3J0cyBjbGF1c2VcbiAgICBlbHNlIGlmIChraW5kID09PSB0cy5TeW50YXhLaW5kLk9wZW5CcmFjZVRva2VuKSB7XG4gICAgICBraW5kID0gdGhpcy5za2lwTmFtZWRDbGF1c2UoKTtcbiAgICB9XG5cbiAgICAvLyBFeHBlY3QgYSBgZnJvbWAgY2xhdXNlLCBpZiBub3QgYmFpbCBvdXRcbiAgICBpZiAoa2luZCAhPT0gdHMuU3ludGF4S2luZC5Gcm9tS2V5d29yZCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMudHJ5U3RyaW5nTGl0ZXJhbCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFdlIGhhdmUgZm91bmQgYW4gYGV4cG9ydGAgdG9rZW4gc28gbm93IHRyeSB0byBpZGVudGlmeSBhIHJlLWV4cG9ydCBwYXRoLlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCB3aWxsIHVzZSB0aGUgY3VycmVudCBzdGF0ZSBvZiBgdGhpcy5zY2FubmVyYCB0byBleHRyYWN0IGEgc3RyaW5nIGxpdGVyYWwgbW9kdWxlXG4gICAqIHNwZWNpZmllci4gSXQgZXhwZWN0cyB0aGF0IHRoZSBjdXJyZW50IHN0YXRlIG9mIHRoZSBzY2FubmVyIGlzIHRoYXQgYW4gYGV4cG9ydGAgdG9rZW4gaGFzXG4gICAqIGp1c3QgYmVlbiBzY2FubmVkLlxuICAgKlxuICAgKiBUaGVyZSBhcmUgdGhyZWUgZm9ybXMgb2YgcmUtZXhwb3J0IHRoYXQgYXJlIG1hdGNoZWQ6XG4gICAqXG4gICAqICogYGV4cG9ydCAqIGZyb20gJy4uLic7XG4gICAqICogYGV4cG9ydCAqIGFzIGFsaWFzIGZyb20gJy4uLic7XG4gICAqICogYGV4cG9ydCB7Li4ufSBmcm9tICcuLi4nO1xuICAgKi9cbiAgcHJvdGVjdGVkIGV4dHJhY3RSZWV4cG9ydFBhdGgoKTogc3RyaW5nfG51bGwge1xuICAgIC8vIFNraXAgdGhlIGBleHBvcnRgIGtleXdvcmRcbiAgICBsZXQgdG9rZW46IHRzLlN5bnRheEtpbmR8bnVsbCA9IHRoaXMuc2Nhbm5lci5zY2FuKCk7XG4gICAgaWYgKHRva2VuID09PSB0cy5TeW50YXhLaW5kLkFzdGVyaXNrVG9rZW4pIHtcbiAgICAgIHRva2VuID0gdGhpcy5za2lwTmFtZXNwYWNlZENsYXVzZSgpO1xuICAgICAgaWYgKHRva2VuID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodG9rZW4gPT09IHRzLlN5bnRheEtpbmQuT3BlbkJyYWNlVG9rZW4pIHtcbiAgICAgIHRva2VuID0gdGhpcy5za2lwTmFtZWRDbGF1c2UoKTtcbiAgICB9XG4gICAgLy8gRXhwZWN0IGEgYGZyb21gIGNsYXVzZSwgaWYgbm90IGJhaWwgb3V0XG4gICAgaWYgKHRva2VuICE9PSB0cy5TeW50YXhLaW5kLkZyb21LZXl3b3JkKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudHJ5U3RyaW5nTGl0ZXJhbCgpO1xuICB9XG5cbiAgcHJvdGVjdGVkIHNraXBOYW1lc3BhY2VkQ2xhdXNlKCk6IHRzLlN5bnRheEtpbmR8bnVsbCB7XG4gICAgLy8gU2tpcCBwYXN0IHRoZSBgKmBcbiAgICBsZXQgdG9rZW4gPSB0aGlzLnNjYW5uZXIuc2NhbigpO1xuICAgIC8vIENoZWNrIGZvciBhIGAqIGFzIGlkZW50aWZpZXJgIGFsaWFzIGNsYXVzZVxuICAgIGlmICh0b2tlbiA9PT0gdHMuU3ludGF4S2luZC5Bc0tleXdvcmQpIHtcbiAgICAgIC8vIFNraXAgcGFzdCB0aGUgYGFzYCBrZXl3b3JkXG4gICAgICB0b2tlbiA9IHRoaXMuc2Nhbm5lci5zY2FuKCk7XG4gICAgICAvLyBFeHBlY3QgYW4gaWRlbnRpZmllciwgaWYgbm90IGJhaWwgb3V0XG4gICAgICBpZiAodG9rZW4gIT09IHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcikge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIC8vIFNraXAgcGFzdCB0aGUgaWRlbnRpZmllclxuICAgICAgdG9rZW4gPSB0aGlzLnNjYW5uZXIuc2NhbigpO1xuICAgIH1cbiAgICByZXR1cm4gdG9rZW47XG4gIH1cblxuICBwcm90ZWN0ZWQgc2tpcE5hbWVkQ2xhdXNlKCk6IHRzLlN5bnRheEtpbmQge1xuICAgIGxldCBicmFjZUNvdW50ID0gMTtcbiAgICAvLyBTa2lwIHBhc3QgdGhlIGluaXRpYWwgb3BlbmluZyBicmFjZSBge2BcbiAgICBsZXQgdG9rZW4gPSB0aGlzLnNjYW5uZXIuc2NhbigpO1xuICAgIC8vIFNlYXJjaCBmb3IgdGhlIG1hdGNoaW5nIGNsb3NpbmcgYnJhY2UgYH1gXG4gICAgd2hpbGUgKGJyYWNlQ291bnQgPiAwICYmIHRva2VuICE9PSB0cy5TeW50YXhLaW5kLkVuZE9mRmlsZVRva2VuKSB7XG4gICAgICBpZiAodG9rZW4gPT09IHRzLlN5bnRheEtpbmQuT3BlbkJyYWNlVG9rZW4pIHtcbiAgICAgICAgYnJhY2VDb3VudCsrO1xuICAgICAgfSBlbHNlIGlmICh0b2tlbiA9PT0gdHMuU3ludGF4S2luZC5DbG9zZUJyYWNlVG9rZW4pIHtcbiAgICAgICAgYnJhY2VDb3VudC0tO1xuICAgICAgfVxuICAgICAgdG9rZW4gPSB0aGlzLnNjYW5uZXIuc2NhbigpO1xuICAgIH1cbiAgICByZXR1cm4gdG9rZW47XG4gIH1cblxuICBwcm90ZWN0ZWQgdHJ5U3RyaW5nTGl0ZXJhbCgpOiBzdHJpbmd8bnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuc2Nhbm5lci5zY2FuKCkgPT09IHRzLlN5bnRheEtpbmQuU3RyaW5nTGl0ZXJhbCA/IHRoaXMuc2Nhbm5lci5nZXRUb2tlblZhbHVlKCkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudWxsO1xuICB9XG59XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciBhIHNvdXJjZSBmaWxlIG5lZWRzIHRvIGJlIHBhcnNlZCBmb3IgaW1wb3J0cy5cbiAqIFRoaXMgaXMgYSBwZXJmb3JtYW5jZSBzaG9ydC1jaXJjdWl0LCB3aGljaCBzYXZlcyB1cyBmcm9tIGNyZWF0aW5nXG4gKiBhIFR5cGVTY3JpcHQgQVNUIHVubmVjZXNzYXJpbHkuXG4gKlxuICogQHBhcmFtIHNvdXJjZSBUaGUgY29udGVudCBvZiB0aGUgc291cmNlIGZpbGUgdG8gY2hlY2suXG4gKlxuICogQHJldHVybnMgZmFsc2UgaWYgdGhlcmUgYXJlIGRlZmluaXRlbHkgbm8gaW1wb3J0IG9yIHJlLWV4cG9ydCBzdGF0ZW1lbnRzXG4gKiBpbiB0aGlzIGZpbGUsIHRydWUgb3RoZXJ3aXNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaGFzSW1wb3J0T3JSZWV4cG9ydFN0YXRlbWVudHMoc291cmNlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIC8oPzppbXBvcnR8ZXhwb3J0KVtcXHNcXFNdKz8oW1wiJ10pKD86XFxcXFxcMXwuKSs/XFwxLy50ZXN0KHNvdXJjZSk7XG59XG5cbmZ1bmN0aW9uIGZpbmRMYXN0UG9zc2libGVJbXBvcnRPclJlZXhwb3J0KHNvdXJjZTogc3RyaW5nKTogbnVtYmVyIHtcbiAgcmV0dXJuIE1hdGgubWF4KHNvdXJjZS5sYXN0SW5kZXhPZignaW1wb3J0JyksIHNvdXJjZS5sYXN0SW5kZXhPZignIGZyb20gJykpO1xufVxuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgdGhlIGdpdmVuIHN0YXRlbWVudCBpcyBhbiBpbXBvcnQgd2l0aCBhIHN0cmluZyBsaXRlcmFsIG1vZHVsZSBzcGVjaWZpZXIuXG4gKiBAcGFyYW0gc3RtdCB0aGUgc3RhdGVtZW50IG5vZGUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB0cnVlIGlmIHRoZSBzdGF0ZW1lbnQgaXMgYW4gaW1wb3J0IHdpdGggYSBzdHJpbmcgbGl0ZXJhbCBtb2R1bGUgc3BlY2lmaWVyLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNTdHJpbmdJbXBvcnRPclJlZXhwb3J0KHN0bXQ6IHRzLlN0YXRlbWVudCk6IHN0bXQgaXMgdHMuSW1wb3J0RGVjbGFyYXRpb24mXG4gICAge21vZHVsZVNwZWNpZmllcjogdHMuU3RyaW5nTGl0ZXJhbH0ge1xuICByZXR1cm4gdHMuaXNJbXBvcnREZWNsYXJhdGlvbihzdG10KSB8fFxuICAgICAgdHMuaXNFeHBvcnREZWNsYXJhdGlvbihzdG10KSAmJiAhIXN0bXQubW9kdWxlU3BlY2lmaWVyICYmXG4gICAgICB0cy5pc1N0cmluZ0xpdGVyYWwoc3RtdC5tb2R1bGVTcGVjaWZpZXIpO1xufVxuXG5cbmZ1bmN0aW9uIGNhblByZWNlZGVBUmVnZXgoa2luZDogdHMuU3ludGF4S2luZCk6IGJvb2xlYW4ge1xuICBzd2l0Y2ggKGtpbmQpIHtcbiAgICBjYXNlIHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcjpcbiAgICBjYXNlIHRzLlN5bnRheEtpbmQuU3RyaW5nTGl0ZXJhbDpcbiAgICBjYXNlIHRzLlN5bnRheEtpbmQuTnVtZXJpY0xpdGVyYWw6XG4gICAgY2FzZSB0cy5TeW50YXhLaW5kLkJpZ0ludExpdGVyYWw6XG4gICAgY2FzZSB0cy5TeW50YXhLaW5kLlJlZ3VsYXJFeHByZXNzaW9uTGl0ZXJhbDpcbiAgICBjYXNlIHRzLlN5bnRheEtpbmQuVGhpc0tleXdvcmQ6XG4gICAgY2FzZSB0cy5TeW50YXhLaW5kLlBsdXNQbHVzVG9rZW46XG4gICAgY2FzZSB0cy5TeW50YXhLaW5kLk1pbnVzTWludXNUb2tlbjpcbiAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ2xvc2VQYXJlblRva2VuOlxuICAgIGNhc2UgdHMuU3ludGF4S2luZC5DbG9zZUJyYWNrZXRUb2tlbjpcbiAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ2xvc2VCcmFjZVRva2VuOlxuICAgIGNhc2UgdHMuU3ludGF4S2luZC5UcnVlS2V5d29yZDpcbiAgICBjYXNlIHRzLlN5bnRheEtpbmQuRmFsc2VLZXl3b3JkOlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufVxuIl19