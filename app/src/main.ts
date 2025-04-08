import { NestFactory } from '@nestjs/core'; // Importa o NestFactory, que é usado para criar a aplicação NestJS
import { AppModule } from './app.module'; // Importa o AppModule, que é o módulo raiz da aplicação

async function main() { // Define uma função assíncrona chamada main
  const app = await NestFactory.create(AppModule); // Cria uma instância da aplicação NestJS usando o AppModule
  await app.listen(process.env.PORT ?? 3000); // Inicia o servidor na porta definida na variável de ambiente PORT ou na porta 3000 por padrão
}

main(); // Chama a função main para iniciar a aplicação
