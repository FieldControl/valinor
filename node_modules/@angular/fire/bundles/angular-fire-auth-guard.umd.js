(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('rxjs'), require('rxjs/operators'), require('@angular/fire/auth'), require('@angular/router'), require('firebase/app'), require('@angular/fire')) :
    typeof define === 'function' && define.amd ? define('@angular/fire/auth-guard', ['exports', '@angular/core', 'rxjs', 'rxjs/operators', '@angular/fire/auth', '@angular/router', 'firebase/app', '@angular/fire'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.angular = global.angular || {}, global.angular.fire = global.angular.fire || {}, global.angular.fire['auth-guard'] = {}), global.ng.core, global.rxjs, global.rxjs.operators, global.angular.fire.auth, global.ng.router, global.firebase, global.angular.fire));
}(this, (function (exports, i0, rxjs, operators, i2, i1, app, fire) { 'use strict';

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
    var i2__namespace = /*#__PURE__*/_interopNamespace(i2);
    var i1__namespace = /*#__PURE__*/_interopNamespace(i1);

    var loggedIn = operators.map(function (user) { return !!user; });
    var AuthGuard = /** @class */ (function () {
        function AuthGuard(router, auth) {
            var _this = this;
            this.router = router;
            this.auth = auth;
            this.canActivate = function (next, state) {
                var authPipeFactory = next.data.authGuardPipe || (function () { return loggedIn; });
                return i2.user(_this.auth).pipe(operators.take(1), authPipeFactory(next, state), operators.map(function (can) {
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
        return AuthGuard;
    }());
    AuthGuard.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AuthGuard, deps: [{ token: i1__namespace.Router }, { token: i2__namespace.Auth }], target: i0__namespace.ɵɵFactoryTarget.Injectable });
    AuthGuard.ɵprov = i0__namespace.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AuthGuard, providedIn: 'any' });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AuthGuard, decorators: [{
                type: i0.Injectable,
                args: [{
                        providedIn: 'any'
                    }]
            }], ctorParameters: function () { return [{ type: i1__namespace.Router }, { type: i2__namespace.Auth }]; } });
    var canActivate = function (pipe) { return ({
        canActivate: [AuthGuard], data: { authGuardPipe: pipe }
    }); };
    var isNotAnonymous = operators.map(function (user) { return !!user && !user.isAnonymous; });
    var idTokenResult = operators.switchMap(function (user) { return user ? user.getIdTokenResult() : rxjs.of(null); });
    var emailVerified = operators.map(function (user) { return !!user && user.emailVerified; });
    var customClaims = rxjs.pipe(idTokenResult, operators.map(function (idTokenResult) { return idTokenResult ? idTokenResult.claims : []; }));
    var hasCustomClaim = function (claim) { return rxjs.pipe(customClaims, operators.map(function (claims) { return claims.hasOwnProperty(claim); })); };
    var redirectUnauthorizedTo = function (redirect) { return rxjs.pipe(loggedIn, operators.map(function (loggedIn) { return loggedIn || redirect; })); };
    var redirectLoggedInTo = function (redirect) { return rxjs.pipe(loggedIn, operators.map(function (loggedIn) { return loggedIn && redirect || true; })); };

    var AuthGuardModule = /** @class */ (function () {
        function AuthGuardModule() {
            app.registerVersion('angularfire', fire.VERSION.full, 'auth-guard');
        }
        return AuthGuardModule;
    }());
    AuthGuardModule.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AuthGuardModule, deps: [], target: i0__namespace.ɵɵFactoryTarget.NgModule });
    AuthGuardModule.ɵmod = i0__namespace.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AuthGuardModule });
    AuthGuardModule.ɵinj = i0__namespace.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AuthGuardModule, providers: [AuthGuard] });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0__namespace, type: AuthGuardModule, decorators: [{
                type: i0.NgModule,
                args: [{
                        providers: [AuthGuard]
                    }]
            }], ctorParameters: function () { return []; } });

    /**
     * Generated bundle index. Do not edit.
     */

    exports.AuthGuard = AuthGuard;
    exports.AuthGuardModule = AuthGuardModule;
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
//# sourceMappingURL=angular-fire-auth-guard.umd.js.map
