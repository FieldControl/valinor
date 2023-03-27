/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ConstantPool, R3ClassMetadata, R3DirectiveMetadata } from '@angular/compiler';
import ts from 'typescript';
import { Reference, ReferenceEmitter } from '../../../imports';
import { SemanticDepGraphUpdater } from '../../../incremental/semantic_graph';
import { ClassPropertyMapping, DirectiveTypeCheckMeta, HostDirectiveMeta, MetadataReader, MetadataRegistry } from '../../../metadata';
import { PartialEvaluator } from '../../../partial_evaluator';
import { PerfRecorder } from '../../../perf';
import { ClassDeclaration, Decorator, ReflectionHost } from '../../../reflection';
import { LocalModuleScopeRegistry } from '../../../scope';
import { AnalysisOutput, CompileResult, DecoratorHandler, DetectResult, HandlerFlags, HandlerPrecedence, ResolveResult } from '../../../transform';
import { InjectableClassRegistry } from '../../common';
import { DirectiveSymbol } from './symbol';
export interface DirectiveHandlerData {
    baseClass: Reference<ClassDeclaration> | 'dynamic' | null;
    typeCheckMeta: DirectiveTypeCheckMeta;
    meta: R3DirectiveMetadata;
    classMetadata: R3ClassMetadata | null;
    providersRequiringFactory: Set<Reference<ClassDeclaration>> | null;
    inputs: ClassPropertyMapping;
    outputs: ClassPropertyMapping;
    isPoisoned: boolean;
    isStructural: boolean;
    decorator: ts.Decorator | null;
    hostDirectives: HostDirectiveMeta[] | null;
    rawHostDirectives: ts.Expression | null;
}
export declare class DirectiveDecoratorHandler implements DecoratorHandler<Decorator | null, DirectiveHandlerData, DirectiveSymbol, unknown> {
    private reflector;
    private evaluator;
    private metaRegistry;
    private scopeRegistry;
    private metaReader;
    private injectableRegistry;
    private refEmitter;
    private isCore;
    private strictCtorDeps;
    private semanticDepGraphUpdater;
    private annotateForClosureCompiler;
    private compileUndecoratedClassesWithAngularFeatures;
    private perf;
    constructor(reflector: ReflectionHost, evaluator: PartialEvaluator, metaRegistry: MetadataRegistry, scopeRegistry: LocalModuleScopeRegistry, metaReader: MetadataReader, injectableRegistry: InjectableClassRegistry, refEmitter: ReferenceEmitter, isCore: boolean, strictCtorDeps: boolean, semanticDepGraphUpdater: SemanticDepGraphUpdater | null, annotateForClosureCompiler: boolean, compileUndecoratedClassesWithAngularFeatures: boolean, perf: PerfRecorder);
    readonly precedence = HandlerPrecedence.PRIMARY;
    readonly name: string;
    detect(node: ClassDeclaration, decorators: Decorator[] | null): DetectResult<Decorator | null> | undefined;
    analyze(node: ClassDeclaration, decorator: Readonly<Decorator | null>, flags?: HandlerFlags): AnalysisOutput<DirectiveHandlerData>;
    symbol(node: ClassDeclaration, analysis: Readonly<DirectiveHandlerData>): DirectiveSymbol;
    register(node: ClassDeclaration, analysis: Readonly<DirectiveHandlerData>): void;
    resolve(node: ClassDeclaration, analysis: DirectiveHandlerData, symbol: DirectiveSymbol): ResolveResult<unknown>;
    compileFull(node: ClassDeclaration, analysis: Readonly<DirectiveHandlerData>, resolution: Readonly<unknown>, pool: ConstantPool): CompileResult[];
    compilePartial(node: ClassDeclaration, analysis: Readonly<DirectiveHandlerData>, resolution: Readonly<unknown>): CompileResult[];
    /**
     * Checks if a given class uses Angular features and returns the TypeScript node
     * that indicated the usage. Classes are considered using Angular features if they
     * contain class members that are either decorated with a known Angular decorator,
     * or if they correspond to a known Angular lifecycle hook.
     */
    private findClassFieldWithAngularFeatures;
}
