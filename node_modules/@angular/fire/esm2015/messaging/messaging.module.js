import { NgModule, Optional, NgZone, InjectionToken, Injector, APP_INITIALIZER } from '@angular/core';
import { ɵgetDefaultInstanceOf, ɵAngularFireSchedulers, VERSION, ɵisMessagingSupportedFactory } from '@angular/fire';
import { Messaging, MessagingInstances, MESSAGING_PROVIDER_NAME } from './messaging';
import { FirebaseApps, FirebaseApp } from '@angular/fire/app';
import { registerVersion } from 'firebase/app';
import * as i0 from "@angular/core";
const PROVIDED_MESSAGING_INSTANCES = new InjectionToken('angularfire2.messaging-instances');
export function defaultMessagingInstanceFactory(provided, defaultApp) {
    if (!ɵisMessagingSupportedFactory.sync()) {
        return null;
    }
    const defaultMessaging = ɵgetDefaultInstanceOf(MESSAGING_PROVIDER_NAME, provided, defaultApp);
    return defaultMessaging && new Messaging(defaultMessaging);
}
export function messagingInstanceFactory(fn) {
    return (zone, injector) => {
        if (!ɵisMessagingSupportedFactory.sync()) {
            return null;
        }
        const messaging = zone.runOutsideAngular(() => fn(injector));
        return new Messaging(messaging);
    };
}
const MESSAGING_INSTANCES_PROVIDER = {
    provide: MessagingInstances,
    deps: [
        [new Optional(), PROVIDED_MESSAGING_INSTANCES],
    ]
};
const DEFAULT_MESSAGING_INSTANCE_PROVIDER = {
    provide: Messaging,
    useFactory: defaultMessagingInstanceFactory,
    deps: [
        [new Optional(), PROVIDED_MESSAGING_INSTANCES],
        FirebaseApp,
    ]
};
export class MessagingModule {
    constructor() {
        registerVersion('angularfire', VERSION.full, 'fcm');
    }
}
MessagingModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: MessagingModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MessagingModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: MessagingModule });
MessagingModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: MessagingModule, providers: [
        DEFAULT_MESSAGING_INSTANCE_PROVIDER,
        MESSAGING_INSTANCES_PROVIDER,
        {
            provide: APP_INITIALIZER,
            useValue: ɵisMessagingSupportedFactory.async,
            multi: true,
        },
    ] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: MessagingModule, decorators: [{
            type: NgModule,
            args: [{
                    providers: [
                        DEFAULT_MESSAGING_INSTANCE_PROVIDER,
                        MESSAGING_INSTANCES_PROVIDER,
                        {
                            provide: APP_INITIALIZER,
                            useValue: ɵisMessagingSupportedFactory.async,
                            multi: true,
                        },
                    ]
                }]
        }], ctorParameters: function () { return []; } });
