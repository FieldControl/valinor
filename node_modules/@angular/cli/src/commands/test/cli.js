"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestCommandModule = void 0;
const path_1 = require("path");
const architect_command_module_1 = require("../../command-builder/architect-command-module");
class TestCommandModule extends architect_command_module_1.ArchitectCommandModule {
    constructor() {
        super(...arguments);
        this.multiTarget = true;
        this.command = 'test [project]';
        this.aliases = ['t'];
        this.describe = 'Runs unit tests in a project.';
        this.longDescriptionPath = (0, path_1.join)(__dirname, 'long-description.md');
    }
}
exports.TestCommandModule = TestCommandModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5ndWxhci9jbGkvc3JjL2NvbW1hbmRzL3Rlc3QvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILCtCQUE0QjtBQUM1Qiw2RkFBd0Y7QUFHeEYsTUFBYSxpQkFDWCxTQUFRLGlEQUFzQjtJQURoQzs7UUFJRSxnQkFBVyxHQUFHLElBQUksQ0FBQztRQUNuQixZQUFPLEdBQUcsZ0JBQWdCLENBQUM7UUFDM0IsWUFBTyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDaEIsYUFBUSxHQUFHLCtCQUErQixDQUFDO1FBQzNDLHdCQUFtQixHQUFHLElBQUEsV0FBSSxFQUFDLFNBQVMsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO0lBQy9ELENBQUM7Q0FBQTtBQVRELDhDQVNDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IEFyY2hpdGVjdENvbW1hbmRNb2R1bGUgfSBmcm9tICcuLi8uLi9jb21tYW5kLWJ1aWxkZXIvYXJjaGl0ZWN0LWNvbW1hbmQtbW9kdWxlJztcbmltcG9ydCB7IENvbW1hbmRNb2R1bGVJbXBsZW1lbnRhdGlvbiB9IGZyb20gJy4uLy4uL2NvbW1hbmQtYnVpbGRlci9jb21tYW5kLW1vZHVsZSc7XG5cbmV4cG9ydCBjbGFzcyBUZXN0Q29tbWFuZE1vZHVsZVxuICBleHRlbmRzIEFyY2hpdGVjdENvbW1hbmRNb2R1bGVcbiAgaW1wbGVtZW50cyBDb21tYW5kTW9kdWxlSW1wbGVtZW50YXRpb25cbntcbiAgbXVsdGlUYXJnZXQgPSB0cnVlO1xuICBjb21tYW5kID0gJ3Rlc3QgW3Byb2plY3RdJztcbiAgYWxpYXNlcyA9IFsndCddO1xuICBkZXNjcmliZSA9ICdSdW5zIHVuaXQgdGVzdHMgaW4gYSBwcm9qZWN0Lic7XG4gIGxvbmdEZXNjcmlwdGlvblBhdGggPSBqb2luKF9fZGlybmFtZSwgJ2xvbmctZGVzY3JpcHRpb24ubWQnKTtcbn1cbiJdfQ==