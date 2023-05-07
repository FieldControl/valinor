import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';

import { HeaderComponent } from './components/header/header.component';
import { ToggleThemeComponent } from './components/toggle-theme/toggle-theme.component';
import { CustomPaginatorComponent } from './components/custom-paginator/custom-paginator.component';
import { MessageDialogComponent } from './components/message-dialog/message-dialog.component';

@NgModule({
  declarations: [HeaderComponent, ToggleThemeComponent, CustomPaginatorComponent, MessageDialogComponent],
  imports: [CommonModule, NgxPaginationModule],
  exports: [HeaderComponent, ToggleThemeComponent, CustomPaginatorComponent, MessageDialogComponent],
})
export class SharedModule {}
