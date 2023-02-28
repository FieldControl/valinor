import { ChampionService } from '../../components/shared/champion.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private championService: ChampionService) { }

  ngOnInit(): void {
    this.championService.createDataBase().subscribe(msg => console.log(msg))
  }

}
