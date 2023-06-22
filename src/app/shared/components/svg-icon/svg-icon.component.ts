import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-svg-icon',
  standalone: true,
  imports: [CommonModule, MatIconModule, HttpClientModule],
  templateUrl: './svg-icon.component.html',
  styleUrls: ['./svg-icon.component.scss'],
  providers: [MatIconRegistry],
})
export class SvgIconComponent implements OnInit {
  @Input() svgIconName: string = '';

  constructor(
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const pathToIcon = `assets/icons/${this.svgIconName}.svg`;

    this.iconRegistry.addSvgIcon(
      this.svgIconName,
      this.sanitizer.bypassSecurityTrustResourceUrl(pathToIcon)
    );
  }
}
