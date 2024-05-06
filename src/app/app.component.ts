import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MyKeanuListService } from './services/myKeanuListService/my-keanu-list.service';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { ButtonComponent } from './components/button/button.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule,HeaderComponent,FooterComponent,ButtonComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  data: any[] = [];
  constructor(private apiService:MyKeanuListService){}

  ngOnInit(): void {
      this.gettingData();
  }

  gettingData(){
    this.apiService.getKeanuSerie().subscribe(data => {
      this.data = data;
      console.log(this.data);
    })
  }

  gettingTenData(){
    this.apiService.getfilterTenKeanu().subscribe(data => {
      this.data = data;
      console.log(this.data);
    })
  }
}
