import { Injectable, inject } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { Observable, map, take } from "rxjs";
import { UserService } from "./user.service";

@Injectable({
    providedIn: 'root',
})

export class AuthGuard implements CanActivate {
    private router = inject(Router);
    private userService = inject(UserService);


  canActivate(): Observable<boolean> {
    return this.userService.isLoggedIn.pipe(
      take(1),
      map((isLoggedIn: boolean) => {
        if (!isLoggedIn){
          this.router.navigate(['/login']);
          return false;
        }
        return true;
      })
    );
  }
}