"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.visitTemplates = exports.visitNgModules = exports.visitDecorator = exports.visitComponents = exports.visitNgModuleExports = exports.visitNgModuleImports = exports.visitTSSourceFiles = exports.platformVersion = exports.addPackageToPackageJson = exports.parseName = exports.updatePackage = exports.stringUtils = exports.isLib = exports.getProject = exports.getProjectPath = exports.getPrefix = exports.omit = exports.addReducerToActionReducerMap = exports.addReducerImportToNgModule = exports.addReducerToStateInterface = exports.addReducerToState = exports.findPropertyInAstObject = exports.buildRelativePath = exports.findModuleFromOptions = exports.findModule = exports.findComponentFromOptions = exports.getWorkspacePath = exports.getWorkspace = exports.commitChanges = exports.createChangeRecorder = exports.createReplaceChange = exports.ReplaceChange = exports.RemoveChange = exports.InsertChange = exports.NoopChange = exports.containsProperty = exports.replaceImport = exports.addProviderToModule = exports.addProviderToComponent = exports.addImportToModule = exports.addExportToModule = exports.addDeclarationToModule = exports.addBootstrapToModule = exports.insertImport = exports.insertAfterLastOccurrence = exports.getContentOfKeyLiteral = exports.getDecoratorMetadata = exports.getSourceNodes = exports.findNodes = void 0;
var strings_1 = require("./utility/strings");
var ast_utils_1 = require("./utility/ast-utils");
Object.defineProperty(exports, "findNodes", { enumerable: true, get: function () { return ast_utils_1.findNodes; } });
Object.defineProperty(exports, "getSourceNodes", { enumerable: true, get: function () { return ast_utils_1.getSourceNodes; } });
Object.defineProperty(exports, "getDecoratorMetadata", { enumerable: true, get: function () { return ast_utils_1.getDecoratorMetadata; } });
Object.defineProperty(exports, "getContentOfKeyLiteral", { enumerable: true, get: function () { return ast_utils_1.getContentOfKeyLiteral; } });
Object.defineProperty(exports, "insertAfterLastOccurrence", { enumerable: true, get: function () { return ast_utils_1.insertAfterLastOccurrence; } });
Object.defineProperty(exports, "insertImport", { enumerable: true, get: function () { return ast_utils_1.insertImport; } });
Object.defineProperty(exports, "addBootstrapToModule", { enumerable: true, get: function () { return ast_utils_1.addBootstrapToModule; } });
Object.defineProperty(exports, "addDeclarationToModule", { enumerable: true, get: function () { return ast_utils_1.addDeclarationToModule; } });
Object.defineProperty(exports, "addExportToModule", { enumerable: true, get: function () { return ast_utils_1.addExportToModule; } });
Object.defineProperty(exports, "addImportToModule", { enumerable: true, get: function () { return ast_utils_1.addImportToModule; } });
Object.defineProperty(exports, "addProviderToComponent", { enumerable: true, get: function () { return ast_utils_1.addProviderToComponent; } });
Object.defineProperty(exports, "addProviderToModule", { enumerable: true, get: function () { return ast_utils_1.addProviderToModule; } });
Object.defineProperty(exports, "replaceImport", { enumerable: true, get: function () { return ast_utils_1.replaceImport; } });
Object.defineProperty(exports, "containsProperty", { enumerable: true, get: function () { return ast_utils_1.containsProperty; } });
var change_1 = require("./utility/change");
Object.defineProperty(exports, "NoopChange", { enumerable: true, get: function () { return change_1.NoopChange; } });
Object.defineProperty(exports, "InsertChange", { enumerable: true, get: function () { return change_1.InsertChange; } });
Object.defineProperty(exports, "RemoveChange", { enumerable: true, get: function () { return change_1.RemoveChange; } });
Object.defineProperty(exports, "ReplaceChange", { enumerable: true, get: function () { return change_1.ReplaceChange; } });
Object.defineProperty(exports, "createReplaceChange", { enumerable: true, get: function () { return change_1.createReplaceChange; } });
Object.defineProperty(exports, "createChangeRecorder", { enumerable: true, get: function () { return change_1.createChangeRecorder; } });
Object.defineProperty(exports, "commitChanges", { enumerable: true, get: function () { return change_1.commitChanges; } });
var config_1 = require("./utility/config");
Object.defineProperty(exports, "getWorkspace", { enumerable: true, get: function () { return config_1.getWorkspace; } });
Object.defineProperty(exports, "getWorkspacePath", { enumerable: true, get: function () { return config_1.getWorkspacePath; } });
var find_component_1 = require("./utility/find-component");
Object.defineProperty(exports, "findComponentFromOptions", { enumerable: true, get: function () { return find_component_1.findComponentFromOptions; } });
var find_module_1 = require("./utility/find-module");
Object.defineProperty(exports, "findModule", { enumerable: true, get: function () { return find_module_1.findModule; } });
Object.defineProperty(exports, "findModuleFromOptions", { enumerable: true, get: function () { return find_module_1.findModuleFromOptions; } });
Object.defineProperty(exports, "buildRelativePath", { enumerable: true, get: function () { return find_module_1.buildRelativePath; } });
var json_utilts_1 = require("./utility/json-utilts");
Object.defineProperty(exports, "findPropertyInAstObject", { enumerable: true, get: function () { return json_utilts_1.findPropertyInAstObject; } });
var ngrx_utils_1 = require("./utility/ngrx-utils");
Object.defineProperty(exports, "addReducerToState", { enumerable: true, get: function () { return ngrx_utils_1.addReducerToState; } });
Object.defineProperty(exports, "addReducerToStateInterface", { enumerable: true, get: function () { return ngrx_utils_1.addReducerToStateInterface; } });
Object.defineProperty(exports, "addReducerImportToNgModule", { enumerable: true, get: function () { return ngrx_utils_1.addReducerImportToNgModule; } });
Object.defineProperty(exports, "addReducerToActionReducerMap", { enumerable: true, get: function () { return ngrx_utils_1.addReducerToActionReducerMap; } });
Object.defineProperty(exports, "omit", { enumerable: true, get: function () { return ngrx_utils_1.omit; } });
Object.defineProperty(exports, "getPrefix", { enumerable: true, get: function () { return ngrx_utils_1.getPrefix; } });
var project_1 = require("./utility/project");
Object.defineProperty(exports, "getProjectPath", { enumerable: true, get: function () { return project_1.getProjectPath; } });
Object.defineProperty(exports, "getProject", { enumerable: true, get: function () { return project_1.getProject; } });
Object.defineProperty(exports, "isLib", { enumerable: true, get: function () { return project_1.isLib; } });
exports.stringUtils = {
    dasherize: strings_1.dasherize,
    decamelize: strings_1.decamelize,
    camelize: strings_1.camelize,
    classify: strings_1.classify,
    underscore: strings_1.underscore,
    group: strings_1.group,
    capitalize: strings_1.capitalize,
    featurePath: strings_1.featurePath,
    pluralize: strings_1.pluralize,
};
var update_1 = require("./utility/update");
Object.defineProperty(exports, "updatePackage", { enumerable: true, get: function () { return update_1.updatePackage; } });
var parse_name_1 = require("./utility/parse-name");
Object.defineProperty(exports, "parseName", { enumerable: true, get: function () { return parse_name_1.parseName; } });
var package_1 = require("./utility/package");
Object.defineProperty(exports, "addPackageToPackageJson", { enumerable: true, get: function () { return package_1.addPackageToPackageJson; } });
var libs_version_1 = require("./utility/libs-version");
Object.defineProperty(exports, "platformVersion", { enumerable: true, get: function () { return libs_version_1.platformVersion; } });
var visitors_1 = require("./utility/visitors");
Object.defineProperty(exports, "visitTSSourceFiles", { enumerable: true, get: function () { return visitors_1.visitTSSourceFiles; } });
Object.defineProperty(exports, "visitNgModuleImports", { enumerable: true, get: function () { return visitors_1.visitNgModuleImports; } });
Object.defineProperty(exports, "visitNgModuleExports", { enumerable: true, get: function () { return visitors_1.visitNgModuleExports; } });
Object.defineProperty(exports, "visitComponents", { enumerable: true, get: function () { return visitors_1.visitComponents; } });
Object.defineProperty(exports, "visitDecorator", { enumerable: true, get: function () { return visitors_1.visitDecorator; } });
Object.defineProperty(exports, "visitNgModules", { enumerable: true, get: function () { return visitors_1.visitNgModules; } });
Object.defineProperty(exports, "visitTemplates", { enumerable: true, get: function () { return visitors_1.visitTemplates; } });
//# sourceMappingURL=index.js.map