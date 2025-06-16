// src/app/notification-component/notification-component.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../notificacao'; // Importe o serviço
import { Subscription, timer } from 'rxjs'; // timer para a duração, Subscription para gerenciar
import { takeUntil } from 'rxjs/operators'; // Para gerenciar a expiração
import { Subject } from 'rxjs'; // Para o takeUntil

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
  private destroy$ = new Subject<void>(); // Para desinscrever ao destruir

  constructor(private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.notificationSubscription = this.notificationService.notification$
      .pipe(takeUntil(this.destroy$)) // Garante que a inscrição é encerrada
      .subscribe(notification => {
        this.currentNotification = notification;
        if (notification.duration) {
          // Inicia um timer para ocultar a notificação após a duração
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