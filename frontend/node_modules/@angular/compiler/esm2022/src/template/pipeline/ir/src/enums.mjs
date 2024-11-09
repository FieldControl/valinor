/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Distinguishes different kinds of IR operations.
 *
 * Includes both creation and update operations.
 */
export var OpKind;
(function (OpKind) {
    /**
     * A special operation type which is used to represent the beginning and end nodes of a linked
     * list of operations.
     */
    OpKind[OpKind["ListEnd"] = 0] = "ListEnd";
    /**
     * An operation which wraps an output AST statement.
     */
    OpKind[OpKind["Statement"] = 1] = "Statement";
    /**
     * An operation which declares and initializes a `SemanticVariable`.
     */
    OpKind[OpKind["Variable"] = 2] = "Variable";
    /**
     * An operation to begin rendering of an element.
     */
    OpKind[OpKind["ElementStart"] = 3] = "ElementStart";
    /**
     * An operation to render an element with no children.
     */
    OpKind[OpKind["Element"] = 4] = "Element";
    /**
     * An operation which declares an embedded view.
     */
    OpKind[OpKind["Template"] = 5] = "Template";
    /**
     * An operation to end rendering of an element previously started with `ElementStart`.
     */
    OpKind[OpKind["ElementEnd"] = 6] = "ElementEnd";
    /**
     * An operation to begin an `ng-container`.
     */
    OpKind[OpKind["ContainerStart"] = 7] = "ContainerStart";
    /**
     * An operation for an `ng-container` with no children.
     */
    OpKind[OpKind["Container"] = 8] = "Container";
    /**
     * An operation to end an `ng-container`.
     */
    OpKind[OpKind["ContainerEnd"] = 9] = "ContainerEnd";
    /**
     * An operation disable binding for subsequent elements, which are descendants of a non-bindable
     * node.
     */
    OpKind[OpKind["DisableBindings"] = 10] = "DisableBindings";
    /**
     * An op to conditionally render a template.
     */
    OpKind[OpKind["Conditional"] = 11] = "Conditional";
    /**
     * An operation to re-enable binding, after it was previously disabled.
     */
    OpKind[OpKind["EnableBindings"] = 12] = "EnableBindings";
    /**
     * An operation to render a text node.
     */
    OpKind[OpKind["Text"] = 13] = "Text";
    /**
     * An operation declaring an event listener for an element.
     */
    OpKind[OpKind["Listener"] = 14] = "Listener";
    /**
     * An operation to interpolate text into a text node.
     */
    OpKind[OpKind["InterpolateText"] = 15] = "InterpolateText";
    /**
     * An intermediate binding op, that has not yet been processed into an individual property,
     * attribute, style, etc.
     */
    OpKind[OpKind["Binding"] = 16] = "Binding";
    /**
     * An operation to bind an expression to a property of an element.
     */
    OpKind[OpKind["Property"] = 17] = "Property";
    /**
     * An operation to bind an expression to a style property of an element.
     */
    OpKind[OpKind["StyleProp"] = 18] = "StyleProp";
    /**
     * An operation to bind an expression to a class property of an element.
     */
    OpKind[OpKind["ClassProp"] = 19] = "ClassProp";
    /**
     * An operation to bind an expression to the styles of an element.
     */
    OpKind[OpKind["StyleMap"] = 20] = "StyleMap";
    /**
     * An operation to bind an expression to the classes of an element.
     */
    OpKind[OpKind["ClassMap"] = 21] = "ClassMap";
    /**
     * An operation to advance the runtime's implicit slot context during the update phase of a view.
     */
    OpKind[OpKind["Advance"] = 22] = "Advance";
    /**
     * An operation to instantiate a pipe.
     */
    OpKind[OpKind["Pipe"] = 23] = "Pipe";
    /**
     * An operation to associate an attribute with an element.
     */
    OpKind[OpKind["Attribute"] = 24] = "Attribute";
    /**
     * An attribute that has been extracted for inclusion in the consts array.
     */
    OpKind[OpKind["ExtractedAttribute"] = 25] = "ExtractedAttribute";
    /**
     * An operation that configures a `@defer` block.
     */
    OpKind[OpKind["Defer"] = 26] = "Defer";
    /**
     * An operation that controls when a `@defer` loads.
     */
    OpKind[OpKind["DeferOn"] = 27] = "DeferOn";
    /**
     * An operation that controls when a `@defer` loads, using a custom expression as the condition.
     */
    OpKind[OpKind["DeferWhen"] = 28] = "DeferWhen";
    /**
     * An i18n message that has been extracted for inclusion in the consts array.
     */
    OpKind[OpKind["I18nMessage"] = 29] = "I18nMessage";
    /**
     * A host binding property.
     */
    OpKind[OpKind["HostProperty"] = 30] = "HostProperty";
    /**
     * A namespace change, which causes the subsequent elements to be processed as either HTML or SVG.
     */
    OpKind[OpKind["Namespace"] = 31] = "Namespace";
    /**
     * Configure a content projeciton definition for the view.
     */
    OpKind[OpKind["ProjectionDef"] = 32] = "ProjectionDef";
    /**
     * Create a content projection slot.
     */
    OpKind[OpKind["Projection"] = 33] = "Projection";
    /**
     * Create a repeater creation instruction op.
     */
    OpKind[OpKind["RepeaterCreate"] = 34] = "RepeaterCreate";
    /**
     * An update up for a repeater.
     */
    OpKind[OpKind["Repeater"] = 35] = "Repeater";
    /**
     * An operation to bind an expression to the property side of a two-way binding.
     */
    OpKind[OpKind["TwoWayProperty"] = 36] = "TwoWayProperty";
    /**
     * An operation declaring the event side of a two-way binding.
     */
    OpKind[OpKind["TwoWayListener"] = 37] = "TwoWayListener";
    /**
     * The start of an i18n block.
     */
    OpKind[OpKind["I18nStart"] = 38] = "I18nStart";
    /**
     * A self-closing i18n on a single element.
     */
    OpKind[OpKind["I18n"] = 39] = "I18n";
    /**
     * The end of an i18n block.
     */
    OpKind[OpKind["I18nEnd"] = 40] = "I18nEnd";
    /**
     * An expression in an i18n message.
     */
    OpKind[OpKind["I18nExpression"] = 41] = "I18nExpression";
    /**
     * An instruction that applies a set of i18n expressions.
     */
    OpKind[OpKind["I18nApply"] = 42] = "I18nApply";
    /**
     * An instruction to create an ICU expression.
     */
    OpKind[OpKind["IcuStart"] = 43] = "IcuStart";
    /**
     * An instruction to update an ICU expression.
     */
    OpKind[OpKind["IcuEnd"] = 44] = "IcuEnd";
    /**
     * An instruction representing a placeholder in an ICU expression.
     */
    OpKind[OpKind["IcuPlaceholder"] = 45] = "IcuPlaceholder";
    /**
     * An i18n context containing information needed to generate an i18n message.
     */
    OpKind[OpKind["I18nContext"] = 46] = "I18nContext";
    /**
     * A creation op that corresponds to i18n attributes on an element.
     */
    OpKind[OpKind["I18nAttributes"] = 47] = "I18nAttributes";
})(OpKind || (OpKind = {}));
/**
 * Distinguishes different kinds of IR expressions.
 */
