import { Injectable } from '@nestjs/common';

//Objeto da API

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
