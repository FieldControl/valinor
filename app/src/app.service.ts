import { Injectable } from '@nestjs/common'; // Importa o decorator Injectable do NestJS

@Injectable() // Define a classe como injetável, permitindo que seja usada em outros lugares
export class AppService { // Exporta a classe AppService
  getHello(): string { // Define o método getHello que retorna uma string
    return 'Hello World!';
  }
}
