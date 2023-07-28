import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ClassProvider } from '@angular/core';
import { ErrorInterceptor } from '@core/interceptors/error.interceptor';
import { RequestInterceptor } from '@core/interceptors/request.interceptor';

export const INTERCEPTORS: readonly ClassProvider[] = [
  { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: RequestInterceptor, multi: true },
];
