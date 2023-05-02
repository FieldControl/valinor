import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-result-list',
  templateUrl: './result-list.component.html',
  styleUrls: ['./result-list.component.scss'],
})
export class ResultListComponent implements OnInit {

  // This code defines an `@Input()` decorator that is used to declare a component property as an input property.
  @Input() repos!: any;

  constructor() {}
  ngOnInit(): void {}
}
