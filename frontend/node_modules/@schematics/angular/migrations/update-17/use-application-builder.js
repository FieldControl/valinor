"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_1 = require("@angular-devkit/schematics");
const posix_1 = require("node:path/posix");
const json_file_1 = require("../../utility/json-file");
const workspace_1 = require("../../utility/workspace");
const workspace_models_1 = require("../../utility/workspace-models");
const css_import_lexer_1 = require("./css-import-lexer");
function* updateBuildTarget(projectName, buildTarget, serverTarget, tree, context) {
    // Update builder target and options
    buildTarget.builder = workspace_models_1.Builders.Application;
    for (const [, options] of (0, workspace_1.allTargetOptions)(buildTarget, false)) {
        // Show warnings for using no longer supported options
        if (usesNoLongerSupportedOptions(options, context, projectName)) {
            continue;
        }
        if (options['index'] === '') {
            options['index'] = false;
        }
        // Rename and transform options
        options['browser'] = options['main'];
        if (serverTarget && typeof options['browser'] === 'string') {
            options['server'] = (0, posix_1.dirname)(options['browser']) + '/main.server.ts';
        }
        options['serviceWorker'] = options['ngswConfigPath'] ?? options['serviceWorker'];
        if (typeof options['polyfills'] === 'string') {
            options['polyfills'] = [options['polyfills']];
        }
        let outputPath = options['outputPath'];
        if (typeof outputPath === 'string') {
            if (!/\/browser\/?$/.test(outputPath)) {
                // TODO: add prompt.
                context.logger.warn(`The output location of the browser build has been updated from "${outputPath}" to ` +
                    `"${(0, posix_1.join)(outputPath, 'browser')}". ` +
                    'You might need to adjust your deployment pipeline or, as an alternative, ' +
                    'set outputPath.browser to "" in order to maintain the previous functionality.');
            }
            else {
                outputPath = outputPath.replace(/\/browser\/?$/, '');
            }
            options['outputPath'] = {
                base: outputPath,
            };
            if (typeof options['resourcesOutputPath'] === 'string') {
                const media = options['resourcesOutputPath'].replaceAll('/', '');
                if (media && media !== 'media') {
                    options['outputPath'] = {
                        base: outputPath,
                        media,
                    };
                }
            }
        }
        // Delete removed options
        delete options['deployUrl'];
        delete options['vendorChunk'];
        delete options['commonChunk'];
        delete options['resourcesOutputPath'];
        delete options['buildOptimizer'];
        delete options['main'];
        delete options['ngswConfigPath'];
    }
    // Merge browser and server tsconfig
    if (serverTarget) {
        const browserTsConfig = buildTarget.options?.tsConfig;
        const serverTsConfig = serverTarget.options?.tsConfig;
        if (typeof browserTsConfig !== 'string') {
            throw new schematics_1.SchematicsException(`Cannot update project "${projectName}" to use the application builder` +
                ` as the browser tsconfig cannot be located.`);
        }
        if (typeof serverTsConfig !== 'string') {
            throw new schematics_1.SchematicsException(`Cannot update project "${projectName}" to use the application builder` +
                ` as the server tsconfig cannot be located.`);
        }
        const browserJson = new json_file_1.JSONFile(tree, browserTsConfig);
        const serverJson = new json_file_1.JSONFile(tree, serverTsConfig);
        const filesPath = ['files'];
        const files = new Set([
            ...(browserJson.get(filesPath) ?? []),
            ...(serverJson.get(filesPath) ?? []),
        ]);
        // Server file will be added later by the means of the ssr schematic.
        files.delete('server.ts');
        browserJson.modify(filesPath, Array.from(files));
        const typesPath = ['compilerOptions', 'types'];
        browserJson.modify(typesPath, Array.from(new Set([
            ...(browserJson.get(typesPath) ?? []),
            ...(serverJson.get(typesPath) ?? []),
        ])));
        // Delete server tsconfig
        yield deleteFile(serverTsConfig);
    }
    // Update server file
    const ssrMainFile = serverTarget?.options?.['main'];
    if (typeof ssrMainFile === 'string') {
        yield deleteFile(ssrMainFile);
        yield (0, schematics_1.externalSchematic)('@schematics/angular', 'ssr', {
            project: projectName,
            skipInstall: true,
        });
    }
}
function updateProjects(tree, context) {
    return (0, workspace_1.updateWorkspace)((workspace) => {
        const rules = [];
        for (const [name, project] of workspace.projects) {
            if (project.extensions.projectType !== workspace_models_1.ProjectType.Application) {
                // Only interested in application projects since these changes only effects application builders
                continue;
            }
            const buildTarget = project.targets.get('build');
            if (!buildTarget || buildTarget.builder === workspace_models_1.Builders.Application) {
                continue;
            }
            if (buildTarget.builder !== workspace_models_1.Builders.BrowserEsbuild &&
                buildTarget.builder !== workspace_models_1.Builders.Browser) {
                context.logger.error(`Cannot update project "${name}" to use the application builder.` +
                    ` Only "${workspace_models_1.Builders.BrowserEsbuild}" and "${workspace_models_1.Builders.Browser}" can be automatically migrated.`);
                continue;
            }
            const serverTarget = project.targets.get('server');
            rules.push(...updateBuildTarget(name, buildTarget, serverTarget, tree, context));
            // Delete all redundant targets
            for (const [key, target] of project.targets) {
                switch (target.builder) {
                    case workspace_models_1.Builders.Server:
                    case workspace_models_1.Builders.Prerender:
                    case workspace_models_1.Builders.AppShell:
                    case workspace_models_1.Builders.SsrDevServer:
                        project.targets.delete(key);
                        break;
                }
            }
            // Update CSS/Sass import specifiers
            const projectSourceRoot = (0, posix_1.join)(project.root, project.sourceRoot ?? 'src');
            updateStyleImports(tree, projectSourceRoot, buildTarget);
        }
        return (0, schematics_1.chain)(rules);
    });
}
function* visit(directory) {
    for (const path of directory.subfiles) {
        const sass = path.endsWith('.scss');
        if (path.endsWith('.css') || sass) {
            const entry = directory.file(path);
            if (entry) {
                const content = entry.content;
                yield [entry.path, content.toString(), sass];
            }
        }
    }
    for (const path of directory.subdirs) {
        if (path === 'node_modules' || path.startsWith('.')) {
            continue;
        }
        yield* visit(directory.dir(path));
    }
}
// Based on https://github.com/sass/dart-sass/blob/44d6bb6ac72fe6b93f5bfec371a1fffb18e6b76d/lib/src/importer/utils.dart
function* potentialSassImports(specifier, base, fromImport) {
    const directory = (0, posix_1.join)(base, (0, posix_1.dirname)(specifier));
    const extension = (0, posix_1.extname)(specifier);
    const hasStyleExtension = extension === '.scss' || extension === '.sass' || extension === '.css';
    // Remove the style extension if present to allow adding the `.import` suffix
    const filename = (0, posix_1.basename)(specifier, hasStyleExtension ? extension : undefined);
    if (hasStyleExtension) {
        if (fromImport) {
            yield (0, posix_1.join)(directory, filename + '.import' + extension);
            yield (0, posix_1.join)(directory, '_' + filename + '.import' + extension);
        }
        yield (0, posix_1.join)(directory, filename + extension);
        yield (0, posix_1.join)(directory, '_' + filename + extension);
    }
    else {
        if (fromImport) {
            yield (0, posix_1.join)(directory, filename + '.import.scss');
            yield (0, posix_1.join)(directory, filename + '.import.sass');
            yield (0, posix_1.join)(directory, filename + '.import.css');
            yield (0, posix_1.join)(directory, '_' + filename + '.import.scss');
            yield (0, posix_1.join)(directory, '_' + filename + '.import.sass');
            yield (0, posix_1.join)(directory, '_' + filename + '.import.css');
        }
        yield (0, posix_1.join)(directory, filename + '.scss');
        yield (0, posix_1.join)(directory, filename + '.sass');
        yield (0, posix_1.join)(directory, filename + '.css');
        yield (0, posix_1.join)(directory, '_' + filename + '.scss');
        yield (0, posix_1.join)(directory, '_' + filename + '.sass');
        yield (0, posix_1.join)(directory, '_' + filename + '.css');
    }
}
function updateStyleImports(tree, projectSourceRoot, buildTarget) {
    const external = new Set();
    let needWorkspaceIncludePath = false;
    for (const file of visit(tree.getDir(projectSourceRoot))) {
        const [path, content, sass] = file;
        const relativeBase = (0, posix_1.dirname)(path);
        let updater;
        for (const { start, specifier, fromUse } of (0, css_import_lexer_1.findImports)(content, sass)) {
            if (specifier[0] === '~') {
                updater ??= tree.beginUpdate(path);
                // start position includes the opening quote
                updater.remove(start + 1, 1);
            }
            else if (specifier[0] === '^') {
                updater ??= tree.beginUpdate(path);
                // start position includes the opening quote
                updater.remove(start + 1, 1);
                // Add to externalDependencies
                external.add(specifier.slice(1));
            }
            else if (sass &&
                [...potentialSassImports(specifier, relativeBase, !fromUse)].every((v) => !tree.exists(v)) &&
                [...potentialSassImports(specifier, '/', !fromUse)].some((v) => tree.exists(v))) {
                needWorkspaceIncludePath = true;
            }
        }
        if (updater) {
            tree.commitUpdate(updater);
        }
    }
    if (needWorkspaceIncludePath) {
        buildTarget.options ??= {};
        buildTarget.options['stylePreprocessorOptions'] ??= {};
        (buildTarget.options['stylePreprocessorOptions']['includePaths'] ??= []).push('.');
    }
    if (external.size > 0) {
        buildTarget.options ??= {};
        (buildTarget.options['externalDependencies'] ??= []).push(...external);
    }
}
function deleteFile(path) {
    return (tree) => {
        tree.delete(path);
    };
}
function updateJsonFile(path, updater) {
    return (tree) => {
        updater(new json_file_1.JSONFile(tree, path));
    };
}
/**
 * Migration main entrypoint
 */
function default_1() {
    return (0, schematics_1.chain)([
        updateProjects,
        // Delete package.json helper scripts
        updateJsonFile('package.json', (pkgJson) => ['build:ssr', 'dev:ssr', 'serve:ssr', 'prerender'].forEach((s) => pkgJson.remove(['scripts', s]))),
        // Update main tsconfig
        updateJsonFile('tsconfig.json', (rootJson) => {
            rootJson.modify(['compilerOptions', 'esModuleInterop'], true);
            rootJson.modify(['compilerOptions', 'downlevelIteration'], undefined);
            rootJson.modify(['compilerOptions', 'allowSyntheticDefaultImports'], undefined);
        }),
    ]);
}
exports.default = default_1;
function usesNoLongerSupportedOptions({ deployUrl }, context, projectName) {
    let hasUsage = false;
    if (typeof deployUrl === 'string') {
        hasUsage = true;
        context.logger.warn(`Skipping migration for project "${projectName}". "deployUrl" option is not available in the application builder.`);
    }
    return hasUsage;
}
