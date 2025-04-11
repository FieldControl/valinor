// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { KanbanService, CardData } from './services/kanban.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  cards: CardData[] = [];
  cardForm!: FormGroup;
  editando = false;
  cardEditandoId: number | null = null;
  mostrarFormulario = false;

  minDate!: string;
  maxDate!: string;

  constructor(private fb: FormBuilder, private kanbanService: KanbanService) {}

  ngOnInit(): void {
    this.initForm();
    this.carregarCards();

    const today = new Date();
    const max = new Date();
    max.setFullYear(today.getFullYear() + 10);

    this.minDate = today.toISOString().split('T')[0];
    this.maxDate = max.toISOString().split('T')[0];
  }

  initForm(): void {
    this.cardForm = this.fb.group({
      nome: ['', Validators.required],
      descricao: ['', [Validators.required, Validators.minLength(5)]],
      categoria: ['', Validators.required],
      data: ['', Validators.required],
      status: ['Pendente', Validators.required]
    });
  }

  carregarCards(): void {
    this.kanbanService.getCards().subscribe(data => {
      this.cards = data;
    });
  }

  submitForm(): void {
    if (this.cardForm.invalid) {
      alert('Todos os campos são obrigatórios!');
      return;
    }

    const formData = this.cardForm.value;
    const cardData: Omit<CardData, 'id'> = {
      nome: formData.nome,
      descricao: formData.descricao,
      categoria: formData.categoria,
      data: formData.data, // <- corrigido aqui
      status: formData.status
    };

    if (this.editando && this.cardEditandoId !== null) {
      this.kanbanService.updateCard(this.cardEditandoId, cardData).subscribe({
        next: () => {
          this.resetForm();
          this.carregarCards();
        },
        error: (err) => {
          console.error('Erro ao atualizar card:', err);
          alert('Erro ao atualizar card');
        }
      });
    } else {
      this.kanbanService.createCard(cardData).subscribe({
        next: () => {
          this.resetForm();
          this.carregarCards();
        },
        error: (err) => {
          console.error('Erro ao criar card:', err);
          alert('Erro ao criar card');
        }
      });
    }
  }

  editarCard(card: CardData): void {
    this.editando = true;
    this.cardEditandoId = card.id;
    this.mostrarFormulario = true;
    const dataFormatada = card.data.split('T')[0];

    this.cardForm.setValue({
      nome: card.nome,
      descricao: card.descricao,
      categoria: card.categoria,
      data: dataFormatada,
      status: card.status
    });
  }

  cancelarEdicao(): void {
    this.resetForm();
  }

  resetForm(): void {
    this.cardForm.reset({ status: 'Pendente' });
    this.editando = false;
    this.cardEditandoId = null;
    this.mostrarFormulario = false;
  }

  moverCard(card: CardData, novoStatus: 'Pendente' | 'Fazendo' | 'Finalizado'): void {
    this.kanbanService.moveCard(card.id, novoStatus).subscribe(() => {
      this.carregarCards();
    });
  }

  excluirCard(card: CardData): void {
    if (confirm('Tem certeza que deseja excluir este card?')) {
      this.kanbanService.deleteCard(card.id).subscribe(() => {
        this.carregarCards();
      });
    }
  }

  get cardsPendente(): CardData[] {
    return this.cards.filter(c => c.status === 'Pendente');
  }
  
  get cardsFazendo(): CardData[] {
    return this.cards.filter(c => c.status === 'Fazendo');
  }
  
  get cardsFinalizado(): CardData[] {
    return this.cards.filter(c => c.status === 'Finalizado');
  }
}
