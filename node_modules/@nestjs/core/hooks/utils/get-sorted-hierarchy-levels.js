"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSortedHierarchyLevels = getSortedHierarchyLevels;
function getSortedHierarchyLevels(groups, order = 'ASC') {
    const comparator = order === 'ASC'
        ? (a, b) => a - b
        : (a, b) => b - a;
    const levels = Array.from(groups.keys()).sort(comparator);
    return levels;
}
