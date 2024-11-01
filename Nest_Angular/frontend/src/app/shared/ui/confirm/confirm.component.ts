import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirm',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './confirm.component.html',
  styleUrl: './confirm.component.scss'
})
// /**
//  * Componente de confirmação que exibe um diálogo com uma mensagem e opções de confirmação.
//  * 
//  * @class
//  * @classdesc Este componente utiliza o MatDialogRef para controlar o diálogo e MAT_DIALOG_DATA para receber dados.
//  * 
//  * @property {Object} data - Dados injetados no componente, contendo o título e a mensagem do diálogo.
//  * @property {string} data.titulo - O título do diálogo de confirmação.
//  * @property {string} data.mensagem - A mensagem exibida no diálogo de confirmação.
//  * 
//  * @method confirm - Fecha o diálogo retornando um valor verdadeiro (true), indicando confirmação.
//  * @method close - Fecha o diálogo retornando um valor falso (false), indicando cancelamento.
//  */
export class ConfirmComponent {
  private readonly dialogRef = inject(MatDialogRef);
  data = inject<{
    titulo: string;
    mensagem: string;
  }>(MAT_DIALOG_DATA);


  confirm(){
    this.dialogRef.close(true);
  }
  close(){
    this.dialogRef.close(false);
  }
}
