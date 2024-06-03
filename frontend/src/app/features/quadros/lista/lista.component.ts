import { Component, OnInit, inject } from '@angular/core';
import { QuadroService } from '../../../shared/services/quadro.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { IQuadro } from '../../../shared/services/models/quadro.model';
import { AddQuadroComponent } from '../components/add-quadro/add-quadro.component';
import { Subject, filter, mergeMap, switchMap } from 'rxjs';


@Component({
  selector: 'app-lista',
  standalone: true,
  imports: [RouterModule,MatCardModule, MatButtonModule, MatDialogModule],
  templateUrl: './lista.component.html',
  styleUrl: './lista.component.css'
})
export class ListaComponent implements OnInit{
  private readonly quadroService = inject(QuadroService); 
  private readonly dialog = inject(MatDialog);
  refetch$ = new Subject<void>();
  quadros = toSignal(
    this.refetch$
      .asObservable()
      .pipe(switchMap(() => this.quadroService.getQuadro()))
  );
  ngOnInit(): void {
    this.refetch$.next();
  }

   openNovoQuadroFlow($event: Event, quadro?: IQuadro) {
    $event.stopImmediatePropagation();
    $event.preventDefault();
    this.dialog
      .open(AddQuadroComponent, { width: '450px', data: { quadro } })
      .afterClosed()
      .subscribe((quadro: IQuadro) => {
        quadro && this.refetch$.next();
      });

  }

  deleteQuadro($event: Event, quadro: IQuadro) {
    console.log("entrou")
    // $event.stopImmediatePropagation();
    // $event.preventDefault();
    // this.dialog
    //   .open(ConfirmComponent, {
    //     data: {
    //       title: 'Delete Board',
    //       message: 'Are you sure you want to delete this board?',
    //     },
    //   })
    //   .afterClosed()
    //   .pipe(
    //     filter((result) => result),
    //     mergeMap(() => this.quadroService.deleteQuadro(quadro.id))
    //   )
    //   .subscribe(() => this.refetch$.next());
  }


}
