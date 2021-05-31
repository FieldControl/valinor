/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { StaticSymbol } from './aot/static_symbol';
import { splitAtColon, stringify } from './util';
// group 0: "[prop] or (event) or @trigger"
// group 1: "prop" from "[prop]"
// group 2: "event" from "(event)"
// group 3: "@trigger" from "@trigger"
const HOST_REG_EXP = /^(?:(?:\[([^\]]+)\])|(?:\(([^\)]+)\)))|(\@[-\w]+)$/;
export function sanitizeIdentifier(name) {
    return name.replace(/\W/g, '_');
}
let _anonymousTypeIndex = 0;
export function identifierName(compileIdentifier) {
    if (!compileIdentifier || !compileIdentifier.reference) {
        return null;
    }
    const ref = compileIdentifier.reference;
    if (ref instanceof StaticSymbol) {
        return ref.name;
    }
    if (ref['__anonymousType']) {
        return ref['__anonymousType'];
    }
    if (ref['__forward_ref__']) {
        // We do not want to try to stringify a `forwardRef()` function because that would cause the
        // inner function to be evaluated too early, defeating the whole point of the `forwardRef`.
        return '__forward_ref__';
    }
    let identifier = stringify(ref);
    if (identifier.indexOf('(') >= 0) {
        // case: anonymous functions!
        identifier = `anonymous_${_anonymousTypeIndex++}`;
        ref['__anonymousType'] = identifier;
    }
    else {
        identifier = sanitizeIdentifier(identifier);
    }
    return identifier;
}
export function identifierModuleUrl(compileIdentifier) {
    const ref = compileIdentifier.reference;
    if (ref instanceof StaticSymbol) {
        return ref.filePath;
    }
    // Runtime type
    return `./${stringify(ref)}`;
}
export function viewClassName(compType, embeddedTemplateIndex) {
    return `View_${identifierName({ reference: compType })}_${embeddedTemplateIndex}`;
}
export function rendererTypeName(compType) {
    return `RenderType_${identifierName({ reference: compType })}`;
}
export function hostViewClassName(compType) {
    return `HostView_${identifierName({ reference: compType })}`;
}
export function componentFactoryName(compType) {
    return `${identifierName({ reference: compType })}NgFactory`;
}
export var CompileSummaryKind;
(function (CompileSummaryKind) {
    CompileSummaryKind[CompileSummaryKind["Pipe"] = 0] = "Pipe";
    CompileSummaryKind[CompileSummaryKind["Directive"] = 1] = "Directive";
    CompileSummaryKind[CompileSummaryKind["NgModule"] = 2] = "NgModule";
    CompileSummaryKind[CompileSummaryKind["Injectable"] = 3] = "Injectable";
})(CompileSummaryKind || (CompileSummaryKind = {}));
export function tokenName(token) {
    return token.value != null ? sanitizeIdentifier(token.value) : identifierName(token.identifier);
}
export function tokenReference(token) {
    if (token.identifier != null) {
        return token.identifier.reference;
    }
    else {
        return token.value;
    }
}
/**
 * Metadata about a stylesheet
 */
export class CompileStylesheetMetadata {
    constructor({ moduleUrl, styles, styleUrls } = {}) {
        this.moduleUrl = moduleUrl || null;
        this.styles = _normalizeArray(styles);
        this.styleUrls = _normalizeArray(styleUrls);
    }
}
/**
 * Metadata regarding compilation of a template.
 */
export class CompileTemplateMetadata {
    constructor({ encapsulation, template, templateUrl, htmlAst, styles, styleUrls, externalStylesheets, animations, ngContentSelectors, interpolation, isInline, preserveWhitespaces }) {
        this.encapsulation = encapsulation;
        this.template = template;
        this.templateUrl = templateUrl;
        this.htmlAst = htmlAst;
        this.styles = _normalizeArray(styles);
        this.styleUrls = _normalizeArray(styleUrls);
        this.externalStylesheets = _normalizeArray(externalStylesheets);
        this.animations = animations ? flatten(animations) : [];
        this.ngContentSelectors = ngContentSelectors || [];
        if (interpolation && interpolation.length != 2) {
            throw new Error(`'interpolation' should have a start and an end symbol.`);
        }
        this.interpolation = interpolation;
        this.isInline = isInline;
        this.preserveWhitespaces = preserveWhitespaces;
    }
    toSummary() {
        return {
            ngContentSelectors: this.ngContentSelectors,
            encapsulation: this.encapsulation,
            styles: this.styles,
            animations: this.animations
        };
    }
}
/**
 * Metadata regarding compilation of a directive.
 */
export class CompileDirectiveMetadata {
    constructor({ isHost, type, isComponent, selector, exportAs, changeDetection, inputs, outputs, hostListeners, hostProperties, hostAttributes, providers, viewProviders, queries, guards, viewQueries, entryComponents, template, componentViewType, rendererType, componentFactory }) {
        this.isHost = !!isHost;
        this.type = type;
        this.isComponent = isComponent;
        this.selector = selector;
        this.exportAs = exportAs;
        this.changeDetection = changeDetection;
        this.inputs = inputs;
        this.outputs = outputs;
        this.hostListeners = hostListeners;
        this.hostProperties = hostProperties;
        this.hostAttributes = hostAttributes;
        this.providers = _normalizeArray(providers);
        this.viewProviders = _normalizeArray(viewProviders);
        this.queries = _normalizeArray(queries);
        this.guards = guards;
        this.viewQueries = _normalizeArray(viewQueries);
        this.entryComponents = _normalizeArray(entryComponents);
        this.template = template;
        this.componentViewType = componentViewType;
        this.rendererType = rendererType;
        this.componentFactory = componentFactory;
    }
    static create({ isHost, type, isComponent, selector, exportAs, changeDetection, inputs, outputs, host, providers, viewProviders, queries, guards, viewQueries, entryComponents, template, componentViewType, rendererType, componentFactory }) {
        const hostListeners = {};
        const hostProperties = {};
        const hostAttributes = {};
        if (host != null) {
            Object.keys(host).forEach(key => {
                const value = host[key];
                const matches = key.match(HOST_REG_EXP);
                if (matches === null) {
                    hostAttributes[key] = value;
                }
                else if (matches[1] != null) {
                    hostProperties[matches[1]] = value;
                }
                else if (matches[2] != null) {
                    hostListeners[matches[2]] = value;
                }
            });
        }
        const inputsMap = {};
        if (inputs != null) {
            inputs.forEach((bindConfig) => {
                // canonical syntax: `dirProp: elProp`
                // if there is no `:`, use dirProp = elProp
                const parts = splitAtColon(bindConfig, [bindConfig, bindConfig]);
                inputsMap[parts[0]] = parts[1];
            });
        }
        const outputsMap = {};
        if (outputs != null) {
            outputs.forEach((bindConfig) => {
                // canonical syntax: `dirProp: elProp`
                // if there is no `:`, use dirProp = elProp
                const parts = splitAtColon(bindConfig, [bindConfig, bindConfig]);
                outputsMap[parts[0]] = parts[1];
            });
        }
        return new CompileDirectiveMetadata({
            isHost,
            type,
            isComponent: !!isComponent,
            selector,
            exportAs,
            changeDetection,
            inputs: inputsMap,
            outputs: outputsMap,
            hostListeners,
            hostProperties,
            hostAttributes,
            providers,
            viewProviders,
            queries,
            guards,
            viewQueries,
            entryComponents,
            template,
            componentViewType,
            rendererType,
            componentFactory,
        });
    }
    toSummary() {
        return {
            summaryKind: CompileSummaryKind.Directive,
            type: this.type,
            isComponent: this.isComponent,
            selector: this.selector,
            exportAs: this.exportAs,
            inputs: this.inputs,
            outputs: this.outputs,
            hostListeners: this.hostListeners,
            hostProperties: this.hostProperties,
            hostAttributes: this.hostAttributes,
            providers: this.providers,
            viewProviders: this.viewProviders,
            queries: this.queries,
            guards: this.guards,
            viewQueries: this.viewQueries,
            entryComponents: this.entryComponents,
            changeDetection: this.changeDetection,
            template: this.template && this.template.toSummary(),
            componentViewType: this.componentViewType,
            rendererType: this.rendererType,
            componentFactory: this.componentFactory
        };
    }
}
export class CompilePipeMetadata {
    constructor({ type, name, pure }) {
        this.type = type;
        this.name = name;
        this.pure = !!pure;
    }
    toSummary() {
        return {
            summaryKind: CompileSummaryKind.Pipe,
            type: this.type,
            name: this.name,
            pure: this.pure
        };
    }
}
export class CompileShallowModuleMetadata {
}
/**
 * Metadata regarding compilation of a module.
 */
