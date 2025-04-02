import { Component, Input, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"

@Component({
  selector: "app-version-switcher",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="version-switcher">
      <select [(ngModel)]="selectedVersion" class="version-select">
        <option *ngFor="let version of versions" [value]="version">{{ version }}</option>
      </select>
    </div>
  `,
  styles: [
    `
    .version-switcher {
      padding: 12px;
      border-bottom: 1px solid #eee;
    }
    
    .version-select {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      background-color: white;
      
      &:focus {
        outline: none;
        border-color: #2D8CFF;
      }
    }
  `,
  ],
})
export class VersionSwitcher implements OnInit {
  @Input() versions: string[] = []
  @Input() defaultVersion = ""

  selectedVersion = ""

  ngOnInit(): void {
    this.selectedVersion = this.defaultVersion || (this.versions.length > 0 ? this.versions[0] : "")
  }
}

