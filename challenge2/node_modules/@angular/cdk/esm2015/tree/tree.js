import { isDataSource } from '@angular/cdk/collections';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChildren, Directive, ElementRef, Input, IterableDiffers, QueryList, ViewChild, ViewEncapsulation } from '@angular/core';
import { BehaviorSubject, isObservable, of as observableOf, Subject, } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CdkTreeNodeDef, CdkTreeNodeOutletContext } from './node';
import { CdkTreeNodeOutlet } from './outlet';
import { getTreeControlFunctionsMissingError, getTreeControlMissingError, getTreeMissingMatchingNodeDefError, getTreeMultipleDefaultNodeDefsError, getTreeNoValidDataSourceError } from './tree-errors';
import { coerceNumberProperty } from '@angular/cdk/coercion';
/**
 * CDK tree component that connects with a data source to retrieve data of type `T` and renders
 * dataNodes with hierarchy. Updates the dataNodes when new data is provided by the data source.
 */
export class CdkTree {
    constructor(_differs, _changeDetectorRef) {
        this._differs = _differs;
        this._changeDetectorRef = _changeDetectorRef;
        /** Subject that emits when the component has been destroyed. */
        this._onDestroy = new Subject();
        /** Level of nodes */
        this._levels = new Map();
        // TODO(tinayuangao): Setup a listener for scrolling, emit the calculated view to viewChange.
        //     Remove the MAX_VALUE in viewChange
        /**
         * Stream containing the latest information on what rows are being displayed on screen.
         * Can be used by the data source to as a heuristic of what data should be provided.
         */
        this.viewChange = new BehaviorSubject({ start: 0, end: Number.MAX_VALUE });
    }
    /**
     * Provides a stream containing the latest data array to render. Influenced by the tree's
     * stream of view window (what dataNodes are currently on screen).
     * Data source can be an observable of data array, or a data array to render.
     */
    get dataSource() { return this._dataSource; }
    set dataSource(dataSource) {
        if (this._dataSource !== dataSource) {
            this._switchDataSource(dataSource);
        }
    }
    ngOnInit() {
        this._dataDiffer = this._differs.find([]).create(this.trackBy);
        if (!this.treeControl && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw getTreeControlMissingError();
        }
    }
    ngOnDestroy() {
        this._nodeOutlet.viewContainer.clear();
        this.viewChange.complete();
        this._onDestroy.next();
        this._onDestroy.complete();
        if (this._dataSource && typeof this._dataSource.disconnect === 'function') {
            this.dataSource.disconnect(this);
        }
        if (this._dataSubscription) {
            this._dataSubscription.unsubscribe();
            this._dataSubscription = null;
        }
    }
    ngAfterContentChecked() {
        const defaultNodeDefs = this._nodeDefs.filter(def => !def.when);
        if (defaultNodeDefs.length > 1 && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw getTreeMultipleDefaultNodeDefsError();
        }
        this._defaultNodeDef = defaultNodeDefs[0];
        if (this.dataSource && this._nodeDefs && !this._dataSubscription) {
            this._observeRenderChanges();
        }
    }
    // TODO(tinayuangao): Work on keyboard traversal and actions, make sure it's working for RTL
    //     and nested trees.
    /**
     * Switch to the provided data source by resetting the data and unsubscribing from the current
     * render change subscription if one exists. If the data source is null, interpret this by
     * clearing the node outlet. Otherwise start listening for new data.
     */
    _switchDataSource(dataSource) {
        if (this._dataSource && typeof this._dataSource.disconnect === 'function') {
            this.dataSource.disconnect(this);
        }
        if (this._dataSubscription) {
            this._dataSubscription.unsubscribe();
            this._dataSubscription = null;
        }
        // Remove the all dataNodes if there is now no data source
        if (!dataSource) {
            this._nodeOutlet.viewContainer.clear();
        }
        this._dataSource = dataSource;
        if (this._nodeDefs) {
            this._observeRenderChanges();
        }
    }
    /** Set up a subscription for the data provided by the data source. */
    _observeRenderChanges() {
        let dataStream;
        if (isDataSource(this._dataSource)) {
            dataStream = this._dataSource.connect(this);
        }
        else if (isObservable(this._dataSource)) {
            dataStream = this._dataSource;
        }
        else if (Array.isArray(this._dataSource)) {
            dataStream = observableOf(this._dataSource);
        }
        if (dataStream) {
            this._dataSubscription = dataStream.pipe(takeUntil(this._onDestroy))
                .subscribe(data => this.renderNodeChanges(data));
        }
        else if (typeof ngDevMode === 'undefined' || ngDevMode) {
            throw getTreeNoValidDataSourceError();
        }
    }
    /** Check for changes made in the data and render each change (node added/removed/moved). */
    renderNodeChanges(data, dataDiffer = this._dataDiffer, viewContainer = this._nodeOutlet.viewContainer, parentData) {
        const changes = dataDiffer.diff(data);
        if (!changes) {
            return;
        }
        changes.forEachOperation((item, adjustedPreviousIndex, currentIndex) => {
            if (item.previousIndex == null) {
                this.insertNode(data[currentIndex], currentIndex, viewContainer, parentData);
            }
            else if (currentIndex == null) {
                viewContainer.remove(adjustedPreviousIndex);
                this._levels.delete(item.item);
            }
            else {
                const view = viewContainer.get(adjustedPreviousIndex);
                viewContainer.move(view, currentIndex);
            }
        });
        this._changeDetectorRef.detectChanges();
    }
    /**
     * Finds the matching node definition that should be used for this node data. If there is only
     * one node definition, it is returned. Otherwise, find the node definition that has a when
     * predicate that returns true with the data. If none return true, return the default node
     * definition.
     */
    _getNodeDef(data, i) {
        if (this._nodeDefs.length === 1) {
            return this._nodeDefs.first;
        }
        const nodeDef = this._nodeDefs.find(def => def.when && def.when(i, data)) || this._defaultNodeDef;
        if (!nodeDef && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw getTreeMissingMatchingNodeDefError();
        }
        return nodeDef;
    }
    /**
     * Create the embedded view for the data node template and place it in the correct index location
     * within the data node view container.
     */
    insertNode(nodeData, index, viewContainer, parentData) {
        const node = this._getNodeDef(nodeData, index);
        // Node context that will be provided to created embedded view
        const context = new CdkTreeNodeOutletContext(nodeData);
        // If the tree is flat tree, then use the `getLevel` function in flat tree control
        // Otherwise, use the level of parent node.
        if (this.treeControl.getLevel) {
            context.level = this.treeControl.getLevel(nodeData);
        }
        else if (typeof parentData !== 'undefined' && this._levels.has(parentData)) {
            context.level = this._levels.get(parentData) + 1;
        }
        else {
            context.level = 0;
        }
        this._levels.set(nodeData, context.level);
        // Use default tree nodeOutlet, or nested node's nodeOutlet
        const container = viewContainer ? viewContainer : this._nodeOutlet.viewContainer;
        container.createEmbeddedView(node.template, context, index);
        // Set the data to just created `CdkTreeNode`.
        // The `CdkTreeNode` created from `createEmbeddedView` will be saved in static variable
        //     `mostRecentTreeNode`. We get it from static variable and pass the node data to it.
        if (CdkTreeNode.mostRecentTreeNode) {
            CdkTreeNode.mostRecentTreeNode.data = nodeData;
        }
    }
}
CdkTree.decorators = [
    { type: Component, args: [{
                selector: 'cdk-tree',
                exportAs: 'cdkTree',
                template: `<ng-container cdkTreeNodeOutlet></ng-container>`,
                host: {
                    'class': 'cdk-tree',
                    'role': 'tree',
                },
                encapsulation: ViewEncapsulation.None,
                // The "OnPush" status for the `CdkTree` component is effectively a noop, so we are removing it.
                // The view for `CdkTree` consists entirely of templates declared in other views. As they are
                // declared elsewhere, they are checked when their declaration points are checked.
                // tslint:disable-next-line:validate-decorators
                changeDetection: ChangeDetectionStrategy.Default
            },] }
];
CdkTree.ctorParameters = () => [
    { type: IterableDiffers },
    { type: ChangeDetectorRef }
];
CdkTree.propDecorators = {
    dataSource: [{ type: Input }],
    treeControl: [{ type: Input }],
    trackBy: [{ type: Input }],
    _nodeOutlet: [{ type: ViewChild, args: [CdkTreeNodeOutlet, { static: true },] }],
    _nodeDefs: [{ type: ContentChildren, args: [CdkTreeNodeDef, {
                    // We need to use `descendants: true`, because Ivy will no longer match
                    // indirect descendants if it's left as false.
                    descendants: true
                },] }]
};
/**
 * Tree node for CdkTree. It contains the data in the tree node.
 */
