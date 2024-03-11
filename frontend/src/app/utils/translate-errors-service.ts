import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TranslateErrorsService {
  translateCodeError(statusCode: number): string {
    switch (statusCode) {
      case 400:
        return 'Solicitação inválida';
      case 401:
        return 'Não autorizado';
      case 403:
        return 'Proibido';
      case 404:
        return 'Recurso não encontrado';
      case 405:
        return 'Método não permitido';
      case 406:
        return 'Não aceitável';
      case 407:
        return 'Autenticação de proxy necessária';
      case 408:
        return 'Tempo limite de solicitação';
      case 409:
        return 'Conflito';
      case 410:
        return 'Recurso não disponível';
      case 411:
        return 'Comprimento necessário';
      case 412:
        return 'Falha na pré-condição';
      case 413:
        return 'Entidade de solicitação muito grande';
      case 414:
        return 'URI de solicitação muito longa';
      case 415:
        return 'Tipo de mídia não suportado';
      case 429:
        return 'Muitas solicitações';
      case 500:
        return 'Erro interno do servidor';
      case 501:
        return 'Não implementado';
      case 502:
        return 'Gateway ruim';
      case 503:
        return 'Serviço indisponível';
      case 504:
        return 'Tempo limite de gateway';
      case 505:
        return 'Versão HTTP não suportada';
      default:
        return `Erro desconhecido (${statusCode})`;
    }
  }
}
