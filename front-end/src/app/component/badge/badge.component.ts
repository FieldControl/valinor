import { Component, Input, OnInit } from '@angular/core';
import { Badge } from '../badge';

@Component({
  selector: 'app-badge',
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.css']
})
export class BadgeComponent implements OnInit {

  @Input() badge:Badge = {
    name: "",
    cor: "",
    cor_hover: ""
  }
  constructor() { }

  ngOnInit(): void {
    const div = document.getElementsByName('teste');
    console.log(div);
  }

}
