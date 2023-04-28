import { EventEmitter, Injectable } from '@angular/core';
import { ALERT_THEME } from '../utils/theme';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  public notifier = new EventEmitter<any>();
  public alertTheme = ALERT_THEME;

  constructor(private router: Router) {}

  public notify(message: string): void {
    this.notifier.emit(message);
  }

  public showModal(
    title: string,
    text: string,
    icon: 'error' | 'success',
    confirmButtonText: string,
    hasRoute: boolean = false,
    route?: string
  ): void {
    Swal.fire({
      title: title,
      text: text,
      icon: icon,
      background: this.alertTheme.background,
      iconColor: this.alertTheme.iconColor,
      showCancelButton: false,
      confirmButtonColor: this.alertTheme.confirmButtonColor,
      confirmButtonText: confirmButtonText,
    }).then(() => {
      if (hasRoute) {
        this.router.navigate([route]);
      }
    });
  }
}
