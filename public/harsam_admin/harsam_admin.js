'use strict';


angular.module('scanthisApp.harsam_admin', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/harsam_admin', {
    templateUrl: 'harsam_admin/harsam_admin.html',
  });
}])

.controller('harsamAdminCtrl1', function($scope, $http, $injector) {
  $injector.invoke(BaseCtrl, this, {$scope: $scope});

  $scope.stage_id = 2;
  $scope.ListSuppliers();

  $scope.AdminGetCurrentLotNumber();

  $http.get('../json/supplierform.json').success(function(data) {
    $scope.formarray = data;
  });

  $http.get('../json/supplierentry.json').success(function(data) {
    $scope.entryform = data;
  });


  $scope.ClearForm = function(){
    $scope.formarray.fields[4].value = '';
    $scope.formarray.fields[5].value = '';
    $scope.formarray.fields[6].value = '';
    $scope.formarray.fields[8].value = '';

    for (var key in $scope.entryform){
        $scope.entryform[key] = '';
      }
  };

  $scope.update = function(){
    var array = $scope.formarray.fields;
    for (var i=0;i<array.length;i++){
      var current = array[i];
      $scope.entryform[current.fieldname] = current.value;
    }
    $http.post('http://10.10.50.30:3000/supplier', $scope.entryform).then(function(response){
      $scope.ListSuppliers();
      $scope.ClearForm();
    }, function(response){
      alert(response.status);
    });
  };

  $scope.SelectSupplier = function(supplier_id){
    var date = new Date();
    $scope.queryparams = {'stage_id': $scope.stage_id, 'supplier_id': supplier_id, 'date': date};
    var queryString = LotQuery($scope.queryparams);
    $scope.lot_entry = {'stage_id': $scope.stage_id, 'supplier_id': supplier_id, 'lot_number': '', 'start_date': '', 'end_date': '', 'is_current': false, 'in_production': true};
    $scope.CreateLot(queryString, $scope.SetLotAsCurrent);
    $scope.AdminGetCurrentLotNumber();
  };//End of SelectSupplier

})

.controller('harsamAdminCtrl2', function($scope, $http, $injector) {
  $injector.invoke(BaseCtrl, this, {$scope: $scope});

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


})


.controller('harsamAdminCtrl3', function($scope, $http, $injector) {
  $injector.invoke(BaseCtrl, this, {$scope: $scope});

  $scope.boxentry = {'ft_box_num':'', 'weight':'', 'size':'', 'grade':'', 'lot_number':''};

  $scope.makebox = function(form, labels){
    console.log("function called");
    for (var key in form){
      $scope.boxentry[key] = form[key]; 
    }

    for (var i=1;i<=labels;i++){
      $http.post('http://10.10.50.30:3000/box', $scope.boxentry);
    }

  };


});


