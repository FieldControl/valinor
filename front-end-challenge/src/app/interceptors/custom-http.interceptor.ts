import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, finalize } from 'rxjs/operators';

import { ToastrService } from 'ngx-toastr';
import { LoadingService } from '../services/loading/loading.service';

@Injectable()
export class CustomHttpInterceptor implements HttpInterceptor {
    constructor(
        private _loadingService: LoadingService,
        private _toastr: ToastrService
    ) {
    }
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const request = req.clone({
            headers: req.headers.set('Authorization', `Basic ZmVsaXBlLmNhcmxvczE1MDRAZ21haWwuY29tOmdocF9wc0VhcEs5cGVJNjNYOEVZVnFQMDZxUHFkV3I5R2MyNGJBVWY=`)
        });
        this._loadingService.loadingShow();
        return next.handle(request).pipe(
            catchError((e, caught) => {
                this._toastr.error(e.error.message, e.statusText);
                console.error(e);
                return throwError(e);
            }),
            finalize(() => {
                this._loadingService.loadingHide();
            })
        );
    }
}
