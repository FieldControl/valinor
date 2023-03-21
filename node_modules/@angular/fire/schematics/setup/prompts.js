"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.projectTypePrompt = exports.sitePrompt = exports.appPrompt = exports.projectPrompt = exports.userPrompt = exports.featuresPrompt = exports.searchSites = exports.searchApps = exports.searchProjects = void 0;
const fuzzy = __importStar(require("fuzzy"));
const inquirer = __importStar(require("inquirer"));
const interfaces_1 = require("../interfaces");
const utils_1 = require("../utils");
const firebaseTools_1 = require("../firebaseTools");
const common_1 = require("../common");
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));
const NEW_OPTION = '~~angularfire-new~~';
const DEFAULT_SITE_TYPE = 'DEFAULT_SITE';
const isProject = (elem) => {
    return elem.original === undefined;
};
const isApp = (elem) => {
    return elem.original === undefined;
};
const isSite = (elem) => {
    return elem.original === undefined;
};
const searchProjects = (projects) => (_, input) => __awaiter(void 0, void 0, void 0, function* () {
    projects.unshift({
        projectId: NEW_OPTION,
        displayName: '[CREATE NEW PROJECT]'
    });
    return fuzzy.filter(input, projects, {
        extract(el) {
            return `${el.projectId} ${el.displayName}`;
        }
    }).map((result) => {
        let original;
        if (isProject(result)) {
            original = result;
        }
        else {
            original = result.original;
        }
        return {
            name: original.displayName,
            title: original.displayName,
            value: original.projectId
        };
    });
});
exports.searchProjects = searchProjects;
const searchApps = (apps) => (_, input) => __awaiter(void 0, void 0, void 0, function* () {
    apps.unshift({
        appId: NEW_OPTION,
        displayName: '[CREATE NEW APP]',
    });
    return fuzzy.filter(input, apps, {
        extract(el) {
            return el.displayName;
        }
    }).map((result) => {
        let original;
        if (isApp(result)) {
            original = result;
        }
        else {
            original = result.original;
        }
        return {
            name: original.displayName,
            title: original.displayName,
            value: utils_1.shortAppId(original),
        };
    });
});
exports.searchApps = searchApps;
const searchSites = (sites) => (_, input) => __awaiter(void 0, void 0, void 0, function* () {
    sites.unshift({
        name: NEW_OPTION,
        defaultUrl: '[CREATE NEW SITE]',
    });
    return fuzzy.filter(input, sites, {
        extract(el) {
            return el.defaultUrl;
        }
    }).map((result) => {
        let original;
        if (isSite(result)) {
            original = result;
        }
        else {
            original = result.original;
        }
        return {
            name: original.defaultUrl,
            title: original.defaultUrl,
            value: common_1.shortSiteName(original),
        };
    });
});
exports.searchSites = searchSites;
const autocomplete = (questions) => inquirer.prompt(questions);
const featuresPrompt = () => __awaiter(void 0, void 0, void 0, function* () {
    const { features } = yield inquirer.prompt({
        type: 'checkbox',
        name: 'features',
        choices: interfaces_1.featureOptions,
        message: 'What features would you like to setup?',
        default: [0],
    });
    return features;
});
exports.featuresPrompt = featuresPrompt;
const userPrompt = (options) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const firebaseTools = yield firebaseTools_1.getFirebaseTools();
    const users = yield firebaseTools.login.list();
    if (!users || users.length === 0) {
        yield firebaseTools.login();
        const user = yield firebaseTools.login(options);
        return user;
    }
    else {
        const defaultUser = yield firebaseTools.login(options);
        const choices = users.map(({ user }) => ({ name: user.email, value: user }));
        const newChoice = { name: '[Login in with another account]', value: NEW_OPTION };
        const { user } = yield inquirer.prompt({
            type: 'list',
            name: 'user',
            choices: [newChoice].concat(choices),
            message: 'Which Firebase account would you like to use?',
            default: (_a = choices.find(it => it.value.email === defaultUser.email)) === null || _a === void 0 ? void 0 : _a.value,
        });
        if (user === NEW_OPTION) {
            const { user } = yield firebaseTools.login.add();
            return user;
        }
        return user;
    }
});
exports.userPrompt = userPrompt;
const projectPrompt = (defaultProject, options) => __awaiter(void 0, void 0, void 0, function* () {
    const firebaseTools = yield firebaseTools_1.getFirebaseTools();
    const projects = yield firebaseTools.projects.list(options);
    const { projectId } = yield autocomplete({
        type: 'autocomplete',
        name: 'projectId',
        source: exports.searchProjects(projects),
        message: 'Please select a project:',
        default: defaultProject,
    });
    if (projectId === NEW_OPTION) {
        const { projectId } = yield inquirer.prompt({
            type: 'input',
            name: 'projectId',
            message: `Please specify a unique project id (cannot be modified afterward) [6-30 characters]:`,
        });
        const { displayName } = yield inquirer.prompt({
            type: 'input',
            name: 'displayName',
            message: 'What would you like to call your project?',
            default: projectId,
        });
        return yield firebaseTools.projects.create(projectId, { account: options.account, displayName, nonInteractive: true });
    }
    return (yield projects).find(it => it.projectId === projectId);
});
exports.projectPrompt = projectPrompt;
const appPrompt = ({ projectId: project }, defaultAppId, options) => __awaiter(void 0, void 0, void 0, function* () {
    const firebaseTools = yield firebaseTools_1.getFirebaseTools();
    const apps = yield firebaseTools.apps.list('web', Object.assign(Object.assign({}, options), { project }));
    const { appId } = yield autocomplete({
        type: 'autocomplete',
        name: 'appId',
        source: exports.searchApps(apps),
        message: 'Please select an app:',
        default: defaultAppId,
    });
    if (appId === NEW_OPTION) {
        const { displayName } = yield inquirer.prompt({
            type: 'input',
            name: 'displayName',
            message: 'What would you like to call your app?',
        });
        return yield firebaseTools.apps.create('web', displayName, Object.assign(Object.assign({}, options), { nonInteractive: true, project }));
    }
    return (yield apps).find(it => utils_1.shortAppId(it) === appId);
});
exports.appPrompt = appPrompt;
const sitePrompt = ({ projectId: project }, options) => __awaiter(void 0, void 0, void 0, function* () {
    const firebaseTools = yield firebaseTools_1.getFirebaseTools();
    const sites = yield firebaseTools.hosting.sites.list(Object.assign(Object.assign({}, options), { project })).then(it => {
        if (it.sites.length === 0) {
            return [{
                    name: project,
                    defaultUrl: `https://${project}.web.app`,
                    type: DEFAULT_SITE_TYPE,
                    appId: undefined,
                }];
        }
        else {
            return it.sites;
        }
    });
    const { siteName } = yield autocomplete({
        type: 'autocomplete',
        name: 'siteName',
        source: exports.searchSites(sites),
        message: 'Please select a hosting site:',
        default: _ => common_1.shortSiteName(sites.find(site => site.type === DEFAULT_SITE_TYPE)),
    });
    if (siteName === NEW_OPTION) {
        const { subdomain } = yield inquirer.prompt({
            type: 'input',
            name: 'subdomain',
            message: 'Please provide an unique, URL-friendly id for the site (<id>.web.app):',
        });
        return yield firebaseTools.hosting.sites.create(subdomain, Object.assign(Object.assign({}, options), { nonInteractive: true, project }));
    }
    return (yield sites).find(it => common_1.shortSiteName(it) === siteName);
});
exports.sitePrompt = sitePrompt;
const projectTypePrompt = (project, name) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d, _e, _f, _g, _h, _j;
    let prerender = false;
    let nodeVersion;
    let serverTarget;
    let browserTarget = `${name}:build:${((_c = (_b = project.architect) === null || _b === void 0 ? void 0 : _b.build) === null || _c === void 0 ? void 0 : _c.defaultConfiguration) || 'production'}`;
    let prerenderTarget;
    if (utils_1.isUniversalApp(project)) {
        serverTarget = `${name}:server:${((_e = (_d = project.architect) === null || _d === void 0 ? void 0 : _d.server) === null || _e === void 0 ? void 0 : _e.defaultConfiguration) || 'production'}`;
        browserTarget = `${name}:build:${((_g = (_f = project.architect) === null || _f === void 0 ? void 0 : _f.build) === null || _g === void 0 ? void 0 : _g.defaultConfiguration) || 'production'}`;
        if (utils_1.hasPrerenderOption(project)) {
            prerenderTarget = `${name}:prerender:${((_j = (_h = project.architect) === null || _h === void 0 ? void 0 : _h.prerender) === null || _j === void 0 ? void 0 : _j.defaultConfiguration) || 'production'}`;
            const { shouldPrerender } = yield inquirer.prompt({
                type: 'confirm',
                name: 'shouldPrerender',
                message: 'Should we prerender before deployment?',
                default: true
            });
            prerender = shouldPrerender;
        }
        const choices = [
            { name: prerender ? 'Pre-render only' : 'Don\'t render universal content', value: 0 },
            { name: 'Cloud Functions', value: 1 },
            { name: 'Cloud Run', value: 2 },
        ];
        const { projectType } = yield inquirer.prompt({
            type: 'list',
            name: 'projectType',
            choices,
            message: 'How would you like to render server-side content?',
            default: 1,
        });
        if (projectType === 1) {
            const { newNodeVersion } = yield inquirer.prompt({
                type: 'list',
                name: 'newNodeVersion',
                choices: ['12', '14', '16'],
                message: 'What version of Node.js would you like to use?',
                default: parseInt(process.versions.node, 10).toString(),
            });
            nodeVersion = newNodeVersion;
        }
        else if (projectType === 2) {
            const fetch = require('node-fetch');
            const { newNodeVersion } = yield inquirer.prompt({
                type: 'input',
                name: 'newNodeVersion',
                message: 'What version of Node.js would you like to use?',
                validate: it => fetch(`https://hub.docker.com/v2/repositories/library/node/tags/${it}-slim`).then(it => it.status === 200 || `Can't find node:${it}-slim docker image.`),
                default: parseFloat(process.versions.node).toString(),
            });
            nodeVersion = newNodeVersion;
        }
        return { prerender, projectType, nodeVersion, browserTarget, serverTarget, prerenderTarget };
    }
    return { projectType: 0, prerender, nodeVersion, browserTarget, serverTarget, prerenderTarget };
});
exports.projectTypePrompt = projectTypePrompt;
