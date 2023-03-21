import { fromCollectionRef } from '../observable/fromRef';
import { distinctUntilChanged, map, pairwise, scan, startWith } from 'rxjs/operators';
/**
 * Return a stream of document changes on a query. These results are not in sort order but in
 * order of occurence.
 */
export function docChanges(query, scheduler) {
    return fromCollectionRef(query, scheduler)
        .pipe(startWith(undefined), pairwise(), map(([priorAction, action]) => {
        const docChanges = action.payload.docChanges();
        const actions = docChanges.map(change => ({ type: change.type, payload: change }));
        // the metadata has changed from the prior emission
        if (priorAction && JSON.stringify(priorAction.payload.metadata) !== JSON.stringify(action.payload.metadata)) {
            // go through all the docs in payload and figure out which ones changed
            action.payload.docs.forEach((currentDoc, currentIndex) => {
                const docChange = docChanges.find(d => d.doc.ref.isEqual(currentDoc.ref));
                const priorDoc = priorAction === null || priorAction === void 0 ? void 0 : priorAction.payload.docs.find(d => d.ref.isEqual(currentDoc.ref));
                if (docChange && JSON.stringify(docChange.doc.metadata) === JSON.stringify(currentDoc.metadata) ||
                    !docChange && priorDoc && JSON.stringify(priorDoc.metadata) === JSON.stringify(currentDoc.metadata)) {
                    // document doesn't appear to have changed, don't log another action
                }
                else {
                    // since the actions are processed in order just push onto the array
                    actions.push({
                        type: 'modified',
                        payload: {
                            oldIndex: currentIndex,
                            newIndex: currentIndex,
                            type: 'modified',
                            doc: currentDoc
                        }
                    });
                }
            });
        }
        return actions;
    }));
}
/**
 * Return a stream of document changes on a query. These results are in sort order.
 */
export function sortedChanges(query, events, scheduler) {
    return docChanges(query, scheduler)
        .pipe(scan((current, changes) => combineChanges(current, changes.map(it => it.payload), events), []), distinctUntilChanged(), // cut down on unneed change cycles
    map(changes => changes.map(c => ({ type: c.type, payload: c }))));
}
/**
 * Combines the total result set from the current set of changes from an incoming set
 * of changes.
 */
export function combineChanges(current, changes, events) {
    changes.forEach(change => {
        // skip unwanted change types
        if (events.indexOf(change.type) > -1) {
            current = combineChange(current, change);
        }
    });
    return current;
}
/**
 * Splice arguments on top of a sliced array, to break top-level ===
 * this is useful for change-detection
 */
function sliceAndSplice(original, start, deleteCount, ...args) {
    const returnArray = original.slice();
    returnArray.splice(start, deleteCount, ...args);
    return returnArray;
}
/**
 * Creates a new sorted array from a new change.
 * Build our own because we allow filtering of action types ('added', 'removed', 'modified') before scanning
 * and so we have greater control over change detection (by breaking ===)
 */
