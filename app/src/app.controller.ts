import { Controller, Get } from '@nestjs/common'; // Importa os decorators Controller e Get do NestJS
import { AppService } from './app.service'; // Importa o AppService, que contém a lógica de negócio

@Controller() // Define a classe como um controlador
export class AppController { // Exporta a classe AppController
  constructor(private readonly appService: AppService) {} // Injetando o AppService no construtor

  @Get() // Define o método como um manipulador de requisições GET
  getHello(): string { // Define o método getHello que retorna uma string
    return this.appService.getHello(); // Chama o método getHello do AppService e retorna seu resultado
  }
}