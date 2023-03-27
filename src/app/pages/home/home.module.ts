import { NgModule } from '@angular/core';
import { HomeComponent } from './home.component';
import { HeroesListComponent } from 'src/app/components/heroes-list/heroes-list.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';



@NgModule({
  declarations: [
    HomeComponent,
    HeroesListComponent
  ],
  imports: [
    SharedModule,
    MatPaginatorModule,
    BrowserAnimationsModule,
    RouterModule,
  ]
})

export class HomeModule { }
