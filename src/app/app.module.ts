import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AgentsCardComponent } from './components/agents-card/agents-card.component';
import { apiService } from './service.service';
import { AgentListComponent } from './components/agent-list/agent-list.component';

@NgModule({
  declarations: [
    AppComponent,
    AgentsCardComponent,
    AgentListComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [apiService],
  bootstrap: [AppComponent]
})



export class AppModule { }
