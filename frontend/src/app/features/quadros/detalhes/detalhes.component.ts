import { Component, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';import { Subject, switchMap } from 'rxjs';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { CardService } from '../../../shared/services/card.service';
import { QuadroService } from '../../../shared/services/quadro.service';
import { ColunasService } from '../../../shared/services/colunas.service';
import { IColuna } from '../../../shared/services/models/quadro.model';
@Component({
  selector: 'app-detalhes',
  standalone: true,
  imports: [
    MatButtonModule,
    RouterModule,
    DragDropModule,
    MatIconModule,
    ReactiveFormsModule,
    MatInputModule,
    MatDialogModule,
  ],
  templateUrl: './detalhes.component.html',
  styleUrl: './detalhes.component.css'
})
export class DetalhesComponent implements OnInit{
  private readonly quadroService = inject(QuadroService);
  private readonly matDialog = inject(MatDialog);
  private readonly colunasService = inject(ColunasService);
  private readonly cardService = inject(CardService);
  private readonly activatedRoute = inject(ActivatedRoute);
 
 refetch$ = new Subject<void>();
 private readonly fb = inject(NonNullableFormBuilder);

 quadro = toSignal(
  this.refetch$
    .asObservable()
    .pipe(
      switchMap(() =>
        this.quadroService.getQuadroById(
          this.activatedRoute.snapshot.params['id']
        )
      )
    )
);

 colunaForm = this.fb.group({
  nome: this.fb.control('', Validators.required),
 });

 ngOnInit(): void {
  this.refetch$.next();
}


 addColuna(){
  if(this.colunaForm.invalid){
    return;
  }

  const _quadro = this.quadro();

  if(!_quadro){
    return ;
  }

  this.colunasService.createColuna({
    nome: this.colunaForm.value.nome as string,
    quadroId: _quadro.id,
    ordem: _quadro.colunas?.length || 0,
  })
  .subscribe(() => {
    this.colunaForm.reset();
    this.refetch$.next();
  });

 }


 deleteColuna(coluna: IColuna){
    this.colunasService.deleteColuna(coluna.id).subscribe(()=>{
      this.refetch$.next();
    });
 }
}
