import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirm',
  standalone: true,
  imports: [MatIconModule, MatButtonModule], // Importa os módulos necessários do Angular Material
  templateUrl: './confirm.component.html',
  styleUrl: './confirm.component.css'
})
export class ConfirmComponent {
  private readonly dialogRef = inject(MatDialogRef); // Injeta a referência ao diálogo


  // Função para confirmar a ação e fechar o diálogo
  confirm() {
    this.dialogRef.close(true);
  }

  // Função para fechar o diálogo sem confirmação
  close() {
    this.dialogRef.close(false);
  }
}
