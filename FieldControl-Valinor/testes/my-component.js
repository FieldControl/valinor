angular.module('app').component('myComponent', {
    template: '<div>{{ $ctrl.text }}</div>',
    controller: function() {
      this.text = 'Hello, World!';
    }
  });