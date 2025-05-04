"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createColumn = void 0;
async function createColumn(title) {
    const newColumn = { id: Date.now(), title, cards: [] }; // Ensure `id` is a number
    return newColumn;
}
exports.createColumn = createColumn;
// backend/src/main.ts
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors(); // Enable CORS
    await app.listen(3000); // Ensure the server listens on port 3000
}
bootstrap();
