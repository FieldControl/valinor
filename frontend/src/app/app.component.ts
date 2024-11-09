import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Card {
  id: number;
  title: string;
  description: string;
  columnId: number;
}

interface Column {
  id: number;
  title: string;
  cards: Card[];
  newCardTitle?: string;  
  newCardDescription?: string;  
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  columns: Column[] = [];
  newColumnTitle: string = ''; 
  newCardTitle: string = ''; 
  newCardDescription: string = ''; 

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchColumns();
  }

  fetchColumns(): void {
    this.http.get<Column[]>('http://localhost:3000/columns').subscribe(
      (data) => {
        this.columns = data;
        this.fetchCardsForColumns();
      },
      (error) => {
        console.error('Error fetching columns:', error);
      }
    );
  }

  fetchCardsForColumns(): void {
    this.columns.forEach(column => {
      this.http.get<Card[]>(`http://localhost:3000/cards/${column.id}`).subscribe(
        (cards) => {
          column.cards = cards;
        },
        (error) => {
          console.error(`Error fetching cards for column ${column.id}:`, error);
        }
      );
    });
  }

  addColumn(): void {
    if (this.newColumnTitle.trim()) {
      this.http.post<Column>('http://localhost:3000/columns', { title: this.newColumnTitle }).subscribe(
        (newColumn) => {
          newColumn.cards = [];
          newColumn.newCardTitle = '';
          newColumn.newCardDescription = '';

          this.columns.push(newColumn);
          this.newColumnTitle = ''; 
        },
        (error) => {
          console.error('Error adding column:', error);
        }
      );
    }
  }
  addCard(columnId: number): void {
    const column = this.columns.find(col => col.id === columnId);
    
    if (column && column.newCardTitle && column.newCardDescription) {
      this.http.post<Card>('http://localhost:3000/cards', {
        title: column.newCardTitle,
        description: column.newCardDescription,
        columnId
      }).subscribe((newCard) => {
        column.cards.push(newCard);  
        column.newCardTitle = '';    
        column.newCardDescription = '';  
      });
    } else {
      console.error('Título e descrição do card são obrigatórios!');
    }
  }
}
