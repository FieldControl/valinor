import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-edit-card-modal',
  templateUrl: './kanban-add-edit-card.modal.html',
  styleUrls: ['./kanban-add-edit-card.modal.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
})
export class AddEditCardModalComponent {
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() isEdit: boolean = false;

  titleError: boolean = false;

  constructor(private modalCtrl: ModalController) {}

  dismiss(save: boolean = false) {
    if (save) {
      if (!this.title.trim()) {
        this.titleError = true;
        return;
      }

      this.modalCtrl.dismiss({
        title: this.title,
        description: this.description,
      });
    } else {
      this.modalCtrl.dismiss();
    }
  }
}
