"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var schematics_1 = require("@angular-devkit/schematics");
var tasks_1 = require("@angular-devkit/schematics/tasks");
var schematics_core_1 = require("../../schematics-core");
var project_1 = require("../../schematics-core/utility/project");
var standalone_1 = require("../../schematics-core/utility/standalone");
var ng_ast_utils_1 = require("@schematics/angular/utility/ng-ast-utils");
function addImportToNgModule(options) {
    return function (host) {
        var e_1, _a;
        var modulePath = options.module;
        if (!modulePath) {
            return host;
        }
        if (!host.exists(modulePath)) {
            throw new Error('Specified module does not exist');
        }
        var text = host.read(modulePath);
        if (text === null) {
            throw new schematics_1.SchematicsException("File ".concat(modulePath, " does not exist."));
        }
        var sourceText = text.toString('utf-8');
        var source = ts.createSourceFile(modulePath, sourceText, ts.ScriptTarget.Latest, true);
        var storeModuleReducers = options.minimal ? "{}" : "reducers";
        var storeModuleConfig = options.minimal
            ? "{}"
            : "{\n      metaReducers\n    }";
        var storeModuleSetup = "StoreModule.forRoot(".concat(storeModuleReducers, ", ").concat(storeModuleConfig, ")");
        var statePath = "/".concat(options.path, "/").concat(options.statePath);
        var relativePath = (0, schematics_core_1.buildRelativePath)(modulePath, statePath);
        var _b = __read((0, schematics_core_1.addImportToModule)(source, modulePath, storeModuleSetup, relativePath), 1), storeNgModuleImport = _b[0];
        var changes = [
            (0, schematics_core_1.insertImport)(source, modulePath, 'StoreModule', '@ngrx/store'),
            storeNgModuleImport,
        ];
        if (!options.minimal) {
            changes = changes.concat([
                (0, schematics_core_1.insertImport)(source, modulePath, 'reducers, metaReducers', relativePath),
            ]);
        }
        var recorder = host.beginUpdate(modulePath);
        try {
            for (var changes_1 = __values(changes), changes_1_1 = changes_1.next(); !changes_1_1.done; changes_1_1 = changes_1.next()) {
                var change = changes_1_1.value;
                if (change instanceof schematics_core_1.InsertChange) {
                    recorder.insertLeft(change.pos, change.toAdd);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (changes_1_1 && !changes_1_1.done && (_a = changes_1.return)) _a.call(changes_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        host.commitUpdate(recorder);
        return host;
    };
}
function addNgRxStoreToPackageJson() {
    return function (host, context) {
        (0, schematics_core_1.addPackageToPackageJson)(host, 'dependencies', '@ngrx/store', schematics_core_1.platformVersion);
        context.addTask(new tasks_1.NodePackageInstallTask());
        return host;
    };
}
function addNgRxESLintPlugin() {
    return function (host, context) {
        var _a;
        var eslint = (_a = host.read('.eslintrc.json')) === null || _a === void 0 ? void 0 : _a.toString('utf-8');
        if (eslint) {
            (0, schematics_core_1.addPackageToPackageJson)(host, 'devDependencies', '@ngrx/eslint-plugin', schematics_core_1.platformVersion);
            var installTaskId = context.addTask(new tasks_1.NodePackageInstallTask());
            context.addTask(new tasks_1.RunSchematicTask('@ngrx/eslint-plugin', 'ng-add', {}), [installTaskId]);
        }
        return host;
    };
}
function addStandaloneConfig(options) {
    return function (host) {
        var mainFile = (0, project_1.getProjectMainFile)(host, options);
        if (host.exists(mainFile)) {
            var storeProviderFn = 'provideStore';
            if ((0, standalone_1.callsProvidersFunction)(host, mainFile, storeProviderFn)) {
                // exit because the store config is already provided
                return host;
            }
            var storeProviderOptions = options.minimal
                ? []
                : [
                    ts.factory.createIdentifier('reducers'),
                    ts.factory.createIdentifier('{ metaReducers }'),
                ];
            var patchedConfigFile = (0, standalone_1.addFunctionalProvidersToStandaloneBootstrap)(host, mainFile, storeProviderFn, '@ngrx/store', storeProviderOptions);
            if (options.minimal) {
                // no need to add imports if it is minimal
                return host;
            }
            // insert reducers import into the patched file
            var configFileContent = host.read(patchedConfigFile);
            var source = ts.createSourceFile(patchedConfigFile, (configFileContent === null || configFileContent === void 0 ? void 0 : configFileContent.toString('utf-8')) || '', ts.ScriptTarget.Latest, true);
            var statePath = "/".concat(options.path, "/").concat(options.statePath);
            var relativePath = (0, schematics_core_1.buildRelativePath)("/".concat(patchedConfigFile), statePath);
            var recorder = host.beginUpdate(patchedConfigFile);
            var change = (0, schematics_core_1.insertImport)(source, patchedConfigFile, 'reducers, metaReducers', relativePath);
            if (change instanceof schematics_core_1.InsertChange) {
                recorder.insertLeft(change.pos, change.toAdd);
            }
            host.commitUpdate(recorder);
            return host;
        }
        throw new schematics_1.SchematicsException("Main file not found for a project ".concat(options.project));
    };
}
function default_1(options) {
    return function (host, context) {
        var mainFile = (0, project_1.getProjectMainFile)(host, options);
        var isStandalone = (0, ng_ast_utils_1.isStandaloneApp)(host, mainFile);
        options.path = (0, schematics_core_1.getProjectPath)(host, options);
        var parsedPath = (0, schematics_core_1.parseName)(options.path, '');
        options.path = parsedPath.path;
        if (options.module && !isStandalone) {
            options.module = (0, schematics_core_1.findModuleFromOptions)(host, {
                name: '',
                module: options.module,
                path: options.path,
            });
        }
        if (options.stateInterface && options.stateInterface !== 'State') {
            options.stateInterface = schematics_core_1.stringUtils.classify(options.stateInterface);
        }
        var templateSource = (0, schematics_1.apply)((0, schematics_1.url)('./files'), [
            (0, schematics_1.filter)(function () { return (options.minimal ? false : true); }),
            (0, schematics_1.applyTemplates)(__assign(__assign({}, schematics_core_1.stringUtils), options)),
            (0, schematics_1.move)(parsedPath.path),
        ]);
        var configOrModuleUpdate = isStandalone
            ? addStandaloneConfig(options)
            : addImportToNgModule(options);
        return (0, schematics_1.chain)([
            (0, schematics_1.branchAndMerge)((0, schematics_1.chain)([configOrModuleUpdate, (0, schematics_1.mergeWith)(templateSource)])),
            options && options.skipPackageJson ? (0, schematics_1.noop)() : addNgRxStoreToPackageJson(),
            options && options.skipESLintPlugin ? (0, schematics_1.noop)() : addNgRxESLintPlugin(),
        ])(host, context);
    };
}
exports.default = default_1;
//# sourceMappingURL=index.js.map