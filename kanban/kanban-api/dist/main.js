"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_module_1 = require("./infra/modules/app.module");
const core_1 = require("@nestjs/core");
const helmet_1 = require("helmet");
const dotenv = require("dotenv");
async function bootstrap() {
    dotenv.config();
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, helmet_1.default)());
    app.enableCors();
    await app.listen(3000);
}
bootstrap();
//# sourceMappingURL=main.js.map