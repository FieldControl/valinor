/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DOCUMENT } from '@angular/common';
import { APP_ID, TransferState } from '@angular/core';
import { BEFORE_APP_SERIALIZED } from './tokens';
export const TRANSFER_STATE_SERIALIZATION_PROVIDERS = [
    {
        provide: BEFORE_APP_SERIALIZED,
        useFactory: serializeTransferStateFactory,
        deps: [DOCUMENT, APP_ID, TransferState],
        multi: true,
    },
];
/** TODO: Move this to a utils folder and convert to use SafeValues. */
export function createScript(doc, textContent, nonce) {
    const script = doc.createElement('script');
    script.textContent = textContent;
    if (nonce) {
        script.setAttribute('nonce', nonce);
    }
    return script;
}
function serializeTransferStateFactory(doc, appId, transferStore) {
    return () => {
        // The `.toJSON` here causes the `onSerialize` callbacks to be called.
        // These callbacks can be used to provide the value for a given key.
        const content = transferStore.toJson();
        if (transferStore.isEmpty) {
            // The state is empty, nothing to transfer,
            // avoid creating an extra `<script>` tag in this case.
            return;
        }
        const script = createScript(doc, content, 
        /**
         * `nonce` is not required for 'application/json'
         * See: https://html.spec.whatwg.org/multipage/scripting.html#attr-script-type
         */
        null);
        script.id = appId + '-state';
        script.setAttribute('type', 'application/json');
        // It is intentional that we add the script at the very bottom. Angular CLI script tags for
        // bundles are always `type="module"`. These are deferred by default and cause the transfer
        // transfer data to be queried only after the browser has finished parsing the DOM.
        doc.body.appendChild(script);
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmZXJfc3RhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9wbGF0Zm9ybS1zZXJ2ZXIvc3JjL3RyYW5zZmVyX3N0YXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUN6QyxPQUFPLEVBQUMsTUFBTSxFQUFZLGFBQWEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUU5RCxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFFL0MsTUFBTSxDQUFDLE1BQU0sc0NBQXNDLEdBQWU7SUFDaEU7UUFDRSxPQUFPLEVBQUUscUJBQXFCO1FBQzlCLFVBQVUsRUFBRSw2QkFBNkI7UUFDekMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxhQUFhLENBQUM7UUFDdkMsS0FBSyxFQUFFLElBQUk7S0FDWjtDQUNGLENBQUM7QUFFRix1RUFBdUU7QUFDdkUsTUFBTSxVQUFVLFlBQVksQ0FDMUIsR0FBYSxFQUNiLFdBQW1CLEVBQ25CLEtBQW9CO0lBRXBCLE1BQU0sTUFBTSxHQUFHLEdBQUcsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDM0MsTUFBTSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7SUFDakMsSUFBSSxLQUFLLEVBQUUsQ0FBQztRQUNWLE1BQU0sQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFFRCxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDO0FBRUQsU0FBUyw2QkFBNkIsQ0FBQyxHQUFhLEVBQUUsS0FBYSxFQUFFLGFBQTRCO0lBQy9GLE9BQU8sR0FBRyxFQUFFO1FBQ1Ysc0VBQXNFO1FBQ3RFLG9FQUFvRTtRQUNwRSxNQUFNLE9BQU8sR0FBRyxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUM7UUFFdkMsSUFBSSxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDMUIsMkNBQTJDO1lBQzNDLHVEQUF1RDtZQUN2RCxPQUFPO1FBQ1QsQ0FBQztRQUVELE1BQU0sTUFBTSxHQUFHLFlBQVksQ0FDekIsR0FBRyxFQUNILE9BQU87UUFDUDs7O1dBR0c7UUFDSCxJQUFJLENBQ0wsQ0FBQztRQUNGLE1BQU0sQ0FBQyxFQUFFLEdBQUcsS0FBSyxHQUFHLFFBQVEsQ0FBQztRQUM3QixNQUFNLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1FBRWhELDJGQUEyRjtRQUMzRiwyRkFBMkY7UUFDM0YsbUZBQW1GO1FBQ25GLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQy9CLENBQUMsQ0FBQztBQUNKLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7QVBQX0lELCBQcm92aWRlciwgVHJhbnNmZXJTdGF0ZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7QkVGT1JFX0FQUF9TRVJJQUxJWkVEfSBmcm9tICcuL3Rva2Vucyc7XG5cbmV4cG9ydCBjb25zdCBUUkFOU0ZFUl9TVEFURV9TRVJJQUxJWkFUSU9OX1BST1ZJREVSUzogUHJvdmlkZXJbXSA9IFtcbiAge1xuICAgIHByb3ZpZGU6IEJFRk9SRV9BUFBfU0VSSUFMSVpFRCxcbiAgICB1c2VGYWN0b3J5OiBzZXJpYWxpemVUcmFuc2ZlclN0YXRlRmFjdG9yeSxcbiAgICBkZXBzOiBbRE9DVU1FTlQsIEFQUF9JRCwgVHJhbnNmZXJTdGF0ZV0sXG4gICAgbXVsdGk6IHRydWUsXG4gIH0sXG5dO1xuXG4vKiogVE9ETzogTW92ZSB0aGlzIHRvIGEgdXRpbHMgZm9sZGVyIGFuZCBjb252ZXJ0IHRvIHVzZSBTYWZlVmFsdWVzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNjcmlwdChcbiAgZG9jOiBEb2N1bWVudCxcbiAgdGV4dENvbnRlbnQ6IHN0cmluZyxcbiAgbm9uY2U6IHN0cmluZyB8IG51bGwsXG4pOiBIVE1MU2NyaXB0RWxlbWVudCB7XG4gIGNvbnN0IHNjcmlwdCA9IGRvYy5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgc2NyaXB0LnRleHRDb250ZW50ID0gdGV4dENvbnRlbnQ7XG4gIGlmIChub25jZSkge1xuICAgIHNjcmlwdC5zZXRBdHRyaWJ1dGUoJ25vbmNlJywgbm9uY2UpO1xuICB9XG5cbiAgcmV0dXJuIHNjcmlwdDtcbn1cblxuZnVuY3Rpb24gc2VyaWFsaXplVHJhbnNmZXJTdGF0ZUZhY3RvcnkoZG9jOiBEb2N1bWVudCwgYXBwSWQ6IHN0cmluZywgdHJhbnNmZXJTdG9yZTogVHJhbnNmZXJTdGF0ZSkge1xuICByZXR1cm4gKCkgPT4ge1xuICAgIC8vIFRoZSBgLnRvSlNPTmAgaGVyZSBjYXVzZXMgdGhlIGBvblNlcmlhbGl6ZWAgY2FsbGJhY2tzIHRvIGJlIGNhbGxlZC5cbiAgICAvLyBUaGVzZSBjYWxsYmFja3MgY2FuIGJlIHVzZWQgdG8gcHJvdmlkZSB0aGUgdmFsdWUgZm9yIGEgZ2l2ZW4ga2V5LlxuICAgIGNvbnN0IGNvbnRlbnQgPSB0cmFuc2ZlclN0b3JlLnRvSnNvbigpO1xuXG4gICAgaWYgKHRyYW5zZmVyU3RvcmUuaXNFbXB0eSkge1xuICAgICAgLy8gVGhlIHN0YXRlIGlzIGVtcHR5LCBub3RoaW5nIHRvIHRyYW5zZmVyLFxuICAgICAgLy8gYXZvaWQgY3JlYXRpbmcgYW4gZXh0cmEgYDxzY3JpcHQ+YCB0YWcgaW4gdGhpcyBjYXNlLlxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHNjcmlwdCA9IGNyZWF0ZVNjcmlwdChcbiAgICAgIGRvYyxcbiAgICAgIGNvbnRlbnQsXG4gICAgICAvKipcbiAgICAgICAqIGBub25jZWAgaXMgbm90IHJlcXVpcmVkIGZvciAnYXBwbGljYXRpb24vanNvbidcbiAgICAgICAqIFNlZTogaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc2NyaXB0aW5nLmh0bWwjYXR0ci1zY3JpcHQtdHlwZVxuICAgICAgICovXG4gICAgICBudWxsLFxuICAgICk7XG4gICAgc2NyaXB0LmlkID0gYXBwSWQgKyAnLXN0YXRlJztcbiAgICBzY3JpcHQuc2V0QXR0cmlidXRlKCd0eXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcblxuICAgIC8vIEl0IGlzIGludGVudGlvbmFsIHRoYXQgd2UgYWRkIHRoZSBzY3JpcHQgYXQgdGhlIHZlcnkgYm90dG9tLiBBbmd1bGFyIENMSSBzY3JpcHQgdGFncyBmb3JcbiAgICAvLyBidW5kbGVzIGFyZSBhbHdheXMgYHR5cGU9XCJtb2R1bGVcImAuIFRoZXNlIGFyZSBkZWZlcnJlZCBieSBkZWZhdWx0IGFuZCBjYXVzZSB0aGUgdHJhbnNmZXJcbiAgICAvLyB0cmFuc2ZlciBkYXRhIHRvIGJlIHF1ZXJpZWQgb25seSBhZnRlciB0aGUgYnJvd3NlciBoYXMgZmluaXNoZWQgcGFyc2luZyB0aGUgRE9NLlxuICAgIGRvYy5ib2R5LmFwcGVuZENoaWxkKHNjcmlwdCk7XG4gIH07XG59XG4iXX0=