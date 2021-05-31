import { CdkTreeNode, CdkTree, CdkTreeNodeDef, CdkNestedTreeNode, CDK_TREE_NODE_OUTLET_NODE, CdkTreeNodePadding, CdkTreeNodeOutlet, CdkTreeNodeToggle, CdkTreeModule } from '@angular/cdk/tree';
import { Directive, ElementRef, Attribute, Input, IterableDiffers, ViewContainerRef, Inject, Optional, Component, ViewEncapsulation, ChangeDetectionStrategy, ViewChild, NgModule } from '@angular/core';
import { mixinTabIndex, mixinDisabled, MatCommonModule } from '@angular/material/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, merge } from 'rxjs';
import { take, map } from 'rxjs/operators';

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const _MatTreeNodeMixinBase = mixinTabIndex(mixinDisabled(CdkTreeNode));
/**
 * Wrapper for the CdkTree node with Material design styles.
 */
class MatTreeNode extends _MatTreeNodeMixinBase {
    constructor(_elementRef, _tree, tabIndex) {
        super(_elementRef, _tree);
        this._elementRef = _elementRef;
        this._tree = _tree;
        this.tabIndex = Number(tabIndex) || 0;
        // The classes are directly added here instead of in the host property because classes on
        // the host property are not inherited with View Engine. It is not set as a @HostBinding because
        // it is not set by the time it's children nodes try to read the class from it.
        // TODO: move to host after View Engine deprecation
        this._elementRef.nativeElement.classList.add('mat-tree-node');
    }
    // This is a workaround for https://github.com/angular/angular/issues/23091
    // In aot mode, the lifecycle hooks from parent class are not called.
    ngOnInit() {
        super.ngOnInit();
    }
    ngDoCheck() {
        super.ngDoCheck();
    }
    ngOnDestroy() {
        super.ngOnDestroy();
    }
}
MatTreeNode.decorators = [
    { type: Directive, args: [{
                selector: 'mat-tree-node',
                exportAs: 'matTreeNode',
                inputs: ['role', 'disabled', 'tabIndex'],
                providers: [{ provide: CdkTreeNode, useExisting: MatTreeNode }]
            },] }
];
MatTreeNode.ctorParameters = () => [
    { type: ElementRef },
    { type: CdkTree },
    { type: String, decorators: [{ type: Attribute, args: ['tabindex',] }] }
];
/**
 * Wrapper for the CdkTree node definition with Material design styles.
 * Captures the node's template and a when predicate that describes when this node should be used.
 */
class MatTreeNodeDef extends CdkTreeNodeDef {
}
MatTreeNodeDef.decorators = [
    { type: Directive, args: [{
                selector: '[matTreeNodeDef]',
                inputs: [
                    'when: matTreeNodeDefWhen'
                ],
                providers: [{ provide: CdkTreeNodeDef, useExisting: MatTreeNodeDef }]
            },] }
];
MatTreeNodeDef.propDecorators = {
    data: [{ type: Input, args: ['matTreeNode',] }]
};
/**
 * Wrapper for the CdkTree nested node with Material design styles.
 */
