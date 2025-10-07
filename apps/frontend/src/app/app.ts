// Angular Core
import { Component } from '@angular/core';
// Angular Router
import { RouterModule } from '@angular/router';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  template: `
    <div class="min-h-screen bg-gray-100">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [],
})
export class App {
  protected title = 'Kanban Board';
}
