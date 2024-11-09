/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as o from './output/output_ast';
const CONSTANT_PREFIX = '_c';
/**
 * `ConstantPool` tries to reuse literal factories when two or more literals are identical.
 * We determine whether literals are identical by creating a key out of their AST using the
 * `KeyVisitor`. This constant is used to replace dynamic expressions which can't be safely
 * converted into a key. E.g. given an expression `{foo: bar()}`, since we don't know what
 * the result of `bar` will be, we create a key that looks like `{foo: <unknown>}`. Note
 * that we use a variable, rather than something like `null` in order to avoid collisions.
 */
const UNKNOWN_VALUE_KEY = o.variable('<unknown>');
/**
 * Context to use when producing a key.
 *
 * This ensures we see the constant not the reference variable when producing
 * a key.
 */
const KEY_CONTEXT = {};
/**
 * Generally all primitive values are excluded from the `ConstantPool`, but there is an exclusion
 * for strings that reach a certain length threshold. This constant defines the length threshold for
 * strings.
 */
const POOL_INCLUSION_LENGTH_THRESHOLD_FOR_STRINGS = 50;
/**
 * A node that is a place-holder that allows the node to be replaced when the actual
 * node is known.
 *
 * This allows the constant pool to change an expression from a direct reference to
 * a constant to a shared constant. It returns a fix-up node that is later allowed to
 * change the referenced expression.
 */
class FixupExpression extends o.Expression {
    constructor(resolved) {
        super(resolved.type);
        this.resolved = resolved;
        this.shared = false;
        this.original = resolved;
    }
    visitExpression(visitor, context) {
        if (context === KEY_CONTEXT) {
            // When producing a key we want to traverse the constant not the
            // variable used to refer to it.
            return this.original.visitExpression(visitor, context);
        }
        else {
            return this.resolved.visitExpression(visitor, context);
        }
    }
    isEquivalent(e) {
        return e instanceof FixupExpression && this.resolved.isEquivalent(e.resolved);
    }
    isConstant() {
        return true;
    }
    clone() {
        throw new Error(`Not supported.`);
    }
    fixup(expression) {
        this.resolved = expression;
        this.shared = true;
    }
}
/**
 * A constant pool allows a code emitter to share constant in an output context.
 *
 * The constant pool also supports sharing access to ivy definitions references.
 */
