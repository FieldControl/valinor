/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as cdAst from '../expression_parser/ast';
import * as o from '../output/output_ast';
import { ParseSourceSpan } from '../parse_util';
import { Identifiers as R3 } from '../render3/r3_identifiers';
export class EventHandlerVars {
    static { this.event = o.variable('$event'); }
}
/**
 * Converts the given expression AST into an executable output AST, assuming the expression is
 * used in an action binding (e.g. an event handler).
 */
export function convertActionBinding(localResolver, implicitReceiver, action, bindingId, baseSourceSpan, implicitReceiverAccesses, globals) {
    localResolver ??= new DefaultLocalResolver(globals);
    const visitor = new _AstToIrVisitor(localResolver, implicitReceiver, bindingId, /* supportsInterpolation */ false, baseSourceSpan, implicitReceiverAccesses);
    const actionStmts = [];
    flattenStatements(convertActionBuiltins(action).visit(visitor, _Mode.Statement), actionStmts);
    prependTemporaryDecls(visitor.temporaryCount, bindingId, actionStmts);
    if (visitor.usesImplicitReceiver) {
        localResolver.notifyImplicitReceiverUse();
    }
    const lastIndex = actionStmts.length - 1;
    if (lastIndex >= 0) {
        const lastStatement = actionStmts[lastIndex];
        // Ensure that the value of the last expression statement is returned
        if (lastStatement instanceof o.ExpressionStatement) {
            actionStmts[lastIndex] = new o.ReturnStatement(lastStatement.expr);
        }
    }
    return actionStmts;
}
export function convertAssignmentActionBinding(localResolver, implicitReceiver, action, bindingId, baseSourceSpan, implicitReceiverAccesses, globals) {
    localResolver ??= new DefaultLocalResolver(globals);
    const visitor = new _AstToIrVisitor(localResolver, implicitReceiver, bindingId, /* supportsInterpolation */ false, baseSourceSpan, implicitReceiverAccesses);
    let convertedAction = convertActionBuiltins(action).visit(visitor, _Mode.Statement);
    // This should already have been asserted in the parser, but we verify it here just in case.
    if (!(convertedAction instanceof o.ExpressionStatement)) {
        throw new Error(`Illegal state: unsupported expression in two-way action binding.`);
    }
    // Converts `[(ngModel)]="name"` to `twoWayBindingSet(ctx.name, $event) || (ctx.name = $event)`.
    convertedAction = wrapAssignmentAction(convertedAction.expr).toStmt();
    const actionStmts = [];
    flattenStatements(convertedAction, actionStmts);
    prependTemporaryDecls(visitor.temporaryCount, bindingId, actionStmts);
    // Assignment events always return `$event`.
    actionStmts.push(new o.ReturnStatement(EventHandlerVars.event));
    implicitReceiverAccesses?.add(EventHandlerVars.event.name);
    if (visitor.usesImplicitReceiver) {
        localResolver.notifyImplicitReceiverUse();
    }
    return actionStmts;
}
function wrapAssignmentReadExpression(ast) {
    return new o.ExternalExpr(R3.twoWayBindingSet)
        .callFn([ast, EventHandlerVars.event])
        .or(ast.set(EventHandlerVars.event));
}
function isReadExpression(value) {
    return value instanceof o.ReadPropExpr || value instanceof o.ReadKeyExpr;
}
function wrapAssignmentAction(ast) {
    // The only officially supported expressions inside of a two-way binding are read expressions.
    if (isReadExpression(ast)) {
        return wrapAssignmentReadExpression(ast);
    }
    // However, historically the expression parser was handling two-way events by appending `=$event`
    // to the raw string before attempting to parse it. This has led to bugs over the years (see
    // #37809) and to unintentionally supporting unassignable events in the two-way binding. The
    // logic below aims to emulate the old behavior while still supporting the new output format
    // which uses `twoWayBindingSet`. Note that the generated code doesn't necessarily make sense
    // based on what the user wrote, for example the event binding for `[(value)]="a ? b : c"`
    // would produce `ctx.a ? ctx.b : ctx.c = $event`. We aim to reproduce what the parser used
    // to generate before #54154.
    if (ast instanceof o.BinaryOperatorExpr && isReadExpression(ast.rhs)) {
        // `a && b` -> `ctx.a && twoWayBindingSet(ctx.b, $event) || (ctx.b = $event)`
        return new o.BinaryOperatorExpr(ast.operator, ast.lhs, wrapAssignmentReadExpression(ast.rhs));
    }
    // Note: this also supports nullish coalescing expressions which
    // would've been downleveled to ternary expressions by this point.
    if (ast instanceof o.ConditionalExpr && isReadExpression(ast.falseCase)) {
        // `a ? b : c` -> `ctx.a ? ctx.b : twoWayBindingSet(ctx.c, $event) || (ctx.c = $event)`
        return new o.ConditionalExpr(ast.condition, ast.trueCase, wrapAssignmentReadExpression(ast.falseCase));
    }
    // `!!a` -> `twoWayBindingSet(ctx.a, $event) || (ctx.a = $event)`
    // Note: previously we'd actually produce `!!(ctx.a = $event)`, but the wrapping
    // node doesn't affect the result so we don't need to carry it over.
    if (ast instanceof o.NotExpr) {
        let expr = ast.condition;
        while (true) {
            if (expr instanceof o.NotExpr) {
                expr = expr.condition;
            }
            else {
                if (isReadExpression(expr)) {
                    return wrapAssignmentReadExpression(expr);
                }
                break;
            }
        }
    }
    throw new Error(`Illegal state: unsupported expression in two-way action binding.`);
}
function convertPropertyBindingBuiltins(converterFactory, ast) {
    return convertBuiltins(converterFactory, ast);
}
export class ConvertPropertyBindingResult {
    constructor(stmts, currValExpr) {
        this.stmts = stmts;
        this.currValExpr = currValExpr;
    }
}
/**
 * Converts the given expression AST into an executable output AST, assuming the expression
 * is used in property binding. The expression has to be preprocessed via
 * `convertPropertyBindingBuiltins`.
 */
export function convertPropertyBinding(localResolver, implicitReceiver, expressionWithoutBuiltins, bindingId) {
    if (!localResolver) {
        localResolver = new DefaultLocalResolver();
    }
    const visitor = new _AstToIrVisitor(localResolver, implicitReceiver, bindingId, /* supportsInterpolation */ false);
    const outputExpr = expressionWithoutBuiltins.visit(visitor, _Mode.Expression);
    const stmts = getStatementsFromVisitor(visitor, bindingId);
    if (visitor.usesImplicitReceiver) {
        localResolver.notifyImplicitReceiverUse();
    }
    return new ConvertPropertyBindingResult(stmts, outputExpr);
}
/** Converts an AST to a pure function that may have access to the component scope. */
export function convertPureComponentScopeFunction(ast, localResolver, implicitReceiver, bindingId) {
    const converted = convertPropertyBindingBuiltins({
        createLiteralArrayConverter: () => args => o.literalArr(args),
        createLiteralMapConverter: keys => values => o.literalMap(keys.map((key, index) => {
            return ({
                key: key.key,
                value: values[index],
                quoted: key.quoted,
            });
        })),
        createPipeConverter: () => {
            throw new Error('Illegal State: Pipes are not allowed in this context');
        }
    }, ast);
    const visitor = new _AstToIrVisitor(localResolver, implicitReceiver, bindingId, false);
    const statements = [];
    flattenStatements(converted.visit(visitor, _Mode.Statement), statements);
    return statements;
}
/**
 * Given some expression, such as a binding or interpolation expression, and a context expression to
 * look values up on, visit each facet of the given expression resolving values from the context
 * expression such that a list of arguments can be derived from the found values that can be used as
 * arguments to an external update instruction.
 *
 * @param localResolver The resolver to use to look up expressions by name appropriately
 * @param contextVariableExpression The expression representing the context variable used to create
 * the final argument expressions
 * @param expressionWithArgumentsToExtract The expression to visit to figure out what values need to
 * be resolved and what arguments list to build.
 * @param bindingId A name prefix used to create temporary variable names if they're needed for the
 * arguments generated
 * @returns An array of expressions that can be passed as arguments to instruction expressions like
 * `o.importExpr(R3.propertyInterpolate).callFn(result)`
 */
