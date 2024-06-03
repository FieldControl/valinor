import { ICard } from './../../../shared/services/models/quadro.model';
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
import { MatIconModule } from '@angular/material/icon';
import { Subject, switchMap } from 'rxjs';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { CardService } from '../../../shared/services/card.service';
import { QuadroService } from '../../../shared/services/quadro.service';
import { ColunasService } from '../../../shared/services/colunas.service';
import { IColuna } from '../../../shared/services/models/quadro.model';
import { AddCardComponent } from '../components/add-card/add-card.component';
import { EditColunaComponent } from '../components/edit-coluna/edit-coluna.component';
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
  styleUrl: './detalhes.component.css',
})
export class DetalhesComponent implements OnInit {
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

  editColuna(coluna: IColuna) {
    this.matDialog
      .open(EditColunaComponent, { width: '600px', data: { coluna } })
      .afterClosed()
      .subscribe(() => this.refetch$.next());
  }


  addColuna() {
    if (this.colunaForm.invalid) {
      return;
    }

    const _quadro = this.quadro();

    if (!_quadro) {
      return;
    }

    this.colunasService
      .createColuna({
        nome: this.colunaForm.value.nome as string,
        quadroId: _quadro.id,
        ordem: _quadro.colunas?.length || 0,
      })
      .subscribe(() => {
        this.colunaForm.reset();
        this.refetch$.next();
      });
  }

  addOrEditCard(coluna: IColuna, card?: ICard) {
    this.matDialog
      .open(AddCardComponent, {
        width: '600px',
        data: {
          coluna: coluna,
          quadroId: coluna.quadroId,
          card,
        },
      })
      .afterClosed()
      .subscribe((card?: ICard) => {
        card && this.refetch$.next();
      });
  }

  deleteColuna(coluna: IColuna) {
    this.colunasService.deleteColuna(coluna.id).subscribe(() => {
      this.refetch$.next();
    });
  }

  onColunaChange($event: CdkDragDrop<any>): void {
    const _quadro = this.quadro();
    if (!_quadro) return;
    moveItemInArray(
      _quadro.colunas || [],
      $event.previousIndex,
      $event.currentIndex
    );
    this.quadroService
      .updateOrdemColuna({
        quadroId: _quadro.id,
        items:
          _quadro.colunas?.map((coluna, index) => ({
            id: coluna.id,
            ordem: index,
          })) || [],
      })
      .subscribe(() => {
        this.refetch$.next();
      });
    console.log(this.quadro()?.colunas);
  }

  onCardChange($event: CdkDragDrop<any>, coluna: IColuna): void {
    console.log($event, coluna);

    if ($event.previousContainer === $event.container) {
      moveItemInArray(
        coluna.cards || [],
        $event.previousIndex,
        $event.currentIndex
      );
    } else {
      transferArrayItem(
        $event.previousContainer.data,
        $event.container.data,
        $event.previousIndex,
        $event.currentIndex
      );
    }

    // coleta todos os cartões de todas as 
    // colunas do quadro, adicionando a cada cartão o
    //  ID da coluna e a sua ordem dentro da coluna, 
    //  e retorna um array contendo todos esses cartões. 
    //  Se o quadro ou suas colunas não existirem, 
    //  retorna um array vazio.
    const _quadro = this.quadro();
    if (!_quadro) return;

    const cards: ICard[] =
      _quadro.colunas?.reduce((prev: ICard[], current: IColuna) => {
        const cards =
          current.cards?.map((c, idx) => ({
            ...c,
            colunaId: current.id,
            ordem: idx,
          })) || [];

        return [...prev, ...cards];
      }, []) || [];

    this.cardService
      .updateCardOrdemEColunas(_quadro.id, cards)
      .subscribe(() => {
        this.refetch$.next();
      });
  }
}
