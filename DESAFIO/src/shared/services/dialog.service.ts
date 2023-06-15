import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  constructor(private alertController: AlertController) {}

  async confirm(message: string): Promise<boolean> {
    const alert = await this.alertController.create({
      header: 'Confirmação',
      message: message,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            return false; // Cancelar ação
          },
        },
        {
          text: 'Confirmar',
          handler: () => {
            return true; // Confirmar ação
          },
        },
      ],
    });

    await alert.present();

    const result = await alert.onDidDismiss();
    return result.role === 'confirm';
  }
}
