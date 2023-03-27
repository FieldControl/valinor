import { NgModule } from '@angular/core';
import { HeroDetailsComponent } from './hero-details.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [
    HeroDetailsComponent,
  ],
  imports: [
    SharedModule,
    RouterModule
  ]
})

export class HeroDetailsModule { }
