import {Module} from '@nestjs/common';
import { TarefaController } from 'controllers/tarefa.controller';
import { TarefaService } from 'services/tarefa.service';


@Module({
    imports: [],
    controllers: [TarefaController],
    providers: [TarefaService],
})

export class AppModule {}