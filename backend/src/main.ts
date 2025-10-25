import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/allExceptionsFilter';
import { SessionMiddleware } from './session.midleware';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.use(new SessionMiddleware().use);
  
  app.enableCors({
    origin: ["http://localhost:4200", "https://kanban-val-client.netlify.app"],
    credentials: true,  
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true
    })
  );

  app.useGlobalFilters(app.get(AllExceptionsFilter));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
