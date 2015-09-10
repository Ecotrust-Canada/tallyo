'use strict';

angular.module('scanthisApp.harsam_admin', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/harsam_admin', {
    templateUrl: 'harsam_admin/harsam_admin.html',
    controller: 'harsamAdminCtrl'
  });
}])

.controller('harsamAdminCtrl', function($scope, $http, $injector) {
  $injector.invoke(BaseCtrl, this, {$scope: $scope});

  $scope.stage_id = 4;
  $scope.ListSuppliers();

  $scope.SelectSupplier = function(supplier_id){
    var date = new Date();

    $scope.queryparams = {'stage_id': $scope.stage_id, 'supplier_id': supplier_id, 'date': date};
    var queryString = LotQuery($scope.queryparams);

    $scope.lot_entry = {'stage_id': $scope.stage_id, 'supplier_id': supplier_id, 'lot_number': '', 'start_date': '', 'end_date': '', 'is_current': false, 'in_production': false};

    var lot_number = $scope.CreateLot(queryString);
    console.log(lot_number);
  };//End of SelectSupplier


  $scope.setSelected = function(id) {
    $scope.selected_id = id;
  };
});
