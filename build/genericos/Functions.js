"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var zlib_1 = __importDefault(require("zlib"));
var atob_1 = __importDefault(require("atob"));
var Functions = /** @class */ (function () {
    function Functions() {
    }
    Functions.toArrayBuffer = function (buffer) {
        var arrayBuffer = new ArrayBuffer(buffer.length);
        var view = new Uint8Array(arrayBuffer);
        for (var i = 0; i < buffer.length; ++i) {
            view[i] = buffer[i];
        }
        return arrayBuffer;
    };
    Functions.unzipString = function (stringZip) {
        var b64Data = stringZip;
        var strData = atob_1.default.atob(b64Data);
        var charData = strData.split('').map(function (x) { return x.charCodeAt(0); });
        var binData = new Uint8Array(charData);
        var arrayBuffer = this.toArrayBuffer(binData);
        return zlib_1.default.unzipSync(Buffer.from(arrayBuffer, 4)).toString();
    };
    Functions.toDate = function (dateStr) {
        var _a = dateStr.split("/"), day = _a[0], month = _a[1], year = _a[2];
        return new Date(year, month - 1, day);
    };
    Functions.zipString = function (stringZip) {
        var buf = Buffer.from(JSON.stringify(stringZip));
        return zlib_1.default.gzipSync(buf);
    };
    Functions.isNullOrEmpty = function (string) {
        if ((string === undefined) || (string.length <= 0))
            return true;
        return false;
    };
    Functions.isValidDate = function (dt) {
        return !!new Date(dt).getFullYear();
    };
    return Functions;
}());
exports.Functions = Functions;
//# sourceMappingURL=Functions.js.map