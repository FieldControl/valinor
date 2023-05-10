'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tslib = require('tslib');
var core$1 = require('@angular/core');
var core = require('@ionic-native/core');

var HTTP = /** @class */ (function (_super) {
    tslib.__extends(HTTP, _super);
    function HTTP() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HTTP.prototype.getBasicAuthHeader = function (username, password) { return core.cordova(this, "getBasicAuthHeader", { "sync": true }, arguments); };
    HTTP.prototype.useBasicAuth = function (username, password) { return core.cordova(this, "useBasicAuth", { "sync": true }, arguments); };
    HTTP.prototype.getHeaders = function (host) { return core.cordova(this, "getHeaders", { "sync": true }, arguments); };
    HTTP.prototype.setHeader = function (host, header, value) { return core.cordova(this, "setHeader", { "sync": true }, arguments); };
    HTTP.prototype.getDataSerializer = function () { return core.cordova(this, "getDataSerializer", { "sync": true }, arguments); };
    HTTP.prototype.setDataSerializer = function (serializer) { return core.cordova(this, "setDataSerializer", { "sync": true }, arguments); };
    HTTP.prototype.setCookie = function (url, cookie) { return core.cordova(this, "setCookie", { "sync": true }, arguments); };
    HTTP.prototype.clearCookies = function () { return core.cordova(this, "clearCookies", { "sync": true }, arguments); };
    HTTP.prototype.removeCookies = function (url, cb) { return core.cordova(this, "removeCookies", { "sync": true }, arguments); };
    HTTP.prototype.getCookieString = function (url) { return core.cordova(this, "getCookieString", { "sync": true }, arguments); };
    HTTP.prototype.getRequestTimeout = function () { return core.cordova(this, "getRequestTimeout", { "sync": true }, arguments); };
    HTTP.prototype.setRequestTimeout = function (timeout) { return core.cordova(this, "setRequestTimeout", { "sync": true }, arguments); };
    HTTP.prototype.getFollowRedirect = function () { return core.cordova(this, "getFollowRedirect", { "sync": true }, arguments); };
    HTTP.prototype.setFollowRedirect = function (follow) { return core.cordova(this, "setFollowRedirect", { "sync": true }, arguments); };
    HTTP.prototype.setServerTrustMode = function (mode) { return core.cordova(this, "setServerTrustMode", {}, arguments); };
    HTTP.prototype.post = function (url, body, headers) { return core.cordova(this, "post", {}, arguments); };
    HTTP.prototype.postSync = function (url, body, headers, success, failure) { return core.cordova(this, "post", { "methodName": "post", "sync": true }, arguments); };
    HTTP.prototype.get = function (url, parameters, headers) { return core.cordova(this, "get", {}, arguments); };
    HTTP.prototype.getSync = function (url, parameters, headers, success, failure) { return core.cordova(this, "get", { "methodName": "get", "sync": true }, arguments); };
    HTTP.prototype.put = function (url, body, headers) { return core.cordova(this, "put", {}, arguments); };
    HTTP.prototype.putSync = function (url, body, headers, success, failure) { return core.cordova(this, "put", { "methodName": "put", "sync": true }, arguments); };
    HTTP.prototype.patch = function (url, body, headers) { return core.cordova(this, "patch", {}, arguments); };
    HTTP.prototype.patchSync = function (url, body, headers, success, failure) { return core.cordova(this, "patch", { "methodName": "patch", "sync": true }, arguments); };
    HTTP.prototype.delete = function (url, parameters, headers) { return core.cordova(this, "delete", {}, arguments); };
    HTTP.prototype.deleteSync = function (url, parameters, headers, success, failure) { return core.cordova(this, "delete", { "methodName": "delete", "sync": true }, arguments); };
    HTTP.prototype.head = function (url, parameters, headers) { return core.cordova(this, "head", {}, arguments); };
    HTTP.prototype.headSync = function (url, parameters, headers, success, failure) { return core.cordova(this, "head", { "methodName": "head", "sync": true }, arguments); };
    HTTP.prototype.options = function (url, parameters, headers) { return core.cordova(this, "options", {}, arguments); };
    HTTP.prototype.optionsSync = function (url, parameters, headers, success, failure) { return core.cordova(this, "options", { "methodName": "options", "sync": true }, arguments); };
    HTTP.prototype.uploadFile = function (url, body, headers, filePath, name) { return core.cordova(this, "uploadFile", {}, arguments); };
    HTTP.prototype.uploadFileSync = function (url, body, headers, filePath, name, success, failure) { return core.cordova(this, "uploadFile", { "methodName": "uploadFile", "sync": true }, arguments); };
    HTTP.prototype.downloadFile = function (url, body, headers, filePath) { return core.cordova(this, "downloadFile", {}, arguments); };
    HTTP.prototype.downloadFileSync = function (url, body, headers, filePath, success, failure) { return core.cordova(this, "downloadFile", { "methodName": "downloadFile", "sync": true }, arguments); };
    HTTP.prototype.sendRequest = function (url, options) { return core.cordova(this, "sendRequest", {}, arguments); };
    HTTP.prototype.sendRequestSync = function (url, options, success, failure) { return core.cordova(this, "sendRequest", { "methodName": "sendRequest", "sync": true }, arguments); };
    HTTP.prototype.abort = function (requestId) { return core.cordova(this, "abort", {}, arguments); };
    Object.defineProperty(HTTP.prototype, "ErrorCode", {
        get: function () { return core.cordovaPropertyGet(this, "ErrorCode"); },
        set: function (value) { core.cordovaPropertySet(this, "ErrorCode", value); },
        enumerable: false,
        configurable: true
    });
    HTTP.pluginName = "HTTP";
    HTTP.plugin = "cordova-plugin-advanced-http";
    HTTP.pluginRef = "cordova.plugin.http";
    HTTP.repo = "https://github.com/silkimen/cordova-plugin-advanced-http";
    HTTP.platforms = ["Android", "iOS"];
    HTTP.decorators = [
        { type: core$1.Injectable }
    ];
    return HTTP;
}(core.IonicNativePlugin));

exports.HTTP = HTTP;
