import type { Observable } from "../../utilities/index.js";
export interface TakeOptions {
    timeout?: number;
}
type ObservableEvent<T> = {
    type: "next";
    value: T;
} | {
    type: "error";
    error: any;
} | {
    type: "complete";
};
export declare class ObservableStream<T> {
    private reader;
    private subscription;
    private readerQueue;
    constructor(observable: Observable<T>);
    peek({ timeout }?: TakeOptions): Promise<ObservableEvent<T>>;
    take({ timeout }?: TakeOptions): Promise<ObservableEvent<T>>;
    unsubscribe(): void;
    takeNext(options?: TakeOptions): Promise<T>;
    takeError(options?: TakeOptions): Promise<any>;
    takeComplete(options?: TakeOptions): Promise<void>;
    private readNextValue;
}
export {};
//# sourceMappingURL=ObservableStream.d.ts.map