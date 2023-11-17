import { Component, OnInit, OnDestroy } from '@angular/core';
import { GetDataApiGitHub } from '../../services/get-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-modal-error',
  templateUrl: './modal-error.component.html',
  styleUrl: './modal-error.component.css'
})
export class ModalErrorComponent implements OnInit, OnDestroy {
  menssage: string = '';
  state: boolean = false;

  private subscription!: Subscription;

  constructor(private dataService: GetDataApiGitHub) { }

  ngOnInit(): void {

    /*-- Function responsible for taking data from the observer and populating the array --*/
    this.subscription = this.dataService.currentMessage.subscribe({
      next: (res: Array<any>) => {
        const [data] = res;

        if (data === 403) {
          this.state = true;
          this.menssage = 'A API do GitHup excedeu seu limite de 10 consultas por hora, tente novamente mais tarde';
        }

        if (data === 401) {
          this.state = true;
          this.menssage = 'Erro na autenticação da API';
        }
      },

      error(err) {
        console.log('Opa deu erro', err);
      },
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  closeModal(): void {
    this.state = !this.state;
  }
}
