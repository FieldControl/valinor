/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { APP_ID, PLATFORM_ID } from './application/application_tokens';
import { inject } from './di/injector_compatibility';
import { ɵɵdefineInjectable } from './di/interface/defs';
import { getDocument } from './render3/interfaces/document';
/**
 * Create a `StateKey<T>` that can be used to store value of type T with `TransferState`.
 *
 * Example:
 *
 * ```
 * const COUNTER_KEY = makeStateKey<number>('counter');
 * let value = 10;
 *
 * transferState.set(COUNTER_KEY, value);
 * ```
 *
 * @publicApi
 */
export function makeStateKey(key) {
    return key;
}
function initTransferState() {
    const transferState = new TransferState();
    if (inject(PLATFORM_ID) === 'browser') {
        transferState.store = retrieveTransferredState(getDocument(), inject(APP_ID));
    }
    return transferState;
}
/**
 * A key value store that is transferred from the application on the server side to the application
 * on the client side.
 *
 * The `TransferState` is available as an injectable token.
 * On the client, just inject this token using DI and use it, it will be lazily initialized.
 * On the server it's already included if `renderApplication` function is used. Otherwise, import
 * the `ServerTransferStateModule` module to make the `TransferState` available.
 *
 * The values in the store are serialized/deserialized using JSON.stringify/JSON.parse. So only
 * boolean, number, string, null and non-class objects will be serialized and deserialized in a
 * non-lossy manner.
 *
 * @publicApi
 */
