// DEBUG quick debugger function for inline logging that typescript doesn't complain about
//       wrote it for debugging the ɵlazySDKProxy, commenting out for now; should consider exposing a
//       verbose mode for AngularFire in a future release that uses something like this in multiple places
//       usage: () => log('something') || returnValue
// const log = (...args: any[]): false => { console.log(...args); return false }
// The problem here are things like ngOnDestroy are missing, then triggering the service
// rather than dig too far; I'm capturing these as I go.
const noopFunctions = ['ngOnDestroy'];
// INVESTIGATE should we make the Proxy revokable and do some cleanup?
//             right now it's fairly simple but I'm sure this will grow in complexity
export const ɵlazySDKProxy = (klass, observable, zone, options = {}) => {
    return new Proxy(klass, {
        get: (_, name) => zone.runOutsideAngular(() => {
            var _a;
            if (klass[name]) {
                if ((_a = options === null || options === void 0 ? void 0 : options.spy) === null || _a === void 0 ? void 0 : _a.get) {
                    options.spy.get(name, klass[name]);
                }
                return klass[name];
            }
            if (noopFunctions.indexOf(name) > -1) {
                return () => {
                };
            }
            const promise = observable.toPromise().then(mod => {
                const ret = mod && mod[name];
                // TODO move to proper type guards
                if (typeof ret === 'function') {
                    return ret.bind(mod);
                }
                else if (ret && ret.then) {
                    return ret.then((res) => zone.run(() => res));
                }
                else {
                    return zone.run(() => ret);
                }
            });
            // recurse the proxy
            return new Proxy(() => { }, {
                get: (_, name) => promise[name],
                // TODO handle callbacks as transparently as I can
                apply: (self, _, args) => promise.then(it => {
                    var _a;
                    const res = it && it(...args);
                    if ((_a = options === null || options === void 0 ? void 0 : options.spy) === null || _a === void 0 ? void 0 : _a.apply) {
                        options.spy.apply(name, args, res);
                    }
                    return res;
                })
            });
        })
    });
};
export const ɵapplyMixins = (derivedCtor, constructors) => {
    constructors.forEach((baseCtor) => {
        Object.getOwnPropertyNames(baseCtor.prototype || baseCtor).forEach((name) => {
            Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype || baseCtor, name));
        });
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJveHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcGF0L3Byb3h5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQW1CQSwwRkFBMEY7QUFDMUYscUdBQXFHO0FBQ3JHLDBHQUEwRztBQUMxRyxxREFBcUQ7QUFDckQsZ0ZBQWdGO0FBRWhGLHdGQUF3RjtBQUN4Rix3REFBd0Q7QUFDeEQsTUFBTSxhQUFhLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUV0QyxzRUFBc0U7QUFDdEUscUZBQXFGO0FBQ3JGLE1BQU0sQ0FBQyxNQUFNLGFBQWEsR0FBRyxDQUFDLEtBQVUsRUFBRSxVQUEyQixFQUFFLElBQVksRUFBRSxVQUtqRixFQUFFLEVBQUUsRUFBRTtJQUNSLE9BQU8sSUFBSSxLQUFLLENBQUMsS0FBSyxFQUFFO1FBQ3RCLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFZLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUU7O1lBQ3BELElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUNmLElBQUksTUFBQSxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsR0FBRywwQ0FBRSxHQUFHLEVBQUU7b0JBQ3JCLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztpQkFDcEM7Z0JBQ0QsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDcEI7WUFDRCxJQUFJLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3BDLE9BQU8sR0FBRyxFQUFFO2dCQUNaLENBQUMsQ0FBQzthQUNIO1lBQ0QsTUFBTSxPQUFPLEdBQUcsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDaEQsTUFBTSxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDN0Isa0NBQWtDO2dCQUNsQyxJQUFJLE9BQU8sR0FBRyxLQUFLLFVBQVUsRUFBRTtvQkFDN0IsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUN0QjtxQkFBTSxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsSUFBSSxFQUFFO29CQUMxQixPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFRLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztpQkFDcEQ7cUJBQU07b0JBQ0wsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUM1QjtZQUNILENBQUMsQ0FBQyxDQUFDO1lBQ0gsb0JBQW9CO1lBQ3BCLE9BQU8sSUFBSSxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUUsQ0FBQyxFQUFFO2dCQUN2QixHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO2dCQUMvQixrREFBa0Q7Z0JBQ2xELEtBQUssRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFOztvQkFDMUMsTUFBTSxHQUFHLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO29CQUM5QixJQUFJLE1BQUEsT0FBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLEdBQUcsMENBQUUsS0FBSyxFQUFFO3dCQUN2QixPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO3FCQUNwQztvQkFDRCxPQUFPLEdBQUcsQ0FBQztnQkFDYixDQUFDLENBQUM7YUFDSCxDQUNGLENBQUM7UUFDSixDQUFDLENBQUM7S0FDSCxDQUFDLENBQUM7QUFDTCxDQUFDLENBQUM7QUFFRixNQUFNLENBQUMsTUFBTSxZQUFZLEdBQUcsQ0FBQyxXQUFnQixFQUFFLFlBQW1CLEVBQUUsRUFBRTtJQUNwRSxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUU7UUFDaEMsTUFBTSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxTQUFTLElBQUksUUFBUSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDMUUsTUFBTSxDQUFDLGNBQWMsQ0FDbkIsV0FBVyxDQUFDLFNBQVMsRUFDckIsSUFBSSxFQUNKLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxRQUFRLENBQUMsU0FBUyxJQUFJLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FDdEUsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZ1pvbmUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE9ic2VydmFibGUgfSBmcm9tICdyeGpzJztcblxudHlwZSBNeUZ1bmN0aW9uID0gKC4uLmFyZ3M6IGFueVtdKSA9PiBhbnk7XG50eXBlIEZ1bmN0aW9uUHJvcGVydHlOYW1lczxUPiA9IHsgW0sgaW4ga2V5b2YgVF06IFRbS10gZXh0ZW5kcyBNeUZ1bmN0aW9uID8gSyA6IG5ldmVyIH1ba2V5b2YgVF07XG50eXBlIFJldHVyblR5cGVPck5ldmVyPFQ+ID0gVCBleHRlbmRzIE15RnVuY3Rpb24gPyBSZXR1cm5UeXBlPFQ+IDogbmV2ZXI7XG50eXBlIFBhcmFtZXRlcnNPck5ldmVyPFQ+ID0gVCBleHRlbmRzIE15RnVuY3Rpb24gPyBQYXJhbWV0ZXJzPFQ+IDogbmV2ZXI7XG50eXBlIFByb21pc2VSZXR1cm5pbmdGdW5jdGlvblByb3BlcnR5TmFtZXM8VD4gPSB7XG4gIFtLIGluIEZ1bmN0aW9uUHJvcGVydHlOYW1lczxUPl06IFJldHVyblR5cGVPck5ldmVyPFRbS10+IGV4dGVuZHMgUHJvbWlzZTxhbnk+ID8gSyA6IG5ldmVyXG59W0Z1bmN0aW9uUHJvcGVydHlOYW1lczxUPl07XG50eXBlIE5vblByb21pc2VSZXR1cm5pbmdGdW5jdGlvblByb3BlcnR5TmFtZXM8VD4gPSB7XG4gIFtLIGluIEZ1bmN0aW9uUHJvcGVydHlOYW1lczxUPl06IFJldHVyblR5cGVPck5ldmVyPFRbS10+IGV4dGVuZHMgUHJvbWlzZTxhbnk+ID8gbmV2ZXIgOiBLXG59W0Z1bmN0aW9uUHJvcGVydHlOYW1lczxUPl07XG50eXBlIE5vbkZ1bmN0aW9uUHJvcGVydHlOYW1lczxUPiA9IHsgW0sgaW4ga2V5b2YgVF06IFRbS10gZXh0ZW5kcyBNeUZ1bmN0aW9uID8gbmV2ZXIgOiBLIH1ba2V5b2YgVF07XG5cbmV4cG9ydCB0eXBlIMm1UHJvbWlzZVByb3h5PFQ+ID0geyBbSyBpbiBOb25GdW5jdGlvblByb3BlcnR5TmFtZXM8VD5dOiBQcm9taXNlPFRbS10+IH0gJlxuICB7IFtLIGluIE5vblByb21pc2VSZXR1cm5pbmdGdW5jdGlvblByb3BlcnR5TmFtZXM8VD5dOiAoLi4uYXJnczogUGFyYW1ldGVyc09yTmV2ZXI8VFtLXT4pID0+IFByb21pc2U8UmV0dXJuVHlwZU9yTmV2ZXI8VFtLXT4+IH0gJlxuICB7IFtLIGluIFByb21pc2VSZXR1cm5pbmdGdW5jdGlvblByb3BlcnR5TmFtZXM8VD5dOiBUW0tdIH07XG5cbi8vIERFQlVHIHF1aWNrIGRlYnVnZ2VyIGZ1bmN0aW9uIGZvciBpbmxpbmUgbG9nZ2luZyB0aGF0IHR5cGVzY3JpcHQgZG9lc24ndCBjb21wbGFpbiBhYm91dFxuLy8gICAgICAgd3JvdGUgaXQgZm9yIGRlYnVnZ2luZyB0aGUgybVsYXp5U0RLUHJveHksIGNvbW1lbnRpbmcgb3V0IGZvciBub3c7IHNob3VsZCBjb25zaWRlciBleHBvc2luZyBhXG4vLyAgICAgICB2ZXJib3NlIG1vZGUgZm9yIEFuZ3VsYXJGaXJlIGluIGEgZnV0dXJlIHJlbGVhc2UgdGhhdCB1c2VzIHNvbWV0aGluZyBsaWtlIHRoaXMgaW4gbXVsdGlwbGUgcGxhY2VzXG4vLyAgICAgICB1c2FnZTogKCkgPT4gbG9nKCdzb21ldGhpbmcnKSB8fCByZXR1cm5WYWx1ZVxuLy8gY29uc3QgbG9nID0gKC4uLmFyZ3M6IGFueVtdKTogZmFsc2UgPT4geyBjb25zb2xlLmxvZyguLi5hcmdzKTsgcmV0dXJuIGZhbHNlIH1cblxuLy8gVGhlIHByb2JsZW0gaGVyZSBhcmUgdGhpbmdzIGxpa2UgbmdPbkRlc3Ryb3kgYXJlIG1pc3NpbmcsIHRoZW4gdHJpZ2dlcmluZyB0aGUgc2VydmljZVxuLy8gcmF0aGVyIHRoYW4gZGlnIHRvbyBmYXI7IEknbSBjYXB0dXJpbmcgdGhlc2UgYXMgSSBnby5cbmNvbnN0IG5vb3BGdW5jdGlvbnMgPSBbJ25nT25EZXN0cm95J107XG5cbi8vIElOVkVTVElHQVRFIHNob3VsZCB3ZSBtYWtlIHRoZSBQcm94eSByZXZva2FibGUgYW5kIGRvIHNvbWUgY2xlYW51cD9cbi8vICAgICAgICAgICAgIHJpZ2h0IG5vdyBpdCdzIGZhaXJseSBzaW1wbGUgYnV0IEknbSBzdXJlIHRoaXMgd2lsbCBncm93IGluIGNvbXBsZXhpdHlcbmV4cG9ydCBjb25zdCDJtWxhenlTREtQcm94eSA9IChrbGFzczogYW55LCBvYnNlcnZhYmxlOiBPYnNlcnZhYmxlPGFueT4sIHpvbmU6IE5nWm9uZSwgb3B0aW9uczoge1xuICBzcHk/OiB7XG4gICAgZ2V0PzogKChuYW1lOiBzdHJpbmcsIGl0OiBhbnkpID0+IHZvaWQpLFxuICAgIGFwcGx5PzogKChuYW1lOiBzdHJpbmcsIGFyZ3M6IGFueVtdLCBpdDogYW55KSA9PiB2b2lkKVxuICB9XG59ID0ge30pID0+IHtcbiAgcmV0dXJuIG5ldyBQcm94eShrbGFzcywge1xuICAgIGdldDogKF8sIG5hbWU6IHN0cmluZykgPT4gem9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICBpZiAoa2xhc3NbbmFtZV0pIHtcbiAgICAgICAgaWYgKG9wdGlvbnM/LnNweT8uZ2V0KSB7XG4gICAgICAgICAgb3B0aW9ucy5zcHkuZ2V0KG5hbWUsIGtsYXNzW25hbWVdKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ga2xhc3NbbmFtZV07XG4gICAgICB9XG4gICAgICBpZiAobm9vcEZ1bmN0aW9ucy5pbmRleE9mKG5hbWUpID4gLTEpIHtcbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHByb21pc2UgPSBvYnNlcnZhYmxlLnRvUHJvbWlzZSgpLnRoZW4obW9kID0+IHtcbiAgICAgICAgY29uc3QgcmV0ID0gbW9kICYmIG1vZFtuYW1lXTtcbiAgICAgICAgLy8gVE9ETyBtb3ZlIHRvIHByb3BlciB0eXBlIGd1YXJkc1xuICAgICAgICBpZiAodHlwZW9mIHJldCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHJldHVybiByZXQuYmluZChtb2QpO1xuICAgICAgICB9IGVsc2UgaWYgKHJldCAmJiByZXQudGhlbikge1xuICAgICAgICAgIHJldHVybiByZXQudGhlbigocmVzOiBhbnkpID0+IHpvbmUucnVuKCgpID0+IHJlcykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB6b25lLnJ1bigoKSA9PiByZXQpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIC8vIHJlY3Vyc2UgdGhlIHByb3h5XG4gICAgICByZXR1cm4gbmV3IFByb3h5KCgpID0+IHt9LCB7XG4gICAgICAgICAgZ2V0OiAoXywgbmFtZSkgPT4gcHJvbWlzZVtuYW1lXSxcbiAgICAgICAgICAvLyBUT0RPIGhhbmRsZSBjYWxsYmFja3MgYXMgdHJhbnNwYXJlbnRseSBhcyBJIGNhblxuICAgICAgICAgIGFwcGx5OiAoc2VsZiwgXywgYXJncykgPT4gcHJvbWlzZS50aGVuKGl0ID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJlcyA9IGl0ICYmIGl0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgaWYgKG9wdGlvbnM/LnNweT8uYXBwbHkpIHtcbiAgICAgICAgICAgICAgb3B0aW9ucy5zcHkuYXBwbHkobmFtZSwgYXJncywgcmVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9KVxuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCDJtWFwcGx5TWl4aW5zID0gKGRlcml2ZWRDdG9yOiBhbnksIGNvbnN0cnVjdG9yczogYW55W10pID0+IHtcbiAgY29uc3RydWN0b3JzLmZvckVhY2goKGJhc2VDdG9yKSA9PiB7XG4gICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoYmFzZUN0b3IucHJvdG90eXBlIHx8IGJhc2VDdG9yKS5mb3JFYWNoKChuYW1lKSA9PiB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoXG4gICAgICAgIGRlcml2ZWRDdG9yLnByb3RvdHlwZSxcbiAgICAgICAgbmFtZSxcbiAgICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihiYXNlQ3Rvci5wcm90b3R5cGUgfHwgYmFzZUN0b3IsIG5hbWUpXG4gICAgICApO1xuICAgIH0pO1xuICB9KTtcbn07XG4iXX0=