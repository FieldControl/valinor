import { CborEncoder } from '@jsonjoy.com/json-pack/lib/cbor/CborEncoder';
import { CborDecoder } from '@jsonjoy.com/json-pack/lib/cbor/CborDecoder';
export declare const encoder: CborEncoder<import("@jsonjoy.com/util/lib/buffers").IWriter & import("@jsonjoy.com/util/lib/buffers").IWriterGrowable>;
export declare const decoder: CborDecoder<import("@jsonjoy.com/util/lib/buffers").IReader & import("@jsonjoy.com/util/lib/buffers").IReaderResettable>;
