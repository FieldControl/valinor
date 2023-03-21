"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ngAddSetupProject = exports.setupProject = void 0;
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const utils_1 = require("../utils");
const prompts_1 = require("./prompts");
const ssr_1 = require("./ssr");
const static_1 = require("./static");
const firebaseTools_1 = require("../firebaseTools");
const fs_1 = require("fs");
const path_1 = require("path");
const setupProject = (tree, context, features, config) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { path: workspacePath, workspace } = utils_1.getWorkspace(tree);
    const { project, projectName } = utils_1.getProject(config, tree);
    const sourcePath = (_a = project.sourceRoot) !== null && _a !== void 0 ? _a : project.root;
    utils_1.addIgnoreFiles(tree);
    const featuresToImport = features.filter(it => it !== 0);
    if (featuresToImport.length > 0) {
        utils_1.addToNgModule(tree, { features: featuresToImport, sourcePath });
        utils_1.addFixesToServer(tree, { features: featuresToImport, sourcePath });
    }
    if (config.sdkConfig) {
        const source = `
  firebase: {
${Object.entries(config.sdkConfig).reduce((c, [k, v]) => c.concat(`    ${k}: '${v}'`), []).join(',\n')},
  }`;
        const environmentPath = `${sourcePath}/environments/environment.ts`;
        utils_1.addEnvironmentEntry(tree, `/${environmentPath}`, source);
        Object.values(project.architect || {}).forEach(builder => {
            Object.values(builder.configurations || {}).forEach(configuration => {
                (configuration.fileReplacements || []).forEach((replacement) => {
                    if (replacement.replace === environmentPath) {
                        utils_1.addEnvironmentEntry(tree, `/${replacement.with}`, source);
                    }
                });
            });
        });
    }
    const options = {
        project: projectName,
        firebaseProject: config.firebaseProject,
        firebaseApp: config.firebaseApp,
        firebaseHostingSite: config.firebaseHostingSite,
        sdkConfig: config.sdkConfig,
        prerender: config.prerender,
        browserTarget: config.browserTarget,
        serverTarget: config.serverTarget,
        prerenderTarget: config.prerenderTarget,
    };
    if (features.includes(0)) {
        switch (config.projectType) {
            case 1:
            case 2:
                return ssr_1.setupUniversalDeployment({
                    workspace,
                    workspacePath,
                    options,
                    tree,
                    context,
                    project,
                    projectType: config.projectType,
                    nodeVersion: config.nodeVersion,
                });
            case 0:
                return static_1.setupStaticDeployment({
                    workspace,
                    workspacePath,
                    options,
                    tree,
                    context,
                    project
                });
            default: throw (new schematics_1.SchematicsException(`Unimplemented PROJECT_TYPE ${config.projectType}`));
        }
    }
    else {
        return Promise.resolve();
    }
});
exports.setupProject = setupProject;
const ngAddSetupProject = (options) => (host, context) => __awaiter(void 0, void 0, void 0, function* () {
    let projectRoot = host._backend._root;
    if (process.platform.startsWith('win32')) {
        projectRoot = core_1.asWindowsPath(core_1.normalize(projectRoot));
    }
    const features = yield prompts_1.featuresPrompt();
    if (features.length > 0) {
        const firebaseTools = yield firebaseTools_1.getFirebaseTools();
        if (!host.exists('/firebase.json')) {
            fs_1.writeFileSync(path_1.join(projectRoot, 'firebase.json'), '{}');
        }
        const user = yield prompts_1.userPrompt({ projectRoot });
        yield firebaseTools.login.use(user.email, { projectRoot });
        const { project: ngProject, projectName: ngProjectName } = utils_1.getProject(options, host);
        const [defaultProjectName] = utils_1.getFirebaseProjectNameFromHost(host, ngProjectName);
        const firebaseProject = yield prompts_1.projectPrompt(defaultProjectName, { projectRoot, account: user.email });
        let hosting = { projectType: 0, prerender: false };
        let firebaseHostingSite;
        if (features.includes(0)) {
            const results = yield prompts_1.projectTypePrompt(ngProject, ngProjectName);
            hosting = Object.assign(Object.assign({}, hosting), results);
            firebaseHostingSite = yield prompts_1.sitePrompt(firebaseProject, { projectRoot });
        }
        let firebaseApp;
        let sdkConfig;
        if (features.find(it => it !== 0)) {
            const defaultAppId = firebaseHostingSite === null || firebaseHostingSite === void 0 ? void 0 : firebaseHostingSite.appId;
            firebaseApp = yield prompts_1.appPrompt(firebaseProject, defaultAppId, { projectRoot });
            const result = yield firebaseTools.apps.sdkconfig('web', firebaseApp.appId, { nonInteractive: true, projectRoot });
            sdkConfig = result.sdkConfig;
        }
        yield exports.setupProject(host, context, features, Object.assign(Object.assign(Object.assign({}, options), hosting), { firebaseProject, firebaseApp, firebaseHostingSite, sdkConfig }));
    }
});
exports.ngAddSetupProject = ngAddSetupProject;
