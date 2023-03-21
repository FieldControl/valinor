"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupStaticDeployment = exports.generateFirebaseJson = void 0;
const schematics_1 = require("@angular-devkit/schematics");
const common_1 = require("../common");
const common_2 = require("../common");
function emptyFirebaseJson() {
    return {
        hosting: []
    };
}
function generateHostingConfig(project, dist) {
    return {
        target: project,
        public: dist,
        ignore: ['**/.*'],
        headers: [{
                source: '*.[0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f].+(css|js)',
                headers: [{
                        key: 'Cache-Control',
                        value: 'public,max-age=31536000,immutable',
                    }],
            }, {
                source: '/@(ngsw-worker.js|ngsw.json)',
                headers: [{
                        key: 'Cache-Control',
                        value: 'no-cache',
                    }],
            }],
        rewrites: [
            {
                source: '**',
                destination: '/index.html',
            }
        ]
    };
}
function generateFirebaseJson(tree, path, project, dist) {
    const firebaseJson = tree.exists(path)
        ? common_1.safeReadJSON(path, tree)
        : emptyFirebaseJson();
    const newConfig = generateHostingConfig(project, dist);
    if (firebaseJson.hosting === undefined) {
        firebaseJson.hosting = newConfig;
    }
    else if (Array.isArray(firebaseJson.hosting)) {
        const targetIndex = firebaseJson.hosting.findIndex(it => it.target === newConfig.target);
        if (targetIndex > -1) {
            firebaseJson.hosting[targetIndex] = newConfig;
        }
        else {
            firebaseJson.hosting.push(newConfig);
        }
    }
    else {
        firebaseJson.hosting = [firebaseJson.hosting, newConfig];
    }
    common_1.overwriteIfExists(tree, path, common_1.stringifyFormatted(firebaseJson));
}
exports.generateFirebaseJson = generateFirebaseJson;
const setupStaticDeployment = (config) => {
    var _a, _b, _c;
    const { tree, workspacePath, workspace, options } = config;
    const project = workspace.projects[options.project];
    if (!((_c = (_b = (_a = project.architect) === null || _a === void 0 ? void 0 : _a.build) === null || _b === void 0 ? void 0 : _b.options) === null || _c === void 0 ? void 0 : _c.outputPath)) {
        throw new schematics_1.SchematicsException(`Cannot read the output path (architect.build.options.outputPath) of the Angular project "${options.project}" in angular.json`);
    }
    const outputPath = project.architect.build.options.outputPath;
    project.architect.deploy = {
        builder: '@angular/fire:deploy',
        options: Object.assign(Object.assign({ prerender: options.prerender, ssr: false, browserTarget: options.browserTarget, firebaseProject: options.firebaseProject.projectId, firebaseHostingSite: common_2.shortSiteName(options.firebaseHostingSite) }, (options.serverTarget ? { serverTarget: options.serverTarget } : {})), (options.prerenderTarget ? { prerenderTarget: options.prerenderTarget } : {}))
    };
    tree.overwrite(workspacePath, JSON.stringify(workspace, null, 2));
    generateFirebaseJson(tree, 'firebase.json', options.project, outputPath);
    common_1.generateFirebaseRc(tree, '.firebaserc', options.firebaseProject.projectId, options.firebaseHostingSite, options.project);
    return tree;
};
exports.setupStaticDeployment = setupStaticDeployment;
