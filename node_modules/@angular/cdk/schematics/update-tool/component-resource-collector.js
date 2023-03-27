"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentResourceCollector = void 0;
const path_1 = require("path");
const ts = require("typescript");
const decorators_1 = require("./utils/decorators");
const functions_1 = require("./utils/functions");
const line_mappings_1 = require("./utils/line-mappings");
const property_name_1 = require("./utils/property-name");
/**
 * Collector that can be used to find Angular templates and stylesheets referenced within
 * given TypeScript source files (inline or external referenced files)
 */
class ComponentResourceCollector {
    constructor(typeChecker, _fileSystem) {
        this.typeChecker = typeChecker;
        this._fileSystem = _fileSystem;
        this.resolvedTemplates = [];
        this.resolvedStylesheets = [];
    }
    visitNode(node) {
        if (node.kind === ts.SyntaxKind.ClassDeclaration) {
            this._visitClassDeclaration(node);
        }
    }
    _visitClassDeclaration(node) {
        const decorators = ts.getDecorators(node);
        if (!decorators || !decorators.length) {
            return;
        }
        const ngDecorators = (0, decorators_1.getAngularDecorators)(this.typeChecker, decorators);
        const componentDecorator = ngDecorators.find(dec => dec.name === 'Component');
        // In case no "@Component" decorator could be found on the current class, skip.
        if (!componentDecorator) {
            return;
        }
        const decoratorCall = componentDecorator.node.expression;
        // In case the component decorator call is not valid, skip this class declaration.
        if (decoratorCall.arguments.length !== 1) {
            return;
        }
        const componentMetadata = (0, functions_1.unwrapExpression)(decoratorCall.arguments[0]);
        // Ensure that the component metadata is an object literal expression.
        if (!ts.isObjectLiteralExpression(componentMetadata)) {
            return;
        }
        const sourceFile = node.getSourceFile();
        const filePath = this._fileSystem.resolve(sourceFile.fileName);
        const sourceFileDirPath = (0, path_1.dirname)(sourceFile.fileName);
        // Walk through all component metadata properties and determine the referenced
        // HTML templates (either external or inline)
        componentMetadata.properties.forEach(property => {
            if (!ts.isPropertyAssignment(property)) {
                return;
            }
            const propertyName = (0, property_name_1.getPropertyNameText)(property.name);
            if (propertyName === 'styles' && ts.isArrayLiteralExpression(property.initializer)) {
                property.initializer.elements.forEach(el => {
                    if (ts.isStringLiteralLike(el)) {
                        // Need to add an offset of one to the start because the template quotes are
                        // not part of the template content.
                        const templateStartIdx = el.getStart() + 1;
                        const content = stripBom(el.text);
                        this.resolvedStylesheets.push({
                            filePath,
                            container: node,
                            content,
                            inline: true,
                            start: templateStartIdx,
                            getCharacterAndLineOfPosition: pos => ts.getLineAndCharacterOfPosition(sourceFile, pos + templateStartIdx),
                        });
                    }
                });
            }
            // In case there is an inline template specified, ensure that the value is statically
            // analyzable by checking if the initializer is a string literal-like node.
            if (propertyName === 'template' && ts.isStringLiteralLike(property.initializer)) {
                // Need to add an offset of one to the start because the template quotes are
                // not part of the template content.
                const templateStartIdx = property.initializer.getStart() + 1;
                this.resolvedTemplates.push({
                    filePath,
                    container: node,
                    content: property.initializer.text,
                    inline: true,
                    start: templateStartIdx,
                    getCharacterAndLineOfPosition: pos => ts.getLineAndCharacterOfPosition(sourceFile, pos + templateStartIdx),
                });
            }
            if (propertyName === 'styleUrls' && ts.isArrayLiteralExpression(property.initializer)) {
                property.initializer.elements.forEach(el => {
                    if (ts.isStringLiteralLike(el)) {
                        const stylesheetPath = this._fileSystem.resolve(sourceFileDirPath, el.text);
                        const stylesheet = this.resolveExternalStylesheet(stylesheetPath, node);
                        if (stylesheet) {
                            this.resolvedStylesheets.push(stylesheet);
                        }
                    }
                });
            }
            if (propertyName === 'templateUrl' && ts.isStringLiteralLike(property.initializer)) {
                const templateUrl = property.initializer.text;
                const templatePath = this._fileSystem.resolve(sourceFileDirPath, templateUrl);
                // In case the template does not exist in the file system, skip this
                // external template.
                if (!this._fileSystem.fileExists(templatePath)) {
                    return;
                }
                const fileContent = this._fileSystem.read(templatePath);
                if (fileContent) {
                    const lineStartsMap = (0, line_mappings_1.computeLineStartsMap)(fileContent);
                    this.resolvedTemplates.push({
                        filePath: templatePath,
                        container: node,
                        content: fileContent,
                        inline: false,
                        start: 0,
                        getCharacterAndLineOfPosition: p => (0, line_mappings_1.getLineAndCharacterFromPosition)(lineStartsMap, p),
                    });
                }
            }
        });
    }
    /** Resolves an external stylesheet by reading its content and computing line mappings. */
    resolveExternalStylesheet(filePath, container) {
        // Strip the BOM to avoid issues with the Sass compiler. See:
        // https://github.com/angular/components/issues/24227#issuecomment-1200934258
        const fileContent = stripBom(this._fileSystem.read(filePath) || '');
        if (!fileContent) {
            return null;
        }
        const lineStartsMap = (0, line_mappings_1.computeLineStartsMap)(fileContent);
        return {
            filePath: filePath,
            container: container,
            content: fileContent,
            inline: false,
            start: 0,
            getCharacterAndLineOfPosition: pos => (0, line_mappings_1.getLineAndCharacterFromPosition)(lineStartsMap, pos),
        };
    }
}
exports.ComponentResourceCollector = ComponentResourceCollector;
/** Strips the BOM from a string. */
function stripBom(content) {
    return content.replace(/\uFEFF/g, '');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LXJlc291cmNlLWNvbGxlY3Rvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvc2NoZW1hdGljcy91cGRhdGUtdG9vbC9jb21wb25lbnQtcmVzb3VyY2UtY29sbGVjdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILCtCQUE2QjtBQUM3QixpQ0FBaUM7QUFFakMsbURBQXdEO0FBQ3hELGlEQUFtRDtBQUNuRCx5REFJK0I7QUFDL0IseURBQTBEO0FBcUIxRDs7O0dBR0c7QUFDSCxNQUFhLDBCQUEwQjtJQUlyQyxZQUFtQixXQUEyQixFQUFVLFdBQXVCO1FBQTVELGdCQUFXLEdBQVgsV0FBVyxDQUFnQjtRQUFVLGdCQUFXLEdBQVgsV0FBVyxDQUFZO1FBSC9FLHNCQUFpQixHQUF1QixFQUFFLENBQUM7UUFDM0Msd0JBQW1CLEdBQXVCLEVBQUUsQ0FBQztJQUVxQyxDQUFDO0lBRW5GLFNBQVMsQ0FBQyxJQUFhO1FBQ3JCLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLGdCQUFnQixFQUFFO1lBQ2hELElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUEyQixDQUFDLENBQUM7U0FDMUQ7SUFDSCxDQUFDO0lBRU8sc0JBQXNCLENBQUMsSUFBeUI7UUFDdEQsTUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUUxQyxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRTtZQUNyQyxPQUFPO1NBQ1I7UUFFRCxNQUFNLFlBQVksR0FBRyxJQUFBLGlDQUFvQixFQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDeEUsTUFBTSxrQkFBa0IsR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxD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LENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUN4QyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7ZGlybmFtZX0gZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcbmltcG9ydCB7RmlsZVN5c3RlbSwgV29ya3NwYWNlUGF0aH0gZnJvbSAnLi9maWxlLXN5c3RlbSc7XG5pbXBvcnQge2dldEFuZ3VsYXJEZWNvcmF0b3JzfSBmcm9tICcuL3V0aWxzL2RlY29yYXRvcnMnO1xuaW1wb3J0IHt1bndyYXBFeHByZXNzaW9ufSBmcm9tICcuL3V0aWxzL2Z1bmN0aW9ucyc7XG5pbXBvcnQge1xuICBjb21wdXRlTGluZVN0YXJ0c01hcCxcbiAgZ2V0TGluZUFuZENoYXJhY3RlckZyb21Qb3NpdGlvbixcbiAgTGluZUFuZENoYXJhY3Rlcixcbn0gZnJvbSAnLi91dGlscy9saW5lLW1hcHBpbmdzJztcbmltcG9ydCB7Z2V0UHJvcGVydHlOYW1lVGV4dH0gZnJvbSAnLi91dGlscy9wcm9wZXJ0eS1uYW1lJztcblxuZXhwb3J0IGludGVyZmFjZSBSZXNvbHZlZFJlc291cmNlIHtcbiAgLyoqIENsYXNzIGRlY2xhcmF0aW9uIHRoYXQgY29udGFpbnMgdGhpcyByZXNvdXJjZS4gKi9cbiAgY29udGFpbmVyOiB0cy5DbGFzc0RlY2xhcmF0aW9uIHwgbnVsbDtcbiAgLyoqIEZpbGUgY29udGVudCBvZiB0aGUgZ2l2ZW4gdGVtcGxhdGUuICovXG4gIGNvbnRlbnQ6IHN0cmluZztcbiAgLyoqIFN0YXJ0IG9mZnNldCBvZiB0aGUgcmVzb3VyY2UgY29udGVudCAoZS5nLiBpbiB0aGUgaW5saW5lIHNvdXJjZSBmaWxlKSAqL1xuICBzdGFydDogbnVtYmVyO1xuICAvKiogV2hldGhlciB0aGUgZ2l2ZW4gcmVzb3VyY2UgaXMgaW5saW5lIG9yIG5vdC4gKi9cbiAgaW5saW5lOiBib29sZWFuO1xuICAvKiogUGF0aCB0byB0aGUgZmlsZSB0aGF0IGNvbnRhaW5zIHRoaXMgcmVzb3VyY2UuICovXG4gIGZpbGVQYXRoOiBXb3Jrc3BhY2VQYXRoO1xuICAvKipcbiAgICogR2V0cyB0aGUgY2hhcmFjdGVyIGFuZCBsaW5lIG9mIGEgZ2l2ZW4gcG9zaXRpb24gaW5kZXggaW4gdGhlIHJlc291cmNlLlxuICAgKiBJZiB0aGUgcmVzb3VyY2UgaXMgZGVjbGFyZWQgaW5saW5lIHdpdGhpbiBhIFR5cGVTY3JpcHQgc291cmNlIGZpbGUsIHRoZSBsaW5lIGFuZFxuICAgKiBjaGFyYWN0ZXIgYXJlIGJhc2VkIG9uIHRoZSBmdWxsIHNvdXJjZSBmaWxlIGNvbnRlbnQuXG4gICAqL1xuICBnZXRDaGFyYWN0ZXJBbmRMaW5lT2ZQb3NpdGlvbjogKHBvczogbnVtYmVyKSA9PiBMaW5lQW5kQ2hhcmFjdGVyO1xufVxuXG4vKipcbiAqIENvbGxlY3RvciB0aGF0IGNhbiBiZSB1c2VkIHRvIGZpbmQgQW5ndWxhciB0ZW1wbGF0ZXMgYW5kIHN0eWxlc2hlZXRzIHJlZmVyZW5jZWQgd2l0aGluXG4gKiBnaXZlbiBUeXBlU2NyaXB0IHNvdXJjZSBmaWxlcyAoaW5saW5lIG9yIGV4dGVybmFsIHJlZmVyZW5jZWQgZmlsZXMpXG4gKi9cbmV4cG9ydCBjbGFzcyBDb21wb25lbnRSZXNvdXJjZUNvbGxlY3RvciB7XG4gIHJlc29sdmVkVGVtcGxhdGVzOiBSZXNvbHZlZFJlc291cmNlW10gPSBbXTtcbiAgcmVzb2x2ZWRTdHlsZXNoZWV0czogUmVzb2x2ZWRSZXNvdXJjZVtdID0gW107XG5cbiAgY29uc3RydWN0b3IocHVibGljIHR5cGVDaGVja2VyOiB0cy5UeXBlQ2hlY2tlciwgcHJpdmF0ZSBfZmlsZVN5c3RlbTogRmlsZVN5c3RlbSkge31cblxuICB2aXNpdE5vZGUobm9kZTogdHMuTm9kZSkge1xuICAgIGlmIChub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuQ2xhc3NEZWNsYXJhdGlvbikge1xuICAgICAgdGhpcy5fdmlzaXRDbGFzc0RlY2xhcmF0aW9uKG5vZGUgYXMgdHMuQ2xhc3NEZWNsYXJhdGlvbik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfdmlzaXRDbGFzc0RlY2xhcmF0aW9uKG5vZGU6IHRzLkNsYXNzRGVjbGFyYXRpb24pIHtcbiAgICBjb25zdCBkZWNvcmF0b3JzID0gdHMuZ2V0RGVjb3JhdG9ycyhub2RlKTtcblxuICAgIGlmICghZGVjb3JhdG9ycyB8fCAhZGVjb3JhdG9ycy5sZW5ndGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBuZ0RlY29yYXRvcnMgPSBnZXRBbmd1bGFyRGVjb3JhdG9ycyh0aGlzLnR5cGVDaGVja2VyLCBkZWNvcmF0b3JzKTtcbiAgICBjb25zdCBjb21wb25lbnREZWNvcmF0b3IgPSBuZ0RlY29yYXRvcnMuZmluZChkZWMgPT4gZGVjLm5hbWUgPT09ICdDb21wb25lbnQnKTtcblxuICAgIC8vIEluIGNhc2Ugbm8gXCJAQ29tcG9uZW50XCIgZGVjb3JhdG9yIGNvdWxkIGJlIGZvdW5kIG9uIHRoZSBjdXJyZW50IGNsYXNzLCBza2lwLlxuICAgIGlmICghY29tcG9uZW50RGVjb3JhdG9yKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZGVjb3JhdG9yQ2FsbCA9IGNvbXBvbmVudERlY29yYXRvci5ub2RlLmV4cHJlc3Npb247XG5cbiAgICAvLyBJbiBjYXNlIHRoZSBjb21wb25lbnQgZGVjb3JhdG9yIGNhbGwgaXMgbm90IHZhbGlkLCBza2lwIHRoaXMgY2xhc3MgZGVjbGFyYXRpb24uXG4gICAgaWYgKGRlY29yYXRvckNhbGwuYXJndW1lbnRzLmxlbmd0aCAhPT0gMSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbXBvbmVudE1ldGFkYXRhID0gdW53cmFwRXhwcmVzc2lvbihkZWNvcmF0b3JDYWxsLmFyZ3VtZW50c1swXSk7XG5cbiAgICAvLyBFbnN1cmUgdGhhdCB0aGUgY29tcG9uZW50IG1ldGFkYXRhIGlzIGFuIG9iamVjdCBsaXRlcmFsIGV4cHJlc3Npb24uXG4gICAgaWYgKCF0cy5pc09iamVjdExpdGVyYWxFeHByZXNzaW9uKGNvbXBvbmVudE1ldGFkYXRhKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHNvdXJjZUZpbGUgPSBub2RlLmdldFNvdXJjZUZpbGUoKTtcbiAgICBjb25zdCBmaWxlUGF0aCA9IHRoaXMuX2ZpbGVTeXN0ZW0ucmVzb2x2ZShzb3VyY2VGaWxlLmZpbGVOYW1lKTtcbiAgICBjb25zdCBzb3VyY2VGaWxlRGlyUGF0aCA9IGRpcm5hbWUoc291cmNlRmlsZS5maWxlTmFtZSk7XG5cbiAgICAvLyBXYWxrIHRocm91Z2ggYWxsIGNvbXBvbmVudCBtZXRhZGF0YSBwcm9wZXJ0aWVzIGFuZCBkZXRlcm1pbmUgdGhlIHJlZmVyZW5jZWRcbiAgICAvLyBIVE1MIHRlbXBsYXRlcyAoZWl0aGVyIGV4dGVybmFsIG9yIGlubGluZSlcbiAgICBjb21wb25lbnRNZXRhZGF0YS5wcm9wZXJ0aWVzLmZvckVhY2gocHJvcGVydHkgPT4ge1xuICAgICAgaWYgKCF0cy5pc1Byb3BlcnR5QXNzaWdubWVudChwcm9wZXJ0eSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBwcm9wZXJ0eU5hbWUgPSBnZXRQcm9wZXJ0eU5hbWVUZXh0KHByb3BlcnR5Lm5hbWUpO1xuXG4gICAgICBpZiAocHJvcGVydHlOYW1lID09PSAnc3R5bGVzJyAmJiB0cy5pc0FycmF5TGl0ZXJhbEV4cHJlc3Npb24ocHJvcGVydHkuaW5pdGlhbGl6ZXIpKSB7XG4gICAgICAgIHByb3BlcnR5LmluaXRpYWxpemVyLmVsZW1lbnRzLmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgIGlmICh0cy5pc1N0cmluZ0xpdGVyYWxMaWtlKGVsKSkge1xuICAgICAgICAgICAgLy8gTmVlZCB0byBhZGQgYW4gb2Zmc2V0IG9mIG9uZSB0byB0aGUgc3RhcnQgYmVjYXVzZSB0aGUgdGVtcGxhdGUgcXVvdGVzIGFyZVxuICAgICAgICAgICAgLy8gbm90IHBhcnQgb2YgdGhlIHRlbXBsYXRlIGNvbnRlbnQuXG4gICAgICAgICAgICBjb25zdCB0ZW1wbGF0ZVN0YXJ0SWR4ID0gZWwuZ2V0U3RhcnQoKSArIDE7XG4gICAgICAgICAgICBjb25zdCBjb250ZW50ID0gc3RyaXBCb20oZWwudGV4dCk7XG4gICAgICAgICAgICB0aGlzLnJlc29sdmVkU3R5bGVzaGVldHMucHVzaCh7XG4gICAgICAgICAgICAgIGZpbGVQYXRoLFxuICAgICAgICAgICAgICBjb250YWluZXI6IG5vZGUsXG4gICAgICAgICAgICAgIGNvbnRlbnQsXG4gICAgICAgICAgICAgIGlubGluZTogdHJ1ZSxcbiAgICAgICAgICAgICAgc3RhcnQ6IHRlbXBsYXRlU3RhcnRJZHgsXG4gICAgICAgICAgICAgIGdldENoYXJhY3RlckFuZExpbmVPZlBvc2l0aW9uOiBwb3MgPT5cbiAgICAgICAgICAgICAgICB0cy5nZXRMaW5lQW5kQ2hhcmFjdGVyT2ZQb3NpdGlvbihzb3VyY2VGaWxlLCBwb3MgKyB0ZW1wbGF0ZVN0YXJ0SWR4KSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIEluIGNhc2UgdGhlcmUgaXMgYW4gaW5saW5lIHRlbXBsYXRlIHNwZWNpZmllZCwgZW5zdXJlIHRoYXQgdGhlIHZhbHVlIGlzIHN0YXRpY2FsbHlcbiAgICAgIC8vIGFuYWx5emFibGUgYnkgY2hlY2tpbmcgaWYgdGhlIGluaXRpYWxpemVyIGlzIGEgc3RyaW5nIGxpdGVyYWwtbGlrZSBub2RlLlxuICAgICAgaWYgKHByb3BlcnR5TmFtZSA9PT0gJ3RlbXBsYXRlJyAmJiB0cy5pc1N0cmluZ0xpdGVyYWxMaWtlKHByb3BlcnR5LmluaXRpYWxpemVyKSkge1xuICAgICAgICAvLyBOZWVkIHRvIGFkZCBhbiBvZmZzZXQgb2Ygb25lIHRvIHRoZSBzdGFydCBiZWNhdXNlIHRoZSB0ZW1wbGF0ZSBxdW90ZXMgYXJlXG4gICAgICAgIC8vIG5vdCBwYXJ0IG9mIHRoZSB0ZW1wbGF0ZSBjb250ZW50LlxuICAgICAgICBjb25zdCB0ZW1wbGF0ZVN0YXJ0SWR4ID0gcHJvcGVydHkuaW5pdGlhbGl6ZXIuZ2V0U3RhcnQoKSArIDE7XG4gICAgICAgIHRoaXMucmVzb2x2ZWRUZW1wbGF0ZXMucHVzaCh7XG4gICAgICAgICAgZmlsZVBhdGgsXG4gICAgICAgICAgY29udGFpbmVyOiBub2RlLFxuICAgICAgICAgIGNvbnRlbnQ6IHByb3BlcnR5LmluaXRpYWxpemVyLnRleHQsXG4gICAgICAgICAgaW5saW5lOiB0cnVlLFxuICAgICAgICAgIHN0YXJ0OiB0ZW1wbGF0ZVN0YXJ0SWR4LFxuICAgICAgICAgIGdldENoYXJhY3RlckFuZExpbmVPZlBvc2l0aW9uOiBwb3MgPT5cbiAgICAgICAgICAgIHRzLmdldExpbmVBbmRDaGFyYWN0ZXJPZlBvc2l0aW9uKHNvdXJjZUZpbGUsIHBvcyArIHRlbXBsYXRlU3RhcnRJZHgpLFxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHByb3BlcnR5TmFtZSA9PT0gJ3N0eWxlVXJscycgJiYgdHMuaXNBcnJheUxpdGVyYWxFeHByZXNzaW9uKHByb3BlcnR5LmluaXRpYWxpemVyKSkge1xuICAgICAgICBwcm9wZXJ0eS5pbml0aWFsaXplci5lbGVtZW50cy5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICBpZiAodHMuaXNTdHJpbmdMaXRlcmFsTGlrZShlbCkpIHtcbiAgICAgICAgICAgIGNvbnN0IHN0eWxlc2hlZXRQYXRoID0gdGhpcy5fZmlsZVN5c3RlbS5yZXNvbHZlKHNvdXJjZUZpbGVEaXJQYXRoLCBlbC50ZXh0KTtcbiAgICAgICAgICAgIGNvbnN0IHN0eWxlc2hlZXQgPSB0aGlzLnJlc29sdmVFeHRlcm5hbFN0eWxlc2hlZXQoc3R5bGVzaGVldFBhdGgsIG5vZGUpO1xuXG4gICAgICAgICAgICBpZiAoc3R5bGVzaGVldCkge1xuICAgICAgICAgICAgICB0aGlzLnJlc29sdmVkU3R5bGVzaGVldHMucHVzaChzdHlsZXNoZWV0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAocHJvcGVydHlOYW1lID09PSAndGVtcGxhdGVVcmwnICYmIHRzLmlzU3RyaW5nTGl0ZXJhbExpa2UocHJvcGVydHkuaW5pdGlhbGl6ZXIpKSB7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlVXJsID0gcHJvcGVydHkuaW5pdGlhbGl6ZXIudGV4dDtcbiAgICAgICAgY29uc3QgdGVtcGxhdGVQYXRoID0gdGhpcy5fZmlsZVN5c3RlbS5yZXNvbHZlKHNvdXJjZUZpbGVEaXJQYXRoLCB0ZW1wbGF0ZVVybCk7XG5cbiAgICAgICAgLy8gSW4gY2FzZSB0aGUgdGVtcGxhdGUgZG9lcyBub3QgZXhpc3QgaW4gdGhlIGZpbGUgc3lzdGVtLCBza2lwIHRoaXNcbiAgICAgICAgLy8gZXh0ZXJuYWwgdGVtcGxhdGUuXG4gICAgICAgIGlmICghdGhpcy5fZmlsZVN5c3RlbS5maWxlRXhpc3RzKHRlbXBsYXRlUGF0aCkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBmaWxlQ29udGVudCA9IHRoaXMuX2ZpbGVTeXN0ZW0ucmVhZCh0ZW1wbGF0ZVBhdGgpO1xuXG4gICAgICAgIGlmIChmaWxlQ29udGVudCkge1xuICAgICAgICAgIGNvbnN0IGxpbmVTdGFydHNNYXAgPSBjb21wdXRlTGluZVN0YXJ0c01hcChmaWxlQ29udGVudCk7XG5cbiAgICAgICAgICB0aGlzLnJlc29sdmVkVGVtcGxhdGVzLnB1c2goe1xuICAgICAgICAgICAgZmlsZVBhdGg6IHRlbXBsYXRlUGF0aCxcbiAgICAgICAgICAgIGNvbnRhaW5lcjogbm9kZSxcbiAgICAgICAgICAgIGNvbnRlbnQ6IGZpbGVDb250ZW50LFxuICAgICAgICAgICAgaW5saW5lOiBmYWxzZSxcbiAgICAgICAgICAgIHN0YXJ0OiAwLFxuICAgICAgICAgICAgZ2V0Q2hhcmFjdGVyQW5kTGluZU9mUG9zaXRpb246IHAgPT4gZ2V0TGluZUFuZENoYXJhY3RlckZyb21Qb3NpdGlvbihsaW5lU3RhcnRzTWFwLCBwKSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqIFJlc29sdmVzIGFuIGV4dGVybmFsIHN0eWxlc2hlZXQgYnkgcmVhZGluZyBpdHMgY29udGVudCBhbmQgY29tcHV0aW5nIGxpbmUgbWFwcGluZ3MuICovXG4gIHJlc29sdmVFeHRlcm5hbFN0eWxlc2hlZXQoXG4gICAgZmlsZVBhdGg6IFdvcmtzcGFjZVBhdGgsXG4gICAgY29udGFpbmVyOiB0cy5DbGFzc0RlY2xhcmF0aW9uIHwgbnVsbCxcbiAgKTogUmVzb2x2ZWRSZXNvdXJjZSB8IG51bGwge1xuICAgIC8vIFN0cmlwIHRoZSBCT00gdG8gYXZvaWQgaXNzdWVzIHdpdGggdGhlIFNhc3MgY29tcGlsZXIuIFNlZTpcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL2lzc3Vlcy8yNDIyNyNpc3N1ZWNvbW1lbnQtMTIwMDkzNDI1OFxuICAgIGNvbnN0IGZpbGVDb250ZW50ID0gc3RyaXBCb20odGhpcy5fZmlsZVN5c3RlbS5yZWFkKGZpbGVQYXRoKSB8fCAnJyk7XG5cbiAgICBpZiAoIWZpbGVDb250ZW50KSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBsaW5lU3RhcnRzTWFwID0gY29tcHV0ZUxpbmVTdGFydHNNYXAoZmlsZUNvbnRlbnQpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGZpbGVQYXRoOiBmaWxlUGF0aCxcbiAgICAgIGNvbnRhaW5lcjogY29udGFpbmVyLFxuICAgICAgY29udGVudDogZmlsZUNvbnRlbnQsXG4gICAgICBpbmxpbmU6IGZhbHNlLFxuICAgICAgc3RhcnQ6IDAsXG4gICAgICBnZXRDaGFyYWN0ZXJBbmRMaW5lT2ZQb3NpdGlvbjogcG9zID0+IGdldExpbmVBbmRDaGFyYWN0ZXJGcm9tUG9zaXRpb24obGluZVN0YXJ0c01hcCwgcG9zKSxcbiAgICB9O1xuICB9XG59XG5cbi8qKiBTdHJpcHMgdGhlIEJPTSBmcm9tIGEgc3RyaW5nLiAqL1xuZnVuY3Rpb24gc3RyaXBCb20oY29udGVudDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGNvbnRlbnQucmVwbGFjZSgvXFx1RkVGRi9nLCAnJyk7XG59XG4iXX0=