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
import {
  IUpdateSwimlane,
  ISwimlane,
} from '../../../../shared/models/board.model';
import { SwimlanesService } from '../../../../shared/services/swimlanes.service';
import { ConfirmComponent } from '../../../../shared/ui/confirm/confirm.component';
import { filter, mergeMap } from 'rxjs';

@Component({
  selector: 'app-edit-swimlane',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './edit-swimlane.component.html',
  styleUrl: './edit-swimlane.component.scss',
})
export class EditSwimlaneComponent {
  private readonly matDialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly swimlaneService = inject(SwimlanesService);
  data = inject(MAT_DIALOG_DATA);

  swimlaneForm = this.fb.group({
    id: this.fb.control(this.data.swimlane.id),
    name: this.fb.control(this.data.swimlane.name, [Validators.required]),
  });

  updateSwimlane() {
    if (this.swimlaneForm.invalid) {
      return;
    }

    this.swimlaneService
      .updateSwimlane(this.swimlaneForm.value as IUpdateSwimlane)
      .subscribe((swimlane: ISwimlane) => {
        this.dialogRef.close(swimlane);
      });
  }

  deleteSwimlane() {
    this.matDialog
      .open(ConfirmComponent, {
        data: {
          title: 'Delete Swimlane',
          message: 'Are you sure you want to delete this swimlane?',
        },
      })
      .afterClosed()
      .pipe(
        filter((confirm) => confirm),
        mergeMap(() =>
          this.swimlaneService.deleteSwimlane(this.data.swimlane.id)
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
