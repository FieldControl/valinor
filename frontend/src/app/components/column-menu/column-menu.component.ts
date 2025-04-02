import { Component, EventEmitter, HostListener, Output, ChangeDetectionStrategy } from "@angular/core"
import { CommonModule } from "@angular/common"

@Component({
  selector: "app-column-menu",
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="menu-container">
      <button class="menu-item" (click)="onAction('rename')">
        <span class="menu-icon">✏️</span>
        <span>Renomear coluna</span>
      </button>
      <button class="menu-item" (click)="onAction('add-card')">
        <span class="menu-icon">➕</span>
        <span>Adicionar novo card</span>
      </button>
      <button class="menu-item" (click)="onAction('change-color')">
        <span class="menu-icon">🎨</span>
        <span>Mudar cor de destaque</span>
      </button>
      <button class="menu-item" (click)="onAction('archive')">
        <span class="menu-icon">🗑️</span>
        <span>Arquivar coluna</span>
      </button>
    </div>
  `,
  styles: [
    `
    .menu-container {
      position: absolute;
      top: 100%;
      right: 0;
      background-color: white;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10;
      min-width: 200px;
      animation: menuFadeIn 0.1s ease;
      transform-origin: top right;
      will-change: transform, opacity;
    }
    
    .menu-item {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 10px 12px;
      background: none;
      border: none;
      text-align: left;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      color: #333;
      
      &:hover {
        background-color: #f5f5f5;
      }
      
      &:first-child {
        border-top-left-radius: 6px;
        border-top-right-radius: 6px;
      }
      
      &:last-child {
        border-bottom-left-radius: 6px;
        border-bottom-right-radius: 6px;
      }
    }
    
    .menu-icon {
      font-size: 16px;
    }
    
    @keyframes menuFadeIn {
      from { opacity: 0; transform: translateY(-5px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
  `,
  ],
})
export class ColumnMenuComponent {
  @Output() action = new EventEmitter<string>()
  @Output() clickOutside = new EventEmitter<void>()

  onAction(actionType: string): void {
    this.action.emit(actionType)
  }

  @HostListener("document:click", ["$event"])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement
    const isMenuButton = target.classList.contains("menu-button")
    const isInsideMenu = !!target.closest("app-column-menu")
    
    if (!isInsideMenu && !isMenuButton) {
      this.clickOutside.emit()
    }
  }
}

