"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commitChanges = exports.createChangeRecorder = exports.createRemoveChange = exports.createReplaceChange = exports.ReplaceChange = exports.RemoveChange = exports.InsertChange = exports.NoopChange = void 0;
/**
 * An operation that does nothing.
 */
var NoopChange = /** @class */ (function () {
    function NoopChange() {
        this.description = 'No operation.';
        this.order = Infinity;
        this.path = null;
    }
    NoopChange.prototype.apply = function () {
        return Promise.resolve();
    };
    return NoopChange;
}());
exports.NoopChange = NoopChange;
/**
 * Will add text to the source code.
 */
var InsertChange = /** @class */ (function () {
    function InsertChange(path, pos, toAdd) {
        this.path = path;
        this.pos = pos;
        this.toAdd = toAdd;
        if (pos < 0) {
            throw new Error('Negative positions are invalid');
        }
        this.description = "Inserted ".concat(toAdd, " into position ").concat(pos, " of ").concat(path);
        this.order = pos;
    }
    /**
     * This method does not insert spaces if there is none in the original string.
     */
    InsertChange.prototype.apply = function (host) {
        var _this = this;
        return host.read(this.path).then(function (content) {
            var prefix = content.substring(0, _this.pos);
            var suffix = content.substring(_this.pos);
            return host.write(_this.path, "".concat(prefix).concat(_this.toAdd).concat(suffix));
        });
    };
    return InsertChange;
}());
exports.InsertChange = InsertChange;
/**
 * Will remove text from the source code.
 */
var RemoveChange = /** @class */ (function () {
    function RemoveChange(path, pos, end) {
        this.path = path;
        this.pos = pos;
        this.end = end;
        if (pos < 0 || end < 0) {
            throw new Error('Negative positions are invalid');
        }
        this.description = "Removed text in position ".concat(pos, " to ").concat(end, " of ").concat(path);
        this.order = pos;
    }
    RemoveChange.prototype.apply = function (host) {
        var _this = this;
        return host.read(this.path).then(function (content) {
            var prefix = content.substring(0, _this.pos);
            var suffix = content.substring(_this.end);
            // TODO: throw error if toRemove doesn't match removed string.
            return host.write(_this.path, "".concat(prefix).concat(suffix));
        });
    };
    return RemoveChange;
}());
exports.RemoveChange = RemoveChange;
/**
 * Will replace text from the source code.
 */
var ReplaceChange = /** @class */ (function () {
    function ReplaceChange(path, pos, oldText, newText) {
        this.path = path;
        this.pos = pos;
        this.oldText = oldText;
        this.newText = newText;
        if (pos < 0) {
            throw new Error('Negative positions are invalid');
        }
        this.description = "Replaced ".concat(oldText, " into position ").concat(pos, " of ").concat(path, " with ").concat(newText);
        this.order = pos;
    }
    ReplaceChange.prototype.apply = function (host) {
        var _this = this;
        return host.read(this.path).then(function (content) {
            var prefix = content.substring(0, _this.pos);
            var suffix = content.substring(_this.pos + _this.oldText.length);
            var text = content.substring(_this.pos, _this.pos + _this.oldText.length);
            if (text !== _this.oldText) {
                return Promise.reject(new Error("Invalid replace: \"".concat(text, "\" != \"").concat(_this.oldText, "\".")));
            }
            // TODO: throw error if oldText doesn't match removed string.
            return host.write(_this.path, "".concat(prefix).concat(_this.newText).concat(suffix));
        });
    };
    return ReplaceChange;
}());
exports.ReplaceChange = ReplaceChange;
function createReplaceChange(sourceFile, node, oldText, newText) {
    return new ReplaceChange(sourceFile.fileName, node.getStart(sourceFile), oldText, newText);
}
exports.createReplaceChange = createReplaceChange;
function createRemoveChange(sourceFile, node, from, to) {
    if (from === void 0) { from = node.getStart(sourceFile); }
    if (to === void 0) { to = node.getEnd(); }
    return new RemoveChange(sourceFile.fileName, from, to);
}
exports.createRemoveChange = createRemoveChange;
function createChangeRecorder(tree, path, changes) {
    var e_1, _a;
    var recorder = tree.beginUpdate(path);
    try {
        for (var changes_1 = __values(changes), changes_1_1 = changes_1.next(); !changes_1_1.done; changes_1_1 = changes_1.next()) {
            var change = changes_1_1.value;
            if (change instanceof InsertChange) {
                recorder.insertLeft(change.pos, change.toAdd);
            }
            else if (change instanceof RemoveChange) {
                recorder.remove(change.pos, change.end - change.pos);
            }
            else if (change instanceof ReplaceChange) {
                recorder.remove(change.pos, change.oldText.length);
                recorder.insertLeft(change.pos, change.newText);
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (changes_1_1 && !changes_1_1.done && (_a = changes_1.return)) _a.call(changes_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return recorder;
}
exports.createChangeRecorder = createChangeRecorder;
function commitChanges(tree, path, changes) {
    if (changes.length === 0) {
        return false;
    }
    var recorder = createChangeRecorder(tree, path, changes);
    tree.commitUpdate(recorder);
    return true;
}
exports.commitChanges = commitChanges;
//# sourceMappingURL=change.js.map