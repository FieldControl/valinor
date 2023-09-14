import { Component, Input, OnInit } from '@angular/core';
import { textEmoji } from 'markdown-to-text-emoji';
import { marked } from 'marked';
import { GITHUB_COLORS } from 'src/app/utils/consts';
import { RepoSearchResultItem } from 'src/app/utils/interfaces';

@Component({
  selector: 'app-repo-card',
  templateUrl: './repo-card.component.html'
})
export class RepoCardComponent implements OnInit {
  @Input() repo!: RepoSearchResultItem;
  desc = '';
  languageColor = '';

  ngOnInit(): void {
    const color = GITHUB_COLORS[this.repo?.language || ''];
    const renderer = new marked.Renderer();
    renderer.link = (href, title, text) => `<a target="_blank" href="${href}">${text}` + '</a>';
    marked.setOptions({ renderer: renderer });

    this.desc = textEmoji(this.repo?.description || '');
    if (this.desc) this.desc = marked.parse(this.desc);
    this.languageColor = color;
  }
}
