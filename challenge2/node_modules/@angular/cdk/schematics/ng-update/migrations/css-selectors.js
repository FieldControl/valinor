"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CssSelectorsMigration = void 0;
const ts = require("typescript");
const migration_1 = require("../../update-tool/migration");
const literal_1 = require("../typescript/literal");
const upgrade_data_1 = require("../upgrade-data");
/**
 * Migration that walks through every string literal, template and stylesheet in
 * order to migrate outdated CSS selectors to the new selector.
 */
class CssSelectorsMigration extends migration_1.Migration {
    constructor() {
        super(...arguments);
        /** Change data that upgrades to the specified target version. */
        this.data = upgrade_data_1.getVersionUpgradeData(this, 'cssSelectors');
        // Only enable the migration rule if there is upgrade data.
        this.enabled = this.data.length !== 0;
    }
    visitNode(node) {
        if (ts.isStringLiteralLike(node)) {
            this._visitStringLiteralLike(node);
        }
    }
    visitTemplate(template) {
        this.data.forEach(data => {
            if (data.replaceIn && !data.replaceIn.html) {
                return;
            }
            literal_1.findAllSubstringIndices(template.content, data.replace)
                .map(offset => template.start + offset)
                .forEach(start => this._replaceSelector(template.filePath, start, data));
        });
    }
    visitStylesheet(stylesheet) {
        this.data.forEach(data => {
            if (data.replaceIn && !data.replaceIn.stylesheet) {
                return;
            }
            literal_1.findAllSubstringIndices(stylesheet.content, data.replace)
                .map(offset => stylesheet.start + offset)
                .forEach(start => this._replaceSelector(stylesheet.filePath, start, data));
        });
    }
    _visitStringLiteralLike(node) {
        if (node.parent && node.parent.kind !== ts.SyntaxKind.CallExpression) {
            return;
        }
        const textContent = node.getText();
        const filePath = this.fileSystem.resolve(node.getSourceFile().fileName);
        this.data.forEach(data => {
            if (data.replaceIn && !data.replaceIn.tsStringLiterals) {
                return;
            }
            literal_1.findAllSubstringIndices(textContent, data.replace)
                .map(offset => node.getStart() + offset)
                .forEach(start => this._replaceSelector(filePath, start, data));
        });
    }
    _replaceSelector(filePath, start, data) {
        this.fileSystem.edit(filePath)
            .remove(start, data.replace.length)
            .insertRight(start, data.replaceWith);
    }
}
exports.CssSelectorsMigration = CssSelectorsMigration;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3NzLXNlbGVjdG9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvc2NoZW1hdGljcy9uZy11cGRhdGUvbWlncmF0aW9ucy9jc3Mtc2VsZWN0b3JzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILGlDQUFpQztBQUdqQywyREFBc0Q7QUFFdEQsbURBQThEO0FBQzlELGtEQUFtRTtBQUVuRTs7O0dBR0c7QUFDSCxNQUFhLHFCQUFzQixTQUFRLHFCQUFzQjtJQUFqRTs7UUFDRSxpRUFBaUU7UUFDakUsU0FBSSxHQUE2QixvQ0FBcUIsQ0FBQyxJQUFJLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFFN0UsMkRBQTJEO1FBQzNELFlBQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7SUF3RG5DLENBQUM7SUF0REMsU0FBUyxDQUFDLElBQWE7UUFDckIsSUFBSSxFQUFFLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDaEMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3BDO0lBQ0gsQ0FBQztJQUVELGFBQWEsQ0FBQyxRQUEwQjtRQUN0QyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN2QixJQUFJLElBQUksQ0FBQyxTQUFTLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRTtnQkFDMUMsT0FBTzthQUNSO1lBRUQsaUNBQXVCLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDO2lCQUNsRCxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQztpQkFDdEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDL0UsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsZUFBZSxDQUFDLFVBQTRCO1FBQzFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3ZCLElBQUksSUFBSSxDQUFDLFNBQVMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFO2dCQUNoRCxPQUFPO2FBQ1I7WUFFRCxpQ0FBdUIsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUM7aUJBQ3BELEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDO2lCQUN4QyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNqRixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTyx1QkFBdUIsQ0FBQyxJQUEwQjtRQUN4RCxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxjQUFjLEVBQUU7WUFDcEUsT0FBTztTQUNSO1FBRUQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ25DLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUV4RSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN2QixJQUFJLElBQUksQ0FBQyxTQUFTLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLGdCQUFnQixFQUFFO2dCQUN0RCxPQUFPO2FBQ1I7WUFFRCxpQ0FBdUIsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQztpQkFDN0MsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLE1BQU0sQ0FBQztpQkFDdkMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN0RSxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTyxnQkFBZ0IsQ0FBQyxRQUF1QixFQUFFLEtBQWEsRUFBRSxJQUE0QjtRQUMzRixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7YUFDM0IsTUFBTSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQzthQUNsQyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUMxQyxDQUFDO0NBQ0Y7QUE3REQsc0RBNkRDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuaW1wb3J0IHtXb3Jrc3BhY2VQYXRofSBmcm9tICcuLi8uLi91cGRhdGUtdG9vbC9maWxlLXN5c3RlbSc7XG5pbXBvcnQge1Jlc29sdmVkUmVzb3VyY2V9IGZyb20gJy4uLy4uL3VwZGF0ZS10b29sL2NvbXBvbmVudC1yZXNvdXJjZS1jb2xsZWN0b3InO1xuaW1wb3J0IHtNaWdyYXRpb259IGZyb20gJy4uLy4uL3VwZGF0ZS10b29sL21pZ3JhdGlvbic7XG5pbXBvcnQge0Nzc1NlbGVjdG9yVXBncmFkZURhdGF9IGZyb20gJy4uL2RhdGEvY3NzLXNlbGVjdG9ycyc7XG5pbXBvcnQge2ZpbmRBbGxTdWJzdHJpbmdJbmRpY2VzfSBmcm9tICcuLi90eXBlc2NyaXB0L2xpdGVyYWwnO1xuaW1wb3J0IHtnZXRWZXJzaW9uVXBncmFkZURhdGEsIFVwZ3JhZGVEYXRhfSBmcm9tICcuLi91cGdyYWRlLWRhdGEnO1xuXG4vKipcbiAqIE1pZ3JhdGlvbiB0aGF0IHdhbGtzIHRocm91Z2ggZXZlcnkgc3RyaW5nIGxpdGVyYWwsIHRlbXBsYXRlIGFuZCBzdHlsZXNoZWV0IGluXG4gKiBvcmRlciB0byBtaWdyYXRlIG91dGRhdGVkIENTUyBzZWxlY3RvcnMgdG8gdGhlIG5ldyBzZWxlY3Rvci5cbiAqL1xuZXhwb3J0IGNsYXNzIENzc1NlbGVjdG9yc01pZ3JhdGlvbiBleHRlbmRzIE1pZ3JhdGlvbjxVcGdyYWRlRGF0YT4ge1xuICAvKiogQ2hhbmdlIGRhdGEgdGhhdCB1cGdyYWRlcyB0byB0aGUgc3BlY2lmaWVkIHRhcmdldCB2ZXJzaW9uLiAqL1xuICBkYXRhOiBDc3NTZWxlY3RvclVwZ3JhZGVEYXRhW10gPSBnZXRWZXJzaW9uVXBncmFkZURhdGEodGhpcywgJ2Nzc1NlbGVjdG9ycycpO1xuXG4gIC8vIE9ubHkgZW5hYmxlIHRoZSBtaWdyYXRpb24gcnVsZSBpZiB0aGVyZSBpcyB1cGdyYWRlIGRhdGEuXG4gIGVuYWJsZWQgPSB0aGlzLmRhdGEubGVuZ3RoICE9PSAwO1xuXG4gIHZpc2l0Tm9kZShub2RlOiB0cy5Ob2RlKTogdm9pZCB7XG4gICAgaWYgKHRzLmlzU3RyaW5nTGl0ZXJhbExpa2Uobm9kZSkpIHtcbiAgICAgIHRoaXMuX3Zpc2l0U3RyaW5nTGl0ZXJhbExpa2Uobm9kZSk7XG4gICAgfVxuICB9XG5cbiAgdmlzaXRUZW1wbGF0ZSh0ZW1wbGF0ZTogUmVzb2x2ZWRSZXNvdXJjZSk6IHZvaWQge1xuICAgIHRoaXMuZGF0YS5mb3JFYWNoKGRhdGEgPT4ge1xuICAgICAgaWYgKGRhdGEucmVwbGFjZUluICYmICFkYXRhLnJlcGxhY2VJbi5odG1sKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgZmluZEFsbFN1YnN0cmluZ0luZGljZXModGVtcGxhdGUuY29udGVudCwgZGF0YS5yZXBsYWNlKVxuICAgICAgICAgIC5tYXAob2Zmc2V0ID0+IHRlbXBsYXRlLnN0YXJ0ICsgb2Zmc2V0KVxuICAgICAgICAgIC5mb3JFYWNoKHN0YXJ0ID0+IHRoaXMuX3JlcGxhY2VTZWxlY3Rvcih0ZW1wbGF0ZS5maWxlUGF0aCwgc3RhcnQsIGRhdGEpKTtcbiAgICB9KTtcbiAgfVxuXG4gIHZpc2l0U3R5bGVzaGVldChzdHlsZXNoZWV0OiBSZXNvbHZlZFJlc291cmNlKTogdm9pZCB7XG4gICAgdGhpcy5kYXRhLmZvckVhY2goZGF0YSA9PiB7XG4gICAgICBpZiAoZGF0YS5yZXBsYWNlSW4gJiYgIWRhdGEucmVwbGFjZUluLnN0eWxlc2hlZXQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBmaW5kQWxsU3Vic3RyaW5nSW5kaWNlcyhzdHlsZXNoZWV0LmNvbnRlbnQsIGRhdGEucmVwbGFjZSlcbiAgICAgICAgICAubWFwKG9mZnNldCA9PiBzdHlsZXNoZWV0LnN0YXJ0ICsgb2Zmc2V0KVxuICAgICAgICAgIC5mb3JFYWNoKHN0YXJ0ID0+IHRoaXMuX3JlcGxhY2VTZWxlY3RvcihzdHlsZXNoZWV0LmZpbGVQYXRoLCBzdGFydCwgZGF0YSkpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfdmlzaXRTdHJpbmdMaXRlcmFsTGlrZShub2RlOiB0cy5TdHJpbmdMaXRlcmFsTGlrZSkge1xuICAgIGlmIChub2RlLnBhcmVudCAmJiBub2RlLnBhcmVudC5raW5kICE9PSB0cy5TeW50YXhLaW5kLkNhbGxFeHByZXNzaW9uKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgdGV4dENvbnRlbnQgPSBub2RlLmdldFRleHQoKTtcbiAgICBjb25zdCBmaWxlUGF0aCA9IHRoaXMuZmlsZVN5c3RlbS5yZXNvbHZlKG5vZGUuZ2V0U291cmNlRmlsZSgpLmZpbGVOYW1lKTtcblxuICAgIHRoaXMuZGF0YS5mb3JFYWNoKGRhdGEgPT4ge1xuICAgICAgaWYgKGRhdGEucmVwbGFjZUluICYmICFkYXRhLnJlcGxhY2VJbi50c1N0cmluZ0xpdGVyYWxzKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgZmluZEFsbFN1YnN0cmluZ0luZGljZXModGV4dENvbnRlbnQsIGRhdGEucmVwbGFjZSlcbiAgICAgICAgICAubWFwKG9mZnNldCA9PiBub2RlLmdldFN0YXJ0KCkgKyBvZmZzZXQpXG4gICAgICAgICAgLmZvckVhY2goc3RhcnQgPT4gdGhpcy5fcmVwbGFjZVNlbGVjdG9yKGZpbGVQYXRoLCBzdGFydCwgZGF0YSkpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfcmVwbGFjZVNlbGVjdG9yKGZpbGVQYXRoOiBXb3Jrc3BhY2VQYXRoLCBzdGFydDogbnVtYmVyLCBkYXRhOiBDc3NTZWxlY3RvclVwZ3JhZGVEYXRhKSB7XG4gICAgdGhpcy5maWxlU3lzdGVtLmVkaXQoZmlsZVBhdGgpXG4gICAgICAucmVtb3ZlKHN0YXJ0LCBkYXRhLnJlcGxhY2UubGVuZ3RoKVxuICAgICAgLmluc2VydFJpZ2h0KHN0YXJ0LCBkYXRhLnJlcGxhY2VXaXRoKTtcbiAgfVxufVxuIl19