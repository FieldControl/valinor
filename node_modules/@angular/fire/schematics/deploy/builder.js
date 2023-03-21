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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const architect_1 = require("@angular-devkit/architect");
const actions_1 = __importDefault(require("./actions"));
const utils_1 = require("../utils");
const firebaseTools_1 = require("../firebaseTools");
exports.default = architect_1.createBuilder((options, context) => __awaiter(void 0, void 0, void 0, function* () {
    if (!context.target) {
        throw new Error('Cannot deploy the application without a target');
    }
    const [defaultFirebaseProject, defulatFirebaseHostingSite] = utils_1.getFirebaseProjectNameFromFs(context.workspaceRoot, context.target.project);
    const firebaseProject = options.firebaseProject || defaultFirebaseProject;
    if (!firebaseProject) {
        throw new Error('Cannot detirmine the Firebase Project from your angular.json or .firebaserc');
    }
    if (firebaseProject !== defaultFirebaseProject) {
        throw new Error('The Firebase Project specified by your angular.json or .firebaserc is in conflict');
    }
    const firebaseHostingSite = options.firebaseHostingSite || defulatFirebaseHostingSite;
    if (!firebaseHostingSite) {
        throw new Error(`Cannot detirmine the Firebase Hosting Site from your angular.json or .firebaserc`);
    }
    if (firebaseHostingSite !== defulatFirebaseHostingSite) {
        throw new Error('The Firebase Hosting Site specified by your angular.json or .firebaserc is in conflict');
    }
    const staticBuildTarget = { name: options.browserTarget || options.buildTarget || `${context.target.project}:build:production` };
    let prerenderBuildTarget;
    if (options.prerender) {
        prerenderBuildTarget = {
            name: options.prerenderTarget || `${context.target.project}:prerender:production`
        };
    }
    let serverBuildTarget;
    if (options.ssr) {
        serverBuildTarget = {
            name: options.serverTarget || options.universalBuildTarget || `${context.target.project}:server:production`
        };
    }
    try {
        process.env.FIREBASE_DEPLOY_AGENT = 'angularfire';
        yield actions_1.default((yield firebaseTools_1.getFirebaseTools()), context, staticBuildTarget, serverBuildTarget, prerenderBuildTarget, firebaseProject, options, process.env.FIREBASE_TOKEN);
    }
    catch (e) {
        console.error('Error when trying to deploy: ');
        console.error(e.message);
        return { success: false };
    }
    return { success: true };
}));
