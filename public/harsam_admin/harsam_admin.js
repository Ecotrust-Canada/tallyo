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

  $scope.ListSuppliers();
  $scope.SelectSupplier = function(clickEvent){
    var date = new Date();
    var supplier_id = 8; //TODO: this is selected
    var stage_id = 4;

    $scope.queryparams = {'stage_id': stage_id, 'supplier_id': supplier_id, 'date': date};
    var queryString = LotQuery($scope.queryparams);

    $scope.lot_entry = {'stage_id': stage_id, 'supplier_id': supplier_id, 'lot_number': '', 'start_date': '', 'end_date': '', 'is_current': false, 'in_production': false};

    $scope.CreateLot(queryString);

  };
});
