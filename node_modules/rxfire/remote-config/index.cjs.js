'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var rxjs = require('rxjs');
var remoteConfig = require('firebase/remote-config');

function parameter$(_a) {
    var remoteConfig$1 = _a.remoteConfig, key = _a.key, getter = _a.getter;
    return new rxjs.Observable(function (subscriber) {
        remoteConfig.ensureInitialized(remoteConfig$1).then(function () {
            // 'this' for the getter loses context in the next()
            // call, so it needs to be bound.
            var boundGetter = getter.bind(remoteConfig$1);
            subscriber.next(boundGetter(remoteConfig$1, key));
        });
    });
}
function getValue(remoteConfig$1, key) {
    var getter = remoteConfig.getValue;
    return parameter$({ remoteConfig: remoteConfig$1, key: key, getter: getter });
}
function getString(remoteConfig$1, key) {
    var getter = remoteConfig.getString;
    return parameter$({ remoteConfig: remoteConfig$1, key: key, getter: getter });
}
function getNumber(remoteConfig$1, key) {
    var getter = remoteConfig.getNumber;
    return parameter$({ remoteConfig: remoteConfig$1, key: key, getter: getter });
}
function getBoolean(remoteConfig$1, key) {
    var getter = remoteConfig.getBoolean;
    return parameter$({ remoteConfig: remoteConfig$1, key: key, getter: getter });
}
function getAll(remoteConfig$1) {
    var getter = remoteConfig.getAll;
    // No key is needed for getAll()
    return parameter$({ remoteConfig: remoteConfig$1, key: '', getter: getter });
}

exports.getAll = getAll;
exports.getBoolean = getBoolean;
exports.getNumber = getNumber;
exports.getString = getString;
exports.getValue = getValue;
//# sourceMappingURL=index.cjs.js.map
