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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deployToCloudRun = exports.deployToFunction = void 0;
const architect_1 = require("@angular-devkit/architect");
const fs_1 = require("fs");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const child_process_1 = require("child_process");
const functions_templates_1 = require("./functions-templates");
const semver_1 = require("semver");
const open_1 = __importDefault(require("open"));
const schematics_1 = require("@angular-devkit/schematics");
const versions_json_1 = require("../versions.json");
const winston = __importStar(require("winston"));
const triple_beam_1 = __importDefault(require("triple-beam"));
const inquirer = __importStar(require("inquirer"));
const DEFAULT_EMULATOR_PORT = 5000;
const DEFAULT_EMULATOR_HOST = 'localhost';
const DEFAULT_CLOUD_RUN_OPTIONS = {
    memory: '1Gi',
    timeout: 60,
    maxInstances: 'default',
    maxConcurrency: 'default',
    minInstances: 'default',
    cpus: 1,
};
const spawnAsync = (command, options) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        const [spawnCommand, ...args] = command.split(/\s+/);
        const spawnProcess = child_process_1.spawn(spawnCommand, args, options);
        const chunks = [];
        const errorChunks = [];
        spawnProcess.stdout.on('data', (data) => {
            process.stdout.write(data.toString());
            chunks.push(data);
        });
        spawnProcess.stderr.on('data', (data) => {
            process.stderr.write(data.toString());
            errorChunks.push(data);
        });
        spawnProcess.on('error', (error) => {
            reject(error);
        });
        spawnProcess.on('close', (code) => {
            if (code === 1) {
                reject(Buffer.concat(errorChunks).toString());
                return;
            }
            resolve(Buffer.concat(chunks));
        });
    });
});
const escapeRegExp = (str) => str.replace(/[\-\[\]\/{}()*+?.\\^$|]/g, '\\$&');
const moveSync = (src, dest) => {
    fs_extra_1.copySync(src, dest);
    fs_extra_1.removeSync(src);
};
const deployToHosting = (firebaseTools, context, workspaceRoot, options, firebaseToken) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const siteTarget = (_a = options.target) !== null && _a !== void 0 ? _a : context.target.project;
    if (options.preview) {
        yield firebaseTools.serve({
            port: DEFAULT_EMULATOR_PORT,
            host: DEFAULT_EMULATOR_HOST,
            targets: [`hosting:${siteTarget}`],
            nonInteractive: true,
            projectRoot: workspaceRoot,
        });
        const { deployProject } = yield inquirer.prompt({
            type: 'confirm',
            name: 'deployProject',
            message: 'Would you like to deploy your application to Firebase Hosting?'
        });
        if (!deployProject) {
            return;
        }
    }
    return yield firebaseTools.deploy({
        only: `hosting:${siteTarget}`,
        cwd: workspaceRoot,
        token: firebaseToken,
        nonInteractive: true,
        projectRoot: workspaceRoot,
    });
});
const defaultFsHost = {
    moveSync,
    writeFileSync: fs_1.writeFileSync,
    renameSync: fs_1.renameSync,
    copySync: fs_extra_1.copySync,
    removeSync: fs_extra_1.removeSync,
    existsSync: fs_1.existsSync,
};
const findPackageVersion = (packageManager, name) => {
    const match = child_process_1.execSync(`${packageManager} list ${name}`).toString().match(`[^|\s]${escapeRegExp(name)}[@| ][^\s]+(\s.+)?$`);
    return match ? match[0].split(new RegExp(`${escapeRegExp(name)}[@| ]`))[1].split(/\s/)[0] : null;
};
const getPackageJson = (context, workspaceRoot, options, main) => {
    var _a, _b, _c, _d, _e;
    const dependencies = {};
    const devDependencies = {};
    if (options.ssr !== 'cloud-run') {
        Object.keys(versions_json_1.firebaseFunctionsDependencies).forEach(name => {
            const { version, dev } = versions_json_1.firebaseFunctionsDependencies[name];
            (dev ? devDependencies : dependencies)[name] = version;
        });
    }
    if (fs_1.existsSync(path_1.join(workspaceRoot, 'angular.json'))) {
        const angularJson = JSON.parse(fs_1.readFileSync(path_1.join(workspaceRoot, 'angular.json')).toString());
        const packageManager = (_b = (_a = angularJson.cli) === null || _a === void 0 ? void 0 : _a.packageManager) !== null && _b !== void 0 ? _b : 'npm';
        const server = angularJson.projects[context.target.project].architect.server;
        const externalDependencies = ((_c = server === null || server === void 0 ? void 0 : server.options) === null || _c === void 0 ? void 0 : _c.externalDependencies) || [];
        const bundleDependencies = (_e = (_d = server === null || server === void 0 ? void 0 : server.options) === null || _d === void 0 ? void 0 : _d.bundleDependencies) !== null && _e !== void 0 ? _e : true;
        if (bundleDependencies) {
            externalDependencies.forEach(externalDependency => {
                const packageVersion = findPackageVersion(packageManager, externalDependency);
                if (packageVersion) {
                    dependencies[externalDependency] = packageVersion;
                }
            });
        }
        else {
            if (fs_1.existsSync(path_1.join(workspaceRoot, 'package.json'))) {
                const packageJson = JSON.parse(fs_1.readFileSync(path_1.join(workspaceRoot, 'package.json')).toString());
                Object.keys(packageJson.dependencies).forEach((dependency) => {
                    dependencies[dependency] = packageJson.dependencies[dependency];
                });
            }
        }
    }
    return functions_templates_1.defaultPackage(dependencies, devDependencies, options, main);
};
const deployToFunction = (firebaseTools, context, workspaceRoot, staticBuildTarget, serverBuildTarget, options, firebaseToken, fsHost = defaultFsHost) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const staticBuildOptions = yield context.getTargetOptions(architect_1.targetFromTargetString(staticBuildTarget.name));
    if (!staticBuildOptions.outputPath || typeof staticBuildOptions.outputPath !== 'string') {
        throw new Error(`Cannot read the output path option of the Angular project '${staticBuildTarget.name}' in angular.json`);
    }
    const serverBuildOptions = yield context.getTargetOptions(architect_1.targetFromTargetString(serverBuildTarget.name));
    if (!serverBuildOptions.outputPath || typeof serverBuildOptions.outputPath !== 'string') {
        throw new Error(`Cannot read the output path option of the Angular project '${serverBuildTarget.name}' in angular.json`);
    }
    const staticOut = path_1.join(workspaceRoot, staticBuildOptions.outputPath);
    const serverOut = path_1.join(workspaceRoot, serverBuildOptions.outputPath);
    const functionsOut = options.outputPath ? path_1.join(workspaceRoot, options.outputPath) : path_1.dirname(serverOut);
    const functionName = options.functionName || functions_templates_1.DEFAULT_FUNCTION_NAME;
    const newStaticOut = path_1.join(functionsOut, staticBuildOptions.outputPath);
    const newServerOut = path_1.join(functionsOut, serverBuildOptions.outputPath);
    if (options.outputPath) {
        fsHost.removeSync(functionsOut);
        fsHost.copySync(staticOut, newStaticOut);
        fsHost.copySync(serverOut, newServerOut);
    }
    else {
        fsHost.moveSync(staticOut, newStaticOut);
        fsHost.moveSync(serverOut, newServerOut);
    }
    const packageJson = getPackageJson(context, workspaceRoot, options);
    const nodeVersion = packageJson.engines.node;
    if (!semver_1.satisfies(process.versions.node, nodeVersion.toString())) {
        context.logger.warn(`⚠️ Your Node.js version (${process.versions.node}) does not match the Firebase Functions runtime (${nodeVersion}).`);
    }
    const functionsPackageJsonPath = path_1.join(functionsOut, 'package.json');
    fsHost.writeFileSync(functionsPackageJsonPath, JSON.stringify(packageJson, null, 2));
    if (options.CF3v2) {
        fsHost.writeFileSync(path_1.join(functionsOut, 'index.js'), functions_templates_1.functionGen2(serverBuildOptions.outputPath, options, functionName));
    }
    else {
        fsHost.writeFileSync(path_1.join(functionsOut, 'index.js'), functions_templates_1.defaultFunction(serverBuildOptions.outputPath, options, functionName));
    }
    if (!options.prerender) {
        try {
            fsHost.renameSync(path_1.join(newStaticOut, 'index.html'), path_1.join(newStaticOut, 'index.original.html'));
        }
        catch (e) { }
    }
    const siteTarget = (_b = options.target) !== null && _b !== void 0 ? _b : context.target.project;
    if (fsHost.existsSync(functionsPackageJsonPath)) {
        child_process_1.execSync(`npm --prefix ${functionsOut} install`);
    }
    else {
        console.error(`No package.json exists at ${functionsOut}`);
    }
    if (options.preview) {
        yield firebaseTools.serve({
            port: DEFAULT_EMULATOR_PORT,
            host: DEFAULT_EMULATOR_HOST,
            targets: [`hosting:${siteTarget}`, `functions:${functionName}`],
            nonInteractive: true,
            projectRoot: workspaceRoot,
        });
        const { deployProject } = yield inquirer.prompt({
            type: 'confirm',
            name: 'deployProject',
            message: 'Would you like to deploy your application to Firebase Hosting & Cloud Functions?'
        });
        if (!deployProject) {
            return;
        }
    }
    return yield firebaseTools.deploy({
        only: `hosting:${siteTarget},functions:${functionName}`,
        cwd: workspaceRoot,
        token: firebaseToken,
        nonInteractive: true,
        projectRoot: workspaceRoot,
    });
});
exports.deployToFunction = deployToFunction;
const deployToCloudRun = (firebaseTools, context, workspaceRoot, staticBuildTarget, serverBuildTarget, options, firebaseToken, fsHost = defaultFsHost) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const staticBuildOptions = yield context.getTargetOptions(architect_1.targetFromTargetString(staticBuildTarget.name));
    if (!staticBuildOptions.outputPath || typeof staticBuildOptions.outputPath !== 'string') {
        throw new Error(`Cannot read the output path option of the Angular project '${staticBuildTarget.name}' in angular.json`);
    }
    const serverBuildOptions = yield context.getTargetOptions(architect_1.targetFromTargetString(serverBuildTarget.name));
    if (!serverBuildOptions.outputPath || typeof serverBuildOptions.outputPath !== 'string') {
        throw new Error(`Cannot read the output path option of the Angular project '${serverBuildTarget.name}' in angular.json`);
    }
    const staticOut = path_1.join(workspaceRoot, staticBuildOptions.outputPath);
    const serverOut = path_1.join(workspaceRoot, serverBuildOptions.outputPath);
    const cloudRunOut = options.outputPath ? path_1.join(workspaceRoot, options.outputPath) : path_1.join(path_1.dirname(serverOut), 'run');
    const serviceId = options.functionName || functions_templates_1.DEFAULT_FUNCTION_NAME;
    const newStaticOut = path_1.join(cloudRunOut, staticBuildOptions.outputPath);
    const newServerOut = path_1.join(cloudRunOut, serverBuildOptions.outputPath);
    fsHost.removeSync(cloudRunOut);
    fsHost.copySync(staticOut, newStaticOut);
    fsHost.copySync(serverOut, newServerOut);
    const packageJson = getPackageJson(context, workspaceRoot, options, path_1.join(serverBuildOptions.outputPath, 'main.js'));
    const nodeVersion = packageJson.engines.node;
    if (!semver_1.satisfies(process.versions.node, nodeVersion.toString())) {
        context.logger.warn(`⚠️ Your Node.js version (${process.versions.node}) does not match the Cloud Run runtime (${nodeVersion}).`);
    }
    fsHost.writeFileSync(path_1.join(cloudRunOut, 'package.json'), JSON.stringify(packageJson, null, 2));
    fsHost.writeFileSync(path_1.join(cloudRunOut, 'Dockerfile'), functions_templates_1.dockerfile(options));
    if (!options.prerender) {
        try {
            fsHost.renameSync(path_1.join(newStaticOut, 'index.html'), path_1.join(newStaticOut, 'index.original.html'));
        }
        catch (e) { }
    }
    if (options.preview) {
        throw new schematics_1.SchematicsException('Cloud Run preview not supported.');
    }
    const deployArguments = [];
    const cloudRunOptions = options.cloudRunOptions || {};
    Object.entries(DEFAULT_CLOUD_RUN_OPTIONS).forEach(([k, v]) => {
        cloudRunOptions[k] || (cloudRunOptions[k] = v);
    });
    if (cloudRunOptions.cpus) {
        deployArguments.push('--cpu', cloudRunOptions.cpus);
    }
    if (cloudRunOptions.maxConcurrency) {
        deployArguments.push('--concurrency', cloudRunOptions.maxConcurrency);
    }
    if (cloudRunOptions.maxInstances) {
        deployArguments.push('--max-instances', cloudRunOptions.maxInstances);
    }
    if (cloudRunOptions.memory) {
        deployArguments.push('--memory', cloudRunOptions.memory);
    }
    if (cloudRunOptions.minInstances) {
        deployArguments.push('--min-instances', cloudRunOptions.minInstances);
    }
    if (cloudRunOptions.timeout) {
        deployArguments.push('--timeout', cloudRunOptions.timeout);
    }
    if (cloudRunOptions.vpcConnector) {
        deployArguments.push('--vpc-connector', cloudRunOptions.vpcConnector);
    }
    context.logger.info(`📦 Deploying to Cloud Run`);
    yield spawnAsync(`gcloud builds submit ${cloudRunOut} --tag gcr.io/${options.firebaseProject}/${serviceId} --project ${options.firebaseProject} --quiet`);
    yield spawnAsync(`gcloud run deploy ${serviceId} --image gcr.io/${options.firebaseProject}/${serviceId} --project ${options.firebaseProject} ${deployArguments.join(' ')} --platform managed --allow-unauthenticated --region=${options.region} --quiet`);
    const siteTarget = (_c = options.target) !== null && _c !== void 0 ? _c : context.target.project;
    return yield firebaseTools.deploy({
        only: `hosting:${siteTarget}`,
        cwd: workspaceRoot,
        token: firebaseToken,
        nonInteractive: true,
        projectRoot: workspaceRoot,
    });
});
exports.deployToCloudRun = deployToCloudRun;
function deploy(firebaseTools, context, staticBuildTarget, serverBuildTarget, prerenderBuildTarget, firebaseProject, options, firebaseToken) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!firebaseToken) {
            yield firebaseTools.login();
            const user = yield firebaseTools.login({ projectRoot: context.workspaceRoot });
            console.log(`Logged into Firebase as ${user.email}.`);
        }
        if (prerenderBuildTarget) {
            const run = yield context.scheduleTarget(architect_1.targetFromTargetString(prerenderBuildTarget.name), prerenderBuildTarget.options);
            yield run.result;
        }
        else {
            if (!context.target) {
                throw new Error('Cannot execute the build target');
            }
            context.logger.info(`📦 Building "${context.target.project}"`);
            const builders = [
                context.scheduleTarget(architect_1.targetFromTargetString(staticBuildTarget.name), staticBuildTarget.options).then(run => run.result)
            ];
            if (serverBuildTarget) {
                builders.push(context.scheduleTarget(architect_1.targetFromTargetString(serverBuildTarget.name), serverBuildTarget.options).then(run => run.result));
            }
            yield Promise.all(builders);
        }
        try {
            yield firebaseTools.use(firebaseProject, {
                project: firebaseProject,
                projectRoot: context.workspaceRoot,
            });
        }
        catch (e) {
            throw new Error(`Cannot select firebase project '${firebaseProject}'`);
        }
        options.firebaseProject = firebaseProject;
        const logger = new winston.transports.Console({
            level: 'info',
            format: winston.format.printf((info) => {
                var _a, _b, _c, _d;
                const emulator = (_c = (_b = (_a = info[triple_beam_1.default.SPLAT]) === null || _a === void 0 ? void 0 : _a[1]) === null || _b === void 0 ? void 0 : _b.metadata) === null || _c === void 0 ? void 0 : _c.emulator;
                const text = (_d = info[triple_beam_1.default.SPLAT]) === null || _d === void 0 ? void 0 : _d[0];
                if (text === null || text === void 0 ? void 0 : text.replace) {
                    const plainText = text.replace(/\x1B\[([0-9]{1,2}(;[0-9]{1,2})?)?[mGK]/g, '');
                    if ((emulator === null || emulator === void 0 ? void 0 : emulator.name) === 'hosting' && plainText.startsWith('Local server: ')) {
                        open_1.default(plainText.split(': ')[1]);
                    }
                }
                return [info.message, ...(info[triple_beam_1.default.SPLAT] || [])]
                    .filter((chunk) => typeof chunk === 'string')
                    .join(' ');
            })
        });
        firebaseTools.logger.logger.add(logger);
        if (serverBuildTarget) {
            if (options.ssr === 'cloud-run') {
                yield exports.deployToCloudRun(firebaseTools, context, context.workspaceRoot, staticBuildTarget, serverBuildTarget, options, firebaseToken);
            }
            else {
                yield exports.deployToFunction(firebaseTools, context, context.workspaceRoot, staticBuildTarget, serverBuildTarget, options, firebaseToken);
            }
        }
        else {
            yield deployToHosting(firebaseTools, context, context.workspaceRoot, options, firebaseToken);
        }
    });
}
exports.default = deploy;
