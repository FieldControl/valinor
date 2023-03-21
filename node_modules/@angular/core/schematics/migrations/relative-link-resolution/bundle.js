var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve2, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve2(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// bazel-out/k8-fastbuild/bin/packages/core/schematics/migrations/relative-link-resolution/index.mjs
var relative_link_resolution_exports = {};
__export(relative_link_resolution_exports, {
  default: () => relative_link_resolution_default
});
module.exports = __toCommonJS(relative_link_resolution_exports);
var import_schematics = require("@angular-devkit/schematics");
var import_path2 = require("path");

// bazel-out/k8-fastbuild/bin/packages/core/schematics/utils/project_tsconfig_paths.mjs
var import_core = require("@angular-devkit/core");
function getProjectTsConfigPaths(tree) {
  return __async(this, null, function* () {
    const buildPaths = /* @__PURE__ */ new Set();
    const testPaths = /* @__PURE__ */ new Set();
    const workspace = yield getWorkspace(tree);
    for (const [, project] of workspace.projects) {
      for (const [name, target] of project.targets) {
        if (name !== "build" && name !== "test") {
          continue;
        }
        for (const [, options] of allTargetOptions(target)) {
          const tsConfig = options.tsConfig;
          if (typeof tsConfig !== "string" || !tree.exists(tsConfig)) {
            continue;
          }
          if (name === "build") {
            buildPaths.add((0, import_core.normalize)(tsConfig));
          } else {
            testPaths.add((0, import_core.normalize)(tsConfig));
          }
        }
      }
    }
    return {
      buildPaths: [...buildPaths],
      testPaths: [...testPaths]
    };
  });
}
function* allTargetOptions(target) {
  if (target.options) {
    yield [void 0, target.options];
  }
  if (!target.configurations) {
    return;
  }
  for (const [name, options] of Object.entries(target.configurations)) {
    if (options) {
      yield [name, options];
    }
  }
}
function createHost(tree) {
  return {
    readFile(path2) {
      return __async(this, null, function* () {
        const data = tree.read(path2);
        if (!data) {
          throw new Error("File not found.");
        }
        return import_core.virtualFs.fileBufferToString(data);
      });
    },
    writeFile(path2, data) {
      return __async(this, null, function* () {
        return tree.overwrite(path2, data);
      });
    },
    isDirectory(path2) {
      return __async(this, null, function* () {
        return !tree.exists(path2) && tree.getDir(path2).subfiles.length > 0;
      });
    },
    isFile(path2) {
      return __async(this, null, function* () {
        return tree.exists(path2);
      });
    }
  };
}
function getWorkspace(tree) {
  return __async(this, null, function* () {
    const host = createHost(tree);
    const { workspace } = yield import_core.workspaces.readWorkspace("/", host);
    return workspace;
  });
}

// bazel-out/k8-fastbuild/bin/packages/core/schematics/utils/typescript/compiler_host.mjs
var import_path = require("path");
var import_typescript2 = __toESM(require("typescript"), 1);

// bazel-out/k8-fastbuild/bin/packages/core/schematics/utils/typescript/parse_tsconfig.mjs
var path = __toESM(require("path"), 1);
var import_typescript = __toESM(require("typescript"), 1);
function parseTsconfigFile(tsconfigPath, basePath) {
  const { config } = import_typescript.default.readConfigFile(tsconfigPath, import_typescript.default.sys.readFile);
  const parseConfigHost = {
    useCaseSensitiveFileNames: import_typescript.default.sys.useCaseSensitiveFileNames,
    fileExists: import_typescript.default.sys.fileExists,
    readDirectory: import_typescript.default.sys.readDirectory,
    readFile: import_typescript.default.sys.readFile
  };
  if (!path.isAbsolute(basePath)) {
    throw Error("Unexpected relative base path has been specified.");
  }
  return import_typescript.default.parseJsonConfigFileContent(config, parseConfigHost, basePath, {});
}

// bazel-out/k8-fastbuild/bin/packages/core/schematics/utils/typescript/compiler_host.mjs
function createMigrationProgram(tree, tsconfigPath, basePath, fakeFileRead, additionalFiles) {
  const { rootNames, options, host } = createProgramOptions(tree, tsconfigPath, basePath, fakeFileRead, additionalFiles);
  return import_typescript2.default.createProgram(rootNames, options, host);
}
function createProgramOptions(tree, tsconfigPath, basePath, fakeFileRead, additionalFiles, optionOverrides) {
  tsconfigPath = (0, import_path.resolve)(basePath, tsconfigPath);
  const parsed = parseTsconfigFile(tsconfigPath, (0, import_path.dirname)(tsconfigPath));
  const options = optionOverrides ? __spreadValues(__spreadValues({}, parsed.options), optionOverrides) : parsed.options;
  const host = createMigrationCompilerHost(tree, options, basePath, fakeFileRead);
  return { rootNames: parsed.fileNames.concat(additionalFiles || []), options, host };
}
function createMigrationCompilerHost(tree, options, basePath, fakeRead) {
  const host = import_typescript2.default.createCompilerHost(options, true);
  const defaultReadFile = host.readFile;
  host.readFile = (fileName) => {
    var _a;
    const treeRelativePath = (0, import_path.relative)(basePath, fileName);
    let result = fakeRead == null ? void 0 : fakeRead(treeRelativePath);
    if (typeof result !== "string") {
      result = treeRelativePath.startsWith("..") ? defaultReadFile.call(host, fileName) : (_a = tree.read(treeRelativePath)) == null ? void 0 : _a.toString();
    }
    return typeof result === "string" ? result.replace(/^\uFEFF/, "") : void 0;
  };
  return host;
}
function canMigrateFile(basePath, sourceFile, program) {
  if (sourceFile.fileName.endsWith(".ngtypecheck.ts") || sourceFile.isDeclarationFile || program.isSourceFileFromExternalLibrary(sourceFile)) {
    return false;
  }
  return !(0, import_path.relative)(basePath, sourceFile.fileName).startsWith("..");
}

// bazel-out/k8-fastbuild/bin/packages/core/schematics/migrations/relative-link-resolution/util.mjs
var import_typescript3 = __toESM(require("typescript"), 1);
var relativeLinkResolution = "relativeLinkResolution";
var knownConfigValues = /* @__PURE__ */ new Set([`'legacy'`, `'corrected'`]);
function migrateFile(sourceFile, rewriteFn) {
  let rewrites = [];
  const usages = getUsages(sourceFile);
  for (const { objectLiteral, property } of usages) {
    const replacementNode = import_typescript3.default.factory.updateObjectLiteralExpression(objectLiteral, objectLiteral.properties.filter((prop) => prop !== property));
    const printer = import_typescript3.default.createPrinter();
    const replacementText = printer.printNode(import_typescript3.default.EmitHint.Unspecified, replacementNode, sourceFile);
    rewrites.push({
      startPos: objectLiteral.getStart(),
      width: objectLiteral.getWidth(),
      replacement: replacementText
    });
  }
  rewrites = sortByStartPosDescending(rewrites);
  for (const rewrite of rewrites) {
    rewriteFn(rewrite.startPos, rewrite.width, rewrite.replacement);
  }
}
function getUsages(sourceFile) {
  const usages = [];
  const visitNode = (node) => {
    if (import_typescript3.default.isObjectLiteralExpression(node)) {
      const property = node.properties.find((prop) => import_typescript3.default.isPropertyAssignment(prop) && import_typescript3.default.isIdentifier(prop.name) && prop.name.text === relativeLinkResolution && knownConfigValues.has(prop.initializer.getText()));
      if (property) {
        usages.push({ objectLiteral: node, property });
      }
    }
    import_typescript3.default.forEachChild(node, visitNode);
  };
  import_typescript3.default.forEachChild(sourceFile, visitNode);
  return usages;
}
function sortByStartPosDescending(rewrites) {
  return rewrites.sort((entityA, entityB) => entityB.startPos - entityA.startPos);
}

// bazel-out/k8-fastbuild/bin/packages/core/schematics/migrations/relative-link-resolution/index.mjs
function relative_link_resolution_default() {
  return (tree) => __async(this, null, function* () {
    const { buildPaths, testPaths } = yield getProjectTsConfigPaths(tree);
    const basePath = process.cwd();
    const allPaths = [...buildPaths, ...testPaths];
    if (!allPaths.length) {
      throw new import_schematics.SchematicsException("Could not find any tsconfig file. Cannot run a migration to cleanup the deprecated `relativeLinkResolution` config option.");
    }
    for (const tsconfigPath of allPaths) {
      runRelativeLinkResolutionMigration(tree, tsconfigPath, basePath);
    }
  });
}
function runRelativeLinkResolutionMigration(tree, tsconfigPath, basePath) {
  const program = createMigrationProgram(tree, tsconfigPath, basePath);
  const sourceFiles = program.getSourceFiles().filter((sourceFile) => canMigrateFile(basePath, sourceFile, program));
  for (const sourceFile of sourceFiles) {
    let update = null;
    const rewriter = (startPos, origLength, text) => {
      if (update === null) {
        update = tree.beginUpdate((0, import_path2.relative)(basePath, sourceFile.fileName));
      }
      update.remove(startPos, origLength);
      update.insertLeft(startPos, text);
    };
    migrateFile(sourceFile, rewriter);
    if (update !== null) {
      tree.commitUpdate(update);
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
//# sourceMappingURL=bundle.js.map
