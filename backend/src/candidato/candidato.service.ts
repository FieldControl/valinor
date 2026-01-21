import { Injectable } from '@nestjs/common';
import { Candidato } from './entities/candidato.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CandidatoService {
  private candidatos: Candidato[] = [
    { id: '1', nome: 'Eduardo Taino', email: 'edu@teste.com', coluna: 'TODO' },
    { id: '2', nome: 'Maria Silva', email: 'maria@teste.com', coluna: 'DOING' },
  ];

  findAll() {
    return this.candidatos;
  }

  // NOVO: Função para criar
  criarCandidato(nome: string, email: string) {
    const novoCandidato = {
      id: uuidv4(),
      nome: nome,
      email: email,
      coluna: 'TODO', // Todo mundo começa no "A Fazer"
    };
    this.candidatos.push(novoCandidato);
    return novoCandidato;
  }

  moverCandidato(id: string, novaColuna: string) {
    const candidato = this.candidatos.find((c) => c.id === id);
    if (candidato) {
      candidato.coluna = novaColuna;
    }
    return candidato;
  }

  // NOVO: Função para deletar
  removerCandidato(id: string) {
    this.candidatos = this.candidatos.filter((c) => c.id !== id);
    return true;
  }
}