'use strict';

angular.module('scanthisApp.harsam_boxing', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/harsam_boxing', {
    templateUrl: 'harsam_boxing/harsam_boxing.html',
  });
}])

.controller('harsamBoxingCtrl', function($scope, $http, $injector) {
  $injector.invoke(EntryCtrl, this, {$scope: $scope});

  $scope.box_entry = {'ft_box_num':'','size':'', 'grade':'', 'lot_number':''};
  $scope.includeditems = [];

  $scope.CalcBox = function(){
    var box_weight = CalculateBoxWeight($scope.includeditems);
    var lot_num = GetBoxLotNumber($scope.includeditems);
    $scope.PatchBoxWithWeightLot(box_weight, lot_num);
  };

});//end controller
