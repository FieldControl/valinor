import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-topics',
  templateUrl: './topics.component.html',
  styleUrls: ['./topics.component.sass']
})
export class TopicsComponent implements OnInit {
  //Input responsável por trazer informação dos tópicos do elemento pai
  @Input() topics!: any

  constructor() { }

  ngOnInit(): void {
  }

}
