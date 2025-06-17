"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
    }));
    app.enableCors({
        origin: ['http://localhost:4200', 'https://jairomatheus89.site'],
        credentials: true,
    });
    await app.listen(3000, '0.0.0.0');
}
bootstrap();
//# sourceMappingURL=main.js.map