"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInjectionProviders = getInjectionProviders;
const shared_utils_1 = require("../../utils/shared.utils");
/**
 * @param value
 * @returns `true` if value is `OptionalFactoryDependency`
 */
function isOptionalFactoryDependency(value) {
    return (!(0, shared_utils_1.isUndefined)(value.token) &&
        !(0, shared_utils_1.isUndefined)(value.optional) &&
        !value.prototype);
}
const mapInjectToTokens = (t) => isOptionalFactoryDependency(t) ? t.token : t;
/**
 *
 * @param providers List of a module's providers
 * @param tokens Injection tokens needed for a useFactory function (usually the module's options' token)
 * @returns All the providers needed for the tokens' injection (searched recursively)
 */
function getInjectionProviders(providers, tokens) {
    const result = [];
    let search = tokens.map(mapInjectToTokens);
    while (search.length > 0) {
        const match = (providers ?? []).filter(p => !result.includes(p) && // this prevents circular loops and duplication
            (search.includes(p) || search.includes(p?.provide)));
        result.push(...match);
        // get injection tokens of the matched providers, if any
        search = match
            .filter(p => p?.inject)
            .flatMap(p => p.inject)
            .map(mapInjectToTokens);
    }
    return result;
}
