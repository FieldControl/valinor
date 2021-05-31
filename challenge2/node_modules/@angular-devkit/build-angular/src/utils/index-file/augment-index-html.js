"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.augmentIndexHtml = void 0;
const crypto_1 = require("crypto");
const html_rewriting_stream_1 = require("./html-rewriting-stream");
/*
 * Helper function used by the IndexHtmlWebpackPlugin.
 * Can also be directly used by builder, e. g. in order to generate an index.html
 * after processing several configurations in order to build different sets of
 * bundles for differential serving.
 */
async function augmentIndexHtml(params) {
    const { loadOutputFile, files, noModuleFiles = [], moduleFiles = [], entrypoints, sri, deployUrl = '', lang, baseHref, html, } = params;
    let { crossOrigin = 'none' } = params;
    if (sri && crossOrigin === 'none') {
        crossOrigin = 'anonymous';
    }
    const stylesheets = new Set();
    const scripts = new Set();
    // Sort files in the order we want to insert them by entrypoint and dedupes duplicates
    const mergedFiles = [...moduleFiles, ...noModuleFiles, ...files];
    for (const entrypoint of entrypoints) {
        for (const { extension, file, name } of mergedFiles) {
            if (name !== entrypoint) {
                continue;
            }
            switch (extension) {
                case '.js':
                    scripts.add(file);
                    break;
                case '.css':
                    stylesheets.add(file);
                    break;
            }
        }
    }
    let scriptTags = [];
    for (const script of scripts) {
        const attrs = [`src="${deployUrl}${script}"`];
        if (crossOrigin !== 'none') {
            attrs.push(`crossorigin="${crossOrigin}"`);
        }
        // We want to include nomodule or module when a file is not common amongs all
        // such as runtime.js
        const scriptPredictor = ({ file }) => file === script;
        if (!files.some(scriptPredictor)) {
            // in some cases for differential loading file with the same name is available in both
            // nomodule and module such as scripts.js
            // we shall not add these attributes if that's the case
            const isNoModuleType = noModuleFiles.some(scriptPredictor);
            const isModuleType = moduleFiles.some(scriptPredictor);
            if (isNoModuleType && !isModuleType) {
                attrs.push('nomodule', 'defer');
            }
            else if (isModuleType && !isNoModuleType) {
                attrs.push('type="module"');
            }
            else {
                attrs.push('defer');
            }
        }
        else {
            attrs.push('defer');
        }
        if (sri) {
            const content = await loadOutputFile(script);
            attrs.push(generateSriAttributes(content));
        }
        scriptTags.push(`<script ${attrs.join(' ')}></script>`);
    }
    let linkTags = [];
    for (const stylesheet of stylesheets) {
        const attrs = [`rel="stylesheet"`, `href="${deployUrl}${stylesheet}"`];
        if (crossOrigin !== 'none') {
            attrs.push(`crossorigin="${crossOrigin}"`);
        }
        if (sri) {
            const content = await loadOutputFile(stylesheet);
            attrs.push(generateSriAttributes(content));
        }
        linkTags.push(`<link ${attrs.join(' ')}>`);
    }
    const { rewriter, transformedContent } = await html_rewriting_stream_1.htmlRewritingStream(html);
    const baseTagExists = html.includes('<base');
    rewriter
        .on('startTag', (tag) => {
        switch (tag.tagName) {
            case 'html':
                // Adjust document locale if specified
                if (isString(lang)) {
                    updateAttribute(tag, 'lang', lang);
                }
                break;
            case 'head':
                // Base href should be added before any link, meta tags
                if (!baseTagExists && isString(baseHref)) {
                    rewriter.emitStartTag(tag);
                    rewriter.emitRaw(`<base href="${baseHref}">`);
                    return;
                }
                break;
            case 'base':
                // Adjust base href if specified
                if (isString(baseHref)) {
                    updateAttribute(tag, 'href', baseHref);
                }
                break;
        }
        rewriter.emitStartTag(tag);
    })
        .on('endTag', (tag) => {
        switch (tag.tagName) {
            case 'head':
                for (const linkTag of linkTags) {
                    rewriter.emitRaw(linkTag);
                }
                linkTags = [];
                break;
            case 'body':
                // Add script tags
                for (const scriptTag of scriptTags) {
                    rewriter.emitRaw(scriptTag);
                }
                scriptTags = [];
                break;
        }
        rewriter.emitEndTag(tag);
    });
    const content = await transformedContent;
    if (linkTags.length || scriptTags.length) {
        // In case no body/head tags are not present (dotnet partial templates)
        return linkTags.join('') + scriptTags.join('') + content;
    }
    return content;
}
exports.augmentIndexHtml = augmentIndexHtml;
function generateSriAttributes(content) {
    const algo = 'sha384';
    const hash = crypto_1.createHash(algo).update(content, 'utf8').digest('base64');
    return `integrity="${algo}-${hash}"`;
}
function updateAttribute(tag, name, value) {
    const index = tag.attrs.findIndex((a) => a.name === name);
    const newValue = { name, value };
    if (index === -1) {
        tag.attrs.push(newValue);
    }
    else {
        tag.attrs[index] = newValue;
    }
}
function isString(value) {
    return typeof value === 'string';
}
