import { Injectable, inject } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { Observable, map, of, take } from "rxjs";
import { UserService } from "./user.service";

@Injectable({
    providedIn: 'root',
})

export class AuthGuard implements CanActivate {
    private router = inject(Router);

    canActivate(): boolean {
      const token = localStorage.getItem('acess_token');
      if (!token) {
          this.router.navigate(['/']);
          return false;
      }
      return true;
  }
}