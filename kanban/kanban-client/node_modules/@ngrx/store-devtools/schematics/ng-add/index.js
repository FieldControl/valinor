"use strict";
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
var standalone_1 = require("../../schematics-core/utility/standalone");
var project_1 = require("../../schematics-core/utility/project");
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
        var _b = __read((0, schematics_core_1.addImportToModule)(source, modulePath, "StoreDevtoolsModule.instrument({ maxAge: ".concat(options.maxAge, ", logOnly: !isDevMode() })"), modulePath), 1), instrumentNgModuleImport = _b[0];
        var changes = [
            (0, schematics_core_1.insertImport)(source, modulePath, 'StoreDevtoolsModule', '@ngrx/store-devtools'),
            (0, schematics_core_1.insertImport)(source, modulePath, 'isDevMode', '@angular/core'),
            instrumentNgModuleImport,
        ];
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
function addNgRxStoreDevToolsToPackageJson() {
    return function (host, context) {
        (0, schematics_core_1.addPackageToPackageJson)(host, 'dependencies', '@ngrx/store-devtools', schematics_core_1.platformVersion);
        context.addTask(new tasks_1.NodePackageInstallTask());
        return host;
    };
}
function addStandaloneConfig(options) {
    return function (host) {
        var e_2, _a;
        var mainFile = (0, project_1.getProjectMainFile)(host, options);
        if (host.exists(mainFile)) {
            var providerFn = 'provideStoreDevtools';
            if ((0, standalone_1.callsProvidersFunction)(host, mainFile, providerFn)) {
                // exit because the store config is already provided
                return host;
            }
            var providerOptions = [
                ts.factory.createIdentifier("{ maxAge: ".concat(options.maxAge, ", logOnly: !isDevMode() }")),
            ];
            var patchedConfigFile = (0, standalone_1.addFunctionalProvidersToStandaloneBootstrap)(host, mainFile, providerFn, '@ngrx/store-devtools', providerOptions);
            // insert reducers import into the patched file
            var configFileContent = host.read(patchedConfigFile);
            var source = ts.createSourceFile(patchedConfigFile, (configFileContent === null || configFileContent === void 0 ? void 0 : configFileContent.toString('utf-8')) || '', ts.ScriptTarget.Latest, true);
            var recorder = host.beginUpdate(patchedConfigFile);
            var changes = [
                (0, schematics_core_1.insertImport)(source, patchedConfigFile, 'isDevMode', '@angular/core'),
            ];
            try {
                for (var changes_2 = __values(changes), changes_2_1 = changes_2.next(); !changes_2_1.done; changes_2_1 = changes_2.next()) {
                    var change = changes_2_1.value;
                    if (change instanceof schematics_core_1.InsertChange) {
                        recorder.insertLeft(change.pos, change.toAdd);
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (changes_2_1 && !changes_2_1.done && (_a = changes_2.return)) _a.call(changes_2);
                }
                finally { if (e_2) throw e_2.error; }
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
        if (options.module && !isStandalone) {
            options.module = (0, schematics_core_1.findModuleFromOptions)(host, {
                name: '',
                module: options.module,
                path: options.path,
            });
        }
        var parsedPath = (0, schematics_core_1.parseName)(options.path, '');
        options.path = parsedPath.path;
        if (options.maxAge && (options.maxAge < 0 || options.maxAge === 1)) {
            throw new schematics_1.SchematicsException("maxAge should be an integer greater than 1.");
        }
        var configOrModuleUpdate = isStandalone
            ? addStandaloneConfig(options)
            : addImportToNgModule(options);
        return (0, schematics_1.chain)([
            (0, schematics_1.branchAndMerge)((0, schematics_1.chain)([configOrModuleUpdate])),
            options && options.skipPackageJson
                ? (0, schematics_1.noop)()
                : addNgRxStoreDevToolsToPackageJson(),
        ])(host, context);
    };
}
exports.default = default_1;
//# sourceMappingURL=index.js.map