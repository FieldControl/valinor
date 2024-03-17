import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../service/user/user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(private userService: UserService, private router: Router) {}

  canActivate():
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (!this.userService.isLoggedIn()) {
      this.router.navigate(['/']);
      return false;
    }

    this.userService.isLoggedIn();
    return true;
  }
}
