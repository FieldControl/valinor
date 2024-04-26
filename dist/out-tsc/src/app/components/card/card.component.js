import { __decorate } from "tslib";
import { Component } from '@angular/core';
let CardComponent = class CardComponent {
    constructor() {
        this.notes = [];
    }
    ngOnInit() {
        this.loadNotes();
    }
    saveNote(note) {
        const index = this.notes.findIndex(n => n === note);
        const key = `list_${index}`;
        localStorage.setItem(key, JSON.stringify(note));
    }
    loadNotes() {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('list_')) {
                const data = JSON.parse(localStorage.getItem(key));
                if (data) {
                    this.notes.push(data);
                }
            }
        }
    }
};
CardComponent = __decorate([
    Component({
        selector: 'app-card',
        standalone: true,
        imports: [],
        templateUrl: './card.component.html',
        styleUrl: './card.component.css'
    })
], CardComponent);
export { CardComponent };
//# sourceMappingURL=card.component.js.map