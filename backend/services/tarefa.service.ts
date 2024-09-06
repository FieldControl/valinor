import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class TarefaService {
  private readonly tarefasFile = 'tarefas.json';
  getAllTarefas() {
    const data = fs.readFileSync(this.tarefasFile, 'utf8');
    return JSON.parse(data);
  }
  
}