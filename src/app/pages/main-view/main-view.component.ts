import { Component, OnInit } from '@angular/core';
import { Board } from 'src/app/models/board-models';
import { Column } from 'src/app/models/column.model';


@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.scss']
})
export class MainViewComponent implements OnInit {
  constructor() { }

  board: Board = new Board('test Board', [
    new Column('Ideas', [
      "Some random idea",
      "Another one",
      "One more"
    ]),
    new Column('Research', [
      "abc",
      "lorem ipsum",
      "this is a new column"
    ]),
    new Column('To do', [
      "abc",
      "lorem ipsum",
      "this is a new column"
    ]),
    new Column('Done', [
      "abc",
      "lorem ipsum",
      "this is a new column"
    ])
  ]);

  ngOnInit() {
  }

}
