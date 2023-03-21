import { ɵgetAllInstancesOf, ɵgetDefaultInstanceOf, VERSION, ɵAngularFireSchedulers, ɵzoneWrap } from '@angular/fire';
import { timer, from } from 'rxjs';
import { concatMap, distinct } from 'rxjs/operators';
import * as i0 from '@angular/core';
import { InjectionToken, Optional, NgModule, NgZone, Injector } from '@angular/core';
import { FirebaseApp, FirebaseApps } from '@angular/fire/app';
import { registerVersion } from 'firebase/app';
import { AppCheckInstances } from '@angular/fire/app-check';
import { authState as authState$1, user as user$1, idToken as idToken$1 } from 'rxfire/auth';
import { applyActionCode as applyActionCode$1, beforeAuthStateChanged as beforeAuthStateChanged$1, checkActionCode as checkActionCode$1, confirmPasswordReset as confirmPasswordReset$1, connectAuthEmulator as connectAuthEmulator$1, createUserWithEmailAndPassword as createUserWithEmailAndPassword$1, deleteUser as deleteUser$1, fetchSignInMethodsForEmail as fetchSignInMethodsForEmail$1, getAdditionalUserInfo as getAdditionalUserInfo$1, getAuth as getAuth$1, getIdToken as getIdToken$1, getIdTokenResult as getIdTokenResult$1, getMultiFactorResolver as getMultiFactorResolver$1, getRedirectResult as getRedirectResult$1, initializeAuth as initializeAuth$1, isSignInWithEmailLink as isSignInWithEmailLink$1, linkWithCredential as linkWithCredential$1, linkWithPhoneNumber as linkWithPhoneNumber$1, linkWithPopup as linkWithPopup$1, linkWithRedirect as linkWithRedirect$1, multiFactor as multiFactor$1, onAuthStateChanged as onAuthStateChanged$1, onIdTokenChanged as onIdTokenChanged$1, parseActionCodeURL as parseActionCodeURL$1, reauthenticateWithCredential as reauthenticateWithCredential$1, reauthenticateWithPhoneNumber as reauthenticateWithPhoneNumber$1, reauthenticateWithPopup as reauthenticateWithPopup$1, reauthenticateWithRedirect as reauthenticateWithRedirect$1, reload as reload$1, sendEmailVerification as sendEmailVerification$1, sendPasswordResetEmail as sendPasswordResetEmail$1, sendSignInLinkToEmail as sendSignInLinkToEmail$1, setPersistence as setPersistence$1, signInAnonymously as signInAnonymously$1, signInWithCredential as signInWithCredential$1, signInWithCustomToken as signInWithCustomToken$1, signInWithEmailAndPassword as signInWithEmailAndPassword$1, signInWithEmailLink as signInWithEmailLink$1, signInWithPhoneNumber as signInWithPhoneNumber$1, signInWithPopup as signInWithPopup$1, signInWithRedirect as signInWithRedirect$1, signOut as signOut$1, unlink as unlink$1, updateCurrentUser as updateCurrentUser$1, updateEmail as updateEmail$1, updatePassword as updatePassword$1, updatePhoneNumber as updatePhoneNumber$1, updateProfile as updateProfile$1, useDeviceLanguage as useDeviceLanguage$1, verifyBeforeUpdateEmail as verifyBeforeUpdateEmail$1, verifyPasswordResetCode as verifyPasswordResetCode$1 } from 'firebase/auth';
export * from 'firebase/auth';

const AUTH_PROVIDER_NAME = 'auth';
class Auth {
    constructor(auth) {
        return auth;
    }
}
class AuthInstances {
    constructor() {
        return ɵgetAllInstancesOf(AUTH_PROVIDER_NAME);
    }
}
const authInstance$ = timer(0, 300).pipe(concatMap(() => from(ɵgetAllInstancesOf(AUTH_PROVIDER_NAME))), distinct());

