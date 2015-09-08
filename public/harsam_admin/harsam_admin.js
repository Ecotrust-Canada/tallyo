'use strict';

angular.module('scanthisApp.harsam_admin', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/harsam_admin', {
    templateUrl: 'harsam_admin/harsam_admin.html'
  });
}])

.filter('processToString', function() {
  return function(input) {
    console.log(input);
    if (String(input) === 'true'){
      return 'In Processing';
    }
    else if (String(input) === 'false'){
      return  'Process Today';
    }
    else {
      return 'wrong equals';
    }
    //return input;
  };
})

.controller('harsamSupplierEditCtrl', function($scope, $http, $injector) {
  $injector.invoke(SupplierEditCtrl, this, {$scope: $scope});
})

.controller('harsamInProductionCtrl', function($scope, $http, $injector) {
  $injector.invoke(InProductionCtrl, this, {$scope: $scope});
});
