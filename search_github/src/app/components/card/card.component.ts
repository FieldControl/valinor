import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

@Component({
    selector: 'app-card',
    templateUrl: './card.component.html',
    imports: [CommonModule],
    standalone: true
})
export class CardComponent {
    @Input() repositorie: any;
}