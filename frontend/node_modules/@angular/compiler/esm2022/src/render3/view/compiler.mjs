/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { convertPropertyBinding } from '../../compiler_util/expression_converter';
import * as core from '../../core';
import * as o from '../../output/output_ast';
import { sanitizeIdentifier } from '../../parse_util';
import { isIframeSecuritySensitiveAttr } from '../../schema/dom_security_schema';
import { CssSelector } from '../../selector';
import { ShadowCss } from '../../shadow_css';
import { CompilationJobKind } from '../../template/pipeline/src/compilation';
import { emitHostBindingFunction, emitTemplateFn, transform } from '../../template/pipeline/src/emit';
import { ingestComponent, ingestHostBinding } from '../../template/pipeline/src/ingest';
import { USE_TEMPLATE_PIPELINE } from '../../template/pipeline/switch';
import { error } from '../../util';
import { BoundEvent } from '../r3_ast';
import { Identifiers as R3 } from '../r3_identifiers';
import { prepareSyntheticListenerFunctionName, prepareSyntheticPropertyName, typeWithParameters } from '../util';
import { createContentQueriesFunction, createViewQueriesFunction } from './query_generation';
import { MIN_STYLING_BINDING_SLOTS_REQUIRED, StylingBuilder } from './styling_builder';
import { BindingScope, makeBindingParser, prepareEventListenerParameters, renderFlagCheckIfStmt, resolveSanitizationFn, TemplateDefinitionBuilder, ValueConverter } from './template';
import { asLiteral, conditionallyCreateDirectiveBindingLiteral, CONTEXT_NAME, DefinitionMap, getInstructionStatements, RENDER_FLAGS } from './util';
// This regex matches any binding names that contain the "attr." prefix, e.g. "attr.required"
// If there is a match, the first matching group will contain the attribute name to bind.
const ATTR_REGEX = /attr\.([^\]]+)/;
const COMPONENT_VARIABLE = '%COMP%';
const HOST_ATTR = `_nghost-${COMPONENT_VARIABLE}`;
const CONTENT_ATTR = `_ngcontent-${COMPONENT_VARIABLE}`;
function baseDirectiveFields(meta, constantPool, bindingParser) {
    const definitionMap = new DefinitionMap();
    const selectors = core.parseSelectorToR3Selector(meta.selector);
    // e.g. `type: MyDirective`
    definitionMap.set('type', meta.type.value);
    // e.g. `selectors: [['', 'someDir', '']]`
    if (selectors.length > 0) {
        definitionMap.set('selectors', asLiteral(selectors));
    }
    if (meta.queries.length > 0) {
        // e.g. `contentQueries: (rf, ctx, dirIndex) => { ... }
        definitionMap.set('contentQueries', createContentQueriesFunction(meta.queries, constantPool, meta.name));
    }
    if (meta.viewQueries.length) {
        definitionMap.set('viewQuery', createViewQueriesFunction(meta.viewQueries, constantPool, meta.name));
    }
    // e.g. `hostBindings: (rf, ctx) => { ... }
    definitionMap.set('hostBindings', createHostBindingsFunction(meta.host, meta.typeSourceSpan, bindingParser, constantPool, meta.selector || '', meta.name, definitionMap));
    // e.g 'inputs: {a: 'a'}`
    definitionMap.set('inputs', conditionallyCreateDirectiveBindingLiteral(meta.inputs, true));
    // e.g 'outputs: {a: 'a'}`
    definitionMap.set('outputs', conditionallyCreateDirectiveBindingLiteral(meta.outputs));
    if (meta.exportAs !== null) {
        definitionMap.set('exportAs', o.literalArr(meta.exportAs.map(e => o.literal(e))));
    }
    if (meta.isStandalone) {
        definitionMap.set('standalone', o.literal(true));
    }
    if (meta.isSignal) {
        definitionMap.set('signals', o.literal(true));
    }
    return definitionMap;
}
/**
 * Add features to the definition map.
 */
function addFeatures(definitionMap, meta) {
    // e.g. `features: [NgOnChangesFeature]`
    const features = [];
    const providers = meta.providers;
    const viewProviders = meta.viewProviders;
    const inputKeys = Object.keys(meta.inputs);
    if (providers || viewProviders) {
        const args = [providers || new o.LiteralArrayExpr([])];
        if (viewProviders) {
            args.push(viewProviders);
        }
        features.push(o.importExpr(R3.ProvidersFeature).callFn(args));
    }
    for (const key of inputKeys) {
        if (meta.inputs[key].transformFunction !== null) {
            features.push(o.importExpr(R3.InputTransformsFeatureFeature));
            break;
        }
    }
    // Note: host directives feature needs to be inserted before the
    // inheritance feature to ensure the correct execution order.
    if (meta.hostDirectives?.length) {
        features.push(o.importExpr(R3.HostDirectivesFeature).callFn([createHostDirectivesFeatureArg(meta.hostDirectives)]));
    }
    if (meta.usesInheritance) {
        features.push(o.importExpr(R3.InheritDefinitionFeature));
    }
    if (meta.fullInheritance) {
        features.push(o.importExpr(R3.CopyDefinitionFeature));
    }
    if (meta.lifecycle.usesOnChanges) {
        features.push(o.importExpr(R3.NgOnChangesFeature));
    }
    // TODO: better way of differentiating component vs directive metadata.
    if (meta.hasOwnProperty('template') && meta.isStandalone) {
        features.push(o.importExpr(R3.StandaloneFeature));
    }
    if (features.length) {
        definitionMap.set('features', o.literalArr(features));
    }
}
/**
 * Compile a directive for the render3 runtime as defined by the `R3DirectiveMetadata`.
 */
export function compileDirectiveFromMetadata(meta, constantPool, bindingParser) {
    const definitionMap = baseDirectiveFields(meta, constantPool, bindingParser);
    addFeatures(definitionMap, meta);
    const expression = o.importExpr(R3.defineDirective).callFn([definitionMap.toLiteralMap()], undefined, true);
    const type = createDirectiveType(meta);
    return { expression, type, statements: [] };
}
/**
 * Creates an AST for a function that contains dynamic imports representing
 * deferrable dependencies.
 */
function createDeferredDepsFunction(constantPool, name, deps) {
    // This defer block has deps for which we need to generate dynamic imports.
    const dependencyExp = [];
    for (const [symbolName, { importPath, isDefaultImport }] of deps) {
        // Callback function, e.g. `m () => m.MyCmp;`.
        const innerFn = o.arrowFn([new o.FnParam('m', o.DYNAMIC_TYPE)], o.variable('m').prop(isDefaultImport ? 'default' : symbolName));
        // Dynamic import, e.g. `import('./a').then(...)`.
        const importExpr = (new o.DynamicImportExpr(importPath)).prop('then').callFn([innerFn]);
        dependencyExp.push(importExpr);
    }
    const depsFnExpr = o.arrowFn([], o.literalArr(dependencyExp));
    constantPool.statements.push(depsFnExpr.toDeclStmt(name, o.StmtModifier.Final));
    return o.variable(name);
}
/**
 * Compile a component for the render3 runtime as defined by the `R3ComponentMetadata`.
 */
export function compileComponentFromMetadata(meta, constantPool, bindingParser) {
    const definitionMap = baseDirectiveFields(meta, constantPool, bindingParser);
    addFeatures(definitionMap, meta);
    const selector = meta.selector && CssSelector.parse(meta.selector);
    const firstSelector = selector && selector[0];
    // e.g. `attr: ["class", ".my.app"]`
    // This is optional an only included if the first selector of a component specifies attributes.
    if (firstSelector) {
        const selectorAttributes = firstSelector.getAttrs();
        if (selectorAttributes.length) {
            definitionMap.set('attrs', constantPool.getConstLiteral(o.literalArr(selectorAttributes.map(value => value != null ? o.literal(value) : o.literal(undefined))), 
            /* forceShared */ true));
        }
    }
    // e.g. `template: function MyComponent_Template(_ctx, _cm) {...}`
    const templateTypeName = meta.name;
    const templateName = templateTypeName ? `${templateTypeName}_Template` : null;
    let allDeferrableDepsFn = null;
    if (meta.deferBlocks.size > 0 && meta.deferrableTypes.size > 0 &&
        meta.deferBlockDepsEmitMode === 1 /* DeferBlockDepsEmitMode.PerComponent */) {
        const fnName = `${templateTypeName}_DeferFn`;
        allDeferrableDepsFn = createDeferredDepsFunction(constantPool, fnName, meta.deferrableTypes);
    }
    // Template compilation is currently conditional as we're in the process of rewriting it.
    if (!USE_TEMPLATE_PIPELINE && !meta.useTemplatePipeline) {
        // This is the main path currently used in compilation, which compiles the template with the
        // legacy `TemplateDefinitionBuilder`.
        const template = meta.template;
        const templateBuilder = new TemplateDefinitionBuilder(constantPool, BindingScope.createRootScope(), 0, templateTypeName, null, null, templateName, R3.namespaceHTML, meta.relativeContextFilePath, meta.i18nUseExternalIds, meta.deferBlocks, new Map(), allDeferrableDepsFn);
        const templateFunctionExpression = templateBuilder.buildTemplateFunction(template.nodes, []);
        // We need to provide this so that dynamically generated components know what
        // projected content blocks to pass through to the component when it is
        //     instantiated.
        const ngContentSelectors = templateBuilder.getNgContentSelectors();
        if (ngContentSelectors) {
            definitionMap.set('ngContentSelectors', ngContentSelectors);
        }
        // e.g. `decls: 2`
        // definitionMap.set('decls', o.literal(tpl.root.decls!));
        definitionMap.set('decls', o.literal(templateBuilder.getConstCount()));
        // e.g. `vars: 2`
        // definitionMap.set('vars', o.literal(tpl.root.vars!));
        definitionMap.set('vars', o.literal(templateBuilder.getVarCount()));
        // Generate `consts` section of ComponentDef:
        // - either as an array:
        //   `consts: [['one', 'two'], ['three', 'four']]`
        // - or as a factory function in case additional statements are present (to support i18n):
        //   `consts: () => { var i18n_0; if (ngI18nClosureMode) {...} else {...} return [i18n_0];
        //   }`
        const { constExpressions, prepareStatements } = templateBuilder.getConsts();
        if (constExpressions.length > 0) {
            let constsExpr = o.literalArr(constExpressions);
            // Prepare statements are present - turn `consts` into a function.
            if (prepareStatements.length > 0) {
                constsExpr = o.arrowFn([], [...prepareStatements, new o.ReturnStatement(constsExpr)]);
            }
            definitionMap.set('consts', constsExpr);
        }
        definitionMap.set('template', templateFunctionExpression);
    }
    else {
        // This path compiles the template using the prototype template pipeline. First the template is
        // ingested into IR:
        const tpl = ingestComponent(meta.name, meta.template.nodes, constantPool, meta.relativeContextFilePath, meta.i18nUseExternalIds, meta.deferBlocks, allDeferrableDepsFn);
        // Then the IR is transformed to prepare it for cod egeneration.
        transform(tpl, CompilationJobKind.Tmpl);
        // Finally we emit the template function:
        const templateFn = emitTemplateFn(tpl, constantPool);
        if (tpl.contentSelectors !== null) {
            definitionMap.set('ngContentSelectors', tpl.contentSelectors);
        }
        definitionMap.set('decls', o.literal(tpl.root.decls));
        definitionMap.set('vars', o.literal(tpl.root.vars));
        if (tpl.consts.length > 0) {
            if (tpl.constsInitializers.length > 0) {
                definitionMap.set('consts', o.arrowFn([], [
                    ...tpl.constsInitializers, new o.ReturnStatement(o.literalArr(tpl.consts))
                ]));
            }
            else {
                definitionMap.set('consts', o.literalArr(tpl.consts));
            }
        }
        definitionMap.set('template', templateFn);
    }
    if (meta.declarationListEmitMode !== 3 /* DeclarationListEmitMode.RuntimeResolved */ &&
        meta.declarations.length > 0) {
        definitionMap.set('dependencies', compileDeclarationList(o.literalArr(meta.declarations.map(decl => decl.type)), meta.declarationListEmitMode));
    }
    else if (meta.declarationListEmitMode === 3 /* DeclarationListEmitMode.RuntimeResolved */) {
        const args = [meta.type.value];
        if (meta.rawImports) {
            args.push(meta.rawImports);
        }
        definitionMap.set('dependencies', o.importExpr(R3.getComponentDepsFactory).callFn(args));
    }
    if (meta.encapsulation === null) {
        meta.encapsulation = core.ViewEncapsulation.Emulated;
    }
    // e.g. `styles: [str1, str2]`
    if (meta.styles && meta.styles.length) {
        const styleValues = meta.encapsulation == core.ViewEncapsulation.Emulated ?
            compileStyles(meta.styles, CONTENT_ATTR, HOST_ATTR) :
            meta.styles;
        const styleNodes = styleValues.reduce((result, style) => {
            if (style.trim().length > 0) {
                result.push(constantPool.getConstLiteral(o.literal(style)));
            }
            return result;
        }, []);
        if (styleNodes.length > 0) {
            definitionMap.set('styles', o.literalArr(styleNodes));
        }
    }
    else if (meta.encapsulation === core.ViewEncapsulation.Emulated) {
        // If there is no style, don't generate css selectors on elements
        meta.encapsulation = core.ViewEncapsulation.None;
    }
    // Only set view encapsulation if it's not the default value
    if (meta.encapsulation !== core.ViewEncapsulation.Emulated) {
        definitionMap.set('encapsulation', o.literal(meta.encapsulation));
    }
    // e.g. `animation: [trigger('123', [])]`
    if (meta.animations !== null) {
        definitionMap.set('data', o.literalMap([{ key: 'animation', value: meta.animations, quoted: false }]));
    }
    // Setting change detection flag
    if (meta.changeDetection !== null) {
        if (typeof meta.changeDetection === 'number' &&
            meta.changeDetection !== core.ChangeDetectionStrategy.Default) {
            // changeDetection is resolved during analysis. Only set it if not the default.
            definitionMap.set('changeDetection', o.literal(meta.changeDetection));
        }
        else if (typeof meta.changeDetection === 'object') {
            // changeDetection is not resolved during analysis (e.g., we are in local compilation mode).
            // So place it as is.
            definitionMap.set('changeDetection', meta.changeDetection);
        }
    }
    const expression = o.importExpr(R3.defineComponent).callFn([definitionMap.toLiteralMap()], undefined, true);
    const type = createComponentType(meta);
    return { expression, type, statements: [] };
}
/**
 * Creates the type specification from the component meta. This type is inserted into .d.ts files
 * to be consumed by upstream compilations.
 */
export function createComponentType(meta) {
    const typeParams = createBaseDirectiveTypeParams(meta);
    typeParams.push(stringArrayAsType(meta.template.ngContentSelectors));
    typeParams.push(o.expressionType(o.literal(meta.isStandalone)));
    typeParams.push(createHostDirectivesType(meta));
    // TODO(signals): Always include this metadata starting with v17. Right
    // now Angular v16.0.x does not support this field and library distributions
    // would then be incompatible with v16.0.x framework users.
    if (meta.isSignal) {
        typeParams.push(o.expressionType(o.literal(meta.isSignal)));
    }
    return o.expressionType(o.importExpr(R3.ComponentDeclaration, typeParams));
}
/**
 * Compiles the array literal of declarations into an expression according to the provided emit
 * mode.
 */
function compileDeclarationList(list, mode) {
    switch (mode) {
        case 0 /* DeclarationListEmitMode.Direct */:
            // directives: [MyDir],
            return list;
        case 1 /* DeclarationListEmitMode.Closure */:
            // directives: function () { return [MyDir]; }
            return o.arrowFn([], list);
        case 2 /* DeclarationListEmitMode.ClosureResolved */:
            // directives: function () { return [MyDir].map(ng.resolveForwardRef); }
            const resolvedList = list.prop('map').callFn([o.importExpr(R3.resolveForwardRef)]);
            return o.arrowFn([], resolvedList);
        case 3 /* DeclarationListEmitMode.RuntimeResolved */:
            throw new Error(`Unsupported with an array of pre-resolved dependencies`);
    }
}
function convertAttributesToExpressions(attributes) {
    const values = [];
    for (let key of Object.getOwnPropertyNames(attributes)) {
        const value = attributes[key];
        values.push(o.literal(key), value);
    }
    return values;
}
function stringAsType(str) {
    return o.expressionType(o.literal(str));
}
function stringMapAsLiteralExpression(map) {
    const mapValues = Object.keys(map).map(key => {
        const value = Array.isArray(map[key]) ? map[key][0] : map[key];
        return {
            key,
            value: o.literal(value),
            quoted: true,
        };
    });
    return o.literalMap(mapValues);
}
function stringArrayAsType(arr) {
    return arr.length > 0 ? o.expressionType(o.literalArr(arr.map(value => o.literal(value)))) :
        o.NONE_TYPE;
}
function createBaseDirectiveTypeParams(meta) {
    // On the type side, remove newlines from the selector as it will need to fit into a TypeScript
    // string literal, which must be on one line.
    const selectorForType = meta.selector !== null ? meta.selector.replace(/\n/g, '') : null;
    return [
        typeWithParameters(meta.type.type, meta.typeArgumentCount),
        selectorForType !== null ? stringAsType(selectorForType) : o.NONE_TYPE,
        meta.exportAs !== null ? stringArrayAsType(meta.exportAs) : o.NONE_TYPE,
        o.expressionType(getInputsTypeExpression(meta)),
        o.expressionType(stringMapAsLiteralExpression(meta.outputs)),
        stringArrayAsType(meta.queries.map(q => q.propertyName)),
    ];
}
function getInputsTypeExpression(meta) {
    return o.literalMap(Object.keys(meta.inputs).map(key => {
        const value = meta.inputs[key];
        const values = [
            { key: 'alias', value: o.literal(value.bindingPropertyName), quoted: true },
            { key: 'required', value: o.literal(value.required), quoted: true },
        ];
        // TODO(legacy-partial-output-inputs): Consider always emitting this information,
        // or leaving it as is.
        if (value.isSignal) {
            values.push({ key: 'isSignal', value: o.literal(value.isSignal), quoted: true });
        }
        return { key, value: o.literalMap(values), quoted: true };
    }));
}
/**
 * Creates the type specification from the directive meta. This type is inserted into .d.ts files
 * to be consumed by upstream compilations.
 */
