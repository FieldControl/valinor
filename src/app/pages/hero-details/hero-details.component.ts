import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Hero } from 'src/app/shared/model/hero.model';
import { HeroesService } from 'src/app/shared/services/heroes.service';

@Component({
  templateUrl: './hero-details.component.html',
  styleUrls: ['./hero-details.component.scss'],
  providers: [HeroesService]
})
export class HeroDetailsComponent implements OnInit {

  id: number = 1;
  heroes: Hero[] = [];
  hero: Hero | undefined;
  heroAbilities: any[] = [];

  constructor(private heroService: HeroesService, private route: ActivatedRoute, private router : Router) {}


  ngOnInit(): void {
        this.getHeroAbilities(); 
        this.getHeroes();
  }

  getHeroes(): void {
    this.heroService.getHeroesData().subscribe((data) => {
      this.heroes = [...data];

      this.heroes.map ((hero) => {
        if(hero.primary_attr === 'agi') {
          hero.primary_attr = 'agility'
        };
        if(hero.primary_attr === 'int') {
          hero.primary_attr = 'intelligence'
        };
        if(hero.primary_attr === 'str') {
          hero.primary_attr = 'strength'
        }

        hero.name = hero.name.replace("npc_dota_hero_", "");

        hero.attack_type = hero.attack_type.toLowerCase(); 
        
        const heroAbility = this.heroAbilities.find(heroAbility => heroAbility.name === hero.name)
        hero.abilities = heroAbility.abilities;
        hero.name_abilities = [...hero.abilities];

        hero.name_abilities = hero.name_abilities.map((name) => {
          let newName = name.replace(hero.name, "").replace(/_/g, " ");
          name = newName;
          return name
        })
      })

      this.heroes.forEach((item, i) => {
        item.new_Id = i + 1;
      });

      this.id = Number(this.route.snapshot.paramMap.get('id'));

      this.hero = this.heroes.find((hero) => hero.new_Id === this.id);
    })
    
  }

  getHeroAbilities(): void {

    const removeAbility = ["generic_hidden", "morphling_morph", "batrider_sticky_napalm_application_damage", "crystal_maiden_freezing_field_stop", "ancient_apparition_ice_blast_release",
                           "rubick_hidden1", "rubick_hidden2", "rubick_hidden3", "tusk_launch_snowball", "monkey_king_primal_spring_early" ]

    this.heroService.getHeroesAbilityData().subscribe((data) => {
      this.heroAbilities = [...data];
     
      this.heroAbilities  = this.heroAbilities.map((item) => {
        return {
          name: item[0],
          abilities: item[1].abilities
        }
      })

      this.heroAbilities.map((item) => {
        item.name = item.name.replace("npc_dota_hero_", "");
        item.abilities = item.abilities.filter((item: string) => {
          return !removeAbility.includes(item)
        })
      }) 
    })
    
  }

  next(): void {
    if(this.id >= this.heroes.length) {
      this.id = 0;
    };
    this.id += 1;
    this.router.navigate(['/heroes',this.id]);
    this.hero = this.heroes.find((hero) => hero.new_Id === this.id);
  } 

  previous(): void {
    if(this.id <= 1) {
      this.id = this.heroes.length + 1;
    };
    this.id -= 1;
    this.router.navigate(['/heroes',this.id]);
    this.hero = this.heroes.find((hero) => hero.new_Id === this.id);
  }
}
