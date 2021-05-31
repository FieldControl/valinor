"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyNamesMigration = void 0;
const ts = require("typescript");
const migration_1 = require("../../update-tool/migration");
const upgrade_data_1 = require("../upgrade-data");
/**
 * Migration that walks through every property access expression and updates
 * accessed properties that have been updated to a new name.
 */
class PropertyNamesMigration extends migration_1.Migration {
    constructor() {
        super(...arguments);
        /** Change data that upgrades to the specified target version. */
        this.data = upgrade_data_1.getVersionUpgradeData(this, 'propertyNames');
        // Only enable the migration rule if there is upgrade data.
        this.enabled = this.data.length !== 0;
    }
    visitNode(node) {
        if (ts.isPropertyAccessExpression(node)) {
            this._visitPropertyAccessExpression(node);
        }
    }
    _visitPropertyAccessExpression(node) {
        const hostType = this.typeChecker.getTypeAtLocation(node.expression);
        const typeNames = [];
        if (hostType) {
            if (hostType.isIntersection()) {
                hostType.types.forEach(type => {
                    if (type.symbol) {
                        typeNames.push(type.symbol.getName());
                    }
                });
            }
            else if (hostType.symbol) {
                typeNames.push(hostType.symbol.getName());
            }
        }
        this.data.forEach(data => {
            if (node.name.text !== data.replace) {
                return;
            }
            if (!data.limitedTo || typeNames.some(type => data.limitedTo.classes.includes(type))) {
                this.fileSystem.edit(this.fileSystem.resolve(node.getSourceFile().fileName))
                    .remove(node.name.getStart(), node.name.getWidth())
                    .insertRight(node.name.getStart(), data.replaceWith);
            }
        });
    }
}
exports.PropertyNamesMigration = PropertyNamesMigration;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvcGVydHktbmFtZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3NjaGVtYXRpY3MvbmctdXBkYXRlL21pZ3JhdGlvbnMvcHJvcGVydHktbmFtZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsaUNBQWlDO0FBQ2pDLDJEQUFzRDtBQUd0RCxrREFBbUU7QUFFbkU7OztHQUdHO0FBQ0gsTUFBYSxzQkFBdUIsU0FBUSxxQkFBc0I7SUFBbEU7O1FBQ0UsaUVBQWlFO1FBQ2pFLFNBQUksR0FBOEIsb0NBQXFCLENBQUMsSUFBSSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBRS9FLDJEQUEyRDtRQUMzRCxZQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO0lBb0NuQyxDQUFDO0lBbENDLFNBQVMsQ0FBQyxJQUFhO1FBQ3JCLElBQUksRUFBRSxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3ZDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUMzQztJQUNILENBQUM7SUFFTyw4QkFBOEIsQ0FBQyxJQUFpQztRQUN0RSxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNyRSxNQUFNLFNBQVMsR0FBYSxFQUFFLENBQUM7UUFFL0IsSUFBSSxRQUFRLEVBQUU7WUFDWixJQUFJLFFBQVEsQ0FBQyxjQUFjLEVBQUUsRUFBRTtnQkFDNUIsUUFBUSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQzVCLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTt3QkFDZixTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztxQkFDdkM7Z0JBQ0gsQ0FBQyxDQUFDLENBQUM7YUFDTDtpQkFBTSxJQUFJLFFBQVEsQ0FBQyxNQUFNLEVBQUU7Z0JBQzFCLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO2FBQzNDO1NBQ0Y7UUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN2QixJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ25DLE9BQU87YUFDUjtZQUVELElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRTtnQkFDcEYsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDO3FCQUN6RSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO3FCQUNsRCxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7YUFDeEQ7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQXpDRCx3REF5Q0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5pbXBvcnQge01pZ3JhdGlvbn0gZnJvbSAnLi4vLi4vdXBkYXRlLXRvb2wvbWlncmF0aW9uJztcblxuaW1wb3J0IHtQcm9wZXJ0eU5hbWVVcGdyYWRlRGF0YX0gZnJvbSAnLi4vZGF0YSc7XG5pbXBvcnQge2dldFZlcnNpb25VcGdyYWRlRGF0YSwgVXBncmFkZURhdGF9IGZyb20gJy4uL3VwZ3JhZGUtZGF0YSc7XG5cbi8qKlxuICogTWlncmF0aW9uIHRoYXQgd2Fsa3MgdGhyb3VnaCBldmVyeSBwcm9wZXJ0eSBhY2Nlc3MgZXhwcmVzc2lvbiBhbmQgdXBkYXRlc1xuICogYWNjZXNzZWQgcHJvcGVydGllcyB0aGF0IGhhdmUgYmVlbiB1cGRhdGVkIHRvIGEgbmV3IG5hbWUuXG4gKi9cbmV4cG9ydCBjbGFzcyBQcm9wZXJ0eU5hbWVzTWlncmF0aW9uIGV4dGVuZHMgTWlncmF0aW9uPFVwZ3JhZGVEYXRhPiB7XG4gIC8qKiBDaGFuZ2UgZGF0YSB0aGF0IHVwZ3JhZGVzIHRvIHRoZSBzcGVjaWZpZWQgdGFyZ2V0IHZlcnNpb24uICovXG4gIGRhdGE6IFByb3BlcnR5TmFtZVVwZ3JhZGVEYXRhW10gPSBnZXRWZXJzaW9uVXBncmFkZURhdGEodGhpcywgJ3Byb3BlcnR5TmFtZXMnKTtcblxuICAvLyBPbmx5IGVuYWJsZSB0aGUgbWlncmF0aW9uIHJ1bGUgaWYgdGhlcmUgaXMgdXBncmFkZSBkYXRhLlxuICBlbmFibGVkID0gdGhpcy5kYXRhLmxlbmd0aCAhPT0gMDtcblxuICB2aXNpdE5vZGUobm9kZTogdHMuTm9kZSk6IHZvaWQge1xuICAgIGlmICh0cy5pc1Byb3BlcnR5QWNjZXNzRXhwcmVzc2lvbihub2RlKSkge1xuICAgICAgdGhpcy5fdmlzaXRQcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24obm9kZSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfdmlzaXRQcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24obm9kZTogdHMuUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uKSB7XG4gICAgY29uc3QgaG9zdFR5cGUgPSB0aGlzLnR5cGVDaGVja2VyLmdldFR5cGVBdExvY2F0aW9uKG5vZGUuZXhwcmVzc2lvbik7XG4gICAgY29uc3QgdHlwZU5hbWVzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgaWYgKGhvc3RUeXBlKSB7XG4gICAgICBpZiAoaG9zdFR5cGUuaXNJbnRlcnNlY3Rpb24oKSkge1xuICAgICAgICAgaG9zdFR5cGUudHlwZXMuZm9yRWFjaCh0eXBlID0+IHtcbiAgICAgICAgICAgaWYgKHR5cGUuc3ltYm9sKSB7XG4gICAgICAgICAgICAgdHlwZU5hbWVzLnB1c2godHlwZS5zeW1ib2wuZ2V0TmFtZSgpKTtcbiAgICAgICAgICAgfVxuICAgICAgICAgfSk7XG4gICAgICB9IGVsc2UgaWYgKGhvc3RUeXBlLnN5bWJvbCkge1xuICAgICAgICB0eXBlTmFtZXMucHVzaChob3N0VHlwZS5zeW1ib2wuZ2V0TmFtZSgpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmRhdGEuZm9yRWFjaChkYXRhID0+IHtcbiAgICAgIGlmIChub2RlLm5hbWUudGV4dCAhPT0gZGF0YS5yZXBsYWNlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKCFkYXRhLmxpbWl0ZWRUbyB8fCB0eXBlTmFtZXMuc29tZSh0eXBlID0+IGRhdGEubGltaXRlZFRvLmNsYXNzZXMuaW5jbHVkZXModHlwZSkpKSB7XG4gICAgICAgIHRoaXMuZmlsZVN5c3RlbS5lZGl0KHRoaXMuZmlsZVN5c3RlbS5yZXNvbHZlKG5vZGUuZ2V0U291cmNlRmlsZSgpLmZpbGVOYW1lKSlcbiAgICAgICAgICAucmVtb3ZlKG5vZGUubmFtZS5nZXRTdGFydCgpLCBub2RlLm5hbWUuZ2V0V2lkdGgoKSlcbiAgICAgICAgICAuaW5zZXJ0UmlnaHQobm9kZS5uYW1lLmdldFN0YXJ0KCksIGRhdGEucmVwbGFjZVdpdGgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG4iXX0=