import { Injectable } from '@nestjs/common';

/** Serviço simples de exemplo usado pela rota raiz */
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
