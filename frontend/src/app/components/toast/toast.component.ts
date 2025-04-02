import { Component, type OnDestroy, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Subscription } from "rxjs"
import { ToastService } from "../../services/toast.service"
import type { Toast } from "../../services/toast.service"
import { animate, style, transition, trigger } from "@angular/animations"

@Component({
  selector: "app-toast",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div 
        *ngFor="let toast of toasts" 
        class="toast-item"
        [ngClass]="'toast-' + toast.type"
        [@fadeInOut]
      >
        <div class="toast-content">
          <span class="toast-message">{{ toast.message }}</span>
        </div>
        <button class="toast-close" (click)="removeToast(toast.id)">×</button>
      </div>
    </div>
  `,
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(100%)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateX(100%)' }))
      ])
    ])
  ],
  styles: [
    `
    .toast-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-width: 300px;
    }
    
    .toast-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: toastIn 0.3s ease, toastOut 0.3s ease 3.7s;
    }
    
    .toast-success {
      background-color: #00C781;
      color: white;
    }
    
    .toast-error {
      background-color: #FF647C;
      color: white;
    }
    
    .toast-info {
      background-color: #2D8CFF;
      color: white;
    }
    
    .toast-warning {
      background-color: #FFAA15;
      color: white;
    }
    
    .toast-content {
      flex: 1;
    }
    
    .toast-message {
      font-family: 'Inter', sans-serif;
      font-size: 14px;
    }
    
    .toast-close {
      background: none;
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
      opacity: 0.8;
      margin-left: 8px;
      
      &:hover {
        opacity: 1;
      }
    }
    
    @keyframes toastIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes toastOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `,
  ],
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = []
  private subscription: Subscription = new Subscription()

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.subscription = this.toastService.toasts$.subscribe((toasts) => {
      this.toasts = toasts
    })
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe()
  }

  removeToast(id: string): void {
    this.toastService.remove(id)
  }
}

