/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { DOCUMENT } from '@angular/common';
import { ANIMATION_MODULE_TYPE, Inject, inject, Injectable, RendererFactory2, ViewEncapsulation, ɵRuntimeError as RuntimeError, } from '@angular/core';
import { sequence } from './animation_metadata';
import * as i0 from "@angular/core";
/**
 * An injectable service that produces an animation sequence programmatically within an
 * Angular component or directive.
 * Provided by the `BrowserAnimationsModule` or `NoopAnimationsModule`.
 *
 * @usageNotes
 *
 * To use this service, add it to your component or directive as a dependency.
 * The service is instantiated along with your component.
 *
 * Apps do not typically need to create their own animation players, but if you
 * do need to, follow these steps:
 *
 * 1. Use the <code>[AnimationBuilder.build](api/animations/AnimationBuilder#build)()</code> method
 * to create a programmatic animation. The method returns an `AnimationFactory` instance.
 *
 * 2. Use the factory object to create an `AnimationPlayer` and attach it to a DOM element.
 *
 * 3. Use the player object to control the animation programmatically.
 *
 * For example:
 *
 * ```ts
 * // import the service from BrowserAnimationsModule
 * import {AnimationBuilder} from '@angular/animations';
 * // require the service as a dependency
 * class MyCmp {
 *   constructor(private _builder: AnimationBuilder) {}
 *
 *   makeAnimation(element: any) {
 *     // first define a reusable animation
 *     const myAnimation = this._builder.build([
 *       style({ width: 0 }),
 *       animate(1000, style({ width: '100px' }))
 *     ]);
 *
 *     // use the returned factory object to create a player
 *     const player = myAnimation.create(element);
 *
 *     player.play();
 *   }
 * }
 * ```
 *
 * @publicApi
 */
export class AnimationBuilder {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: AnimationBuilder, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: AnimationBuilder, providedIn: 'root', useFactory: () => inject(BrowserAnimationBuilder) }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: AnimationBuilder, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root', useFactory: () => inject(BrowserAnimationBuilder) }]
        }] });
/**
 * A factory object returned from the
 * <code>[AnimationBuilder.build](api/animations/AnimationBuilder#build)()</code>
 * method.
 *
 * @publicApi
 */
export class AnimationFactory {
}
export class BrowserAnimationBuilder extends AnimationBuilder {
    constructor(rootRenderer, doc) {
        super();
        this.animationModuleType = inject(ANIMATION_MODULE_TYPE, { optional: true });
        this._nextAnimationId = 0;
        const typeData = {
            id: '0',
            encapsulation: ViewEncapsulation.None,
            styles: [],
            data: { animation: [] },
        };
        this._renderer = rootRenderer.createRenderer(doc.body, typeData);
        if (this.animationModuleType === null && !isAnimationRenderer(this._renderer)) {
            // We only support AnimationRenderer & DynamicDelegationRenderer for this AnimationBuilder
            throw new RuntimeError(3600 /* RuntimeErrorCode.BROWSER_ANIMATION_BUILDER_INJECTED_WITHOUT_ANIMATIONS */, (typeof ngDevMode === 'undefined' || ngDevMode) &&
                'Angular detected that the `AnimationBuilder` was injected, but animation support was not enabled. ' +
                    'Please make sure that you enable animations in your application by calling `provideAnimations()` or `provideAnimationsAsync()` function.');
        }
    }
    build(animation) {
        const id = this._nextAnimationId;
        this._nextAnimationId++;
        const entry = Array.isArray(animation) ? sequence(animation) : animation;
        issueAnimationCommand(this._renderer, null, id, 'register', [entry]);
        return new BrowserAnimationFactory(id, this._renderer);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: BrowserAnimationBuilder, deps: [{ token: i0.RendererFactory2 }, { token: DOCUMENT }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: BrowserAnimationBuilder, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: BrowserAnimationBuilder, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: i0.RendererFactory2 }, { type: Document, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }] });