export function combineChange(combined, change) {
    switch (change.type) {
        case 'added':
            if (combined[change.newIndex] && combined[change.newIndex].doc.ref.isEqual(change.doc.ref)) {
                // Not sure why the duplicates are getting fired
            }
            else {
                return sliceAndSplice(combined, change.newIndex, 0, change);
            }
            break;
        case 'modified':
            if (combined[change.oldIndex] == null || combined[change.oldIndex].doc.ref.isEqual(change.doc.ref)) {
                // When an item changes position we first remove it
                // and then add it's new position
                if (change.oldIndex !== change.newIndex) {
                    const copiedArray = combined.slice();
                    copiedArray.splice(change.oldIndex, 1);
                    copiedArray.splice(change.newIndex, 0, change);
                    return copiedArray;
                }
                else {
                    return sliceAndSplice(combined, change.newIndex, 1, change);
                }
            }
            break;
        case 'removed':
            if (combined[change.oldIndex] && combined[change.oldIndex].doc.ref.isEqual(change.doc.ref)) {
                return sliceAndSplice(combined, change.oldIndex, 1);
            }
            break;
    }
    return combined;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbmdlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb21wYXQvZmlyZXN0b3JlL2NvbGxlY3Rpb24vY2hhbmdlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUUxRCxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFJdEY7OztHQUdHO0FBQ0gsTUFBTSxVQUFVLFVBQVUsQ0FBSSxLQUFZLEVBQUUsU0FBeUI7SUFDbkUsT0FBTyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDO1NBQ3ZDLElBQUksQ0FDSCxTQUFTLENBQW9FLFNBQVMsQ0FBQyxFQUN2RixRQUFRLEVBQUUsRUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsRUFBRSxFQUFFO1FBQzVCLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDL0MsTUFBTSxPQUFPLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ25GLG1EQUFtRDtRQUNuRCxJQUFJLFdBQVcsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQzNHLHVFQUF1RTtZQUN2RSxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxVQUFVLEVBQUUsWUFBWSxFQUFF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LE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2lCQUM3RDthQUNGO1lBQ0QsTUFBTTtRQUNSLEtBQUssU0FBUztZQUNaLElBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxRQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQzFGLE9BQU8sY0FBYyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQ3JEO1lBQ0QsTUFBTTtLQUNUO0lBQ0QsT0FBTyxRQUFRLENBQUM7QUFDbEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGZyb21Db2xsZWN0aW9uUmVmIH0gZnJvbSAnLi4vb2JzZXJ2YWJsZS9mcm9tUmVmJztcbmltcG9ydCB7IE9ic2VydmFibGUsIFNjaGVkdWxlckxpa2UgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IGRpc3RpbmN0VW50aWxDaGFuZ2VkLCBtYXAsIHBhaXJ3aXNlLCBzY2FuLCBzdGFydFdpdGggfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQgeyBBY3Rpb24sIFF1ZXJ5U25hcHNob3QsIERvY3VtZW50Q2hhbmdlLCBEb2N1bWVudENoYW5nZUFjdGlvbiwgRG9jdW1lbnRDaGFuZ2VUeXBlLCBRdWVyeSB9IGZyb20gJy4uL2ludGVyZmFjZXMnO1xuaW1wb3J0IGZpcmViYXNlIGZyb20gJ2ZpcmViYXNlL2NvbXBhdC9hcHAnO1xuXG4vKipcbiAqIFJldHVybiBhIHN0cmVhbSBvZiBkb2N1bWVudCBjaGFuZ2VzIG9uIGEgcXVlcnkuIFRoZXNlIHJlc3VsdHMgYXJlIG5vdCBpbiBzb3J0IG9yZGVyIGJ1dCBpblxuICogb3JkZXIgb2Ygb2NjdXJlbmNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZG9jQ2hhbmdlczxUPihxdWVyeTogUXVlcnksIHNjaGVkdWxlcj86IFNjaGVkdWxlckxpa2UpOiBPYnNlcnZhYmxlPERvY3VtZW50Q2hhbmdlQWN0aW9uPFQ+W10+IHtcbiAgcmV0dXJuIGZyb21Db2xsZWN0aW9uUmVmKHF1ZXJ5LCBzY2hlZHVsZXIpXG4gICAgLnBpcGUoXG4gICAgICBzdGFydFdpdGg8QWN0aW9uPFF1ZXJ5U25hcHNob3Q8ZmlyZWJhc2UuZmlyZXN0b3JlLkRvY3VtZW50RGF0YT4+LCB1bmRlZmluZWQ+KHVuZGVmaW5lZCksXG4gICAgICBwYWlyd2lzZSgpLFxuICAgICAgbWFwKChbcHJpb3JBY3Rpb24sIGFjdGlvbl0pID0+IHtcbiAgICAgICAgY29uc3QgZG9jQ2hhbmdlcyA9IGFjdGlvbi5wYXlsb2FkLmRvY0NoYW5nZXMoKTtcbiAgICAgICAgY29uc3QgYWN0aW9ucyA9IGRvY0NoYW5nZXMubWFwKGNoYW5nZSA9PiAoeyB0eXBlOiBjaGFuZ2UudHlwZSwgcGF5bG9hZDogY2hhbmdlIH0pKTtcbiAgICAgICAgLy8gdGhlIG1ldGFkYXRhIGhhcyBjaGFuZ2VkIGZyb20gdGhlIHByaW9yIGVtaXNzaW9uXG4gICAgICAgIGlmIChwcmlvckFjdGlvbiAmJiBKU09OLnN0cmluZ2lmeShwcmlvckFjdGlvbi5wYXlsb2FkLm1ldGFkYXRhKSAhPT0gSlNPTi5zdHJpbmdpZnkoYWN0aW9uLnBheWxvYWQubWV0YWRhdGEpKSB7XG4gICAgICAgICAgLy8gZ28gdGhyb3VnaCBhbGwgdGhlIGRvY3MgaW4gcGF5bG9hZCBhbmQgZmlndXJlIG91dCB3aGljaCBvbmVzIGNoYW5nZWRcbiAgICAgICAgICBhY3Rpb24ucGF5bG9hZC5kb2NzLmZvckVhY2goKGN1cnJlbnREb2MsIGN1cnJlbnRJbmRleCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZG9jQ2hhbmdlID0gZG9jQ2hhbmdlcy5maW5kKGQgPT4gZC5kb2MucmVmLmlzRXF1YWwoY3VycmVudERvYy5yZWYpKTtcbiAgICAgICAgICAgIGNvbnN0IHByaW9yRG9jID0gcHJpb3JBY3Rpb24/LnBheWxvYWQuZG9jcy5maW5kKGQgPT4gZC5yZWYuaXNFcXVhbChjdXJyZW50RG9jLnJlZikpO1xuICAgICAgICAgICAgaWYgKGRvY0NoYW5nZSAmJiBKU09OLnN0cmluZ2lmeShkb2NDaGFuZ2UuZG9jLm1ldGFkYXRhKSA9PT0gSlNPTi5zdHJpbmdpZnkoY3VycmVudERvYy5tZXRhZGF0YSkgfHxcbiAgICAgICAgICAgICAgIWRvY0NoYW5nZSAmJiBwcmlvckRvYyAmJiBKU09OLnN0cmluZ2lmeShwcmlvckRvYy5tZXRhZGF0YSkgPT09IEpTT04uc3RyaW5naWZ5KGN1cnJlbnREb2MubWV0YWRhdGEpKSB7XG4gICAgICAgICAgICAgIC8vIGRvY3VtZW50IGRvZXNuJ3QgYXBwZWFyIHRvIGhhdmUgY2hhbmdlZCwgZG9uJ3QgbG9nIGFub3RoZXIgYWN0aW9uXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBzaW5jZSB0aGUgYWN0aW9ucyBhcmUgcHJvY2Vzc2VkIGluIG9yZGVyIGp1c3QgcHVzaCBvbnRvIHRoZSBhcnJheVxuICAgICAgICAgICAgICBhY3Rpb25zLnB1c2goe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdtb2RpZmllZCcsXG4gICAgICAgICAgICAgICAgcGF5bG9hZDoge1xuICAgICAgICAgICAgICAgICAgb2xkSW5kZXg6IGN1cnJlbnRJbmRleCxcbiAgICAgICAgICAgICAgICAgIG5ld0luZGV4OiBjdXJyZW50SW5kZXgsXG4gICAgICAgICAgICAgICAgICB0eXBlOiAnbW9kaWZpZWQnLFxuICAgICAgICAgICAgICAgICAgZG9jOiBjdXJyZW50RG9jXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYWN0aW9ucyBhcyBEb2N1bWVudENoYW5nZUFjdGlvbjxUPltdO1xuICAgICAgfSksXG4gICk7XG59XG5cbi8qKlxuICogUmV0dXJuIGEgc3RyZWFtIG9mIGRvY3VtZW50IGNoYW5nZXMgb24gYSBxdWVyeS4gVGhlc2UgcmVzdWx0cyBhcmUgaW4gc29ydCBvcmRlci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNvcnRlZENoYW5nZXM8VD4oXG4gIHF1ZXJ5OiBRdWVyeSxcbiAgZXZlbnRzOiBEb2N1bWVudENoYW5nZVR5cGVbXSxcbiAgc2NoZWR1bGVyPzogU2NoZWR1bGVyTGlrZSk6IE9ic2VydmFibGU8RG9jdW1lbnRDaGFuZ2VBY3Rpb248VD5bXT4ge1xuICByZXR1cm4gZG9jQ2hhbmdlczxUPihxdWVyeSwgc2NoZWR1bGVyKVxuICAgIC5waXBlKFxuICAgICAgc2NhbigoY3VycmVudCwgY2hhbmdlcykgPT4gY29tYmluZUNoYW5nZXM8VD4oY3VycmVudCwgY2hhbmdlcy5tYXAoaXQgPT4gaXQucGF5bG9hZCksIGV2ZW50cyksIFtdKSxcbiAgICAgIGRpc3RpbmN0VW50aWxDaGFuZ2VkKCksIC8vIGN1dCBkb3duIG9uIHVubmVlZCBjaGFuZ2UgY3ljbGVzXG4gICAgICBtYXAoY2hhbmdlcyA9PiBjaGFuZ2VzLm1hcChjID0+ICh7IHR5cGU6IGMudHlwZSwgcGF5bG9hZDogYyB9IGFzIERvY3VtZW50Q2hhbmdlQWN0aW9uPFQ+KSkpKTtcbn1cblxuLyoqXG4gKiBDb21iaW5lcyB0aGUgdG90YWwgcmVzdWx0IHNldCBmcm9tIHRoZSBjdXJyZW50IHNldCBvZiBjaGFuZ2VzIGZyb20gYW4gaW5jb21pbmcgc2V0XG4gKiBvZiBjaGFuZ2VzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29tYmluZUNoYW5nZXM8VD4oY3VycmVudDogRG9jdW1lbnRDaGFuZ2U8VD5bXSwgY2hhbmdlczogRG9jdW1lbnRDaGFuZ2U8VD5bXSwgZXZlbnRzOiBEb2N1bWVudENoYW5nZVR5cGVbXSkge1xuICBjaGFuZ2VzLmZvckVhY2goY2hhbmdlID0+IHtcbiAgICAvLyBza2lwIHVud2FudGVkIGNoYW5nZSB0eXBlc1xuICAgIGlmIChldmVudHMuaW5kZXhPZihjaGFuZ2UudHlwZSkgPiAtMSkge1xuICAgICAgY3VycmVudCA9IGNvbWJpbmVDaGFuZ2UoY3VycmVudCwgY2hhbmdlKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gY3VycmVudDtcbn1cblxuLyoqXG4gKiBTcGxpY2UgYXJndW1lbnRzIG9uIHRvcCBvZiBhIHNsaWNlZCBhcnJheSwgdG8gYnJlYWsgdG9wLWxldmVsID09PVxuICogdGhpcyBpcyB1c2VmdWwgZm9yIGNoYW5nZS1kZXRlY3Rpb25cbiAqL1xuZnVuY3Rpb24gc2xpY2VBbmRTcGxpY2U8VD4oXG4gIG9yaWdpbmFsOiBUW10sXG4gIHN0YXJ0OiBudW1iZXIsXG4gIGRlbGV0ZUNvdW50OiBudW1iZXIsXG4gIC4uLmFyZ3M6IFRbXVxuKTogVFtdIHtcbiAgY29uc3QgcmV0dXJuQXJyYXkgPSBvcmlnaW5hbC5zbGljZSgpO1xuICByZXR1cm5BcnJheS5zcGxpY2Uoc3RhcnQsIGRlbGV0ZUNvdW50LCAuLi5hcmdzKTtcbiAgcmV0dXJuIHJldHVybkFycmF5O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgc29ydGVkIGFycmF5IGZyb20gYSBuZXcgY2hhbmdlLlxuICogQnVpbGQgb3VyIG93biBiZWNhdXNlIHdlIGFsbG93IGZpbHRlcmluZyBvZiBhY3Rpb24gdHlwZXMgKCdhZGRlZCcsICdyZW1vdmVkJywgJ21vZGlmaWVkJykgYmVmb3JlIHNjYW5uaW5nXG4gKiBhbmQgc28gd2UgaGF2ZSBncmVhdGVyIGNvbnRyb2wgb3ZlciBjaGFuZ2UgZGV0ZWN0aW9uIChieSBicmVha2luZyA9PT0pXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21iaW5lQ2hhbmdlPFQ+KGNvbWJpbmVkOiBEb2N1bWVudENoYW5nZTxUPltdLCBjaGFuZ2U6IERvY3VtZW50Q2hhbmdlPFQ+KTogRG9jdW1lbnRDaGFuZ2U8VD5bXSB7XG4gIHN3aXRjaCAoY2hhbmdlLnR5cGUpIHtcbiAgICBjYXNlICdhZGRlZCc6XG4gICAgICBpZiAoY29tYmluZWRbY2hhbmdlLm5ld0luZGV4XSAmJiBjb21iaW5lZFtjaGFuZ2UubmV3SW5kZXhdLmRvYy5yZWYuaXNFcXVhbChjaGFuZ2UuZG9jLnJlZikpIHtcbiAgICAgICAgLy8gTm90IHN1cmUgd2h5IHRoZSBkdXBsaWNhdGVzIGFyZSBnZXR0aW5nIGZpcmVkXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gc2xpY2VBbmRTcGxpY2UoY29tYmluZWQsIGNoYW5nZS5uZXdJbmRleCwgMCwgY2hhbmdlKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ21vZGlmaWVkJzpcbiAgICAgIGlmIChjb21iaW5lZFtjaGFuZ2Uub2xkSW5kZXhdID09IG51bGwgfHwgY29tYmluZWRbY2hhbmdlLm9sZEluZGV4XS5kb2MucmVmLmlzRXF1YWwoY2hhbmdlLmRvYy5yZWYpKSB7XG4gICAgICAgIC8vIFdoZW4gYW4gaXRlbSBjaGFuZ2VzIHBvc2l0aW9uIHdlIGZpcnN0IHJlbW92ZSBpdFxuICAgICAgICAvLyBhbmQgdGhlbiBhZGQgaXQncyBuZXcgcG9zaXRpb25cbiAgICAgICAgaWYgKGNoYW5nZS5vbGRJbmRleCAhPT0gY2hhbmdlLm5ld0luZGV4KSB7XG4gICAgICAgICAgY29uc3QgY29waWVkQXJyYXkgPSBjb21iaW5lZC5zbGljZSgpO1xuICAgICAgICAgIGNvcGllZEFycmF5LnNwbGljZShjaGFuZ2Uub2xkSW5kZXgsIDEpO1xuICAgICAgICAgIGNvcGllZEFycmF5LnNwbGljZShjaGFuZ2UubmV3SW5kZXgsIDAsIGNoYW5nZSk7XG4gICAgICAgICAgcmV0dXJuIGNvcGllZEFycmF5O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBzbGljZUFuZFNwbGljZShjb21iaW5lZCwgY2hhbmdlLm5ld0luZGV4LCAxLCBjaGFuZ2UpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdyZW1vdmVkJzpcbiAgICAgIGlmIChjb21iaW5lZFtjaGFuZ2Uub2xkSW5kZXhdICYmIGNvbWJpbmVkW2NoYW5nZS5vbGRJbmRleF0uZG9jLnJlZi5pc0VxdWFsKGNoYW5nZS5kb2MucmVmKSkge1xuICAgICAgICByZXR1cm4gc2xpY2VBbmRTcGxpY2UoY29tYmluZWQsIGNoYW5nZS5vbGRJbmRleCwgMSk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgfVxuICByZXR1cm4gY29tYmluZWQ7XG59XG4iXX0=