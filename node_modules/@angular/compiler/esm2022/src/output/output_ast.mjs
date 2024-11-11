/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { computeMsgId } from '../i18n/digest';
//// Types
export var TypeModifier;
(function (TypeModifier) {
    TypeModifier[TypeModifier["None"] = 0] = "None";
    TypeModifier[TypeModifier["Const"] = 1] = "Const";
})(TypeModifier || (TypeModifier = {}));
export class Type {
    constructor(modifiers = TypeModifier.None) {
        this.modifiers = modifiers;
    }
    hasModifier(modifier) {
        return (this.modifiers & modifier) !== 0;
    }
}
export var BuiltinTypeName;
(function (BuiltinTypeName) {
    BuiltinTypeName[BuiltinTypeName["Dynamic"] = 0] = "Dynamic";
    BuiltinTypeName[BuiltinTypeName["Bool"] = 1] = "Bool";
    BuiltinTypeName[BuiltinTypeName["String"] = 2] = "String";
    BuiltinTypeName[BuiltinTypeName["Int"] = 3] = "Int";
    BuiltinTypeName[BuiltinTypeName["Number"] = 4] = "Number";
    BuiltinTypeName[BuiltinTypeName["Function"] = 5] = "Function";
    BuiltinTypeName[BuiltinTypeName["Inferred"] = 6] = "Inferred";
    BuiltinTypeName[BuiltinTypeName["None"] = 7] = "None";
})(BuiltinTypeName || (BuiltinTypeName = {}));
export class BuiltinType extends Type {
    constructor(name, modifiers) {
        super(modifiers);
        this.name = name;
    }
    visitType(visitor, context) {
        return visitor.visitBuiltinType(this, context);
    }
}
export class ExpressionType extends Type {
    constructor(value, modifiers, typeParams = null) {
        super(modifiers);
        this.value = value;
        this.typeParams = typeParams;
    }
    visitType(visitor, context) {
        return visitor.visitExpressionType(this, context);
    }
}
export class ArrayType extends Type {
    constructor(of, modifiers) {
        super(modifiers);
        this.of = of;
    }
    visitType(visitor, context) {
        return visitor.visitArrayType(this, context);
    }
}
export class MapType extends Type {
    constructor(valueType, modifiers) {
        super(modifiers);
        this.valueType = valueType || null;
    }
    visitType(visitor, context) {
        return visitor.visitMapType(this, context);
    }
}
export class TransplantedType extends Type {
    constructor(type, modifiers) {
        super(modifiers);
        this.type = type;
    }
    visitType(visitor, context) {
        return visitor.visitTransplantedType(this, context);
    }
}
export const DYNAMIC_TYPE = new BuiltinType(BuiltinTypeName.Dynamic);
export const INFERRED_TYPE = new BuiltinType(BuiltinTypeName.Inferred);
export const BOOL_TYPE = new BuiltinType(BuiltinTypeName.Bool);
export const INT_TYPE = new BuiltinType(BuiltinTypeName.Int);
export const NUMBER_TYPE = new BuiltinType(BuiltinTypeName.Number);
export const STRING_TYPE = new BuiltinType(BuiltinTypeName.String);
export const FUNCTION_TYPE = new BuiltinType(BuiltinTypeName.Function);
export const NONE_TYPE = new BuiltinType(BuiltinTypeName.None);
///// Expressions
export var UnaryOperator;
(function (UnaryOperator) {
    UnaryOperator[UnaryOperator["Minus"] = 0] = "Minus";
    UnaryOperator[UnaryOperator["Plus"] = 1] = "Plus";
})(UnaryOperator || (UnaryOperator = {}));
export var BinaryOperator;
(function (BinaryOperator) {
    BinaryOperator[BinaryOperator["Equals"] = 0] = "Equals";
    BinaryOperator[BinaryOperator["NotEquals"] = 1] = "NotEquals";
    BinaryOperator[BinaryOperator["Identical"] = 2] = "Identical";
    BinaryOperator[BinaryOperator["NotIdentical"] = 3] = "NotIdentical";
    BinaryOperator[BinaryOperator["Minus"] = 4] = "Minus";
    BinaryOperator[BinaryOperator["Plus"] = 5] = "Plus";
    BinaryOperator[BinaryOperator["Divide"] = 6] = "Divide";
    BinaryOperator[BinaryOperator["Multiply"] = 7] = "Multiply";
    BinaryOperator[BinaryOperator["Modulo"] = 8] = "Modulo";
    BinaryOperator[BinaryOperator["And"] = 9] = "And";
    BinaryOperator[BinaryOperator["Or"] = 10] = "Or";
    BinaryOperator[BinaryOperator["BitwiseOr"] = 11] = "BitwiseOr";
    BinaryOperator[BinaryOperator["BitwiseAnd"] = 12] = "BitwiseAnd";
    BinaryOperator[BinaryOperator["Lower"] = 13] = "Lower";
    BinaryOperator[BinaryOperator["LowerEquals"] = 14] = "LowerEquals";
    BinaryOperator[BinaryOperator["Bigger"] = 15] = "Bigger";
    BinaryOperator[BinaryOperator["BiggerEquals"] = 16] = "BiggerEquals";
    BinaryOperator[BinaryOperator["NullishCoalesce"] = 17] = "NullishCoalesce";
})(BinaryOperator || (BinaryOperator = {}));
export function nullSafeIsEquivalent(base, other) {
    if (base == null || other == null) {
        return base == other;
    }
    return base.isEquivalent(other);
}
function areAllEquivalentPredicate(base, other, equivalentPredicate) {
    const len = base.length;
    if (len !== other.length) {
        return false;
    }
    for (let i = 0; i < len; i++) {
        if (!equivalentPredicate(base[i], other[i])) {
            return false;
        }
    }
    return true;
}
export function areAllEquivalent(base, other) {
    return areAllEquivalentPredicate(base, other, (baseElement, otherElement) => baseElement.isEquivalent(otherElement));
}
export class Expression {
    constructor(type, sourceSpan) {
        this.type = type || null;
        this.sourceSpan = sourceSpan || null;
    }
    prop(name, sourceSpan) {
        return new ReadPropExpr(this, name, null, sourceSpan);
    }
    key(index, type, sourceSpan) {
        return new ReadKeyExpr(this, index, type, sourceSpan);
    }
    callFn(params, sourceSpan, pure) {
        return new InvokeFunctionExpr(this, params, null, sourceSpan, pure);
    }
    instantiate(params, type, sourceSpan) {
        return new InstantiateExpr(this, params, type, sourceSpan);
    }
    conditional(trueCase, falseCase = null, sourceSpan) {
        return new ConditionalExpr(this, trueCase, falseCase, null, sourceSpan);
    }
    equals(rhs, sourceSpan) {
        return new BinaryOperatorExpr(BinaryOperator.Equals, this, rhs, null, sourceSpan);
    }
    notEquals(rhs, sourceSpan) {
        return new BinaryOperatorExpr(BinaryOperator.NotEquals, this, rhs, null, sourceSpan);
    }
    identical(rhs, sourceSpan) {
        return new BinaryOperatorExpr(BinaryOperator.Identical, this, rhs, null, sourceSpan);
    }
    notIdentical(rhs, sourceSpan) {
        return new BinaryOperatorExpr(BinaryOperator.NotIdentical, this, rhs, null, sourceSpan);
    }
    minus(rhs, sourceSpan) {
        return new BinaryOperatorExpr(BinaryOperator.Minus, this, rhs, null, sourceSpan);
    }
    plus(rhs, sourceSpan) {
        return new BinaryOperatorExpr(BinaryOperator.Plus, this, rhs, null, sourceSpan);
    }
    divide(rhs, sourceSpan) {
        return new BinaryOperatorExpr(BinaryOperator.Divide, this, rhs, null, sourceSpan);
    }
    multiply(rhs, sourceSpan) {
        return new BinaryOperatorExpr(BinaryOperator.Multiply, this, rhs, null, sourceSpan);
    }
    modulo(rhs, sourceSpan) {
        return new BinaryOperatorExpr(BinaryOperator.Modulo, this, rhs, null, sourceSpan);
    }
    and(rhs, sourceSpan) {
        return new BinaryOperatorExpr(BinaryOperator.And, this, rhs, null, sourceSpan);
    }
    bitwiseOr(rhs, sourceSpan, parens = true) {
        return new BinaryOperatorExpr(BinaryOperator.BitwiseOr, this, rhs, null, sourceSpan, parens);
    }
    bitwiseAnd(rhs, sourceSpan, parens = true) {
        return new BinaryOperatorExpr(BinaryOperator.BitwiseAnd, this, rhs, null, sourceSpan, parens);
    }
    or(rhs, sourceSpan) {
        return new BinaryOperatorExpr(BinaryOperator.Or, this, rhs, null, sourceSpan);
    }
    lower(rhs, sourceSpan) {
        return new BinaryOperatorExpr(BinaryOperator.Lower, this, rhs, null, sourceSpan);
    }
    lowerEquals(rhs, sourceSpan) {
        return new BinaryOperatorExpr(BinaryOperator.LowerEquals, this, rhs, null, sourceSpan);
    }
    bigger(rhs, sourceSpan) {
        return new BinaryOperatorExpr(BinaryOperator.Bigger, this, rhs, null, sourceSpan);
    }
    biggerEquals(rhs, sourceSpan) {
        return new BinaryOperatorExpr(BinaryOperator.BiggerEquals, this, rhs, null, sourceSpan);
    }
    isBlank(sourceSpan) {
        // Note: We use equals by purpose here to compare to null and undefined in JS.
        // We use the typed null to allow strictNullChecks to narrow types.
        return this.equals(TYPED_NULL_EXPR, sourceSpan);
    }
    nullishCoalesce(rhs, sourceSpan) {
        return new BinaryOperatorExpr(BinaryOperator.NullishCoalesce, this, rhs, null, sourceSpan);
    }
    toStmt() {
        return new ExpressionStatement(this, null);
    }
}
export class ReadVarExpr extends Expression {
    constructor(name, type, sourceSpan) {
        super(type, sourceSpan);
        this.name = name;
    }
    isEquivalent(e) {
        return e instanceof ReadVarExpr && this.name === e.name;
    }
    isConstant() {
        return false;
    }
    visitExpression(visitor, context) {
        return visitor.visitReadVarExpr(this, context);
    }
    clone() {
        return new ReadVarExpr(this.name, this.type, this.sourceSpan);
    }
    set(value) {
        return new WriteVarExpr(this.name, value, null, this.sourceSpan);
    }
}
export class TypeofExpr extends Expression {
    constructor(expr, type, sourceSpan) {
        super(type, sourceSpan);
        this.expr = expr;
    }
    visitExpression(visitor, context) {
        return visitor.visitTypeofExpr(this, context);
    }
    isEquivalent(e) {
        return e instanceof TypeofExpr && e.expr.isEquivalent(this.expr);
    }
    isConstant() {
        return this.expr.isConstant();
    }
    clone() {
        return new TypeofExpr(this.expr.clone());
    }
}
export class WrappedNodeExpr extends Expression {
    constructor(node, type, sourceSpan) {
        super(type, sourceSpan);
        this.node = node;
    }
    isEquivalent(e) {
        return e instanceof WrappedNodeExpr && this.node === e.node;
    }
    isConstant() {
        return false;
    }
    visitExpression(visitor, context) {
        return visitor.visitWrappedNodeExpr(this, context);
    }
    clone() {
        return new WrappedNodeExpr(this.node, this.type, this.sourceSpan);
    }
}
export class WriteVarExpr extends Expression {
    constructor(name, value, type, sourceSpan) {
        super(type || value.type, sourceSpan);
        this.name = name;
        this.value = value;
    }
    isEquivalent(e) {
        return e instanceof WriteVarExpr && this.name === e.name && this.value.isEquivalent(e.value);
    }
    isConstant() {
        return false;
    }
    visitExpression(visitor, context) {
        return visitor.visitWriteVarExpr(this, context);
    }
    clone() {
        return new WriteVarExpr(this.name, this.value.clone(), this.type, this.sourceSpan);
    }
    toDeclStmt(type, modifiers) {
        return new DeclareVarStmt(this.name, this.value, type, modifiers, this.sourceSpan);
    }
    toConstDecl() {
        return this.toDeclStmt(INFERRED_TYPE, StmtModifier.Final);
    }
}
export class WriteKeyExpr extends Expression {
    constructor(receiver, index, value, type, sourceSpan) {
        super(type || value.type, sourceSpan);
        this.receiver = receiver;
        this.index = index;
        this.value = value;
    }
    isEquivalent(e) {
        return (e instanceof WriteKeyExpr &&
            this.receiver.isEquivalent(e.receiver) &&
            this.index.isEquivalent(e.index) &&
            this.value.isEquivalent(e.value));
    }
    isConstant() {
        return false;
    }
    visitExpression(visitor, context) {
        return visitor.visitWriteKeyExpr(this, context);
    }
    clone() {
        return new WriteKeyExpr(this.receiver.clone(), this.index.clone(), this.value.clone(), this.type, this.sourceSpan);
    }
}
export class WritePropExpr extends Expression {
    constructor(receiver, name, value, type, sourceSpan) {
        super(type || value.type, sourceSpan);
        this.receiver = receiver;
        this.name = name;
        this.value = value;
    }
    isEquivalent(e) {
        return (e instanceof WritePropExpr &&
            this.receiver.isEquivalent(e.receiver) &&
            this.name === e.name &&
            this.value.isEquivalent(e.value));
    }
    isConstant() {
        return false;
    }
    visitExpression(visitor, context) {
        return visitor.visitWritePropExpr(this, context);
    }
    clone() {
        return new WritePropExpr(this.receiver.clone(), this.name, this.value.clone(), this.type, this.sourceSpan);
    }
}
export class InvokeFunctionExpr extends Expression {
    constructor(fn, args, type, sourceSpan, pure = false) {
        super(type, sourceSpan);
        this.fn = fn;
        this.args = args;
        this.pure = pure;
    }
    // An alias for fn, which allows other logic to handle calls and property reads together.
    get receiver() {
        return this.fn;
    }
    isEquivalent(e) {
        return (e instanceof InvokeFunctionExpr &&
            this.fn.isEquivalent(e.fn) &&
            areAllEquivalent(this.args, e.args) &&
            this.pure === e.pure);
    }
    isConstant() {
        return false;
    }
    visitExpression(visitor, context) {
        return visitor.visitInvokeFunctionExpr(this, context);
    }
    clone() {
        return new InvokeFunctionExpr(this.fn.clone(), this.args.map((arg) => arg.clone()), this.type, this.sourceSpan, this.pure);
    }
}
export class TaggedTemplateExpr extends Expression {
    constructor(tag, template, type, sourceSpan) {
        super(type, sourceSpan);
        this.tag = tag;
        this.template = template;
    }
    isEquivalent(e) {
        return (e instanceof TaggedTemplateExpr &&
            this.tag.isEquivalent(e.tag) &&
            areAllEquivalentPredicate(this.template.elements, e.template.elements, (a, b) => a.text === b.text) &&
            areAllEquivalent(this.template.expressions, e.template.expressions));
    }
    isConstant() {
        return false;
    }
    visitExpression(visitor, context) {
        return visitor.visitTaggedTemplateExpr(this, context);
    }
    clone() {
        return new TaggedTemplateExpr(this.tag.clone(), this.template.clone(), this.type, this.sourceSpan);
    }
}
export class InstantiateExpr extends Expression {
    constructor(classExpr, args, type, sourceSpan) {
        super(type, sourceSpan);
        this.classExpr = classExpr;
        this.args = args;
    }
    isEquivalent(e) {
        return (e instanceof InstantiateExpr &&
            this.classExpr.isEquivalent(e.classExpr) &&
            areAllEquivalent(this.args, e.args));
    }
    isConstant() {
        return false;
    }
    visitExpression(visitor, context) {
        return visitor.visitInstantiateExpr(this, context);
    }
    clone() {
        return new InstantiateExpr(this.classExpr.clone(), this.args.map((arg) => arg.clone()), this.type, this.sourceSpan);
    }
}
export class LiteralExpr extends Expression {
    constructor(value, type, sourceSpan) {
        super(type, sourceSpan);
        this.value = value;
    }
    isEquivalent(e) {
        return e instanceof LiteralExpr && this.value === e.value;
    }
    isConstant() {
        return true;
    }
    visitExpression(visitor, context) {
        return visitor.visitLiteralExpr(this, context);
    }
    clone() {
        return new LiteralExpr(this.value, this.type, this.sourceSpan);
    }
}
export class TemplateLiteral {
    constructor(elements, expressions) {
        this.elements = elements;
        this.expressions = expressions;
    }
    clone() {
        return new TemplateLiteral(this.elements.map((el) => el.clone()), this.expressions.map((expr) => expr.clone()));
    }
}
export class TemplateLiteralElement {
    constructor(text, sourceSpan, rawText) {
        this.text = text;
        this.sourceSpan = sourceSpan;
        // If `rawText` is not provided, try to extract the raw string from its
        // associated `sourceSpan`. If that is also not available, "fake" the raw
        // string instead by escaping the following control sequences:
        // - "\" would otherwise indicate that the next character is a control character.
        // - "`" and "${" are template string control sequences that would otherwise prematurely
        // indicate the end of the template literal element.
        this.rawText =
            rawText ?? sourceSpan?.toString() ?? escapeForTemplateLiteral(escapeSlashes(text));
    }
    clone() {
        return new TemplateLiteralElement(this.text, this.sourceSpan, this.rawText);
    }
}
export class LiteralPiece {
    constructor(text, sourceSpan) {
        this.text = text;
        this.sourceSpan = sourceSpan;
    }
}
export class PlaceholderPiece {
    /**
     * Create a new instance of a `PlaceholderPiece`.
     *
     * @param text the name of this placeholder (e.g. `PH_1`).
     * @param sourceSpan the location of this placeholder in its localized message the source code.
     * @param associatedMessage reference to another message that this placeholder is associated with.
     * The `associatedMessage` is mainly used to provide a relationship to an ICU message that has
     * been extracted out from the message containing the placeholder.
     */
    constructor(text, sourceSpan, associatedMessage) {
        this.text = text;
        this.sourceSpan = sourceSpan;
        this.associatedMessage = associatedMessage;
    }
}
const MEANING_SEPARATOR = '|';
const ID_SEPARATOR = '@@';
const LEGACY_ID_INDICATOR = '␟';
export class LocalizedString extends Expression {
    constructor(metaBlock, messageParts, placeHolderNames, expressions, sourceSpan) {
        super(STRING_TYPE, sourceSpan);
        this.metaBlock = metaBlock;
        this.messageParts = messageParts;
        this.placeHolderNames = placeHolderNames;
        this.expressions = expressions;
    }
    isEquivalent(e) {
        // return e instanceof LocalizedString && this.message === e.message;
        return false;
    }
    isConstant() {
        return false;
    }
    visitExpression(visitor, context) {
        return visitor.visitLocalizedString(this, context);
    }
    clone() {
        return new LocalizedString(this.metaBlock, this.messageParts, this.placeHolderNames, this.expressions.map((expr) => expr.clone()), this.sourceSpan);
    }
    /**
     * Serialize the given `meta` and `messagePart` into "cooked" and "raw" strings that can be used
     * in a `$localize` tagged string. The format of the metadata is the same as that parsed by
     * `parseI18nMeta()`.
     *
     * @param meta The metadata to serialize
     * @param messagePart The first part of the tagged string
     */
    serializeI18nHead() {
        let metaBlock = this.metaBlock.description || '';
        if (this.metaBlock.meaning) {
            metaBlock = `${this.metaBlock.meaning}${MEANING_SEPARATOR}${metaBlock}`;
        }
        if (this.metaBlock.customId) {
            metaBlock = `${metaBlock}${ID_SEPARATOR}${this.metaBlock.customId}`;
        }
        if (this.metaBlock.legacyIds) {
            this.metaBlock.legacyIds.forEach((legacyId) => {
                metaBlock = `${metaBlock}${LEGACY_ID_INDICATOR}${legacyId}`;
            });
        }
        return createCookedRawString(metaBlock, this.messageParts[0].text, this.getMessagePartSourceSpan(0));
    }
    getMessagePartSourceSpan(i) {
        return this.messageParts[i]?.sourceSpan ?? this.sourceSpan;
    }
    getPlaceholderSourceSpan(i) {
        return (this.placeHolderNames[i]?.sourceSpan ?? this.expressions[i]?.sourceSpan ?? this.sourceSpan);
    }
    /**
     * Serialize the given `placeholderName` and `messagePart` into "cooked" and "raw" strings that
     * can be used in a `$localize` tagged string.
     *
     * The format is `:<placeholder-name>[@@<associated-id>]:`.
     *
     * The `associated-id` is the message id of the (usually an ICU) message to which this placeholder
     * refers.
     *
     * @param partIndex The index of the message part to serialize.
     */
    serializeI18nTemplatePart(partIndex) {
        const placeholder = this.placeHolderNames[partIndex - 1];
        const messagePart = this.messageParts[partIndex];
        let metaBlock = placeholder.text;
        if (placeholder.associatedMessage?.legacyIds.length === 0) {
            metaBlock += `${ID_SEPARATOR}${computeMsgId(placeholder.associatedMessage.messageString, placeholder.associatedMessage.meaning)}`;
        }
        return createCookedRawString(metaBlock, messagePart.text, this.getMessagePartSourceSpan(partIndex));
    }
}
const escapeSlashes = (str) => str.replace(/\\/g, '\\\\');
const escapeStartingColon = (str) => str.replace(/^:/, '\\:');
const escapeColons = (str) => str.replace(/:/g, '\\:');
const escapeForTemplateLiteral = (str) => str.replace(/`/g, '\\`').replace(/\${/g, '$\\{');
/**
 * Creates a `{cooked, raw}` object from the `metaBlock` and `messagePart`.
 *
 * The `raw` text must have various character sequences escaped:
 * * "\" would otherwise indicate that the next character is a control character.
 * * "`" and "${" are template string control sequences that would otherwise prematurely indicate
 *   the end of a message part.
 * * ":" inside a metablock would prematurely indicate the end of the metablock.
 * * ":" at the start of a messagePart with no metablock would erroneously indicate the start of a
 *   metablock.
 *
 * @param metaBlock Any metadata that should be prepended to the string
 * @param messagePart The message part of the string
 */
function createCookedRawString(metaBlock, messagePart, range) {
    if (metaBlock === '') {
        return {
            cooked: messagePart,
            raw: escapeForTemplateLiteral(escapeStartingColon(escapeSlashes(messagePart))),
            range,
        };
    }
    else {
        return {
            cooked: `:${metaBlock}:${messagePart}`,
            raw: escapeForTemplateLiteral(`:${escapeColons(escapeSlashes(metaBlock))}:${escapeSlashes(messagePart)}`),
            range,
        };
    }
}
export class ExternalExpr extends Expression {
    constructor(value, type, typeParams = null, sourceSpan) {
        super(type, sourceSpan);
        this.value = value;
        this.typeParams = typeParams;
    }
    isEquivalent(e) {
        return (e instanceof ExternalExpr &&
            this.value.name === e.value.name &&
            this.value.moduleName === e.value.moduleName &&
            this.value.runtime === e.value.runtime);
    }
    isConstant() {
        return false;
    }
    visitExpression(visitor, context) {
        return visitor.visitExternalExpr(this, context);
    }
    clone() {
        return new ExternalExpr(this.value, this.type, this.typeParams, this.sourceSpan);
    }
}
export class ExternalReference {
    constructor(moduleName, name, runtime) {
        this.moduleName = moduleName;
        this.name = name;
        this.runtime = runtime;
    }
}
export class ConditionalExpr extends Expression {
    constructor(condition, trueCase, falseCase = null, type, sourceSpan) {
        super(type || trueCase.type, sourceSpan);
        this.condition = condition;
        this.falseCase = falseCase;
        this.trueCase = trueCase;
    }
    isEquivalent(e) {
        return (e instanceof ConditionalExpr &&
            this.condition.isEquivalent(e.condition) &&
            this.trueCase.isEquivalent(e.trueCase) &&
            nullSafeIsEquivalent(this.falseCase, e.falseCase));
    }
    isConstant() {
        return false;
    }
    visitExpression(visitor, context) {
        return visitor.visitConditionalExpr(this, context);
    }
    clone() {
        return new ConditionalExpr(this.condition.clone(), this.trueCase.clone(), this.falseCase?.clone(), this.type, this.sourceSpan);
    }
}
export class DynamicImportExpr extends Expression {
    constructor(url, sourceSpan) {
        super(null, sourceSpan);
        this.url = url;
    }
    isEquivalent(e) {
        return e instanceof DynamicImportExpr && this.url === e.url;
    }
    isConstant() {
        return false;
    }
    visitExpression(visitor, context) {
        return visitor.visitDynamicImportExpr(this, context);
    }
    clone() {
        return new DynamicImportExpr(this.url, this.sourceSpan);
    }
}
export class NotExpr extends Expression {
    constructor(condition, sourceSpan) {
        super(BOOL_TYPE, sourceSpan);
        this.condition = condition;
    }
    isEquivalent(e) {
        return e instanceof NotExpr && this.condition.isEquivalent(e.condition);
    }
    isConstant() {
        return false;
    }
    visitExpression(visitor, context) {
        return visitor.visitNotExpr(this, context);
    }
    clone() {
        return new NotExpr(this.condition.clone(), this.sourceSpan);
    }
}
export class FnParam {
    constructor(name, type = null) {
        this.name = name;
        this.type = type;
    }
    isEquivalent(param) {
        return this.name === param.name;
    }
    clone() {
        return new FnParam(this.name, this.type);
    }
}
export class FunctionExpr extends Expression {
    constructor(params, statements, type, sourceSpan, name) {
        super(type, sourceSpan);
        this.params = params;
        this.statements = statements;
        this.name = name;
    }
    isEquivalent(e) {
        return ((e instanceof FunctionExpr || e instanceof DeclareFunctionStmt) &&
            areAllEquivalent(this.params, e.params) &&
            areAllEquivalent(this.statements, e.statements));
    }
    isConstant() {
        return false;
    }
    visitExpression(visitor, context) {
        return visitor.visitFunctionExpr(this, context);
    }
    toDeclStmt(name, modifiers) {
        return new DeclareFunctionStmt(name, this.params, this.statements, this.type, modifiers, this.sourceSpan);
    }
    clone() {
        // TODO: Should we deep clone statements?
        return new FunctionExpr(this.params.map((p) => p.clone()), this.statements, this.type, this.sourceSpan, this.name);
    }
}
export class ArrowFunctionExpr extends Expression {
    // Note that `body: Expression` represents `() => expr` whereas
    // `body: Statement[]` represents `() => { expr }`.
    constructor(params, body, type, sourceSpan) {
        super(type, sourceSpan);
        this.params = params;
        this.body = body;
    }
    isEquivalent(e) {
        if (!(e instanceof ArrowFunctionExpr) || !areAllEquivalent(this.params, e.params)) {
            return false;
        }
        if (this.body instanceof Expression && e.body instanceof Expression) {
            return this.body.isEquivalent(e.body);
        }
        if (Array.isArray(this.body) && Array.isArray(e.body)) {
            return areAllEquivalent(this.body, e.body);
        }
        return false;
    }
    isConstant() {
        return false;
    }
    visitExpression(visitor, context) {
        return visitor.visitArrowFunctionExpr(this, context);
    }
    clone() {
        // TODO: Should we deep clone statements?
        return new ArrowFunctionExpr(this.params.map((p) => p.clone()), Array.isArray(this.body) ? this.body : this.body.clone(), this.type, this.sourceSpan);
    }
    toDeclStmt(name, modifiers) {
        return new DeclareVarStmt(name, this, INFERRED_TYPE, modifiers, this.sourceSpan);
    }
}
export class UnaryOperatorExpr extends Expression {
    constructor(operator, expr, type, sourceSpan, parens = true) {
        super(type || NUMBER_TYPE, sourceSpan);
        this.operator = operator;
        this.expr = expr;
        this.parens = parens;
    }
    isEquivalent(e) {
        return (e instanceof UnaryOperatorExpr &&
            this.operator === e.operator &&
            this.expr.isEquivalent(e.expr));
    }
    isConstant() {
        return false;
    }
    visitExpression(visitor, context) {
        return visitor.visitUnaryOperatorExpr(this, context);
    }
    clone() {
        return new UnaryOperatorExpr(this.operator, this.expr.clone(), this.type, this.sourceSpan, this.parens);
    }
}
export class BinaryOperatorExpr extends Expression {
    constructor(operator, lhs, rhs, type, sourceSpan, parens = true) {
        super(type || lhs.type, sourceSpan);
        this.operator = operator;
        this.rhs = rhs;
        this.parens = parens;
        this.lhs = lhs;
    }
    isEquivalent(e) {
        return (e instanceof BinaryOperatorExpr &&
            this.operator === e.operator &&
            this.lhs.isEquivalent(e.lhs) &&
            this.rhs.isEquivalent(e.rhs));
    }
    isConstant() {
        return false;
    }
    visitExpression(visitor, context) {
        return visitor.visitBinaryOperatorExpr(this, context);
    }
    clone() {
        return new BinaryOperatorExpr(this.operator, this.lhs.clone(), this.rhs.clone(), this.type, this.sourceSpan, this.parens);
    }
}
export class ReadPropExpr extends Expression {
    constructor(receiver, name, type, sourceSpan) {
        super(type, sourceSpan);
        this.receiver = receiver;
        this.name = name;
    }
    // An alias for name, which allows other logic to handle property reads and keyed reads together.
    get index() {
        return this.name;
    }
    isEquivalent(e) {
        return (e instanceof ReadPropExpr && this.receiver.isEquivalent(e.receiver) && this.name === e.name);
    }
    isConstant() {
        return false;
    }
    visitExpression(visitor, context) {
        return visitor.visitReadPropExpr(this, context);
    }
    set(value) {
        return new WritePropExpr(this.receiver, this.name, value, null, this.sourceSpan);
    }
    clone() {
        return new ReadPropExpr(this.receiver.clone(), this.name, this.type, this.sourceSpan);
    }
}
export class ReadKeyExpr extends Expression {
    constructor(receiver, index, type, sourceSpan) {
        super(type, sourceSpan);
        this.receiver = receiver;
        this.index = index;
    }
    isEquivalent(e) {
        return (e instanceof ReadKeyExpr &&
            this.receiver.isEquivalent(e.receiver) &&
            this.index.isEquivalent(e.index));
    }
    isConstant() {
        return false;
    }
    visitExpression(visitor, context) {
        return visitor.visitReadKeyExpr(this, context);
    }
    set(value) {
        return new WriteKeyExpr(this.receiver, this.index, value, null, this.sourceSpan);
    }
    clone() {
        return new ReadKeyExpr(this.receiver.clone(), this.index.clone(), this.type, this.sourceSpan);
    }
}
export class LiteralArrayExpr extends Expression {
    constructor(entries, type, sourceSpan) {
        super(type, sourceSpan);
        this.entries = entries;
    }
    isConstant() {
        return this.entries.every((e) => e.isConstant());
    }
    isEquivalent(e) {
        return e instanceof LiteralArrayExpr && areAllEquivalent(this.entries, e.entries);
    }
    visitExpression(visitor, context) {
        return visitor.visitLiteralArrayExpr(this, context);
    }
    clone() {
        return new LiteralArrayExpr(this.entries.map((e) => e.clone()), this.type, this.sourceSpan);
    }
}
export class LiteralMapEntry {
    constructor(key, value, quoted) {
        this.key = key;
        this.value = value;
        this.quoted = quoted;
    }
    isEquivalent(e) {
        return this.key === e.key && this.value.isEquivalent(e.value);
    }
    clone() {
        return new LiteralMapEntry(this.key, this.value.clone(), this.quoted);
    }
}
export class LiteralMapExpr extends Expression {
    constructor(entries, type, sourceSpan) {
        super(type, sourceSpan);
        this.entries = entries;
        this.valueType = null;
        if (type) {
            this.valueType = type.valueType;
        }
    }
    isEquivalent(e) {
        return e instanceof LiteralMapExpr && areAllEquivalent(this.entries, e.entries);
    }
    isConstant() {
        return this.entries.every((e) => e.value.isConstant());
    }
    visitExpression(visitor, context) {
        return visitor.visitLiteralMapExpr(this, context);
    }
    clone() {
        const entriesClone = this.entries.map((entry) => entry.clone());
        return new LiteralMapExpr(entriesClone, this.type, this.sourceSpan);
    }
}
export class CommaExpr extends Expression {
    constructor(parts, sourceSpan) {
        super(parts[parts.length - 1].type, sourceSpan);
        this.parts = parts;
    }
    isEquivalent(e) {
        return e instanceof CommaExpr && areAllEquivalent(this.parts, e.parts);
    }
    isConstant() {
        return false;
    }
    visitExpression(visitor, context) {
        return visitor.visitCommaExpr(this, context);
    }
    clone() {
        return new CommaExpr(this.parts.map((p) => p.clone()));
    }
}
export const NULL_EXPR = new LiteralExpr(null, null, null);
export const TYPED_NULL_EXPR = new LiteralExpr(null, INFERRED_TYPE, null);
//// Statements
export var StmtModifier;
(function (StmtModifier) {
    StmtModifier[StmtModifier["None"] = 0] = "None";
    StmtModifier[StmtModifier["Final"] = 1] = "Final";
    StmtModifier[StmtModifier["Private"] = 2] = "Private";
    StmtModifier[StmtModifier["Exported"] = 4] = "Exported";
    StmtModifier[StmtModifier["Static"] = 8] = "Static";
})(StmtModifier || (StmtModifier = {}));
export class LeadingComment {
    constructor(text, multiline, trailingNewline) {
        this.text = text;
        this.multiline = multiline;
        this.trailingNewline = trailingNewline;
    }
    toString() {
        return this.multiline ? ` ${this.text} ` : this.text;
    }
}
export class JSDocComment extends LeadingComment {
    constructor(tags) {
        super('', /* multiline */ true, /* trailingNewline */ true);
        this.tags = tags;
    }
    toString() {
        return serializeTags(this.tags);
    }
}
export class Statement {
    constructor(modifiers = StmtModifier.None, sourceSpan = null, leadingComments) {
        this.modifiers = modifiers;
        this.sourceSpan = sourceSpan;
        this.leadingComments = leadingComments;
    }
    hasModifier(modifier) {
        return (this.modifiers & modifier) !== 0;
    }
    addLeadingComment(leadingComment) {
        this.leadingComments = this.leadingComments ?? [];
        this.leadingComments.push(leadingComment);
    }
}
export class DeclareVarStmt extends Statement {
    constructor(name, value, type, modifiers, sourceSpan, leadingComments) {
        super(modifiers, sourceSpan, leadingComments);
        this.name = name;
        this.value = value;
        this.type = type || (value && value.type) || null;
    }
    isEquivalent(stmt) {
        return (stmt instanceof DeclareVarStmt &&
            this.name === stmt.name &&
            (this.value ? !!stmt.value && this.value.isEquivalent(stmt.value) : !stmt.value));
    }
    visitStatement(visitor, context) {
        return visitor.visitDeclareVarStmt(this, context);
    }
}
export class DeclareFunctionStmt extends Statement {
    constructor(name, params, statements, type, modifiers, sourceSpan, leadingComments) {
        super(modifiers, sourceSpan, leadingComments);
        this.name = name;
        this.params = params;
        this.statements = statements;
        this.type = type || null;
    }
    isEquivalent(stmt) {
        return (stmt instanceof DeclareFunctionStmt &&
            areAllEquivalent(this.params, stmt.params) &&
            areAllEquivalent(this.statements, stmt.statements));
    }
    visitStatement(visitor, context) {
        return visitor.visitDeclareFunctionStmt(this, context);
    }
}
export class ExpressionStatement extends Statement {
    constructor(expr, sourceSpan, leadingComments) {
        super(StmtModifier.None, sourceSpan, leadingComments);
        this.expr = expr;
    }
    isEquivalent(stmt) {
        return stmt instanceof ExpressionStatement && this.expr.isEquivalent(stmt.expr);
    }
    visitStatement(visitor, context) {
        return visitor.visitExpressionStmt(this, context);
    }
}
export class ReturnStatement extends Statement {
    constructor(value, sourceSpan = null, leadingComments) {
        super(StmtModifier.None, sourceSpan, leadingComments);
        this.value = value;
    }
    isEquivalent(stmt) {
        return stmt instanceof ReturnStatement && this.value.isEquivalent(stmt.value);
    }
    visitStatement(visitor, context) {
        return visitor.visitReturnStmt(this, context);
    }
}
export class IfStmt extends Statement {
    constructor(condition, trueCase, falseCase = [], sourceSpan, leadingComments) {
        super(StmtModifier.None, sourceSpan, leadingComments);
        this.condition = condition;
        this.trueCase = trueCase;
        this.falseCase = falseCase;
    }
    isEquivalent(stmt) {
        return (stmt instanceof IfStmt &&
            this.condition.isEquivalent(stmt.condition) &&
            areAllEquivalent(this.trueCase, stmt.trueCase) &&
            areAllEquivalent(this.falseCase, stmt.falseCase));
    }
    visitStatement(visitor, context) {
        return visitor.visitIfStmt(this, context);
    }
}
export class RecursiveAstVisitor {
    visitType(ast, context) {
        return ast;
    }
    visitExpression(ast, context) {
        if (ast.type) {
            ast.type.visitType(this, context);
        }
        return ast;
    }
    visitBuiltinType(type, context) {
        return this.visitType(type, context);
    }
    visitExpressionType(type, context) {
        type.value.visitExpression(this, context);
        if (type.typeParams !== null) {
            type.typeParams.forEach((param) => this.visitType(param, context));
        }
        return this.visitType(type, context);
    }
    visitArrayType(type, context) {
        return this.visitType(type, context);
    }
    visitMapType(type, context) {
        return this.visitType(type, context);
    }
    visitTransplantedType(type, context) {
        return type;
    }
    visitWrappedNodeExpr(ast, context) {
        return ast;
    }
    visitTypeofExpr(ast, context) {
        return this.visitExpression(ast, context);
    }
    visitReadVarExpr(ast, context) {
        return this.visitExpression(ast, context);
    }
    visitWriteVarExpr(ast, context) {
        ast.value.visitExpression(this, context);
        return this.visitExpression(ast, context);
    }
    visitWriteKeyExpr(ast, context) {
        ast.receiver.visitExpression(this, context);
        ast.index.visitExpression(this, context);
        ast.value.visitExpression(this, context);
        return this.visitExpression(ast, context);
    }
    visitWritePropExpr(ast, context) {
        ast.receiver.visitExpression(this, context);
        ast.value.visitExpression(this, context);
        return this.visitExpression(ast, context);
    }
    visitDynamicImportExpr(ast, context) {
        return this.visitExpression(ast, context);
    }
    visitInvokeFunctionExpr(ast, context) {
        ast.fn.visitExpression(this, context);
        this.visitAllExpressions(ast.args, context);
        return this.visitExpression(ast, context);
    }
    visitTaggedTemplateExpr(ast, context) {
        ast.tag.visitExpression(this, context);
        this.visitAllExpressions(ast.template.expressions, context);
        return this.visitExpression(ast, context);
    }
    visitInstantiateExpr(ast, context) {
        ast.classExpr.visitExpression(this, context);
        this.visitAllExpressions(ast.args, context);
        return this.visitExpression(ast, context);
    }
    visitLiteralExpr(ast, context) {
        return this.visitExpression(ast, context);
    }
    visitLocalizedString(ast, context) {
        return this.visitExpression(ast, context);
    }
    visitExternalExpr(ast, context) {
        if (ast.typeParams) {
            ast.typeParams.forEach((type) => type.visitType(this, context));
        }
        return this.visitExpression(ast, context);
    }
    visitConditionalExpr(ast, context) {
        ast.condition.visitExpression(this, context);
        ast.trueCase.visitExpression(this, context);
        ast.falseCase.visitExpression(this, context);
        return this.visitExpression(ast, context);
    }
    visitNotExpr(ast, context) {
        ast.condition.visitExpression(this, context);
        return this.visitExpression(ast, context);
    }
    visitFunctionExpr(ast, context) {
        this.visitAllStatements(ast.statements, context);
        return this.visitExpression(ast, context);
    }
    visitArrowFunctionExpr(ast, context) {
        if (Array.isArray(ast.body)) {
            this.visitAllStatements(ast.body, context);
        }
        else {
            this.visitExpression(ast.body, context);
        }
        return this.visitExpression(ast, context);
    }
    visitUnaryOperatorExpr(ast, context) {
        ast.expr.visitExpression(this, context);
        return this.visitExpression(ast, context);
    }
    visitBinaryOperatorExpr(ast, context) {
        ast.lhs.visitExpression(this, context);
        ast.rhs.visitExpression(this, context);
        return this.visitExpression(ast, context);
    }
    visitReadPropExpr(ast, context) {
        ast.receiver.visitExpression(this, context);
        return this.visitExpression(ast, context);
    }
    visitReadKeyExpr(ast, context) {
        ast.receiver.visitExpression(this, context);
        ast.index.visitExpression(this, context);
        return this.visitExpression(ast, context);
    }
    visitLiteralArrayExpr(ast, context) {
        this.visitAllExpressions(ast.entries, context);
        return this.visitExpression(ast, context);
    }
    visitLiteralMapExpr(ast, context) {
        ast.entries.forEach((entry) => entry.value.visitExpression(this, context));
        return this.visitExpression(ast, context);
    }
    visitCommaExpr(ast, context) {
        this.visitAllExpressions(ast.parts, context);
        return this.visitExpression(ast, context);
    }
    visitAllExpressions(exprs, context) {
        exprs.forEach((expr) => expr.visitExpression(this, context));
    }
    visitDeclareVarStmt(stmt, context) {
        if (stmt.value) {
            stmt.value.visitExpression(this, context);
        }
        if (stmt.type) {
            stmt.type.visitType(this, context);
        }
        return stmt;
    }
    visitDeclareFunctionStmt(stmt, context) {
        this.visitAllStatements(stmt.statements, context);
        if (stmt.type) {
            stmt.type.visitType(this, context);
        }
        return stmt;
    }
    visitExpressionStmt(stmt, context) {
        stmt.expr.visitExpression(this, context);
        return stmt;
    }
    visitReturnStmt(stmt, context) {
        stmt.value.visitExpression(this, context);
        return stmt;
    }
    visitIfStmt(stmt, context) {
        stmt.condition.visitExpression(this, context);
        this.visitAllStatements(stmt.trueCase, context);
        this.visitAllStatements(stmt.falseCase, context);
        return stmt;
    }
    visitAllStatements(stmts, context) {
        stmts.forEach((stmt) => stmt.visitStatement(this, context));
    }
}
export function leadingComment(text, multiline = false, trailingNewline = true) {
    return new LeadingComment(text, multiline, trailingNewline);
}
export function jsDocComment(tags = []) {
    return new JSDocComment(tags);
}
export function variable(name, type, sourceSpan) {
    return new ReadVarExpr(name, type, sourceSpan);
}
export function importExpr(id, typeParams = null, sourceSpan) {
    return new ExternalExpr(id, null, typeParams, sourceSpan);
}
export function importType(id, typeParams, typeModifiers) {
    return id != null ? expressionType(importExpr(id, typeParams, null), typeModifiers) : null;
}
export function expressionType(expr, typeModifiers, typeParams) {
    return new ExpressionType(expr, typeModifiers, typeParams);
}
export function transplantedType(type, typeModifiers) {
    return new TransplantedType(type, typeModifiers);
}
export function typeofExpr(expr) {
    return new TypeofExpr(expr);
}
export function literalArr(values, type, sourceSpan) {
    return new LiteralArrayExpr(values, type, sourceSpan);
}
export function literalMap(values, type = null) {
    return new LiteralMapExpr(values.map((e) => new LiteralMapEntry(e.key, e.value, e.quoted)), type, null);
}
export function unary(operator, expr, type, sourceSpan) {
    return new UnaryOperatorExpr(operator, expr, type, sourceSpan);
}
export function not(expr, sourceSpan) {
    return new NotExpr(expr, sourceSpan);
}
export function fn(params, body, type, sourceSpan, name) {
    return new FunctionExpr(params, body, type, sourceSpan, name);
}
export function arrowFn(params, body, type, sourceSpan) {
    return new ArrowFunctionExpr(params, body, type, sourceSpan);
}
export function ifStmt(condition, thenClause, elseClause, sourceSpan, leadingComments) {
    return new IfStmt(condition, thenClause, elseClause, sourceSpan, leadingComments);
}
export function taggedTemplate(tag, template, type, sourceSpan) {
    return new TaggedTemplateExpr(tag, template, type, sourceSpan);
}
export function literal(value, type, sourceSpan) {
    return new LiteralExpr(value, type, sourceSpan);
}
export function localizedString(metaBlock, messageParts, placeholderNames, expressions, sourceSpan) {
    return new LocalizedString(metaBlock, messageParts, placeholderNames, expressions, sourceSpan);
}
export function isNull(exp) {
    return exp instanceof LiteralExpr && exp.value === null;
}
/*
 * Serializes a `Tag` into a string.
 * Returns a string like " @foo {bar} baz" (note the leading whitespace before `@foo`).
 */
function tagToString(tag) {
    let out = '';
    if (tag.tagName) {
        out += ` @${tag.tagName}`;
    }
    if (tag.text) {
        if (tag.text.match(/\/\*|\*\//)) {
            throw new Error('JSDoc text cannot contain "/*" and "*/"');
        }
        out += ' ' + tag.text.replace(/@/g, '\\@');
    }
    return out;
}
function serializeTags(tags) {
    if (tags.length === 0)
        return '';
    if (tags.length === 1 && tags[0].tagName && !tags[0].text) {
        // The JSDOC comment is a single simple tag: e.g `/** @tagname */`.
        return `*${tagToString(tags[0])} `;
    }
    let out = '*\n';
    for (const tag of tags) {
        out += ' *';
        // If the tagToString is multi-line, insert " * " prefixes on lines.
        out += tagToString(tag).replace(/\n/g, '\n * ');
        out += '\n';
    }
    out += ' ';
    return out;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0cHV0X2FzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9vdXRwdXQvb3V0cHV0X2FzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFLNUMsVUFBVTtBQUNWLE1BQU0sQ0FBTixJQUFZLFlBR1g7QUFIRCxXQUFZLFlBQVk7SUFDdEIsK0NBQVEsQ0FBQTtJQUNSLGlEQUFjLENBQUE7QUFDaEIsQ0FBQyxFQUhXLFlBQVksS0FBWixZQUFZLFFBR3ZCO0FBRUQsTUFBTSxPQUFnQixJQUFJO0lBQ3hCLFlBQW1CLFlBQTBCLFlBQVksQ0FBQyxJQUFJO1FBQTNDLGNBQVMsR0FBVCxTQUFTLENBQWtDO0lBQUcsQ0FBQztJQUdsRSxXQUFXLENBQUMsUUFBc0I7UUFDaEMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzNDLENBQUM7Q0FDRjtBQUVELE1BQU0sQ0FBTixJQUFZLGVBU1g7QUFURCxXQUFZLGVBQWU7SUFDekIsMkRBQU8sQ0FBQTtJQUNQLHFEQUFJLENBQUE7SUFDSix5REFBTSxDQUFBO0lBQ04sbURBQUcsQ0FBQTtJQUNILHlEQUFNLENBQUE7SUFDTiw2REFBUSxDQUFBO0lBQ1IsNkRBQVEsQ0FBQTtJQUNSLHFEQUFJLENBQUE7QUFDTixDQUFDLEVBVFcsZUFBZSxLQUFmLGVBQWUsUUFTMUI7QUFFRCxNQUFNLE9BQU8sV0FBWSxTQUFRLElBQUk7SUFDbkMsWUFDUyxJQUFxQixFQUM1QixTQUF3QjtRQUV4QixLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7UUFIVixTQUFJLEdBQUosSUFBSSxDQUFpQjtJQUk5QixDQUFDO0lBQ1EsU0FBUyxDQUFDLE9BQW9CLEVBQUUsT0FBWTtRQUNuRCxPQUFPLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDakQsQ0FBQztDQUNGO0FBRUQsTUFBTSxPQUFPLGNBQWUsU0FBUSxJQUFJO0lBQ3RDLFlBQ1MsS0FBaUIsRUFDeEIsU0FBd0IsRUFDakIsYUFBNEIsSUFBSTtRQUV2QyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7UUFKVixVQUFLLEdBQUwsS0FBSyxDQUFZO1FBRWpCLGVBQVUsR0FBVixVQUFVLENBQXNCO0lBR3pDLENBQUM7SUFDUSxTQUFTLENBQUMsT0FBb0IsRUFBRSxPQUFZO1FBQ25ELE9BQU8sT0FBTyxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNwRCxDQUFDO0NBQ0Y7QUFFRCxNQUFNLE9BQU8sU0FBVSxTQUFRLElBQUk7SUFDakMsWUFDUyxFQUFRLEVBQ2YsU0FBd0I7UUFFeEIsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBSFYsT0FBRSxHQUFGLEVBQUUsQ0FBTTtJQUlqQixDQUFDO0lBQ1EsU0FBUyxDQUFDLE9BQW9CLEVBQUUsT0FBWTtRQUNuRCxPQUFPLE9BQU8sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQy9DLENBQUM7Q0FDRjtBQUVELE1BQU0sT0FBTyxPQUFRLFNBQVEsSUFBSTtJQUUvQixZQUFZLFNBQWtDLEVBQUUsU0FBd0I7UUFDdEUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2pCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxJQUFJLElBQUksQ0FBQztJQUNyQyxDQUFDO0lBQ1EsU0FBUyxDQUFDLE9BQW9CLEVBQUUsT0FBWTtRQUNuRCxPQUFPLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzdDLENBQUM7Q0FDRjtBQUVELE1BQU0sT0FBTyxnQkFBb0IsU0FBUSxJQUFJO0lBQzNDLFlBQ1csSUFBTyxFQUNoQixTQUF3QjtRQUV4QixLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7UUFIUixTQUFJLEdBQUosSUFBSSxDQUFHO0lBSWxCLENBQUM7SUFDUSxTQUFTLENBQUMsT0FBb0IsRUFBRSxPQUFZO1FBQ25ELE9BQU8sT0FBTyxDQUFDLHFCQUFxQixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUN0RCxDQUFDO0NBQ0Y7QUFFRCxNQUFNLENBQUMsTUFBTSxZQUFZLEdBQUcsSUFBSSxXQUFXLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3JFLE1BQU0sQ0FBQyxNQUFNLGFBQWEsR0FBRyxJQUFJLFdBQVcsQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDdkUsTUFBTSxDQUFDLE1BQU0sU0FBUyxHQUFHLElBQUksV0FBVyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMvRCxNQUFNLENBQUMsTUFBTSxRQUFRLEdBQUcsSUFBSSxXQUFXLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzdELE1BQU0sQ0FBQyxNQUFNLFdBQVcsR0FBRyxJQUFJLFdBQVcsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDbkUsTUFBTSxDQUFDLE1BQU0sV0FBVyxHQUFHLElBQUksV0FBVyxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNuRSxNQUFNLENBQUMsTUFBTSxhQUFhLEdBQUcsSUFBSSxXQUFXLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3ZFLE1BQU0sQ0FBQyxNQUFNLFNBQVMsR0FBRyxJQUFJLFdBQVcsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7QUFVL0QsaUJBQWlCO0FBRWpCLE1BQU0sQ0FBTixJQUFZLGFBR1g7QUFIRCxXQUFZLGFBQWE7SUFDdkIsbURBQUssQ0FBQTtJQUNMLGlEQUFJLENBQUE7QUFDTixDQUFDLEVBSFcsYUFBYSxLQUFiLGFBQWEsUUFHeEI7QUFFRCxNQUFNLENBQU4sSUFBWSxjQW1CWDtBQW5CRCxXQUFZLGNBQWM7SUFDeEIsdURBQU0sQ0FBQTtJQUNOLDZEQUFTLENBQUE7SUFDVCw2REFBUyxDQUFBO0lBQ1QsbUVBQVksQ0FBQTtJQUNaLHFEQUFLLENBQUE7SUFDTCxtREFBSSxDQUFBO0lBQ0osdURBQU0sQ0FBQTtJQUNOLDJEQUFRLENBQUE7SUFDUix1REFBTSxDQUFBO0lBQ04saURBQUcsQ0FBQTtJQUNILGdEQUFFLENBQUE7SUFDRiw4REFBUyxDQUFBO0lBQ1QsZ0VBQVUsQ0FBQTtJQUNWLHNEQUFLLENBQUE7SUFDTCxrRUFBVyxDQUFBO0lBQ1gsd0RBQU0sQ0FBQTtJQUNOLG9FQUFZLENBQUE7SUFDWiwwRUFBZSxDQUFBO0FBQ2pCLENBQUMsRUFuQlcsY0FBYyxLQUFkLGNBQWMsUUFtQnpCO0FBRUQsTUFBTSxVQUFVLG9CQUFvQixDQUNsQyxJQUFjLEVBQ2QsS0FBZTtJQUVmLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxFQUFFLENBQUM7UUFDbEMsT0FBTyxJQUFJLElBQUksS0FBSyxDQUFDO0lBQ3ZCLENBQUM7SUFDRCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDbEMsQ0FBQztBQUVELFNBQVMseUJBQXlCLENBQ2hDLElBQVMsRUFDVCxLQUFVLEVBQ1YsbUJBQWlFO0lBRWpFLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDeEIsSUFBSSxHQUFHLEtBQUssS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3pCLE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUNELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUM3QixJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDNUMsT0FBTyxLQUFLLENBQUM7UUFDZixDQUFDO0lBQ0gsQ0FBQztJQUNELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQUVELE1BQU0sVUFBVSxnQkFBZ0IsQ0FDOUIsSUFBUyxFQUNULEtBQVU7SUFFVixPQUFPLHlCQUF5QixDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyxXQUFjLEVBQUUsWUFBZSxFQUFFLEVBQUUsQ0FDaEYsV0FBVyxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsQ0FDdkMsQ0FBQztBQUNKLENBQUM7QUFFRCxNQUFNLE9BQWdCLFVBQVU7SUFJOUIsWUFBWSxJQUE2QixFQUFFLFVBQW1DO1FBQzVFLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxJQUFJLElBQUksQ0FBQztRQUN6QixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsSUFBSSxJQUFJLENBQUM7SUFDdkMsQ0FBQztJQWlCRCxJQUFJLENBQUMsSUFBWSxFQUFFLFVBQW1DO1FBQ3BELE9BQU8sSUFBSSxZQUFZLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUVELEdBQUcsQ0FBQyxLQUFpQixFQUFFLElBQWtCLEVBQUUsVUFBbUM7UUFDNUUsT0FBTyxJQUFJLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBRUQsTUFBTSxDQUNKLE1BQW9CLEVBQ3BCLFVBQW1DLEVBQ25DLElBQWM7UUFFZCxPQUFPLElBQUksa0JBQWtCLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3RFLENBQUM7SUFFRCxXQUFXLENBQ1QsTUFBb0IsRUFDcEIsSUFBa0IsRUFDbEIsVUFBbUM7UUFFbkMsT0FBTyxJQUFJLGVBQWUsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztJQUM3RCxDQUFDO0lBRUQsV0FBVyxDQUNULFFBQW9CLEVBQ3BCLFlBQStCLElBQUksRUFDbkMsVUFBbUM7UUFFbkMsT0FBTyxJQUFJLGVBQWUsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDMUUsQ0FBQztJQUVELE1BQU0sQ0FBQyxHQUFlLEVBQUUsVUFBbUM7UUFDekQsT0FBTyxJQUFJLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDcEYsQ0FBQztJQUNELFNBQVMsQ0FBQyxHQUFlLEVBQUUsVUFBbUM7UUFDNUQsT0FBTyxJQUFJLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDdkYsQ0FBQztJQUNELFNBQVMsQ0FBQyxHQUFlLEVBQUUsVUFBbUM7UUFDNUQsT0FBTyxJQUFJLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDdkYsQ0FBQztJQUNELFlBQVksQ0FBQyxHQUFlLEVBQUUsVUFBbUM7UUFDL0QsT0FBTyxJQUFJLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxZQUFZLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDMUYsQ0FBQztJQUNELEtBQUssQ0FBQyxHQUFlLEVBQUUsVUFBbUM7UUFDeEQsT0FBTyxJQUFJLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDbkYsQ0FBQztJQUNELElBQUksQ0FBQyxHQUFlLEVBQUUsVUFBbUM7UUFDdkQsT0FBTyxJQUFJLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDbEYsQ0FBQztJQUNELE1BQU0sQ0FBQyxHQUFlLEVBQUUsVUFBbUM7UUFDekQsT0FBTyxJQUFJLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDcEYsQ0FBQztJQUNELFFBQVEsQ0FBQyxHQUFlLEVBQUUsVUFBbUM7UUFDM0QsT0FBTyxJQUFJLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDdEYsQ0FBQztJQUNELE1BQU0sQ0FBQyxHQUFlLEVBQUUsVUFBbUM7UUFDekQsT0FBTyxJQUFJLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDcEYsQ0FBQztJQUNELEdBQUcsQ0FBQyxHQUFlLEVBQUUsVUFBbUM7UUFDdEQsT0FBTyxJQUFJLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDakYsQ0FBQztJQUNELFNBQVMsQ0FDUCxHQUFlLEVBQ2YsVUFBbUMsRUFDbkMsU0FBa0IsSUFBSTtRQUV0QixPQUFPLElBQUksa0JBQWtCLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDL0YsQ0FBQztJQUNELFVBQVUsQ0FDUixHQUFlLEVBQ2YsVUFBbUMsRUFDbkMsU0FBa0IsSUFBSTtRQUV0QixPQUFPLElBQUksa0JBQWtCLENBQUMsY0FBYyxDQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDaEcsQ0FBQztJQUNELEVBQUUsQ0FBQyxHQUFlLEVBQUUsVUFBbUM7UUFDckQsT0FBTyxJQUFJLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDaEYsQ0FBQztJQUNELEtBQUssQ0FBQyxHQUFlLEVBQUUsVUFBbUM7UUFDeEQsT0FBTyxJQUFJLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDbkYsQ0FBQztJQUNELFdBQVcsQ0FBQyxHQUFlLEVBQUUsVUFBbUM7UUFDOUQsT0FBTyxJQUFJLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxXQUFXLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDekYsQ0FBQztJQUNELE1BQU0sQ0FBQyxHQUFlLEVBQUUsVUFBbUM7UUFDekQsT0FBTyxJQUFJLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDcEYsQ0FBQztJQUNELFlBQVksQ0FBQyxHQUFlLEVBQUUsVUFBbUM7UUFDL0QsT0FBTyxJQUFJLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxZQUFZLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDMUYsQ0FBQztJQUNELE9BQU8sQ0FBQyxVQUFtQztRQUN6Qyw4RUFBOEU7UUFDOUUsbUVBQW1FO1FBQ25FLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUNELGVBQWUsQ0FBQyxHQUFlLEVBQUUsVUFBbUM7UUFDbEUsT0FBTyxJQUFJLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxlQUFlLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDN0YsQ0FBQztJQUVELE1BQU07UUFDSixPQUFPLElBQUksbUJBQW1CLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzdDLENBQUM7Q0FDRjtBQUVELE1BQU0sT0FBTyxXQUFZLFNBQVEsVUFBVTtJQUN6QyxZQUNTLElBQVksRUFDbkIsSUFBa0IsRUFDbEIsVUFBbUM7UUFFbkMsS0FBSyxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUpqQixTQUFJLEdBQUosSUFBSSxDQUFRO0lBS3JCLENBQUM7SUFFUSxZQUFZLENBQUMsQ0FBYTtRQUNqQyxPQUFPLENBQUMsWUFBWSxXQUFXLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQzFELENBQUM7SUFFUSxVQUFVO1FBQ2pCLE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVRLGVBQWUsQ0FBQyxPQUEwQixFQUFFLE9BQVk7UUFDL0QsT0FBTyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFFUSxLQUFLO1FBQ1osT0FBTyxJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ2hFLENBQUM7SUFFRCxHQUFHLENBQUMsS0FBaUI7UUFDbkIsT0FBTyxJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ25FLENBQUM7Q0FDRjtBQUVELE1BQU0sT0FBTyxVQUFXLFNBQVEsVUFBVTtJQUN4QyxZQUNTLElBQWdCLEVBQ3ZCLElBQWtCLEVBQ2xCLFVBQW1DO1FBRW5DLEtBQUssQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFKakIsU0FBSSxHQUFKLElBQUksQ0FBWTtJQUt6QixDQUFDO0lBRVEsZUFBZSxDQUFDLE9BQTBCLEVBQUUsT0FBWTtRQUMvRCxPQUFPLE9BQU8sQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFFUSxZQUFZLENBQUMsQ0FBYTtRQUNqQyxPQUFPLENBQUMsWUFBWSxVQUFVLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ25FLENBQUM7SUFFUSxVQUFVO1FBQ2pCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUNoQyxDQUFDO0lBRVEsS0FBSztRQUNaLE9BQU8sSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBQzNDLENBQUM7Q0FDRjtBQUVELE1BQU0sT0FBTyxlQUFtQixTQUFRLFVBQVU7SUFDaEQsWUFDUyxJQUFPLEVBQ2QsSUFBa0IsRUFDbEIsVUFBbUM7UUFFbkMsS0FBSyxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUpqQixTQUFJLEdBQUosSUFBSSxDQUFHO0lBS2hCLENBQUM7SUFFUSxZQUFZLENBQUMsQ0FBYTtRQUNqQyxPQUFPLENBQUMsWUFBWSxlQUFlLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQzlELENBQUM7SUFFUSxVQUFVO1FBQ2pCLE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVRLGVBQWUsQ0FBQyxPQUEwQixFQUFFLE9BQVk7UUFDL0QsT0FBTyxPQUFPLENBQUMsb0JBQW9CLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFFUSxLQUFLO1FBQ1osT0FBTyxJQUFJLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7Q0FDRjtBQUVELE1BQU0sT0FBTyxZQUFhLFNBQVEsVUFBVTtJQUUxQyxZQUNTLElBQVksRUFDbkIsS0FBaUIsRUFDakIsSUFBa0IsRUFDbEIsVUFBbUM7UUFFbkMsS0FBSyxDQUFDLElBQUksSUFBSSxLQUFLLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBTC9CLFNBQUksR0FBSixJQUFJLENBQVE7UUFNbkIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDckIsQ0FBQztJQUVRLFlBQVksQ0FBQyxDQUFhO1FBQ2pDLE9BQU8sQ0FBQyxZQUFZLFlBQVksSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQy9GLENBQUM7SUFFUSxVQUFVO1FBQ2pCLE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVRLGVBQWUsQ0FBQyxPQUEwQixFQUFFLE9BQVk7UUFDL0QsT0FBTyxPQUFPLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFUSxLQUFLO1FBQ1osT0FBTyxJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDckYsQ0FBQztJQUVELFVBQVUsQ0FBQyxJQUFrQixFQUFFLFNBQXdCO1FBQ3JELE9BQU8sSUFBSSxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3JGLENBQUM7SUFFRCxXQUFXO1FBQ1QsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsRUFBRSxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDNUQsQ0FBQztDQUNGO0FBRUQsTUFBTSxPQUFPLFlBQWEsU0FBUSxVQUFVO0lBRTFDLFlBQ1MsUUFBb0IsRUFDcEIsS0FBaUIsRUFDeEIsS0FBaUIsRUFDakIsSUFBa0IsRUFDbEIsVUFBbUM7UUFFbkMsS0FBSyxDQUFDLElBQUksSUFBSSxLQUFLLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBTi9CLGFBQVEsR0FBUixRQUFRLENBQVk7UUFDcEIsVUFBSyxHQUFMLEtBQUssQ0FBWTtRQU14QixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztJQUNyQixDQUFDO0lBRVEsWUFBWSxDQUFDLENBQWE7UUFDakMsT0FBTyxDQUNMLENBQUMsWUFBWSxZQUFZO1lBQ3pCLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7WUFDdEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUNoQyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQ2pDLENBQUM7SUFDSixDQUFDO0lBRVEsVUFBVTtRQUNqQixPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFUSxlQUFlLENBQUMsT0FBMEIsRUFBRSxPQUFZO1FBQy9ELE9BQU8sT0FBTyxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRVEsS0FBSztRQUNaLE9BQU8sSUFBSSxZQUFZLENBQ3JCLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEVBQ3JCLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQ2xCLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQ2xCLElBQUksQ0FBQyxJQUFJLEVBQ1QsSUFBSSxDQUFDLFVBQVUsQ0FDaEIsQ0FBQztJQUNKLENBQUM7Q0FDRjtBQUVELE1BQU0sT0FBTyxhQUFjLFNBQVEsVUFBVTtJQUUzQyxZQUNTLFFBQW9CLEVBQ3BCLElBQVksRUFDbkIsS0FBaUIsRUFDakIsSUFBa0IsRUFDbEIsVUFBbUM7UUFFbkMsS0FBSyxDQUFDLElBQUksSUFBSSxLQUFLLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBTi9CLGFBQVEsR0FBUixRQUFRLENBQVk7UUFDcEIsU0FBSSxHQUFKLElBQUksQ0FBUTtRQU1uQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztJQUNyQixDQUFDO0lBRVEsWUFBWSxDQUFDLENBQWE7UUFDakMsT0FBTyxDQUNMLENBQUMsWUFBWSxhQUFhO1lBQzFCLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7WUFDdEMsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsSUFBSTtZQUNwQixJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQ2pDLENBQUM7SUFDSixDQUFDO0lBRVEsVUFBVTtRQUNqQixPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFUSxlQUFlLENBQUMsT0FBMEIsRUFBRSxPQUFZO1FBQy9ELE9BQU8sT0FBTyxDQUFDLGtCQUFrQixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBRVEsS0FBSztRQUNaLE9BQU8sSUFBSSxhQUFhLENBQ3RCLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEVBQ3JCLElBQUksQ0FBQyxJQUFJLEVBQ1QsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFDbEIsSUFBSSxDQUFDLElBQUksRUFDVCxJQUFJLENBQUMsVUFBVSxDQUNoQixDQUFDO0lBQ0osQ0FBQztDQUNGO0FBRUQsTUFBTSxPQUFPLGtCQUFtQixTQUFRLFVBQVU7SUFDaEQsWUFDUyxFQUFjLEVBQ2QsSUFBa0IsRUFDekIsSUFBa0IsRUFDbEIsVUFBbUMsRUFDNUIsT0FBTyxLQUFLO1FBRW5CLEtBQUssQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFOakIsT0FBRSxHQUFGLEVBQUUsQ0FBWTtRQUNkLFNBQUksR0FBSixJQUFJLENBQWM7UUFHbEIsU0FBSSxHQUFKLElBQUksQ0FBUTtJQUdyQixDQUFDO0lBRUQseUZBQXlGO0lBQ3pGLElBQUksUUFBUTtRQUNWLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQztJQUNqQixDQUFDO0lBRVEsWUFBWSxDQUFDLENBQWE7UUFDakMsT0FBTyxDQUNMLENBQUMsWUFBWSxrQkFBa0I7WUFDL0IsSUFBSSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUMxQixnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDbkMsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsSUFBSSxDQUNyQixDQUFDO0lBQ0osQ0FBQztJQUVRLFVBQVU7UUFDakIsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRVEsZUFBZSxDQUFDLE9BQTBCLEVBQUUsT0FBWTtRQUMvRCxPQUFPLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUVRLEtBQUs7UUFDWixPQUFPLElBQUksa0JBQWtCLENBQzNCLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQ2YsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUNuQyxJQUFJLENBQUMsSUFBSSxFQUNULElBQUksQ0FBQyxVQUFVLEVBQ2YsSUFBSSxDQUFDLElBQUksQ0FDVixDQUFDO0lBQ0osQ0FBQztDQUNGO0FBRUQsTUFBTSxPQUFPLGtCQUFtQixTQUFRLFVBQVU7SUFDaEQsWUFDUyxHQUFlLEVBQ2YsUUFBeUIsRUFDaEMsSUFBa0IsRUFDbEIsVUFBbUM7UUFFbkMsS0FBSyxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUxqQixRQUFHLEdBQUgsR0FBRyxDQUFZO1FBQ2YsYUFBUSxHQUFSLFFBQVEsQ0FBaUI7SUFLbEMsQ0FBQztJQUVRLFlBQVksQ0FBQyxDQUFhO1FBQ2pDLE9BQU8sQ0FDTCxDQUFDLFlBQVksa0JBQWtCO1lBQy9CLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7WUFDNUIseUJBQXlCLENBQ3ZCLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUN0QixDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFDbkIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQzVCO1lBQ0QsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FDcEUsQ0FBQztJQUNKLENBQUM7SUFFUSxVQUFVO1FBQ2pCLE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVRLGVBQWUsQ0FBQyxPQUEwQixFQUFFLE9BQVk7UUFDL0QsT0FBTyxPQUFPLENBQUMsdUJBQXVCLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3hELENBQUM7SUFFUSxLQUFLO1FBQ1osT0FBTyxJQUFJLGtCQUFrQixDQUMzQixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxFQUNoQixJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxFQUNyQixJQUFJLENBQUMsSUFBSSxFQUNULElBQUksQ0FBQyxVQUFVLENBQ2hCLENBQUM7SUFDSixDQUFDO0NBQ0Y7QUFFRCxNQUFNLE9BQU8sZUFBZ0IsU0FBUSxVQUFVO0lBQzdDLFlBQ1MsU0FBcUIsRUFDckIsSUFBa0IsRUFDekIsSUFBa0IsRUFDbEIsVUFBbUM7UUFFbkMsS0FBSyxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUxqQixjQUFTLEdBQVQsU0FBUyxDQUFZO1FBQ3JCLFNBQUksR0FBSixJQUFJLENBQWM7SUFLM0IsQ0FBQztJQUVRLFlBQVksQ0FBQyxDQUFhO1FBQ2pDLE9BQU8sQ0FDTCxDQUFDLFlBQVksZUFBZTtZQUM1QixJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1lBQ3hDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUNwQyxDQUFDO0lBQ0osQ0FBQztJQUVRLFVBQVU7UUFDakIsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRVEsZUFBZSxDQUFDLE9BQTBCLEVBQUUsT0FBWTtRQUMvRCxPQUFPLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUVRLEtBQUs7UUFDWixPQUFPLElBQUksZUFBZSxDQUN4QixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxFQUN0QixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQ25DLElBQUksQ0FBQyxJQUFJLEVBQ1QsSUFBSSxDQUFDLFVBQVUsQ0FDaEIsQ0FBQztJQUNKLENBQUM7Q0FDRjtBQUVELE1BQU0sT0FBTyxXQUFZLFNBQVEsVUFBVTtJQUN6QyxZQUNTLEtBQW1ELEVBQzFELElBQWtCLEVBQ2xCLFVBQW1DO1FBRW5DLEtBQUssQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFKakIsVUFBSyxHQUFMLEtBQUssQ0FBOEM7SUFLNUQsQ0FBQztJQUVRLFlBQVksQ0FBQyxDQUFhO1FBQ2pDLE9BQU8sQ0FBQyxZQUFZLFdBQVcsSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUM7SUFDNUQsQ0FBQztJQUVRLFVBQVU7UUFDakIsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRVEsZUFBZSxDQUFDLE9BQTBCLEVBQUUsT0FBWTtRQUMvRCxPQUFPLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDakQsQ0FBQztJQUVRLEtBQUs7UUFDWixPQUFPLElBQUksV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDakUsQ0FBQztDQUNGO0FBRUQsTUFBTSxPQUFPLGVBQWU7SUFDMUIsWUFDUyxRQUFrQyxFQUNsQyxXQUF5QjtRQUR6QixhQUFRLEdBQVIsUUFBUSxDQUEwQjtRQUNsQyxnQkFBVyxHQUFYLFdBQVcsQ0FBYztJQUMvQixDQUFDO0lBRUosS0FBSztRQUNILE9BQU8sSUFBSSxlQUFlLENBQ3hCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsRUFDckMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUM3QyxDQUFDO0lBQ0osQ0FBQztDQUNGO0FBQ0QsTUFBTSxPQUFPLHNCQUFzQjtJQUVqQyxZQUNTLElBQVksRUFDWixVQUE0QixFQUNuQyxPQUFnQjtRQUZULFNBQUksR0FBSixJQUFJLENBQVE7UUFDWixlQUFVLEdBQVYsVUFBVSxDQUFrQjtRQUduQyx1RUFBdUU7UUFDdkUseUVBQXlFO1FBQ3pFLDhEQUE4RDtRQUM5RCxpRkFBaUY7UUFDakYsd0ZBQXdGO1FBQ3hGLG9EQUFvRDtRQUNwRCxJQUFJLENBQUMsT0FBTztZQUNWLE9BQU8sSUFBSSxVQUFVLEVBQUUsUUFBUSxFQUFFLElBQUksd0JBQXdCLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDdkYsQ0FBQztJQUVELEtBQUs7UUFDSCxPQUFPLElBQUksc0JBQXNCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM5RSxDQUFDO0NBQ0Y7QUFFRCxNQUFNLE9BQU8sWUFBWTtJQUN2QixZQUNTLElBQVksRUFDWixVQUEyQjtRQUQzQixTQUFJLEdBQUosSUFBSSxDQUFRO1FBQ1osZUFBVSxHQUFWLFVBQVUsQ0FBaUI7SUFDakMsQ0FBQztDQUNMO0FBQ0QsTUFBTSxPQUFPLGdCQUFnQjtJQUMzQjs7Ozs7Ozs7T0FRRztJQUNILFlBQ1MsSUFBWSxFQUNaLFVBQTJCLEVBQzNCLGlCQUEyQjtRQUYzQixTQUFJLEdBQUosSUFBSSxDQUFRO1FBQ1osZUFBVSxHQUFWLFVBQVUsQ0FBaUI7UUFDM0Isc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFVO0lBQ2pDLENBQUM7Q0FDTDtBQUlELE1BQU0saUJBQWlCLEdBQUcsR0FBRyxDQUFDO0FBQzlCLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQztBQUMxQixNQUFNLG1CQUFtQixHQUFHLEdBQUcsQ0FBQztBQUVoQyxNQUFNLE9BQU8sZUFBZ0IsU0FBUSxVQUFVO0lBQzdDLFlBQ1csU0FBbUIsRUFDbkIsWUFBNEIsRUFDNUIsZ0JBQW9DLEVBQ3BDLFdBQXlCLEVBQ2xDLFVBQW1DO1FBRW5DLEtBQUssQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFOdEIsY0FBUyxHQUFULFNBQVMsQ0FBVTtRQUNuQixpQkFBWSxHQUFaLFlBQVksQ0FBZ0I7UUFDNUIscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFvQjtRQUNwQyxnQkFBVyxHQUFYLFdBQVcsQ0FBYztJQUlwQyxDQUFDO0lBRVEsWUFBWSxDQUFDLENBQWE7UUFDakMscUVBQXFFO1FBQ3JFLE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVRLFVBQVU7UUFDakIsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRVEsZUFBZSxDQUFDLE9BQTBCLEVBQUUsT0FBWTtRQUMvRCxPQUFPLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUVRLEtBQUs7UUFDWixPQUFPLElBQUksZUFBZSxDQUN4QixJQUFJLENBQUMsU0FBUyxFQUNkLElBQUksQ0FBQyxZQUFZLEVBQ2pCLElBQUksQ0FBQyxnQkFBZ0IsRUFDckIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUM1QyxJQUFJLENBQUMsVUFBVSxDQUNoQixDQUFDO0lBQ0osQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDSCxpQkFBaUI7UUFDZixJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsSUFBSSxFQUFFLENBQUM7UUFDakQsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQzNCLFNBQVMsR0FBRyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLGlCQUFpQixHQUFHLFNBQVMsRUFBRSxDQUFDO1FBQzFFLENBQUM7UUFDRCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDNUIsU0FBUyxHQUFHLEdBQUcsU0FBUyxHQUFHLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3RFLENBQUM7UUFDRCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDN0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUU7Z0JBQzVDLFNBQVMsR0FBRyxHQUFHLFNBQVMsR0FBRyxtQkFBbUIsR0FBRyxRQUFRLEVBQUUsQ0FBQztZQUM5RCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFDRCxPQUFPLHFCQUFxQixDQUMxQixTQUFTLEVBQ1QsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQ3pCLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsQ0FDakMsQ0FBQztJQUNKLENBQUM7SUFFRCx3QkFBd0IsQ0FBQyxDQUFTO1FBQ2hDLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQztJQUM3RCxDQUFDO0lBRUQsd0JBQXdCLENBQUMsQ0FBUztRQUNoQyxPQUFPLENBQ0wsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxFQUFFLFVBQVUsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLFVBQVUsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUMzRixDQUFDO0lBQ0osQ0FBQztJQUVEOzs7Ozs7Ozs7O09BVUc7SUFDSCx5QkFBeUIsQ0FBQyxTQUFpQjtRQUN6QyxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3pELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDakQsSUFBSSxTQUFTLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQztRQUNqQyxJQUFJLFdBQVcsQ0FBQyxpQkFBaUIsRUFBRSxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQzFELFNBQVMsSUFBSSxHQUFHLFlBQVksR0FBRyxZQUFZLENBQ3pDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLEVBQzNDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQ3RDLEVBQUUsQ0FBQztRQUNOLENBQUM7UUFDRCxPQUFPLHFCQUFxQixDQUMxQixTQUFTLEVBQ1QsV0FBVyxDQUFDLElBQUksRUFDaEIsSUFBSSxDQUFDLHdCQUF3QixDQUFDLFNBQVMsQ0FBQyxDQUN6QyxDQUFDO0lBQ0osQ0FBQztDQUNGO0FBWUQsTUFBTSxhQUFhLEdBQUcsQ0FBQyxHQUFXLEVBQVUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQzFFLE1BQU0sbUJBQW1CLEdBQUcsQ0FBQyxHQUFXLEVBQVUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQzlFLE1BQU0sWUFBWSxHQUFHLENBQUMsR0FBVyxFQUFVLEVBQUUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztBQUN2RSxNQUFNLHdCQUF3QixHQUFHLENBQUMsR0FBVyxFQUFVLEVBQUUsQ0FDdkQsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztBQUVuRDs7Ozs7Ozs7Ozs7OztHQWFHO0FBQ0gsU0FBUyxxQkFBcUIsQ0FDNUIsU0FBaUIsRUFDakIsV0FBbUIsRUFDbkIsS0FBNkI7SUFFN0IsSUFBSSxTQUFTLEtBQUssRUFBRSxFQUFFLENBQUM7UUFDckIsT0FBTztZQUNMLE1BQU0sRUFBRSxXQUFXO1lBQ25CLEdBQUcsRUFBRSx3QkFBd0IsQ0FBQyxtQkFBbUIsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUM5RSxLQUFLO1NBQ04sQ0FBQztJQUNKLENBQUM7U0FBTSxDQUFDO1FBQ04sT0FBTztZQUNMLE1BQU0sRUFBRSxJQUFJLFNBQVMsSUFBSSxXQUFXLEVBQUU7WUFDdEMsR0FBRyxFQUFFLHdCQUF3QixDQUMzQixJQUFJLFlBQVksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxhQUFhLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FDM0U7WUFDRCxLQUFLO1NBQ04sQ0FBQztJQUNKLENBQUM7QUFDSCxDQUFDO0FBRUQsTUFBTSxPQUFPLFlBQWEsU0FBUSxVQUFVO0lBQzFDLFlBQ1MsS0FBd0IsRUFDL0IsSUFBa0IsRUFDWCxhQUE0QixJQUFJLEVBQ3ZDLFVBQW1DO1FBRW5DLEtBQUssQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFMakIsVUFBSyxHQUFMLEtBQUssQ0FBbUI7UUFFeEIsZUFBVSxHQUFWLFVBQVUsQ0FBc0I7SUFJekMsQ0FBQztJQUVRLFlBQVksQ0FBQyxDQUFhO1FBQ2pDLE9BQU8sQ0FDTCxDQUFDLFlBQVksWUFBWTtZQUN6QixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUk7WUFDaEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVO1lBQzVDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUN2QyxDQUFDO0lBQ0osQ0FBQztJQUVRLFVBQVU7UUFDakIsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRVEsZUFBZSxDQUFDLE9BQTBCLEVBQUUsT0FBWTtRQUMvRCxPQUFPLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUVRLEtBQUs7UUFDWixPQUFPLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNuRixDQUFDO0NBQ0Y7QUFFRCxNQUFNLE9BQU8saUJBQWlCO0lBQzVCLFlBQ1MsVUFBeUIsRUFDekIsSUFBbUIsRUFDbkIsT0FBb0I7UUFGcEIsZUFBVSxHQUFWLFVBQVUsQ0FBZTtRQUN6QixTQUFJLEdBQUosSUFBSSxDQUFlO1FBQ25CLFlBQU8sR0FBUCxPQUFPLENBQWE7SUFDMUIsQ0FBQztDQUVMO0FBRUQsTUFBTSxPQUFPLGVBQWdCLFNBQVEsVUFBVTtJQUc3QyxZQUNTLFNBQXFCLEVBQzVCLFFBQW9CLEVBQ2IsWUFBK0IsSUFBSSxFQUMxQyxJQUFrQixFQUNsQixVQUFtQztRQUVuQyxLQUFLLENBQUMsSUFBSSxJQUFJLFFBQVEsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFObEMsY0FBUyxHQUFULFNBQVMsQ0FBWTtRQUVyQixjQUFTLEdBQVQsU0FBUyxDQUEwQjtRQUsxQyxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztJQUMzQixDQUFDO0lBRVEsWUFBWSxDQUFDLENBQWE7UUFDakMsT0FBTyxDQUNMLENBQUMsWUFBWSxlQUFlO1lBQzVCLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7WUFDeEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztZQUN0QyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FDbEQsQ0FBQztJQUNKLENBQUM7SUFFUSxVQUFVO1FBQ2pCLE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVRLGVBQWUsQ0FBQyxPQUEwQixFQUFFLE9BQVk7UUFDL0QsT0FBTyxPQUFPLENBQUMsb0JBQW9CLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFFUSxLQUFLO1FBQ1osT0FBTyxJQUFJLGVBQWUsQ0FDeEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsRUFDdEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsRUFDckIsSUFBSSxDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsRUFDdkIsSUFBSSxDQUFDLElBQUksRUFDVCxJQUFJLENBQUMsVUFBVSxDQUNoQixDQUFDO0lBQ0osQ0FBQztDQUNGO0FBRUQsTUFBTSxPQUFPLGlCQUFrQixTQUFRLFVBQVU7SUFDL0MsWUFDUyxHQUFXLEVBQ2xCLFVBQW1DO1FBRW5DLEtBQUssQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFIakIsUUFBRyxHQUFILEdBQUcsQ0FBUTtJQUlwQixDQUFDO0lBRVEsWUFBWSxDQUFDLENBQWE7UUFDakMsT0FBTyxDQUFDLFlBQVksaUJBQWlCLElBQUksSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDO0lBQzlELENBQUM7SUFFUSxVQUFVO1FBQ2pCLE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVRLGVBQWUsQ0FBQyxPQUEwQixFQUFFLE9BQVk7UUFDL0QsT0FBTyxPQUFPLENBQUMsc0JBQXNCLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3ZELENBQUM7SUFFUSxLQUFLO1FBQ1osT0FBTyxJQUFJLGlCQUFpQixDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQzFELENBQUM7Q0FDRjtBQUVELE1BQU0sT0FBTyxPQUFRLFNBQVEsVUFBVTtJQUNyQyxZQUNTLFNBQXFCLEVBQzVCLFVBQW1DO1FBRW5DLEtBQUssQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFIdEIsY0FBUyxHQUFULFNBQVMsQ0FBWTtJQUk5QixDQUFDO0lBRVEsWUFBWSxDQUFDLENBQWE7UUFDakMsT0FBTyxDQUFDLFlBQVksT0FBTyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUMxRSxDQUFDO0lBRVEsVUFBVTtRQUNqQixPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFUSxlQUFlLENBQUMsT0FBMEIsRUFBRSxPQUFZO1FBQy9ELE9BQU8sT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVRLEtBQUs7UUFDWixPQUFPLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQzlELENBQUM7Q0FDRjtBQUVELE1BQU0sT0FBTyxPQUFPO0lBQ2xCLFlBQ1MsSUFBWSxFQUNaLE9BQW9CLElBQUk7UUFEeEIsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUNaLFNBQUksR0FBSixJQUFJLENBQW9CO0lBQzlCLENBQUM7SUFFSixZQUFZLENBQUMsS0FBYztRQUN6QixPQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssS0FBSyxDQUFDLElBQUksQ0FBQztJQUNsQyxDQUFDO0lBRUQsS0FBSztRQUNILE9BQU8sSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDM0MsQ0FBQztDQUNGO0FBRUQsTUFBTSxPQUFPLFlBQWEsU0FBUSxVQUFVO0lBQzFDLFlBQ1MsTUFBaUIsRUFDakIsVUFBdUIsRUFDOUIsSUFBa0IsRUFDbEIsVUFBbUMsRUFDNUIsSUFBb0I7UUFFM0IsS0FBSyxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztRQU5qQixXQUFNLEdBQU4sTUFBTSxDQUFXO1FBQ2pCLGVBQVUsR0FBVixVQUFVLENBQWE7UUFHdkIsU0FBSSxHQUFKLElBQUksQ0FBZ0I7SUFHN0IsQ0FBQztJQUVRLFlBQVksQ0FBQyxDQUF5QjtRQUM3QyxPQUFPLENBQ0wsQ0FBQyxDQUFDLFlBQVksWUFBWSxJQUFJLENBQUMsWUFBWSxtQkFBbUIsQ0FBQztZQUMvRCxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUM7WUFDdkMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQ2hELENBQUM7SUFDSixDQUFDO0lBRVEsVUFBVTtRQUNqQixPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFUSxlQUFlLENBQUMsT0FBMEIsRUFBRSxPQUFZO1FBQy9ELE9BQU8sT0FBTyxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRUQsVUFBVSxDQUFDLElBQVksRUFBRSxTQUF3QjtRQUMvQyxPQUFPLElBQUksbUJBQW1CLENBQzVCLElBQUksRUFDSixJQUFJLENBQUMsTUFBTSxFQUNYLElBQUksQ0FBQyxVQUFVLEVBQ2YsSUFBSSxDQUFDLElBQUksRUFDVCxTQUFTLEVBQ1QsSUFBSSxDQUFDLFVBQVUsQ0FDaEIsQ0FBQztJQUNKLENBQUM7SUFFUSxLQUFLO1FBQ1oseUNBQXlDO1FBQ3pDLE9BQU8sSUFBSSxZQUFZLENBQ3JCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsRUFDakMsSUFBSSxDQUFDLFVBQVUsRUFDZixJQUFJLENBQUMsSUFBSSxFQUNULElBQUksQ0FBQyxVQUFVLEVBQ2YsSUFBSSxDQUFDLElBQUksQ0FDVixDQUFDO0lBQ0osQ0FBQztDQUNGO0FBRUQsTUFBTSxPQUFPLGlCQUFrQixTQUFRLFVBQVU7SUFDL0MsK0RBQStEO0lBQy9ELG1EQUFtRDtJQUVuRCxZQUNTLE1BQWlCLEVBQ2pCLElBQThCLEVBQ3JDLElBQWtCLEVBQ2xCLFVBQW1DO1FBRW5DLEtBQUssQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFMakIsV0FBTSxHQUFOLE1BQU0sQ0FBVztRQUNqQixTQUFJLEdBQUosSUFBSSxDQUEwQjtJQUt2QyxDQUFDO0lBRVEsWUFBWSxDQUFDLENBQWE7UUFDakMsSUFBSSxDQUFDLENBQUMsQ0FBQyxZQUFZLGlCQUFpQixDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1lBQ2xGLE9BQU8sS0FBSyxDQUFDO1FBQ2YsQ0FBQztRQUVELElBQUksSUFBSSxDQUFDLElBQUksWUFBWSxVQUFVLElBQUksQ0FBQyxDQUFDLElBQUksWUFBWSxVQUFVLEVBQUUsQ0FBQztZQUNwRSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4QyxDQUFDO1FBRUQsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQ3RELE9BQU8sZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDN0MsQ0FBQztRQUVELE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVRLFVBQVU7UUFDakIsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRVEsZUFBZSxDQUFDLE9BQTBCLEVBQUUsT0FBWTtRQUMvRCxPQUFPLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDdkQsQ0FBQztJQUVRLEtBQUs7UUFDWix5Q0FBeUM7UUFDekMsT0FBTyxJQUFJLGlCQUFpQixDQUMxQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQ2pDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxFQUN4RCxJQUFJLENBQUMsSUFBSSxFQUNULElBQUksQ0FBQyxVQUFVLENBQ2hCLENBQUM7SUFDSixDQUFDO0lBRUQsVUFBVSxDQUFDLElBQVksRUFBRSxTQUF3QjtRQUMvQyxPQUFPLElBQUksY0FBYyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDbkYsQ0FBQztDQUNGO0FBRUQsTUFBTSxPQUFPLGlCQUFrQixTQUFRLFVBQVU7SUFDL0MsWUFDUyxRQUF1QixFQUN2QixJQUFnQixFQUN2QixJQUFrQixFQUNsQixVQUFtQyxFQUM1QixTQUFrQixJQUFJO1FBRTdCLEtBQUssQ0FBQyxJQUFJLElBQUksV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBTmhDLGFBQVEsR0FBUixRQUFRLENBQWU7UUFDdkIsU0FBSSxHQUFKLElBQUksQ0FBWTtRQUdoQixXQUFNLEdBQU4sTUFBTSxDQUFnQjtJQUcvQixDQUFDO0lBRVEsWUFBWSxDQUFDLENBQWE7UUFDakMsT0FBTyxDQUNMLENBQUMsWUFBWSxpQkFBaUI7WUFDOUIsSUFBSSxDQUFDLFFBQVEsS0FBSyxDQUFDLENBQUMsUUFBUTtZQUM1QixJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQy9CLENBQUM7SUFDSixDQUFDO0lBRVEsVUFBVTtRQUNqQixPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFUSxlQUFlLENBQUMsT0FBMEIsRUFBRSxPQUFZO1FBQy9ELE9BQU8sT0FBTyxDQUFDLHNCQUFzQixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBRVEsS0FBSztRQUNaLE9BQU8sSUFBSSxpQkFBaUIsQ0FDMUIsSUFBSSxDQUFDLFFBQVEsRUFDYixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxFQUNqQixJQUFJLENBQUMsSUFBSSxFQUNULElBQUksQ0FBQyxVQUFVLEVBQ2YsSUFBSSxDQUFDLE1BQU0sQ0FDWixDQUFDO0lBQ0osQ0FBQztDQUNGO0FBRUQsTUFBTSxPQUFPLGtCQUFtQixTQUFRLFVBQVU7SUFFaEQsWUFDUyxRQUF3QixFQUMvQixHQUFlLEVBQ1IsR0FBZSxFQUN0QixJQUFrQixFQUNsQixVQUFtQyxFQUM1QixTQUFrQixJQUFJO1FBRTdCLEtBQUssQ0FBQyxJQUFJLElBQUksR0FBRyxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztRQVA3QixhQUFRLEdBQVIsUUFBUSxDQUFnQjtRQUV4QixRQUFHLEdBQUgsR0FBRyxDQUFZO1FBR2YsV0FBTSxHQUFOLE1BQU0sQ0FBZ0I7UUFHN0IsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7SUFDakIsQ0FBQztJQUVRLFlBQVksQ0FBQyxDQUFhO1FBQ2pDLE9BQU8sQ0FDTCxDQUFDLFlBQVksa0JBQWtCO1lBQy9CLElBQUksQ0FBQyxRQUFRLEtBQUssQ0FBQyxDQUFDLFFBQVE7WUFDNUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztZQUM1QixJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQzdCLENBQUM7SUFDSixDQUFDO0lBRVEsVUFBVTtRQUNqQixPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFUSxlQUFlLENBQUMsT0FBMEIsRUFBRSxPQUFZO1FBQy9ELE9BQU8sT0FBTyxDQUFDLHVCQUF1QixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBRVEsS0FBSztRQUNaLE9BQU8sSUFBSSxrQkFBa0IsQ0FDM0IsSUFBSSxDQUFDLFFBQVEsRUFDYixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxFQUNoQixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxFQUNoQixJQUFJLENBQUMsSUFBSSxFQUNULElBQUksQ0FBQyxVQUFVLEVBQ2YsSUFBSSxDQUFDLE1BQU0sQ0FDWixDQUFDO0lBQ0osQ0FBQztDQUNGO0FBRUQsTUFBTSxPQUFPLFlBQWEsU0FBUSxVQUFVO0lBQzFDLFlBQ1MsUUFBb0IsRUFDcEIsSUFBWSxFQUNuQixJQUFrQixFQUNsQixVQUFtQztRQUVuQyxLQUFLLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBTGpCLGFBQVEsR0FBUixRQUFRLENBQVk7UUFDcEIsU0FBSSxHQUFKLElBQUksQ0FBUTtJQUtyQixDQUFDO0lBRUQsaUdBQWlHO0lBQ2pHLElBQUksS0FBSztRQUNQLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQztJQUNuQixDQUFDO0lBRVEsWUFBWSxDQUFDLENBQWE7UUFDakMsT0FBTyxDQUNMLENBQUMsWUFBWSxZQUFZLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FDNUYsQ0FBQztJQUNKLENBQUM7SUFFUSxVQUFVO1FBQ2pCLE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVRLGVBQWUsQ0FBQyxPQUEwQixFQUFFLE9BQVk7UUFDL0QsT0FBTyxPQUFPLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFRCxHQUFHLENBQUMsS0FBaUI7UUFDbkIsT0FBTyxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDbkYsQ0FBQztJQUVRLEtBQUs7UUFDWixPQUFPLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUN4RixDQUFDO0NBQ0Y7QUFFRCxNQUFNLE9BQU8sV0FBWSxTQUFRLFVBQVU7SUFDekMsWUFDUyxRQUFvQixFQUNwQixLQUFpQixFQUN4QixJQUFrQixFQUNsQixVQUFtQztRQUVuQyxLQUFLLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBTGpCLGFBQVEsR0FBUixRQUFRLENBQVk7UUFDcEIsVUFBSyxHQUFMLEtBQUssQ0FBWTtJQUsxQixDQUFDO0lBRVEsWUFBWSxDQUFDLENBQWE7UUFDakMsT0FBTyxDQUNMLENBQUMsWUFBWSxXQUFXO1lBQ3hCLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7WUFDdEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUNqQyxDQUFDO0lBQ0osQ0FBQztJQUVRLFVBQVU7UUFDakIsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRVEsZUFBZSxDQUFDLE9BQTBCLEVBQUUsT0FBWTtRQUMvRCxPQUFPLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDakQsQ0FBQztJQUVELEdBQUcsQ0FBQyxLQUFpQjtRQUNuQixPQUFPLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNuRixDQUFDO0lBRVEsS0FBSztRQUNaLE9BQU8sSUFBSSxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ2hHLENBQUM7Q0FDRjtBQUVELE1BQU0sT0FBTyxnQkFBaUIsU0FBUSxVQUFVO0lBRTlDLFlBQVksT0FBcUIsRUFBRSxJQUFrQixFQUFFLFVBQW1DO1FBQ3hGLEtBQUssQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDeEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7SUFDekIsQ0FBQztJQUVRLFVBQVU7UUFDakIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUVRLFlBQVksQ0FBQyxDQUFhO1FBQ2pDLE9BQU8sQ0FBQyxZQUFZLGdCQUFnQixJQUFJLGdCQUFnQixDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3BGLENBQUM7SUFDUSxlQUFlLENBQUMsT0FBMEIsRUFBRSxPQUFZO1FBQy9ELE9BQU8sT0FBTyxDQUFDLHFCQUFxQixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRVEsS0FBSztRQUNaLE9BQU8sSUFBSSxnQkFBZ0IsQ0FDekIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUNsQyxJQUFJLENBQUMsSUFBSSxFQUNULElBQUksQ0FBQyxVQUFVLENBQ2hCLENBQUM7SUFDSixDQUFDO0NBQ0Y7QUFFRCxNQUFNLE9BQU8sZUFBZTtJQUMxQixZQUNTLEdBQVcsRUFDWCxLQUFpQixFQUNqQixNQUFlO1FBRmYsUUFBRyxHQUFILEdBQUcsQ0FBUTtRQUNYLFVBQUssR0FBTCxLQUFLLENBQVk7UUFDakIsV0FBTSxHQUFOLE1BQU0sQ0FBUztJQUNyQixDQUFDO0lBQ0osWUFBWSxDQUFDLENBQWtCO1FBQzdCLE9BQU8sSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNoRSxDQUFDO0lBRUQsS0FBSztRQUNILE9BQU8sSUFBSSxlQUFlLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN4RSxDQUFDO0NBQ0Y7QUFFRCxNQUFNLE9BQU8sY0FBZSxTQUFRLFVBQVU7SUFFNUMsWUFDUyxPQUEwQixFQUNqQyxJQUFxQixFQUNyQixVQUFtQztRQUVuQyxLQUFLLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBSmpCLFlBQU8sR0FBUCxPQUFPLENBQW1CO1FBRjVCLGNBQVMsR0FBZ0IsSUFBSSxDQUFDO1FBT25DLElBQUksSUFBSSxFQUFFLENBQUM7WUFDVCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDbEMsQ0FBQztJQUNILENBQUM7SUFFUSxZQUFZLENBQUMsQ0FBYTtRQUNqQyxPQUFPLENBQUMsWUFBWSxjQUFjLElBQUksZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDbEYsQ0FBQztJQUVRLFVBQVU7UUFDakIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFFUSxlQUFlLENBQUMsT0FBMEIsRUFBRSxPQUFZO1FBQy9ELE9BQU8sT0FBTyxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBRVEsS0FBSztRQUNaLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUNoRSxPQUFPLElBQUksY0FBYyxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsSUFBc0IsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDeEYsQ0FBQztDQUNGO0FBRUQsTUFBTSxPQUFPLFNBQVUsU0FBUSxVQUFVO0lBQ3ZDLFlBQ1MsS0FBbUIsRUFDMUIsVUFBbUM7UUFFbkMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUh6QyxVQUFLLEdBQUwsS0FBSyxDQUFjO0lBSTVCLENBQUM7SUFFUSxZQUFZLENBQUMsQ0FBYTtRQUNqQyxPQUFPLENBQUMsWUFBWSxTQUFTLElBQUksZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDekUsQ0FBQztJQUVRLFVBQVU7UUFDakIsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRVEsZUFBZSxDQUFDLE9BQTBCLEVBQUUsT0FBWTtRQUMvRCxPQUFPLE9BQU8sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFUSxLQUFLO1FBQ1osT0FBTyxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztJQUN6RCxDQUFDO0NBQ0Y7QUE2QkQsTUFBTSxDQUFDLE1BQU0sU0FBUyxHQUFHLElBQUksV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDM0QsTUFBTSxDQUFDLE1BQU0sZUFBZSxHQUFHLElBQUksV0FBVyxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFFMUUsZUFBZTtBQUNmLE1BQU0sQ0FBTixJQUFZLFlBTVg7QUFORCxXQUFZLFlBQVk7SUFDdEIsK0NBQVEsQ0FBQTtJQUNSLGlEQUFjLENBQUE7SUFDZCxxREFBZ0IsQ0FBQTtJQUNoQix1REFBaUIsQ0FBQTtJQUNqQixtREFBZSxDQUFBO0FBQ2pCLENBQUMsRUFOVyxZQUFZLEtBQVosWUFBWSxRQU12QjtBQUVELE1BQU0sT0FBTyxjQUFjO0lBQ3pCLFlBQ1MsSUFBWSxFQUNaLFNBQWtCLEVBQ2xCLGVBQXdCO1FBRnhCLFNBQUksR0FBSixJQUFJLENBQVE7UUFDWixjQUFTLEdBQVQsU0FBUyxDQUFTO1FBQ2xCLG9CQUFlLEdBQWYsZUFBZSxDQUFTO0lBQzlCLENBQUM7SUFDSixRQUFRO1FBQ04sT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztJQUN2RCxDQUFDO0NBQ0Y7QUFDRCxNQUFNLE9BQU8sWUFBYSxTQUFRLGNBQWM7SUFDOUMsWUFBbUIsSUFBZ0I7UUFDakMsS0FBSyxDQUFDLEVBQUUsRUFBRSxlQUFlLENBQUMsSUFBSSxFQUFFLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBRDNDLFNBQUksR0FBSixJQUFJLENBQVk7SUFFbkMsQ0FBQztJQUNRLFFBQVE7UUFDZixPQUFPLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbEMsQ0FBQztDQUNGO0FBRUQsTUFBTSxPQUFnQixTQUFTO0lBQzdCLFlBQ1MsWUFBMEIsWUFBWSxDQUFDLElBQUksRUFDM0MsYUFBcUMsSUFBSSxFQUN6QyxlQUFrQztRQUZsQyxjQUFTLEdBQVQsU0FBUyxDQUFrQztRQUMzQyxlQUFVLEdBQVYsVUFBVSxDQUErQjtRQUN6QyxvQkFBZSxHQUFmLGVBQWUsQ0FBbUI7SUFDeEMsQ0FBQztJQVNKLFdBQVcsQ0FBQyxRQUFzQjtRQUNoQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUVELGlCQUFpQixDQUFDLGNBQThCO1FBQzlDLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLGVBQWUsSUFBSSxFQUFFLENBQUM7UUFDbEQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDNUMsQ0FBQztDQUNGO0FBRUQsTUFBTSxPQUFPLGNBQWUsU0FBUSxTQUFTO0lBRTNDLFlBQ1MsSUFBWSxFQUNaLEtBQWtCLEVBQ3pCLElBQWtCLEVBQ2xCLFNBQXdCLEVBQ3hCLFVBQW1DLEVBQ25DLGVBQWtDO1FBRWxDLEtBQUssQ0FBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBUHZDLFNBQUksR0FBSixJQUFJLENBQVE7UUFDWixVQUFLLEdBQUwsS0FBSyxDQUFhO1FBT3pCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUM7SUFDcEQsQ0FBQztJQUNRLFlBQVksQ0FBQyxJQUFlO1FBQ25DLE9BQU8sQ0FDTCxJQUFJLFlBQVksY0FBYztZQUM5QixJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxJQUFJO1lBQ3ZCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FDakYsQ0FBQztJQUNKLENBQUM7SUFDUSxjQUFjLENBQUMsT0FBeUIsRUFBRSxPQUFZO1FBQzdELE9BQU8sT0FBTyxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNwRCxDQUFDO0NBQ0Y7QUFFRCxNQUFNLE9BQU8sbUJBQW9CLFNBQVEsU0FBUztJQUVoRCxZQUNTLElBQVksRUFDWixNQUFpQixFQUNqQixVQUF1QixFQUM5QixJQUFrQixFQUNsQixTQUF3QixFQUN4QixVQUFtQyxFQUNuQyxlQUFrQztRQUVsQyxLQUFLLENBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxlQUFlLENBQUMsQ0FBQztRQVJ2QyxTQUFJLEdBQUosSUFBSSxDQUFRO1FBQ1osV0FBTSxHQUFOLE1BQU0sQ0FBVztRQUNqQixlQUFVLEdBQVYsVUFBVSxDQUFhO1FBTzlCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxJQUFJLElBQUksQ0FBQztJQUMzQixDQUFDO0lBQ1EsWUFBWSxDQUFDLElBQWU7UUFDbkMsT0FBTyxDQUNMLElBQUksWUFBWSxtQkFBbUI7WUFDbkMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDO1lBQzFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUNuRCxDQUFDO0lBQ0osQ0FBQztJQUNRLGNBQWMsQ0FBQyxPQUF5QixFQUFFLE9BQVk7UUFDN0QsT0FBTyxPQUFPLENBQUMsd0JBQXdCLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3pELENBQUM7Q0FDRjtBQUVELE1BQU0sT0FBTyxtQkFBb0IsU0FBUSxTQUFTO0lBQ2hELFlBQ1MsSUFBZ0IsRUFDdkIsVUFBbUMsRUFDbkMsZUFBa0M7UUFFbEMsS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBSi9DLFNBQUksR0FBSixJQUFJLENBQVk7SUFLekIsQ0FBQztJQUNRLFlBQVksQ0FBQyxJQUFlO1FBQ25DLE9BQU8sSUFBSSxZQUFZLG1CQUFtQixJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNsRixDQUFDO0lBQ1EsY0FBYyxDQUFDLE9BQXlCLEVBQUUsT0FBWTtRQUM3RCxPQUFPLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDcEQsQ0FBQztDQUNGO0FBRUQsTUFBTSxPQUFPLGVBQWdCLFNBQVEsU0FBUztJQUM1QyxZQUNTLEtBQWlCLEVBQ3hCLGFBQXFDLElBQUksRUFDekMsZUFBa0M7UUFFbEMsS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBSi9DLFVBQUssR0FBTCxLQUFLLENBQVk7SUFLMUIsQ0FBQztJQUNRLFlBQVksQ0FBQyxJQUFlO1FBQ25DLE9BQU8sSUFBSSxZQUFZLGVBQWUsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDaEYsQ0FBQztJQUNRLGNBQWMsQ0FBQyxPQUF5QixFQUFFLE9BQVk7UUFDN0QsT0FBTyxPQUFPLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNoRCxDQUFDO0NBQ0Y7QUFFRCxNQUFNLE9BQU8sTUFBTyxTQUFRLFNBQVM7SUFDbkMsWUFDUyxTQUFxQixFQUNyQixRQUFxQixFQUNyQixZQUF5QixFQUFFLEVBQ2xDLFVBQW1DLEVBQ25DLGVBQWtDO1FBRWxDLEtBQUssQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxlQUFlLENBQUMsQ0FBQztRQU4vQyxjQUFTLEdBQVQsU0FBUyxDQUFZO1FBQ3JCLGFBQVEsR0FBUixRQUFRLENBQWE7UUFDckIsY0FBUyxHQUFULFNBQVMsQ0FBa0I7SUFLcEMsQ0FBQztJQUNRLFlBQVksQ0FBQyxJQUFlO1FBQ25DLE9BQU8sQ0FDTCxJQUFJLFlBQVksTUFBTTtZQUN0QixJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO1lBQzNDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUM5QyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FDakQsQ0FBQztJQUNKLENBQUM7SUFDUSxjQUFjLENBQUMsT0FBeUIsRUFBRSxPQUFZO1FBQzdELE9BQU8sT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDNUMsQ0FBQztDQUNGO0FBVUQsTUFBTSxPQUFPLG1CQUFtQjtJQUM5QixTQUFTLENBQUMsR0FBUyxFQUFFLE9BQVk7UUFDL0IsT0FBTyxHQUFHLENBQUM7SUFDYixDQUFDO0lBQ0QsZUFBZSxDQUFDLEdBQWUsRUFBRSxPQUFZO1FBQzNDLElBQUksR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2IsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3BDLENBQUM7UUFDRCxPQUFPLEdBQUcsQ0FBQztJQUNiLENBQUM7SUFDRCxnQkFBZ0IsQ0FBQyxJQUFpQixFQUFFLE9BQVk7UUFDOUMsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBQ0QsbUJBQW1CLENBQUMsSUFBb0IsRUFBRSxPQUFZO1FBQ3BELElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMxQyxJQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssSUFBSSxFQUFFLENBQUM7WUFDN0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDckUsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUNELGNBQWMsQ0FBQyxJQUFlLEVBQUUsT0FBWTtRQUMxQyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFDRCxZQUFZLENBQUMsSUFBYSxFQUFFLE9BQVk7UUFDdEMsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBQ0QscUJBQXFCLENBQUMsSUFBK0IsRUFBRSxPQUFZO1FBQ2pFLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUNELG9CQUFvQixDQUFDLEdBQXlCLEVBQUUsT0FBWTtRQUMxRCxPQUFPLEdBQUcsQ0FBQztJQUNiLENBQUM7SUFDRCxlQUFlLENBQUMsR0FBZSxFQUFFLE9BQVk7UUFDM0MsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBQ0QsZ0JBQWdCLENBQUMsR0FBZ0IsRUFBRSxPQUFZO1FBQzdDLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUNELGlCQUFpQixDQUFDLEdBQWlCLEVBQUUsT0FBWTtRQUMvQyxHQUFHLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDekMsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBQ0QsaUJBQWlCLENBQUMsR0FBaUIsRUFBRSxPQUFZO1FBQy9DLEdBQUcsQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM1QyxHQUFHLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDekMsR0FBRyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3pDLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUNELGtCQUFrQixDQUFDLEdBQWtCLEVBQUUsT0FBWTtRQUNqRCxHQUFHLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDNUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3pDLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUNELHNCQUFzQixDQUFDLEdBQXNCLEVBQUUsT0FBWTtRQUN6RCxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFDRCx1QkFBdUIsQ0FBQyxHQUF1QixFQUFFLE9BQVk7UUFDM0QsR0FBRyxDQUFDLEVBQUUsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzVDLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUNELHVCQUF1QixDQUFDLEdBQXVCLEVBQUUsT0FBWTtRQUMzRCxHQUFHLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzVELE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUNELG9CQUFvQixDQUFDLEdBQW9CLEVBQUUsT0FBWTtRQUNyRCxHQUFHLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDN0MsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDNUMsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBQ0QsZ0JBQWdCLENBQUMsR0FBZ0IsRUFBRSxPQUFZO1FBQzdDLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUNELG9CQUFvQixDQUFDLEdBQW9CLEVBQUUsT0FBWTtRQUNyRCxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFDRCxpQkFBaUIsQ0FBQyxHQUFpQixFQUFFLE9BQVk7UUFDL0MsSUFBSSxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDbkIsR0FBRyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDbEUsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUNELG9CQUFvQixDQUFDLEdBQW9CLEVBQUUsT0FBWTtRQUNyRCxHQUFHLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDN0MsR0FBRyxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzVDLEdBQUcsQ0FBQyxTQUFVLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM5QyxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFDRCxZQUFZLENBQUMsR0FBWSxFQUFFLE9BQVk7UUFDckMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzdDLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUNELGlCQUFpQixDQUFDLEdBQWlCLEVBQUUsT0FBWTtRQUMvQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNqRCxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFDRCxzQkFBc0IsQ0FBQyxHQUFzQixFQUFFLE9BQVk7UUFDekQsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQzVCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzdDLENBQUM7YUFBTSxDQUFDO1lBQ04sSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzFDLENBQUM7UUFFRCxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFDRCxzQkFBc0IsQ0FBQyxHQUFzQixFQUFFLE9BQVk7UUFDekQsR0FBRyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3hDLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUNELHVCQUF1QixDQUFDLEdBQXVCLEVBQUUsT0FBWTtRQUMzRCxHQUFHLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDdkMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZDLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUNELGlCQUFpQixDQUFDLEdBQWlCLEVBQUUsT0FBWTtRQUMvQyxHQUFHLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDNUMsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBQ0QsZ0JBQWdCLENBQUMsR0FBZ0IsRUFBRSxPQUFZO1FBQzdDLEdBQUcsQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM1QyxHQUFHLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDekMsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBQ0QscUJBQXFCLENBQUMsR0FBcUIsRUFBRSxPQUFZO1FBQ3ZELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQy9DLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUNELG1CQUFtQixDQUFDLEdBQW1CLEVBQUUsT0FBWTtRQUNuRCxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDM0UsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBQ0QsY0FBYyxDQUFDLEdBQWMsRUFBRSxPQUFZO1FBQ3pDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzdDLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUNELG1CQUFtQixDQUFDLEtBQW1CLEVBQUUsT0FBWTtRQUNuRCxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQy9ELENBQUM7SUFFRCxtQkFBbUIsQ0FBQyxJQUFvQixFQUFFLE9BQVk7UUFDcEQsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDZixJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDNUMsQ0FBQztRQUNELElBQUksSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2QsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3JDLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFDRCx3QkFBd0IsQ0FBQyxJQUF5QixFQUFFLE9BQVk7UUFDOUQsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDbEQsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDZCxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDckMsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUNELG1CQUFtQixDQUFDLElBQXlCLEVBQUUsT0FBWTtRQUN6RCxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDekMsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBQ0QsZUFBZSxDQUFDLElBQXFCLEVBQUUsT0FBWTtRQUNqRCxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDMUMsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBQ0QsV0FBVyxDQUFDLElBQVksRUFBRSxPQUFZO1FBQ3BDLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM5QyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNoRCxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNqRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFDRCxrQkFBa0IsQ0FBQyxLQUFrQixFQUFFLE9BQVk7UUFDakQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUM5RCxDQUFDO0NBQ0Y7QUFFRCxNQUFNLFVBQVUsY0FBYyxDQUM1QixJQUFZLEVBQ1osWUFBcUIsS0FBSyxFQUMxQixrQkFBMkIsSUFBSTtJQUUvQixPQUFPLElBQUksY0FBYyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsZUFBZSxDQUFDLENBQUM7QUFDOUQsQ0FBQztBQUVELE1BQU0sVUFBVSxZQUFZLENBQUMsT0FBbUIsRUFBRTtJQUNoRCxPQUFPLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2hDLENBQUM7QUFFRCxNQUFNLFVBQVUsUUFBUSxDQUN0QixJQUFZLEVBQ1osSUFBa0IsRUFDbEIsVUFBbUM7SUFFbkMsT0FBTyxJQUFJLFdBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ2pELENBQUM7QUFFRCxNQUFNLFVBQVUsVUFBVSxDQUN4QixFQUFxQixFQUNyQixhQUE0QixJQUFJLEVBQ2hDLFVBQW1DO0lBRW5DLE9BQU8sSUFBSSxZQUFZLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDNUQsQ0FBQztBQUVELE1BQU0sVUFBVSxVQUFVLENBQ3hCLEVBQXFCLEVBQ3JCLFVBQTBCLEVBQzFCLGFBQTRCO0lBRTVCLE9BQU8sRUFBRSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7QUFDN0YsQ0FBQztBQUVELE1BQU0sVUFBVSxjQUFjLENBQzVCLElBQWdCLEVBQ2hCLGFBQTRCLEVBQzVCLFVBQTBCO0lBRTFCLE9BQU8sSUFBSSxjQUFjLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUM3RCxDQUFDO0FBRUQsTUFBTSxVQUFVLGdCQUFnQixDQUFJLElBQU8sRUFBRSxhQUE0QjtJQUN2RSxPQUFPLElBQUksZ0JBQWdCLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0FBQ25ELENBQUM7QUFFRCxNQUFNLFVBQVUsVUFBVSxDQUFDLElBQWdCO0lBQ3pDLE9BQU8sSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDOUIsQ0FBQztBQUVELE1BQU0sVUFBVSxVQUFVLENBQ3hCLE1BQW9CLEVBQ3BCLElBQWtCLEVBQ2xCLFVBQW1DO0lBRW5DLE9BQU8sSUFBSSxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ3hELENBQUM7QUFFRCxNQUFNLFVBQVUsVUFBVSxDQUN4QixNQUEyRCxFQUMzRCxPQUF1QixJQUFJO0lBRTNCLE9BQU8sSUFBSSxjQUFjLENBQ3ZCLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksZUFBZSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFDaEUsSUFBSSxFQUNKLElBQUksQ0FDTCxDQUFDO0FBQ0osQ0FBQztBQUVELE1BQU0sVUFBVSxLQUFLLENBQ25CLFFBQXVCLEVBQ3ZCLElBQWdCLEVBQ2hCLElBQVcsRUFDWCxVQUFtQztJQUVuQyxPQUFPLElBQUksaUJBQWlCLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDakUsQ0FBQztBQUVELE1BQU0sVUFBVSxHQUFHLENBQUMsSUFBZ0IsRUFBRSxVQUFtQztJQUN2RSxPQUFPLElBQUksT0FBTyxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztBQUN2QyxDQUFDO0FBRUQsTUFBTSxVQUFVLEVBQUUsQ0FDaEIsTUFBaUIsRUFDakIsSUFBaUIsRUFDakIsSUFBa0IsRUFDbEIsVUFBbUMsRUFDbkMsSUFBb0I7SUFFcEIsT0FBTyxJQUFJLFlBQVksQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDaEUsQ0FBQztBQUVELE1BQU0sVUFBVSxPQUFPLENBQ3JCLE1BQWlCLEVBQ2pCLElBQThCLEVBQzlCLElBQWtCLEVBQ2xCLFVBQW1DO0lBRW5DLE9BQU8sSUFBSSxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztBQUMvRCxDQUFDO0FBRUQsTUFBTSxVQUFVLE1BQU0sQ0FDcEIsU0FBcUIsRUFDckIsVUFBdUIsRUFDdkIsVUFBd0IsRUFDeEIsVUFBNEIsRUFDNUIsZUFBa0M7SUFFbEMsT0FBTyxJQUFJLE1BQU0sQ0FBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsZUFBZSxDQUFDLENBQUM7QUFDcEYsQ0FBQztBQUVELE1BQU0sVUFBVSxjQUFjLENBQzVCLEdBQWUsRUFDZixRQUF5QixFQUN6QixJQUFrQixFQUNsQixVQUFtQztJQUVuQyxPQUFPLElBQUksa0JBQWtCLENBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDakUsQ0FBQztBQUVELE1BQU0sVUFBVSxPQUFPLENBQ3JCLEtBQVUsRUFDVixJQUFrQixFQUNsQixVQUFtQztJQUVuQyxPQUFPLElBQUksV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDbEQsQ0FBQztBQUVELE1BQU0sVUFBVSxlQUFlLENBQzdCLFNBQW1CLEVBQ25CLFlBQTRCLEVBQzVCLGdCQUFvQyxFQUNwQyxXQUF5QixFQUN6QixVQUFtQztJQUVuQyxPQUFPLElBQUksZUFBZSxDQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUUsZ0JBQWdCLEVBQUUsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ2pHLENBQUM7QUFFRCxNQUFNLFVBQVUsTUFBTSxDQUFDLEdBQWU7SUFDcEMsT0FBTyxHQUFHLFlBQVksV0FBVyxJQUFJLEdBQUcsQ0FBQyxLQUFLLEtBQUssSUFBSSxDQUFDO0FBQzFELENBQUM7QUE2QkQ7OztHQUdHO0FBQ0gsU0FBUyxXQUFXLENBQUMsR0FBYTtJQUNoQyxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7SUFDYixJQUFJLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNoQixHQUFHLElBQUksS0FBSyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDNUIsQ0FBQztJQUNELElBQUksR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2IsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDO1lBQ2hDLE1BQU0sSUFBSSxLQUFLLENBQUMseUNBQXlDLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBQ0QsR0FBRyxJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUNELE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQztBQUVELFNBQVMsYUFBYSxDQUFDLElBQWdCO0lBQ3JDLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDO1FBQUUsT0FBTyxFQUFFLENBQUM7SUFFakMsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzFELG1FQUFtRTtRQUNuRSxPQUFPLElBQUksV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7SUFDckMsQ0FBQztJQUVELElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQztJQUNoQixLQUFLLE1BQU0sR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQ3ZCLEdBQUcsSUFBSSxJQUFJLENBQUM7UUFDWixvRUFBb0U7UUFDcEUsR0FBRyxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ2hELEdBQUcsSUFBSSxJQUFJLENBQUM7SUFDZCxDQUFDO0lBQ0QsR0FBRyxJQUFJLEdBQUcsQ0FBQztJQUNYLE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtjb21wdXRlTXNnSWR9IGZyb20gJy4uL2kxOG4vZGlnZXN0JztcbmltcG9ydCB7TWVzc2FnZX0gZnJvbSAnLi4vaTE4bi9pMThuX2FzdCc7XG5pbXBvcnQge1BhcnNlU291cmNlU3Bhbn0gZnJvbSAnLi4vcGFyc2VfdXRpbCc7XG5pbXBvcnQge0kxOG5NZXRhfSBmcm9tICcuLi9yZW5kZXIzL3ZpZXcvaTE4bi9tZXRhJztcblxuLy8vLyBUeXBlc1xuZXhwb3J0IGVudW0gVHlwZU1vZGlmaWVyIHtcbiAgTm9uZSA9IDAsXG4gIENvbnN0ID0gMSA8PCAwLFxufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgVHlwZSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBtb2RpZmllcnM6IFR5cGVNb2RpZmllciA9IFR5cGVNb2RpZmllci5Ob25lKSB7fVxuICBhYnN0cmFjdCB2aXNpdFR5cGUodmlzaXRvcjogVHlwZVZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueTtcblxuICBoYXNNb2RpZmllcihtb2RpZmllcjogVHlwZU1vZGlmaWVyKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICh0aGlzLm1vZGlmaWVycyAmIG1vZGlmaWVyKSAhPT0gMDtcbiAgfVxufVxuXG5leHBvcnQgZW51bSBCdWlsdGluVHlwZU5hbWUge1xuICBEeW5hbWljLFxuICBCb29sLFxuICBTdHJpbmcsXG4gIEludCxcbiAgTnVtYmVyLFxuICBGdW5jdGlvbixcbiAgSW5mZXJyZWQsXG4gIE5vbmUsXG59XG5cbmV4cG9ydCBjbGFzcyBCdWlsdGluVHlwZSBleHRlbmRzIFR5cGUge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgbmFtZTogQnVpbHRpblR5cGVOYW1lLFxuICAgIG1vZGlmaWVycz86IFR5cGVNb2RpZmllcixcbiAgKSB7XG4gICAgc3VwZXIobW9kaWZpZXJzKTtcbiAgfVxuICBvdmVycmlkZSB2aXNpdFR5cGUodmlzaXRvcjogVHlwZVZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRCdWlsdGluVHlwZSh0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRXhwcmVzc2lvblR5cGUgZXh0ZW5kcyBUeXBlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIHZhbHVlOiBFeHByZXNzaW9uLFxuICAgIG1vZGlmaWVycz86IFR5cGVNb2RpZmllcixcbiAgICBwdWJsaWMgdHlwZVBhcmFtczogVHlwZVtdIHwgbnVsbCA9IG51bGwsXG4gICkge1xuICAgIHN1cGVyKG1vZGlmaWVycyk7XG4gIH1cbiAgb3ZlcnJpZGUgdmlzaXRUeXBlKHZpc2l0b3I6IFR5cGVWaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0RXhwcmVzc2lvblR5cGUodGhpcywgY29udGV4dCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEFycmF5VHlwZSBleHRlbmRzIFR5cGUge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgb2Y6IFR5cGUsXG4gICAgbW9kaWZpZXJzPzogVHlwZU1vZGlmaWVyLFxuICApIHtcbiAgICBzdXBlcihtb2RpZmllcnMpO1xuICB9XG4gIG92ZXJyaWRlIHZpc2l0VHlwZSh2aXNpdG9yOiBUeXBlVmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdEFycmF5VHlwZSh0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTWFwVHlwZSBleHRlbmRzIFR5cGUge1xuICBwdWJsaWMgdmFsdWVUeXBlOiBUeXBlIHwgbnVsbDtcbiAgY29uc3RydWN0b3IodmFsdWVUeXBlOiBUeXBlIHwgbnVsbCB8IHVuZGVmaW5lZCwgbW9kaWZpZXJzPzogVHlwZU1vZGlmaWVyKSB7XG4gICAgc3VwZXIobW9kaWZpZXJzKTtcbiAgICB0aGlzLnZhbHVlVHlwZSA9IHZhbHVlVHlwZSB8fCBudWxsO1xuICB9XG4gIG92ZXJyaWRlIHZpc2l0VHlwZSh2aXNpdG9yOiBUeXBlVmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdE1hcFR5cGUodGhpcywgY29udGV4dCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRyYW5zcGxhbnRlZFR5cGU8VD4gZXh0ZW5kcyBUeXBlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcmVhZG9ubHkgdHlwZTogVCxcbiAgICBtb2RpZmllcnM/OiBUeXBlTW9kaWZpZXIsXG4gICkge1xuICAgIHN1cGVyKG1vZGlmaWVycyk7XG4gIH1cbiAgb3ZlcnJpZGUgdmlzaXRUeXBlKHZpc2l0b3I6IFR5cGVWaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0VHJhbnNwbGFudGVkVHlwZSh0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgRFlOQU1JQ19UWVBFID0gbmV3IEJ1aWx0aW5UeXBlKEJ1aWx0aW5UeXBlTmFtZS5EeW5hbWljKTtcbmV4cG9ydCBjb25zdCBJTkZFUlJFRF9UWVBFID0gbmV3IEJ1aWx0aW5UeXBlKEJ1aWx0aW5UeXBlTmFtZS5JbmZlcnJlZCk7XG5leHBvcnQgY29uc3QgQk9PTF9UWVBFID0gbmV3IEJ1aWx0aW5UeXBlKEJ1aWx0aW5UeXBlTmFtZS5Cb29sKTtcbmV4cG9ydCBjb25zdCBJTlRfVFlQRSA9IG5ldyBCdWlsdGluVHlwZShCdWlsdGluVHlwZU5hbWUuSW50KTtcbmV4cG9ydCBjb25zdCBOVU1CRVJfVFlQRSA9IG5ldyBCdWlsdGluVHlwZShCdWlsdGluVHlwZU5hbWUuTnVtYmVyKTtcbmV4cG9ydCBjb25zdCBTVFJJTkdfVFlQRSA9IG5ldyBCdWlsdGluVHlwZShCdWlsdGluVHlwZU5hbWUuU3RyaW5nKTtcbmV4cG9ydCBjb25zdCBGVU5DVElPTl9UWVBFID0gbmV3IEJ1aWx0aW5UeXBlKEJ1aWx0aW5UeXBlTmFtZS5GdW5jdGlvbik7XG5leHBvcnQgY29uc3QgTk9ORV9UWVBFID0gbmV3IEJ1aWx0aW5UeXBlKEJ1aWx0aW5UeXBlTmFtZS5Ob25lKTtcblxuZXhwb3J0IGludGVyZmFjZSBUeXBlVmlzaXRvciB7XG4gIHZpc2l0QnVpbHRpblR5cGUodHlwZTogQnVpbHRpblR5cGUsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRFeHByZXNzaW9uVHlwZSh0eXBlOiBFeHByZXNzaW9uVHlwZSwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdEFycmF5VHlwZSh0eXBlOiBBcnJheVR5cGUsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRNYXBUeXBlKHR5cGU6IE1hcFR5cGUsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRUcmFuc3BsYW50ZWRUeXBlKHR5cGU6IFRyYW5zcGxhbnRlZFR5cGU8dW5rbm93bj4sIGNvbnRleHQ6IGFueSk6IGFueTtcbn1cblxuLy8vLy8gRXhwcmVzc2lvbnNcblxuZXhwb3J0IGVudW0gVW5hcnlPcGVyYXRvciB7XG4gIE1pbnVzLFxuICBQbHVzLFxufVxuXG5leHBvcnQgZW51bSBCaW5hcnlPcGVyYXRvciB7XG4gIEVxdWFscyxcbiAgTm90RXF1YWxzLFxuICBJZGVudGljYWwsXG4gIE5vdElkZW50aWNhbCxcbiAgTWludXMsXG4gIFBsdXMsXG4gIERpdmlkZSxcbiAgTXVsdGlwbHksXG4gIE1vZHVsbyxcbiAgQW5kLFxuICBPcixcbiAgQml0d2lzZU9yLFxuICBCaXR3aXNlQW5kLFxuICBMb3dlcixcbiAgTG93ZXJFcXVhbHMsXG4gIEJpZ2dlcixcbiAgQmlnZ2VyRXF1YWxzLFxuICBOdWxsaXNoQ29hbGVzY2UsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBudWxsU2FmZUlzRXF1aXZhbGVudDxUIGV4dGVuZHMge2lzRXF1aXZhbGVudChvdGhlcjogVCk6IGJvb2xlYW59PihcbiAgYmFzZTogVCB8IG51bGwsXG4gIG90aGVyOiBUIHwgbnVsbCxcbikge1xuICBpZiAoYmFzZSA9PSBudWxsIHx8IG90aGVyID09IG51bGwpIHtcbiAgICByZXR1cm4gYmFzZSA9PSBvdGhlcjtcbiAgfVxuICByZXR1cm4gYmFzZS5pc0VxdWl2YWxlbnQob3RoZXIpO1xufVxuXG5mdW5jdGlvbiBhcmVBbGxFcXVpdmFsZW50UHJlZGljYXRlPFQ+KFxuICBiYXNlOiBUW10sXG4gIG90aGVyOiBUW10sXG4gIGVxdWl2YWxlbnRQcmVkaWNhdGU6IChiYXNlRWxlbWVudDogVCwgb3RoZXJFbGVtZW50OiBUKSA9PiBib29sZWFuLFxuKSB7XG4gIGNvbnN0IGxlbiA9IGJhc2UubGVuZ3RoO1xuICBpZiAobGVuICE9PSBvdGhlci5sZW5ndGgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgIGlmICghZXF1aXZhbGVudFByZWRpY2F0ZShiYXNlW2ldLCBvdGhlcltpXSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcmVBbGxFcXVpdmFsZW50PFQgZXh0ZW5kcyB7aXNFcXVpdmFsZW50KG90aGVyOiBUKTogYm9vbGVhbn0+KFxuICBiYXNlOiBUW10sXG4gIG90aGVyOiBUW10sXG4pIHtcbiAgcmV0dXJuIGFyZUFsbEVxdWl2YWxlbnRQcmVkaWNhdGUoYmFzZSwgb3RoZXIsIChiYXNlRWxlbWVudDogVCwgb3RoZXJFbGVtZW50OiBUKSA9PlxuICAgIGJhc2VFbGVtZW50LmlzRXF1aXZhbGVudChvdGhlckVsZW1lbnQpLFxuICApO1xufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgRXhwcmVzc2lvbiB7XG4gIHB1YmxpYyB0eXBlOiBUeXBlIHwgbnVsbDtcbiAgcHVibGljIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbiB8IG51bGw7XG5cbiAgY29uc3RydWN0b3IodHlwZTogVHlwZSB8IG51bGwgfCB1bmRlZmluZWQsIHNvdXJjZVNwYW4/OiBQYXJzZVNvdXJjZVNwYW4gfCBudWxsKSB7XG4gICAgdGhpcy50eXBlID0gdHlwZSB8fCBudWxsO1xuICAgIHRoaXMuc291cmNlU3BhbiA9IHNvdXJjZVNwYW4gfHwgbnVsbDtcbiAgfVxuXG4gIGFic3RyYWN0IHZpc2l0RXhwcmVzc2lvbih2aXNpdG9yOiBFeHByZXNzaW9uVmlzaXRvciwgY29udGV4dDogYW55KTogYW55O1xuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGVzIHdoZXRoZXIgdGhpcyBleHByZXNzaW9uIHByb2R1Y2VzIHRoZSBzYW1lIHZhbHVlIGFzIHRoZSBnaXZlbiBleHByZXNzaW9uLlxuICAgKiBOb3RlOiBXZSBkb24ndCBjaGVjayBUeXBlcyBub3IgUGFyc2VTb3VyY2VTcGFucyBub3IgZnVuY3Rpb24gYXJndW1lbnRzLlxuICAgKi9cbiAgYWJzdHJhY3QgaXNFcXVpdmFsZW50KGU6IEV4cHJlc3Npb24pOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgZXhwcmVzc2lvbiBpcyBjb25zdGFudC5cbiAgICovXG4gIGFic3RyYWN0IGlzQ29uc3RhbnQoKTogYm9vbGVhbjtcblxuICBhYnN0cmFjdCBjbG9uZSgpOiBFeHByZXNzaW9uO1xuXG4gIHByb3AobmFtZTogc3RyaW5nLCBzb3VyY2VTcGFuPzogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbCk6IFJlYWRQcm9wRXhwciB7XG4gICAgcmV0dXJuIG5ldyBSZWFkUHJvcEV4cHIodGhpcywgbmFtZSwgbnVsbCwgc291cmNlU3Bhbik7XG4gIH1cblxuICBrZXkoaW5kZXg6IEV4cHJlc3Npb24sIHR5cGU/OiBUeXBlIHwgbnVsbCwgc291cmNlU3Bhbj86IFBhcnNlU291cmNlU3BhbiB8IG51bGwpOiBSZWFkS2V5RXhwciB7XG4gICAgcmV0dXJuIG5ldyBSZWFkS2V5RXhwcih0aGlzLCBpbmRleCwgdHlwZSwgc291cmNlU3Bhbik7XG4gIH1cblxuICBjYWxsRm4oXG4gICAgcGFyYW1zOiBFeHByZXNzaW9uW10sXG4gICAgc291cmNlU3Bhbj86IFBhcnNlU291cmNlU3BhbiB8IG51bGwsXG4gICAgcHVyZT86IGJvb2xlYW4sXG4gICk6IEludm9rZUZ1bmN0aW9uRXhwciB7XG4gICAgcmV0dXJuIG5ldyBJbnZva2VGdW5jdGlvbkV4cHIodGhpcywgcGFyYW1zLCBudWxsLCBzb3VyY2VTcGFuLCBwdXJlKTtcbiAgfVxuXG4gIGluc3RhbnRpYXRlKFxuICAgIHBhcmFtczogRXhwcmVzc2lvbltdLFxuICAgIHR5cGU/OiBUeXBlIHwgbnVsbCxcbiAgICBzb3VyY2VTcGFuPzogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbCxcbiAgKTogSW5zdGFudGlhdGVFeHByIHtcbiAgICByZXR1cm4gbmV3IEluc3RhbnRpYXRlRXhwcih0aGlzLCBwYXJhbXMsIHR5cGUsIHNvdXJjZVNwYW4pO1xuICB9XG5cbiAgY29uZGl0aW9uYWwoXG4gICAgdHJ1ZUNhc2U6IEV4cHJlc3Npb24sXG4gICAgZmFsc2VDYXNlOiBFeHByZXNzaW9uIHwgbnVsbCA9IG51bGwsXG4gICAgc291cmNlU3Bhbj86IFBhcnNlU291cmNlU3BhbiB8IG51bGwsXG4gICk6IENvbmRpdGlvbmFsRXhwciB7XG4gICAgcmV0dXJuIG5ldyBDb25kaXRpb25hbEV4cHIodGhpcywgdHJ1ZUNhc2UsIGZhbHNlQ2FzZSwgbnVsbCwgc291cmNlU3Bhbik7XG4gIH1cblxuICBlcXVhbHMocmhzOiBFeHByZXNzaW9uLCBzb3VyY2VTcGFuPzogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbCk6IEJpbmFyeU9wZXJhdG9yRXhwciB7XG4gICAgcmV0dXJuIG5ldyBCaW5hcnlPcGVyYXRvckV4cHIoQmluYXJ5T3BlcmF0b3IuRXF1YWxzLCB0aGlzLCByaHMsIG51bGwsIHNvdXJjZVNwYW4pO1xuICB9XG4gIG5vdEVxdWFscyhyaHM6IEV4cHJlc3Npb24sIHNvdXJjZVNwYW4/OiBQYXJzZVNvdXJjZVNwYW4gfCBudWxsKTogQmluYXJ5T3BlcmF0b3JFeHByIHtcbiAgICByZXR1cm4gbmV3IEJpbmFyeU9wZXJhdG9yRXhwcihCaW5hcnlPcGVyYXRvci5Ob3RFcXVhbHMsIHRoaXMsIHJocywgbnVsbCwgc291cmNlU3Bhbik7XG4gIH1cbiAgaWRlbnRpY2FsKHJoczogRXhwcmVzc2lvbiwgc291cmNlU3Bhbj86IFBhcnNlU291cmNlU3BhbiB8IG51bGwpOiBCaW5hcnlPcGVyYXRvckV4cHIge1xuICAgIHJldHVybiBuZXcgQmluYXJ5T3BlcmF0b3JFeHByKEJpbmFyeU9wZXJhdG9yLklkZW50aWNhbCwgdGhpcywgcmhzLCBudWxsLCBzb3VyY2VTcGFuKTtcbiAgfVxuICBub3RJZGVudGljYWwocmhzOiBFeHByZXNzaW9uLCBzb3VyY2VTcGFuPzogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbCk6IEJpbmFyeU9wZXJhdG9yRXhwciB7XG4gICAgcmV0dXJuIG5ldyBCaW5hcnlPcGVyYXRvckV4cHIoQmluYXJ5T3BlcmF0b3IuTm90SWRlbnRpY2FsLCB0aGlzLCByaHMsIG51bGwsIHNvdXJjZVNwYW4pO1xuICB9XG4gIG1pbnVzKHJoczogRXhwcmVzc2lvbiwgc291cmNlU3Bhbj86IFBhcnNlU291cmNlU3BhbiB8IG51bGwpOiBCaW5hcnlPcGVyYXRvckV4cHIge1xuICAgIHJldHVybiBuZXcgQmluYXJ5T3BlcmF0b3JFeHByKEJpbmFyeU9wZXJhdG9yLk1pbnVzLCB0aGlzLCByaHMsIG51bGwsIHNvdXJjZVNwYW4pO1xuICB9XG4gIHBsdXMocmhzOiBFeHByZXNzaW9uLCBzb3VyY2VTcGFuPzogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbCk6IEJpbmFyeU9wZXJhdG9yRXhwciB7XG4gICAgcmV0dXJuIG5ldyBCaW5hcnlPcGVyYXRvckV4cHIoQmluYXJ5T3BlcmF0b3IuUGx1cywgdGhpcywgcmhzLCBudWxsLCBzb3VyY2VTcGFuKTtcbiAgfVxuICBkaXZpZGUocmhzOiBFeHByZXNzaW9uLCBzb3VyY2VTcGFuPzogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbCk6IEJpbmFyeU9wZXJhdG9yRXhwciB7XG4gICAgcmV0dXJuIG5ldyBCaW5hcnlPcGVyYXRvckV4cHIoQmluYXJ5T3BlcmF0b3IuRGl2aWRlLCB0aGlzLCByaHMsIG51bGwsIHNvdXJjZVNwYW4pO1xuICB9XG4gIG11bHRpcGx5KHJoczogRXhwcmVzc2lvbiwgc291cmNlU3Bhbj86IFBhcnNlU291cmNlU3BhbiB8IG51bGwpOiBCaW5hcnlPcGVyYXRvckV4cHIge1xuICAgIHJldHVybiBuZXcgQmluYXJ5T3BlcmF0b3JFeHByKEJpbmFyeU9wZXJhdG9yLk11bHRpcGx5LCB0aGlzLCByaHMsIG51bGwsIHNvdXJjZVNwYW4pO1xuICB9XG4gIG1vZHVsbyhyaHM6IEV4cHJlc3Npb24sIHNvdXJjZVNwYW4/OiBQYXJzZVNvdXJjZVNwYW4gfCBudWxsKTogQmluYXJ5T3BlcmF0b3JFeHByIHtcbiAgICByZXR1cm4gbmV3IEJpbmFyeU9wZXJhdG9yRXhwcihCaW5hcnlPcGVyYXRvci5Nb2R1bG8sIHRoaXMsIHJocywgbnVsbCwgc291cmNlU3Bhbik7XG4gIH1cbiAgYW5kKHJoczogRXhwcmVzc2lvbiwgc291cmNlU3Bhbj86IFBhcnNlU291cmNlU3BhbiB8IG51bGwpOiBCaW5hcnlPcGVyYXRvckV4cHIge1xuICAgIHJldHVybiBuZXcgQmluYXJ5T3BlcmF0b3JFeHByKEJpbmFyeU9wZXJhdG9yLkFuZCwgdGhpcywgcmhzLCBudWxsLCBzb3VyY2VTcGFuKTtcbiAgfVxuICBiaXR3aXNlT3IoXG4gICAgcmhzOiBFeHByZXNzaW9uLFxuICAgIHNvdXJjZVNwYW4/OiBQYXJzZVNvdXJjZVNwYW4gfCBudWxsLFxuICAgIHBhcmVuczogYm9vbGVhbiA9IHRydWUsXG4gICk6IEJpbmFyeU9wZXJhdG9yRXhwciB7XG4gICAgcmV0dXJuIG5ldyBCaW5hcnlPcGVyYXRvckV4cHIoQmluYXJ5T3BlcmF0b3IuQml0d2lzZU9yLCB0aGlzLCByaHMsIG51bGwsIHNvdXJjZVNwYW4sIHBhcmVucyk7XG4gIH1cbiAgYml0d2lzZUFuZChcbiAgICByaHM6IEV4cHJlc3Npb24sXG4gICAgc291cmNlU3Bhbj86IFBhcnNlU291cmNlU3BhbiB8IG51bGwsXG4gICAgcGFyZW5zOiBib29sZWFuID0gdHJ1ZSxcbiAgKTogQmluYXJ5T3BlcmF0b3JFeHByIHtcbiAgICByZXR1cm4gbmV3IEJpbmFyeU9wZXJhdG9yRXhwcihCaW5hcnlPcGVyYXRvci5CaXR3aXNlQW5kLCB0aGlzLCByaHMsIG51bGwsIHNvdXJjZVNwYW4sIHBhcmVucyk7XG4gIH1cbiAgb3IocmhzOiBFeHByZXNzaW9uLCBzb3VyY2VTcGFuPzogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbCk6IEJpbmFyeU9wZXJhdG9yRXhwciB7XG4gICAgcmV0dXJuIG5ldyBCaW5hcnlPcGVyYXRvckV4cHIoQmluYXJ5T3BlcmF0b3IuT3IsIHRoaXMsIHJocywgbnVsbCwgc291cmNlU3Bhbik7XG4gIH1cbiAgbG93ZXIocmhzOiBFeHByZXNzaW9uLCBzb3VyY2VTcGFuPzogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbCk6IEJpbmFyeU9wZXJhdG9yRXhwciB7XG4gICAgcmV0dXJuIG5ldyBCaW5hcnlPcGVyYXRvckV4cHIoQmluYXJ5T3BlcmF0b3IuTG93ZXIsIHRoaXMsIHJocywgbnVsbCwgc291cmNlU3Bhbik7XG4gIH1cbiAgbG93ZXJFcXVhbHMocmhzOiBFeHByZXNzaW9uLCBzb3VyY2VTcGFuPzogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbCk6IEJpbmFyeU9wZXJhdG9yRXhwciB7XG4gICAgcmV0dXJuIG5ldyBCaW5hcnlPcGVyYXRvckV4cHIoQmluYXJ5T3BlcmF0b3IuTG93ZXJFcXVhbHMsIHRoaXMsIHJocywgbnVsbCwgc291cmNlU3Bhbik7XG4gIH1cbiAgYmlnZ2VyKHJoczogRXhwcmVzc2lvbiwgc291cmNlU3Bhbj86IFBhcnNlU291cmNlU3BhbiB8IG51bGwpOiBCaW5hcnlPcGVyYXRvckV4cHIge1xuICAgIHJldHVybiBuZXcgQmluYXJ5T3BlcmF0b3JFeHByKEJpbmFyeU9wZXJhdG9yLkJpZ2dlciwgdGhpcywgcmhzLCBudWxsLCBzb3VyY2VTcGFuKTtcbiAgfVxuICBiaWdnZXJFcXVhbHMocmhzOiBFeHByZXNzaW9uLCBzb3VyY2VTcGFuPzogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbCk6IEJpbmFyeU9wZXJhdG9yRXhwciB7XG4gICAgcmV0dXJuIG5ldyBCaW5hcnlPcGVyYXRvckV4cHIoQmluYXJ5T3BlcmF0b3IuQmlnZ2VyRXF1YWxzLCB0aGlzLCByaHMsIG51bGwsIHNvdXJjZVNwYW4pO1xuICB9XG4gIGlzQmxhbmsoc291cmNlU3Bhbj86IFBhcnNlU291cmNlU3BhbiB8IG51bGwpOiBFeHByZXNzaW9uIHtcbiAgICAvLyBOb3RlOiBXZSB1c2UgZXF1YWxzIGJ5IHB1cnBvc2UgaGVyZSB0byBjb21wYXJlIHRvIG51bGwgYW5kIHVuZGVmaW5lZCBpbiBKUy5cbiAgICAvLyBXZSB1c2UgdGhlIHR5cGVkIG51bGwgdG8gYWxsb3cgc3RyaWN0TnVsbENoZWNrcyB0byBuYXJyb3cgdHlwZXMuXG4gICAgcmV0dXJuIHRoaXMuZXF1YWxzKFRZUEVEX05VTExfRVhQUiwgc291cmNlU3Bhbik7XG4gIH1cbiAgbnVsbGlzaENvYWxlc2NlKHJoczogRXhwcmVzc2lvbiwgc291cmNlU3Bhbj86IFBhcnNlU291cmNlU3BhbiB8IG51bGwpOiBCaW5hcnlPcGVyYXRvckV4cHIge1xuICAgIHJldHVybiBuZXcgQmluYXJ5T3BlcmF0b3JFeHByKEJpbmFyeU9wZXJhdG9yLk51bGxpc2hDb2FsZXNjZSwgdGhpcywgcmhzLCBudWxsLCBzb3VyY2VTcGFuKTtcbiAgfVxuXG4gIHRvU3RtdCgpOiBTdGF0ZW1lbnQge1xuICAgIHJldHVybiBuZXcgRXhwcmVzc2lvblN0YXRlbWVudCh0aGlzLCBudWxsKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVhZFZhckV4cHIgZXh0ZW5kcyBFeHByZXNzaW9uIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIG5hbWU6IHN0cmluZyxcbiAgICB0eXBlPzogVHlwZSB8IG51bGwsXG4gICAgc291cmNlU3Bhbj86IFBhcnNlU291cmNlU3BhbiB8IG51bGwsXG4gICkge1xuICAgIHN1cGVyKHR5cGUsIHNvdXJjZVNwYW4pO1xuICB9XG5cbiAgb3ZlcnJpZGUgaXNFcXVpdmFsZW50KGU6IEV4cHJlc3Npb24pOiBib29sZWFuIHtcbiAgICByZXR1cm4gZSBpbnN0YW5jZW9mIFJlYWRWYXJFeHByICYmIHRoaXMubmFtZSA9PT0gZS5uYW1lO1xuICB9XG5cbiAgb3ZlcnJpZGUgaXNDb25zdGFudCgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBvdmVycmlkZSB2aXNpdEV4cHJlc3Npb24odmlzaXRvcjogRXhwcmVzc2lvblZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRSZWFkVmFyRXhwcih0aGlzLCBjb250ZXh0KTtcbiAgfVxuXG4gIG92ZXJyaWRlIGNsb25lKCk6IFJlYWRWYXJFeHByIHtcbiAgICByZXR1cm4gbmV3IFJlYWRWYXJFeHByKHRoaXMubmFtZSwgdGhpcy50eXBlLCB0aGlzLnNvdXJjZVNwYW4pO1xuICB9XG5cbiAgc2V0KHZhbHVlOiBFeHByZXNzaW9uKTogV3JpdGVWYXJFeHByIHtcbiAgICByZXR1cm4gbmV3IFdyaXRlVmFyRXhwcih0aGlzLm5hbWUsIHZhbHVlLCBudWxsLCB0aGlzLnNvdXJjZVNwYW4pO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUeXBlb2ZFeHByIGV4dGVuZHMgRXhwcmVzc2lvbiB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBleHByOiBFeHByZXNzaW9uLFxuICAgIHR5cGU/OiBUeXBlIHwgbnVsbCxcbiAgICBzb3VyY2VTcGFuPzogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbCxcbiAgKSB7XG4gICAgc3VwZXIodHlwZSwgc291cmNlU3Bhbik7XG4gIH1cblxuICBvdmVycmlkZSB2aXNpdEV4cHJlc3Npb24odmlzaXRvcjogRXhwcmVzc2lvblZpc2l0b3IsIGNvbnRleHQ6IGFueSkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0VHlwZW9mRXhwcih0aGlzLCBjb250ZXh0KTtcbiAgfVxuXG4gIG92ZXJyaWRlIGlzRXF1aXZhbGVudChlOiBFeHByZXNzaW9uKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGUgaW5zdGFuY2VvZiBUeXBlb2ZFeHByICYmIGUuZXhwci5pc0VxdWl2YWxlbnQodGhpcy5leHByKTtcbiAgfVxuXG4gIG92ZXJyaWRlIGlzQ29uc3RhbnQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZXhwci5pc0NvbnN0YW50KCk7XG4gIH1cblxuICBvdmVycmlkZSBjbG9uZSgpOiBUeXBlb2ZFeHByIHtcbiAgICByZXR1cm4gbmV3IFR5cGVvZkV4cHIodGhpcy5leHByLmNsb25lKCkpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBXcmFwcGVkTm9kZUV4cHI8VD4gZXh0ZW5kcyBFeHByZXNzaW9uIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIG5vZGU6IFQsXG4gICAgdHlwZT86IFR5cGUgfCBudWxsLFxuICAgIHNvdXJjZVNwYW4/OiBQYXJzZVNvdXJjZVNwYW4gfCBudWxsLFxuICApIHtcbiAgICBzdXBlcih0eXBlLCBzb3VyY2VTcGFuKTtcbiAgfVxuXG4gIG92ZXJyaWRlIGlzRXF1aXZhbGVudChlOiBFeHByZXNzaW9uKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGUgaW5zdGFuY2VvZiBXcmFwcGVkTm9kZUV4cHIgJiYgdGhpcy5ub2RlID09PSBlLm5vZGU7XG4gIH1cblxuICBvdmVycmlkZSBpc0NvbnN0YW50KCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIG92ZXJyaWRlIHZpc2l0RXhwcmVzc2lvbih2aXNpdG9yOiBFeHByZXNzaW9uVmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdFdyYXBwZWROb2RlRXhwcih0aGlzLCBjb250ZXh0KTtcbiAgfVxuXG4gIG92ZXJyaWRlIGNsb25lKCk6IFdyYXBwZWROb2RlRXhwcjxUPiB7XG4gICAgcmV0dXJuIG5ldyBXcmFwcGVkTm9kZUV4cHIodGhpcy5ub2RlLCB0aGlzLnR5cGUsIHRoaXMuc291cmNlU3Bhbik7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFdyaXRlVmFyRXhwciBleHRlbmRzIEV4cHJlc3Npb24ge1xuICBwdWJsaWMgdmFsdWU6IEV4cHJlc3Npb247XG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBuYW1lOiBzdHJpbmcsXG4gICAgdmFsdWU6IEV4cHJlc3Npb24sXG4gICAgdHlwZT86IFR5cGUgfCBudWxsLFxuICAgIHNvdXJjZVNwYW4/OiBQYXJzZVNvdXJjZVNwYW4gfCBudWxsLFxuICApIHtcbiAgICBzdXBlcih0eXBlIHx8IHZhbHVlLnR5cGUsIHNvdXJjZVNwYW4pO1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIG92ZXJyaWRlIGlzRXF1aXZhbGVudChlOiBFeHByZXNzaW9uKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGUgaW5zdGFuY2VvZiBXcml0ZVZhckV4cHIgJiYgdGhpcy5uYW1lID09PSBlLm5hbWUgJiYgdGhpcy52YWx1ZS5pc0VxdWl2YWxlbnQoZS52YWx1ZSk7XG4gIH1cblxuICBvdmVycmlkZSBpc0NvbnN0YW50KCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIG92ZXJyaWRlIHZpc2l0RXhwcmVzc2lvbih2aXNpdG9yOiBFeHByZXNzaW9uVmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdFdyaXRlVmFyRXhwcih0aGlzLCBjb250ZXh0KTtcbiAgfVxuXG4gIG92ZXJyaWRlIGNsb25lKCk6IFdyaXRlVmFyRXhwciB7XG4gICAgcmV0dXJuIG5ldyBXcml0ZVZhckV4cHIodGhpcy5uYW1lLCB0aGlzLnZhbHVlLmNsb25lKCksIHRoaXMudHlwZSwgdGhpcy5zb3VyY2VTcGFuKTtcbiAgfVxuXG4gIHRvRGVjbFN0bXQodHlwZT86IFR5cGUgfCBudWxsLCBtb2RpZmllcnM/OiBTdG10TW9kaWZpZXIpOiBEZWNsYXJlVmFyU3RtdCB7XG4gICAgcmV0dXJuIG5ldyBEZWNsYXJlVmFyU3RtdCh0aGlzLm5hbWUsIHRoaXMudmFsdWUsIHR5cGUsIG1vZGlmaWVycywgdGhpcy5zb3VyY2VTcGFuKTtcbiAgfVxuXG4gIHRvQ29uc3REZWNsKCk6IERlY2xhcmVWYXJTdG10IHtcbiAgICByZXR1cm4gdGhpcy50b0RlY2xTdG10KElORkVSUkVEX1RZUEUsIFN0bXRNb2RpZmllci5GaW5hbCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFdyaXRlS2V5RXhwciBleHRlbmRzIEV4cHJlc3Npb24ge1xuICBwdWJsaWMgdmFsdWU6IEV4cHJlc3Npb247XG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyByZWNlaXZlcjogRXhwcmVzc2lvbixcbiAgICBwdWJsaWMgaW5kZXg6IEV4cHJlc3Npb24sXG4gICAgdmFsdWU6IEV4cHJlc3Npb24sXG4gICAgdHlwZT86IFR5cGUgfCBudWxsLFxuICAgIHNvdXJjZVNwYW4/OiBQYXJzZVNvdXJjZVNwYW4gfCBudWxsLFxuICApIHtcbiAgICBzdXBlcih0eXBlIHx8IHZhbHVlLnR5cGUsIHNvdXJjZVNwYW4pO1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIG92ZXJyaWRlIGlzRXF1aXZhbGVudChlOiBFeHByZXNzaW9uKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIChcbiAgICAgIGUgaW5zdGFuY2VvZiBXcml0ZUtleUV4cHIgJiZcbiAgICAgIHRoaXMucmVjZWl2ZXIuaXNFcXVpdmFsZW50KGUucmVjZWl2ZXIpICYmXG4gICAgICB0aGlzLmluZGV4LmlzRXF1aXZhbGVudChlLmluZGV4KSAmJlxuICAgICAgdGhpcy52YWx1ZS5pc0VxdWl2YWxlbnQoZS52YWx1ZSlcbiAgICApO1xuICB9XG5cbiAgb3ZlcnJpZGUgaXNDb25zdGFudCgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBvdmVycmlkZSB2aXNpdEV4cHJlc3Npb24odmlzaXRvcjogRXhwcmVzc2lvblZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRXcml0ZUtleUV4cHIodGhpcywgY29udGV4dCk7XG4gIH1cblxuICBvdmVycmlkZSBjbG9uZSgpOiBXcml0ZUtleUV4cHIge1xuICAgIHJldHVybiBuZXcgV3JpdGVLZXlFeHByKFxuICAgICAgdGhpcy5yZWNlaXZlci5jbG9uZSgpLFxuICAgICAgdGhpcy5pbmRleC5jbG9uZSgpLFxuICAgICAgdGhpcy52YWx1ZS5jbG9uZSgpLFxuICAgICAgdGhpcy50eXBlLFxuICAgICAgdGhpcy5zb3VyY2VTcGFuLFxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFdyaXRlUHJvcEV4cHIgZXh0ZW5kcyBFeHByZXNzaW9uIHtcbiAgcHVibGljIHZhbHVlOiBFeHByZXNzaW9uO1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgcmVjZWl2ZXI6IEV4cHJlc3Npb24sXG4gICAgcHVibGljIG5hbWU6IHN0cmluZyxcbiAgICB2YWx1ZTogRXhwcmVzc2lvbixcbiAgICB0eXBlPzogVHlwZSB8IG51bGwsXG4gICAgc291cmNlU3Bhbj86IFBhcnNlU291cmNlU3BhbiB8IG51bGwsXG4gICkge1xuICAgIHN1cGVyKHR5cGUgfHwgdmFsdWUudHlwZSwgc291cmNlU3Bhbik7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgb3ZlcnJpZGUgaXNFcXVpdmFsZW50KGU6IEV4cHJlc3Npb24pOiBib29sZWFuIHtcbiAgICByZXR1cm4gKFxuICAgICAgZSBpbnN0YW5jZW9mIFdyaXRlUHJvcEV4cHIgJiZcbiAgICAgIHRoaXMucmVjZWl2ZXIuaXNFcXVpdmFsZW50KGUucmVjZWl2ZXIpICYmXG4gICAgICB0aGlzLm5hbWUgPT09IGUubmFtZSAmJlxuICAgICAgdGhpcy52YWx1ZS5pc0VxdWl2YWxlbnQoZS52YWx1ZSlcbiAgICApO1xuICB9XG5cbiAgb3ZlcnJpZGUgaXNDb25zdGFudCgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBvdmVycmlkZSB2aXNpdEV4cHJlc3Npb24odmlzaXRvcjogRXhwcmVzc2lvblZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRXcml0ZVByb3BFeHByKHRoaXMsIGNvbnRleHQpO1xuICB9XG5cbiAgb3ZlcnJpZGUgY2xvbmUoKTogV3JpdGVQcm9wRXhwciB7XG4gICAgcmV0dXJuIG5ldyBXcml0ZVByb3BFeHByKFxuICAgICAgdGhpcy5yZWNlaXZlci5jbG9uZSgpLFxuICAgICAgdGhpcy5uYW1lLFxuICAgICAgdGhpcy52YWx1ZS5jbG9uZSgpLFxuICAgICAgdGhpcy50eXBlLFxuICAgICAgdGhpcy5zb3VyY2VTcGFuLFxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEludm9rZUZ1bmN0aW9uRXhwciBleHRlbmRzIEV4cHJlc3Npb24ge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgZm46IEV4cHJlc3Npb24sXG4gICAgcHVibGljIGFyZ3M6IEV4cHJlc3Npb25bXSxcbiAgICB0eXBlPzogVHlwZSB8IG51bGwsXG4gICAgc291cmNlU3Bhbj86IFBhcnNlU291cmNlU3BhbiB8IG51bGwsXG4gICAgcHVibGljIHB1cmUgPSBmYWxzZSxcbiAgKSB7XG4gICAgc3VwZXIodHlwZSwgc291cmNlU3Bhbik7XG4gIH1cblxuICAvLyBBbiBhbGlhcyBmb3IgZm4sIHdoaWNoIGFsbG93cyBvdGhlciBsb2dpYyB0byBoYW5kbGUgY2FsbHMgYW5kIHByb3BlcnR5IHJlYWRzIHRvZ2V0aGVyLlxuICBnZXQgcmVjZWl2ZXIoKTogRXhwcmVzc2lvbiB7XG4gICAgcmV0dXJuIHRoaXMuZm47XG4gIH1cblxuICBvdmVycmlkZSBpc0VxdWl2YWxlbnQoZTogRXhwcmVzc2lvbik6IGJvb2xlYW4ge1xuICAgIHJldHVybiAoXG4gICAgICBlIGluc3RhbmNlb2YgSW52b2tlRnVuY3Rpb25FeHByICYmXG4gICAgICB0aGlzLmZuLmlzRXF1aXZhbGVudChlLmZuKSAmJlxuICAgICAgYXJlQWxsRXF1aXZhbGVudCh0aGlzLmFyZ3MsIGUuYXJncykgJiZcbiAgICAgIHRoaXMucHVyZSA9PT0gZS5wdXJlXG4gICAgKTtcbiAgfVxuXG4gIG92ZXJyaWRlIGlzQ29uc3RhbnQoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgb3ZlcnJpZGUgdmlzaXRFeHByZXNzaW9uKHZpc2l0b3I6IEV4cHJlc3Npb25WaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0SW52b2tlRnVuY3Rpb25FeHByKHRoaXMsIGNvbnRleHQpO1xuICB9XG5cbiAgb3ZlcnJpZGUgY2xvbmUoKTogSW52b2tlRnVuY3Rpb25FeHByIHtcbiAgICByZXR1cm4gbmV3IEludm9rZUZ1bmN0aW9uRXhwcihcbiAgICAgIHRoaXMuZm4uY2xvbmUoKSxcbiAgICAgIHRoaXMuYXJncy5tYXAoKGFyZykgPT4gYXJnLmNsb25lKCkpLFxuICAgICAgdGhpcy50eXBlLFxuICAgICAgdGhpcy5zb3VyY2VTcGFuLFxuICAgICAgdGhpcy5wdXJlLFxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRhZ2dlZFRlbXBsYXRlRXhwciBleHRlbmRzIEV4cHJlc3Npb24ge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgdGFnOiBFeHByZXNzaW9uLFxuICAgIHB1YmxpYyB0ZW1wbGF0ZTogVGVtcGxhdGVMaXRlcmFsLFxuICAgIHR5cGU/OiBUeXBlIHwgbnVsbCxcbiAgICBzb3VyY2VTcGFuPzogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbCxcbiAgKSB7XG4gICAgc3VwZXIodHlwZSwgc291cmNlU3Bhbik7XG4gIH1cblxuICBvdmVycmlkZSBpc0VxdWl2YWxlbnQoZTogRXhwcmVzc2lvbik6IGJvb2xlYW4ge1xuICAgIHJldHVybiAoXG4gICAgICBlIGluc3RhbmNlb2YgVGFnZ2VkVGVtcGxhdGVFeHByICYmXG4gICAgICB0aGlzLnRhZy5pc0VxdWl2YWxlbnQoZS50YWcpICYmXG4gICAgICBhcmVBbGxFcXVpdmFsZW50UHJlZGljYXRlKFxuICAgICAgICB0aGlzLnRlbXBsYXRlLmVsZW1lbnRzLFxuICAgICAgICBlLnRlbXBsYXRlLmVsZW1lbnRzLFxuICAgICAgICAoYSwgYikgPT4gYS50ZXh0ID09PSBiLnRleHQsXG4gICAgICApICYmXG4gICAgICBhcmVBbGxFcXVpdmFsZW50KHRoaXMudGVtcGxhdGUuZXhwcmVzc2lvbnMsIGUudGVtcGxhdGUuZXhwcmVzc2lvbnMpXG4gICAgKTtcbiAgfVxuXG4gIG92ZXJyaWRlIGlzQ29uc3RhbnQoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgb3ZlcnJpZGUgdmlzaXRFeHByZXNzaW9uKHZpc2l0b3I6IEV4cHJlc3Npb25WaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0VGFnZ2VkVGVtcGxhdGVFeHByKHRoaXMsIGNvbnRleHQpO1xuICB9XG5cbiAgb3ZlcnJpZGUgY2xvbmUoKTogVGFnZ2VkVGVtcGxhdGVFeHByIHtcbiAgICByZXR1cm4gbmV3IFRhZ2dlZFRlbXBsYXRlRXhwcihcbiAgICAgIHRoaXMudGFnLmNsb25lKCksXG4gICAgICB0aGlzLnRlbXBsYXRlLmNsb25lKCksXG4gICAgICB0aGlzLnR5cGUsXG4gICAgICB0aGlzLnNvdXJjZVNwYW4sXG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgSW5zdGFudGlhdGVFeHByIGV4dGVuZHMgRXhwcmVzc2lvbiB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBjbGFzc0V4cHI6IEV4cHJlc3Npb24sXG4gICAgcHVibGljIGFyZ3M6IEV4cHJlc3Npb25bXSxcbiAgICB0eXBlPzogVHlwZSB8IG51bGwsXG4gICAgc291cmNlU3Bhbj86IFBhcnNlU291cmNlU3BhbiB8IG51bGwsXG4gICkge1xuICAgIHN1cGVyKHR5cGUsIHNvdXJjZVNwYW4pO1xuICB9XG5cbiAgb3ZlcnJpZGUgaXNFcXVpdmFsZW50KGU6IEV4cHJlc3Npb24pOiBib29sZWFuIHtcbiAgICByZXR1cm4gKFxuICAgICAgZSBpbnN0YW5jZW9mIEluc3RhbnRpYXRlRXhwciAmJlxuICAgICAgdGhpcy5jbGFzc0V4cHIuaXNFcXVpdmFsZW50KGUuY2xhc3NFeHByKSAmJlxuICAgICAgYXJlQWxsRXF1aXZhbGVudCh0aGlzLmFyZ3MsIGUuYXJncylcbiAgICApO1xuICB9XG5cbiAgb3ZlcnJpZGUgaXNDb25zdGFudCgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBvdmVycmlkZSB2aXNpdEV4cHJlc3Npb24odmlzaXRvcjogRXhwcmVzc2lvblZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRJbnN0YW50aWF0ZUV4cHIodGhpcywgY29udGV4dCk7XG4gIH1cblxuICBvdmVycmlkZSBjbG9uZSgpOiBJbnN0YW50aWF0ZUV4cHIge1xuICAgIHJldHVybiBuZXcgSW5zdGFudGlhdGVFeHByKFxuICAgICAgdGhpcy5jbGFzc0V4cHIuY2xvbmUoKSxcbiAgICAgIHRoaXMuYXJncy5tYXAoKGFyZykgPT4gYXJnLmNsb25lKCkpLFxuICAgICAgdGhpcy50eXBlLFxuICAgICAgdGhpcy5zb3VyY2VTcGFuLFxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIExpdGVyYWxFeHByIGV4dGVuZHMgRXhwcmVzc2lvbiB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyB2YWx1ZTogbnVtYmVyIHwgc3RyaW5nIHwgYm9vbGVhbiB8IG51bGwgfCB1bmRlZmluZWQsXG4gICAgdHlwZT86IFR5cGUgfCBudWxsLFxuICAgIHNvdXJjZVNwYW4/OiBQYXJzZVNvdXJjZVNwYW4gfCBudWxsLFxuICApIHtcbiAgICBzdXBlcih0eXBlLCBzb3VyY2VTcGFuKTtcbiAgfVxuXG4gIG92ZXJyaWRlIGlzRXF1aXZhbGVudChlOiBFeHByZXNzaW9uKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGUgaW5zdGFuY2VvZiBMaXRlcmFsRXhwciAmJiB0aGlzLnZhbHVlID09PSBlLnZhbHVlO1xuICB9XG5cbiAgb3ZlcnJpZGUgaXNDb25zdGFudCgpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIG92ZXJyaWRlIHZpc2l0RXhwcmVzc2lvbih2aXNpdG9yOiBFeHByZXNzaW9uVmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdExpdGVyYWxFeHByKHRoaXMsIGNvbnRleHQpO1xuICB9XG5cbiAgb3ZlcnJpZGUgY2xvbmUoKTogTGl0ZXJhbEV4cHIge1xuICAgIHJldHVybiBuZXcgTGl0ZXJhbEV4cHIodGhpcy52YWx1ZSwgdGhpcy50eXBlLCB0aGlzLnNvdXJjZVNwYW4pO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUZW1wbGF0ZUxpdGVyYWwge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgZWxlbWVudHM6IFRlbXBsYXRlTGl0ZXJhbEVsZW1lbnRbXSxcbiAgICBwdWJsaWMgZXhwcmVzc2lvbnM6IEV4cHJlc3Npb25bXSxcbiAgKSB7fVxuXG4gIGNsb25lKCk6IFRlbXBsYXRlTGl0ZXJhbCB7XG4gICAgcmV0dXJuIG5ldyBUZW1wbGF0ZUxpdGVyYWwoXG4gICAgICB0aGlzLmVsZW1lbnRzLm1hcCgoZWwpID0+IGVsLmNsb25lKCkpLFxuICAgICAgdGhpcy5leHByZXNzaW9ucy5tYXAoKGV4cHIpID0+IGV4cHIuY2xvbmUoKSksXG4gICAgKTtcbiAgfVxufVxuZXhwb3J0IGNsYXNzIFRlbXBsYXRlTGl0ZXJhbEVsZW1lbnQge1xuICByYXdUZXh0OiBzdHJpbmc7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyB0ZXh0OiBzdHJpbmcsXG4gICAgcHVibGljIHNvdXJjZVNwYW4/OiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgcmF3VGV4dD86IHN0cmluZyxcbiAgKSB7XG4gICAgLy8gSWYgYHJhd1RleHRgIGlzIG5vdCBwcm92aWRlZCwgdHJ5IHRvIGV4dHJhY3QgdGhlIHJhdyBzdHJpbmcgZnJvbSBpdHNcbiAgICAvLyBhc3NvY2lhdGVkIGBzb3VyY2VTcGFuYC4gSWYgdGhhdCBpcyBhbHNvIG5vdCBhdmFpbGFibGUsIFwiZmFrZVwiIHRoZSByYXdcbiAgICAvLyBzdHJpbmcgaW5zdGVhZCBieSBlc2NhcGluZyB0aGUgZm9sbG93aW5nIGNvbnRyb2wgc2VxdWVuY2VzOlxuICAgIC8vIC0gXCJcXFwiIHdvdWxkIG90aGVyd2lzZSBpbmRpY2F0ZSB0aGF0IHRoZSBuZXh0IGNoYXJhY3RlciBpcyBhIGNvbnRyb2wgY2hhcmFjdGVyLlxuICAgIC8vIC0gXCJgXCIgYW5kIFwiJHtcIiBhcmUgdGVtcGxhdGUgc3RyaW5nIGNvbnRyb2wgc2VxdWVuY2VzIHRoYXQgd291bGQgb3RoZXJ3aXNlIHByZW1hdHVyZWx5XG4gICAgLy8gaW5kaWNhdGUgdGhlIGVuZCBvZiB0aGUgdGVtcGxhdGUgbGl0ZXJhbCBlbGVtZW50LlxuICAgIHRoaXMucmF3VGV4dCA9XG4gICAgICByYXdUZXh0ID8/IHNvdXJjZVNwYW4/LnRvU3RyaW5nKCkgPz8gZXNjYXBlRm9yVGVtcGxhdGVMaXRlcmFsKGVzY2FwZVNsYXNoZXModGV4dCkpO1xuICB9XG5cbiAgY2xvbmUoKTogVGVtcGxhdGVMaXRlcmFsRWxlbWVudCB7XG4gICAgcmV0dXJuIG5ldyBUZW1wbGF0ZUxpdGVyYWxFbGVtZW50KHRoaXMudGV4dCwgdGhpcy5zb3VyY2VTcGFuLCB0aGlzLnJhd1RleHQpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBMaXRlcmFsUGllY2Uge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgdGV4dDogc3RyaW5nLFxuICAgIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICkge31cbn1cbmV4cG9ydCBjbGFzcyBQbGFjZWhvbGRlclBpZWNlIHtcbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZiBhIGBQbGFjZWhvbGRlclBpZWNlYC5cbiAgICpcbiAgICogQHBhcmFtIHRleHQgdGhlIG5hbWUgb2YgdGhpcyBwbGFjZWhvbGRlciAoZS5nLiBgUEhfMWApLlxuICAgKiBAcGFyYW0gc291cmNlU3BhbiB0aGUgbG9jYXRpb24gb2YgdGhpcyBwbGFjZWhvbGRlciBpbiBpdHMgbG9jYWxpemVkIG1lc3NhZ2UgdGhlIHNvdXJjZSBjb2RlLlxuICAgKiBAcGFyYW0gYXNzb2NpYXRlZE1lc3NhZ2UgcmVmZXJlbmNlIHRvIGFub3RoZXIgbWVzc2FnZSB0aGF0IHRoaXMgcGxhY2Vob2xkZXIgaXMgYXNzb2NpYXRlZCB3aXRoLlxuICAgKiBUaGUgYGFzc29jaWF0ZWRNZXNzYWdlYCBpcyBtYWlubHkgdXNlZCB0byBwcm92aWRlIGEgcmVsYXRpb25zaGlwIHRvIGFuIElDVSBtZXNzYWdlIHRoYXQgaGFzXG4gICAqIGJlZW4gZXh0cmFjdGVkIG91dCBmcm9tIHRoZSBtZXNzYWdlIGNvbnRhaW5pbmcgdGhlIHBsYWNlaG9sZGVyLlxuICAgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIHRleHQ6IHN0cmluZyxcbiAgICBwdWJsaWMgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgIHB1YmxpYyBhc3NvY2lhdGVkTWVzc2FnZT86IE1lc3NhZ2UsXG4gICkge31cbn1cblxuZXhwb3J0IHR5cGUgTWVzc2FnZVBpZWNlID0gTGl0ZXJhbFBpZWNlIHwgUGxhY2Vob2xkZXJQaWVjZTtcblxuY29uc3QgTUVBTklOR19TRVBBUkFUT1IgPSAnfCc7XG5jb25zdCBJRF9TRVBBUkFUT1IgPSAnQEAnO1xuY29uc3QgTEVHQUNZX0lEX0lORElDQVRPUiA9ICfikJ8nO1xuXG5leHBvcnQgY2xhc3MgTG9jYWxpemVkU3RyaW5nIGV4dGVuZHMgRXhwcmVzc2lvbiB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHJlYWRvbmx5IG1ldGFCbG9jazogSTE4bk1ldGEsXG4gICAgcmVhZG9ubHkgbWVzc2FnZVBhcnRzOiBMaXRlcmFsUGllY2VbXSxcbiAgICByZWFkb25seSBwbGFjZUhvbGRlck5hbWVzOiBQbGFjZWhvbGRlclBpZWNlW10sXG4gICAgcmVhZG9ubHkgZXhwcmVzc2lvbnM6IEV4cHJlc3Npb25bXSxcbiAgICBzb3VyY2VTcGFuPzogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbCxcbiAgKSB7XG4gICAgc3VwZXIoU1RSSU5HX1RZUEUsIHNvdXJjZVNwYW4pO1xuICB9XG5cbiAgb3ZlcnJpZGUgaXNFcXVpdmFsZW50KGU6IEV4cHJlc3Npb24pOiBib29sZWFuIHtcbiAgICAvLyByZXR1cm4gZSBpbnN0YW5jZW9mIExvY2FsaXplZFN0cmluZyAmJiB0aGlzLm1lc3NhZ2UgPT09IGUubWVzc2FnZTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBvdmVycmlkZSBpc0NvbnN0YW50KCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIG92ZXJyaWRlIHZpc2l0RXhwcmVzc2lvbih2aXNpdG9yOiBFeHByZXNzaW9uVmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdExvY2FsaXplZFN0cmluZyh0aGlzLCBjb250ZXh0KTtcbiAgfVxuXG4gIG92ZXJyaWRlIGNsb25lKCk6IExvY2FsaXplZFN0cmluZyB7XG4gICAgcmV0dXJuIG5ldyBMb2NhbGl6ZWRTdHJpbmcoXG4gICAgICB0aGlzLm1ldGFCbG9jayxcbiAgICAgIHRoaXMubWVzc2FnZVBhcnRzLFxuICAgICAgdGhpcy5wbGFjZUhvbGRlck5hbWVzLFxuICAgICAgdGhpcy5leHByZXNzaW9ucy5tYXAoKGV4cHIpID0+IGV4cHIuY2xvbmUoKSksXG4gICAgICB0aGlzLnNvdXJjZVNwYW4sXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXJpYWxpemUgdGhlIGdpdmVuIGBtZXRhYCBhbmQgYG1lc3NhZ2VQYXJ0YCBpbnRvIFwiY29va2VkXCIgYW5kIFwicmF3XCIgc3RyaW5ncyB0aGF0IGNhbiBiZSB1c2VkXG4gICAqIGluIGEgYCRsb2NhbGl6ZWAgdGFnZ2VkIHN0cmluZy4gVGhlIGZvcm1hdCBvZiB0aGUgbWV0YWRhdGEgaXMgdGhlIHNhbWUgYXMgdGhhdCBwYXJzZWQgYnlcbiAgICogYHBhcnNlSTE4bk1ldGEoKWAuXG4gICAqXG4gICAqIEBwYXJhbSBtZXRhIFRoZSBtZXRhZGF0YSB0byBzZXJpYWxpemVcbiAgICogQHBhcmFtIG1lc3NhZ2VQYXJ0IFRoZSBmaXJzdCBwYXJ0IG9mIHRoZSB0YWdnZWQgc3RyaW5nXG4gICAqL1xuICBzZXJpYWxpemVJMThuSGVhZCgpOiBDb29rZWRSYXdTdHJpbmcge1xuICAgIGxldCBtZXRhQmxvY2sgPSB0aGlzLm1ldGFCbG9jay5kZXNjcmlwdGlvbiB8fCAnJztcbiAgICBpZiAodGhpcy5tZXRhQmxvY2subWVhbmluZykge1xuICAgICAgbWV0YUJsb2NrID0gYCR7dGhpcy5tZXRhQmxvY2subWVhbmluZ30ke01FQU5JTkdfU0VQQVJBVE9SfSR7bWV0YUJsb2NrfWA7XG4gICAgfVxuICAgIGlmICh0aGlzLm1ldGFCbG9jay5jdXN0b21JZCkge1xuICAgICAgbWV0YUJsb2NrID0gYCR7bWV0YUJsb2NrfSR7SURfU0VQQVJBVE9SfSR7dGhpcy5tZXRhQmxvY2suY3VzdG9tSWR9YDtcbiAgICB9XG4gICAgaWYgKHRoaXMubWV0YUJsb2NrLmxlZ2FjeUlkcykge1xuICAgICAgdGhpcy5tZXRhQmxvY2subGVnYWN5SWRzLmZvckVhY2goKGxlZ2FjeUlkKSA9PiB7XG4gICAgICAgIG1ldGFCbG9jayA9IGAke21ldGFCbG9ja30ke0xFR0FDWV9JRF9JTkRJQ0FUT1J9JHtsZWdhY3lJZH1gO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBjcmVhdGVDb29rZWRSYXdTdHJpbmcoXG4gICAgICBtZXRhQmxvY2ssXG4gICAgICB0aGlzLm1lc3NhZ2VQYXJ0c1swXS50ZXh0LFxuICAgICAgdGhpcy5nZXRNZXNzYWdlUGFydFNvdXJjZVNwYW4oMCksXG4gICAgKTtcbiAgfVxuXG4gIGdldE1lc3NhZ2VQYXJ0U291cmNlU3BhbihpOiBudW1iZXIpOiBQYXJzZVNvdXJjZVNwYW4gfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5tZXNzYWdlUGFydHNbaV0/LnNvdXJjZVNwYW4gPz8gdGhpcy5zb3VyY2VTcGFuO1xuICB9XG5cbiAgZ2V0UGxhY2Vob2xkZXJTb3VyY2VTcGFuKGk6IG51bWJlcik6IFBhcnNlU291cmNlU3BhbiB7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMucGxhY2VIb2xkZXJOYW1lc1tpXT8uc291cmNlU3BhbiA/PyB0aGlzLmV4cHJlc3Npb25zW2ldPy5zb3VyY2VTcGFuID8/IHRoaXMuc291cmNlU3BhblxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogU2VyaWFsaXplIHRoZSBnaXZlbiBgcGxhY2Vob2xkZXJOYW1lYCBhbmQgYG1lc3NhZ2VQYXJ0YCBpbnRvIFwiY29va2VkXCIgYW5kIFwicmF3XCIgc3RyaW5ncyB0aGF0XG4gICAqIGNhbiBiZSB1c2VkIGluIGEgYCRsb2NhbGl6ZWAgdGFnZ2VkIHN0cmluZy5cbiAgICpcbiAgICogVGhlIGZvcm1hdCBpcyBgOjxwbGFjZWhvbGRlci1uYW1lPltAQDxhc3NvY2lhdGVkLWlkPl06YC5cbiAgICpcbiAgICogVGhlIGBhc3NvY2lhdGVkLWlkYCBpcyB0aGUgbWVzc2FnZSBpZCBvZiB0aGUgKHVzdWFsbHkgYW4gSUNVKSBtZXNzYWdlIHRvIHdoaWNoIHRoaXMgcGxhY2Vob2xkZXJcbiAgICogcmVmZXJzLlxuICAgKlxuICAgKiBAcGFyYW0gcGFydEluZGV4IFRoZSBpbmRleCBvZiB0aGUgbWVzc2FnZSBwYXJ0IHRvIHNlcmlhbGl6ZS5cbiAgICovXG4gIHNlcmlhbGl6ZUkxOG5UZW1wbGF0ZVBhcnQocGFydEluZGV4OiBudW1iZXIpOiBDb29rZWRSYXdTdHJpbmcge1xuICAgIGNvbnN0IHBsYWNlaG9sZGVyID0gdGhpcy5wbGFjZUhvbGRlck5hbWVzW3BhcnRJbmRleCAtIDFdO1xuICAgIGNvbnN0IG1lc3NhZ2VQYXJ0ID0gdGhpcy5tZXNzYWdlUGFydHNbcGFydEluZGV4XTtcbiAgICBsZXQgbWV0YUJsb2NrID0gcGxhY2Vob2xkZXIudGV4dDtcbiAgICBpZiAocGxhY2Vob2xkZXIuYXNzb2NpYXRlZE1lc3NhZ2U/LmxlZ2FjeUlkcy5sZW5ndGggPT09IDApIHtcbiAgICAgIG1ldGFCbG9jayArPSBgJHtJRF9TRVBBUkFUT1J9JHtjb21wdXRlTXNnSWQoXG4gICAgICAgIHBsYWNlaG9sZGVyLmFzc29jaWF0ZWRNZXNzYWdlLm1lc3NhZ2VTdHJpbmcsXG4gICAgICAgIHBsYWNlaG9sZGVyLmFzc29jaWF0ZWRNZXNzYWdlLm1lYW5pbmcsXG4gICAgICApfWA7XG4gICAgfVxuICAgIHJldHVybiBjcmVhdGVDb29rZWRSYXdTdHJpbmcoXG4gICAgICBtZXRhQmxvY2ssXG4gICAgICBtZXNzYWdlUGFydC50ZXh0LFxuICAgICAgdGhpcy5nZXRNZXNzYWdlUGFydFNvdXJjZVNwYW4ocGFydEluZGV4KSxcbiAgICApO1xuICB9XG59XG5cbi8qKlxuICogQSBzdHJ1Y3R1cmUgdG8gaG9sZCB0aGUgY29va2VkIGFuZCByYXcgc3RyaW5ncyBvZiBhIHRlbXBsYXRlIGxpdGVyYWwgZWxlbWVudCwgYWxvbmcgd2l0aCBpdHNcbiAqIHNvdXJjZS1zcGFuIHJhbmdlLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIENvb2tlZFJhd1N0cmluZyB7XG4gIGNvb2tlZDogc3RyaW5nO1xuICByYXc6IHN0cmluZztcbiAgcmFuZ2U6IFBhcnNlU291cmNlU3BhbiB8IG51bGw7XG59XG5cbmNvbnN0IGVzY2FwZVNsYXNoZXMgPSAoc3RyOiBzdHJpbmcpOiBzdHJpbmcgPT4gc3RyLnJlcGxhY2UoL1xcXFwvZywgJ1xcXFxcXFxcJyk7XG5jb25zdCBlc2NhcGVTdGFydGluZ0NvbG9uID0gKHN0cjogc3RyaW5nKTogc3RyaW5nID0+IHN0ci5yZXBsYWNlKC9eOi8sICdcXFxcOicpO1xuY29uc3QgZXNjYXBlQ29sb25zID0gKHN0cjogc3RyaW5nKTogc3RyaW5nID0+IHN0ci5yZXBsYWNlKC86L2csICdcXFxcOicpO1xuY29uc3QgZXNjYXBlRm9yVGVtcGxhdGVMaXRlcmFsID0gKHN0cjogc3RyaW5nKTogc3RyaW5nID0+XG4gIHN0ci5yZXBsYWNlKC9gL2csICdcXFxcYCcpLnJlcGxhY2UoL1xcJHsvZywgJyRcXFxceycpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBge2Nvb2tlZCwgcmF3fWAgb2JqZWN0IGZyb20gdGhlIGBtZXRhQmxvY2tgIGFuZCBgbWVzc2FnZVBhcnRgLlxuICpcbiAqIFRoZSBgcmF3YCB0ZXh0IG11c3QgaGF2ZSB2YXJpb3VzIGNoYXJhY3RlciBzZXF1ZW5jZXMgZXNjYXBlZDpcbiAqICogXCJcXFwiIHdvdWxkIG90aGVyd2lzZSBpbmRpY2F0ZSB0aGF0IHRoZSBuZXh0IGNoYXJhY3RlciBpcyBhIGNvbnRyb2wgY2hhcmFjdGVyLlxuICogKiBcImBcIiBhbmQgXCIke1wiIGFyZSB0ZW1wbGF0ZSBzdHJpbmcgY29udHJvbCBzZXF1ZW5jZXMgdGhhdCB3b3VsZCBvdGhlcndpc2UgcHJlbWF0dXJlbHkgaW5kaWNhdGVcbiAqICAgdGhlIGVuZCBvZiBhIG1lc3NhZ2UgcGFydC5cbiAqICogXCI6XCIgaW5zaWRlIGEgbWV0YWJsb2NrIHdvdWxkIHByZW1hdHVyZWx5IGluZGljYXRlIHRoZSBlbmQgb2YgdGhlIG1ldGFibG9jay5cbiAqICogXCI6XCIgYXQgdGhlIHN0YXJ0IG9mIGEgbWVzc2FnZVBhcnQgd2l0aCBubyBtZXRhYmxvY2sgd291bGQgZXJyb25lb3VzbHkgaW5kaWNhdGUgdGhlIHN0YXJ0IG9mIGFcbiAqICAgbWV0YWJsb2NrLlxuICpcbiAqIEBwYXJhbSBtZXRhQmxvY2sgQW55IG1ldGFkYXRhIHRoYXQgc2hvdWxkIGJlIHByZXBlbmRlZCB0byB0aGUgc3RyaW5nXG4gKiBAcGFyYW0gbWVzc2FnZVBhcnQgVGhlIG1lc3NhZ2UgcGFydCBvZiB0aGUgc3RyaW5nXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUNvb2tlZFJhd1N0cmluZyhcbiAgbWV0YUJsb2NrOiBzdHJpbmcsXG4gIG1lc3NhZ2VQYXJ0OiBzdHJpbmcsXG4gIHJhbmdlOiBQYXJzZVNvdXJjZVNwYW4gfCBudWxsLFxuKTogQ29va2VkUmF3U3RyaW5nIHtcbiAgaWYgKG1ldGFCbG9jayA9PT0gJycpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29va2VkOiBtZXNzYWdlUGFydCxcbiAgICAgIHJhdzogZXNjYXBlRm9yVGVtcGxhdGVMaXRlcmFsKGVzY2FwZVN0YXJ0aW5nQ29sb24oZXNjYXBlU2xhc2hlcyhtZXNzYWdlUGFydCkpKSxcbiAgICAgIHJhbmdlLFxuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvb2tlZDogYDoke21ldGFCbG9ja306JHttZXNzYWdlUGFydH1gLFxuICAgICAgcmF3OiBlc2NhcGVGb3JUZW1wbGF0ZUxpdGVyYWwoXG4gICAgICAgIGA6JHtlc2NhcGVDb2xvbnMoZXNjYXBlU2xhc2hlcyhtZXRhQmxvY2spKX06JHtlc2NhcGVTbGFzaGVzKG1lc3NhZ2VQYXJ0KX1gLFxuICAgICAgKSxcbiAgICAgIHJhbmdlLFxuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEV4dGVybmFsRXhwciBleHRlbmRzIEV4cHJlc3Npb24ge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgdmFsdWU6IEV4dGVybmFsUmVmZXJlbmNlLFxuICAgIHR5cGU/OiBUeXBlIHwgbnVsbCxcbiAgICBwdWJsaWMgdHlwZVBhcmFtczogVHlwZVtdIHwgbnVsbCA9IG51bGwsXG4gICAgc291cmNlU3Bhbj86IFBhcnNlU291cmNlU3BhbiB8IG51bGwsXG4gICkge1xuICAgIHN1cGVyKHR5cGUsIHNvdXJjZVNwYW4pO1xuICB9XG5cbiAgb3ZlcnJpZGUgaXNFcXVpdmFsZW50KGU6IEV4cHJlc3Npb24pOiBib29sZWFuIHtcbiAgICByZXR1cm4gKFxuICAgICAgZSBpbnN0YW5jZW9mIEV4dGVybmFsRXhwciAmJlxuICAgICAgdGhpcy52YWx1ZS5uYW1lID09PSBlLnZhbHVlLm5hbWUgJiZcbiAgICAgIHRoaXMudmFsdWUubW9kdWxlTmFtZSA9PT0gZS52YWx1ZS5tb2R1bGVOYW1lICYmXG4gICAgICB0aGlzLnZhbHVlLnJ1bnRpbWUgPT09IGUudmFsdWUucnVudGltZVxuICAgICk7XG4gIH1cblxuICBvdmVycmlkZSBpc0NvbnN0YW50KCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIG92ZXJyaWRlIHZpc2l0RXhwcmVzc2lvbih2aXNpdG9yOiBFeHByZXNzaW9uVmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdEV4dGVybmFsRXhwcih0aGlzLCBjb250ZXh0KTtcbiAgfVxuXG4gIG92ZXJyaWRlIGNsb25lKCk6IEV4dGVybmFsRXhwciB7XG4gICAgcmV0dXJuIG5ldyBFeHRlcm5hbEV4cHIodGhpcy52YWx1ZSwgdGhpcy50eXBlLCB0aGlzLnR5cGVQYXJhbXMsIHRoaXMuc291cmNlU3Bhbik7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEV4dGVybmFsUmVmZXJlbmNlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIG1vZHVsZU5hbWU6IHN0cmluZyB8IG51bGwsXG4gICAgcHVibGljIG5hbWU6IHN0cmluZyB8IG51bGwsXG4gICAgcHVibGljIHJ1bnRpbWU/OiBhbnkgfCBudWxsLFxuICApIHt9XG4gIC8vIE5vdGU6IG5vIGlzRXF1aXZhbGVudCBtZXRob2QgaGVyZSBhcyB3ZSB1c2UgdGhpcyBhcyBhbiBpbnRlcmZhY2UgdG9vLlxufVxuXG5leHBvcnQgY2xhc3MgQ29uZGl0aW9uYWxFeHByIGV4dGVuZHMgRXhwcmVzc2lvbiB7XG4gIHB1YmxpYyB0cnVlQ2FzZTogRXhwcmVzc2lvbjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgY29uZGl0aW9uOiBFeHByZXNzaW9uLFxuICAgIHRydWVDYXNlOiBFeHByZXNzaW9uLFxuICAgIHB1YmxpYyBmYWxzZUNhc2U6IEV4cHJlc3Npb24gfCBudWxsID0gbnVsbCxcbiAgICB0eXBlPzogVHlwZSB8IG51bGwsXG4gICAgc291cmNlU3Bhbj86IFBhcnNlU291cmNlU3BhbiB8IG51bGwsXG4gICkge1xuICAgIHN1cGVyKHR5cGUgfHwgdHJ1ZUNhc2UudHlwZSwgc291cmNlU3Bhbik7XG4gICAgdGhpcy50cnVlQ2FzZSA9IHRydWVDYXNlO1xuICB9XG5cbiAgb3ZlcnJpZGUgaXNFcXVpdmFsZW50KGU6IEV4cHJlc3Npb24pOiBib29sZWFuIHtcbiAgICByZXR1cm4gKFxuICAgICAgZSBpbnN0YW5jZW9mIENvbmRpdGlvbmFsRXhwciAmJlxuICAgICAgdGhpcy5jb25kaXRpb24uaXNFcXVpdmFsZW50KGUuY29uZGl0aW9uKSAmJlxuICAgICAgdGhpcy50cnVlQ2FzZS5pc0VxdWl2YWxlbnQoZS50cnVlQ2FzZSkgJiZcbiAgICAgIG51bGxTYWZlSXNFcXVpdmFsZW50KHRoaXMuZmFsc2VDYXNlLCBlLmZhbHNlQ2FzZSlcbiAgICApO1xuICB9XG5cbiAgb3ZlcnJpZGUgaXNDb25zdGFudCgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBvdmVycmlkZSB2aXNpdEV4cHJlc3Npb24odmlzaXRvcjogRXhwcmVzc2lvblZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRDb25kaXRpb25hbEV4cHIodGhpcywgY29udGV4dCk7XG4gIH1cblxuICBvdmVycmlkZSBjbG9uZSgpOiBDb25kaXRpb25hbEV4cHIge1xuICAgIHJldHVybiBuZXcgQ29uZGl0aW9uYWxFeHByKFxuICAgICAgdGhpcy5jb25kaXRpb24uY2xvbmUoKSxcbiAgICAgIHRoaXMudHJ1ZUNhc2UuY2xvbmUoKSxcbiAgICAgIHRoaXMuZmFsc2VDYXNlPy5jbG9uZSgpLFxuICAgICAgdGhpcy50eXBlLFxuICAgICAgdGhpcy5zb3VyY2VTcGFuLFxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIER5bmFtaWNJbXBvcnRFeHByIGV4dGVuZHMgRXhwcmVzc2lvbiB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyB1cmw6IHN0cmluZyxcbiAgICBzb3VyY2VTcGFuPzogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbCxcbiAgKSB7XG4gICAgc3VwZXIobnVsbCwgc291cmNlU3Bhbik7XG4gIH1cblxuICBvdmVycmlkZSBpc0VxdWl2YWxlbnQoZTogRXhwcmVzc2lvbik6IGJvb2xlYW4ge1xuICAgIHJldHVybiBlIGluc3RhbmNlb2YgRHluYW1pY0ltcG9ydEV4cHIgJiYgdGhpcy51cmwgPT09IGUudXJsO1xuICB9XG5cbiAgb3ZlcnJpZGUgaXNDb25zdGFudCgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBvdmVycmlkZSB2aXNpdEV4cHJlc3Npb24odmlzaXRvcjogRXhwcmVzc2lvblZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXREeW5hbWljSW1wb3J0RXhwcih0aGlzLCBjb250ZXh0KTtcbiAgfVxuXG4gIG92ZXJyaWRlIGNsb25lKCk6IER5bmFtaWNJbXBvcnRFeHByIHtcbiAgICByZXR1cm4gbmV3IER5bmFtaWNJbXBvcnRFeHByKHRoaXMudXJsLCB0aGlzLnNvdXJjZVNwYW4pO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBOb3RFeHByIGV4dGVuZHMgRXhwcmVzc2lvbiB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBjb25kaXRpb246IEV4cHJlc3Npb24sXG4gICAgc291cmNlU3Bhbj86IFBhcnNlU291cmNlU3BhbiB8IG51bGwsXG4gICkge1xuICAgIHN1cGVyKEJPT0xfVFlQRSwgc291cmNlU3Bhbik7XG4gIH1cblxuICBvdmVycmlkZSBpc0VxdWl2YWxlbnQoZTogRXhwcmVzc2lvbik6IGJvb2xlYW4ge1xuICAgIHJldHVybiBlIGluc3RhbmNlb2YgTm90RXhwciAmJiB0aGlzLmNvbmRpdGlvbi5pc0VxdWl2YWxlbnQoZS5jb25kaXRpb24pO1xuICB9XG5cbiAgb3ZlcnJpZGUgaXNDb25zdGFudCgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBvdmVycmlkZSB2aXNpdEV4cHJlc3Npb24odmlzaXRvcjogRXhwcmVzc2lvblZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXROb3RFeHByKHRoaXMsIGNvbnRleHQpO1xuICB9XG5cbiAgb3ZlcnJpZGUgY2xvbmUoKTogTm90RXhwciB7XG4gICAgcmV0dXJuIG5ldyBOb3RFeHByKHRoaXMuY29uZGl0aW9uLmNsb25lKCksIHRoaXMuc291cmNlU3Bhbik7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEZuUGFyYW0ge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgbmFtZTogc3RyaW5nLFxuICAgIHB1YmxpYyB0eXBlOiBUeXBlIHwgbnVsbCA9IG51bGwsXG4gICkge31cblxuICBpc0VxdWl2YWxlbnQocGFyYW06IEZuUGFyYW0pOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5uYW1lID09PSBwYXJhbS5uYW1lO1xuICB9XG5cbiAgY2xvbmUoKTogRm5QYXJhbSB7XG4gICAgcmV0dXJuIG5ldyBGblBhcmFtKHRoaXMubmFtZSwgdGhpcy50eXBlKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRnVuY3Rpb25FeHByIGV4dGVuZHMgRXhwcmVzc2lvbiB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBwYXJhbXM6IEZuUGFyYW1bXSxcbiAgICBwdWJsaWMgc3RhdGVtZW50czogU3RhdGVtZW50W10sXG4gICAgdHlwZT86IFR5cGUgfCBudWxsLFxuICAgIHNvdXJjZVNwYW4/OiBQYXJzZVNvdXJjZVNwYW4gfCBudWxsLFxuICAgIHB1YmxpYyBuYW1lPzogc3RyaW5nIHwgbnVsbCxcbiAgKSB7XG4gICAgc3VwZXIodHlwZSwgc291cmNlU3Bhbik7XG4gIH1cblxuICBvdmVycmlkZSBpc0VxdWl2YWxlbnQoZTogRXhwcmVzc2lvbiB8IFN0YXRlbWVudCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAoXG4gICAgICAoZSBpbnN0YW5jZW9mIEZ1bmN0aW9uRXhwciB8fCBlIGluc3RhbmNlb2YgRGVjbGFyZUZ1bmN0aW9uU3RtdCkgJiZcbiAgICAgIGFyZUFsbEVxdWl2YWxlbnQodGhpcy5wYXJhbXMsIGUucGFyYW1zKSAmJlxuICAgICAgYXJlQWxsRXF1aXZhbGVudCh0aGlzLnN0YXRlbWVudHMsIGUuc3RhdGVtZW50cylcbiAgICApO1xuICB9XG5cbiAgb3ZlcnJpZGUgaXNDb25zdGFudCgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBvdmVycmlkZSB2aXNpdEV4cHJlc3Npb24odmlzaXRvcjogRXhwcmVzc2lvblZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRGdW5jdGlvbkV4cHIodGhpcywgY29udGV4dCk7XG4gIH1cblxuICB0b0RlY2xTdG10KG5hbWU6IHN0cmluZywgbW9kaWZpZXJzPzogU3RtdE1vZGlmaWVyKTogRGVjbGFyZUZ1bmN0aW9uU3RtdCB7XG4gICAgcmV0dXJuIG5ldyBEZWNsYXJlRnVuY3Rpb25TdG10KFxuICAgICAgbmFtZSxcbiAgICAgIHRoaXMucGFyYW1zLFxuICAgICAgdGhpcy5zdGF0ZW1lbnRzLFxuICAgICAgdGhpcy50eXBlLFxuICAgICAgbW9kaWZpZXJzLFxuICAgICAgdGhpcy5zb3VyY2VTcGFuLFxuICAgICk7XG4gIH1cblxuICBvdmVycmlkZSBjbG9uZSgpOiBGdW5jdGlvbkV4cHIge1xuICAgIC8vIFRPRE86IFNob3VsZCB3ZSBkZWVwIGNsb25lIHN0YXRlbWVudHM/XG4gICAgcmV0dXJuIG5ldyBGdW5jdGlvbkV4cHIoXG4gICAgICB0aGlzLnBhcmFtcy5tYXAoKHApID0+IHAuY2xvbmUoKSksXG4gICAgICB0aGlzLnN0YXRlbWVudHMsXG4gICAgICB0aGlzLnR5cGUsXG4gICAgICB0aGlzLnNvdXJjZVNwYW4sXG4gICAgICB0aGlzLm5hbWUsXG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQXJyb3dGdW5jdGlvbkV4cHIgZXh0ZW5kcyBFeHByZXNzaW9uIHtcbiAgLy8gTm90ZSB0aGF0IGBib2R5OiBFeHByZXNzaW9uYCByZXByZXNlbnRzIGAoKSA9PiBleHByYCB3aGVyZWFzXG4gIC8vIGBib2R5OiBTdGF0ZW1lbnRbXWAgcmVwcmVzZW50cyBgKCkgPT4geyBleHByIH1gLlxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBwYXJhbXM6IEZuUGFyYW1bXSxcbiAgICBwdWJsaWMgYm9keTogRXhwcmVzc2lvbiB8IFN0YXRlbWVudFtdLFxuICAgIHR5cGU/OiBUeXBlIHwgbnVsbCxcbiAgICBzb3VyY2VTcGFuPzogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbCxcbiAgKSB7XG4gICAgc3VwZXIodHlwZSwgc291cmNlU3Bhbik7XG4gIH1cblxuICBvdmVycmlkZSBpc0VxdWl2YWxlbnQoZTogRXhwcmVzc2lvbik6IGJvb2xlYW4ge1xuICAgIGlmICghKGUgaW5zdGFuY2VvZiBBcnJvd0Z1bmN0aW9uRXhwcikgfHwgIWFyZUFsbEVxdWl2YWxlbnQodGhpcy5wYXJhbXMsIGUucGFyYW1zKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmJvZHkgaW5zdGFuY2VvZiBFeHByZXNzaW9uICYmIGUuYm9keSBpbnN0YW5jZW9mIEV4cHJlc3Npb24pIHtcbiAgICAgIHJldHVybiB0aGlzLmJvZHkuaXNFcXVpdmFsZW50KGUuYm9keSk7XG4gICAgfVxuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkodGhpcy5ib2R5KSAmJiBBcnJheS5pc0FycmF5KGUuYm9keSkpIHtcbiAgICAgIHJldHVybiBhcmVBbGxFcXVpdmFsZW50KHRoaXMuYm9keSwgZS5ib2R5KTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBvdmVycmlkZSBpc0NvbnN0YW50KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIG92ZXJyaWRlIHZpc2l0RXhwcmVzc2lvbih2aXNpdG9yOiBFeHByZXNzaW9uVmlzaXRvciwgY29udGV4dDogYW55KSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRBcnJvd0Z1bmN0aW9uRXhwcih0aGlzLCBjb250ZXh0KTtcbiAgfVxuXG4gIG92ZXJyaWRlIGNsb25lKCk6IEV4cHJlc3Npb24ge1xuICAgIC8vIFRPRE86IFNob3VsZCB3ZSBkZWVwIGNsb25lIHN0YXRlbWVudHM/XG4gICAgcmV0dXJuIG5ldyBBcnJvd0Z1bmN0aW9uRXhwcihcbiAgICAgIHRoaXMucGFyYW1zLm1hcCgocCkgPT4gcC5jbG9uZSgpKSxcbiAgICAgIEFycmF5LmlzQXJyYXkodGhpcy5ib2R5KSA/IHRoaXMuYm9keSA6IHRoaXMuYm9keS5jbG9uZSgpLFxuICAgICAgdGhpcy50eXBlLFxuICAgICAgdGhpcy5zb3VyY2VTcGFuLFxuICAgICk7XG4gIH1cblxuICB0b0RlY2xTdG10KG5hbWU6IHN0cmluZywgbW9kaWZpZXJzPzogU3RtdE1vZGlmaWVyKTogRGVjbGFyZVZhclN0bXQge1xuICAgIHJldHVybiBuZXcgRGVjbGFyZVZhclN0bXQobmFtZSwgdGhpcywgSU5GRVJSRURfVFlQRSwgbW9kaWZpZXJzLCB0aGlzLnNvdXJjZVNwYW4pO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBVbmFyeU9wZXJhdG9yRXhwciBleHRlbmRzIEV4cHJlc3Npb24ge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgb3BlcmF0b3I6IFVuYXJ5T3BlcmF0b3IsXG4gICAgcHVibGljIGV4cHI6IEV4cHJlc3Npb24sXG4gICAgdHlwZT86IFR5cGUgfCBudWxsLFxuICAgIHNvdXJjZVNwYW4/OiBQYXJzZVNvdXJjZVNwYW4gfCBudWxsLFxuICAgIHB1YmxpYyBwYXJlbnM6IGJvb2xlYW4gPSB0cnVlLFxuICApIHtcbiAgICBzdXBlcih0eXBlIHx8IE5VTUJFUl9UWVBFLCBzb3VyY2VTcGFuKTtcbiAgfVxuXG4gIG92ZXJyaWRlIGlzRXF1aXZhbGVudChlOiBFeHByZXNzaW9uKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIChcbiAgICAgIGUgaW5zdGFuY2VvZiBVbmFyeU9wZXJhdG9yRXhwciAmJlxuICAgICAgdGhpcy5vcGVyYXRvciA9PT0gZS5vcGVyYXRvciAmJlxuICAgICAgdGhpcy5leHByLmlzRXF1aXZhbGVudChlLmV4cHIpXG4gICAgKTtcbiAgfVxuXG4gIG92ZXJyaWRlIGlzQ29uc3RhbnQoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgb3ZlcnJpZGUgdmlzaXRFeHByZXNzaW9uKHZpc2l0b3I6IEV4cHJlc3Npb25WaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0VW5hcnlPcGVyYXRvckV4cHIodGhpcywgY29udGV4dCk7XG4gIH1cblxuICBvdmVycmlkZSBjbG9uZSgpOiBVbmFyeU9wZXJhdG9yRXhwciB7XG4gICAgcmV0dXJuIG5ldyBVbmFyeU9wZXJhdG9yRXhwcihcbiAgICAgIHRoaXMub3BlcmF0b3IsXG4gICAgICB0aGlzLmV4cHIuY2xvbmUoKSxcbiAgICAgIHRoaXMudHlwZSxcbiAgICAgIHRoaXMuc291cmNlU3BhbixcbiAgICAgIHRoaXMucGFyZW5zLFxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEJpbmFyeU9wZXJhdG9yRXhwciBleHRlbmRzIEV4cHJlc3Npb24ge1xuICBwdWJsaWMgbGhzOiBFeHByZXNzaW9uO1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgb3BlcmF0b3I6IEJpbmFyeU9wZXJhdG9yLFxuICAgIGxoczogRXhwcmVzc2lvbixcbiAgICBwdWJsaWMgcmhzOiBFeHByZXNzaW9uLFxuICAgIHR5cGU/OiBUeXBlIHwgbnVsbCxcbiAgICBzb3VyY2VTcGFuPzogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbCxcbiAgICBwdWJsaWMgcGFyZW5zOiBib29sZWFuID0gdHJ1ZSxcbiAgKSB7XG4gICAgc3VwZXIodHlwZSB8fCBsaHMudHlwZSwgc291cmNlU3Bhbik7XG4gICAgdGhpcy5saHMgPSBsaHM7XG4gIH1cblxuICBvdmVycmlkZSBpc0VxdWl2YWxlbnQoZTogRXhwcmVzc2lvbik6IGJvb2xlYW4ge1xuICAgIHJldHVybiAoXG4gICAgICBlIGluc3RhbmNlb2YgQmluYXJ5T3BlcmF0b3JFeHByICYmXG4gICAgICB0aGlzLm9wZXJhdG9yID09PSBlLm9wZXJhdG9yICYmXG4gICAgICB0aGlzLmxocy5pc0VxdWl2YWxlbnQoZS5saHMpICYmXG4gICAgICB0aGlzLnJocy5pc0VxdWl2YWxlbnQoZS5yaHMpXG4gICAgKTtcbiAgfVxuXG4gIG92ZXJyaWRlIGlzQ29uc3RhbnQoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgb3ZlcnJpZGUgdmlzaXRFeHByZXNzaW9uKHZpc2l0b3I6IEV4cHJlc3Npb25WaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0QmluYXJ5T3BlcmF0b3JFeHByKHRoaXMsIGNvbnRleHQpO1xuICB9XG5cbiAgb3ZlcnJpZGUgY2xvbmUoKTogQmluYXJ5T3BlcmF0b3JFeHByIHtcbiAgICByZXR1cm4gbmV3IEJpbmFyeU9wZXJhdG9yRXhwcihcbiAgICAgIHRoaXMub3BlcmF0b3IsXG4gICAgICB0aGlzLmxocy5jbG9uZSgpLFxuICAgICAgdGhpcy5yaHMuY2xvbmUoKSxcbiAgICAgIHRoaXMudHlwZSxcbiAgICAgIHRoaXMuc291cmNlU3BhbixcbiAgICAgIHRoaXMucGFyZW5zLFxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJlYWRQcm9wRXhwciBleHRlbmRzIEV4cHJlc3Npb24ge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgcmVjZWl2ZXI6IEV4cHJlc3Npb24sXG4gICAgcHVibGljIG5hbWU6IHN0cmluZyxcbiAgICB0eXBlPzogVHlwZSB8IG51bGwsXG4gICAgc291cmNlU3Bhbj86IFBhcnNlU291cmNlU3BhbiB8IG51bGwsXG4gICkge1xuICAgIHN1cGVyKHR5cGUsIHNvdXJjZVNwYW4pO1xuICB9XG5cbiAgLy8gQW4gYWxpYXMgZm9yIG5hbWUsIHdoaWNoIGFsbG93cyBvdGhlciBsb2dpYyB0byBoYW5kbGUgcHJvcGVydHkgcmVhZHMgYW5kIGtleWVkIHJlYWRzIHRvZ2V0aGVyLlxuICBnZXQgaW5kZXgoKSB7XG4gICAgcmV0dXJuIHRoaXMubmFtZTtcbiAgfVxuXG4gIG92ZXJyaWRlIGlzRXF1aXZhbGVudChlOiBFeHByZXNzaW9uKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIChcbiAgICAgIGUgaW5zdGFuY2VvZiBSZWFkUHJvcEV4cHIgJiYgdGhpcy5yZWNlaXZlci5pc0VxdWl2YWxlbnQoZS5yZWNlaXZlcikgJiYgdGhpcy5uYW1lID09PSBlLm5hbWVcbiAgICApO1xuICB9XG5cbiAgb3ZlcnJpZGUgaXNDb25zdGFudCgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBvdmVycmlkZSB2aXNpdEV4cHJlc3Npb24odmlzaXRvcjogRXhwcmVzc2lvblZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRSZWFkUHJvcEV4cHIodGhpcywgY29udGV4dCk7XG4gIH1cblxuICBzZXQodmFsdWU6IEV4cHJlc3Npb24pOiBXcml0ZVByb3BFeHByIHtcbiAgICByZXR1cm4gbmV3IFdyaXRlUHJvcEV4cHIodGhpcy5yZWNlaXZlciwgdGhpcy5uYW1lLCB2YWx1ZSwgbnVsbCwgdGhpcy5zb3VyY2VTcGFuKTtcbiAgfVxuXG4gIG92ZXJyaWRlIGNsb25lKCk6IFJlYWRQcm9wRXhwciB7XG4gICAgcmV0dXJuIG5ldyBSZWFkUHJvcEV4cHIodGhpcy5yZWNlaXZlci5jbG9uZSgpLCB0aGlzLm5hbWUsIHRoaXMudHlwZSwgdGhpcy5zb3VyY2VTcGFuKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVhZEtleUV4cHIgZXh0ZW5kcyBFeHByZXNzaW9uIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIHJlY2VpdmVyOiBFeHByZXNzaW9uLFxuICAgIHB1YmxpYyBpbmRleDogRXhwcmVzc2lvbixcbiAgICB0eXBlPzogVHlwZSB8IG51bGwsXG4gICAgc291cmNlU3Bhbj86IFBhcnNlU291cmNlU3BhbiB8IG51bGwsXG4gICkge1xuICAgIHN1cGVyKHR5cGUsIHNvdXJjZVNwYW4pO1xuICB9XG5cbiAgb3ZlcnJpZGUgaXNFcXVpdmFsZW50KGU6IEV4cHJlc3Npb24pOiBib29sZWFuIHtcbiAgICByZXR1cm4gKFxuICAgICAgZSBpbnN0YW5jZW9mIFJlYWRLZXlFeHByICYmXG4gICAgICB0aGlzLnJlY2VpdmVyLmlzRXF1aXZhbGVudChlLnJlY2VpdmVyKSAmJlxuICAgICAgdGhpcy5pbmRleC5pc0VxdWl2YWxlbnQoZS5pbmRleClcbiAgICApO1xuICB9XG5cbiAgb3ZlcnJpZGUgaXNDb25zdGFudCgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBvdmVycmlkZSB2aXNpdEV4cHJlc3Npb24odmlzaXRvcjogRXhwcmVzc2lvblZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRSZWFkS2V5RXhwcih0aGlzLCBjb250ZXh0KTtcbiAgfVxuXG4gIHNldCh2YWx1ZTogRXhwcmVzc2lvbik6IFdyaXRlS2V5RXhwciB7XG4gICAgcmV0dXJuIG5ldyBXcml0ZUtleUV4cHIodGhpcy5yZWNlaXZlciwgdGhpcy5pbmRleCwgdmFsdWUsIG51bGwsIHRoaXMuc291cmNlU3Bhbik7XG4gIH1cblxuICBvdmVycmlkZSBjbG9uZSgpOiBSZWFkS2V5RXhwciB7XG4gICAgcmV0dXJuIG5ldyBSZWFkS2V5RXhwcih0aGlzLnJlY2VpdmVyLmNsb25lKCksIHRoaXMuaW5kZXguY2xvbmUoKSwgdGhpcy50eXBlLCB0aGlzLnNvdXJjZVNwYW4pO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBMaXRlcmFsQXJyYXlFeHByIGV4dGVuZHMgRXhwcmVzc2lvbiB7XG4gIHB1YmxpYyBlbnRyaWVzOiBFeHByZXNzaW9uW107XG4gIGNvbnN0cnVjdG9yKGVudHJpZXM6IEV4cHJlc3Npb25bXSwgdHlwZT86IFR5cGUgfCBudWxsLCBzb3VyY2VTcGFuPzogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbCkge1xuICAgIHN1cGVyKHR5cGUsIHNvdXJjZVNwYW4pO1xuICAgIHRoaXMuZW50cmllcyA9IGVudHJpZXM7XG4gIH1cblxuICBvdmVycmlkZSBpc0NvbnN0YW50KCkge1xuICAgIHJldHVybiB0aGlzLmVudHJpZXMuZXZlcnkoKGUpID0+IGUuaXNDb25zdGFudCgpKTtcbiAgfVxuXG4gIG92ZXJyaWRlIGlzRXF1aXZhbGVudChlOiBFeHByZXNzaW9uKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGUgaW5zdGFuY2VvZiBMaXRlcmFsQXJyYXlFeHByICYmIGFyZUFsbEVxdWl2YWxlbnQodGhpcy5lbnRyaWVzLCBlLmVudHJpZXMpO1xuICB9XG4gIG92ZXJyaWRlIHZpc2l0RXhwcmVzc2lvbih2aXNpdG9yOiBFeHByZXNzaW9uVmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdExpdGVyYWxBcnJheUV4cHIodGhpcywgY29udGV4dCk7XG4gIH1cblxuICBvdmVycmlkZSBjbG9uZSgpOiBMaXRlcmFsQXJyYXlFeHByIHtcbiAgICByZXR1cm4gbmV3IExpdGVyYWxBcnJheUV4cHIoXG4gICAgICB0aGlzLmVudHJpZXMubWFwKChlKSA9PiBlLmNsb25lKCkpLFxuICAgICAgdGhpcy50eXBlLFxuICAgICAgdGhpcy5zb3VyY2VTcGFuLFxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIExpdGVyYWxNYXBFbnRyeSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBrZXk6IHN0cmluZyxcbiAgICBwdWJsaWMgdmFsdWU6IEV4cHJlc3Npb24sXG4gICAgcHVibGljIHF1b3RlZDogYm9vbGVhbixcbiAgKSB7fVxuICBpc0VxdWl2YWxlbnQoZTogTGl0ZXJhbE1hcEVudHJ5KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMua2V5ID09PSBlLmtleSAmJiB0aGlzLnZhbHVlLmlzRXF1aXZhbGVudChlLnZhbHVlKTtcbiAgfVxuXG4gIGNsb25lKCk6IExpdGVyYWxNYXBFbnRyeSB7XG4gICAgcmV0dXJuIG5ldyBMaXRlcmFsTWFwRW50cnkodGhpcy5rZXksIHRoaXMudmFsdWUuY2xvbmUoKSwgdGhpcy5xdW90ZWQpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBMaXRlcmFsTWFwRXhwciBleHRlbmRzIEV4cHJlc3Npb24ge1xuICBwdWJsaWMgdmFsdWVUeXBlOiBUeXBlIHwgbnVsbCA9IG51bGw7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBlbnRyaWVzOiBMaXRlcmFsTWFwRW50cnlbXSxcbiAgICB0eXBlPzogTWFwVHlwZSB8IG51bGwsXG4gICAgc291cmNlU3Bhbj86IFBhcnNlU291cmNlU3BhbiB8IG51bGwsXG4gICkge1xuICAgIHN1cGVyKHR5cGUsIHNvdXJjZVNwYW4pO1xuICAgIGlmICh0eXBlKSB7XG4gICAgICB0aGlzLnZhbHVlVHlwZSA9IHR5cGUudmFsdWVUeXBlO1xuICAgIH1cbiAgfVxuXG4gIG92ZXJyaWRlIGlzRXF1aXZhbGVudChlOiBFeHByZXNzaW9uKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGUgaW5zdGFuY2VvZiBMaXRlcmFsTWFwRXhwciAmJiBhcmVBbGxFcXVpdmFsZW50KHRoaXMuZW50cmllcywgZS5lbnRyaWVzKTtcbiAgfVxuXG4gIG92ZXJyaWRlIGlzQ29uc3RhbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZW50cmllcy5ldmVyeSgoZSkgPT4gZS52YWx1ZS5pc0NvbnN0YW50KCkpO1xuICB9XG5cbiAgb3ZlcnJpZGUgdmlzaXRFeHByZXNzaW9uKHZpc2l0b3I6IEV4cHJlc3Npb25WaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0TGl0ZXJhbE1hcEV4cHIodGhpcywgY29udGV4dCk7XG4gIH1cblxuICBvdmVycmlkZSBjbG9uZSgpOiBMaXRlcmFsTWFwRXhwciB7XG4gICAgY29uc3QgZW50cmllc0Nsb25lID0gdGhpcy5lbnRyaWVzLm1hcCgoZW50cnkpID0+IGVudHJ5LmNsb25lKCkpO1xuICAgIHJldHVybiBuZXcgTGl0ZXJhbE1hcEV4cHIoZW50cmllc0Nsb25lLCB0aGlzLnR5cGUgYXMgTWFwVHlwZSB8IG51bGwsIHRoaXMuc291cmNlU3Bhbik7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIENvbW1hRXhwciBleHRlbmRzIEV4cHJlc3Npb24ge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgcGFydHM6IEV4cHJlc3Npb25bXSxcbiAgICBzb3VyY2VTcGFuPzogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbCxcbiAgKSB7XG4gICAgc3VwZXIocGFydHNbcGFydHMubGVuZ3RoIC0gMV0udHlwZSwgc291cmNlU3Bhbik7XG4gIH1cblxuICBvdmVycmlkZSBpc0VxdWl2YWxlbnQoZTogRXhwcmVzc2lvbik6IGJvb2xlYW4ge1xuICAgIHJldHVybiBlIGluc3RhbmNlb2YgQ29tbWFFeHByICYmIGFyZUFsbEVxdWl2YWxlbnQodGhpcy5wYXJ0cywgZS5wYXJ0cyk7XG4gIH1cblxuICBvdmVycmlkZSBpc0NvbnN0YW50KCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIG92ZXJyaWRlIHZpc2l0RXhwcmVzc2lvbih2aXNpdG9yOiBFeHByZXNzaW9uVmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdENvbW1hRXhwcih0aGlzLCBjb250ZXh0KTtcbiAgfVxuXG4gIG92ZXJyaWRlIGNsb25lKCk6IENvbW1hRXhwciB7XG4gICAgcmV0dXJuIG5ldyBDb21tYUV4cHIodGhpcy5wYXJ0cy5tYXAoKHApID0+IHAuY2xvbmUoKSkpO1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRXhwcmVzc2lvblZpc2l0b3Ige1xuICB2aXNpdFJlYWRWYXJFeHByKGFzdDogUmVhZFZhckV4cHIsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRXcml0ZVZhckV4cHIoZXhwcjogV3JpdGVWYXJFeHByLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0V3JpdGVLZXlFeHByKGV4cHI6IFdyaXRlS2V5RXhwciwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdFdyaXRlUHJvcEV4cHIoZXhwcjogV3JpdGVQcm9wRXhwciwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdEludm9rZUZ1bmN0aW9uRXhwcihhc3Q6IEludm9rZUZ1bmN0aW9uRXhwciwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdFRhZ2dlZFRlbXBsYXRlRXhwcihhc3Q6IFRhZ2dlZFRlbXBsYXRlRXhwciwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdEluc3RhbnRpYXRlRXhwcihhc3Q6IEluc3RhbnRpYXRlRXhwciwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdExpdGVyYWxFeHByKGFzdDogTGl0ZXJhbEV4cHIsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRMb2NhbGl6ZWRTdHJpbmcoYXN0OiBMb2NhbGl6ZWRTdHJpbmcsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRFeHRlcm5hbEV4cHIoYXN0OiBFeHRlcm5hbEV4cHIsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRDb25kaXRpb25hbEV4cHIoYXN0OiBDb25kaXRpb25hbEV4cHIsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXREeW5hbWljSW1wb3J0RXhwcihhc3Q6IER5bmFtaWNJbXBvcnRFeHByLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0Tm90RXhwcihhc3Q6IE5vdEV4cHIsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRGdW5jdGlvbkV4cHIoYXN0OiBGdW5jdGlvbkV4cHIsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRVbmFyeU9wZXJhdG9yRXhwcihhc3Q6IFVuYXJ5T3BlcmF0b3JFeHByLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0QmluYXJ5T3BlcmF0b3JFeHByKGFzdDogQmluYXJ5T3BlcmF0b3JFeHByLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0UmVhZFByb3BFeHByKGFzdDogUmVhZFByb3BFeHByLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0UmVhZEtleUV4cHIoYXN0OiBSZWFkS2V5RXhwciwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdExpdGVyYWxBcnJheUV4cHIoYXN0OiBMaXRlcmFsQXJyYXlFeHByLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0TGl0ZXJhbE1hcEV4cHIoYXN0OiBMaXRlcmFsTWFwRXhwciwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdENvbW1hRXhwcihhc3Q6IENvbW1hRXhwciwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdFdyYXBwZWROb2RlRXhwcihhc3Q6IFdyYXBwZWROb2RlRXhwcjxhbnk+LCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0VHlwZW9mRXhwcihhc3Q6IFR5cGVvZkV4cHIsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRBcnJvd0Z1bmN0aW9uRXhwcihhc3Q6IEFycm93RnVuY3Rpb25FeHByLCBjb250ZXh0OiBhbnkpOiBhbnk7XG59XG5cbmV4cG9ydCBjb25zdCBOVUxMX0VYUFIgPSBuZXcgTGl0ZXJhbEV4cHIobnVsbCwgbnVsbCwgbnVsbCk7XG5leHBvcnQgY29uc3QgVFlQRURfTlVMTF9FWFBSID0gbmV3IExpdGVyYWxFeHByKG51bGwsIElORkVSUkVEX1RZUEUsIG51bGwpO1xuXG4vLy8vIFN0YXRlbWVudHNcbmV4cG9ydCBlbnVtIFN0bXRNb2RpZmllciB7XG4gIE5vbmUgPSAwLFxuICBGaW5hbCA9IDEgPDwgMCxcbiAgUHJpdmF0ZSA9IDEgPDwgMSxcbiAgRXhwb3J0ZWQgPSAxIDw8IDIsXG4gIFN0YXRpYyA9IDEgPDwgMyxcbn1cblxuZXhwb3J0IGNsYXNzIExlYWRpbmdDb21tZW50IHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIHRleHQ6IHN0cmluZyxcbiAgICBwdWJsaWMgbXVsdGlsaW5lOiBib29sZWFuLFxuICAgIHB1YmxpYyB0cmFpbGluZ05ld2xpbmU6IGJvb2xlYW4sXG4gICkge31cbiAgdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMubXVsdGlsaW5lID8gYCAke3RoaXMudGV4dH0gYCA6IHRoaXMudGV4dDtcbiAgfVxufVxuZXhwb3J0IGNsYXNzIEpTRG9jQ29tbWVudCBleHRlbmRzIExlYWRpbmdDb21tZW50IHtcbiAgY29uc3RydWN0b3IocHVibGljIHRhZ3M6IEpTRG9jVGFnW10pIHtcbiAgICBzdXBlcignJywgLyogbXVsdGlsaW5lICovIHRydWUsIC8qIHRyYWlsaW5nTmV3bGluZSAqLyB0cnVlKTtcbiAgfVxuICBvdmVycmlkZSB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiBzZXJpYWxpemVUYWdzKHRoaXMudGFncyk7XG4gIH1cbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFN0YXRlbWVudCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBtb2RpZmllcnM6IFN0bXRNb2RpZmllciA9IFN0bXRNb2RpZmllci5Ob25lLFxuICAgIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4gfCBudWxsID0gbnVsbCxcbiAgICBwdWJsaWMgbGVhZGluZ0NvbW1lbnRzPzogTGVhZGluZ0NvbW1lbnRbXSxcbiAgKSB7fVxuICAvKipcbiAgICogQ2FsY3VsYXRlcyB3aGV0aGVyIHRoaXMgc3RhdGVtZW50IHByb2R1Y2VzIHRoZSBzYW1lIHZhbHVlIGFzIHRoZSBnaXZlbiBzdGF0ZW1lbnQuXG4gICAqIE5vdGU6IFdlIGRvbid0IGNoZWNrIFR5cGVzIG5vciBQYXJzZVNvdXJjZVNwYW5zIG5vciBmdW5jdGlvbiBhcmd1bWVudHMuXG4gICAqL1xuICBhYnN0cmFjdCBpc0VxdWl2YWxlbnQoc3RtdDogU3RhdGVtZW50KTogYm9vbGVhbjtcblxuICBhYnN0cmFjdCB2aXNpdFN0YXRlbWVudCh2aXNpdG9yOiBTdGF0ZW1lbnRWaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnk7XG5cbiAgaGFzTW9kaWZpZXIobW9kaWZpZXI6IFN0bXRNb2RpZmllcik6IGJvb2xlYW4ge1xuICAgIHJldHVybiAodGhpcy5tb2RpZmllcnMgJiBtb2RpZmllcikgIT09IDA7XG4gIH1cblxuICBhZGRMZWFkaW5nQ29tbWVudChsZWFkaW5nQ29tbWVudDogTGVhZGluZ0NvbW1lbnQpOiB2b2lkIHtcbiAgICB0aGlzLmxlYWRpbmdDb21tZW50cyA9IHRoaXMubGVhZGluZ0NvbW1lbnRzID8/IFtdO1xuICAgIHRoaXMubGVhZGluZ0NvbW1lbnRzLnB1c2gobGVhZGluZ0NvbW1lbnQpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEZWNsYXJlVmFyU3RtdCBleHRlbmRzIFN0YXRlbWVudCB7XG4gIHB1YmxpYyB0eXBlOiBUeXBlIHwgbnVsbDtcbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIG5hbWU6IHN0cmluZyxcbiAgICBwdWJsaWMgdmFsdWU/OiBFeHByZXNzaW9uLFxuICAgIHR5cGU/OiBUeXBlIHwgbnVsbCxcbiAgICBtb2RpZmllcnM/OiBTdG10TW9kaWZpZXIsXG4gICAgc291cmNlU3Bhbj86IFBhcnNlU291cmNlU3BhbiB8IG51bGwsXG4gICAgbGVhZGluZ0NvbW1lbnRzPzogTGVhZGluZ0NvbW1lbnRbXSxcbiAgKSB7XG4gICAgc3VwZXIobW9kaWZpZXJzLCBzb3VyY2VTcGFuLCBsZWFkaW5nQ29tbWVudHMpO1xuICAgIHRoaXMudHlwZSA9IHR5cGUgfHwgKHZhbHVlICYmIHZhbHVlLnR5cGUpIHx8IG51bGw7XG4gIH1cbiAgb3ZlcnJpZGUgaXNFcXVpdmFsZW50KHN0bXQ6IFN0YXRlbWVudCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAoXG4gICAgICBzdG10IGluc3RhbmNlb2YgRGVjbGFyZVZhclN0bXQgJiZcbiAgICAgIHRoaXMubmFtZSA9PT0gc3RtdC5uYW1lICYmXG4gICAgICAodGhpcy52YWx1ZSA/ICEhc3RtdC52YWx1ZSAmJiB0aGlzLnZhbHVlLmlzRXF1aXZhbGVudChzdG10LnZhbHVlKSA6ICFzdG10LnZhbHVlKVxuICAgICk7XG4gIH1cbiAgb3ZlcnJpZGUgdmlzaXRTdGF0ZW1lbnQodmlzaXRvcjogU3RhdGVtZW50VmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdERlY2xhcmVWYXJTdG10KHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEZWNsYXJlRnVuY3Rpb25TdG10IGV4dGVuZHMgU3RhdGVtZW50IHtcbiAgcHVibGljIHR5cGU6IFR5cGUgfCBudWxsO1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgbmFtZTogc3RyaW5nLFxuICAgIHB1YmxpYyBwYXJhbXM6IEZuUGFyYW1bXSxcbiAgICBwdWJsaWMgc3RhdGVtZW50czogU3RhdGVtZW50W10sXG4gICAgdHlwZT86IFR5cGUgfCBudWxsLFxuICAgIG1vZGlmaWVycz86IFN0bXRNb2RpZmllcixcbiAgICBzb3VyY2VTcGFuPzogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbCxcbiAgICBsZWFkaW5nQ29tbWVudHM/OiBMZWFkaW5nQ29tbWVudFtdLFxuICApIHtcbiAgICBzdXBlcihtb2RpZmllcnMsIHNvdXJjZVNwYW4sIGxlYWRpbmdDb21tZW50cyk7XG4gICAgdGhpcy50eXBlID0gdHlwZSB8fCBudWxsO1xuICB9XG4gIG92ZXJyaWRlIGlzRXF1aXZhbGVudChzdG10OiBTdGF0ZW1lbnQpOiBib29sZWFuIHtcbiAgICByZXR1cm4gKFxuICAgICAgc3RtdCBpbnN0YW5jZW9mIERlY2xhcmVGdW5jdGlvblN0bXQgJiZcbiAgICAgIGFyZUFsbEVxdWl2YWxlbnQodGhpcy5wYXJhbXMsIHN0bXQucGFyYW1zKSAmJlxuICAgICAgYXJlQWxsRXF1aXZhbGVudCh0aGlzLnN0YXRlbWVudHMsIHN0bXQuc3RhdGVtZW50cylcbiAgICApO1xuICB9XG4gIG92ZXJyaWRlIHZpc2l0U3RhdGVtZW50KHZpc2l0b3I6IFN0YXRlbWVudFZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXREZWNsYXJlRnVuY3Rpb25TdG10KHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBFeHByZXNzaW9uU3RhdGVtZW50IGV4dGVuZHMgU3RhdGVtZW50IHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIGV4cHI6IEV4cHJlc3Npb24sXG4gICAgc291cmNlU3Bhbj86IFBhcnNlU291cmNlU3BhbiB8IG51bGwsXG4gICAgbGVhZGluZ0NvbW1lbnRzPzogTGVhZGluZ0NvbW1lbnRbXSxcbiAgKSB7XG4gICAgc3VwZXIoU3RtdE1vZGlmaWVyLk5vbmUsIHNvdXJjZVNwYW4sIGxlYWRpbmdDb21tZW50cyk7XG4gIH1cbiAgb3ZlcnJpZGUgaXNFcXVpdmFsZW50KHN0bXQ6IFN0YXRlbWVudCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBzdG10IGluc3RhbmNlb2YgRXhwcmVzc2lvblN0YXRlbWVudCAmJiB0aGlzLmV4cHIuaXNFcXVpdmFsZW50KHN0bXQuZXhwcik7XG4gIH1cbiAgb3ZlcnJpZGUgdmlzaXRTdGF0ZW1lbnQodmlzaXRvcjogU3RhdGVtZW50VmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdEV4cHJlc3Npb25TdG10KHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSZXR1cm5TdGF0ZW1lbnQgZXh0ZW5kcyBTdGF0ZW1lbnQge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgdmFsdWU6IEV4cHJlc3Npb24sXG4gICAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbCA9IG51bGwsXG4gICAgbGVhZGluZ0NvbW1lbnRzPzogTGVhZGluZ0NvbW1lbnRbXSxcbiAgKSB7XG4gICAgc3VwZXIoU3RtdE1vZGlmaWVyLk5vbmUsIHNvdXJjZVNwYW4sIGxlYWRpbmdDb21tZW50cyk7XG4gIH1cbiAgb3ZlcnJpZGUgaXNFcXVpdmFsZW50KHN0bXQ6IFN0YXRlbWVudCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBzdG10IGluc3RhbmNlb2YgUmV0dXJuU3RhdGVtZW50ICYmIHRoaXMudmFsdWUuaXNFcXVpdmFsZW50KHN0bXQudmFsdWUpO1xuICB9XG4gIG92ZXJyaWRlIHZpc2l0U3RhdGVtZW50KHZpc2l0b3I6IFN0YXRlbWVudFZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRSZXR1cm5TdG10KHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBJZlN0bXQgZXh0ZW5kcyBTdGF0ZW1lbnQge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgY29uZGl0aW9uOiBFeHByZXNzaW9uLFxuICAgIHB1YmxpYyB0cnVlQ2FzZTogU3RhdGVtZW50W10sXG4gICAgcHVibGljIGZhbHNlQ2FzZTogU3RhdGVtZW50W10gPSBbXSxcbiAgICBzb3VyY2VTcGFuPzogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbCxcbiAgICBsZWFkaW5nQ29tbWVudHM/OiBMZWFkaW5nQ29tbWVudFtdLFxuICApIHtcbiAgICBzdXBlcihTdG10TW9kaWZpZXIuTm9uZSwgc291cmNlU3BhbiwgbGVhZGluZ0NvbW1lbnRzKTtcbiAgfVxuICBvdmVycmlkZSBpc0VxdWl2YWxlbnQoc3RtdDogU3RhdGVtZW50KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIChcbiAgICAgIHN0bXQgaW5zdGFuY2VvZiBJZlN0bXQgJiZcbiAgICAgIHRoaXMuY29uZGl0aW9uLmlzRXF1aXZhbGVudChzdG10LmNvbmRpdGlvbikgJiZcbiAgICAgIGFyZUFsbEVxdWl2YWxlbnQodGhpcy50cnVlQ2FzZSwgc3RtdC50cnVlQ2FzZSkgJiZcbiAgICAgIGFyZUFsbEVxdWl2YWxlbnQodGhpcy5mYWxzZUNhc2UsIHN0bXQuZmFsc2VDYXNlKVxuICAgICk7XG4gIH1cbiAgb3ZlcnJpZGUgdmlzaXRTdGF0ZW1lbnQodmlzaXRvcjogU3RhdGVtZW50VmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdElmU3RtdCh0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFN0YXRlbWVudFZpc2l0b3Ige1xuICB2aXNpdERlY2xhcmVWYXJTdG10KHN0bXQ6IERlY2xhcmVWYXJTdG10LCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0RGVjbGFyZUZ1bmN0aW9uU3RtdChzdG10OiBEZWNsYXJlRnVuY3Rpb25TdG10LCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0RXhwcmVzc2lvblN0bXQoc3RtdDogRXhwcmVzc2lvblN0YXRlbWVudCwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdFJldHVyblN0bXQoc3RtdDogUmV0dXJuU3RhdGVtZW50LCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0SWZTdG10KHN0bXQ6IElmU3RtdCwgY29udGV4dDogYW55KTogYW55O1xufVxuXG5leHBvcnQgY2xhc3MgUmVjdXJzaXZlQXN0VmlzaXRvciBpbXBsZW1lbnRzIFN0YXRlbWVudFZpc2l0b3IsIEV4cHJlc3Npb25WaXNpdG9yIHtcbiAgdmlzaXRUeXBlKGFzdDogVHlwZSwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gYXN0O1xuICB9XG4gIHZpc2l0RXhwcmVzc2lvbihhc3Q6IEV4cHJlc3Npb24sIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgaWYgKGFzdC50eXBlKSB7XG4gICAgICBhc3QudHlwZS52aXNpdFR5cGUodGhpcywgY29udGV4dCk7XG4gICAgfVxuICAgIHJldHVybiBhc3Q7XG4gIH1cbiAgdmlzaXRCdWlsdGluVHlwZSh0eXBlOiBCdWlsdGluVHlwZSwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdGhpcy52aXNpdFR5cGUodHlwZSwgY29udGV4dCk7XG4gIH1cbiAgdmlzaXRFeHByZXNzaW9uVHlwZSh0eXBlOiBFeHByZXNzaW9uVHlwZSwgY29udGV4dDogYW55KTogYW55IHtcbiAgICB0eXBlLnZhbHVlLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KTtcbiAgICBpZiAodHlwZS50eXBlUGFyYW1zICE9PSBudWxsKSB7XG4gICAgICB0eXBlLnR5cGVQYXJhbXMuZm9yRWFjaCgocGFyYW0pID0+IHRoaXMudmlzaXRUeXBlKHBhcmFtLCBjb250ZXh0KSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnZpc2l0VHlwZSh0eXBlLCBjb250ZXh0KTtcbiAgfVxuICB2aXNpdEFycmF5VHlwZSh0eXBlOiBBcnJheVR5cGUsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMudmlzaXRUeXBlKHR5cGUsIGNvbnRleHQpO1xuICB9XG4gIHZpc2l0TWFwVHlwZSh0eXBlOiBNYXBUeXBlLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLnZpc2l0VHlwZSh0eXBlLCBjb250ZXh0KTtcbiAgfVxuICB2aXNpdFRyYW5zcGxhbnRlZFR5cGUodHlwZTogVHJhbnNwbGFudGVkVHlwZTx1bmtub3duPiwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdHlwZTtcbiAgfVxuICB2aXNpdFdyYXBwZWROb2RlRXhwcihhc3Q6IFdyYXBwZWROb2RlRXhwcjxhbnk+LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiBhc3Q7XG4gIH1cbiAgdmlzaXRUeXBlb2ZFeHByKGFzdDogVHlwZW9mRXhwciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdGhpcy52aXNpdEV4cHJlc3Npb24oYXN0LCBjb250ZXh0KTtcbiAgfVxuICB2aXNpdFJlYWRWYXJFeHByKGFzdDogUmVhZFZhckV4cHIsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMudmlzaXRFeHByZXNzaW9uKGFzdCwgY29udGV4dCk7XG4gIH1cbiAgdmlzaXRXcml0ZVZhckV4cHIoYXN0OiBXcml0ZVZhckV4cHIsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgYXN0LnZhbHVlLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KTtcbiAgICByZXR1cm4gdGhpcy52aXNpdEV4cHJlc3Npb24oYXN0LCBjb250ZXh0KTtcbiAgfVxuICB2aXNpdFdyaXRlS2V5RXhwcihhc3Q6IFdyaXRlS2V5RXhwciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICBhc3QucmVjZWl2ZXIudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpO1xuICAgIGFzdC5pbmRleC52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCk7XG4gICAgYXN0LnZhbHVlLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KTtcbiAgICByZXR1cm4gdGhpcy52aXNpdEV4cHJlc3Npb24oYXN0LCBjb250ZXh0KTtcbiAgfVxuICB2aXNpdFdyaXRlUHJvcEV4cHIoYXN0OiBXcml0ZVByb3BFeHByLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIGFzdC5yZWNlaXZlci52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCk7XG4gICAgYXN0LnZhbHVlLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KTtcbiAgICByZXR1cm4gdGhpcy52aXNpdEV4cHJlc3Npb24oYXN0LCBjb250ZXh0KTtcbiAgfVxuICB2aXNpdER5bmFtaWNJbXBvcnRFeHByKGFzdDogRHluYW1pY0ltcG9ydEV4cHIsIGNvbnRleHQ6IGFueSkge1xuICAgIHJldHVybiB0aGlzLnZpc2l0RXhwcmVzc2lvbihhc3QsIGNvbnRleHQpO1xuICB9XG4gIHZpc2l0SW52b2tlRnVuY3Rpb25FeHByKGFzdDogSW52b2tlRnVuY3Rpb25FeHByLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIGFzdC5mbi52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCk7XG4gICAgdGhpcy52aXNpdEFsbEV4cHJlc3Npb25zKGFzdC5hcmdzLCBjb250ZXh0KTtcbiAgICByZXR1cm4gdGhpcy52aXNpdEV4cHJlc3Npb24oYXN0LCBjb250ZXh0KTtcbiAgfVxuICB2aXNpdFRhZ2dlZFRlbXBsYXRlRXhwcihhc3Q6IFRhZ2dlZFRlbXBsYXRlRXhwciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICBhc3QudGFnLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KTtcbiAgICB0aGlzLnZpc2l0QWxsRXhwcmVzc2lvbnMoYXN0LnRlbXBsYXRlLmV4cHJlc3Npb25zLCBjb250ZXh0KTtcbiAgICByZXR1cm4gdGhpcy52aXNpdEV4cHJlc3Npb24oYXN0LCBjb250ZXh0KTtcbiAgfVxuICB2aXNpdEluc3RhbnRpYXRlRXhwcihhc3Q6IEluc3RhbnRpYXRlRXhwciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICBhc3QuY2xhc3NFeHByLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KTtcbiAgICB0aGlzLnZpc2l0QWxsRXhwcmVzc2lvbnMoYXN0LmFyZ3MsIGNvbnRleHQpO1xuICAgIHJldHVybiB0aGlzLnZpc2l0RXhwcmVzc2lvbihhc3QsIGNvbnRleHQpO1xuICB9XG4gIHZpc2l0TGl0ZXJhbEV4cHIoYXN0OiBMaXRlcmFsRXhwciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdGhpcy52aXNpdEV4cHJlc3Npb24oYXN0LCBjb250ZXh0KTtcbiAgfVxuICB2aXNpdExvY2FsaXplZFN0cmluZyhhc3Q6IExvY2FsaXplZFN0cmluZywgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdGhpcy52aXNpdEV4cHJlc3Npb24oYXN0LCBjb250ZXh0KTtcbiAgfVxuICB2aXNpdEV4dGVybmFsRXhwcihhc3Q6IEV4dGVybmFsRXhwciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICBpZiAoYXN0LnR5cGVQYXJhbXMpIHtcbiAgICAgIGFzdC50eXBlUGFyYW1zLmZvckVhY2goKHR5cGUpID0+IHR5cGUudmlzaXRUeXBlKHRoaXMsIGNvbnRleHQpKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudmlzaXRFeHByZXNzaW9uKGFzdCwgY29udGV4dCk7XG4gIH1cbiAgdmlzaXRDb25kaXRpb25hbEV4cHIoYXN0OiBDb25kaXRpb25hbEV4cHIsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgYXN0LmNvbmRpdGlvbi52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCk7XG4gICAgYXN0LnRydWVDYXNlLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KTtcbiAgICBhc3QuZmFsc2VDYXNlIS52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCk7XG4gICAgcmV0dXJuIHRoaXMudmlzaXRFeHByZXNzaW9uKGFzdCwgY29udGV4dCk7XG4gIH1cbiAgdmlzaXROb3RFeHByKGFzdDogTm90RXhwciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICBhc3QuY29uZGl0aW9uLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KTtcbiAgICByZXR1cm4gdGhpcy52aXNpdEV4cHJlc3Npb24oYXN0LCBjb250ZXh0KTtcbiAgfVxuICB2aXNpdEZ1bmN0aW9uRXhwcihhc3Q6IEZ1bmN0aW9uRXhwciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICB0aGlzLnZpc2l0QWxsU3RhdGVtZW50cyhhc3Quc3RhdGVtZW50cywgY29udGV4dCk7XG4gICAgcmV0dXJuIHRoaXMudmlzaXRFeHByZXNzaW9uKGFzdCwgY29udGV4dCk7XG4gIH1cbiAgdmlzaXRBcnJvd0Z1bmN0aW9uRXhwcihhc3Q6IEFycm93RnVuY3Rpb25FeHByLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KGFzdC5ib2R5KSkge1xuICAgICAgdGhpcy52aXNpdEFsbFN0YXRlbWVudHMoYXN0LmJvZHksIGNvbnRleHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnZpc2l0RXhwcmVzc2lvbihhc3QuYm9keSwgY29udGV4dCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMudmlzaXRFeHByZXNzaW9uKGFzdCwgY29udGV4dCk7XG4gIH1cbiAgdmlzaXRVbmFyeU9wZXJhdG9yRXhwcihhc3Q6IFVuYXJ5T3BlcmF0b3JFeHByLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIGFzdC5leHByLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KTtcbiAgICByZXR1cm4gdGhpcy52aXNpdEV4cHJlc3Npb24oYXN0LCBjb250ZXh0KTtcbiAgfVxuICB2aXNpdEJpbmFyeU9wZXJhdG9yRXhwcihhc3Q6IEJpbmFyeU9wZXJhdG9yRXhwciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICBhc3QubGhzLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KTtcbiAgICBhc3QucmhzLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KTtcbiAgICByZXR1cm4gdGhpcy52aXNpdEV4cHJlc3Npb24oYXN0LCBjb250ZXh0KTtcbiAgfVxuICB2aXNpdFJlYWRQcm9wRXhwcihhc3Q6IFJlYWRQcm9wRXhwciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICBhc3QucmVjZWl2ZXIudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpO1xuICAgIHJldHVybiB0aGlzLnZpc2l0RXhwcmVzc2lvbihhc3QsIGNvbnRleHQpO1xuICB9XG4gIHZpc2l0UmVhZEtleUV4cHIoYXN0OiBSZWFkS2V5RXhwciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICBhc3QucmVjZWl2ZXIudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpO1xuICAgIGFzdC5pbmRleC52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCk7XG4gICAgcmV0dXJuIHRoaXMudmlzaXRFeHByZXNzaW9uKGFzdCwgY29udGV4dCk7XG4gIH1cbiAgdmlzaXRMaXRlcmFsQXJyYXlFeHByKGFzdDogTGl0ZXJhbEFycmF5RXhwciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICB0aGlzLnZpc2l0QWxsRXhwcmVzc2lvbnMoYXN0LmVudHJpZXMsIGNvbnRleHQpO1xuICAgIHJldHVybiB0aGlzLnZpc2l0RXhwcmVzc2lvbihhc3QsIGNvbnRleHQpO1xuICB9XG4gIHZpc2l0TGl0ZXJhbE1hcEV4cHIoYXN0OiBMaXRlcmFsTWFwRXhwciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICBhc3QuZW50cmllcy5mb3JFYWNoKChlbnRyeSkgPT4gZW50cnkudmFsdWUudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpKTtcbiAgICByZXR1cm4gdGhpcy52aXNpdEV4cHJlc3Npb24oYXN0LCBjb250ZXh0KTtcbiAgfVxuICB2aXNpdENvbW1hRXhwcihhc3Q6IENvbW1hRXhwciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICB0aGlzLnZpc2l0QWxsRXhwcmVzc2lvbnMoYXN0LnBhcnRzLCBjb250ZXh0KTtcbiAgICByZXR1cm4gdGhpcy52aXNpdEV4cHJlc3Npb24oYXN0LCBjb250ZXh0KTtcbiAgfVxuICB2aXNpdEFsbEV4cHJlc3Npb25zKGV4cHJzOiBFeHByZXNzaW9uW10sIGNvbnRleHQ6IGFueSk6IHZvaWQge1xuICAgIGV4cHJzLmZvckVhY2goKGV4cHIpID0+IGV4cHIudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpKTtcbiAgfVxuXG4gIHZpc2l0RGVjbGFyZVZhclN0bXQoc3RtdDogRGVjbGFyZVZhclN0bXQsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgaWYgKHN0bXQudmFsdWUpIHtcbiAgICAgIHN0bXQudmFsdWUudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpO1xuICAgIH1cbiAgICBpZiAoc3RtdC50eXBlKSB7XG4gICAgICBzdG10LnR5cGUudmlzaXRUeXBlKHRoaXMsIGNvbnRleHQpO1xuICAgIH1cbiAgICByZXR1cm4gc3RtdDtcbiAgfVxuICB2aXNpdERlY2xhcmVGdW5jdGlvblN0bXQoc3RtdDogRGVjbGFyZUZ1bmN0aW9uU3RtdCwgY29udGV4dDogYW55KTogYW55IHtcbiAgICB0aGlzLnZpc2l0QWxsU3RhdGVtZW50cyhzdG10LnN0YXRlbWVudHMsIGNvbnRleHQpO1xuICAgIGlmIChzdG10LnR5cGUpIHtcbiAgICAgIHN0bXQudHlwZS52aXNpdFR5cGUodGhpcywgY29udGV4dCk7XG4gICAgfVxuICAgIHJldHVybiBzdG10O1xuICB9XG4gIHZpc2l0RXhwcmVzc2lvblN0bXQoc3RtdDogRXhwcmVzc2lvblN0YXRlbWVudCwgY29udGV4dDogYW55KTogYW55IHtcbiAgICBzdG10LmV4cHIudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpO1xuICAgIHJldHVybiBzdG10O1xuICB9XG4gIHZpc2l0UmV0dXJuU3RtdChzdG10OiBSZXR1cm5TdGF0ZW1lbnQsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgc3RtdC52YWx1ZS52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCk7XG4gICAgcmV0dXJuIHN0bXQ7XG4gIH1cbiAgdmlzaXRJZlN0bXQoc3RtdDogSWZTdG10LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHN0bXQuY29uZGl0aW9uLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KTtcbiAgICB0aGlzLnZpc2l0QWxsU3RhdGVtZW50cyhzdG10LnRydWVDYXNlLCBjb250ZXh0KTtcbiAgICB0aGlzLnZpc2l0QWxsU3RhdGVtZW50cyhzdG10LmZhbHNlQ2FzZSwgY29udGV4dCk7XG4gICAgcmV0dXJuIHN0bXQ7XG4gIH1cbiAgdmlzaXRBbGxTdGF0ZW1lbnRzKHN0bXRzOiBTdGF0ZW1lbnRbXSwgY29udGV4dDogYW55KTogdm9pZCB7XG4gICAgc3RtdHMuZm9yRWFjaCgoc3RtdCkgPT4gc3RtdC52aXNpdFN0YXRlbWVudCh0aGlzLCBjb250ZXh0KSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxlYWRpbmdDb21tZW50KFxuICB0ZXh0OiBzdHJpbmcsXG4gIG11bHRpbGluZTogYm9vbGVhbiA9IGZhbHNlLFxuICB0cmFpbGluZ05ld2xpbmU6IGJvb2xlYW4gPSB0cnVlLFxuKTogTGVhZGluZ0NvbW1lbnQge1xuICByZXR1cm4gbmV3IExlYWRpbmdDb21tZW50KHRleHQsIG11bHRpbGluZSwgdHJhaWxpbmdOZXdsaW5lKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGpzRG9jQ29tbWVudCh0YWdzOiBKU0RvY1RhZ1tdID0gW10pOiBKU0RvY0NvbW1lbnQge1xuICByZXR1cm4gbmV3IEpTRG9jQ29tbWVudCh0YWdzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZhcmlhYmxlKFxuICBuYW1lOiBzdHJpbmcsXG4gIHR5cGU/OiBUeXBlIHwgbnVsbCxcbiAgc291cmNlU3Bhbj86IFBhcnNlU291cmNlU3BhbiB8IG51bGwsXG4pOiBSZWFkVmFyRXhwciB7XG4gIHJldHVybiBuZXcgUmVhZFZhckV4cHIobmFtZSwgdHlwZSwgc291cmNlU3Bhbik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbXBvcnRFeHByKFxuICBpZDogRXh0ZXJuYWxSZWZlcmVuY2UsXG4gIHR5cGVQYXJhbXM6IFR5cGVbXSB8IG51bGwgPSBudWxsLFxuICBzb3VyY2VTcGFuPzogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbCxcbik6IEV4dGVybmFsRXhwciB7XG4gIHJldHVybiBuZXcgRXh0ZXJuYWxFeHByKGlkLCBudWxsLCB0eXBlUGFyYW1zLCBzb3VyY2VTcGFuKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGltcG9ydFR5cGUoXG4gIGlkOiBFeHRlcm5hbFJlZmVyZW5jZSxcbiAgdHlwZVBhcmFtcz86IFR5cGVbXSB8IG51bGwsXG4gIHR5cGVNb2RpZmllcnM/OiBUeXBlTW9kaWZpZXIsXG4pOiBFeHByZXNzaW9uVHlwZSB8IG51bGwge1xuICByZXR1cm4gaWQgIT0gbnVsbCA/IGV4cHJlc3Npb25UeXBlKGltcG9ydEV4cHIoaWQsIHR5cGVQYXJhbXMsIG51bGwpLCB0eXBlTW9kaWZpZXJzKSA6IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBleHByZXNzaW9uVHlwZShcbiAgZXhwcjogRXhwcmVzc2lvbixcbiAgdHlwZU1vZGlmaWVycz86IFR5cGVNb2RpZmllcixcbiAgdHlwZVBhcmFtcz86IFR5cGVbXSB8IG51bGwsXG4pOiBFeHByZXNzaW9uVHlwZSB7XG4gIHJldHVybiBuZXcgRXhwcmVzc2lvblR5cGUoZXhwciwgdHlwZU1vZGlmaWVycywgdHlwZVBhcmFtcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc3BsYW50ZWRUeXBlPFQ+KHR5cGU6IFQsIHR5cGVNb2RpZmllcnM/OiBUeXBlTW9kaWZpZXIpOiBUcmFuc3BsYW50ZWRUeXBlPFQ+IHtcbiAgcmV0dXJuIG5ldyBUcmFuc3BsYW50ZWRUeXBlKHR5cGUsIHR5cGVNb2RpZmllcnMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdHlwZW9mRXhwcihleHByOiBFeHByZXNzaW9uKSB7XG4gIHJldHVybiBuZXcgVHlwZW9mRXhwcihleHByKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxpdGVyYWxBcnIoXG4gIHZhbHVlczogRXhwcmVzc2lvbltdLFxuICB0eXBlPzogVHlwZSB8IG51bGwsXG4gIHNvdXJjZVNwYW4/OiBQYXJzZVNvdXJjZVNwYW4gfCBudWxsLFxuKTogTGl0ZXJhbEFycmF5RXhwciB7XG4gIHJldHVybiBuZXcgTGl0ZXJhbEFycmF5RXhwcih2YWx1ZXMsIHR5cGUsIHNvdXJjZVNwYW4pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbGl0ZXJhbE1hcChcbiAgdmFsdWVzOiB7a2V5OiBzdHJpbmc7IHF1b3RlZDogYm9vbGVhbjsgdmFsdWU6IEV4cHJlc3Npb259W10sXG4gIHR5cGU6IE1hcFR5cGUgfCBudWxsID0gbnVsbCxcbik6IExpdGVyYWxNYXBFeHByIHtcbiAgcmV0dXJuIG5ldyBMaXRlcmFsTWFwRXhwcihcbiAgICB2YWx1ZXMubWFwKChlKSA9PiBuZXcgTGl0ZXJhbE1hcEVudHJ5KGUua2V5LCBlLnZhbHVlLCBlLnF1b3RlZCkpLFxuICAgIHR5cGUsXG4gICAgbnVsbCxcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVuYXJ5KFxuICBvcGVyYXRvcjogVW5hcnlPcGVyYXRvcixcbiAgZXhwcjogRXhwcmVzc2lvbixcbiAgdHlwZT86IFR5cGUsXG4gIHNvdXJjZVNwYW4/OiBQYXJzZVNvdXJjZVNwYW4gfCBudWxsLFxuKTogVW5hcnlPcGVyYXRvckV4cHIge1xuICByZXR1cm4gbmV3IFVuYXJ5T3BlcmF0b3JFeHByKG9wZXJhdG9yLCBleHByLCB0eXBlLCBzb3VyY2VTcGFuKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vdChleHByOiBFeHByZXNzaW9uLCBzb3VyY2VTcGFuPzogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbCk6IE5vdEV4cHIge1xuICByZXR1cm4gbmV3IE5vdEV4cHIoZXhwciwgc291cmNlU3Bhbik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmbihcbiAgcGFyYW1zOiBGblBhcmFtW10sXG4gIGJvZHk6IFN0YXRlbWVudFtdLFxuICB0eXBlPzogVHlwZSB8IG51bGwsXG4gIHNvdXJjZVNwYW4/OiBQYXJzZVNvdXJjZVNwYW4gfCBudWxsLFxuICBuYW1lPzogc3RyaW5nIHwgbnVsbCxcbik6IEZ1bmN0aW9uRXhwciB7XG4gIHJldHVybiBuZXcgRnVuY3Rpb25FeHByKHBhcmFtcywgYm9keSwgdHlwZSwgc291cmNlU3BhbiwgbmFtZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcnJvd0ZuKFxuICBwYXJhbXM6IEZuUGFyYW1bXSxcbiAgYm9keTogRXhwcmVzc2lvbiB8IFN0YXRlbWVudFtdLFxuICB0eXBlPzogVHlwZSB8IG51bGwsXG4gIHNvdXJjZVNwYW4/OiBQYXJzZVNvdXJjZVNwYW4gfCBudWxsLFxuKSB7XG4gIHJldHVybiBuZXcgQXJyb3dGdW5jdGlvbkV4cHIocGFyYW1zLCBib2R5LCB0eXBlLCBzb3VyY2VTcGFuKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlmU3RtdChcbiAgY29uZGl0aW9uOiBFeHByZXNzaW9uLFxuICB0aGVuQ2xhdXNlOiBTdGF0ZW1lbnRbXSxcbiAgZWxzZUNsYXVzZT86IFN0YXRlbWVudFtdLFxuICBzb3VyY2VTcGFuPzogUGFyc2VTb3VyY2VTcGFuLFxuICBsZWFkaW5nQ29tbWVudHM/OiBMZWFkaW5nQ29tbWVudFtdLFxuKSB7XG4gIHJldHVybiBuZXcgSWZTdG10KGNvbmRpdGlvbiwgdGhlbkNsYXVzZSwgZWxzZUNsYXVzZSwgc291cmNlU3BhbiwgbGVhZGluZ0NvbW1lbnRzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRhZ2dlZFRlbXBsYXRlKFxuICB0YWc6IEV4cHJlc3Npb24sXG4gIHRlbXBsYXRlOiBUZW1wbGF0ZUxpdGVyYWwsXG4gIHR5cGU/OiBUeXBlIHwgbnVsbCxcbiAgc291cmNlU3Bhbj86IFBhcnNlU291cmNlU3BhbiB8IG51bGwsXG4pOiBUYWdnZWRUZW1wbGF0ZUV4cHIge1xuICByZXR1cm4gbmV3IFRhZ2dlZFRlbXBsYXRlRXhwcih0YWcsIHRlbXBsYXRlLCB0eXBlLCBzb3VyY2VTcGFuKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxpdGVyYWwoXG4gIHZhbHVlOiBhbnksXG4gIHR5cGU/OiBUeXBlIHwgbnVsbCxcbiAgc291cmNlU3Bhbj86IFBhcnNlU291cmNlU3BhbiB8IG51bGwsXG4pOiBMaXRlcmFsRXhwciB7XG4gIHJldHVybiBuZXcgTGl0ZXJhbEV4cHIodmFsdWUsIHR5cGUsIHNvdXJjZVNwYW4pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbG9jYWxpemVkU3RyaW5nKFxuICBtZXRhQmxvY2s6IEkxOG5NZXRhLFxuICBtZXNzYWdlUGFydHM6IExpdGVyYWxQaWVjZVtdLFxuICBwbGFjZWhvbGRlck5hbWVzOiBQbGFjZWhvbGRlclBpZWNlW10sXG4gIGV4cHJlc3Npb25zOiBFeHByZXNzaW9uW10sXG4gIHNvdXJjZVNwYW4/OiBQYXJzZVNvdXJjZVNwYW4gfCBudWxsLFxuKTogTG9jYWxpemVkU3RyaW5nIHtcbiAgcmV0dXJuIG5ldyBMb2NhbGl6ZWRTdHJpbmcobWV0YUJsb2NrLCBtZXNzYWdlUGFydHMsIHBsYWNlaG9sZGVyTmFtZXMsIGV4cHJlc3Npb25zLCBzb3VyY2VTcGFuKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzTnVsbChleHA6IEV4cHJlc3Npb24pOiBib29sZWFuIHtcbiAgcmV0dXJuIGV4cCBpbnN0YW5jZW9mIExpdGVyYWxFeHByICYmIGV4cC52YWx1ZSA9PT0gbnVsbDtcbn1cblxuLy8gVGhlIGxpc3Qgb2YgSlNEb2MgdGFncyB0aGF0IHdlIGN1cnJlbnRseSBzdXBwb3J0LiBFeHRlbmQgaXQgaWYgbmVlZGVkLlxuZXhwb3J0IGNvbnN0IGVudW0gSlNEb2NUYWdOYW1lIHtcbiAgRGVzYyA9ICdkZXNjJyxcbiAgSWQgPSAnaWQnLFxuICBNZWFuaW5nID0gJ21lYW5pbmcnLFxuICBTdXBwcmVzcyA9ICdzdXBwcmVzcycsXG59XG5cbi8qXG4gKiBUeXBlU2NyaXB0IGhhcyBhbiBBUEkgZm9yIEpTRG9jIGFscmVhZHksIGJ1dCBpdCdzIG5vdCBleHBvc2VkLlxuICogaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy83MzkzXG4gKiBGb3Igbm93IHdlIGNyZWF0ZSB0eXBlcyB0aGF0IGFyZSBzaW1pbGFyIHRvIHRoZWlycyBzbyB0aGF0IG1pZ3JhdGluZ1xuICogdG8gdGhlaXIgQVBJIHdpbGwgYmUgZWFzaWVyLiBTZWUgZS5nLiBgdHMuSlNEb2NUYWdgIGFuZCBgdHMuSlNEb2NDb21tZW50YC5cbiAqL1xuZXhwb3J0IHR5cGUgSlNEb2NUYWcgPVxuICB8IHtcbiAgICAgIC8vIGB0YWdOYW1lYCBpcyBlLmcuIFwicGFyYW1cIiBpbiBhbiBgQHBhcmFtYCBkZWNsYXJhdGlvblxuICAgICAgdGFnTmFtZTogSlNEb2NUYWdOYW1lIHwgc3RyaW5nO1xuICAgICAgLy8gQW55IHJlbWFpbmluZyB0ZXh0IG9uIHRoZSB0YWcsIGUuZy4gdGhlIGRlc2NyaXB0aW9uXG4gICAgICB0ZXh0Pzogc3RyaW5nO1xuICAgIH1cbiAgfCB7XG4gICAgICAvLyBubyBgdGFnTmFtZWAgZm9yIHBsYWluIHRleHQgZG9jdW1lbnRhdGlvbiB0aGF0IG9jY3VycyBiZWZvcmUgYW55IGBAcGFyYW1gIGxpbmVzXG4gICAgICB0YWdOYW1lPzogdW5kZWZpbmVkO1xuICAgICAgdGV4dDogc3RyaW5nO1xuICAgIH07XG5cbi8qXG4gKiBTZXJpYWxpemVzIGEgYFRhZ2AgaW50byBhIHN0cmluZy5cbiAqIFJldHVybnMgYSBzdHJpbmcgbGlrZSBcIiBAZm9vIHtiYXJ9IGJhelwiIChub3RlIHRoZSBsZWFkaW5nIHdoaXRlc3BhY2UgYmVmb3JlIGBAZm9vYCkuXG4gKi9cbmZ1bmN0aW9uIHRhZ1RvU3RyaW5nKHRhZzogSlNEb2NUYWcpOiBzdHJpbmcge1xuICBsZXQgb3V0ID0gJyc7XG4gIGlmICh0YWcudGFnTmFtZSkge1xuICAgIG91dCArPSBgIEAke3RhZy50YWdOYW1lfWA7XG4gIH1cbiAgaWYgKHRhZy50ZXh0KSB7XG4gICAgaWYgKHRhZy50ZXh0Lm1hdGNoKC9cXC9cXCp8XFwqXFwvLykpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSlNEb2MgdGV4dCBjYW5ub3QgY29udGFpbiBcIi8qXCIgYW5kIFwiKi9cIicpO1xuICAgIH1cbiAgICBvdXQgKz0gJyAnICsgdGFnLnRleHQucmVwbGFjZSgvQC9nLCAnXFxcXEAnKTtcbiAgfVxuICByZXR1cm4gb3V0O1xufVxuXG5mdW5jdGlvbiBzZXJpYWxpemVUYWdzKHRhZ3M6IEpTRG9jVGFnW10pOiBzdHJpbmcge1xuICBpZiAodGFncy5sZW5ndGggPT09IDApIHJldHVybiAnJztcblxuICBpZiAodGFncy5sZW5ndGggPT09IDEgJiYgdGFnc1swXS50YWdOYW1lICYmICF0YWdzWzBdLnRleHQpIHtcbiAgICAvLyBUaGUgSlNET0MgY29tbWVudCBpcyBhIHNpbmdsZSBzaW1wbGUgdGFnOiBlLmcgYC8qKiBAdGFnbmFtZSAqL2AuXG4gICAgcmV0dXJuIGAqJHt0YWdUb1N0cmluZyh0YWdzWzBdKX0gYDtcbiAgfVxuXG4gIGxldCBvdXQgPSAnKlxcbic7XG4gIGZvciAoY29uc3QgdGFnIG9mIHRhZ3MpIHtcbiAgICBvdXQgKz0gJyAqJztcbiAgICAvLyBJZiB0aGUgdGFnVG9TdHJpbmcgaXMgbXVsdGktbGluZSwgaW5zZXJ0IFwiICogXCIgcHJlZml4ZXMgb24gbGluZXMuXG4gICAgb3V0ICs9IHRhZ1RvU3RyaW5nKHRhZykucmVwbGFjZSgvXFxuL2csICdcXG4gKiAnKTtcbiAgICBvdXQgKz0gJ1xcbic7XG4gIH1cbiAgb3V0ICs9ICcgJztcbiAgcmV0dXJuIG91dDtcbn1cbiJdfQ==