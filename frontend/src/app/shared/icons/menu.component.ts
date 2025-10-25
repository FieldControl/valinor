import { Component, Input } from '@angular/core';

@Component({
	selector: 'icon-menu',
	template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      [attr.width]="width"
      [attr.height]="height"
      [attr.fill]="color"
      viewBox="0 0 256 256"
    >
      <path
        d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z"
      ></path>
    </svg>
  `,
})
export class IconMenu {
	@Input() width = '20';
	@Input() height = '20';
  @Input() color = 'var(--color-text)';
}
