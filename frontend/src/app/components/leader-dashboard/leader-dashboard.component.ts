import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-Leader-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leader-dashboard.component.html',
  styleUrls: ['./leader-dashboard.component.css'],
})

export class LeaderDashboardComponent implements OnInit {
  members: any[] = [];
  error = '';
  //implementando cards
  cardTitle = '';
  selectedMemberId: number | null = null;
  tasks = [{ description: '' }];
  submittedCards: any[] = [];

  ngOnInit() {
    this.fetchMembers();
    this.loadSubmittedCards();
  }

  addTask() {
    this.tasks.push({ description: '' });
  }

  async fetchMembers() {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users/members', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        this.error = 'Erro ao buscar membros.';
        return;
      }

      this.members = await res.json();
    } catch (err) {
      this.error = 'Erro de conexão.';
    }
  }

  async submitCard() {
    const token = localStorage.getItem('token');

    if (!token) {
      alert('Usuário não autenticado.');
      return;
    }

    if (!this.cardTitle || !this.selectedMemberId || this.tasks.length === 0) {
      alert('Preencha todos os campos.');
      return;
    }

    const cardPayload = {
      title: this.cardTitle,
      memberId: Number(this.selectedMemberId), // força ser número
      tasks: this.tasks.filter(t => t.description.trim() !== '')
    };

    try {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(cardPayload),
      });

      if (!res.ok) {
        throw new Error('Erro ao enviar card');
      }

      alert('Card enviado com sucesso!');
      this.resetForm();

    } catch (err) {
      alert('Erro ao enviar card');
      console.error(err);
    }
  }

  loadSubmittedCards() {
    fetch('/api/cards/submitted', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Erro ao buscar cards enviados');
        return res.json();
      })
      .then(data => {
        this.submittedCards = data;
      })
      .catch(err => console.error(err));
  }

  resetForm() {
    this.cardTitle = '';
    this.selectedMemberId = null;
    this.tasks = [{ description: '' }];
  }

  deleteCard(cardId: number) {
    const confirmed = confirm('Tem certeza que deseja excluir este card?');

    if (!confirmed) return;

    fetch(`/api/cards/${cardId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
    .then(res => {
      if (!res.ok) throw new Error('Erro ao excluir o card');
      // Remover o card localmente sem recarregar
      this.submittedCards = this.submittedCards.filter(card => card.id !== cardId);
    })
    .catch(err => console.error(err));
  }
}
