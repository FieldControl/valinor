import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TimesComponent } from './times/times.component';
import { JogadorComponent } from './jogador/jogador.component';
import { AppComponent } from './app.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { HomeComponent } from './home/home.component';


const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'times', component: TimesComponent},
    {path: 'jogador', component: JogadorComponent},
    {path: '**', component: PagenotfoundComponent}

];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }

