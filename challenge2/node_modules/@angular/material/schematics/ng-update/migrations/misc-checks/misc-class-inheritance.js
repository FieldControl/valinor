"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiscClassInheritanceMigration = void 0;
const schematics_1 = require("@angular/cdk/schematics");
const ts = require("typescript");
/**
 * Migration that checks for classes that extend Angular Material classes which
 * have changed their API.
 */
class MiscClassInheritanceMigration extends schematics_1.Migration {
    constructor() {
        super(...arguments);
        // Only enable this rule if the migration targets version 6. The rule
        // currently only includes migrations for V6 deprecations.
        this.enabled = this.targetVersion === schematics_1.TargetVersion.V6;
    }
    visitNode(node) {
        if (ts.isClassDeclaration(node)) {
            this._visitClassDeclaration(node);
        }
    }
    _visitClassDeclaration(node) {
        const baseTypes = schematics_1.determineBaseTypes(node);
        const className = node.name ? node.name.text : '{unknown-name}';
        if (!baseTypes) {
            return;
        }
        // Migration for: https://github.com/angular/components/pull/10293 (v6)
        if (baseTypes.includes('MatFormFieldControl')) {
            const hasFloatLabelMember = node.members.filter(member => member.name)
                .find(member => member.name.getText() === 'shouldLabelFloat');
            if (!hasFloatLabelMember) {
                this.createFailureAtNode(node, `Found class "${className}" which extends ` +
                    `"${'MatFormFieldControl'}". This class must define ` +
                    `"${'shouldLabelFloat'}" which is now a required property.`);
            }
        }
    }
}
exports.MiscClassInheritanceMigration = MiscClassInheritanceMigration;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWlzYy1jbGFzcy1pbmhlcml0YW5jZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9zY2hlbWF0aWNzL25nLXVwZGF0ZS9taWdyYXRpb25zL21pc2MtY2hlY2tzL21pc2MtY2xhc3MtaW5oZXJpdGFuY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsd0RBQXFGO0FBQ3JGLGlDQUFpQztBQUVqQzs7O0dBR0c7QUFDSCxNQUFhLDZCQUE4QixTQUFRLHNCQUFlO0lBQWxFOztRQUVFLHFFQUFxRTtRQUNyRSwwREFBMEQ7UUFDMUQsWUFBTyxHQUFHLElBQUksQ0FBQyxhQUFhLEtBQUssMEJBQWEsQ0FBQyxFQUFFLENBQUM7SUErQnBELENBQUM7SUE3QkMsU0FBUyxDQUFDLElBQWE7UUFDckIsSUFBSSxFQUFFLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDL0IsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ25DO0lBQ0gsQ0FBQztJQUVPLHNCQUFzQixDQUFDLElBQXlCO1FBQ3RELE1BQU0sU0FBUyxHQUFHLCtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQztRQUVoRSxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ2QsT0FBTztTQUNSO1FBRUQsdUVBQXVFO1FBQ3ZFLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFO1lBQzdDLE1BQU0sbUJBQW1CLEdBQ3JCLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztpQkFDckMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUssQ0FBQyxPQUFPLEVBQUUsS0FBSyxrQkFBa0IsQ0FBQyxDQUFDO1lBRXZFLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtnQkFDeEIsSUFBSSxDQUFDLG1CQUFtQixDQUNwQixJQUFJLEVBQ0osZ0JBQWdCLFNBQVMsa0JBQWtCO29CQUN2QyxJQUFJLHFCQUFxQiw0QkFBNEI7b0JBQ3JELElBQUksa0JBQWtCLHFDQUFxQyxDQUFDLENBQUM7YUFDdEU7U0FDRjtJQUNILENBQUM7Q0FDRjtBQW5DRCxzRUFtQ0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtkZXRlcm1pbmVCYXNlVHlwZXMsIE1pZ3JhdGlvbiwgVGFyZ2V0VmVyc2lvbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL3NjaGVtYXRpY3MnO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbi8qKlxuICogTWlncmF0aW9uIHRoYXQgY2hlY2tzIGZvciBjbGFzc2VzIHRoYXQgZXh0ZW5kIEFuZ3VsYXIgTWF0ZXJpYWwgY2xhc3NlcyB3aGljaFxuICogaGF2ZSBjaGFuZ2VkIHRoZWlyIEFQSS5cbiAqL1xuZXhwb3J0IGNsYXNzIE1pc2NDbGFzc0luaGVyaXRhbmNlTWlncmF0aW9uIGV4dGVuZHMgTWlncmF0aW9uPG51bGw+IHtcblxuICAvLyBPbmx5IGVuYWJsZSB0aGlzIHJ1bGUgaWYgdGhlIG1pZ3JhdGlvbiB0YXJnZXRzIHZlcnNpb24gNi4gVGhlIHJ1bGVcbiAgLy8gY3VycmVudGx5IG9ubHkgaW5jbHVkZXMgbWlncmF0aW9ucyBmb3IgVjYgZGVwcmVjYXRpb25zLlxuICBlbmFibGVkID0gdGhpcy50YXJnZXRWZXJzaW9uID09PSBUYXJnZXRWZXJzaW9uLlY2O1xuXG4gIHZpc2l0Tm9kZShub2RlOiB0cy5Ob2RlKTogdm9pZCB7XG4gICAgaWYgKHRzLmlzQ2xhc3NEZWNsYXJhdGlvbihub2RlKSkge1xuICAgICAgdGhpcy5fdmlzaXRDbGFzc0RlY2xhcmF0aW9uKG5vZGUpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3Zpc2l0Q2xhc3NEZWNsYXJhdGlvbihub2RlOiB0cy5DbGFzc0RlY2xhcmF0aW9uKSB7XG4gICAgY29uc3QgYmFzZVR5cGVzID0gZGV0ZXJtaW5lQmFzZVR5cGVzKG5vZGUpO1xuICAgIGNvbnN0IGNsYXNzTmFtZSA9IG5vZGUubmFtZSA/IG5vZGUubmFtZS50ZXh0IDogJ3t1bmtub3duLW5hbWV9JztcblxuICAgIGlmICghYmFzZVR5cGVzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gTWlncmF0aW9uIGZvcjogaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvY29tcG9uZW50cy9wdWxsLzEwMjkzICh2NilcbiAgICBpZiAoYmFzZVR5cGVzLmluY2x1ZGVzKCdNYXRGb3JtRmllbGRDb250cm9sJykpIHtcbiAgICAgIGNvbnN0IGhhc0Zsb2F0TGFiZWxNZW1iZXIgPVxuICAgICAgICAgIG5vZGUubWVtYmVycy5maWx0ZXIobWVtYmVyID0+IG1lbWJlci5uYW1lKVxuICAgICAgICAgICAgICAuZmluZChtZW1iZXIgPT4gbWVtYmVyLm5hbWUhLmdldFRleHQoKSA9PT0gJ3Nob3VsZExhYmVsRmxvYXQnKTtcblxuICAgICAgaWYgKCFoYXNGbG9hdExhYmVsTWVtYmVyKSB7XG4gICAgICAgIHRoaXMuY3JlYXRlRmFpbHVyZUF0Tm9kZShcbiAgICAgICAgICAgIG5vZGUsXG4gICAgICAgICAgICBgRm91bmQgY2xhc3MgXCIke2NsYXNzTmFtZX1cIiB3aGljaCBleHRlbmRzIGAgK1xuICAgICAgICAgICAgICAgIGBcIiR7J01hdEZvcm1GaWVsZENvbnRyb2wnfVwiLiBUaGlzIGNsYXNzIG11c3QgZGVmaW5lIGAgK1xuICAgICAgICAgICAgICAgIGBcIiR7J3Nob3VsZExhYmVsRmxvYXQnfVwiIHdoaWNoIGlzIG5vdyBhIHJlcXVpcmVkIHByb3BlcnR5LmApO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19