import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * Controller raiz com rota de exemplo.
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /** Rota de exemplo para retornar mensagem */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
