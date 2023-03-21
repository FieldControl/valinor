"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionCommandModule = void 0;
const module_1 = __importDefault(require("module"));
const path_1 = require("path");
const command_module_1 = require("../../command-builder/command-module");
const color_1 = require("../../utilities/color");
/**
 * Major versions of Node.js that are officially supported by Angular.
 */
const SUPPORTED_NODE_MAJORS = [14, 16, 18];
const PACKAGE_PATTERNS = [
    /^@angular\/.*/,
    /^@angular-devkit\/.*/,
    /^@bazel\/.*/,
    /^@ngtools\/.*/,
    /^@nguniversal\/.*/,
    /^@schematics\/.*/,
    /^rxjs$/,
    /^typescript$/,
    /^ng-packagr$/,
    /^webpack$/,
];
class VersionCommandModule extends command_module_1.CommandModule {
    constructor() {
        super(...arguments);
        this.command = 'version';
        this.aliases = ['v'];
        this.describe = 'Outputs Angular CLI version.';
    }
    builder(localYargs) {
        return localYargs;
    }
    async run() {
        var _a;
        const { packageManager, logger, root } = this.context;
        const localRequire = module_1.default.createRequire((0, path_1.resolve)(__filename, '../../../'));
        // Trailing slash is used to allow the path to be treated as a directory
        const workspaceRequire = module_1.default.createRequire(root + '/');
        const cliPackage = localRequire('./package.json');
        let workspacePackage;
        try {
            workspacePackage = workspaceRequire('./package.json');
        }
        catch (_b) { }
        const [nodeMajor] = process.versions.node.split('.').map((part) => Number(part));
        const unsupportedNodeVersion = !SUPPORTED_NODE_MAJORS.includes(nodeMajor);
        const packageNames = new Set(Object.keys({
            ...cliPackage.dependencies,
            ...cliPackage.devDependencies,
            ...workspacePackage === null || workspacePackage === void 0 ? void 0 : workspacePackage.dependencies,
            ...workspacePackage === null || workspacePackage === void 0 ? void 0 : workspacePackage.devDependencies,
        }));
        const versions = {};
        for (const name of packageNames) {
            if (PACKAGE_PATTERNS.some((p) => p.test(name))) {
                versions[name] = this.getVersion(name, workspaceRequire, localRequire);
            }
        }
        const ngCliVersion = cliPackage.version;
        let angularCoreVersion = '';
        const angularSameAsCore = [];
        if (workspacePackage) {
            // Filter all angular versions that are the same as core.
            angularCoreVersion = versions['@angular/core'];
            if (angularCoreVersion) {
                for (const [name, version] of Object.entries(versions)) {
                    if (version === angularCoreVersion && name.startsWith('@angular/')) {
                        angularSameAsCore.push(name.replace(/^@angular\//, ''));
                        delete versions[name];
                    }
                }
                // Make sure we list them in alphabetical order.
                angularSameAsCore.sort();
            }
        }
        const namePad = ' '.repeat(Object.keys(versions).sort((a, b) => b.length - a.length)[0].length + 3);
        const asciiArt = `
     _                      _                 ____ _     ___
    / \\   _ __   __ _ _   _| | __ _ _ __     / ___| |   |_ _|
   / △ \\ | '_ \\ / _\` | | | | |/ _\` | '__|   | |   | |    | |
  / ___ \\| | | | (_| | |_| | | (_| | |      | |___| |___ | |
 /_/   \\_\\_| |_|\\__, |\\__,_|_|\\__,_|_|       \\____|_____|___|
                |___/
    `
            .split('\n')
            .map((x) => color_1.colors.red(x))
            .join('\n');
        logger.info(asciiArt);
        logger.info(`
      Angular CLI: ${ngCliVersion}
      Node: ${process.versions.node}${unsupportedNodeVersion ? ' (Unsupported)' : ''}
      Package Manager: ${packageManager.name} ${(_a = packageManager.version) !== null && _a !== void 0 ? _a : '<error>'}
      OS: ${process.platform} ${process.arch}

      Angular: ${angularCoreVersion}
      ... ${angularSameAsCore
            .reduce((acc, name) => {
            // Perform a simple word wrap around 60.
            if (acc.length == 0) {
                return [name];
            }
            const line = acc[acc.length - 1] + ', ' + name;
            if (line.length > 60) {
                acc.push(name);
            }
            else {
                acc[acc.length - 1] = line;
            }
            return acc;
        }, [])
            .join('\n... ')}

      Package${namePad.slice(7)}Version
      -------${namePad.replace(/ /g, '-')}------------------
      ${Object.keys(versions)
            .map((module) => `${module}${namePad.slice(module.length)}${versions[module]}`)
            .sort()
            .join('\n')}
    `.replace(/^ {6}/gm, ''));
        if (unsupportedNodeVersion) {
            logger.warn(`Warning: The current version of Node (${process.versions.node}) is not supported by Angular.`);
        }
    }
    getVersion(moduleName, workspaceRequire, localRequire) {
        let packageInfo;
        let cliOnly = false;
        // Try to find the package in the workspace
        try {
            packageInfo = workspaceRequire(`${moduleName}/package.json`);
        }
        catch (_a) { }
        // If not found, try to find within the CLI
        if (!packageInfo) {
            try {
                packageInfo = localRequire(`${moduleName}/package.json`);
                cliOnly = true;
            }
            catch (_b) { }
        }
        // If found, attempt to get the version
        if (packageInfo) {
            try {
                return packageInfo.version + (cliOnly ? ' (cli-only)' : '');
            }
            catch (_c) { }
        }
        return '<error>';
    }
}
exports.VersionCommandModule = VersionCommandModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5ndWxhci9jbGkvc3JjL2NvbW1hbmRzL3ZlcnNpb24vY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7Ozs7OztBQUVILG9EQUFnQztBQUNoQywrQkFBK0I7QUFFL0IseUVBQWtHO0FBQ2xHLGlEQUErQztBQVMvQzs7R0FFRztBQUNILE1BQU0scUJBQXFCLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBRTNDLE1BQU0sZ0JBQWdCLEdBQUc7SUFDdkIsZUFBZTtJQUNmLHNCQUFzQjtJQUN0QixhQUFhO0lBQ2IsZUFBZTtJQUNmLG1CQUFtQjtJQUNuQixrQkFBa0I7SUFDbEIsUUFBUTtJQUNSLGNBQWM7SUFDZCxjQUFjO0lBQ2QsV0FBVztDQUNaLENBQUM7QUFFRixNQUFhLG9CQUFxQixTQUFRLDhCQUFhO0lBQXZEOztRQUNFLFlBQU8sR0FBRyxTQUFTLENBQUM7UUFDcEIsWUFBTyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDaEIsYUFBUSxHQUFHLDhCQUE4QixDQUFDO0lBaUo1QyxDQUFDO0lBOUlDLE9BQU8sQ0FBQyxVQUFnQjtRQUN0QixPQUFPLFVBQVUsQ0FBQztJQUNwQixDQUFDO0lBRUQsS0FBSyxDQUFDLEdBQUc7O1FBQ1AsTUFBTSxFQUFFLGNBQWMsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUN0RCxNQUFNLFlBQVksR0FBRyxnQkFBVSxDQUFDLGFBQWEsQ0FBQyxJQUFBLGNBQU8sRUFBQyxVQUFVLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUNoRix3RUFBd0U7UUFDeEUsTUFBTSxnQkFBZ0IsR0FBRyxnQkFBVSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7UUFF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QWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCBub2RlTW9kdWxlIGZyb20gJ21vZHVsZSc7XG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBBcmd2IH0gZnJvbSAneWFyZ3MnO1xuaW1wb3J0IHsgQ29tbWFuZE1vZHVsZSwgQ29tbWFuZE1vZHVsZUltcGxlbWVudGF0aW9uIH0gZnJvbSAnLi4vLi4vY29tbWFuZC1idWlsZGVyL2NvbW1hbmQtbW9kdWxlJztcbmltcG9ydCB7IGNvbG9ycyB9IGZyb20gJy4uLy4uL3V0aWxpdGllcy9jb2xvcic7XG5cbmludGVyZmFjZSBQYXJ0aWFsUGFja2FnZUluZm8ge1xuICBuYW1lOiBzdHJpbmc7XG4gIHZlcnNpb246IHN0cmluZztcbiAgZGVwZW5kZW5jaWVzPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbiAgZGV2RGVwZW5kZW5jaWVzPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbn1cblxuLyoqXG4gKiBNYWpvciB2ZXJzaW9ucyBvZiBOb2RlLmpzIHRoYXQgYXJlIG9mZmljaWFsbHkgc3VwcG9ydGVkIGJ5IEFuZ3VsYXIuXG4gKi9cbmNvbnN0IFNVUFBPUlRFRF9OT0RFX01BSk9SUyA9IFsxNCwgMTYsIDE4XTtcblxuY29uc3QgUEFDS0FHRV9QQVRURVJOUyA9IFtcbiAgL15AYW5ndWxhclxcLy4qLyxcbiAgL15AYW5ndWxhci1kZXZraXRcXC8uKi8sXG4gIC9eQGJhemVsXFwvLiovLFxuICAvXkBuZ3Rvb2xzXFwvLiovLFxuICAvXkBuZ3VuaXZlcnNhbFxcLy4qLyxcbiAgL15Ac2NoZW1hdGljc1xcLy4qLyxcbiAgL15yeGpzJC8sXG4gIC9edHlwZXNjcmlwdCQvLFxuICAvXm5nLXBhY2thZ3IkLyxcbiAgL153ZWJwYWNrJC8sXG5dO1xuXG5leHBvcnQgY2xhc3MgVmVyc2lvbkNvbW1hbmRNb2R1bGUgZXh0ZW5kcyBDb21tYW5kTW9kdWxlIGltcGxlbWVudHMgQ29tbWFuZE1vZHVsZUltcGxlbWVudGF0aW9uIHtcbiAgY29tbWFuZCA9ICd2ZXJzaW9uJztcbiAgYWxpYXNlcyA9IFsndiddO1xuICBkZXNjcmliZSA9ICdPdXRwdXRzIEFuZ3VsYXIgQ0xJIHZlcnNpb24uJztcbiAgbG9uZ0Rlc2NyaXB0aW9uUGF0aD86IHN0cmluZyB8IHVuZGVmaW5lZDtcblxuICBidWlsZGVyKGxvY2FsWWFyZ3M6IEFyZ3YpOiBBcmd2IHtcbiAgICByZXR1cm4gbG9jYWxZYXJncztcbiAgfVxuXG4gIGFzeW5jIHJ1bigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCB7IHBhY2thZ2VNYW5hZ2VyLCBsb2dnZXIsIHJvb3QgfSA9IHRoaXMuY29udGV4dDtcbiAgICBjb25zdCBsb2NhbFJlcXVpcmUgPSBub2RlTW9kdWxlLmNyZWF0ZVJlcXVpcmUocmVzb2x2ZShfX2ZpbGVuYW1lLCAnLi4vLi4vLi4vJykpO1xuICAgIC8vIFRyYWlsaW5nIHNsYXNoIGlzIHVzZWQgdG8gYWxsb3cgdGhlIHBhdGggdG8gYmUgdHJlYXRlZCBhcyBhIGRpcmVjdG9yeVxuICAgIGNvbnN0IHdvcmtzcGFjZVJlcXVpcmUgPSBub2RlTW9kdWxlLmNyZWF0ZVJlcXVpcmUocm9vdCArICcvJyk7XG5cbiAgICBjb25zdCBjbGlQYWNrYWdlOiBQYXJ0aWFsUGFja2FnZUluZm8gPSBsb2NhbFJlcXVpcmUoJy4vcGFja2FnZS5qc29uJyk7XG4gICAgbGV0IHdvcmtzcGFjZVBhY2thZ2U6IFBhcnRpYWxQYWNrYWdlSW5mbyB8IHVuZGVmaW5lZDtcbiAgICB0cnkge1xuICAgICAgd29ya3NwYWNlUGFja2FnZSA9IHdvcmtzcGFjZVJlcXVpcmUoJy4vcGFja2FnZS5qc29uJyk7XG4gICAgfSBjYXRjaCB7fVxuXG4gICAgY29uc3QgW25vZGVNYWpvcl0gPSBwcm9jZXNzLnZlcnNpb25zLm5vZGUuc3BsaXQoJy4nKS5tYXAoKHBhcnQpID0+IE51bWJlcihwYXJ0KSk7XG4gICAgY29uc3QgdW5zdXBwb3J0ZWROb2RlVmVyc2lvbiA9ICFTVVBQT1JURURfTk9ERV9NQUpPUlMuaW5jbHVkZXMobm9kZU1ham9yKTtcblxuICAgIGNvbnN0IHBhY2thZ2VOYW1lcyA9IG5ldyBTZXQoXG4gICAgICBPYmplY3Qua2V5cyh7XG4gICAgICAgIC4uLmNsaVBhY2thZ2UuZGVwZW5kZW5jaWVzLFxuICAgICAgICAuLi5jbGlQYWNrYWdlLmRldkRlcGVuZGVuY2llcyxcbiAgICAgICAgLi4ud29ya3NwYWNlUGFja2FnZT8uZGVwZW5kZW5jaWVzLFxuICAgICAgICAuLi53b3Jrc3BhY2VQYWNrYWdlPy5kZXZEZXBlbmRlbmNpZXMsXG4gICAgICB9KSxcbiAgICApO1xuXG4gICAgY29uc3QgdmVyc2lvbnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcbiAgICBmb3IgKGNvbnN0IG5hbWUgb2YgcGFja2FnZU5hbWVzKSB7XG4gICAgICBpZiAoUEFDS0FHRV9QQVRURVJOUy5zb21lKChwKSA9PiBwLnRlc3QobmFtZSkpKSB7XG4gICAgICAgIHZlcnNpb25zW25hbWVdID0gdGhpcy5nZXRWZXJzaW9uKG5hbWUsIHdvcmtzcGFjZVJlcXVpcmUsIGxvY2FsUmVxdWlyZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgbmdDbGlWZXJzaW9uID0gY2xpUGFja2FnZS52ZXJzaW9uO1xuICAgIGxldCBhbmd1bGFyQ29yZVZlcnNpb24gPSAnJztcbiAgICBjb25zdCBhbmd1bGFyU2FtZUFzQ29yZTogc3RyaW5nW10gPSBbXTtcblxuICAgIGlmICh3b3Jrc3BhY2VQYWNrYWdlKSB7XG4gICAgICAvLyBGaWx0ZXIgYWxsIGFuZ3VsYXIgdmVyc2lvbnMgdGhhdCBhcmUgdGhlIHNhbWUgYXMgY29yZS5cbiAgICAgIGFuZ3VsYXJDb3JlVmVyc2lvbiA9IHZlcnNpb25zWydAYW5ndWxhci9jb3JlJ107XG4gICAgICBpZiAoYW5ndWxhckNvcmVWZXJzaW9uKSB7XG4gICAgICAgIGZvciAoY29uc3QgW25hbWUsIHZlcnNpb25dIG9mIE9iamVjdC5lbnRyaWVzKHZlcnNpb25zKSkge1xuICAgICAgICAgIGlmICh2ZXJzaW9uID09PSBhbmd1bGFyQ29yZVZlcnNpb24gJiYgbmFtZS5zdGFydHNXaXRoKCdAYW5ndWxhci8nKSkge1xuICAgICAgICAgICAgYW5ndWxhclNhbWVBc0NvcmUucHVzaChuYW1lLnJlcGxhY2UoL15AYW5ndWxhclxcLy8sICcnKSk7XG4gICAgICAgICAgICBkZWxldGUgdmVyc2lvbnNbbmFtZV07XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gTWFrZSBzdXJlIHdlIGxpc3QgdGhlbSBpbiBhbHBoYWJldGljYWwgb3JkZXIuXG4gICAgICAgIGFuZ3VsYXJTYW1lQXNDb3JlLnNvcnQoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBuYW1lUGFkID0gJyAnLnJlcGVhdChcbiAgICAgIE9iamVjdC5rZXlzKHZlcnNpb25zKS5zb3J0KChhLCBiKSA9PiBiLmxlbmd0aCAtIGEubGVuZ3RoKVswXS5sZW5ndGggKyAzLFxuICAgICk7XG4gICAgY29uc3QgYXNjaWlBcnQgPSBgXG4gICAgIF8gICAgICAgICAgICAgICAgICAgICAgXyAgICAgICAgICAgICAgICAgX19fXyBfICAgICBfX19cbiAgICAvIFxcXFwgICBfIF9fICAgX18gXyBfICAgX3wgfCBfXyBfIF8gX18gICAgIC8gX19ffCB8ICAgfF8gX3xcbiAgIC8g4pazIFxcXFwgfCAnXyBcXFxcIC8gX1xcYCB8IHwgfCB8IHwvIF9cXGAgfCAnX198ICAgfCB8ICAgfCB8ICAgIHwgfFxuICAvIF9fXyBcXFxcfCB8IHwgfCAoX3wgfCB8X3wgfCB8IChffCB8IHwgICAgICB8IHxfX198IHxfX18gfCB8XG4gL18vICAgXFxcXF9cXFxcX3wgfF98XFxcXF9fLCB8XFxcXF9fLF98X3xcXFxcX18sX3xffCAgICAgICBcXFxcX19fX3xfX19fX3xfX198XG4gICAgICAgICAgICAgICAgfF9fXy9cbiAgICBgXG4gICAgICAuc3BsaXQoJ1xcbicpXG4gICAgICAubWFwKCh4KSA9PiBjb2xvcnMucmVkKHgpKVxuICAgICAgLmpvaW4oJ1xcbicpO1xuXG4gICAgbG9nZ2VyLmluZm8oYXNjaWlBcnQpO1xuICAgIGxvZ2dlci5pbmZvKFxuICAgICAgYFxuICAgICAgQW5ndWxhciBDTEk6ICR7bmdDbGlWZXJzaW9ufVxuICAgICAgTm9kZTogJHtwcm9jZXNzLnZlcnNpb25zLm5vZGV9JHt1bnN1cHBvcnRlZE5vZGVWZXJzaW9uID8gJyAoVW5zdXBwb3J0ZWQpJyA6ICcnfVxuICAgICAgUGFja2FnZSBNYW5hZ2VyOiAke3BhY2thZ2VNYW5hZ2VyLm5hbWV9ICR7cGFja2FnZU1hbmFnZXIudmVyc2lvbiA/PyAnPGVycm9yPid9XG4gICAgICBPUzogJHtwcm9jZXNzLnBsYXRmb3JtfSAke3Byb2Nlc3MuYXJjaH1cblxuICAgICAgQW5ndWxhcjogJHthbmd1bGFyQ29yZVZlcnNpb259XG4gICAgICAuLi4gJHthbmd1bGFyU2FtZUFzQ29yZVxuICAgICAgICAucmVkdWNlPHN0cmluZ1tdPigoYWNjLCBuYW1lKSA9PiB7XG4gICAgICAgICAgLy8gUGVyZm9ybSBhIHNpbXBsZSB3b3JkIHdyYXAgYXJvdW5kIDYwLlxuICAgICAgICAgIGlmIChhY2MubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBbbmFtZV07XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IGxpbmUgPSBhY2NbYWNjLmxlbmd0aCAtIDFdICsgJywgJyArIG5hbWU7XG4gICAgICAgICAgaWYgKGxpbmUubGVuZ3RoID4gNjApIHtcbiAgICAgICAgICAgIGFjYy5wdXNoKG5hbWUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhY2NbYWNjLmxlbmd0aCAtIDFdID0gbGluZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gYWNjO1xuICAgICAgICB9LCBbXSlcbiAgICAgICAgLmpvaW4oJ1xcbi4uLiAnKX1cblxuICAgICAgUGFja2FnZSR7bmFtZVBhZC5zbGljZSg3KX1WZXJzaW9uXG4gICAgICAtLS0tLS0tJHtuYW1lUGFkLnJlcGxhY2UoLyAvZywgJy0nKX0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICR7T2JqZWN0LmtleXModmVyc2lvbnMpXG4gICAgICAgIC5tYXAoKG1vZHVsZSkgPT4gYCR7bW9kdWxlfSR7bmFtZVBhZC5zbGljZShtb2R1bGUubGVuZ3RoKX0ke3ZlcnNpb25zW21vZHVsZV19YClcbiAgICAgICAgLnNvcnQoKVxuICAgICAgICAuam9pbignXFxuJyl9XG4gICAgYC5yZXBsYWNlKC9eIHs2fS9nbSwgJycpLFxuICAgICk7XG5cbiAgICBpZiAodW5zdXBwb3J0ZWROb2RlVmVyc2lvbikge1xuICAgICAgbG9nZ2VyLndhcm4oXG4gICAgICAgIGBXYXJuaW5nOiBUaGUgY3VycmVudCB2ZXJzaW9uIG9mIE5vZGUgKCR7cHJvY2Vzcy52ZXJzaW9ucy5ub2RlfSkgaXMgbm90IHN1cHBvcnRlZCBieSBBbmd1bGFyLmAsXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZ2V0VmVyc2lvbihcbiAgICBtb2R1bGVOYW1lOiBzdHJpbmcsXG4gICAgd29ya3NwYWNlUmVxdWlyZTogTm9kZVJlcXVpcmUsXG4gICAgbG9jYWxSZXF1aXJlOiBOb2RlUmVxdWlyZSxcbiAgKTogc3RyaW5nIHtcbiAgICBsZXQgcGFja2FnZUluZm86IFBhcnRpYWxQYWNrYWdlSW5mbyB8IHVuZGVmaW5lZDtcbiAgICBsZXQgY2xpT25seSA9IGZhbHNlO1xuXG4gICAgLy8gVHJ5IHRvIGZpbmQgdGhlIHBhY2thZ2UgaW4gdGhlIHdvcmtzcGFjZVxuICAgIHRyeSB7XG4gICAgICBwYWNrYWdlSW5mbyA9IHdvcmtzcGFjZVJlcXVpcmUoYCR7bW9kdWxlTmFtZX0vcGFja2FnZS5qc29uYCk7XG4gICAgfSBjYXRjaCB7fVxuXG4gICAgLy8gSWYgbm90IGZvdW5kLCB0cnkgdG8gZmluZCB3aXRoaW4gdGhlIENMSVxuICAgIGlmICghcGFja2FnZUluZm8pIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHBhY2thZ2VJbmZvID0gbG9jYWxSZXF1aXJlKGAke21vZHVsZU5hbWV9L3BhY2thZ2UuanNvbmApO1xuICAgICAgICBjbGlPbmx5ID0gdHJ1ZTtcbiAgICAgIH0gY2F0Y2gge31cbiAgICB9XG5cbiAgICAvLyBJZiBmb3VuZCwgYXR0ZW1wdCB0byBnZXQgdGhlIHZlcnNpb25cbiAgICBpZiAocGFja2FnZUluZm8pIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBwYWNrYWdlSW5mby52ZXJzaW9uICsgKGNsaU9ubHkgPyAnIChjbGktb25seSknIDogJycpO1xuICAgICAgfSBjYXRjaCB7fVxuICAgIH1cblxuICAgIHJldHVybiAnPGVycm9yPic7XG4gIH1cbn1cbiJdfQ==