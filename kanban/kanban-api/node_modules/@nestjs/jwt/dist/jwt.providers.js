"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJwtProvider = void 0;
const jwt_constants_1 = require("./jwt.constants");
function createJwtProvider(options) {
    return [{ provide: jwt_constants_1.JWT_MODULE_OPTIONS, useValue: options || {} }];
}
exports.createJwtProvider = createJwtProvider;
