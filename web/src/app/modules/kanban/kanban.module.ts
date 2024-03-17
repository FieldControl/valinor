import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DragDropModule } from 'primeng/dragdrop';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { CardComponent } from './components/card/card.component';
import { ColumnsComponent } from './components/columns/columns.component';
import { DialogComponent } from './components/dialog/dialog.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { KanbanRoutingModule } from './kanban-routing.module';

@NgModule({
  declarations: [
    DashboardComponent,
    HeaderComponent,
    ColumnsComponent,
    CardComponent,
    DialogComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    KanbanRoutingModule,
    SharedModule,
    DynamicDialogModule,
    ConfirmDialogModule,
    DragDropModule,
  ],
  providers: [DialogService, ConfirmationService],
})
export class KanbanModule {}