export class ConstantPool {
    constructor(isClosureCompilerEnabled = false) {
        this.isClosureCompilerEnabled = isClosureCompilerEnabled;
        this.statements = [];
        this.literals = new Map();
        this.literalFactories = new Map();
        this.sharedConstants = new Map();
        /**
         * Constant pool also tracks claimed names from {@link uniqueName}.
         * This is useful to avoid collisions if variables are intended to be
         * named a certain way- but may conflict. We wouldn't want to always suffix
         * them with unique numbers.
         */
        this._claimedNames = new Map();
        this.nextNameIndex = 0;
    }
    getConstLiteral(literal, forceShared) {
        if ((literal instanceof o.LiteralExpr && !isLongStringLiteral(literal)) ||
            literal instanceof FixupExpression) {
            // Do no put simple literals into the constant pool or try to produce a constant for a
            // reference to a constant.
            return literal;
        }
        const key = GenericKeyFn.INSTANCE.keyOf(literal);
        let fixup = this.literals.get(key);
        let newValue = false;
        if (!fixup) {
            fixup = new FixupExpression(literal);
            this.literals.set(key, fixup);
            newValue = true;
        }
        if ((!newValue && !fixup.shared) || (newValue && forceShared)) {
            // Replace the expression with a variable
            const name = this.freshName();
            let definition;
            let usage;
            if (this.isClosureCompilerEnabled && isLongStringLiteral(literal)) {
                // For string literals, Closure will **always** inline the string at
                // **all** usages, duplicating it each time. For large strings, this
                // unnecessarily bloats bundle size. To work around this restriction, we
                // wrap the string in a function, and call that function for each usage.
                // This tricks Closure into using inline logic for functions instead of
                // string literals. Function calls are only inlined if the body is small
                // enough to be worth it. By doing this, very large strings will be
                // shared across multiple usages, rather than duplicating the string at
                // each usage site.
                //
                // const myStr = function() { return "very very very long string"; };
                // const usage1 = myStr();
                // const usage2 = myStr();
                definition = o.variable(name).set(new o.FunctionExpr([], // Params.
                [
                    // Statements.
                    new o.ReturnStatement(literal),
                ]));
                usage = o.variable(name).callFn([]);
            }
            else {
                // Just declare and use the variable directly, without a function call
                // indirection. This saves a few bytes and avoids an unnecessary call.
                definition = o.variable(name).set(literal);
                usage = o.variable(name);
            }
            this.statements.push(definition.toDeclStmt(o.INFERRED_TYPE, o.StmtModifier.Final));
            fixup.fixup(usage);
        }
        return fixup;
    }
    getSharedConstant(def, expr) {
        const key = def.keyOf(expr);
        if (!this.sharedConstants.has(key)) {
            const id = this.freshName();
            this.sharedConstants.set(key, o.variable(id));
            this.statements.push(def.toSharedConstantDeclaration(id, expr));
        }
        return this.sharedConstants.get(key);
    }
    getLiteralFactory(literal) {
        // Create a pure function that builds an array of a mix of constant and variable expressions
        if (literal instanceof o.LiteralArrayExpr) {
            const argumentsForKey = literal.entries.map(e => e.isConstant() ? e : UNKNOWN_VALUE_KEY);
            const key = GenericKeyFn.INSTANCE.keyOf(o.literalArr(argumentsForKey));
            return this._getLiteralFactory(key, literal.entries, entries => o.literalArr(entries));
        }
        else {
            const expressionForKey = o.literalMap(literal.entries.map(e => ({
                key: e.key,
                value: e.value.isConstant() ? e.value : UNKNOWN_VALUE_KEY,
                quoted: e.quoted
            })));
            const key = GenericKeyFn.INSTANCE.keyOf(expressionForKey);
            return this._getLiteralFactory(key, literal.entries.map(e => e.value), entries => o.literalMap(entries.map((value, index) => ({
                key: literal.entries[index].key,
                value,
                quoted: literal.entries[index].quoted
            }))));
        }
    }
    // TODO: useUniqueName(false) is necessary for naming compatibility with
    // TemplateDefinitionBuilder, but should be removed once Template Pipeline is the default.
    getSharedFunctionReference(fn, prefix, useUniqueName = true) {
        const isArrow = fn instanceof o.ArrowFunctionExpr;
        for (const current of this.statements) {
            // Arrow functions are saved as variables so we check if the
            // value of the variable is the same as the arrow function.
            if (isArrow && current instanceof o.DeclareVarStmt && current.value?.isEquivalent(fn)) {
                return o.variable(current.name);
            }
            // Function declarations are saved as function statements
            // so we compare them directly to the passed-in function.
            if (!isArrow && current instanceof o.DeclareFunctionStmt && fn.isEquivalent(current)) {
                return o.variable(current.name);
            }
        }
        // Otherwise declare the function.
        const name = useUniqueName ? this.uniqueName(prefix) : prefix;
        this.statements.push(fn.toDeclStmt(name, o.StmtModifier.Final));
        return o.variable(name);
    }
    _getLiteralFactory(key, values, resultMap) {
        let literalFactory = this.literalFactories.get(key);
        const literalFactoryArguments = values.filter((e => !e.isConstant()));
        if (!literalFactory) {
            const resultExpressions = values.map((e, index) => e.isConstant() ? this.getConstLiteral(e, true) : o.variable(`a${index}`));
            const parameters = resultExpressions.filter(isVariable).map(e => new o.FnParam(e.name, o.DYNAMIC_TYPE));
            const pureFunctionDeclaration = o.arrowFn(parameters, resultMap(resultExpressions), o.INFERRED_TYPE);
            const name = this.freshName();
            this.statements.push(o.variable(name)
                .set(pureFunctionDeclaration)
                .toDeclStmt(o.INFERRED_TYPE, o.StmtModifier.Final));
            literalFactory = o.variable(name);
            this.literalFactories.set(key, literalFactory);
        }
        return { literalFactory, literalFactoryArguments };
    }
    /**
     * Produce a unique name in the context of this pool.
     *
     * The name might be unique among different prefixes if any of the prefixes end in
     * a digit so the prefix should be a constant string (not based on user input) and
     * must not end in a digit.
     */
    uniqueName(name, alwaysIncludeSuffix = true) {
        const count = this._claimedNames.get(name) ?? 0;
        const result = count === 0 && !alwaysIncludeSuffix ? `${name}` : `${name}${count}`;
        this._claimedNames.set(name, count + 1);
        return result;
    }
    freshName() {
        return this.uniqueName(CONSTANT_PREFIX);
    }
}
export class GenericKeyFn {
    static { this.INSTANCE = new GenericKeyFn(); }
    keyOf(expr) {
        if (expr instanceof o.LiteralExpr && typeof expr.value === 'string') {
            return `"${expr.value}"`;
        }
        else if (expr instanceof o.LiteralExpr) {
            return String(expr.value);
        }
        else if (expr instanceof o.LiteralArrayExpr) {
            const entries = [];
            for (const entry of expr.entries) {
                entries.push(this.keyOf(entry));
            }
            return `[${entries.join(',')}]`;
        }
        else if (expr instanceof o.LiteralMapExpr) {
            const entries = [];
            for (const entry of expr.entries) {
                let key = entry.key;
                if (entry.quoted) {
                    key = `"${key}"`;
                }
                entries.push(key + ':' + this.keyOf(entry.value));
            }
            return `{${entries.join(',')}}`;
        }
        else if (expr instanceof o.ExternalExpr) {
            return `import("${expr.value.moduleName}", ${expr.value.name})`;
        }
        else if (expr instanceof o.ReadVarExpr) {
            return `read(${expr.name})`;
        }
        else if (expr instanceof o.TypeofExpr) {
            return `typeof(${this.keyOf(expr.expr)})`;
        }
        else {
            throw new Error(`${this.constructor.name} does not handle expressions of type ${expr.constructor.name}`);
        }
    }
}
function isVariable(e) {
    return e instanceof o.ReadVarExpr;
}
function isLongStringLiteral(expr) {
    return expr instanceof o.LiteralExpr && typeof expr.value === 'string' &&
        expr.value.length >= POOL_INCLUSION_LENGTH_THRESHOLD_FOR_STRINGS;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRfcG9vbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9jb25zdGFudF9wb29sLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sS0FBSyxDQUFDLE1BQU0scUJBQXFCLENBQUM7QUFFekMsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDO0FBRTdCOzs7Ozs7O0dBT0c7QUFDSCxNQUFNLGlCQUFpQixHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7QUFFbEQ7Ozs7O0dBS0c7QUFDSCxNQUFNLFdBQVcsR0FBRyxFQUFFLENBQUM7QUFFdkI7Ozs7R0FJRztBQUNILE1BQU0sMkNBQTJDLEdBQUcsRUFBRSxDQUFDO0FBRXZEOzs7Ozs7O0dBT0c7QUFDSCxNQUFNLGVBQWdCLFNBQVEsQ0FBQyxDQUFDLFVBQVU7SUFLeEMsWUFBbUIsUUFBc0I7UUFDdkMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQURKLGFBQVEsR0FBUixRQUFRLENBQWM7UUFGekMsV0FBTSxHQUFHLEtBQUssQ0FBQztRQUliLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0lBQzNCLENBQUM7SUFFUSxlQUFlLENBQUMsT0FBNEIsRUFBRSxPQUFZO1FBQ2pFLElBQUksT0FBTyxLQUFLLFdBQVcsRUFBRSxDQUFDO1lBQzVCLGdFQUFnRTtZQUNoRSxnQ0FBZ0M7WUFDaEMsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDekQsQ0FBQzthQUFNLENBQUM7WUFDTixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN6RCxDQUFDO0lBQ0gsQ0FBQztJQUVRLFlBQVksQ0FBQyxDQUFlO1FBQ25DLE9B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ZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIG8gZnJvbSAnLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5cbmNvbnN0IENPTlNUQU5UX1BSRUZJWCA9ICdfYyc7XG5cbi8qKlxuICogYENvbnN0YW50UG9vbGAgdHJpZXMgdG8gcmV1c2UgbGl0ZXJhbCBmYWN0b3JpZXMgd2hlbiB0d28gb3IgbW9yZSBsaXRlcmFscyBhcmUgaWRlbnRpY2FsLlxuICogV2UgZGV0ZXJtaW5lIHdoZXRoZXIgbGl0ZXJhbHMgYXJlIGlkZW50aWNhbCBieSBjcmVhdGluZyBhIGtleSBvdXQgb2YgdGhlaXIgQVNUIHVzaW5nIHRoZVxuICogYEtleVZpc2l0b3JgLiBUaGlzIGNvbnN0YW50IGlzIHVzZWQgdG8gcmVwbGFjZSBkeW5hbWljIGV4cHJlc3Npb25zIHdoaWNoIGNhbid0IGJlIHNhZmVseVxuICogY29udmVydGVkIGludG8gYSBrZXkuIEUuZy4gZ2l2ZW4gYW4gZXhwcmVzc2lvbiBge2ZvbzogYmFyKCl9YCwgc2luY2Ugd2UgZG9uJ3Qga25vdyB3aGF0XG4gKiB0aGUgcmVzdWx0IG9mIGBiYXJgIHdpbGwgYmUsIHdlIGNyZWF0ZSBhIGtleSB0aGF0IGxvb2tzIGxpa2UgYHtmb286IDx1bmtub3duPn1gLiBOb3RlXG4gKiB0aGF0IHdlIHVzZSBhIHZhcmlhYmxlLCByYXRoZXIgdGhhbiBzb21ldGhpbmcgbGlrZSBgbnVsbGAgaW4gb3JkZXIgdG8gYXZvaWQgY29sbGlzaW9ucy5cbiAqL1xuY29uc3QgVU5LTk9XTl9WQUxVRV9LRVkgPSBvLnZhcmlhYmxlKCc8dW5rbm93bj4nKTtcblxuLyoqXG4gKiBDb250ZXh0IHRvIHVzZSB3aGVuIHByb2R1Y2luZyBhIGtleS5cbiAqXG4gKiBUaGlzIGVuc3VyZXMgd2Ugc2VlIHRoZSBjb25zdGFudCBub3QgdGhlIHJlZmVyZW5jZSB2YXJpYWJsZSB3aGVuIHByb2R1Y2luZ1xuICogYSBrZXkuXG4gKi9cbmNvbnN0IEtFWV9DT05URVhUID0ge307XG5cbi8qKlxuICogR2VuZXJhbGx5IGFsbCBwcmltaXRpdmUgdmFsdWVzIGFyZSBleGNsdWRlZCBmcm9tIHRoZSBgQ29uc3RhbnRQb29sYCwgYnV0IHRoZXJlIGlzIGFuIGV4Y2x1c2lvblxuICogZm9yIHN0cmluZ3MgdGhhdCByZWFjaCBhIGNlcnRhaW4gbGVuZ3RoIHRocmVzaG9sZC4gVGhpcyBjb25zdGFudCBkZWZpbmVzIHRoZSBsZW5ndGggdGhyZXNob2xkIGZvclxuICogc3RyaW5ncy5cbiAqL1xuY29uc3QgUE9PTF9JTkNMVVNJT05fTEVOR1RIX1RIUkVTSE9MRF9GT1JfU1RSSU5HUyA9IDUwO1xuXG4vKipcbiAqIEEgbm9kZSB0aGF0IGlzIGEgcGxhY2UtaG9sZGVyIHRoYXQgYWxsb3dzIHRoZSBub2RlIHRvIGJlIHJlcGxhY2VkIHdoZW4gdGhlIGFjdHVhbFxuICogbm9kZSBpcyBrbm93bi5cbiAqXG4gKiBUaGlzIGFsbG93cyB0aGUgY29uc3RhbnQgcG9vbCB0byBjaGFuZ2UgYW4gZXhwcmVzc2lvbiBmcm9tIGEgZGlyZWN0IHJlZmVyZW5jZSB0b1xuICogYSBjb25zdGFudCB0byBhIHNoYXJlZCBjb25zdGFudC4gSXQgcmV0dXJucyBhIGZpeC11cCBub2RlIHRoYXQgaXMgbGF0ZXIgYWxsb3dlZCB0b1xuICogY2hhbmdlIHRoZSByZWZlcmVuY2VkIGV4cHJlc3Npb24uXG4gKi9cbmNsYXNzIEZpeHVwRXhwcmVzc2lvbiBleHRlbmRzIG8uRXhwcmVzc2lvbiB7XG4gIHByaXZhdGUgb3JpZ2luYWw6IG8uRXhwcmVzc2lvbjtcblxuICBzaGFyZWQgPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgcmVzb2x2ZWQ6IG8uRXhwcmVzc2lvbikge1xuICAgIHN1cGVyKHJlc29sdmVkLnR5cGUpO1xuICAgIHRoaXMub3JpZ2luYWwgPSByZXNvbHZlZDtcbiAgfVxuXG4gIG92ZXJyaWRlIHZpc2l0RXhwcmVzc2lvbih2aXNpdG9yOiBvLkV4cHJlc3Npb25WaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIGlmIChjb250ZXh0ID09PSBLRVlfQ09OVEVYVCkge1xuICAgICAgLy8gV2hlbiBwcm9kdWNpbmcgYSBrZXkgd2Ugd2FudCB0byB0cmF2ZXJzZSB0aGUgY29uc3RhbnQgbm90IHRoZVxuICAgICAgLy8gdmFyaWFibGUgdXNlZCB0byByZWZlciB0byBpdC5cbiAgICAgIHJldHVybiB0aGlzLm9yaWdpbmFsLnZpc2l0RXhwcmVzc2lvbih2aXNpdG9yLCBjb250ZXh0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMucmVzb2x2ZWQudmlzaXRFeHByZXNzaW9uKHZpc2l0b3IsIGNvbnRleHQpO1xuICAgIH1cbiAgfVxuXG4gIG92ZXJyaWRlIGlzRXF1aXZhbGVudChlOiBvLkV4cHJlc3Npb24pOiBib29sZWFuIHtcbiAgICByZXR1cm4gZSBpbnN0YW5jZW9mIEZpeHVwRXhwcmVzc2lvbiAmJiB0aGlzLnJlc29sdmVkLmlzRXF1aXZhbGVudChlLnJlc29sdmVkKTtcbiAgfVxuXG4gIG92ZXJyaWRlIGlzQ29uc3RhbnQoKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBvdmVycmlkZSBjbG9uZSgpOiBGaXh1cEV4cHJlc3Npb24ge1xuICAgIHRocm93IG5ldyBFcnJvcihgTm90IHN1cHBvcnRlZC5gKTtcbiAgfVxuXG4gIGZpeHVwKGV4cHJlc3Npb246IG8uRXhwcmVzc2lvbikge1xuICAgIHRoaXMucmVzb2x2ZWQgPSBleHByZXNzaW9uO1xuICAgIHRoaXMuc2hhcmVkID0gdHJ1ZTtcbiAgfVxufVxuXG4vKipcbiAqIEEgY29uc3RhbnQgcG9vbCBhbGxvd3MgYSBjb2RlIGVtaXR0ZXIgdG8gc2hhcmUgY29uc3RhbnQgaW4gYW4gb3V0cHV0IGNvbnRleHQuXG4gKlxuICogVGhlIGNvbnN0YW50IHBvb2wgYWxzbyBzdXBwb3J0cyBzaGFyaW5nIGFjY2VzcyB0byBpdnkgZGVmaW5pdGlvbnMgcmVmZXJlbmNlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIENvbnN0YW50UG9vbCB7XG4gIHN0YXRlbWVudHM6IG8uU3RhdGVtZW50W10gPSBbXTtcbiAgcHJpdmF0ZSBsaXRlcmFscyA9IG5ldyBNYXA8c3RyaW5nLCBGaXh1cEV4cHJlc3Npb24+KCk7XG4gIHByaXZhdGUgbGl0ZXJhbEZhY3RvcmllcyA9IG5ldyBNYXA8c3RyaW5nLCBvLkV4cHJlc3Npb24+KCk7XG4gIHByaXZhdGUgc2hhcmVkQ29uc3RhbnRzID0gbmV3IE1hcDxzdHJpbmcsIG8uRXhwcmVzc2lvbj4oKTtcblxuICAvKipcbiAgICogQ29uc3RhbnQgcG9vbCBhbHNvIHRyYWNrcyBjbGFpbWVkIG5hbWVzIGZyb20ge0BsaW5rIHVuaXF1ZU5hbWV9LlxuICAgKiBUaGlzIGlzIHVzZWZ1bCB0byBhdm9pZCBjb2xsaXNpb25zIGlmIHZhcmlhYmxlcyBhcmUgaW50ZW5kZWQgdG8gYmVcbiAgICogbmFtZWQgYSBjZXJ0YWluIHdheS0gYnV0IG1heSBjb25mbGljdC4gV2Ugd291bGRuJ3Qgd2FudCB0byBhbHdheXMgc3VmZml4XG4gICAqIHRoZW0gd2l0aCB1bmlxdWUgbnVtYmVycy5cbiAgICovXG4gIHByaXZhdGUgX2NsYWltZWROYW1lcyA9IG5ldyBNYXA8c3RyaW5nLCBudW1iZXI+KCk7XG5cbiAgcHJpdmF0ZSBuZXh0TmFtZUluZGV4ID0gMDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IGlzQ2xvc3VyZUNvbXBpbGVyRW5hYmxlZDogYm9vbGVhbiA9IGZhbHNlKSB7fVxuXG4gIGdldENvbnN0TGl0ZXJhbChsaXRlcmFsOiBvLkV4cHJlc3Npb24sIGZvcmNlU2hhcmVkPzogYm9vbGVhbik6IG8uRXhwcmVzc2lvbiB7XG4gICAgaWYgKChsaXRlcmFsIGluc3RhbmNlb2Ygby5MaXRlcmFsRXhwciAmJiAhaXNMb25nU3RyaW5nTGl0ZXJhbChsaXRlcmFsKSkgfHxcbiAgICAgICAgbGl0ZXJhbCBpbnN0YW5jZW9mIEZpeHVwRXhwcmVzc2lvbikge1xuICAgICAgLy8gRG8gbm8gcHV0IHNpbXBsZSBsaXRlcmFscyBpbnRvIHRoZSBjb25zdGFudCBwb29sIG9yIHRyeSB0byBwcm9kdWNlIGEgY29uc3RhbnQgZm9yIGFcbiAgICAgIC8vIHJlZmVyZW5jZSB0byBhIGNvbnN0YW50LlxuICAgICAgcmV0dXJuIGxpdGVyYWw7XG4gICAgfVxuICAgIGNvbnN0IGtleSA9IEdlbmVyaWNLZXlGbi5JTlNUQU5DRS5rZXlPZihsaXRlcmFsKTtcbiAgICBsZXQgZml4dXAgPSB0aGlzLmxpdGVyYWxzLmdldChrZXkpO1xuICAgIGxldCBuZXdWYWx1ZSA9IGZhbHNlO1xuICAgIGlmICghZml4dXApIHtcbiAgICAgIGZpeHVwID0gbmV3IEZpeHVwRXhwcmVzc2lvbihsaXRlcmFsKTtcbiAgICAgIHRoaXMubGl0ZXJhbHMuc2V0KGtleSwgZml4dXApO1xuICAgICAgbmV3VmFsdWUgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmICgoIW5ld1ZhbHVlICYmICFmaXh1cC5zaGFyZWQpIHx8IChuZXdWYWx1ZSAmJiBmb3JjZVNoYXJlZCkpIHtcbiAgICAgIC8vIFJlcGxhY2UgdGhlIGV4cHJlc3Npb24gd2l0aCBhIHZhcmlhYmxlXG4gICAgICBjb25zdCBuYW1lID0gdGhpcy5mcmVzaE5hbWUoKTtcbiAgICAgIGxldCBkZWZpbml0aW9uOiBvLldyaXRlVmFyRXhwcjtcbiAgICAgIGxldCB1c2FnZTogby5FeHByZXNzaW9uO1xuICAgICAgaWYgKHRoaXMuaXNDbG9zdXJlQ29tcGlsZXJFbmFibGVkICYmIGlzTG9uZ1N0cmluZ0xpdGVyYWwobGl0ZXJhbCkpIHtcbiAgICAgICAgLy8gRm9yIHN0cmluZyBsaXRlcmFscywgQ2xvc3VyZSB3aWxsICoqYWx3YXlzKiogaW5saW5lIHRoZSBzdHJpbmcgYXRcbiAgICAgICAgLy8gKiphbGwqKiB1c2FnZXMsIGR1cGxpY2F0aW5nIGl0IGVhY2ggdGltZS4gRm9yIGxhcmdlIHN0cmluZ3MsIHRoaXNcbiAgICAgICAgLy8gdW5uZWNlc3NhcmlseSBibG9hdHMgYnVuZGxlIHNpemUuIFRvIHdvcmsgYXJvdW5kIHRoaXMgcmVzdHJpY3Rpb24sIHdlXG4gICAgICAgIC8vIHdyYXAgdGhlIHN0cmluZyBpbiBhIGZ1bmN0aW9uLCBhbmQgY2FsbCB0aGF0IGZ1bmN0aW9uIGZvciBlYWNoIHVzYWdlLlxuICAgICAgICAvLyBUaGlzIHRyaWNrcyBDbG9zdXJlIGludG8gdXNpbmcgaW5saW5lIGxvZ2ljIGZvciBmdW5jdGlvbnMgaW5zdGVhZCBvZlxuICAgICAgICAvLyBzdHJpbmcgbGl0ZXJhbHMuIEZ1bmN0aW9uIGNhbGxzIGFyZSBvbmx5IGlubGluZWQgaWYgdGhlIGJvZHkgaXMgc21hbGxcbiAgICAgICAgLy8gZW5vdWdoIHRvIGJlIHdvcnRoIGl0LiBCeSBkb2luZyB0aGlzLCB2ZXJ5IGxhcmdlIHN0cmluZ3Mgd2lsbCBiZVxuICAgICAgICAvLyBzaGFyZWQgYWNyb3NzIG11bHRpcGxlIHVzYWdlcywgcmF0aGVyIHRoYW4gZHVwbGljYXRpbmcgdGhlIHN0cmluZyBhdFxuICAgICAgICAvLyBlYWNoIHVzYWdlIHNpdGUuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIGNvbnN0IG15U3RyID0gZnVuY3Rpb24oKSB7IHJldHVybiBcInZlcnkgdmVyeSB2ZXJ5IGxvbmcgc3RyaW5nXCI7IH07XG4gICAgICAgIC8vIGNvbnN0IHVzYWdlMSA9IG15U3RyKCk7XG4gICAgICAgIC8vIGNvbnN0IHVzYWdlMiA9IG15U3RyKCk7XG4gICAgICAgIGRlZmluaXRpb24gPSBvLnZhcmlhYmxlKG5hbWUpLnNldChuZXcgby5GdW5jdGlvbkV4cHIoXG4gICAgICAgICAgICBbXSwgIC8vIFBhcmFtcy5cbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgLy8gU3RhdGVtZW50cy5cbiAgICAgICAgICAgICAgbmV3IG8uUmV0dXJuU3RhdGVtZW50KGxpdGVyYWwpLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICkpO1xuICAgICAgICB1c2FnZSA9IG8udmFyaWFibGUobmFtZSkuY2FsbEZuKFtdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEp1c3QgZGVjbGFyZSBhbmQgdXNlIHRoZSB2YXJpYWJsZSBkaXJlY3RseSwgd2l0aG91dCBhIGZ1bmN0aW9uIGNhbGxcbiAgICAgICAgLy8gaW5kaXJlY3Rpb24uIFRoaXMgc2F2ZXMgYSBmZXcgYnl0ZXMgYW5kIGF2b2lkcyBhbiB1bm5lY2Vzc2FyeSBjYWxsLlxuICAgICAgICBkZWZpbml0aW9uID0gby52YXJpYWJsZShuYW1lKS5zZXQobGl0ZXJhbCk7XG4gICAgICAgIHVzYWdlID0gby52YXJpYWJsZShuYW1lKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5zdGF0ZW1lbnRzLnB1c2goZGVmaW5pdGlvbi50b0RlY2xTdG10KG8uSU5GRVJSRURfVFlQRSwgby5TdG10TW9kaWZpZXIuRmluYWwpKTtcbiAgICAgIGZpeHVwLmZpeHVwKHVzYWdlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZml4dXA7XG4gIH1cblxuICBnZXRTaGFyZWRDb25zdGFudChkZWY6IFNoYXJlZENvbnN0YW50RGVmaW5pdGlvbiwgZXhwcjogby5FeHByZXNzaW9uKTogby5FeHByZXNzaW9uIHtcbiAgICBjb25zdCBrZXkgPSBkZWYua2V5T2YoZXhwcik7XG4gICAgaWYgKCF0aGlzLnNoYXJlZENvbnN0YW50cy5oYXMoa2V5KSkge1xuICAgICAgY29uc3QgaWQgPSB0aGlzLmZyZXNoTmFtZSgpO1xuICAgICAgdGhpcy5zaGFyZWRDb25zdGFudHMuc2V0KGtleSwgby52YXJpYWJsZShpZCkpO1xuICAgICAgdGhpcy5zdGF0ZW1lbnRzLnB1c2goZGVmLnRvU2hhcmVkQ29uc3RhbnREZWNsYXJhdGlvbihpZCwgZXhwcikpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5zaGFyZWRDb25zdGFudHMuZ2V0KGtleSkhO1xuICB9XG5cbiAgZ2V0TGl0ZXJhbEZhY3RvcnkobGl0ZXJhbDogby5MaXRlcmFsQXJyYXlFeHByfG8uTGl0ZXJhbE1hcEV4cHIpOlxuICAgICAge2xpdGVyYWxGYWN0b3J5OiBvLkV4cHJlc3Npb24sIGxpdGVyYWxGYWN0b3J5QXJndW1lbnRzOiBvLkV4cHJlc3Npb25bXX0ge1xuICAgIC8vIENyZWF0ZSBhIHB1cmUgZnVuY3Rpb24gdGhhdCBidWlsZHMgYW4gYXJyYXkgb2YgYSBtaXggb2YgY29uc3RhbnQgYW5kIHZhcmlhYmxlIGV4cHJlc3Npb25zXG4gICAgaWYgKGxpdGVyYWwgaW5zdGFuY2VvZiBvLkxpdGVyYWxBcnJheUV4cHIpIHtcbiAgICAgIGNvbnN0IGFyZ3VtZW50c0ZvcktleSA9IGxpdGVyYWwuZW50cmllcy5tYXAoZSA9PiBlLmlzQ29uc3RhbnQoKSA/IGUgOiBVTktOT1dOX1ZBTFVFX0tFWSk7XG4gICAgICBjb25zdCBrZXkgPSBHZW5lcmljS2V5Rm4uSU5TVEFOQ0Uua2V5T2Yoby5saXRlcmFsQXJyKGFyZ3VtZW50c0ZvcktleSkpO1xuICAgICAgcmV0dXJuIHRoaXMuX2dldExpdGVyYWxGYWN0b3J5KGtleSwgbGl0ZXJhbC5lbnRyaWVzLCBlbnRyaWVzID0+IG8ubGl0ZXJhbEFycihlbnRyaWVzKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGV4cHJlc3Npb25Gb3JLZXkgPSBvLmxpdGVyYWxNYXAoXG4gICAgICAgICAgbGl0ZXJhbC5lbnRyaWVzLm1hcChlID0+ICh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleTogZS5rZXksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBlLnZhbHVlLmlzQ29uc3RhbnQoKSA/IGUudmFsdWUgOiBVTktOT1dOX1ZBTFVFX0tFWSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVvdGVkOiBlLnF1b3RlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpKTtcbiAgICAgIGNvbnN0IGtleSA9IEdlbmVyaWNLZXlGbi5JTlNUQU5DRS5rZXlPZihleHByZXNzaW9uRm9yS2V5KTtcbiAgICAgIHJldHVybiB0aGlzLl9nZXRMaXRlcmFsRmFjdG9yeShcbiAgICAgICAgICBrZXksIGxpdGVyYWwuZW50cmllcy5tYXAoZSA9PiBlLnZhbHVlKSxcbiAgICAgICAgICBlbnRyaWVzID0+IG8ubGl0ZXJhbE1hcChlbnRyaWVzLm1hcCgodmFsdWUsIGluZGV4KSA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5OiBsaXRlcmFsLmVudHJpZXNbaW5kZXhdLmtleSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVvdGVkOiBsaXRlcmFsLmVudHJpZXNbaW5kZXhdLnF1b3RlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKSkpO1xuICAgIH1cbiAgfVxuXG4gIC8vIFRPRE86IHVzZVVuaXF1ZU5hbWUoZmFsc2UpIGlzIG5lY2Vzc2FyeSBmb3IgbmFtaW5nIGNvbXBhdGliaWxpdHkgd2l0aFxuICAvLyBUZW1wbGF0ZURlZmluaXRpb25CdWlsZGVyLCBidXQgc2hvdWxkIGJlIHJlbW92ZWQgb25jZSBUZW1wbGF0ZSBQaXBlbGluZSBpcyB0aGUgZGVmYXVsdC5cbiAgZ2V0U2hhcmVkRnVuY3Rpb25SZWZlcmVuY2UoXG4gICAgICBmbjogby5GdW5jdGlvbkV4cHJ8by5BcnJvd0Z1bmN0aW9uRXhwciwgcHJlZml4OiBzdHJpbmcsXG4gICAgICB1c2VVbmlxdWVOYW1lOiBib29sZWFuID0gdHJ1ZSk6IG8uRXhwcmVzc2lvbiB7XG4gICAgY29uc3QgaXNBcnJvdyA9IGZuIGluc3RhbmNlb2Ygby5BcnJvd0Z1bmN0aW9uRXhwcjtcblxuICAgIGZvciAoY29uc3QgY3VycmVudCBvZiB0aGlzLnN0YXRlbWVudHMpIHtcbiAgICAgIC8vIEFycm93IGZ1bmN0aW9ucyBhcmUgc2F2ZWQgYXMgdmFyaWFibGVzIHNvIHdlIGNoZWNrIGlmIHRoZVxuICAgICAgLy8gdmFsdWUgb2YgdGhlIHZhcmlhYmxlIGlzIHRoZSBzYW1lIGFzIHRoZSBhcnJvdyBmdW5jdGlvbi5cbiAgICAgIGlmIChpc0Fycm93ICYmIGN1cnJlbnQgaW5zdGFuY2VvZiBvLkRlY2xhcmVWYXJTdG10ICYmIGN1cnJlbnQudmFsdWU/LmlzRXF1aXZhbGVudChmbikpIHtcbiAgICAgICAgcmV0dXJuIG8udmFyaWFibGUoY3VycmVudC5uYW1lKTtcbiAgICAgIH1cblxuICAgICAgLy8gRnVuY3Rpb24gZGVjbGFyYXRpb25zIGFyZSBzYXZlZCBhcyBmdW5jdGlvbiBzdGF0ZW1lbnRzXG4gICAgICAvLyBzbyB3ZSBjb21wYXJlIHRoZW0gZGlyZWN0bHkgdG8gdGhlIHBhc3NlZC1pbiBmdW5jdGlvbi5cbiAgICAgIGlmICghaXNBcnJvdyAmJiBjdXJyZW50IGluc3RhbmNlb2Ygby5EZWNsYXJlRnVuY3Rpb25TdG10ICYmIGZuLmlzRXF1aXZhbGVudChjdXJyZW50KSkge1xuICAgICAgICByZXR1cm4gby52YXJpYWJsZShjdXJyZW50Lm5hbWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIE90aGVyd2lzZSBkZWNsYXJlIHRoZSBmdW5jdGlvbi5cbiAgICBjb25zdCBuYW1lID0gdXNlVW5pcXVlTmFtZSA/IHRoaXMudW5pcXVlTmFtZShwcmVmaXgpIDogcHJlZml4O1xuICAgIHRoaXMuc3RhdGVtZW50cy5wdXNoKGZuLnRvRGVjbFN0bXQobmFtZSwgby5TdG10TW9kaWZpZXIuRmluYWwpKTtcbiAgICByZXR1cm4gby52YXJpYWJsZShuYW1lKTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldExpdGVyYWxGYWN0b3J5KFxuICAgICAga2V5OiBzdHJpbmcsIHZhbHVlczogby5FeHByZXNzaW9uW10sIHJlc3VsdE1hcDogKHBhcmFtZXRlcnM6IG8uRXhwcmVzc2lvbltdKSA9PiBvLkV4cHJlc3Npb24pOlxuICAgICAge2xpdGVyYWxGYWN0b3J5OiBvLkV4cHJlc3Npb24sIGxpdGVyYWxGYWN0b3J5QXJndW1lbnRzOiBvLkV4cHJlc3Npb25bXX0ge1xuICAgIGxldCBsaXRlcmFsRmFjdG9yeSA9IHRoaXMubGl0ZXJhbEZhY3Rvcmllcy5nZXQoa2V5KTtcbiAgICBjb25zdCBsaXRlcmFsRmFjdG9yeUFyZ3VtZW50cyA9IHZhbHVlcy5maWx0ZXIoKGUgPT4gIWUuaXNDb25zdGFudCgpKSk7XG4gICAgaWYgKCFsaXRlcmFsRmFjdG9yeSkge1xuICAgICAgY29uc3QgcmVzdWx0RXhwcmVzc2lvbnMgPSB2YWx1ZXMubWFwKFxuICAgICAgICAgIChlLCBpbmRleCkgPT4gZS5pc0NvbnN0YW50KCkgPyB0aGlzLmdldENvbnN0TGl0ZXJhbChlLCB0cnVlKSA6IG8udmFyaWFibGUoYGEke2luZGV4fWApKTtcbiAgICAgIGNvbnN0IHBhcmFtZXRlcnMgPVxuICAgICAgICAgIHJlc3VsdEV4cHJlc3Npb25zLmZpbHRlcihpc1ZhcmlhYmxlKS5tYXAoZSA9PiBuZXcgby5GblBhcmFtKGUubmFtZSEsIG8uRFlOQU1JQ19UWVBFKSk7XG4gICAgICBjb25zdCBwdXJlRnVuY3Rpb25EZWNsYXJhdGlvbiA9XG4gICAgICAgICAgby5hcnJvd0ZuKHBhcmFtZXRlcnMsIHJlc3VsdE1hcChyZXN1bHRFeHByZXNzaW9ucyksIG8uSU5GRVJSRURfVFlQRSk7XG4gICAgICBjb25zdCBuYW1lID0gdGhpcy5mcmVzaE5hbWUoKTtcbiAgICAgIHRoaXMuc3RhdGVtZW50cy5wdXNoKG8udmFyaWFibGUobmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc2V0KHB1cmVGdW5jdGlvbkRlY2xhcmF0aW9uKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50b0RlY2xTdG10KG8uSU5GRVJSRURfVFlQRSwgby5TdG10TW9kaWZpZXIuRmluYWwpKTtcbiAgICAgIGxpdGVyYWxGYWN0b3J5ID0gby52YXJpYWJsZShuYW1lKTtcbiAgICAgIHRoaXMubGl0ZXJhbEZhY3Rvcmllcy5zZXQoa2V5LCBsaXRlcmFsRmFjdG9yeSk7XG4gICAgfVxuICAgIHJldHVybiB7bGl0ZXJhbEZhY3RvcnksIGxpdGVyYWxGYWN0b3J5QXJndW1lbnRzfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9kdWNlIGEgdW5pcXVlIG5hbWUgaW4gdGhlIGNvbnRleHQgb2YgdGhpcyBwb29sLlxuICAgKlxuICAgKiBUaGUgbmFtZSBtaWdodCBiZSB1bmlxdWUgYW1vbmcgZGlmZmVyZW50IHByZWZpeGVzIGlmIGFueSBvZiB0aGUgcHJlZml4ZXMgZW5kIGluXG4gICAqIGEgZGlnaXQgc28gdGhlIHByZWZpeCBzaG91bGQgYmUgYSBjb25zdGFudCBzdHJpbmcgKG5vdCBiYXNlZCBvbiB1c2VyIGlucHV0KSBhbmRcbiAgICogbXVzdCBub3QgZW5kIGluIGEgZGlnaXQuXG4gICAqL1xuICB1bmlxdWVOYW1lKG5hbWU6IHN0cmluZywgYWx3YXlzSW5jbHVkZVN1ZmZpeCA9IHRydWUpOiBzdHJpbmcge1xuICAgIGNvbnN0IGNvdW50ID0gdGhpcy5fY2xhaW1lZE5hbWVzLmdldChuYW1lKSA/PyAwO1xuICAgIGNvbnN0IHJlc3VsdCA9IGNvdW50ID09PSAwICYmICFhbHdheXNJbmNsdWRlU3VmZml4ID8gYCR7bmFtZX1gIDogYCR7bmFtZX0ke2NvdW50fWA7XG5cbiAgICB0aGlzLl9jbGFpbWVkTmFtZXMuc2V0KG5hbWUsIGNvdW50ICsgMSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHByaXZhdGUgZnJlc2hOYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMudW5pcXVlTmFtZShDT05TVEFOVF9QUkVGSVgpO1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRXhwcmVzc2lvbktleUZuIHtcbiAga2V5T2YoZXhwcjogby5FeHByZXNzaW9uKTogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFNoYXJlZENvbnN0YW50RGVmaW5pdGlvbiBleHRlbmRzIEV4cHJlc3Npb25LZXlGbiB7XG4gIHRvU2hhcmVkQ29uc3RhbnREZWNsYXJhdGlvbihkZWNsTmFtZTogc3RyaW5nLCBrZXlFeHByOiBvLkV4cHJlc3Npb24pOiBvLlN0YXRlbWVudDtcbn1cblxuZXhwb3J0IGNsYXNzIEdlbmVyaWNLZXlGbiBpbXBsZW1lbnRzIEV4cHJlc3Npb25LZXlGbiB7XG4gIHN0YXRpYyByZWFkb25seSBJTlNUQU5DRSA9IG5ldyBHZW5lcmljS2V5Rm4oKTtcblxuICBrZXlPZihleHByOiBvLkV4cHJlc3Npb24pOiBzdHJpbmcge1xuICAgIGlmIChleHByIGluc3RhbmNlb2Ygby5MaXRlcmFsRXhwciAmJiB0eXBlb2YgZXhwci52YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiBgXCIke2V4cHIudmFsdWV9XCJgO1xuICAgIH0gZWxzZSBpZiAoZXhwciBpbnN0YW5jZW9mIG8uTGl0ZXJhbEV4cHIpIHtcbiAgICAgIHJldHVybiBTdHJpbmcoZXhwci52YWx1ZSk7XG4gICAgfSBlbHNlIGlmIChleHByIGluc3RhbmNlb2Ygby5MaXRlcmFsQXJyYXlFeHByKSB7XG4gICAgICBjb25zdCBlbnRyaWVzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBleHByLmVudHJpZXMpIHtcbiAgICAgICAgZW50cmllcy5wdXNoKHRoaXMua2V5T2YoZW50cnkpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBgWyR7ZW50cmllcy5qb2luKCcsJyl9XWA7XG4gICAgfSBlbHNlIGlmIChleHByIGluc3RhbmNlb2Ygby5MaXRlcmFsTWFwRXhwcikge1xuICAgICAgY29uc3QgZW50cmllczogc3RyaW5nW10gPSBbXTtcbiAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgZXhwci5lbnRyaWVzKSB7XG4gICAgICAgIGxldCBrZXkgPSBlbnRyeS5rZXk7XG4gICAgICAgIGlmIChlbnRyeS5xdW90ZWQpIHtcbiAgICAgICAgICBrZXkgPSBgXCIke2tleX1cImA7XG4gICAgICAgIH1cbiAgICAgICAgZW50cmllcy5wdXNoKGtleSArICc6JyArIHRoaXMua2V5T2YoZW50cnkudmFsdWUpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBgeyR7ZW50cmllcy5qb2luKCcsJyl9fWA7XG4gICAgfSBlbHNlIGlmIChleHByIGluc3RhbmNlb2Ygby5FeHRlcm5hbEV4cHIpIHtcbiAgICAgIHJldHVybiBgaW1wb3J0KFwiJHtleHByLnZhbHVlLm1vZHVsZU5hbWV9XCIsICR7ZXhwci52YWx1ZS5uYW1lfSlgO1xuICAgIH0gZWxzZSBpZiAoZXhwciBpbnN0YW5jZW9mIG8uUmVhZFZhckV4cHIpIHtcbiAgICAgIHJldHVybiBgcmVhZCgke2V4cHIubmFtZX0pYDtcbiAgICB9IGVsc2UgaWYgKGV4cHIgaW5zdGFuY2VvZiBvLlR5cGVvZkV4cHIpIHtcbiAgICAgIHJldHVybiBgdHlwZW9mKCR7dGhpcy5rZXlPZihleHByLmV4cHIpfSlgO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYCR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfSBkb2VzIG5vdCBoYW5kbGUgZXhwcmVzc2lvbnMgb2YgdHlwZSAke2V4cHIuY29uc3RydWN0b3IubmFtZX1gKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNWYXJpYWJsZShlOiBvLkV4cHJlc3Npb24pOiBlIGlzIG8uUmVhZFZhckV4cHIge1xuICByZXR1cm4gZSBpbnN0YW5jZW9mIG8uUmVhZFZhckV4cHI7XG59XG5cbmZ1bmN0aW9uIGlzTG9uZ1N0cmluZ0xpdGVyYWwoZXhwcjogby5FeHByZXNzaW9uKTogYm9vbGVhbiB7XG4gIHJldHVybiBleHByIGluc3RhbmNlb2Ygby5MaXRlcmFsRXhwciAmJiB0eXBlb2YgZXhwci52YWx1ZSA9PT0gJ3N0cmluZycgJiZcbiAgICAgIGV4cHIudmFsdWUubGVuZ3RoID49IFBPT0xfSU5DTFVTSU9OX0xFTkdUSF9USFJFU0hPTERfRk9SX1NUUklOR1M7XG59XG4iXX0=