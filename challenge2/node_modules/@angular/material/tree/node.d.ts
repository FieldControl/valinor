/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CdkNestedTreeNode, CdkTree, CdkTreeNode, CdkTreeNodeDef } from '@angular/cdk/tree';
import { AfterContentInit, DoCheck, ElementRef, IterableDiffers, OnDestroy, OnInit } from '@angular/core';
import { CanDisable, CanDisableCtor, HasTabIndex, HasTabIndexCtor } from '@angular/material/core';
import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
declare const _MatTreeNodeMixinBase: HasTabIndexCtor & CanDisableCtor & typeof CdkTreeNode;
/**
 * Wrapper for the CdkTree node with Material design styles.
 */
export declare class MatTreeNode<T, K = T> extends _MatTreeNodeMixinBase<T, K> implements CanDisable, DoCheck, HasTabIndex, OnInit, OnDestroy {
    protected _elementRef: ElementRef<HTMLElement>;
    protected _tree: CdkTree<T, K>;
    constructor(_elementRef: ElementRef<HTMLElement>, _tree: CdkTree<T, K>, tabIndex: string);
    ngOnInit(): void;
    ngDoCheck(): void;
    ngOnDestroy(): void;
    static ngAcceptInputType_disabled: BooleanInput;
    static ngAcceptInputType_tabIndex: NumberInput;
}
/**
 * Wrapper for the CdkTree node definition with Material design styles.
 * Captures the node's template and a when predicate that describes when this node should be used.
 */
export declare class MatTreeNodeDef<T> extends CdkTreeNodeDef<T> {
    data: T;
}
/**
 * Wrapper for the CdkTree nested node with Material design styles.
 */
export declare class MatNestedTreeNode<T, K = T> extends CdkNestedTreeNode<T, K> implements AfterContentInit, DoCheck, OnDestroy, OnInit {
    protected _elementRef: ElementRef<HTMLElement>;
    protected _tree: CdkTree<T, K>;
    protected _differs: IterableDiffers;
    node: T;
    /** Whether the node is disabled. */
    get disabled(): any;
    set disabled(value: any);
    private _disabled;
    /** Tabindex for the node. */
    get tabIndex(): number;
    set tabIndex(value: number);
    private _tabIndex;
    constructor(_elementRef: ElementRef<HTMLElement>, _tree: CdkTree<T, K>, _differs: IterableDiffers, tabIndex: string);
    ngOnInit(): void;
    ngDoCheck(): void;
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
    static ngAcceptInputType_disabled: BooleanInput;
}
export {};
