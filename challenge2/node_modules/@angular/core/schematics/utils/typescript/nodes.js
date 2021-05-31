/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/core/schematics/utils/typescript/nodes", ["require", "exports", "typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isSafeAccess = exports.isNullCheck = exports.closestNode = exports.hasModifier = void 0;
    const ts = require("typescript");
    /** Checks whether the given TypeScript node has the specified modifier set. */
    function hasModifier(node, modifierKind) {
        return !!node.modifiers && node.modifiers.some(m => m.kind === modifierKind);
    }
    exports.hasModifier = hasModifier;
    /** Find the closest parent node of a particular kind. */
    function closestNode(node, kind) {
        let current = node;
        while (current && !ts.isSourceFile(current)) {
            if (current.kind === kind) {
                return current;
            }
            current = current.parent;
        }
        return null;
    }
    exports.closestNode = closestNode;
    /**
     * Checks whether a particular node is part of a null check. E.g. given:
     * `foo.bar ? foo.bar.value : null` the null check would be `foo.bar`.
     */
    function isNullCheck(node) {
        if (!node.parent) {
            return false;
        }
        // `foo.bar && foo.bar.value` where `node` is `foo.bar`.
        if (ts.isBinaryExpression(node.parent) && node.parent.left === node) {
            return true;
        }
        // `foo.bar && foo.bar.parent && foo.bar.parent.value`
        // where `node` is `foo.bar`.
        if (node.parent.parent && ts.isBinaryExpression(node.parent.parent) &&
            node.parent.parent.left === node.parent) {
            return true;
        }
        // `if (foo.bar) {...}` where `node` is `foo.bar`.
        if (ts.isIfStatement(node.parent) && node.parent.expression === node) {
            return true;
        }
        // `foo.bar ? foo.bar.value : null` where `node` is `foo.bar`.
        if (ts.isConditionalExpression(node.parent) && node.parent.condition === node) {
            return true;
        }
        return false;
    }
    exports.isNullCheck = isNullCheck;
    /** Checks whether a property access is safe (e.g. `foo.parent?.value`). */
    function isSafeAccess(node) {
        return node.parent != null && ts.isPropertyAccessExpression(node.parent) &&
            node.parent.expression === node && node.parent.questionDotToken != null;
    }
    exports.isSafeAccess = isSafeAccess;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NjaGVtYXRpY3MvdXRpbHMvdHlwZXNjcmlwdC9ub2Rlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCxpQ0FBaUM7SUFFakMsK0VBQStFO0lBQy9FLFNBQWdCLFdBQVcsQ0FBQyxJQUFhLEVBQUUsWUFBMkI7UUFDcEUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssWUFBWSxDQUFDLENBQUM7SUFDL0UsQ0FBQztJQUZELGtDQUVDO0lBRUQseURBQXlEO0lBQ3pELFNBQWdCLFdBQVcsQ0FBb0IsSUFBYSxFQUFFLElBQW1CO1FBQy9FLElBQUksT0FBTyxHQUFZLElBQUksQ0FBQztRQUU1QixPQUFPLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDM0MsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLElBQUksRUFBRTtnQkFDekIsT0FBTyxPQUFZLENBQUM7YUFDckI7WUFDRCxPQUFPLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztTQUMxQjtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQVhELGtDQVdDO0lBRUQ7OztPQUdHO0lBQ0gsU0FBZ0IsV0FBVyxDQUFDLElBQWE7UUFDdkMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDaEIsT0FBTyxLQUFLLENBQUM7U0FDZDtRQUVELHdEQUF3RDtRQUN4RCxJQUFJLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssSUFBSSxFQUFFO1lBQ25FLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFFRCxzREFBc0Q7UUFDdEQsNkJBQTZCO1FBQzdCLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLElBQUksRUFBRSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO1lBQy9ELElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQzNDLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFFRCxrREFBa0Q7UUFDbEQsSUFBSSxFQUFFLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsS0FBSyxJQUFJLEVBQUU7WUFDcEUsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUVELDhEQUE4RDtRQUM5RCxJQUFJLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEtBQUssSUFBSSxFQUFFO1lBQzdFLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFFRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUE1QkQsa0NBNEJDO0lBRUQsMkVBQTJFO0lBQzNFLFNBQWdCLFlBQVksQ0FBQyxJQUFhO1FBQ3hDLE9BQU8sSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLElBQUksRUFBRSxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDcEUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEtBQUssSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLElBQUksSUFBSSxDQUFDO0lBQzlFLENBQUM7SUFIRCxvQ0FHQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuLyoqIENoZWNrcyB3aGV0aGVyIHRoZSBnaXZlbiBUeXBlU2NyaXB0IG5vZGUgaGFzIHRoZSBzcGVjaWZpZWQgbW9kaWZpZXIgc2V0LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhhc01vZGlmaWVyKG5vZGU6IHRzLk5vZGUsIG1vZGlmaWVyS2luZDogdHMuU3ludGF4S2luZCkge1xuICByZXR1cm4gISFub2RlLm1vZGlmaWVycyAmJiBub2RlLm1vZGlmaWVycy5zb21lKG0gPT4gbS5raW5kID09PSBtb2RpZmllcktpbmQpO1xufVxuXG4vKiogRmluZCB0aGUgY2xvc2VzdCBwYXJlbnQgbm9kZSBvZiBhIHBhcnRpY3VsYXIga2luZC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbG9zZXN0Tm9kZTxUIGV4dGVuZHMgdHMuTm9kZT4obm9kZTogdHMuTm9kZSwga2luZDogdHMuU3ludGF4S2luZCk6IFR8bnVsbCB7XG4gIGxldCBjdXJyZW50OiB0cy5Ob2RlID0gbm9kZTtcblxuICB3aGlsZSAoY3VycmVudCAmJiAhdHMuaXNTb3VyY2VGaWxlKGN1cnJlbnQpKSB7XG4gICAgaWYgKGN1cnJlbnQua2luZCA9PT0ga2luZCkge1xuICAgICAgcmV0dXJuIGN1cnJlbnQgYXMgVDtcbiAgICB9XG4gICAgY3VycmVudCA9IGN1cnJlbnQucGFyZW50O1xuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgYSBwYXJ0aWN1bGFyIG5vZGUgaXMgcGFydCBvZiBhIG51bGwgY2hlY2suIEUuZy4gZ2l2ZW46XG4gKiBgZm9vLmJhciA/IGZvby5iYXIudmFsdWUgOiBudWxsYCB0aGUgbnVsbCBjaGVjayB3b3VsZCBiZSBgZm9vLmJhcmAuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc051bGxDaGVjayhub2RlOiB0cy5Ob2RlKTogYm9vbGVhbiB7XG4gIGlmICghbm9kZS5wYXJlbnQpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBgZm9vLmJhciAmJiBmb28uYmFyLnZhbHVlYCB3aGVyZSBgbm9kZWAgaXMgYGZvby5iYXJgLlxuICBpZiAodHMuaXNCaW5hcnlFeHByZXNzaW9uKG5vZGUucGFyZW50KSAmJiBub2RlLnBhcmVudC5sZWZ0ID09PSBub2RlKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvLyBgZm9vLmJhciAmJiBmb28uYmFyLnBhcmVudCAmJiBmb28uYmFyLnBhcmVudC52YWx1ZWBcbiAgLy8gd2hlcmUgYG5vZGVgIGlzIGBmb28uYmFyYC5cbiAgaWYgKG5vZGUucGFyZW50LnBhcmVudCAmJiB0cy5pc0JpbmFyeUV4cHJlc3Npb24obm9kZS5wYXJlbnQucGFyZW50KSAmJlxuICAgICAgbm9kZS5wYXJlbnQucGFyZW50LmxlZnQgPT09IG5vZGUucGFyZW50KSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvLyBgaWYgKGZvby5iYXIpIHsuLi59YCB3aGVyZSBgbm9kZWAgaXMgYGZvby5iYXJgLlxuICBpZiAodHMuaXNJZlN0YXRlbWVudChub2RlLnBhcmVudCkgJiYgbm9kZS5wYXJlbnQuZXhwcmVzc2lvbiA9PT0gbm9kZSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLy8gYGZvby5iYXIgPyBmb28uYmFyLnZhbHVlIDogbnVsbGAgd2hlcmUgYG5vZGVgIGlzIGBmb28uYmFyYC5cbiAgaWYgKHRzLmlzQ29uZGl0aW9uYWxFeHByZXNzaW9uKG5vZGUucGFyZW50KSAmJiBub2RlLnBhcmVudC5jb25kaXRpb24gPT09IG5vZGUpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqIENoZWNrcyB3aGV0aGVyIGEgcHJvcGVydHkgYWNjZXNzIGlzIHNhZmUgKGUuZy4gYGZvby5wYXJlbnQ/LnZhbHVlYCkuICovXG5leHBvcnQgZnVuY3Rpb24gaXNTYWZlQWNjZXNzKG5vZGU6IHRzLk5vZGUpOiBib29sZWFuIHtcbiAgcmV0dXJuIG5vZGUucGFyZW50ICE9IG51bGwgJiYgdHMuaXNQcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24obm9kZS5wYXJlbnQpICYmXG4gICAgICBub2RlLnBhcmVudC5leHByZXNzaW9uID09PSBub2RlICYmIG5vZGUucGFyZW50LnF1ZXN0aW9uRG90VG9rZW4gIT0gbnVsbDtcbn1cbiJdfQ==