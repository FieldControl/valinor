import { Component, Input, OnInit } from '@angular/core';
import { Colunas } from '../coluna';
import { ColunasService } from '../colunas.service';

@Component({
  selector: 'app-column',
  templateUrl: './column.component.html',
  styleUrls: ['./column.component.css']
})
export class ColumnComponent implements OnInit {
  @Input() coluna!: Colunas; 
  tarefas: any[] = []; 

  constructor(private service: ColunasService) {}

  ngOnInit(): void {
    this.carregarTarefas();
  }

  carregarTarefas(): void {
    this.service.buscarTarefasPorColuna(this.coluna.id).subscribe(tarefas => {
      this.tarefas = tarefas; 
      console.log('Tarefas carregadas:', this.tarefas);
    }, error => {
      console.error('Erro ao carregar tarefas:', error); 
    });
  }
}