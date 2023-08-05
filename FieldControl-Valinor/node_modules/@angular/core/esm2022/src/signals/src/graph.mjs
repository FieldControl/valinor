/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// Required as the signals library is in a separate package, so we need to explicitly ensure the
// global `ngDevMode` type is defined.
import '../../util/ng_dev_mode';
import { newWeakRef } from './weak_ref';
/**
 * Counter tracking the next `ProducerId` or `ConsumerId`.
 */
let _nextReactiveId = 0;
/**
 * Tracks the currently active reactive consumer (or `null` if there is no active
 * consumer).
 */
let activeConsumer = null;
/**
 * Whether the graph is currently propagating change notifications.
 */
let inNotificationPhase = false;
export function setActiveConsumer(consumer) {
    const prev = activeConsumer;
    activeConsumer = consumer;
    return prev;
}
/**
 * A node in the reactive graph.
 *
 * Nodes can be producers of reactive values, consumers of other reactive values, or both.
 *
 * Producers are nodes that produce values, and can be depended upon by consumer nodes.
 *
 * Producers expose a monotonic `valueVersion` counter, and are responsible for incrementing this
 * version when their value semantically changes. Some producers may produce their values lazily and
 * thus at times need to be polled for potential updates to their value (and by extension their
 * `valueVersion`). This is accomplished via the `onProducerUpdateValueVersion` method for
 * implemented by producers, which should perform whatever calculations are necessary to ensure
 * `valueVersion` is up to date.
 *
 * Consumers are nodes that depend on the values of producers and are notified when those values
 * might have changed.
 *
 * Consumers do not wrap the reads they consume themselves, but rather can be set as the active
 * reader via `setActiveConsumer`. Reads of producers that happen while a consumer is active will
 * result in those producers being added as dependencies of that consumer node.
 *
 * The set of dependencies of a consumer is dynamic. Implementers expose a monotonically increasing
 * `trackingVersion` counter, which increments whenever the consumer is about to re-run any reactive
 * reads it needs and establish a new set of dependencies as a result.
 *
 * Producers store the last `trackingVersion` they've seen from `Consumer`s which have read them.
 * This allows a producer to identify whether its record of the dependency is current or stale, by
 * comparing the consumer's `trackingVersion` to the version at which the dependency was
 * last observed.
 */
