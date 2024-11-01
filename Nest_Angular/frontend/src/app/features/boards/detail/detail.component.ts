import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { BoardService } from '../../../shared/services/board.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { SwimlanesService } from '../../../shared/services/swimlanes.service';
import { Subject, switchMap } from 'rxjs';
import { ICard, ISwimlane } from '../../../shared/models/board.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddCardComponent } from '../components/add-card/add-card.component';
import { CardService } from '../../../shared/services/card.service';
import { ConfirmComponent } from '../../../shared/ui/confirm/confirm.component';
import { EditSwimlaneComponent } from '../components/edit-swimlane/edit-swimlane.component';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [MatButtonModule, RouterModule, DragDropModule, ReactiveFormsModule, MatInputModule, MatDialogModule, MatIconModule],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
})
export class DetailComponent implements OnInit {
  private readonly boardService = inject(BoardService);
  private readonly matDialog = inject(MatDialog);
  private readonly swimlaneService = inject(SwimlanesService);
  private readonly cardService = inject(CardService);
  private readonly activatedRoute = inject(ActivatedRoute);
  refetch$ = new Subject<void>();
  board = toSignal(
    this.refetch$
      .asObservable()
      .pipe(
        switchMap(() =>
          this.boardService.getBoardById(
            this.activatedRoute.snapshot.params['id']
          )))
  );

  // criar ou editar seção
  private readonly fb = inject(NonNullableFormBuilder);
  swimlaneForm = this.fb.group({
    nome: this.fb.control('', Validators.required),
  });

  ngOnInit() {
    this.refetch$.next();
  }

  // editar seção
  editarSwimlane(swimlane: ISwimlane) {
    this.matDialog.open(EditSwimlaneComponent, {
      width: '600px',
      data: { swimlane }
    }).afterClosed().subscribe(() => this.refetch$.next());
  }

  

  //  Manipula a mudança de posição de um card dentro de um swimlane ou entre swimlanes.
  //  O método verifica se o card foi movido dentro do mesmo container ou para um container diferente.
  //  Se for dentro do mesmo container, a ordem dos cards é atualizada.
  //  Se for para um container diferente, o card é transferido para o novo container.
  //  Após a movimentação, a ordem dos cards e os swimlanes são atualizados no backend.
  aoMudarCard($event: CdkDragDrop<any>, swimlane: ISwimlane): void {
    console.log($event, swimlane);
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
      )
    }

    const _board = this.board();
    if (!_board) return;

    const cards: ICard[] = _board.swimlanes?.reduce(
      (prev: ICard[], current: ISwimlane) => {
        const cards =
          current.cards?.map((c, idx) => ({
            ...c,
            swimlaneId: current.id,
            ordem: idx,
          })) ||
          [];

        return [...prev, ...cards];
      }, []) || [];

    console.log(this.board())
    this.cardService.updateCardOrderAndSwimlanes(_board.id, cards).subscribe(() => {
      this.refetch$.next();
    });
  }

  // Manipula a mudança de posição de uma swimlane.
  // A ordem das swimlanes é atualizada e enviada para o backend.

  aoMudarSwimlane($event: CdkDragDrop<any>): void {
    const _board = this.board();
    if (!_board) return;
    moveItemInArray(
      _board.swimlanes || [],
      $event.previousIndex,
      $event.currentIndex
    );

    this.boardService
      .atualizarOrdemSwimlane({
        boardId: _board.id,
        items:
          _board.swimlanes?.map((swimlane, index) => ({
            id: swimlane.id,
            ordem: index,
          })) || [],
      })
      .subscribe(() => {
        this.refetch$.next();
      });
  }

  // Adiciona ou edita um card.
  adicionarOuEditarCard(swimlane: ISwimlane, card?: ICard) {
    this.matDialog.open(AddCardComponent, {
      width: '600px',
      data: {
        swimlane: swimlane,
        boardId: swimlane.boardId,
        card,
      }
    }).afterClosed().subscribe((card?: ICard) => {
      card && this.refetch$.next();
    });
  }


  // Adiciona uma nova swimlane ao quadro atual.
  //  Este método verifica se o formulário de swimlane é válido. Se for inválido, a execução é interrompida.
  //  Em seguida, obtém o quadro atual. Se o quadro não existir, a execução é interrompida.
  //  Se o formulário for válido e o quadro existir, uma nova swimlane é criada com os dados fornecidos
  //  pelo formulário. Após a criação bem-sucedida da swimlane, o formulário é redefinido e um evento
  //  de refetch é emitido.

  adicionarSwimlane() {
    if (this.swimlaneForm.invalid) {
      return;
    };
    const _board = this.board();
    if (!_board) return;

    this.swimlaneService
      .criarSwimlane({
        nome: this.swimlaneForm.value.nome as string,
        boardId: _board.id,
        ordem: _board.swimlanes?.length || 0
      }).subscribe(() => {
        this.swimlaneForm.reset();
        this.refetch$.next();
      });
  }
}
