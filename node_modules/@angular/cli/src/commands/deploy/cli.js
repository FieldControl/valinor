"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeployCommandModule = void 0;
const path_1 = require("path");
const architect_command_module_1 = require("../../command-builder/architect-command-module");
class DeployCommandModule extends architect_command_module_1.ArchitectCommandModule {
    constructor() {
        super(...arguments);
        // The below choices should be kept in sync with the list in https://angular.io/guide/deployment
        this.missingTargetChoices = [
            {
                name: 'Amazon S3',
                value: '@jefiozie/ngx-aws-deploy',
            },
            {
                name: 'Firebase',
                value: '@angular/fire',
            },
            {
                name: 'Netlify',
                value: '@netlify-builder/deploy',
            },
            {
                name: 'NPM',
                value: 'ngx-deploy-npm',
            },
            {
                name: 'GitHub Pages',
                value: 'angular-cli-ghpages',
            },
        ];
        this.multiTarget = false;
        this.command = 'deploy [project]';
        this.longDescriptionPath = (0, path_1.join)(__dirname, 'long-description.md');
        this.describe = 'Invokes the deploy builder for a specified project or for the default project in the workspace.';
    }
}
exports.DeployCommandModule = DeployCommandModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5ndWxhci9jbGkvc3JjL2NvbW1hbmRzL2RlcGxveS9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsK0JBQTRCO0FBRTVCLDZGQUF3RjtBQUd4RixNQUFhLG1CQUNYLFNBQVEsaURBQXNCO0lBRGhDOztRQUlFLGdHQUFnRztRQUN2Rix5QkFBb0IsR0FBMEI7WUFDckQ7Z0JBQ0UsSUFBSSxFQUFFLFdBQVc7Z0JBQ2pCLEtBQUssRUFBRSwwQkFBMEI7YUFDbEM7WUFDRDtnQkFDRSxJQUFJLEVBQUUsVUFBVTtnQkFDaEIsS0FBSyxFQUFFLGVBQWU7YUFDdkI7WUFDRDtnQkFDRSxJQUFJLEVBQUUsU0FBUztnQkFDZixLQUFLLEVBQUUseUJBQXlCO2FBQ2pDO1lBQ0Q7Z0JBQ0UsSUFBSSxFQUFFLEtBQUs7Z0JBQ1gsS0FBSyxFQUFFLGdCQUFnQjthQUN4QjtZQUNEO2dCQUNFLElBQUksRUFBRSxjQUFjO2dCQUNwQixLQUFLLEVBQUUscUJBQXFCO2FBQzdCO1NBQ0YsQ0FBQztRQUVGLGdCQUFXLEdBQUcsS0FBSyxDQUFDO1FBQ3BCLFlBQU8sR0FBRyxrQkFBa0IsQ0FBQztRQUM3Qix3QkFBbUIsR0FBRyxJQUFBLFdBQUksRUFBQyxTQUFTLEVBQUUscUJBQXFCLENBQUMsQ0FBQztRQUM3RCxhQUFRLEdBQ04saUdBQWlHLENBQUM7SUFDdEcsQ0FBQztDQUFBO0FBakNELGtEQWlDQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgeyBqb2luIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBNaXNzaW5nVGFyZ2V0Q2hvaWNlIH0gZnJvbSAnLi4vLi4vY29tbWFuZC1idWlsZGVyL2FyY2hpdGVjdC1iYXNlLWNvbW1hbmQtbW9kdWxlJztcbmltcG9ydCB7IEFyY2hpdGVjdENvbW1hbmRNb2R1bGUgfSBmcm9tICcuLi8uLi9jb21tYW5kLWJ1aWxkZXIvYXJjaGl0ZWN0LWNvbW1hbmQtbW9kdWxlJztcbmltcG9ydCB7IENvbW1hbmRNb2R1bGVJbXBsZW1lbnRhdGlvbiB9IGZyb20gJy4uLy4uL2NvbW1hbmQtYnVpbGRlci9jb21tYW5kLW1vZHVsZSc7XG5cbmV4cG9ydCBjbGFzcyBEZXBsb3lDb21tYW5kTW9kdWxlXG4gIGV4dGVuZHMgQXJjaGl0ZWN0Q29tbWFuZE1vZHVsZVxuICBpbXBsZW1lbnRzIENvbW1hbmRNb2R1bGVJbXBsZW1lbnRhdGlvblxue1xuICAvLyBUaGUgYmVsb3cgY2hvaWNlcyBzaG91bGQgYmUga2VwdCBpbiBzeW5jIHdpdGggdGhlIGxpc3QgaW4gaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL2RlcGxveW1lbnRcbiAgb3ZlcnJpZGUgbWlzc2luZ1RhcmdldENob2ljZXM6IE1pc3NpbmdUYXJnZXRDaG9pY2VbXSA9IFtcbiAgICB7XG4gICAgICBuYW1lOiAnQW1hem9uIFMzJyxcbiAgICAgIHZhbHVlOiAnQGplZmlvemllL25neC1hd3MtZGVwbG95JyxcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICdGaXJlYmFzZScsXG4gICAgICB2YWx1ZTogJ0Bhbmd1bGFyL2ZpcmUnLFxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogJ05ldGxpZnknLFxuICAgICAgdmFsdWU6ICdAbmV0bGlmeS1idWlsZGVyL2RlcGxveScsXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiAnTlBNJyxcbiAgICAgIHZhbHVlOiAnbmd4LWRlcGxveS1ucG0nLFxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogJ0dpdEh1YiBQYWdlcycsXG4gICAgICB2YWx1ZTogJ2FuZ3VsYXItY2xpLWdocGFnZXMnLFxuICAgIH0sXG4gIF07XG5cbiAgbXVsdGlUYXJnZXQgPSBmYWxzZTtcbiAgY29tbWFuZCA9ICdkZXBsb3kgW3Byb2plY3RdJztcbiAgbG9uZ0Rlc2NyaXB0aW9uUGF0aCA9IGpvaW4oX19kaXJuYW1lLCAnbG9uZy1kZXNjcmlwdGlvbi5tZCcpO1xuICBkZXNjcmliZSA9XG4gICAgJ0ludm9rZXMgdGhlIGRlcGxveSBidWlsZGVyIGZvciBhIHNwZWNpZmllZCBwcm9qZWN0IG9yIGZvciB0aGUgZGVmYXVsdCBwcm9qZWN0IGluIHRoZSB3b3Jrc3BhY2UuJztcbn1cbiJdfQ==