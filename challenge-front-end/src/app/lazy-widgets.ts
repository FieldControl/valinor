import { InjectionToken } from '@angular/core';
import { Routes } from '@angular/router';

import { appRoutes } from './app-routing.module';

// This will create a dedicated JS bundle for lazy module
export const lazyWidgets: Routes = [
    ...appRoutes
];

export const LAZY_WIDGETS = new InjectionToken<{ [key: string]: string }>('LAZY_WIDGETS');

// This function will work as a factory for injecting lazy widget array in the main module
export function lazyArrayToObj() {
  const result = {};
  for (const w of lazyWidgets) {
    result[w.path] = w.loadChildren;
  }
  return result;
}