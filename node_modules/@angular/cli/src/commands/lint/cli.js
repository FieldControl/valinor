"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LintCommandModule = void 0;
const path_1 = require("path");
const architect_command_module_1 = require("../../command-builder/architect-command-module");
class LintCommandModule extends architect_command_module_1.ArchitectCommandModule {
    constructor() {
        super(...arguments);
        this.missingTargetChoices = [
            {
                name: 'ESLint',
                value: '@angular-eslint/schematics',
            },
        ];
        this.multiTarget = true;
        this.command = 'lint [project]';
        this.longDescriptionPath = (0, path_1.join)(__dirname, 'long-description.md');
        this.describe = 'Runs linting tools on Angular application code in a given project folder.';
    }
}
exports.LintCommandModule = LintCommandModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5ndWxhci9jbGkvc3JjL2NvbW1hbmRzL2xpbnQvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILCtCQUE0QjtBQUU1Qiw2RkFBd0Y7QUFHeEYsTUFBYSxpQkFDWCxTQUFRLGlEQUFzQjtJQURoQzs7UUFJVyx5QkFBb0IsR0FBMEI7WUFDckQ7Z0JBQ0UsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsS0FBSyxFQUFFLDRCQUE0QjthQUNwQztTQUNGLENBQUM7UUFFRixnQkFBVyxHQUFHLElBQUksQ0FBQztRQUNuQixZQUFPLEdBQUcsZ0JBQWdCLENBQUM7UUFDM0Isd0JBQW1CLEdBQUcsSUFBQSxXQUFJLEVBQUMsU0FBUyxFQUFFLHFCQUFxQixDQUFDLENBQUM7UUFDN0QsYUFBUSxHQUFHLDJFQUEyRSxDQUFDO0lBQ3pGLENBQUM7Q0FBQTtBQWZELDhDQWVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IE1pc3NpbmdUYXJnZXRDaG9pY2UgfSBmcm9tICcuLi8uLi9jb21tYW5kLWJ1aWxkZXIvYXJjaGl0ZWN0LWJhc2UtY29tbWFuZC1tb2R1bGUnO1xuaW1wb3J0IHsgQXJjaGl0ZWN0Q29tbWFuZE1vZHVsZSB9IGZyb20gJy4uLy4uL2NvbW1hbmQtYnVpbGRlci9hcmNoaXRlY3QtY29tbWFuZC1tb2R1bGUnO1xuaW1wb3J0IHsgQ29tbWFuZE1vZHVsZUltcGxlbWVudGF0aW9uIH0gZnJvbSAnLi4vLi4vY29tbWFuZC1idWlsZGVyL2NvbW1hbmQtbW9kdWxlJztcblxuZXhwb3J0IGNsYXNzIExpbnRDb21tYW5kTW9kdWxlXG4gIGV4dGVuZHMgQXJjaGl0ZWN0Q29tbWFuZE1vZHVsZVxuICBpbXBsZW1lbnRzIENvbW1hbmRNb2R1bGVJbXBsZW1lbnRhdGlvblxue1xuICBvdmVycmlkZSBtaXNzaW5nVGFyZ2V0Q2hvaWNlczogTWlzc2luZ1RhcmdldENob2ljZVtdID0gW1xuICAgIHtcbiAgICAgIG5hbWU6ICdFU0xpbnQnLFxuICAgICAgdmFsdWU6ICdAYW5ndWxhci1lc2xpbnQvc2NoZW1hdGljcycsXG4gICAgfSxcbiAgXTtcblxuICBtdWx0aVRhcmdldCA9IHRydWU7XG4gIGNvbW1hbmQgPSAnbGludCBbcHJvamVjdF0nO1xuICBsb25nRGVzY3JpcHRpb25QYXRoID0gam9pbihfX2Rpcm5hbWUsICdsb25nLWRlc2NyaXB0aW9uLm1kJyk7XG4gIGRlc2NyaWJlID0gJ1J1bnMgbGludGluZyB0b29scyBvbiBBbmd1bGFyIGFwcGxpY2F0aW9uIGNvZGUgaW4gYSBnaXZlbiBwcm9qZWN0IGZvbGRlci4nO1xufVxuIl19