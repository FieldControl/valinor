import { NgZone } from '@angular/core';
export type ZoneConfig = {
    connectInZone: true;
    ngZone: NgZone;
} | {
    connectInZone: false;
    ngZone: null;
};
export declare function injectZoneConfig(connectInZone: boolean): ZoneConfig;
