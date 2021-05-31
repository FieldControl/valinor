"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HammerGesturesMigration = void 0;
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular/cdk/schematics");
const change_1 = require("@schematics/angular/utility/change");
const fs_1 = require("fs");
const ts = require("typescript");
const find_hammer_script_tags_1 = require("./find-hammer-script-tags");
const find_main_module_1 = require("./find-main-module");
const hammer_template_check_1 = require("./hammer-template-check");
const import_manager_1 = require("./import-manager");
const remove_array_element_1 = require("./remove-array-element");
const remove_element_from_html_1 = require("./remove-element-from-html");
const GESTURE_CONFIG_CLASS_NAME = 'GestureConfig';
const GESTURE_CONFIG_FILE_NAME = 'gesture-config';
const GESTURE_CONFIG_TEMPLATE_PATH = './gesture-config.template';
const HAMMER_CONFIG_TOKEN_NAME = 'HAMMER_GESTURE_CONFIG';
const HAMMER_CONFIG_TOKEN_MODULE = '@angular/platform-browser';
const HAMMER_MODULE_NAME = 'HammerModule';
const HAMMER_MODULE_IMPORT = '@angular/platform-browser';
const HAMMER_MODULE_SPECIFIER = 'hammerjs';
const CANNOT_REMOVE_REFERENCE_ERROR = `Cannot remove reference to "GestureConfig". Please remove manually.`;
class HammerGesturesMigration extends schematics_1.DevkitMigration {
    constructor() {
        super(...arguments);
        // Only enable this rule if the migration targets v9 or v10 and is running for a non-test
        // target. We cannot migrate test targets since they have a limited scope
        // (in regards to source files) and therefore the HammerJS usage detection can be incorrect.
        this.enabled = (this.targetVersion === schematics_1.TargetVersion.V9 || this.targetVersion === schematics_1.TargetVersion.V10) &&
            !this.context.isTestTarget;
        this._printer = ts.createPrinter();
        this._importManager = new import_manager_1.ImportManager(this.fileSystem, this._printer);
        this._nodeFailures = [];
        /**
         * Whether custom HammerJS events provided by the Material gesture
         * config are used in a template.
         */
        this._customEventsUsedInTemplate = false;
        /** Whether standard HammerJS events are used in a template. */
        this._standardEventsUsedInTemplate = false;
        /** Whether HammerJS is accessed at runtime. */
        this._usedInRuntime = false;
        /**
         * List of imports that make "hammerjs" available globally. We keep track of these
         * since we might need to remove them if Hammer is not used.
         */
        this._installImports = [];
        /**
         * List of identifiers which resolve to the gesture config from Angular Material.
         */
        this._gestureConfigReferences = [];
        /**
         * List of identifiers which resolve to the "HAMMER_GESTURE_CONFIG" token from
         * "@angular/platform-browser".
         */
        this._hammerConfigTokenReferences = [];
        /**
         * List of identifiers which resolve to the "HammerModule" from
         * "@angular/platform-browser".
         */
        this._hammerModuleReferences = [];
        /**
         * List of identifiers that have been deleted from source files. This can be
         * used to determine if certain imports are still used or not.
         */
        this._deletedIdentifiers = [];
    }
    visitTemplate(template) {
        if (!this._customEventsUsedInTemplate || !this._standardEventsUsedInTemplate) {
            const { standardEvents, customEvents } = hammer_template_check_1.isHammerJsUsedInTemplate(template.content);
            this._customEventsUsedInTemplate = this._customEventsUsedInTemplate || customEvents;
            this._standardEventsUsedInTemplate = this._standardEventsUsedInTemplate || standardEvents;
        }
    }
    visitNode(node) {
        this._checkHammerImports(node);
        this._checkForRuntimeHammerUsage(node);
        this._checkForMaterialGestureConfig(node);
        this._checkForHammerGestureConfigToken(node);
        this._checkForHammerModuleReference(node);
    }
    postAnalysis() {
        // Walk through all hammer config token references and check if there
        // is a potential custom gesture config setup.
        const hasCustomGestureConfigSetup = this._hammerConfigTokenReferences.some(r => this._checkForCustomGestureConfigSetup(r));
        const usedInTemplate = this._standardEventsUsedInTemplate || this._customEventsUsedInTemplate;
        /*
          Possible scenarios and how the migration should change the project:
            1. We detect that a custom HammerJS gesture config is set up:
                - Remove references to the Material gesture config if no HammerJS event is used.
                - Print a warning about ambiguous configuration that cannot be handled completely
                  if there are references to the Material gesture config.
            2. We detect that HammerJS is only used programmatically:
                - Remove references to GestureConfig of Material.
                - Remove references to the "HammerModule" if present.
            3. We detect that standard HammerJS events are used in a template:
                - Set up the "HammerModule" from platform-browser.
                - Remove all gesture config references.
            4. We detect that custom HammerJS events provided by the Material gesture
               config are used.
                - Copy the Material gesture config into the app.
                - Rewrite all gesture config references to the newly copied one.
                - Set up the new gesture config in the root app module.
                - Set up the "HammerModule" from platform-browser.
            4. We detect no HammerJS usage at all:
                - Remove Hammer imports
                - Remove Material gesture config references
                - Remove HammerModule setup if present.
                - Remove Hammer script imports in "index.html" files.
        */
        if (hasCustomGestureConfigSetup) {
            // If a custom gesture config is provided, we always assume that HammerJS is used.
            HammerGesturesMigration.globalUsesHammer = true;
            if (!usedInTemplate && this._gestureConfigReferences.length) {
                // If the Angular Material gesture events are not used and we found a custom
                // gesture config, we can safely remove references to the Material gesture config
                // since events provided by the Material gesture config are guaranteed to be unused.
                this._removeMaterialGestureConfigSetup();
                this.printInfo('The HammerJS v9 migration for Angular Components detected that HammerJS is ' +
                    'manually set up in combination with references to the Angular Material gesture ' +
                    'config. This target cannot be migrated completely, but all references to the ' +
                    'deprecated Angular Material gesture have been removed. Read more here: ' +
                    'https://git.io/ng-material-v9-hammer-ambiguous-usage');
            }
            else if (usedInTemplate && this._gestureConfigReferences.length) {
                // Since there is a reference to the Angular Material gesture config, and we detected
                // usage of a gesture event that could be provided by Angular Material, we *cannot*
                // automatically remove references. This is because we do *not* know whether the
                // event is actually provided by the custom config or by the Material config.
                this.printInfo('The HammerJS v9 migration for Angular Components detected that HammerJS is ' +
                    'manually set up in combination with references to the Angular Material gesture ' +
                    'config. This target cannot be migrated completely. Please manually remove ' +
                    'references to the deprecated Angular Material gesture config. Read more here: ' +
                    'https://git.io/ng-material-v9-hammer-ambiguous-usage');
            }
        }
        else if (this._usedInRuntime || usedInTemplate) {
            // We keep track of whether Hammer is used globally. This is necessary because we
            // want to only remove Hammer from the "package.json" if it is not used in any project
            // target. Just because it isn't used in one target doesn't mean that we can safely
            // remove the dependency.
            HammerGesturesMigration.globalUsesHammer = true;
            // If hammer is only used at runtime, we don't need the gesture config or "HammerModule"
            // and can remove it (along with the hammer config token import if no longer needed).
            if (!usedInTemplate) {
                this._removeMaterialGestureConfigSetup();
                this._removeHammerModuleReferences();
            }
            else if (this._standardEventsUsedInTemplate && !this._customEventsUsedInTemplate) {
                this._setupHammerWithStandardEvents();
            }
            else {
                this._setupHammerWithCustomEvents();
            }
        }
        else {
            this._removeHammerSetup();
        }
        // Record the changes collected in the import manager. Changes need to be applied
        // once the import manager registered all import modifications. This avoids collisions.
        this._importManager.recordChanges();
        // Create migration failures that will be printed by the update-tool on migration
        // completion. We need special logic for updating failure positions to reflect
        // the new source file after modifications from the import manager.
        this.failures.push(...this._createMigrationFailures());
        // The template check for HammerJS events is not completely reliable as the event
        // output could also be from a component having an output named similarly to a known
        // hammerjs event (e.g. "@Output() slide"). The usage is therefore somewhat ambiguous
        // and we want to print a message that developers might be able to remove Hammer manually.
        if (!hasCustomGestureConfigSetup && !this._usedInRuntime && usedInTemplate) {
            this.printInfo('The HammerJS v9 migration for Angular Components migrated the ' +
                'project to keep HammerJS installed, but detected ambiguous usage of HammerJS. Please ' +
                'manually check if you can remove HammerJS from your application. More details: ' +
                'https://git.io/ng-material-v9-hammer-ambiguous-usage');
        }
    }
    /**
     * Sets up the hammer gesture config in the current project. To achieve this, the
     * following steps are performed:
     *   1) Create copy of Angular Material gesture config.
     *   2) Rewrite all references to the Angular Material gesture config to the
     *      new gesture config.
     *   3) Setup the HAMMER_GESTURE_CONFIG in the root app module (if not done already).
     *   4) Setup the "HammerModule" in the root app module (if not done already).
     */
    _setupHammerWithCustomEvents() {
        const project = this.context.project;
        const sourceRoot = this.fileSystem.resolve(project.sourceRoot || project.root);
        const newConfigPath = core_1.join(sourceRoot, this._getAvailableGestureConfigFileName(sourceRoot));
        // Copy gesture config template into the CLI project.
        this.fileSystem.create(newConfigPath, fs_1.readFileSync(require.resolve(GESTURE_CONFIG_TEMPLATE_PATH), 'utf8'));
        // Replace all Material gesture config references to resolve to the
        // newly copied gesture config.
        this._gestureConfigReferences.forEach(i => {
            const filePath = this.fileSystem.resolve(i.node.getSourceFile().fileName);
            return this._replaceGestureConfigReference(i, GESTURE_CONFIG_CLASS_NAME, getModuleSpecifier(newConfigPath, filePath));
        });
        // Setup the gesture config provider and the "HammerModule" in the root module
        // if not done already. The "HammerModule" is needed in v9 since it enables the
        // Hammer event plugin that was previously enabled by default in v8.
        this._setupNewGestureConfigInRootModule(newConfigPath);
        this._setupHammerModuleInRootModule();
    }
    /**
     * Sets up the standard hammer module in the project and removes all
     * references to the deprecated Angular Material gesture config.
     */
    _setupHammerWithStandardEvents() {
        // Setup the HammerModule. The HammerModule enables support for
        // the standard HammerJS events.
        this._setupHammerModuleInRootModule();
        this._removeMaterialGestureConfigSetup();
    }
    /**
     * Removes Hammer from the current project. The following steps are performed:
     *   1) Delete all TypeScript imports to "hammerjs".
     *   2) Remove references to the Angular Material gesture config.
     *   3) Remove "hammerjs" from all index HTML files of the current project.
     */
    _removeHammerSetup() {
        this._installImports.forEach(i => this._importManager.deleteImportByDeclaration(i));
        this._removeMaterialGestureConfigSetup();
        this._removeHammerModuleReferences();
        this._removeHammerFromIndexFile();
    }
    /**
     * Removes the gesture config setup by deleting all found references to the Angular
     * Material gesture config. Additionally, unused imports to the hammer gesture config
     * token from "@angular/platform-browser" will be removed as well.
     */
    _removeMaterialGestureConfigSetup() {
        this._gestureConfigReferences.forEach(r => this._removeGestureConfigReference(r));
        this._hammerConfigTokenReferences.forEach(r => {
            if (r.isImport) {
                this._removeHammerConfigTokenImportIfUnused(r);
            }
        });
    }
    /** Removes all references to the "HammerModule" from "@angular/platform-browser". */
    _removeHammerModuleReferences() {
        this._hammerModuleReferences.forEach(({ node, isImport, importData }) => {
            const sourceFile = node.getSourceFile();
            const recorder = this.fileSystem.edit(this.fileSystem.resolve(sourceFile.fileName));
            // Only remove the import for the HammerModule if the module has been accessed
            // through a non-namespaced identifier access.
            if (!isNamespacedIdentifierAccess(node)) {
                this._importManager.deleteNamedBindingImport(sourceFile, HAMMER_MODULE_NAME, importData.moduleName);
            }
            // For references from within an import, we do not need to do anything other than
            // removing the import. For other references, we remove the import and the actual
            // identifier in the module imports.
            if (isImport) {
                return;
            }
            // If the "HammerModule" is referenced within an array literal, we can
            // remove the element easily. Otherwise if it's outside of an array literal,
            // we need to replace the reference with an empty object literal w/ todo to
            // not break the application.
            if (ts.isArrayLiteralExpression(node.parent)) {
                // Removes the "HammerModule" from the parent array expression. Removes
                // the trailing comma token if present.
                remove_array_element_1.removeElementFromArrayExpression(node, recorder);
            }
            else {
                recorder.remove(node.getStart(), node.getWidth());
                recorder.insertRight(node.getStart(), `/* TODO: remove */ {}`);
                this._nodeFailures.push({
                    node: node,
                    message: 'Unable to delete reference to "HammerModule".',
                });
            }
        });
    }
    /**
     * Checks if the given node is a reference to the hammer gesture config
     * token from platform-browser. If so, keeps track of the reference.
     */
    _checkForHammerGestureConfigToken(node) {
        if (ts.isIdentifier(node)) {
            const importData = schematics_1.getImportOfIdentifier(node, this.typeChecker);
            if (importData && importData.symbolName === HAMMER_CONFIG_TOKEN_NAME &&
                importData.moduleName === HAMMER_CONFIG_TOKEN_MODULE) {
                this._hammerConfigTokenReferences.push({ node, importData, isImport: ts.isImportSpecifier(node.parent) });
            }
        }
    }
    /**
     * Checks if the given node is a reference to the HammerModule from
     * "@angular/platform-browser". If so, keeps track of the reference.
     */
    _checkForHammerModuleReference(node) {
        if (ts.isIdentifier(node)) {
            const importData = schematics_1.getImportOfIdentifier(node, this.typeChecker);
            if (importData && importData.symbolName === HAMMER_MODULE_NAME &&
                importData.moduleName === HAMMER_MODULE_IMPORT) {
                this._hammerModuleReferences.push({ node, importData, isImport: ts.isImportSpecifier(node.parent) });
            }
        }
    }
    /**
     * Checks if the given node is an import to the HammerJS package. Imports to
     * HammerJS which load specific symbols from the package are considered as
     * runtime usage of Hammer. e.g. `import {Symbol} from "hammerjs";`.
     */
    _checkHammerImports(node) {
        if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier) &&
            node.moduleSpecifier.text === HAMMER_MODULE_SPECIFIER) {
            // If there is an import to HammerJS that imports symbols, or is namespaced
            // (e.g. "import {A, B} from ..." or "import * as hammer from ..."), then we
            // assume that some exports are used at runtime.
            if (node.importClause &&
                !(node.importClause.namedBindings && ts.isNamedImports(node.importClause.namedBindings) &&
                    node.importClause.namedBindings.elements.length === 0)) {
                this._usedInRuntime = true;
            }
            else {
                this._installImports.push(node);
            }
        }
    }
    /**
     * Checks if the given node accesses the global "Hammer" symbol at runtime. If so,
     * the migration rule state will be updated to reflect that Hammer is used at runtime.
     */
    _checkForRuntimeHammerUsage(node) {
        if (this._usedInRuntime) {
            return;
        }
        // Detects usages of "window.Hammer".
        if (ts.isPropertyAccessExpression(node) && node.name.text === 'Hammer') {
            const originExpr = unwrapExpression(node.expression);
            if (ts.isIdentifier(originExpr) && originExpr.text === 'window') {
                this._usedInRuntime = true;
            }
            return;
        }
        // Detects usages of "window['Hammer']".
        if (ts.isElementAccessExpression(node) && ts.isStringLiteral(node.argumentExpression) &&
            node.argumentExpression.text === 'Hammer') {
            const originExpr = unwrapExpression(node.expression);
            if (ts.isIdentifier(originExpr) && originExpr.text === 'window') {
                this._usedInRuntime = true;
            }
            return;
        }
        // Handles usages of plain identifier with the name "Hammer". These usage
        // are valid if they resolve to "@types/hammerjs". e.g. "new Hammer(myElement)".
        if (ts.isIdentifier(node) && node.text === 'Hammer' &&
            !ts.isPropertyAccessExpression(node.parent) && !ts.isElementAccessExpression(node.parent)) {
            const symbol = this._getDeclarationSymbolOfNode(node);
            if (symbol && symbol.valueDeclaration &&
                symbol.valueDeclaration.getSourceFile().fileName.includes('@types/hammerjs')) {
                this._usedInRuntime = true;
            }
        }
    }
    /**
     * Checks if the given node references the gesture config from Angular Material.
     * If so, we keep track of the found symbol reference.
     */
    _checkForMaterialGestureConfig(node) {
        if (ts.isIdentifier(node)) {
            const importData = schematics_1.getImportOfIdentifier(node, this.typeChecker);
            if (importData && importData.symbolName === GESTURE_CONFIG_CLASS_NAME &&
                importData.moduleName.startsWith('@angular/material/')) {
                this._gestureConfigReferences.push({ node, importData, isImport: ts.isImportSpecifier(node.parent) });
            }
        }
    }
    /**
     * Checks if the given Hammer gesture config token reference is part of an
     * Angular provider definition that sets up a custom gesture config.
     */
    _checkForCustomGestureConfigSetup(tokenRef) {
        // Walk up the tree to look for a parent property assignment of the
        // reference to the hammer gesture config token.
        let propertyAssignment = tokenRef.node;
        while (propertyAssignment && !ts.isPropertyAssignment(propertyAssignment)) {
            propertyAssignment = propertyAssignment.parent;
        }
        if (!propertyAssignment || !ts.isPropertyAssignment(propertyAssignment) ||
            getPropertyNameText(propertyAssignment.name) !== 'provide') {
            return false;
        }
        const objectLiteralExpr = propertyAssignment.parent;
        const matchingIdentifiers = findMatchingChildNodes(objectLiteralExpr, ts.isIdentifier);
        // We naively assume that if there is a reference to the "GestureConfig" export
        // from Angular Material in the provider literal, that the provider sets up the
        // Angular Material gesture config.
        return !this._gestureConfigReferences.some(r => matchingIdentifiers.includes(r.node));
    }
    /**
     * Determines an available file name for the gesture config which should
     * be stored in the specified file path.
     */
    _getAvailableGestureConfigFileName(sourceRoot) {
        if (!this.fileSystem.exists(core_1.join(sourceRoot, `${GESTURE_CONFIG_FILE_NAME}.ts`))) {
            return `${GESTURE_CONFIG_FILE_NAME}.ts`;
        }
        let possibleName = `${GESTURE_CONFIG_FILE_NAME}-`;
        let index = 1;
        while (this.fileSystem.exists(core_1.join(sourceRoot, `${possibleName}-${index}.ts`))) {
            index++;
        }
        return `${possibleName + index}.ts`;
    }
    /** Replaces a given gesture config reference with a new import. */
    _replaceGestureConfigReference({ node, importData, isImport }, symbolName, moduleSpecifier) {
        const sourceFile = node.getSourceFile();
        const recorder = this.fileSystem.edit(this.fileSystem.resolve(sourceFile.fileName));
        // List of all identifiers referring to the gesture config in the current file. This
        // allows us to add an import for the copied gesture configuration without generating a
        // new identifier for the import to avoid collisions. i.e. "GestureConfig_1". The import
        // manager checks for possible name collisions, but is able to ignore specific identifiers.
        // We use this to ignore all references to the original Angular Material gesture config,
        // because these will be replaced and therefore will not interfere.
        const gestureIdentifiersInFile = this._getGestureConfigIdentifiersOfFile(sourceFile);
        // If the parent of the identifier is accessed through a namespace, we can just
        // import the new gesture config without rewriting the import declaration because
        // the config has been imported through a namespaced import.
        if (isNamespacedIdentifierAccess(node)) {
            const newExpression = this._importManager.addImportToSourceFile(sourceFile, symbolName, moduleSpecifier, false, gestureIdentifiersInFile);
            recorder.remove(node.parent.getStart(), node.parent.getWidth());
            recorder.insertRight(node.parent.getStart(), this._printNode(newExpression, sourceFile));
            return;
        }
        // Delete the old import to the "GestureConfig".
        this._importManager.deleteNamedBindingImport(sourceFile, GESTURE_CONFIG_CLASS_NAME, importData.moduleName);
        // If the current reference is not from inside of a import, we need to add a new
        // import to the copied gesture config and replace the identifier. For references
        // within an import, we do nothing but removing the actual import. This allows us
        // to remove unused imports to the Material gesture config.
        if (!isImport) {
            const newExpression = this._importManager.addImportToSourceFile(sourceFile, symbolName, moduleSpecifier, false, gestureIdentifiersInFile);
            recorder.remove(node.getStart(), node.getWidth());
            recorder.insertRight(node.getStart(), this._printNode(newExpression, sourceFile));
        }
    }
    /**
     * Removes a given gesture config reference and its corresponding import from
     * its containing source file. Imports will be always removed, but in some cases,
     * where it's not guaranteed that a removal can be performed safely, we just
     * create a migration failure (and add a TODO if possible).
     */
    _removeGestureConfigReference({ node, importData, isImport }) {
        const sourceFile = node.getSourceFile();
        const recorder = this.fileSystem.edit(this.fileSystem.resolve(sourceFile.fileName));
        // Only remove the import for the gesture config if the gesture config has
        // been accessed through a non-namespaced identifier access.
        if (!isNamespacedIdentifierAccess(node)) {
            this._importManager.deleteNamedBindingImport(sourceFile, GESTURE_CONFIG_CLASS_NAME, importData.moduleName);
        }
        // For references from within an import, we do not need to do anything other than
        // removing the import. For other references, we remove the import and the reference
        // identifier if used inside of a provider definition.
        if (isImport) {
            return;
        }
        const providerAssignment = node.parent;
        // Only remove references to the gesture config which are part of a statically
        // analyzable provider definition. We only support the common case of a gesture
        // config provider definition where the config is set up through "useClass".
        // Otherwise, it's not guaranteed that we can safely remove the provider definition.
        if (!ts.isPropertyAssignment(providerAssignment) ||
            getPropertyNameText(providerAssignment.name) !== 'useClass') {
            this._nodeFailures.push({ node, message: CANNOT_REMOVE_REFERENCE_ERROR });
            return;
        }
        const objectLiteralExpr = providerAssignment.parent;
        const provideToken = objectLiteralExpr.properties.find((p) => ts.isPropertyAssignment(p) && getPropertyNameText(p.name) === 'provide');
        // Do not remove the reference if the gesture config is not part of a provider definition,
        // or if the provided toke is not referring to the known HAMMER_GESTURE_CONFIG token
        // from platform-browser.
        if (!provideToken || !this._isReferenceToHammerConfigToken(provideToken.initializer)) {
            this._nodeFailures.push({ node, message: CANNOT_REMOVE_REFERENCE_ERROR });
            return;
        }
        // Collect all nested identifiers which will be deleted. This helps us
        // determining if we can remove imports for the "HAMMER_GESTURE_CONFIG" token.
        this._deletedIdentifiers.push(...findMatchingChildNodes(objectLiteralExpr, ts.isIdentifier));
        // In case the found provider definition is not part of an array literal,
        // we cannot safely remove the provider. This is because it could be declared
        // as a variable. e.g. "const gestureProvider = {provide: .., useClass: GestureConfig}".
        // In that case, we just add an empty object literal with TODO and print a failure.
        if (!ts.isArrayLiteralExpression(objectLiteralExpr.parent)) {
            recorder.remove(objectLiteralExpr.getStart(), objectLiteralExpr.getWidth());
            recorder.insertRight(objectLiteralExpr.getStart(), `/* TODO: remove */ {}`);
            this._nodeFailures.push({
                node: objectLiteralExpr,
                message: `Unable to delete provider definition for "GestureConfig" completely. ` +
                    `Please clean up the provider.`
            });
            return;
        }
        // Removes the object literal from the parent array expression. Removes
        // the trailing comma token if present.
        remove_array_element_1.removeElementFromArrayExpression(objectLiteralExpr, recorder);
    }
    /** Removes the given hammer config token import if it is not used. */
    _removeHammerConfigTokenImportIfUnused({ node, importData }) {
        const sourceFile = node.getSourceFile();
        const isTokenUsed = this._hammerConfigTokenReferences.some(r => !r.isImport && !isNamespacedIdentifierAccess(r.node) &&
            r.node.getSourceFile() === sourceFile && !this._deletedIdentifiers.includes(r.node));
        // We don't want to remove the import for the token if the token is
        // still used somewhere.
        if (!isTokenUsed) {
            this._importManager.deleteNamedBindingImport(sourceFile, HAMMER_CONFIG_TOKEN_NAME, importData.moduleName);
        }
    }
    /** Removes Hammer from all index HTML files of the current project. */
    _removeHammerFromIndexFile() {
        const indexFilePaths = schematics_1.getProjectIndexFiles(this.context.project);
        indexFilePaths.forEach(filePath => {
            if (!this.fileSystem.exists(filePath)) {
                return;
            }
            const htmlContent = this.fileSystem.read(filePath);
            const recorder = this.fileSystem.edit(filePath);
            find_hammer_script_tags_1.findHammerScriptImportElements(htmlContent)
                .forEach(el => remove_element_from_html_1.removeElementFromHtml(el, recorder));
        });
    }
    /** Sets up the Hammer gesture config in the root module if needed. */
    _setupNewGestureConfigInRootModule(gestureConfigPath) {
        const { project } = this.context;
        const mainFilePath = schematics_1.getProjectMainFile(project);
        const rootModuleSymbol = this._getRootModuleSymbol(mainFilePath);
        if (rootModuleSymbol === null) {
            this.failures.push({
                filePath: mainFilePath,
                message: `Could not setup Hammer gestures in module. Please ` +
                    `manually ensure that the Hammer gesture config is set up.`,
            });
            return;
        }
        const sourceFile = rootModuleSymbol.valueDeclaration.getSourceFile();
        const metadata = schematics_1.getDecoratorMetadata(sourceFile, 'NgModule', '@angular/core');
        // If no "NgModule" definition is found inside the source file, we just do nothing.
        if (!metadata.length) {
            return;
        }
        const filePath = this.fileSystem.resolve(sourceFile.fileName);
        const recorder = this.fileSystem.edit(filePath);
        const providersField = schematics_1.getMetadataField(metadata[0], 'providers')[0];
        const providerIdentifiers = providersField ? findMatchingChildNodes(providersField, ts.isIdentifier) : null;
        const gestureConfigExpr = this._importManager.addImportToSourceFile(sourceFile, GESTURE_CONFIG_CLASS_NAME, getModuleSpecifier(gestureConfigPath, filePath), false, this._getGestureConfigIdentifiersOfFile(sourceFile));
        const hammerConfigTokenExpr = this._importManager.addImportToSourceFile(sourceFile, HAMMER_CONFIG_TOKEN_NAME, HAMMER_CONFIG_TOKEN_MODULE);
        const newProviderNode = ts.createObjectLiteral([
            ts.createPropertyAssignment('provide', hammerConfigTokenExpr),
            ts.createPropertyAssignment('useClass', gestureConfigExpr)
        ]);
        // If the providers field exists and already contains references to the hammer gesture
        // config token and the gesture config, we naively assume that the gesture config is
        // already set up. We only want to add the gesture config provider if it is not set up.
        if (!providerIdentifiers ||
            !(this._hammerConfigTokenReferences.some(r => providerIdentifiers.includes(r.node)) &&
                this._gestureConfigReferences.some(r => providerIdentifiers.includes(r.node)))) {
            const symbolName = this._printNode(newProviderNode, sourceFile);
            schematics_1.addSymbolToNgModuleMetadata(sourceFile, sourceFile.fileName, 'providers', symbolName, null)
                .forEach(change => {
                if (change instanceof change_1.InsertChange) {
                    recorder.insertRight(change.pos, change.toAdd);
                }
            });
        }
    }
    /**
     * Gets the TypeScript symbol of the root module by looking for the module
     * bootstrap expression in the specified source file.
     */
    _getRootModuleSymbol(mainFilePath) {
        const mainFile = this.program.getSourceFile(mainFilePath);
        if (!mainFile) {
            return null;
        }
        const appModuleExpr = find_main_module_1.findMainModuleExpression(mainFile);
        if (!appModuleExpr) {
            return null;
        }
        const appModuleSymbol = this._getDeclarationSymbolOfNode(unwrapExpression(appModuleExpr));
        if (!appModuleSymbol || !appModuleSymbol.valueDeclaration) {
            return null;
        }
        return appModuleSymbol;
    }
    /** Sets up the "HammerModule" in the root module of the current project. */
    _setupHammerModuleInRootModule() {
        const { project } = this.context;
        const mainFilePath = schematics_1.getProjectMainFile(project);
        const rootModuleSymbol = this._getRootModuleSymbol(mainFilePath);
        if (rootModuleSymbol === null) {
            this.failures.push({
                filePath: mainFilePath,
                message: `Could not setup HammerModule. Please manually set up the "HammerModule" ` +
                    `from "@angular/platform-browser".`,
            });
            return;
        }
        const sourceFile = rootModuleSymbol.valueDeclaration.getSourceFile();
        const metadata = schematics_1.getDecoratorMetadata(sourceFile, 'NgModule', '@angular/core');
        if (!metadata.length) {
            return;
        }
        const importsField = schematics_1.getMetadataField(metadata[0], 'imports')[0];
        const importIdentifiers = importsField ? findMatchingChildNodes(importsField, ts.isIdentifier) : null;
        const recorder = this.fileSystem.edit(this.fileSystem.resolve(sourceFile.fileName));
        const hammerModuleExpr = this._importManager.addImportToSourceFile(sourceFile, HAMMER_MODULE_NAME, HAMMER_MODULE_IMPORT);
        // If the "HammerModule" is not already imported in the app module, we set it up
        // by adding it to the "imports" field of the app module.
        if (!importIdentifiers ||
            !this._hammerModuleReferences.some(r => importIdentifiers.includes(r.node))) {
            const symbolName = this._printNode(hammerModuleExpr, sourceFile);
            schematics_1.addSymbolToNgModuleMetadata(sourceFile, sourceFile.fileName, 'imports', symbolName, null)
                .forEach(change => {
                if (change instanceof change_1.InsertChange) {
                    recorder.insertRight(change.pos, change.toAdd);
                }
            });
        }
    }
    /** Prints a given node within the specified source file. */
    _printNode(node, sourceFile) {
        return this._printer.printNode(ts.EmitHint.Unspecified, node, sourceFile);
    }
    /** Gets all referenced gesture config identifiers of a given source file */
    _getGestureConfigIdentifiersOfFile(sourceFile) {
        return this._gestureConfigReferences.filter(d => d.node.getSourceFile() === sourceFile)
            .map(d => d.node);
    }
    /** Gets the symbol that contains the value declaration of the specified node. */
    _getDeclarationSymbolOfNode(node) {
        const symbol = this.typeChecker.getSymbolAtLocation(node);
        // Symbols can be aliases of the declaration symbol. e.g. in named import specifiers.
        // We need to resolve the aliased symbol back to the declaration symbol.
        // tslint:disable-next-line:no-bitwise
        if (symbol && (symbol.flags & ts.SymbolFlags.Alias) !== 0) {
            return this.typeChecker.getAliasedSymbol(symbol);
        }
        return symbol;
    }
    /**
     * Checks whether the given expression resolves to a hammer gesture config
     * token reference from "@angular/platform-browser".
     */
    _isReferenceToHammerConfigToken(expr) {
        const unwrapped = unwrapExpression(expr);
        if (ts.isIdentifier(unwrapped)) {
            return this._hammerConfigTokenReferences.some(r => r.node === unwrapped);
        }
        else if (ts.isPropertyAccessExpression(unwrapped)) {
            return this._hammerConfigTokenReferences.some(r => r.node === unwrapped.name);
        }
        return false;
    }
    /**
     * Creates migration failures of the collected node failures. The returned migration
     * failures are updated to reflect the post-migration state of source files. Meaning
     * that failure positions are corrected if source file modifications shifted lines.
     */
    _createMigrationFailures() {
        return this._nodeFailures.map(({ node, message }) => {
            const sourceFile = node.getSourceFile();
            const offset = node.getStart();
            const position = ts.getLineAndCharacterOfPosition(sourceFile, node.getStart());
            return {
                position: this._importManager.correctNodePosition(node, offset, position),
                message: message,
                filePath: this.fileSystem.resolve(sourceFile.fileName),
            };
        });
    }
    /**
     * Static migration rule method that will be called once all project targets
     * have been migrated individually. This method can be used to make changes based
     * on the analysis of the individual targets. For example: we only remove Hammer
     * from the "package.json" if it is not used in *any* project target.
     */
    static globalPostMigration(tree, context) {
        // Always notify the developer that the Hammer v9 migration does not migrate tests.
        context.logger.info('\n⚠  General notice: The HammerJS v9 migration for Angular Components is not able to ' +
            'migrate tests. Please manually clean up tests in your project if they rely on ' +
            (this.globalUsesHammer ? 'the deprecated Angular Material gesture config.' : 'HammerJS.'));
        context.logger.info('Read more about migrating tests: https://git.io/ng-material-v9-hammer-migrate-tests');
        if (!this.globalUsesHammer && this._removeHammerFromPackageJson(tree)) {
            // Since Hammer has been removed from the workspace "package.json" file,
            // we schedule a node package install task to refresh the lock file.
            return { runPackageManager: true };
        }
        // Clean global state once the workspace has been migrated. This is technically
        // not necessary in "ng update", but in tests we re-use the same rule class.
        this.globalUsesHammer = false;
    }
    /**
     * Removes the hammer package from the workspace "package.json".
     * @returns Whether Hammer was set up and has been removed from the "package.json"
     */
    static _removeHammerFromPackageJson(tree) {
        if (!tree.exists('/package.json')) {
            return false;
        }
        const packageJson = JSON.parse(tree.read('/package.json').toString('utf8'));
        // We do not handle the case where someone manually added "hammerjs" to the dev dependencies.
        if (packageJson.dependencies && packageJson.dependencies[HAMMER_MODULE_SPECIFIER]) {
            delete packageJson.dependencies[HAMMER_MODULE_SPECIFIER];
            tree.overwrite('/package.json', JSON.stringify(packageJson, null, 2));
            return true;
        }
        return false;
    }
}
exports.HammerGesturesMigration = HammerGesturesMigration;
/** Global state of whether Hammer is used in any analyzed project target. */
HammerGesturesMigration.globalUsesHammer = false;
/**
 * Recursively unwraps a given expression if it is wrapped
 * by parenthesis, type casts or type assertions.
 */