class MatNestedTreeNode extends CdkNestedTreeNode {
    constructor(_elementRef, _tree, _differs, tabIndex) {
        super(_elementRef, _tree, _differs);
        this._elementRef = _elementRef;
        this._tree = _tree;
        this._differs = _differs;
        this._disabled = false;
        this.tabIndex = Number(tabIndex) || 0;
        // The classes are directly added here instead of in the host property because classes on
        // the host property are not inherited with View Engine. It is not set as a @HostBinding because
        // it is not set by the time it's children nodes try to read the class from it.
        // TODO: move to host after View Engine deprecation
        this._elementRef.nativeElement.classList.add('mat-nested-tree-node');
    }
    /** Whether the node is disabled. */
    get disabled() { return this._disabled; }
    set disabled(value) { this._disabled = coerceBooleanProperty(value); }
    /** Tabindex for the node. */
    get tabIndex() { return this.disabled ? -1 : this._tabIndex; }
    set tabIndex(value) {
        // If the specified tabIndex value is null or undefined, fall back to the default value.
        this._tabIndex = value != null ? value : 0;
    }
    // This is a workaround for https://github.com/angular/angular/issues/19145
    // In aot mode, the lifecycle hooks from parent class are not called.
    // TODO(tinayuangao): Remove when the angular issue #19145 is fixed
    ngOnInit() {
        super.ngOnInit();
    }
    ngDoCheck() {
        super.ngDoCheck();
    }
    ngAfterContentInit() {
        super.ngAfterContentInit();
    }
    ngOnDestroy() {
        super.ngOnDestroy();
    }
}
MatNestedTreeNode.decorators = [
    { type: Directive, args: [{
                selector: 'mat-nested-tree-node',
                exportAs: 'matNestedTreeNode',
                inputs: ['role', 'disabled', 'tabIndex'],
                providers: [
                    { provide: CdkNestedTreeNode, useExisting: MatNestedTreeNode },
                    { provide: CdkTreeNode, useExisting: MatNestedTreeNode },
                    { provide: CDK_TREE_NODE_OUTLET_NODE, useExisting: MatNestedTreeNode }
                ]
            },] }
];
MatNestedTreeNode.ctorParameters = () => [
    { type: ElementRef },
    { type: CdkTree },
    { type: IterableDiffers },
    { type: String, decorators: [{ type: Attribute, args: ['tabindex',] }] }
];
MatNestedTreeNode.propDecorators = {
    node: [{ type: Input, args: ['matNestedTreeNode',] }],
    disabled: [{ type: Input }],
    tabIndex: [{ type: Input }]
};

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Wrapper for the CdkTree padding with Material design styles.
 */
class MatTreeNodePadding extends CdkTreeNodePadding {
    /** The level of depth of the tree node. The padding will be `level * indent` pixels. */
    get level() { return this._level; }
    set level(value) { this._setLevelInput(value); }
    /** The indent for each level. Default number 40px from material design menu sub-menu spec. */
    get indent() { return this._indent; }
    set indent(indent) { this._setIndentInput(indent); }
}
MatTreeNodePadding.decorators = [
    { type: Directive, args: [{
                selector: '[matTreeNodePadding]',
                providers: [{ provide: CdkTreeNodePadding, useExisting: MatTreeNodePadding }]
            },] }
];
MatTreeNodePadding.propDecorators = {
    level: [{ type: Input, args: ['matTreeNodePadding',] }],
    indent: [{ type: Input, args: ['matTreeNodePaddingIndent',] }]
};

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Outlet for nested CdkNode. Put `[matTreeNodeOutlet]` on a tag to place children dataNodes
 * inside the outlet.
 */
class MatTreeNodeOutlet {
    constructor(viewContainer, _node) {
        this.viewContainer = viewContainer;
        this._node = _node;
    }
}
MatTreeNodeOutlet.decorators = [
    { type: Directive, args: [{
                selector: '[matTreeNodeOutlet]',
                providers: [{
                        provide: CdkTreeNodeOutlet,
                        useExisting: MatTreeNodeOutlet
                    }]
            },] }
];
MatTreeNodeOutlet.ctorParameters = () => [
    { type: ViewContainerRef },
    { type: undefined, decorators: [{ type: Inject, args: [CDK_TREE_NODE_OUTLET_NODE,] }, { type: Optional }] }
];

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Wrapper for the CdkTable with Material design styles.
 */
