/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ir from '../../ir';
const REPLACEMENTS = new Map([
    [ir.OpKind.ElementEnd, [ir.OpKind.ElementStart, ir.OpKind.Element]],
    [ir.OpKind.ContainerEnd, [ir.OpKind.ContainerStart, ir.OpKind.Container]],
    [ir.OpKind.I18nEnd, [ir.OpKind.I18nStart, ir.OpKind.I18n]],
]);
/**
 * Op kinds that should not prevent merging of start/end ops.
 */
const IGNORED_OP_KINDS = new Set([ir.OpKind.Pipe]);
/**
 * Replace sequences of mergable instructions (e.g. `ElementStart` and `ElementEnd`) with a
 * consolidated instruction (e.g. `Element`).
 */
export function collapseEmptyInstructions(job) {
    for (const unit of job.units) {
        for (const op of unit.create) {
            // Find end ops that may be able to be merged.
            const opReplacements = REPLACEMENTS.get(op.kind);
            if (opReplacements === undefined) {
                continue;
            }
            const [startKind, mergedKind] = opReplacements;
            // Locate the previous (non-ignored) op.
            let prevOp = op.prev;
            while (prevOp !== null && IGNORED_OP_KINDS.has(prevOp.kind)) {
                prevOp = prevOp.prev;
            }
            // If the previous op is the corresponding start op, we can megre.
            if (prevOp !== null && prevOp.kind === startKind) {
                // Transmute the start instruction to the merged version. This is safe as they're designed
                // to be identical apart from the `kind`.
                prevOp.kind = mergedKind;
                // Remove the end instruction.
                ir.OpList.remove(op);
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1wdHlfZWxlbWVudHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvdGVtcGxhdGUvcGlwZWxpbmUvc3JjL3BoYXNlcy9lbXB0eV9lbGVtZW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUcvQixNQUFNLFlBQVksR0FBRyxJQUFJLEdBQUcsQ0FBb0M7SUFDOUQsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDbkUsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDekUsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDM0QsQ0FBQyxDQUFDO0FBRUg7O0dBRUc7QUFDSCxNQUFNLGdCQUFnQixHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBRW5EOzs7R0FHRztBQUNILE1BQU0sVUFBVSx5QkFBeUIsQ0FBQyxHQUFtQjtJQUMzRCxLQUFLLE1BQU0sSUFBSSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QixLQUFLLE1BQU0sRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM3Qiw4Q0FBOEM7WUFDOUMsTUFBTSxjQUFjLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDakQsSUFBSSxjQUFjLEtBQUssU0FBUyxFQUFFLENBQUM7Z0JBQ2pDLFNBQVM7WUFDWCxDQUFDO1lBQ0QsTUFBTSxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsR0FBRyxjQUFjLENBQUM7WUFFL0Msd0NBQXdDO1lBQ3hDLElBQUksTUFBTSxHQUFxQixFQUFFLENBQUMsSUFBSSxDQUFDO1lBQ3ZDLE9BQU8sTUFBTSxLQUFLLElBQUksSUFBSSxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQzVELE1BQU0sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ3ZCLENBQUM7WUFFRCxrRUFBa0U7WUFDbEUsSUFBSSxNQUFNLEtBQUssSUFBSSxJQUFJLE1BQU0sQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFLENBQUM7Z0JBQ2pELDBGQUEwRjtnQkFDMUYseUNBQXlDO2dCQUN4QyxNQUE2QixDQUFDLElBQUksR0FBRyxVQUFVLENBQUM7Z0JBRWpELDhCQUE4QjtnQkFDOUIsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQWMsRUFBRSxDQUFDLENBQUM7WUFDcEMsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBpciBmcm9tICcuLi8uLi9pcic7XG5pbXBvcnQgdHlwZSB7Q29tcGlsYXRpb25Kb2J9IGZyb20gJy4uL2NvbXBpbGF0aW9uJztcblxuY29uc3QgUkVQTEFDRU1FTlRTID0gbmV3IE1hcDxpci5PcEtpbmQsIFtpci5PcEtpbmQsIGlyLk9wS2luZF0+KFtcbiAgW2lyLk9wS2luZC5FbGVtZW50RW5kLCBbaXIuT3BLaW5kLkVsZW1lbnRTdGFydCwgaXIuT3BLaW5kLkVsZW1lbnRdXSxcbiAgW2lyLk9wS2luZC5Db250YWluZXJFbmQsIFtpci5PcEtpbmQuQ29udGFpbmVyU3RhcnQsIGlyLk9wS2luZC5Db250YWluZXJdXSxcbiAgW2lyLk9wS2luZC5JMThuRW5kLCBbaXIuT3BLaW5kLkkxOG5TdGFydCwgaXIuT3BLaW5kLkkxOG5dXSxcbl0pO1xuXG4vKipcbiAqIE9wIGtpbmRzIHRoYXQgc2hvdWxkIG5vdCBwcmV2ZW50IG1lcmdpbmcgb2Ygc3RhcnQvZW5kIG9wcy5cbiAqL1xuY29uc3QgSUdOT1JFRF9PUF9LSU5EUyA9IG5ldyBTZXQoW2lyLk9wS2luZC5QaXBlXSk7XG5cbi8qKlxuICogUmVwbGFjZSBzZXF1ZW5jZXMgb2YgbWVyZ2FibGUgaW5zdHJ1Y3Rpb25zIChlLmcuIGBFbGVtZW50U3RhcnRgIGFuZCBgRWxlbWVudEVuZGApIHdpdGggYVxuICogY29uc29saWRhdGVkIGluc3RydWN0aW9uIChlLmcuIGBFbGVtZW50YCkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb2xsYXBzZUVtcHR5SW5zdHJ1Y3Rpb25zKGpvYjogQ29tcGlsYXRpb25Kb2IpOiB2b2lkIHtcbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC5jcmVhdGUpIHtcbiAgICAgIC8vIEZpbmQgZW5kIG9wcyB0aGF0IG1heSBiZSBhYmxlIHRvIGJlIG1lcmdlZC5cbiAgICAgIGNvbnN0IG9wUmVwbGFjZW1lbnRzID0gUkVQTEFDRU1FTlRTLmdldChvcC5raW5kKTtcbiAgICAgIGlmIChvcFJlcGxhY2VtZW50cyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgY29uc3QgW3N0YXJ0S2luZCwgbWVyZ2VkS2luZF0gPSBvcFJlcGxhY2VtZW50cztcblxuICAgICAgLy8gTG9jYXRlIHRoZSBwcmV2aW91cyAobm9uLWlnbm9yZWQpIG9wLlxuICAgICAgbGV0IHByZXZPcDogaXIuQ3JlYXRlT3B8bnVsbCA9IG9wLnByZXY7XG4gICAgICB3aGlsZSAocHJldk9wICE9PSBudWxsICYmIElHTk9SRURfT1BfS0lORFMuaGFzKHByZXZPcC5raW5kKSkge1xuICAgICAgICBwcmV2T3AgPSBwcmV2T3AucHJldjtcbiAgICAgIH1cblxuICAgICAgLy8gSWYgdGhlIHByZXZpb3VzIG9wIGlzIHRoZSBjb3JyZXNwb25kaW5nIHN0YXJ0IG9wLCB3ZSBjYW4gbWVncmUuXG4gICAgICBpZiAocHJldk9wICE9PSBudWxsICYmIHByZXZPcC5raW5kID09PSBzdGFydEtpbmQpIHtcbiAgICAgICAgLy8gVHJhbnNtdXRlIHRoZSBzdGFydCBpbnN0cnVjdGlvbiB0byB0aGUgbWVyZ2VkIHZlcnNpb24uIFRoaXMgaXMgc2FmZSBhcyB0aGV5J3JlIGRlc2lnbmVkXG4gICAgICAgIC8vIHRvIGJlIGlkZW50aWNhbCBhcGFydCBmcm9tIHRoZSBga2luZGAuXG4gICAgICAgIChwcmV2T3AgYXMgaXIuT3A8aXIuQ3JlYXRlT3A+KS5raW5kID0gbWVyZ2VkS2luZDtcblxuICAgICAgICAvLyBSZW1vdmUgdGhlIGVuZCBpbnN0cnVjdGlvbi5cbiAgICAgICAgaXIuT3BMaXN0LnJlbW92ZTxpci5DcmVhdGVPcD4ob3ApO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19