"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dateToProtoTimestamp = exports.TraceTreeBuilder = void 0;
const graphql_1 = require("graphql");
const usage_reporting_protobuf_1 = require("@apollo/usage-reporting-protobuf");
const UnreachableCaseError_js_1 = require("../utils/UnreachableCaseError.js");
function internalError(message) {
    return new Error(`[internal apollo-server error] ${message}`);
}
class TraceTreeBuilder {
    constructor(options) {
        this.rootNode = new usage_reporting_protobuf_1.Trace.Node();
        this.trace = new usage_reporting_protobuf_1.Trace({
            root: this.rootNode,
            fieldExecutionWeight: 1,
        });
        this.stopped = false;
        this.nodes = new Map([
            [responsePathAsString(), this.rootNode],
        ]);
        const { sendErrors, maskedBy } = options;
        if (!sendErrors || 'masked' in sendErrors) {
            this.transformError = () => new graphql_1.GraphQLError('<masked>', {
                extensions: { maskedBy },
            });
        }
        else if ('transform' in sendErrors) {
            this.transformError = sendErrors.transform;
        }
        else if ('unmodified' in sendErrors) {
            this.transformError = null;
        }
        else {
            throw new UnreachableCaseError_js_1.UnreachableCaseError(sendErrors);
        }
    }
    startTiming() {
        if (this.startHrTime) {
            throw internalError('startTiming called twice!');
        }
        if (this.stopped) {
            throw internalError('startTiming called after stopTiming!');
        }
        this.trace.startTime = dateToProtoTimestamp(new Date());
        this.startHrTime = process.hrtime();
    }
    stopTiming() {
        if (!this.startHrTime) {
            throw internalError('stopTiming called before startTiming!');
        }
        if (this.stopped) {
            throw internalError('stopTiming called twice!');
        }
        this.trace.durationNs = durationHrTimeToNanos(process.hrtime(this.startHrTime));
        this.trace.endTime = dateToProtoTimestamp(new Date());
        this.stopped = true;
    }
    willResolveField(info) {
        if (!this.startHrTime) {
            throw internalError('willResolveField called before startTiming!');
        }
        if (this.stopped) {
            return () => { };
        }
        const path = info.path;
        const node = this.newNode(path);
        node.type = info.returnType.toString();
        node.parentType = info.parentType.toString();
        node.startTime = durationHrTimeToNanos(process.hrtime(this.startHrTime));
        if (typeof path.key === 'string' && path.key !== info.fieldName) {
            node.originalFieldName = info.fieldName;
        }
        return () => {
            node.endTime = durationHrTimeToNanos(process.hrtime(this.startHrTime));
        };
    }
    didEncounterErrors(errors) {
        errors.forEach((err) => {
            if (err.extensions?.serviceName) {
                return;
            }
            const errorForReporting = this.transformAndNormalizeError(err);
            if (errorForReporting === null) {
                return;
            }
            this.addProtobufError(errorForReporting.path, errorToProtobufError(errorForReporting));
        });
    }
    addProtobufError(path, error) {
        if (!this.startHrTime) {
            throw internalError('addProtobufError called before startTiming!');
        }
        if (this.stopped) {
            throw internalError('addProtobufError called after stopTiming!');
        }
        let node = this.rootNode;
        if (Array.isArray(path)) {
            const specificNode = this.nodes.get(path.join('.'));
            if (specificNode) {
                node = specificNode;
            }
            else {
                const responsePath = responsePathFromArray(path, this.rootNode);
                if (!responsePath) {
                    throw internalError('addProtobufError called with invalid path!');
                }
                node = this.newNode(responsePath);
            }
        }
        node.error.push(error);
    }
    newNode(path) {
        const node = new usage_reporting_protobuf_1.Trace.Node();
        const id = path.key;
        if (typeof id === 'number') {
            node.index = id;
        }
        else {
            node.responseName = id;
        }
        this.nodes.set(responsePathAsString(path), node);
        const parentNode = this.ensureParentNode(path);
        parentNode.child.push(node);
        return node;
    }
    ensureParentNode(path) {
        const parentPath = responsePathAsString(path.prev);
        const parentNode = this.nodes.get(parentPath);
        if (parentNode) {
            return parentNode;
        }
        return this.newNode(path.prev);
    }
    transformAndNormalizeError(err) {
        if (this.transformError) {
            const clonedError = Object.assign(Object.create(Object.getPrototypeOf(err)), err);
            const rewrittenError = this.transformError(clonedError);
            if (rewrittenError === null) {
                return null;
            }
            if (!(rewrittenError instanceof graphql_1.GraphQLError)) {
                return err;
            }
            return new graphql_1.GraphQLError(rewrittenError.message, {
                nodes: err.nodes,
                source: err.source,
                positions: err.positions,
                path: err.path,
                originalError: err.originalError,
                extensions: rewrittenError.extensions || err.extensions,
            });
        }
        return err;
    }
}
exports.TraceTreeBuilder = TraceTreeBuilder;
function durationHrTimeToNanos(hrtime) {
    return hrtime[0] * 1e9 + hrtime[1];
}
function responsePathAsString(p) {
    if (p === undefined) {
        return '';
    }
    let res = String(p.key);
    while ((p = p.prev) !== undefined) {
        res = `${p.key}.${res}`;
    }
    return res;
}
function responsePathFromArray(path, node) {
    let responsePath;
    let nodePtr = node;
    for (const key of path) {
        nodePtr = nodePtr?.child?.find((child) => child.responseName === key);
        responsePath = {
            key,
            prev: responsePath,
            typename: nodePtr?.type ?? undefined,
        };
    }
    return responsePath;
}
function errorToProtobufError(error) {
    return new usage_reporting_protobuf_1.Trace.Error({
        message: error.message,
        location: (error.locations || []).map(({ line, column }) => new usage_reporting_protobuf_1.Trace.Location({ line, column })),
        json: JSON.stringify(error),
    });
}
function dateToProtoTimestamp(date) {
    const totalMillis = +date;
    const millis = totalMillis % 1000;
    return new usage_reporting_protobuf_1.google.protobuf.Timestamp({
        seconds: (totalMillis - millis) / 1000,
        nanos: millis * 1e6,
    });
}
exports.dateToProtoTimestamp = dateToProtoTimestamp;
//# sourceMappingURL=traceTreeBuilder.js.map