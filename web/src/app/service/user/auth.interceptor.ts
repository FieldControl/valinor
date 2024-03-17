import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { UserService } from './user.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(
    private userService: UserService,
    private cookieService: CookieService,
    private router: Router
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.handle401Error(request, next);
        }

        return throwError(error);
      })
    );
  }

  private handle401Error(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return this.userService.refreshToken().pipe(
      switchMap((newTokenResponse: any) => {
        const newToken = newTokenResponse.data.revalidateToken.token;
        const authReq = request.clone({
          setHeaders: {
            Authorization: `Bearer ${newToken}`,
          },
        });
        return next.handle(authReq);
      }),
      catchError((error: any) => {
        this.cookieService.deleteAll();
        this.router.navigate(['']);
        return throwError(error);
      })
    );
  }
}
