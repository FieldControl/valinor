"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _fileEmitter, _registrations;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileEmitterCollection = exports.FileEmitterRegistration = exports.AngularPluginSymbol = void 0;
exports.AngularPluginSymbol = Symbol.for('@angular-devkit/build-angular[angular-compiler]');
class FileEmitterRegistration {
    constructor() {
        _fileEmitter.set(this, void 0);
    }
    update(emitter) {
        __classPrivateFieldSet(this, _fileEmitter, emitter);
    }
    emit(file) {
        if (!__classPrivateFieldGet(this, _fileEmitter)) {
            throw new Error('Emit attempted before Angular Webpack plugin initialization.');
        }
        return __classPrivateFieldGet(this, _fileEmitter).call(this, file);
    }
}
exports.FileEmitterRegistration = FileEmitterRegistration;
_fileEmitter = new WeakMap();
class FileEmitterCollection {
    constructor() {
        _registrations.set(this, []);
    }
    register() {
        const registration = new FileEmitterRegistration();
        __classPrivateFieldGet(this, _registrations).push(registration);
        return registration;
    }
    async emit(file) {
        if (__classPrivateFieldGet(this, _registrations).length === 1) {
            return __classPrivateFieldGet(this, _registrations)[0].emit(file);
        }
        for (const registration of __classPrivateFieldGet(this, _registrations)) {
            const result = await registration.emit(file);
            if (result) {
                return result;
            }
        }
    }
}
exports.FileEmitterCollection = FileEmitterCollection;
_registrations = new WeakMap();
