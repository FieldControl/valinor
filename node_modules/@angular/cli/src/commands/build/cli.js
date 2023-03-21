"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildCommandModule = void 0;
const path_1 = require("path");
const architect_command_module_1 = require("../../command-builder/architect-command-module");
class BuildCommandModule extends architect_command_module_1.ArchitectCommandModule {
    constructor() {
        super(...arguments);
        this.multiTarget = false;
        this.command = 'build [project]';
        this.aliases = ['b'];
        this.describe = 'Compiles an Angular application or library into an output directory named dist/ at the given output path.';
        this.longDescriptionPath = (0, path_1.join)(__dirname, 'long-description.md');
    }
}
exports.BuildCommandModule = BuildCommandModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5ndWxhci9jbGkvc3JjL2NvbW1hbmRzL2J1aWxkL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCwrQkFBNEI7QUFDNUIsNkZBQXdGO0FBR3hGLE1BQWEsa0JBQ1gsU0FBUSxpREFBc0I7SUFEaEM7O1FBSUUsZ0JBQVcsR0FBRyxLQUFLLENBQUM7UUFDcEIsWUFBTyxHQUFHLGlCQUFpQixDQUFDO1FBQzVCLFlBQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2hCLGFBQVEsR0FDTiwyR0FBMkcsQ0FBQztRQUM5Ryx3QkFBbUIsR0FBRyxJQUFBLFdBQUksRUFBQyxTQUFTLEVBQUUscUJBQXFCLENBQUMsQ0FBQztJQUMvRCxDQUFDO0NBQUE7QUFWRCxnREFVQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgeyBqb2luIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBBcmNoaXRlY3RDb21tYW5kTW9kdWxlIH0gZnJvbSAnLi4vLi4vY29tbWFuZC1idWlsZGVyL2FyY2hpdGVjdC1jb21tYW5kLW1vZHVsZSc7XG5pbXBvcnQgeyBDb21tYW5kTW9kdWxlSW1wbGVtZW50YXRpb24gfSBmcm9tICcuLi8uLi9jb21tYW5kLWJ1aWxkZXIvY29tbWFuZC1tb2R1bGUnO1xuXG5leHBvcnQgY2xhc3MgQnVpbGRDb21tYW5kTW9kdWxlXG4gIGV4dGVuZHMgQXJjaGl0ZWN0Q29tbWFuZE1vZHVsZVxuICBpbXBsZW1lbnRzIENvbW1hbmRNb2R1bGVJbXBsZW1lbnRhdGlvblxue1xuICBtdWx0aVRhcmdldCA9IGZhbHNlO1xuICBjb21tYW5kID0gJ2J1aWxkIFtwcm9qZWN0XSc7XG4gIGFsaWFzZXMgPSBbJ2InXTtcbiAgZGVzY3JpYmUgPVxuICAgICdDb21waWxlcyBhbiBBbmd1bGFyIGFwcGxpY2F0aW9uIG9yIGxpYnJhcnkgaW50byBhbiBvdXRwdXQgZGlyZWN0b3J5IG5hbWVkIGRpc3QvIGF0IHRoZSBnaXZlbiBvdXRwdXQgcGF0aC4nO1xuICBsb25nRGVzY3JpcHRpb25QYXRoID0gam9pbihfX2Rpcm5hbWUsICdsb25nLWRlc2NyaXB0aW9uLm1kJyk7XG59XG4iXX0=