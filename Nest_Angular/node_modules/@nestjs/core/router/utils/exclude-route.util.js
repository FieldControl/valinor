"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRequestMethodAll = void 0;
exports.isRouteExcluded = isRouteExcluded;
const common_1 = require("@nestjs/common");
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const isRequestMethodAll = (method) => {
    return common_1.RequestMethod.ALL === method || method === -1;
};
exports.isRequestMethodAll = isRequestMethodAll;
function isRouteExcluded(excludedRoutes, path, requestMethod) {
    return excludedRoutes.some(route => {
        if ((0, exports.isRequestMethodAll)(route.requestMethod) ||
            route.requestMethod === requestMethod) {
            return route.pathRegex.exec((0, shared_utils_1.addLeadingSlash)(path));
        }
        return false;
    });
}
