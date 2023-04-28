import { Injectable, Output, EventEmitter } from '@angular/core';
import { IToasty } from '../components/toasty/toasty.component';

@Injectable({ providedIn: 'root' })
export class ToastyService {
    @Output() _show = new EventEmitter<IToasty[]>();

    private _toastys: IToasty[] = [];

    constructor() { }

    get toastys(): IToasty[] {
        return this._toastys;
    }

    public show(data: IToasty): void {
        this.add(data);
        this._show.emit(this.toastys);
    }

    private add(data: IToasty): void {
        this._toastys.push(data);
    }
}
