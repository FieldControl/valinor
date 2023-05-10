import { Component } from '@angular/core';
import { IonicPage, Modal, ModalController, NavController, NavParams, ViewController } from 'ionic-angular';

/**
 * Generated class for the FilterPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-filter',
  templateUrl: 'filter.html',
})
export class FilterPage {

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public viewCtrl: ViewController,
    public modalCtrl: ModalController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FilterPage');
  }
  fechar() {
    this.viewCtrl.dismiss();
  }

}
