import * as ts from 'typescript';
import { Tree } from '@angular-devkit/schematics';
export declare function parseJSON(path: string, content: string): any;
/**
 * Returns the parsed content of a json file.
 * @param host {Tree} The source tree.
 * @param path {String} The path to the file to read. Relative to the root of the tree.
 */
export declare function getJsonFile(host: Tree, path: string): any;
/**
 * Reads file from given path and Returns TypeScript source file.
 * @param host {Tree} The source tree.
 * @param path {String} The path to the file to read. Relative to the root of the tree.
 * */
export declare function getTypeScriptSourceFile(host: Tree, path: string): ts.SourceFile;
