/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
var _a, _b, _c, _d, _e, _f, _g, _h;
import * as o from '../../../../output/output_ast';
import { ExpressionKind, OpKind } from './enums';
import { Interpolation } from './ops/update';
import { ConsumesVarsTrait, DependsOnSlotContext, UsesVarOffset, } from './traits';
/**
 * Check whether a given `o.Expression` is a logical IR expression type.
 */
export function isIrExpression(expr) {
    return expr instanceof ExpressionBase;
}
/**
 * Base type used for all logical IR expressions.
 */
export class ExpressionBase extends o.Expression {
    constructor(sourceSpan = null) {
        super(null, sourceSpan);
    }
}
/**
 * Logical expression representing a lexical read of a variable name.
 */
export class LexicalReadExpr extends ExpressionBase {
    constructor(name) {
        super();
        this.name = name;
        this.kind = ExpressionKind.LexicalRead;
    }
    visitExpression(visitor, context) { }
    isEquivalent(other) {
        // We assume that the lexical reads are in the same context, which must be true for parent
        // expressions to be equivalent.
        // TODO: is this generally safe?
        return this.name === other.name;
    }
    isConstant() {
        return false;
    }
    transformInternalExpressions() { }
    clone() {
        return new LexicalReadExpr(this.name);
    }
}
/**
 * Runtime operation to retrieve the value of a local reference.
 */
export class ReferenceExpr extends ExpressionBase {
    constructor(target, targetSlot, offset) {
        super();
        this.target = target;
        this.targetSlot = targetSlot;
        this.offset = offset;
        this.kind = ExpressionKind.Reference;
    }
    visitExpression() { }
    isEquivalent(e) {
        return e instanceof ReferenceExpr && e.target === this.target;
    }
    isConstant() {
        return false;
    }
    transformInternalExpressions() { }
    clone() {
        return new ReferenceExpr(this.target, this.targetSlot, this.offset);
    }
}
export class StoreLetExpr extends ExpressionBase {
    static { _a = ConsumesVarsTrait, _b = DependsOnSlotContext; }
    constructor(target, value, sourceSpan) {
        super();
        this.target = target;
        this.value = value;
        this.sourceSpan = sourceSpan;
        this.kind = ExpressionKind.StoreLet;
        this[_a] = true;
        this[_b] = true;
    }
    visitExpression() { }
    isEquivalent(e) {
        return (e instanceof StoreLetExpr && e.target === this.target && e.value.isEquivalent(this.value));
    }
    isConstant() {
        return false;
    }
    transformInternalExpressions(transform, flags) {
        this.value = transformExpressionsInExpression(this.value, transform, flags);
    }
    clone() {
        return new StoreLetExpr(this.target, this.value, this.sourceSpan);
    }
}
export class ContextLetReferenceExpr extends ExpressionBase {
    constructor(target, targetSlot) {
        super();
        this.target = target;
        this.targetSlot = targetSlot;
        this.kind = ExpressionKind.ContextLetReference;
    }
    visitExpression() { }
    isEquivalent(e) {
        return e instanceof ContextLetReferenceExpr && e.target === this.target;
    }
    isConstant() {
        return false;
    }
    transformInternalExpressions() { }
    clone() {
        return new ContextLetReferenceExpr(this.target, this.targetSlot);
    }
}
/**
 * A reference to the current view context (usually the `ctx` variable in a template function).
 */
export class ContextExpr extends ExpressionBase {
    constructor(view) {
        super();
        this.view = view;
        this.kind = ExpressionKind.Context;
    }
    visitExpression() { }
    isEquivalent(e) {
        return e instanceof ContextExpr && e.view === this.view;
    }
    isConstant() {
        return false;
    }
    transformInternalExpressions() { }
    clone() {
        return new ContextExpr(this.view);
    }
}
/**
 * A reference to the current view context inside a track function.
 */
export class TrackContextExpr extends ExpressionBase {
    constructor(view) {
        super();
        this.view = view;
        this.kind = ExpressionKind.TrackContext;
    }
    visitExpression() { }
    isEquivalent(e) {
        return e instanceof TrackContextExpr && e.view === this.view;
    }
    isConstant() {
        return false;
    }
    transformInternalExpressions() { }
    clone() {
        return new TrackContextExpr(this.view);
    }
}
/**
 * Runtime operation to navigate to the next view context in the view hierarchy.
 */
export class NextContextExpr extends ExpressionBase {
    constructor() {
        super();
        this.kind = ExpressionKind.NextContext;
        this.steps = 1;
    }
    visitExpression() { }
    isEquivalent(e) {
        return e instanceof NextContextExpr && e.steps === this.steps;
    }
    isConstant() {
        return false;
    }
    transformInternalExpressions() { }
    clone() {
        const expr = new NextContextExpr();
        expr.steps = this.steps;
        return expr;
    }
}
/**
 * Runtime operation to snapshot the current view context.
 *
 * The result of this operation can be stored in a variable and later used with the `RestoreView`
 * operation.
 */
export class GetCurrentViewExpr extends ExpressionBase {
    constructor() {
        super();
        this.kind = ExpressionKind.GetCurrentView;
    }
    visitExpression() { }
    isEquivalent(e) {
        return e instanceof GetCurrentViewExpr;
    }
    isConstant() {
        return false;
    }
    transformInternalExpressions() { }
    clone() {
        return new GetCurrentViewExpr();
    }
}
/**
 * Runtime operation to restore a snapshotted view.
 */
export class RestoreViewExpr extends ExpressionBase {
    constructor(view) {
        super();
        this.view = view;
        this.kind = ExpressionKind.RestoreView;
    }
    visitExpression(visitor, context) {
        if (typeof this.view !== 'number') {
            this.view.visitExpression(visitor, context);
        }
    }
    isEquivalent(e) {
        if (!(e instanceof RestoreViewExpr) || typeof e.view !== typeof this.view) {
            return false;
        }
        if (typeof this.view === 'number') {
            return this.view === e.view;
        }
        else {
            return this.view.isEquivalent(e.view);
        }
    }
    isConstant() {
        return false;
    }
    transformInternalExpressions(transform, flags) {
        if (typeof this.view !== 'number') {
            this.view = transformExpressionsInExpression(this.view, transform, flags);
        }
    }
    clone() {
        return new RestoreViewExpr(this.view instanceof o.Expression ? this.view.clone() : this.view);
    }
}
/**
 * Runtime operation to reset the current view context after `RestoreView`.
 */
export class ResetViewExpr extends ExpressionBase {
    constructor(expr) {
        super();
        this.expr = expr;
        this.kind = ExpressionKind.ResetView;
    }
    visitExpression(visitor, context) {
        this.expr.visitExpression(visitor, context);
    }
    isEquivalent(e) {
        return e instanceof ResetViewExpr && this.expr.isEquivalent(e.expr);
    }
    isConstant() {
        return false;
    }
    transformInternalExpressions(transform, flags) {
        this.expr = transformExpressionsInExpression(this.expr, transform, flags);
    }
    clone() {
        return new ResetViewExpr(this.expr.clone());
    }
}
export class TwoWayBindingSetExpr extends ExpressionBase {
    constructor(target, value) {
        super();
        this.target = target;
        this.value = value;
        this.kind = ExpressionKind.TwoWayBindingSet;
    }
    visitExpression(visitor, context) {
        this.target.visitExpression(visitor, context);
        this.value.visitExpression(visitor, context);
    }
    isEquivalent(other) {
        return this.target.isEquivalent(other.target) && this.value.isEquivalent(other.value);
    }
    isConstant() {
        return false;
    }
    transformInternalExpressions(transform, flags) {
        this.target = transformExpressionsInExpression(this.target, transform, flags);
        this.value = transformExpressionsInExpression(this.value, transform, flags);
    }
    clone() {
        return new TwoWayBindingSetExpr(this.target, this.value);
    }
}
/**
 * Read of a variable declared as an `ir.VariableOp` and referenced through its `ir.XrefId`.
 */
export class ReadVariableExpr extends ExpressionBase {
    constructor(xref) {
        super();
        this.xref = xref;
        this.kind = ExpressionKind.ReadVariable;
        this.name = null;
    }
    visitExpression() { }
    isEquivalent(other) {
        return other instanceof ReadVariableExpr && other.xref === this.xref;
    }
    isConstant() {
        return false;
    }
    transformInternalExpressions() { }
    clone() {
        const expr = new ReadVariableExpr(this.xref);
        expr.name = this.name;
        return expr;
    }
}
export class PureFunctionExpr extends ExpressionBase {
    static { _c = ConsumesVarsTrait, _d = UsesVarOffset; }
    constructor(expression, args) {
        super();
        this.kind = ExpressionKind.PureFunctionExpr;
        this[_c] = true;
        this[_d] = true;
        this.varOffset = null;
        /**
         * Once extracted to the `ConstantPool`, a reference to the function which defines the computation
         * of `body`.
         */
        this.fn = null;
        this.body = expression;
        this.args = args;
    }
    visitExpression(visitor, context) {
        this.body?.visitExpression(visitor, context);
        for (const arg of this.args) {
            arg.visitExpression(visitor, context);
        }
    }
    isEquivalent(other) {
        if (!(other instanceof PureFunctionExpr) || other.args.length !== this.args.length) {
            return false;
        }
        return (other.body !== null &&
            this.body !== null &&
            other.body.isEquivalent(this.body) &&
            other.args.every((arg, idx) => arg.isEquivalent(this.args[idx])));
    }
    isConstant() {
        return false;
    }
    transformInternalExpressions(transform, flags) {
        if (this.body !== null) {
            // TODO: figure out if this is the right flag to pass here.
            this.body = transformExpressionsInExpression(this.body, transform, flags | VisitorContextFlag.InChildOperation);
        }
        else if (this.fn !== null) {
            this.fn = transformExpressionsInExpression(this.fn, transform, flags);
        }
        for (let i = 0; i < this.args.length; i++) {
            this.args[i] = transformExpressionsInExpression(this.args[i], transform, flags);
        }
    }
    clone() {
        const expr = new PureFunctionExpr(this.body?.clone() ?? null, this.args.map((arg) => arg.clone()));
        expr.fn = this.fn?.clone() ?? null;
        expr.varOffset = this.varOffset;
        return expr;
    }
}
export class PureFunctionParameterExpr extends ExpressionBase {
    constructor(index) {
        super();
        this.index = index;
        this.kind = ExpressionKind.PureFunctionParameterExpr;
    }
    visitExpression() { }
    isEquivalent(other) {
        return other instanceof PureFunctionParameterExpr && other.index === this.index;
    }
    isConstant() {
        return true;
    }
    transformInternalExpressions() { }
    clone() {
        return new PureFunctionParameterExpr(this.index);
    }
}
export class PipeBindingExpr extends ExpressionBase {
    static { _e = ConsumesVarsTrait, _f = UsesVarOffset; }
    constructor(target, targetSlot, name, args) {
        super();
        this.target = target;
        this.targetSlot = targetSlot;
        this.name = name;
        this.args = args;
        this.kind = ExpressionKind.PipeBinding;
        this[_e] = true;
        this[_f] = true;
        this.varOffset = null;
    }
    visitExpression(visitor, context) {
        for (const arg of this.args) {
            arg.visitExpression(visitor, context);
        }
    }
    isEquivalent() {
        return false;
    }
    isConstant() {
        return false;
    }
    transformInternalExpressions(transform, flags) {
        for (let idx = 0; idx < this.args.length; idx++) {
            this.args[idx] = transformExpressionsInExpression(this.args[idx], transform, flags);
        }
    }
    clone() {
        const r = new PipeBindingExpr(this.target, this.targetSlot, this.name, this.args.map((a) => a.clone()));
        r.varOffset = this.varOffset;
        return r;
    }
}
export class PipeBindingVariadicExpr extends ExpressionBase {
    static { _g = ConsumesVarsTrait, _h = UsesVarOffset; }
    constructor(target, targetSlot, name, args, numArgs) {
        super();
        this.target = target;
        this.targetSlot = targetSlot;
        this.name = name;
        this.args = args;
        this.numArgs = numArgs;
        this.kind = ExpressionKind.PipeBindingVariadic;
        this[_g] = true;
        this[_h] = true;
        this.varOffset = null;
    }
    visitExpression(visitor, context) {
        this.args.visitExpression(visitor, context);
    }
    isEquivalent() {
        return false;
    }
    isConstant() {
        return false;
    }
    transformInternalExpressions(transform, flags) {
        this.args = transformExpressionsInExpression(this.args, transform, flags);
    }
    clone() {
        const r = new PipeBindingVariadicExpr(this.target, this.targetSlot, this.name, this.args.clone(), this.numArgs);
        r.varOffset = this.varOffset;
        return r;
    }
}
export class SafePropertyReadExpr extends ExpressionBase {
    constructor(receiver, name) {
        super();
        this.receiver = receiver;
        this.name = name;
        this.kind = ExpressionKind.SafePropertyRead;
    }
    // An alias for name, which allows other logic to handle property reads and keyed reads together.
    get index() {
        return this.name;
    }
    visitExpression(visitor, context) {
        this.receiver.visitExpression(visitor, context);
    }
    isEquivalent() {
        return false;
    }
    isConstant() {
        return false;
    }
    transformInternalExpressions(transform, flags) {
        this.receiver = transformExpressionsInExpression(this.receiver, transform, flags);
    }
    clone() {
        return new SafePropertyReadExpr(this.receiver.clone(), this.name);
    }
}
export class SafeKeyedReadExpr extends ExpressionBase {
    constructor(receiver, index, sourceSpan) {
        super(sourceSpan);
        this.receiver = receiver;
        this.index = index;
        this.kind = ExpressionKind.SafeKeyedRead;
    }
    visitExpression(visitor, context) {
        this.receiver.visitExpression(visitor, context);
        this.index.visitExpression(visitor, context);
    }
    isEquivalent() {
        return false;
    }
    isConstant() {
        return false;
    }
    transformInternalExpressions(transform, flags) {
        this.receiver = transformExpressionsInExpression(this.receiver, transform, flags);
        this.index = transformExpressionsInExpression(this.index, transform, flags);
    }
    clone() {
        return new SafeKeyedReadExpr(this.receiver.clone(), this.index.clone(), this.sourceSpan);
    }
}
export class SafeInvokeFunctionExpr extends ExpressionBase {
    constructor(receiver, args) {
        super();
        this.receiver = receiver;
        this.args = args;
        this.kind = ExpressionKind.SafeInvokeFunction;
    }
    visitExpression(visitor, context) {
        this.receiver.visitExpression(visitor, context);
        for (const a of this.args) {
            a.visitExpression(visitor, context);
        }
    }
    isEquivalent() {
        return false;
    }
    isConstant() {
        return false;
    }
    transformInternalExpressions(transform, flags) {
        this.receiver = transformExpressionsInExpression(this.receiver, transform, flags);
        for (let i = 0; i < this.args.length; i++) {
            this.args[i] = transformExpressionsInExpression(this.args[i], transform, flags);
        }
    }
    clone() {
        return new SafeInvokeFunctionExpr(this.receiver.clone(), this.args.map((a) => a.clone()));
    }
}
export class SafeTernaryExpr extends ExpressionBase {
    constructor(guard, expr) {
        super();
        this.guard = guard;
        this.expr = expr;
        this.kind = ExpressionKind.SafeTernaryExpr;
    }
    visitExpression(visitor, context) {
        this.guard.visitExpression(visitor, context);
        this.expr.visitExpression(visitor, context);
    }
    isEquivalent() {
        return false;
    }
    isConstant() {
        return false;
    }
    transformInternalExpressions(transform, flags) {
        this.guard = transformExpressionsInExpression(this.guard, transform, flags);
        this.expr = transformExpressionsInExpression(this.expr, transform, flags);
    }
    clone() {
        return new SafeTernaryExpr(this.guard.clone(), this.expr.clone());
    }
}
export class EmptyExpr extends ExpressionBase {
    constructor() {
        super(...arguments);
        this.kind = ExpressionKind.EmptyExpr;
    }
    visitExpression(visitor, context) { }
    isEquivalent(e) {
        return e instanceof EmptyExpr;
    }
    isConstant() {
        return true;
    }
    clone() {
        return new EmptyExpr();
    }
    transformInternalExpressions() { }
}
export class AssignTemporaryExpr extends ExpressionBase {
    constructor(expr, xref) {
        super();
        this.expr = expr;
        this.xref = xref;
        this.kind = ExpressionKind.AssignTemporaryExpr;
        this.name = null;
    }
    visitExpression(visitor, context) {
        this.expr.visitExpression(visitor, context);
    }
    isEquivalent() {
        return false;
    }
    isConstant() {
        return false;
    }
    transformInternalExpressions(transform, flags) {
        this.expr = transformExpressionsInExpression(this.expr, transform, flags);
    }
    clone() {
        const a = new AssignTemporaryExpr(this.expr.clone(), this.xref);
        a.name = this.name;
        return a;
    }
}
export class ReadTemporaryExpr extends ExpressionBase {
    constructor(xref) {
        super();
        this.xref = xref;
        this.kind = ExpressionKind.ReadTemporaryExpr;
        this.name = null;
    }
    visitExpression(visitor, context) { }
    isEquivalent() {
        return this.xref === this.xref;
    }
    isConstant() {
        return false;
    }
    transformInternalExpressions(transform, flags) { }
    clone() {
        const r = new ReadTemporaryExpr(this.xref);
        r.name = this.name;
        return r;
    }
}
export class SlotLiteralExpr extends ExpressionBase {
    constructor(slot) {
        super();
        this.slot = slot;
        this.kind = ExpressionKind.SlotLiteralExpr;
    }
    visitExpression(visitor, context) { }
    isEquivalent(e) {
        return e instanceof SlotLiteralExpr && e.slot === this.slot;
    }
    isConstant() {
        return true;
    }
    clone() {
        return new SlotLiteralExpr(this.slot);
    }
    transformInternalExpressions() { }
}
export class ConditionalCaseExpr extends ExpressionBase {
    /**
     * Create an expression for one branch of a conditional.
     * @param expr The expression to be tested for this case. Might be null, as in an `else` case.
     * @param target The Xref of the view to be displayed if this condition is true.
     */
    constructor(expr, target, targetSlot, alias = null) {
        super();
        this.expr = expr;
        this.target = target;
        this.targetSlot = targetSlot;
        this.alias = alias;
        this.kind = ExpressionKind.ConditionalCase;
    }
    visitExpression(visitor, context) {
        if (this.expr !== null) {
            this.expr.visitExpression(visitor, context);
        }
    }
    isEquivalent(e) {
        return e instanceof ConditionalCaseExpr && e.expr === this.expr;
    }
    isConstant() {
        return true;
    }
    clone() {
        return new ConditionalCaseExpr(this.expr, this.target, this.targetSlot);
    }
    transformInternalExpressions(transform, flags) {
        if (this.expr !== null) {
            this.expr = transformExpressionsInExpression(this.expr, transform, flags);
        }
    }
}
export class ConstCollectedExpr extends ExpressionBase {
    constructor(expr) {
        super();
        this.expr = expr;
        this.kind = ExpressionKind.ConstCollected;
    }
    transformInternalExpressions(transform, flags) {
        this.expr = transform(this.expr, flags);
    }
    visitExpression(visitor, context) {
        this.expr.visitExpression(visitor, context);
    }
    isEquivalent(e) {
        if (!(e instanceof ConstCollectedExpr)) {
            return false;
        }
        return this.expr.isEquivalent(e.expr);
    }
    isConstant() {
        return this.expr.isConstant();
    }
    clone() {
        return new ConstCollectedExpr(this.expr);
    }
}
/**
 * Visits all `Expression`s in the AST of `op` with the `visitor` function.
 */
