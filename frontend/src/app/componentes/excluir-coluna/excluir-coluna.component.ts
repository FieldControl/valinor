import { Component, OnInit } from '@angular/core';
import { ColunasService } from '../colunas.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Colunas } from '../coluna';

@Component({
  selector: 'app-excluir-coluna',
  templateUrl: './excluir-coluna.component.html',
  styleUrls: ['./excluir-coluna.component.css']
})
export class ExcluirColunaComponent implements OnInit {
  coluna: Colunas = { id: 0, title: '' }; // Remover tarefas

  constructor(
    private service: ColunasService,
     private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      console.log('ID recebido:', id);
      this.service.buscarPorId(+id).subscribe((coluna) => {
        if (coluna) {
          this.coluna = coluna;
          console.log('Coluna encontrada:', this.coluna);
        }
      });
    }
  }
  excluirColuna(): void {
    this.service.excluirColuna(this.coluna.id).subscribe(response => {
      console.log('Coluna excluída:', response);
      this.router.navigate(['/componentes/mural']);
    });
  }

  cancelar(): void {
    this.router.navigate(['/componentes/mural']);
  }
}
