import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RicktyService } from '../services/rickty.service';

@Component({
  selector: 'app-card-details',
  templateUrl: './card-details.component.html',
  styleUrls: ['./card-details.component.css']
})
export class CardDetailsComponent implements OnInit{

  private apiUrl = 'https://rickandmortyapi.com/api/character';
  constructor(private activatedRoute:ActivatedRoute, private characterSrc:RicktyService){}

  public char:any;

  ngOnInit(){
    this.character();
  }

  character(){
    const id = this.activatedRoute.snapshot.params['id'];
    const character = this.characterSrc.getCharactersDefault(`${this.apiUrl}/${id}`).subscribe((res) => {
      this.char = res;
      return  console.log(this.char)
    });
  }

}