export function visitExpressionsInOp(op, visitor) {
    transformExpressionsInOp(op, (expr, flags) => {
        visitor(expr, flags);
        return expr;
    }, VisitorContextFlag.None);
}
export var VisitorContextFlag;
(function (VisitorContextFlag) {
    VisitorContextFlag[VisitorContextFlag["None"] = 0] = "None";
    VisitorContextFlag[VisitorContextFlag["InChildOperation"] = 1] = "InChildOperation";
})(VisitorContextFlag || (VisitorContextFlag = {}));
function transformExpressionsInInterpolation(interpolation, transform, flags) {
    for (let i = 0; i < interpolation.expressions.length; i++) {
        interpolation.expressions[i] = transformExpressionsInExpression(interpolation.expressions[i], transform, flags);
    }
}
/**
 * Transform all `Expression`s in the AST of `op` with the `transform` function.
 *
 * All such operations will be replaced with the result of applying `transform`, which may be an
 * identity transformation.
 */
export function transformExpressionsInOp(op, transform, flags) {
    switch (op.kind) {
        case OpKind.StyleProp:
        case OpKind.StyleMap:
        case OpKind.ClassProp:
        case OpKind.ClassMap:
        case OpKind.Binding:
            if (op.expression instanceof Interpolation) {
                transformExpressionsInInterpolation(op.expression, transform, flags);
            }
            else {
                op.expression = transformExpressionsInExpression(op.expression, transform, flags);
            }
            break;
        case OpKind.Property:
        case OpKind.HostProperty:
        case OpKind.Attribute:
            if (op.expression instanceof Interpolation) {
                transformExpressionsInInterpolation(op.expression, transform, flags);
            }
            else {
                op.expression = transformExpressionsInExpression(op.expression, transform, flags);
            }
            op.sanitizer =
                op.sanitizer && transformExpressionsInExpression(op.sanitizer, transform, flags);
            break;
        case OpKind.TwoWayProperty:
            op.expression = transformExpressionsInExpression(op.expression, transform, flags);
            op.sanitizer =
                op.sanitizer && transformExpressionsInExpression(op.sanitizer, transform, flags);
            break;
        case OpKind.I18nExpression:
            op.expression = transformExpressionsInExpression(op.expression, transform, flags);
            break;
        case OpKind.InterpolateText:
            transformExpressionsInInterpolation(op.interpolation, transform, flags);
            break;
        case OpKind.Statement:
            transformExpressionsInStatement(op.statement, transform, flags);
            break;
        case OpKind.Variable:
            op.initializer = transformExpressionsInExpression(op.initializer, transform, flags);
            break;
        case OpKind.Conditional:
            for (const condition of op.conditions) {
                if (condition.expr === null) {
                    // This is a default case.
                    continue;
                }
                condition.expr = transformExpressionsInExpression(condition.expr, transform, flags);
            }
            if (op.processed !== null) {
                op.processed = transformExpressionsInExpression(op.processed, transform, flags);
            }
            if (op.contextValue !== null) {
                op.contextValue = transformExpressionsInExpression(op.contextValue, transform, flags);
            }
            break;
        case OpKind.Listener:
        case OpKind.TwoWayListener:
            for (const innerOp of op.handlerOps) {
                transformExpressionsInOp(innerOp, transform, flags | VisitorContextFlag.InChildOperation);
            }
            break;
        case OpKind.ExtractedAttribute:
            op.expression =
                op.expression && transformExpressionsInExpression(op.expression, transform, flags);
            op.trustedValueFn =
                op.trustedValueFn && transformExpressionsInExpression(op.trustedValueFn, transform, flags);
            break;
        case OpKind.RepeaterCreate:
            op.track = transformExpressionsInExpression(op.track, transform, flags);
            if (op.trackByFn !== null) {
                op.trackByFn = transformExpressionsInExpression(op.trackByFn, transform, flags);
            }
            break;
        case OpKind.Repeater:
            op.collection = transformExpressionsInExpression(op.collection, transform, flags);
            break;
        case OpKind.Defer:
            if (op.loadingConfig !== null) {
                op.loadingConfig = transformExpressionsInExpression(op.loadingConfig, transform, flags);
            }
            if (op.placeholderConfig !== null) {
                op.placeholderConfig = transformExpressionsInExpression(op.placeholderConfig, transform, flags);
            }
            if (op.resolverFn !== null) {
                op.resolverFn = transformExpressionsInExpression(op.resolverFn, transform, flags);
            }
            break;
        case OpKind.I18nMessage:
            for (const [placeholder, expr] of op.params) {
                op.params.set(placeholder, transformExpressionsInExpression(expr, transform, flags));
            }
            for (const [placeholder, expr] of op.postprocessingParams) {
                op.postprocessingParams.set(placeholder, transformExpressionsInExpression(expr, transform, flags));
            }
            break;
        case OpKind.DeferWhen:
            op.expr = transformExpressionsInExpression(op.expr, transform, flags);
            break;
        case OpKind.StoreLet:
            op.value = transformExpressionsInExpression(op.value, transform, flags);
            break;
        case OpKind.Advance:
        case OpKind.Container:
        case OpKind.ContainerEnd:
        case OpKind.ContainerStart:
        case OpKind.DeferOn:
        case OpKind.DisableBindings:
        case OpKind.Element:
        case OpKind.ElementEnd:
        case OpKind.ElementStart:
        case OpKind.EnableBindings:
        case OpKind.I18n:
        case OpKind.I18nApply:
        case OpKind.I18nContext:
        case OpKind.I18nEnd:
        case OpKind.I18nStart:
        case OpKind.IcuEnd:
        case OpKind.IcuStart:
        case OpKind.Namespace:
        case OpKind.Pipe:
        case OpKind.Projection:
        case OpKind.ProjectionDef:
        case OpKind.Template:
        case OpKind.Text:
        case OpKind.I18nAttributes:
        case OpKind.IcuPlaceholder:
        case OpKind.DeclareLet:
            // These operations contain no expressions.
            break;
        default:
            throw new Error(`AssertionError: transformExpressionsInOp doesn't handle ${OpKind[op.kind]}`);
    }
}
/**
 * Transform all `Expression`s in the AST of `expr` with the `transform` function.
 *
 * All such operations will be replaced with the result of applying `transform`, which may be an
 * identity transformation.
 */
export function transformExpressionsInExpression(expr, transform, flags) {
    if (expr instanceof ExpressionBase) {
        expr.transformInternalExpressions(transform, flags);
    }
    else if (expr instanceof o.BinaryOperatorExpr) {
        expr.lhs = transformExpressionsInExpression(expr.lhs, transform, flags);
        expr.rhs = transformExpressionsInExpression(expr.rhs, transform, flags);
    }
    else if (expr instanceof o.UnaryOperatorExpr) {
        expr.expr = transformExpressionsInExpression(expr.expr, transform, flags);
    }
    else if (expr instanceof o.ReadPropExpr) {
        expr.receiver = transformExpressionsInExpression(expr.receiver, transform, flags);
    }
    else if (expr instanceof o.ReadKeyExpr) {
        expr.receiver = transformExpressionsInExpression(expr.receiver, transform, flags);
        expr.index = transformExpressionsInExpression(expr.index, transform, flags);
    }
    else if (expr instanceof o.WritePropExpr) {
        expr.receiver = transformExpressionsInExpression(expr.receiver, transform, flags);
        expr.value = transformExpressionsInExpression(expr.value, transform, flags);
    }
    else if (expr instanceof o.WriteKeyExpr) {
        expr.receiver = transformExpressionsInExpression(expr.receiver, transform, flags);
        expr.index = transformExpressionsInExpression(expr.index, transform, flags);
        expr.value = transformExpressionsInExpression(expr.value, transform, flags);
    }
    else if (expr instanceof o.InvokeFunctionExpr) {
        expr.fn = transformExpressionsInExpression(expr.fn, transform, flags);
        for (let i = 0; i < expr.args.length; i++) {
            expr.args[i] = transformExpressionsInExpression(expr.args[i], transform, flags);
        }
    }
    else if (expr instanceof o.LiteralArrayExpr) {
        for (let i = 0; i < expr.entries.length; i++) {
            expr.entries[i] = transformExpressionsInExpression(expr.entries[i], transform, flags);
        }
    }
    else if (expr instanceof o.LiteralMapExpr) {
        for (let i = 0; i < expr.entries.length; i++) {
            expr.entries[i].value = transformExpressionsInExpression(expr.entries[i].value, transform, flags);
        }
    }
    else if (expr instanceof o.ConditionalExpr) {
        expr.condition = transformExpressionsInExpression(expr.condition, transform, flags);
        expr.trueCase = transformExpressionsInExpression(expr.trueCase, transform, flags);
        if (expr.falseCase !== null) {
            expr.falseCase = transformExpressionsInExpression(expr.falseCase, transform, flags);
        }
    }
    else if (expr instanceof o.TypeofExpr) {
        expr.expr = transformExpressionsInExpression(expr.expr, transform, flags);
    }
    else if (expr instanceof o.WriteVarExpr) {
        expr.value = transformExpressionsInExpression(expr.value, transform, flags);
    }
    else if (expr instanceof o.LocalizedString) {
        for (let i = 0; i < expr.expressions.length; i++) {
            expr.expressions[i] = transformExpressionsInExpression(expr.expressions[i], transform, flags);
        }
    }
    else if (expr instanceof o.NotExpr) {
        expr.condition = transformExpressionsInExpression(expr.condition, transform, flags);
    }
    else if (expr instanceof o.TaggedTemplateExpr) {
        expr.tag = transformExpressionsInExpression(expr.tag, transform, flags);
        expr.template.expressions = expr.template.expressions.map((e) => transformExpressionsInExpression(e, transform, flags));
    }
    else if (expr instanceof o.ArrowFunctionExpr) {
        if (Array.isArray(expr.body)) {
            for (let i = 0; i < expr.body.length; i++) {
                transformExpressionsInStatement(expr.body[i], transform, flags);
            }
        }
        else {
            expr.body = transformExpressionsInExpression(expr.body, transform, flags);
        }
    }
    else if (expr instanceof o.WrappedNodeExpr) {
        // TODO: Do we need to transform any TS nodes nested inside of this expression?
    }
    else if (expr instanceof o.ReadVarExpr ||
        expr instanceof o.ExternalExpr ||
        expr instanceof o.LiteralExpr) {
        // No action for these types.
    }
    else {
        throw new Error(`Unhandled expression kind: ${expr.constructor.name}`);
    }
    return transform(expr, flags);
}
/**
 * Transform all `Expression`s in the AST of `stmt` with the `transform` function.
 *
 * All such operations will be replaced with the result of applying `transform`, which may be an
 * identity transformation.
 */
export function transformExpressionsInStatement(stmt, transform, flags) {
    if (stmt instanceof o.ExpressionStatement) {
        stmt.expr = transformExpressionsInExpression(stmt.expr, transform, flags);
    }
    else if (stmt instanceof o.ReturnStatement) {
        stmt.value = transformExpressionsInExpression(stmt.value, transform, flags);
    }
    else if (stmt instanceof o.DeclareVarStmt) {
        if (stmt.value !== undefined) {
            stmt.value = transformExpressionsInExpression(stmt.value, transform, flags);
        }
    }
    else if (stmt instanceof o.IfStmt) {
        stmt.condition = transformExpressionsInExpression(stmt.condition, transform, flags);
        for (const caseStatement of stmt.trueCase) {
            transformExpressionsInStatement(caseStatement, transform, flags);
        }
        for (const caseStatement of stmt.falseCase) {
            transformExpressionsInStatement(caseStatement, transform, flags);
        }
    }
    else {
        throw new Error(`Unhandled statement kind: ${stmt.constructor.name}`);
    }
}
/**
 * Checks whether the given expression is a string literal.
 */
