import { Champion } from '../shared/champion.model';
import { ChampionService } from '../shared/champion.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  constructor(private route: ActivatedRoute, private championService: ChampionService) { }

  champObject: Champion = {
    name: '',
    title: '',
    tags: [],
    passiveimage: '',
    passivename: '',
    passivedescription: '',
    spellsid: [],
    spellsname: [],
    spellsdescription: [],
    lore: '',
    skins: [],
    skinsname: []
  }

  skill: Number = 8

  ngOnInit(): void {
    const name = this.route.snapshot.paramMap.get('name')
    this.championService.findChampion(name).subscribe(champ => {
      this.champObject = champ[0]
    })
  }

  showSkillDescription(event: Number) {
    this.skill = event
  }

}
