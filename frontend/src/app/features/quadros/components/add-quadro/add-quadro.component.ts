import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { QuadroService } from '../../../../shared/services/quadro.service';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { ICreateQuadro, IQuadro } from '../../../../shared/services/models/quadro.model';

@Component({
  selector: 'app-add-quadro',
  standalone: true,
  imports: [ReactiveFormsModule, MatInputModule, MatButtonModule],
  templateUrl: './add-quadro.component.html',
  styleUrl: './add-quadro.component.css'
})
export class AddQuadroComponent {
  private readonly dialogRef = inject(MatDialogRef);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly quadroService = inject(QuadroService);
  data = inject(MAT_DIALOG_DATA);

  addQuadroForm = this.fb.group({
    nome: this.fb.control(this.data.quadro?.nome, [Validators.required]),
  });

  createOrEditQuadro() {
    if (this.addQuadroForm.invalid) {
      return;
    }

    if (this.data.quadro?.id) {
      this._updateQuadro();
    } else {
      this._createQuadro();
    }
  }

  private _updateQuadro() {
    this.quadroService
      .updateQuadro(this.data.quadro?.id, this.addQuadroForm.value as ICreateQuadro)
      .subscribe((quadro: IQuadro) => {
        this.dialogRef.close(quadro);
      });
  }

  private _createQuadro() {
    this.quadroService
      .createQuadro(this.addQuadroForm.value as ICreateQuadro)
      .subscribe((quadro: IQuadro) => {
        this.dialogRef.close(quadro);
      });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
