"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KanbanService = void 0;
class KanbanService {
    // Add your methods here
    async createColumn(title) {
        // Implement the logic to create a column
        const newColumn = { id: Date.now().toString(), title };
        return newColumn;
    }
}
exports.KanbanService = KanbanService;
