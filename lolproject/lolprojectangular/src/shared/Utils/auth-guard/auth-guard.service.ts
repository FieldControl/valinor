import { AuthLoginComponent } from './../../../app/AuthModule/Components/auth-login/auth-login.component';
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  users: any[] = [];

  constructor(
    private router: Router,
    private authComponent: AuthLoginComponent
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot){
    if (this.authComponent.userAutenticate()) {
      return true;
    }else {
      this.router.navigate([''])
      return false
    }
  }


}
