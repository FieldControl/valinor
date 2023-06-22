import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SvgIconComponent } from './components/svg-icon/svg-icon.component';
import { Base64ImagePipe } from './pipes/base64-image.pipe';
import { PaginatorComponent } from './components/paginator/paginator.component';

@NgModule({
  imports: [CommonModule, SvgIconComponent, PaginatorComponent],
  declarations: [Base64ImagePipe],
  exports: [SvgIconComponent, Base64ImagePipe, PaginatorComponent],
})
export class SharedModule {}
