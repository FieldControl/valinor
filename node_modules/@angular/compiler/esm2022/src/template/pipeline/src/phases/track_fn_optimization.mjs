/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as o from '../../../../output/output_ast';
import { Identifiers } from '../../../../render3/r3_identifiers';
import * as ir from '../../ir';
/**
 * `track` functions in `for` repeaters can sometimes be "optimized," i.e. transformed into inline
 * expressions, in lieu of an external function call. For example, tracking by `$index` can be be
 * optimized into an inline `trackByIndex` reference. This phase checks track expressions for
 * optimizable cases.
 */
export function optimizeTrackFns(job) {
    for (const unit of job.units) {
        for (const op of unit.create) {
            if (op.kind !== ir.OpKind.RepeaterCreate) {
                continue;
            }
            if (op.track instanceof o.ReadVarExpr && op.track.name === '$index') {
                // Top-level access of `$index` uses the built in `repeaterTrackByIndex`.
                op.trackByFn = o.importExpr(Identifiers.repeaterTrackByIndex);
            }
            else if (op.track instanceof o.ReadVarExpr && op.track.name === '$item') {
                // Top-level access of the item uses the built in `repeaterTrackByIdentity`.
                op.trackByFn = o.importExpr(Identifiers.repeaterTrackByIdentity);
            }
            else if (isTrackByFunctionCall(job.root.xref, op.track)) {
                // Mark the function as using the component instance to play it safe
                // since the method might be using `this` internally (see #53628).
                op.usesComponentInstance = true;
                // Top-level method calls in the form of `fn($index, item)` can be passed in directly.
                if (op.track.receiver.receiver.view === unit.xref) {
                    // TODO: this may be wrong
                    op.trackByFn = op.track.receiver;
                }
                else {
                    // This is a plain method call, but not in the component's root view.
                    // We need to get the component instance, and then call the method on it.
                    op.trackByFn = o
                        .importExpr(Identifiers.componentInstance)
                        .callFn([])
                        .prop(op.track.receiver.name);
                    // Because the context is not avaiable (without a special function), we don't want to
                    // try to resolve it later. Let's get rid of it by overwriting the original track
                    // expression (which won't be used anyway).
                    op.track = op.trackByFn;
                }
            }
            else {
                // The track function could not be optimized.
                // Replace context reads with a special IR expression, since context reads in a track
                // function are emitted specially.
                op.track = ir.transformExpressionsInExpression(op.track, (expr) => {
                    if (expr instanceof ir.ContextExpr) {
                        op.usesComponentInstance = true;
                        return new ir.TrackContextExpr(expr.view);
                    }
                    return expr;
                }, ir.VisitorContextFlag.None);
            }
        }
    }
}
function isTrackByFunctionCall(rootView, expr) {
    if (!(expr instanceof o.InvokeFunctionExpr) || expr.args.length === 0 || expr.args.length > 2) {
        return false;
    }
    if (!(expr.receiver instanceof o.ReadPropExpr && expr.receiver.receiver instanceof ir.ContextExpr) ||
        expr.receiver.receiver.view !== rootView) {
        return false;
    }
    const [arg0, arg1] = expr.args;
    if (!(arg0 instanceof o.ReadVarExpr) || arg0.name !== '$index') {
        return false;
    }
    else if (expr.args.length === 1) {
        return true;
    }
    if (!(arg1 instanceof o.ReadVarExpr) || arg1.name !== '$item') {
        return false;
    }
    return true;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhY2tfZm5fb3B0aW1pemF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlL3BpcGVsaW5lL3NyYy9waGFzZXMvdHJhY2tfZm5fb3B0aW1pemF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sS0FBSyxDQUFDLE1BQU0sK0JBQStCLENBQUM7QUFDbkQsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLG9DQUFvQyxDQUFDO0FBQy9ELE9BQU8sS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBSS9COzs7OztHQUtHO0FBQ0gsTUFBTSxVQUFVLGdCQUFnQixDQUFDLEdBQW1CO0lBQ2xELEtBQUssTUFBTSxJQUFJLElBQUksR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzdCLEtBQUssTUFBTSxFQUFFLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzdCLElBQUksRUFBRSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUN6QyxTQUFTO1lBQ1gsQ0FBQztZQUNELElBQUksRUFBRSxDQUFDLEtBQUssWUFBWSxDQUFDLENBQUMsV0FBVyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLFFBQVEsRUFBRSxDQUFDO2dCQUNwRSx5RUFBeUU7Z0JBQ3pFLEVBQUUsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUNoRSxDQUFDO2lCQUFNLElBQUksRUFBRSxDQUFDLEtBQUssWUFBWSxDQUFDLENBQUMsV0FBVyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLE9BQU8sRUFBRSxDQUFDO2dCQUMxRSw0RUFBNEU7Z0JBQzVFLEVBQUUsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsdUJBQXVCLENBQUMsQ0FBQztZQUNuRSxDQUFDO2lCQUFNLElBQUkscUJBQXFCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7Z0JBQzFELG9FQUFvRTtnQkFDcEUsa0VBQWtFO2dCQUNsRSxFQUFFLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDO2dCQUVoQyxzRkFBc0Y7Z0JBQ3RGLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBQ2xELDBCQUEwQjtvQkFDMUIsRUFBRSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQztnQkFDbkMsQ0FBQztxQkFBTSxDQUFDO29CQUNOLHFFQUFxRTtvQkFDckUseUVBQXlFO29CQUN6RSxFQUFFLENBQUMsU0FBUyxHQUFHLENBQUM7eUJBQ2IsVUFBVSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQzt5QkFDekMsTUFBTSxDQUFDLEVBQUUsQ0FBQzt5QkFDVixJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ2hDLHFGQUFxRjtvQkFDckYsaUZBQWlGO29CQUNqRiwyQ0FBMkM7b0JBQzNDLEVBQUUsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQztnQkFDMUIsQ0FBQztZQUNILENBQUM7aUJBQU0sQ0FBQztnQkFDTiw2Q0FBNkM7Z0JBQzdDLHFGQUFxRjtnQkFDckYsa0NBQWtDO2dCQUNsQyxFQUFFLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxnQ0FBZ0MsQ0FDNUMsRUFBRSxDQUFDLEtBQUssRUFDUixDQUFDLElBQUksRUFBRSxFQUFFO29CQUNQLElBQUksSUFBSSxZQUFZLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQzt3QkFDbkMsRUFBRSxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQzt3QkFDaEMsT0FBTyxJQUFJLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQzVDLENBQUM7b0JBQ0QsT0FBTyxJQUFJLENBQUM7Z0JBQ2QsQ0FBQyxFQUNELEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQzNCLENBQUM7WUFDSixDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7QUFDSCxDQUFDO0FBRUQsU0FBUyxxQkFBcUIsQ0FDNUIsUUFBbUIsRUFDbkIsSUFBa0I7SUFNbEIsSUFBSSxDQUFDLENBQUMsSUFBSSxZQUFZLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUM5RixPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFRCxJQUNFLENBQUMsQ0FDQyxJQUFJLENBQUMsUUFBUSxZQUFZLENBQUMsQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLFlBQVksRUFBRSxDQUFDLFdBQVcsQ0FDNUY7UUFDRCxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUN4QyxDQUFDO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRUQsTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQy9CLElBQUksQ0FBQyxDQUFDLElBQUksWUFBWSxDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUUsQ0FBQztRQUMvRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7U0FBTSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQ2xDLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUNELElBQUksQ0FBQyxDQUFDLElBQUksWUFBWSxDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxPQUFPLEVBQUUsQ0FBQztRQUM5RCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFDRCxPQUFPLElBQUksQ0FBQztBQUNkLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIG8gZnJvbSAnLi4vLi4vLi4vLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0IHtJZGVudGlmaWVyc30gZnJvbSAnLi4vLi4vLi4vLi4vcmVuZGVyMy9yM19pZGVudGlmaWVycyc7XG5pbXBvcnQgKiBhcyBpciBmcm9tICcuLi8uLi9pcic7XG5cbmltcG9ydCB0eXBlIHtDb21waWxhdGlvbkpvYn0gZnJvbSAnLi4vY29tcGlsYXRpb24nO1xuXG4vKipcbiAqIGB0cmFja2AgZnVuY3Rpb25zIGluIGBmb3JgIHJlcGVhdGVycyBjYW4gc29tZXRpbWVzIGJlIFwib3B0aW1pemVkLFwiIGkuZS4gdHJhbnNmb3JtZWQgaW50byBpbmxpbmVcbiAqIGV4cHJlc3Npb25zLCBpbiBsaWV1IG9mIGFuIGV4dGVybmFsIGZ1bmN0aW9uIGNhbGwuIEZvciBleGFtcGxlLCB0cmFja2luZyBieSBgJGluZGV4YCBjYW4gYmUgYmVcbiAqIG9wdGltaXplZCBpbnRvIGFuIGlubGluZSBgdHJhY2tCeUluZGV4YCByZWZlcmVuY2UuIFRoaXMgcGhhc2UgY2hlY2tzIHRyYWNrIGV4cHJlc3Npb25zIGZvclxuICogb3B0aW1pemFibGUgY2FzZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvcHRpbWl6ZVRyYWNrRm5zKGpvYjogQ29tcGlsYXRpb25Kb2IpOiB2b2lkIHtcbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC5jcmVhdGUpIHtcbiAgICAgIGlmIChvcC5raW5kICE9PSBpci5PcEtpbmQuUmVwZWF0ZXJDcmVhdGUpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBpZiAob3AudHJhY2sgaW5zdGFuY2VvZiBvLlJlYWRWYXJFeHByICYmIG9wLnRyYWNrLm5hbWUgPT09ICckaW5kZXgnKSB7XG4gICAgICAgIC8vIFRvcC1sZXZlbCBhY2Nlc3Mgb2YgYCRpbmRleGAgdXNlcyB0aGUgYnVpbHQgaW4gYHJlcGVhdGVyVHJhY2tCeUluZGV4YC5cbiAgICAgICAgb3AudHJhY2tCeUZuID0gby5pbXBvcnRFeHByKElkZW50aWZpZXJzLnJlcGVhdGVyVHJhY2tCeUluZGV4KTtcbiAgICAgIH0gZWxzZSBpZiAob3AudHJhY2sgaW5zdGFuY2VvZiBvLlJlYWRWYXJFeHByICYmIG9wLnRyYWNrLm5hbWUgPT09ICckaXRlbScpIHtcbiAgICAgICAgLy8gVG9wLWxldmVsIGFjY2VzcyBvZiB0aGUgaXRlbSB1c2VzIHRoZSBidWlsdCBpbiBgcmVwZWF0ZXJUcmFja0J5SWRlbnRpdHlgLlxuICAgICAgICBvcC50cmFja0J5Rm4gPSBvLmltcG9ydEV4cHIoSWRlbnRpZmllcnMucmVwZWF0ZXJUcmFja0J5SWRlbnRpdHkpO1xuICAgICAgfSBlbHNlIGlmIChpc1RyYWNrQnlGdW5jdGlvbkNhbGwoam9iLnJvb3QueHJlZiwgb3AudHJhY2spKSB7XG4gICAgICAgIC8vIE1hcmsgdGhlIGZ1bmN0aW9uIGFzIHVzaW5nIHRoZSBjb21wb25lbnQgaW5zdGFuY2UgdG8gcGxheSBpdCBzYWZlXG4gICAgICAgIC8vIHNpbmNlIHRoZSBtZXRob2QgbWlnaHQgYmUgdXNpbmcgYHRoaXNgIGludGVybmFsbHkgKHNlZSAjNTM2MjgpLlxuICAgICAgICBvcC51c2VzQ29tcG9uZW50SW5zdGFuY2UgPSB0cnVlO1xuXG4gICAgICAgIC8vIFRvcC1sZXZlbCBtZXRob2QgY2FsbHMgaW4gdGhlIGZvcm0gb2YgYGZuKCRpbmRleCwgaXRlbSlgIGNhbiBiZSBwYXNzZWQgaW4gZGlyZWN0bHkuXG4gICAgICAgIGlmIChvcC50cmFjay5yZWNlaXZlci5yZWNlaXZlci52aWV3ID09PSB1bml0LnhyZWYpIHtcbiAgICAgICAgICAvLyBUT0RPOiB0aGlzIG1heSBiZSB3cm9uZ1xuICAgICAgICAgIG9wLnRyYWNrQnlGbiA9IG9wLnRyYWNrLnJlY2VpdmVyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFRoaXMgaXMgYSBwbGFpbiBtZXRob2QgY2FsbCwgYnV0IG5vdCBpbiB0aGUgY29tcG9uZW50J3Mgcm9vdCB2aWV3LlxuICAgICAgICAgIC8vIFdlIG5lZWQgdG8gZ2V0IHRoZSBjb21wb25lbnQgaW5zdGFuY2UsIGFuZCB0aGVuIGNhbGwgdGhlIG1ldGhvZCBvbiBpdC5cbiAgICAgICAgICBvcC50cmFja0J5Rm4gPSBvXG4gICAgICAgICAgICAuaW1wb3J0RXhwcihJZGVudGlmaWVycy5jb21wb25lbnRJbnN0YW5jZSlcbiAgICAgICAgICAgIC5jYWxsRm4oW10pXG4gICAgICAgICAgICAucHJvcChvcC50cmFjay5yZWNlaXZlci5uYW1lKTtcbiAgICAgICAgICAvLyBCZWNhdXNlIHRoZSBjb250ZXh0IGlzIG5vdCBhdmFpYWJsZSAod2l0aG91dCBhIHNwZWNpYWwgZnVuY3Rpb24pLCB3ZSBkb24ndCB3YW50IHRvXG4gICAgICAgICAgLy8gdHJ5IHRvIHJlc29sdmUgaXQgbGF0ZXIuIExldCdzIGdldCByaWQgb2YgaXQgYnkgb3ZlcndyaXRpbmcgdGhlIG9yaWdpbmFsIHRyYWNrXG4gICAgICAgICAgLy8gZXhwcmVzc2lvbiAod2hpY2ggd29uJ3QgYmUgdXNlZCBhbnl3YXkpLlxuICAgICAgICAgIG9wLnRyYWNrID0gb3AudHJhY2tCeUZuO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBUaGUgdHJhY2sgZnVuY3Rpb24gY291bGQgbm90IGJlIG9wdGltaXplZC5cbiAgICAgICAgLy8gUmVwbGFjZSBjb250ZXh0IHJlYWRzIHdpdGggYSBzcGVjaWFsIElSIGV4cHJlc3Npb24sIHNpbmNlIGNvbnRleHQgcmVhZHMgaW4gYSB0cmFja1xuICAgICAgICAvLyBmdW5jdGlvbiBhcmUgZW1pdHRlZCBzcGVjaWFsbHkuXG4gICAgICAgIG9wLnRyYWNrID0gaXIudHJhbnNmb3JtRXhwcmVzc2lvbnNJbkV4cHJlc3Npb24oXG4gICAgICAgICAgb3AudHJhY2ssXG4gICAgICAgICAgKGV4cHIpID0+IHtcbiAgICAgICAgICAgIGlmIChleHByIGluc3RhbmNlb2YgaXIuQ29udGV4dEV4cHIpIHtcbiAgICAgICAgICAgICAgb3AudXNlc0NvbXBvbmVudEluc3RhbmNlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgcmV0dXJuIG5ldyBpci5UcmFja0NvbnRleHRFeHByKGV4cHIudmlldyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZXhwcjtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGlyLlZpc2l0b3JDb250ZXh0RmxhZy5Ob25lLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBpc1RyYWNrQnlGdW5jdGlvbkNhbGwoXG4gIHJvb3RWaWV3OiBpci5YcmVmSWQsXG4gIGV4cHI6IG8uRXhwcmVzc2lvbixcbik6IGV4cHIgaXMgby5JbnZva2VGdW5jdGlvbkV4cHIgJiB7XG4gIHJlY2VpdmVyOiBvLlJlYWRQcm9wRXhwciAmIHtcbiAgICByZWNlaXZlcjogaXIuQ29udGV4dEV4cHI7XG4gIH07XG59IHtcbiAgaWYgKCEoZXhwciBpbnN0YW5jZW9mIG8uSW52b2tlRnVuY3Rpb25FeHByKSB8fCBleHByLmFyZ3MubGVuZ3RoID09PSAwIHx8IGV4cHIuYXJncy5sZW5ndGggPiAyKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKFxuICAgICEoXG4gICAgICBleHByLnJlY2VpdmVyIGluc3RhbmNlb2Ygby5SZWFkUHJvcEV4cHIgJiYgZXhwci5yZWNlaXZlci5yZWNlaXZlciBpbnN0YW5jZW9mIGlyLkNvbnRleHRFeHByXG4gICAgKSB8fFxuICAgIGV4cHIucmVjZWl2ZXIucmVjZWl2ZXIudmlldyAhPT0gcm9vdFZpZXdcbiAgKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgY29uc3QgW2FyZzAsIGFyZzFdID0gZXhwci5hcmdzO1xuICBpZiAoIShhcmcwIGluc3RhbmNlb2Ygby5SZWFkVmFyRXhwcikgfHwgYXJnMC5uYW1lICE9PSAnJGluZGV4Jykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSBlbHNlIGlmIChleHByLmFyZ3MubGVuZ3RoID09PSAxKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgaWYgKCEoYXJnMSBpbnN0YW5jZW9mIG8uUmVhZFZhckV4cHIpIHx8IGFyZzEubmFtZSAhPT0gJyRpdGVtJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cbiJdfQ==