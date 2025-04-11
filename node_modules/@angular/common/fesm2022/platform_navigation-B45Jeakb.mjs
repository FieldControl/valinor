/**
 * @license Angular v19.2.6
 * (c) 2010-2025 Google LLC. https://angular.io/
 * License: MIT
 */

import * as i0 from '@angular/core';
import { Injectable } from '@angular/core';

/**
 * This class wraps the platform Navigation API which allows server-specific and test
 * implementations.
 */
class PlatformNavigation {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.6", ngImport: i0, type: PlatformNavigation, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.2.6", ngImport: i0, type: PlatformNavigation, providedIn: 'platform', useFactory: () => window.navigation });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.6", ngImport: i0, type: PlatformNavigation, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'platform', useFactory: () => window.navigation }]
        }] });

export { PlatformNavigation };
//# sourceMappingURL=platform_navigation-B45Jeakb.mjs.map