export function createDirectiveType(meta) {
    const typeParams = createBaseDirectiveTypeParams(meta);
    // Directives have no NgContentSelectors slot, but instead express a `never` type
    // so that future fields align.
    typeParams.push(o.NONE_TYPE);
    typeParams.push(o.expressionType(o.literal(meta.isStandalone)));
    typeParams.push(createHostDirectivesType(meta));
    // TODO(signals): Always include this metadata starting with v17. Right
    // now Angular v16.0.x does not support this field and library distributions
    // would then be incompatible with v16.0.x framework users.
    if (meta.isSignal) {
        typeParams.push(o.expressionType(o.literal(meta.isSignal)));
    }
    return o.expressionType(o.importExpr(R3.DirectiveDeclaration, typeParams));
}
// Return a host binding function or null if one is not necessary.
function createHostBindingsFunction(hostBindingsMetadata, typeSourceSpan, bindingParser, constantPool, selector, name, definitionMap) {
    const bindings = bindingParser.createBoundHostProperties(hostBindingsMetadata.properties, typeSourceSpan);
    // Calculate host event bindings
    const eventBindings = bindingParser.createDirectiveHostEventAsts(hostBindingsMetadata.listeners, typeSourceSpan);
    if (USE_TEMPLATE_PIPELINE || hostBindingsMetadata.useTemplatePipeline) {
        // The parser for host bindings treats class and style attributes specially -- they are
        // extracted into these separate fields. This is not the case for templates, so the compiler can
        // actually already handle these special attributes internally. Therefore, we just drop them
        // into the attributes map.
        if (hostBindingsMetadata.specialAttributes.styleAttr) {
            hostBindingsMetadata.attributes['style'] =
                o.literal(hostBindingsMetadata.specialAttributes.styleAttr);
        }
        if (hostBindingsMetadata.specialAttributes.classAttr) {
            hostBindingsMetadata.attributes['class'] =
                o.literal(hostBindingsMetadata.specialAttributes.classAttr);
        }
        const hostJob = ingestHostBinding({
            componentName: name,
            componentSelector: selector,
            properties: bindings,
            events: eventBindings,
            attributes: hostBindingsMetadata.attributes,
        }, bindingParser, constantPool);
        transform(hostJob, CompilationJobKind.Host);
        definitionMap.set('hostAttrs', hostJob.root.attributes);
        const varCount = hostJob.root.vars;
        if (varCount !== null && varCount > 0) {
            definitionMap.set('hostVars', o.literal(varCount));
        }
        return emitHostBindingFunction(hostJob);
    }
    let bindingId = 0;
    const getNextBindingId = () => `${bindingId++}`;
    const bindingContext = o.variable(CONTEXT_NAME);
    const styleBuilder = new StylingBuilder(bindingContext);
    const { styleAttr, classAttr } = hostBindingsMetadata.specialAttributes;
    if (styleAttr !== undefined) {
        styleBuilder.registerStyleAttr(styleAttr);
    }
    if (classAttr !== undefined) {
        styleBuilder.registerClassAttr(classAttr);
    }
    const createInstructions = [];
    const updateInstructions = [];
    const updateVariables = [];
    const hostBindingSourceSpan = typeSourceSpan;
    if (eventBindings && eventBindings.length) {
        createInstructions.push(...createHostListeners(eventBindings, name));
    }
    // Calculate the host property bindings
    const allOtherBindings = [];
    // We need to calculate the total amount of binding slots required by
    // all the instructions together before any value conversions happen.
    // Value conversions may require additional slots for interpolation and
    // bindings with pipes. These calculates happen after this block.
    let totalHostVarsCount = 0;
    bindings && bindings.forEach((binding) => {
        const stylingInputWasSet = styleBuilder.registerInputBasedOnName(binding.name, binding.expression, hostBindingSourceSpan);
        if (stylingInputWasSet) {
            totalHostVarsCount += MIN_STYLING_BINDING_SLOTS_REQUIRED;
        }
        else {
            allOtherBindings.push(binding);
            totalHostVarsCount++;
        }
    });
    let valueConverter;
    const getValueConverter = () => {
        if (!valueConverter) {
            const hostVarsCountFn = (numSlots) => {
                const originalVarsCount = totalHostVarsCount;
                totalHostVarsCount += numSlots;
                return originalVarsCount;
            };
            valueConverter = new ValueConverter(constantPool, () => error('Unexpected node'), // new nodes are illegal here
            hostVarsCountFn, () => error('Unexpected pipe')); // pipes are illegal here
        }
        return valueConverter;
    };
    const propertyBindings = [];
    const attributeBindings = [];
    const syntheticHostBindings = [];
    for (const binding of allOtherBindings) {
        // resolve literal arrays and literal objects
        const value = binding.expression.visit(getValueConverter());
        const bindingExpr = bindingFn(bindingContext, value, getNextBindingId);
        const { bindingName, instruction, isAttribute } = getBindingNameAndInstruction(binding);
        const securityContexts = bindingParser.calcPossibleSecurityContexts(selector, bindingName, isAttribute)
            .filter(context => context !== core.SecurityContext.NONE);
        let sanitizerFn = null;
        if (securityContexts.length) {
            if (securityContexts.length === 2 &&
                securityContexts.indexOf(core.SecurityContext.URL) > -1 &&
                securityContexts.indexOf(core.SecurityContext.RESOURCE_URL) > -1) {
                // Special case for some URL attributes (such as "src" and "href") that may be a part
                // of different security contexts. In this case we use special sanitization function and
                // select the actual sanitizer at runtime based on a tag name that is provided while
                // invoking sanitization function.
                sanitizerFn = o.importExpr(R3.sanitizeUrlOrResourceUrl);
            }
            else {
                sanitizerFn = resolveSanitizationFn(securityContexts[0], isAttribute);
            }
        }
        const instructionParams = [o.literal(bindingName), bindingExpr.currValExpr];
        if (sanitizerFn) {
            instructionParams.push(sanitizerFn);
        }
        else {
            // If there was no sanitization function found based on the security context
            // of an attribute/property binding - check whether this attribute/property is
            // one of the security-sensitive <iframe> attributes.
            // Note: for host bindings defined on a directive, we do not try to find all
            // possible places where it can be matched, so we can not determine whether
            // the host element is an <iframe>. In this case, if an attribute/binding
            // name is in the `IFRAME_SECURITY_SENSITIVE_ATTRS` set - append a validation
            // function, which would be invoked at runtime and would have access to the
            // underlying DOM element, check if it's an <iframe> and if so - runs extra checks.
            if (isIframeSecuritySensitiveAttr(bindingName)) {
                instructionParams.push(o.importExpr(R3.validateIframeAttribute));
            }
        }
        updateVariables.push(...bindingExpr.stmts);
        if (instruction === R3.hostProperty) {
            propertyBindings.push(instructionParams);
        }
        else if (instruction === R3.attribute) {
            attributeBindings.push(instructionParams);
        }
        else if (instruction === R3.syntheticHostProperty) {
            syntheticHostBindings.push(instructionParams);
        }
        else {
            updateInstructions.push({ reference: instruction, paramsOrFn: instructionParams, span: null });
        }
    }
    for (const bindingParams of propertyBindings) {
        updateInstructions.push({ reference: R3.hostProperty, paramsOrFn: bindingParams, span: null });
    }
    for (const bindingParams of attributeBindings) {
        updateInstructions.push({ reference: R3.attribute, paramsOrFn: bindingParams, span: null });
    }
    for (const bindingParams of syntheticHostBindings) {
        updateInstructions.push({ reference: R3.syntheticHostProperty, paramsOrFn: bindingParams, span: null });
    }
    // since we're dealing with directives/components and both have hostBinding
    // functions, we need to generate a special hostAttrs instruction that deals
    // with both the assignment of styling as well as static attributes to the host
    // element. The instruction below will instruct all initial styling (styling
    // that is inside of a host binding within a directive/component) to be attached
    // to the host element alongside any of the provided host attributes that were
    // collected earlier.
    const hostAttrs = convertAttributesToExpressions(hostBindingsMetadata.attributes);
    styleBuilder.assignHostAttrs(hostAttrs, definitionMap);
    if (styleBuilder.hasBindings) {
        // finally each binding that was registered in the statement above will need to be added to
        // the update block of a component/directive templateFn/hostBindingsFn so that the bindings
        // are evaluated and updated for the element.
        styleBuilder.buildUpdateLevelInstructions(getValueConverter()).forEach(instruction => {
            for (const call of instruction.calls) {
                // we subtract a value of `1` here because the binding slot was already allocated
                // at the top of this method when all the input bindings were counted.
                totalHostVarsCount +=
                    Math.max(call.allocateBindingSlots - MIN_STYLING_BINDING_SLOTS_REQUIRED, 0);
                const { params, stmts } = convertStylingCall(call, bindingContext, bindingFn, getNextBindingId);
                updateVariables.push(...stmts);
                updateInstructions.push({
                    reference: instruction.reference,
                    paramsOrFn: params,
                    span: null,
                });
            }
        });
    }
    if (totalHostVarsCount) {
        definitionMap.set('hostVars', o.literal(totalHostVarsCount));
    }
    if (createInstructions.length > 0 || updateInstructions.length > 0) {
        const hostBindingsFnName = name ? `${name}_HostBindings` : null;
        const statements = [];
        if (createInstructions.length > 0) {
            statements.push(renderFlagCheckIfStmt(1 /* core.RenderFlags.Create */, getInstructionStatements(createInstructions)));
        }
        if (updateInstructions.length > 0) {
            statements.push(renderFlagCheckIfStmt(2 /* core.RenderFlags.Update */, updateVariables.concat(getInstructionStatements(updateInstructions))));
        }
        return o.fn([new o.FnParam(RENDER_FLAGS, o.NUMBER_TYPE), new o.FnParam(CONTEXT_NAME, null)], statements, o.INFERRED_TYPE, null, hostBindingsFnName);
    }
    return null;
}
function bindingFn(implicit, value, getNextBindingIdFn) {
    return convertPropertyBinding(null, implicit, value, getNextBindingIdFn());
}
function convertStylingCall(call, bindingContext, bindingFn, getNextBindingIdFn) {
    const stmts = [];
    const params = call.params(value => {
        const result = bindingFn(bindingContext, value, getNextBindingIdFn);
        if (Array.isArray(result.stmts) && result.stmts.length > 0) {
            stmts.push(...result.stmts);
        }
        return result.currValExpr;
    });
    return { params, stmts };
}
function getBindingNameAndInstruction(binding) {
    let bindingName = binding.name;
    let instruction;
    // Check to see if this is an attr binding or a property binding
    const attrMatches = bindingName.match(ATTR_REGEX);
    if (attrMatches) {
        bindingName = attrMatches[1];
        instruction = R3.attribute;
    }
    else {
        if (binding.isAnimation) {
            bindingName = prepareSyntheticPropertyName(bindingName);
            // host bindings that have a synthetic property (e.g. @foo) should always be rendered
            // in the context of the component and not the parent. Therefore there is a special
            // compatibility instruction available for this purpose.
            instruction = R3.syntheticHostProperty;
        }
        else {
            instruction = R3.hostProperty;
        }
    }
    return { bindingName, instruction, isAttribute: !!attrMatches };
}
function createHostListeners(eventBindings, name) {
    const listenerParams = [];
    const syntheticListenerParams = [];
    const instructions = [];
    for (const binding of eventBindings) {
        let bindingName = binding.name && sanitizeIdentifier(binding.name);
        const bindingFnName = binding.type === 1 /* ParsedEventType.Animation */ ?
            prepareSyntheticListenerFunctionName(bindingName, binding.targetOrPhase) :
            bindingName;
        const handlerName = name && bindingName ? `${name}_${bindingFnName}_HostBindingHandler` : null;
        const params = prepareEventListenerParameters(BoundEvent.fromParsedEvent(binding), handlerName);
        if (binding.type == 1 /* ParsedEventType.Animation */) {
            syntheticListenerParams.push(params);
        }
        else {
            listenerParams.push(params);
        }
    }
    for (const params of syntheticListenerParams) {
        instructions.push({ reference: R3.syntheticHostListener, paramsOrFn: params, span: null });
    }
    for (const params of listenerParams) {
        instructions.push({ reference: R3.listener, paramsOrFn: params, span: null });
    }
    return instructions;
}
const HOST_REG_EXP = /^(?:\[([^\]]+)\])|(?:\(([^\)]+)\))$/;
export function parseHostBindings(host) {
    const attributes = {};
    const listeners = {};
    const properties = {};
    const specialAttributes = {};
    for (const key of Object.keys(host)) {
        const value = host[key];
        const matches = key.match(HOST_REG_EXP);
        if (matches === null) {
            switch (key) {
                case 'class':
                    if (typeof value !== 'string') {
                        // TODO(alxhub): make this a diagnostic.
                        throw new Error(`Class binding must be string`);
                    }
                    specialAttributes.classAttr = value;
                    break;
                case 'style':
                    if (typeof value !== 'string') {
                        // TODO(alxhub): make this a diagnostic.
                        throw new Error(`Style binding must be string`);
                    }
                    specialAttributes.styleAttr = value;
                    break;
                default:
                    if (typeof value === 'string') {
                        attributes[key] = o.literal(value);
                    }
                    else {
                        attributes[key] = value;
                    }
            }
        }
        else if (matches[1 /* HostBindingGroup.Binding */] != null) {
            if (typeof value !== 'string') {
                // TODO(alxhub): make this a diagnostic.
                throw new Error(`Property binding must be string`);
            }
            // synthetic properties (the ones that have a `@` as a prefix)
            // are still treated the same as regular properties. Therefore
            // there is no point in storing them in a separate map.
            properties[matches[1 /* HostBindingGroup.Binding */]] = value;
        }
        else if (matches[2 /* HostBindingGroup.Event */] != null) {
            if (typeof value !== 'string') {
                // TODO(alxhub): make this a diagnostic.
                throw new Error(`Event binding must be string`);
            }
            listeners[matches[2 /* HostBindingGroup.Event */]] = value;
        }
    }
    return { attributes, listeners, properties, specialAttributes };
}
/**
 * Verifies host bindings and returns the list of errors (if any). Empty array indicates that a
 * given set of host bindings has no errors.
 *
 * @param bindings set of host bindings to verify.
 * @param sourceSpan source span where host bindings were defined.
 * @returns array of errors associated with a given set of host bindings.
 */
export function verifyHostBindings(bindings, sourceSpan) {
    // TODO: abstract out host bindings verification logic and use it instead of
    // creating events and properties ASTs to detect errors (FW-996)
    const bindingParser = makeBindingParser();
    bindingParser.createDirectiveHostEventAsts(bindings.listeners, sourceSpan);
    bindingParser.createBoundHostProperties(bindings.properties, sourceSpan);
    return bindingParser.errors;
}
function compileStyles(styles, selector, hostSelector) {
    const shadowCss = new ShadowCss();
    return styles.map(style => {
        return shadowCss.shimCssText(style, selector, hostSelector);
    });
}
/**
 * Encapsulates a CSS stylesheet with emulated view encapsulation.
 * This allows a stylesheet to be used with an Angular component that
 * is using the `ViewEncapsulation.Emulated` mode.
 *
 * @param style The content of a CSS stylesheet.
 * @returns The encapsulated content for the style.
 */
export function encapsulateStyle(style) {
    const shadowCss = new ShadowCss();
    return shadowCss.shimCssText(style, CONTENT_ATTR, HOST_ATTR);
}
function createHostDirectivesType(meta) {
    if (!meta.hostDirectives?.length) {
        return o.NONE_TYPE;
    }
    return o.expressionType(o.literalArr(meta.hostDirectives.map(hostMeta => o.literalMap([
        { key: 'directive', value: o.typeofExpr(hostMeta.directive.type), quoted: false },
        { key: 'inputs', value: stringMapAsLiteralExpression(hostMeta.inputs || {}), quoted: false },
        { key: 'outputs', value: stringMapAsLiteralExpression(hostMeta.outputs || {}), quoted: false },
    ]))));
}
function createHostDirectivesFeatureArg(hostDirectives) {
    const expressions = [];
    let hasForwardRef = false;
    for (const current of hostDirectives) {
        // Use a shorthand if there are no inputs or outputs.
        if (!current.inputs && !current.outputs) {
            expressions.push(current.directive.type);
        }
        else {
            const keys = [{ key: 'directive', value: current.directive.type, quoted: false }];
            if (current.inputs) {
                const inputsLiteral = createHostDirectivesMappingArray(current.inputs);
                if (inputsLiteral) {
                    keys.push({ key: 'inputs', value: inputsLiteral, quoted: false });
                }
            }
            if (current.outputs) {
                const outputsLiteral = createHostDirectivesMappingArray(current.outputs);
                if (outputsLiteral) {
                    keys.push({ key: 'outputs', value: outputsLiteral, quoted: false });
                }
            }
            expressions.push(o.literalMap(keys));
        }
        if (current.isForwardReference) {
            hasForwardRef = true;
        }
    }
    // If there's a forward reference, we generate a `function() { return [HostDir] }`,
    // otherwise we can save some bytes by using a plain array, e.g. `[HostDir]`.
    return hasForwardRef ?
        new o.FunctionExpr([], [new o.ReturnStatement(o.literalArr(expressions))]) :
        o.literalArr(expressions);
}
/**
 * Converts an input/output mapping object literal into an array where the even keys are the
 * public name of the binding and the odd ones are the name it was aliased to. E.g.
 * `{inputOne: 'aliasOne', inputTwo: 'aliasTwo'}` will become
 * `['inputOne', 'aliasOne', 'inputTwo', 'aliasTwo']`.
 *
 * This conversion is necessary, because hosts bind to the public name of the host directive and
 * keeping the mapping in an object literal will break for apps using property renaming.
 */
