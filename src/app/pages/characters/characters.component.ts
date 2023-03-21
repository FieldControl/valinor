import { Component } from '@angular/core';
import { filter, Observable } from 'rxjs';
import { ValorantApiService } from 'src/app/service/valorant-api.service';

@Component({
  selector: 'app-characters',
  templateUrl: './characters.component.html',
  styleUrls: ['./characters.component.css']
})
export class CharactersComponent {

  private setAllCharacters: any;
  public getAllCharacters: any;
  public charactersByPage: any;
  public actualPage: number = 1;
  public lastPage!: number;

  public charInitial: number = 0;
  public charFinal: number = 3;

  constructor(
    private ValorantApiService: ValorantApiService
  ){}

  ngOnInit(): void {
    this.actualPage = 1;

    this.ValorantApiService.apiListAllCharacters.subscribe(
      res => {
        this.setAllCharacters = res.data;
        this.getAllCharacters = this.setAllCharacters;
        console.log(this.getAllCharacters);
        this.getCharactersByPage(this.actualPage);

        this.lenghtPages();
      }
    );
  }

  lenghtPages() {
    if(this.getAllCharacters.length % 3 == 0){
       this.lastPage = this.getAllCharacters.length / 3;
    } else {
      this.lastPage = Math.ceil(this.getAllCharacters.length / 3);
    }
  }

  previousPage() {
    if (this.actualPage > 1) {
      this.charInitial -= 3;
      this.charFinal -= 3;
      this.actualPage--
      this.getCharactersByPage(this.actualPage)
    }
  }

  nextPage() {
    if (this.actualPage < this.lastPage && this.actualPage > 0) {
      this.charInitial += 3;
      this.charFinal += 3;
      this.actualPage++
      this.getCharactersByPage(this.actualPage)
    }
  }

  getCharactersByPage( page: number ){
    this.charactersByPage = this.getAllCharacters.slice(this.charInitial, this.charFinal);
    console.log(this.charactersByPage)
  }

  closeDetails(){
    let details = document.querySelectorAll("details");
    details.forEach((targetDetail) => {
      targetDetail.addEventListener("click", () => {
        details.forEach((detail) => {
          if (detail !== targetDetail) {
            detail.removeAttribute("open");
          }
        });
      });
    });
  }

  public getSearch(value: string) {
    if (value != "") {
      const filter = this.setAllCharacters.filter( (res: any) => {
        return !res.displayName.indexOf(value[0].toUpperCase() + value.substring(1));
      })
  
      this.getAllCharacters = filter;

      this.lenghtPages();
      this.getCharactersByPage(1)
      for (let i = this.actualPage; i > this.lastPage; i--) {
        this.previousPage()
      }
    } else {
      this.getAllCharacters = this.setAllCharacters;
      this.lenghtPages()
      this.getCharactersByPage(1);
    }
  }
}
