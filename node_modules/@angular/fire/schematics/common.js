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
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDependencies = exports.safeReadJSON = exports.generateFirebaseRc = exports.overwriteIfExists = exports.stringifyFormatted = exports.shortSiteName = void 0;
const schematics_1 = require("@angular-devkit/schematics");
const semver = __importStar(require("semver"));
const shortSiteName = (site) => (site === null || site === void 0 ? void 0 : site.name) && site.name.split('/').pop();
exports.shortSiteName = shortSiteName;
const stringifyFormatted = (obj) => JSON.stringify(obj, null, 2);
exports.stringifyFormatted = stringifyFormatted;
const overwriteIfExists = (tree, path, content) => {
    if (tree.exists(path)) {
        tree.overwrite(path, content);
    }
    else {
        tree.create(path, content);
    }
};
exports.overwriteIfExists = overwriteIfExists;
function emptyFirebaseRc() {
    return {
        targets: {}
    };
}
function generateFirebaseRcTarget(firebaseProject, firebaseHostingSite, project) {
    var _a;
    return {
        hosting: {
            [project]: [
                (_a = exports.shortSiteName(firebaseHostingSite)) !== null && _a !== void 0 ? _a : firebaseProject
            ]
        }
    };
}
function generateFirebaseRc(tree, path, firebaseProject, firebaseHostingSite, project) {
    const firebaseRc = tree.exists(path)
        ? safeReadJSON(path, tree)
        : emptyFirebaseRc();
    firebaseRc.targets = firebaseRc.targets || {};
    firebaseRc.targets[firebaseProject] = generateFirebaseRcTarget(firebaseProject, firebaseHostingSite, project);
    firebaseRc.projects = { default: firebaseProject };
    exports.overwriteIfExists(tree, path, exports.stringifyFormatted(firebaseRc));
}
exports.generateFirebaseRc = generateFirebaseRc;
function safeReadJSON(path, tree) {
    try {
        return JSON.parse(tree.read(path).toString());
    }
    catch (e) {
        throw new schematics_1.SchematicsException(`Error when parsing ${path}: ${e.message}`);
    }
}
exports.safeReadJSON = safeReadJSON;
const addDependencies = (host, deps, context) => {
    var _a, _b;
    const packageJson = host.exists('package.json') && safeReadJSON('package.json', host);
    if (packageJson === undefined) {
        throw new schematics_1.SchematicsException('Could not locate package.json');
    }
    (_a = packageJson.devDependencies) !== null && _a !== void 0 ? _a : (packageJson.devDependencies = {});
    (_b = packageJson.dependencies) !== null && _b !== void 0 ? _b : (packageJson.dependencies = {});
    Object.keys(deps).forEach(depName => {
        const dep = deps[depName];
        const existingDeps = dep.dev ? packageJson.devDependencies : packageJson.dependencies;
        const existingVersion = existingDeps[depName];
        if (existingVersion) {
            try {
                if (!semver.intersects(existingVersion, dep.version)) {
                    context.logger.warn(`⚠️ The ${depName} devDependency specified in your package.json (${existingVersion}) does not fulfill AngularFire's dependency (${dep.version})`);
                }
            }
            catch (e) {
                if (existingVersion !== dep.version) {
                    context.logger.warn(`⚠️ The ${depName} devDependency specified in your package.json (${existingVersion}) does not fulfill AngularFire's dependency (${dep.version})`);
                }
            }
        }
        else {
            existingDeps[depName] = dep.version;
        }
    });
    exports.overwriteIfExists(host, 'package.json', exports.stringifyFormatted(packageJson));
};
exports.addDependencies = addDependencies;
