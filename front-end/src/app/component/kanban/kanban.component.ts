import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Kanban } from '../kanban';
import Swal from 'sweetalert2'
import { KanbanService } from 'src/app/kanban.service';
import { Card } from '../card';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { CardService } from 'src/app/card.service';

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
    private serviceCard: CardService
  ) { }

  drop(event: CdkDragDrop<Card[], any>, kanban: Kanban) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      // this.serviceKanban.update(kanban).subscribe((kanban: Kanban) => {

      // })
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex)
    }
  }

  saveListName(kanban: Kanban) {
    this.serviceKanban.update(kanban).subscribe((response: any) => {
      this.editListName = "";
    })
  }

  deleteList(id: string) {
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
        this.serviceKanban.delete(id).subscribe((response: any) => {
          this.kanban = this.kanban?.filter(obj => obj.id !== id);
          Swal.fire({
            icon: 'success',
            title: `${response.kanban.name} deletado com sucesso`
          })
        })
      }
    })
  }

  async addList() {
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

    if (nameList) {
      const newList: Kanban = {
        name: nameList
      }
      this.serviceKanban.create(newList).subscribe((response: any) => {
        this.kanban.push(response.kanban);
        Swal.fire({
          title: response.message,
          icon: 'success'
        })
      })

    }
  }

  addCard(newCardTitle: HTMLInputElement, kanban_id: string) {
    const indexList = this.kanban.findIndex(obj => obj.id === kanban_id);
    const newCard: Card = {
      title: newCardTitle.value,
      kanban_id: kanban_id
    }
    this.serviceKanban.createCardInKanban(newCard, kanban_id).subscribe((response: any) => {
      console.log(response);
      this.kanban[indexList].cards!.push(newCard);
    })
    newCardTitle.value = "";
  }

  onCardRemoved(card_id:string){
    debugger
    this.kanban.forEach((kanban) => {
      kanban.cards = kanban.cards!.filter(card => card.id !== card_id)
    })
  }

  ngOnInit(): void {
    this.serviceKanban.list().subscribe((kanban: Kanban[]) => {
      this.kanban = kanban;
      this.kanban.forEach((kanban) => {
        this.serviceKanban.listCardKanban(kanban.id!).subscribe((card: Card[])=>{
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