export function provideMessaging(fn, ...deps) {
    return {
        ngModule: MessagingModule,
        providers: [{
                provide: PROVIDED_MESSAGING_INSTANCES,
                useFactory: messagingInstanceFactory(fn),
                multi: true,
                deps: [
                    NgZone,
                    Injector,
                    ɵAngularFireSchedulers,
                    FirebaseApps,
                    ...deps,
                ],
            }]
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzc2FnaW5nLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9tZXNzYWdpbmcvbWVzc2FnaW5nLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsY0FBYyxFQUF1QixRQUFRLEVBQUUsZUFBZSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTNILE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxzQkFBc0IsRUFBRSxPQUFPLEVBQUUsNEJBQTRCLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDckgsT0FBTyxFQUFFLFNBQVMsRUFBRSxrQkFBa0IsRUFBRSx1QkFBdUIsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUNyRixPQUFPLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQzlELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxjQUFjLENBQUM7O0FBRS9DLE1BQU0sNEJBQTRCLEdBQUcsSUFBSSxjQUFjLENBQWMsa0NBQWtDLENBQUMsQ0FBQztBQUV6RyxNQUFNLFVBQVUsK0JBQStCLENBQUMsUUFBdUMsRUFBRSxVQUF1QjtJQUM5RyxJQUFJLENBQUMsNEJBQTRCLENBQUMsSUFBSSxFQUFFLEVBQUU7UUFBRSxPQUFPLElBQUksQ0FBQztLQUFFO0lBQzFELE1BQU0sZ0JBQWdCLEdBQUcscUJBQXFCLENBQW9CLHVCQUF1QixFQUFFLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztJQUNqSCxPQUFPLGdCQUFnQixJQUFJLElBQUksU0FBUyxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDN0QsQ0FBQztBQUVELE1BQU0sVUFBVSx3QkFBd0IsQ0FBQyxFQUE2QztJQUNwRixPQUFPLENBQUMsSUFBWSxFQUFFLFFBQWtCLEVBQUUsRUFBRTtRQUMxQyxJQUFJLENBQUMsNEJBQTRCLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFBRSxPQUFPLElBQUksQ0FBQztTQUFFO1FBQzFELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUM3RCxPQUFPLElBQUksU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ2xDLENBQUMsQ0FBQztBQUNKLENBQUM7QUFFRCxNQUFNLDRCQUE0QixHQUFHO0lBQ25DLE9BQU8sRUFBRSxrQkFBa0I7SUFDM0IsSUFBSSxFQUFFO1FBQ0osQ0FBQyxJQUFJLFFBQVEsRUFBRSxFQUFFLDRCQUE0QixDQUFFO0tBQ2hEO0NBQ0YsQ0FBQztBQUVGLE1BQU0sbUNBQW1DLEdBQUc7SUFDMUMsT0FBTyxFQUFFLFNBQVM7SUFDbEIsVUFBVSxFQUFFLCtCQUErQjtJQUMzQyxJQUFJLEVBQUU7UUFDSixDQUFDLElBQUksUUFBUSxFQUFFLEVBQUUsNEJBQTRCLENBQUU7UUFDL0MsV0FBVztLQUNaO0NBQ0YsQ0FBQztBQWFGLE1BQU0sT0FBTyxlQUFlO0lBQzFCO1FBQ0UsZUFBZSxDQUFDLGFBQWEsRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3RELENBQUM7OzRHQUhVLGVBQWU7NkdBQWYsZUFBZTs2R0FBZixlQUFlLGFBVmY7UUFDVCxtQ0FBbUM7UUFDbkMsNEJBQTRCO1FBQzVCO1lBQ0UsT0FBTyxFQUFFLGVBQWU7WUFDeEIsUUFBUSxFQUFFLDRCQUE0QixDQUFDLEtBQUs7WUFDNUMsS0FBSyxFQUFFLElBQUk7U0FDWjtLQUNGOzJGQUVVLGVBQWU7a0JBWDNCLFFBQVE7bUJBQUM7b0JBQ1IsU0FBUyxFQUFFO3dCQUNULG1DQUFtQzt3QkFDbkMsNEJBQTRCO3dCQUM1Qjs0QkFDRSxPQUFPLEVBQUUsZUFBZTs0QkFDeEIsUUFBUSxFQUFFLDRCQUE0QixDQUFDLEtBQUs7NEJBQzVDLEtBQUssRUFBRSxJQUFJO3lCQUNaO3FCQUNGO2lCQUNGOztBQU9ELE1BQU0sVUFBVSxnQkFBZ0IsQ0FBQyxFQUE2QyxFQUFFLEdBQUcsSUFBVztJQUM1RixPQUFPO1FBQ0wsUUFBUSxFQUFFLGVBQWU7UUFDekIsU0FBUyxFQUFFLENBQUM7Z0JBQ1YsT0FBTyxFQUFFLDRCQUE0QjtnQkFDckMsVUFBVSxFQUFFLHdCQUF3QixDQUFDLEVBQUUsQ0FBQztnQkFDeEMsS0FBSyxFQUFFLElBQUk7Z0JBQ1gsSUFBSSxFQUFFO29CQUNKLE1BQU07b0JBQ04sUUFBUTtvQkFDUixzQkFBc0I7b0JBQ3RCLFlBQVk7b0JBQ1osR0FBRyxJQUFJO2lCQUNSO2FBQ0YsQ0FBQztLQUNILENBQUM7QUFDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmdNb2R1bGUsIE9wdGlvbmFsLCBOZ1pvbmUsIEluamVjdGlvblRva2VuLCBNb2R1bGVXaXRoUHJvdmlkZXJzLCBJbmplY3RvciwgQVBQX0lOSVRJQUxJWkVSIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBNZXNzYWdpbmcgYXMgRmlyZWJhc2VNZXNzYWdpbmcgfSBmcm9tICdmaXJlYmFzZS9tZXNzYWdpbmcnO1xuaW1wb3J0IHsgybVnZXREZWZhdWx0SW5zdGFuY2VPZiwgybVBbmd1bGFyRmlyZVNjaGVkdWxlcnMsIFZFUlNJT04sIMm1aXNNZXNzYWdpbmdTdXBwb3J0ZWRGYWN0b3J5IH0gZnJvbSAnQGFuZ3VsYXIvZmlyZSc7XG5pbXBvcnQgeyBNZXNzYWdpbmcsIE1lc3NhZ2luZ0luc3RhbmNlcywgTUVTU0FHSU5HX1BST1ZJREVSX05BTUUgfSBmcm9tICcuL21lc3NhZ2luZyc7XG5pbXBvcnQgeyBGaXJlYmFzZUFwcHMsIEZpcmViYXNlQXBwIH0gZnJvbSAnQGFuZ3VsYXIvZmlyZS9hcHAnO1xuaW1wb3J0IHsgcmVnaXN0ZXJWZXJzaW9uIH0gZnJvbSAnZmlyZWJhc2UvYXBwJztcblxuY29uc3QgUFJPVklERURfTUVTU0FHSU5HX0lOU1RBTkNFUyA9IG5ldyBJbmplY3Rpb25Ub2tlbjxNZXNzYWdpbmdbXT4oJ2FuZ3VsYXJmaXJlMi5tZXNzYWdpbmctaW5zdGFuY2VzJyk7XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWZhdWx0TWVzc2FnaW5nSW5zdGFuY2VGYWN0b3J5KHByb3ZpZGVkOiBGaXJlYmFzZU1lc3NhZ2luZ1tdfHVuZGVmaW5lZCwgZGVmYXVsdEFwcDogRmlyZWJhc2VBcHApIHtcbiAgaWYgKCHJtWlzTWVzc2FnaW5nU3VwcG9ydGVkRmFjdG9yeS5zeW5jKCkpIHsgcmV0dXJuIG51bGw7IH1cbiAgY29uc3QgZGVmYXVsdE1lc3NhZ2luZyA9IMm1Z2V0RGVmYXVsdEluc3RhbmNlT2Y8RmlyZWJhc2VNZXNzYWdpbmc+KE1FU1NBR0lOR19QUk9WSURFUl9OQU1FLCBwcm92aWRlZCwgZGVmYXVsdEFwcCk7XG4gIHJldHVybiBkZWZhdWx0TWVzc2FnaW5nICYmIG5ldyBNZXNzYWdpbmcoZGVmYXVsdE1lc3NhZ2luZyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtZXNzYWdpbmdJbnN0YW5jZUZhY3RvcnkoZm46IChpbmplY3RvcjogSW5qZWN0b3IpID0+IEZpcmViYXNlTWVzc2FnaW5nKSB7XG4gIHJldHVybiAoem9uZTogTmdab25lLCBpbmplY3RvcjogSW5qZWN0b3IpID0+IHtcbiAgICBpZiAoIcm1aXNNZXNzYWdpbmdTdXBwb3J0ZWRGYWN0b3J5LnN5bmMoKSkgeyByZXR1cm4gbnVsbDsgfVxuICAgIGNvbnN0IG1lc3NhZ2luZyA9IHpvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4gZm4oaW5qZWN0b3IpKTtcbiAgICByZXR1cm4gbmV3IE1lc3NhZ2luZyhtZXNzYWdpbmcpO1xuICB9O1xufVxuXG5jb25zdCBNRVNTQUdJTkdfSU5TVEFOQ0VTX1BST1ZJREVSID0ge1xuICBwcm92aWRlOiBNZXNzYWdpbmdJbnN0YW5jZXMsXG4gIGRlcHM6IFtcbiAgICBbbmV3IE9wdGlvbmFsKCksIFBST1ZJREVEX01FU1NBR0lOR19JTlNUQU5DRVMgXSxcbiAgXVxufTtcblxuY29uc3QgREVGQVVMVF9NRVNTQUdJTkdfSU5TVEFOQ0VfUFJPVklERVIgPSB7XG4gIHByb3ZpZGU6IE1lc3NhZ2luZyxcbiAgdXNlRmFjdG9yeTogZGVmYXVsdE1lc3NhZ2luZ0luc3RhbmNlRmFjdG9yeSxcbiAgZGVwczogW1xuICAgIFtuZXcgT3B0aW9uYWwoKSwgUFJPVklERURfTUVTU0FHSU5HX0lOU1RBTkNFUyBdLFxuICAgIEZpcmViYXNlQXBwLFxuICBdXG59O1xuXG5ATmdNb2R1bGUoe1xuICBwcm92aWRlcnM6IFtcbiAgICBERUZBVUxUX01FU1NBR0lOR19JTlNUQU5DRV9QUk9WSURFUixcbiAgICBNRVNTQUdJTkdfSU5TVEFOQ0VTX1BST1ZJREVSLFxuICAgIHtcbiAgICAgIHByb3ZpZGU6IEFQUF9JTklUSUFMSVpFUixcbiAgICAgIHVzZVZhbHVlOiDJtWlzTWVzc2FnaW5nU3VwcG9ydGVkRmFjdG9yeS5hc3luYyxcbiAgICAgIG11bHRpOiB0cnVlLFxuICAgIH0sXG4gIF1cbn0pXG5leHBvcnQgY2xhc3MgTWVzc2FnaW5nTW9kdWxlIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgcmVnaXN0ZXJWZXJzaW9uKCdhbmd1bGFyZmlyZScsIFZFUlNJT04uZnVsbCwgJ2ZjbScpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlTWVzc2FnaW5nKGZuOiAoaW5qZWN0b3I6IEluamVjdG9yKSA9PiBGaXJlYmFzZU1lc3NhZ2luZywgLi4uZGVwczogYW55W10pOiBNb2R1bGVXaXRoUHJvdmlkZXJzPE1lc3NhZ2luZ01vZHVsZT4ge1xuICByZXR1cm4ge1xuICAgIG5nTW9kdWxlOiBNZXNzYWdpbmdNb2R1bGUsXG4gICAgcHJvdmlkZXJzOiBbe1xuICAgICAgcHJvdmlkZTogUFJPVklERURfTUVTU0FHSU5HX0lOU1RBTkNFUyxcbiAgICAgIHVzZUZhY3Rvcnk6IG1lc3NhZ2luZ0luc3RhbmNlRmFjdG9yeShmbiksXG4gICAgICBtdWx0aTogdHJ1ZSxcbiAgICAgIGRlcHM6IFtcbiAgICAgICAgTmdab25lLFxuICAgICAgICBJbmplY3RvcixcbiAgICAgICAgybVBbmd1bGFyRmlyZVNjaGVkdWxlcnMsXG4gICAgICAgIEZpcmViYXNlQXBwcyxcbiAgICAgICAgLi4uZGVwcyxcbiAgICAgIF0sXG4gICAgfV1cbiAgfTtcbn1cbiJdfQ==