class BrowserAnimationFactory extends AnimationFactory {
    constructor(_id, _renderer) {
        super();
        this._id = _id;
        this._renderer = _renderer;
    }
    create(element, options) {
        return new RendererAnimationPlayer(this._id, element, options || {}, this._renderer);
    }
}
class RendererAnimationPlayer {
    constructor(id, element, options, _renderer) {
        this.id = id;
        this.element = element;
        this._renderer = _renderer;
        this.parentPlayer = null;
        this._started = false;
        this.totalTime = 0;
        this._command('create', options);
    }
    _listen(eventName, callback) {
        return this._renderer.listen(this.element, `@@${this.id}:${eventName}`, callback);
    }
    _command(command, ...args) {
        issueAnimationCommand(this._renderer, this.element, this.id, command, args);
    }
    onDone(fn) {
        this._listen('done', fn);
    }
    onStart(fn) {
        this._listen('start', fn);
    }
    onDestroy(fn) {
        this._listen('destroy', fn);
    }
    init() {
        this._command('init');
    }
    hasStarted() {
        return this._started;
    }
    play() {
        this._command('play');
        this._started = true;
    }
    pause() {
        this._command('pause');
    }
    restart() {
        this._command('restart');
    }
    finish() {
        this._command('finish');
    }
    destroy() {
        this._command('destroy');
    }
    reset() {
        this._command('reset');
        this._started = false;
    }
    setPosition(p) {
        this._command('setPosition', p);
    }
    getPosition() {
        return unwrapAnimationRenderer(this._renderer)?.engine?.players[this.id]?.getPosition() ?? 0;
    }
}
function issueAnimationCommand(renderer, element, id, command, args) {
    renderer.setProperty(element, `@@${id}:${command}`, args);
}
/**
 * The following 2 methods cannot reference their correct types (AnimationRenderer &
 * DynamicDelegationRenderer) since this would introduce a import cycle.
 */
