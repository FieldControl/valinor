import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../notificacao'; 
import { Subscription, timer } from 'rxjs'; 
import { takeUntil } from 'rxjs/operators'; 
import { Subject } from 'rxjs'; 

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-component.html',
  styleUrl: './notification-component.scss'
})
export class NotificationComponent implements OnInit, OnDestroy {
  currentNotification: Notification | null = null;
  private notificationSubscription!: Subscription;
  private destroy$ = new Subject<void>(); 

  constructor(private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.notificationSubscription = this.notificationService.notification$
      .pipe(takeUntil(this.destroy$)) 
      .subscribe(notification => {
        this.currentNotification = notification;
        if (notification.duration) {
          timer(notification.duration)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
              this.currentNotification = null;
            });
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Método para fechar manualmente a notificação
  closeNotification(): void {
    this.currentNotification = null;
  }
}