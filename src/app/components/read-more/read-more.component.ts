import { Component, Input, OnInit } from '@angular/core';
@Component({
  selector: 'app-read-more',
  templateUrl: './read-more.component.html',
  styleUrls: ['./read-more.component.scss'],
})
export class ReadMoreComponent implements OnInit {
  @Input() content!: string;
  @Input() limit!: number;
  @Input() completeWords!: boolean;

  public showReadMoreButton!: boolean;
  private nonEditedContent!: string;
  public isOpen = false;

  constructor() {}

  public get label(): string {
    return this.isOpen ? 'Ver menos' : 'Ver mais';
  }

  public get state(): string {
    return this.isOpen ? 'open' : 'closed';
  }

  private formatContent(content: string): string {
    if (!content) return '';

    if (this.completeWords) {
      this.limit = content.substr(0, this.limit).lastIndexOf(' ');
    }

    return `${content.substr(0, this.limit)}...`;
  }

  private open(): void {
    this.isOpen = true;
  }

  private close(): void {
    this.isOpen = false;
  }

  public toggle(): void {
    this.isOpen ? this.close() : this.open();
    this.content = this.isOpen
      ? this.nonEditedContent
      : this.formatContent(this.content);
  }

  ngOnInit(): void {
    this.nonEditedContent = this.content;

    if (this.nonEditedContent?.length <= this.limit) {
      this.showReadMoreButton = false;
    }
    else {
      this.showReadMoreButton = true;
      this.content = this.formatContent(this.content);
    }
  }
}