export function convertUpdateArguments(localResolver, contextVariableExpression, expressionWithArgumentsToExtract, bindingId) {
    const visitor = new _AstToIrVisitor(localResolver, contextVariableExpression, bindingId, /* supportsInterpolation */ true);
    const outputExpr = visitor.visitInterpolation(expressionWithArgumentsToExtract, _Mode.Expression);
    if (visitor.usesImplicitReceiver) {
        localResolver.notifyImplicitReceiverUse();
    }
    const stmts = getStatementsFromVisitor(visitor, bindingId);
    const args = outputExpr.args;
    return { stmts, args };
}
function getStatementsFromVisitor(visitor, bindingId) {
    const stmts = [];
    for (let i = 0; i < visitor.temporaryCount; i++) {
        stmts.push(temporaryDeclaration(bindingId, i));
    }
    return stmts;
}
function convertBuiltins(converterFactory, ast) {
    const visitor = new _BuiltinAstConverter(converterFactory);
    return ast.visit(visitor);
}
function convertActionBuiltins(action) {
    const converterFactory = {
        createLiteralArrayConverter: () => {
            // Note: no caching for literal arrays in actions.
            return (args) => o.literalArr(args);
        },
        createLiteralMapConverter: (keys) => {
            // Note: no caching for literal maps in actions.
            return (values) => {
                const entries = keys.map((k, i) => ({
                    key: k.key,
                    value: values[i],
                    quoted: k.quoted,
                }));
                return o.literalMap(entries);
            };
        },
        createPipeConverter: (name) => {
            throw new Error(`Illegal State: Actions are not allowed to contain pipes. Pipe: ${name}`);
        }
    };
    return convertPropertyBindingBuiltins(converterFactory, action);
}
function temporaryName(bindingId, temporaryNumber) {
    return `tmp_${bindingId}_${temporaryNumber}`;
}
function temporaryDeclaration(bindingId, temporaryNumber) {
    return new o.DeclareVarStmt(temporaryName(bindingId, temporaryNumber));
}
function prependTemporaryDecls(temporaryCount, bindingId, statements) {
    for (let i = temporaryCount - 1; i >= 0; i--) {
        statements.unshift(temporaryDeclaration(bindingId, i));
    }
}
var _Mode;
(function (_Mode) {
    _Mode[_Mode["Statement"] = 0] = "Statement";
    _Mode[_Mode["Expression"] = 1] = "Expression";
})(_Mode || (_Mode = {}));
function ensureStatementMode(mode, ast) {
    if (mode !== _Mode.Statement) {
        throw new Error(`Expected a statement, but saw ${ast}`);
    }
}
function ensureExpressionMode(mode, ast) {
    if (mode !== _Mode.Expression) {
        throw new Error(`Expected an expression, but saw ${ast}`);
    }
}
function convertToStatementIfNeeded(mode, expr) {
    if (mode === _Mode.Statement) {
        return expr.toStmt();
    }
    else {
        return expr;
    }
}
class _BuiltinAstConverter extends cdAst.AstTransformer {
    constructor(_converterFactory) {
        super();
        this._converterFactory = _converterFactory;
    }
    visitPipe(ast, context) {
        const args = [ast.exp, ...ast.args].map(ast => ast.visit(this, context));
        return new BuiltinFunctionCall(ast.span, ast.sourceSpan, args, this._converterFactory.createPipeConverter(ast.name, args.length));
    }
    visitLiteralArray(ast, context) {
        const args = ast.expressions.map(ast => ast.visit(this, context));
        return new BuiltinFunctionCall(ast.span, ast.sourceSpan, args, this._converterFactory.createLiteralArrayConverter(ast.expressions.length));
    }
    visitLiteralMap(ast, context) {
        const args = ast.values.map(ast => ast.visit(this, context));
        return new BuiltinFunctionCall(ast.span, ast.sourceSpan, args, this._converterFactory.createLiteralMapConverter(ast.keys));
    }
}
class _AstToIrVisitor {
    constructor(_localResolver, _implicitReceiver, bindingId, supportsInterpolation, baseSourceSpan, implicitReceiverAccesses) {
        this._localResolver = _localResolver;
        this._implicitReceiver = _implicitReceiver;
        this.bindingId = bindingId;
        this.supportsInterpolation = supportsInterpolation;
        this.baseSourceSpan = baseSourceSpan;
        this.implicitReceiverAccesses = implicitReceiverAccesses;
        this._nodeMap = new Map();
        this._resultMap = new Map();
        this._currentTemporary = 0;
        this.temporaryCount = 0;
        this.usesImplicitReceiver = false;
    }
    visitUnary(ast, mode) {
        let op;
        switch (ast.operator) {
            case '+':
                op = o.UnaryOperator.Plus;
                break;
            case '-':
                op = o.UnaryOperator.Minus;
                break;
            default:
                throw new Error(`Unsupported operator ${ast.operator}`);
        }
        return convertToStatementIfNeeded(mode, new o.UnaryOperatorExpr(op, this._visit(ast.expr, _Mode.Expression), undefined, this.convertSourceSpan(ast.span)));
    }
    visitBinary(ast, mode) {
        let op;
        switch (ast.operation) {
            case '+':
                op = o.BinaryOperator.Plus;
                break;
            case '-':
                op = o.BinaryOperator.Minus;
                break;
            case '*':
                op = o.BinaryOperator.Multiply;
                break;
            case '/':
                op = o.BinaryOperator.Divide;
                break;
            case '%':
                op = o.BinaryOperator.Modulo;
                break;
            case '&&':
                op = o.BinaryOperator.And;
                break;
            case '||':
                op = o.BinaryOperator.Or;
                break;
            case '==':
                op = o.BinaryOperator.Equals;
                break;
            case '!=':
                op = o.BinaryOperator.NotEquals;
                break;
            case '===':
                op = o.BinaryOperator.Identical;
                break;
            case '!==':
                op = o.BinaryOperator.NotIdentical;
                break;
            case '<':
                op = o.BinaryOperator.Lower;
                break;
            case '>':
                op = o.BinaryOperator.Bigger;
                break;
            case '<=':
                op = o.BinaryOperator.LowerEquals;
                break;
            case '>=':
                op = o.BinaryOperator.BiggerEquals;
                break;
            case '??':
                return this.convertNullishCoalesce(ast, mode);
            default:
                throw new Error(`Unsupported operation ${ast.operation}`);
        }
        return convertToStatementIfNeeded(mode, new o.BinaryOperatorExpr(op, this._visit(ast.left, _Mode.Expression), this._visit(ast.right, _Mode.Expression), undefined, this.convertSourceSpan(ast.span)));
    }
    visitChain(ast, mode) {
        ensureStatementMode(mode, ast);
        return this.visitAll(ast.expressions, mode);
    }
    visitConditional(ast, mode) {
        const value = this._visit(ast.condition, _Mode.Expression);
        return convertToStatementIfNeeded(mode, value.conditional(this._visit(ast.trueExp, _Mode.Expression), this._visit(ast.falseExp, _Mode.Expression), this.convertSourceSpan(ast.span)));
    }
    visitPipe(ast, mode) {
        throw new Error(`Illegal state: Pipes should have been converted into functions. Pipe: ${ast.name}`);
    }
    visitImplicitReceiver(ast, mode) {
        ensureExpressionMode(mode, ast);
        this.usesImplicitReceiver = true;
        return this._implicitReceiver;
    }
    visitThisReceiver(ast, mode) {
        return this.visitImplicitReceiver(ast, mode);
    }
    visitInterpolation(ast, mode) {
        if (!this.supportsInterpolation) {
            throw new Error('Unexpected interpolation');
        }
        ensureExpressionMode(mode, ast);
        let args = [];
        for (let i = 0; i < ast.strings.length - 1; i++) {
            args.push(o.literal(ast.strings[i]));
            args.push(this._visit(ast.expressions[i], _Mode.Expression));
        }
        args.push(o.literal(ast.strings[ast.strings.length - 1]));
        // If we're dealing with an interpolation of 1 value with an empty prefix and suffix, reduce the
        // args returned to just the value, because we're going to pass it to a special instruction.
        const strings = ast.strings;
        if (strings.length === 2 && strings[0] === '' && strings[1] === '') {
            // Single argument interpolate instructions.
            args = [args[1]];
        }
        else if (ast.expressions.length >= 9) {
            // 9 or more arguments must be passed to the `interpolateV`-style instructions, which accept
            // an array of arguments
            args = [o.literalArr(args)];
        }
        return new InterpolationExpression(args);
    }
    visitKeyedRead(ast, mode) {
        const leftMostSafe = this.leftMostSafeNode(ast);
        if (leftMostSafe) {
            return this.convertSafeAccess(ast, leftMostSafe, mode);
        }
        else {
            return convertToStatementIfNeeded(mode, this._visit(ast.receiver, _Mode.Expression).key(this._visit(ast.key, _Mode.Expression)));
        }
    }
    visitKeyedWrite(ast, mode) {
        const obj = this._visit(ast.receiver, _Mode.Expression);
        const key = this._visit(ast.key, _Mode.Expression);
        const value = this._visit(ast.value, _Mode.Expression);
        if (obj === this._implicitReceiver) {
            this._localResolver.maybeRestoreView();
        }
        return convertToStatementIfNeeded(mode, obj.key(key).set(value));
    }
    visitLiteralArray(ast, mode) {
        throw new Error(`Illegal State: literal arrays should have been converted into functions`);
    }
    visitLiteralMap(ast, mode) {
        throw new Error(`Illegal State: literal maps should have been converted into functions`);
    }
    visitLiteralPrimitive(ast, mode) {
        // For literal values of null, undefined, true, or false allow type interference
        // to infer the type.
        const type = ast.value === null || ast.value === undefined || ast.value === true || ast.value === true ?
            o.INFERRED_TYPE :
            undefined;
        return convertToStatementIfNeeded(mode, o.literal(ast.value, type, this.convertSourceSpan(ast.span)));
    }
    _getLocal(name, receiver) {
        if (this._localResolver.globals?.has(name) && receiver instanceof cdAst.ThisReceiver) {
            return null;
        }
        return this._localResolver.getLocal(name);
    }
    visitPrefixNot(ast, mode) {
        return convertToStatementIfNeeded(mode, o.not(this._visit(ast.expression, _Mode.Expression)));
    }
    visitNonNullAssert(ast, mode) {
        return convertToStatementIfNeeded(mode, this._visit(ast.expression, _Mode.Expression));
    }
    visitPropertyRead(ast, mode) {
        const leftMostSafe = this.leftMostSafeNode(ast);
        if (leftMostSafe) {
            return this.convertSafeAccess(ast, leftMostSafe, mode);
        }
        else {
            let result = null;
            const prevUsesImplicitReceiver = this.usesImplicitReceiver;
            const receiver = this._visit(ast.receiver, _Mode.Expression);
            if (receiver === this._implicitReceiver) {
                result = this._getLocal(ast.name, ast.receiver);
                if (result) {
                    // Restore the previous "usesImplicitReceiver" state since the implicit
                    // receiver has been replaced with a resolved local expression.
                    this.usesImplicitReceiver = prevUsesImplicitReceiver;
                    this.addImplicitReceiverAccess(ast.name);
                }
            }
            if (result == null) {
                result = receiver.prop(ast.name, this.convertSourceSpan(ast.span));
            }
            return convertToStatementIfNeeded(mode, result);
        }
    }
    visitPropertyWrite(ast, mode) {
        const receiver = this._visit(ast.receiver, _Mode.Expression);
        const prevUsesImplicitReceiver = this.usesImplicitReceiver;
        let varExpr = null;
        if (receiver === this._implicitReceiver) {
            const localExpr = this._getLocal(ast.name, ast.receiver);
            if (localExpr) {
                if (localExpr instanceof o.ReadPropExpr) {
                    // If the local variable is a property read expression, it's a reference
                    // to a 'context.property' value and will be used as the target of the
                    // write expression.
                    varExpr = localExpr;
                    // Restore the previous "usesImplicitReceiver" state since the implicit
                    // receiver has been replaced with a resolved local expression.
                    this.usesImplicitReceiver = prevUsesImplicitReceiver;
                    this.addImplicitReceiverAccess(ast.name);
                }
                else {
                    // Otherwise it's an error.
                    const receiver = ast.name;
                    const value = (ast.value instanceof cdAst.PropertyRead) ? ast.value.name : undefined;
                    throw new Error(`Cannot assign value "${value}" to template variable "${receiver}". Template variables are read-only.`);
                }
            }
        }
        // If no local expression could be produced, use the original receiver's
        // property as the target.
        if (varExpr === null) {
            varExpr = receiver.prop(ast.name, this.convertSourceSpan(ast.span));
        }
        return convertToStatementIfNeeded(mode, varExpr.set(this._visit(ast.value, _Mode.Expression)));
    }
    visitSafePropertyRead(ast, mode) {
        return this.convertSafeAccess(ast, this.leftMostSafeNode(ast), mode);
    }
    visitSafeKeyedRead(ast, mode) {
        return this.convertSafeAccess(ast, this.leftMostSafeNode(ast), mode);
    }
    visitAll(asts, mode) {
        return asts.map(ast => this._visit(ast, mode));
    }
    visitCall(ast, mode) {
        const leftMostSafe = this.leftMostSafeNode(ast);
        if (leftMostSafe) {
            return this.convertSafeAccess(ast, leftMostSafe, mode);
        }
        const convertedArgs = this.visitAll(ast.args, _Mode.Expression);
        if (ast instanceof BuiltinFunctionCall) {
            return convertToStatementIfNeeded(mode, ast.converter(convertedArgs));
        }
        const receiver = ast.receiver;
        if (receiver instanceof cdAst.PropertyRead &&
            receiver.receiver instanceof cdAst.ImplicitReceiver &&
            !(receiver.receiver instanceof cdAst.ThisReceiver) && receiver.name === '$any') {
            if (convertedArgs.length !== 1) {
                throw new Error(`Invalid call to $any, expected 1 argument but received ${convertedArgs.length || 'none'}`);
            }
            return convertToStatementIfNeeded(mode, convertedArgs[0]);
        }
        const call = this._visit(receiver, _Mode.Expression)
            .callFn(convertedArgs, this.convertSourceSpan(ast.span));
        return convertToStatementIfNeeded(mode, call);
    }
    visitSafeCall(ast, mode) {
        return this.convertSafeAccess(ast, this.leftMostSafeNode(ast), mode);
    }
    _visit(ast, mode) {
        const result = this._resultMap.get(ast);
        if (result)
            return result;
        return (this._nodeMap.get(ast) || ast).visit(this, mode);
    }
    convertSafeAccess(ast, leftMostSafe, mode) {
        // If the expression contains a safe access node on the left it needs to be converted to
        // an expression that guards the access to the member by checking the receiver for blank. As
        // execution proceeds from left to right, the left most part of the expression must be guarded
        // first but, because member access is left associative, the right side of the expression is at
        // the top of the AST. The desired result requires lifting a copy of the left part of the
        // expression up to test it for blank before generating the unguarded version.
        // Consider, for example the following expression: a?.b.c?.d.e
        // This results in the ast:
        //         .
        //        / \
        //       ?.   e
        //      /  \
        //     .    d
        //    / \
        //   ?.  c
        //  /  \
        // a    b
        // The following tree should be generated:
        //
        //        /---- ? ----\
        //       /      |      \
        //     a   /--- ? ---\  null
        //        /     |     \
        //       .      .     null
        //      / \    / \
        //     .  c   .   e
        //    / \    / \
        //   a   b  .   d
        //         / \
        //        .   c
        //       / \
        //      a   b
        //
        // Notice that the first guard condition is the left hand of the left most safe access node
        // which comes in as leftMostSafe to this routine.
        let guardedExpression = this._visit(leftMostSafe.receiver, _Mode.Expression);
        let temporary = undefined;
        if (this.needsTemporaryInSafeAccess(leftMostSafe.receiver)) {
            // If the expression has method calls or pipes then we need to save the result into a
            // temporary variable to avoid calling stateful or impure code more than once.
            temporary = this.allocateTemporary();
            // Preserve the result in the temporary variable
            guardedExpression = temporary.set(guardedExpression);
            // Ensure all further references to the guarded expression refer to the temporary instead.
            this._resultMap.set(leftMostSafe.receiver, temporary);
        }
        const condition = guardedExpression.isBlank();
        // Convert the ast to an unguarded access to the receiver's member. The map will substitute
        // leftMostNode with its unguarded version in the call to `this.visit()`.
        if (leftMostSafe instanceof cdAst.SafeCall) {
            this._nodeMap.set(leftMostSafe, new cdAst.Call(leftMostSafe.span, leftMostSafe.sourceSpan, leftMostSafe.receiver, leftMostSafe.args, leftMostSafe.argumentSpan));
        }
        else if (leftMostSafe instanceof cdAst.SafeKeyedRead) {
            this._nodeMap.set(leftMostSafe, new cdAst.KeyedRead(leftMostSafe.span, leftMostSafe.sourceSpan, leftMostSafe.receiver, leftMostSafe.key));
        }
        else {
            this._nodeMap.set(leftMostSafe, new cdAst.PropertyRead(leftMostSafe.span, leftMostSafe.sourceSpan, leftMostSafe.nameSpan, leftMostSafe.receiver, leftMostSafe.name));
        }
        // Recursively convert the node now without the guarded member access.
        const access = this._visit(ast, _Mode.Expression);
        // Remove the mapping. This is not strictly required as the converter only traverses each node
        // once but is safer if the conversion is changed to traverse the nodes more than once.
        this._nodeMap.delete(leftMostSafe);
        // If we allocated a temporary, release it.
        if (temporary) {
            this.releaseTemporary(temporary);
        }
        // Produce the conditional
        return convertToStatementIfNeeded(mode, condition.conditional(o.NULL_EXPR, access));
    }
    convertNullishCoalesce(ast, mode) {
        const left = this._visit(ast.left, _Mode.Expression);
        const right = this._visit(ast.right, _Mode.Expression);
        const temporary = this.allocateTemporary();
        this.releaseTemporary(temporary);
        // Generate the following expression. It is identical to how TS
        // transpiles binary expressions with a nullish coalescing operator.
        // let temp;
        // (temp = a) !== null && temp !== undefined ? temp : b;
        return convertToStatementIfNeeded(mode, temporary.set(left)
            .notIdentical(o.NULL_EXPR)
            .and(temporary.notIdentical(o.literal(undefined)))
            .conditional(temporary, right));
    }
    // Given an expression of the form a?.b.c?.d.e then the left most safe node is
    // the (a?.b). The . and ?. are left associative thus can be rewritten as:
    // ((((a?.c).b).c)?.d).e. This returns the most deeply nested safe read or
    // safe method call as this needs to be transformed initially to:
    //   a == null ? null : a.c.b.c?.d.e
    // then to:
    //   a == null ? null : a.b.c == null ? null : a.b.c.d.e
    leftMostSafeNode(ast) {
        const visit = (visitor, ast) => {
            return (this._nodeMap.get(ast) || ast).visit(visitor);
        };
        return ast.visit({
            visitUnary(ast) {
                return null;
            },
            visitBinary(ast) {
                return null;
            },
            visitChain(ast) {
                return null;
            },
            visitConditional(ast) {
                return null;
            },
            visitCall(ast) {
                return visit(this, ast.receiver);
            },
            visitSafeCall(ast) {
                return visit(this, ast.receiver) || ast;
            },
            visitImplicitReceiver(ast) {
                return null;
            },
            visitThisReceiver(ast) {
                return null;
            },
            visitInterpolation(ast) {
                return null;
            },
            visitKeyedRead(ast) {
                return visit(this, ast.receiver);
            },
            visitKeyedWrite(ast) {
                return null;
            },
            visitLiteralArray(ast) {
                return null;
            },
            visitLiteralMap(ast) {
                return null;
            },
            visitLiteralPrimitive(ast) {
                return null;
            },
            visitPipe(ast) {
                return null;
            },
            visitPrefixNot(ast) {
                return null;
            },
            visitNonNullAssert(ast) {
                return visit(this, ast.expression);
            },
            visitPropertyRead(ast) {
                return visit(this, ast.receiver);
            },
            visitPropertyWrite(ast) {
                return null;
            },
            visitSafePropertyRead(ast) {
                return visit(this, ast.receiver) || ast;
            },
            visitSafeKeyedRead(ast) {
                return visit(this, ast.receiver) || ast;
            }
        });
    }
    // Returns true of the AST includes a method or a pipe indicating that, if the
    // expression is used as the target of a safe property or method access then
    // the expression should be stored into a temporary variable.
    needsTemporaryInSafeAccess(ast) {
        const visit = (visitor, ast) => {
            return ast && (this._nodeMap.get(ast) || ast).visit(visitor);
        };
        const visitSome = (visitor, ast) => {
            return ast.some(ast => visit(visitor, ast));
        };
        return ast.visit({
            visitUnary(ast) {
                return visit(this, ast.expr);
            },
            visitBinary(ast) {
                return visit(this, ast.left) || visit(this, ast.right);
            },
            visitChain(ast) {
                return false;
            },
            visitConditional(ast) {
                return visit(this, ast.condition) || visit(this, ast.trueExp) || visit(this, ast.falseExp);
            },
            visitCall(ast) {
                return true;
            },
            visitSafeCall(ast) {
                return true;
            },
            visitImplicitReceiver(ast) {
                return false;
            },
            visitThisReceiver(ast) {
                return false;
            },
            visitInterpolation(ast) {
                return visitSome(this, ast.expressions);
            },
            visitKeyedRead(ast) {
                return false;
            },
            visitKeyedWrite(ast) {
                return false;
            },
            visitLiteralArray(ast) {
                return true;
            },
            visitLiteralMap(ast) {
                return true;
            },
            visitLiteralPrimitive(ast) {
                return false;
            },
            visitPipe(ast) {
                return true;
            },
            visitPrefixNot(ast) {
                return visit(this, ast.expression);
            },
            visitNonNullAssert(ast) {
                return visit(this, ast.expression);
            },
            visitPropertyRead(ast) {
                return false;
            },
            visitPropertyWrite(ast) {
                return false;
            },
            visitSafePropertyRead(ast) {
                return false;
            },
            visitSafeKeyedRead(ast) {
                return false;
            }
        });
    }
    allocateTemporary() {
        const tempNumber = this._currentTemporary++;
        this.temporaryCount = Math.max(this._currentTemporary, this.temporaryCount);
        return new o.ReadVarExpr(temporaryName(this.bindingId, tempNumber));
    }
    releaseTemporary(temporary) {
        this._currentTemporary--;
        if (temporary.name != temporaryName(this.bindingId, this._currentTemporary)) {
            throw new Error(`Temporary ${temporary.name} released out of order`);
        }
    }
    /**
     * Creates an absolute `ParseSourceSpan` from the relative `ParseSpan`.
     *
     * `ParseSpan` objects are relative to the start of the expression.
     * This method converts these to full `ParseSourceSpan` objects that
     * show where the span is within the overall source file.
     *
     * @param span the relative span to convert.
     * @returns a `ParseSourceSpan` for the given span or null if no
     * `baseSourceSpan` was provided to this class.
     */
    convertSourceSpan(span) {
        if (this.baseSourceSpan) {
            const start = this.baseSourceSpan.start.moveBy(span.start);
            const end = this.baseSourceSpan.start.moveBy(span.end);
            const fullStart = this.baseSourceSpan.fullStart.moveBy(span.start);
            return new ParseSourceSpan(start, end, fullStart);
        }
        else {
            return null;
        }
    }
    /** Adds the name of an AST to the list of implicit receiver accesses. */
    addImplicitReceiverAccess(name) {
        if (this.implicitReceiverAccesses) {
            this.implicitReceiverAccesses.add(name);
        }
    }
}
function flattenStatements(arg, output) {
    if (Array.isArray(arg)) {
        arg.forEach((entry) => flattenStatements(entry, output));
    }
    else {
        output.push(arg);
    }
}
function unsupported() {
    throw new Error('Unsupported operation');
}
class InterpolationExpression extends o.Expression {
    constructor(args) {
        super(null, null);
        this.args = args;
        this.isConstant = unsupported;
        this.isEquivalent = unsupported;
        this.visitExpression = unsupported;
        this.clone = unsupported;
    }
}
class DefaultLocalResolver {
    constructor(globals) {
        this.globals = globals;
    }
    notifyImplicitReceiverUse() { }
    maybeRestoreView() { }
    getLocal(name) {
        if (name === EventHandlerVars.event.name) {
            return EventHandlerVars.event;
        }
        return null;
    }
}
export class BuiltinFunctionCall extends cdAst.Call {
    constructor(span, sourceSpan, args, converter) {
        super(span, sourceSpan, new cdAst.EmptyExpr(span, sourceSpan), args, null);
        this.converter = converter;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwcmVzc2lvbl9jb252ZXJ0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvY29tcGlsZXJfdXRpbC9leHByZXNzaW9uX2NvbnZlcnRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEtBQUssS0FBSyxNQUFNLDBCQUEwQixDQUFDO0FBQ2xELE9BQU8sS0FBSyxDQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDMUMsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUM5QyxPQUFPLEVBQUMsV0FBVyxJQUFJLEVBQUUsRUFBQyxNQUFNLDJCQUEyQixDQUFDO0FBRTVELE1BQU0sT0FBTyxnQkFBZ0I7YUFDcEIsVUFBSyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7O0FBVXRDOzs7R0FHRztBQUNILE1BQU0sVUFBVSxvQkFBb0IsQ0FDaEMsYUFBaUMsRUFBRSxnQkFBOEIsRUFBRSxNQUFpQixFQUNwRixTQUFpQixFQUFFLGNBQWdDLEVBQUUsd0JBQXNDLEVBQzNGLE9BQXFCO0lBQ3ZCLGFBQWEsS0FBSyxJQUFJLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3BELE1BQU0sT0FBTyxHQUFHLElBQUksZUFBZSxDQUMvQixhQUFhLEVBQUUsZ0JBQWdCLEVBQUUsU0FBUyxFQUFFLDJCQUEyQixDQUFDLEtBQUssRUFBRSxjQUFjLEVBQzdGLHdCQUF3QixDQUFDLENBQUM7SUFDOUIsTUFBTSxXQUFXLEdBQWtCLEVBQUUsQ0FBQztJQUN0QyxpQkFBaUIsQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUM5RixxQkFBcUIsQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLFNB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TUFBTSxPQUFPLG1CQUFvQixTQUFRLEtBQUssQ0FBQyxJQUFJO0lBQ2pELFlBQ0ksSUFBcUIsRUFBRSxVQUFvQyxFQUFFLElBQWlCLEVBQ3ZFLFNBQTJCO1FBQ3BDLEtBQUssQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLElBQUksS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUssQ0FBQyxDQUFDO1FBRG5FLGNBQVMsR0FBVCxTQUFTLENBQWtCO0lBRXRDLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBjZEFzdCBmcm9tICcuLi9leHByZXNzaW9uX3BhcnNlci9hc3QnO1xuaW1wb3J0ICogYXMgbyBmcm9tICcuLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5pbXBvcnQge1BhcnNlU291cmNlU3Bhbn0gZnJvbSAnLi4vcGFyc2VfdXRpbCc7XG5pbXBvcnQge0lkZW50aWZpZXJzIGFzIFIzfSBmcm9tICcuLi9yZW5kZXIzL3IzX2lkZW50aWZpZXJzJztcblxuZXhwb3J0IGNsYXNzIEV2ZW50SGFuZGxlclZhcnMge1xuICBzdGF0aWMgZXZlbnQgPSBvLnZhcmlhYmxlKCckZXZlbnQnKTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBMb2NhbFJlc29sdmVyIHtcbiAgZ2V0TG9jYWwobmFtZTogc3RyaW5nKTogby5FeHByZXNzaW9ufG51bGw7XG4gIG5vdGlmeUltcGxpY2l0UmVjZWl2ZXJVc2UoKTogdm9pZDtcbiAgZ2xvYmFscz86IFNldDxzdHJpbmc+O1xuICBtYXliZVJlc3RvcmVWaWV3KCk6IHZvaWQ7XG59XG5cbi8qKlxuICogQ29udmVydHMgdGhlIGdpdmVuIGV4cHJlc3Npb24gQVNUIGludG8gYW4gZXhlY3V0YWJsZSBvdXRwdXQgQVNULCBhc3N1bWluZyB0aGUgZXhwcmVzc2lvbiBpc1xuICogdXNlZCBpbiBhbiBhY3Rpb24gYmluZGluZyAoZS5nLiBhbiBldmVudCBoYW5kbGVyKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnRBY3Rpb25CaW5kaW5nKFxuICAgIGxvY2FsUmVzb2x2ZXI6IExvY2FsUmVzb2x2ZXJ8bnVsbCwgaW1wbGljaXRSZWNlaXZlcjogby5FeHByZXNzaW9uLCBhY3Rpb246IGNkQXN0LkFTVCxcbiAgICBiaW5kaW5nSWQ6IHN0cmluZywgYmFzZVNvdXJjZVNwYW4/OiBQYXJzZVNvdXJjZVNwYW4sIGltcGxpY2l0UmVjZWl2ZXJBY2Nlc3Nlcz86IFNldDxzdHJpbmc+LFxuICAgIGdsb2JhbHM/OiBTZXQ8c3RyaW5nPik6IG8uU3RhdGVtZW50W10ge1xuICBsb2NhbFJlc29sdmVyID8/PSBuZXcgRGVmYXVsdExvY2FsUmVzb2x2ZXIoZ2xvYmFscyk7XG4gIGNvbnN0IHZpc2l0b3IgPSBuZXcgX0FzdFRvSXJWaXNpdG9yKFxuICAgICAgbG9jYWxSZXNvbHZlciwgaW1wbGljaXRSZWNlaXZlciwgYmluZGluZ0lkLCAvKiBzdXBwb3J0c0ludGVycG9sYXRpb24gKi8gZmFsc2UsIGJhc2VTb3VyY2VTcGFuLFxuICAgICAgaW1wbGljaXRSZWNlaXZlckFjY2Vzc2VzKTtcbiAgY29uc3QgYWN0aW9uU3RtdHM6IG8uU3RhdGVtZW50W10gPSBbXTtcbiAgZmxhdHRlblN0YXRlbWVudHMoY29udmVydEFjdGlvbkJ1aWx0aW5zKGFjdGlvbikudmlzaXQodmlzaXRvciwgX01vZGUuU3RhdGVtZW50KSwgYWN0aW9uU3RtdHMpO1xuICBwcmVwZW5kVGVtcG9yYXJ5RGVjbHModmlzaXRvci50ZW1wb3JhcnlDb3VudCwgYmluZGluZ0lkLCBhY3Rpb25TdG10cyk7XG5cbiAgaWYgKHZpc2l0b3IudXNlc0ltcGxpY2l0UmVjZWl2ZXIpIHtcbiAgICBsb2NhbFJlc29sdmVyLm5vdGlmeUltcGxpY2l0UmVjZWl2ZXJVc2UoKTtcbiAgfVxuXG4gIGNvbnN0IGxhc3RJbmRleCA9IGFjdGlvblN0bXRzLmxlbmd0aCAtIDE7XG4gIGlmIChsYXN0SW5kZXggPj0gMCkge1xuICAgIGNvbnN0IGxhc3RTdGF0ZW1lbnQgPSBhY3Rpb25TdG10c1tsYXN0SW5kZXhdO1xuICAgIC8vIEVuc3VyZSB0aGF0IHRoZSB2YWx1ZSBvZiB0aGUgbGFzdCBleHByZXNzaW9uIHN0YXRlbWVudCBpcyByZXR1cm5lZFxuICAgIGlmIChsYXN0U3RhdGVtZW50IGluc3RhbmNlb2Ygby5FeHByZXNzaW9uU3RhdGVtZW50KSB7XG4gICAgICBhY3Rpb25TdG10c1tsYXN0SW5kZXhdID0gbmV3IG8uUmV0dXJuU3RhdGVtZW50KGxhc3RTdGF0ZW1lbnQuZXhwcik7XG4gICAgfVxuICB9XG4gIHJldHVybiBhY3Rpb25TdG10cztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnRBc3NpZ25tZW50QWN0aW9uQmluZGluZyhcbiAgICBsb2NhbFJlc29sdmVyOiBMb2NhbFJlc29sdmVyfG51bGwsIGltcGxpY2l0UmVjZWl2ZXI6IG8uRXhwcmVzc2lvbiwgYWN0aW9uOiBjZEFzdC5BU1QsXG4gICAgYmluZGluZ0lkOiBzdHJpbmcsIGJhc2VTb3VyY2VTcGFuPzogUGFyc2VTb3VyY2VTcGFuLCBpbXBsaWNpdFJlY2VpdmVyQWNjZXNzZXM/OiBTZXQ8c3RyaW5nPixcbiAgICBnbG9iYWxzPzogU2V0PHN0cmluZz4pOiBvLlN0YXRlbWVudFtdIHtcbiAgbG9jYWxSZXNvbHZlciA/Pz0gbmV3IERlZmF1bHRMb2NhbFJlc29sdmVyKGdsb2JhbHMpO1xuICBjb25zdCB2aXNpdG9yID0gbmV3IF9Bc3RUb0lyVmlzaXRvcihcbiAgICAgIGxvY2FsUmVzb2x2ZXIsIGltcGxpY2l0UmVjZWl2ZXIsIGJpbmRpbmdJZCwgLyogc3VwcG9ydHNJbnRlcnBvbGF0aW9uICovIGZhbHNlLCBiYXNlU291cmNlU3BhbixcbiAgICAgIGltcGxpY2l0UmVjZWl2ZXJBY2Nlc3Nlcyk7XG4gIGxldCBjb252ZXJ0ZWRBY3Rpb24gPSBjb252ZXJ0QWN0aW9uQnVpbHRpbnMoYWN0aW9uKS52aXNpdCh2aXNpdG9yLCBfTW9kZS5TdGF0ZW1lbnQpO1xuXG4gIC8vIFRoaXMgc2hvdWxkIGFscmVhZHkgaGF2ZSBiZWVuIGFzc2VydGVkIGluIHRoZSBwYXJzZXIsIGJ1dCB3ZSB2ZXJpZnkgaXQgaGVyZSBqdXN0IGluIGNhc2UuXG4gIGlmICghKGNvbnZlcnRlZEFjdGlvbiBpbnN0YW5jZW9mIG8uRXhwcmVzc2lvblN0YXRlbWVudCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYElsbGVnYWwgc3RhdGU6IHVuc3VwcG9ydGVkIGV4cHJlc3Npb24gaW4gdHdvLXdheSBhY3Rpb24gYmluZGluZy5gKTtcbiAgfVxuXG4gIC8vIENvbnZlcnRzIGBbKG5nTW9kZWwpXT1cIm5hbWVcImAgdG8gYHR3b1dheUJpbmRpbmdTZXQoY3R4Lm5hbWUsICRldmVudCkgfHwgKGN0eC5uYW1lID0gJGV2ZW50KWAuXG4gIGNvbnZlcnRlZEFjdGlvbiA9IHdyYXBBc3NpZ25tZW50QWN0aW9uKGNvbnZlcnRlZEFjdGlvbi5leHByKS50b1N0bXQoKTtcbiAgY29uc3QgYWN0aW9uU3RtdHM6IG8uU3RhdGVtZW50W10gPSBbXTtcbiAgZmxhdHRlblN0YXRlbWVudHMoY29udmVydGVkQWN0aW9uLCBhY3Rpb25TdG10cyk7XG4gIHByZXBlbmRUZW1wb3JhcnlEZWNscyh2aXNpdG9yLnRlbXBvcmFyeUNvdW50LCBiaW5kaW5nSWQsIGFjdGlvblN0bXRzKTtcblxuICAvLyBBc3NpZ25tZW50IGV2ZW50cyBhbHdheXMgcmV0dXJuIGAkZXZlbnRgLlxuICBhY3Rpb25TdG10cy5wdXNoKG5ldyBvLlJldHVyblN0YXRlbWVudChFdmVudEhhbmRsZXJWYXJzLmV2ZW50KSk7XG4gIGltcGxpY2l0UmVjZWl2ZXJBY2Nlc3Nlcz8uYWRkKEV2ZW50SGFuZGxlclZhcnMuZXZlbnQubmFtZSk7XG5cbiAgaWYgKHZpc2l0b3IudXNlc0ltcGxpY2l0UmVjZWl2ZXIpIHtcbiAgICBsb2NhbFJlc29sdmVyLm5vdGlmeUltcGxpY2l0UmVjZWl2ZXJVc2UoKTtcbiAgfVxuICByZXR1cm4gYWN0aW9uU3RtdHM7XG59XG5cbmZ1bmN0aW9uIHdyYXBBc3NpZ25tZW50UmVhZEV4cHJlc3Npb24oYXN0OiBvLlJlYWRQcm9wRXhwcnxvLlJlYWRLZXlFeHByKTogby5FeHByZXNzaW9uIHtcbiAgcmV0dXJuIG5ldyBvLkV4dGVybmFsRXhwcihSMy50d29XYXlCaW5kaW5nU2V0KVxuICAgICAgLmNhbGxGbihbYXN0LCBFdmVudEhhbmRsZXJWYXJzLmV2ZW50XSlcbiAgICAgIC5vcihhc3Quc2V0KEV2ZW50SGFuZGxlclZhcnMuZXZlbnQpKTtcbn1cblxuZnVuY3Rpb24gaXNSZWFkRXhwcmVzc2lvbih2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIG8uUmVhZFByb3BFeHByfG8uUmVhZEtleUV4cHIge1xuICByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBvLlJlYWRQcm9wRXhwciB8fCB2YWx1ZSBpbnN0YW5jZW9mIG8uUmVhZEtleUV4cHI7XG59XG5cbmZ1bmN0aW9uIHdyYXBBc3NpZ25tZW50QWN0aW9uKGFzdDogby5FeHByZXNzaW9uKTogby5FeHByZXNzaW9uIHtcbiAgLy8gVGhlIG9ubHkgb2ZmaWNpYWxseSBzdXBwb3J0ZWQgZXhwcmVzc2lvbnMgaW5zaWRlIG9mIGEgdHdvLXdheSBiaW5kaW5nIGFyZSByZWFkIGV4cHJlc3Npb25zLlxuICBpZiAoaXNSZWFkRXhwcmVzc2lvbihhc3QpKSB7XG4gICAgcmV0dXJuIHdyYXBBc3NpZ25tZW50UmVhZEV4cHJlc3Npb24oYXN0KTtcbiAgfVxuXG4gIC8vIEhvd2V2ZXIsIGhpc3RvcmljYWxseSB0aGUgZXhwcmVzc2lvbiBwYXJzZXIgd2FzIGhhbmRsaW5nIHR3by13YXkgZXZlbnRzIGJ5IGFwcGVuZGluZyBgPSRldmVudGBcbiAgLy8gdG8gdGhlIHJhdyBzdHJpbmcgYmVmb3JlIGF0dGVtcHRpbmcgdG8gcGFyc2UgaXQuIFRoaXMgaGFzIGxlZCB0byBidWdzIG92ZXIgdGhlIHllYXJzIChzZWVcbiAgLy8gIzM3ODA5KSBhbmQgdG8gdW5pbnRlbnRpb25hbGx5IHN1cHBvcnRpbmcgdW5hc3NpZ25hYmxlIGV2ZW50cyBpbiB0aGUgdHdvLXdheSBiaW5kaW5nLiBUaGVcbiAgLy8gbG9naWMgYmVsb3cgYWltcyB0byBlbXVsYXRlIHRoZSBvbGQgYmVoYXZpb3Igd2hpbGUgc3RpbGwgc3VwcG9ydGluZyB0aGUgbmV3IG91dHB1dCBmb3JtYXRcbiAgLy8gd2hpY2ggdXNlcyBgdHdvV2F5QmluZGluZ1NldGAuIE5vdGUgdGhhdCB0aGUgZ2VuZXJhdGVkIGNvZGUgZG9lc24ndCBuZWNlc3NhcmlseSBtYWtlIHNlbnNlXG4gIC8vIGJhc2VkIG9uIHdoYXQgdGhlIHVzZXIgd3JvdGUsIGZvciBleGFtcGxlIHRoZSBldmVudCBiaW5kaW5nIGZvciBgWyh2YWx1ZSldPVwiYSA/IGIgOiBjXCJgXG4gIC8vIHdvdWxkIHByb2R1Y2UgYGN0eC5hID8gY3R4LmIgOiBjdHguYyA9ICRldmVudGAuIFdlIGFpbSB0byByZXByb2R1Y2Ugd2hhdCB0aGUgcGFyc2VyIHVzZWRcbiAgLy8gdG8gZ2VuZXJhdGUgYmVmb3JlICM1NDE1NC5cbiAgaWYgKGFzdCBpbnN0YW5jZW9mIG8uQmluYXJ5T3BlcmF0b3JFeHByICYmIGlzUmVhZEV4cHJlc3Npb24oYXN0LnJocykpIHtcbiAgICAvLyBgYSAmJiBiYCAtPiBgY3R4LmEgJiYgdHdvV2F5QmluZGluZ1NldChjdHguYiwgJGV2ZW50KSB8fCAoY3R4LmIgPSAkZXZlbnQpYFxuICAgIHJldHVybiBuZXcgby5CaW5hcnlPcGVyYXRvckV4cHIoYXN0Lm9wZXJhdG9yLCBhc3QubGhzLCB3cmFwQXNzaWdubWVudFJlYWRFeHByZXNzaW9uKGFzdC5yaHMpKTtcbiAgfVxuXG4gIC8vIE5vdGU6IHRoaXMgYWxzbyBzdXBwb3J0cyBudWxsaXNoIGNvYWxlc2NpbmcgZXhwcmVzc2lvbnMgd2hpY2hcbiAgLy8gd291bGQndmUgYmVlbiBkb3dubGV2ZWxlZCB0byB0ZXJuYXJ5IGV4cHJlc3Npb25zIGJ5IHRoaXMgcG9pbnQuXG4gIGlmIChhc3QgaW5zdGFuY2VvZiBvLkNvbmRpdGlvbmFsRXhwciAmJiBpc1JlYWRFeHByZXNzaW9uKGFzdC5mYWxzZUNhc2UpKSB7XG4gICAgLy8gYGEgPyBiIDogY2AgLT4gYGN0eC5hID8gY3R4LmIgOiB0d29XYXlCaW5kaW5nU2V0KGN0eC5jLCAkZXZlbnQpIHx8IChjdHguYyA9ICRldmVudClgXG4gICAgcmV0dXJuIG5ldyBvLkNvbmRpdGlvbmFsRXhwcihcbiAgICAgICAgYXN0LmNvbmRpdGlvbiwgYXN0LnRydWVDYXNlLCB3cmFwQXNzaWdubWVudFJlYWRFeHByZXNzaW9uKGFzdC5mYWxzZUNhc2UpKTtcbiAgfVxuXG4gIC8vIGAhIWFgIC0+IGB0d29XYXlCaW5kaW5nU2V0KGN0eC5hLCAkZXZlbnQpIHx8IChjdHguYSA9ICRldmVudClgXG4gIC8vIE5vdGU6IHByZXZpb3VzbHkgd2UnZCBhY3R1YWxseSBwcm9kdWNlIGAhIShjdHguYSA9ICRldmVudClgLCBidXQgdGhlIHdyYXBwaW5nXG4gIC8vIG5vZGUgZG9lc24ndCBhZmZlY3QgdGhlIHJlc3VsdCBzbyB3ZSBkb24ndCBuZWVkIHRvIGNhcnJ5IGl0IG92ZXIuXG4gIGlmIChhc3QgaW5zdGFuY2VvZiBvLk5vdEV4cHIpIHtcbiAgICBsZXQgZXhwciA9IGFzdC5jb25kaXRpb247XG5cbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgaWYgKGV4cHIgaW5zdGFuY2VvZiBvLk5vdEV4cHIpIHtcbiAgICAgICAgZXhwciA9IGV4cHIuY29uZGl0aW9uO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGlzUmVhZEV4cHJlc3Npb24oZXhwcikpIHtcbiAgICAgICAgICByZXR1cm4gd3JhcEFzc2lnbm1lbnRSZWFkRXhwcmVzc2lvbihleHByKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB0aHJvdyBuZXcgRXJyb3IoYElsbGVnYWwgc3RhdGU6IHVuc3VwcG9ydGVkIGV4cHJlc3Npb24gaW4gdHdvLXdheSBhY3Rpb24gYmluZGluZy5gKTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBCdWlsdGluQ29udmVydGVyIHtcbiAgKGFyZ3M6IG8uRXhwcmVzc2lvbltdKTogby5FeHByZXNzaW9uO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJ1aWx0aW5Db252ZXJ0ZXJGYWN0b3J5IHtcbiAgY3JlYXRlTGl0ZXJhbEFycmF5Q29udmVydGVyKGFyZ0NvdW50OiBudW1iZXIpOiBCdWlsdGluQ29udmVydGVyO1xuICBjcmVhdGVMaXRlcmFsTWFwQ29udmVydGVyKGtleXM6IHtrZXk6IHN0cmluZywgcXVvdGVkOiBib29sZWFufVtdKTogQnVpbHRpbkNvbnZlcnRlcjtcbiAgY3JlYXRlUGlwZUNvbnZlcnRlcihuYW1lOiBzdHJpbmcsIGFyZ0NvdW50OiBudW1iZXIpOiBCdWlsdGluQ29udmVydGVyO1xufVxuXG5mdW5jdGlvbiBjb252ZXJ0UHJvcGVydHlCaW5kaW5nQnVpbHRpbnMoXG4gICAgY29udmVydGVyRmFjdG9yeTogQnVpbHRpbkNvbnZlcnRlckZhY3RvcnksIGFzdDogY2RBc3QuQVNUKTogY2RBc3QuQVNUIHtcbiAgcmV0dXJuIGNvbnZlcnRCdWlsdGlucyhjb252ZXJ0ZXJGYWN0b3J5LCBhc3QpO1xufVxuXG5leHBvcnQgY2xhc3MgQ29udmVydFByb3BlcnR5QmluZGluZ1Jlc3VsdCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBzdG10czogby5TdGF0ZW1lbnRbXSwgcHVibGljIGN1cnJWYWxFeHByOiBvLkV4cHJlc3Npb24pIHt9XG59XG5cbi8qKlxuICogQ29udmVydHMgdGhlIGdpdmVuIGV4cHJlc3Npb24gQVNUIGludG8gYW4gZXhlY3V0YWJsZSBvdXRwdXQgQVNULCBhc3N1bWluZyB0aGUgZXhwcmVzc2lvblxuICogaXMgdXNlZCBpbiBwcm9wZXJ0eSBiaW5kaW5nLiBUaGUgZXhwcmVzc2lvbiBoYXMgdG8gYmUgcHJlcHJvY2Vzc2VkIHZpYVxuICogYGNvbnZlcnRQcm9wZXJ0eUJpbmRpbmdCdWlsdGluc2AuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb252ZXJ0UHJvcGVydHlCaW5kaW5nKFxuICAgIGxvY2FsUmVzb2x2ZXI6IExvY2FsUmVzb2x2ZXJ8bnVsbCwgaW1wbGljaXRSZWNlaXZlcjogby5FeHByZXNzaW9uLFxuICAgIGV4cHJlc3Npb25XaXRob3V0QnVpbHRpbnM6IGNkQXN0LkFTVCwgYmluZGluZ0lkOiBzdHJpbmcpOiBDb252ZXJ0UHJvcGVydHlCaW5kaW5nUmVzdWx0IHtcbiAgaWYgKCFsb2NhbFJlc29sdmVyKSB7XG4gICAgbG9jYWxSZXNvbHZlciA9IG5ldyBEZWZhdWx0TG9jYWxSZXNvbHZlcigpO1xuICB9XG4gIGNvbnN0IHZpc2l0b3IgPSBuZXcgX0FzdFRvSXJWaXNpdG9yKFxuICAgICAgbG9jYWxSZXNvbHZlciwgaW1wbGljaXRSZWNlaXZlciwgYmluZGluZ0lkLCAvKiBzdXBwb3J0c0ludGVycG9sYXRpb24gKi8gZmFsc2UpO1xuICBjb25zdCBvdXRwdXRFeHByOiBvLkV4cHJlc3Npb24gPSBleHByZXNzaW9uV2l0aG91dEJ1aWx0aW5zLnZpc2l0KHZpc2l0b3IsIF9Nb2RlLkV4cHJlc3Npb24pO1xuICBjb25zdCBzdG10czogby5TdGF0ZW1lbnRbXSA9IGdldFN0YXRlbWVudHNGcm9tVmlzaXRvcih2aXNpdG9yLCBiaW5kaW5nSWQpO1xuXG4gIGlmICh2aXNpdG9yLnVzZXNJbXBsaWNpdFJlY2VpdmVyKSB7XG4gICAgbG9jYWxSZXNvbHZlci5ub3RpZnlJbXBsaWNpdFJlY2VpdmVyVXNlKCk7XG4gIH1cblxuICByZXR1cm4gbmV3IENvbnZlcnRQcm9wZXJ0eUJpbmRpbmdSZXN1bHQoc3RtdHMsIG91dHB1dEV4cHIpO1xufVxuXG4vKiogQ29udmVydHMgYW4gQVNUIHRvIGEgcHVyZSBmdW5jdGlvbiB0aGF0IG1heSBoYXZlIGFjY2VzcyB0byB0aGUgY29tcG9uZW50IHNjb3BlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnRQdXJlQ29tcG9uZW50U2NvcGVGdW5jdGlvbihcbiAgICBhc3Q6IGNkQXN0LkFTVCwgbG9jYWxSZXNvbHZlcjogTG9jYWxSZXNvbHZlciwgaW1wbGljaXRSZWNlaXZlcjogby5FeHByZXNzaW9uLFxuICAgIGJpbmRpbmdJZDogc3RyaW5nKTogby5TdGF0ZW1lbnRbXSB7XG4gIGNvbnN0IGNvbnZlcnRlZCA9IGNvbnZlcnRQcm9wZXJ0eUJpbmRpbmdCdWlsdGlucyhcbiAgICAgIHtcbiAgICAgICAgY3JlYXRlTGl0ZXJhbEFycmF5Q29udmVydGVyOiAoKSA9PiBhcmdzID0+IG8ubGl0ZXJhbEFycihhcmdzKSxcbiAgICAgICAgY3JlYXRlTGl0ZXJhbE1hcENvbnZlcnRlcjoga2V5cyA9PiB2YWx1ZXMgPT4gby5saXRlcmFsTWFwKGtleXMubWFwKChrZXksIGluZGV4KSA9PiB7XG4gICAgICAgICAgcmV0dXJuICh7XG4gICAgICAgICAgICBrZXk6IGtleS5rZXksXG4gICAgICAgICAgICB2YWx1ZTogdmFsdWVzW2luZGV4XSxcbiAgICAgICAgICAgIHF1b3RlZDoga2V5LnF1b3RlZCxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSkpLFxuICAgICAgICBjcmVhdGVQaXBlQ29udmVydGVyOiAoKSA9PiB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbGxlZ2FsIFN0YXRlOiBQaXBlcyBhcmUgbm90IGFsbG93ZWQgaW4gdGhpcyBjb250ZXh0Jyk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBhc3QpO1xuXG4gIGNvbnN0IHZpc2l0b3IgPSBuZXcgX0FzdFRvSXJWaXNpdG9yKGxvY2FsUmVzb2x2ZXIsIGltcGxpY2l0UmVjZWl2ZXIsIGJpbmRpbmdJZCwgZmFsc2UpO1xuICBjb25zdCBzdGF0ZW1lbnRzOiBvLlN0YXRlbWVudFtdID0gW107XG4gIGZsYXR0ZW5TdGF0ZW1lbnRzKGNvbnZlcnRlZC52aXNpdCh2aXNpdG9yLCBfTW9kZS5TdGF0ZW1lbnQpLCBzdGF0ZW1lbnRzKTtcbiAgcmV0dXJuIHN0YXRlbWVudHM7XG59XG5cbi8qKlxuICogR2l2ZW4gc29tZSBleHByZXNzaW9uLCBzdWNoIGFzIGEgYmluZGluZyBvciBpbnRlcnBvbGF0aW9uIGV4cHJlc3Npb24sIGFuZCBhIGNvbnRleHQgZXhwcmVzc2lvbiB0b1xuICogbG9vayB2YWx1ZXMgdXAgb24sIHZpc2l0IGVhY2ggZmFjZXQgb2YgdGhlIGdpdmVuIGV4cHJlc3Npb24gcmVzb2x2aW5nIHZhbHVlcyBmcm9tIHRoZSBjb250ZXh0XG4gKiBleHByZXNzaW9uIHN1Y2ggdGhhdCBhIGxpc3Qgb2YgYXJndW1lbnRzIGNhbiBiZSBkZXJpdmVkIGZyb20gdGhlIGZvdW5kIHZhbHVlcyB0aGF0IGNhbiBiZSB1c2VkIGFzXG4gKiBhcmd1bWVudHMgdG8gYW4gZXh0ZXJuYWwgdXBkYXRlIGluc3RydWN0aW9uLlxuICpcbiAqIEBwYXJhbSBsb2NhbFJlc29sdmVyIFRoZSByZXNvbHZlciB0byB1c2UgdG8gbG9vayB1cCBleHByZXNzaW9ucyBieSBuYW1lIGFwcHJvcHJpYXRlbHlcbiAqIEBwYXJhbSBjb250ZXh0VmFyaWFibGVFeHByZXNzaW9uIFRoZSBleHByZXNzaW9uIHJlcHJlc2VudGluZyB0aGUgY29udGV4dCB2YXJpYWJsZSB1c2VkIHRvIGNyZWF0ZVxuICogdGhlIGZpbmFsIGFyZ3VtZW50IGV4cHJlc3Npb25zXG4gKiBAcGFyYW0gZXhwcmVzc2lvbldpdGhBcmd1bWVudHNUb0V4dHJhY3QgVGhlIGV4cHJlc3Npb24gdG8gdmlzaXQgdG8gZmlndXJlIG91dCB3aGF0IHZhbHVlcyBuZWVkIHRvXG4gKiBiZSByZXNvbHZlZCBhbmQgd2hhdCBhcmd1bWVudHMgbGlzdCB0byBidWlsZC5cbiAqIEBwYXJhbSBiaW5kaW5nSWQgQSBuYW1lIHByZWZpeCB1c2VkIHRvIGNyZWF0ZSB0ZW1wb3JhcnkgdmFyaWFibGUgbmFtZXMgaWYgdGhleSdyZSBuZWVkZWQgZm9yIHRoZVxuICogYXJndW1lbnRzIGdlbmVyYXRlZFxuICogQHJldHVybnMgQW4gYXJyYXkgb2YgZXhwcmVzc2lvbnMgdGhhdCBjYW4gYmUgcGFzc2VkIGFzIGFyZ3VtZW50cyB0byBpbnN0cnVjdGlvbiBleHByZXNzaW9ucyBsaWtlXG4gKiBgby5pbXBvcnRFeHByKFIzLnByb3BlcnR5SW50ZXJwb2xhdGUpLmNhbGxGbihyZXN1bHQpYFxuICovXG5leHBvcnQgZnVuY3Rpb24gY29udmVydFVwZGF0ZUFyZ3VtZW50cyhcbiAgICBsb2NhbFJlc29sdmVyOiBMb2NhbFJlc29sdmVyLCBjb250ZXh0VmFyaWFibGVFeHByZXNzaW9uOiBvLkV4cHJlc3Npb24sXG4gICAgZXhwcmVzc2lvbldpdGhBcmd1bWVudHNUb0V4dHJhY3Q6IGNkQXN0LkludGVycG9sYXRpb24sIGJpbmRpbmdJZDogc3RyaW5nKSB7XG4gIGNvbnN0IHZpc2l0b3IgPSBuZXcgX0FzdFRvSXJWaXNpdG9yKFxuICAgICAgbG9jYWxSZXNvbHZlciwgY29udGV4dFZhcmlhYmxlRXhwcmVzc2lvbiwgYmluZGluZ0lkLCAvKiBzdXBwb3J0c0ludGVycG9sYXRpb24gKi8gdHJ1ZSk7XG4gIGNvbnN0IG91dHB1dEV4cHIgPSB2aXNpdG9yLnZpc2l0SW50ZXJwb2xhdGlvbihleHByZXNzaW9uV2l0aEFyZ3VtZW50c1RvRXh0cmFjdCwgX01vZGUuRXhwcmVzc2lvbik7XG5cbiAgaWYgKHZpc2l0b3IudXNlc0ltcGxpY2l0UmVjZWl2ZXIpIHtcbiAgICBsb2NhbFJlc29sdmVyLm5vdGlmeUltcGxpY2l0UmVjZWl2ZXJVc2UoKTtcbiAgfVxuXG4gIGNvbnN0IHN0bXRzID0gZ2V0U3RhdGVtZW50c0Zyb21WaXNpdG9yKHZpc2l0b3IsIGJpbmRpbmdJZCk7XG4gIGNvbnN0IGFyZ3MgPSBvdXRwdXRFeHByLmFyZ3M7XG4gIHJldHVybiB7c3RtdHMsIGFyZ3N9O1xufVxuXG5mdW5jdGlvbiBnZXRTdGF0ZW1lbnRzRnJvbVZpc2l0b3IodmlzaXRvcjogX0FzdFRvSXJWaXNpdG9yLCBiaW5kaW5nSWQ6IHN0cmluZykge1xuICBjb25zdCBzdG10czogby5TdGF0ZW1lbnRbXSA9IFtdO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHZpc2l0b3IudGVtcG9yYXJ5Q291bnQ7IGkrKykge1xuICAgIHN0bXRzLnB1c2godGVtcG9yYXJ5RGVjbGFyYXRpb24oYmluZGluZ0lkLCBpKSk7XG4gIH1cbiAgcmV0dXJuIHN0bXRzO1xufVxuXG5mdW5jdGlvbiBjb252ZXJ0QnVpbHRpbnMoY29udmVydGVyRmFjdG9yeTogQnVpbHRpbkNvbnZlcnRlckZhY3RvcnksIGFzdDogY2RBc3QuQVNUKTogY2RBc3QuQVNUIHtcbiAgY29uc3QgdmlzaXRvciA9IG5ldyBfQnVpbHRpbkFzdENvbnZlcnRlcihjb252ZXJ0ZXJGYWN0b3J5KTtcbiAgcmV0dXJuIGFzdC52aXNpdCh2aXNpdG9yKTtcbn1cblxuZnVuY3Rpb24gY29udmVydEFjdGlvbkJ1aWx0aW5zKGFjdGlvbjogY2RBc3QuQVNUKSB7XG4gIGNvbnN0IGNvbnZlcnRlckZhY3Rvcnk6IEJ1aWx0aW5Db252ZXJ0ZXJGYWN0b3J5ID0ge1xuICAgIGNyZWF0ZUxpdGVyYWxBcnJheUNvbnZlcnRlcjogKCkgPT4ge1xuICAgICAgLy8gTm90ZTogbm8gY2FjaGluZyBmb3IgbGl0ZXJhbCBhcnJheXMgaW4gYWN0aW9ucy5cbiAgICAgIHJldHVybiAoYXJnczogby5FeHByZXNzaW9uW10pID0+IG8ubGl0ZXJhbEFycihhcmdzKTtcbiAgICB9LFxuICAgIGNyZWF0ZUxpdGVyYWxNYXBDb252ZXJ0ZXI6IChrZXlzOiB7a2V5OiBzdHJpbmcsIHF1b3RlZDogYm9vbGVhbn1bXSkgPT4ge1xuICAgICAgLy8gTm90ZTogbm8gY2FjaGluZyBmb3IgbGl0ZXJhbCBtYXBzIGluIGFjdGlvbnMuXG4gICAgICByZXR1cm4gKHZhbHVlczogby5FeHByZXNzaW9uW10pID0+IHtcbiAgICAgICAgY29uc3QgZW50cmllcyA9IGtleXMubWFwKChrLCBpKSA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk6IGsua2V5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWVzW2ldLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdW90ZWQ6IGsucXVvdGVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICByZXR1cm4gby5saXRlcmFsTWFwKGVudHJpZXMpO1xuICAgICAgfTtcbiAgICB9LFxuICAgIGNyZWF0ZVBpcGVDb252ZXJ0ZXI6IChuYW1lOiBzdHJpbmcpID0+IHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSWxsZWdhbCBTdGF0ZTogQWN0aW9ucyBhcmUgbm90IGFsbG93ZWQgdG8gY29udGFpbiBwaXBlcy4gUGlwZTogJHtuYW1lfWApO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gY29udmVydFByb3BlcnR5QmluZGluZ0J1aWx0aW5zKGNvbnZlcnRlckZhY3RvcnksIGFjdGlvbik7XG59XG5cbmZ1bmN0aW9uIHRlbXBvcmFyeU5hbWUoYmluZGluZ0lkOiBzdHJpbmcsIHRlbXBvcmFyeU51bWJlcjogbnVtYmVyKTogc3RyaW5nIHtcbiAgcmV0dXJuIGB0bXBfJHtiaW5kaW5nSWR9XyR7dGVtcG9yYXJ5TnVtYmVyfWA7XG59XG5cbmZ1bmN0aW9uIHRlbXBvcmFyeURlY2xhcmF0aW9uKGJpbmRpbmdJZDogc3RyaW5nLCB0ZW1wb3JhcnlOdW1iZXI6IG51bWJlcik6IG8uU3RhdGVtZW50IHtcbiAgcmV0dXJuIG5ldyBvLkRlY2xhcmVWYXJTdG10KHRlbXBvcmFyeU5hbWUoYmluZGluZ0lkLCB0ZW1wb3JhcnlOdW1iZXIpKTtcbn1cblxuZnVuY3Rpb24gcHJlcGVuZFRlbXBvcmFyeURlY2xzKFxuICAgIHRlbXBvcmFyeUNvdW50OiBudW1iZXIsIGJpbmRpbmdJZDogc3RyaW5nLCBzdGF0ZW1lbnRzOiBvLlN0YXRlbWVudFtdKSB7XG4gIGZvciAobGV0IGkgPSB0ZW1wb3JhcnlDb3VudCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgc3RhdGVtZW50cy51bnNoaWZ0KHRlbXBvcmFyeURlY2xhcmF0aW9uKGJpbmRpbmdJZCwgaSkpO1xuICB9XG59XG5cbmVudW0gX01vZGUge1xuICBTdGF0ZW1lbnQsXG4gIEV4cHJlc3Npb25cbn1cblxuZnVuY3Rpb24gZW5zdXJlU3RhdGVtZW50TW9kZShtb2RlOiBfTW9kZSwgYXN0OiBjZEFzdC5BU1QpIHtcbiAgaWYgKG1vZGUgIT09IF9Nb2RlLlN0YXRlbWVudCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgYSBzdGF0ZW1lbnQsIGJ1dCBzYXcgJHthc3R9YCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZW5zdXJlRXhwcmVzc2lvbk1vZGUobW9kZTogX01vZGUsIGFzdDogY2RBc3QuQVNUKSB7XG4gIGlmIChtb2RlICE9PSBfTW9kZS5FeHByZXNzaW9uKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCBhbiBleHByZXNzaW9uLCBidXQgc2F3ICR7YXN0fWApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnRUb1N0YXRlbWVudElmTmVlZGVkKG1vZGU6IF9Nb2RlLCBleHByOiBvLkV4cHJlc3Npb24pOiBvLkV4cHJlc3Npb258by5TdGF0ZW1lbnQge1xuICBpZiAobW9kZSA9PT0gX01vZGUuU3RhdGVtZW50KSB7XG4gICAgcmV0dXJuIGV4cHIudG9TdG10KCk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGV4cHI7XG4gIH1cbn1cblxuY2xhc3MgX0J1aWx0aW5Bc3RDb252ZXJ0ZXIgZXh0ZW5kcyBjZEFzdC5Bc3RUcmFuc2Zvcm1lciB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2NvbnZlcnRlckZhY3Rvcnk6IEJ1aWx0aW5Db252ZXJ0ZXJGYWN0b3J5KSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuICBvdmVycmlkZSB2aXNpdFBpcGUoYXN0OiBjZEFzdC5CaW5kaW5nUGlwZSwgY29udGV4dDogYW55KTogYW55IHtcbiAgICBjb25zdCBhcmdzID0gW2FzdC5leHAsIC4uLmFzdC5hcmdzXS5tYXAoYXN0ID0+IGFzdC52aXNpdCh0aGlzLCBjb250ZXh0KSk7XG4gICAgcmV0dXJuIG5ldyBCdWlsdGluRnVuY3Rpb25DYWxsKFxuICAgICAgICBhc3Quc3BhbiwgYXN0LnNvdXJjZVNwYW4sIGFyZ3MsXG4gICAgICAgIHRoaXMuX2NvbnZlcnRlckZhY3RvcnkuY3JlYXRlUGlwZUNvbnZlcnRlcihhc3QubmFtZSwgYXJncy5sZW5ndGgpKTtcbiAgfVxuICBvdmVycmlkZSB2aXNpdExpdGVyYWxBcnJheShhc3Q6IGNkQXN0LkxpdGVyYWxBcnJheSwgY29udGV4dDogYW55KTogYW55IHtcbiAgICBjb25zdCBhcmdzID0gYXN0LmV4cHJlc3Npb25zLm1hcChhc3QgPT4gYXN0LnZpc2l0KHRoaXMsIGNvbnRleHQpKTtcbiAgICByZXR1cm4gbmV3IEJ1aWx0aW5GdW5jdGlvbkNhbGwoXG4gICAgICAgIGFzdC5zcGFuLCBhc3Quc291cmNlU3BhbiwgYXJncyxcbiAgICAgICAgdGhpcy5fY29udmVydGVyRmFjdG9yeS5jcmVhdGVMaXRlcmFsQXJyYXlDb252ZXJ0ZXIoYXN0LmV4cHJlc3Npb25zLmxlbmd0aCkpO1xuICB9XG4gIG92ZXJyaWRlIHZpc2l0TGl0ZXJhbE1hcChhc3Q6IGNkQXN0LkxpdGVyYWxNYXAsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgY29uc3QgYXJncyA9IGFzdC52YWx1ZXMubWFwKGFzdCA9PiBhc3QudmlzaXQodGhpcywgY29udGV4dCkpO1xuXG4gICAgcmV0dXJuIG5ldyBCdWlsdGluRnVuY3Rpb25DYWxsKFxuICAgICAgICBhc3Quc3BhbiwgYXN0LnNvdXJjZVNwYW4sIGFyZ3MsIHRoaXMuX2NvbnZlcnRlckZhY3RvcnkuY3JlYXRlTGl0ZXJhbE1hcENvbnZlcnRlcihhc3Qua2V5cykpO1xuICB9XG59XG5cbmNsYXNzIF9Bc3RUb0lyVmlzaXRvciBpbXBsZW1lbnRzIGNkQXN0LkFzdFZpc2l0b3Ige1xuICBwcml2YXRlIF9ub2RlTWFwID0gbmV3IE1hcDxjZEFzdC5BU1QsIGNkQXN0LkFTVD4oKTtcbiAgcHJpdmF0ZSBfcmVzdWx0TWFwID0gbmV3IE1hcDxjZEFzdC5BU1QsIG8uRXhwcmVzc2lvbj4oKTtcbiAgcHJpdmF0ZSBfY3VycmVudFRlbXBvcmFyeTogbnVtYmVyID0gMDtcbiAgcHVibGljIHRlbXBvcmFyeUNvdW50OiBudW1iZXIgPSAwO1xuICBwdWJsaWMgdXNlc0ltcGxpY2l0UmVjZWl2ZXI6IGJvb2xlYW4gPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgX2xvY2FsUmVzb2x2ZXI6IExvY2FsUmVzb2x2ZXIsIHByaXZhdGUgX2ltcGxpY2l0UmVjZWl2ZXI6IG8uRXhwcmVzc2lvbixcbiAgICAgIHByaXZhdGUgYmluZGluZ0lkOiBzdHJpbmcsIHByaXZhdGUgc3VwcG9ydHNJbnRlcnBvbGF0aW9uOiBib29sZWFuLFxuICAgICAgcHJpdmF0ZSBiYXNlU291cmNlU3Bhbj86IFBhcnNlU291cmNlU3BhbiwgcHJpdmF0ZSBpbXBsaWNpdFJlY2VpdmVyQWNjZXNzZXM/OiBTZXQ8c3RyaW5nPikge31cblxuICB2aXNpdFVuYXJ5KGFzdDogY2RBc3QuVW5hcnksIG1vZGU6IF9Nb2RlKTogYW55IHtcbiAgICBsZXQgb3A6IG8uVW5hcnlPcGVyYXRvcjtcbiAgICBzd2l0Y2ggKGFzdC5vcGVyYXRvcikge1xuICAgICAgY2FzZSAnKyc6XG4gICAgICAgIG9wID0gby5VbmFyeU9wZXJhdG9yLlBsdXM7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnLSc6XG4gICAgICAgIG9wID0gby5VbmFyeU9wZXJhdG9yLk1pbnVzO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5zdXBwb3J0ZWQgb3BlcmF0b3IgJHthc3Qub3BlcmF0b3J9YCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbnZlcnRUb1N0YXRlbWVudElmTmVlZGVkKFxuICAgICAgICBtb2RlLFxuICAgICAgICBuZXcgby5VbmFyeU9wZXJhdG9yRXhwcihcbiAgICAgICAgICAgIG9wLCB0aGlzLl92aXNpdChhc3QuZXhwciwgX01vZGUuRXhwcmVzc2lvbiksIHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHRoaXMuY29udmVydFNvdXJjZVNwYW4oYXN0LnNwYW4pKSk7XG4gIH1cblxuICB2aXNpdEJpbmFyeShhc3Q6IGNkQXN0LkJpbmFyeSwgbW9kZTogX01vZGUpOiBhbnkge1xuICAgIGxldCBvcDogby5CaW5hcnlPcGVyYXRvcjtcbiAgICBzd2l0Y2ggKGFzdC5vcGVyYXRpb24pIHtcbiAgICAgIGNhc2UgJysnOlxuICAgICAgICBvcCA9IG8uQmluYXJ5T3BlcmF0b3IuUGx1cztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICctJzpcbiAgICAgICAgb3AgPSBvLkJpbmFyeU9wZXJhdG9yLk1pbnVzO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJyonOlxuICAgICAgICBvcCA9IG8uQmluYXJ5T3BlcmF0b3IuTXVsdGlwbHk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnLyc6XG4gICAgICAgIG9wID0gby5CaW5hcnlPcGVyYXRvci5EaXZpZGU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnJSc6XG4gICAgICAgIG9wID0gby5CaW5hcnlPcGVyYXRvci5Nb2R1bG87XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnJiYnOlxuICAgICAgICBvcCA9IG8uQmluYXJ5T3BlcmF0b3IuQW5kO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3x8JzpcbiAgICAgICAgb3AgPSBvLkJpbmFyeU9wZXJhdG9yLk9yO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJz09JzpcbiAgICAgICAgb3AgPSBvLkJpbmFyeU9wZXJhdG9yLkVxdWFscztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICchPSc6XG4gICAgICAgIG9wID0gby5CaW5hcnlPcGVyYXRvci5Ob3RFcXVhbHM7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnPT09JzpcbiAgICAgICAgb3AgPSBvLkJpbmFyeU9wZXJhdG9yLklkZW50aWNhbDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICchPT0nOlxuICAgICAgICBvcCA9IG8uQmluYXJ5T3BlcmF0b3IuTm90SWRlbnRpY2FsO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJzwnOlxuICAgICAgICBvcCA9IG8uQmluYXJ5T3BlcmF0b3IuTG93ZXI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnPic6XG4gICAgICAgIG9wID0gby5CaW5hcnlPcGVyYXRvci5CaWdnZXI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnPD0nOlxuICAgICAgICBvcCA9IG8uQmluYXJ5T3BlcmF0b3IuTG93ZXJFcXVhbHM7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnPj0nOlxuICAgICAgICBvcCA9IG8uQmluYXJ5T3BlcmF0b3IuQmlnZ2VyRXF1YWxzO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJz8/JzpcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udmVydE51bGxpc2hDb2FsZXNjZShhc3QsIG1vZGUpO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCBvcGVyYXRpb24gJHthc3Qub3BlcmF0aW9ufWApO1xuICAgIH1cblxuICAgIHJldHVybiBjb252ZXJ0VG9TdGF0ZW1lbnRJZk5lZWRlZChcbiAgICAgICAgbW9kZSxcbiAgICAgICAgbmV3IG8uQmluYXJ5T3BlcmF0b3JFeHByKFxuICAgICAgICAgICAgb3AsIHRoaXMuX3Zpc2l0KGFzdC5sZWZ0LCBfTW9kZS5FeHByZXNzaW9uKSwgdGhpcy5fdmlzaXQoYXN0LnJpZ2h0LCBfTW9kZS5FeHByZXNzaW9uKSxcbiAgICAgICAgICAgIHVuZGVmaW5lZCwgdGhpcy5jb252ZXJ0U291cmNlU3Bhbihhc3Quc3BhbikpKTtcbiAgfVxuXG4gIHZpc2l0Q2hhaW4oYXN0OiBjZEFzdC5DaGFpbiwgbW9kZTogX01vZGUpOiBhbnkge1xuICAgIGVuc3VyZVN0YXRlbWVudE1vZGUobW9kZSwgYXN0KTtcbiAgICByZXR1cm4gdGhpcy52aXNpdEFsbChhc3QuZXhwcmVzc2lvbnMsIG1vZGUpO1xuICB9XG5cbiAgdmlzaXRDb25kaXRpb25hbChhc3Q6IGNkQXN0LkNvbmRpdGlvbmFsLCBtb2RlOiBfTW9kZSk6IGFueSB7XG4gICAgY29uc3QgdmFsdWU6IG8uRXhwcmVzc2lvbiA9IHRoaXMuX3Zpc2l0KGFzdC5jb25kaXRpb24sIF9Nb2RlLkV4cHJlc3Npb24pO1xuICAgIHJldHVybiBjb252ZXJ0VG9TdGF0ZW1lbnRJZk5lZWRlZChcbiAgICAgICAgbW9kZSxcbiAgICAgICAgdmFsdWUuY29uZGl0aW9uYWwoXG4gICAgICAgICAgICB0aGlzLl92aXNpdChhc3QudHJ1ZUV4cCwgX01vZGUuRXhwcmVzc2lvbiksIHRoaXMuX3Zpc2l0KGFzdC5mYWxzZUV4cCwgX01vZGUuRXhwcmVzc2lvbiksXG4gICAgICAgICAgICB0aGlzLmNvbnZlcnRTb3VyY2VTcGFuKGFzdC5zcGFuKSkpO1xuICB9XG5cbiAgdmlzaXRQaXBlKGFzdDogY2RBc3QuQmluZGluZ1BpcGUsIG1vZGU6IF9Nb2RlKTogYW55IHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBJbGxlZ2FsIHN0YXRlOiBQaXBlcyBzaG91bGQgaGF2ZSBiZWVuIGNvbnZlcnRlZCBpbnRvIGZ1bmN0aW9ucy4gUGlwZTogJHthc3QubmFtZX1gKTtcbiAgfVxuXG4gIHZpc2l0SW1wbGljaXRSZWNlaXZlcihhc3Q6IGNkQXN0LkltcGxpY2l0UmVjZWl2ZXIsIG1vZGU6IF9Nb2RlKTogYW55IHtcbiAgICBlbnN1cmVFeHByZXNzaW9uTW9kZShtb2RlLCBhc3QpO1xuICAgIHRoaXMudXNlc0ltcGxpY2l0UmVjZWl2ZXIgPSB0cnVlO1xuICAgIHJldHVybiB0aGlzLl9pbXBsaWNpdFJlY2VpdmVyO1xuICB9XG5cbiAgdmlzaXRUaGlzUmVjZWl2ZXIoYXN0OiBjZEFzdC5UaGlzUmVjZWl2ZXIsIG1vZGU6IF9Nb2RlKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy52aXNpdEltcGxpY2l0UmVjZWl2ZXIoYXN0LCBtb2RlKTtcbiAgfVxuXG4gIHZpc2l0SW50ZXJwb2xhdGlvbihhc3Q6IGNkQXN0LkludGVycG9sYXRpb24sIG1vZGU6IF9Nb2RlKTogSW50ZXJwb2xhdGlvbkV4cHJlc3Npb24ge1xuICAgIGlmICghdGhpcy5zdXBwb3J0c0ludGVycG9sYXRpb24pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5leHBlY3RlZCBpbnRlcnBvbGF0aW9uJyk7XG4gICAgfVxuXG4gICAgZW5zdXJlRXhwcmVzc2lvbk1vZGUobW9kZSwgYXN0KTtcbiAgICBsZXQgYXJnczogby5FeHByZXNzaW9uW10gPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFzdC5zdHJpbmdzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgYXJncy5wdXNoKG8ubGl0ZXJhbChhc3Quc3RyaW5nc1tpXSkpO1xuICAgICAgYXJncy5wdXNoKHRoaXMuX3Zpc2l0KGFzdC5leHByZXNzaW9uc1tpXSwgX01vZGUuRXhwcmVzc2lvbikpO1xuICAgIH1cbiAgICBhcmdzLnB1c2goby5saXRlcmFsKGFzdC5zdHJpbmdzW2FzdC5zdHJpbmdzLmxlbmd0aCAtIDFdKSk7XG5cbiAgICAvLyBJZiB3ZSdyZSBkZWFsaW5nIHdpdGggYW4gaW50ZXJwb2xhdGlvbiBvZiAxIHZhbHVlIHdpdGggYW4gZW1wdHkgcHJlZml4IGFuZCBzdWZmaXgsIHJlZHVjZSB0aGVcbiAgICAvLyBhcmdzIHJldHVybmVkIHRvIGp1c3QgdGhlIHZhbHVlLCBiZWNhdXNlIHdlJ3JlIGdvaW5nIHRvIHBhc3MgaXQgdG8gYSBzcGVjaWFsIGluc3RydWN0aW9uLlxuICAgIGNvbnN0IHN0cmluZ3MgPSBhc3Quc3RyaW5ncztcbiAgICBpZiAoc3RyaW5ncy5sZW5ndGggPT09IDIgJiYgc3RyaW5nc1swXSA9PT0gJycgJiYgc3RyaW5nc1sxXSA9PT0gJycpIHtcbiAgICAgIC8vIFNpbmdsZSBhcmd1bWVudCBpbnRlcnBvbGF0ZSBpbnN0cnVjdGlvbnMuXG4gICAgICBhcmdzID0gW2FyZ3NbMV1dO1xuICAgIH0gZWxzZSBpZiAoYXN0LmV4cHJlc3Npb25zLmxlbmd0aCA+PSA5KSB7XG4gICAgICAvLyA5IG9yIG1vcmUgYXJndW1lbnRzIG11c3QgYmUgcGFzc2VkIHRvIHRoZSBgaW50ZXJwb2xhdGVWYC1zdHlsZSBpbnN0cnVjdGlvbnMsIHdoaWNoIGFjY2VwdFxuICAgICAgLy8gYW4gYXJyYXkgb2YgYXJndW1lbnRzXG4gICAgICBhcmdzID0gW28ubGl0ZXJhbEFycihhcmdzKV07XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBJbnRlcnBvbGF0aW9uRXhwcmVzc2lvbihhcmdzKTtcbiAgfVxuXG4gIHZpc2l0S2V5ZWRSZWFkKGFzdDogY2RBc3QuS2V5ZWRSZWFkLCBtb2RlOiBfTW9kZSk6IGFueSB7XG4gICAgY29uc3QgbGVmdE1vc3RTYWZlID0gdGhpcy5sZWZ0TW9zdFNhZmVOb2RlKGFzdCk7XG4gICAgaWYgKGxlZnRNb3N0U2FmZSkge1xuICAgICAgcmV0dXJuIHRoaXMuY29udmVydFNhZmVBY2Nlc3MoYXN0LCBsZWZ0TW9zdFNhZmUsIG1vZGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY29udmVydFRvU3RhdGVtZW50SWZOZWVkZWQoXG4gICAgICAgICAgbW9kZSxcbiAgICAgICAgICB0aGlzLl92aXNpdChhc3QucmVjZWl2ZXIsIF9Nb2RlLkV4cHJlc3Npb24pLmtleSh0aGlzLl92aXNpdChhc3Qua2V5LCBfTW9kZS5FeHByZXNzaW9uKSkpO1xuICAgIH1cbiAgfVxuXG4gIHZpc2l0S2V5ZWRXcml0ZShhc3Q6IGNkQXN0LktleWVkV3JpdGUsIG1vZGU6IF9Nb2RlKTogYW55IHtcbiAgICBjb25zdCBvYmo6IG8uRXhwcmVzc2lvbiA9IHRoaXMuX3Zpc2l0KGFzdC5yZWNlaXZlciwgX01vZGUuRXhwcmVzc2lvbik7XG4gICAgY29uc3Qga2V5OiBvLkV4cHJlc3Npb24gPSB0aGlzLl92aXNpdChhc3Qua2V5LCBfTW9kZS5FeHByZXNzaW9uKTtcbiAgICBjb25zdCB2YWx1ZTogby5FeHByZXNzaW9uID0gdGhpcy5fdmlzaXQoYXN0LnZhbHVlLCBfTW9kZS5FeHByZXNzaW9uKTtcblxuICAgIGlmIChvYmogPT09IHRoaXMuX2ltcGxpY2l0UmVjZWl2ZXIpIHtcbiAgICAgIHRoaXMuX2xvY2FsUmVzb2x2ZXIubWF5YmVSZXN0b3JlVmlldygpO1xuICAgIH1cblxuICAgIHJldHVybiBjb252ZXJ0VG9TdGF0ZW1lbnRJZk5lZWRlZChtb2RlLCBvYmoua2V5KGtleSkuc2V0KHZhbHVlKSk7XG4gIH1cblxuICB2aXNpdExpdGVyYWxBcnJheShhc3Q6IGNkQXN0LkxpdGVyYWxBcnJheSwgbW9kZTogX01vZGUpOiBhbnkge1xuICAgIHRocm93IG5ldyBFcnJvcihgSWxsZWdhbCBTdGF0ZTogbGl0ZXJhbCBhcnJheXMgc2hvdWxkIGhhdmUgYmVlbiBjb252ZXJ0ZWQgaW50byBmdW5jdGlvbnNgKTtcbiAgfVxuXG4gIHZpc2l0TGl0ZXJhbE1hcChhc3Q6IGNkQXN0LkxpdGVyYWxNYXAsIG1vZGU6IF9Nb2RlKTogYW55IHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYElsbGVnYWwgU3RhdGU6IGxpdGVyYWwgbWFwcyBzaG91bGQgaGF2ZSBiZWVuIGNvbnZlcnRlZCBpbnRvIGZ1bmN0aW9uc2ApO1xuICB9XG5cbiAgdmlzaXRMaXRlcmFsUHJpbWl0aXZlKGFzdDogY2RBc3QuTGl0ZXJhbFByaW1pdGl2ZSwgbW9kZTogX01vZGUpOiBhbnkge1xuICAgIC8vIEZvciBsaXRlcmFsIHZhbHVlcyBvZiBudWxsLCB1bmRlZmluZWQsIHRydWUsIG9yIGZhbHNlIGFsbG93IHR5cGUgaW50ZXJmZXJlbmNlXG4gICAgLy8gdG8gaW5mZXIgdGhlIHR5cGUuXG4gICAgY29uc3QgdHlwZSA9XG4gICAgICAgIGFzdC52YWx1ZSA9PT0gbnVsbCB8fCBhc3QudmFsdWUgPT09IHVuZGVmaW5lZCB8fCBhc3QudmFsdWUgPT09IHRydWUgfHwgYXN0LnZhbHVlID09PSB0cnVlID9cbiAgICAgICAgby5JTkZFUlJFRF9UWVBFIDpcbiAgICAgICAgdW5kZWZpbmVkO1xuICAgIHJldHVybiBjb252ZXJ0VG9TdGF0ZW1lbnRJZk5lZWRlZChcbiAgICAgICAgbW9kZSwgby5saXRlcmFsKGFzdC52YWx1ZSwgdHlwZSwgdGhpcy5jb252ZXJ0U291cmNlU3Bhbihhc3Quc3BhbikpKTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldExvY2FsKG5hbWU6IHN0cmluZywgcmVjZWl2ZXI6IGNkQXN0LkFTVCk6IG8uRXhwcmVzc2lvbnxudWxsIHtcbiAgICBpZiAodGhpcy5fbG9jYWxSZXNvbHZlci5nbG9iYWxzPy5oYXMobmFtZSkgJiYgcmVjZWl2ZXIgaW5zdGFuY2VvZiBjZEFzdC5UaGlzUmVjZWl2ZXIpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9sb2NhbFJlc29sdmVyLmdldExvY2FsKG5hbWUpO1xuICB9XG5cbiAgdmlzaXRQcmVmaXhOb3QoYXN0OiBjZEFzdC5QcmVmaXhOb3QsIG1vZGU6IF9Nb2RlKTogYW55IHtcbiAgICByZXR1cm4gY29udmVydFRvU3RhdGVtZW50SWZOZWVkZWQobW9kZSwgby5ub3QodGhpcy5fdmlzaXQoYXN0LmV4cHJlc3Npb24sIF9Nb2RlLkV4cHJlc3Npb24pKSk7XG4gIH1cblxuICB2aXNpdE5vbk51bGxBc3NlcnQoYXN0OiBjZEFzdC5Ob25OdWxsQXNzZXJ0LCBtb2RlOiBfTW9kZSk6IGFueSB7XG4gICAgcmV0dXJuIGNvbnZlcnRUb1N0YXRlbWVudElmTmVlZGVkKG1vZGUsIHRoaXMuX3Zpc2l0KGFzdC5leHByZXNzaW9uLCBfTW9kZS5FeHByZXNzaW9uKSk7XG4gIH1cblxuICB2aXNpdFByb3BlcnR5UmVhZChhc3Q6IGNkQXN0LlByb3BlcnR5UmVhZCwgbW9kZTogX01vZGUpOiBhbnkge1xuICAgIGNvbnN0IGxlZnRNb3N0U2FmZSA9IHRoaXMubGVmdE1vc3RTYWZlTm9kZShhc3QpO1xuICAgIGlmIChsZWZ0TW9zdFNhZmUpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbnZlcnRTYWZlQWNjZXNzKGFzdCwgbGVmdE1vc3RTYWZlLCBtb2RlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHJlc3VsdDogYW55ID0gbnVsbDtcbiAgICAgIGNvbnN0IHByZXZVc2VzSW1wbGljaXRSZWNlaXZlciA9IHRoaXMudXNlc0ltcGxpY2l0UmVjZWl2ZXI7XG4gICAgICBjb25zdCByZWNlaXZlciA9IHRoaXMuX3Zpc2l0KGFzdC5yZWNlaXZlciwgX01vZGUuRXhwcmVzc2lvbik7XG4gICAgICBpZiAocmVjZWl2ZXIgPT09IHRoaXMuX2ltcGxpY2l0UmVjZWl2ZXIpIHtcbiAgICAgICAgcmVzdWx0ID0gdGhpcy5fZ2V0TG9jYWwoYXN0Lm5hbWUsIGFzdC5yZWNlaXZlcik7XG4gICAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgICAvLyBSZXN0b3JlIHRoZSBwcmV2aW91cyBcInVzZXNJbXBsaWNpdFJlY2VpdmVyXCIgc3RhdGUgc2luY2UgdGhlIGltcGxpY2l0XG4gICAgICAgICAgLy8gcmVjZWl2ZXIgaGFzIGJlZW4gcmVwbGFjZWQgd2l0aCBhIHJlc29sdmVkIGxvY2FsIGV4cHJlc3Npb24uXG4gICAgICAgICAgdGhpcy51c2VzSW1wbGljaXRSZWNlaXZlciA9IHByZXZVc2VzSW1wbGljaXRSZWNlaXZlcjtcbiAgICAgICAgICB0aGlzLmFkZEltcGxpY2l0UmVjZWl2ZXJBY2Nlc3MoYXN0Lm5hbWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAocmVzdWx0ID09IG51bGwpIHtcbiAgICAgICAgcmVzdWx0ID0gcmVjZWl2ZXIucHJvcChhc3QubmFtZSwgdGhpcy5jb252ZXJ0U291cmNlU3Bhbihhc3Quc3BhbikpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNvbnZlcnRUb1N0YXRlbWVudElmTmVlZGVkKG1vZGUsIHJlc3VsdCk7XG4gICAgfVxuICB9XG5cbiAgdmlzaXRQcm9wZXJ0eVdyaXRlKGFzdDogY2RBc3QuUHJvcGVydHlXcml0ZSwgbW9kZTogX01vZGUpOiBhbnkge1xuICAgIGNvbnN0IHJlY2VpdmVyOiBvLkV4cHJlc3Npb24gPSB0aGlzLl92aXNpdChhc3QucmVjZWl2ZXIsIF9Nb2RlLkV4cHJlc3Npb24pO1xuICAgIGNvbnN0IHByZXZVc2VzSW1wbGljaXRSZWNlaXZlciA9IHRoaXMudXNlc0ltcGxpY2l0UmVjZWl2ZXI7XG5cbiAgICBsZXQgdmFyRXhwcjogby5SZWFkUHJvcEV4cHJ8bnVsbCA9IG51bGw7XG4gICAgaWYgKHJlY2VpdmVyID09PSB0aGlzLl9pbXBsaWNpdFJlY2VpdmVyKSB7XG4gICAgICBjb25zdCBsb2NhbEV4cHIgPSB0aGlzLl9nZXRMb2NhbChhc3QubmFtZSwgYXN0LnJlY2VpdmVyKTtcbiAgICAgIGlmIChsb2NhbEV4cHIpIHtcbiAgICAgICAgaWYgKGxvY2FsRXhwciBpbnN0YW5jZW9mIG8uUmVhZFByb3BFeHByKSB7XG4gICAgICAgICAgLy8gSWYgdGhlIGxvY2FsIHZhcmlhYmxlIGlzIGEgcHJvcGVydHkgcmVhZCBleHByZXNzaW9uLCBpdCdzIGEgcmVmZXJlbmNlXG4gICAgICAgICAgLy8gdG8gYSAnY29udGV4dC5wcm9wZXJ0eScgdmFsdWUgYW5kIHdpbGwgYmUgdXNlZCBhcyB0aGUgdGFyZ2V0IG9mIHRoZVxuICAgICAgICAgIC8vIHdyaXRlIGV4cHJlc3Npb24uXG4gICAgICAgICAgdmFyRXhwciA9IGxvY2FsRXhwcjtcbiAgICAgICAgICAvLyBSZXN0b3JlIHRoZSBwcmV2aW91cyBcInVzZXNJbXBsaWNpdFJlY2VpdmVyXCIgc3RhdGUgc2luY2UgdGhlIGltcGxpY2l0XG4gICAgICAgICAgLy8gcmVjZWl2ZXIgaGFzIGJlZW4gcmVwbGFjZWQgd2l0aCBhIHJlc29sdmVkIGxvY2FsIGV4cHJlc3Npb24uXG4gICAgICAgICAgdGhpcy51c2VzSW1wbGljaXRSZWNlaXZlciA9IHByZXZVc2VzSW1wbGljaXRSZWNlaXZlcjtcbiAgICAgICAgICB0aGlzLmFkZEltcGxpY2l0UmVjZWl2ZXJBY2Nlc3MoYXN0Lm5hbWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIE90aGVyd2lzZSBpdCdzIGFuIGVycm9yLlxuICAgICAgICAgIGNvbnN0IHJlY2VpdmVyID0gYXN0Lm5hbWU7XG4gICAgICAgICAgY29uc3QgdmFsdWUgPSAoYXN0LnZhbHVlIGluc3RhbmNlb2YgY2RBc3QuUHJvcGVydHlSZWFkKSA/IGFzdC52YWx1ZS5uYW1lIDogdW5kZWZpbmVkO1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IGFzc2lnbiB2YWx1ZSBcIiR7dmFsdWV9XCIgdG8gdGVtcGxhdGUgdmFyaWFibGUgXCIke1xuICAgICAgICAgICAgICByZWNlaXZlcn1cIi4gVGVtcGxhdGUgdmFyaWFibGVzIGFyZSByZWFkLW9ubHkuYCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgLy8gSWYgbm8gbG9jYWwgZXhwcmVzc2lvbiBjb3VsZCBiZSBwcm9kdWNlZCwgdXNlIHRoZSBvcmlnaW5hbCByZWNlaXZlcidzXG4gICAgLy8gcHJvcGVydHkgYXMgdGhlIHRhcmdldC5cbiAgICBpZiAodmFyRXhwciA9PT0gbnVsbCkge1xuICAgICAgdmFyRXhwciA9IHJlY2VpdmVyLnByb3AoYXN0Lm5hbWUsIHRoaXMuY29udmVydFNvdXJjZVNwYW4oYXN0LnNwYW4pKTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbnZlcnRUb1N0YXRlbWVudElmTmVlZGVkKG1vZGUsIHZhckV4cHIuc2V0KHRoaXMuX3Zpc2l0KGFzdC52YWx1ZSwgX01vZGUuRXhwcmVzc2lvbikpKTtcbiAgfVxuXG4gIHZpc2l0U2FmZVByb3BlcnR5UmVhZChhc3Q6IGNkQXN0LlNhZmVQcm9wZXJ0eVJlYWQsIG1vZGU6IF9Nb2RlKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5jb252ZXJ0U2FmZUFjY2Vzcyhhc3QsIHRoaXMubGVmdE1vc3RTYWZlTm9kZShhc3QpLCBtb2RlKTtcbiAgfVxuXG4gIHZpc2l0U2FmZUtleWVkUmVhZChhc3Q6IGNkQXN0LlNhZmVLZXllZFJlYWQsIG1vZGU6IF9Nb2RlKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5jb252ZXJ0U2FmZUFjY2Vzcyhhc3QsIHRoaXMubGVmdE1vc3RTYWZlTm9kZShhc3QpLCBtb2RlKTtcbiAgfVxuXG4gIHZpc2l0QWxsKGFzdHM6IGNkQXN0LkFTVFtdLCBtb2RlOiBfTW9kZSk6IGFueSB7XG4gICAgcmV0dXJuIGFzdHMubWFwKGFzdCA9PiB0aGlzLl92aXNpdChhc3QsIG1vZGUpKTtcbiAgfVxuXG4gIHZpc2l0Q2FsbChhc3Q6IGNkQXN0LkNhbGwsIG1vZGU6IF9Nb2RlKTogYW55IHtcbiAgICBjb25zdCBsZWZ0TW9zdFNhZmUgPSB0aGlzLmxlZnRNb3N0U2FmZU5vZGUoYXN0KTtcbiAgICBpZiAobGVmdE1vc3RTYWZlKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb252ZXJ0U2FmZUFjY2Vzcyhhc3QsIGxlZnRNb3N0U2FmZSwgbW9kZSk7XG4gICAgfVxuXG4gICAgY29uc3QgY29udmVydGVkQXJncyA9IHRoaXMudmlzaXRBbGwoYXN0LmFyZ3MsIF9Nb2RlLkV4cHJlc3Npb24pO1xuXG4gICAgaWYgKGFzdCBpbnN0YW5jZW9mIEJ1aWx0aW5GdW5jdGlvbkNhbGwpIHtcbiAgICAgIHJldHVybiBjb252ZXJ0VG9TdGF0ZW1lbnRJZk5lZWRlZChtb2RlLCBhc3QuY29udmVydGVyKGNvbnZlcnRlZEFyZ3MpKTtcbiAgICB9XG5cbiAgICBjb25zdCByZWNlaXZlciA9IGFzdC5yZWNlaXZlcjtcbiAgICBpZiAocmVjZWl2ZXIgaW5zdGFuY2VvZiBjZEFzdC5Qcm9wZXJ0eVJlYWQgJiZcbiAgICAgICAgcmVjZWl2ZXIucmVjZWl2ZXIgaW5zdGFuY2VvZiBjZEFzdC5JbXBsaWNpdFJlY2VpdmVyICYmXG4gICAgICAgICEocmVjZWl2ZXIucmVjZWl2ZXIgaW5zdGFuY2VvZiBjZEFzdC5UaGlzUmVjZWl2ZXIpICYmIHJlY2VpdmVyLm5hbWUgPT09ICckYW55Jykge1xuICAgICAgaWYgKGNvbnZlcnRlZEFyZ3MubGVuZ3RoICE9PSAxKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBjYWxsIHRvICRhbnksIGV4cGVjdGVkIDEgYXJndW1lbnQgYnV0IHJlY2VpdmVkICR7XG4gICAgICAgICAgICBjb252ZXJ0ZWRBcmdzLmxlbmd0aCB8fCAnbm9uZSd9YCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gY29udmVydFRvU3RhdGVtZW50SWZOZWVkZWQobW9kZSwgY29udmVydGVkQXJnc1swXSBhcyBvLkV4cHJlc3Npb24pO1xuICAgIH1cblxuICAgIGNvbnN0IGNhbGwgPSB0aGlzLl92aXNpdChyZWNlaXZlciwgX01vZGUuRXhwcmVzc2lvbilcbiAgICAgICAgICAgICAgICAgICAgIC5jYWxsRm4oY29udmVydGVkQXJncywgdGhpcy5jb252ZXJ0U291cmNlU3Bhbihhc3Quc3BhbikpO1xuICAgIHJldHVybiBjb252ZXJ0VG9TdGF0ZW1lbnRJZk5lZWRlZChtb2RlLCBjYWxsKTtcbiAgfVxuXG4gIHZpc2l0U2FmZUNhbGwoYXN0OiBjZEFzdC5TYWZlQ2FsbCwgbW9kZTogX01vZGUpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLmNvbnZlcnRTYWZlQWNjZXNzKGFzdCwgdGhpcy5sZWZ0TW9zdFNhZmVOb2RlKGFzdCksIG1vZGUpO1xuICB9XG5cbiAgcHJpdmF0ZSBfdmlzaXQoYXN0OiBjZEFzdC5BU1QsIG1vZGU6IF9Nb2RlKTogYW55IHtcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLl9yZXN1bHRNYXAuZ2V0KGFzdCk7XG4gICAgaWYgKHJlc3VsdCkgcmV0dXJuIHJlc3VsdDtcbiAgICByZXR1cm4gKHRoaXMuX25vZGVNYXAuZ2V0KGFzdCkgfHwgYXN0KS52aXNpdCh0aGlzLCBtb2RlKTtcbiAgfVxuXG4gIHByaXZhdGUgY29udmVydFNhZmVBY2Nlc3MoXG4gICAgICBhc3Q6IGNkQXN0LkFTVCwgbGVmdE1vc3RTYWZlOiBjZEFzdC5TYWZlUHJvcGVydHlSZWFkfGNkQXN0LlNhZmVLZXllZFJlYWR8Y2RBc3QuU2FmZUNhbGwsXG4gICAgICBtb2RlOiBfTW9kZSk6IGFueSB7XG4gICAgLy8gSWYgdGhlIGV4cHJlc3Npb24gY29udGFpbnMgYSBzYWZlIGFjY2VzcyBub2RlIG9uIHRoZSBsZWZ0IGl0IG5lZWRzIHRvIGJlIGNvbnZlcnRlZCB0b1xuICAgIC8vIGFuIGV4cHJlc3Npb24gdGhhdCBndWFyZHMgdGhlIGFjY2VzcyB0byB0aGUgbWVtYmVyIGJ5IGNoZWNraW5nIHRoZSByZWNlaXZlciBmb3IgYmxhbmsuIEFzXG4gICAgLy8gZXhlY3V0aW9uIHByb2NlZWRzIGZyb20gbGVmdCB0byByaWdodCwgdGhlIGxlZnQgbW9zdCBwYXJ0IG9mIHRoZSBleHByZXNzaW9uIG11c3QgYmUgZ3VhcmRlZFxuICAgIC8vIGZpcnN0IGJ1dCwgYmVjYXVzZSBtZW1iZXIgYWNjZXNzIGlzIGxlZnQgYXNzb2NpYXRpdmUsIHRoZSByaWdodCBzaWRlIG9mIHRoZSBleHByZXNzaW9uIGlzIGF0XG4gICAgLy8gdGhlIHRvcCBvZiB0aGUgQVNULiBUaGUgZGVzaXJlZCByZXN1bHQgcmVxdWlyZXMgbGlmdGluZyBhIGNvcHkgb2YgdGhlIGxlZnQgcGFydCBvZiB0aGVcbiAgICAvLyBleHByZXNzaW9uIHVwIHRvIHRlc3QgaXQgZm9yIGJsYW5rIGJlZm9yZSBnZW5lcmF0aW5nIHRoZSB1bmd1YXJkZWQgdmVyc2lvbi5cblxuICAgIC8vIENvbnNpZGVyLCBmb3IgZXhhbXBsZSB0aGUgZm9sbG93aW5nIGV4cHJlc3Npb246IGE/LmIuYz8uZC5lXG5cbiAgICAvLyBUaGlzIHJlc3VsdHMgaW4gdGhlIGFzdDpcbiAgICAvLyAgICAgICAgIC5cbiAgICAvLyAgICAgICAgLyBcXFxuICAgIC8vICAgICAgID8uICAgZVxuICAgIC8vICAgICAgLyAgXFxcbiAgICAvLyAgICAgLiAgICBkXG4gICAgLy8gICAgLyBcXFxuICAgIC8vICAgPy4gIGNcbiAgICAvLyAgLyAgXFxcbiAgICAvLyBhICAgIGJcblxuICAgIC8vIFRoZSBmb2xsb3dpbmcgdHJlZSBzaG91bGQgYmUgZ2VuZXJhdGVkOlxuICAgIC8vXG4gICAgLy8gICAgICAgIC8tLS0tID8gLS0tLVxcXG4gICAgLy8gICAgICAgLyAgICAgIHwgICAgICBcXFxuICAgIC8vICAgICBhICAgLy0tLSA/IC0tLVxcICBudWxsXG4gICAgLy8gICAgICAgIC8gICAgIHwgICAgIFxcXG4gICAgLy8gICAgICAgLiAgICAgIC4gICAgIG51bGxcbiAgICAvLyAgICAgIC8gXFwgICAgLyBcXFxuICAgIC8vICAgICAuICBjICAgLiAgIGVcbiAgICAvLyAgICAvIFxcICAgIC8gXFxcbiAgICAvLyAgIGEgICBiICAuICAgZFxuICAgIC8vICAgICAgICAgLyBcXFxuICAgIC8vICAgICAgICAuICAgY1xuICAgIC8vICAgICAgIC8gXFxcbiAgICAvLyAgICAgIGEgICBiXG4gICAgLy9cbiAgICAvLyBOb3RpY2UgdGhhdCB0aGUgZmlyc3QgZ3VhcmQgY29uZGl0aW9uIGlzIHRoZSBsZWZ0IGhhbmQgb2YgdGhlIGxlZnQgbW9zdCBzYWZlIGFjY2VzcyBub2RlXG4gICAgLy8gd2hpY2ggY29tZXMgaW4gYXMgbGVmdE1vc3RTYWZlIHRvIHRoaXMgcm91dGluZS5cblxuICAgIGxldCBndWFyZGVkRXhwcmVzc2lvbiA9IHRoaXMuX3Zpc2l0KGxlZnRNb3N0U2FmZS5yZWNlaXZlciwgX01vZGUuRXhwcmVzc2lvbik7XG4gICAgbGV0IHRlbXBvcmFyeTogby5SZWFkVmFyRXhwcnx1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgaWYgKHRoaXMubmVlZHNUZW1wb3JhcnlJblNhZmVBY2Nlc3MobGVmdE1vc3RTYWZlLnJlY2VpdmVyKSkge1xuICAgICAgLy8gSWYgdGhlIGV4cHJlc3Npb24gaGFzIG1ldGhvZCBjYWxscyBvciBwaXBlcyB0aGVuIHdlIG5lZWQgdG8gc2F2ZSB0aGUgcmVzdWx0IGludG8gYVxuICAgICAgLy8gdGVtcG9yYXJ5IHZhcmlhYmxlIHRvIGF2b2lkIGNhbGxpbmcgc3RhdGVmdWwgb3IgaW1wdXJlIGNvZGUgbW9yZSB0aGFuIG9uY2UuXG4gICAgICB0ZW1wb3JhcnkgPSB0aGlzLmFsbG9jYXRlVGVtcG9yYXJ5KCk7XG5cbiAgICAgIC8vIFByZXNlcnZlIHRoZSByZXN1bHQgaW4gdGhlIHRlbXBvcmFyeSB2YXJpYWJsZVxuICAgICAgZ3VhcmRlZEV4cHJlc3Npb24gPSB0ZW1wb3Jhcnkuc2V0KGd1YXJkZWRFeHByZXNzaW9uKTtcblxuICAgICAgLy8gRW5zdXJlIGFsbCBmdXJ0aGVyIHJlZmVyZW5jZXMgdG8gdGhlIGd1YXJkZWQgZXhwcmVzc2lvbiByZWZlciB0byB0aGUgdGVtcG9yYXJ5IGluc3RlYWQuXG4gICAgICB0aGlzLl9yZXN1bHRNYXAuc2V0KGxlZnRNb3N0U2FmZS5yZWNlaXZlciwgdGVtcG9yYXJ5KTtcbiAgICB9XG4gICAgY29uc3QgY29uZGl0aW9uID0gZ3VhcmRlZEV4cHJlc3Npb24uaXNCbGFuaygpO1xuXG4gICAgLy8gQ29udmVydCB0aGUgYXN0IHRvIGFuIHVuZ3VhcmRlZCBhY2Nlc3MgdG8gdGhlIHJlY2VpdmVyJ3MgbWVtYmVyLiBUaGUgbWFwIHdpbGwgc3Vic3RpdHV0ZVxuICAgIC8vIGxlZnRNb3N0Tm9kZSB3aXRoIGl0cyB1bmd1YXJkZWQgdmVyc2lvbiBpbiB0aGUgY2FsbCB0byBgdGhpcy52aXNpdCgpYC5cbiAgICBpZiAobGVmdE1vc3RTYWZlIGluc3RhbmNlb2YgY2RBc3QuU2FmZUNhbGwpIHtcbiAgICAgIHRoaXMuX25vZGVNYXAuc2V0KFxuICAgICAgICAgIGxlZnRNb3N0U2FmZSxcbiAgICAgICAgICBuZXcgY2RBc3QuQ2FsbChcbiAgICAgICAgICAgICAgbGVmdE1vc3RTYWZlLnNwYW4sIGxlZnRNb3N0U2FmZS5zb3VyY2VTcGFuLCBsZWZ0TW9zdFNhZmUucmVjZWl2ZXIsIGxlZnRNb3N0U2FmZS5hcmdzLFxuICAgICAgICAgICAgICBsZWZ0TW9zdFNhZmUuYXJndW1lbnRTcGFuKSk7XG4gICAgfSBlbHNlIGlmIChsZWZ0TW9zdFNhZmUgaW5zdGFuY2VvZiBjZEFzdC5TYWZlS2V5ZWRSZWFkKSB7XG4gICAgICB0aGlzLl9ub2RlTWFwLnNldChcbiAgICAgICAgICBsZWZ0TW9zdFNhZmUsXG4gICAgICAgICAgbmV3IGNkQXN0LktleWVkUmVhZChcbiAgICAgICAgICAgICAgbGVmdE1vc3RTYWZlLnNwYW4sIGxlZnRNb3N0U2FmZS5zb3VyY2VTcGFuLCBsZWZ0TW9zdFNhZmUucmVjZWl2ZXIsIGxlZnRNb3N0U2FmZS5rZXkpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fbm9kZU1hcC5zZXQoXG4gICAgICAgICAgbGVmdE1vc3RTYWZlLFxuICAgICAgICAgIG5ldyBjZEFzdC5Qcm9wZXJ0eVJlYWQoXG4gICAgICAgICAgICAgIGxlZnRNb3N0U2FmZS5zcGFuLCBsZWZ0TW9zdFNhZmUuc291cmNlU3BhbiwgbGVmdE1vc3RTYWZlLm5hbWVTcGFuLFxuICAgICAgICAgICAgICBsZWZ0TW9zdFNhZmUucmVjZWl2ZXIsIGxlZnRNb3N0U2FmZS5uYW1lKSk7XG4gICAgfVxuXG4gICAgLy8gUmVjdXJzaXZlbHkgY29udmVydCB0aGUgbm9kZSBub3cgd2l0aG91dCB0aGUgZ3VhcmRlZCBtZW1iZXIgYWNjZXNzLlxuICAgIGNvbnN0IGFjY2VzcyA9IHRoaXMuX3Zpc2l0KGFzdCwgX01vZGUuRXhwcmVzc2lvbik7XG5cbiAgICAvLyBSZW1vdmUgdGhlIG1hcHBpbmcuIFRoaXMgaXMgbm90IHN0cmljdGx5IHJlcXVpcmVkIGFzIHRoZSBjb252ZXJ0ZXIgb25seSB0cmF2ZXJzZXMgZWFjaCBub2RlXG4gICAgLy8gb25jZSBidXQgaXMgc2FmZXIgaWYgdGhlIGNvbnZlcnNpb24gaXMgY2hhbmdlZCB0byB0cmF2ZXJzZSB0aGUgbm9kZXMgbW9yZSB0aGFuIG9uY2UuXG4gICAgdGhpcy5fbm9kZU1hcC5kZWxldGUobGVmdE1vc3RTYWZlKTtcblxuICAgIC8vIElmIHdlIGFsbG9jYXRlZCBhIHRlbXBvcmFyeSwgcmVsZWFzZSBpdC5cbiAgICBpZiAodGVtcG9yYXJ5KSB7XG4gICAgICB0aGlzLnJlbGVhc2VUZW1wb3JhcnkodGVtcG9yYXJ5KTtcbiAgICB9XG5cbiAgICAvLyBQcm9kdWNlIHRoZSBjb25kaXRpb25hbFxuICAgIHJldHVybiBjb252ZXJ0VG9TdGF0ZW1lbnRJZk5lZWRlZChtb2RlLCBjb25kaXRpb24uY29uZGl0aW9uYWwoby5OVUxMX0VYUFIsIGFjY2VzcykpO1xuICB9XG5cbiAgcHJpdmF0ZSBjb252ZXJ0TnVsbGlzaENvYWxlc2NlKGFzdDogY2RBc3QuQmluYXJ5LCBtb2RlOiBfTW9kZSk6IGFueSB7XG4gICAgY29uc3QgbGVmdDogby5FeHByZXNzaW9uID0gdGhpcy5fdmlzaXQoYXN0LmxlZnQsIF9Nb2RlLkV4cHJlc3Npb24pO1xuICAgIGNvbnN0IHJpZ2h0OiBvLkV4cHJlc3Npb24gPSB0aGlzLl92aXNpdChhc3QucmlnaHQsIF9Nb2RlLkV4cHJlc3Npb24pO1xuICAgIGNvbnN0IHRlbXBvcmFyeSA9IHRoaXMuYWxsb2NhdGVUZW1wb3JhcnkoKTtcbiAgICB0aGlzLnJlbGVhc2VUZW1wb3JhcnkodGVtcG9yYXJ5KTtcblxuICAgIC8vIEdlbmVyYXRlIHRoZSBmb2xsb3dpbmcgZXhwcmVzc2lvbi4gSXQgaXMgaWRlbnRpY2FsIHRvIGhvdyBUU1xuICAgIC8vIHRyYW5zcGlsZXMgYmluYXJ5IGV4cHJlc3Npb25zIHdpdGggYSBudWxsaXNoIGNvYWxlc2Npbmcgb3BlcmF0b3IuXG4gICAgLy8gbGV0IHRlbXA7XG4gICAgLy8gKHRlbXAgPSBhKSAhPT0gbnVsbCAmJiB0ZW1wICE9PSB1bmRlZmluZWQgPyB0ZW1wIDogYjtcbiAgICByZXR1cm4gY29udmVydFRvU3RhdGVtZW50SWZOZWVkZWQoXG4gICAgICAgIG1vZGUsXG4gICAgICAgIHRlbXBvcmFyeS5zZXQobGVmdClcbiAgICAgICAgICAgIC5ub3RJZGVudGljYWwoby5OVUxMX0VYUFIpXG4gICAgICAgICAgICAuYW5kKHRlbXBvcmFyeS5ub3RJZGVudGljYWwoby5saXRlcmFsKHVuZGVmaW5lZCkpKVxuICAgICAgICAgICAgLmNvbmRpdGlvbmFsKHRlbXBvcmFyeSwgcmlnaHQpKTtcbiAgfVxuXG4gIC8vIEdpdmVuIGFuIGV4cHJlc3Npb24gb2YgdGhlIGZvcm0gYT8uYi5jPy5kLmUgdGhlbiB0aGUgbGVmdCBtb3N0IHNhZmUgbm9kZSBpc1xuICAvLyB0aGUgKGE/LmIpLiBUaGUgLiBhbmQgPy4gYXJlIGxlZnQgYXNzb2NpYXRpdmUgdGh1cyBjYW4gYmUgcmV3cml0dGVuIGFzOlxuICAvLyAoKCgoYT8uYykuYikuYyk/LmQpLmUuIFRoaXMgcmV0dXJucyB0aGUgbW9zdCBkZWVwbHkgbmVzdGVkIHNhZmUgcmVhZCBvclxuICAvLyBzYWZlIG1ldGhvZCBjYWxsIGFzIHRoaXMgbmVlZHMgdG8gYmUgdHJhbnNmb3JtZWQgaW5pdGlhbGx5IHRvOlxuICAvLyAgIGEgPT0gbnVsbCA/IG51bGwgOiBhLmMuYi5jPy5kLmVcbiAgLy8gdGhlbiB0bzpcbiAgLy8gICBhID09IG51bGwgPyBudWxsIDogYS5iLmMgPT0gbnVsbCA/IG51bGwgOiBhLmIuYy5kLmVcbiAgcHJpdmF0ZSBsZWZ0TW9zdFNhZmVOb2RlKGFzdDogY2RBc3QuQVNUKTogY2RBc3QuU2FmZVByb3BlcnR5UmVhZHxjZEFzdC5TYWZlS2V5ZWRSZWFkIHtcbiAgICBjb25zdCB2aXNpdCA9ICh2aXNpdG9yOiBjZEFzdC5Bc3RWaXNpdG9yLCBhc3Q6IGNkQXN0LkFTVCk6IGFueSA9PiB7XG4gICAgICByZXR1cm4gKHRoaXMuX25vZGVNYXAuZ2V0KGFzdCkgfHwgYXN0KS52aXNpdCh2aXNpdG9yKTtcbiAgICB9O1xuICAgIHJldHVybiBhc3QudmlzaXQoe1xuICAgICAgdmlzaXRVbmFyeShhc3Q6IGNkQXN0LlVuYXJ5KSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfSxcbiAgICAgIHZpc2l0QmluYXJ5KGFzdDogY2RBc3QuQmluYXJ5KSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfSxcbiAgICAgIHZpc2l0Q2hhaW4oYXN0OiBjZEFzdC5DaGFpbikge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH0sXG4gICAgICB2aXNpdENvbmRpdGlvbmFsKGFzdDogY2RBc3QuQ29uZGl0aW9uYWwpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9LFxuICAgICAgdmlzaXRDYWxsKGFzdDogY2RBc3QuQ2FsbCkge1xuICAgICAgICByZXR1cm4gdmlzaXQodGhpcywgYXN0LnJlY2VpdmVyKTtcbiAgICAgIH0sXG4gICAgICB2aXNpdFNhZmVDYWxsKGFzdDogY2RBc3QuU2FmZUNhbGwpIHtcbiAgICAgICAgcmV0dXJuIHZpc2l0KHRoaXMsIGFzdC5yZWNlaXZlcikgfHwgYXN0O1xuICAgICAgfSxcbiAgICAgIHZpc2l0SW1wbGljaXRSZWNlaXZlcihhc3Q6IGNkQXN0LkltcGxpY2l0UmVjZWl2ZXIpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9LFxuICAgICAgdmlzaXRUaGlzUmVjZWl2ZXIoYXN0OiBjZEFzdC5UaGlzUmVjZWl2ZXIpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9LFxuICAgICAgdmlzaXRJbnRlcnBvbGF0aW9uKGFzdDogY2RBc3QuSW50ZXJwb2xhdGlvbikge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH0sXG4gICAgICB2aXNpdEtleWVkUmVhZChhc3Q6IGNkQXN0LktleWVkUmVhZCkge1xuICAgICAgICByZXR1cm4gdmlzaXQodGhpcywgYXN0LnJlY2VpdmVyKTtcbiAgICAgIH0sXG4gICAgICB2aXNpdEtleWVkV3JpdGUoYXN0OiBjZEFzdC5LZXllZFdyaXRlKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfSxcbiAgICAgIHZpc2l0TGl0ZXJhbEFycmF5KGFzdDogY2RBc3QuTGl0ZXJhbEFycmF5KSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfSxcbiAgICAgIHZpc2l0TGl0ZXJhbE1hcChhc3Q6IGNkQXN0LkxpdGVyYWxNYXApIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9LFxuICAgICAgdmlzaXRMaXRlcmFsUHJpbWl0aXZlKGFzdDogY2RBc3QuTGl0ZXJhbFByaW1pdGl2ZSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH0sXG4gICAgICB2aXNpdFBpcGUoYXN0OiBjZEFzdC5CaW5kaW5nUGlwZSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH0sXG4gICAgICB2aXNpdFByZWZpeE5vdChhc3Q6IGNkQXN0LlByZWZpeE5vdCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH0sXG4gICAgICB2aXNpdE5vbk51bGxBc3NlcnQoYXN0OiBjZEFzdC5Ob25OdWxsQXNzZXJ0KSB7XG4gICAgICAgIHJldHVybiB2aXNpdCh0aGlzLCBhc3QuZXhwcmVzc2lvbik7XG4gICAgICB9LFxuICAgICAgdmlzaXRQcm9wZXJ0eVJlYWQoYXN0OiBjZEFzdC5Qcm9wZXJ0eVJlYWQpIHtcbiAgICAgICAgcmV0dXJuIHZpc2l0KHRoaXMsIGFzdC5yZWNlaXZlcik7XG4gICAgICB9LFxuICAgICAgdmlzaXRQcm9wZXJ0eVdyaXRlKGFzdDogY2RBc3QuUHJvcGVydHlXcml0ZSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH0sXG4gICAgICB2aXNpdFNhZmVQcm9wZXJ0eVJlYWQoYXN0OiBjZEFzdC5TYWZlUHJvcGVydHlSZWFkKSB7XG4gICAgICAgIHJldHVybiB2aXNpdCh0aGlzLCBhc3QucmVjZWl2ZXIpIHx8IGFzdDtcbiAgICAgIH0sXG4gICAgICB2aXNpdFNhZmVLZXllZFJlYWQoYXN0OiBjZEFzdC5TYWZlS2V5ZWRSZWFkKSB7XG4gICAgICAgIHJldHVybiB2aXNpdCh0aGlzLCBhc3QucmVjZWl2ZXIpIHx8IGFzdDtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8vIFJldHVybnMgdHJ1ZSBvZiB0aGUgQVNUIGluY2x1ZGVzIGEgbWV0aG9kIG9yIGEgcGlwZSBpbmRpY2F0aW5nIHRoYXQsIGlmIHRoZVxuICAvLyBleHByZXNzaW9uIGlzIHVzZWQgYXMgdGhlIHRhcmdldCBvZiBhIHNhZmUgcHJvcGVydHkgb3IgbWV0aG9kIGFjY2VzcyB0aGVuXG4gIC8vIHRoZSBleHByZXNzaW9uIHNob3VsZCBiZSBzdG9yZWQgaW50byBhIHRlbXBvcmFyeSB2YXJpYWJsZS5cbiAgcHJpdmF0ZSBuZWVkc1RlbXBvcmFyeUluU2FmZUFjY2Vzcyhhc3Q6IGNkQXN0LkFTVCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHZpc2l0ID0gKHZpc2l0b3I6IGNkQXN0LkFzdFZpc2l0b3IsIGFzdDogY2RBc3QuQVNUKTogYm9vbGVhbiA9PiB7XG4gICAgICByZXR1cm4gYXN0ICYmICh0aGlzLl9ub2RlTWFwLmdldChhc3QpIHx8IGFzdCkudmlzaXQodmlzaXRvcik7XG4gICAgfTtcbiAgICBjb25zdCB2aXNpdFNvbWUgPSAodmlzaXRvcjogY2RBc3QuQXN0VmlzaXRvciwgYXN0OiBjZEFzdC5BU1RbXSk6IGJvb2xlYW4gPT4ge1xuICAgICAgcmV0dXJuIGFzdC5zb21lKGFzdCA9PiB2aXNpdCh2aXNpdG9yLCBhc3QpKTtcbiAgICB9O1xuICAgIHJldHVybiBhc3QudmlzaXQoe1xuICAgICAgdmlzaXRVbmFyeShhc3Q6IGNkQXN0LlVuYXJ5KTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB2aXNpdCh0aGlzLCBhc3QuZXhwcik7XG4gICAgICB9LFxuICAgICAgdmlzaXRCaW5hcnkoYXN0OiBjZEFzdC5CaW5hcnkpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHZpc2l0KHRoaXMsIGFzdC5sZWZ0KSB8fCB2aXNpdCh0aGlzLCBhc3QucmlnaHQpO1xuICAgICAgfSxcbiAgICAgIHZpc2l0Q2hhaW4oYXN0OiBjZEFzdC5DaGFpbikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9LFxuICAgICAgdmlzaXRDb25kaXRpb25hbChhc3Q6IGNkQXN0LkNvbmRpdGlvbmFsKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB2aXNpdCh0aGlzLCBhc3QuY29uZGl0aW9uKSB8fCB2aXNpdCh0aGlzLCBhc3QudHJ1ZUV4cCkgfHwgdmlzaXQodGhpcywgYXN0LmZhbHNlRXhwKTtcbiAgICAgIH0sXG4gICAgICB2aXNpdENhbGwoYXN0OiBjZEFzdC5DYWxsKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSxcbiAgICAgIHZpc2l0U2FmZUNhbGwoYXN0OiBjZEFzdC5TYWZlQ2FsbCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0sXG4gICAgICB2aXNpdEltcGxpY2l0UmVjZWl2ZXIoYXN0OiBjZEFzdC5JbXBsaWNpdFJlY2VpdmVyKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0sXG4gICAgICB2aXNpdFRoaXNSZWNlaXZlcihhc3Q6IGNkQXN0LlRoaXNSZWNlaXZlcikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9LFxuICAgICAgdmlzaXRJbnRlcnBvbGF0aW9uKGFzdDogY2RBc3QuSW50ZXJwb2xhdGlvbikge1xuICAgICAgICByZXR1cm4gdmlzaXRTb21lKHRoaXMsIGFzdC5leHByZXNzaW9ucyk7XG4gICAgICB9LFxuICAgICAgdmlzaXRLZXllZFJlYWQoYXN0OiBjZEFzdC5LZXllZFJlYWQpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSxcbiAgICAgIHZpc2l0S2V5ZWRXcml0ZShhc3Q6IGNkQXN0LktleWVkV3JpdGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSxcbiAgICAgIHZpc2l0TGl0ZXJhbEFycmF5KGFzdDogY2RBc3QuTGl0ZXJhbEFycmF5KSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSxcbiAgICAgIHZpc2l0TGl0ZXJhbE1hcChhc3Q6IGNkQXN0LkxpdGVyYWxNYXApIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9LFxuICAgICAgdmlzaXRMaXRlcmFsUHJpbWl0aXZlKGFzdDogY2RBc3QuTGl0ZXJhbFByaW1pdGl2ZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9LFxuICAgICAgdmlzaXRQaXBlKGFzdDogY2RBc3QuQmluZGluZ1BpcGUpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9LFxuICAgICAgdmlzaXRQcmVmaXhOb3QoYXN0OiBjZEFzdC5QcmVmaXhOb3QpIHtcbiAgICAgICAgcmV0dXJuIHZpc2l0KHRoaXMsIGFzdC5leHByZXNzaW9uKTtcbiAgICAgIH0sXG4gICAgICB2aXNpdE5vbk51bGxBc3NlcnQoYXN0OiBjZEFzdC5QcmVmaXhOb3QpIHtcbiAgICAgICAgcmV0dXJuIHZpc2l0KHRoaXMsIGFzdC5leHByZXNzaW9uKTtcbiAgICAgIH0sXG4gICAgICB2aXNpdFByb3BlcnR5UmVhZChhc3Q6IGNkQXN0LlByb3BlcnR5UmVhZCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9LFxuICAgICAgdmlzaXRQcm9wZXJ0eVdyaXRlKGFzdDogY2RBc3QuUHJvcGVydHlXcml0ZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9LFxuICAgICAgdmlzaXRTYWZlUHJvcGVydHlSZWFkKGFzdDogY2RBc3QuU2FmZVByb3BlcnR5UmVhZCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9LFxuICAgICAgdmlzaXRTYWZlS2V5ZWRSZWFkKGFzdDogY2RBc3QuU2FmZUtleWVkUmVhZCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGFsbG9jYXRlVGVtcG9yYXJ5KCk6IG8uUmVhZFZhckV4cHIge1xuICAgIGNvbnN0IHRlbXBOdW1iZXIgPSB0aGlzLl9jdXJyZW50VGVtcG9yYXJ5Kys7XG4gICAgdGhpcy50ZW1wb3JhcnlDb3VudCA9IE1hdGgubWF4KHRoaXMuX2N1cnJlbnRUZW1wb3JhcnksIHRoaXMudGVtcG9yYXJ5Q291bnQpO1xuICAgIHJldHVybiBuZXcgby5SZWFkVmFyRXhwcih0ZW1wb3JhcnlOYW1lKHRoaXMuYmluZGluZ0lkLCB0ZW1wTnVtYmVyKSk7XG4gIH1cblxuICBwcml2YXRlIHJlbGVhc2VUZW1wb3JhcnkodGVtcG9yYXJ5OiBvLlJlYWRWYXJFeHByKSB7XG4gICAgdGhpcy5fY3VycmVudFRlbXBvcmFyeS0tO1xuICAgIGlmICh0ZW1wb3JhcnkubmFtZSAhPSB0ZW1wb3JhcnlOYW1lKHRoaXMuYmluZGluZ0lkLCB0aGlzLl9jdXJyZW50VGVtcG9yYXJ5KSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBUZW1wb3JhcnkgJHt0ZW1wb3JhcnkubmFtZX0gcmVsZWFzZWQgb3V0IG9mIG9yZGVyYCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gYWJzb2x1dGUgYFBhcnNlU291cmNlU3BhbmAgZnJvbSB0aGUgcmVsYXRpdmUgYFBhcnNlU3BhbmAuXG4gICAqXG4gICAqIGBQYXJzZVNwYW5gIG9iamVjdHMgYXJlIHJlbGF0aXZlIHRvIHRoZSBzdGFydCBvZiB0aGUgZXhwcmVzc2lvbi5cbiAgICogVGhpcyBtZXRob2QgY29udmVydHMgdGhlc2UgdG8gZnVsbCBgUGFyc2VTb3VyY2VTcGFuYCBvYmplY3RzIHRoYXRcbiAgICogc2hvdyB3aGVyZSB0aGUgc3BhbiBpcyB3aXRoaW4gdGhlIG92ZXJhbGwgc291cmNlIGZpbGUuXG4gICAqXG4gICAqIEBwYXJhbSBzcGFuIHRoZSByZWxhdGl2ZSBzcGFuIHRvIGNvbnZlcnQuXG4gICAqIEByZXR1cm5zIGEgYFBhcnNlU291cmNlU3BhbmAgZm9yIHRoZSBnaXZlbiBzcGFuIG9yIG51bGwgaWYgbm9cbiAgICogYGJhc2VTb3VyY2VTcGFuYCB3YXMgcHJvdmlkZWQgdG8gdGhpcyBjbGFzcy5cbiAgICovXG4gIHByaXZhdGUgY29udmVydFNvdXJjZVNwYW4oc3BhbjogY2RBc3QuUGFyc2VTcGFuKSB7XG4gICAgaWYgKHRoaXMuYmFzZVNvdXJjZVNwYW4pIHtcbiAgICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy5iYXNlU291cmNlU3Bhbi5zdGFydC5tb3ZlQnkoc3Bhbi5zdGFydCk7XG4gICAgICBjb25zdCBlbmQgPSB0aGlzLmJhc2VTb3VyY2VTcGFuLnN0YXJ0Lm1vdmVCeShzcGFuLmVuZCk7XG4gICAgICBjb25zdCBmdWxsU3RhcnQgPSB0aGlzLmJhc2VTb3VyY2VTcGFuLmZ1bGxTdGFydC5tb3ZlQnkoc3Bhbi5zdGFydCk7XG4gICAgICByZXR1cm4gbmV3IFBhcnNlU291cmNlU3BhbihzdGFydCwgZW5kLCBmdWxsU3RhcnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKiogQWRkcyB0aGUgbmFtZSBvZiBhbiBBU1QgdG8gdGhlIGxpc3Qgb2YgaW1wbGljaXQgcmVjZWl2ZXIgYWNjZXNzZXMuICovXG4gIHByaXZhdGUgYWRkSW1wbGljaXRSZWNlaXZlckFjY2VzcyhuYW1lOiBzdHJpbmcpIHtcbiAgICBpZiAodGhpcy5pbXBsaWNpdFJlY2VpdmVyQWNjZXNzZXMpIHtcbiAgICAgIHRoaXMuaW1wbGljaXRSZWNlaXZlckFjY2Vzc2VzLmFkZChuYW1lKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZmxhdHRlblN0YXRlbWVudHMoYXJnOiBhbnksIG91dHB1dDogby5TdGF0ZW1lbnRbXSkge1xuICBpZiAoQXJyYXkuaXNBcnJheShhcmcpKSB7XG4gICAgKDxhbnlbXT5hcmcpLmZvckVhY2goKGVudHJ5KSA9PiBmbGF0dGVuU3RhdGVtZW50cyhlbnRyeSwgb3V0cHV0KSk7XG4gIH0gZWxzZSB7XG4gICAgb3V0cHV0LnB1c2goYXJnKTtcbiAgfVxufVxuXG5mdW5jdGlvbiB1bnN1cHBvcnRlZCgpOiBuZXZlciB7XG4gIHRocm93IG5ldyBFcnJvcignVW5zdXBwb3J0ZWQgb3BlcmF0aW9uJyk7XG59XG5cbmNsYXNzIEludGVycG9sYXRpb25FeHByZXNzaW9uIGV4dGVuZHMgby5FeHByZXNzaW9uIHtcbiAgY29uc3RydWN0b3IocHVibGljIGFyZ3M6IG8uRXhwcmVzc2lvbltdKSB7XG4gICAgc3VwZXIobnVsbCwgbnVsbCk7XG4gIH1cblxuICBvdmVycmlkZSBpc0NvbnN0YW50ID0gdW5zdXBwb3J0ZWQ7XG4gIG92ZXJyaWRlIGlzRXF1aXZhbGVudCA9IHVuc3VwcG9ydGVkO1xuICBvdmVycmlkZSB2aXNpdEV4cHJlc3Npb24gPSB1bnN1cHBvcnRlZDtcbiAgb3ZlcnJpZGUgY2xvbmUgPSB1bnN1cHBvcnRlZDtcbn1cblxuY2xhc3MgRGVmYXVsdExvY2FsUmVzb2x2ZXIgaW1wbGVtZW50cyBMb2NhbFJlc29sdmVyIHtcbiAgY29uc3RydWN0b3IocHVibGljIGdsb2JhbHM/OiBTZXQ8c3RyaW5nPikge31cbiAgbm90aWZ5SW1wbGljaXRSZWNlaXZlclVzZSgpOiB2b2lkIHt9XG4gIG1heWJlUmVzdG9yZVZpZXcoKTogdm9pZCB7fVxuICBnZXRMb2NhbChuYW1lOiBzdHJpbmcpOiBvLkV4cHJlc3Npb258bnVsbCB7XG4gICAgaWYgKG5hbWUgPT09IEV2ZW50SGFuZGxlclZhcnMuZXZlbnQubmFtZSkge1xuICAgICAgcmV0dXJuIEV2ZW50SGFuZGxlclZhcnMuZXZlbnQ7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBCdWlsdGluRnVuY3Rpb25DYWxsIGV4dGVuZHMgY2RBc3QuQ2FsbCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgc3BhbjogY2RBc3QuUGFyc2VTcGFuLCBzb3VyY2VTcGFuOiBjZEFzdC5BYnNvbHV0ZVNvdXJjZVNwYW4sIGFyZ3M6IGNkQXN0LkFTVFtdLFxuICAgICAgcHVibGljIGNvbnZlcnRlcjogQnVpbHRpbkNvbnZlcnRlcikge1xuICAgIHN1cGVyKHNwYW4sIHNvdXJjZVNwYW4sIG5ldyBjZEFzdC5FbXB0eUV4cHIoc3Bhbiwgc291cmNlU3BhbiksIGFyZ3MsIG51bGwhKTtcbiAgfVxufVxuIl19