/**
 * The default template and styles for the pagination links are borrowed directly
 * from Zurb Foundation 6: http://foundation.zurb.com/sites/docs/pagination.html
 */
export const DEFAULT_TEMPLATE = `
    <pagination-template  #p="paginationApi"
                         [id]="id"
                         [maxSize]="maxSize"
                         (pageChange)="pageChange.emit($event)"
                         (pageBoundsCorrection)="pageBoundsCorrection.emit($event)">
    <nav role="navigation" [attr.aria-label]="screenReaderPaginationLabel">
    <ul class="ngx-pagination" 
        [class.responsive]="responsive"
        *ngIf="!(autoHide && p.pages.length <= 1)">

        <li class="pagination-previous" [class.disabled]="p.isFirstPage()" *ngIf="directionLinks"> 
            <a tabindex="0" *ngIf="1 < p.getCurrent()" (keyup.enter)="p.previous()" (click)="p.previous()">
                {{ previousLabel }} <span class="show-for-sr">{{ screenReaderPageLabel }}</span>
            </a>
            <span *ngIf="p.isFirstPage()" aria-disabled="true">
                {{ previousLabel }} <span class="show-for-sr">{{ screenReaderPageLabel }}</span>
            </span>
        </li> 

        <li class="small-screen">
            {{ p.getCurrent() }} / {{ p.getLastPage() }}
        </li>

        <li [class.current]="p.getCurrent() === page.value" 
            [class.ellipsis]="page.label === '...'"
            *ngFor="let page of p.pages; trackBy: trackByIndex">
            <a tabindex="0" (keyup.enter)="p.setCurrent(page.value)" (click)="p.setCurrent(page.value)" *ngIf="p.getCurrent() !== page.value">
                <span class="show-for-sr">{{ screenReaderPageLabel }} </span>
                <span>{{ (page.label === '...') ? page.label : (page.label | number:'') }}</span>
            </a>
            <ng-container *ngIf="p.getCurrent() === page.value">
              <span aria-live="polite">
                <span class="show-for-sr">{{ screenReaderCurrentLabel }} </span>
                <span>{{ (page.label === '...') ? page.label : (page.label | number:'') }}</span> 
              </span>
            </ng-container>
        </li>

        <li class="pagination-next" [class.disabled]="p.isLastPage()" *ngIf="directionLinks">
            <a tabindex="0" *ngIf="!p.isLastPage()" (keyup.enter)="p.next()" (click)="p.next()">
                 {{ nextLabel }} <span class="show-for-sr">{{ screenReaderPageLabel }}</span>
            </a>
            <span *ngIf="p.isLastPage()" aria-disabled="true">
                 {{ nextLabel }} <span class="show-for-sr">{{ screenReaderPageLabel }}</span>
            </span>
        </li>

    </ul>
    </nav>
    </pagination-template>
    `;
