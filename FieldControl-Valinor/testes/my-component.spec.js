
describe('MyComponent', function() {
    var $compile, $rootScope, element;
  
    beforeEach(module('app'));
  
    beforeEach(inject(function(_$compile_, _$rootScope_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      element = $compile('<my-component></my-component>')($rootScope);
      $rootScope.$digest();
    }));
  
    it('should render the text correctly', function() {
      expect(element.text()).toContain('Hello, World!');
    });
  });