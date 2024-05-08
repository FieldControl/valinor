import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CardComponent } from './pages/board/components/card/card.component';
import { ColumnComponent } from './pages/board/components/column/column.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { BoardComponent } from './pages/board/board.component';
import { HeaderComponent } from './core/components/header/header.component';
import { FooterComponent } from './core/components/footer/footer.component';
import { HomeComponent } from './pages/home/home.component';
import { CardBoardComponent } from './pages/home/components/card-board/card-board.component';
import { HttpClientModule } from '@angular/common/http';
import { BoardModalComponent } from './pages/home/components/board-modal/board-modal.component';
import { CdkDropList, DragDropModule } from '@angular/cdk/drag-drop';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { ColumnModalComponent } from './pages/board/components/column-modal/column-modal.component';
import { TaskModalComponent } from './pages/board/components/column/task-modal/task-modal.component';
import { EditModalComponent } from './pages/board/components/edit-modal/edit-modal.component';

@NgModule({
  declarations: [
    AppComponent,
    CardComponent,
    ColumnComponent,
    BoardComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    CardBoardComponent,
    BoardModalComponent,
    ColumnModalComponent,
    TaskModalComponent,
    EditModalComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatIconModule,
    HttpClientModule,
    DragDropModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    FormsModule,
    CdkDropList,
    MatDividerModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
