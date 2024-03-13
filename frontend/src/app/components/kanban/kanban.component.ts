import { ExceptionErrorsMessage } from './../../utils/exception-errors-message';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Kanban } from '../../models/kanban';
import Swal from 'sweetalert2'
import { KanbanService } from 'src/app/services/kanban.service';
import { Card, CardUpdate } from '../../models/card';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { CardService } from 'src/app/services/card.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-kanban',
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.css']
})
export class KanbanComponent implements OnInit {

  @Input() kanban: Kanban[] = [];
  editListName: string = "";
  addCardName: string = "";
  searchCard: any;

  constructor(
    private serviceKanban: KanbanService,
    private serviceCard: CardService,
    private errorMessages: ExceptionErrorsMessage
  ) { }

  drop(event: CdkDragDrop<Card[], any>, kanban_id: string) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex)
      const moveCardUpdate: CardUpdate = {
        id: event.item.data,
        kanban_id: kanban_id,
      };
      this.serviceCard.updateCard(moveCardUpdate).subscribe();
      this.attOrderCard(event.previousContainer.data);
    }

    this.attOrderCard(event.container.data);

  }

  private attOrderCard(cards: Card[]) {
    cards.map((card: Card, index: number) => {
      card.order = index;
      this.serviceCard.updateCard(card).subscribe();
    });
  }

  async   saveListName(kanban: Kanban) {
    this.serviceKanban.update(kanban).subscribe((response: any) => {
      this.editListName = "";
    }, (exception: HttpErrorResponse) => this.errorMessages.exceptionError(exception)
    )
  }

  deleteListQuestion(id: string) {
    Swal.fire({
      icon: "error",
      title: "Deletar Lista ?",
      html: "Ao proceguir voce irá deletar a lista e todos os Cartões que nela está <b>Não terá como reverter !!</b>",
      confirmButtonText: "Deletar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#0d6efd",
      showCancelButton: true,
      allowOutsideClick: false
    }).then((response) => {
      if (response.isConfirmed) {
        this.deleteList(id);
      }
    })
  }

  async deleteList(id: string) {
    this.serviceKanban.delete(id).subscribe((response: any) => {
      this.kanban = this.kanban?.filter(obj => obj.id !== id);
      Swal.fire({
        icon: 'success',
        title: `${response.kanban.name} deletado com sucesso`
      })
    }, (exception: HttpErrorResponse) => this.errorMessages.exceptionError(exception))
  }

  async addList() {
    const nameList = await this.showAddListSwal();

    if (nameList) {
      const newList: Kanban = {
        name: nameList,
        cards: []
      }

      return this.createAndAddKanban(newList)
    }
  }

  async createAndAddKanban(newList: Kanban) {
    this.serviceKanban.create(newList).subscribe((response: any) => {
      console.log('Response', response.kanban);

      this.kanban.push(response.kanban);
      Swal.fire({
        title: response.message,
        icon: 'success'
      });
      return newList;
    }, (exception: HttpErrorResponse) => this.errorMessages.exceptionError(exception))
  }

  private async showAddListSwal(): Promise<string | undefined> {
    const { value: nameList } = await Swal.fire({
      title: "Adicionar Lista",
      input: 'text',
      inputLabel: 'Digite o nome da Lista',
      showCancelButton: true,
      cancelButtonColor: "#dc3545",
      confirmButtonColor: "#0d6efd",
      cancelButtonText: "Cancelar",
      confirmButtonText: "Salvar",
      inputValidator: (value) => {
        if (!value) {
          return "O campo não pode ficar vazio";
        }
        return;
      },
    });

    return nameList
  }

  async addCard(newCardTitle: string, kanban_id: string) {
    const indexList = this.kanban.findIndex(obj => obj.id === kanban_id);
    let newOrder: number = 0;
    if (this.kanban[indexList].cards && this.kanban[indexList].cards!.length > 0) {
      newOrder = this.kanban[indexList].cards!.length;
    }
    const newCard: Card = {
      id: '',
      title: newCardTitle,
      kanban_id: kanban_id,
      order: newOrder
    }
    this.serviceKanban.createCardInKanban(newCard, kanban_id).subscribe(
      (response: any) => {
        newCard.id = response.card.id
        if (!this.kanban[indexList].cards) {
          this.kanban[indexList].cards = []
        }
        this.kanban[indexList].cards.push(newCard);
      },
      (exception: HttpErrorResponse) => this.errorMessages.exceptionError(exception)
    );
    const inputElement = document.querySelector('#newCardTitle');
    if (inputElement!==null){
      const input: HTMLInputElement = inputElement as HTMLInputElement;
      input.value = '';
    }
  }

  onCardRemoved(card_id: string) {
    this.kanban.forEach((kanban) => {
      kanban.cards = kanban.cards!.filter(card => card.id !== card_id)
    })
  }

  ngOnInit(): void {
    this.serviceKanban.list().subscribe((kanban: Kanban[]) => {
      this.kanban = kanban;
      this.kanban.forEach((kanban) => {
        this.serviceKanban.listCardKanban(kanban.id!).subscribe((card: Card[]) => {
          kanban.cards = card
        })
      })
    });

    const slider = document.getElementById("page_kanban");
    let startX: number;
    let scrollLeft: any;
    let isDown: boolean = false;
    slider?.addEventListener('mousedown', (e) => {
      isDown = true;
      startX = e.pageX - slider.offsetLeft
      scrollLeft = slider.scrollLeft
    });
    slider?.addEventListener('mouseleave', (e) => {
      isDown = false
    });
    slider?.addEventListener('mouseup', (e) => {
      isDown = false
    });
    slider?.addEventListener('mousemove', (e) => {
      if (!isDown) {
        return;
      }
      e.preventDefault
      const x = e.pageX - slider.offsetLeft
      const walk = x - startX
      slider.scrollLeft = scrollLeft - walk;
    });
  }
}