function unwrapExpression(node) {
    if (ts.isParenthesizedExpression(node)) {
        return unwrapExpression(node.expression);
    }
    else if (ts.isAsExpression(node)) {
        return unwrapExpression(node.expression);
    }
    else if (ts.isTypeAssertion(node)) {
        return unwrapExpression(node.expression);
    }
    return node;
}
/**
 * Converts the specified path to a valid TypeScript module specifier which is
 * relative to the given containing file.
 */
function getModuleSpecifier(newPath, containingFile) {
    let result = core_1.relative(core_1.dirname(containingFile), newPath).replace(/\\/g, '/').replace(/\.ts$/, '');
    if (!result.startsWith('.')) {
        result = `./${result}`;
    }
    return result;
}
/**
 * Gets the text of the given property name.
 * @returns Text of the given property name. Null if not statically analyzable.
 */
function getPropertyNameText(node) {
    if (ts.isIdentifier(node) || ts.isStringLiteralLike(node)) {
        return node.text;
    }
    return null;
}
/** Checks whether the given identifier is part of a namespaced access. */
function isNamespacedIdentifierAccess(node) {
    return ts.isQualifiedName(node.parent) || ts.isPropertyAccessExpression(node.parent);
}
/**
 * Walks through the specified node and returns all child nodes which match the
 * given predicate.
 */
