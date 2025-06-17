import { newInvariantError } from "../../utilities/globals/index.js";
export var checkFetcher = function (fetcher) {
    if (!fetcher && typeof fetch === "undefined") {
        throw newInvariantError(40);
    }
};
//# sourceMappingURL=checkFetcher.js.map