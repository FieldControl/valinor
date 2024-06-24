"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAsyncIterator = void 0;
const iterall_1 = require("iterall");
const createAsyncIterator = async (lazyFactory, filterFn) => {
    const asyncIterator = await lazyFactory;
    const getNextValue = async () => {
        if (!asyncIterator || typeof asyncIterator.next !== 'function') {
            return Promise.reject(asyncIterator);
        }
        const payload = await asyncIterator.next();
        if (payload.done === true) {
            return payload;
        }
        return Promise.resolve(filterFn(payload.value))
            .catch(() => false)
            .then((result) => (result ? payload : getNextValue()));
    };
    return {
        next() {
            return getNextValue();
        },
        return() {
            const isAsyncIterator = asyncIterator && typeof asyncIterator.return === 'function';
            return isAsyncIterator
                ? asyncIterator.return()
                : Promise.resolve({
                    done: true,
                    value: asyncIterator,
                });
        },
        throw(error) {
            return asyncIterator.throw(error);
        },
        [iterall_1.$$asyncIterator]() {
            return this;
        },
    };
};
exports.createAsyncIterator = createAsyncIterator;
