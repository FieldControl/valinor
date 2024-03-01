import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class MyHttpInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log(`Sending request to ${request.url}`);

    return next.handle(request).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          console.log(`Received response for ${request.url}`, event);
        }
      })
    );
  }
}
