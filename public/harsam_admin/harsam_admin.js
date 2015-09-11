'use strict';


angular.module('scanthisApp.harsam_admin', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/harsam_admin', {
    templateUrl: 'harsam_admin/harsam_admin.html',
  });
}])

.controller('harsamAdminCtrl1', function($scope, $http, $injector) {
  $injector.invoke(BaseCtrl, this, {$scope: $scope});

  $scope.stage_id = 4;
  $scope.ListSuppliers();

  $scope.SelectSupplier = function(supplier_id){
    var date = new Date();
    $scope.queryparams = {'stage_id': $scope.stage_id, 'supplier_id': supplier_id, 'date': date};
    var queryString = LotQuery($scope.queryparams);
    $scope.lot_entry = {'stage_id': $scope.stage_id, 'supplier_id': supplier_id, 'lot_number': '', 'start_date': '', 'end_date': '', 'is_current': false, 'in_production': false};
    $scope.CreateLot(queryString, $scope.SetLotAsCurrent);
  };//End of SelectSupplier

})


.controller('harsamAdminCtrl2', function($scope, $http, $injector) {
  $injector.invoke(BaseCtrl, this, {$scope: $scope});

  $scope.stage_id = 1;
  $scope.previous_stage_id = 4;
  $scope.ListLots($scope.previous_stage_id);
  $scope.product_id = 1;

  $scope.SelectLot = function(lot_number){
    var date = new Date();
    $scope.queryparams = {'stage_id': $scope.stage_id, 'date': date, 'previous_lot_number': lot_number, 'product_id': $scope.product_id};
    var queryString = LotQuery($scope.queryparams);
    $scope.lot_entry = {'stage_id': $scope.stage_id, 'previous_lot_number': lot_number, 'product_id': $scope.product_id, 'lot_number': '', 'start_date': '', 'end_date': '', 'is_current': false, 'in_production': false};
    $scope.CreateLot(queryString, $scope.SetLotAsCurrent);
  };//End of SelectSupplier

});
