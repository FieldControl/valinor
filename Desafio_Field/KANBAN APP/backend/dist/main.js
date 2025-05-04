"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/main.ts
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors(); // Habilita CORS para comunicação com o frontend
    await app.listen(3000);
}
bootstrap();
