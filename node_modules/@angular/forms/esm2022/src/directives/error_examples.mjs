/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export const formControlNameExample = `
  <div [formGroup]="myGroup">
    <input formControlName="firstName">
  </div>

  In your class:

  this.myGroup = new FormGroup({
      firstName: new FormControl()
  });`;
export const formGroupNameExample = `
  <div [formGroup]="myGroup">
      <div formGroupName="person">
        <input formControlName="firstName">
      </div>
  </div>

  In your class:

  this.myGroup = new FormGroup({
      person: new FormGroup({ firstName: new FormControl() })
  });`;
export const formArrayNameExample = `
  <div [formGroup]="myGroup">
    <div formArrayName="cities">
      <div *ngFor="let city of cityArray.controls; index as i">
        <input [formControlName]="i">
      </div>
    </div>
  </div>

  In your class:

  this.cityArray = new FormArray([new FormControl('SF')]);
  this.myGroup = new FormGroup({
    cities: this.cityArray
  });`;
export const ngModelGroupExample = `
  <form>
      <div ngModelGroup="person">
        <input [(ngModel)]="person.name" name="firstName">
      </div>
  </form>`;
export const ngModelWithFormGroupExample = `
  <div [formGroup]="myGroup">
      <input formControlName="firstName">
      <input [(ngModel)]="showMoreControls" [ngModelOptions]="{standalone: true}">
  </div>
`;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JfZXhhbXBsZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9mb3Jtcy9zcmMvZGlyZWN0aXZlcy9lcnJvcl9leGFtcGxlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxNQUFNLENBQUMsTUFBTSxzQkFBc0IsR0FBRzs7Ozs7Ozs7O01BU2hDLENBQUM7QUFFUCxNQUFNLENBQUMsTUFBTSxvQkFBb0IsR0FBRzs7Ozs7Ozs7Ozs7TUFXOUIsQ0FBQztBQUVQLE1BQU0sQ0FBQyxNQUFNLG9CQUFvQixHQUFHOzs7Ozs7Ozs7Ozs7OztNQWM5QixDQUFDO0FBRVAsTUFBTSxDQUFDLE1BQU0sbUJBQW1CLEdBQUc7Ozs7O1VBS3pCLENBQUM7QUFFWCxNQUFNLENBQUMsTUFBTSwyQkFBMkIsR0FBRzs7Ozs7Q0FLMUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuZXhwb3J0IGNvbnN0IGZvcm1Db250cm9sTmFtZUV4YW1wbGUgPSBgXG4gIDxkaXYgW2Zvcm1Hcm91cF09XCJteUdyb3VwXCI+XG4gICAgPGlucHV0IGZvcm1Db250cm9sTmFtZT1cImZpcnN0TmFtZVwiPlxuICA8L2Rpdj5cblxuICBJbiB5b3VyIGNsYXNzOlxuXG4gIHRoaXMubXlHcm91cCA9IG5ldyBGb3JtR3JvdXAoe1xuICAgICAgZmlyc3ROYW1lOiBuZXcgRm9ybUNvbnRyb2woKVxuICB9KTtgO1xuXG5leHBvcnQgY29uc3QgZm9ybUdyb3VwTmFtZUV4YW1wbGUgPSBgXG4gIDxkaXYgW2Zvcm1Hcm91cF09XCJteUdyb3VwXCI+XG4gICAgICA8ZGl2IGZvcm1Hcm91cE5hbWU9XCJwZXJzb25cIj5cbiAgICAgICAgPGlucHV0IGZvcm1Db250cm9sTmFtZT1cImZpcnN0TmFtZVwiPlxuICAgICAgPC9kaXY+XG4gIDwvZGl2PlxuXG4gIEluIHlvdXIgY2xhc3M6XG5cbiAgdGhpcy5teUdyb3VwID0gbmV3IEZvcm1Hcm91cCh7XG4gICAgICBwZXJzb246IG5ldyBGb3JtR3JvdXAoeyBmaXJzdE5hbWU6IG5ldyBGb3JtQ29udHJvbCgpIH0pXG4gIH0pO2A7XG5cbmV4cG9ydCBjb25zdCBmb3JtQXJyYXlOYW1lRXhhbXBsZSA9IGBcbiAgPGRpdiBbZm9ybUdyb3VwXT1cIm15R3JvdXBcIj5cbiAgICA8ZGl2IGZvcm1BcnJheU5hbWU9XCJjaXRpZXNcIj5cbiAgICAgIDxkaXYgKm5nRm9yPVwibGV0IGNpdHkgb2YgY2l0eUFycmF5LmNvbnRyb2xzOyBpbmRleCBhcyBpXCI+XG4gICAgICAgIDxpbnB1dCBbZm9ybUNvbnRyb2xOYW1lXT1cImlcIj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICA8L2Rpdj5cblxuICBJbiB5b3VyIGNsYXNzOlxuXG4gIHRoaXMuY2l0eUFycmF5ID0gbmV3IEZvcm1BcnJheShbbmV3IEZvcm1Db250cm9sKCdTRicpXSk7XG4gIHRoaXMubXlHcm91cCA9IG5ldyBGb3JtR3JvdXAoe1xuICAgIGNpdGllczogdGhpcy5jaXR5QXJyYXlcbiAgfSk7YDtcblxuZXhwb3J0IGNvbnN0IG5nTW9kZWxHcm91cEV4YW1wbGUgPSBgXG4gIDxmb3JtPlxuICAgICAgPGRpdiBuZ01vZGVsR3JvdXA9XCJwZXJzb25cIj5cbiAgICAgICAgPGlucHV0IFsobmdNb2RlbCldPVwicGVyc29uLm5hbWVcIiBuYW1lPVwiZmlyc3ROYW1lXCI+XG4gICAgICA8L2Rpdj5cbiAgPC9mb3JtPmA7XG5cbmV4cG9ydCBjb25zdCBuZ01vZGVsV2l0aEZvcm1Hcm91cEV4YW1wbGUgPSBgXG4gIDxkaXYgW2Zvcm1Hcm91cF09XCJteUdyb3VwXCI+XG4gICAgICA8aW5wdXQgZm9ybUNvbnRyb2xOYW1lPVwiZmlyc3ROYW1lXCI+XG4gICAgICA8aW5wdXQgWyhuZ01vZGVsKV09XCJzaG93TW9yZUNvbnRyb2xzXCIgW25nTW9kZWxPcHRpb25zXT1cIntzdGFuZGFsb25lOiB0cnVlfVwiPlxuICA8L2Rpdj5cbmA7XG4iXX0=