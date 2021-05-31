"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemingApiMigration = void 0;
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular/cdk/schematics");
const migration_1 = require("./migration");
/** Migration that switches all Sass files using Material theming APIs to `@use`. */
class ThemingApiMigration extends schematics_1.DevkitMigration {
    constructor() {
        super(...arguments);
        this.enabled = this.targetVersion === schematics_1.TargetVersion.V12;
    }
    visitStylesheet(stylesheet) {
        if (core_1.extname(stylesheet.filePath) === '.scss') {
            const content = stylesheet.content;
            const migratedContent = content ? migration_1.migrateFileContent(content, '~@angular/material/', '~@angular/cdk/', '~@angular/material', '~@angular/cdk') : content;
            if (migratedContent && migratedContent !== content) {
                this.fileSystem.edit(stylesheet.filePath)
                    .remove(0, stylesheet.content.length)
                    .insertLeft(0, migratedContent);
                ThemingApiMigration.migratedFileCount++;
            }
        }
    }
    /** Logs out the number of migrated files at the end of the migration. */
    static globalPostMigration(_tree, context) {
        const count = ThemingApiMigration.migratedFileCount;
        if (count > 0) {
            context.logger.info(`Migrated ${count === 1 ? `1 file` : `${count} files`} to the ` +
                `new Angular Material theming API.`);
            ThemingApiMigration.migratedFileCount = 0;
        }
    }
}
exports.ThemingApiMigration = ThemingApiMigration;
/** Number of files that have been migrated. */
ThemingApiMigration.migratedFileCount = 0;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhlbWluZy1hcGktbWlncmF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL3NjaGVtYXRpY3MvbmctdXBkYXRlL21pZ3JhdGlvbnMvdGhlbWluZy1hcGktdjEyL3RoZW1pbmctYXBpLW1pZ3JhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCwrQ0FBNkM7QUFFN0Msd0RBQXlGO0FBQ3pGLDJDQUErQztBQUUvQyxvRkFBb0Y7QUFDcEYsTUFBYSxtQkFBb0IsU0FBUSw0QkFBcUI7SUFBOUQ7O1FBSUUsWUFBTyxHQUFHLElBQUksQ0FBQyxhQUFhLEtBQUssMEJBQWEsQ0FBQyxHQUFHLENBQUM7SUEyQnJELENBQUM7SUF6QkMsZUFBZSxDQUFDLFVBQTRCO1FBQzFDLElBQUksY0FBTyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsS0FBSyxPQUFPLEVBQUU7WUFDNUMsTUFBTSxPQUFPLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQztZQUNuQyxNQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLDhCQUFrQixDQUFDLE9BQU8sRUFDMUQscUJBQXFCLEVBQUUsZ0JBQWdCLEVBQUUsb0JBQW9CLEVBQUUsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztZQUU1RixJQUFJLGVBQWUsSUFBSSxlQUFlLEtBQUssT0FBTyxFQUFFO2dCQUNsRCxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDO3FCQUN0QyxNQUFNLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO3FCQUNwQyxVQUFVLENBQUMsQ0FBQyxFQUFFLGVBQWUsQ0FBQyxDQUFDO2dCQUNsQyxtQkFBbUIsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO2FBQ3pDO1NBQ0Y7SUFDSCxDQUFDO0lBRUQseUVBQXlFO0lBQ3pFLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxLQUFjLEVBQUUsT0FBeUI7UUFDbEUsTUFBTSxLQUFLLEdBQUcsbUJBQW1CLENBQUMsaUJBQWlCLENBQUM7UUFFcEQsSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFO1lBQ2IsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxRQUFRLFVBQVU7Z0JBQy9ELG1DQUFtQyxDQUFDLENBQUM7WUFDekQsbUJBQW1CLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO1NBQzNDO0lBQ0gsQ0FBQzs7QUE5Qkgsa0RBK0JDO0FBOUJDLCtDQUErQztBQUN4QyxxQ0FBaUIsR0FBRyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtleHRuYW1lfSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZSc7XG5pbXBvcnQge1NjaGVtYXRpY0NvbnRleHR9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzJztcbmltcG9ydCB7RGV2a2l0TWlncmF0aW9uLCBSZXNvbHZlZFJlc291cmNlLCBUYXJnZXRWZXJzaW9ufSBmcm9tICdAYW5ndWxhci9jZGsvc2NoZW1hdGljcyc7XG5pbXBvcnQge21pZ3JhdGVGaWxlQ29udGVudH0gZnJvbSAnLi9taWdyYXRpb24nO1xuXG4vKiogTWlncmF0aW9uIHRoYXQgc3dpdGNoZXMgYWxsIFNhc3MgZmlsZXMgdXNpbmcgTWF0ZXJpYWwgdGhlbWluZyBBUElzIHRvIGBAdXNlYC4gKi9cbmV4cG9ydCBjbGFzcyBUaGVtaW5nQXBpTWlncmF0aW9uIGV4dGVuZHMgRGV2a2l0TWlncmF0aW9uPG51bGw+IHtcbiAgLyoqIE51bWJlciBvZiBmaWxlcyB0aGF0IGhhdmUgYmVlbiBtaWdyYXRlZC4gKi9cbiAgc3RhdGljIG1pZ3JhdGVkRmlsZUNvdW50ID0gMDtcblxuICBlbmFibGVkID0gdGhpcy50YXJnZXRWZXJzaW9uID09PSBUYXJnZXRWZXJzaW9uLlYxMjtcblxuICB2aXNpdFN0eWxlc2hlZXQoc3R5bGVzaGVldDogUmVzb2x2ZWRSZXNvdXJjZSk6IHZvaWQge1xuICAgIGlmIChleHRuYW1lKHN0eWxlc2hlZXQuZmlsZVBhdGgpID09PSAnLnNjc3MnKSB7XG4gICAgICBjb25zdCBjb250ZW50ID0gc3R5bGVzaGVldC5jb250ZW50O1xuICAgICAgY29uc3QgbWlncmF0ZWRDb250ZW50ID0gY29udGVudCA/IG1pZ3JhdGVGaWxlQ29udGVudChjb250ZW50LFxuICAgICAgICAnfkBhbmd1bGFyL21hdGVyaWFsLycsICd+QGFuZ3VsYXIvY2RrLycsICd+QGFuZ3VsYXIvbWF0ZXJpYWwnLCAnfkBhbmd1bGFyL2NkaycpIDogY29udGVudDtcblxuICAgICAgaWYgKG1pZ3JhdGVkQ29udGVudCAmJiBtaWdyYXRlZENvbnRlbnQgIT09IGNvbnRlbnQpIHtcbiAgICAgICAgdGhpcy5maWxlU3lzdGVtLmVkaXQoc3R5bGVzaGVldC5maWxlUGF0aClcbiAgICAgICAgICAucmVtb3ZlKDAsIHN0eWxlc2hlZXQuY29udGVudC5sZW5ndGgpXG4gICAgICAgICAgLmluc2VydExlZnQoMCwgbWlncmF0ZWRDb250ZW50KTtcbiAgICAgICAgVGhlbWluZ0FwaU1pZ3JhdGlvbi5taWdyYXRlZEZpbGVDb3VudCsrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBMb2dzIG91dCB0aGUgbnVtYmVyIG9mIG1pZ3JhdGVkIGZpbGVzIGF0IHRoZSBlbmQgb2YgdGhlIG1pZ3JhdGlvbi4gKi9cbiAgc3RhdGljIGdsb2JhbFBvc3RNaWdyYXRpb24oX3RyZWU6IHVua25vd24sIGNvbnRleHQ6IFNjaGVtYXRpY0NvbnRleHQpOiB2b2lkIHtcbiAgICBjb25zdCBjb3VudCA9IFRoZW1pbmdBcGlNaWdyYXRpb24ubWlncmF0ZWRGaWxlQ291bnQ7XG5cbiAgICBpZiAoY291bnQgPiAwKSB7XG4gICAgICBjb250ZXh0LmxvZ2dlci5pbmZvKGBNaWdyYXRlZCAke2NvdW50ID09PSAxID8gYDEgZmlsZWAgOiBgJHtjb3VudH0gZmlsZXNgfSB0byB0aGUgYCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGBuZXcgQW5ndWxhciBNYXRlcmlhbCB0aGVtaW5nIEFQSS5gKTtcbiAgICAgIFRoZW1pbmdBcGlNaWdyYXRpb24ubWlncmF0ZWRGaWxlQ291bnQgPSAwO1xuICAgIH1cbiAgfVxufVxuIl19