export function createHostDirectivesMappingArray(mapping) {
    const elements = [];
    for (const publicName in mapping) {
        if (mapping.hasOwnProperty(publicName)) {
            elements.push(o.literal(publicName), o.literal(mapping[publicName]));
        }
    }
    return elements.length > 0 ? o.literalArr(elements) : null;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvcmVuZGVyMy92aWV3L2NvbXBpbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUdILE9BQU8sRUFBQyxzQkFBc0IsRUFBQyxNQUFNLDBDQUEwQyxDQUFDO0FBRWhGLE9BQU8sS0FBSyxJQUFJLE1BQU0sWUFBWSxDQUFDO0FBRW5DLE9BQU8sS0FBSyxDQUFDLE1BQU0seUJBQXlCLENBQUM7QUFDN0MsT0FBTyxFQUE4QixrQkFBa0IsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBQ2pGLE9BQU8sRUFBQyw2QkFBNkIsRUFBQyxNQUFNLGtDQUFrQyxDQUFDO0FBQy9FLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUMzQyxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDM0MsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0seUNBQXlDLENBQUM7QUFDM0UsT0FBTyxFQUFDLHVCQUF1QixFQUFFLGNBQWMsRUFBRSxTQUFTLEVBQUMsTUFBTSxrQ0FBa0MsQ0FBQztBQUNwRyxPQUFPLEVBQUMsZUFBZSxFQUFFLGlCQUFpQixFQUFDLE1BQU0sb0NBQW9DLENBQUM7QUFDdEYsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sZ0NBQWdDLENBQUM7QUFFckUsT0FBTyxFQUFDLEtBQUssRUFBQyxNQUFNLFlBQVksQ0FBQztBQUNqQyxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sV0FBVyxDQUFDO0FBQ3JDLE9BQU8sRUFBQyxXQUFXLElBQUksRUFBRSxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDcEQsT0FBTyxFQUFDLG9DQUFvQyxFQUFFLDRCQUE0QixFQUF3QixrQkFBa0IsRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUdySSxPQUFPLEVBQUMsNEJB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ICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cblxuaW1wb3J0IHtjb252ZXJ0UHJvcGVydHlCaW5kaW5nfSBmcm9tICcuLi8uLi9jb21waWxlcl91dGlsL2V4cHJlc3Npb25fY29udmVydGVyJztcbmltcG9ydCB7Q29uc3RhbnRQb29sfSBmcm9tICcuLi8uLi9jb25zdGFudF9wb29sJztcbmltcG9ydCAqIGFzIGNvcmUgZnJvbSAnLi4vLi4vY29yZSc7XG5pbXBvcnQge0FTVCwgUGFyc2VkRXZlbnQsIFBhcnNlZEV2ZW50VHlwZSwgUGFyc2VkUHJvcGVydHl9IGZyb20gJy4uLy4uL2V4cHJlc3Npb25fcGFyc2VyL2FzdCc7XG5pbXBvcnQgKiBhcyBvIGZyb20gJy4uLy4uL291dHB1dC9vdXRwdXRfYXN0JztcbmltcG9ydCB7UGFyc2VFcnJvciwgUGFyc2VTb3VyY2VTcGFuLCBzYW5pdGl6ZUlkZW50aWZpZXJ9IGZyb20gJy4uLy4uL3BhcnNlX3V0aWwnO1xuaW1wb3J0IHtpc0lmcmFtZVNlY3VyaXR5U2Vuc2l0aXZlQXR0cn0gZnJvbSAnLi4vLi4vc2NoZW1hL2RvbV9zZWN1cml0eV9zY2hlbWEnO1xuaW1wb3J0IHtDc3NTZWxlY3Rvcn0gZnJvbSAnLi4vLi4vc2VsZWN0b3InO1xuaW1wb3J0IHtTaGFkb3dDc3N9IGZyb20gJy4uLy4uL3NoYWRvd19jc3MnO1xuaW1wb3J0IHtDb21waWxhdGlvbkpvYktpbmR9IGZyb20gJy4uLy4uL3RlbXBsYXRlL3BpcGVsaW5lL3NyYy9jb21waWxhdGlvbic7XG5pbXBvcnQge2VtaXRIb3N0QmluZGluZ0Z1bmN0aW9uLCBlbWl0VGVtcGxhdGVGbiwgdHJhbnNmb3JtfSBmcm9tICcuLi8uLi90ZW1wbGF0ZS9waXBlbGluZS9zcmMvZW1pdCc7XG5pbXBvcnQge2luZ2VzdENvbXBvbmVudCwgaW5nZXN0SG9zdEJpbmRpbmd9IGZyb20gJy4uLy4uL3RlbXBsYXRlL3BpcGVsaW5lL3NyYy9pbmdlc3QnO1xuaW1wb3J0IHtVU0VfVEVNUExBVEVfUElQRUxJTkV9IGZyb20gJy4uLy4uL3RlbXBsYXRlL3BpcGVsaW5lL3N3aXRjaCc7XG5pbXBvcnQge0JpbmRpbmdQYXJzZXJ9IGZyb20gJy4uLy4uL3RlbXBsYXRlX3BhcnNlci9iaW5kaW5nX3BhcnNlcic7XG5pbXBvcnQge2Vycm9yfSBmcm9tICcuLi8uLi91dGlsJztcbmltcG9ydCB7Qm91bmRFdmVudH0gZnJvbSAnLi4vcjNfYXN0JztcbmltcG9ydCB7SWRlbnRpZmllcnMgYXMgUjN9IGZyb20gJy4uL3IzX2lkZW50aWZpZXJzJztcbmltcG9ydCB7cHJlcGFyZVN5bnRoZXRpY0xpc3RlbmVyRnVuY3Rpb25OYW1lLCBwcmVwYXJlU3ludGhldGljUHJvcGVydHlOYW1lLCBSM0NvbXBpbGVkRXhwcmVzc2lvbiwgdHlwZVdpdGhQYXJhbWV0ZXJzfSBmcm9tICcuLi91dGlsJztcblxuaW1wb3J0IHtEZWNsYXJhdGlvbkxpc3RFbWl0TW9kZSwgRGVmZXJCbG9ja0RlcHNFbWl0TW9kZSwgUjNDb21wb25lbnRNZXRhZGF0YSwgUjNEaXJlY3RpdmVNZXRhZGF0YSwgUjNIb3N0TWV0YWRhdGEsIFIzVGVtcGxhdGVEZXBlbmRlbmN5fSBmcm9tICcuL2FwaSc7XG5pbXBvcnQge2NyZWF0ZUNvbnRlbnRRdWVyaWVzRnVuY3Rpb24sIGNyZWF0ZVZpZXdRdWVyaWVzRnVuY3Rpb259IGZyb20gJy4vcXVlcnlfZ2VuZXJhdGlvbic7XG5pbXBvcnQge01JTl9TVFlMSU5HX0JJTkRJTkdfU0xPVFNfUkVRVUlSRUQsIFN0eWxpbmdCdWlsZGVyLCBTdHlsaW5nSW5zdHJ1Y3Rpb25DYWxsfSBmcm9tICcuL3N0eWxpbmdfYnVpbGRlcic7XG5pbXBvcnQge0JpbmRpbmdTY29wZSwgbWFrZUJpbmRpbmdQYXJzZXIsIHByZXBhcmVFdmVudExpc3RlbmVyUGFyYW1ldGVycywgcmVuZGVyRmxhZ0NoZWNrSWZTdG10LCByZXNvbHZlU2FuaXRpemF0aW9uRm4sIFRlbXBsYXRlRGVmaW5pdGlvbkJ1aWxkZXIsIFZhbHVlQ29udmVydGVyfSBmcm9tICcuL3RlbXBsYXRlJztcbmltcG9ydCB7YXNMaXRlcmFsLCBjb25kaXRpb25hbGx5Q3JlYXRlRGlyZWN0aXZlQmluZGluZ0xpdGVyYWwsIENPTlRFWFRfTkFNRSwgRGVmaW5pdGlvbk1hcCwgZ2V0SW5zdHJ1Y3Rpb25TdGF0ZW1lbnRzLCBJbnN0cnVjdGlvbiwgUkVOREVSX0ZMQUdTfSBmcm9tICcuL3V0aWwnO1xuXG5cbi8vIFRoaXMgcmVnZXggbWF0Y2hlcyBhbnkgYmluZGluZyBuYW1lcyB0aGF0IGNvbnRhaW4gdGhlIFwiYXR0ci5cIiBwcmVmaXgsIGUuZy4gXCJhdHRyLnJlcXVpcmVkXCJcbi8vIElmIHRoZXJlIGlzIGEgbWF0Y2gsIHRoZSBmaXJzdCBtYXRjaGluZyBncm91cCB3aWxsIGNvbnRhaW4gdGhlIGF0dHJpYnV0ZSBuYW1lIHRvIGJpbmQuXG5jb25zdCBBVFRSX1JFR0VYID0gL2F0dHJcXC4oW15cXF1dKykvO1xuXG5cbmNvbnN0IENPTVBPTkVOVF9WQVJJQUJMRSA9ICclQ09NUCUnO1xuY29uc3QgSE9TVF9BVFRSID0gYF9uZ2hvc3QtJHtDT01QT05FTlRfVkFSSUFCTEV9YDtcbmNvbnN0IENPTlRFTlRfQVRUUiA9IGBfbmdjb250ZW50LSR7Q09NUE9ORU5UX1ZBUklBQkxFfWA7XG5cbmZ1bmN0aW9uIGJhc2VEaXJlY3RpdmVGaWVsZHMoXG4gICAgbWV0YTogUjNEaXJlY3RpdmVNZXRhZGF0YSwgY29uc3RhbnRQb29sOiBDb25zdGFudFBvb2wsXG4gICAgYmluZGluZ1BhcnNlcjogQmluZGluZ1BhcnNlcik6IERlZmluaXRpb25NYXAge1xuICBjb25zdCBkZWZpbml0aW9uTWFwID0gbmV3IERlZmluaXRpb25NYXAoKTtcbiAgY29uc3Qgc2VsZWN0b3JzID0gY29yZS5wYXJzZVNlbGVjdG9yVG9SM1NlbGVjdG9yKG1ldGEuc2VsZWN0b3IpO1xuXG4gIC8vIGUuZy4gYHR5cGU6IE15RGlyZWN0aXZlYFxuICBkZWZpbml0aW9uTWFwLnNldCgndHlwZScsIG1ldGEudHlwZS52YWx1ZSk7XG5cbiAgLy8gZS5nLiBgc2VsZWN0b3JzOiBbWycnLCAnc29tZURpcicsICcnXV1gXG4gIGlmIChzZWxlY3RvcnMubGVuZ3RoID4gMCkge1xuICAgIGRlZmluaXRpb25NYXAuc2V0KCdzZWxlY3RvcnMnLCBhc0xpdGVyYWwoc2VsZWN0b3JzKSk7XG4gIH1cblxuICBpZiAobWV0YS5xdWVyaWVzLmxlbmd0aCA+IDApIHtcbiAgICAvLyBlLmcuIGBjb250ZW50UXVlcmllczogKHJmLCBjdHgsIGRpckluZGV4KSA9PiB7IC4uLiB9XG4gICAgZGVmaW5pdGlvbk1hcC5zZXQoXG4gICAgICAgICdjb250ZW50UXVlcmllcycsIGNyZWF0ZUNvbnRlbnRRdWVyaWVzRnVuY3Rpb24obWV0YS5xdWVyaWVzLCBjb25zdGFudFBvb2wsIG1ldGEubmFtZSkpO1xuICB9XG5cbiAgaWYgKG1ldGEudmlld1F1ZXJpZXMubGVuZ3RoKSB7XG4gICAgZGVmaW5pdGlvbk1hcC5zZXQoXG4gICAgICAgICd2aWV3UXVlcnknLCBjcmVhdGVWaWV3UXVlcmllc0Z1bmN0aW9uKG1ldGEudmlld1F1ZXJpZXMsIGNvbnN0YW50UG9vbCwgbWV0YS5uYW1lKSk7XG4gIH1cblxuICAvLyBlLmcuIGBob3N0QmluZGluZ3M6IChyZiwgY3R4KSA9PiB7IC4uLiB9XG4gIGRlZmluaXRpb25NYXAuc2V0KFxuICAgICAgJ2hvc3RCaW5kaW5ncycsXG4gICAgICBjcmVhdGVIb3N0QmluZGluZ3NGdW5jdGlvbihcbiAgICAgICAgICBtZXRhLmhvc3QsIG1ldGEudHlwZVNvdXJjZVNwYW4sIGJpbmRpbmdQYXJzZXIsIGNvbnN0YW50UG9vbCwgbWV0YS5zZWxlY3RvciB8fCAnJyxcbiAgICAgICAgICBtZXRhLm5hbWUsIGRlZmluaXRpb25NYXApKTtcblxuICAvLyBlLmcgJ2lucHV0czoge2E6ICdhJ31gXG4gIGRlZmluaXRpb25NYXAuc2V0KCdpbnB1dHMnLCBjb25kaXRpb25hbGx5Q3JlYXRlRGlyZWN0aXZlQmluZGluZ0xpdGVyYWwobWV0YS5pbnB1dHMsIHRydWUpKTtcblxuICAvLyBlLmcgJ291dHB1dHM6IHthOiAnYSd9YFxuICBkZWZpbml0aW9uTWFwLnNldCgnb3V0cHV0cycsIGNvbmRpdGlvbmFsbHlDcmVhdGVEaXJlY3RpdmVCaW5kaW5nTGl0ZXJhbChtZXRhLm91dHB1dHMpKTtcblxuICBpZiAobWV0YS5leHBvcnRBcyAhPT0gbnVsbCkge1xuICAgIGRlZmluaXRpb25NYXAuc2V0KCdleHBvcnRBcycsIG8ubGl0ZXJhbEFycihtZXRhLmV4cG9ydEFzLm1hcChlID0+IG8ubGl0ZXJhbChlKSkpKTtcbiAgfVxuXG4gIGlmIChtZXRhLmlzU3RhbmRhbG9uZSkge1xuICAgIGRlZmluaXRpb25NYXAuc2V0KCdzdGFuZGFsb25lJywgby5saXRlcmFsKHRydWUpKTtcbiAgfVxuICBpZiAobWV0YS5pc1NpZ25hbCkge1xuICAgIGRlZmluaXRpb25NYXAuc2V0KCdzaWduYWxzJywgby5saXRlcmFsKHRydWUpKTtcbiAgfVxuXG4gIHJldHVybiBkZWZpbml0aW9uTWFwO1xufVxuXG4vKipcbiAqIEFkZCBmZWF0dXJlcyB0byB0aGUgZGVmaW5pdGlvbiBtYXAuXG4gKi9cbmZ1bmN0aW9uIGFkZEZlYXR1cmVzKFxuICAgIGRlZmluaXRpb25NYXA6IERlZmluaXRpb25NYXAsXG4gICAgbWV0YTogUjNEaXJlY3RpdmVNZXRhZGF0YXxSM0NvbXBvbmVudE1ldGFkYXRhPFIzVGVtcGxhdGVEZXBlbmRlbmN5Pikge1xuICAvLyBlLmcuIGBmZWF0dXJlczogW05nT25DaGFuZ2VzRmVhdHVyZV1gXG4gIGNvbnN0IGZlYXR1cmVzOiBvLkV4cHJlc3Npb25bXSA9IFtdO1xuXG4gIGNvbnN0IHByb3ZpZGVycyA9IG1ldGEucHJvdmlkZXJzO1xuICBjb25zdCB2aWV3UHJvdmlkZXJzID0gKG1ldGEgYXMgUjNDb21wb25lbnRNZXRhZGF0YTxSM1RlbXBsYXRlRGVwZW5kZW5jeT4pLnZpZXdQcm92aWRlcnM7XG4gIGNvbnN0IGlucHV0S2V5cyA9IE9iamVjdC5rZXlzKG1ldGEuaW5wdXRzKTtcblxuICBpZiAocHJvdmlkZXJzIHx8IHZpZXdQcm92aWRlcnMpIHtcbiAgICBjb25zdCBhcmdzID0gW3Byb3ZpZGVycyB8fCBuZXcgby5MaXRlcmFsQXJyYXlFeHByKFtdKV07XG4gICAgaWYgKHZpZXdQcm92aWRlcnMpIHtcbiAgICAgIGFyZ3MucHVzaCh2aWV3UHJvdmlkZXJzKTtcbiAgICB9XG4gICAgZmVhdHVyZXMucHVzaChvLmltcG9ydEV4cHIoUjMuUHJvdmlkZXJzRmVhdHVyZSkuY2FsbEZuKGFyZ3MpKTtcbiAgfVxuICBmb3IgKGNvbnN0IGtleSBvZiBpbnB1dEtleXMpIHtcbiAgICBpZiAobWV0YS5pbnB1dHNba2V5XS50cmFuc2Zvcm1GdW5jdGlvbiAhPT0gbnVsbCkge1xuICAgICAgZmVhdHVyZXMucHVzaChvLmltcG9ydEV4cHIoUjMuSW5wdXRUcmFuc2Zvcm1zRmVhdHVyZUZlYXR1cmUpKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICAvLyBOb3RlOiBob3N0IGRpcmVjdGl2ZXMgZmVhdHVyZSBuZWVkcyB0byBiZSBpbnNlcnRlZCBiZWZvcmUgdGhlXG4gIC8vIGluaGVyaXRhbmNlIGZlYXR1cmUgdG8gZW5zdXJlIHRoZSBjb3JyZWN0IGV4ZWN1dGlvbiBvcmRlci5cbiAgaWYgKG1ldGEuaG9zdERpcmVjdGl2ZXM/Lmxlbmd0aCkge1xuICAgIGZlYXR1cmVzLnB1c2goby5pbXBvcnRFeHByKFIzLkhvc3REaXJlY3RpdmVzRmVhdHVyZSkuY2FsbEZuKFtjcmVhdGVIb3N0RGlyZWN0aXZlc0ZlYXR1cmVBcmcoXG4gICAgICAgIG1ldGEuaG9zdERpcmVjdGl2ZXMpXSkpO1xuICB9XG4gIGlmIChtZXRhLnVzZXNJbmhlcml0YW5jZSkge1xuICAgIGZlYXR1cmVzLnB1c2goby5pbXBvcnRFeHByKFIzLkluaGVyaXREZWZpbml0aW9uRmVhdHVyZSkpO1xuICB9XG4gIGlmIChtZXRhLmZ1bGxJbmhlcml0YW5jZSkge1xuICAgIGZlYXR1cmVzLnB1c2goby5pbXBvcnRFeHByKFIzLkNvcHlEZWZpbml0aW9uRmVhdHVyZSkpO1xuICB9XG4gIGlmIChtZXRhLmxpZmVjeWNsZS51c2VzT25DaGFuZ2VzKSB7XG4gICAgZmVhdHVyZXMucHVzaChvLmltcG9ydEV4cHIoUjMuTmdPbkNoYW5nZXNGZWF0dXJlKSk7XG4gIH1cbiAgLy8gVE9ETzogYmV0dGVyIHdheSBvZiBkaWZmZXJlbnRpYXRpbmcgY29tcG9uZW50IHZzIGRpcmVjdGl2ZSBtZXRhZGF0YS5cbiAgaWYgKG1ldGEuaGFzT3duUHJvcGVydHkoJ3RlbXBsYXRlJykgJiYgbWV0YS5pc1N0YW5kYWxvbmUpIHtcbiAgICBmZWF0dXJlcy5wdXNoKG8uaW1wb3J0RXhwcihSMy5TdGFuZGFsb25lRmVhdHVyZSkpO1xuICB9XG4gIGlmIChmZWF0dXJlcy5sZW5ndGgpIHtcbiAgICBkZWZpbml0aW9uTWFwLnNldCgnZmVhdHVyZXMnLCBvLmxpdGVyYWxBcnIoZmVhdHVyZXMpKTtcbiAgfVxufVxuXG4vKipcbiAqIENvbXBpbGUgYSBkaXJlY3RpdmUgZm9yIHRoZSByZW5kZXIzIHJ1bnRpbWUgYXMgZGVmaW5lZCBieSB0aGUgYFIzRGlyZWN0aXZlTWV0YWRhdGFgLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZURpcmVjdGl2ZUZyb21NZXRhZGF0YShcbiAgICBtZXRhOiBSM0RpcmVjdGl2ZU1ldGFkYXRhLCBjb25zdGFudFBvb2w6IENvbnN0YW50UG9vbCxcbiAgICBiaW5kaW5nUGFyc2VyOiBCaW5kaW5nUGFyc2VyKTogUjNDb21waWxlZEV4cHJlc3Npb24ge1xuICBjb25zdCBkZWZpbml0aW9uTWFwID0gYmFzZURpcmVjdGl2ZUZpZWxkcyhtZXRhLCBjb25zdGFudFBvb2wsIGJpbmRpbmdQYXJzZXIpO1xuICBhZGRGZWF0dXJlcyhkZWZpbml0aW9uTWFwLCBtZXRhKTtcbiAgY29uc3QgZXhwcmVzc2lvbiA9XG4gICAgICBvLmltcG9ydEV4cHIoUjMuZGVmaW5lRGlyZWN0aXZlKS5jYWxsRm4oW2RlZmluaXRpb25NYXAudG9MaXRlcmFsTWFwKCldLCB1bmRlZmluZWQsIHRydWUpO1xuICBjb25zdCB0eXBlID0gY3JlYXRlRGlyZWN0aXZlVHlwZShtZXRhKTtcblxuICByZXR1cm4ge2V4cHJlc3Npb24sIHR5cGUsIHN0YXRlbWVudHM6IFtdfTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGFuIEFTVCBmb3IgYSBmdW5jdGlvbiB0aGF0IGNvbnRhaW5zIGR5bmFtaWMgaW1wb3J0cyByZXByZXNlbnRpbmdcbiAqIGRlZmVycmFibGUgZGVwZW5kZW5jaWVzLlxuICovXG5mdW5jdGlvbiBjcmVhdGVEZWZlcnJlZERlcHNGdW5jdGlvbihcbiAgICBjb25zdGFudFBvb2w6IENvbnN0YW50UG9vbCwgbmFtZTogc3RyaW5nLFxuICAgIGRlcHM6IE1hcDxzdHJpbmcsIHtpbXBvcnRQYXRoOiBzdHJpbmcsIGlzRGVmYXVsdEltcG9ydDogYm9vbGVhbn0+KSB7XG4gIC8vIFRoaXMgZGVmZXIgYmxvY2sgaGFzIGRlcHMgZm9yIHdoaWNoIHdlIG5lZWQgdG8gZ2VuZXJhdGUgZHluYW1pYyBpbXBvcnRzLlxuICBjb25zdCBkZXBlbmRlbmN5RXhwOiBvLkV4cHJlc3Npb25bXSA9IFtdO1xuXG4gIGZvciAoY29uc3QgW3N5bWJvbE5hbWUsIHtpbXBvcnRQYXRoLCBpc0RlZmF1bHRJbXBvcnR9XSBvZiBkZXBzKSB7XG4gICAgLy8gQ2FsbGJhY2sgZnVuY3Rpb24sIGUuZy4gYG0gKCkgPT4gbS5NeUNtcDtgLlxuICAgIGNvbnN0IGlubmVyRm4gPSBvLmFycm93Rm4oXG4gICAgICAgIFtuZXcgby5GblBhcmFtKCdtJywgby5EWU5BTUlDX1RZUEUpXSxcbiAgICAgICAgby52YXJpYWJsZSgnbScpLnByb3AoaXNEZWZhdWx0SW1wb3J0ID8gJ2RlZmF1bHQnIDogc3ltYm9sTmFtZSkpO1xuXG4gICAgLy8gRHluYW1pYyBpbXBvcnQsIGUuZy4gYGltcG9ydCgnLi9hJykudGhlbiguLi4pYC5cbiAgICBjb25zdCBpbXBvcnRFeHByID0gKG5ldyBvLkR5bmFtaWNJbXBvcnRFeHByKGltcG9ydFBhdGgpKS5wcm9wKCd0aGVuJykuY2FsbEZuKFtpbm5lckZuXSk7XG4gICAgZGVwZW5kZW5jeUV4cC5wdXNoKGltcG9ydEV4cHIpO1xuICB9XG5cbiAgY29uc3QgZGVwc0ZuRXhwciA9IG8uYXJyb3dGbihbXSwgby5saXRlcmFsQXJyKGRlcGVuZGVuY3lFeHApKTtcblxuICBjb25zdGFudFBvb2wuc3RhdGVtZW50cy5wdXNoKGRlcHNGbkV4cHIudG9EZWNsU3RtdChuYW1lLCBvLlN0bXRNb2RpZmllci5GaW5hbCkpO1xuXG4gIHJldHVybiBvLnZhcmlhYmxlKG5hbWUpO1xufVxuXG4vKipcbiAqIENvbXBpbGUgYSBjb21wb25lbnQgZm9yIHRoZSByZW5kZXIzIHJ1bnRpbWUgYXMgZGVmaW5lZCBieSB0aGUgYFIzQ29tcG9uZW50TWV0YWRhdGFgLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZUNvbXBvbmVudEZyb21NZXRhZGF0YShcbiAgICBtZXRhOiBSM0NvbXBvbmVudE1ldGFkYXRhPFIzVGVtcGxhdGVEZXBlbmRlbmN5PiwgY29uc3RhbnRQb29sOiBDb25zdGFudFBvb2wsXG4gICAgYmluZGluZ1BhcnNlcjogQmluZGluZ1BhcnNlcik6IFIzQ29tcGlsZWRFeHByZXNzaW9uIHtcbiAgY29uc3QgZGVmaW5pdGlvbk1hcCA9IGJhc2VEaXJlY3RpdmVGaWVsZHMobWV0YSwgY29uc3RhbnRQb29sLCBiaW5kaW5nUGFyc2VyKTtcbiAgYWRkRmVhdHVyZXMoZGVmaW5pdGlvbk1hcCwgbWV0YSk7XG5cbiAgY29uc3Qgc2VsZWN0b3IgPSBtZXRhLnNlbGVjdG9yICYmIENzc1NlbGVjdG9yLnBhcnNlKG1ldGEuc2VsZWN0b3IpO1xuICBjb25zdCBmaXJzdFNlbGVjdG9yID0gc2VsZWN0b3IgJiYgc2VsZWN0b3JbMF07XG5cbiAgLy8gZS5nLiBgYXR0cjogW1wiY2xhc3NcIiwgXCIubXkuYXBwXCJdYFxuICAvLyBUaGlzIGlzIG9wdGlvbmFsIGFuIG9ubHkgaW5jbHVkZWQgaWYgdGhlIGZpcnN0IHNlbGVjdG9yIG9mIGEgY29tcG9uZW50IHNwZWNpZmllcyBhdHRyaWJ1dGVzLlxuICBpZiAoZmlyc3RTZWxlY3Rvcikge1xuICAgIGNvbnN0IHNlbGVjdG9yQXR0cmlidXRlcyA9IGZpcnN0U2VsZWN0b3IuZ2V0QXR0cnMoKTtcbiAgICBpZiAoc2VsZWN0b3JBdHRyaWJ1dGVzLmxlbmd0aCkge1xuICAgICAgZGVmaW5pdGlvbk1hcC5zZXQoXG4gICAgICAgICAgJ2F0dHJzJyxcbiAgICAgICAgICBjb25zdGFudFBvb2wuZ2V0Q29uc3RMaXRlcmFsKFxuICAgICAgICAgICAgICBvLmxpdGVyYWxBcnIoc2VsZWN0b3JBdHRyaWJ1dGVzLm1hcChcbiAgICAgICAgICAgICAgICAgIHZhbHVlID0+IHZhbHVlICE9IG51bGwgPyBvLmxpdGVyYWwodmFsdWUpIDogby5saXRlcmFsKHVuZGVmaW5lZCkpKSxcbiAgICAgICAgICAgICAgLyogZm9yY2VTaGFyZWQgKi8gdHJ1ZSkpO1xuICAgIH1cbiAgfVxuXG4gIC8vIGUuZy4gYHRlbXBsYXRlOiBmdW5jdGlvbiBNeUNvbXBvbmVudF9UZW1wbGF0ZShfY3R4LCBfY20pIHsuLi59YFxuICBjb25zdCB0ZW1wbGF0ZVR5cGVOYW1lID0gbWV0YS5uYW1lO1xuICBjb25zdCB0ZW1wbGF0ZU5hbWUgPSB0ZW1wbGF0ZVR5cGVOYW1lID8gYCR7dGVtcGxhdGVUeXBlTmFtZX1fVGVtcGxhdGVgIDogbnVsbDtcblxuXG4gIGxldCBhbGxEZWZlcnJhYmxlRGVwc0ZuOiBvLlJlYWRWYXJFeHByfG51bGwgPSBudWxsO1xuICBpZiAobWV0YS5kZWZlckJsb2Nrcy5zaXplID4gMCAmJiBtZXRhLmRlZmVycmFibGVUeXBlcy5zaXplID4gMCAmJlxuICAgICAgbWV0YS5kZWZlckJsb2NrRGVwc0VtaXRNb2RlID09PSBEZWZlckJsb2NrRGVwc0VtaXRNb2RlLlBlckNvbXBvbmVudCkge1xuICAgIGNvbnN0IGZuTmFtZSA9IGAke3RlbXBsYXRlVHlwZU5hbWV9X0RlZmVyRm5gO1xuICAgIGFsbERlZmVycmFibGVEZXBzRm4gPSBjcmVhdGVEZWZlcnJlZERlcHNGdW5jdGlvbihjb25zdGFudFBvb2wsIGZuTmFtZSwgbWV0YS5kZWZlcnJhYmxlVHlwZXMpO1xuICB9XG5cbiAgLy8gVGVtcGxhdGUgY29tcGlsYXRpb24gaXMgY3VycmVudGx5IGNvbmRpdGlvbmFsIGFzIHdlJ3JlIGluIHRoZSBwcm9jZXNzIG9mIHJld3JpdGluZyBpdC5cbiAgaWYgKCFVU0VfVEVNUExBVEVfUElQRUxJTkUgJiYgIW1ldGEudXNlVGVtcGxhdGVQaXBlbGluZSkge1xuICAgIC8vIFRoaXMgaXMgdGhlIG1haW4gcGF0aCBjdXJyZW50bHkgdXNlZCBpbiBjb21waWxhdGlvbiwgd2hpY2ggY29tcGlsZXMgdGhlIHRlbXBsYXRlIHdpdGggdGhlXG4gICAgLy8gbGVnYWN5IGBUZW1wbGF0ZURlZmluaXRpb25CdWlsZGVyYC5cblxuICAgIGNvbnN0IHRlbXBsYXRlID0gbWV0YS50ZW1wbGF0ZTtcbiAgICBjb25zdCB0ZW1wbGF0ZUJ1aWxkZXIgPSBuZXcgVGVtcGxhdGVEZWZpbml0aW9uQnVpbGRlcihcbiAgICAgICAgY29uc3RhbnRQb29sLCBCaW5kaW5nU2NvcGUuY3JlYXRlUm9vdFNjb3BlKCksIDAsIHRlbXBsYXRlVHlwZU5hbWUsIG51bGwsIG51bGwsIHRlbXBsYXRlTmFtZSxcbiAgICAgICAgUjMubmFtZXNwYWNlSFRNTCwgbWV0YS5yZWxhdGl2ZUNvbnRleHRGaWxlUGF0aCwgbWV0YS5pMThuVXNlRXh0ZXJuYWxJZHMsIG1ldGEuZGVmZXJCbG9ja3MsXG4gICAgICAgIG5ldyBNYXAoKSwgYWxsRGVmZXJyYWJsZURlcHNGbik7XG5cbiAgICBjb25zdCB0ZW1wbGF0ZUZ1bmN0aW9uRXhwcmVzc2lvbiA9IHRlbXBsYXRlQnVpbGRlci5idWlsZFRlbXBsYXRlRnVuY3Rpb24odGVtcGxhdGUubm9kZXMsIFtdKTtcblxuICAgIC8vIFdlIG5lZWQgdG8gcHJvdmlkZSB0aGlzIHNvIHRoYXQgZHluYW1pY2FsbHkgZ2VuZXJhdGVkIGNvbXBvbmVudHMga25vdyB3aGF0XG4gICAgLy8gcHJvamVjdGVkIGNvbnRlbnQgYmxvY2tzIHRvIHBhc3MgdGhyb3VnaCB0byB0aGUgY29tcG9uZW50IHdoZW4gaXQgaXNcbiAgICAvLyAgICAgaW5zdGFudGlhdGVkLlxuICAgIGNvbnN0IG5nQ29udGVudFNlbGVjdG9ycyA9IHRlbXBsYXRlQnVpbGRlci5nZXROZ0NvbnRlbnRTZWxlY3RvcnMoKTtcbiAgICBpZiAobmdDb250ZW50U2VsZWN0b3JzKSB7XG4gICAgICBkZWZpbml0aW9uTWFwLnNldCgnbmdDb250ZW50U2VsZWN0b3JzJywgbmdDb250ZW50U2VsZWN0b3JzKTtcbiAgICB9XG5cbiAgICAvLyBlLmcuIGBkZWNsczogMmBcbiAgICAvLyBkZWZpbml0aW9uTWFwLnNldCgnZGVjbHMnLCBvLmxpdGVyYWwodHBsLnJvb3QuZGVjbHMhKSk7XG4gICAgZGVmaW5pdGlvbk1hcC5zZXQoJ2RlY2xzJywgby5saXRlcmFsKHRlbXBsYXRlQnVpbGRlci5nZXRDb25zdENvdW50KCkpKTtcblxuICAgIC8vIGUuZy4gYHZhcnM6IDJgXG4gICAgLy8gZGVmaW5pdGlvbk1hcC5zZXQoJ3ZhcnMnLCBvLmxpdGVyYWwodHBsLnJvb3QudmFycyEpKTtcbiAgICBkZWZpbml0aW9uTWFwLnNldCgndmFycycsIG8ubGl0ZXJhbCh0ZW1wbGF0ZUJ1aWxkZXIuZ2V0VmFyQ291bnQoKSkpO1xuXG4gICAgLy8gR2VuZXJhdGUgYGNvbnN0c2Agc2VjdGlvbiBvZiBDb21wb25lbnREZWY6XG4gICAgLy8gLSBlaXRoZXIgYXMgYW4gYXJyYXk6XG4gICAgLy8gICBgY29uc3RzOiBbWydvbmUnLCAndHdvJ10sIFsndGhyZWUnLCAnZm91ciddXWBcbiAgICAvLyAtIG9yIGFzIGEgZmFjdG9yeSBmdW5jdGlvbiBpbiBjYXNlIGFkZGl0aW9uYWwgc3RhdGVtZW50cyBhcmUgcHJlc2VudCAodG8gc3VwcG9ydCBpMThuKTpcbiAgICAvLyAgIGBjb25zdHM6ICgpID0+IHsgdmFyIGkxOG5fMDsgaWYgKG5nSTE4bkNsb3N1cmVNb2RlKSB7Li4ufSBlbHNlIHsuLi59IHJldHVybiBbaTE4bl8wXTtcbiAgICAvLyAgIH1gXG4gICAgY29uc3Qge2NvbnN0RXhwcmVzc2lvbnMsIHByZXBhcmVTdGF0ZW1lbnRzfSA9IHRlbXBsYXRlQnVpbGRlci5nZXRDb25zdHMoKTtcbiAgICBpZiAoY29uc3RFeHByZXNzaW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICBsZXQgY29uc3RzRXhwcjogby5MaXRlcmFsQXJyYXlFeHByfG8uQXJyb3dGdW5jdGlvbkV4cHIgPSBvLmxpdGVyYWxBcnIoY29uc3RFeHByZXNzaW9ucyk7XG4gICAgICAvLyBQcmVwYXJlIHN0YXRlbWVudHMgYXJlIHByZXNlbnQgLSB0dXJuIGBjb25zdHNgIGludG8gYSBmdW5jdGlvbi5cbiAgICAgIGlmIChwcmVwYXJlU3RhdGVtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0c0V4cHIgPSBvLmFycm93Rm4oW10sIFsuLi5wcmVwYXJlU3RhdGVtZW50cywgbmV3IG8uUmV0dXJuU3RhdGVtZW50KGNvbnN0c0V4cHIpXSk7XG4gICAgICB9XG4gICAgICBkZWZpbml0aW9uTWFwLnNldCgnY29uc3RzJywgY29uc3RzRXhwcik7XG4gICAgfVxuXG4gICAgZGVmaW5pdGlvbk1hcC5zZXQoJ3RlbXBsYXRlJywgdGVtcGxhdGVGdW5jdGlvbkV4cHJlc3Npb24pO1xuICB9IGVsc2Uge1xuICAgIC8vIFRoaXMgcGF0aCBjb21waWxlcyB0aGUgdGVtcGxhdGUgdXNpbmcgdGhlIHByb3RvdHlwZSB0ZW1wbGF0ZSBwaXBlbGluZS4gRmlyc3QgdGhlIHRlbXBsYXRlIGlzXG4gICAgLy8gaW5nZXN0ZWQgaW50byBJUjpcbiAgICBjb25zdCB0cGwgPSBpbmdlc3RDb21wb25lbnQoXG4gICAgICAgIG1ldGEubmFtZSwgbWV0YS50ZW1wbGF0ZS5ub2RlcywgY29uc3RhbnRQb29sLCBtZXRhLnJlbGF0aXZlQ29udGV4dEZpbGVQYXRoLFxuICAgICAgICBtZXRhLmkxOG5Vc2VFeHRlcm5hbElkcywgbWV0YS5kZWZlckJsb2NrcywgYWxsRGVmZXJyYWJsZURlcHNGbik7XG5cbiAgICAvLyBUaGVuIHRoZSBJUiBpcyB0cmFuc2Zvcm1lZCB0byBwcmVwYXJlIGl0IGZvciBjb2QgZWdlbmVyYXRpb24uXG4gICAgdHJhbnNmb3JtKHRwbCwgQ29tcGlsYXRpb25Kb2JLaW5kLlRtcGwpO1xuXG4gICAgLy8gRmluYWxseSB3ZSBlbWl0IHRoZSB0ZW1wbGF0ZSBmdW5jdGlvbjpcbiAgICBjb25zdCB0ZW1wbGF0ZUZuID0gZW1pdFRlbXBsYXRlRm4odHBsLCBjb25zdGFudFBvb2wpO1xuXG4gICAgaWYgKHRwbC5jb250ZW50U2VsZWN0b3JzICE9PSBudWxsKSB7XG4gICAgICBkZWZpbml0aW9uTWFwLnNldCgnbmdDb250ZW50U2VsZWN0b3JzJywgdHBsLmNvbnRlbnRTZWxlY3RvcnMpO1xuICAgIH1cblxuICAgIGRlZmluaXRpb25NYXAuc2V0KCdkZWNscycsIG8ubGl0ZXJhbCh0cGwucm9vdC5kZWNscyBhcyBudW1iZXIpKTtcbiAgICBkZWZpbml0aW9uTWFwLnNldCgndmFycycsIG8ubGl0ZXJhbCh0cGwucm9vdC52YXJzIGFzIG51bWJlcikpO1xuICAgIGlmICh0cGwuY29uc3RzLmxlbmd0aCA+IDApIHtcbiAgICAgIGlmICh0cGwuY29uc3RzSW5pdGlhbGl6ZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgZGVmaW5pdGlvbk1hcC5zZXQoJ2NvbnN0cycsIG8uYXJyb3dGbihbXSwgW1xuICAgICAgICAgIC4uLnRwbC5jb25zdHNJbml0aWFsaXplcnMsIG5ldyBvLlJldHVyblN0YXRlbWVudChvLmxpdGVyYWxBcnIodHBsLmNvbnN0cykpXG4gICAgICAgIF0pKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlZmluaXRpb25NYXAuc2V0KCdjb25zdHMnLCBvLmxpdGVyYWxBcnIodHBsLmNvbnN0cykpO1xuICAgICAgfVxuICAgIH1cbiAgICBkZWZpbml0aW9uTWFwLnNldCgndGVtcGxhdGUnLCB0ZW1wbGF0ZUZuKTtcbiAgfVxuXG4gIGlmIChtZXRhLmRlY2xhcmF0aW9uTGlzdEVtaXRNb2RlICE9PSBEZWNsYXJhdGlvbkxpc3RFbWl0TW9kZS5SdW50aW1lUmVzb2x2ZWQgJiZcbiAgICAgIG1ldGEuZGVjbGFyYXRpb25zLmxlbmd0aCA+IDApIHtcbiAgICBkZWZpbml0aW9uTWFwLnNldChcbiAgICAgICAgJ2RlcGVuZGVuY2llcycsXG4gICAgICAgIGNvbXBpbGVEZWNsYXJhdGlvbkxpc3QoXG4gICAgICAgICAgICBvLmxpdGVyYWxBcnIobWV0YS5kZWNsYXJhdGlvbnMubWFwKGRlY2wgPT4gZGVjbC50eXBlKSksIG1ldGEuZGVjbGFyYXRpb25MaXN0RW1pdE1vZGUpKTtcbiAgfSBlbHNlIGlmIChtZXRhLmRlY2xhcmF0aW9uTGlzdEVtaXRNb2RlID09PSBEZWNsYXJhdGlvbkxpc3RFbWl0TW9kZS5SdW50aW1lUmVzb2x2ZWQpIHtcbiAgICBjb25zdCBhcmdzID0gW21ldGEudHlwZS52YWx1ZV07XG4gICAgaWYgKG1ldGEucmF3SW1wb3J0cykge1xuICAgICAgYXJncy5wdXNoKG1ldGEucmF3SW1wb3J0cyk7XG4gICAgfVxuICAgIGRlZmluaXRpb25NYXAuc2V0KCdkZXBlbmRlbmNpZXMnLCBvLmltcG9ydEV4cHIoUjMuZ2V0Q29tcG9uZW50RGVwc0ZhY3RvcnkpLmNhbGxGbihhcmdzKSk7XG4gIH1cblxuICBpZiAobWV0YS5lbmNhcHN1bGF0aW9uID09PSBudWxsKSB7XG4gICAgbWV0YS5lbmNhcHN1bGF0aW9uID0gY29yZS5WaWV3RW5jYXBzdWxhdGlvbi5FbXVsYXRlZDtcbiAgfVxuXG4gIC8vIGUuZy4gYHN0eWxlczogW3N0cjEsIHN0cjJdYFxuICBpZiAobWV0YS5zdHlsZXMgJiYgbWV0YS5zdHlsZXMubGVuZ3RoKSB7XG4gICAgY29uc3Qgc3R5bGVWYWx1ZXMgPSBtZXRhLmVuY2Fwc3VsYXRpb24gPT0gY29yZS5WaWV3RW5jYXBzdWxhdGlvbi5FbXVsYXRlZCA/XG4gICAgICAgIGNvbXBpbGVTdHlsZXMobWV0YS5zdHlsZXMsIENPTlRFTlRfQVRUUiwgSE9TVF9BVFRSKSA6XG4gICAgICAgIG1ldGEuc3R5bGVzO1xuICAgIGNvbnN0IHN0eWxlTm9kZXMgPSBzdHlsZVZhbHVlcy5yZWR1Y2UoKHJlc3VsdCwgc3R5bGUpID0+IHtcbiAgICAgIGlmIChzdHlsZS50cmltKCkubGVuZ3RoID4gMCkge1xuICAgICAgICByZXN1bHQucHVzaChjb25zdGFudFBvb2wuZ2V0Q29uc3RMaXRlcmFsKG8ubGl0ZXJhbChzdHlsZSkpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSwgW10gYXMgby5FeHByZXNzaW9uW10pO1xuXG4gICAgaWYgKHN0eWxlTm9kZXMubGVuZ3RoID4gMCkge1xuICAgICAgZGVmaW5pdGlvbk1hcC5zZXQoJ3N0eWxlcycsIG8ubGl0ZXJhbEFycihzdHlsZU5vZGVzKSk7XG4gICAgfVxuICB9IGVsc2UgaWYgKG1ldGEuZW5jYXBzdWxhdGlvbiA9PT0gY29yZS5WaWV3RW5jYXBzdWxhdGlvbi5FbXVsYXRlZCkge1xuICAgIC8vIElmIHRoZXJlIGlzIG5vIHN0eWxlLCBkb24ndCBnZW5lcmF0ZSBjc3Mgc2VsZWN0b3JzIG9uIGVsZW1lbnRzXG4gICAgbWV0YS5lbmNhcHN1bGF0aW9uID0gY29yZS5WaWV3RW5jYXBzdWxhdGlvbi5Ob25lO1xuICB9XG5cbiAgLy8gT25seSBzZXQgdmlldyBlbmNhcHN1bGF0aW9uIGlmIGl0J3Mgbm90IHRoZSBkZWZhdWx0IHZhbHVlXG4gIGlmIChtZXRhLmVuY2Fwc3VsYXRpb24gIT09IGNvcmUuVmlld0VuY2Fwc3VsYXRpb24uRW11bGF0ZWQpIHtcbiAgICBkZWZpbml0aW9uTWFwLnNldCgnZW5jYXBzdWxhdGlvbicsIG8ubGl0ZXJhbChtZXRhLmVuY2Fwc3VsYXRpb24pKTtcbiAgfVxuXG4gIC8vIGUuZy4gYGFuaW1hdGlvbjogW3RyaWdnZXIoJzEyMycsIFtdKV1gXG4gIGlmIChtZXRhLmFuaW1hdGlvbnMgIT09IG51bGwpIHtcbiAgICBkZWZpbml0aW9uTWFwLnNldChcbiAgICAgICAgJ2RhdGEnLCBvLmxpdGVyYWxNYXAoW3trZXk6ICdhbmltYXRpb24nLCB2YWx1ZTogbWV0YS5hbmltYXRpb25zLCBxdW90ZWQ6IGZhbHNlfV0pKTtcbiAgfVxuXG4gIC8vIFNldHRpbmcgY2hhbmdlIGRldGVjdGlvbiBmbGFnXG4gIGlmIChtZXRhLmNoYW5nZURldGVjdGlvbiAhPT0gbnVsbCkge1xuICAgIGlmICh0eXBlb2YgbWV0YS5jaGFuZ2VEZXRlY3Rpb24gPT09ICdudW1iZXInICYmXG4gICAgICAgIG1ldGEuY2hhbmdlRGV0ZWN0aW9uICE9PSBjb3JlLkNoYW5nZURldGVjdGlvblN0cmF0ZWd5LkRlZmF1bHQpIHtcbiAgICAgIC8vIGNoYW5nZURldGVjdGlvbiBpcyByZXNvbHZlZCBkdXJpbmcgYW5hbHlzaXMuIE9ubHkgc2V0IGl0IGlmIG5vdCB0aGUgZGVmYXVsdC5cbiAgICAgIGRlZmluaXRpb25NYXAuc2V0KCdjaGFuZ2VEZXRlY3Rpb24nLCBvLmxpdGVyYWwobWV0YS5jaGFuZ2VEZXRlY3Rpb24pKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBtZXRhLmNoYW5nZURldGVjdGlvbiA9PT0gJ29iamVjdCcpIHtcbiAgICAgIC8vIGNoYW5nZURldGVjdGlvbiBpcyBub3QgcmVzb2x2ZWQgZHVyaW5nIGFuYWx5c2lzIChlLmcuLCB3ZSBhcmUgaW4gbG9jYWwgY29tcGlsYXRpb24gbW9kZSkuXG4gICAgICAvLyBTbyBwbGFjZSBpdCBhcyBpcy5cbiAgICAgIGRlZmluaXRpb25NYXAuc2V0KCdjaGFuZ2VEZXRlY3Rpb24nLCBtZXRhLmNoYW5nZURldGVjdGlvbik7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgZXhwcmVzc2lvbiA9XG4gICAgICBvLmltcG9ydEV4cHIoUjMuZGVmaW5lQ29tcG9uZW50KS5jYWxsRm4oW2RlZmluaXRpb25NYXAudG9MaXRlcmFsTWFwKCldLCB1bmRlZmluZWQsIHRydWUpO1xuICBjb25zdCB0eXBlID0gY3JlYXRlQ29tcG9uZW50VHlwZShtZXRhKTtcblxuICByZXR1cm4ge2V4cHJlc3Npb24sIHR5cGUsIHN0YXRlbWVudHM6IFtdfTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIHRoZSB0eXBlIHNwZWNpZmljYXRpb24gZnJvbSB0aGUgY29tcG9uZW50IG1ldGEuIFRoaXMgdHlwZSBpcyBpbnNlcnRlZCBpbnRvIC5kLnRzIGZpbGVzXG4gKiB0byBiZSBjb25zdW1lZCBieSB1cHN0cmVhbSBjb21waWxhdGlvbnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDb21wb25lbnRUeXBlKG1ldGE6IFIzQ29tcG9uZW50TWV0YWRhdGE8UjNUZW1wbGF0ZURlcGVuZGVuY3k+KTogby5UeXBlIHtcbiAgY29uc3QgdHlwZVBhcmFtcyA9IGNyZWF0ZUJhc2VEaXJlY3RpdmVUeXBlUGFyYW1zKG1ldGEpO1xuICB0eXBlUGFyYW1zLnB1c2goc3RyaW5nQXJyYXlBc1R5cGUobWV0YS50ZW1wbGF0ZS5uZ0NvbnRlbnRTZWxlY3RvcnMpKTtcbiAgdHlwZVBhcmFtcy5wdXNoKG8uZXhwcmVzc2lvblR5cGUoby5saXRlcmFsKG1ldGEuaXNTdGFuZGFsb25lKSkpO1xuICB0eXBlUGFyYW1zLnB1c2goY3JlYXRlSG9zdERpcmVjdGl2ZXNUeXBlKG1ldGEpKTtcbiAgLy8gVE9ETyhzaWduYWxzKTogQWx3YXlzIGluY2x1ZGUgdGhpcyBtZXRhZGF0YSBzdGFydGluZyB3aXRoIHYxNy4gUmlnaHRcbiAgLy8gbm93IEFuZ3VsYXIgdjE2LjAueCBkb2VzIG5vdCBzdXBwb3J0IHRoaXMgZmllbGQgYW5kIGxpYnJhcnkgZGlzdHJpYnV0aW9uc1xuICAvLyB3b3VsZCB0aGVuIGJlIGluY29tcGF0aWJsZSB3aXRoIHYxNi4wLnggZnJhbWV3b3JrIHVzZXJzLlxuICBpZiAobWV0YS5pc1NpZ25hbCkge1xuICAgIHR5cGVQYXJhbXMucHVzaChvLmV4cHJlc3Npb25UeXBlKG8ubGl0ZXJhbChtZXRhLmlzU2lnbmFsKSkpO1xuICB9XG4gIHJldHVybiBvLmV4cHJlc3Npb25UeXBlKG8uaW1wb3J0RXhwcihSMy5Db21wb25lbnREZWNsYXJhdGlvbiwgdHlwZVBhcmFtcykpO1xufVxuXG4vKipcbiAqIENvbXBpbGVzIHRoZSBhcnJheSBsaXRlcmFsIG9mIGRlY2xhcmF0aW9ucyBpbnRvIGFuIGV4cHJlc3Npb24gYWNjb3JkaW5nIHRvIHRoZSBwcm92aWRlZCBlbWl0XG4gKiBtb2RlLlxuICovXG5mdW5jdGlvbiBjb21waWxlRGVjbGFyYXRpb25MaXN0KFxuICAgIGxpc3Q6IG8uTGl0ZXJhbEFycmF5RXhwciwgbW9kZTogRGVjbGFyYXRpb25MaXN0RW1pdE1vZGUpOiBvLkV4cHJlc3Npb24ge1xuICBzd2l0Y2ggKG1vZGUpIHtcbiAgICBjYXNlIERlY2xhcmF0aW9uTGlzdEVtaXRNb2RlLkRpcmVjdDpcbiAgICAgIC8vIGRpcmVjdGl2ZXM6IFtNeURpcl0sXG4gICAgICByZXR1cm4gbGlzdDtcbiAgICBjYXNlIERlY2xhcmF0aW9uTGlzdEVtaXRNb2RlLkNsb3N1cmU6XG4gICAgICAvLyBkaXJlY3RpdmVzOiBmdW5jdGlvbiAoKSB7IHJldHVybiBbTXlEaXJdOyB9XG4gICAgICByZXR1cm4gby5hcnJvd0ZuKFtdLCBsaXN0KTtcbiAgICBjYXNlIERlY2xhcmF0aW9uTGlzdEVtaXRNb2RlLkNsb3N1cmVSZXNvbHZlZDpcbiAgICAgIC8vIGRpcmVjdGl2ZXM6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIFtNeURpcl0ubWFwKG5nLnJlc29sdmVGb3J3YXJkUmVmKTsgfVxuICAgICAgY29uc3QgcmVzb2x2ZWRMaXN0ID0gbGlzdC5wcm9wKCdtYXAnKS5jYWxsRm4oW28uaW1wb3J0RXhwcihSMy5yZXNvbHZlRm9yd2FyZFJlZildKTtcbiAgICAgIHJldHVybiBvLmFycm93Rm4oW10sIHJlc29sdmVkTGlzdCk7XG4gICAgY2FzZSBEZWNsYXJhdGlvbkxpc3RFbWl0TW9kZS5SdW50aW1lUmVzb2x2ZWQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIHdpdGggYW4gYXJyYXkgb2YgcHJlLXJlc29sdmVkIGRlcGVuZGVuY2llc2ApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnRBdHRyaWJ1dGVzVG9FeHByZXNzaW9ucyhhdHRyaWJ1dGVzOiB7W25hbWU6IHN0cmluZ106IG8uRXhwcmVzc2lvbn0pOlxuICAgIG8uRXhwcmVzc2lvbltdIHtcbiAgY29uc3QgdmFsdWVzOiBvLkV4cHJlc3Npb25bXSA9IFtdO1xuICBmb3IgKGxldCBrZXkgb2YgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoYXR0cmlidXRlcykpIHtcbiAgICBjb25zdCB2YWx1ZSA9IGF0dHJpYnV0ZXNba2V5XTtcbiAgICB2YWx1ZXMucHVzaChvLmxpdGVyYWwoa2V5KSwgdmFsdWUpO1xuICB9XG4gIHJldHVybiB2YWx1ZXM7XG59XG5cbmZ1bmN0aW9uIHN0cmluZ0FzVHlwZShzdHI6IHN0cmluZyk6IG8uVHlwZSB7XG4gIHJldHVybiBvLmV4cHJlc3Npb25UeXBlKG8ubGl0ZXJhbChzdHIpKTtcbn1cblxuZnVuY3Rpb24gc3RyaW5nTWFwQXNMaXRlcmFsRXhwcmVzc2lvbihtYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd8c3RyaW5nW119KTogby5MaXRlcmFsTWFwRXhwciB7XG4gIGNvbnN0IG1hcFZhbHVlcyA9IE9iamVjdC5rZXlzKG1hcCkubWFwKGtleSA9PiB7XG4gICAgY29uc3QgdmFsdWUgPSBBcnJheS5pc0FycmF5KG1hcFtrZXldKSA/IG1hcFtrZXldWzBdIDogbWFwW2tleV07XG4gICAgcmV0dXJuIHtcbiAgICAgIGtleSxcbiAgICAgIHZhbHVlOiBvLmxpdGVyYWwodmFsdWUpLFxuICAgICAgcXVvdGVkOiB0cnVlLFxuICAgIH07XG4gIH0pO1xuXG4gIHJldHVybiBvLmxpdGVyYWxNYXAobWFwVmFsdWVzKTtcbn1cblxuZnVuY3Rpb24gc3RyaW5nQXJyYXlBc1R5cGUoYXJyOiBSZWFkb25seUFycmF5PHN0cmluZ3xudWxsPik6IG8uVHlwZSB7XG4gIHJldHVybiBhcnIubGVuZ3RoID4gMCA/IG8uZXhwcmVzc2lvblR5cGUoby5saXRlcmFsQXJyKGFyci5tYXAodmFsdWUgPT4gby5saXRlcmFsKHZhbHVlKSkpKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgIG8uTk9ORV9UWVBFO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVCYXNlRGlyZWN0aXZlVHlwZVBhcmFtcyhtZXRhOiBSM0RpcmVjdGl2ZU1ldGFkYXRhKTogby5UeXBlW10ge1xuICAvLyBPbiB0aGUgdHlwZSBzaWRlLCByZW1vdmUgbmV3bGluZXMgZnJvbSB0aGUgc2VsZWN0b3IgYXMgaXQgd2lsbCBuZWVkIHRvIGZpdCBpbnRvIGEgVHlwZVNjcmlwdFxuICAvLyBzdHJpbmcgbGl0ZXJhbCwgd2hpY2ggbXVzdCBiZSBvbiBvbmUgbGluZS5cbiAgY29uc3Qgc2VsZWN0b3JGb3JUeXBlID0gbWV0YS5zZWxlY3RvciAhPT0gbnVsbCA/IG1ldGEuc2VsZWN0b3IucmVwbGFjZSgvXFxuL2csICcnKSA6IG51bGw7XG5cbiAgcmV0dXJuIFtcbiAgICB0eXBlV2l0aFBhcmFtZXRlcnMobWV0YS50eXBlLnR5cGUsIG1ldGEudHlwZUFyZ3VtZW50Q291bnQpLFxuICAgIHNlbGVjdG9yRm9yVHlwZSAhPT0gbnVsbCA/IHN0cmluZ0FzVHlwZShzZWxlY3RvckZvclR5cGUpIDogby5OT05FX1RZUEUsXG4gICAgbWV0YS5leHBvcnRBcyAhPT0gbnVsbCA/IHN0cmluZ0FycmF5QXNUeXBlKG1ldGEuZXhwb3J0QXMpIDogby5OT05FX1RZUEUsXG4gICAgby5leHByZXNzaW9uVHlwZShnZXRJbnB1dHNUeXBlRXhwcmVzc2lvbihtZXRhKSksXG4gICAgby5leHByZXNzaW9uVHlwZShzdHJpbmdNYXBBc0xpdGVyYWxFeHByZXNzaW9uKG1ldGEub3V0cHV0cykpLFxuICAgIHN0cmluZ0FycmF5QXNUeXBlKG1ldGEucXVlcmllcy5tYXAocSA9PiBxLnByb3BlcnR5TmFtZSkpLFxuICBdO1xufVxuXG5mdW5jdGlvbiBnZXRJbnB1dHNUeXBlRXhwcmVzc2lvbihtZXRhOiBSM0RpcmVjdGl2ZU1ldGFkYXRhKTogby5FeHByZXNzaW9uIHtcbiAgcmV0dXJuIG8ubGl0ZXJhbE1hcChPYmplY3Qua2V5cyhtZXRhLmlucHV0cykubWFwKGtleSA9PiB7XG4gICAgY29uc3QgdmFsdWUgPSBtZXRhLmlucHV0c1trZXldO1xuICAgIGNvbnN0IHZhbHVlcyA9IFtcbiAgICAgIHtrZXk6ICdhbGlhcycsIHZhbHVlOiBvLmxpdGVyYWwodmFsdWUuYmluZGluZ1Byb3BlcnR5TmFtZSksIHF1b3RlZDogdHJ1ZX0sXG4gICAgICB7a2V5OiAncmVxdWlyZWQnLCB2YWx1ZTogby5saXRlcmFsKHZhbHVlLnJlcXVpcmVkKSwgcXVvdGVkOiB0cnVlfSxcbiAgICBdO1xuXG4gICAgLy8gVE9ETyhsZWdhY3ktcGFydGlhbC1vdXRwdXQtaW5wdXRzKTogQ29uc2lkZXIgYWx3YXlzIGVtaXR0aW5nIHRoaXMgaW5mb3JtYXRpb24sXG4gICAgLy8gb3IgbGVhdmluZyBpdCBhcyBpcy5cbiAgICBpZiAodmFsdWUuaXNTaWduYWwpIHtcbiAgICAgIHZhbHVlcy5wdXNoKHtrZXk6ICdpc1NpZ25hbCcsIHZhbHVlOiBvLmxpdGVyYWwodmFsdWUuaXNTaWduYWwpLCBxdW90ZWQ6IHRydWV9KTtcbiAgICB9XG5cbiAgICByZXR1cm4ge2tleSwgdmFsdWU6IG8ubGl0ZXJhbE1hcCh2YWx1ZXMpLCBxdW90ZWQ6IHRydWV9O1xuICB9KSk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyB0aGUgdHlwZSBzcGVjaWZpY2F0aW9uIGZyb20gdGhlIGRpcmVjdGl2ZSBtZXRhLiBUaGlzIHR5cGUgaXMgaW5zZXJ0ZWQgaW50byAuZC50cyBmaWxlc1xuICogdG8gYmUgY29uc3VtZWQgYnkgdXBzdHJlYW0gY29tcGlsYXRpb25zLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRGlyZWN0aXZlVHlwZShtZXRhOiBSM0RpcmVjdGl2ZU1ldGFkYXRhKTogby5UeXBlIHtcbiAgY29uc3QgdHlwZVBhcmFtcyA9IGNyZWF0ZUJhc2VEaXJlY3RpdmVUeXBlUGFyYW1zKG1ldGEpO1xuICAvLyBEaXJlY3RpdmVzIGhhdmUgbm8gTmdDb250ZW50U2VsZWN0b3JzIHNsb3QsIGJ1dCBpbnN0ZWFkIGV4cHJlc3MgYSBgbmV2ZXJgIHR5cGVcbiAgLy8gc28gdGhhdCBmdXR1cmUgZmllbGRzIGFsaWduLlxuICB0eXBlUGFyYW1zLnB1c2goby5OT05FX1RZUEUpO1xuICB0eXBlUGFyYW1zLnB1c2goby5leHByZXNzaW9uVHlwZShvLmxpdGVyYWwobWV0YS5pc1N0YW5kYWxvbmUpKSk7XG4gIHR5cGVQYXJhbXMucHVzaChjcmVhdGVIb3N0RGlyZWN0aXZlc1R5cGUobWV0YSkpO1xuICAvLyBUT0RPKHNpZ25hbHMpOiBBbHdheXMgaW5jbHVkZSB0aGlzIG1ldGFkYXRhIHN0YXJ0aW5nIHdpdGggdjE3LiBSaWdodFxuICAvLyBub3cgQW5ndWxhciB2MTYuMC54IGRvZXMgbm90IHN1cHBvcnQgdGhpcyBmaWVsZCBhbmQgbGlicmFyeSBkaXN0cmlidXRpb25zXG4gIC8vIHdvdWxkIHRoZW4gYmUgaW5jb21wYXRpYmxlIHdpdGggdjE2LjAueCBmcmFtZXdvcmsgdXNlcnMuXG4gIGlmIChtZXRhLmlzU2lnbmFsKSB7XG4gICAgdHlwZVBhcmFtcy5wdXNoKG8uZXhwcmVzc2lvblR5cGUoby5saXRlcmFsKG1ldGEuaXNTaWduYWwpKSk7XG4gIH1cbiAgcmV0dXJuIG8uZXhwcmVzc2lvblR5cGUoby5pbXBvcnRFeHByKFIzLkRpcmVjdGl2ZURlY2xhcmF0aW9uLCB0eXBlUGFyYW1zKSk7XG59XG5cbi8vIFJldHVybiBhIGhvc3QgYmluZGluZyBmdW5jdGlvbiBvciBudWxsIGlmIG9uZSBpcyBub3QgbmVjZXNzYXJ5LlxuZnVuY3Rpb24gY3JlYXRlSG9zdEJpbmRpbmdzRnVuY3Rpb24oXG4gICAgaG9zdEJpbmRpbmdzTWV0YWRhdGE6IFIzSG9zdE1ldGFkYXRhLCB0eXBlU291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgIGJpbmRpbmdQYXJzZXI6IEJpbmRpbmdQYXJzZXIsIGNvbnN0YW50UG9vbDogQ29uc3RhbnRQb29sLCBzZWxlY3Rvcjogc3RyaW5nLCBuYW1lOiBzdHJpbmcsXG4gICAgZGVmaW5pdGlvbk1hcDogRGVmaW5pdGlvbk1hcCk6IG8uRXhwcmVzc2lvbnxudWxsIHtcbiAgY29uc3QgYmluZGluZ3MgPVxuICAgICAgYmluZGluZ1BhcnNlci5jcmVhdGVCb3VuZEhvc3RQcm9wZXJ0aWVzKGhvc3RCaW5kaW5nc01ldGFkYXRhLnByb3BlcnRpZXMsIHR5cGVTb3VyY2VTcGFuKTtcblxuICAvLyBDYWxjdWxhdGUgaG9zdCBldmVudCBiaW5kaW5nc1xuICBjb25zdCBldmVudEJpbmRpbmdzID1cbiAgICAgIGJpbmRpbmdQYXJzZXIuY3JlYXRlRGlyZWN0aXZlSG9zdEV2ZW50QXN0cyhob3N0QmluZGluZ3NNZXRhZGF0YS5saXN0ZW5lcnMsIHR5cGVTb3VyY2VTcGFuKTtcblxuICBpZiAoVVNFX1RFTVBMQVRFX1BJUEVMSU5FIHx8IGhvc3RCaW5kaW5nc01ldGFkYXRhLnVzZVRlbXBsYXRlUGlwZWxpbmUpIHtcbiAgICAvLyBUaGUgcGFyc2VyIGZvciBob3N0IGJpbmRpbmdzIHRyZWF0cyBjbGFzcyBhbmQgc3R5bGUgYXR0cmlidXRlcyBzcGVjaWFsbHkgLS0gdGhleSBhcmVcbiAgICAvLyBleHRyYWN0ZWQgaW50byB0aGVzZSBzZXBhcmF0ZSBmaWVsZHMuIFRoaXMgaXMgbm90IHRoZSBjYXNlIGZvciB0ZW1wbGF0ZXMsIHNvIHRoZSBjb21waWxlciBjYW5cbiAgICAvLyBhY3R1YWxseSBhbHJlYWR5IGhhbmRsZSB0aGVzZSBzcGVjaWFsIGF0dHJpYnV0ZXMgaW50ZXJuYWxseS4gVGhlcmVmb3JlLCB3ZSBqdXN0IGRyb3AgdGhlbVxuICAgIC8vIGludG8gdGhlIGF0dHJpYnV0ZXMgbWFwLlxuICAgIGlmIChob3N0QmluZGluZ3NNZXRhZGF0YS5zcGVjaWFsQXR0cmlidXRlcy5zdHlsZUF0dHIpIHtcbiAgICAgIGhvc3RCaW5kaW5nc01ldGFkYXRhLmF0dHJpYnV0ZXNbJ3N0eWxlJ10gPVxuICAgICAgICAgIG8ubGl0ZXJhbChob3N0QmluZGluZ3NNZXRhZGF0YS5zcGVjaWFsQXR0cmlidXRlcy5zdHlsZUF0dHIpO1xuICAgIH1cbiAgICBpZiAoaG9zdEJpbmRpbmdzTWV0YWRhdGEuc3BlY2lhbEF0dHJpYnV0ZXMuY2xhc3NBdHRyKSB7XG4gICAgICBob3N0QmluZGluZ3NNZXRhZGF0YS5hdHRyaWJ1dGVzWydjbGFzcyddID1cbiAgICAgICAgICBvLmxpdGVyYWwoaG9zdEJpbmRpbmdzTWV0YWRhdGEuc3BlY2lhbEF0dHJpYnV0ZXMuY2xhc3NBdHRyKTtcbiAgICB9XG5cbiAgICBjb25zdCBob3N0Sm9iID0gaW5nZXN0SG9zdEJpbmRpbmcoXG4gICAgICAgIHtcbiAgICAgICAgICBjb21wb25lbnROYW1lOiBuYW1lLFxuICAgICAgICAgIGNvbXBvbmVudFNlbGVjdG9yOiBzZWxlY3RvcixcbiAgICAgICAgICBwcm9wZXJ0aWVzOiBiaW5kaW5ncyxcbiAgICAgICAgICBldmVudHM6IGV2ZW50QmluZGluZ3MsXG4gICAgICAgICAgYXR0cmlidXRlczogaG9zdEJpbmRpbmdzTWV0YWRhdGEuYXR0cmlidXRlcyxcbiAgICAgICAgfSxcbiAgICAgICAgYmluZGluZ1BhcnNlciwgY29uc3RhbnRQb29sKTtcbiAgICB0cmFuc2Zvcm0oaG9zdEpvYiwgQ29tcGlsYXRpb25Kb2JLaW5kLkhvc3QpO1xuXG4gICAgZGVmaW5pdGlvbk1hcC5zZXQoJ2hvc3RBdHRycycsIGhvc3RKb2Iucm9vdC5hdHRyaWJ1dGVzKTtcblxuICAgIGNvbnN0IHZhckNvdW50ID0gaG9zdEpvYi5yb290LnZhcnM7XG4gICAgaWYgKHZhckNvdW50ICE9PSBudWxsICYmIHZhckNvdW50ID4gMCkge1xuICAgICAgZGVmaW5pdGlvbk1hcC5zZXQoJ2hvc3RWYXJzJywgby5saXRlcmFsKHZhckNvdW50KSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGVtaXRIb3N0QmluZGluZ0Z1bmN0aW9uKGhvc3RKb2IpO1xuICB9XG5cbiAgbGV0IGJpbmRpbmdJZCA9IDA7XG4gIGNvbnN0IGdldE5leHRCaW5kaW5nSWQgPSAoKSA9PiBgJHtiaW5kaW5nSWQrK31gO1xuXG4gIGNvbnN0IGJpbmRpbmdDb250ZXh0ID0gby52YXJpYWJsZShDT05URVhUX05BTUUpO1xuICBjb25zdCBzdHlsZUJ1aWxkZXIgPSBuZXcgU3R5bGluZ0J1aWxkZXIoYmluZGluZ0NvbnRleHQpO1xuXG4gIGNvbnN0IHtzdHlsZUF0dHIsIGNsYXNzQXR0cn0gPSBob3N0QmluZGluZ3NNZXRhZGF0YS5zcGVjaWFsQXR0cmlidXRlcztcbiAgaWYgKHN0eWxlQXR0ciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgc3R5bGVCdWlsZGVyLnJlZ2lzdGVyU3R5bGVBdHRyKHN0eWxlQXR0cik7XG4gIH1cbiAgaWYgKGNsYXNzQXR0ciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgc3R5bGVCdWlsZGVyLnJlZ2lzdGVyQ2xhc3NBdHRyKGNsYXNzQXR0cik7XG4gIH1cblxuICBjb25zdCBjcmVhdGVJbnN0cnVjdGlvbnM6IEluc3RydWN0aW9uW10gPSBbXTtcbiAgY29uc3QgdXBkYXRlSW5zdHJ1Y3Rpb25zOiBJbnN0cnVjdGlvbltdID0gW107XG4gIGNvbnN0IHVwZGF0ZVZhcmlhYmxlczogby5TdGF0ZW1lbnRbXSA9IFtdO1xuXG4gIGNvbnN0IGhvc3RCaW5kaW5nU291cmNlU3BhbiA9IHR5cGVTb3VyY2VTcGFuO1xuICBpZiAoZXZlbnRCaW5kaW5ncyAmJiBldmVudEJpbmRpbmdzLmxlbmd0aCkge1xuICAgIGNyZWF0ZUluc3RydWN0aW9ucy5wdXNoKC4uLmNyZWF0ZUhvc3RMaXN0ZW5lcnMoZXZlbnRCaW5kaW5ncywgbmFtZSkpO1xuICB9XG5cbiAgLy8gQ2FsY3VsYXRlIHRoZSBob3N0IHByb3BlcnR5IGJpbmRpbmdzXG4gIGNvbnN0IGFsbE90aGVyQmluZGluZ3M6IFBhcnNlZFByb3BlcnR5W10gPSBbXTtcblxuICAvLyBXZSBuZWVkIHRvIGNhbGN1bGF0ZSB0aGUgdG90YWwgYW1vdW50IG9mIGJpbmRpbmcgc2xvdHMgcmVxdWlyZWQgYnlcbiAgLy8gYWxsIHRoZSBpbnN0cnVjdGlvbnMgdG9nZXRoZXIgYmVmb3JlIGFueSB2YWx1ZSBjb252ZXJzaW9ucyBoYXBwZW4uXG4gIC8vIFZhbHVlIGNvbnZlcnNpb25zIG1heSByZXF1aXJlIGFkZGl0aW9uYWwgc2xvdHMgZm9yIGludGVycG9sYXRpb24gYW5kXG4gIC8vIGJpbmRpbmdzIHdpdGggcGlwZXMuIFRoZXNlIGNhbGN1bGF0ZXMgaGFwcGVuIGFmdGVyIHRoaXMgYmxvY2suXG4gIGxldCB0b3RhbEhvc3RWYXJzQ291bnQgPSAwO1xuICBiaW5kaW5ncyAmJiBiaW5kaW5ncy5mb3JFYWNoKChiaW5kaW5nOiBQYXJzZWRQcm9wZXJ0eSkgPT4ge1xuICAgIGNvbnN0IHN0eWxpbmdJbnB1dFdhc1NldCA9IHN0eWxlQnVpbGRlci5yZWdpc3RlcklucHV0QmFzZWRPbk5hbWUoXG4gICAgICAgIGJpbmRpbmcubmFtZSwgYmluZGluZy5leHByZXNzaW9uLCBob3N0QmluZGluZ1NvdXJjZVNwYW4pO1xuICAgIGlmIChzdHlsaW5nSW5wdXRXYXNTZXQpIHtcbiAgICAgIHRvdGFsSG9zdFZhcnNDb3VudCArPSBNSU5fU1RZTElOR19CSU5ESU5HX1NMT1RTX1JFUVVJUkVEO1xuICAgIH0gZWxzZSB7XG4gICAgICBhbGxPdGhlckJpbmRpbmdzLnB1c2goYmluZGluZyk7XG4gICAgICB0b3RhbEhvc3RWYXJzQ291bnQrKztcbiAgICB9XG4gIH0pO1xuXG4gIGxldCB2YWx1ZUNvbnZlcnRlcjogVmFsdWVDb252ZXJ0ZXI7XG4gIGNvbnN0IGdldFZhbHVlQ29udmVydGVyID0gKCkgPT4ge1xuICAgIGlmICghdmFsdWVDb252ZXJ0ZXIpIHtcbiAgICAgIGNvbnN0IGhvc3RWYXJzQ291bnRGbiA9IChudW1TbG90czogbnVtYmVyKTogbnVtYmVyID0+IHtcbiAgICAgICAgY29uc3Qgb3JpZ2luYWxWYXJzQ291bnQgPSB0b3RhbEhvc3RWYXJzQ291bnQ7XG4gICAgICAgIHRvdGFsSG9zdFZhcnNDb3VudCArPSBudW1TbG90cztcbiAgICAgICAgcmV0dXJuIG9yaWdpbmFsVmFyc0NvdW50O1xuICAgICAgfTtcbiAgICAgIHZhbHVlQ29udmVydGVyID0gbmV3IFZhbHVlQ29udmVydGVyKFxuICAgICAgICAgIGNvbnN0YW50UG9vbCxcbiAgICAgICAgICAoKSA9PiBlcnJvcignVW5leHBlY3RlZCBub2RlJyksICAvLyBuZXcgbm9kZXMgYXJlIGlsbGVnYWwgaGVyZVxuICAgICAgICAgIGhvc3RWYXJzQ291bnRGbixcbiAgICAgICAgICAoKSA9PiBlcnJvcignVW5leHBlY3RlZCBwaXBlJykpOyAgLy8gcGlwZXMgYXJlIGlsbGVnYWwgaGVyZVxuICAgIH1cbiAgICByZXR1cm4gdmFsdWVDb252ZXJ0ZXI7XG4gIH07XG5cbiAgY29uc3QgcHJvcGVydHlCaW5kaW5nczogby5FeHByZXNzaW9uW11bXSA9IFtdO1xuICBjb25zdCBhdHRyaWJ1dGVCaW5kaW5nczogby5FeHByZXNzaW9uW11bXSA9IFtdO1xuICBjb25zdCBzeW50aGV0aWNIb3N0QmluZGluZ3M6IG8uRXhwcmVzc2lvbltdW10gPSBbXTtcblxuICBmb3IgKGNvbnN0IGJpbmRpbmcgb2YgYWxsT3RoZXJCaW5kaW5ncykge1xuICAgIC8vIHJlc29sdmUgbGl0ZXJhbCBhcnJheXMgYW5kIGxpdGVyYWwgb2JqZWN0c1xuICAgIGNvbnN0IHZhbHVlID0gYmluZGluZy5leHByZXNzaW9uLnZpc2l0KGdldFZhbHVlQ29udmVydGVyKCkpO1xuICAgIGNvbnN0IGJpbmRpbmdFeHByID0gYmluZGluZ0ZuKGJpbmRpbmdDb250ZXh0LCB2YWx1ZSwgZ2V0TmV4dEJpbmRpbmdJZCk7XG5cbiAgICBjb25zdCB7YmluZGluZ05hbWUsIGluc3RydWN0aW9uLCBpc0F0dHJpYnV0ZX0gPSBnZXRCaW5kaW5nTmFtZUFuZEluc3RydWN0aW9uKGJpbmRpbmcpO1xuXG4gICAgY29uc3Qgc2VjdXJpdHlDb250ZXh0cyA9XG4gICAgICAgIGJpbmRpbmdQYXJzZXIuY2FsY1Bvc3NpYmxlU2VjdXJpdHlDb250ZXh0cyhzZWxlY3RvciwgYmluZGluZ05hbWUsIGlzQXR0cmlidXRlKVxuICAgICAgICAgICAgLmZpbHRlcihjb250ZXh0ID0+IGNvbnRleHQgIT09IGNvcmUuU2VjdXJpdHlDb250ZXh0Lk5PTkUpO1xuXG4gICAgbGV0IHNhbml0aXplckZuOiBvLkV4dGVybmFsRXhwcnxudWxsID0gbnVsbDtcbiAgICBpZiAoc2VjdXJpdHlDb250ZXh0cy5sZW5ndGgpIHtcbiAgICAgIGlmIChzZWN1cml0eUNvbnRleHRzLmxlbmd0aCA9PT0gMiAmJlxuICAgICAgICAgIHNlY3VyaXR5Q29udGV4dHMuaW5kZXhPZihjb3JlLlNlY3VyaXR5Q29udGV4dC5VUkwpID4gLTEgJiZcbiAgICAgICAgICBzZWN1cml0eUNvbnRleHRzLmluZGV4T2YoY29yZS5TZWN1cml0eUNvbnRleHQuUkVTT1VSQ0VfVVJMKSA+IC0xKSB7XG4gICAgICAgIC8vIFNwZWNpYWwgY2FzZSBmb3Igc29tZSBVUkwgYXR0cmlidXRlcyAoc3VjaCBhcyBcInNyY1wiIGFuZCBcImhyZWZcIikgdGhhdCBtYXkgYmUgYSBwYXJ0XG4gICAgICAgIC8vIG9mIGRpZmZlcmVudCBzZWN1cml0eSBjb250ZXh0cy4gSW4gdGhpcyBjYXNlIHdlIHVzZSBzcGVjaWFsIHNhbml0aXphdGlvbiBmdW5jdGlvbiBhbmRcbiAgICAgICAgLy8gc2VsZWN0IHRoZSBhY3R1YWwgc2FuaXRpemVyIGF0IHJ1bnRpbWUgYmFzZWQgb24gYSB0YWcgbmFtZSB0aGF0IGlzIHByb3ZpZGVkIHdoaWxlXG4gICAgICAgIC8vIGludm9raW5nIHNhbml0aXphdGlvbiBmdW5jdGlvbi5cbiAgICAgICAgc2FuaXRpemVyRm4gPSBvLmltcG9ydEV4cHIoUjMuc2FuaXRpemVVcmxPclJlc291cmNlVXJsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNhbml0aXplckZuID0gcmVzb2x2ZVNhbml0aXphdGlvbkZuKHNlY3VyaXR5Q29udGV4dHNbMF0sIGlzQXR0cmlidXRlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgaW5zdHJ1Y3Rpb25QYXJhbXMgPSBbby5saXRlcmFsKGJpbmRpbmdOYW1lKSwgYmluZGluZ0V4cHIuY3VyclZhbEV4cHJdO1xuICAgIGlmIChzYW5pdGl6ZXJGbikge1xuICAgICAgaW5zdHJ1Y3Rpb25QYXJhbXMucHVzaChzYW5pdGl6ZXJGbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIElmIHRoZXJlIHdhcyBubyBzYW5pdGl6YXRpb24gZnVuY3Rpb24gZm91bmQgYmFzZWQgb24gdGhlIHNlY3VyaXR5IGNvbnRleHRcbiAgICAgIC8vIG9mIGFuIGF0dHJpYnV0ZS9wcm9wZXJ0eSBiaW5kaW5nIC0gY2hlY2sgd2hldGhlciB0aGlzIGF0dHJpYnV0ZS9wcm9wZXJ0eSBpc1xuICAgICAgLy8gb25lIG9mIHRoZSBzZWN1cml0eS1zZW5zaXRpdmUgPGlmcmFtZT4gYXR0cmlidXRlcy5cbiAgICAgIC8vIE5vdGU6IGZvciBob3N0IGJpbmRpbmdzIGRlZmluZWQgb24gYSBkaXJlY3RpdmUsIHdlIGRvIG5vdCB0cnkgdG8gZmluZCBhbGxcbiAgICAgIC8vIHBvc3NpYmxlIHBsYWNlcyB3aGVyZSBpdCBjYW4gYmUgbWF0Y2hlZCwgc28gd2UgY2FuIG5vdCBkZXRlcm1pbmUgd2hldGhlclxuICAgICAgLy8gdGhlIGhvc3QgZWxlbWVudCBpcyBhbiA8aWZyYW1lPi4gSW4gdGhpcyBjYXNlLCBpZiBhbiBhdHRyaWJ1dGUvYmluZGluZ1xuICAgICAgLy8gbmFtZSBpcyBpbiB0aGUgYElGUkFNRV9TRUNVUklUWV9TRU5TSVRJVkVfQVRUUlNgIHNldCAtIGFwcGVuZCBhIHZhbGlkYXRpb25cbiAgICAgIC8vIGZ1bmN0aW9uLCB3aGljaCB3b3VsZCBiZSBpbnZva2VkIGF0IHJ1bnRpbWUgYW5kIHdvdWxkIGhhdmUgYWNjZXNzIHRvIHRoZVxuICAgICAgLy8gdW5kZXJseWluZyBET00gZWxlbWVudCwgY2hlY2sgaWYgaXQncyBhbiA8aWZyYW1lPiBhbmQgaWYgc28gLSBydW5zIGV4dHJhIGNoZWNrcy5cbiAgICAgIGlmIChpc0lmcmFtZVNlY3VyaXR5U2Vuc2l0aXZlQXR0cihiaW5kaW5nTmFtZSkpIHtcbiAgICAgICAgaW5zdHJ1Y3Rpb25QYXJhbXMucHVzaChvLmltcG9ydEV4cHIoUjMudmFsaWRhdGVJZnJhbWVBdHRyaWJ1dGUpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB1cGRhdGVWYXJpYWJsZXMucHVzaCguLi5iaW5kaW5nRXhwci5zdG10cyk7XG5cbiAgICBpZiAoaW5zdHJ1Y3Rpb24gPT09IFIzLmhvc3RQcm9wZXJ0eSkge1xuICAgICAgcHJvcGVydHlCaW5kaW5ncy5wdXNoKGluc3RydWN0aW9uUGFyYW1zKTtcbiAgICB9IGVsc2UgaWYgKGluc3RydWN0aW9uID09PSBSMy5hdHRyaWJ1dGUpIHtcbiAgICAgIGF0dHJpYnV0ZUJpbmRpbmdzLnB1c2goaW5zdHJ1Y3Rpb25QYXJhbXMpO1xuICAgIH0gZWxzZSBpZiAoaW5zdHJ1Y3Rpb24gPT09IFIzLnN5bnRoZXRpY0hvc3RQcm9wZXJ0eSkge1xuICAgICAgc3ludGhldGljSG9zdEJpbmRpbmdzLnB1c2goaW5zdHJ1Y3Rpb25QYXJhbXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB1cGRhdGVJbnN0cnVjdGlvbnMucHVzaCh7cmVmZXJlbmNlOiBpbnN0cnVjdGlvbiwgcGFyYW1zT3JGbjogaW5zdHJ1Y3Rpb25QYXJhbXMsIHNwYW46IG51bGx9KTtcbiAgICB9XG4gIH1cblxuICBmb3IgKGNvbnN0IGJpbmRpbmdQYXJhbXMgb2YgcHJvcGVydHlCaW5kaW5ncykge1xuICAgIHVwZGF0ZUluc3RydWN0aW9ucy5wdXNoKHtyZWZlcmVuY2U6IFIzLmhvc3RQcm9wZXJ0eSwgcGFyYW1zT3JGbjogYmluZGluZ1BhcmFtcywgc3BhbjogbnVsbH0pO1xuICB9XG5cbiAgZm9yIChjb25zdCBiaW5kaW5nUGFyYW1zIG9mIGF0dHJpYnV0ZUJpbmRpbmdzKSB7XG4gICAgdXBkYXRlSW5zdHJ1Y3Rpb25zLnB1c2goe3JlZmVyZW5jZTogUjMuYXR0cmlidXRlLCBwYXJhbXNPckZuOiBiaW5kaW5nUGFyYW1zLCBzcGFuOiBudWxsfSk7XG4gIH1cblxuICBmb3IgKGNvbnN0IGJpbmRpbmdQYXJhbXMgb2Ygc3ludGhldGljSG9zdEJpbmRpbmdzKSB7XG4gICAgdXBkYXRlSW5zdHJ1Y3Rpb25zLnB1c2goXG4gICAgICAgIHtyZWZlcmVuY2U6IFIzLnN5bnRoZXRpY0hvc3RQcm9wZXJ0eSwgcGFyYW1zT3JGbjogYmluZGluZ1BhcmFtcywgc3BhbjogbnVsbH0pO1xuICB9XG5cbiAgLy8gc2luY2Ugd2UncmUgZGVhbGluZyB3aXRoIGRpcmVjdGl2ZXMvY29tcG9uZW50cyBhbmQgYm90aCBoYXZlIGhvc3RCaW5kaW5nXG4gIC8vIGZ1bmN0aW9ucywgd2UgbmVlZCB0byBnZW5lcmF0ZSBhIHNwZWNpYWwgaG9zdEF0dHJzIGluc3RydWN0aW9uIHRoYXQgZGVhbHNcbiAgLy8gd2l0aCBib3RoIHRoZSBhc3NpZ25tZW50IG9mIHN0eWxpbmcgYXMgd2VsbCBhcyBzdGF0aWMgYXR0cmlidXRlcyB0byB0aGUgaG9zdFxuICAvLyBlbGVtZW50LiBUaGUgaW5zdHJ1Y3Rpb24gYmVsb3cgd2lsbCBpbnN0cnVjdCBhbGwgaW5pdGlhbCBzdHlsaW5nIChzdHlsaW5nXG4gIC8vIHRoYXQgaXMgaW5zaWRlIG9mIGEgaG9zdCBiaW5kaW5nIHdpdGhpbiBhIGRpcmVjdGl2ZS9jb21wb25lbnQpIHRvIGJlIGF0dGFjaGVkXG4gIC8vIHRvIHRoZSBob3N0IGVsZW1lbnQgYWxvbmdzaWRlIGFueSBvZiB0aGUgcHJvdmlkZWQgaG9zdCBhdHRyaWJ1dGVzIHRoYXQgd2VyZVxuICAvLyBjb2xsZWN0ZWQgZWFybGllci5cbiAgY29uc3QgaG9zdEF0dHJzID0gY29udmVydEF0dHJpYnV0ZXNUb0V4cHJlc3Npb25zKGhvc3RCaW5kaW5nc01ldGFkYXRhLmF0dHJpYnV0ZXMpO1xuICBzdHlsZUJ1aWxkZXIuYXNzaWduSG9zdEF0dHJzKGhvc3RBdHRycywgZGVmaW5pdGlvbk1hcCk7XG5cbiAgaWYgKHN0eWxlQnVpbGRlci5oYXNCaW5kaW5ncykge1xuICAgIC8vIGZpbmFsbHkgZWFjaCBiaW5kaW5nIHRoYXQgd2FzIHJlZ2lzdGVyZWQgaW4gdGhlIHN0YXRlbWVudCBhYm92ZSB3aWxsIG5lZWQgdG8gYmUgYWRkZWQgdG9cbiAgICAvLyB0aGUgdXBkYXRlIGJsb2NrIG9mIGEgY29tcG9uZW50L2RpcmVjdGl2ZSB0ZW1wbGF0ZUZuL2hvc3RCaW5kaW5nc0ZuIHNvIHRoYXQgdGhlIGJpbmRpbmdzXG4gICAgLy8gYXJlIGV2YWx1YXRlZCBhbmQgdXBkYXRlZCBmb3IgdGhlIGVsZW1lbnQuXG4gICAgc3R5bGVCdWlsZGVyLmJ1aWxkVXBkYXRlTGV2ZWxJbnN0cnVjdGlvbnMoZ2V0VmFsdWVDb252ZXJ0ZXIoKSkuZm9yRWFjaChpbnN0cnVjdGlvbiA9PiB7XG4gICAgICBmb3IgKGNvbnN0IGNhbGwgb2YgaW5zdHJ1Y3Rpb24uY2FsbHMpIHtcbiAgICAgICAgLy8gd2Ugc3VidHJhY3QgYSB2YWx1ZSBvZiBgMWAgaGVyZSBiZWNhdXNlIHRoZSBiaW5kaW5nIHNsb3Qgd2FzIGFscmVhZHkgYWxsb2NhdGVkXG4gICAgICAgIC8vIGF0IHRoZSB0b3Agb2YgdGhpcyBtZXRob2Qgd2hlbiBhbGwgdGhlIGlucHV0IGJpbmRpbmdzIHdlcmUgY291bnRlZC5cbiAgICAgICAgdG90YWxIb3N0VmFyc0NvdW50ICs9XG4gICAgICAgICAgICBNYXRoLm1heChjYWxsLmFsbG9jYXRlQmluZGluZ1Nsb3RzIC0gTUlOX1NUWUxJTkdfQklORElOR19TTE9UU19SRVFVSVJFRCwgMCk7XG5cbiAgICAgICAgY29uc3Qge3BhcmFtcywgc3RtdHN9ID1cbiAgICAgICAgICAgIGNvbnZlcnRTdHlsaW5nQ2FsbChjYWxsLCBiaW5kaW5nQ29udGV4dCwgYmluZGluZ0ZuLCBnZXROZXh0QmluZGluZ0lkKTtcbiAgICAgICAgdXBkYXRlVmFyaWFibGVzLnB1c2goLi4uc3RtdHMpO1xuICAgICAgICB1cGRhdGVJbnN0cnVjdGlvbnMucHVzaCh7XG4gICAgICAgICAgcmVmZXJlbmNlOiBpbnN0cnVjdGlvbi5yZWZlcmVuY2UsXG4gICAgICAgICAgcGFyYW1zT3JGbjogcGFyYW1zLFxuICAgICAgICAgIHNwYW46IG51bGwsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgaWYgKHRvdGFsSG9zdFZhcnNDb3VudCkge1xuICAgIGRlZmluaXRpb25NYXAuc2V0KCdob3N0VmFycycsIG8ubGl0ZXJhbCh0b3RhbEhvc3RWYXJzQ291bnQpKTtcbiAgfVxuXG4gIGlmIChjcmVhdGVJbnN0cnVjdGlvbnMubGVuZ3RoID4gMCB8fCB1cGRhdGVJbnN0cnVjdGlvbnMubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IGhvc3RCaW5kaW5nc0ZuTmFtZSA9IG5hbWUgPyBgJHtuYW1lfV9Ib3N0QmluZGluZ3NgIDogbnVsbDtcbiAgICBjb25zdCBzdGF0ZW1lbnRzOiBvLlN0YXRlbWVudFtdID0gW107XG4gICAgaWYgKGNyZWF0ZUluc3RydWN0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICBzdGF0ZW1lbnRzLnB1c2gocmVuZGVyRmxhZ0NoZWNrSWZTdG10KFxuICAgICAgICAgIGNvcmUuUmVuZGVyRmxhZ3MuQ3JlYXRlLCBnZXRJbnN0cnVjdGlvblN0YXRlbWVudHMoY3JlYXRlSW5zdHJ1Y3Rpb25zKSkpO1xuICAgIH1cbiAgICBpZiAodXBkYXRlSW5zdHJ1Y3Rpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgIHN0YXRlbWVudHMucHVzaChyZW5kZXJGbGFnQ2hlY2tJZlN0bXQoXG4gICAgICAgICAgY29yZS5SZW5kZXJGbGFncy5VcGRhdGUsXG4gICAgICAgICAgdXBkYXRlVmFyaWFibGVzLmNvbmNhdChnZXRJbnN0cnVjdGlvblN0YXRlbWVudHModXBkYXRlSW5zdHJ1Y3Rpb25zKSkpKTtcbiAgICB9XG4gICAgcmV0dXJuIG8uZm4oXG4gICAgICAgIFtuZXcgby5GblBhcmFtKFJFTkRFUl9GTEFHUywgby5OVU1CRVJfVFlQRSksIG5ldyBvLkZuUGFyYW0oQ09OVEVYVF9OQU1FLCBudWxsKV0sIHN0YXRlbWVudHMsXG4gICAgICAgIG8uSU5GRVJSRURfVFlQRSwgbnVsbCwgaG9zdEJpbmRpbmdzRm5OYW1lKTtcbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuXG5mdW5jdGlvbiBiaW5kaW5nRm4oaW1wbGljaXQ6IGFueSwgdmFsdWU6IEFTVCwgZ2V0TmV4dEJpbmRpbmdJZEZuOiAoKSA9PiBzdHJpbmcpIHtcbiAgcmV0dXJuIGNvbnZlcnRQcm9wZXJ0eUJpbmRpbmcobnVsbCwgaW1wbGljaXQsIHZhbHVlLCBnZXROZXh0QmluZGluZ0lkRm4oKSk7XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnRTdHlsaW5nQ2FsbChcbiAgICBjYWxsOiBTdHlsaW5nSW5zdHJ1Y3Rpb25DYWxsLCBiaW5kaW5nQ29udGV4dDogYW55LCBiaW5kaW5nRm46IEZ1bmN0aW9uLFxuICAgIGdldE5leHRCaW5kaW5nSWRGbjogKCkgPT4gc3RyaW5nKSB7XG4gIGNvbnN0IHN0bXRzOiBvLlN0YXRlbWVudFtdID0gW107XG4gIGNvbnN0IHBhcmFtcyA9IGNhbGwucGFyYW1zKHZhbHVlID0+IHtcbiAgICBjb25zdCByZXN1bHQgPSBiaW5kaW5nRm4oYmluZGluZ0NvbnRleHQsIHZhbHVlLCBnZXROZXh0QmluZGluZ0lkRm4pO1xuICAgIGlmIChBcnJheS5pc0FycmF5KHJlc3VsdC5zdG10cykgJiYgcmVzdWx0LnN0bXRzLmxlbmd0aCA+IDApIHtcbiAgICAgIHN0bXRzLnB1c2goLi4ucmVzdWx0LnN0bXRzKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdC5jdXJyVmFsRXhwcjtcbiAgfSk7XG4gIHJldHVybiB7cGFyYW1zLCBzdG10c307XG59XG5cbmZ1bmN0aW9uIGdldEJpbmRpbmdOYW1lQW5kSW5zdHJ1Y3Rpb24oYmluZGluZzogUGFyc2VkUHJvcGVydHkpOlxuICAgIHtiaW5kaW5nTmFtZTogc3RyaW5nLCBpbnN0cnVjdGlvbjogby5FeHRlcm5hbFJlZmVyZW5jZSwgaXNBdHRyaWJ1dGU6IGJvb2xlYW59IHtcbiAgbGV0IGJpbmRpbmdOYW1lID0gYmluZGluZy5uYW1lO1xuICBsZXQgaW5zdHJ1Y3Rpb24hOiBvLkV4dGVybmFsUmVmZXJlbmNlO1xuXG4gIC8vIENoZWNrIHRvIHNlZSBpZiB0aGlzIGlzIGFuIGF0dHIgYmluZGluZyBvciBhIHByb3BlcnR5IGJpbmRpbmdcbiAgY29uc3QgYXR0ck1hdGNoZXMgPSBiaW5kaW5nTmFtZS5tYXRjaChBVFRSX1JFR0VYKTtcbiAgaWYgKGF0dHJNYXRjaGVzKSB7XG4gICAgYmluZGluZ05hbWUgPSBhdHRyTWF0Y2hlc1sxXTtcbiAgICBpbnN0cnVjdGlvbiA9IFIzLmF0dHJpYnV0ZTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoYmluZGluZy5pc0FuaW1hdGlvbikge1xuICAgICAgYmluZGluZ05hbWUgPSBwcmVwYXJlU3ludGhldGljUHJvcGVydHlOYW1lKGJpbmRpbmdOYW1lKTtcbiAgICAgIC8vIGhvc3QgYmluZGluZ3MgdGhhdCBoYXZlIGEgc3ludGhldGljIHByb3BlcnR5IChlLmcuIEBmb28pIHNob3VsZCBhbHdheXMgYmUgcmVuZGVyZWRcbiAgICAgIC8vIGluIHRoZSBjb250ZXh0IG9mIHRoZSBjb21wb25lbnQgYW5kIG5vdCB0aGUgcGFyZW50LiBUaGVyZWZvcmUgdGhlcmUgaXMgYSBzcGVjaWFsXG4gICAgICAvLyBjb21wYXRpYmlsaXR5IGluc3RydWN0aW9uIGF2YWlsYWJsZSBmb3IgdGhpcyBwdXJwb3NlLlxuICAgICAgaW5zdHJ1Y3Rpb24gPSBSMy5zeW50aGV0aWNIb3N0UHJvcGVydHk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGluc3RydWN0aW9uID0gUjMuaG9zdFByb3BlcnR5O1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7YmluZGluZ05hbWUsIGluc3RydWN0aW9uLCBpc0F0dHJpYnV0ZTogISFhdHRyTWF0Y2hlc307XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUhvc3RMaXN0ZW5lcnMoZXZlbnRCaW5kaW5nczogUGFyc2VkRXZlbnRbXSwgbmFtZT86IHN0cmluZyk6IEluc3RydWN0aW9uW10ge1xuICBjb25zdCBsaXN0ZW5lclBhcmFtczogby5FeHByZXNzaW9uW11bXSA9IFtdO1xuICBjb25zdCBzeW50aGV0aWNMaXN0ZW5lclBhcmFtczogby5FeHByZXNzaW9uW11bXSA9IFtdO1xuICBjb25zdCBpbnN0cnVjdGlvbnM6IEluc3RydWN0aW9uW10gPSBbXTtcblxuICBmb3IgKGNvbnN0IGJpbmRpbmcgb2YgZXZlbnRCaW5kaW5ncykge1xuICAgIGxldCBiaW5kaW5nTmFtZSA9IGJpbmRpbmcubmFtZSAmJiBzYW5pdGl6ZUlkZW50aWZpZXIoYmluZGluZy5uYW1lKTtcbiAgICBjb25zdCBiaW5kaW5nRm5OYW1lID0gYmluZGluZy50eXBlID09PSBQYXJzZWRFdmVudFR5cGUuQW5pbWF0aW9uID9cbiAgICAgICAgcHJlcGFyZVN5bnRoZXRpY0xpc3RlbmVyRnVuY3Rpb25OYW1lKGJpbmRpbmdOYW1lLCBiaW5kaW5nLnRhcmdldE9yUGhhc2UpIDpcbiAgICAgICAgYmluZGluZ05hbWU7XG4gICAgY29uc3QgaGFuZGxlck5hbWUgPSBuYW1lICYmIGJpbmRpbmdOYW1lID8gYCR7bmFtZX1fJHtiaW5kaW5nRm5OYW1lfV9Ib3N0QmluZGluZ0hhbmRsZXJgIDogbnVsbDtcbiAgICBjb25zdCBwYXJhbXMgPSBwcmVwYXJlRXZlbnRMaXN0ZW5lclBhcmFtZXRlcnMoQm91bmRFdmVudC5mcm9tUGFyc2VkRXZlbnQoYmluZGluZyksIGhhbmRsZXJOYW1lKTtcblxuICAgIGlmIChiaW5kaW5nLnR5cGUgPT0gUGFyc2VkRXZlbnRUeXBlLkFuaW1hdGlvbikge1xuICAgICAgc3ludGhldGljTGlzdGVuZXJQYXJhbXMucHVzaChwYXJhbXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0ZW5lclBhcmFtcy5wdXNoKHBhcmFtcyk7XG4gICAgfVxuICB9XG5cbiAgZm9yIChjb25zdCBwYXJhbXMgb2Ygc3ludGhldGljTGlzdGVuZXJQYXJhbXMpIHtcbiAgICBpbnN0cnVjdGlvbnMucHVzaCh7cmVmZXJlbmNlOiBSMy5zeW50aGV0aWNIb3N0TGlzdGVuZXIsIHBhcmFtc09yRm46IHBhcmFtcywgc3BhbjogbnVsbH0pO1xuICB9XG5cbiAgZm9yIChjb25zdCBwYXJhbXMgb2YgbGlzdGVuZXJQYXJhbXMpIHtcbiAgICBpbnN0cnVjdGlvbnMucHVzaCh7cmVmZXJlbmNlOiBSMy5saXN0ZW5lciwgcGFyYW1zT3JGbjogcGFyYW1zLCBzcGFuOiBudWxsfSk7XG4gIH1cblxuICByZXR1cm4gaW5zdHJ1Y3Rpb25zO1xufVxuXG5cbmNvbnN0IEhPU1RfUkVHX0VYUCA9IC9eKD86XFxbKFteXFxdXSspXFxdKXwoPzpcXCgoW15cXCldKylcXCkpJC87XG4vLyBSZXByZXNlbnRzIHRoZSBncm91cHMgaW4gdGhlIGFib3ZlIHJlZ2V4LlxuY29uc3QgZW51bSBIb3N0QmluZGluZ0dyb3VwIHtcbiAgLy8gZ3JvdXAgMTogXCJwcm9wXCIgZnJvbSBcIltwcm9wXVwiLCBvciBcImF0dHIucm9sZVwiIGZyb20gXCJbYXR0ci5yb2xlXVwiLCBvciBAYW5pbSBmcm9tIFtAYW5pbV1cbiAgQmluZGluZyA9IDEsXG5cbiAgLy8gZ3JvdXAgMjogXCJldmVudFwiIGZyb20gXCIoZXZlbnQpXCJcbiAgRXZlbnQgPSAyLFxufVxuXG4vLyBEZWZpbmVzIEhvc3QgQmluZGluZ3Mgc3RydWN0dXJlIHRoYXQgY29udGFpbnMgYXR0cmlidXRlcywgbGlzdGVuZXJzLCBhbmQgcHJvcGVydGllcyxcbi8vIHBhcnNlZCBmcm9tIHRoZSBgaG9zdGAgb2JqZWN0IGRlZmluZWQgZm9yIGEgVHlwZS5cbmV4cG9ydCBpbnRlcmZhY2UgUGFyc2VkSG9zdEJpbmRpbmdzIHtcbiAgYXR0cmlidXRlczoge1trZXk6IHN0cmluZ106IG8uRXhwcmVzc2lvbn07XG4gIGxpc3RlbmVyczoge1trZXk6IHN0cmluZ106IHN0cmluZ307XG4gIHByb3BlcnRpZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9O1xuICBzcGVjaWFsQXR0cmlidXRlczoge3N0eWxlQXR0cj86IHN0cmluZzsgY2xhc3NBdHRyPzogc3RyaW5nO307XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUhvc3RCaW5kaW5ncyhob3N0OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfG8uRXhwcmVzc2lvbn0pOiBQYXJzZWRIb3N0QmluZGluZ3Mge1xuICBjb25zdCBhdHRyaWJ1dGVzOiB7W2tleTogc3RyaW5nXTogby5FeHByZXNzaW9ufSA9IHt9O1xuICBjb25zdCBsaXN0ZW5lcnM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gIGNvbnN0IHByb3BlcnRpZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gIGNvbnN0IHNwZWNpYWxBdHRyaWJ1dGVzOiB7c3R5bGVBdHRyPzogc3RyaW5nOyBjbGFzc0F0dHI/OiBzdHJpbmc7fSA9IHt9O1xuXG4gIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKGhvc3QpKSB7XG4gICAgY29uc3QgdmFsdWUgPSBob3N0W2tleV07XG4gICAgY29uc3QgbWF0Y2hlcyA9IGtleS5tYXRjaChIT1NUX1JFR19FWFApO1xuXG4gICAgaWYgKG1hdGNoZXMgPT09IG51bGwpIHtcbiAgICAgIHN3aXRjaCAoa2V5KSB7XG4gICAgICAgIGNhc2UgJ2NsYXNzJzpcbiAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgLy8gVE9ETyhhbHhodWIpOiBtYWtlIHRoaXMgYSBkaWFnbm9zdGljLlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDbGFzcyBiaW5kaW5nIG11c3QgYmUgc3RyaW5nYCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHNwZWNpYWxBdHRyaWJ1dGVzLmNsYXNzQXR0ciA9IHZhbHVlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdzdHlsZSc6XG4gICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIC8vIFRPRE8oYWx4aHViKTogbWFrZSB0aGlzIGEgZGlhZ25vc3RpYy5cbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgU3R5bGUgYmluZGluZyBtdXN0IGJlIHN0cmluZ2ApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBzcGVjaWFsQXR0cmlidXRlcy5zdHlsZUF0dHIgPSB2YWx1ZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgYXR0cmlidXRlc1trZXldID0gby5saXRlcmFsKHZhbHVlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXR0cmlidXRlc1trZXldID0gdmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAobWF0Y2hlc1tIb3N0QmluZGluZ0dyb3VwLkJpbmRpbmddICE9IG51bGwpIHtcbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIC8vIFRPRE8oYWx4aHViKTogbWFrZSB0aGlzIGEgZGlhZ25vc3RpYy5cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBQcm9wZXJ0eSBiaW5kaW5nIG11c3QgYmUgc3RyaW5nYCk7XG4gICAgICB9XG4gICAgICAvLyBzeW50aGV0aWMgcHJvcGVydGllcyAodGhlIG9uZXMgdGhhdCBoYXZlIGEgYEBgIGFzIGEgcHJlZml4KVxuICAgICAgLy8gYXJlIHN0aWxsIHRyZWF0ZWQgdGhlIHNhbWUgYXMgcmVndWxhciBwcm9wZXJ0aWVzLiBUaGVyZWZvcmVcbiAgICAgIC8vIHRoZXJlIGlzIG5vIHBvaW50IGluIHN0b3JpbmcgdGhlbSBpbiBhIHNlcGFyYXRlIG1hcC5cbiAgICAgIHByb3BlcnRpZXNbbWF0Y2hlc1tIb3N0QmluZGluZ0dyb3VwLkJpbmRpbmddXSA9IHZhbHVlO1xuICAgIH0gZWxzZSBpZiAobWF0Y2hlc1tIb3N0QmluZGluZ0dyb3VwLkV2ZW50XSAhPSBudWxsKSB7XG4gICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgICAgICAvLyBUT0RPKGFseGh1Yik6IG1ha2UgdGhpcyBhIGRpYWdub3N0aWMuXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgRXZlbnQgYmluZGluZyBtdXN0IGJlIHN0cmluZ2ApO1xuICAgICAgfVxuICAgICAgbGlzdGVuZXJzW21hdGNoZXNbSG9zdEJpbmRpbmdHcm91cC5FdmVudF1dID0gdmFsdWU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHthdHRyaWJ1dGVzLCBsaXN0ZW5lcnMsIHByb3BlcnRpZXMsIHNwZWNpYWxBdHRyaWJ1dGVzfTtcbn1cblxuLyoqXG4gKiBWZXJpZmllcyBob3N0IGJpbmRpbmdzIGFuZCByZXR1cm5zIHRoZSBsaXN0IG9mIGVycm9ycyAoaWYgYW55KS4gRW1wdHkgYXJyYXkgaW5kaWNhdGVzIHRoYXQgYVxuICogZ2l2ZW4gc2V0IG9mIGhvc3QgYmluZGluZ3MgaGFzIG5vIGVycm9ycy5cbiAqXG4gKiBAcGFyYW0gYmluZGluZ3Mgc2V0IG9mIGhvc3QgYmluZGluZ3MgdG8gdmVyaWZ5LlxuICogQHBhcmFtIHNvdXJjZVNwYW4gc291cmNlIHNwYW4gd2hlcmUgaG9zdCBiaW5kaW5ncyB3ZXJlIGRlZmluZWQuXG4gKiBAcmV0dXJucyBhcnJheSBvZiBlcnJvcnMgYXNzb2NpYXRlZCB3aXRoIGEgZ2l2ZW4gc2V0IG9mIGhvc3QgYmluZGluZ3MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2ZXJpZnlIb3N0QmluZGluZ3MoXG4gICAgYmluZGluZ3M6IFBhcnNlZEhvc3RCaW5kaW5ncywgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKTogUGFyc2VFcnJvcltdIHtcbiAgLy8gVE9ETzogYWJzdHJhY3Qgb3V0IGhvc3QgYmluZGluZ3MgdmVyaWZpY2F0aW9uIGxvZ2ljIGFuZCB1c2UgaXQgaW5zdGVhZCBvZlxuICAvLyBjcmVhdGluZyBldmVudHMgYW5kIHByb3BlcnRpZXMgQVNUcyB0byBkZXRlY3QgZXJyb3JzIChGVy05OTYpXG4gIGNvbnN0IGJpbmRpbmdQYXJzZXIgPSBtYWtlQmluZGluZ1BhcnNlcigpO1xuICBiaW5kaW5nUGFyc2VyLmNyZWF0ZURpcmVjdGl2ZUhvc3RFdmVudEFzdHMoYmluZGluZ3MubGlzdGVuZXJzLCBzb3VyY2VTcGFuKTtcbiAgYmluZGluZ1BhcnNlci5jcmVhdGVCb3VuZEhvc3RQcm9wZXJ0aWVzKGJpbmRpbmdzLnByb3BlcnRpZXMsIHNvdXJjZVNwYW4pO1xuICByZXR1cm4gYmluZGluZ1BhcnNlci5lcnJvcnM7XG59XG5cbmZ1bmN0aW9uIGNvbXBpbGVTdHlsZXMoc3R5bGVzOiBzdHJpbmdbXSwgc2VsZWN0b3I6IHN0cmluZywgaG9zdFNlbGVjdG9yOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gIGNvbnN0IHNoYWRvd0NzcyA9IG5ldyBTaGFkb3dDc3MoKTtcbiAgcmV0dXJuIHN0eWxlcy5tYXAoc3R5bGUgPT4ge1xuICAgIHJldHVybiBzaGFkb3dDc3MhLnNoaW1Dc3NUZXh0KHN0eWxlLCBzZWxlY3RvciwgaG9zdFNlbGVjdG9yKTtcbiAgfSk7XG59XG5cbi8qKlxuICogRW5jYXBzdWxhdGVzIGEgQ1NTIHN0eWxlc2hlZXQgd2l0aCBlbXVsYXRlZCB2aWV3IGVuY2Fwc3VsYXRpb24uXG4gKiBUaGlzIGFsbG93cyBhIHN0eWxlc2hlZXQgdG8gYmUgdXNlZCB3aXRoIGFuIEFuZ3VsYXIgY29tcG9uZW50IHRoYXRcbiAqIGlzIHVzaW5nIHRoZSBgVmlld0VuY2Fwc3VsYXRpb24uRW11bGF0ZWRgIG1vZGUuXG4gKlxuICogQHBhcmFtIHN0eWxlIFRoZSBjb250ZW50IG9mIGEgQ1NTIHN0eWxlc2hlZXQuXG4gKiBAcmV0dXJucyBUaGUgZW5jYXBzdWxhdGVkIGNvbnRlbnQgZm9yIHRoZSBzdHlsZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuY2Fwc3VsYXRlU3R5bGUoc3R5bGU6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IHNoYWRvd0NzcyA9IG5ldyBTaGFkb3dDc3MoKTtcbiAgcmV0dXJuIHNoYWRvd0Nzcy5zaGltQ3NzVGV4dChzdHlsZSwgQ09OVEVOVF9BVFRSLCBIT1NUX0FUVFIpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVIb3N0RGlyZWN0aXZlc1R5cGUobWV0YTogUjNEaXJlY3RpdmVNZXRhZGF0YSk6IG8uVHlwZSB7XG4gIGlmICghbWV0YS5ob3N0RGlyZWN0aXZlcz8ubGVuZ3RoKSB7XG4gICAgcmV0dXJuIG8uTk9ORV9UWVBFO1xuICB9XG5cbiAgcmV0dXJuIG8uZXhwcmVzc2lvblR5cGUoby5saXRlcmFsQXJyKG1ldGEuaG9zdERpcmVjdGl2ZXMubWFwKGhvc3RNZXRhID0+IG8ubGl0ZXJhbE1hcChbXG4gICAge2tleTogJ2RpcmVjdGl2ZScsIHZhbHVlOiBvLnR5cGVvZkV4cHIoaG9zdE1ldGEuZGlyZWN0aXZlLnR5cGUpLCBxdW90ZWQ6IGZhbHNlfSxcbiAgICB7a2V5OiAnaW5wdXRzJywgdmFsdWU6IHN0cmluZ01hcEFzTGl0ZXJhbEV4cHJlc3Npb24oaG9zdE1ldGEuaW5wdXRzIHx8IHt9KSwgcXVvdGVkOiBmYWxzZX0sXG4gICAge2tleTogJ291dHB1dHMnLCB2YWx1ZTogc3RyaW5nTWFwQXNMaXRlcmFsRXhwcmVzc2lvbihob3N0TWV0YS5vdXRwdXRzIHx8IHt9KSwgcXVvdGVkOiBmYWxzZX0sXG4gIF0pKSkpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVIb3N0RGlyZWN0aXZlc0ZlYXR1cmVBcmcoXG4gICAgaG9zdERpcmVjdGl2ZXM6IE5vbk51bGxhYmxlPFIzRGlyZWN0aXZlTWV0YWRhdGFbJ2hvc3REaXJlY3RpdmVzJ10+KTogby5FeHByZXNzaW9uIHtcbiAgY29uc3QgZXhwcmVzc2lvbnM6IG8uRXhwcmVzc2lvbltdID0gW107XG4gIGxldCBoYXNGb3J3YXJkUmVmID0gZmFsc2U7XG5cbiAgZm9yIChjb25zdCBjdXJyZW50IG9mIGhvc3REaXJlY3RpdmVzKSB7XG4gICAgLy8gVXNlIGEgc2hvcnRoYW5kIGlmIHRoZXJlIGFyZSBubyBpbnB1dHMgb3Igb3V0cHV0cy5cbiAgICBpZiAoIWN1cnJlbnQuaW5wdXRzICYmICFjdXJyZW50Lm91dHB1dHMpIHtcbiAgICAgIGV4cHJlc3Npb25zLnB1c2goY3VycmVudC5kaXJlY3RpdmUudHlwZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGtleXMgPSBbe2tleTogJ2RpcmVjdGl2ZScsIHZhbHVlOiBjdXJyZW50LmRpcmVjdGl2ZS50eXBlLCBxdW90ZWQ6IGZhbHNlfV07XG5cbiAgICAgIGlmIChjdXJyZW50LmlucHV0cykge1xuICAgICAgICBjb25zdCBpbnB1dHNMaXRlcmFsID0gY3JlYXRlSG9zdERpcmVjdGl2ZXNNYXBwaW5nQXJyYXkoY3VycmVudC5pbnB1dHMpO1xuICAgICAgICBpZiAoaW5wdXRzTGl0ZXJhbCkge1xuICAgICAgICAgIGtleXMucHVzaCh7a2V5OiAnaW5wdXRzJywgdmFsdWU6IGlucHV0c0xpdGVyYWwsIHF1b3RlZDogZmFsc2V9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoY3VycmVudC5vdXRwdXRzKSB7XG4gICAgICAgIGNvbnN0IG91dHB1dHNMaXRlcmFsID0gY3JlYXRlSG9zdERpcmVjdGl2ZXNNYXBwaW5nQXJyYXkoY3VycmVudC5vdXRwdXRzKTtcbiAgICAgICAgaWYgKG91dHB1dHNMaXRlcmFsKSB7XG4gICAgICAgICAga2V5cy5wdXNoKHtrZXk6ICdvdXRwdXRzJywgdmFsdWU6IG91dHB1dHNMaXRlcmFsLCBxdW90ZWQ6IGZhbHNlfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZXhwcmVzc2lvbnMucHVzaChvLmxpdGVyYWxNYXAoa2V5cykpO1xuICAgIH1cblxuICAgIGlmIChjdXJyZW50LmlzRm9yd2FyZFJlZmVyZW5jZSkge1xuICAgICAgaGFzRm9yd2FyZFJlZiA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgLy8gSWYgdGhlcmUncyBhIGZvcndhcmQgcmVmZXJlbmNlLCB3ZSBnZW5lcmF0ZSBhIGBmdW5jdGlvbigpIHsgcmV0dXJuIFtIb3N0RGlyXSB9YCxcbiAgLy8gb3RoZXJ3aXNlIHdlIGNhbiBzYXZlIHNvbWUgYnl0ZXMgYnkgdXNpbmcgYSBwbGFpbiBhcnJheSwgZS5nLiBgW0hvc3REaXJdYC5cbiAgcmV0dXJuIGhhc0ZvcndhcmRSZWYgP1xuICAgICAgbmV3IG8uRnVuY3Rpb25FeHByKFtdLCBbbmV3IG8uUmV0dXJuU3RhdGVtZW50KG8ubGl0ZXJhbEFycihleHByZXNzaW9ucykpXSkgOlxuICAgICAgby5saXRlcmFsQXJyKGV4cHJlc3Npb25zKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhbiBpbnB1dC9vdXRwdXQgbWFwcGluZyBvYmplY3QgbGl0ZXJhbCBpbnRvIGFuIGFycmF5IHdoZXJlIHRoZSBldmVuIGtleXMgYXJlIHRoZVxuICogcHVibGljIG5hbWUgb2YgdGhlIGJpbmRpbmcgYW5kIHRoZSBvZGQgb25lcyBhcmUgdGhlIG5hbWUgaXQgd2FzIGFsaWFzZWQgdG8uIEUuZy5cbiAqIGB7aW5wdXRPbmU6ICdhbGlhc09uZScsIGlucHV0VHdvOiAnYWxpYXNUd28nfWAgd2lsbCBiZWNvbWVcbiAqIGBbJ2lucHV0T25lJywgJ2FsaWFzT25lJywgJ2lucHV0VHdvJywgJ2FsaWFzVHdvJ11gLlxuICpcbiAqIFRoaXMgY29udmVyc2lvbiBpcyBuZWNlc3NhcnksIGJlY2F1c2UgaG9zdHMgYmluZCB0byB0aGUgcHVibGljIG5hbWUgb2YgdGhlIGhvc3QgZGlyZWN0aXZlIGFuZFxuICoga2VlcGluZyB0aGUgbWFwcGluZyBpbiBhbiBvYmplY3QgbGl0ZXJhbCB3aWxsIGJyZWFrIGZvciBhcHBzIHVzaW5nIHByb3BlcnR5IHJlbmFtaW5nLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlSG9zdERpcmVjdGl2ZXNNYXBwaW5nQXJyYXkobWFwcGluZzogUmVjb3JkPHN0cmluZywgc3RyaW5nPik6XG4gICAgby5MaXRlcmFsQXJyYXlFeHByfG51bGwge1xuICBjb25zdCBlbGVtZW50czogby5MaXRlcmFsRXhwcltdID0gW107XG5cbiAgZm9yIChjb25zdCBwdWJsaWNOYW1lIGluIG1hcHBpbmcpIHtcbiAgICBpZiAobWFwcGluZy5oYXNPd25Qcm9wZXJ0eShwdWJsaWNOYW1lKSkge1xuICAgICAgZWxlbWVudHMucHVzaChvLmxpdGVyYWwocHVibGljTmFtZSksIG8ubGl0ZXJhbChtYXBwaW5nW3B1YmxpY05hbWVdKSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGVsZW1lbnRzLmxlbmd0aCA+IDAgPyBvLmxpdGVyYWxBcnIoZWxlbWVudHMpIDogbnVsbDtcbn1cbiJdfQ==