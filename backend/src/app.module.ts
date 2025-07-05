import { ColunasModule } from './colunas/colunas.module';
import {Module} from "@nestjs/common";

@Module({
    imports: [ColunasModule],
})
export class AppModule {}
