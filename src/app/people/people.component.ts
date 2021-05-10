import { Component, OnInit } from '@angular/core';
import { StarWarsService } from '../app.service';

@Component({
  selector: 'app-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.scss'],
})
export class PeopleComponent implements OnInit {
  constructor(private starwarsService: StarWarsService) {}

  ngOnInit(): void {}
}
