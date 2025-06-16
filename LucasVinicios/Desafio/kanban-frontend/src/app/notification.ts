import { Injectable, StreamingResourceOptions } from "@angular/core";
import { Subject } from "rxjs";

export interface Notification {
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration?: number
}

@Injectable({
  providedIn: "root"
})

export class NotificationService {
  private notificationSubject = new Subject<Notification>()

  notification$ = this.notificationSubject.asObservable();

  show(message: string, type: Notification['type'] = 'info', duration: number = 3000): void{
    this,this.notificationSubject.next({message, type, duration});
  }

   success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number): void {
    this.show(message, 'error', duration);
  }

  info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration);
  }

}