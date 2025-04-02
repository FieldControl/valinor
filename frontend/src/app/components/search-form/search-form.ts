import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"

@Component({
  selector: "app-search-form",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="search-container">
      <input 
        type="text" 
        [(ngModel)]="searchQuery" 
        placeholder="Pesquisar..." 
        class="search-input"
      >
      <button class="search-button" [class.active]="searchQuery">
        <span class="search-icon">🔍</span>
      </button>
    </div>
  `,
  styles: [
    `
    .search-container {
      position: relative;
      margin: 8px 0;
    }
    
    .search-input {
      width: 100%;
      padding: 8px 12px;
      padding-right: 40px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      
      &:focus {
        outline: none;
        border-color: #2D8CFF;
      }
    }
    
    .search-button {
      position: absolute;
      right: 0;
      top: 0;
      height: 100%;
      width: 40px;
      background: none;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &.active {
        color: #2D8CFF;
      }
    }
    
    .search-icon {
      font-size: 16px;
    }
  `,
  ],
})
export class SearchForm {
  searchQuery = ""
}

