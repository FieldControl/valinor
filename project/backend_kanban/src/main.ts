import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

/**
 * Bootstrap da aplicação NestJS.
 * Habilita CORS por padrão e usa a porta em `process.env.PORT` ou 3000.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
