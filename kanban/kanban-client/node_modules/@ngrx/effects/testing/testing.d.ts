import { FactoryProvider } from '@angular/core';
import { Observable } from 'rxjs';
export declare function provideMockActions(source: Observable<any>): FactoryProvider;
export declare function provideMockActions(factory: () => Observable<any>): FactoryProvider;
