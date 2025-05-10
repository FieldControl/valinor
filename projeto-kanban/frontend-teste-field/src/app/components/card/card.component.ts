import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-card',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss', '../../app.component.scss']
})
export class CardComponent {
    @Input() id!: number;
    @Input() description = '';
    @Input() columnId!: number;
    @Input() title: string = '';
    @Input() columns: any[] = []; // Recebe a lista de colunas do AppComponent

    showConfirm = false;
    showModal = false;
    cardEditMode = false;

    updateCardDto = {idUpdate: 0 , titleUpdate: '', descriptionUpdate: '', columnIdUpdate: 0};

    @Output() UpdateCard = new EventEmitter<{id: number; title: string; description: string; columnId: number; }>();

    onUpdateCard() {
        this.UpdateCard.emit({ id: this.updateCardDto.idUpdate, title: this.updateCardDto.titleUpdate, description: this.updateCardDto.descriptionUpdate, columnId: this.updateCardDto.columnIdUpdate });
        this.id = this.updateCardDto.idUpdate;
        this.title = this.updateCardDto.titleUpdate;
        this.description = this.updateCardDto.descriptionUpdate;
        this.columnId = this.updateCardDto.columnIdUpdate;
        
        this.cardEditMode = false;
    }

    cancelUpdate(){
        this.updateCardDto.idUpdate = this.id;
        this.updateCardDto.titleUpdate = this.title;
        this.updateCardDto.descriptionUpdate = this.description;
        this.updateCardDto.columnIdUpdate = this.columnId;

        this.cardEditMode = false;
    }

    @Output() RemoveCard = new EventEmitter<number>();

    confirmRemove() {
        this.RemoveCard.emit(this.id);
        this.showModal = false;
        this.showConfirm = false;
    }

    cancelRemove() {
        this.showModal = false;
    }

    ngOnInit() {
        this.updateCardDto = { 
            idUpdate: this.id,
            titleUpdate: this.title,
            descriptionUpdate: this.description,
            columnIdUpdate: this.columnId
        };
    }

}
