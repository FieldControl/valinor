import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

interface Task {
  id: number;
  description: string;
  status: TaskStatus;
  cardId: number;
  assignedToId: number;
}


@Component({
  selector: 'app-Member-dashboard',
  standalone: true,
  imports:[FormsModule, CommonModule],
  templateUrl: './member-dashboard.component.html',
  styleUrls: ['./member-dashboard.component.css'],
})

export class MemberDashboardComponent implements OnInit {


  cards: any[] = [];
  selectedCard: any = null;

  ngOnInit() {
    this.fetchCards();
  }

  fetchCards() {
    fetch('http://localhost:3000/cards/membercards', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(res => res.json())
    .then(data => this.cards = data)
    .catch(err => console.error('Erro ao buscar cards', err));
  }

  selectCard(card: any) {
    if (card.sentByMember) {
      alert('Este card já foi enviado e não pode ser editado.');
      return;
    }
    this.selectedCard = JSON.parse(JSON.stringify(card)); // cópia para evitar bugs
  }

  updateTaskStatus(task: Task) {
    fetch(`http://localhost:3000/tasks/${task.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ status: task.status })
    })
    .then(res => {
      if (!res.ok) throw new Error('Erro ao atualizar task');
      return res.json();
    })
    .then(() => {
      console.log('Status atualizado, atualizando dados...');
      this.fetchCards(); // atualiza lista
      // atualizar selectedCard também para refletir status atualizado
      this.selectedCard.tasks = this.selectedCard.tasks.map((t: Task) =>
        t.id === task.id ? { ...t, status: task.status } : t
      );
    })
    .catch(err => console.error(err));
  }

  allTasksDone(): boolean {
    return this.selectedCard?.tasks?.every((task: Task) => task.status === 'DONE');
  }

  submitCard(cardId: number) {
    if (!this.allTasksDone()){
      console.log('Nem todas as tarefas estão concluídas:', this.selectedCard.tasks);
      return;
    } 

    fetch(`http://localhost:3000/cards/${cardId}/submit`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(res => {
      if (!res.ok) throw new Error('Erro ao enviar card');
      return res.json();
    })
    .then(data => {
      console.log('Card enviado com sucesso!', data);
      this.selectedCard = null;
      this.fetchCards();
    })
    .catch(err => console.error(err));
  }
}