export function isStringLiteral(expr) {
    return expr instanceof o.LiteralExpr && typeof expr.value === 'string';
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwcmVzc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy90ZW1wbGF0ZS9waXBlbGluZS9pci9zcmMvZXhwcmVzc2lvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxLQUFLLENBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUluRCxPQUFPLEVBQUMsY0FBYyxFQUFFLE1BQU0sRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUkvQyxPQUFPLEVBQUMsYUFBYSxFQUFnQixNQUFNLGNBQWMsQ0FBQztBQUMxRCxPQUFPLEVBQ0wsaUJBQWlCLEVBQ2pCLG9CQUFvQixFQUVwQixhQUFhLEdBRWQsTUFBTSxVQUFVLENBQUM7QUFxQ2xCOztHQUVHO0FBQ0gsTUFBTSxVQUFVLGNBQWMsQ0FBQyxJQUFrQjtJQUMvQyxPQUFPLElBQUksWUFBWSxjQUFjLENBQUM7QUFDeEMsQ0FBQztBQUVEOztHQUVHO0FBQ0gsTUFBTSxPQUFnQixjQUFlLFNBQVEsQ0FBQyxDQUFDLFVBQVU7SUFHdkQsWUFBWSxhQUFxQyxJQUFJO1FBQ25ELEtBQUssQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDMUIsQ0FBQztDQVVGO0FBRUQ7O0dBRUc7QUFDSCxNQUFNLE9BQU8sZUFBZ0IsU0FBUSxjQUFjO0lBR2pELFlBQXFCLElBQVk7UUFDL0IsS0FBSyxFQUFFLENBQUM7UUFEVyxTQUFJLEdBQUosSUFBSSxDQUFRO1FBRmYsU0FBSSxHQUFHLGNBQWMsQ0FBQyxXQUFXLENBQUM7SUFJcEQsQ0FBQztJQUVRLGVBQWUsQ0FBQyxPQUE0QixFQUFFLE9BQVksSUFBUyxDQUFDO0lBRXBFLFlBQVksQ0FBQyxLQUFzQjtRQUMxQywwRkFBMEY7UUFDMUYsZ0NBQWdDO1FBQ2hDLGdDQUFnQztRQUNoQyxPQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssS0FBSyxD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QUFDLENBQUM7UUFDbEYsSUFBSSxDQUFDLEtBQUssR0FBRyxnQ0FBZ0MsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUM5RSxDQUFDO1NBQU0sSUFBSSxJQUFJLFlBQVksQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQzNDLElBQUksQ0FBQyxRQUFRLEdBQUcsZ0NBQWdDLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDbEYsSUFBSSxDQUFDLEtBQUssR0FBRyxnQ0FBZ0MsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUM5RSxDQUFDO1NBQU0sSUFBSSxJQUFJLFlBQVksQ0FBQyxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQzFDLElBQUksQ0FBQyxRQUFRLEdBQUcsZ0NBQWdDLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDbEYsSUFBSSxDQUFDLEtBQUssR0FBRyxnQ0FBZ0MsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM1RSxJQUFJLENBQUMsS0FBSyxHQUFHLGdDQUFnQyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzlFLENBQUM7U0FBTSxJQUFJLElBQUksWUFBWSxDQUFDLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUNoRCxJQUFJLENBQUMsRUFBRSxHQUFHLGdDQUFnQyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3RFLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQzFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsZ0NB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QUMsU0FBUyxFQUFFLENBQUM7WUFDM0MsK0JBQStCLENBQUMsYUFBYSxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNuRSxDQUFDO0lBQ0gsQ0FBQztTQUFNLENBQUM7UUFDTixNQUFNLElBQUksS0FBSyxDQUFDLDZCQUE2QixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7SUFDeEUsQ0FBQztBQUNILENBQUM7QUFFRDs7R0FFRztBQUNILE1BQU0sVUFBVSxlQUFlLENBQUMsSUFBa0I7SUFDaEQsT0FBTyxJQUFJLFlBQVksQ0FBQyxDQUFDLFdBQVcsSUFBSSxPQUFPLElBQUksQ0FBQyxLQUFLLEtBQUssUUFBUSxDQUFDO0FBQ3pFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIG8gZnJvbSAnLi4vLi4vLi4vLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0IHR5cGUge1BhcnNlU291cmNlU3Bhbn0gZnJvbSAnLi4vLi4vLi4vLi4vcGFyc2VfdXRpbCc7XG5cbmltcG9ydCAqIGFzIHQgZnJvbSAnLi4vLi4vLi4vLi4vcmVuZGVyMy9yM19hc3QnO1xuaW1wb3J0IHtFeHByZXNzaW9uS2luZCwgT3BLaW5kfSBmcm9tICcuL2VudW1zJztcbmltcG9ydCB7U2xvdEhhbmRsZX0gZnJvbSAnLi9oYW5kbGUnO1xuaW1wb3J0IHR5cGUge1hyZWZJZH0gZnJvbSAnLi9vcGVyYXRpb25zJztcbmltcG9ydCB0eXBlIHtDcmVhdGVPcH0gZnJvbSAnLi9vcHMvY3JlYXRlJztcbmltcG9ydCB7SW50ZXJwb2xhdGlvbiwgdHlwZSBVcGRhdGVPcH0gZnJvbSAnLi9vcHMvdXBkYXRlJztcbmltcG9ydCB7XG4gIENvbnN1bWVzVmFyc1RyYWl0LFxuICBEZXBlbmRzT25TbG90Q29udGV4dCxcbiAgRGVwZW5kc09uU2xvdENvbnRleHRPcFRyYWl0LFxuICBVc2VzVmFyT2Zmc2V0LFxuICBVc2VzVmFyT2Zmc2V0VHJhaXQsXG59IGZyb20gJy4vdHJhaXRzJztcblxuLyoqXG4gKiBBbiBgby5FeHByZXNzaW9uYCBzdWJ0eXBlIHJlcHJlc2VudGluZyBhIGxvZ2ljYWwgZXhwcmVzc2lvbiBpbiB0aGUgaW50ZXJtZWRpYXRlIHJlcHJlc2VudGF0aW9uLlxuICovXG5leHBvcnQgdHlwZSBFeHByZXNzaW9uID1cbiAgfCBMZXhpY2FsUmVhZEV4cHJcbiAgfCBSZWZlcmVuY2VFeHByXG4gIHwgQ29udGV4dEV4cHJcbiAgfCBOZXh0Q29udGV4dEV4cHJcbiAgfCBHZXRDdXJyZW50Vmlld0V4cHJcbiAgfCBSZXN0b3JlVmlld0V4cHJcbiAgfCBSZXNldFZpZXdFeHByXG4gIHwgUmVhZFZhcmlhYmxlRXhwclxuICB8IFB1cmVGdW5jdGlvbkV4cHJcbiAgfCBQdXJlRnVuY3Rpb25QYXJhbWV0ZXJFeHByXG4gIHwgUGlwZUJpbmRpbmdFeHByXG4gIHwgUGlwZUJpbmRpbmdWYXJpYWRpY0V4cHJcbiAgfCBTYWZlUHJvcGVydHlSZWFkRXhwclxuICB8IFNhZmVLZXllZFJlYWRFeHByXG4gIHwgU2FmZUludm9rZUZ1bmN0aW9uRXhwclxuICB8IEVtcHR5RXhwclxuICB8IEFzc2lnblRlbXBvcmFyeUV4cHJcbiAgfCBSZWFkVGVtcG9yYXJ5RXhwclxuICB8IFNsb3RMaXRlcmFsRXhwclxuICB8IENvbmRpdGlvbmFsQ2FzZUV4cHJcbiAgfCBDb25zdENvbGxlY3RlZEV4cHJcbiAgfCBUd29XYXlCaW5kaW5nU2V0RXhwclxuICB8IENvbnRleHRMZXRSZWZlcmVuY2VFeHByXG4gIHwgU3RvcmVMZXRFeHByO1xuXG4vKipcbiAqIFRyYW5zZm9ybWVyIHR5cGUgd2hpY2ggY29udmVydHMgZXhwcmVzc2lvbnMgaW50byBnZW5lcmFsIGBvLkV4cHJlc3Npb25gcyAod2hpY2ggbWF5IGJlIGFuXG4gKiBpZGVudGl0eSB0cmFuc2Zvcm1hdGlvbikuXG4gKi9cbmV4cG9ydCB0eXBlIEV4cHJlc3Npb25UcmFuc2Zvcm0gPSAoZXhwcjogby5FeHByZXNzaW9uLCBmbGFnczogVmlzaXRvckNvbnRleHRGbGFnKSA9PiBvLkV4cHJlc3Npb247XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciBhIGdpdmVuIGBvLkV4cHJlc3Npb25gIGlzIGEgbG9naWNhbCBJUiBleHByZXNzaW9uIHR5cGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0lyRXhwcmVzc2lvbihleHByOiBvLkV4cHJlc3Npb24pOiBleHByIGlzIEV4cHJlc3Npb24ge1xuICByZXR1cm4gZXhwciBpbnN0YW5jZW9mIEV4cHJlc3Npb25CYXNlO1xufVxuXG4vKipcbiAqIEJhc2UgdHlwZSB1c2VkIGZvciBhbGwgbG9naWNhbCBJUiBleHByZXNzaW9ucy5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEV4cHJlc3Npb25CYXNlIGV4dGVuZHMgby5FeHByZXNzaW9uIHtcbiAgYWJzdHJhY3QgcmVhZG9ubHkga2luZDogRXhwcmVzc2lvbktpbmQ7XG5cbiAgY29uc3RydWN0b3Ioc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbCA9IG51bGwpIHtcbiAgICBzdXBlcihudWxsLCBzb3VyY2VTcGFuKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW4gdGhlIHRyYW5zZm9ybWVyIGFnYWluc3QgYW55IG5lc3RlZCBleHByZXNzaW9ucyB3aGljaCBtYXkgYmUgcHJlc2VudCBpbiB0aGlzIElSIGV4cHJlc3Npb25cbiAgICogc3VidHlwZS5cbiAgICovXG4gIGFic3RyYWN0IHRyYW5zZm9ybUludGVybmFsRXhwcmVzc2lvbnMoXG4gICAgdHJhbnNmb3JtOiBFeHByZXNzaW9uVHJhbnNmb3JtLFxuICAgIGZsYWdzOiBWaXNpdG9yQ29udGV4dEZsYWcsXG4gICk6IHZvaWQ7XG59XG5cbi8qKlxuICogTG9naWNhbCBleHByZXNzaW9uIHJlcHJlc2VudGluZyBhIGxleGljYWwgcmVhZCBvZiBhIHZhcmlhYmxlIG5hbWUuXG4gKi9cbmV4cG9ydCBjbGFzcyBMZXhpY2FsUmVhZEV4cHIgZXh0ZW5kcyBFeHByZXNzaW9uQmFzZSB7XG4gIG92ZXJyaWRlIHJlYWRvbmx5IGtpbmQgPSBFeHByZXNzaW9uS2luZC5MZXhpY2FsUmVhZDtcblxuICBjb25zdHJ1Y3RvcihyZWFkb25seSBuYW1lOiBzdHJpbmcpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgb3ZlcnJpZGUgdmlzaXRFeHByZXNzaW9uKHZpc2l0b3I6IG8uRXhwcmVzc2lvblZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IHZvaWQge31cblxuICBvdmVycmlkZSBpc0VxdWl2YWxlbnQob3RoZXI6IExleGljYWxSZWFkRXhwcik6IGJvb2xlYW4ge1xuICAgIC8vIFdlIGFzc3VtZSB0aGF0IHRoZSBsZXhpY2FsIHJlYWRzIGFyZSBpbiB0aGUgc2FtZSBjb250ZXh0LCB3aGljaCBtdXN0IGJlIHRydWUgZm9yIHBhcmVudFxuICAgIC8vIGV4cHJlc3Npb25zIHRvIGJlIGVxdWl2YWxlbnQuXG4gICAgLy8gVE9ETzogaXMgdGhpcyBnZW5lcmFsbHkgc2FmZT9cbiAgICByZXR1cm4gdGhpcy5uYW1lID09PSBvdGhlci5uYW1lO1xuICB9XG5cbiAgb3ZlcnJpZGUgaXNDb25zdGFudCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBvdmVycmlkZSB0cmFuc2Zvcm1JbnRlcm5hbEV4cHJlc3Npb25zKCk6IHZvaWQge31cblxuICBvdmVycmlkZSBjbG9uZSgpOiBMZXhpY2FsUmVhZEV4cHIge1xuICAgIHJldHVybiBuZXcgTGV4aWNhbFJlYWRFeHByKHRoaXMubmFtZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBSdW50aW1lIG9wZXJhdGlvbiB0byByZXRyaWV2ZSB0aGUgdmFsdWUgb2YgYSBsb2NhbCByZWZlcmVuY2UuXG4gKi9cbmV4cG9ydCBjbGFzcyBSZWZlcmVuY2VFeHByIGV4dGVuZHMgRXhwcmVzc2lvbkJhc2Uge1xuICBvdmVycmlkZSByZWFkb25seSBraW5kID0gRXhwcmVzc2lvbktpbmQuUmVmZXJlbmNlO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHJlYWRvbmx5IHRhcmdldDogWHJlZklkLFxuICAgIHJlYWRvbmx5IHRhcmdldFNsb3Q6IFNsb3RIYW5kbGUsXG4gICAgcmVhZG9ubHkgb2Zmc2V0OiBudW1iZXIsXG4gICkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBvdmVycmlkZSB2aXNpdEV4cHJlc3Npb24oKTogdm9pZCB7fVxuXG4gIG92ZXJyaWRlIGlzRXF1aXZhbGVudChlOiBvLkV4cHJlc3Npb24pOiBib29sZWFuIHtcbiAgICByZXR1cm4gZSBpbnN0YW5jZW9mIFJlZmVyZW5jZUV4cHIgJiYgZS50YXJnZXQgPT09IHRoaXMudGFyZ2V0O1xuICB9XG5cbiAgb3ZlcnJpZGUgaXNDb25zdGFudCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBvdmVycmlkZSB0cmFuc2Zvcm1JbnRlcm5hbEV4cHJlc3Npb25zKCk6IHZvaWQge31cblxuICBvdmVycmlkZSBjbG9uZSgpOiBSZWZlcmVuY2VFeHByIHtcbiAgICByZXR1cm4gbmV3IFJlZmVyZW5jZUV4cHIodGhpcy50YXJnZXQsIHRoaXMudGFyZ2V0U2xvdCwgdGhpcy5vZmZzZXQpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTdG9yZUxldEV4cHJcbiAgZXh0ZW5kcyBFeHByZXNzaW9uQmFzZVxuICBpbXBsZW1lbnRzIENvbnN1bWVzVmFyc1RyYWl0LCBEZXBlbmRzT25TbG90Q29udGV4dE9wVHJhaXRcbntcbiAgb3ZlcnJpZGUgcmVhZG9ubHkga2luZCA9IEV4cHJlc3Npb25LaW5kLlN0b3JlTGV0O1xuICByZWFkb25seSBbQ29uc3VtZXNWYXJzVHJhaXRdID0gdHJ1ZTtcbiAgcmVhZG9ubHkgW0RlcGVuZHNPblNsb3RDb250ZXh0XSA9IHRydWU7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcmVhZG9ubHkgdGFyZ2V0OiBYcmVmSWQsXG4gICAgcHVibGljIHZhbHVlOiBvLkV4cHJlc3Npb24sXG4gICAgb3ZlcnJpZGUgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICApIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgb3ZlcnJpZGUgdmlzaXRFeHByZXNzaW9uKCk6IHZvaWQge31cblxuICBvdmVycmlkZSBpc0VxdWl2YWxlbnQoZTogby5FeHByZXNzaW9uKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIChcbiAgICAgIGUgaW5zdGFuY2VvZiBTdG9yZUxldEV4cHIgJiYgZS50YXJnZXQgPT09IHRoaXMudGFyZ2V0ICYmIGUudmFsdWUuaXNFcXVpdmFsZW50KHRoaXMudmFsdWUpXG4gICAgKTtcbiAgfVxuXG4gIG92ZXJyaWRlIGlzQ29uc3RhbnQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgb3ZlcnJpZGUgdHJhbnNmb3JtSW50ZXJuYWxFeHByZXNzaW9ucyhcbiAgICB0cmFuc2Zvcm06IEV4cHJlc3Npb25UcmFuc2Zvcm0sXG4gICAgZmxhZ3M6IFZpc2l0b3JDb250ZXh0RmxhZyxcbiAgKTogdm9pZCB7XG4gICAgdGhpcy52YWx1ZSA9IHRyYW5zZm9ybUV4cHJlc3Npb25zSW5FeHByZXNzaW9uKHRoaXMudmFsdWUsIHRyYW5zZm9ybSwgZmxhZ3MpO1xuICB9XG5cbiAgb3ZlcnJpZGUgY2xvbmUoKTogU3RvcmVMZXRFeHByIHtcbiAgICByZXR1cm4gbmV3IFN0b3JlTGV0RXhwcih0aGlzLnRhcmdldCwgdGhpcy52YWx1ZSwgdGhpcy5zb3VyY2VTcGFuKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ29udGV4dExldFJlZmVyZW5jZUV4cHIgZXh0ZW5kcyBFeHByZXNzaW9uQmFzZSB7XG4gIG92ZXJyaWRlIHJlYWRvbmx5IGtpbmQgPSBFeHByZXNzaW9uS2luZC5Db250ZXh0TGV0UmVmZXJlbmNlO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHJlYWRvbmx5IHRhcmdldDogWHJlZklkLFxuICAgIHJlYWRvbmx5IHRhcmdldFNsb3Q6IFNsb3RIYW5kbGUsXG4gICkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBvdmVycmlkZSB2aXNpdEV4cHJlc3Npb24oKTogdm9pZCB7fVxuXG4gIG92ZXJyaWRlIGlzRXF1aXZhbGVudChlOiBvLkV4cHJlc3Npb24pOiBib29sZWFuIHtcbiAgICByZXR1cm4gZSBpbnN0YW5jZW9mIENvbnRleHRMZXRSZWZlcmVuY2VFeHByICYmIGUudGFyZ2V0ID09PSB0aGlzLnRhcmdldDtcbiAgfVxuXG4gIG92ZXJyaWRlIGlzQ29uc3RhbnQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgb3ZlcnJpZGUgdHJhbnNmb3JtSW50ZXJuYWxFeHByZXNzaW9ucygpOiB2b2lkIHt9XG5cbiAgb3ZlcnJpZGUgY2xvbmUoKTogQ29udGV4dExldFJlZmVyZW5jZUV4cHIge1xuICAgIHJldHVybiBuZXcgQ29udGV4dExldFJlZmVyZW5jZUV4cHIodGhpcy50YXJnZXQsIHRoaXMudGFyZ2V0U2xvdCk7XG4gIH1cbn1cblxuLyoqXG4gKiBBIHJlZmVyZW5jZSB0byB0aGUgY3VycmVudCB2aWV3IGNvbnRleHQgKHVzdWFsbHkgdGhlIGBjdHhgIHZhcmlhYmxlIGluIGEgdGVtcGxhdGUgZnVuY3Rpb24pLlxuICovXG5leHBvcnQgY2xhc3MgQ29udGV4dEV4cHIgZXh0ZW5kcyBFeHByZXNzaW9uQmFzZSB7XG4gIG92ZXJyaWRlIHJlYWRvbmx5IGtpbmQgPSBFeHByZXNzaW9uS2luZC5Db250ZXh0O1xuXG4gIGNvbnN0cnVjdG9yKHJlYWRvbmx5IHZpZXc6IFhyZWZJZCkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBvdmVycmlkZSB2aXNpdEV4cHJlc3Npb24oKTogdm9pZCB7fVxuXG4gIG92ZXJyaWRlIGlzRXF1aXZhbGVudChlOiBvLkV4cHJlc3Npb24pOiBib29sZWFuIHtcbiAgICByZXR1cm4gZSBpbnN0YW5jZW9mIENvbnRleHRFeHByICYmIGUudmlldyA9PT0gdGhpcy52aWV3O1xuICB9XG5cbiAgb3ZlcnJpZGUgaXNDb25zdGFudCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBvdmVycmlkZSB0cmFuc2Zvcm1JbnRlcm5hbEV4cHJlc3Npb25zKCk6IHZvaWQge31cblxuICBvdmVycmlkZSBjbG9uZSgpOiBDb250ZXh0RXhwciB7XG4gICAgcmV0dXJuIG5ldyBDb250ZXh0RXhwcih0aGlzLnZpZXcpO1xuICB9XG59XG5cbi8qKlxuICogQSByZWZlcmVuY2UgdG8gdGhlIGN1cnJlbnQgdmlldyBjb250ZXh0IGluc2lkZSBhIHRyYWNrIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgY2xhc3MgVHJhY2tDb250ZXh0RXhwciBleHRlbmRzIEV4cHJlc3Npb25CYXNlIHtcbiAgb3ZlcnJpZGUgcmVhZG9ubHkga2luZCA9IEV4cHJlc3Npb25LaW5kLlRyYWNrQ29udGV4dDtcblxuICBjb25zdHJ1Y3RvcihyZWFkb25seSB2aWV3OiBYcmVmSWQpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgb3ZlcnJpZGUgdmlzaXRFeHByZXNzaW9uKCk6IHZvaWQge31cblxuICBvdmVycmlkZSBpc0VxdWl2YWxlbnQoZTogby5FeHByZXNzaW9uKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGUgaW5zdGFuY2VvZiBUcmFja0NvbnRleHRFeHByICYmIGUudmlldyA9PT0gdGhpcy52aWV3O1xuICB9XG5cbiAgb3ZlcnJpZGUgaXNDb25zdGFudCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBvdmVycmlkZSB0cmFuc2Zvcm1JbnRlcm5hbEV4cHJlc3Npb25zKCk6IHZvaWQge31cblxuICBvdmVycmlkZSBjbG9uZSgpOiBUcmFja0NvbnRleHRFeHByIHtcbiAgICByZXR1cm4gbmV3IFRyYWNrQ29udGV4dEV4cHIodGhpcy52aWV3KTtcbiAgfVxufVxuXG4vKipcbiAqIFJ1bnRpbWUgb3BlcmF0aW9uIHRvIG5hdmlnYXRlIHRvIHRoZSBuZXh0IHZpZXcgY29udGV4dCBpbiB0aGUgdmlldyBoaWVyYXJjaHkuXG4gKi9cbmV4cG9ydCBjbGFzcyBOZXh0Q29udGV4dEV4cHIgZXh0ZW5kcyBFeHByZXNzaW9uQmFzZSB7XG4gIG92ZXJyaWRlIHJlYWRvbmx5IGtpbmQgPSBFeHByZXNzaW9uS2luZC5OZXh0Q29udGV4dDtcblxuICBzdGVwcyA9IDE7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIG92ZXJyaWRlIHZpc2l0RXhwcmVzc2lvbigpOiB2b2lkIHt9XG5cbiAgb3ZlcnJpZGUgaXNFcXVpdmFsZW50KGU6IG8uRXhwcmVzc2lvbik6IGJvb2xlYW4ge1xuICAgIHJldHVybiBlIGluc3RhbmNlb2YgTmV4dENvbnRleHRFeHByICYmIGUuc3RlcHMgPT09IHRoaXMuc3RlcHM7XG4gIH1cblxuICBvdmVycmlkZSBpc0NvbnN0YW50KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIG92ZXJyaWRlIHRyYW5zZm9ybUludGVybmFsRXhwcmVzc2lvbnMoKTogdm9pZCB7fVxuXG4gIG92ZXJyaWRlIGNsb25lKCk6IE5leHRDb250ZXh0RXhwciB7XG4gICAgY29uc3QgZXhwciA9IG5ldyBOZXh0Q29udGV4dEV4cHIoKTtcbiAgICBleHByLnN0ZXBzID0gdGhpcy5zdGVwcztcbiAgICByZXR1cm4gZXhwcjtcbiAgfVxufVxuXG4vKipcbiAqIFJ1bnRpbWUgb3BlcmF0aW9uIHRvIHNuYXBzaG90IHRoZSBjdXJyZW50IHZpZXcgY29udGV4dC5cbiAqXG4gKiBUaGUgcmVzdWx0IG9mIHRoaXMgb3BlcmF0aW9uIGNhbiBiZSBzdG9yZWQgaW4gYSB2YXJpYWJsZSBhbmQgbGF0ZXIgdXNlZCB3aXRoIHRoZSBgUmVzdG9yZVZpZXdgXG4gKiBvcGVyYXRpb24uXG4gKi9cbmV4cG9ydCBjbGFzcyBHZXRDdXJyZW50Vmlld0V4cHIgZXh0ZW5kcyBFeHByZXNzaW9uQmFzZSB7XG4gIG92ZXJyaWRlIHJlYWRvbmx5IGtpbmQgPSBFeHByZXNzaW9uS2luZC5HZXRDdXJyZW50VmlldztcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgb3ZlcnJpZGUgdmlzaXRFeHByZXNzaW9uKCk6IHZvaWQge31cblxuICBvdmVycmlkZSBpc0VxdWl2YWxlbnQoZTogby5FeHByZXNzaW9uKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGUgaW5zdGFuY2VvZiBHZXRDdXJyZW50Vmlld0V4cHI7XG4gIH1cblxuICBvdmVycmlkZSBpc0NvbnN0YW50KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIG92ZXJyaWRlIHRyYW5zZm9ybUludGVybmFsRXhwcmVzc2lvbnMoKTogdm9pZCB7fVxuXG4gIG92ZXJyaWRlIGNsb25lKCk6IEdldEN1cnJlbnRWaWV3RXhwciB7XG4gICAgcmV0dXJuIG5ldyBHZXRDdXJyZW50Vmlld0V4cHIoKTtcbiAgfVxufVxuXG4vKipcbiAqIFJ1bnRpbWUgb3BlcmF0aW9uIHRvIHJlc3RvcmUgYSBzbmFwc2hvdHRlZCB2aWV3LlxuICovXG5leHBvcnQgY2xhc3MgUmVzdG9yZVZpZXdFeHByIGV4dGVuZHMgRXhwcmVzc2lvbkJhc2Uge1xuICBvdmVycmlkZSByZWFkb25seSBraW5kID0gRXhwcmVzc2lvbktpbmQuUmVzdG9yZVZpZXc7XG5cbiAgY29uc3RydWN0b3IocHVibGljIHZpZXc6IFhyZWZJZCB8IG8uRXhwcmVzc2lvbikge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBvdmVycmlkZSB2aXNpdEV4cHJlc3Npb24odmlzaXRvcjogby5FeHByZXNzaW9uVmlzaXRvciwgY29udGV4dDogYW55KTogdm9pZCB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnZpZXcgIT09ICdudW1iZXInKSB7XG4gICAgICB0aGlzLnZpZXcudmlzaXRFeHByZXNzaW9uKHZpc2l0b3IsIGNvbnRleHQpO1xuICAgIH1cbiAgfVxuXG4gIG92ZXJyaWRlIGlzRXF1aXZhbGVudChlOiBvLkV4cHJlc3Npb24pOiBib29sZWFuIHtcbiAgICBpZiAoIShlIGluc3RhbmNlb2YgUmVzdG9yZVZpZXdFeHByKSB8fCB0eXBlb2YgZS52aWV3ICE9PSB0eXBlb2YgdGhpcy52aWV3KSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiB0aGlzLnZpZXcgPT09ICdudW1iZXInKSB7XG4gICAgICByZXR1cm4gdGhpcy52aWV3ID09PSBlLnZpZXc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnZpZXcuaXNFcXVpdmFsZW50KGUudmlldyBhcyBvLkV4cHJlc3Npb24pO1xuICAgIH1cbiAgfVxuXG4gIG92ZXJyaWRlIGlzQ29uc3RhbnQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgb3ZlcnJpZGUgdHJhbnNmb3JtSW50ZXJuYWxFeHByZXNzaW9ucyhcbiAgICB0cmFuc2Zvcm06IEV4cHJlc3Npb25UcmFuc2Zvcm0sXG4gICAgZmxhZ3M6IFZpc2l0b3JDb250ZXh0RmxhZyxcbiAgKTogdm9pZCB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnZpZXcgIT09ICdudW1iZXInKSB7XG4gICAgICB0aGlzLnZpZXcgPSB0cmFuc2Zvcm1FeHByZXNzaW9uc0luRXhwcmVzc2lvbih0aGlzLnZpZXcsIHRyYW5zZm9ybSwgZmxhZ3MpO1xuICAgIH1cbiAgfVxuXG4gIG92ZXJyaWRlIGNsb25lKCk6IFJlc3RvcmVWaWV3RXhwciB7XG4gICAgcmV0dXJuIG5ldyBSZXN0b3JlVmlld0V4cHIodGhpcy52aWV3IGluc3RhbmNlb2Ygby5FeHByZXNzaW9uID8gdGhpcy52aWV3LmNsb25lKCkgOiB0aGlzLnZpZXcpO1xuICB9XG59XG5cbi8qKlxuICogUnVudGltZSBvcGVyYXRpb24gdG8gcmVzZXQgdGhlIGN1cnJlbnQgdmlldyBjb250ZXh0IGFmdGVyIGBSZXN0b3JlVmlld2AuXG4gKi9cbmV4cG9ydCBjbGFzcyBSZXNldFZpZXdFeHByIGV4dGVuZHMgRXhwcmVzc2lvbkJhc2Uge1xuICBvdmVycmlkZSByZWFkb25seSBraW5kID0gRXhwcmVzc2lvbktpbmQuUmVzZXRWaWV3O1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBleHByOiBvLkV4cHJlc3Npb24pIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgb3ZlcnJpZGUgdmlzaXRFeHByZXNzaW9uKHZpc2l0b3I6IG8uRXhwcmVzc2lvblZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgdGhpcy5leHByLnZpc2l0RXhwcmVzc2lvbih2aXNpdG9yLCBjb250ZXh0KTtcbiAgfVxuXG4gIG92ZXJyaWRlIGlzRXF1aXZhbGVudChlOiBvLkV4cHJlc3Npb24pOiBib29sZWFuIHtcbiAgICByZXR1cm4gZSBpbnN0YW5jZW9mIFJlc2V0Vmlld0V4cHIgJiYgdGhpcy5leHByLmlzRXF1aXZhbGVudChlLmV4cHIpO1xuICB9XG5cbiAgb3ZlcnJpZGUgaXNDb25zdGFudCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBvdmVycmlkZSB0cmFuc2Zvcm1JbnRlcm5hbEV4cHJlc3Npb25zKFxuICAgIHRyYW5zZm9ybTogRXhwcmVzc2lvblRyYW5zZm9ybSxcbiAgICBmbGFnczogVmlzaXRvckNvbnRleHRGbGFnLFxuICApOiB2b2lkIHtcbiAgICB0aGlzLmV4cHIgPSB0cmFuc2Zvcm1FeHByZXNzaW9uc0luRXhwcmVzc2lvbih0aGlzLmV4cHIsIHRyYW5zZm9ybSwgZmxhZ3MpO1xuICB9XG5cbiAgb3ZlcnJpZGUgY2xvbmUoKTogUmVzZXRWaWV3RXhwciB7XG4gICAgcmV0dXJuIG5ldyBSZXNldFZpZXdFeHByKHRoaXMuZXhwci5jbG9uZSgpKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVHdvV2F5QmluZGluZ1NldEV4cHIgZXh0ZW5kcyBFeHByZXNzaW9uQmFzZSB7XG4gIG92ZXJyaWRlIHJlYWRvbmx5IGtpbmQgPSBFeHByZXNzaW9uS2luZC5Ud29XYXlCaW5kaW5nU2V0O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyB0YXJnZXQ6IG8uRXhwcmVzc2lvbixcbiAgICBwdWJsaWMgdmFsdWU6IG8uRXhwcmVzc2lvbixcbiAgKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIG92ZXJyaWRlIHZpc2l0RXhwcmVzc2lvbih2aXNpdG9yOiBvLkV4cHJlc3Npb25WaXNpdG9yLCBjb250ZXh0OiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLnRhcmdldC52aXNpdEV4cHJlc3Npb24odmlzaXRvciwgY29udGV4dCk7XG4gICAgdGhpcy52YWx1ZS52aXNpdEV4cHJlc3Npb24odmlzaXRvciwgY29udGV4dCk7XG4gIH1cblxuICBvdmVycmlkZSBpc0VxdWl2YWxlbnQob3RoZXI6IFR3b1dheUJpbmRpbmdTZXRFeHByKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMudGFyZ2V0LmlzRXF1aXZhbGVudChvdGhlci50YXJnZXQpICYmIHRoaXMudmFsdWUuaXNFcXVpdmFsZW50KG90aGVyLnZhbHVlKTtcbiAgfVxuXG4gIG92ZXJyaWRlIGlzQ29uc3RhbnQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgb3ZlcnJpZGUgdHJhbnNmb3JtSW50ZXJuYWxFeHByZXNzaW9ucyh0cmFuc2Zvcm06IEV4cHJlc3Npb25UcmFuc2Zvcm0sIGZsYWdzOiBWaXNpdG9yQ29udGV4dEZsYWcpIHtcbiAgICB0aGlzLnRhcmdldCA9IHRyYW5zZm9ybUV4cHJlc3Npb25zSW5FeHByZXNzaW9uKHRoaXMudGFyZ2V0LCB0cmFuc2Zvcm0sIGZsYWdzKTtcbiAgICB0aGlzLnZhbHVlID0gdHJhbnNmb3JtRXhwcmVzc2lvbnNJbkV4cHJlc3Npb24odGhpcy52YWx1ZSwgdHJhbnNmb3JtLCBmbGFncyk7XG4gIH1cblxuICBvdmVycmlkZSBjbG9uZSgpOiBUd29XYXlCaW5kaW5nU2V0RXhwciB7XG4gICAgcmV0dXJuIG5ldyBUd29XYXlCaW5kaW5nU2V0RXhwcih0aGlzLnRhcmdldCwgdGhpcy52YWx1ZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZWFkIG9mIGEgdmFyaWFibGUgZGVjbGFyZWQgYXMgYW4gYGlyLlZhcmlhYmxlT3BgIGFuZCByZWZlcmVuY2VkIHRocm91Z2ggaXRzIGBpci5YcmVmSWRgLlxuICovXG5leHBvcnQgY2xhc3MgUmVhZFZhcmlhYmxlRXhwciBleHRlbmRzIEV4cHJlc3Npb25CYXNlIHtcbiAgb3ZlcnJpZGUgcmVhZG9ubHkga2luZCA9IEV4cHJlc3Npb25LaW5kLlJlYWRWYXJpYWJsZTtcbiAgbmFtZTogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG4gIGNvbnN0cnVjdG9yKHJlYWRvbmx5IHhyZWY6IFhyZWZJZCkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBvdmVycmlkZSB2aXNpdEV4cHJlc3Npb24oKTogdm9pZCB7fVxuXG4gIG92ZXJyaWRlIGlzRXF1aXZhbGVudChvdGhlcjogby5FeHByZXNzaW9uKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIG90aGVyIGluc3RhbmNlb2YgUmVhZFZhcmlhYmxlRXhwciAmJiBvdGhlci54cmVmID09PSB0aGlzLnhyZWY7XG4gIH1cblxuICBvdmVycmlkZSBpc0NvbnN0YW50KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIG92ZXJyaWRlIHRyYW5zZm9ybUludGVybmFsRXhwcmVzc2lvbnMoKTogdm9pZCB7fVxuXG4gIG92ZXJyaWRlIGNsb25lKCk6IFJlYWRWYXJpYWJsZUV4cHIge1xuICAgIGNvbnN0IGV4cHIgPSBuZXcgUmVhZFZhcmlhYmxlRXhwcih0aGlzLnhyZWYpO1xuICAgIGV4cHIubmFtZSA9IHRoaXMubmFtZTtcbiAgICByZXR1cm4gZXhwcjtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUHVyZUZ1bmN0aW9uRXhwclxuICBleHRlbmRzIEV4cHJlc3Npb25CYXNlXG4gIGltcGxlbWVudHMgQ29uc3VtZXNWYXJzVHJhaXQsIFVzZXNWYXJPZmZzZXRUcmFpdFxue1xuICBvdmVycmlkZSByZWFkb25seSBraW5kID0gRXhwcmVzc2lvbktpbmQuUHVyZUZ1bmN0aW9uRXhwcjtcbiAgcmVhZG9ubHkgW0NvbnN1bWVzVmFyc1RyYWl0XSA9IHRydWU7XG4gIHJlYWRvbmx5IFtVc2VzVmFyT2Zmc2V0XSA9IHRydWU7XG5cbiAgdmFyT2Zmc2V0OiBudW1iZXIgfCBudWxsID0gbnVsbDtcblxuICAvKipcbiAgICogVGhlIGV4cHJlc3Npb24gd2hpY2ggc2hvdWxkIGJlIG1lbW9pemVkIGFzIGEgcHVyZSBjb21wdXRhdGlvbi5cbiAgICpcbiAgICogVGhpcyBleHByZXNzaW9uIGNvbnRhaW5zIGludGVybmFsIGBQdXJlRnVuY3Rpb25QYXJhbWV0ZXJFeHByYHMsIHdoaWNoIGFyZSBwbGFjZWhvbGRlcnMgZm9yIHRoZVxuICAgKiBwb3NpdGlvbmFsIGFyZ3VtZW50IGV4cHJlc3Npb25zIGluIGBhcmdzLlxuICAgKi9cbiAgYm9keTogby5FeHByZXNzaW9uIHwgbnVsbDtcblxuICAvKipcbiAgICogUG9zaXRpb25hbCBhcmd1bWVudHMgdG8gdGhlIHB1cmUgZnVuY3Rpb24gd2hpY2ggd2lsbCBtZW1vaXplIHRoZSBgYm9keWAgZXhwcmVzc2lvbiwgd2hpY2ggYWN0XG4gICAqIGFzIG1lbW9pemF0aW9uIGtleXMuXG4gICAqL1xuICBhcmdzOiBvLkV4cHJlc3Npb25bXTtcblxuICAvKipcbiAgICogT25jZSBleHRyYWN0ZWQgdG8gdGhlIGBDb25zdGFudFBvb2xgLCBhIHJlZmVyZW5jZSB0byB0aGUgZnVuY3Rpb24gd2hpY2ggZGVmaW5lcyB0aGUgY29tcHV0YXRpb25cbiAgICogb2YgYGJvZHlgLlxuICAgKi9cbiAgZm46IG8uRXhwcmVzc2lvbiB8IG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKGV4cHJlc3Npb246IG8uRXhwcmVzc2lvbiB8IG51bGwsIGFyZ3M6IG8uRXhwcmVzc2lvbltdKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmJvZHkgPSBleHByZXNzaW9uO1xuICAgIHRoaXMuYXJncyA9IGFyZ3M7XG4gIH1cblxuICBvdmVycmlkZSB2aXNpdEV4cHJlc3Npb24odmlzaXRvcjogby5FeHByZXNzaW9uVmlzaXRvciwgY29udGV4dDogYW55KSB7XG4gICAgdGhpcy5ib2R5Py52aXNpdEV4cHJlc3Npb24odmlzaXRvciwgY29udGV4dCk7XG4gICAgZm9yIChjb25zdCBhcmcgb2YgdGhpcy5hcmdzKSB7XG4gICAgICBhcmcudmlzaXRFeHByZXNzaW9uKHZpc2l0b3IsIGNvbnRleHQpO1xuICAgIH1cbiAgfVxuXG4gIG92ZXJyaWRlIGlzRXF1aXZhbGVudChvdGhlcjogby5FeHByZXNzaW9uKTogYm9vbGVhbiB7XG4gICAgaWYgKCEob3RoZXIgaW5zdGFuY2VvZiBQdXJlRnVuY3Rpb25FeHByKSB8fCBvdGhlci5hcmdzLmxlbmd0aCAhPT0gdGhpcy5hcmdzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICBvdGhlci5ib2R5ICE9PSBudWxsICYmXG4gICAgICB0aGlzLmJvZHkgIT09IG51bGwgJiZcbiAgICAgIG90aGVyLmJvZHkuaXNFcXVpdmFsZW50KHRoaXMuYm9keSkgJiZcbiAgICAgIG90aGVyLmFyZ3MuZXZlcnkoKGFyZywgaWR4KSA9PiBhcmcuaXNFcXVpdmFsZW50KHRoaXMuYXJnc1tpZHhdKSlcbiAgICApO1xuICB9XG5cbiAgb3ZlcnJpZGUgaXNDb25zdGFudCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBvdmVycmlkZSB0cmFuc2Zvcm1JbnRlcm5hbEV4cHJlc3Npb25zKFxuICAgIHRyYW5zZm9ybTogRXhwcmVzc2lvblRyYW5zZm9ybSxcbiAgICBmbGFnczogVmlzaXRvckNvbnRleHRGbGFnLFxuICApOiB2b2lkIHtcbiAgICBpZiAodGhpcy5ib2R5ICE9PSBudWxsKSB7XG4gICAgICAvLyBUT0RPOiBmaWd1cmUgb3V0IGlmIHRoaXMgaXMgdGhlIHJpZ2h0IGZsYWcgdG8gcGFzcyBoZXJlLlxuICAgICAgdGhpcy5ib2R5ID0gdHJhbnNmb3JtRXhwcmVzc2lvbnNJbkV4cHJlc3Npb24oXG4gICAgICAgIHRoaXMuYm9keSxcbiAgICAgICAgdHJhbnNmb3JtLFxuICAgICAgICBmbGFncyB8IFZpc2l0b3JDb250ZXh0RmxhZy5JbkNoaWxkT3BlcmF0aW9uLFxuICAgICAgKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuZm4gIT09IG51bGwpIHtcbiAgICAgIHRoaXMuZm4gPSB0cmFuc2Zvcm1FeHByZXNzaW9uc0luRXhwcmVzc2lvbih0aGlzLmZuLCB0cmFuc2Zvcm0sIGZsYWdzKTtcbiAgICB9XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgdGhpcy5hcmdzW2ldID0gdHJhbnNmb3JtRXhwcmVzc2lvbnNJbkV4cHJlc3Npb24odGhpcy5hcmdzW2ldLCB0cmFuc2Zvcm0sIGZsYWdzKTtcbiAgICB9XG4gIH1cblxuICBvdmVycmlkZSBjbG9uZSgpOiBQdXJlRnVuY3Rpb25FeHByIHtcbiAgICBjb25zdCBleHByID0gbmV3IFB1cmVGdW5jdGlvbkV4cHIoXG4gICAgICB0aGlzLmJvZHk/LmNsb25lKCkgPz8gbnVsbCxcbiAgICAgIHRoaXMuYXJncy5tYXAoKGFyZykgPT4gYXJnLmNsb25lKCkpLFxuICAgICk7XG4gICAgZXhwci5mbiA9IHRoaXMuZm4/LmNsb25lKCkgPz8gbnVsbDtcbiAgICBleHByLnZhck9mZnNldCA9IHRoaXMudmFyT2Zmc2V0O1xuICAgIHJldHVybiBleHByO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBQdXJlRnVuY3Rpb25QYXJhbWV0ZXJFeHByIGV4dGVuZHMgRXhwcmVzc2lvbkJhc2Uge1xuICBvdmVycmlkZSByZWFkb25seSBraW5kID0gRXhwcmVzc2lvbktpbmQuUHVyZUZ1bmN0aW9uUGFyYW1ldGVyRXhwcjtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgaW5kZXg6IG51bWJlcikge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBvdmVycmlkZSB2aXNpdEV4cHJlc3Npb24oKTogdm9pZCB7fVxuXG4gIG92ZXJyaWRlIGlzRXF1aXZhbGVudChvdGhlcjogby5FeHByZXNzaW9uKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIG90aGVyIGluc3RhbmNlb2YgUHVyZUZ1bmN0aW9uUGFyYW1ldGVyRXhwciAmJiBvdGhlci5pbmRleCA9PT0gdGhpcy5pbmRleDtcbiAgfVxuXG4gIG92ZXJyaWRlIGlzQ29uc3RhbnQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBvdmVycmlkZSB0cmFuc2Zvcm1JbnRlcm5hbEV4cHJlc3Npb25zKCk6IHZvaWQge31cblxuICBvdmVycmlkZSBjbG9uZSgpOiBQdXJlRnVuY3Rpb25QYXJhbWV0ZXJFeHByIHtcbiAgICByZXR1cm4gbmV3IFB1cmVGdW5jdGlvblBhcmFtZXRlckV4cHIodGhpcy5pbmRleCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFBpcGVCaW5kaW5nRXhwclxuICBleHRlbmRzIEV4cHJlc3Npb25CYXNlXG4gIGltcGxlbWVudHMgQ29uc3VtZXNWYXJzVHJhaXQsIFVzZXNWYXJPZmZzZXRUcmFpdFxue1xuICBvdmVycmlkZSByZWFkb25seSBraW5kID0gRXhwcmVzc2lvbktpbmQuUGlwZUJpbmRpbmc7XG4gIHJlYWRvbmx5IFtDb25zdW1lc1ZhcnNUcmFpdF0gPSB0cnVlO1xuICByZWFkb25seSBbVXNlc1Zhck9mZnNldF0gPSB0cnVlO1xuXG4gIHZhck9mZnNldDogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcmVhZG9ubHkgdGFyZ2V0OiBYcmVmSWQsXG4gICAgcmVhZG9ubHkgdGFyZ2V0U2xvdDogU2xvdEhhbmRsZSxcbiAgICByZWFkb25seSBuYW1lOiBzdHJpbmcsXG4gICAgcmVhZG9ubHkgYXJnczogby5FeHByZXNzaW9uW10sXG4gICkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBvdmVycmlkZSB2aXNpdEV4cHJlc3Npb24odmlzaXRvcjogby5FeHByZXNzaW9uVmlzaXRvciwgY29udGV4dDogYW55KTogdm9pZCB7XG4gICAgZm9yIChjb25zdCBhcmcgb2YgdGhpcy5hcmdzKSB7XG4gICAgICBhcmcudmlzaXRFeHByZXNzaW9uKHZpc2l0b3IsIGNvbnRleHQpO1xuICAgIH1cbiAgfVxuXG4gIG92ZXJyaWRlIGlzRXF1aXZhbGVudCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBvdmVycmlkZSBpc0NvbnN0YW50KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIG92ZXJyaWRlIHRyYW5zZm9ybUludGVybmFsRXhwcmVzc2lvbnMoXG4gICAgdHJhbnNmb3JtOiBFeHByZXNzaW9uVHJhbnNmb3JtLFxuICAgIGZsYWdzOiBWaXNpdG9yQ29udGV4dEZsYWcsXG4gICk6IHZvaWQge1xuICAgIGZvciAobGV0IGlkeCA9IDA7IGlkeCA8IHRoaXMuYXJncy5sZW5ndGg7IGlkeCsrKSB7XG4gICAgICB0aGlzLmFyZ3NbaWR4XSA9IHRyYW5zZm9ybUV4cHJlc3Npb25zSW5FeHByZXNzaW9uKHRoaXMuYXJnc1tpZHhdLCB0cmFuc2Zvcm0sIGZsYWdzKTtcbiAgICB9XG4gIH1cblxuICBvdmVycmlkZSBjbG9uZSgpIHtcbiAgICBjb25zdCByID0gbmV3IFBpcGVCaW5kaW5nRXhwcihcbiAgICAgIHRoaXMudGFyZ2V0LFxuICAgICAgdGhpcy50YXJnZXRTbG90LFxuICAgICAgdGhpcy5uYW1lLFxuICAgICAgdGhpcy5hcmdzLm1hcCgoYSkgPT4gYS5jbG9uZSgpKSxcbiAgICApO1xuICAgIHIudmFyT2Zmc2V0ID0gdGhpcy52YXJPZmZzZXQ7XG4gICAgcmV0dXJuIHI7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFBpcGVCaW5kaW5nVmFyaWFkaWNFeHByXG4gIGV4dGVuZHMgRXhwcmVzc2lvbkJhc2VcbiAgaW1wbGVtZW50cyBDb25zdW1lc1ZhcnNUcmFpdCwgVXNlc1Zhck9mZnNldFRyYWl0XG57XG4gIG92ZXJyaWRlIHJlYWRvbmx5IGtpbmQgPSBFeHByZXNzaW9uS2luZC5QaXBlQmluZGluZ1ZhcmlhZGljO1xuICByZWFkb25seSBbQ29uc3VtZXNWYXJzVHJhaXRdID0gdHJ1ZTtcbiAgcmVhZG9ubHkgW1VzZXNWYXJPZmZzZXRdID0gdHJ1ZTtcblxuICB2YXJPZmZzZXQ6IG51bWJlciB8IG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHJlYWRvbmx5IHRhcmdldDogWHJlZklkLFxuICAgIHJlYWRvbmx5IHRhcmdldFNsb3Q6IFNsb3RIYW5kbGUsXG4gICAgcmVhZG9ubHkgbmFtZTogc3RyaW5nLFxuICAgIHB1YmxpYyBhcmdzOiBvLkV4cHJlc3Npb24sXG4gICAgcHVibGljIG51bUFyZ3M6IG51bWJlcixcbiAgKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIG92ZXJyaWRlIHZpc2l0RXhwcmVzc2lvbih2aXNpdG9yOiBvLkV4cHJlc3Npb25WaXNpdG9yLCBjb250ZXh0OiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLmFyZ3MudmlzaXRFeHByZXNzaW9uKHZpc2l0b3IsIGNvbnRleHQpO1xuICB9XG5cbiAgb3ZlcnJpZGUgaXNFcXVpdmFsZW50KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIG92ZXJyaWRlIGlzQ29uc3RhbnQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgb3ZlcnJpZGUgdHJhbnNmb3JtSW50ZXJuYWxFeHByZXNzaW9ucyhcbiAgICB0cmFuc2Zvcm06IEV4cHJlc3Npb25UcmFuc2Zvcm0sXG4gICAgZmxhZ3M6IFZpc2l0b3JDb250ZXh0RmxhZyxcbiAgKTogdm9pZCB7XG4gICAgdGhpcy5hcmdzID0gdHJhbnNmb3JtRXhwcmVzc2lvbnNJbkV4cHJlc3Npb24odGhpcy5hcmdzLCB0cmFuc2Zvcm0sIGZsYWdzKTtcbiAgfVxuXG4gIG92ZXJyaWRlIGNsb25lKCk6IFBpcGVCaW5kaW5nVmFyaWFkaWNFeHByIHtcbiAgICBjb25zdCByID0gbmV3IFBpcGVCaW5kaW5nVmFyaWFkaWNFeHByKFxuICAgICAgdGhpcy50YXJnZXQsXG4gICAgICB0aGlzLnRhcmdldFNsb3QsXG4gICAgICB0aGlzLm5hbWUsXG4gICAgICB0aGlzLmFyZ3MuY2xvbmUoKSxcbiAgICAgIHRoaXMubnVtQXJncyxcbiAgICApO1xuICAgIHIudmFyT2Zmc2V0ID0gdGhpcy52YXJPZmZzZXQ7XG4gICAgcmV0dXJuIHI7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNhZmVQcm9wZXJ0eVJlYWRFeHByIGV4dGVuZHMgRXhwcmVzc2lvbkJhc2Uge1xuICBvdmVycmlkZSByZWFkb25seSBraW5kID0gRXhwcmVzc2lvbktpbmQuU2FmZVByb3BlcnR5UmVhZDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgcmVjZWl2ZXI6IG8uRXhwcmVzc2lvbixcbiAgICBwdWJsaWMgbmFtZTogc3RyaW5nLFxuICApIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgLy8gQW4gYWxpYXMgZm9yIG5hbWUsIHdoaWNoIGFsbG93cyBvdGhlciBsb2dpYyB0byBoYW5kbGUgcHJvcGVydHkgcmVhZHMgYW5kIGtleWVkIHJlYWRzIHRvZ2V0aGVyLlxuICBnZXQgaW5kZXgoKSB7XG4gICAgcmV0dXJuIHRoaXMubmFtZTtcbiAgfVxuXG4gIG92ZXJyaWRlIHZpc2l0RXhwcmVzc2lvbih2aXNpdG9yOiBvLkV4cHJlc3Npb25WaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHRoaXMucmVjZWl2ZXIudmlzaXRFeHByZXNzaW9uKHZpc2l0b3IsIGNvbnRleHQpO1xuICB9XG5cbiAgb3ZlcnJpZGUgaXNFcXVpdmFsZW50KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIG92ZXJyaWRlIGlzQ29uc3RhbnQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgb3ZlcnJpZGUgdHJhbnNmb3JtSW50ZXJuYWxFeHByZXNzaW9ucyhcbiAgICB0cmFuc2Zvcm06IEV4cHJlc3Npb25UcmFuc2Zvcm0sXG4gICAgZmxhZ3M6IFZpc2l0b3JDb250ZXh0RmxhZyxcbiAgKTogdm9pZCB7XG4gICAgdGhpcy5yZWNlaXZlciA9IHRyYW5zZm9ybUV4cHJlc3Npb25zSW5FeHByZXNzaW9uKHRoaXMucmVjZWl2ZXIsIHRyYW5zZm9ybSwgZmxhZ3MpO1xuICB9XG5cbiAgb3ZlcnJpZGUgY2xvbmUoKTogU2FmZVByb3BlcnR5UmVhZEV4cHIge1xuICAgIHJldHVybiBuZXcgU2FmZVByb3BlcnR5UmVhZEV4cHIodGhpcy5yZWNlaXZlci5jbG9uZSgpLCB0aGlzLm5hbWUpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTYWZlS2V5ZWRSZWFkRXhwciBleHRlbmRzIEV4cHJlc3Npb25CYXNlIHtcbiAgb3ZlcnJpZGUgcmVhZG9ubHkga2luZCA9IEV4cHJlc3Npb25LaW5kLlNhZmVLZXllZFJlYWQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIHJlY2VpdmVyOiBvLkV4cHJlc3Npb24sXG4gICAgcHVibGljIGluZGV4OiBvLkV4cHJlc3Npb24sXG4gICAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbCxcbiAgKSB7XG4gICAgc3VwZXIoc291cmNlU3Bhbik7XG4gIH1cblxuICBvdmVycmlkZSB2aXNpdEV4cHJlc3Npb24odmlzaXRvcjogby5FeHByZXNzaW9uVmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICB0aGlzLnJlY2VpdmVyLnZpc2l0RXhwcmVzc2lvbih2aXNpdG9yLCBjb250ZXh0KTtcbiAgICB0aGlzLmluZGV4LnZpc2l0RXhwcmVzc2lvbih2aXNpdG9yLCBjb250ZXh0KTtcbiAgfVxuXG4gIG92ZXJyaWRlIGlzRXF1aXZhbGVudCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBvdmVycmlkZSBpc0NvbnN0YW50KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIG92ZXJyaWRlIHRyYW5zZm9ybUludGVybmFsRXhwcmVzc2lvbnMoXG4gICAgdHJhbnNmb3JtOiBFeHByZXNzaW9uVHJhbnNmb3JtLFxuICAgIGZsYWdzOiBWaXNpdG9yQ29udGV4dEZsYWcsXG4gICk6IHZvaWQge1xuICAgIHRoaXMucmVjZWl2ZXIgPSB0cmFuc2Zvcm1FeHByZXNzaW9uc0luRXhwcmVzc2lvbih0aGlzLnJlY2VpdmVyLCB0cmFuc2Zvcm0sIGZsYWdzKTtcbiAgICB0aGlzLmluZGV4ID0gdHJhbnNmb3JtRXhwcmVzc2lvbnNJbkV4cHJlc3Npb24odGhpcy5pbmRleCwgdHJhbnNmb3JtLCBmbGFncyk7XG4gIH1cblxuICBvdmVycmlkZSBjbG9uZSgpOiBTYWZlS2V5ZWRSZWFkRXhwciB7XG4gICAgcmV0dXJuIG5ldyBTYWZlS2V5ZWRSZWFkRXhwcih0aGlzLnJlY2VpdmVyLmNsb25lKCksIHRoaXMuaW5kZXguY2xvbmUoKSwgdGhpcy5zb3VyY2VTcGFuKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2FmZUludm9rZUZ1bmN0aW9uRXhwciBleHRlbmRzIEV4cHJlc3Npb25CYXNlIHtcbiAgb3ZlcnJpZGUgcmVhZG9ubHkga2luZCA9IEV4cHJlc3Npb25LaW5kLlNhZmVJbnZva2VGdW5jdGlvbjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgcmVjZWl2ZXI6IG8uRXhwcmVzc2lvbixcbiAgICBwdWJsaWMgYXJnczogby5FeHByZXNzaW9uW10sXG4gICkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBvdmVycmlkZSB2aXNpdEV4cHJlc3Npb24odmlzaXRvcjogby5FeHByZXNzaW9uVmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICB0aGlzLnJlY2VpdmVyLnZpc2l0RXhwcmVzc2lvbih2aXNpdG9yLCBjb250ZXh0KTtcbiAgICBmb3IgKGNvbnN0IGEgb2YgdGhpcy5hcmdzKSB7XG4gICAgICBhLnZpc2l0RXhwcmVzc2lvbih2aXNpdG9yLCBjb250ZXh0KTtcbiAgICB9XG4gIH1cblxuICBvdmVycmlkZSBpc0VxdWl2YWxlbnQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgb3ZlcnJpZGUgaXNDb25zdGFudCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBvdmVycmlkZSB0cmFuc2Zvcm1JbnRlcm5hbEV4cHJlc3Npb25zKFxuICAgIHRyYW5zZm9ybTogRXhwcmVzc2lvblRyYW5zZm9ybSxcbiAgICBmbGFnczogVmlzaXRvckNvbnRleHRGbGFnLFxuICApOiB2b2lkIHtcbiAgICB0aGlzLnJlY2VpdmVyID0gdHJhbnNmb3JtRXhwcmVzc2lvbnNJbkV4cHJlc3Npb24odGhpcy5yZWNlaXZlciwgdHJhbnNmb3JtLCBmbGFncyk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoaXMuYXJnc1tpXSA9IHRyYW5zZm9ybUV4cHJlc3Npb25zSW5FeHByZXNzaW9uKHRoaXMuYXJnc1tpXSwgdHJhbnNmb3JtLCBmbGFncyk7XG4gICAgfVxuICB9XG5cbiAgb3ZlcnJpZGUgY2xvbmUoKTogU2FmZUludm9rZUZ1bmN0aW9uRXhwciB7XG4gICAgcmV0dXJuIG5ldyBTYWZlSW52b2tlRnVuY3Rpb25FeHByKFxuICAgICAgdGhpcy5yZWNlaXZlci5jbG9uZSgpLFxuICAgICAgdGhpcy5hcmdzLm1hcCgoYSkgPT4gYS5jbG9uZSgpKSxcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTYWZlVGVybmFyeUV4cHIgZXh0ZW5kcyBFeHByZXNzaW9uQmFzZSB7XG4gIG92ZXJyaWRlIHJlYWRvbmx5IGtpbmQgPSBFeHByZXNzaW9uS2luZC5TYWZlVGVybmFyeUV4cHI7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIGd1YXJkOiBvLkV4cHJlc3Npb24sXG4gICAgcHVibGljIGV4cHI6IG8uRXhwcmVzc2lvbixcbiAgKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIG92ZXJyaWRlIHZpc2l0RXhwcmVzc2lvbih2aXNpdG9yOiBvLkV4cHJlc3Npb25WaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHRoaXMuZ3VhcmQudmlzaXRFeHByZXNzaW9uKHZpc2l0b3IsIGNvbnRleHQpO1xuICAgIHRoaXMuZXhwci52aXNpdEV4cHJlc3Npb24odmlzaXRvciwgY29udGV4dCk7XG4gIH1cblxuICBvdmVycmlkZSBpc0VxdWl2YWxlbnQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgb3ZlcnJpZGUgaXNDb25zdGFudCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBvdmVycmlkZSB0cmFuc2Zvcm1JbnRlcm5hbEV4cHJlc3Npb25zKFxuICAgIHRyYW5zZm9ybTogRXhwcmVzc2lvblRyYW5zZm9ybSxcbiAgICBmbGFnczogVmlzaXRvckNvbnRleHRGbGFnLFxuICApOiB2b2lkIHtcbiAgICB0aGlzLmd1YXJkID0gdHJhbnNmb3JtRXhwcmVzc2lvbnNJbkV4cHJlc3Npb24odGhpcy5ndWFyZCwgdHJhbnNmb3JtLCBmbGFncyk7XG4gICAgdGhpcy5leHByID0gdHJhbnNmb3JtRXhwcmVzc2lvbnNJbkV4cHJlc3Npb24odGhpcy5leHByLCB0cmFuc2Zvcm0sIGZsYWdzKTtcbiAgfVxuXG4gIG92ZXJyaWRlIGNsb25lKCk6IFNhZmVUZXJuYXJ5RXhwciB7XG4gICAgcmV0dXJuIG5ldyBTYWZlVGVybmFyeUV4cHIodGhpcy5ndWFyZC5jbG9uZSgpLCB0aGlzLmV4cHIuY2xvbmUoKSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEVtcHR5RXhwciBleHRlbmRzIEV4cHJlc3Npb25CYXNlIHtcbiAgb3ZlcnJpZGUgcmVhZG9ubHkga2luZCA9IEV4cHJlc3Npb25LaW5kLkVtcHR5RXhwcjtcblxuICBvdmVycmlkZSB2aXNpdEV4cHJlc3Npb24odmlzaXRvcjogby5FeHByZXNzaW9uVmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHt9XG5cbiAgb3ZlcnJpZGUgaXNFcXVpdmFsZW50KGU6IEV4cHJlc3Npb24pOiBib29sZWFuIHtcbiAgICByZXR1cm4gZSBpbnN0YW5jZW9mIEVtcHR5RXhwcjtcbiAgfVxuXG4gIG92ZXJyaWRlIGlzQ29uc3RhbnQoKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBvdmVycmlkZSBjbG9uZSgpOiBFbXB0eUV4cHIge1xuICAgIHJldHVybiBuZXcgRW1wdHlFeHByKCk7XG4gIH1cblxuICBvdmVycmlkZSB0cmFuc2Zvcm1JbnRlcm5hbEV4cHJlc3Npb25zKCk6IHZvaWQge31cbn1cblxuZXhwb3J0IGNsYXNzIEFzc2lnblRlbXBvcmFyeUV4cHIgZXh0ZW5kcyBFeHByZXNzaW9uQmFzZSB7XG4gIG92ZXJyaWRlIHJlYWRvbmx5IGtpbmQgPSBFeHByZXNzaW9uS2luZC5Bc3NpZ25UZW1wb3JhcnlFeHByO1xuXG4gIHB1YmxpYyBuYW1lOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgZXhwcjogby5FeHByZXNzaW9uLFxuICAgIHB1YmxpYyB4cmVmOiBYcmVmSWQsXG4gICkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBvdmVycmlkZSB2aXNpdEV4cHJlc3Npb24odmlzaXRvcjogby5FeHByZXNzaW9uVmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICB0aGlzLmV4cHIudmlzaXRFeHByZXNzaW9uKHZpc2l0b3IsIGNvbnRleHQpO1xuICB9XG5cbiAgb3ZlcnJpZGUgaXNFcXVpdmFsZW50KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIG92ZXJyaWRlIGlzQ29uc3RhbnQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgb3ZlcnJpZGUgdHJhbnNmb3JtSW50ZXJuYWxFeHByZXNzaW9ucyhcbiAgICB0cmFuc2Zvcm06IEV4cHJlc3Npb25UcmFuc2Zvcm0sXG4gICAgZmxhZ3M6IFZpc2l0b3JDb250ZXh0RmxhZyxcbiAgKTogdm9pZCB7XG4gICAgdGhpcy5leHByID0gdHJhbnNmb3JtRXhwcmVzc2lvbnNJbkV4cHJlc3Npb24odGhpcy5leHByLCB0cmFuc2Zvcm0sIGZsYWdzKTtcbiAgfVxuXG4gIG92ZXJyaWRlIGNsb25lKCk6IEFzc2lnblRlbXBvcmFyeUV4cHIge1xuICAgIGNvbnN0IGEgPSBuZXcgQXNzaWduVGVtcG9yYXJ5RXhwcih0aGlzLmV4cHIuY2xvbmUoKSwgdGhpcy54cmVmKTtcbiAgICBhLm5hbWUgPSB0aGlzLm5hbWU7XG4gICAgcmV0dXJuIGE7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJlYWRUZW1wb3JhcnlFeHByIGV4dGVuZHMgRXhwcmVzc2lvbkJhc2Uge1xuICBvdmVycmlkZSByZWFkb25seSBraW5kID0gRXhwcmVzc2lvbktpbmQuUmVhZFRlbXBvcmFyeUV4cHI7XG5cbiAgcHVibGljIG5hbWU6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB4cmVmOiBYcmVmSWQpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgb3ZlcnJpZGUgdmlzaXRFeHByZXNzaW9uKHZpc2l0b3I6IG8uRXhwcmVzc2lvblZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7fVxuXG4gIG92ZXJyaWRlIGlzRXF1aXZhbGVudCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy54cmVmID09PSB0aGlzLnhyZWY7XG4gIH1cblxuICBvdmVycmlkZSBpc0NvbnN0YW50KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIG92ZXJyaWRlIHRyYW5zZm9ybUludGVybmFsRXhwcmVzc2lvbnMoXG4gICAgdHJhbnNmb3JtOiBFeHByZXNzaW9uVHJhbnNmb3JtLFxuICAgIGZsYWdzOiBWaXNpdG9yQ29udGV4dEZsYWcsXG4gICk6IHZvaWQge31cblxuICBvdmVycmlkZSBjbG9uZSgpOiBSZWFkVGVtcG9yYXJ5RXhwciB7XG4gICAgY29uc3QgciA9IG5ldyBSZWFkVGVtcG9yYXJ5RXhwcih0aGlzLnhyZWYpO1xuICAgIHIubmFtZSA9IHRoaXMubmFtZTtcbiAgICByZXR1cm4gcjtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2xvdExpdGVyYWxFeHByIGV4dGVuZHMgRXhwcmVzc2lvbkJhc2Uge1xuICBvdmVycmlkZSByZWFkb25seSBraW5kID0gRXhwcmVzc2lvbktpbmQuU2xvdExpdGVyYWxFeHByO1xuXG4gIGNvbnN0cnVjdG9yKHJlYWRvbmx5IHNsb3Q6IFNsb3RIYW5kbGUpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgb3ZlcnJpZGUgdmlzaXRFeHByZXNzaW9uKHZpc2l0b3I6IG8uRXhwcmVzc2lvblZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7fVxuXG4gIG92ZXJyaWRlIGlzRXF1aXZhbGVudChlOiBFeHByZXNzaW9uKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGUgaW5zdGFuY2VvZiBTbG90TGl0ZXJhbEV4cHIgJiYgZS5zbG90ID09PSB0aGlzLnNsb3Q7XG4gIH1cblxuICBvdmVycmlkZSBpc0NvbnN0YW50KCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgb3ZlcnJpZGUgY2xvbmUoKTogU2xvdExpdGVyYWxFeHByIHtcbiAgICByZXR1cm4gbmV3IFNsb3RMaXRlcmFsRXhwcih0aGlzLnNsb3QpO1xuICB9XG5cbiAgb3ZlcnJpZGUgdHJhbnNmb3JtSW50ZXJuYWxFeHByZXNzaW9ucygpOiB2b2lkIHt9XG59XG5cbmV4cG9ydCBjbGFzcyBDb25kaXRpb25hbENhc2VFeHByIGV4dGVuZHMgRXhwcmVzc2lvbkJhc2Uge1xuICBvdmVycmlkZSByZWFkb25seSBraW5kID0gRXhwcmVzc2lvbktpbmQuQ29uZGl0aW9uYWxDYXNlO1xuXG4gIC8qKlxuICAgKiBDcmVhdGUgYW4gZXhwcmVzc2lvbiBmb3Igb25lIGJyYW5jaCBvZiBhIGNvbmRpdGlvbmFsLlxuICAgKiBAcGFyYW0gZXhwciBUaGUgZXhwcmVzc2lvbiB0byBiZSB0ZXN0ZWQgZm9yIHRoaXMgY2FzZS4gTWlnaHQgYmUgbnVsbCwgYXMgaW4gYW4gYGVsc2VgIGNhc2UuXG4gICAqIEBwYXJhbSB0YXJnZXQgVGhlIFhyZWYgb2YgdGhlIHZpZXcgdG8gYmUgZGlzcGxheWVkIGlmIHRoaXMgY29uZGl0aW9uIGlzIHRydWUuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgZXhwcjogby5FeHByZXNzaW9uIHwgbnVsbCxcbiAgICByZWFkb25seSB0YXJnZXQ6IFhyZWZJZCxcbiAgICByZWFkb25seSB0YXJnZXRTbG90OiBTbG90SGFuZGxlLFxuICAgIHJlYWRvbmx5IGFsaWFzOiB0LlZhcmlhYmxlIHwgbnVsbCA9IG51bGwsXG4gICkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBvdmVycmlkZSB2aXNpdEV4cHJlc3Npb24odmlzaXRvcjogby5FeHByZXNzaW9uVmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICBpZiAodGhpcy5leHByICE9PSBudWxsKSB7XG4gICAgICB0aGlzLmV4cHIudmlzaXRFeHByZXNzaW9uKHZpc2l0b3IsIGNvbnRleHQpO1xuICAgIH1cbiAgfVxuXG4gIG92ZXJyaWRlIGlzRXF1aXZhbGVudChlOiBFeHByZXNzaW9uKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGUgaW5zdGFuY2VvZiBDb25kaXRpb25hbENhc2VFeHByICYmIGUuZXhwciA9PT0gdGhpcy5leHByO1xuICB9XG5cbiAgb3ZlcnJpZGUgaXNDb25zdGFudCgpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIG92ZXJyaWRlIGNsb25lKCk6IENvbmRpdGlvbmFsQ2FzZUV4cHIge1xuICAgIHJldHVybiBuZXcgQ29uZGl0aW9uYWxDYXNlRXhwcih0aGlzLmV4cHIsIHRoaXMudGFyZ2V0LCB0aGlzLnRhcmdldFNsb3QpO1xuICB9XG5cbiAgb3ZlcnJpZGUgdHJhbnNmb3JtSW50ZXJuYWxFeHByZXNzaW9ucyhcbiAgICB0cmFuc2Zvcm06IEV4cHJlc3Npb25UcmFuc2Zvcm0sXG4gICAgZmxhZ3M6IFZpc2l0b3JDb250ZXh0RmxhZyxcbiAgKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuZXhwciAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5leHByID0gdHJhbnNmb3JtRXhwcmVzc2lvbnNJbkV4cHJlc3Npb24odGhpcy5leHByLCB0cmFuc2Zvcm0sIGZsYWdzKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIENvbnN0Q29sbGVjdGVkRXhwciBleHRlbmRzIEV4cHJlc3Npb25CYXNlIHtcbiAgb3ZlcnJpZGUgcmVhZG9ubHkga2luZCA9IEV4cHJlc3Npb25LaW5kLkNvbnN0Q29sbGVjdGVkO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBleHByOiBvLkV4cHJlc3Npb24pIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgb3ZlcnJpZGUgdHJhbnNmb3JtSW50ZXJuYWxFeHByZXNzaW9ucyhcbiAgICB0cmFuc2Zvcm06IEV4cHJlc3Npb25UcmFuc2Zvcm0sXG4gICAgZmxhZ3M6IFZpc2l0b3JDb250ZXh0RmxhZyxcbiAgKTogdm9pZCB7XG4gICAgdGhpcy5leHByID0gdHJhbnNmb3JtKHRoaXMuZXhwciwgZmxhZ3MpO1xuICB9XG5cbiAgb3ZlcnJpZGUgdmlzaXRFeHByZXNzaW9uKHZpc2l0b3I6IG8uRXhwcmVzc2lvblZpc2l0b3IsIGNvbnRleHQ6IGFueSkge1xuICAgIHRoaXMuZXhwci52aXNpdEV4cHJlc3Npb24odmlzaXRvciwgY29udGV4dCk7XG4gIH1cblxuICBvdmVycmlkZSBpc0VxdWl2YWxlbnQoZTogby5FeHByZXNzaW9uKTogYm9vbGVhbiB7XG4gICAgaWYgKCEoZSBpbnN0YW5jZW9mIENvbnN0Q29sbGVjdGVkRXhwcikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZXhwci5pc0VxdWl2YWxlbnQoZS5leHByKTtcbiAgfVxuXG4gIG92ZXJyaWRlIGlzQ29uc3RhbnQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZXhwci5pc0NvbnN0YW50KCk7XG4gIH1cblxuICBvdmVycmlkZSBjbG9uZSgpOiBDb25zdENvbGxlY3RlZEV4cHIge1xuICAgIHJldHVybiBuZXcgQ29uc3RDb2xsZWN0ZWRFeHByKHRoaXMuZXhwcik7XG4gIH1cbn1cblxuLyoqXG4gKiBWaXNpdHMgYWxsIGBFeHByZXNzaW9uYHMgaW4gdGhlIEFTVCBvZiBgb3BgIHdpdGggdGhlIGB2aXNpdG9yYCBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZpc2l0RXhwcmVzc2lvbnNJbk9wKFxuICBvcDogQ3JlYXRlT3AgfCBVcGRhdGVPcCxcbiAgdmlzaXRvcjogKGV4cHI6IG8uRXhwcmVzc2lvbiwgZmxhZ3M6IFZpc2l0b3JDb250ZXh0RmxhZykgPT4gdm9pZCxcbik6IHZvaWQge1xuICB0cmFuc2Zvcm1FeHByZXNzaW9uc0luT3AoXG4gICAgb3AsXG4gICAgKGV4cHIsIGZsYWdzKSA9PiB7XG4gICAgICB2aXNpdG9yKGV4cHIsIGZsYWdzKTtcbiAgICAgIHJldHVybiBleHByO1xuICAgIH0sXG4gICAgVmlzaXRvckNvbnRleHRGbGFnLk5vbmUsXG4gICk7XG59XG5cbmV4cG9ydCBlbnVtIFZpc2l0b3JDb250ZXh0RmxhZyB7XG4gIE5vbmUgPSAwYjAwMDAsXG4gIEluQ2hpbGRPcGVyYXRpb24gPSAwYjAwMDEsXG59XG5cbmZ1bmN0aW9uIHRyYW5zZm9ybUV4cHJlc3Npb25zSW5JbnRlcnBvbGF0aW9uKFxuICBpbnRlcnBvbGF0aW9uOiBJbnRlcnBvbGF0aW9uLFxuICB0cmFuc2Zvcm06IEV4cHJlc3Npb25UcmFuc2Zvcm0sXG4gIGZsYWdzOiBWaXNpdG9yQ29udGV4dEZsYWcsXG4pIHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnRlcnBvbGF0aW9uLmV4cHJlc3Npb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgaW50ZXJwb2xhdGlvbi5leHByZXNzaW9uc1tpXSA9IHRyYW5zZm9ybUV4cHJlc3Npb25zSW5FeHByZXNzaW9uKFxuICAgICAgaW50ZXJwb2xhdGlvbi5leHByZXNzaW9uc1tpXSxcbiAgICAgIHRyYW5zZm9ybSxcbiAgICAgIGZsYWdzLFxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm0gYWxsIGBFeHByZXNzaW9uYHMgaW4gdGhlIEFTVCBvZiBgb3BgIHdpdGggdGhlIGB0cmFuc2Zvcm1gIGZ1bmN0aW9uLlxuICpcbiAqIEFsbCBzdWNoIG9wZXJhdGlvbnMgd2lsbCBiZSByZXBsYWNlZCB3aXRoIHRoZSByZXN1bHQgb2YgYXBwbHlpbmcgYHRyYW5zZm9ybWAsIHdoaWNoIG1heSBiZSBhblxuICogaWRlbnRpdHkgdHJhbnNmb3JtYXRpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1FeHByZXNzaW9uc0luT3AoXG4gIG9wOiBDcmVhdGVPcCB8IFVwZGF0ZU9wLFxuICB0cmFuc2Zvcm06IEV4cHJlc3Npb25UcmFuc2Zvcm0sXG4gIGZsYWdzOiBWaXNpdG9yQ29udGV4dEZsYWcsXG4pOiB2b2lkIHtcbiAgc3dpdGNoIChvcC5raW5kKSB7XG4gICAgY2FzZSBPcEtpbmQuU3R5bGVQcm9wOlxuICAgIGNhc2UgT3BLaW5kLlN0eWxlTWFwOlxuICAgIGNhc2UgT3BLaW5kLkNsYXNzUHJvcDpcbiAgICBjYXNlIE9wS2luZC5DbGFzc01hcDpcbiAgICBjYXNlIE9wS2luZC5CaW5kaW5nOlxuICAgICAgaWYgKG9wLmV4cHJlc3Npb24gaW5zdGFuY2VvZiBJbnRlcnBvbGF0aW9uKSB7XG4gICAgICAgIHRyYW5zZm9ybUV4cHJlc3Npb25zSW5JbnRlcnBvbGF0aW9uKG9wLmV4cHJlc3Npb24sIHRyYW5zZm9ybSwgZmxhZ3MpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3AuZXhwcmVzc2lvbiA9IHRyYW5zZm9ybUV4cHJlc3Npb25zSW5FeHByZXNzaW9uKG9wLmV4cHJlc3Npb24sIHRyYW5zZm9ybSwgZmxhZ3MpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSBPcEtpbmQuUHJvcGVydHk6XG4gICAgY2FzZSBPcEtpbmQuSG9zdFByb3BlcnR5OlxuICAgIGNhc2UgT3BLaW5kLkF0dHJpYnV0ZTpcbiAgICAgIGlmIChvcC5leHByZXNzaW9uIGluc3RhbmNlb2YgSW50ZXJwb2xhdGlvbikge1xuICAgICAgICB0cmFuc2Zvcm1FeHByZXNzaW9uc0luSW50ZXJwb2xhdGlvbihvcC5leHByZXNzaW9uLCB0cmFuc2Zvcm0sIGZsYWdzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9wLmV4cHJlc3Npb24gPSB0cmFuc2Zvcm1FeHByZXNzaW9uc0luRXhwcmVzc2lvbihvcC5leHByZXNzaW9uLCB0cmFuc2Zvcm0sIGZsYWdzKTtcbiAgICAgIH1cbiAgICAgIG9wLnNhbml0aXplciA9XG4gICAgICAgIG9wLnNhbml0aXplciAmJiB0cmFuc2Zvcm1FeHByZXNzaW9uc0luRXhwcmVzc2lvbihvcC5zYW5pdGl6ZXIsIHRyYW5zZm9ybSwgZmxhZ3MpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBPcEtpbmQuVHdvV2F5UHJvcGVydHk6XG4gICAgICBvcC5leHByZXNzaW9uID0gdHJhbnNmb3JtRXhwcmVzc2lvbnNJbkV4cHJlc3Npb24ob3AuZXhwcmVzc2lvbiwgdHJhbnNmb3JtLCBmbGFncyk7XG4gICAgICBvcC5zYW5pdGl6ZXIgPVxuICAgICAgICBvcC5zYW5pdGl6ZXIgJiYgdHJhbnNmb3JtRXhwcmVzc2lvbnNJbkV4cHJlc3Npb24ob3Auc2FuaXRpemVyLCB0cmFuc2Zvcm0sIGZsYWdzKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgT3BLaW5kLkkxOG5FeHByZXNzaW9uOlxuICAgICAgb3AuZXhwcmVzc2lvbiA9IHRyYW5zZm9ybUV4cHJlc3Npb25zSW5FeHByZXNzaW9uKG9wLmV4cHJlc3Npb24sIHRyYW5zZm9ybSwgZmxhZ3MpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBPcEtpbmQuSW50ZXJwb2xhdGVUZXh0OlxuICAgICAgdHJhbnNmb3JtRXhwcmVzc2lvbnNJbkludGVycG9sYXRpb24ob3AuaW50ZXJwb2xhdGlvbiwgdHJhbnNmb3JtLCBmbGFncyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIE9wS2luZC5TdGF0ZW1lbnQ6XG4gICAgICB0cmFuc2Zvcm1FeHByZXNzaW9uc0luU3RhdGVtZW50KG9wLnN0YXRlbWVudCwgdHJhbnNmb3JtLCBmbGFncyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIE9wS2luZC5WYXJpYWJsZTpcbiAgICAgIG9wLmluaXRpYWxpemVyID0gdHJhbnNmb3JtRXhwcmVzc2lvbnNJbkV4cHJlc3Npb24ob3AuaW5pdGlhbGl6ZXIsIHRyYW5zZm9ybSwgZmxhZ3MpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBPcEtpbmQuQ29uZGl0aW9uYWw6XG4gICAgICBmb3IgKGNvbnN0IGNvbmRpdGlvbiBvZiBvcC5jb25kaXRpb25zKSB7XG4gICAgICAgIGlmIChjb25kaXRpb24uZXhwciA9PT0gbnVsbCkge1xuICAgICAgICAgIC8vIFRoaXMgaXMgYSBkZWZhdWx0IGNhc2UuXG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uZGl0aW9uLmV4cHIgPSB0cmFuc2Zvcm1FeHByZXNzaW9uc0luRXhwcmVzc2lvbihjb25kaXRpb24uZXhwciwgdHJhbnNmb3JtLCBmbGFncyk7XG4gICAgICB9XG4gICAgICBpZiAob3AucHJvY2Vzc2VkICE9PSBudWxsKSB7XG4gICAgICAgIG9wLnByb2Nlc3NlZCA9IHRyYW5zZm9ybUV4cHJlc3Npb25zSW5FeHByZXNzaW9uKG9wLnByb2Nlc3NlZCwgdHJhbnNmb3JtLCBmbGFncyk7XG4gICAgICB9XG4gICAgICBpZiAob3AuY29udGV4dFZhbHVlICE9PSBudWxsKSB7XG4gICAgICAgIG9wLmNvbnRleHRWYWx1ZSA9IHRyYW5zZm9ybUV4cHJlc3Npb25zSW5FeHByZXNzaW9uKG9wLmNvbnRleHRWYWx1ZSwgdHJhbnNmb3JtLCBmbGFncyk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlIE9wS2luZC5MaXN0ZW5lcjpcbiAgICBjYXNlIE9wS2luZC5Ud29XYXlMaXN0ZW5lcjpcbiAgICAgIGZvciAoY29uc3QgaW5uZXJPcCBvZiBvcC5oYW5kbGVyT3BzKSB7XG4gICAgICAgIHRyYW5zZm9ybUV4cHJlc3Npb25zSW5PcChpbm5lck9wLCB0cmFuc2Zvcm0sIGZsYWdzIHwgVmlzaXRvckNvbnRleHRGbGFnLkluQ2hpbGRPcGVyYXRpb24pO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSBPcEtpbmQuRXh0cmFjdGVkQXR0cmlidXRlOlxuICAgICAgb3AuZXhwcmVzc2lvbiA9XG4gICAgICAgIG9wLmV4cHJlc3Npb24gJiYgdHJhbnNmb3JtRXhwcmVzc2lvbnNJbkV4cHJlc3Npb24ob3AuZXhwcmVzc2lvbiwgdHJhbnNmb3JtLCBmbGFncyk7XG4gICAgICBvcC50cnVzdGVkVmFsdWVGbiA9XG4gICAgICAgIG9wLnRydXN0ZWRWYWx1ZUZuICYmIHRyYW5zZm9ybUV4cHJlc3Npb25zSW5FeHByZXNzaW9uKG9wLnRydXN0ZWRWYWx1ZUZuLCB0cmFuc2Zvcm0sIGZsYWdzKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgT3BLaW5kLlJlcGVhdGVyQ3JlYXRlOlxuICAgICAgb3AudHJhY2sgPSB0cmFuc2Zvcm1FeHByZXNzaW9uc0luRXhwcmVzc2lvbihvcC50cmFjaywgdHJhbnNmb3JtLCBmbGFncyk7XG4gICAgICBpZiAob3AudHJhY2tCeUZuICE9PSBudWxsKSB7XG4gICAgICAgIG9wLnRyYWNrQnlGbiA9IHRyYW5zZm9ybUV4cHJlc3Npb25zSW5FeHByZXNzaW9uKG9wLnRyYWNrQnlGbiwgdHJhbnNmb3JtLCBmbGFncyk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlIE9wS2luZC5SZXBlYXRlcjpcbiAgICAgIG9wLmNvbGxlY3Rpb24gPSB0cmFuc2Zvcm1FeHByZXNzaW9uc0luRXhwcmVzc2lvbihvcC5jb2xsZWN0aW9uLCB0cmFuc2Zvcm0sIGZsYWdzKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgT3BLaW5kLkRlZmVyOlxuICAgICAgaWYgKG9wLmxvYWRpbmdDb25maWcgIT09IG51bGwpIHtcbiAgICAgICAgb3AubG9hZGluZ0NvbmZpZyA9IHRyYW5zZm9ybUV4cHJlc3Npb25zSW5FeHByZXNzaW9uKG9wLmxvYWRpbmdDb25maWcsIHRyYW5zZm9ybSwgZmxhZ3MpO1xuICAgICAgfVxuICAgICAgaWYgKG9wLnBsYWNlaG9sZGVyQ29uZmlnICE9PSBudWxsKSB7XG4gICAgICAgIG9wLnBsYWNlaG9sZGVyQ29uZmlnID0gdHJhbnNmb3JtRXhwcmVzc2lvbnNJbkV4cHJlc3Npb24oXG4gICAgICAgICAgb3AucGxhY2Vob2xkZXJDb25maWcsXG4gICAgICAgICAgdHJhbnNmb3JtLFxuICAgICAgICAgIGZsYWdzLFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgaWYgKG9wLnJlc29sdmVyRm4gIT09IG51bGwpIHtcbiAgICAgICAgb3AucmVzb2x2ZXJGbiA9IHRyYW5zZm9ybUV4cHJlc3Npb25zSW5FeHByZXNzaW9uKG9wLnJlc29sdmVyRm4sIHRyYW5zZm9ybSwgZmxhZ3MpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSBPcEtpbmQuSTE4bk1lc3NhZ2U6XG4gICAgICBmb3IgKGNvbnN0IFtwbGFjZWhvbGRlciwgZXhwcl0gb2Ygb3AucGFyYW1zKSB7XG4gICAgICAgIG9wLnBhcmFtcy5zZXQocGxhY2Vob2xkZXIsIHRyYW5zZm9ybUV4cHJlc3Npb25zSW5FeHByZXNzaW9uKGV4cHIsIHRyYW5zZm9ybSwgZmxhZ3MpKTtcbiAgICAgIH1cbiAgICAgIGZvciAoY29uc3QgW3BsYWNlaG9sZGVyLCBleHByXSBvZiBvcC5wb3N0cHJvY2Vzc2luZ1BhcmFtcykge1xuICAgICAgICBvcC5wb3N0cHJvY2Vzc2luZ1BhcmFtcy5zZXQoXG4gICAgICAgICAgcGxhY2Vob2xkZXIsXG4gICAgICAgICAgdHJhbnNmb3JtRXhwcmVzc2lvbnNJbkV4cHJlc3Npb24oZXhwciwgdHJhbnNmb3JtLCBmbGFncyksXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlIE9wS2luZC5EZWZlcldoZW46XG4gICAgICBvcC5leHByID0gdHJhbnNmb3JtRXhwcmVzc2lvbnNJbkV4cHJlc3Npb24ob3AuZXhwciwgdHJhbnNmb3JtLCBmbGFncyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIE9wS2luZC5TdG9yZUxldDpcbiAgICAgIG9wLnZhbHVlID0gdHJhbnNmb3JtRXhwcmVzc2lvbnNJbkV4cHJlc3Npb24ob3AudmFsdWUsIHRyYW5zZm9ybSwgZmxhZ3MpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBPcEtpbmQuQWR2YW5jZTpcbiAgICBjYXNlIE9wS2luZC5Db250YWluZXI6XG4gICAgY2FzZSBPcEtpbmQuQ29udGFpbmVyRW5kOlxuICAgIGNhc2UgT3BLaW5kLkNvbnRhaW5lclN0YXJ0OlxuICAgIGNhc2UgT3BLaW5kLkRlZmVyT246XG4gICAgY2FzZSBPcEtpbmQuRGlzYWJsZUJpbmRpbmdzOlxuICAgIGNhc2UgT3BLaW5kLkVsZW1lbnQ6XG4gICAgY2FzZSBPcEtpbmQuRWxlbWVudEVuZDpcbiAgICBjYXNlIE9wS2luZC5FbGVtZW50U3RhcnQ6XG4gICAgY2FzZSBPcEtpbmQuRW5hYmxlQmluZGluZ3M6XG4gICAgY2FzZSBPcEtpbmQuSTE4bjpcbiAgICBjYXNlIE9wS2luZC5JMThuQXBwbHk6XG4gICAgY2FzZSBPcEtpbmQuSTE4bkNvbnRleHQ6XG4gICAgY2FzZSBPcEtpbmQuSTE4bkVuZDpcbiAgICBjYXNlIE9wS2luZC5JMThuU3RhcnQ6XG4gICAgY2FzZSBPcEtpbmQuSWN1RW5kOlxuICAgIGNhc2UgT3BLaW5kLkljdVN0YXJ0OlxuICAgIGNhc2UgT3BLaW5kLk5hbWVzcGFjZTpcbiAgICBjYXNlIE9wS2luZC5QaXBlOlxuICAgIGNhc2UgT3BLaW5kLlByb2plY3Rpb246XG4gICAgY2FzZSBPcEtpbmQuUHJvamVjdGlvbkRlZjpcbiAgICBjYXNlIE9wS2luZC5UZW1wbGF0ZTpcbiAgICBjYXNlIE9wS2luZC5UZXh0OlxuICAgIGNhc2UgT3BLaW5kLkkxOG5BdHRyaWJ1dGVzOlxuICAgIGNhc2UgT3BLaW5kLkljdVBsYWNlaG9sZGVyOlxuICAgIGNhc2UgT3BLaW5kLkRlY2xhcmVMZXQ6XG4gICAgICAvLyBUaGVzZSBvcGVyYXRpb25zIGNvbnRhaW4gbm8gZXhwcmVzc2lvbnMuXG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBBc3NlcnRpb25FcnJvcjogdHJhbnNmb3JtRXhwcmVzc2lvbnNJbk9wIGRvZXNuJ3QgaGFuZGxlICR7T3BLaW5kW29wLmtpbmRdfWApO1xuICB9XG59XG5cbi8qKlxuICogVHJhbnNmb3JtIGFsbCBgRXhwcmVzc2lvbmBzIGluIHRoZSBBU1Qgb2YgYGV4cHJgIHdpdGggdGhlIGB0cmFuc2Zvcm1gIGZ1bmN0aW9uLlxuICpcbiAqIEFsbCBzdWNoIG9wZXJhdGlvbnMgd2lsbCBiZSByZXBsYWNlZCB3aXRoIHRoZSByZXN1bHQgb2YgYXBwbHlpbmcgYHRyYW5zZm9ybWAsIHdoaWNoIG1heSBiZSBhblxuICogaWRlbnRpdHkgdHJhbnNmb3JtYXRpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1FeHByZXNzaW9uc0luRXhwcmVzc2lvbihcbiAgZXhwcjogby5FeHByZXNzaW9uLFxuICB0cmFuc2Zvcm06IEV4cHJlc3Npb25UcmFuc2Zvcm0sXG4gIGZsYWdzOiBWaXNpdG9yQ29udGV4dEZsYWcsXG4pOiBvLkV4cHJlc3Npb24ge1xuICBpZiAoZXhwciBpbnN0YW5jZW9mIEV4cHJlc3Npb25CYXNlKSB7XG4gICAgZXhwci50cmFuc2Zvcm1JbnRlcm5hbEV4cHJlc3Npb25zKHRyYW5zZm9ybSwgZmxhZ3MpO1xuICB9IGVsc2UgaWYgKGV4cHIgaW5zdGFuY2VvZiBvLkJpbmFyeU9wZXJhdG9yRXhwcikge1xuICAgIGV4cHIubGhzID0gdHJhbnNmb3JtRXhwcmVzc2lvbnNJbkV4cHJlc3Npb24oZXhwci5saHMsIHRyYW5zZm9ybSwgZmxhZ3MpO1xuICAgIGV4cHIucmhzID0gdHJhbnNmb3JtRXhwcmVzc2lvbnNJbkV4cHJlc3Npb24oZXhwci5yaHMsIHRyYW5zZm9ybSwgZmxhZ3MpO1xuICB9IGVsc2UgaWYgKGV4cHIgaW5zdGFuY2VvZiBvLlVuYXJ5T3BlcmF0b3JFeHByKSB7XG4gICAgZXhwci5leHByID0gdHJhbnNmb3JtRXhwcmVzc2lvbnNJbkV4cHJlc3Npb24oZXhwci5leHByLCB0cmFuc2Zvcm0sIGZsYWdzKTtcbiAgfSBlbHNlIGlmIChleHByIGluc3RhbmNlb2Ygby5SZWFkUHJvcEV4cHIpIHtcbiAgICBleHByLnJlY2VpdmVyID0gdHJhbnNmb3JtRXhwcmVzc2lvbnNJbkV4cHJlc3Npb24oZXhwci5yZWNlaXZlciwgdHJhbnNmb3JtLCBmbGFncyk7XG4gIH0gZWxzZSBpZiAoZXhwciBpbnN0YW5jZW9mIG8uUmVhZEtleUV4cHIpIHtcbiAgICBleHByLnJlY2VpdmVyID0gdHJhbnNmb3JtRXhwcmVzc2lvbnNJbkV4cHJlc3Npb24oZXhwci5yZWNlaXZlciwgdHJhbnNmb3JtLCBmbGFncyk7XG4gICAgZXhwci5pbmRleCA9IHRyYW5zZm9ybUV4cHJlc3Npb25zSW5FeHByZXNzaW9uKGV4cHIuaW5kZXgsIHRyYW5zZm9ybSwgZmxhZ3MpO1xuICB9IGVsc2UgaWYgKGV4cHIgaW5zdGFuY2VvZiBvLldyaXRlUHJvcEV4cHIpIHtcbiAgICBleHByLnJlY2VpdmVyID0gdHJhbnNmb3JtRXhwcmVzc2lvbnNJbkV4cHJlc3Npb24oZXhwci5yZWNlaXZlciwgdHJhbnNmb3JtLCBmbGFncyk7XG4gICAgZXhwci52YWx1ZSA9IHRyYW5zZm9ybUV4cHJlc3Npb25zSW5FeHByZXNzaW9uKGV4cHIudmFsdWUsIHRyYW5zZm9ybSwgZmxhZ3MpO1xuICB9IGVsc2UgaWYgKGV4cHIgaW5zdGFuY2VvZiBvLldyaXRlS2V5RXhwcikge1xuICAgIGV4cHIucmVjZWl2ZXIgPSB0cmFuc2Zvcm1FeHByZXNzaW9uc0luRXhwcmVzc2lvbihleHByLnJlY2VpdmVyLCB0cmFuc2Zvcm0sIGZsYWdzKTtcbiAgICBleHByLmluZGV4ID0gdHJhbnNmb3JtRXhwcmVzc2lvbnNJbkV4cHJlc3Npb24oZXhwci5pbmRleCwgdHJhbnNmb3JtLCBmbGFncyk7XG4gICAgZXhwci52YWx1ZSA9IHRyYW5zZm9ybUV4cHJlc3Npb25zSW5FeHByZXNzaW9uKGV4cHIudmFsdWUsIHRyYW5zZm9ybSwgZmxhZ3MpO1xuICB9IGVsc2UgaWYgKGV4cHIgaW5zdGFuY2VvZiBvLkludm9rZUZ1bmN0aW9uRXhwcikge1xuICAgIGV4cHIuZm4gPSB0cmFuc2Zvcm1FeHByZXNzaW9uc0luRXhwcmVzc2lvbihleHByLmZuLCB0cmFuc2Zvcm0sIGZsYWdzKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGV4cHIuYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgZXhwci5hcmdzW2ldID0gdHJhbnNmb3JtRXhwcmVzc2lvbnNJbkV4cHJlc3Npb24oZXhwci5hcmdzW2ldLCB0cmFuc2Zvcm0sIGZsYWdzKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoZXhwciBpbnN0YW5jZW9mIG8uTGl0ZXJhbEFycmF5RXhwcikge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZXhwci5lbnRyaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBleHByLmVudHJpZXNbaV0gPSB0cmFuc2Zvcm1FeHByZXNzaW9uc0luRXhwcmVzc2lvbihleHByLmVudHJpZXNbaV0sIHRyYW5zZm9ybSwgZmxhZ3MpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChleHByIGluc3RhbmNlb2Ygby5MaXRlcmFsTWFwRXhwcikge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZXhwci5lbnRyaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBleHByLmVudHJpZXNbaV0udmFsdWUgPSB0cmFuc2Zvcm1FeHByZXNzaW9uc0luRXhwcmVzc2lvbihcbiAgICAgICAgZXhwci5lbnRyaWVzW2ldLnZhbHVlLFxuICAgICAgICB0cmFuc2Zvcm0sXG4gICAgICAgIGZsYWdzLFxuICAgICAgKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoZXhwciBpbnN0YW5jZW9mIG8uQ29uZGl0aW9uYWxFeHByKSB7XG4gICAgZXhwci5jb25kaXRpb24gPSB0cmFuc2Zvcm1FeHByZXNzaW9uc0luRXhwcmVzc2lvbihleHByLmNvbmRpdGlvbiwgdHJhbnNmb3JtLCBmbGFncyk7XG4gICAgZXhwci50cnVlQ2FzZSA9IHRyYW5zZm9ybUV4cHJlc3Npb25zSW5FeHByZXNzaW9uKGV4cHIudHJ1ZUNhc2UsIHRyYW5zZm9ybSwgZmxhZ3MpO1xuICAgIGlmIChleHByLmZhbHNlQ2FzZSAhPT0gbnVsbCkge1xuICAgICAgZXhwci5mYWxzZUNhc2UgPSB0cmFuc2Zvcm1FeHByZXNzaW9uc0luRXhwcmVzc2lvbihleHByLmZhbHNlQ2FzZSwgdHJhbnNmb3JtLCBmbGFncyk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGV4cHIgaW5zdGFuY2VvZiBvLlR5cGVvZkV4cHIpIHtcbiAgICBleHByLmV4cHIgPSB0cmFuc2Zvcm1FeHByZXNzaW9uc0luRXhwcmVzc2lvbihleHByLmV4cHIsIHRyYW5zZm9ybSwgZmxhZ3MpO1xuICB9IGVsc2UgaWYgKGV4cHIgaW5zdGFuY2VvZiBvLldyaXRlVmFyRXhwcikge1xuICAgIGV4cHIudmFsdWUgPSB0cmFuc2Zvcm1FeHByZXNzaW9uc0luRXhwcmVzc2lvbihleHByLnZhbHVlLCB0cmFuc2Zvcm0sIGZsYWdzKTtcbiAgfSBlbHNlIGlmIChleHByIGluc3RhbmNlb2Ygby5Mb2NhbGl6ZWRTdHJpbmcpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGV4cHIuZXhwcmVzc2lvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGV4cHIuZXhwcmVzc2lvbnNbaV0gPSB0cmFuc2Zvcm1FeHByZXNzaW9uc0luRXhwcmVzc2lvbihleHByLmV4cHJlc3Npb25zW2ldLCB0cmFuc2Zvcm0sIGZsYWdzKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoZXhwciBpbnN0YW5jZW9mIG8uTm90RXhwcikge1xuICAgIGV4cHIuY29uZGl0aW9uID0gdHJhbnNmb3JtRXhwcmVzc2lvbnNJbkV4cHJlc3Npb24oZXhwci5jb25kaXRpb24sIHRyYW5zZm9ybSwgZmxhZ3MpO1xuICB9IGVsc2UgaWYgKGV4cHIgaW5zdGFuY2VvZiBvLlRhZ2dlZFRlbXBsYXRlRXhwcikge1xuICAgIGV4cHIudGFnID0gdHJhbnNmb3JtRXhwcmVzc2lvbnNJbkV4cHJlc3Npb24oZXhwci50YWcsIHRyYW5zZm9ybSwgZmxhZ3MpO1xuICAgIGV4cHIudGVtcGxhdGUuZXhwcmVzc2lvbnMgPSBleHByLnRlbXBsYXRlLmV4cHJlc3Npb25zLm1hcCgoZSkgPT5cbiAgICAgIHRyYW5zZm9ybUV4cHJlc3Npb25zSW5FeHByZXNzaW9uKGUsIHRyYW5zZm9ybSwgZmxhZ3MpLFxuICAgICk7XG4gIH0gZWxzZSBpZiAoZXhwciBpbnN0YW5jZW9mIG8uQXJyb3dGdW5jdGlvbkV4cHIpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShleHByLmJvZHkpKSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGV4cHIuYm9keS5sZW5ndGg7IGkrKykge1xuICAgICAgICB0cmFuc2Zvcm1FeHByZXNzaW9uc0luU3RhdGVtZW50KGV4cHIuYm9keVtpXSwgdHJhbnNmb3JtLCBmbGFncyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGV4cHIuYm9keSA9IHRyYW5zZm9ybUV4cHJlc3Npb25zSW5FeHByZXNzaW9uKGV4cHIuYm9keSwgdHJhbnNmb3JtLCBmbGFncyk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGV4cHIgaW5zdGFuY2VvZiBvLldyYXBwZWROb2RlRXhwcikge1xuICAgIC8vIFRPRE86IERvIHdlIG5lZWQgdG8gdHJhbnNmb3JtIGFueSBUUyBub2RlcyBuZXN0ZWQgaW5zaWRlIG9mIHRoaXMgZXhwcmVzc2lvbj9cbiAgfSBlbHNlIGlmIChcbiAgICBleHByIGluc3RhbmNlb2Ygby5SZWFkVmFyRXhwciB8fFxuICAgIGV4cHIgaW5zdGFuY2VvZiBvLkV4dGVybmFsRXhwciB8fFxuICAgIGV4cHIgaW5zdGFuY2VvZiBvLkxpdGVyYWxFeHByXG4gICkge1xuICAgIC8vIE5vIGFjdGlvbiBmb3IgdGhlc2UgdHlwZXMuXG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBVbmhhbmRsZWQgZXhwcmVzc2lvbiBraW5kOiAke2V4cHIuY29uc3RydWN0b3IubmFtZX1gKTtcbiAgfVxuICByZXR1cm4gdHJhbnNmb3JtKGV4cHIsIGZsYWdzKTtcbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm0gYWxsIGBFeHByZXNzaW9uYHMgaW4gdGhlIEFTVCBvZiBgc3RtdGAgd2l0aCB0aGUgYHRyYW5zZm9ybWAgZnVuY3Rpb24uXG4gKlxuICogQWxsIHN1Y2ggb3BlcmF0aW9ucyB3aWxsIGJlIHJlcGxhY2VkIHdpdGggdGhlIHJlc3VsdCBvZiBhcHBseWluZyBgdHJhbnNmb3JtYCwgd2hpY2ggbWF5IGJlIGFuXG4gKiBpZGVudGl0eSB0cmFuc2Zvcm1hdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybUV4cHJlc3Npb25zSW5TdGF0ZW1lbnQoXG4gIHN0bXQ6IG8uU3RhdGVtZW50LFxuICB0cmFuc2Zvcm06IEV4cHJlc3Npb25UcmFuc2Zvcm0sXG4gIGZsYWdzOiBWaXNpdG9yQ29udGV4dEZsYWcsXG4pOiB2b2lkIHtcbiAgaWYgKHN0bXQgaW5zdGFuY2VvZiBvLkV4cHJlc3Npb25TdGF0ZW1lbnQpIHtcbiAgICBzdG10LmV4cHIgPSB0cmFuc2Zvcm1FeHByZXNzaW9uc0luRXhwcmVzc2lvbihzdG10LmV4cHIsIHRyYW5zZm9ybSwgZmxhZ3MpO1xuICB9IGVsc2UgaWYgKHN0bXQgaW5zdGFuY2VvZiBvLlJldHVyblN0YXRlbWVudCkge1xuICAgIHN0bXQudmFsdWUgPSB0cmFuc2Zvcm1FeHByZXNzaW9uc0luRXhwcmVzc2lvbihzdG10LnZhbHVlLCB0cmFuc2Zvcm0sIGZsYWdzKTtcbiAgfSBlbHNlIGlmIChzdG10IGluc3RhbmNlb2Ygby5EZWNsYXJlVmFyU3RtdCkge1xuICAgIGlmIChzdG10LnZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHN0bXQudmFsdWUgPSB0cmFuc2Zvcm1FeHByZXNzaW9uc0luRXhwcmVzc2lvbihzdG10LnZhbHVlLCB0cmFuc2Zvcm0sIGZsYWdzKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoc3RtdCBpbnN0YW5jZW9mIG8uSWZTdG10KSB7XG4gICAgc3RtdC5jb25kaXRpb24gPSB0cmFuc2Zvcm1FeHByZXNzaW9uc0luRXhwcmVzc2lvbihzdG10LmNvbmRpdGlvbiwgdHJhbnNmb3JtLCBmbGFncyk7XG4gICAgZm9yIChjb25zdCBjYXNlU3RhdGVtZW50IG9mIHN0bXQudHJ1ZUNhc2UpIHtcbiAgICAgIHRyYW5zZm9ybUV4cHJlc3Npb25zSW5TdGF0ZW1lbnQoY2FzZVN0YXRlbWVudCwgdHJhbnNmb3JtLCBmbGFncyk7XG4gICAgfVxuICAgIGZvciAoY29uc3QgY2FzZVN0YXRlbWVudCBvZiBzdG10LmZhbHNlQ2FzZSkge1xuICAgICAgdHJhbnNmb3JtRXhwcmVzc2lvbnNJblN0YXRlbWVudChjYXNlU3RhdGVtZW50LCB0cmFuc2Zvcm0sIGZsYWdzKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBVbmhhbmRsZWQgc3RhdGVtZW50IGtpbmQ6ICR7c3RtdC5jb25zdHJ1Y3Rvci5uYW1lfWApO1xuICB9XG59XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgdGhlIGdpdmVuIGV4cHJlc3Npb24gaXMgYSBzdHJpbmcgbGl0ZXJhbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzU3RyaW5nTGl0ZXJhbChleHByOiBvLkV4cHJlc3Npb24pOiBleHByIGlzIG8uTGl0ZXJhbEV4cHIgJiB7dmFsdWU6IHN0cmluZ30ge1xuICByZXR1cm4gZXhwciBpbnN0YW5jZW9mIG8uTGl0ZXJhbEV4cHIgJiYgdHlwZW9mIGV4cHIudmFsdWUgPT09ICdzdHJpbmcnO1xufVxuIl19