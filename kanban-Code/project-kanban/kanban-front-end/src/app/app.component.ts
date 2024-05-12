import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainViewComponent } from './pages/main-view/main-view.component';
import { HttpClientModule} from '@angular/common/http';
import { DragDropModule } from '@angular/cdk/drag-drop';



@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    imports: [RouterOutlet, MainViewComponent,DragDropModule,HttpClientModule]
})
export class AppComponent {
  title = 'kanban-front-end';

  
}