export var ExpressionKind;
(function (ExpressionKind) {
    /**
     * Read of a variable in a lexical scope.
     */
    ExpressionKind[ExpressionKind["LexicalRead"] = 0] = "LexicalRead";
    /**
     * A reference to the current view context.
     */
    ExpressionKind[ExpressionKind["Context"] = 1] = "Context";
    /**
     * A reference to the view context, for use inside a track function.
     */
    ExpressionKind[ExpressionKind["TrackContext"] = 2] = "TrackContext";
    /**
     * Read of a variable declared in a `VariableOp`.
     */
    ExpressionKind[ExpressionKind["ReadVariable"] = 3] = "ReadVariable";
    /**
     * Runtime operation to navigate to the next view context in the view hierarchy.
     */
    ExpressionKind[ExpressionKind["NextContext"] = 4] = "NextContext";
    /**
     * Runtime operation to retrieve the value of a local reference.
     */
    ExpressionKind[ExpressionKind["Reference"] = 5] = "Reference";
    /**
     * Runtime operation to snapshot the current view context.
     */
    ExpressionKind[ExpressionKind["GetCurrentView"] = 6] = "GetCurrentView";
    /**
     * Runtime operation to restore a snapshotted view.
     */
    ExpressionKind[ExpressionKind["RestoreView"] = 7] = "RestoreView";
    /**
     * Runtime operation to reset the current view context after `RestoreView`.
     */
    ExpressionKind[ExpressionKind["ResetView"] = 8] = "ResetView";
    /**
     * Defines and calls a function with change-detected arguments.
     */
    ExpressionKind[ExpressionKind["PureFunctionExpr"] = 9] = "PureFunctionExpr";
    /**
     * Indicates a positional parameter to a pure function definition.
     */
    ExpressionKind[ExpressionKind["PureFunctionParameterExpr"] = 10] = "PureFunctionParameterExpr";
    /**
     * Binding to a pipe transformation.
     */
    ExpressionKind[ExpressionKind["PipeBinding"] = 11] = "PipeBinding";
    /**
     * Binding to a pipe transformation with a variable number of arguments.
     */
    ExpressionKind[ExpressionKind["PipeBindingVariadic"] = 12] = "PipeBindingVariadic";
    /*
     * A safe property read requiring expansion into a null check.
     */
    ExpressionKind[ExpressionKind["SafePropertyRead"] = 13] = "SafePropertyRead";
    /**
     * A safe keyed read requiring expansion into a null check.
     */
    ExpressionKind[ExpressionKind["SafeKeyedRead"] = 14] = "SafeKeyedRead";
    /**
     * A safe function call requiring expansion into a null check.
     */
    ExpressionKind[ExpressionKind["SafeInvokeFunction"] = 15] = "SafeInvokeFunction";
    /**
     * An intermediate expression that will be expanded from a safe read into an explicit ternary.
     */
    ExpressionKind[ExpressionKind["SafeTernaryExpr"] = 16] = "SafeTernaryExpr";
    /**
     * An empty expression that will be stipped before generating the final output.
     */
    ExpressionKind[ExpressionKind["EmptyExpr"] = 17] = "EmptyExpr";
    /*
     * An assignment to a temporary variable.
     */
    ExpressionKind[ExpressionKind["AssignTemporaryExpr"] = 18] = "AssignTemporaryExpr";
    /**
     * A reference to a temporary variable.
     */
    ExpressionKind[ExpressionKind["ReadTemporaryExpr"] = 19] = "ReadTemporaryExpr";
    /**
     * An expression that will cause a literal slot index to be emitted.
     */
    ExpressionKind[ExpressionKind["SlotLiteralExpr"] = 20] = "SlotLiteralExpr";
    /**
     * A test expression for a conditional op.
     */
    ExpressionKind[ExpressionKind["ConditionalCase"] = 21] = "ConditionalCase";
    /**
     * An expression that will be automatically extracted to the component const array.
     */
    ExpressionKind[ExpressionKind["ConstCollected"] = 22] = "ConstCollected";
    /**
     * Operation that sets the value of a two-way binding.
     */
    ExpressionKind[ExpressionKind["TwoWayBindingSet"] = 23] = "TwoWayBindingSet";
})(ExpressionKind || (ExpressionKind = {}));
export var VariableFlags;
(function (VariableFlags) {
    VariableFlags[VariableFlags["None"] = 0] = "None";
    /**
     * Always inline this variable, regardless of the number of times it's used.
     * An `AlwaysInline` variable may not depend on context, because doing so may cause side effects
     * that are illegal when multi-inlined. (The optimizer will enforce this constraint.)
     */
    VariableFlags[VariableFlags["AlwaysInline"] = 1] = "AlwaysInline";
})(VariableFlags || (VariableFlags = {}));
/**
 * Distinguishes between different kinds of `SemanticVariable`s.
 */
export var SemanticVariableKind;
(function (SemanticVariableKind) {
    /**
     * Represents the context of a particular view.
     */
    SemanticVariableKind[SemanticVariableKind["Context"] = 0] = "Context";
    /**
     * Represents an identifier declared in the lexical scope of a view.
     */
    SemanticVariableKind[SemanticVariableKind["Identifier"] = 1] = "Identifier";
    /**
     * Represents a saved state that can be used to restore a view in a listener handler function.
     */
    SemanticVariableKind[SemanticVariableKind["SavedView"] = 2] = "SavedView";
    /**
     * An alias generated by a special embedded view type (e.g. a `@for` block).
     */
    SemanticVariableKind[SemanticVariableKind["Alias"] = 3] = "Alias";
})(SemanticVariableKind || (SemanticVariableKind = {}));
/**
 * Whether to compile in compatibilty mode. In compatibility mode, the template pipeline will
 * attempt to match the output of `TemplateDefinitionBuilder` as exactly as possible, at the cost
 * of producing quirky or larger code in some cases.
 */
export var CompatibilityMode;
(function (CompatibilityMode) {
    CompatibilityMode[CompatibilityMode["Normal"] = 0] = "Normal";
    CompatibilityMode[CompatibilityMode["TemplateDefinitionBuilder"] = 1] = "TemplateDefinitionBuilder";
})(CompatibilityMode || (CompatibilityMode = {}));
/**
 * Enumeration of the types of attributes which can be applied to an element.
 */
export var BindingKind;
(function (BindingKind) {
    /**
     * Static attributes.
     */
    BindingKind[BindingKind["Attribute"] = 0] = "Attribute";
    /**
     * Class bindings.
     */
    BindingKind[BindingKind["ClassName"] = 1] = "ClassName";
    /**
     * Style bindings.
     */
    BindingKind[BindingKind["StyleProperty"] = 2] = "StyleProperty";
    /**
     * Dynamic property bindings.
     */
    BindingKind[BindingKind["Property"] = 3] = "Property";
    /**
     * Property or attribute bindings on a template.
     */
    BindingKind[BindingKind["Template"] = 4] = "Template";
    /**
     * Internationalized attributes.
     */
    BindingKind[BindingKind["I18n"] = 5] = "I18n";
    /**
     * Animation property bindings.
     */
    BindingKind[BindingKind["Animation"] = 6] = "Animation";
    /**
     * Property side of a two-way binding.
     */
    BindingKind[BindingKind["TwoWayProperty"] = 7] = "TwoWayProperty";
})(BindingKind || (BindingKind = {}));
/**
 * Enumeration of possible times i18n params can be resolved.
 */
