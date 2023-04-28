import { EventEmitter, Injectable, Output } from '@angular/core';

export interface ICollapsibleData {
  id: string;
  state: boolean;
}

@Injectable()
export class CollapsibleService {
  @Output() hub = new EventEmitter<string>();
  private _collapsibles: Array<ICollapsibleData> = [];

  get collapsibles(): Array<ICollapsibleData> {
    return this._collapsibles;
  }

  public add(data: ICollapsibleData): void {
    this._collapsibles.push(data);
  }

  public manager(id: string): void {
    this._collapsibles.forEach((item) => {
      if (item.id === id) {
        item.state = !item.state;
        this.hub.emit(id);
      } else {
        item.state = false;
      }
    });
  }
}
