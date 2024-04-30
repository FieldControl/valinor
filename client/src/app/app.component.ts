import { Component } from '@angular/core'; // Importação do decorador Component do Angular

@Component({
  selector: 'app-root', // Seletor do componente, usado no arquivo de template
  templateUrl: './app.component.html', // URL do arquivo de template
  styleUrls: ['./app.component.css'] // Estilos CSS específicos para este componente
})
export class AppComponent {
  title = 'client'; // Propriedade title que pode ser usada no template para exibir o título da aplicação
}
