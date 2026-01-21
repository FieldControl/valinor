import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { CandidatoService } from './candidato.service';
import { Candidato } from './entities/candidato.entity';

@Resolver(() => Candidato)
export class CandidatoResolver {
  constructor(private readonly candidatoService: CandidatoService) {}

  @Query(() => [Candidato], { name: 'candidatos' })
  findAll() {
    return this.candidatoService.findAll();
  }

  // ROTA DE CRIAR
  @Mutation(() => Candidato)
  criarCandidato(
    @Args('nome') nome: string,
    @Args('email') email: string,
  ) {
    return this.candidatoService.criarCandidato(nome, email);
  }

  // ROTA DE MOVER
  @Mutation(() => Candidato)
  moverCandidato(
    @Args('id') id: string, 
    @Args('novaColuna') novaColuna: string
  ) {
    return this.candidatoService.moverCandidato(id, novaColuna);
  }

  // ROTA DE DELETAR
  @Mutation(() => Boolean)
  removerCandidato(@Args('id') id: string) {
    return this.candidatoService.removerCandidato(id);
  }
}