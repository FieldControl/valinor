import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirmar',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './confirmar.component.html',
  styleUrl: './confirmar.component.scss',
})
export class ConfirmarComponent {
  private readonly dialogRef = inject(MatDialogRef);
  data = inject<{
    titulo: string;
    mensagem: string;
  }>(MAT_DIALOG_DATA);

  confirmar() {
    this.dialogRef.close(true);
  }

  fechar() {
    this.dialogRef.close(false);
  }
}
