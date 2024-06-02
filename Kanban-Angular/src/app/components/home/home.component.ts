import { Component, OnInit, Renderer2, ViewEncapsulation, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import {
  CdkDragDrop,
  CdkDragStart,
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
import { Subject, elementAt, filter, mergeMap, switchMap } from 'rxjs';

import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { HeaderComponent } from '../shared/header/header.component';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';
import { SwimlanesService } from '../../services/swinlanes.service';
import { CardService } from '../../services/card.service';
import { BoardService } from '../../services/board.service';
import { ICard, ISwimlane } from '../../Models/board-model';
import { UpdateCardComponent } from '../shared/add-card/update-card.component';
import { EditSwimlaneComponent } from '../shared/edit-swimlane/edit-swimlane.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColorPickerModule } from 'ngx-color-picker';
import { ConfirmComponent } from '../shared/confirm/confirm.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeaderComponent, SidebarComponent, MatButtonModule,
    RouterModule, DragDropModule, MatIconModule,
    ReactiveFormsModule, MatInputModule, MatDialogModule,
    CommonModule, ColorPickerModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private readonly boardService = inject(BoardService); // Injeta o serviço BoardService
  private readonly matDialog = inject(MatDialog); // Injeta o serviço MatDialog
  private readonly swimlaneService = inject(SwimlanesService); // Injeta o serviço SwimlanesService
  private readonly cardService = inject(CardService); // Injeta o serviço CardService
  private readonly activatedRoute = inject(ActivatedRoute); // Injeta o serviço ActivatedRoute
  public color: string = " "; // Define a cor padrão como uma string vazia
  refetch$ = new Subject<void>(); // Define um Subject para refetch

  // Atualiza o signal 'board' com os dados do quadro pelo ID da rota ativa sempre que 'refetch$' emite um novo valor.
  board = toSignal(
    this.refetch$
      .asObservable()
      .pipe(
        switchMap(() =>
          this.boardService.getBoardById(
            this.activatedRoute.snapshot.params['id']
          )
        )
      )
  );
  
  private readonly fb = inject(NonNullableFormBuilder); // Injeta o FormBuilder
  swimlaneForm = this.fb.group({
    name: this.fb.control('', Validators.required), // Define o formulário com controle de nome obrigatório
  });

  ngOnInit(): void {
    this.refetch$.next(); // Dispara uma emissão inicial para carregar os dados do quadro
  }

  editSwimlane(swimlane: ISwimlane) {
    // Abre o diálogo de edição de swimlane e refetch após o fechamento
    this.matDialog
      .open(EditSwimlaneComponent, { data: { swimlane } })
      .afterClosed()
      .subscribe(() => this.refetch$.next());
  }

  onCardChange($event: CdkDragDrop<any>, swimlane: ISwimlane): void {
    // Muda a ordem dos cards dentro de uma swimlane ou entre swimlanes
    if ($event.previousContainer === $event.container) {
      moveItemInArray(
        swimlane.cards || [],
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

    const _board = this.board(); // Obtém o estado atual do quadro
    if (!_board) return;

    const cards: ICard[] =
      _board.swimlanes?.reduce((prev: ICard[], current: ISwimlane) => {
        const cards =
          current.cards?.map((c, idx) => ({
            ...c,
            swimlaneId: current.id,
            order: idx,
          })) || [];

        return [...prev, ...cards];
      }, []) || [];

    // Atualiza a ordem dos cards e swimlanes no servidor
    this.cardService
      .updateCardOrdersAndSwimlanes(_board.id, cards)
      .subscribe(() => {
        this.refetch$.next();
      });
  }

  onSwimlaneChange($event: CdkDragDrop<any>): void {
    // Muda a ordem das swimlanes
    const _board = this.board();
    if (!_board) return;

    moveItemInArray(
      _board.swimlanes || [],
      $event.previousIndex,
      $event.currentIndex
    );

    // Atualiza a ordem das swimlanes no servidor
    this.boardService
      .updateSwimlaneOrder({
        boardId: _board.id,
        items:
          _board.swimlanes?.map((swimlane, index) => ({
            id: swimlane.id,
            order: index,
          })) || [],
      })
      .subscribe(() => {
        this.refetch$.next();
      });
  }

  public createCard(swimlane: ISwimlane) {
    // Cria um novo card na swimlane especificada
    const card: ICard = {
      name: "nome",
      id: 0,
      content: "descrição da tarefa",
      order: swimlane.cards?.length || 0,
      swimlaneId: swimlane.id,
      swimlane : swimlane,
      color: "#ff0000",
      userName : "user",
      quantUsers : 0,
      date : new Date()
    };

    this.cardService
      .createCard(card)
      .subscribe((card: ICard) => {
        this.refetch$.next();
      });
  }

  public deleteCard(card: ICard) {
    // Abre o diálogo de confirmação e deleta o card se confirmado
    this.matDialog
      .open(ConfirmComponent)
      .afterClosed()
      .pipe(
        filter((result) => result),
        mergeMap(() => this.cardService.deleteCard(card.id))
      )
      .subscribe(() => this.refetch$.next());
  }

  public editCard(swimlane: ISwimlane, card: ICard) {
    // Abre o diálogo de edição de card e refetch após o fechamento
    this.matDialog
      .open(UpdateCardComponent, {
        width: '600px',
        data: {
          swimlane: swimlane,
          boardId: swimlane.boardId,
          card,
        },
      })
      .afterClosed()
      .subscribe((card?: ICard) => {
        card && this.refetch$.next();
      });
  }

  public addSwimlane() {
    // Adiciona uma nova swimlane ao quadro
    const _board = this.board();
    if (!_board) return;

    this.swimlaneService
      .createSwimlane({
        name: "A Fazer",
        boardId: _board.id,
        order: _board.swimlanes?.length || 0,
      })
      .subscribe(() => {
        this.swimlaneForm.reset();
        this.refetch$.next();
      });
  }

  public calculateDaysDifference(time: Date): number {
    // Calcula a diferença em dias entre hoje e uma data futura
    let today: Date = new Date();
    let end: Date = new Date(time);
    const timeDiff = end.getTime() - today.getTime();
    return Math.floor(timeDiff / (1000 * 3600 * 24)) + 1;
  }
}