export var I18nParamResolutionTime;
(function (I18nParamResolutionTime) {
    /**
     * Param is resolved at message creation time. Most params should be resolved at message creation
     * time. However, ICU params need to be handled in post-processing.
     */
    I18nParamResolutionTime[I18nParamResolutionTime["Creation"] = 0] = "Creation";
    /**
     * Param is resolved during post-processing. This should be used for params whose value comes from
     * an ICU.
     */
    I18nParamResolutionTime[I18nParamResolutionTime["Postproccessing"] = 1] = "Postproccessing";
})(I18nParamResolutionTime || (I18nParamResolutionTime = {}));
/**
 * The contexts in which an i18n expression can be used.
 */
export var I18nExpressionFor;
(function (I18nExpressionFor) {
    /**
     * This expression is used as a value (i.e. inside an i18n block).
     */
    I18nExpressionFor[I18nExpressionFor["I18nText"] = 0] = "I18nText";
    /**
     * This expression is used in a binding.
     */
    I18nExpressionFor[I18nExpressionFor["I18nAttribute"] = 1] = "I18nAttribute";
})(I18nExpressionFor || (I18nExpressionFor = {}));
/**
 * Flags that describe what an i18n param value. These determine how the value is serialized into
 * the final map.
 */
export var I18nParamValueFlags;
(function (I18nParamValueFlags) {
    I18nParamValueFlags[I18nParamValueFlags["None"] = 0] = "None";
    /**
     *  This value represents an element tag.
     */
    I18nParamValueFlags[I18nParamValueFlags["ElementTag"] = 1] = "ElementTag";
    /**
     * This value represents a template tag.
     */
    I18nParamValueFlags[I18nParamValueFlags["TemplateTag"] = 2] = "TemplateTag";
    /**
     * This value represents the opening of a tag.
     */
    I18nParamValueFlags[I18nParamValueFlags["OpenTag"] = 4] = "OpenTag";
    /**
     * This value represents the closing of a tag.
     */
    I18nParamValueFlags[I18nParamValueFlags["CloseTag"] = 8] = "CloseTag";
    /**
     * This value represents an i18n expression index.
     */
    I18nParamValueFlags[I18nParamValueFlags["ExpressionIndex"] = 16] = "ExpressionIndex";
})(I18nParamValueFlags || (I18nParamValueFlags = {}));
/**
 * Whether the active namespace is HTML, MathML, or SVG mode.
 */
export var Namespace;
(function (Namespace) {
    Namespace[Namespace["HTML"] = 0] = "HTML";
    Namespace[Namespace["SVG"] = 1] = "SVG";
    Namespace[Namespace["Math"] = 2] = "Math";
})(Namespace || (Namespace = {}));
/**
 * The type of a `@defer` trigger, for use in the ir.
 */
export var DeferTriggerKind;
(function (DeferTriggerKind) {
    DeferTriggerKind[DeferTriggerKind["Idle"] = 0] = "Idle";
    DeferTriggerKind[DeferTriggerKind["Immediate"] = 1] = "Immediate";
    DeferTriggerKind[DeferTriggerKind["Timer"] = 2] = "Timer";
    DeferTriggerKind[DeferTriggerKind["Hover"] = 3] = "Hover";
    DeferTriggerKind[DeferTriggerKind["Interaction"] = 4] = "Interaction";
    DeferTriggerKind[DeferTriggerKind["Viewport"] = 5] = "Viewport";
})(DeferTriggerKind || (DeferTriggerKind = {}));
/**
 * Kinds of i18n contexts. They can be created because of root i18n blocks, or ICUs.
 */
