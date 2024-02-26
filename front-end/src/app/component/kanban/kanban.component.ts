import { Component, Input, OnInit } from '@angular/core';
import { Kanban } from '../kanban';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-kanban',
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.css']
})
export class KanbanComponent implements OnInit {

  @Input() kanban: Kanban[] = [
    {
      id: 1,
      name: "To Do",
      cards: [
        {
          id: 1,
          title: "Fazer convite padrinhos",
          date_created: new Date("2024-02-22 08:00"),
          date_end: null,
          badges: [
            {
              name: "badge Laranja",
              cor: "#FF5733"
            }
          ],
          description: "",
        }
      ]
    },
    {
      id: 2,
      name: "In Progress",
      cards: [
        {
          id: 2,
          title: "Contratar porta",
          date_created: new Date("2024-02-22 08:00"),
          date_end: new Date("2024-02-29 08:00"),
          badges: [
            {
              name: "badge Azul",
              cor: "#0000FF",
            }
          ],
          description: `Lorem ipsum dolor sit amet, consectetur adipiscing
            elit.Duis aliquam ipsum sit amet erat ullamcorper venenatis sed eu
            arcu.Etiam pharetra magna eget tortor laoreet, eu imperdiet nisl tincidunt.Ut nec ipsum orci.`
        }
      ]
    },
    {
      id: 3,
      name: "Done",
      cards: []
    }
  ];
  editListName: number = 0;
  addCardName: number = 0;

  constructor() {  }
  saveListName(id: number) {
    this.editListName = 0;
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
        const name = this.kanban?.find(obj => obj.id === id)?.name;
        this.kanban = this.kanban?.filter(obj => obj.id !== id);
        Swal.fire({
          icon: 'success',
          title: `${name} deletado com sucesso`
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
      inputValidator: (value) => {
        if (!value) {
          return "O campo não pode ficar vazio";
        }
        return;
      },
      cancelButtonColor: "#dc3545",
      confirmButtonColor: "#0d6efd",
      cancelButtonText: "Cancelar",
      confirmButtonText: "Salvar"
    });

    if (nameList) {
      const lastId = this.kanban[this.kanban.length - 1].id;
      this.kanban.push({
        id: lastId + 1,
        name: nameList,
        cards: []
      });
    }
  }

  addCard(newCardTitle:HTMLInputElement,idList:Number) {
    const indexList = this.kanban.findIndex(obj => obj.id === idList);
    const lastId = this.kanban.reduce((maior, obj) => {
      const maxId = obj.cards.reduce((max, card) => Math.max(max, card.id), 0);
      return Math.max(maior, maxId);
    }, 0);
    this.kanban[indexList].cards.push({
      id: lastId+1,
      title: newCardTitle.value,
      date_created: new Date(),
      date_end: null,
      badges: [],
      description: null
    })
    newCardTitle.value = "";
  }

  ngOnInit(): void {
    const slider = document.getElementById("page_kanban");
    let startX:number;
    let scrollLeft:any;
    let isDown:boolean = false;
    slider?.addEventListener('mousedown',(e) => {
      isDown = true;
      startX = e.pageX - slider.offsetLeft
      scrollLeft = slider.scrollLeft
      console.log(startX);

    });
    slider?.addEventListener('mouseleave',(e) => {
      isDown = false
    });
    slider?.addEventListener('mouseup',(e) => {
      isDown = false
    });
    slider?.addEventListener('mousemove',(e) => {
      if(!isDown){
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
