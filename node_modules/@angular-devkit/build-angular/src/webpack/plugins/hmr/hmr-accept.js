"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line import/no-extraneous-dependencies
const core_1 = require("@angular/core");
const operators_1 = require("rxjs/operators");
function default_1(mod) {
    if (!mod['hot']) {
        return;
    }
    if (!(0, core_1.isDevMode)()) {
        console.error(`[NG HMR] Cannot use HMR when Angular is running in production mode. To prevent production mode, do not call 'enableProdMode()'.`);
        return;
    }
    mod['hot'].accept();
    mod['hot'].dispose(() => {
        if (typeof ng === 'undefined') {
            console.warn(`[NG HMR] Cannot find global 'ng'. Likely this is caused because scripts optimization is enabled.`);
            return;
        }
        if (!ng.getInjector) {
            // View Engine
            return;
        }
        // Reset JIT compiled components cache
        (0, core_1.ɵresetCompiledComponents)();
        const appRoot = getAppRoot();
        if (!appRoot) {
            return;
        }
        const appRef = getApplicationRef(appRoot);
        if (!appRef) {
            return;
        }
        // Inputs that are hidden should be ignored
        const oldInputs = document.querySelectorAll('input:not([type="hidden"]), textarea');
        const oldOptions = document.querySelectorAll('option');
        // Create new application
        appRef.components.forEach((cp) => {
            const element = cp.location.nativeElement;
            const parentNode = element.parentNode;
            parentNode.insertBefore(document.createElement(element.tagName), element);
            parentNode.removeChild(element);
        });
        // Destroy old application, injectors, <style..., etc..
        const platformRef = getPlatformRef(appRoot);
        if (platformRef) {
            platformRef.destroy();
        }
        // Restore all inputs and options
        const bodyElement = document.body;
        if (oldInputs.length + oldOptions.length === 0 || !bodyElement) {
            return;
        }
        // Use a `MutationObserver` to wait until the app-root element has been bootstrapped.
        // ie: when the ng-version attribute is added.
        new MutationObserver((_mutationsList, observer) => {
            observer.disconnect();
            const newAppRoot = getAppRoot();
            if (!newAppRoot) {
                return;
            }
            const newAppRef = getApplicationRef(newAppRoot);
            if (!newAppRef) {
                return;
            }
            // Wait until the application isStable to restore the form values
            newAppRef.isStable
                .pipe((0, operators_1.filter)((isStable) => !!isStable), (0, operators_1.take)(1))
                .subscribe(() => restoreFormValues(oldInputs, oldOptions));
        }).observe(bodyElement, {
            attributes: true,
            subtree: true,
            attributeFilter: ['ng-version'],
        });
    });
}
exports.default = default_1;
function getAppRoot() {
    const appRoot = document.querySelector('[ng-version]');
    if (!appRoot) {
        console.warn('[NG HMR] Cannot find the application root component.');
        return undefined;
    }
    return appRoot;
}
function getToken(appRoot, token) {
    return (typeof ng === 'object' && ng.getInjector(appRoot).get(token)) || undefined;
}
function getApplicationRef(appRoot) {
    const appRef = getToken(appRoot, core_1.ApplicationRef);
    if (!appRef) {
        console.warn(`[NG HMR] Cannot get 'ApplicationRef'.`);
        return undefined;
    }
    return appRef;
}
function getPlatformRef(appRoot) {
    const platformRef = getToken(appRoot, core_1.PlatformRef);
    if (!platformRef) {
        console.warn(`[NG HMR] Cannot get 'PlatformRef'.`);
        return undefined;
    }
    return platformRef;
}
function dispatchEvents(element) {
    element.dispatchEvent(new Event('input', {
        bubbles: true,
        cancelable: true,
    }));
    element.blur();
    element.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));
}
function restoreFormValues(oldInputs, oldOptions) {
    // Restore input that are not hidden
    const newInputs = document.querySelectorAll('input:not([type="hidden"]), textarea');
    if (newInputs.length && newInputs.length === oldInputs.length) {
        console.log('[NG HMR] Restoring input/textarea values.');
        for (let index = 0; index < newInputs.length; index++) {
            const newElement = newInputs[index];
            const oldElement = oldInputs[index];
            switch (oldElement.type) {
                case 'button':
                case 'image':
                case 'submit':
                case 'reset':
                    // These types don't need any value change.
                    continue;
                case 'radio':
                case 'checkbox':
                    newElement.checked = oldElement.checked;
                    break;
                case 'color':
                case 'date':
                case 'datetime-local':
                case 'email':
                case 'hidden':
                case 'month':
                case 'number':
                case 'password':
                case 'range':
                case 'search':
                case 'tel':
                case 'text':
                case 'textarea':
                case 'time':
                case 'url':
                case 'week':
                    newElement.value = oldElement.value;
                    break;
                case 'file':
                    // Ignored due: Uncaught DOMException: Failed to set the 'value' property on 'HTMLInputElement':
                    // This input element accepts a filename, which may only be programmatically set to the empty string.
                    break;
                default:
                    console.warn('[NG HMR] Unknown input type ' + oldElement.type + '.');
                    continue;
            }
            dispatchEvents(newElement);
        }
    }
    else if (oldInputs.length) {
        console.warn('[NG HMR] Cannot restore input/textarea values.');
    }
    // Restore option
    const newOptions = document.querySelectorAll('option');
    if (newOptions.length && newOptions.length === oldOptions.length) {
        console.log('[NG HMR] Restoring selected options.');
        for (let index = 0; index < newOptions.length; index++) {
            const newElement = newOptions[index];
            newElement.selected = oldOptions[index].selected;
            dispatchEvents(newElement);
        }
    }
    else if (oldOptions.length) {
        console.warn('[NG HMR] Cannot restore selected options.');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG1yLWFjY2VwdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuZ3VsYXJfZGV2a2l0L2J1aWxkX2FuZ3VsYXIvc3JjL3dlYnBhY2svcGx1Z2lucy9obXIvaG1yLWFjY2VwdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOztBQUVILDZEQUE2RDtBQUM3RCx3Q0FNdUI7QUFDdkIsOENBQThDO0FBYzlDLG1CQUF5QixHQUFRO0lBQy9CLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDZixPQUFPO0tBQ1I7SUFFRCxJQUFJLENBQUMsSUFBQSxnQkFBUyxHQUFFLEVBQUU7UUFDaEIsT0FBTyxDQUFDLEtBQUssQ0FDWCxpSUFBaUksQ0FDbEksQ0FBQztRQUVGLE9BQU87S0FDUjtJQUVELEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUNwQixHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRTtRQUN0QixJQUFJLE9BQU8sRUFBRSxLQUFLLFdBQVcsRUFBRTtZQUM3QixPQUFPLENBQUMsSUFBSSxDQUNWLGtHQUFrRyxDQUNuRyxDQUFDO1lBRUYsT0FBTztTQUNSO1FBRUQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUU7WUFDbkIsY0FBYztZQUNkLE9BQU87U0FDUjtRQUVELHNDQUFzQztRQUN0QyxJQUFBLCtCQUF3QixHQUFFLENBQUM7UUFDM0IsTUFBTSxPQUFPLEdBQUcsVUFBVSxFQUFFLENBQUM7UUFDN0IsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNaLE9BQU87U0FDUjtRQUVELE1BQU0sTUFBTSxHQUFHLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzFDLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDWCxPQUFPO1NBQ1I7UUFFRCwyQ0FBMkM7UUFDM0MsTUFBTSxT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NUI7S0FDRjtTQUFNLElBQUksU0FBUyxDQUFDLE1BQU0sRUFBRTtRQUMzQixPQUFPLENBQUMsSUFBSSxDQUFDLGdEQUFnRCxDQUFDLENBQUM7S0FDaEU7SUFFRCxpQkFBaUI7SUFDakIsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3ZELElBQUksVUFBVSxDQUFDLE1BQU0sSUFBSSxVQUFVLENBQUMsTUFBTSxLQUFLLFVBQVUsQ0FBQyxNQUFNLEVBQUU7UUFDaEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO1FBQ3BELEtBQUssSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFLEtBQUssR0FBRyxVQUFVLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFO1lBQ3RELE1BQU0sVUFBVSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNyQyxVQUFVLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxRQUFRLENBQUM7WUFFakQsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBQzVCO0tBQ0Y7U0FBTSxJQUFJLFVBQVUsQ0FBQyxNQUFNLEVBQUU7UUFDNUIsT0FBTyxDQUFDLElBQUksQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDO0tBQzNEO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgaW1wb3J0L25vLWV4dHJhbmVvdXMtZGVwZW5kZW5jaWVzXG5pbXBvcnQge1xuICBBcHBsaWNhdGlvblJlZixcbiAgUGxhdGZvcm1SZWYsXG4gIFR5cGUsXG4gIGlzRGV2TW9kZSxcbiAgybVyZXNldENvbXBpbGVkQ29tcG9uZW50cyxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBmaWx0ZXIsIHRha2UgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbi8vIEZvciB0aGUgdGltZSBiZWluZyB3ZSBjYW5ub3QgdXNlIHRoZSBET00gbGliIGJlY2F1c2UgaXQgY29uZmxpY3RzIHdpdGggQHR5cGVzL25vZGUsXG4vLyBJbiBmdXR1cmUgd2hlbiB3ZSByZW1vdmUgYHlhcm4gYWRtaW4gYnVpbGRgIHdlIHNob3VsZCBoYXZlIHRoaXMgYXMgYSBzZXBlcmF0ZSBjb21waWxhdGlvbiB1bml0XG4vLyB3aGljaCBpbmNsdWRlcyBET00gbGliLlxuXG4vKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG4vKiBlc2xpbnQtZGlzYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55ICovXG5kZWNsYXJlIGNvbnN0IG5nOiBhbnk7XG5kZWNsYXJlIGNvbnN0IGRvY3VtZW50OiBhbnk7XG5kZWNsYXJlIGNvbnN0IE11dGF0aW9uT2JzZXJ2ZXI6IGFueTtcbmRlY2xhcmUgY29uc3QgS2V5Ym9hcmRFdmVudDogYW55O1xuZGVjbGFyZSBjb25zdCBFdmVudDogYW55O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAobW9kOiBhbnkpOiB2b2lkIHtcbiAgaWYgKCFtb2RbJ2hvdCddKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKCFpc0Rldk1vZGUoKSkge1xuICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICBgW05HIEhNUl0gQ2Fubm90IHVzZSBITVIgd2hlbiBBbmd1bGFyIGlzIHJ1bm5pbmcgaW4gcHJvZHVjdGlvbiBtb2RlLiBUbyBwcmV2ZW50IHByb2R1Y3Rpb24gbW9kZSwgZG8gbm90IGNhbGwgJ2VuYWJsZVByb2RNb2RlKCknLmAsXG4gICAgKTtcblxuICAgIHJldHVybjtcbiAgfVxuXG4gIG1vZFsnaG90J10uYWNjZXB0KCk7XG4gIG1vZFsnaG90J10uZGlzcG9zZSgoKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBuZyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgYFtORyBITVJdIENhbm5vdCBmaW5kIGdsb2JhbCAnbmcnLiBMaWtlbHkgdGhpcyBpcyBjYXVzZWQgYmVjYXVzZSBzY3JpcHRzIG9wdGltaXphdGlvbiBpcyBlbmFibGVkLmAsXG4gICAgICApO1xuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCFuZy5nZXRJbmplY3Rvcikge1xuICAgICAgLy8gVmlldyBFbmdpbmVcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBSZXNldCBKSVQgY29tcGlsZWQgY29tcG9uZW50cyBjYWNoZVxuICAgIMm1cmVzZXRDb21waWxlZENvbXBvbmVudHMoKTtcbiAgICBjb25zdCBhcHBSb290ID0gZ2V0QXBwUm9vdCgpO1xuICAgIGlmICghYXBwUm9vdCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGFwcFJlZiA9IGdldEFwcGxpY2F0aW9uUmVmKGFwcFJvb3QpO1xuICAgIGlmICghYXBwUmVmKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gSW5wdXRzIHRoYXQgYXJlIGhpZGRlbiBzaG91bGQgYmUgaWdub3JlZFxuICAgIGNvbnN0IG9sZElucHV0cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2lucHV0Om5vdChbdHlwZT1cImhpZGRlblwiXSksIHRleHRhcmVhJyk7XG4gICAgY29uc3Qgb2xkT3B0aW9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ29wdGlvbicpO1xuXG4gICAgLy8gQ3JlYXRlIG5ldyBhcHBsaWNhdGlvblxuICAgIGFwcFJlZi5jb21wb25lbnRzLmZvckVhY2goKGNwKSA9PiB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gY3AubG9jYXRpb24ubmF0aXZlRWxlbWVudDtcbiAgICAgIGNvbnN0IHBhcmVudE5vZGUgPSBlbGVtZW50LnBhcmVudE5vZGU7XG4gICAgICBwYXJlbnROb2RlLmluc2VydEJlZm9yZShkb2N1bWVudC5jcmVhdGVFbGVtZW50KGVsZW1lbnQudGFnTmFtZSksIGVsZW1lbnQpO1xuXG4gICAgICBwYXJlbnROb2RlLnJlbW92ZUNoaWxkKGVsZW1lbnQpO1xuICAgIH0pO1xuXG4gICAgLy8gRGVzdHJveSBvbGQgYXBwbGljYXRpb24sIGluamVjdG9ycywgPHN0eWxlLi4uLCBldGMuLlxuICAgIGNvbnN0IHBsYXRmb3JtUmVmID0gZ2V0UGxhdGZvcm1SZWYoYXBwUm9vdCk7XG4gICAgaWYgKHBsYXRmb3JtUmVmKSB7XG4gICAgICBwbGF0Zm9ybVJlZi5kZXN0cm95KCk7XG4gICAgfVxuXG4gICAgLy8gUmVzdG9yZSBhbGwgaW5wdXRzIGFuZCBvcHRpb25zXG4gICAgY29uc3QgYm9keUVsZW1lbnQgPSBkb2N1bWVudC5ib2R5O1xuICAgIGlmIChvbGRJbnB1dHMubGVuZ3RoICsgb2xkT3B0aW9ucy5sZW5ndGggPT09IDAgfHwgIWJvZHlFbGVtZW50KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gVXNlIGEgYE11dGF0aW9uT2JzZXJ2ZXJgIHRvIHdhaXQgdW50aWwgdGhlIGFwcC1yb290IGVsZW1lbnQgaGFzIGJlZW4gYm9vdHN0cmFwcGVkLlxuICAgIC8vIGllOiB3aGVuIHRoZSBuZy12ZXJzaW9uIGF0dHJpYnV0ZSBpcyBhZGRlZC5cbiAgICBuZXcgTXV0YXRpb25PYnNlcnZlcigoX211dGF0aW9uc0xpc3Q6IGFueSwgb2JzZXJ2ZXI6IGFueSkgPT4ge1xuICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuXG4gICAgICBjb25zdCBuZXdBcHBSb290ID0gZ2V0QXBwUm9vdCgpO1xuICAgICAgaWYgKCFuZXdBcHBSb290KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgbmV3QXBwUmVmID0gZ2V0QXBwbGljYXRpb25SZWYobmV3QXBwUm9vdCk7XG4gICAgICBpZiAoIW5ld0FwcFJlZikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFdhaXQgdW50aWwgdGhlIGFwcGxpY2F0aW9uIGlzU3RhYmxlIHRvIHJlc3RvcmUgdGhlIGZvcm0gdmFsdWVzXG4gICAgICBuZXdBcHBSZWYuaXNTdGFibGVcbiAgICAgICAgLnBpcGUoXG4gICAgICAgICAgZmlsdGVyKChpc1N0YWJsZSkgPT4gISFpc1N0YWJsZSksXG4gICAgICAgICAgdGFrZSgxKSxcbiAgICAgICAgKVxuICAgICAgICAuc3Vic2NyaWJlKCgpID0+IHJlc3RvcmVGb3JtVmFsdWVzKG9sZElucHV0cywgb2xkT3B0aW9ucykpO1xuICAgIH0pLm9ic2VydmUoYm9keUVsZW1lbnQsIHtcbiAgICAgIGF0dHJpYnV0ZXM6IHRydWUsXG4gICAgICBzdWJ0cmVlOiB0cnVlLFxuICAgICAgYXR0cmlidXRlRmlsdGVyOiBbJ25nLXZlcnNpb24nXSxcbiAgICB9KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldEFwcFJvb3QoKTogYW55IHtcbiAgY29uc3QgYXBwUm9vdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1tuZy12ZXJzaW9uXScpO1xuICBpZiAoIWFwcFJvb3QpIHtcbiAgICBjb25zb2xlLndhcm4oJ1tORyBITVJdIENhbm5vdCBmaW5kIHRoZSBhcHBsaWNhdGlvbiByb290IGNvbXBvbmVudC4nKTtcblxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICByZXR1cm4gYXBwUm9vdDtcbn1cblxuZnVuY3Rpb24gZ2V0VG9rZW48VD4oYXBwUm9vdDogYW55LCB0b2tlbjogVHlwZTxUPik6IFQgfCB1bmRlZmluZWQge1xuICByZXR1cm4gKHR5cGVvZiBuZyA9PT0gJ29iamVjdCcgJiYgbmcuZ2V0SW5qZWN0b3IoYXBwUm9vdCkuZ2V0KHRva2VuKSkgfHwgdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBnZXRBcHBsaWNhdGlvblJlZihhcHBSb290OiBhbnkpOiBBcHBsaWNhdGlvblJlZiB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IGFwcFJlZiA9IGdldFRva2VuKGFwcFJvb3QsIEFwcGxpY2F0aW9uUmVmKTtcbiAgaWYgKCFhcHBSZWYpIHtcbiAgICBjb25zb2xlLndhcm4oYFtORyBITVJdIENhbm5vdCBnZXQgJ0FwcGxpY2F0aW9uUmVmJy5gKTtcblxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICByZXR1cm4gYXBwUmVmO1xufVxuXG5mdW5jdGlvbiBnZXRQbGF0Zm9ybVJlZihhcHBSb290OiBhbnkpOiBQbGF0Zm9ybVJlZiB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IHBsYXRmb3JtUmVmID0gZ2V0VG9rZW4oYXBwUm9vdCwgUGxhdGZvcm1SZWYpO1xuICBpZiAoIXBsYXRmb3JtUmVmKSB7XG4gICAgY29uc29sZS53YXJuKGBbTkcgSE1SXSBDYW5ub3QgZ2V0ICdQbGF0Zm9ybVJlZicuYCk7XG5cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgcmV0dXJuIHBsYXRmb3JtUmVmO1xufVxuXG5mdW5jdGlvbiBkaXNwYXRjaEV2ZW50cyhlbGVtZW50OiBhbnkpOiB2b2lkIHtcbiAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KFxuICAgIG5ldyBFdmVudCgnaW5wdXQnLCB7XG4gICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgY2FuY2VsYWJsZTogdHJ1ZSxcbiAgICB9KSxcbiAgKTtcblxuICBlbGVtZW50LmJsdXIoKTtcblxuICBlbGVtZW50LmRpc3BhdGNoRXZlbnQobmV3IEtleWJvYXJkRXZlbnQoJ2tleXVwJywgeyBrZXk6ICdFbnRlcicgfSkpO1xufVxuXG5mdW5jdGlvbiByZXN0b3JlRm9ybVZhbHVlcyhvbGRJbnB1dHM6IGFueVtdLCBvbGRPcHRpb25zOiBhbnlbXSk6IHZvaWQge1xuICAvLyBSZXN0b3JlIGlucHV0IHRoYXQgYXJlIG5vdCBoaWRkZW5cbiAgY29uc3QgbmV3SW5wdXRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnaW5wdXQ6bm90KFt0eXBlPVwiaGlkZGVuXCJdKSwgdGV4dGFyZWEnKTtcbiAgaWYgKG5ld0lucHV0cy5sZW5ndGggJiYgbmV3SW5wdXRzLmxlbmd0aCA9PT0gb2xkSW5wdXRzLmxlbmd0aCkge1xuICAgIGNvbnNvbGUubG9nKCdbTkcgSE1SXSBSZXN0b3JpbmcgaW5wdXQvdGV4dGFyZWEgdmFsdWVzLicpO1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBuZXdJbnB1dHMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCBuZXdFbGVtZW50ID0gbmV3SW5wdXRzW2luZGV4XTtcbiAgICAgIGNvbnN0IG9sZEVsZW1lbnQgPSBvbGRJbnB1dHNbaW5kZXhdO1xuXG4gICAgICBzd2l0Y2ggKG9sZEVsZW1lbnQudHlwZSkge1xuICAgICAgICBjYXNlICdidXR0b24nOlxuICAgICAgICBjYXNlICdpbWFnZSc6XG4gICAgICAgIGNhc2UgJ3N1Ym1pdCc6XG4gICAgICAgIGNhc2UgJ3Jlc2V0JzpcbiAgICAgICAgICAvLyBUaGVzZSB0eXBlcyBkb24ndCBuZWVkIGFueSB2YWx1ZSBjaGFuZ2UuXG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIGNhc2UgJ3JhZGlvJzpcbiAgICAgICAgY2FzZSAnY2hlY2tib3gnOlxuICAgICAgICAgIG5ld0VsZW1lbnQuY2hlY2tlZCA9IG9sZEVsZW1lbnQuY2hlY2tlZDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnY29sb3InOlxuICAgICAgICBjYXNlICdkYXRlJzpcbiAgICAgICAgY2FzZSAnZGF0ZXRpbWUtbG9jYWwnOlxuICAgICAgICBjYXNlICdlbWFpbCc6XG4gICAgICAgIGNhc2UgJ2hpZGRlbic6XG4gICAgICAgIGNhc2UgJ21vbnRoJzpcbiAgICAgICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgICAgY2FzZSAncGFzc3dvcmQnOlxuICAgICAgICBjYXNlICdyYW5nZSc6XG4gICAgICAgIGNhc2UgJ3NlYXJjaCc6XG4gICAgICAgIGNhc2UgJ3RlbCc6XG4gICAgICAgIGNhc2UgJ3RleHQnOlxuICAgICAgICBjYXNlICd0ZXh0YXJlYSc6XG4gICAgICAgIGNhc2UgJ3RpbWUnOlxuICAgICAgICBjYXNlICd1cmwnOlxuICAgICAgICBjYXNlICd3ZWVrJzpcbiAgICAgICAgICBuZXdFbGVtZW50LnZhbHVlID0gb2xkRWxlbWVudC52YWx1ZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZmlsZSc6XG4gICAgICAgICAgLy8gSWdub3JlZCBkdWU6IFVuY2F1Z2h0IERPTUV4Y2VwdGlvbjogRmFpbGVkIHRvIHNldCB0aGUgJ3ZhbHVlJyBwcm9wZXJ0eSBvbiAnSFRNTElucHV0RWxlbWVudCc6XG4gICAgICAgICAgLy8gVGhpcyBpbnB1dCBlbGVtZW50IGFjY2VwdHMgYSBmaWxlbmFtZSwgd2hpY2ggbWF5IG9ubHkgYmUgcHJvZ3JhbW1hdGljYWxseSBzZXQgdG8gdGhlIGVtcHR5IHN0cmluZy5cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBjb25zb2xlLndhcm4oJ1tORyBITVJdIFVua25vd24gaW5wdXQgdHlwZSAnICsgb2xkRWxlbWVudC50eXBlICsgJy4nKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgZGlzcGF0Y2hFdmVudHMobmV3RWxlbWVudCk7XG4gICAgfVxuICB9IGVsc2UgaWYgKG9sZElucHV0cy5sZW5ndGgpIHtcbiAgICBjb25zb2xlLndhcm4oJ1tORyBITVJdIENhbm5vdCByZXN0b3JlIGlucHV0L3RleHRhcmVhIHZhbHVlcy4nKTtcbiAgfVxuXG4gIC8vIFJlc3RvcmUgb3B0aW9uXG4gIGNvbnN0IG5ld09wdGlvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdvcHRpb24nKTtcbiAgaWYgKG5ld09wdGlvbnMubGVuZ3RoICYmIG5ld09wdGlvbnMubGVuZ3RoID09PSBvbGRPcHRpb25zLmxlbmd0aCkge1xuICAgIGNvbnNvbGUubG9nKCdbTkcgSE1SXSBSZXN0b3Jpbmcgc2VsZWN0ZWQgb3B0aW9ucy4nKTtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgbmV3T3B0aW9ucy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGNvbnN0IG5ld0VsZW1lbnQgPSBuZXdPcHRpb25zW2luZGV4XTtcbiAgICAgIG5ld0VsZW1lbnQuc2VsZWN0ZWQgPSBvbGRPcHRpb25zW2luZGV4XS5zZWxlY3RlZDtcblxuICAgICAgZGlzcGF0Y2hFdmVudHMobmV3RWxlbWVudCk7XG4gICAgfVxuICB9IGVsc2UgaWYgKG9sZE9wdGlvbnMubGVuZ3RoKSB7XG4gICAgY29uc29sZS53YXJuKCdbTkcgSE1SXSBDYW5ub3QgcmVzdG9yZSBzZWxlY3RlZCBvcHRpb25zLicpO1xuICB9XG59XG4iXX0=