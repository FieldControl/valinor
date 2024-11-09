import { Component } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { TodoComponent } from './to-do/to-do.component';
import { DoingComponent } from './doing/doing.component';
import { DoneComponent } from './done/done.component';
import { HttpClient } from '@angular/common/http';
import { CardFormComponent } from './card-form/card-form.component';
import { CommonModule } from '@angular/common';
import { CardService } from './services/list.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HeaderComponent,
    TodoComponent,
    DoingComponent,
    DoneComponent,
    CardFormComponent,
    CommonModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'frontend';

  showCardForm = false;


  constructor(private http: HttpClient, private listService: CardService) {}



  closeForm() {
    this.showCardForm = false;
  }


  public fetchDetals() {}
}
