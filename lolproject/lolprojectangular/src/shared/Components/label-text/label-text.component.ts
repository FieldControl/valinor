import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: '../label-text',
  templateUrl: '../label-text/label-text.component.html',
  styleUrls: ['../label-text/label-text.component.scss']
})


export class LabelText{
  @Input() type!: string;

}
