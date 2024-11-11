/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as o from '../../../../output/output_ast';
import { Identifiers } from '../../../../render3/r3_identifiers';
import * as ir from '../../ir';
import { ViewCompilationUnit } from '../compilation';
import * as ng from '../instruction';
/**
 * Map of target resolvers for event listeners.
 */
const GLOBAL_TARGET_RESOLVERS = new Map([
    ['window', Identifiers.resolveWindow],
    ['document', Identifiers.resolveDocument],
    ['body', Identifiers.resolveBody],
]);
/**
 * Compiles semantic operations across all views and generates output `o.Statement`s with actual
 * runtime calls in their place.
 *
 * Reification replaces semantic operations with selected Ivy instructions and other generated code
 * structures. After reification, the create/update operation lists of all views should only contain
 * `ir.StatementOp`s (which wrap generated `o.Statement`s).
 */
export function reify(job) {
    for (const unit of job.units) {
        reifyCreateOperations(unit, unit.create);
        reifyUpdateOperations(unit, unit.update);
    }
}
/**
 * This function can be used a sanity check -- it walks every expression in the const pool, and
 * every expression reachable from an op, and makes sure that there are no IR expressions
 * left. This is nice to use for debugging mysterious failures where an IR expression cannot be
 * output from the output AST code.
 */
