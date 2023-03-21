import { Observable } from 'rxjs';
import { ensureInitialized, getValue as getValue$1, getString as getString$1, getNumber as getNumber$1, getBoolean as getBoolean$1, getAll as getAll$1 } from 'firebase/remote-config';

function parameter$(_a) {
    var remoteConfig = _a.remoteConfig, key = _a.key, getter = _a.getter;
    return new Observable(function (subscriber) {
        ensureInitialized(remoteConfig).then(function () {
            // 'this' for the getter loses context in the next()
            // call, so it needs to be bound.
            var boundGetter = getter.bind(remoteConfig);
            subscriber.next(boundGetter(remoteConfig, key));
        });
    });
}
function getValue(remoteConfig, key) {
    var getter = getValue$1;
    return parameter$({ remoteConfig: remoteConfig, key: key, getter: getter });
}
function getString(remoteConfig, key) {
    var getter = getString$1;
    return parameter$({ remoteConfig: remoteConfig, key: key, getter: getter });
}
function getNumber(remoteConfig, key) {
    var getter = getNumber$1;
    return parameter$({ remoteConfig: remoteConfig, key: key, getter: getter });
}
function getBoolean(remoteConfig, key) {
    var getter = getBoolean$1;
    return parameter$({ remoteConfig: remoteConfig, key: key, getter: getter });
}
function getAll(remoteConfig) {
    var getter = getAll$1;
    // No key is needed for getAll()
    return parameter$({ remoteConfig: remoteConfig, key: '', getter: getter });
}

export { getAll, getBoolean, getNumber, getString, getValue };
//# sourceMappingURL=index.esm.js.map
