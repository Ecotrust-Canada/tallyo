'use strict';


angular.module('scanthisApp.createlotController', [])

.controller('CreateLotCtrl', function($scope, $http, $injector, DatabaseServices) {
  $scope.stage_id = 2;

  $scope.SupplierFromLotNumber = function(lot_number){
    var func = function(response){
      $scope.supplier_lot = response.data[0];
    };
    var query = '?lot_number=eq.' + lot_number;
    DatabaseServices.GetEntry('supplier_lot', func, query);
  };

  $scope.MakeLotEntry = function(date, lot_number){
    $scope.lot_entry.lot_number = lot_number;        
    CreateEntryPeriod(date, 'week', $scope);
  };

  
  /*create entry in database*/
  $scope.DatabaseLot = function(lot_number){
    var func = function(){
      $scope.currentlot = lot_number;
      $scope.SupplierFromLotNumber($scope.currentlot);
    };
    DatabaseServices.DatabaseEntry('lot', $scope.lot_entry, func);
  };

  /*checks if there is an existing lot matching query, if not creates new one*/
  $scope.CreateLot = function(queryString, date){
    $http.get('http://10.10.50.30:3000/lot' + queryString).then(function(response) {
      if (response.data.length > 0){
        $scope.currentlot = response.data[0].lot_number;
        $scope.SupplierFromLotNumber($scope.currentlot);
      }//end if
      else{
        var lot_number = createLotNum($scope.stage_id, date);
        $scope.MakeLotEntry(date, lot_number);
        $scope.DatabaseLot(lot_number);     
      }
    }, function(response){
      alert(response.status);
    });//end get lot
  };

  $scope.LotFromSupplier = function(){
    $http.get('http://10.10.50.30:3000/stage?id=eq.' + $scope.stage_id).then(function(response){
      var supplier_id = response.data[0].current_supplier_id;
      var date = new Date();
      var queryString = LotQuery({'supplier_id': supplier_id, 'date': date});
      $scope.lot_entry = {'stage_id': $scope.stage_id, 'supplier_id': supplier_id, 'lot_number': '', 'start_date': '', 'end_date': ''};
      $scope.CreateLot(queryString, date);
    }, function(response){
      alert(response.statusText);
    });
  };

  $scope.LotFromSupplier();

});