export class TransferState {
    constructor() {
        /** @internal */
        this.store = {};
        this.onSerializeCallbacks = {};
    }
    /** @nocollapse */
    static { this.ɵprov = ɵɵdefineInjectable({
        token: TransferState,
        providedIn: 'root',
        factory: initTransferState,
    }); }
    /**
     * Get the value corresponding to a key. Return `defaultValue` if key is not found.
     */
    get(key, defaultValue) {
        return this.store[key] !== undefined ? this.store[key] : defaultValue;
    }
    /**
     * Set the value corresponding to a key.
     */
    set(key, value) {
        this.store[key] = value;
    }
    /**
     * Remove a key from the store.
     */
    remove(key) {
        delete this.store[key];
    }
    /**
     * Test whether a key exists in the store.
     */
    hasKey(key) {
        return this.store.hasOwnProperty(key);
    }
    /**
     * Indicates whether the state is empty.
     */
    get isEmpty() {
        return Object.keys(this.store).length === 0;
    }
    /**
     * Register a callback to provide the value for a key when `toJson` is called.
     */
    onSerialize(key, callback) {
        this.onSerializeCallbacks[key] = callback;
    }
    /**
     * Serialize the current state of the store to JSON.
     */
    toJson() {
        // Call the onSerialize callbacks and put those values into the store.
        for (const key in this.onSerializeCallbacks) {
            if (this.onSerializeCallbacks.hasOwnProperty(key)) {
                try {
                    this.store[key] = this.onSerializeCallbacks[key]();
                }
                catch (e) {
                    console.warn('Exception in onSerialize callback: ', e);
                }
            }
        }
        // Escape script tag to avoid break out of <script> tag in serialized output.
        // Encoding of `<` is the same behaviour as G3 script_builders.
        return JSON.stringify(this.store).replace(/</g, '\\u003C');
    }
}
function retrieveTransferredState(doc, appId) {
    // Locate the script tag with the JSON data transferred from the server.
    // The id of the script tag is set to the Angular appId + 'state'.
    const script = doc.getElementById(appId + '-state');
    if (script?.textContent) {
        try {
            // Avoid using any here as it triggers lint errors in google3 (any is not allowed).
            // Decoding of `<` is done of the box by browsers and node.js, same behaviour as G3
            // script_builders.
            return JSON.parse(script.textContent);
        }
        catch (e) {
            console.warn('Exception while restoring TransferState for app ' + appId, e);
        }
    }
    return {};
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmZXJfc3RhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy90cmFuc2Zlcl9zdGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsTUFBTSxFQUFFLFdBQVcsRUFBQyxNQUFNLGtDQUFrQyxDQUFDO0FBQ3JFLE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSw2QkFBNkIsQ0FBQztBQUNuRCxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUN2RCxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sK0JBQStCLENBQUM7QUFxQjFEOzs7Ozs7Ozs7Ozs7O0dBYUc7QUFDSCxNQUFNLFVBQVUsWUFBWSxDQUFXLEdBQVc7SUFDaEQsT0FBTyxHQUFrQixDQUFDO0FBQzVCLENBQUM7QUFFRCxTQUFTLGlCQUFpQjtJQUN4QixNQUFNLGFBQWEsR0FBRyxJQUFJLGFBQWEsRUFBRSxDQUFDO0lBQzFDLElBQUksTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLFNBQVMsRUFBRSxDQUFDO1FBQ3RDLGFBQWEsQ0FBQyxLQUFLLEdBQUcsd0JBQXdCLENBQUMsV0FBVyxFQUFFLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDaEYsQ0FBQztJQUVELE9BQU8sYUFBYSxDQUFDO0FBQ3ZCLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7R0FjRztBQUNILE1BQU0sT0FBTyxhQUFhO0lBQTFCO1FBUUUsZ0JBQWdCO1FBQ2hCLFVBQUssR0FBd0MsRUFBRSxDQUFDO1FBRXhDLHlCQUFvQixHQUE2QyxFQUFFLENBQUM7SUErRDlFLENBQUM7SUF6RUMsa0JBQWtCO2FBQ1gsVUFBSyxHQUE2QixrQkFBa0IsQ0FBQztRQUMxRCxLQUFLLEVBQUUsYUFBYTtRQUNwQixVQUFVLEVBQUUsTUFBTTtRQUNsQixPQUFPLEVBQUUsaUJBQWlCO0tBQzNCLENBQUMsQUFKVSxDQUlUO0lBT0g7O09BRUc7SUFDSCxHQUFHLENBQUksR0FBZ0IsRUFBRSxZQUFlO1FBQ3RDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFPLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQztJQUMvRSxDQUFDO0lBRUQ7O09BRUc7SUFDSCxHQUFHLENBQUksR0FBZ0IsRUFBRSxLQUFRO1FBQy9CLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO0lBQzFCLENBQUM7SUFFRDs7T0FFRztJQUNILE1BQU0sQ0FBSSxHQUFnQjtRQUN4QixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDekIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsTUFBTSxDQUFJLEdBQWdCO1FBQ3hCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQUVEOztPQUVHO0lBQ0gsSUFBSSxPQUFPO1FBQ1QsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFFRDs7T0FFRztJQUNILFdBQVcsQ0FBSSxHQUFnQixFQUFFLFFBQWlCO1FBQ2hELElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsR0FBRyxRQUFRLENBQUM7SUFDNUMsQ0FBQztJQUVEOztPQUVHO0lBQ0gsTUFBTTtRQUNKLHNFQUFzRTtRQUN0RSxLQUFLLE1BQU0sR0FBRyxJQUFJLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1lBQzVDLElBQUksSUFBSSxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUNsRCxJQUFJLENBQUM7b0JBQ0gsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDckQsQ0FBQztnQkFBQyxPQUFPLENBQUMsRUFBRSxDQUFDO29CQUNYLE9BQU8sQ0FBQyxJQUFJLENBQUMscUNBQXFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pELENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQztRQUVELDZFQUE2RTtRQUM3RSwrREFBK0Q7UUFDL0QsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQzdELENBQUM7O0FBR0gsU0FBUyx3QkFBd0IsQ0FDL0IsR0FBYSxFQUNiLEtBQWE7SUFFYix3RUFBd0U7SUFDeEUsa0VBQWtFO0lBQ2xFLE1BQU0sTUFBTSxHQUFHLEdBQUcsQ0FBQyxjQUFjLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxDQUFDO0lBQ3BELElBQUksTUFBTSxFQUFFLFdBQVcsRUFBRSxDQUFDO1FBQ3hCLElBQUksQ0FBQztZQUNILG1GQUFtRjtZQUNuRixtRkFBbUY7WUFDbkYsbUJBQW1CO1lBQ25CLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFPLENBQUM7UUFDOUMsQ0FBQztRQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDWCxPQUFPLENBQUMsSUFBSSxDQUFDLGtEQUFrRCxHQUFHLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztRQUM5RSxDQUFDO0lBQ0gsQ0FBQztJQUVELE9BQU8sRUFBRSxDQUFDO0FBQ1osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBUFBfSUQsIFBMQVRGT1JNX0lEfSBmcm9tICcuL2FwcGxpY2F0aW9uL2FwcGxpY2F0aW9uX3Rva2Vucyc7XG5pbXBvcnQge2luamVjdH0gZnJvbSAnLi9kaS9pbmplY3Rvcl9jb21wYXRpYmlsaXR5JztcbmltcG9ydCB7ybXJtWRlZmluZUluamVjdGFibGV9IGZyb20gJy4vZGkvaW50ZXJmYWNlL2RlZnMnO1xuaW1wb3J0IHtnZXREb2N1bWVudH0gZnJvbSAnLi9yZW5kZXIzL2ludGVyZmFjZXMvZG9jdW1lbnQnO1xuXG4vKipcbiAqIEEgdHlwZS1zYWZlIGtleSB0byB1c2Ugd2l0aCBgVHJhbnNmZXJTdGF0ZWAuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiBgYGBcbiAqIGNvbnN0IENPVU5URVJfS0VZID0gbWFrZVN0YXRlS2V5PG51bWJlcj4oJ2NvdW50ZXInKTtcbiAqIGxldCB2YWx1ZSA9IDEwO1xuICpcbiAqIHRyYW5zZmVyU3RhdGUuc2V0KENPVU5URVJfS0VZLCB2YWx1ZSk7XG4gKiBgYGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCB0eXBlIFN0YXRlS2V5PFQ+ID0gc3RyaW5nICYge1xuICBfX25vdF9hX3N0cmluZzogbmV2ZXI7XG4gIF9fdmFsdWVfdHlwZT86IFQ7XG59O1xuXG4vKipcbiAqIENyZWF0ZSBhIGBTdGF0ZUtleTxUPmAgdGhhdCBjYW4gYmUgdXNlZCB0byBzdG9yZSB2YWx1ZSBvZiB0eXBlIFQgd2l0aCBgVHJhbnNmZXJTdGF0ZWAuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiBgYGBcbiAqIGNvbnN0IENPVU5URVJfS0VZID0gbWFrZVN0YXRlS2V5PG51bWJlcj4oJ2NvdW50ZXInKTtcbiAqIGxldCB2YWx1ZSA9IDEwO1xuICpcbiAqIHRyYW5zZmVyU3RhdGUuc2V0KENPVU5URVJfS0VZLCB2YWx1ZSk7XG4gKiBgYGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYWtlU3RhdGVLZXk8VCA9IHZvaWQ+KGtleTogc3RyaW5nKTogU3RhdGVLZXk8VD4ge1xuICByZXR1cm4ga2V5IGFzIFN0YXRlS2V5PFQ+O1xufVxuXG5mdW5jdGlvbiBpbml0VHJhbnNmZXJTdGF0ZSgpOiBUcmFuc2ZlclN0YXRlIHtcbiAgY29uc3QgdHJhbnNmZXJTdGF0ZSA9IG5ldyBUcmFuc2ZlclN0YXRlKCk7XG4gIGlmIChpbmplY3QoUExBVEZPUk1fSUQpID09PSAnYnJvd3NlcicpIHtcbiAgICB0cmFuc2ZlclN0YXRlLnN0b3JlID0gcmV0cmlldmVUcmFuc2ZlcnJlZFN0YXRlKGdldERvY3VtZW50KCksIGluamVjdChBUFBfSUQpKTtcbiAgfVxuXG4gIHJldHVybiB0cmFuc2ZlclN0YXRlO1xufVxuXG4vKipcbiAqIEEga2V5IHZhbHVlIHN0b3JlIHRoYXQgaXMgdHJhbnNmZXJyZWQgZnJvbSB0aGUgYXBwbGljYXRpb24gb24gdGhlIHNlcnZlciBzaWRlIHRvIHRoZSBhcHBsaWNhdGlvblxuICogb24gdGhlIGNsaWVudCBzaWRlLlxuICpcbiAqIFRoZSBgVHJhbnNmZXJTdGF0ZWAgaXMgYXZhaWxhYmxlIGFzIGFuIGluamVjdGFibGUgdG9rZW4uXG4gKiBPbiB0aGUgY2xpZW50LCBqdXN0IGluamVjdCB0aGlzIHRva2VuIHVzaW5nIERJIGFuZCB1c2UgaXQsIGl0IHdpbGwgYmUgbGF6aWx5IGluaXRpYWxpemVkLlxuICogT24gdGhlIHNlcnZlciBpdCdzIGFscmVhZHkgaW5jbHVkZWQgaWYgYHJlbmRlckFwcGxpY2F0aW9uYCBmdW5jdGlvbiBpcyB1c2VkLiBPdGhlcndpc2UsIGltcG9ydFxuICogdGhlIGBTZXJ2ZXJUcmFuc2ZlclN0YXRlTW9kdWxlYCBtb2R1bGUgdG8gbWFrZSB0aGUgYFRyYW5zZmVyU3RhdGVgIGF2YWlsYWJsZS5cbiAqXG4gKiBUaGUgdmFsdWVzIGluIHRoZSBzdG9yZSBhcmUgc2VyaWFsaXplZC9kZXNlcmlhbGl6ZWQgdXNpbmcgSlNPTi5zdHJpbmdpZnkvSlNPTi5wYXJzZS4gU28gb25seVxuICogYm9vbGVhbiwgbnVtYmVyLCBzdHJpbmcsIG51bGwgYW5kIG5vbi1jbGFzcyBvYmplY3RzIHdpbGwgYmUgc2VyaWFsaXplZCBhbmQgZGVzZXJpYWxpemVkIGluIGFcbiAqIG5vbi1sb3NzeSBtYW5uZXIuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgVHJhbnNmZXJTdGF0ZSB7XG4gIC8qKiBAbm9jb2xsYXBzZSAqL1xuICBzdGF0aWMgybVwcm92ID0gLyoqIEBwdXJlT3JCcmVha015Q29kZSAqLyDJtcm1ZGVmaW5lSW5qZWN0YWJsZSh7XG4gICAgdG9rZW46IFRyYW5zZmVyU3RhdGUsXG4gICAgcHJvdmlkZWRJbjogJ3Jvb3QnLFxuICAgIGZhY3Rvcnk6IGluaXRUcmFuc2ZlclN0YXRlLFxuICB9KTtcblxuICAvKiogQGludGVybmFsICovXG4gIHN0b3JlOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duIHwgdW5kZWZpbmVkPiA9IHt9O1xuXG4gIHByaXZhdGUgb25TZXJpYWxpemVDYWxsYmFja3M6IHtbazogc3RyaW5nXTogKCkgPT4gdW5rbm93biB8IHVuZGVmaW5lZH0gPSB7fTtcblxuICAvKipcbiAgICogR2V0IHRoZSB2YWx1ZSBjb3JyZXNwb25kaW5nIHRvIGEga2V5LiBSZXR1cm4gYGRlZmF1bHRWYWx1ZWAgaWYga2V5IGlzIG5vdCBmb3VuZC5cbiAgICovXG4gIGdldDxUPihrZXk6IFN0YXRlS2V5PFQ+LCBkZWZhdWx0VmFsdWU6IFQpOiBUIHtcbiAgICByZXR1cm4gdGhpcy5zdG9yZVtrZXldICE9PSB1bmRlZmluZWQgPyAodGhpcy5zdG9yZVtrZXldIGFzIFQpIDogZGVmYXVsdFZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgdmFsdWUgY29ycmVzcG9uZGluZyB0byBhIGtleS5cbiAgICovXG4gIHNldDxUPihrZXk6IFN0YXRlS2V5PFQ+LCB2YWx1ZTogVCk6IHZvaWQge1xuICAgIHRoaXMuc3RvcmVba2V5XSA9IHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhIGtleSBmcm9tIHRoZSBzdG9yZS5cbiAgICovXG4gIHJlbW92ZTxUPihrZXk6IFN0YXRlS2V5PFQ+KTogdm9pZCB7XG4gICAgZGVsZXRlIHRoaXMuc3RvcmVba2V5XTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUZXN0IHdoZXRoZXIgYSBrZXkgZXhpc3RzIGluIHRoZSBzdG9yZS5cbiAgICovXG4gIGhhc0tleTxUPihrZXk6IFN0YXRlS2V5PFQ+KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuc3RvcmUuaGFzT3duUHJvcGVydHkoa2V5KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbmRpY2F0ZXMgd2hldGhlciB0aGUgc3RhdGUgaXMgZW1wdHkuXG4gICAqL1xuICBnZXQgaXNFbXB0eSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5zdG9yZSkubGVuZ3RoID09PSAwO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIGEgY2FsbGJhY2sgdG8gcHJvdmlkZSB0aGUgdmFsdWUgZm9yIGEga2V5IHdoZW4gYHRvSnNvbmAgaXMgY2FsbGVkLlxuICAgKi9cbiAgb25TZXJpYWxpemU8VD4oa2V5OiBTdGF0ZUtleTxUPiwgY2FsbGJhY2s6ICgpID0+IFQpOiB2b2lkIHtcbiAgICB0aGlzLm9uU2VyaWFsaXplQ2FsbGJhY2tzW2tleV0gPSBjYWxsYmFjaztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXJpYWxpemUgdGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIHN0b3JlIHRvIEpTT04uXG4gICAqL1xuICB0b0pzb24oKTogc3RyaW5nIHtcbiAgICAvLyBDYWxsIHRoZSBvblNlcmlhbGl6ZSBjYWxsYmFja3MgYW5kIHB1dCB0aG9zZSB2YWx1ZXMgaW50byB0aGUgc3RvcmUuXG4gICAgZm9yIChjb25zdCBrZXkgaW4gdGhpcy5vblNlcmlhbGl6ZUNhbGxiYWNrcykge1xuICAgICAgaWYgKHRoaXMub25TZXJpYWxpemVDYWxsYmFja3MuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHRoaXMuc3RvcmVba2V5XSA9IHRoaXMub25TZXJpYWxpemVDYWxsYmFja3Nba2V5XSgpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKCdFeGNlcHRpb24gaW4gb25TZXJpYWxpemUgY2FsbGJhY2s6ICcsIGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRXNjYXBlIHNjcmlwdCB0YWcgdG8gYXZvaWQgYnJlYWsgb3V0IG9mIDxzY3JpcHQ+IHRhZyBpbiBzZXJpYWxpemVkIG91dHB1dC5cbiAgICAvLyBFbmNvZGluZyBvZiBgPGAgaXMgdGhlIHNhbWUgYmVoYXZpb3VyIGFzIEczIHNjcmlwdF9idWlsZGVycy5cbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcy5zdG9yZSkucmVwbGFjZSgvPC9nLCAnXFxcXHUwMDNDJyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcmV0cmlldmVUcmFuc2ZlcnJlZFN0YXRlKFxuICBkb2M6IERvY3VtZW50LFxuICBhcHBJZDogc3RyaW5nLFxuKTogUmVjb3JkPHN0cmluZywgdW5rbm93biB8IHVuZGVmaW5lZD4ge1xuICAvLyBMb2NhdGUgdGhlIHNjcmlwdCB0YWcgd2l0aCB0aGUgSlNPTiBkYXRhIHRyYW5zZmVycmVkIGZyb20gdGhlIHNlcnZlci5cbiAgLy8gVGhlIGlkIG9mIHRoZSBzY3JpcHQgdGFnIGlzIHNldCB0byB0aGUgQW5ndWxhciBhcHBJZCArICdzdGF0ZScuXG4gIGNvbnN0IHNjcmlwdCA9IGRvYy5nZXRFbGVtZW50QnlJZChhcHBJZCArICctc3RhdGUnKTtcbiAgaWYgKHNjcmlwdD8udGV4dENvbnRlbnQpIHtcbiAgICB0cnkge1xuICAgICAgLy8gQXZvaWQgdXNpbmcgYW55IGhlcmUgYXMgaXQgdHJpZ2dlcnMgbGludCBlcnJvcnMgaW4gZ29vZ2xlMyAoYW55IGlzIG5vdCBhbGxvd2VkKS5cbiAgICAgIC8vIERlY29kaW5nIG9mIGA8YCBpcyBkb25lIG9mIHRoZSBib3ggYnkgYnJvd3NlcnMgYW5kIG5vZGUuanMsIHNhbWUgYmVoYXZpb3VyIGFzIEczXG4gICAgICAvLyBzY3JpcHRfYnVpbGRlcnMuXG4gICAgICByZXR1cm4gSlNPTi5wYXJzZShzY3JpcHQudGV4dENvbnRlbnQpIGFzIHt9O1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUud2FybignRXhjZXB0aW9uIHdoaWxlIHJlc3RvcmluZyBUcmFuc2ZlclN0YXRlIGZvciBhcHAgJyArIGFwcElkLCBlKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4ge307XG59XG4iXX0=