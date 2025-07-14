// O NestFactory é usado para criar uma instância da aplicação Nest.
import { NestFactory } from '@nestjs/core';

// O AppModule é o módulo raiz da nossa aplicação, que importa todos os outros módulos.
import { AppModule } from './app.module';

/**
 * A função 'bootstrap' é o ponto de entrada da nossa aplicação.
 * Ela é assíncrona para que possamos usar 'await' e garantir que
 * a aplicação só comece a escutar por requisições depois de estar totalmente configurada.
 */
async function bootstrap() {
  // 1. Cria a instância da aplicação NestJS, usando nosso módulo raiz (AppModule).
  const app = await NestFactory.create(AppModule);

  // 2. Habilita o CORS (Cross-Origin Resource Sharing).
  //    Esta linha é ESSENCIAL para permitir que nosso frontend (rodando em localhost:4200)
  //    faça requisições para o nosso backend (rodando em localhost:3000).
  //    Sem isso, o navegador bloquearia as chamadas por segurança.
  app.enableCors();

  // 3. Inicia o servidor para escutar por requisições HTTP.
  //    - `process.env.PORT`: Em um ambiente de produção (como Heroku, Vercel, etc.),
  //      o provedor de hospedagem define a porta através de uma variável de ambiente.
  //      Nosso código inteligentemente usa essa porta se ela existir.
  //    - `?? 3000`: Se a variável de ambiente não existir (como no nosso ambiente local),
  //      ele usa a porta 3000 como padrão.
  await app.listen(process.env.PORT ?? 3000);
}

// 4. Chama a função bootstrap para iniciar todo o processo.
bootstrap();