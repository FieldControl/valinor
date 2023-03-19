import {
  Component,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Apollo, gql } from 'apollo-angular';
import { CardsComponent } from './components/cards/cards.component';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css', './responsive/media.css'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit {
  characters: {
    name: string;
    village: string;
    description: string;
    avatarSrc: string;
    rank: string;
  }[] = [];
  searchTerm: string = '';
  filteredCharacters: any;
  form: FormGroup;
  pageCurrent = 1;
  hasMorePages = true;

  constructor(
    private readonly apollo: Apollo,
    private readonly matDialog: MatDialog,
    private readonly formBuilder: FormBuilder
  ) {
    this.form = this.formBuilder.group({
      villages: this.formBuilder.group({
        cloud: this.formBuilder.control(false),
        grass: this.formBuilder.control(false),
        springs: this.formBuilder.control(false),
        leaf: this.formBuilder.control(false),
        mist: this.formBuilder.control(false),
        flower: this.formBuilder.control(false),
        rain: this.formBuilder.control(false),
        sand: this.formBuilder.control(false),
        sound: this.formBuilder.control(false),
        star: this.formBuilder.control(false),
        rock: this.formBuilder.control(false),
        waterfall: this.formBuilder.control(false),
        tides: this.formBuilder.control(false),
      }),
      ranks: this.formBuilder.group({
        chuunin: this.formBuilder.control(false),
        genin: this.formBuilder.control(false),
        jounin: this.formBuilder.control(false),
        kage: this.formBuilder.control(false),
        unknown: this.formBuilder.control(false),
      }),
    });
  }

  onOpenDialogClick(character: any) {
    this.matDialog.open(CardsComponent, {
      data: {
        character,
      },
    });
  }

  onScroll() {
    if (!this.hasMorePages) return;

    this.apollo
      .query<{
        characters: {
          info: any;
          results: any[];
        };
        villages: { results: any[] };
        ranks: { results: any[] };
      }>({
        query: gql`
          query ($page: Int, $villages: [String!]!, $ranks: [String!]!) {
            characters(
              page: $page
              filter: { village: $villages, rank: $ranks }
            ) {
              info {
                count
                pages
                next
                prev
              }
              results {
                _id
                name
                avatarSrc
                description
                rank
                village
                age
                firstAnimeAppearance
                firstMangaAppearance
                notableFeatures
                nameMeaning
              }
            }
          }
        `,
        variables: {
          page: this.pageCurrent + 1,
          villages: Object.keys(this.form.get('villages')?.value).filter(
            (key) => this.form.get('villages')?.value[key]
          ),
          ranks: Object.keys(this.form.get('ranks')?.value).filter(
            (key) => this.form.get('ranks')?.value[key]
          ),
        },
      })
      .subscribe((result) => {
        this.hasMorePages = !!result.data.characters.info.next;
        this.characters = [
          ...this.characters,
          ...result.data.characters.results,
        ];
        this.pageCurrent += 1;
        this.filteredCharacters = this.characters;
      });
  }
  ngOnInit() {
    window.addEventListener('DOMContentLoaded', () => {
      const theme = localStorage.getItem('theme');
      if (theme === 'dark') {
        document.querySelector('body')?.classList.add('theme-dark');
      }
    });

    this.form.get('villages')?.valueChanges.subscribe((value) => {
      const filterVillageSelected = Object.keys(value).filter(
        (village) => value[village]
      );
      this.filterVillage(filterVillageSelected);
    });
    this.form.get('ranks')?.valueChanges.subscribe((value) => {
      const filterRankSelected = Object.keys(value).filter(
        (rank) => value[rank]
      );
      this.filterRank(filterRankSelected);
    });

    this.apollo
      .query<{
        characters: { results: any[] };
        villages: { results: any[] };
        rank: { results: any[] };
      }>({
        query: gql`
          query {
            characters {
              info {
                count
                pages
                next
                prev
              }
              results {
                _id
                rank
                name
                age
                avatarSrc
                description
                village
                firstAnimeAppearance
                firstMangaAppearance
                notableFeatures
                nameMeaning
              }
            }
          }
        `,
      })
      .subscribe((result) => {
        this.characters = result.data.characters.results;
        this.filteredCharacters = this.characters;
      });
  }

  search(searchTerm: string) {
    if (!searchTerm) {
      this.filteredCharacters = this.characters;
    }
    this.apollo
      .query<{
        characters: { results: any[] };
        villages: { results: any[] };
      }>({
        query: gql`
          query ($searchTerm: String) {
            characters(filter: { name: $searchTerm }) {
              info {
                count
                pages
                next
                prev
              }
              results {
                _id
                name
                age
                avatarSrc
                description
                rank
                village
                firstAnimeAppearance
                firstMangaAppearance
                notableFeatures
                nameMeaning
              }
            }
          }
        `,
        variables: {
          searchTerm,
        },
      })
      .subscribe((result) => {
        this.characters = result.data.characters.results;
        this.filteredCharacters = this.characters;
      });
  }

  filterVillage(searchVillageTerm: string[]) {
    if (!searchVillageTerm) {
      this.filteredCharacters = this.characters;
    }
    this.apollo
      .query<{
        characters: { results: any[] };
      }>({
        query: gql`
          query ($searchVillageTerm: [String!]!) {
            characters(filter: { village: $searchVillageTerm }) {
              info {
                count
                pages
                next
                prev
              }
              results {
                _id
                rank
                name
                age
                avatarSrc
                description
                village
                firstAnimeAppearance
                firstMangaAppearance
                notableFeatures
                nameMeaning
              }
            }
          }
        `,
        variables: {
          searchVillageTerm,
        },
      })
      .subscribe((result) => {
        this.characters = result.data.characters.results;
        this.filteredCharacters = this.characters;
      });
  }

  filterRank(searchRankTerm: string[]) {
    if (!searchRankTerm) {
      this.filteredCharacters = this.characters;
    }
    this.apollo
      .query<{
        characters: { results: any[] };
      }>({
        query: gql`
          query ($searchRankTerm: [String!]!) {
            characters(filter: { rank: $searchRankTerm }) {
              results {
                name
                avatarSrc
                description
                rank
                village
              }
            }
          }
        `,
        variables: {
          searchRankTerm,
        },
      })
      .subscribe((result) => {
        this.characters = result.data.characters.results;
        this.filteredCharacters = this.characters;
      });
  }

  switchTheme() {
    const bodyElement = document.querySelector('body');
    const isDark = bodyElement?.classList.toggle('theme-dark');
    localStorage.setItem('theme', isDark ? 'dark' : '');
  }
}