class MatTree extends CdkTree {
}
MatTree.decorators = [
    { type: Component, args: [{
                selector: 'mat-tree',
                exportAs: 'matTree',
                template: `<ng-container matTreeNodeOutlet></ng-container>`,
                host: {
                    // The 'cdk-tree' class needs to be included here because classes set in the host in the
                    // parent class are not inherited with View Engine. The 'cdk-tree' class in CdkTreeNode has
                    // to be set in the host because:
                    // if it is set as a @HostBinding it is not set by the time the tree nodes try to read the
                    // class from it.
                    // the ElementRef is not available in the constructor so the class can't be applied directly
                    // without a breaking constructor change.
                    'class': 'mat-tree cdk-tree',
                    'role': 'tree',
                },
                encapsulation: ViewEncapsulation.None,
                // See note on CdkTree for explanation on why this uses the default change detection strategy.
                // tslint:disable-next-line:validate-decorators
                changeDetection: ChangeDetectionStrategy.Default,
                providers: [{ provide: CdkTree, useExisting: MatTree }],
                styles: [".mat-tree{display:block}.mat-tree-node{display:flex;align-items:center;flex:1;word-wrap:break-word}.mat-nested-tree-node{border-bottom-width:0}\n"]
            },] }
];
MatTree.propDecorators = {
    _nodeOutlet: [{ type: ViewChild, args: [MatTreeNodeOutlet, { static: true },] }]
};

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Wrapper for the CdkTree's toggle with Material design styles.
 */
// tslint:disable-next-line: coercion-types
class MatTreeNodeToggle extends CdkTreeNodeToggle {
    get recursive() { return this._recursive; }
    set recursive(value) {
        // TODO: when we remove support for ViewEngine, change this setter to an input
        // alias in the decorator metadata.
        this._recursive = coerceBooleanProperty(value);
    }
}
MatTreeNodeToggle.decorators = [
    { type: Directive, args: [{
                selector: '[matTreeNodeToggle]',
                providers: [{ provide: CdkTreeNodeToggle, useExisting: MatTreeNodeToggle }]
            },] }
];
MatTreeNodeToggle.propDecorators = {
    recursive: [{ type: Input, args: ['matTreeNodeToggleRecursive',] }]
};

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const MAT_TREE_DIRECTIVES = [
    MatNestedTreeNode,
    MatTreeNodeDef,
    MatTreeNodePadding,
    MatTreeNodeToggle,
    MatTree,
    MatTreeNode,
    MatTreeNodeOutlet
];
class MatTreeModule {
}
MatTreeModule.decorators = [
    { type: NgModule, args: [{
                imports: [CdkTreeModule, MatCommonModule],
                exports: [MatCommonModule, MAT_TREE_DIRECTIVES],
                declarations: MAT_TREE_DIRECTIVES,
            },] }
];

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Tree flattener to convert a normal type of node to node with children & level information.
 * Transform nested nodes of type `T` to flattened nodes of type `F`.
 *
 * For example, the input data of type `T` is nested, and contains its children data:
 *   SomeNode: {
 *     key: 'Fruits',
 *     children: [
 *       NodeOne: {
 *         key: 'Apple',
 *       },
 *       NodeTwo: {
 *        key: 'Pear',
 *      }
 *    ]
 *  }
 *  After flattener flatten the tree, the structure will become
 *  SomeNode: {
 *    key: 'Fruits',
 *    expandable: true,
 *    level: 1
 *  },
 *  NodeOne: {
 *    key: 'Apple',
 *    expandable: false,
 *    level: 2
 *  },
 *  NodeTwo: {
 *   key: 'Pear',
 *   expandable: false,
 *   level: 2
 * }
 * and the output flattened type is `F` with additional information.
 */
