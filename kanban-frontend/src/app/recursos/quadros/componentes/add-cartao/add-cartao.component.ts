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
  MatDialogModule,
  MatDialog,
} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { ICartao } from '../../../../compartilhado/modelos/quadro.modelo'; 
import { CartaoService } from '../../../../compartilhado/servicos/cartao.service'; 
import { ConfirmarComponent } from '../../../../compartilhado/ui/confirmar/confirmar.component'; 
import { filter, mergeMap } from 'rxjs';

@Component({
  selector: 'app-add-cartao',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
  ],
  templateUrl: './add-cartao.component.html',
  styleUrl: './add-cartao.component.scss',
})
export class AdicionarCartaoComponent {
  private readonly matDialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly cartaoService = inject(CartaoService);
  data = inject(MAT_DIALOG_DATA);

  adicionarCartaoForm = this.fb.group({
    ordem: this.fb.control(this.data.coluna.cartoes.length),
    quadroId: this.fb.control(this.data.quadroId),
    colunaId: this.fb.control(this.data.coluna.id),
    nome: this.fb.control(this.data.cartao?.nome, [Validators.required]),
    conteudo: this.fb.control(this.data.cartao?.conteudo, [Validators.required]),
  });

  criarOuEditarCartao() {
    if (this.adicionarCartaoForm.invalid) {
      return;
    }

    if (this.data.cartao?.id) {
      this._atualizarCartao();
    } else {
      this._criarCartao();
    }
  }

  private _atualizarCartao() {
    this.cartaoService
      .updateCartao(this.data.cartao?.id, this.adicionarCartaoForm.value as Partial<ICartao>)
      .subscribe((cartao: ICartao) => {
        this.dialogRef.close(cartao);
      });
  }

  private _criarCartao() {
    this.cartaoService
      .createCartao(this.adicionarCartaoForm.value as Partial<ICartao>)
      .subscribe((cartao: ICartao) => {
        this.dialogRef.close(cartao);
      });
  }

  deletarCartao() {
    if (!this.data.cartao?.id) return;
    this.matDialog
      .open(ConfirmarComponent, {
        data: {
          titulo: 'Deletar cartao',
          mensagem: 'Tem certeza de que deseja excluir este cartao?',
        },
      })
      .afterClosed()
      .pipe(
        filter((confirm) => confirm),
        mergeMap(() => this.cartaoService.deleteCartao(this.data.cartao.id))
      )
      .subscribe(() => this.dialogRef.close(true));
  }

  closeDialogo() {
    this.dialogRef.close();
  }
}