const PROVIDED_AUTH_INSTANCES = new InjectionToken('angularfire2.auth-instances');
function defaultAuthInstanceFactory(provided, defaultApp) {
    const defaultAuth = ɵgetDefaultInstanceOf(AUTH_PROVIDER_NAME, provided, defaultApp);
    return defaultAuth && new Auth(defaultAuth);
}
function authInstanceFactory(fn) {
    return (zone, injector) => {
        const auth = zone.runOutsideAngular(() => fn(injector));
        return new Auth(auth);
    };
}
const AUTH_INSTANCES_PROVIDER = {
    provide: AuthInstances,
    deps: [
        [new Optional(), PROVIDED_AUTH_INSTANCES],
    ]
};
const DEFAULT_AUTH_INSTANCE_PROVIDER = {
    provide: Auth,
    useFactory: defaultAuthInstanceFactory,
    deps: [
        [new Optional(), PROVIDED_AUTH_INSTANCES],
        FirebaseApp,
    ]
};
class AuthModule {
    constructor() {
        registerVersion('angularfire', VERSION.full, 'auth');
    }
}
AuthModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AuthModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
AuthModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AuthModule });
AuthModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AuthModule, providers: [
        DEFAULT_AUTH_INSTANCE_PROVIDER,
        AUTH_INSTANCES_PROVIDER,
    ] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AuthModule, decorators: [{
            type: NgModule,
            args: [{
                    providers: [
                        DEFAULT_AUTH_INSTANCE_PROVIDER,
                        AUTH_INSTANCES_PROVIDER,
                    ]
                }]
        }], ctorParameters: function () { return []; } });
function provideAuth(fn, ...deps) {
    return {
        ngModule: AuthModule,
        providers: [{
                provide: PROVIDED_AUTH_INSTANCES,
                useFactory: authInstanceFactory(fn),
                multi: true,
                deps: [
                    NgZone,
                    Injector,
                    ɵAngularFireSchedulers,
                    FirebaseApps,
                    [new Optional(), AppCheckInstances],
                    ...deps,
                ]
            }]
    };
}

// DO NOT MODIFY, this file is autogenerated by tools/build.ts
const authState = ɵzoneWrap(authState$1, true);
const user = ɵzoneWrap(user$1, true);
const idToken = ɵzoneWrap(idToken$1, true);

