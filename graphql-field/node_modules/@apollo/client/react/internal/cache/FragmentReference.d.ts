import type { WatchFragmentOptions, WatchFragmentResult } from "../../../cache/index.js";
import type { ApolloClient } from "../../../core/ApolloClient.js";
import type { MaybeMasked } from "../../../masking/index.js";
import type { Observable, PromiseWithState } from "../../../utilities/index.js";
import type { FragmentKey } from "./types.js";
type FragmentRefPromise<TData> = PromiseWithState<TData>;
type Listener<TData> = (promise: FragmentRefPromise<TData>) => void;
interface FragmentReferenceOptions {
    autoDisposeTimeoutMs?: number;
    onDispose?: () => void;
}
export declare class FragmentReference<TData = unknown, TVariables = Record<string, unknown>> {
    readonly observable: Observable<WatchFragmentResult<TData>>;
    readonly key: FragmentKey;
    promise: FragmentRefPromise<MaybeMasked<TData>>;
    private resolve;
    private reject;
    private subscription;
    private listeners;
    private autoDisposeTimeoutId?;
    private references;
    constructor(client: ApolloClient<any>, watchFragmentOptions: WatchFragmentOptions<TData, TVariables> & {
        from: string;
    }, options: FragmentReferenceOptions);
    listen(listener: Listener<MaybeMasked<TData>>): () => void;
    retain(): () => void;
    private dispose;
    private onDispose;
    private subscribeToFragment;
    private handleNext;
    private handleError;
    private deliver;
    private createPendingPromise;
    private getDiff;
}
export {};
//# sourceMappingURL=FragmentReference.d.ts.map