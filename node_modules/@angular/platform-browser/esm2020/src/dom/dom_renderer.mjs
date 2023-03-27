/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { APP_ID, Inject, Injectable, InjectionToken, RendererStyleFlags2, ViewEncapsulation } from '@angular/core';
import { EventManager } from './events/event_manager';
import { DomSharedStylesHost } from './shared_styles_host';
import * as i0 from "@angular/core";
import * as i1 from "./events/event_manager";
import * as i2 from "./shared_styles_host";
export const NAMESPACE_URIS = {
    'svg': 'http://www.w3.org/2000/svg',
    'xhtml': 'http://www.w3.org/1999/xhtml',
    'xlink': 'http://www.w3.org/1999/xlink',
    'xml': 'http://www.w3.org/XML/1998/namespace',
    'xmlns': 'http://www.w3.org/2000/xmlns/',
    'math': 'http://www.w3.org/1998/MathML/',
};
const COMPONENT_REGEX = /%COMP%/g;
const NG_DEV_MODE = typeof ngDevMode === 'undefined' || !!ngDevMode;
export const COMPONENT_VARIABLE = '%COMP%';
export const HOST_ATTR = `_nghost-${COMPONENT_VARIABLE}`;
export const CONTENT_ATTR = `_ngcontent-${COMPONENT_VARIABLE}`;
/**
 * The default value for the `REMOVE_STYLES_ON_COMPONENT_DESTROY` DI token.
 */
const REMOVE_STYLES_ON_COMPONENT_DESTROY_DEFAULT = false;
/**
 * A [DI token](guide/glossary#di-token "DI token definition") that indicates whether styles
 * of destroyed components should be removed from DOM.
 *
 * By default, the value is set to `false`. This will be changed in the next major version.
 * @publicApi
 */
export const REMOVE_STYLES_ON_COMPONENT_DESTROY = new InjectionToken('RemoveStylesOnCompDestory', {
    providedIn: 'root',
    factory: () => REMOVE_STYLES_ON_COMPONENT_DESTROY_DEFAULT,
});
export function shimContentAttribute(componentShortId) {
    return CONTENT_ATTR.replace(COMPONENT_REGEX, componentShortId);
}
export function shimHostAttribute(componentShortId) {
    return HOST_ATTR.replace(COMPONENT_REGEX, componentShortId);
}
export function flattenStyles(compId, styles) {
    // Cannot use `Infinity` as depth as `infinity` is not a number literal in TypeScript.
    // See: https://github.com/microsoft/TypeScript/issues/32277
    return styles.flat(100).map(s => s.replace(COMPONENT_REGEX, compId));
}
function decoratePreventDefault(eventHandler) {
    // `DebugNode.triggerEventHandler` needs to know if the listener was created with
    // decoratePreventDefault or is a listener added outside the Angular context so it can handle the
    // two differently. In the first case, the special '__ngUnwrap__' token is passed to the unwrap
    // the listener (see below).
    return (event) => {
        // Ivy uses '__ngUnwrap__' as a special token that allows us to unwrap the function
        // so that it can be invoked programmatically by `DebugNode.triggerEventHandler`. The debug_node
        // can inspect the listener toString contents for the existence of this special token. Because
        // the token is a string literal, it is ensured to not be modified by compiled code.
        if (event === '__ngUnwrap__') {
            return eventHandler;
        }
        const allowDefaultBehavior = eventHandler(event);
        if (allowDefaultBehavior === false) {
            // TODO(tbosch): move preventDefault into event plugins...
            event.preventDefault();
            event.returnValue = false;
        }
        return undefined;
    };
}
export class DomRendererFactory2 {
    constructor(eventManager, sharedStylesHost, appId, removeStylesOnCompDestory) {
        this.eventManager = eventManager;
        this.sharedStylesHost = sharedStylesHost;
        this.appId = appId;
        this.removeStylesOnCompDestory = removeStylesOnCompDestory;
        this.rendererByCompId = new Map();
        this.defaultRenderer = new DefaultDomRenderer2(eventManager);
    }
    createRenderer(element, type) {
        if (!element || !type) {
            return this.defaultRenderer;
        }
        const renderer = this.getOrCreateRenderer(element, type);
        // Renderers have different logic due to different encapsulation behaviours.
        // Ex: for emulated, an attribute is added to the element.
        if (renderer instanceof EmulatedEncapsulationDomRenderer2) {
            renderer.applyToHost(element);
        }
        else if (renderer instanceof NoneEncapsulationDomRenderer) {
            renderer.applyStyles();
        }
        return renderer;
    }
    getOrCreateRenderer(element, type) {
        const rendererByCompId = this.rendererByCompId;
        let renderer = rendererByCompId.get(type.id);
        if (!renderer) {
            const eventManager = this.eventManager;
            const sharedStylesHost = this.sharedStylesHost;
            const removeStylesOnCompDestory = this.removeStylesOnCompDestory;
            switch (type.encapsulation) {
                case ViewEncapsulation.Emulated:
                    renderer = new EmulatedEncapsulationDomRenderer2(eventManager, sharedStylesHost, type, this.appId, removeStylesOnCompDestory);
                    break;
                case ViewEncapsulation.ShadowDom:
                    return new ShadowDomRenderer(eventManager, sharedStylesHost, element, type);
                default:
                    renderer = new NoneEncapsulationDomRenderer(eventManager, sharedStylesHost, type, removeStylesOnCompDestory);
                    break;
            }
            renderer.onDestroy = () => rendererByCompId.delete(type.id);
            rendererByCompId.set(type.id, renderer);
        }
        return renderer;
    }
    ngOnDestroy() {
        this.rendererByCompId.clear();
    }
    begin() { }
    end() { }
}
DomRendererFactory2.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0", ngImport: i0, type: DomRendererFactory2, deps: [{ token: i1.EventManager }, { token: i2.DomSharedStylesHost }, { token: APP_ID }, { token: REMOVE_STYLES_ON_COMPONENT_DESTROY }], target: i0.ɵɵFactoryTarget.Injectable });
DomRendererFactory2.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "15.2.0", ngImport: i0, type: DomRendererFactory2 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0", ngImport: i0, type: DomRendererFactory2, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.EventManager }, { type: i2.DomSharedStylesHost }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [APP_ID]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [REMOVE_STYLES_ON_COMPONENT_DESTROY]
                }] }]; } });
