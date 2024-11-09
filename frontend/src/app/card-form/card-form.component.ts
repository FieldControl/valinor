import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardService } from '../services/list.service';

@Component({
  selector: 'app-card-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './card-form.component.html',
  styleUrls: ['./card-form.component.scss']
})
export class CardFormComponent {
  cardForm!: FormGroup;
  @Output() closeForm = new EventEmitter<void>(); // Para fechar o formulário

  constructor(
    private fb: FormBuilder,
    private CardService: CardService
  ) {
    this.cardForm = this.fb.group({
      title: ['', Validators.required],
      desc: ['', Validators.required],
      status: ['to-do',Validators.required],
    });
  }


  onSubmit() {
    if (this.cardForm.valid) {
      this.CardService.criar(this.cardForm.value).subscribe({
        next: (response: any) => {
          console.log('Card criado com sucesso:', response);
          location.reload();
          this.cardForm.reset();

        },
        error: (error: any) => {
          console.error('Erro ao criar o card:', error);
        },
      });
    }
  }

}
