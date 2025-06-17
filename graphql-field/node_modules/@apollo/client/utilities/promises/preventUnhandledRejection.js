export function preventUnhandledRejection(promise) {
    promise.catch(function () { });
    return promise;
}
//# sourceMappingURL=preventUnhandledRejection.js.map