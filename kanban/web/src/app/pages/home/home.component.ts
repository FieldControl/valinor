import { Component } from '@angular/core';
import { ApiServiceService, Board } from 'src/app/core/api/api-service.service';
import { BoardModalComponent } from './components/board-modal/board-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { HomeService } from './home.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  boards: Board[] = [];

  constructor(
    private apiService: ApiServiceService,
    private MatDialog: MatDialog,
    private HomeService: HomeService
  ) {}

  openDialog() {
    const dialogRef = this.MatDialog.open(BoardModalComponent, {
      width: '450px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
    });
  }

  ngOnInit() {
    this.HomeService.search$.subscribe(async () => {
      this.boards = await firstValueFrom(
        this.apiService.getBoards()
      );
    });
    this.HomeService.search$.next();
  }
}
