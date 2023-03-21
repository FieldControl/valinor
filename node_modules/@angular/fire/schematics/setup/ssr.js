"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupUniversalDeployment = exports.generateFirebaseJson = void 0;
const schematics_1 = require("@angular-devkit/schematics");
const common_1 = require("../common");
const versions_json_1 = require("../versions.json");
const tasks_1 = require("@angular-devkit/schematics/tasks");
const common_2 = require("../common");
function generateHostingConfig(project, dist, functionName, projectType) {
    return {
        target: project,
        public: dist,
        ignore: ['**/.*'],
        headers: [{
                source: '*.[0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f].+(css|js)',
                headers: [{
                        key: 'Cache-Control',
                        value: 'public,max-age=31536000,immutable',
                    }]
            }, {
                source: '/@(ngsw-worker.js|ngsw.json)',
                headers: [{
                        key: 'Cache-Control',
                        value: 'no-cache',
                    }]
            }],
        rewrites: [
            projectType === 1 ? {
                source: '**',
                function: functionName
            } : {
                source: '**',
                run: { serviceId: functionName }
            }
        ]
    };
}
function generateFunctionsConfig(source) {
    return {
        source
    };
}
function generateFirebaseJson(tree, path, project, dist, functionsOutput, functionName, projectType) {
    const firebaseJson = tree.exists(path)
        ? common_1.safeReadJSON(path, tree)
        : {};
    const newConfig = generateHostingConfig(project, dist, functionName, projectType);
    if (firebaseJson.hosting === undefined) {
        firebaseJson.hosting = [newConfig];
    }
    else if (Array.isArray(firebaseJson.hosting)) {
        const existingConfigIndex = firebaseJson.hosting.findIndex(config => config.target === newConfig.target);
        if (existingConfigIndex > -1) {
            firebaseJson.hosting.splice(existingConfigIndex, 1, newConfig);
        }
        else {
            firebaseJson.hosting.push(newConfig);
        }
    }
    else {
        firebaseJson.hosting = [firebaseJson.hosting, newConfig];
    }
    if (projectType === 1) {
        firebaseJson.functions = generateFunctionsConfig(functionsOutput);
    }
    common_1.overwriteIfExists(tree, path, common_1.stringifyFormatted(firebaseJson));
}
exports.generateFirebaseJson = generateFirebaseJson;
const setupUniversalDeployment = (config) => {
    var _a, _b, _c, _d, _e, _f;
    const { tree, workspacePath, workspace, options } = config;
    const project = workspace.projects[options.project];
    if (!((_c = (_b = (_a = project.architect) === null || _a === void 0 ? void 0 : _a.build) === null || _b === void 0 ? void 0 : _b.options) === null || _c === void 0 ? void 0 : _c.outputPath)) {
        throw new schematics_1.SchematicsException(`Cannot read the output path (architect.build.options.outputPath) of the Angular project "${options.project}" in angular.json`);
    }
    if (!((_f = (_e = (_d = project.architect) === null || _d === void 0 ? void 0 : _d.server) === null || _e === void 0 ? void 0 : _e.options) === null || _f === void 0 ? void 0 : _f.outputPath)) {
        throw new schematics_1.SchematicsException(`Cannot read the output path (architect.server.options.outputPath) of the Angular project "${options.project}" in angular.json`);
    }
    const ssrDirectory = config.projectType === 1 ? 'functions' : 'run';
    const staticOutput = project.architect.build.options.outputPath;
    const functionsOutput = `dist/${options.project}/${ssrDirectory}`;
    const functionName = config.projectType === 2 ?
        `ssr-${options.project.replace('_', '-')}` :
        `ssr_${options.project}`;
    project.architect.deploy = {
        builder: '@angular/fire:deploy',
        options: Object.assign(Object.assign(Object.assign({ ssr: config.projectType === 2 ? 'cloud-run' : 'cloud-functions', prerender: options.prerender, firebaseProject: options.firebaseProject.projectId, firebaseHostingSite: common_2.shortSiteName(options.firebaseHostingSite), functionName, functionsNodeVersion: config.nodeVersion, region: 'us-central1', browserTarget: options.browserTarget }, (options.serverTarget ? { serverTarget: options.serverTarget } : {})), (options.prerenderTarget ? { prerenderTarget: options.prerenderTarget } : {})), { outputPath: functionsOutput })
    };
    tree.overwrite(workspacePath, JSON.stringify(workspace, null, 2));
    common_1.addDependencies(tree, Object.entries(versions_json_1.firebaseFunctionsDependencies).reduce((acc, [dep, deets]) => {
        deets.dev = true;
        acc[dep] = deets;
        return acc;
    }, {}), config.context);
    config.context.addTask(new tasks_1.NodePackageInstallTask());
    generateFirebaseJson(tree, 'firebase.json', options.project, staticOutput, functionsOutput, functionName, config.projectType);
    common_1.generateFirebaseRc(tree, '.firebaserc', options.firebaseProject.projectId, options.firebaseHostingSite, options.project);
    return tree;
};
exports.setupUniversalDeployment = setupUniversalDeployment;
