import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-mensagem-erro-component',
  templateUrl: './mensagem-erro-component.component.html',
  styleUrls: ['./mensagem-erro-component.component.css']
})
export class MensagemErroComponentComponent {
  @Input() mensagem_erro: string = ''
  @Output() resetar_mensagem_erro: EventEmitter<string> = new EventEmitter

  resetar_mensagem(): void{
    this.resetar_mensagem_erro.emit()
  }

}
