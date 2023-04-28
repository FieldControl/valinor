import { Injectable } from '@angular/core';

export enum KeyType {
  REPO = 'REPO',
}

@Injectable({ providedIn: 'root' })
export class SessionStorageService {
  constructor() {}

  /**
   * Verifica se existe uma chave salva na sessão.
   * @param {KeyType} key Chave de acesso para consulta na sessão.
   */
  public has(key: KeyType): boolean {
    return key in sessionStorage;
  }

  /**
   * Salva um conteúdo na sessão no formato JSON.
   * @param {KeyType} key Chave de acesso para salvar o conteúdo na sessão.
   */
  public set(key: KeyType, value: any): void {
    this.remove(key);
    sessionStorage.setItem(key, JSON.stringify(value));
  }

  /**
   * Traz um conteúdo da sessão no formato JSON e retorna como objeto JS.
   * @param {KeyType} key Chave de acesso para trazer o conteúdo da sessão.
   */
  public get(key: KeyType): any {
    return JSON.parse(sessionStorage.getItem(key) || 'null');
  }

  /**
   * Remove um conteúdo da sessão.
   * @param {KeyType} key Chave de acesso para remover o conteúdo da sessão.
   */
  public remove(key: KeyType): void {
    sessionStorage.removeItem(key);
  }

  /**
   * Reseta a sessão.
   */
  public clear() {
    sessionStorage.clear();
  }
}
