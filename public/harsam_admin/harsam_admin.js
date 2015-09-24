'use strict';


angular.module('scanthisApp.harsam_admin', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/harsam_admin', {
    templateUrl: 'harsam_admin/harsam_admin.html',
  });
}])

.controller('harsamAdminCtrl1', function($scope, $http, $injector) {
  $injector.invoke(EntryCtrl, this, {$scope: $scope});

  $scope.stage_id = 2;
  $scope.ListSuppliers();

  $scope.GetCurrentSupplier = function(){
    $http.get('http://10.10.50.30:3000/stage?id=eq.' + $scope.stage_id).then(function(response){
      var supplier_id = response.data[0].current_supplier_id;
      var query = '?id=eq.' + supplier_id;
      $scope.GetEntries('supplier', 'current_supplier', query);
    }, function(response){
    });
    
  };

  $scope.GetCurrentSupplier();

  $http.get('../json/supplierform.json').success(function(data) {
    $scope.formarray = data.fields;
    $scope.form = {};
    $scope.resetform();
  });

  $http.get('../json/supplierentry.json').success(function(data) {
    $scope.entry = data;
  });

  $scope.resetform = function(){
    for (var i=0;i<$scope.formarray.length;i++){
      $scope.form[$scope.formarray[i].fieldname] = $scope.formarray[i].value;
    }
  };



  $scope.ClearForm = function(){
    $scope.resetform();
    for (var key in $scope.entryform){
        $scope.entry[key] = '';
      }
  };

  $scope.update = function(form){
    for (var key in form){
        $scope.entry[key] = form[key];
    }
    $http.post('http://10.10.50.30:3000/supplier', $scope.entryform).then(function(response){
      $scope.ListSuppliers();
      $scope.ClearForm();
    }, function(response){
      alert(response.status);
    });
  };

  

  $scope.SelectSupplier = function(supplier_id){
    $http.patch('http://10.10.50.30:3000/stage?id=eq.' + $scope.stage_id, {"current_supplier_id": supplier_id}).then(function(response){
      $scope.GetCurrentSupplier();
    }, function(response){
    });
  };

})

.controller('harsamAdminCtrl2', function($scope, $http, $injector) {
  $injector.invoke(EntryCtrl, this, {$scope: $scope});

  $scope.stage_id = 3;
  $scope.previous_stage_id = 2;


  $scope.ListLots($scope.previous_stage_id);
 

  $scope.SwitchStage = function(lot_number){
    var patch = {'stage_id': $scope.stage_id };
    $http.patch('http://10.10.50.30:3000/lot?lot_number=eq.' + lot_number, patch).then(function(response){
      $scope.ListLots($scope.previous_stage_id);
    }, function(response){
      alert(response.status);
    });
  };


});







