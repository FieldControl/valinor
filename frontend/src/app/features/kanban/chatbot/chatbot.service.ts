import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';


@Injectable({ providedIn: 'root' })
export class ChatbotService {
  constructor(private http: HttpClient) { }

  private baseUrl = `${environment.apiUrl}`;

  sendMessage(message: string) {
    return this.http.post<{ toolCalls: boolean; message: string; timestamp: Date }>(
      `${this.baseUrl}/chatbot`,
      {
        message: message,
      },
      {
        withCredentials: true
      }
    )
  }

}
