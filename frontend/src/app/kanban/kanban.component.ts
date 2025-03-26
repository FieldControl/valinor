import { Component, OnInit, AfterViewInit } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-kanban',
  templateUrl: './kanban.component.html',
  standalone: true,
  imports: [RouterModule],
  styleUrls: ['./kanban.component.css']
})
export class KanbanComponent implements OnInit {
  ngAfterViewInit() {
    if (typeof document !== 'undefined') {
      this.enableDragAndDrop();
      return;
    }
  }

  constructor() { }

  ngOnInit(): void {
    if (typeof document !== 'undefined') {
      this.enableDragAndDrop();
      this.setupAddCardButtons();
      this.makeCardsEditable();
    }
  }

  enableDragAndDrop(): void {
    if (typeof document === 'undefined') return;
  
    const cards = document.querySelectorAll('.kanban-card');
    cards.forEach(card => {
      card.addEventListener('dragstart', (e) => {
        (e.target as HTMLElement).classList.add('dragging');
      });
  
      card.addEventListener('dragend', (e) => {
        (e.target as HTMLElement).classList.remove('dragging');
      });
    });
  
    const columns = document.querySelectorAll('.kanban-cards');
    columns.forEach(column => {
      column.addEventListener('dragover', (e) => {
        e.preventDefault();
        (e.target as HTMLElement).classList.add('cards-hover');
      });
  
      column.addEventListener('dragleave', (e) => {
        (e.target as HTMLElement).classList.remove('cards-hover');
      });
  
      column.addEventListener('mouseleave', () => {
        column.classList.remove('cards-hover');
      });
  
      column.addEventListener('drop', (e) => {
        e.preventDefault();
  
        // Impede que o card seja solto dentro de outro card
        const dragCard = document.querySelector('.kanban-card.dragging');
        const target = e.target as HTMLElement;
        if (dragCard && target && !target.classList.contains('kanban-card')) {
          column.appendChild(dragCard);
  
          const columnBadge = column.closest('.kanban-column')?.querySelector('.badge');
          const badgeClass = columnBadge ? columnBadge.classList[1] : 'low';
          const badgeText = columnBadge ? columnBadge.textContent?.trim() : 'Novo Card';
  
          const cardBadge = dragCard.querySelector('.badge');
          if (cardBadge) {
            cardBadge.classList.remove('low', 'medium', 'high');
            cardBadge.classList.add(badgeClass);
            cardBadge.textContent = badgeText ?? 'sem titulo';
          }
        }
  
        column.classList.remove('cards-hover');
      });
    });
  }
  
  

  setupAddCardButtons(): void {
    if (typeof document === 'undefined') return;

    const buttons = document.querySelectorAll('.add-card');

    buttons.forEach(button => {
      button.replaceWith(button.cloneNode(true));
    });

    document.querySelectorAll('.add-card').forEach(button => {
      button.addEventListener('click', (event) => {
        const column = (event.target as HTMLElement).closest('.kanban-column')?.querySelector('.kanban-cards');
        if (column) {
          this.addNewCard(column);
        }
      });
    });
  }

  addNewCard(column: Element): void {
    if (typeof document === 'undefined') return;

    const newCard = document.createElement('div');
    newCard.classList.add('kanban-card');
    newCard.draggable = true;

    const columnBadge = column.closest('.kanban-column')?.querySelector('.badge');
    const badgeClass = columnBadge ? columnBadge.classList[1] : 'low'; 
    const badgeText = columnBadge ? columnBadge.textContent?.trim() : 'Novo Card'; 

    newCard.innerHTML = `
      <div class="badge ${badgeClass}">
        <span>${badgeText}</span>
      </div>
      <p class="card-title" contenteditable="true">Tarefa Nova</p>
      <div class="card-infos">
        <div class="card-icons">
          <p><i class="fa-regular fa-comment"> 0</i></p>
          <p><i class="fa-solid fa-paperclip"> 0</i></p>
        </div>
        <button class="delete-card">🗑️</button> <!-- Botão de deletar -->
      </div>
    `;

    column.appendChild(newCard);
    this.enableDragAndDrop();
    this.makeCardsEditable();
    this.setupDeleteButton(newCard); 
  }

  makeCardsEditable(): void {
    if (typeof document === 'undefined') return;

    document.querySelectorAll('.kanban-card .card-title').forEach(title => {
      title.setAttribute('contenteditable', 'true');

      title.addEventListener('keydown', (event) => {
        const keyboardEvent = event as KeyboardEvent;

        if (keyboardEvent.key === 'Enter') {
          keyboardEvent.preventDefault();

          if (keyboardEvent.target && keyboardEvent.target instanceof HTMLElement) {
            keyboardEvent.target.blur(); 
          }
        }
      });

      title.addEventListener('blur', (event) => {
        const element = event.target as HTMLElement;
        if (!element.textContent?.trim()) {
          element.textContent = 'Sem título'; 
        }
      });
    });
  }


  setupDeleteButton(card: HTMLElement): void {
    if (typeof document === 'undefined') return;

    const deleteButton = card.querySelector('.delete-card') as HTMLElement;
    deleteButton.addEventListener('click', () => {
      const confirmDelete = confirm('Tem certeza que deseja deletar este card?');
      if (confirmDelete) {
        card.remove(); 
      }
    });
  }
}
