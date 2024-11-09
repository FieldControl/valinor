"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const utility_1 = require("../../utility");
const dependencies_1 = require("../../utility/dependencies");
const latest_versions_1 = require("../../utility/latest-versions");
const workspace_1 = require("../../utility/workspace");
const workspace_models_1 = require("../../utility/workspace-models");
function* visit(directory) {
    for (const path of directory.subfiles) {
        if (path.endsWith('.ts') && !path.endsWith('.d.ts')) {
            const entry = directory.file(path);
            if (entry) {
                const content = entry.content;
                if (content.includes('@nguniversal/')) {
                    // Only need to rename the import so we can just string replacements.
                    yield [entry.path, content.toString()];
                }
            }
        }
    }
    for (const path of directory.subdirs) {
        if (path === 'node_modules' || path.startsWith('.')) {
            continue;
        }
        yield* visit(directory.dir(path));
    }
}
const UNIVERSAL_PACKAGES = ['@nguniversal/common', '@nguniversal/express-engine'];
/**
 * Regexp to match Universal packages.
 * @nguniversal/common/engine
 * @nguniversal/common
 * @nguniversal/express-engine
 **/
const NGUNIVERSAL_PACKAGE_REGEXP = /@nguniversal\/(common(\/engine)?|express-engine)/g;
function default_1() {
    return async (tree) => {
        const hasUniversalDeps = UNIVERSAL_PACKAGES.some((d) => (0, dependencies_1.getPackageJsonDependency)(tree, d));
        if (!hasUniversalDeps) {
            return;
        }
        return (0, schematics_1.chain)([
            async (tree) => {
                // Replace server file.
                const workspace = await (0, workspace_1.getWorkspace)(tree);
                for (const [, project] of workspace.projects) {
                    if (project.extensions.projectType !== workspace_models_1.ProjectType.Application) {
                        continue;
                    }
                    const serverMainFiles = new Map();
                    for (const [, target] of project.targets) {
                        if (target.builder !== workspace_models_1.Builders.Server) {
                            continue;
                        }
                        const outputPath = project.targets.get('build')?.options?.outputPath;
                        for (const [, { main }] of (0, workspace_1.allTargetOptions)(target, false)) {
                            if (typeof main === 'string' &&
                                typeof outputPath === 'string' &&
                                tree.readText(main).includes('ngExpressEngine')) {
                                serverMainFiles.set(main, outputPath);
                            }
                        }
                    }
                    // Replace all import specifiers in all files.
                    let hasExpressTokens = false;
                    const root = project.sourceRoot ?? `${project.root}/src`;
                    const tokensFilePath = `/${root}/express.tokens.ts`;
                    for (const file of visit(tree.getDir(root))) {
                        const [path, content] = file;
                        let updatedContent = content;
                        // Check if file is importing tokens
                        if (content.includes('@nguniversal/express-engine/tokens')) {
                            hasExpressTokens ||= true;
                            let tokensFileRelativePath = (0, core_1.relative)((0, core_1.dirname)((0, core_1.normalize)(path)), (0, core_1.normalize)(tokensFilePath));
                            if (tokensFileRelativePath.charAt(0) !== '.') {
                                tokensFileRelativePath = './' + tokensFileRelativePath;
                            }
                            updatedContent = updatedContent.replaceAll('@nguniversal/express-engine/tokens', tokensFileRelativePath.slice(0, -3));
                        }
                        updatedContent = updatedContent.replaceAll(NGUNIVERSAL_PACKAGE_REGEXP, '@angular/ssr');
                        tree.overwrite(path, updatedContent);
                    }
                    // Replace server file and add tokens file if needed
                    for (const [path, outputPath] of serverMainFiles.entries()) {
                        tree.rename(path, path + '.bak');
                        tree.create(path, getServerFileContents(outputPath, hasExpressTokens));
                        if (hasExpressTokens) {
                            tree.create(tokensFilePath, TOKENS_FILE_CONTENT);
                        }
                    }
                }
                // Remove universal packages from deps.
                for (const name of UNIVERSAL_PACKAGES) {
                    (0, dependencies_1.removePackageJsonDependency)(tree, name);
                }
            },
            (0, utility_1.addDependency)('@angular/ssr', latest_versions_1.latestVersions.AngularSSR),
        ]);
    };
}
exports.default = default_1;
const TOKENS_FILE_CONTENT = `
import { InjectionToken } from '@angular/core';
import { Request, Response } from 'express';

export const REQUEST = new InjectionToken<Request>('REQUEST');
export const RESPONSE = new InjectionToken<Response>('RESPONSE');
`;
function getServerFileContents(outputPath, hasExpressTokens) {
    return (`
import 'zone.js/node';

import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import * as express from 'express';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import bootstrap from './src/main.server';` +
        (hasExpressTokens ? `\nimport { REQUEST, RESPONSE } from './src/express.tokens';` : '') +
        `

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const distFolder = join(process.cwd(), '${outputPath}');
  const indexHtml = existsSync(join(distFolder, 'index.original.html'))
    ? join(distFolder, 'index.original.html')
    : join(distFolder, 'index.html');

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', distFolder);

  // Example Express Rest API endpoints
  // server.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  server.get('*.*', express.static(distFolder, {
    maxAge: '1y'
  }));

  // All regular routes use the Angular engine
  server.get('*', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: \`\${protocol}://\${headers.host}\${originalUrl}\`,
        publicPath: distFolder,
        providers: [
          { provide: APP_BASE_HREF, useValue: baseUrl },` +
        (hasExpressTokens
            ? '\n          { provide: RESPONSE, useValue: res },\n          { provide: REQUEST, useValue: req }\n'
            : '') +
        `],
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });

  return server;
}

function run(): void {
  const port = process.env['SSR_PORT'] || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(\`Node Express server listening on http://localhost:\${port}\`);
  });
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = mainModule && mainModule.filename || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  run();
}

export default bootstrap;
`);
}
