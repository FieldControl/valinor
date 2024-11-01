"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonWebTokenError = exports.NotBeforeError = exports.TokenExpiredError = void 0;
__exportStar(require("./interfaces"), exports);
__exportStar(require("./jwt.errors"), exports);
__exportStar(require("./jwt.module"), exports);
__exportStar(require("./jwt.service"), exports);
var jsonwebtoken_1 = require("jsonwebtoken");
Object.defineProperty(exports, "TokenExpiredError", { enumerable: true, get: function () { return jsonwebtoken_1.TokenExpiredError; } });
Object.defineProperty(exports, "NotBeforeError", { enumerable: true, get: function () { return jsonwebtoken_1.NotBeforeError; } });
Object.defineProperty(exports, "JsonWebTokenError", { enumerable: true, get: function () { return jsonwebtoken_1.JsonWebTokenError; } });
