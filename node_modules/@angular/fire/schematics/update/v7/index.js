"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ngUpdate = void 0;
const schematics_1 = require("@angular-devkit/schematics");
const tasks_1 = require("@angular-devkit/schematics/tasks");
const common_1 = require("../../common");
const versions_json_1 = require("../../versions.json");
const path_1 = require("path");
const IMPORT_REGEX = /(?<key>import|export)\s+(?:(?<alias>[\w,{}\s\*]+)\s+from)?\s*(?:(?<quote>["'])?(?<ref>[@\w\s\\\/.-]+)\3?)\s*(?<term>[;\n])/g;
const ngUpdate = () => (host, context) => {
    const packageJson = host.exists('package.json') && common_1.safeReadJSON('package.json', host);
    if (packageJson === undefined) {
        throw new schematics_1.SchematicsException('Could not locate package.json');
    }
    Object.keys(versions_json_1.peerDependencies).forEach(depName => {
        const dep = versions_json_1.peerDependencies[depName];
        if (dep) {
            packageJson[dep.dev ? 'devDependencies' : 'dependencies'][depName] = dep.version;
        }
    });
    Object.keys(versions_json_1.firebaseFunctionsDependencies).forEach(depName => {
        const dep = versions_json_1.firebaseFunctionsDependencies[depName];
        if (dep.dev && packageJson.devDependencies[depName]) {
            packageJson.devDependencies[depName] = dep.version;
        }
        else if (packageJson.dependencies[depName]) {
            packageJson.dependencies[depName] = dep.version;
        }
    });
    common_1.overwriteIfExists(host, 'package.json', common_1.stringifyFormatted(packageJson));
    context.addTask(new tasks_1.NodePackageInstallTask());
    const angularJson = host.exists('angular.json') && common_1.safeReadJSON('angular.json', host);
    if (packageJson === undefined) {
        throw new schematics_1.SchematicsException('Could not locate angular.json');
    }
    const srcRoots = Object.values(angularJson.projects).map((it) => path_1.join(...['/', it.root, it.sourceRoot].filter(it => !!it)));
    host.visit(filePath => {
        var _a;
        if (!filePath.endsWith('.ts') ||
            filePath.endsWith('.d.ts') ||
            !srcRoots.find(root => filePath.startsWith(root))) {
            return;
        }
        const content = (_a = host.read(filePath)) === null || _a === void 0 ? void 0 : _a.toString();
        if (!content) {
            return;
        }
        const newContent = content.replace(IMPORT_REGEX, (substring, ...args) => {
            const { alias, key, ref, quote, term } = args.pop();
            if (ref.startsWith('@angular/fire') && !ref.startsWith('@angular/fire/compat')) {
                return `${key} ${alias} from ${quote}${ref.replace('@angular/fire', '@angular/fire/compat')}${quote}${term}`;
            }
            if (ref.startsWith('firebase') && !ref.startsWith('firebase/compat')) {
                return `${key} ${alias} from ${quote}${ref.replace('firebase', 'firebase/compat')}${quote}${term}`;
            }
            if (ref.startsWith('@firebase')) {
                return `${key} ${alias} from ${quote}${ref.replace('@firebase', 'firebase')}${quote}${term}`;
            }
            return substring;
        });
        if (content !== newContent) {
            common_1.overwriteIfExists(host, filePath, newContent);
        }
    });
    return host;
};
exports.ngUpdate = ngUpdate;
