import { Component, EventEmitter, Input, type OnInit, Output } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import type { Card, Tag } from "../../models/board.model"

@Component({
  selector: "app-card-modal",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./card-modal.component.html",
  styleUrls: ["./card-modal.component.scss"],
})
export class CardModalComponent implements OnInit {
  @Input() card: Card | null = null
  @Input() isEdit = false

  @Output() save = new EventEmitter<Card>()
  @Output() close = new EventEmitter<void>()

  editedCard: Card = this.createEmptyCard()
  titleError = ""
  availableTags: Tag[] = [
    { id: "tag1", name: "Urgente", color: "#FF647C" },
    { id: "tag2", name: "Bug", color: "#FFAA15" },
    { id: "tag3", name: "Feature", color: "#00C781" },
    { id: "tag4", name: "Melhoria", color: "#2D8CFF" },
    { id: "tag5", name: "Documentação", color: "#7D4CDB" },
  ]

  ngOnInit(): void {
    if (this.card) {
      console.log('Card recebido para edição:', this.card);
      console.log('Tipo da dueDate:', this.card.dueDate ? typeof this.card.dueDate : 'undefined');
      
      // Fazer cópia profunda para não alterar o objeto original
      this.editedCard = JSON.parse(JSON.stringify(this.card));
      
      // Processar a data de vencimento
      if (this.editedCard.dueDate) {
        try {
          console.log('Convertendo dueDate para formato de input HTML:', this.editedCard.dueDate);
          
          // Converter para objeto Date primeiro
          const dateObj = typeof this.editedCard.dueDate === 'string' ? 
            new Date(this.editedCard.dueDate) : 
            this.editedCard.dueDate;
          
          // Verificar se a data é válida
          if (dateObj instanceof Date && !isNaN(dateObj.getTime())) {
            // Formatar para YYYY-MM-DD para o input date HTML
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;
            
            console.log('Data formatada para input HTML:', formattedDate);
            this.editedCard.dueDate = formattedDate as any;
          } else {
            console.error('Data inválida recebida:', this.editedCard.dueDate);
            this.editedCard.dueDate = undefined;
          }
        } catch (error) {
          console.error('Erro ao processar data de vencimento:', error);
          this.editedCard.dueDate = undefined;
        }
      }
      
      // Make sure we have arrays for tags and attachments
      this.editedCard.tags = this.editedCard.tags || [];
      this.editedCard.attachments = this.editedCard.attachments || [];
      
      // Ensure order is set
      if (typeof this.editedCard.order !== 'number') {
        this.editedCard.order = 0;
      }
    } else {
      this.editedCard = this.createEmptyCard();
    }
  }

  onSave(): void {
    // Validate title
    if (!this.editedCard.title.trim()) {
      this.titleError = "O título é obrigatório";
      return;
    }

    if (this.editedCard.title.length > 50) {
      this.titleError = "O título deve ter no máximo 50 caracteres";
      return;
    }

    // Ensure all required fields are set
    if (typeof this.editedCard.order !== 'number') {
      this.editedCard.order = 0;
    }
    
    // Ensure tags and attachments are arrays
    this.editedCard.tags = this.editedCard.tags || [];
    this.editedCard.attachments = this.editedCard.attachments || [];
    
    // Processar a data de vencimento para o formato correto
    let processedDueDate: string | Date | undefined = undefined;
    
    if (this.editedCard.dueDate) {
      try {
        console.log('Processando data para salvar:', this.editedCard.dueDate);
        
        // Se for string de input HTML (YYYY-MM-DD), converter para Date
        if (typeof this.editedCard.dueDate === 'string') {
          // Criar objeto Date a partir da string
          const dateObj = new Date(this.editedCard.dueDate);
          
          if (!isNaN(dateObj.getTime())) {
            // Data válida, usar objeto Date
            processedDueDate = dateObj;
            console.log('Data convertida para objeto Date:', processedDueDate);
          } else {
            console.error('Data inválida ao salvar:', this.editedCard.dueDate);
          }
        } else if (this.editedCard.dueDate instanceof Date) {
          // Já é um objeto Date, usar diretamente
          processedDueDate = this.editedCard.dueDate;
          console.log('Usando objeto Date existente:', processedDueDate);
        }
      } catch (error) {
        console.error('Erro ao processar data para salvar:', error);
      }
    }
    
    const cardToSave: Card = {
      ...this.editedCard,
      dueDate: processedDueDate
    };
    
    console.log('Card preparado para salvar:', cardToSave);
    this.save.emit(cardToSave);
  }

  onClose(): void {
    this.close.emit()
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains("modal-overlay")) {
      this.onClose()
    }
  }

  toggleTag(tag: Tag): void {
    const index = this.editedCard.tags!.findIndex((t) => t.id === tag.id)
    if (index === -1) {
      this.editedCard.tags!.push(tag)
    } else {
      this.editedCard.tags!.splice(index, 1)
    }
  }

  isTagSelected(tagId: string): boolean {
    return this.editedCard.tags!.some((t) => t.id === tagId)
  }

  private createEmptyCard(): Card {
    return {
      id: "card_" + Date.now(),
      title: "",
      description: "",
      tags: [],
      attachments: [],
      order: 0,
    }
  }
}

