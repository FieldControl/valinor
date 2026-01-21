import { Module } from '@nestjs/common';
import { CandidatoService } from './candidato.service';
import { CandidatoResolver } from './candidato.resolver';

@Module({
  providers: [CandidatoResolver, CandidatoService],
})
export class CandidatoModule {}
