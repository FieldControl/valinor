import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, finalize } from 'rxjs/operators';

import { LoadingService } from 'app/core/services/loading/loading.service';

@Injectable()
export class CustomHttpInterceptor implements HttpInterceptor {
    constructor(
        private _loadingService: LoadingService
    ) {
    }
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const request = req.clone({
            headers: req.headers.set('Authorization', `Basic ${btoa('felipe.carlos1504@gmail.com:e2ae3b88caa2b43b74b21437ecc2b6acb0118c9b')}`)
        });
        this._loadingService.loadingShow();
        return next.handle(request).pipe(
            catchError((e, caught) => {
                console.error(e);
                return throwError(e);
            }),
            finalize(() => {
                this._loadingService.loadingHide();
            })
        );
    }
}
