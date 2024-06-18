"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decorateFieldResolverWithMiddleware = void 0;
function decorateFieldResolverWithMiddleware(originalResolveFnFactory, middlewareFunctions = []) {
    return (root, args, context, info) => {
        let index = -1;
        const run = async (currentIndex) => {
            if (currentIndex <= index) {
                throw new Error('next() called multiple times');
            }
            index = currentIndex;
            let middlewareFn;
            if (currentIndex === middlewareFunctions.length) {
                middlewareFn = originalResolveFnFactory(root, args, context, info);
            }
            else {
                middlewareFn = middlewareFunctions[currentIndex];
            }
            let tempResult = undefined;
            const result = await middlewareFn({
                info,
                args,
                context,
                source: root,
            }, async () => {
                tempResult = await run(currentIndex + 1);
                return tempResult;
            });
            return result !== undefined ? result : tempResult;
        };
        return run(0);
    };
}
exports.decorateFieldResolverWithMiddleware = decorateFieldResolverWithMiddleware;
