import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-link-menu-button',
  templateUrl: './button.link.menu.component.html',
  styleUrls: ['./button.link.menu.component.scss']
})
export class ButtonLinkMenuComponent {
  @Input() label: string = "Salvar";
  @Input() confirmation: boolean = false;
  @Input() confirmationMessage!: string;
  @Input() colorClass: string = "my-button-link-menu"; // Adicionado novo Input para a classe de cor do botão
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
