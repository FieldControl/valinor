import * as i0 from '@angular/core';
import { Injectable, NgModule } from '@angular/core';
import * as i1 from '@angular/router';
import { of, pipe } from 'rxjs';
import { map, take, switchMap } from 'rxjs/operators';
import * as i2 from '@angular/fire/auth';
import { user } from '@angular/fire/auth';
import { registerVersion } from 'firebase/app';
import { VERSION } from '@angular/fire';

const loggedIn = map(user => !!user);
class AuthGuard {
    constructor(router, auth) {
        this.router = router;
        this.auth = auth;
        this.canActivate = (next, state) => {
            const authPipeFactory = next.data.authGuardPipe || (() => loggedIn);
            return user(this.auth).pipe(take(1), authPipeFactory(next, state), map(can => {
                if (typeof can === 'boolean') {
                    return can;
                }
                else if (Array.isArray(can)) {
                    return this.router.createUrlTree(can);
                }
                else {
                    // TODO(EdricChan03): Add tests
                    return this.router.parseUrl(can);
                }
            }));
        };
    }
}
AuthGuard.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AuthGuard, deps: [{ token: i1.Router }, { token: i2.Auth }], target: i0.ɵɵFactoryTarget.Injectable });
AuthGuard.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AuthGuard, providedIn: 'any' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AuthGuard, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'any'
                }]
        }], ctorParameters: function () { return [{ type: i1.Router }, { type: i2.Auth }]; } });
const canActivate = (pipe) => ({
    canActivate: [AuthGuard], data: { authGuardPipe: pipe }
});
const isNotAnonymous = map(user => !!user && !user.isAnonymous);
const idTokenResult = switchMap((user) => user ? user.getIdTokenResult() : of(null));
const emailVerified = map(user => !!user && user.emailVerified);
const customClaims = pipe(idTokenResult, map(idTokenResult => idTokenResult ? idTokenResult.claims : []));
const hasCustomClaim = (claim) => pipe(customClaims, map(claims => claims.hasOwnProperty(claim)));
const redirectUnauthorizedTo = (redirect) => pipe(loggedIn, map(loggedIn => loggedIn || redirect));
const redirectLoggedInTo = (redirect) => pipe(loggedIn, map(loggedIn => loggedIn && redirect || true));

class AuthGuardModule {
    constructor() {
        registerVersion('angularfire', VERSION.full, 'auth-guard');
    }
}
AuthGuardModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AuthGuardModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
AuthGuardModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AuthGuardModule });
AuthGuardModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AuthGuardModule, providers: [AuthGuard] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AuthGuardModule, decorators: [{
            type: NgModule,
            args: [{
                    providers: [AuthGuard]
                }]
        }], ctorParameters: function () { return []; } });

/**
 * Generated bundle index. Do not edit.
 */

export { AuthGuard, AuthGuardModule, canActivate, customClaims, emailVerified, hasCustomClaim, idTokenResult, isNotAnonymous, loggedIn, redirectLoggedInTo, redirectUnauthorizedTo };
//# sourceMappingURL=angular-fire-auth-guard.js.map
