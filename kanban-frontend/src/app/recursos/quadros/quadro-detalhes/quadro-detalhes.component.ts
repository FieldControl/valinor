import { Component, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { QuadroService } from '../../../compartilhado/servicos/quadro.service'; 
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
import { ColunaService } from '../../../compartilhado/servicos/coluna.service'; 
import { Subject, switchMap } from 'rxjs';
import { ICartao, IColuna } from '../../../compartilhado/modelos/quadro.modelo'; 
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AdicionarCartaoComponent } from '../componentes/add-cartao/add-cartao.component'; 
import { CartaoService } from '../../../compartilhado/servicos/cartao.service'; 
import { ConfirmarComponent } from '../../../compartilhado/ui/confirmar/confirmar.component'; 
import { EditarColunaComponent } from '../componentes/editar-coluna/editar-coluna.component'; 

@Component({
  selector: 'app-detalhe',
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
  templateUrl: './quadro-detalhes.component.html',
  styleUrl: './quadro-detalhes.component.scss',
})
export class QuadroDetalhesComponent implements OnInit {
  private readonly quadroService = inject(QuadroService);
  private readonly matDialog = inject(MatDialog);
  private readonly colunaService = inject(ColunaService);
  private readonly cartaoService = inject(CartaoService);
  private readonly activatedRoute = inject(ActivatedRoute);
  refetch$ = new Subject<void>();
  quadro = toSignal(
    this.refetch$
      .asObservable()
      .pipe(
        switchMap(() =>
          this.quadroService.getQuadroPorId(
            this.activatedRoute.snapshot.params['id']
          )
        )
      )
  );
  private readonly fb = inject(NonNullableFormBuilder);
  colunaForm = this.fb.group({
    nome: this.fb.control('', Validators.required),
  });

  ngOnInit(): void {
    this.refetch$.next();
  }

  editColuna(coluna: IColuna) {
    this.matDialog
      .open(EditarColunaComponent, { width: '600px', data: { coluna } })
      .afterClosed()
      .subscribe(() => this.refetch$.next());
  }

  onCardChange($event: CdkDragDrop<any>, coluna: IColuna): void {
    if ($event.previousContainer === $event.container) {
      moveItemInArray(
        coluna.cartoes || [],
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

    const _quadro = this.quadro();
    if (!_quadro) return;

    const cartoes: ICartao[] =
      _quadro.colunas?.reduce((prev: ICartao[], current: IColuna) => {
        const cartoes =
          current.cartoes?.map((c, idx) => ({
            ...c,
            colunaId: current.id,
            ordem: idx,
          })) || [];

        return [...prev, ...cartoes];
      }, []) || [];

    this.cartaoService
      .atualizarOrdemCartaoEColuna(_quadro.id, cartoes)
      .subscribe(() => {
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
        itens:
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

  addOrEditCartao(coluna: IColuna, cartao?: ICartao) {
    this.matDialog
      .open(AdicionarCartaoComponent, {
        width: '600px',
        data: {
          coluna: coluna,
          quadroId: coluna.quadroId,
          cartao,
        },
      })
      .afterClosed()
      .subscribe((cartao?: ICartao) => {
        cartao && this.refetch$.next();
      });
  }

  addColuna() {
    if (this.colunaForm.invalid) {
      return;
    }
    const _quadro = this.quadro();
    if (!_quadro) return;

    this.colunaService
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
}
