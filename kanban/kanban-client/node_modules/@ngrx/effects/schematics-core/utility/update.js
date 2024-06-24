"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePackage = void 0;
var schematics_1 = require("@angular-devkit/schematics");
function updatePackage(name) {
    return function (tree, context) {
        var pkgPath = '/package.json';
        var buffer = tree.read(pkgPath);
        if (buffer === null) {
            throw new schematics_1.SchematicsException('Could not read package.json');
        }
        var content = buffer.toString();
        var pkg = JSON.parse(content);
        if (pkg === null || typeof pkg !== 'object' || Array.isArray(pkg)) {
            throw new schematics_1.SchematicsException('Error reading package.json');
        }
        var dependencyCategories = ['dependencies', 'devDependencies'];
        dependencyCategories.forEach(function (category) {
            var packageName = "@ngrx/".concat(name);
            if (pkg[category] && pkg[category][packageName]) {
                var firstChar = pkg[category][packageName][0];
                var suffix = match(firstChar, '^') || match(firstChar, '~');
                pkg[category][packageName] = "".concat(suffix, "6.0.0");
            }
        });
        tree.overwrite(pkgPath, JSON.stringify(pkg, null, 2));
        return tree;
    };
}
exports.updatePackage = updatePackage;
function match(value, test) {
    return value === test ? test : '';
}
//# sourceMappingURL=update.js.map