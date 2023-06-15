import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-navigate-button',
  templateUrl: './button.navigate.component.html',
  styleUrls: ['./button.navigate.component.scss']
})
export class ButtonNavigateComponent {
  @Input() label: string = "Cadastrar";
  @Input() confirmation: boolean = false;
  @Input() confirmationMessage!: string;
  @Input() colorClass: string = "my-button-navigate"; // Adicionado novo Input para a classe de cor do botão
  @Output() click: EventEmitter<void> = new EventEmitter<void>();

  constructor(private dialogService: DialogService) {}

  onClick(): void {
    if (this.confirmation) {
      this.dialogService.confirm(this.confirmationMessage).then((confirmed) => {
        if (confirmed) {
          this.click.emit();
        }
      });
    } else {
      this.click.emit();
    }
  }
}
