import { Component, OnInit } from '@angular/core';
import { ToastyService } from 'src/app/services/toasty.service';
import { LIST_ANIMATION_LATERAL } from 'src/app/animations/list.animation';
import { APPEARD } from 'src/app/animations/appeard.animation';
import { COLORS, IColor } from './colors-page.content';

@Component({
  selector: 'app-colors-page',
  templateUrl: './colors-page.component.html',
  styleUrls: ['./colors-page.component.scss'],
  animations: [APPEARD, LIST_ANIMATION_LATERAL],
})
export class ColorsPageComponent implements OnInit {
  public state: string = 'ready';
  public show!: boolean;

  constructor(private toasty: ToastyService) {}

  public get colors(): IColor[] {
    return COLORS;
  }

  ngOnInit() {
    setTimeout(() => {
      this.show = true;
    }, 0);
  }

  public clip(color: IColor): void {
    this.clipboard(`$${color.name}: ${color.hex}`);
    this.toasty.show({ text: `$${color.name}: ${color.hex} copiado!` });
  }

  public clipboard(word: string): void {
    const el = document.createElement('textarea');
    el.value = word;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }
}