function unwrapAnimationRenderer(renderer) {
    const type = renderer.ɵtype;
    if (type === 0 /* AnimationRendererType.Regular */) {
        return renderer;
    }
    else if (type === 1 /* AnimationRendererType.Delegated */) {
        return renderer.animationRenderer;
    }
    return null;
}
function isAnimationRenderer(renderer) {
    const type = renderer.ɵtype;
    return type === 0 /* AnimationRendererType.Regular */ || type === 1 /* AnimationRendererType.Delegated */;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX2J1aWxkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmltYXRpb25zL3NyYy9hbmltYXRpb25fYnVpbGRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFDSCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDekMsT0FBTyxFQUNMLHFCQUFxQixFQUNyQixNQUFNLEVBQ04sTUFBTSxFQUNOLFVBQVUsRUFFVixnQkFBZ0IsRUFFaEIsaUJBQWlCLEVBRWpCLGFBQWEsSUFBSSxZQUFZLEdBQzlCLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFBc0MsUUFBUSxFQUFDLE1BQU0sc0JBQXNCLENBQUM7O0FBSW5GOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E2Q0c7QUFFSCxNQUFNLE9BQWdCLGdCQUFnQjt5SEFBaEIsZ0JBQWdCOzZIQUFoQixnQkFBZ0IsY0FEYixNQUFNLGNBQWMsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLHVCQUF1QixDQUFDOztzR0FDNUQsZ0JBQWdCO2tCQURyQyxVQUFVO21CQUFDLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLHVCQUF1QixDQUFDLEVBQUM7O0FBV25GOzs7Ozs7R0FNRztBQUNILE1BQU0sT0FBZ0IsZ0JBQWdCO0NBV3JDO0FBR0QsTUFBTSxPQUFPLHVCQUF3QixTQUFRLGdCQUFnQjtJQUszRCxZQUFZLFlBQThCLEVBQW9CLEdBQWE7UUFDekUsS0FBSyxFQUFFLENBQUM7UUFMRix3QkFBbUIsR0FBRyxNQUFNLENBQUMscUJBQXFCLEVBQUUsRUFBQyxRQUFRLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztRQUN0RSxxQkFBZ0IsR0FBRyxDQUFDLENBQUM7UUFLM0IsTUFBTSxRQUFRLEdB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Q2xDLENBQUM7SUFFRCxXQUFXO1FBQ1QsT0FBTyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQy9GLENBQUM7Q0FHRjtBQUVELFNBQVMscUJBQXFCLENBQzVCLFFBQW1CLEVBQ25CLE9BQVksRUFDWixFQUFVLEVBQ1YsT0FBZSxFQUNmLElBQVc7SUFFWCxRQUFRLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsSUFBSSxPQUFPLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM1RCxDQUFDO0FBRUQ7OztHQUdHO0FBRUgsU0FBUyx1QkFBdUIsQ0FDOUIsUUFBbUI7SUFFbkIsTUFBTSxJQUFJLEdBQUksUUFBc0QsQ0FBQyxLQUFLLENBQUM7SUFDM0UsSUFBSSxJQUFJLDBDQUFrQyxFQUFFLENBQUM7UUFDM0MsT0FBTyxRQUFlLENBQUM7SUFDekIsQ0FBQztTQUFNLElBQUksSUFBSSw0Q0FBb0MsRUFBRSxDQUFDO1FBQ3BELE9BQVEsUUFBZ0IsQ0FBQyxpQkFBaUIsQ0FBQztJQUM3QyxDQUFDO0lBRUQsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDO0FBRUQsU0FBUyxtQkFBbUIsQ0FBQyxRQUFtQjtJQUM5QyxNQUFNLElBQUksR0FBSSxRQUFzRCxDQUFDLEtBQUssQ0FBQztJQUMzRSxPQUFPLElBQUksMENBQWtDLElBQUksSUFBSSw0Q0FBb0MsQ0FBQztBQUM1RixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7XG4gIEFOSU1BVElPTl9NT0RVTEVfVFlQRSxcbiAgSW5qZWN0LFxuICBpbmplY3QsXG4gIEluamVjdGFibGUsXG4gIFJlbmRlcmVyMixcbiAgUmVuZGVyZXJGYWN0b3J5MixcbiAgUmVuZGVyZXJUeXBlMixcbiAgVmlld0VuY2Fwc3VsYXRpb24sXG4gIMm1QW5pbWF0aW9uUmVuZGVyZXJUeXBlIGFzIEFuaW1hdGlvblJlbmRlcmVyVHlwZSxcbiAgybVSdW50aW1lRXJyb3IgYXMgUnVudGltZUVycm9yLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtBbmltYXRpb25NZXRhZGF0YSwgQW5pbWF0aW9uT3B0aW9ucywgc2VxdWVuY2V9IGZyb20gJy4vYW5pbWF0aW9uX21ldGFkYXRhJztcbmltcG9ydCB7UnVudGltZUVycm9yQ29kZX0gZnJvbSAnLi9lcnJvcnMnO1xuaW1wb3J0IHtBbmltYXRpb25QbGF5ZXJ9IGZyb20gJy4vcGxheWVycy9hbmltYXRpb25fcGxheWVyJztcblxuLyoqXG4gKiBBbiBpbmplY3RhYmxlIHNlcnZpY2UgdGhhdCBwcm9kdWNlcyBhbiBhbmltYXRpb24gc2VxdWVuY2UgcHJvZ3JhbW1hdGljYWxseSB3aXRoaW4gYW5cbiAqIEFuZ3VsYXIgY29tcG9uZW50IG9yIGRpcmVjdGl2ZS5cbiAqIFByb3ZpZGVkIGJ5IHRoZSBgQnJvd3NlckFuaW1hdGlvbnNNb2R1bGVgIG9yIGBOb29wQW5pbWF0aW9uc01vZHVsZWAuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiBUbyB1c2UgdGhpcyBzZXJ2aWNlLCBhZGQgaXQgdG8geW91ciBjb21wb25lbnQgb3IgZGlyZWN0aXZlIGFzIGEgZGVwZW5kZW5jeS5cbiAqIFRoZSBzZXJ2aWNlIGlzIGluc3RhbnRpYXRlZCBhbG9uZyB3aXRoIHlvdXIgY29tcG9uZW50LlxuICpcbiAqIEFwcHMgZG8gbm90IHR5cGljYWxseSBuZWVkIHRvIGNyZWF0ZSB0aGVpciBvd24gYW5pbWF0aW9uIHBsYXllcnMsIGJ1dCBpZiB5b3VcbiAqIGRvIG5lZWQgdG8sIGZvbGxvdyB0aGVzZSBzdGVwczpcbiAqXG4gKiAxLiBVc2UgdGhlIDxjb2RlPltBbmltYXRpb25CdWlsZGVyLmJ1aWxkXShhcGkvYW5pbWF0aW9ucy9BbmltYXRpb25CdWlsZGVyI2J1aWxkKSgpPC9jb2RlPiBtZXRob2RcbiAqIHRvIGNyZWF0ZSBhIHByb2dyYW1tYXRpYyBhbmltYXRpb24uIFRoZSBtZXRob2QgcmV0dXJucyBhbiBgQW5pbWF0aW9uRmFjdG9yeWAgaW5zdGFuY2UuXG4gKlxuICogMi4gVXNlIHRoZSBmYWN0b3J5IG9iamVjdCB0byBjcmVhdGUgYW4gYEFuaW1hdGlvblBsYXllcmAgYW5kIGF0dGFjaCBpdCB0byBhIERPTSBlbGVtZW50LlxuICpcbiAqIDMuIFVzZSB0aGUgcGxheWVyIG9iamVjdCB0byBjb250cm9sIHRoZSBhbmltYXRpb24gcHJvZ3JhbW1hdGljYWxseS5cbiAqXG4gKiBGb3IgZXhhbXBsZTpcbiAqXG4gKiBgYGB0c1xuICogLy8gaW1wb3J0IHRoZSBzZXJ2aWNlIGZyb20gQnJvd3NlckFuaW1hdGlvbnNNb2R1bGVcbiAqIGltcG9ydCB7QW5pbWF0aW9uQnVpbGRlcn0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG4gKiAvLyByZXF1aXJlIHRoZSBzZXJ2aWNlIGFzIGEgZGVwZW5kZW5jeVxuICogY2xhc3MgTXlDbXAge1xuICogICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9idWlsZGVyOiBBbmltYXRpb25CdWlsZGVyKSB7fVxuICpcbiAqICAgbWFrZUFuaW1hdGlvbihlbGVtZW50OiBhbnkpIHtcbiAqICAgICAvLyBmaXJzdCBkZWZpbmUgYSByZXVzYWJsZSBhbmltYXRpb25cbiAqICAgICBjb25zdCBteUFuaW1hdGlvbiA9IHRoaXMuX2J1aWxkZXIuYnVpbGQoW1xuICogICAgICAgc3R5bGUoeyB3aWR0aDogMCB9KSxcbiAqICAgICAgIGFuaW1hdGUoMTAwMCwgc3R5bGUoeyB3aWR0aDogJzEwMHB4JyB9KSlcbiAqICAgICBdKTtcbiAqXG4gKiAgICAgLy8gdXNlIHRoZSByZXR1cm5lZCBmYWN0b3J5IG9iamVjdCB0byBjcmVhdGUgYSBwbGF5ZXJcbiAqICAgICBjb25zdCBwbGF5ZXIgPSBteUFuaW1hdGlvbi5jcmVhdGUoZWxlbWVudCk7XG4gKlxuICogICAgIHBsYXllci5wbGF5KCk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290JywgdXNlRmFjdG9yeTogKCkgPT4gaW5qZWN0KEJyb3dzZXJBbmltYXRpb25CdWlsZGVyKX0pXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQW5pbWF0aW9uQnVpbGRlciB7XG4gIC8qKlxuICAgKiBCdWlsZHMgYSBmYWN0b3J5IGZvciBwcm9kdWNpbmcgYSBkZWZpbmVkIGFuaW1hdGlvbi5cbiAgICogQHBhcmFtIGFuaW1hdGlvbiBBIHJldXNhYmxlIGFuaW1hdGlvbiBkZWZpbml0aW9uLlxuICAgKiBAcmV0dXJucyBBIGZhY3Rvcnkgb2JqZWN0IHRoYXQgY2FuIGNyZWF0ZSBhIHBsYXllciBmb3IgdGhlIGRlZmluZWQgYW5pbWF0aW9uLlxuICAgKiBAc2VlIHtAbGluayBhbmltYXRlfVxuICAgKi9cbiAgYWJzdHJhY3QgYnVpbGQoYW5pbWF0aW9uOiBBbmltYXRpb25NZXRhZGF0YSB8IEFuaW1hdGlvbk1ldGFkYXRhW10pOiBBbmltYXRpb25GYWN0b3J5O1xufVxuXG4vKipcbiAqIEEgZmFjdG9yeSBvYmplY3QgcmV0dXJuZWQgZnJvbSB0aGVcbiAqIDxjb2RlPltBbmltYXRpb25CdWlsZGVyLmJ1aWxkXShhcGkvYW5pbWF0aW9ucy9BbmltYXRpb25CdWlsZGVyI2J1aWxkKSgpPC9jb2RlPlxuICogbWV0aG9kLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEFuaW1hdGlvbkZhY3Rvcnkge1xuICAvKipcbiAgICogQ3JlYXRlcyBhbiBgQW5pbWF0aW9uUGxheWVyYCBpbnN0YW5jZSBmb3IgdGhlIHJldXNhYmxlIGFuaW1hdGlvbiBkZWZpbmVkIGJ5XG4gICAqIHRoZSA8Y29kZT5bQW5pbWF0aW9uQnVpbGRlci5idWlsZF0oYXBpL2FuaW1hdGlvbnMvQW5pbWF0aW9uQnVpbGRlciNidWlsZCkoKTwvY29kZT5cbiAgICogbWV0aG9kIHRoYXQgY3JlYXRlZCB0aGlzIGZhY3RvcnkgYW5kIGF0dGFjaGVzIHRoZSBuZXcgcGxheWVyIGEgRE9NIGVsZW1lbnQuXG4gICAqXG4gICAqIEBwYXJhbSBlbGVtZW50IFRoZSBET00gZWxlbWVudCB0byB3aGljaCB0byBhdHRhY2ggdGhlIHBsYXllci5cbiAgICogQHBhcmFtIG9wdGlvbnMgQSBzZXQgb2Ygb3B0aW9ucyB0aGF0IGNhbiBpbmNsdWRlIGEgdGltZSBkZWxheSBhbmRcbiAgICogYWRkaXRpb25hbCBkZXZlbG9wZXItZGVmaW5lZCBwYXJhbWV0ZXJzLlxuICAgKi9cbiAgYWJzdHJhY3QgY3JlYXRlKGVsZW1lbnQ6IGFueSwgb3B0aW9ucz86IEFuaW1hdGlvbk9wdGlvbnMpOiBBbmltYXRpb25QbGF5ZXI7XG59XG5cbkBJbmplY3RhYmxlKHtwcm92aWRlZEluOiAncm9vdCd9KVxuZXhwb3J0IGNsYXNzIEJyb3dzZXJBbmltYXRpb25CdWlsZGVyIGV4dGVuZHMgQW5pbWF0aW9uQnVpbGRlciB7XG4gIHByaXZhdGUgYW5pbWF0aW9uTW9kdWxlVHlwZSA9IGluamVjdChBTklNQVRJT05fTU9EVUxFX1RZUEUsIHtvcHRpb25hbDogdHJ1ZX0pO1xuICBwcml2YXRlIF9uZXh0QW5pbWF0aW9uSWQgPSAwO1xuICBwcml2YXRlIF9yZW5kZXJlcjogUmVuZGVyZXIyO1xuXG4gIGNvbnN0cnVjdG9yKHJvb3RSZW5kZXJlcjogUmVuZGVyZXJGYWN0b3J5MiwgQEluamVjdChET0NVTUVOVCkgZG9jOiBEb2N1bWVudCkge1xuICAgIHN1cGVyKCk7XG4gICAgY29uc3QgdHlwZURhdGE6IFJlbmRlcmVyVHlwZTIgPSB7XG4gICAgICBpZDogJzAnLFxuICAgICAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgICAgIHN0eWxlczogW10sXG4gICAgICBkYXRhOiB7YW5pbWF0aW9uOiBbXX0sXG4gICAgfTtcbiAgICB0aGlzLl9yZW5kZXJlciA9IHJvb3RSZW5kZXJlci5jcmVhdGVSZW5kZXJlcihkb2MuYm9keSwgdHlwZURhdGEpO1xuXG4gICAgaWYgKHRoaXMuYW5pbWF0aW9uTW9kdWxlVHlwZSA9PT0gbnVsbCAmJiAhaXNBbmltYXRpb25SZW5kZXJlcih0aGlzLl9yZW5kZXJlcikpIHtcbiAgICAgIC8vIFdlIG9ubHkgc3VwcG9ydCBBbmltYXRpb25SZW5kZXJlciAmIER5bmFtaWNEZWxlZ2F0aW9uUmVuZGVyZXIgZm9yIHRoaXMgQW5pbWF0aW9uQnVpbGRlclxuXG4gICAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLkJST1dTRVJfQU5JTUFUSU9OX0JVSUxERVJfSU5KRUNURURfV0lUSE9VVF9BTklNQVRJT05TLFxuICAgICAgICAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSAmJlxuICAgICAgICAgICdBbmd1bGFyIGRldGVjdGVkIHRoYXQgdGhlIGBBbmltYXRpb25CdWlsZGVyYCB3YXMgaW5qZWN0ZWQsIGJ1dCBhbmltYXRpb24gc3VwcG9ydCB3YXMgbm90IGVuYWJsZWQuICcgK1xuICAgICAgICAgICAgJ1BsZWFzZSBtYWtlIHN1cmUgdGhhdCB5b3UgZW5hYmxlIGFuaW1hdGlvbnMgaW4geW91ciBhcHBsaWNhdGlvbiBieSBjYWxsaW5nIGBwcm92aWRlQW5pbWF0aW9ucygpYCBvciBgcHJvdmlkZUFuaW1hdGlvbnNBc3luYygpYCBmdW5jdGlvbi4nLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBvdmVycmlkZSBidWlsZChhbmltYXRpb246IEFuaW1hdGlvbk1ldGFkYXRhIHwgQW5pbWF0aW9uTWV0YWRhdGFbXSk6IEFuaW1hdGlvbkZhY3Rvcnkge1xuICAgIGNvbnN0IGlkID0gdGhpcy5fbmV4dEFuaW1hdGlvbklkO1xuICAgIHRoaXMuX25leHRBbmltYXRpb25JZCsrO1xuICAgIGNvbnN0IGVudHJ5ID0gQXJyYXkuaXNBcnJheShhbmltYXRpb24pID8gc2VxdWVuY2UoYW5pbWF0aW9uKSA6IGFuaW1hdGlvbjtcbiAgICBpc3N1ZUFuaW1hdGlvbkNvbW1hbmQodGhpcy5fcmVuZGVyZXIsIG51bGwsIGlkLCAncmVnaXN0ZXInLCBbZW50cnldKTtcbiAgICByZXR1cm4gbmV3IEJyb3dzZXJBbmltYXRpb25GYWN0b3J5KGlkLCB0aGlzLl9yZW5kZXJlcik7XG4gIH1cbn1cblxuY2xhc3MgQnJvd3NlckFuaW1hdGlvbkZhY3RvcnkgZXh0ZW5kcyBBbmltYXRpb25GYWN0b3J5IHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBfaWQ6IG51bWJlcixcbiAgICBwcml2YXRlIF9yZW5kZXJlcjogUmVuZGVyZXIyLFxuICApIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgb3ZlcnJpZGUgY3JlYXRlKGVsZW1lbnQ6IGFueSwgb3B0aW9ucz86IEFuaW1hdGlvbk9wdGlvbnMpOiBBbmltYXRpb25QbGF5ZXIge1xuICAgIHJldHVybiBuZXcgUmVuZGVyZXJBbmltYXRpb25QbGF5ZXIodGhpcy5faWQsIGVsZW1lbnQsIG9wdGlvbnMgfHwge30sIHRoaXMuX3JlbmRlcmVyKTtcbiAgfVxufVxuXG5jbGFzcyBSZW5kZXJlckFuaW1hdGlvblBsYXllciBpbXBsZW1lbnRzIEFuaW1hdGlvblBsYXllciB7XG4gIHB1YmxpYyBwYXJlbnRQbGF5ZXI6IEFuaW1hdGlvblBsYXllciB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIF9zdGFydGVkID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIGlkOiBudW1iZXIsXG4gICAgcHVibGljIGVsZW1lbnQ6IGFueSxcbiAgICBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zLFxuICAgIHByaXZhdGUgX3JlbmRlcmVyOiBSZW5kZXJlcjIsXG4gICkge1xuICAgIHRoaXMuX2NvbW1hbmQoJ2NyZWF0ZScsIG9wdGlvbnMpO1xuICB9XG5cbiAgcHJpdmF0ZSBfbGlzdGVuKGV2ZW50TmFtZTogc3RyaW5nLCBjYWxsYmFjazogKGV2ZW50OiBhbnkpID0+IGFueSk6ICgpID0+IHZvaWQge1xuICAgIHJldHVybiB0aGlzLl9yZW5kZXJlci5saXN0ZW4odGhpcy5lbGVtZW50LCBgQEAke3RoaXMuaWR9OiR7ZXZlbnROYW1lfWAsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbW1hbmQoY29tbWFuZDogc3RyaW5nLCAuLi5hcmdzOiBhbnlbXSk6IHZvaWQge1xuICAgIGlzc3VlQW5pbWF0aW9uQ29tbWFuZCh0aGlzLl9yZW5kZXJlciwgdGhpcy5lbGVtZW50LCB0aGlzLmlkLCBjb21tYW5kLCBhcmdzKTtcbiAgfVxuXG4gIG9uRG9uZShmbjogKCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRoaXMuX2xpc3RlbignZG9uZScsIGZuKTtcbiAgfVxuXG4gIG9uU3RhcnQoZm46ICgpID0+IHZvaWQpOiB2b2lkIHtcbiAgICB0aGlzLl9saXN0ZW4oJ3N0YXJ0JywgZm4pO1xuICB9XG5cbiAgb25EZXN0cm95KGZuOiAoKSA9PiB2b2lkKTogdm9pZCB7XG4gICAgdGhpcy5fbGlzdGVuKCdkZXN0cm95JywgZm4pO1xuICB9XG5cbiAgaW5pdCgpOiB2b2lkIHtcbiAgICB0aGlzLl9jb21tYW5kKCdpbml0Jyk7XG4gIH1cblxuICBoYXNTdGFydGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9zdGFydGVkO1xuICB9XG5cbiAgcGxheSgpOiB2b2lkIHtcbiAgICB0aGlzLl9jb21tYW5kKCdwbGF5Jyk7XG4gICAgdGhpcy5fc3RhcnRlZCA9IHRydWU7XG4gIH1cblxuICBwYXVzZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9jb21tYW5kKCdwYXVzZScpO1xuICB9XG5cbiAgcmVzdGFydCgpOiB2b2lkIHtcbiAgICB0aGlzLl9jb21tYW5kKCdyZXN0YXJ0Jyk7XG4gIH1cblxuICBmaW5pc2goKTogdm9pZCB7XG4gICAgdGhpcy5fY29tbWFuZCgnZmluaXNoJyk7XG4gIH1cblxuICBkZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMuX2NvbW1hbmQoJ2Rlc3Ryb3knKTtcbiAgfVxuXG4gIHJlc2V0KCk6IHZvaWQge1xuICAgIHRoaXMuX2NvbW1hbmQoJ3Jlc2V0Jyk7XG4gICAgdGhpcy5fc3RhcnRlZCA9IGZhbHNlO1xuICB9XG5cbiAgc2V0UG9zaXRpb24ocDogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5fY29tbWFuZCgnc2V0UG9zaXRpb24nLCBwKTtcbiAgfVxuXG4gIGdldFBvc2l0aW9uKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHVud3JhcEFuaW1hdGlvblJlbmRlcmVyKHRoaXMuX3JlbmRlcmVyKT8uZW5naW5lPy5wbGF5ZXJzW3RoaXMuaWRdPy5nZXRQb3NpdGlvbigpID8/IDA7XG4gIH1cblxuICBwdWJsaWMgdG90YWxUaW1lID0gMDtcbn1cblxuZnVuY3Rpb24gaXNzdWVBbmltYXRpb25Db21tYW5kKFxuICByZW5kZXJlcjogUmVuZGVyZXIyLFxuICBlbGVtZW50OiBhbnksXG4gIGlkOiBudW1iZXIsXG4gIGNvbW1hbmQ6IHN0cmluZyxcbiAgYXJnczogYW55W10sXG4pOiB2b2lkIHtcbiAgcmVuZGVyZXIuc2V0UHJvcGVydHkoZWxlbWVudCwgYEBAJHtpZH06JHtjb21tYW5kfWAsIGFyZ3MpO1xufVxuXG4vKipcbiAqIFRoZSBmb2xsb3dpbmcgMiBtZXRob2RzIGNhbm5vdCByZWZlcmVuY2UgdGhlaXIgY29ycmVjdCB0eXBlcyAoQW5pbWF0aW9uUmVuZGVyZXIgJlxuICogRHluYW1pY0RlbGVnYXRpb25SZW5kZXJlcikgc2luY2UgdGhpcyB3b3VsZCBpbnRyb2R1Y2UgYSBpbXBvcnQgY3ljbGUuXG4gKi9cblxuZnVuY3Rpb24gdW53cmFwQW5pbWF0aW9uUmVuZGVyZXIoXG4gIHJlbmRlcmVyOiBSZW5kZXJlcjIsXG4pOiB7ZW5naW5lOiB7cGxheWVyczogQW5pbWF0aW9uUGxheWVyW119fSB8IG51bGwge1xuICBjb25zdCB0eXBlID0gKHJlbmRlcmVyIGFzIHVua25vd24gYXMge8m1dHlwZTogQW5pbWF0aW9uUmVuZGVyZXJUeXBlfSkuybV0eXBlO1xuICBpZiAodHlwZSA9PT0gQW5pbWF0aW9uUmVuZGVyZXJUeXBlLlJlZ3VsYXIpIHtcbiAgICByZXR1cm4gcmVuZGVyZXIgYXMgYW55O1xuICB9IGVsc2UgaWYgKHR5cGUgPT09IEFuaW1hdGlvblJlbmRlcmVyVHlwZS5EZWxlZ2F0ZWQpIHtcbiAgICByZXR1cm4gKHJlbmRlcmVyIGFzIGFueSkuYW5pbWF0aW9uUmVuZGVyZXI7XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gaXNBbmltYXRpb25SZW5kZXJlcihyZW5kZXJlcjogUmVuZGVyZXIyKTogYm9vbGVhbiB7XG4gIGNvbnN0IHR5cGUgPSAocmVuZGVyZXIgYXMgdW5rbm93biBhcyB7ybV0eXBlOiBBbmltYXRpb25SZW5kZXJlclR5cGV9KS7JtXR5cGU7XG4gIHJldHVybiB0eXBlID09PSBBbmltYXRpb25SZW5kZXJlclR5cGUuUmVndWxhciB8fCB0eXBlID09PSBBbmltYXRpb25SZW5kZXJlclR5cGUuRGVsZWdhdGVkO1xufVxuIl19