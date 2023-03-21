"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dockerfile = exports.functionGen2 = exports.defaultFunction = exports.defaultPackage = exports.DEFAULT_FUNCTION_NAME = exports.DEFAULT_NODE_VERSION = void 0;
exports.DEFAULT_NODE_VERSION = 14;
exports.DEFAULT_FUNCTION_NAME = 'ssr';
const DEFAULT_FUNCTION_REGION = 'us-central1';
const DEFAULT_RUNTIME_OPTIONS = {
    timeoutSeconds: 60,
    memory: '1GB'
};
const defaultPackage = (dependencies, devDependencies, options, main) => ({
    name: 'functions',
    description: 'Angular Universal Application',
    main: main !== null && main !== void 0 ? main : 'index.js',
    scripts: {
        start: main ? `node ${main}` : 'firebase functions:shell',
    },
    engines: {
        node: (options.functionsNodeVersion || exports.DEFAULT_NODE_VERSION).toString()
    },
    dependencies,
    devDependencies,
    private: true
});
exports.defaultPackage = defaultPackage;
const defaultFunction = (path, options, functionName) => `const functions = require('firebase-functions');

// Increase readability in Cloud Logging
require("firebase-functions/lib/logger/compat");

const expressApp = require('./${path}/main').app();

exports.${functionName || exports.DEFAULT_FUNCTION_NAME} = functions
  .region('${options.region || DEFAULT_FUNCTION_REGION}')
  .runWith(${JSON.stringify(options.functionsRuntimeOptions || DEFAULT_RUNTIME_OPTIONS)})
  .https
  .onRequest(expressApp);
`;
exports.defaultFunction = defaultFunction;
const functionGen2 = (path, options, functionName) => `const { onRequest } = require('firebase-functions/v2/https');

// Increase readability in Cloud Logging
require("firebase-functions/lib/logger/compat");

const expressApp = require('./${path}/main').app();

exports.${functionName || exports.DEFAULT_FUNCTION_NAME} = onRequest(${JSON.stringify(Object.assign({ region: options.region || DEFAULT_FUNCTION_REGION }, (options.functionsRuntimeOptions || DEFAULT_RUNTIME_OPTIONS)))}, expressApp);
`;
exports.functionGen2 = functionGen2;
const dockerfile = (options) => `FROM node:${options.functionsNodeVersion || exports.DEFAULT_NODE_VERSION}-slim
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=production
COPY . ./
CMD [ "npm", "start" ]
`;
exports.dockerfile = dockerfile;
