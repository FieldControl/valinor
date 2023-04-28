import { Subscription } from 'rxjs';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { COLLAPSIBLE_ANIMATION } from 'src/app/animations/collapsible.animation';
import { CollapsibleService } from 'src/app/services/collapsible.service';

@Component({
  selector: 'app-collapsible',
  templateUrl: './collapsible.component.html',
  styleUrls: ['./collapsible.component.scss'],
  animations: [COLLAPSIBLE_ANIMATION],
})
export class CollapsibleComponent implements OnInit, OnDestroy {
  private static nextId = 0;

  @Input() theme: string = 'primary';
  @Input() group: boolean = false;
  @Input() showSVG: boolean = true;
  @Input() padding: boolean = true;

  public isOpen = false;
  public id = `collapsible_${++CollapsibleComponent.nextId}`;
  public subscribe!: Subscription;

  constructor(private collapsibleService: CollapsibleService) {}

  get state() {
    return this.isOpen ? 'open' : 'closed';
  }

  private open(): void {
    if (this.group) {
      this.collapsibleService.manager(this.id);
    }
    this.isOpen = true;
  }

  private close(): void {
    this.isOpen = false;
  }

  private checkClose(): void {
    if (this.group) {
      this.close();
    }
  }

  public toggle(): void {
    this.isOpen ? this.close() : this.open();
  }

  public getClass(): string[] {
    const style = [];
    style.push(`collapsible`);

    if (!this.padding) style.push(`collapsible--no-padding`);

    return [...style];
  }

  ngOnDestroy(): void {
    this.subscribe.unsubscribe();
  }

  ngOnInit(): void {
    this.collapsibleService.add({ id: this.id, state: false });
    this.subscribe = this.collapsibleService.hub.subscribe((id: string) => {
      if (id !== this.id) {
        this.checkClose();
      }
    });
  }
}