function ensureNoIrForDebug(job) {
    for (const stmt of job.pool.statements) {
        ir.transformExpressionsInStatement(stmt, (expr) => {
            if (ir.isIrExpression(expr)) {
                throw new Error(`AssertionError: IR expression found during reify: ${ir.ExpressionKind[expr.kind]}`);
            }
            return expr;
        }, ir.VisitorContextFlag.None);
    }
    for (const unit of job.units) {
        for (const op of unit.ops()) {
            ir.visitExpressionsInOp(op, (expr) => {
                if (ir.isIrExpression(expr)) {
                    throw new Error(`AssertionError: IR expression found during reify: ${ir.ExpressionKind[expr.kind]}`);
                }
            });
        }
    }
}
function reifyCreateOperations(unit, ops) {
    for (const op of ops) {
        ir.transformExpressionsInOp(op, reifyIrExpression, ir.VisitorContextFlag.None);
        switch (op.kind) {
            case ir.OpKind.Text:
                ir.OpList.replace(op, ng.text(op.handle.slot, op.initialValue, op.sourceSpan));
                break;
            case ir.OpKind.ElementStart:
                ir.OpList.replace(op, ng.elementStart(op.handle.slot, op.tag, op.attributes, op.localRefs, op.startSourceSpan));
                break;
            case ir.OpKind.Element:
                ir.OpList.replace(op, ng.element(op.handle.slot, op.tag, op.attributes, op.localRefs, op.wholeSourceSpan));
                break;
            case ir.OpKind.ElementEnd:
                ir.OpList.replace(op, ng.elementEnd(op.sourceSpan));
                break;
            case ir.OpKind.ContainerStart:
                ir.OpList.replace(op, ng.elementContainerStart(op.handle.slot, op.attributes, op.localRefs, op.startSourceSpan));
                break;
            case ir.OpKind.Container:
                ir.OpList.replace(op, ng.elementContainer(op.handle.slot, op.attributes, op.localRefs, op.wholeSourceSpan));
                break;
            case ir.OpKind.ContainerEnd:
                ir.OpList.replace(op, ng.elementContainerEnd());
                break;
            case ir.OpKind.I18nStart:
                ir.OpList.replace(op, ng.i18nStart(op.handle.slot, op.messageIndex, op.subTemplateIndex, op.sourceSpan));
                break;
            case ir.OpKind.I18nEnd:
                ir.OpList.replace(op, ng.i18nEnd(op.sourceSpan));
                break;
            case ir.OpKind.I18n:
                ir.OpList.replace(op, ng.i18n(op.handle.slot, op.messageIndex, op.subTemplateIndex, op.sourceSpan));
                break;
            case ir.OpKind.I18nAttributes:
                if (op.i18nAttributesConfig === null) {
                    throw new Error(`AssertionError: i18nAttributesConfig was not set`);
                }
                ir.OpList.replace(op, ng.i18nAttributes(op.handle.slot, op.i18nAttributesConfig));
                break;
            case ir.OpKind.Template:
                if (!(unit instanceof ViewCompilationUnit)) {
                    throw new Error(`AssertionError: must be compiling a component`);
                }
                if (Array.isArray(op.localRefs)) {
                    throw new Error(`AssertionError: local refs array should have been extracted into a constant`);
                }
                const childView = unit.job.views.get(op.xref);
                ir.OpList.replace(op, ng.template(op.handle.slot, o.variable(childView.fnName), childView.decls, childView.vars, op.tag, op.attributes, op.localRefs, op.startSourceSpan));
                break;
            case ir.OpKind.DisableBindings:
                ir.OpList.replace(op, ng.disableBindings());
                break;
            case ir.OpKind.EnableBindings:
                ir.OpList.replace(op, ng.enableBindings());
                break;
            case ir.OpKind.Pipe:
                ir.OpList.replace(op, ng.pipe(op.handle.slot, op.name));
                break;
            case ir.OpKind.DeclareLet:
                ir.OpList.replace(op, ng.declareLet(op.handle.slot, op.sourceSpan));
                break;
            case ir.OpKind.Listener:
                const listenerFn = reifyListenerHandler(unit, op.handlerFnName, op.handlerOps, op.consumesDollarEvent);
                const eventTargetResolver = op.eventTarget
                    ? GLOBAL_TARGET_RESOLVERS.get(op.eventTarget)
                    : null;
                if (eventTargetResolver === undefined) {
                    throw new Error(`Unexpected global target '${op.eventTarget}' defined for '${op.name}' event. Supported list of global targets: window,document,body.`);
                }
                ir.OpList.replace(op, ng.listener(op.name, listenerFn, eventTargetResolver, op.hostListener && op.isAnimationListener, op.sourceSpan));
                break;
            case ir.OpKind.TwoWayListener:
                ir.OpList.replace(op, ng.twoWayListener(op.name, reifyListenerHandler(unit, op.handlerFnName, op.handlerOps, true), op.sourceSpan));
                break;
            case ir.OpKind.Variable:
                if (op.variable.name === null) {
                    throw new Error(`AssertionError: unnamed variable ${op.xref}`);
                }
                ir.OpList.replace(op, ir.createStatementOp(new o.DeclareVarStmt(op.variable.name, op.initializer, undefined, o.StmtModifier.Final)));
                break;
            case ir.OpKind.Namespace:
                switch (op.active) {
                    case ir.Namespace.HTML:
                        ir.OpList.replace(op, ng.namespaceHTML());
                        break;
                    case ir.Namespace.SVG:
                        ir.OpList.replace(op, ng.namespaceSVG());
                        break;
                    case ir.Namespace.Math:
                        ir.OpList.replace(op, ng.namespaceMath());
                        break;
                }
                break;
            case ir.OpKind.Defer:
                const timerScheduling = !!op.loadingMinimumTime || !!op.loadingAfterTime || !!op.placeholderMinimumTime;
                ir.OpList.replace(op, ng.defer(op.handle.slot, op.mainSlot.slot, op.resolverFn, op.loadingSlot?.slot ?? null, op.placeholderSlot?.slot ?? null, op.errorSlot?.slot ?? null, op.loadingConfig, op.placeholderConfig, timerScheduling, op.sourceSpan));
                break;
            case ir.OpKind.DeferOn:
                let args = [];
                switch (op.trigger.kind) {
                    case ir.DeferTriggerKind.Idle:
                    case ir.DeferTriggerKind.Immediate:
                        break;
                    case ir.DeferTriggerKind.Timer:
                        args = [op.trigger.delay];
                        break;
                    case ir.DeferTriggerKind.Interaction:
                    case ir.DeferTriggerKind.Hover:
                    case ir.DeferTriggerKind.Viewport:
                        if (op.trigger.targetSlot?.slot == null || op.trigger.targetSlotViewSteps === null) {
                            throw new Error(`Slot or view steps not set in trigger reification for trigger kind ${op.trigger.kind}`);
                        }
                        args = [op.trigger.targetSlot.slot];
                        if (op.trigger.targetSlotViewSteps !== 0) {
                            args.push(op.trigger.targetSlotViewSteps);
                        }
                        break;
                    default:
                        throw new Error(`AssertionError: Unsupported reification of defer trigger kind ${op.trigger.kind}`);
                }
                ir.OpList.replace(op, ng.deferOn(op.trigger.kind, args, op.prefetch, op.sourceSpan));
                break;
            case ir.OpKind.ProjectionDef:
                ir.OpList.replace(op, ng.projectionDef(op.def));
                break;
            case ir.OpKind.Projection:
                if (op.handle.slot === null) {
                    throw new Error('No slot was assigned for project instruction');
                }
                let fallbackViewFnName = null;
                let fallbackDecls = null;
                let fallbackVars = null;
                if (op.fallbackView !== null) {
                    if (!(unit instanceof ViewCompilationUnit)) {
                        throw new Error(`AssertionError: must be compiling a component`);
                    }
                    const fallbackView = unit.job.views.get(op.fallbackView);
                    if (fallbackView === undefined) {
                        throw new Error('AssertionError: projection had fallback view xref, but fallback view was not found');
                    }
                    if (fallbackView.fnName === null ||
                        fallbackView.decls === null ||
                        fallbackView.vars === null) {
                        throw new Error(`AssertionError: expected projection fallback view to have been named and counted`);
                    }
                    fallbackViewFnName = fallbackView.fnName;
                    fallbackDecls = fallbackView.decls;
                    fallbackVars = fallbackView.vars;
                }
                ir.OpList.replace(op, ng.projection(op.handle.slot, op.projectionSlotIndex, op.attributes, fallbackViewFnName, fallbackDecls, fallbackVars, op.sourceSpan));
                break;
            case ir.OpKind.RepeaterCreate:
                if (op.handle.slot === null) {
                    throw new Error('No slot was assigned for repeater instruction');
                }
                if (!(unit instanceof ViewCompilationUnit)) {
                    throw new Error(`AssertionError: must be compiling a component`);
                }
                const repeaterView = unit.job.views.get(op.xref);
                if (repeaterView.fnName === null) {
                    throw new Error(`AssertionError: expected repeater primary view to have been named`);
                }
                let emptyViewFnName = null;
                let emptyDecls = null;
                let emptyVars = null;
                if (op.emptyView !== null) {
                    const emptyView = unit.job.views.get(op.emptyView);
                    if (emptyView === undefined) {
                        throw new Error('AssertionError: repeater had empty view xref, but empty view was not found');
                    }
                    if (emptyView.fnName === null || emptyView.decls === null || emptyView.vars === null) {
                        throw new Error(`AssertionError: expected repeater empty view to have been named and counted`);
                    }
                    emptyViewFnName = emptyView.fnName;
                    emptyDecls = emptyView.decls;
                    emptyVars = emptyView.vars;
                }
                ir.OpList.replace(op, ng.repeaterCreate(op.handle.slot, repeaterView.fnName, op.decls, op.vars, op.tag, op.attributes, op.trackByFn, op.usesComponentInstance, emptyViewFnName, emptyDecls, emptyVars, op.emptyTag, op.emptyAttributes, op.wholeSourceSpan));
                break;
            case ir.OpKind.Statement:
                // Pass statement operations directly through.
                break;
            default:
                throw new Error(`AssertionError: Unsupported reification of create op ${ir.OpKind[op.kind]}`);
        }
    }
}
function reifyUpdateOperations(_unit, ops) {
    for (const op of ops) {
        ir.transformExpressionsInOp(op, reifyIrExpression, ir.VisitorContextFlag.None);
        switch (op.kind) {
            case ir.OpKind.Advance:
                ir.OpList.replace(op, ng.advance(op.delta, op.sourceSpan));
                break;
            case ir.OpKind.Property:
                if (op.expression instanceof ir.Interpolation) {
                    ir.OpList.replace(op, ng.propertyInterpolate(op.name, op.expression.strings, op.expression.expressions, op.sanitizer, op.sourceSpan));
                }
                else {
                    ir.OpList.replace(op, ng.property(op.name, op.expression, op.sanitizer, op.sourceSpan));
                }
                break;
            case ir.OpKind.TwoWayProperty:
                ir.OpList.replace(op, ng.twoWayProperty(op.name, op.expression, op.sanitizer, op.sourceSpan));
                break;
            case ir.OpKind.StyleProp:
                if (op.expression instanceof ir.Interpolation) {
                    ir.OpList.replace(op, ng.stylePropInterpolate(op.name, op.expression.strings, op.expression.expressions, op.unit, op.sourceSpan));
                }
                else {
                    ir.OpList.replace(op, ng.styleProp(op.name, op.expression, op.unit, op.sourceSpan));
                }
                break;
            case ir.OpKind.ClassProp:
                ir.OpList.replace(op, ng.classProp(op.name, op.expression, op.sourceSpan));
                break;
            case ir.OpKind.StyleMap:
                if (op.expression instanceof ir.Interpolation) {
                    ir.OpList.replace(op, ng.styleMapInterpolate(op.expression.strings, op.expression.expressions, op.sourceSpan));
                }
                else {
                    ir.OpList.replace(op, ng.styleMap(op.expression, op.sourceSpan));
                }
                break;
            case ir.OpKind.ClassMap:
                if (op.expression instanceof ir.Interpolation) {
                    ir.OpList.replace(op, ng.classMapInterpolate(op.expression.strings, op.expression.expressions, op.sourceSpan));
                }
                else {
                    ir.OpList.replace(op, ng.classMap(op.expression, op.sourceSpan));
                }
                break;
            case ir.OpKind.I18nExpression:
                ir.OpList.replace(op, ng.i18nExp(op.expression, op.sourceSpan));
                break;
            case ir.OpKind.I18nApply:
                ir.OpList.replace(op, ng.i18nApply(op.handle.slot, op.sourceSpan));
                break;
            case ir.OpKind.InterpolateText:
                ir.OpList.replace(op, ng.textInterpolate(op.interpolation.strings, op.interpolation.expressions, op.sourceSpan));
                break;
            case ir.OpKind.Attribute:
                if (op.expression instanceof ir.Interpolation) {
                    ir.OpList.replace(op, ng.attributeInterpolate(op.name, op.expression.strings, op.expression.expressions, op.sanitizer, op.sourceSpan));
                }
                else {
                    ir.OpList.replace(op, ng.attribute(op.name, op.expression, op.sanitizer, op.namespace));
                }
                break;
            case ir.OpKind.HostProperty:
                if (op.expression instanceof ir.Interpolation) {
                    throw new Error('not yet handled');
                }
                else {
                    if (op.isAnimationTrigger) {
                        ir.OpList.replace(op, ng.syntheticHostProperty(op.name, op.expression, op.sourceSpan));
                    }
                    else {
                        ir.OpList.replace(op, ng.hostProperty(op.name, op.expression, op.sanitizer, op.sourceSpan));
                    }
                }
                break;
            case ir.OpKind.Variable:
                if (op.variable.name === null) {
                    throw new Error(`AssertionError: unnamed variable ${op.xref}`);
                }
                ir.OpList.replace(op, ir.createStatementOp(new o.DeclareVarStmt(op.variable.name, op.initializer, undefined, o.StmtModifier.Final)));
                break;
            case ir.OpKind.Conditional:
                if (op.processed === null) {
                    throw new Error(`Conditional test was not set.`);
                }
                ir.OpList.replace(op, ng.conditional(op.processed, op.contextValue, op.sourceSpan));
                break;
            case ir.OpKind.Repeater:
                ir.OpList.replace(op, ng.repeater(op.collection, op.sourceSpan));
                break;
            case ir.OpKind.DeferWhen:
                ir.OpList.replace(op, ng.deferWhen(op.prefetch, op.expr, op.sourceSpan));
                break;
            case ir.OpKind.StoreLet:
                throw new Error(`AssertionError: unexpected storeLet ${op.declaredName}`);
            case ir.OpKind.Statement:
                // Pass statement operations directly through.
                break;
            default:
                throw new Error(`AssertionError: Unsupported reification of update op ${ir.OpKind[op.kind]}`);
        }
    }
}
function reifyIrExpression(expr) {
    if (!ir.isIrExpression(expr)) {
        return expr;
    }
    switch (expr.kind) {
        case ir.ExpressionKind.NextContext:
            return ng.nextContext(expr.steps);
        case ir.ExpressionKind.Reference:
            return ng.reference(expr.targetSlot.slot + 1 + expr.offset);
        case ir.ExpressionKind.LexicalRead:
            throw new Error(`AssertionError: unresolved LexicalRead of ${expr.name}`);
        case ir.ExpressionKind.TwoWayBindingSet:
            throw new Error(`AssertionError: unresolved TwoWayBindingSet`);
        case ir.ExpressionKind.RestoreView:
            if (typeof expr.view === 'number') {
                throw new Error(`AssertionError: unresolved RestoreView`);
            }
            return ng.restoreView(expr.view);
        case ir.ExpressionKind.ResetView:
            return ng.resetView(expr.expr);
        case ir.ExpressionKind.GetCurrentView:
            return ng.getCurrentView();
        case ir.ExpressionKind.ReadVariable:
            if (expr.name === null) {
                throw new Error(`Read of unnamed variable ${expr.xref}`);
            }
            return o.variable(expr.name);
        case ir.ExpressionKind.ReadTemporaryExpr:
            if (expr.name === null) {
                throw new Error(`Read of unnamed temporary ${expr.xref}`);
            }
            return o.variable(expr.name);
        case ir.ExpressionKind.AssignTemporaryExpr:
            if (expr.name === null) {
                throw new Error(`Assign of unnamed temporary ${expr.xref}`);
            }
            return o.variable(expr.name).set(expr.expr);
        case ir.ExpressionKind.PureFunctionExpr:
            if (expr.fn === null) {
                throw new Error(`AssertionError: expected PureFunctions to have been extracted`);
            }
            return ng.pureFunction(expr.varOffset, expr.fn, expr.args);
        case ir.ExpressionKind.PureFunctionParameterExpr:
            throw new Error(`AssertionError: expected PureFunctionParameterExpr to have been extracted`);
        case ir.ExpressionKind.PipeBinding:
            return ng.pipeBind(expr.targetSlot.slot, expr.varOffset, expr.args);
        case ir.ExpressionKind.PipeBindingVariadic:
            return ng.pipeBindV(expr.targetSlot.slot, expr.varOffset, expr.args);
        case ir.ExpressionKind.SlotLiteralExpr:
            return o.literal(expr.slot.slot);
        case ir.ExpressionKind.ContextLetReference:
            return ng.readContextLet(expr.targetSlot.slot);
        case ir.ExpressionKind.StoreLet:
            return ng.storeLet(expr.value, expr.sourceSpan);
        default:
            throw new Error(`AssertionError: Unsupported reification of ir.Expression kind: ${ir.ExpressionKind[expr.kind]}`);
    }
}
/**
 * Listeners get turned into a function expression, which may or may not have the `$event`
 * parameter defined.
 */
