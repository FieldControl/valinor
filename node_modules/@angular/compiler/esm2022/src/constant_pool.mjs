/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
            const argumentsForKey = literal.entries.map((e) => (e.isConstant() ? e : UNKNOWN_VALUE_KEY));
            const key = GenericKeyFn.INSTANCE.keyOf(o.literalArr(argumentsForKey));
            return this._getLiteralFactory(key, literal.entries, (entries) => o.literalArr(entries));
        }
        else {
            const expressionForKey = o.literalMap(literal.entries.map((e) => ({
                key: e.key,
                value: e.value.isConstant() ? e.value : UNKNOWN_VALUE_KEY,
                quoted: e.quoted,
            })));
            const key = GenericKeyFn.INSTANCE.keyOf(expressionForKey);
            return this._getLiteralFactory(key, literal.entries.map((e) => e.value), (entries) => o.literalMap(entries.map((value, index) => ({
                key: literal.entries[index].key,
                value,
                quoted: literal.entries[index].quoted,
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
            if (!isArrow &&
                current instanceof o.DeclareFunctionStmt &&
                fn instanceof o.FunctionExpr &&
                fn.isEquivalent(current)) {
                return o.variable(current.name);
            }
        }
        // Otherwise declare the function.
        const name = useUniqueName ? this.uniqueName(prefix) : prefix;
        this.statements.push(fn instanceof o.FunctionExpr
            ? fn.toDeclStmt(name, o.StmtModifier.Final)
            : new o.DeclareVarStmt(name, fn, o.INFERRED_TYPE, o.StmtModifier.Final, fn.sourceSpan));
        return o.variable(name);
    }
    _getLiteralFactory(key, values, resultMap) {
        let literalFactory = this.literalFactories.get(key);
        const literalFactoryArguments = values.filter((e) => !e.isConstant());
        if (!literalFactory) {
            const resultExpressions = values.map((e, index) => e.isConstant() ? this.getConstLiteral(e, true) : o.variable(`a${index}`));
            const parameters = resultExpressions
                .filter(isVariable)
                .map((e) => new o.FnParam(e.name, o.DYNAMIC_TYPE));
            const pureFunctionDeclaration = o.arrowFn(parameters, resultMap(resultExpressions), o.INFERRED_TYPE);
            const name = this.freshName();
            this.statements.push(o
                .variable(name)
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
    return (expr instanceof o.LiteralExpr &&
        typeof expr.value === 'string' &&
        expr.value.length >= POOL_INCLUSION_LENGTH_THRESHOLD_FOR_STRINGS);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRfcG9vbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9jb25zdGFudF9wb29sLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sS0FBSyxDQUFDLE1BQU0scUJBQXFCLENBQUM7QUFFekMsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDO0FBRTdCOzs7Ozs7O0dBT0c7QUFDSCxNQUFNLGlCQUFpQixHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7QUFFbEQ7Ozs7O0dBS0c7QUFDSCxNQUFNLFdBQVcsR0FBRyxFQUFFLENBQUM7QUFFdkI7Ozs7R0FJRztBQUNILE1BQU0sMkNBQTJDLEdBQUcsRUFBRSxDQUFDO0FBRXZEOzs7Ozs7O0dBT0c7QUFDSCxNQUFNLGVBQWdCLFNBQVEsQ0FBQyxDQUFDLFVBQVU7SUFLeEMsWUFBbUIsUUFBc0I7UUFDdkMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQURKLGFBQVEsR0FBUixRQUFRLENBQWM7UUFGekMsV0FBTSxHQUFHLEtBQUssQ0FBQztRQUliLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0lBQzNCLENBQUM7SUFFUSxlQUFlLENBQUMsT0FBNEIsRUFBRSxPQUFZO1FBQ2pFLElBQUksT0FBTyxLQUFLLFdBQVcsRUFBRSxDQUFDO1lBQzVCLGdFQUFnRTtZQUNoRSxnQ0FBZ0M7WUFDaEMsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDekQsQ0FBQzthQUFNLENBQUM7WUFDTixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN6RCxDQUFDO0lBQ0gsQ0FBQztJQUVRLFlBQVksQ0FBQyxDQUFlO1FBQ25DLE9B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QUFDLENBQWU7SUFDakMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLFdBQVcsQ0FBQztBQUNwQyxDQUFDO0FBRUQsU0FBUyxtQkFBbUIsQ0FBQyxJQUFrQjtJQUM3QyxPQUFPLENBQ0wsSUFBSSxZQUFZLENBQUMsQ0FBQyxXQUFXO1FBQzdCLE9BQU8sSUFBSSxDQUFDLEtBQUssS0FBSyxRQUFRO1FBQzlCLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLDJDQUEyQyxDQUNqRSxDQUFDO0FBQ0osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgbyBmcm9tICcuL291dHB1dC9vdXRwdXRfYXN0JztcblxuY29uc3QgQ09OU1RBTlRfUFJFRklYID0gJ19jJztcblxuLyoqXG4gKiBgQ29uc3RhbnRQb29sYCB0cmllcyB0byByZXVzZSBsaXRlcmFsIGZhY3RvcmllcyB3aGVuIHR3byBvciBtb3JlIGxpdGVyYWxzIGFyZSBpZGVudGljYWwuXG4gKiBXZSBkZXRlcm1pbmUgd2hldGhlciBsaXRlcmFscyBhcmUgaWRlbnRpY2FsIGJ5IGNyZWF0aW5nIGEga2V5IG91dCBvZiB0aGVpciBBU1QgdXNpbmcgdGhlXG4gKiBgS2V5VmlzaXRvcmAuIFRoaXMgY29uc3RhbnQgaXMgdXNlZCB0byByZXBsYWNlIGR5bmFtaWMgZXhwcmVzc2lvbnMgd2hpY2ggY2FuJ3QgYmUgc2FmZWx5XG4gKiBjb252ZXJ0ZWQgaW50byBhIGtleS4gRS5nLiBnaXZlbiBhbiBleHByZXNzaW9uIGB7Zm9vOiBiYXIoKX1gLCBzaW5jZSB3ZSBkb24ndCBrbm93IHdoYXRcbiAqIHRoZSByZXN1bHQgb2YgYGJhcmAgd2lsbCBiZSwgd2UgY3JlYXRlIGEga2V5IHRoYXQgbG9va3MgbGlrZSBge2ZvbzogPHVua25vd24+fWAuIE5vdGVcbiAqIHRoYXQgd2UgdXNlIGEgdmFyaWFibGUsIHJhdGhlciB0aGFuIHNvbWV0aGluZyBsaWtlIGBudWxsYCBpbiBvcmRlciB0byBhdm9pZCBjb2xsaXNpb25zLlxuICovXG5jb25zdCBVTktOT1dOX1ZBTFVFX0tFWSA9IG8udmFyaWFibGUoJzx1bmtub3duPicpO1xuXG4vKipcbiAqIENvbnRleHQgdG8gdXNlIHdoZW4gcHJvZHVjaW5nIGEga2V5LlxuICpcbiAqIFRoaXMgZW5zdXJlcyB3ZSBzZWUgdGhlIGNvbnN0YW50IG5vdCB0aGUgcmVmZXJlbmNlIHZhcmlhYmxlIHdoZW4gcHJvZHVjaW5nXG4gKiBhIGtleS5cbiAqL1xuY29uc3QgS0VZX0NPTlRFWFQgPSB7fTtcblxuLyoqXG4gKiBHZW5lcmFsbHkgYWxsIHByaW1pdGl2ZSB2YWx1ZXMgYXJlIGV4Y2x1ZGVkIGZyb20gdGhlIGBDb25zdGFudFBvb2xgLCBidXQgdGhlcmUgaXMgYW4gZXhjbHVzaW9uXG4gKiBmb3Igc3RyaW5ncyB0aGF0IHJlYWNoIGEgY2VydGFpbiBsZW5ndGggdGhyZXNob2xkLiBUaGlzIGNvbnN0YW50IGRlZmluZXMgdGhlIGxlbmd0aCB0aHJlc2hvbGQgZm9yXG4gKiBzdHJpbmdzLlxuICovXG5jb25zdCBQT09MX0lOQ0xVU0lPTl9MRU5HVEhfVEhSRVNIT0xEX0ZPUl9TVFJJTkdTID0gNTA7XG5cbi8qKlxuICogQSBub2RlIHRoYXQgaXMgYSBwbGFjZS1ob2xkZXIgdGhhdCBhbGxvd3MgdGhlIG5vZGUgdG8gYmUgcmVwbGFjZWQgd2hlbiB0aGUgYWN0dWFsXG4gKiBub2RlIGlzIGtub3duLlxuICpcbiAqIFRoaXMgYWxsb3dzIHRoZSBjb25zdGFudCBwb29sIHRvIGNoYW5nZSBhbiBleHByZXNzaW9uIGZyb20gYSBkaXJlY3QgcmVmZXJlbmNlIHRvXG4gKiBhIGNvbnN0YW50IHRvIGEgc2hhcmVkIGNvbnN0YW50LiBJdCByZXR1cm5zIGEgZml4LXVwIG5vZGUgdGhhdCBpcyBsYXRlciBhbGxvd2VkIHRvXG4gKiBjaGFuZ2UgdGhlIHJlZmVyZW5jZWQgZXhwcmVzc2lvbi5cbiAqL1xuY2xhc3MgRml4dXBFeHByZXNzaW9uIGV4dGVuZHMgby5FeHByZXNzaW9uIHtcbiAgcHJpdmF0ZSBvcmlnaW5hbDogby5FeHByZXNzaW9uO1xuXG4gIHNoYXJlZCA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyByZXNvbHZlZDogby5FeHByZXNzaW9uKSB7XG4gICAgc3VwZXIocmVzb2x2ZWQudHlwZSk7XG4gICAgdGhpcy5vcmlnaW5hbCA9IHJlc29sdmVkO1xuICB9XG5cbiAgb3ZlcnJpZGUgdmlzaXRFeHByZXNzaW9uKHZpc2l0b3I6IG8uRXhwcmVzc2lvblZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgaWYgKGNvbnRleHQgPT09IEtFWV9DT05URVhUKSB7XG4gICAgICAvLyBXaGVuIHByb2R1Y2luZyBhIGtleSB3ZSB3YW50IHRvIHRyYXZlcnNlIHRoZSBjb25zdGFudCBub3QgdGhlXG4gICAgICAvLyB2YXJpYWJsZSB1c2VkIHRvIHJlZmVyIHRvIGl0LlxuICAgICAgcmV0dXJuIHRoaXMub3JpZ2luYWwudmlzaXRFeHByZXNzaW9uKHZpc2l0b3IsIGNvbnRleHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5yZXNvbHZlZC52aXNpdEV4cHJlc3Npb24odmlzaXRvciwgY29udGV4dCk7XG4gICAgfVxuICB9XG5cbiAgb3ZlcnJpZGUgaXNFcXVpdmFsZW50KGU6IG8uRXhwcmVzc2lvbik6IGJvb2xlYW4ge1xuICAgIHJldHVybiBlIGluc3RhbmNlb2YgRml4dXBFeHByZXNzaW9uICYmIHRoaXMucmVzb2x2ZWQuaXNFcXVpdmFsZW50KGUucmVzb2x2ZWQpO1xuICB9XG5cbiAgb3ZlcnJpZGUgaXNDb25zdGFudCgpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIG92ZXJyaWRlIGNsb25lKCk6IEZpeHVwRXhwcmVzc2lvbiB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBOb3Qgc3VwcG9ydGVkLmApO1xuICB9XG5cbiAgZml4dXAoZXhwcmVzc2lvbjogby5FeHByZXNzaW9uKSB7XG4gICAgdGhpcy5yZXNvbHZlZCA9IGV4cHJlc3Npb247XG4gICAgdGhpcy5zaGFyZWQgPSB0cnVlO1xuICB9XG59XG5cbi8qKlxuICogQSBjb25zdGFudCBwb29sIGFsbG93cyBhIGNvZGUgZW1pdHRlciB0byBzaGFyZSBjb25zdGFudCBpbiBhbiBvdXRwdXQgY29udGV4dC5cbiAqXG4gKiBUaGUgY29uc3RhbnQgcG9vbCBhbHNvIHN1cHBvcnRzIHNoYXJpbmcgYWNjZXNzIHRvIGl2eSBkZWZpbml0aW9ucyByZWZlcmVuY2VzLlxuICovXG5leHBvcnQgY2xhc3MgQ29uc3RhbnRQb29sIHtcbiAgc3RhdGVtZW50czogby5TdGF0ZW1lbnRbXSA9IFtdO1xuICBwcml2YXRlIGxpdGVyYWxzID0gbmV3IE1hcDxzdHJpbmcsIEZpeHVwRXhwcmVzc2lvbj4oKTtcbiAgcHJpdmF0ZSBsaXRlcmFsRmFjdG9yaWVzID0gbmV3IE1hcDxzdHJpbmcsIG8uRXhwcmVzc2lvbj4oKTtcbiAgcHJpdmF0ZSBzaGFyZWRDb25zdGFudHMgPSBuZXcgTWFwPHN0cmluZywgby5FeHByZXNzaW9uPigpO1xuXG4gIC8qKlxuICAgKiBDb25zdGFudCBwb29sIGFsc28gdHJhY2tzIGNsYWltZWQgbmFtZXMgZnJvbSB7QGxpbmsgdW5pcXVlTmFtZX0uXG4gICAqIFRoaXMgaXMgdXNlZnVsIHRvIGF2b2lkIGNvbGxpc2lvbnMgaWYgdmFyaWFibGVzIGFyZSBpbnRlbmRlZCB0byBiZVxuICAgKiBuYW1lZCBhIGNlcnRhaW4gd2F5LSBidXQgbWF5IGNvbmZsaWN0LiBXZSB3b3VsZG4ndCB3YW50IHRvIGFsd2F5cyBzdWZmaXhcbiAgICogdGhlbSB3aXRoIHVuaXF1ZSBudW1iZXJzLlxuICAgKi9cbiAgcHJpdmF0ZSBfY2xhaW1lZE5hbWVzID0gbmV3IE1hcDxzdHJpbmcsIG51bWJlcj4oKTtcblxuICBwcml2YXRlIG5leHROYW1lSW5kZXggPSAwO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgaXNDbG9zdXJlQ29tcGlsZXJFbmFibGVkOiBib29sZWFuID0gZmFsc2UpIHt9XG5cbiAgZ2V0Q29uc3RMaXRlcmFsKGxpdGVyYWw6IG8uRXhwcmVzc2lvbiwgZm9yY2VTaGFyZWQ/OiBib29sZWFuKTogby5FeHByZXNzaW9uIHtcbiAgICBpZiAoXG4gICAgICAobGl0ZXJhbCBpbnN0YW5jZW9mIG8uTGl0ZXJhbEV4cHIgJiYgIWlzTG9uZ1N0cmluZ0xpdGVyYWwobGl0ZXJhbCkpIHx8XG4gICAgICBsaXRlcmFsIGluc3RhbmNlb2YgRml4dXBFeHByZXNzaW9uXG4gICAgKSB7XG4gICAgICAvLyBEbyBubyBwdXQgc2ltcGxlIGxpdGVyYWxzIGludG8gdGhlIGNvbnN0YW50IHBvb2wgb3IgdHJ5IHRvIHByb2R1Y2UgYSBjb25zdGFudCBmb3IgYVxuICAgICAgLy8gcmVmZXJlbmNlIHRvIGEgY29uc3RhbnQuXG4gICAgICByZXR1cm4gbGl0ZXJhbDtcbiAgICB9XG4gICAgY29uc3Qga2V5ID0gR2VuZXJpY0tleUZuLklOU1RBTkNFLmtleU9mKGxpdGVyYWwpO1xuICAgIGxldCBmaXh1cCA9IHRoaXMubGl0ZXJhbHMuZ2V0KGtleSk7XG4gICAgbGV0IG5ld1ZhbHVlID0gZmFsc2U7XG4gICAgaWYgKCFmaXh1cCkge1xuICAgICAgZml4dXAgPSBuZXcgRml4dXBFeHByZXNzaW9uKGxpdGVyYWwpO1xuICAgICAgdGhpcy5saXRlcmFscy5zZXQoa2V5LCBmaXh1cCk7XG4gICAgICBuZXdWYWx1ZSA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKCghbmV3VmFsdWUgJiYgIWZpeHVwLnNoYXJlZCkgfHwgKG5ld1ZhbHVlICYmIGZvcmNlU2hhcmVkKSkge1xuICAgICAgLy8gUmVwbGFjZSB0aGUgZXhwcmVzc2lvbiB3aXRoIGEgdmFyaWFibGVcbiAgICAgIGNvbnN0IG5hbWUgPSB0aGlzLmZyZXNoTmFtZSgpO1xuICAgICAgbGV0IGRlZmluaXRpb246IG8uV3JpdGVWYXJFeHByO1xuICAgICAgbGV0IHVzYWdlOiBvLkV4cHJlc3Npb247XG4gICAgICBpZiAodGhpcy5pc0Nsb3N1cmVDb21waWxlckVuYWJsZWQgJiYgaXNMb25nU3RyaW5nTGl0ZXJhbChsaXRlcmFsKSkge1xuICAgICAgICAvLyBGb3Igc3RyaW5nIGxpdGVyYWxzLCBDbG9zdXJlIHdpbGwgKiphbHdheXMqKiBpbmxpbmUgdGhlIHN0cmluZyBhdFxuICAgICAgICAvLyAqKmFsbCoqIHVzYWdlcywgZHVwbGljYXRpbmcgaXQgZWFjaCB0aW1lLiBGb3IgbGFyZ2Ugc3RyaW5ncywgdGhpc1xuICAgICAgICAvLyB1bm5lY2Vzc2FyaWx5IGJsb2F0cyBidW5kbGUgc2l6ZS4gVG8gd29yayBhcm91bmQgdGhpcyByZXN0cmljdGlvbiwgd2VcbiAgICAgICAgLy8gd3JhcCB0aGUgc3RyaW5nIGluIGEgZnVuY3Rpb24sIGFuZCBjYWxsIHRoYXQgZnVuY3Rpb24gZm9yIGVhY2ggdXNhZ2UuXG4gICAgICAgIC8vIFRoaXMgdHJpY2tzIENsb3N1cmUgaW50byB1c2luZyBpbmxpbmUgbG9naWMgZm9yIGZ1bmN0aW9ucyBpbnN0ZWFkIG9mXG4gICAgICAgIC8vIHN0cmluZyBsaXRlcmFscy4gRnVuY3Rpb24gY2FsbHMgYXJlIG9ubHkgaW5saW5lZCBpZiB0aGUgYm9keSBpcyBzbWFsbFxuICAgICAgICAvLyBlbm91Z2ggdG8gYmUgd29ydGggaXQuIEJ5IGRvaW5nIHRoaXMsIHZlcnkgbGFyZ2Ugc3RyaW5ncyB3aWxsIGJlXG4gICAgICAgIC8vIHNoYXJlZCBhY3Jvc3MgbXVsdGlwbGUgdXNhZ2VzLCByYXRoZXIgdGhhbiBkdXBsaWNhdGluZyB0aGUgc3RyaW5nIGF0XG4gICAgICAgIC8vIGVhY2ggdXNhZ2Ugc2l0ZS5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gY29uc3QgbXlTdHIgPSBmdW5jdGlvbigpIHsgcmV0dXJuIFwidmVyeSB2ZXJ5IHZlcnkgbG9uZyBzdHJpbmdcIjsgfTtcbiAgICAgICAgLy8gY29uc3QgdXNhZ2UxID0gbXlTdHIoKTtcbiAgICAgICAgLy8gY29uc3QgdXNhZ2UyID0gbXlTdHIoKTtcbiAgICAgICAgZGVmaW5pdGlvbiA9IG8udmFyaWFibGUobmFtZSkuc2V0KFxuICAgICAgICAgIG5ldyBvLkZ1bmN0aW9uRXhwcihcbiAgICAgICAgICAgIFtdLCAvLyBQYXJhbXMuXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgIC8vIFN0YXRlbWVudHMuXG4gICAgICAgICAgICAgIG5ldyBvLlJldHVyblN0YXRlbWVudChsaXRlcmFsKSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgKSxcbiAgICAgICAgKTtcbiAgICAgICAgdXNhZ2UgPSBvLnZhcmlhYmxlKG5hbWUpLmNhbGxGbihbXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBKdXN0IGRlY2xhcmUgYW5kIHVzZSB0aGUgdmFyaWFibGUgZGlyZWN0bHksIHdpdGhvdXQgYSBmdW5jdGlvbiBjYWxsXG4gICAgICAgIC8vIGluZGlyZWN0aW9uLiBUaGlzIHNhdmVzIGEgZmV3IGJ5dGVzIGFuZCBhdm9pZHMgYW4gdW5uZWNlc3NhcnkgY2FsbC5cbiAgICAgICAgZGVmaW5pdGlvbiA9IG8udmFyaWFibGUobmFtZSkuc2V0KGxpdGVyYWwpO1xuICAgICAgICB1c2FnZSA9IG8udmFyaWFibGUobmFtZSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc3RhdGVtZW50cy5wdXNoKGRlZmluaXRpb24udG9EZWNsU3RtdChvLklORkVSUkVEX1RZUEUsIG8uU3RtdE1vZGlmaWVyLkZpbmFsKSk7XG4gICAgICBmaXh1cC5maXh1cCh1c2FnZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZpeHVwO1xuICB9XG5cbiAgZ2V0U2hhcmVkQ29uc3RhbnQoZGVmOiBTaGFyZWRDb25zdGFudERlZmluaXRpb24sIGV4cHI6IG8uRXhwcmVzc2lvbik6IG8uRXhwcmVzc2lvbiB7XG4gICAgY29uc3Qga2V5ID0gZGVmLmtleU9mKGV4cHIpO1xuICAgIGlmICghdGhpcy5zaGFyZWRDb25zdGFudHMuaGFzKGtleSkpIHtcbiAgICAgIGNvbnN0IGlkID0gdGhpcy5mcmVzaE5hbWUoKTtcbiAgICAgIHRoaXMuc2hhcmVkQ29uc3RhbnRzLnNldChrZXksIG8udmFyaWFibGUoaWQpKTtcbiAgICAgIHRoaXMuc3RhdGVtZW50cy5wdXNoKGRlZi50b1NoYXJlZENvbnN0YW50RGVjbGFyYXRpb24oaWQsIGV4cHIpKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuc2hhcmVkQ29uc3RhbnRzLmdldChrZXkpITtcbiAgfVxuXG4gIGdldExpdGVyYWxGYWN0b3J5KGxpdGVyYWw6IG8uTGl0ZXJhbEFycmF5RXhwciB8IG8uTGl0ZXJhbE1hcEV4cHIpOiB7XG4gICAgbGl0ZXJhbEZhY3Rvcnk6IG8uRXhwcmVzc2lvbjtcbiAgICBsaXRlcmFsRmFjdG9yeUFyZ3VtZW50czogby5FeHByZXNzaW9uW107XG4gIH0ge1xuICAgIC8vIENyZWF0ZSBhIHB1cmUgZnVuY3Rpb24gdGhhdCBidWlsZHMgYW4gYXJyYXkgb2YgYSBtaXggb2YgY29uc3RhbnQgYW5kIHZhcmlhYmxlIGV4cHJlc3Npb25zXG4gICAgaWYgKGxpdGVyYWwgaW5zdGFuY2VvZiBvLkxpdGVyYWxBcnJheUV4cHIpIHtcbiAgICAgIGNvbnN0IGFyZ3VtZW50c0ZvcktleSA9IGxpdGVyYWwuZW50cmllcy5tYXAoKGUpID0+IChlLmlzQ29uc3RhbnQoKSA/IGUgOiBVTktOT1dOX1ZBTFVFX0tFWSkpO1xuICAgICAgY29uc3Qga2V5ID0gR2VuZXJpY0tleUZuLklOU1RBTkNFLmtleU9mKG8ubGl0ZXJhbEFycihhcmd1bWVudHNGb3JLZXkpKTtcbiAgICAgIHJldHVybiB0aGlzLl9nZXRMaXRlcmFsRmFjdG9yeShrZXksIGxpdGVyYWwuZW50cmllcywgKGVudHJpZXMpID0+IG8ubGl0ZXJhbEFycihlbnRyaWVzKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGV4cHJlc3Npb25Gb3JLZXkgPSBvLmxpdGVyYWxNYXAoXG4gICAgICAgIGxpdGVyYWwuZW50cmllcy5tYXAoKGUpID0+ICh7XG4gICAgICAgICAga2V5OiBlLmtleSxcbiAgICAgICAgICB2YWx1ZTogZS52YWx1ZS5pc0NvbnN0YW50KCkgPyBlLnZhbHVlIDogVU5LTk9XTl9WQUxVRV9LRVksXG4gICAgICAgICAgcXVvdGVkOiBlLnF1b3RlZCxcbiAgICAgICAgfSkpLFxuICAgICAgKTtcbiAgICAgIGNvbnN0IGtleSA9IEdlbmVyaWNLZXlGbi5JTlNUQU5DRS5rZXlPZihleHByZXNzaW9uRm9yS2V5KTtcbiAgICAgIHJldHVybiB0aGlzLl9nZXRMaXRlcmFsRmFjdG9yeShcbiAgICAgICAga2V5LFxuICAgICAgICBsaXRlcmFsLmVudHJpZXMubWFwKChlKSA9PiBlLnZhbHVlKSxcbiAgICAgICAgKGVudHJpZXMpID0+XG4gICAgICAgICAgby5saXRlcmFsTWFwKFxuICAgICAgICAgICAgZW50cmllcy5tYXAoKHZhbHVlLCBpbmRleCkgPT4gKHtcbiAgICAgICAgICAgICAga2V5OiBsaXRlcmFsLmVudHJpZXNbaW5kZXhdLmtleSxcbiAgICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICAgIHF1b3RlZDogbGl0ZXJhbC5lbnRyaWVzW2luZGV4XS5xdW90ZWQsXG4gICAgICAgICAgICB9KSksXG4gICAgICAgICAgKSxcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLy8gVE9ETzogdXNlVW5pcXVlTmFtZShmYWxzZSkgaXMgbmVjZXNzYXJ5IGZvciBuYW1pbmcgY29tcGF0aWJpbGl0eSB3aXRoXG4gIC8vIFRlbXBsYXRlRGVmaW5pdGlvbkJ1aWxkZXIsIGJ1dCBzaG91bGQgYmUgcmVtb3ZlZCBvbmNlIFRlbXBsYXRlIFBpcGVsaW5lIGlzIHRoZSBkZWZhdWx0LlxuICBnZXRTaGFyZWRGdW5jdGlvblJlZmVyZW5jZShcbiAgICBmbjogby5FeHByZXNzaW9uLFxuICAgIHByZWZpeDogc3RyaW5nLFxuICAgIHVzZVVuaXF1ZU5hbWU6IGJvb2xlYW4gPSB0cnVlLFxuICApOiBvLkV4cHJlc3Npb24ge1xuICAgIGNvbnN0IGlzQXJyb3cgPSBmbiBpbnN0YW5jZW9mIG8uQXJyb3dGdW5jdGlvbkV4cHI7XG5cbiAgICBmb3IgKGNvbnN0IGN1cnJlbnQgb2YgdGhpcy5zdGF0ZW1lbnRzKSB7XG4gICAgICAvLyBBcnJvdyBmdW5jdGlvbnMgYXJlIHNhdmVkIGFzIHZhcmlhYmxlcyBzbyB3ZSBjaGVjayBpZiB0aGVcbiAgICAgIC8vIHZhbHVlIG9mIHRoZSB2YXJpYWJsZSBpcyB0aGUgc2FtZSBhcyB0aGUgYXJyb3cgZnVuY3Rpb24uXG4gICAgICBpZiAoaXNBcnJvdyAmJiBjdXJyZW50IGluc3RhbmNlb2Ygby5EZWNsYXJlVmFyU3RtdCAmJiBjdXJyZW50LnZhbHVlPy5pc0VxdWl2YWxlbnQoZm4pKSB7XG4gICAgICAgIHJldHVybiBvLnZhcmlhYmxlKGN1cnJlbnQubmFtZSk7XG4gICAgICB9XG5cbiAgICAgIC8vIEZ1bmN0aW9uIGRlY2xhcmF0aW9ucyBhcmUgc2F2ZWQgYXMgZnVuY3Rpb24gc3RhdGVtZW50c1xuICAgICAgLy8gc28gd2UgY29tcGFyZSB0aGVtIGRpcmVjdGx5IHRvIHRoZSBwYXNzZWQtaW4gZnVuY3Rpb24uXG4gICAgICBpZiAoXG4gICAgICAgICFpc0Fycm93ICYmXG4gICAgICAgIGN1cnJlbnQgaW5zdGFuY2VvZiBvLkRlY2xhcmVGdW5jdGlvblN0bXQgJiZcbiAgICAgICAgZm4gaW5zdGFuY2VvZiBvLkZ1bmN0aW9uRXhwciAmJlxuICAgICAgICBmbi5pc0VxdWl2YWxlbnQoY3VycmVudClcbiAgICAgICkge1xuICAgICAgICByZXR1cm4gby52YXJpYWJsZShjdXJyZW50Lm5hbWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIE90aGVyd2lzZSBkZWNsYXJlIHRoZSBmdW5jdGlvbi5cbiAgICBjb25zdCBuYW1lID0gdXNlVW5pcXVlTmFtZSA/IHRoaXMudW5pcXVlTmFtZShwcmVmaXgpIDogcHJlZml4O1xuICAgIHRoaXMuc3RhdGVtZW50cy5wdXNoKFxuICAgICAgZm4gaW5zdGFuY2VvZiBvLkZ1bmN0aW9uRXhwclxuICAgICAgICA/IGZuLnRvRGVjbFN0bXQobmFtZSwgby5TdG10TW9kaWZpZXIuRmluYWwpXG4gICAgICAgIDogbmV3IG8uRGVjbGFyZVZhclN0bXQobmFtZSwgZm4sIG8uSU5GRVJSRURfVFlQRSwgby5TdG10TW9kaWZpZXIuRmluYWwsIGZuLnNvdXJjZVNwYW4pLFxuICAgICk7XG4gICAgcmV0dXJuIG8udmFyaWFibGUobmFtZSk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRMaXRlcmFsRmFjdG9yeShcbiAgICBrZXk6IHN0cmluZyxcbiAgICB2YWx1ZXM6IG8uRXhwcmVzc2lvbltdLFxuICAgIHJlc3VsdE1hcDogKHBhcmFtZXRlcnM6IG8uRXhwcmVzc2lvbltdKSA9PiBvLkV4cHJlc3Npb24sXG4gICk6IHtsaXRlcmFsRmFjdG9yeTogby5FeHByZXNzaW9uOyBsaXRlcmFsRmFjdG9yeUFyZ3VtZW50czogby5FeHByZXNzaW9uW119IHtcbiAgICBsZXQgbGl0ZXJhbEZhY3RvcnkgPSB0aGlzLmxpdGVyYWxGYWN0b3JpZXMuZ2V0KGtleSk7XG4gICAgY29uc3QgbGl0ZXJhbEZhY3RvcnlBcmd1bWVudHMgPSB2YWx1ZXMuZmlsdGVyKChlKSA9PiAhZS5pc0NvbnN0YW50KCkpO1xuICAgIGlmICghbGl0ZXJhbEZhY3RvcnkpIHtcbiAgICAgIGNvbnN0IHJlc3VsdEV4cHJlc3Npb25zID0gdmFsdWVzLm1hcCgoZSwgaW5kZXgpID0+XG4gICAgICAgIGUuaXNDb25zdGFudCgpID8gdGhpcy5nZXRDb25zdExpdGVyYWwoZSwgdHJ1ZSkgOiBvLnZhcmlhYmxlKGBhJHtpbmRleH1gKSxcbiAgICAgICk7XG4gICAgICBjb25zdCBwYXJhbWV0ZXJzID0gcmVzdWx0RXhwcmVzc2lvbnNcbiAgICAgICAgLmZpbHRlcihpc1ZhcmlhYmxlKVxuICAgICAgICAubWFwKChlKSA9PiBuZXcgby5GblBhcmFtKGUubmFtZSEsIG8uRFlOQU1JQ19UWVBFKSk7XG4gICAgICBjb25zdCBwdXJlRnVuY3Rpb25EZWNsYXJhdGlvbiA9IG8uYXJyb3dGbihcbiAgICAgICAgcGFyYW1ldGVycyxcbiAgICAgICAgcmVzdWx0TWFwKHJlc3VsdEV4cHJlc3Npb25zKSxcbiAgICAgICAgby5JTkZFUlJFRF9UWVBFLFxuICAgICAgKTtcbiAgICAgIGNvbnN0IG5hbWUgPSB0aGlzLmZyZXNoTmFtZSgpO1xuICAgICAgdGhpcy5zdGF0ZW1lbnRzLnB1c2goXG4gICAgICAgIG9cbiAgICAgICAgICAudmFyaWFibGUobmFtZSlcbiAgICAgICAgICAuc2V0KHB1cmVGdW5jdGlvbkRlY2xhcmF0aW9uKVxuICAgICAgICAgIC50b0RlY2xTdG10KG8uSU5GRVJSRURfVFlQRSwgby5TdG10TW9kaWZpZXIuRmluYWwpLFxuICAgICAgKTtcbiAgICAgIGxpdGVyYWxGYWN0b3J5ID0gby52YXJpYWJsZShuYW1lKTtcbiAgICAgIHRoaXMubGl0ZXJhbEZhY3Rvcmllcy5zZXQoa2V5LCBsaXRlcmFsRmFjdG9yeSk7XG4gICAgfVxuICAgIHJldHVybiB7bGl0ZXJhbEZhY3RvcnksIGxpdGVyYWxGYWN0b3J5QXJndW1lbnRzfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9kdWNlIGEgdW5pcXVlIG5hbWUgaW4gdGhlIGNvbnRleHQgb2YgdGhpcyBwb29sLlxuICAgKlxuICAgKiBUaGUgbmFtZSBtaWdodCBiZSB1bmlxdWUgYW1vbmcgZGlmZmVyZW50IHByZWZpeGVzIGlmIGFueSBvZiB0aGUgcHJlZml4ZXMgZW5kIGluXG4gICAqIGEgZGlnaXQgc28gdGhlIHByZWZpeCBzaG91bGQgYmUgYSBjb25zdGFudCBzdHJpbmcgKG5vdCBiYXNlZCBvbiB1c2VyIGlucHV0KSBhbmRcbiAgICogbXVzdCBub3QgZW5kIGluIGEgZGlnaXQuXG4gICAqL1xuICB1bmlxdWVOYW1lKG5hbWU6IHN0cmluZywgYWx3YXlzSW5jbHVkZVN1ZmZpeCA9IHRydWUpOiBzdHJpbmcge1xuICAgIGNvbnN0IGNvdW50ID0gdGhpcy5fY2xhaW1lZE5hbWVzLmdldChuYW1lKSA/PyAwO1xuICAgIGNvbnN0IHJlc3VsdCA9IGNvdW50ID09PSAwICYmICFhbHdheXNJbmNsdWRlU3VmZml4ID8gYCR7bmFtZX1gIDogYCR7bmFtZX0ke2NvdW50fWA7XG5cbiAgICB0aGlzLl9jbGFpbWVkTmFtZXMuc2V0KG5hbWUsIGNvdW50ICsgMSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHByaXZhdGUgZnJlc2hOYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMudW5pcXVlTmFtZShDT05TVEFOVF9QUkVGSVgpO1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRXhwcmVzc2lvbktleUZuIHtcbiAga2V5T2YoZXhwcjogby5FeHByZXNzaW9uKTogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFNoYXJlZENvbnN0YW50RGVmaW5pdGlvbiBleHRlbmRzIEV4cHJlc3Npb25LZXlGbiB7XG4gIHRvU2hhcmVkQ29uc3RhbnREZWNsYXJhdGlvbihkZWNsTmFtZTogc3RyaW5nLCBrZXlFeHByOiBvLkV4cHJlc3Npb24pOiBvLlN0YXRlbWVudDtcbn1cblxuZXhwb3J0IGNsYXNzIEdlbmVyaWNLZXlGbiBpbXBsZW1lbnRzIEV4cHJlc3Npb25LZXlGbiB7XG4gIHN0YXRpYyByZWFkb25seSBJTlNUQU5DRSA9IG5ldyBHZW5lcmljS2V5Rm4oKTtcblxuICBrZXlPZihleHByOiBvLkV4cHJlc3Npb24pOiBzdHJpbmcge1xuICAgIGlmIChleHByIGluc3RhbmNlb2Ygby5MaXRlcmFsRXhwciAmJiB0eXBlb2YgZXhwci52YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiBgXCIke2V4cHIudmFsdWV9XCJgO1xuICAgIH0gZWxzZSBpZiAoZXhwciBpbnN0YW5jZW9mIG8uTGl0ZXJhbEV4cHIpIHtcbiAgICAgIHJldHVybiBTdHJpbmcoZXhwci52YWx1ZSk7XG4gICAgfSBlbHNlIGlmIChleHByIGluc3RhbmNlb2Ygby5MaXRlcmFsQXJyYXlFeHByKSB7XG4gICAgICBjb25zdCBlbnRyaWVzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBleHByLmVudHJpZXMpIHtcbiAgICAgICAgZW50cmllcy5wdXNoKHRoaXMua2V5T2YoZW50cnkpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBgWyR7ZW50cmllcy5qb2luKCcsJyl9XWA7XG4gICAgfSBlbHNlIGlmIChleHByIGluc3RhbmNlb2Ygby5MaXRlcmFsTWFwRXhwcikge1xuICAgICAgY29uc3QgZW50cmllczogc3RyaW5nW10gPSBbXTtcbiAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgZXhwci5lbnRyaWVzKSB7XG4gICAgICAgIGxldCBrZXkgPSBlbnRyeS5rZXk7XG4gICAgICAgIGlmIChlbnRyeS5xdW90ZWQpIHtcbiAgICAgICAgICBrZXkgPSBgXCIke2tleX1cImA7XG4gICAgICAgIH1cbiAgICAgICAgZW50cmllcy5wdXNoKGtleSArICc6JyArIHRoaXMua2V5T2YoZW50cnkudmFsdWUpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBgeyR7ZW50cmllcy5qb2luKCcsJyl9fWA7XG4gICAgfSBlbHNlIGlmIChleHByIGluc3RhbmNlb2Ygby5FeHRlcm5hbEV4cHIpIHtcbiAgICAgIHJldHVybiBgaW1wb3J0KFwiJHtleHByLnZhbHVlLm1vZHVsZU5hbWV9XCIsICR7ZXhwci52YWx1ZS5uYW1lfSlgO1xuICAgIH0gZWxzZSBpZiAoZXhwciBpbnN0YW5jZW9mIG8uUmVhZFZhckV4cHIpIHtcbiAgICAgIHJldHVybiBgcmVhZCgke2V4cHIubmFtZX0pYDtcbiAgICB9IGVsc2UgaWYgKGV4cHIgaW5zdGFuY2VvZiBvLlR5cGVvZkV4cHIpIHtcbiAgICAgIHJldHVybiBgdHlwZW9mKCR7dGhpcy5rZXlPZihleHByLmV4cHIpfSlgO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGAke3RoaXMuY29uc3RydWN0b3IubmFtZX0gZG9lcyBub3QgaGFuZGxlIGV4cHJlc3Npb25zIG9mIHR5cGUgJHtleHByLmNvbnN0cnVjdG9yLm5hbWV9YCxcbiAgICAgICk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGlzVmFyaWFibGUoZTogby5FeHByZXNzaW9uKTogZSBpcyBvLlJlYWRWYXJFeHByIHtcbiAgcmV0dXJuIGUgaW5zdGFuY2VvZiBvLlJlYWRWYXJFeHByO1xufVxuXG5mdW5jdGlvbiBpc0xvbmdTdHJpbmdMaXRlcmFsKGV4cHI6IG8uRXhwcmVzc2lvbik6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgIGV4cHIgaW5zdGFuY2VvZiBvLkxpdGVyYWxFeHByICYmXG4gICAgdHlwZW9mIGV4cHIudmFsdWUgPT09ICdzdHJpbmcnICYmXG4gICAgZXhwci52YWx1ZS5sZW5ndGggPj0gUE9PTF9JTkNMVVNJT05fTEVOR1RIX1RIUkVTSE9MRF9GT1JfU1RSSU5HU1xuICApO1xufVxuIl19