export class CdkTreeNode {
    constructor(_elementRef, _tree) {
        this._elementRef = _elementRef;
        this._tree = _tree;
        /** Subject that emits when the component has been destroyed. */
        this._destroyed = new Subject();
        /** Emits when the node's data has changed. */
        this._dataChanges = new Subject();
        CdkTreeNode.mostRecentTreeNode = this;
        // The classes are directly added here instead of in the host property because classes on
        // the host property are not inherited with View Engine. It is not set as a @HostBinding because
        // it is not set by the time it's children nodes try to read the class from it.
        // TODO: move to host after View Engine deprecation
        this._elementRef.nativeElement.classList.add('cdk-tree-node');
        this.role = 'treeitem';
    }
    /**
     * The role of the tree node.
     * @deprecated The correct role is 'treeitem', 'group' should not be used. This input will be
     *   removed in a future version.
     * @breaking-change 12.0.0 Remove this input
     */
    get role() { return 'treeitem'; }
    set role(_role) {
        // TODO: move to host after View Engine deprecation
        this._elementRef.nativeElement.setAttribute('role', _role);
    }
    /** The tree node's data. */
    get data() { return this._data; }
    set data(value) {
        if (value !== this._data) {
            this._data = value;
            this._setRoleFromData();
            this._dataChanges.next();
        }
    }
    get isExpanded() {
        return this._tree.treeControl.isExpanded(this._data);
    }
    _setExpanded(_expanded) {
        this._isAriaExpanded = _expanded;
        this._elementRef.nativeElement.setAttribute('aria-expanded', `${_expanded}`);
    }
    get level() {
        // If the treeControl has a getLevel method, use it to get the level. Otherwise read the
        // aria-level off the parent node and use it as the level for this node (note aria-level is
        // 1-indexed, while this property is 0-indexed, so we don't need to increment).
        return this._tree.treeControl.getLevel ?
            this._tree.treeControl.getLevel(this._data) : this._parentNodeAriaLevel;
    }
    ngOnInit() {
        this._parentNodeAriaLevel = getParentNodeAriaLevel(this._elementRef.nativeElement);
        this._elementRef.nativeElement.setAttribute('aria-level', `${this.level + 1}`);
    }
    ngDoCheck() {
        // aria-expanded is be set here because the expanded state is stored in the tree control and
        // the node isn't aware when the state is changed.
        // It is not set using a @HostBinding because they sometimes get lost with Mixin based classes.
        // TODO: move to host after View Engine deprecation
        if (this.isExpanded != this._isAriaExpanded) {
            this._setExpanded(this.isExpanded);
        }
    }
    ngOnDestroy() {
        // If this is the last tree node being destroyed,
        // clear out the reference to avoid leaking memory.
        if (CdkTreeNode.mostRecentTreeNode === this) {
            CdkTreeNode.mostRecentTreeNode = null;
        }
        this._dataChanges.complete();
        this._destroyed.next();
        this._destroyed.complete();
    }
    /** Focuses the menu item. Implements for FocusableOption. */
    focus() {
        this._elementRef.nativeElement.focus();
    }
    // TODO: role should eventually just be set in the component host
    _setRoleFromData() {
        if (!this._tree.treeControl.isExpandable && !this._tree.treeControl.getChildren &&
            (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw getTreeControlFunctionsMissingError();
        }
        this.role = 'treeitem';
    }
}
/**
 * The most recently created `CdkTreeNode`. We save it in static variable so we can retrieve it
 * in `CdkTree` and set the data to it.
 */
CdkTreeNode.mostRecentTreeNode = null;
CdkTreeNode.decorators = [
    { type: Directive, args: [{
                selector: 'cdk-tree-node',
                exportAs: 'cdkTreeNode',
            },] }
];
CdkTreeNode.ctorParameters = () => [
    { type: ElementRef },
    { type: CdkTree }
];
CdkTreeNode.propDecorators = {
    role: [{ type: Input }]
};
function getParentNodeAriaLevel(nodeElement) {
    let parent = nodeElement.parentElement;
    while (parent && !isNodeElement(parent)) {
        parent = parent.parentElement;
    }
    if (!parent) {
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            throw Error('Incorrect tree structure containing detached node.');
        }
        else {
            return -1;
        }
    }
    else if (parent.classList.contains('cdk-nested-tree-node')) {
        return coerceNumberProperty(parent.getAttribute('aria-level'));
    }
    else {
        // The ancestor element is the cdk-tree itself
        return 0;
    }
}
function isNodeElement(element) {
    const classList = element.classList;
    return !!((classList === null || classList === void 0 ? void 0 : classList.contains('cdk-nested-tree-node')) || (classList === null || classList === void 0 ? void 0 : classList.contains('cdk-tree')));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvdHJlZS90cmVlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVFBLE9BQU8sRUFBK0IsWUFBWSxFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFDcEYsT0FBTyxFQUVMLHVCQUF1QixFQUN2QixpQkFBaUIsRUFDakIsU0FBUyxFQUNULGVBQWUsRUFDZixTQUFTLEVBRVQsVUFBVSxFQUNWLEtBQUssRUFHTCxlQUFlLEVBR2YsU0FBUyxFQUVULFNBQVMsRUFFVCxpQkFBaUIsRUFDbEIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUNMLGVBQWUsRUFDZixZQUFZLEVBRVosRUFBRSxJQUFJLFlBQVksRUFDbEIsT0FBTyxHQUVSLE1BQU0sTUFBTSxDQUFDO0FBQ2QsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRXpDLE9BQU8sRUFBQyxjQUFjLEVBQUUsd0JBQXdCLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFDaEUsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQzNDLE9BQU8sRUFDTCxtQ0FBbUMsRUFDbkMsMEJBQTBCLEVBQzFCLGtDQUFrQyxFQUNsQyxtQ0FBbUMsRUFDbkMsNkJBQTZCLEVBQzlCLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxvQkFBb0IsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBRTNEOzs7R0FHRztBQWlCSCxNQUFNLE9BQU8sT0FBTztJQTREbEIsWUFBb0IsUUFBeUIsRUFDekIsa0JBQXFDO1FBRHJDLGFBQVEsR0FBUixRQUFRLENBQWlCO1FBQ3pCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBbUI7UUE1RHpELGdFQUFnRTtRQUMvQyxlQUFVLEdBQUcsSUFBSSxPQUFPLEVBQVEsQ0FBQztRQVdsRCxxQkFBcUI7UUFDYixZQUFPLEdBQW1CLElBQUksR0FBRyxFQUFhLENBQUM7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QyxDQUFDO0tBQ2pFO1NBQU07UUFDTCw4Q0FBOEM7UUFDOUMsT0FBTyxDQUFDLENBQUM7S0FDVjtBQUNILENBQUM7QUFFRCxTQUFTLGFBQWEsQ0FBQyxPQUFvQjtJQUN6QyxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDO0lBQ3BDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQSxTQUFTLGFBQVQsU0FBUyx1QkFBVCxTQUFTLENBQUUsUUFBUSxDQUFDLHNCQUFzQixDQUFDLE1BQUksU0FBUyxhQUFULFNBQVMsdUJBQVQsU0FBUyxDQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQSxDQUFDLENBQUM7QUFDNUYsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtGb2N1c2FibGVPcHRpb259IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcbmltcG9ydCB7Q29sbGVjdGlvblZpZXdlciwgRGF0YVNvdXJjZSwgaXNEYXRhU291cmNlfSBmcm9tICdAYW5ndWxhci9jZGsvY29sbGVjdGlvbnMnO1xuaW1wb3J0IHtcbiAgQWZ0ZXJDb250ZW50Q2hlY2tlZCxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBDb21wb25lbnQsXG4gIENvbnRlbnRDaGlsZHJlbixcbiAgRGlyZWN0aXZlLFxuICBEb0NoZWNrLFxuICBFbGVtZW50UmVmLFxuICBJbnB1dCxcbiAgSXRlcmFibGVDaGFuZ2VSZWNvcmQsXG4gIEl0ZXJhYmxlRGlmZmVyLFxuICBJdGVyYWJsZURpZmZlcnMsXG4gIE9uRGVzdHJveSxcbiAgT25Jbml0LFxuICBRdWVyeUxpc3QsXG4gIFRyYWNrQnlGdW5jdGlvbixcbiAgVmlld0NoaWxkLFxuICBWaWV3Q29udGFpbmVyUmVmLFxuICBWaWV3RW5jYXBzdWxhdGlvblxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7XG4gIEJlaGF2aW9yU3ViamVjdCxcbiAgaXNPYnNlcnZhYmxlLFxuICBPYnNlcnZhYmxlLFxuICBvZiBhcyBvYnNlcnZhYmxlT2YsXG4gIFN1YmplY3QsXG4gIFN1YnNjcmlwdGlvbixcbn0gZnJvbSAncnhqcyc7XG5pbXBvcnQge3Rha2VVbnRpbH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHtUcmVlQ29udHJvbH0gZnJvbSAnLi9jb250cm9sL3RyZWUtY29udHJvbCc7XG5pbXBvcnQge0Nka1RyZWVOb2RlRGVmLCBDZGtUcmVlTm9kZU91dGxldENvbnRleHR9IGZyb20gJy4vbm9kZSc7XG5pbXBvcnQge0Nka1RyZWVOb2RlT3V0bGV0fSBmcm9tICcuL291dGxldCc7XG5pbXBvcnQge1xuICBnZXRUcmVlQ29udHJvbEZ1bmN0aW9uc01pc3NpbmdFcnJvcixcbiAgZ2V0VHJlZUNvbnRyb2xNaXNzaW5nRXJyb3IsXG4gIGdldFRyZWVNaXNzaW5nTWF0Y2hpbmdOb2RlRGVmRXJyb3IsXG4gIGdldFRyZWVNdWx0aXBsZURlZmF1bHROb2RlRGVmc0Vycm9yLFxuICBnZXRUcmVlTm9WYWxpZERhdGFTb3VyY2VFcnJvclxufSBmcm9tICcuL3RyZWUtZXJyb3JzJztcbmltcG9ydCB7Y29lcmNlTnVtYmVyUHJvcGVydHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5cbi8qKlxuICogQ0RLIHRyZWUgY29tcG9uZW50IHRoYXQgY29ubmVjdHMgd2l0aCBhIGRhdGEgc291cmNlIHRvIHJldHJpZXZlIGRhdGEgb2YgdHlwZSBgVGAgYW5kIHJlbmRlcnNcbiAqIGRhdGFOb2RlcyB3aXRoIGhpZXJhcmNoeS4gVXBkYXRlcyB0aGUgZGF0YU5vZGVzIHdoZW4gbmV3IGRhdGEgaXMgcHJvdmlkZWQgYnkgdGhlIGRhdGEgc291cmNlLlxuICovXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdjZGstdHJlZScsXG4gIGV4cG9ydEFzOiAnY2RrVHJlZScsXG4gIHRlbXBsYXRlOiBgPG5nLWNvbnRhaW5lciBjZGtUcmVlTm9kZU91dGxldD48L25nLWNvbnRhaW5lcj5gLFxuICBob3N0OiB7XG4gICAgJ2NsYXNzJzogJ2Nkay10cmVlJyxcbiAgICAncm9sZSc6ICd0cmVlJyxcbiAgfSxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcblxuICAvLyBUaGUgXCJPblB1c2hcIiBzdGF0dXMgZm9yIHRoZSBgQ2RrVHJlZWAgY29tcG9uZW50IGlzIGVmZmVjdGl2ZWx5IGEgbm9vcCwgc28gd2UgYXJlIHJlbW92aW5nIGl0LlxuICAvLyBUaGUgdmlldyBmb3IgYENka1RyZWVgIGNvbnNpc3RzIGVudGlyZWx5IG9mIHRlbXBsYXRlcyBkZWNsYXJlZCBpbiBvdGhlciB2aWV3cy4gQXMgdGhleSBhcmVcbiAgLy8gZGVjbGFyZWQgZWxzZXdoZXJlLCB0aGV5IGFyZSBjaGVja2VkIHdoZW4gdGhlaXIgZGVjbGFyYXRpb24gcG9pbnRzIGFyZSBjaGVja2VkLlxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6dmFsaWRhdGUtZGVjb3JhdG9yc1xuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkRlZmF1bHRcbn0pXG5leHBvcnQgY2xhc3MgQ2RrVHJlZTxULCBLID0gVD4gaW1wbGVtZW50cyBBZnRlckNvbnRlbnRDaGVja2VkLCBDb2xsZWN0aW9uVmlld2VyLCBPbkRlc3Ryb3ksIE9uSW5pdCB7XG4gIC8qKiBTdWJqZWN0IHRoYXQgZW1pdHMgd2hlbiB0aGUgY29tcG9uZW50IGhhcyBiZWVuIGRlc3Ryb3llZC4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfb25EZXN0cm95ID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICAvKiogRGlmZmVyIHVzZWQgdG8gZmluZCB0aGUgY2hhbmdlcyBpbiB0aGUgZGF0YSBwcm92aWRlZCBieSB0aGUgZGF0YSBzb3VyY2UuICovXG4gIHByaXZhdGUgX2RhdGFEaWZmZXI6IEl0ZXJhYmxlRGlmZmVyPFQ+O1xuXG4gIC8qKiBTdG9yZXMgdGhlIG5vZGUgZGVmaW5pdGlvbiB0aGF0IGRvZXMgbm90IGhhdmUgYSB3aGVuIHByZWRpY2F0ZS4gKi9cbiAgcHJpdmF0ZSBfZGVmYXVsdE5vZGVEZWY6IENka1RyZWVOb2RlRGVmPFQ+IHwgbnVsbDtcblxuICAvKiogRGF0YSBzdWJzY3JpcHRpb24gKi9cbiAgcHJpdmF0ZSBfZGF0YVN1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uIHwgbnVsbDtcblxuICAvKiogTGV2ZWwgb2Ygbm9kZXMgKi9cbiAgcHJpdmF0ZSBfbGV2ZWxzOiBNYXA8VCwgbnVtYmVyPiA9IG5ldyBNYXA8VCwgbnVtYmVyPigpO1xuXG4gIC8qKlxuICAgKiBQcm92aWRlcyBhIHN0cmVhbSBjb250YWluaW5nIHRoZSBsYXRlc3QgZGF0YSBhcnJheSB0byByZW5kZXIuIEluZmx1ZW5jZWQgYnkgdGhlIHRyZWUnc1xuICAgKiBzdHJlYW0gb2YgdmlldyB3aW5kb3cgKHdoYXQgZGF0YU5vZGVzIGFyZSBjdXJyZW50bHkgb24gc2NyZWVuKS5cbiAgICogRGF0YSBzb3VyY2UgY2FuIGJlIGFuIG9ic2VydmFibGUgb2YgZGF0YSBhcnJheSwgb3IgYSBkYXRhIGFycmF5IHRvIHJlbmRlci5cbiAgICovXG4gIEBJbnB1dCgpXG4gIGdldCBkYXRhU291cmNlKCk6IERhdGFTb3VyY2U8VD4gfCBPYnNlcnZhYmxlPFRbXT4gfCBUW10geyByZXR1cm4gdGhpcy5fZGF0YVNvdXJjZTsgfVxuICBzZXQgZGF0YVNvdXJjZShkYXRhU291cmNlOiBEYXRhU291cmNlPFQ+IHwgT2JzZXJ2YWJsZTxUW10+IHwgVFtdKSB7XG4gICAgaWYgKHRoaXMuX2RhdGFTb3VyY2UgIT09IGRhdGFTb3VyY2UpIHtcbiAgICAgIHRoaXMuX3N3aXRjaERhdGFTb3VyY2UoZGF0YVNvdXJjZSk7XG4gICAgfVxuICB9XG4gIHByaXZhdGUgX2RhdGFTb3VyY2U6IERhdGFTb3VyY2U8VD4gfCBPYnNlcnZhYmxlPFRbXT4gfCBUW107XG5cbiAgLyoqIFRoZSB0cmVlIGNvbnRyb2xsZXIgKi9cbiAgQElucHV0KCkgdHJlZUNvbnRyb2w6IFRyZWVDb250cm9sPFQsIEs+O1xuXG4gIC8qKlxuICAgKiBUcmFja2luZyBmdW5jdGlvbiB0aGF0IHdpbGwgYmUgdXNlZCB0byBjaGVjayB0aGUgZGlmZmVyZW5jZXMgaW4gZGF0YSBjaGFuZ2VzLiBVc2VkIHNpbWlsYXJseVxuICAgKiB0byBgbmdGb3JgIGB0cmFja0J5YCBmdW5jdGlvbi4gT3B0aW1pemUgbm9kZSBvcGVyYXRpb25zIGJ5IGlkZW50aWZ5aW5nIGEgbm9kZSBiYXNlZCBvbiBpdHMgZGF0YVxuICAgKiByZWxhdGl2ZSB0byB0aGUgZnVuY3Rpb24gdG8ga25vdyBpZiBhIG5vZGUgc2hvdWxkIGJlIGFkZGVkL3JlbW92ZWQvbW92ZWQuXG4gICAqIEFjY2VwdHMgYSBmdW5jdGlvbiB0aGF0IHRha2VzIHR3byBwYXJhbWV0ZXJzLCBgaW5kZXhgIGFuZCBgaXRlbWAuXG4gICAqL1xuICBASW5wdXQoKSB0cmFja0J5OiBUcmFja0J5RnVuY3Rpb248VD47XG5cbiAgLy8gT3V0bGV0cyB3aXRoaW4gdGhlIHRyZWUncyB0ZW1wbGF0ZSB3aGVyZSB0aGUgZGF0YU5vZGVzIHdpbGwgYmUgaW5zZXJ0ZWQuXG4gIEBWaWV3Q2hpbGQoQ2RrVHJlZU5vZGVPdXRsZXQsIHtzdGF0aWM6IHRydWV9KSBfbm9kZU91dGxldDogQ2RrVHJlZU5vZGVPdXRsZXQ7XG5cbiAgLyoqIFRoZSB0cmVlIG5vZGUgdGVtcGxhdGUgZm9yIHRoZSB0cmVlICovXG4gIEBDb250ZW50Q2hpbGRyZW4oQ2RrVHJlZU5vZGVEZWYsIHtcbiAgICAvLyBXZSBuZWVkIHRvIHVzZSBgZGVzY2VuZGFudHM6IHRydWVgLCBiZWNhdXNlIEl2eSB3aWxsIG5vIGxvbmdlciBtYXRjaFxuICAgIC8vIGluZGlyZWN0IGRlc2NlbmRhbnRzIGlmIGl0J3MgbGVmdCBhcyBmYWxzZS5cbiAgICBkZXNjZW5kYW50czogdHJ1ZVxuICB9KSBfbm9kZURlZnM6IFF1ZXJ5TGlzdDxDZGtUcmVlTm9kZURlZjxUPj47XG5cbiAgLy8gVE9ETyh0aW5heXVhbmdhbyk6IFNldHVwIGEgbGlzdGVuZXIgZm9yIHNjcm9sbGluZywgZW1pdCB0aGUgY2FsY3VsYXRlZCB2aWV3IHRvIHZpZXdDaGFuZ2UuXG4gIC8vICAgICBSZW1vdmUgdGhlIE1BWF9WQUxVRSBpbiB2aWV3Q2hhbmdlXG4gIC8qKlxuICAgKiBTdHJlYW0gY29udGFpbmluZyB0aGUgbGF0ZXN0IGluZm9ybWF0aW9uIG9uIHdoYXQgcm93cyBhcmUgYmVpbmcgZGlzcGxheWVkIG9uIHNjcmVlbi5cbiAgICogQ2FuIGJlIHVzZWQgYnkgdGhlIGRhdGEgc291cmNlIHRvIGFzIGEgaGV1cmlzdGljIG9mIHdoYXQgZGF0YSBzaG91bGQgYmUgcHJvdmlkZWQuXG4gICAqL1xuICByZWFkb25seSB2aWV3Q2hhbmdlID1cbiAgICBuZXcgQmVoYXZpb3JTdWJqZWN0PHtzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlcn0+KHtzdGFydDogMCwgZW5kOiBOdW1iZXIuTUFYX1ZBTFVFfSk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfZGlmZmVyczogSXRlcmFibGVEaWZmZXJzLFxuICAgICAgICAgICAgICBwcml2YXRlIF9jaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYpIHt9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgdGhpcy5fZGF0YURpZmZlciA9IHRoaXMuX2RpZmZlcnMuZmluZChbXSkuY3JlYXRlKHRoaXMudHJhY2tCeSk7XG4gICAgaWYgKCF0aGlzLnRyZWVDb250cm9sICYmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpKSB7XG4gICAgICB0aHJvdyBnZXRUcmVlQ29udHJvbE1pc3NpbmdFcnJvcigpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuX25vZGVPdXRsZXQudmlld0NvbnRhaW5lci5jbGVhcigpO1xuXG4gICAgdGhpcy52aWV3Q2hhbmdlLmNvbXBsZXRlKCk7XG4gICAgdGhpcy5fb25EZXN0cm95Lm5leHQoKTtcbiAgICB0aGlzLl9vbkRlc3Ryb3kuY29tcGxldGUoKTtcblxuICAgIGlmICh0aGlzLl9kYXRhU291cmNlICYmIHR5cGVvZiAodGhpcy5fZGF0YVNvdXJjZSBhcyBEYXRhU291cmNlPFQ+KS5kaXNjb25uZWN0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAodGhpcy5kYXRhU291cmNlIGFzIERhdGFTb3VyY2U8VD4pLmRpc2Nvbm5lY3QodGhpcyk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2RhdGFTdWJzY3JpcHRpb24pIHtcbiAgICAgIHRoaXMuX2RhdGFTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICAgIHRoaXMuX2RhdGFTdWJzY3JpcHRpb24gPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIG5nQWZ0ZXJDb250ZW50Q2hlY2tlZCgpIHtcbiAgICBjb25zdCBkZWZhdWx0Tm9kZURlZnMgPSB0aGlzLl9ub2RlRGVmcy5maWx0ZXIoZGVmID0+ICFkZWYud2hlbik7XG4gICAgaWYgKGRlZmF1bHROb2RlRGVmcy5sZW5ndGggPiAxICYmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpKSB7XG4gICAgICB0aHJvdyBnZXRUcmVlTXVsdGlwbGVEZWZhdWx0Tm9kZURlZnNFcnJvcigpO1xuICAgIH1cbiAgICB0aGlzLl9kZWZhdWx0Tm9kZURlZiA9IGRlZmF1bHROb2RlRGVmc1swXTtcblxuICAgIGlmICh0aGlzLmRhdGFTb3VyY2UgJiYgdGhpcy5fbm9kZURlZnMgJiYgIXRoaXMuX2RhdGFTdWJzY3JpcHRpb24pIHtcbiAgICAgIHRoaXMuX29ic2VydmVSZW5kZXJDaGFuZ2VzKCk7XG4gICAgfVxuICB9XG5cblxuICAvLyBUT0RPKHRpbmF5dWFuZ2FvKTogV29yayBvbiBrZXlib2FyZCB0cmF2ZXJzYWwgYW5kIGFjdGlvbnMsIG1ha2Ugc3VyZSBpdCdzIHdvcmtpbmcgZm9yIFJUTFxuICAvLyAgICAgYW5kIG5lc3RlZCB0cmVlcy5cblxuICAvKipcbiAgICogU3dpdGNoIHRvIHRoZSBwcm92aWRlZCBkYXRhIHNvdXJjZSBieSByZXNldHRpbmcgdGhlIGRhdGEgYW5kIHVuc3Vic2NyaWJpbmcgZnJvbSB0aGUgY3VycmVudFxuICAgKiByZW5kZXIgY2hhbmdlIHN1YnNjcmlwdGlvbiBpZiBvbmUgZXhpc3RzLiBJZiB0aGUgZGF0YSBzb3VyY2UgaXMgbnVsbCwgaW50ZXJwcmV0IHRoaXMgYnlcbiAgICogY2xlYXJpbmcgdGhlIG5vZGUgb3V0bGV0LiBPdGhlcndpc2Ugc3RhcnQgbGlzdGVuaW5nIGZvciBuZXcgZGF0YS5cbiAgICovXG4gIHByaXZhdGUgX3N3aXRjaERhdGFTb3VyY2UoZGF0YVNvdXJjZTogRGF0YVNvdXJjZTxUPiB8IE9ic2VydmFibGU8VFtdPiB8IFRbXSkge1xuICAgIGlmICh0aGlzLl9kYXRhU291cmNlICYmIHR5cGVvZiAodGhpcy5fZGF0YVNvdXJjZSBhcyBEYXRhU291cmNlPFQ+KS5kaXNjb25uZWN0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAodGhpcy5kYXRhU291cmNlIGFzIERhdGFTb3VyY2U8VD4pLmRpc2Nvbm5lY3QodGhpcyk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2RhdGFTdWJzY3JpcHRpb24pIHtcbiAgICAgIHRoaXMuX2RhdGFTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICAgIHRoaXMuX2RhdGFTdWJzY3JpcHRpb24gPSBudWxsO1xuICAgIH1cblxuICAgIC8vIFJlbW92ZSB0aGUgYWxsIGRhdGFOb2RlcyBpZiB0aGVyZSBpcyBub3cgbm8gZGF0YSBzb3VyY2VcbiAgICBpZiAoIWRhdGFTb3VyY2UpIHtcbiAgICAgIHRoaXMuX25vZGVPdXRsZXQudmlld0NvbnRhaW5lci5jbGVhcigpO1xuICAgIH1cblxuICAgIHRoaXMuX2RhdGFTb3VyY2UgPSBkYXRhU291cmNlO1xuICAgIGlmICh0aGlzLl9ub2RlRGVmcykge1xuICAgICAgdGhpcy5fb2JzZXJ2ZVJlbmRlckNoYW5nZXMoKTtcbiAgICB9XG4gIH1cblxuICAvKiogU2V0IHVwIGEgc3Vic2NyaXB0aW9uIGZvciB0aGUgZGF0YSBwcm92aWRlZCBieSB0aGUgZGF0YSBzb3VyY2UuICovXG4gIHByaXZhdGUgX29ic2VydmVSZW5kZXJDaGFuZ2VzKCkge1xuICAgIGxldCBkYXRhU3RyZWFtOiBPYnNlcnZhYmxlPHJlYWRvbmx5IFRbXT4gfCB1bmRlZmluZWQ7XG5cbiAgICBpZiAoaXNEYXRhU291cmNlKHRoaXMuX2RhdGFTb3VyY2UpKSB7XG4gICAgICBkYXRhU3RyZWFtID0gdGhpcy5fZGF0YVNvdXJjZS5jb25uZWN0KHRoaXMpO1xuICAgIH0gZWxzZSBpZiAoaXNPYnNlcnZhYmxlKHRoaXMuX2RhdGFTb3VyY2UpKSB7XG4gICAgICBkYXRhU3RyZWFtID0gdGhpcy5fZGF0YVNvdXJjZTtcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkodGhpcy5fZGF0YVNvdXJjZSkpIHtcbiAgICAgIGRhdGFTdHJlYW0gPSBvYnNlcnZhYmxlT2YodGhpcy5fZGF0YVNvdXJjZSk7XG4gICAgfVxuXG4gICAgaWYgKGRhdGFTdHJlYW0pIHtcbiAgICAgIHRoaXMuX2RhdGFTdWJzY3JpcHRpb24gPSBkYXRhU3RyZWFtLnBpcGUodGFrZVVudGlsKHRoaXMuX29uRGVzdHJveSkpXG4gICAgICAgIC5zdWJzY3JpYmUoZGF0YSA9PiB0aGlzLnJlbmRlck5vZGVDaGFuZ2VzKGRhdGEpKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkge1xuICAgICAgdGhyb3cgZ2V0VHJlZU5vVmFsaWREYXRhU291cmNlRXJyb3IoKTtcbiAgICB9XG4gIH1cblxuICAvKiogQ2hlY2sgZm9yIGNoYW5nZXMgbWFkZSBpbiB0aGUgZGF0YSBhbmQgcmVuZGVyIGVhY2ggY2hhbmdlIChub2RlIGFkZGVkL3JlbW92ZWQvbW92ZWQpLiAqL1xuICByZW5kZXJOb2RlQ2hhbmdlcyhkYXRhOiByZWFkb25seSBUW10sIGRhdGFEaWZmZXI6IEl0ZXJhYmxlRGlmZmVyPFQ+ID0gdGhpcy5fZGF0YURpZmZlcixcbiAgICAgICAgICAgICAgICAgICAgdmlld0NvbnRhaW5lcjogVmlld0NvbnRhaW5lclJlZiA9IHRoaXMuX25vZGVPdXRsZXQudmlld0NvbnRhaW5lcixcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50RGF0YT86IFQpIHtcbiAgICBjb25zdCBjaGFuZ2VzID0gZGF0YURpZmZlci5kaWZmKGRhdGEpO1xuICAgIGlmICghY2hhbmdlcykgeyByZXR1cm47IH1cblxuICAgIGNoYW5nZXMuZm9yRWFjaE9wZXJhdGlvbigoaXRlbTogSXRlcmFibGVDaGFuZ2VSZWNvcmQ8VD4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGp1c3RlZFByZXZpb3VzSW5kZXg6IG51bWJlciB8IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50SW5kZXg6IG51bWJlciB8IG51bGwpID0+IHtcbiAgICAgICAgaWYgKGl0ZW0ucHJldmlvdXNJbmRleCA9PSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5pbnNlcnROb2RlKGRhdGFbY3VycmVudEluZGV4IV0sIGN1cnJlbnRJbmRleCEsIHZpZXdDb250YWluZXIsIHBhcmVudERhdGEpO1xuICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRJbmRleCA9PSBudWxsKSB7XG4gICAgICAgICAgdmlld0NvbnRhaW5lci5yZW1vdmUoYWRqdXN0ZWRQcmV2aW91c0luZGV4ISk7XG4gICAgICAgICAgdGhpcy5fbGV2ZWxzLmRlbGV0ZShpdGVtLml0ZW0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IHZpZXcgPSB2aWV3Q29udGFpbmVyLmdldChhZGp1c3RlZFByZXZpb3VzSW5kZXghKTtcbiAgICAgICAgICB2aWV3Q29udGFpbmVyLm1vdmUodmlldyEsIGN1cnJlbnRJbmRleCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYuZGV0ZWN0Q2hhbmdlcygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpbmRzIHRoZSBtYXRjaGluZyBub2RlIGRlZmluaXRpb24gdGhhdCBzaG91bGQgYmUgdXNlZCBmb3IgdGhpcyBub2RlIGRhdGEuIElmIHRoZXJlIGlzIG9ubHlcbiAgICogb25lIG5vZGUgZGVmaW5pdGlvbiwgaXQgaXMgcmV0dXJuZWQuIE90aGVyd2lzZSwgZmluZCB0aGUgbm9kZSBkZWZpbml0aW9uIHRoYXQgaGFzIGEgd2hlblxuICAgKiBwcmVkaWNhdGUgdGhhdCByZXR1cm5zIHRydWUgd2l0aCB0aGUgZGF0YS4gSWYgbm9uZSByZXR1cm4gdHJ1ZSwgcmV0dXJuIHRoZSBkZWZhdWx0IG5vZGVcbiAgICogZGVmaW5pdGlvbi5cbiAgICovXG4gIF9nZXROb2RlRGVmKGRhdGE6IFQsIGk6IG51bWJlcik6IENka1RyZWVOb2RlRGVmPFQ+IHtcbiAgICBpZiAodGhpcy5fbm9kZURlZnMubGVuZ3RoID09PSAxKSB7IHJldHVybiB0aGlzLl9ub2RlRGVmcy5maXJzdDsgfVxuXG4gICAgY29uc3Qgbm9kZURlZiA9XG4gICAgICB0aGlzLl9ub2RlRGVmcy5maW5kKGRlZiA9PiBkZWYud2hlbiAmJiBkZWYud2hlbihpLCBkYXRhKSkgfHwgdGhpcy5fZGVmYXVsdE5vZGVEZWY7XG5cbiAgICBpZiAoIW5vZGVEZWYgJiYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpIHtcbiAgICAgIHRocm93IGdldFRyZWVNaXNzaW5nTWF0Y2hpbmdOb2RlRGVmRXJyb3IoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbm9kZURlZiE7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIHRoZSBlbWJlZGRlZCB2aWV3IGZvciB0aGUgZGF0YSBub2RlIHRlbXBsYXRlIGFuZCBwbGFjZSBpdCBpbiB0aGUgY29ycmVjdCBpbmRleCBsb2NhdGlvblxuICAgKiB3aXRoaW4gdGhlIGRhdGEgbm9kZSB2aWV3IGNvbnRhaW5lci5cbiAgICovXG4gIGluc2VydE5vZGUobm9kZURhdGE6IFQsIGluZGV4OiBudW1iZXIsIHZpZXdDb250YWluZXI/OiBWaWV3Q29udGFpbmVyUmVmLCBwYXJlbnREYXRhPzogVCkge1xuICAgIGNvbnN0IG5vZGUgPSB0aGlzLl9nZXROb2RlRGVmKG5vZGVEYXRhLCBpbmRleCk7XG5cbiAgICAvLyBOb2RlIGNvbnRleHQgdGhhdCB3aWxsIGJlIHByb3ZpZGVkIHRvIGNyZWF0ZWQgZW1iZWRkZWQgdmlld1xuICAgIGNvbnN0IGNvbnRleHQgPSBuZXcgQ2RrVHJlZU5vZGVPdXRsZXRDb250ZXh0PFQ+KG5vZGVEYXRhKTtcblxuICAgIC8vIElmIHRoZSB0cmVlIGlzIGZsYXQgdHJlZSwgdGhlbiB1c2UgdGhlIGBnZXRMZXZlbGAgZnVuY3Rpb24gaW4gZmxhdCB0cmVlIGNvbnRyb2xcbiAgICAvLyBPdGhlcndpc2UsIHVzZSB0aGUgbGV2ZWwgb2YgcGFyZW50IG5vZGUuXG4gICAgaWYgKHRoaXMudHJlZUNvbnRyb2wuZ2V0TGV2ZWwpIHtcbiAgICAgIGNvbnRleHQubGV2ZWwgPSB0aGlzLnRyZWVDb250cm9sLmdldExldmVsKG5vZGVEYXRhKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBwYXJlbnREYXRhICE9PSAndW5kZWZpbmVkJyAmJiB0aGlzLl9sZXZlbHMuaGFzKHBhcmVudERhdGEpKSB7XG4gICAgICBjb250ZXh0LmxldmVsID0gdGhpcy5fbGV2ZWxzLmdldChwYXJlbnREYXRhKSEgKyAxO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb250ZXh0LmxldmVsID0gMDtcbiAgICB9XG4gICAgdGhpcy5fbGV2ZWxzLnNldChub2RlRGF0YSwgY29udGV4dC5sZXZlbCk7XG5cbiAgICAvLyBVc2UgZGVmYXVsdCB0cmVlIG5vZGVPdXRsZXQsIG9yIG5lc3RlZCBub2RlJ3Mgbm9kZU91dGxldFxuICAgIGNvbnN0IGNvbnRhaW5lciA9IHZpZXdDb250YWluZXIgPyB2aWV3Q29udGFpbmVyIDogdGhpcy5fbm9kZU91dGxldC52aWV3Q29udGFpbmVyO1xuICAgIGNvbnRhaW5lci5jcmVhdGVFbWJlZGRlZFZpZXcobm9kZS50ZW1wbGF0ZSwgY29udGV4dCwgaW5kZXgpO1xuXG4gICAgLy8gU2V0IHRoZSBkYXRhIHRvIGp1c3QgY3JlYXRlZCBgQ2RrVHJlZU5vZGVgLlxuICAgIC8vIFRoZSBgQ2RrVHJlZU5vZGVgIGNyZWF0ZWQgZnJvbSBgY3JlYXRlRW1iZWRkZWRWaWV3YCB3aWxsIGJlIHNhdmVkIGluIHN0YXRpYyB2YXJpYWJsZVxuICAgIC8vICAgICBgbW9zdFJlY2VudFRyZWVOb2RlYC4gV2UgZ2V0IGl0IGZyb20gc3RhdGljIHZhcmlhYmxlIGFuZCBwYXNzIHRoZSBub2RlIGRhdGEgdG8gaXQuXG4gICAgaWYgKENka1RyZWVOb2RlLm1vc3RSZWNlbnRUcmVlTm9kZSkge1xuICAgICAgQ2RrVHJlZU5vZGUubW9zdFJlY2VudFRyZWVOb2RlLmRhdGEgPSBub2RlRGF0YTtcbiAgICB9XG4gIH1cbn1cblxuXG4vKipcbiAqIFRyZWUgbm9kZSBmb3IgQ2RrVHJlZS4gSXQgY29udGFpbnMgdGhlIGRhdGEgaW4gdGhlIHRyZWUgbm9kZS5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnY2RrLXRyZWUtbm9kZScsXG4gIGV4cG9ydEFzOiAnY2RrVHJlZU5vZGUnLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtUcmVlTm9kZTxULCBLID0gVD4gaW1wbGVtZW50cyBEb0NoZWNrLCBGb2N1c2FibGVPcHRpb24sIE9uRGVzdHJveSwgT25Jbml0IHtcbiAgLyoqXG4gICAqIFRoZSByb2xlIG9mIHRoZSB0cmVlIG5vZGUuXG4gICAqIEBkZXByZWNhdGVkIFRoZSBjb3JyZWN0IHJvbGUgaXMgJ3RyZWVpdGVtJywgJ2dyb3VwJyBzaG91bGQgbm90IGJlIHVzZWQuIFRoaXMgaW5wdXQgd2lsbCBiZVxuICAgKiAgIHJlbW92ZWQgaW4gYSBmdXR1cmUgdmVyc2lvbi5cbiAgICogQGJyZWFraW5nLWNoYW5nZSAxMi4wLjAgUmVtb3ZlIHRoaXMgaW5wdXRcbiAgICovXG4gIEBJbnB1dCgpIGdldCByb2xlKCk6ICd0cmVlaXRlbSd8J2dyb3VwJyB7IHJldHVybiAndHJlZWl0ZW0nOyB9XG5cbiAgc2V0IHJvbGUoX3JvbGU6ICd0cmVlaXRlbSd8J2dyb3VwJykge1xuICAgIC8vIFRPRE86IG1vdmUgdG8gaG9zdCBhZnRlciBWaWV3IEVuZ2luZSBkZXByZWNhdGlvblxuICAgIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCBfcm9sZSk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIG1vc3QgcmVjZW50bHkgY3JlYXRlZCBgQ2RrVHJlZU5vZGVgLiBXZSBzYXZlIGl0IGluIHN0YXRpYyB2YXJpYWJsZSBzbyB3ZSBjYW4gcmV0cmlldmUgaXRcbiAgICogaW4gYENka1RyZWVgIGFuZCBzZXQgdGhlIGRhdGEgdG8gaXQuXG4gICAqL1xuICBzdGF0aWMgbW9zdFJlY2VudFRyZWVOb2RlOiBDZGtUcmVlTm9kZTxhbnk+IHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIFN1YmplY3QgdGhhdCBlbWl0cyB3aGVuIHRoZSBjb21wb25lbnQgaGFzIGJlZW4gZGVzdHJveWVkLiAqL1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgX2Rlc3Ryb3llZCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIG5vZGUncyBkYXRhIGhhcyBjaGFuZ2VkLiAqL1xuICByZWFkb25seSBfZGF0YUNoYW5nZXMgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIHByaXZhdGUgX3BhcmVudE5vZGVBcmlhTGV2ZWw6IG51bWJlcjtcblxuICAvKiogVGhlIHRyZWUgbm9kZSdzIGRhdGEuICovXG4gIGdldCBkYXRhKCk6IFQgeyByZXR1cm4gdGhpcy5fZGF0YTsgfVxuICBzZXQgZGF0YSh2YWx1ZTogVCkge1xuICAgIGlmICh2YWx1ZSAhPT0gdGhpcy5fZGF0YSkge1xuICAgICAgdGhpcy5fZGF0YSA9IHZhbHVlO1xuICAgICAgdGhpcy5fc2V0Um9sZUZyb21EYXRhKCk7XG4gICAgICB0aGlzLl9kYXRhQ2hhbmdlcy5uZXh0KCk7XG4gICAgfVxuICB9XG4gIHByb3RlY3RlZCBfZGF0YTogVDtcblxuICBnZXQgaXNFeHBhbmRlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fdHJlZS50cmVlQ29udHJvbC5pc0V4cGFuZGVkKHRoaXMuX2RhdGEpO1xuICB9XG5cbiAgcHJpdmF0ZSBfc2V0RXhwYW5kZWQoX2V4cGFuZGVkOiBib29sZWFuKSB7XG4gICAgdGhpcy5faXNBcmlhRXhwYW5kZWQgPSBfZXhwYW5kZWQ7XG4gICAgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsIGAke19leHBhbmRlZH1gKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBfaXNBcmlhRXhwYW5kZWQ6IGJvb2xlYW47XG5cbiAgZ2V0IGxldmVsKCk6IG51bWJlciB7XG4gICAvLyBJZiB0aGUgdHJlZUNvbnRyb2wgaGFzIGEgZ2V0TGV2ZWwgbWV0aG9kLCB1c2UgaXQgdG8gZ2V0IHRoZSBsZXZlbC4gT3RoZXJ3aXNlIHJlYWQgdGhlXG4gICAvLyBhcmlhLWxldmVsIG9mZiB0aGUgcGFyZW50IG5vZGUgYW5kIHVzZSBpdCBhcyB0aGUgbGV2ZWwgZm9yIHRoaXMgbm9kZSAobm90ZSBhcmlhLWxldmVsIGlzXG4gICAvLyAxLWluZGV4ZWQsIHdoaWxlIHRoaXMgcHJvcGVydHkgaXMgMC1pbmRleGVkLCBzbyB3ZSBkb24ndCBuZWVkIHRvIGluY3JlbWVudCkuXG4gICByZXR1cm4gdGhpcy5fdHJlZS50cmVlQ29udHJvbC5nZXRMZXZlbCA/XG4gICAgIHRoaXMuX3RyZWUudHJlZUNvbnRyb2wuZ2V0TGV2ZWwodGhpcy5fZGF0YSkgOiB0aGlzLl9wYXJlbnROb2RlQXJpYUxldmVsO1xuICAgfVxuXG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCBfZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgICAgICAgICAgIHByb3RlY3RlZCBfdHJlZTogQ2RrVHJlZTxULCBLPikge1xuICAgIENka1RyZWVOb2RlLm1vc3RSZWNlbnRUcmVlTm9kZSA9IHRoaXMgYXMgQ2RrVHJlZU5vZGU8VCwgSz47XG4gICAgLy8gVGhlIGNsYXNzZXMgYXJlIGRpcmVjdGx5IGFkZGVkIGhlcmUgaW5zdGVhZCBvZiBpbiB0aGUgaG9zdCBwcm9wZXJ0eSBiZWNhdXNlIGNsYXNzZXMgb25cbiAgICAvLyB0aGUgaG9zdCBwcm9wZXJ0eSBhcmUgbm90IGluaGVyaXRlZCB3aXRoIFZpZXcgRW5naW5lLiBJdCBpcyBub3Qgc2V0IGFzIGEgQEhvc3RCaW5kaW5nIGJlY2F1c2VcbiAgICAvLyBpdCBpcyBub3Qgc2V0IGJ5IHRoZSB0aW1lIGl0J3MgY2hpbGRyZW4gbm9kZXMgdHJ5IHRvIHJlYWQgdGhlIGNsYXNzIGZyb20gaXQuXG4gICAgLy8gVE9ETzogbW92ZSB0byBob3N0IGFmdGVyIFZpZXcgRW5naW5lIGRlcHJlY2F0aW9uXG4gICAgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2Nkay10cmVlLW5vZGUnKTtcbiAgICB0aGlzLnJvbGUgPSAndHJlZWl0ZW0nO1xuICB9XG5cbiAgbmdPbkluaXQoKTogdm9pZCB7XG4gICAgdGhpcy5fcGFyZW50Tm9kZUFyaWFMZXZlbCA9IGdldFBhcmVudE5vZGVBcmlhTGV2ZWwodGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50KTtcbiAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuc2V0QXR0cmlidXRlKCdhcmlhLWxldmVsJywgYCR7dGhpcy5sZXZlbCArIDF9YCk7XG4gIH1cblxuICBuZ0RvQ2hlY2soKSB7XG4gICAgLy8gYXJpYS1leHBhbmRlZCBpcyBiZSBzZXQgaGVyZSBiZWNhdXNlIHRoZSBleHBhbmRlZCBzdGF0ZSBpcyBzdG9yZWQgaW4gdGhlIHRyZWUgY29udHJvbCBhbmRcbiAgICAvLyB0aGUgbm9kZSBpc24ndCBhd2FyZSB3aGVuIHRoZSBzdGF0ZSBpcyBjaGFuZ2VkLlxuICAgIC8vIEl0IGlzIG5vdCBzZXQgdXNpbmcgYSBASG9zdEJpbmRpbmcgYmVjYXVzZSB0aGV5IHNvbWV0aW1lcyBnZXQgbG9zdCB3aXRoIE1peGluIGJhc2VkIGNsYXNzZXMuXG4gICAgLy8gVE9ETzogbW92ZSB0byBob3N0IGFmdGVyIFZpZXcgRW5naW5lIGRlcHJlY2F0aW9uXG4gICAgaWYgKHRoaXMuaXNFeHBhbmRlZCAhPSB0aGlzLl9pc0FyaWFFeHBhbmRlZCkge1xuICAgICAgdGhpcy5fc2V0RXhwYW5kZWQodGhpcy5pc0V4cGFuZGVkKTtcbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICAvLyBJZiB0aGlzIGlzIHRoZSBsYXN0IHRyZWUgbm9kZSBiZWluZyBkZXN0cm95ZWQsXG4gICAgLy8gY2xlYXIgb3V0IHRoZSByZWZlcmVuY2UgdG8gYXZvaWQgbGVha2luZyBtZW1vcnkuXG4gICAgaWYgKENka1RyZWVOb2RlLm1vc3RSZWNlbnRUcmVlTm9kZSA9PT0gdGhpcykge1xuICAgICAgQ2RrVHJlZU5vZGUubW9zdFJlY2VudFRyZWVOb2RlID0gbnVsbDtcbiAgICB9XG5cbiAgICB0aGlzLl9kYXRhQ2hhbmdlcy5jb21wbGV0ZSgpO1xuICAgIHRoaXMuX2Rlc3Ryb3llZC5uZXh0KCk7XG4gICAgdGhpcy5fZGVzdHJveWVkLmNvbXBsZXRlKCk7XG4gIH1cblxuICAvKiogRm9jdXNlcyB0aGUgbWVudSBpdGVtLiBJbXBsZW1lbnRzIGZvciBGb2N1c2FibGVPcHRpb24uICovXG4gIGZvY3VzKCk6IHZvaWQge1xuICAgIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5mb2N1cygpO1xuICB9XG5cbiAgLy8gVE9ETzogcm9sZSBzaG91bGQgZXZlbnR1YWxseSBqdXN0IGJlIHNldCBpbiB0aGUgY29tcG9uZW50IGhvc3RcbiAgcHJvdGVjdGVkIF9zZXRSb2xlRnJvbURhdGEoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl90cmVlLnRyZWVDb250cm9sLmlzRXhwYW5kYWJsZSAmJiAhdGhpcy5fdHJlZS50cmVlQ29udHJvbC5nZXRDaGlsZHJlbiAmJlxuICAgICAgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpIHtcbiAgICAgIHRocm93IGdldFRyZWVDb250cm9sRnVuY3Rpb25zTWlzc2luZ0Vycm9yKCk7XG4gICAgfVxuICAgIHRoaXMucm9sZSA9ICd0cmVlaXRlbSc7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0UGFyZW50Tm9kZUFyaWFMZXZlbChub2RlRWxlbWVudDogSFRNTEVsZW1lbnQpOiBudW1iZXIge1xuICBsZXQgcGFyZW50ID0gbm9kZUVsZW1lbnQucGFyZW50RWxlbWVudDtcbiAgd2hpbGUgKHBhcmVudCAmJiAhaXNOb2RlRWxlbWVudChwYXJlbnQpKSB7XG4gICAgcGFyZW50ID0gcGFyZW50LnBhcmVudEVsZW1lbnQ7XG4gIH1cbiAgaWYgKCFwYXJlbnQpIHtcbiAgICBpZiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSB7XG4gICAgICB0aHJvdyBFcnJvcignSW5jb3JyZWN0IHRyZWUgc3RydWN0dXJlIGNvbnRhaW5pbmcgZGV0YWNoZWQgbm9kZS4nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIC0xO1xuICAgIH1cbiAgfSBlbHNlIGlmIChwYXJlbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdjZGstbmVzdGVkLXRyZWUtbm9kZScpKSB7XG4gICAgcmV0dXJuIGNvZXJjZU51bWJlclByb3BlcnR5KHBhcmVudC5nZXRBdHRyaWJ1dGUoJ2FyaWEtbGV2ZWwnKSEpO1xuICB9IGVsc2Uge1xuICAgIC8vIFRoZSBhbmNlc3RvciBlbGVtZW50IGlzIHRoZSBjZGstdHJlZSBpdHNlbGZcbiAgICByZXR1cm4gMDtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc05vZGVFbGVtZW50KGVsZW1lbnQ6IEhUTUxFbGVtZW50KSB7XG4gIGNvbnN0IGNsYXNzTGlzdCA9IGVsZW1lbnQuY2xhc3NMaXN0O1xuICByZXR1cm4gISEoY2xhc3NMaXN0Py5jb250YWlucygnY2RrLW5lc3RlZC10cmVlLW5vZGUnKSB8fCBjbGFzc0xpc3Q/LmNvbnRhaW5zKCdjZGstdHJlZScpKTtcbn1cbiJdfQ==