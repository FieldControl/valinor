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
        define("@angular/compiler/src/expression_parser/ast", ["require", "exports", "tslib"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BoundElementProperty = exports.ParsedVariable = exports.ParsedEvent = exports.ParsedPropertyType = exports.ParsedProperty = exports.AstMemoryEfficientTransformer = exports.AstTransformer = exports.RecursiveAstVisitor = exports.ExpressionBinding = exports.VariableBinding = exports.ASTWithSource = exports.AbsoluteSourceSpan = exports.FunctionCall = exports.SafeMethodCall = exports.MethodCall = exports.NonNullAssert = exports.PrefixNot = exports.Unary = exports.Binary = exports.Interpolation = exports.LiteralMap = exports.LiteralArray = exports.LiteralPrimitive = exports.BindingPipe = exports.KeyedWrite = exports.KeyedRead = exports.SafePropertyRead = exports.PropertyWrite = exports.PropertyRead = exports.Conditional = exports.Chain = exports.ThisReceiver = exports.ImplicitReceiver = exports.EmptyExpr = exports.Quote = exports.ASTWithName = exports.AST = exports.ParseSpan = exports.ParserError = void 0;
    var tslib_1 = require("tslib");
    var ParserError = /** @class */ (function () {
        function ParserError(message, input, errLocation, ctxLocation) {
            this.input = input;
            this.errLocation = errLocation;
            this.ctxLocation = ctxLocation;
            this.message = "Parser Error: " + message + " " + errLocation + " [" + input + "] in " + ctxLocation;
        }
        return ParserError;
    }());
    exports.ParserError = ParserError;
    var ParseSpan = /** @class */ (function () {
        function ParseSpan(start, end) {
            this.start = start;
            this.end = end;
        }
        ParseSpan.prototype.toAbsolute = function (absoluteOffset) {
            return new AbsoluteSourceSpan(absoluteOffset + this.start, absoluteOffset + this.end);
        };
        return ParseSpan;
    }());
    exports.ParseSpan = ParseSpan;
    var AST = /** @class */ (function () {
        function AST(span, 
        /**
         * Absolute location of the expression AST in a source code file.
         */
        sourceSpan) {
            this.span = span;
            this.sourceSpan = sourceSpan;
        }
        AST.prototype.visit = function (visitor, context) {
            if (context === void 0) { context = null; }
            return null;
        };
        AST.prototype.toString = function () {
            return 'AST';
        };
        return AST;
    }());
    exports.AST = AST;
    var ASTWithName = /** @class */ (function (_super) {
        tslib_1.__extends(ASTWithName, _super);
        function ASTWithName(span, sourceSpan, nameSpan) {
            var _this = _super.call(this, span, sourceSpan) || this;
            _this.nameSpan = nameSpan;
            return _this;
        }
        return ASTWithName;
    }(AST));
    exports.ASTWithName = ASTWithName;
    /**
     * Represents a quoted expression of the form:
     *
     * quote = prefix `:` uninterpretedExpression
     * prefix = identifier
     * uninterpretedExpression = arbitrary string
     *
     * A quoted expression is meant to be pre-processed by an AST transformer that
     * converts it into another AST that no longer contains quoted expressions.
     * It is meant to allow third-party developers to extend Angular template
     * expression language. The `uninterpretedExpression` part of the quote is
     * therefore not interpreted by the Angular's own expression parser.
     */
    var Quote = /** @class */ (function (_super) {
        tslib_1.__extends(Quote, _super);
        function Quote(span, sourceSpan, prefix, uninterpretedExpression, location) {
            var _this = _super.call(this, span, sourceSpan) || this;
            _this.prefix = prefix;
            _this.uninterpretedExpression = uninterpretedExpression;
            _this.location = location;
            return _this;
        }
        Quote.prototype.visit = function (visitor, context) {
            if (context === void 0) { context = null; }
            return visitor.visitQuote(this, context);
        };
        Quote.prototype.toString = function () {
            return 'Quote';
        };
        return Quote;
    }(AST));
    exports.Quote = Quote;
    var EmptyExpr = /** @class */ (function (_super) {
        tslib_1.__extends(EmptyExpr, _super);
        function EmptyExpr() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        EmptyExpr.prototype.visit = function (visitor, context) {
            if (context === void 0) { context = null; }
            // do nothing
        };
        return EmptyExpr;
    }(AST));
    exports.EmptyExpr = EmptyExpr;
    var ImplicitReceiver = /** @class */ (function (_super) {
        tslib_1.__extends(ImplicitReceiver, _super);
        function ImplicitReceiver() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ImplicitReceiver.prototype.visit = function (visitor, context) {
            if (context === void 0) { context = null; }
            return visitor.visitImplicitReceiver(this, context);
        };
        return ImplicitReceiver;
    }(AST));
    exports.ImplicitReceiver = ImplicitReceiver;
    /**
     * Receiver when something is accessed through `this` (e.g. `this.foo`). Note that this class
     * inherits from `ImplicitReceiver`, because accessing something through `this` is treated the
     * same as accessing it implicitly inside of an Angular template (e.g. `[attr.title]="this.title"`
     * is the same as `[attr.title]="title"`.). Inheriting allows for the `this` accesses to be treated
     * the same as implicit ones, except for a couple of exceptions like `$event` and `$any`.
     * TODO: we should find a way for this class not to extend from `ImplicitReceiver` in the future.
     */
    var ThisReceiver = /** @class */ (function (_super) {
        tslib_1.__extends(ThisReceiver, _super);
        function ThisReceiver() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ThisReceiver.prototype.visit = function (visitor, context) {
            var _a;
            if (context === void 0) { context = null; }
            return (_a = visitor.visitThisReceiver) === null || _a === void 0 ? void 0 : _a.call(visitor, this, context);
        };
        return ThisReceiver;
    }(ImplicitReceiver));
    exports.ThisReceiver = ThisReceiver;
    /**
     * Multiple expressions separated by a semicolon.
     */
    var Chain = /** @class */ (function (_super) {
        tslib_1.__extends(Chain, _super);
        function Chain(span, sourceSpan, expressions) {
            var _this = _super.call(this, span, sourceSpan) || this;
            _this.expressions = expressions;
            return _this;
        }
        Chain.prototype.visit = function (visitor, context) {
            if (context === void 0) { context = null; }
            return visitor.visitChain(this, context);
        };
        return Chain;
    }(AST));
    exports.Chain = Chain;
    var Conditional = /** @class */ (function (_super) {
        tslib_1.__extends(Conditional, _super);
        function Conditional(span, sourceSpan, condition, trueExp, falseExp) {
            var _this = _super.call(this, span, sourceSpan) || this;
            _this.condition = condition;
            _this.trueExp = trueExp;
            _this.falseExp = falseExp;
            return _this;
        }
        Conditional.prototype.visit = function (visitor, context) {
            if (context === void 0) { context = null; }
            return visitor.visitConditional(this, context);
        };
        return Conditional;
    }(AST));
    exports.Conditional = Conditional;
    var PropertyRead = /** @class */ (function (_super) {
        tslib_1.__extends(PropertyRead, _super);
        function PropertyRead(span, sourceSpan, nameSpan, receiver, name) {
            var _this = _super.call(this, span, sourceSpan, nameSpan) || this;
            _this.receiver = receiver;
            _this.name = name;
            return _this;
        }
        PropertyRead.prototype.visit = function (visitor, context) {
            if (context === void 0) { context = null; }
            return visitor.visitPropertyRead(this, context);
        };
        return PropertyRead;
    }(ASTWithName));
    exports.PropertyRead = PropertyRead;
    var PropertyWrite = /** @class */ (function (_super) {
        tslib_1.__extends(PropertyWrite, _super);
        function PropertyWrite(span, sourceSpan, nameSpan, receiver, name, value) {
            var _this = _super.call(this, span, sourceSpan, nameSpan) || this;
            _this.receiver = receiver;
            _this.name = name;
            _this.value = value;
            return _this;
        }
        PropertyWrite.prototype.visit = function (visitor, context) {
            if (context === void 0) { context = null; }
            return visitor.visitPropertyWrite(this, context);
        };
        return PropertyWrite;
    }(ASTWithName));
    exports.PropertyWrite = PropertyWrite;
    var SafePropertyRead = /** @class */ (function (_super) {
        tslib_1.__extends(SafePropertyRead, _super);
        function SafePropertyRead(span, sourceSpan, nameSpan, receiver, name) {
            var _this = _super.call(this, span, sourceSpan, nameSpan) || this;
            _this.receiver = receiver;
            _this.name = name;
            return _this;
        }
        SafePropertyRead.prototype.visit = function (visitor, context) {
            if (context === void 0) { context = null; }
            return visitor.visitSafePropertyRead(this, context);
        };
        return SafePropertyRead;
    }(ASTWithName));
    exports.SafePropertyRead = SafePropertyRead;
    var KeyedRead = /** @class */ (function (_super) {
        tslib_1.__extends(KeyedRead, _super);
        function KeyedRead(span, sourceSpan, obj, key) {
            var _this = _super.call(this, span, sourceSpan) || this;
            _this.obj = obj;
            _this.key = key;
            return _this;
        }
        KeyedRead.prototype.visit = function (visitor, context) {
            if (context === void 0) { context = null; }
            return visitor.visitKeyedRead(this, context);
        };
        return KeyedRead;
    }(AST));
    exports.KeyedRead = KeyedRead;
    var KeyedWrite = /** @class */ (function (_super) {
        tslib_1.__extends(KeyedWrite, _super);
        function KeyedWrite(span, sourceSpan, obj, key, value) {
            var _this = _super.call(this, span, sourceSpan) || this;
            _this.obj = obj;
            _this.key = key;
            _this.value = value;
            return _this;
        }
        KeyedWrite.prototype.visit = function (visitor, context) {
            if (context === void 0) { context = null; }
            return visitor.visitKeyedWrite(this, context);
        };
        return KeyedWrite;
    }(AST));
    exports.KeyedWrite = KeyedWrite;
    var BindingPipe = /** @class */ (function (_super) {
        tslib_1.__extends(BindingPipe, _super);
        function BindingPipe(span, sourceSpan, exp, name, args, nameSpan) {
            var _this = _super.call(this, span, sourceSpan, nameSpan) || this;
            _this.exp = exp;
            _this.name = name;
            _this.args = args;
            return _this;
        }
        BindingPipe.prototype.visit = function (visitor, context) {
            if (context === void 0) { context = null; }
            return visitor.visitPipe(this, context);
        };
        return BindingPipe;
    }(ASTWithName));
    exports.BindingPipe = BindingPipe;
    var LiteralPrimitive = /** @class */ (function (_super) {
        tslib_1.__extends(LiteralPrimitive, _super);
        function LiteralPrimitive(span, sourceSpan, value) {
            var _this = _super.call(this, span, sourceSpan) || this;
            _this.value = value;
            return _this;
        }
        LiteralPrimitive.prototype.visit = function (visitor, context) {
            if (context === void 0) { context = null; }
            return visitor.visitLiteralPrimitive(this, context);
        };
        return LiteralPrimitive;
    }(AST));
    exports.LiteralPrimitive = LiteralPrimitive;
    var LiteralArray = /** @class */ (function (_super) {
        tslib_1.__extends(LiteralArray, _super);
        function LiteralArray(span, sourceSpan, expressions) {
            var _this = _super.call(this, span, sourceSpan) || this;
            _this.expressions = expressions;
            return _this;
        }
        LiteralArray.prototype.visit = function (visitor, context) {
            if (context === void 0) { context = null; }
            return visitor.visitLiteralArray(this, context);
        };
        return LiteralArray;
    }(AST));
    exports.LiteralArray = LiteralArray;
    var LiteralMap = /** @class */ (function (_super) {
        tslib_1.__extends(LiteralMap, _super);
        function LiteralMap(span, sourceSpan, keys, values) {
            var _this = _super.call(this, span, sourceSpan) || this;
            _this.keys = keys;
            _this.values = values;
            return _this;
        }
        LiteralMap.prototype.visit = function (visitor, context) {
            if (context === void 0) { context = null; }
            return visitor.visitLiteralMap(this, context);
        };
        return LiteralMap;
    }(AST));
    exports.LiteralMap = LiteralMap;
    var Interpolation = /** @class */ (function (_super) {
        tslib_1.__extends(Interpolation, _super);
        function Interpolation(span, sourceSpan, strings, expressions) {
            var _this = _super.call(this, span, sourceSpan) || this;
            _this.strings = strings;
            _this.expressions = expressions;
            return _this;
        }
        Interpolation.prototype.visit = function (visitor, context) {
            if (context === void 0) { context = null; }
            return visitor.visitInterpolation(this, context);
        };
        return Interpolation;
    }(AST));
    exports.Interpolation = Interpolation;
    var Binary = /** @class */ (function (_super) {
        tslib_1.__extends(Binary, _super);
        function Binary(span, sourceSpan, operation, left, right) {
            var _this = _super.call(this, span, sourceSpan) || this;
            _this.operation = operation;
            _this.left = left;
            _this.right = right;
            return _this;
        }
        Binary.prototype.visit = function (visitor, context) {
            if (context === void 0) { context = null; }
            return visitor.visitBinary(this, context);
        };
        return Binary;
    }(AST));
    exports.Binary = Binary;
    /**
     * For backwards compatibility reasons, `Unary` inherits from `Binary` and mimics the binary AST
     * node that was originally used. This inheritance relation can be deleted in some future major,
     * after consumers have been given a chance to fully support Unary.
     */
    var Unary = /** @class */ (function (_super) {
        tslib_1.__extends(Unary, _super);
        /**
         * During the deprecation period this constructor is private, to avoid consumers from creating
         * a `Unary` with the fallback properties for `Binary`.
         */
        function Unary(span, sourceSpan, operator, expr, binaryOp, binaryLeft, binaryRight) {
            var _this = _super.call(this, span, sourceSpan, binaryOp, binaryLeft, binaryRight) || this;
            _this.operator = operator;
            _this.expr = expr;
            return _this;
        }
        /**
         * Creates a unary minus expression "-x", represented as `Binary` using "0 - x".
         */
        Unary.createMinus = function (span, sourceSpan, expr) {
            return new Unary(span, sourceSpan, '-', expr, '-', new LiteralPrimitive(span, sourceSpan, 0), expr);
        };
        /**
         * Creates a unary plus expression "+x", represented as `Binary` using "x - 0".
         */
        Unary.createPlus = function (span, sourceSpan, expr) {
            return new Unary(span, sourceSpan, '+', expr, '-', expr, new LiteralPrimitive(span, sourceSpan, 0));
        };
        Unary.prototype.visit = function (visitor, context) {
            if (context === void 0) { context = null; }
            if (visitor.visitUnary !== undefined) {
                return visitor.visitUnary(this, context);
            }
            return visitor.visitBinary(this, context);
        };
        return Unary;
    }(Binary));
    exports.Unary = Unary;
    var PrefixNot = /** @class */ (function (_super) {
        tslib_1.__extends(PrefixNot, _super);
        function PrefixNot(span, sourceSpan, expression) {
            var _this = _super.call(this, span, sourceSpan) || this;
            _this.expression = expression;
            return _this;
        }
        PrefixNot.prototype.visit = function (visitor, context) {
            if (context === void 0) { context = null; }
            return visitor.visitPrefixNot(this, context);
        };
        return PrefixNot;
    }(AST));
    exports.PrefixNot = PrefixNot;
    var NonNullAssert = /** @class */ (function (_super) {
        tslib_1.__extends(NonNullAssert, _super);
        function NonNullAssert(span, sourceSpan, expression) {
            var _this = _super.call(this, span, sourceSpan) || this;
            _this.expression = expression;
            return _this;
        }
        NonNullAssert.prototype.visit = function (visitor, context) {
            if (context === void 0) { context = null; }
            return visitor.visitNonNullAssert(this, context);
        };
        return NonNullAssert;
    }(AST));
    exports.NonNullAssert = NonNullAssert;
    var MethodCall = /** @class */ (function (_super) {
        tslib_1.__extends(MethodCall, _super);
        function MethodCall(span, sourceSpan, nameSpan, receiver, name, args, argumentSpan) {
            var _this = _super.call(this, span, sourceSpan, nameSpan) || this;
            _this.receiver = receiver;
            _this.name = name;
            _this.args = args;
            _this.argumentSpan = argumentSpan;
            return _this;
        }
        MethodCall.prototype.visit = function (visitor, context) {
            if (context === void 0) { context = null; }
            return visitor.visitMethodCall(this, context);
        };
        return MethodCall;
    }(ASTWithName));
    exports.MethodCall = MethodCall;
    var SafeMethodCall = /** @class */ (function (_super) {
        tslib_1.__extends(SafeMethodCall, _super);
        function SafeMethodCall(span, sourceSpan, nameSpan, receiver, name, args, argumentSpan) {
            var _this = _super.call(this, span, sourceSpan, nameSpan) || this;
            _this.receiver = receiver;
            _this.name = name;
            _this.args = args;
            _this.argumentSpan = argumentSpan;
            return _this;
        }
        SafeMethodCall.prototype.visit = function (visitor, context) {
            if (context === void 0) { context = null; }
            return visitor.visitSafeMethodCall(this, context);
        };
        return SafeMethodCall;
    }(ASTWithName));
    exports.SafeMethodCall = SafeMethodCall;
    var FunctionCall = /** @class */ (function (_super) {
        tslib_1.__extends(FunctionCall, _super);
        function FunctionCall(span, sourceSpan, target, args) {
            var _this = _super.call(this, span, sourceSpan) || this;
            _this.target = target;
            _this.args = args;
            return _this;
        }
        FunctionCall.prototype.visit = function (visitor, context) {
            if (context === void 0) { context = null; }
            return visitor.visitFunctionCall(this, context);
        };
        return FunctionCall;
    }(AST));
    exports.FunctionCall = FunctionCall;
    /**
     * Records the absolute position of a text span in a source file, where `start` and `end` are the
     * starting and ending byte offsets, respectively, of the text span in a source file.
     */
    var AbsoluteSourceSpan = /** @class */ (function () {
        function AbsoluteSourceSpan(start, end) {
            this.start = start;
            this.end = end;
        }
        return AbsoluteSourceSpan;
    }());
    exports.AbsoluteSourceSpan = AbsoluteSourceSpan;
    var ASTWithSource = /** @class */ (function (_super) {
        tslib_1.__extends(ASTWithSource, _super);
        function ASTWithSource(ast, source, location, absoluteOffset, errors) {
            var _this = _super.call(this, new ParseSpan(0, source === null ? 0 : source.length), new AbsoluteSourceSpan(absoluteOffset, source === null ? absoluteOffset : absoluteOffset + source.length)) || this;
            _this.ast = ast;
            _this.source = source;
            _this.location = location;
            _this.errors = errors;
            return _this;
        }
        ASTWithSource.prototype.visit = function (visitor, context) {
            if (context === void 0) { context = null; }
            if (visitor.visitASTWithSource) {
                return visitor.visitASTWithSource(this, context);
            }
            return this.ast.visit(visitor, context);
        };
        ASTWithSource.prototype.toString = function () {
            return this.source + " in " + this.location;
        };
        return ASTWithSource;
    }(AST));
    exports.ASTWithSource = ASTWithSource;
    var VariableBinding = /** @class */ (function () {
        /**
         * @param sourceSpan entire span of the binding.
         * @param key name of the LHS along with its span.
         * @param value optional value for the RHS along with its span.
         */
        function VariableBinding(sourceSpan, key, value) {
            this.sourceSpan = sourceSpan;
            this.key = key;
            this.value = value;
        }
        return VariableBinding;
    }());
    exports.VariableBinding = VariableBinding;
    var ExpressionBinding = /** @class */ (function () {
        /**
         * @param sourceSpan entire span of the binding.
         * @param key binding name, like ngForOf, ngForTrackBy, ngIf, along with its
         * span. Note that the length of the span may not be the same as
         * `key.source.length`. For example,
         * 1. key.source = ngFor, key.span is for "ngFor"
         * 2. key.source = ngForOf, key.span is for "of"
         * 3. key.source = ngForTrackBy, key.span is for "trackBy"
         * @param value optional expression for the RHS.
         */
        function ExpressionBinding(sourceSpan, key, value) {
            this.sourceSpan = sourceSpan;
            this.key = key;
            this.value = value;
        }
        return ExpressionBinding;
    }());
    exports.ExpressionBinding = ExpressionBinding;
    var RecursiveAstVisitor = /** @class */ (function () {
        function RecursiveAstVisitor() {
        }
        RecursiveAstVisitor.prototype.visit = function (ast, context) {
            // The default implementation just visits every node.
            // Classes that extend RecursiveAstVisitor should override this function
            // to selectively visit the specified node.
            ast.visit(this, context);
        };
        RecursiveAstVisitor.prototype.visitUnary = function (ast, context) {
            this.visit(ast.expr, context);
        };
        RecursiveAstVisitor.prototype.visitBinary = function (ast, context) {
            this.visit(ast.left, context);
            this.visit(ast.right, context);
        };
        RecursiveAstVisitor.prototype.visitChain = function (ast, context) {
            this.visitAll(ast.expressions, context);
        };
        RecursiveAstVisitor.prototype.visitConditional = function (ast, context) {
            this.visit(ast.condition, context);
            this.visit(ast.trueExp, context);
            this.visit(ast.falseExp, context);
        };
        RecursiveAstVisitor.prototype.visitPipe = function (ast, context) {
            this.visit(ast.exp, context);
            this.visitAll(ast.args, context);
        };
        RecursiveAstVisitor.prototype.visitFunctionCall = function (ast, context) {
            if (ast.target) {
                this.visit(ast.target, context);
            }
            this.visitAll(ast.args, context);
        };
        RecursiveAstVisitor.prototype.visitImplicitReceiver = function (ast, context) { };
        RecursiveAstVisitor.prototype.visitThisReceiver = function (ast, context) { };
        RecursiveAstVisitor.prototype.visitInterpolation = function (ast, context) {
            this.visitAll(ast.expressions, context);
        };
        RecursiveAstVisitor.prototype.visitKeyedRead = function (ast, context) {
            this.visit(ast.obj, context);
            this.visit(ast.key, context);
        };
        RecursiveAstVisitor.prototype.visitKeyedWrite = function (ast, context) {
            this.visit(ast.obj, context);
            this.visit(ast.key, context);
            this.visit(ast.value, context);
        };
        RecursiveAstVisitor.prototype.visitLiteralArray = function (ast, context) {
            this.visitAll(ast.expressions, context);
        };
        RecursiveAstVisitor.prototype.visitLiteralMap = function (ast, context) {
            this.visitAll(ast.values, context);
        };
        RecursiveAstVisitor.prototype.visitLiteralPrimitive = function (ast, context) { };
        RecursiveAstVisitor.prototype.visitMethodCall = function (ast, context) {
            this.visit(ast.receiver, context);
            this.visitAll(ast.args, context);
        };
        RecursiveAstVisitor.prototype.visitPrefixNot = function (ast, context) {
            this.visit(ast.expression, context);
        };
        RecursiveAstVisitor.prototype.visitNonNullAssert = function (ast, context) {
            this.visit(ast.expression, context);
        };
        RecursiveAstVisitor.prototype.visitPropertyRead = function (ast, context) {
            this.visit(ast.receiver, context);
        };
        RecursiveAstVisitor.prototype.visitPropertyWrite = function (ast, context) {
            this.visit(ast.receiver, context);
            this.visit(ast.value, context);
        };
        RecursiveAstVisitor.prototype.visitSafePropertyRead = function (ast, context) {
            this.visit(ast.receiver, context);
        };
        RecursiveAstVisitor.prototype.visitSafeMethodCall = function (ast, context) {
            this.visit(ast.receiver, context);
            this.visitAll(ast.args, context);
        };
        RecursiveAstVisitor.prototype.visitQuote = function (ast, context) { };
        // This is not part of the AstVisitor interface, just a helper method
        RecursiveAstVisitor.prototype.visitAll = function (asts, context) {
            var e_1, _a;
            try {
                for (var asts_1 = tslib_1.__values(asts), asts_1_1 = asts_1.next(); !asts_1_1.done; asts_1_1 = asts_1.next()) {
                    var ast = asts_1_1.value;
                    this.visit(ast, context);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (asts_1_1 && !asts_1_1.done && (_a = asts_1.return)) _a.call(asts_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        };
        return RecursiveAstVisitor;
    }());
    exports.RecursiveAstVisitor = RecursiveAstVisitor;
    var AstTransformer = /** @class */ (function () {
        function AstTransformer() {
        }
        AstTransformer.prototype.visitImplicitReceiver = function (ast, context) {
            return ast;
        };
        AstTransformer.prototype.visitThisReceiver = function (ast, context) {
            return ast;
        };
        AstTransformer.prototype.visitInterpolation = function (ast, context) {
            return new Interpolation(ast.span, ast.sourceSpan, ast.strings, this.visitAll(ast.expressions));
        };
        AstTransformer.prototype.visitLiteralPrimitive = function (ast, context) {
            return new LiteralPrimitive(ast.span, ast.sourceSpan, ast.value);
        };
        AstTransformer.prototype.visitPropertyRead = function (ast, context) {
            return new PropertyRead(ast.span, ast.sourceSpan, ast.nameSpan, ast.receiver.visit(this), ast.name);
        };
        AstTransformer.prototype.visitPropertyWrite = function (ast, context) {
            return new PropertyWrite(ast.span, ast.sourceSpan, ast.nameSpan, ast.receiver.visit(this), ast.name, ast.value.visit(this));
        };
        AstTransformer.prototype.visitSafePropertyRead = function (ast, context) {
            return new SafePropertyRead(ast.span, ast.sourceSpan, ast.nameSpan, ast.receiver.visit(this), ast.name);
        };
        AstTransformer.prototype.visitMethodCall = function (ast, context) {
            return new MethodCall(ast.span, ast.sourceSpan, ast.nameSpan, ast.receiver.visit(this), ast.name, this.visitAll(ast.args), ast.argumentSpan);
        };
        AstTransformer.prototype.visitSafeMethodCall = function (ast, context) {
            return new SafeMethodCall(ast.span, ast.sourceSpan, ast.nameSpan, ast.receiver.visit(this), ast.name, this.visitAll(ast.args), ast.argumentSpan);
        };
        AstTransformer.prototype.visitFunctionCall = function (ast, context) {
            return new FunctionCall(ast.span, ast.sourceSpan, ast.target.visit(this), this.visitAll(ast.args));
        };
        AstTransformer.prototype.visitLiteralArray = function (ast, context) {
            return new LiteralArray(ast.span, ast.sourceSpan, this.visitAll(ast.expressions));
        };
        AstTransformer.prototype.visitLiteralMap = function (ast, context) {
            return new LiteralMap(ast.span, ast.sourceSpan, ast.keys, this.visitAll(ast.values));
        };
        AstTransformer.prototype.visitUnary = function (ast, context) {
            switch (ast.operator) {
                case '+':
                    return Unary.createPlus(ast.span, ast.sourceSpan, ast.expr.visit(this));
                case '-':
                    return Unary.createMinus(ast.span, ast.sourceSpan, ast.expr.visit(this));
                default:
                    throw new Error("Unknown unary operator " + ast.operator);
            }
        };
        AstTransformer.prototype.visitBinary = function (ast, context) {
            return new Binary(ast.span, ast.sourceSpan, ast.operation, ast.left.visit(this), ast.right.visit(this));
        };
        AstTransformer.prototype.visitPrefixNot = function (ast, context) {
            return new PrefixNot(ast.span, ast.sourceSpan, ast.expression.visit(this));
        };
        AstTransformer.prototype.visitNonNullAssert = function (ast, context) {
            return new NonNullAssert(ast.span, ast.sourceSpan, ast.expression.visit(this));
        };
        AstTransformer.prototype.visitConditional = function (ast, context) {
            return new Conditional(ast.span, ast.sourceSpan, ast.condition.visit(this), ast.trueExp.visit(this), ast.falseExp.visit(this));
        };
        AstTransformer.prototype.visitPipe = function (ast, context) {
            return new BindingPipe(ast.span, ast.sourceSpan, ast.exp.visit(this), ast.name, this.visitAll(ast.args), ast.nameSpan);
        };
        AstTransformer.prototype.visitKeyedRead = function (ast, context) {
            return new KeyedRead(ast.span, ast.sourceSpan, ast.obj.visit(this), ast.key.visit(this));
        };
        AstTransformer.prototype.visitKeyedWrite = function (ast, context) {
            return new KeyedWrite(ast.span, ast.sourceSpan, ast.obj.visit(this), ast.key.visit(this), ast.value.visit(this));
        };
        AstTransformer.prototype.visitAll = function (asts) {
            var res = [];
            for (var i = 0; i < asts.length; ++i) {
                res[i] = asts[i].visit(this);
            }
            return res;
        };
        AstTransformer.prototype.visitChain = function (ast, context) {
            return new Chain(ast.span, ast.sourceSpan, this.visitAll(ast.expressions));
        };
        AstTransformer.prototype.visitQuote = function (ast, context) {
            return new Quote(ast.span, ast.sourceSpan, ast.prefix, ast.uninterpretedExpression, ast.location);
        };
        return AstTransformer;
    }());
    exports.AstTransformer = AstTransformer;
    // A transformer that only creates new nodes if the transformer makes a change or
    // a change is made a child node.
    var AstMemoryEfficientTransformer = /** @class */ (function () {
        function AstMemoryEfficientTransformer() {
        }
        AstMemoryEfficientTransformer.prototype.visitImplicitReceiver = function (ast, context) {
            return ast;
        };
        AstMemoryEfficientTransformer.prototype.visitThisReceiver = function (ast, context) {
            return ast;
        };
        AstMemoryEfficientTransformer.prototype.visitInterpolation = function (ast, context) {
            var expressions = this.visitAll(ast.expressions);
            if (expressions !== ast.expressions)
                return new Interpolation(ast.span, ast.sourceSpan, ast.strings, expressions);
            return ast;
        };
        AstMemoryEfficientTransformer.prototype.visitLiteralPrimitive = function (ast, context) {
            return ast;
        };
        AstMemoryEfficientTransformer.prototype.visitPropertyRead = function (ast, context) {
            var receiver = ast.receiver.visit(this);
            if (receiver !== ast.receiver) {
                return new PropertyRead(ast.span, ast.sourceSpan, ast.nameSpan, receiver, ast.name);
            }
            return ast;
        };
        AstMemoryEfficientTransformer.prototype.visitPropertyWrite = function (ast, context) {
            var receiver = ast.receiver.visit(this);
            var value = ast.value.visit(this);
            if (receiver !== ast.receiver || value !== ast.value) {
                return new PropertyWrite(ast.span, ast.sourceSpan, ast.nameSpan, receiver, ast.name, value);
            }
            return ast;
        };
        AstMemoryEfficientTransformer.prototype.visitSafePropertyRead = function (ast, context) {
            var receiver = ast.receiver.visit(this);
            if (receiver !== ast.receiver) {
                return new SafePropertyRead(ast.span, ast.sourceSpan, ast.nameSpan, receiver, ast.name);
            }
            return ast;
        };
        AstMemoryEfficientTransformer.prototype.visitMethodCall = function (ast, context) {
            var receiver = ast.receiver.visit(this);
            var args = this.visitAll(ast.args);
            if (receiver !== ast.receiver || args !== ast.args) {
                return new MethodCall(ast.span, ast.sourceSpan, ast.nameSpan, receiver, ast.name, args, ast.argumentSpan);
            }
            return ast;
        };
        AstMemoryEfficientTransformer.prototype.visitSafeMethodCall = function (ast, context) {
            var receiver = ast.receiver.visit(this);
            var args = this.visitAll(ast.args);
            if (receiver !== ast.receiver || args !== ast.args) {
                return new SafeMethodCall(ast.span, ast.sourceSpan, ast.nameSpan, receiver, ast.name, args, ast.argumentSpan);
            }
            return ast;
        };
        AstMemoryEfficientTransformer.prototype.visitFunctionCall = function (ast, context) {
            var target = ast.target && ast.target.visit(this);
            var args = this.visitAll(ast.args);
            if (target !== ast.target || args !== ast.args) {
                return new FunctionCall(ast.span, ast.sourceSpan, target, args);
            }
            return ast;
        };
        AstMemoryEfficientTransformer.prototype.visitLiteralArray = function (ast, context) {
            var expressions = this.visitAll(ast.expressions);
            if (expressions !== ast.expressions) {
                return new LiteralArray(ast.span, ast.sourceSpan, expressions);
            }
            return ast;
        };
        AstMemoryEfficientTransformer.prototype.visitLiteralMap = function (ast, context) {
            var values = this.visitAll(ast.values);
            if (values !== ast.values) {
                return new LiteralMap(ast.span, ast.sourceSpan, ast.keys, values);
            }
            return ast;
        };
        AstMemoryEfficientTransformer.prototype.visitUnary = function (ast, context) {
            var expr = ast.expr.visit(this);
            if (expr !== ast.expr) {
                switch (ast.operator) {
                    case '+':
                        return Unary.createPlus(ast.span, ast.sourceSpan, expr);
                    case '-':
                        return Unary.createMinus(ast.span, ast.sourceSpan, expr);
                    default:
                        throw new Error("Unknown unary operator " + ast.operator);
                }
            }
            return ast;
        };
        AstMemoryEfficientTransformer.prototype.visitBinary = function (ast, context) {
            var left = ast.left.visit(this);
            var right = ast.right.visit(this);
            if (left !== ast.left || right !== ast.right) {
                return new Binary(ast.span, ast.sourceSpan, ast.operation, left, right);
            }
            return ast;
        };
        AstMemoryEfficientTransformer.prototype.visitPrefixNot = function (ast, context) {
            var expression = ast.expression.visit(this);
            if (expression !== ast.expression) {
                return new PrefixNot(ast.span, ast.sourceSpan, expression);
            }
            return ast;
        };
        AstMemoryEfficientTransformer.prototype.visitNonNullAssert = function (ast, context) {
            var expression = ast.expression.visit(this);
            if (expression !== ast.expression) {
                return new NonNullAssert(ast.span, ast.sourceSpan, expression);
            }
            return ast;
        };
        AstMemoryEfficientTransformer.prototype.visitConditional = function (ast, context) {
            var condition = ast.condition.visit(this);
            var trueExp = ast.trueExp.visit(this);
            var falseExp = ast.falseExp.visit(this);
            if (condition !== ast.condition || trueExp !== ast.trueExp || falseExp !== ast.falseExp) {
                return new Conditional(ast.span, ast.sourceSpan, condition, trueExp, falseExp);
            }
            return ast;
        };
        AstMemoryEfficientTransformer.prototype.visitPipe = function (ast, context) {
            var exp = ast.exp.visit(this);
            var args = this.visitAll(ast.args);
            if (exp !== ast.exp || args !== ast.args) {
                return new BindingPipe(ast.span, ast.sourceSpan, exp, ast.name, args, ast.nameSpan);
            }
            return ast;
        };
        AstMemoryEfficientTransformer.prototype.visitKeyedRead = function (ast, context) {
            var obj = ast.obj.visit(this);
            var key = ast.key.visit(this);
            if (obj !== ast.obj || key !== ast.key) {
                return new KeyedRead(ast.span, ast.sourceSpan, obj, key);
            }
            return ast;
        };
        AstMemoryEfficientTransformer.prototype.visitKeyedWrite = function (ast, context) {
            var obj = ast.obj.visit(this);
            var key = ast.key.visit(this);
            var value = ast.value.visit(this);
            if (obj !== ast.obj || key !== ast.key || value !== ast.value) {
                return new KeyedWrite(ast.span, ast.sourceSpan, obj, key, value);
            }
            return ast;
        };
        AstMemoryEfficientTransformer.prototype.visitAll = function (asts) {
            var res = [];
            var modified = false;
            for (var i = 0; i < asts.length; ++i) {
                var original = asts[i];
                var value = original.visit(this);
                res[i] = value;
                modified = modified || value !== original;
            }
            return modified ? res : asts;
        };
        AstMemoryEfficientTransformer.prototype.visitChain = function (ast, context) {
            var expressions = this.visitAll(ast.expressions);
            if (expressions !== ast.expressions) {
                return new Chain(ast.span, ast.sourceSpan, expressions);
            }
            return ast;
        };
        AstMemoryEfficientTransformer.prototype.visitQuote = function (ast, context) {
            return ast;
        };
        return AstMemoryEfficientTransformer;
    }());
    exports.AstMemoryEfficientTransformer = AstMemoryEfficientTransformer;
    // Bindings
    var ParsedProperty = /** @class */ (function () {
        function ParsedProperty(name, expression, type, 
        // TODO(FW-2095): `keySpan` should really be required but allows `undefined` so VE does
        // not need to be updated. Make `keySpan` required when VE is removed.
        sourceSpan, keySpan, valueSpan) {
            this.name = name;
            this.expression = expression;
            this.type = type;
            this.sourceSpan = sourceSpan;
            this.keySpan = keySpan;
            this.valueSpan = valueSpan;
            this.isLiteral = this.type === ParsedPropertyType.LITERAL_ATTR;
            this.isAnimation = this.type === ParsedPropertyType.ANIMATION;
        }
        return ParsedProperty;
    }());
    exports.ParsedProperty = ParsedProperty;
    var ParsedPropertyType;
    (function (ParsedPropertyType) {
        ParsedPropertyType[ParsedPropertyType["DEFAULT"] = 0] = "DEFAULT";
        ParsedPropertyType[ParsedPropertyType["LITERAL_ATTR"] = 1] = "LITERAL_ATTR";
        ParsedPropertyType[ParsedPropertyType["ANIMATION"] = 2] = "ANIMATION";
    })(ParsedPropertyType = exports.ParsedPropertyType || (exports.ParsedPropertyType = {}));
    var ParsedEvent = /** @class */ (function () {
        // Regular events have a target
        // Animation events have a phase
        function ParsedEvent(name, targetOrPhase, type, handler, sourceSpan, 
        // TODO(FW-2095): keySpan should be required but was made optional to avoid changing VE
        handlerSpan, keySpan) {
            this.name = name;
            this.targetOrPhase = targetOrPhase;
            this.type = type;
            this.handler = handler;
            this.sourceSpan = sourceSpan;
            this.handlerSpan = handlerSpan;
            this.keySpan = keySpan;
        }
        return ParsedEvent;
    }());
    exports.ParsedEvent = ParsedEvent;
    /**
     * ParsedVariable represents a variable declaration in a microsyntax expression.
     */
    var ParsedVariable = /** @class */ (function () {
        function ParsedVariable(name, value, sourceSpan, keySpan, valueSpan) {
            this.name = name;
            this.value = value;
            this.sourceSpan = sourceSpan;
            this.keySpan = keySpan;
            this.valueSpan = valueSpan;
        }
        return ParsedVariable;
    }());
    exports.ParsedVariable = ParsedVariable;
    var BoundElementProperty = /** @class */ (function () {
        function BoundElementProperty(name, type, securityContext, value, unit, sourceSpan, keySpan, valueSpan) {
            this.name = name;
            this.type = type;
            this.securityContext = securityContext;
            this.value = value;
            this.unit = unit;
            this.sourceSpan = sourceSpan;
            this.keySpan = keySpan;
            this.valueSpan = valueSpan;
        }
        return BoundElementProperty;
    }());
    exports.BoundElementProperty = BoundElementProperty;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL2V4cHJlc3Npb25fcGFyc2VyL2FzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBS0g7UUFFRSxxQkFDSSxPQUFlLEVBQVMsS0FBYSxFQUFTLFdBQW1CLEVBQVMsV0FBaUI7WUFBbkUsVUFBSyxHQUFMLEtBQUssQ0FBUTtZQUFTLGdCQUFXLEdBQVgsV0FBVyxDQUFRO1lBQVMsZ0JBQVcsR0FBWCxXQUFXLENBQU07WUFDN0YsSUFBSSxDQUFDLE9BQU8sR0FBRyxtQkFBaUIsT0FBTyxTQUFJLFdBQVcsVUFBSyxLQUFLLGFBQVEsV0FBYSxDQUFDO1FBQ3hGLENBQUM7UUFDSCxrQkFBQztJQUFELENBQUMsQUFORCxJQU1DO0lBTlksa0NBQVc7SUFReEI7UUFDRSxtQkFBbUIsS0FBYSxFQUFTLEdBQVc7WUFBakMsVUFBSyxHQUFMLEtBQUssQ0FBUTtZQUFTLFFBQUcsR0FBSCxHQUFHLENBQVE7UUFBRyxDQUFDO1FBQ3hELDhCQUFVLEdBQVYsVUFBVyxjQUFzQjtZQUMvQixPQUFPLElBQUksa0JBQWtCLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsY0FBYyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN4RixDQUFDO1FBQ0gsZ0JBQUM7SUFBRCxDQUFDLEFBTEQsSUFLQztJQUxZLDhCQUFTO0lBT3RCO1FBQ0UsYUFDVyxJQUFlO1FBQ3RCOztXQUVHO1FBQ0ksVUFBOEI7WUFKOUIsU0FBSSxHQUFKLElBQUksQ0FBVztZQUlmLGVBQVUsR0FBVixVQUFVLENBQW9CO1FBQUcsQ0FBQztRQUM3QyxtQkFBSyxHQUFMLFVBQU0sT0FBbUIsRUFBRSxPQUFtQjtZQUFuQix3QkFBQSxFQUFBLGNBQW1CO1lBQzVDLE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FB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LGVBQVUsR0FBVixVQUFVLENBQWlCO1lBQWtCLFlBQU8sR0FBUCxPQUFPLENBQWlCO1lBQ3JFLGNBQVMsR0FBVCxTQUFTLENBQWtCO1FBQUcsQ0FBQztRQUNyRCxxQkFBQztJQUFELENBQUMsQUFMRCxJQUtDO0lBTFksd0NBQWM7SUFvQjNCO1FBQ0UsOEJBQ1csSUFBWSxFQUFTLElBQWlCLEVBQVMsZUFBZ0MsRUFDL0UsS0FBb0IsRUFBUyxJQUFpQixFQUFTLFVBQTJCLEVBQ2hGLE9BQWtDLEVBQVMsU0FBb0M7WUFGakYsU0FBSSxHQUFKLElBQUksQ0FBUTtZQUFTLFNBQUksR0FBSixJQUFJLENBQWE7WUFBUyxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7WUFDL0UsVUFBSyxHQUFMLEtBQUssQ0FBZTtZQUFTLFNBQUksR0FBSixJQUFJLENBQWE7WUFBUyxlQUFVLEdBQVYsVUFBVSxDQUFpQjtZQUNoRixZQUFPLEdBQVAsT0FBTyxDQUEyQjtZQUFTLGNBQVMsR0FBVCxTQUFTLENBQTJCO1FBQUcsQ0FBQztRQUNsRywyQkFBQztJQUFELENBQUMsQUFMRCxJQUtDO0lBTFksb0RBQW9CIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7U2VjdXJpdHlDb250ZXh0fSBmcm9tICcuLi9jb3JlJztcbmltcG9ydCB7UGFyc2VTb3VyY2VTcGFufSBmcm9tICcuLi9wYXJzZV91dGlsJztcblxuZXhwb3J0IGNsYXNzIFBhcnNlckVycm9yIHtcbiAgcHVibGljIG1lc3NhZ2U6IHN0cmluZztcbiAgY29uc3RydWN0b3IoXG4gICAgICBtZXNzYWdlOiBzdHJpbmcsIHB1YmxpYyBpbnB1dDogc3RyaW5nLCBwdWJsaWMgZXJyTG9jYXRpb246IHN0cmluZywgcHVibGljIGN0eExvY2F0aW9uPzogYW55KSB7XG4gICAgdGhpcy5tZXNzYWdlID0gYFBhcnNlciBFcnJvcjogJHttZXNzYWdlfSAke2VyckxvY2F0aW9ufSBbJHtpbnB1dH1dIGluICR7Y3R4TG9jYXRpb259YDtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUGFyc2VTcGFuIHtcbiAgY29uc3RydWN0b3IocHVibGljIHN0YXJ0OiBudW1iZXIsIHB1YmxpYyBlbmQ6IG51bWJlcikge31cbiAgdG9BYnNvbHV0ZShhYnNvbHV0ZU9mZnNldDogbnVtYmVyKTogQWJzb2x1dGVTb3VyY2VTcGFuIHtcbiAgICByZXR1cm4gbmV3IEFic29sdXRlU291cmNlU3BhbihhYnNvbHV0ZU9mZnNldCArIHRoaXMuc3RhcnQsIGFic29sdXRlT2Zmc2V0ICsgdGhpcy5lbmQpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBBU1Qge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBzcGFuOiBQYXJzZVNwYW4sXG4gICAgICAvKipcbiAgICAgICAqIEFic29sdXRlIGxvY2F0aW9uIG9mIHRoZSBleHByZXNzaW9uIEFTVCBpbiBhIHNvdXJjZSBjb2RlIGZpbGUuXG4gICAgICAgKi9cbiAgICAgIHB1YmxpYyBzb3VyY2VTcGFuOiBBYnNvbHV0ZVNvdXJjZVNwYW4pIHt9XG4gIHZpc2l0KHZpc2l0b3I6IEFzdFZpc2l0b3IsIGNvbnRleHQ6IGFueSA9IG51bGwpOiBhbnkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICdBU1QnO1xuICB9XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBBU1RXaXRoTmFtZSBleHRlbmRzIEFTVCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgc3BhbjogUGFyc2VTcGFuLCBzb3VyY2VTcGFuOiBBYnNvbHV0ZVNvdXJjZVNwYW4sIHB1YmxpYyBuYW1lU3BhbjogQWJzb2x1dGVTb3VyY2VTcGFuKSB7XG4gICAgc3VwZXIoc3Bhbiwgc291cmNlU3Bhbik7XG4gIH1cbn1cblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgcXVvdGVkIGV4cHJlc3Npb24gb2YgdGhlIGZvcm06XG4gKlxuICogcXVvdGUgPSBwcmVmaXggYDpgIHVuaW50ZXJwcmV0ZWRFeHByZXNzaW9uXG4gKiBwcmVmaXggPSBpZGVudGlmaWVyXG4gKiB1bmludGVycHJldGVkRXhwcmVzc2lvbiA9IGFyYml0cmFyeSBzdHJpbmdcbiAqXG4gKiBBIHF1b3RlZCBleHByZXNzaW9uIGlzIG1lYW50IHRvIGJlIHByZS1wcm9jZXNzZWQgYnkgYW4gQVNUIHRyYW5zZm9ybWVyIHRoYXRcbiAqIGNvbnZlcnRzIGl0IGludG8gYW5vdGhlciBBU1QgdGhhdCBubyBsb25nZXIgY29udGFpbnMgcXVvdGVkIGV4cHJlc3Npb25zLlxuICogSXQgaXMgbWVhbnQgdG8gYWxsb3cgdGhpcmQtcGFydHkgZGV2ZWxvcGVycyB0byBleHRlbmQgQW5ndWxhciB0ZW1wbGF0ZVxuICogZXhwcmVzc2lvbiBsYW5ndWFnZS4gVGhlIGB1bmludGVycHJldGVkRXhwcmVzc2lvbmAgcGFydCBvZiB0aGUgcXVvdGUgaXNcbiAqIHRoZXJlZm9yZSBub3QgaW50ZXJwcmV0ZWQgYnkgdGhlIEFuZ3VsYXIncyBvd24gZXhwcmVzc2lvbiBwYXJzZXIuXG4gKi9cbmV4cG9ydCBjbGFzcyBRdW90ZSBleHRlbmRzIEFTVCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgc3BhbjogUGFyc2VTcGFuLCBzb3VyY2VTcGFuOiBBYnNvbHV0ZVNvdXJjZVNwYW4sIHB1YmxpYyBwcmVmaXg6IHN0cmluZyxcbiAgICAgIHB1YmxpYyB1bmludGVycHJldGVkRXhwcmVzc2lvbjogc3RyaW5nLCBwdWJsaWMgbG9jYXRpb246IGFueSkge1xuICAgIHN1cGVyKHNwYW4sIHNvdXJjZVNwYW4pO1xuICB9XG4gIHZpc2l0KHZpc2l0b3I6IEFzdFZpc2l0b3IsIGNvbnRleHQ6IGFueSA9IG51bGwpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0UXVvdGUodGhpcywgY29udGV4dCk7XG4gIH1cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gJ1F1b3RlJztcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRW1wdHlFeHByIGV4dGVuZHMgQVNUIHtcbiAgdmlzaXQodmlzaXRvcjogQXN0VmlzaXRvciwgY29udGV4dDogYW55ID0gbnVsbCkge1xuICAgIC8vIGRvIG5vdGhpbmdcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgSW1wbGljaXRSZWNlaXZlciBleHRlbmRzIEFTVCB7XG4gIHZpc2l0KHZpc2l0b3I6IEFzdFZpc2l0b3IsIGNvbnRleHQ6IGFueSA9IG51bGwpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0SW1wbGljaXRSZWNlaXZlcih0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG4vKipcbiAqIFJlY2VpdmVyIHdoZW4gc29tZXRoaW5nIGlzIGFjY2Vzc2VkIHRocm91Z2ggYHRoaXNgIChlLmcuIGB0aGlzLmZvb2ApLiBOb3RlIHRoYXQgdGhpcyBjbGFzc1xuICogaW5oZXJpdHMgZnJvbSBgSW1wbGljaXRSZWNlaXZlcmAsIGJlY2F1c2UgYWNjZXNzaW5nIHNvbWV0aGluZyB0aHJvdWdoIGB0aGlzYCBpcyB0cmVhdGVkIHRoZVxuICogc2FtZSBhcyBhY2Nlc3NpbmcgaXQgaW1wbGljaXRseSBpbnNpZGUgb2YgYW4gQW5ndWxhciB0ZW1wbGF0ZSAoZS5nLiBgW2F0dHIudGl0bGVdPVwidGhpcy50aXRsZVwiYFxuICogaXMgdGhlIHNhbWUgYXMgYFthdHRyLnRpdGxlXT1cInRpdGxlXCJgLikuIEluaGVyaXRpbmcgYWxsb3dzIGZvciB0aGUgYHRoaXNgIGFjY2Vzc2VzIHRvIGJlIHRyZWF0ZWRcbiAqIHRoZSBzYW1lIGFzIGltcGxpY2l0IG9uZXMsIGV4Y2VwdCBmb3IgYSBjb3VwbGUgb2YgZXhjZXB0aW9ucyBsaWtlIGAkZXZlbnRgIGFuZCBgJGFueWAuXG4gKiBUT0RPOiB3ZSBzaG91bGQgZmluZCBhIHdheSBmb3IgdGhpcyBjbGFzcyBub3QgdG8gZXh0ZW5kIGZyb20gYEltcGxpY2l0UmVjZWl2ZXJgIGluIHRoZSBmdXR1cmUuXG4gKi9cbmV4cG9ydCBjbGFzcyBUaGlzUmVjZWl2ZXIgZXh0ZW5kcyBJbXBsaWNpdFJlY2VpdmVyIHtcbiAgdmlzaXQodmlzaXRvcjogQXN0VmlzaXRvciwgY29udGV4dDogYW55ID0gbnVsbCk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRUaGlzUmVjZWl2ZXI/Lih0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG4vKipcbiAqIE11bHRpcGxlIGV4cHJlc3Npb25zIHNlcGFyYXRlZCBieSBhIHNlbWljb2xvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIENoYWluIGV4dGVuZHMgQVNUIHtcbiAgY29uc3RydWN0b3Ioc3BhbjogUGFyc2VTcGFuLCBzb3VyY2VTcGFuOiBBYnNvbHV0ZVNvdXJjZVNwYW4sIHB1YmxpYyBleHByZXNzaW9uczogYW55W10pIHtcbiAgICBzdXBlcihzcGFuLCBzb3VyY2VTcGFuKTtcbiAgfVxuICB2aXNpdCh2aXNpdG9yOiBBc3RWaXNpdG9yLCBjb250ZXh0OiBhbnkgPSBudWxsKTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdENoYWluKHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDb25kaXRpb25hbCBleHRlbmRzIEFTVCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgc3BhbjogUGFyc2VTcGFuLCBzb3VyY2VTcGFuOiBBYnNvbHV0ZVNvdXJjZVNwYW4sIHB1YmxpYyBjb25kaXRpb246IEFTVCwgcHVibGljIHRydWVFeHA6IEFTVCxcbiAgICAgIHB1YmxpYyBmYWxzZUV4cDogQVNUKSB7XG4gICAgc3VwZXIoc3Bhbiwgc291cmNlU3Bhbik7XG4gIH1cbiAgdmlzaXQodmlzaXRvcjogQXN0VmlzaXRvciwgY29udGV4dDogYW55ID0gbnVsbCk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRDb25kaXRpb25hbCh0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUHJvcGVydHlSZWFkIGV4dGVuZHMgQVNUV2l0aE5hbWUge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHNwYW46IFBhcnNlU3Bhbiwgc291cmNlU3BhbjogQWJzb2x1dGVTb3VyY2VTcGFuLCBuYW1lU3BhbjogQWJzb2x1dGVTb3VyY2VTcGFuLFxuICAgICAgcHVibGljIHJlY2VpdmVyOiBBU1QsIHB1YmxpYyBuYW1lOiBzdHJpbmcpIHtcbiAgICBzdXBlcihzcGFuLCBzb3VyY2VTcGFuLCBuYW1lU3Bhbik7XG4gIH1cbiAgdmlzaXQodmlzaXRvcjogQXN0VmlzaXRvciwgY29udGV4dDogYW55ID0gbnVsbCk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRQcm9wZXJ0eVJlYWQodGhpcywgY29udGV4dCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFByb3BlcnR5V3JpdGUgZXh0ZW5kcyBBU1RXaXRoTmFtZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgc3BhbjogUGFyc2VTcGFuLCBzb3VyY2VTcGFuOiBBYnNvbHV0ZVNvdXJjZVNwYW4sIG5hbWVTcGFuOiBBYnNvbHV0ZVNvdXJjZVNwYW4sXG4gICAgICBwdWJsaWMgcmVjZWl2ZXI6IEFTVCwgcHVibGljIG5hbWU6IHN0cmluZywgcHVibGljIHZhbHVlOiBBU1QpIHtcbiAgICBzdXBlcihzcGFuLCBzb3VyY2VTcGFuLCBuYW1lU3Bhbik7XG4gIH1cbiAgdmlzaXQodmlzaXRvcjogQXN0VmlzaXRvciwgY29udGV4dDogYW55ID0gbnVsbCk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRQcm9wZXJ0eVdyaXRlKHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTYWZlUHJvcGVydHlSZWFkIGV4dGVuZHMgQVNUV2l0aE5hbWUge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHNwYW46IFBhcnNlU3Bhbiwgc291cmNlU3BhbjogQWJzb2x1dGVTb3VyY2VTcGFuLCBuYW1lU3BhbjogQWJzb2x1dGVTb3VyY2VTcGFuLFxuICAgICAgcHVibGljIHJlY2VpdmVyOiBBU1QsIHB1YmxpYyBuYW1lOiBzdHJpbmcpIHtcbiAgICBzdXBlcihzcGFuLCBzb3VyY2VTcGFuLCBuYW1lU3Bhbik7XG4gIH1cbiAgdmlzaXQodmlzaXRvcjogQXN0VmlzaXRvciwgY29udGV4dDogYW55ID0gbnVsbCk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRTYWZlUHJvcGVydHlSZWFkKHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBLZXllZFJlYWQgZXh0ZW5kcyBBU1Qge1xuICBjb25zdHJ1Y3RvcihzcGFuOiBQYXJzZVNwYW4sIHNvdXJjZVNwYW46IEFic29sdXRlU291cmNlU3BhbiwgcHVibGljIG9iajogQVNULCBwdWJsaWMga2V5OiBBU1QpIHtcbiAgICBzdXBlcihzcGFuLCBzb3VyY2VTcGFuKTtcbiAgfVxuICB2aXNpdCh2aXNpdG9yOiBBc3RWaXNpdG9yLCBjb250ZXh0OiBhbnkgPSBudWxsKTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdEtleWVkUmVhZCh0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgS2V5ZWRXcml0ZSBleHRlbmRzIEFTVCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgc3BhbjogUGFyc2VTcGFuLCBzb3VyY2VTcGFuOiBBYnNvbHV0ZVNvdXJjZVNwYW4sIHB1YmxpYyBvYmo6IEFTVCwgcHVibGljIGtleTogQVNULFxuICAgICAgcHVibGljIHZhbHVlOiBBU1QpIHtcbiAgICBzdXBlcihzcGFuLCBzb3VyY2VTcGFuKTtcbiAgfVxuICB2aXNpdCh2aXNpdG9yOiBBc3RWaXNpdG9yLCBjb250ZXh0OiBhbnkgPSBudWxsKTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdEtleWVkV3JpdGUodGhpcywgY29udGV4dCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEJpbmRpbmdQaXBlIGV4dGVuZHMgQVNUV2l0aE5hbWUge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHNwYW46IFBhcnNlU3Bhbiwgc291cmNlU3BhbjogQWJzb2x1dGVTb3VyY2VTcGFuLCBwdWJsaWMgZXhwOiBBU1QsIHB1YmxpYyBuYW1lOiBzdHJpbmcsXG4gICAgICBwdWJsaWMgYXJnczogYW55W10sIG5hbWVTcGFuOiBBYnNvbHV0ZVNvdXJjZVNwYW4pIHtcbiAgICBzdXBlcihzcGFuLCBzb3VyY2VTcGFuLCBuYW1lU3Bhbik7XG4gIH1cbiAgdmlzaXQodmlzaXRvcjogQXN0VmlzaXRvciwgY29udGV4dDogYW55ID0gbnVsbCk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRQaXBlKHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBMaXRlcmFsUHJpbWl0aXZlIGV4dGVuZHMgQVNUIHtcbiAgY29uc3RydWN0b3Ioc3BhbjogUGFyc2VTcGFuLCBzb3VyY2VTcGFuOiBBYnNvbHV0ZVNvdXJjZVNwYW4sIHB1YmxpYyB2YWx1ZTogYW55KSB7XG4gICAgc3VwZXIoc3Bhbiwgc291cmNlU3Bhbik7XG4gIH1cbiAgdmlzaXQodmlzaXRvcjogQXN0VmlzaXRvciwgY29udGV4dDogYW55ID0gbnVsbCk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRMaXRlcmFsUHJpbWl0aXZlKHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBMaXRlcmFsQXJyYXkgZXh0ZW5kcyBBU1Qge1xuICBjb25zdHJ1Y3RvcihzcGFuOiBQYXJzZVNwYW4sIHNvdXJjZVNwYW46IEFic29sdXRlU291cmNlU3BhbiwgcHVibGljIGV4cHJlc3Npb25zOiBhbnlbXSkge1xuICAgIHN1cGVyKHNwYW4sIHNvdXJjZVNwYW4pO1xuICB9XG4gIHZpc2l0KHZpc2l0b3I6IEFzdFZpc2l0b3IsIGNvbnRleHQ6IGFueSA9IG51bGwpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0TGl0ZXJhbEFycmF5KHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cbmV4cG9ydCB0eXBlIExpdGVyYWxNYXBLZXkgPSB7XG4gIGtleTogc3RyaW5nOyBxdW90ZWQ6IGJvb2xlYW47XG59O1xuXG5leHBvcnQgY2xhc3MgTGl0ZXJhbE1hcCBleHRlbmRzIEFTVCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgc3BhbjogUGFyc2VTcGFuLCBzb3VyY2VTcGFuOiBBYnNvbHV0ZVNvdXJjZVNwYW4sIHB1YmxpYyBrZXlzOiBMaXRlcmFsTWFwS2V5W10sXG4gICAgICBwdWJsaWMgdmFsdWVzOiBhbnlbXSkge1xuICAgIHN1cGVyKHNwYW4sIHNvdXJjZVNwYW4pO1xuICB9XG4gIHZpc2l0KHZpc2l0b3I6IEFzdFZpc2l0b3IsIGNvbnRleHQ6IGFueSA9IG51bGwpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0TGl0ZXJhbE1hcCh0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgSW50ZXJwb2xhdGlvbiBleHRlbmRzIEFTVCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgc3BhbjogUGFyc2VTcGFuLCBzb3VyY2VTcGFuOiBBYnNvbHV0ZVNvdXJjZVNwYW4sIHB1YmxpYyBzdHJpbmdzOiBhbnlbXSxcbiAgICAgIHB1YmxpYyBleHByZXNzaW9uczogYW55W10pIHtcbiAgICBzdXBlcihzcGFuLCBzb3VyY2VTcGFuKTtcbiAgfVxuICB2aXNpdCh2aXNpdG9yOiBBc3RWaXNpdG9yLCBjb250ZXh0OiBhbnkgPSBudWxsKTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdEludGVycG9sYXRpb24odGhpcywgY29udGV4dCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEJpbmFyeSBleHRlbmRzIEFTVCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgc3BhbjogUGFyc2VTcGFuLCBzb3VyY2VTcGFuOiBBYnNvbHV0ZVNvdXJjZVNwYW4sIHB1YmxpYyBvcGVyYXRpb246IHN0cmluZywgcHVibGljIGxlZnQ6IEFTVCxcbiAgICAgIHB1YmxpYyByaWdodDogQVNUKSB7XG4gICAgc3VwZXIoc3Bhbiwgc291cmNlU3Bhbik7XG4gIH1cbiAgdmlzaXQodmlzaXRvcjogQXN0VmlzaXRvciwgY29udGV4dDogYW55ID0gbnVsbCk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRCaW5hcnkodGhpcywgY29udGV4dCk7XG4gIH1cbn1cblxuLyoqXG4gKiBGb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHkgcmVhc29ucywgYFVuYXJ5YCBpbmhlcml0cyBmcm9tIGBCaW5hcnlgIGFuZCBtaW1pY3MgdGhlIGJpbmFyeSBBU1RcbiAqIG5vZGUgdGhhdCB3YXMgb3JpZ2luYWxseSB1c2VkLiBUaGlzIGluaGVyaXRhbmNlIHJlbGF0aW9uIGNhbiBiZSBkZWxldGVkIGluIHNvbWUgZnV0dXJlIG1ham9yLFxuICogYWZ0ZXIgY29uc3VtZXJzIGhhdmUgYmVlbiBnaXZlbiBhIGNoYW5jZSB0byBmdWxseSBzdXBwb3J0IFVuYXJ5LlxuICovXG5leHBvcnQgY2xhc3MgVW5hcnkgZXh0ZW5kcyBCaW5hcnkge1xuICAvLyBSZWRlY2xhcmUgdGhlIHByb3BlcnRpZXMgdGhhdCBhcmUgaW5oZXJpdGVkIGZyb20gYEJpbmFyeWAgYXMgYG5ldmVyYCwgYXMgY29uc3VtZXJzIHNob3VsZCBub3RcbiAgLy8gZGVwZW5kIG9uIHRoZXNlIGZpZWxkcyB3aGVuIG9wZXJhdGluZyBvbiBgVW5hcnlgLlxuICBsZWZ0OiBuZXZlcjtcbiAgcmlnaHQ6IG5ldmVyO1xuICBvcGVyYXRpb246IG5ldmVyO1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgdW5hcnkgbWludXMgZXhwcmVzc2lvbiBcIi14XCIsIHJlcHJlc2VudGVkIGFzIGBCaW5hcnlgIHVzaW5nIFwiMCAtIHhcIi5cbiAgICovXG4gIHN0YXRpYyBjcmVhdGVNaW51cyhzcGFuOiBQYXJzZVNwYW4sIHNvdXJjZVNwYW46IEFic29sdXRlU291cmNlU3BhbiwgZXhwcjogQVNUKTogVW5hcnkge1xuICAgIHJldHVybiBuZXcgVW5hcnkoXG4gICAgICAgIHNwYW4sIHNvdXJjZVNwYW4sICctJywgZXhwciwgJy0nLCBuZXcgTGl0ZXJhbFByaW1pdGl2ZShzcGFuLCBzb3VyY2VTcGFuLCAwKSwgZXhwcik7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIHVuYXJ5IHBsdXMgZXhwcmVzc2lvbiBcIit4XCIsIHJlcHJlc2VudGVkIGFzIGBCaW5hcnlgIHVzaW5nIFwieCAtIDBcIi5cbiAgICovXG4gIHN0YXRpYyBjcmVhdGVQbHVzKHNwYW46IFBhcnNlU3Bhbiwgc291cmNlU3BhbjogQWJzb2x1dGVTb3VyY2VTcGFuLCBleHByOiBBU1QpOiBVbmFyeSB7XG4gICAgcmV0dXJuIG5ldyBVbmFyeShcbiAgICAgICAgc3Bhbiwgc291cmNlU3BhbiwgJysnLCBleHByLCAnLScsIGV4cHIsIG5ldyBMaXRlcmFsUHJpbWl0aXZlKHNwYW4sIHNvdXJjZVNwYW4sIDApKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEdXJpbmcgdGhlIGRlcHJlY2F0aW9uIHBlcmlvZCB0aGlzIGNvbnN0cnVjdG9yIGlzIHByaXZhdGUsIHRvIGF2b2lkIGNvbnN1bWVycyBmcm9tIGNyZWF0aW5nXG4gICAqIGEgYFVuYXJ5YCB3aXRoIHRoZSBmYWxsYmFjayBwcm9wZXJ0aWVzIGZvciBgQmluYXJ5YC5cbiAgICovXG4gIHByaXZhdGUgY29uc3RydWN0b3IoXG4gICAgICBzcGFuOiBQYXJzZVNwYW4sIHNvdXJjZVNwYW46IEFic29sdXRlU291cmNlU3BhbiwgcHVibGljIG9wZXJhdG9yOiBzdHJpbmcsIHB1YmxpYyBleHByOiBBU1QsXG4gICAgICBiaW5hcnlPcDogc3RyaW5nLCBiaW5hcnlMZWZ0OiBBU1QsIGJpbmFyeVJpZ2h0OiBBU1QpIHtcbiAgICBzdXBlcihzcGFuLCBzb3VyY2VTcGFuLCBiaW5hcnlPcCwgYmluYXJ5TGVmdCwgYmluYXJ5UmlnaHQpO1xuICB9XG5cbiAgdmlzaXQodmlzaXRvcjogQXN0VmlzaXRvciwgY29udGV4dDogYW55ID0gbnVsbCk6IGFueSB7XG4gICAgaWYgKHZpc2l0b3IudmlzaXRVbmFyeSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdmlzaXRvci52aXNpdFVuYXJ5KHRoaXMsIGNvbnRleHQpO1xuICAgIH1cbiAgICByZXR1cm4gdmlzaXRvci52aXNpdEJpbmFyeSh0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUHJlZml4Tm90IGV4dGVuZHMgQVNUIHtcbiAgY29uc3RydWN0b3Ioc3BhbjogUGFyc2VTcGFuLCBzb3VyY2VTcGFuOiBBYnNvbHV0ZVNvdXJjZVNwYW4sIHB1YmxpYyBleHByZXNzaW9uOiBBU1QpIHtcbiAgICBzdXBlcihzcGFuLCBzb3VyY2VTcGFuKTtcbiAgfVxuICB2aXNpdCh2aXNpdG9yOiBBc3RWaXNpdG9yLCBjb250ZXh0OiBhbnkgPSBudWxsKTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdFByZWZpeE5vdCh0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTm9uTnVsbEFzc2VydCBleHRlbmRzIEFTVCB7XG4gIGNvbnN0cnVjdG9yKHNwYW46IFBhcnNlU3Bhbiwgc291cmNlU3BhbjogQWJzb2x1dGVTb3VyY2VTcGFuLCBwdWJsaWMgZXhwcmVzc2lvbjogQVNUKSB7XG4gICAgc3VwZXIoc3Bhbiwgc291cmNlU3Bhbik7XG4gIH1cbiAgdmlzaXQodmlzaXRvcjogQXN0VmlzaXRvciwgY29udGV4dDogYW55ID0gbnVsbCk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXROb25OdWxsQXNzZXJ0KHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBNZXRob2RDYWxsIGV4dGVuZHMgQVNUV2l0aE5hbWUge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHNwYW46IFBhcnNlU3Bhbiwgc291cmNlU3BhbjogQWJzb2x1dGVTb3VyY2VTcGFuLCBuYW1lU3BhbjogQWJzb2x1dGVTb3VyY2VTcGFuLFxuICAgICAgcHVibGljIHJlY2VpdmVyOiBBU1QsIHB1YmxpYyBuYW1lOiBzdHJpbmcsIHB1YmxpYyBhcmdzOiBhbnlbXSxcbiAgICAgIHB1YmxpYyBhcmd1bWVudFNwYW46IEFic29sdXRlU291cmNlU3Bhbikge1xuICAgIHN1cGVyKHNwYW4sIHNvdXJjZVNwYW4sIG5hbWVTcGFuKTtcbiAgfVxuICB2aXNpdCh2aXNpdG9yOiBBc3RWaXNpdG9yLCBjb250ZXh0OiBhbnkgPSBudWxsKTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdE1ldGhvZENhbGwodGhpcywgY29udGV4dCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNhZmVNZXRob2RDYWxsIGV4dGVuZHMgQVNUV2l0aE5hbWUge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHNwYW46IFBhcnNlU3Bhbiwgc291cmNlU3BhbjogQWJzb2x1dGVTb3VyY2VTcGFuLCBuYW1lU3BhbjogQWJzb2x1dGVTb3VyY2VTcGFuLFxuICAgICAgcHVibGljIHJlY2VpdmVyOiBBU1QsIHB1YmxpYyBuYW1lOiBzdHJpbmcsIHB1YmxpYyBhcmdzOiBhbnlbXSxcbiAgICAgIHB1YmxpYyBhcmd1bWVudFNwYW46IEFic29sdXRlU291cmNlU3Bhbikge1xuICAgIHN1cGVyKHNwYW4sIHNvdXJjZVNwYW4sIG5hbWVTcGFuKTtcbiAgfVxuICB2aXNpdCh2aXNpdG9yOiBBc3RWaXNpdG9yLCBjb250ZXh0OiBhbnkgPSBudWxsKTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdFNhZmVNZXRob2RDYWxsKHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBGdW5jdGlvbkNhbGwgZXh0ZW5kcyBBU1Qge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHNwYW46IFBhcnNlU3Bhbiwgc291cmNlU3BhbjogQWJzb2x1dGVTb3VyY2VTcGFuLCBwdWJsaWMgdGFyZ2V0OiBBU1R8bnVsbCxcbiAgICAgIHB1YmxpYyBhcmdzOiBhbnlbXSkge1xuICAgIHN1cGVyKHNwYW4sIHNvdXJjZVNwYW4pO1xuICB9XG4gIHZpc2l0KHZpc2l0b3I6IEFzdFZpc2l0b3IsIGNvbnRleHQ6IGFueSA9IG51bGwpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0RnVuY3Rpb25DYWxsKHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cbi8qKlxuICogUmVjb3JkcyB0aGUgYWJzb2x1dGUgcG9zaXRpb24gb2YgYSB0ZXh0IHNwYW4gaW4gYSBzb3VyY2UgZmlsZSwgd2hlcmUgYHN0YXJ0YCBhbmQgYGVuZGAgYXJlIHRoZVxuICogc3RhcnRpbmcgYW5kIGVuZGluZyBieXRlIG9mZnNldHMsIHJlc3BlY3RpdmVseSwgb2YgdGhlIHRleHQgc3BhbiBpbiBhIHNvdXJjZSBmaWxlLlxuICovXG5leHBvcnQgY2xhc3MgQWJzb2x1dGVTb3VyY2VTcGFuIHtcbiAgY29uc3RydWN0b3IocHVibGljIHJlYWRvbmx5IHN0YXJ0OiBudW1iZXIsIHB1YmxpYyByZWFkb25seSBlbmQ6IG51bWJlcikge31cbn1cblxuZXhwb3J0IGNsYXNzIEFTVFdpdGhTb3VyY2UgZXh0ZW5kcyBBU1Qge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBhc3Q6IEFTVCwgcHVibGljIHNvdXJjZTogc3RyaW5nfG51bGwsIHB1YmxpYyBsb2NhdGlvbjogc3RyaW5nLCBhYnNvbHV0ZU9mZnNldDogbnVtYmVyLFxuICAgICAgcHVibGljIGVycm9yczogUGFyc2VyRXJyb3JbXSkge1xuICAgIHN1cGVyKFxuICAgICAgICBuZXcgUGFyc2VTcGFuKDAsIHNvdXJjZSA9PT0gbnVsbCA/IDAgOiBzb3VyY2UubGVuZ3RoKSxcbiAgICAgICAgbmV3IEFic29sdXRlU291cmNlU3BhbihcbiAgICAgICAgICAgIGFic29sdXRlT2Zmc2V0LCBzb3VyY2UgPT09IG51bGwgPyBhYnNvbHV0ZU9mZnNldCA6IGFic29sdXRlT2Zmc2V0ICsgc291cmNlLmxlbmd0aCkpO1xuICB9XG4gIHZpc2l0KHZpc2l0b3I6IEFzdFZpc2l0b3IsIGNvbnRleHQ6IGFueSA9IG51bGwpOiBhbnkge1xuICAgIGlmICh2aXNpdG9yLnZpc2l0QVNUV2l0aFNvdXJjZSkge1xuICAgICAgcmV0dXJuIHZpc2l0b3IudmlzaXRBU1RXaXRoU291cmNlKHRoaXMsIGNvbnRleHQpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5hc3QudmlzaXQodmlzaXRvciwgY29udGV4dCk7XG4gIH1cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYCR7dGhpcy5zb3VyY2V9IGluICR7dGhpcy5sb2NhdGlvbn1gO1xuICB9XG59XG5cbi8qKlxuICogVGVtcGxhdGVCaW5kaW5nIHJlZmVycyB0byBhIHBhcnRpY3VsYXIga2V5LXZhbHVlIHBhaXIgaW4gYSBtaWNyb3N5bnRheFxuICogZXhwcmVzc2lvbi4gQSBmZXcgZXhhbXBsZXMgYXJlOlxuICpcbiAqICAgfC0tLS0tLS0tLS0tLS0tLS0tLS0tLXwtLS0tLS0tLS0tLS0tLXwtLS0tLS0tLS18LS0tLS0tLS0tLS0tLS18XG4gKiAgIHwgICAgIGV4cHJlc3Npb24gICAgICB8ICAgICBrZXkgICAgICB8ICB2YWx1ZSAgfCBiaW5kaW5nIHR5cGUgfFxuICogICB8LS0tLS0tLS0tLS0tLS0tLS0tLS0tfC0tLS0tLS0tLS0tLS0tfC0tLS0tLS0tLXwtLS0tLS0tLS0tLS0tLXxcbiAqICAgfCAxLiBsZXQgaXRlbSAgICAgICAgIHwgICAgaXRlbSAgICAgIHwgIG51bGwgICB8ICAgdmFyaWFibGUgICB8XG4gKiAgIHwgMi4gb2YgaXRlbXMgICAgICAgICB8ICAgbmdGb3JPZiAgICB8ICBpdGVtcyAgfCAgZXhwcmVzc2lvbiAgfFxuICogICB8IDMuIGxldCB4ID0geSAgICAgICAgfCAgICAgIHggICAgICAgfCAgICB5ICAgIHwgICB2YXJpYWJsZSAgIHxcbiAqICAgfCA0LiBpbmRleCBhcyBpICAgICAgIHwgICAgICBpICAgICAgIHwgIGluZGV4ICB8ICAgdmFyaWFibGUgICB8XG4gKiAgIHwgNS4gdHJhY2tCeTogZnVuYyAgICB8IG5nRm9yVHJhY2tCeSB8ICAgZnVuYyAgfCAgZXhwcmVzc2lvbiAgfFxuICogICB8IDYuICpuZ0lmPVwiY29uZFwiICAgICB8ICAgICBuZ0lmICAgICB8ICAgY29uZCAgfCAgZXhwcmVzc2lvbiAgfFxuICogICB8LS0tLS0tLS0tLS0tLS0tLS0tLS0tfC0tLS0tLS0tLS0tLS0tfC0tLS0tLS0tLXwtLS0tLS0tLS0tLS0tLXxcbiAqXG4gKiAoNikgaXMgYSBub3RhYmxlIGV4Y2VwdGlvbiBiZWNhdXNlIGl0IGlzIGEgYmluZGluZyBmcm9tIHRoZSB0ZW1wbGF0ZSBrZXkgaW5cbiAqIHRoZSBMSFMgb2YgYSBIVE1MIGF0dHJpYnV0ZSB0byB0aGUgZXhwcmVzc2lvbiBpbiB0aGUgUkhTLiBBbGwgb3RoZXIgYmluZGluZ3NcbiAqIGluIHRoZSBleGFtcGxlIGFib3ZlIGFyZSBkZXJpdmVkIHNvbGVseSBmcm9tIHRoZSBSSFMuXG4gKi9cbmV4cG9ydCB0eXBlIFRlbXBsYXRlQmluZGluZyA9IFZhcmlhYmxlQmluZGluZ3xFeHByZXNzaW9uQmluZGluZztcblxuZXhwb3J0IGNsYXNzIFZhcmlhYmxlQmluZGluZyB7XG4gIC8qKlxuICAgKiBAcGFyYW0gc291cmNlU3BhbiBlbnRpcmUgc3BhbiBvZiB0aGUgYmluZGluZy5cbiAgICogQHBhcmFtIGtleSBuYW1lIG9mIHRoZSBMSFMgYWxvbmcgd2l0aCBpdHMgc3Bhbi5cbiAgICogQHBhcmFtIHZhbHVlIG9wdGlvbmFsIHZhbHVlIGZvciB0aGUgUkhTIGFsb25nIHdpdGggaXRzIHNwYW4uXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyByZWFkb25seSBzb3VyY2VTcGFuOiBBYnNvbHV0ZVNvdXJjZVNwYW4sXG4gICAgICBwdWJsaWMgcmVhZG9ubHkga2V5OiBUZW1wbGF0ZUJpbmRpbmdJZGVudGlmaWVyLFxuICAgICAgcHVibGljIHJlYWRvbmx5IHZhbHVlOiBUZW1wbGF0ZUJpbmRpbmdJZGVudGlmaWVyfG51bGwpIHt9XG59XG5cbmV4cG9ydCBjbGFzcyBFeHByZXNzaW9uQmluZGluZyB7XG4gIC8qKlxuICAgKiBAcGFyYW0gc291cmNlU3BhbiBlbnRpcmUgc3BhbiBvZiB0aGUgYmluZGluZy5cbiAgICogQHBhcmFtIGtleSBiaW5kaW5nIG5hbWUsIGxpa2UgbmdGb3JPZiwgbmdGb3JUcmFja0J5LCBuZ0lmLCBhbG9uZyB3aXRoIGl0c1xuICAgKiBzcGFuLiBOb3RlIHRoYXQgdGhlIGxlbmd0aCBvZiB0aGUgc3BhbiBtYXkgbm90IGJlIHRoZSBzYW1lIGFzXG4gICAqIGBrZXkuc291cmNlLmxlbmd0aGAuIEZvciBleGFtcGxlLFxuICAgKiAxLiBrZXkuc291cmNlID0gbmdGb3IsIGtleS5zcGFuIGlzIGZvciBcIm5nRm9yXCJcbiAgICogMi4ga2V5LnNvdXJjZSA9IG5nRm9yT2YsIGtleS5zcGFuIGlzIGZvciBcIm9mXCJcbiAgICogMy4ga2V5LnNvdXJjZSA9IG5nRm9yVHJhY2tCeSwga2V5LnNwYW4gaXMgZm9yIFwidHJhY2tCeVwiXG4gICAqIEBwYXJhbSB2YWx1ZSBvcHRpb25hbCBleHByZXNzaW9uIGZvciB0aGUgUkhTLlxuICAgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgcmVhZG9ubHkgc291cmNlU3BhbjogQWJzb2x1dGVTb3VyY2VTcGFuLFxuICAgICAgcHVibGljIHJlYWRvbmx5IGtleTogVGVtcGxhdGVCaW5kaW5nSWRlbnRpZmllciwgcHVibGljIHJlYWRvbmx5IHZhbHVlOiBBU1RXaXRoU291cmNlfG51bGwpIHt9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGVtcGxhdGVCaW5kaW5nSWRlbnRpZmllciB7XG4gIHNvdXJjZTogc3RyaW5nO1xuICBzcGFuOiBBYnNvbHV0ZVNvdXJjZVNwYW47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQXN0VmlzaXRvciB7XG4gIC8qKlxuICAgKiBUaGUgYHZpc2l0VW5hcnlgIG1ldGhvZCBpcyBkZWNsYXJlZCBhcyBvcHRpb25hbCBmb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHkuIEluIGFuIHVwY29taW5nXG4gICAqIG1ham9yIHJlbGVhc2UsIHRoaXMgbWV0aG9kIHdpbGwgYmUgbWFkZSByZXF1aXJlZC5cbiAgICovXG4gIHZpc2l0VW5hcnk/KGFzdDogVW5hcnksIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRCaW5hcnkoYXN0OiBCaW5hcnksIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRDaGFpbihhc3Q6IENoYWluLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0Q29uZGl0aW9uYWwoYXN0OiBDb25kaXRpb25hbCwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdEZ1bmN0aW9uQ2FsbChhc3Q6IEZ1bmN0aW9uQ2FsbCwgY29udGV4dDogYW55KTogYW55O1xuICAvKipcbiAgICogVGhlIGB2aXNpdFRoaXNSZWNlaXZlcmAgbWV0aG9kIGlzIGRlY2xhcmVkIGFzIG9wdGlvbmFsIGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eS5cbiAgICogSW4gYW4gdXBjb21pbmcgbWFqb3IgcmVsZWFzZSwgdGhpcyBtZXRob2Qgd2lsbCBiZSBtYWRlIHJlcXVpcmVkLlxuICAgKi9cbiAgdmlzaXRUaGlzUmVjZWl2ZXI/KGFzdDogVGhpc1JlY2VpdmVyLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0SW1wbGljaXRSZWNlaXZlcihhc3Q6IEltcGxpY2l0UmVjZWl2ZXIsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRJbnRlcnBvbGF0aW9uKGFzdDogSW50ZXJwb2xhdGlvbiwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdEtleWVkUmVhZChhc3Q6IEtleWVkUmVhZCwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdEtleWVkV3JpdGUoYXN0OiBLZXllZFdyaXRlLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0TGl0ZXJhbEFycmF5KGFzdDogTGl0ZXJhbEFycmF5LCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0TGl0ZXJhbE1hcChhc3Q6IExpdGVyYWxNYXAsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRMaXRlcmFsUHJpbWl0aXZlKGFzdDogTGl0ZXJhbFByaW1pdGl2ZSwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdE1ldGhvZENhbGwoYXN0OiBNZXRob2RDYWxsLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0UGlwZShhc3Q6IEJpbmRpbmdQaXBlLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0UHJlZml4Tm90KGFzdDogUHJlZml4Tm90LCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0Tm9uTnVsbEFzc2VydChhc3Q6IE5vbk51bGxBc3NlcnQsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRQcm9wZXJ0eVJlYWQoYXN0OiBQcm9wZXJ0eVJlYWQsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRQcm9wZXJ0eVdyaXRlKGFzdDogUHJvcGVydHlXcml0ZSwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdFF1b3RlKGFzdDogUXVvdGUsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRTYWZlTWV0aG9kQ2FsbChhc3Q6IFNhZmVNZXRob2RDYWxsLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0U2FmZVByb3BlcnR5UmVhZChhc3Q6IFNhZmVQcm9wZXJ0eVJlYWQsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRBU1RXaXRoU291cmNlPyhhc3Q6IEFTVFdpdGhTb3VyY2UsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgLyoqXG4gICAqIFRoaXMgZnVuY3Rpb24gaXMgb3B0aW9uYWxseSBkZWZpbmVkIHRvIGFsbG93IGNsYXNzZXMgdGhhdCBpbXBsZW1lbnQgdGhpc1xuICAgKiBpbnRlcmZhY2UgdG8gc2VsZWN0aXZlbHkgZGVjaWRlIGlmIHRoZSBzcGVjaWZpZWQgYGFzdGAgc2hvdWxkIGJlIHZpc2l0ZWQuXG4gICAqIEBwYXJhbSBhc3Qgbm9kZSB0byB2aXNpdFxuICAgKiBAcGFyYW0gY29udGV4dCBjb250ZXh0IHRoYXQgZ2V0cyBwYXNzZWQgdG8gdGhlIG5vZGUgYW5kIGFsbCBpdHMgY2hpbGRyZW5cbiAgICovXG4gIHZpc2l0Pyhhc3Q6IEFTVCwgY29udGV4dD86IGFueSk6IGFueTtcbn1cblxuZXhwb3J0IGNsYXNzIFJlY3Vyc2l2ZUFzdFZpc2l0b3IgaW1wbGVtZW50cyBBc3RWaXNpdG9yIHtcbiAgdmlzaXQoYXN0OiBBU1QsIGNvbnRleHQ/OiBhbnkpOiBhbnkge1xuICAgIC8vIFRoZSBkZWZhdWx0IGltcGxlbWVudGF0aW9uIGp1c3QgdmlzaXRzIGV2ZXJ5IG5vZGUuXG4gICAgLy8gQ2xhc3NlcyB0aGF0IGV4dGVuZCBSZWN1cnNpdmVBc3RWaXNpdG9yIHNob3VsZCBvdmVycmlkZSB0aGlzIGZ1bmN0aW9uXG4gICAgLy8gdG8gc2VsZWN0aXZlbHkgdmlzaXQgdGhlIHNwZWNpZmllZCBub2RlLlxuICAgIGFzdC52aXNpdCh0aGlzLCBjb250ZXh0KTtcbiAgfVxuICB2aXNpdFVuYXJ5KGFzdDogVW5hcnksIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgdGhpcy52aXNpdChhc3QuZXhwciwgY29udGV4dCk7XG4gIH1cbiAgdmlzaXRCaW5hcnkoYXN0OiBCaW5hcnksIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgdGhpcy52aXNpdChhc3QubGVmdCwgY29udGV4dCk7XG4gICAgdGhpcy52aXNpdChhc3QucmlnaHQsIGNvbnRleHQpO1xuICB9XG4gIHZpc2l0Q2hhaW4oYXN0OiBDaGFpbiwgY29udGV4dDogYW55KTogYW55IHtcbiAgICB0aGlzLnZpc2l0QWxsKGFzdC5leHByZXNzaW9ucywgY29udGV4dCk7XG4gIH1cbiAgdmlzaXRDb25kaXRpb25hbChhc3Q6IENvbmRpdGlvbmFsLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHRoaXMudmlzaXQoYXN0LmNvbmRpdGlvbiwgY29udGV4dCk7XG4gICAgdGhpcy52aXNpdChhc3QudHJ1ZUV4cCwgY29udGV4dCk7XG4gICAgdGhpcy52aXNpdChhc3QuZmFsc2VFeHAsIGNvbnRleHQpO1xuICB9XG4gIHZpc2l0UGlwZShhc3Q6IEJpbmRpbmdQaXBlLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHRoaXMudmlzaXQoYXN0LmV4cCwgY29udGV4dCk7XG4gICAgdGhpcy52aXNpdEFsbChhc3QuYXJncywgY29udGV4dCk7XG4gIH1cbiAgdmlzaXRGdW5jdGlvbkNhbGwoYXN0OiBGdW5jdGlvbkNhbGwsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgaWYgKGFzdC50YXJnZXQpIHtcbiAgICAgIHRoaXMudmlzaXQoYXN0LnRhcmdldCwgY29udGV4dCk7XG4gICAgfVxuICAgIHRoaXMudmlzaXRBbGwoYXN0LmFyZ3MsIGNvbnRleHQpO1xuICB9XG4gIHZpc2l0SW1wbGljaXRSZWNlaXZlcihhc3Q6IFRoaXNSZWNlaXZlciwgY29udGV4dDogYW55KTogYW55IHt9XG4gIHZpc2l0VGhpc1JlY2VpdmVyKGFzdDogVGhpc1JlY2VpdmVyLCBjb250ZXh0OiBhbnkpOiBhbnkge31cbiAgdmlzaXRJbnRlcnBvbGF0aW9uKGFzdDogSW50ZXJwb2xhdGlvbiwgY29udGV4dDogYW55KTogYW55IHtcbiAgICB0aGlzLnZpc2l0QWxsKGFzdC5leHByZXNzaW9ucywgY29udGV4dCk7XG4gIH1cbiAgdmlzaXRLZXllZFJlYWQoYXN0OiBLZXllZFJlYWQsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgdGhpcy52aXNpdChhc3Qub2JqLCBjb250ZXh0KTtcbiAgICB0aGlzLnZpc2l0KGFzdC5rZXksIGNvbnRleHQpO1xuICB9XG4gIHZpc2l0S2V5ZWRXcml0ZShhc3Q6IEtleWVkV3JpdGUsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgdGhpcy52aXNpdChhc3Qub2JqLCBjb250ZXh0KTtcbiAgICB0aGlzLnZpc2l0KGFzdC5rZXksIGNvbnRleHQpO1xuICAgIHRoaXMudmlzaXQoYXN0LnZhbHVlLCBjb250ZXh0KTtcbiAgfVxuICB2aXNpdExpdGVyYWxBcnJheShhc3Q6IExpdGVyYWxBcnJheSwgY29udGV4dDogYW55KTogYW55IHtcbiAgICB0aGlzLnZpc2l0QWxsKGFzdC5leHByZXNzaW9ucywgY29udGV4dCk7XG4gIH1cbiAgdmlzaXRMaXRlcmFsTWFwKGFzdDogTGl0ZXJhbE1hcCwgY29udGV4dDogYW55KTogYW55IHtcbiAgICB0aGlzLnZpc2l0QWxsKGFzdC52YWx1ZXMsIGNvbnRleHQpO1xuICB9XG4gIHZpc2l0TGl0ZXJhbFByaW1pdGl2ZShhc3Q6IExpdGVyYWxQcmltaXRpdmUsIGNvbnRleHQ6IGFueSk6IGFueSB7fVxuICB2aXNpdE1ldGhvZENhbGwoYXN0OiBNZXRob2RDYWxsLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHRoaXMudmlzaXQoYXN0LnJlY2VpdmVyLCBjb250ZXh0KTtcbiAgICB0aGlzLnZpc2l0QWxsKGFzdC5hcmdzLCBjb250ZXh0KTtcbiAgfVxuICB2aXNpdFByZWZpeE5vdChhc3Q6IFByZWZpeE5vdCwgY29udGV4dDogYW55KTogYW55IHtcbiAgICB0aGlzLnZpc2l0KGFzdC5leHByZXNzaW9uLCBjb250ZXh0KTtcbiAgfVxuICB2aXNpdE5vbk51bGxBc3NlcnQoYXN0OiBOb25OdWxsQXNzZXJ0LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHRoaXMudmlzaXQoYXN0LmV4cHJlc3Npb24sIGNvbnRleHQpO1xuICB9XG4gIHZpc2l0UHJvcGVydHlSZWFkKGFzdDogUHJvcGVydHlSZWFkLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHRoaXMudmlzaXQoYXN0LnJlY2VpdmVyLCBjb250ZXh0KTtcbiAgfVxuICB2aXNpdFByb3BlcnR5V3JpdGUoYXN0OiBQcm9wZXJ0eVdyaXRlLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHRoaXMudmlzaXQoYXN0LnJlY2VpdmVyLCBjb250ZXh0KTtcbiAgICB0aGlzLnZpc2l0KGFzdC52YWx1ZSwgY29udGV4dCk7XG4gIH1cbiAgdmlzaXRTYWZlUHJvcGVydHlSZWFkKGFzdDogU2FmZVByb3BlcnR5UmVhZCwgY29udGV4dDogYW55KTogYW55IHtcbiAgICB0aGlzLnZpc2l0KGFzdC5yZWNlaXZlciwgY29udGV4dCk7XG4gIH1cbiAgdmlzaXRTYWZlTWV0aG9kQ2FsbChhc3Q6IFNhZmVNZXRob2RDYWxsLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHRoaXMudmlzaXQoYXN0LnJlY2VpdmVyLCBjb250ZXh0KTtcbiAgICB0aGlzLnZpc2l0QWxsKGFzdC5hcmdzLCBjb250ZXh0KTtcbiAgfVxuICB2aXNpdFF1b3RlKGFzdDogUXVvdGUsIGNvbnRleHQ6IGFueSk6IGFueSB7fVxuICAvLyBUaGlzIGlzIG5vdCBwYXJ0IG9mIHRoZSBBc3RWaXNpdG9yIGludGVyZmFjZSwganVzdCBhIGhlbHBlciBtZXRob2RcbiAgdmlzaXRBbGwoYXN0czogQVNUW10sIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgZm9yIChjb25zdCBhc3Qgb2YgYXN0cykge1xuICAgICAgdGhpcy52aXNpdChhc3QsIGNvbnRleHQpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQXN0VHJhbnNmb3JtZXIgaW1wbGVtZW50cyBBc3RWaXNpdG9yIHtcbiAgdmlzaXRJbXBsaWNpdFJlY2VpdmVyKGFzdDogSW1wbGljaXRSZWNlaXZlciwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICByZXR1cm4gYXN0O1xuICB9XG5cbiAgdmlzaXRUaGlzUmVjZWl2ZXIoYXN0OiBUaGlzUmVjZWl2ZXIsIGNvbnRleHQ6IGFueSk6IEFTVCB7XG4gICAgcmV0dXJuIGFzdDtcbiAgfVxuXG4gIHZpc2l0SW50ZXJwb2xhdGlvbihhc3Q6IEludGVycG9sYXRpb24sIGNvbnRleHQ6IGFueSk6IEFTVCB7XG4gICAgcmV0dXJuIG5ldyBJbnRlcnBvbGF0aW9uKGFzdC5zcGFuLCBhc3Quc291cmNlU3BhbiwgYXN0LnN0cmluZ3MsIHRoaXMudmlzaXRBbGwoYXN0LmV4cHJlc3Npb25zKSk7XG4gIH1cblxuICB2aXNpdExpdGVyYWxQcmltaXRpdmUoYXN0OiBMaXRlcmFsUHJpbWl0aXZlLCBjb250ZXh0OiBhbnkpOiBBU1Qge1xuICAgIHJldHVybiBuZXcgTGl0ZXJhbFByaW1pdGl2ZShhc3Quc3BhbiwgYXN0LnNvdXJjZVNwYW4sIGFzdC52YWx1ZSk7XG4gIH1cblxuICB2aXNpdFByb3BlcnR5UmVhZChhc3Q6IFByb3BlcnR5UmVhZCwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICByZXR1cm4gbmV3IFByb3BlcnR5UmVhZChcbiAgICAgICAgYXN0LnNwYW4sIGFzdC5zb3VyY2VTcGFuLCBhc3QubmFtZVNwYW4sIGFzdC5yZWNlaXZlci52aXNpdCh0aGlzKSwgYXN0Lm5hbWUpO1xuICB9XG5cbiAgdmlzaXRQcm9wZXJ0eVdyaXRlKGFzdDogUHJvcGVydHlXcml0ZSwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICByZXR1cm4gbmV3IFByb3BlcnR5V3JpdGUoXG4gICAgICAgIGFzdC5zcGFuLCBhc3Quc291cmNlU3BhbiwgYXN0Lm5hbWVTcGFuLCBhc3QucmVjZWl2ZXIudmlzaXQodGhpcyksIGFzdC5uYW1lLFxuICAgICAgICBhc3QudmFsdWUudmlzaXQodGhpcykpO1xuICB9XG5cbiAgdmlzaXRTYWZlUHJvcGVydHlSZWFkKGFzdDogU2FmZVByb3BlcnR5UmVhZCwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICByZXR1cm4gbmV3IFNhZmVQcm9wZXJ0eVJlYWQoXG4gICAgICAgIGFzdC5zcGFuLCBhc3Quc291cmNlU3BhbiwgYXN0Lm5hbWVTcGFuLCBhc3QucmVjZWl2ZXIudmlzaXQodGhpcyksIGFzdC5uYW1lKTtcbiAgfVxuXG4gIHZpc2l0TWV0aG9kQ2FsbChhc3Q6IE1ldGhvZENhbGwsIGNvbnRleHQ6IGFueSk6IEFTVCB7XG4gICAgcmV0dXJuIG5ldyBNZXRob2RDYWxsKFxuICAgICAgICBhc3Quc3BhbiwgYXN0LnNvdXJjZVNwYW4sIGFzdC5uYW1lU3BhbiwgYXN0LnJlY2VpdmVyLnZpc2l0KHRoaXMpLCBhc3QubmFtZSxcbiAgICAgICAgdGhpcy52aXNpdEFsbChhc3QuYXJncyksIGFzdC5hcmd1bWVudFNwYW4pO1xuICB9XG5cbiAgdmlzaXRTYWZlTWV0aG9kQ2FsbChhc3Q6IFNhZmVNZXRob2RDYWxsLCBjb250ZXh0OiBhbnkpOiBBU1Qge1xuICAgIHJldHVybiBuZXcgU2FmZU1ldGhvZENhbGwoXG4gICAgICAgIGFzdC5zcGFuLCBhc3Quc291cmNlU3BhbiwgYXN0Lm5hbWVTcGFuLCBhc3QucmVjZWl2ZXIudmlzaXQodGhpcyksIGFzdC5uYW1lLFxuICAgICAgICB0aGlzLnZpc2l0QWxsKGFzdC5hcmdzKSwgYXN0LmFyZ3VtZW50U3Bhbik7XG4gIH1cblxuICB2aXNpdEZ1bmN0aW9uQ2FsbChhc3Q6IEZ1bmN0aW9uQ2FsbCwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICByZXR1cm4gbmV3IEZ1bmN0aW9uQ2FsbChcbiAgICAgICAgYXN0LnNwYW4sIGFzdC5zb3VyY2VTcGFuLCBhc3QudGFyZ2V0IS52aXNpdCh0aGlzKSwgdGhpcy52aXNpdEFsbChhc3QuYXJncykpO1xuICB9XG5cbiAgdmlzaXRMaXRlcmFsQXJyYXkoYXN0OiBMaXRlcmFsQXJyYXksIGNvbnRleHQ6IGFueSk6IEFTVCB7XG4gICAgcmV0dXJuIG5ldyBMaXRlcmFsQXJyYXkoYXN0LnNwYW4sIGFzdC5zb3VyY2VTcGFuLCB0aGlzLnZpc2l0QWxsKGFzdC5leHByZXNzaW9ucykpO1xuICB9XG5cbiAgdmlzaXRMaXRlcmFsTWFwKGFzdDogTGl0ZXJhbE1hcCwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICByZXR1cm4gbmV3IExpdGVyYWxNYXAoYXN0LnNwYW4sIGFzdC5zb3VyY2VTcGFuLCBhc3Qua2V5cywgdGhpcy52aXNpdEFsbChhc3QudmFsdWVzKSk7XG4gIH1cblxuICB2aXNpdFVuYXJ5KGFzdDogVW5hcnksIGNvbnRleHQ6IGFueSk6IEFTVCB7XG4gICAgc3dpdGNoIChhc3Qub3BlcmF0b3IpIHtcbiAgICAgIGNhc2UgJysnOlxuICAgICAgICByZXR1cm4gVW5hcnkuY3JlYXRlUGx1cyhhc3Quc3BhbiwgYXN0LnNvdXJjZVNwYW4sIGFzdC5leHByLnZpc2l0KHRoaXMpKTtcbiAgICAgIGNhc2UgJy0nOlxuICAgICAgICByZXR1cm4gVW5hcnkuY3JlYXRlTWludXMoYXN0LnNwYW4sIGFzdC5zb3VyY2VTcGFuLCBhc3QuZXhwci52aXNpdCh0aGlzKSk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gdW5hcnkgb3BlcmF0b3IgJHthc3Qub3BlcmF0b3J9YCk7XG4gICAgfVxuICB9XG5cbiAgdmlzaXRCaW5hcnkoYXN0OiBCaW5hcnksIGNvbnRleHQ6IGFueSk6IEFTVCB7XG4gICAgcmV0dXJuIG5ldyBCaW5hcnkoXG4gICAgICAgIGFzdC5zcGFuLCBhc3Quc291cmNlU3BhbiwgYXN0Lm9wZXJhdGlvbiwgYXN0LmxlZnQudmlzaXQodGhpcyksIGFzdC5yaWdodC52aXNpdCh0aGlzKSk7XG4gIH1cblxuICB2aXNpdFByZWZpeE5vdChhc3Q6IFByZWZpeE5vdCwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICByZXR1cm4gbmV3IFByZWZpeE5vdChhc3Quc3BhbiwgYXN0LnNvdXJjZVNwYW4sIGFzdC5leHByZXNzaW9uLnZpc2l0KHRoaXMpKTtcbiAgfVxuXG4gIHZpc2l0Tm9uTnVsbEFzc2VydChhc3Q6IE5vbk51bGxBc3NlcnQsIGNvbnRleHQ6IGFueSk6IEFTVCB7XG4gICAgcmV0dXJuIG5ldyBOb25OdWxsQXNzZXJ0KGFzdC5zcGFuLCBhc3Quc291cmNlU3BhbiwgYXN0LmV4cHJlc3Npb24udmlzaXQodGhpcykpO1xuICB9XG5cbiAgdmlzaXRDb25kaXRpb25hbChhc3Q6IENvbmRpdGlvbmFsLCBjb250ZXh0OiBhbnkpOiBBU1Qge1xuICAgIHJldHVybiBuZXcgQ29uZGl0aW9uYWwoXG4gICAgICAgIGFzdC5zcGFuLCBhc3Quc291cmNlU3BhbiwgYXN0LmNvbmRpdGlvbi52aXNpdCh0aGlzKSwgYXN0LnRydWVFeHAudmlzaXQodGhpcyksXG4gICAgICAgIGFzdC5mYWxzZUV4cC52aXNpdCh0aGlzKSk7XG4gIH1cblxuICB2aXNpdFBpcGUoYXN0OiBCaW5kaW5nUGlwZSwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICByZXR1cm4gbmV3IEJpbmRpbmdQaXBlKFxuICAgICAgICBhc3Quc3BhbiwgYXN0LnNvdXJjZVNwYW4sIGFzdC5leHAudmlzaXQodGhpcyksIGFzdC5uYW1lLCB0aGlzLnZpc2l0QWxsKGFzdC5hcmdzKSxcbiAgICAgICAgYXN0Lm5hbWVTcGFuKTtcbiAgfVxuXG4gIHZpc2l0S2V5ZWRSZWFkKGFzdDogS2V5ZWRSZWFkLCBjb250ZXh0OiBhbnkpOiBBU1Qge1xuICAgIHJldHVybiBuZXcgS2V5ZWRSZWFkKGFzdC5zcGFuLCBhc3Quc291cmNlU3BhbiwgYXN0Lm9iai52aXNpdCh0aGlzKSwgYXN0LmtleS52aXNpdCh0aGlzKSk7XG4gIH1cblxuICB2aXNpdEtleWVkV3JpdGUoYXN0OiBLZXllZFdyaXRlLCBjb250ZXh0OiBhbnkpOiBBU1Qge1xuICAgIHJldHVybiBuZXcgS2V5ZWRXcml0ZShcbiAgICAgICAgYXN0LnNwYW4sIGFzdC5zb3VyY2VTcGFuLCBhc3Qub2JqLnZpc2l0KHRoaXMpLCBhc3Qua2V5LnZpc2l0KHRoaXMpLCBhc3QudmFsdWUudmlzaXQodGhpcykpO1xuICB9XG5cbiAgdmlzaXRBbGwoYXN0czogYW55W10pOiBhbnlbXSB7XG4gICAgY29uc3QgcmVzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhc3RzLmxlbmd0aDsgKytpKSB7XG4gICAgICByZXNbaV0gPSBhc3RzW2ldLnZpc2l0KHRoaXMpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgdmlzaXRDaGFpbihhc3Q6IENoYWluLCBjb250ZXh0OiBhbnkpOiBBU1Qge1xuICAgIHJldHVybiBuZXcgQ2hhaW4oYXN0LnNwYW4sIGFzdC5zb3VyY2VTcGFuLCB0aGlzLnZpc2l0QWxsKGFzdC5leHByZXNzaW9ucykpO1xuICB9XG5cbiAgdmlzaXRRdW90ZShhc3Q6IFF1b3RlLCBjb250ZXh0OiBhbnkpOiBBU1Qge1xuICAgIHJldHVybiBuZXcgUXVvdGUoXG4gICAgICAgIGFzdC5zcGFuLCBhc3Quc291cmNlU3BhbiwgYXN0LnByZWZpeCwgYXN0LnVuaW50ZXJwcmV0ZWRFeHByZXNzaW9uLCBhc3QubG9jYXRpb24pO1xuICB9XG59XG5cbi8vIEEgdHJhbnNmb3JtZXIgdGhhdCBvbmx5IGNyZWF0ZXMgbmV3IG5vZGVzIGlmIHRoZSB0cmFuc2Zvcm1lciBtYWtlcyBhIGNoYW5nZSBvclxuLy8gYSBjaGFuZ2UgaXMgbWFkZSBhIGNoaWxkIG5vZGUuXG5leHBvcnQgY2xhc3MgQXN0TWVtb3J5RWZmaWNpZW50VHJhbnNmb3JtZXIgaW1wbGVtZW50cyBBc3RWaXNpdG9yIHtcbiAgdmlzaXRJbXBsaWNpdFJlY2VpdmVyKGFzdDogSW1wbGljaXRSZWNlaXZlciwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICByZXR1cm4gYXN0O1xuICB9XG5cbiAgdmlzaXRUaGlzUmVjZWl2ZXIoYXN0OiBUaGlzUmVjZWl2ZXIsIGNvbnRleHQ6IGFueSk6IEFTVCB7XG4gICAgcmV0dXJuIGFzdDtcbiAgfVxuXG4gIHZpc2l0SW50ZXJwb2xhdGlvbihhc3Q6IEludGVycG9sYXRpb24sIGNvbnRleHQ6IGFueSk6IEludGVycG9sYXRpb24ge1xuICAgIGNvbnN0IGV4cHJlc3Npb25zID0gdGhpcy52aXNpdEFsbChhc3QuZXhwcmVzc2lvbnMpO1xuICAgIGlmIChleHByZXNzaW9ucyAhPT0gYXN0LmV4cHJlc3Npb25zKVxuICAgICAgcmV0dXJuIG5ldyBJbnRlcnBvbGF0aW9uKGFzdC5zcGFuLCBhc3Quc291cmNlU3BhbiwgYXN0LnN0cmluZ3MsIGV4cHJlc3Npb25zKTtcbiAgICByZXR1cm4gYXN0O1xuICB9XG5cbiAgdmlzaXRMaXRlcmFsUHJpbWl0aXZlKGFzdDogTGl0ZXJhbFByaW1pdGl2ZSwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICByZXR1cm4gYXN0O1xuICB9XG5cbiAgdmlzaXRQcm9wZXJ0eVJlYWQoYXN0OiBQcm9wZXJ0eVJlYWQsIGNvbnRleHQ6IGFueSk6IEFTVCB7XG4gICAgY29uc3QgcmVjZWl2ZXIgPSBhc3QucmVjZWl2ZXIudmlzaXQodGhpcyk7XG4gICAgaWYgKHJlY2VpdmVyICE9PSBhc3QucmVjZWl2ZXIpIHtcbiAgICAgIHJldHVybiBuZXcgUHJvcGVydHlSZWFkKGFzdC5zcGFuLCBhc3Quc291cmNlU3BhbiwgYXN0Lm5hbWVTcGFuLCByZWNlaXZlciwgYXN0Lm5hbWUpO1xuICAgIH1cbiAgICByZXR1cm4gYXN0O1xuICB9XG5cbiAgdmlzaXRQcm9wZXJ0eVdyaXRlKGFzdDogUHJvcGVydHlXcml0ZSwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICBjb25zdCByZWNlaXZlciA9IGFzdC5yZWNlaXZlci52aXNpdCh0aGlzKTtcbiAgICBjb25zdCB2YWx1ZSA9IGFzdC52YWx1ZS52aXNpdCh0aGlzKTtcbiAgICBpZiAocmVjZWl2ZXIgIT09IGFzdC5yZWNlaXZlciB8fCB2YWx1ZSAhPT0gYXN0LnZhbHVlKSB7XG4gICAgICByZXR1cm4gbmV3IFByb3BlcnR5V3JpdGUoYXN0LnNwYW4sIGFzdC5zb3VyY2VTcGFuLCBhc3QubmFtZVNwYW4sIHJlY2VpdmVyLCBhc3QubmFtZSwgdmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gYXN0O1xuICB9XG5cbiAgdmlzaXRTYWZlUHJvcGVydHlSZWFkKGFzdDogU2FmZVByb3BlcnR5UmVhZCwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICBjb25zdCByZWNlaXZlciA9IGFzdC5yZWNlaXZlci52aXNpdCh0aGlzKTtcbiAgICBpZiAocmVjZWl2ZXIgIT09IGFzdC5yZWNlaXZlcikge1xuICAgICAgcmV0dXJuIG5ldyBTYWZlUHJvcGVydHlSZWFkKGFzdC5zcGFuLCBhc3Quc291cmNlU3BhbiwgYXN0Lm5hbWVTcGFuLCByZWNlaXZlciwgYXN0Lm5hbWUpO1xuICAgIH1cbiAgICByZXR1cm4gYXN0O1xuICB9XG5cbiAgdmlzaXRNZXRob2RDYWxsKGFzdDogTWV0aG9kQ2FsbCwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICBjb25zdCByZWNlaXZlciA9IGFzdC5yZWNlaXZlci52aXNpdCh0aGlzKTtcbiAgICBjb25zdCBhcmdzID0gdGhpcy52aXNpdEFsbChhc3QuYXJncyk7XG4gICAgaWYgKHJlY2VpdmVyICE9PSBhc3QucmVjZWl2ZXIgfHwgYXJncyAhPT0gYXN0LmFyZ3MpIHtcbiAgICAgIHJldHVybiBuZXcgTWV0aG9kQ2FsbChcbiAgICAgICAgICBhc3Quc3BhbiwgYXN0LnNvdXJjZVNwYW4sIGFzdC5uYW1lU3BhbiwgcmVjZWl2ZXIsIGFzdC5uYW1lLCBhcmdzLCBhc3QuYXJndW1lbnRTcGFuKTtcbiAgICB9XG4gICAgcmV0dXJuIGFzdDtcbiAgfVxuXG4gIHZpc2l0U2FmZU1ldGhvZENhbGwoYXN0OiBTYWZlTWV0aG9kQ2FsbCwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICBjb25zdCByZWNlaXZlciA9IGFzdC5yZWNlaXZlci52aXNpdCh0aGlzKTtcbiAgICBjb25zdCBhcmdzID0gdGhpcy52aXNpdEFsbChhc3QuYXJncyk7XG4gICAgaWYgKHJlY2VpdmVyICE9PSBhc3QucmVjZWl2ZXIgfHwgYXJncyAhPT0gYXN0LmFyZ3MpIHtcbiAgICAgIHJldHVybiBuZXcgU2FmZU1ldGhvZENhbGwoXG4gICAgICAgICAgYXN0LnNwYW4sIGFzdC5zb3VyY2VTcGFuLCBhc3QubmFtZVNwYW4sIHJlY2VpdmVyLCBhc3QubmFtZSwgYXJncywgYXN0LmFyZ3VtZW50U3Bhbik7XG4gICAgfVxuICAgIHJldHVybiBhc3Q7XG4gIH1cblxuICB2aXNpdEZ1bmN0aW9uQ2FsbChhc3Q6IEZ1bmN0aW9uQ2FsbCwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICBjb25zdCB0YXJnZXQgPSBhc3QudGFyZ2V0ICYmIGFzdC50YXJnZXQudmlzaXQodGhpcyk7XG4gICAgY29uc3QgYXJncyA9IHRoaXMudmlzaXRBbGwoYXN0LmFyZ3MpO1xuICAgIGlmICh0YXJnZXQgIT09IGFzdC50YXJnZXQgfHwgYXJncyAhPT0gYXN0LmFyZ3MpIHtcbiAgICAgIHJldHVybiBuZXcgRnVuY3Rpb25DYWxsKGFzdC5zcGFuLCBhc3Quc291cmNlU3BhbiwgdGFyZ2V0LCBhcmdzKTtcbiAgICB9XG4gICAgcmV0dXJuIGFzdDtcbiAgfVxuXG4gIHZpc2l0TGl0ZXJhbEFycmF5KGFzdDogTGl0ZXJhbEFycmF5LCBjb250ZXh0OiBhbnkpOiBBU1Qge1xuICAgIGNvbnN0IGV4cHJlc3Npb25zID0gdGhpcy52aXNpdEFsbChhc3QuZXhwcmVzc2lvbnMpO1xuICAgIGlmIChleHByZXNzaW9ucyAhPT0gYXN0LmV4cHJlc3Npb25zKSB7XG4gICAgICByZXR1cm4gbmV3IExpdGVyYWxBcnJheShhc3Quc3BhbiwgYXN0LnNvdXJjZVNwYW4sIGV4cHJlc3Npb25zKTtcbiAgICB9XG4gICAgcmV0dXJuIGFzdDtcbiAgfVxuXG4gIHZpc2l0TGl0ZXJhbE1hcChhc3Q6IExpdGVyYWxNYXAsIGNvbnRleHQ6IGFueSk6IEFTVCB7XG4gICAgY29uc3QgdmFsdWVzID0gdGhpcy52aXNpdEFsbChhc3QudmFsdWVzKTtcbiAgICBpZiAodmFsdWVzICE9PSBhc3QudmFsdWVzKSB7XG4gICAgICByZXR1cm4gbmV3IExpdGVyYWxNYXAoYXN0LnNwYW4sIGFzdC5zb3VyY2VTcGFuLCBhc3Qua2V5cywgdmFsdWVzKTtcbiAgICB9XG4gICAgcmV0dXJuIGFzdDtcbiAgfVxuXG4gIHZpc2l0VW5hcnkoYXN0OiBVbmFyeSwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICBjb25zdCBleHByID0gYXN0LmV4cHIudmlzaXQodGhpcyk7XG4gICAgaWYgKGV4cHIgIT09IGFzdC5leHByKSB7XG4gICAgICBzd2l0Y2ggKGFzdC5vcGVyYXRvcikge1xuICAgICAgICBjYXNlICcrJzpcbiAgICAgICAgICByZXR1cm4gVW5hcnkuY3JlYXRlUGx1cyhhc3Quc3BhbiwgYXN0LnNvdXJjZVNwYW4sIGV4cHIpO1xuICAgICAgICBjYXNlICctJzpcbiAgICAgICAgICByZXR1cm4gVW5hcnkuY3JlYXRlTWludXMoYXN0LnNwYW4sIGFzdC5zb3VyY2VTcGFuLCBleHByKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gdW5hcnkgb3BlcmF0b3IgJHthc3Qub3BlcmF0b3J9YCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBhc3Q7XG4gIH1cblxuICB2aXNpdEJpbmFyeShhc3Q6IEJpbmFyeSwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICBjb25zdCBsZWZ0ID0gYXN0LmxlZnQudmlzaXQodGhpcyk7XG4gICAgY29uc3QgcmlnaHQgPSBhc3QucmlnaHQudmlzaXQodGhpcyk7XG4gICAgaWYgKGxlZnQgIT09IGFzdC5sZWZ0IHx8IHJpZ2h0ICE9PSBhc3QucmlnaHQpIHtcbiAgICAgIHJldHVybiBuZXcgQmluYXJ5KGFzdC5zcGFuLCBhc3Quc291cmNlU3BhbiwgYXN0Lm9wZXJhdGlvbiwgbGVmdCwgcmlnaHQpO1xuICAgIH1cbiAgICByZXR1cm4gYXN0O1xuICB9XG5cbiAgdmlzaXRQcmVmaXhOb3QoYXN0OiBQcmVmaXhOb3QsIGNvbnRleHQ6IGFueSk6IEFTVCB7XG4gICAgY29uc3QgZXhwcmVzc2lvbiA9IGFzdC5leHByZXNzaW9uLnZpc2l0KHRoaXMpO1xuICAgIGlmIChleHByZXNzaW9uICE9PSBhc3QuZXhwcmVzc2lvbikge1xuICAgICAgcmV0dXJuIG5ldyBQcmVmaXhOb3QoYXN0LnNwYW4sIGFzdC5zb3VyY2VTcGFuLCBleHByZXNzaW9uKTtcbiAgICB9XG4gICAgcmV0dXJuIGFzdDtcbiAgfVxuXG4gIHZpc2l0Tm9uTnVsbEFzc2VydChhc3Q6IE5vbk51bGxBc3NlcnQsIGNvbnRleHQ6IGFueSk6IEFTVCB7XG4gICAgY29uc3QgZXhwcmVzc2lvbiA9IGFzdC5leHByZXNzaW9uLnZpc2l0KHRoaXMpO1xuICAgIGlmIChleHByZXNzaW9uICE9PSBhc3QuZXhwcmVzc2lvbikge1xuICAgICAgcmV0dXJuIG5ldyBOb25OdWxsQXNzZXJ0KGFzdC5zcGFuLCBhc3Quc291cmNlU3BhbiwgZXhwcmVzc2lvbik7XG4gICAgfVxuICAgIHJldHVybiBhc3Q7XG4gIH1cblxuICB2aXNpdENvbmRpdGlvbmFsKGFzdDogQ29uZGl0aW9uYWwsIGNvbnRleHQ6IGFueSk6IEFTVCB7XG4gICAgY29uc3QgY29uZGl0aW9uID0gYXN0LmNvbmRpdGlvbi52aXNpdCh0aGlzKTtcbiAgICBjb25zdCB0cnVlRXhwID0gYXN0LnRydWVFeHAudmlzaXQodGhpcyk7XG4gICAgY29uc3QgZmFsc2VFeHAgPSBhc3QuZmFsc2VFeHAudmlzaXQodGhpcyk7XG4gICAgaWYgKGNvbmRpdGlvbiAhPT0gYXN0LmNvbmRpdGlvbiB8fCB0cnVlRXhwICE9PSBhc3QudHJ1ZUV4cCB8fCBmYWxzZUV4cCAhPT0gYXN0LmZhbHNlRXhwKSB7XG4gICAgICByZXR1cm4gbmV3IENvbmRpdGlvbmFsKGFzdC5zcGFuLCBhc3Quc291cmNlU3BhbiwgY29uZGl0aW9uLCB0cnVlRXhwLCBmYWxzZUV4cCk7XG4gICAgfVxuICAgIHJldHVybiBhc3Q7XG4gIH1cblxuICB2aXNpdFBpcGUoYXN0OiBCaW5kaW5nUGlwZSwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICBjb25zdCBleHAgPSBhc3QuZXhwLnZpc2l0KHRoaXMpO1xuICAgIGNvbnN0IGFyZ3MgPSB0aGlzLnZpc2l0QWxsKGFzdC5hcmdzKTtcbiAgICBpZiAoZXhwICE9PSBhc3QuZXhwIHx8IGFyZ3MgIT09IGFzdC5hcmdzKSB7XG4gICAgICByZXR1cm4gbmV3IEJpbmRpbmdQaXBlKGFzdC5zcGFuLCBhc3Quc291cmNlU3BhbiwgZXhwLCBhc3QubmFtZSwgYXJncywgYXN0Lm5hbWVTcGFuKTtcbiAgICB9XG4gICAgcmV0dXJuIGFzdDtcbiAgfVxuXG4gIHZpc2l0S2V5ZWRSZWFkKGFzdDogS2V5ZWRSZWFkLCBjb250ZXh0OiBhbnkpOiBBU1Qge1xuICAgIGNvbnN0IG9iaiA9IGFzdC5vYmoudmlzaXQodGhpcyk7XG4gICAgY29uc3Qga2V5ID0gYXN0LmtleS52aXNpdCh0aGlzKTtcbiAgICBpZiAob2JqICE9PSBhc3Qub2JqIHx8IGtleSAhPT0gYXN0LmtleSkge1xuICAgICAgcmV0dXJuIG5ldyBLZXllZFJlYWQoYXN0LnNwYW4sIGFzdC5zb3VyY2VTcGFuLCBvYmosIGtleSk7XG4gICAgfVxuICAgIHJldHVybiBhc3Q7XG4gIH1cblxuICB2aXNpdEtleWVkV3JpdGUoYXN0OiBLZXllZFdyaXRlLCBjb250ZXh0OiBhbnkpOiBBU1Qge1xuICAgIGNvbnN0IG9iaiA9IGFzdC5vYmoudmlzaXQodGhpcyk7XG4gICAgY29uc3Qga2V5ID0gYXN0LmtleS52aXNpdCh0aGlzKTtcbiAgICBjb25zdCB2YWx1ZSA9IGFzdC52YWx1ZS52aXNpdCh0aGlzKTtcbiAgICBpZiAob2JqICE9PSBhc3Qub2JqIHx8IGtleSAhPT0gYXN0LmtleSB8fCB2YWx1ZSAhPT0gYXN0LnZhbHVlKSB7XG4gICAgICByZXR1cm4gbmV3IEtleWVkV3JpdGUoYXN0LnNwYW4sIGFzdC5zb3VyY2VTcGFuLCBvYmosIGtleSwgdmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gYXN0O1xuICB9XG5cbiAgdmlzaXRBbGwoYXN0czogYW55W10pOiBhbnlbXSB7XG4gICAgY29uc3QgcmVzID0gW107XG4gICAgbGV0IG1vZGlmaWVkID0gZmFsc2U7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhc3RzLmxlbmd0aDsgKytpKSB7XG4gICAgICBjb25zdCBvcmlnaW5hbCA9IGFzdHNbaV07XG4gICAgICBjb25zdCB2YWx1ZSA9IG9yaWdpbmFsLnZpc2l0KHRoaXMpO1xuICAgICAgcmVzW2ldID0gdmFsdWU7XG4gICAgICBtb2RpZmllZCA9IG1vZGlmaWVkIHx8IHZhbHVlICE9PSBvcmlnaW5hbDtcbiAgICB9XG4gICAgcmV0dXJuIG1vZGlmaWVkID8gcmVzIDogYXN0cztcbiAgfVxuXG4gIHZpc2l0Q2hhaW4oYXN0OiBDaGFpbiwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICBjb25zdCBleHByZXNzaW9ucyA9IHRoaXMudmlzaXRBbGwoYXN0LmV4cHJlc3Npb25zKTtcbiAgICBpZiAoZXhwcmVzc2lvbnMgIT09IGFzdC5leHByZXNzaW9ucykge1xuICAgICAgcmV0dXJuIG5ldyBDaGFpbihhc3Quc3BhbiwgYXN0LnNvdXJjZVNwYW4sIGV4cHJlc3Npb25zKTtcbiAgICB9XG4gICAgcmV0dXJuIGFzdDtcbiAgfVxuXG4gIHZpc2l0UXVvdGUoYXN0OiBRdW90ZSwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICByZXR1cm4gYXN0O1xuICB9XG59XG5cbi8vIEJpbmRpbmdzXG5cbmV4cG9ydCBjbGFzcyBQYXJzZWRQcm9wZXJ0eSB7XG4gIHB1YmxpYyByZWFkb25seSBpc0xpdGVyYWw6IGJvb2xlYW47XG4gIHB1YmxpYyByZWFkb25seSBpc0FuaW1hdGlvbjogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBuYW1lOiBzdHJpbmcsIHB1YmxpYyBleHByZXNzaW9uOiBBU1RXaXRoU291cmNlLCBwdWJsaWMgdHlwZTogUGFyc2VkUHJvcGVydHlUeXBlLFxuICAgICAgLy8gVE9ETyhGVy0yMDk1KTogYGtleVNwYW5gIHNob3VsZCByZWFsbHkgYmUgcmVxdWlyZWQgYnV0IGFsbG93cyBgdW5kZWZpbmVkYCBzbyBWRSBkb2VzXG4gICAgICAvLyBub3QgbmVlZCB0byBiZSB1cGRhdGVkLiBNYWtlIGBrZXlTcGFuYCByZXF1aXJlZCB3aGVuIFZFIGlzIHJlbW92ZWQuXG4gICAgICBwdWJsaWMgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLCByZWFkb25seSBrZXlTcGFuOiBQYXJzZVNvdXJjZVNwYW58dW5kZWZpbmVkLFxuICAgICAgcHVibGljIHZhbHVlU3BhbjogUGFyc2VTb3VyY2VTcGFufHVuZGVmaW5lZCkge1xuICAgIHRoaXMuaXNMaXRlcmFsID0gdGhpcy50eXBlID09PSBQYXJzZWRQcm9wZXJ0eVR5cGUuTElURVJBTF9BVFRSO1xuICAgIHRoaXMuaXNBbmltYXRpb24gPSB0aGlzLnR5cGUgPT09IFBhcnNlZFByb3BlcnR5VHlwZS5BTklNQVRJT047XG4gIH1cbn1cblxuZXhwb3J0IGVudW0gUGFyc2VkUHJvcGVydHlUeXBlIHtcbiAgREVGQVVMVCxcbiAgTElURVJBTF9BVFRSLFxuICBBTklNQVRJT05cbn1cblxuZXhwb3J0IGNvbnN0IGVudW0gUGFyc2VkRXZlbnRUeXBlIHtcbiAgLy8gRE9NIG9yIERpcmVjdGl2ZSBldmVudFxuICBSZWd1bGFyLFxuICAvLyBBbmltYXRpb24gc3BlY2lmaWMgZXZlbnRcbiAgQW5pbWF0aW9uLFxufVxuXG5leHBvcnQgY2xhc3MgUGFyc2VkRXZlbnQge1xuICAvLyBSZWd1bGFyIGV2ZW50cyBoYXZlIGEgdGFyZ2V0XG4gIC8vIEFuaW1hdGlvbiBldmVudHMgaGF2ZSBhIHBoYXNlXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIG5hbWU6IHN0cmluZywgcHVibGljIHRhcmdldE9yUGhhc2U6IHN0cmluZywgcHVibGljIHR5cGU6IFBhcnNlZEV2ZW50VHlwZSxcbiAgICAgIHB1YmxpYyBoYW5kbGVyOiBBU1RXaXRoU291cmNlLCBwdWJsaWMgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgICAgLy8gVE9ETyhGVy0yMDk1KToga2V5U3BhbiBzaG91bGQgYmUgcmVxdWlyZWQgYnV0IHdhcyBtYWRlIG9wdGlvbmFsIHRvIGF2b2lkIGNoYW5naW5nIFZFXG4gICAgICBwdWJsaWMgaGFuZGxlclNwYW46IFBhcnNlU291cmNlU3BhbiwgcmVhZG9ubHkga2V5U3BhbjogUGFyc2VTb3VyY2VTcGFufHVuZGVmaW5lZCkge31cbn1cblxuLyoqXG4gKiBQYXJzZWRWYXJpYWJsZSByZXByZXNlbnRzIGEgdmFyaWFibGUgZGVjbGFyYXRpb24gaW4gYSBtaWNyb3N5bnRheCBleHByZXNzaW9uLlxuICovXG5leHBvcnQgY2xhc3MgUGFyc2VkVmFyaWFibGUge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyByZWFkb25seSBuYW1lOiBzdHJpbmcsIHB1YmxpYyByZWFkb25seSB2YWx1ZTogc3RyaW5nLFxuICAgICAgcHVibGljIHJlYWRvbmx5IHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbiwgcHVibGljIHJlYWRvbmx5IGtleVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICAgIHB1YmxpYyByZWFkb25seSB2YWx1ZVNwYW4/OiBQYXJzZVNvdXJjZVNwYW4pIHt9XG59XG5cbmV4cG9ydCBjb25zdCBlbnVtIEJpbmRpbmdUeXBlIHtcbiAgLy8gQSByZWd1bGFyIGJpbmRpbmcgdG8gYSBwcm9wZXJ0eSAoZS5nLiBgW3Byb3BlcnR5XT1cImV4cHJlc3Npb25cImApLlxuICBQcm9wZXJ0eSxcbiAgLy8gQSBiaW5kaW5nIHRvIGFuIGVsZW1lbnQgYXR0cmlidXRlIChlLmcuIGBbYXR0ci5uYW1lXT1cImV4cHJlc3Npb25cImApLlxuICBBdHRyaWJ1dGUsXG4gIC8vIEEgYmluZGluZyB0byBhIENTUyBjbGFzcyAoZS5nLiBgW2NsYXNzLm5hbWVdPVwiY29uZGl0aW9uXCJgKS5cbiAgQ2xhc3MsXG4gIC8vIEEgYmluZGluZyB0byBhIHN0eWxlIHJ1bGUgKGUuZy4gYFtzdHlsZS5ydWxlXT1cImV4cHJlc3Npb25cImApLlxuICBTdHlsZSxcbiAgLy8gQSBiaW5kaW5nIHRvIGFuIGFuaW1hdGlvbiByZWZlcmVuY2UgKGUuZy4gYFthbmltYXRlLmtleV09XCJleHByZXNzaW9uXCJgKS5cbiAgQW5pbWF0aW9uLFxufVxuXG5leHBvcnQgY2xhc3MgQm91bmRFbGVtZW50UHJvcGVydHkge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBuYW1lOiBzdHJpbmcsIHB1YmxpYyB0eXBlOiBCaW5kaW5nVHlwZSwgcHVibGljIHNlY3VyaXR5Q29udGV4dDogU2VjdXJpdHlDb250ZXh0LFxuICAgICAgcHVibGljIHZhbHVlOiBBU1RXaXRoU291cmNlLCBwdWJsaWMgdW5pdDogc3RyaW5nfG51bGwsIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICByZWFkb25seSBrZXlTcGFuOiBQYXJzZVNvdXJjZVNwYW58dW5kZWZpbmVkLCBwdWJsaWMgdmFsdWVTcGFuOiBQYXJzZVNvdXJjZVNwYW58dW5kZWZpbmVkKSB7fVxufVxuIl19