export const DEFAULT_STYLES = `
.ngx-pagination {
  margin-left: 0;
  margin-bottom: 1rem; }
  .ngx-pagination::before, .ngx-pagination::after {
    content: ' ';
    display: table; }
  .ngx-pagination::after {
    clear: both; }
  .ngx-pagination li {
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    margin-right: 0.0625rem;
    border-radius: 0; }
  .ngx-pagination li {
    display: inline-block; }
  .ngx-pagination a,
  .ngx-pagination button {
    color: #0a0a0a; 
    display: block;
    padding: 0.1875rem 0.625rem;
    border-radius: 0; }
    .ngx-pagination a:hover,
    .ngx-pagination button:hover {
      background: #e6e6e6; }
  .ngx-pagination .current {
    padding: 0.1875rem 0.625rem;
    background: #2199e8;
    color: #fefefe;
    cursor: default; }
  .ngx-pagination .disabled {
    padding: 0.1875rem 0.625rem;
    color: #cacaca;
    cursor: default; } 
    .ngx-pagination .disabled:hover {
      background: transparent; }
  .ngx-pagination a, .ngx-pagination button {
    cursor: pointer; }

.ngx-pagination .pagination-previous a::before,
.ngx-pagination .pagination-previous.disabled::before { 
  content: '«';
  display: inline-block;
  margin-right: 0.5rem; }

.ngx-pagination .pagination-next a::after,
.ngx-pagination .pagination-next.disabled::after {
  content: '»';
  display: inline-block;
  margin-left: 0.5rem; }

.ngx-pagination .show-for-sr {
  position: absolute !important;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0); }
.ngx-pagination .small-screen {
  display: none; }
@media screen and (max-width: 601px) {
  .ngx-pagination.responsive .small-screen {
    display: inline-block; } 
  .ngx-pagination.responsive li:not(.small-screen):not(.pagination-previous):not(.pagination-next) {
    display: none; }
}
  `;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcGxhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtcGFnaW5hdGlvbi9zcmMvbGliL3RlbXBsYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRztBQUVILE1BQU0sQ0FBQyxNQUFNLGdCQUFnQixHQUFHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7S0FtRDNCLENBQUM7QUFFTixNQUFNLENBQUMsTUFBTSxjQUFjLEdBQUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWtFM0IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBUaGUgZGVmYXVsdCB0ZW1wbGF0ZSBhbmQgc3R5bGVzIGZvciB0aGUgcGFnaW5hdGlvbiBsaW5rcyBhcmUgYm9ycm93ZWQgZGlyZWN0bHlcclxuICogZnJvbSBadXJiIEZvdW5kYXRpb24gNjogaHR0cDovL2ZvdW5kYXRpb24uenVyYi5jb20vc2l0ZXMvZG9jcy9wYWdpbmF0aW9uLmh0bWxcclxuICovXHJcblxyXG5leHBvcnQgY29uc3QgREVGQVVMVF9URU1QTEFURSA9IGBcclxuICAgIDxwYWdpbmF0aW9uLXRlbXBsYXRlICAjcD1cInBhZ2luYXRpb25BcGlcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgW2lkXT1cImlkXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgIFttYXhTaXplXT1cIm1heFNpemVcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgKHBhZ2VDaGFuZ2UpPVwicGFnZUNoYW5nZS5lbWl0KCRldmVudClcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgKHBhZ2VCb3VuZHNDb3JyZWN0aW9uKT1cInBhZ2VCb3VuZHNDb3JyZWN0aW9uLmVtaXQoJGV2ZW50KVwiPlxyXG4gICAgPG5hdiByb2xlPVwibmF2aWdhdGlvblwiIFthdHRyLmFyaWEtbGFiZWxdPVwic2NyZWVuUmVhZGVyUGFnaW5hdGlvbkxhYmVsXCI+XHJcbiAgICA8dWwgY2xhc3M9XCJuZ3gtcGFnaW5hdGlvblwiIFxyXG4gICAgICAgIFtjbGFzcy5yZXNwb25zaXZlXT1cInJlc3BvbnNpdmVcIlxyXG4gICAgICAgICpuZ0lmPVwiIShhdXRvSGlkZSAmJiBwLnBhZ2VzLmxlbmd0aCA8PSAxKVwiPlxyXG5cclxuICAgICAgICA8bGkgY2xhc3M9XCJwYWdpbmF0aW9uLXByZXZpb3VzXCIgW2NsYXNzLmRpc2FibGVkXT1cInAuaXNGaXJzdFBhZ2UoKVwiICpuZ0lmPVwiZGlyZWN0aW9uTGlua3NcIj4gXHJcbiAgICAgICAgICAgIDxhIHRhYmluZGV4PVwiMFwiICpuZ0lmPVwiMSA8IHAuZ2V0Q3VycmVudCgpXCIgKGtleXVwLmVudGVyKT1cInAucHJldmlvdXMoKVwiIChjbGljayk9XCJwLnByZXZpb3VzKClcIj5cclxuICAgICAgICAgICAgICAgIHt7IHByZXZpb3VzTGFiZWwgfX0gPHNwYW4gY2xhc3M9XCJzaG93LWZvci1zclwiPnt7IHNjcmVlblJlYWRlclBhZ2VMYWJlbCB9fTwvc3Bhbj5cclxuICAgICAgICAgICAgPC9hPlxyXG4gICAgICAgICAgICA8c3BhbiAqbmdJZj1cInAuaXNGaXJzdFBhZ2UoKVwiIGFyaWEtZGlzYWJsZWQ9XCJ0cnVlXCI+XHJcbiAgICAgICAgICAgICAgICB7eyBwcmV2aW91c0xhYmVsIH19IDxzcGFuIGNsYXNzPVwic2hvdy1mb3Itc3JcIj57eyBzY3JlZW5SZWFkZXJQYWdlTGFiZWwgfX08L3NwYW4+XHJcbiAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICA8L2xpPiBcclxuXHJcbiAgICAgICAgPGxpIGNsYXNzPVwic21hbGwtc2NyZWVuXCI+XHJcbiAgICAgICAgICAgIHt7IHAuZ2V0Q3VycmVudCgpIH19IC8ge3sgcC5nZXRMYXN0UGFnZSgpIH19XHJcbiAgICAgICAgPC9saT5cclxuXHJcbiAgICAgICAgPGxpIFtjbGFzcy5jdXJyZW50XT1cInAuZ2V0Q3VycmVudCgpID09PSBwYWdlLnZhbHVlXCIgXHJcbiAgICAgICAgICAgIFtjbGFzcy5lbGxpcHNpc109XCJwYWdlLmxhYmVsID09PSAnLi4uJ1wiXHJcbiAgICAgICAgICAgICpuZ0Zvcj1cImxldCBwYWdlIG9mIHAucGFnZXM7IHRyYWNrQnk6IHRyYWNrQnlJbmRleFwiPlxyXG4gICAgICAgICAgICA8YSB0YWJpbmRleD1cIjBcIiAoa2V5dXAuZW50ZXIpPVwicC5zZXRDdXJyZW50KHBhZ2UudmFsdWUpXCIgKGNsaWNrKT1cInAuc2V0Q3VycmVudChwYWdlLnZhbHVlKVwiICpuZ0lmPVwicC5nZXRDdXJyZW50KCkgIT09IHBhZ2UudmFsdWVcIj5cclxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwic2hvdy1mb3Itc3JcIj57eyBzY3JlZW5SZWFkZXJQYWdlTGFiZWwgfX0gPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgPHNwYW4+e3sgKHBhZ2UubGFiZWwgPT09ICcuLi4nKSA/IHBhZ2UubGFiZWwgOiAocGFnZS5sYWJlbCB8IG51bWJlcjonJykgfX08L3NwYW4+XHJcbiAgICAgICAgICAgIDwvYT5cclxuICAgICAgICAgICAgPG5nLWNvbnRhaW5lciAqbmdJZj1cInAuZ2V0Q3VycmVudCgpID09PSBwYWdlLnZhbHVlXCI+XHJcbiAgICAgICAgICAgICAgPHNwYW4gYXJpYS1saXZlPVwicG9saXRlXCI+XHJcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInNob3ctZm9yLXNyXCI+e3sgc2NyZWVuUmVhZGVyQ3VycmVudExhYmVsIH19IDwvc3Bhbj5cclxuICAgICAgICAgICAgICAgIDxzcGFuPnt7IChwYWdlLmxhYmVsID09PSAnLi4uJykgPyBwYWdlLmxhYmVsIDogKHBhZ2UubGFiZWwgfCBudW1iZXI6JycpIH19PC9zcGFuPiBcclxuICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgIDwvbmctY29udGFpbmVyPlxyXG4gICAgICAgIDwvbGk+XHJcblxyXG4gICAgICAgIDxsaSBjbGFzcz1cInBhZ2luYXRpb24tbmV4dFwiIFtjbGFzcy5kaXNhYmxlZF09XCJwLmlzTGFzdFBhZ2UoKVwiICpuZ0lmPVwiZGlyZWN0aW9uTGlua3NcIj5cclxuICAgICAgICAgICAgPGEgdGFiaW5kZXg9XCIwXCIgKm5nSWY9XCIhcC5pc0xhc3RQYWdlKClcIiAoa2V5dXAuZW50ZXIpPVwicC5uZXh0KClcIiAoY2xpY2spPVwicC5uZXh0KClcIj5cclxuICAgICAgICAgICAgICAgICB7eyBuZXh0TGFiZWwgfX0gPHNwYW4gY2xhc3M9XCJzaG93LWZvci1zclwiPnt7IHNjcmVlblJlYWRlclBhZ2VMYWJlbCB9fTwvc3Bhbj5cclxuICAgICAgICAgICAgPC9hPlxyXG4gICAgICAgICAgICA8c3BhbiAqbmdJZj1cInAuaXNMYXN0UGFnZSgpXCIgYXJpYS1kaXNhYmxlZD1cInRydWVcIj5cclxuICAgICAgICAgICAgICAgICB7eyBuZXh0TGFiZWwgfX0gPHNwYW4gY2xhc3M9XCJzaG93LWZvci1zclwiPnt7IHNjcmVlblJlYWRlclBhZ2VMYWJlbCB9fTwvc3Bhbj5cclxuICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgIDwvbGk+XHJcblxyXG4gICAgPC91bD5cclxuICAgIDwvbmF2PlxyXG4gICAgPC9wYWdpbmF0aW9uLXRlbXBsYXRlPlxyXG4gICAgYDtcclxuXHJcbmV4cG9ydCBjb25zdCBERUZBVUxUX1NUWUxFUyA9IGBcclxuLm5neC1wYWdpbmF0aW9uIHtcclxuICBtYXJnaW4tbGVmdDogMDtcclxuICBtYXJnaW4tYm90dG9tOiAxcmVtOyB9XHJcbiAgLm5neC1wYWdpbmF0aW9uOjpiZWZvcmUsIC5uZ3gtcGFnaW5hdGlvbjo6YWZ0ZXIge1xyXG4gICAgY29udGVudDogJyAnO1xyXG4gICAgZGlzcGxheTogdGFibGU7IH1cclxuICAubmd4LXBhZ2luYXRpb246OmFmdGVyIHtcclxuICAgIGNsZWFyOiBib3RoOyB9XHJcbiAgLm5neC1wYWdpbmF0aW9uIGxpIHtcclxuICAgIC1tb3otdXNlci1zZWxlY3Q6IG5vbmU7XHJcbiAgICAtd2Via2l0LXVzZXItc2VsZWN0OiBub25lO1xyXG4gICAgLW1zLXVzZXItc2VsZWN0OiBub25lO1xyXG4gICAgbWFyZ2luLXJpZ2h0OiAwLjA2MjVyZW07XHJcbiAgICBib3JkZXItcmFkaXVzOiAwOyB9XHJcbiAgLm5neC1wYWdpbmF0aW9uIGxpIHtcclxuICAgIGRpc3BsYXk6IGlubGluZS1ibG9jazsgfVxyXG4gIC5uZ3gtcGFnaW5hdGlvbiBhLFxyXG4gIC5uZ3gtcGFnaW5hdGlvbiBidXR0b24ge1xyXG4gICAgY29sb3I6ICMwYTBhMGE7IFxyXG4gICAgZGlzcGxheTogYmxvY2s7XHJcbiAgICBwYWRkaW5nOiAwLjE4NzVyZW0gMC42MjVyZW07XHJcbiAgICBib3JkZXItcmFkaXVzOiAwOyB9XHJcbiAgICAubmd4LXBhZ2luYXRpb24gYTpob3ZlcixcclxuICAgIC5uZ3gtcGFnaW5hdGlvbiBidXR0b246aG92ZXIge1xyXG4gICAgICBiYWNrZ3JvdW5kOiAjZTZlNmU2OyB9XHJcbiAgLm5neC1wYWdpbmF0aW9uIC5jdXJyZW50IHtcclxuICAgIHBhZGRpbmc6IDAuMTg3NXJlbSAwLjYyNXJlbTtcclxuICAgIGJhY2tncm91bmQ6ICMyMTk5ZTg7XHJcbiAgICBjb2xvcjogI2ZlZmVmZTtcclxuICAgIGN1cnNvcjogZGVmYXVsdDsgfVxyXG4gIC5uZ3gtcGFnaW5hdGlvbiAuZGlzYWJsZWQge1xyXG4gICAgcGFkZGluZzogMC4xODc1cmVtIDAuNjI1cmVtO1xyXG4gICAgY29sb3I6ICNjYWNhY2E7XHJcbiAgICBjdXJzb3I6IGRlZmF1bHQ7IH0gXHJcbiAgICAubmd4LXBhZ2luYXRpb24gLmRpc2FibGVkOmhvdmVyIHtcclxuICAgICAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7IH1cclxuICAubmd4LXBhZ2luYXRpb24gYSwgLm5neC1wYWdpbmF0aW9uIGJ1dHRvbiB7XHJcbiAgICBjdXJzb3I6IHBvaW50ZXI7IH1cclxuXHJcbi5uZ3gtcGFnaW5hdGlvbiAucGFnaW5hdGlvbi1wcmV2aW91cyBhOjpiZWZvcmUsXHJcbi5uZ3gtcGFnaW5hdGlvbiAucGFnaW5hdGlvbi1wcmV2aW91cy5kaXNhYmxlZDo6YmVmb3JlIHsgXHJcbiAgY29udGVudDogJ8KrJztcclxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XHJcbiAgbWFyZ2luLXJpZ2h0OiAwLjVyZW07IH1cclxuXHJcbi5uZ3gtcGFnaW5hdGlvbiAucGFnaW5hdGlvbi1uZXh0IGE6OmFmdGVyLFxyXG4ubmd4LXBhZ2luYXRpb24gLnBhZ2luYXRpb24tbmV4dC5kaXNhYmxlZDo6YWZ0ZXIge1xyXG4gIGNvbnRlbnQ6ICfCuyc7XHJcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xyXG4gIG1hcmdpbi1sZWZ0OiAwLjVyZW07IH1cclxuXHJcbi5uZ3gtcGFnaW5hdGlvbiAuc2hvdy1mb3Itc3Ige1xyXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZSAhaW1wb3J0YW50O1xyXG4gIHdpZHRoOiAxcHg7XHJcbiAgaGVpZ2h0OiAxcHg7XHJcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcclxuICBjbGlwOiByZWN0KDAsIDAsIDAsIDApOyB9XHJcbi5uZ3gtcGFnaW5hdGlvbiAuc21hbGwtc2NyZWVuIHtcclxuICBkaXNwbGF5OiBub25lOyB9XHJcbkBtZWRpYSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDYwMXB4KSB7XHJcbiAgLm5neC1wYWdpbmF0aW9uLnJlc3BvbnNpdmUgLnNtYWxsLXNjcmVlbiB7XHJcbiAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7IH0gXHJcbiAgLm5neC1wYWdpbmF0aW9uLnJlc3BvbnNpdmUgbGk6bm90KC5zbWFsbC1zY3JlZW4pOm5vdCgucGFnaW5hdGlvbi1wcmV2aW91cyk6bm90KC5wYWdpbmF0aW9uLW5leHQpIHtcclxuICAgIGRpc3BsYXk6IG5vbmU7IH1cclxufVxyXG4gIGA7XHJcbiJdfQ==