export class CompileNgModuleMetadata {
    constructor({ type, providers, declaredDirectives, exportedDirectives, declaredPipes, exportedPipes, entryComponents, bootstrapComponents, importedModules, exportedModules, schemas, transitiveModule, id }) {
        this.type = type || null;
        this.declaredDirectives = _normalizeArray(declaredDirectives);
        this.exportedDirectives = _normalizeArray(exportedDirectives);
        this.declaredPipes = _normalizeArray(declaredPipes);
        this.exportedPipes = _normalizeArray(exportedPipes);
        this.providers = _normalizeArray(providers);
        this.entryComponents = _normalizeArray(entryComponents);
        this.bootstrapComponents = _normalizeArray(bootstrapComponents);
        this.importedModules = _normalizeArray(importedModules);
        this.exportedModules = _normalizeArray(exportedModules);
        this.schemas = _normalizeArray(schemas);
        this.id = id || null;
        this.transitiveModule = transitiveModule || null;
    }
    toSummary() {
        const module = this.transitiveModule;
        return {
            summaryKind: CompileSummaryKind.NgModule,
            type: this.type,
            entryComponents: module.entryComponents,
            providers: module.providers,
            modules: module.modules,
            exportedDirectives: module.exportedDirectives,
            exportedPipes: module.exportedPipes
        };
    }
}
export class TransitiveCompileNgModuleMetadata {
    constructor() {
        this.directivesSet = new Set();
        this.directives = [];
        this.exportedDirectivesSet = new Set();
        this.exportedDirectives = [];
        this.pipesSet = new Set();
        this.pipes = [];
        this.exportedPipesSet = new Set();
        this.exportedPipes = [];
        this.modulesSet = new Set();
        this.modules = [];
        this.entryComponentsSet = new Set();
        this.entryComponents = [];
        this.providers = [];
    }
    addProvider(provider, module) {
        this.providers.push({ provider: provider, module: module });
    }
    addDirective(id) {
        if (!this.directivesSet.has(id.reference)) {
            this.directivesSet.add(id.reference);
            this.directives.push(id);
        }
    }
    addExportedDirective(id) {
        if (!this.exportedDirectivesSet.has(id.reference)) {
            this.exportedDirectivesSet.add(id.reference);
            this.exportedDirectives.push(id);
        }
    }
    addPipe(id) {
        if (!this.pipesSet.has(id.reference)) {
            this.pipesSet.add(id.reference);
            this.pipes.push(id);
        }
    }
    addExportedPipe(id) {
        if (!this.exportedPipesSet.has(id.reference)) {
            this.exportedPipesSet.add(id.reference);
            this.exportedPipes.push(id);
        }
    }
    addModule(id) {
        if (!this.modulesSet.has(id.reference)) {
            this.modulesSet.add(id.reference);
            this.modules.push(id);
        }
    }
    addEntryComponent(ec) {
        if (!this.entryComponentsSet.has(ec.componentType)) {
            this.entryComponentsSet.add(ec.componentType);
            this.entryComponents.push(ec);
        }
    }
}
function _normalizeArray(obj) {
    return obj || [];
}
export class ProviderMeta {
    constructor(token, { useClass, useValue, useExisting, useFactory, deps, multi }) {
        this.token = token;
        this.useClass = useClass || null;
        this.useValue = useValue;
        this.useExisting = useExisting;
        this.useFactory = useFactory || null;
        this.dependencies = deps || null;
        this.multi = !!multi;
    }
}
export function flatten(list) {
    return list.reduce((flat, item) => {
        const flatItem = Array.isArray(item) ? flatten(item) : item;
        return flat.concat(flatItem);
    }, []);
}
function jitSourceUrl(url) {
    // Note: We need 3 "/" so that ng shows up as a separate domain
    // in the chrome dev tools.
    return url.replace(/(\w+:\/\/[\w:-]+)?(\/+)?/, 'ng:///');
}
export function templateSourceUrl(ngModuleType, compMeta, templateMeta) {
    let url;
    if (templateMeta.isInline) {
        if (compMeta.type.reference instanceof StaticSymbol) {
            // Note: a .ts file might contain multiple components with inline templates,
            // so we need to give them unique urls, as these will be used for sourcemaps.
            url = `${compMeta.type.reference.filePath}.${compMeta.type.reference.name}.html`;
        }
        else {
            url = `${identifierName(ngModuleType)}/${identifierName(compMeta.type)}.html`;
        }
    }
    else {
        url = templateMeta.templateUrl;
    }
    return compMeta.type.reference instanceof StaticSymbol ? url : jitSourceUrl(url);
}
export function sharedStylesheetJitUrl(meta, id) {
    const pathParts = meta.moduleUrl.split(/\/\\/g);
    const baseName = pathParts[pathParts.length - 1];
    return jitSourceUrl(`css/${id}${baseName}.ngstyle.js`);
}
export function ngModuleJitUrl(moduleMeta) {
    return jitSourceUrl(`${identifierName(moduleMeta.type)}/module.ngfactory.js`);
}
export function templateJitUrl(ngModuleType, compMeta) {
    return jitSourceUrl(`${identifierName(ngModuleType)}/${identifierName(compMeta.type)}.ngfactory.js`);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZV9tZXRhZGF0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9jb21waWxlX21ldGFkYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUlqRCxPQUFPLEVBQUMsWUFBWSxFQUFFLFNBQVMsRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUUvQywyQ0FBMkM7QUFDM0MsZ0NBQWdDO0FBQ2hDLGtDQUFrQztBQUNsQyxzQ0FBc0M7QUFDdEMsTUFBTSxZQUFZLEdBQUcsb0RBQW9ELENBQUM7QUFFMUUsTUFBTSxVQUFVLGtCQUFrQixDQUFDLElBQVk7SUFDN0MsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNsQyxDQUFDO0FBRUQsSUFBSSxtQkFBbUIsR0FBRyxDQUFDLENBQUM7QUFFNUIsTUFBTSxVQUFVLGNBQWMsQ0FBQyxpQkFBMkQ7SUFFeEYsSUFBSSxDQUFDLGlCQUFpQixJQUFJLENBQUMsaUJBQWlCLENBQUMsU0FBUyxFQUFFO1FBQ3RELE9BQU8sSUFBSSxDQUFDO0tBQ2I7SUFDRCxNQUFNLEdBQUcsR0FBRyxpQkFBaUIsQ0FBQyxTQUFTLENBQUM7SUFDeEMsSUFBSSxHQUFHLFlBQVksWUFBWSxFQUFFO1FBQy9CLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQztLQUNqQjtJQUNELElBQUksR0FBRyxDQUFDLGlCQUFpQixDQUFDLEVBQUU7UUFDMUIsT0FBTyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztLQUMvQjtJQUNELElBQUksR0FBRyxDQUFDLGlCQUFpQixDQUFDLEVBQUU7UUFDMUIsNEZBQTRGO1FBQzVGLDJGQUEyRjtRQUMzRixPQUFPLGlCQUFpQixDQUFDO0tBQzFCO0lBQ0QsSUFBSSxVQUFVLEdBQUcsU0FB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UUFBa0M7SUFDN0UsT0FBTyxZQUFZLENBQ2YsR0FBRyxjQUFjLENBQUMsWUFBWSxDQUFDLElBQUksY0FBYyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDdkYsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1N0YXRpY1N5bWJvbH0gZnJvbSAnLi9hb3Qvc3RhdGljX3N5bWJvbCc7XG5pbXBvcnQge0NoYW5nZURldGVjdGlvblN0cmF0ZWd5LCBTY2hlbWFNZXRhZGF0YSwgVHlwZSwgVmlld0VuY2Fwc3VsYXRpb259IGZyb20gJy4vY29yZSc7XG5pbXBvcnQge0xpZmVjeWNsZUhvb2tzfSBmcm9tICcuL2xpZmVjeWNsZV9yZWZsZWN0b3InO1xuaW1wb3J0IHtQYXJzZVRyZWVSZXN1bHQgYXMgSHRtbFBhcnNlVHJlZVJlc3VsdH0gZnJvbSAnLi9tbF9wYXJzZXIvcGFyc2VyJztcbmltcG9ydCB7c3BsaXRBdENvbG9uLCBzdHJpbmdpZnl9IGZyb20gJy4vdXRpbCc7XG5cbi8vIGdyb3VwIDA6IFwiW3Byb3BdIG9yIChldmVudCkgb3IgQHRyaWdnZXJcIlxuLy8gZ3JvdXAgMTogXCJwcm9wXCIgZnJvbSBcIltwcm9wXVwiXG4vLyBncm91cCAyOiBcImV2ZW50XCIgZnJvbSBcIihldmVudClcIlxuLy8gZ3JvdXAgMzogXCJAdHJpZ2dlclwiIGZyb20gXCJAdHJpZ2dlclwiXG5jb25zdCBIT1NUX1JFR19FWFAgPSAvXig/Oig/OlxcWyhbXlxcXV0rKVxcXSl8KD86XFwoKFteXFwpXSspXFwpKSl8KFxcQFstXFx3XSspJC87XG5cbmV4cG9ydCBmdW5jdGlvbiBzYW5pdGl6ZUlkZW50aWZpZXIobmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIG5hbWUucmVwbGFjZSgvXFxXL2csICdfJyk7XG59XG5cbmxldCBfYW5vbnltb3VzVHlwZUluZGV4ID0gMDtcblxuZXhwb3J0IGZ1bmN0aW9uIGlkZW50aWZpZXJOYW1lKGNvbXBpbGVJZGVudGlmaWVyOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhfG51bGx8dW5kZWZpbmVkKTogc3RyaW5nfFxuICAgIG51bGwge1xuICBpZiAoIWNvbXBpbGVJZGVudGlmaWVyIHx8ICFjb21waWxlSWRlbnRpZmllci5yZWZlcmVuY2UpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBjb25zdCByZWYgPSBjb21waWxlSWRlbnRpZmllci5yZWZlcmVuY2U7XG4gIGlmIChyZWYgaW5zdGFuY2VvZiBTdGF0aWNTeW1ib2wpIHtcbiAgICByZXR1cm4gcmVmLm5hbWU7XG4gIH1cbiAgaWYgKHJlZlsnX19hbm9ueW1vdXNUeXBlJ10pIHtcbiAgICByZXR1cm4gcmVmWydfX2Fub255bW91c1R5cGUnXTtcbiAgfVxuICBpZiAocmVmWydfX2ZvcndhcmRfcmVmX18nXSkge1xuICAgIC8vIFdlIGRvIG5vdCB3YW50IHRvIHRyeSB0byBzdHJpbmdpZnkgYSBgZm9yd2FyZFJlZigpYCBmdW5jdGlvbiBiZWNhdXNlIHRoYXQgd291bGQgY2F1c2UgdGhlXG4gICAgLy8gaW5uZXIgZnVuY3Rpb24gdG8gYmUgZXZhbHVhdGVkIHRvbyBlYXJseSwgZGVmZWF0aW5nIHRoZSB3aG9sZSBwb2ludCBvZiB0aGUgYGZvcndhcmRSZWZgLlxuICAgIHJldHVybiAnX19mb3J3YXJkX3JlZl9fJztcbiAgfVxuICBsZXQgaWRlbnRpZmllciA9IHN0cmluZ2lmeShyZWYpO1xuICBpZiAoaWRlbnRpZmllci5pbmRleE9mKCcoJykgPj0gMCkge1xuICAgIC8vIGNhc2U6IGFub255bW91cyBmdW5jdGlvbnMhXG4gICAgaWRlbnRpZmllciA9IGBhbm9ueW1vdXNfJHtfYW5vbnltb3VzVHlwZUluZGV4Kyt9YDtcbiAgICByZWZbJ19fYW5vbnltb3VzVHlwZSddID0gaWRlbnRpZmllcjtcbiAgfSBlbHNlIHtcbiAgICBpZGVudGlmaWVyID0gc2FuaXRpemVJZGVudGlmaWVyKGlkZW50aWZpZXIpO1xuICB9XG4gIHJldHVybiBpZGVudGlmaWVyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaWRlbnRpZmllck1vZHVsZVVybChjb21waWxlSWRlbnRpZmllcjogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSk6IHN0cmluZyB7XG4gIGNvbnN0IHJlZiA9IGNvbXBpbGVJZGVudGlmaWVyLnJlZmVyZW5jZTtcbiAgaWYgKHJlZiBpbnN0YW5jZW9mIFN0YXRpY1N5bWJvbCkge1xuICAgIHJldHVybiByZWYuZmlsZVBhdGg7XG4gIH1cbiAgLy8gUnVudGltZSB0eXBlXG4gIHJldHVybiBgLi8ke3N0cmluZ2lmeShyZWYpfWA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2aWV3Q2xhc3NOYW1lKGNvbXBUeXBlOiBhbnksIGVtYmVkZGVkVGVtcGxhdGVJbmRleDogbnVtYmVyKTogc3RyaW5nIHtcbiAgcmV0dXJuIGBWaWV3XyR7aWRlbnRpZmllck5hbWUoe3JlZmVyZW5jZTogY29tcFR5cGV9KX1fJHtlbWJlZGRlZFRlbXBsYXRlSW5kZXh9YDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlcmVyVHlwZU5hbWUoY29tcFR5cGU6IGFueSk6IHN0cmluZyB7XG4gIHJldHVybiBgUmVuZGVyVHlwZV8ke2lkZW50aWZpZXJOYW1lKHtyZWZlcmVuY2U6IGNvbXBUeXBlfSl9YDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhvc3RWaWV3Q2xhc3NOYW1lKGNvbXBUeXBlOiBhbnkpOiBzdHJpbmcge1xuICByZXR1cm4gYEhvc3RWaWV3XyR7aWRlbnRpZmllck5hbWUoe3JlZmVyZW5jZTogY29tcFR5cGV9KX1gO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcG9uZW50RmFjdG9yeU5hbWUoY29tcFR5cGU6IGFueSk6IHN0cmluZyB7XG4gIHJldHVybiBgJHtpZGVudGlmaWVyTmFtZSh7cmVmZXJlbmNlOiBjb21wVHlwZX0pfU5nRmFjdG9yeWA7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHJveHlDbGFzcyB7XG4gIHNldERlbGVnYXRlKGRlbGVnYXRlOiBhbnkpOiB2b2lkO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEge1xuICByZWZlcmVuY2U6IGFueTtcbn1cblxuZXhwb3J0IGVudW0gQ29tcGlsZVN1bW1hcnlLaW5kIHtcbiAgUGlwZSxcbiAgRGlyZWN0aXZlLFxuICBOZ01vZHVsZSxcbiAgSW5qZWN0YWJsZVxufVxuXG4vKipcbiAqIEEgQ29tcGlsZVN1bW1hcnkgaXMgdGhlIGRhdGEgbmVlZGVkIHRvIHVzZSBhIGRpcmVjdGl2ZSAvIHBpcGUgLyBtb2R1bGVcbiAqIGluIG90aGVyIG1vZHVsZXMgLyBjb21wb25lbnRzLiBIb3dldmVyLCB0aGlzIGRhdGEgaXMgbm90IGVub3VnaCB0byBjb21waWxlXG4gKiB0aGUgZGlyZWN0aXZlIC8gbW9kdWxlIGl0c2VsZi5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb21waWxlVHlwZVN1bW1hcnkge1xuICBzdW1tYXJ5S2luZDogQ29tcGlsZVN1bW1hcnlLaW5kfG51bGw7XG4gIHR5cGU6IENvbXBpbGVUeXBlTWV0YWRhdGE7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhIHtcbiAgaXNBdHRyaWJ1dGU/OiBib29sZWFuO1xuICBpc1NlbGY/OiBib29sZWFuO1xuICBpc0hvc3Q/OiBib29sZWFuO1xuICBpc1NraXBTZWxmPzogYm9vbGVhbjtcbiAgaXNPcHRpb25hbD86IGJvb2xlYW47XG4gIGlzVmFsdWU/OiBib29sZWFuO1xuICB0b2tlbj86IENvbXBpbGVUb2tlbk1ldGFkYXRhO1xuICB2YWx1ZT86IGFueTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb21waWxlUHJvdmlkZXJNZXRhZGF0YSB7XG4gIHRva2VuOiBDb21waWxlVG9rZW5NZXRhZGF0YTtcbiAgdXNlQ2xhc3M/OiBDb21waWxlVHlwZU1ldGFkYXRhO1xuICB1c2VWYWx1ZT86IGFueTtcbiAgdXNlRXhpc3Rpbmc/OiBDb21waWxlVG9rZW5NZXRhZGF0YTtcbiAgdXNlRmFjdG9yeT86IENvbXBpbGVGYWN0b3J5TWV0YWRhdGE7XG4gIGRlcHM/OiBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGFbXTtcbiAgbXVsdGk/OiBib29sZWFuO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvbXBpbGVGYWN0b3J5TWV0YWRhdGEgZXh0ZW5kcyBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIHtcbiAgZGlEZXBzOiBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGFbXTtcbiAgcmVmZXJlbmNlOiBhbnk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0b2tlbk5hbWUodG9rZW46IENvbXBpbGVUb2tlbk1ldGFkYXRhKSB7XG4gIHJldHVybiB0b2tlbi52YWx1ZSAhPSBudWxsID8gc2FuaXRpemVJZGVudGlmaWVyKHRva2VuLnZhbHVlKSA6IGlkZW50aWZpZXJOYW1lKHRva2VuLmlkZW50aWZpZXIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdG9rZW5SZWZlcmVuY2UodG9rZW46IENvbXBpbGVUb2tlbk1ldGFkYXRhKSB7XG4gIGlmICh0b2tlbi5pZGVudGlmaWVyICE9IG51bGwpIHtcbiAgICByZXR1cm4gdG9rZW4uaWRlbnRpZmllci5yZWZlcmVuY2U7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHRva2VuLnZhbHVlO1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcGlsZVRva2VuTWV0YWRhdGEge1xuICB2YWx1ZT86IGFueTtcbiAgaWRlbnRpZmllcj86IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGF8Q29tcGlsZVR5cGVNZXRhZGF0YTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb21waWxlSW5qZWN0YWJsZU1ldGFkYXRhIHtcbiAgc3ltYm9sOiBTdGF0aWNTeW1ib2w7XG4gIHR5cGU6IENvbXBpbGVUeXBlTWV0YWRhdGE7XG5cbiAgcHJvdmlkZWRJbj86IFN0YXRpY1N5bWJvbDtcblxuICB1c2VWYWx1ZT86IGFueTtcbiAgdXNlQ2xhc3M/OiBTdGF0aWNTeW1ib2w7XG4gIHVzZUV4aXN0aW5nPzogU3RhdGljU3ltYm9sO1xuICB1c2VGYWN0b3J5PzogU3RhdGljU3ltYm9sO1xuICBkZXBzPzogYW55W107XG59XG5cbi8qKlxuICogTWV0YWRhdGEgcmVnYXJkaW5nIGNvbXBpbGF0aW9uIG9mIGEgdHlwZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb21waWxlVHlwZU1ldGFkYXRhIGV4dGVuZHMgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB7XG4gIGRpRGVwczogQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhW107XG4gIGxpZmVjeWNsZUhvb2tzOiBMaWZlY3ljbGVIb29rc1tdO1xuICByZWZlcmVuY2U6IGFueTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb21waWxlUXVlcnlNZXRhZGF0YSB7XG4gIHNlbGVjdG9yczogQXJyYXk8Q29tcGlsZVRva2VuTWV0YWRhdGE+O1xuICBkZXNjZW5kYW50czogYm9vbGVhbjtcbiAgZmlyc3Q6IGJvb2xlYW47XG4gIHByb3BlcnR5TmFtZTogc3RyaW5nO1xuICByZWFkOiBDb21waWxlVG9rZW5NZXRhZGF0YTtcbiAgc3RhdGljPzogYm9vbGVhbjtcbiAgZW1pdERpc3RpbmN0Q2hhbmdlc09ubHk/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIE1ldGFkYXRhIGFib3V0IGEgc3R5bGVzaGVldFxuICovXG5leHBvcnQgY2xhc3MgQ29tcGlsZVN0eWxlc2hlZXRNZXRhZGF0YSB7XG4gIG1vZHVsZVVybDogc3RyaW5nfG51bGw7XG4gIHN0eWxlczogc3RyaW5nW107XG4gIHN0eWxlVXJsczogc3RyaW5nW107XG4gIGNvbnN0cnVjdG9yKFxuICAgICAge21vZHVsZVVybCwgc3R5bGVzLCBzdHlsZVVybHN9OlxuICAgICAgICAgIHttb2R1bGVVcmw/OiBzdHJpbmcsIHN0eWxlcz86IHN0cmluZ1tdLCBzdHlsZVVybHM/OiBzdHJpbmdbXX0gPSB7fSkge1xuICAgIHRoaXMubW9kdWxlVXJsID0gbW9kdWxlVXJsIHx8IG51bGw7XG4gICAgdGhpcy5zdHlsZXMgPSBfbm9ybWFsaXplQXJyYXkoc3R5bGVzKTtcbiAgICB0aGlzLnN0eWxlVXJscyA9IF9ub3JtYWxpemVBcnJheShzdHlsZVVybHMpO1xuICB9XG59XG5cbi8qKlxuICogU3VtbWFyeSBNZXRhZGF0YSByZWdhcmRpbmcgY29tcGlsYXRpb24gb2YgYSB0ZW1wbGF0ZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb21waWxlVGVtcGxhdGVTdW1tYXJ5IHtcbiAgbmdDb250ZW50U2VsZWN0b3JzOiBzdHJpbmdbXTtcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb258bnVsbDtcbiAgc3R5bGVzOiBzdHJpbmdbXTtcbiAgYW5pbWF0aW9uczogYW55W118bnVsbDtcbn1cblxuLyoqXG4gKiBNZXRhZGF0YSByZWdhcmRpbmcgY29tcGlsYXRpb24gb2YgYSB0ZW1wbGF0ZS5cbiAqL1xuZXhwb3J0IGNsYXNzIENvbXBpbGVUZW1wbGF0ZU1ldGFkYXRhIHtcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb258bnVsbDtcbiAgdGVtcGxhdGU6IHN0cmluZ3xudWxsO1xuICB0ZW1wbGF0ZVVybDogc3RyaW5nfG51bGw7XG4gIGh0bWxBc3Q6IEh0bWxQYXJzZVRyZWVSZXN1bHR8bnVsbDtcbiAgaXNJbmxpbmU6IGJvb2xlYW47XG4gIHN0eWxlczogc3RyaW5nW107XG4gIHN0eWxlVXJsczogc3RyaW5nW107XG4gIGV4dGVybmFsU3R5bGVzaGVldHM6IENvbXBpbGVTdHlsZXNoZWV0TWV0YWRhdGFbXTtcbiAgYW5pbWF0aW9uczogYW55W107XG4gIG5nQ29udGVudFNlbGVjdG9yczogc3RyaW5nW107XG4gIGludGVycG9sYXRpb246IFtzdHJpbmcsIHN0cmluZ118bnVsbDtcbiAgcHJlc2VydmVXaGl0ZXNwYWNlczogYm9vbGVhbjtcbiAgY29uc3RydWN0b3Ioe1xuICAgIGVuY2Fwc3VsYXRpb24sXG4gICAgdGVtcGxhdGUsXG4gICAgdGVtcGxhdGVVcmwsXG4gICAgaHRtbEFzdCxcbiAgICBzdHlsZXMsXG4gICAgc3R5bGVVcmxzLFxuICAgIGV4dGVybmFsU3R5bGVzaGVldHMsXG4gICAgYW5pbWF0aW9ucyxcbiAgICBuZ0NvbnRlbnRTZWxlY3RvcnMsXG4gICAgaW50ZXJwb2xhdGlvbixcbiAgICBpc0lubGluZSxcbiAgICBwcmVzZXJ2ZVdoaXRlc3BhY2VzXG4gIH06IHtcbiAgICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbnxudWxsLFxuICAgIHRlbXBsYXRlOiBzdHJpbmd8bnVsbCxcbiAgICB0ZW1wbGF0ZVVybDogc3RyaW5nfG51bGwsXG4gICAgaHRtbEFzdDogSHRtbFBhcnNlVHJlZVJlc3VsdHxudWxsLFxuICAgIHN0eWxlczogc3RyaW5nW10sXG4gICAgc3R5bGVVcmxzOiBzdHJpbmdbXSxcbiAgICBleHRlcm5hbFN0eWxlc2hlZXRzOiBDb21waWxlU3R5bGVzaGVldE1ldGFkYXRhW10sXG4gICAgbmdDb250ZW50U2VsZWN0b3JzOiBzdHJpbmdbXSxcbiAgICBhbmltYXRpb25zOiBhbnlbXSxcbiAgICBpbnRlcnBvbGF0aW9uOiBbc3RyaW5nLCBzdHJpbmddfG51bGwsXG4gICAgaXNJbmxpbmU6IGJvb2xlYW4sXG4gICAgcHJlc2VydmVXaGl0ZXNwYWNlczogYm9vbGVhblxuICB9KSB7XG4gICAgdGhpcy5lbmNhcHN1bGF0aW9uID0gZW5jYXBzdWxhdGlvbjtcbiAgICB0aGlzLnRlbXBsYXRlID0gdGVtcGxhdGU7XG4gICAgdGhpcy50ZW1wbGF0ZVVybCA9IHRlbXBsYXRlVXJsO1xuICAgIHRoaXMuaHRtbEFzdCA9IGh0bWxBc3Q7XG4gICAgdGhpcy5zdHlsZXMgPSBfbm9ybWFsaXplQXJyYXkoc3R5bGVzKTtcbiAgICB0aGlzLnN0eWxlVXJscyA9IF9ub3JtYWxpemVBcnJheShzdHlsZVVybHMpO1xuICAgIHRoaXMuZXh0ZXJuYWxTdHlsZXNoZWV0cyA9IF9ub3JtYWxpemVBcnJheShleHRlcm5hbFN0eWxlc2hlZXRzKTtcbiAgICB0aGlzLmFuaW1hdGlvbnMgPSBhbmltYXRpb25zID8gZmxhdHRlbihhbmltYXRpb25zKSA6IFtdO1xuICAgIHRoaXMubmdDb250ZW50U2VsZWN0b3JzID0gbmdDb250ZW50U2VsZWN0b3JzIHx8IFtdO1xuICAgIGlmIChpbnRlcnBvbGF0aW9uICYmIGludGVycG9sYXRpb24ubGVuZ3RoICE9IDIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgJ2ludGVycG9sYXRpb24nIHNob3VsZCBoYXZlIGEgc3RhcnQgYW5kIGFuIGVuZCBzeW1ib2wuYCk7XG4gICAgfVxuICAgIHRoaXMuaW50ZXJwb2xhdGlvbiA9IGludGVycG9sYXRpb247XG4gICAgdGhpcy5pc0lubGluZSA9IGlzSW5saW5lO1xuICAgIHRoaXMucHJlc2VydmVXaGl0ZXNwYWNlcyA9IHByZXNlcnZlV2hpdGVzcGFjZXM7XG4gIH1cblxuICB0b1N1bW1hcnkoKTogQ29tcGlsZVRlbXBsYXRlU3VtbWFyeSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5nQ29udGVudFNlbGVjdG9yczogdGhpcy5uZ0NvbnRlbnRTZWxlY3RvcnMsXG4gICAgICBlbmNhcHN1bGF0aW9uOiB0aGlzLmVuY2Fwc3VsYXRpb24sXG4gICAgICBzdHlsZXM6IHRoaXMuc3R5bGVzLFxuICAgICAgYW5pbWF0aW9uczogdGhpcy5hbmltYXRpb25zXG4gICAgfTtcbiAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvbXBpbGVFbnRyeUNvbXBvbmVudE1ldGFkYXRhIHtcbiAgY29tcG9uZW50VHlwZTogYW55O1xuICBjb21wb25lbnRGYWN0b3J5OiBTdGF0aWNTeW1ib2x8b2JqZWN0O1xufVxuXG4vLyBOb3RlOiBUaGlzIHNob3VsZCBvbmx5IHVzZSBpbnRlcmZhY2VzIGFzIG5lc3RlZCBkYXRhIHR5cGVzXG4vLyBhcyB3ZSBuZWVkIHRvIGJlIGFibGUgdG8gc2VyaWFsaXplIHRoaXMgZnJvbS90byBKU09OIVxuZXhwb3J0IGludGVyZmFjZSBDb21waWxlRGlyZWN0aXZlU3VtbWFyeSBleHRlbmRzIENvbXBpbGVUeXBlU3VtbWFyeSB7XG4gIHR5cGU6IENvbXBpbGVUeXBlTWV0YWRhdGE7XG4gIGlzQ29tcG9uZW50OiBib29sZWFuO1xuICBzZWxlY3Rvcjogc3RyaW5nfG51bGw7XG4gIGV4cG9ydEFzOiBzdHJpbmd8bnVsbDtcbiAgaW5wdXRzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfTtcbiAgb3V0cHV0czoge1trZXk6IHN0cmluZ106IHN0cmluZ307XG4gIGhvc3RMaXN0ZW5lcnM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9O1xuICBob3N0UHJvcGVydGllczoge1trZXk6IHN0cmluZ106IHN0cmluZ307XG4gIGhvc3RBdHRyaWJ1dGVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfTtcbiAgcHJvdmlkZXJzOiBDb21waWxlUHJvdmlkZXJNZXRhZGF0YVtdO1xuICB2aWV3UHJvdmlkZXJzOiBDb21waWxlUHJvdmlkZXJNZXRhZGF0YVtdO1xuICBxdWVyaWVzOiBDb21waWxlUXVlcnlNZXRhZGF0YVtdO1xuICBndWFyZHM6IHtba2V5OiBzdHJpbmddOiBhbnl9O1xuICB2aWV3UXVlcmllczogQ29tcGlsZVF1ZXJ5TWV0YWRhdGFbXTtcbiAgZW50cnlDb21wb25lbnRzOiBDb21waWxlRW50cnlDb21wb25lbnRNZXRhZGF0YVtdO1xuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5fG51bGw7XG4gIHRlbXBsYXRlOiBDb21waWxlVGVtcGxhdGVTdW1tYXJ5fG51bGw7XG4gIGNvbXBvbmVudFZpZXdUeXBlOiBTdGF0aWNTeW1ib2x8UHJveHlDbGFzc3xudWxsO1xuICByZW5kZXJlclR5cGU6IFN0YXRpY1N5bWJvbHxvYmplY3R8bnVsbDtcbiAgY29tcG9uZW50RmFjdG9yeTogU3RhdGljU3ltYm9sfG9iamVjdHxudWxsO1xufVxuXG4vKipcbiAqIE1ldGFkYXRhIHJlZ2FyZGluZyBjb21waWxhdGlvbiBvZiBhIGRpcmVjdGl2ZS5cbiAqL1xuZXhwb3J0IGNsYXNzIENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSB7XG4gIHN0YXRpYyBjcmVhdGUoe1xuICAgIGlzSG9zdCxcbiAgICB0eXBlLFxuICAgIGlzQ29tcG9uZW50LFxuICAgIHNlbGVjdG9yLFxuICAgIGV4cG9ydEFzLFxuICAgIGNoYW5nZURldGVjdGlvbixcbiAgICBpbnB1dHMsXG4gICAgb3V0cHV0cyxcbiAgICBob3N0LFxuICAgIHByb3ZpZGVycyxcbiAgICB2aWV3UHJvdmlkZXJzLFxuICAgIHF1ZXJpZXMsXG4gICAgZ3VhcmRzLFxuICAgIHZpZXdRdWVyaWVzLFxuICAgIGVudHJ5Q29tcG9uZW50cyxcbiAgICB0ZW1wbGF0ZSxcbiAgICBjb21wb25lbnRWaWV3VHlwZSxcbiAgICByZW5kZXJlclR5cGUsXG4gICAgY29tcG9uZW50RmFjdG9yeVxuICB9OiB7XG4gICAgaXNIb3N0OiBib29sZWFuLFxuICAgIHR5cGU6IENvbXBpbGVUeXBlTWV0YWRhdGEsXG4gICAgaXNDb21wb25lbnQ6IGJvb2xlYW4sXG4gICAgc2VsZWN0b3I6IHN0cmluZ3xudWxsLFxuICAgIGV4cG9ydEFzOiBzdHJpbmd8bnVsbCxcbiAgICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5fG51bGwsXG4gICAgaW5wdXRzOiBzdHJpbmdbXSxcbiAgICBvdXRwdXRzOiBzdHJpbmdbXSxcbiAgICBob3N0OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICBwcm92aWRlcnM6IENvbXBpbGVQcm92aWRlck1ldGFkYXRhW10sXG4gICAgdmlld1Byb3ZpZGVyczogQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGFbXSxcbiAgICBxdWVyaWVzOiBDb21waWxlUXVlcnlNZXRhZGF0YVtdLFxuICAgIGd1YXJkczoge1trZXk6IHN0cmluZ106IGFueX07XG4gICAgdmlld1F1ZXJpZXM6IENvbXBpbGVRdWVyeU1ldGFkYXRhW10sXG4gICAgZW50cnlDb21wb25lbnRzOiBDb21waWxlRW50cnlDb21wb25lbnRNZXRhZGF0YVtdLFxuICAgIHRlbXBsYXRlOiBDb21waWxlVGVtcGxhdGVNZXRhZGF0YSxcbiAgICBjb21wb25lbnRWaWV3VHlwZTogU3RhdGljU3ltYm9sfFByb3h5Q2xhc3N8bnVsbCxcbiAgICByZW5kZXJlclR5cGU6IFN0YXRpY1N5bWJvbHxvYmplY3R8bnVsbCxcbiAgICBjb21wb25lbnRGYWN0b3J5OiBTdGF0aWNTeW1ib2x8b2JqZWN0fG51bGwsXG4gIH0pOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEge1xuICAgIGNvbnN0IGhvc3RMaXN0ZW5lcnM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gICAgY29uc3QgaG9zdFByb3BlcnRpZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gICAgY29uc3QgaG9zdEF0dHJpYnV0ZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gICAgaWYgKGhvc3QgIT0gbnVsbCkge1xuICAgICAgT2JqZWN0LmtleXMoaG9zdCkuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGhvc3Rba2V5XTtcbiAgICAgICAgY29uc3QgbWF0Y2hlcyA9IGtleS5tYXRjaChIT1NUX1JFR19FWFApO1xuICAgICAgICBpZiAobWF0Y2hlcyA9PT0gbnVsbCkge1xuICAgICAgICAgIGhvc3RBdHRyaWJ1dGVzW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChtYXRjaGVzWzFdICE9IG51bGwpIHtcbiAgICAgICAgICBob3N0UHJvcGVydGllc1ttYXRjaGVzWzFdXSA9IHZhbHVlO1xuICAgICAgICB9IGVsc2UgaWYgKG1hdGNoZXNbMl0gIT0gbnVsbCkge1xuICAgICAgICAgIGhvc3RMaXN0ZW5lcnNbbWF0Y2hlc1syXV0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIGNvbnN0IGlucHV0c01hcDoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcbiAgICBpZiAoaW5wdXRzICE9IG51bGwpIHtcbiAgICAgIGlucHV0cy5mb3JFYWNoKChiaW5kQ29uZmlnOiBzdHJpbmcpID0+IHtcbiAgICAgICAgLy8gY2Fub25pY2FsIHN5bnRheDogYGRpclByb3A6IGVsUHJvcGBcbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgbm8gYDpgLCB1c2UgZGlyUHJvcCA9IGVsUHJvcFxuICAgICAgICBjb25zdCBwYXJ0cyA9IHNwbGl0QXRDb2xvbihiaW5kQ29uZmlnLCBbYmluZENvbmZpZywgYmluZENvbmZpZ10pO1xuICAgICAgICBpbnB1dHNNYXBbcGFydHNbMF1dID0gcGFydHNbMV07XG4gICAgICB9KTtcbiAgICB9XG4gICAgY29uc3Qgb3V0cHV0c01hcDoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcbiAgICBpZiAob3V0cHV0cyAhPSBudWxsKSB7XG4gICAgICBvdXRwdXRzLmZvckVhY2goKGJpbmRDb25maWc6IHN0cmluZykgPT4ge1xuICAgICAgICAvLyBjYW5vbmljYWwgc3ludGF4OiBgZGlyUHJvcDogZWxQcm9wYFxuICAgICAgICAvLyBpZiB0aGVyZSBpcyBubyBgOmAsIHVzZSBkaXJQcm9wID0gZWxQcm9wXG4gICAgICAgIGNvbnN0IHBhcnRzID0gc3BsaXRBdENvbG9uKGJpbmRDb25maWcsIFtiaW5kQ29uZmlnLCBiaW5kQ29uZmlnXSk7XG4gICAgICAgIG91dHB1dHNNYXBbcGFydHNbMF1dID0gcGFydHNbMV07XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSh7XG4gICAgICBpc0hvc3QsXG4gICAgICB0eXBlLFxuICAgICAgaXNDb21wb25lbnQ6ICEhaXNDb21wb25lbnQsXG4gICAgICBzZWxlY3RvcixcbiAgICAgIGV4cG9ydEFzLFxuICAgICAgY2hhbmdlRGV0ZWN0aW9uLFxuICAgICAgaW5wdXRzOiBpbnB1dHNNYXAsXG4gICAgICBvdXRwdXRzOiBvdXRwdXRzTWFwLFxuICAgICAgaG9zdExpc3RlbmVycyxcbiAgICAgIGhvc3RQcm9wZXJ0aWVzLFxuICAgICAgaG9zdEF0dHJpYnV0ZXMsXG4gICAgICBwcm92aWRlcnMsXG4gICAgICB2aWV3UHJvdmlkZXJzLFxuICAgICAgcXVlcmllcyxcbiAgICAgIGd1YXJkcyxcbiAgICAgIHZpZXdRdWVyaWVzLFxuICAgICAgZW50cnlDb21wb25lbnRzLFxuICAgICAgdGVtcGxhdGUsXG4gICAgICBjb21wb25lbnRWaWV3VHlwZSxcbiAgICAgIHJlbmRlcmVyVHlwZSxcbiAgICAgIGNvbXBvbmVudEZhY3RvcnksXG4gICAgfSk7XG4gIH1cbiAgaXNIb3N0OiBib29sZWFuO1xuICB0eXBlOiBDb21waWxlVHlwZU1ldGFkYXRhO1xuICBpc0NvbXBvbmVudDogYm9vbGVhbjtcbiAgc2VsZWN0b3I6IHN0cmluZ3xudWxsO1xuICBleHBvcnRBczogc3RyaW5nfG51bGw7XG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3l8bnVsbDtcbiAgaW5wdXRzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfTtcbiAgb3V0cHV0czoge1trZXk6IHN0cmluZ106IHN0cmluZ307XG4gIGhvc3RMaXN0ZW5lcnM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9O1xuICBob3N0UHJvcGVydGllczoge1trZXk6IHN0cmluZ106IHN0cmluZ307XG4gIGhvc3RBdHRyaWJ1dGVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfTtcbiAgcHJvdmlkZXJzOiBDb21waWxlUHJvdmlkZXJNZXRhZGF0YVtdO1xuICB2aWV3UHJvdmlkZXJzOiBDb21waWxlUHJvdmlkZXJNZXRhZGF0YVtdO1xuICBxdWVyaWVzOiBDb21waWxlUXVlcnlNZXRhZGF0YVtdO1xuICBndWFyZHM6IHtba2V5OiBzdHJpbmddOiBhbnl9O1xuICB2aWV3UXVlcmllczogQ29tcGlsZVF1ZXJ5TWV0YWRhdGFbXTtcbiAgZW50cnlDb21wb25lbnRzOiBDb21waWxlRW50cnlDb21wb25lbnRNZXRhZGF0YVtdO1xuXG4gIHRlbXBsYXRlOiBDb21waWxlVGVtcGxhdGVNZXRhZGF0YXxudWxsO1xuXG4gIGNvbXBvbmVudFZpZXdUeXBlOiBTdGF0aWNTeW1ib2x8UHJveHlDbGFzc3xudWxsO1xuICByZW5kZXJlclR5cGU6IFN0YXRpY1N5bWJvbHxvYmplY3R8bnVsbDtcbiAgY29tcG9uZW50RmFjdG9yeTogU3RhdGljU3ltYm9sfG9iamVjdHxudWxsO1xuXG4gIGNvbnN0cnVjdG9yKHtcbiAgICBpc0hvc3QsXG4gICAgdHlwZSxcbiAgICBpc0NvbXBvbmVudCxcbiAgICBzZWxlY3RvcixcbiAgICBleHBvcnRBcyxcbiAgICBjaGFuZ2VEZXRlY3Rpb24sXG4gICAgaW5wdXRzLFxuICAgIG91dHB1dHMsXG4gICAgaG9zdExpc3RlbmVycyxcbiAgICBob3N0UHJvcGVydGllcyxcbiAgICBob3N0QXR0cmlidXRlcyxcbiAgICBwcm92aWRlcnMsXG4gICAgdmlld1Byb3ZpZGVycyxcbiAgICBxdWVyaWVzLFxuICAgIGd1YXJkcyxcbiAgICB2aWV3UXVlcmllcyxcbiAgICBlbnRyeUNvbXBvbmVudHMsXG4gICAgdGVtcGxhdGUsXG4gICAgY29tcG9uZW50Vmlld1R5cGUsXG4gICAgcmVuZGVyZXJUeXBlLFxuICAgIGNvbXBvbmVudEZhY3RvcnlcbiAgfToge1xuICAgIGlzSG9zdDogYm9vbGVhbixcbiAgICB0eXBlOiBDb21waWxlVHlwZU1ldGFkYXRhLFxuICAgIGlzQ29tcG9uZW50OiBib29sZWFuLFxuICAgIHNlbGVjdG9yOiBzdHJpbmd8bnVsbCxcbiAgICBleHBvcnRBczogc3RyaW5nfG51bGwsXG4gICAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneXxudWxsLFxuICAgIGlucHV0czoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgb3V0cHV0czoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgaG9zdExpc3RlbmVyczoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgaG9zdFByb3BlcnRpZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgIGhvc3RBdHRyaWJ1dGVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICBwcm92aWRlcnM6IENvbXBpbGVQcm92aWRlck1ldGFkYXRhW10sXG4gICAgdmlld1Byb3ZpZGVyczogQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGFbXSxcbiAgICBxdWVyaWVzOiBDb21waWxlUXVlcnlNZXRhZGF0YVtdLFxuICAgIGd1YXJkczoge1trZXk6IHN0cmluZ106IGFueX0sXG4gICAgdmlld1F1ZXJpZXM6IENvbXBpbGVRdWVyeU1ldGFkYXRhW10sXG4gICAgZW50cnlDb21wb25lbnRzOiBDb21waWxlRW50cnlDb21wb25lbnRNZXRhZGF0YVtdLFxuICAgIHRlbXBsYXRlOiBDb21waWxlVGVtcGxhdGVNZXRhZGF0YXxudWxsLFxuICAgIGNvbXBvbmVudFZpZXdUeXBlOiBTdGF0aWNTeW1ib2x8UHJveHlDbGFzc3xudWxsLFxuICAgIHJlbmRlcmVyVHlwZTogU3RhdGljU3ltYm9sfG9iamVjdHxudWxsLFxuICAgIGNvbXBvbmVudEZhY3Rvcnk6IFN0YXRpY1N5bWJvbHxvYmplY3R8bnVsbCxcbiAgfSkge1xuICAgIHRoaXMuaXNIb3N0ID0gISFpc0hvc3Q7XG4gICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICB0aGlzLmlzQ29tcG9uZW50ID0gaXNDb21wb25lbnQ7XG4gICAgdGhpcy5zZWxlY3RvciA9IHNlbGVjdG9yO1xuICAgIHRoaXMuZXhwb3J0QXMgPSBleHBvcnRBcztcbiAgICB0aGlzLmNoYW5nZURldGVjdGlvbiA9IGNoYW5nZURldGVjdGlvbjtcbiAgICB0aGlzLmlucHV0cyA9IGlucHV0cztcbiAgICB0aGlzLm91dHB1dHMgPSBvdXRwdXRzO1xuICAgIHRoaXMuaG9zdExpc3RlbmVycyA9IGhvc3RMaXN0ZW5lcnM7XG4gICAgdGhpcy5ob3N0UHJvcGVydGllcyA9IGhvc3RQcm9wZXJ0aWVzO1xuICAgIHRoaXMuaG9zdEF0dHJpYnV0ZXMgPSBob3N0QXR0cmlidXRlcztcbiAgICB0aGlzLnByb3ZpZGVycyA9IF9ub3JtYWxpemVBcnJheShwcm92aWRlcnMpO1xuICAgIHRoaXMudmlld1Byb3ZpZGVycyA9IF9ub3JtYWxpemVBcnJheSh2aWV3UHJvdmlkZXJzKTtcbiAgICB0aGlzLnF1ZXJpZXMgPSBfbm9ybWFsaXplQXJyYXkocXVlcmllcyk7XG4gICAgdGhpcy5ndWFyZHMgPSBndWFyZHM7XG4gICAgdGhpcy52aWV3UXVlcmllcyA9IF9ub3JtYWxpemVBcnJheSh2aWV3UXVlcmllcyk7XG4gICAgdGhpcy5lbnRyeUNvbXBvbmVudHMgPSBfbm9ybWFsaXplQXJyYXkoZW50cnlDb21wb25lbnRzKTtcbiAgICB0aGlzLnRlbXBsYXRlID0gdGVtcGxhdGU7XG5cbiAgICB0aGlzLmNvbXBvbmVudFZpZXdUeXBlID0gY29tcG9uZW50Vmlld1R5cGU7XG4gICAgdGhpcy5yZW5kZXJlclR5cGUgPSByZW5kZXJlclR5cGU7XG4gICAgdGhpcy5jb21wb25lbnRGYWN0b3J5ID0gY29tcG9uZW50RmFjdG9yeTtcbiAgfVxuXG4gIHRvU3VtbWFyeSgpOiBDb21waWxlRGlyZWN0aXZlU3VtbWFyeSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN1bW1hcnlLaW5kOiBDb21waWxlU3VtbWFyeUtpbmQuRGlyZWN0aXZlLFxuICAgICAgdHlwZTogdGhpcy50eXBlLFxuICAgICAgaXNDb21wb25lbnQ6IHRoaXMuaXNDb21wb25lbnQsXG4gICAgICBzZWxlY3RvcjogdGhpcy5zZWxlY3RvcixcbiAgICAgIGV4cG9ydEFzOiB0aGlzLmV4cG9ydEFzLFxuICAgICAgaW5wdXRzOiB0aGlzLmlucHV0cyxcbiAgICAgIG91dHB1dHM6IHRoaXMub3V0cHV0cyxcbiAgICAgIGhvc3RMaXN0ZW5lcnM6IHRoaXMuaG9zdExpc3RlbmVycyxcbiAgICAgIGhvc3RQcm9wZXJ0aWVzOiB0aGlzLmhvc3RQcm9wZXJ0aWVzLFxuICAgICAgaG9zdEF0dHJpYnV0ZXM6IHRoaXMuaG9zdEF0dHJpYnV0ZXMsXG4gICAgICBwcm92aWRlcnM6IHRoaXMucHJvdmlkZXJzLFxuICAgICAgdmlld1Byb3ZpZGVyczogdGhpcy52aWV3UHJvdmlkZXJzLFxuICAgICAgcXVlcmllczogdGhpcy5xdWVyaWVzLFxuICAgICAgZ3VhcmRzOiB0aGlzLmd1YXJkcyxcbiAgICAgIHZpZXdRdWVyaWVzOiB0aGlzLnZpZXdRdWVyaWVzLFxuICAgICAgZW50cnlDb21wb25lbnRzOiB0aGlzLmVudHJ5Q29tcG9uZW50cyxcbiAgICAgIGNoYW5nZURldGVjdGlvbjogdGhpcy5jaGFuZ2VEZXRlY3Rpb24sXG4gICAgICB0ZW1wbGF0ZTogdGhpcy50ZW1wbGF0ZSAmJiB0aGlzLnRlbXBsYXRlLnRvU3VtbWFyeSgpLFxuICAgICAgY29tcG9uZW50Vmlld1R5cGU6IHRoaXMuY29tcG9uZW50Vmlld1R5cGUsXG4gICAgICByZW5kZXJlclR5cGU6IHRoaXMucmVuZGVyZXJUeXBlLFxuICAgICAgY29tcG9uZW50RmFjdG9yeTogdGhpcy5jb21wb25lbnRGYWN0b3J5XG4gICAgfTtcbiAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvbXBpbGVQaXBlU3VtbWFyeSBleHRlbmRzIENvbXBpbGVUeXBlU3VtbWFyeSB7XG4gIHR5cGU6IENvbXBpbGVUeXBlTWV0YWRhdGE7XG4gIG5hbWU6IHN0cmluZztcbiAgcHVyZTogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNsYXNzIENvbXBpbGVQaXBlTWV0YWRhdGEge1xuICB0eXBlOiBDb21waWxlVHlwZU1ldGFkYXRhO1xuICBuYW1lOiBzdHJpbmc7XG4gIHB1cmU6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3Ioe3R5cGUsIG5hbWUsIHB1cmV9OiB7XG4gICAgdHlwZTogQ29tcGlsZVR5cGVNZXRhZGF0YSxcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgcHVyZTogYm9vbGVhbixcbiAgfSkge1xuICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLnB1cmUgPSAhIXB1cmU7XG4gIH1cblxuICB0b1N1bW1hcnkoKTogQ29tcGlsZVBpcGVTdW1tYXJ5IHtcbiAgICByZXR1cm4ge1xuICAgICAgc3VtbWFyeUtpbmQ6IENvbXBpbGVTdW1tYXJ5S2luZC5QaXBlLFxuICAgICAgdHlwZTogdGhpcy50eXBlLFxuICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgcHVyZTogdGhpcy5wdXJlXG4gICAgfTtcbiAgfVxufVxuXG4vLyBOb3RlOiBUaGlzIHNob3VsZCBvbmx5IHVzZSBpbnRlcmZhY2VzIGFzIG5lc3RlZCBkYXRhIHR5cGVzXG4vLyBhcyB3ZSBuZWVkIHRvIGJlIGFibGUgdG8gc2VyaWFsaXplIHRoaXMgZnJvbS90byBKU09OIVxuZXhwb3J0IGludGVyZmFjZSBDb21waWxlTmdNb2R1bGVTdW1tYXJ5IGV4dGVuZHMgQ29tcGlsZVR5cGVTdW1tYXJ5IHtcbiAgdHlwZTogQ29tcGlsZVR5cGVNZXRhZGF0YTtcblxuICAvLyBOb3RlOiBUaGlzIGlzIHRyYW5zaXRpdmUgb3ZlciB0aGUgZXhwb3J0ZWQgbW9kdWxlcy5cbiAgZXhwb3J0ZWREaXJlY3RpdmVzOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhW107XG4gIC8vIE5vdGU6IFRoaXMgaXMgdHJhbnNpdGl2ZSBvdmVyIHRoZSBleHBvcnRlZCBtb2R1bGVzLlxuICBleHBvcnRlZFBpcGVzOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhW107XG5cbiAgLy8gTm90ZTogVGhpcyBpcyB0cmFuc2l0aXZlLlxuICBlbnRyeUNvbXBvbmVudHM6IENvbXBpbGVFbnRyeUNvbXBvbmVudE1ldGFkYXRhW107XG4gIC8vIE5vdGU6IFRoaXMgaXMgdHJhbnNpdGl2ZS5cbiAgcHJvdmlkZXJzOiB7cHJvdmlkZXI6IENvbXBpbGVQcm92aWRlck1ldGFkYXRhLCBtb2R1bGU6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGF9W107XG4gIC8vIE5vdGU6IFRoaXMgaXMgdHJhbnNpdGl2ZS5cbiAgbW9kdWxlczogQ29tcGlsZVR5cGVNZXRhZGF0YVtdO1xufVxuXG5leHBvcnQgY2xhc3MgQ29tcGlsZVNoYWxsb3dNb2R1bGVNZXRhZGF0YSB7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICB0eXBlITogQ29tcGlsZVR5cGVNZXRhZGF0YTtcblxuICByYXdFeHBvcnRzOiBhbnk7XG4gIHJhd0ltcG9ydHM6IGFueTtcbiAgcmF3UHJvdmlkZXJzOiBhbnk7XG59XG5cbi8qKlxuICogTWV0YWRhdGEgcmVnYXJkaW5nIGNvbXBpbGF0aW9uIG9mIGEgbW9kdWxlLlxuICovXG5leHBvcnQgY2xhc3MgQ29tcGlsZU5nTW9kdWxlTWV0YWRhdGEge1xuICB0eXBlOiBDb21waWxlVHlwZU1ldGFkYXRhO1xuICBkZWNsYXJlZERpcmVjdGl2ZXM6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGFbXTtcbiAgZXhwb3J0ZWREaXJlY3RpdmVzOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhW107XG4gIGRlY2xhcmVkUGlwZXM6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGFbXTtcblxuICBleHBvcnRlZFBpcGVzOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhW107XG4gIGVudHJ5Q29tcG9uZW50czogQ29tcGlsZUVudHJ5Q29tcG9uZW50TWV0YWRhdGFbXTtcbiAgYm9vdHN0cmFwQ29tcG9uZW50czogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YVtdO1xuICBwcm92aWRlcnM6IENvbXBpbGVQcm92aWRlck1ldGFkYXRhW107XG5cbiAgaW1wb3J0ZWRNb2R1bGVzOiBDb21waWxlTmdNb2R1bGVTdW1tYXJ5W107XG4gIGV4cG9ydGVkTW9kdWxlczogQ29tcGlsZU5nTW9kdWxlU3VtbWFyeVtdO1xuICBzY2hlbWFzOiBTY2hlbWFNZXRhZGF0YVtdO1xuICBpZDogc3RyaW5nfG51bGw7XG5cbiAgdHJhbnNpdGl2ZU1vZHVsZTogVHJhbnNpdGl2ZUNvbXBpbGVOZ01vZHVsZU1ldGFkYXRhO1xuXG4gIGNvbnN0cnVjdG9yKHtcbiAgICB0eXBlLFxuICAgIHByb3ZpZGVycyxcbiAgICBkZWNsYXJlZERpcmVjdGl2ZXMsXG4gICAgZXhwb3J0ZWREaXJlY3RpdmVzLFxuICAgIGRlY2xhcmVkUGlwZXMsXG4gICAgZXhwb3J0ZWRQaXBlcyxcbiAgICBlbnRyeUNvbXBvbmVudHMsXG4gICAgYm9vdHN0cmFwQ29tcG9uZW50cyxcbiAgICBpbXBvcnRlZE1vZHVsZXMsXG4gICAgZXhwb3J0ZWRNb2R1bGVzLFxuICAgIHNjaGVtYXMsXG4gICAgdHJhbnNpdGl2ZU1vZHVsZSxcbiAgICBpZFxuICB9OiB7XG4gICAgdHlwZTogQ29tcGlsZVR5cGVNZXRhZGF0YSxcbiAgICBwcm92aWRlcnM6IENvbXBpbGVQcm92aWRlck1ldGFkYXRhW10sXG4gICAgZGVjbGFyZWREaXJlY3RpdmVzOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhW10sXG4gICAgZXhwb3J0ZWREaXJlY3RpdmVzOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhW10sXG4gICAgZGVjbGFyZWRQaXBlczogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YVtdLFxuICAgIGV4cG9ydGVkUGlwZXM6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGFbXSxcbiAgICBlbnRyeUNvbXBvbmVudHM6IENvbXBpbGVFbnRyeUNvbXBvbmVudE1ldGFkYXRhW10sXG4gICAgYm9vdHN0cmFwQ29tcG9uZW50czogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YVtdLFxuICAgIGltcG9ydGVkTW9kdWxlczogQ29tcGlsZU5nTW9kdWxlU3VtbWFyeVtdLFxuICAgIGV4cG9ydGVkTW9kdWxlczogQ29tcGlsZU5nTW9kdWxlU3VtbWFyeVtdLFxuICAgIHRyYW5zaXRpdmVNb2R1bGU6IFRyYW5zaXRpdmVDb21waWxlTmdNb2R1bGVNZXRhZGF0YSxcbiAgICBzY2hlbWFzOiBTY2hlbWFNZXRhZGF0YVtdLFxuICAgIGlkOiBzdHJpbmd8bnVsbFxuICB9KSB7XG4gICAgdGhpcy50eXBlID0gdHlwZSB8fCBudWxsO1xuICAgIHRoaXMuZGVjbGFyZWREaXJlY3RpdmVzID0gX25vcm1hbGl6ZUFycmF5KGRlY2xhcmVkRGlyZWN0aXZlcyk7XG4gICAgdGhpcy5leHBvcnRlZERpcmVjdGl2ZXMgPSBfbm9ybWFsaXplQXJyYXkoZXhwb3J0ZWREaXJlY3RpdmVzKTtcbiAgICB0aGlzLmRlY2xhcmVkUGlwZXMgPSBfbm9ybWFsaXplQXJyYXkoZGVjbGFyZWRQaXBlcyk7XG4gICAgdGhpcy5leHBvcnRlZFBpcGVzID0gX25vcm1hbGl6ZUFycmF5KGV4cG9ydGVkUGlwZXMpO1xuICAgIHRoaXMucHJvdmlkZXJzID0gX25vcm1hbGl6ZUFycmF5KHByb3ZpZGVycyk7XG4gICAgdGhpcy5lbnRyeUNvbXBvbmVudHMgPSBfbm9ybWFsaXplQXJyYXkoZW50cnlDb21wb25lbnRzKTtcbiAgICB0aGlzLmJvb3RzdHJhcENvbXBvbmVudHMgPSBfbm9ybWFsaXplQXJyYXkoYm9vdHN0cmFwQ29tcG9uZW50cyk7XG4gICAgdGhpcy5pbXBvcnRlZE1vZHVsZXMgPSBfbm9ybWFsaXplQXJyYXkoaW1wb3J0ZWRNb2R1bGVzKTtcbiAgICB0aGlzLmV4cG9ydGVkTW9kdWxlcyA9IF9ub3JtYWxpemVBcnJheShleHBvcnRlZE1vZHVsZXMpO1xuICAgIHRoaXMuc2NoZW1hcyA9IF9ub3JtYWxpemVBcnJheShzY2hlbWFzKTtcbiAgICB0aGlzLmlkID0gaWQgfHwgbnVsbDtcbiAgICB0aGlzLnRyYW5zaXRpdmVNb2R1bGUgPSB0cmFuc2l0aXZlTW9kdWxlIHx8IG51bGw7XG4gIH1cblxuICB0b1N1bW1hcnkoKTogQ29tcGlsZU5nTW9kdWxlU3VtbWFyeSB7XG4gICAgY29uc3QgbW9kdWxlID0gdGhpcy50cmFuc2l0aXZlTW9kdWxlITtcbiAgICByZXR1cm4ge1xuICAgICAgc3VtbWFyeUtpbmQ6IENvbXBpbGVTdW1tYXJ5S2luZC5OZ01vZHVsZSxcbiAgICAgIHR5cGU6IHRoaXMudHlwZSxcbiAgICAgIGVudHJ5Q29tcG9uZW50czogbW9kdWxlLmVudHJ5Q29tcG9uZW50cyxcbiAgICAgIHByb3ZpZGVyczogbW9kdWxlLnByb3ZpZGVycyxcbiAgICAgIG1vZHVsZXM6IG1vZHVsZS5tb2R1bGVzLFxuICAgICAgZXhwb3J0ZWREaXJlY3RpdmVzOiBtb2R1bGUuZXhwb3J0ZWREaXJlY3RpdmVzLFxuICAgICAgZXhwb3J0ZWRQaXBlczogbW9kdWxlLmV4cG9ydGVkUGlwZXNcbiAgICB9O1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUcmFuc2l0aXZlQ29tcGlsZU5nTW9kdWxlTWV0YWRhdGEge1xuICBkaXJlY3RpdmVzU2V0ID0gbmV3IFNldDxhbnk+KCk7XG4gIGRpcmVjdGl2ZXM6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGFbXSA9IFtdO1xuICBleHBvcnRlZERpcmVjdGl2ZXNTZXQgPSBuZXcgU2V0PGFueT4oKTtcbiAgZXhwb3J0ZWREaXJlY3RpdmVzOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhW10gPSBbXTtcbiAgcGlwZXNTZXQgPSBuZXcgU2V0PGFueT4oKTtcbiAgcGlwZXM6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGFbXSA9IFtdO1xuICBleHBvcnRlZFBpcGVzU2V0ID0gbmV3IFNldDxhbnk+KCk7XG4gIGV4cG9ydGVkUGlwZXM6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGFbXSA9IFtdO1xuICBtb2R1bGVzU2V0ID0gbmV3IFNldDxhbnk+KCk7XG4gIG1vZHVsZXM6IENvbXBpbGVUeXBlTWV0YWRhdGFbXSA9IFtdO1xuICBlbnRyeUNvbXBvbmVudHNTZXQgPSBuZXcgU2V0PGFueT4oKTtcbiAgZW50cnlDb21wb25lbnRzOiBDb21waWxlRW50cnlDb21wb25lbnRNZXRhZGF0YVtdID0gW107XG5cbiAgcHJvdmlkZXJzOiB7cHJvdmlkZXI6IENvbXBpbGVQcm92aWRlck1ldGFkYXRhLCBtb2R1bGU6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGF9W10gPSBbXTtcblxuICBhZGRQcm92aWRlcihwcm92aWRlcjogQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGEsIG1vZHVsZTogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSkge1xuICAgIHRoaXMucHJvdmlkZXJzLnB1c2goe3Byb3ZpZGVyOiBwcm92aWRlciwgbW9kdWxlOiBtb2R1bGV9KTtcbiAgfVxuXG4gIGFkZERpcmVjdGl2ZShpZDogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSkge1xuICAgIGlmICghdGhpcy5kaXJlY3RpdmVzU2V0LmhhcyhpZC5yZWZlcmVuY2UpKSB7XG4gICAgICB0aGlzLmRpcmVjdGl2ZXNTZXQuYWRkKGlkLnJlZmVyZW5jZSk7XG4gICAgICB0aGlzLmRpcmVjdGl2ZXMucHVzaChpZCk7XG4gICAgfVxuICB9XG4gIGFkZEV4cG9ydGVkRGlyZWN0aXZlKGlkOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhKSB7XG4gICAgaWYgKCF0aGlzLmV4cG9ydGVkRGlyZWN0aXZlc1NldC5oYXMoaWQucmVmZXJlbmNlKSkge1xuICAgICAgdGhpcy5leHBvcnRlZERpcmVjdGl2ZXNTZXQuYWRkKGlkLnJlZmVyZW5jZSk7XG4gICAgICB0aGlzLmV4cG9ydGVkRGlyZWN0aXZlcy5wdXNoKGlkKTtcbiAgICB9XG4gIH1cbiAgYWRkUGlwZShpZDogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSkge1xuICAgIGlmICghdGhpcy5waXBlc1NldC5oYXMoaWQucmVmZXJlbmNlKSkge1xuICAgICAgdGhpcy5waXBlc1NldC5hZGQoaWQucmVmZXJlbmNlKTtcbiAgICAgIHRoaXMucGlwZXMucHVzaChpZCk7XG4gICAgfVxuICB9XG4gIGFkZEV4cG9ydGVkUGlwZShpZDogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSkge1xuICAgIGlmICghdGhpcy5leHBvcnRlZFBpcGVzU2V0LmhhcyhpZC5yZWZlcmVuY2UpKSB7XG4gICAgICB0aGlzLmV4cG9ydGVkUGlwZXNTZXQuYWRkKGlkLnJlZmVyZW5jZSk7XG4gICAgICB0aGlzLmV4cG9ydGVkUGlwZXMucHVzaChpZCk7XG4gICAgfVxuICB9XG4gIGFkZE1vZHVsZShpZDogQ29tcGlsZVR5cGVNZXRhZGF0YSkge1xuICAgIGlmICghdGhpcy5tb2R1bGVzU2V0LmhhcyhpZC5yZWZlcmVuY2UpKSB7XG4gICAgICB0aGlzLm1vZHVsZXNTZXQuYWRkKGlkLnJlZmVyZW5jZSk7XG4gICAgICB0aGlzLm1vZHVsZXMucHVzaChpZCk7XG4gICAgfVxuICB9XG4gIGFkZEVudHJ5Q29tcG9uZW50KGVjOiBDb21waWxlRW50cnlDb21wb25lbnRNZXRhZGF0YSkge1xuICAgIGlmICghdGhpcy5lbnRyeUNvbXBvbmVudHNTZXQuaGFzKGVjLmNvbXBvbmVudFR5cGUpKSB7XG4gICAgICB0aGlzLmVudHJ5Q29tcG9uZW50c1NldC5hZGQoZWMuY29tcG9uZW50VHlwZSk7XG4gICAgICB0aGlzLmVudHJ5Q29tcG9uZW50cy5wdXNoKGVjKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gX25vcm1hbGl6ZUFycmF5KG9iajogYW55W118dW5kZWZpbmVkfG51bGwpOiBhbnlbXSB7XG4gIHJldHVybiBvYmogfHwgW107XG59XG5cbmV4cG9ydCBjbGFzcyBQcm92aWRlck1ldGEge1xuICB0b2tlbjogYW55O1xuICB1c2VDbGFzczogVHlwZXxudWxsO1xuICB1c2VWYWx1ZTogYW55O1xuICB1c2VFeGlzdGluZzogYW55O1xuICB1c2VGYWN0b3J5OiBGdW5jdGlvbnxudWxsO1xuICBkZXBlbmRlbmNpZXM6IE9iamVjdFtdfG51bGw7XG4gIG11bHRpOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKHRva2VuOiBhbnksIHt1c2VDbGFzcywgdXNlVmFsdWUsIHVzZUV4aXN0aW5nLCB1c2VGYWN0b3J5LCBkZXBzLCBtdWx0aX06IHtcbiAgICB1c2VDbGFzcz86IFR5cGUsXG4gICAgdXNlVmFsdWU/OiBhbnksXG4gICAgdXNlRXhpc3Rpbmc/OiBhbnksXG4gICAgdXNlRmFjdG9yeT86IEZ1bmN0aW9ufG51bGwsXG4gICAgZGVwcz86IE9iamVjdFtdfG51bGwsXG4gICAgbXVsdGk/OiBib29sZWFuXG4gIH0pIHtcbiAgICB0aGlzLnRva2VuID0gdG9rZW47XG4gICAgdGhpcy51c2VDbGFzcyA9IHVzZUNsYXNzIHx8IG51bGw7XG4gICAgdGhpcy51c2VWYWx1ZSA9IHVzZVZhbHVlO1xuICAgIHRoaXMudXNlRXhpc3RpbmcgPSB1c2VFeGlzdGluZztcbiAgICB0aGlzLnVzZUZhY3RvcnkgPSB1c2VGYWN0b3J5IHx8IG51bGw7XG4gICAgdGhpcy5kZXBlbmRlbmNpZXMgPSBkZXBzIHx8IG51bGw7XG4gICAgdGhpcy5tdWx0aSA9ICEhbXVsdGk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZsYXR0ZW48VD4obGlzdDogQXJyYXk8VHxUW10+KTogVFtdIHtcbiAgcmV0dXJuIGxpc3QucmVkdWNlKChmbGF0OiBhbnlbXSwgaXRlbTogVHxUW10pOiBUW10gPT4ge1xuICAgIGNvbnN0IGZsYXRJdGVtID0gQXJyYXkuaXNBcnJheShpdGVtKSA/IGZsYXR0ZW4oaXRlbSkgOiBpdGVtO1xuICAgIHJldHVybiAoPFRbXT5mbGF0KS5jb25jYXQoZmxhdEl0ZW0pO1xuICB9LCBbXSk7XG59XG5cbmZ1bmN0aW9uIGppdFNvdXJjZVVybCh1cmw6IHN0cmluZykge1xuICAvLyBOb3RlOiBXZSBuZWVkIDMgXCIvXCIgc28gdGhhdCBuZyBzaG93cyB1cCBhcyBhIHNlcGFyYXRlIGRvbWFpblxuICAvLyBpbiB0aGUgY2hyb21lIGRldiB0b29scy5cbiAgcmV0dXJuIHVybC5yZXBsYWNlKC8oXFx3KzpcXC9cXC9bXFx3Oi1dKyk/KFxcLyspPy8sICduZzovLy8nKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRlbXBsYXRlU291cmNlVXJsKFxuICAgIG5nTW9kdWxlVHlwZTogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSwgY29tcE1ldGE6IHt0eXBlOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhfSxcbiAgICB0ZW1wbGF0ZU1ldGE6IHtpc0lubGluZTogYm9vbGVhbiwgdGVtcGxhdGVVcmw6IHN0cmluZ3xudWxsfSkge1xuICBsZXQgdXJsOiBzdHJpbmc7XG4gIGlmICh0ZW1wbGF0ZU1ldGEuaXNJbmxpbmUpIHtcbiAgICBpZiAoY29tcE1ldGEudHlwZS5yZWZlcmVuY2UgaW5zdGFuY2VvZiBTdGF0aWNTeW1ib2wpIHtcbiAgICAgIC8vIE5vdGU6IGEgLnRzIGZpbGUgbWlnaHQgY29udGFpbiBtdWx0aXBsZSBjb21wb25lbnRzIHdpdGggaW5saW5lIHRlbXBsYXRlcyxcbiAgICAgIC8vIHNvIHdlIG5lZWQgdG8gZ2l2ZSB0aGVtIHVuaXF1ZSB1cmxzLCBhcyB0aGVzZSB3aWxsIGJlIHVzZWQgZm9yIHNvdXJjZW1hcHMuXG4gICAgICB1cmwgPSBgJHtjb21wTWV0YS50eXBlLnJlZmVyZW5jZS5maWxlUGF0aH0uJHtjb21wTWV0YS50eXBlLnJlZmVyZW5jZS5uYW1lfS5odG1sYDtcbiAgICB9IGVsc2Uge1xuICAgICAgdXJsID0gYCR7aWRlbnRpZmllck5hbWUobmdNb2R1bGVUeXBlKX0vJHtpZGVudGlmaWVyTmFtZShjb21wTWV0YS50eXBlKX0uaHRtbGA7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHVybCA9IHRlbXBsYXRlTWV0YS50ZW1wbGF0ZVVybCE7XG4gIH1cbiAgcmV0dXJuIGNvbXBNZXRhLnR5cGUucmVmZXJlbmNlIGluc3RhbmNlb2YgU3RhdGljU3ltYm9sID8gdXJsIDogaml0U291cmNlVXJsKHVybCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaGFyZWRTdHlsZXNoZWV0Sml0VXJsKG1ldGE6IENvbXBpbGVTdHlsZXNoZWV0TWV0YWRhdGEsIGlkOiBudW1iZXIpIHtcbiAgY29uc3QgcGF0aFBhcnRzID0gbWV0YS5tb2R1bGVVcmwhLnNwbGl0KC9cXC9cXFxcL2cpO1xuICBjb25zdCBiYXNlTmFtZSA9IHBhdGhQYXJ0c1twYXRoUGFydHMubGVuZ3RoIC0gMV07XG4gIHJldHVybiBqaXRTb3VyY2VVcmwoYGNzcy8ke2lkfSR7YmFzZU5hbWV9Lm5nc3R5bGUuanNgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5nTW9kdWxlSml0VXJsKG1vZHVsZU1ldGE6IENvbXBpbGVOZ01vZHVsZU1ldGFkYXRhKTogc3RyaW5nIHtcbiAgcmV0dXJuIGppdFNvdXJjZVVybChgJHtpZGVudGlmaWVyTmFtZShtb2R1bGVNZXRhLnR5cGUpfS9tb2R1bGUubmdmYWN0b3J5LmpzYCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0ZW1wbGF0ZUppdFVybChcbiAgICBuZ01vZHVsZVR5cGU6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEsIGNvbXBNZXRhOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEpOiBzdHJpbmcge1xuICByZXR1cm4gaml0U291cmNlVXJsKFxuICAgICAgYCR7aWRlbnRpZmllck5hbWUobmdNb2R1bGVUeXBlKX0vJHtpZGVudGlmaWVyTmFtZShjb21wTWV0YS50eXBlKX0ubmdmYWN0b3J5LmpzYCk7XG59XG4iXX0=