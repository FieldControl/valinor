import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})

export class CardComponent implements OnInit {
  @Input() data: any = '';
  @Input() option: string = '';

  description: string = '';
  urlRepo: string = '';

  constructor(private router: Router) { }

  ngOnInit(): void {

    /*-- Setting the link to the breadcrumb text --*/
    this.description = this.data.login || 'Usuário: ' + this.data.full_name?.split('/')[0];
    this.urlRepo = this.data.owner ? this.data.owner?.login : this.data.login;

  }

  /*-- Function responsible for pagination --*/
  navigateTo(name: string) {
    let path = this.option === 'repositories' ? this.urlRepo : '/usuario/';
    this.router.navigate([path, name]);
  }

}
