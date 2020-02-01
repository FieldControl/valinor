import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class CustomHttpInterceptor implements HttpInterceptor {
    constructor(
    ) {
    }
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const request = req.clone();
        console.log('Log http interceptor: ', request);
        return next.handle(request).pipe(
            catchError((e, caught) => {
                console.error(e);
                return throwError(e);
            }));
    }
}
