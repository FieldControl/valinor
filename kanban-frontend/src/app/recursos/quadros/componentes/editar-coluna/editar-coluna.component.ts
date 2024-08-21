import { Component, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { IAtualizarColuna, IColuna } from '../../../../compartilhado/modelos/quadro.modelo'; 
import { ColunaService } from '../../../../compartilhado/servicos/coluna.service'; 
import { ConfirmarComponent } from '../../../../compartilhado/ui/confirmar/confirmar.component'; 
import { filter, mergeMap } from 'rxjs';

@Component({
  selector: 'app-editar-coluna',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './editar-coluna.component.html',
  styleUrl: './editar-coluna.component.scss',
})
export class EditarColunaComponent {
  private readonly matDialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly colunaService = inject(ColunaService);
  data = inject(MAT_DIALOG_DATA);

  colunaForm = this.fb.group({
    id: this.fb.control(this.data.coluna.id),
    nome: this.fb.control(this.data.coluna.nome, [Validators.required]),
  });

  atualizarColuna() {
    if (this.colunaForm.invalid) {
      return;
    }

    this.colunaService
      .updateColuna(this.colunaForm.value as IAtualizarColuna)
      .subscribe((coluna: IColuna) => {
        this.dialogRef.close(coluna);
      });
  }

  excluirColuna() {
    this.matDialog
      .open(ConfirmarComponent, {
        data: {
          titulo: 'Deletar Coluna',
          mensagem: 'Tem certeza de que deseja excluir esta coluna?',
        },
      })
      .afterClosed()
      .pipe(
        filter((confirm) => confirm),
        mergeMap(() =>
          this.colunaService.deleteColuna(this.data.coluna.id)
        )
      )
      .subscribe(() => {
        this.dialogRef.close(true);
      });
  }

  fecharDialogo() {
    this.dialogRef.close();
  }
}