class MatTreeFlattener {
    constructor(transformFunction, getLevel, isExpandable, getChildren) {
        this.transformFunction = transformFunction;
        this.getLevel = getLevel;
        this.isExpandable = isExpandable;
        this.getChildren = getChildren;
    }
    _flattenNode(node, level, resultNodes, parentMap) {
        const flatNode = this.transformFunction(node, level);
        resultNodes.push(flatNode);
        if (this.isExpandable(flatNode)) {
            const childrenNodes = this.getChildren(node);
            if (childrenNodes) {
                if (Array.isArray(childrenNodes)) {
                    this._flattenChildren(childrenNodes, level, resultNodes, parentMap);
                }
                else {
                    childrenNodes.pipe(take(1)).subscribe(children => {
                        this._flattenChildren(children, level, resultNodes, parentMap);
                    });
                }
            }
        }
        return resultNodes;
    }
    _flattenChildren(children, level, resultNodes, parentMap) {
        children.forEach((child, index) => {
            let childParentMap = parentMap.slice();
            childParentMap.push(index != children.length - 1);
            this._flattenNode(child, level + 1, resultNodes, childParentMap);
        });
    }
    /**
     * Flatten a list of node type T to flattened version of node F.
     * Please note that type T may be nested, and the length of `structuredData` may be different
     * from that of returned list `F[]`.
     */
    flattenNodes(structuredData) {
        let resultNodes = [];
        structuredData.forEach(node => this._flattenNode(node, 0, resultNodes, []));
        return resultNodes;
    }
    /**
     * Expand flattened node with current expansion status.
     * The returned list may have different length.
     */
    expandFlattenedNodes(nodes, treeControl) {
        let results = [];
        let currentExpand = [];
        currentExpand[0] = true;
        nodes.forEach(node => {
            let expand = true;
            for (let i = 0; i <= this.getLevel(node); i++) {
                expand = expand && currentExpand[i];
            }
            if (expand) {
                results.push(node);
            }
            if (this.isExpandable(node)) {
                currentExpand[this.getLevel(node) + 1] = treeControl.isExpanded(node);
            }
        });
        return results;
    }
}
/**
 * Data source for flat tree.
 * The data source need to handle expansion/collapsion of the tree node and change the data feed
 * to `MatTree`.
 * The nested tree nodes of type `T` are flattened through `MatTreeFlattener`, and converted
 * to type `F` for `MatTree` to consume.
 */
class MatTreeFlatDataSource extends DataSource {
    constructor(_treeControl, _treeFlattener, initialData) {
        super();
        this._treeControl = _treeControl;
        this._treeFlattener = _treeFlattener;
        this._flattenedData = new BehaviorSubject([]);
        this._expandedData = new BehaviorSubject([]);
        this._data = new BehaviorSubject([]);
        if (initialData) {
            // Assign the data through the constructor to ensure that all of the logic is executed.
            this.data = initialData;
        }
    }
    get data() { return this._data.value; }
    set data(value) {
        this._data.next(value);
        this._flattenedData.next(this._treeFlattener.flattenNodes(this.data));
        this._treeControl.dataNodes = this._flattenedData.value;
    }
    connect(collectionViewer) {
        return merge(collectionViewer.viewChange, this._treeControl.expansionModel.changed, this._flattenedData).pipe(map(() => {
            this._expandedData.next(this._treeFlattener.expandFlattenedNodes(this._flattenedData.value, this._treeControl));
            return this._expandedData.value;
        }));
    }
    disconnect() {
        // no op
    }
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Data source for nested tree.
 *
 * The data source for nested tree doesn't have to consider node flattener, or the way to expand
 * or collapse. The expansion/collapsion will be handled by TreeControl and each non-leaf node.
 */
class MatTreeNestedDataSource extends DataSource {
    constructor() {
        super(...arguments);
        this._data = new BehaviorSubject([]);
    }
    /**
     * Data for the nested tree
     */
    get data() { return this._data.value; }
    set data(value) { this._data.next(value); }
    connect(collectionViewer) {
        return merge(...[collectionViewer.viewChange, this._data])
            .pipe(map(() => this.data));
    }
    disconnect() {
        // no op
    }
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Generated bundle index. Do not edit.
 */

export { MatNestedTreeNode, MatTree, MatTreeFlatDataSource, MatTreeFlattener, MatTreeModule, MatTreeNestedDataSource, MatTreeNode, MatTreeNodeDef, MatTreeNodeOutlet, MatTreeNodePadding, MatTreeNodeToggle };
//# sourceMappingURL=tree.js.map
