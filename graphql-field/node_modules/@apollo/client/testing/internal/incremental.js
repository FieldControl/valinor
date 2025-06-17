import { __assign } from "tslib";
import { HttpLink } from "../../link/http/index.js";
import { ReadableStream as NodeReadableStream, TextEncoderStream, TransformStream, } from "node:stream/web";
var hasNextSymbol = Symbol("hasNext");
export function mockIncrementalStream(_a) {
    var responseHeaders = _a.responseHeaders;
    var CLOSE = Symbol();
    var streamController = null;
    var sentInitialChunk = false;
    var queue = [];
    function processQueue() {
        if (!streamController) {
            throw new Error("Cannot process queue without stream controller");
        }
        var chunk;
        while ((chunk = queue.shift())) {
            if (chunk === CLOSE) {
                streamController.close();
            }
            else {
                streamController.enqueue(chunk);
            }
        }
    }
    function createStream() {
        return new NodeReadableStream({
            start: function (c) {
                streamController = c;
                processQueue();
            },
        })
            .pipeThrough(new TransformStream({
            transform: function (chunk, controller) {
                controller.enqueue((!sentInitialChunk ? "\r\n---\r\n" : "") +
                    "content-type: application/json; charset=utf-8\r\n\r\n" +
                    JSON.stringify(chunk) +
                    (chunk[hasNextSymbol] ? "\r\n---\r\n" : "\r\n-----\r\n"));
                sentInitialChunk = true;
            },
        }))
            .pipeThrough(new TextEncoderStream());
    }
    var httpLink = new HttpLink({
        fetch: function (input, init) {
            return Promise.resolve(new Response(createStream(), {
                status: 200,
                headers: responseHeaders,
            }));
        },
    });
    function queueNext(event) {
        queue.push(event);
        if (streamController) {
            processQueue();
        }
    }
    function close() {
        queueNext(CLOSE);
        streamController = null;
        sentInitialChunk = false;
    }
    function enqueue(chunk, hasNext) {
        var _a;
        queueNext(__assign(__assign({}, chunk), (_a = {}, _a[hasNextSymbol] = hasNext, _a)));
        if (!hasNext) {
            close();
        }
    }
    return {
        httpLink: httpLink,
        enqueue: enqueue,
        close: close,
    };
}
export function mockDeferStream() {
    var _a = mockIncrementalStream({
        responseHeaders: new Headers({
            "Content-Type": 'multipart/mixed; boundary="-"; deferSpec=20220824',
        }),
    }), httpLink = _a.httpLink, enqueue = _a.enqueue;
    return {
        httpLink: httpLink,
        enqueueInitialChunk: function (chunk) {
            enqueue(chunk, chunk.hasNext);
        },
        enqueueSubsequentChunk: function (chunk) {
            enqueue(chunk, chunk.hasNext);
        },
        enqueueErrorChunk: function (errors) {
            enqueue({
                hasNext: true,
                incremental: [
                    {
                        // eslint-disable-next-line @typescript-eslint/no-restricted-types
                        errors: errors,
                    },
                ],
            }, true);
        },
    };
}
export function mockMultipartSubscriptionStream() {
    var _a = mockIncrementalStream({
        responseHeaders: new Headers({
            "Content-Type": "multipart/mixed",
        }),
    }), httpLink = _a.httpLink, enqueue = _a.enqueue;
    enqueueHeartbeat();
    function enqueueHeartbeat() {
        enqueue({}, true);
    }
    return {
        httpLink: httpLink,
        enqueueHeartbeat: enqueueHeartbeat,
        enqueuePayloadResult: function (payload, hasNext) {
            if (hasNext === void 0) { hasNext = true; }
            enqueue({ payload: payload }, hasNext);
        },
        enqueueProtocolErrors: function (errors) {
            enqueue({ payload: null, errors: errors }, false);
        },
    };
}
//# sourceMappingURL=incremental.js.map