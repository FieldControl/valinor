import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenGeneratorService {
  constructor() {}

  generateRandomKey(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';

    for (let i = 0; i < 20; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      key += characters.charAt(randomIndex);
    }

    return key;
  }
}