// DO NOT MODIFY, this file is autogenerated by tools/build.ts
const applyActionCode = ɵzoneWrap(applyActionCode$1, true);
const beforeAuthStateChanged = ɵzoneWrap(beforeAuthStateChanged$1, true);
const checkActionCode = ɵzoneWrap(checkActionCode$1, true);
const confirmPasswordReset = ɵzoneWrap(confirmPasswordReset$1, true);
const connectAuthEmulator = ɵzoneWrap(connectAuthEmulator$1, true);
const createUserWithEmailAndPassword = ɵzoneWrap(createUserWithEmailAndPassword$1, true);
const deleteUser = ɵzoneWrap(deleteUser$1, true);
const fetchSignInMethodsForEmail = ɵzoneWrap(fetchSignInMethodsForEmail$1, true);
const getAdditionalUserInfo = ɵzoneWrap(getAdditionalUserInfo$1, true);
const getAuth = ɵzoneWrap(getAuth$1, true);
const getIdToken = ɵzoneWrap(getIdToken$1, true);
const getIdTokenResult = ɵzoneWrap(getIdTokenResult$1, true);
const getMultiFactorResolver = ɵzoneWrap(getMultiFactorResolver$1, true);
const getRedirectResult = ɵzoneWrap(getRedirectResult$1, true);
const initializeAuth = ɵzoneWrap(initializeAuth$1, true);
const isSignInWithEmailLink = ɵzoneWrap(isSignInWithEmailLink$1, true);
const linkWithCredential = ɵzoneWrap(linkWithCredential$1, true);
const linkWithPhoneNumber = ɵzoneWrap(linkWithPhoneNumber$1, true);
const linkWithPopup = ɵzoneWrap(linkWithPopup$1, true);
const linkWithRedirect = ɵzoneWrap(linkWithRedirect$1, true);
const multiFactor = ɵzoneWrap(multiFactor$1, true);
const onAuthStateChanged = ɵzoneWrap(onAuthStateChanged$1, true);
const onIdTokenChanged = ɵzoneWrap(onIdTokenChanged$1, true);
const parseActionCodeURL = ɵzoneWrap(parseActionCodeURL$1, true);
const reauthenticateWithCredential = ɵzoneWrap(reauthenticateWithCredential$1, true);
const reauthenticateWithPhoneNumber = ɵzoneWrap(reauthenticateWithPhoneNumber$1, true);
const reauthenticateWithPopup = ɵzoneWrap(reauthenticateWithPopup$1, true);
const reauthenticateWithRedirect = ɵzoneWrap(reauthenticateWithRedirect$1, true);
const reload = ɵzoneWrap(reload$1, true);
const sendEmailVerification = ɵzoneWrap(sendEmailVerification$1, true);
const sendPasswordResetEmail = ɵzoneWrap(sendPasswordResetEmail$1, true);
const sendSignInLinkToEmail = ɵzoneWrap(sendSignInLinkToEmail$1, true);
const setPersistence = ɵzoneWrap(setPersistence$1, true);
const signInAnonymously = ɵzoneWrap(signInAnonymously$1, true);
const signInWithCredential = ɵzoneWrap(signInWithCredential$1, true);
const signInWithCustomToken = ɵzoneWrap(signInWithCustomToken$1, true);
const signInWithEmailAndPassword = ɵzoneWrap(signInWithEmailAndPassword$1, true);
const signInWithEmailLink = ɵzoneWrap(signInWithEmailLink$1, true);
const signInWithPhoneNumber = ɵzoneWrap(signInWithPhoneNumber$1, true);
const signInWithPopup = ɵzoneWrap(signInWithPopup$1, true);
const signInWithRedirect = ɵzoneWrap(signInWithRedirect$1, true);
const signOut = ɵzoneWrap(signOut$1, true);
const unlink = ɵzoneWrap(unlink$1, true);
const updateCurrentUser = ɵzoneWrap(updateCurrentUser$1, true);
const updateEmail = ɵzoneWrap(updateEmail$1, true);
const updatePassword = ɵzoneWrap(updatePassword$1, true);
const updatePhoneNumber = ɵzoneWrap(updatePhoneNumber$1, true);
const updateProfile = ɵzoneWrap(updateProfile$1, true);
const useDeviceLanguage = ɵzoneWrap(useDeviceLanguage$1, true);
const verifyBeforeUpdateEmail = ɵzoneWrap(verifyBeforeUpdateEmail$1, true);
const verifyPasswordResetCode = ɵzoneWrap(verifyPasswordResetCode$1, true);

/**
 * Generated bundle index. Do not edit.
 */

export { Auth, AuthInstances, AuthModule, applyActionCode, authInstance$, authState, beforeAuthStateChanged, checkActionCode, confirmPasswordReset, connectAuthEmulator, createUserWithEmailAndPassword, deleteUser, fetchSignInMethodsForEmail, getAdditionalUserInfo, getAuth, getIdToken, getIdTokenResult, getMultiFactorResolver, getRedirectResult, idToken, initializeAuth, isSignInWithEmailLink, linkWithCredential, linkWithPhoneNumber, linkWithPopup, linkWithRedirect, multiFactor, onAuthStateChanged, onIdTokenChanged, parseActionCodeURL, provideAuth, reauthenticateWithCredential, reauthenticateWithPhoneNumber, reauthenticateWithPopup, reauthenticateWithRedirect, reload, sendEmailVerification, sendPasswordResetEmail, sendSignInLinkToEmail, setPersistence, signInAnonymously, signInWithCredential, signInWithCustomToken, signInWithEmailAndPassword, signInWithEmailLink, signInWithPhoneNumber, signInWithPopup, signInWithRedirect, signOut, unlink, updateCurrentUser, updateEmail, updatePassword, updatePhoneNumber, updateProfile, useDeviceLanguage, user, verifyBeforeUpdateEmail, verifyPasswordResetCode };
//# sourceMappingURL=angular-fire-auth.js.map