export var I18nContextKind;
(function (I18nContextKind) {
    I18nContextKind[I18nContextKind["RootI18n"] = 0] = "RootI18n";
    I18nContextKind[I18nContextKind["Icu"] = 1] = "Icu";
    I18nContextKind[I18nContextKind["Attr"] = 2] = "Attr";
})(I18nContextKind || (I18nContextKind = {}));
export var TemplateKind;
(function (TemplateKind) {
    TemplateKind[TemplateKind["NgTemplate"] = 0] = "NgTemplate";
    TemplateKind[TemplateKind["Structural"] = 1] = "Structural";
    TemplateKind[TemplateKind["Block"] = 2] = "Block";
})(TemplateKind || (TemplateKind = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW51bXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvdGVtcGxhdGUvcGlwZWxpbmUvaXIvc3JjL2VudW1zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVIOzs7O0dBSUc7QUFDSCxNQUFNLENBQU4sSUFBWSxNQW1QWDtBQW5QRCxXQUFZLE1BQU07SUFDaEI7OztPQUdHO0lBQ0gseUNBQU8sQ0FBQTtJQUVQOztPQUVHO0lBQ0gsNkNBQVMsQ0FBQTtJQUVUOztPQUVHO0lBQ0gsMkNBQVEsQ0FBQTtJQUVSOztPQUVHO0lBQ0gsbURBQVksQ0FBQTtJQUVaOztPQUVHO0lBQ0gseUNBQU8sQ0FBQTtJQUVQOztPQUVHO0lBQ0gsMkNBQVEsQ0FBQTtJQUVSOztPQUVHO0lBQ0gsK0NBQVUsQ0FBQTtJQUVWOztPQUVHO0lBQ0gsdURBQWMsQ0FBQTtJQUVkOztPQUVHO0lBQ0gsNkNBQVMsQ0FBQTtJQUVUOztPQUVHO0lBQ0gsbURBQVksQ0FBQTtJQUVaOzs7T0FHRztJQUNILDBEQUFlLENBQUE7SUFFZjs7T0FFRztJQUNILGtEQUFXLENBQUE7SUFFWDs7T0FFRztJQUNILHdEQUFjLENBQUE7SUFFZDs7T0FFRztJQUNILG9DQUFJLENBQUE7SUFFSjs7T0FFRztJQUNILDRDQUFRLENBQUE7SUFFUjs7T0FFRztJQUNILDBEQUFlLENBQUE7SUFFZjs7O09BR0c7SUFDSCwwQ0FBTyxDQUFBO0lBRVA7O09BRUc7SUFDSCw0Q0FBUSxDQUFBO0lBRVI7O09BRUc7SUFDSCw4Q0FBUyxDQUFBO0lBRVQ7O09BRUc7SUFDSCw4Q0FBUyxDQUFBO0lBRVQ7O09BRUc7SUFDSCw0Q0FBUSxDQUFBO0lBRVI7O09BRUc7SUFDSCw0Q0FBUSxDQUFBO0lBRVI7O09BRUc7SUFDSCwwQ0FBTyxDQUFBO0lBRVA7O09BRUc7SUFDSCxvQ0FBSSxDQUFBO0lBRUo7O09B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QTtJQUVqQjs7T0FFRztJQUNILG9GQUF5QixDQUFBO0FBQzNCLENBQUMsRUEzQlcsbUJBQW1CLEtBQW5CLG1CQUFtQixRQTJCOUI7QUFFRDs7R0FFRztBQUNILE1BQU0sQ0FBTixJQUFZLFNBSVg7QUFKRCxXQUFZLFNBQVM7SUFDbkIseUNBQUksQ0FBQTtJQUNKLHVDQUFHLENBQUE7SUFDSCx5Q0FBSSxDQUFBO0FBQ04sQ0FBQyxFQUpXLFNBQVMsS0FBVCxTQUFTLFFBSXBCO0FBRUQ7O0dBRUc7QUFDSCxNQUFNLENBQU4sSUFBWSxnQkFPWDtBQVBELFdBQVksZ0JBQWdCO0lBQzFCLHVEQUFJLENBQUE7SUFDSixpRUFBUyxDQUFBO0lBQ1QseURBQUssQ0FBQTtJQUNMLHlEQUFLLENBQUE7SUFDTCxxRUFBVyxDQUFBO0lBQ1gsK0RBQVEsQ0FBQTtBQUNWLENBQUMsRUFQVyxnQkFBZ0IsS0FBaEIsZ0JBQWdCLFFBTzNCO0FBRUQ7O0dBRUc7QUFDSCxNQUFNLENBQU4sSUFBWSxlQUlYO0FBSkQsV0FBWSxlQUFlO0lBQ3pCLDZEQUFRLENBQUE7SUFDUixtREFBRyxDQUFBO0lBQ0gscURBQUksQ0FBQTtBQUNOLENBQUMsRUFKVyxlQUFlLEtBQWYsZUFBZSxRQUkxQjtBQUVELE1BQU0sQ0FBTixJQUFZLFlBSVg7QUFKRCxXQUFZLFlBQVk7SUFDdEIsMkRBQVUsQ0FBQTtJQUNWLDJEQUFVLENBQUE7SUFDVixpREFBSyxDQUFBO0FBQ1AsQ0FBQyxFQUpXLFlBQVksS0FBWixZQUFZLFFBSXZCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8qKlxuICogRGlzdGluZ3Vpc2hlcyBkaWZmZXJlbnQga2luZHMgb2YgSVIgb3BlcmF0aW9ucy5cbiAqXG4gKiBJbmNsdWRlcyBib3RoIGNyZWF0aW9uIGFuZCB1cGRhdGUgb3BlcmF0aW9ucy5cbiAqL1xuZXhwb3J0IGVudW0gT3BLaW5kIHtcbiAgLyoqXG4gICAqIEEgc3BlY2lhbCBvcGVyYXRpb24gdHlwZSB3aGljaCBpcyB1c2VkIHRvIHJlcHJlc2VudCB0aGUgYmVnaW5uaW5nIGFuZCBlbmQgbm9kZXMgb2YgYSBsaW5rZWRcbiAgICogbGlzdCBvZiBvcGVyYXRpb25zLlxuICAgKi9cbiAgTGlzdEVuZCxcblxuICAvKipcbiAgICogQW4gb3BlcmF0aW9uIHdoaWNoIHdyYXBzIGFuIG91dHB1dCBBU1Qgc3RhdGVtZW50LlxuICAgKi9cbiAgU3RhdGVtZW50LFxuXG4gIC8qKlxuICAgKiBBbiBvcGVyYXRpb24gd2hpY2ggZGVjbGFyZXMgYW5kIGluaXRpYWxpemVzIGEgYFNlbWFudGljVmFyaWFibGVgLlxuICAgKi9cbiAgVmFyaWFibGUsXG5cbiAgLyoqXG4gICAqIEFuIG9wZXJhdGlvbiB0byBiZWdpbiByZW5kZXJpbmcgb2YgYW4gZWxlbWVudC5cbiAgICovXG4gIEVsZW1lbnRTdGFydCxcblxuICAvKipcbiAgICogQW4gb3BlcmF0aW9uIHRvIHJlbmRlciBhbiBlbGVtZW50IHdpdGggbm8gY2hpbGRyZW4uXG4gICAqL1xuICBFbGVtZW50LFxuXG4gIC8qKlxuICAgKiBBbiBvcGVyYXRpb24gd2hpY2ggZGVjbGFyZXMgYW4gZW1iZWRkZWQgdmlldy5cbiAgICovXG4gIFRlbXBsYXRlLFxuXG4gIC8qKlxuICAgKiBBbiBvcGVyYXRpb24gdG8gZW5kIHJlbmRlcmluZyBvZiBhbiBlbGVtZW50IHByZXZpb3VzbHkgc3RhcnRlZCB3aXRoIGBFbGVtZW50U3RhcnRgLlxuICAgKi9cbiAgRWxlbWVudEVuZCxcblxuICAvKipcbiAgICogQW4gb3BlcmF0aW9uIHRvIGJlZ2luIGFuIGBuZy1jb250YWluZXJgLlxuICAgKi9cbiAgQ29udGFpbmVyU3RhcnQsXG5cbiAgLyoqXG4gICAqIEFuIG9wZXJhdGlvbiBmb3IgYW4gYG5nLWNvbnRhaW5lcmAgd2l0aCBubyBjaGlsZHJlbi5cbiAgICovXG4gIENvbnRhaW5lcixcblxuICAvKipcbiAgICogQW4gb3BlcmF0aW9uIHRvIGVuZCBhbiBgbmctY29udGFpbmVyYC5cbiAgICovXG4gIENvbnRhaW5lckVuZCxcblxuICAvKipcbiAgICogQW4gb3BlcmF0aW9uIGRpc2FibGUgYmluZGluZyBmb3Igc3Vic2VxdWVudCBlbGVtZW50cywgd2hpY2ggYXJlIGRlc2NlbmRhbnRzIG9mIGEgbm9uLWJpbmRhYmxlXG4gICAqIG5vZGUuXG4gICAqL1xuICBEaXNhYmxlQmluZGluZ3MsXG5cbiAgLyoqXG4gICAqIEFuIG9wIHRvIGNvbmRpdGlvbmFsbHkgcmVuZGVyIGEgdGVtcGxhdGUuXG4gICAqL1xuICBDb25kaXRpb25hbCxcblxuICAvKipcbiAgICogQW4gb3BlcmF0aW9uIHRvIHJlLWVuYWJsZSBiaW5kaW5nLCBhZnRlciBpdCB3YXMgcHJldmlvdXNseSBkaXNhYmxlZC5cbiAgICovXG4gIEVuYWJsZUJpbmRpbmdzLFxuXG4gIC8qKlxuICAgKiBBbiBvcGVyYXRpb24gdG8gcmVuZGVyIGEgdGV4dCBub2RlLlxuICAgKi9cbiAgVGV4dCxcblxuICAvKipcbiAgICogQW4gb3BlcmF0aW9uIGRlY2xhcmluZyBhbiBldmVudCBsaXN0ZW5lciBmb3IgYW4gZWxlbWVudC5cbiAgICovXG4gIExpc3RlbmVyLFxuXG4gIC8qKlxuICAgKiBBbiBvcGVyYXRpb24gdG8gaW50ZXJwb2xhdGUgdGV4dCBpbnRvIGEgdGV4dCBub2RlLlxuICAgKi9cbiAgSW50ZXJwb2xhdGVUZXh0LFxuXG4gIC8qKlxuICAgKiBBbiBpbnRlcm1lZGlhdGUgYmluZGluZyBvcCwgdGhhdCBoYXMgbm90IHlldCBiZWVuIHByb2Nlc3NlZCBpbnRvIGFuIGluZGl2aWR1YWwgcHJvcGVydHksXG4gICAqIGF0dHJpYnV0ZSwgc3R5bGUsIGV0Yy5cbiAgICovXG4gIEJpbmRpbmcsXG5cbiAgLyoqXG4gICAqIEFuIG9wZXJhdGlvbiB0byBiaW5kIGFuIGV4cHJlc3Npb24gdG8gYSBwcm9wZXJ0eSBvZiBhbiBlbGVtZW50LlxuICAgKi9cbiAgUHJvcGVydHksXG5cbiAgLyoqXG4gICAqIEFuIG9wZXJhdGlvbiB0byBiaW5kIGFuIGV4cHJlc3Npb24gdG8gYSBzdHlsZSBwcm9wZXJ0eSBvZiBhbiBlbGVtZW50LlxuICAgKi9cbiAgU3R5bGVQcm9wLFxuXG4gIC8qKlxuICAgKiBBbiBvcGVyYXRpb24gdG8gYmluZCBhbiBleHByZXNzaW9uIHRvIGEgY2xhc3MgcHJvcGVydHkgb2YgYW4gZWxlbWVudC5cbiAgICovXG4gIENsYXNzUHJvcCxcblxuICAvKipcbiAgICogQW4gb3BlcmF0aW9uIHRvIGJpbmQgYW4gZXhwcmVzc2lvbiB0byB0aGUgc3R5bGVzIG9mIGFuIGVsZW1lbnQuXG4gICAqL1xuICBTdHlsZU1hcCxcblxuICAvKipcbiAgICogQW4gb3BlcmF0aW9uIHRvIGJpbmQgYW4gZXhwcmVzc2lvbiB0byB0aGUgY2xhc3NlcyBvZiBhbiBlbGVtZW50LlxuICAgKi9cbiAgQ2xhc3NNYXAsXG5cbiAgLyoqXG4gICAqIEFuIG9wZXJhdGlvbiB0byBhZHZhbmNlIHRoZSBydW50aW1lJ3MgaW1wbGljaXQgc2xvdCBjb250ZXh0IGR1cmluZyB0aGUgdXBkYXRlIHBoYXNlIG9mIGEgdmlldy5cbiAgICovXG4gIEFkdmFuY2UsXG5cbiAgLyoqXG4gICAqIEFuIG9wZXJhdGlvbiB0byBpbnN0YW50aWF0ZSBhIHBpcGUuXG4gICAqL1xuICBQaXBlLFxuXG4gIC8qKlxuICAgKiBBbiBvcGVyYXRpb24gdG8gYXNzb2NpYXRlIGFuIGF0dHJpYnV0ZSB3aXRoIGFuIGVsZW1lbnQuXG4gICAqL1xuICBBdHRyaWJ1dGUsXG5cbiAgLyoqXG4gICAqIEFuIGF0dHJpYnV0ZSB0aGF0IGhhcyBiZWVuIGV4dHJhY3RlZCBmb3IgaW5jbHVzaW9uIGluIHRoZSBjb25zdHMgYXJyYXkuXG4gICAqL1xuICBFeHRyYWN0ZWRBdHRyaWJ1dGUsXG5cbiAgLyoqXG4gICAqIEFuIG9wZXJhdGlvbiB0aGF0IGNvbmZpZ3VyZXMgYSBgQGRlZmVyYCBibG9jay5cbiAgICovXG4gIERlZmVyLFxuXG4gIC8qKlxuICAgKiBBbiBvcGVyYXRpb24gdGhhdCBjb250cm9scyB3aGVuIGEgYEBkZWZlcmAgbG9hZHMuXG4gICAqL1xuICBEZWZlck9uLFxuXG4gIC8qKlxuICAgKiBBbiBvcGVyYXRpb24gdGhhdCBjb250cm9scyB3aGVuIGEgYEBkZWZlcmAgbG9hZHMsIHVzaW5nIGEgY3VzdG9tIGV4cHJlc3Npb24gYXMgdGhlIGNvbmRpdGlvbi5cbiAgICovXG4gIERlZmVyV2hlbixcblxuICAvKipcbiAgICogQW4gaTE4biBtZXNzYWdlIHRoYXQgaGFzIGJlZW4gZXh0cmFjdGVkIGZvciBpbmNsdXNpb24gaW4gdGhlIGNvbnN0cyBhcnJheS5cbiAgICovXG4gIEkxOG5NZXNzYWdlLFxuXG4gIC8qKlxuICAgKiBBIGhvc3QgYmluZGluZyBwcm9wZXJ0eS5cbiAgICovXG4gIEhvc3RQcm9wZXJ0eSxcblxuICAvKipcbiAgICogQSBuYW1lc3BhY2UgY2hhbmdlLCB3aGljaCBjYXVzZXMgdGhlIHN1YnNlcXVlbnQgZWxlbWVudHMgdG8gYmUgcHJvY2Vzc2VkIGFzIGVpdGhlciBIVE1MIG9yIFNWRy5cbiAgICovXG4gIE5hbWVzcGFjZSxcblxuICAvKipcbiAgICogQ29uZmlndXJlIGEgY29udGVudCBwcm9qZWNpdG9uIGRlZmluaXRpb24gZm9yIHRoZSB2aWV3LlxuICAgKi9cbiAgUHJvamVjdGlvbkRlZixcblxuICAvKipcbiAgICogQ3JlYXRlIGEgY29udGVudCBwcm9qZWN0aW9uIHNsb3QuXG4gICAqL1xuICBQcm9qZWN0aW9uLFxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSByZXBlYXRlciBjcmVhdGlvbiBpbnN0cnVjdGlvbiBvcC5cbiAgICovXG4gIFJlcGVhdGVyQ3JlYXRlLFxuXG4gIC8qKlxuICAgKiBBbiB1cGRhdGUgdXAgZm9yIGEgcmVwZWF0ZXIuXG4gICAqL1xuICBSZXBlYXRlcixcblxuICAvKipcbiAgICogQW4gb3BlcmF0aW9uIHRvIGJpbmQgYW4gZXhwcmVzc2lvbiB0byB0aGUgcHJvcGVydHkgc2lkZSBvZiBhIHR3by13YXkgYmluZGluZy5cbiAgICovXG4gIFR3b1dheVByb3BlcnR5LFxuXG4gIC8qKlxuICAgKiBBbiBvcGVyYXRpb24gZGVjbGFyaW5nIHRoZSBldmVudCBzaWRlIG9mIGEgdHdvLXdheSBiaW5kaW5nLlxuICAgKi9cbiAgVHdvV2F5TGlzdGVuZXIsXG5cbiAgLyoqXG4gICAqIFRoZSBzdGFydCBvZiBhbiBpMThuIGJsb2NrLlxuICAgKi9cbiAgSTE4blN0YXJ0LFxuXG4gIC8qKlxuICAgKiBBIHNlbGYtY2xvc2luZyBpMThuIG9uIGEgc2luZ2xlIGVsZW1lbnQuXG4gICAqL1xuICBJMThuLFxuXG4gIC8qKlxuICAgKiBUaGUgZW5kIG9mIGFuIGkxOG4gYmxvY2suXG4gICAqL1xuICBJMThuRW5kLFxuXG4gIC8qKlxuICAgKiBBbiBleHByZXNzaW9uIGluIGFuIGkxOG4gbWVzc2FnZS5cbiAgICovXG4gIEkxOG5FeHByZXNzaW9uLFxuXG4gIC8qKlxuICAgKiBBbiBpbnN0cnVjdGlvbiB0aGF0IGFwcGxpZXMgYSBzZXQgb2YgaTE4biBleHByZXNzaW9ucy5cbiAgICovXG4gIEkxOG5BcHBseSxcblxuICAvKipcbiAgICogQW4gaW5zdHJ1Y3Rpb24gdG8gY3JlYXRlIGFuIElDVSBleHByZXNzaW9uLlxuICAgKi9cbiAgSWN1U3RhcnQsXG5cbiAgLyoqXG4gICAqIEFuIGluc3RydWN0aW9uIHRvIHVwZGF0ZSBhbiBJQ1UgZXhwcmVzc2lvbi5cbiAgICovXG4gIEljdUVuZCxcblxuICAvKipcbiAgICogQW4gaW5zdHJ1Y3Rpb24gcmVwcmVzZW50aW5nIGEgcGxhY2Vob2xkZXIgaW4gYW4gSUNVIGV4cHJlc3Npb24uXG4gICAqL1xuICBJY3VQbGFjZWhvbGRlcixcblxuICAvKipcbiAgICogQW4gaTE4biBjb250ZXh0IGNvbnRhaW5pbmcgaW5mb3JtYXRpb24gbmVlZGVkIHRvIGdlbmVyYXRlIGFuIGkxOG4gbWVzc2FnZS5cbiAgICovXG4gIEkxOG5Db250ZXh0LFxuXG4gIC8qKlxuICAgKiBBIGNyZWF0aW9uIG9wIHRoYXQgY29ycmVzcG9uZHMgdG8gaTE4biBhdHRyaWJ1dGVzIG9uIGFuIGVsZW1lbnQuXG4gICAqL1xuICBJMThuQXR0cmlidXRlcyxcbn1cblxuLyoqXG4gKiBEaXN0aW5ndWlzaGVzIGRpZmZlcmVudCBraW5kcyBvZiBJUiBleHByZXNzaW9ucy5cbiAqL1xuZXhwb3J0IGVudW0gRXhwcmVzc2lvbktpbmQge1xuICAvKipcbiAgICogUmVhZCBvZiBhIHZhcmlhYmxlIGluIGEgbGV4aWNhbCBzY29wZS5cbiAgICovXG4gIExleGljYWxSZWFkLFxuXG4gIC8qKlxuICAgKiBBIHJlZmVyZW5jZSB0byB0aGUgY3VycmVudCB2aWV3IGNvbnRleHQuXG4gICAqL1xuICBDb250ZXh0LFxuXG4gIC8qKlxuICAgKiBBIHJlZmVyZW5jZSB0byB0aGUgdmlldyBjb250ZXh0LCBmb3IgdXNlIGluc2lkZSBhIHRyYWNrIGZ1bmN0aW9uLlxuICAgKi9cbiAgVHJhY2tDb250ZXh0LFxuXG4gIC8qKlxuICAgKiBSZWFkIG9mIGEgdmFyaWFibGUgZGVjbGFyZWQgaW4gYSBgVmFyaWFibGVPcGAuXG4gICAqL1xuICBSZWFkVmFyaWFibGUsXG5cbiAgLyoqXG4gICAqIFJ1bnRpbWUgb3BlcmF0aW9uIHRvIG5hdmlnYXRlIHRvIHRoZSBuZXh0IHZpZXcgY29udGV4dCBpbiB0aGUgdmlldyBoaWVyYXJjaHkuXG4gICAqL1xuICBOZXh0Q29udGV4dCxcblxuICAvKipcbiAgICogUnVudGltZSBvcGVyYXRpb24gdG8gcmV0cmlldmUgdGhlIHZhbHVlIG9mIGEgbG9jYWwgcmVmZXJlbmNlLlxuICAgKi9cbiAgUmVmZXJlbmNlLFxuXG4gIC8qKlxuICAgKiBSdW50aW1lIG9wZXJhdGlvbiB0byBzbmFwc2hvdCB0aGUgY3VycmVudCB2aWV3IGNvbnRleHQuXG4gICAqL1xuICBHZXRDdXJyZW50VmlldyxcblxuICAvKipcbiAgICogUnVudGltZSBvcGVyYXRpb24gdG8gcmVzdG9yZSBhIHNuYXBzaG90dGVkIHZpZXcuXG4gICAqL1xuICBSZXN0b3JlVmlldyxcblxuICAvKipcbiAgICogUnVudGltZSBvcGVyYXRpb24gdG8gcmVzZXQgdGhlIGN1cnJlbnQgdmlldyBjb250ZXh0IGFmdGVyIGBSZXN0b3JlVmlld2AuXG4gICAqL1xuICBSZXNldFZpZXcsXG5cbiAgLyoqXG4gICAqIERlZmluZXMgYW5kIGNhbGxzIGEgZnVuY3Rpb24gd2l0aCBjaGFuZ2UtZGV0ZWN0ZWQgYXJndW1lbnRzLlxuICAgKi9cbiAgUHVyZUZ1bmN0aW9uRXhwcixcblxuICAvKipcbiAgICogSW5kaWNhdGVzIGEgcG9zaXRpb25hbCBwYXJhbWV0ZXIgdG8gYSBwdXJlIGZ1bmN0aW9uIGRlZmluaXRpb24uXG4gICAqL1xuICBQdXJlRnVuY3Rpb25QYXJhbWV0ZXJFeHByLFxuXG4gIC8qKlxuICAgKiBCaW5kaW5nIHRvIGEgcGlwZSB0cmFuc2Zvcm1hdGlvbi5cbiAgICovXG4gIFBpcGVCaW5kaW5nLFxuXG4gIC8qKlxuICAgKiBCaW5kaW5nIHRvIGEgcGlwZSB0cmFuc2Zvcm1hdGlvbiB3aXRoIGEgdmFyaWFibGUgbnVtYmVyIG9mIGFyZ3VtZW50cy5cbiAgICovXG4gIFBpcGVCaW5kaW5nVmFyaWFkaWMsXG5cbiAgLypcbiAgICogQSBzYWZlIHByb3BlcnR5IHJlYWQgcmVxdWlyaW5nIGV4cGFuc2lvbiBpbnRvIGEgbnVsbCBjaGVjay5cbiAgICovXG4gIFNhZmVQcm9wZXJ0eVJlYWQsXG5cbiAgLyoqXG4gICAqIEEgc2FmZSBrZXllZCByZWFkIHJlcXVpcmluZyBleHBhbnNpb24gaW50byBhIG51bGwgY2hlY2suXG4gICAqL1xuICBTYWZlS2V5ZWRSZWFkLFxuXG4gIC8qKlxuICAgKiBBIHNhZmUgZnVuY3Rpb24gY2FsbCByZXF1aXJpbmcgZXhwYW5zaW9uIGludG8gYSBudWxsIGNoZWNrLlxuICAgKi9cbiAgU2FmZUludm9rZUZ1bmN0aW9uLFxuXG4gIC8qKlxuICAgKiBBbiBpbnRlcm1lZGlhdGUgZXhwcmVzc2lvbiB0aGF0IHdpbGwgYmUgZXhwYW5kZWQgZnJvbSBhIHNhZmUgcmVhZCBpbnRvIGFuIGV4cGxpY2l0IHRlcm5hcnkuXG4gICAqL1xuICBTYWZlVGVybmFyeUV4cHIsXG5cbiAgLyoqXG4gICAqIEFuIGVtcHR5IGV4cHJlc3Npb24gdGhhdCB3aWxsIGJlIHN0aXBwZWQgYmVmb3JlIGdlbmVyYXRpbmcgdGhlIGZpbmFsIG91dHB1dC5cbiAgICovXG4gIEVtcHR5RXhwcixcblxuICAvKlxuICAgKiBBbiBhc3NpZ25tZW50IHRvIGEgdGVtcG9yYXJ5IHZhcmlhYmxlLlxuICAgKi9cbiAgQXNzaWduVGVtcG9yYXJ5RXhwcixcblxuICAvKipcbiAgICogQSByZWZlcmVuY2UgdG8gYSB0ZW1wb3JhcnkgdmFyaWFibGUuXG4gICAqL1xuICBSZWFkVGVtcG9yYXJ5RXhwcixcblxuICAvKipcbiAgICogQW4gZXhwcmVzc2lvbiB0aGF0IHdpbGwgY2F1c2UgYSBsaXRlcmFsIHNsb3QgaW5kZXggdG8gYmUgZW1pdHRlZC5cbiAgICovXG4gIFNsb3RMaXRlcmFsRXhwcixcblxuICAvKipcbiAgICogQSB0ZXN0IGV4cHJlc3Npb24gZm9yIGEgY29uZGl0aW9uYWwgb3AuXG4gICAqL1xuICBDb25kaXRpb25hbENhc2UsXG5cbiAgLyoqXG4gICAqIEFuIGV4cHJlc3Npb24gdGhhdCB3aWxsIGJlIGF1dG9tYXRpY2FsbHkgZXh0cmFjdGVkIHRvIHRoZSBjb21wb25lbnQgY29uc3QgYXJyYXkuXG4gICAqL1xuICBDb25zdENvbGxlY3RlZCxcblxuICAvKipcbiAgICogT3BlcmF0aW9uIHRoYXQgc2V0cyB0aGUgdmFsdWUgb2YgYSB0d28td2F5IGJpbmRpbmcuXG4gICAqL1xuICBUd29XYXlCaW5kaW5nU2V0LFxufVxuXG5leHBvcnQgZW51bSBWYXJpYWJsZUZsYWdzIHtcbiAgTm9uZSA9IDBiMDAwMCxcblxuICAvKipcbiAgICogQWx3YXlzIGlubGluZSB0aGlzIHZhcmlhYmxlLCByZWdhcmRsZXNzIG9mIHRoZSBudW1iZXIgb2YgdGltZXMgaXQncyB1c2VkLlxuICAgKiBBbiBgQWx3YXlzSW5saW5lYCB2YXJpYWJsZSBtYXkgbm90IGRlcGVuZCBvbiBjb250ZXh0LCBiZWNhdXNlIGRvaW5nIHNvIG1heSBjYXVzZSBzaWRlIGVmZmVjdHNcbiAgICogdGhhdCBhcmUgaWxsZWdhbCB3aGVuIG11bHRpLWlubGluZWQuIChUaGUgb3B0aW1pemVyIHdpbGwgZW5mb3JjZSB0aGlzIGNvbnN0cmFpbnQuKVxuICAgKi9cbiAgQWx3YXlzSW5saW5lID0gMGIwMDAxLFxufVxuLyoqXG4gKiBEaXN0aW5ndWlzaGVzIGJldHdlZW4gZGlmZmVyZW50IGtpbmRzIG9mIGBTZW1hbnRpY1ZhcmlhYmxlYHMuXG4gKi9cbmV4cG9ydCBlbnVtIFNlbWFudGljVmFyaWFibGVLaW5kIHtcbiAgLyoqXG4gICAqIFJlcHJlc2VudHMgdGhlIGNvbnRleHQgb2YgYSBwYXJ0aWN1bGFyIHZpZXcuXG4gICAqL1xuICBDb250ZXh0LFxuXG4gIC8qKlxuICAgKiBSZXByZXNlbnRzIGFuIGlkZW50aWZpZXIgZGVjbGFyZWQgaW4gdGhlIGxleGljYWwgc2NvcGUgb2YgYSB2aWV3LlxuICAgKi9cbiAgSWRlbnRpZmllcixcblxuICAvKipcbiAgICogUmVwcmVzZW50cyBhIHNhdmVkIHN0YXRlIHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVzdG9yZSBhIHZpZXcgaW4gYSBsaXN0ZW5lciBoYW5kbGVyIGZ1bmN0aW9uLlxuICAgKi9cbiAgU2F2ZWRWaWV3LFxuXG4gIC8qKlxuICAgKiBBbiBhbGlhcyBnZW5lcmF0ZWQgYnkgYSBzcGVjaWFsIGVtYmVkZGVkIHZpZXcgdHlwZSAoZS5nLiBhIGBAZm9yYCBibG9jaykuXG4gICAqL1xuICBBbGlhcyxcbn1cblxuLyoqXG4gKiBXaGV0aGVyIHRvIGNvbXBpbGUgaW4gY29tcGF0aWJpbHR5IG1vZGUuIEluIGNvbXBhdGliaWxpdHkgbW9kZSwgdGhlIHRlbXBsYXRlIHBpcGVsaW5lIHdpbGxcbiAqIGF0dGVtcHQgdG8gbWF0Y2ggdGhlIG91dHB1dCBvZiBgVGVtcGxhdGVEZWZpbml0aW9uQnVpbGRlcmAgYXMgZXhhY3RseSBhcyBwb3NzaWJsZSwgYXQgdGhlIGNvc3RcbiAqIG9mIHByb2R1Y2luZyBxdWlya3kgb3IgbGFyZ2VyIGNvZGUgaW4gc29tZSBjYXNlcy5cbiAqL1xuZXhwb3J0IGVudW0gQ29tcGF0aWJpbGl0eU1vZGUge1xuICBOb3JtYWwsXG4gIFRlbXBsYXRlRGVmaW5pdGlvbkJ1aWxkZXIsXG59XG5cbi8qKlxuICogRW51bWVyYXRpb24gb2YgdGhlIHR5cGVzIG9mIGF0dHJpYnV0ZXMgd2hpY2ggY2FuIGJlIGFwcGxpZWQgdG8gYW4gZWxlbWVudC5cbiAqL1xuZXhwb3J0IGVudW0gQmluZGluZ0tpbmQge1xuICAvKipcbiAgICogU3RhdGljIGF0dHJpYnV0ZXMuXG4gICAqL1xuICBBdHRyaWJ1dGUsXG5cbiAgLyoqXG4gICAqIENsYXNzIGJpbmRpbmdzLlxuICAgKi9cbiAgQ2xhc3NOYW1lLFxuXG4gIC8qKlxuICAgKiBTdHlsZSBiaW5kaW5ncy5cbiAgICovXG4gIFN0eWxlUHJvcGVydHksXG5cbiAgLyoqXG4gICAqIER5bmFtaWMgcHJvcGVydHkgYmluZGluZ3MuXG4gICAqL1xuICBQcm9wZXJ0eSxcblxuICAvKipcbiAgICogUHJvcGVydHkgb3IgYXR0cmlidXRlIGJpbmRpbmdzIG9uIGEgdGVtcGxhdGUuXG4gICAqL1xuICBUZW1wbGF0ZSxcblxuICAvKipcbiAgICogSW50ZXJuYXRpb25hbGl6ZWQgYXR0cmlidXRlcy5cbiAgICovXG4gIEkxOG4sXG5cbiAgLyoqXG4gICAqIEFuaW1hdGlvbiBwcm9wZXJ0eSBiaW5kaW5ncy5cbiAgICovXG4gIEFuaW1hdGlvbixcblxuICAvKipcbiAgICogUHJvcGVydHkgc2lkZSBvZiBhIHR3by13YXkgYmluZGluZy5cbiAgICovXG4gIFR3b1dheVByb3BlcnR5LFxufVxuXG4vKipcbiAqIEVudW1lcmF0aW9uIG9mIHBvc3NpYmxlIHRpbWVzIGkxOG4gcGFyYW1zIGNhbiBiZSByZXNvbHZlZC5cbiAqL1xuZXhwb3J0IGVudW0gSTE4blBhcmFtUmVzb2x1dGlvblRpbWUge1xuICAvKipcbiAgICogUGFyYW0gaXMgcmVzb2x2ZWQgYXQgbWVzc2FnZSBjcmVhdGlvbiB0aW1lLiBNb3N0IHBhcmFtcyBzaG91bGQgYmUgcmVzb2x2ZWQgYXQgbWVzc2FnZSBjcmVhdGlvblxuICAgKiB0aW1lLiBIb3dldmVyLCBJQ1UgcGFyYW1zIG5lZWQgdG8gYmUgaGFuZGxlZCBpbiBwb3N0LXByb2Nlc3NpbmcuXG4gICAqL1xuICBDcmVhdGlvbixcblxuICAvKipcbiAgICogUGFyYW0gaXMgcmVzb2x2ZWQgZHVyaW5nIHBvc3QtcHJvY2Vzc2luZy4gVGhpcyBzaG91bGQgYmUgdXNlZCBmb3IgcGFyYW1zIHdob3NlIHZhbHVlIGNvbWVzIGZyb21cbiAgICogYW4gSUNVLlxuICAgKi9cbiAgUG9zdHByb2NjZXNzaW5nXG59XG5cbi8qKlxuICogVGhlIGNvbnRleHRzIGluIHdoaWNoIGFuIGkxOG4gZXhwcmVzc2lvbiBjYW4gYmUgdXNlZC5cbiAqL1xuZXhwb3J0IGVudW0gSTE4bkV4cHJlc3Npb25Gb3Ige1xuICAvKipcbiAgICogVGhpcyBleHByZXNzaW9uIGlzIHVzZWQgYXMgYSB2YWx1ZSAoaS5lLiBpbnNpZGUgYW4gaTE4biBibG9jaykuXG4gICAqL1xuICBJMThuVGV4dCxcblxuICAvKipcbiAgICogVGhpcyBleHByZXNzaW9uIGlzIHVzZWQgaW4gYSBiaW5kaW5nLlxuICAgKi9cbiAgSTE4bkF0dHJpYnV0ZSxcbn1cblxuLyoqXG4gKiBGbGFncyB0aGF0IGRlc2NyaWJlIHdoYXQgYW4gaTE4biBwYXJhbSB2YWx1ZS4gVGhlc2UgZGV0ZXJtaW5lIGhvdyB0aGUgdmFsdWUgaXMgc2VyaWFsaXplZCBpbnRvXG4gKiB0aGUgZmluYWwgbWFwLlxuICovXG5leHBvcnQgZW51bSBJMThuUGFyYW1WYWx1ZUZsYWdzIHtcbiAgTm9uZSA9IDBiMDAwMCxcblxuICAvKipcbiAgICogIFRoaXMgdmFsdWUgcmVwcmVzZW50cyBhbiBlbGVtZW50IHRhZy5cbiAgICovXG4gIEVsZW1lbnRUYWcgPSAwYjEsXG5cbiAgLyoqXG4gICAqIFRoaXMgdmFsdWUgcmVwcmVzZW50cyBhIHRlbXBsYXRlIHRhZy5cbiAgICovXG4gIFRlbXBsYXRlVGFnID0gMGIxMCxcblxuICAvKipcbiAgICogVGhpcyB2YWx1ZSByZXByZXNlbnRzIHRoZSBvcGVuaW5nIG9mIGEgdGFnLlxuICAgKi9cbiAgT3BlblRhZyA9IDBiMDEwMCxcblxuICAvKipcbiAgICogVGhpcyB2YWx1ZSByZXByZXNlbnRzIHRoZSBjbG9zaW5nIG9mIGEgdGFnLlxuICAgKi9cbiAgQ2xvc2VUYWcgPSAwYjEwMDAsXG5cbiAgLyoqXG4gICAqIFRoaXMgdmFsdWUgcmVwcmVzZW50cyBhbiBpMThuIGV4cHJlc3Npb24gaW5kZXguXG4gICAqL1xuICBFeHByZXNzaW9uSW5kZXggPSAwYjEwMDAwXG59XG5cbi8qKlxuICogV2hldGhlciB0aGUgYWN0aXZlIG5hbWVzcGFjZSBpcyBIVE1MLCBNYXRoTUwsIG9yIFNWRyBtb2RlLlxuICovXG5leHBvcnQgZW51bSBOYW1lc3BhY2Uge1xuICBIVE1MLFxuICBTVkcsXG4gIE1hdGgsXG59XG5cbi8qKlxuICogVGhlIHR5cGUgb2YgYSBgQGRlZmVyYCB0cmlnZ2VyLCBmb3IgdXNlIGluIHRoZSBpci5cbiAqL1xuZXhwb3J0IGVudW0gRGVmZXJUcmlnZ2VyS2luZCB7XG4gIElkbGUsXG4gIEltbWVkaWF0ZSxcbiAgVGltZXIsXG4gIEhvdmVyLFxuICBJbnRlcmFjdGlvbixcbiAgVmlld3BvcnQsXG59XG5cbi8qKlxuICogS2luZHMgb2YgaTE4biBjb250ZXh0cy4gVGhleSBjYW4gYmUgY3JlYXRlZCBiZWNhdXNlIG9mIHJvb3QgaTE4biBibG9ja3MsIG9yIElDVXMuXG4gKi9cbmV4cG9ydCBlbnVtIEkxOG5Db250ZXh0S2luZCB7XG4gIFJvb3RJMThuLFxuICBJY3UsXG4gIEF0dHJcbn1cblxuZXhwb3J0IGVudW0gVGVtcGxhdGVLaW5kIHtcbiAgTmdUZW1wbGF0ZSxcbiAgU3RydWN0dXJhbCxcbiAgQmxvY2tcbn1cbiJdfQ==