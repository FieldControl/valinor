/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <reference types="node" />
import { BuilderHandlerFn, BuilderInfo, BuilderOutput } from '@angular-devkit/architect';
import { TestProjectHost } from '@angular-devkit/architect/testing';
import { json, logging } from '@angular-devkit/core';
import { Observable } from 'rxjs';
export interface BuilderHarnessExecutionResult<T extends BuilderOutput = BuilderOutput> {
    result?: T;
    error?: Error;
    logs: readonly logging.LogEntry[];
}
export interface BuilderHarnessExecutionOptions {
    configuration: string;
    outputLogsOnFailure: boolean;
    outputLogsOnException: boolean;
    useNativeFileWatching: boolean;
}
export declare class BuilderHarness<T> {
    private readonly builderHandler;
    private readonly host;
    private readonly builderInfo;
    private schemaRegistry;
    private projectName;
    private projectMetadata;
    private targetName?;
    private options;
    private builderTargets;
    private watcherNotifier?;
    constructor(builderHandler: BuilderHandlerFn<T & json.JsonObject>, host: TestProjectHost, builderInfo?: Partial<BuilderInfo>);
    useProject(name: string, metadata?: Record<string, unknown>): this;
    useTarget(name: string, baseOptions: T): this;
    withConfiguration(configuration: string, options: T): this;
    withBuilderTarget<O>(target: string, handler: BuilderHandlerFn<O & json.JsonObject>, options?: O, info?: Partial<BuilderInfo>): this;
    execute(options?: Partial<BuilderHarnessExecutionOptions>): Observable<BuilderHarnessExecutionResult>;
    executeOnce(options?: Partial<BuilderHarnessExecutionOptions>): Promise<BuilderHarnessExecutionResult>;
    appendToFile(path: string, content: string): Promise<void>;
    writeFile(path: string, content: string | Buffer): Promise<void>;
    writeFiles(files: Record<string, string | Buffer>): Promise<void>;
    removeFile(path: string): Promise<void>;
    modifyFile(path: string, modifier: (content: string) => string | Promise<string>): Promise<void>;
    hasFile(path: string): boolean;
    hasFileMatch(directory: string, pattern: RegExp): boolean;
    readFile(path: string): string;
    private validateProjectName;
}
