import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RepositorioPage } from './repositorio';

@NgModule({
  declarations: [
    RepositorioPage,
  ],
  imports: [
    IonicPageModule.forChild(RepositorioPage),
  ],
})
export class RepositorioPageModule {}
