import { Module } from '@nestjs/common'; // Importa o módulo principal do NestJS
import { CardService } from './card.service'; // Importa o serviço de cartão
import { CardController } from './card.controller'; // Importa o controlador de cartão
import { TypeOrmModule } from '@nestjs/typeorm'; // Importa o módulo TypeORM para integração com banco de dados
import { Card } from './entities/card.entity'; // Importa a entidade de cartão
import { SwimlaneModule } from 'src/swimlane/swimlane.module'; // Importa o módulo de swimlane
import { UserModule } from 'src/user/user.module'; // Importa o módulo de usuário

@Module({ // Define o módulo de card
  controllers: [CardController], // Define os controladores que serão usados neste módulo
  providers: [CardService], // Define os provedores (serviços) que serão usados neste módulo
  imports: [TypeOrmModule.forFeature([Card]), SwimlaneModule, UserModule], // Importa o módulo TypeORM com a entidade Card, além dos módulos de swimlane e usuário
})
export class CardModule {} // Exporta o módulo de cartão para ser usado em outras partes da aplicação
