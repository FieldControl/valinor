import { Component,ElementRef , AfterViewInit} from '@angular/core';

@Component({
  selector: 'app-codigo-tag',
  templateUrl: './codigo-tag.component.html',
  styleUrls: ['./codigo-tag.component.css']
})
export class CodigoTagComponent  implements AfterViewInit{

  codigo:any;
  color:any;
  element:any;
  ngAfterViewInit(){
    const el = this.elements.nativeElement.querySelector("#CodigoLingua")
    el.style.color = this.color;
  }
  constructor(private elements: ElementRef){
    this.codigo = "Js"
    this.color = "white" 
    this.modifyColor();
  }
  ColorText(){
    
  }
  ColorBackground(){

  }
  modifyColor(){
    this.ColorText();
    this.ColorBackground();
  }
}
