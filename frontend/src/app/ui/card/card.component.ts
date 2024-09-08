import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Card } from "../../cardInterface";
import { MatCardModule } from "@angular/material/card";
import { MatIcon } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";


@Component({ 
  selector: "card", 
  templateUrl: "./card.component.html",
  styleUrl: "./card.component.css",
  standalone: true,
  imports: [
    MatCardModule,
    MatIcon,
    MatButtonModule,
  ]
})
export class CardComponent {
  @Input() card: Card = { id: "",order:0, title: "", description: "" };
  @Output() remove = new EventEmitter<Card>();

  removeCard(card: Card) {
    this.remove.emit(card);
  }
}