function findMatchingChildNodes(parent, predicate) {
    const result = [];
    const visitNode = (node) => {
        if (predicate(node)) {
            result.push(node);
        }
        ts.forEachChild(node, visitNode);
    };
    ts.forEachChild(parent, visitNode);
    return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFtbWVyLWdlc3R1cmVzLW1pZ3JhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9zY2hlbWF0aWNzL25nLXVwZGF0ZS9taWdyYXRpb25zL2hhbW1lci1nZXN0dXJlcy12OS9oYW1tZXItZ2VzdHVyZXMtbWlncmF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILCtDQUs4QjtBQUU5Qix3REFhaUM7QUFDakMsK0RBQWdFO0FBQ2hFLDJCQUFnQztBQUNoQyxpQ0FBaUM7QUFFakMsdUVBQXlFO0FBQ3pFLHlEQUE0RDtBQUM1RCxtRUFBaUU7QUFDakUscURBQStDO0FBQy9DLGlFQUF3RTtBQUN4RSx5RUFBaUU7QUFFakUsTUFBTSx5QkFBeUIsR0FBRyxlQUFlLENBQUM7QUFDbEQsTUFBTSx3QkFBd0IsR0FBRyxnQkFBZ0IsQ0FBQztBQUNsRCxNQUFNLDRCQUE0QixHQUFHLDJCQUEyQixDQUFDO0FBRWpFLE1BQU0sd0JBQXdCLEdBQUcsdUJBQXVCLENBQUM7QUFDekQsTUFBTSwwQkFBMEIsR0FBRywyQkFBMkIsQ0FBQztBQUUvRCxNQUFNLGtCQUFrQixHQUFHLGNBQWMsQ0FBQztBQUMxQyxNQUFNLG9CQUFvQixHQUFHLDJCQUEyQixDQUFDO0FBRXpELE1BQU0sdUJBQXVCLEdBQUcsVUFBVSxDQUFDO0FBRTNDLE1BQU0sNkJBQTZCLEdBQy9CLHFFQUFxRSxDQUFDO0FBWTFFLE1BQWEsdUJBQXdCLFNBQVEsNEJBQXFCO0lBQWxFOztRQUNFLHlGQUF5RjtRQUN6Rix5RUFBeUU7UUFDekUsNEZBQTRGO1FBQzVGLFlBQU8sR0FDSCxDQUFDLElBQUksQ0FBQyxhQUFhLEtBQUssMEJBQWEsQ0FBQyxFQUFFLElBQUksSUFBSSxDQUFDLGFBQWEsS0FBSywwQkFBYSxDQUFDLEdBQUcsQ0FBQztZQUNyRixDQUFDLElBQUksQ0FBQyxPQUFPLENB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dkIsTUFBTSxTQUFTLEdBQUcsQ0FBQyxJQUFhLEVBQUUsRUFBRTtRQUNsQyxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNuQixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ25CO1FBQ0QsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDbkMsQ0FBQyxDQUFDO0lBQ0YsRUFBRSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDbkMsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBqb2luLFxuICBQYXRoLFxuICByZWxhdGl2ZSxcbiAgZGlybmFtZVxufSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZSc7XG5pbXBvcnQge1NjaGVtYXRpY0NvbnRleHQsIFRyZWV9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzJztcbmltcG9ydCB7XG4gIGFkZFN5bWJvbFRvTmdNb2R1bGVNZXRhZGF0YSxcbiAgRGV2a2l0TWlncmF0aW9uLFxuICBnZXREZWNvcmF0b3JNZXRhZGF0YSxcbiAgZ2V0SW1wb3J0T2ZJZGVudGlmaWVyLFxuICBnZXRNZXRhZGF0YUZpZWxkLFxuICBnZXRQcm9qZWN0SW5kZXhGaWxlcyxcbiAgZ2V0UHJvamVjdE1haW5GaWxlLFxuICBJbXBvcnQsXG4gIE1pZ3JhdGlvbkZhaWx1cmUsXG4gIFBvc3RNaWdyYXRpb25BY3Rpb24sXG4gIFJlc29sdmVkUmVzb3VyY2UsXG4gIFRhcmdldFZlcnNpb24sXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay9zY2hlbWF0aWNzJztcbmltcG9ydCB7SW5zZXJ0Q2hhbmdlfSBmcm9tICdAc2NoZW1hdGljcy9hbmd1bGFyL3V0aWxpdHkvY2hhbmdlJztcbmltcG9ydCB7cmVhZEZpbGVTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtmaW5kSGFtbWVyU2NyaXB0SW1wb3J0RWxlbWVudHN9IGZyb20gJy4vZmluZC1oYW1tZXItc2NyaXB0LXRhZ3MnO1xuaW1wb3J0IHtmaW5kTWFpbk1vZHVsZUV4cHJlc3Npb259IGZyb20gJy4vZmluZC1tYWluLW1vZHVsZSc7XG5pbXBvcnQge2lzSGFtbWVySnNVc2VkSW5UZW1wbGF0ZX0gZnJvbSAnLi9oYW1tZXItdGVtcGxhdGUtY2hlY2snO1xuaW1wb3J0IHtJbXBvcnRNYW5hZ2VyfSBmcm9tICcuL2ltcG9ydC1tYW5hZ2VyJztcbmltcG9ydCB7cmVtb3ZlRWxlbWVudEZyb21BcnJheUV4cHJlc3Npb259IGZyb20gJy4vcmVtb3ZlLWFycmF5LWVsZW1lbnQnO1xuaW1wb3J0IHtyZW1vdmVFbGVtZW50RnJvbUh0bWx9IGZyb20gJy4vcmVtb3ZlLWVsZW1lbnQtZnJvbS1odG1sJztcblxuY29uc3QgR0VTVFVSRV9DT05GSUdfQ0xBU1NfTkFNRSA9ICdHZXN0dXJlQ29uZmlnJztcbmNvbnN0IEdFU1RVUkVfQ09ORklHX0ZJTEVfTkFNRSA9ICdnZXN0dXJlLWNvbmZpZyc7XG5jb25zdCBHRVNUVVJFX0NPTkZJR19URU1QTEFURV9QQVRIID0gJy4vZ2VzdHVyZS1jb25maWcudGVtcGxhdGUnO1xuXG5jb25zdCBIQU1NRVJfQ09ORklHX1RPS0VOX05BTUUgPSAnSEFNTUVSX0dFU1RVUkVfQ09ORklHJztcbmNvbnN0IEhBTU1FUl9DT05GSUdfVE9LRU5fTU9EVUxFID0gJ0Bhbmd1bGFyL3BsYXRmb3JtLWJyb3dzZXInO1xuXG5jb25zdCBIQU1NRVJfTU9EVUxFX05BTUUgPSAnSGFtbWVyTW9kdWxlJztcbmNvbnN0IEhBTU1FUl9NT0RVTEVfSU1QT1JUID0gJ0Bhbmd1bGFyL3BsYXRmb3JtLWJyb3dzZXInO1xuXG5jb25zdCBIQU1NRVJfTU9EVUxFX1NQRUNJRklFUiA9ICdoYW1tZXJqcyc7XG5cbmNvbnN0IENBTk5PVF9SRU1PVkVfUkVGRVJFTkNFX0VSUk9SID1cbiAgICBgQ2Fubm90IHJlbW92ZSByZWZlcmVuY2UgdG8gXCJHZXN0dXJlQ29uZmlnXCIuIFBsZWFzZSByZW1vdmUgbWFudWFsbHkuYDtcblxuaW50ZXJmYWNlIElkZW50aWZpZXJSZWZlcmVuY2Uge1xuICBub2RlOiB0cy5JZGVudGlmaWVyO1xuICBpbXBvcnREYXRhOiBJbXBvcnQ7XG4gIGlzSW1wb3J0OiBib29sZWFuO1xufVxuXG5pbnRlcmZhY2UgUGFja2FnZUpzb24ge1xuICBkZXBlbmRlbmNpZXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG59XG5cbmV4cG9ydCBjbGFzcyBIYW1tZXJHZXN0dXJlc01pZ3JhdGlvbiBleHRlbmRzIERldmtpdE1pZ3JhdGlvbjxudWxsPiB7XG4gIC8vIE9ubHkgZW5hYmxlIHRoaXMgcnVsZSBpZiB0aGUgbWlncmF0aW9uIHRhcmdldHMgdjkgb3IgdjEwIGFuZCBpcyBydW5uaW5nIGZvciBhIG5vbi10ZXN0XG4gIC8vIHRhcmdldC4gV2UgY2Fubm90IG1pZ3JhdGUgdGVzdCB0YXJnZXRzIHNpbmNlIHRoZXkgaGF2ZSBhIGxpbWl0ZWQgc2NvcGVcbiAgLy8gKGluIHJlZ2FyZHMgdG8gc291cmNlIGZpbGVzKSBhbmQgdGhlcmVmb3JlIHRoZSBIYW1tZXJKUyB1c2FnZSBkZXRlY3Rpb24gY2FuIGJlIGluY29ycmVjdC5cbiAgZW5hYmxlZCA9XG4gICAgICAodGhpcy50YXJnZXRWZXJzaW9uID09PSBUYXJnZXRWZXJzaW9uLlY5IHx8IHRoaXMudGFyZ2V0VmVyc2lvbiA9PT0gVGFyZ2V0VmVyc2lvbi5WMTApICYmXG4gICAgICAhdGhpcy5jb250ZXh0LmlzVGVzdFRhcmdldDtcblxuICBwcml2YXRlIF9wcmludGVyID0gdHMuY3JlYXRlUHJpbnRlcigpO1xuICBwcml2YXRlIF9pbXBvcnRNYW5hZ2VyID0gbmV3IEltcG9ydE1hbmFnZXIodGhpcy5maWxlU3lzdGVtLCB0aGlzLl9wcmludGVyKTtcbiAgcHJpdmF0ZSBfbm9kZUZhaWx1cmVzOiB7bm9kZTogdHMuTm9kZSwgbWVzc2FnZTogc3RyaW5nfVtdID0gW107XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgY3VzdG9tIEhhbW1lckpTIGV2ZW50cyBwcm92aWRlZCBieSB0aGUgTWF0ZXJpYWwgZ2VzdHVyZVxuICAgKiBjb25maWcgYXJlIHVzZWQgaW4gYSB0ZW1wbGF0ZS5cbiAgICovXG4gIHByaXZhdGUgX2N1c3RvbUV2ZW50c1VzZWRJblRlbXBsYXRlID0gZmFsc2U7XG5cbiAgLyoqIFdoZXRoZXIgc3RhbmRhcmQgSGFtbWVySlMgZXZlbnRzIGFyZSB1c2VkIGluIGEgdGVtcGxhdGUuICovXG4gIHByaXZhdGUgX3N0YW5kYXJkRXZlbnRzVXNlZEluVGVtcGxhdGUgPSBmYWxzZTtcblxuICAvKiogV2hldGhlciBIYW1tZXJKUyBpcyBhY2Nlc3NlZCBhdCBydW50aW1lLiAqL1xuICBwcml2YXRlIF91c2VkSW5SdW50aW1lID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIExpc3Qgb2YgaW1wb3J0cyB0aGF0IG1ha2UgXCJoYW1tZXJqc1wiIGF2YWlsYWJsZSBnbG9iYWxseS4gV2Uga2VlcCB0cmFjayBvZiB0aGVzZVxuICAgKiBzaW5jZSB3ZSBtaWdodCBuZWVkIHRvIHJlbW92ZSB0aGVtIGlmIEhhbW1lciBpcyBub3QgdXNlZC5cbiAgICovXG4gIHByaXZhdGUgX2luc3RhbGxJbXBvcnRzOiB0cy5JbXBvcnREZWNsYXJhdGlvbltdID0gW107XG5cbiAgLyoqXG4gICAqIExpc3Qgb2YgaWRlbnRpZmllcnMgd2hpY2ggcmVzb2x2ZSB0byB0aGUgZ2VzdHVyZSBjb25maWcgZnJvbSBBbmd1bGFyIE1hdGVyaWFsLlxuICAgKi9cbiAgcHJpdmF0ZSBfZ2VzdHVyZUNvbmZpZ1JlZmVyZW5jZXM6IElkZW50aWZpZXJSZWZlcmVuY2VbXSA9IFtdO1xuXG4gIC8qKlxuICAgKiBMaXN0IG9mIGlkZW50aWZpZXJzIHdoaWNoIHJlc29sdmUgdG8gdGhlIFwiSEFNTUVSX0dFU1RVUkVfQ09ORklHXCIgdG9rZW4gZnJvbVxuICAgKiBcIkBhbmd1bGFyL3BsYXRmb3JtLWJyb3dzZXJcIi5cbiAgICovXG4gIHByaXZhdGUgX2hhbW1lckNvbmZpZ1Rva2VuUmVmZXJlbmNlczogSWRlbnRpZmllclJlZmVyZW5jZVtdID0gW107XG5cbiAgLyoqXG4gICAqIExpc3Qgb2YgaWRlbnRpZmllcnMgd2hpY2ggcmVzb2x2ZSB0byB0aGUgXCJIYW1tZXJNb2R1bGVcIiBmcm9tXG4gICAqIFwiQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3NlclwiLlxuICAgKi9cbiAgcHJpdmF0ZSBfaGFtbWVyTW9kdWxlUmVmZXJlbmNlczogSWRlbnRpZmllclJlZmVyZW5jZVtdID0gW107XG5cbiAgLyoqXG4gICAqIExpc3Qgb2YgaWRlbnRpZmllcnMgdGhhdCBoYXZlIGJlZW4gZGVsZXRlZCBmcm9tIHNvdXJjZSBmaWxlcy4gVGhpcyBjYW4gYmVcbiAgICogdXNlZCB0byBkZXRlcm1pbmUgaWYgY2VydGFpbiBpbXBvcnRzIGFyZSBzdGlsbCB1c2VkIG9yIG5vdC5cbiAgICovXG4gIHByaXZhdGUgX2RlbGV0ZWRJZGVudGlmaWVyczogdHMuSWRlbnRpZmllcltdID0gW107XG5cbiAgdmlzaXRUZW1wbGF0ZSh0ZW1wbGF0ZTogUmVzb2x2ZWRSZXNvdXJjZSk6IHZvaWQge1xuICAgIGlmICghdGhpcy5fY3VzdG9tRXZlbnRzVXNlZEluVGVtcGxhdGUgfHwgIXRoaXMuX3N0YW5kYXJkRXZlbnRzVXNlZEluVGVtcGxhdGUpIHtcbiAgICAgIGNvbnN0IHtzdGFuZGFyZEV2ZW50cywgY3VzdG9tRXZlbnRzfSA9IGlzSGFtbWVySnNVc2VkSW5UZW1wbGF0ZSh0ZW1wbGF0ZS5jb250ZW50KTtcbiAgICAgIHRoaXMuX2N1c3RvbUV2ZW50c1VzZWRJblRlbXBsYXRlID0gdGhpcy5fY3VzdG9tRXZlbnRzVXNlZEluVGVtcGxhdGUgfHwgY3VzdG9tRXZlbnRzO1xuICAgICAgdGhpcy5fc3RhbmRhcmRFdmVudHNVc2VkSW5UZW1wbGF0ZSA9IHRoaXMuX3N0YW5kYXJkRXZlbnRzVXNlZEluVGVtcGxhdGUgfHwgc3RhbmRhcmRFdmVudHM7XG4gICAgfVxuICB9XG5cbiAgdmlzaXROb2RlKG5vZGU6IHRzLk5vZGUpOiB2b2lkIHtcbiAgICB0aGlzLl9jaGVja0hhbW1lckltcG9ydHMobm9kZSk7XG4gICAgdGhpcy5fY2hlY2tGb3JSdW50aW1lSGFtbWVyVXNhZ2Uobm9kZSk7XG4gICAgdGhpcy5fY2hlY2tGb3JNYXRlcmlhbEdlc3R1cmVDb25maWcobm9kZSk7XG4gICAgdGhpcy5fY2hlY2tGb3JIYW1tZXJHZXN0dXJlQ29uZmlnVG9rZW4obm9kZSk7XG4gICAgdGhpcy5fY2hlY2tGb3JIYW1tZXJNb2R1bGVSZWZlcmVuY2Uobm9kZSk7XG4gIH1cblxuICBwb3N0QW5hbHlzaXMoKTogdm9pZCB7XG4gICAgLy8gV2FsayB0aHJvdWdoIGFsbCBoYW1tZXIgY29uZmlnIHRva2VuIHJlZmVyZW5jZXMgYW5kIGNoZWNrIGlmIHRoZXJlXG4gICAgLy8gaXMgYSBwb3RlbnRpYWwgY3VzdG9tIGdlc3R1cmUgY29uZmlnIHNldHVwLlxuICAgIGNvbnN0IGhhc0N1c3RvbUdlc3R1cmVDb25maWdTZXR1cCA9XG4gICAgICAgIHRoaXMuX2hhbW1lckNvbmZpZ1Rva2VuUmVmZXJlbmNlcy5zb21lKHIgPT4gdGhpcy5fY2hlY2tGb3JDdXN0b21HZXN0dXJlQ29uZmlnU2V0dXAocikpO1xuICAgIGNvbnN0IHVzZWRJblRlbXBsYXRlID0gdGhpcy5fc3RhbmRhcmRFdmVudHNVc2VkSW5UZW1wbGF0ZSB8fCB0aGlzLl9jdXN0b21FdmVudHNVc2VkSW5UZW1wbGF0ZTtcblxuICAgIC8qXG4gICAgICBQb3NzaWJsZSBzY2VuYXJpb3MgYW5kIGhvdyB0aGUgbWlncmF0aW9uIHNob3VsZCBjaGFuZ2UgdGhlIHByb2plY3Q6XG4gICAgICAgIDEuIFdlIGRldGVjdCB0aGF0IGEgY3VzdG9tIEhhbW1lckpTIGdlc3R1cmUgY29uZmlnIGlzIHNldCB1cDpcbiAgICAgICAgICAgIC0gUmVtb3ZlIHJlZmVyZW5jZXMgdG8gdGhlIE1hdGVyaWFsIGdlc3R1cmUgY29uZmlnIGlmIG5vIEhhbW1lckpTIGV2ZW50IGlzIHVzZWQuXG4gICAgICAgICAgICAtIFByaW50IGEgd2FybmluZyBhYm91dCBhbWJpZ3VvdXMgY29uZmlndXJhdGlvbiB0aGF0IGNhbm5vdCBiZSBoYW5kbGVkIGNvbXBsZXRlbHlcbiAgICAgICAgICAgICAgaWYgdGhlcmUgYXJlIHJlZmVyZW5jZXMgdG8gdGhlIE1hdGVyaWFsIGdlc3R1cmUgY29uZmlnLlxuICAgICAgICAyLiBXZSBkZXRlY3QgdGhhdCBIYW1tZXJKUyBpcyBvbmx5IHVzZWQgcHJvZ3JhbW1hdGljYWxseTpcbiAgICAgICAgICAgIC0gUmVtb3ZlIHJlZmVyZW5jZXMgdG8gR2VzdHVyZUNvbmZpZyBvZiBNYXRlcmlhbC5cbiAgICAgICAgICAgIC0gUmVtb3ZlIHJlZmVyZW5jZXMgdG8gdGhlIFwiSGFtbWVyTW9kdWxlXCIgaWYgcHJlc2VudC5cbiAgICAgICAgMy4gV2UgZGV0ZWN0IHRoYXQgc3RhbmRhcmQgSGFtbWVySlMgZXZlbnRzIGFyZSB1c2VkIGluIGEgdGVtcGxhdGU6XG4gICAgICAgICAgICAtIFNldCB1cCB0aGUgXCJIYW1tZXJNb2R1bGVcIiBmcm9tIHBsYXRmb3JtLWJyb3dzZXIuXG4gICAgICAgICAgICAtIFJlbW92ZSBhbGwgZ2VzdHVyZSBjb25maWcgcmVmZXJlbmNlcy5cbiAgICAgICAgNC4gV2UgZGV0ZWN0IHRoYXQgY3VzdG9tIEhhbW1lckpTIGV2ZW50cyBwcm92aWRlZCBieSB0aGUgTWF0ZXJpYWwgZ2VzdHVyZVxuICAgICAgICAgICBjb25maWcgYXJlIHVzZWQuXG4gICAgICAgICAgICAtIENvcHkgdGhlIE1hdGVyaWFsIGdlc3R1cmUgY29uZmlnIGludG8gdGhlIGFwcC5cbiAgICAgICAgICAgIC0gUmV3cml0ZSBhbGwgZ2VzdHVyZSBjb25maWcgcmVmZXJlbmNlcyB0byB0aGUgbmV3bHkgY29waWVkIG9uZS5cbiAgICAgICAgICAgIC0gU2V0IHVwIHRoZSBuZXcgZ2VzdHVyZSBjb25maWcgaW4gdGhlIHJvb3QgYXBwIG1vZHVsZS5cbiAgICAgICAgICAgIC0gU2V0IHVwIHRoZSBcIkhhbW1lck1vZHVsZVwiIGZyb20gcGxhdGZvcm0tYnJvd3Nlci5cbiAgICAgICAgNC4gV2UgZGV0ZWN0IG5vIEhhbW1lckpTIHVzYWdlIGF0IGFsbDpcbiAgICAgICAgICAgIC0gUmVtb3ZlIEhhbW1lciBpbXBvcnRzXG4gICAgICAgICAgICAtIFJlbW92ZSBNYXRlcmlhbCBnZXN0dXJlIGNvbmZpZyByZWZlcmVuY2VzXG4gICAgICAgICAgICAtIFJlbW92ZSBIYW1tZXJNb2R1bGUgc2V0dXAgaWYgcHJlc2VudC5cbiAgICAgICAgICAgIC0gUmVtb3ZlIEhhbW1lciBzY3JpcHQgaW1wb3J0cyBpbiBcImluZGV4Lmh0bWxcIiBmaWxlcy5cbiAgICAqL1xuXG4gICAgaWYgKGhhc0N1c3RvbUdlc3R1cmVDb25maWdTZXR1cCkge1xuICAgICAgLy8gSWYgYSBjdXN0b20gZ2VzdHVyZSBjb25maWcgaXMgcHJvdmlkZWQsIHdlIGFsd2F5cyBhc3N1bWUgdGhhdCBIYW1tZXJKUyBpcyB1c2VkLlxuICAgICAgSGFtbWVyR2VzdHVyZXNNaWdyYXRpb24uZ2xvYmFsVXNlc0hhbW1lciA9IHRydWU7XG4gICAgICBpZiAoIXVzZWRJblRlbXBsYXRlICYmIHRoaXMuX2dlc3R1cmVDb25maWdSZWZlcmVuY2VzLmxlbmd0aCkge1xuICAgICAgICAvLyBJZiB0aGUgQW5ndWxhciBNYXRlcmlhbCBnZXN0dXJlIGV2ZW50cyBhcmUgbm90IHVzZWQgYW5kIHdlIGZvdW5kIGEgY3VzdG9tXG4gICAgICAgIC8vIGdlc3R1cmUgY29uZmlnLCB3ZSBjYW4gc2FmZWx5IHJlbW92ZSByZWZlcmVuY2VzIHRvIHRoZSBNYXRlcmlhbCBnZXN0dXJlIGNvbmZpZ1xuICAgICAgICAvLyBzaW5jZSBldmVudHMgcHJvdmlkZWQgYnkgdGhlIE1hdGVyaWFsIGdlc3R1cmUgY29uZmlnIGFyZSBndWFyYW50ZWVkIHRvIGJlIHVudXNlZC5cbiAgICAgICAgdGhpcy5fcmVtb3ZlTWF0ZXJpYWxHZXN0dXJlQ29uZmlnU2V0dXAoKTtcbiAgICAgICAgdGhpcy5wcmludEluZm8oXG4gICAgICAgICAgICAnVGhlIEhhbW1lckpTIHY5IG1pZ3JhdGlvbiBmb3IgQW5ndWxhciBDb21wb25lbnRzIGRldGVjdGVkIHRoYXQgSGFtbWVySlMgaXMgJyArXG4gICAgICAgICAgICAnbWFudWFsbHkgc2V0IHVwIGluIGNvbWJpbmF0aW9uIHdpdGggcmVmZXJlbmNlcyB0byB0aGUgQW5ndWxhciBNYXRlcmlhbCBnZXN0dXJlICcgK1xuICAgICAgICAgICAgJ2NvbmZpZy4gVGhpcyB0YXJnZXQgY2Fubm90IGJlIG1pZ3JhdGVkIGNvbXBsZXRlbHksIGJ1dCBhbGwgcmVmZXJlbmNlcyB0byB0aGUgJyArXG4gICAgICAgICAgICAnZGVwcmVjYXRlZCBBbmd1bGFyIE1hdGVyaWFsIGdlc3R1cmUgaGF2ZSBiZWVuIHJlbW92ZWQuIFJlYWQgbW9yZSBoZXJlOiAnICtcbiAgICAgICAgICAgICdodHRwczovL2dpdC5pby9uZy1tYXRlcmlhbC12OS1oYW1tZXItYW1iaWd1b3VzLXVzYWdlJyk7XG4gICAgICB9IGVsc2UgaWYgKHVzZWRJblRlbXBsYXRlICYmIHRoaXMuX2dlc3R1cmVDb25maWdSZWZlcmVuY2VzLmxlbmd0aCkge1xuICAgICAgICAvLyBTaW5jZSB0aGVyZSBpcyBhIHJlZmVyZW5jZSB0byB0aGUgQW5ndWxhciBNYXRlcmlhbCBnZXN0dXJlIGNvbmZpZywgYW5kIHdlIGRldGVjdGVkXG4gICAgICAgIC8vIHVzYWdlIG9mIGEgZ2VzdHVyZSBldmVudCB0aGF0IGNvdWxkIGJlIHByb3ZpZGVkIGJ5IEFuZ3VsYXIgTWF0ZXJpYWwsIHdlICpjYW5ub3QqXG4gICAgICAgIC8vIGF1dG9tYXRpY2FsbHkgcmVtb3ZlIHJlZmVyZW5jZXMuIFRoaXMgaXMgYmVjYXVzZSB3ZSBkbyAqbm90KiBrbm93IHdoZXRoZXIgdGhlXG4gICAgICAgIC8vIGV2ZW50IGlzIGFjdHVhbGx5IHByb3ZpZGVkIGJ5IHRoZSBjdXN0b20gY29uZmlnIG9yIGJ5IHRoZSBNYXRlcmlhbCBjb25maWcuXG4gICAgICAgIHRoaXMucHJpbnRJbmZvKFxuICAgICAgICAgICAgJ1RoZSBIYW1tZXJKUyB2OSBtaWdyYXRpb24gZm9yIEFuZ3VsYXIgQ29tcG9uZW50cyBkZXRlY3RlZCB0aGF0IEhhbW1lckpTIGlzICcgK1xuICAgICAgICAgICAgJ21hbnVhbGx5IHNldCB1cCBpbiBjb21iaW5hdGlvbiB3aXRoIHJlZmVyZW5jZXMgdG8gdGhlIEFuZ3VsYXIgTWF0ZXJpYWwgZ2VzdHVyZSAnICtcbiAgICAgICAgICAgICdjb25maWcuIFRoaXMgdGFyZ2V0IGNhbm5vdCBiZSBtaWdyYXRlZCBjb21wbGV0ZWx5LiBQbGVhc2UgbWFudWFsbHkgcmVtb3ZlICcgK1xuICAgICAgICAgICAgJ3JlZmVyZW5jZXMgdG8gdGhlIGRlcHJlY2F0ZWQgQW5ndWxhciBNYXRlcmlhbCBnZXN0dXJlIGNvbmZpZy4gUmVhZCBtb3JlIGhlcmU6ICcgK1xuICAgICAgICAgICAgJ2h0dHBzOi8vZ2l0LmlvL25nLW1hdGVyaWFsLXY5LWhhbW1lci1hbWJpZ3VvdXMtdXNhZ2UnKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRoaXMuX3VzZWRJblJ1bnRpbWUgfHwgdXNlZEluVGVtcGxhdGUpIHtcbiAgICAgIC8vIFdlIGtlZXAgdHJhY2sgb2Ygd2hldGhlciBIYW1tZXIgaXMgdXNlZCBnbG9iYWxseS4gVGhpcyBpcyBuZWNlc3NhcnkgYmVjYXVzZSB3ZVxuICAgICAgLy8gd2FudCB0byBvbmx5IHJlbW92ZSBIYW1tZXIgZnJvbSB0aGUgXCJwYWNrYWdlLmpzb25cIiBpZiBpdCBpcyBub3QgdXNlZCBpbiBhbnkgcHJvamVjdFxuICAgICAgLy8gdGFyZ2V0LiBKdXN0IGJlY2F1c2UgaXQgaXNuJ3QgdXNlZCBpbiBvbmUgdGFyZ2V0IGRvZXNuJ3QgbWVhbiB0aGF0IHdlIGNhbiBzYWZlbHlcbiAgICAgIC8vIHJlbW92ZSB0aGUgZGVwZW5kZW5jeS5cbiAgICAgIEhhbW1lckdlc3R1cmVzTWlncmF0aW9uLmdsb2JhbFVzZXNIYW1tZXIgPSB0cnVlO1xuXG4gICAgICAvLyBJZiBoYW1tZXIgaXMgb25seSB1c2VkIGF0IHJ1bnRpbWUsIHdlIGRvbid0IG5lZWQgdGhlIGdlc3R1cmUgY29uZmlnIG9yIFwiSGFtbWVyTW9kdWxlXCJcbiAgICAgIC8vIGFuZCBjYW4gcmVtb3ZlIGl0IChhbG9uZyB3aXRoIHRoZSBoYW1tZXIgY29uZmlnIHRva2VuIGltcG9ydCBpZiBubyBsb25nZXIgbmVlZGVkKS5cbiAgICAgIGlmICghdXNlZEluVGVtcGxhdGUpIHtcbiAgICAgICAgdGhpcy5fcmVtb3ZlTWF0ZXJpYWxHZXN0dXJlQ29uZmlnU2V0dXAoKTtcbiAgICAgICAgdGhpcy5fcmVtb3ZlSGFtbWVyTW9kdWxlUmVmZXJlbmNlcygpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9zdGFuZGFyZEV2ZW50c1VzZWRJblRlbXBsYXRlICYmICF0aGlzLl9jdXN0b21FdmVudHNVc2VkSW5UZW1wbGF0ZSkge1xuICAgICAgICB0aGlzLl9zZXR1cEhhbW1lcldpdGhTdGFuZGFyZEV2ZW50cygpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fc2V0dXBIYW1tZXJXaXRoQ3VzdG9tRXZlbnRzKCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3JlbW92ZUhhbW1lclNldHVwKCk7XG4gICAgfVxuXG4gICAgLy8gUmVjb3JkIHRoZSBjaGFuZ2VzIGNvbGxlY3RlZCBpbiB0aGUgaW1wb3J0IG1hbmFnZXIuIENoYW5nZXMgbmVlZCB0byBiZSBhcHBsaWVkXG4gICAgLy8gb25jZSB0aGUgaW1wb3J0IG1hbmFnZXIgcmVnaXN0ZXJlZCBhbGwgaW1wb3J0IG1vZGlmaWNhdGlvbnMuIFRoaXMgYXZvaWRzIGNvbGxpc2lvbnMuXG4gICAgdGhpcy5faW1wb3J0TWFuYWdlci5yZWNvcmRDaGFuZ2VzKCk7XG5cbiAgICAvLyBDcmVhdGUgbWlncmF0aW9uIGZhaWx1cmVzIHRoYXQgd2lsbCBiZSBwcmludGVkIGJ5IHRoZSB1cGRhdGUtdG9vbCBvbiBtaWdyYXRpb25cbiAgICAvLyBjb21wbGV0aW9uLiBXZSBuZWVkIHNwZWNpYWwgbG9naWMgZm9yIHVwZGF0aW5nIGZhaWx1cmUgcG9zaXRpb25zIHRvIHJlZmxlY3RcbiAgICAvLyB0aGUgbmV3IHNvdXJjZSBmaWxlIGFmdGVyIG1vZGlmaWNhdGlvbnMgZnJvbSB0aGUgaW1wb3J0IG1hbmFnZXIuXG4gICAgdGhpcy5mYWlsdXJlcy5wdXNoKC4uLnRoaXMuX2NyZWF0ZU1pZ3JhdGlvbkZhaWx1cmVzKCkpO1xuXG4gICAgLy8gVGhlIHRlbXBsYXRlIGNoZWNrIGZvciBIYW1tZXJKUyBldmVudHMgaXMgbm90IGNvbXBsZXRlbHkgcmVsaWFibGUgYXMgdGhlIGV2ZW50XG4gICAgLy8gb3V0cHV0IGNvdWxkIGFsc28gYmUgZnJvbSBhIGNvbXBvbmVudCBoYXZpbmcgYW4gb3V0cHV0IG5hbWVkIHNpbWlsYXJseSB0byBhIGtub3duXG4gICAgLy8gaGFtbWVyanMgZXZlbnQgKGUuZy4gXCJAT3V0cHV0KCkgc2xpZGVcIikuIFRoZSB1c2FnZSBpcyB0aGVyZWZvcmUgc29tZXdoYXQgYW1iaWd1b3VzXG4gICAgLy8gYW5kIHdlIHdhbnQgdG8gcHJpbnQgYSBtZXNzYWdlIHRoYXQgZGV2ZWxvcGVycyBtaWdodCBiZSBhYmxlIHRvIHJlbW92ZSBIYW1tZXIgbWFudWFsbHkuXG4gICAgaWYgKCFoYXNDdXN0b21HZXN0dXJlQ29uZmlnU2V0dXAgJiYgIXRoaXMuX3VzZWRJblJ1bnRpbWUgJiYgdXNlZEluVGVtcGxhdGUpIHtcbiAgICAgIHRoaXMucHJpbnRJbmZvKFxuICAgICAgICAgICdUaGUgSGFtbWVySlMgdjkgbWlncmF0aW9uIGZvciBBbmd1bGFyIENvbXBvbmVudHMgbWlncmF0ZWQgdGhlICcgK1xuICAgICAgICAgICdwcm9qZWN0IHRvIGtlZXAgSGFtbWVySlMgaW5zdGFsbGVkLCBidXQgZGV0ZWN0ZWQgYW1iaWd1b3VzIHVzYWdlIG9mIEhhbW1lckpTLiBQbGVhc2UgJyArXG4gICAgICAgICAgJ21hbnVhbGx5IGNoZWNrIGlmIHlvdSBjYW4gcmVtb3ZlIEhhbW1lckpTIGZyb20geW91ciBhcHBsaWNhdGlvbi4gTW9yZSBkZXRhaWxzOiAnICtcbiAgICAgICAgICAnaHR0cHM6Ly9naXQuaW8vbmctbWF0ZXJpYWwtdjktaGFtbWVyLWFtYmlndW91cy11c2FnZScpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHVwIHRoZSBoYW1tZXIgZ2VzdHVyZSBjb25maWcgaW4gdGhlIGN1cnJlbnQgcHJvamVjdC4gVG8gYWNoaWV2ZSB0aGlzLCB0aGVcbiAgICogZm9sbG93aW5nIHN0ZXBzIGFyZSBwZXJmb3JtZWQ6XG4gICAqICAgMSkgQ3JlYXRlIGNvcHkgb2YgQW5ndWxhciBNYXRlcmlhbCBnZXN0dXJlIGNvbmZpZy5cbiAgICogICAyKSBSZXdyaXRlIGFsbCByZWZlcmVuY2VzIHRvIHRoZSBBbmd1bGFyIE1hdGVyaWFsIGdlc3R1cmUgY29uZmlnIHRvIHRoZVxuICAgKiAgICAgIG5ldyBnZXN0dXJlIGNvbmZpZy5cbiAgICogICAzKSBTZXR1cCB0aGUgSEFNTUVSX0dFU1RVUkVfQ09ORklHIGluIHRoZSByb290IGFwcCBtb2R1bGUgKGlmIG5vdCBkb25lIGFscmVhZHkpLlxuICAgKiAgIDQpIFNldHVwIHRoZSBcIkhhbW1lck1vZHVsZVwiIGluIHRoZSByb290IGFwcCBtb2R1bGUgKGlmIG5vdCBkb25lIGFscmVhZHkpLlxuICAgKi9cbiAgcHJpdmF0ZSBfc2V0dXBIYW1tZXJXaXRoQ3VzdG9tRXZlbnRzKCkge1xuICAgIGNvbnN0IHByb2plY3QgPSB0aGlzLmNvbnRleHQucHJvamVjdDtcbiAgICBjb25zdCBzb3VyY2VSb290ID0gdGhpcy5maWxlU3lzdGVtLnJlc29sdmUocHJvamVjdC5zb3VyY2VSb290IHx8IHByb2plY3Qucm9vdCk7XG4gICAgY29uc3QgbmV3Q29uZmlnUGF0aCA9XG4gICAgICAgIGpvaW4oc291cmNlUm9vdCwgdGhpcy5fZ2V0QXZhaWxhYmxlR2VzdHVyZUNvbmZpZ0ZpbGVOYW1lKHNvdXJjZVJvb3QpKTtcblxuICAgIC8vIENvcHkgZ2VzdHVyZSBjb25maWcgdGVtcGxhdGUgaW50byB0aGUgQ0xJIHByb2plY3QuXG4gICAgdGhpcy5maWxlU3lzdGVtLmNyZWF0ZShcbiAgICAgICAgbmV3Q29uZmlnUGF0aCwgcmVhZEZpbGVTeW5jKHJlcXVpcmUucmVzb2x2ZShHRVNUVVJFX0NPTkZJR19URU1QTEFURV9QQVRIKSwgJ3V0ZjgnKSk7XG5cbiAgICAvLyBSZXBsYWNlIGFsbCBNYXRlcmlhbCBnZXN0dXJlIGNvbmZpZyByZWZlcmVuY2VzIHRvIHJlc29sdmUgdG8gdGhlXG4gICAgLy8gbmV3bHkgY29waWVkIGdlc3R1cmUgY29uZmlnLlxuICAgIHRoaXMuX2dlc3R1cmVDb25maWdSZWZlcmVuY2VzLmZvckVhY2goaSA9PiB7XG4gICAgICBjb25zdCBmaWxlUGF0aCA9IHRoaXMuZmlsZVN5c3RlbS5yZXNvbHZlKGkubm9kZS5nZXRTb3VyY2VGaWxlKCkuZmlsZU5hbWUpO1xuICAgICAgcmV0dXJuIHRoaXMuX3JlcGxhY2VHZXN0dXJlQ29uZmlnUmVmZXJlbmNlKGksIEdFU1RVUkVfQ09ORklHX0NMQVNTX05BTUUsXG4gICAgICAgIGdldE1vZHVsZVNwZWNpZmllcihuZXdDb25maWdQYXRoLCBmaWxlUGF0aCkpO1xuICAgIH0pO1xuXG4gICAgLy8gU2V0dXAgdGhlIGdlc3R1cmUgY29uZmlnIHByb3ZpZGVyIGFuZCB0aGUgXCJIYW1tZXJNb2R1bGVcIiBpbiB0aGUgcm9vdCBtb2R1bGVcbiAgICAvLyBpZiBub3QgZG9uZSBhbHJlYWR5LiBUaGUgXCJIYW1tZXJNb2R1bGVcIiBpcyBuZWVkZWQgaW4gdjkgc2luY2UgaXQgZW5hYmxlcyB0aGVcbiAgICAvLyBIYW1tZXIgZXZlbnQgcGx1Z2luIHRoYXQgd2FzIHByZXZpb3VzbHkgZW5hYmxlZCBieSBkZWZhdWx0IGluIHY4LlxuICAgIHRoaXMuX3NldHVwTmV3R2VzdHVyZUNvbmZpZ0luUm9vdE1vZHVsZShuZXdDb25maWdQYXRoKTtcbiAgICB0aGlzLl9zZXR1cEhhbW1lck1vZHVsZUluUm9vdE1vZHVsZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdXAgdGhlIHN0YW5kYXJkIGhhbW1lciBtb2R1bGUgaW4gdGhlIHByb2plY3QgYW5kIHJlbW92ZXMgYWxsXG4gICAqIHJlZmVyZW5jZXMgdG8gdGhlIGRlcHJlY2F0ZWQgQW5ndWxhciBNYXRlcmlhbCBnZXN0dXJlIGNvbmZpZy5cbiAgICovXG4gIHByaXZhdGUgX3NldHVwSGFtbWVyV2l0aFN0YW5kYXJkRXZlbnRzKCkge1xuICAgIC8vIFNldHVwIHRoZSBIYW1tZXJNb2R1bGUuIFRoZSBIYW1tZXJNb2R1bGUgZW5hYmxlcyBzdXBwb3J0IGZvclxuICAgIC8vIHRoZSBzdGFuZGFyZCBIYW1tZXJKUyBldmVudHMuXG4gICAgdGhpcy5fc2V0dXBIYW1tZXJNb2R1bGVJblJvb3RNb2R1bGUoKTtcbiAgICB0aGlzLl9yZW1vdmVNYXRlcmlhbEdlc3R1cmVDb25maWdTZXR1cCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgSGFtbWVyIGZyb20gdGhlIGN1cnJlbnQgcHJvamVjdC4gVGhlIGZvbGxvd2luZyBzdGVwcyBhcmUgcGVyZm9ybWVkOlxuICAgKiAgIDEpIERlbGV0ZSBhbGwgVHlwZVNjcmlwdCBpbXBvcnRzIHRvIFwiaGFtbWVyanNcIi5cbiAgICogICAyKSBSZW1vdmUgcmVmZXJlbmNlcyB0byB0aGUgQW5ndWxhciBNYXRlcmlhbCBnZXN0dXJlIGNvbmZpZy5cbiAgICogICAzKSBSZW1vdmUgXCJoYW1tZXJqc1wiIGZyb20gYWxsIGluZGV4IEhUTUwgZmlsZXMgb2YgdGhlIGN1cnJlbnQgcHJvamVjdC5cbiAgICovXG4gIHByaXZhdGUgX3JlbW92ZUhhbW1lclNldHVwKCkge1xuICAgIHRoaXMuX2luc3RhbGxJbXBvcnRzLmZvckVhY2goaSA9PiB0aGlzLl9pbXBvcnRNYW5hZ2VyLmRlbGV0ZUltcG9ydEJ5RGVjbGFyYXRpb24oaSkpO1xuXG4gICAgdGhpcy5fcmVtb3ZlTWF0ZXJpYWxHZXN0dXJlQ29uZmlnU2V0dXAoKTtcbiAgICB0aGlzLl9yZW1vdmVIYW1tZXJNb2R1bGVSZWZlcmVuY2VzKCk7XG4gICAgdGhpcy5fcmVtb3ZlSGFtbWVyRnJvbUluZGV4RmlsZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgdGhlIGdlc3R1cmUgY29uZmlnIHNldHVwIGJ5IGRlbGV0aW5nIGFsbCBmb3VuZCByZWZlcmVuY2VzIHRvIHRoZSBBbmd1bGFyXG4gICAqIE1hdGVyaWFsIGdlc3R1cmUgY29uZmlnLiBBZGRpdGlvbmFsbHksIHVudXNlZCBpbXBvcnRzIHRvIHRoZSBoYW1tZXIgZ2VzdHVyZSBjb25maWdcbiAgICogdG9rZW4gZnJvbSBcIkBhbmd1bGFyL3BsYXRmb3JtLWJyb3dzZXJcIiB3aWxsIGJlIHJlbW92ZWQgYXMgd2VsbC5cbiAgICovXG4gIHByaXZhdGUgX3JlbW92ZU1hdGVyaWFsR2VzdHVyZUNvbmZpZ1NldHVwKCkge1xuICAgIHRoaXMuX2dlc3R1cmVDb25maWdSZWZlcmVuY2VzLmZvckVhY2gociA9PiB0aGlzLl9yZW1vdmVHZXN0dXJlQ29uZmlnUmVmZXJlbmNlKHIpKTtcblxuICAgIHRoaXMuX2hhbW1lckNvbmZpZ1Rva2VuUmVmZXJlbmNlcy5mb3JFYWNoKHIgPT4ge1xuICAgICAgaWYgKHIuaXNJbXBvcnQpIHtcbiAgICAgICAgdGhpcy5fcmVtb3ZlSGFtbWVyQ29uZmlnVG9rZW5JbXBvcnRJZlVudXNlZChyKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBSZW1vdmVzIGFsbCByZWZlcmVuY2VzIHRvIHRoZSBcIkhhbW1lck1vZHVsZVwiIGZyb20gXCJAYW5ndWxhci9wbGF0Zm9ybS1icm93c2VyXCIuICovXG4gIHByaXZhdGUgX3JlbW92ZUhhbW1lck1vZHVsZVJlZmVyZW5jZXMoKSB7XG4gICAgdGhpcy5faGFtbWVyTW9kdWxlUmVmZXJlbmNlcy5mb3JFYWNoKCh7bm9kZSwgaXNJbXBvcnQsIGltcG9ydERhdGF9KSA9PiB7XG4gICAgICBjb25zdCBzb3VyY2VGaWxlID0gbm9kZS5nZXRTb3VyY2VGaWxlKCk7XG4gICAgICBjb25zdCByZWNvcmRlciA9IHRoaXMuZmlsZVN5c3RlbS5lZGl0KHRoaXMuZmlsZVN5c3RlbS5yZXNvbHZlKHNvdXJjZUZpbGUuZmlsZU5hbWUpKTtcblxuICAgICAgLy8gT25seSByZW1vdmUgdGhlIGltcG9ydCBmb3IgdGhlIEhhbW1lck1vZHVsZSBpZiB0aGUgbW9kdWxlIGhhcyBiZWVuIGFjY2Vzc2VkXG4gICAgICAvLyB0aHJvdWdoIGEgbm9uLW5hbWVzcGFjZWQgaWRlbnRpZmllciBhY2Nlc3MuXG4gICAgICBpZiAoIWlzTmFtZXNwYWNlZElkZW50aWZpZXJBY2Nlc3Mobm9kZSkpIHtcbiAgICAgICAgdGhpcy5faW1wb3J0TWFuYWdlci5kZWxldGVOYW1lZEJpbmRpbmdJbXBvcnQoXG4gICAgICAgICAgICBzb3VyY2VGaWxlLCBIQU1NRVJfTU9EVUxFX05BTUUsIGltcG9ydERhdGEubW9kdWxlTmFtZSk7XG4gICAgICB9XG5cbiAgICAgIC8vIEZvciByZWZlcmVuY2VzIGZyb20gd2l0aGluIGFuIGltcG9ydCwgd2UgZG8gbm90IG5lZWQgdG8gZG8gYW55dGhpbmcgb3RoZXIgdGhhblxuICAgICAgLy8gcmVtb3ZpbmcgdGhlIGltcG9ydC4gRm9yIG90aGVyIHJlZmVyZW5jZXMsIHdlIHJlbW92ZSB0aGUgaW1wb3J0IGFuZCB0aGUgYWN0dWFsXG4gICAgICAvLyBpZGVudGlmaWVyIGluIHRoZSBtb2R1bGUgaW1wb3J0cy5cbiAgICAgIGlmIChpc0ltcG9ydCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIElmIHRoZSBcIkhhbW1lck1vZHVsZVwiIGlzIHJlZmVyZW5jZWQgd2l0aGluIGFuIGFycmF5IGxpdGVyYWwsIHdlIGNhblxuICAgICAgLy8gcmVtb3ZlIHRoZSBlbGVtZW50IGVhc2lseS4gT3RoZXJ3aXNlIGlmIGl0J3Mgb3V0c2lkZSBvZiBhbiBhcnJheSBsaXRlcmFsLFxuICAgICAgLy8gd2UgbmVlZCB0byByZXBsYWNlIHRoZSByZWZlcmVuY2Ugd2l0aCBhbiBlbXB0eSBvYmplY3QgbGl0ZXJhbCB3LyB0b2RvIHRvXG4gICAgICAvLyBub3QgYnJlYWsgdGhlIGFwcGxpY2F0aW9uLlxuICAgICAgaWYgKHRzLmlzQXJyYXlMaXRlcmFsRXhwcmVzc2lvbihub2RlLnBhcmVudCkpIHtcbiAgICAgICAgLy8gUmVtb3ZlcyB0aGUgXCJIYW1tZXJNb2R1bGVcIiBmcm9tIHRoZSBwYXJlbnQgYXJyYXkgZXhwcmVzc2lvbi4gUmVtb3Zlc1xuICAgICAgICAvLyB0aGUgdHJhaWxpbmcgY29tbWEgdG9rZW4gaWYgcHJlc2VudC5cbiAgICAgICAgcmVtb3ZlRWxlbWVudEZyb21BcnJheUV4cHJlc3Npb24obm9kZSwgcmVjb3JkZXIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVjb3JkZXIucmVtb3ZlKG5vZGUuZ2V0U3RhcnQoKSwgbm9kZS5nZXRXaWR0aCgpKTtcbiAgICAgICAgcmVjb3JkZXIuaW5zZXJ0UmlnaHQobm9kZS5nZXRTdGFydCgpLCBgLyogVE9ETzogcmVtb3ZlICovIHt9YCk7XG4gICAgICAgIHRoaXMuX25vZGVGYWlsdXJlcy5wdXNoKHtcbiAgICAgICAgICBub2RlOiBub2RlLFxuICAgICAgICAgIG1lc3NhZ2U6ICdVbmFibGUgdG8gZGVsZXRlIHJlZmVyZW5jZSB0byBcIkhhbW1lck1vZHVsZVwiLicsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGUgZ2l2ZW4gbm9kZSBpcyBhIHJlZmVyZW5jZSB0byB0aGUgaGFtbWVyIGdlc3R1cmUgY29uZmlnXG4gICAqIHRva2VuIGZyb20gcGxhdGZvcm0tYnJvd3Nlci4gSWYgc28sIGtlZXBzIHRyYWNrIG9mIHRoZSByZWZlcmVuY2UuXG4gICAqL1xuICBwcml2YXRlIF9jaGVja0ZvckhhbW1lckdlc3R1cmVDb25maWdUb2tlbihub2RlOiB0cy5Ob2RlKSB7XG4gICAgaWYgKHRzLmlzSWRlbnRpZmllcihub2RlKSkge1xuICAgICAgY29uc3QgaW1wb3J0RGF0YSA9IGdldEltcG9ydE9mSWRlbnRpZmllcihub2RlLCB0aGlzLnR5cGVDaGVja2VyKTtcbiAgICAgIGlmIChpbXBvcnREYXRhICYmIGltcG9ydERhdGEuc3ltYm9sTmFtZSA9PT0gSEFNTUVSX0NPTkZJR19UT0tFTl9OQU1FICYmXG4gICAgICAgICAgaW1wb3J0RGF0YS5tb2R1bGVOYW1lID09PSBIQU1NRVJfQ09ORklHX1RPS0VOX01PRFVMRSkge1xuICAgICAgICB0aGlzLl9oYW1tZXJDb25maWdUb2tlblJlZmVyZW5jZXMucHVzaChcbiAgICAgICAgICAgIHtub2RlLCBpbXBvcnREYXRhLCBpc0ltcG9ydDogdHMuaXNJbXBvcnRTcGVjaWZpZXIobm9kZS5wYXJlbnQpfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGUgZ2l2ZW4gbm9kZSBpcyBhIHJlZmVyZW5jZSB0byB0aGUgSGFtbWVyTW9kdWxlIGZyb21cbiAgICogXCJAYW5ndWxhci9wbGF0Zm9ybS1icm93c2VyXCIuIElmIHNvLCBrZWVwcyB0cmFjayBvZiB0aGUgcmVmZXJlbmNlLlxuICAgKi9cbiAgcHJpdmF0ZSBfY2hlY2tGb3JIYW1tZXJNb2R1bGVSZWZlcmVuY2Uobm9kZTogdHMuTm9kZSkge1xuICAgIGlmICh0cy5pc0lkZW50aWZpZXIobm9kZSkpIHtcbiAgICAgIGNvbnN0IGltcG9ydERhdGEgPSBnZXRJbXBvcnRPZklkZW50aWZpZXIobm9kZSwgdGhpcy50eXBlQ2hlY2tlcik7XG4gICAgICBpZiAoaW1wb3J0RGF0YSAmJiBpbXBvcnREYXRhLnN5bWJvbE5hbWUgPT09IEhBTU1FUl9NT0RVTEVfTkFNRSAmJlxuICAgICAgICAgIGltcG9ydERhdGEubW9kdWxlTmFtZSA9PT0gSEFNTUVSX01PRFVMRV9JTVBPUlQpIHtcbiAgICAgICAgdGhpcy5faGFtbWVyTW9kdWxlUmVmZXJlbmNlcy5wdXNoKFxuICAgICAgICAgICAge25vZGUsIGltcG9ydERhdGEsIGlzSW1wb3J0OiB0cy5pc0ltcG9ydFNwZWNpZmllcihub2RlLnBhcmVudCl9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHRoZSBnaXZlbiBub2RlIGlzIGFuIGltcG9ydCB0byB0aGUgSGFtbWVySlMgcGFja2FnZS4gSW1wb3J0cyB0b1xuICAgKiBIYW1tZXJKUyB3aGljaCBsb2FkIHNwZWNpZmljIHN5bWJvbHMgZnJvbSB0aGUgcGFja2FnZSBhcmUgY29uc2lkZXJlZCBhc1xuICAgKiBydW50aW1lIHVzYWdlIG9mIEhhbW1lci4gZS5nLiBgaW1wb3J0IHtTeW1ib2x9IGZyb20gXCJoYW1tZXJqc1wiO2AuXG4gICAqL1xuICBwcml2YXRlIF9jaGVja0hhbW1lckltcG9ydHMobm9kZTogdHMuTm9kZSkge1xuICAgIGlmICh0cy5pc0ltcG9ydERlY2xhcmF0aW9uKG5vZGUpICYmIHRzLmlzU3RyaW5nTGl0ZXJhbChub2RlLm1vZHVsZVNwZWNpZmllcikgJiZcbiAgICAgICAgbm9kZS5tb2R1bGVTcGVjaWZpZXIudGV4dCA9PT0gSEFNTUVSX01PRFVMRV9TUEVDSUZJRVIpIHtcbiAgICAgIC8vIElmIHRoZXJlIGlzIGFuIGltcG9ydCB0byBIYW1tZXJKUyB0aGF0IGltcG9ydHMgc3ltYm9scywgb3IgaXMgbmFtZXNwYWNlZFxuICAgICAgLy8gKGUuZy4gXCJpbXBvcnQge0EsIEJ9IGZyb20gLi4uXCIgb3IgXCJpbXBvcnQgKiBhcyBoYW1tZXIgZnJvbSAuLi5cIiksIHRoZW4gd2VcbiAgICAgIC8vIGFzc3VtZSB0aGF0IHNvbWUgZXhwb3J0cyBhcmUgdXNlZCBhdCBydW50aW1lLlxuICAgICAgaWYgKG5vZGUuaW1wb3J0Q2xhdXNlICYmXG4gICAgICAgICAgIShub2RlLmltcG9ydENsYXVzZS5uYW1lZEJpbmRpbmdzICYmIHRzLmlzTmFtZWRJbXBvcnRzKG5vZGUuaW1wb3J0Q2xhdXNlLm5hbWVkQmluZGluZ3MpICYmXG4gICAgICAgICAgICBub2RlLmltcG9ydENsYXVzZS5uYW1lZEJpbmRpbmdzLmVsZW1lbnRzLmxlbmd0aCA9PT0gMCkpIHtcbiAgICAgICAgdGhpcy5fdXNlZEluUnVudGltZSA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9pbnN0YWxsSW1wb3J0cy5wdXNoKG5vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgdGhlIGdpdmVuIG5vZGUgYWNjZXNzZXMgdGhlIGdsb2JhbCBcIkhhbW1lclwiIHN5bWJvbCBhdCBydW50aW1lLiBJZiBzbyxcbiAgICogdGhlIG1pZ3JhdGlvbiBydWxlIHN0YXRlIHdpbGwgYmUgdXBkYXRlZCB0byByZWZsZWN0IHRoYXQgSGFtbWVyIGlzIHVzZWQgYXQgcnVudGltZS5cbiAgICovXG4gIHByaXZhdGUgX2NoZWNrRm9yUnVudGltZUhhbW1lclVzYWdlKG5vZGU6IHRzLk5vZGUpIHtcbiAgICBpZiAodGhpcy5fdXNlZEluUnVudGltZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIERldGVjdHMgdXNhZ2VzIG9mIFwid2luZG93LkhhbW1lclwiLlxuICAgIGlmICh0cy5pc1Byb3BlcnR5QWNjZXNzRXhwcmVzc2lvbihub2RlKSAmJiBub2RlLm5hbWUudGV4dCA9PT0gJ0hhbW1lcicpIHtcbiAgICAgIGNvbnN0IG9yaWdpbkV4cHIgPSB1bndyYXBFeHByZXNzaW9uKG5vZGUuZXhwcmVzc2lvbik7XG4gICAgICBpZiAodHMuaXNJZGVudGlmaWVyKG9yaWdpbkV4cHIpICYmIG9yaWdpbkV4cHIudGV4dCA9PT0gJ3dpbmRvdycpIHtcbiAgICAgICAgdGhpcy5fdXNlZEluUnVudGltZSA9IHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gRGV0ZWN0cyB1c2FnZXMgb2YgXCJ3aW5kb3dbJ0hhbW1lciddXCIuXG4gICAgaWYgKHRzLmlzRWxlbWVudEFjY2Vzc0V4cHJlc3Npb24obm9kZSkgJiYgdHMuaXNTdHJpbmdMaXRlcmFsKG5vZGUuYXJndW1lbnRFeHByZXNzaW9uKSAmJlxuICAgICAgICBub2RlLmFyZ3VtZW50RXhwcmVzc2lvbi50ZXh0ID09PSAnSGFtbWVyJykge1xuICAgICAgY29uc3Qgb3JpZ2luRXhwciA9IHVud3JhcEV4cHJlc3Npb24obm9kZS5leHByZXNzaW9uKTtcbiAgICAgIGlmICh0cy5pc0lkZW50aWZpZXIob3JpZ2luRXhwcikgJiYgb3JpZ2luRXhwci50ZXh0ID09PSAnd2luZG93Jykge1xuICAgICAgICB0aGlzLl91c2VkSW5SdW50aW1lID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGVzIHVzYWdlcyBvZiBwbGFpbiBpZGVudGlmaWVyIHdpdGggdGhlIG5hbWUgXCJIYW1tZXJcIi4gVGhlc2UgdXNhZ2VcbiAgICAvLyBhcmUgdmFsaWQgaWYgdGhleSByZXNvbHZlIHRvIFwiQHR5cGVzL2hhbW1lcmpzXCIuIGUuZy4gXCJuZXcgSGFtbWVyKG15RWxlbWVudClcIi5cbiAgICBpZiAodHMuaXNJZGVudGlmaWVyKG5vZGUpICYmIG5vZGUudGV4dCA9PT0gJ0hhbW1lcicgJiZcbiAgICAgICAgIXRzLmlzUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uKG5vZGUucGFyZW50KSAmJiAhdHMuaXNFbGVtZW50QWNjZXNzRXhwcmVzc2lvbihub2RlLnBhcmVudCkpIHtcbiAgICAgIGNvbnN0IHN5bWJvbCA9IHRoaXMuX2dldERlY2xhcmF0aW9uU3ltYm9sT2ZOb2RlKG5vZGUpO1xuICAgICAgaWYgKHN5bWJvbCAmJiBzeW1ib2wudmFsdWVEZWNsYXJhdGlvbiAmJlxuICAgICAgICAgIHN5bWJvbC52YWx1ZURlY2xhcmF0aW9uLmdldFNvdXJjZUZpbGUoKS5maWxlTmFtZS5pbmNsdWRlcygnQHR5cGVzL2hhbW1lcmpzJykpIHtcbiAgICAgICAgdGhpcy5fdXNlZEluUnVudGltZSA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGUgZ2l2ZW4gbm9kZSByZWZlcmVuY2VzIHRoZSBnZXN0dXJlIGNvbmZpZyBmcm9tIEFuZ3VsYXIgTWF0ZXJpYWwuXG4gICAqIElmIHNvLCB3ZSBrZWVwIHRyYWNrIG9mIHRoZSBmb3VuZCBzeW1ib2wgcmVmZXJlbmNlLlxuICAgKi9cbiAgcHJpdmF0ZSBfY2hlY2tGb3JNYXRlcmlhbEdlc3R1cmVDb25maWcobm9kZTogdHMuTm9kZSkge1xuICAgIGlmICh0cy5pc0lkZW50aWZpZXIobm9kZSkpIHtcbiAgICAgIGNvbnN0IGltcG9ydERhdGEgPSBnZXRJbXBvcnRPZklkZW50aWZpZXIobm9kZSwgdGhpcy50eXBlQ2hlY2tlcik7XG4gICAgICBpZiAoaW1wb3J0RGF0YSAmJiBpbXBvcnREYXRhLnN5bWJvbE5hbWUgPT09IEdFU1RVUkVfQ09ORklHX0NMQVNTX05BTUUgJiZcbiAgICAgICAgICBpbXBvcnREYXRhLm1vZHVsZU5hbWUuc3RhcnRzV2l0aCgnQGFuZ3VsYXIvbWF0ZXJpYWwvJykpIHtcbiAgICAgICAgdGhpcy5fZ2VzdHVyZUNvbmZpZ1JlZmVyZW5jZXMucHVzaChcbiAgICAgICAgICAgIHtub2RlLCBpbXBvcnREYXRhLCBpc0ltcG9ydDogdHMuaXNJbXBvcnRTcGVjaWZpZXIobm9kZS5wYXJlbnQpfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGUgZ2l2ZW4gSGFtbWVyIGdlc3R1cmUgY29uZmlnIHRva2VuIHJlZmVyZW5jZSBpcyBwYXJ0IG9mIGFuXG4gICAqIEFuZ3VsYXIgcHJvdmlkZXIgZGVmaW5pdGlvbiB0aGF0IHNldHMgdXAgYSBjdXN0b20gZ2VzdHVyZSBjb25maWcuXG4gICAqL1xuICBwcml2YXRlIF9jaGVja0ZvckN1c3RvbUdlc3R1cmVDb25maWdTZXR1cCh0b2tlblJlZjogSWRlbnRpZmllclJlZmVyZW5jZSk6IGJvb2xlYW4ge1xuICAgIC8vIFdhbGsgdXAgdGhlIHRyZWUgdG8gbG9vayBmb3IgYSBwYXJlbnQgcHJvcGVydHkgYXNzaWdubWVudCBvZiB0aGVcbiAgICAvLyByZWZlcmVuY2UgdG8gdGhlIGhhbW1lciBnZXN0dXJlIGNvbmZpZyB0b2tlbi5cbiAgICBsZXQgcHJvcGVydHlBc3NpZ25tZW50OiB0cy5Ob2RlID0gdG9rZW5SZWYubm9kZTtcbiAgICB3aGlsZSAocHJvcGVydHlBc3NpZ25tZW50ICYmICF0cy5pc1Byb3BlcnR5QXNzaWdubWVudChwcm9wZXJ0eUFzc2lnbm1lbnQpKSB7XG4gICAgICBwcm9wZXJ0eUFzc2lnbm1lbnQgPSBwcm9wZXJ0eUFzc2lnbm1lbnQucGFyZW50O1xuICAgIH1cblxuICAgIGlmICghcHJvcGVydHlBc3NpZ25tZW50IHx8ICF0cy5pc1Byb3BlcnR5QXNzaWdubWVudChwcm9wZXJ0eUFzc2lnbm1lbnQpIHx8XG4gICAgICAgIGdldFByb3BlcnR5TmFtZVRleHQocHJvcGVydHlBc3NpZ25tZW50Lm5hbWUpICE9PSAncHJvdmlkZScpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBvYmplY3RMaXRlcmFsRXhwciA9IHByb3BlcnR5QXNzaWdubWVudC5wYXJlbnQ7XG4gICAgY29uc3QgbWF0Y2hpbmdJZGVudGlmaWVycyA9IGZpbmRNYXRjaGluZ0NoaWxkTm9kZXMob2JqZWN0TGl0ZXJhbEV4cHIsIHRzLmlzSWRlbnRpZmllcik7XG5cbiAgICAvLyBXZSBuYWl2ZWx5IGFzc3VtZSB0aGF0IGlmIHRoZXJlIGlzIGEgcmVmZXJlbmNlIHRvIHRoZSBcIkdlc3R1cmVDb25maWdcIiBleHBvcnRcbiAgICAvLyBmcm9tIEFuZ3VsYXIgTWF0ZXJpYWwgaW4gdGhlIHByb3ZpZGVyIGxpdGVyYWwsIHRoYXQgdGhlIHByb3ZpZGVyIHNldHMgdXAgdGhlXG4gICAgLy8gQW5ndWxhciBNYXRlcmlhbCBnZXN0dXJlIGNvbmZpZy5cbiAgICByZXR1cm4gIXRoaXMuX2dlc3R1cmVDb25maWdSZWZlcmVuY2VzLnNvbWUociA9PiBtYXRjaGluZ0lkZW50aWZpZXJzLmluY2x1ZGVzKHIubm9kZSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgYW4gYXZhaWxhYmxlIGZpbGUgbmFtZSBmb3IgdGhlIGdlc3R1cmUgY29uZmlnIHdoaWNoIHNob3VsZFxuICAgKiBiZSBzdG9yZWQgaW4gdGhlIHNwZWNpZmllZCBmaWxlIHBhdGguXG4gICAqL1xuICBwcml2YXRlIF9nZXRBdmFpbGFibGVHZXN0dXJlQ29uZmlnRmlsZU5hbWUoc291cmNlUm9vdDogUGF0aCkge1xuICAgIGlmICghdGhpcy5maWxlU3lzdGVtLmV4aXN0cyhqb2luKHNvdXJjZVJvb3QsIGAke0dFU1RVUkVfQ09ORklHX0ZJTEVfTkFNRX0udHNgKSkpIHtcbiAgICAgIHJldHVybiBgJHtHRVNUVVJFX0NPTkZJR19GSUxFX05BTUV9LnRzYDtcbiAgICB9XG5cbiAgICBsZXQgcG9zc2libGVOYW1lID0gYCR7R0VTVFVSRV9DT05GSUdfRklMRV9OQU1FfS1gO1xuICAgIGxldCBpbmRleCA9IDE7XG4gICAgd2hpbGUgKHRoaXMuZmlsZVN5c3RlbS5leGlzdHMoam9pbihzb3VyY2VSb290LCBgJHtwb3NzaWJsZU5hbWV9LSR7aW5kZXh9LnRzYCkpKSB7XG4gICAgICBpbmRleCsrO1xuICAgIH1cbiAgICByZXR1cm4gYCR7cG9zc2libGVOYW1lICsgaW5kZXh9LnRzYDtcbiAgfVxuXG4gIC8qKiBSZXBsYWNlcyBhIGdpdmVuIGdlc3R1cmUgY29uZmlnIHJlZmVyZW5jZSB3aXRoIGEgbmV3IGltcG9ydC4gKi9cbiAgcHJpdmF0ZSBfcmVwbGFjZUdlc3R1cmVDb25maWdSZWZlcmVuY2UoXG4gICAgICB7bm9kZSwgaW1wb3J0RGF0YSwgaXNJbXBvcnR9OiBJZGVudGlmaWVyUmVmZXJlbmNlLCBzeW1ib2xOYW1lOiBzdHJpbmcsXG4gICAgICBtb2R1bGVTcGVjaWZpZXI6IHN0cmluZykge1xuICAgIGNvbnN0IHNvdXJjZUZpbGUgPSBub2RlLmdldFNvdXJjZUZpbGUoKTtcbiAgICBjb25zdCByZWNvcmRlciA9IHRoaXMuZmlsZVN5c3RlbS5lZGl0KHRoaXMuZmlsZVN5c3RlbS5yZXNvbHZlKHNvdXJjZUZpbGUuZmlsZU5hbWUpKTtcblxuICAgIC8vIExpc3Qgb2YgYWxsIGlkZW50aWZpZXJzIHJlZmVycmluZyB0byB0aGUgZ2VzdHVyZSBjb25maWcgaW4gdGhlIGN1cnJlbnQgZmlsZS4gVGhpc1xuICAgIC8vIGFsbG93cyB1cyB0byBhZGQgYW4gaW1wb3J0IGZvciB0aGUgY29waWVkIGdlc3R1cmUgY29uZmlndXJhdGlvbiB3aXRob3V0IGdlbmVyYXRpbmcgYVxuICAgIC8vIG5ldyBpZGVudGlmaWVyIGZvciB0aGUgaW1wb3J0IHRvIGF2b2lkIGNvbGxpc2lvbnMuIGkuZS4gXCJHZXN0dXJlQ29uZmlnXzFcIi4gVGhlIGltcG9ydFxuICAgIC8vIG1hbmFnZXIgY2hlY2tzIGZvciBwb3NzaWJsZSBuYW1lIGNvbGxpc2lvbnMsIGJ1dCBpcyBhYmxlIHRvIGlnbm9yZSBzcGVjaWZpYyBpZGVudGlmaWVycy5cbiAgICAvLyBXZSB1c2UgdGhpcyB0byBpZ25vcmUgYWxsIHJlZmVyZW5jZXMgdG8gdGhlIG9yaWdpbmFsIEFuZ3VsYXIgTWF0ZXJpYWwgZ2VzdHVyZSBjb25maWcsXG4gICAgLy8gYmVjYXVzZSB0aGVzZSB3aWxsIGJlIHJlcGxhY2VkIGFuZCB0aGVyZWZvcmUgd2lsbCBub3QgaW50ZXJmZXJlLlxuICAgIGNvbnN0IGdlc3R1cmVJZGVudGlmaWVyc0luRmlsZSA9IHRoaXMuX2dldEdlc3R1cmVDb25maWdJZGVudGlmaWVyc09mRmlsZShzb3VyY2VGaWxlKTtcblxuICAgIC8vIElmIHRoZSBwYXJlbnQgb2YgdGhlIGlkZW50aWZpZXIgaXMgYWNjZXNzZWQgdGhyb3VnaCBhIG5hbWVzcGFjZSwgd2UgY2FuIGp1c3RcbiAgICAvLyBpbXBvcnQgdGhlIG5ldyBnZXN0dXJlIGNvbmZpZyB3aXRob3V0IHJld3JpdGluZyB0aGUgaW1wb3J0IGRlY2xhcmF0aW9uIGJlY2F1c2VcbiAgICAvLyB0aGUgY29uZmlnIGhhcyBiZWVuIGltcG9ydGVkIHRocm91Z2ggYSBuYW1lc3BhY2VkIGltcG9ydC5cbiAgICBpZiAoaXNOYW1lc3BhY2VkSWRlbnRpZmllckFjY2Vzcyhub2RlKSkge1xuICAgICAgY29uc3QgbmV3RXhwcmVzc2lvbiA9IHRoaXMuX2ltcG9ydE1hbmFnZXIuYWRkSW1wb3J0VG9Tb3VyY2VGaWxlKFxuICAgICAgICAgIHNvdXJjZUZpbGUsIHN5bWJvbE5hbWUsIG1vZHVsZVNwZWNpZmllciwgZmFsc2UsIGdlc3R1cmVJZGVudGlmaWVyc0luRmlsZSk7XG5cbiAgICAgIHJlY29yZGVyLnJlbW92ZShub2RlLnBhcmVudC5nZXRTdGFydCgpLCBub2RlLnBhcmVudC5nZXRXaWR0aCgpKTtcbiAgICAgIHJlY29yZGVyLmluc2VydFJpZ2h0KG5vZGUucGFyZW50LmdldFN0YXJ0KCksIHRoaXMuX3ByaW50Tm9kZShuZXdFeHByZXNzaW9uLCBzb3VyY2VGaWxlKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gRGVsZXRlIHRoZSBvbGQgaW1wb3J0IHRvIHRoZSBcIkdlc3R1cmVDb25maWdcIi5cbiAgICB0aGlzLl9pbXBvcnRNYW5hZ2VyLmRlbGV0ZU5hbWVkQmluZGluZ0ltcG9ydChcbiAgICAgICAgc291cmNlRmlsZSwgR0VTVFVSRV9DT05GSUdfQ0xBU1NfTkFNRSwgaW1wb3J0RGF0YS5tb2R1bGVOYW1lKTtcblxuICAgIC8vIElmIHRoZSBjdXJyZW50IHJlZmVyZW5jZSBpcyBub3QgZnJvbSBpbnNpZGUgb2YgYSBpbXBvcnQsIHdlIG5lZWQgdG8gYWRkIGEgbmV3XG4gICAgLy8gaW1wb3J0IHRvIHRoZSBjb3BpZWQgZ2VzdHVyZSBjb25maWcgYW5kIHJlcGxhY2UgdGhlIGlkZW50aWZpZXIuIEZvciByZWZlcmVuY2VzXG4gICAgLy8gd2l0aGluIGFuIGltcG9ydCwgd2UgZG8gbm90aGluZyBidXQgcmVtb3ZpbmcgdGhlIGFjdHVhbCBpbXBvcnQuIFRoaXMgYWxsb3dzIHVzXG4gICAgLy8gdG8gcmVtb3ZlIHVudXNlZCBpbXBvcnRzIHRvIHRoZSBNYXRlcmlhbCBnZXN0dXJlIGNvbmZpZy5cbiAgICBpZiAoIWlzSW1wb3J0KSB7XG4gICAgICBjb25zdCBuZXdFeHByZXNzaW9uID0gdGhpcy5faW1wb3J0TWFuYWdlci5hZGRJbXBvcnRUb1NvdXJjZUZpbGUoXG4gICAgICAgICAgc291cmNlRmlsZSwgc3ltYm9sTmFtZSwgbW9kdWxlU3BlY2lmaWVyLCBmYWxzZSwgZ2VzdHVyZUlkZW50aWZpZXJzSW5GaWxlKTtcblxuICAgICAgcmVjb3JkZXIucmVtb3ZlKG5vZGUuZ2V0U3RhcnQoKSwgbm9kZS5nZXRXaWR0aCgpKTtcbiAgICAgIHJlY29yZGVyLmluc2VydFJpZ2h0KG5vZGUuZ2V0U3RhcnQoKSwgdGhpcy5fcHJpbnROb2RlKG5ld0V4cHJlc3Npb24sIHNvdXJjZUZpbGUpKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBhIGdpdmVuIGdlc3R1cmUgY29uZmlnIHJlZmVyZW5jZSBhbmQgaXRzIGNvcnJlc3BvbmRpbmcgaW1wb3J0IGZyb21cbiAgICogaXRzIGNvbnRhaW5pbmcgc291cmNlIGZpbGUuIEltcG9ydHMgd2lsbCBiZSBhbHdheXMgcmVtb3ZlZCwgYnV0IGluIHNvbWUgY2FzZXMsXG4gICAqIHdoZXJlIGl0J3Mgbm90IGd1YXJhbnRlZWQgdGhhdCBhIHJlbW92YWwgY2FuIGJlIHBlcmZvcm1lZCBzYWZlbHksIHdlIGp1c3RcbiAgICogY3JlYXRlIGEgbWlncmF0aW9uIGZhaWx1cmUgKGFuZCBhZGQgYSBUT0RPIGlmIHBvc3NpYmxlKS5cbiAgICovXG4gIHByaXZhdGUgX3JlbW92ZUdlc3R1cmVDb25maWdSZWZlcmVuY2Uoe25vZGUsIGltcG9ydERhdGEsIGlzSW1wb3J0fTogSWRlbnRpZmllclJlZmVyZW5jZSkge1xuICAgIGNvbnN0IHNvdXJjZUZpbGUgPSBub2RlLmdldFNvdXJjZUZpbGUoKTtcbiAgICBjb25zdCByZWNvcmRlciA9IHRoaXMuZmlsZVN5c3RlbS5lZGl0KHRoaXMuZmlsZVN5c3RlbS5yZXNvbHZlKHNvdXJjZUZpbGUuZmlsZU5hbWUpKTtcbiAgICAvLyBPbmx5IHJlbW92ZSB0aGUgaW1wb3J0IGZvciB0aGUgZ2VzdHVyZSBjb25maWcgaWYgdGhlIGdlc3R1cmUgY29uZmlnIGhhc1xuICAgIC8vIGJlZW4gYWNjZXNzZWQgdGhyb3VnaCBhIG5vbi1uYW1lc3BhY2VkIGlkZW50aWZpZXIgYWNjZXNzLlxuICAgIGlmICghaXNOYW1lc3BhY2VkSWRlbnRpZmllckFjY2Vzcyhub2RlKSkge1xuICAgICAgdGhpcy5faW1wb3J0TWFuYWdlci5kZWxldGVOYW1lZEJpbmRpbmdJbXBvcnQoXG4gICAgICAgICAgc291cmNlRmlsZSwgR0VTVFVSRV9DT05GSUdfQ0xBU1NfTkFNRSwgaW1wb3J0RGF0YS5tb2R1bGVOYW1lKTtcbiAgICB9XG5cbiAgICAvLyBGb3IgcmVmZXJlbmNlcyBmcm9tIHdpdGhpbiBhbiBpbXBvcnQsIHdlIGRvIG5vdCBuZWVkIHRvIGRvIGFueXRoaW5nIG90aGVyIHRoYW5cbiAgICAvLyByZW1vdmluZyB0aGUgaW1wb3J0LiBGb3Igb3RoZXIgcmVmZXJlbmNlcywgd2UgcmVtb3ZlIHRoZSBpbXBvcnQgYW5kIHRoZSByZWZlcmVuY2VcbiAgICAvLyBpZGVudGlmaWVyIGlmIHVzZWQgaW5zaWRlIG9mIGEgcHJvdmlkZXIgZGVmaW5pdGlvbi5cbiAgICBpZiAoaXNJbXBvcnQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwcm92aWRlckFzc2lnbm1lbnQgPSBub2RlLnBhcmVudDtcblxuICAgIC8vIE9ubHkgcmVtb3ZlIHJlZmVyZW5jZXMgdG8gdGhlIGdlc3R1cmUgY29uZmlnIHdoaWNoIGFyZSBwYXJ0IG9mIGEgc3RhdGljYWxseVxuICAgIC8vIGFuYWx5emFibGUgcHJvdmlkZXIgZGVmaW5pdGlvbi4gV2Ugb25seSBzdXBwb3J0IHRoZSBjb21tb24gY2FzZSBvZiBhIGdlc3R1cmVcbiAgICAvLyBjb25maWcgcHJvdmlkZXIgZGVmaW5pdGlvbiB3aGVyZSB0aGUgY29uZmlnIGlzIHNldCB1cCB0aHJvdWdoIFwidXNlQ2xhc3NcIi5cbiAgICAvLyBPdGhlcndpc2UsIGl0J3Mgbm90IGd1YXJhbnRlZWQgdGhhdCB3ZSBjYW4gc2FmZWx5IHJlbW92ZSB0aGUgcHJvdmlkZXIgZGVmaW5pdGlvbi5cbiAgICBpZiAoIXRzLmlzUHJvcGVydHlBc3NpZ25tZW50KHByb3ZpZGVyQXNzaWdubWVudCkgfHxcbiAgICAgICAgZ2V0UHJvcGVydHlOYW1lVGV4dChwcm92aWRlckFzc2lnbm1lbnQubmFtZSkgIT09ICd1c2VDbGFzcycpIHtcbiAgICAgIHRoaXMuX25vZGVGYWlsdXJlcy5wdXNoKHtub2RlLCBtZXNzYWdlOiBDQU5OT1RfUkVNT1ZFX1JFRkVSRU5DRV9FUlJPUn0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IG9iamVjdExpdGVyYWxFeHByID0gcHJvdmlkZXJBc3NpZ25tZW50LnBhcmVudDtcbiAgICBjb25zdCBwcm92aWRlVG9rZW4gPSBvYmplY3RMaXRlcmFsRXhwci5wcm9wZXJ0aWVzLmZpbmQoXG4gICAgICAgIChwKTogcCBpcyB0cy5Qcm9wZXJ0eUFzc2lnbm1lbnQgPT5cbiAgICAgICAgICAgIHRzLmlzUHJvcGVydHlBc3NpZ25tZW50KHApICYmIGdldFByb3BlcnR5TmFtZVRleHQocC5uYW1lKSA9PT0gJ3Byb3ZpZGUnKTtcblxuICAgIC8vIERvIG5vdCByZW1vdmUgdGhlIHJlZmVyZW5jZSBpZiB0aGUgZ2VzdHVyZSBjb25maWcgaXMgbm90IHBhcnQgb2YgYSBwcm92aWRlciBkZWZpbml0aW9uLFxuICAgIC8vIG9yIGlmIHRoZSBwcm92aWRlZCB0b2tlIGlzIG5vdCByZWZlcnJpbmcgdG8gdGhlIGtub3duIEhBTU1FUl9HRVNUVVJFX0NPTkZJRyB0b2tlblxuICAgIC8vIGZyb20gcGxhdGZvcm0tYnJvd3Nlci5cbiAgICBpZiAoIXByb3ZpZGVUb2tlbiB8fCAhdGhpcy5faXNSZWZlcmVuY2VUb0hhbW1lckNvbmZpZ1Rva2VuKHByb3ZpZGVUb2tlbi5pbml0aWFsaXplcikpIHtcbiAgICAgIHRoaXMuX25vZGVGYWlsdXJlcy5wdXNoKHtub2RlLCBtZXNzYWdlOiBDQU5OT1RfUkVNT1ZFX1JFRkVSRU5DRV9FUlJPUn0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIENvbGxlY3QgYWxsIG5lc3RlZCBpZGVudGlmaWVycyB3aGljaCB3aWxsIGJlIGRlbGV0ZWQuIFRoaXMgaGVscHMgdXNcbiAgICAvLyBkZXRlcm1pbmluZyBpZiB3ZSBjYW4gcmVtb3ZlIGltcG9ydHMgZm9yIHRoZSBcIkhBTU1FUl9HRVNUVVJFX0NPTkZJR1wiIHRva2VuLlxuICAgIHRoaXMuX2RlbGV0ZWRJZGVudGlmaWVycy5wdXNoKC4uLmZpbmRNYXRjaGluZ0NoaWxkTm9kZXMob2JqZWN0TGl0ZXJhbEV4cHIsIHRzLmlzSWRlbnRpZmllcikpO1xuXG4gICAgLy8gSW4gY2FzZSB0aGUgZm91bmQgcHJvdmlkZXIgZGVmaW5pdGlvbiBpcyBub3QgcGFydCBvZiBhbiBhcnJheSBsaXRlcmFsLFxuICAgIC8vIHdlIGNhbm5vdCBzYWZlbHkgcmVtb3ZlIHRoZSBwcm92aWRlci4gVGhpcyBpcyBiZWNhdXNlIGl0IGNvdWxkIGJlIGRlY2xhcmVkXG4gICAgLy8gYXMgYSB2YXJpYWJsZS4gZS5nLiBcImNvbnN0IGdlc3R1cmVQcm92aWRlciA9IHtwcm92aWRlOiAuLiwgdXNlQ2xhc3M6IEdlc3R1cmVDb25maWd9XCIuXG4gICAgLy8gSW4gdGhhdCBjYXNlLCB3ZSBqdXN0IGFkZCBhbiBlbXB0eSBvYmplY3QgbGl0ZXJhbCB3aXRoIFRPRE8gYW5kIHByaW50IGEgZmFpbHVyZS5cbiAgICBpZiAoIXRzLmlzQXJyYXlMaXRlcmFsRXhwcmVzc2lvbihvYmplY3RMaXRlcmFsRXhwci5wYXJlbnQpKSB7XG4gICAgICByZWNvcmRlci5yZW1vdmUob2JqZWN0TGl0ZXJhbEV4cHIuZ2V0U3RhcnQoKSwgb2JqZWN0TGl0ZXJhbEV4cHIuZ2V0V2lkdGgoKSk7XG4gICAgICByZWNvcmRlci5pbnNlcnRSaWdodChvYmplY3RMaXRlcmFsRXhwci5nZXRTdGFydCgpLCBgLyogVE9ETzogcmVtb3ZlICovIHt9YCk7XG4gICAgICB0aGlzLl9ub2RlRmFpbHVyZXMucHVzaCh7XG4gICAgICAgIG5vZGU6IG9iamVjdExpdGVyYWxFeHByLFxuICAgICAgICBtZXNzYWdlOiBgVW5hYmxlIHRvIGRlbGV0ZSBwcm92aWRlciBkZWZpbml0aW9uIGZvciBcIkdlc3R1cmVDb25maWdcIiBjb21wbGV0ZWx5LiBgICtcbiAgICAgICAgICAgIGBQbGVhc2UgY2xlYW4gdXAgdGhlIHByb3ZpZGVyLmBcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFJlbW92ZXMgdGhlIG9iamVjdCBsaXRlcmFsIGZyb20gdGhlIHBhcmVudCBhcnJheSBleHByZXNzaW9uLiBSZW1vdmVzXG4gICAgLy8gdGhlIHRyYWlsaW5nIGNvbW1hIHRva2VuIGlmIHByZXNlbnQuXG4gICAgcmVtb3ZlRWxlbWVudEZyb21BcnJheUV4cHJlc3Npb24ob2JqZWN0TGl0ZXJhbEV4cHIsIHJlY29yZGVyKTtcbiAgfVxuXG4gIC8qKiBSZW1vdmVzIHRoZSBnaXZlbiBoYW1tZXIgY29uZmlnIHRva2VuIGltcG9ydCBpZiBpdCBpcyBub3QgdXNlZC4gKi9cbiAgcHJpdmF0ZSBfcmVtb3ZlSGFtbWVyQ29uZmlnVG9rZW5JbXBvcnRJZlVudXNlZCh7bm9kZSwgaW1wb3J0RGF0YX06IElkZW50aWZpZXJSZWZlcmVuY2UpIHtcbiAgICBjb25zdCBzb3VyY2VGaWxlID0gbm9kZS5nZXRTb3VyY2VGaWxlKCk7XG4gICAgY29uc3QgaXNUb2tlblVzZWQgPSB0aGlzLl9oYW1tZXJDb25maWdUb2tlblJlZmVyZW5jZXMuc29tZShcbiAgICAgICAgciA9PiAhci5pc0ltcG9ydCAmJiAhaXNOYW1lc3BhY2VkSWRlbnRpZmllckFjY2VzcyhyLm5vZGUpICYmXG4gICAgICAgICAgICByLm5vZGUuZ2V0U291cmNlRmlsZSgpID09PSBzb3VyY2VGaWxlICYmICF0aGlzLl9kZWxldGVkSWRlbnRpZmllcnMuaW5jbHVkZXMoci5ub2RlKSk7XG5cbiAgICAvLyBXZSBkb24ndCB3YW50IHRvIHJlbW92ZSB0aGUgaW1wb3J0IGZvciB0aGUgdG9rZW4gaWYgdGhlIHRva2VuIGlzXG4gICAgLy8gc3RpbGwgdXNlZCBzb21ld2hlcmUuXG4gICAgaWYgKCFpc1Rva2VuVXNlZCkge1xuICAgICAgdGhpcy5faW1wb3J0TWFuYWdlci5kZWxldGVOYW1lZEJpbmRpbmdJbXBvcnQoXG4gICAgICAgICAgc291cmNlRmlsZSwgSEFNTUVSX0NPTkZJR19UT0tFTl9OQU1FLCBpbXBvcnREYXRhLm1vZHVsZU5hbWUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBSZW1vdmVzIEhhbW1lciBmcm9tIGFsbCBpbmRleCBIVE1MIGZpbGVzIG9mIHRoZSBjdXJyZW50IHByb2plY3QuICovXG4gIHByaXZhdGUgX3JlbW92ZUhhbW1lckZyb21JbmRleEZpbGUoKSB7XG4gICAgY29uc3QgaW5kZXhGaWxlUGF0aHMgPSBnZXRQcm9qZWN0SW5kZXhGaWxlcyh0aGlzLmNvbnRleHQucHJvamVjdCk7XG4gICAgaW5kZXhGaWxlUGF0aHMuZm9yRWFjaChmaWxlUGF0aCA9PiB7XG4gICAgICBpZiAoIXRoaXMuZmlsZVN5c3RlbS5leGlzdHMoZmlsZVBhdGgpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgaHRtbENvbnRlbnQgPSB0aGlzLmZpbGVTeXN0ZW0ucmVhZChmaWxlUGF0aCkhO1xuICAgICAgY29uc3QgcmVjb3JkZXIgPSB0aGlzLmZpbGVTeXN0ZW0uZWRpdChmaWxlUGF0aCk7XG5cbiAgICAgIGZpbmRIYW1tZXJTY3JpcHRJbXBvcnRFbGVtZW50cyhodG1sQ29udGVudClcbiAgICAgICAgICAuZm9yRWFjaChlbCA9PiByZW1vdmVFbGVtZW50RnJvbUh0bWwoZWwsIHJlY29yZGVyKSk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogU2V0cyB1cCB0aGUgSGFtbWVyIGdlc3R1cmUgY29uZmlnIGluIHRoZSByb290IG1vZHVsZSBpZiBuZWVkZWQuICovXG4gIHByaXZhdGUgX3NldHVwTmV3R2VzdHVyZUNvbmZpZ0luUm9vdE1vZHVsZShnZXN0dXJlQ29uZmlnUGF0aDogUGF0aCkge1xuICAgIGNvbnN0IHtwcm9qZWN0fSA9IHRoaXMuY29udGV4dDtcbiAgICBjb25zdCBtYWluRmlsZVBhdGggPSBnZXRQcm9qZWN0TWFpbkZpbGUocHJvamVjdCk7XG4gICAgY29uc3Qgcm9vdE1vZHVsZVN5bWJvbCA9IHRoaXMuX2dldFJvb3RNb2R1bGVTeW1ib2wobWFpbkZpbGVQYXRoKTtcblxuICAgIGlmIChyb290TW9kdWxlU3ltYm9sID09PSBudWxsKSB7XG4gICAgICB0aGlzLmZhaWx1cmVzLnB1c2goe1xuICAgICAgICBmaWxlUGF0aDogbWFpbkZpbGVQYXRoLFxuICAgICAgICBtZXNzYWdlOiBgQ291bGQgbm90IHNldHVwIEhhbW1lciBnZXN0dXJlcyBpbiBtb2R1bGUuIFBsZWFzZSBgICtcbiAgICAgICAgICAgIGBtYW51YWxseSBlbnN1cmUgdGhhdCB0aGUgSGFtbWVyIGdlc3R1cmUgY29uZmlnIGlzIHNldCB1cC5gLFxuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgc291cmNlRmlsZSA9IHJvb3RNb2R1bGVTeW1ib2wudmFsdWVEZWNsYXJhdGlvbi5nZXRTb3VyY2VGaWxlKCk7XG4gICAgY29uc3QgbWV0YWRhdGEgPSBnZXREZWNvcmF0b3JNZXRhZGF0YShzb3VyY2VGaWxlLCAnTmdNb2R1bGUnLCAnQGFuZ3VsYXIvY29yZScpIGFzXG4gICAgICAgIHRzLk9iamVjdExpdGVyYWxFeHByZXNzaW9uW107XG5cbiAgICAvLyBJZiBubyBcIk5nTW9kdWxlXCIgZGVmaW5pdGlvbiBpcyBmb3VuZCBpbnNpZGUgdGhlIHNvdXJjZSBmaWxlLCB3ZSBqdXN0IGRvIG5vdGhpbmcuXG4gICAgaWYgKCFtZXRhZGF0YS5sZW5ndGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBmaWxlUGF0aCA9IHRoaXMuZmlsZVN5c3RlbS5yZXNvbHZlKHNvdXJjZUZpbGUuZmlsZU5hbWUpO1xuICAgIGNvbnN0IHJlY29yZGVyID0gdGhpcy5maWxlU3lzdGVtLmVkaXQoZmlsZVBhdGgpO1xuICAgIGNvbnN0IHByb3ZpZGVyc0ZpZWxkID0gZ2V0TWV0YWRhdGFGaWVsZChtZXRhZGF0YVswXSwgJ3Byb3ZpZGVycycpWzBdO1xuICAgIGNvbnN0IHByb3ZpZGVySWRlbnRpZmllcnMgPVxuICAgICAgICBwcm92aWRlcnNGaWVsZCA/IGZpbmRNYXRjaGluZ0NoaWxkTm9kZXMocHJvdmlkZXJzRmllbGQsIHRzLmlzSWRlbnRpZmllcikgOiBudWxsO1xuICAgIGNvbnN0IGdlc3R1cmVDb25maWdFeHByID0gdGhpcy5faW1wb3J0TWFuYWdlci5hZGRJbXBvcnRUb1NvdXJjZUZpbGUoXG4gICAgICAgIHNvdXJjZUZpbGUsIEdFU1RVUkVfQ09ORklHX0NMQVNTX05BTUUsXG4gICAgICAgIGdldE1vZHVsZVNwZWNpZmllcihnZXN0dXJlQ29uZmlnUGF0aCwgZmlsZVBhdGgpLCBmYWxzZSxcbiAgICAgICAgdGhpcy5fZ2V0R2VzdHVyZUNvbmZpZ0lkZW50aWZpZXJzT2ZGaWxlKHNvdXJjZUZpbGUpKTtcbiAgICBjb25zdCBoYW1tZXJDb25maWdUb2tlbkV4cHIgPSB0aGlzLl9pbXBvcnRNYW5hZ2VyLmFkZEltcG9ydFRvU291cmNlRmlsZShcbiAgICAgICAgc291cmNlRmlsZSwgSEFNTUVSX0NPTkZJR19UT0tFTl9OQU1FLCBIQU1NRVJfQ09ORklHX1RPS0VOX01PRFVMRSk7XG4gICAgY29uc3QgbmV3UHJvdmlkZXJOb2RlID0gdHMuY3JlYXRlT2JqZWN0TGl0ZXJhbChbXG4gICAgICB0cy5jcmVhdGVQcm9wZXJ0eUFzc2lnbm1lbnQoJ3Byb3ZpZGUnLCBoYW1tZXJDb25maWdUb2tlbkV4cHIpLFxuICAgICAgdHMuY3JlYXRlUHJvcGVydHlBc3NpZ25tZW50KCd1c2VDbGFzcycsIGdlc3R1cmVDb25maWdFeHByKVxuICAgIF0pO1xuXG4gICAgLy8gSWYgdGhlIHByb3ZpZGVycyBmaWVsZCBleGlzdHMgYW5kIGFscmVhZHkgY29udGFpbnMgcmVmZXJlbmNlcyB0byB0aGUgaGFtbWVyIGdlc3R1cmVcbiAgICAvLyBjb25maWcgdG9rZW4gYW5kIHRoZSBnZXN0dXJlIGNvbmZpZywgd2UgbmFpdmVseSBhc3N1bWUgdGhhdCB0aGUgZ2VzdHVyZSBjb25maWcgaXNcbiAgICAvLyBhbHJlYWR5IHNldCB1cC4gV2Ugb25seSB3YW50IHRvIGFkZCB0aGUgZ2VzdHVyZSBjb25maWcgcHJvdmlkZXIgaWYgaXQgaXMgbm90IHNldCB1cC5cbiAgICBpZiAoIXByb3ZpZGVySWRlbnRpZmllcnMgfHxcbiAgICAgICAgISh0aGlzLl9oYW1tZXJDb25maWdUb2tlblJlZmVyZW5jZXMuc29tZShyID0+IHByb3ZpZGVySWRlbnRpZmllcnMuaW5jbHVkZXMoci5ub2RlKSkgJiZcbiAgICAgICAgICB0aGlzLl9nZXN0dXJlQ29uZmlnUmVmZXJlbmNlcy5zb21lKHIgPT4gcHJvdmlkZXJJZGVudGlmaWVycy5pbmNsdWRlcyhyLm5vZGUpKSkpIHtcbiAgICAgIGNvbnN0IHN5bWJvbE5hbWUgPSB0aGlzLl9wcmludE5vZGUobmV3UHJvdmlkZXJOb2RlLCBzb3VyY2VGaWxlKTtcbiAgICAgIGFkZFN5bWJvbFRvTmdNb2R1bGVNZXRhZGF0YShzb3VyY2VGaWxlLCBzb3VyY2VGaWxlLmZpbGVOYW1lLCAncHJvdmlkZXJzJywgc3ltYm9sTmFtZSwgbnVsbClcbiAgICAgICAgLmZvckVhY2goY2hhbmdlID0+IHtcbiAgICAgICAgICBpZiAoY2hhbmdlIGluc3RhbmNlb2YgSW5zZXJ0Q2hhbmdlKSB7XG4gICAgICAgICAgICByZWNvcmRlci5pbnNlcnRSaWdodChjaGFuZ2UucG9zLCBjaGFuZ2UudG9BZGQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIFR5cGVTY3JpcHQgc3ltYm9sIG9mIHRoZSByb290IG1vZHVsZSBieSBsb29raW5nIGZvciB0aGUgbW9kdWxlXG4gICAqIGJvb3RzdHJhcCBleHByZXNzaW9uIGluIHRoZSBzcGVjaWZpZWQgc291cmNlIGZpbGUuXG4gICAqL1xuICBwcml2YXRlIF9nZXRSb290TW9kdWxlU3ltYm9sKG1haW5GaWxlUGF0aDogUGF0aCk6IHRzLlN5bWJvbHxudWxsIHtcbiAgICBjb25zdCBtYWluRmlsZSA9IHRoaXMucHJvZ3JhbS5nZXRTb3VyY2VGaWxlKG1haW5GaWxlUGF0aCk7XG4gICAgaWYgKCFtYWluRmlsZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgYXBwTW9kdWxlRXhwciA9IGZpbmRNYWluTW9kdWxlRXhwcmVzc2lvbihtYWluRmlsZSk7XG4gICAgaWYgKCFhcHBNb2R1bGVFeHByKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBhcHBNb2R1bGVTeW1ib2wgPSB0aGlzLl9nZXREZWNsYXJhdGlvblN5bWJvbE9mTm9kZSh1bndyYXBFeHByZXNzaW9uKGFwcE1vZHVsZUV4cHIpKTtcbiAgICBpZiAoIWFwcE1vZHVsZVN5bWJvbCB8fCAhYXBwTW9kdWxlU3ltYm9sLnZhbHVlRGVjbGFyYXRpb24pIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gYXBwTW9kdWxlU3ltYm9sO1xuICB9XG5cbiAgLyoqIFNldHMgdXAgdGhlIFwiSGFtbWVyTW9kdWxlXCIgaW4gdGhlIHJvb3QgbW9kdWxlIG9mIHRoZSBjdXJyZW50IHByb2plY3QuICovXG4gIHByaXZhdGUgX3NldHVwSGFtbWVyTW9kdWxlSW5Sb290TW9kdWxlKCkge1xuICAgIGNvbnN0IHtwcm9qZWN0fSA9IHRoaXMuY29udGV4dDtcbiAgICBjb25zdCBtYWluRmlsZVBhdGggPSBnZXRQcm9qZWN0TWFpbkZpbGUocHJvamVjdCk7XG4gICAgY29uc3Qgcm9vdE1vZHVsZVN5bWJvbCA9IHRoaXMuX2dldFJvb3RNb2R1bGVTeW1ib2wobWFpbkZpbGVQYXRoKTtcblxuICAgIGlmIChyb290TW9kdWxlU3ltYm9sID09PSBudWxsKSB7XG4gICAgICB0aGlzLmZhaWx1cmVzLnB1c2goe1xuICAgICAgICBmaWxlUGF0aDogbWFpbkZpbGVQYXRoLFxuICAgICAgICBtZXNzYWdlOiBgQ291bGQgbm90IHNldHVwIEhhbW1lck1vZHVsZS4gUGxlYXNlIG1hbnVhbGx5IHNldCB1cCB0aGUgXCJIYW1tZXJNb2R1bGVcIiBgICtcbiAgICAgICAgICAgIGBmcm9tIFwiQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3NlclwiLmAsXG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBzb3VyY2VGaWxlID0gcm9vdE1vZHVsZVN5bWJvbC52YWx1ZURlY2xhcmF0aW9uLmdldFNvdXJjZUZpbGUoKTtcbiAgICBjb25zdCBtZXRhZGF0YSA9IGdldERlY29yYXRvck1ldGFkYXRhKHNvdXJjZUZpbGUsICdOZ01vZHVsZScsICdAYW5ndWxhci9jb3JlJykgYXNcbiAgICAgICAgdHMuT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb25bXTtcbiAgICBpZiAoIW1ldGFkYXRhLmxlbmd0aCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGltcG9ydHNGaWVsZCA9IGdldE1ldGFkYXRhRmllbGQobWV0YWRhdGFbMF0sICdpbXBvcnRzJylbMF07XG4gICAgY29uc3QgaW1wb3J0SWRlbnRpZmllcnMgPVxuICAgICAgICBpbXBvcnRzRmllbGQgPyBmaW5kTWF0Y2hpbmdDaGlsZE5vZGVzKGltcG9ydHNGaWVsZCwgdHMuaXNJZGVudGlmaWVyKSA6IG51bGw7XG4gICAgY29uc3QgcmVjb3JkZXIgPSB0aGlzLmZpbGVTeXN0ZW0uZWRpdCh0aGlzLmZpbGVTeXN0ZW0ucmVzb2x2ZShzb3VyY2VGaWxlLmZpbGVOYW1lKSk7XG4gICAgY29uc3QgaGFtbWVyTW9kdWxlRXhwciA9IHRoaXMuX2ltcG9ydE1hbmFnZXIuYWRkSW1wb3J0VG9Tb3VyY2VGaWxlKFxuICAgICAgICBzb3VyY2VGaWxlLCBIQU1NRVJfTU9EVUxFX05BTUUsIEhBTU1FUl9NT0RVTEVfSU1QT1JUKTtcblxuICAgIC8vIElmIHRoZSBcIkhhbW1lck1vZHVsZVwiIGlzIG5vdCBhbHJlYWR5IGltcG9ydGVkIGluIHRoZSBhcHAgbW9kdWxlLCB3ZSBzZXQgaXQgdXBcbiAgICAvLyBieSBhZGRpbmcgaXQgdG8gdGhlIFwiaW1wb3J0c1wiIGZpZWxkIG9mIHRoZSBhcHAgbW9kdWxlLlxuICAgIGlmICghaW1wb3J0SWRlbnRpZmllcnMgfHxcbiAgICAgICAgIXRoaXMuX2hhbW1lck1vZHVsZVJlZmVyZW5jZXMuc29tZShyID0+IGltcG9ydElkZW50aWZpZXJzLmluY2x1ZGVzKHIubm9kZSkpKSB7XG4gICAgICBjb25zdCBzeW1ib2xOYW1lID0gdGhpcy5fcHJpbnROb2RlKGhhbW1lck1vZHVsZUV4cHIsIHNvdXJjZUZpbGUpO1xuICAgICAgYWRkU3ltYm9sVG9OZ01vZHVsZU1ldGFkYXRhKHNvdXJjZUZpbGUsIHNvdXJjZUZpbGUuZmlsZU5hbWUsICdpbXBvcnRzJywgc3ltYm9sTmFtZSwgbnVsbClcbiAgICAgICAgLmZvckVhY2goY2hhbmdlID0+IHtcbiAgICAgICAgICBpZiAoY2hhbmdlIGluc3RhbmNlb2YgSW5zZXJ0Q2hhbmdlKSB7XG4gICAgICAgICAgICByZWNvcmRlci5pbnNlcnRSaWdodChjaGFuZ2UucG9zLCBjaGFuZ2UudG9BZGQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFByaW50cyBhIGdpdmVuIG5vZGUgd2l0aGluIHRoZSBzcGVjaWZpZWQgc291cmNlIGZpbGUuICovXG4gIHByaXZhdGUgX3ByaW50Tm9kZShub2RlOiB0cy5Ob2RlLCBzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fcHJpbnRlci5wcmludE5vZGUodHMuRW1pdEhpbnQuVW5zcGVjaWZpZWQsIG5vZGUsIHNvdXJjZUZpbGUpO1xuICB9XG5cbiAgLyoqIEdldHMgYWxsIHJlZmVyZW5jZWQgZ2VzdHVyZSBjb25maWcgaWRlbnRpZmllcnMgb2YgYSBnaXZlbiBzb3VyY2UgZmlsZSAqL1xuICBwcml2YXRlIF9nZXRHZXN0dXJlQ29uZmlnSWRlbnRpZmllcnNPZkZpbGUoc291cmNlRmlsZTogdHMuU291cmNlRmlsZSk6IHRzLklkZW50aWZpZXJbXSB7XG4gICAgcmV0dXJuIHRoaXMuX2dlc3R1cmVDb25maWdSZWZlcmVuY2VzLmZpbHRlcihkID0+IGQubm9kZS5nZXRTb3VyY2VGaWxlKCkgPT09IHNvdXJjZUZpbGUpXG4gICAgICAgIC5tYXAoZCA9PiBkLm5vZGUpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIHN5bWJvbCB0aGF0IGNvbnRhaW5zIHRoZSB2YWx1ZSBkZWNsYXJhdGlvbiBvZiB0aGUgc3BlY2lmaWVkIG5vZGUuICovXG4gIHByaXZhdGUgX2dldERlY2xhcmF0aW9uU3ltYm9sT2ZOb2RlKG5vZGU6IHRzLk5vZGUpOiB0cy5TeW1ib2x8dW5kZWZpbmVkIHtcbiAgICBjb25zdCBzeW1ib2wgPSB0aGlzLnR5cGVDaGVja2VyLmdldFN5bWJvbEF0TG9jYXRpb24obm9kZSk7XG5cbiAgICAvLyBTeW1ib2xzIGNhbiBiZSBhbGlhc2VzIG9mIHRoZSBkZWNsYXJhdGlvbiBzeW1ib2wuIGUuZy4gaW4gbmFtZWQgaW1wb3J0IHNwZWNpZmllcnMuXG4gICAgLy8gV2UgbmVlZCB0byByZXNvbHZlIHRoZSBhbGlhc2VkIHN5bWJvbCBiYWNrIHRvIHRoZSBkZWNsYXJhdGlvbiBzeW1ib2wuXG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWJpdHdpc2VcbiAgICBpZiAoc3ltYm9sICYmIChzeW1ib2wuZmxhZ3MgJiB0cy5TeW1ib2xGbGFncy5BbGlhcykgIT09IDApIHtcbiAgICAgIHJldHVybiB0aGlzLnR5cGVDaGVja2VyLmdldEFsaWFzZWRTeW1ib2woc3ltYm9sKTtcbiAgICB9XG4gICAgcmV0dXJuIHN5bWJvbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3Mgd2hldGhlciB0aGUgZ2l2ZW4gZXhwcmVzc2lvbiByZXNvbHZlcyB0byBhIGhhbW1lciBnZXN0dXJlIGNvbmZpZ1xuICAgKiB0b2tlbiByZWZlcmVuY2UgZnJvbSBcIkBhbmd1bGFyL3BsYXRmb3JtLWJyb3dzZXJcIi5cbiAgICovXG4gIHByaXZhdGUgX2lzUmVmZXJlbmNlVG9IYW1tZXJDb25maWdUb2tlbihleHByOiB0cy5FeHByZXNzaW9uKSB7XG4gICAgY29uc3QgdW53cmFwcGVkID0gdW53cmFwRXhwcmVzc2lvbihleHByKTtcbiAgICBpZiAodHMuaXNJZGVudGlmaWVyKHVud3JhcHBlZCkpIHtcbiAgICAgIHJldHVybiB0aGlzLl9oYW1tZXJDb25maWdUb2tlblJlZmVyZW5jZXMuc29tZShyID0+IHIubm9kZSA9PT0gdW53cmFwcGVkKTtcbiAgICB9IGVsc2UgaWYgKHRzLmlzUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uKHVud3JhcHBlZCkpIHtcbiAgICAgIHJldHVybiB0aGlzLl9oYW1tZXJDb25maWdUb2tlblJlZmVyZW5jZXMuc29tZShyID0+IHIubm9kZSA9PT0gdW53cmFwcGVkLm5hbWUpO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBtaWdyYXRpb24gZmFpbHVyZXMgb2YgdGhlIGNvbGxlY3RlZCBub2RlIGZhaWx1cmVzLiBUaGUgcmV0dXJuZWQgbWlncmF0aW9uXG4gICAqIGZhaWx1cmVzIGFyZSB1cGRhdGVkIHRvIHJlZmxlY3QgdGhlIHBvc3QtbWlncmF0aW9uIHN0YXRlIG9mIHNvdXJjZSBmaWxlcy4gTWVhbmluZ1xuICAgKiB0aGF0IGZhaWx1cmUgcG9zaXRpb25zIGFyZSBjb3JyZWN0ZWQgaWYgc291cmNlIGZpbGUgbW9kaWZpY2F0aW9ucyBzaGlmdGVkIGxpbmVzLlxuICAgKi9cbiAgcHJpdmF0ZSBfY3JlYXRlTWlncmF0aW9uRmFpbHVyZXMoKTogTWlncmF0aW9uRmFpbHVyZVtdIHtcbiAgICByZXR1cm4gdGhpcy5fbm9kZUZhaWx1cmVzLm1hcCgoe25vZGUsIG1lc3NhZ2V9KSA9PiB7XG4gICAgICBjb25zdCBzb3VyY2VGaWxlID0gbm9kZS5nZXRTb3VyY2VGaWxlKCk7XG4gICAgICBjb25zdCBvZmZzZXQgPSBub2RlLmdldFN0YXJ0KCk7XG4gICAgICBjb25zdCBwb3NpdGlvbiA9IHRzLmdldExpbmVBbmRDaGFyYWN0ZXJPZlBvc2l0aW9uKHNvdXJjZUZpbGUsIG5vZGUuZ2V0U3RhcnQoKSk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBwb3NpdGlvbjogdGhpcy5faW1wb3J0TWFuYWdlci5jb3JyZWN0Tm9kZVBvc2l0aW9uKG5vZGUsIG9mZnNldCwgcG9zaXRpb24pLFxuICAgICAgICBtZXNzYWdlOiBtZXNzYWdlLFxuICAgICAgICBmaWxlUGF0aDogdGhpcy5maWxlU3lzdGVtLnJlc29sdmUoc291cmNlRmlsZS5maWxlTmFtZSksXG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIEdsb2JhbCBzdGF0ZSBvZiB3aGV0aGVyIEhhbW1lciBpcyB1c2VkIGluIGFueSBhbmFseXplZCBwcm9qZWN0IHRhcmdldC4gKi9cbiAgc3RhdGljIGdsb2JhbFVzZXNIYW1tZXIgPSBmYWxzZTtcblxuICAvKipcbiAgICogU3RhdGljIG1pZ3JhdGlvbiBydWxlIG1ldGhvZCB0aGF0IHdpbGwgYmUgY2FsbGVkIG9uY2UgYWxsIHByb2plY3QgdGFyZ2V0c1xuICAgKiBoYXZlIGJlZW4gbWlncmF0ZWQgaW5kaXZpZHVhbGx5LiBUaGlzIG1ldGhvZCBjYW4gYmUgdXNlZCB0byBtYWtlIGNoYW5nZXMgYmFzZWRcbiAgICogb24gdGhlIGFuYWx5c2lzIG9mIHRoZSBpbmRpdmlkdWFsIHRhcmdldHMuIEZvciBleGFtcGxlOiB3ZSBvbmx5IHJlbW92ZSBIYW1tZXJcbiAgICogZnJvbSB0aGUgXCJwYWNrYWdlLmpzb25cIiBpZiBpdCBpcyBub3QgdXNlZCBpbiAqYW55KiBwcm9qZWN0IHRhcmdldC5cbiAgICovXG4gIHN0YXRpYyBnbG9iYWxQb3N0TWlncmF0aW9uKHRyZWU6IFRyZWUsIGNvbnRleHQ6IFNjaGVtYXRpY0NvbnRleHQpOiBQb3N0TWlncmF0aW9uQWN0aW9uIHtcbiAgICAvLyBBbHdheXMgbm90aWZ5IHRoZSBkZXZlbG9wZXIgdGhhdCB0aGUgSGFtbWVyIHY5IG1pZ3JhdGlvbiBkb2VzIG5vdCBtaWdyYXRlIHRlc3RzLlxuICAgIGNvbnRleHQubG9nZ2VyLmluZm8oXG4gICAgICAgICdcXG7imqAgIEdlbmVyYWwgbm90aWNlOiBUaGUgSGFtbWVySlMgdjkgbWlncmF0aW9uIGZvciBBbmd1bGFyIENvbXBvbmVudHMgaXMgbm90IGFibGUgdG8gJyArXG4gICAgICAgICdtaWdyYXRlIHRlc3RzLiBQbGVhc2UgbWFudWFsbHkgY2xlYW4gdXAgdGVzdHMgaW4geW91ciBwcm9qZWN0IGlmIHRoZXkgcmVseSBvbiAnICtcbiAgICAgICAgKHRoaXMuZ2xvYmFsVXNlc0hhbW1lciA/ICd0aGUgZGVwcmVjYXRlZCBBbmd1bGFyIE1hdGVyaWFsIGdlc3R1cmUgY29uZmlnLicgOiAnSGFtbWVySlMuJykpO1xuICAgIGNvbnRleHQubG9nZ2VyLmluZm8oXG4gICAgICAgICdSZWFkIG1vcmUgYWJvdXQgbWlncmF0aW5nIHRlc3RzOiBodHRwczovL2dpdC5pby9uZy1tYXRlcmlhbC12OS1oYW1tZXItbWlncmF0ZS10ZXN0cycpO1xuXG4gICAgaWYgKCF0aGlzLmdsb2JhbFVzZXNIYW1tZXIgJiYgdGhpcy5fcmVtb3ZlSGFtbWVyRnJvbVBhY2thZ2VKc29uKHRyZWUpKSB7XG4gICAgICAvLyBTaW5jZSBIYW1tZXIgaGFzIGJlZW4gcmVtb3ZlZCBmcm9tIHRoZSB3b3Jrc3BhY2UgXCJwYWNrYWdlLmpzb25cIiBmaWxlLFxuICAgICAgLy8gd2Ugc2NoZWR1bGUgYSBub2RlIHBhY2thZ2UgaW5zdGFsbCB0YXNrIHRvIHJlZnJlc2ggdGhlIGxvY2sgZmlsZS5cbiAgICAgIHJldHVybiB7cnVuUGFja2FnZU1hbmFnZXI6IHRydWV9O1xuICAgIH1cblxuICAgIC8vIENsZWFuIGdsb2JhbCBzdGF0ZSBvbmNlIHRoZSB3b3Jrc3BhY2UgaGFzIGJlZW4gbWlncmF0ZWQuIFRoaXMgaXMgdGVjaG5pY2FsbHlcbiAgICAvLyBub3QgbmVjZXNzYXJ5IGluIFwibmcgdXBkYXRlXCIsIGJ1dCBpbiB0ZXN0cyB3ZSByZS11c2UgdGhlIHNhbWUgcnVsZSBjbGFzcy5cbiAgICB0aGlzLmdsb2JhbFVzZXNIYW1tZXIgPSBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIHRoZSBoYW1tZXIgcGFja2FnZSBmcm9tIHRoZSB3b3Jrc3BhY2UgXCJwYWNrYWdlLmpzb25cIi5cbiAgICogQHJldHVybnMgV2hldGhlciBIYW1tZXIgd2FzIHNldCB1cCBhbmQgaGFzIGJlZW4gcmVtb3ZlZCBmcm9tIHRoZSBcInBhY2thZ2UuanNvblwiXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBfcmVtb3ZlSGFtbWVyRnJvbVBhY2thZ2VKc29uKHRyZWU6IFRyZWUpOiBib29sZWFuIHtcbiAgICBpZiAoIXRyZWUuZXhpc3RzKCcvcGFja2FnZS5qc29uJykpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBwYWNrYWdlSnNvbiA9IEpTT04ucGFyc2UodHJlZS5yZWFkKCcvcGFja2FnZS5qc29uJykhLnRvU3RyaW5nKCd1dGY4JykpIGFzIFBhY2thZ2VKc29uO1xuXG4gICAgLy8gV2UgZG8gbm90IGhhbmRsZSB0aGUgY2FzZSB3aGVyZSBzb21lb25lIG1hbnVhbGx5IGFkZGVkIFwiaGFtbWVyanNcIiB0byB0aGUgZGV2IGRlcGVuZGVuY2llcy5cbiAgICBpZiAocGFja2FnZUpzb24uZGVwZW5kZW5jaWVzICYmIHBhY2thZ2VKc29uLmRlcGVuZGVuY2llc1tIQU1NRVJfTU9EVUxFX1NQRUNJRklFUl0pIHtcbiAgICAgIGRlbGV0ZSBwYWNrYWdlSnNvbi5kZXBlbmRlbmNpZXNbSEFNTUVSX01PRFVMRV9TUEVDSUZJRVJdO1xuICAgICAgdHJlZS5vdmVyd3JpdGUoJy9wYWNrYWdlLmpzb24nLCBKU09OLnN0cmluZ2lmeShwYWNrYWdlSnNvbiwgbnVsbCwgMikpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG4vKipcbiAqIFJlY3Vyc2l2ZWx5IHVud3JhcHMgYSBnaXZlbiBleHByZXNzaW9uIGlmIGl0IGlzIHdyYXBwZWRcbiAqIGJ5IHBhcmVudGhlc2lzLCB0eXBlIGNhc3RzIG9yIHR5cGUgYXNzZXJ0aW9ucy5cbiAqL1xuZnVuY3Rpb24gdW53cmFwRXhwcmVzc2lvbihub2RlOiB0cy5Ob2RlKTogdHMuTm9kZSB7XG4gIGlmICh0cy5pc1BhcmVudGhlc2l6ZWRFeHByZXNzaW9uKG5vZGUpKSB7XG4gICAgcmV0dXJuIHVud3JhcEV4cHJlc3Npb24obm9kZS5leHByZXNzaW9uKTtcbiAgfSBlbHNlIGlmICh0cy5pc0FzRXhwcmVzc2lvbihub2RlKSkge1xuICAgIHJldHVybiB1bndyYXBFeHByZXNzaW9uKG5vZGUuZXhwcmVzc2lvbik7XG4gIH0gZWxzZSBpZiAodHMuaXNUeXBlQXNzZXJ0aW9uKG5vZGUpKSB7XG4gICAgcmV0dXJuIHVud3JhcEV4cHJlc3Npb24obm9kZS5leHByZXNzaW9uKTtcbiAgfVxuICByZXR1cm4gbm9kZTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyB0aGUgc3BlY2lmaWVkIHBhdGggdG8gYSB2YWxpZCBUeXBlU2NyaXB0IG1vZHVsZSBzcGVjaWZpZXIgd2hpY2ggaXNcbiAqIHJlbGF0aXZlIHRvIHRoZSBnaXZlbiBjb250YWluaW5nIGZpbGUuXG4gKi9cbmZ1bmN0aW9uIGdldE1vZHVsZVNwZWNpZmllcihuZXdQYXRoOiBQYXRoLCBjb250YWluaW5nRmlsZTogUGF0aCkge1xuICBsZXQgcmVzdWx0ID0gcmVsYXRpdmUoZGlybmFtZShjb250YWluaW5nRmlsZSksIG5ld1BhdGgpLnJlcGxhY2UoL1xcXFwvZywgJy8nKS5yZXBsYWNlKC9cXC50cyQvLCAnJyk7XG4gIGlmICghcmVzdWx0LnN0YXJ0c1dpdGgoJy4nKSkge1xuICAgIHJlc3VsdCA9IGAuLyR7cmVzdWx0fWA7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSB0ZXh0IG9mIHRoZSBnaXZlbiBwcm9wZXJ0eSBuYW1lLlxuICogQHJldHVybnMgVGV4dCBvZiB0aGUgZ2l2ZW4gcHJvcGVydHkgbmFtZS4gTnVsbCBpZiBub3Qgc3RhdGljYWxseSBhbmFseXphYmxlLlxuICovXG5mdW5jdGlvbiBnZXRQcm9wZXJ0eU5hbWVUZXh0KG5vZGU6IHRzLlByb3BlcnR5TmFtZSk6IHN0cmluZ3xudWxsIHtcbiAgaWYgKHRzLmlzSWRlbnRpZmllcihub2RlKSB8fCB0cy5pc1N0cmluZ0xpdGVyYWxMaWtlKG5vZGUpKSB7XG4gICAgcmV0dXJuIG5vZGUudGV4dDtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuLyoqIENoZWNrcyB3aGV0aGVyIHRoZSBnaXZlbiBpZGVudGlmaWVyIGlzIHBhcnQgb2YgYSBuYW1lc3BhY2VkIGFjY2Vzcy4gKi9cbmZ1bmN0aW9uIGlzTmFtZXNwYWNlZElkZW50aWZpZXJBY2Nlc3Mobm9kZTogdHMuSWRlbnRpZmllcik6IGJvb2xlYW4ge1xuICByZXR1cm4gdHMuaXNRdWFsaWZpZWROYW1lKG5vZGUucGFyZW50KSB8fCB0cy5pc1Byb3BlcnR5QWNjZXNzRXhwcmVzc2lvbihub2RlLnBhcmVudCk7XG59XG5cbi8qKlxuICogV2Fsa3MgdGhyb3VnaCB0aGUgc3BlY2lmaWVkIG5vZGUgYW5kIHJldHVybnMgYWxsIGNoaWxkIG5vZGVzIHdoaWNoIG1hdGNoIHRoZVxuICogZ2l2ZW4gcHJlZGljYXRlLlxuICovXG5mdW5jdGlvbiBmaW5kTWF0Y2hpbmdDaGlsZE5vZGVzPFQgZXh0ZW5kcyB0cy5Ob2RlPihcbiAgICBwYXJlbnQ6IHRzLk5vZGUsIHByZWRpY2F0ZTogKG5vZGU6IHRzLk5vZGUpID0+IG5vZGUgaXMgVCk6IFRbXSB7XG4gIGNvbnN0IHJlc3VsdDogVFtdID0gW107XG4gIGNvbnN0IHZpc2l0Tm9kZSA9IChub2RlOiB0cy5Ob2RlKSA9PiB7XG4gICAgaWYgKHByZWRpY2F0ZShub2RlKSkge1xuICAgICAgcmVzdWx0LnB1c2gobm9kZSk7XG4gICAgfVxuICAgIHRzLmZvckVhY2hDaGlsZChub2RlLCB2aXNpdE5vZGUpO1xuICB9O1xuICB0cy5mb3JFYWNoQ2hpbGQocGFyZW50LCB2aXNpdE5vZGUpO1xuICByZXR1cm4gcmVzdWx0O1xufVxuIl19