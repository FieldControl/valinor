import { Module } from '@nestjs/common'; // Importa o módulo do NestJS
import { SwimlaneService } from './swimlane.service'; // Importa o serviço SwimlaneService
import { SwimlaneController } from './swimlane.controller'; // Importa o controlador SwimlaneController
import { TypeOrmModule } from '@nestjs/typeorm'; // Importa o módulo TypeOrmModule do NestJS
import { Swimlane } from './entities/swimlane.entity'; // Importa a entidade Swimlane
import { UserModule } from 'src/user/user.module'; // Importa o módulo UserModule

@Module({ // Define o módulo SwimlaneModule
  controllers: [SwimlaneController], // Define os controladores do módulo
  providers: [SwimlaneService], // Define os provedores do módulo
  imports: [TypeOrmModule.forFeature([Swimlane]), UserModule], // Importa o módulo TypeOrmModule com a entidade Swimlane e o módulo UserModule
  exports: [SwimlaneService], // Exporta o serviço SwimlaneService para que possa ser utilizado em outros módulos
})
export class SwimlaneModule {} // Exporta o módulo SwimlaneModule
