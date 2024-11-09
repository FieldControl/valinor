/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
                    op.trackByFn =
                        o.importExpr(Identifiers.componentInstance).callFn([]).prop(op.track.receiver.name);
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
                op.track = ir.transformExpressionsInExpression(op.track, expr => {
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
    if (!(expr instanceof o.InvokeFunctionExpr) || expr.args.length !== 2) {
        return false;
    }
    if (!(expr.receiver instanceof o.ReadPropExpr &&
        expr.receiver.receiver instanceof ir.ContextExpr) ||
        expr.receiver.receiver.view !== rootView) {
        return false;
    }
    const [arg0, arg1] = expr.args;
    if (!(arg0 instanceof o.ReadVarExpr) || arg0.name !== '$index') {
        return false;
    }
    if (!(arg1 instanceof o.ReadVarExpr) || arg1.name !== '$item') {
        return false;
    }
    return true;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhY2tfZm5fb3B0aW1pemF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlL3BpcGVsaW5lL3NyYy9waGFzZXMvdHJhY2tfZm5fb3B0aW1pemF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sS0FBSyxDQUFDLE1BQU0sK0JBQStCLENBQUM7QUFDbkQsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLG9DQUFvQyxDQUFDO0FBQy9ELE9BQU8sS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBSS9COzs7OztHQUtHO0FBQ0gsTUFBTSxVQUFVLGdCQUFnQixDQUFDLEdBQW1CO0lBQ2xELEtBQUssTUFBTSxJQUFJLElBQUksR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzdCLEtBQUssTUFBTSxFQUFFLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzdCLElBQUksRUFBRSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUN6QyxTQUFTO1lBQ1gsQ0FBQztZQUNELElBQUksRUFBRSxDQUFDLEtBQUssWUFBWSxDQUFDLENBQUMsV0FBVyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLFFBQVEsRUFBRSxDQUFDO2dCQUNwRSx5RUFBeUU7Z0JBQ3pFLEVBQUUsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUNoRSxDQUFDO2lCQUFNLElBQUksRUFBRSxDQUFDLEtBQUssWUFBWSxDQUFDLENBQUMsV0FBVyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLE9BQU8sRUFBRSxDQUFDO2dCQUMxRSw0RUFBNEU7Z0JBQzVFLEVBQUUsQ0FBQyxTQUFT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T0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIG8gZnJvbSAnLi4vLi4vLi4vLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0IHtJZGVudGlmaWVyc30gZnJvbSAnLi4vLi4vLi4vLi4vcmVuZGVyMy9yM19pZGVudGlmaWVycyc7XG5pbXBvcnQgKiBhcyBpciBmcm9tICcuLi8uLi9pcic7XG5cbmltcG9ydCB0eXBlIHtDb21waWxhdGlvbkpvYn0gZnJvbSAnLi4vY29tcGlsYXRpb24nO1xuXG4vKipcbiAqIGB0cmFja2AgZnVuY3Rpb25zIGluIGBmb3JgIHJlcGVhdGVycyBjYW4gc29tZXRpbWVzIGJlIFwib3B0aW1pemVkLFwiIGkuZS4gdHJhbnNmb3JtZWQgaW50byBpbmxpbmVcbiAqIGV4cHJlc3Npb25zLCBpbiBsaWV1IG9mIGFuIGV4dGVybmFsIGZ1bmN0aW9uIGNhbGwuIEZvciBleGFtcGxlLCB0cmFja2luZyBieSBgJGluZGV4YCBjYW4gYmUgYmVcbiAqIG9wdGltaXplZCBpbnRvIGFuIGlubGluZSBgdHJhY2tCeUluZGV4YCByZWZlcmVuY2UuIFRoaXMgcGhhc2UgY2hlY2tzIHRyYWNrIGV4cHJlc3Npb25zIGZvclxuICogb3B0aW1pemFibGUgY2FzZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvcHRpbWl6ZVRyYWNrRm5zKGpvYjogQ29tcGlsYXRpb25Kb2IpOiB2b2lkIHtcbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC5jcmVhdGUpIHtcbiAgICAgIGlmIChvcC5raW5kICE9PSBpci5PcEtpbmQuUmVwZWF0ZXJDcmVhdGUpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBpZiAob3AudHJhY2sgaW5zdGFuY2VvZiBvLlJlYWRWYXJFeHByICYmIG9wLnRyYWNrLm5hbWUgPT09ICckaW5kZXgnKSB7XG4gICAgICAgIC8vIFRvcC1sZXZlbCBhY2Nlc3Mgb2YgYCRpbmRleGAgdXNlcyB0aGUgYnVpbHQgaW4gYHJlcGVhdGVyVHJhY2tCeUluZGV4YC5cbiAgICAgICAgb3AudHJhY2tCeUZuID0gby5pbXBvcnRFeHByKElkZW50aWZpZXJzLnJlcGVhdGVyVHJhY2tCeUluZGV4KTtcbiAgICAgIH0gZWxzZSBpZiAob3AudHJhY2sgaW5zdGFuY2VvZiBvLlJlYWRWYXJFeHByICYmIG9wLnRyYWNrLm5hbWUgPT09ICckaXRlbScpIHtcbiAgICAgICAgLy8gVG9wLWxldmVsIGFjY2VzcyBvZiB0aGUgaXRlbSB1c2VzIHRoZSBidWlsdCBpbiBgcmVwZWF0ZXJUcmFja0J5SWRlbnRpdHlgLlxuICAgICAgICBvcC50cmFja0J5Rm4gPSBvLmltcG9ydEV4cHIoSWRlbnRpZmllcnMucmVwZWF0ZXJUcmFja0J5SWRlbnRpdHkpO1xuICAgICAgfSBlbHNlIGlmIChpc1RyYWNrQnlGdW5jdGlvbkNhbGwoam9iLnJvb3QueHJlZiwgb3AudHJhY2spKSB7XG4gICAgICAgIC8vIE1hcmsgdGhlIGZ1bmN0aW9uIGFzIHVzaW5nIHRoZSBjb21wb25lbnQgaW5zdGFuY2UgdG8gcGxheSBpdCBzYWZlXG4gICAgICAgIC8vIHNpbmNlIHRoZSBtZXRob2QgbWlnaHQgYmUgdXNpbmcgYHRoaXNgIGludGVybmFsbHkgKHNlZSAjNTM2MjgpLlxuICAgICAgICBvcC51c2VzQ29tcG9uZW50SW5zdGFuY2UgPSB0cnVlO1xuXG4gICAgICAgIC8vIFRvcC1sZXZlbCBtZXRob2QgY2FsbHMgaW4gdGhlIGZvcm0gb2YgYGZuKCRpbmRleCwgaXRlbSlgIGNhbiBiZSBwYXNzZWQgaW4gZGlyZWN0bHkuXG4gICAgICAgIGlmIChvcC50cmFjay5yZWNlaXZlci5yZWNlaXZlci52aWV3ID09PSB1bml0LnhyZWYpIHtcbiAgICAgICAgICAvLyBUT0RPOiB0aGlzIG1heSBiZSB3cm9uZ1xuICAgICAgICAgIG9wLnRyYWNrQnlGbiA9IG9wLnRyYWNrLnJlY2VpdmVyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFRoaXMgaXMgYSBwbGFpbiBtZXRob2QgY2FsbCwgYnV0IG5vdCBpbiB0aGUgY29tcG9uZW50J3Mgcm9vdCB2aWV3LlxuICAgICAgICAgIC8vIFdlIG5lZWQgdG8gZ2V0IHRoZSBjb21wb25lbnQgaW5zdGFuY2UsIGFuZCB0aGVuIGNhbGwgdGhlIG1ldGhvZCBvbiBpdC5cbiAgICAgICAgICBvcC50cmFja0J5Rm4gPVxuICAgICAgICAgICAgICBvLmltcG9ydEV4cHIoSWRlbnRpZmllcnMuY29tcG9uZW50SW5zdGFuY2UpLmNhbGxGbihbXSkucHJvcChvcC50cmFjay5yZWNlaXZlci5uYW1lKTtcbiAgICAgICAgICAvLyBCZWNhdXNlIHRoZSBjb250ZXh0IGlzIG5vdCBhdmFpYWJsZSAod2l0aG91dCBhIHNwZWNpYWwgZnVuY3Rpb24pLCB3ZSBkb24ndCB3YW50IHRvXG4gICAgICAgICAgLy8gdHJ5IHRvIHJlc29sdmUgaXQgbGF0ZXIuIExldCdzIGdldCByaWQgb2YgaXQgYnkgb3ZlcndyaXRpbmcgdGhlIG9yaWdpbmFsIHRyYWNrXG4gICAgICAgICAgLy8gZXhwcmVzc2lvbiAod2hpY2ggd29uJ3QgYmUgdXNlZCBhbnl3YXkpLlxuICAgICAgICAgIG9wLnRyYWNrID0gb3AudHJhY2tCeUZuO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBUaGUgdHJhY2sgZnVuY3Rpb24gY291bGQgbm90IGJlIG9wdGltaXplZC5cbiAgICAgICAgLy8gUmVwbGFjZSBjb250ZXh0IHJlYWRzIHdpdGggYSBzcGVjaWFsIElSIGV4cHJlc3Npb24sIHNpbmNlIGNvbnRleHQgcmVhZHMgaW4gYSB0cmFja1xuICAgICAgICAvLyBmdW5jdGlvbiBhcmUgZW1pdHRlZCBzcGVjaWFsbHkuXG4gICAgICAgIG9wLnRyYWNrID0gaXIudHJhbnNmb3JtRXhwcmVzc2lvbnNJbkV4cHJlc3Npb24ob3AudHJhY2ssIGV4cHIgPT4ge1xuICAgICAgICAgIGlmIChleHByIGluc3RhbmNlb2YgaXIuQ29udGV4dEV4cHIpIHtcbiAgICAgICAgICAgIG9wLnVzZXNDb21wb25lbnRJbnN0YW5jZSA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm4gbmV3IGlyLlRyYWNrQ29udGV4dEV4cHIoZXhwci52aWV3KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGV4cHI7XG4gICAgICAgIH0sIGlyLlZpc2l0b3JDb250ZXh0RmxhZy5Ob25lKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNUcmFja0J5RnVuY3Rpb25DYWxsKFxuICAgIHJvb3RWaWV3OiBpci5YcmVmSWQsIGV4cHI6IG8uRXhwcmVzc2lvbik6IGV4cHIgaXMgby5JbnZva2VGdW5jdGlvbkV4cHIme1xuICByZWNlaXZlcjogby5SZWFkUHJvcEV4cHIgJlxuICAgICAge1xuICAgICAgICByZWNlaXZlcjogaXIuQ29udGV4dEV4cHJcbiAgICAgIH1cbn0ge1xuICBpZiAoIShleHByIGluc3RhbmNlb2Ygby5JbnZva2VGdW5jdGlvbkV4cHIpIHx8IGV4cHIuYXJncy5sZW5ndGggIT09IDIpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoIShleHByLnJlY2VpdmVyIGluc3RhbmNlb2Ygby5SZWFkUHJvcEV4cHIgJiZcbiAgICAgICAgZXhwci5yZWNlaXZlci5yZWNlaXZlciBpbnN0YW5jZW9mIGlyLkNvbnRleHRFeHByKSB8fFxuICAgICAgZXhwci5yZWNlaXZlci5yZWNlaXZlci52aWV3ICE9PSByb290Vmlldykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGNvbnN0IFthcmcwLCBhcmcxXSA9IGV4cHIuYXJncztcbiAgaWYgKCEoYXJnMCBpbnN0YW5jZW9mIG8uUmVhZFZhckV4cHIpIHx8IGFyZzAubmFtZSAhPT0gJyRpbmRleCcpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKCEoYXJnMSBpbnN0YW5jZW9mIG8uUmVhZFZhckV4cHIpIHx8IGFyZzEubmFtZSAhPT0gJyRpdGVtJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cbiJdfQ==