import { Component, OnInit } from '@angular/core';
import { TimesService } from './services/times.service';

@Component({
  selector: 'app-times',
  templateUrl: './times.component.html',
  styleUrls: ['./times.component.css']
})
export class TimesComponent  implements OnInit{
  tabela!: any;
  ngOnInit(): void {
    this.tabela = this.timesService.getTimes();
  }
  constructor(private timesService:TimesService) { }
}

