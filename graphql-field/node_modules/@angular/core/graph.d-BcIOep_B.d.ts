/**
 * @license Angular v20.0.3
 * (c) 2010-2025 Google LLC. https://angular.io/
 * License: MIT
 */

/**
 * A comparison function which can determine if two values are equal.
 */
type ValueEqualityFn<T> = (a: T, b: T) => boolean;
/**
 * The default equality function used for `signal` and `computed`, which uses referential equality.
 */
declare function defaultEquals<T>(a: T, b: T): boolean;

type Version = number & {
    __brand: 'Version';
};
type ReactiveHookFn = (node: ReactiveNode) => void;
/**
 * Symbol used to tell `Signal`s apart from other functions.
 *
 * This can be used to auto-unwrap signals in various cases, or to auto-wrap non-signal values.
 */
declare const SIGNAL: unique symbol;
declare function setActiveConsumer(consumer: ReactiveNode | null): ReactiveNode | null;
declare function getActiveConsumer(): ReactiveNode | null;
declare function isInNotificationPhase(): boolean;
interface Reactive {
    [SIGNAL]: ReactiveNode;
}
declare function isReactive(value: unknown): value is Reactive;
declare const REACTIVE_NODE: ReactiveNode;
/**
 * A producer and/or consumer which participates in the reactive graph.
 *
 * Producer `ReactiveNode`s which are accessed when a consumer `ReactiveNode` is the
 * `activeConsumer` are tracked as dependencies of that consumer.
 *
 * Certain consumers are also tracked as "live" consumers and create edges in the other direction,
 * from producer to consumer. These edges are used to propagate change notifications when a
 * producer's value is updated.
 *
 * A `ReactiveNode` may be both a producer and consumer.
 */
interface ReactiveNode {
    /**
     * Version of the value that this node produces.
     *
     * This is incremented whenever a new value is produced by this node which is not equal to the
     * previous value (by whatever definition of equality is in use).
     */
    version: Version;
    /**
     * Epoch at which this node is verified to be clean.
     *
     * This allows skipping of some polling operations in the case where no signals have been set
     * since this node was last read.
     */
    lastCleanEpoch: Version;
    /**
     * Whether this node (in its consumer capacity) is dirty.
     *
     * Only live consumers become dirty, when receiving a change notification from a dependency
     * producer.
     */
    dirty: boolean;
    /**
     * Producers which are dependencies of this consumer.
     *
     * Uses the same indices as the `producerLastReadVersion` and `producerIndexOfThis` arrays.
     */
    producerNode: ReactiveNode[] | undefined;
    /**
     * `Version` of the value last read by a given producer.
     *
     * Uses the same indices as the `producerNode` and `producerIndexOfThis` arrays.
     */
    producerLastReadVersion: Version[] | undefined;
    /**
     * Index of `this` (consumer) in each producer's `liveConsumers` array.
     *
     * This value is only meaningful if this node is live (`liveConsumers.length > 0`). Otherwise
     * these indices are stale.
     *
     * Uses the same indices as the `producerNode` and `producerLastReadVersion` arrays.
     */
    producerIndexOfThis: number[] | undefined;
    /**
     * Index into the producer arrays that the next dependency of this node as a consumer will use.
     *
     * This index is zeroed before this node as a consumer begins executing. When a producer is read,
     * it gets inserted into the producers arrays at this index. There may be an existing dependency
     * in this location which may or may not match the incoming producer, depending on whether the
     * same producers were read in the same order as the last computation.
     */
    nextProducerIndex: number;
    /**
     * Array of consumers of this producer that are "live" (they require push notifications).
     *
     * `liveConsumerNode.length` is effectively our reference count for this node.
     */
    liveConsumerNode: ReactiveNode[] | undefined;
    /**
     * Index of `this` (producer) in each consumer's `producerNode` array.
     *
     * Uses the same indices as the `liveConsumerNode` array.
     */
    liveConsumerIndexOfThis: number[] | undefined;
    /**
     * Whether writes to signals are allowed when this consumer is the `activeConsumer`.
     *
     * This is used to enforce guardrails such as preventing writes to writable signals in the
     * computation function of computed signals, which is supposed to be pure.
     */
    consumerAllowSignalWrites: boolean;
    readonly consumerIsAlwaysLive: boolean;
    /**
     * Tracks whether producers need to recompute their value independently of the reactive graph (for
     * example, if no initial value has been computed).
     */
    producerMustRecompute(node: unknown): boolean;
    producerRecomputeValue(node: unknown): void;
    consumerMarkedDirty(node: unknown): void;
    /**
     * Called when a signal is read within this consumer.
     */
    consumerOnSignalRead(node: unknown): void;
    /**
     * A debug name for the reactive node. Used in Angular DevTools to identify the node.
     */
    debugName?: string;
    /**
     * Kind of node. Example: 'signal', 'computed', 'input', 'effect'.
     *
     * ReactiveNode has this as 'unknown' by default, but derived node types should override this to
     * make available the kind of signal that particular instance of a ReactiveNode represents.
     *
     * Used in Angular DevTools to identify the kind of signal.
     */
    kind: string;
}
/**
 * Called by implementations when a producer's signal is read.
 */
declare function producerAccessed(node: ReactiveNode): void;
/**
 * Increment the global epoch counter.
 *
 * Called by source producers (that is, not computeds) whenever their values change.
 */
declare function producerIncrementEpoch(): void;
/**
 * Ensure this producer's `version` is up-to-date.
 */
declare function producerUpdateValueVersion(node: ReactiveNode): void;
/**
 * Propagate a dirty notification to live consumers of this producer.
 */
declare function producerNotifyConsumers(node: ReactiveNode): void;
/**
 * Whether this `ReactiveNode` in its producer capacity is currently allowed to initiate updates,
 * based on the current consumer context.
 */
declare function producerUpdatesAllowed(): boolean;
declare function consumerMarkDirty(node: ReactiveNode): void;
declare function producerMarkClean(node: ReactiveNode): void;
/**
 * Prepare this consumer to run a computation in its reactive context.
 *
 * Must be called by subclasses which represent reactive computations, before those computations
 * begin.
 */
declare function consumerBeforeComputation(node: ReactiveNode | null): ReactiveNode | null;
/**
 * Finalize this consumer's state after a reactive computation has run.
 *
 * Must be called by subclasses which represent reactive computations, after those computations
 * have finished.
 */
declare function consumerAfterComputation(node: ReactiveNode | null, prevConsumer: ReactiveNode | null): void;
/**
 * Determine whether this consumer has any dependencies which have changed since the last time
 * they were read.
 */
declare function consumerPollProducersForChange(node: ReactiveNode): boolean;
/**
 * Disconnect this consumer from the graph.
 */
declare function consumerDestroy(node: ReactiveNode): void;
declare function runPostProducerCreatedFn(node: ReactiveNode): void;
declare function setPostProducerCreatedFn(fn: ReactiveHookFn | null): ReactiveHookFn | null;

export { REACTIVE_NODE, SIGNAL, consumerAfterComputation, consumerBeforeComputation, consumerDestroy, consumerMarkDirty, consumerPollProducersForChange, defaultEquals, getActiveConsumer, isInNotificationPhase, isReactive, producerAccessed, producerIncrementEpoch, producerMarkClean, producerNotifyConsumers, producerUpdateValueVersion, producerUpdatesAllowed, runPostProducerCreatedFn, setActiveConsumer, setPostProducerCreatedFn };
export type { Reactive, ReactiveHookFn, ReactiveNode, ValueEqualityFn };
