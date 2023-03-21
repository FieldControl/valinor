"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.E2eCommandModule = void 0;
const architect_command_module_1 = require("../../command-builder/architect-command-module");
class E2eCommandModule extends architect_command_module_1.ArchitectCommandModule {
    constructor() {
        super(...arguments);
        this.missingTargetChoices = [
            {
                name: 'Cypress',
                value: '@cypress/schematic',
            },
            {
                name: 'Nightwatch',
                value: '@nightwatch/schematics',
            },
            {
                name: 'WebdriverIO',
                value: '@wdio/schematics',
            },
        ];
        this.multiTarget = true;
        this.command = 'e2e [project]';
        this.aliases = ['e'];
        this.describe = 'Builds and serves an Angular application, then runs end-to-end tests.';
    }
}
exports.E2eCommandModule = E2eCommandModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5ndWxhci9jbGkvc3JjL2NvbW1hbmRzL2UyZS9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBR0gsNkZBQXdGO0FBR3hGLE1BQWEsZ0JBQ1gsU0FBUSxpREFBc0I7SUFEaEM7O1FBSVcseUJBQW9CLEdBQTBCO1lBQ3JEO2dCQUNFLElBQUksRUFBRSxTQUFTO2dCQUNmLEtBQUssRUFBRSxvQkFBb0I7YUFDNUI7WUFDRDtnQkFDRSxJQUFJLEVBQUUsWUFBWTtnQkFDbEIsS0FBSyxFQUFFLHdCQUF3QjthQUNoQztZQUNEO2dCQUNFLElBQUksRUFBRSxhQUFhO2dCQUNuQixLQUFLLEVBQUUsa0JBQWtCO2FBQzFCO1NBQ0YsQ0FBQztRQUVGLGdCQUFXLEdBQUcsSUFBSSxDQUFDO1FBQ25CLFlBQU8sR0FBRyxlQUFlLENBQUM7UUFDMUIsWUFBTyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDaEIsYUFBUSxHQUFHLHVFQUF1RSxDQUFDO0lBRXJGLENBQUM7Q0FBQTtBQXhCRCw0Q0F3QkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHsgTWlzc2luZ1RhcmdldENob2ljZSB9IGZyb20gJy4uLy4uL2NvbW1hbmQtYnVpbGRlci9hcmNoaXRlY3QtYmFzZS1jb21tYW5kLW1vZHVsZSc7XG5pbXBvcnQgeyBBcmNoaXRlY3RDb21tYW5kTW9kdWxlIH0gZnJvbSAnLi4vLi4vY29tbWFuZC1idWlsZGVyL2FyY2hpdGVjdC1jb21tYW5kLW1vZHVsZSc7XG5pbXBvcnQgeyBDb21tYW5kTW9kdWxlSW1wbGVtZW50YXRpb24gfSBmcm9tICcuLi8uLi9jb21tYW5kLWJ1aWxkZXIvY29tbWFuZC1tb2R1bGUnO1xuXG5leHBvcnQgY2xhc3MgRTJlQ29tbWFuZE1vZHVsZVxuICBleHRlbmRzIEFyY2hpdGVjdENvbW1hbmRNb2R1bGVcbiAgaW1wbGVtZW50cyBDb21tYW5kTW9kdWxlSW1wbGVtZW50YXRpb25cbntcbiAgb3ZlcnJpZGUgbWlzc2luZ1RhcmdldENob2ljZXM6IE1pc3NpbmdUYXJnZXRDaG9pY2VbXSA9IFtcbiAgICB7XG4gICAgICBuYW1lOiAnQ3lwcmVzcycsXG4gICAgICB2YWx1ZTogJ0BjeXByZXNzL3NjaGVtYXRpYycsXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiAnTmlnaHR3YXRjaCcsXG4gICAgICB2YWx1ZTogJ0BuaWdodHdhdGNoL3NjaGVtYXRpY3MnLFxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogJ1dlYmRyaXZlcklPJyxcbiAgICAgIHZhbHVlOiAnQHdkaW8vc2NoZW1hdGljcycsXG4gICAgfSxcbiAgXTtcblxuICBtdWx0aVRhcmdldCA9IHRydWU7XG4gIGNvbW1hbmQgPSAnZTJlIFtwcm9qZWN0XSc7XG4gIGFsaWFzZXMgPSBbJ2UnXTtcbiAgZGVzY3JpYmUgPSAnQnVpbGRzIGFuZCBzZXJ2ZXMgYW4gQW5ndWxhciBhcHBsaWNhdGlvbiwgdGhlbiBydW5zIGVuZC10by1lbmQgdGVzdHMuJztcbiAgbG9uZ0Rlc2NyaXB0aW9uUGF0aD86IHN0cmluZztcbn1cbiJdfQ==