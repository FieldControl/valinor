import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, UnaryFunction } from 'rxjs';
import firebase from 'firebase/compat/app';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import * as i0 from "@angular/core";
export declare type AuthPipeGenerator = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot) => AuthPipe;
export declare type AuthPipe = UnaryFunction<Observable<firebase.User | null>, Observable<boolean | string | any[]>>;
export declare const loggedIn: AuthPipe;
export declare class AngularFireAuthGuard implements CanActivate {
    private router;
    private auth;
    constructor(router: Router, auth: AngularFireAuth);
    canActivate: (next: ActivatedRouteSnapshot, state: RouterStateSnapshot) => Observable<boolean | import("@angular/router").UrlTree>;
    static ɵfac: i0.ɵɵFactoryDeclaration<AngularFireAuthGuard, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<AngularFireAuthGuard>;
}
export declare const canActivate: (pipe: AuthPipeGenerator) => {
    canActivate: (typeof AngularFireAuthGuard)[];
    data: {
        authGuardPipe: AuthPipeGenerator;
    };
};
export declare const isNotAnonymous: AuthPipe;
export declare const idTokenResult: import("rxjs").OperatorFunction<firebase.User, any>;
export declare const emailVerified: AuthPipe;
export declare const customClaims: UnaryFunction<Observable<firebase.User>, Observable<any>>;
export declare const hasCustomClaim: (claim: string) => AuthPipe;
export declare const redirectUnauthorizedTo: (redirect: string | any[]) => AuthPipe;
export declare const redirectLoggedInTo: (redirect: string | any[]) => AuthPipe;
