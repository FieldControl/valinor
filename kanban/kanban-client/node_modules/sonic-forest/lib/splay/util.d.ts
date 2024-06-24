import type { HeadlessNode } from '../types';
export declare const splay: <N extends HeadlessNode>(root: N, node: N, repeat: number) => N;
export declare const rSplay: <N extends HeadlessNode>(c2: N, c1: N) => void;
export declare const lSplay: <N extends HeadlessNode>(c2: N, c1: N) => void;
export declare const rrSplay: <N extends HeadlessNode>(root: N, c3: N, c2: N, c1: N) => N;
export declare const llSplay: <N extends HeadlessNode>(root: N, c3: N, c2: N, c1: N) => N;
export declare const lrSplay: <N extends HeadlessNode>(root: N, c3: N, c2: N, c1: N) => N;
export declare const rlSplay: <N extends HeadlessNode>(root: N, c3: N, c2: N, c1: N) => N;
