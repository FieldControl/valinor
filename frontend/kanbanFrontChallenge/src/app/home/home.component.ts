import { Component, OnInit } from '@angular/core';
import { KanbanComponent } from '../kanban/kanban.component';
import { ApiService } from '../services/api.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  kanban: any = [];
  filteredKanban: any[] = [];

  constructor(private apiService: ApiService,
              private dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.apiService.getAllKanbans().subscribe((kanbans) => {
      this.kanban = kanbans;
      this.filteredKanban = this.kanban;
      console.log('Kanbans:', kanbans);
    });
     }

  filterChanged(ev: MatSelectChange) {
    const value = ev.value;
    this.filteredKanban = this.kanban;
    if (value) {
      this.filteredKanban = this.filteredKanban.filter(t => t.status === value);
      console.log(this.filteredKanban);
    } else {
      this.filteredKanban = this.kanban;
    }
  }
 
  openDialog() {
    const dialogRef = this.dialog.open(KanbanComponent, {
      width: '500px',
      hasBackdrop: true,
      role: 'dialog',
      height: '500px'
    });

    dialogRef.afterClosed().subscribe(data => {
      this.apiService.createKanban(data.title, data.description).subscribe((result: any) => {
        console.log(result);
        this.kanban.push(result);
        this.filteredKanban = this.kanban;
      });
    });
  }


  statusChanged(ev: MatSelectChange, kanbanId: number, index: number) {
    const value = ev.value;
    this.apiService.updateStatus(value, kanbanId).subscribe(kanban => {
      this.kanban[index] = kanban;
      this.filteredKanban = this.kanban;
    });
  }

 
  delete(id: number) {
    if (confirm('Voce realmente quer remover o kanban?')) {
      this.apiService.deleteKanban(id).subscribe(res => {
        // @ts-ignore
        if (res.success) {
          this.kanban = this.kanban.filter((t: any) => t.id !== id);
          this.filteredKanban = this.kanban;
        }
      });
    }
  }
}
