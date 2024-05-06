import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { KanbansService } from './kanbans.service';

@Component({
  selector: 'app-kanbans',
  templateUrl: './kanbans.component.html',
  styleUrl: './kanbans.component.css'
})
export class KanbansComponent implements OnInit {

  kanbans$ : Observable<any> | undefined;

  constructor(private kanbanService : KanbansService){}

  ngOnInit(): void {
    this.kanbans$ = this.kanbanService.getKanbans()
  }

  
}
