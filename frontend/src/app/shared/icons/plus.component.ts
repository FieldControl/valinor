import { Component, Input } from '@angular/core';

@Component({
	selector: 'icon-plus',
	template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      [attr.width]="width"
      [attr.height]="height"
      [attr.fill]="color"
      viewBox="0 0 256 256"
    >
      <path
        d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"
      ></path>
    </svg>
  `,
})
export class IconPlus {
	@Input() width = '15';
	@Input() height = '15';
	@Input() color = 'var(--color-text)';
}
