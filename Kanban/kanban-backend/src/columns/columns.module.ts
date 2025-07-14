import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColumnsService } from './columns.service';
import { ColumnsController } from './columns.controller';
import { Column } from './entities/column.entity';

/**
 * O decorator @Module() transforma uma classe comum em um módulo do NestJS.
 * Ele organiza o código relacionado a uma funcionalidade específica.
 */
@Module({
  
  imports: [TypeOrmModule.forFeature([Column])],

  // 'controllers': Lista todos os controllers que pertencem a este módulo.
  // Os controllers são responsáveis por receber as requisições HTTP e enviar as respostas.
  controllers: [ColumnsController],

  // 'providers': Lista todos os serviços que serão "injetáveis" dentro deste módulo.
  // Os serviços contêm a lógica de negócio principal. O ColumnsController, por exemplo,
  // usará o ColumnsService para criar, listar ou deletar colunas.
  providers: [ColumnsService],
})
export class ColumnsModule {}