import { Component, OnDestroy } from '@angular/core';
import { Observable, Subscription, map, tap } from 'rxjs';
import { Character } from 'src/app/model/Character.model';
import { CharacterService } from 'src/app/services/character.service';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnDestroy {

  characters$!: Observable<Character[]>
  count$!: Observable<number>

  pages!: number[]

  count!: number
  offset: number = 0
  currentPage: number = 1

  characterFull: string = ''
  character!: string

  subscription!: Subscription

  constructor(
    private characterService: CharacterService,
    private searchService: SearchService
  ) {
    this.loadData()

    this.subscription = searchService.search$.subscribe(character => {
      this.offset = 0
      this.loadData(character)
    })

  }

  loadData(character: string = '', page?: number): void {
    this.character = character
    this.characterFull = character ? `nameStartsWith=${character}` : ''

    this.offset = page ?? this.offset

    this.currentPage = (this.offset / 5)

    this.characters$ = this.characterService.getCharacters(this.offset, this.characterFull).pipe(
      map(response => response.results))

    this.count$ = this.characterService.getCount(this.characterFull).pipe(
      tap(c => this.pages = this.generatePageRange(c))
    )
  }

  generatePageRange(count: number): number[] {
    return [...Array(Math.ceil(count / 5)).keys()].map(e => e + 0)
  }

  changePage(page: number) {
    this.loadData(this.character, page * 5)
  }

  nextPage(): void {
    if (this.offset < this.pages.length * 5) {
      this.offset += 5;
      this.loadData(this.character);
    }
  }

  previousPage(): void {
    if (this.offset == 0) { return }
    this.offset = this.offset - 5
    this.loadData(this.character)
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe()
  }
}