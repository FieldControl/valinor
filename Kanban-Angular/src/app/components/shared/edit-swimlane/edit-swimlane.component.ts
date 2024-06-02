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
import { filter, mergeMap } from 'rxjs';
import { SwimlanesService } from '../../../services/swinlanes.service';
import { ISwimlane, IUpdateSwimlane } from '../../../Models/board-model';
import { ConfirmComponent } from '../confirm/confirm.component';

@Component({
  selector: 'app-edit-swimlane',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
  ], // Importa os módulos necessários
  templateUrl: './edit-swimlane.component.html',
  styleUrl: './edit-swimlane.component.css'
})
export class EditSwimlaneComponent {
  private readonly matDialog = inject(MatDialog); // Injeta o serviço MatDialog
  private readonly dialogRef = inject(MatDialogRef); // Injeta a referência ao diálogo
  private readonly fb = inject(NonNullableFormBuilder); // Injeta o FormBuilder
  private readonly swimlaneService = inject(SwimlanesService); // Injeta o serviço SwimlanesService
  data = inject(MAT_DIALOG_DATA); // Injeta os dados recebidos pelo diálogo

  // Define o formulário para editar uma swimlane, pré-preenchido com os dados da swimlane
  swimlaneForm = this.fb.group({
    id: this.fb.control(this.data.swimlane.id), // Define o controle de id da swimlane
    name: this.fb.control(this.data.swimlane.name, [Validators.required]), // Define o controle de nome da swimlane com validação obrigatória
  });

  // Função para atualizar a swimlane
  updateSwimlane() {
    if (this.swimlaneForm.invalid) { // Retorna se o formulário é inválido
      return;
    }

    // Chama o método de atualização da swimlane no serviço SwimlanesService
    this.swimlaneService
      .updateSwimlane(this.swimlaneForm.value as IUpdateSwimlane)
      .subscribe((swimlane: ISwimlane) => { // Subscreve para receber a swimlane atualizada
        this.dialogRef.close(swimlane); // Fecha o diálogo e passa a swimlane atualizada como resultado
      });
  }

  // Função para excluir a swimlane
  deleteSwimlane() {
    this.matDialog
      .open(ConfirmComponent)
      .afterClosed()
      .pipe(
        filter((confirm) => confirm), // Filtra apenas as confirmações
        mergeMap(() =>
          this.swimlaneService.deleteSwimlane(this.data.swimlane.id) // Chama o método de exclusão da swimlane no serviço SwimlanesService
        )
      )
      .subscribe(() => { // Subscreve para receber uma confirmação após a exclusão
        this.dialogRef.close(true); // Fecha o diálogo e passa true como resultado
      });
  }

  // Função para fechar o diálogo
  closeDialog() {
    this.dialogRef.close(); // Fecha o diálogo sem passar nenhum resultado
  }
}
