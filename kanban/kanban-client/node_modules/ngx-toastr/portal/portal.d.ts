import { ComponentRef, Injector, ViewContainerRef } from '@angular/core';
export interface ComponentType<T> {
    new (...args: any[]): T;
}
/**
 * A `ComponentPortal` is a portal that instantiates some Component upon attachment.
 */
export declare class ComponentPortal<T> {
    private _attachedHost?;
    /** The type of the component that will be instantiated for attachment. */
    component: ComponentType<T>;
    /**
     * [Optional] Where the attached component should live in Angular's *logical* component tree.
     * This is different from where the component *renders*, which is determined by the PortalHost.
     * The origin necessary when the host is outside of the Angular application context.
     */
    viewContainerRef: ViewContainerRef;
    /** Injector used for the instantiation of the component. */
    injector: Injector;
    constructor(component: ComponentType<T>, injector: Injector);
    /** Attach this portal to a host. */
    attach(host: BasePortalHost, newestOnTop: boolean): ComponentRef<any>;
    /** Detach this portal from its host */
    detach(): void;
    /** Whether this portal is attached to a host. */
    get isAttached(): boolean;
    /**
     * Sets the PortalHost reference without performing `attach()`. This is used directly by
     * the PortalHost when it is performing an `attach()` or `detach()`.
     */
    setAttachedHost(host?: BasePortalHost): void;
}
/**
 * Partial implementation of PortalHost that only deals with attaching a
 * ComponentPortal
 */
export declare abstract class BasePortalHost {
    /** The portal currently attached to the host. */
    private _attachedPortal?;
    /** A function that will permanently dispose this host. */
    private _disposeFn?;
    attach(portal: ComponentPortal<any>, newestOnTop: boolean): ComponentRef<any>;
    abstract attachComponentPortal<T>(portal: ComponentPortal<T>, newestOnTop: boolean): ComponentRef<T>;
    detach(): void;
    setDisposeFn(fn: () => void): void;
}
