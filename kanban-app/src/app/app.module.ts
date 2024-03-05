import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KanbanModule } from './kanban.modules';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule, NgForOf } from '@angular/common';


@Module({
  imports: [KanbanModule,
    BrowserModule,
    CommonModule,
    NgForOf
  ],
  declarations: [
    AppComponent
  ],
  controllers: [AppController],
  providers: [AppService],
  bootstrap: [AppComponent]
})
export class AppModule { }