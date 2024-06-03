import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { filter, mergeMap } from 'rxjs';
import { ConfirmComponent } from '../../../../shared/ui/confirm/confirm.component';
import { ColunasService } from '../../../../shared/services/colunas.service';
import { IColuna, IUpdateSColuna } from '../../../../shared/services/models/quadro.model';

@Component({
  selector: 'app-edit-coluna',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './edit-coluna.component.html',
  styleUrl: './edit-coluna.component.css'
})
export class EditColunaComponent {

  private readonly matDialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly colunasService = inject(ColunasService);
  data = inject(MAT_DIALOG_DATA);

  colunaForm = this.fb.group({
    id: this.fb.control(this.data.coluna.id),
    nome: this.fb.control(this.data.coluna.name, [Validators.required]),
  });

  updateColuna() {
    if (this.colunaForm.invalid) {
      return;
    }

    this.colunasService
      .updateColuna(this.colunaForm.value as IUpdateSColuna)
      .subscribe((coluna: IColuna) => {
        this.dialogRef.close(coluna);
      });
  }

  deleteColuna() {
    this.matDialog
      .open(ConfirmComponent, {
        data: {
          title: 'Deletar Coluna',
          message: 'tem certeza que deseja deletar essa Coluna?',
        },
      })
      .afterClosed()
      .pipe(
        filter((confirm) => confirm),
        mergeMap(() =>
          this.colunasService.deleteColuna(this.data.coluna.id)
        )
      )
      .subscribe(() => {
        this.dialogRef.close(true);
      });
  }

  closeDialog() {
    this.dialogRef.close();
  }

}
