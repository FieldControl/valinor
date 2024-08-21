import { Component, OnInit, inject } from '@angular/core';
import { QuadroService } from '../../../compartilhado/servicos/quadro.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AdicionarQuadroComponent } from '../componentes/add-quadros/add-quadros.component'; 
import { IQuadro } from '../../../compartilhado/modelos/quadro.modelo'; 
import { Subject, filter, mergeMap, switchMap } from 'rxjs';
import { ConfirmarComponent } from '../../../compartilhado/ui/confirmar/confirmar.component';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [RouterModule, MatCardModule, MatButtonModule, MatDialogModule],
  templateUrl: './quadro-lista.component.html',
  styleUrl: './quadro-lista.component.scss',
})
export class QuadroListaComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly quadroService = inject(QuadroService);
  refetch$ = new Subject<void>();
  quadros = toSignal(
    this.refetch$
      .asObservable()
      .pipe(switchMap(() => this.quadroService.getQuadro()))
  );

  ngOnInit(): void {
    this.refetch$.next();
  }

  openNovoFluxoQuadro($event: Event, quadro?: IQuadro) {
    $event.stopImmediatePropagation();
    $event.preventDefault();
    this.dialog
      .open(AdicionarQuadroComponent, { width: '400px', data: { quadro } })
      .afterClosed()
      .subscribe((quadro: IQuadro) => {
        quadro && this.refetch$.next();
      });
  }

  deleteQuadro($event: Event, quadro: IQuadro) {
    $event.stopImmediatePropagation();
    $event.preventDefault();
    this.dialog
      .open(ConfirmarComponent, {
        data: {
          titulo: 'Deletar Quadro',
          mensagem: 'Tem certeza de que deseja excluir este quadro?',
        },
      })
      .afterClosed()
      .pipe(
        filter((result) => result),
        mergeMap(() => this.quadroService.deleteQuadro(quadro.id))
      )
      .subscribe(() => this.refetch$.next());
  }
}
