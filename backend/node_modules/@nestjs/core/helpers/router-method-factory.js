"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouterMethodFactory = void 0;
const request_method_enum_1 = require("@nestjs/common/enums/request-method.enum");
const REQUEST_METHOD_MAP = {
    [request_method_enum_1.RequestMethod.GET]: 'get',
    [request_method_enum_1.RequestMethod.POST]: 'post',
    [request_method_enum_1.RequestMethod.PUT]: 'put',
    [request_method_enum_1.RequestMethod.DELETE]: 'delete',
    [request_method_enum_1.RequestMethod.PATCH]: 'patch',
    [request_method_enum_1.RequestMethod.ALL]: 'all',
    [request_method_enum_1.RequestMethod.OPTIONS]: 'options',
    [request_method_enum_1.RequestMethod.HEAD]: 'head',
    [request_method_enum_1.RequestMethod.SEARCH]: 'search',
};
class RouterMethodFactory {
    get(target, requestMethod) {
        const methodName = REQUEST_METHOD_MAP[requestMethod];
        const method = target[methodName];
        if (!method) {
            return target.use;
        }
        return method;
    }
}
exports.RouterMethodFactory = RouterMethodFactory;
