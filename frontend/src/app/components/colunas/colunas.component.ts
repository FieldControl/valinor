import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { ColunaService } from '../../services/colunas.service';
import { Colunas } from '../../interfaces/colunas.interface';

@Component({
    selector: 'app-colunas',
    standalone: true,
    templateUrl: './colunas.component.html',
    styleUrls: ['./colunas.component.scss'],
    imports: [CommonModule, CdkDrag]
})
export class ColunasComponent implements OnInit {

  colunas: Colunas[] = [];

  constructor(private colunaService: ColunaService) {}

  ngOnInit(): void {
    this.getColunas();
  }

  getColunas(): void {
    this.colunaService.getColunas().subscribe({
      next: (colunas) => {
        this.colunas = colunas;
      },
      error: (err) => {
        console.log(err);
      }
    });
  }
  /* Criar, atualizar e deletar colunas

  addColuna(coluna: Colunas): void {
    this.colunaService.createColuna(coluna).subscribe({
      next: (newColuna) => {
        this.colunas.push(newColuna);
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  updateColuna(coluna: Colunas): void {
    this.colunaService.updateColuna(coluna.id, coluna).subscribe({
      next: (updatedColuna) => {
        const index = this.colunas.findIndex(c => c.id === coluna.id);
        if (index > -1) {
          this.colunas[index] = updatedColuna;
        }
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  deleteColuna(id: number): void {
    this.colunaService.deleteColuna(id).subscribe({
      next: () => {
        this.colunas = this.colunas.filter(c => c.id !== id);
      },
      error: (err) => {
        console.log(err);
      }
    });
  }  */
}
