"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RippleSpeedFactorMigration = void 0;
const schematics_1 = require("@angular/cdk/schematics");
const ts = require("typescript");
const ripple_speed_factor_1 = require("./ripple-speed-factor");
/** Regular expression that matches [matRippleSpeedFactor]="$NUMBER" in templates. */
const speedFactorNumberRegex = /\[matRippleSpeedFactor]="(\d+(?:\.\d+)?)"/g;
/** Regular expression that matches [matRippleSpeedFactor]="$NOT_A_NUMBER" in templates. */
const speedFactorNotParseable = /\[matRippleSpeedFactor]="(?!\d+(?:\.\d+)?")(.*)"/g;
/**
 * Note that will be added whenever a speed factor expression has been converted to calculate
 * the according duration. This note should encourage people to clean up their code by switching
 * away from the speed factors to explicit durations.
 */
const removeNote = `TODO: Cleanup duration calculation.`;
/**
 * Migration that walks through every property assignment and switches the global `baseSpeedFactor`
 * ripple option to the new global animation config. Also updates every class member assignment
 * that refers to MatRipple#speedFactor.
 */
class RippleSpeedFactorMigration extends schematics_1.Migration {
    constructor() {
        super(...arguments);
        // Only enable this rule if the migration targets version 7 as the ripple
        // speed factor has been removed in that version.
        this.enabled = this.targetVersion === schematics_1.TargetVersion.V7;
    }
    visitNode(node) {
        if (ts.isBinaryExpression(node)) {
            this._visitBinaryExpression(node);
        }
        else if (ts.isPropertyAssignment(node)) {
            this._visitPropertyAssignment(node);
        }
    }
    visitTemplate(template) {
        let match;
        while ((match = speedFactorNumberRegex.exec(template.content)) !== null) {
            const newEnterDuration = ripple_speed_factor_1.convertSpeedFactorToDuration(parseFloat(match[1]));
            this._replaceText(template.filePath, template.start + match.index, match[0].length, `[matRippleAnimation]="{enterDuration: ${newEnterDuration}}"`);
        }
        while ((match = speedFactorNotParseable.exec(template.content)) !== null) {
            const newDurationExpression = ripple_speed_factor_1.createSpeedFactorConvertExpression(match[1]);
            this._replaceText(template.filePath, template.start + match.index, match[0].length, `[matRippleAnimation]="{enterDuration: (${newDurationExpression})}"`);
        }
    }
    /** Switches binary expressions (e.g. myRipple.speedFactor = 0.5) to the new animation config. */
    _visitBinaryExpression(expression) {
        if (!ts.isPropertyAccessExpression(expression.left)) {
            return;
        }
        // Left side expression consists of target object and property name (e.g. myInstance.val)
        const leftExpression = expression.left;
        const targetTypeNode = this.typeChecker.getTypeAtLocation(leftExpression.expression);
        if (!targetTypeNode.symbol) {
            return;
        }
        const targetTypeName = targetTypeNode.symbol.getName();
        const propertyName = leftExpression.name.getText();
        const filePath = this.fileSystem.resolve(leftExpression.getSourceFile().fileName);
        if (targetTypeName === 'MatRipple' && propertyName === 'speedFactor') {
            if (ts.isNumericLiteral(expression.right)) {
                const numericValue = parseFloat(expression.right.text);
                const newEnterDurationValue = ripple_speed_factor_1.convertSpeedFactorToDuration(numericValue);
                // Replace the `speedFactor` property name with `animation`.
                this._replaceText(filePath, leftExpression.name.getStart(), leftExpression.name.getWidth(), 'animation');
                // Replace the value assignment with the new animation config.
                this._replaceText(filePath, expression.right.getStart(), expression.right.getWidth(), `{enterDuration: ${newEnterDurationValue}}`);
            }
            else {
                // Handle the right expression differently if the previous speed factor value can't
                // be resolved statically. In that case, we just create a TypeScript expression that
                // calculates the explicit duration based on the non-static speed factor expression.
                const newExpression = ripple_speed_factor_1.createSpeedFactorConvertExpression(expression.right.getText());
                // Replace the `speedFactor` property name with `animation`.
                this._replaceText(filePath, leftExpression.name.getStart(), leftExpression.name.getWidth(), 'animation');
                // Replace the value assignment with the new animation config and remove TODO.
                this._replaceText(filePath, expression.right.getStart(), expression.right.getWidth(), `/** ${removeNote} */ {enterDuration: ${newExpression}}`);
            }
        }
    }
    /**
     * Switches the global option `baseSpeedFactor` to the new animation config. For this
     * we assume that the `baseSpeedFactor` is not used in combination with individual
     * speed factors.
     */
    _visitPropertyAssignment(assignment) {
        // For switching the `baseSpeedFactor` global option we expect the property assignment
        // to be inside of a normal object literal. Custom ripple global options cannot be
        // witched automatically.
        if (!ts.isObjectLiteralExpression(assignment.parent)) {
            return;
        }
        // The assignment consists of a name (key) and initializer (value).
        if (assignment.name.getText() !== 'baseSpeedFactor') {
            return;
        }
        // We could technically lazily check for the MAT_RIPPLE_GLOBAL_OPTIONS injection token to
        // be present, but it's not right to assume that everyone sets the ripple global options
        // immediately in the provider object (e.g. it can happen that someone just imports the
        // config from a separate file).
        const { initializer, name } = assignment;
        const filePath = this.fileSystem.resolve(assignment.getSourceFile().fileName);
        if (ts.isNumericLiteral(initializer)) {
            const numericValue = parseFloat(initializer.text);
            const newEnterDurationValue = ripple_speed_factor_1.convertSpeedFactorToDuration(numericValue);
            // Replace the `baseSpeedFactor` property name with `animation`.
            this._replaceText(filePath, name.getStart(), name.getWidth(), 'animation');
            // Replace the value assignment initializer with the new animation config.
            this._replaceText(filePath, initializer.getStart(), initializer.getWidth(), `{enterDuration: ${newEnterDurationValue}}`);
        }
        else {
            // Handle the right expression differently if the previous speed factor value can't
            // be resolved statically. In that case, we just create a TypeScript expression that
            // calculates the explicit duration based on the non-static speed factor expression.
            const newExpression = ripple_speed_factor_1.createSpeedFactorConvertExpression(initializer.getText());
            // Replace the `baseSpeedFactor` property name with `animation`.
            this._replaceText(filePath, name.getStart(), name.getWidth(), 'animation');
            // Replace the value assignment with the new animation config and remove TODO.
            this._replaceText(filePath, initializer.getStart(), initializer.getWidth(), `/** ${removeNote} */ {enterDuration: ${newExpression}}`);
        }
    }
    _replaceText(filePath, start, width, newText) {
        const recorder = this.fileSystem.edit(filePath);
        recorder.remove(start, width);
        recorder.insertRight(start, newText);
    }
}
exports.RippleSpeedFactorMigration = RippleSpeedFactorMigration;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmlwcGxlLXNwZWVkLWZhY3Rvci1taWdyYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvc2NoZW1hdGljcy9uZy11cGRhdGUvbWlncmF0aW9ucy9taXNjLXJpcHBsZXMtdjcvcmlwcGxlLXNwZWVkLWZhY3Rvci1taWdyYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsd0RBS2lDO0FBQ2pDLGlDQUFpQztBQUNqQywrREFHK0I7QUFFL0IscUZBQXFGO0FBQ3JGLE1BQU0sc0JBQXNCLEdBQUcsNENBQTRDLENBQUM7QUFFNUUsMkZBQTJGO0FBQzNGLE1BQU0sdUJBQXVCLEdBQUcsbURBQW1ELENBQUM7QUFFcEY7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSxHQUFHLHFDQUFxQyxDQUFDO0FBRXpEOzs7O0dBSUc7QUFDSCxNQUFhLDBCQUEyQixTQUFRLHNCQUFlO0lBQS9EOztRQUVFLHlFQUF5RTtRQUN6RSxpREFBaUQ7UUFDakQsWUFBTyxHQUFHLElBQUksQ0FBQyxhQUFhLEtBQUssMEJBQWEsQ0FBQyxFQUFFLENBQUM7SUF1SXBELENBQUM7SUFySUMsU0FBUyxDQUFDLElBQWE7UUFDckIsSUFBSSxFQUFFLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDL0IsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ25DO2FBQU0sSUFBSSxFQUFFLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDeEMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3JDO0lBQ0gsQ0FBQztJQUVELGFBQWEsQ0FBQyxRQUEwQjtRQUN0QyxJQUFJLEtBQTRCLENBQUM7UUFFakMsT0FBTyxDQUFDLEtBQUssR0FBRyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8s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SUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQzNFLDBFQUEwRTtZQUMxRSxJQUFJLENBQUMsWUFBWSxDQUNiLFFBQVEsRUFBRSxXQUFXLENBQUMsUUFBUSxFQUFFLEVBQUUsV0FBVyxDQUFDLFFBQVEsRUFBRSxFQUN4RCxtQkFBbUIscUJBQXFCLEdBQUcsQ0FBQyxDQUFDO1NBQ2xEO2FBQU07WUFDTCxtRkFBbUY7WUFDbkYsb0ZBQW9GO1lBQ3BGLG9GQUFvRjtZQUNwRixNQUFNLGFBQWEsR0FBRyx3REFBa0MsQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUVoRixnRUFBZ0U7WUFDaEUsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUUzRSw4RUFBOEU7WUFDOUUsSUFBSSxDQUFDLFlBQVksQ0FDYixRQUFRLEVBQUUsV0FBVyxDQUFDLFFBQVEsRUFBRSxFQUFFLFdBQVcsQ0FBQyxRQUFRLEVBQUUsRUFDeEQsT0FBTyxVQUFVLHVCQUF1QixhQUFhLEdBQUcsQ0FBQyxDQUFDO1NBQy9EO0lBQ0gsQ0FBQztJQUVPLFlBQVksQ0FBQyxRQUF1QixFQUFFLEtBQWEsRUFBRSxLQUFhLEVBQUUsT0FBZTtRQUN6RixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNoRCxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM5QixRQUFRLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztJQUN2QyxDQUFDO0NBQ0Y7QUEzSUQsZ0VBMklDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIE1pZ3JhdGlvbixcbiAgUmVzb2x2ZWRSZXNvdXJjZSxcbiAgVGFyZ2V0VmVyc2lvbixcbiAgV29ya3NwYWNlUGF0aFxufSBmcm9tICdAYW5ndWxhci9jZGsvc2NoZW1hdGljcyc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcbmltcG9ydCB7XG4gIGNvbnZlcnRTcGVlZEZhY3RvclRvRHVyYXRpb24sXG4gIGNyZWF0ZVNwZWVkRmFjdG9yQ29udmVydEV4cHJlc3Npb24sXG59IGZyb20gJy4vcmlwcGxlLXNwZWVkLWZhY3Rvcic7XG5cbi8qKiBSZWd1bGFyIGV4cHJlc3Npb24gdGhhdCBtYXRjaGVzIFttYXRSaXBwbGVTcGVlZEZhY3Rvcl09XCIkTlVNQkVSXCIgaW4gdGVtcGxhdGVzLiAqL1xuY29uc3Qgc3BlZWRGYWN0b3JOdW1iZXJSZWdleCA9IC9cXFttYXRSaXBwbGVTcGVlZEZhY3Rvcl09XCIoXFxkKyg/OlxcLlxcZCspPylcIi9nO1xuXG4vKiogUmVndWxhciBleHByZXNzaW9uIHRoYXQgbWF0Y2hlcyBbbWF0UmlwcGxlU3BlZWRGYWN0b3JdPVwiJE5PVF9BX05VTUJFUlwiIGluIHRlbXBsYXRlcy4gKi9cbmNvbnN0IHNwZWVkRmFjdG9yTm90UGFyc2VhYmxlID0gL1xcW21hdFJpcHBsZVNwZWVkRmFjdG9yXT1cIig/IVxcZCsoPzpcXC5cXGQrKT9cIikoLiopXCIvZztcblxuLyoqXG4gKiBOb3RlIHRoYXQgd2lsbCBiZSBhZGRlZCB3aGVuZXZlciBhIHNwZWVkIGZhY3RvciBleHByZXNzaW9uIGhhcyBiZWVuIGNvbnZlcnRlZCB0byBjYWxjdWxhdGVcbiAqIHRoZSBhY2NvcmRpbmcgZHVyYXRpb24uIFRoaXMgbm90ZSBzaG91bGQgZW5jb3VyYWdlIHBlb3BsZSB0byBjbGVhbiB1cCB0aGVpciBjb2RlIGJ5IHN3aXRjaGluZ1xuICogYXdheSBmcm9tIHRoZSBzcGVlZCBmYWN0b3JzIHRvIGV4cGxpY2l0IGR1cmF0aW9ucy5cbiAqL1xuY29uc3QgcmVtb3ZlTm90ZSA9IGBUT0RPOiBDbGVhbnVwIGR1cmF0aW9uIGNhbGN1bGF0aW9uLmA7XG5cbi8qKlxuICogTWlncmF0aW9uIHRoYXQgd2Fsa3MgdGhyb3VnaCBldmVyeSBwcm9wZXJ0eSBhc3NpZ25tZW50IGFuZCBzd2l0Y2hlcyB0aGUgZ2xvYmFsIGBiYXNlU3BlZWRGYWN0b3JgXG4gKiByaXBwbGUgb3B0aW9uIHRvIHRoZSBuZXcgZ2xvYmFsIGFuaW1hdGlvbiBjb25maWcuIEFsc28gdXBkYXRlcyBldmVyeSBjbGFzcyBtZW1iZXIgYXNzaWdubWVudFxuICogdGhhdCByZWZlcnMgdG8gTWF0UmlwcGxlI3NwZWVkRmFjdG9yLlxuICovXG5leHBvcnQgY2xhc3MgUmlwcGxlU3BlZWRGYWN0b3JNaWdyYXRpb24gZXh0ZW5kcyBNaWdyYXRpb248bnVsbD4ge1xuXG4gIC8vIE9ubHkgZW5hYmxlIHRoaXMgcnVsZSBpZiB0aGUgbWlncmF0aW9uIHRhcmdldHMgdmVyc2lvbiA3IGFzIHRoZSByaXBwbGVcbiAgLy8gc3BlZWQgZmFjdG9yIGhhcyBiZWVuIHJlbW92ZWQgaW4gdGhhdCB2ZXJzaW9uLlxuICBlbmFibGVkID0gdGhpcy50YXJnZXRWZXJzaW9uID09PSBUYXJnZXRWZXJzaW9uLlY3O1xuXG4gIHZpc2l0Tm9kZShub2RlOiB0cy5Ob2RlKTogdm9pZCB7XG4gICAgaWYgKHRzLmlzQmluYXJ5RXhwcmVzc2lvbihub2RlKSkge1xuICAgICAgdGhpcy5fdmlzaXRCaW5hcnlFeHByZXNzaW9uKG5vZGUpO1xuICAgIH0gZWxzZSBpZiAodHMuaXNQcm9wZXJ0eUFzc2lnbm1lbnQobm9kZSkpIHtcbiAgICAgIHRoaXMuX3Zpc2l0UHJvcGVydHlBc3NpZ25tZW50KG5vZGUpO1xuICAgIH1cbiAgfVxuXG4gIHZpc2l0VGVtcGxhdGUodGVtcGxhdGU6IFJlc29sdmVkUmVzb3VyY2UpOiB2b2lkIHtcbiAgICBsZXQgbWF0Y2g6IFJlZ0V4cE1hdGNoQXJyYXl8bnVsbDtcblxuICAgIHdoaWxlICgobWF0Y2ggPSBzcGVlZEZhY3Rvck51bWJlclJlZ2V4LmV4ZWModGVtcGxhdGUuY29udGVudCkpICE9PSBudWxsKSB7XG4gICAgICBjb25zdCBuZXdFbnRlckR1cmF0aW9uID0gY29udmVydFNwZWVkRmFjdG9yVG9EdXJhdGlvbihwYXJzZUZsb2F0KG1hdGNoWzFdKSk7XG5cbiAgICAgIHRoaXMuX3JlcGxhY2VUZXh0KFxuICAgICAgICAgIHRlbXBsYXRlLmZpbGVQYXRoLCB0ZW1wbGF0ZS5zdGFydCArIG1hdGNoLmluZGV4ISwgbWF0Y2hbMF0ubGVuZ3RoLFxuICAgICAgICAgIGBbbWF0UmlwcGxlQW5pbWF0aW9uXT1cIntlbnRlckR1cmF0aW9uOiAke25ld0VudGVyRHVyYXRpb259fVwiYCk7XG4gICAgfVxuXG4gICAgd2hpbGUgKChtYXRjaCA9IHNwZWVkRmFjdG9yTm90UGFyc2VhYmxlLmV4ZWModGVtcGxhdGUuY29udGVudCkpICE9PSBudWxsKSB7XG4gICAgICBjb25zdCBuZXdEdXJhdGlvbkV4cHJlc3Npb24gPSBjcmVhdGVTcGVlZEZhY3RvckNvbnZlcnRFeHByZXNzaW9uKG1hdGNoWzFdKTtcbiAgICAgIHRoaXMuX3JlcGxhY2VUZXh0KFxuICAgICAgICAgIHRlbXBsYXRlLmZpbGVQYXRoLCB0ZW1wbGF0ZS5zdGFydCArIG1hdGNoLmluZGV4ISwgbWF0Y2hbMF0ubGVuZ3RoLFxuICAgICAgICAgIGBbbWF0UmlwcGxlQW5pbWF0aW9uXT1cIntlbnRlckR1cmF0aW9uOiAoJHtuZXdEdXJhdGlvbkV4cHJlc3Npb259KX1cImApO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBTd2l0Y2hlcyBiaW5hcnkgZXhwcmVzc2lvbnMgKGUuZy4gbXlSaXBwbGUuc3BlZWRGYWN0b3IgPSAwLjUpIHRvIHRoZSBuZXcgYW5pbWF0aW9uIGNvbmZpZy4gKi9cbiAgcHJpdmF0ZSBfdmlzaXRCaW5hcnlFeHByZXNzaW9uKGV4cHJlc3Npb246IHRzLkJpbmFyeUV4cHJlc3Npb24pIHtcbiAgICBpZiAoIXRzLmlzUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uKGV4cHJlc3Npb24ubGVmdCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBMZWZ0IHNpZGUgZXhwcmVzc2lvbiBjb25zaXN0cyBvZiB0YXJnZXQgb2JqZWN0IGFuZCBwcm9wZXJ0eSBuYW1lIChlLmcuIG15SW5zdGFuY2UudmFsKVxuICAgIGNvbnN0IGxlZnRFeHByZXNzaW9uID0gZXhwcmVzc2lvbi5sZWZ0IGFzIHRzLlByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbjtcbiAgICBjb25zdCB0YXJnZXRUeXBlTm9kZSA9IHRoaXMudHlwZUNoZWNrZXIuZ2V0VHlwZUF0TG9jYXRpb24obGVmdEV4cHJlc3Npb24uZXhwcmVzc2lvbik7XG5cbiAgICBpZiAoIXRhcmdldFR5cGVOb2RlLnN5bWJvbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHRhcmdldFR5cGVOYW1lID0gdGFyZ2V0VHlwZU5vZGUuc3ltYm9sLmdldE5hbWUoKTtcbiAgICBjb25zdCBwcm9wZXJ0eU5hbWUgPSBsZWZ0RXhwcmVzc2lvbi5uYW1lLmdldFRleHQoKTtcbiAgICBjb25zdCBmaWxlUGF0aCA9IHRoaXMuZmlsZVN5c3RlbS5yZXNvbHZlKGxlZnRFeHByZXNzaW9uLmdldFNvdXJjZUZpbGUoKS5maWxlTmFtZSk7XG5cbiAgICBpZiAodGFyZ2V0VHlwZU5hbWUgPT09ICdNYXRSaXBwbGUnICYmIHByb3BlcnR5TmFtZSA9PT0gJ3NwZWVkRmFjdG9yJykge1xuICAgICAgaWYgKHRzLmlzTnVtZXJpY0xpdGVyYWwoZXhwcmVzc2lvbi5yaWdodCkpIHtcbiAgICAgICAgY29uc3QgbnVtZXJpY1ZhbHVlID0gcGFyc2VGbG9hdChleHByZXNzaW9uLnJpZ2h0LnRleHQpO1xuICAgICAgICBjb25zdCBuZXdFbnRlckR1cmF0aW9uVmFsdWUgPSBjb252ZXJ0U3BlZWRGYWN0b3JUb0R1cmF0aW9uKG51bWVyaWNWYWx1ZSk7XG5cbiAgICAgICAgLy8gUmVwbGFjZSB0aGUgYHNwZWVkRmFjdG9yYCBwcm9wZXJ0eSBuYW1lIHdpdGggYGFuaW1hdGlvbmAuXG4gICAgICAgIHRoaXMuX3JlcGxhY2VUZXh0KFxuICAgICAgICAgICAgZmlsZVBhdGgsIGxlZnRFeHByZXNzaW9uLm5hbWUuZ2V0U3RhcnQoKSwgbGVmdEV4cHJlc3Npb24ubmFtZS5nZXRXaWR0aCgpLCAnYW5pbWF0aW9uJyk7XG5cbiAgICAgICAgLy8gUmVwbGFjZSB0aGUgdmFsdWUgYXNzaWdubWVudCB3aXRoIHRoZSBuZXcgYW5pbWF0aW9uIGNvbmZpZy5cbiAgICAgICAgdGhpcy5fcmVwbGFjZVRleHQoXG4gICAgICAgICAgICBmaWxlUGF0aCwgZXhwcmVzc2lvbi5yaWdodC5nZXRTdGFydCgpLCBleHByZXNzaW9uLnJpZ2h0LmdldFdpZHRoKCksXG4gICAgICAgICAgICBge2VudGVyRHVyYXRpb246ICR7bmV3RW50ZXJEdXJhdGlvblZhbHVlfX1gKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEhhbmRsZSB0aGUgcmlnaHQgZXhwcmVzc2lvbiBkaWZmZXJlbnRseSBpZiB0aGUgcHJldmlvdXMgc3BlZWQgZmFjdG9yIHZhbHVlIGNhbid0XG4gICAgICAgIC8vIGJlIHJlc29sdmVkIHN0YXRpY2FsbHkuIEluIHRoYXQgY2FzZSwgd2UganVzdCBjcmVhdGUgYSBUeXBlU2NyaXB0IGV4cHJlc3Npb24gdGhhdFxuICAgICAgICAvLyBjYWxjdWxhdGVzIHRoZSBleHBsaWNpdCBkdXJhdGlvbiBiYXNlZCBvbiB0aGUgbm9uLXN0YXRpYyBzcGVlZCBmYWN0b3IgZXhwcmVzc2lvbi5cbiAgICAgICAgY29uc3QgbmV3RXhwcmVzc2lvbiA9IGNyZWF0ZVNwZWVkRmFjdG9yQ29udmVydEV4cHJlc3Npb24oZXhwcmVzc2lvbi5yaWdodC5nZXRUZXh0KCkpO1xuXG4gICAgICAgIC8vIFJlcGxhY2UgdGhlIGBzcGVlZEZhY3RvcmAgcHJvcGVydHkgbmFtZSB3aXRoIGBhbmltYXRpb25gLlxuICAgICAgICB0aGlzLl9yZXBsYWNlVGV4dChcbiAgICAgICAgICAgIGZpbGVQYXRoLCBsZWZ0RXhwcmVzc2lvbi5uYW1lLmdldFN0YXJ0KCksIGxlZnRFeHByZXNzaW9uLm5hbWUuZ2V0V2lkdGgoKSwgJ2FuaW1hdGlvbicpO1xuXG4gICAgICAgIC8vIFJlcGxhY2UgdGhlIHZhbHVlIGFzc2lnbm1lbnQgd2l0aCB0aGUgbmV3IGFuaW1hdGlvbiBjb25maWcgYW5kIHJlbW92ZSBUT0RPLlxuICAgICAgICB0aGlzLl9yZXBsYWNlVGV4dChcbiAgICAgICAgICAgIGZpbGVQYXRoLCBleHByZXNzaW9uLnJpZ2h0LmdldFN0YXJ0KCksIGV4cHJlc3Npb24ucmlnaHQuZ2V0V2lkdGgoKSxcbiAgICAgICAgICAgIGAvKiogJHtyZW1vdmVOb3RlfSAqLyB7ZW50ZXJEdXJhdGlvbjogJHtuZXdFeHByZXNzaW9ufX1gKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU3dpdGNoZXMgdGhlIGdsb2JhbCBvcHRpb24gYGJhc2VTcGVlZEZhY3RvcmAgdG8gdGhlIG5ldyBhbmltYXRpb24gY29uZmlnLiBGb3IgdGhpc1xuICAgKiB3ZSBhc3N1bWUgdGhhdCB0aGUgYGJhc2VTcGVlZEZhY3RvcmAgaXMgbm90IHVzZWQgaW4gY29tYmluYXRpb24gd2l0aCBpbmRpdmlkdWFsXG4gICAqIHNwZWVkIGZhY3RvcnMuXG4gICAqL1xuICBwcml2YXRlIF92aXNpdFByb3BlcnR5QXNzaWdubWVudChhc3NpZ25tZW50OiB0cy5Qcm9wZXJ0eUFzc2lnbm1lbnQpIHtcbiAgICAvLyBGb3Igc3dpdGNoaW5nIHRoZSBgYmFzZVNwZWVkRmFjdG9yYCBnbG9iYWwgb3B0aW9uIHdlIGV4cGVjdCB0aGUgcHJvcGVydHkgYXNzaWdubWVudFxuICAgIC8vIHRvIGJlIGluc2lkZSBvZiBhIG5vcm1hbCBvYmplY3QgbGl0ZXJhbC4gQ3VzdG9tIHJpcHBsZSBnbG9iYWwgb3B0aW9ucyBjYW5ub3QgYmVcbiAgICAvLyB3aXRjaGVkIGF1dG9tYXRpY2FsbHkuXG4gICAgaWYgKCF0cy5pc09iamVjdExpdGVyYWxFeHByZXNzaW9uKGFzc2lnbm1lbnQucGFyZW50KSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFRoZSBhc3NpZ25tZW50IGNvbnNpc3RzIG9mIGEgbmFtZSAoa2V5KSBhbmQgaW5pdGlhbGl6ZXIgKHZhbHVlKS5cbiAgICBpZiAoYXNzaWdubWVudC5uYW1lLmdldFRleHQoKSAhPT0gJ2Jhc2VTcGVlZEZhY3RvcicpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBXZSBjb3VsZCB0ZWNobmljYWxseSBsYXppbHkgY2hlY2sgZm9yIHRoZSBNQVRfUklQUExFX0dMT0JBTF9PUFRJT05TIGluamVjdGlvbiB0b2tlbiB0b1xuICAgIC8vIGJlIHByZXNlbnQsIGJ1dCBpdCdzIG5vdCByaWdodCB0byBhc3N1bWUgdGhhdCBldmVyeW9uZSBzZXRzIHRoZSByaXBwbGUgZ2xvYmFsIG9wdGlvbnNcbiAgICAvLyBpbW1lZGlhdGVseSBpbiB0aGUgcHJvdmlkZXIgb2JqZWN0IChlLmcuIGl0IGNhbiBoYXBwZW4gdGhhdCBzb21lb25lIGp1c3QgaW1wb3J0cyB0aGVcbiAgICAvLyBjb25maWcgZnJvbSBhIHNlcGFyYXRlIGZpbGUpLlxuXG4gICAgY29uc3Qge2luaXRpYWxpemVyLCBuYW1lfSA9IGFzc2lnbm1lbnQ7XG4gICAgY29uc3QgZmlsZVBhdGggPSB0aGlzLmZpbGVTeXN0ZW0ucmVzb2x2ZShhc3NpZ25tZW50LmdldFNvdXJjZUZpbGUoKS5maWxlTmFtZSk7XG5cbiAgICBpZiAodHMuaXNOdW1lcmljTGl0ZXJhbChpbml0aWFsaXplcikpIHtcbiAgICAgIGNvbnN0IG51bWVyaWNWYWx1ZSA9IHBhcnNlRmxvYXQoaW5pdGlhbGl6ZXIudGV4dCk7XG4gICAgICBjb25zdCBuZXdFbnRlckR1cmF0aW9uVmFsdWUgPSBjb252ZXJ0U3BlZWRGYWN0b3JUb0R1cmF0aW9uKG51bWVyaWNWYWx1ZSk7XG5cbiAgICAgIC8vIFJlcGxhY2UgdGhlIGBiYXNlU3BlZWRGYWN0b3JgIHByb3BlcnR5IG5hbWUgd2l0aCBgYW5pbWF0aW9uYC5cbiAgICAgIHRoaXMuX3JlcGxhY2VUZXh0KGZpbGVQYXRoLCBuYW1lLmdldFN0YXJ0KCksIG5hbWUuZ2V0V2lkdGgoKSwgJ2FuaW1hdGlvbicpO1xuICAgICAgLy8gUmVwbGFjZSB0aGUgdmFsdWUgYXNzaWdubWVudCBpbml0aWFsaXplciB3aXRoIHRoZSBuZXcgYW5pbWF0aW9uIGNvbmZpZy5cbiAgICAgIHRoaXMuX3JlcGxhY2VUZXh0KFxuICAgICAgICAgIGZpbGVQYXRoLCBpbml0aWFsaXplci5nZXRTdGFydCgpLCBpbml0aWFsaXplci5nZXRXaWR0aCgpLFxuICAgICAgICAgIGB7ZW50ZXJEdXJhdGlvbjogJHtuZXdFbnRlckR1cmF0aW9uVmFsdWV9fWApO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBIYW5kbGUgdGhlIHJpZ2h0IGV4cHJlc3Npb24gZGlmZmVyZW50bHkgaWYgdGhlIHByZXZpb3VzIHNwZWVkIGZhY3RvciB2YWx1ZSBjYW4ndFxuICAgICAgLy8gYmUgcmVzb2x2ZWQgc3RhdGljYWxseS4gSW4gdGhhdCBjYXNlLCB3ZSBqdXN0IGNyZWF0ZSBhIFR5cGVTY3JpcHQgZXhwcmVzc2lvbiB0aGF0XG4gICAgICAvLyBjYWxjdWxhdGVzIHRoZSBleHBsaWNpdCBkdXJhdGlvbiBiYXNlZCBvbiB0aGUgbm9uLXN0YXRpYyBzcGVlZCBmYWN0b3IgZXhwcmVzc2lvbi5cbiAgICAgIGNvbnN0IG5ld0V4cHJlc3Npb24gPSBjcmVhdGVTcGVlZEZhY3RvckNvbnZlcnRFeHByZXNzaW9uKGluaXRpYWxpemVyLmdldFRleHQoKSk7XG5cbiAgICAgIC8vIFJlcGxhY2UgdGhlIGBiYXNlU3BlZWRGYWN0b3JgIHByb3BlcnR5IG5hbWUgd2l0aCBgYW5pbWF0aW9uYC5cbiAgICAgIHRoaXMuX3JlcGxhY2VUZXh0KGZpbGVQYXRoLCBuYW1lLmdldFN0YXJ0KCksIG5hbWUuZ2V0V2lkdGgoKSwgJ2FuaW1hdGlvbicpO1xuXG4gICAgICAvLyBSZXBsYWNlIHRoZSB2YWx1ZSBhc3NpZ25tZW50IHdpdGggdGhlIG5ldyBhbmltYXRpb24gY29uZmlnIGFuZCByZW1vdmUgVE9ETy5cbiAgICAgIHRoaXMuX3JlcGxhY2VUZXh0KFxuICAgICAgICAgIGZpbGVQYXRoLCBpbml0aWFsaXplci5nZXRTdGFydCgpLCBpbml0aWFsaXplci5nZXRXaWR0aCgpLFxuICAgICAgICAgIGAvKiogJHtyZW1vdmVOb3RlfSAqLyB7ZW50ZXJEdXJhdGlvbjogJHtuZXdFeHByZXNzaW9ufX1gKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9yZXBsYWNlVGV4dChmaWxlUGF0aDogV29ya3NwYWNlUGF0aCwgc3RhcnQ6IG51bWJlciwgd2lkdGg6IG51bWJlciwgbmV3VGV4dDogc3RyaW5nKSB7XG4gICAgY29uc3QgcmVjb3JkZXIgPSB0aGlzLmZpbGVTeXN0ZW0uZWRpdChmaWxlUGF0aCk7XG4gICAgcmVjb3JkZXIucmVtb3ZlKHN0YXJ0LCB3aWR0aCk7XG4gICAgcmVjb3JkZXIuaW5zZXJ0UmlnaHQoc3RhcnQsIG5ld1RleHQpO1xuICB9XG59XG4iXX0=