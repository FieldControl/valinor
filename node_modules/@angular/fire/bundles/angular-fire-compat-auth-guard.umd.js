(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('rxjs'), require('rxjs/operators'), require('@angular/router'), require('@angular/fire/compat/auth'), require('firebase/compat/app'), require('@angular/fire')) :
    typeof define === 'function' && define.amd ? define('@angular/fire/compat/auth-guard', ['exports', '@angular/core', 'rxjs', 'rxjs/operators', '@angular/router', '@angular/fire/compat/auth', 'firebase/compat/app', '@angular/fire'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.angular = global.angular || {}, global.angular.fire = global.angular.fire || {}, global.angular.fire.compat = global.angular.fire.compat || {}, global.angular.fire.compat['auth-guard'] = {}), global.ng.core, global.rxjs, global.rxjs.operators, global.ng.router, global.angular.fire.compat.auth, global.firebase, global.angular.fire));
}(this, (function (exports, i0, rxjs, operators, i1, i2, firebase, fire) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    function _interopNamespace(e) {
        if (e && e.__esModule) return e;
        var n = Object.create(null);
        if (e) {
            Object.keys(e).forEach(function (k) {
                if (k !== 'default') {
                    var d = Object.getOwnPropertyDescriptor(e, k);
                    Object.defineProperty(n, k, d.get ? d : {
                        enumerable: true,
                        get: function () {
                            return e[k];
                        }
                    });
                }
            });
        }
        n['default'] = e;
        return Object.freeze(n);
    }

    var i0__namespace = /*#__PURE__*/_interopNamespace(i0);
    var i1__namespace = /*#__PURE__*/_interopNamespace(i1);
    var i2__namespace = /*#__PURE__*/_interopNamespace(i2);
    var firebase__default = /*#__PURE__*/_interopDefaultLegacy(firebase);

    var loggedIn = operators.map(function (user) { return !!user; });
    var AngularFireAuthGuard = /** @class */ (function () {
        function AngularFireAuthGuard(router, auth) {
            var _this = this;
            this.router = router;
            this.auth = auth;
            this.canActivate = function (next, state) {
                var authPipeFactory = next.data.authGuardPipe || (function () { return loggedIn; });
                return _this.auth.user.pipe(operators.take(1), authPipeFactory(next, state), operators.map(function (can) {
                    if (typeof can === 'boolean') {
                        return can;
                    }
                    else if (Array.isArray(can)) {
                        return _this.router.createUrlTree(can);
                    }
                    else {
                        // TODO(EdricChan03): Add tests
                        return _this.router.parseUrl(can);
                    }
                }));
            };
        }
        return AngularFireAuthGuard;
    }());
    AngularFireAuthGuard.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AngularFireAuthGuard, deps: [{ token: i1__namespace.Router }, { token: i2__namespace.AngularFireAuth }], target: i0__namespace.ɵɵFactoryTarget.Injectable });
    AngularFireAuthGuard.ɵprov = i0__namespace.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AngularFireAuthGuard, providedIn: 'any' });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AngularFireAuthGuard, decorators: [{
                type: i0.Injectable,
                args: [{
                        providedIn: 'any'
                    }]
            }], ctorParameters: function () { return [{ type: i1__namespace.Router }, { type: i2__namespace.AngularFireAuth }]; } });
    var canActivate = function (pipe) { return ({
        canActivate: [AngularFireAuthGuard], data: { authGuardPipe: pipe }
    }); };
    var isNotAnonymous = operators.map(function (user) { return !!user && !user.isAnonymous; });
    var idTokenResult = operators.switchMap(function (user) { return user ? user.getIdTokenResult() : rxjs.of(null); });
    var emailVerified = operators.map(function (user) { return !!user && user.emailVerified; });
    var customClaims = rxjs.pipe(idTokenResult, operators.map(function (idTokenResult) { return idTokenResult ? idTokenResult.claims : []; }));
    var hasCustomClaim = function (claim) { return rxjs.pipe(customClaims, operators.map(function (claims) { return claims.hasOwnProperty(claim); })); };
    var redirectUnauthorizedTo = function (redirect) { return rxjs.pipe(loggedIn, operators.map(function (loggedIn) { return loggedIn || redirect; })); };
    var redirectLoggedInTo = function (redirect) { return rxjs.pipe(loggedIn, operators.map(function (loggedIn) { return loggedIn && redirect || true; })); };

    var AngularFireAuthGuardModule = /** @class */ (function () {
        function AngularFireAuthGuardModule() {
            firebase__default['default'].registerVersion('angularfire', fire.VERSION.full, 'auth-guard-compat');
        }
        return AngularFireAuthGuardModule;
    }());
    AngularFireAuthGuardModule.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AngularFireAuthGuardModule, deps: [], target: i0__namespace.ɵɵFactoryTarget.NgModule });
    AngularFireAuthGuardModule.ɵmod = i0__namespace.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AngularFireAuthGuardModule });
    AngularFireAuthGuardModule.ɵinj = i0__namespace.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AngularFireAuthGuardModule, providers: [AngularFireAuthGuard] });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AngularFireAuthGuardModule, decorators: [{
                type: i0.NgModule,
                args: [{
                        providers: [AngularFireAuthGuard]
                    }]
            }], ctorParameters: function () { return []; } });

    /**
     * Generated bundle index. Do not edit.
     */

    exports.AngularFireAuthGuard = AngularFireAuthGuard;
    exports.AngularFireAuthGuardModule = AngularFireAuthGuardModule;
    exports.canActivate = canActivate;
    exports.customClaims = customClaims;
    exports.emailVerified = emailVerified;
    exports.hasCustomClaim = hasCustomClaim;
    exports.idTokenResult = idTokenResult;
    exports.isNotAnonymous = isNotAnonymous;
    exports.loggedIn = loggedIn;
    exports.redirectLoggedInTo = redirectLoggedInTo;
    exports.redirectUnauthorizedTo = redirectUnauthorizedTo;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=angular-fire-compat-auth-guard.umd.js.map
