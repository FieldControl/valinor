import { Component, OnInit } from '@angular/core';
import { ColunasService } from '../colunas.service';
import { Colunas } from '../coluna';

@Component({
  selector: 'app-mural',
  templateUrl: './mural.component.html',
  styleUrls: ['./mural.component.css']
})
export class MuralComponent implements OnInit {

  listaColunas: Colunas[] = [];

  constructor(private service: ColunasService) { }

  ngOnInit(): void {
    this.service.listar().subscribe(
      (listaColunas) => {
        console.log('Fetched columns:', listaColunas);
        this.listaColunas = listaColunas;
      },
      (error) => {
        console.error('Error fetching columns:', error);
      }
    );
  }
}