function reifyListenerHandler(unit, name, handlerOps, consumesDollarEvent) {
    // First, reify all instruction calls within `handlerOps`.
    reifyUpdateOperations(unit, handlerOps);
    // Next, extract all the `o.Statement`s from the reified operations. We can expect that at this
    // point, all operations have been converted to statements.
    const handlerStmts = [];
    for (const op of handlerOps) {
        if (op.kind !== ir.OpKind.Statement) {
            throw new Error(`AssertionError: expected reified statements, but found op ${ir.OpKind[op.kind]}`);
        }
        handlerStmts.push(op.statement);
    }
    // If `$event` is referenced, we need to generate it as a parameter.
    const params = [];
    if (consumesDollarEvent) {
        // We need the `$event` parameter.
        params.push(new o.FnParam('$event'));
    }
    return o.fn(params, handlerStmts, undefined, undefined, name);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVpZnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvdGVtcGxhdGUvcGlwZWxpbmUvc3JjL3BoYXNlcy9yZWlmeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEtBQUssQ0FBQyxNQUFNLCtCQUErQixDQUFDO0FBQ25ELE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxvQ0FBb0MsQ0FBQztBQUMvRCxPQUFPLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUMvQixPQUFPLEVBQUMsbUJBQW1CLEVBQTRDLE1BQU0sZ0JBQWdCLENBQUM7QUFDOUYsT0FBTyxLQUFLLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUVyQzs7R0FFRztBQUNILE1BQU0sdUJBQXVCLEdBQUcsSUFBSSxHQUFHLENBQThCO0lBQ25FLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxhQUFhLENBQUM7SUFDckMsQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDLGVBQWUsQ0FBQztJQUN6QyxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsV0FBVyxDQUFDO0NBQ2xDLENBQUMsQ0FBQztBQUVIOzs7Ozs7O0dBT0c7QUFDSCxNQUFNLFVBQVUsS0FBSyxDQUFDLEdBQW1CO0lBQ3ZDLEtBQUssTUFBTSxJQUFJLElBQUksR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzdCLHFCQUFxQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDekMscUJBQXFCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMzQyxDQUFDO0FBQ0gsQ0FBQztBQUVEOzs7OztHQUtHO0FBQ0gsU0FBUyxrQkFBa0IsQ0FBQyxHQUFtQjtJQUM3QyxLQUFLLE1BQU0sSUFBSSxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFF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LE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FDbEYsQ0FBQztRQUNKLENBQUM7UUFDRCxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRUQsb0VBQW9FO0lBQ3BFLE1BQU0sTUFBTSxHQUFnQixFQUFFLENBQUM7SUFDL0IsSUFBSSxtQkFBbUIsRUFBRSxDQUFDO1FBQ3hCLGtDQUFrQztRQUNsQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFRCxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2hFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIG8gZnJvbSAnLi4vLi4vLi4vLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0IHtJZGVudGlmaWVyc30gZnJvbSAnLi4vLi4vLi4vLi4vcmVuZGVyMy9yM19pZGVudGlmaWVycyc7XG5pbXBvcnQgKiBhcyBpciBmcm9tICcuLi8uLi9pcic7XG5pbXBvcnQge1ZpZXdDb21waWxhdGlvblVuaXQsIHR5cGUgQ29tcGlsYXRpb25Kb2IsIHR5cGUgQ29tcGlsYXRpb25Vbml0fSBmcm9tICcuLi9jb21waWxhdGlvbic7XG5pbXBvcnQgKiBhcyBuZyBmcm9tICcuLi9pbnN0cnVjdGlvbic7XG5cbi8qKlxuICogTWFwIG9mIHRhcmdldCByZXNvbHZlcnMgZm9yIGV2ZW50IGxpc3RlbmVycy5cbiAqL1xuY29uc3QgR0xPQkFMX1RBUkdFVF9SRVNPTFZFUlMgPSBuZXcgTWFwPHN0cmluZywgby5FeHRlcm5hbFJlZmVyZW5jZT4oW1xuICBbJ3dpbmRvdycsIElkZW50aWZpZXJzLnJlc29sdmVXaW5kb3ddLFxuICBbJ2RvY3VtZW50JywgSWRlbnRpZmllcnMucmVzb2x2ZURvY3VtZW50XSxcbiAgWydib2R5JywgSWRlbnRpZmllcnMucmVzb2x2ZUJvZHldLFxuXSk7XG5cbi8qKlxuICogQ29tcGlsZXMgc2VtYW50aWMgb3BlcmF0aW9ucyBhY3Jvc3MgYWxsIHZpZXdzIGFuZCBnZW5lcmF0ZXMgb3V0cHV0IGBvLlN0YXRlbWVudGBzIHdpdGggYWN0dWFsXG4gKiBydW50aW1lIGNhbGxzIGluIHRoZWlyIHBsYWNlLlxuICpcbiAqIFJlaWZpY2F0aW9uIHJlcGxhY2VzIHNlbWFudGljIG9wZXJhdGlvbnMgd2l0aCBzZWxlY3RlZCBJdnkgaW5zdHJ1Y3Rpb25zIGFuZCBvdGhlciBnZW5lcmF0ZWQgY29kZVxuICogc3RydWN0dXJlcy4gQWZ0ZXIgcmVpZmljYXRpb24sIHRoZSBjcmVhdGUvdXBkYXRlIG9wZXJhdGlvbiBsaXN0cyBvZiBhbGwgdmlld3Mgc2hvdWxkIG9ubHkgY29udGFpblxuICogYGlyLlN0YXRlbWVudE9wYHMgKHdoaWNoIHdyYXAgZ2VuZXJhdGVkIGBvLlN0YXRlbWVudGBzKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlaWZ5KGpvYjogQ29tcGlsYXRpb25Kb2IpOiB2b2lkIHtcbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIHJlaWZ5Q3JlYXRlT3BlcmF0aW9ucyh1bml0LCB1bml0LmNyZWF0ZSk7XG4gICAgcmVpZnlVcGRhdGVPcGVyYXRpb25zKHVuaXQsIHVuaXQudXBkYXRlKTtcbiAgfVxufVxuXG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gY2FuIGJlIHVzZWQgYSBzYW5pdHkgY2hlY2sgLS0gaXQgd2Fsa3MgZXZlcnkgZXhwcmVzc2lvbiBpbiB0aGUgY29uc3QgcG9vbCwgYW5kXG4gKiBldmVyeSBleHByZXNzaW9uIHJlYWNoYWJsZSBmcm9tIGFuIG9wLCBhbmQgbWFrZXMgc3VyZSB0aGF0IHRoZXJlIGFyZSBubyBJUiBleHByZXNzaW9uc1xuICogbGVmdC4gVGhpcyBpcyBuaWNlIHRvIHVzZSBmb3IgZGVidWdnaW5nIG15c3RlcmlvdXMgZmFpbHVyZXMgd2hlcmUgYW4gSVIgZXhwcmVzc2lvbiBjYW5ub3QgYmVcbiAqIG91dHB1dCBmcm9tIHRoZSBvdXRwdXQgQVNUIGNvZGUuXG4gKi9cbmZ1bmN0aW9uIGVuc3VyZU5vSXJGb3JEZWJ1Zyhqb2I6IENvbXBpbGF0aW9uSm9iKSB7XG4gIGZvciAoY29uc3Qgc3RtdCBvZiBqb2IucG9vbC5zdGF0ZW1lbnRzKSB7XG4gICAgaXIudHJhbnNmb3JtRXhwcmVzc2lvbnNJblN0YXRlbWVudChcbiAgICAgIHN0bXQsXG4gICAgICAoZXhwcikgPT4ge1xuICAgICAgICBpZiAoaXIuaXNJckV4cHJlc3Npb24oZXhwcikpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgQXNzZXJ0aW9uRXJyb3I6IElSIGV4cHJlc3Npb24gZm91bmQgZHVyaW5nIHJlaWZ5OiAke2lyLkV4cHJlc3Npb25LaW5kW2V4cHIua2luZF19YCxcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBleHByO1xuICAgICAgfSxcbiAgICAgIGlyLlZpc2l0b3JDb250ZXh0RmxhZy5Ob25lLFxuICAgICk7XG4gIH1cbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC5vcHMoKSkge1xuICAgICAgaXIudmlzaXRFeHByZXNzaW9uc0luT3Aob3AsIChleHByKSA9PiB7XG4gICAgICAgIGlmIChpci5pc0lyRXhwcmVzc2lvbihleHByKSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBBc3NlcnRpb25FcnJvcjogSVIgZXhwcmVzc2lvbiBmb3VuZCBkdXJpbmcgcmVpZnk6ICR7aXIuRXhwcmVzc2lvbktpbmRbZXhwci5raW5kXX1gLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiByZWlmeUNyZWF0ZU9wZXJhdGlvbnModW5pdDogQ29tcGlsYXRpb25Vbml0LCBvcHM6IGlyLk9wTGlzdDxpci5DcmVhdGVPcD4pOiB2b2lkIHtcbiAgZm9yIChjb25zdCBvcCBvZiBvcHMpIHtcbiAgICBpci50cmFuc2Zvcm1FeHByZXNzaW9uc0luT3Aob3AsIHJlaWZ5SXJFeHByZXNzaW9uLCBpci5WaXNpdG9yQ29udGV4dEZsYWcuTm9uZSk7XG5cbiAgICBzd2l0Y2ggKG9wLmtpbmQpIHtcbiAgICAgIGNhc2UgaXIuT3BLaW5kLlRleHQ6XG4gICAgICAgIGlyLk9wTGlzdC5yZXBsYWNlKG9wLCBuZy50ZXh0KG9wLmhhbmRsZS5zbG90ISwgb3AuaW5pdGlhbFZhbHVlLCBvcC5zb3VyY2VTcGFuKSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBpci5PcEtpbmQuRWxlbWVudFN0YXJ0OlxuICAgICAgICBpci5PcExpc3QucmVwbGFjZShcbiAgICAgICAgICBvcCxcbiAgICAgICAgICBuZy5lbGVtZW50U3RhcnQoXG4gICAgICAgICAgICBvcC5oYW5kbGUuc2xvdCEsXG4gICAgICAgICAgICBvcC50YWchLFxuICAgICAgICAgICAgb3AuYXR0cmlidXRlcyBhcyBudW1iZXIgfCBudWxsLFxuICAgICAgICAgICAgb3AubG9jYWxSZWZzIGFzIG51bWJlciB8IG51bGwsXG4gICAgICAgICAgICBvcC5zdGFydFNvdXJjZVNwYW4sXG4gICAgICAgICAgKSxcbiAgICAgICAgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGlyLk9wS2luZC5FbGVtZW50OlxuICAgICAgICBpci5PcExpc3QucmVwbGFjZShcbiAgICAgICAgICBvcCxcbiAgICAgICAgICBuZy5lbGVtZW50KFxuICAgICAgICAgICAgb3AuaGFuZGxlLnNsb3QhLFxuICAgICAgICAgICAgb3AudGFnISxcbiAgICAgICAgICAgIG9wLmF0dHJpYnV0ZXMgYXMgbnVtYmVyIHwgbnVsbCxcbiAgICAgICAgICAgIG9wLmxvY2FsUmVmcyBhcyBudW1iZXIgfCBudWxsLFxuICAgICAgICAgICAgb3Aud2hvbGVTb3VyY2VTcGFuLFxuICAgICAgICAgICksXG4gICAgICAgICk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBpci5PcEtpbmQuRWxlbWVudEVuZDpcbiAgICAgICAgaXIuT3BMaXN0LnJlcGxhY2Uob3AsIG5nLmVsZW1lbnRFbmQob3Auc291cmNlU3BhbikpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgaXIuT3BLaW5kLkNvbnRhaW5lclN0YXJ0OlxuICAgICAgICBpci5PcExpc3QucmVwbGFjZShcbiAgICAgICAgICBvcCxcbiAgICAgICAgICBuZy5lbGVtZW50Q29udGFpbmVyU3RhcnQoXG4gICAgICAgICAgICBvcC5oYW5kbGUuc2xvdCEsXG4gICAgICAgICAgICBvcC5hdHRyaWJ1dGVzIGFzIG51bWJlciB8IG51bGwsXG4gICAgICAgICAgICBvcC5sb2NhbFJlZnMgYXMgbnVtYmVyIHwgbnVsbCxcbiAgICAgICAgICAgIG9wLnN0YXJ0U291cmNlU3BhbixcbiAgICAgICAgICApLFxuICAgICAgICApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgaXIuT3BLaW5kLkNvbnRhaW5lcjpcbiAgICAgICAgaXIuT3BMaXN0LnJlcGxhY2UoXG4gICAgICAgICAgb3AsXG4gICAgICAgICAgbmcuZWxlbWVudENvbnRhaW5lcihcbiAgICAgICAgICAgIG9wLmhhbmRsZS5zbG90ISxcbiAgICAgICAgICAgIG9wLmF0dHJpYnV0ZXMgYXMgbnVtYmVyIHwgbnVsbCxcbiAgICAgICAgICAgIG9wLmxvY2FsUmVmcyBhcyBudW1iZXIgfCBudWxsLFxuICAgICAgICAgICAgb3Aud2hvbGVTb3VyY2VTcGFuLFxuICAgICAgICAgICksXG4gICAgICAgICk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBpci5PcEtpbmQuQ29udGFpbmVyRW5kOlxuICAgICAgICBpci5PcExpc3QucmVwbGFjZShvcCwgbmcuZWxlbWVudENvbnRhaW5lckVuZCgpKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGlyLk9wS2luZC5JMThuU3RhcnQ6XG4gICAgICAgIGlyLk9wTGlzdC5yZXBsYWNlKFxuICAgICAgICAgIG9wLFxuICAgICAgICAgIG5nLmkxOG5TdGFydChvcC5oYW5kbGUuc2xvdCEsIG9wLm1lc3NhZ2VJbmRleCEsIG9wLnN1YlRlbXBsYXRlSW5kZXghLCBvcC5zb3VyY2VTcGFuKSxcbiAgICAgICAgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGlyLk9wS2luZC5JMThuRW5kOlxuICAgICAgICBpci5PcExpc3QucmVwbGFjZShvcCwgbmcuaTE4bkVuZChvcC5zb3VyY2VTcGFuKSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBpci5PcEtpbmQuSTE4bjpcbiAgICAgICAgaXIuT3BMaXN0LnJlcGxhY2UoXG4gICAgICAgICAgb3AsXG4gICAgICAgICAgbmcuaTE4bihvcC5oYW5kbGUuc2xvdCEsIG9wLm1lc3NhZ2VJbmRleCEsIG9wLnN1YlRlbXBsYXRlSW5kZXghLCBvcC5zb3VyY2VTcGFuKSxcbiAgICAgICAgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGlyLk9wS2luZC5JMThuQXR0cmlidXRlczpcbiAgICAgICAgaWYgKG9wLmkxOG5BdHRyaWJ1dGVzQ29uZmlnID09PSBudWxsKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBBc3NlcnRpb25FcnJvcjogaTE4bkF0dHJpYnV0ZXNDb25maWcgd2FzIG5vdCBzZXRgKTtcbiAgICAgICAgfVxuICAgICAgICBpci5PcExpc3QucmVwbGFjZShvcCwgbmcuaTE4bkF0dHJpYnV0ZXMob3AuaGFuZGxlLnNsb3QhLCBvcC5pMThuQXR0cmlidXRlc0NvbmZpZykpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgaXIuT3BLaW5kLlRlbXBsYXRlOlxuICAgICAgICBpZiAoISh1bml0IGluc3RhbmNlb2YgVmlld0NvbXBpbGF0aW9uVW5pdCkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEFzc2VydGlvbkVycm9yOiBtdXN0IGJlIGNvbXBpbGluZyBhIGNvbXBvbmVudGApO1xuICAgICAgICB9XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KG9wLmxvY2FsUmVmcykpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgQXNzZXJ0aW9uRXJyb3I6IGxvY2FsIHJlZnMgYXJyYXkgc2hvdWxkIGhhdmUgYmVlbiBleHRyYWN0ZWQgaW50byBhIGNvbnN0YW50YCxcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNoaWxkVmlldyA9IHVuaXQuam9iLnZpZXdzLmdldChvcC54cmVmKSE7XG4gICAgICAgIGlyLk9wTGlzdC5yZXBsYWNlKFxuICAgICAgICAgIG9wLFxuICAgICAgICAgIG5nLnRlbXBsYXRlKFxuICAgICAgICAgICAgb3AuaGFuZGxlLnNsb3QhLFxuICAgICAgICAgICAgby52YXJpYWJsZShjaGlsZFZpZXcuZm5OYW1lISksXG4gICAgICAgICAgICBjaGlsZFZpZXcuZGVjbHMhLFxuICAgICAgICAgICAgY2hpbGRWaWV3LnZhcnMhLFxuICAgICAgICAgICAgb3AudGFnLFxuICAgICAgICAgICAgb3AuYXR0cmlidXRlcyxcbiAgICAgICAgICAgIG9wLmxvY2FsUmVmcyxcbiAgICAgICAgICAgIG9wLnN0YXJ0U291cmNlU3BhbixcbiAgICAgICAgICApLFxuICAgICAgICApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgaXIuT3BLaW5kLkRpc2FibGVCaW5kaW5nczpcbiAgICAgICAgaXIuT3BMaXN0LnJlcGxhY2Uob3AsIG5nLmRpc2FibGVCaW5kaW5ncygpKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGlyLk9wS2luZC5FbmFibGVCaW5kaW5nczpcbiAgICAgICAgaXIuT3BMaXN0LnJlcGxhY2Uob3AsIG5nLmVuYWJsZUJpbmRpbmdzKCkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgaXIuT3BLaW5kLlBpcGU6XG4gICAgICAgIGlyLk9wTGlzdC5yZXBsYWNlKG9wLCBuZy5waXBlKG9wLmhhbmRsZS5zbG90ISwgb3AubmFtZSkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgaXIuT3BLaW5kLkRlY2xhcmVMZXQ6XG4gICAgICAgIGlyLk9wTGlzdC5yZXBsYWNlKG9wLCBuZy5kZWNsYXJlTGV0KG9wLmhhbmRsZS5zbG90ISwgb3Auc291cmNlU3BhbikpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgaXIuT3BLaW5kLkxpc3RlbmVyOlxuICAgICAgICBjb25zdCBsaXN0ZW5lckZuID0gcmVpZnlMaXN0ZW5lckhhbmRsZXIoXG4gICAgICAgICAgdW5pdCxcbiAgICAgICAgICBvcC5oYW5kbGVyRm5OYW1lISxcbiAgICAgICAgICBvcC5oYW5kbGVyT3BzLFxuICAgICAgICAgIG9wLmNvbnN1bWVzRG9sbGFyRXZlbnQsXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IGV2ZW50VGFyZ2V0UmVzb2x2ZXIgPSBvcC5ldmVudFRhcmdldFxuICAgICAgICAgID8gR0xPQkFMX1RBUkdFVF9SRVNPTFZFUlMuZ2V0KG9wLmV2ZW50VGFyZ2V0KVxuICAgICAgICAgIDogbnVsbDtcbiAgICAgICAgaWYgKGV2ZW50VGFyZ2V0UmVzb2x2ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBVbmV4cGVjdGVkIGdsb2JhbCB0YXJnZXQgJyR7b3AuZXZlbnRUYXJnZXR9JyBkZWZpbmVkIGZvciAnJHtvcC5uYW1lfScgZXZlbnQuIFN1cHBvcnRlZCBsaXN0IG9mIGdsb2JhbCB0YXJnZXRzOiB3aW5kb3csZG9jdW1lbnQsYm9keS5gLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgaXIuT3BMaXN0LnJlcGxhY2UoXG4gICAgICAgICAgb3AsXG4gICAgICAgICAgbmcubGlzdGVuZXIoXG4gICAgICAgICAgICBvcC5uYW1lLFxuICAgICAgICAgICAgbGlzdGVuZXJGbixcbiAgICAgICAgICAgIGV2ZW50VGFyZ2V0UmVzb2x2ZXIsXG4gICAgICAgICAgICBvcC5ob3N0TGlzdGVuZXIgJiYgb3AuaXNBbmltYXRpb25MaXN0ZW5lcixcbiAgICAgICAgICAgIG9wLnNvdXJjZVNwYW4sXG4gICAgICAgICAgKSxcbiAgICAgICAgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGlyLk9wS2luZC5Ud29XYXlMaXN0ZW5lcjpcbiAgICAgICAgaXIuT3BMaXN0LnJlcGxhY2UoXG4gICAgICAgICAgb3AsXG4gICAgICAgICAgbmcudHdvV2F5TGlzdGVuZXIoXG4gICAgICAgICAgICBvcC5uYW1lLFxuICAgICAgICAgICAgcmVpZnlMaXN0ZW5lckhhbmRsZXIodW5pdCwgb3AuaGFuZGxlckZuTmFtZSEsIG9wLmhhbmRsZXJPcHMsIHRydWUpLFxuICAgICAgICAgICAgb3Auc291cmNlU3BhbixcbiAgICAgICAgICApLFxuICAgICAgICApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgaXIuT3BLaW5kLlZhcmlhYmxlOlxuICAgICAgICBpZiAob3AudmFyaWFibGUubmFtZSA9PT0gbnVsbCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQXNzZXJ0aW9uRXJyb3I6IHVubmFtZWQgdmFyaWFibGUgJHtvcC54cmVmfWApO1xuICAgICAgICB9XG4gICAgICAgIGlyLk9wTGlzdC5yZXBsYWNlPGlyLkNyZWF0ZU9wPihcbiAgICAgICAgICBvcCxcbiAgICAgICAgICBpci5jcmVhdGVTdGF0ZW1lbnRPcChcbiAgICAgICAgICAgIG5ldyBvLkRlY2xhcmVWYXJTdG10KG9wLnZhcmlhYmxlLm5hbWUsIG9wLmluaXRpYWxpemVyLCB1bmRlZmluZWQsIG8uU3RtdE1vZGlmaWVyLkZpbmFsKSxcbiAgICAgICAgICApLFxuICAgICAgICApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgaXIuT3BLaW5kLk5hbWVzcGFjZTpcbiAgICAgICAgc3dpdGNoIChvcC5hY3RpdmUpIHtcbiAgICAgICAgICBjYXNlIGlyLk5hbWVzcGFjZS5IVE1MOlxuICAgICAgICAgICAgaXIuT3BMaXN0LnJlcGxhY2U8aXIuQ3JlYXRlT3A+KG9wLCBuZy5uYW1lc3BhY2VIVE1MKCkpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBpci5OYW1lc3BhY2UuU1ZHOlxuICAgICAgICAgICAgaXIuT3BMaXN0LnJlcGxhY2U8aXIuQ3JlYXRlT3A+KG9wLCBuZy5uYW1lc3BhY2VTVkcoKSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIGlyLk5hbWVzcGFjZS5NYXRoOlxuICAgICAgICAgICAgaXIuT3BMaXN0LnJlcGxhY2U8aXIuQ3JlYXRlT3A+KG9wLCBuZy5uYW1lc3BhY2VNYXRoKCkpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGlyLk9wS2luZC5EZWZlcjpcbiAgICAgICAgY29uc3QgdGltZXJTY2hlZHVsaW5nID1cbiAgICAgICAgICAhIW9wLmxvYWRpbmdNaW5pbXVtVGltZSB8fCAhIW9wLmxvYWRpbmdBZnRlclRpbWUgfHwgISFvcC5wbGFjZWhvbGRlck1pbmltdW1UaW1lO1xuICAgICAgICBpci5PcExpc3QucmVwbGFjZShcbiAgICAgICAgICBvcCxcbiAgICAgICAgICBuZy5kZWZlcihcbiAgICAgICAgICAgIG9wLmhhbmRsZS5zbG90ISxcbiAgICAgICAgICAgIG9wLm1haW5TbG90LnNsb3QhLFxuICAgICAgICAgICAgb3AucmVzb2x2ZXJGbixcbiAgICAgICAgICAgIG9wLmxvYWRpbmdTbG90Py5zbG90ID8/IG51bGwsXG4gICAgICAgICAgICBvcC5wbGFjZWhvbGRlclNsb3Q/LnNsb3QhID8/IG51bGwsXG4gICAgICAgICAgICBvcC5lcnJvclNsb3Q/LnNsb3QgPz8gbnVsbCxcbiAgICAgICAgICAgIG9wLmxvYWRpbmdDb25maWcsXG4gICAgICAgICAgICBvcC5wbGFjZWhvbGRlckNvbmZpZyxcbiAgICAgICAgICAgIHRpbWVyU2NoZWR1bGluZyxcbiAgICAgICAgICAgIG9wLnNvdXJjZVNwYW4sXG4gICAgICAgICAgKSxcbiAgICAgICAgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGlyLk9wS2luZC5EZWZlck9uOlxuICAgICAgICBsZXQgYXJnczogbnVtYmVyW10gPSBbXTtcbiAgICAgICAgc3dpdGNoIChvcC50cmlnZ2VyLmtpbmQpIHtcbiAgICAgICAgICBjYXNlIGlyLkRlZmVyVHJpZ2dlcktpbmQuSWRsZTpcbiAgICAgICAgICBjYXNlIGlyLkRlZmVyVHJpZ2dlcktpbmQuSW1tZWRpYXRlOlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBpci5EZWZlclRyaWdnZXJLaW5kLlRpbWVyOlxuICAgICAgICAgICAgYXJncyA9IFtvcC50cmlnZ2VyLmRlbGF5XTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgaXIuRGVmZXJUcmlnZ2VyS2luZC5JbnRlcmFjdGlvbjpcbiAgICAgICAgICBjYXNlIGlyLkRlZmVyVHJpZ2dlcktpbmQuSG92ZXI6XG4gICAgICAgICAgY2FzZSBpci5EZWZlclRyaWdnZXJLaW5kLlZpZXdwb3J0OlxuICAgICAgICAgICAgaWYgKG9wLnRyaWdnZXIudGFyZ2V0U2xvdD8uc2xvdCA9PSBudWxsIHx8IG9wLnRyaWdnZXIudGFyZ2V0U2xvdFZpZXdTdGVwcyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgYFNsb3Qgb3IgdmlldyBzdGVwcyBub3Qgc2V0IGluIHRyaWdnZXIgcmVpZmljYXRpb24gZm9yIHRyaWdnZXIga2luZCAke29wLnRyaWdnZXIua2luZH1gLFxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXJncyA9IFtvcC50cmlnZ2VyLnRhcmdldFNsb3Quc2xvdF07XG4gICAgICAgICAgICBpZiAob3AudHJpZ2dlci50YXJnZXRTbG90Vmlld1N0ZXBzICE9PSAwKSB7XG4gICAgICAgICAgICAgIGFyZ3MucHVzaChvcC50cmlnZ2VyLnRhcmdldFNsb3RWaWV3U3RlcHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgYEFzc2VydGlvbkVycm9yOiBVbnN1cHBvcnRlZCByZWlmaWNhdGlvbiBvZiBkZWZlciB0cmlnZ2VyIGtpbmQgJHtcbiAgICAgICAgICAgICAgICAob3AudHJpZ2dlciBhcyBhbnkpLmtpbmRcbiAgICAgICAgICAgICAgfWAsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGlyLk9wTGlzdC5yZXBsYWNlKG9wLCBuZy5kZWZlck9uKG9wLnRyaWdnZXIua2luZCwgYXJncywgb3AucHJlZmV0Y2gsIG9wLnNvdXJjZVNwYW4pKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGlyLk9wS2luZC5Qcm9qZWN0aW9uRGVmOlxuICAgICAgICBpci5PcExpc3QucmVwbGFjZTxpci5DcmVhdGVPcD4ob3AsIG5nLnByb2plY3Rpb25EZWYob3AuZGVmKSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBpci5PcEtpbmQuUHJvamVjdGlvbjpcbiAgICAgICAgaWYgKG9wLmhhbmRsZS5zbG90ID09PSBudWxsKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBzbG90IHdhcyBhc3NpZ25lZCBmb3IgcHJvamVjdCBpbnN0cnVjdGlvbicpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBmYWxsYmFja1ZpZXdGbk5hbWU6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuICAgICAgICBsZXQgZmFsbGJhY2tEZWNsczogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG4gICAgICAgIGxldCBmYWxsYmFja1ZhcnM6IG51bWJlciB8IG51bGwgPSBudWxsO1xuICAgICAgICBpZiAob3AuZmFsbGJhY2tWaWV3ICE9PSBudWxsKSB7XG4gICAgICAgICAgaWYgKCEodW5pdCBpbnN0YW5jZW9mIFZpZXdDb21waWxhdGlvblVuaXQpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEFzc2VydGlvbkVycm9yOiBtdXN0IGJlIGNvbXBpbGluZyBhIGNvbXBvbmVudGApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBmYWxsYmFja1ZpZXcgPSB1bml0LmpvYi52aWV3cy5nZXQob3AuZmFsbGJhY2tWaWV3KTtcbiAgICAgICAgICBpZiAoZmFsbGJhY2tWaWV3ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgJ0Fzc2VydGlvbkVycm9yOiBwcm9qZWN0aW9uIGhhZCBmYWxsYmFjayB2aWV3IHhyZWYsIGJ1dCBmYWxsYmFjayB2aWV3IHdhcyBub3QgZm91bmQnLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgZmFsbGJhY2tWaWV3LmZuTmFtZSA9PT0gbnVsbCB8fFxuICAgICAgICAgICAgZmFsbGJhY2tWaWV3LmRlY2xzID09PSBudWxsIHx8XG4gICAgICAgICAgICBmYWxsYmFja1ZpZXcudmFycyA9PT0gbnVsbFxuICAgICAgICAgICkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICBgQXNzZXJ0aW9uRXJyb3I6IGV4cGVjdGVkIHByb2plY3Rpb24gZmFsbGJhY2sgdmlldyB0byBoYXZlIGJlZW4gbmFtZWQgYW5kIGNvdW50ZWRgLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZmFsbGJhY2tWaWV3Rm5OYW1lID0gZmFsbGJhY2tWaWV3LmZuTmFtZTtcbiAgICAgICAgICBmYWxsYmFja0RlY2xzID0gZmFsbGJhY2tWaWV3LmRlY2xzO1xuICAgICAgICAgIGZhbGxiYWNrVmFycyA9IGZhbGxiYWNrVmlldy52YXJzO1xuICAgICAgICB9XG4gICAgICAgIGlyLk9wTGlzdC5yZXBsYWNlPGlyLkNyZWF0ZU9wPihcbiAgICAgICAgICBvcCxcbiAgICAgICAgICBuZy5wcm9qZWN0aW9uKFxuICAgICAgICAgICAgb3AuaGFuZGxlLnNsb3QhLFxuICAgICAgICAgICAgb3AucHJvamVjdGlvblNsb3RJbmRleCxcbiAgICAgICAgICAgIG9wLmF0dHJpYnV0ZXMsXG4gICAgICAgICAgICBmYWxsYmFja1ZpZXdGbk5hbWUsXG4gICAgICAgICAgICBmYWxsYmFja0RlY2xzLFxuICAgICAgICAgICAgZmFsbGJhY2tWYXJzLFxuICAgICAgICAgICAgb3Auc291cmNlU3BhbixcbiAgICAgICAgICApLFxuICAgICAgICApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgaXIuT3BLaW5kLlJlcGVhdGVyQ3JlYXRlOlxuICAgICAgICBpZiAob3AuaGFuZGxlLnNsb3QgPT09IG51bGwpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIHNsb3Qgd2FzIGFzc2lnbmVkIGZvciByZXBlYXRlciBpbnN0cnVjdGlvbicpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghKHVuaXQgaW5zdGFuY2VvZiBWaWV3Q29tcGlsYXRpb25Vbml0KSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQXNzZXJ0aW9uRXJyb3I6IG11c3QgYmUgY29tcGlsaW5nIGEgY29tcG9uZW50YCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVwZWF0ZXJWaWV3ID0gdW5pdC5qb2Iudmlld3MuZ2V0KG9wLnhyZWYpITtcbiAgICAgICAgaWYgKHJlcGVhdGVyVmlldy5mbk5hbWUgPT09IG51bGwpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEFzc2VydGlvbkVycm9yOiBleHBlY3RlZCByZXBlYXRlciBwcmltYXJ5IHZpZXcgdG8gaGF2ZSBiZWVuIG5hbWVkYCk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZW1wdHlWaWV3Rm5OYW1lOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcbiAgICAgICAgbGV0IGVtcHR5RGVjbHM6IG51bWJlciB8IG51bGwgPSBudWxsO1xuICAgICAgICBsZXQgZW1wdHlWYXJzOiBudW1iZXIgfCBudWxsID0gbnVsbDtcbiAgICAgICAgaWYgKG9wLmVtcHR5VmlldyAhPT0gbnVsbCkge1xuICAgICAgICAgIGNvbnN0IGVtcHR5VmlldyA9IHVuaXQuam9iLnZpZXdzLmdldChvcC5lbXB0eVZpZXcpO1xuICAgICAgICAgIGlmIChlbXB0eVZpZXcgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAnQXNzZXJ0aW9uRXJyb3I6IHJlcGVhdGVyIGhhZCBlbXB0eSB2aWV3IHhyZWYsIGJ1dCBlbXB0eSB2aWV3IHdhcyBub3QgZm91bmQnLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGVtcHR5Vmlldy5mbk5hbWUgPT09IG51bGwgfHwgZW1wdHlWaWV3LmRlY2xzID09PSBudWxsIHx8IGVtcHR5Vmlldy52YXJzID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgIGBBc3NlcnRpb25FcnJvcjogZXhwZWN0ZWQgcmVwZWF0ZXIgZW1wdHkgdmlldyB0byBoYXZlIGJlZW4gbmFtZWQgYW5kIGNvdW50ZWRgLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZW1wdHlWaWV3Rm5OYW1lID0gZW1wdHlWaWV3LmZuTmFtZTtcbiAgICAgICAgICBlbXB0eURlY2xzID0gZW1wdHlWaWV3LmRlY2xzO1xuICAgICAgICAgIGVtcHR5VmFycyA9IGVtcHR5Vmlldy52YXJzO1xuICAgICAgICB9XG5cbiAgICAgICAgaXIuT3BMaXN0LnJlcGxhY2UoXG4gICAgICAgICAgb3AsXG4gICAgICAgICAgbmcucmVwZWF0ZXJDcmVhdGUoXG4gICAgICAgICAgICBvcC5oYW5kbGUuc2xvdCxcbiAgICAgICAgICAgIHJlcGVhdGVyVmlldy5mbk5hbWUsXG4gICAgICAgICAgICBvcC5kZWNscyEsXG4gICAgICAgICAgICBvcC52YXJzISxcbiAgICAgICAgICAgIG9wLnRhZyxcbiAgICAgICAgICAgIG9wLmF0dHJpYnV0ZXMsXG4gICAgICAgICAgICBvcC50cmFja0J5Rm4hLFxuICAgICAgICAgICAgb3AudXNlc0NvbXBvbmVudEluc3RhbmNlLFxuICAgICAgICAgICAgZW1wdHlWaWV3Rm5OYW1lLFxuICAgICAgICAgICAgZW1wdHlEZWNscyxcbiAgICAgICAgICAgIGVtcHR5VmFycyxcbiAgICAgICAgICAgIG9wLmVtcHR5VGFnLFxuICAgICAgICAgICAgb3AuZW1wdHlBdHRyaWJ1dGVzLFxuICAgICAgICAgICAgb3Aud2hvbGVTb3VyY2VTcGFuLFxuICAgICAgICAgICksXG4gICAgICAgICk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBpci5PcEtpbmQuU3RhdGVtZW50OlxuICAgICAgICAvLyBQYXNzIHN0YXRlbWVudCBvcGVyYXRpb25zIGRpcmVjdGx5IHRocm91Z2guXG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBBc3NlcnRpb25FcnJvcjogVW5zdXBwb3J0ZWQgcmVpZmljYXRpb24gb2YgY3JlYXRlIG9wICR7aXIuT3BLaW5kW29wLmtpbmRdfWAsXG4gICAgICAgICk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHJlaWZ5VXBkYXRlT3BlcmF0aW9ucyhfdW5pdDogQ29tcGlsYXRpb25Vbml0LCBvcHM6IGlyLk9wTGlzdDxpci5VcGRhdGVPcD4pOiB2b2lkIHtcbiAgZm9yIChjb25zdCBvcCBvZiBvcHMpIHtcbiAgICBpci50cmFuc2Zvcm1FeHByZXNzaW9uc0luT3Aob3AsIHJlaWZ5SXJFeHByZXNzaW9uLCBpci5WaXNpdG9yQ29udGV4dEZsYWcuTm9uZSk7XG5cbiAgICBzd2l0Y2ggKG9wLmtpbmQpIHtcbiAgICAgIGNhc2UgaXIuT3BLaW5kLkFkdmFuY2U6XG4gICAgICAgIGlyLk9wTGlzdC5yZXBsYWNlKG9wLCBuZy5hZHZhbmNlKG9wLmRlbHRhLCBvcC5zb3VyY2VTcGFuKSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBpci5PcEtpbmQuUHJvcGVydHk6XG4gICAgICAgIGlmIChvcC5leHByZXNzaW9uIGluc3RhbmNlb2YgaXIuSW50ZXJwb2xhdGlvbikge1xuICAgICAgICAgIGlyLk9wTGlzdC5yZXBsYWNlKFxuICAgICAgICAgICAgb3AsXG4gICAgICAgICAgICBuZy5wcm9wZXJ0eUludGVycG9sYXRlKFxuICAgICAgICAgICAgICBvcC5uYW1lLFxuICAgICAgICAgICAgICBvcC5leHByZXNzaW9uLnN0cmluZ3MsXG4gICAgICAgICAgICAgIG9wLmV4cHJlc3Npb24uZXhwcmVzc2lvbnMsXG4gICAgICAgICAgICAgIG9wLnNhbml0aXplcixcbiAgICAgICAgICAgICAgb3Auc291cmNlU3BhbixcbiAgICAgICAgICAgICksXG4gICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpci5PcExpc3QucmVwbGFjZShvcCwgbmcucHJvcGVydHkob3AubmFtZSwgb3AuZXhwcmVzc2lvbiwgb3Auc2FuaXRpemVyLCBvcC5zb3VyY2VTcGFuKSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGlyLk9wS2luZC5Ud29XYXlQcm9wZXJ0eTpcbiAgICAgICAgaXIuT3BMaXN0LnJlcGxhY2UoXG4gICAgICAgICAgb3AsXG4gICAgICAgICAgbmcudHdvV2F5UHJvcGVydHkob3AubmFtZSwgb3AuZXhwcmVzc2lvbiwgb3Auc2FuaXRpemVyLCBvcC5zb3VyY2VTcGFuKSxcbiAgICAgICAgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGlyLk9wS2luZC5TdHlsZVByb3A6XG4gICAgICAgIGlmIChvcC5leHByZXNzaW9uIGluc3RhbmNlb2YgaXIuSW50ZXJwb2xhdGlvbikge1xuICAgICAgICAgIGlyLk9wTGlzdC5yZXBsYWNlKFxuICAgICAgICAgICAgb3AsXG4gICAgICAgICAgICBuZy5zdHlsZVByb3BJbnRlcnBvbGF0ZShcbiAgICAgICAgICAgICAgb3AubmFtZSxcbiAgICAgICAgICAgICAgb3AuZXhwcmVzc2lvbi5zdHJpbmdzLFxuICAgICAgICAgICAgICBvcC5leHByZXNzaW9uLmV4cHJlc3Npb25zLFxuICAgICAgICAgICAgICBvcC51bml0LFxuICAgICAgICAgICAgICBvcC5zb3VyY2VTcGFuLFxuICAgICAgICAgICAgKSxcbiAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlyLk9wTGlzdC5yZXBsYWNlKG9wLCBuZy5zdHlsZVByb3Aob3AubmFtZSwgb3AuZXhwcmVzc2lvbiwgb3AudW5pdCwgb3Auc291cmNlU3BhbikpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBpci5PcEtpbmQuQ2xhc3NQcm9wOlxuICAgICAgICBpci5PcExpc3QucmVwbGFjZShvcCwgbmcuY2xhc3NQcm9wKG9wLm5hbWUsIG9wLmV4cHJlc3Npb24sIG9wLnNvdXJjZVNwYW4pKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGlyLk9wS2luZC5TdHlsZU1hcDpcbiAgICAgICAgaWYgKG9wLmV4cHJlc3Npb24gaW5zdGFuY2VvZiBpci5JbnRlcnBvbGF0aW9uKSB7XG4gICAgICAgICAgaXIuT3BMaXN0LnJlcGxhY2UoXG4gICAgICAgICAgICBvcCxcbiAgICAgICAgICAgIG5nLnN0eWxlTWFwSW50ZXJwb2xhdGUob3AuZXhwcmVzc2lvbi5zdHJpbmdzLCBvcC5leHByZXNzaW9uLmV4cHJlc3Npb25zLCBvcC5zb3VyY2VTcGFuKSxcbiAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlyLk9wTGlzdC5yZXBsYWNlKG9wLCBuZy5zdHlsZU1hcChvcC5leHByZXNzaW9uLCBvcC5zb3VyY2VTcGFuKSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGlyLk9wS2luZC5DbGFzc01hcDpcbiAgICAgICAgaWYgKG9wLmV4cHJlc3Npb24gaW5zdGFuY2VvZiBpci5JbnRlcnBvbGF0aW9uKSB7XG4gICAgICAgICAgaXIuT3BMaXN0LnJlcGxhY2UoXG4gICAgICAgICAgICBvcCxcbiAgICAgICAgICAgIG5nLmNsYXNzTWFwSW50ZXJwb2xhdGUob3AuZXhwcmVzc2lvbi5zdHJpbmdzLCBvcC5leHByZXNzaW9uLmV4cHJlc3Npb25zLCBvcC5zb3VyY2VTcGFuKSxcbiAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlyLk9wTGlzdC5yZXBsYWNlKG9wLCBuZy5jbGFzc01hcChvcC5leHByZXNzaW9uLCBvcC5zb3VyY2VTcGFuKSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGlyLk9wS2luZC5JMThuRXhwcmVzc2lvbjpcbiAgICAgICAgaXIuT3BMaXN0LnJlcGxhY2Uob3AsIG5nLmkxOG5FeHAob3AuZXhwcmVzc2lvbiwgb3Auc291cmNlU3BhbikpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgaXIuT3BLaW5kLkkxOG5BcHBseTpcbiAgICAgICAgaXIuT3BMaXN0LnJlcGxhY2Uob3AsIG5nLmkxOG5BcHBseShvcC5oYW5kbGUuc2xvdCEsIG9wLnNvdXJjZVNwYW4pKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGlyLk9wS2luZC5JbnRlcnBvbGF0ZVRleHQ6XG4gICAgICAgIGlyLk9wTGlzdC5yZXBsYWNlKFxuICAgICAgICAgIG9wLFxuICAgICAgICAgIG5nLnRleHRJbnRlcnBvbGF0ZShvcC5pbnRlcnBvbGF0aW9uLnN0cmluZ3MsIG9wLmludGVycG9sYXRpb24uZXhwcmVzc2lvbnMsIG9wLnNvdXJjZVNwYW4pLFxuICAgICAgICApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgaXIuT3BLaW5kLkF0dHJpYnV0ZTpcbiAgICAgICAgaWYgKG9wLmV4cHJlc3Npb24gaW5zdGFuY2VvZiBpci5JbnRlcnBvbGF0aW9uKSB7XG4gICAgICAgICAgaXIuT3BMaXN0LnJlcGxhY2UoXG4gICAgICAgICAgICBvcCxcbiAgICAgICAgICAgIG5nLmF0dHJpYnV0ZUludGVycG9sYXRlKFxuICAgICAgICAgICAgICBvcC5uYW1lLFxuICAgICAgICAgICAgICBvcC5leHByZXNzaW9uLnN0cmluZ3MsXG4gICAgICAgICAgICAgIG9wLmV4cHJlc3Npb24uZXhwcmVzc2lvbnMsXG4gICAgICAgICAgICAgIG9wLnNhbml0aXplcixcbiAgICAgICAgICAgICAgb3Auc291cmNlU3BhbixcbiAgICAgICAgICAgICksXG4gICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpci5PcExpc3QucmVwbGFjZShvcCwgbmcuYXR0cmlidXRlKG9wLm5hbWUsIG9wLmV4cHJlc3Npb24sIG9wLnNhbml0aXplciwgb3AubmFtZXNwYWNlKSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGlyLk9wS2luZC5Ib3N0UHJvcGVydHk6XG4gICAgICAgIGlmIChvcC5leHByZXNzaW9uIGluc3RhbmNlb2YgaXIuSW50ZXJwb2xhdGlvbikge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignbm90IHlldCBoYW5kbGVkJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKG9wLmlzQW5pbWF0aW9uVHJpZ2dlcikge1xuICAgICAgICAgICAgaXIuT3BMaXN0LnJlcGxhY2Uob3AsIG5nLnN5bnRoZXRpY0hvc3RQcm9wZXJ0eShvcC5uYW1lLCBvcC5leHByZXNzaW9uLCBvcC5zb3VyY2VTcGFuKSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlyLk9wTGlzdC5yZXBsYWNlKFxuICAgICAgICAgICAgICBvcCxcbiAgICAgICAgICAgICAgbmcuaG9zdFByb3BlcnR5KG9wLm5hbWUsIG9wLmV4cHJlc3Npb24sIG9wLnNhbml0aXplciwgb3Auc291cmNlU3BhbiksXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgaXIuT3BLaW5kLlZhcmlhYmxlOlxuICAgICAgICBpZiAob3AudmFyaWFibGUubmFtZSA9PT0gbnVsbCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQXNzZXJ0aW9uRXJyb3I6IHVubmFtZWQgdmFyaWFibGUgJHtvcC54cmVmfWApO1xuICAgICAgICB9XG4gICAgICAgIGlyLk9wTGlzdC5yZXBsYWNlPGlyLlVwZGF0ZU9wPihcbiAgICAgICAgICBvcCxcbiAgICAgICAgICBpci5jcmVhdGVTdGF0ZW1lbnRPcChcbiAgICAgICAgICAgIG5ldyBvLkRlY2xhcmVWYXJTdG10KG9wLnZhcmlhYmxlLm5hbWUsIG9wLmluaXRpYWxpemVyLCB1bmRlZmluZWQsIG8uU3RtdE1vZGlmaWVyLkZpbmFsKSxcbiAgICAgICAgICApLFxuICAgICAgICApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgaXIuT3BLaW5kLkNvbmRpdGlvbmFsOlxuICAgICAgICBpZiAob3AucHJvY2Vzc2VkID09PSBudWxsKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb25kaXRpb25hbCB0ZXN0IHdhcyBub3Qgc2V0LmApO1xuICAgICAgICB9XG4gICAgICAgIGlyLk9wTGlzdC5yZXBsYWNlKG9wLCBuZy5jb25kaXRpb25hbChvcC5wcm9jZXNzZWQsIG9wLmNvbnRleHRWYWx1ZSwgb3Auc291cmNlU3BhbikpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgaXIuT3BLaW5kLlJlcGVhdGVyOlxuICAgICAgICBpci5PcExpc3QucmVwbGFjZShvcCwgbmcucmVwZWF0ZXIob3AuY29sbGVjdGlvbiwgb3Auc291cmNlU3BhbikpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgaXIuT3BLaW5kLkRlZmVyV2hlbjpcbiAgICAgICAgaXIuT3BMaXN0LnJlcGxhY2Uob3AsIG5nLmRlZmVyV2hlbihvcC5wcmVmZXRjaCwgb3AuZXhwciwgb3Auc291cmNlU3BhbikpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgaXIuT3BLaW5kLlN0b3JlTGV0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEFzc2VydGlvbkVycm9yOiB1bmV4cGVjdGVkIHN0b3JlTGV0ICR7b3AuZGVjbGFyZWROYW1lfWApO1xuICAgICAgY2FzZSBpci5PcEtpbmQuU3RhdGVtZW50OlxuICAgICAgICAvLyBQYXNzIHN0YXRlbWVudCBvcGVyYXRpb25zIGRpcmVjdGx5IHRocm91Z2guXG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBBc3NlcnRpb25FcnJvcjogVW5zdXBwb3J0ZWQgcmVpZmljYXRpb24gb2YgdXBkYXRlIG9wICR7aXIuT3BLaW5kW29wLmtpbmRdfWAsXG4gICAgICAgICk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHJlaWZ5SXJFeHByZXNzaW9uKGV4cHI6IG8uRXhwcmVzc2lvbik6IG8uRXhwcmVzc2lvbiB7XG4gIGlmICghaXIuaXNJckV4cHJlc3Npb24oZXhwcikpIHtcbiAgICByZXR1cm4gZXhwcjtcbiAgfVxuXG4gIHN3aXRjaCAoZXhwci5raW5kKSB7XG4gICAgY2FzZSBpci5FeHByZXNzaW9uS2luZC5OZXh0Q29udGV4dDpcbiAgICAgIHJldHVybiBuZy5uZXh0Q29udGV4dChleHByLnN0ZXBzKTtcbiAgICBjYXNlIGlyLkV4cHJlc3Npb25LaW5kLlJlZmVyZW5jZTpcbiAgICAgIHJldHVybiBuZy5yZWZlcmVuY2UoZXhwci50YXJnZXRTbG90LnNsb3QhICsgMSArIGV4cHIub2Zmc2V0KTtcbiAgICBjYXNlIGlyLkV4cHJlc3Npb25LaW5kLkxleGljYWxSZWFkOlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBBc3NlcnRpb25FcnJvcjogdW5yZXNvbHZlZCBMZXhpY2FsUmVhZCBvZiAke2V4cHIubmFtZX1gKTtcbiAgICBjYXNlIGlyLkV4cHJlc3Npb25LaW5kLlR3b1dheUJpbmRpbmdTZXQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEFzc2VydGlvbkVycm9yOiB1bnJlc29sdmVkIFR3b1dheUJpbmRpbmdTZXRgKTtcbiAgICBjYXNlIGlyLkV4cHJlc3Npb25LaW5kLlJlc3RvcmVWaWV3OlxuICAgICAgaWYgKHR5cGVvZiBleHByLnZpZXcgPT09ICdudW1iZXInKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgQXNzZXJ0aW9uRXJyb3I6IHVucmVzb2x2ZWQgUmVzdG9yZVZpZXdgKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZy5yZXN0b3JlVmlldyhleHByLnZpZXcpO1xuICAgIGNhc2UgaXIuRXhwcmVzc2lvbktpbmQuUmVzZXRWaWV3OlxuICAgICAgcmV0dXJuIG5nLnJlc2V0VmlldyhleHByLmV4cHIpO1xuICAgIGNhc2UgaXIuRXhwcmVzc2lvbktpbmQuR2V0Q3VycmVudFZpZXc6XG4gICAgICByZXR1cm4gbmcuZ2V0Q3VycmVudFZpZXcoKTtcbiAgICBjYXNlIGlyLkV4cHJlc3Npb25LaW5kLlJlYWRWYXJpYWJsZTpcbiAgICAgIGlmIChleHByLm5hbWUgPT09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBSZWFkIG9mIHVubmFtZWQgdmFyaWFibGUgJHtleHByLnhyZWZ9YCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gby52YXJpYWJsZShleHByLm5hbWUpO1xuICAgIGNhc2UgaXIuRXhwcmVzc2lvbktpbmQuUmVhZFRlbXBvcmFyeUV4cHI6XG4gICAgICBpZiAoZXhwci5uYW1lID09PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgUmVhZCBvZiB1bm5hbWVkIHRlbXBvcmFyeSAke2V4cHIueHJlZn1gKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvLnZhcmlhYmxlKGV4cHIubmFtZSk7XG4gICAgY2FzZSBpci5FeHByZXNzaW9uS2luZC5Bc3NpZ25UZW1wb3JhcnlFeHByOlxuICAgICAgaWYgKGV4cHIubmFtZSA9PT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEFzc2lnbiBvZiB1bm5hbWVkIHRlbXBvcmFyeSAke2V4cHIueHJlZn1gKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvLnZhcmlhYmxlKGV4cHIubmFtZSkuc2V0KGV4cHIuZXhwcik7XG4gICAgY2FzZSBpci5FeHByZXNzaW9uS2luZC5QdXJlRnVuY3Rpb25FeHByOlxuICAgICAgaWYgKGV4cHIuZm4gPT09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBBc3NlcnRpb25FcnJvcjogZXhwZWN0ZWQgUHVyZUZ1bmN0aW9ucyB0byBoYXZlIGJlZW4gZXh0cmFjdGVkYCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmcucHVyZUZ1bmN0aW9uKGV4cHIudmFyT2Zmc2V0ISwgZXhwci5mbiwgZXhwci5hcmdzKTtcbiAgICBjYXNlIGlyLkV4cHJlc3Npb25LaW5kLlB1cmVGdW5jdGlvblBhcmFtZXRlckV4cHI6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEFzc2VydGlvbkVycm9yOiBleHBlY3RlZCBQdXJlRnVuY3Rpb25QYXJhbWV0ZXJFeHByIHRvIGhhdmUgYmVlbiBleHRyYWN0ZWRgKTtcbiAgICBjYXNlIGlyLkV4cHJlc3Npb25LaW5kLlBpcGVCaW5kaW5nOlxuICAgICAgcmV0dXJuIG5nLnBpcGVCaW5kKGV4cHIudGFyZ2V0U2xvdC5zbG90ISwgZXhwci52YXJPZmZzZXQhLCBleHByLmFyZ3MpO1xuICAgIGNhc2UgaXIuRXhwcmVzc2lvbktpbmQuUGlwZUJpbmRpbmdWYXJpYWRpYzpcbiAgICAgIHJldHVybiBuZy5waXBlQmluZFYoZXhwci50YXJnZXRTbG90LnNsb3QhLCBleHByLnZhck9mZnNldCEsIGV4cHIuYXJncyk7XG4gICAgY2FzZSBpci5FeHByZXNzaW9uS2luZC5TbG90TGl0ZXJhbEV4cHI6XG4gICAgICByZXR1cm4gby5saXRlcmFsKGV4cHIuc2xvdC5zbG90ISk7XG4gICAgY2FzZSBpci5FeHByZXNzaW9uS2luZC5Db250ZXh0TGV0UmVmZXJlbmNlOlxuICAgICAgcmV0dXJuIG5nLnJlYWRDb250ZXh0TGV0KGV4cHIudGFyZ2V0U2xvdC5zbG90ISk7XG4gICAgY2FzZSBpci5FeHByZXNzaW9uS2luZC5TdG9yZUxldDpcbiAgICAgIHJldHVybiBuZy5zdG9yZUxldChleHByLnZhbHVlLCBleHByLnNvdXJjZVNwYW4pO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBBc3NlcnRpb25FcnJvcjogVW5zdXBwb3J0ZWQgcmVpZmljYXRpb24gb2YgaXIuRXhwcmVzc2lvbiBraW5kOiAke1xuICAgICAgICAgIGlyLkV4cHJlc3Npb25LaW5kWyhleHByIGFzIGlyLkV4cHJlc3Npb24pLmtpbmRdXG4gICAgICAgIH1gLFxuICAgICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIExpc3RlbmVycyBnZXQgdHVybmVkIGludG8gYSBmdW5jdGlvbiBleHByZXNzaW9uLCB3aGljaCBtYXkgb3IgbWF5IG5vdCBoYXZlIHRoZSBgJGV2ZW50YFxuICogcGFyYW1ldGVyIGRlZmluZWQuXG4gKi9cbmZ1bmN0aW9uIHJlaWZ5TGlzdGVuZXJIYW5kbGVyKFxuICB1bml0OiBDb21waWxhdGlvblVuaXQsXG4gIG5hbWU6IHN0cmluZyxcbiAgaGFuZGxlck9wczogaXIuT3BMaXN0PGlyLlVwZGF0ZU9wPixcbiAgY29uc3VtZXNEb2xsYXJFdmVudDogYm9vbGVhbixcbik6IG8uRnVuY3Rpb25FeHByIHtcbiAgLy8gRmlyc3QsIHJlaWZ5IGFsbCBpbnN0cnVjdGlvbiBjYWxscyB3aXRoaW4gYGhhbmRsZXJPcHNgLlxuICByZWlmeVVwZGF0ZU9wZXJhdGlvbnModW5pdCwgaGFuZGxlck9wcyk7XG5cbiAgLy8gTmV4dCwgZXh0cmFjdCBhbGwgdGhlIGBvLlN0YXRlbWVudGBzIGZyb20gdGhlIHJlaWZpZWQgb3BlcmF0aW9ucy4gV2UgY2FuIGV4cGVjdCB0aGF0IGF0IHRoaXNcbiAgLy8gcG9pbnQsIGFsbCBvcGVyYXRpb25zIGhhdmUgYmVlbiBjb252ZXJ0ZWQgdG8gc3RhdGVtZW50cy5cbiAgY29uc3QgaGFuZGxlclN0bXRzOiBvLlN0YXRlbWVudFtdID0gW107XG4gIGZvciAoY29uc3Qgb3Agb2YgaGFuZGxlck9wcykge1xuICAgIGlmIChvcC5raW5kICE9PSBpci5PcEtpbmQuU3RhdGVtZW50KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBBc3NlcnRpb25FcnJvcjogZXhwZWN0ZWQgcmVpZmllZCBzdGF0ZW1lbnRzLCBidXQgZm91bmQgb3AgJHtpci5PcEtpbmRbb3Aua2luZF19YCxcbiAgICAgICk7XG4gICAgfVxuICAgIGhhbmRsZXJTdG10cy5wdXNoKG9wLnN0YXRlbWVudCk7XG4gIH1cblxuICAvLyBJZiBgJGV2ZW50YCBpcyByZWZlcmVuY2VkLCB3ZSBuZWVkIHRvIGdlbmVyYXRlIGl0IGFzIGEgcGFyYW1ldGVyLlxuICBjb25zdCBwYXJhbXM6IG8uRm5QYXJhbVtdID0gW107XG4gIGlmIChjb25zdW1lc0RvbGxhckV2ZW50KSB7XG4gICAgLy8gV2UgbmVlZCB0aGUgYCRldmVudGAgcGFyYW1ldGVyLlxuICAgIHBhcmFtcy5wdXNoKG5ldyBvLkZuUGFyYW0oJyRldmVudCcpKTtcbiAgfVxuXG4gIHJldHVybiBvLmZuKHBhcmFtcywgaGFuZGxlclN0bXRzLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgbmFtZSk7XG59XG4iXX0=