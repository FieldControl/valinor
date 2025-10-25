import { Component, Input } from '@angular/core';

@Component({
	selector: 'icon-dots-three',
	template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      [attr.width]="width"
      [attr.height]="height"
      [attr.fill]="color"
      viewBox="0 0 256 256"
    >
      <path
        d="M140,128a12,12,0,1,1-12-12A12,12,0,0,1,140,128Zm56-12a12,12,0,1,0,12,12A12,12,0,0,0,196,116ZM60,116a12,12,0,1,0,12,12A12,12,0,0,0,60,116Z"
      ></path>
    </svg>
  `,
})
export class IconDotsThree {
	@Input() width = '20';
	@Input() height = '20';
	@Input() color = 'var(--color-text)';
}
