import { Injectable } from "@angular/core"
import { BehaviorSubject } from "rxjs"

export interface Toast {
  id: string
  message: string
  type: "success" | "error" | "info" | "warning"
  duration: number
}

@Injectable({
  providedIn: "root",
})
export class ToastService {
  private toasts = new BehaviorSubject<Toast[]>([])
  toasts$ = this.toasts.asObservable()

  constructor() {}

  show(message: string, type: "success" | "error" | "info" | "warning" = "info", duration = 4000): void {
    const id = "toast_" + Date.now()
    const toast: Toast = { id, message, type, duration }

    this.toasts.next([...this.toasts.value, toast])

    // Auto remove after duration
    setTimeout(() => {
      this.remove(id)
    }, duration)
  }

  remove(id: string): void {
    this.toasts.next(this.toasts.value.filter((toast) => toast.id !== id))
  }
}