export class ReactiveNode {
    constructor() {
        this.id = _nextReactiveId++;
        /**
         * A cached weak reference to this node, which will be used in `ReactiveEdge`s.
         */
        this.ref = newWeakRef(this);
        /**
         * Edges to producers on which this node depends (in its consumer capacity).
         */
        this.producers = new Map();
        /**
         * Edges to consumers on which this node depends (in its producer capacity).
         */
        this.consumers = new Map();
        /**
         * Monotonically increasing counter representing a version of this `Consumer`'s
         * dependencies.
         */
        this.trackingVersion = 0;
        /**
         * Monotonically increasing counter which increases when the value of this `Producer`
         * semantically changes.
         */
        this.valueVersion = 0;
    }
    /**
     * Polls dependencies of a consumer to determine if they have actually changed.
     *
     * If this returns `false`, then even though the consumer may have previously been notified of a
     * change, the values of its dependencies have not actually changed and the consumer should not
     * rerun any reactions.
     */
    consumerPollProducersForChange() {
        for (const [producerId, edge] of this.producers) {
            const producer = edge.producerNode.deref();
            // On Safari < 16.1 deref can return null, we need to check for null also.
            // See https://github.com/WebKit/WebKit/commit/44c15ba58912faab38b534fef909dd9e13e095e0
            if (producer == null || edge.atTrackingVersion !== this.trackingVersion) {
                // This dependency edge is stale, so remove it.
                this.producers.delete(producerId);
                producer?.consumers.delete(this.id);
                continue;
            }
            if (producer.producerPollStatus(edge.seenValueVersion)) {
                // One of the dependencies reports a real value change.
                return true;
            }
        }
        // No dependency reported a real value change, so the `Consumer` has also not been
        // impacted.
        return false;
    }
    /**
     * Notify all consumers of this producer that its value may have changed.
     */
    producerMayHaveChanged() {
        // Prevent signal reads when we're updating the graph
        const prev = inNotificationPhase;
        inNotificationPhase = true;
        try {
            for (const [consumerId, edge] of this.consumers) {
                const consumer = edge.consumerNode.deref();
                // On Safari < 16.1 deref can return null, we need to check for null also.
                // See https://github.com/WebKit/WebKit/commit/44c15ba58912faab38b534fef909dd9e13e095e0
                if (consumer == null || consumer.trackingVersion !== edge.atTrackingVersion) {
                    this.consumers.delete(consumerId);
                    consumer?.producers.delete(this.id);
                    continue;
                }
                consumer.onConsumerDependencyMayHaveChanged();
            }
        }
        finally {
            inNotificationPhase = prev;
        }
    }
    /**
     * Mark that this producer node has been accessed in the current reactive context.
     */
    producerAccessed() {
        if (inNotificationPhase) {
            throw new Error(typeof ngDevMode !== 'undefined' && ngDevMode ?
                `Assertion error: signal read during notification phase` :
                '');
        }
        if (activeConsumer === null) {
            return;
        }
        // Either create or update the dependency `Edge` in both directions.
        let edge = activeConsumer.producers.get(this.id);
        if (edge === undefined) {
            edge = {
                consumerNode: activeConsumer.ref,
                producerNode: this.ref,
                seenValueVersion: this.valueVersion,
                atTrackingVersion: activeConsumer.trackingVersion,
            };
            activeConsumer.producers.set(this.id, edge);
            this.consumers.set(activeConsumer.id, edge);
        }
        else {
            edge.seenValueVersion = this.valueVersion;
            edge.atTrackingVersion = activeConsumer.trackingVersion;
        }
    }
    /**
     * Whether this consumer currently has any producers registered.
     */
    get hasProducers() {
        return this.producers.size > 0;
    }
    /**
     * Whether this `ReactiveNode` in its producer capacity is currently allowed to initiate updates,
     * based on the current consumer context.
     */
    get producerUpdatesAllowed() {
        return activeConsumer?.consumerAllowSignalWrites !== false;
    }
    /**
     * Checks if a `Producer` has a current value which is different than the value
     * last seen at a specific version by a `Consumer` which recorded a dependency on
     * this `Producer`.
     */
    producerPollStatus(lastSeenValueVersion) {
        // `producer.valueVersion` may be stale, but a mismatch still means that the value
        // last seen by the `Consumer` is also stale.
        if (this.valueVersion !== lastSeenValueVersion) {
            return true;
        }
        // Trigger the `Producer` to update its `valueVersion` if necessary.
        this.onProducerUpdateValueVersion();
        // At this point, we can trust `producer.valueVersion`.
        return this.valueVersion !== lastSeenValueVersion;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JhcGguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9zaWduYWxzL3NyYy9ncmFwaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxnR0FBZ0c7QUFDaEcsc0NBQXNDO0FBQ3RDLE9BQU8sd0JBQXdCLENBQUM7QUFFaEMsT0FBTyxFQUFDLFVBQVUsRUFBVSxNQUFNLFlBQVksQ0FBQztBQUUvQzs7R0FFRztBQUNILElBQUksZUFBZSxHQUFXLENBQUMsQ0FBQztBQUVoQzs7O0dBR0c7QUFDSCxJQUFJLGNBQWMsR0FBc0IsSUFBSSxDQUFDO0FBRTdDOztHQUVHO0FBQ0gsSUFBSSxtQkFBbUIsR0FBRyxLQUFLLENBQUM7QUFFaEMsTUFBTSxVQUFVLGlCQUFpQixDQUFDLFFBQTJCO0lBQzNELE1BQU0sSUFBSSxHQUFHLGNBQWMsQ0FBQztJQUM1QixjQUFjLEdBQUcsUUFBUSxDQUFDO0lBQzFCLE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQTZCRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E2Qkc7QUFDSCxNQUFNLE9BQWdCLFlBQVk7SUFBbEM7UUFDbUIsT0FBRSxHQUFHLGVBQWUsRUFBRSxDQUFDO1FBRXhDOztXQUVHO1FBQ2MsUUFBRyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUV4Qzs7V0FFRztRQUNjLGNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBd0IsQ0FBQztRQUU3RDs7V0FFRztRQUNjLGNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBd0IsQ0FBQztRQUU3RDs7O1dBR0c7UUFDTyxvQkFBZSxHQUFHLENBQUMsQ0FBQztRQUU5Qjs7O1dBR0c7UUFDTyxpQkFBWSxHQUFHLENBQUMsQ0FBQztJQTZJN0IsQ0FBQztJQTFIQzs7Ozs7O09BTUc7SUFDTyw4QkFBOEI7UUFDdEMsS0FBSyxNQUFNLENBQUMsVUFBVSxFQUFFLElB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RDs7T0FFRztJQUNILElBQWMsWUFBWTtRQUN4QixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsSUFBYyxzQkFBc0I7UUFDbEMsT0FBTyxjQUFjLEVBQUUseUJBQXlCLEtBQUssS0FBSyxDQUFDO0lBQzdELENBQUM7SUFFRDs7OztPQUlHO0lBQ0ssa0JBQWtCLENBQUMsb0JBQTRCO1FBQ3JELGtGQUFrRjtRQUNsRiw2Q0FBNkM7UUFDN0MsSUFBSSxJQUFJLENBQUMsWUFBWSxLQUFLLG9CQUFvQixFQUFFO1lBQzlDLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFFRCxvRUFBb0U7UUFDcEUsSUFBSSxDQUFDLDRCQUE0QixFQUFFLENBQUM7UUFFcEMsdURBQXVEO1FBQ3ZELE9BQU8sSUFBSSxDQUFDLFlBQVksS0FBSyxvQkFBb0IsQ0FBQztJQUNwRCxDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLy8gUmVxdWlyZWQgYXMgdGhlIHNpZ25hbHMgbGlicmFyeSBpcyBpbiBhIHNlcGFyYXRlIHBhY2thZ2UsIHNvIHdlIG5lZWQgdG8gZXhwbGljaXRseSBlbnN1cmUgdGhlXG4vLyBnbG9iYWwgYG5nRGV2TW9kZWAgdHlwZSBpcyBkZWZpbmVkLlxuaW1wb3J0ICcuLi8uLi91dGlsL25nX2Rldl9tb2RlJztcblxuaW1wb3J0IHtuZXdXZWFrUmVmLCBXZWFrUmVmfSBmcm9tICcuL3dlYWtfcmVmJztcblxuLyoqXG4gKiBDb3VudGVyIHRyYWNraW5nIHRoZSBuZXh0IGBQcm9kdWNlcklkYCBvciBgQ29uc3VtZXJJZGAuXG4gKi9cbmxldCBfbmV4dFJlYWN0aXZlSWQ6IG51bWJlciA9IDA7XG5cbi8qKlxuICogVHJhY2tzIHRoZSBjdXJyZW50bHkgYWN0aXZlIHJlYWN0aXZlIGNvbnN1bWVyIChvciBgbnVsbGAgaWYgdGhlcmUgaXMgbm8gYWN0aXZlXG4gKiBjb25zdW1lcikuXG4gKi9cbmxldCBhY3RpdmVDb25zdW1lcjogUmVhY3RpdmVOb2RlfG51bGwgPSBudWxsO1xuXG4vKipcbiAqIFdoZXRoZXIgdGhlIGdyYXBoIGlzIGN1cnJlbnRseSBwcm9wYWdhdGluZyBjaGFuZ2Ugbm90aWZpY2F0aW9ucy5cbiAqL1xubGV0IGluTm90aWZpY2F0aW9uUGhhc2UgPSBmYWxzZTtcblxuZXhwb3J0IGZ1bmN0aW9uIHNldEFjdGl2ZUNvbnN1bWVyKGNvbnN1bWVyOiBSZWFjdGl2ZU5vZGV8bnVsbCk6IFJlYWN0aXZlTm9kZXxudWxsIHtcbiAgY29uc3QgcHJldiA9IGFjdGl2ZUNvbnN1bWVyO1xuICBhY3RpdmVDb25zdW1lciA9IGNvbnN1bWVyO1xuICByZXR1cm4gcHJldjtcbn1cblxuLyoqXG4gKiBBIGJpZGlyZWN0aW9uYWwgZWRnZSBpbiB0aGUgZGVwZW5kZW5jeSBncmFwaCBvZiBgUmVhY3RpdmVOb2RlYHMuXG4gKi9cbmludGVyZmFjZSBSZWFjdGl2ZUVkZ2Uge1xuICAvKipcbiAgICogV2Vha2x5IGhlbGQgcmVmZXJlbmNlIHRvIHRoZSBjb25zdW1lciBzaWRlIG9mIHRoaXMgZWRnZS5cbiAgICovXG4gIHJlYWRvbmx5IHByb2R1Y2VyTm9kZTogV2Vha1JlZjxSZWFjdGl2ZU5vZGU+O1xuXG4gIC8qKlxuICAgKiBXZWFrbHkgaGVsZCByZWZlcmVuY2UgdG8gdGhlIHByb2R1Y2VyIHNpZGUgb2YgdGhpcyBlZGdlLlxuICAgKi9cbiAgcmVhZG9ubHkgY29uc3VtZXJOb2RlOiBXZWFrUmVmPFJlYWN0aXZlTm9kZT47XG4gIC8qKlxuICAgKiBgdHJhY2tpbmdWZXJzaW9uYCBvZiB0aGUgY29uc3VtZXIgYXQgd2hpY2ggdGhpcyBkZXBlbmRlbmN5IGVkZ2Ugd2FzIGxhc3Qgb2JzZXJ2ZWQuXG4gICAqXG4gICAqIElmIHRoaXMgZG9lc24ndCBtYXRjaCB0aGUgY29uc3VtZXIncyBjdXJyZW50IGB0cmFja2luZ1ZlcnNpb25gLCB0aGVuIHRoaXMgZGVwZW5kZW5jeSByZWNvcmRcbiAgICogaXMgc3RhbGUsIGFuZCBuZWVkcyB0byBiZSBjbGVhbmVkIHVwLlxuICAgKi9cbiAgYXRUcmFja2luZ1ZlcnNpb246IG51bWJlcjtcblxuICAvKipcbiAgICogYHZhbHVlVmVyc2lvbmAgb2YgdGhlIHByb2R1Y2VyIGF0IHRoZSB0aW1lIHRoaXMgZGVwZW5kZW5jeSB3YXMgbGFzdCBhY2Nlc3NlZC5cbiAgICovXG4gIHNlZW5WYWx1ZVZlcnNpb246IG51bWJlcjtcbn1cblxuLyoqXG4gKiBBIG5vZGUgaW4gdGhlIHJlYWN0aXZlIGdyYXBoLlxuICpcbiAqIE5vZGVzIGNhbiBiZSBwcm9kdWNlcnMgb2YgcmVhY3RpdmUgdmFsdWVzLCBjb25zdW1lcnMgb2Ygb3RoZXIgcmVhY3RpdmUgdmFsdWVzLCBvciBib3RoLlxuICpcbiAqIFByb2R1Y2VycyBhcmUgbm9kZXMgdGhhdCBwcm9kdWNlIHZhbHVlcywgYW5kIGNhbiBiZSBkZXBlbmRlZCB1cG9uIGJ5IGNvbnN1bWVyIG5vZGVzLlxuICpcbiAqIFByb2R1Y2VycyBleHBvc2UgYSBtb25vdG9uaWMgYHZhbHVlVmVyc2lvbmAgY291bnRlciwgYW5kIGFyZSByZXNwb25zaWJsZSBmb3IgaW5jcmVtZW50aW5nIHRoaXNcbiAqIHZlcnNpb24gd2hlbiB0aGVpciB2YWx1ZSBzZW1hbnRpY2FsbHkgY2hhbmdlcy4gU29tZSBwcm9kdWNlcnMgbWF5IHByb2R1Y2UgdGhlaXIgdmFsdWVzIGxhemlseSBhbmRcbiAqIHRodXMgYXQgdGltZXMgbmVlZCB0byBiZSBwb2xsZWQgZm9yIHBvdGVudGlhbCB1cGRhdGVzIHRvIHRoZWlyIHZhbHVlIChhbmQgYnkgZXh0ZW5zaW9uIHRoZWlyXG4gKiBgdmFsdWVWZXJzaW9uYCkuIFRoaXMgaXMgYWNjb21wbGlzaGVkIHZpYSB0aGUgYG9uUHJvZHVjZXJVcGRhdGVWYWx1ZVZlcnNpb25gIG1ldGhvZCBmb3JcbiAqIGltcGxlbWVudGVkIGJ5IHByb2R1Y2Vycywgd2hpY2ggc2hvdWxkIHBlcmZvcm0gd2hhdGV2ZXIgY2FsY3VsYXRpb25zIGFyZSBuZWNlc3NhcnkgdG8gZW5zdXJlXG4gKiBgdmFsdWVWZXJzaW9uYCBpcyB1cCB0byBkYXRlLlxuICpcbiAqIENvbnN1bWVycyBhcmUgbm9kZXMgdGhhdCBkZXBlbmQgb24gdGhlIHZhbHVlcyBvZiBwcm9kdWNlcnMgYW5kIGFyZSBub3RpZmllZCB3aGVuIHRob3NlIHZhbHVlc1xuICogbWlnaHQgaGF2ZSBjaGFuZ2VkLlxuICpcbiAqIENvbnN1bWVycyBkbyBub3Qgd3JhcCB0aGUgcmVhZHMgdGhleSBjb25zdW1lIHRoZW1zZWx2ZXMsIGJ1dCByYXRoZXIgY2FuIGJlIHNldCBhcyB0aGUgYWN0aXZlXG4gKiByZWFkZXIgdmlhIGBzZXRBY3RpdmVDb25zdW1lcmAuIFJlYWRzIG9mIHByb2R1Y2VycyB0aGF0IGhhcHBlbiB3aGlsZSBhIGNvbnN1bWVyIGlzIGFjdGl2ZSB3aWxsXG4gKiByZXN1bHQgaW4gdGhvc2UgcHJvZHVjZXJzIGJlaW5nIGFkZGVkIGFzIGRlcGVuZGVuY2llcyBvZiB0aGF0IGNvbnN1bWVyIG5vZGUuXG4gKlxuICogVGhlIHNldCBvZiBkZXBlbmRlbmNpZXMgb2YgYSBjb25zdW1lciBpcyBkeW5hbWljLiBJbXBsZW1lbnRlcnMgZXhwb3NlIGEgbW9ub3RvbmljYWxseSBpbmNyZWFzaW5nXG4gKiBgdHJhY2tpbmdWZXJzaW9uYCBjb3VudGVyLCB3aGljaCBpbmNyZW1lbnRzIHdoZW5ldmVyIHRoZSBjb25zdW1lciBpcyBhYm91dCB0byByZS1ydW4gYW55IHJlYWN0aXZlXG4gKiByZWFkcyBpdCBuZWVkcyBhbmQgZXN0YWJsaXNoIGEgbmV3IHNldCBvZiBkZXBlbmRlbmNpZXMgYXMgYSByZXN1bHQuXG4gKlxuICogUHJvZHVjZXJzIHN0b3JlIHRoZSBsYXN0IGB0cmFja2luZ1ZlcnNpb25gIHRoZXkndmUgc2VlbiBmcm9tIGBDb25zdW1lcmBzIHdoaWNoIGhhdmUgcmVhZCB0aGVtLlxuICogVGhpcyBhbGxvd3MgYSBwcm9kdWNlciB0byBpZGVudGlmeSB3aGV0aGVyIGl0cyByZWNvcmQgb2YgdGhlIGRlcGVuZGVuY3kgaXMgY3VycmVudCBvciBzdGFsZSwgYnlcbiAqIGNvbXBhcmluZyB0aGUgY29uc3VtZXIncyBgdHJhY2tpbmdWZXJzaW9uYCB0byB0aGUgdmVyc2lvbiBhdCB3aGljaCB0aGUgZGVwZW5kZW5jeSB3YXNcbiAqIGxhc3Qgb2JzZXJ2ZWQuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBSZWFjdGl2ZU5vZGUge1xuICBwcml2YXRlIHJlYWRvbmx5IGlkID0gX25leHRSZWFjdGl2ZUlkKys7XG5cbiAgLyoqXG4gICAqIEEgY2FjaGVkIHdlYWsgcmVmZXJlbmNlIHRvIHRoaXMgbm9kZSwgd2hpY2ggd2lsbCBiZSB1c2VkIGluIGBSZWFjdGl2ZUVkZ2Vgcy5cbiAgICovXG4gIHByaXZhdGUgcmVhZG9ubHkgcmVmID0gbmV3V2Vha1JlZih0aGlzKTtcblxuICAvKipcbiAgICogRWRnZXMgdG8gcHJvZHVjZXJzIG9uIHdoaWNoIHRoaXMgbm9kZSBkZXBlbmRzIChpbiBpdHMgY29uc3VtZXIgY2FwYWNpdHkpLlxuICAgKi9cbiAgcHJpdmF0ZSByZWFkb25seSBwcm9kdWNlcnMgPSBuZXcgTWFwPG51bWJlciwgUmVhY3RpdmVFZGdlPigpO1xuXG4gIC8qKlxuICAgKiBFZGdlcyB0byBjb25zdW1lcnMgb24gd2hpY2ggdGhpcyBub2RlIGRlcGVuZHMgKGluIGl0cyBwcm9kdWNlciBjYXBhY2l0eSkuXG4gICAqL1xuICBwcml2YXRlIHJlYWRvbmx5IGNvbnN1bWVycyA9IG5ldyBNYXA8bnVtYmVyLCBSZWFjdGl2ZUVkZ2U+KCk7XG5cbiAgLyoqXG4gICAqIE1vbm90b25pY2FsbHkgaW5jcmVhc2luZyBjb3VudGVyIHJlcHJlc2VudGluZyBhIHZlcnNpb24gb2YgdGhpcyBgQ29uc3VtZXJgJ3NcbiAgICogZGVwZW5kZW5jaWVzLlxuICAgKi9cbiAgcHJvdGVjdGVkIHRyYWNraW5nVmVyc2lvbiA9IDA7XG5cbiAgLyoqXG4gICAqIE1vbm90b25pY2FsbHkgaW5jcmVhc2luZyBjb3VudGVyIHdoaWNoIGluY3JlYXNlcyB3aGVuIHRoZSB2YWx1ZSBvZiB0aGlzIGBQcm9kdWNlcmBcbiAgICogc2VtYW50aWNhbGx5IGNoYW5nZXMuXG4gICAqL1xuICBwcm90ZWN0ZWQgdmFsdWVWZXJzaW9uID0gMDtcblxuICAvKipcbiAgICogV2hldGhlciBzaWduYWwgd3JpdGVzIHNob3VsZCBiZSBhbGxvd2VkIHdoaWxlIHRoaXMgYFJlYWN0aXZlTm9kZWAgaXMgdGhlIGN1cnJlbnQgY29uc3VtZXIuXG4gICAqL1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgY29uc3VtZXJBbGxvd1NpZ25hbFdyaXRlczogYm9vbGVhbjtcblxuICAvKipcbiAgICogQ2FsbGVkIGZvciBjb25zdW1lcnMgd2hlbmV2ZXIgb25lIG9mIHRoZWlyIGRlcGVuZGVuY2llcyBub3RpZmllcyB0aGF0IGl0IG1pZ2h0IGhhdmUgYSBuZXdcbiAgICogdmFsdWUuXG4gICAqL1xuICBwcm90ZWN0ZWQgYWJzdHJhY3Qgb25Db25zdW1lckRlcGVuZGVuY3lNYXlIYXZlQ2hhbmdlZCgpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgZm9yIHByb2R1Y2VycyB3aGVuIGEgZGVwZW5kZW50IGNvbnN1bWVyIGlzIGNoZWNraW5nIGlmIHRoZSBwcm9kdWNlcidzIHZhbHVlIGhhcyBhY3R1YWxseVxuICAgKiBjaGFuZ2VkLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFic3RyYWN0IG9uUHJvZHVjZXJVcGRhdGVWYWx1ZVZlcnNpb24oKTogdm9pZDtcblxuICAvKipcbiAgICogUG9sbHMgZGVwZW5kZW5jaWVzIG9mIGEgY29uc3VtZXIgdG8gZGV0ZXJtaW5lIGlmIHRoZXkgaGF2ZSBhY3R1YWxseSBjaGFuZ2VkLlxuICAgKlxuICAgKiBJZiB0aGlzIHJldHVybnMgYGZhbHNlYCwgdGhlbiBldmVuIHRob3VnaCB0aGUgY29uc3VtZXIgbWF5IGhhdmUgcHJldmlvdXNseSBiZWVuIG5vdGlmaWVkIG9mIGFcbiAgICogY2hhbmdlLCB0aGUgdmFsdWVzIG9mIGl0cyBkZXBlbmRlbmNpZXMgaGF2ZSBub3QgYWN0dWFsbHkgY2hhbmdlZCBhbmQgdGhlIGNvbnN1bWVyIHNob3VsZCBub3RcbiAgICogcmVydW4gYW55IHJlYWN0aW9ucy5cbiAgICovXG4gIHByb3RlY3RlZCBjb25zdW1lclBvbGxQcm9kdWNlcnNGb3JDaGFuZ2UoKTogYm9vbGVhbiB7XG4gICAgZm9yIChjb25zdCBbcHJvZHVjZXJJZCwgZWRnZV0gb2YgdGhpcy5wcm9kdWNlcnMpIHtcbiAgICAgIGNvbnN0IHByb2R1Y2VyID0gZWRnZS5wcm9kdWNlck5vZGUuZGVyZWYoKTtcblxuICAgICAgLy8gT24gU2FmYXJpIDwgMTYuMSBkZXJlZiBjYW4gcmV0dXJuIG51bGwsIHdlIG5lZWQgdG8gY2hlY2sgZm9yIG51bGwgYWxzby5cbiAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vV2ViS2l0L1dlYktpdC9jb21taXQvNDRjMTViYTU4OTEyZmFhYjM4YjUzNGZlZjkwOWRkOWUxM2UwOTVlMFxuICAgICAgaWYgKHByb2R1Y2VyID09IG51bGwgfHwgZWRnZS5hdFRyYWNraW5nVmVyc2lvbiAhPT0gdGhpcy50cmFja2luZ1ZlcnNpb24pIHtcbiAgICAgICAgLy8gVGhpcyBkZXBlbmRlbmN5IGVkZ2UgaXMgc3RhbGUsIHNvIHJlbW92ZSBpdC5cbiAgICAgICAgdGhpcy5wcm9kdWNlcnMuZGVsZXRlKHByb2R1Y2VySWQpO1xuICAgICAgICBwcm9kdWNlcj8uY29uc3VtZXJzLmRlbGV0ZSh0aGlzLmlkKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChwcm9kdWNlci5wcm9kdWNlclBvbGxTdGF0dXMoZWRnZS5zZWVuVmFsdWVWZXJzaW9uKSkge1xuICAgICAgICAvLyBPbmUgb2YgdGhlIGRlcGVuZGVuY2llcyByZXBvcnRzIGEgcmVhbCB2YWx1ZSBjaGFuZ2UuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIE5vIGRlcGVuZGVuY3kgcmVwb3J0ZWQgYSByZWFsIHZhbHVlIGNoYW5nZSwgc28gdGhlIGBDb25zdW1lcmAgaGFzIGFsc28gbm90IGJlZW5cbiAgICAvLyBpbXBhY3RlZC5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogTm90aWZ5IGFsbCBjb25zdW1lcnMgb2YgdGhpcyBwcm9kdWNlciB0aGF0IGl0cyB2YWx1ZSBtYXkgaGF2ZSBjaGFuZ2VkLlxuICAgKi9cbiAgcHJvdGVjdGVkIHByb2R1Y2VyTWF5SGF2ZUNoYW5nZWQoKTogdm9pZCB7XG4gICAgLy8gUHJldmVudCBzaWduYWwgcmVhZHMgd2hlbiB3ZSdyZSB1cGRhdGluZyB0aGUgZ3JhcGhcbiAgICBjb25zdCBwcmV2ID0gaW5Ob3RpZmljYXRpb25QaGFzZTtcbiAgICBpbk5vdGlmaWNhdGlvblBoYXNlID0gdHJ1ZTtcbiAgICB0cnkge1xuICAgICAgZm9yIChjb25zdCBbY29uc3VtZXJJZCwgZWRnZV0gb2YgdGhpcy5jb25zdW1lcnMpIHtcbiAgICAgICAgY29uc3QgY29uc3VtZXIgPSBlZGdlLmNvbnN1bWVyTm9kZS5kZXJlZigpO1xuXG4gICAgICAgIC8vIE9uIFNhZmFyaSA8IDE2LjEgZGVyZWYgY2FuIHJldHVybiBudWxsLCB3ZSBuZWVkIHRvIGNoZWNrIGZvciBudWxsIGFsc28uXG4gICAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vV2ViS2l0L1dlYktpdC9jb21taXQvNDRjMTViYTU4OTEyZmFhYjM4YjUzNGZlZjkwOWRkOWUxM2UwOTVlMFxuICAgICAgICBpZiAoY29uc3VtZXIgPT0gbnVsbCB8fCBjb25zdW1lci50cmFja2luZ1ZlcnNpb24gIT09IGVkZ2UuYXRUcmFja2luZ1ZlcnNpb24pIHtcbiAgICAgICAgICB0aGlzLmNvbnN1bWVycy5kZWxldGUoY29uc3VtZXJJZCk7XG4gICAgICAgICAgY29uc3VtZXI/LnByb2R1Y2Vycy5kZWxldGUodGhpcy5pZCk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdW1lci5vbkNvbnN1bWVyRGVwZW5kZW5jeU1heUhhdmVDaGFuZ2VkKCk7XG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGluTm90aWZpY2F0aW9uUGhhc2UgPSBwcmV2O1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBNYXJrIHRoYXQgdGhpcyBwcm9kdWNlciBub2RlIGhhcyBiZWVuIGFjY2Vzc2VkIGluIHRoZSBjdXJyZW50IHJlYWN0aXZlIGNvbnRleHQuXG4gICAqL1xuICBwcm90ZWN0ZWQgcHJvZHVjZXJBY2Nlc3NlZCgpOiB2b2lkIHtcbiAgICBpZiAoaW5Ob3RpZmljYXRpb25QaGFzZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIHR5cGVvZiBuZ0Rldk1vZGUgIT09ICd1bmRlZmluZWQnICYmIG5nRGV2TW9kZSA/XG4gICAgICAgICAgICAgIGBBc3NlcnRpb24gZXJyb3I6IHNpZ25hbCByZWFkIGR1cmluZyBub3RpZmljYXRpb24gcGhhc2VgIDpcbiAgICAgICAgICAgICAgJycpO1xuICAgIH1cblxuICAgIGlmIChhY3RpdmVDb25zdW1lciA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIEVpdGhlciBjcmVhdGUgb3IgdXBkYXRlIHRoZSBkZXBlbmRlbmN5IGBFZGdlYCBpbiBib3RoIGRpcmVjdGlvbnMuXG4gICAgbGV0IGVkZ2UgPSBhY3RpdmVDb25zdW1lci5wcm9kdWNlcnMuZ2V0KHRoaXMuaWQpO1xuICAgIGlmIChlZGdlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGVkZ2UgPSB7XG4gICAgICAgIGNvbnN1bWVyTm9kZTogYWN0aXZlQ29uc3VtZXIucmVmLFxuICAgICAgICBwcm9kdWNlck5vZGU6IHRoaXMucmVmLFxuICAgICAgICBzZWVuVmFsdWVWZXJzaW9uOiB0aGlzLnZhbHVlVmVyc2lvbixcbiAgICAgICAgYXRUcmFja2luZ1ZlcnNpb246IGFjdGl2ZUNvbnN1bWVyLnRyYWNraW5nVmVyc2lvbixcbiAgICAgIH07XG4gICAgICBhY3RpdmVDb25zdW1lci5wcm9kdWNlcnMuc2V0KHRoaXMuaWQsIGVkZ2UpO1xuICAgICAgdGhpcy5jb25zdW1lcnMuc2V0KGFjdGl2ZUNvbnN1bWVyLmlkLCBlZGdlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZWRnZS5zZWVuVmFsdWVWZXJzaW9uID0gdGhpcy52YWx1ZVZlcnNpb247XG4gICAgICBlZGdlLmF0VHJhY2tpbmdWZXJzaW9uID0gYWN0aXZlQ29uc3VtZXIudHJhY2tpbmdWZXJzaW9uO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoaXMgY29uc3VtZXIgY3VycmVudGx5IGhhcyBhbnkgcHJvZHVjZXJzIHJlZ2lzdGVyZWQuXG4gICAqL1xuICBwcm90ZWN0ZWQgZ2V0IGhhc1Byb2R1Y2VycygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5wcm9kdWNlcnMuc2l6ZSA+IDA7XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGlzIGBSZWFjdGl2ZU5vZGVgIGluIGl0cyBwcm9kdWNlciBjYXBhY2l0eSBpcyBjdXJyZW50bHkgYWxsb3dlZCB0byBpbml0aWF0ZSB1cGRhdGVzLFxuICAgKiBiYXNlZCBvbiB0aGUgY3VycmVudCBjb25zdW1lciBjb250ZXh0LlxuICAgKi9cbiAgcHJvdGVjdGVkIGdldCBwcm9kdWNlclVwZGF0ZXNBbGxvd2VkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBhY3RpdmVDb25zdW1lcj8uY29uc3VtZXJBbGxvd1NpZ25hbFdyaXRlcyAhPT0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIGEgYFByb2R1Y2VyYCBoYXMgYSBjdXJyZW50IHZhbHVlIHdoaWNoIGlzIGRpZmZlcmVudCB0aGFuIHRoZSB2YWx1ZVxuICAgKiBsYXN0IHNlZW4gYXQgYSBzcGVjaWZpYyB2ZXJzaW9uIGJ5IGEgYENvbnN1bWVyYCB3aGljaCByZWNvcmRlZCBhIGRlcGVuZGVuY3kgb25cbiAgICogdGhpcyBgUHJvZHVjZXJgLlxuICAgKi9cbiAgcHJpdmF0ZSBwcm9kdWNlclBvbGxTdGF0dXMobGFzdFNlZW5WYWx1ZVZlcnNpb246IG51bWJlcik6IGJvb2xlYW4ge1xuICAgIC8vIGBwcm9kdWNlci52YWx1ZVZlcnNpb25gIG1heSBiZSBzdGFsZSwgYnV0IGEgbWlzbWF0Y2ggc3RpbGwgbWVhbnMgdGhhdCB0aGUgdmFsdWVcbiAgICAvLyBsYXN0IHNlZW4gYnkgdGhlIGBDb25zdW1lcmAgaXMgYWxzbyBzdGFsZS5cbiAgICBpZiAodGhpcy52YWx1ZVZlcnNpb24gIT09IGxhc3RTZWVuVmFsdWVWZXJzaW9uKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBUcmlnZ2VyIHRoZSBgUHJvZHVjZXJgIHRvIHVwZGF0ZSBpdHMgYHZhbHVlVmVyc2lvbmAgaWYgbmVjZXNzYXJ5LlxuICAgIHRoaXMub25Qcm9kdWNlclVwZGF0ZVZhbHVlVmVyc2lvbigpO1xuXG4gICAgLy8gQXQgdGhpcyBwb2ludCwgd2UgY2FuIHRydXN0IGBwcm9kdWNlci52YWx1ZVZlcnNpb25gLlxuICAgIHJldHVybiB0aGlzLnZhbHVlVmVyc2lvbiAhPT0gbGFzdFNlZW5WYWx1ZVZlcnNpb247XG4gIH1cbn1cbiJdfQ==