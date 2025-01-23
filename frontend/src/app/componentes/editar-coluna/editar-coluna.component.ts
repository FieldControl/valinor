import { Component, OnInit } from '@angular/core';
import { ColunasService } from '../colunas.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Colunas } from '../coluna';

@Component({
  selector: 'app-editar-coluna',
  templateUrl: './editar-coluna.component.html',
  styleUrls: ['./editar-coluna.component.css']
})
export class EditarColunaComponent implements OnInit {
  coluna: Colunas = { id: 0, title: '' }; 

  constructor(private colunasService: ColunasService, 
    private router: Router,
    private route: ActivatedRoute) { }

    ngOnInit(): void {
      const id = this.route.snapshot.paramMap.get('id')
      this.colunasService.buscarPorId(parseInt(id!)).subscribe((coluna) =>{
        this.coluna = coluna
      })
    }

  editarColuna(): void {
    this.colunasService.editarColuna(this.coluna).subscribe(response => {
      console.log('Coluna editada:', response);
      this.router.navigate(['/componentes/mural']);
    });
  }

  cancelar(): void {
    this.router.navigate(['/componentes/mural']);
  }
}
