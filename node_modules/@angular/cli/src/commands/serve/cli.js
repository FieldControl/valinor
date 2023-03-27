"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServeCommandModule = void 0;
const architect_command_module_1 = require("../../command-builder/architect-command-module");
class ServeCommandModule extends architect_command_module_1.ArchitectCommandModule {
    constructor() {
        super(...arguments);
        this.multiTarget = false;
        this.command = 'serve [project]';
        this.aliases = ['s'];
        this.describe = 'Builds and serves your application, rebuilding on file changes.';
    }
}
exports.ServeCommandModule = ServeCommandModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5ndWxhci9jbGkvc3JjL2NvbW1hbmRzL3NlcnZlL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCw2RkFBd0Y7QUFHeEYsTUFBYSxrQkFDWCxTQUFRLGlEQUFzQjtJQURoQzs7UUFJRSxnQkFBVyxHQUFHLEtBQUssQ0FBQztRQUNwQixZQUFPLEdBQUcsaUJBQWlCLENBQUM7UUFDNUIsWUFBTyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDaEIsYUFBUSxHQUFHLGlFQUFpRSxDQUFDO0lBRS9FLENBQUM7Q0FBQTtBQVRELGdEQVNDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7IEFyY2hpdGVjdENvbW1hbmRNb2R1bGUgfSBmcm9tICcuLi8uLi9jb21tYW5kLWJ1aWxkZXIvYXJjaGl0ZWN0LWNvbW1hbmQtbW9kdWxlJztcbmltcG9ydCB7IENvbW1hbmRNb2R1bGVJbXBsZW1lbnRhdGlvbiB9IGZyb20gJy4uLy4uL2NvbW1hbmQtYnVpbGRlci9jb21tYW5kLW1vZHVsZSc7XG5cbmV4cG9ydCBjbGFzcyBTZXJ2ZUNvbW1hbmRNb2R1bGVcbiAgZXh0ZW5kcyBBcmNoaXRlY3RDb21tYW5kTW9kdWxlXG4gIGltcGxlbWVudHMgQ29tbWFuZE1vZHVsZUltcGxlbWVudGF0aW9uXG57XG4gIG11bHRpVGFyZ2V0ID0gZmFsc2U7XG4gIGNvbW1hbmQgPSAnc2VydmUgW3Byb2plY3RdJztcbiAgYWxpYXNlcyA9IFsncyddO1xuICBkZXNjcmliZSA9ICdCdWlsZHMgYW5kIHNlcnZlcyB5b3VyIGFwcGxpY2F0aW9uLCByZWJ1aWxkaW5nIG9uIGZpbGUgY2hhbmdlcy4nO1xuICBsb25nRGVzY3JpcHRpb25QYXRoPzogc3RyaW5nIHwgdW5kZWZpbmVkO1xufVxuIl19