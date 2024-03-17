import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MessageErrorComponent } from './components/message-error/message-error.component';

@NgModule({
  declarations: [MessageErrorComponent],
  imports: [CommonModule],
  exports: [MessageErrorComponent],
})
export class SharedModule {}
