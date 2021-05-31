/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ApplicationRef, ChangeDetectorRef, ComponentFactoryResolver, InjectionToken, Injector, OnDestroy, TemplateRef, ViewContainerRef } from '@angular/core';
import { Subject } from 'rxjs';
/**
 * Injection token that can be used to reference instances of `MatMenuContent`. It serves
 * as alternative token to the actual `MatMenuContent` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export declare const MAT_MENU_CONTENT: InjectionToken<MatMenuContent>;
/**
 * Menu content that will be rendered lazily once the menu is opened.
 */
export declare class MatMenuContent implements OnDestroy {
    private _template;
    private _componentFactoryResolver;
    private _appRef;
    private _injector;
    private _viewContainerRef;
    private _document;
    private _changeDetectorRef?;
    private _portal;
    private _outlet;
    /** Emits when the menu content has been attached. */
    readonly _attached: Subject<void>;
    constructor(_template: TemplateRef<any>, _componentFactoryResolver: ComponentFactoryResolver, _appRef: ApplicationRef, _injector: Injector, _viewContainerRef: ViewContainerRef, _document: any, _changeDetectorRef?: ChangeDetectorRef | undefined);
    /**
     * Attaches the content with a particular context.
     * @docs-private
     */
    attach(context?: any): void;
    /**
     * Detaches the content.
     * @docs-private
     */
    detach(): void;
    ngOnDestroy(): void;
}
