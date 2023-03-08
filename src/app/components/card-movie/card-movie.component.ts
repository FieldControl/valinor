import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card-movie',
  templateUrl: './card-movie.component.html',
  styleUrls: ['./card-movie.component.css']
})
export class CardMovieComponent {
  @Input() academyAwardNominations?: string
  @Input() academyAwardWins?: string
  @Input() boxOfficeRevenueInMillions?: string
  @Input() budgetInMillions?: string
  @Input() titleMovie?: string
  @Input() rottenTomatoesScore?: string
  @Input() runtimeInMinutes?: string
}