class DefaultDomRenderer2 {
    constructor(eventManager) {
        this.eventManager = eventManager;
        this.data = Object.create(null);
        this.destroyNode = null;
    }
    destroy() { }
    createElement(name, namespace) {
        if (namespace) {
            // TODO: `|| namespace` was added in
            // https://github.com/angular/angular/commit/2b9cc8503d48173492c29f5a271b61126104fbdb to
            // support how Ivy passed around the namespace URI rather than short name at the time. It did
            // not, however extend the support to other parts of the system (setAttribute, setAttribute,
            // and the ServerRenderer). We should decide what exactly the semantics for dealing with
            // namespaces should be and make it consistent.
            // Related issues:
            // https://github.com/angular/angular/issues/44028
            // https://github.com/angular/angular/issues/44883
            return document.createElementNS(NAMESPACE_URIS[namespace] || namespace, name);
        }
        return document.createElement(name);
    }
    createComment(value) {
        return document.createComment(value);
    }
    createText(value) {
        return document.createTextNode(value);
    }
    appendChild(parent, newChild) {
        const targetParent = isTemplateNode(parent) ? parent.content : parent;
        targetParent.appendChild(newChild);
    }
    insertBefore(parent, newChild, refChild) {
        if (parent) {
            const targetParent = isTemplateNode(parent) ? parent.content : parent;
            targetParent.insertBefore(newChild, refChild);
        }
    }
    removeChild(parent, oldChild) {
        if (parent) {
            parent.removeChild(oldChild);
        }
    }
    selectRootElement(selectorOrNode, preserveContent) {
        let el = typeof selectorOrNode === 'string' ? document.querySelector(selectorOrNode) :
            selectorOrNode;
        if (!el) {
            throw new Error(`The selector "${selectorOrNode}" did not match any elements`);
        }
        if (!preserveContent) {
            el.textContent = '';
        }
        return el;
    }
    parentNode(node) {
        return node.parentNode;
    }
    nextSibling(node) {
        return node.nextSibling;
    }
    setAttribute(el, name, value, namespace) {
        if (namespace) {
            name = namespace + ':' + name;
            const namespaceUri = NAMESPACE_URIS[namespace];
            if (namespaceUri) {
                el.setAttributeNS(namespaceUri, name, value);
            }
            else {
                el.setAttribute(name, value);
            }
        }
        else {
            el.setAttribute(name, value);
        }
    }
    removeAttribute(el, name, namespace) {
        if (namespace) {
            const namespaceUri = NAMESPACE_URIS[namespace];
            if (namespaceUri) {
                el.removeAttributeNS(namespaceUri, name);
            }
            else {
                el.removeAttribute(`${namespace}:${name}`);
            }
        }
        else {
            el.removeAttribute(name);
        }
    }
    addClass(el, name) {
        el.classList.add(name);
    }
    removeClass(el, name) {
        el.classList.remove(name);
    }
    setStyle(el, style, value, flags) {
        if (flags & (RendererStyleFlags2.DashCase | RendererStyleFlags2.Important)) {
            el.style.setProperty(style, value, flags & RendererStyleFlags2.Important ? 'important' : '');
        }
        else {
            el.style[style] = value;
        }
    }
    removeStyle(el, style, flags) {
        if (flags & RendererStyleFlags2.DashCase) {
            el.style.removeProperty(style);
        }
        else {
            // IE requires '' instead of null
            // see https://github.com/angular/angular/issues/7916
            el.style[style] = '';
        }
    }
    setProperty(el, name, value) {
        NG_DEV_MODE && checkNoSyntheticProp(name, 'property');
        el[name] = value;
    }
    setValue(node, value) {
        node.nodeValue = value;
    }
    listen(target, event, callback) {
        NG_DEV_MODE && checkNoSyntheticProp(event, 'listener');
        if (typeof target === 'string') {
            return this.eventManager.addGlobalEventListener(target, event, decoratePreventDefault(callback));
        }
        return this.eventManager.addEventListener(target, event, decoratePreventDefault(callback));
    }
}
const AT_CHARCODE = (() => '@'.charCodeAt(0))();
function checkNoSyntheticProp(name, nameKind) {
    if (name.charCodeAt(0) === AT_CHARCODE) {
        throw new Error(`Unexpected synthetic ${nameKind} ${name} found. Please make sure that:
  - Either \`BrowserAnimationsModule\` or \`NoopAnimationsModule\` are imported in your application.
  - There is corresponding configuration for the animation named \`${name}\` defined in the \`animations\` field of the \`@Component\` decorator (see https://angular.io/api/core/Component#animations).`);
    }
}
function isTemplateNode(node) {
    return node.tagName === 'TEMPLATE' && node.content !== undefined;
}
class ShadowDomRenderer extends DefaultDomRenderer2 {
    constructor(eventManager, sharedStylesHost, hostEl, component) {
        super(eventManager);
        this.sharedStylesHost = sharedStylesHost;
        this.hostEl = hostEl;
        this.shadowRoot = hostEl.attachShadow({ mode: 'open' });
        this.sharedStylesHost.addHost(this.shadowRoot);
        const styles = flattenStyles(component.id, component.styles);
        for (const style of styles) {
            const styleEl = document.createElement('style');
            styleEl.textContent = style;
            this.shadowRoot.appendChild(styleEl);
        }
    }
    nodeOrShadowRoot(node) {
        return node === this.hostEl ? this.shadowRoot : node;
    }
    appendChild(parent, newChild) {
        return super.appendChild(this.nodeOrShadowRoot(parent), newChild);
    }
    insertBefore(parent, newChild, refChild) {
        return super.insertBefore(this.nodeOrShadowRoot(parent), newChild, refChild);
    }
    removeChild(parent, oldChild) {
        return super.removeChild(this.nodeOrShadowRoot(parent), oldChild);
    }
    parentNode(node) {
        return this.nodeOrShadowRoot(super.parentNode(this.nodeOrShadowRoot(node)));
    }
    destroy() {
        this.sharedStylesHost.removeHost(this.shadowRoot);
    }
}
class NoneEncapsulationDomRenderer extends DefaultDomRenderer2 {
    constructor(eventManager, sharedStylesHost, component, removeStylesOnCompDestory, compId = component.id) {
        super(eventManager);
        this.sharedStylesHost = sharedStylesHost;
        this.removeStylesOnCompDestory = removeStylesOnCompDestory;
        this.rendererUsageCount = 0;
        this.styles = flattenStyles(compId, component.styles);
    }
    applyStyles() {
        this.sharedStylesHost.addStyles(this.styles);
        this.rendererUsageCount++;
    }
    destroy() {
        if (!this.removeStylesOnCompDestory) {
            return;
        }
        this.sharedStylesHost.removeStyles(this.styles);
        this.rendererUsageCount--;
        if (this.rendererUsageCount === 0) {
            this.onDestroy?.();
        }
    }
}
class EmulatedEncapsulationDomRenderer2 extends NoneEncapsulationDomRenderer {
    constructor(eventManager, sharedStylesHost, component, appId, removeStylesOnCompDestory) {
        const compId = appId + '-' + component.id;
        super(eventManager, sharedStylesHost, component, removeStylesOnCompDestory, compId);
        this.contentAttr = shimContentAttribute(compId);
        this.hostAttr = shimHostAttribute(compId);
    }
    applyToHost(element) {
        this.applyStyles();
        this.setAttribute(element, this.hostAttr, '');
    }
    createElement(parent, name) {
        const el = super.createElement(parent, name);
        super.setAttribute(el, this.contentAttr, '');
        return el;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tX3JlbmRlcmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcGxhdGZvcm0tYnJvd3Nlci9zcmMvZG9tL2RvbV9yZW5kZXJlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUEwQyxtQkFBbUIsRUFBaUIsaUJBQWlCLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFeEssT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQ3BELE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLHNCQUFzQixDQUFDOzs7O0FBRXpELE1BQU0sQ0FBQyxNQUFNLGNBQWMsR0FBMkI7SUFDcEQsS0FBSyxFQUFFLDRCQUE0QjtJQUNuQyxPQUFPLEVBQUUsOEJBQThCO0lBQ3ZDLE9BQU8sRUFBRSw4QkFBOEI7SUFDdkMsS0FBSyxFQUFFLHNDQUFzQztJQUM3QyxPQUFPLEVBQUUsK0JBQStCO0lBQ3hDLE1BQU0sRUFBRSxnQ0FBZ0M7Q0FDekMsQ0FBQztBQUVGLE1BQU0sZUFBZSxHQUFHLFNBQVMsQ0FBQztBQUNsQyxNQUFNLFdBQVcsR0FBRyxPQUFPLFNBQVMsS0FBSyxXQUFXLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQztBQUVwRSxNQUFNLENBQUMsTUFBTSxrQkFBa0IsR0FBRyxRQUFRLENBQUM7QUFDM0MsTUFBTSxDQUFDLE1BQU0sU0FBUyxHQUFHLFdBQVcsa0JBQWtCLEVBQUUsQ0FBQztBQUN6RCxNQUFNLENBQUMsTUFBTSxZQUFZLEdBQUcsY0FBYyxrQkFBa0IsRUFBRSxDQUFDO0FBRS9EOztHQUVHO0FBQ0gsTUFBTSwwQ0FBMEMsR0FBRyxLQUFLLENBQUM7QUFFekQ7Ozs7OztHQU1HO0FBQ0gsTUFBTSxDQUFDLE1BQU0sa0NBQWtDLEdBQzNDLElBQUksY0FBYyxDQUFVLDJCQUEyQixFQUFFO0lBQ3ZELFVBQVUsRUFBRSxNQUFNO0lBQ2xCLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQywwQ0FBMEM7Q0FDMUQsQ0FBQyxDQUFDO0FBRVAsTUFBTSxVQUFVLG9CQUFvQixDQUFDLGdCQUF3QjtJQUMzRCxPQUFPLFlBQVksQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLGdCQUFnQixDQUFDLENBQUM7QUFDakUsQ0FBQztBQUVELE1BQU0sVUFBVSxpQkFBaUIsQ0FBQyxnQkFBd0I7SUFDeEQsT0FBTyxTQUFTLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0FBQzlELENBQUM7QUFFRCxNQUFNLFVBQVUsYUFBYSxDQUFDLE1BQWMsRUFBRSxNQUE4QjtJQUMxRSxzRkFBc0Y7SUFDdEYsNERBQTREO0lBQzVELE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQ3ZFLENBQUM7QUFFRCxTQUFTLHNCQUFzQixDQUFDLFlBQXNCO0lBQ3BELGlGQUFpRjtJQUNqRixpR0FBaUc7SUFDakcsK0ZBQStGO0lBQy9GLDRCQUE0QjtJQUM1QixPQUFPLENBQUMsS0FBVSxFQUFFLEVBQUU7UUFDcEIsbUZBQW1GO1FBQ25GLGdHQUFnRztRQUNoRyw4RkFBOEY7UUFDOUYsb0ZBQW9GO1FBQ3BGLElBQUksS0FBSyxLQUFLLGNBQWMsRUFBRTtZQUM1QixPQUFPLFlBQVksQ0FBQztTQUNyQjtRQUVELE1BQU0sb0JBQW9CLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2pELElBQUksb0JBQW9CLEtBQUssS0FBSyxFQUFFO1lBQ2xDLDBEQUEwRDtZQUMxRCxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDdkIsS0FBSyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7U0FDM0I7UUFFRCxPQUFPLFNBQVMsQ0FBQztJQUNuQixDQUFDLENBQUM7QUFDSixDQUFDO0FBR0QsTUFBTSxPQUFPLG1CQUFtQjtJQUs5QixZQUNZLFlBQTBCLEVBQVUsZ0JBQXFDLEVBQ3pELEtBQWEsRUFDZSx5QkFBa0M7UUFGOUUsaUJBQVksR0FBWixZQUFZLENBQWM7UUFBVSxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQXFCO1FBQ3pELFVBQUssR0FBTCxLQUFLLENBQVE7UUFDZSw4QkFBeUIsR0FBekIseUJBQXlCLENBQVM7UUFQbEYscUJBQWdCLEdBQ3BCLElBQUksR0FBRyxFQUEwRSxDQUFDO1FBT3BGLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxtQkFBbUIsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUMvRCxDQUFDO0lBRUQsY0FBYyxDQUFDLE9BQVksRUFBRSxJQUF3QjtRQUNuRCxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ3JCLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQztTQUM3QjtRQUVELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFekQsNEVBQTRFO1FBQzVFLDBEQUEwRDtRQUMxRCxJQUFJLFFBQVEsWUFBWSxpQ0FBaUMsRUFBRTtZQUN6RCxRQUFRLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQy9CO2FBQU0sSUFBSSxRQUFRLFlBQVksNEJBQTRCLEVBQUU7WUFDM0QsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDO1NBQ3hCO1FBRUQsT0FBTyxRQUFRLENBQUM7SUFDbEIsQ0FBQztJQUVPLG1CQUFtQixDQUFDLE9BQVksRUFBRSxJQUFtQjtRQUMzRCxNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztRQUMvQyxJQUFJLFFBQVEsR0FBRyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRTdDLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDYixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO1lBQ3ZDLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDO1lBQy9DLE1BQU0seUJBQXlCLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDO1lBRWpFLFFBQVEsSUFBSSxDQUFDLGFBQWEsRUFBRTtnQkFDMUIsS0FBSyxpQkFBaUIsQ0FBQyxRQUFRO29CQUM3QixRQUFRLEdBQUcsSUFBSSxpQ0FBaUMsQ0FDNUMsWUFBWSxFQUFFLGdCQUFnQixFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLHlCQUF5QixDQUFDLENBQUM7b0JBQ2pGLE1BQU07Z0JBQ1IsS0FBSyxpQkFBaUIsQ0FBQyxTQUFTO29CQUM5QixPQUFPLElBQUksaUJBQWlCLENBQUMsWUFBWSxFQUFFLGdCQUFnQixFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDOUU7b0JBQ0UsUUFBUSxHQUFHLElBQUksNEJBQTRCLENBQ3ZDLFlBQVksRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUseUJBQXlCLENBQUMsQ0FBQztvQkFDckUsTUFBTTthQUNUO1lBRUQsUUFBUSxDQUFDLFNBQVMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzVELGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQ3pDO1FBRUQsT0FBTyxRQUFRLENBQUM7SUFDbEIsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDaEMsQ0FBQztJQUVELEtBQUssS0FBSSxDQUFDO0lBQ1YsR0FBRyxLQUFJLENBQUM7OzJIQWhFRyxtQkFBbUIsaUZBT2xCLE1BQU0sYUFDTixrQ0FBa0M7K0hBUm5DLG1CQUFtQjtzR0FBbkIsbUJBQW1CO2tCQUQvQixVQUFVOzswQkFRSixNQUFNOzJCQUFDLE1BQU07OzBCQUNiLE1BQU07MkJBQUMsa0NBQWtDOztBQTJEaEQsTUFBTSxtQkFBbUI7SUFHdkIsWUFBb0IsWUFBMEI7UUFBMUIsaUJBQVksR0FBWixZQUFZLENBQWM7UUFGOUMsU0FBSSxHQUF5QixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBTWpELGdCQUFXLEdBQUcsSUFBSSxDQUFDO0lBSjhCLENBQUM7SUFFbEQsT0FBTyxLQUFVLENBQUM7SUFJbEIsYUFBYSxDQUFDLElBQVksRUFBRSxTQUFrQjtRQUM1QyxJQUFJLFNBQVMsRUFBRTtZQUNiLG9DQUFvQztZQUNwQyx3RkFBd0Y7WUFDeEYsNkZBQTZGO1lBQzdGLDRGQUE0RjtZQUM1Rix3RkFBd0Y7WUFDeEYsK0NBQStDO1lBQy9DLGtCQUFrQjtZQUNsQixrREFBa0Q7WUFDbEQsa0RBQWtEO1lBQ2xELE9BQU8sUUFBUSxDQUFDLGVBQWUsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLElBQUksU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQy9FO1FBRUQsT0FBTyxRQUFRLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFFRCxhQUFhLENBQUMsS0FBYTtRQUN6QixPQUFPLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVELFVBQVUsQ0FBQyxLQUFhO1FBQ3RCLE9BQU8sUUFBUSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBRUQsV0FBVyxDQUFDLE1BQVcsRUFBRSxRQUFhO1FBQ3BDLE1BQU0sWUFBWSxHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO1FBQ3RFLFlBQVksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVELFlBQVksQ0FBQyxNQUFXLEVBQUUsUUFBYSxFQUFFLFFBQWE7UUFDcEQsSUFBSSxNQUFNLEVBQUU7WUFDVixNQUFNLFlBQVksR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztZQUN0RSxZQUFZLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztTQUMvQztJQUNILENBQUM7SUFFRCxXQUFXLENBQUMsTUFBVyxFQUFFLFFBQWE7UUFDcEMsSUFBSSxNQUFNLEVBQUU7WUFDVixNQUFNLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQzlCO0lBQ0gsQ0FBQztJQUVELGlCQUFpQixDQUFDLGNBQTBCLEVBQUUsZUFBeUI7UUFDckUsSUFBSSxFQUFFLEdBQVEsT0FBTyxjQUFjLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7WUFDeEMsY0FBYyxDQUFDO1FBQ2xFLElBQUksQ0FBQyxFQUFFLEVBQUU7WUFDUCxNQUFNLElBQUksS0FBSyxDQUFDLGlCQUFpQixjQUFjLDhCQUE4QixDQUFDLENBQUM7U0FDaEY7UUFDRCxJQUFJLENBQUMsZUFBZSxFQUFFO1lBQ3BCLEVBQUUsQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO1NBQ3JCO1FBQ0QsT0FBTyxFQUFFLENBQUM7SUFDWixDQUFDO0lBRUQsVUFBVSxDQUFDLElBQVM7UUFDbEIsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQ3pCLENBQUM7SUFFRCxXQUFXLENBQUMsSUFBUztRQUNuQixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUM7SUFDMUIsQ0FBQztJQUVELFlBQVksQ0FBQyxFQUFPLEVBQUUsSUFBWSxFQUFFLEtBQWEsRUFBRSxTQUFrQjtRQUNuRSxJQUFJLFNBQVMsRUFBRTtZQUNiLElBQUksR0FBRyxTQUFTLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQztZQUM5QixNQUFNLFlBQVksR0FBRyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDL0MsSUFBSSxZQUFZLEVBQUU7Z0JBQ2hCLEVBQUUsQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQzthQUM5QztpQkFBTTtnQkFDTCxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQzthQUM5QjtTQUNGO2FBQU07WUFDTCxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztTQUM5QjtJQUNILENBQUM7SUFFRCxlQUFlLENBQUMsRUFBTyxFQUFFLElBQVksRUFBRSxTQUFrQjtRQUN2RCxJQUFJLFNBQVMsRUFBRTtZQUNiLE1BQU0sWUFBWSxHQUFHLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMvQyxJQUFJLFlBQVksRUFBRTtnQkFDaEIsRUFBRSxDQUFDLGlCQUFpQixDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQzthQUMxQztpQkFBTTtnQkFDTCxFQUFFLENBQUMsZUFBZSxDQUFDLEdBQUcsU0FBUyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUM7YUFDNUM7U0FDRjthQUFNO1lBQ0wsRUFBRSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUMxQjtJQUNILENBQUM7SUFFRCxRQUFRLENBQUMsRUFBTyxFQUFFLElBQVk7UUFDNUIsRUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDekIsQ0FBQztJQUVELFdBQVcsQ0FBQyxFQUFPLEVBQUUsSUFBWTtRQUMvQixFQUFFLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBRUQsUUFBUSxDQUFDLEVBQU8sRUFBRSxLQUFhLEVBQUUsS0FBVSxFQUFFLEtBQTBCO1FBQ3JFLElBQUksS0FBSyxHQUFHLENBQUMsbUJBQW1CLENBQUMsUUFBUSxHQUFHLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQzFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxHQUFHLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUM5RjthQUFNO1lBQ0wsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUM7U0FDekI7SUFDSCxDQUFDO0lBRUQsV0FBVyxDQUFDLEVBQU8sRUFBRSxLQUFhLEVBQUUsS0FBMEI7UUFDNUQsSUFBSSxLQUFLLEdBQUcsbUJBQW1CLENBQUMsUUFBUSxFQUFFO1lBQ3hDLEVBQUUsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ2hDO2FBQU07WUFDTCxpQ0FBaUM7WUFDakMscURBQXFEO1lBQ3JELEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO1NBQ3RCO0lBQ0gsQ0FBQztJQUVELFdBQVcsQ0FBQyxFQUFPLEVBQUUsSUFBWSxFQUFFLEtBQVU7UUFDM0MsV0FBVyxJQUFJLG9CQUFvQixDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUN0RCxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDO0lBQ25CLENBQUM7SUFFRCxRQUFRLENBQUMsSUFBUyxFQUFFLEtBQWE7UUFDL0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7SUFDekIsQ0FBQztJQUVELE1BQU0sQ0FBQyxNQUFzQyxFQUFFLEtBQWEsRUFBRSxRQUFpQztRQUU3RixXQUFXLElBQUksb0JBQW9CLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3ZELElBQUksT0FBTyxNQUFNLEtBQUssUUFBUSxFQUFFO1lBQzlCLE9BQW1CLElBQUksQ0FBQyxZQUFZLENBQUMsc0JBQXNCLENBQ3ZELE1BQU0sRUFBRSxLQUFLLEVBQUUsc0JBQXNCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztTQUN0RDtRQUNELE9BQW1CLElBQUksQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLENBQzFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsc0JBQXNCLENBQUMsUUFBUSxDQUFDLENBQWUsQ0FBQztJQUM1RSxDQUFDO0NBQ0Y7QUFFRCxNQUFNLFdBQVcsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ2hELFNBQVMsb0JBQW9CLENBQUMsSUFBWSxFQUFFLFFBQWdCO0lBQzFELElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsS0FBSyxXQUFXLEVBQUU7UUFDdEMsTUFBTSxJQUFJLEtBQUssQ0FBQyx3QkFBd0IsUUFBUSxJQUFJLElBQUk7O3FFQUdwRCxJQUFJLGdJQUFnSSxDQUFDLENBQUM7S0FDM0k7QUFDSCxDQUFDO0FBR0QsU0FBUyxjQUFjLENBQUMsSUFBUztJQUMvQixPQUFPLElBQUksQ0FBQyxPQUFPLEtBQUssVUFBVSxJQUFJLElBQUksQ0FBQyxPQUFPLEtBQUssU0FBUyxDQUFDO0FBQ25FLENBQUM7QUFFRCxNQUFNLGlCQUFrQixTQUFRLG1CQUFtQjtJQUdqRCxZQUNJLFlBQTBCLEVBQVUsZ0JBQXFDLEVBQ2pFLE1BQVcsRUFBRSxTQUF3QjtRQUMvQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7UUFGa0IscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFxQjtRQUNqRSxXQUFNLEdBQU4sTUFBTSxDQUFLO1FBRXJCLElBQUksQ0FBQyxVQUFVLEdBQUksTUFBYyxDQUFDLFlBQVksQ0FBQyxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBRS9ELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQy9DLE1BQU0sTUFBTSxHQUFHLGFBQWEsQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUU3RCxLQUFLLE1BQU0sS0FBSyxJQUFJLE1BQU0sRUFBRTtZQUMxQixNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ2hELE9BQU8sQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1lBQzVCLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ3RDO0lBQ0gsQ0FBQztJQUVPLGdCQUFnQixDQUFDLElBQVM7UUFDaEMsT0FBTyxJQUFJLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQ3ZELENBQUM7SUFFUSxXQUFXLENBQUMsTUFBVyxFQUFFLFFBQWE7UUFDN0MsT0FBTyxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNwRSxDQUFDO0lBQ1EsWUFBWSxDQUFDLE1BQVcsRUFBRSxRQUFhLEVBQUUsUUFBYTtRQUM3RCxPQUFPLEtBQUssQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUMvRSxDQUFDO0lBQ1EsV0FBVyxDQUFDLE1BQVcsRUFBRSxRQUFhO1FBQzdDLE9BQU8sS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDcEUsQ0FBQztJQUNRLFVBQVUsQ0FBQyxJQUFTO1FBQzNCLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM5RSxDQUFDO0lBRVEsT0FBTztRQUNkLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3BELENBQUM7Q0FDRjtBQUVELE1BQU0sNEJBQTZCLFNBQVEsbUJBQW1CO0lBSzVELFlBQ0ksWUFBMEIsRUFDVCxnQkFBcUMsRUFDdEQsU0FBd0IsRUFDaEIseUJBQWtDLEVBQzFDLE1BQU0sR0FBRyxTQUFTLENBQUMsRUFBRTtRQUV2QixLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7UUFMRCxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQXFCO1FBRTlDLDhCQUF5QixHQUF6Qix5QkFBeUIsQ0FBUztRQVB0Qyx1QkFBa0IsR0FBRyxDQUFDLENBQUM7UUFXN0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxhQUFhLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzdDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0lBQzVCLENBQUM7SUFFUSxPQUFPO1FBQ2QsSUFBSSxDQUFDLElBQUksQ0FBQyx5QkFBeUIsRUFBRTtZQUNuQyxPQUFPO1NBQ1I7UUFFRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNoRCxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUMxQixJQUFJLElBQUksQ0FBQyxrQkFBa0IsS0FBSyxDQUFDLEVBQUU7WUFDakMsSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUM7U0FDcEI7SUFDSCxDQUFDO0NBQ0Y7QUFFRCxNQUFNLGlDQUFrQyxTQUFRLDRCQUE0QjtJQUkxRSxZQUNJLFlBQTBCLEVBQUUsZ0JBQXFDLEVBQUUsU0FBd0IsRUFDM0YsS0FBYSxFQUFFLHlCQUFrQztRQUNuRCxNQUFNLE1BQU0sR0FBRyxLQUFLLEdBQUcsR0FBRyxHQUFHLFNBQVMsQ0FBQyxFQUFFLENBQUM7UUFDMUMsS0FBSyxDQUFDLFlBQVksRUFBRSxnQkFBZ0IsRUFBRSxTQUFTLEVBQUUseUJBQXlCLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDcEYsSUFBSSxDQUFDLFdBQVcsR0FBRyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNoRCxJQUFJLENBQUMsUUFBUSxHQUFHLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFFRCxXQUFXLENBQUMsT0FBWTtRQUN0QixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDbkIsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRVEsYUFBYSxDQUFDLE1BQVcsRUFBRSxJQUFZO1FBQzlDLE1BQU0sRUFBRSxHQUFHLEtBQUssQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzdDLEtBQUssQ0FBQyxZQUFZLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDN0MsT0FBTyxFQUFFLENBQUM7SUFDWixDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBUFBfSUQsIEluamVjdCwgSW5qZWN0YWJsZSwgSW5qZWN0aW9uVG9rZW4sIE9uRGVzdHJveSwgUmVuZGVyZXIyLCBSZW5kZXJlckZhY3RvcnkyLCBSZW5kZXJlclN0eWxlRmxhZ3MyLCBSZW5kZXJlclR5cGUyLCBWaWV3RW5jYXBzdWxhdGlvbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7RXZlbnRNYW5hZ2VyfSBmcm9tICcuL2V2ZW50cy9ldmVudF9tYW5hZ2VyJztcbmltcG9ydCB7RG9tU2hhcmVkU3R5bGVzSG9zdH0gZnJvbSAnLi9zaGFyZWRfc3R5bGVzX2hvc3QnO1xuXG5leHBvcnQgY29uc3QgTkFNRVNQQUNFX1VSSVM6IHtbbnM6IHN0cmluZ106IHN0cmluZ30gPSB7XG4gICdzdmcnOiAnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLFxuICAneGh0bWwnOiAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbCcsXG4gICd4bGluayc6ICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJyxcbiAgJ3htbCc6ICdodHRwOi8vd3d3LnczLm9yZy9YTUwvMTk5OC9uYW1lc3BhY2UnLFxuICAneG1sbnMnOiAnaHR0cDovL3d3dy53My5vcmcvMjAwMC94bWxucy8nLFxuICAnbWF0aCc6ICdodHRwOi8vd3d3LnczLm9yZy8xOTk4L01hdGhNTC8nLFxufTtcblxuY29uc3QgQ09NUE9ORU5UX1JFR0VYID0gLyVDT01QJS9nO1xuY29uc3QgTkdfREVWX01PREUgPSB0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCAhIW5nRGV2TW9kZTtcblxuZXhwb3J0IGNvbnN0IENPTVBPTkVOVF9WQVJJQUJMRSA9ICclQ09NUCUnO1xuZXhwb3J0IGNvbnN0IEhPU1RfQVRUUiA9IGBfbmdob3N0LSR7Q09NUE9ORU5UX1ZBUklBQkxFfWA7XG5leHBvcnQgY29uc3QgQ09OVEVOVF9BVFRSID0gYF9uZ2NvbnRlbnQtJHtDT01QT05FTlRfVkFSSUFCTEV9YDtcblxuLyoqXG4gKiBUaGUgZGVmYXVsdCB2YWx1ZSBmb3IgdGhlIGBSRU1PVkVfU1RZTEVTX09OX0NPTVBPTkVOVF9ERVNUUk9ZYCBESSB0b2tlbi5cbiAqL1xuY29uc3QgUkVNT1ZFX1NUWUxFU19PTl9DT01QT05FTlRfREVTVFJPWV9ERUZBVUxUID0gZmFsc2U7XG5cbi8qKlxuICogQSBbREkgdG9rZW5dKGd1aWRlL2dsb3NzYXJ5I2RpLXRva2VuIFwiREkgdG9rZW4gZGVmaW5pdGlvblwiKSB0aGF0IGluZGljYXRlcyB3aGV0aGVyIHN0eWxlc1xuICogb2YgZGVzdHJveWVkIGNvbXBvbmVudHMgc2hvdWxkIGJlIHJlbW92ZWQgZnJvbSBET00uXG4gKlxuICogQnkgZGVmYXVsdCwgdGhlIHZhbHVlIGlzIHNldCB0byBgZmFsc2VgLiBUaGlzIHdpbGwgYmUgY2hhbmdlZCBpbiB0aGUgbmV4dCBtYWpvciB2ZXJzaW9uLlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY29uc3QgUkVNT1ZFX1NUWUxFU19PTl9DT01QT05FTlRfREVTVFJPWSA9XG4gICAgbmV3IEluamVjdGlvblRva2VuPGJvb2xlYW4+KCdSZW1vdmVTdHlsZXNPbkNvbXBEZXN0b3J5Jywge1xuICAgICAgcHJvdmlkZWRJbjogJ3Jvb3QnLFxuICAgICAgZmFjdG9yeTogKCkgPT4gUkVNT1ZFX1NUWUxFU19PTl9DT01QT05FTlRfREVTVFJPWV9ERUZBVUxULFxuICAgIH0pO1xuXG5leHBvcnQgZnVuY3Rpb24gc2hpbUNvbnRlbnRBdHRyaWJ1dGUoY29tcG9uZW50U2hvcnRJZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIENPTlRFTlRfQVRUUi5yZXBsYWNlKENPTVBPTkVOVF9SRUdFWCwgY29tcG9uZW50U2hvcnRJZCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaGltSG9zdEF0dHJpYnV0ZShjb21wb25lbnRTaG9ydElkOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gSE9TVF9BVFRSLnJlcGxhY2UoQ09NUE9ORU5UX1JFR0VYLCBjb21wb25lbnRTaG9ydElkKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZsYXR0ZW5TdHlsZXMoY29tcElkOiBzdHJpbmcsIHN0eWxlczogQXJyYXk8c3RyaW5nfHN0cmluZ1tdPik6IHN0cmluZ1tdIHtcbiAgLy8gQ2Fubm90IHVzZSBgSW5maW5pdHlgIGFzIGRlcHRoIGFzIGBpbmZpbml0eWAgaXMgbm90IGEgbnVtYmVyIGxpdGVyYWwgaW4gVHlwZVNjcmlwdC5cbiAgLy8gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzMyMjc3XG4gIHJldHVybiBzdHlsZXMuZmxhdCgxMDApLm1hcChzID0+IHMucmVwbGFjZShDT01QT05FTlRfUkVHRVgsIGNvbXBJZCkpO1xufVxuXG5mdW5jdGlvbiBkZWNvcmF0ZVByZXZlbnREZWZhdWx0KGV2ZW50SGFuZGxlcjogRnVuY3Rpb24pOiBGdW5jdGlvbiB7XG4gIC8vIGBEZWJ1Z05vZGUudHJpZ2dlckV2ZW50SGFuZGxlcmAgbmVlZHMgdG8ga25vdyBpZiB0aGUgbGlzdGVuZXIgd2FzIGNyZWF0ZWQgd2l0aFxuICAvLyBkZWNvcmF0ZVByZXZlbnREZWZhdWx0IG9yIGlzIGEgbGlzdGVuZXIgYWRkZWQgb3V0c2lkZSB0aGUgQW5ndWxhciBjb250ZXh0IHNvIGl0IGNhbiBoYW5kbGUgdGhlXG4gIC8vIHR3byBkaWZmZXJlbnRseS4gSW4gdGhlIGZpcnN0IGNhc2UsIHRoZSBzcGVjaWFsICdfX25nVW53cmFwX18nIHRva2VuIGlzIHBhc3NlZCB0byB0aGUgdW53cmFwXG4gIC8vIHRoZSBsaXN0ZW5lciAoc2VlIGJlbG93KS5cbiAgcmV0dXJuIChldmVudDogYW55KSA9PiB7XG4gICAgLy8gSXZ5IHVzZXMgJ19fbmdVbndyYXBfXycgYXMgYSBzcGVjaWFsIHRva2VuIHRoYXQgYWxsb3dzIHVzIHRvIHVud3JhcCB0aGUgZnVuY3Rpb25cbiAgICAvLyBzbyB0aGF0IGl0IGNhbiBiZSBpbnZva2VkIHByb2dyYW1tYXRpY2FsbHkgYnkgYERlYnVnTm9kZS50cmlnZ2VyRXZlbnRIYW5kbGVyYC4gVGhlIGRlYnVnX25vZGVcbiAgICAvLyBjYW4gaW5zcGVjdCB0aGUgbGlzdGVuZXIgdG9TdHJpbmcgY29udGVudHMgZm9yIHRoZSBleGlzdGVuY2Ugb2YgdGhpcyBzcGVjaWFsIHRva2VuLiBCZWNhdXNlXG4gICAgLy8gdGhlIHRva2VuIGlzIGEgc3RyaW5nIGxpdGVyYWwsIGl0IGlzIGVuc3VyZWQgdG8gbm90IGJlIG1vZGlmaWVkIGJ5IGNvbXBpbGVkIGNvZGUuXG4gICAgaWYgKGV2ZW50ID09PSAnX19uZ1Vud3JhcF9fJykge1xuICAgICAgcmV0dXJuIGV2ZW50SGFuZGxlcjtcbiAgICB9XG5cbiAgICBjb25zdCBhbGxvd0RlZmF1bHRCZWhhdmlvciA9IGV2ZW50SGFuZGxlcihldmVudCk7XG4gICAgaWYgKGFsbG93RGVmYXVsdEJlaGF2aW9yID09PSBmYWxzZSkge1xuICAgICAgLy8gVE9ETyh0Ym9zY2gpOiBtb3ZlIHByZXZlbnREZWZhdWx0IGludG8gZXZlbnQgcGx1Z2lucy4uLlxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGV2ZW50LnJldHVyblZhbHVlID0gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfTtcbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIERvbVJlbmRlcmVyRmFjdG9yeTIgaW1wbGVtZW50cyBSZW5kZXJlckZhY3RvcnkyLCBPbkRlc3Ryb3kge1xuICBwcml2YXRlIHJlbmRlcmVyQnlDb21wSWQgPVxuICAgICAgbmV3IE1hcDxzdHJpbmcsIEVtdWxhdGVkRW5jYXBzdWxhdGlvbkRvbVJlbmRlcmVyMnxOb25lRW5jYXBzdWxhdGlvbkRvbVJlbmRlcmVyPigpO1xuICBwcml2YXRlIGRlZmF1bHRSZW5kZXJlcjogUmVuZGVyZXIyO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBldmVudE1hbmFnZXI6IEV2ZW50TWFuYWdlciwgcHJpdmF0ZSBzaGFyZWRTdHlsZXNIb3N0OiBEb21TaGFyZWRTdHlsZXNIb3N0LFxuICAgICAgQEluamVjdChBUFBfSUQpIHByaXZhdGUgYXBwSWQ6IHN0cmluZyxcbiAgICAgIEBJbmplY3QoUkVNT1ZFX1NUWUxFU19PTl9DT01QT05FTlRfREVTVFJPWSkgcHJpdmF0ZSByZW1vdmVTdHlsZXNPbkNvbXBEZXN0b3J5OiBib29sZWFuKSB7XG4gICAgdGhpcy5kZWZhdWx0UmVuZGVyZXIgPSBuZXcgRGVmYXVsdERvbVJlbmRlcmVyMihldmVudE1hbmFnZXIpO1xuICB9XG5cbiAgY3JlYXRlUmVuZGVyZXIoZWxlbWVudDogYW55LCB0eXBlOiBSZW5kZXJlclR5cGUyfG51bGwpOiBSZW5kZXJlcjIge1xuICAgIGlmICghZWxlbWVudCB8fCAhdHlwZSkge1xuICAgICAgcmV0dXJuIHRoaXMuZGVmYXVsdFJlbmRlcmVyO1xuICAgIH1cblxuICAgIGNvbnN0IHJlbmRlcmVyID0gdGhpcy5nZXRPckNyZWF0ZVJlbmRlcmVyKGVsZW1lbnQsIHR5cGUpO1xuXG4gICAgLy8gUmVuZGVyZXJzIGhhdmUgZGlmZmVyZW50IGxvZ2ljIGR1ZSB0byBkaWZmZXJlbnQgZW5jYXBzdWxhdGlvbiBiZWhhdmlvdXJzLlxuICAgIC8vIEV4OiBmb3IgZW11bGF0ZWQsIGFuIGF0dHJpYnV0ZSBpcyBhZGRlZCB0byB0aGUgZWxlbWVudC5cbiAgICBpZiAocmVuZGVyZXIgaW5zdGFuY2VvZiBFbXVsYXRlZEVuY2Fwc3VsYXRpb25Eb21SZW5kZXJlcjIpIHtcbiAgICAgIHJlbmRlcmVyLmFwcGx5VG9Ib3N0KGVsZW1lbnQpO1xuICAgIH0gZWxzZSBpZiAocmVuZGVyZXIgaW5zdGFuY2VvZiBOb25lRW5jYXBzdWxhdGlvbkRvbVJlbmRlcmVyKSB7XG4gICAgICByZW5kZXJlci5hcHBseVN0eWxlcygpO1xuICAgIH1cblxuICAgIHJldHVybiByZW5kZXJlcjtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0T3JDcmVhdGVSZW5kZXJlcihlbGVtZW50OiBhbnksIHR5cGU6IFJlbmRlcmVyVHlwZTIpOiBSZW5kZXJlcjIge1xuICAgIGNvbnN0IHJlbmRlcmVyQnlDb21wSWQgPSB0aGlzLnJlbmRlcmVyQnlDb21wSWQ7XG4gICAgbGV0IHJlbmRlcmVyID0gcmVuZGVyZXJCeUNvbXBJZC5nZXQodHlwZS5pZCk7XG5cbiAgICBpZiAoIXJlbmRlcmVyKSB7XG4gICAgICBjb25zdCBldmVudE1hbmFnZXIgPSB0aGlzLmV2ZW50TWFuYWdlcjtcbiAgICAgIGNvbnN0IHNoYXJlZFN0eWxlc0hvc3QgPSB0aGlzLnNoYXJlZFN0eWxlc0hvc3Q7XG4gICAgICBjb25zdCByZW1vdmVTdHlsZXNPbkNvbXBEZXN0b3J5ID0gdGhpcy5yZW1vdmVTdHlsZXNPbkNvbXBEZXN0b3J5O1xuXG4gICAgICBzd2l0Y2ggKHR5cGUuZW5jYXBzdWxhdGlvbikge1xuICAgICAgICBjYXNlIFZpZXdFbmNhcHN1bGF0aW9uLkVtdWxhdGVkOlxuICAgICAgICAgIHJlbmRlcmVyID0gbmV3IEVtdWxhdGVkRW5jYXBzdWxhdGlvbkRvbVJlbmRlcmVyMihcbiAgICAgICAgICAgICAgZXZlbnRNYW5hZ2VyLCBzaGFyZWRTdHlsZXNIb3N0LCB0eXBlLCB0aGlzLmFwcElkLCByZW1vdmVTdHlsZXNPbkNvbXBEZXN0b3J5KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBWaWV3RW5jYXBzdWxhdGlvbi5TaGFkb3dEb206XG4gICAgICAgICAgcmV0dXJuIG5ldyBTaGFkb3dEb21SZW5kZXJlcihldmVudE1hbmFnZXIsIHNoYXJlZFN0eWxlc0hvc3QsIGVsZW1lbnQsIHR5cGUpO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHJlbmRlcmVyID0gbmV3IE5vbmVFbmNhcHN1bGF0aW9uRG9tUmVuZGVyZXIoXG4gICAgICAgICAgICAgIGV2ZW50TWFuYWdlciwgc2hhcmVkU3R5bGVzSG9zdCwgdHlwZSwgcmVtb3ZlU3R5bGVzT25Db21wRGVzdG9yeSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIHJlbmRlcmVyLm9uRGVzdHJveSA9ICgpID0+IHJlbmRlcmVyQnlDb21wSWQuZGVsZXRlKHR5cGUuaWQpO1xuICAgICAgcmVuZGVyZXJCeUNvbXBJZC5zZXQodHlwZS5pZCwgcmVuZGVyZXIpO1xuICAgIH1cblxuICAgIHJldHVybiByZW5kZXJlcjtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMucmVuZGVyZXJCeUNvbXBJZC5jbGVhcigpO1xuICB9XG5cbiAgYmVnaW4oKSB7fVxuICBlbmQoKSB7fVxufVxuXG5jbGFzcyBEZWZhdWx0RG9tUmVuZGVyZXIyIGltcGxlbWVudHMgUmVuZGVyZXIyIHtcbiAgZGF0YToge1trZXk6IHN0cmluZ106IGFueX0gPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZXZlbnRNYW5hZ2VyOiBFdmVudE1hbmFnZXIpIHt9XG5cbiAgZGVzdHJveSgpOiB2b2lkIHt9XG5cbiAgZGVzdHJveU5vZGUgPSBudWxsO1xuXG4gIGNyZWF0ZUVsZW1lbnQobmFtZTogc3RyaW5nLCBuYW1lc3BhY2U/OiBzdHJpbmcpOiBhbnkge1xuICAgIGlmIChuYW1lc3BhY2UpIHtcbiAgICAgIC8vIFRPRE86IGB8fCBuYW1lc3BhY2VgIHdhcyBhZGRlZCBpblxuICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9jb21taXQvMmI5Y2M4NTAzZDQ4MTczNDkyYzI5ZjVhMjcxYjYxMTI2MTA0ZmJkYiB0b1xuICAgICAgLy8gc3VwcG9ydCBob3cgSXZ5IHBhc3NlZCBhcm91bmQgdGhlIG5hbWVzcGFjZSBVUkkgcmF0aGVyIHRoYW4gc2hvcnQgbmFtZSBhdCB0aGUgdGltZS4gSXQgZGlkXG4gICAgICAvLyBub3QsIGhvd2V2ZXIgZXh0ZW5kIHRoZSBzdXBwb3J0IHRvIG90aGVyIHBhcnRzIG9mIHRoZSBzeXN0ZW0gKHNldEF0dHJpYnV0ZSwgc2V0QXR0cmlidXRlLFxuICAgICAgLy8gYW5kIHRoZSBTZXJ2ZXJSZW5kZXJlcikuIFdlIHNob3VsZCBkZWNpZGUgd2hhdCBleGFjdGx5IHRoZSBzZW1hbnRpY3MgZm9yIGRlYWxpbmcgd2l0aFxuICAgICAgLy8gbmFtZXNwYWNlcyBzaG91bGQgYmUgYW5kIG1ha2UgaXQgY29uc2lzdGVudC5cbiAgICAgIC8vIFJlbGF0ZWQgaXNzdWVzOlxuICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvNDQwMjhcbiAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzQ0ODgzXG4gICAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKE5BTUVTUEFDRV9VUklTW25hbWVzcGFjZV0gfHwgbmFtZXNwYWNlLCBuYW1lKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChuYW1lKTtcbiAgfVxuXG4gIGNyZWF0ZUNvbW1lbnQodmFsdWU6IHN0cmluZyk6IGFueSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUNvbW1lbnQodmFsdWUpO1xuICB9XG5cbiAgY3JlYXRlVGV4dCh2YWx1ZTogc3RyaW5nKTogYW55IHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodmFsdWUpO1xuICB9XG5cbiAgYXBwZW5kQ2hpbGQocGFyZW50OiBhbnksIG5ld0NoaWxkOiBhbnkpOiB2b2lkIHtcbiAgICBjb25zdCB0YXJnZXRQYXJlbnQgPSBpc1RlbXBsYXRlTm9kZShwYXJlbnQpID8gcGFyZW50LmNvbnRlbnQgOiBwYXJlbnQ7XG4gICAgdGFyZ2V0UGFyZW50LmFwcGVuZENoaWxkKG5ld0NoaWxkKTtcbiAgfVxuXG4gIGluc2VydEJlZm9yZShwYXJlbnQ6IGFueSwgbmV3Q2hpbGQ6IGFueSwgcmVmQ2hpbGQ6IGFueSk6IHZvaWQge1xuICAgIGlmIChwYXJlbnQpIHtcbiAgICAgIGNvbnN0IHRhcmdldFBhcmVudCA9IGlzVGVtcGxhdGVOb2RlKHBhcmVudCkgPyBwYXJlbnQuY29udGVudCA6IHBhcmVudDtcbiAgICAgIHRhcmdldFBhcmVudC5pbnNlcnRCZWZvcmUobmV3Q2hpbGQsIHJlZkNoaWxkKTtcbiAgICB9XG4gIH1cblxuICByZW1vdmVDaGlsZChwYXJlbnQ6IGFueSwgb2xkQ2hpbGQ6IGFueSk6IHZvaWQge1xuICAgIGlmIChwYXJlbnQpIHtcbiAgICAgIHBhcmVudC5yZW1vdmVDaGlsZChvbGRDaGlsZCk7XG4gICAgfVxuICB9XG5cbiAgc2VsZWN0Um9vdEVsZW1lbnQoc2VsZWN0b3JPck5vZGU6IHN0cmluZ3xhbnksIHByZXNlcnZlQ29udGVudD86IGJvb2xlYW4pOiBhbnkge1xuICAgIGxldCBlbDogYW55ID0gdHlwZW9mIHNlbGVjdG9yT3JOb2RlID09PSAnc3RyaW5nJyA/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3JPck5vZGUpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3Rvck9yTm9kZTtcbiAgICBpZiAoIWVsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZSBzZWxlY3RvciBcIiR7c2VsZWN0b3JPck5vZGV9XCIgZGlkIG5vdCBtYXRjaCBhbnkgZWxlbWVudHNgKTtcbiAgICB9XG4gICAgaWYgKCFwcmVzZXJ2ZUNvbnRlbnQpIHtcbiAgICAgIGVsLnRleHRDb250ZW50ID0gJyc7XG4gICAgfVxuICAgIHJldHVybiBlbDtcbiAgfVxuXG4gIHBhcmVudE5vZGUobm9kZTogYW55KTogYW55IHtcbiAgICByZXR1cm4gbm9kZS5wYXJlbnROb2RlO1xuICB9XG5cbiAgbmV4dFNpYmxpbmcobm9kZTogYW55KTogYW55IHtcbiAgICByZXR1cm4gbm9kZS5uZXh0U2libGluZztcbiAgfVxuXG4gIHNldEF0dHJpYnV0ZShlbDogYW55LCBuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcsIG5hbWVzcGFjZT86IHN0cmluZyk6IHZvaWQge1xuICAgIGlmIChuYW1lc3BhY2UpIHtcbiAgICAgIG5hbWUgPSBuYW1lc3BhY2UgKyAnOicgKyBuYW1lO1xuICAgICAgY29uc3QgbmFtZXNwYWNlVXJpID0gTkFNRVNQQUNFX1VSSVNbbmFtZXNwYWNlXTtcbiAgICAgIGlmIChuYW1lc3BhY2VVcmkpIHtcbiAgICAgICAgZWwuc2V0QXR0cmlidXRlTlMobmFtZXNwYWNlVXJpLCBuYW1lLCB2YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbC5zZXRBdHRyaWJ1dGUobmFtZSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBlbC5zZXRBdHRyaWJ1dGUobmFtZSwgdmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHJlbW92ZUF0dHJpYnV0ZShlbDogYW55LCBuYW1lOiBzdHJpbmcsIG5hbWVzcGFjZT86IHN0cmluZyk6IHZvaWQge1xuICAgIGlmIChuYW1lc3BhY2UpIHtcbiAgICAgIGNvbnN0IG5hbWVzcGFjZVVyaSA9IE5BTUVTUEFDRV9VUklTW25hbWVzcGFjZV07XG4gICAgICBpZiAobmFtZXNwYWNlVXJpKSB7XG4gICAgICAgIGVsLnJlbW92ZUF0dHJpYnV0ZU5TKG5hbWVzcGFjZVVyaSwgbmFtZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbC5yZW1vdmVBdHRyaWJ1dGUoYCR7bmFtZXNwYWNlfToke25hbWV9YCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGVsLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgICB9XG4gIH1cblxuICBhZGRDbGFzcyhlbDogYW55LCBuYW1lOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBlbC5jbGFzc0xpc3QuYWRkKG5hbWUpO1xuICB9XG5cbiAgcmVtb3ZlQ2xhc3MoZWw6IGFueSwgbmFtZTogc3RyaW5nKTogdm9pZCB7XG4gICAgZWwuY2xhc3NMaXN0LnJlbW92ZShuYW1lKTtcbiAgfVxuXG4gIHNldFN0eWxlKGVsOiBhbnksIHN0eWxlOiBzdHJpbmcsIHZhbHVlOiBhbnksIGZsYWdzOiBSZW5kZXJlclN0eWxlRmxhZ3MyKTogdm9pZCB7XG4gICAgaWYgKGZsYWdzICYgKFJlbmRlcmVyU3R5bGVGbGFnczIuRGFzaENhc2UgfCBSZW5kZXJlclN0eWxlRmxhZ3MyLkltcG9ydGFudCkpIHtcbiAgICAgIGVsLnN0eWxlLnNldFByb3BlcnR5KHN0eWxlLCB2YWx1ZSwgZmxhZ3MgJiBSZW5kZXJlclN0eWxlRmxhZ3MyLkltcG9ydGFudCA/ICdpbXBvcnRhbnQnIDogJycpO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbC5zdHlsZVtzdHlsZV0gPSB2YWx1ZTtcbiAgICB9XG4gIH1cblxuICByZW1vdmVTdHlsZShlbDogYW55LCBzdHlsZTogc3RyaW5nLCBmbGFnczogUmVuZGVyZXJTdHlsZUZsYWdzMik6IHZvaWQge1xuICAgIGlmIChmbGFncyAmIFJlbmRlcmVyU3R5bGVGbGFnczIuRGFzaENhc2UpIHtcbiAgICAgIGVsLnN0eWxlLnJlbW92ZVByb3BlcnR5KHN0eWxlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSUUgcmVxdWlyZXMgJycgaW5zdGVhZCBvZiBudWxsXG4gICAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvNzkxNlxuICAgICAgZWwuc3R5bGVbc3R5bGVdID0gJyc7XG4gICAgfVxuICB9XG5cbiAgc2V0UHJvcGVydHkoZWw6IGFueSwgbmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgTkdfREVWX01PREUgJiYgY2hlY2tOb1N5bnRoZXRpY1Byb3AobmFtZSwgJ3Byb3BlcnR5Jyk7XG4gICAgZWxbbmFtZV0gPSB2YWx1ZTtcbiAgfVxuXG4gIHNldFZhbHVlKG5vZGU6IGFueSwgdmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgIG5vZGUubm9kZVZhbHVlID0gdmFsdWU7XG4gIH1cblxuICBsaXN0ZW4odGFyZ2V0OiAnd2luZG93J3wnZG9jdW1lbnQnfCdib2R5J3xhbnksIGV2ZW50OiBzdHJpbmcsIGNhbGxiYWNrOiAoZXZlbnQ6IGFueSkgPT4gYm9vbGVhbik6XG4gICAgICAoKSA9PiB2b2lkIHtcbiAgICBOR19ERVZfTU9ERSAmJiBjaGVja05vU3ludGhldGljUHJvcChldmVudCwgJ2xpc3RlbmVyJyk7XG4gICAgaWYgKHR5cGVvZiB0YXJnZXQgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gPCgpID0+IHZvaWQ+dGhpcy5ldmVudE1hbmFnZXIuYWRkR2xvYmFsRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICB0YXJnZXQsIGV2ZW50LCBkZWNvcmF0ZVByZXZlbnREZWZhdWx0KGNhbGxiYWNrKSk7XG4gICAgfVxuICAgIHJldHVybiA8KCkgPT4gdm9pZD50aGlzLmV2ZW50TWFuYWdlci5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgICAgICAgdGFyZ2V0LCBldmVudCwgZGVjb3JhdGVQcmV2ZW50RGVmYXVsdChjYWxsYmFjaykpIGFzICgpID0+IHZvaWQ7XG4gIH1cbn1cblxuY29uc3QgQVRfQ0hBUkNPREUgPSAoKCkgPT4gJ0AnLmNoYXJDb2RlQXQoMCkpKCk7XG5mdW5jdGlvbiBjaGVja05vU3ludGhldGljUHJvcChuYW1lOiBzdHJpbmcsIG5hbWVLaW5kOiBzdHJpbmcpIHtcbiAgaWYgKG5hbWUuY2hhckNvZGVBdCgwKSA9PT0gQVRfQ0hBUkNPREUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFVuZXhwZWN0ZWQgc3ludGhldGljICR7bmFtZUtpbmR9ICR7bmFtZX0gZm91bmQuIFBsZWFzZSBtYWtlIHN1cmUgdGhhdDpcbiAgLSBFaXRoZXIgXFxgQnJvd3NlckFuaW1hdGlvbnNNb2R1bGVcXGAgb3IgXFxgTm9vcEFuaW1hdGlvbnNNb2R1bGVcXGAgYXJlIGltcG9ydGVkIGluIHlvdXIgYXBwbGljYXRpb24uXG4gIC0gVGhlcmUgaXMgY29ycmVzcG9uZGluZyBjb25maWd1cmF0aW9uIGZvciB0aGUgYW5pbWF0aW9uIG5hbWVkIFxcYCR7XG4gICAgICAgIG5hbWV9XFxgIGRlZmluZWQgaW4gdGhlIFxcYGFuaW1hdGlvbnNcXGAgZmllbGQgb2YgdGhlIFxcYEBDb21wb25lbnRcXGAgZGVjb3JhdG9yIChzZWUgaHR0cHM6Ly9hbmd1bGFyLmlvL2FwaS9jb3JlL0NvbXBvbmVudCNhbmltYXRpb25zKS5gKTtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIGlzVGVtcGxhdGVOb2RlKG5vZGU6IGFueSk6IG5vZGUgaXMgSFRNTFRlbXBsYXRlRWxlbWVudCB7XG4gIHJldHVybiBub2RlLnRhZ05hbWUgPT09ICdURU1QTEFURScgJiYgbm9kZS5jb250ZW50ICE9PSB1bmRlZmluZWQ7XG59XG5cbmNsYXNzIFNoYWRvd0RvbVJlbmRlcmVyIGV4dGVuZHMgRGVmYXVsdERvbVJlbmRlcmVyMiB7XG4gIHByaXZhdGUgc2hhZG93Um9vdDogYW55O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgZXZlbnRNYW5hZ2VyOiBFdmVudE1hbmFnZXIsIHByaXZhdGUgc2hhcmVkU3R5bGVzSG9zdDogRG9tU2hhcmVkU3R5bGVzSG9zdCxcbiAgICAgIHByaXZhdGUgaG9zdEVsOiBhbnksIGNvbXBvbmVudDogUmVuZGVyZXJUeXBlMikge1xuICAgIHN1cGVyKGV2ZW50TWFuYWdlcik7XG4gICAgdGhpcy5zaGFkb3dSb290ID0gKGhvc3RFbCBhcyBhbnkpLmF0dGFjaFNoYWRvdyh7bW9kZTogJ29wZW4nfSk7XG5cbiAgICB0aGlzLnNoYXJlZFN0eWxlc0hvc3QuYWRkSG9zdCh0aGlzLnNoYWRvd1Jvb3QpO1xuICAgIGNvbnN0IHN0eWxlcyA9IGZsYXR0ZW5TdHlsZXMoY29tcG9uZW50LmlkLCBjb21wb25lbnQuc3R5bGVzKTtcblxuICAgIGZvciAoY29uc3Qgc3R5bGUgb2Ygc3R5bGVzKSB7XG4gICAgICBjb25zdCBzdHlsZUVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICAgIHN0eWxlRWwudGV4dENvbnRlbnQgPSBzdHlsZTtcbiAgICAgIHRoaXMuc2hhZG93Um9vdC5hcHBlbmRDaGlsZChzdHlsZUVsKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIG5vZGVPclNoYWRvd1Jvb3Qobm9kZTogYW55KTogYW55IHtcbiAgICByZXR1cm4gbm9kZSA9PT0gdGhpcy5ob3N0RWwgPyB0aGlzLnNoYWRvd1Jvb3QgOiBub2RlO1xuICB9XG5cbiAgb3ZlcnJpZGUgYXBwZW5kQ2hpbGQocGFyZW50OiBhbnksIG5ld0NoaWxkOiBhbnkpOiB2b2lkIHtcbiAgICByZXR1cm4gc3VwZXIuYXBwZW5kQ2hpbGQodGhpcy5ub2RlT3JTaGFkb3dSb290KHBhcmVudCksIG5ld0NoaWxkKTtcbiAgfVxuICBvdmVycmlkZSBpbnNlcnRCZWZvcmUocGFyZW50OiBhbnksIG5ld0NoaWxkOiBhbnksIHJlZkNoaWxkOiBhbnkpOiB2b2lkIHtcbiAgICByZXR1cm4gc3VwZXIuaW5zZXJ0QmVmb3JlKHRoaXMubm9kZU9yU2hhZG93Um9vdChwYXJlbnQpLCBuZXdDaGlsZCwgcmVmQ2hpbGQpO1xuICB9XG4gIG92ZXJyaWRlIHJlbW92ZUNoaWxkKHBhcmVudDogYW55LCBvbGRDaGlsZDogYW55KTogdm9pZCB7XG4gICAgcmV0dXJuIHN1cGVyLnJlbW92ZUNoaWxkKHRoaXMubm9kZU9yU2hhZG93Um9vdChwYXJlbnQpLCBvbGRDaGlsZCk7XG4gIH1cbiAgb3ZlcnJpZGUgcGFyZW50Tm9kZShub2RlOiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLm5vZGVPclNoYWRvd1Jvb3Qoc3VwZXIucGFyZW50Tm9kZSh0aGlzLm5vZGVPclNoYWRvd1Jvb3Qobm9kZSkpKTtcbiAgfVxuXG4gIG92ZXJyaWRlIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5zaGFyZWRTdHlsZXNIb3N0LnJlbW92ZUhvc3QodGhpcy5zaGFkb3dSb290KTtcbiAgfVxufVxuXG5jbGFzcyBOb25lRW5jYXBzdWxhdGlvbkRvbVJlbmRlcmVyIGV4dGVuZHMgRGVmYXVsdERvbVJlbmRlcmVyMiB7XG4gIHByaXZhdGUgcmVhZG9ubHkgc3R5bGVzOiBzdHJpbmdbXTtcbiAgcHJpdmF0ZSByZW5kZXJlclVzYWdlQ291bnQgPSAwO1xuICBvbkRlc3Ryb3k6IFZvaWRGdW5jdGlvbnx1bmRlZmluZWQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBldmVudE1hbmFnZXI6IEV2ZW50TWFuYWdlcixcbiAgICAgIHByaXZhdGUgcmVhZG9ubHkgc2hhcmVkU3R5bGVzSG9zdDogRG9tU2hhcmVkU3R5bGVzSG9zdCxcbiAgICAgIGNvbXBvbmVudDogUmVuZGVyZXJUeXBlMixcbiAgICAgIHByaXZhdGUgcmVtb3ZlU3R5bGVzT25Db21wRGVzdG9yeTogYm9vbGVhbixcbiAgICAgIGNvbXBJZCA9IGNvbXBvbmVudC5pZCxcbiAgKSB7XG4gICAgc3VwZXIoZXZlbnRNYW5hZ2VyKTtcbiAgICB0aGlzLnN0eWxlcyA9IGZsYXR0ZW5TdHlsZXMoY29tcElkLCBjb21wb25lbnQuc3R5bGVzKTtcbiAgfVxuXG4gIGFwcGx5U3R5bGVzKCk6IHZvaWQge1xuICAgIHRoaXMuc2hhcmVkU3R5bGVzSG9zdC5hZGRTdHlsZXModGhpcy5zdHlsZXMpO1xuICAgIHRoaXMucmVuZGVyZXJVc2FnZUNvdW50Kys7XG4gIH1cblxuICBvdmVycmlkZSBkZXN0cm95KCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5yZW1vdmVTdHlsZXNPbkNvbXBEZXN0b3J5KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5zaGFyZWRTdHlsZXNIb3N0LnJlbW92ZVN0eWxlcyh0aGlzLnN0eWxlcyk7XG4gICAgdGhpcy5yZW5kZXJlclVzYWdlQ291bnQtLTtcbiAgICBpZiAodGhpcy5yZW5kZXJlclVzYWdlQ291bnQgPT09IDApIHtcbiAgICAgIHRoaXMub25EZXN0cm95Py4oKTtcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgRW11bGF0ZWRFbmNhcHN1bGF0aW9uRG9tUmVuZGVyZXIyIGV4dGVuZHMgTm9uZUVuY2Fwc3VsYXRpb25Eb21SZW5kZXJlciB7XG4gIHByaXZhdGUgY29udGVudEF0dHI6IHN0cmluZztcbiAgcHJpdmF0ZSBob3N0QXR0cjogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgZXZlbnRNYW5hZ2VyOiBFdmVudE1hbmFnZXIsIHNoYXJlZFN0eWxlc0hvc3Q6IERvbVNoYXJlZFN0eWxlc0hvc3QsIGNvbXBvbmVudDogUmVuZGVyZXJUeXBlMixcbiAgICAgIGFwcElkOiBzdHJpbmcsIHJlbW92ZVN0eWxlc09uQ29tcERlc3Rvcnk6IGJvb2xlYW4pIHtcbiAgICBjb25zdCBjb21wSWQgPSBhcHBJZCArICctJyArIGNvbXBvbmVudC5pZDtcbiAgICBzdXBlcihldmVudE1hbmFnZXIsIHNoYXJlZFN0eWxlc0hvc3QsIGNvbXBvbmVudCwgcmVtb3ZlU3R5bGVzT25Db21wRGVzdG9yeSwgY29tcElkKTtcbiAgICB0aGlzLmNvbnRlbnRBdHRyID0gc2hpbUNvbnRlbnRBdHRyaWJ1dGUoY29tcElkKTtcbiAgICB0aGlzLmhvc3RBdHRyID0gc2hpbUhvc3RBdHRyaWJ1dGUoY29tcElkKTtcbiAgfVxuXG4gIGFwcGx5VG9Ib3N0KGVsZW1lbnQ6IGFueSk6IHZvaWQge1xuICAgIHRoaXMuYXBwbHlTdHlsZXMoKTtcbiAgICB0aGlzLnNldEF0dHJpYnV0ZShlbGVtZW50LCB0aGlzLmhvc3RBdHRyLCAnJyk7XG4gIH1cblxuICBvdmVycmlkZSBjcmVhdGVFbGVtZW50KHBhcmVudDogYW55LCBuYW1lOiBzdHJpbmcpOiBFbGVtZW50IHtcbiAgICBjb25zdCBlbCA9IHN1cGVyLmNyZWF0ZUVsZW1lbnQocGFyZW50LCBuYW1lKTtcbiAgICBzdXBlci5zZXRBdHRyaWJ1dGUoZWwsIHRoaXMuY29udGVudEF0dHIsICcnKTtcbiAgICByZXR1cm4gZWw7XG4gIH1cbn1cbiJdfQ==