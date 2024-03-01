import { Component, Input, OnInit } from '@angular/core';
import { Kanban } from '../kanban';
import Swal from 'sweetalert2'
import { KanbanService } from 'src/app/kanban.service';
import { Card } from '../card';

@Component({
  selector: 'app-kanban',
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.css']
})
export class KanbanComponent implements OnInit {

  @Input() kanban: Kanban[] = [];
  editListName: number = 0;
  addCardName: number = 0;

  constructor(private service: KanbanService) { }

  saveListName(kanban: Kanban) {
    this.service.update(kanban).subscribe((kanban: Kanban) => {
      this.editListName = 0;
    })
  }

  deleteList(id: number) {
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
        this.service.delete(id).subscribe((kanban: Kanban) => {
          this.kanban = this.kanban?.filter(obj => obj.id !== id);
          Swal.fire({
            icon: 'success',
            title: `${kanban.name} deletado com sucesso`
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
      const lastId = this.kanban[this.kanban.length - 1].id;
      const newList = {
        id: lastId + 1,
        name: nameList,
        cards: []
      }
      this.service.create(newList).subscribe((kanban: Kanban) => {
        this.kanban.push(kanban);
      })

    }
  }

  addCard(newCardTitle: HTMLInputElement, idList: number) {
    const indexList = this.kanban.findIndex(obj => obj.id === idList);
    const lastId = this.kanban.reduce((maior, obj) => {
      const maxId = obj.cards.reduce((max, card) => Math.max(max, card.id), 0);
      return Math.max(maior, maxId);
    }, 0);
    const newCard: Card = {
      id: lastId + 1,
      title: newCardTitle.value,
      date_created: new Date(),
      date_end: null,
      badges: [],
      description: null
    }
    this.service.createCard(newCard,idList).subscribe((card: Card) => {
      this.kanban[indexList].cards.push(card);
    })
    newCardTitle.value = "";
  }

  ngOnInit(): void {
    this.service.list().subscribe((kanban: Kanban[]) => {
      this.kanban = kanban;
    });

    const slider = document.getElementById("page_kanban");
    let startX: number;
    let scrollLeft: any;
    let isDown: boolean = false;
    slider?.addEventListener('mousedown', (e) => {
      isDown = true;
      startX = e.pageX - slider.offsetLeft
      scrollLeft = slider.scrollLeft
      console.log(startX);

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
      // console.count(isDown);
      const walk = x - startX
      slider.scrollLeft = scrollLeft - walk;
    });
  }

}
