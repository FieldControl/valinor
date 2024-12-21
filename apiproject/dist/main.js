"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const prisma_service_1 = require("./database/prisma.service");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const prismaService = app.get(prisma_service_1.PrismaService);
    await prismaService.enableShutdownHooks(app);
    const corsOptions = {
        origin: "http://localhost:4200",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    };
    app.enableCors(corsOptions);
    await app.listen(process.env.PORT ?? 3333);
}
bootstrap();
//# sourceMappingURL=main.js.map