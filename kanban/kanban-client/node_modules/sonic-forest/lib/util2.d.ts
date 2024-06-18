import type { Comparator2, HeadlessNode2 } from './types2';
export declare const first2: <N extends HeadlessNode2>(root: N | undefined) => N | undefined;
export declare const last2: <N extends HeadlessNode2>(root: N | undefined) => N | undefined;
export declare const next2: <N extends HeadlessNode2>(curr: N) => N | undefined;
export declare const prev2: <N extends HeadlessNode2>(curr: N) => N | undefined;
export declare const insert2: <N extends HeadlessNode2>(root: N | undefined, node: N, comparator: Comparator2<N>) => N;
export declare const remove2: <N extends HeadlessNode2>(root: N | undefined, node: N) => N | undefined;
