import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullValuesPipe } from './non-null-values.pipe';

@NgModule({
  declarations: [NonNullValuesPipe],
  imports: [CommonModule],
})
export class PipesModule {}
