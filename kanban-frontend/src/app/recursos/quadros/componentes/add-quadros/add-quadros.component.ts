import { Component, inject } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { QuadroService } from '../../../../compartilhado/servicos/quadro.service'; 
import { IQuadro, ICriarQuadro } from '../../../../compartilhado/modelos/quadro.modelo'; 

@Component({
  selector: 'app-add-quadros',
  standalone: true,
  imports: [ReactiveFormsModule, MatInputModule, MatButtonModule],
  templateUrl: './add-quadros.component.html',
  styleUrl: './add-quadros.component.scss',
})
export class AdicionarQuadroComponent {
  private readonly dialogRef = inject(MatDialogRef);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly quadroService = inject(QuadroService);
  data = inject(MAT_DIALOG_DATA);

  adicionarQuadroForm = this.fb.group({
    nome: this.fb.control(this.data.quadro?.nome, [Validators.required]),
  });

  createOrEditQuadro() {
    if (this.adicionarQuadroForm.invalid) {
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
      .updateQuadro(this.data.quadro?.id, this.adicionarQuadroForm.value as ICriarQuadro)
      .subscribe((quadro: IQuadro) => {
        this.dialogRef.close(quadro);
      });
  }

  private _createQuadro() {
    this.quadroService
      .createQuadro(this.adicionarQuadroForm.value as ICriarQuadro)
      .subscribe((quadro: IQuadro) => {
        this.dialogRef.close(quadro);
      });
  }

  closeDialogo() {
    this.dialogRef.close();
  }
}
