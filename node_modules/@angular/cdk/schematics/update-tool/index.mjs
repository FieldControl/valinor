"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProject = void 0;
const ts = require("typescript");
const component_resource_collector_1 = require("./component-resource-collector");
const logger_1 = require("./logger");
const parse_tsconfig_1 = require("./utils/parse-tsconfig");
const virtual_host_1 = require("./utils/virtual-host");
/**
 * An update project that can be run against individual migrations. An update project
 * accepts a TypeScript program and a context that is provided to all migrations. The
 * context is usually not used by migrations, but in some cases migrations rely on
 * specifics from the tool that performs the update (e.g. the Angular CLI). In those cases,
 * the context can provide the necessary specifics to the migrations in a type-safe way.
 */
class UpdateProject {
    constructor(
    /** Context provided to all migrations. */
    _context, 
    /** TypeScript program using workspace paths. */
    _program, 
    /** File system used for reading, writing and editing files. */
    _fileSystem, 
    /**
     * Set of analyzed files. Used for avoiding multiple migration runs if
     * files overlap between targets.
     */
    _analyzedFiles = new Set(), 
    /** Logger used for printing messages. */
    _logger = logger_1.defaultLogger) {
        this._context = _context;
        this._program = _program;
        this._fileSystem = _fileSystem;
        this._analyzedFiles = _analyzedFiles;
        this._logger = _logger;
        this._typeChecker = this._program.getTypeChecker();
    }
    /**
     * Migrates the project to the specified target version.
     * @param migrationTypes Migrations that should be run.
     * @param target Version the project should be updated to. Can be `null` if the set of
     *   specified migrations runs regardless of a target version.
     * @param data Upgrade data that is passed to all migration rules.
     * @param additionalStylesheetPaths Additional stylesheets that should be migrated, if not
     *   referenced in an Angular component. This is helpful for global stylesheets in a project.
     * @param limitToDirectory If specified, changes will be limited to the given directory.
     */
    migrate(migrationTypes, target, data, additionalStylesheetPaths, limitToDirectory) {
        limitToDirectory && (limitToDirectory = this._fileSystem.resolve(limitToDirectory));
        // Create instances of the specified migrations.
        const migrations = this._createMigrations(migrationTypes, target, data);
        // Creates the component resource collector. The collector can visit arbitrary
        // TypeScript nodes and will find Angular component resources. Resources include
        // templates and stylesheets. It also captures inline stylesheets and templates.
        const resourceCollector = new component_resource_collector_1.ComponentResourceCollector(this._typeChecker, this._fileSystem);
        // Collect all of the TypeScript source files we want to migrate. We don't
        // migrate type definition files, or source files from external libraries.
        const sourceFiles = this._program.getSourceFiles().filter(f => {
            return (!f.isDeclarationFile &&
                (limitToDirectory == null ||
                    this._fileSystem.resolve(f.fileName).startsWith(limitToDirectory)) &&
                !this._program.isSourceFileFromExternalLibrary(f));
        });
        // Helper function that visits a given TypeScript node and collects all referenced
        // component resources (i.e. stylesheets or templates). Additionally, the helper
        // visits the node in each instantiated migration.
        const visitNodeAndCollectResources = (node) => {
            migrations.forEach(r => r.visitNode(node));
            ts.forEachChild(node, visitNodeAndCollectResources);
            resourceCollector.visitNode(node);
        };
        // Walk through all source file, if it has not been visited before, and
        // visit found nodes while collecting potential resources.
        sourceFiles.forEach(sourceFile => {
            const resolvedPath = this._fileSystem.resolve(sourceFile.fileName);
            // Do not visit source files which have been checked as part of a
            // previously migrated TypeScript project.
            if (!this._analyzedFiles.has(resolvedPath)) {
                visitNodeAndCollectResources(sourceFile);
                this._analyzedFiles.add(resolvedPath);
            }
        });
        // Walk through all resolved templates and visit them in each instantiated
        // migration. Note that this can only happen after source files have been
        // visited because we find templates through the TypeScript source files.
        resourceCollector.resolvedTemplates.forEach(template => {
            // Do not visit the template if it has been checked before. Inline
            // templates cannot be referenced multiple times.
            if (template.inline || !this._analyzedFiles.has(template.filePath)) {
                migrations.forEach(m => m.visitTemplate(template));
                this._analyzedFiles.add(template.filePath);
            }
        });
        // Walk through all resolved stylesheets and visit them in each instantiated
        // migration. Note that this can only happen after source files have been
        // visited because we find stylesheets through the TypeScript source files.
        resourceCollector.resolvedStylesheets.forEach(stylesheet => {
            // Do not visit the stylesheet if it has been checked before. Inline
            // stylesheets cannot be referenced multiple times.
            if (stylesheet.inline || !this._analyzedFiles.has(stylesheet.filePath)) {
                migrations.forEach(r => r.visitStylesheet(stylesheet));
                this._analyzedFiles.add(stylesheet.filePath);
            }
        });
        // In some applications, developers will have global stylesheets which are not
        // specified in any Angular component. Therefore we allow for additional stylesheets
        // being specified. We visit them in each migration unless they have been already
        // discovered before as actual component resource.
        if (additionalStylesheetPaths) {
            additionalStylesheetPaths.forEach(filePath => {
                const resolvedPath = this._fileSystem.resolve(filePath);
                if (limitToDirectory == null || resolvedPath.startsWith(limitToDirectory)) {
                    const stylesheet = resourceCollector.resolveExternalStylesheet(resolvedPath, null);
                    // Do not visit stylesheets which have been referenced from a component.
                    if (!this._analyzedFiles.has(resolvedPath) && stylesheet) {
                        migrations.forEach(r => r.visitStylesheet(stylesheet));
                        this._analyzedFiles.add(resolvedPath);
                    }
                }
            });
        }
        // Call the "postAnalysis" method for each migration.
        migrations.forEach(r => r.postAnalysis());
        // Collect all failures reported by individual migrations.
        const failures = migrations.reduce((res, m) => res.concat(m.failures), []);
        // In case there are failures, print these to the CLI logger as warnings.
        if (failures.length) {
            failures.forEach(({ filePath, message, position }) => {
                const lineAndCharacter = position ? `@${position.line + 1}:${position.character + 1}` : '';
                this._logger.warn(`${filePath}${lineAndCharacter} - ${message}`);
            });
        }
        return {
            hasFailures: !!failures.length,
        };
    }
    /**
     * Creates instances of the given migrations with the specified target
     * version and data.
     */
    _createMigrations(types, target, data) {
        const result = [];
        for (const ctor of types) {
            const instance = new ctor(this._program, this._typeChecker, target, this._context, data, this._fileSystem, this._logger);
            instance.init();
            if (instance.enabled) {
                result.push(instance);
            }
        }
        return result;
    }
    /**
     * Creates a program form the specified tsconfig and patches the host
     * to read files and directories through the given file system.
     *
     * @throws {TsconfigParseError} If the tsconfig could not be parsed.
     */
    static createProgramFromTsconfig(tsconfigPath, fs) {
        const parsed = (0, parse_tsconfig_1.parseTsconfigFile)(fs.resolve(tsconfigPath), fs);
        const host = (0, virtual_host_1.createFileSystemCompilerHost)(parsed.options, fs);
        return ts.createProgram(parsed.fileNames, parsed.options, host);
    }
}
exports.UpdateProject = UpdateProject;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3NjaGVtYXRpY3MvdXBkYXRlLXRvb2wvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsaUNBQWlDO0FBRWpDLGlGQUEwRTtBQUUxRSxxQ0FBcUQ7QUFHckQsMkRBQXlEO0FBQ3pELHVEQUFrRTtBQUVsRTs7Ozs7O0dBTUc7QUFDSCxNQUFhLGFBQWE7SUFHeEI7SUFDRSwwQ0FBMEM7SUFDbEMsUUFBaUI7SUFDekIsZ0RBQWdEO0lBQ3hDLFFBQW9CO0lBQzVCLCtEQUErRDtJQUN2RCxXQUF1QjtJQUMvQjs7O09BR0c7SUFDSyxpQkFBcUMsSUFBSSxHQUFHLEVBQUU7SUFDdEQseUNBQXlDO0lBQ2pDLFVBQXdCLHNCQUFhO1FBWHJDLGFBQVEsR0FBUixRQUFRLENBQVM7UUFFakIsYUFBUSxHQUFSLFFBQVEsQ0FBWTtRQUVwQixnQkFBVyxHQUFYLFdBQVcsQ0FBWTtRQUt2QixtQkFBYyxHQUFkLGNBQWMsQ0FBZ0M7UUFFOUMsWUFBTyxHQUFQLE9BQU8sQ0FBOEI7UUFmOUIsaUJBQVksR0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQWdCNUUsQ0FBQztJQUVKOzs7Ozs7Ozs7T0FTRztJQUNILE9BQU8sQ0FDTCxjQUE4QyxFQUM5QyxNQUE0QixFQUM1QixJQUFVLEVBQ1YseUJBQW9DLEVBQ3BDLGdCQUF5QjtRQUV6QixnQkFBZ0IsS0FBaEIsZ0JBQWdCLEdBQUssSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsRUFBQztRQUVoRSxnREFBZ0Q7UUFDaEQsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGNBQWMsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDeEUsOEVBQThFO1FBQzlFLGdGQUFnRjtRQUNoRixnRkFB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QUcsSUFBQSxrQ0FBaUIsRUFBQyxFQUFFLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQy9ELE1BQU0sSUFBSSxHQUFHLElBQUEsMkNBQTRCLEVBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM5RCxPQUFPLEVBQUUsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2xFLENBQUM7Q0FDRjtBQW5MRCxzQ0FtTEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7Q29tcG9uZW50UmVzb3VyY2VDb2xsZWN0b3J9IGZyb20gJy4vY29tcG9uZW50LXJlc291cmNlLWNvbGxlY3Rvcic7XG5pbXBvcnQge0ZpbGVTeXN0ZW0sIFdvcmtzcGFjZVBhdGh9IGZyb20gJy4vZmlsZS1zeXN0ZW0nO1xuaW1wb3J0IHtkZWZhdWx0TG9nZ2VyLCBVcGRhdGVMb2dnZXJ9IGZyb20gJy4vbG9nZ2VyJztcbmltcG9ydCB7TWlncmF0aW9uLCBNaWdyYXRpb25DdG9yLCBNaWdyYXRpb25GYWlsdXJlfSBmcm9tICcuL21pZ3JhdGlvbic7XG5pbXBvcnQge1RhcmdldFZlcnNpb259IGZyb20gJy4vdGFyZ2V0LXZlcnNpb24nO1xuaW1wb3J0IHtwYXJzZVRzY29uZmlnRmlsZX0gZnJvbSAnLi91dGlscy9wYXJzZS10c2NvbmZpZyc7XG5pbXBvcnQge2NyZWF0ZUZpbGVTeXN0ZW1Db21waWxlckhvc3R9IGZyb20gJy4vdXRpbHMvdmlydHVhbC1ob3N0JztcblxuLyoqXG4gKiBBbiB1cGRhdGUgcHJvamVjdCB0aGF0IGNhbiBiZSBydW4gYWdhaW5zdCBpbmRpdmlkdWFsIG1pZ3JhdGlvbnMuIEFuIHVwZGF0ZSBwcm9qZWN0XG4gKiBhY2NlcHRzIGEgVHlwZVNjcmlwdCBwcm9ncmFtIGFuZCBhIGNvbnRleHQgdGhhdCBpcyBwcm92aWRlZCB0byBhbGwgbWlncmF0aW9ucy4gVGhlXG4gKiBjb250ZXh0IGlzIHVzdWFsbHkgbm90IHVzZWQgYnkgbWlncmF0aW9ucywgYnV0IGluIHNvbWUgY2FzZXMgbWlncmF0aW9ucyByZWx5IG9uXG4gKiBzcGVjaWZpY3MgZnJvbSB0aGUgdG9vbCB0aGF0IHBlcmZvcm1zIHRoZSB1cGRhdGUgKGUuZy4gdGhlIEFuZ3VsYXIgQ0xJKS4gSW4gdGhvc2UgY2FzZXMsXG4gKiB0aGUgY29udGV4dCBjYW4gcHJvdmlkZSB0aGUgbmVjZXNzYXJ5IHNwZWNpZmljcyB0byB0aGUgbWlncmF0aW9ucyBpbiBhIHR5cGUtc2FmZSB3YXkuXG4gKi9cbmV4cG9ydCBjbGFzcyBVcGRhdGVQcm9qZWN0PENvbnRleHQ+IHtcbiAgcHJpdmF0ZSByZWFkb25seSBfdHlwZUNoZWNrZXI6IHRzLlR5cGVDaGVja2VyID0gdGhpcy5fcHJvZ3JhbS5nZXRUeXBlQ2hlY2tlcigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIC8qKiBDb250ZXh0IHByb3ZpZGVkIHRvIGFsbCBtaWdyYXRpb25zLiAqL1xuICAgIHByaXZhdGUgX2NvbnRleHQ6IENvbnRleHQsXG4gICAgLyoqIFR5cGVTY3JpcHQgcHJvZ3JhbSB1c2luZyB3b3Jrc3BhY2UgcGF0aHMuICovXG4gICAgcHJpdmF0ZSBfcHJvZ3JhbTogdHMuUHJvZ3JhbSxcbiAgICAvKiogRmlsZSBzeXN0ZW0gdXNlZCBmb3IgcmVhZGluZywgd3JpdGluZyBhbmQgZWRpdGluZyBmaWxlcy4gKi9cbiAgICBwcml2YXRlIF9maWxlU3lzdGVtOiBGaWxlU3lzdGVtLFxuICAgIC8qKlxuICAgICAqIFNldCBvZiBhbmFseXplZCBmaWxlcy4gVXNlZCBmb3IgYXZvaWRpbmcgbXVsdGlwbGUgbWlncmF0aW9uIHJ1bnMgaWZcbiAgICAgKiBmaWxlcyBvdmVybGFwIGJldHdlZW4gdGFyZ2V0cy5cbiAgICAgKi9cbiAgICBwcml2YXRlIF9hbmFseXplZEZpbGVzOiBTZXQ8V29ya3NwYWNlUGF0aD4gPSBuZXcgU2V0KCksXG4gICAgLyoqIExvZ2dlciB1c2VkIGZvciBwcmludGluZyBtZXNzYWdlcy4gKi9cbiAgICBwcml2YXRlIF9sb2dnZXI6IFVwZGF0ZUxvZ2dlciA9IGRlZmF1bHRMb2dnZXIsXG4gICkge31cblxuICAvKipcbiAgICogTWlncmF0ZXMgdGhlIHByb2plY3QgdG8gdGhlIHNwZWNpZmllZCB0YXJnZXQgdmVyc2lvbi5cbiAgICogQHBhcmFtIG1pZ3JhdGlvblR5cGVzIE1pZ3JhdGlvbnMgdGhhdCBzaG91bGQgYmUgcnVuLlxuICAgKiBAcGFyYW0gdGFyZ2V0IFZlcnNpb24gdGhlIHByb2plY3Qgc2hvdWxkIGJlIHVwZGF0ZWQgdG8uIENhbiBiZSBgbnVsbGAgaWYgdGhlIHNldCBvZlxuICAgKiAgIHNwZWNpZmllZCBtaWdyYXRpb25zIHJ1bnMgcmVnYXJkbGVzcyBvZiBhIHRhcmdldCB2ZXJzaW9uLlxuICAgKiBAcGFyYW0gZGF0YSBVcGdyYWRlIGRhdGEgdGhhdCBpcyBwYXNzZWQgdG8gYWxsIG1pZ3JhdGlvbiBydWxlcy5cbiAgICogQHBhcmFtIGFkZGl0aW9uYWxTdHlsZXNoZWV0UGF0aHMgQWRkaXRpb25hbCBzdHlsZXNoZWV0cyB0aGF0IHNob3VsZCBiZSBtaWdyYXRlZCwgaWYgbm90XG4gICAqICAgcmVmZXJlbmNlZCBpbiBhbiBBbmd1bGFyIGNvbXBvbmVudC4gVGhpcyBpcyBoZWxwZnVsIGZvciBnbG9iYWwgc3R5bGVzaGVldHMgaW4gYSBwcm9qZWN0LlxuICAgKiBAcGFyYW0gbGltaXRUb0RpcmVjdG9yeSBJZiBzcGVjaWZpZWQsIGNoYW5nZXMgd2lsbCBiZSBsaW1pdGVkIHRvIHRoZSBnaXZlbiBkaXJlY3RvcnkuXG4gICAqL1xuICBtaWdyYXRlPERhdGE+KFxuICAgIG1pZ3JhdGlvblR5cGVzOiBNaWdyYXRpb25DdG9yPERhdGEsIENvbnRleHQ+W10sXG4gICAgdGFyZ2V0OiBUYXJnZXRWZXJzaW9uIHwgbnVsbCxcbiAgICBkYXRhOiBEYXRhLFxuICAgIGFkZGl0aW9uYWxTdHlsZXNoZWV0UGF0aHM/OiBzdHJpbmdbXSxcbiAgICBsaW1pdFRvRGlyZWN0b3J5Pzogc3RyaW5nLFxuICApOiB7aGFzRmFpbHVyZXM6IGJvb2xlYW59IHtcbiAgICBsaW1pdFRvRGlyZWN0b3J5ICYmPSB0aGlzLl9maWxlU3lzdGVtLnJlc29sdmUobGltaXRUb0RpcmVjdG9yeSk7XG5cbiAgICAvLyBDcmVhdGUgaW5zdGFuY2VzIG9mIHRoZSBzcGVjaWZpZWQgbWlncmF0aW9ucy5cbiAgICBjb25zdCBtaWdyYXRpb25zID0gdGhpcy5fY3JlYXRlTWlncmF0aW9ucyhtaWdyYXRpb25UeXBlcywgdGFyZ2V0LCBkYXRhKTtcbiAgICAvLyBDcmVhdGVzIHRoZSBjb21wb25lbnQgcmVzb3VyY2UgY29sbGVjdG9yLiBUaGUgY29sbGVjdG9yIGNhbiB2aXNpdCBhcmJpdHJhcnlcbiAgICAvLyBUeXBlU2NyaXB0IG5vZGVzIGFuZCB3aWxsIGZpbmQgQW5ndWxhciBjb21wb25lbnQgcmVzb3VyY2VzLiBSZXNvdXJjZXMgaW5jbHVkZVxuICAgIC8vIHRlbXBsYXRlcyBhbmQgc3R5bGVzaGVldHMuIEl0IGFsc28gY2FwdHVyZXMgaW5saW5lIHN0eWxlc2hlZXRzIGFuZCB0ZW1wbGF0ZXMuXG4gICAgY29uc3QgcmVzb3VyY2VDb2xsZWN0b3IgPSBuZXcgQ29tcG9uZW50UmVzb3VyY2VDb2xsZWN0b3IodGhpcy5fdHlwZUNoZWNrZXIsIHRoaXMuX2ZpbGVTeXN0ZW0pO1xuICAgIC8vIENvbGxlY3QgYWxsIG9mIHRoZSBUeXBlU2NyaXB0IHNvdXJjZSBmaWxlcyB3ZSB3YW50IHRvIG1pZ3JhdGUuIFdlIGRvbid0XG4gICAgLy8gbWlncmF0ZSB0eXBlIGRlZmluaXRpb24gZmlsZXMsIG9yIHNvdXJjZSBmaWxlcyBmcm9tIGV4dGVybmFsIGxpYnJhcmllcy5cbiAgICBjb25zdCBzb3VyY2VGaWxlcyA9IHRoaXMuX3Byb2dyYW0uZ2V0U291cmNlRmlsZXMoKS5maWx0ZXIoZiA9PiB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICAhZi5pc0RlY2xhcmF0aW9uRmlsZSAmJlxuICAgICAgICAobGltaXRUb0RpcmVjdG9yeSA9PSBudWxsIHx8XG4gICAgICAgICAgdGhpcy5fZmlsZVN5c3RlbS5yZXNvbHZlKGYuZmlsZU5hbWUpLnN0YXJ0c1dpdGgobGltaXRUb0RpcmVjdG9yeSkpICYmXG4gICAgICAgICF0aGlzLl9wcm9ncmFtLmlzU291cmNlRmlsZUZyb21FeHRlcm5hbExpYnJhcnkoZilcbiAgICAgICk7XG4gICAgfSk7XG5cbiAgICAvLyBIZWxwZXIgZnVuY3Rpb24gdGhhdCB2aXNpdHMgYSBnaXZlbiBUeXBlU2NyaXB0IG5vZGUgYW5kIGNvbGxlY3RzIGFsbCByZWZlcmVuY2VkXG4gICAgLy8gY29tcG9uZW50IHJlc291cmNlcyAoaS5lLiBzdHlsZXNoZWV0cyBvciB0ZW1wbGF0ZXMpLiBBZGRpdGlvbmFsbHksIHRoZSBoZWxwZXJcbiAgICAvLyB2aXNpdHMgdGhlIG5vZGUgaW4gZWFjaCBpbnN0YW50aWF0ZWQgbWlncmF0aW9uLlxuICAgIGNvbnN0IHZpc2l0Tm9kZUFuZENvbGxlY3RSZXNvdXJjZXMgPSAobm9kZTogdHMuTm9kZSkgPT4ge1xuICAgICAgbWlncmF0aW9ucy5mb3JFYWNoKHIgPT4gci52aXNpdE5vZGUobm9kZSkpO1xuICAgICAgdHMuZm9yRWFjaENoaWxkKG5vZGUsIHZpc2l0Tm9kZUFuZENvbGxlY3RSZXNvdXJjZXMpO1xuICAgICAgcmVzb3VyY2VDb2xsZWN0b3IudmlzaXROb2RlKG5vZGUpO1xuICAgIH07XG5cbiAgICAvLyBXYWxrIHRocm91Z2ggYWxsIHNvdXJjZSBmaWxlLCBpZiBpdCBoYXMgbm90IGJlZW4gdmlzaXRlZCBiZWZvcmUsIGFuZFxuICAgIC8vIHZpc2l0IGZvdW5kIG5vZGVzIHdoaWxlIGNvbGxlY3RpbmcgcG90ZW50aWFsIHJlc291cmNlcy5cbiAgICBzb3VyY2VGaWxlcy5mb3JFYWNoKHNvdXJjZUZpbGUgPT4ge1xuICAgICAgY29uc3QgcmVzb2x2ZWRQYXRoID0gdGhpcy5fZmlsZVN5c3RlbS5yZXNvbHZlKHNvdXJjZUZpbGUuZmlsZU5hbWUpO1xuICAgICAgLy8gRG8gbm90IHZpc2l0IHNvdXJjZSBmaWxlcyB3aGljaCBoYXZlIGJlZW4gY2hlY2tlZCBhcyBwYXJ0IG9mIGFcbiAgICAgIC8vIHByZXZpb3VzbHkgbWlncmF0ZWQgVHlwZVNjcmlwdCBwcm9qZWN0LlxuICAgICAgaWYgKCF0aGlzLl9hbmFseXplZEZpbGVzLmhhcyhyZXNvbHZlZFBhdGgpKSB7XG4gICAgICAgIHZpc2l0Tm9kZUFuZENvbGxlY3RSZXNvdXJjZXMoc291cmNlRmlsZSk7XG4gICAgICAgIHRoaXMuX2FuYWx5emVkRmlsZXMuYWRkKHJlc29sdmVkUGF0aCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBXYWxrIHRocm91Z2ggYWxsIHJlc29sdmVkIHRlbXBsYXRlcyBhbmQgdmlzaXQgdGhlbSBpbiBlYWNoIGluc3RhbnRpYXRlZFxuICAgIC8vIG1pZ3JhdGlvbi4gTm90ZSB0aGF0IHRoaXMgY2FuIG9ubHkgaGFwcGVuIGFmdGVyIHNvdXJjZSBmaWxlcyBoYXZlIGJlZW5cbiAgICAvLyB2aXNpdGVkIGJlY2F1c2Ugd2UgZmluZCB0ZW1wbGF0ZXMgdGhyb3VnaCB0aGUgVHlwZVNjcmlwdCBzb3VyY2UgZmlsZXMuXG4gICAgcmVzb3VyY2VDb2xsZWN0b3IucmVzb2x2ZWRUZW1wbGF0ZXMuZm9yRWFjaCh0ZW1wbGF0ZSA9PiB7XG4gICAgICAvLyBEbyBub3QgdmlzaXQgdGhlIHRlbXBsYXRlIGlmIGl0IGhhcyBiZWVuIGNoZWNrZWQgYmVmb3JlLiBJbmxpbmVcbiAgICAgIC8vIHRlbXBsYXRlcyBjYW5ub3QgYmUgcmVmZXJlbmNlZCBtdWx0aXBsZSB0aW1lcy5cbiAgICAgIGlmICh0ZW1wbGF0ZS5pbmxpbmUgfHwgIXRoaXMuX2FuYWx5emVkRmlsZXMuaGFzKHRlbXBsYXRlLmZpbGVQYXRoKSkge1xuICAgICAgICBtaWdyYXRpb25zLmZvckVhY2gobSA9PiBtLnZpc2l0VGVtcGxhdGUodGVtcGxhdGUpKTtcbiAgICAgICAgdGhpcy5fYW5hbHl6ZWRGaWxlcy5hZGQodGVtcGxhdGUuZmlsZVBhdGgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gV2FsayB0aHJvdWdoIGFsbCByZXNvbHZlZCBzdHlsZXNoZWV0cyBhbmQgdmlzaXQgdGhlbSBpbiBlYWNoIGluc3RhbnRpYXRlZFxuICAgIC8vIG1pZ3JhdGlvbi4gTm90ZSB0aGF0IHRoaXMgY2FuIG9ubHkgaGFwcGVuIGFmdGVyIHNvdXJjZSBmaWxlcyBoYXZlIGJlZW5cbiAgICAvLyB2aXNpdGVkIGJlY2F1c2Ugd2UgZmluZCBzdHlsZXNoZWV0cyB0aHJvdWdoIHRoZSBUeXBlU2NyaXB0IHNvdXJjZSBmaWxlcy5cbiAgICByZXNvdXJjZUNvbGxlY3Rvci5yZXNvbHZlZFN0eWxlc2hlZXRzLmZvckVhY2goc3R5bGVzaGVldCA9PiB7XG4gICAgICAvLyBEbyBub3QgdmlzaXQgdGhlIHN0eWxlc2hlZXQgaWYgaXQgaGFzIGJlZW4gY2hlY2tlZCBiZWZvcmUuIElubGluZVxuICAgICAgLy8gc3R5bGVzaGVldHMgY2Fubm90IGJlIHJlZmVyZW5jZWQgbXVsdGlwbGUgdGltZXMuXG4gICAgICBpZiAoc3R5bGVzaGVldC5pbmxpbmUgfHwgIXRoaXMuX2FuYWx5emVkRmlsZXMuaGFzKHN0eWxlc2hlZXQuZmlsZVBhdGgpKSB7XG4gICAgICAgIG1pZ3JhdGlvbnMuZm9yRWFjaChyID0+IHIudmlzaXRTdHlsZXNoZWV0KHN0eWxlc2hlZXQpKTtcbiAgICAgICAgdGhpcy5fYW5hbHl6ZWRGaWxlcy5hZGQoc3R5bGVzaGVldC5maWxlUGF0aCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBJbiBzb21lIGFwcGxpY2F0aW9ucywgZGV2ZWxvcGVycyB3aWxsIGhhdmUgZ2xvYmFsIHN0eWxlc2hlZXRzIHdoaWNoIGFyZSBub3RcbiAgICAvLyBzcGVjaWZpZWQgaW4gYW55IEFuZ3VsYXIgY29tcG9uZW50LiBUaGVyZWZvcmUgd2UgYWxsb3cgZm9yIGFkZGl0aW9uYWwgc3R5bGVzaGVldHNcbiAgICAvLyBiZWluZyBzcGVjaWZpZWQuIFdlIHZpc2l0IHRoZW0gaW4gZWFjaCBtaWdyYXRpb24gdW5sZXNzIHRoZXkgaGF2ZSBiZWVuIGFscmVhZHlcbiAgICAvLyBkaXNjb3ZlcmVkIGJlZm9yZSBhcyBhY3R1YWwgY29tcG9uZW50IHJlc291cmNlLlxuICAgIGlmIChhZGRpdGlvbmFsU3R5bGVzaGVldFBhdGhzKSB7XG4gICAgICBhZGRpdGlvbmFsU3R5bGVzaGVldFBhdGhzLmZvckVhY2goZmlsZVBhdGggPT4ge1xuICAgICAgICBjb25zdCByZXNvbHZlZFBhdGggPSB0aGlzLl9maWxlU3lzdGVtLnJlc29sdmUoZmlsZVBhdGgpO1xuICAgICAgICBpZiAobGltaXRUb0RpcmVjdG9yeSA9PSBudWxsIHx8IHJlc29sdmVkUGF0aC5zdGFydHNXaXRoKGxpbWl0VG9EaXJlY3RvcnkpKSB7XG4gICAgICAgICAgY29uc3Qgc3R5bGVzaGVldCA9IHJlc291cmNlQ29sbGVjdG9yLnJlc29sdmVFeHRlcm5hbFN0eWxlc2hlZXQocmVzb2x2ZWRQYXRoLCBudWxsKTtcbiAgICAgICAgICAvLyBEbyBub3QgdmlzaXQgc3R5bGVzaGVldHMgd2hpY2ggaGF2ZSBiZWVuIHJlZmVyZW5jZWQgZnJvbSBhIGNvbXBvbmVudC5cbiAgICAgICAgICBpZiAoIXRoaXMuX2FuYWx5emVkRmlsZXMuaGFzKHJlc29sdmVkUGF0aCkgJiYgc3R5bGVzaGVldCkge1xuICAgICAgICAgICAgbWlncmF0aW9ucy5mb3JFYWNoKHIgPT4gci52aXNpdFN0eWxlc2hlZXQoc3R5bGVzaGVldCkpO1xuICAgICAgICAgICAgdGhpcy5fYW5hbHl6ZWRGaWxlcy5hZGQocmVzb2x2ZWRQYXRoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIENhbGwgdGhlIFwicG9zdEFuYWx5c2lzXCIgbWV0aG9kIGZvciBlYWNoIG1pZ3JhdGlvbi5cbiAgICBtaWdyYXRpb25zLmZvckVhY2gociA9PiByLnBvc3RBbmFseXNpcygpKTtcblxuICAgIC8vIENvbGxlY3QgYWxsIGZhaWx1cmVzIHJlcG9ydGVkIGJ5IGluZGl2aWR1YWwgbWlncmF0aW9ucy5cbiAgICBjb25zdCBmYWlsdXJlcyA9IG1pZ3JhdGlvbnMucmVkdWNlKFxuICAgICAgKHJlcywgbSkgPT4gcmVzLmNvbmNhdChtLmZhaWx1cmVzKSxcbiAgICAgIFtdIGFzIE1pZ3JhdGlvbkZhaWx1cmVbXSxcbiAgICApO1xuXG4gICAgLy8gSW4gY2FzZSB0aGVyZSBhcmUgZmFpbHVyZXMsIHByaW50IHRoZXNlIHRvIHRoZSBDTEkgbG9nZ2VyIGFzIHdhcm5pbmdzLlxuICAgIGlmIChmYWlsdXJlcy5sZW5ndGgpIHtcbiAgICAgIGZhaWx1cmVzLmZvckVhY2goKHtmaWxlUGF0aCwgbWVzc2FnZSwgcG9zaXRpb259KSA9PiB7XG4gICAgICAgIGNvbnN0IGxpbmVBbmRDaGFyYWN0ZXIgPSBwb3NpdGlvbiA/IGBAJHtwb3NpdGlvbi5saW5lICsgMX06JHtwb3NpdGlvbi5jaGFyYWN0ZXIgKyAxfWAgOiAnJztcbiAgICAgICAgdGhpcy5fbG9nZ2VyLndhcm4oYCR7ZmlsZVBhdGh9JHtsaW5lQW5kQ2hhcmFjdGVyfSAtICR7bWVzc2FnZX1gKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBoYXNGYWlsdXJlczogISFmYWlsdXJlcy5sZW5ndGgsXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGluc3RhbmNlcyBvZiB0aGUgZ2l2ZW4gbWlncmF0aW9ucyB3aXRoIHRoZSBzcGVjaWZpZWQgdGFyZ2V0XG4gICAqIHZlcnNpb24gYW5kIGRhdGEuXG4gICAqL1xuICBwcml2YXRlIF9jcmVhdGVNaWdyYXRpb25zPERhdGE+KFxuICAgIHR5cGVzOiBNaWdyYXRpb25DdG9yPERhdGEsIENvbnRleHQ+W10sXG4gICAgdGFyZ2V0OiBUYXJnZXRWZXJzaW9uIHwgbnVsbCxcbiAgICBkYXRhOiBEYXRhLFxuICApOiBNaWdyYXRpb248RGF0YSwgQ29udGV4dD5bXSB7XG4gICAgY29uc3QgcmVzdWx0OiBNaWdyYXRpb248RGF0YSwgQ29udGV4dD5bXSA9IFtdO1xuICAgIGZvciAoY29uc3QgY3RvciBvZiB0eXBlcykge1xuICAgICAgY29uc3QgaW5zdGFuY2UgPSBuZXcgY3RvcihcbiAgICAgICAgdGhpcy5fcHJvZ3JhbSxcbiAgICAgICAgdGhpcy5fdHlwZUNoZWNrZXIsXG4gICAgICAgIHRhcmdldCxcbiAgICAgICAgdGhpcy5fY29udGV4dCxcbiAgICAgICAgZGF0YSxcbiAgICAgICAgdGhpcy5fZmlsZVN5c3RlbSxcbiAgICAgICAgdGhpcy5fbG9nZ2VyLFxuICAgICAgKTtcbiAgICAgIGluc3RhbmNlLmluaXQoKTtcbiAgICAgIGlmIChpbnN0YW5jZS5lbmFibGVkKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKGluc3RhbmNlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgcHJvZ3JhbSBmb3JtIHRoZSBzcGVjaWZpZWQgdHNjb25maWcgYW5kIHBhdGNoZXMgdGhlIGhvc3RcbiAgICogdG8gcmVhZCBmaWxlcyBhbmQgZGlyZWN0b3JpZXMgdGhyb3VnaCB0aGUgZ2l2ZW4gZmlsZSBzeXN0ZW0uXG4gICAqXG4gICAqIEB0aHJvd3Mge1RzY29uZmlnUGFyc2VFcnJvcn0gSWYgdGhlIHRzY29uZmlnIGNvdWxkIG5vdCBiZSBwYXJzZWQuXG4gICAqL1xuICBzdGF0aWMgY3JlYXRlUHJvZ3JhbUZyb21Uc2NvbmZpZyh0c2NvbmZpZ1BhdGg6IFdvcmtzcGFjZVBhdGgsIGZzOiBGaWxlU3lzdGVtKTogdHMuUHJvZ3JhbSB7XG4gICAgY29uc3QgcGFyc2VkID0gcGFyc2VUc2NvbmZpZ0ZpbGUoZnMucmVzb2x2ZSh0c2NvbmZpZ1BhdGgpLCBmcyk7XG4gICAgY29uc3QgaG9zdCA9IGNyZWF0ZUZpbGVTeXN0ZW1Db21waWxlckhvc3QocGFyc2VkLm9wdGlvbnMsIGZzKTtcbiAgICByZXR1cm4gdHMuY3JlYXRlUHJvZ3JhbShwYXJzZWQuZmlsZU5hbWVzLCBwYXJzZWQub3B0aW9ucywgaG9zdCk7XG4gIH1cbn1cbiJdfQ==