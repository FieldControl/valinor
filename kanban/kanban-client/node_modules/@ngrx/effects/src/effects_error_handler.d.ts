import { ErrorHandler } from '@angular/core';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs';
export type EffectsErrorHandler = <T extends Action>(observable$: Observable<T>, errorHandler: ErrorHandler) => Observable<T>;
export declare function defaultEffectsErrorHandler<T extends Action>(observable$: Observable<T>, errorHandler: ErrorHandler, retryAttemptLeft?: number): Observable<T>;
