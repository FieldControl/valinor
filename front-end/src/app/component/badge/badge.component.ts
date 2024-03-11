import { Component, Input, OnInit } from '@angular/core';
import { Badge } from '../badge';

@Component({
  selector: 'app-badge',
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.css']
})
export class BadgeComponent implements OnInit {

  @Input() badge: Badge = {
    id: "",
    name: "",
    color: ""
  }
  constructor() { }

  darkenColor(hex:string, percent:number) {
    hex = hex.replace(/^#/, '');

    if (!/^[0-9A-F]{6}$/i.test(hex)) {
      throw new Error('O valor hexadecimal fornecido é inválido.');
    }

    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    if (percent < 0 || percent > 1) {
      throw new Error('O percentual deve estar entre 0 e 1.');
    }

    r = Math.round(r * (1 - percent));
    g = Math.round(g * (1 - percent));
    b = Math.round(b * (1 - percent));

    const rr = (r).toString(16).padStart(2, '0');
    const gg = (g).toString(16).padStart(2, '0');
    const bb = (b).toString(16).padStart(2, '0');

    return `#${rr}${gg}${bb}`;
  }

  ngOnInit(): void {
  }

}
